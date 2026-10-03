# GGUF Export

Full reference for exporting Unsloth models to GGUF: the native save/push API, every supported
quantization method, multi-quant export, the manual llama.cpp route, the Ollama Modelfile flow,
and troubleshooting.

Sources: `unsloth.ai/docs/basics/inference-and-deployment/saving-to-gguf`, official notebooks
`Llama3.1_(8B)-Alpaca.ipynb` and `Llama3_(8B)-Ollama.ipynb`.

## Native API

```python
# Local save (directory)
model.save_pretrained_gguf("directory", tokenizer, quantization_method = "q4_k_m")
model.save_pretrained_gguf("directory", tokenizer, quantization_method = "q8_0")
model.save_pretrained_gguf("directory", tokenizer, quantization_method = "f16")

# Push to Hugging Face hub
model.push_to_hub_gguf("hf_username/directory", tokenizer, quantization_method = "q4_k_m")
model.push_to_hub_gguf("hf_username/directory", tokenizer, quantization_method = "q8_0")
```

- The default (no `quantization_method`) is **`q8_0`** — "Fast conversion. High resource use,
  but generally acceptable."
- `push_to_hub_gguf` accepts an HF `token` (from https://huggingface.co/settings/tokens).
- `quantization_method` can be a **list** — one call exports every listed quant, which the
  notebooks note is much faster than separate calls ("This can speed things up by 10 minutes or
  more if you want multiple export formats!"):

```python
model.push_to_hub_gguf(
    "HF_USERNAME/llama_finetune", # Change hf to your username!
    tokenizer,
    quantization_method = ["q4_k_m", "q8_0", "q5_k_m",],
    token = "YOUR_HF_TOKEN",
)
```

## Complete quantization_method list

From the docs (mirroring llama.cpp's `quantize.cpp`):

```python
ALLOWED_QUANTS = \
{
    "not_quantized"  : "Recommended. Fast conversion. Slow inference, big files.",
    "fast_quantized" : "Recommended. Fast conversion. OK inference, OK file size.",
    "quantized"      : "Recommended. Slow conversion. Fast inference, small files.",
    "f32"     : "Not recommended. Retains 100% accuracy, but super slow and memory hungry.",
    "f16"     : "Fastest conversion + retains 100% accuracy. Slow and memory hungry.",
    "q8_0"    : "Fast conversion. High resource use, but generally acceptable.",
    "q4_k_m"  : "Recommended. Uses Q6_K for half of the attention.wv and feed_forward.w2 tensors, else Q4_K",
    "q5_k_m"  : "Recommended. Uses Q6_K for half of the attention.wv and feed_forward.w2 tensors, else Q5_K",
    "q2_k"    : "Uses Q4_K for the attention.wv and feed_forward.w2 tensors, Q2_K for the other tensors.",
    "q3_k_l"  : "Uses Q5_K for the attention.wv, attention.wo, and feed_forward.w2 tensors, else Q3_K",
    "q3_k_m"  : "Uses Q4_K for the attention.wv, attention.wo, and feed_forward.w2 tensors, else Q3_K",
    "q3_k_s"  : "Uses Q3_K for all tensors",
    "q4_0"    : "Original quant method, 4-bit.",
    "q4_1"    : "Higher accuracy than q4_0 but not as high as q5_0. However has quicker inference than q5 models.",
    "q4_k_s"  : "Uses Q4_K for all tensors",
    "q4_k"    : "alias for q4_k_m",
    "q5_k"    : "alias for q5_k_m",
    "q5_0"    : "Higher accuracy, higher resource usage and slower inference.",
    "q5_1"    : "Even higher accuracy, resource usage and slower inference.",
    "q5_k_s"  : "Uses Q5_K for all tensors",
    "q6_k"    : "Uses Q8_K for all tensors",
    "iq2_xxs" : "2.06 bpw quantization",
    "iq2_xs"  : "2.31 bpw quantization",
    "iq3_xxs" : "3.06 bpw quantization",
    "q3_k_xs" : "3-bit extra small quantization",
}
```

Guidance from the docs:

- `q4_k_m` / `q5_k_m` are the recommended 4/5-bit picks — they keep Q6_K in the most sensitive
  tensors (`attention.wv`, `feed_forward.w2`).
- `f16` is the lossless option: fastest conversion, 100% accuracy, but slow inference and big
  files. Use it when you want to quantize further yourself with llama.cpp tooling.
- `iq*` (importance-matrix) quants are denser per bit; per the Qwen3.5 benchmark analysis they
  run 5-10% slower in inference.

## Manual route (no native API)

1. Save to 16-bit first:

```python
model.save_pretrained_merged("merged_model", tokenizer, save_method = "merged_16bit",)
```

2. Build llama.cpp and convert:

```bash
apt-get update
apt-get install pciutils build-essential cmake curl libcurl4-openssl-dev -y
git clone https://github.com/ggml-org/llama.cpp
cmake llama.cpp -B llama.cpp/build \
    -DBUILD_SHARED_LIBS=OFF -DGGML_CUDA=ON -DLLAMA_CURL=ON
cmake --build llama.cpp/build --config Release -j --clean-first --target llama-cli llama-mtmd-cli llama-server llama-gguf-split
cp llama.cpp/build/bin/llama-* llama.cpp

python llama.cpp/convert_hf_to_gguf.py FOLDER --outfile OUTPUT --outtype f16
```

Direct to a quant type instead of f16:

```bash
python llama.cpp/convert_hf_to_gguf.py merged_model \
    --outfile model-F16.gguf --outtype f16 \
    --split-max-size 50G

# For BF16:
python llama.cpp/convert_hf_to_gguf.py merged_model \
    --outfile model-BF16.gguf --outtype bf16 \
    --split-max-size 50G

# For Q8_0:
python llama.cpp/convert_hf_to_gguf.py merged_model \
    --outfile model-Q8_0.gguf --outtype q8_0 \
    --split-max-size 50G
```

## Ollama Modelfile flow (from the Ollama notebook)

The native GGUF export pairs with an auto-generated Ollama Modelfile so the exported model keeps
its chat template:

```python
# Install Ollama (Colab needs zstd first)
!command -v zstd >/dev/null 2>&1 || (apt-get -qq update && apt-get -qq install -y zstd) >/dev/null 2>&1
!curl -fsSL https://ollama.com/install.sh | sh

# After model.save_pretrained_gguf(...): print the auto-generated Modelfile
print(tokenizer._ollama_modelfile)
```

```bash
# Create the Ollama model from the Modelfile
ollama create unsloth_model -f ./model/Modelfile

# Inference
curl http://localhost:11434/api/chat -d '{
    "model": "unsloth_model",
    "messages": [
        { "role": "user", "content": "Continue the Fibonacci sequence: 1, 1, 2, 3, 5, 8," }
    ]
}'
```

On Colab, start `ollama serve` non-blocking and poll `http://localhost:11434/api/tags` until it
answers (the notebook waits up to 60s) before creating the model.

## Troubleshooting

**"Works in Unsloth, poor/gibberish elsewhere (Ollama, vLLM, llama.cpp)"** — documented causes:

1. **Incorrect chat template** — the most common cause. Use the SAME template that was used when
   training; force it with the conversational notebooks (Qwen3-14B, Gemma-3-4B, Llama-3.2-3B,
   Phi-4-14B, Mistral-v0.3-7B).
2. **Wrong EOS token** — causes gibberish on longer generations.
3. **Engine adds/drops a start-of-sequence token** — check both hypotheses.

**Saving to GGUF / vLLM 16bit crashes (OOM)** — reduce GPU usage during saving:

```python
model.save_pretrained(..., maximum_memory_usage = 0.5)  # default is 0.75
```

Lower it further if 0.5 still OOMs.

## Notes

- There is **no `imatrix` parameter** on `save_pretrained_gguf` / `push_to_hub_gguf` in the
  documented API. "imatrix" in the docs refers to the calibration-data technique behind quants
  (see `dynamic-gguf.md` and `benchmarks.md`), not a save argument.
- The native exporter clones llama.cpp itself ("We clone llama.cpp and we default save it to
  q8_0") — no manual build needed for the standard path.

# vLLM & SGLang Deployment

Sources: `pages/basics/inference-and-deployment/vllm-guide.md`,
`vllm-guide/vllm-engine-arguments.md`, `vllm-guide/lora-hot-swapping-guide.md`,
`pages/basics/inference-and-deployment/sglang-guide.md` (unsloth.ai/docs, 2026-09-26).

## vLLM

### Install

```bash
pip install --upgrade pip
pip install uv
uv pip install -U vllm --torch-backend=auto            # NVIDIA
uv pip install -U vllm --torch-backend=auto --extra-index-url https://wheels.vllm.ai/nightly   # NVIDIA nightly
```

AMD: nightly Docker image `rocm/vllm-dev:nightly`.

### Serving

```bash
vllm serve unsloth/gpt-oss-120b
```

For an Unsloth fine-tune, save merged to 16-bit first (or LoRA-only for hot swapping):

```python
model.save_pretrained_merged("finetuned_model", tokenizer, save_method = "merged_16bit")
# or upload: model.push_to_hub_merged("hf/model", tokenizer, save_method = "merged_16bit", token = "")

# LoRA adapters only:
model.save_pretrained_merged("finetuned_model", tokenizer, save_method = "lora")
# or: model.save_pretrained("finetuned_lora"); tokenizer.save_pretrained("finetuned_lora")
```

Then `vllm serve finetuned_model` (full path if needed, e.g.
`vllm serve /mnt/disks/daniel/finetuned_model`).

`merged_4bit` exists but is discouraged unless you know the use case (DPO training,
HuggingFace online inference).

### FP8 example

```bash
vllm serve unsloth/Llama-3.3-70B-Instruct \
    --quantization fp8 \
    --kv-cache-dtype fp8 \
    --gpu-memory-utilization 0.97 \
    --max-model-len 65536
```

### Engine arguments (documented)

| Argument | Example / use-case |
|---|---|
| `--gpu-memory-utilization` | Default 0.9 — VRAM vLLM may use. Reduce if OOM; try 0.95/0.97 if you have headroom |
| `--max-model-len` | Max sequence length. **Reduce if OOM** (e.g. `32768`) |
| `--quantization` | `fp8` for dynamic float8 quantization (pair with `--kv-cache-dtype fp8`) |
| `--kv-cache-dtype` | `fp8` halves KV-cache memory |
| `--port` | Default 8000 |
| `--api-key` | Optional access key |
| `--tensor-parallel-size` | Default 1; set to GPU count (needs NCCL or it's slow) |
| `--pipeline-parallel-size` | Default 1; split across layers/nodes (TP within node, PP across nodes) |
| `--enable-lora` | Enable LoRA serving |
| `--max-loras` | LoRAs served at once (queue → hot-swappable) |
| `--max-lora-rank` | Max rank across LoRAs: 8, 16, 32, 64, 128, 256, 320, 512 |
| `--dtype` | `auto`, `bfloat16`, `float16` (FP8/other quants use `--quantization`) |
| `--tokenizer` | Tokenizer path if the served model differs |
| `--hf-token` | HuggingFace token for gated models |
| `--swap-space` | Default 4GB CPU offloading |
| `--seed` | Default 0 |
| `--disable-log-stats` | Disable throughput/request logging |
| `--enforce-eager` | Disable compilation — faster load, slower inference |
| `--disable-cascade-attn` | For RL runs on vLLM < 0.11.0 (Cascade Attention bug on A100s; Unsloth fixes) |

### LoRA hot swapping

Enable at most N hot-swapped LoRAs — the env flag is required:

```bash
export VLLM_ALLOW_RUNTIME_LORA_UPDATING=True
vllm serve unsloth/Llama-3.1-8B-Instruct \
    --quantization fp8 \
    --kv-cache-dtype fp8 \
    --gpu-memory-utilization 0.8 \
    --max-model-len 65536 \
    --enable-lora \
    --max-loras 4 \
    --max-lora-rank 64
```

Load / unload adapters at runtime:

```bash
curl -X POST http://localhost:8000/v1/load_lora_adapter \
    -H "Content-Type: application/json" \
    -d '{"lora_name": "LORA_NAME", "lora_path": "/path/to/LORA"}'

curl -X POST http://localhost:8000/v1/unload_lora_adapter \
    -H "Content-Type: application/json" \
    -d '{"lora_name": "LORA_NAME"}'
```

After an Unsloth fine-tune: `model.save_pretrained("finetuned_lora")` +
`tokenizer.save_pretrained("finetuned_lora")`, then `load_lora_adapter` with
`"lora_path": "finetuned_lora"`.

## SGLang

Serve any LLM / fine-tuned model for low-latency, high-throughput inference; supports
text, image/video, and some GGUFs.

### Install (NVIDIA, virtualenv)

```bash
python -m venv unsloth_env && source unsloth_env/bin/activate
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env && sudo apt-get install -y pkg-config libssl-dev
pip install --upgrade pip && pip install uv
uv pip install "sglang" && uv pip install unsloth
```

Docker:

```bash
docker run --gpus all --shm-size 32g -p 30000:30000 \
    -v ~/.cache/huggingface:/root/.cache/huggingface \
    --env "HF_TOKEN=<secret>" --ipc=host \
    lmsysorg/sglang:latest \
    python3 -m sglang.launch_server --model-path unsloth/Llama-3.1-8B-Instruct --host 0.0.0.0 --port 30000
```

Install debugging: an `outlines-core` build error → update Rust and outlines-core per
the install steps; a Flashinfer compile error → `rm -rf ~/.cache/flashinfer` (and the
dir named in the error), or lower `--mem-fraction-static` / `--cuda-graph-max-bs`, or
disable torch compile / CUDA graph.

### Serve & call

```bash
python3 -m sglang.launch_server \
    --model-path unsloth/Llama-3.2-1B-Instruct \
    --host 0.0.0.0 --port 30000
```

```python
from openai import OpenAI
openai_client = OpenAI(base_url="http://0.0.0.0:30000/v1", api_key="sk-no-key-required")
completion = openai_client.chat.completions.create(
    model="unsloth/Llama-3.2-1B-Instruct",
    messages=[{"role": "user", "content": "What is 2+2?"}],
)
print(completion.choices[0].message.content)
```

Unsloth fine-tunes: `save_pretrained_merged(..., save_method="merged_16bit")` (gpt-oss
only: `"mxfp4"`), then `python3 -m sglang.launch_server --model-path finetuned_model
--host 0.0.0.0 --port 30002`. Waiting at `Capturing batches (bs=1 ...)` is normal.

### FP8 online quantization

30–50% more throughput, ~50% less memory, ~2x context:

```bash
python -m sglang.launch_server \
    --model-path unsloth/Llama-3.2-1B-Instruct \
    --host 0.0.0.0 --port 30002 \
    --quantization fp8 \
    --kv-cache-dtype fp8_e4m3     # or fp8_e5m2 for a larger dynamic range
```

Pre-quantized FP8 quants: huggingface.co/unsloth (search `-fp8`), e.g.
`unsloth/Llama-3.2-3B-FP8-Dynamic`, `unsloth/Llama-3.3-70B-Instruct-FP8-Dynamic`.

### Offline mode & GGUFs

```python
import sglang as sgl
engine = sgl.Engine(model_path="unsloth/Qwen3-0.6B", random_seed=42)
outputs = engine.generate("Today is a sunny day and I like",
                          {"temperature": 0, "max_new_tokens": 256})["text"]
print(outputs)
engine.shutdown()
```

GGUF support (Qwen3 MoE under construction; dense Llama 3 / Qwen 3 / Mistral work):
install the gguf python package first —
`pip install -e "git+https://github.com/ggml-org/llama.cpp.git#egg=gguf&subdirectory=gguf-py"` —
then point `sgl.Engine(model_path=<.gguf>)` at it (e.g.
`hf_hub_download("unsloth/Qwen3-32B-GGUF", filename="Qwen3-32B-UD-Q4_K_XL.gguf")`).

High-throughput GGUF serving:

```bash
python -m sglang.launch_server \
    --model-path Qwen3-32B-UD-Q4_K_XL.gguf \
    --host 0.0.0.0 --port 30002 \
    --served-model-name unsloth/Qwen3-32B \
    --tokenizer-path unsloth/Qwen3-32B
```

### Benchmarking

```bash
python -m sglang.bench_one_batch_server \
    --model finetuned_model --base-url http://0.0.0.0:30002 \
    --batch-size 8 --input-len 1024 --output-len 1024
```

Reference (B200 x1, gpt-oss-20b): batch 8/1024/1024 → TTFT 0.40s, ITL 3.59s,
output throughput ~2,563 tok/s. Full server arguments: docs.sglang.ai.

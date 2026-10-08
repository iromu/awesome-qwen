# Speculative Decoding (GGUF draft models)

Use a smaller GGUF as a draft model to get ~2x faster inference in llama.cpp / llama-server,
plus MTP-based speculative decoding in vLLM and NEXTN in SGLang.

Sources: `unsloth.ai/docs/basics/inference-and-deployment/saving-to-gguf/speculative-decoding`,
`unsloth.ai/docs/basics/nvfp4`.

## llama.cpp / llama-server

Enable with `--model-draft`. The draft model must be **smaller but use the same tokenizer** —
in practice a smaller model from the same family.

Download main + draft (GLM 4.7 example from the docs):

```python
# !pip install huggingface_hub hf_transfer
import os
os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "0" # Can sometimes rate limit, so set to 0 to disable
from huggingface_hub import snapshot_download
snapshot_download(
    repo_id = "unsloth/GLM-4.7-GGUF",
    local_dir = "unsloth/GLM-4.7-GGUF",
    allow_patterns = ["*UD-Q2_K_XL*"], # Dynamic 2bit Use "*UD-TQ1_0*" for Dynamic 1bit
)
snapshot_download(
    repo_id = "unsloth/GLM-4.5-Air-GGUF",
    local_dir = "unsloth/GLM-4.5-Air-GGUF",
    allow_patterns = ["*UD-Q4_K_XL*"], # Dynamic 4bit. Use "*UD-TQ1_0*" for Dynamic 1bit
)
```

Base run:

```bash
./llama.cpp/llama-cli \
    --model unsloth/GLM-4.7-GGUF/UD-Q2_K_XL/GLM-4.7-UD-Q2_K_XL-00001-of-00003.gguf \
    --threads -1 \
    --fit on \
    --prio 3 \
    --temp 1.0 \
    --top-p 0.95 \
    --ctx-size 16384 \
    --jinja
```

With a draft model (note `--ctx-size-draft` and per-device placement):

```bash
./llama.cpp/llama-cli \
    --model unsloth/GLM-4.7-GGUF/UD-Q2_K_XL/GLM-4.7-UD-Q2_K_XL-00001-of-00003.gguf \
    --model-draft unsloth/GLM-4.5-Air-GGUF/UD-Q4_K_XL/GLM-4.5-Air-UD-Q4_K_XL-00001-of-00002.gguf \
    --threads -1 \
    --fit on \
    --prio 3 \
    --temp 1.0 \
    --top-p 0.95 \
    --ctx-size 16384 \
    --ctx-size-draft 16384 \
    --jinja \
    --device CUDA0 \
    --device-draft CUDA0,CUDA1
```

Server variant:

```bash
./llama.cpp/llama-server \
    --model unsloth/GLM-4.7-GGUF/UD-Q2_K_XL/GLM-4.7-UD-Q2_K_XL-00001-of-00003.gguf \
    --alias "unsloth/GLM-4.7" \
    --threads -1 \
    --fit on \
    --prio 3 \
    --temp 1.0 \
    --top-p 0.95 \
    --ctx-size 16384 \
    --port 8001 \
    --jinja
```

## vLLM — MTP speculative config

For NVFP4 quants, MTP tensors are built into the checkpoint; enable with:

```bash
vllm serve unsloth/Qwen3.6-35B-A3B-NVFP4-Fast \
    --speculative-config '{"method": "mtp", "num_speculative_tokens": 2}'
```

Trade-off from the docs: MTP gives **faster decode but somewhat less throughput**.

## SGLang — NEXTN

```bash
python -m sglang.launch_server --model-path unsloth/Qwen3.6-27B-NVFP4 --speculative-algorithm NEXTN \
     --speculative-num-steps 3 --speculative-eagle-topk 1 --speculative-num-draft-tokens 4
```

## Notes

- Pick a draft quant that fits alongside the main model — in the GLM example the main model is
  2-bit (`UD-Q2_K_XL`) and the draft is 4-bit (`UD-Q4_K_XL`), so total memory stays bounded.
- Same-tokenizer rule is the hard requirement; a draft from a different family will not verify.
- Speculative decoding speeds decode, not prefill — for throughput-bound serving, measure both.

# Unsloth Dynamic NVFP4 (Blackwell)

4-bit quantized models that run W4A4 directly on NVIDIA Blackwell FP4 tensor cores — up to
**2.5x faster** than W4A16 NVFP4 quants, with accuracy on par with FP8.

Source: `unsloth.ai/docs/basics/nvfp4`.

## Requirements

- **Blackwell GPUs only**: RTX 50X (5050-5090), B200, B300, DGX Spark. For older GPUs, use the
  GGUFs instead.
- Serving engines: vLLM or SGLang.
- Models: Qwen3.6-27B / 35B-A3B, Qwen3.8-27B, all Gemma 4 variants (E2B, E4B, 12B Unified,
  26B-A4B, 31B). Collection: https://huggingface.co/collections/unsloth/nvfp4

## How it works

Dynamic NVFP4 selects **important layers to stay in FP8 (W8A8) or BF16** and quantizes the rest
to W4A4 — instead of forcing every layer to FP4. That mix is what keeps accuracy near FP8 while
the W4A4 path uses Blackwell's FP4 tensor cores. All quants also ship **FP8 KV cache
calibration** for **2x longer context lengths**, and **MTP tensors are built into the quants**
for extra decode speed.

Why FP4 is fast: matrix-multiply hardware scales with the square of the mantissa — FP32 (23
mantissa bits) vs float4 (1 mantissa bit) means ~179x more FP4 FLOPs than FP32 in the same space.

## NVFP4 vs MXFP4

MXFP4 is less accurate for two reasons:

1. Block size **16** (NVFP4) vs **32** (MXFP4) — smaller blocks isolate outliers better and
   give scaling factors to smaller weight subsets.
2. An **E4M3 (FP8) per-block scale** instead of E8M0 (powers of 2) — better for LLMs.

(For GGUF-side comparisons of MXFP4 vs Q4_K, see `benchmarks.md`.)

## Benchmarks (from the docs)

VRAM requirements:

| Model | Required VRAM | Speed |
|-------|--------------:|-------|
| Gemma 4 E2B | 7 GB | 1.12x faster than BF16 |
| Gemma 4 E4B | 9 GB | 1.22x |
| Gemma 4 12B Unified | 11 GB | 1.26x |
| Gemma 4 26B A4B | 26 GB | 1.41x |
| Gemma 4 31B | 32 GB | 1.45x |
| Qwen3.6-27B | 24 GB | 2.5x faster than other NVFP4 quants |
| Qwen3.6-35B-A3B | 32 GB | 1.56x (1.79x for the -Fast full-W4A4 variant) |

Accuracy (Qwen3.6-27B, 1x B200):

| Provider | MMLU-Pro | GPQA | AIME 2025 |
| -------- | -------: | ---: | --------: |
| Unsloth  |   86.25  | 86.34 | 93.12     |
| NVIDIA   |   85.96  | 86.87 | 93.12     |
| FP8      |   86.11  | 86.87 | 93.75     |
| BF16     |   85.96  | 88.13 | 93.33     |

Output lengths across providers are comparable — the speedups are not bought with longer
thinking.

## vLLM serving

Install in a separate venv (documented pins):

```bash
uv venv unsloth-nvfp4-env --python 3.13
source unsloth-nvfp4-env/bin/activate
uv pip install "vllm>=0.25.0" "flashinfer-python>=0.6.13" "nvidia-cutlass-dsl>=4.5.2" \
    --torch-backend=auto
```

Serve:

```bash
vllm serve unsloth/Qwen3.6-35B-A3B-NVFP4-Fast
```

Enable MTP / speculative decoding (faster decode, somewhat less throughput):

```bash
vllm serve unsloth/Qwen3.6-35B-A3B-NVFP4-Fast \
    --speculative-config '{"method": "mtp", "num_speculative_tokens": 2}'
```

**Do not select a MoE backend — let vLLM auto-select.** Marlin does not support W4A4 well and
causes ~2.5x degradation; CUTLASS, Flashinfer-TRTLLM, and Cute-DSL (auto) are the fast paths.

| Model           | scheme | backend             | decode tok/s | throughput tok/s |
| --------------- | ------ | ------------------- | -----------: | ---------------: |
| nvidia 27B      | W4A16  | marlin (auto)       |       115.6  |          2,403   |
| unsloth 27B     | W4A4   | marlin              |       105.6  |          2,127   |
| unsloth 27B     | W4A4   | cutlass             |       113.5  |          6,681   |
| unsloth 27B     | W4A4   | flashinfer_trtllm   |       112.6  |          6,158   |
| unsloth 27B     | W4A4   | **cute-DSL (auto)** |       125.9  |          6,863   |

Torchcodec issues → `sudo apt-get install -y ffmpeg`, then relaunch vLLM.

### DGX Spark

Verify the b12x kernels exist (otherwise you get 2x slower inference):

```bash
python -c "
import torch; from vllm.utils.flashinfer import has_flashinfer_b12x_gemm as g, has_flashinfer_b12x_moe as m
cap = torch.cuda.get_device_capability(); print('cap', cap, '| b12x gemm', g(), '| b12x moe', m()); assert cap[0] == 12 and g() and m(), 'b12x unavailable: serving would degrade to marlin W4A16'"
```

Serve with the b12x MoE backend:

```bash
export CUTE_DSL_ARCH=sm_121a
vllm serve unsloth/Qwen3.6-35B-A3B-NVFP4-Fast --moe-backend flashinfer_b12x
```

## SGLang serving

```bash
# Qwen3.6
python -m sglang.launch_server --model-path unsloth/Qwen3.6-27B-NVFP4 --speculative-algorithm NEXTN \
     --speculative-num-steps 3 --speculative-eagle-topk 1 --speculative-num-draft-tokens 4

# Gemma 4
python -m sglang.launch_server --model-path unsloth/Gemma-4-31B-NVFP4 --speculative-algorithm NEXTN \
     --speculative-num-steps 3 --speculative-eagle-topk 1 --speculative-num-draft-tokens 4
```

# VRAM, Hardware, FP8 RL & Long-Context RL

Hardware planning for RL with Unsloth: the VRAM rule of thumb, the memory
efficient RL features (Standby, weight sharing), FP8 RL, and long-context GRPO.

## VRAM rule of thumb

- **QLoRA 4-bit:** model parameters (billions) ≈ GB of VRAM you need. (You can
  use less, but this is the safe rule.) More context length = more VRAM.
- **LoRA 16-bit:** at minimum **4x more VRAM** than QLoRA.
- With 15GB VRAM, Unsloth transforms models up to ~17B (Llama 3.1 8B, Phi-4 14B,
  Mistral 7B, Qwen2.5 7B) into reasoning models; 5GB VRAM suffices for models
  ≤1.5B parameters.
- gpt-oss-20b GRPO fits on 15GB VRAM with 4-bit loading + LoRA
  (`offload_embedding=True` shaves another ~1GB); gpt-oss-120b fits a 120GB GPU.

## Why RL uses so much memory (and how Unsloth fixes it)

RL runs two engines on the same GPU:

1. **Inference engine** (vLLM): model weights + KV cache.
2. **Training engine**: model weights + activations + gradients + optimizer
   states.

Naive setups split an 80GB GPU 50/50 (16GB weights on each side, 24GB KV cache,
24GB training state).

### Weight sharing

Unsloth shares vLLM's weight memory directly with the training engine — one
copy of the weights, freeing ~16GB (for an 8B) that becomes KV cache or
training state, and removing weight-shuffle latency between modes.

### Unsloth Standby

RL alternates inference → training → inference..., so the two memory pools can
be *reused*. Standby (built on vLLM's sleep mode) frees the KV cache during
training while keeping the shared weights, giving one big multi-purpose pool.
Enable it before any Unsloth import:

```python
import os
os.environ["UNSLOTH_VLLM_STANDBY"] = "1"

from unsloth import FastLanguageModel
import torch
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Qwen3-8B-Base",
    max_seq_length = 2048,
    load_in_4bit = False,
    fast_inference = True,
    max_lora_rank = 32,
    gpu_memory_utilization = 0.95,
)
```

With Standby you no longer tune `gpu_memory_utilization` — set it to 0.90/0.95
(100% won't work; some space is needed for small tensors) and Unsloth handles
the rest. Measured effects: 1.2–1.7x longer context with no slowdown (Qwen3-32B
LoRA 16-bit: 3,600 → 6,144 context on 1xH100 80GB; note GRPO counts 2
generations per prompt, so effective length doubles), ~10% faster runs, and on
a T4 with Qwen3-4B, 32K-length sequences fit that previously OOM'd at 2K.

### Unsloth vs standard GRPO memory (Llama 3.1 8B, 20K context, 8 generations)

| Metrics | Unsloth | Standard + FA2 |
|---|---|---|
| Training Memory Cost (GB) | 42 | 414 |
| GRPO Memory Cost (GB) | 9.8 | 78.3 |
| Inference Cost (GB) | 0 (shared) | 16 |
| Inference KV Cache 20K (GB) | 2.5 | 2.5 |
| **Total** | **54.3GB (90% less)** | **510.8GB** |

Standard GRPO must materialize 2 logits of size (8, 20K) × vocab (128256) →
78.3GB; Unsloth's memory-efficient linear kernels cut that ~8x, plus smart
gradient checkpointing (-52GB) and shared vLLM memory (-16GB).

## FP8 RL

FP8-precision GRPO on **consumer GPUs** (RTX 40/50): Qwen3-1.7B FP8 GRPO runs on
5GB VRAM. Benefits: ~1.4x faster RL inference via vLLM, 2x longer context vs
BF16/FP16, 60% less VRAM, 10x longer context than other FP8 RL implementations.
In Unsloth, training takes <4% of an RL run — 96% is vLLM inference.

Enable with `load_in_fp8 = True`:

```python
import os
os.environ['UNSLOTH_VLLM_STANDBY'] = "1" # Unsloth standby saves 30%+ memory for RL
from unsloth import FastLanguageModel
import torch
max_seq_length = 2048
lora_rank = 32

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Qwen3-8B",
    max_seq_length = max_seq_length,
    load_in_4bit = False, # False for LoRA 16bit
    fast_inference = True,
    max_lora_rank = lora_rank,
    load_in_fp8 = True, # Float8 RL / GRPO!
)
```

Notes:
- `load_in_fp8` can also be `"block"` (block FP8) or `True` (row FP8); if no
  pre-quantized checkpoint is found, Unsloth quantizes on the fly.
- Hardware: NVIDIA GPUs released after the RTX 4090 (RTX 40/50, L4, H100/H200,
  B200). **Free Colab T4 GPUs do NOT support FP8** — the notebooks use 24GB L4.
- Fresh venv install for FP8:

```bash
python -m venv unsloth_env
source unsloth_env/bin/activate

pip install unsloth vllm
pip install --pre torchao --index-url https://download.pytorch.org/whl/nightly/cu128 --force-reinstall
pip install --pre fbgemm-gpu fbgemm-gpu-genai --index-url https://download.pytorch.org/whl/cu128 --force-reinstall
pip install --upgrade numba numpy
```

- FP8 training largely matches BF16 accuracy (SFT loss curves track each
  other; GRPO reward plots follow the same trend). If you serve in FP8,
  training in the same precision helps preserve accuracy. FP8 Block-Wise and
  Per-Channel (Dynamic) are the best-accuracy choices; Unsloth has uploaded FP8
  checkpoints for Qwen3, Qwen3-VL, Llama 3.1/3.2/3.3 etc.
- Under the hood (TorchAO collab): frozen LoRA weights stored in FP8 (shared
  buffers with vLLM), dynamic FP8 quantization of activations in the forward
  pass, LoRA adapters kept in BF16, dequantized to BF16 for the backward pass.
  Works across GSPO, Dr. GRPO, PPO and DPO.
- Notebooks: `Qwen3_8B_FP8_GRPO` (L4) and `Llama_FP8_GRPO` (Llama-3.2-1B).

## Long-context RL (380K / 500K)

Unsloth enables ~7x longer context RL (sometimes 12x+) with no accuracy or speed
degradation vs FA3 + chunked-loss setups:

- gpt-oss QLoRA with **380K context on a single 192GB B200** (and 500K-context
  fine-tuning builds exist).
- Qwen3-8B GRPO: **110K context on an 80GB H100** (QLoRA + vLLM); 65K for
  gpt-oss with BF16 LoRA.
- 24GB VRAM: gpt-oss reaches 20K context; Qwen3-VL-8B QLoRA reaches 32K.

How:
- **Flattened sequence chunking** — logits are never materialized for the full
  `(batch × context)` space; batch and sequence dimensions are chunked
  (multiplier default `max(4, context_length // 4096)`). Logit memory drops from
  `batch × ctx × vocab / 1024^3` GB to `ctx / multiplier × vocab / 1024^3` GB.
- **Hidden states chunking** — optional batch-dimension chunking for the
  hidden-states tensor during log-prob computation.
- **Offloaded log-softmax activations** — prevents silent memory growth over
  long runs (only effective when chunking across the batch dimension).
- All chunked logits are upcast to float32 for accuracy; torch.compile handles
  the kernels.

Tune (or let Unsloth auto-tune from available VRAM):

```python
training_args = GRPOConfig(
    ...
    unsloth_grpo_mini_batch = 3,
    unsloth_logit_chunk_multiplier = 2,
    ...
)
```

Reference point: `unsloth_grpo_mini_batch = 1` +
`unsloth_logit_chunk_multiplier = 4` (gpt-oss, ctx 8192, batch 4, GA 2) cut ~5GB
VRAM with little-to-no speed loss. Update to get these:
`pip install --upgrade --no-cache-dir unsloth unsloth_zoo`.

## Hardware cheat sheet

| Setup | What fits |
|---|---|
| 5GB (e.g. small local) | Qwen3-1.7B FP8 GRPO; any model ≤1.5B |
| 15GB T4 (free Colab) | gpt-oss-20b 4-bit GRPO (slow, ~5min/gen); Llama 3.1 8B QLoRA GRPO; Qwen3-VL-8B GSPO; no FP8 |
| 16GB+ | QLoRA models up to ~16B params |
| 24GB L4 (Colab Pro) | Qwen3-8B FP8 GRPO; Qwen3-14B FP8; Qwen3-VL-8B 32K context |
| 40GB A100 | Qwen2.5-14B GRPO; 8B models with long context |
| 80GB H100 | Qwen3-8B 110K context; Qwen3-32B LoRA 16-bit 6K context (12K with 2 gens) |
| 120GB+ | gpt-oss-120b |
| 192GB B200 | gpt-oss 380K-context QLoRA |

General tips: H100-class for optimal VRAM utilization; align `batch_size` /
`gradient_accumulation_steps` with your hardware; use the latest vLLM (pre-0.11.0
had an A100 cascade-attention bug that broke RL stability — Unsloth disables it
automatically on old versions).

---

Source: unsloth.ai/docs/get-started/reinforcement-learning-rl-guide.md (VRAM rules, memory table — fetched 2026-09-26)
Source: unsloth.ai/docs/get-started/reinforcement-learning-rl-guide/memory-efficient-rl.md (fetched 2026-09-26)
Source: unsloth.ai/docs/get-started/reinforcement-learning-rl-guide/fp8-reinforcement-learning.md (fetched 2026-09-26)
Source: unsloth.ai/docs/get-started/reinforcement-learning-rl-guide/grpo-long-context.md (fetched 2026-09-26)
Source: https://github.com/unslothai/notebooks/blob/main/nb/Qwen3_8B_FP8_GRPO

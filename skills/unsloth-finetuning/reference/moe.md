# Fine-tuning MoE Models (up to ~12x faster)

Unsloth trains Mixture-of-Experts (MoE) LLMs **~12x faster** with **>35% less
VRAM** and **~6x longer context**, with no accuracy loss, via new MoE Triton
kernels + mathematical optimizations.

- gpt-oss-20b fine-tunes in **12.8 GB VRAM**. Qwen3-30B-A3B (16-bit LoRA) uses 63GB.
- Kernels work on data-center (B200, H100), consumer and older GPUs (e.g. RTX
  3090), and FFT, LoRA and QLoRA.
- **4-bit QLoRA for MoE is NOT recommended right now** — BitsandBytes doesn't
  support it. Use **bf16** for LoRA or full fine-tuning.

## What enables it

Standardized MoE training on PyTorch's `torch._grouped_mm` (in collab with
Hugging Face). Transformers v5 is ~6x faster for MoE than v4 (expert weights
are now a single `nn.Parameter` instead of a `ModuleList` of per-expert linears,
which previously forced an expensive per-expert for-loop). Unsloth adds custom
Triton grouped-GEMM + LoRA kernels for an **additional** ~2x speedup, >35% VRAM
reduction and >6x longer context (12-30x overall vs v4).

The key innovation is the **Split LoRA approach** for efficient MoE: instead of
merging the LoRA adapter into the base weight (which materializes
`lora_B @ lora_A.t` for **all** experts — very memory-hungry), Unsloth reorders
the operations using matrix-multiplication associativity so the LoRA delta is
only computed for the `k` active experts per token. Loss, gradients, and outputs
are unchanged — only the order of operations differs. This is **enabled by
default** when training MoE models with Unsloth.

## Backend selection

Unsloth auto-selects a backend by hardware. Toggle with
`os.environ["UNSLOTH_MOE_BACKEND"]`:

| Backend | Notes |
|---------|-------|
| `grouped_mm` (default) | `torch._grouped_mm` — available on T4s through B200s, optimized for H100s+. Requires torch >= 2.9. |
| `unsloth_triton` | Unsloth Triton kernels — turn on automatically for A100s and older PyTorch; ~2.5x faster than `torch._grouped_mm` on A100 (one-time ~2 min autotune). |
| `native_torch` | Native PyTorch — ~12x slower, but the VRAM reductions still apply. |

```python
os.environ["UNSLOTH_MOE_BACKEND"] = "grouped_mm"
os.environ["UNSLOTH_MOE_BACKEND"] = "unsloth_triton"
os.environ["UNSLOTH_MOE_BACKEND"] = "native_torch"
```

Enable via `pip install --upgrade unsloth unsloth_zoo`.

## LoRA on MoE layers (Qwen3-30B-A3B example)

Note the `target_modules` include the MoE projections. The router layer is
**disabled by default** (not a good idea to fine-tune it).

```python
import os
# if you want to choose a different backend (grouped_mm by default), set the below variable:
# os.environ['UNSLOTH_MOE_BACKEND'] = 'unsloth_triton' # or grouped_mm or native_torch
lora_rank = 16
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "Qwen/Qwen3-30B-A3B-Instruct-2507", #MoE model
    max_seq_length = max_seq_length,
    load_in_4bit = False, # MoE nn.Parameter doesn't support bnb 4bit yet
)
model = FastLanguageModel.get_peft_model(
    model,
    r = lora_rank,
    target_modules = [
        "q_proj", "k_proj", "v_proj", "o_proj",
        "gate_up_proj", "down_proj", # LoRA on MoE layers!
    ],
    lora_alpha = lora_rank*2, # *2 speeds up training
    use_gradient_checkpointing = "unsloth", # Reduces memory usage
    random_state = 3407,
)
```

The full Qwen3 MoE notebook (GRPO setup) uses a broader target list:

```python
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name,
    max_seq_length = max_seq_length,
    load_in_4bit = False,
    fast_inference = False, # Not supported for MoE (yet!)
)

model = FastLanguageModel.get_peft_model(
    model,
    r = lora_rank, # Choose any number > 0 ! Suggested 8, 16, 32, 64, 128
    target_modules = [
        "q_proj", "k_proj", "v_proj", "o_proj",
        "gate_proj", "up_proj", "down_proj", "gate_up_proj", #Enable LoRA on MoE layers
    ],
    lora_alpha = lora_rank*2, # *2 speeds up training
    use_gradient_checkpointing = True, # Reduces memory usage
    random_state = 3407,
    bias = "none",
)
```

`grouped_mm` is only supported on torch >= 2.9. Ensure enough VRAM — the
Qwen3-30B model itself takes ~60GB in 16-bit.

## Supported MoE models

- **Qwen3** (Thinking and Instruct): VL, 2507, Coder
- **gpt-oss**: 20B, 120B, safeguard
- **GLM**: 4.5, 4.6, 4.6-Air, 4.7, 4.7-Flash
- **DeepSeek**: V3, R1, V3.1, V3.2

Some MoE models may not be uploaded, but Unsloth should still support them.

## Related: Gemma-3 Flex-Attention

As part of the MoE release, **Gemma-3 now uses Flex-Attention by default** (works
in float16 too). Gemma-3 now uses **O(N)** memory instead of O(N^2) and trains
**>3x faster** (scales better with context length). Previous Unsloth versions
would OOM.

Source: https://unsloth.ai/docs/basics/faster-moe.md and
https://github.com/unslothai/notebooks/blob/main/nb/Qwen3_MoE.ipynb (fetched 2026-09-26).

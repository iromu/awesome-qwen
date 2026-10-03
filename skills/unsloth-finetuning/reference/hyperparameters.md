# LoRA Hyperparameters

Recommended values distilled from Unsloth's LoRA hyperparameters guide (based on
research + experiments). The goal: raise accuracy while counteracting overfitting
(memorizing training data) and underfitting (too generic). Unsloth's notebook defaults
are a good starting point; adjust only as needed.

## LoRA adapter settings (`get_peft_model`)

| Hyperparameter | Function | Recommended |
| --- | --- | --- |
| LoRA rank (`r`) | Number of trainable parameters in the adapter matrices; higher = more capacity + more memory | 8, 16, 32, 64, 128 — choose 16 or 32 |
| LoRA alpha (`lora_alpha`) | Scales the strength of the fine-tuned adjustments relative to `r` | `r` (standard) or `r * 2` (common heuristic) |
| LoRA dropout (`lora_dropout`) | Randomly zeros a fraction of LoRA activations to prevent overfitting. "Not that useful" — Unsloth defaults it to 0 | 0 (default) to 0.1 |
| bias | Whether to train bias terms | `"none"` (faster, less memory; bias adds parameters for little gain) |
| Seed (`random_state`) | Fixed number for reproducibility | any integer, e.g. 42, 3407 |
| Target modules | Which layers get LoRA adapters | all major linears: `q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj` |

### Alpha vs rank relationship

LoRA scales the thin A/B matrices by `alpha / rank`, so **keep `alpha / rank >= 1`**.
Per the rsLoRA paper, scaling alpha by `sqrt(rank)` is theoretically optimal — enable
with `use_rslora = True` (effective scaling becomes `lora_alpha / sqrt(r)` instead of
`lora_alpha / r`); useful for stability at higher ranks. Unsloth's recommendation:
**alpha equal to rank, or at least 2x rank** (alpha/rank = 1 or 2).

### Target modules and QLoRA vs LoRA

- Attention layers: `q_proj, k_proj, v_proj, o_proj`. MLP layers: `gate_proj, up_proj,
  down_proj`.
- Research (including the QLoRA paper) shows targeting BOTH attention and MLP performs
  best (highest RougeL); FFN-only or attention-only trails. Unsloth advises against
  dropping modules — savings are minimal, quality loss is real.
- **QLoRA** = 4-bit base model, >75% less VRAM, slightly slower/marginally less
  accurate. **LoRA** = 16-bit base, slightly faster and more accurate, 4x more VRAM.

### Rank: when to raise it

- Too-large rank can cause overfitting. Unsloth suggests 8–16 for fast fine-tunes, up
  to 128 for complex tasks.
- Underfitting remedy: increase `r` (and alpha) — "rank should be bigger for smaller
  models / more complex datasets; it usually is between 4 and 64".

### Advanced options

- `use_gradient_checkpointing`: `True`, `False`, or `"unsloth"`. Recommend `"unsloth"` —
  extra ~30% VRAM savings and supports extremely long-context fine-tunes.
- `loftq_config`: LoftQ initializes LoRA matrices with the top `r` singular vectors of
  the pretrained weights; can improve accuracy but may cause a significant memory spike
  at start.
- Verifying LoRA weight updates: don't use `np.allclose()` (misses subtle changes in
  LoRA A, which is Gaussian-initialized). Use MD5/checksum comparisons, sum of absolute
  differences, tensor statistics, or `np.array_equal()`.

## Trainer settings (`SFTConfig`)

### Learning rate

- Typical range: `2e-4` to `5e-6`.
- **Normal LoRA/QLoRA: start at `2e-4`** (notebook default). Lower = slower but more
  precise — try `1e-4`, `5e-5`, `2e-5`.
- Reinforcement learning (DPO, GRPO): `5e-6`. Full fine-tuning: lower rates.
- Caveat: very low learning rates can cause overfitting or prevent learning, not just
  underfitting.

### Epochs

- **1–3 epochs recommended.** More than 3 on instruction datasets gives diminishing
  returns and overfitting risk. For full runs use `num_train_epochs = 1` instead of
  `max_steps`.

### Batch size and gradient accumulation

**Effective Batch Size = `per_device_train_batch_size * gradient_accumulation_steps`**

- Larger effective batch = smoother, more stable training; smaller = more variance.
- Guide's stable starting point: `batch_size = 2`, `gradient_accumulation_steps = 8`
  → effective 16 (range 4–16). (Notebooks ship with 2 × 4 = 8 for speed.)
- `batch_size` is the primary driver of VRAM; `gradient_accumulation_steps` is the
  primary driver of training time. To avoid OOM, prefer a smaller `batch_size`
  (1–3) and raise `gradient_accumulation_steps`.
- Unsloth bug fixes make equivalent effective batch sizes fully equivalent
  (b1/g16, b2/g8, b4/g4, ... all produce aligned loss curves).

### Other `SFTConfig` values

- `weight_decay`: 0.01 (recommended) to 0.1 — penalizes large weights. Don't use too
  large numbers. (Notebooks ship with `0.001`.)
- `lr_scheduler_type`: `linear` or `cosine` (notebooks use `linear`).
- `warmup_steps`: 5–10% of total steps (notebooks use `warmup_steps = 5` for a 60-step
  demo).
- `optim`: notebooks use `adamw_8bit`.
- `max_seq_length`: context length; 2048 recommended for testing; Unsloth supports
  longer via internal RoPE scaling (4x longer context fine-tuning).
- `packing = False` in notebooks — enabling packing "can make training 5x faster for
  short sequences".

## Training on completions only (masking inputs)

The QLoRA paper shows that masking out user inputs and training only on completions
(assistant outputs) increases accuracy by ~1%, especially for multi-turn
conversational finetunes. In Unsloth:

```python
from unsloth.chat_templates import train_on_responses_only
trainer = train_on_responses_only(trainer)
```

Unsloth auto-detects the instruction/response parts from the chat template; pass
`instruction_part` / `response_part` explicitly only for custom templates (Llama 3.x
and Gemma 2/3/3n examples in `sft-lora.md`).

## Overfitting vs underfitting

**Overfitting** (loss drops below ~0.2; poor generalization):

- Adjust learning rate (high LR often overfits in short runs; longer training may
  want higher LR — experiment).
- Reduce epochs (stop at 1, 2, or 3).
- Increase `weight_decay` (0.01 or 0.1).
- Increase `lora_dropout` (e.g. 0.1).
- Increase batch size or gradient accumulation.
- Dataset expansion (concatenate with higher-quality open datasets).
- Evaluation early stopping (stop when eval loss rises).
- LoRA alpha scaling: multiply alpha by 0.5 after training — equivalent to
  averaging the base model with the finetune (merge/weight-averaging).

**Underfitting** (too generic; fails to capture patterns):

- Raise or lower learning rate depending on run length (test both).
- More epochs, watching validation loss.
- Increase `r` and alpha (rank bigger for smaller models / complex datasets; usually
  4–64).
- More domain-relevant, high-quality data.
- Decrease batch size to 1 (more vigorous updates).

Fine-tuning has no single "best" approach — experimentation is key.

Source: https://unsloth.ai/docs/get-started/fine-tuning-llms-guide/lora-hyperparameters-guide.md
and https://unsloth.ai/docs/get-started/fine-tuning-llms-guide.md (fetched 2026-09-26);
notebook values from https://github.com/unslothai/notebooks/blob/main/nb/Llama3.1_(8B)-Alpaca.ipynb ,
https://github.com/unslothai/notebooks/blob/main/nb/Qwen3_(4B)-Instruct.ipynb .

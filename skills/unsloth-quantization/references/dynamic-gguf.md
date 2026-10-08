# Unsloth Dynamic GGUFs (2.0 / 3.0)

What the `UD-*` quants are, why they beat standard quants, and the benchmark evidence.

Source: `unsloth.ai/docs/basics/dynamic-3.0-ggufs`, `unsloth.ai/docs/models/qwen3.5/gguf-benchmarks`.

## Concept

Unsloth Dynamic GGUFs are post-training quantized (PTQ) GGUFs where the quant type is chosen
**per layer** instead of one global scheme:

- **Dynamic v2.0** — "dynamically adjust the quantization type of every possible layer, and the
  combinations will differ for each layer and model." Model-specific schemes (Gemma 3's layers
  differ significantly from Llama 4's). Calibration dataset >1.5M tokens of hand-curated,
  cleaned chat data. Works on all models (MoE and non-MoE). Adds Q4_NL, Q5.1, Q5.0, Q4.1, Q4.0
  formats for Apple Silicon / ARM efficiency.
- **Dynamic v3.0** — a much higher-quality imatrix calibration dataset from diverse sources,
  refined for **agentic coding, chat, and multilingual** performance; improved layer selection;
  many more quantization techniques. Still pure PTQ — **no QAT, no QAD, and no training on the
  calibration data** (the imatrix file is published for the community).

Headline results from the docs:

- Qwen3.8-27B v3.0: **>10% top-1 better accuracy at the same size** vs every other provider.
- `UD-Q2_K_XL` (9.83GB) is ~+8% more accurate on top-1 than the next best; previously failing
  agentic tasks (writing a working HTML program) now succeed.
- `UD-IQ1_S` at 6.2GB retains ~72% top-1 accuracy while being 89% smaller.
- Gemma 3 12B Q4_0 QAT replication: QAT model scores 67.07% vs 67.15% BF16 on 5-shot MMLU.

## Why KL divergence, not perplexity

Per "Accuracy is Not All You Need", a quant can *flip* answers between correct/incorrect while
MMLU barely moves. KL divergence is highly correlated with flips, so the goal is **lowest mean
KLD at the smallest disk increase**. The docs are explicit: "Using perplexity is incorrect since
output token values can cancel out, so we must use KLD or harder benchmarks like Aider."

v3.0 adds **Divergence-300 @32**: greedy argmax decoding of 32 tokens over 300 held-out prompts
(Terminal-Bench 2.1, DeepSWE, Harbor, MathArena 2025-26, non-Latin/long-doc) — a better gauge of
actual multi-token inference than single-token top-1, and a built-in overfitting check.

Calibration overfitting caveat: most frameworks benchmark PPL/KLD on Wikipedia, which matches
the calibration set most imatrix quants use — inflating those numbers. Instruct models also
need chat-template-aware calibration; text-only calibration is only effective for base models.

## Naming and variants

- Unsloth uploads use `UD-` prefixed names: `UD-Q4_K_XL`, `UD-Q3_K_XL`, `UD-Q2_K_XL`,
  `UD-IQ2_XL`, `UD-IQ1_S`, `UD-TQ1_0`, etc. — not vanilla llama.cpp names.
- For v3.0 small quants (≤ `UD-Q2_K_XL`, 8.37GB and lower) the **MTP module is removed** to
  save ~500MB; a separate `Q4_0` MTP module can be added if needed.
- Gemma 4 QAT models ship **one GGUF each** (`UD-Q4_K_XL`) because higher precisions degraded
  accuracy — see `qat.md`.
- Dynamic quants run in llama.cpp and Unsloth Desktop/Studio.

Example download + run (from the docs, Llama 4 Scout):

```python
# !pip install huggingface_hub hf_transfer
import os
os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"
from huggingface_hub import snapshot_download
snapshot_download(
    repo_id = "unsloth/Llama-4-Scout-17B-16E-Instruct-GGUF",
    local_dir = "unsloth/Llama-4-Scout-17B-16E-Instruct-GGUF",
    allow_patterns = ["*IQ2_XXS*"],
)
```

```bash
./llama.cpp/llama-cli \
    --model unsloth/Llama-4-Scout-17B-16E-Instruct-GGUF/Llama-4-Scout-17B-16E-Instruct-UD-IQ2_XXS.gguf \
    --threads 32 \
    --ctx-size 16384 \
    --n-gpu-layers 99 \
    -ot ".ffn_.*_exps.=CPU" \
    --seed 3407 \
    --prio 3 \
    --temp 0.6 \
    --min-p 0.01 \
    --top-p 0.9 \
    -no-cnv \
    --prompt "<|header_start|>user<|header_end|>\n\nCreate a Flappy Bird game.<|eot|><|header_start|>assistant<|header_end|>\n\n"
```

## Choosing a quant for a model

- Default pick for a 7B-class model: a Dynamic 4-bit (`UD-Q4_K_XL` / `Q4_K_XL`) — the docs show
  Unsloth's dynamic 4-bit beating QAT quants at smaller size (Gemma 3 27B: 71.47% MMLU at
  15.64GB vs Google QAT 70.64% at 17.2GB).
- When disk is tight: `Q2_K_XL` / `Q3_K_XL` are the documented efficiency sweet spots
  (Efficiency = (MMLU 5-shot − 25) / disk GB; the −25 removes the 4-choice random baseline).
- imatrix helps at lower bits (see `benchmarks.md`); `iq*` quants trade ~5-10% inference speed
  for density.
- **Do not use 1-bit for agentic workloads.** Divergence-300 @32 drops from ~25% (UD-Q2_K_XL)
  to under 8-10% (UD-IQ2_S): tool calling breaks, responses loop, and non-thinking modes may
  output nothing. Mitigations if you must: `presence_penalty = 1.5` or higher, enable thinking
  at least at low reasoning, and expect only general-knowledge retention.

## Benchmark evidence (Gemma 3, from the docs)

KLD vs base model, baseline vs Dynamic 2.0 (closer to 0 is better):

| Quant     | Baseline KLD | GB    | New KLD  | GB    |
| --------- | ------------ | ----- | -------- | ----- |
| IQ1_S     | 1.035688     | 5.83  | 0.972932 | 6.06  |
| IQ2_M     | 0.26554      | 8.84  | 0.258192 | 8.96  |
| Q2_K_XL   | 0.229671     | 9.78  | 0.220937 | 9.95  |
| Q3_K_XL   | 0.087845     | 12.51 | 0.080617 | 12.76 |
| Q4_K_XL   | 0.024916     | 15.41 | 0.023701 | 15.64 |

Gemma 3 27B MMLU 5-shot (truncated):

| Quant          | Unsloth   | Unsloth + QAT | Disk Size | Efficiency |
| -------------- | --------- | ------------- | --------- | ---------- |
| Q2_K_XL        | 68.70     | 67.77         | 9.95      | 4.30       |
| Q3_K_XL        | 70.87     | 69.50         | 12.76     | 3.49       |
| **Q4_K_XL**    | **71.47** | **71.07**     | **15.64** | **2.94**   |
| **Google QAT** |           | **70.64**     | **17.2**  | **2.65**   |

Takeaway: at 4-bit, Dynamic beats QAT on both accuracy and size; at 2-3-bit, Dynamic quants are
the efficiency leaders.

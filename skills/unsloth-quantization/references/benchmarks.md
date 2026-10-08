# Reading Quantization Benchmarks

How to interpret the perplexity / KL divergence tables Unsloth publishes (Qwen3.5 GGUF
benchmarks), what the numbers mean, and where they mislead.

Source: `unsloth.ai/docs/models/qwen3.5/gguf-benchmarks`, `unsloth.ai/docs/basics/dynamic-3.0-ggufs`.

## The metrics

- **PPL** — perplexity, typically on Wiki-test with 512-token context windows.
- **KLD 99.9%** — the 99.9th percentile of KL divergence vs the BF16 base.
- **Mean KLD** — average KL divergence; closest to a "how different is this quant overall"
  number.
- **Max KLD** — the single worst outlier; for massive models this can matter (Qwen3.5's
  March 5, 2026 update pushed Max KLD down substantially, e.g. UD-Q4_K_XL 5.894 → 2.877, −51%).
- **Efficiency** (dynamic-gguf docs) — `(MMLU 5-shot − 25) / disk GB`; the −25 removes the
  4-choice random baseline so small junk models score zero.

Lower is better for PPL and all KLD variants.

## The full Qwen3.5-35B-A3B table (from the docs)

| Quantizer | Quant Level      | Disk Space (GB) | PPL    | KLD 99.9% | Mean KLD |
| --------- | ---------------- | --------------- | ------ | --------- | -------- |
| AesSedai  | IQ3_S            | 12.65           | 6.9152 | 1.8669    | 0.0613   |
| AesSedai  | IQ4_XS           | 16.4            | 6.6447 | 0.8067    | 0.0235   |
| AesSedai  | Q4_K_M           | 20.62           | 6.5665 | 0.3171    | 0.0096   |
| AesSedai  | Q5_K_M           | 24.45           | 6.5356 | 0.21      | 0.0058   |
| Ubergarm  | Q4_0             | 19.79           | 6.5784 | 0.4829    | 0.0142   |
| Unsloth   | IQ2_XXS          | 9.09            | 7.716  | 4.2221    | 0.1846   |
| Unsloth   | Q2_K_XL          | 12.04           | 7.0438 | 2.9092    | 0.097    |
| Unsloth   | IQ3_XXS          | 13.12           | 6.7829 | 1.5296    | 0.0501   |
| Unsloth   | IQ3_S            | 14.13           | 6.7715 | 1.4193    | 0.0457   |
| Unsloth   | Q3_K_M           | 15.54           | 6.732  | 0.9726    | 0.0324   |
| Unsloth   | Q3_K_XL          | 16.06           | 6.7245 | 0.9539    | 0.0308   |
| Unsloth   | MXFP4_MOE        | 18.17           | 6.6    | 0.7789    | 0.0272   |
| Unsloth   | Q4_K_M           | 18.49           | 6.6053 | 0.5478    | 0.0192   |
| Unsloth   | Q4_K_L           | 18.82           | 6.5905 | 0.4828    | 0.015    |
| Unsloth   | Q4_K_XL          | 19.17           | 6.5918 | 0.4097    | 0.0137   |
| Unsloth   | Q5_K_XL          | 23.22           | 6.5489 | 0.236     | 0.0069   |
| Unsloth   | Q6_K_S           | 26.56           | 6.5456 | 0.2226    | 0.0065   |
| Unsloth   | Q6_K_XL          | 28.22           | 6.5392 | 0.1437    | 0.0041   |
| Unsloth   | Q8_K_XL          | 36.04           | 6.5352 | 0.1033    | 0.0026   |
| bartowski | Qwen_IQ2_XXS     | 8.15            | 9.3427 | 6.0607    | 0.3457   |
| bartowski | Qwen_Q2_K_L      | 11.98           | 7.5504 | 3.8095    | 0.1559   |
| bartowski | Qwen_IQ3_XXS     | 12.94           | 7.0938 | 2.1563    | 0.0851   |
| bartowski | Qwen_Q3_K_M      | 14.95           | 6.772  | 1.7779    | 0.0585   |
| bartowski | Qwen_Q3_K_XL     | 15.97           | 6.8245 | 1.7516    | 0.0627   |
| bartowski | Qwen_IQ4_XS      | 17.42           | 6.6234 | 0.7265    | 0.0234   |
| bartowski | Qwen_Q4_K_M      | 19.77           | 6.6097 | 0.5771    | 0.0182   |
| bartowski | Qwen_Q5_K_M      | 23.11           | 6.5828 | 0.3549    | 0.0106   |
| noctrex   | MXFP4_MOE_BF16   | 20.55           | 6.5948 | 0.7939    | 0.0248   |
| noctrex   | MXFP4_MOE_F16    | 20.55           | 6.5937 | 0.7614    | 0.0247   |

(Bartowski's Q4_K_M is 1GB bigger than Unsloth's.)

## How to read a row

1. Compare at the **same size band**, not across the table — a Q8 at 36GB beating a Q4 at
   19GB is not a win.
2. At the same size, prefer lower KLD 99.9% first (tail behavior), then mean KLD.
3. Note the disk deltas: Unsloth's Q4_K_XL is ~1-2GB smaller than bartowski/AesSedai Q4_K_M
   class quants while also beating them on KLD.

## Where PPL/KLD mislead (important)

- **Calibration dependence.** Most GGUFs are evaluated on Wiki-test with 512 context windows.
  If a quant's imatrix calibration set contains Wikipedia-like / 512-context samples (most do),
  its PPL/KLD look artificially good. Unsloth's imatrix uses long-context chat and tool-calling
  examples instead, so their PPL can look *worse* while real-world performance is better.
- **Documented counterexample** (MiniMax-M2.5 analysis): Unsloth Dynamic IQ2_XXS beat
  AesSedai's IQ3_S on LiveCodeBench v6 and MMLU Pro **while being 11GB smaller**, even though
  AesSedai's PPL (0.2441 vs 0.3552) and KLD (8.2849 vs 9.0338) said the opposite.
- PPL/KLD are still a rough signal — just not a ranking by themselves. Prefer: same-size KLD
  comparison + a real workload eval (LiveCodeBench, MMLU Pro, Aider Polyglot) for the decision.

## Tensor-level findings (Qwen3.5, from 9TB of experiments)

- **Most sensitive:** `ssm_out` (Mamba layers) — quantizing it dramatically increases KLD for
  minuscule savings; `attn_*` tensors in hybrid architectures are also very sensitive — keep
  them in higher precision.
- **OK to quantize hard:** `ffn_up_exps`, `ffn_gate_exps` down to ~3-bit (`iq3_xxs` is the
  documented sweet spot); `ffn_down_exps` is slightly more sensitive.
- **MXFP4 vs Q4_K in GGUFs:** MXFP4 is much worse on many tensors (attn_gate, attn_q,
  ssm_beta, ssm_alpha) and uses 4.25 bpw vs Q4_K's 4.5 bpw — when choosing between them,
  Q4_K wins on both accuracy and density. Unsloth retired MXFP4 from Q2_K_XL / Q3_K_XL /
  Q4_K_XL quants, except pure `MXFP4_MOE`.
- **Imatrix helps:** it reduces KLD and PPL across bit widths (biggest at low bits), at the cost
  of 5-10% slower inference. `iq*` quants also run ~5-10% slower — a documented speed/density
  trade-off.

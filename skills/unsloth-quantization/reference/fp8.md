# FP8 Export

FP8 (8-bit floating point) is the middle ground between BF16 and 4-bit: ~half the memory of
BF16 with minimal accuracy loss, and the reference point the NVFP4 quants are compared against.

Sources: `unsloth.ai/docs/blog/quantization-aware-training-qat` (export API),
`unsloth.ai/docs/basics/nvfp4` (FP8 as benchmark baseline).

## Exporting to FP8 (PTQ, no training required)

`save_pretrained_torchao` works as plain post-training quantization — no QAT needed. Saving to
Dynamic float8:

```python
from torchao.quantization import PerRow
from torchao.quantization import Float8DynamicActivationFloat8WeightConfig
torchao_config = Float8DynamicActivationFloat8WeightConfig(granularity = PerRow())
model.save_pretrained_torchao(torchao_config = torchao_config)
```

Install pins (documented): `pip install --upgrade --no-cache-dir --force-reinstall unsloth
unsloth_zoo` then `pip install torchao==0.14.0 fbgemm-gpu-genai==1.3.0` (the QAT notebook maps
torch 2.9/2.10 → torchao 0.16.0, torch 2.11 → 0.18.0).

To upload instead of saving locally, pass `push_to_hub = True` and `token = "YOUR_HF_TOKEN"`
with the repo id as the first argument (same pattern as the int4/int8 exports in `qat.md`).

## Where FP8 fits

- **NVIDIA datacenter GPUs** — FP8 is the natural 8-bit format; on consumer/older hardware,
  GGUFs (`q8_0` or lower) are the documented path.
- **Accuracy baseline** — the NVFP4 benchmarks report FP8 alongside BF16 and the 4-bit quants;
  FP8 sits essentially at BF16 quality on MMLU-Pro/GPQA/AIME (e.g. Qwen3.6-27B: FP8 86.11 /
  86.87 / 93.75 vs BF16 85.96 / 88.13 / 93.33). See `nvfp4.md` for the full table.
- **FP8 KV cache** — Unsloth's NVFP4 quants include FP8 KV cache calibration, allowing 2x
  longer context lengths. FP8 is also one of the QAT scheme dimensions
  (`fp8-fp8`, `fp8-int4`) — see `qat.md`.
- **Blackwell 4-bit** — if the target is Blackwell and 4-bit is acceptable, NVFP4 (W4A4)
  outperforms staying at FP8 on both speed and memory; see `nvfp4.md`.

## Choosing between FP8 and the other formats

| Situation | Pick |
|-----------|------|
| Halve BF16 memory, keep ~BF16 accuracy, NVIDIA GPU | FP8 (`Float8DynamicActivationFloat8WeightConfig`) |
| 4-bit with max accuracy, trainable | QAT (`qat_scheme`, `save_pretrained_torchao`) — see `qat.md` |
| 4-bit on Blackwell, speed-first | NVFP4 — see `nvfp4.md` |
| 4-bit anywhere (llama.cpp/Ollama) | GGUF `q4_k_m` / Dynamic `UD-Q4_K_XL` — see `gguf-export.md`, `dynamic-gguf.md` |
| CPU / non-NVIDIA, any size | GGUF — see `gguf-export.md` |

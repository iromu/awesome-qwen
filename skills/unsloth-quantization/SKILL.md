---
name: unsloth-quantization
description: |-
  Quantize and export models with Unsloth: convert a fine-tune to GGUF, merge LoRA, export a model. GGUF via save_pretrained_gguf / push_to_hub_gguf (q4_k_m, q5_k_m, q8_0, f16, multiple quants in one call, imatrix); Unsloth Dynamic GGUF 2.0/3.0 (UD-Q4_K_XL, KL-divergence benchmarks); FP8 and NVFP4 for NVIDIA Blackwell (vLLM/SGLang); quantization-aware training (QAT: qat_scheme int4/fp8-int4/int8-int4, save_pretrained_torchao, torchao pins); merged 16-bit/4-bit exports (save_pretrained_merged, save_method merged_16bit / merged_4bit, push_to_hub_merged); speculative-decoding GGUF draft models (--model-draft, MTP); ExecuTorch phone deployment (.pte); reading quantization benchmarks (perplexity, KL divergence, MXFP4). Trigger on: quantize, quantization, GGUF, imatrix, NVFP4, MXFP4, quantization-aware training, dynamic GGUF, export a model, speculative decoding, phone deployment. NOT for training (unsloth-finetuning), RL (unsloth-rl), or running/serving models (unsloth-inference).
metadata:
  author: "Iván Rodríguez Murillo <wantez@gmail.com>"
  version: 1.0.0
---

# Unsloth Quantization & Export

Turn a trained (or untrained) model into a deployable artifact: GGUF for llama.cpp/Ollama/LM Studio,
merged 16-bit/4-bit safetensors for vLLM and Hugging Face, FP8/NVFP4 for NVIDIA datacenter GPUs,
QAT 4-bit via TorchAO, ExecuTorch `.pte` for phones, and GGUF draft models for speculative decoding.

All code below comes from the official Unsloth notebooks and documentation — do not invent API
arguments. The canonical entry point for everything is a `FastLanguageModel` object; exports are
methods on it (`save_pretrained_gguf`, `push_to_hub_gguf`, `save_pretrained_merged`,
`push_to_hub_merged`, `save_pretrained_torchao`).

## Instructions

1. Confirm the task belongs here — training a LoRA goes back to `unsloth-finetuning`, RL to `unsloth-rl`, and serving an already-quantized model to `unsloth-inference` (see "When NOT to Use").
2. Pick the export format (Dynamic 2.0/3.0 GGUF, FP8, NVFP4, QAT) in "Choosing a Quant Format"; identify the target hardware (desktop GPU vs phone) early — it usually decides the format.
3. Follow "Core Workflow: LoRA → GGUF" for the full adapter → quantized-file → metadata pipeline; look up export calls in "Key APIs".
4. Verify expected accuracy and size trade-offs against `references/benchmarks.md` (and `references/speculative-decoding.md` when latency matters) before shipping the artifact.
5. Check "Pitfalls" before running.

## When to Use

- "Export my fine-tune to GGUF" / "convert to Ollama / llama.cpp / LM Studio"
- "Which quant should I pick — q4_k_m, q5_k_m, q8_0, f16?"
- "What are Unsloth Dynamic GGUFs and are they better than standard imatrix quants?"
- "Save my model as FP8 / NVFP4 for a Blackwell GPU"
- "Run QAT so my 4-bit model is more accurate" / "export with save_pretrained_torchao"
- "Merge my LoRA into the base model for vLLM" (merged_16bit / merged_4bit)
- "Make a draft model for speculative decoding" / "2x inference with llama.cpp"
- "Deploy this model to a phone" (ExecuTorch, `.pte`, iOS/Android)
- "Help me read these perplexity / KL divergence benchmark tables"

## When NOT to Use

| Scenario | Use instead |
|----------|-------------|
| Fine-tuning (SFT, LoRA, QLoRA, vision, TTS) | `unsloth-finetuning` |
| RL: GRPO, DPO, ORPO, KTO, reward functions | `unsloth-rl` |
| Running/serving models: vLLM guide, SGLang, Ollama run, LM Studio, Unsloth Desktop/Studio, OpenAI-compatible API | `unsloth-inference` |
| Installing Unsloth itself | `unsloth-finetuning` (install docs) |

The boundary is the artifact: this skill covers *producing* the quantized/exported file and
picking the right format. *Serving* an already-exported file belongs to `unsloth-inference`
(except the short export-adjacent serving snippets documented here, e.g. the Ollama Modelfile flow
immediately after a GGUF export, and NVFP4 vLLM/SGLang launch commands).

## Choosing a Quant Format

Pick by target runtime first, then by size/accuracy budget:

| Target runtime | Format | Notes (from the docs) |
|----------------|--------|----------------------|
| llama.cpp / Ollama / LM Studio / Unsloth Studio | **GGUF** (`save_pretrained_gguf`) | `q8_0` is the default; `q4_k_m` and `q5_k_m` are the documented "Recommended" picks; `f16` keeps 100% accuracy for a lossless conversion |
| llama.cpp, best accuracy at a size | **Unsloth Dynamic GGUF** (`UD-Q4_K_XL` etc.) | Per-layer dynamic quantization + curated imatrix calibration; SOTA on KL divergence vs standard quants at the same size |
| vLLM / HF inference | **Merged safetensors** (`save_pretrained_merged`) | `save_method="merged_16bit"` (float16) or `"merged_4bit"` (int4); `"lora"` adapters as fallback |
| NVIDIA GPUs, max 4-bit accuracy | **QAT via TorchAO** (`save_pretrained_torchao`) | Trainable fake-quantization recovers up to ~70% of the accuracy lost to naive 4-bit PTQ; no extra inference overhead |
| NVIDIA Blackwell (RTX 50X, B200/B300, DGX Spark) | **NVFP4** | W4A4 on FP4 tensor cores, up to ~2.5x faster than W4A16 NVFP4; older GPUs → use GGUFs |
| NVIDIA datacenter, 8-bit | **FP8** (torchao config) | `Float8DynamicActivationFloat8WeightConfig`; FP8 KV cache also doubles context length in NVFP4 quants |
| Phones (Android/iOS) | **ExecuTorch `.pte`** | `qat_scheme="phone-deployment"` (int8-int4 under the hood) then ExecuTorch export |

## Core Workflow: LoRA → GGUF

Canonical flow from the official Llama 3.1 (8B) Alpaca notebook.

1. **Load the trained LoRA** with `FastLanguageModel` (not raw PEFT — Unsloth loading supports
   4-bit bases and is the documented path):

   ```python
   from unsloth import FastLanguageModel
   model, tokenizer = FastLanguageModel.from_pretrained(
       model_name = "llama_lora", # YOUR MODEL YOU USED FOR TRAINING
       max_seq_length = 2048,
       load_in_4bit = True,
   )
   ```

2. **Export to GGUF.** Local save or push to your Hugging Face account. Default is `q8_0`;
   pass `quantization_method` for anything else:

   ```python
   # Save to 8bit Q8_0 (the default)
   model.save_pretrained_gguf("llama_finetune", tokenizer,)
   model.push_to_hub_gguf("HF_USERNAME/llama_finetune", tokenizer, token = "YOUR_HF_TOKEN")

   # Save to 16bit GGUF
   model.save_pretrained_gguf("llama_finetune", tokenizer, quantization_method = "f16")
   model.push_to_hub_gguf("HF_USERNAME/llama_finetune", tokenizer, quantization_method = "f16", token = "YOUR_HF_TOKEN")

   # Save to q4_k_m GGUF
   model.save_pretrained_gguf("llama_finetune", tokenizer, quantization_method = "q4_k_m")
   model.push_to_hub_gguf("HF_USERNAME/llama_finetune", tokenizer, quantization_method = "q4_k_m", token = "YOUR_HF_TOKEN")
   ```

3. **Multiple quants in one call** — much faster than separate calls (saves ~10+ minutes):

   ```python
   model.push_to_hub_gguf(
       "HF_USERNAME/llama_finetune", # Change hf to your username!
       tokenizer,
       quantization_method = ["q4_k_m", "q8_0", "q5_k_m",],
       token = "YOUR_HF_TOKEN",
   )
   ```

4. **Verify.** Load the exported GGUF in llama.cpp/Ollama and check output quality with the
   *same chat template used during training*. Gibberish or endless repetitions after a good
   in-Unsloth run are almost always a chat-template mismatch, a wrong EOS token, or an engine
   adding/dropping a start-of-sequence token — not a bad quant.

### Ollama shortcut (from the Llama 3 (8B) Ollama notebook)

After `save_pretrained_gguf`, Unsloth auto-generates an Ollama Modelfile:

```python
print(tokenizer._ollama_modelfile)          # inspect the auto-generated Modelfile
```

```bash
ollama create unsloth_model -f ./model/Modelfile
curl http://localhost:11434/api/chat -d '{ "model": "unsloth_model", "messages": [ { "role": "user", "content": "..." } ] }'
```

### Merged exports for vLLM / Hugging Face (same notebook)

```python
# Merge to 16bit
model.save_pretrained_merged("llama_finetune_16bit", tokenizer, save_method = "merged_16bit",)
model.push_to_hub_merged("HF_USERNAME/llama_finetune_16bit", tokenizer, save_method = "merged_16bit", token = "YOUR_HF_TOKEN")

# Merge to 4bit
model.save_pretrained_merged("llama_finetune_4bit", tokenizer, save_method = "merged_4bit",)
model.push_to_hub_merged("HF_USERNAME/llama_finetune_4bit", tokenizer, save_method = "merged_4bit", token = "YOUR_HF_TOKEN")

# Or just the LoRA adapters
model.save_pretrained("llama_lora")
tokenizer.save_pretrained("llama_lora")
model.push_to_hub("HF_USERNAME/llama_lora", token = "YOUR_HF_TOKEN")
tokenizer.push_to_hub("HF_USERNAME/llama_lora", token = "YOUR_HF_TOKEN")
```

## Key APIs

| API | Purpose | Key arguments (as documented) |
|-----|---------|-------------------------------|
| `model.save_pretrained_gguf(dir, tokenizer, ...)` | Local GGUF export | `quantization_method` (str; default `q8_0`; full list in `references/gguf-export.md`) |
| `model.push_to_hub_gguf(repo, tokenizer, ...)` | GGUF export to HF | `quantization_method` (str **or list** for multi-quant, faster), `token` |
| `model.save_pretrained_merged(dir, tokenizer, ...)` | Merged safetensors | `save_method`: `"merged_16bit"`, `"merged_4bit"`, or `"lora"` |
| `model.push_to_hub_merged(repo, tokenizer, ...)` | Merged export to HF | `save_method`, `token` |
| `model.save_pretrained_torchao(dir, tokenizer, ...)` | QAT/PTQ TorchAO export (int4/int8/FP8) | `torchao_config` (e.g. `Int4WeightOnlyConfig()`, `Int8DynamicActivationInt8WeightConfig()`, `Float8DynamicActivationFloat8WeightConfig(granularity=PerRow())`), `push_to_hub=True`, `token` |
| `FastLanguageModel.get_peft_model(..., qat_scheme=...)` | Enable QAT at adapter setup | `qat_scheme`: `"int4"`, `"fp8-int4"`, `"fp8-fp8"`, `"int8-int4"`, `"phone-deployment"` |
| `quantize_(model, QATConfig(step="convert"))` | QAT → inference-ready conversion | run after training, before `save_pretrained_torchao` |
| `model.save_pretrained(..., maximum_memory_usage=...)` | Crash mitigation | default 0.75 of GPU peak; lower (e.g. 0.5) on OOM during saving |

QAT requires the convert step *before* saving — see `references/qat.md` for the full loop.

## References

| File | Contents |
|------|----------|
| `references/gguf-export.md` | Full GGUF export API, complete quant method table, multi-quant, manual llama.cpp conversion, Ollama Modelfile flow, troubleshooting |
| `references/dynamic-gguf.md` | Unsloth Dynamic GGUF 2.0/3.0: how it works, why KLD is the right metric, benchmark evidence, UD-* naming, 1-bit caveats |
| `references/fp8.md` | FP8 export via torchao (PTQ without training), FP8 vs BF16/NVFP4 accuracy context |
| `references/nvfp4.md` | Unsloth Dynamic NVFP4 on Blackwell: NVFP4 vs MXFP4, vLLM/SGLang serving, VRAM + accuracy benchmarks, DGX Spark |
| `references/qat.md` | QAT end-to-end from the official notebook + Gemma 4 QAT specifics |
| `references/speculative-decoding.md` | GGUF draft models for llama.cpp/llama-server, MTP speculative config for vLLM, NEXTN for SGLang |
| `references/phone-deployment.md` | Fine-tune → ExecuTorch `.pte` → iPhone/Android, full command flows |
| `references/benchmarks.md` | How to read perplexity/KLD tables, calibration caveats, tensor sensitivity, MXFP4, full Qwen3.5 benchmark table |

## Examples

**"Convert my LoRA to run on Ollama."** "Core Workflow: LoRA -> GGUF" -> merge the adapter into the base, then `save_pretrained_gguf("q4_k_m", ...)`; verify the chat template renders inside the GGUF before shipping.

**"We need FP8 on a B200."** "Choosing a Quant Format" -> the FP8/NVFP4 Blackwell path (`save_pretrained_torchao`, NVFP4 export); check `references/benchmarks.md` for the expected accuracy/size trade-off.

**"Halve latency on llama.cpp." / "Run this on a phone."** `references/speculative-decoding.md` -> draft-model GGUF plus the `--model-draft` flag; `references/phone-deployment.md` -> ExecuTorch `.pte` export.

## Pitfalls

- **Default is `q8_0`.** `save_pretrained_gguf` with no `quantization_method` saves 8-bit Q8_0 —
  high resource use. For a smaller default export, pick `q4_k_m` or `q5_k_m` (both documented
  as "Recommended").
- **Multiple quants in one call is faster.** Passing `quantization_method = ["q4_k_m", "q8_0",
  "q5_k_m"]` to `push_to_hub_gguf` beats three separate runs — the notebooks call this out
  explicitly (10+ minutes saved).
- **`f16` is a valid quant.** For a lossless 16-bit GGUF (e.g. before your own downstream
  quantization with llama.cpp's `llama-quantize`), use `quantization_method = "f16"` — not a
  merge-and-convert detour.
- **imatrix is a calibration concept, not a save argument.** The docs describe imatrix as the
  calibration data that steers quantization (Unsloth Dynamic quants use a curated, chat-aware
  imatrix; imatrix reduces KLD and PPL, at 5-10% slower inference). The `save_pretrained_gguf` /
  `push_to_hub_gguf` API as documented exposes `quantization_method` (and `token`), not an
  `imatrix` parameter — do not fabricate one.
- **Dynamic GGUF naming.** Unsloth's own uploads use `UD-` prefixed names (`UD-Q4_K_XL`,
  `UD-Q2_K_XL`, `UD-IQ1_S`, `UD-TQ1_0`) that don't match vanilla llama.cpp quant names — match
  the `UD-` name when downloading, and note that for some QAT models (Gemma 4 QAT) there is
  only one quant per model because higher precisions *degraded* accuracy.
- **QAT needs the full notebook flow.** `qat_scheme` on `get_peft_model`, then
  `quantize_(model, QATConfig(step = "convert"))` after training, then
  `save_pretrained_torchao`. Skipping the convert step, or calling `save_pretrained_torchao`
  without torchao installed (pinned: `torchao==0.14.0 fbgemm-gpu-genai==1.3.0` in the docs;
  the notebook maps torch 2.9/2.10 → torchao 0.16.0, torch 2.11 → 0.18.0), breaks the export.
- **NVFP4 is Blackwell-only.** RTX 50X / B200 / B300 / DGX Spark. On older GPUs, use the GGUFs.
  In vLLM, do not pin a MoE backend (Marlin is 2.5x slower on W4A4); DGX Spark needs
  `--moe-backend flashinfer_b12x` or inference degrades.
- **Perplexity and KLD can mislead.** They are calibration-dependent; a quant with worse PPL on
  Wiki-test can outperform on real workloads (LiveCodeBench, MMLU Pro) — and vice versa. Read
  `references/benchmarks.md` before ranking quants by PPL alone.
- **1-bit quants are not for agentic use.** Below `UD-Q2_K_XL`, 32-token prediction collapses
  (25% → under 8-10%): tool calling breaks, responses loop (use `presence_penalty = 1.5`+), and
  non-thinking modes may output nothing.
- **OOM while saving.** Lower `maximum_memory_usage` (default 0.75 → 0.5) — documented fix for
  GGUF/vLLM save crashes.
- **Chat template mismatch after export.** The single most common "it works in Unsloth but not in
  Ollama/llama.cpp" cause. Use the same template used during training; force it with the
  conversational notebooks.

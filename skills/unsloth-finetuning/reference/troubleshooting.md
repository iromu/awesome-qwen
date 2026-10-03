# Troubleshooting & Environment Flags

**First rule of thumb: update Unsloth if you find any issues.**

```bash
pip install --upgrade --force-reinstall --no-cache-dir --no-deps unsloth unsloth_zoo
```

For version/dependency problems, use the official Docker image (everything
pre-installed).

## Environment flags

Set these **before any Unsloth import** to disable features or debug broken
finetunes.

| Environment variable | Purpose |
|----------------------|---------|
| `os.environ["UNSLOTH_RETURN_LOGITS"] = "1"` | Forcibly returns logits — useful for evaluation if logits are needed. Also disables CCE (used for CPT). |
| `os.environ["UNSLOTH_COMPILE_DISABLE"] = "1"` | Disables the auto compiler. Useful to debug incorrect finetune results / slow first runs. |
| `os.environ["UNSLOTH_DISABLE_FAST_GENERATION"] = "1"` | Disables fast generation for generic models. |
| `os.environ["UNSLOTH_ENABLE_LOGGING"] = "1"` | Enables auto compiler logging — see which functions are compiled. |
| `os.environ["UNSLOTH_FORCE_FLOAT32"] = "1"` | On float16 machines, use float32 and not float16 mixed precision. Useful for Gemma 3. |
| `os.environ["UNSLOTH_STUDIO_DISABLED"] = "1"` | Disables extra features. |
| `os.environ["UNSLOTH_COMPILE_DEBUG"] = "1"` | Turns on extremely verbose `torch.compile` logs. |
| `os.environ["UNSLOTH_COMPILE_MAXIMUM"] = "0"` | Enables maximum `torch.compile` optimizations — not recommended. |
| `os.environ["UNSLOTH_COMPILE_IGNORE_ERRORS"] = "1"` | Can turn this off to enable fullgraph parsing. |
| `os.environ["UNSLOTH_FULLGRAPH"] = "0"` | Enable `torch.compile` fullgraph mode. |
| `os.environ["UNSLOTH_DISABLE_AUTO_UPDATES"] = "1"` | Forces no updates to `unsloth-zoo`. |
| `os.environ["UNSLOTH_STABLE_DOWNLOADS"] = "1"` | Disables fast (async) downloads; forces synchronous downloads with more error output. Use when a download gets stuck at 90-95%. |
| `os.environ["UNSLOTH_MOE_BACKEND"] = "grouped_mm"` / `"unsloth_triton"` / `"native_torch"` | Select the MoE backend (see `moe.md`). |

If a model upload appears corrupted, retry with the exact upstream model name:

```python
model, tokenizer = FastVisionModel.from_pretrained(
    "Qwen/Qwen2-VL-7B-Instruct",
    use_exact_model_name = True,
)
```

## Fine-tuning a model not yet supported

Unsloth works with any model supported by `transformers`. If a model isn't in
the uploads or doesn't run out of the box, it's usually still supported — newer
models may just need `trust_remote_code=True`. Example (DeepSeek-OCR):

```python
from huggingface_hub import snapshot_download
snapshot_download("unsloth/DeepSeek-OCR", local_dir = "deepseek_ocr")
model, tokenizer = FastVisionModel.from_pretrained(
    "./deepseek_ocr",
    load_in_4bit = False, # Use 4bit to reduce memory use. False for 16bit LoRA.
    auto_model = AutoModel,
    trust_remote_code = True, # Enable to support new models
    unsloth_force_compile = True,
    use_gradient_checkpointing = "unsloth", # True or "unsloth" for long context
)
```

## Broken finetune after exporting (gibberish / infinite / repeated output)

Works in Unsloth but poor elsewhere (Ollama, vLLM, llama.cpp)?

1. **Most common cause: an incorrect chat template.** Use the SAME chat
   template that was used when training in Unsloth AND when running in the
   other framework. Apply the correct template when inferring from a saved model.
2. The inference engine may add (or omit) an unnecessary "start of sequence"
   token — check both hypotheses.
3. **Use Unsloth's conversational notebooks to force the chat template** — this
   fixes most issues (Qwen3-14B, Gemma-3 4B, Llama-3.2 3B, Phi-4 14B, Mistral
   v0.3 7B conversational notebooks).

## Out of memory (OOM)

- Lower the batch size below 2 to use less VRAM.
- For evaluation, use `fp16_full_eval=True` (or `bf16_full_eval=True` on bf16
  machines) to cut memory by 1/2. Unsloth sets these on by default since
  June 2025.
- For long context, enable `unsloth_tiled_mlp = True` (see `long-context.md`).
- Saving to GGUF / vLLM 16bit crashing: reduce `maximum_memory_usage`. Default
  is `model.save_pretrained(..., maximum_memory_usage = 0.75)`; lower it to
  0.5 (or less) to use less peak GPU memory.

## Downloading gets stuck at 90-95%

Disable fast downloading to force synchronous downloads with more error
messages. Set before any Unsloth import:

```python
import os
os.environ["UNSLOTH_STABLE_DOWNLOADS"] = "1"

from unsloth import FastLanguageModel
```

## RuntimeError: CUDA error: device-side assert triggered

Restart and run all, but place this at the start before any Unsloth import (and
file a bug report):

```python
import os
os.environ["UNSLOTH_COMPILE_DISABLE"] = "1"
os.environ["UNSLOTH_DISABLE_FAST_GENERATION"] = "1"
```

## All labels in your dataset are -100 (losses all 0)

Your `train_on_responses_only` usage is incorrect for that model. Use the right
instruction/response markers per model family:

Llama 3.1 / 3.2 / 3.3:

```python
from unsloth.chat_templates import train_on_responses_only
trainer = train_on_responses_only(
    trainer,
    instruction_part = "<|start_header_id|>user<|end_header_id|>\n\n",
    response_part = "<|start_header_id|>assistant<|end_header_id|>\n\n",
)
```

Gemma 2 / 3 / 3n:

```python
from unsloth.chat_templates import train_on_responses_only
trainer = train_on_responses_only(
    trainer,
    instruction_part = "<start_of_turn>user\n",
    response_part = "<start_of_turn>model\n",
)
```

## Unsloth is slower than expected

`torch.compile` typically takes ~5 minutes (or longer) to warm up and finish
compiling. Measure throughput **after** it's fully loaded — over longer runs
Unsloth should be much faster. To disable:

```python
import os
os.environ["UNSLOTH_COMPILE_DISABLE"] = "1"
```

## "Some weights of Gemma3nForConditionalGeneration were not initialized"

Critical — some weights weren't parsed correctly, causing incorrect outputs.
Fix by upgrading Unsloth, then transformers and timm:

```
pip install --upgrade --force-reinstall --no-cache-dir --no-deps unsloth unsloth_zoo
pip install --upgrade --force-reinstall --no-cache-dir --no-deps transformers timm
```

If it persists, file a bug report.

## NotImplementedError: A UTF-8 locale is required. Got ANSI

In a new cell (Colab):

```python
import locale
locale.getpreferredencoding = lambda: "UTF-8"
```

## Early stopping

Use `EarlyStoppingCallback` to stop when `eval_loss` stops decreasing. Requires
an eval split (`train_test_split(test_size = 0.01, shuffle = True)` — always
shuffle) and these trainer args: `save_strategy = "steps"`, `save_steps`,
`save_total_limit`, `eval_strategy = "steps"`, `eval_steps`,
`load_best_model_at_end = True` (MUST for early stopping),
`metric_for_best_model = "eval_loss"`, `greater_is_better = False`. Then:

```python
from transformers import EarlyStoppingCallback
early_stopping_callback = EarlyStoppingCallback(
    early_stopping_patience = 3,     # How many steps we will wait if the eval loss doesn't decrease
    early_stopping_threshold = 0.0,  # Can set higher - sets how much loss should decrease by
)
trainer.add_callback(early_stopping_callback)
```

Then train as usual via `trainer.train()`.

Source: https://unsloth.ai/docs/basics/unsloth-environment-flags.md and
https://unsloth.ai/docs/basics/troubleshooting-and-faqs.md (fetched 2026-09-26).

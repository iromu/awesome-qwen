---
name: unsloth-finetuning
description: >-
  Use this skill whenever the user wants to SUPERVISED FINE-TUNE or fine-tune an
  open LLM/VLM with the Unsloth Python library: QLoRA or LoRA SFT with
  FastLanguageModel, get_peft_model (LoRA rank/alpha, target_modules), and
  SFTTrainer/SFTConfig; full fine-tuning (FFT) or 8-bit training; continued
  pretraining on raw text; vision/multimodal fine-tuning with FastVisionModel
  (Qwen-VL, Llama 3.2 Vision, Gemma 3, Pixtral); embedding fine-tuning with
  FastSentenceTransformer; MoE models (Qwen3-A3B/A22B, gpt-oss, DeepSeek, GLM);
  multi-GPU DDP via torchrun/accelerate; packing and long-context (500K)
  finetuning. Trigger on "fine-tune", "finetune", "LoRA", "QLoRA", "SFT",
  "supervised fine-tuning", "unsloth", "train_on_responses_only", chat
  templates, and model families like Qwen, Llama, Gemma, DeepSeek, gpt-oss, Phi.
  NOT for reinforcement learning / GRPO / DPO / reward functions (use
  unsloth-rl), exporting/quantizing to GGUF/FP8/NVFP4/QAT (use
  unsloth-quantization), or running/serving models (use unsloth-inference).
---

# Unsloth Fine-tuning

Supervised fine-tuning of open LLMs/VLMs with **Unsloth** (`unsloth` +
`unsloth_zoo` + `trl`/transformers trainers). The canonical entry points are
`FastLanguageModel` (text) or `FastVisionModel` (vision) from `unsloth`, then
`get_peft_model` to attach LoRA, then `SFTTrainer`/`SFTConfig` from `trl` to
train — followed by `for_inference` and `save_pretrained*` to evaluate and
export.

## When to Use

- The user wants to **fine-tune** (SFT) an open model — Qwen, Llama, Gemma,
  DeepSeek, gpt-oss, Phi, Mistral — on their own QA/instruction/conversation
  data, with LoRA or QLoRA.
- The user asks about **LoRA hyperparameters**: rank (`r`), `lora_alpha`,
  `lora_dropout`, `target_modules`, learning rate, epochs, batch size.
- The user wants **full fine-tuning** (`full_finetuning`) or **8-bit**
  training, or needs VRAM/hardware planning for a given model size.
- The user wants **continued pretraining** on raw text (new language/domain)
  or **long-context / packing** training (5x speedup, 500K context).
- The user wants **vision/multimodal** fine-tuning (image+caption data),
  **embedding** fine-tuning (retrieval/RAG), **MoE** fine-tuning, or
  **multi-GPU (DDP)** training.
- The user asks about chat templates, `train_on_responses_only`, dataset
  formatting (Alpaca/ShareGPT/ChatML), or saving a trained LoRA (merged /
  GGUF hand-off).

## When NOT to Use

| Scenario | Use instead |
|---|---|
| Reinforcement learning: GRPO/GSPO/DAPO, DPO/ORPO/KTO, reward functions, reasoning models | `unsloth-rl` |
| Exporting/quantizing a trained model: GGUF quants, FP8/NVFP4 serving quants, QAT | `unsloth-quantization` |
| Running/serving models: vLLM/SGLang serving, Ollama, llama.cpp, API endpoints, SDKs | `unsloth-inference` |

(You may still *mention* these hand-offs inside an SFT answer — e.g. "save the
LoRA to GGUF with `save_pretrained_gguf`" — but the export/quantization
procedure itself belongs to `unsloth-quantization`, and adding reasoning via
RL (GRPO) belongs to `unsloth-rl`.)

## Choosing a Method

All methods below load through `FastLanguageModel.from_pretrained`; exactly ONE
training-method flag may be `True` at a time.

| Method | Flag | VRAM | Use when |
|---|---|---|---|
| **QLoRA** (4-bit base) | `load_in_4bit = True` | ~4x less than 16-bit LoRA | Default choice when VRAM-constrained. Slightly slower and marginally less accurate than 16-bit LoRA. |
| **LoRA** (16-bit base) | `load_in_4bit = False` | ~4x more than QLoRA | You have the VRAM and want slightly faster training with higher accuracy. |
| **8-bit LoRA** | `load_in_8bit = True` | 2x the 4-bit VRAM | A middle ground: "a bit more accurate, uses 2x memory" than 4-bit. |
| **Full fine-tuning** | `full_finetuning = True` | far more (all weights train) | LoRA can't reach the required quality. Verify the LoRA run first — FFT is the escalation path, not the starting point. |

Minimum VRAM by model size (absolute minimums — some models need more):

| Parameters | QLoRA (4-bit) | LoRA (16-bit) |
|---|---|---|
| 3B | 3.5 GB | 8 GB |
| 8B | 6 GB | 22 GB |
| 14B | 8.5 GB | 33 GB |
| 27B | 22 GB | 64 GB |
| 70B | 41 GB | 164 GB |

Rule of thumb: model parameters (B) ≈ GB of VRAM for 16-bit LoRA; ~a quarter
of that for QLoRA. Full table and OOM tips in `reference/requirements-vram.md`.

**Model-name suffix conventions** (Unsloth's HF uploads):

- `<name>-unsloth-bnb-4bit` — Unsloth dynamic 4-bit quants. Slightly more VRAM
  than standard 4-bit, significantly higher accuracy.
- `<name>-bnb-4bit` (no "unsloth") — standard BitsAndBytes 4-bit.
- No suffix — original 16-bit or 8-bit. Unsloth's copies sometimes include
  important chat template / tokenizer fixes, so prefer them when available.

**Instruct vs base:** conversational/chat-template finetunes use the instruct
model (Llama-3.x chat templates only function on the instruct version). Base
models take Alpaca-style single-turn prompts or raw text (continued
pretraining). Notebooks keep a `fourbit_models` list of pre-quantized 4-bit
models (4x faster downloads, no OOMs).

## Core Workflow: QLoRA SFT

Canonical code below is from the official `Llama3.1_(8B)-Alpaca` notebook; the
full walkthrough lives in `reference/sft-lora.md`.

1. **Install.** `pip install unsloth` (Linux, WSL, Windows via WSL — it pulls
   compatible torch/transformers automatically). Colab/Docker/AMD variants in
   `reference/installation.md`.

2. **Load the model** (and tokenizer):

```python
from unsloth import FastLanguageModel
import torch
max_seq_length = 2048 # Choose any! We auto support RoPE Scaling internally!
dtype = None # None for auto detection. Float16 for Tesla T4, V100, Bfloat16 for Ampere+
load_in_4bit = True # Use 4bit quantization to reduce memory usage. Can be False.

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Llama-3.1-8B",
    max_seq_length = max_seq_length,
    dtype = dtype,
    load_in_4bit = load_in_4bit,
    # token = "YOUR_HF_TOKEN", # HF Token for gated models
)
```

3. **Add LoRA adapters** — target ALL major linear layers (attention + MLP);
   dropping modules saves little and hurts quality:

```python
model = FastLanguageModel.get_peft_model(
    model,
    r = 16, # Choose any number > 0 ! Suggested 8, 16, 32, 64, 128
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj",
                      "gate_proj", "up_proj", "down_proj",],
    lora_alpha = 16,
    lora_dropout = 0, # Supports any, but = 0 is optimized
    bias = "none",    # Supports any, but = "none" is optimized
    # [NEW] "unsloth" uses 30% less VRAM, fits 2x larger batch sizes!
    use_gradient_checkpointing = "unsloth", # True or "unsloth" for very long context
    random_state = 3407,
    use_rslora = False,  # We support rank stabilized LoRA
    loftq_config = None, # And LoftQ
)
```

4. **Prepare the dataset** — format rows into a single `text` column and
   **append the EOS token** to each text, otherwise generation runs forever:

```python
EOS_TOKEN = tokenizer.eos_token # Must add EOS_TOKEN
def formatting_prompts_func(examples):
    instructions = examples["instruction"]
    inputs       = examples["input"]
    outputs      = examples["output"]
    texts = []
    for instruction, input, output in zip(instructions, inputs, outputs):
        # Must add EOS_TOKEN, otherwise your generation will go on forever!
        text = alpaca_prompt.format(instruction, input, output) + EOS_TOKEN
        texts.append(text)
    return { "text" : texts, }

from datasets import load_dataset
dataset = load_dataset("unsloth/alpaca-cleaned", split = "train")
dataset = dataset.map(formatting_prompts_func, batched = True,)
```

   For conversational (instruct) data, apply a chat template instead —
   `get_chat_template` + `standardize_sharegpt` — and wrap the trainer with
   `train_on_responses_only(trainer)` so only assistant completions are
   trained. Details in `reference/chat-templates.md` and `reference/datasets.md`.

5. **Train** with `SFTTrainer`/`SFTConfig`:

```python
from trl import SFTConfig, SFTTrainer
trainer = SFTTrainer(
    model = model,
    tokenizer = tokenizer,
    train_dataset = dataset,
    dataset_text_field = "text",
    max_seq_length = max_seq_length,
    packing = False, # Can make training 5x faster for short sequences.
    args = SFTConfig(
        per_device_train_batch_size = 2,
        gradient_accumulation_steps = 4,
        warmup_steps = 5,
        # num_train_epochs = 1, # Set this for 1 full training run.
        max_steps = 60,
        learning_rate = 2e-4,
        logging_steps = 1,
        optim = "adamw_8bit",
        weight_decay = 0.001,
        lr_scheduler_type = "linear",
        seed = 3407,
        output_dir = "outputs",
        report_to = "none", # Use TrackIO/WandB etc
    ),
)

trainer_stats = trainer.train()
```

   For a full run set `num_train_epochs = 1` (1–3 epochs recommended) and drop
   `max_steps`. Loss around 0.5–1.0 is a good sign; loss going to 0 suggests
   overfitting. Hyperparameter rationale in `reference/hyperparameters.md`.

6. **Infer** — always call `for_inference` first (Unsloth's native inference is
   2x faster):

```python
FastLanguageModel.for_inference(model) # Enable native 2x faster inference
inputs = tokenizer(
[
    alpaca_prompt.format(
        "Continue the fibonacci sequence.", # instruction
        "1, 1, 2, 3, 5, 8", # input
        "", # output - leave this blank for generation!
    )
], return_tensors = "pt").to("cuda")

outputs = model.generate(**inputs, max_new_tokens = 64, use_cache = True)
tokenizer.batch_decode(outputs)
```

7. **Save** — the LoRA, a merged model for vLLM, or a GGUF hand-off:

```python
model.save_pretrained("llama_lora")  # Local saving
tokenizer.save_pretrained("llama_lora")
# Merge to 16bit
if False: model.save_pretrained_merged("llama_finetune_16bit", tokenizer, save_method = "merged_16bit",)
if False: model.save_pretrained_gguf("llama_finetune", tokenizer, quantization_method = "q4_k_m")
```

   GGUF quant selection (full quant list, imatrix, Ollama export) belongs to
   `unsloth-quantization`.

## Key APIs

| API | Source | Purpose / key arguments |
|---|---|---|
| `FastLanguageModel.from_pretrained(model_name, max_seq_length, dtype, load_in_4bit, load_in_8bit, full_finetuning, fast_inference, max_lora_rank, device_map, unsloth_tiled_mlp, token)` | `unsloth` | Load model + tokenizer. Exactly one method flag True. `device_map="balanced"` splits a model too big for one GPU. |
| `FastLanguageModel.get_peft_model(model, r, target_modules, lora_alpha, lora_dropout, bias, use_gradient_checkpointing="unsloth", random_state, use_rslora, loftq_config)` | `unsloth` | Attach LoRA. Keep `lora_alpha / r >= 1`; `"unsloth"` checkpointing saves ~30% VRAM. |
| `SFTTrainer(model, tokenizer, train_dataset, dataset_text_field, max_seq_length, packing, args=SFTConfig(...))` | `trl` | SFT training. Some notebooks place `dataset_text_field` inside `SFTConfig` instead. |
| `SFTConfig(per_device_train_batch_size, gradient_accumulation_steps, learning_rate, num_train_epochs, weight_decay, optim, lr_scheduler_type, ...)` | `trl` | LoRA/QLoRA LR starts at `2e-4`; 1–3 epochs; effective batch = batch × accumulation. |
| `FastLanguageModel.for_inference(model)` | `unsloth` | Enable native 2x faster inference before `model.generate`. |
| `model.save_pretrained` / `save_pretrained_merged(..., save_method="merged_16bit"\|"merged_4bit")` / `save_pretrained_gguf(..., quantization_method=...)` / `push_to_hub_*` | `unsloth` | Save LoRA, merged model, or GGUF (local + HF hub). |
| `get_chat_template` / `standardize_sharegpt` / `standardize_data_formats` / `train_on_responses_only` / `add_new_tokens` | `unsloth.chat_templates` / `unsloth` | Template application, ShareGPT conversion, response-only masking, new special tokens (call `add_new_tokens` BEFORE `get_peft_model`). |
| `FastVisionModel.from_pretrained/get_peft_model/for_inference/for_training` + `UnslothVisionDataCollator` | `unsloth` | Vision/multimodal SFT — returns `(model, processor)`; the collator is mandatory (see `reference/vision.md`). |
| `FastSentenceTransformer.from_pretrained(..., for_inference=...)`, `save_pretrained_merged`, `push_to_hub_merged` | `unsloth` | Embedding/BERT/reranker fine-tuning (LoRA/QLoRA/FFT) (see `reference/embedding.md`). |
| `UnslothTrainer` / `UnslothTrainingArguments(embedding_learning_rate)` | `unsloth` | Continued pretraining: `embedding_learning_rate` 2–10x smaller than `learning_rate` (see `reference/pretraining.md`). |

## References

| Topic | File |
|---|---|
| Canonical SFT+LoRA loop: install → load → LoRA → data → train → infer → save (all three notebook variants) | `reference/sft-lora.md` |
| LoRA rank/alpha/dropout/target_modules, SFTConfig values, overfitting vs underfitting | `reference/hyperparameters.md` |
| Dataset formats (Alpaca/ShareGPT/ChatML/raw), size guidance, synthetic data, validation | `reference/datasets.md` |
| Install: pip/uv, Colab, Docker (NVIDIA/AMD), ROCm specifics | `reference/installation.md` |
| VRAM minimums per model size, platform support, OOM tips | `reference/requirements-vram.md` |
| Vision/multimodal SFT with FastVisionModel + UnslothVisionDataCollator | `reference/vision.md` |
| Embedding/BERT/reranker fine-tuning with FastSentenceTransformer | `reference/embedding.md` |
| MoE fine-tuning: backends, target modules, supported families | `reference/moe.md` |
| Multi-GPU: DDP via torchrun/accelerate, model splitting, CLI | `reference/multi-gpu.md` |
| Chat templates: supported list, ShareGPT conversion, custom templates, add_new_tokens | `reference/chat-templates.md` |
| Continued pretraining (CPT) setup + resuming from checkpoints | `reference/pretraining.md` |
| Packing (3-5x faster), padding-free default, 500K long-context, tiled MLP | `reference/long-context.md` |
| Environment flags, OOM, broken finetunes, early stopping | `reference/troubleshooting.md` |
| Unsloth's HF model catalog: families, sizes, MoE/vision flags | `reference/model-catalog.md` |

## Pitfalls

- **Missing EOS token → infinite generation.** Every formatted text (SFT and
  CPT) must end with `tokenizer.eos_token`; the notebooks flag this in-code
  because it is the #1 silent failure.
- **Only ONE training-method flag at a time.** Exactly one of
  `load_in_4bit` / `load_in_16bit` / `full_finetuning` / `load_in_8bit` may be
  `True` in `from_pretrained`.
- **Train and serve in the same precision.** Training and serving in the same
  precision helps preserve accuracy — if you plan to serve in 4-bit, train in
  4-bit.
- **OOM → raise `gradient_accumulation_steps`, not batch size.** Batch size is
  the primary VRAM driver; accumulation is the primary time driver. Keep
  `per_device_train_batch_size` at 1–3 and simulate a larger effective batch
  (Unsloth bug fixes make equivalent effective batch sizes fully equivalent —
  b1/g16, b2/g8, b4/g4 produce aligned loss curves).
- **Packing changes the loss.** `packing = True` is up to 5x faster for short
  sequences but changes the training loss and shrinks the row count (short
  sequences are packed together). Keep `packing = False` when you need loss
  numbers to match; padding-free batching is now automatic and loss-exact.
- **`weight_decay` divergence:** the guide recommends 0.01–0.1, while the
  official notebooks ship `0.001`. Either works; don't use large values —
  treat the notebook default as the baseline and the guide range as the
  overfitting remedy.
- **`dataset_text_field` placement varies by notebook:** on the `SFTTrainer`
  (Alpaca) or inside `SFTConfig` (Qwen3) — either is fine, but pick one and
  don't duplicate it.
- **Chat template mismatch breaks exported models.** A finetune that works in
  Unsloth but produces gibberish/repeats in Ollama/vLLM/llama.cpp is most
  commonly caused by using a different chat template at serving time. Use the
  same template for training AND inference, and prefer Unsloth's
  `get_chat_template` over the tokenizer's built-in one.
- **All labels `-100` (loss = 0):** `train_on_responses_only` used the wrong
  instruction/response markers for that model family. Use the per-family
  markers (Llama 3.x `<|start_header_id|>...`, Gemma 2/3 `<start_of_turn>...`)
  — see `reference/troubleshooting.md`.
- **`add_new_tokens` must run BEFORE `get_peft_model`** — adding special
  tokens after the LoRA is attached misses them.
- **MoE:** set `fast_inference = False` (vLLM not supported for MoE yet) and
  use transformers v5; 4-bit QLoRA is NOT recommended for MoE (BitsandBytes
  lacks support) — use bf16 LoRA/FFT with `load_in_4bit = False`. The router
  layer is disabled by default; MoE projections (`gate_up_proj`, `down_proj`)
  go into `target_modules`.
- **CPT needs three special moves:** disable CCE
  (`os.environ["UNSLOTH_RETURN_LOGITS"] = "1"`), add `embed_tokens` +
  `lm_head` to `target_modules`, and set `embedding_learning_rate` at least
  2x (up to 10x) smaller than `learning_rate` via `UnslothTrainer`.
- **Long context is slow:** expect ~40 minutes per step at 500K context;
  enable `unsloth_tiled_mlp = True` when OOMing at long lengths; resume with
  `trainer.train(resume_from_checkpoint = True)`.
- **Vision SFT has a mandatory `SFTConfig` block** (`remove_unused_columns =
  False`, `dataset_text_field = ""`,
  `dataset_kwargs = {"skip_prepare_dataset": True}`, `max_length`) plus
  `UnslothVisionDataCollator` — without it the collator won't work. Keep
  training images the same size (300–1000px).
- **`torch.compile` warm-up:** the first minutes are slow compilation; judge
  throughput only after it's done (`UNSLOTH_COMPILE_DISABLE=1` to debug).
- **Llama-3.x chat templates only work on instruct models** — a base Llama-3
  model with a chat-template finetune will not behave correctly.

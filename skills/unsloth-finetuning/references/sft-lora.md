# SFT + LoRA Walkthrough (canonical)

The complete supervised fine-tuning loop with Unsloth: load model → add LoRA → prepare
data → train with `SFTTrainer` → infer → save. All code is verbatim from the official
notebooks (`Llama3.1_(8B)-Alpaca`, `Llama3.2_(1B_and_3B)-Conversational`,
`Qwen3_(4B)-Instruct`).

- Hyperparameter rationale and recommended values: `hyperparameters.md`
- Dataset creation/formatting depth: `datasets.md`
- Install options (pip/Colab/Docker/AMD): `installation.md`
- VRAM planning: `requirements-vram.md`

## 1. Install

Local/cloud: `pip install unsloth` (Linux, WSL, Windows via WSL). Colab/notebook
environments use the full install cell — see `installation.md`. Version pins observed
in the official notebooks: `transformers==4.56.2`, `trl==0.22.2`, `torchao>=0.16.0`,
`datasets==4.3.0`.

## 2. Load the model

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

Newer notebooks (e.g. Qwen3 4B) additionally accept:

```python
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Qwen3-4B-Instruct-2507",
    load_in_4bit = True,  # 4 bit quantization to reduce memory
    load_in_8bit = False, # [NEW!] A bit more accurate, uses 2x memory
    full_finetuning = False, # [NEW!] We have full finetuning now!
    # token = "YOUR_HF_TOKEN", # HF Token for gated models
)
```

Argument notes:

- `max_seq_length` — context length; 2048 recommended for testing; Unsloth auto-supports
  RoPE scaling internally, so longer contexts work.
- `dtype = None` — auto detection; `torch.float16` for Tesla T4/V100, `torch.bfloat16` for Ampere+.
- `load_in_4bit = True` — QLoRA (4-bit base, ~4x less VRAM); `False` = 16-bit LoRA;
  `load_in_8bit` / `load_in_16bit` for 8-bit / 16-bit LoRA.
- `full_finetuning = True` — full fine-tuning (FFT). Only ONE training method flag may be `True`.
- `token` — HF token for gated models. Notebooks keep a `fourbit_models` list of
  pre-quantized 4-bit models (4x faster downloads, no OOMs); more at
  https://huggingface.co/unsloth.

### Model-name suffix conventions

- **`<name>-unsloth-bnb-4bit`** — Unsloth dynamic 4-bit quants. Slightly more VRAM than
  standard 4-bit, but significantly higher accuracy.
- **`<name>-bnb-4bit`** (no "unsloth") — standard BitsAndBytes 4-bit quantization.
- **No suffix** — original 16-bit or 8-bit. Unsloth's copies sometimes include important
  fixes (chat template / tokenizer fixes), so prefer them when available.

Research note: training and serving in the same precision helps preserve accuracy —
if you plan to serve in 4-bit, train in 4-bit.

## 3. Add LoRA adapters

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

- `r` — LoRA rank; notebook default 16 (Qwen3 4B notebook uses `r = 32`, `lora_alpha = 32`).
  See `hyperparameters.md` for when to raise it.
- `target_modules` — ALL major linear layers (attention + MLP); dropping modules saves
  little and hurts quality.
- `lora_alpha` — equal to `r` (baseline) or `2 * r` (more aggressive).
- `lora_dropout = 0` — optimized path; ~0.1 if you suspect overfitting.
- `use_gradient_checkpointing = "unsloth"` — 30% less VRAM, very long context.
- `random_state` — seed. `use_rslora` / `loftq_config` are advanced options.

## 4. Data prep — Alpaca style (single-turn, base models)

From the Llama3.1 (8B)-Alpaca notebook:

```python
alpaca_prompt = """Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.

### Instruction:
{}

### Input:
{}

### Response:
{}"""

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

**EOS_TOKEN requirement:** you MUST append `tokenizer.eos_token` to each tokenized text,
otherwise generations run forever.

## 5. Data prep — conversational / chat template (instruct models)

From the Llama3.2 (1B and 3B)-Conversational notebook (FineTome-100k, ShareGPT style):

```python
from unsloth.chat_templates import get_chat_template

tokenizer = get_chat_template(
    tokenizer,
    chat_template = "llama-3.1",
)

def formatting_prompts_func(examples):
    convos = examples["conversations"]
    texts = [tokenizer.apply_chat_template(convo, tokenize = False, add_generation_prompt = False) for convo in convos]
    return { "text" : texts, }

from datasets import load_dataset
dataset = load_dataset("mlabonne/FineTome-100k", split = "train")

# Convert ShareGPT style ({"from": ..., "value": ...}) to HF's generic multi-turn
# format ({"role": ..., "content": ...}), then apply the template:
from unsloth.chat_templates import standardize_sharegpt
dataset = standardize_sharegpt(dataset)
dataset = dataset.map(formatting_prompts_func, batched = True,)
```

Notes:

- `get_chat_template` names include `zephyr, chatml, mistral, llama, alpaca, vicuna,
  vicuna_old, phi3, llama3, phi4, qwen2.5, gemma3` and more. Prefer it over the
  tokenizer's own `apply_chat_template` — Unsloth checks/fixes templates for every
  quantized model it uploads.
- Llama 3.1 Instruct's default template injects a system message
  ("Cutting Knowledge Date: December 2023\nToday Date: 26 July 2024") — expected, not a bug.
- The Qwen3 4B notebook uses the newer auto-conversion helper
  `from unsloth.chat_templates import standardize_data_formats`
  (`dataset = standardize_data_formats(dataset)`) with `chat_template = "qwen3-instruct"`.

### Training on completions only (masking inputs)

The QLoRA paper shows masking out user inputs and training only on assistant
completions increases accuracy (especially for multi-turn conversational finetunes).
Unsloth auto-detects the instruction/response parts from the chat template, so the
notebooks just call:

```python
from unsloth.chat_templates import train_on_responses_only
trainer = train_on_responses_only(trainer)
```

Custom chat templates pass the parts explicitly — Llama 3.x:
`instruction_part = "<|start_header_id|>user<|end_header_id|>\n\n"`,
`response_part = "<|start_header_id|>assistant<|end_header_id|>\n\n"`; Gemma 2/3/3n:
`instruction_part = "<start_of_turn>user\n"`, `response_part = "<start_of_turn>model\n"`.
Verify masking by decoding `trainer.train_dataset[i]["labels"]` — masked positions are `-100`.

## 6. Train

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

- The conversational notebook adds `data_collator = DataCollatorForSeq2Seq(tokenizer = tokenizer)`.
- `max_steps = 60` is for the demo; for a full run set `num_train_epochs = 1` (1–3 epochs
  recommended) and drop `max_steps`. Resume with `trainer.train(resume_from_checkpoint = True)`.
- `eval_dataset` can be set on the trainer; the Qwen3 notebook places `dataset_text_field =
  "text"` inside `SFTConfig` instead of on the trainer.
- Loss around 0.5–1.0 is a good sign; loss going to 0 suggests overfitting.

## 7. Inference

Alpaca-style (Llama3.1 notebook):

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

Conversational (Llama3.2 notebook) — note `temperature = 1.5, min_p = 0.1`:

```python
FastLanguageModel.for_inference(model) # Enable native 2x faster inference

messages = [
    {"role": "user", "content": "Continue the fibonacci sequence: 1, 1, 2, 3, 5, 8,"},
]
inputs = tokenizer.apply_chat_template(
    messages,
    tokenize = True,
    add_generation_prompt = True, # Must add for generation
    return_tensors = "pt",
).to("cuda")

from transformers import TextStreamer
text_streamer = TextStreamer(tokenizer, skip_prompt = True)
_ = model.generate(input_ids = inputs, streamer = text_streamer, max_new_tokens = 128,
                   use_cache = True, temperature = 1.5, min_p = 0.1)
```

Qwen3 4B recommends `temperature = 0.7, top_p = 0.8, top_k = 20` for instruct
(non-thinking) inference, and `temperature = 0.6, top_p = 0.95, top_k = 20` for
reasoning chat inference.

Always call `FastLanguageModel.for_inference(model)` — Unsloth's native inference is
2x faster. Raise `max_new_tokens` (e.g. 256/1024) for longer outputs.

## 8. Saving and deploying

LoRA adapters (local + HF hub):

```python
model.save_pretrained("llama_lora")  # Local saving
tokenizer.save_pretrained("llama_lora")
# model.push_to_hub("your_name/llama_lora", token = "YOUR_HF_TOKEN") # Online saving
# tokenizer.push_to_hub("your_name/llama_lora", token = "YOUR_HF_TOKEN") # Online saving
```

Reload for inference (set `if False:` to `if True:`):

```python
if False:
    from unsloth import FastLanguageModel
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name = "llama_lora", # YOUR MODEL YOU USED FOR TRAINING
        max_seq_length = max_seq_length,
        dtype = dtype,
        load_in_4bit = load_in_4bit,
    )
    FastLanguageModel.for_inference(model)
```

Without Unsloth installed, `peft.AutoPeftModelForCausalLM.from_pretrained("llama_lora", load_in_4bit = load_in_4bit)` works but is hopelessly slow (no 4-bit download support).

Merged models (for vLLM etc.) — `merged_16bit` for float16, `merged_4bit` for int4:

```python
# Merge to 16bit
if False: model.save_pretrained_merged("llama_finetune_16bit", tokenizer, save_method = "merged_16bit",)
if False: model.push_to_hub_merged("HF_USERNAME/llama_finetune_16bit", tokenizer, save_method = "merged_16bit", token = "YOUR_HF_TOKEN")

# Merge to 4bit
if False: model.save_pretrained_merged("llama_finetune_4bit", tokenizer, save_method = "merged_4bit",)
if False: model.push_to_hub_merged("HF_USERNAME/llama_finetune_4bit", tokenizer, save_method = "merged_4bit", token = "YOUR_HF_TOKEN")
```

GGUF / llama.cpp — default save is `q8_0`; common methods: `q4_k_m` (recommended),
`q5_k_m` (recommended), `f16`. Deep GGUF detail (full quant list, Ollama export) is
covered by the GGUF/llama.cpp quantization skill — this is just the call surface:

```python
# Save to 8bit Q8_0 (default) or other quantizations
if False: model.save_pretrained_gguf("llama_finetune", tokenizer,)
if False: model.save_pretrained_gguf("llama_finetune", tokenizer, quantization_method = "f16")
if False: model.save_pretrained_gguf("llama_finetune", tokenizer, quantization_method = "q4_k_m")
if False: model.push_to_hub_gguf("HF_USERNAME/llama_finetune", tokenizer, token = "YOUR_HF_TOKEN")

# Save to multiple GGUF options - much faster if you want multiple!
if False:
    model.push_to_hub_gguf(
        "HF_USERNAME/llama_finetune", # Change hf to your username!
        tokenizer,
        quantization_method = ["q4_k_m", "q8_0", "q5_k_m",],
        token = "YOUR_HF_TOKEN",
    )
```

Source: https://unsloth.ai/docs/get-started/fine-tuning-llms-guide.md ;
https://unsloth.ai/docs/get-started/fine-tuning-llms-guide/lora-hyperparameters-guide.md ;
notebooks: https://github.com/unslothai/notebooks/blob/main/nb/Llama3.1_(8B)-Alpaca.ipynb ,
https://github.com/unslothai/notebooks/blob/main/nb/Llama3.2_(1B_and_3B)-Conversational.ipynb ,
https://github.com/unslothai/notebooks/blob/main/nb/Qwen3_(4B)-Instruct.ipynb (fetched 2026-09-26).

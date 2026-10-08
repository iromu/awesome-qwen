# Preference Alignment: DPO, ORPO & KTO

Walkthroughs for preference-based alignment with Unsloth + TRL. DPO, ORPO, KTO
(all and PPO/SimPO in general) work with Unsloth.

## When to pick which

| Method | Data shape | Reference model? | Notes |
|---|---|---|---|
| **DPO** | chosen/rejected pairs | no (`ref_model=None`) | Direct preference optimization; the standard choice for preference pairs. |
| **ORPO** | prompt/chosen/rejected | no | Odds-ratio preference optimization: penalizes rejected, increases likelihood of chosen, and folds the SFT objective into one step. |
| **KTO** | single good/bad label per response | no | For binary feedback without paired comparisons. |

If you can instead *verify* fresh generations, prefer GRPO — see
`references/grpo-basics.md`.

## DPO (Zephyr-7B notebook)

### Setup

```python
%%capture
import os, re
if "COLAB_" not in "".join(os.environ.keys()):
    !pip install unsloth  # Do this in local & cloud setups
# ...Colab-only extras elided...
!pip install transformers==4.56.2
!pip install --no-deps trl==0.22.2
```

### Load model + LoRA

**One must patch the DPO Trainer first!**

```python
from unsloth import PatchDPOTrainer
PatchDPOTrainer()

from unsloth import FastLanguageModel
import torch
max_seq_length = 4096 # Choose any! We auto support RoPE Scaling internally!
dtype = None # None for auto detection. Float16 for Tesla T4, V100, Bfloat16 for Ampere+
load_in_4bit = True # Use 4bit quantization to reduce memory usage. Can be False.

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/zephyr-sft-bnb-4bit", # Choose ANY!
    max_seq_length = max_seq_length,
    dtype = dtype,
    load_in_4bit = load_in_4bit,
)

model = FastLanguageModel.get_peft_model(
    model,
    r = 64, # Choose any number > 0 ! Suggested 8, 16, 32, 64, 128
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj",
                      "gate_proj", "up_proj", "down_proj",],
    lora_alpha = 64,
    lora_dropout = 0, # Currently only supports dropout = 0
    bias = "none",    # Currently only supports bias = "none"
    use_gradient_checkpointing = "unsloth",
    random_state = 3407,
    use_rslora = False,
    loftq_config = None,
)
```

### Data prep (Alignment Handbook pattern)

The notebook follows Hugging Face's Alignment Handbook on
`HuggingFaceH4/ultrafeedback_binarized` (sampled 0.5% for speed). Its
`apply_chat_template` helper (task `"dpo"`) builds `text_prompt`, `text_chosen`,
`text_rejected` from the `chosen`/`rejected` message lists, stripping the
assistant prefix so only the assistant turn is trained on. Then rename to what
TRL needs:

```python
raw_datasets = get_datasets(
    {"HuggingFaceH4/ultrafeedback_binarized" : 0.005}, # 0.5% sampled
    splits = ["train_prefs", "test_prefs"],
)
column_names = list(raw_datasets["train"].features)

raw_datasets = raw_datasets.map(
    apply_chat_template,
    fn_kwargs = {"tokenizer": tokenizer, "task": "dpo"},
    num_proc = 12,
    remove_columns = column_names,
    desc = "Formatting comparisons with prompt template",
)

# Replace column names with what TRL needs, text_chosen -> chosen and text_rejected -> rejected
for split in ["train", "test"]:
    raw_datasets[split] = raw_datasets[split].rename_columns(
        {"text_prompt": "prompt", "text_chosen": "chosen", "text_rejected": "rejected"}
    )
```

The end result per row: `prompt`, `chosen`, `rejected` (template-applied strings).

### Train

```python
from transformers import TrainingArguments
from trl import DPOTrainer, DPOConfig
dpo_trainer = DPOTrainer(
    model = model,
    ref_model = None,
    args = DPOConfig(
        per_device_train_batch_size = 2,
        gradient_accumulation_steps = 4,
        warmup_ratio = 0.1,
        num_train_epochs = 3,
        learning_rate = 5e-6,
        logging_steps = 1,
        optim = "adamw_8bit",
        weight_decay = 0.0,
        lr_scheduler_type = "linear",
        seed = 42,
        output_dir = "outputs",
        report_to = "none", # Use TrackIO/WandB etc
    ),
    beta = 0.1,
    train_dataset = raw_datasets["train"],
    # eval_dataset = raw_datasets["test"],
    tokenizer = tokenizer,
    max_length = 1024,
    max_prompt_length = 512,
)

dpo_trainer.train()
```

Notes: `beta = 0.1` is the notebook value; `ref_model = None` means the trainer
builds/derives the reference from the model (Unsloth patch handles the 4-bit
reference efficiently). The docs' compact DPO snippet also shows
`fp16 = not is_bfloat16_supported()` / `bf16 = is_bfloat16_supported()` from
`unsloth.is_bfloat16_supported`.

## ORPO (Llama-3-8B notebook)

### Data shape

ORPO expects at least 3 columns: `instruction`, `accepted`, `rejected` — then
mapped to the trainer keys `prompt`/`chosen`/`rejected`:

```python
alpaca_prompt = """Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.

### Instruction:
{}

### Input:
{}

### Response:
{}"""

EOS_TOKEN = tokenizer.eos_token # Must add EOS_TOKEN

def format_prompt(sample):
    instruction = sample["instruction"]
    input       = sample["input"]
    accepted    = sample["accepted"]
    rejected    = sample["rejected"]

    # ORPOTrainer expects prompt/chosen/rejected keys
    sample["prompt"]   = alpaca_prompt.format(instruction, input, "")
    sample["chosen"]   = accepted + EOS_TOKEN
    sample["rejected"] = rejected + EOS_TOKEN
    return sample

from datasets import load_dataset
dataset = load_dataset("reciperesearch/dolphin-sft-v0.1-preference")["train"]
dataset = dataset.map(format_prompt,)
```

The `reciperesearch/dolphin-sft-v0.1-preference` dataset was generated by
Mistral producing the "rejected" responses and GPT-4 producing the "accepted"
ones.

### Train

```python
from trl import ORPOConfig, ORPOTrainer
orpo_trainer = ORPOTrainer(
    model = model,
    train_dataset = dataset,
    tokenizer = tokenizer,
    args = ORPOConfig(
        max_length = max_seq_length,
        max_prompt_length = max_seq_length//2,
        max_completion_length = max_seq_length//2,
        per_device_train_batch_size = 2,
        gradient_accumulation_steps = 4,
        beta = 0.1,
        logging_steps = 1,
        optim = "adamw_8bit",
        lr_scheduler_type = "linear",
        max_steps = 30, # Change to num_train_epochs = 1 for full training runs
        output_dir = "outputs",
        report_to = "none",
    ),
)
orpo_trainer.train()
```

Call `PatchDPOTrainer()` before ORPO too (the notebook enables reward-modelling
stats that way). Model loading + LoRA mirrors the DPO notebook
(`r = 16`, `lora_alpha = 16`, `use_gradient_checkpointing = "unsloth"`).

## KTO

KTO (Kahneman-Tversky Optimization) trains from a single binary label per
response — no pairs needed. Use `KTOTrainer` from `trl` with
`PatchDPOTrainer()` applied first, the same `FastLanguageModel` load + LoRA
pattern, and a dataset with `prompt`/`completion`/`kto_tags` columns. Unsloth
publishes a KTO Colab notebook (linked from the preference docs page) to copy
from; the trainer API is standard TRL.

## Saving

All three produce LoRA adapters: `model.save_pretrained("lora_dir")` +
`tokenizer.save_pretrained("lora_dir")` (or `push_to_hub`). Merged 16-bit / 4-bit
saves use `save_pretrained_merged(..., save_method="merged_16bit"|"merged_4bit")`
— export details live in the `unsloth-quantization` skill.

---

Source: unsloth.ai/docs/get-started/reinforcement-learning-rl-guide/preference-dpo-orpo-and-kto.md (fetched 2026-09-26)
Source: https://github.com/unslothai/notebooks/blob/main/nb/Zephyr_(7B)-DPO
Source: https://github.com/unslothai/notebooks/blob/main/nb/Llama3_(8B)-ORPO

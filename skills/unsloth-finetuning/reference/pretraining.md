# Continued Pretraining (CPT) & Resuming Checkpoints

## What is continued pretraining?

CPT (continued / continual pretraining) "steers" a language model to understand
new domains of knowledge or out-of-distribution data — e.g. a new language, law,
medicine. Base models are pretrained on trillions of tokens (Llama-3 on 15
trillion) but are often under-trained on other languages or text domains. CPT
makes the model learn new tokens/datasets.

- The **text completion notebook** is for continued pretraining / raw text.
- The **continued pretraining notebook** is for learning another language.

## CPT setup (Mistral v0.3 7B example)

CPT trains on **raw text** (no QA / chat turns). Two key differences from
normal finetuning:

1. Disable the custom cross-entropy (CCE) since it isn't supported for CPT.
2. Add `embed_tokens` and `lm_head` to `target_modules`, and use a smaller
   `embedding_learning_rate`.

```python
%env UNSLOTH_RETURN_LOGITS = 1 # Run this to disable CCE since it is not supported for CPT

from unsloth import FastLanguageModel
import torch
max_seq_length = 2048 # Choose any! We auto support RoPE Scaling internally!
dtype = None # None for auto detection. Float16 for Tesla T4, V100, Bfloat16 for Ampere+
load_in_4bit = True

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/mistral-7b-v0.3",
    max_seq_length = max_seq_length,
    dtype = dtype,
    load_in_4bit = load_in_4bit,
)

model = FastLanguageModel.get_peft_model(
    model,
    r = 128, # Choose any number > 0 ! Suggested 8, 16, 32, 64, 128
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj",
                      "gate_proj", "up_proj", "down_proj",

                      "embed_tokens", "lm_head",], # Add for continual pretraining
    lora_alpha = 32,
    lora_dropout = 0, # Supports any, but = 0 is optimized
    bias = "none",
    use_gradient_checkpointing = "unsloth", # True or "unsloth" for very long context
    random_state = 3407,
    use_rslora = True,
    loftq_config = None,
)
```

### Dataset = raw text (no QA)

Format the raw text into a single `text` column and **add the EOS token** to
each row (otherwise you'll get infinite generations):

```python
EOS_TOKEN = tokenizer.eos_token # Must add EOS_TOKEN
def formatting_prompts_func(examples):
    titles = examples["title"]
    texts  = examples["text"]
    outputs = []
    for title, text in zip(titles, texts):
        # Must add EOS_TOKEN, otherwise your generation will go on forever!
        text = wikipedia_prompt.format(title, text) + EOS_TOKEN
        outputs.append(text)
    return { "text" : outputs, }

from datasets import load_dataset
dataset = load_dataset("wikimedia/wikipedia", "20231101.ko", split = "train",)
dataset = dataset.train_test_split(train_size = 0.01)["train"]
dataset = dataset.map(formatting_prompts_func, batched = True,)
```

### Hyperparameters: smaller embedding LR

Use `UnslothTrainer` / `UnslothTrainingArguments` and set
`embedding_learning_rate` to at least 2x (up to 10x) smaller than
`learning_rate` so CPT works:

```python
from transformers import TrainingArguments
from unsloth import UnslothTrainer, UnslothTrainingArguments

trainer = UnslothTrainer(
    model = model,
    tokenizer = tokenizer,
    train_dataset = dataset,
    dataset_text_field = "text",
    max_seq_length = max_seq_length,
    dataset_num_proc = 4,

    args = UnslothTrainingArguments(
        per_device_train_batch_size = 2,
        gradient_accumulation_steps = 8,

        # Use warmup_ratio and num_train_epochs for longer runs!
        max_steps = 120,
        warmup_steps = 10,

        # Select a 2 to 10x smaller learning rate for the embedding matrices!
        learning_rate = 5e-5,
        embedding_learning_rate = 1e-5,

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

You can then follow with an **instruction finetuning** stage on a translated
Alpaca dataset using the same `UnslothTrainer` setup.

## Loading LoRA adapters for continued finetuning

If you saved a LoRA adapter through Unsloth, continue training from it (the
optimizer state is reset):

```python
from unsloth import FastLanguageModel
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "LORA_MODEL_NAME",
    max_seq_length = max_seq_length,
    dtype = dtype,
    load_in_4bit = load_in_4bit,
)
trainer = Trainer(...)
trainer.train()
```

## Finetuning from last checkpoint

Checkpointing saves finetuning progress so you can pause and continue. First
edit the `Trainer` to add `save_strategy` and `save_steps` (saves a checkpoint
every 50 steps to `outputs`):

```python
trainer = SFTTrainer(
    ....
    args = TrainingArguments(
        ....
        output_dir = "outputs",
        save_strategy = "steps",
        save_steps = 50,
    ),
)
```

Then resume from the latest checkpoint:

```python
trainer_stats = trainer.train(resume_from_checkpoint = True)
```

### Wandb integration

```
# Install library
!pip install wandb --upgrade

# Setting up Wandb
!wandb login <token>

import os

os.environ["WANDB_PROJECT"] = "<name>"
os.environ["WANDB_LOG_MODEL"] = "checkpoint"
```

In `TrainingArguments()`: `report_to = "wandb"`, `logging_steps = 1`,
`save_steps = 100`, optional `run_name = "<name>"`. To train: `trainer.train()`;
to resume from a Wandb artifact:

```
import wandb
run = wandb.init()
artifact = run.use_artifact('<username>/<Wandb-project-name>/<run-id>', type='model')
artifact_dir = artifact.download()
trainer.train(resume_from_checkpoint=artifact_dir)
```

Source: https://unsloth.ai/docs/basics/continued-pretraining.md,
https://github.com/unslothai/notebooks/blob/main/nb/Mistral_v0.3_(7B)-CPT.ipynb,
and https://unsloth.ai/docs/basics/finetuning-from-last-checkpoint.md (fetched 2026-09-26).

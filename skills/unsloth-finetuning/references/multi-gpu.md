# Multi-GPU Fine-tuning

Unsloth supports multi-GPU setups through Accelerate and DeepSpeed, so you can
use parallelism methods such as **FSDP** and **DDP**.

## When to use which

- **DDP (Distributed Data Parallel)** — the straightforward strategy when you
  have multiple GPUs and want to scale throughput. Creates one copy of the
  model on each GPU, feeds each copy distinct samples, and aggregates
  contributions to weight updates per optimizer step. More GPUs = more samples
  per step = more stable gradients + ~linearly increasing throughput. Use DDP
  when each GPU can hold a full copy of the model.
- **Pipeline / model splitting** — when a single GPU can't hold the model (e.g.
  Llama 70B). Unsloth splits the model across GPUs with `device_map =
  "balanced"`.

## Enable multi-GPU (DDP)

1. Create your training script as `train.py` (or use one of Unsloth's
   [training scripts](https://github.com/unslothai/notebooks/tree/main/python_scripts)
   created from the notebooks).
2. Run either:

```bash
accelerate launch train.py
torchrun --nproc_per_node N_GPUS train.py   # N_GPUS = number of GPUs you have
```

## Pipeline / model-splitting load

If one GPU can't fit the model, split it across GPUs:

```python
from unsloth import FastLanguageModel
model, tokenizer = FastLanguageModel.from_pretrained(
    "unsloth/Llama-3.3-70B-Instruct",
    load_in_4bit = True,
    device_map = "balanced",
)
```

## DDP via the Unsloth CLI

The Unsloth CLI (`unsloth-cli.py`) drives DDP fine-tuning. Install from source:

```bash
git clone https://github.com/unslothai/unsloth.git
cd unsloth
pip install .
```

CLI options include `--model_name`, `--max_seq_length`, `--dtype`,
`--load_in_4bit`, `--dataset`, `--r`, `--lora_alpha`, `--lora_dropout`,
`--bias`, `--use_gradient_checkpointing`, `--per_device_train_batch_size`,
`--per_device_eval_batch_size`, `--gradient_accumulation_steps`,
`--learning_rate`, `--max_steps`, and `--save_model`.

Use the `torchrun` launcher (single-node example with 2 H100 GPUs, fine-tuning
Qwen/Qwen3-8B on yahma/alpaca-cleaned):

```bash
# required:
#   --model_name
#   --dataset
# optional; experiment with these:
#   --learning_rate, --max_seq_length, --per_device_train_batch_size, --gradient_accumulation_steps, --max_steps
# to save the model at the end of training:
#   --save_model

torchrun --nproc_per_node=2 unsloth-cli.py \
  --model_name=Qwen/Qwen3-8B \
  --dataset=yahma/alpaca-cleaned \
  --learning_rate=2e-5 \
  --max_seq_length=2048 \
  --per_device_train_batch_size=1 \
  --gradient_accumulation_steps=4 \
  --max_steps=1000 \
  --save_model
```

Set `--nproc_per_node` to the number of GPUs you have. **DDP auto-enables when
training with >1 GPU**, and the `torchrun` launcher works with any Unsloth
training script (including the notebook-derived scripts).

## What you'll observe

- Each GPU holds ~its own copy (e.g. ~19GB per H100 in the demo).
- Training speed is ~constant per step even as GPUs are added, so throughput
  scales ~linearly with GPU count (with a small, growing penalty for
  distributed communication of weight updates).
- Multi-GPU DDP processes twice as much training data per step as single-GPU,
  so it completes an epoch in half as many steps; the loss curve matches in
  scale/trend but with less step-to-step variability. The same behavior holds
  for QLoRA (4-bit base models) fine-tunes.

Source: https://unsloth.ai/docs/basics/multi-gpu-training-with-unsloth.md and
https://unsloth.ai/docs/basics/multi-gpu-training-with-unsloth/ddp.md (fetched 2026-09-26).

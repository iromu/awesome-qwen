# Vision RL (VLM GRPO / GSPO)

Train vision-language models (Qwen3-VL, Gemma 3, Qwen2.5-VL) with GRPO/GSPO via
Unsloth's `FastVisionModel`. Unsloth makes VLM RL 1.5–2x faster, 90% less VRAM,
and ~15x longer context than FA2 setups. Qwen3-VL-8B can be trained on a free
Colab T4.

## Install pins (vision notebooks)

```
transformers==4.57.0
trl==0.26.2
```

(the text RL notebooks pin `transformers==4.56.2` + `trl==0.22.2` — vision
notebooks are newer).

## Load the model

```python
from unsloth import FastVisionModel
import torch
max_seq_length = 16384 # Must be this long for VLMs
lora_rank = 16 # Larger rank = smarter, but slower

model, tokenizer = FastVisionModel.from_pretrained(
    model_name = "unsloth/Qwen3-VL-8B-Instruct-unsloth-bnb-4bit",
    max_seq_length = max_seq_length,
    load_in_4bit = True, # False for LoRA 16bit
    fast_inference = False, # Enable vLLM fast inference
    gpu_memory_utilization = 0.8, # Reduce if out of memory
)
```

Key constraints:
- vLLM does not yet support LoRA on the vision layers, so LoRA is added on the
  language layers only (`finetune_vision_layers = False`). Vision GRPO still
  works. You *can* train vision layers too if you use transformers/Unsloth
  inference (`fast_inference = False`).
- Unsloth shares vLLM's weights directly (>50% VRAM reduction when vLLM is on).
- Only vLLM-supported VLMs can use `fast_inference` (e.g. Qwen3-VL, Qwen2.5-VL);
  others (Llama 3.2 Vision) run without vLLM.

```python
model = FastVisionModel.get_peft_model(
    model,
    finetune_vision_layers     = False, # False if not finetuning vision layers
    finetune_language_layers   = True,  # False if not finetuning language layers
    finetune_attention_modules = True,  # False if not finetuning attention layers
    finetune_mlp_modules       = True,  # False if not finetuning MLP layers

    r = 16,           # The larger, the higher the accuracy, but might overfit
    lora_alpha = 16,  # Recommended alpha == r at least
    lora_dropout = 0,
    bias = "none",
    random_state = 3407,
    use_rslora = False,
    loftq_config = None,
    use_gradient_checkpointing = "unsloth",
)
```

## Data prep (AI4Math/MathVista)

```python
from datasets import load_dataset
dataset = load_dataset("AI4Math/MathVista", split = "testmini")

def is_numeric_answer(example):
    try:
        float(example["answer"])
        return True
    except:
        return False
dataset = dataset.filter(is_numeric_answer)

# Resize to (512, 512)
def resize_images(example):
    image = example["decoded_image"]
    image = image.resize((512, 512))
    example["decoded_image"] = image
    return example
dataset = dataset.map(resize_images)

# Then convert to RGB
def convert_to_rgb(example):
    image = example["decoded_image"]
    if image.mode != "RGB":
        image = image.convert("RGB")
    example["decoded_image"] = image
    return example
dataset = dataset.map(convert_to_rgb)

REASONING_START = "<REASONING>"
REASONING_END = "</REASONING>"
SOLUTION_START = "<SOLUTION>"
SOLUTION_END = "</SOLUTION>"

def make_conversation(example):
    text_content = (
        f"{example['question']}. Also first provide your reasoning or working out"\
        f" on how you would go about solving the question between {REASONING_START} and {REASONING_END}"
        f" and then your final answer between {SOLUTION_START} and (put a single float here) {SOLUTION_END}"
    )
    prompt = [
        {
            "role": "user",
            "content": [
                {"type": "image"},  # Placeholder for the image
                {"type": "text", "text": text_content},
            ],
        },
    ]
    return {"prompt": prompt, "image": example["decoded_image"], "answer": example["answer"]}

train_dataset = dataset.map(make_conversation)
# The "image": example["decoded_image"] does not properly format the dataset correctly
train_dataset = train_dataset.remove_columns("image")
train_dataset = train_dataset.rename_column("decoded_image", "image")
```

## Reward functions (incl. gibberish penalty)

```python
import re

def formatting_reward_func(completions, **kwargs):
    thinking_pattern = f'{REASONING_START}(.*?){REASONING_END}'
    answer_pattern = f'{SOLUTION_START}(.*?){SOLUTION_END}'

    scores = []
    for completion in completions:
        if isinstance(completion, list):
            completion = completion[0]["content"] if completion else ""
        score = 0
        thinking_matches = re.findall(thinking_pattern, completion, re.DOTALL)
        answer_matches = re.findall(answer_pattern, completion, re.DOTALL)
        if len(thinking_matches) == 1:
            score += 1.0
        if len(answer_matches) == 1:
            score += 1.0

        # Fix up addCriterion issues
        # Penalize on excessive addCriterion and newlines
        if len(completion) != 0:
            removal = completion.replace("addCriterion", "").replace("\n", "")
            if (len(completion)-len(removal))/len(completion) >= 0.5:
                score -= 2.0

        scores.append(score)
    return scores

def correctness_reward_func(prompts, completions, answer, **kwargs) -> list[float]:
    answer_pattern = f'{SOLUTION_START}(.*?){SOLUTION_END}'

    completions = [(c[0]["content"] if c else "") if isinstance(c, list) else c for c in completions]
    responses = [re.findall(answer_pattern, completion, re.DOTALL) for completion in completions]
    q = prompts[0]
    print('-'*20, f"Question:\n{q}", f"\nAnswer:\n{answer[0]}", f"\nResponse:{completions[0]}")
    return [
        2.0 if len(r)==1 and a == r[0].replace('\n','') else 0.0
        for r, a in zip(responses, answer)
    ]
```

## Train (with GSPO enabled)

```python
from trl import GRPOConfig, GRPOTrainer
training_args = GRPOConfig(
    learning_rate = 5e-6,
    adam_beta1 = 0.9,
    adam_beta2 = 0.99,
    weight_decay = 0.1,
    warmup_ratio = 0.1,
    lr_scheduler_type = "cosine",
    optim = "adamw_8bit",
    logging_steps = 1,
    log_completions = False,
    per_device_train_batch_size = 1,
    gradient_accumulation_steps = 1, # Increase to 4 for smoother training
    num_generations = 2, # Decrease if out of memory
    max_prompt_length = 1024,
    max_completion_length = 1024,
    num_train_epochs = 0.5, # Set to 1 for a full training run
    save_steps = 60,
    max_grad_norm = 0.1,
    report_to = "none",
    output_dir = "outputs",

    # Below enables GSPO:
    importance_sampling_level = "sequence",
    mask_truncated_completions = False,
    loss_type = "dr_grpo",
)

trainer = GRPOTrainer(
    model = model,
    args = training_args,
    processing_class = tokenizer, # Pass the processor to handle multimodal inputs
    reward_funcs = [
        formatting_reward_func,
        correctness_reward_func,
    ],
    train_dataset = train_dataset,
)
trainer.train()
```

## Inference

```python
image = train_dataset[165]["image"]
prompt = train_dataset[165]["prompt"]

inputs = tokenizer(
    image,
    prompt,
    add_special_tokens = False,
    return_tensors = "pt",
).to("cuda")

from transformers import TextStreamer
text_streamer = TextStreamer(tokenizer, skip_prompt = True)
_ = model.generate(**inputs, streamer = text_streamer, max_new_tokens = 1024,
                   use_cache = True, temperature = 1.0, min_p = 0.1)
```

## Quirks

- **Qwen2.5-VL `addCriterion` gibberish**: during/after RL, Qwen2.5-VL may emit
  repeated `addCriterion` / gibberish (a known upstream issue, reported for
  Qwen2.5-VL-7B-Instruct). It's inherent to the model — counters: (1) a reward
  function that penalizes excessive `addCriterion`/newlines (shown above),
  (2) forcing `<|assistant|>` during generation, (3) training longer — the
  notebook only sees real learning after ~60 steps.
- Gemma 3 VLM RL requires newer GPUs than T4 (vLLM restricts Gemma to Bfloat16);
  use an L4 on Colab.

## Saving

```python
model.save_pretrained("grpo_lora")  # Local saving
tokenizer.save_pretrained("grpo_lora")
# model.push_to_hub("your_name/grpo_lora", token = "...")
```

Then verify the LoRA actually trained (adapter tensors non-zero) and merge with
`save_pretrained_merged` / `push_to_hub_gguf` as in the text notebooks.

---

Source: unsloth.ai/docs/get-started/reinforcement-learning-rl-guide/vision-reinforcement-learning-vlm-rl.md (fetched 2026-09-26)
Source: https://github.com/unslothai/notebooks/blob/main/nb/Qwen3_VL_(8B)-Vision-GRPO

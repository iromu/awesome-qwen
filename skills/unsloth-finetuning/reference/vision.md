# Vision / Multimodal Fine-tuning

Fine-tune vision/multimodal LLMs (VLMs) with Unsloth. Use `FastVisionModel`
(instead of `FastLanguageModel`) for image+text models.

Supported families (from the docs + 4-bit uploads): Qwen3-VL, Qwen2.5-VL /
Qwen2-VL, Llama 3.2 Vision (11B/90B), Gemma 3 (4B) Vision, Ministral 3 /
Pixtral 12B, LLaVA (1.5 / v1.6-mistral-7b). A free RL path exists for VLMs.

Tip: keep all training images the same size/dimensions; use 300-1000px so
training doesn't take too long or use too many resources.

## Load model

```python
from unsloth import FastVisionModel # FastLanguageModel for LLMs
import torch

model, processor = FastVisionModel.from_pretrained(
    "unsloth/gemma-3-4b-pt",
    load_in_4bit = True, # Use 4bit to reduce memory use. False for 16bit LoRA.
    use_gradient_checkpointing = "unsloth", # True or "unsloth" for long context
)
```

Note the return is `(model, processor)` — the processor handles images + text.

## Add LoRA (vision-specific target modules)

You can select which parts to fine-tune: vision layers, language layers,
attention modules, and/or MLP layers (all on by default).

```python
model = FastVisionModel.get_peft_model(
    model,
    finetune_vision_layers     = True, # False if not finetuning vision layers
    finetune_language_layers   = True, # False if not finetuning language layers
    finetune_attention_modules = True, # False if not finetuning attention layers
    finetune_mlp_modules       = True, # False if not finetuning MLP layers

    r = 16,                           # The larger, the higher the accuracy, but might overfit
    lora_alpha = 16,                  # Recommended alpha == r at least
    lora_dropout = 0,
    bias = "none",
    random_state = 3407,
    use_rslora = False,               # We support rank stabilized LoRA
    loftq_config = None,              # And LoftQ
    target_modules = "all-linear",    # Optional now! Can specify a list if needed
)
```

## Dataset format

Vision datasets are QA pairs that also carry image inputs. Each sample is a
list of `{"role", "content"}` turns, where the user turn's `content` is a list
mixing `{"type": "text", "text": ...}` and `{"type": "image", "image": ...}`:

```python
[
{ "role": "user",
  "content": [{"type": "text",  "text": instruction}, {"type": "image", "image": image} ]
},
{ "role": "assistant",
  "content": [{"type": "text",  "text": answer} ]
},
]
```

Convert the raw dataset into this shape:

```python
instruction = "You are an expert radiographer. Describe accurately what you see in this image."

def convert_to_conversation(sample):
    conversation = [
        { "role": "user",
          "content" : [
            {"type" : "text",  "text"  : instruction},
            {"type" : "image", "image" : sample["image"]} ]
        },
        { "role" : "assistant",
          "content" : [
            {"type" : "text",  "text"  : sample["caption"]} ]
        },
    ]
    return { "messages" : conversation }

converted_dataset = [convert_to_conversation(sample) for sample in dataset]
```

Prefer a plain list comprehension over `ds.map(convert_to_conversation)` —
`map` triggers dataset standardization/arrow processing that can be strict and
complicated. This is also the change needed for **multi-image** training.

## Chat template

A base (pretrained) vision model has not seen the instruct chat template, so
apply it before training/inference:

```python
from unsloth import get_chat_template

processor = get_chat_template(
    processor,
    "gemma-3"
)
```

## Train (SFTTrainer + UnslothVisionDataCollator)

Vision fine-tuning requires the dedicated `UnslothVisionDataCollator` plus a
few mandatory `SFTConfig` items.

```python
from unsloth.trainer import UnslothVisionDataCollator
from trl import SFTTrainer, SFTConfig

FastVisionModel.for_training(model) # Enable for training!

trainer = SFTTrainer(
    model = model,
    train_dataset = converted_dataset,
    processing_class = processor.tokenizer,
    data_collator = UnslothVisionDataCollator(model, processor),
    args = SFTConfig(
        per_device_train_batch_size = 1,
        gradient_accumulation_steps = 4,
        gradient_checkpointing = True,
        gradient_checkpointing_kwargs = {"use_reentrant": False},
        max_grad_norm = 0.3,              # max gradient norm based on QLoRA paper
        warmup_ratio = 0.03,
        max_steps = 30,
        #num_train_epochs = 2,          # Set this instead of max_steps for full training runs
        learning_rate = 2e-4,
        logging_steps = 1,
        save_strategy = "steps",
        optim = "adamw_torch_fused",
        weight_decay = 0.001,
        lr_scheduler_type = "cosine",
        seed = 3407,
        output_dir = "outputs",
        report_to = "none",             # For Weights and Biases

        # You MUST put the below items for vision finetuning:
        remove_unused_columns = False,
        dataset_text_field = "",
        dataset_kwargs = {"skip_prepare_dataset": True},
        max_length = 2048,
    )
)

trainer_stats = trainer.train()
```

The `# You MUST put the below items for vision finetuning` block
(`remove_unused_columns = False`, `dataset_text_field = ""`,
`dataset_kwargs = {"skip_prepare_dataset": True}`, `max_length`) is required —
without it the vision data collator won't work.

### UnslothVisionDataCollator arguments

```python
# UnslothVisionDataCollator constructor signature
UnslothVisionDataCollator(
    model,
    processor,
    max_seq_length  = None, # [Optional] We auto get this from `FastVisionModel.from_pretrained(max_seq_length = ...)`
    formatting_func = None, # Function for transforming the text
    resize = "min", # Can be (10, 10) or "min" to resize to fit the model's default image_size or "max"
                    # for no resizing and leave image intact
    ignore_index = -100, # [Optional] Default is -100
    train_on_responses_only = False, # EQUIVALENT to train_on_responses_only for LLMs
    instruction_part = None, # EQUIVALENT to train_on_responses_only(instruction_part = ...)
    response_part    = None, # EQUIVALENT to train_on_responses_only(response_part = ...)
    force_match      = True, # Match newlines as well!
    num_proc         = None, # [Optional] Will auto select number of GPUs
    completion_only_loss = True, # [Optional] Ignores padding vision tokens - should always be True!
    pad_to_multiple_of = None, # [Optional] For data collator padding
    resize_dimension = 0, # can be 0, 1, 'max' or 'min'
    snap_to_patch_size = False, # [Optional] Force image to be a multiple of the patch size
)
```

### Train on assistant responses only (VLMs)

For vision models, use the collator's args instead of the LLM
`train_on_responses_only` helper. Example for Llama 3.2 Vision:

```python
UnslothVisionDataCollator(
    model, tokenizer,
    ...
    train_on_responses_only = True,
    instruction_part = "<|start_header_id|>user<|end_header_id|>\n\n",
    response_part = "<|start_header_id|>assistant<|end_header_id|>\n\n",
    ...
)
```

## Inference with images

Toggle inference mode, build messages, apply the chat template, then run the
processor over the image + text:

```python
FastVisionModel.for_inference(model)  # Enable for inference!

image = dataset[2]["image"]
instruction = "Write the LaTeX representation for this image."

messages = [
    {
        "role": "user",
        "content": [{"type": "image"}, {"type": "text", "text": instruction}],
    }
]

input_text = processor.apply_chat_template(messages, add_generation_prompt = True)
inputs = processor(
    image,
    input_text,
    add_special_tokens = False,
    return_tensors = "pt",
).to("cuda")

from transformers import TextStreamer

text_streamer = TextStreamer(processor, skip_prompt = True)
result = model.generate(**inputs, streamer = text_streamer, max_new_tokens = 128,
                        use_cache = True, temperature = 1.0, top_p = 0.95, top_k = 64)
```

Gemma inference hyperparameters: `top_p=0.95`, `top_k=64`, `temperature=1.0`.

## Saving

LoRA adapters only (not the full model):

```python
model.save_pretrained("gemma_3_lora")  # Local saving
processor.save_pretrained("gemma_3_lora")
# model.push_to_hub("your_name/gemma_3_lora", token = "YOUR_HF_TOKEN") # Online saving
# processor.push_to_hub("your_name/gemma_3_lora", token = "YOUR_HF_TOKEN") # Online saving
```

Load the saved LoRA for inference:

```python
model, processor = FastVisionModel.from_pretrained(
    model_name = "gemma_3_lora",  # YOUR MODEL YOU USED FOR TRAINING
    load_in_4bit = True,  # Set to False for 16bit LoRA
)
FastVisionModel.for_inference(model)  # Enable for inference!
```

Save to float16 for vLLM:

```python
# Save locally to 16bit
if False: model.save_pretrained_merged("unsloth_finetune", processor,)

# To export and save to your Hugging Face account
if False: model.push_to_hub_merged("YOUR_USERNAME/unsloth_finetune", processor, token = "YOUR_HF_TOKEN")
```

Source: https://unsloth.ai/docs/basics/vision-fine-tuning.md and
https://github.com/unslothai/notebooks/blob/main/nb/Gemma3_(4B)-Vision.ipynb (fetched 2026-09-26).

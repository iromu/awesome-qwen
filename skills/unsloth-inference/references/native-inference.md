# Native Unsloth Inference (FastLanguageModel)

Sources: `pages/basics/inference-and-deployment/unsloth-inference.md`,
`nb_code/Llama3.1_(8B)-Inference.txt`, `nb_code/Llama3_(8B)-Ollama.txt`
(unsloth.ai/docs + unslothai/notebooks main branch, 2026-09-26).

Unsloth supports **natively 2x faster inference** for QLoRA, LoRA, and non-LoRA paths.
No code changes and no new dependencies.

## Install (notebook pin pattern)

```python
!pip install unsloth
!pip install transformers==4.56.2
!pip install --no-deps trl==0.22.2
```

(Colab-only extras: `unsloth_zoo bitsandbytes accelerate peft trl triton`,
`torchao>=0.16.0`, matched `xformers`.)

## Load + generate (from the Inference notebook)

```python
from unsloth import FastLanguageModel
from transformers import TextStreamer
from unsloth.chat_templates import get_chat_template

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Llama-3.1-8B-Instruct",
    max_seq_length = 8192,
    load_in_4bit = True,
    # token = "YOUR_HF_TOKEN",  # HF Token for gated models
)
tokenizer = get_chat_template(
    tokenizer,
    chat_template = "llama-3.1",
    mapping = {"role": "from", "content": "value", "user": "human", "assistant": "gpt"},  # ShareGPT style
)
FastLanguageModel.for_inference(model)  # Enable native 2x faster inference

messages = [
    {"from": "human", "value": "Continue the fibonacci sequence: 1, 1, 2, 3, 5, 8,"},
]
inputs = tokenizer.apply_chat_template(messages, tokenize = True,
                                       add_generation_prompt = True, return_tensors = "pt").to("cuda")
text_streamer = TextStreamer(tokenizer)
_ = model.generate(input_ids = inputs, streamer = text_streamer, max_new_tokens = 1024, use_cache = True)
```

`from_pretrained` arguments seen in the notebooks: `model_name`, `max_seq_length`,
`dtype` (`None` for auto; Float16 for T4/V100, Bfloat16 for Ampere+), `load_in_4bit`,
`token`. 4-bit pre-quantized `unsloth/*-bnb-4bit` repos download 4x faster and avoid
OOMs.

## OpenAI-style messages + multi-turn (from the Ollama notebook)

```python
messages = [
    {"role": "user", "content": "Continue the fibonacci sequence! Your input is 1, 1, 2, 3, 5, 8,"},
]
input_ids = tokenizer.apply_chat_template(
    messages, add_generation_prompt = True, return_tensors = "pt",
).to("cuda")

from transformers import TextStreamer
text_streamer = TextStreamer(tokenizer, skip_prompt = True)
_ = model.generate(input_ids, streamer = text_streamer, max_new_tokens = 128,
                   pad_token_id = tokenizer.eos_token_id)
```

Longer conversations: manually alternate `user` / `assistant` messages before
templating (the notebook's second inference cell does exactly this). Use prompts
similar to what the model was fine-tuned on.

## Loading saved LoRA adapters

```python
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "llama_lora",   # YOUR MODEL YOU USED FOR TRAINING
    max_seq_length = max_seq_length,
    dtype = dtype,
    load_in_4bit = load_in_4bit,
)
FastLanguageModel.for_inference(model)  # Enable native 2x faster inference
```

Fallback **only if Unsloth isn't installed** (hopelessly slow — no 4-bit download
support, and no 2x inference):

```python
from peft import AutoPeftModelForCausalLM
from transformers import AutoTokenizer
model = AutoPeftModelForCausalLM.from_pretrained("llama_lora", load_in_4bit = load_in_4bit)
tokenizer = AutoTokenizer.from_pretrained("llama_lora")
```

## Saving for inference engines (hand-off only)

```python
# LoRA adapters only:
model.save_pretrained("llama_lora")
tokenizer.save_pretrained("llama_lora")
# model.push_to_hub("your_name/llama_lora", token = "YOUR_HF_TOKEN")

# merged 16-bit (vLLM/SGLang):
model.save_pretrained_merged("finetuned_model", tokenizer, save_method = "merged_16bit")
# LoRA-only merged:
model.save_pretrained_merged("finetuned_model", tokenizer, save_method = "lora")
# GGUF (Ollama/llama.cpp/LM Studio):
model.save_pretrained_gguf("llama_finetune", tokenizer)
```

Deep quantization/export guidance → `unsloth-quantization` skill.

## Gotchas

- **Colab UTF-8 locale error** — "NotImplementedError: A UTF-8 locale is required. Got
  ANSI": in a new cell run
  `import locale; locale.getpreferredencoding = lambda: "UTF-8"`.
- **Saving to GGUF or vLLM 16-bit crashes (OOM)** — lower
  `maximum_memory_usage` (default 0.75; try 0.5) in the save call.
- **Colab saves `.bin` by default** (4x faster); force `.safetensors` with
  `safe_serialization = None` in `save_pretrained` / `push_to_hub`.
- **Poor results after export** (Ollama/vLLM/LM Studio) — chat template mismatch, wrong
  `eos` token, or start-of-sequence token handling. Use the same template as training;
  conversational notebooks force it.

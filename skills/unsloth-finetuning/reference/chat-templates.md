# Chat Templates

Chat templates define how messages are formatted into the token stream. Unsloth
ships templates for Llama, Mistral, Phi-4, Gemma, Qwen, etc. — the full list
lives in `unsloth/chat_templates.py` on GitHub.

Common formats: **Conversational**, **ChatML**, **ShareGPT**, **Alpaca**,
**Ollama**, plus text classification.

## Inspecting supported templates

```python
from unsloth.chat_templates import CHAT_TEMPLATES
print(list(CHAT_TEMPLATES.keys()))
```

Example output:

```
['unsloth', 'zephyr', 'chatml', 'mistral', 'llama', 'vicuna', 'vicuna_old', 'vicuna old',
 'alpaca', 'gemma', 'gemma_chatml', 'gemma2', 'gemma2_chatml', 'llama-3', 'llama3',
 'phi-3', 'phi-35', 'phi-3.5', 'llama-3.1', 'llama-31', 'llama-3.2', 'llama-3.3',
 'llama-32', 'llama-33', 'qwen-2.5', 'qwen-25', 'qwen25', 'qwen2.5', 'phi-4',
 'gemma-3', 'gemma3']
```

## Applying a template

```python
from unsloth.chat_templates import get_chat_template

tokenizer = get_chat_template(
    tokenizer,
    chat_template = "gemma-3", # change this to the right chat_template name
)
```

Then define a formatting function that applies the template to each sample, and
map it over the dataset:

```python
def formatting_prompts_func(examples):
    convos = examples["conversations"]
    texts = [tokenizer.apply_chat_template(convo, tokenize = False, add_generation_prompt = False) for convo in convos]
    return { "text" : texts, }

from datasets import load_dataset
dataset = load_dataset("repo_name/dataset_name", split = "train")
dataset = dataset.map(formatting_prompts_func, batched = True,)
```

## ShareGPT ("from"/"value") datasets

If the dataset uses ShareGPT keys instead of ChatML "role"/"content", convert
first with `standardize_sharegpt`, or map keys via the `mapping` argument:

```python
# Convert your dataset to the "role"/"content" format if necessary
from unsloth.chat_templates import standardize_sharegpt
dataset = standardize_sharegpt(dataset)
dataset = dataset.map(formatting_prompts_func, batched = True,)
```

Or map keys directly (ShareGPT style); `map_eos_token=True` maps the end-of-turn
token to EOS without any training:

```python
from unsloth.chat_templates import get_chat_template

tokenizer = get_chat_template(
    tokenizer,
    chat_template = "chatml", # Supports zephyr, chatml, mistral, llama, alpaca, vicuna, vicuna_old, unsloth
    mapping = {"role" : "from", "content" : "value", "user" : "human", "assistant" : "gpt"}, # ShareGPT style
    map_eos_token = True, # Maps end-of-turn to </s> instead
)
```

## Custom chat templates

You can write your own template. Pass a `tuple` of `(custom_template,
eos_token)` where the `eos_token` must be used inside the template. Example —
Unsloth's internal template (reconstructed; the docs render this block with
markup, so the canonical Jinja is shown):

```python
unsloth_template = \
    "{{ bos_token }}"\
    "{{ 'You are a helpful assistant to the user\n' }}"\
    "{% for message in messages %}"\
        "{% if message['role'] == 'user' %}"\
            "{{ '>>> User: ' + message['content'] + '\n' }}"\
        "{% elif message['role'] == 'assistant' %}"\
            "{{ '>>> Assistant: ' + message['content'] + eos_token + '\n' }}"\
        "{% endif %}"\
    "{% endfor %}"\
    "{% if add_generation_prompt %}"\
        "{{ '>>> Assistant: ' }}"\
    "{% endif %}"
unsloth_eos_token = "eos_token"

tokenizer = get_chat_template(
    tokenizer,
    chat_template = (unsloth_template, unsloth_eos_token,), # You must provide a template and EOS token
    mapping = {"role" : "from", "content" : "value", "user" : "human", "assistant" : "gpt"}, # ShareGPT style
    map_eos_token = True,
)
```

## Adding new tokens

`add_new_tokens` adds special tokens to your finetune (e.g. `<CHARACTER_1>`,
`<THINKING>`, `<SCRATCH_PAD>`). **You MUST call `add_new_tokens` before
`FastLanguageModel.get_peft_model`!**

```python
model, tokenizer = FastLanguageModel.from_pretrained(...)
from unsloth import add_new_tokens
add_new_tokens(model, tokenizer, new_tokens = ["<CHARACTER_1>", "<THINKING>", "<SCRATCH_PAD>"])
model = FastLanguageModel.get_peft_model(...)
```

## Multi-turn conversations

Single-turn datasets (like Alpaca) don't teach multi-turn dialogue. The
`conversation_extension` parameter randomly selects rows from a single-turn
dataset and merges them into one conversation. E.g. set it to 3 to randomly
select 3 rows and merge them into 1. Setting it too long can make training
slower, but can make the chatbot / final finetune better. Then set
`output_column_name` to the prediction/output column (e.g. the `output` column
for Alpaca) and run `standardize_sharegpt` to put the dataset in the correct
format (always call it).

## Per-model notes

- **Llama-3 / Llama-3.1 / 3.2 / 3.3** templates only function by using the
  instruct version of the model.
- **Gemma 2 / 3 / 3n** use `<start_of_turn>` markers (see `train_on_responses_only`
  in `troubleshooting.md`).
- **Alpaca** format uses `{INPUT}` (instruction) and `{OUTPUT}` (model output),
  with an optional `{SYSTEM}` field for a custom system prompt.

Source: https://unsloth.ai/docs/basics/chat-templates.md (fetched 2026-09-26).

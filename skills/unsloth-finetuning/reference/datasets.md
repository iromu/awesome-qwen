# Datasets

How to create, format, and size a fine-tuning dataset for Unsloth. The quality and
amount of your dataset largely determine the end result — get this part right.

## What makes a good dataset

- For LLMs, datasets are collections of data that can be tokenized. Text data must be
  in a format a tokenizer can read.
- Curate well-structured data, ideally as **question-answer pairs**. Just dumping raw
  data works worse for most tasks — though for some (e.g. fine-tuning for code),
  dumping all your code data can itself yield significant improvements. It depends on
  the use case.
- Fine-tuning can replicate all of RAG's capabilities (RAG cannot change model weights).
- Combining your data with a more generalized HF dataset (e.g. ShareGPT) makes the
  model smarter and more diverse; synthetic data can be added too.
- Before formatting, identify: (1) **purpose** (chat Q&A, structured tasks like
  classification/summarization, domain data — medical/finance/technical), (2) **style
  of output** (JSON, HTML, text, code; language), (3) **data source** (CSV, PDF,
  website, Hugging Face, Wikipedia, synthetic).

## Common formats

| Format | Description | Training type |
| --- | --- | --- |
| Raw Corpus | Raw text from a website, book, article | Continued pretraining (CPT) |
| Instruct (Alpaca) | Instruction + optional input + expected output | Supervised fine-tuning |
| Conversation (ShareGPT) | Multi-turn `from`/`value` dialogue (human/gpt) | Supervised fine-tuning |
| ChatML | `role`/`content` messages alternating user/assistant (HF default, most used) | Supervised fine-tuning |
| RLHF | Conversations with assistant responses ranked by script/model/human | Reinforcement Learning |

Examples:

Alpaca (instruction format):

```json
"Instruction": "Task we want the model to perform."
"Input": "Optional, but useful, it will essentially be the user's query."
"Output": "The expected result of the task and the output of the model."
```

ShareGPT (multi-turn, `from`/`value`):

```json
{
  "conversations": [
    { "from": "human", "value": "Can you help me make pasta carbonara?" },
    { "from": "gpt", "value": "Would you like the traditional Roman recipe, or a simpler version?" },
    { "from": "human", "value": "The traditional version please" },
    { "from": "gpt", "value": "The authentic Roman carbonara uses just a few ingredients: pasta, guanciale, eggs, Pecorino Romano, and black pepper. Would you like the detailed recipe?" }
  ]
}
```

ChatML (`role`/`content`, alternating user/assistant):

```json
{
  "messages": [
    { "role": "user", "content": "What is 1+1?" },
    { "role": "assistant", "content": "It's 2!" }
  ]
}
```

Raw text (continued pretraining): `{ "text": "Pasta carbonara is a traditional Roman
pasta dish. ..." }`.

## Loading and tokenizing in Unsloth

Four steps for ChatML-style datasets:

```python
# 1. Check supported chat templates
from unsloth.chat_templates import CHAT_TEMPLATES
print(list(CHAT_TEMPLATES.keys()))
```

Example output: `['unsloth', 'zephyr', 'chatml', 'mistral', 'llama', 'vicuna',
'vicuna_old', 'vicuna old', 'alpaca', 'gemma', 'gemma_chatml', 'gemma2',
'gemma2_chatml', 'llama-3', 'llama3', 'phi-3', 'phi-35', 'phi-3.5', 'llama-3.1',
'llama-31', 'llama-3.2', 'llama-3.3', 'llama-32', 'llama-33', 'qwen-2.5', 'qwen-25',
'qwen25', 'qwen2.5', 'phi-4', 'gemma-3', 'gemma3']`

```python
# 2. Apply the right chat template to the tokenizer
from unsloth.chat_templates import get_chat_template
tokenizer = get_chat_template(
    tokenizer,
    chat_template = "gemma-3", # change this to the right chat_template name
)

# 3. Define the formatting function
def formatting_prompts_func(examples):
    convos = examples["conversations"]
    texts = [tokenizer.apply_chat_template(convo, tokenize = False, add_generation_prompt = False) for convo in convos]
    return { "text" : texts, }

# 4. Load and map
from datasets import load_dataset
dataset = load_dataset("repo_name/dataset_name", split = "train")
dataset = dataset.map(formatting_prompts_func, batched = True,)
```

ShareGPT (`from`/`value`) datasets must be converted to `role`/`content` first:

```python
from datasets import load_dataset
dataset = load_dataset("mlabonne/FineTome-100k", split = "train")

from unsloth.chat_templates import standardize_sharegpt
dataset = standardize_sharegpt(dataset)

dataset = dataset.map(formatting_prompts_func, batched = True,)
```

Q&A notes from the guide:

- Only use `standardize_sharegpt` if your dataset is ShareGPT-style but the model
  expects ChatML.
- Prefer Unsloth's `get_chat_template` over the tokenizer's own `apply_chat_template`
  — original `chat_template`s sometimes contain errors and are slow to fix upstream;
  Unsloth checks/fixes them for every quantized model it uploads.
- If your template isn't supported, file a feature request on the unsloth GitHub;
  fall back to the tokenizer's own `apply_chat_template` in the meantime.
- Multi-column tabular data (e.g. Titanic) must be merged into one prompt: Unsloth's
  `to_sharegpt` does this in one go — columns go in `{curly braces}`, optional text
  components in `[double square brackets]` (skipped when the value is empty), and
  `output_column_name` selects the target column. The `conversation_extension`
  parameter merges N random single-turn rows into one multi-turn conversation (e.g.
  3 rows → 1 conversation); longer conversations can slow training but improve
  multi-turn chat quality.
- For reasoning models: keep QA pairs, but the answer must include the
  chain-of-thought / reasoning steps. To ADD reasoning to a non-reasoning model use
  RL (GRPO), not plain SFT.

## Synthetic data generation

Use a local LLM (Llama 3.3 70B etc.) or GPT to generate data. Prefer a bigger model
for quality. Three goals: (1) produce entirely new data, (2) diversify the dataset so
the model doesn't overfit, (3) augment/structure existing data into the chosen format.

Example prompts:

```
Using the dataset example I provided, follow the structure and generate conversations based on the examples.
```

```
Create 10 examples of product reviews for Coca-Coca classified as either positive, negative, or neutral.
```

```
Structure my dataset so it is in a QA ChatML format for fine-tuning. Then generate 5 synthetic data examples with the same topic and format.
```

Have at least ~10 real examples so the model learns the structure + context. Check the
quality of generated data — remove or improve irrelevant/poor responses, balance the
data to avoid overfitting, and feed the cleaned set back for further generation.
Unsloth also has a Synthetic Data notebook that parses documents (PDFs, videos) and
generates QA pairs with local models like Llama 3.2.

## Size guidance

- Bare minimum: **~100 rows** for reasonable results.
- **1,000+ rows** preferable; more data usually leads to better outcomes.
- Too small? Add synthetic data or a Hugging Face dataset to diversify.
- Quality matters more than raw count — clean and prepare thoroughly.

## Validation / evaluation

- You can take ~20% of your training data as a test/eval set (set `eval_dataset` on
  the trainer). If you used all data, evaluate manually by chatting with the model.
- Automated eval tools may not align with your criteria.
- Evaluation can be time-consuming: reduce the eval dataset size or set
  `evaluation_steps = 100`.
- Multiple datasets: standardize formats and combine into one dataset, or use the
  Multiple Datasets notebook.
- Fine-tuning the same model repeatedly: better to combine all datasets into one
  training run — re-training an already fine-tuned model can alter previously learned
  quality/knowledge.

## Vision datasets (one-line pointer)

VLM datasets use `messages` with content lists `[{"type": "text", "text": ...},
{"type": "image", "image": ...}]` — see the Llama 3.2 Vision notebook for the full
pattern (out of scope for text SFT).

Source: https://unsloth.ai/docs/get-started/fine-tuning-llms-guide/datasets-guide.md
and https://unsloth.ai/docs/get-started/fine-tuning-llms-guide.md (fetched 2026-09-26).

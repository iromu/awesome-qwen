# Ollama & LM Studio (GGUF)

Sources: `nb_code/Llama3_(8B)-Ollama.txt` (official notebook, main branch 2026-09-26),
`pages/basics/inference-and-deployment/saving-to-ollama.md`,
`pages/basics/inference-and-deployment/lm-studio.md` (unsloth.ai/docs).

## Ollama

### 1. Export to GGUF

```python
# default Q8_0 — fast conversion, acceptable resources
model.save_pretrained_gguf("llama_finetune", tokenizer)
# or push to HF:
model.push_to_hub_gguf("HF_USERNAME/llama_finetune", tokenizer, token = "YOUR_HF_TOKEN")

# other quants:
model.save_pretrained_gguf("llama_finetune", tokenizer, quantization_method = "q4_k_m")
model.save_pretrained_gguf("llama_finetune", tokenizer, quantization_method = "f16")

# multiple quants in one call — much faster than separate exports:
model.push_to_hub_gguf(
    "HF_USERNAME/llama_finetune",
    tokenizer,
    quantization_method = ["q4_k_m", "q8_0", "q5_k_m"],
    token = "YOUR_HF_TOKEN",
)
```

Quant notes (from the notebook): `q8_0` = fast/high resource; `q4_k_m` = recommended
(Q6_K for half of attention.wv + feed_forward.w2, else Q4_K); `q5_k_m` similar with Q5_K.
The full quant list lives in the GGUF export docs (`unsloth-quantization` skill).

### 2. Install & run Ollama

```bash
# Colab needs zstd first:
!command -v zstd >/dev/null 2>&1 || (apt-get -qq update && apt-get -qq install -y zstd)
!curl -fsSL https://ollama.com/install.sh | sh
```

Desktop: run `ollama serve` in a terminal. In Colab (no async), use `subprocess` and
**poll until it actually answers** — a fixed sleep is a race that produces
"Connection refused" on port 11434:

```python
import subprocess, time, requests

subprocess.Popen(["ollama", "serve"])
for _ in range(60):
    try:
        if requests.get("http://localhost:11434/api/tags", timeout=2).ok:
            print("Ollama is ready!")
            break
    except requests.exceptions.RequestException:
        pass
    time.sleep(1)
else:
    raise RuntimeError("Ollama did not become ready on http://localhost:11434 within 60s.")
```

### 3. Create the model (auto Modelfile)

Unsloth auto-generates the `Modelfile` Ollama requires (prompt format + the chat
template used during training):

```python
print(tokenizer._ollama_modelfile)   # inspect the generated Modelfile
```

```bash
ollama create unsloth_model -f ./model/Modelfile
```

### 4. Inference via the Ollama API

```bash
!curl http://localhost:11434/api/chat -d '{ \
    "model": "unsloth_model", \
    "messages": [ \
        { "role": "user", "content": "Continue the Fibonacci sequence: 1, 1, 2, 3, 5, 8," } \
    ] \
    }'
```

You can also upload to ollama.com and use the Ollama Desktop app.

### Chat templates for Ollama / llama.cpp

Ollama/llama.cpp act like a custom ChatGPT chatbot only with 2 fields (instruction +
output) — use `to_sharegpt` to merge multi-column datasets, then `standardize_sharegpt`.
Custom templates use `{INPUT}` / `{OUTPUT}` (+ optional `{SYSTEM}`):

```python
chat_template = """{SYSTEM}
USER: {INPUT}
ASSISTANT: {OUTPUT}"""
```

Llama-3 format (must use the `instruct`, not `base`, model):

```python
chat_template = """<|begin_of_text|><|start_header_id|>system<|end_header_id|>

{SYSTEM}<|eot_id|><|start_header_id|>user<|end_header_id|>

{INPUT}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

{OUTPUT}<|eot_id|>"""
```

ChatML:

```python
chat_template = """<|system|>
{SYSTEM}
<|user|>
{INPUT}
<|assistant|>
{OUTPUT}"""
```

Apply with `apply_chat_template(dataset, tokenizer=tokenizer, chat_template=chat_template)`
(optional `default_system_message`).

## LM Studio

Run/deploy GGUF models in LM Studio (lmstudio.ai). Flow: export GGUF → import → chat or
serve an OpenAI-compatible API.

### 1. Export to GGUF

```python
model.save_pretrained_gguf("my_model_gguf", tokenizer, quantization_method = "q4_k_m")
# q8_0 = near full precision quality; f16 = largest/slowest, unquantized
model.push_to_hub_gguf("hf_username/my_model_gguf", tokenizer, quantization_method = "q4_k_m")
```

`q4_k_m` is usually the default for local runs.

### 2. Import

CLI:

```bash
lms import /path/to/model.gguf
lms import /path/to/model.gguf --copy             # keep original file
lms import /path/to/model.gguf --symbolic-link    # keep on dedicated drive
lms import /path/to/model.gguf --user-repo my-user/my-finetuned-models
lms import /path/to/model.gguf --dry-run
```

From Hugging Face: in-app Discover tab, or

```bash
lms get hf_username/my_model_gguf
lms get hf_username/my_model_gguf@Q4_K_M
```

Manual folder structure:

```
~/.lmstudio/models/
└── my-name/
    └── my-finetune/
        └── my-finetune-Q4_K_M.gguf
```

### 3. Chat / serve

GUI: Chat tab → model loader → select model → adjust GPU offload / context length.

CLI:

```bash
lms ls
lms load <model-identifier> --gpu=auto --context-length=8192
lms load <model-identifier> --identifier="my-finetuned-model"
lms server start --port 1234
```

Test:

```bash
curl http://localhost:1234/v1/models
```

```python
from openai import OpenAI
client = OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")  # placeholder ok
resp = client.chat.completions.create(
    model="model-identifier-from-lm-studio",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello! What did I fine-tune you to do?"},
    ],
    temperature=0.7,
)
print(resp.choices[0].message.content)
```

```bash
curl http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "model-identifier-from-lm-studio",
       "messages": [{"role": "user", "content": "Say this is a test!"}],
       "temperature": 0.7}'
```

Debug raw prompts with `lms log stream`.

### Troubleshooting (documented)

- **Gibberish/repeats in LM Studio (fine model in Unsloth):** prompt/chat template
  mismatch. LM Studio auto-detects templates from GGUF metadata, but custom or
  mis-tagged models need a manual override: My Models → gear → **Prompt Template** (or
  force the box in the Chat sidebar). Same root cause list as Ollama: wrong chat
  template, wrong `eos` token, start-of-sequence token handling.
- **Model not in My Models:** prefer `lms import`, or confirm the folder structure above.
- **OOM/slow:** smaller quant (`Q4_K_M`), shorter context, adjust GPU offload.

# Python SDK Recipes (openai / anthropic against Unsloth)

Source: `pages/integrations/connect-python-sdk-to-unsloth.md` (unsloth.ai/docs,
harvested 2026-09-26).

Unsloth serves three OpenAI-compatible dialects at the same base URL (Chat Completions,
Responses, Anthropic Messages), so the official OpenAI and Anthropic Python SDKs work
against it. You only change `base_url` and `api_key`; streaming, tool calling, vision,
and structured output behave as the SDKs document. Both SDKs can coexist in one project —
one `sk-unsloth-…` key authenticates both on the same port.

## Prerequisites

- Unsloth running with a model loaded (port typically `8000` or `8888`).
- An `sk-unsloth-…` key from **Settings → API**.
- The model name (e.g. `qwen-local` or `unsloth/Qwen3.6-27B-GGUF`). If unsure:

```bash
curl http://localhost:8888/v1/models -H "Authorization: Bearer sk-unsloth-…"
```

and copy the `id` field. Keep the key in an env var:

```bash
export UNSLOTH_STUDIO_AUTH_TOKEN=sk-unsloth-xxxxxxxxxxxx
```

## OpenAI SDK

```bash
pip install openai
```

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8888/v1",              # port + /v1
    api_key=os.environ["UNSLOTH_STUDIO_AUTH_TOKEN"],
)
```

Basic chat:

```python
response = client.chat.completions.create(
    model="default",   # name you gave the model in Unsloth, or "default"
    messages=[{"role": "user", "content": "Give me two facts about Paris"}],
)
print(response.choices[0].message.content)
```

Streaming:

```python
stream = client.chat.completions.create(
    model="qwen-local",
    messages=[{"role": "user", "content": "Write a haiku about locally-run LLMs."}],
    stream=True,
)
for chunk in stream:
    if chunk.choices:
        delta = chunk.choices[0].delta.content
        if delta:
            print(delta, end="", flush=True)
```

Vision (HTTP(S) URL or `data:` base64 URI; the loaded model must be multimodal — a
text-only model accepts the request structurally but can't "see"):

```python
import base64
from pathlib import Path

img_b64 = base64.b64encode(Path("test.jpg").read_bytes()).decode()

response = client.chat.completions.create(
    model="default",
    messages=[{
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}},
            {"type": "text", "text": "What's in this image?"},
        ],
    }],
)
print(response.choices[0].message.content)
```

Function calling (client-side; your code executes each call and returns the result):

```python
tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get the current weather for a city",
        "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string", "description": "City name, e.g. 'Paris'"}},
            "required": ["city"],
        },
    },
}]

response = client.chat.completions.create(
    model="default",
    messages=[{"role": "user", "content": "What's the weather in Perth right now?"}],
    tools=tools,
    tool_choice="auto",
)

tool_call = response.choices[0].message.tool_calls[0]
print(tool_call.function.name, tool_call.function.arguments)
```

Unsloth server-side tools (shorthand — Python/bash/web search executed server-side,
streamed back as `tool_result` events; `session_id` persists tool state, e.g. a Python
kernel):

```python
stream = client.chat.completions.create(
    model="default",
    messages=[{"role": "user", "content": "What is 123 * 456? Use Python to compute it."}],
    stream=True,
    extra_body={
        "enable_tools": True,
        "enabled_tools": ["python", "web_search"],
        "session_id": "my-session",
    },
)
for chunk in stream:
    if chunk.choices:
        delta = chunk.choices[0].delta.content
        if delta:
            print(delta, end="", flush=True)
```

`enabled_tools` supports `"python"`, `"bash"`, `"web_search"`.

List models:

```python
models = client.models.list()
for m in models.data:
    print(m.id)
```

Structured output (`response_format` JSON Schema; `strict: True` enforces the schema
during decoding):

```python
import json, os, re
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8888/v1", api_key=os.environ["UNSLOTH_STUDIO_AUTH_TOKEN"])

response = client.chat.completions.create(
    model="default",
    stream=False,
    temperature=0.0,
    max_tokens=1024,
    messages=[{"role": "user",
               "content": "Pick a country: Japan, Egypt, or Peru. Explain why in one sentence."}],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "country_pick",
            "schema": {
                "type": "object",
                "properties": {
                    "country": {"type": "string", "enum": ["Japan", "Egypt", "Peru"]},
                    "reason": {"type": "string"},
                },
                "required": ["country", "reason"],
                "additionalProperties": False,
            },
            "strict": True,
        },
    },
)

raw = response.choices[0].message.content
cleaned = re.sub(r"^```(?:json)?\s*", "", raw)   # strip markdown fence (e.g. Gemma 4 wraps JSON)
cleaned = re.sub(r"\s*```$", "", cleaned)
parsed = json.loads(cleaned)
print(json.dumps(parsed, indent=2))
```

## Anthropic SDK

```bash
pip install anthropic
```

Note the base_url asymmetry: **no `/v1`** here — the SDK appends `/v1/messages` itself.

```python
import os
from anthropic import Anthropic

client = Anthropic(
    base_url="http://localhost:8888",
    api_key="dummy",  # any non-empty value
    default_headers={"Authorization": f"Bearer {os.environ['UNSLOTH_STUDIO_AUTH_TOKEN']}"},
)
```

Basic message:

```python
message = client.messages.create(
    model="default",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Say hello in three languages."}],
)
print(message.content[0].text)
```

Streaming:

```python
with client.messages.stream(
    model="default",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Explain LoRA in two sentences."}],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

Vision (base64 `source` block):

```python
import base64
from pathlib import Path

img_b64 = base64.standard_b64encode(Path("photo.jpg").read_bytes()).decode()

message = client.messages.create(
    model="default",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {"type": "image", "source": {
                "type": "base64", "media_type": "image/jpeg", "data": img_b64}},
            {"type": "text", "text": "What's in this image?"},
        ],
    }],
)
print(message.content[0].text)
```

Tool calling (Anthropic-style `input_schema`):

```python
tools = [{
    "name": "get_weather",
    "description": "Get the current weather for a city",
    "input_schema": {
        "type": "object",
        "properties": {"city": {"type": "string", "description": "City name, e.g. 'Tokyo'"}},
        "required": ["city"],
    },
}]

message = client.messages.create(
    model="default",
    max_tokens=1024,
    tools=tools,
    tool_choice={"type": "auto"},
    messages=[{"role": "user", "content": "What's the weather in Tokyo?"}],
)

for block in message.content:
    if block.type == "tool_use":
        print(block.name, block.input)
```

Server-side tools shorthand works on `/v1/messages` via `extra_body` too (Unsloth emits
custom `tool_result` SSE events the SDK passes through unchanged):

```python
with client.messages.stream(
    model="default",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Search for Python 3.13 features and summarize."}],
    extra_body={
        "enable_tools": True,
        "enabled_tools": ["web_search", "python"],
        "session_id": "my-session",
    },
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

## Choosing an SDK

- **OpenAI SDK** — if you depend on the `openai` package, want OpenAI-style
  `tools`/`tool_choice`, or plan to call the Responses API.
- **Anthropic SDK** — if you depend on `anthropic`, prefer `input_schema` tools, or want
  Anthropic-native streaming event types.

## Troubleshooting

- **`401 Unauthorized`** — `UNSLOTH_STUDIO_AUTH_TOKEN` unset or wrong; re-export and
  `echo $UNSLOTH_STUDIO_AUTH_TOKEN`.
- **`404` from the OpenAI SDK** — `base_url` must end in `/v1`.
- **`404` from the Anthropic SDK** — `base_url` must NOT end in `/v1`.
- **`extra_body` fields dropped** — old SDK versions silently drop unknown fields;
  `pip install -U openai anthropic`.
- **Streaming hangs then dumps** — the wrapper is buffering; `print(..., flush=True)` in
  scripts, disable response buffering behind proxies.

## Optional: server defaults

```bash
unsloth run --model unsloth/Qwen3-1.7B-GGUF --reasoning off --temp 0.6 -p 8888
# LAN exposure:
unsloth run --model unsloth/Qwen3-1.7B-GGUF -H 0.0.0.0 -p 8888
```

These become server defaults when a request doesn't set its own generation parameters;
request-level `temperature`, `top_p`, `max_tokens`, `stream` always override.

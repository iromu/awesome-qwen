# llama-server & OpenAI Endpoint

Sources: `pages/basics/inference-and-deployment/llama-server-and-openai-endpoint.md`,
`pages/basics/tool-calling-guide-for-local-llms.md`, `pages/basics/mcp.md`
(unsloth.ai/docs, harvested 2026-09-26).

## Build llama.cpp

Get the latest llama.cpp (github.com/ggml-org/llama.cpp). `-DGGML_CUDA=OFF` for CPU-only
or Apple Metal (Metal is on by default on Mac):

```bash
apt-get update
apt-get install pciutils build-essential cmake curl libcurl4-openssl-dev -y
git clone https://github.com/ggml-org/llama.cpp
cmake llama.cpp -B llama.cpp/build \
    -DBUILD_SHARED_LIBS=OFF -DGGML_CUDA=ON -DLLAMA_CURL=ON
cmake --build llama.cpp/build --config Release -j --clean-first --target llama-cli llama-mtmd-cli llama-server llama-gguf-split
cp llama.cpp/build/bin/llama-* llama.cpp
```

(macOS: `brew install llama.cpp`; or build without CUDA flags.)

## Serve a GGUF with an OpenAI endpoint

Download the model (example uses Devstral-2 GGUF + multimodal `mmproj`):

```python
# pip install huggingface_hub hf_transfer
import os
os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"
from huggingface_hub import snapshot_download
snapshot_download(
    repo_id = "unsloth/Devstral-2-123B-Instruct-2512-GGUF",
    local_dir = "Devstral-2-123B-Instruct-2512-GGUF",
    allow_patterns = ["*UD-Q2_K_XL*", "*mmproj-F16*"],
)
```

Deploy in a separate terminal (tmux):

```bash
./llama.cpp/llama-server \
    --model Devstral-Small-2-24B-Instruct-2512-GGUF/Devstral-Small-2-24B-Instruct-2512-UD-Q4_K_XL.gguf \
    --mmproj Devstral-Small-2-24B-Instruct-2512-GGUF/mmproj-F16.gguf \
    --alias "unsloth/Devstral-Small-2-24B-Instruct-2512" \
    --threads -1 \
    --n-gpu-layers 999 \
    --prio 3 \
    --min-p 0.01 \
    --ctx-size 16384 \
    --port 8001 \
    --jinja
```

Call it with the OpenAI SDK (the `--alias` is the model id):

```python
from openai import OpenAI
openai_client = OpenAI(base_url="http://127.0.0.1:8001/v1", api_key="sk-no-key-required")
completion = openai_client.chat.completions.create(
    model="unsloth/Devstral-Small-2-24B-Instruct-2512",
    messages=[{"role": "user", "content": "What is 2+2?"}],
)
print(completion.choices[0].message.content)   # 4
```

Minimal llama-server invocation (from the MCP guide, Gemma 4):

```bash
llama-server \
  -hf unsloth/gemma-4-E4B-it-GGUF:UD-Q4_K_XL \
  --alias local \
  --host 127.0.0.1 \
  --port 8080 \
  --no-ui \
  --temp 1.0 --top-p 0.95 --top-k 64 \
  --reasoning off
```

For speculative decoding and the full flag list see the llama.cpp server README
(github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md).

## `--jinja` quirk (fine-tunes)

With `--jinja`, llama-server appends this system message when tools are supported:

> Respond in JSON format, either with tool_call (a request to call tools) or with response reply to the user's request

That extra message **sometimes breaks fine-tunes** (e.g. FunctionGemma's default prompt
gets the sentence appended). `--no-jinja` stops it but disables `tools`. Until llama.cpp
fixes it (ggml-org/llama.cpp#18323), add the tool-calling prompt explicitly for
fine-tunes.

## Tool calling loop (client-side)

Pattern from the tool-calling guide: define Python functions + OpenAI-style `tools`
schemas, then loop — append the assistant message with `tool_calls`, execute each call,
append `role: "tool"` results, repeat until no tool calls remain.

```python
import json, subprocess
from openai import OpenAI

def add_number(a: float | str, b: float | str) -> float:
    return float(a) + float(b)

def terminal(command: str) -> str:
    if "rm" in command or "sudo" in command or "dd" in command or "chmod" in command:
        return "Cannot execute 'rm, sudo, dd, chmod' commands since they are dangerous"
    return str(subprocess.run(command, capture_output=True, text=True, shell=True, check=True).stdout)

def python(code: str) -> str:
    data = {}
    exec(code, data)
    del data["__builtins__"]
    return str(data)

MAP_FN = {"add_number": add_number, "terminal": terminal, "python": python}

tools = [
    {"type": "function", "function": {
        "name": "add_number", "description": "Add two numbers.",
        "parameters": {"type": "object",
                       "properties": {"a": {"type": "string"}, "b": {"type": "string"}},
                       "required": ["a", "b"]}}},
    {"type": "function", "function": {
        "name": "terminal", "description": "Perform operations from the terminal.",
        "parameters": {"type": "object",
                       "properties": {"command": {"type": "string"}},
                       "required": ["command"]}}},
    {"type": "function", "function": {
        "name": "python", "description": "Call a Python interpreter with some Python code.",
        "parameters": {"type": "object",
                       "properties": {"code": {"type": "string"}},
                       "required": ["code"]}}},
]

def unsloth_inference(messages, temperature=0.7, top_p=0.95, top_k=40, min_p=0.01, repetition_penalty=1.0):
    messages = messages.copy()
    openai_client = OpenAI(base_url="http://127.0.0.1:8001/v1", api_key="sk-no-key-required")
    model_name = next(iter(openai_client.models.list())).id
    has_tool_calls = True
    while has_tool_calls:
        response = openai_client.chat.completions.create(
            model=model_name, messages=messages,
            temperature=temperature, top_p=top_p,
            tools=tools if tools else None,
            tool_choice="auto" if tools else None,
            extra_body={"top_k": top_k, "min_p": min_p, "repetition_penalty": repetition_penalty},
        )
        tool_calls = response.choices[0].message.tool_calls or []
        content = response.choices[0].message.content or ""
        tool_calls_dict = [tc.to_dict() for tc in tool_calls] if tool_calls else tool_calls
        messages.append({"role": "assistant", "tool_calls": tool_calls_dict, "content": content})
        for tool_call in tool_calls:
            fx, args, _id = tool_call.function.name, tool_call.function.arguments, tool_call.id
            out = MAP_FN[fx](**json.loads(args))
            messages.append({"role": "tool", "tool_call_id": _id, "name": fx, "content": str(out)})
        else:
            has_tool_calls = False
    return messages
```

Usage (per-model sampling differs — e.g. Devstral: `temperature=0.7, top_p=0.95`;
Qwen3-Coder-Next: `temperature=1.0, top_p=0.95`; GLM-4.7: `temperature=0.7, top_p=1.0`):

```python
messages = [{"role": "user", "content": [{"type": "text", "text": "What is today's date plus 3 days?"}]}]
unsloth_inference(messages, temperature=0.7, top_p=1.0, top_k=-1, min_p=0.00)
```

GLM-4.7 serve example (large quant, fits auto):

```bash
./llama.cpp/llama-server \
    --model unsloth/GLM-4.7-GGUF/UD-Q2_K_XL/GLM-4.7-UD-Q2_K_XL-00001-of-00003.gguf \
    --alias "unsloth/GLM-4.7" \
    --threads -1 --fit on --prio 3 \
    --min-p 0.01 --ctx-size 16384 --port 8001 --jinja
```

## MCP servers against llama-server

Terminal MCP host (IBM `mcp-cli`) with a filesystem sandbox:

```bash
# terminal 1
llama-server -hf unsloth/gemma-4-E4B-it-GGUF:UD-Q4_K_XL \
  --alias local --host 127.0.0.1 --port 8080 --no-ui \
  --temp 1.0 --top-p 0.95 --top-k 64 \
  --chat-template-kwargs '{"enable_thinking":false}'

# terminal 2 (folder containing server_config.json with an @modelcontextprotocol/server-filesystem entry)
uvx mcp-cli \
  --provider llamacpp \
  --api-base http://127.0.0.1:8080/v1 \
  --api-key none \
  --model local \
  --server filesystem \
  --config-file server_config.json
```

`server_config.json` shape:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/ABSOLUTE/PATH/TO/mcp-workspace"],
      "env": {}
    }
  }
}
```

`mcp-cli` needs a config file (e.g. `~/.chuk_llm/config.yaml` with an
`openai_compatible` provider section). Tool-call confirmation is on by default. Popular
MCP servers to connect: GitHub, Context7 (`https://mcp.context7.com/mcp`), Notion, Slack,
Linear, Vercel (`https://mcp.vercel.com`), Sentry, filesystem. Only connect servers you
trust — prompt-injected content can try to trigger unwanted tool calls.

---
name: unsloth-inference
description: |-
  Run, serve, and integrate LLMs with the Unsloth ecosystem. Use whenever the user wants to run a local model, serve an LLM, or build an OpenAI-compatible API against a local endpoint: Unsloth Desktop, Unsloth Studio, `unsloth run`, `unsloth start` (connect Claude Code, Codex, OpenCode, Hermes, OpenClaw, Pi, DeepSeek Harness to local models), the OpenAI/Anthropic-compatible API, the Python openai/anthropic SDKs, curl chat completions, streaming, vision, tool calling, MCP servers, vLLM deployment (FP8 engine args, LoRA hot swapping), SGLang, llama-server + OpenAI endpoint, Ollama, LM Studio, native Unsloth inference (FastLanguageModel.for_inference, 2x faster), LAN/Cloudflare remote access, and the Unsloth model catalog. NOT for training/fine-tuning (unsloth-finetuning), RL (unsloth-rl), or quantization/export (unsloth-quantization).
metadata:
  author: "Iván Rodríguez Murillo <wantez@gmail.com>"

---

# Unsloth Inference & Deployment

Run, serve, and integrate models with the Unsloth ecosystem: Unsloth Desktop/Studio
(Tauri app + no-code web UI), the OpenAI/Anthropic-compatible API exposed by `unsloth run`,
the `unsloth start` agent launcher, native 2x-faster Python inference, and production
deployment via vLLM, SGLang, llama-server, Ollama, or LM Studio.

All facts and commands below are distilled from the official Unsloth docs
(unsloth.ai/docs, harvested 2026-09-26) and the official `unslothai/notebooks` code.
Detailed recipes live in `reference/`.

## Instructions

1. Confirm the task belongs here — training/fine-tuning goes to `unsloth-finetuning`, quantizing/exporting to `unsloth-quantization`, RL to `unsloth-rl` (see "When NOT to Use").
2. Pick the serving path in "Choosing an Inference Path" (Desktop/Studio, OpenAI-compatible API, Python SDK, llama.cpp/`llama-server`, vLLM/SGLang, Ollama/LM Studio).
3. Follow the matching recipe in "Core Workflows" for the chosen path; use "Key APIs / CLI" for exact flags and endpoint shapes, and "Agent Integration" for MCP/agent-tool wiring.
4. For a new model, check "Model Catalog" for the recommended repo and quantization before assuming an FP16 checkpoint fits the target hardware.
5. Check "Pitfalls" before running.

## When to Use

- "Run a local model" / "serve an LLM" / "give me an OpenAI-compatible endpoint"
- Connect Claude Code, Codex, OpenCode, Hermes, OpenClaw, or another coding agent to a local model
- Call a local model from Python (openai/anthropic SDK) or curl: chat completions, streaming,
  vision, function calling, structured output
- Deploy a fine-tuned model to vLLM (FP8, engine args, LoRA hot swapping) or SGLang
- Serve GGUFs via llama-server, Ollama, or LM Studio
- Expose Unsloth on the LAN or over a Cloudflare HTTPS tunnel
- Look up which Unsloth GGUF / 4-bit / NVFP4 model repos exist (model catalog)

## When NOT to Use

| Task | Use instead |
|------|-------------|
| Fine-tuning (SFT/LoRA/QLoRA) | `unsloth-finetuning` |
| RL (GRPO/DPO/ORPO/KTO) | `unsloth-rl` |
| Quantization / export to GGUF, FP8, NVFP4, QAT | `unsloth-quantization` |

This skill covers the *serving/integration* side only. Saving methods
(`save_pretrained_merged`, `save_pretrained_gguf`) are shown here only as the hand-off step
into an inference engine; deep quantization guidance belongs to `unsloth-quantization`.

## Choosing an Inference Path

| Path | Best for | Notes |
|------|----------|-------|
| **Native Unsloth** (`FastLanguageModel.for_inference`) | Single-process Python, notebooks, Colab | 2x faster inference on QLoRA/LoRA/non-LoRA paths; no code changes, no new deps |
| **Unsloth Desktop / Studio** (`unsloth run`) | Desktop use, chat, agents, OpenAI/Anthropic API | GGUF + MLX + safetensors via llama.cpp; self-healing tool calling, web search, code execution; auth API keys |
| **llama-server / Ollama / LM Studio** | GGUF on CPU, laptops, Macs | GGUF format; OpenAI-compatible endpoint; Ollama auto-creates the Modelfile |
| **vLLM** | Production, NVIDIA (FP8/AWQ), multi-GPU, LoRA hot-swapping | `vllm serve`; needs a merged 16-bit model or LoRA adapters |
| **SGLang** | Low-latency high-throughput serving, some GGUFs, FP8 online quantization | `python3 -m sglang.launch_server`; default port 30000 |

Decision: CPU/Mac/quantized → GGUF path (Unsloth Desktop, llama-server, Ollama, LM Studio).
Python-in-a-notebook → native Unsloth. Production GPU serving → vLLM or SGLang.
Desktop + agents + API → Unsloth Desktop/Studio.

## Core Workflows

### 1. Native Unsloth inference (2x faster)

From the official `Llama3.1_(8B)-Inference` notebook — load, set the chat template,
enable fast inference, generate with a `TextStreamer`:

```python
from unsloth import FastLanguageModel
from transformers import TextStreamer
from unsloth.chat_templates import get_chat_template

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Llama-3.1-8B-Instruct",
    max_seq_length = 8192,
    load_in_4bit = True,
    # token = "YOUR_HF_TOKEN",  # gated models
)
tokenizer = get_chat_template(
    tokenizer,
    chat_template = "llama-3.1",
    mapping = {"role": "from", "content": "value", "user": "human", "assistant": "gpt"},  # ShareGPT style
)
FastLanguageModel.for_inference(model)  # Enable native 2x faster inference

messages = [{"from": "human", "value": "Continue the fibonacci sequence: 1, 1, 2, 3, 5, 8,"}]
inputs = tokenizer.apply_chat_template(messages, tokenize = True,
                                       add_generation_prompt = True, return_tensors = "pt").to("cuda")
text_streamer = TextStreamer(tokenizer)
_ = model.generate(input_ids = inputs, streamer = text_streamer, max_new_tokens = 1024, use_cache = True)
```

Loading a saved LoRA adapter is the same `from_pretrained` call with the adapter dir as
`model_name`. Details, multi-turn conversations, and the `AutoPeftModelForCausalLM` fallback
in `reference/native-inference.md`.

### 2. OpenAI-compatible API (Unsloth endpoint)

Install Unsloth (Desktop app, or `curl -fsSL https://unsloth.ai/install.sh | sh`), then load a
GGUF with `unsloth run` — the endpoint URL and a fresh `sk-unsloth-…` API key are printed:

```bash
unsloth run --model unsloth/gemma-4-26B-A4B-it-GGUF:UD-Q4_K_XL
```

Unsloth speaks two dialects on the same port (typically `http://localhost:8888`):
Anthropic `/v1/messages` (Claude Code, Anthropic SDK) and OpenAI
`/v1/chat/completions` + `/v1/responses` (OpenAI SDK, opencode, Cursor, Continue, Cline,
Open WebUI, curl). Quick test:

```bash
curl http://localhost:8888/v1/chat/completions \
  -H "Authorization: Bearer sk-unsloth-xxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"model": "default", "messages": [{"role": "user", "content": "Hello"}]}'
```

Python (openai SDK):

```python
from openai import OpenAI
client = OpenAI(base_url="http://localhost:8888/v1", api_key="sk-unsloth-xxxxxxxxxxxx")
resp = client.chat.completions.create(
    model="default",
    messages=[{"role": "user", "content": "Give me two facts about Paris"}],
)
print(resp.choices[0].message.content)
```

Full endpoint reference, curl recipes, auth, tool calling, and troubleshooting:
`reference/api.md`, `reference/python-sdk.md`.

### 3. vLLM deployment (production)

Save the fine-tune merged to 16-bit (the vLLM/SGLang hand-off), then serve:

```python
# in the training/Unsloth process
model.save_pretrained_merged("finetuned_model", tokenizer, save_method = "merged_16bit")
# or LoRA-only:
model.save_pretrained_merged("finetuned_model", tokenizer, save_method = "lora")
```

```bash
uv pip install -U vllm --torch-backend=auto   # NVIDIA; AMD: rocm/vllm-dev:nightly Docker
vllm serve finetuned_model                    # or a HF repo, e.g. unsloth/gpt-oss-120b
```

FP8 example (Llama-3.3-70B, 64K context):

```bash
vllm serve unsloth/Llama-3.3-70B-Instruct \
    --quantization fp8 --kv-cache-dtype fp8 \
    --gpu-memory-utilization 0.97 --max-model-len 65536
```

LoRA hot swapping requires `export VLLM_ALLOW_RUNTIME_LORA_UPDATING=True` plus
`--enable-lora --max-loras N --max-lora-rank R`, then
`POST /v1/load_lora_adapter` / `/v1/unload_lora_adapter`. Engine-argument reference and
gotchas: `reference/vllm.md`.

### 4. Ollama / LM Studio (GGUF)

Ollama path (from the official `Llama3_(8B)-Ollama` notebook):

```python
# export to GGUF (q8_0 default; q4_k_m / f16 supported)
model.save_pretrained_gguf("llama_finetune", tokenizer)
```

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama serve                                   # background; or Popen in Colab
ollama create unsloth_model -f ./model/Modelfile   # Modelfile auto-generated by Unsloth
curl http://localhost:11434/api/chat -d '{
    "model": "unsloth_model",
    "messages": [{"role": "user", "content": "Continue the Fibonacci sequence: 1, 1, 2, 3, 5, 8,"}]}
'
```

LM Studio: export GGUF (`q4_k_m` typical), `lms import /path/to/model.gguf`, then
`lms load <id> --gpu=auto` + `lms server start --port 1234` for an OpenAI-compatible API at
`http://localhost:1234/v1`. Details: `reference/ollama-lmstudio.md`.

### 5. Unsloth Desktop / Studio

- **Desktop app** (macOS/Windows/Linux, Tauri): download from unsloth.ai/download, pick a
  model + quantization in the Model hub, chat — no setup required.
- **Studio** (web UI, no-code): install with
  `curl -fsSL https://unsloth.ai/install.sh | sh` (Windows: `irm https://unsloth.ai/install.ps1 | iex`),
  launch with `unsloth studio -H 0.0.0.0 -p 8888`, open `http://127.0.0.1:8888`.
- Runs GGUF/MLX/safetensors locally, auto-tunes inference params, self-healing tool calling,
  web search, code execution, MCP servers, model arena, and no-code training with
  Data Recipes (PDF/CSV/JSON → dataset) and one-click export to GGUF/safetensors/LoRA.

Details: `reference/desktop-studio.md`.

## Model Catalog (Unsloth repos on Hugging Face)

Dynamic GGUFs (llama.cpp/Unsloth Desktop) for running; Instruct 4-bit safetensors for
Unsloth inference/fine-tuning; NVFP4 for Blackwell. Representative entries (full list:
huggingface.co/unsloth, docs page `get-started/unsloth-model-catalog.md`):

| Family | GGUF repos (examples) | 4-bit / NVFP4 |
|---|---|---|
| Qwen3.8 | `unsloth/Qwen3.8-27B-GGUF`, `Qwen3.8-2.4T-A95B-GGUF`, `Qwen3.8-Flash-Next-GGUF` | `Qwen3.8-27B-NVFP4` |
| Qwen3.6 | `Qwen3.6-27B-GGUF` (+ MTP), `Qwen3.6-35B-A3B-GGUF` | NVFP4 variants |
| Qwen3.5 | `Qwen3.5-{0.8B,2B,4B,9B,27B,35B-A3B,122B-A10B,397B-A17B}-GGUF` | — |
| GLM | `GLM-5.3-GGUF`, `GLM-5.3-Flash-GGUF`, `GLM-4.7-GGUF`, `GLM-4.7-Flash-GGUF`, `GLM-5-GGUF` | — |
| Gemma 4 | `gemma-4-{E2B,E4B,12b,26B-A4B,31B}-it-GGUF`, QAT collection | `*-it-NVFP4`, `*-it-unsloth-bnb-4bit` |
| Kimi | `Kimi-K3-GGUF`, `Kimi-K2.7-Code-GGUF`, `Kimi-K2.6-GGUF`, `Kimi-K2.5-GGUF` | `unsloth/Kimi-K3` (4-bit) |
| DeepSeek-V4 | `DeepSeek-V4-Flash-Vision-Exp-GGUF`, `V4-Pro-0813-GGUF`, `Flash-0731` | — |
| gpt-oss | `gpt-oss-20b-GGUF`, `gpt-oss-120b-GGUF` | `*-unsloth-bnb-4bit` |
| Nemotron 3 | `NVIDIA-Nemotron-3-{Nano-4B,Nano-30B-A3B,Super-120B-A12B}-GGUF`, Nemotron-3.5 Lightning 30B | Super NVFP4 |
| Muse Glimmer | `Muse-Glimmer-30B-GGUF` | `Muse-Glimmer-30B-unsloth-bnb-4bit` |
| MiniMax | `MiniMax-M2.5-GGUF` | — |
| Llama / Mistral | `unsloth/Llama-3.1-8B-Instruct` (base 4-bit), Ministral 3, Devstral-2 GGUF | — |

Quant variants use the `:UD-Q4_K_XL` suffix in `unsloth run` / `-hf` (e.g.
`unsloth/gemma-4-26B-A4B-it-GGUF:UD-Q4_K_XL`).

## Agent Integration

`unsloth start <agent>` wires a coding agent to the local model (endpoint, API key, provider,
model, context length are set automatically, session-scoped — no edits to the agent's config):

```bash
unsloth start claude \
  --model unsloth/Qwen3.8-27B-GGUF:UD-Q4_K_XL \
  --context-length 32768 --temp 1.0 --top-p 0.95 --top-k 20 --min-p 0.0 \
  --reasoning-effort medium
```

Agents: `claude` (Claude Code), `codex` (OpenAI Codex), `dsh` (DeepSeek Harness), `opencode`,
`hermes`, `openclaw`, `pi`. Remote server: `export UNSLOTH_STUDIO_URL=...` +
`UNSLOTH_API_KEY=sk-unsloth-...`. Flags like `--persist` (session storage), `--yolo`
(agent trust mode), `--no-launch` (print the generated env/command).

Manual connection (no `unsloth start`): Claude Code via
`ANTHROPIC_BASE_URL`/`ANTHROPIC_AUTH_TOKEN`/`ANTHROPIC_MODEL`; Codex via a
`~/.codex/config.toml` provider with `wire_api = "responses"`; MCP servers (Context7, Exa,
Hugging Face built-in; custom via URL + OAuth/token) and the local-LLM tool-calling loop
pattern: `reference/api.md` and `reference/llama-server.md`.

## Key APIs / CLI

| Command / endpoint | Port / target | Purpose |
|---|---|---|
| `unsloth studio -p 8888` | 8888 | Launch Studio UI + server (default port) |
| `unsloth run --model <repo>:<quant>` | default | Load GGUF, print endpoint URL + API key |
| `unsloth start claude\|codex\|dsh\|opencode\|hermes\|openclaw\|pi` | — | Launch a coding agent against the local model |
| `unsloth studio -H 0.0.0.0` | LAN | Bind raw port to all interfaces |
| `unsloth studio --secure` | Cloudflare | HTTPS tunnel only (loopback bind, fails closed) |
| `POST /v1/chat/completions` | Unsloth/vLLM/LM Studio/llama-server | OpenAI Chat Completions dialect |
| `POST /v1/messages` | Unsloth | Anthropic Messages dialect (`max_tokens` required) |
| `POST /v1/responses` | Unsloth | OpenAI Responses API (Codex) |
| `GET /v1/models` | any | List loaded model ids |
| Auth | — | `Authorization: Bearer sk-unsloth-…` (Unsloth); vLLM `--api-key`; others often keyless |
| `vllm serve <model>` | 8000 | vLLM OpenAI-compatible server |
| `POST /v1/load_lora_adapter` | vLLM | Hot-swap LoRA (needs `VLLM_ALLOW_RUNTIME_LORA_UPDATING=True`) |
| `python3 -m sglang.launch_server --model-path <m> --port 30000` | 30000 | SGLang server |
| `llama-server --model <gguf> --port 8001 --jinja` | 8001 (example) | llama.cpp OpenAI endpoint |
| `ollama serve` / `ollama create <name> -f Modelfile` | 11434 | Ollama server / model registration |
| `lms import <gguf>`, `lms server start --port 1234` | 1234 | LM Studio import + OpenAI API |
| `FastLanguageModel.for_inference(model)` | — | Enable native 2x faster inference |

## References

| File | Contents |
|---|---|
| `reference/desktop-studio.md` | Desktop app + Studio: install, launch, chat features, Data Recipes, export, LAN/Cloudflare remote access |
| `reference/api.md` | OpenAI/Anthropic-compatible endpoint: auth, curl recipes per endpoint, tool calling, server-side tools, `unsloth start` + manual Claude Code/Codex setup, troubleshooting |
| `reference/python-sdk.md` | openai/anthropic SDK recipes: streaming, vision, function calling, server-side tools, JSON schema |
| `reference/vllm.md` | vLLM install, serving, engine arguments, LoRA hot swapping; SGLang serving, FP8 online quant, GGUFs, offline mode, benchmarking |
| `reference/llama-server.md` | llama.cpp build, llama-server flags, OpenAI endpoint, `--jinja` quirks, tool-calling loop, MCP host |
| `reference/ollama-lmstudio.md` | GGUF → Ollama (auto Modelfile, serve, chat) and LM Studio (lms CLI, OpenAI API) |
| `reference/native-inference.md` | `FastLanguageModel.from_pretrained` + `for_inference` + `TextStreamer`, LoRA loading, save hand-offs |

## Examples

**"Give me a local endpoint that Claude Code can call."** "Choosing an Inference Path" -> `unsloth run`/Studio's OpenAI-compatible API; "Agent Integration" covers the launcher wiring and MCP server setup.

**"Serve this GGUF on a 16 GB card."** llama-server/Ollama/LM Studio paths in "Core Workflows"; look the model up in "Model Catalog" for the recommended quantized repo instead of assuming the FP16 checkpoint fits.

**"Make the model act as a calculator tool."** "Agent Integration" for tool-calling and MCP examples; `reference/native-inference.md` and "Key APIs / CLI" for the native `for_inference` path and CLI flags.

## Pitfalls

Documented issues only — verify against the referenced source before advising:

- **Chat template mismatch after export.** A model that works in Unsloth can produce
  gibberish, endless generation, or repeats on Ollama/vLLM/LM Studio. Use the SAME chat
  template as training; check the `eos` token; try with/without a start-of-sequence token.
  Conversational notebooks force the template and fix most cases.
- **`--jinja` in llama-server appends a tool system message** ("Respond in JSON format...")
  that breaks some fine-tunes. `--no-jinja` stops it but disables `tools`. Add the
  tool-calling prompt explicitly for fine-tunes.
- **LoRA hot swapping needs the env flag.** Without
  `VLLM_ALLOW_RUNTIME_LORA_UPDATING=True`, `/v1/load_lora_adapter` is unavailable.
  `--max-lora-rank` must cover every LoRA (choices: 8–512).
- **vLLM OOMs:** reduce `--max-model-len` and/or lower `--gpu-memory-utilization`.
- **Unsloth tool policy is bind-address based:** server-side tools (web search, Python,
  terminal) are ON for `127.0.0.1` and OFF for `0.0.0.0`. On a non-loopback bind,
  `--enable-tools` prompts y/N (skip with `--yes`); it is a process-level hard override —
  request bodies can't bypass it. Pass `--disable-tools` when exposing.
- **LAN access is unencrypted plain HTTP** and tools run as your user — trusted networks
  only; use `--secure` (Cloudflare HTTPS) for anything public.
- **SSE does not survive a Cloudflare quick tunnel** — set `stream: false` when calling
  over one.
- **401 Unauthorized:** missing/wrong `Authorization: Bearer sk-unsloth-…` header. Keys are
  shown only once at creation; lost key → create a new one (Settings → API).
- **SDK base_url asymmetry:** OpenAI SDK needs `base_url` ending in `/v1`; Anthropic SDK
  must NOT include `/v1` (it appends `/v1/messages`). Old SDKs silently drop `extra_body`
  fields — upgrade.
- **Codex requires `wire_api = "responses"`** (`"chat"` is refused) and, via
  `unsloth start codex`, a GGUF model on the `llama-server` backend.
- **Claude Code attribution header invalidates the KV cache** (~90% slower local
  inference). Set `CLAUDE_CODE_ATTRIBUTION_HEADER=0` (inline `--settings` or
  `~/.claude/settings.json`).
- **`max_tokens` is required on `/v1/messages`** (optional on chat completions).
- **curl streaming:** add `-N`/`--no-buffer` or the SSE stream is buffered until the end;
  use `base64 -w 0` on Linux for base64 payloads.
- **Colab UTF-8 locale error** ("NotImplementedError: A UTF-8 locale is required"):
  `import locale; locale.getpreferredencoding = lambda: "UTF-8"` in a new cell.
- **`merged_4bit` is discouraged** unless you know the use case (e.g. DPO training,
  HF online inference). Use `merged_16bit` for vLLM/SGLang.

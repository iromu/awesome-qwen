# Unsloth OpenAI/Anthropic-Compatible API + curl Recipes

Sources: `pages/basics/api.md`, `pages/integrations/connect-curl-and-http-to-unsloth.md`,
`pages/integrations/unsloth-start.md`, `pages/basics/claude-code.md`, `pages/basics/codex.md`
(unsloth.ai/docs, harvested 2026-09-26).

## Endpoints & auth

Models loaded in Unsloth (incl. GGUFs) are exposed as an **authenticated API** via
`llama-server`. Two dialects on the **same port** (typically `http://localhost:8888` or
`:8000`); both support streaming, tool calling, and vision inputs.

| Endpoint | Compatible with | Use from |
|---|---|---|
| `POST /v1/messages` | Anthropic Messages API | Claude Code, Anthropic SDK, OpenClaw |
| `POST /v1/chat/completions` | OpenAI Chat Completions API | OpenAI SDK, opencode, Cursor, Continue, Cline, Open WebUI, curl |
| `POST /v1/responses` | OpenAI Responses API | Codex and recent OpenAI clients |
| `GET /v1/models` | OpenAI models list | list loaded models |

Every request needs `Authorization: Bearer sk-unsloth-…`. Keys are created in
**Settings → API** (or printed by `unsloth run`); shown once, only a hash is stored;
revoked keys → `401 Unauthorized`.

## Starting the server

```bash
# quick way: load a GGUF; endpoint URL + API key printed to console
unsloth run --model unsloth/gemma-4-26B-A4B-it-GGUF:UD-Q4_K_XL
```

Model-name spellings: `repo:quant` (recommended), `--model <repo> --gguf-variant <quant>`,
or `-hf <repo>:<quant>`. Tuning flags forward to llama-server: `--temp`, `--top-p`,
`--top-k`, `--min-p`, `--repeat-penalty`, `--seed`, `-c 131072` (context), `--threads 32`,
`--reasoning on|off`, `--reasoning-effort medium`, `-H 0.0.0.0 -p 8888` (LAN).
If no sampling flags are set, Unsloth auto-selects recommended settings.

**Server-side tool policy:** `127.0.0.1` → tools ON by default; `0.0.0.0` → tools OFF.
`--enable-tools` / `--disable-tools` force; on non-loopback, `--enable-tools` prompts
y/N (`--yes` skips). The resolved policy is a process-level hard override — request bodies
cannot bypass it via `enable_tools=true`.

## curl recipes

List models (the `id` is what clients' "Model ID" fields want):

```bash
curl http://localhost:8888/v1/models \
  -H "Authorization: Bearer sk-unsloth-xxxxxxxxxxxx"
# -> {"data": [{"id": "gemma-4-26B-A4B-it-GGUF", ...}]}
```

Chat completions (basic):

```bash
curl http://localhost:8888/v1/chat/completions \
  -H "Authorization: Bearer sk-unsloth-xxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"model": "default", "messages": [{"role": "user", "content": "Hello"}]}'
```

Streaming — add `"stream": true` and `curl -N` (flush SSE as it arrives; lines are
`data: {...}` ending with `data: [DONE]`):

```bash
curl -N http://localhost:8888/v1/chat/completions \
  -H "Authorization: Bearer sk-unsloth-xxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"model": "qwen-local", "messages": [{"role": "user", "content": "Write a haiku about locally-run LLMs."}], "stream": true}'
```

Vision (HTTPS URL or base64 `data:` URI; model must be multimodal):

```bash
IMG=$(base64 -w 0 test.jpg)   # -w 0 on Linux; plain base64 on macOS
cat > /tmp/request.json <<EOF
{"model":"default",
 "messages":[{"role":"user","content":[
   {"type":"text","text":"Describe the image."},
   {"type":"image_url","image_url":{"url":"data:image/jpeg;base64,$IMG"}}]}],
 "max_tokens":200,"stream":false}
EOF
curl http://localhost:8888/v1/chat/completions \
  -H "Authorization: Bearer sk-unsloth-xxxxxxxxxxxx" \
  -H "Content-Type: application/json" -d @/tmp/request.json
```

Function calling (OpenAI tools):

```bash
curl http://localhost:8888/v1/chat/completions \
  -H "Authorization: Bearer sk-unsloth-xxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"model":"default",
       "messages":[{"role":"user","content":"What is the weather in Paris?"}],
       "tools":[{"type":"function","function":{"name":"get_weather",
         "description":"Get current weather for a city.",
         "parameters":{"type":"object","properties":{"city":{"type":"string"}},"required":["city"]}}}],
       "tool_choice":"required"}' | jq '.choices[0].message, .usage'
```

Anthropic Messages — **`max_tokens` is required** on this dialect:

```bash
curl http://localhost:8888/v1/messages \
  -H "Authorization: Bearer sk-unsloth-xxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"model": "default", "max_tokens": 1024, "messages": [{"role": "user", "content": "Hello"}]}'
```

Streaming on `/v1/messages` uses Anthropic SSE shapes: `message_start`,
`content_block_start`, `content_block_delta`, `content_block_stop`, `message_delta`,
`message_stop`, plus Unsloth's custom `tool_result` event. Anthropic-style tools use
`input_schema`; `tool_choice` maps: `auto`→`auto`, `any`→`required`,
`{type:"tool",name:"x"}`→`{type:"function",function:{name:"x"}}`, `none`→`none`.

Responses API (Codex):

```bash
curl http://localhost:8888/v1/responses \
  -H "Authorization: Bearer sk-unsloth-xxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"model": "qwen-local", "input": "Write a one-sentence greeting."}'
```

### Server-side tools shorthand (both chat endpoints)

| Field | Type | Notes |
|---|---|---|
| `enable_thinking` | bool | `false` disables thinking (default on) |
| `enable_tools` | bool | enable server-side execution |
| `enabled_tools` | array | `python`, `bash`, `web_search` |
| `session_id` | string | persists tool state (e.g. Python kernel) across calls |

```bash
curl http://localhost:8888/v1/chat/completions \
  -H "Authorization: Bearer sk-unsloth-xxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"model": "qwen-local",
       "messages": [{"role": "user", "content": "What is 123 * 456? Use code to compute it."}],
       "stream": false, "enable_tools": true,
       "enabled_tools": ["python"], "session_id": "my-session"}'
```

Results stream back as `tool_result` events; the model sees each tool's output next turn.
Per-request overrides (`temperature`, `top_p`, `max_tokens`, `stream`) beat server
defaults set by `unsloth run`.

## Agent integration: `unsloth start`

Wires a coding agent to the local model (endpoint, key, provider, model, context length
set automatically; session-scoped — no edits to the agent's config files):

```bash
unsloth start claude \
  --model unsloth/Qwen3.8-27B-GGUF:UD-Q4_K_XL \
  --context-length 32768 --temp 1.0 --top-p 0.95 --top-k 20 --min-p 0.0 \
  --reasoning-effort medium
```

| Agent | Command |
|---|---|
| Claude Code | `unsloth start claude` |
| OpenAI Codex | `unsloth start codex` (needs GGUF via `llama-server`) |
| DeepSeek Harness | `unsloth start dsh` |
| OpenCode | `unsloth start opencode` |
| Hermes Agent | `unsloth start hermes` |
| OpenClaw | `unsloth start openclaw` |
| Pi Agent | `unsloth start pi` |

Flags: `--model/-m`, `--api-key` (or `UNSLOTH_API_KEY`), `--launch/--no-launch` (print the
generated env+command — may contain credentials), `--serve/--no-serve`, `--gguf-variant`,
`--reasoning on|off|auto`, `--reasoning-effort`, `--context-length`/`--max-seq-length`,
`--load-in-4bit`, `--tensor-parallel`, `--persist/--no-persist`, `--yolo` (agent trust
mode). Unknown args pass through to the agent (`unsloth start claude --continue`).

Remote server: `export UNSLOTH_STUDIO_URL=https://studio.example.com` +
`export UNSLOTH_API_KEY=sk-unsloth-...`. With `--model` on the default local address,
`unsloth start` starts a temporary server (stops when the agent exits) if Studio is not
running; if Studio is running, it connects and leaves it running.

`--persist` keeps managed storage (needed from the FIRST launch for Codex, OpenClaw,
Hermes, Pi; not for Claude Code/OpenCode which use their own session stores):

```bash
unsloth start codex --persist resume --last
unsloth start openclaw --persist agent --local --session-id my-session --message "Inspect this repository"
unsloth start hermes --persist --continue --oneshot "Continue"
```

### Manual Claude Code connection

```bash
export ANTHROPIC_BASE_URL="http://localhost:8888"
export ANTHROPIC_AUTH_TOKEN="sk-unsloth-xxxxxxxxxxxx"
export ANTHROPIC_API_KEY=""            # stop the cloud-key prompt
export ANTHROPIC_MODEL="unsloth/gemma-4-26B-A4B-it-GGUF"   # optional default
claude
```

Windows PowerShell: `$env:ANTHROPIC_BASE_URL = "http://localhost:8888"` etc. Model id
must match `GET /v1/models` exactly. **KV-cache gotcha:** Claude Code's attribution header
invalidates the KV cache (~90% slower). Fix inline:

```bash
claude --settings '{"env":{"CLAUDE_CODE_ATTRIBUTION_HEADER":"0","CLAUDE_CODE_ENABLE_TELEMETRY":"0"}}' --model unsloth/gemma-4-26B-A4B-it-GGUF
```

or permanently in `~/.claude/settings.json` under `"env"`.

### Manual Codex connection

Codex uses the **Responses API exclusively** — `wire_api = "chat"` is refused.
`~/.codex/config.toml` (Windows: `%USERPROFILE%\.codex\config.toml`):

```toml
oss_provider = "unsloth_api"

[model_providers.unsloth_api]
name                  = "Unsloth Studio"
base_url              = "http://localhost:8888/v1"
env_key               = "UNSLOTH_STUDIO_AUTH_TOKEN"
wire_api              = "responses"
requires_openai_auth  = false
```

Profile file `~/.codex/unsloth_api.config.toml`:

```toml
model_provider = "unsloth_api"
model = "unsloth/gemma-4-26B-A4B-it-GGUF"
```

Launch: `codex --oss --profile unsloth_api` (bare `codex` drops into the modal
"Sign in with ChatGPT" picker). Export `UNSLOTH_STUDIO_AUTH_TOKEN` (Windows: `setx`).
Non-OpenAI slugs warn "Model metadata not found" — harmless; silence side effects with
`model_context_window = 131072` in `config.toml`. WSL: `localhost` doesn't reach the
Windows host — use the host IP in `base_url` (or WSL2 mirrored networking). For
llama-server, use port 8001 and the `--alias` as model id.

## Troubleshooting (endpoint-level)

- **`401 Unauthorized`** — missing/wrong `Authorization: Bearer sk-unsloth-…`. Lost key →
  create a new one (Settings → API); old keys can't be shown.
- **`Lost connection to the model server`** — the underlying llama.cpp server crashed or
  the model tab was closed. Reload the model from New Chat and retry.
- **Claude Code shows the default Anthropic model** — all three env vars must be exported
  in the same shell; check with `echo $ANTHROPIC_BASE_URL $ANTHROPIC_AUTH_TOKEN $ANTHROPIC_MODEL`,
  then `/model` inside Claude Code.
- **`stream: true` returns one JSON blob** — wrong path, or client buffering the response
  instead of consuming it as a stream.
- **Can't find the model name** — `GET /v1/models` returns the exact `id`.
- **Tool calls not executed** — client tools need a model that supports tool calling;
  Unsloth built-in tools need `enable_tools: true` AND `enabled_tools: [...]`.
- **Client connection error** — open the API monitor; no row means the call never reached
  Unsloth; compare the client base URL with the monitor's Base URL.
- **Reply cut short** — check "Context used" / stop reason `length` in the API monitor:
  the context window filled, the model didn't fail.
- **curl hangs on streaming** — add `-N`.
- **SSE over Cloudflare quick tunnel** — set `stream: false`.

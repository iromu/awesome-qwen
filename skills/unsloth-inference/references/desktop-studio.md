# Unsloth Desktop & Studio

Sources: `pages/desktop.md`, `pages/new/studio.md`, `pages/new/studio/install.md`,
`pages/new/studio/chat.md`, `pages/new/studio/export.md`, `pages/new/studio/data-recipe.md`,
`pages/basics/lan.md` (unsloth.ai/docs, harvested 2026-09-26).

## Unsloth Desktop

Free, open-source Tauri app for macOS, Windows, Linux (and WSL) to run and train AI models
on local hardware — LLMs, diffusion image/video, MLX, GGUF, and audio models.

- **Download:** unsloth.ai/download (per-OS pages: /download/mac, /download/windows, /download/linux)
- **GitHub:** github.com/unslothai/unsloth

### Get started (Desktop)

1. Install the app and launch it.
2. Open the **Select model** dropdown (top) or the **Model hub** tab, choose a model and a
   quantization that fits your device, and download it.
3. Chat — no setup required. Connect tools (Claude Code, Codex, web search, MCP), train
   models, or generate media.

### Feature highlights

- **Self-healing tool calling** — up to 50% fewer broken/malformed tool calls; parallel chatting.
- **Code execution** — Bash + Python in a secure sandboxed environment; permission controls
  decide whether tools run sandboxed or with direct file access.
- **Web search / deep research** — unlimited, private; deep research plans first, then
  produces a cited report.
- **Image/video generation** — Qwen-Image-2.1, MiniMax H3 (FP8 on B200: 124-frame
  960×544, 8-step clip in ~13s), FLUX, Z-Image, LTX, Wan, plus fine-tuned LoRA adapters.
- **Serve models via API** — `unsloth run` with any settings (context, GPU layers, threads,
  sampling, networking, tools).
- **Day-zero model support** — Qwen3.8, Muse Glimmer, Kimi K3, DeepSeek V4, Qwen3.6,
  GLM-5.2, Gemma 4, MiniMax M3, DiffusionGemma, and more (llama.cpp + Hugging Face).
- **Connect providers** — ChatGPT/Codex subscription, OpenAI, Anthropic, Ollama, llama.cpp,
  vLLM in the same chat UI, with prompt caching and provider-native features.
- **Train diffusion LoRAs** (SDXL, FLUX.2, Qwen-Image, Z-Image) and **no-code training**
  (drop in a PDF/CSV/JSON: LoRA, full fine-tuning, pretraining — 2x faster, 70% less VRAM).

Example `unsloth run` from the Desktop docs:

```bash
unsloth run --model unsloth/qwen3.8-27B-GGUF-GGUF:UD-Q4_K_XL \
    --temp 1.0 \
    --top-p 0.95 \
    --top-k 20 \
    --min-p 0.0 \
    --chat-template-kwargs '{"reasoning_effort":"medium"}'
```

## Unsloth Studio (web UI)

Open-source, no-code web UI for training, running, and exporting open models — 100% local.
Runs GGUF, MLX, and diffusion models on Mac/Windows/Linux; CPU-only works for Chat + Data
Recipes; training works on NVIDIA, Intel, AMD GPUs and Mac.

### Install

Easiest: the Desktop app. Manual install (also updates — re-run the same command):

```bash
# MacOS, Linux, WSL
curl -fsSL https://unsloth.ai/install.sh | sh

# Windows PowerShell
irm https://unsloth.ai/install.ps1 | iex
```

Launch:

```bash
unsloth studio -H 0.0.0.0 -p 8888     # default port 8888; -H 0.0.0.0 exposes on LAN
unsloth studio --secure              # free Cloudflare HTTPS tunnel instead (loopback bind)
```

Then open `http://127.0.0.1:8888` and create a password on first run.

Installer env vars: `UNSLOTH_NO_TORCH=1` (GGUF-only, skip PyTorch), `UNSLOTH_PYTHON=3.12`
(pin Python), `UNSLOTH_STUDIO_HOME=/abs/path` (custom install dir),
`UNSLOTH_CPU_THREADS=8` (cap native CPU threads).

System requirements: Python 3.11 up to (not including) 3.14; Windows 10/11 64-bit + NVIDIA
driver + App Installer + Git; macOS 12+; Ubuntu 20.04+ with CUDA 12.4+ (12.8+ Blackwell).
Docker: `docker run -d -e JUPYTER_PASSWORD="mypassword" -p 8888:8888 -p 8000:8000 -p 2222:22 -v $(pwd)/work:/workspace/work --gpus all unsloth/unsloth`
(Studio reachable at `http://localhost:8000`). A free Google Colab notebook exists
(`studio/Unsloth_Studio_Colab.ipynb`) — models up to ~22B on T4.

Uninstall: `curl -fsSL https://raw.githubusercontent.com/unslothai/unsloth/main/scripts/uninstall.sh | sh`
(Windows: the matching `uninstall.ps1`). Manual: `rm -rf ~/.unsloth/studio` keeps the HF
model cache (`~/.cache/huggingface`) intact.

### Studio Chat (run models)

- Search/download/run **GGUF**, safetensors, LoRA adapters, vision-language, TTS models from
  Hugging Face or local files. Pre-existing models in the HF cache (or LM Studio's
  `~/.cache/lm-studio/models`) are auto-detected; you can also select an existing folder.
- **Auto inference settings** — temp/top-p/top-k/MTP pre-set per model; llama.cpp smart
  auto context means no manual context sizing. Chat templates are editable.
- **Self-healing tool calling** (malformed calls fixed ~50%; >25 tool calls allowed;
  better termination; XML-leak dedup), **code execution** (Bash + Python, sandboxed),
  **advanced web search** (visits pages; DuckDuckGo API), deep research.
- **Model Arena** — compare two models (e.g. base vs LoRA) side by side with the same
  prompt; models load sequentially.
- Upload images, audio, PDFs, code, DOCX as chat context (processed locally).
- Multi-GPU inference works automatically.
- **API endpoint** — loaded models are exposed as an authenticated OpenAI/Anthropic API
  (see `api.md`). Every call appears live in the API monitor (Settings → API).

### Data Recipes

Graph-node workflow (powered by NVIDIA NeMo Data Designer) that turns documents
(PDF, CSV, JSON, DOCX, TXT) into usable/synthetic datasets:

1. Open the recipes page (recipes are stored locally in the browser; importable/exportable).
2. Create a recipe (blank, learning recipe, or saved).
3. Add blocks and connect them: **Seed** (HF dataset / local structured files / chunked
   unstructured docs), **LLM + Models** (providers, model configs, generation blocks),
   **Expression** (Jinja2 transforms, no LLM call), **Validators** (Python/SQL/JS linters),
   **Samplers** (deterministic columns).
4. **Validate** → preview sample rows → full run → the dataset appears in Unsloth's
   dataset picker for fine-tuning (or publish to HF).

Model setup splits into **Model provider** (endpoint + auth) and **Model config**
(model name + inference settings); works with hosted providers, vLLM, llama.cpp, or any
OpenAI-compatible API. LLM block types: Text, Structured (JSON), Code, Judge (scored).
**Tool Profiles** blocks give LLM blocks shared MCP tool access (e.g. Context7).
Jinja references: `{{customer.first_name}}`, conditionals with `{% if %}`.

### Export / Save

Select training run → checkpoint → export method:

| Export type | Result |
|---|---|
| Merged Model | 16-bit model with the LoRA merged into base weights |
| LoRA Only | adapter weights only (needs the base model) |
| GGUF / llama.cpp | for Unsloth / llama.cpp / Ollama / LM Studio inference |

Save locally or push to the Hugging Face Hub (write token; leave empty if already
authenticated with the HF CLI). Training history is stored so runs can be revisited and
re-exported.

## Remote access: LAN & Cloudflare

Two ways to reach a running Studio from other devices:

- **LAN:** launch with `-H 0.0.0.0`, or at runtime Settings → API → Remote & LAN →
  **LAN access** → Start. Unsloth answers at the machine's network address
  (e.g. `http://192.168.1.42:8888`); the first printed line is the URL (may be IPv6 in
  brackets — copy it whole). A **Start automatically** toggle persists across launches.
- **Cloudflare:** `unsloth studio --secure` (or `-H 0.0.0.0 --cloudflare` for both) —
  a free public HTTPS URL; `--secure` stays loopback-bound and fails closed if the
  tunnel can't come up. SSE does not survive a quick tunnel → `stream: false`.

What each launch exposes:

| Launch | Reachable from |
|---|---|
| `unsloth studio` | this machine only |
| `unsloth studio -H 0.0.0.0` | your network |
| `unsloth studio -H 0.0.0.0 --cloudflare` | network + public Cloudflare URL (least private) |
| `unsloth studio --secure` | public Cloudflare URL only; LAN closed |

Security notes: LAN traffic is **plain HTTP** (unencrypted); server-side tools run as your
user — pass `--disable-tools` when exposing and keep the API key private. Unsloth probes
whether a wildcard port leaks past your router (contacts ifconfig.me / check-host.net;
skip with `UNSLOTH_STUDIO_DISABLE_PUBLIC_CHECK=1`). `UNSLOTH_STUDIO_TRUST_FORWARDED=1`
honors `X-Forwarded-For` behind your own reverse proxy.

LAN settings HTTP API (requires a UI session; API keys are rejected; failures return
`409` with the block reason):

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/settings/lan-access` | state, address, `can_start`/`can_stop`, `block_reason` |
| POST | `/api/settings/lan-access/start` | idempotent start |
| POST | `/api/settings/lan-access/stop` | stop (does not change auto-start) |
| PUT | `/api/settings/lan-access/auto-start` | `{"enabled": true|false}` |

Troubleshooting: port-in-use → `unsloth studio stop` or another `--port`; device can't
reach → same network, no guest Wi-Fi/AP isolation/VPN, check firewall; address changes →
static IP or DHCP reservation.

### Studio install troubleshooting (documented)

| Problem | Fix |
|---|---|
| Python version error | `sudo apt install python3.12 python3.12-venv` (3.11 < v < 3.14) |
| `nvidia-smi not found` | install NVIDIA drivers |
| `nvcc not found` | `sudo apt install nvidia-cuda-toolkit` or add `/usr/local/cuda/bin` to PATH |
| llama-server build failed | non-fatal; GGUF inference unavailable — install `cmake` and re-run setup |
| Build failed | delete `~/.unsloth/llama.cpp` and re-run setup |

GPU not used in Docker: `docker pull unsloth/unsloth:latest`, `--gpus all`
(Compose: `capabilities: [gpu]`), install NVIDIA Container Toolkit on Linux; on Windows
match `nvcc --version` to `nvidia-smi` CUDA.

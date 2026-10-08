# Installation

Ways to install Unsloth for fine-tuning: pip/uv (Linux, WSL, Windows via WSL),
Google Colab, Docker, and AMD GPUs. VRAM/hardware requirements: see
`requirements-vram.md`.

## pip / uv (Unsloth Core)

Plain pip works on Linux, WSL, and Windows via WSL:

```bash
pip install unsloth
```

`pip install unsloth` automatically installs the latest compatible versions of
torch/transformers/etc., so version compatibility is handled for you.

Recommended uv + venv flow (isolates the install from system packages):

```bash
uv venv unsloth_env --python 3.13
source unsloth_env/bin/activate
uv pip install unsloth --torch-backend=auto
```

venv alternative:

```bash
apt install python3.10-venv python3.11-venv python3.12-venv python3.13-venv -y
python -m venv unsloth_env
source unsloth_env/bin/activate
pip install --upgrade pip && pip install uv
uv pip install unsloth --torch-backend=auto
```

- Install vLLM + Unsloth together: `uv pip install unsloth vllm --torch-backend=auto`.
- In Jupyter/Colab/notebooks, prefix the command with `!` (not needed in a terminal).
- Python 3.13 is supported (3.11–3.13 across the docs; 3.10 works for manual installs).
- If dependency issues persist, force a clean reinstall:

```bash
pip install --upgrade --force-reinstall --no-cache-dir --no-deps unsloth
pip install --upgrade --force-reinstall --no-cache-dir --no-deps unsloth_zoo
```

Latest main branch (not usually needed):

```bash
uv pip install unsloth --torch-backend=auto
pip uninstall unsloth unsloth_zoo -y && pip install --no-deps git+https://github.com/unslothai/unsloth_zoo.git && pip install --no-deps git+https://github.com/unslothai/unsloth.git
```

### Advanced pip extras (pinned torch/CUDA)

If you must pin torch/CUDA versions (do NOT use if you have Conda), the pip extra
encodes CUDA + torch, e.g. for torch 2.4 + CUDA 12.1:

```bash
pip install --upgrade pip
pip install "unsloth[cu121-torch240] @ git+https://github.com/unslothai/unsloth.git"
```

Supported CUDA tags: `cu118`, `cu121`, `cu124`; torch tags include `torch211`…`torch250`
(and newer in the auto script). Ampere+ devices (A100, H100, RTX 3090) use the
`-ampere` variants, e.g. `unsloth[cu121-ampere-torch240]`. Or get the optimal command:

```bash
wget -qO- https://raw.githubusercontent.com/unslothai/unsloth/main/unsloth/_auto_install.py | python -
```

## Google Colab

Run the notebooks on a free Tesla T4 (Runtime → Run all, or run each cell in order —
never skip cells; use the Connect/Reconnect T4 button if the GPU drops). The first
installation cell in every official notebook is:

```python
%%capture
import os, re
if "COLAB_" not in "".join(os.environ.keys()):
    !pip install unsloth  # Do this in local & cloud setups
else:
    import torch; v = re.match(r'[\d]{1,}\.[\d]{1,}', str(torch.__version__)).group(0)
    xformers = 'xformers==' + {'2.10':'0.0.34','2.9':'0.0.33.post1','2.8':'0.0.32.post2'}.get(v, "0.0.34")
    !pip install sentencepiece protobuf "datasets==4.3.0" "huggingface_hub>=0.34.0" hf_transfer
    !pip install --no-deps unsloth_zoo bitsandbytes accelerate {xformers} peft trl triton unsloth
    !pip install --no-deps --upgrade "torchao>=0.16.0"
!pip install transformers==4.56.2
!pip install --no-deps trl==0.22.2
```

Note the version pins: `transformers==4.56.2`, `trl==0.22.2` (installed with
`--no-deps`), `torchao>=0.16.0`, `datasets==4.3.0`, and the torch→xformers mapping
(2.10→0.0.34, 2.9→0.0.33.post1, 2.8→0.0.32.post2, default 0.0.34).

## Docker

Official images: NVIDIA `unsloth/unsloth`, AMD `unsloth/unsloth-rocm` (Docker Hub).
The container bundles Unsloth Studio (port 8000), JupyterLab (port 8888), and the
example notebooks; it shares the Hugging Face cache with notebooks/scripts.

NVIDIA quickstart (Linux / WSL; Windows PowerShell is identical with backtick line
continuations and `${PWD}`/`${HOME}`):

```bash
docker run -d --name unsloth --gpus all --ipc=host \
  --ulimit memlock=-1 --ulimit stack=67108864 \
  -p 8000:8000 -p 8888:8888 \
  -e JUPYTER_PASSWORD="mypassword" \
  -v "$PWD":/workspace/host \
  -v "$HOME/.cache/huggingface":/workspace/.cache/huggingface \
  -v unsloth-studio:/opt/unsloth-studio \
  unsloth/unsloth
```

- Run from your project folder — `$PWD` becomes `/workspace/host`.
- Requirements: NVIDIA driver 570.26+; install Docker Engine/Desktop and the NVIDIA
  Container Toolkit (`curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh`,
  then `curl -fsSL https://raw.githubusercontent.com/unslothai/unsloth/main/docker/install_nvidia_toolkit.sh -o install_nvidia_toolkit.sh && sudo -E bash install_nvidia_toolkit.sh`).
- AMD quickstart (Linux) uses `unsloth/unsloth-rocm` with GPU device flags instead of
  `--gpus all`:

```bash
GPU_FLAGS="--device /dev/kfd"
[ -e /dev/dri ] && GPU_FLAGS="$GPU_FLAGS --device /dev/dri"
for g in video render; do
  gid=$(getent group "$g" | cut -d: -f3)
  [ -n "$gid" ] && GPU_FLAGS="$GPU_FLAGS --group-add $gid"
done
docker run -d --name unsloth \
  $GPU_FLAGS \
  --ipc=host \
  --ulimit memlock=-1 --ulimit stack=67108864 \
  -p 8000:8000 -p 8888:8888 \
  -e JUPYTER_PASSWORD="mypassword" \
  -v "$PWD":/workspace/host \
  -v "$HOME/.cache/huggingface":/workspace/.cache/huggingface \
  -v unsloth-studio:/opt/unsloth-studio \
  unsloth/unsloth-rocm
```

  (AMD WSL2 uses `--device /dev/dxg` + `HSA_ENABLE_DXG_DETECTION=1` + a
  `/usr/lib/wsl/lib` mount. Built against ROCm 7.2, covers RDNA1+ and CDNA.)
- Key env vars: `JUPYTER_PASSWORD`, `UNSLOTH_STUDIO_PASSWORD`, `HF_TOKEN`,
  `WANDB_API_KEY`, `SSH_KEY`/`PUBLIC_KEY` (SSH off unless set),
  `UNSLOTH_ALLOW_CPU` (start without a GPU), `UNSLOTH_STUDIO_SECURE`/`_CLOUDFLARE`.
  Unset passwords are generated once and printed in `docker logs`.
- Key paths: `/workspace/host` (your files), `/workspace/.cache/huggingface`
  (models/datasets), `/opt/unsloth-studio` (Studio data — use a named volume, not a
  host folder; symlinks required), `/workspace/unsloth-notebooks` (example notebooks).
- Lifecycle: `docker stop/start unsloth`, `docker ps -a`, `docker rm -f unsloth`
  (deleting the container keeps mounted files; delete the `unsloth-studio` volume to
  wipe Studio data). Update: `docker pull unsloth/unsloth` (or
  `unsloth/unsloth-rocm`) then re-run the quickstart with the same flags.
- Save models under `/workspace/host` — anything else inside the container is lost
  when it is removed.
- Security: container runs as root (use `unsloth/unsloth:core` with `--user` if
  needed); JupyterLab/Studio serve plain HTTP — don't expose to the internet; env
  vars (tokens!) are visible in `docker inspect`.

## AMD (ROCm)

Unsloth supports AMD Radeon RDNA 3/3.5/4 (RX 6000–9000) on Windows and Linux, plus
data-center GPUs like MI300X (192GB) — up to 2x faster with ~70% less memory.

1. Isolated environment (Linux; 3.13 shown, any 3.11–3.13 works, 3.10 for manual):

```bash
apt update && apt install python3.13-venv -y
python3.13 -m venv unsloth_env
source unsloth_env/bin/activate
pip install uv
```

2. PyTorch with ROCm (skip if using an `unsloth[rocmXX-torchXXX]` extra, which
   bundles a matching PyTorch). Check ROCm version via `amd-smi version`; ROCm 6.0+
   required; index tags: `rocm6.0`…`rocm6.4`, `rocm7.0`, `rocm7.1`, `rocm7.2`
   (6.5–6.9 → use `rocm6.4`; 7.3+ → use `rocm7.2`):

```bash
uv pip install "torch>=2.4,<2.11.0" "torchvision<0.26.0" "torchaudio<2.11.0" \
    --index-url https://download.pytorch.org/whl/rocm7.1 --upgrade --force-reinstall
```

   ROCm 7.2 (newer wheels, torch 2.11):

```bash
uv pip install "torch>=2.11.0,<2.12.0" torchvision torchaudio \
    --index-url https://download.pytorch.org/whl/rocm7.2 --upgrade --force-reinstall
```

3. Install Unsloth with the AMD extra:

```bash
uv pip install unsloth[amd]
```

   (Version-specific extras like `unsloth[rocm72-torch291]` exist; on Windows use
   Python 3.12 with that extra.)

4. **Required for AMD:** ROCm-compatible bitsandbytes — versions ≤ 0.49.2 have a
   4-bit decode NaN bug on every AMD GPU. Use `pip` (not `uv`, which rejects the
   pre-release wheel):

```bash
# x86_64 systems:
pip install --force-reinstall --no-cache-dir --no-deps \
    "https://github.com/bitsandbytes-foundation/bitsandbytes/releases/download/continuous-release_main/bitsandbytes-1.33.7.preview-py3-none-manylinux_2_24_x86_64.whl"

# aarch64 systems: replace x86_64 with aarch64 in the URL above

# Fallback if the URL is unreachable:
# pip install --force-reinstall --no-cache-dir --no-deps "bitsandbytes>=0.49.1"
```

5. Environment variables:

```bash
export HSA_OVERRIDE_GFX_VERSION=9.4.2  # Required for AMD MI300X
export HF_HUB_DISABLE_XET=1            # Fixes HuggingFace download issues on AMD
```

   `HSA_OVERRIDE_GFX_VERSION=9.4.2` tells ROCm to treat the GPU as gfx942 (MI300X);
   without it, some kernels may fail to compile or run.

- Flash Attention 2 is NOT available on AMD — Unsloth automatically falls back to
  Xformers (equivalent performance on ROCm); the warning can be ignored.
- AMD Dev Cloud offers free 192GB MI300X one-click notebooks (e.g. Qwen3 32B,
  Llama 3.3 70B) via `https://amd-ai-academy.com/github/unslothai/notebooks/blob/main/nb/...`.

## macOS / Intel / CPU

- **Mac:** training, MLX, and GGUF inference are all supported (Unsloth Studio;
  macOS 12 Monterey+, Intel or Apple Silicon, Python 3.11–3.13). Unsloth Core lists
  Apple/Silicon/MLX as "in the works" for the pip package.
- **Intel GPUs:** training works (Unsloth Studio; original Unsloth Core also supports
  Intel per the requirements page — follow the dedicated Intel install guide).
- **CPU only:** Unsloth works without a GPU for Chat (GGUF models) and Data Recipes —
  not for training.
- Windows: Unsloth Core works on Linux and Windows (the docs point to a dedicated
  Windows installation page; the pip-install page covers Linux/WSL/macOS). Unsloth
  Studio runs natively on Windows 10/11 64-bit with an NVIDIA GPU (App Installer/winget,
  Git, Python 3.11–3.13, uv/venv/conda environment).

Source: https://unsloth.ai/docs/get-started/install/pip-install.md ,
https://unsloth.ai/docs/get-started/install/docker.md ,
https://unsloth.ai/docs/get-started/install/google-colab.md ,
https://unsloth.ai/docs/get-started/install/amd.md ,
https://unsloth.ai/docs/get-started/fine-tuning-for-beginners/unsloth-requirements.md
and notebook install cells (Llama3.1 (8B)-Alpaca, Llama3.2 (1B and 3B)-Conversational,
Qwen3 (4B)-Instruct) (fetched 2026-09-26).

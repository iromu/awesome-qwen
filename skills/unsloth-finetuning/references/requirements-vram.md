# Requirements & VRAM

Hardware and VRAM requirements for fine-tuning with Unsloth. Install steps: see
`installation.md`.

## Platform support

- **Mac:** training, MLX and GGUF inference are ALL supported (Unsloth Studio; macOS
  12 Monterey+, Intel or Apple Silicon, Python 3.11 up to but not including 3.14).
- **CPU:** Unsloth still works without a GPU, for Chat + Data Recipes (not training).
- **Training:** works on **NVIDIA**, **AMD**, **Intel** GPUs and **Mac** devices.
- **Unsloth Core (pip package):** Linux and Windows; NVIDIA GPUs since 2018+,
  including Blackwell RTX 50 and DGX Spark; AMD and Intel GPUs supported (dedicated
  guides); Apple/Silicon/MLX "in the works" for Core. Device needs `xformers`,
  `torch`, `BitsandBytes` and `triton` support. Python 3.13 supported (3.11–3.13;
  3.10 works for manual installs).
- Studio OS requirements: Windows 10/11 64-bit + NVIDIA GPU + App Installer;
  Linux/WSL: Ubuntu 20.04+ (64-bit), NVIDIA drivers, CUDA toolkit 12.4+ recommended
  (12.8+ for Blackwell); all: Python 3.11–3.13, a uv/venv/conda environment.

## GPU support (NVIDIA)

- Minimum CUDA Capability 7.0: V100, T4, Titan V, RTX 20 & 50, A100, H100, L40, etc.
  GTX 1070/1080 works but is slow. Check your GPU at developer.nvidia.com/cuda-gpus.
- AMD: Radeon RDNA 3/3.5/4 (RX 6000–9000) on Windows and Linux, plus data-center
  GPUs including MI300X (192GB). ROCm 6.0+ required.

## Fine-tuning VRAM requirements

Minimum VRAM by model size and method. QLoRA = 4-bit base, LoRA = 16-bit base
(~4x more VRAM). These are ABSOLUTE minimums — some models need more. A rough
rule of thumb: model parameters in billions ≈ GB of VRAM for 16-bit LoRA, and
about a quarter of that for QLoRA (so ~3GB+ is enough to start with QLoRA).

| Model parameters | QLoRA (4-bit) VRAM | LoRA (16-bit) VRAM |
| --- | --- | --- |
| 3B | 3.5 GB | 8 GB |
| 7B | 5 GB | 19 GB |
| 8B | 6 GB | 22 GB |
| 9B | 6.5 GB | 24 GB |
| 11B | 7.5 GB | 29 GB |
| 14B | 8.5 GB | 33 GB |
| 27B | 22 GB | 64 GB |
| 32B | 26 GB | 76 GB |
| 40B | 30 GB | 96 GB |
| 70B | 41 GB | 164 GB |
| 81B | 48 GB | 192 GB |
| 90B | 53 GB | 212 GB |
| 405B | 237 GB | 950 GB |

(70B Llama fits in <48GB VRAM with QLoRA in Unsloth.)

## OOM tips

- A common cause of out-of-memory is batch size too high — set
  `per_device_train_batch_size` to 1, 2, or 3, and use
  `gradient_accumulation_steps` to simulate a larger batch instead.
- `use_gradient_checkpointing = "unsloth"` cuts an extra ~30% VRAM.
- QLoRA (`load_in_4bit = True`) uses ~4x less VRAM than 16-bit LoRA.
- Unsloth shares the Hugging Face cache (`~/.cache/huggingface/hub/`) across
  notebooks, scripts, Docker, and Studio — models download once.

Source: https://unsloth.ai/docs/get-started/fine-tuning-for-beginners/unsloth-requirements.md
and https://unsloth.ai/docs/get-started/install/amd.md (fetched 2026-09-26).

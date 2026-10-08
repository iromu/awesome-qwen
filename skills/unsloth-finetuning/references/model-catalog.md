# Unsloth Model Catalog (condensed)

Unsloth's Hugging Face directory of LLMs as GGUF (for Unsloth Desktop /
llama.cpp), 4-bit / NVFP4 (for inference or fine-tuning via Unsloth), and
Instruct (4-bit) safetensors. Use **Instruct (4-bit)** safetensors for inference
or fine-tuning via Unsloth.

The catalog lists variants per family; "—" means that variant has no upload in
that column. Sizes below are the parameter counts Unsloth publishes.

## Qwen
- **Qwen3.8** (new): 27B (NVFP4), 2.4T-A95B (MoE)
- **Qwen3.6**: 27B, 35B-A3B (MoE)
- **Qwen3.5**: 0.8B, 2B, 4B, 9B, 27B, 35B-A3B (MoE), 122B-A10B (MoE), 397B-A17B (MoE)
- **Qwen3**: 0.6B, 1.7B, 4B, 8B, 14B, 32B, 30B-A3B (MoE), 235B-A22B (MoE)
- **Qwen3-2507 / Qwen3-Next**: 30B-A3B (Instruct/Thinking), 235B-A22B, 80B-A3B
- **Qwen3-Coder**: 30B-A3B, 480B-A35B (MoE), Coder-Next
- **Qwen3-VL**: 2B, 4B, 8B, 32B (Instruct/Thinking), 30B-A3B, 235B-A22B
- **Qwen 2.5**: 0.5B, 1.5B, 3B, 7B, 14B, 32B, 72B
- **Qwen 2.5 VL**: 3B, 7B, 32B, 72B
- **Qwen 2.5 Coder (128K)**: 0.5B, 1.5B, 3B, 7B, 14B, 32B
- **Qwen 2.5 Omni**: 3B, 7B
- **Qwen 2 (chat)**: 1.5B, 7B, 72B; **Qwen 2 VL**: 2B, 7B, 72B
- **QwQ**: 32B; **QVQ (preview)**: 72B; **Qwen-Image**: 2512, Edit-2511

## Gemma
- **Gemma 4**: E2B, E4B, 26B-A4B (MoE), 31B, QAT
- **Gemma 3n**: E2B, E4B
- **Gemma 3**: 270M, 1B, 4B, 12B, 27B
- **Gemma 2**: 2B, 9B, 27B
- **FunctionGemma**: 270M
- **MedGemma** (vision): 4B, 27B

## DeepSeek
- **DeepSeek-V3.1**: V3.1, Terminus
- **DeepSeek-V3**: V3, V3-0324
- **DeepSeek-R1**: R1, R1-0528, R1 Zero, R1-0528-Qwen3-8B, and Distill variants
  (Llama 8B/70B, Qwen 1.5B/7B/14B/32B)

## Llama
- **Llama 4**: Scout 17B-16E, Maverick 17B-128E
- **Llama 3.3**: 70B
- **Llama 3.2**: 1B, 3B, 11B Vision, 90B Vision
- **Llama 3.1**: 8B, 70B, 405B
- **Llama 3**: 8B, 70B
- **Llama 2**: 7B, 13B; **CodeLlama**: 7B, 13B, 34B

## Mistral
- **Magistral**: Small (2506/2507/2509)
- **Mistral Small**: 3.2-24B (2506), 3.1-24B (2503), 3-24B (2501), 2409-22B
- **Ministral 3**: 3B, 8B, 14B (Instruct/Reasoning)
- **Devstral / Devstral 2**: Small-24B, 24B, 123B
- **Mistral Large / Large 3**: 2407, 675B (NVFP4)
- **Pixtral** (vision): 12B (2409)
- **Mistral NeMo**: 12B (2407)
- **Mistral 7B**: v0.2, v0.3; **Mixtral**: 8x7B

## GLM
- **GLM-5 / GLM-5.3**: 5, 5.3, 5.3-Flash
- **GLM 4.x**: 4.7, 4.7-Flash, 4.6, 4.6V-Flash, 4.5, 4.5-Air, 4-32B-0414

## gpt-oss
- **gpt-oss**: 20B, 120B (GGUF + bnb-4bit)

## NVIDIA
- **Nemotron 3**: Nano-4B, Nano-30B-A3B, Super-120B-A12B, Nano-Omni-30B-A3B
- **Nemotron 3.5**: 30B Lightning

## Kimi
- **Kimi**: K3, K2.5, K2.6, K2.7-Code

## Other
- **MiniMax**: M2.5
- **Phi-4**: 14B (instruct), Reasoning, Reasoning-plus, mini, mini-Reasoning
- **Phi-3.5 / Phi-3**: mini, medium
- **Orpheus**: 3B; **LLava**: 1.5 (7B), 1.6 Mistral (7B)
- **TinyLlama**: Chat; **SmolLM 2**: 135M, 360M, 1.7B
- **Zephyr-SFT**: 7B; **Yi**: 6B (v1.0/v1.5), 34B
- **Grok 2**: 270B; **Baidu-ERNIE**: 4.5-21B-A3B; **Hunyuan**: A13B
- **Muse Glimmer** (DeepSeek-V4): 30B; **DeepSeek-V4**: V4-Flash-Vision-Exp,
  V4-Pro-0813, Flash-0731

Notes: MoE families (Qwen3-A3B/A22B, GLM, gpt-oss, DeepSeek, Nemotron, Kimi)
use the faster MoE training path (see `moe.md`). Vision families (Qwen-VL,
Llama 3.2 Vision, Gemma/MedGemma, Pixtral, LLaVA, QVQ) use `FastVisionModel`
(see `vision.md`).

Source: https://unsloth.ai/docs/get-started/unsloth-model-catalog.md (fetched 2026-09-26).

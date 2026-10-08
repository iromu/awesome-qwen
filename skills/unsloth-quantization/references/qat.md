# Quantization-Aware Training (QAT)

End-to-end QAT in Unsloth: trainable fake-quantization that recovers up to ~70% of the accuracy
lost to naive 4-bit post-training quantization (PTQ), with 1-3% benchmark improvements (GPQA,
MMLU Pro) and **no extra inference overhead** — same disk and memory as normal 4-bit.

Sources: `unsloth.ai/docs/blog/quantization-aware-training-qat`, `unsloth.ai/docs/models/gemma-4/qat`,
official notebook `Qwen3_(4B)_Instruct-QAT.ipynb`.

## How it works

TorchAO (1) inserts fake-quantize operations into linear layers — rounding high-precision values
to quantized levels while staying in bfloat16, then dequantizing — so training sees the true
quantization error; (2) after training, converts the fake-quant ops to real quantize/dequantize
ops for inference. QAT + LoRA is supported: quantization is trainable *and* the adapter keeps
training cheap.

Documented recovery numbers: Gemma3-4B recovers 66.9% of lost accuracy on GPQA (+1.0% raw);
Gemma3-12B recovers 45.5% on BBH (+2.1% raw).

## Supported schemes

`qat_scheme` values: `"int4"`, `"fp8-int4"`, `"fp8-fp8"`, `"int8-int4"`, and
`"phone-deployment"` (see `phone-deployment.md`).

## Installation (documented pins)

```bash
pip install --upgrade --no-cache-dir --force-reinstall unsloth unsloth_zoo
pip install torchao==0.14.0 fbgemm-gpu-genai==1.3.0
```

The notebook itself maps torch → torchao: torch 2.8/2.9/2.10 → `torchao==0.16.0`, torch 2.11 →
`torchao==0.18.0`; fbgemm-gpu-genai 1.3.0 (torch 2.8) / 1.4.2 (torch 2.9) / 1.5.0 (2.10/2.11);
plus `transformers==4.55.4` and `trl==0.22.2`.

## Full training loop (from the Qwen3-4B QAT notebook)

```python
from unsloth import FastLanguageModel
import torch

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Qwen3-4B-Instruct-2507",
    max_seq_length = 2048,   # Choose any for long context!
    load_in_4bit = False,    # 4 bit quantization to reduce memory
    load_in_8bit = False,
    full_finetuning = False,
    # token = "YOUR_HF_TOKEN", # HF Token for gated models
)

model = FastLanguageModel.get_peft_model(
    model,
    r = 16,
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj",
                      "gate_proj", "up_proj", "down_proj",],
    lora_alpha = 32,
    lora_dropout = 0,
    bias = "none",
    # We support fp8-int4, fp8-fp8, int8-int4, int4
    qat_scheme = "int4",
    use_gradient_checkpointing = "unsloth",
    random_state = 3407,
    use_rslora = False,
    loftq_config = None,
)
```

Verify QAT was applied:

```python
for module in model.modules():
    if "FakeQuantized" in module.__class__.__name__:
        print("QAT is applied!")
        break
```

Train with the standard `SFTTrainer` (see the notebook; the QAT flow uses
`dataset_text_field = "text"`, `train_on_responses_only(trainer)`, `optim = "adamw_8bit"`,
`learning_rate = 2e-4`, seed 3407).

## Export: convert, then save_pretrained_torchao

After training, convert the FakeQuantizedLinear layers back so the model is inference-ready:

```python
from torchao.quantization import quantize_
from torchao.quantization.qat import QATConfig

quantize_(model, QATConfig(step = "convert"))
```

Then save in the QAT format (same config as training):

```python
model.save_pretrained_torchao(
    "model",
    tokenizer,
)
```

Or pick an explicit TorchAO config:

```python
# Int4 QAT
from torchao.quantization import Int4WeightOnlyConfig
model.save_pretrained_torchao("model", tokenizer, torchao_config = Int4WeightOnlyConfig())

# Int8 QAT
from torchao.quantization import Int8DynamicActivationInt8WeightConfig
model.save_pretrained_torchao("model", tokenizer, torchao_config = Int8DynamicActivationInt8WeightConfig(),)

# Push to HF Hub
model.save_pretrained_torchao(
    "HF_USERNAME/model", # Change hf to your username!
    tokenizer,
    torchao_config = Int4WeightOnlyConfig(),
    push_to_hub = True,
    token = "YOUR_HF_TOKEN", # Get a token at https://huggingface.co/settings/tokens
)
```

The exported model runs in vLLM, Unsloth, and other systems.

## QAT without training (plain PTQ via the same API)

`save_pretrained_torchao` works without any QAT — it is just native quantization. Example,
Dynamic FP8:

```python
from torchao.quantization import PerRow
from torchao.quantization import Float8DynamicActivationFloat8WeightConfig
torchao_config = Float8DynamicActivationFloat8WeightConfig(granularity = PerRow())
model.save_pretrained_torchao(torchao_config = torchao_config)
```

## Gemma 4 QAT specifics

Google's Gemma 4 QAT variants (E2B, E4B, 12B, 26B-A4B, 31B) train with quantization in mind, so
int4 gives **~72% lower memory with near-original performance**:

| Gemma 4     | QAT (int4) GGUF | Original BF16 | Memory saved |
| ----------- | --------------: | ------------: | -----------: |
| **E2B**     |         2.62 GB |       9.31 GB |        71.86% |
| **E4B**     |         4.22 GB |      15.1 GB  |        72.05% |
| **12B**     |         6.72 GB |      23.8 GB  |        71.76% |
| **26B A4B** |        14.2 GB |      50.5 GB  |        71.88% |
| **31B**     |        17.3 GB |      61.4 GB  |        71.82% |

Required memory to run: E2B 3GB, E4B 5GB, 12B 7GB, 26B-A4B 15GB, 31B 18GB.

Key finding: naively converting the QAT checkpoints to llama.cpp `Q4_0` **degrades** accuracy
(26B-A4B: 70.2% top-1). Unsloth's dynamic method forces agreement between llama.cpp's Q4_0
format and the true BF16 QAT lattice, reaching **85.6% top-1 (+15.6%) while being 200MB
smaller**. Mean KLD: E2B 0.00173 (Unsloth) vs 0.05109 (naive Q4_0) — 29x better, and 22%
smaller. Byte-exactness to BF16 QAT goes from 24.77% (naive) to 99.96%.

Consequences:

- Gemma 4 QAT GGUFs are named `UD-Q4_K_XL` (Q4_0 degraded accuracy despite being bigger), and
  there is **only one GGUF per model** — higher precisions make it worse.
- Mobile mixture QAT (E2B/E4B) became `UD-Q2_K_XL` (TQ2_0 for 2-bit layers + negative scaler):
  E2B 2.19GB / 97.82% top-1; E4B 3.22GB / 98.76% top-1.

Recommended inference settings for Gemma 4 QAT: `temperature = 1.0`, `top_p = 0.95`,
`top_k = 64`. For llama-server, enable/disable reasoning with
`--chat-template-kwargs '{"enable_thinking":true}'`.

Run example (26B-A4B):

```bash
./llama.cpp/llama-cli \
    --model unsloth/gemma-4-26B-A4B-it-qat-GGUF/gemma-4-26B-A4B-it-qat-UD-Q4_K_XL.gguf \
    --mmproj unsloth/gemma-4-26B-A4B-it-qat-GGUF/mmproj-BF16.gguf \
    --temp 1.0 \
    --top-p 0.95 \
    --top-k 64
```

# Long-Context & Packing

## Packing (3x faster training, up to 5x)

Unsloth's custom RoPE + MLP Triton kernels plus smart auto packing give up to
**5x faster** (typically 3x) training and **30%-90% less VRAM** with no accuracy
loss.

### Padding-free by default

Padding is wasteful: GPUs can't process different-length rows, so short rows are
padded with 0s up to the longest sequence in the batch. Unsloth now **automatically
uses padding-free batching** on all training runs (no changes needed) with all fast
attention backends (FlashAttention 3, xFormers, SDPA). Training losses match
non-packing runs **exactly**. For Qwen3-8B/32B this cut memory ~60%, was ~2x
faster, with the same loss and grad-norm curves.

Just update Unsloth and padding-free is on by default:

```bash
pip install --upgrade --force-reinstall --no-cache-dir --no-deps unsloth
pip install --upgrade --force-reinstall --no-cache-dir --no-deps unsloth_zoo
```

### When `packing=True` is safe

Set `packing = True` in `SFTConfig` for up to 5x faster training. The speedup
depends on how short your dataset's rows are — the more short sequences, the
faster. Unsloth keeps sequence-length metadata to mask samples correctly
(**uncontaminated** packing — no attention leaks between packed samples), and
uses the fused variable-length RoPE kernel to reset position ids.

```python
from unsloth import FastLanguageModel
from trl import SFTTrainer, SFTConfig

model, tokenizer = FastLanguageModel.from_pretrained(
    "unsloth/Qwen3-14B",
)

trainer = SFTTrainer(
    model = model,
    processing_class = tokenizer,
    train_dataset = dataset,
    args = SFTConfig(
        per_device_train_batch_size = 1,
        max_length = 4096,
        …,
        packing = True, # required to enable sample packing!
    ),
)
trainer.train()
```

**Caution:** `packing=True` changes the training loss and truncates the dataset
row count (multiple short sequences are packed into 1, so the number of
examples shrinks). To keep loss numbers identical, set `packing=False` — auto
padding-free still makes training faster.

`max_length` interplay: packing trims each packed sequence to `max_length`; the
larger `max_length`, the more samples fit per packed sequence. `dataset_num_proc`
controls dataset preprocessing parallelism (separate from packing).

## 500K+ context fine-tuning

New algorithms push long-context training for **any LLM and VLM**. gpt-oss-20b
reaches **500K+ context on a single 80GB H100** (was 80K), and **>750K on a
B200 192GB** GPU — no accuracy degradation.

Key techniques:

- **Fused + chunked cross-entropy loss**: instead of computing LM-head logits
  and cross-entropies over the whole sequence at once, it processes slices
  along the flattened sequence dimension. Chunk size is chosen **automatically
  at runtime** based on free VRAM (more VRAM = larger/faster chunks; less
  VRAM = more chunks). Gives **60% lower VRAM / 3.2x longer context** with no
  speed or accuracy loss. (Smaller contexts use more VRAM / fewer chunks to
  avoid overhead.)
- **Enhanced Gradient Checkpointing**: offloads activations to CPU RAM (the
  original Unsloth offloaded-gradient-checkpointing, April 2024) with CUDA
  Streams; now adds at most **0.1%** training overhead (was 1-3%).
- **Tiled MLP** (collab with Snowflake, from the Arctic Long Sequence Training
  paper): tiles hidden states along the sequence dimension before heavy MLP
  projections, enabling **2x more context**. Auto-patches any module named or
  typed as `mlp`, so nearly all MLP models are supported. Tradeoff: the MLP
  now performs ~3 forward passes + 1 backward per step (nested checkpoint); a
  single GPU pays ~1.3x step time for the same context in exchange for ~40%
  lower VRAM. Enable when context length > hidden dimension.

Enable Tiled MLP in `from_pretrained`:

```py
model, tokenizer = FastLanguageModel.from_pretrained(
    ...,
    unsloth_tiled_mlp = True,
)
```

`num_shards = ceil(seq_len/hidden_size)` is chosen automatically (each tile is
the size of the hidden dimension).

> If a finetune runs out of memory, try `unsloth_tiled_mlp = True`.

### gpt-oss 20B 500K notebook key settings (verbatim)

```python
from unsloth import FastLanguageModel
import torch
max_seq_length = 500_000 # Set long context sequence length here!
dtype = None

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/gpt-oss-20b",
    dtype = dtype, # None for auto detection
    max_seq_length = max_seq_length, # Choose any for long context!
    load_in_4bit = True,  # 4 bit quantization to reduce memory
    full_finetuning = False, # [NEW!] We have full finetuning now!
    unsloth_tiled_mlp = True, # Super long context >500K finetuning!
    # token = "YOUR_HF_TOKEN", # HF Token for gated models
)

model = FastLanguageModel.get_peft_model(
    model,
    r = 8, # Choose any number > 0 ! Suggested 8, 16, 32, 64, 128
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj",
                      "gate_proj", "up_proj", "down_proj",],
    lora_alpha = 16,
    lora_dropout = 0, # Supports any, but = 0 is optimized
    bias = "none",
    use_gradient_checkpointing = "unsloth", # True or "unsloth" for very long context
    random_state = 3407,
    use_rslora = False,
    loftq_config = None,
)
```

Training (SFTTrainer) — note the very long per-step time:

```python
from trl import SFTConfig, SFTTrainer
trainer = SFTTrainer(
    model = model,
    tokenizer = tokenizer,
    train_dataset = dataset,
    args = SFTConfig(
        per_device_train_batch_size = 1,
        gradient_accumulation_steps = 1,
        warmup_steps = 1,
        # num_train_epochs = 1, # Set this for 1 full training run.
        max_steps = 1,
        learning_rate = 2e-4,
        logging_steps = 1,
        optim = "adamw_8bit",
        weight_decay = 0.001,
        lr_scheduler_type = "linear",
        seed = 3407,
        output_dir = "outputs",
        report_to = "none",
    ),
)
trainer_stats = trainer.train()
```

**NOTE:** Long context training can take VERY long to even do 1 step — expect
to wait **~40 minutes** for 500K context lengths or more. To resume:
`trainer.train(resume_from_checkpoint = True)`.

gpt-oss save: `model.save_pretrained("gpt_oss_lora")`, and merged export via
`save_pretrained_merged(..., save_method = "mxfp4")` or `"merged_16bit"`.

Source: https://unsloth.ai/docs/blog/3x-faster-training-packing.md,
https://unsloth.ai/docs/blog/500k-context-length-fine-tuning.md, and
https://github.com/unslothai/notebooks/blob/main/nb/gpt_oss_(20B)_500K_Context_Fine_tuning.ipynb (fetched 2026-09-26).

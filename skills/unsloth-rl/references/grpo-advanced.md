# GRPO Advanced: GRPOConfig Deep Dive

Full parameter reference for `GRPOConfig` when training with Unsloth (from the
advanced RL documentation). Defaults shown where documented.

## Training parameters

- **`beta`** (float, default `0.0`) — KL coefficient.
  - `0.0` ⇒ no reference model loaded (lower memory, faster).
  - Higher `beta` constrains the policy to stay closer to the reference policy.
- **`num_iterations`** (int, default `1`) — PPO epochs per batch (μ). Replays
  data within each gradient accumulation step; e.g. `2` = two forward passes per
  accumulation step.
- **`epsilon`** (float, default `0.2`) — clipping value for token-level
  log-prob ratios (typical ratio range ≈ [-1.2, 1.2] with default ε).
- **`delta`** (float, optional) — enables the **upper** clipping bound for
  **two-sided GRPO** when set. If `None`, standard GRPO clipping is used.
  Recommended `> 1 + ε` when enabled (per the INTELLECT-2 report).
- **`epsilon_high`** (float, optional) — upper-bound epsilon; defaults to
  `epsilon` if unset. DAPO recommends **0.28**.
- **`importance_sampling_level`** ("token" | "sequence", default "token")
  - `"token"`: raw per-token ratios (one weight per token).
  - `"sequence"`: average per-token ratios to a single sequence-level ratio —
    this is how you enable **GSPO**. Sequence-level sampling often gives more
    stable training for sequence-level rewards.
- **`reward_weights`** (list[float], optional) — one weight per reward function.
  If `None`, all weights = 1.0.
- **`scale_rewards`** (str|bool, default `"group"`)
  - `True` / `"group"`: scale by std within each group (unit variance in group).
  - `"batch"`: scale by std across the entire batch (per PPO-Lite).
  - `False` / `"none"`: no scaling — Dr. GRPO recommends not scaling to avoid
    difficulty bias from std scaling.
- **`loss_type`** (str, default `"dapo"`)
  - `"grpo"`: normalizes over sequence length (length bias; not recommended).
  - `"dr_grpo"`: normalizes by a **global constant** (Dr. GRPO; removes length
    bias). Constant ≈ `max_completion_length`.
  - `"dapo"` (default): normalizes by **active tokens in the global accumulated
    batch** (DAPO; removes length bias).
  - `"bnpo"`: normalizes by active tokens in the local batch only (results can
    vary with local batch size; equals GRPO when
    `per_device_train_batch_size == 1`).
- **`mask_truncated_completions`** (bool, default `False`) — when `True`,
  truncated completions are excluded from the loss (recommended by DAPO for
  stability). **Unsloth recommends disabling it**: with many truncated
  completions it can zero out all `completion_mask` entries, making
  `n_mask_per_reward = 0` and KL becomes NaN.
- **`vllm_importance_sampling_correction`** (bool, default `True`) — applies
  Truncated Importance Sampling (TIS) to correct off-policy effects when
  generation (vLLM / fast_inference) differs from the training backend.
  Auto-set to `True` when using vLLM/fast_inference, otherwise `False`.
- **`vllm_importance_sampling_cap`** (float, default `2.0`) — truncation
  parameter C for TIS; upper bound on the importance sampling ratio.
- **`dtype`** — choose `torch.float16` or `torch.bfloat16`. For RL, float16 is
  measurably more stable than bfloat16 (smaller gradient norms; the
  training-inference mismatch grows with generation length in bfloat16).

```python
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Qwen3-4B-Base",
    max_seq_length = 2048,
    load_in_4bit = False,
    fast_inference = True,
    max_lora_rank = 32,
    gpu_memory_utilization = 0.9,
    dtype = torch.float16, # Use torch.float16, torch.bfloat16
)
```

Also available in notebooks: `vllm_sampling_params` (a `vllm.SamplingParams`,
e.g. `min_p=0.1, top_p=1.0, top_k=-1, seed=3407, stop=[tokenizer.eos_token],
include_stop_str_in_output=True`) and `temperature` (default 1.0).

## Generation parameters

- **`temperature`** (float, default 1.0) — use a relatively high (1.0)
  temperature so generations are diverse, which helps learning.
- **`top_p`** (float, default 1.0) — cumulative probability of top tokens to
  consider; must be in (0, 1].
- **`top_k`** (int, optional) — number of highest-probability tokens to keep;
  `None` disables top-k filtering.
- **`min_p`** (float, optional) — minimum token probability, scaled by the most
  likely token's probability. Typical values 0.01–0.2.
- **`repetition_penalty`** (float, default 1.0) — >1.0 encourages new tokens,
  <1.0 encourages repetition.
- **`steps_per_generation`** (int, optional) — number of steps per generation.
  Defaults to `gradient_accumulation_steps`. Mutually exclusive with
  `generation_batch_size`. Messing with it is confusing — the docs recommend
  editing `per_device_train_batch_size` and gradient accumulation instead.

## Batch & throughput parameters

- **`train_batch_size`** — samples **per process** per step. If less than
  `num_generations`, it defaults to `num_generations`.
- **`steps_per_generation`** — microbatches that contribute to **one
  generation's** loss calculation (forward passes only). A new batch of data is
  generated every `steps_per_generation` steps; backprop timing depends on
  `gradient_accumulation_steps`.
- **`num_processes`** — number of distributed training processes (GPUs/workers).
- **`gradient_accumulation_steps`** — microbatches to accumulate before
  backpropagation and optimizer update.
- **`num_generations`** — generations produced **per prompt**, applied **after**
  computing `effective_batch_size`. **Must be > 2** for GRPO (group statistics).

Formulas:

```
effective_batch_size = steps_per_generation * num_processes * train_batch_size
optimizer_steps_per_generation = steps_per_generation / gradient_accumulation_steps
unique_prompts = effective_batch_size / num_generations   # must be > 2
```

### Batch flow example

```
num_gpus = 1
per_device_train_batch_size = 3
steps_per_generation = gradient_accumulation_steps = 4

effective_batch_size = 4 * 3 * 1 = 12
num_generations = 4
unique_prompts = 12 / 4 = 3
```

Generation cycle: step 0 batch [0,0,0] → step 1 [0,1,1] → step 2 [1,1,3] →
step 3 [3,3,3] → optimizer update (accum = 4 reached). The next generation
cycle starts at prompt 4.

## Enabling the variants

GSPO / Dr.GRPO / DAPO / BNPO are all the same trainer with different flags:

```python
training_args = GRPOConfig(
    ...
    epsilon = 0.2,
    epsilon_high = 0.28, # one sided
    delta = 1.5, # two sided

    loss_type = "gspo",
    # or:
    loss_type = "grpo",
    # or:
    loss_type = "dr_grpo",
    # or:
    loss_type = "dapo",
    # or:
    loss_type = "bnpo",

    mask_truncated_completions = True, # (see warning above)
)
```

GSPO reference config from the docs (note the tiny epsilons used for sequence
level ratios):

```python
training_args = GRPOConfig(
    output_dir = "vlm-grpo-unsloth",
    per_device_train_batch_size = 8,
    gradient_accumulation_steps = 4,
    learning_rate = 5e-6,
    adam_beta1 = 0.9,
    adam_beta2 = 0.99,
    weight_decay = 0.1,
    warmup_ratio = 0.1,
    lr_scheduler_type = "cosine",
    optim = "adamw_8bit",
    epsilon = 3e-4,
    epsilon_high = 4e-4,
    num_generations = 8,
    max_prompt_length = 1024,
    max_completion_length = 1024,
    log_completions = False,
    max_grad_norm = 0.1,
    temperature = 0.9,
    num_train_epochs = 2,
    # GSPO is below:
    importance_sampling_level = "sequence",
    # Dr GRPO / GAPO etc
    loss_type = "dr_grpo",
)
```

## RL on unsupported models

For models vLLM doesn't support (e.g. Qwen3.5, gpt-oss), set
`fast_inference=False` when loading — RL still works, just without vLLM
generation:

```python
from unsloth import FastLanguageModel

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Qwen3.5-4B",
    fast_inference = False,
)
```

## vLLM sampling params (notebook pattern)

```python
from vllm import SamplingParams
vllm_sampling_params = SamplingParams(
    min_p = 0.1,
    top_p = 1.0,
    top_k = -1,
    seed = 3407,
    stop = [tokenizer.eos_token],
    include_stop_str_in_output = True,
)

training_args = GRPOConfig(
    vllm_sampling_params = vllm_sampling_params,
    temperature = 1.0,
    ...
)
```

---

Source: unsloth.ai/docs/get-started/reinforcement-learning-rl-guide/advanced-rl-documentation.md (fetched 2026-09-26)
Source: unsloth.ai/docs/get-started/reinforcement-learning-rl-guide/advanced-rl-documentation/gspo-reinforcement-learning.md (fetched 2026-09-26)
Source: unsloth.ai/docs/get-started/reinforcement-learning-rl-guide/advanced-rl-documentation/fp16-vs-bf16-for-rl.md (fetched 2026-09-26)
Source: https://github.com/unslothai/notebooks/blob/main/nb/Qwen3_(4B)-GRPO

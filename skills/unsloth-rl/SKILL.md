---
name: unsloth-rl
description: >-
  Use this skill whenever the user wants to do REINFORCEMENT LEARNING or preference
  alignment with the Unsloth Python library: train a model with GRPO (or GSPO, DAPO,
  Dr.GRPO, BNPO) to reason, follow rules, win a game, or produce verifiable answers;
  write or design reward functions and verifiers (RLVR); DPO-align, ORPO, or KTO a
  model with chosen/rejected preference data; RLHF/PPO questions; FP8 RL, long-context
  GRPO, vision RL (VLM GRPO/GSPO), or training AI agents with RL. Trigger on
  "reasoning model", "R1-style", "reward function", "GRPO", "DPO", "preference data",
  "reinforcement learning", "unsloth", and model families like Qwen, Llama, Gemma,
  gpt-oss, DeepSeek-R1. NOT for plain supervised fine-tuning (SFT/LoRA/QLoRA — use
  unsloth-finetuning), model export/quantization to GGUF/FP8/NVFP4/QAT (use
  unsloth-quantization), or running/serving models and SDKs (use unsloth-inference).
metadata:
  author: "Iván Rodríguez Murillo <wantez@gmail.com>"
  version: 1.0.0
---

# Unsloth Reinforcement Learning

Train open LLMs/VLMs with reinforcement learning and preference alignment using
**Unsloth** (`unsloth` + `unsloth_zoo` + `trl` trainers). Unsloth's RL stack shares
vLLM's weight memory, uses memory-efficient kernels, and supports GRPO/GSPO/DAPO/
Dr.GRPO/BNPO, DPO, ORPO, KTO, FP8 RL, long-context RL, and vision RL.

The canonical entry points are `GRPOTrainer` + `GRPOConfig` from `trl` (for
generation-based RL) and `DPOTrainer`/`ORPOTrainer` from `trl` (for preference
optimization), driven by `FastLanguageModel` / `FastVisionModel` from `unsloth`.

## Instructions

1. Confirm the task belongs here — SFT/LoRA training goes to `unsloth-finetuning`, export to `unsloth-quantization`, serving to `unsloth-inference` (see "When NOT to Use").
2. Pick the algorithm in "Choosing a Method" — GRPO/GSPO/DAPO/Dr.GRPO/BNPO for on-policy RL, DPO/ORPO/KTO for preference data.
3. Design the reward in "Reward Function Design" before anything else; RL runs succeed or fail on the reward function, so treat that section as mandatory reading.
4. Follow "Core Workflow: GRPO" for a full run; look up arguments in "Key APIs" and the matching `reference/*.md` file (`grpo-basics.md`, `grpo-advanced.md`, `preference.md`, `agents-rl.md`).
5. Check "Pitfalls" before running.

## When to Use

- The user wants to turn an instruct (or base) model into a **reasoning model**
  (R1-style thinking traces) — GRPO on math/code/verifiable tasks.
- The user wants to **design reward functions / verifiers** (RLVR) for a task:
  following a format, answering questions, winning a game, generating code.
- The user has **preference data** (chosen/rejected pairs, or KTO labels) and wants
  DPO / ORPO / KTO alignment.
- The user asks about RL variants: GRPO, GSPO, DAPO, Dr.GRPO, BNPO, PPO, RLHF,
  RLVR — or RL hardware/VRAM planning, FP8 RL, long-context RL, vision RL, or
  training agents with RL.

## When NOT to Use

| Scenario | Use instead |
|---|---|
| Plain supervised fine-tuning: SFT, LoRA, QLoRA, continued pretraining | `unsloth-finetuning` |
| Exporting/quantizing a trained model: GGUF, FP8/NVFP4 serving quants, QAT | `unsloth-quantization` |
| Running/serving models: vLLM/SGLang serving, Ollama, API endpoints, SDKs | `unsloth-inference` |

(You may still *mention* these handoffs inside an RL answer — e.g. saving the GRPO
LoRA to GGUF — but the export procedure itself belongs to `unsloth-quantization`.)

## Choosing a Method

All methods below run on Unsloth + TRL. Pick by what signal you have about "good":

| Method | Trainer | Needs | Use when |
|---|---|---|---|
| **GRPO** | `GRPOTrainer` | prompt + reward functions (no labels per row) | You can *verify* a generated answer (math, code, format, game outcome). The default choice for reasoning/RLVR. No value model, no reward model — group statistics replace both. |
| **GSPO** | `GRPOTrainer` (`importance_sampling_level="sequence"`) | same as GRPO | Sequence-level rewards (one score per completion). More stable than token-level importance weights for long completions; the Qwen team's variant. |
| **DAPO / Dr.GRPO / BNPO** | `GRPOTrainer` (`loss_type="dapo"/"dr_grpo"/"bnpo"`) | same as GRPO | Loss-normalization variants: `dapo` (default) normalizes by active tokens in the global batch; `dr_grpo` by a global constant; `bnpo` by active tokens in the local batch; `grpo` (length-normalized, has length bias — not recommended). |
| **DPO** | `DPOTrainer` | chosen/rejected preference pairs | You have explicit preference pairs (e.g. UltraFeedback-style data) and want direct preference optimization without a reward model. |
| **ORPO** | `ORPOTrainer` | prompt + chosen + rejected | Preference alignment that also learns the SFT objective in one step (odds-ratio penalty on rejected, likelihood on chosen); no separate reference model needed. |
| **KTO** | `KTOTrainer` (see `reference/preference.md`) | single "good/bad" label per response | You only have binary labels, not pairs. |

Quick decision path: *Can you write a verifier that scores a fresh generation?*
Yes → GRPO (or GSPO for sequence-level rewards). *Do you have preference pairs?*
Yes → DPO (ORPO if you want SFT folded in; KTO if labels are single, not paired).

## Core Workflow: GRPO

Canonical code below is from the official `Llama3.1_(8B)-GRPO` notebook.

1. **Install.** `pip install unsloth vllm`, plus `pip install diffusers` when running
   locally (a missing import error appears without it). Use the latest vLLM. The
   notebooks pin `transformers==4.56.2` and `trl==0.22.2` (vision notebooks use
   `transformers==4.57.0` + `trl==0.26.2`) — keep those pins when reproducing.
   Set `UNSLOTH_VLLM_STANDBY=1` before any Unsloth import to enable the memory
   efficient Standby feature (see `reference/vram-and-hardware.md`).

```python
%%capture
import os
os.environ["UNSLOTH_VLLM_STANDBY"] = "1" # [NEW] Extra 30% context lengths!
!pip install unsloth vllm
```

2. **Load the model** with vLLM fast inference and a LoRA adapter:

```python
from unsloth import FastLanguageModel
import torch
max_seq_length = 1024 # Can increase for longer reasoning traces
lora_rank = 32 # Larger rank = smarter, but slower

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/meta-Llama-3.1-8B-Instruct",
    max_seq_length = max_seq_length,
    load_in_4bit = True, # False for LoRA 16bit
    fast_inference = True, # Enable vllm fast inference
    max_lora_rank = lora_rank,
    gpu_memory_utilization = 0.9, # Reduce if out of memory
)

model = FastLanguageModel.get_peft_model(
    model,
    r = lora_rank, # Choose any number > 0 ! Suggested 8, 16, 32, 64, 128
    target_modules = [
        "q_proj", "k_proj", "v_proj", "o_proj",
        "gate_proj", "up_proj", "down_proj",
    ], # Remove QKVO if out of memory
    lora_alpha = lora_rank,
    use_gradient_checkpointing = "unsloth", # Enable long context finetuning
    random_state = 3407,
)
```

   If the model is **not supported by vLLM** (e.g. Qwen3.5), set
   `fast_inference=False` — RL still works, just without vLLM generation.

3. **Prepare the dataset.** Two columns: `prompt` (chat-template messages) and
   `answer` (ground truth). The answer must NOT reveal the reasoning — GRPO's job
   is to discover the reasoning; leaking it defeats the point.

```python
import re
from datasets import load_dataset, Dataset

SYSTEM_PROMPT = """
Respond in the following format:
<reasoning>
...
</reasoning>
<answer>
...
</answer>
"""

def extract_hash_answer(text: str) -> str | None:
    if "####" not in text:
        return None
    return text.split("####")[1].strip()

def get_gsm8k_questions(split = "train") -> Dataset:
    data = load_dataset('openai/gsm8k', 'main')[split]
    data = data.map(lambda x: {
        'prompt': [
            {'role': 'system', 'content': SYSTEM_PROMPT},
            {'role': 'user', 'content': x['question']}
        ],
        'answer': extract_hash_answer(x['answer'])
    })
    return data

dataset = get_gsm8k_questions()
```

4. **Write reward functions.** Each is a Python function returning a list of floats,
   one per completion. Use a *rubric*: several small verifiable rewards (format,
   integer-ness, correctness) rather than one all-consuming score. See
   `reference/reward-functions.md` for the full GSM8K set and design guidance.

```python
def correctness_reward_func(prompts, completions, answer, **kwargs) -> list[float]:
    responses = [completion[0]['content'] for completion in completions]
    extracted_responses = [extract_xml_answer(r) for r in responses]
    return [2.0 if r == a else 0.0 for r, a in zip(extracted_responses, answer)]

def int_reward_func(completions, **kwargs) -> list[float]:
    responses = [completion[0]['content'] for completion in completions]
    extracted_responses = [extract_xml_answer(r) for r in responses]
    return [0.5 if r.isdigit() else 0.0 for r in extracted_responses]
```

5. **Configure `GRPOConfig` and run `GRPOTrainer`:**

```python
max_prompt_length = 256

from trl import GRPOConfig, GRPOTrainer
training_args = GRPOConfig(
    learning_rate = 5e-6,
    adam_beta1 = 0.9,
    adam_beta2 = 0.99,
    weight_decay = 0.001,
    warmup_ratio = 0.1,
    lr_scheduler_type = "cosine",
    optim = "paged_adamw_8bit",
    logging_steps = 1,
    per_device_train_batch_size = 1,
    gradient_accumulation_steps = 1, # Increase to 4 for smoother training
    num_generations = 6, # Decrease if out of memory
    max_prompt_length = max_prompt_length,
    max_completion_length = max_seq_length - max_prompt_length,
    # num_train_epochs = 1, # Set to 1 for a full training run
    max_steps = 250,
    save_steps = 250,
    max_grad_norm = 0.1,
    report_to = "none", # Can use Weights & Biases
    output_dir = "outputs",
)

trainer = GRPOTrainer(
    model = model,
    processing_class = tokenizer,
    reward_funcs = [
        xmlcount_reward_func,
        soft_format_reward_func,
        strict_format_reward_func,
        int_reward_func,
        correctness_reward_func,
    ],
    args = training_args,
    train_dataset = dataset,
)
trainer.train()
```

   Key args: `num_generations` (completions per prompt — must be > 2 for GRPO's
   group statistics; raise from 4 to 8+ for more diversity), `max_prompt_length`,
   `max_completion_length` (completion budget = `max_seq_length - prompt`),
   `learning_rate` (~5e-6 is the notebook default), `use_vllm`/`fast_inference`
   (vLLM generation; `vllm_config` / `vllm_sampling_params` to tune sampling), and
   `loss_type` (`"dapo"` default, `"grpo"`, `"dr_grpo"`, `"bnpo"`, `"gspo"`).
   Full deep dive in `reference/grpo-advanced.md`.

6. **Watch the reward curve.** Expect 0 reward for the first ~100 steps and wait
   for at least **300 steps** before judging — reward vs step should trend up.
   Unsloth logs per-reward-function and aggregated reward columns built in
   (no wandb required). If reward never rises after 300+ steps, the reward
   function is usually the problem (check `reference/reward-hacking.md` and the
   Advanced GRPO notebooks, which use stronger rubrics).

7. **Save and evaluate.** `model.save_lora("grpo_saved_lora")`, then load it back
   and test — the *untrained* in-memory model usually shows no reasoning, so the
   saved LoRA is what you evaluate:

```python
model.save_lora("grpo_saved_lora")

text = tokenizer.apply_chat_template([
    {"role" : "system", "content" : SYSTEM_PROMPT},
    {"role" : "user", "content" : "Calculate pi."},
], tokenize = False, add_generation_prompt = True)

from vllm import SamplingParams
sampling_params = SamplingParams(
    temperature = 0.8,
    top_p = 0.95,
    max_tokens = 1024,
)
output = model.fast_generate(
    text,
    sampling_params = sampling_params,
    lora_request = model.load_lora("grpo_saved_lora"),
)[0].outputs[0].text
```

   Merged/quantized saves (`save_pretrained_merged`, `push_to_hub_gguf`) belong to
   the `unsloth-quantization` / `unsloth-inference` skills.

## Reward Function Design

- A **verifier** checks correctness (boolean-ish); a **reward function** converts
  that into a numeric score (can be negative). In practice you usually write
  reward functions that *use* verification logic.
- Prefer a **rubric**: several small, independently verifiable rewards. Example —
  email automation: contains required keyword +1, exact match to ideal response
  +1, too long -1, recipient's name present +1, signature block present +1.
- Common shapes: exact match (GSM8K `correctness_reward_func` → 2.0/0.0),
  contains/regex (format rewards), integer-only (`int_reward_func` → 0.5/0.0),
  length penalty, and **proximity** rewards (reward 9 over 10 more than 3 — the
  Advanced notebooks score by ratio bands).
- Reward functions take `(prompts, completions, answer, **kwargs)` (or any subset)
  and return `list[float]` — one float per completion. `completions` is a list of
  lists of message dicts; read `completion[0]["content"]`.
- Poorly designed rewards degrade performance — test them on actual model
  generations before training.

Full code: `reference/reward-functions.md`.

## Key APIs

| API | Source | Purpose / key arguments |
|---|---|---|
| `FastLanguageModel.from_pretrained(model_name, max_seq_length, load_in_4bit, fast_inference, max_lora_rank, gpu_memory_utilization, dtype, load_in_fp8)` | `unsloth` | Load model (+ tokenizer). `fast_inference=True` enables vLLM; `load_in_fp8=True` enables FP8 RL. |
| `FastLanguageModel.get_peft_model(model, r, target_modules, lora_alpha, use_gradient_checkpointing="unsloth", random_state)` | `unsloth` | Attach LoRA. |
| `GRPOTrainer(model, processing_class, reward_funcs, args, train_dataset)` | `trl` | Generation-based RL (GRPO/GSPO/DAPO/Dr.GRPO/BNPO). |
| `GRPOConfig(...)` | `trl` | `num_generations` (>2), `max_prompt_length`, `max_completion_length`, `learning_rate`, `loss_type`, `epsilon`/`epsilon_high`/`delta`, `importance_sampling_level`, `scale_rewards`, `mask_truncated_completions`, `vllm_config`/`vllm_sampling_params`, `temperature`, `seed`. |
| `DPOTrainer(model, ref_model=None, args=DPOConfig(...), beta, train_dataset, tokenizer, max_length, max_prompt_length)` | `trl` | Preference optimization on chosen/rejected pairs. **Call `PatchDPOTrainer()` from `unsloth` first.** |
| `ORPOTrainer(model, train_dataset, tokenizer, args=ORPOConfig(...))` | `trl` | Single-step odds-ratio preference training (prompt/chosen/rejected columns). |
| `KTOTrainer` | `trl` | Binary-label preference training (see `reference/preference.md`). |
| `model.save_lora(path)` / `model.load_lora(path)` | `unsloth` | Save/load the RL LoRA for evaluation. |
| `model.fast_generate(prompt, sampling_params, lora_request)` | `unsloth` | vLLM-powered inference for testing. |

## References

| Topic | File |
|---|---|
| RLHF → PPO → GRPO → RLVR history, group relative advantage, how GRPO trains | `reference/grpo-basics.md` |
| Reward function design: full GSM8K + Advanced notebook code, rubrics | `reference/reward-functions.md` |
| GRPOConfig deep dive: batching, generations, loss types, clipping, vLLM | `reference/grpo-advanced.md` |
| DPO / ORPO / KTO walkthroughs with trainer code | `reference/preference.md` |
| Vision RL: FastVisionModel GRPO/GSPO (Qwen3-VL) | `reference/vision-rl.md` |
| Agent RL: 2048 game env, custom rewards, ART/RULER | `reference/agents-rl.md` |
| Reward hacking: signs and counters | `reference/reward-hacking.md` |
| VRAM rules, Standby, FP8 RL, long-context GRPO (380K/500K), hardware planning | `reference/vram-and-hardware.md` |

## Examples

**"Make the model explain its reasoning on math problems."** "Choosing a Method" -> GRPO family; write the verifier in "Reward Function Design" (answer equality beats free-form judging) before touching trainer args; "Core Workflow: GRPO" shows the full run.

**"We have 10k chosen/rejected pairs, no reward function."** Preference branch -> DPO/ORPO/KTO via `reference/preference.md`; if the data is really plain SFT pairs, say so - preference training is the wrong tool there.

**"Train an agent that calls tools inside a game."** `reference/agents-rl.md` for tool-use RL recipes and their masking caveats; "Key APIs" for the vLLM rollout-engine config that shares weight memory.

## Pitfalls

- **RL needs probability > 0.** If the base model can never produce the target
  behavior, RL never works. Start from an instruct model that partially follows
  instructions; for base models, pre-fine-tune the format first (see
  `reference/grpo-basics.md` and the Qwen3 Base GRPO notebook).
- **Data size:** ~500 rows is ideal; 10 rows can work but expect weaker results.
  Reusing data across epochs is fine — more training generally helps GRPO.
- **Be patient: 300 steps minimum** before judging; 0 reward for the first ~100
  steps is normal. Some runs need 1000+ steps.
- **FP16 vs BF16 mismatch:** bfloat16 RL can drift between the inference and
  training backends as generations lengthen; float16 is measurably more stable
  (set `dtype = torch.float16`). Also use a recent vLLM — pre-0.11.0 had an A100
  cascade-attention bug that broke RL stability.
- **VRAM rule of thumb (QLoRA 4-bit):** model parameters (B) ≈ GB of VRAM needed;
  16-bit LoRA needs ~4x more. More context = more VRAM.
- **`mask_truncated_completions`:** despite being "recommended by DAPO", Unsloth
  recommends leaving it **False** — with many truncated completions it can zero
  out the whole completion mask and make KL NaN.
- **Clipping is one- vs two-sided:** `epsilon` (default 0.2) is the lower clip;
  `epsilon_high` raises the upper bound (DAPO suggests 0.28); `delta` (e.g. 1.5)
  enables two-sided clipping (recommended `> 1 + epsilon`).
- **`num_generations` must be > 2** — with one sample the group std is 0 and the
  z-scored advantages are undefined.
- **Local installs:** `pip install diffusers` if you get import errors; keep vLLM
  current.
- **Reward hacking:** watch for the model exploiting the verifier (importing
  numpy to dodge code tasks, caching answers, editing the timer). Counters in
  `reference/reward-hacking.md`.
- **gpt-oss:** vLLM does not yet support RL for it — use Unsloth's native
  inference (`fast_inference=False`), keep Flash Attention 3 OFF (wrong losses
  for attention sinks), and save with `save_method="mxfp4"` or `merged_16bit`.

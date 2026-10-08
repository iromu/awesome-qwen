# GRPO Basics: From RLHF to GRPO and RLVR

Conceptual background for GRPO training with Unsloth, so you can reason about
hyperparameters and diagnose runs.

## What RL does (in one line)

Increase the chance of "good" outcomes, decrease the chance of "bad" outcomes.
That's it. The rest is definitions:

- **Action** — what the model generates (a sentence, a completion, a code snippet).
- **Reward** — a signal of how good/bad the action was (instruction followed?
  correct answer? game won?).
- **Environment** — the scenario the model works in (answering a question, playing
  a game, executing code).

A toy example: for "What is 2 + 2?" an unaligned model outputs 3, 4, C, D, -10...
"Numbers are better than C/D, 3 is better than 8, 4 is correct" — you just designed
a reward function.

## History: RLHF → PPO → GRPO → RLVR

1. **RLHF** (OpenAI): train an "agent" so its outputs to a question (the *state*)
   are rated more useful by humans (e.g. ChatGPT thumbs up/down).
2. **PPO** (Proximal Policy Optimization): the algorithm to do RLHF. The agent is
   the language model, composed of three systems:
   - the **Generating Policy** (current trained model),
   - the **Reference Policy** (original model),
   - the **Value Model** (average reward estimator).

   A **Reward Model** computes the reward for the current environment; the goal is
   to maximize it. The `clip(..., 1-ε, 1+ε)` term keeps PPO from taking too-large
   steps; a KL term with `beta > 0` keeps the model from drifting too far from the
   reference.
3. **GRPO** (Group Relative Policy Optimization, DeepSeek — used to train R1):
   two removals vs PPO:
   - the **Value Model is removed**, replaced with statistics from calling the
     reward function multiple times,
   - the **Reward Model is removed**, replaced with a custom reward function —
     which is exactly what **RLVR** (Reinforcement Learning with Verifiable
     Rewards) provides.

   Result: GRPO is extremely memory- and speed-efficient — no extra models to
   load.
4. **RLVR**: reward the model on tasks with easy-to-verify solutions — math
   (2+2=4) and code (did it execute?) are the classics. Designing verifiers is
   the hard part. GRPO use-cases go beyond math/code: the reasoning process
   helps email automation, database retrieval, law, medicine — the trick is to
   define a **rubric: a list of smaller verifiable rewards, not one all-consuming
   singular reward** (the approach OpenAI popularized in its reinforcement
   finetuning / RFT offering).

## Why "Group Relative"? — the advantage computation

GRPO removed the value model, but still needs the "average reward" for the current
state. The trick: **sample the LLM**. For each prompt, generate N completions
(`num_generations`), score each with the reward function(s), then compute the
**mean** and **standard deviation** of the group and **z-score standardize**:

```
advantage_i = (reward_i - mean(rewards)) / std(rewards)
```

These advantages `A` replace the value model entirely — big memory savings.

Example: "What is 2+2?" sampled 4 times → 4, 3, D, C. Rewards are computed per
answer, then the group statistics produce the advantages used in the policy
gradient.

Consequence: **you need at least 2 generations per prompt** — with n=1 the std is
0 and the z-score is 0/0, undefined. (This is also why Unsloth's context-length
benchmarks for GRPO count 2 generations per prompt.)

## How GRPO trains a model

1. For each question–answer pair, the model generates multiple responses (e.g. 8).
2. Each response is evaluated with the reward functions.
3. The model updates its weights every step using the group-relative advantages.
   If you have 300 rows of data, that's 300 steps per epoch (900 for 3 epochs).
   You can increase generations per question (e.g. 8 → 16) for more signal.

Regular fine-tuning (SFT) only maximizes next-word prediction probability; GRPO
**optimizes the reward function directly** while learning how an answer was
derived rather than memorizing responses. Data can be reused across epochs.

## "Patience is All You Need" (a.k.a. Luck)

RL needs only two things: (1) a question/instruction, and (2) a reward function +
verifier. With those, you can call the model infinitely until a good answer shows
up — for "2+2", an untrained model emits garbage: 0, cat, -10, 1928, 3, A, B,
122... then *suddenly 4*. The reward signal was 0, 0, 0, ... then suddenly 1.

If the probability of the correct answer is a small non-zero number, RL will
eventually hit it — and the bad answers along the way actively *push the
distribution away from bad outputs*, so RL is efficient, not just waiting.

**If the probability is always 0, RL never works.** This is why people start RL
from an already instruction-finetuned model: it can partially follow instructions,
which boosts the probability above 0. For base models, pre-fine-tune the format
first (see the `Qwen3_(4B)-GRPO` notebook's SFT priming step) so GRPO doesn't
waste its budget learning the format.

## Practical numbers from the docs

- Wait for at least **300 steps** before the reward meaningfully increases;
  0 reward for the first ~100 steps is normal; 1000+ steps may be needed.
- **~500 rows of data** is ideal; 10 rows can work.
- Apply GRPO to models **≥ 1.5B parameters** so thinking tokens form correctly.
- Unsloth's built-in logging tracks every reward function plus the aggregated
  reward (no wandb needed).
- Further reading: Nathan Lambert's RLHF Book (rlhfbook.com), Yannic Kilcher's
  GRPO video, Unsloth's AI Engineer 2025 RL workshop (docs.unsloth.ai/ai-engineers-2025).

---

Source: unsloth.ai/docs/get-started/reinforcement-learning-rl-guide.md (fetched 2026-09-26)
Source: unsloth.ai/docs/get-started/reinforcement-learning-rl-guide/tutorial-train-your-own-reasoning-model-with-grpo.md (fetched 2026-09-26)
Source: https://github.com/unslothai/notebooks/blob/main/nb/Qwen3_(4B)-GRPO (format pre-fine-tuning step)

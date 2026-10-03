# RL Reward Hacking: Signs and Counters

RL's ultimate goal is to maximize a reward — but RL can **cheat**. When the
algorithm learns a trick or exploits something to increase the reward without
actually doing the task, that's **reward hacking**. It's why models learn to
modify unit tests to pass coding challenges — a critical blocker for real-world
deployment.

In Unsloth's gpt-oss RL work (matrix-multiplication kernel generation), the
model was observed to: edit the timing function, outsource to other libraries,
cache the results, and outright cheat. After countering, the model generates
genuinely optimized kernels, not clever cheats.

## Common failure modes and counters

### 1. Laziness (library shortcuts)

RL learns to call Numpy/PyTorch/other libraries, which invoke optimized CUDA
kernels — the "solution" is the library, not the generated code.

**Counter:** inspect the generated code for non-standard Python imports before
executing. Unsloth ships `check_python_modules` for exactly this:

```python
from unsloth import check_python_modules

ok, info = check_python_modules("""
def strategy(board):
    import math
    return "W"
""")
print("Only Python imports?", ok)  # True
print(info)

ok, info = check_python_modules("""
def strategy(board):
    from numpy import matmul
    return "W"
""")
print("Only Python imports?", ok)  # False -> penalize
```

### 2. Caching & cheating

RL learns to cache the result of the output, or to find the actual answer by
inspecting Python global variables.

**Counters:**
- Wipe the cache with a large fake matrix before benchmarking.
- Benchmark carefully with multiple loops and turns (one-shot timings are
  gameable).
- Restrict the executed function's `locals` and `globals`.

### 3. Cheating the measurement

RL learns to edit the timing/scoring function to report 0 elapsed time (or
directly set the score).

**Counters:**
- Disallow global variable access entirely.
- Create the function via `exec` but save its output to an empty dict (so it
  can't leak into or read from shared state).
- Disallow global access via `types.FunctionType(f.__code__, {})`.

Unsloth's `create_locked_down_function` bundles this:

```python
from unsloth import create_locked_down_function

function = """
def import_numpy():
    np.matmul
    print("Success")
"""
f = create_locked_down_function(function)
try:
    f()
except Exception as e:
    print(str(e))  # blocked: no global access
```

## Wiring it into reward functions

The pattern from the 2048 notebook (see `reference/agents-rl.md`):

1. `function_works` — extract the code, run `check_python_modules`, compile with
   `create_locked_down_function`; score +1.0 valid / -0.5 compile error /
   -2.0 invalid imports.
2. `no_cheating` — `check_python_modules` gate; +1.0 clean, **-20.0** for any
   non-standard import (heavy penalty), -1.0 if no function at all.
3. `strategy_succeeds` — actually play the game with the strategy (time-limited
   via `execute_with_time_limit`); +20.0 win, +2.0 loss with a working function,
   -1.0 timeout, -3.0 exception.

General rules when designing an environment for RL:

- The verifier must be **opaque to the model**: the model should never see or
  be able to modify the scoring code.
- **Time-limit every execution** — a non-terminating strategy is both a DoS and
  a signal of failure (`from unsloth import execute_with_time_limit`).
- **Randomize the environment seed per rollout** so cached answers don't
  transfer (`np.random.randint(10000)` per batch in the notebook).
- **Penalize cheating far more heavily** than you reward success (e.g. -20.0
  vs +20.0) — the model needs a strong gradient away from exploits.
- Watch the reward curve: a sudden jump with unchanged completion quality is
  the classic signature of a discovered exploit.

---

Source: unsloth.ai/docs/get-started/reinforcement-learning-rl-guide/advanced-rl-documentation/rl-reward-hacking.md (fetched 2026-09-26)
Source: unsloth.ai/docs/models/gpt-oss-how-to-run-and-fine-tune/gpt-oss-reinforcement-learning.md (fetched 2026-09-26)
Source: https://github.com/unslothai/notebooks/blob/main/nb/gpt_oss_(20B)_Reinforcement_Learning_2048_Game

# Training AI Agents with RL

Two documented approaches: (1) a full custom-environment GRPO run (the gpt-oss
2048 game notebook), and (2) ART (Agent Reinforcement Trainer) for multi-turn
agents built on Unsloth's GRPOTrainer.

## The 2048 game (gpt-oss-20B notebook)

Goal: make gpt-oss *devise a strategy* for 2048, run that strategy until win or
loss, and reward the model for good strategies. The model outputs a Python
`strategy(board)` function (backticked); the environment plays the game with
WASD actions.

### Install / load (4-bit RL, free T4)

```python
%%capture
import os, importlib.util
!pip install --upgrade -qqq uv
if importlib.util.find_spec("torch") is None or "COLAB_" in "".join(os.environ.keys()):
    try: import numpy; get_numpy = f"numpy=={numpy.__version__}"
    except: get_numpy = "numpy"
    !uv pip install -qqq \
        "torch>=2.8.0" "triton>=3.4.0" {get_numpy} torchvision bitsandbytes "transformers==4.56.2" \
        "unsloth_zoo[base] @ git+https://github.com/unslothai/unsloth-zoo" \
        "unsloth[base] @ git+https://github.com/unslothai/unsloth" \
        git+https://github.com/triton-lang/triton.git@0add68262ab0a2e33b84524346cb27cbb2787356#subdirectory=python/triton_kernels
elif importlib.util.find_spec("unsloth") is None:
    !uv pip install -qqq unsloth
!uv pip install --upgrade --no-deps transformers==4.56.2 "tokenizers>=0.22.0,<=0.23.0" trl==0.22.2 unsloth unsloth_zoo
!uv pip install --no-deps --upgrade "torchao>=0.16.0"
```

```python
from unsloth import FastLanguageModel
import torch
max_seq_length = 768 # Can increase for longer RL output
lora_rank = 4        # Larger rank = smarter, but slower
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/gpt-oss-20b", # unsloth/gpt-oss-20b-BF16 for H100s
    max_seq_length = max_seq_length,
    load_in_4bit = True,      # False for LoRA 16bit. Choose False on H100s
    offload_embedding = True, # Reduces VRAM by 1GB
)

model = FastLanguageModel.get_peft_model(
    model,
    r = lora_rank,
    target_modules = [
        "q_proj", "k_proj", "v_proj", "o_proj",
        "gate_proj", "up_proj", "down_proj",
    ],
    lora_alpha = lora_rank*2, # *2 speeds up training
    use_gradient_checkpointing = "unsloth",
    random_state = 3407,
)
```

Note: gpt-oss RL is NOT vLLM-compatible — Unsloth's native (Transformers-based)
inference is used, so no `fast_inference` here.

### Environment

The notebook ships a `GameBoard` dataclass (GPT-5-generated): `size`, `seed`,
`target` (default 2048), `probability_fours = 0.10` (original 2048 spawns a 4
10% of the time). API: `game.board()` (iterable view), `game.state()`
(`"ongoing"` / `"success"` / `"failed"`), `game.do_action("A"|"W"|"S"|"D")`.
Invalid actions flip the state to `"failed"`.

Strategy execution is time-limited so a bad strategy can't hang the run:

```python
from typing import Callable
from unsloth import execute_with_time_limit

def _execute_strategy(strategy : Callable, game : GameBoard):
    assert callable(strategy)
    steps = 0
    while game.state() == "ongoing":
        action = strategy(list(game.board()))
        steps += 1
        if type(action) is not str:
            return steps, "failed"
        game.do_action(action)
    return steps, game.state()

@execute_with_time_limit(5)
def execute_strategy(strategy : Callable, game : GameBoard):
    return _execute_strategy(strategy, game)
```

### Reward-hacking countermeasures (code execution)

- `check_python_modules(code)` — verifies the generated code only imports
  standard Python (blocks `numpy`/`torch` shortcuts, i.e. "laziness").
- `create_locked_down_function(code)` — compiles the function with restricted
  `locals`/`globals` so it can't read global variables (blocks caching/cheating).

```python
from unsloth import check_python_modules, create_locked_down_function

ok, info = check_python_modules("def a")   # -> ok, info
f = create_locked_down_function("def add(a, b):\n    return a + b")
```

### Reward functions

`extract_function(text)` pulls the backticked `def strategy(board):` block out
of a completion. Then three rewards:

```python
def function_works(completions, **kwargs):
    scores = []
    for completion in completions:
        score = 0
        response = completion[0]["content"]
        function = extract_function(response)
        if function is not None:
            ok, info = check_python_modules(function)
        if function is None or "error" in info:
            score = -2.0
        else:
            try:
                new_strategy = create_locked_down_function(function)
                score = 1.0
            except:
                score = -0.5
        scores.append(score)
    return scores

def no_cheating(completions, **kwargs):
    scores = []
    for completion in completions:
        score = 0
        response = completion[0]["content"]
        function = extract_function(response)
        if function is not None:
            ok, info = check_python_modules(function)
            scores.append(1.0 if ok else -20.0) # Penalize heavily!
        else:
            scores.append(-1.0) # Failed creating function
    return scores

import numpy as np
global PRINTER
PRINTER = 0
def strategy_succeeds(completions, **kwargs):
    global PRINTER
    scores = []
    seed = np.random.randint(10000)
    for completion in completions:
        printed = False
        score = 0
        response = completion[0]["content"]
        function = extract_function(response)
        if PRINTER % 5 == 0:
            printed = True
            print(function)
        PRINTER += 1
        if function is not None:
            ok, info = check_python_modules(function)
        if function is None or "error" in info:
            scores.append(0)
            continue
        try:
            new_strategy = create_locked_down_function(function)
        except:
            scores.append(0)
            continue
        try:
            game = GameBoard(size = 6, seed = seed, target = 2048, probability_fours = 0.10)
            steps, game_state = execute_strategy(new_strategy, game)
            if game_state == "success":
                scores.append(20.0) # Success - massively reward!
            else:
                scores.append(2.0) # Failed but function works!
        except TimeoutError as e:
            scores.append(-1.0) # Failed with timeout
        except Exception as e:
            scores.append(-3.0) # Failed
    return scores
```

### Prompt, dataset, training

The prompt asks the model to output only a short backticked Python function
taking the board (list of lists) and returning one of "W","A","S","D". The
dataset is just the prompt repeated (1000 rows) plus a `reasoning_effort:
"low"` column (gpt-oss reasoning effort — "high" needs H100-class VRAM):

```python
from datasets import Dataset
dataset = Dataset.from_list([{"prompt" : [{"role": "user", "content": prompt.strip()}], "answer" : 0, "reasoning_effort": "low"}]*1000)
maximum_length = len(tokenizer.apply_chat_template([{"role": "user", "content": prompt.strip()}], add_generation_prompt = True))
```

```python
max_prompt_length = maximum_length + 1 # + 1 just in case!
max_completion_length = max_seq_length - max_prompt_length

from trl import GRPOConfig, GRPOTrainer
training_args = GRPOConfig(
    temperature = 1.0,
    learning_rate = 5e-5,
    weight_decay = 0.001,
    warmup_ratio = 0.1,
    lr_scheduler_type = "linear",
    optim = "adamw_8bit",
    logging_steps = 1,
    per_device_train_batch_size = 1,
    gradient_accumulation_steps = 1,
    num_generations = 2, # Decrease if out of memory
    max_prompt_length = max_prompt_length,
    max_completion_length = max_completion_length,
    max_steps = 1000,
    save_steps = 100,
    report_to = "none",
    output_dir = "outputs",
)

trainer = GRPOTrainer(
    model = model,
    processing_class = tokenizer,
    reward_funcs = [
        function_works,
        no_cheating,
        strategy_succeeds,
    ],
    args = training_args,
    train_dataset = dataset,
)
trainer.train()
```

A free T4 takes ~5 minutes per generation; A100/H100 are much faster.

### Inference & save (gpt-oss specifics)

Inference uses `apply_chat_template(..., reasoning_effort = "low")` +
`model.generate`. Save merged as MXFP4 (gpt-oss native precision) or 16-bit:

```python
model.save_pretrained_merged("finetuned_model", tokenizer, save_method = "mxfp4")
model.save_pretrained_merged("finetuned_model", tokenizer, save_method = "merged_16bit")
```

gpt-oss gotchas: FA3 must be OFF (no backward pass for attention sinks → wrong
losses; other frameworks enable it by default); vLLM can't do RL for gpt-oss.

## ART (Agent Reinforcement Trainer) for multi-turn agents

ART (openpipe/art) builds on Unsloth's GRPOTrainer and adds:

1. **Multi-turn trajectories** — trajectories built as the agent executes
   (tool calls/responses, sub-agent calls, non-linear histories) are scored and
   fed to GRPO.
2. **Flexible integration** — a minimal-dependency "frontend" client wraps your
   existing agent loop; the "backend" (training) can be colocated
   (`LocalBackend`) or remote, and serves the training model via an
   OpenAI-compatible API.
3. **RULER** — a built-in zero-shot LLM-elicited reward function that often
   matches or beats hand-written rewards:

```python
judged_group = await ruler_score_group(group, "openai/o3")
```

```python
import art
from art.rewards import ruler_score_group

model = art.TrainableModel(
    name="agent-001",
    project="my-agentic-task",
    base_model="Qwen/Qwen2.5-14B-Instruct",  # Any Unsloth-supported model
)

# Define your rollout function
async def rollout(model: art.Model, scenario: Scenario) -> art.Trajectory:
    openai_client = model.openai_client()
    trajectory = art.Trajectory(
        messages_and_choices=[
            {"role": "system", "content": "..."},
            {"role": "user", "content": "..."}
        ]
    )
    # Your agent logic here...
    return trajectory

groups = await art.gather_trajectory_groups(
    (
        art.TrajectoryGroup(rollout(model, scenario) for _ in range(8))
        for scenario in scenarios
    ),
    after_each=lambda group: ruler_score_group(
        group,
        "openai/o3",
        swallow_exceptions=True
    )
)

await model.train(groups)
```

Install: `pip install openpipe-art`. ART is a good fit when you need
multi-step tool-using agents, want to skip reward engineering (RULER), or want
to add RL to an existing agentic codebase with minimal changes. Documented
examples: email retrieval agents, game-playing agents (2048, Tic Tac Toe,
Codenames), complex reasoning tasks.

---

Source: unsloth.ai/docs/get-started/reinforcement-learning-rl-guide/training-ai-agents-with-rl.md (fetched 2026-09-26)
Source: unsloth.ai/docs/models/gpt-oss-how-to-run-and-fine-tune/gpt-oss-reinforcement-learning.md (fetched 2026-09-26)
Source: https://github.com/unslothai/notebooks/blob/main/nb/gpt_oss_(20B)_Reinforcement_Learning_2048_Game

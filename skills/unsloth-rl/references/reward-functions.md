# Reward Function Design

Reward functions are the heart of GRPO. A poorly designed reward degrades the
model; a good rubric is what makes RLVR work.

## Verifier vs reward function

- **Verifier** — determines whether a generated response is correct or not. It does
  not assign a numerical score. Verifiers can execute code (Python) to validate
  logic, syntax, and correctness.
- **Reward function** — converts verification results (or other criteria) into a
  numerical score: wrong answer → penalty (-1, -2...), correct → positive (+1,
  +2). It can also penalize criteria beyond correctness (excessive length, poor
  readability).

They are usually used in conjunction; in code you write reward functions that
embed verification logic.

## Signature

Each reward function is a Python callable registered in `GRPOTrainer(reward_funcs=[...])`.
It may receive any of `(prompts, completions, answer, **kwargs)`:

- `prompts` — list of chat-message lists (one per completion in the batch);
  `prompts[0][-1]['content']` is the user question.
- `completions` — list of lists of message dicts; read text via
  `completion[0]['content']`.
- `answer` — list of ground-truth answers aligned with the batch.
- Return: `list[float]`, one score per completion.

Unsloth sums all reward functions (optionally weighted via `reward_weights`)
into the total reward.

## Canonical GSM8K reward set (Llama3.1-8B GRPO notebook)

From `nb/Llama3.1_(8B)-GRPO` (credit @willccbb, shown to be effective):

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

def extract_xml_answer(text: str) -> str:
    answer = text.split("<answer>")[-1]
    answer = answer.split("</answer>")[0]
    return answer.strip()

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

# Reward functions
def correctness_reward_func(prompts, completions, answer, **kwargs) -> list[float]:
    responses = [completion[0]['content'] for completion in completions]
    q = prompts[0][-1]['content']
    extracted_responses = [extract_xml_answer(r) for r in responses]
    print('-'*20, f"Question:\n{q}", f"\nAnswer:\n{answer[0]}", f"\nResponse:\n{responses[0]}", f"\nExtracted:\n{extracted_responses[0]}")
    return [2.0 if r == a else 0.0 for r, a in zip(extracted_responses, answer)]

def int_reward_func(completions, **kwargs) -> list[float]:
    responses = [completion[0]['content'] for completion in completions]
    extracted_responses = [extract_xml_answer(r) for r in responses]
    return [0.5 if r.isdigit() else 0.0 for r in extracted_responses]

def strict_format_reward_func(completions, **kwargs) -> list[float]:
    """Reward function that checks if the completion has a specific format."""
    pattern = r"^<reasoning>\n.*?\n</reasoning>\n<answer>\n.*?\n</answer>\n$"
    responses = [completion[0]["content"] for completion in completions]
    matches = [re.match(pattern, r) for r in responses]
    return [0.5 if match else 0.0 for match in matches]

def soft_format_reward_func(completions, **kwargs) -> list[float]:
    """Reward function that checks if the completion has a specific format."""
    pattern = r"<reasoning>.*?</reasoning>\s*<answer>.*?</answer>"
    responses = [completion[0]["content"] for completion in completions]
    matches = [re.match(pattern, r) for r in responses]
    return [0.5 if match else 0.0 for match in matches]

def count_xml(text) -> float:
    count = 0.0
    if text.count("<reasoning>\n") == 1:
        count += 0.125
    if text.count("\n</reasoning>\n") == 1:
        count += 0.125
    if text.count("\n<answer>\n") == 1:
        count += 0.125
        count -= len(text.split("\n</answer>\n")[-1])*0.001
    if text.count("\n</answer>") == 1:
        count += 0.125
        count -= (len(text.split("\n</answer>")[-1]) - 1)*0.001
    return count

def xmlcount_reward_func(completions, **kwargs) -> list[float]:
    contents = [completion[0]["content"] for completion in completions]
    return [count_xml(c) for c in contents]
```

Register them all:

```python
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
```

## Rubric design: the Advanced GRPO approach

The Advanced notebooks (`Advanced_Llama3_2_(3B)_GRPO_LoRA`, `Qwen3_(4B)-GRPO`) use
a stronger rubric that learns much faster. Pattern:

1. **Exact-format reward** — big score when the whole custom format matches.
2. **Approximate-format reward** — count each marker; reward exactly-once,
   penalize missing/duplicated markers.
3. **Answer reward** — extract the answer, exact match → big score, stripped
   match → medium, proximity via ratio bands → smaller, wrong → penalty.
4. **Number reward** — regex-extract a number (handles "The solution is $20"
   and "123,456"), compare as float.

Custom format used by the Advanced notebooks (your own tags work — DeepSeek's
`think`/`think` is not required):

```python
reasoning_start = "<start_working_out>"
reasoning_end   = "<end_working_out>"
solution_start = "<SOLUTION>"
solution_end = "</SOLUTION>"

system_prompt = \
f"""You are given a problem.
Think about the problem and provide your working out.
Place it between {reasoning_start} and {reasoning_end}.
Then, provide your solution between {solution_start}{solution_end}"""
```

```python
import re

match_format = re.compile(
    rf"^[\s]{{0,}}"\
    rf"{reasoning_start}.+?{reasoning_end}.*?"\
    rf"{solution_start}(.+?){solution_end}"\
    rf"[\s]{{0,}}$",
    flags = re.MULTILINE | re.DOTALL
)

def match_format_exactly(completions, **kwargs):
    scores = []
    for completion in completions:
        score = 0
        response = completion[0]["content"]
        # Match if format is seen exactly!
        if match_format.search(response) is not None: score += 3.0
        scores.append(score)
    return scores

def match_format_approximately(completions, **kwargs):
    scores = []
    for completion in completions:
        score = 0
        response = completion[0]["content"]
        # Count how many keywords are seen - we penalize if too many!
        # If we see 1, then plus some points!
        score += 0.5 if response.count(reasoning_start) == 1 else -1.0
        score += 0.5 if response.count(reasoning_end)   == 1 else -1.0
        score += 0.5 if response.count(solution_start)  == 1 else -1.0
        score += 0.5 if response.count(solution_end)    == 1 else -1.0
        scores.append(score)
    return scores

def check_answer(prompts, completions, answer, **kwargs):
    question = prompts[0][-1]["content"]
    responses = [completion[0]["content"] for completion in completions]

    extracted_responses = [
        guess.group(1)
        if (guess := match_format.search(r)) is not None else None \
        for r in responses
    ]

    scores = []
    for guess, true_answer in zip(extracted_responses, answer):
        score = 0
        if guess is None:
            scores.append(0)
            continue
        # Correct answer gets 3 points!
        if guess == true_answer:
            score += 3.0
        # Match if spaces are seen, but less reward
        elif guess.strip() == true_answer.strip():
            score += 1.5
        else:
            # We also reward it if the answer is close via ratios!
            # Ie if the answer is within some range, reward it!
            try:
                ratio = float(guess) / float(true_answer)
                if   ratio >= 0.9 and ratio <= 1.1: score += 1.0
                elif ratio >= 0.8 and ratio <= 1.2: score += 0.5
                else: score -= 1.5 # Penalize wrong answers
            except:
                score -= 1.5 # Penalize
        scores.append(score)
    return scores
```

The Qwen3-4B version sharpens the scale (correct +5.0, stripped +3.5, ±10%
+2.0, ±20% +1.5, wrong -2.5, unparseable -4.5) and adds a number extractor:

```python
match_numbers = re.compile(
    solution_start + r".*?[\s]{0,}([-]?[\d\.\,]{1,})",
    flags = re.MULTILINE | re.DOTALL
)

def check_numbers(prompts, completions, answer, **kwargs):
    # ... extract via match_numbers, then:
    #   true_answer = float(true_answer.strip())
    #   guess       = float(guess.strip().replace(",", ""))
    #   scores.append(3.5 if guess == true_answer else -1.5)
    pass
```

## Non-math rubrics

There's no single correct reward design. Two documented examples:

**Simple arithmetic** ("2 + 2" → "4"):
- Reward 1: number detected → +1, none → -1
- Reward 2: number matches correct answer → +3, incorrect → -3
- Total reward = sum of all reward functions.

**Email automation** (inbound email → outbound email):
- contains a required keyword → +1
- exactly matches the ideal response → +1
- response too long → -1
- recipient's name included → +1
- signature block (phone, email, address) present → +1

You can feed your generations into any LLM and ask it to design a reward
function (e.g. rule: "If the answer sounds too robotic, deduct 3 points").

## Code-execution rewards (agents)

For code/strategy generation, verify by *executing* — see
`references/agents-rl.md` for the 2048 game's `function_works`, `no_cheating` and
`strategy_succeeds` rewards, which use `check_python_modules` and
`create_locked_down_function` to execute generated code safely.

## Design checklist

- [ ] Each reward is small, independently verifiable, and meaningful.
- [ ] Format rewards + correctness rewards are separated (rubric, not one score).
- [ ] Negative scores exist — penalizing wrong answers shapes the distribution.
- [ ] Proximity beats binary when answers are numeric (closer = better).
- [ ] Test every reward on real model generations before training.
- [ ] If GRPO isn't learning, the reward function is the first suspect — the
      Advanced GRPO notebooks learn noticeably faster.

---

Source: unsloth.ai/docs/get-started/reinforcement-learning-rl-guide.md (fetched 2026-09-26)
Source: https://github.com/unslothai/notebooks/blob/main/nb/Llama3.1_(8B)-GRPO
Source: https://github.com/unslothai/notebooks/blob/main/nb/Advanced_Llama3_2_(3B)_GRPO_LoRA
Source: https://github.com/unslothai/notebooks/blob/main/nb/Qwen3_(4B)-GRPO

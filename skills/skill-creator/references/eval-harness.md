# Running and evaluating test cases

The skill-creator uses a fully automated eval loop — no subagents, no interactive viewer, no human feedback needed. Everything runs via `qwen -p` subprocess calls using the same auth as the current session. Parallel LLM processes are limited to 4 by default.

### Step 1: Write eval set with assertions

Create or update `evals/evals.json` with test cases and assertions:

```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "User's task prompt",
      "expected_output": "Description of expected result",
      "files": [],
      "assertions": [
        "The output contains a valid JSON array",
        "Each item has a 'name' field",
        "The array has at least 3 items"
      ]
    }
  ]
}
```

Good assertions are objectively verifiable and have descriptive names. Subjective skills (writing style, design quality) are better evaluated qualitatively — don't force assertions onto things that need human judgment.

### Step 2: Run the automated eval loop

Run the full loop in the background. It will:
1. Execute test cases via `run_test.py` (subprocess-based, with-skill + baseline)
2. Auto-grade outputs via `auto_grader.py` (Qwen subprocess calls)
3. Aggregate benchmark stats via `aggregate_benchmark.py`
4. Improve the description via `improve_description.py` (trigger optimization)
5. Loop until all pass or max iterations reached

```bash
python -m scripts.run_loop \\
  --eval-set evals/evals.json \\
  --skill-path <path-to-skill> \\
  --model <model-id> \\
  --max-iterations 5 \\
  --verbose
```

**Parameters:**
- `--num-workers`: Max parallel LLM processes (default: 4). Keep this low to avoid overwhelming the model.
- `--timeout`: Timeout per query in seconds (default: 30 for trigger eval, 120 for test runs).
- `--max-iterations`: Max improvement iterations (default: 5).
- `--runs-per-query`: Number of runs per query for trigger eval (default: 3).
- `--holdout`: Fraction of eval set to hold out for testing (default: 0.4). Prevents overfitting.
- `--results-dir`: Save all outputs to a timestamped subdirectory.

The loop produces:
- **HTML report** at a temp path (auto-refreshes every 5s during the loop)
- **results.json** with full history of descriptions and scores
- **benchmark.json** with aggregate pass rates, timing, and token usage
- **grader logs** in the results directory

### Step 3: Review results

When the loop completes, check:
- **Best score**: The highest train/test score achieved
- **Exit reason**: Either `all_passed` or `max_iterations`
- **HTML report**: Open the temp file to see per-query results across iterations
- **Grading results**: Check `average_pass_rate` from the grader output

If the loop hit `max_iterations` without passing, improve the skill manually (see below) and run the loop again.

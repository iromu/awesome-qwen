#!/usr/bin/env python3
"""Run test cases for a skill using subprocess-based Qwen calls.

For each eval in the eval set, runs two subprocesses:
- with_skill: Qwen instructed to use the skill
- without_skill / old_skill: Qwen without the skill (or with old version)

Captures outputs, timing, and transcripts. Saves everything to the workspace.

Uses --max-tool-calls to prevent runaway tool usage.
Limits parallelism with max_workers (default 4).

Usage:
    python -m scripts.run_test --eval-set <path> --skill-path <path> --workspace <path>
    python -m scripts.run_test --eval-set <path> --skill-path <path> --workspace <path> \\
        --baseline old --skill-snapshot <path>
"""

import argparse
import json
import os
import re
import select
import shutil
import signal
import subprocess
import sys
import time
import uuid
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

from scripts.utils import parse_skill_md


def _call_qwen(
    prompt: str,
    model: str | None,
    timeout: int,
    max_tool_calls: int,
    skill_md_content: str | None = None,
) -> str:
    """Run `qwen -p` with the prompt on stdin and return the response text.

    If skill_md_content is provided, it's prepended to the prompt so Qwen
    has the skill context inline (avoids needing .qwen/skills/ discovery).
    """
    cmd = ["qwen", "-p", "--output-format", "text"]
    if model:
        cmd.extend(["--model", model])
    cmd.extend(["--max-tool-calls", str(max_tool_calls)])

    full_prompt = prompt
    if skill_md_content:
        full_prompt = (
            f"Use this skill:\n\n{skill_md_content}\n\n---\n\n{prompt}"
        )

    env = {k: v for k, v in os.environ.items() if k != "QWENCODE"}

    result = subprocess.run(
        cmd,
        input=full_prompt,
        capture_output=True,
        text=True,
        env=env,
        timeout=timeout,
    )
    if result.returncode != 0:
        raise RuntimeError(
            f"qwen -p exited {result.returncode}\nstderr: {result.stderr[:2000]}"
        )
    return result.stdout


def _write_transcript(
    workspace_dir: Path,
    eval_id: int,
    config: str,
    prompt: str,
    response: str,
    skill_md_content: str | None,
    timing: dict | None,
) -> None:
    """Write a transcript.md file to the workspace."""
    run_dir = workspace_dir / f"eval-{eval_id}" / config
    run_dir.mkdir(parents=True, exist_ok=True)

    lines = ["# Transcript"]
    lines.append("")
    lines.append("## Eval Prompt")
    lines.append("")
    lines.append(prompt)
    lines.append("")

    if skill_md_content:
        lines.append("## Skill Content")
        lines.append("")
        lines.append("```")
        lines.append(skill_md_content)
        lines.append("```")
        lines.append("")

    lines.append("## Response")
    lines.append("")
    lines.append(response)
    lines.append("")

    if timing:
        lines.append("## Timing")
        lines.append("")
        lines.append(f"- Duration: {timing.get('duration_seconds', 'N/A')}s")
        lines.append(f"- Tokens: {timing.get('tokens', 'N/A')}")
        lines.append("")

    (run_dir / "transcript.md").write_text("\n".join(lines))


def _save_outputs(
    workspace_dir: Path,
    eval_id: int,
    config: str,
    response: str,
) -> None:
    """Save the response as output files in the workspace."""
    run_dir = workspace_dir / f"eval-{eval_id}" / config / "outputs"
    run_dir.mkdir(parents=True, exist_ok=True)

    # Save the raw response as output.md
    (run_dir / "output.md").write_text(response)


def run_single_test(
    eval_item: dict,
    skill_path: Path,
    workspace_dir: Path,
    timeout: int,
    model: str | None,
    max_tool_calls: int,
    config: str,
    baseline_skill_path: Path | None = None,
) -> dict:
    """Run a single test case (with_skill or without_skill).

    Returns a dict with eval_id, config, success, timing, and error info.
    """
    eval_id = eval_item["id"]
    prompt = eval_item["prompt"]
    skill_md_content = (skill_path / "SKILL.md").read_text()

    # Determine skill content to inject
    if config == "with_skill":
        skill_content = skill_md_content
    elif config == "old_skill" and baseline_skill_path:
        skill_content = (baseline_skill_path / "SKILL.md").read_text()
    else:
        skill_content = None

    # Build the prompt
    if config == "with_skill":
        full_prompt = (
            f"Execute the following task using the skill below.\n\n"
            f"## Task\n{prompt}\n\n"
            f"## Skill\n{skill_md_content}"
        )
    elif config == "old_skill":
        full_prompt = (
            f"Execute the following task using the skill below.\n\n"
            f"## Task\n{prompt}\n\n"
            f"## Skill\n{skill_content}"
        )
    else:
        # without_skill: no skill context
        full_prompt = f"Execute the following task:\n\n{prompt}"

    # Save eval_metadata.json
    meta_dir = workspace_dir / f"eval-{eval_id}"
    meta_dir.mkdir(parents=True, exist_ok=True)
    metadata = {
        "eval_id": eval_id,
        "eval_name": eval_item.get("eval_name", f"eval-{eval_id}"),
        "prompt": prompt,
        "assertions": eval_item.get("assertions", []),
    }
    (meta_dir / "eval_metadata.json").write_text(json.dumps(metadata, indent=2))

    # Create run directory
    run_dir = meta_dir / config
    run_dir.mkdir(parents=True, exist_ok=True)

    t0 = time.time()
    try:
        response = _call_qwen(
            prompt=full_prompt,
            model=model,
            timeout=timeout,
            max_tool_calls=max_tool_calls,
            skill_md_content=skill_content if config in ("with_skill", "old_skill") else None,
        )
        elapsed = time.time() - t0

        # Save outputs
        _save_outputs(workspace_dir, eval_id, config, response)

        # Save transcript
        _write_transcript(
            workspace_dir, eval_id, config, prompt, response, skill_content,
            {"duration_seconds": round(elapsed, 2), "tokens": "N/A"},
        )

        return {
            "eval_id": eval_id,
            "config": config,
            "success": True,
            "duration_seconds": round(elapsed, 2),
            "error": None,
        }
    except Exception as e:
        elapsed = time.time() - t0
        error_msg = str(e)[:2000]
        _write_transcript(
            workspace_dir, eval_id, config, prompt, f"ERROR: {error_msg}", skill_content,
            {"duration_seconds": round(elapsed, 2), "tokens": 0},
        )
        return {
            "eval_id": eval_id,
            "config": config,
            "success": False,
            "duration_seconds": round(elapsed, 2),
            "error": error_msg,
        }


def run_tests(
    eval_set: list[dict],
    skill_path: Path,
    workspace_dir: Path,
    num_workers: int,
    timeout: int,
    model: str | None,
    max_tool_calls: int,
    baseline_skill_path: Path | None = None,
) -> dict:
    """Run all test cases and return results summary."""
    workspace_dir.mkdir(parents=True, exist_ok=True)

    configs = ["with_skill"]
    if baseline_skill_path:
        configs.append("old_skill")
    else:
        configs.append("without_skill")

    results = []
    total = len(eval_set) * len(configs)
    completed = 0

    with ProcessPoolExecutor(max_workers=num_workers) as executor:
        future_to_info = {}
        for eval_item in eval_set:
            for config in configs:
                future = executor.submit(
                    run_single_test,
                    eval_item,
                    skill_path,
                    workspace_dir,
                    timeout,
                    model,
                    max_tool_calls,
                    config,
                    baseline_skill_path,
                )
                future_to_info[future] = (eval_item, config)

        for future in as_completed(future_to_info):
            eval_item, config = future_to_info[future]
            completed += 1
            try:
                r = future.result()
                results.append(r)
                status = "OK" if r["success"] else "FAIL"
                print(f"  [{status}] eval-{r['eval_id']} ({config}) in {r['duration_seconds']}s "
                      f"({completed}/{total})", file=sys.stderr)
            except Exception as e:
                print(f"  [ERR] eval-{eval_item['id']} ({config}): {e}", file=sys.stderr)
                results.append({
                    "eval_id": eval_item["id"],
                    "config": config,
                    "success": False,
                    "duration_seconds": 0,
                    "error": str(e),
                })

    # Count successes
    successes = sum(1 for r in results if r["success"])
    return {
        "total": total,
        "successes": successes,
        "failures": total - successes,
        "results": results,
    }


def main():
    parser = argparse.ArgumentParser(description="Run test cases for a skill")
    parser.add_argument("--eval-set", required=True, help="Path to eval set JSON file")
    parser.add_argument("--skill-path", required=True, help="Path to skill directory")
    parser.add_argument("--workspace", required=True, help="Workspace directory for outputs")
    parser.add_argument("--baseline", choices=["old"], default=None,
                        help="Baseline type: 'old' uses a snapshot of the old skill")
    parser.add_argument("--skill-snapshot", default=None,
                        help="Path to old skill snapshot for baseline")
    parser.add_argument("--num-workers", type=int, default=4,
                        help="Max parallel LLM processes (default: 4)")
    parser.add_argument("--timeout", type=int, default=120,
                        help="Timeout per test in seconds")
    parser.add_argument("--model", default=None,
                        help="Model for qwen -p (default: user's configured model)")
    parser.add_argument("--max-tool-calls", type=int, default=20,
                        help="Max tool calls per run")
    parser.add_argument("--verbose", action="store_true",
                        help="Print progress to stderr")
    args = parser.parse_args()

    eval_set = json.loads(Path(args.eval_set).read_text())
    skill_path = Path(args.skill_path).resolve()

    if not (skill_path / "SKILL.md").exists():
        print(f"Error: No SKILL.md found at {skill_path}", file=sys.stderr)
        sys.exit(1)

    workspace_dir = Path(args.workspace).resolve()
    if args.verbose:
        print(f"Running tests for: {skill_path.name}", file=sys.stderr)
        print(f"Workspace: {workspace_dir}", file=sys.stderr)
        print(f"Evals: {len(eval_set)}, Workers: {args.num_workers}", file=sys.stderr)
        if args.baseline == "old":
            print(f"Baseline: old_skill from {args.skill_snapshot}", file=sys.stderr)

    name, _, _ = parse_skill_md(skill_path)
    baseline_path = Path(args.skill_snapshot).resolve() if args.skill_snapshot else None

    output = run_tests(
        eval_set=eval_set,
        skill_path=skill_path,
        workspace_dir=workspace_dir,
        num_workers=args.num_workers,
        timeout=args.timeout,
        model=args.model,
        max_tool_calls=args.max_tool_calls,
        baseline_skill_path=baseline_path,
    )

    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()

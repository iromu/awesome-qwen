#!/usr/bin/env python3
"""Automatically grade test run outputs using Qwen subprocess calls.

Reads test run outputs from a workspace directory, evaluates each expectation
against the outputs and transcripts, and saves grading.json files.

Usage:
    python -m scripts.auto_grader <workspace-dir> [--model <model>] [--max-workers <N>]

The grader uses `qwen -p` subprocess calls (same auth as run_eval.py) to
evaluate expectations — no interactive feedback needed.
"""

import argparse
import json
import os
import re
import subprocess
import sys
import time
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path


def _call_qwen(prompt: str, model: str | None, timeout: int = 120) -> str:
    """Run `qwen -p` with the prompt on stdin and return the text response."""
    cmd = ["qwen", "-p", "--output-format", "text"]
    if model:
        cmd.extend(["--model", model])
    cmd.extend(["--max-tool-calls", "20"])

    env = {k: v for k, v in os.environ.items() if k != "QWENCODE"}

    result = subprocess.run(
        cmd,
        input=prompt,
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


def _read_file_safe(path: Path) -> str:
    """Read a file safely, returning empty string on failure."""
    try:
        return path.read_text(errors="replace")
    except (OSError, IOError):
        return ""


def _parse_grading_response(text: str, expectations: list[str]) -> list[dict]:
    """Parse the grading response from Qwen into expectations results."""
    results = []

    # Try to find a JSON block in the response
    json_match = re.search(r'\{[\s\S]*"expectations"[\s\S]*\}', text)
    if json_match:
        try:
            parsed = json.loads(json_match.group())
            if isinstance(parsed, dict) and "expectations" in parsed:
                for exp in parsed["expectations"]:
                    if isinstance(exp, dict) and "text" in exp and "passed" in exp:
                        results.append({
                            "text": exp.get("text", ""),
                            "passed": bool(exp["passed"]),
                            "evidence": exp.get("evidence", ""),
                        })
                if results:
                    return results
        except json.JSONDecodeError:
            pass

    # Fallback: try to parse line-by-line verdicts
    # Look for patterns like "PASS: <text>" or "FAIL: <text>" or "✓ <text>" or "✗ <text>"
    lines = text.split("\n")
    for i, line in enumerate(lines):
        line_stripped = line.strip()
        for exp in expectations:
            if any(marker in line_stripped.lower() for marker in ["pass", "✓", "fail", "✗", "pass:", "fail:"]):
                passed = any(marker in line_stripped.lower() for marker in ["pass", "✓"])
                results.append({
                    "text": exp,
                    "passed": passed,
                    "evidence": line_stripped[:200],
                })
                break

    # Last resort: mark all as failed with explanation
    if not results:
        for exp in expectations:
            results.append({
                "text": exp,
                "passed": False,
                "evidence": f"Could not parse grading response. Qwen output was: {text[:300]}...",
            })

    return results


def grade_run(
    workspace: Path,
    run_dir: Path,
    eval_id: int,
    eval_name: str,
    prompt: str,
    expectations: list[str],
    model: str | None,
    timeout: int,
) -> dict:
    """Grade a single run directory."""
    t0 = time.time()

    # Read transcript
    transcript_path = run_dir / "transcript.md"
    transcript = _read_file_safe(transcript_path)

    # Read outputs
    outputs_dir = run_dir / "outputs"
    output_texts: list[str] = []
    if outputs_dir.is_dir():
        for f in sorted(outputs_dir.iterdir()):
            if f.is_file() and f.name not in ("transcript.md", "user_notes.md", "metrics.json"):
                output_texts.append(f"{f.name}:\n{_read_file_safe(f)}")

    output_content = "\n\n---\n\n".join(output_texts) if output_texts else "(No outputs found)"

    # Build grading prompt
    grading_prompt = f"""You are grading the output of an AI agent that was given a task.

## Task
{prompt}

## Expectations
The following expectations must be checked against the output:
"""
    for i, exp in enumerate(expectations, 1):
        grading_prompt += f"{i}. {exp}\n"

    grading_prompt += f"""
## Transcript
{transcript[:8000] if transcript else "(No transcript)"}

## Output Files
{output_content[:8000] if output_content else "(No outputs)"}

## Instructions
For each expectation, determine if it PASS or FAIL based on the evidence in the transcript and outputs.

Respond with a JSON object containing an "expectations" array. Each item must have:
- "text": the original expectation text
- "passed": true or false
- "evidence": brief quote or description of what you found

Example response:
{{
  "expectations": [
    {{"text": "The output includes the name 'John Smith'", "passed": true, "evidence": "Found in transcript Step 3: 'Extracted names: John Smith'"}}
  ]
}}

Only respond with the JSON object, nothing else."""

    try:
        response = _call_qwen(grading_prompt, model, timeout=timeout)
        elapsed = time.time() - t0

        expectations_result = _parse_grading_response(response, expectations)

        # Calculate summary
        passed = sum(1 for e in expectations_result if e["passed"])
        total = len(expectations_result)

        grading = {
            "expectations": expectations_result,
            "summary": {
                "passed": passed,
                "failed": total - passed,
                "total": total,
                "pass_rate": passed / total if total > 0 else 0.0,
            },
            "timing": {
                "grader_duration_seconds": round(elapsed, 2),
                "total_duration_seconds": round(elapsed, 2),
            },
        }

        # Save grading.json
        grading_path = run_dir / "grading.json"
        grading_path.write_text(json.dumps(grading, indent=2))

        return {
            "eval_id": eval_id,
            "eval_name": eval_name,
            "run_dir": str(run_dir.relative_to(workspace)),
            "success": True,
            "pass_rate": grading["summary"]["pass_rate"],
            "passed": passed,
            "total": total,
            "duration_seconds": elapsed,
        }
    except Exception as e:
        elapsed = time.time() - t0
        return {
            "eval_id": eval_id,
            "eval_name": eval_name,
            "run_dir": str(run_dir.relative_to(workspace)),
            "success": False,
            "error": str(e),
            "duration_seconds": elapsed,
        }


def discover_runs(workspace: Path) -> list[dict]:
    """Discover all run directories in the workspace.

    Supports two layouts:
    1. workspace/eval-M/config/run-K/
    2. workspace/iteration-N/eval-M/config/run-K/
    """
    runs = []

    for run_dir in sorted(workspace.rglob("run-*")):
        if not run_dir.is_dir():
            continue
        if not (run_dir / "transcript.md").exists():
            continue

        # Walk up to find eval_metadata.json
        eval_id = 0
        eval_name = ""
        prompt = ""
        assertions: list[str] = []

        current = run_dir.parent
        while current and current != workspace:
            metadata = current / "eval_metadata.json"
            if metadata.exists():
                try:
                    meta = json.loads(metadata.read_text())
                    eval_id = meta.get("eval_id", 0)
                    eval_name = meta.get("eval_name", f"eval-{eval_id}")
                    prompt = meta.get("prompt", "")
                    assertions = meta.get("assertions", [])
                except (json.JSONDecodeError, OSError):
                    pass
                break
            current = current.parent

        if not prompt:
            # Try to extract from transcript
            transcript = _read_file_safe(run_dir / "transcript.md")
            match = re.search(r"## Eval Prompt\n\n([\s\S]*?)(?=\n##|$)", transcript)
            if match:
                prompt = match.group(1).strip()

        if prompt:
            runs.append({
                "run_dir": run_dir,
                "eval_id": eval_id,
                "eval_name": eval_name,
                "prompt": prompt,
                "assertions": assertions,
            })

    return runs


def grade_workspace(
    workspace: Path,
    model: str | None,
    num_workers: int,
    timeout: int,
    verbose: bool,
) -> dict:
    """Grade all runs in a workspace directory."""
    workspace = workspace.resolve()
    if not workspace.is_dir():
        print(f"Error: {workspace} is not a directory", file=sys.stderr)
        sys.exit(1)

    runs = discover_runs(workspace)
    if not runs:
        print(f"No runs found in {workspace}", file=sys.stderr)
        sys.exit(1)

    if verbose:
        print(f"Discovered {len(runs)} runs to grade", file=sys.stderr)

    results = []
    with ProcessPoolExecutor(max_workers=num_workers) as executor:
        future_to_run = {}
        for run_info in runs:
            future = executor.submit(
                grade_run,
                workspace,
                run_info["run_dir"],
                run_info["eval_id"],
                run_info["eval_name"],
                run_info["prompt"],
                run_info["assertions"],
                model,
                timeout,
            )
            future_to_run[future] = run_info

        for future in as_completed(future_to_run):
            run_info = future_to_run[future]
            try:
                result = future.result()
                results.append(result)
                status = "OK" if result["success"] else "FAIL"
                pr = result.get("pass_rate", 0)
                print(f"  [{status}] {result['run_dir']}: pass_rate={pr:.0%}", file=sys.stderr)
            except Exception as e:
                print(f"  [ERR] {run_info['run_dir']}: {e}", file=sys.stderr)
                results.append({
                    "eval_id": run_info["eval_id"],
                    "eval_name": run_info["eval_name"],
                    "run_dir": str(run_info["run_dir"]),
                    "success": False,
                    "error": str(e),
                })

    successes = sum(1 for r in results if r["success"])
    avg_pass_rate = (
        sum(r.get("pass_rate", 0) for r in results if r["success"]) /
        max(1, successes)
    )

    return {
        "total_runs": len(runs),
        "graded": successes,
        "failed": len(runs) - successes,
        "average_pass_rate": round(avg_pass_rate, 4),
        "results": results,
    }


def main():
    parser = argparse.ArgumentParser(description="Automatically grade test run outputs")
    parser.add_argument("workspace", type=Path, help="Path to workspace directory")
    parser.add_argument("--model", default=None, help="Model for qwen -p grading")
    parser.add_argument("--max-workers", type=int, default=4,
                        help="Max parallel grading processes (default: 4)")
    parser.add_argument("--timeout", type=int, default=120,
                        help="Timeout per grading call in seconds")
    parser.add_argument("--verbose", action="store_true",
                        help="Print progress to stderr")
    args = parser.parse_args()

    output = grade_workspace(
        workspace=args.workspace,
        model=args.model,
        num_workers=args.max_workers,
        timeout=args.timeout,
        verbose=args.verbose,
    )

    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Scan text/markdown for conversational AI meta-comments.

Strips fenced code blocks and inline code so only prose is scanned, then runs a
set of regex patterns grouped by category. Prints candidate hits with line
numbers so a reviewer can apply the clear / borderline / false-positive judgment
(see SKILL.md). The script only finds *candidates* — it does not decide whether
a hit is a real meta-comment; that judgment is the reviewer's.

Usage:
    python scan_meta_comments.py FILE [FILE...]
    cat doc.md | python scan_meta_comments.py -
    python scan_meta_comments.py --json doc.md

Options:
    --json      Emit machine-readable JSON instead of the human report.
    --include-code  Do not strip fenced/inline code (scan everything).
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

# Categories that hinge on the capital pronoun "I" must stay case-sensitive so
# identifiers like "my-agent" or "I/O" never match. The other categories are
# matched case-insensitively so sentence-initial capitals ("You'll", "Here's")
# are caught too.
CASE_SENSITIVE = {"first-person-voice", "ai-self-id"}

# Each entry is (category, [regex, ...]). Categories map onto the "clear" and
# "borderline" buckets in SKILL.md; a single line may match several.
RAW_PATTERNS: list[tuple[str, list[str]]] = [
    (
        "first-person-voice",
        [
            r"\bI've\b",
            r"\bI (?:found|researched|investigated|looked|checked|verified|confirmed|"
            r"noticed|realized|concluded|determined|established|validated|inspected|"
            r"read|searched|figured|discovered)\b",
            r"\bI was (?:able to|not able to)\b",
            r"\bI (?:want to|would like to|would like|should|think|believe|"
            r"recommend|suggest|need to)\b",
            r"\bI'm going to\b",
            r"\bI (?:can|will|would|could|couldn't)\b",
        ],
    ),
    (
        "presentational",
        [
            r"\bHere's\b",
            r"\bHere is (?:a|the|what)\b",
            r"\bHere's (?:how|what|the)\b",
            r"\bLet me\b",
            r"\bLet's\b",
        ],
    ),
    (
        "second-person",
        [
            r"\byou asked\b",
            r"\byour instinct\b",
            r"\byou wanted\b",
            r"\byou'll\b",
            r"\byou're\b",
            r"\bwould you like\b",
            r"\bfeel free to\b",
            r"\bdon't forget\b",
            r"\bkeep in mind\b",
            r"\bby the way\b",
            r"\bjust so you know\b",
        ],
    ),
    (
        "meta-labels",
        [
            r"\bNote that\b",
            r"\bThe point is\b",
            r"\bWhat this means\b",
            r"\bWhat we (?:found|discovered)\b",
            r"\bThe bottom line\b",
            r"\bThe takeaway\b",
            r"\bKey takeaway\b",
            r"\bIn conclusion\b",
            r"\bIn summary\b",
            r"\bTo summarize\b",
            r"\bTo sum up\b",
            r"\bIn other words\b",
            r"\bIn short\b",
            r"\bTo wrap up\b",
            r"\bIn closing\b",
        ],
    ),
    (
        "ai-self-id",
        [
            r"\bAs an AI\b",
            r"\bAs a language model\b",
            r"\bI'm an AI\b",
            r"\bI am an AI\b",
            r"\bI was (?:trained|designed)\b",
            r"\bI (?:don't|do not) have access\b",
            r"\bI (?:cannot|can't|'m unable|am unable)\b",
            r"\bI apologize\b",
            r"\bI'm sorry\b",
            r"\bThat's a great question\b",
            r"\bGood question\b",
        ],
    ),
]

CATEGORIES: list[tuple[str, list[re.Pattern]]] = [
    (
        name,
        [
            re.compile(p, 0 if name in CASE_SENSITIVE else re.IGNORECASE)
            for p in pats
        ],
    )
    for name, pats in RAW_PATTERNS
]

FENCE_RE = re.compile(r"^\s*(```|~~~)")
INLINE_CODE_RE = re.compile(r"`[^`]*`")


def _prose_line(line: str, in_fence: bool, include_code: bool) -> str | None:
    """Return the prose portion of a line, or None if it should be skipped.

    Lines inside a fenced code block are skipped entirely (they are not prose).
    Inline code spans are removed from prose lines so identifiers like
    `my-agent` never match.
    """
    if in_fence and not include_code:
        return None
    return INLINE_CODE_RE.sub("", line) if not include_code else line


def scan_text(text: str, include_code: bool = False) -> list[dict]:
    """Scan text and return a list of candidate hits.

    Each hit: {"line": int, "category": str, "match": str, "text": str}.
    Line numbers are 1-based and reflect the original file, including the
    (skipped) code lines, so they line up with an editor.
    """
    hits: list[dict] = []
    in_fence = False
    for lineno, raw in enumerate(text.splitlines(), start=1):
        # Toggle fence state on fence delimiters (a fence line is never prose).
        if FENCE_RE.match(raw):
            in_fence = not in_fence
            continue
        prose = _prose_line(raw, in_fence, include_code)
        if prose is None or not prose.strip():
            continue
        # Dedup per (line, category): if several patterns in the same category
        # match one line, keep only the longest so the report stays readable.
        best: dict[str, re.Match] = {}
        for category, patterns in CATEGORIES:
            for pat in patterns:
                m = pat.search(prose)
                if m and (category not in best or len(m.group(0)) > len(best[category].group(0))):
                    best[category] = m
        for category, m in best.items():
            hits.append(
                {
                    "line": lineno,
                    "category": category,
                    "match": m.group(0),
                    "text": raw.rstrip(),
                }
            )
    return hits


def summarize(hits: list[dict]) -> dict:
    counts: dict[str, int] = {}
    for h in hits:
        counts[h["category"]] = counts.get(h["category"], 0) + 1
    return {"total": len(hits), "by_category": counts}


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Find conversational AI meta-comment candidates in prose."
    )
    parser.add_argument(
        "files",
        nargs="+",
        help="File(s) to scan, or '-' for stdin.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit JSON instead of the human-readable report.",
    )
    parser.add_argument(
        "--include-code",
        action="store_true",
        help="Do not strip fenced/inline code blocks.",
    )
    args = parser.parse_args()

    texts: list[tuple[str, str]] = []
    for f in args.files:
        if f == "-":
            texts.append(("<stdin>", sys.stdin.read()))
        else:
            p = Path(f)
            if not p.is_file():
                print(f"error: not a file: {f}", file=sys.stderr)
                return 2
            texts.append((f, p.read_text(errors="replace")))

    all_hits: list[dict] = []
    for source, text in texts:
        for h in scan_text(text, include_code=args.include_code):
            h = dict(h)
            h["file"] = source
            all_hits.append(h)

    if args.json:
        print(json.dumps({"hits": all_hits, "summary": summarize(all_hits)}, indent=2))
        return 0

    if not all_hits:
        print("No meta-comment candidates found.")
        return 0

    print(f"{len(all_hits)} candidate hit(s):\n")
    for h in all_hits:
        print(f"  {h['file']}:{h['line']}  [{h['category']}]  {h['match']!r}")
        print(f"      {h['text']}")

    print("\nSummary:")
    summary = summarize(all_hits)
    for cat, n in sorted(summary["by_category"].items()):
        print(f"  {cat}: {n}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env bash
# ~/.qwen/hooks/save-decisions.sh
# Stop hook — runs after every Qwen response.
# Uses the installed `qwen` CLI (headless mode) to extract decisions,
# conventions, or important choices from the last assistant message,
# then appends them to .qwen/decisions.md in the current project root.

set -euo pipefail

MAX_ENTRIES="${QWEN_MEMORY_MAX:-100}"   # trim the file if it grows beyond this

# ── Read Stop hook input ──────────────────────────────────────────────────────
INPUT=$(cat)
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')
LAST_MESSAGE=$(echo "$INPUT" | jq -r '.last_assistant_message // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

# ── Resolve project root & memory file path ───────────────────────────────────
PROJECT_ROOT=$(git -C "$CWD" rev-parse --show-toplevel 2>/dev/null || echo "$CWD")
MEMORY_FILE="${QWEN_MEMORY_FILE:-${PROJECT_ROOT}/.qwen/decisions.md}"
MEMORY_DIR=$(dirname "$MEMORY_FILE")

# Avoid infinite loops: the Stop hook fires again after we inject feedback.
# Skip silently if we are already inside a stop hook cycle.
if [[ "$STOP_HOOK_ACTIVE" == "true" ]]; then
  exit 0
fi

# Nothing to analyse if there's no message
if [[ -z "$LAST_MESSAGE" ]]; then
  exit 0
fi

# ── Ask qwen CLI to extract decisions (headless / print mode) ─────────────────
PROMPT="You are a precise decision extractor. \
Given the following message from an AI coding assistant, identify ONLY concrete \
decisions, conventions, or choices that were explicitly established. These include: \
architecture or design decisions, naming conventions, technology/library selections, \
rejected alternatives and the reason why, and project-specific rules agreed upon. \
Return ONLY a JSON object with no other text: {\"decisions\": [\"<decision 1>\", ...]}. \
If no decisions were made return {\"decisions\": []}. \
Be concise — one sentence per decision. \
Message to analyse:

$LAST_MESSAGE"

CONTENT=$(qwen -p "$PROMPT" 2>/dev/null) || exit 0   # CLI failure → skip silently

# Strip potential markdown code fences the model may add
CONTENT=$(echo "$CONTENT" | sed 's/```json//g; s/```//g' | tr -d '\r')

DECISIONS=$(echo "$CONTENT" | jq -r '.decisions[]?' 2>/dev/null)

if [[ -z "$DECISIONS" ]]; then
  exit 0
fi

# ── Persist to the memory file ────────────────────────────────────────────────
mkdir -p "$MEMORY_DIR"

TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
PROJECT=$(basename "$PROJECT_ROOT")

{
  echo ""
  echo "### $TIMESTAMP | $PROJECT"
  while IFS= read -r decision; do
    echo "- $decision"
  done <<< "$DECISIONS"
} >> "$MEMORY_FILE"

# ── Trim old entries if the file exceeds MAX_ENTRIES ─────────────────────────
ENTRY_COUNT=$(grep -c '^-' "$MEMORY_FILE" 2>/dev/null || echo 0)
if (( ENTRY_COUNT > MAX_ENTRIES )); then
  python3 - "$MEMORY_FILE" "$MAX_ENTRIES" <<'PY'
import sys, re

path, limit = sys.argv[1], int(sys.argv[2])
text = open(path).read()

sections = re.split(r'(?=\n### )', text)
sections = [s for s in sections if s.strip()]

while sections:
    total = sum(len(re.findall(r'^-', s, re.M)) for s in sections)
    if total <= limit:
        break
    sections.pop(0)

open(path, 'w').write('\n'.join(sections) + '\n')
PY
fi

exit 0

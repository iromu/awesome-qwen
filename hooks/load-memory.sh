#!/usr/bin/env bash
# ~/.qwen/hooks/load-memory.sh
# SessionStart hook — runs when a new session starts.
# Reads .qwen/decisions.md from the current project root and injects
# past decisions into Qwen's context.

set -euo pipefail

MAX_INJECT="${QWEN_MEMORY_INJECT:-40}"   # max bullet entries to inject per session

# ── Read SessionStart hook input ──────────────────────────────────────────────
INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

# ── Resolve project root & memory file path ───────────────────────────────────
PROJECT_ROOT=$(git -C "$CWD" rev-parse --show-toplevel 2>/dev/null || echo "$CWD")
MEMORY_FILE="${QWEN_MEMORY_FILE:-${PROJECT_ROOT}/.qwen/decisions.md}"

# ── Nothing to inject if the file doesn't exist or is empty ──────────────────
if [[ ! -s "$MEMORY_FILE" ]]; then
  exit 0
fi

# ── Read the most recent MAX_INJECT decisions ─────────────────────────────────
MEMORY_CONTENT=$(python3 - "$MEMORY_FILE" "$MAX_INJECT" <<'PY'
import sys, re

path, limit = sys.argv[1], int(sys.argv[2])
text = open(path).read()

sections = re.split(r'(?=\n### |\A### )', text.strip())
sections = [s.strip() for s in sections if s.strip()]

kept = []
total = 0
for section in reversed(sections):
    bullets = re.findall(r'^- .+', section, re.M)
    if not bullets:
        continue
    needed = min(len(bullets), limit - total)
    kept.insert(0, (section.split('\n')[0], bullets[-needed:]))
    total += needed
    if total >= limit:
        break

parts = []
for header, bullets in kept:
    parts.append(header)
    parts.extend(bullets)

print('\n'.join(parts))
PY
)

if [[ -z "$MEMORY_CONTENT" ]]; then
  exit 0
fi

# ── Build the additionalContext payload ───────────────────────────────────────
CONTEXT="## 📋 Decisions from previous sessions

The following decisions, conventions, and choices were established in past sessions.
Respect them unless the user explicitly changes them.

$MEMORY_CONTENT

---"

jq -n --arg ctx "$CONTEXT" '{
  hookSpecificOutput: {
    additionalContext: $ctx
  }
}'

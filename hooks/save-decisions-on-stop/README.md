---
name: Save Decisions on Stop
description: Extract and persist any decisions made during the session into memory for cross-session continuity
event: Stop
tags: ["memory", "automation", "persistence"]
---

# Save Decisions on Stop

## What This Does
When a Qwen Code session ends, this hook extracts decisions, preferences, and learnings from the conversation and persists them to memory files (`MEMORY.md`, `USER.md`) for use in future sessions.

## Setup

Add to your `settings.json`:
```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "name": "save-decisions",
            "description": "Extract and persist any decisions made during this response",
            "command": "~/.qwen/hooks/save-decisions.sh",
            "timeout": 30000
          }
        ]
      }
    ]
  }
}
```

## Hook Script (`save-decisions.sh`)
```bash
#!/bin/bash
# Extract decisions from the session and save to memory
MEMORY_DIR="$HOME/.qwen/memories"
mkdir -p "$MEMORY_DIR"

# Append to MEMORY.md with deduplication
# Logic: parse session for decision markers, merge with existing
```

## When to Use
- Any project where you want cross-session continuity
- When the agent learns environment-specific facts
- To remember user preferences across sessions

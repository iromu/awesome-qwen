---
name: Load Memory on Startup
description: Inject previously saved decisions and context into the new session for seamless continuity
event: SessionStart
matcher: "^(startup|resume)$"
tags: ["memory", "automation", "continuity"]
---

# Load Memory on Startup

## What This Does
When a Qwen Code session starts (with "startup" or "resume" keyword), this hook loads previously saved decisions, preferences, and context from memory files into the session context so the agent picks up where it left off.

## Setup

Add to your `settings.json`:
```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "^(startup|resume)$",
        "hooks": [
          {
            "type": "command",
            "name": "load-memory",
            "description": "Inject previously saved decisions into the new session",
            "command": "~/.qwen/hooks/load-memory.sh",
            "timeout": 5000
          }
        ]
      }
    ]
  }
}
```

## Hook Script (`load-memory.sh`)
```bash
#!/bin/bash
# Load memory files into session context
MEMORY_DIR="$HOME/.qwen/memories"
if [ -f "$MEMORY_DIR/MEMORY.md" ]; then
  cat "$MEMORY_DIR/MEMORY.md"
fi
if [ -f "$MEMORY_DIR/USER.md" ]; then
  cat "$MEMORY_DIR/USER.md"
fi
```

## When to Use
- Resuming work after a session break
- Loading project-specific context automatically
- Ensuring the agent remembers user preferences

---
name: Run Tests After Edits
description: Automatically run tests after any file is edited to ensure changes don't break the build
event: PostToolUse
matcher: "^(edit|write_file)$"
tags: ["testing", "automation", "quality"]
---

# Run Tests After Edits

## What This Does
After any `edit` or `write_file` operation, this hook runs the project's test suite to provide immediate feedback that changes don't break existing functionality.

## Setup

Add to your `settings.json`:
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "^(edit|write_file)$",
        "hooks": [
          {
            "type": "command",
            "command": "~/.qwen/hooks/run-tests.sh"
          }
        ]
      }
    ]
  }
}
```

## Hook Script (`run-tests.sh`)
```bash
#!/bin/bash
# Detect test command from project type and run it
if [ -f "package.json" ]; then
  npm test
elif [ -f "pom.xml" ]; then
  mvn test
elif [ -f "build.gradle" ]; then
  ./gradlew test
elif [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
  pytest
elif [ -f "Cargo.toml" ]; then
  cargo test
fi
```

## When to Use
- Any project with an existing test suite
- When you want TDD-style immediate feedback
- To catch regressions as they happen

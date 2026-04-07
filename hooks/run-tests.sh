#!/usr/bin/env bash
# ~/.qwen/hooks/run-tests.sh
# PostToolUse hook: runs tests after Qwen Code edits/writes a file.
# Reads JSON from stdin, extracts the modified file path, then
# auto-detects the project type and runs the appropriate test suite.

set -euo pipefail

# ── Parse hook input ──────────────────────────────────────────────────────────
# Qwen Code sends tool_input.file_path for edit/write_file tools
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty')

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

echo "🧪 Running tests after modifying: $FILE_PATH"

# ── Locate the project root ───────────────────────────────────────────────────
PROJECT_ROOT=$(git -C "$(dirname "$FILE_PATH")" rev-parse --show-toplevel 2>/dev/null \
  || dirname "$FILE_PATH")

cd "$PROJECT_ROOT"

# ── Detect test framework & run ───────────────────────────────────────────────
run_tests() {
  # ── Python (pytest / unittest) ────────────────────────────────────────────
  if [[ "$FILE_PATH" == *.py ]]; then
    if command -v pytest &>/dev/null && [[ -f "pyproject.toml" || -f "setup.cfg" || -f "pytest.ini" || -d "tests" ]]; then
      echo "▶ pytest"
      pytest --tb=short -q
    elif [[ -f "requirements.txt" ]]; then
      echo "▶ python -m pytest"
      python -m pytest --tb=short -q
    else
      echo "▶ python -m unittest discover"
      python -m unittest discover -s tests -p "test_*.py"
    fi

  # ── JavaScript / TypeScript ───────────────────────────────────────────────
  elif [[ "$FILE_PATH" == *.js || "$FILE_PATH" == *.ts || "$FILE_PATH" == *.jsx || "$FILE_PATH" == *.tsx ]]; then
    if [[ -f "package.json" ]]; then
      if grep -q '"vitest"' package.json 2>/dev/null; then
        echo "▶ vitest run"
        npx vitest run --reporter=verbose
      elif grep -q '"jest"' package.json 2>/dev/null; then
        echo "▶ jest"
        npx jest --passWithNoTests
      else
        echo "▶ npm test"
        npm test -- --passWithNoTests 2>/dev/null || npm test
      fi
    fi

  # ── Rust ──────────────────────────────────────────────────────────────────
  elif [[ "$FILE_PATH" == *.rs ]]; then
    echo "▶ cargo test"
    cargo test 2>&1 | tail -20

  # ── Go ────────────────────────────────────────────────────────────────────
  elif [[ "$FILE_PATH" == *.go ]]; then
    echo "▶ go test ./..."
    go test ./... -count=1

  # ── Ruby ──────────────────────────────────────────────────────────────────
  elif [[ "$FILE_PATH" == *.rb ]]; then
    if [[ -f "Gemfile" ]]; then
      if grep -q "rspec" Gemfile 2>/dev/null; then
        echo "▶ bundle exec rspec"
        bundle exec rspec --format progress
      else
        echo "▶ bundle exec rake test"
        bundle exec rake test
      fi
    fi

  # ── PHP ───────────────────────────────────────────────────────────────────
  elif [[ "$FILE_PATH" == *.php ]]; then
    if [[ -f "vendor/bin/phpunit" ]]; then
      echo "▶ phpunit"
      vendor/bin/phpunit --testdox
    fi

  # ── Java / Kotlin ─────────────────────────────────────────────────────────
  elif [[ "$FILE_PATH" == *.java || "$FILE_PATH" == *.kt ]]; then
    if [[ -f "mvnw" || -f "pom.xml" ]]; then
      echo "▶ mvn test"
      ./mvnw test  2>/dev/null || mvn test
    elif [[ -f "gradlew" || -f "build.gradle" ]]; then
      echo "▶ gradle test"
      ./gradlew test 2>/dev/null || gradle test
    fi

  # ── Generic fallback ──────────────────────────────────────────────────────
  else
    if [[ -f "Makefile" ]] && grep -q "^test" Makefile 2>/dev/null; then
      echo "▶ make test"
      make test
    elif [[ -f "package.json" ]] && jq -e '.scripts.test' package.json &>/dev/null; then
      echo "▶ npm test"
      npm test
    else
      echo "ℹ No test runner detected for $FILE_PATH — skipping."
      exit 0
    fi
  fi
}

# ── Execute & report ──────────────────────────────────────────────────────────
if run_tests; then
  echo "✅ Tests passed."
  exit 0
else
  echo "❌ Tests failed. Qwen will see this output and can attempt a fix."
  # Exit 2 surfaces the failure back to Qwen so it can react.
  exit 2
fi

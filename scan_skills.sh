#!/usr/bin/env bash
#
# Scan every skill under skills/ with skillspector, writing one Markdown
# report per skill. Each report is named after the skill it covers.
#
# Usage:
#   ./scan_skills.sh [SKILLS_DIR] [OUTPUT_DIR] [extra skillspector scan args...]
#
#   SKILLS_DIR  directory containing one subdir per skill (default: ./skills)
#   OUTPUT_DIR  where per-skill reports are written (default: ./skillspector-reports)
#   extra args  forwarded verbatim to `skillspector scan` (e.g. --baseline f.yaml)
#
#   NO_LLM=1    static analysis only (no LLM, no API key required)
#
# LLM analysis (full scan) uses an OpenAI-compatible endpoint. The non-secret
# settings are set below; the API key is read from the environment or from a
# local, gitignored .skillspector.env file (never hardcoded in this script).
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- LLM provider configuration (full scan) --------------------------------
export SKILLSPECTOR_PROVIDER="${SKILLSPECTOR_PROVIDER:-openai_compatible}"
export SKILLSPECTOR_COMPAT_BASE_URL="${SKILLSPECTOR_COMPAT_BASE_URL:-http://spark.local:4000/v1}"
export SKILLSPECTOR_MODEL="${SKILLSPECTOR_MODEL:-Qwen3.8-27B-thinking}"

# Shared workflow deadline (seconds) for one scan. The default 600s is too tight
# for a slow local model: earlier LLM phases consume the budget, so the
# semantic_security_discovery analyzer hits the deadline and records a
# "runtime_limit" finding. Bump it so every LLM phase can finish.
export SKILLSPECTOR_MAX_WORKFLOW_SECONDS="${SKILLSPECTOR_MAX_WORKFLOW_SECONDS:-1800}"

# Pick up the API key from a local env file if one exists (kept out of git).
if [ -z "${SKILLSPECTOR_COMPAT_API_KEY:-}" ] && [ -f ".skillspector.env" ]; then
  # shellcheck source=/dev/null
  source ./.skillspector.env
fi

# Merge the repo's skillspector-models.yaml into the installed provider's
# model_registry.yaml so local/custom models get their real token limits
# instead of the 128k fallback. The installed registry is not version
# controlled, so this re-applies on every run (survives reinstall/upgrade).
# No-op if the models file or the registry is absent.
ensure_model_registry() {
  local bin py pkg provider reg models_file
  models_file="${SKILLSPECTOR_MODELS_FILE:-$SCRIPT_DIR/skillspector-models.yaml}"
  [ -f "$models_file" ] || return 0
  bin="$(command -v skillspector || true)"
  [ -n "$bin" ] || return 0
  local shebang
  IFS= read -r shebang < "$bin" || return 0
  py="${shebang#\#!}"
  pkg="$("$py" -c 'import skillspector,os;print(os.path.dirname(skillspector.__file__))' 2>/dev/null || true)"
  [ -n "$pkg" ] || return 0
  provider="${SKILLSPECTOR_PROVIDER:-openai_compatible}"
  reg="$pkg/providers/$provider/model_registry.yaml"
  [ -f "$reg" ] || return 0
  "$py" - "$reg" "$models_file" <<'PY'
import sys, yaml
reg_path, models_file = sys.argv[1], sys.argv[2]
with open(reg_path) as f:
    reg = yaml.safe_load(f) or {}
models = reg.setdefault("models", {})
with open(models_file) as f:
    to_add = (yaml.safe_load(f) or {}).get("models", {})
added = [k for k in to_add if k not in models]
for k in added:
    models[k] = to_add[k]
if added:
    with open(reg_path, "w") as f:
        f.write("# Token-budget metadata (managed entries appended by scan_skills.sh)\n")
        yaml.safe_dump(reg, f, sort_keys=False, default_flow_style=False)
    print("registered model(s) in " + reg_path + ": " + ", ".join(added))
PY
}

SKILLS_DIR="${1:-./skills}"
OUTPUT_DIR="${2:-./skillspector-reports}"

# NO_LLM=1 runs static analysis only (no LLM, no API key needed).
NO_LLM="${NO_LLM:-0}"

# Extra args (positional, after SKILLS_DIR and OUTPUT_DIR) are forwarded
# verbatim to `skillspector scan` (e.g. --baseline file.yaml).
EXTRA_SCAN_ARGS=("${@:3}")

command -v skillspector >/dev/null 2>&1 || {
  echo "error: 'skillspector' not found on PATH" >&2
  exit 1
}

ensure_model_registry

if [ "$NO_LLM" != "1" ] && [ -z "${SKILLSPECTOR_COMPAT_API_KEY:-}" ]; then
  echo "warn: no LLM API key set; the full scan may fail unless the" >&2
  echo "      endpoint (SKILLSPECTOR_COMPAT_BASE_URL) does not require auth." >&2
  echo "      Set SKILLSPECTOR_COMPAT_API_KEY (env or ./.skillspector.env), or run" >&2
  echo "      static-only with: NO_LLM=1 ./scan_skills.sh" >&2
fi

[ -d "$SKILLS_DIR" ] || {
  echo "error: skills directory '$SKILLS_DIR' not found" >&2
  exit 1
}

mkdir -p "$OUTPUT_DIR"

scanned=0
skipped=0

for skill_dir in "$SKILLS_DIR"/*/; do
  [ -d "$skill_dir" ] || continue
  skill_dir="${skill_dir%/}"
  skill_name="$(basename "$skill_dir")"

  # Only scan directories that actually define a skill.
  if [ ! -f "$skill_dir/SKILL.md" ]; then
    echo "skip  $skill_name (no SKILL.md)"
    skipped=$((skipped + 1))
    continue
  fi

  report="$OUTPUT_DIR/${skill_name}.md"
  echo "scan  $skill_name -> $(basename "$report")"
  scan_cmd=(skillspector scan "$skill_dir" --format markdown --output "$report")
  [ "$NO_LLM" = "1" ] && scan_cmd+=(--no-llm)
  scan_cmd+=("${EXTRA_SCAN_ARGS[@]}")
  if ! "${scan_cmd[@]}"; then
    echo "warn  $skill_name: scan exited non-zero (report may be partial)" >&2
  fi
  scanned=$((scanned + 1))
done

echo
echo "Done. Scanned $scanned skill(s), skipped $skipped."
echo "Reports written to: $OUTPUT_DIR"

#!/usr/bin/env bash
#
# Scan every skill under skills/ with skillspector, writing one Markdown
# report per skill. Each report is named after the skill it covers.
#
# Usage:
#   ./scan_skills.sh [SKILLS_DIR] [OUTPUT_DIR] [extra skillspector scan args...]
#
#   SKILLS_DIR  directory containing one subdir per skill (default: ./skills)
#   OUTPUT_DIR  where per-skill reports are written (default: ./reports/skillspector)
#   extra args  forwarded verbatim to `skillspector scan` (e.g. --baseline f.yaml)
#
#   NO_LLM=1    static analysis only — this is the DEFAULT (no LLM, no API key)
#   NO_LLM=0    opt in to the LLM stage (OpenAI-compatible endpoint; see below)
#   RESCAN_ALL=1 force a re-scan of every skill even when reports look current
#
# The script is incremental: a skill is re-scanned only when its report is
# missing, carries a "Degraded scan" banner, was generated with NO_LLM=1
# (static-only reports are stamped with a marker), or its "Scanned" timestamp
# predates the skill's SKILL.md.
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
export SKILLSPECTOR_MODEL="${SKILLSPECTOR_MODEL:-Qwen3.8-Flash-Next}"

# The vLLM deployment behind this endpoint runs without xgrammar, so it
# rejects strict json_schema response_format (the default structured-output
# method) with HTTP 400 ("structured output needs xgrammar on the server"),
# which makes every LLM batch fail and the whole scan degrade to static-only.
# Tool calling is accepted by that server, so pin it. Remove this (or set
# SKILLSPECTOR_STRUCTURED_OUTPUT_METHOD=json_schema) once the vLLM side has
# xgrammar installed.
export SKILLSPECTOR_STRUCTURED_OUTPUT_METHOD="${SKILLSPECTOR_STRUCTURED_OUTPUT_METHOD:-function_calling}"

# Shared workflow deadline (seconds) for one scan. The default 600s is too tight
# for a slow local model: earlier LLM phases consume the budget, so the
# semantic_security_discovery analyzer hits the deadline and records a
# "runtime_limit" finding. Bump it so every LLM phase can finish.
#
# 5400s (90 min) because the per-call LLM timeout is derived from the *remaining*
# budget: on the largest skills (e.g. agentic-patterns-research, ~186k lines) a
# 30-min deadline runs out mid-scan and the later batches fail with
# OpenAITimeoutError, degrading those files to static-only.
export SKILLSPECTOR_MAX_WORKFLOW_SECONDS="${SKILLSPECTOR_MAX_WORKFLOW_SECONDS:-5400}"

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
OUTPUT_DIR="${2:-./reports/skillspector}"

# Positional args after the two directories are forwarded verbatim to every
# `skillspector scan` call (e.g. ./scan_skills.sh ./skills ./out --baseline f.yaml).
EXTRA_SCAN_ARGS=("${@:3}")

# Static analysis only by default (no LLM, no API key needed). Set NO_LLM=0 to
# include the LLM stage in the scan.
NO_LLM="${NO_LLM:-1}"

# RESCAN_ALL=1 bypasses the staleness check below and re-scans every skill.
RESCAN_ALL="${RESCAN_ALL:-0}"

# Stamped into reports generated with --no-llm so a later full run can tell a
# static-only report (which carries no "Degraded scan" banner) apart from a
# real one and re-scan it.
STATIC_MARKER="<!-- scan_skills.sh: static report (NO_LLM=1) -->"

# skillspector stamps the scanned skill's full local path into the report
# header ("**Source:** `/abs/path`"), which leaks machine-specific paths into
# a report meant to be shared. The report is already named after the skill, so
# strip the header line. Only lines before the first "## " section are touched;
# the "**Source:**" lines inside findings are external URLs and stay.
strip_source_line() {
  local report="$1" tmp
  tmp="$(mktemp)"
  awk '/^## /{f=1} !f && /^\*\*Source:\*\*/{next} {print}' "$report" > "$tmp" \
    && mv "$tmp" "$report"
}

# Decide whether an existing report is still current. Returns 0 (re-scan) when
# the report is missing, degraded, static-only, or older than SKILL.md; 1
# (skip) otherwise. On a re-scan, RESCAN_REASON explains why.
RESCAN_REASON=""
needs_rescan() {
  local report="$1" skill_md="$2"
  local scanned_raw scanned_epoch skill_epoch
  if [ ! -f "$report" ]; then
    RESCAN_REASON="no report yet"
    return 0
  fi
  # A) previous LLM stage failed: results are static-only and must be redone.
  if grep -q "Degraded scan" "$report"; then
    RESCAN_REASON="previous report degraded"
    return 0
  fi
  # A) a static-only report clobbered a full one: redo it with the LLM.
  if [ "$NO_LLM" != "1" ] && grep -qF "$STATIC_MARKER" "$report"; then
    RESCAN_REASON="previous report static-only"
    return 0
  fi
  # B) the skill changed since the report was written.
  scanned_raw="$(grep -m1 -oE '\*\*Scanned:\*\* +[0-9-]+ [0-9:]+ [A-Za-z]+' "$report" || true)"
  scanned_raw="${scanned_raw#\*\*Scanned:\*\* }"
  if [ -z "$scanned_raw" ]; then
    # Check before calling date: `date -d ""` succeeds (returns the start of
    # the current day), which would make a report without a Scanned line look
    # current instead of unparseable.
    RESCAN_REASON="no Scanned timestamp in report"
    return 0
  fi
  scanned_epoch="$(date -d "$scanned_raw" +%s 2>/dev/null || true)"
  skill_epoch="$(stat -c %Y "$skill_md" 2>/dev/null || true)"
  if [ -z "$scanned_epoch" ] || [ -z "$skill_epoch" ]; then
    RESCAN_REASON="cannot verify freshness"
    return 0
  fi
  if [ "$scanned_epoch" -lt "$skill_epoch" ]; then
    RESCAN_REASON="SKILL.md newer than report"
    return 0
  fi
  RESCAN_REASON=""
  return 1
}

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
up_to_date=0
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

  # Incremental: keep the existing report unless it is stale or untrustworthy.
  if [ "$RESCAN_ALL" != "1" ] && ! needs_rescan "$report" "$skill_dir/SKILL.md"; then
    echo "skip  $skill_name (report current)"
    up_to_date=$((up_to_date + 1))
    continue
  fi

  echo "scan  $skill_name -> $(basename "$report")"
  [ "$RESCAN_ALL" = "1" ] || echo "      reason: $RESCAN_REASON"
  scan_cmd=(skillspector scan "$skill_dir" --format markdown --output "$report")
  [ "$NO_LLM" = "1" ] && scan_cmd+=(--no-llm)
  scan_cmd+=("${EXTRA_SCAN_ARGS[@]}")
  if ! "${scan_cmd[@]}"; then
    echo "warn  $skill_name: scan exited non-zero (report may be partial)" >&2
  fi
  if [ -f "$report" ]; then
    strip_source_line "$report"
  fi
  if [ "$NO_LLM" = "1" ] && [ -f "$report" ]; then
    printf '\n%s\n' "$STATIC_MARKER" >> "$report"
  fi
  scanned=$((scanned + 1))
done

echo
echo "Done. Scanned $scanned, up-to-date $up_to_date, skipped $skipped."
echo "Reports written to: $OUTPUT_DIR"

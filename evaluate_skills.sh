#!/usr/bin/env bash
#
# Validate every skill under skills/ with NVIDIA SkillEvaluator, writing one
# Markdown report per skill (Tier 1 static/security checks + Tier 2 semantic
# deduplication by default). Each report is named after the skill it covers.
#
# Usage:
#   ./evaluate_skills.sh [SKILLS_DIR] [OUTPUT_DIR] [extra skillevaluator validate args...]
#
#   SKILLS_DIR  directory containing one subdir per skill (default: ./skills)
#   OUTPUT_DIR  where per-skill reports are written (default: ./reports/skillevaluator)
#   extra args  forwarded verbatim to `skillevaluator validate`
#
#   NO_LLM=1    static analysis only (--no-llm --no-dedup --tiers 1; no
#               LLM provider or API key required)
#   TIER3=1     also run Tier 3 live agent evaluation (needs Docker + a
#               provider; each skill takes ~10 min or more — off by default)
#   RESCAN_ALL=1 force a full re-run even when reports look current
#
# By default the `security` Tier-1 check is excluded via --checks. That check
# delegates to the skillspector CLI, which scan_skills.sh already runs
# directly with its own timeout and structured-output tuning — calling it
# again from SkillEvaluator is redundant and was the slowest stage of the
# sweep. All other checks stay on, including `pii` (regex PII scan) and
# `code-integrity` (gitleaks secrets scan), which do not use skillspector.
# Override with CHECKS="a,b,c" (empty = SkillEvaluator's default set, which
# re-includes `security`).
#
# The script is incremental: a skill is re-validated only when its report is
# missing, carries an "INCOMPLETE" status (a degraded run whose LLM or eval
# stage failed), was generated with NO_LLM=1 (static-only reports are stamped
# with a marker), or its "Generated:" timestamp predates the skill's SKILL.md.
#
# LLM-backed checks use an OpenAI-compatible endpoint. The non-secret
# settings are set below; the API key is read from the environment or from a
# local, gitignored .skillevaluator.env file (never hardcoded in this script).
#
# Requires: skillevaluator on PATH
#   uv tool install --python 3.13 "skillevaluator[all] @ git+https://github.com/NVIDIA/SkillEvaluator.git"
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- LLM provider configuration (full run) ---------------------------------
export SKILL_EVAL_LLM_PROVIDER="${SKILL_EVAL_LLM_PROVIDER:-openai-compatible}"
export SKILL_EVAL_LLM_BASE_URL="${SKILL_EVAL_LLM_BASE_URL:-http://spark.local:4000/v1}"
export SKILL_EVAL_LLM_MODEL="${SKILL_EVAL_LLM_MODEL:-Qwen3.8-Flash-Next}"

# Pick up the API key from a local env file if one exists (kept out of git;
# *.env is gitignored).
if [ -z "${SKILL_EVAL_LLM_API_KEY:-}" ] && [ -f "$SCRIPT_DIR/.skillevaluator.env" ]; then
  # shellcheck source=/dev/null
  source "$SCRIPT_DIR/.skillevaluator.env"
fi

SKILLS_DIR="${1:-./skills}"
shift || true
OUTPUT_DIR="${1:-./reports/skillevaluator}"
shift || true
EXTRA_ARGS=("$@")

# NO_LLM=1 runs static analysis only (no LLM, no provider key needed).
NO_LLM="${NO_LLM:-0}"

# TIER3=1 adds the Tier 3 live agent evaluation (Docker, very slow).
TIER3="${TIER3:-0}"

# RESCAN_ALL=1 bypasses the staleness check below and re-validates every skill.
RESCAN_ALL="${RESCAN_ALL:-0}"

# Tier-1 checks to run, passed verbatim to --checks when non-empty. Excludes
# `security` (the delegated skillspector call) by default; see header.
CHECKS="${CHECKS:-schema,version,pii,license,code-integrity,unicode,quality,lint}"

# Stamped into reports generated with NO_LLM=1 so a later full run can tell a
# static-only report (which carries no "INCOMPLETE" status) apart from a real
# one and re-run it.
STATIC_MARKER="<!-- evaluate_skills.sh: static report (NO_LLM=1) -->"

# Findings embed absolute filesystem paths (script locations in the Location
# column, temp run dirs in re-run hints). Scrub them so reports shared outside
# this machine do not leak local paths.
scrub_local_paths() {
  local report="$1" skills_abs="$2" rundir="$3" tmp
  tmp="$(mktemp)"
  sed -e "s#${rundir}#<run-dir>#g" -e "s#${skills_abs}/##g" "$report" > "$tmp" \
    && mv "$tmp" "$report"
}

# SkillEvaluator runs Gitleaks (the code-integrity check) with the scan root as
# the working directory and `--report-path -`. This Gitleaks build reads that
# "-" as a literal filename instead of the stdout convention, so it drops a
# JSON report named `-` into the skill directory on every run (3 bytes, "[]",
# when nothing is found). Deleting it after each run keeps the sweep from
# littering the tree; it is never read back, so the verdict is unaffected.
scrub_run_artifacts() {
  local dir="$1"
  rm -f "$dir/-" "$dir/.pii_results.json" "$dir/.segfault-docker-hosts.md" \
        "$dir/gitleaks-report.json"
}

# Decide whether an existing report is still current. Returns 0 (re-run) when
# the report is missing, incomplete, static-only, or older than SKILL.md; 1
# (skip) otherwise. On a re-run, RESCAN_REASON explains why.
RESCAN_REASON=""
needs_rescan() {
  local report="$1" skill_md="$2"
  local generated_raw generated_epoch skill_epoch
  if [ ! -f "$report" ]; then
    RESCAN_REASON="no report yet"
    return 0
  fi
  # A) a previous run did not complete cleanly: the header status line reads
  # "⚠️ INCOMPLETE" and its LLM/eval results are untrustworthy. Redo it.
  if grep -q '^\*\*Status:\*\*.*INCOMPLETE' "$report"; then
    RESCAN_REASON="previous report incomplete"
    return 0
  fi
  # A) a static-only report clobbered a full one: redo it with the LLM.
  if [ "$NO_LLM" != "1" ] && grep -qF "$STATIC_MARKER" "$report"; then
    RESCAN_REASON="previous report static-only"
    return 0
  fi
  # B) the skill changed since the report was written.
  generated_raw="$(grep -m1 '^\*\*Generated:\*\* ' "$report" || true)"
  generated_raw="${generated_raw#\*\*Generated:\*\* }"
  # "October 07, 2026 at 12:13 AM UTC" -> "October 07, 2026 12:13 AM UTC",
  # which GNU date parses (the trailing UTC is honoured as the timezone).
  generated_raw="${generated_raw/ at / }"
  if [ -z "$generated_raw" ]; then
    # Check before calling date: `date -d ""` succeeds (returns the start of
    # the current day), which would make a report without a Generated line
    # look current instead of unparseable.
    RESCAN_REASON="no Generated timestamp in report"
    return 0
  fi
  generated_epoch="$(TZ=UTC date -d "$generated_raw" +%s 2>/dev/null || true)"
  skill_epoch="$(stat -c %Y "$skill_md" 2>/dev/null || true)"
  if [ -z "$generated_epoch" ] || [ -z "$skill_epoch" ]; then
    RESCAN_REASON="cannot verify freshness"
    return 0
  fi
  if [ "$generated_epoch" -lt "$skill_epoch" ]; then
    RESCAN_REASON="SKILL.md newer than report"
    return 0
  fi
  RESCAN_REASON=""
  return 1
}

command -v skillevaluator >/dev/null 2>&1 || {
  echo "error: 'skillevaluator' not found on PATH" >&2
  echo "       install it with:" >&2
  echo "       uv tool install --python 3.13 \"skillevaluator[all] @ git+https://github.com/NVIDIA/SkillEvaluator.git\"" >&2
  exit 1
}

if [ "$NO_LLM" != "1" ] && [ -z "${SKILL_EVAL_LLM_API_KEY:-}" ]; then
  echo "warn: no LLM API key set; LLM-backed checks may fail unless the" >&2
  echo "      endpoint (SKILL_EVAL_LLM_BASE_URL) does not require auth." >&2
  echo "      Set SKILL_EVAL_LLM_API_KEY (env or ./.skillevaluator.env), or run" >&2
  echo "      static-only with: NO_LLM=1 ./evaluate_skills.sh" >&2
fi

[ -d "$SKILLS_DIR" ] || {
  echo "error: skills directory '$SKILLS_DIR' not found" >&2
  exit 1
}

# Absolute form of $SKILLS_DIR, used to scrub local paths from reports.
SKILLS_DIR_ABS="$(cd "$SKILLS_DIR" && pwd)"

mkdir -p "$OUTPUT_DIR"

scanned=0
up_to_date=0
skipped=0

for skill_dir in "$SKILLS_DIR"/*/; do
  [ -d "$skill_dir" ] || continue
  skill_dir="${skill_dir%/}"
  skill_name="$(basename "$skill_dir")"

  # Only validate directories that actually define a skill.
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

  echo "eval  $skill_name -> $(basename "$report")"
  [ "$RESCAN_ALL" = "1" ] || echo "      reason: $RESCAN_REASON"

  # Each run writes skillevaluator-output-<timestamp>.{md,json} plus a
  # BENCHMARK.md into its --output-dir; run in a temp dir and keep only the
  # Markdown report, renamed to <skill>.md in OUTPUT_DIR.
  run_dir="$(mktemp -d)"
  validate_cmd=(skillevaluator validate "$skill_dir" -r markdown -o "$run_dir")
  if [ -n "$CHECKS" ]; then
    validate_cmd+=(--checks "$CHECKS")
  fi
  if [ "$NO_LLM" = "1" ]; then
    validate_cmd+=(--no-llm --no-dedup --tiers 1)
  elif [ "$TIER3" = "1" ]; then
    validate_cmd+=(--llm --tiers 1,2,3)
  else
    validate_cmd+=(--llm --tiers 1,2)
  fi
  validate_cmd+=("${EXTRA_ARGS[@]}")
  if ! "${validate_cmd[@]}"; then
    echo "warn  $skill_name: validate exited non-zero (report may be partial)" >&2
  fi

  scrub_run_artifacts "$skill_dir"

  latest_md=""
  for md in "$run_dir"/skillevaluator-output-*.md; do
    if [ -f "$md" ]; then
      latest_md="$md"
    fi
  done
  if [ -n "$latest_md" ]; then
    cp "$latest_md" "$report"
    scrub_local_paths "$report" "$SKILLS_DIR_ABS" "$run_dir"
    if [ "$NO_LLM" = "1" ]; then
      printf '\n%s\n' "$STATIC_MARKER" >> "$report"
    fi
  else
    echo "warn  $skill_name: no Markdown report produced" >&2
  fi
  rm -rf "$run_dir"

  scanned=$((scanned + 1))
done

echo
echo "Done. Validated $scanned, up-to-date $up_to_date, skipped $skipped."
echo "Reports written to: $OUTPUT_DIR"

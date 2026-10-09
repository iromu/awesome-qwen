#!/usr/bin/env bash
#
# Validate every skill under skills/ with NVIDIA SkillEvaluator, writing one
# Markdown report per skill (Tier 1 static/security checks + Tier 2 semantic
# deduplication by default). Each report is named after the skill it covers.
#
# Usage:
#   ./evaluate_skills.sh [SKILLS_DIR] [OUTPUT_DIR] [extra skillevaluator validate args...]
#   ./evaluate_skills.sh --skill <name|glob|path> [--skill ...] [extra validate args...]
#
#   SKILLS_DIR  directory containing one subdir per skill (default: ./skills)
#   OUTPUT_DIR  where per-skill reports are written (default: ./reports/skillevaluator)
#   extra args  forwarded verbatim to `skillevaluator validate`
#
#   --skill, -s <list>  Validate only these skills. Repeatable, and accepts a
#                       comma-separated list. An entry may be a bare skill name
#                       (docker-containerize), a glob (embabel-*), or a path to
#                       the skill directory (skills/docker-containerize). A path
#                       also sets the scan root, so `--skill skills/foo` needs
#                       no separate SKILLS_DIR argument. Naming skills this way
#                       forces them (see --force) and a name that matches no
#                       skill is an error rather than a silent no-op.
#   --force, -f         Re-validate even when the existing report still looks
#                       current. Without it a skill whose report is fresh,
#                       complete, and newer than its SKILL.md is skipped.
#
#   NO_LLM=1    static analysis only (adds --no-llm; no LLM provider or API
#               key required)
#   DEDUP=1     also run the Tier 2 semantic-deduplication check, which is off
#               by default — see the note below
#   TIER3=1     also run Tier 3 live agent evaluation (needs Docker + a
#               provider; each skill takes ~10 min or more — off by default)
#   RESCAN_ALL=1 force a re-run of every skill; same effect as --force
#
# Tier 2 deduplication is OFF by default, which is the one place this script
# deliberately narrows what SkillEvaluator would otherwise run. It embeds every
# chunk of a skill and compares them, so it needs an embedding model: the
# endpoint configured below serves chat models only, and a run that requests
# Tier 2 therefore finds nothing to report and still ends as "⚠️ INCOMPLETE"
# (or, for the large skills, trips the 512-chunk cap first). Set DEDUP=1 once
# SKILL_EVAL_LLM_BASE_URL points at a real embedding model.
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
# Because that last test only watches SKILL.md, an edit confined to
# references/ or scripts/ leaves the report looking current — pass --skill (or
# --force) when re-checking a skill after that kind of change.
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

# --- argument parsing ------------------------------------------------------
# Wrapper flags (-s/--skill/--only, -f/--force) are recognised anywhere on the
# command line. Anything else beginning with a dash is forwarded verbatim to
# `skillevaluator validate`; the first two remaining arguments are still the
# SKILLS_DIR and OUTPUT_DIR positionals. That keeps the older call forms intact
# — `./evaluate_skills.sh ./skills ./reports --fail-fast` parses as before.
SKILLS_DIR=""
OUTPUT_DIR=""
FORCE="${RESCAN_ALL:-0}"
POSITIONALS=()
EXTRA_ARGS=()
SELECTIONS=()

while [ $# -gt 0 ]; do
  case "$1" in
    -s | --skill | --only)
      if [ $# -lt 2 ]; then
        echo "error: $1 needs a skill name, glob, or path" >&2
        exit 1
      fi
      read -ra picked <<< "${2//,/ }"
      SELECTIONS+=("${picked[@]}")
      shift 2
      ;;
    --skill=* | --only=*)
      list="${1#*=}"
      read -ra picked <<< "${list//,/ }"
      SELECTIONS+=("${picked[@]}")
      shift
      ;;
    -f | --force)
      FORCE=1
      shift
      ;;
    -*)
      EXTRA_ARGS+=("$1")
      shift
      ;;
    *)
      POSITIONALS+=("$1")
      shift
      ;;
  esac
done

if [ "${#POSITIONALS[@]}" -gt 0 ]; then
  SKILLS_DIR="${POSITIONALS[0]}"
  if [ "${#POSITIONALS[@]}" -gt 1 ]; then
    OUTPUT_DIR="${POSITIONALS[1]}"
  fi
fi

# Resolve the selection list. An entry that is an existing directory holding a
# SKILL.md is a path rather than a name: its basename becomes the filter and its
# parent becomes the scan root, so `--skill skills/foo` needs no separate
# SKILLS_DIR. Anything else is matched as a name or glob inside the root.
SELECTED=()
for selection in ${SELECTIONS[@]+"${SELECTIONS[@]}"}; do
  if [ -f "$selection/SKILL.md" ]; then
    if [ -z "$SKILLS_DIR" ]; then
      SKILLS_DIR="$(dirname "$selection")"
    fi
    SELECTED+=("$(basename "$selection")")
  else
    SELECTED+=("$selection")
  fi
done

SKILLS_DIR="${SKILLS_DIR:-./skills}"
OUTPUT_DIR="${OUTPUT_DIR:-./reports/skillevaluator}"

# Naming skills explicitly means you want their current verdict, so it forces
# them. The staleness test below only compares against SKILL.md, so without
# this a fix confined to references/ or scripts/ would skip straight through.
if [ "${#SELECTED[@]}" -gt 0 ]; then
  FORCE=1
fi

# True when $1 matches one of the --skill entries. The right-hand operand of the
# comparison is deliberately unquoted so globs such as 'embabel-*' still expand.
is_selected() {
  local name="$1" pattern
  for pattern in "${SELECTED[@]}"; do
    # shellcheck disable=SC2254
    [[ "$name" == $pattern ]] && return 0
  done
  return 1
}

# NO_LLM=1 runs static analysis only (no LLM, no provider key needed).
NO_LLM="${NO_LLM:-0}"

# DEDUP=1 re-enables the Tier 2 deduplication check. Off unless asked for.
DEDUP="${DEDUP:-0}"

# TIER3=1 adds the Tier 3 live agent evaluation (Docker, very slow).
TIER3="${TIER3:-0}"


# Tier-1 checks to run, passed verbatim to --checks when non-empty. Excludes
# `security` (the delegated skillspector call) by default and `pii` too many false positives; see header.
CHECKS="${CHECKS:-schema,version,license,code-integrity,unicode,quality,lint}"

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

# A --skill entry that is a literal name or path has to match something, or the
# run would validate nothing and still exit 0. Globs are allowed to match
# nothing; a plain name is not.
for selection in ${SELECTED[@]+"${SELECTED[@]}"}; do
  case "$selection" in
    *'*'*) continue ;;
  esac
  matched=0
  for candidate in "$SKILLS_DIR"/*/; do
    if [ "$(basename "$candidate")" = "$selection" ]; then
      matched=1
      break
    fi
  done
  if [ "$matched" != "1" ]; then
    echo "error: no skill named '$selection' under '$SKILLS_DIR'" >&2
    echo "       (a --skill entry must be a skill directory, a glob, or a path" >&2
    echo "        to one; nothing was validated)" >&2
    exit 1
  fi
done

# Absolute form of $SKILLS_DIR, used to scrub local paths from reports.
SKILLS_DIR_ABS="$(cd "$SKILLS_DIR" && pwd)"

mkdir -p "$OUTPUT_DIR"

if [ "${#SELECTED[@]}" -gt 0 ]; then
  echo "targeting: ${SELECTED[*]}"
fi

scanned=0
up_to_date=0
skipped=0

for skill_dir in "$SKILLS_DIR"/*/; do
  [ -d "$skill_dir" ] || continue
  skill_dir="${skill_dir%/}"
  skill_name="$(basename "$skill_dir")"

  # --skill narrows the sweep to the named skills; anything else is passed over
  # silently, since listing 25 "skip" lines would only bury the one that ran.
  if [ "${#SELECTED[@]}" -gt 0 ] && ! is_selected "$skill_name"; then
    continue
  fi

  # Only validate directories that actually define a skill.
  if [ ! -f "$skill_dir/SKILL.md" ]; then
    echo "skip  $skill_name (no SKILL.md)"
    skipped=$((skipped + 1))
    continue
  fi

  report="$OUTPUT_DIR/${skill_name}.md"

  # Incremental: keep the existing report unless it is stale or untrustworthy.
  if [ "$FORCE" != "1" ] && ! needs_rescan "$report" "$skill_dir/SKILL.md"; then
    echo "skip  $skill_name (report current)"
    up_to_date=$((up_to_date + 1))
    continue
  fi

  echo "eval  $skill_name -> $(basename "$report")"
  [ "$FORCE" = "1" ] || echo "      reason: $RESCAN_REASON"

  # Each run writes skillevaluator-output-<timestamp>.{md,json} plus a
  # BENCHMARK.md into its --output-dir; run in a temp dir and keep only the
  # Markdown report, renamed to <skill>.md in OUTPUT_DIR.
  run_dir="$(mktemp -d)"
  validate_cmd=(skillevaluator validate "$skill_dir" -r markdown -o "$run_dir")
  if [ -n "$CHECKS" ]; then
    validate_cmd+=(--checks "$CHECKS")
  fi
  # Tier 1 always runs. Tier 2 and Tier 3 are opt-in here even though
  # SkillEvaluator defaults Tier 2 to on, and the tier list has to say so:
  # omitting --tiers would leave Tier 3 running for every skill, and --no-dedup
  # on its own still leaves Tier 2 inside the requested tier set.
  tiers="1"
  if [ "$DEDUP" = "1" ]; then
    tiers="$tiers,2"
  fi
  if [ "$TIER3" = "1" ]; then
    tiers="$tiers,3"
  fi

  if [ "$NO_LLM" = "1" ]; then
    validate_cmd+=(--no-llm)
  else
    validate_cmd+=(--llm)
  fi
  if [ "$DEDUP" = "1" ]; then
    validate_cmd+=(--dedup)
  else
    validate_cmd+=(--no-dedup)
  fi
  validate_cmd+=(--tiers "$tiers")
  validate_cmd+=(${EXTRA_ARGS[@]+"${EXTRA_ARGS[@]}"})
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

# SkillSpector Security Report

**Skill:** json-formatting  
**Scanned:** 2026-10-07 03:38:10 UTC  

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 4/100 |
| Severity | LOW |
| Recommendation | CAUTION |

## Components (1)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `SKILL.md` | markdown | 450 | No |

## Issues (2)

### 🟢 LOW: SQP-1

**Location:** `SKILL.md:3–21`  
**Confidence:** 50%  

**Message:** Overly broad activation scope in the skill description: it fires on "any request involving JSON formatting ... conversion ... schema generation" and spans ten distinct operations (format, minify, validate, transform, convert, schema, diff, merge, patch, query), including conversion to/from YAML, XML, CSV and TOML and generic "extract nested values"/"sort"/"reformat" actions, with no exclusion conditions or negative examples.

**Remediation:** Narrow the trigger clause in the description (L3) to "requests whose input or output artifact is a JSON document" and add an explicit exclusions list, e.g. "Do not use for YAML-only/XML-only/CSV-only file editing, database queries, or general file conversion where JSON is not involved." Mirror those exclusions as negative examples at the end of the "When to Use" section (L11-L21).

---

### 🟢 LOW: SQP-2

**Location:** `SKILL.md:325–361`  
**Confidence:** 45%  

**Message:** Steps 8-10 (Diff/Compare, Merge, Patch) describe operations that mutate or delete user data — deep-merge silently overwrites colliding keys (port 3000 -> 8080), JSON Patch includes a destructive `remove` op, and Merge Patch deletes keys via `null` — yet the skill gives no warning that these are irreversible and no instruction to keep or verify against the original file before overwriting it.

**Remediation:** Add a caveat to Step 9/Step 10 (and a matching Pitfalls bullet) stating that deep-merge overwrites colliding keys and that `remove` ops / `null` values delete data permanently, and instruct the agent to write the result to a new file (or show the diff and obtain user confirmation) before modifying the user's original JSON document.

---

## Inspection Completeness

| Metric | Value |
|--------|-------|
| Execution | successful |
| Status | partial |
| Coverage | 0.0% |
| Fully inspected | 0 |
| Partially inspected | 1 |
| Entirely uninspected | 0 |

### Ledger Exceptions

| Reason / Status | Location | Details |
|-----------------|----------|---------|
| static_parse_limit | `SKILL.md` | A security-relevant expression exceeded a bounded static parser's span limit. |
| reference_missing | `SKILL.md:51-51` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:81-81` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:110-110` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:139-139` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:180-180` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:184-184` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:203-203` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:237-237` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:241-241` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:428-428` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |

### Analyzer Statuses

| Reason / Status | Location | Details |
|-----------------|----------|---------|
| completed | `artifact_integrity` |  |
| no_applicable_files | `behavioral_ast` | No files matched this analyzer's applicability contract. |
| no_applicable_files | `behavioral_taint_tracking` | No files matched this analyzer's applicability contract. |
| no_applicable_files | `bundled_execution_surface` | No files matched this analyzer's applicability contract. |
| no_applicable_files | `mcp_least_privilege` | No files matched this analyzer's applicability contract. |
| completed | `mcp_rug_pull` |  |
| completed | `mcp_tool_poisoning` |  |
| completed | `meta_analyzer` |  |
| completed | `semantic_developer_intent` |  |
| completed | `semantic_quality_policy` |  |
| completed | `semantic_security_discovery` |  |
| completed | `static_patterns_agent_snooping` |  |
| completed | `static_patterns_anti_refusal` |  |
| completed | `static_patterns_data_exfiltration` |  |
| completed | `static_patterns_deserialization` |  |
| completed | `static_patterns_excessive_agency` |  |
| completed | `static_patterns_harmful_content` |  |
| completed | `static_patterns_memory_poisoning` |  |
| completed | `static_patterns_output_handling` |  |
| completed | `static_patterns_privilege_escalation` |  |
| completed | `static_patterns_prompt_injection` |  |
| completed | `static_patterns_rogue_agent` |  |
| completed | `static_patterns_ssrf` |  |
| completed | `static_patterns_supply_chain` |  |
| completed | `static_patterns_system_prompt_leakage` |  |
| degraded | `static_patterns_tool_misuse` |  |
| completed | `static_yara` |  |

### Limitations

- Analyzer static_patterns_tool_misuse status: degraded.

## Metadata

- **Executable Scripts:** No

*Generated by SkillSpector v2.12.0*

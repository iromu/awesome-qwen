# SkillSpector Security Report

**Skill:** yaml-validator  
**Scanned:** 2026-10-08 22:49:43 UTC  

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 25/100 |
| Severity | MEDIUM |
| Recommendation | CAUTION |

## Components (3)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `SKILL.md` | markdown | 238 | No |
| `references/best-practices.md` | markdown | 309 | No |
| `references/common-issues.md` | markdown | 221 | No |

## Issues (1)

### 🔴 HIGH: AE1

**Location:** `SKILL.md:232`  
**Confidence:** 100%  

**Message:** Referenced artifact was not completely inspected

**Remediation:** Review the reported expression and analyzer's parsing limitation; correct the scanner if it misinterprets valid source, then rerun the scan. Keep required references; incomplete analysis is not proof of malicious evasion.

**Evidence:**
- **reasons:** `[{'reason_code': 'static_parse_limit', 'message': "A security-relevant expression exceeded a bounded static parser's span limit.", 'phase': 'static', 'analyzers': ['static_patterns_tool_misuse']}]`
- **target_disposition:** `partial`
- **target_path:** `references/best-practices.md`

---

## Inspection Completeness

| Metric | Value |
|--------|-------|
| Execution | successful |
| Status | partial |
| Coverage | 66.7% |
| Fully inspected | 2 |
| Partially inspected | 1 |
| Entirely uninspected | 0 |

### Ledger Exceptions

| Reason / Status | Location | Details |
|-----------------|----------|---------|
| reference_missing | `SKILL.md:86-86` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:89-89` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:111-111` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:115-115` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:121-121` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:125-125` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:181-181` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:191-191` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:200-200` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| static_parse_limit | `references/best-practices.md` | A security-relevant expression exceeded a bounded static parser's span limit. |

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
| no_applicable_files | `meta_analyzer` | No files matched this analyzer's applicability contract. |
| completed | `reference_coverage` |  |
| disabled_by_configuration | `semantic_developer_intent` | Analyzer was disabled by the requested configuration. |
| disabled_by_configuration | `semantic_quality_policy` | Analyzer was disabled by the requested configuration. |
| disabled_by_configuration | `semantic_security_discovery` | Analyzer was disabled by the requested configuration. |
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

<!-- scan_skills.sh: static report (NO_LLM=1) -->

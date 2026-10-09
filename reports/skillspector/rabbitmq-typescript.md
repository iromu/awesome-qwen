# SkillSpector Security Report

**Skill:** rabbitmq-typescript  
**Scanned:** 2026-10-08 22:48:47 UTC  

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 56/100 |
| Severity | HIGH |
| Recommendation | DO NOT INSTALL |

## Components (3)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `SKILL.md` | markdown | 411 | No |
| `references/amqplib.md` | markdown | 567 | No |
| `references/rabbitmq-concepts.md` | markdown | 395 | No |

## Issues (8)

### 🔴 HIGH: AE1

**Location:** `SKILL.md:248`  
**Confidence:** 100%  

**Message:** Referenced artifact was not completely inspected

**Remediation:** Review the reported expression and analyzer's parsing limitation; correct the scanner if it misinterprets valid source, then rerun the scan. Keep required references; incomplete analysis is not proof of malicious evasion.

**Evidence:**
- **reasons:** `[{'reason_code': 'static_parse_limit', 'message': "A security-relevant expression exceeded a bounded static parser's span limit.", 'phase': 'static', 'analyzers': ['static_patterns_tool_misuse']}]`
- **target_disposition:** `partial`
- **target_path:** `references/amqplib.md`

---

### 🔴 HIGH: AE1

**Location:** `SKILL.md:256`  
**Confidence:** 100%  

**Message:** Referenced artifact was not completely inspected

**Remediation:** Review the reported expression and analyzer's parsing limitation; correct the scanner if it misinterprets valid source, then rerun the scan. Keep required references; incomplete analysis is not proof of malicious evasion.

**Evidence:**
- **reasons:** `[{'reason_code': 'static_parse_limit', 'message': "A security-relevant expression exceeded a bounded static parser's span limit.", 'phase': 'static', 'analyzers': ['static_patterns_tool_misuse']}]`
- **target_disposition:** `partial`
- **target_path:** `references/amqplib.md`

---

### 🔴 HIGH: AE1

**Location:** `SKILL.md:261`  
**Confidence:** 100%  

**Message:** Referenced artifact was not completely inspected

**Remediation:** Review the reported expression and analyzer's parsing limitation; correct the scanner if it misinterprets valid source, then rerun the scan. Keep required references; incomplete analysis is not proof of malicious evasion.

**Evidence:**
- **reasons:** `[{'reason_code': 'static_parse_limit', 'message': "A security-relevant expression exceeded a bounded static parser's span limit.", 'phase': 'static', 'analyzers': ['static_patterns_tool_misuse']}]`
- **target_disposition:** `partial`
- **target_path:** `references/amqplib.md`

---

### 🔴 HIGH: AE1

**Location:** `SKILL.md:330`  
**Confidence:** 100%  

**Message:** Referenced artifact was not completely inspected

**Remediation:** Review the reported expression and analyzer's parsing limitation; correct the scanner if it misinterprets valid source, then rerun the scan. Keep required references; incomplete analysis is not proof of malicious evasion.

**Evidence:**
- **reasons:** `[{'reason_code': 'static_parse_limit', 'message': "A security-relevant expression exceeded a bounded static parser's span limit.", 'phase': 'static', 'analyzers': ['static_patterns_tool_misuse']}]`
- **target_disposition:** `partial`
- **target_path:** `references/amqplib.md`

---

### 🔴 HIGH: AE1

**Location:** `SKILL.md:408`  
**Confidence:** 100%  

**Message:** Referenced artifact was not completely inspected

**Remediation:** Review the reported expression and analyzer's parsing limitation; correct the scanner if it misinterprets valid source, then rerun the scan. Keep required references; incomplete analysis is not proof of malicious evasion.

**Evidence:**
- **reasons:** `[{'reason_code': 'static_parse_limit', 'message': "A security-relevant expression exceeded a bounded static parser's span limit.", 'phase': 'static', 'analyzers': ['static_patterns_tool_misuse']}]`
- **target_disposition:** `partial`
- **target_path:** `references/amqplib.md`

---

### 🟡 MEDIUM: RP1

**Location:** `SKILL.md:203`  
**Confidence:** 70%  

**Message:** MCP server referenced without pinned version: 'npx vitest'.

**Remediation:** Pin the version: npx @scope/server@1.2.3

---

### 🟡 MEDIUM: RP1

**Location:** `SKILL.md:206`  
**Confidence:** 70%  

**Message:** MCP server referenced without pinned version: 'npx vitest'.

**Remediation:** Pin the version: npx @scope/server@1.2.3

---

### 🟡 MEDIUM: RP1

**Location:** `SKILL.md:209`  
**Confidence:** 70%  

**Message:** MCP server referenced without pinned version: 'npx vitest'.

**Remediation:** Pin the version: npx @scope/server@1.2.3

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
| reference_missing | `SKILL.md:4-4` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:18-18` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:30-30` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:123-123` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:167-167` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:203-203` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:229-229` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:230-230` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:238-238` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:241-241` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| static_parse_limit | `references/amqplib.md` | A security-relevant expression exceeded a bounded static parser's span limit. |

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
| disabled_by_configuration | `meta_analyzer` | Analyzer was disabled by the requested configuration. |
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

# SkillSpector Security Report

**Skill:** maven-version-audit  
**Scanned:** 2026-10-07 03:46:26 UTC  

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 100/100 |
| Severity | CRITICAL |
| Recommendation | DO NOT INSTALL |

## Components (12)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `SKILL.md` | markdown | 146 | No |
| `evals/evals.json` | json | 49 | No |
| `evals/trigger.json` | json | 17 | No |
| `scripts/_va_paths.py` | python | 54 | Yes |
| `scripts/crosscheck.py` | python | 100 | Yes |
| `scripts/qa_doc.py` | python | 99 | Yes |
| `scripts/step1_coords.py` | python | 109 | Yes |
| `scripts/step2_download.py` | python | 157 | Yes |
| `scripts/step3_doc.py` | python | 697 | Yes |
| `scripts/verify_ordering.py` | python | 98 | Yes |
| `scripts/__pycache__/_va_paths.cpython-314.pyc` | other | 0 | Yes |
| `scripts/__pycache__/step3_doc.cpython-314.pyc` | other | 0 | Yes |

## Issues (14)

### 🔴 HIGH: AE1

**Location:** `SKILL.md:26`  
**Confidence:** 100%  

**Message:** Referenced artifact was not completely inspected

**Remediation:** Review the reported expression and analyzer's parsing limitation; correct the scanner if it misinterprets valid source, then rerun the scan. Keep required references; incomplete analysis is not proof of malicious evasion.

**Evidence:**
- **reasons:** `[{'reason_code': 'static_parse_limit', 'message': "A security-relevant expression exceeded a bounded static parser's span limit.", 'phase': 'static', 'analyzers': ['static_patterns_tool_misuse']}]`
- **target_disposition:** `partial`
- **target_path:** `scripts/step3_doc.py`

---

### 🔴 HIGH: AE1

**Location:** `SKILL.md:48`  
**Confidence:** 100%  

**Message:** Referenced artifact was not completely inspected

**Remediation:** Review the reported expression and analyzer's parsing limitation; correct the scanner if it misinterprets valid source, then rerun the scan. Keep required references; incomplete analysis is not proof of malicious evasion.

**Evidence:**
- **reasons:** `[{'reason_code': 'static_parse_limit', 'message': "A security-relevant expression exceeded a bounded static parser's span limit.", 'phase': 'static', 'analyzers': ['static_patterns_tool_misuse']}]`
- **target_disposition:** `partial`
- **target_path:** `scripts/step3_doc.py`

---

### 🔴 HIGH: AE1

**Location:** `SKILL.md:48`  
**Confidence:** 100%  

**Message:** Referenced artifact was not completely inspected

**Remediation:** Review the reported expression and analyzer's parsing limitation; correct the scanner if it misinterprets valid source, then rerun the scan. Keep required references; incomplete analysis is not proof of malicious evasion.

**Evidence:**
- **reasons:** `[{'reason_code': 'static_parse_limit', 'message': "A security-relevant expression exceeded a bounded static parser's span limit.", 'phase': 'static', 'analyzers': ['static_patterns_tool_misuse']}]`
- **target_disposition:** `partial`
- **target_path:** `scripts/step2_download.py`

---

### 🔴 HIGH: SC8

**Location:** `scripts/__pycache__/:1`  
**Confidence:** 95%  

**Message:** Skill ships a __pycache__ directory that normal discovery skips

**Remediation:** Do not ship __pycache__/ or .pyc/.pyo in skills. Delete bytecode before packaging; if presence is intentional for a lab fixture, quarantine it outside the skill install path.

---

### 🔴 HIGH: SC8

**Location:** `scripts/__pycache__/_va_paths.cpython-314.pyc:1`  
**Confidence:** 95%  

**Message:** Skill ships Python bytecode (.pyc/.pyo) that normal analysis skips

**Remediation:** Do not ship __pycache__/ or .pyc/.pyo in skills. Delete bytecode before packaging; if presence is intentional for a lab fixture, quarantine it outside the skill install path.

---

### 🔴 HIGH: SC9

**Location:** `scripts/__pycache__/_va_paths.cpython-314.pyc:1`  
**Confidence:** 100%  

**Message:** Executable content is excluded from analysis.

**Remediation:** Review the artifact provenance and the reason executable content is packaged in this location; keep executable files explicit and directly reviewable.

**Evidence:**
- **concealment:** `excluded_directory`
- **concealment_reasons:** `['excluded_directory']`
- **container_ancestry:** `['filesystem']`
- **container_depth:** `0`
- **container_type:** `filesystem`
- **excluded_from_analysis:** `True`
- **excluded_inspection_incomplete:** `False`
- **inherited_exclusion_reason:** `excluded_directory`
- **inspection_limitation_reason:** `None`
- **local_only:** `True`
- **nested_path:** `scripts/__pycache__/_va_paths.cpython-314.pyc`
- **outer_path:** `scripts/__pycache__/_va_paths.cpython-314.pyc`
- **referenced:** `False`

---

### 🔴 HIGH: SC8

**Location:** `scripts/__pycache__/step3_doc.cpython-314.pyc:1`  
**Confidence:** 95%  

**Message:** Skill ships Python bytecode (.pyc/.pyo) that normal analysis skips

**Remediation:** Do not ship __pycache__/ or .pyc/.pyo in skills. Delete bytecode before packaging; if presence is intentional for a lab fixture, quarantine it outside the skill install path.

---

### 🔴 HIGH: SC9

**Location:** `scripts/__pycache__/step3_doc.cpython-314.pyc:1`  
**Confidence:** 100%  

**Message:** Executable content is excluded from analysis.

**Remediation:** Review the artifact provenance and the reason executable content is packaged in this location; keep executable files explicit and directly reviewable.

**Evidence:**
- **concealment:** `excluded_directory`
- **concealment_reasons:** `['excluded_directory']`
- **container_ancestry:** `['filesystem']`
- **container_depth:** `0`
- **container_type:** `filesystem`
- **excluded_from_analysis:** `True`
- **excluded_inspection_incomplete:** `False`
- **inherited_exclusion_reason:** `excluded_directory`
- **inspection_limitation_reason:** `None`
- **local_only:** `True`
- **nested_path:** `scripts/__pycache__/step3_doc.cpython-314.pyc`
- **outer_path:** `scripts/__pycache__/step3_doc.cpython-314.pyc`
- **referenced:** `False`

---

### 🟡 MEDIUM: LP3

**Location:** `SKILL.md:1`  
**Confidence:** 70%  

**Message:** The skill invokes shell commands (python3 scripts, Maven CLI), reads arbitrary files (POMs, maven-metadata.xml, log files under ~/.m2 and project trees), writes files (audit documents, scratch TSVs/logs), and reads/writes environment variables (VERSION_AUDIT_ROOT, VERSION_AUDIT_TMP, VERSION_AUDIT_DOC, MVN). Without a declared tool scope or 'allowed-tools' restriction, the executing agent has unrestricted shell and file I/O for the duration of the skill. A crafted POM or adversarial Maven coordinate could exploit the unbounded file_read (e.g., path traversal via VERSION_AUDIT_TMP override) or shell (e.g., injection through MVN variable if it falls back to PATH lookup without sanitisation). The breadth of scope is disproportionate to the task: a legitimate version-audit tool only needs to read POMs and write to a known scratch directory, not arbitrary file access.

**Remediation:** 1. Add an explicit `allowed-tools` or `permissions` block in the skill metadata restricting tool access to only what is necessary: file_read scoped to pom.xml/maven-metadata.xml/log patterns, file_write scoped to target/version-audit/ and docs/, and shell scoped to python3 and mvn/mvnw invocations only. 2. Validate and sandbox VERSION_AUDIT_TMP and VERSION_AUDIT_DOC paths to prevent path traversal (reject paths containing '..' or absolute paths outside the project root). 3. Sanitise the MVN variable to only allow known command names (mvn, mvn, ./mvnw) and reject values containing shell metacharacters. 4. Consider running the pipeline in a containerized or sandboxed subprocess with read-only filesystem mounts except for the designated scratch directory.

---

### 🟡 MEDIUM: TR3

**Location:** `SKILL.md:1`  
**Confidence:** 80%  

**Message:** Keyword Baiting Trigger: description clause 'Use this skill whenever the user wants the current/latest version of anything Maven in this repo, or wants to know which Maven build plugins, dependencies, version properties, BOM imports, parents,' is designed to match all or most user inputs

**Remediation:** Use descriptive triggers that clearly indicate the skill's purpose rather than generic keywords designed to maximize activation.

---

### 🟡 MEDIUM: RA2

**Location:** `evals/evals.json:24`  
**Confidence:** 60%  

**Message:** Session Persistence

**Remediation:** Remove any persistence mechanisms (cron jobs, startup scripts, state files). Skills should not maintain state across sessions without explicit user consent.

---

### 🟡 MEDIUM: AST4

**Location:** `scripts/step2_download.py:31–34`  
**Confidence:** 70%  

**Message:** subprocess module call

**Remediation:** Use subprocess.run() with shell=False and an explicit argument list. Validate all inputs and avoid passing user-controlled data to commands.

---

### 🟡 MEDIUM: AST4

**Location:** `scripts/step3_doc.py:110–113`  
**Confidence:** 70%  

**Message:** subprocess module call

**Remediation:** Use subprocess.run() with shell=False and an explicit argument list. Validate all inputs and avoid passing user-controlled data to commands.

---

### 🟢 LOW: SDI-4

**Location:** `scripts/verify_ordering.py:3–82`  
**Confidence:** 55%  

**Message:** Docstring claims independent verification that avoids step3's comparator assumptions, but the latest_any checks delegate to step3's own comparator (S.highest)

**Remediation:** Either implement an independent comparator for the latest_any/maximality checks (e.g. reuse naive_max_plain plus an explicit qualifier-aware ordering rule that does not call into step3_doc), or amend the docstring to state that only the plain-version column is independently re-derived while latest_any maximality is cross-checked with step3_doc.highest, so its results are not an independent oracle.

---

## Inspection Completeness

| Metric | Value |
|--------|-------|
| Execution | successful |
| Status | partial |
| Coverage | 80.0% |
| Fully inspected | 8 |
| Partially inspected | 2 |
| Entirely uninspected | 0 |

### Scope Exclusions

| Reason / Status | Location | Details |
|-----------------|----------|---------|
| excluded_directory | `scripts/__pycache__/` | Directory tree is excluded from the configured scan scope. |
| excluded_directory | `scripts/__pycache__/_va_paths.cpython-314.pyc` | Directory tree is excluded from the configured scan scope. |
| excluded_directory | `scripts/__pycache__/step3_doc.cpython-314.pyc` | Directory tree is excluded from the configured scan scope. |

### Ledger Exceptions

| Reason / Status | Location | Details |
|-----------------|----------|---------|
| reference_missing | `SKILL.md:15-15` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:37-37` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:40-40` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:60-60` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:63-63` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:64-64` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:67-67` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:70-70` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:73-73` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:77-77` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:80-80` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:83-83` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:95-95` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:96-96` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:97-97` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:100-100` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:101-101` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:118-118` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:119-119` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:120-120` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| excluded_executable_content | `scripts/__pycache__/_va_paths.cpython-314.pyc` | Executable content was inventoried but excluded from content analysis. |
| excluded_executable_content | `scripts/__pycache__/step3_doc.cpython-314.pyc` | Executable content was inventoried but excluded from content analysis. |
| static_parse_limit | `scripts/step2_download.py` | A security-relevant expression exceeded a bounded static parser's span limit. |
| static_parse_limit | `scripts/step3_doc.py` | A security-relevant expression exceeded a bounded static parser's span limit. |

### Analyzer Statuses

| Reason / Status | Location | Details |
|-----------------|----------|---------|
| completed | `artifact_integrity` |  |
| completed | `behavioral_ast` |  |
| completed | `behavioral_taint_tracking` |  |
| no_applicable_files | `bundled_execution_surface` | No files matched this analyzer's applicability contract. |
| completed | `mcp_least_privilege` |  |
| completed | `mcp_rug_pull` |  |
| completed | `mcp_tool_poisoning` |  |
| completed | `meta_analyzer` |  |
| completed | `reference_coverage` |  |
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

- **Executable Scripts:** Yes

*Generated by SkillSpector v2.12.0*

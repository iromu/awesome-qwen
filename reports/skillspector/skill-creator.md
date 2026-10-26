# SkillSpector Security Report

**Skill:** skill-creator  
**Scanned:** 2026-10-26 18:14:15 UTC  

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 100/100 |
| Severity | CRITICAL |
| Recommendation | DO NOT INSTALL |

## Components (35)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `SKILL.md` | markdown | 290 | No |
| `agents/analyzer.md` | markdown | 274 | No |
| `agents/comparator.md` | markdown | 202 | No |
| `agents/grader.md` | markdown | 223 | No |
| `assets/eval_review.html` | other | 146 | No |
| `eval-viewer/generate_review.py` | python | 471 | Yes |
| `eval-viewer/viewer.html` | other | 1325 | No |
| `references/description-optimization.md` | markdown | 84 | No |
| `references/eval-harness.md` | markdown | 70 | No |
| `references/harness-notes.md` | markdown | 36 | No |
| `references/schemas.md` | markdown | 430 | No |
| `scripts/__init__.py` | python | 0 | Yes |
| `scripts/aggregate_benchmark.py` | python | 406 | Yes |
| `scripts/auto_grader.py` | python | 499 | Yes |
| `scripts/generate_report.py` | python | 326 | Yes |
| `scripts/improve_description.py` | python | 251 | Yes |
| `scripts/package_skill.py` | python | 143 | Yes |
| `scripts/quick_validate.py` | python | 103 | Yes |
| `scripts/run_eval.py` | python | 355 | Yes |
| `scripts/run_loop.py` | python | 367 | Yes |
| `scripts/run_test.py` | python | 411 | Yes |
| `scripts/utils.py` | python | 47 | Yes |
| `skill-card.md` | markdown | 66 | No |
| `eval-viewer/__pycache__/generate_review.cpython-314.pyc` | other | 0 | Yes |
| `scripts/__pycache__/__init__.cpython-314.pyc` | other | 0 | Yes |
| `scripts/__pycache__/aggregate_benchmark.cpython-314.pyc` | other | 0 | Yes |
| `scripts/__pycache__/auto_grader.cpython-314.pyc` | other | 0 | Yes |
| `scripts/__pycache__/generate_report.cpython-314.pyc` | other | 0 | Yes |
| `scripts/__pycache__/improve_description.cpython-314.pyc` | other | 0 | Yes |
| `scripts/__pycache__/package_skill.cpython-314.pyc` | other | 0 | Yes |
| `scripts/__pycache__/quick_validate.cpython-314.pyc` | other | 0 | Yes |
| `scripts/__pycache__/run_eval.cpython-314.pyc` | other | 0 | Yes |
| `scripts/__pycache__/run_loop.cpython-314.pyc` | other | 0 | Yes |
| `scripts/__pycache__/run_test.cpython-314.pyc` | other | 0 | Yes |
| `scripts/__pycache__/utils.cpython-314.pyc` | other | 0 | Yes |

## Issues (38)

### 🔴 HIGH: RA1

**Location:** `SKILL.md:34`  
**Confidence:** 85%  

**Message:** Self-Modification

**Remediation:** Prevent the skill from modifying its own code, SKILL.md, or configuration files. Treat skill files as read-only at runtime.

---

### 🔴 HIGH: AE1

**Location:** `SKILL.md:258`  
**Confidence:** 100%  

**Message:** Referenced artifact was not completely inspected

**Remediation:** Review the reported expression and analyzer's parsing limitation; correct the scanner if it misinterprets valid source, then rerun the scan. Keep required references; incomplete analysis is not proof of malicious evasion.

**Evidence:**
- **reasons:** `[{'reason_code': 'static_parse_limit', 'message': "A security-relevant expression exceeded a bounded static parser's span limit.", 'phase': 'static', 'analyzers': ['static_patterns_tool_misuse']}]`
- **target_disposition:** `partial`
- **target_path:** `assets/eval_review.html`

---

### 🔴 HIGH: SC8

**Location:** `eval-viewer/__pycache__/:1`  
**Confidence:** 95%  

**Message:** Skill ships a __pycache__ directory that normal discovery skips

**Remediation:** Do not ship __pycache__/ or .pyc/.pyo in skills. Delete bytecode before packaging; if presence is intentional for a lab fixture, quarantine it outside the skill install path.

---

### 🔴 HIGH: SC8

**Location:** `eval-viewer/__pycache__/generate_review.cpython-314.pyc:1`  
**Confidence:** 95%  

**Message:** Skill ships Python bytecode (.pyc/.pyo) that normal analysis skips

**Remediation:** Do not ship __pycache__/ or .pyc/.pyo in skills. Delete bytecode before packaging; if presence is intentional for a lab fixture, quarantine it outside the skill install path.

---

### 🔴 HIGH: SC9

**Location:** `eval-viewer/__pycache__/generate_review.cpython-314.pyc:1`  
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
- **nested_path:** `eval-viewer/__pycache__/generate_review.cpython-314.pyc`
- **outer_path:** `eval-viewer/__pycache__/generate_review.cpython-314.pyc`
- **referenced:** `False`

---

### 🔴 HIGH: SC8

**Location:** `scripts/__pycache__/:1`  
**Confidence:** 95%  

**Message:** Skill ships a __pycache__ directory that normal discovery skips

**Remediation:** Do not ship __pycache__/ or .pyc/.pyo in skills. Delete bytecode before packaging; if presence is intentional for a lab fixture, quarantine it outside the skill install path.

---

### 🔴 HIGH: SC8

**Location:** `scripts/__pycache__/__init__.cpython-314.pyc:1`  
**Confidence:** 95%  

**Message:** Skill ships Python bytecode (.pyc/.pyo) that normal analysis skips

**Remediation:** Do not ship __pycache__/ or .pyc/.pyo in skills. Delete bytecode before packaging; if presence is intentional for a lab fixture, quarantine it outside the skill install path.

---

### 🔴 HIGH: SC9

**Location:** `scripts/__pycache__/__init__.cpython-314.pyc:1`  
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
- **nested_path:** `scripts/__pycache__/__init__.cpython-314.pyc`
- **outer_path:** `scripts/__pycache__/__init__.cpython-314.pyc`
- **referenced:** `False`

---

### 🔴 HIGH: SC8

**Location:** `scripts/__pycache__/aggregate_benchmark.cpython-314.pyc:1`  
**Confidence:** 95%  

**Message:** Skill ships Python bytecode (.pyc/.pyo) that normal analysis skips

**Remediation:** Do not ship __pycache__/ or .pyc/.pyo in skills. Delete bytecode before packaging; if presence is intentional for a lab fixture, quarantine it outside the skill install path.

---

### 🔴 HIGH: SC9

**Location:** `scripts/__pycache__/aggregate_benchmark.cpython-314.pyc:1`  
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
- **nested_path:** `scripts/__pycache__/aggregate_benchmark.cpython-314.pyc`
- **outer_path:** `scripts/__pycache__/aggregate_benchmark.cpython-314.pyc`
- **referenced:** `False`

---

### 🔴 HIGH: SC8

**Location:** `scripts/__pycache__/auto_grader.cpython-314.pyc:1`  
**Confidence:** 95%  

**Message:** Skill ships Python bytecode (.pyc/.pyo) that normal analysis skips

**Remediation:** Do not ship __pycache__/ or .pyc/.pyo in skills. Delete bytecode before packaging; if presence is intentional for a lab fixture, quarantine it outside the skill install path.

---

### 🔴 HIGH: SC9

**Location:** `scripts/__pycache__/auto_grader.cpython-314.pyc:1`  
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
- **nested_path:** `scripts/__pycache__/auto_grader.cpython-314.pyc`
- **outer_path:** `scripts/__pycache__/auto_grader.cpython-314.pyc`
- **referenced:** `False`

---

### 🔴 HIGH: SC8

**Location:** `scripts/__pycache__/generate_report.cpython-314.pyc:1`  
**Confidence:** 95%  

**Message:** Skill ships Python bytecode (.pyc/.pyo) that normal analysis skips

**Remediation:** Do not ship __pycache__/ or .pyc/.pyo in skills. Delete bytecode before packaging; if presence is intentional for a lab fixture, quarantine it outside the skill install path.

---

### 🔴 HIGH: SC9

**Location:** `scripts/__pycache__/generate_report.cpython-314.pyc:1`  
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
- **nested_path:** `scripts/__pycache__/generate_report.cpython-314.pyc`
- **outer_path:** `scripts/__pycache__/generate_report.cpython-314.pyc`
- **referenced:** `False`

---

### 🔴 HIGH: SC8

**Location:** `scripts/__pycache__/improve_description.cpython-314.pyc:1`  
**Confidence:** 95%  

**Message:** Skill ships Python bytecode (.pyc/.pyo) that normal analysis skips

**Remediation:** Do not ship __pycache__/ or .pyc/.pyo in skills. Delete bytecode before packaging; if presence is intentional for a lab fixture, quarantine it outside the skill install path.

---

### 🔴 HIGH: SC9

**Location:** `scripts/__pycache__/improve_description.cpython-314.pyc:1`  
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
- **nested_path:** `scripts/__pycache__/improve_description.cpython-314.pyc`
- **outer_path:** `scripts/__pycache__/improve_description.cpython-314.pyc`
- **referenced:** `False`

---

### 🔴 HIGH: SC8

**Location:** `scripts/__pycache__/package_skill.cpython-314.pyc:1`  
**Confidence:** 95%  

**Message:** Skill ships Python bytecode (.pyc/.pyo) that normal analysis skips

**Remediation:** Do not ship __pycache__/ or .pyc/.pyo in skills. Delete bytecode before packaging; if presence is intentional for a lab fixture, quarantine it outside the skill install path.

---

### 🔴 HIGH: SC9

**Location:** `scripts/__pycache__/package_skill.cpython-314.pyc:1`  
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
- **nested_path:** `scripts/__pycache__/package_skill.cpython-314.pyc`
- **outer_path:** `scripts/__pycache__/package_skill.cpython-314.pyc`
- **referenced:** `False`

---

### 🔴 HIGH: SC8

**Location:** `scripts/__pycache__/quick_validate.cpython-314.pyc:1`  
**Confidence:** 95%  

**Message:** Skill ships Python bytecode (.pyc/.pyo) that normal analysis skips

**Remediation:** Do not ship __pycache__/ or .pyc/.pyo in skills. Delete bytecode before packaging; if presence is intentional for a lab fixture, quarantine it outside the skill install path.

---

### 🔴 HIGH: SC9

**Location:** `scripts/__pycache__/quick_validate.cpython-314.pyc:1`  
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
- **nested_path:** `scripts/__pycache__/quick_validate.cpython-314.pyc`
- **outer_path:** `scripts/__pycache__/quick_validate.cpython-314.pyc`
- **referenced:** `False`

---

### 🔴 HIGH: SC8

**Location:** `scripts/__pycache__/run_eval.cpython-314.pyc:1`  
**Confidence:** 95%  

**Message:** Skill ships Python bytecode (.pyc/.pyo) that normal analysis skips

**Remediation:** Do not ship __pycache__/ or .pyc/.pyo in skills. Delete bytecode before packaging; if presence is intentional for a lab fixture, quarantine it outside the skill install path.

---

### 🔴 HIGH: SC9

**Location:** `scripts/__pycache__/run_eval.cpython-314.pyc:1`  
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
- **nested_path:** `scripts/__pycache__/run_eval.cpython-314.pyc`
- **outer_path:** `scripts/__pycache__/run_eval.cpython-314.pyc`
- **referenced:** `False`

---

### 🔴 HIGH: SC8

**Location:** `scripts/__pycache__/run_loop.cpython-314.pyc:1`  
**Confidence:** 95%  

**Message:** Skill ships Python bytecode (.pyc/.pyo) that normal analysis skips

**Remediation:** Do not ship __pycache__/ or .pyc/.pyo in skills. Delete bytecode before packaging; if presence is intentional for a lab fixture, quarantine it outside the skill install path.

---

### 🔴 HIGH: SC9

**Location:** `scripts/__pycache__/run_loop.cpython-314.pyc:1`  
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
- **nested_path:** `scripts/__pycache__/run_loop.cpython-314.pyc`
- **outer_path:** `scripts/__pycache__/run_loop.cpython-314.pyc`
- **referenced:** `False`

---

### 🔴 HIGH: SC8

**Location:** `scripts/__pycache__/run_test.cpython-314.pyc:1`  
**Confidence:** 95%  

**Message:** Skill ships Python bytecode (.pyc/.pyo) that normal analysis skips

**Remediation:** Do not ship __pycache__/ or .pyc/.pyo in skills. Delete bytecode before packaging; if presence is intentional for a lab fixture, quarantine it outside the skill install path.

---

### 🔴 HIGH: SC9

**Location:** `scripts/__pycache__/run_test.cpython-314.pyc:1`  
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
- **nested_path:** `scripts/__pycache__/run_test.cpython-314.pyc`
- **outer_path:** `scripts/__pycache__/run_test.cpython-314.pyc`
- **referenced:** `False`

---

### 🔴 HIGH: SC8

**Location:** `scripts/__pycache__/utils.cpython-314.pyc:1`  
**Confidence:** 95%  

**Message:** Skill ships Python bytecode (.pyc/.pyo) that normal analysis skips

**Remediation:** Do not ship __pycache__/ or .pyc/.pyo in skills. Delete bytecode before packaging; if presence is intentional for a lab fixture, quarantine it outside the skill install path.

---

### 🔴 HIGH: SC9

**Location:** `scripts/__pycache__/utils.cpython-314.pyc:1`  
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
- **nested_path:** `scripts/__pycache__/utils.cpython-314.pyc`
- **outer_path:** `scripts/__pycache__/utils.cpython-314.pyc`
- **referenced:** `False`

---

### 🔴 HIGH: E2

**Location:** `scripts/auto_grader.py:33`  
**Confidence:** 70%  

**Message:** Env Variable Harvesting

**Remediation:** Read only explicitly required environment variables by name. Avoid enumerating or copying the full environment, and never log or transmit credentials to untrusted destinations.

---

### 🔴 HIGH: E2

**Location:** `scripts/improve_description.py:34`  
**Confidence:** 70%  

**Message:** Env Variable Harvesting

**Remediation:** Read only explicitly required environment variables by name. Avoid enumerating or copying the full environment, and never log or transmit credentials to untrusted destinations.

---

### 🔴 HIGH: E2

**Location:** `scripts/run_eval.py:110`  
**Confidence:** 70%  

**Message:** Env Variable Harvesting

**Remediation:** Read only explicitly required environment variables by name. Avoid enumerating or copying the full environment, and never log or transmit credentials to untrusted destinations.

---

### 🔴 HIGH: E2

**Location:** `scripts/run_test.py:88`  
**Confidence:** 70%  

**Message:** Env Variable Harvesting

**Remediation:** Read only explicitly required environment variables by name. Avoid enumerating or copying the full environment, and never log or transmit credentials to untrusted destinations.

---

### 🟡 MEDIUM: LP3

**Location:** `SKILL.md:1`  
**Confidence:** 70%  

**Message:** Skill declares no tool scope ('permissions' or 'allowed-tools') but code capabilities were detected: env, file_read, file_write, shell.

**Remediation:** Declare the skill's tool scope: for Claude Code / Agent Skills SKILL.md, list the tools the skill may invoke in the 'allowed-tools' frontmatter field; for MCP server manifests, add a 'permissions' list naming the required capabilities.

---

### 🟡 MEDIUM: AST4

**Location:** `eval-viewer/generate_review.py:291–294`  
**Confidence:** 70%  

**Message:** subprocess module call

**Remediation:** Use subprocess.run() with shell=False and an explicit argument list. Validate all inputs and avoid passing user-controlled data to commands.

---

### 🟡 MEDIUM: AST4

**Location:** `scripts/auto_grader.py:35–42`  
**Confidence:** 70%  

**Message:** subprocess module call

**Remediation:** Use subprocess.run() with shell=False and an explicit argument list. Validate all inputs and avoid passing user-controlled data to commands.

---

### 🟡 MEDIUM: AST4

**Location:** `scripts/improve_description.py:36–43`  
**Confidence:** 70%  

**Message:** subprocess module call

**Remediation:** Use subprocess.run() with shell=False and an explicit argument list. Validate all inputs and avoid passing user-controlled data to commands.

---

### 🟡 MEDIUM: AST4

**Location:** `scripts/run_eval.py:112–118`  
**Confidence:** 70%  

**Message:** subprocess module call

**Remediation:** Use subprocess.run() with shell=False and an explicit argument list. Validate all inputs and avoid passing user-controlled data to commands.

---

### 🟡 MEDIUM: AST4

**Location:** `scripts/run_test.py:90–97`  
**Confidence:** 70%  

**Message:** subprocess module call

**Remediation:** Use subprocess.run() with shell=False and an explicit argument list. Validate all inputs and avoid passing user-controlled data to commands.

---

## Inspection Completeness

| Metric | Value |
|--------|-------|
| Execution | successful |
| Status | partial |
| Coverage | 82.6% |
| Fully inspected | 19 |
| Partially inspected | 4 |
| Entirely uninspected | 0 |

### Scope Exclusions

| Reason / Status | Location | Details |
|-----------------|----------|---------|
| excluded_directory | `eval-viewer/__pycache__/` | Directory tree is excluded from the configured scan scope. |
| excluded_directory | `eval-viewer/__pycache__/generate_review.cpython-314.pyc` | Directory tree is excluded from the configured scan scope. |
| excluded_directory | `scripts/__pycache__/` | Directory tree is excluded from the configured scan scope. |
| excluded_directory | `scripts/__pycache__/__init__.cpython-314.pyc` | Directory tree is excluded from the configured scan scope. |
| excluded_directory | `scripts/__pycache__/aggregate_benchmark.cpython-314.pyc` | Directory tree is excluded from the configured scan scope. |
| excluded_directory | `scripts/__pycache__/auto_grader.cpython-314.pyc` | Directory tree is excluded from the configured scan scope. |
| excluded_directory | `scripts/__pycache__/generate_report.cpython-314.pyc` | Directory tree is excluded from the configured scan scope. |
| excluded_directory | `scripts/__pycache__/improve_description.cpython-314.pyc` | Directory tree is excluded from the configured scan scope. |
| excluded_directory | `scripts/__pycache__/package_skill.cpython-314.pyc` | Directory tree is excluded from the configured scan scope. |
| excluded_directory | `scripts/__pycache__/quick_validate.cpython-314.pyc` | Directory tree is excluded from the configured scan scope. |
| excluded_directory | `scripts/__pycache__/run_eval.cpython-314.pyc` | Directory tree is excluded from the configured scan scope. |
| excluded_directory | `scripts/__pycache__/run_loop.cpython-314.pyc` | Directory tree is excluded from the configured scan scope. |
| excluded_directory | `scripts/__pycache__/run_test.cpython-314.pyc` | Directory tree is excluded from the configured scan scope. |
| excluded_directory | `scripts/__pycache__/utils.cpython-314.pyc` | Directory tree is excluded from the configured scan scope. |

### Ledger Exceptions

| Reason / Status | Location | Details |
|-----------------|----------|---------|
| reference_missing | `SKILL.md:17-17` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:180-180` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:200-200` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:208-208` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| static_parse_limit | `assets/eval_review.html` | A security-relevant expression exceeded a bounded static parser's span limit. |
| excluded_executable_content | `eval-viewer/__pycache__/generate_review.cpython-314.pyc` | Executable content was inventoried but excluded from content analysis. |
| static_parse_limit | `eval-viewer/viewer.html` | A security-relevant expression exceeded a bounded static parser's span limit. |
| excluded_executable_content | `scripts/__pycache__/__init__.cpython-314.pyc` | Executable content was inventoried but excluded from content analysis. |
| excluded_executable_content | `scripts/__pycache__/aggregate_benchmark.cpython-314.pyc` | Executable content was inventoried but excluded from content analysis. |
| excluded_executable_content | `scripts/__pycache__/auto_grader.cpython-314.pyc` | Executable content was inventoried but excluded from content analysis. |
| excluded_executable_content | `scripts/__pycache__/generate_report.cpython-314.pyc` | Executable content was inventoried but excluded from content analysis. |
| excluded_executable_content | `scripts/__pycache__/improve_description.cpython-314.pyc` | Executable content was inventoried but excluded from content analysis. |
| excluded_executable_content | `scripts/__pycache__/package_skill.cpython-314.pyc` | Executable content was inventoried but excluded from content analysis. |
| excluded_executable_content | `scripts/__pycache__/quick_validate.cpython-314.pyc` | Executable content was inventoried but excluded from content analysis. |
| excluded_executable_content | `scripts/__pycache__/run_eval.cpython-314.pyc` | Executable content was inventoried but excluded from content analysis. |
| excluded_executable_content | `scripts/__pycache__/run_loop.cpython-314.pyc` | Executable content was inventoried but excluded from content analysis. |
| excluded_executable_content | `scripts/__pycache__/run_test.cpython-314.pyc` | Executable content was inventoried but excluded from content analysis. |
| excluded_executable_content | `scripts/__pycache__/utils.cpython-314.pyc` | Executable content was inventoried but excluded from content analysis. |
| static_parse_limit | `scripts/auto_grader.py` | A security-relevant expression exceeded a bounded static parser's span limit. |
| static_parse_limit | `scripts/run_eval.py` | A security-relevant expression exceeded a bounded static parser's span limit. |

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

- **Executable Scripts:** Yes

*Generated by SkillSpector v2.12.0*

<!-- scan_skills.sh: static report (NO_LLM=1) -->

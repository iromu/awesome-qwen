# SkillSpector Security Report

**Skill:** skill-creator  
**Scanned:** 2026-10-08 05:19:32 UTC  

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 100/100 |
| Severity | CRITICAL |
| Recommendation | DO NOT INSTALL |

## Components (31)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `SKILL.md` | markdown | 477 | No |
| `agents/analyzer.md` | markdown | 274 | No |
| `agents/comparator.md` | markdown | 202 | No |
| `agents/grader.md` | markdown | 223 | No |
| `assets/eval_review.html` | other | 146 | No |
| `eval-viewer/generate_review.py` | python | 471 | Yes |
| `eval-viewer/viewer.html` | other | 1325 | No |
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

## Issues (54)

### 🔴 HIGH: RA1

**Location:** `SKILL.md:34`  
**Confidence:** 85%  

**Message:** Self-Modification

**Remediation:** Prevent the skill from modifying its own code, SKILL.md, or configuration files. Treat skill files as read-only at runtime.

---

### 🔴 HIGH: AE1

**Location:** `SKILL.md:239`  
**Confidence:** 100%  

**Message:** Referenced artifact was not completely inspected

**Remediation:** Review the reported expression and analyzer's parsing limitation; correct the scanner if it misinterprets valid source, then rerun the scan. Keep required references; incomplete analysis is not proof of malicious evasion.

**Evidence:**
- **reasons:** `[{'reason_code': 'static_parse_limit', 'message': "A security-relevant expression exceeded a bounded static parser's span limit.", 'phase': 'static', 'analyzers': ['static_patterns_tool_misuse']}]`
- **target_disposition:** `partial`
- **target_path:** `scripts/auto_grader.py`

---

### 🔴 HIGH: AE1

**Location:** `SKILL.md:356`  
**Confidence:** 100%  

**Message:** Referenced artifact was not completely inspected

**Remediation:** Review the reported expression and analyzer's parsing limitation; correct the scanner if it misinterprets valid source, then rerun the scan. Keep required references; incomplete analysis is not proof of malicious evasion.

**Evidence:**
- **reasons:** `[{'reason_code': 'static_parse_limit', 'message': "A security-relevant expression exceeded a bounded static parser's span limit.", 'phase': 'static', 'analyzers': ['static_patterns_tool_misuse']}]`
- **target_disposition:** `partial`
- **target_path:** `assets/eval_review.html`

---

### 🔴 HIGH: AE1

**Location:** `SKILL.md:446`  
**Confidence:** 100%  

**Message:** Referenced artifact was not completely inspected

**Remediation:** Review the reported expression and analyzer's parsing limitation; correct the scanner if it misinterprets valid source, then rerun the scan. Keep required references; incomplete analysis is not proof of malicious evasion.

**Evidence:**
- **reasons:** `[{'reason_code': 'static_parse_limit', 'message': "A security-relevant expression exceeded a bounded static parser's span limit.", 'phase': 'static', 'analyzers': ['static_patterns_tool_misuse']}]`
- **target_disposition:** `partial`
- **target_path:** `scripts/run_eval.py`

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

### 🔴 HIGH: SQP-2

**Location:** `eval-viewer/generate_review.py:288–306`  
**Confidence:** 70%  

**Message:** This is the same defect as the SDI-2 port-clearing finding: indiscriminate SIGTERM to every PID found on the port, silently and without confirmation. It is a genuine availability hazard — an unrelated process on the default port 3117 or a user-chosen port can be killed without the user ever learning it happened — but the intent is tooling convenience, not malice.

**Remediation:** Identify the target process before killing (verify it is a stale instance of this viewer), print what is being terminated, and gate the kill behind an explicit flag; otherwise let the server pick a free port instead of evicting whoever owns the requested one.

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

**Location:** `scripts/run_test.py:88`  
**Confidence:** 70%  

**Message:** Env Variable Harvesting

**Remediation:** Read only explicitly required environment variables by name. Avoid enumerating or copying the full environment, and never log or transmit credentials to untrusted destinations.

---

### 🔴 HIGH: SQP-2

**Location:** `scripts/run_eval.py:94–118`  
**Confidence:** 78%  

**Message:** Running an AI agent subprocess in --yolo (auto-approve) mode with 20 tool calls, cwd=project_root, and stderr discarded (DEVNULL) means: (1) the agent can write/modify/delete files in the project without any confirmation, (2) any errors or suspicious tool-call attempts are silently swallowed (stderr=DEVNULL), making detection impossible, and (3) there is no logging of what tools the subprocess actually executed. This is a defense-in-depth failure: even if the agent is compromised via prompt injection from adversarial eval queries, no human or monitoring system would observe the resulting actions.

**Remediation:** Review the flagged content for security risks. Ensure no credentials, secrets, or sensitive data are exposed.

---

### 🔴 HIGH: E2

**Location:** `scripts/run_eval.py:110`  
**Confidence:** 70%  

**Message:** os.environ.items() copies the entire parent process environment into the subprocess. In typical developer/CI environments, os.environ contains sensitive secrets: API keys (ANTHROPIC_API_KEY, OPENAI_API_KEY, AWS_SECRET_ACCESS_KEY), database connection strings, SSH agent sockets, and cloud provider tokens. Because the subprocess runs with --yolo and --max-tool-calls 20, a compromised or prompt-injected agent could read these environment variables and exfiltrate them (e.g., via a write_file tool call to a network-accessible path, or by encoding secrets in a response). The env dict is passed directly to Popen with no allowlist filtering.

**Remediation:** Read only explicitly required environment variables by name. Avoid enumerating or copying the full environment, and never log or transmit credentials to untrusted destinations.

---

### 🟡 MEDIUM: LP3

**Location:** `SKILL.md:1`  
**Confidence:** 70%  

**Message:** The skill has no `permissions`/`allowed-tools` frontmatter yet its instructions direct the agent to run shell commands (python -m scripts.run_loop, qwen -p subprocesses), write files to /tmp and the filesystem, and read arbitrary project files. Because the skill is designed to trigger on very broad conditions (any workflow automation, prompt template, etc.), an under-triggered/over-triggered activation can silently carry shell and file-write capability into unrelated sessions. This is a least-privilege/hygiene gap rather than malicious design — the script execution is the skill's legitimate purpose — but the absence of an explicit tool scope means there is no ceiling on what an activated instance can do.

**Remediation:** Declare the skill's tool scope: for Claude Code / Agent Skills SKILL.md, list the tools the skill may invoke in the 'allowed-tools' frontmatter field; for MCP server manifests, add a 'permissions' list naming the required capabilities.

---

### 🟡 MEDIUM: SQP-1

**Location:** `SKILL.md:3`  
**Confidence:** 70%  

**Message:** Overly broad, vague trigger description in frontmatter

**Remediation:** Narrow the trigger to explicit skill-authoring contexts (e.g. "create/write/evaluate a SKILL.md or skill package") and add exclusion examples, e.g. "Do NOT use for one-off scripts, general code refactoring, or prompt tweaks that do not produce a reusable skill file."

---

### 🟡 MEDIUM: SQP-2

**Location:** `SKILL.md:208`  
**Confidence:** 60%  

**Message:** The eval loop executes bundled Python scripts (run_test.py, auto_grader.py) and spawns `qwen -p` subprocesses that inherit the current session's authentication/credentials, with no requirement to disclose this to the user or to scope/review what data crosses that boundary. Eval prompts and attached files may contain sensitive project data that gets shipped to subprocess LLM calls, and the bundled scripts themselves are executed without any review gate — a compromised or tampered skill package shipping modified scripts would gain unattended credentialed code execution. The design intent is legitimate test automation, but the missing consent/disclosure and script-review controls are real gaps.

**Remediation:** Review the flagged content for security risks. Ensure no credentials, secrets, or sensitive data are exposed.

---

### 🟡 MEDIUM: SDI-2

**Location:** `eval-viewer/generate_review.py:288–306`  
**Confidence:** 70%  

**Message:** _kill_port sends SIGTERM to EVERY process listening on the target port (default 3117, or any --port the user picks) with no verification that the process is a previous viewer instance, no confirmation prompt, and no logging of what was killed. If the chosen port is occupied by an unrelated user process (a dev server, database client, tunnel, or editor service), the tool silently terminates it. Since the port is user-controllable and lsof output is parsed blindly, this is a blunt arbitrary-process-kill primitive; combined with the unauthenticated HTTP server below, a remote attacker who can induce a re-run on a chosen port could use it as a local DoS/persistence-disruption primitive.

**Remediation:** Before killing, verify the PID's executable/cmdline actually matches a prior generate_review.py instance (e.g., check /proc/<pid>/cmdline or ps). Log every PID that is terminated and require user confirmation or an explicit --force flag. Prefer binding to port 0 / failing fast with a clear message over killing foreign processes.

---

### 🟡 MEDIUM: AST4

**Location:** `eval-viewer/generate_review.py:291–294`  
**Confidence:** 70%  

**Message:** subprocess module call

**Remediation:** Use subprocess.run() with shell=False and an explicit argument list. Validate all inputs and avoid passing user-controlled data to commands.

---

### 🟡 MEDIUM: SDI-2

**Location:** `eval-viewer/generate_review.py:332–384`  
**Confidence:** 75%  

**Message:** The handler serves a page containing the FULL text and base64 copies of every file under any outputs/ directory (prompts, transcripts, generated source code, documents) to any client that can reach the port, with no authentication, no Host/Origin validation, and no CSRF protection. Because there is no Origin or Host header check, a malicious web page can reach this loopback service via DNS rebinding or localhost requests and both read embedded data and POST arbitrary JSON to /api/feedback, which is written unconditionally to feedback.json (a write primitive into the workspace). Additionally, file contents are JSON-serialized and string-spliced into the HTML/JS page (template.replace with json.dumps, which does not escape '</script>'), so adversarial content in an eval output file can break out of the embedded data block and execute script in the viewer's browser context, which then has access to the feedback API.

**Remediation:** Bind strictly to 127.0.0.1 (already done) AND validate the Host/Origin header on every request, rejecting rebinding attempts. Require a per-session random token (capability URL) for GET and POST, and validate Content-Type/Origin on /api/feedback to block cross-site writes. Escape or safely serialize embedded data (e.g., escape '</' in the JSON payload before splicing, or base64-encode the embedded blob) and render file content as text/escaped HTML in the template rather than injecting it raw.

---

### 🟡 MEDIUM: SQP-2

**Location:** `scripts/auto_grader.py:33–42`  
**Confidence:** 62%  

**Message:** Full parent environment (including any credentials/API keys/tokens) is forwarded to the spawned `qwen` subprocess with no disclosure or comment

**Remediation:** Build a minimal, explicit allow-list environment (e.g. copy only the variables the `qwen` CLI actually needs, such as its auth token and PATH/HOME) instead of forwarding the whole `os.environ`; add a short comment above L33 explaining why the environment is pruned, and log at verbose level which env keys are passed to the child.

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

### 🟡 MEDIUM: SQP-2

**Location:** `scripts/improve_description.py:190–193`  
**Confidence:** 60%  

**Message:** Silent write of transcript file containing full SKILL.md body and user eval queries to disk

**Remediation:** Either print a one-line notice to stderr when a transcript is written (e.g. "Writing iteration transcript to <path>") and document the behaviour in the module docstring / SKILL.md, or gate the transcript write behind an explicit opt-in flag such as --log-dir plus --write-transcript so the user controls where and whether skill content and query data are persisted.

---

### 🟡 MEDIUM: SDI-2

**Location:** `scripts/run_eval.py:94–118`  
**Confidence:** 75%  

**Message:** The --yolo flag disables ALL human confirmation for tool calls in the spawned agent, and --max-tool-calls 20 gives it substantial autonomy. Combined with the full environment (which may contain API keys, database URIs, cloud credentials), this creates a scenario where a prompt-injected or misbehaving subprocess could exfiltrate secrets, modify files, or issue API calls with zero oversight. The eval_set JSON file is user-supplied and unvalidated; an adversarial eval set could craft queries that exploit the --yolo agent's tool access to perform unauthorized actions within project_root.

**Remediation:** Review the flagged content for security risks. Ensure no credentials, secrets, or sensitive data are exposed.

---

### 🟡 MEDIUM: SQP-2

**Location:** `scripts/run_eval.py:107–118`  
**Confidence:** 60%  

**Message:** The code deliberately strips the QWENCODE environment variable to bypass a guard that exists to prevent nested/unattended agent invocations, then forwards ALL remaining environment variables to the subprocess. The comment dismisses the guard's purpose ('The guard is for interactive terminal conflicts; programmatic subprocess usage is safe') which is a rationalization rather than a security analysis. The guard may also exist to prevent recursive resource exhaustion or sandbox escape. Forwarding the entire environment (including potential secrets like AWS keys, database URLs, model API tokens) to an auto-approve subprocess is a credential-exposure risk.

**Remediation:** Review the flagged content for security risks. Ensure no credentials, secrets, or sensitive data are exposed.

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

### 🟢 LOW: SDI-4

**Location:** `SKILL.md:22`  
**Confidence:** 55%  

**Message:** Top-level summary claims "no subagents, no interactive viewer, no human feedback needed" (L022, repeated verbatim at L0416/L208), but the operative instructions later require exactly those things: blind comparison via subagents (L0319), parallel subagent test execution in Cowork (L0441), and mandatory generation of the interactive eval viewer *before* the agent evaluates outputs, with human feedback read back from feedback.json (L0443-L0444, L470).

**Remediation:** Reword L022 and L208 to describe the *default* mode accurately, e.g. "the eval loop can run without subagents, an interactive viewer or human feedback (see platform-specific sections for when those are required)", and cross-reference the mandatory eval-viewer/human-review step described at L443-L444 and L470 so the two sections agree.

---

### 🟢 LOW: SQP-1

**Location:** `SKILL.md:75`  
**Confidence:** 50%  

**Message:** Instruction to write 'pushy' over-broad trigger descriptions without exclusions

**Remediation:** Balance the 'pushy description' advice by requiring a bounded trigger scope: instruct authors to also list contexts where the skill should NOT fire, and cap keyword-based triggers with a specificity constraint (e.g. require an explicit task verb, not mere topic mention).

---

### 🟢 LOW: SDI-4

**Location:** `SKILL.md:416`  
**Confidence:** 40%  

**Message:** Comment/docstring at L022 ("no subagents") and L0416 ("No subagents means no parallel execution ... Skip it") contradict the manifest description and the Cowork section, which state that subagents and parallel execution are available and should be used (L0441, L0319).

**Remediation:** State the subagent/parallel-execution constraint as harness-conditional in the overview (L022) — e.g. "no subagents required in Qwen Cloud; parallel subagent execution available in Cowork" — so the overview matches the platform-specific sections.

---

### 🟢 LOW: SQP-1

**Location:** `eval-viewer/generate_review.py:1`  
**Confidence:** 0%  

**Message:** Skipping SQP-1: rule applies to markdown/plain-text/manifest files only; this is a .py file.

**Remediation:** N/A

---

## Inspection Completeness

| Metric | Value |
|--------|-------|
| Execution | successful |
| Status | partial |
| Coverage | 78.9% |
| Fully inspected | 15 |
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
| reference_missing | `SKILL.md:212-212` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:246-246` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:431-431` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:444-444` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
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

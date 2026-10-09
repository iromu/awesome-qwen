# SkillSpector Security Report

**Skill:** unsloth-finetuning  
**Scanned:** 2026-10-08 22:49:18 UTC  

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 100/100 |
| Severity | CRITICAL |
| Recommendation | DO NOT INSTALL |

## Components (16)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `SKILL.md` | markdown | 349 | No |
| `evals/evals.json` | json | 63 | No |
| `references/chat-templates.md` | markdown | 142 | No |
| `references/datasets.md` | markdown | 190 | No |
| `references/embedding.md` | markdown | 96 | No |
| `references/hyperparameters.md` | markdown | 142 | No |
| `references/installation.md` | markdown | 251 | No |
| `references/long-context.md` | markdown | 173 | No |
| `references/model-catalog.md` | markdown | 88 | No |
| `references/moe.md` | markdown | 121 | No |
| `references/multi-gpu.md` | markdown | 98 | No |
| `references/pretraining.md` | markdown | 195 | No |
| `references/requirements-vram.md` | markdown | 64 | No |
| `references/sft-lora.md` | markdown | 343 | No |
| `references/troubleshooting.md` | markdown | 188 | No |
| `references/vision.md` | markdown | 267 | No |

## Issues (14)

### 🔴 HIGH: AE1

**Location:** `SKILL.md:279`  
**Confidence:** 100%  

**Message:** Referenced artifact was not completely inspected

**Remediation:** Review the reported expression and analyzer's parsing limitation; correct the scanner if it misinterprets valid source, then rerun the scan. Keep required references; incomplete analysis is not proof of malicious evasion.

**Evidence:**
- **reasons:** `[{'reason_code': 'static_parse_limit', 'message': "A security-relevant expression exceeded a bounded static parser's span limit.", 'phase': 'static', 'analyzers': ['static_patterns_tool_misuse']}]`
- **target_disposition:** `partial`
- **target_path:** `references/long-context.md`

---

### 🔴 HIGH: PE5

**Location:** `references/installation.md:106`  
**Confidence:** 80%  

**Message:** Privileged Container / Container Escape

**Remediation:** Review the flagged content for security risks. Ensure no credentials, secrets, or sensitive data are exposed.

---

### 🔴 HIGH: TM2

**Location:** `references/installation.md:119`  
**Confidence:** 75%  

**Message:** Chaining Abuse

**Remediation:** Limit tool chaining depth and validate the output of each tool before passing it to the next. Require explicit user approval for multi-step chains.

---

### 🔴 HIGH: PE5

**Location:** `references/installation.md:124`  
**Confidence:** 70%  

**Message:** Privileged Container / Container Escape

**Remediation:** Review the flagged content for security risks. Ensure no credentials, secrets, or sensitive data are exposed.

---

### 🔴 HIGH: PE5

**Location:** `references/installation.md:125`  
**Confidence:** 70%  

**Message:** Privileged Container / Container Escape

**Remediation:** Review the flagged content for security risks. Ensure no credentials, secrets, or sensitive data are exposed.

---

### 🔴 HIGH: PE5

**Location:** `references/installation.md:142`  
**Confidence:** 70%  

**Message:** Privileged Container / Container Escape

**Remediation:** Review the flagged content for security risks. Ensure no credentials, secrets, or sensitive data are exposed.

---

### 🔴 HIGH: PE5

**Location:** `references/installation.md:132`  
**Confidence:** 80%  

**Message:** Privileged Container / Container Escape

**Remediation:** Review the flagged content for security risks. Ensure no credentials, secrets, or sensitive data are exposed.

---

### 🟡 MEDIUM: RP1

**Location:** `references/installation.md:106`  
**Confidence:** 75%  

**Message:** Docker image referenced without tag or digest: 'docker run -d'.

**Remediation:** Pin the image: image:tag or image@sha256:abc123

---

### 🟡 MEDIUM: RP1

**Location:** `references/installation.md:130`  
**Confidence:** 75%  

**Message:** Docker image referenced without tag or digest: 'docker run -d'.

**Remediation:** Pin the image: image:tag or image@sha256:abc123

---

### 🟡 MEDIUM: PE2

**Location:** `references/installation.md:119`  
**Confidence:** 80%  

**Message:** Sudo/Root Execution

**Remediation:** Avoid sudo/root unless strictly required. Prefer least-privilege patterns. If elevation is needed, document the justification and scope.

---

### 🟡 MEDIUM: PE2

**Location:** `references/installation.md:119`  
**Confidence:** 70%  

**Message:** Sudo/Root Execution

**Remediation:** Avoid sudo/root unless strictly required. Prefer least-privilege patterns. If elevation is needed, document the justification and scope.

---

### 🟡 MEDIUM: RP1

**Location:** `references/installation.md:153`  
**Confidence:** 75%  

**Message:** Docker image referenced without tag or digest: 'docker pull unsloth/unsloth`'.

**Remediation:** Pin the image: image:tag or image@sha256:abc123

---

### 🟢 LOW: SC2

**Location:** `references/installation.md:68`  
**Confidence:** 15%  

**Message:** External Script Fetching

**Remediation:** Avoid downloading and executing remote scripts. Use trusted packages from PyPI/npm. If remote fetch is required, verify checksums and use HTTPS.

---

### 🟢 LOW: SC2

**Location:** `references/installation.md:118`  
**Confidence:** 15%  

**Message:** External Script Fetching

**Remediation:** Avoid downloading and executing remote scripts. Use trusted packages from PyPI/npm. If remote fetch is required, verify checksums and use HTTPS.

---

## Inspection Completeness

| Metric | Value |
|--------|-------|
| Execution | successful |
| Status | partial |
| Coverage | 93.8% |
| Fully inspected | 15 |
| Partially inspected | 1 |
| Entirely uninspected | 0 |

### Ledger Exceptions

| Reason / Status | Location | Details |
|-----------------|----------|---------|
| reference_missing | `SKILL.md:257-257` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:312-312` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:319-319` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:346-346` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| static_parse_limit | `references/long-context.md` | A security-relevant expression exceeded a bounded static parser's span limit. |

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

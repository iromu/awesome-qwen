# SkillSpector Security Report

**Skill:** unsloth-inference  
**Scanned:** 2026-10-08 22:49:37 UTC  

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 100/100 |
| Severity | CRITICAL |
| Recommendation | DO NOT INSTALL |

## Components (9)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `SKILL.md` | markdown | 331 | No |
| `evals/evals.json` | json | 137 | No |
| `references/api.md` | markdown | 259 | No |
| `references/desktop-studio.md` | markdown | 197 | No |
| `references/llama-server.md` | markdown | 222 | No |
| `references/native-inference.md` | markdown | 126 | No |
| `references/ollama-lmstudio.md` | markdown | 220 | No |
| `references/python-sdk.md` | markdown | 327 | No |
| `references/vllm.md` | markdown | 212 | No |

## Issues (44)

### 🔴 HIGH: SC2

**Location:** `SKILL.md:104`  
**Confidence:** 90%  

**Message:** External Script Fetching

**Remediation:** Avoid downloading and executing remote scripts. Use trusted packages from PyPI/npm. If remote fetch is required, verify checksums and use HTTPS.

---

### 🔴 HIGH: SC2

**Location:** `references/desktop-studio.md:64`  
**Confidence:** 90%  

**Message:** External Script Fetching

**Remediation:** Avoid downloading and executing remote scripts. Use trusted packages from PyPI/npm. If remote fetch is required, verify checksums and use HTTPS.

---

### 🔴 HIGH: TM2

**Location:** `SKILL.md:177`  
**Confidence:** 70%  

**Message:** Chaining Abuse

**Remediation:** Limit tool chaining depth and validate the output of each tool before passing it to the next. Require explicit user approval for multi-step chains.

---

### 🔴 HIGH: TM2

**Location:** `references/desktop-studio.md:64`  
**Confidence:** 70%  

**Message:** Chaining Abuse

**Remediation:** Limit tool chaining depth and validate the output of each tool before passing it to the next. Require explicit user approval for multi-step chains.

---

### 🔴 HIGH: TM2

**Location:** `references/ollama-lmstudio.md:39`  
**Confidence:** 70%  

**Message:** Chaining Abuse

**Remediation:** Limit tool chaining depth and validate the output of each tool before passing it to the next. Require explicit user approval for multi-step chains.

---

### 🔴 HIGH: TM2

**Location:** `references/vllm.md:118`  
**Confidence:** 70%  

**Message:** Chaining Abuse

**Remediation:** Limit tool chaining depth and validate the output of each tool before passing it to the next. Require explicit user approval for multi-step chains.

---

### 🔴 HIGH: SC2

**Location:** `SKILL.md:180`  
**Confidence:** 90%  

**Message:** External Script Fetching

**Remediation:** Avoid downloading and executing remote scripts. Use trusted packages from PyPI/npm. If remote fetch is required, verify checksums and use HTTPS.

---

### 🔴 HIGH: AS1

**Location:** `SKILL.md:246`  
**Confidence:** 90%  

**Message:** Agent Config Directory Access

**Remediation:** Remove all code or instructions that access agent configuration directories (.claude/, .codex/, .gemini/). If configuration values are needed, pass them explicitly as parameters or environment variables — never read the agent's own config files.

---

### 🔴 HIGH: AS1

**Location:** `references/api.md:213`  
**Confidence:** 90%  

**Message:** Agent Config Directory Access

**Remediation:** Remove all code or instructions that access agent configuration directories (.claude/, .codex/, .gemini/). If configuration values are needed, pass them explicitly as parameters or environment variables — never read the agent's own config files.

---

### 🔴 HIGH: AS1

**Location:** `SKILL.md:324`  
**Confidence:** 90%  

**Message:** Agent Config Directory Access

**Remediation:** Remove all code or instructions that access agent configuration directories (.claude/, .codex/, .gemini/). If configuration values are needed, pass them explicitly as parameters or environment variables — never read the agent's own config files.

---

### 🔴 HIGH: AS1

**Location:** `references/api.md:208`  
**Confidence:** 90%  

**Message:** Agent Config Directory Access

**Remediation:** Remove all code or instructions that access agent configuration directories (.claude/, .codex/, .gemini/). If configuration values are needed, pass them explicitly as parameters or environment variables — never read the agent's own config files.

---

### 🔴 HIGH: TM1

**Location:** `references/api.md:135`  
**Confidence:** 60%  

**Message:** Tool Parameter Abuse

**Remediation:** Validate all tool parameters against an allowlist. Reject dangerous parameter values (shell=True, --force, -rf /) and use safe defaults.

---

### 🔴 HIGH: TM1

**Location:** `references/desktop-studio.md:90`  
**Confidence:** 90%  

**Message:** Tool Parameter Abuse

**Remediation:** Validate all tool parameters against an allowlist. Reject dangerous parameter values (shell=True, --force, -rf /) and use safe defaults.

---

### 🔴 HIGH: TM1

**Location:** `references/vllm.md:135`  
**Confidence:** 90%  

**Message:** Tool Parameter Abuse

**Remediation:** Validate all tool parameters against an allowlist. Reject dangerous parameter values (shell=True, --force, -rf /) and use safe defaults.

---

### 🔴 HIGH: TM1

**Location:** `references/desktop-studio.md:90`  
**Confidence:** 90%  

**Message:** Tool Parameter Abuse

**Remediation:** Validate all tool parameters against an allowlist. Reject dangerous parameter values (shell=True, --force, -rf /) and use safe defaults.

---

### 🔴 HIGH: TM1

**Location:** `references/desktop-studio.md:90`  
**Confidence:** 85%  

**Message:** Tool Parameter Abuse

**Remediation:** Validate all tool parameters against an allowlist. Reject dangerous parameter values (shell=True, --force, -rf /) and use safe defaults.

---

### 🔴 HIGH: TM1

**Location:** `references/llama-server.md:14`  
**Confidence:** 60%  

**Message:** Tool Parameter Abuse

**Remediation:** Validate all tool parameters against an allowlist. Reject dangerous parameter values (shell=True, --force, -rf /) and use safe defaults.

---

### 🔴 HIGH: TM1

**Location:** `references/llama-server.md:111`  
**Confidence:** 80%  

**Message:** Tool Parameter Abuse

**Remediation:** Validate all tool parameters against an allowlist. Reject dangerous parameter values (shell=True, --force, -rf /) and use safe defaults.

---

### 🔴 HIGH: SC2

**Location:** `references/ollama-lmstudio.md:39`  
**Confidence:** 90%  

**Message:** External Script Fetching

**Remediation:** Avoid downloading and executing remote scripts. Use trusted packages from PyPI/npm. If remote fetch is required, verify checksums and use HTTPS.

---

### 🔴 HIGH: TM2

**Location:** `references/vllm.md:119`  
**Confidence:** 75%  

**Message:** Chaining Abuse

**Remediation:** Limit tool chaining depth and validate the output of each tool before passing it to the next. Require explicit user approval for multi-step chains.

---

### 🔴 HIGH: PE5

**Location:** `references/vllm.md:129`  
**Confidence:** 80%  

**Message:** Privileged Container / Container Escape

**Remediation:** Review the flagged content for security risks. Ensure no credentials, secrets, or sensitive data are exposed.

---

### 🔴 HIGH: TM1

**Location:** `references/vllm.md:135`  
**Confidence:** 90%  

**Message:** Tool Parameter Abuse

**Remediation:** Validate all tool parameters against an allowlist. Reject dangerous parameter values (shell=True, --force, -rf /) and use safe defaults.

---

### 🔴 HIGH: TM1

**Location:** `references/vllm.md:135`  
**Confidence:** 85%  

**Message:** Tool Parameter Abuse

**Remediation:** Validate all tool parameters against an allowlist. Reject dangerous parameter values (shell=True, --force, -rf /) and use safe defaults.

---

### 🟡 MEDIUM: E1

**Location:** `SKILL.md:117`  
**Confidence:** 60%  

**Message:** External Transmission

**Remediation:** Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

---

### 🟡 MEDIUM: E1

**Location:** `references/api.md:135`  
**Confidence:** 60%  

**Message:** External Transmission

**Remediation:** Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

---

### 🟡 MEDIUM: E1

**Location:** `SKILL.md:180`  
**Confidence:** 60%  

**Message:** External Transmission

**Remediation:** Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

---

### 🟡 MEDIUM: E1

**Location:** `references/ollama-lmstudio.md:78`  
**Confidence:** 60%  

**Message:** External Transmission

**Remediation:** Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

---

### 🟡 MEDIUM: RA2

**Location:** `SKILL.md:316`  
**Confidence:** 60%  

**Message:** Session Persistence

**Remediation:** Remove any persistence mechanisms (cron jobs, startup scripts, state files). Skills should not maintain state across sessions without explicit user consent.

---

### 🟡 MEDIUM: E1

**Location:** `references/api.md:42`  
**Confidence:** 60%  

**Message:** External Transmission

**Remediation:** Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

---

### 🟡 MEDIUM: E1

**Location:** `references/api.md:104`  
**Confidence:** 60%  

**Message:** External Transmission

**Remediation:** Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

---

### 🟡 MEDIUM: TM3

**Location:** `references/api.md:223`  
**Confidence:** 75%  

**Message:** Unsafe Defaults

**Remediation:** Override unsafe defaults with secure settings (verify=True, auth required, restrictive permissions). Review and harden all tool configurations.

---

### 🟡 MEDIUM: RP1

**Location:** `references/desktop-studio.md:85`  
**Confidence:** 75%  

**Message:** Docker image referenced without tag or digest: 'docker run -d'.

**Remediation:** Pin the image: image:tag or image@sha256:abc123

---

### 🟡 MEDIUM: PE2

**Location:** `references/desktop-studio.md:189`  
**Confidence:** 70%  

**Message:** Sudo/Root Execution

**Remediation:** Avoid sudo/root unless strictly required. Prefer least-privilege patterns. If elevation is needed, document the justification and scope.

---

### 🟡 MEDIUM: PE2

**Location:** `references/desktop-studio.md:191`  
**Confidence:** 70%  

**Message:** Sudo/Root Execution

**Remediation:** Avoid sudo/root unless strictly required. Prefer least-privilege patterns. If elevation is needed, document the justification and scope.

---

### 🟡 MEDIUM: RP1

**Location:** `references/desktop-studio.md:195`  
**Confidence:** 75%  

**Message:** Docker image referenced without tag or digest: 'docker pull unsloth/unsloth:latest`,'.

**Remediation:** Pin the image: image:tag or image@sha256:abc123

---

### 🟡 MEDIUM: RP1

**Location:** `references/llama-server.md:195`  
**Confidence:** 65%  

**Message:** MCP server referenced without pinned version: 'uvx mcp-cli'.

**Remediation:** Pin the version: uvx package-name==1.2.3

---

### 🟡 MEDIUM: SSRF2

**Location:** `references/ollama-lmstudio.md:52`  
**Confidence:** 70%  

**Message:** Internal Network Request

**Remediation:** Avoid requests to loopback/link-local/private hosts from skill code. If internal access is intended, document it and validate the target against an allowlist.

---

### 🟡 MEDIUM: E1

**Location:** `references/ollama-lmstudio.md:185`  
**Confidence:** 60%  

**Message:** External Transmission

**Remediation:** Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

---

### 🟡 MEDIUM: E1

**Location:** `references/vllm.md:96`  
**Confidence:** 60%  

**Message:** External Transmission

**Remediation:** Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

---

### 🟡 MEDIUM: PE2

**Location:** `references/vllm.md:119`  
**Confidence:** 70%  

**Message:** Sudo/Root Execution

**Remediation:** Avoid sudo/root unless strictly required. Prefer least-privilege patterns. If elevation is needed, document the justification and scope.

---

### 🟡 MEDIUM: RP1

**Location:** `references/vllm.md:127`  
**Confidence:** 75%  

**Message:** Docker image referenced without tag or digest: 'docker run --gpus'.

**Remediation:** Pin the image: image:tag or image@sha256:abc123

---

### 🟢 LOW: SC2

**Location:** `SKILL.md:117`  
**Confidence:** 15%  

**Message:** External Script Fetching

**Remediation:** Avoid downloading and executing remote scripts. Use trusted packages from PyPI/npm. If remote fetch is required, verify checksums and use HTTPS.

---

### 🟢 LOW: SC2

**Location:** `references/desktop-studio.md:89`  
**Confidence:** 15%  

**Message:** External Script Fetching

**Remediation:** Avoid downloading and executing remote scripts. Use trusted packages from PyPI/npm. If remote fetch is required, verify checksums and use HTTPS.

---

### 🟢 LOW: SC2

**Location:** `references/vllm.md:96`  
**Confidence:** 15%  

**Message:** External Script Fetching

**Remediation:** Avoid downloading and executing remote scripts. Use trusted packages from PyPI/npm. If remote fetch is required, verify checksums and use HTTPS.

---

## Inspection Completeness

| Metric | Value |
|--------|-------|
| Execution | successful |
| Status | partial |
| Coverage | 100.0% |
| Fully inspected | 9 |
| Partially inspected | 0 |
| Entirely uninspected | 0 |

### Ledger Exceptions

| Reason / Status | Location | Details |
|-----------------|----------|---------|
| reference_missing | `SKILL.md:86-86` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:179-179` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:207-207` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:308-308` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |

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
| completed | `static_patterns_tool_misuse` |  |
| completed | `static_yara` |  |

## Metadata

- **Executable Scripts:** No

*Generated by SkillSpector v2.12.0*

<!-- scan_skills.sh: static report (NO_LLM=1) -->

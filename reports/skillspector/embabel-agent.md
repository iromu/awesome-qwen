# SkillSpector Security Report

**Skill:** embabel-agent  
**Scanned:** 2026-10-08 22:48:36 UTC  

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 100/100 |
| Severity | CRITICAL |
| Recommendation | DO NOT INSTALL |

## Components (40)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `SKILL.md` | markdown | 407 | No |
| `evals/evals.json` | json | 212 | No |
| `references/agent-skills.md` | markdown | 202 | No |
| `references/annotations.md` | markdown | 292 | No |
| `references/api-spi.md` | markdown | 12 | No |
| `references/async-mode.md` | markdown | 130 | No |
| `references/bedrock.md` | markdown | 114 | No |
| `references/chatbots.md` | markdown | 426 | No |
| `references/common-pitfalls.md` | markdown | 142 | No |
| `references/configuration.md` | markdown | 481 | No |
| `references/cost-tracking.md` | markdown | 113 | No |
| `references/customizing.md` | markdown | 135 | No |
| `references/dashscope.md` | markdown | 110 | No |
| `references/domain.md` | markdown | 133 | No |
| `references/dsl.md` | markdown | 192 | No |
| `references/error-handling.md` | markdown | 122 | No |
| `references/examples.md` | markdown | 90 | No |
| `references/flow.md` | markdown | 176 | No |
| `references/guardrails.md` | markdown | 316 | No |
| `references/integrations.md` | markdown | 410 | No |
| `references/interceptors.md` | markdown | 183 | No |
| `references/invoking.md` | markdown | 359 | No |
| `references/llm-integration.md` | markdown | 561 | No |
| `references/migrating.md` | markdown | 202 | No |
| `references/minimax.md` | markdown | 119 | No |
| `references/planners.md` | markdown | 349 | No |
| `references/production-deployment.md` | markdown | 277 | No |
| `references/rag.md` | markdown | 300 | No |
| `references/states.md` | markdown | 249 | No |
| `references/streaming.md` | markdown | 114 | No |
| `references/structured-prompts.md` | markdown | 194 | No |
| `references/termination.md` | markdown | 114 | No |
| `references/testing.md` | markdown | 471 | No |
| `references/thinking.md` | markdown | 114 | No |
| `references/tooling.md` | markdown | 45 | No |
| `references/tools.md` | markdown | 389 | No |
| `references/troubleshooting.md` | markdown | 202 | No |
| `references/types.md` | markdown | 213 | No |
| `references/zai.md` | markdown | 115 | No |
| `scripts/project-creator.sh` | shell | 98 | Yes |

## Issues (21)

### 🔴 HIGH: AE1

**Location:** `SKILL.md:84`  
**Confidence:** 100%  

**Message:** Referenced artifact was not completely inspected

**Remediation:** Review the reported expression and analyzer's parsing limitation; correct the scanner if it misinterprets valid source, then rerun the scan. Keep required references; incomplete analysis is not proof of malicious evasion.

**Evidence:**
- **reasons:** `[{'reason_code': 'static_parse_limit', 'message': "A security-relevant expression exceeded a bounded static parser's span limit.", 'phase': 'static', 'analyzers': ['static_patterns_tool_misuse']}]`
- **target_disposition:** `partial`
- **target_path:** `references/configuration.md`

---

### 🔴 HIGH: AE1

**Location:** `SKILL.md:88`  
**Confidence:** 100%  

**Message:** Referenced artifact was not completely inspected

**Remediation:** Review the reported expression and analyzer's parsing limitation; correct the scanner if it misinterprets valid source, then rerun the scan. Keep required references; incomplete analysis is not proof of malicious evasion.

**Evidence:**
- **reasons:** `[{'reason_code': 'static_parse_limit', 'message': "A security-relevant expression exceeded a bounded static parser's span limit.", 'phase': 'static', 'analyzers': ['static_patterns_tool_misuse']}]`
- **target_disposition:** `partial`
- **target_path:** `references/configuration.md`

---

### 🔴 HIGH: AE1

**Location:** `SKILL.md:315`  
**Confidence:** 100%  

**Message:** Referenced artifact was not completely inspected

**Remediation:** Review the reported expression and analyzer's parsing limitation; correct the scanner if it misinterprets valid source, then rerun the scan. Keep required references; incomplete analysis is not proof of malicious evasion.

**Evidence:**
- **reasons:** `[{'reason_code': 'static_parse_limit', 'message': "A security-relevant expression exceeded a bounded static parser's span limit.", 'phase': 'static', 'analyzers': ['static_patterns_tool_misuse']}]`
- **target_disposition:** `partial`
- **target_path:** `references/configuration.md`

---

### 🔴 HIGH: AE1

**Location:** `SKILL.md:258`  
**Confidence:** 100%  

**Message:** Referenced artifact was not completely inspected

**Remediation:** Review the reported expression and analyzer's parsing limitation; correct the scanner if it misinterprets valid source, then rerun the scan. Keep required references; incomplete analysis is not proof of malicious evasion.

**Evidence:**
- **reasons:** `[{'reason_code': 'static_parse_limit', 'message': "A security-relevant expression exceeded a bounded static parser's span limit.", 'phase': 'static', 'analyzers': ['static_patterns_tool_misuse']}]`
- **target_disposition:** `partial`
- **target_path:** `references/rag.md`

---

### 🔴 HIGH: MP3

**Location:** `references/annotations.md:60`  
**Confidence:** 80%  

**Message:** Memory Manipulation

**Remediation:** Protect agent memory and state from modification by untrusted content. Use read-only memory for critical instructions and validate all state changes.

---

### 🔴 HIGH: TM1

**Location:** `references/configuration.md:416`  
**Confidence:** 80%  

**Message:** Tool Parameter Abuse

**Remediation:** Validate all tool parameters against an allowlist. Reject dangerous parameter values (shell=True, --force, -rf /) and use safe defaults.

---

### 🔴 HIGH: YR4

**Location:** `references/guardrails.md:3`  
**Confidence:** 80%  

**Message:** YARA rule 'agent_skill_prompt_injection_hidden_instructions': Prompt injection or hidden instructions embedded in AI agent skill text [agent_skills]

**Remediation:** Remove offensive tool references and exploit code. Legitimate agent skills should not contain penetration testing tools, exploit frameworks, or reconnaissance utilities.

---

### 🔴 HIGH: AR3

**Location:** `references/guardrails.md:105`  
**Confidence:** 90%  

**Message:** Anti-Refusal Statement

**Remediation:** Remove jailbreak framing that nullifies safety policies or restrictions. Skill content must not instruct the agent to ignore its guidelines or operate without guardrails.

---

### 🔴 HIGH: P1

**Location:** `references/guardrails.md:105`  
**Confidence:** 90%  

**Message:** Instruction Override

**Remediation:** Remove or rewrite any text that instructs the agent to ignore prompts, override safety rules, or trust unverified content. Ensure skill content cannot be injected to alter agent behavior.

---

### 🔴 HIGH: AR2

**Location:** `references/tooling.md:17`  
**Confidence:** 80%  

**Message:** Anti-Refusal Statement

**Remediation:** Remove instructions that suppress warnings, disclaimers, or ethical commentary. Let the agent surface safety-relevant caveats to the user.

---

### 🟡 MEDIUM: RP1

**Location:** `SKILL.md:280`  
**Confidence:** 65%  

**Message:** MCP server referenced without pinned version: 'uvx mcpo'.

**Remediation:** Pin the version: uvx package-name==1.2.3

---

### 🟡 MEDIUM: RP1

**Location:** `references/integrations.md:29`  
**Confidence:** 65%  

**Message:** MCP server referenced without pinned version: 'uvx mcpo'.

**Remediation:** Pin the version: uvx package-name==1.2.3

---

### 🟡 MEDIUM: EA4

**Location:** `references/common-pitfalls.md:17`  
**Confidence:** 75%  

**Message:** Unbounded Resource Access

**Remediation:** Set explicit rate limits, timeouts, and resource quotas for API calls, file operations, and compute. Implement circuit breakers for runaway loops.

---

### 🟡 MEDIUM: E1

**Location:** `references/configuration.md:196`  
**Confidence:** 50%  

**Message:** External Transmission

**Remediation:** Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

---

### 🟡 MEDIUM: E1

**Location:** `references/configuration.md:203`  
**Confidence:** 50%  

**Message:** External Transmission

**Remediation:** Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

---

### 🟡 MEDIUM: E1

**Location:** `references/zai.md:108`  
**Confidence:** 50%  

**Message:** External Transmission

**Remediation:** Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

---

### 🟡 MEDIUM: E1

**Location:** `references/minimax.md:110`  
**Confidence:** 50%  

**Message:** External Transmission

**Remediation:** Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

---

### 🟡 MEDIUM: RP1

**Location:** `references/production-deployment.md:101`  
**Confidence:** 75%  

**Message:** Docker image referenced without tag or digest: 'docker run -e'.

**Remediation:** Pin the image: image:tag or image@sha256:abc123

---

### 🟡 MEDIUM: E1

**Location:** `references/structured-prompts.md:156`  
**Confidence:** 50%  

**Message:** External Transmission

**Remediation:** Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

---

### 🟡 MEDIUM: EA2

**Location:** `references/types.md:101`  
**Confidence:** 80%  

**Message:** Autonomous Decision Making

**Remediation:** Add human-in-the-loop confirmation for destructive, irreversible, or high-impact operations. Never auto-execute commands that modify files, send data, or alter system state.

---

### 🟡 MEDIUM: RP1

**Location:** `scripts/project-creator.sh:87`  
**Confidence:** 65%  

**Message:** MCP server referenced without pinned version: 'uvx --from git'.

**Remediation:** Pin the version: uvx package-name==1.2.3

---

## Inspection Completeness

| Metric | Value |
|--------|-------|
| Execution | successful |
| Status | partial |
| Coverage | 95.0% |
| Fully inspected | 38 |
| Partially inspected | 2 |
| Entirely uninspected | 0 |

### Ledger Exceptions

| Reason / Status | Location | Details |
|-----------------|----------|---------|
| reference_missing | `SKILL.md:26-26` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:88-88` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:323-323` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:324-324` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| static_parse_limit | `references/configuration.md` | A security-relevant expression exceeded a bounded static parser's span limit. |
| static_parse_limit | `references/rag.md` | A security-relevant expression exceeded a bounded static parser's span limit. |

### Analyzer Statuses

| Reason / Status | Location | Details |
|-----------------|----------|---------|
| completed | `artifact_integrity` |  |
| no_applicable_files | `behavioral_ast` | No files matched this analyzer's applicability contract. |
| no_applicable_files | `behavioral_taint_tracking` | No files matched this analyzer's applicability contract. |
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

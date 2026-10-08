# SkillSpector Security Report

**Skill:** embabel-otel  
**Scanned:** 2026-10-08 04:22:59 UTC  

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 19/100 |
| Severity | LOW |
| Recommendation | CAUTION |

## Components (4)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `SKILL.md` | markdown | 156 | No |
| `references/langfuse-properties.md` | markdown | 46 | No |
| `references/langsmith-properties.md` | markdown | 46 | No |
| `references/span-classification.md` | markdown | 48 | No |

## Issues (9)

### 🟡 MEDIUM: SQP-2

**Location:** `SKILL.md:87–121`  
**Confidence:** 62%  

**Message:** Skill instructs configuring trace export to third-party SaaS endpoints (https://cloud.langfuse.com, https://api.smith.langchain.com) that transmit Embabel/GenAI span data — which typically contains user prompts, model completions, and tool arguments — off the host, with no warning or confirmation step about this data egress or its privacy/compliance implications.

**Remediation:** Add an explicit warning near Step 2 (and mirror it in the Step 4 verification checklist) stating that enabling an exporter sends span attributes containing prompt/response and tool I/O to the configured endpoint, that `embabel-only` filters span *selection* and not span *content*, and instruct the user to confirm the endpoint is an approved destination and to disable or redact sensitive attributes before enabling export in production.

---

### 🟡 MEDIUM: E1

**Location:** `SKILL.md:102`  
**Confidence:** 50%  

**Message:** External Transmission

**Remediation:** Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

---

### 🟡 MEDIUM: E1

**Location:** `SKILL.md:118`  
**Confidence:** 50%  

**Message:** External Transmission

**Remediation:** Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

---

### 🟡 MEDIUM: E1

**Location:** `references/langsmith-properties.md:11`  
**Confidence:** 50%  

**Message:** External Transmission

**Remediation:** Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

---

### 🟡 MEDIUM: E1

**Location:** `references/langsmith-properties.md:29`  
**Confidence:** 50%  

**Message:** External Transmission

**Remediation:** Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

---

### 🟡 MEDIUM: E1

**Location:** `references/langsmith-properties.md:39`  
**Confidence:** 50%  

**Message:** External Transmission

**Remediation:** Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

---

### 🟡 MEDIUM: SQP-2

**Location:** `references/langfuse-properties.md:11–42`  
**Confidence:** 55%  

**Message:** Documentation of the trace-export feature omits any privacy/data-disclosure warning that enabling it transmits trace/span data (which for an LLM agent typically includes prompts, completions and tool I/O) to a third-party endpoint, with the public cloud endpoint as the default.

**Remediation:** Add a "Privacy / Data Handling" note stating that enabling the exporter ships full span data (potentially including prompts, model outputs and metadata) to the configured endpoint, that the default endpoint is a third-party SaaS (EU or US region), and advise users to confirm data-retention/DPA terms and to use `embabel-only: true` and/or a self-hosted endpoint for sensitive workloads.

---

### 🟡 MEDIUM: SQP-2

**Location:** `references/langsmith-properties.md:10–42`  
**Confidence:** 55%  

**Message:** Reference documents default-on export of trace data (and the API key) to a third-party external endpoint without any privacy/data-egress warning

**Remediation:** Add a short 'Data egress / privacy' note next to the property table stating that (a) enabling the exporter transmits span attributes — which may embed prompt, completion, and other user-derived content — to the configured endpoint, (b) `endpoint` defaults to a third-party hosted URL and should be pointed at the EU/APAC or self-hosted endpoint when data-residency or confidentiality requires it, and (c) recommend `embabel-only: true` to limit the volume of exported spans. Also add a warning that `api-key` must be supplied via an environment variable or secret manager (never committed) and note that the example at L30 relies on `${LANGSMITH_API_KEY}` expansion, which must not be logged or echoed.

---

### 🟢 LOW: SQP-2

**Location:** `references/langfuse-properties.md:44–46`  
**Confidence:** 50%  

**Message:** Credential handling is documented (public/secret key required, HTTP Basic Auth with Base64) without any warning about protecting the secret key.

**Remediation:** State that `LANGFUSE_PUBLIC_KEY`/`LANGFUSE_SECRET_KEY` must be supplied via a secret manager or environment injection (never hard-coded or committed), that Base64 Basic-Auth credentials provide no confidentiality without TLS, and warn that debug/startup logs should not print the resolved `secret-key` value.

---

## Inspection Completeness

| Metric | Value |
|--------|-------|
| Execution | successful |
| Status | partial |
| Coverage | 100.0% |
| Fully inspected | 4 |
| Partially inspected | 0 |
| Entirely uninspected | 0 |

### Ledger Exceptions

| Reason / Status | Location | Details |
|-----------------|----------|---------|
| reference_missing | `SKILL.md:83-83` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |

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
| completed | `static_patterns_tool_misuse` |  |
| completed | `static_yara` |  |

## Metadata

- **Executable Scripts:** No

*Generated by SkillSpector v2.12.0*

# SkillSpector Security Report

**Skill:** security-audit  
**Scanned:** 2026-10-07 03:54:56 UTC  

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 79/100 |
| Severity | HIGH |
| Recommendation | DO NOT INSTALL |

## Components (2)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `SKILL.md` | markdown | 208 | No |
| `references/language-checklists.md` | markdown | 187 | No |

## Issues (9)

### 🔴 HIGH: SQP-2

**Location:** `SKILL.md:93–120`  
**Confidence:** 70%  

**Message:** Several recommended commands transmit the user's proprietary source tree and dependency manifests to third-party cloud services by default: `semgrep --config=auto` downloads and executes remote rule packs and can upload analysis context; `snyk code test` (Snyk Code) uploads source code to Snyk's cloud for AST analysis; `sonar-scanner` and `cxscan --source .` exfiltrate the full source tree to their respective servers. The skill presents these as simple one-liner commands with no disclosure that code leaves the local environment, no data-handling caveat, and no confirmation step. If an agent executes these verbatim against a client's codebase, confidential source code, embedded secrets, and internal architecture could be disclosed to external vendors — a real confidentiality/compliance risk (GDPR, HIPAA, SOC 2, ITAR, client NDAs) that is invisible to the operator.

**Remediation:** Add an explicit data-handling warning before these commands: note that Snyk Code, Semgrep (config=auto/cloud rules), SonarCloud, and Checkmarx SaaS transmit source code to third-party services and require a data-processing agreement and explicit operator consent before use on proprietary code. Prefer local/offline-first defaults (semgrep --config=p/default with --disable-version-check and --metrics=off, semgrep --config=local, trivy/gosec/bandit which run locally) and gate any cloud-upload scanner behind an explicit confirmation step. Also add --metrics=off / --disable-version-check to semgrep examples to prevent telemetry and remote rule-pack download.

---

### 🔴 HIGH: PE3

**Location:** `references/language-checklists.md:138`  
**Confidence:** 70%  

**Message:** Credential Access

**Remediation:** Remove references to credential paths. Use environment variables or secrets managers. For docs, use placeholder paths (e.g., /path/to/config). Never load .env or token files in production code paths.

---

### 🔴 HIGH: TM4

**Location:** `references/language-checklists.md:162`  
**Confidence:** 70%  

**Message:** Privileged Kubernetes Workload

**Remediation:** Remove privileged, hostPath, and host-namespace settings from workloads. Use a least-privilege securityContext, drop capabilities, and avoid mounting the host filesystem.

---

### 🔴 HIGH: TM4

**Location:** `references/language-checklists.md:178`  
**Confidence:** 70%  

**Message:** Privileged Kubernetes Workload

**Remediation:** Remove privileged, hostPath, and host-namespace settings from workloads. Use a least-privilege securityContext, drop capabilities, and avoid mounting the host filesystem.

---

### 🟡 MEDIUM: SQP-1

**Location:** `SKILL.md:8–9`  
**Confidence:** 55%  

**Message:** Broad activation clause in the description ("Don't hesitate to suggest this skill when the user is working on shipping code to production, adding third-party libraries, or setting up CI/CD security gates") plus the open-ended "or need a security checklist" makes the trigger scope ambiguous and prone to over-invocation.

**Remediation:** Rewrite the description to require an explicit security intent (e.g. "Use only when the user explicitly asks for a security/vulnerability review, dependency CVE audit, or secrets scan"), and add negative examples such as "do not trigger for ordinary feature work, dependency bumps, or general CI/CD pipeline setup that is not security-focused".

---

### 🟡 MEDIUM: RP1

**Location:** `SKILL.md:37`  
**Confidence:** 70%  

**Message:** MCP server referenced without pinned version: 'npx audit-ci'.

**Remediation:** Pin the version: npx @scope/server@1.2.3

---

### 🟡 MEDIUM: RP1

**Location:** `SKILL.md:65`  
**Confidence:** 70%  

**Message:** MCP server referenced without pinned version: 'npx @snyk/cli'.

**Remediation:** Pin the version: npx @scope/server@1.2.3

---

### 🟡 MEDIUM: RP1

**Location:** `references/language-checklists.md:8`  
**Confidence:** 70%  

**Message:** MCP server referenced without pinned version: 'npx @snyk/cli'.

**Remediation:** Pin the version: npx @scope/server@1.2.3

---

### 🟡 MEDIUM: RP1

**Location:** `SKILL.md:109`  
**Confidence:** 70%  

**Message:** MCP server referenced without pinned version: 'npx eslint'.

**Remediation:** Pin the version: npx @scope/server@1.2.3

---

## Inspection Completeness

| Metric | Value |
|--------|-------|
| Execution | successful |
| Status | partial |
| Coverage | 100.0% |
| Fully inspected | 2 |
| Partially inspected | 0 |
| Entirely uninspected | 0 |

### Ledger Exceptions

| Reason / Status | Location | Details |
|-----------------|----------|---------|
| reference_missing | `SKILL.md:50-50` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:119-119` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |

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

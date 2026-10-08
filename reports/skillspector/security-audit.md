# SkillSpector Security Report

**Skill:** security-audit  
**Scanned:** 2026-10-08 04:57:09 UTC  

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 66/100 |
| Severity | HIGH |
| Recommendation | DO NOT INSTALL |

## Components (2)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `SKILL.md` | markdown | 218 | No |
| `references/language-checklists.md` | markdown | 187 | No |

## Issues (9)

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

### 🟡 MEDIUM: RP1

**Location:** `SKILL.md:39`  
**Confidence:** 70%  

**Message:** MCP server referenced without pinned version: 'npx audit-ci'.

**Remediation:** Pin the version: npx @scope/server@1.2.3

---

### 🟡 MEDIUM: SDI-1

**Location:** `SKILL.md:64–67`  
**Confidence:** 72%  

**Message:** The `|| true` appended to `npm audit --audit-level=high` causes the shell command to always exit with code 0, meaning the CI/CD step can NEVER fail a build regardless of vulnerability count. Presenting this under a heading labeled 'CI/CD integration' with the framing of a 'security gate' creates a false sense of security: teams may believe they have an automated security gate blocking vulnerable dependencies, when in reality the gate is purely decorative. Vulnerable dependencies with known CVEs could deploy to production unimpeded while the team believes the gate is active.

**Remediation:** Remove `|| true` from the example so the step actually fails on high-severity findings (`npm audit --audit-level=high`). If a 'report-only' mode is desired during initial rollout, explicitly label it as such and recommend escalating to a blocking gate after a transition period. Use `continue-on-error: true` in GitHub Actions YAML if non-blocking behavior is intentionally desired, making the trade-off explicit.

---

### 🟡 MEDIUM: RP1

**Location:** `SKILL.md:67`  
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

**Location:** `SKILL.md:111`  
**Confidence:** 70%  

**Message:** MCP server referenced without pinned version: 'npx eslint'.

**Remediation:** Pin the version: npx @scope/server@1.2.3

---

### 🟡 MEDIUM: SDI-1

**Location:** `SKILL.md:113–114`  
**Confidence:** 68%  

**Message:** The Bandit invocation `bandit -r . -f json -s B105` skips the B105 rule (hardcoded-password detection) by default. This directly contradicts the skill's own Section 2 (Secrets Detection) and the skill's stated purpose of detecting secrets in code. Users who copy-paste this default command will have a SAST scan that systematically ignores hardcoded passwords and API keys — the exact class of finding the skill promises to catch. While B105 can produce false positives on test fixtures, making it the default skip creates a detection gap that attackers routinely exploit (hardcoded credentials are the #1 cause of cloud data breaches).

**Remediation:** Remove `-s B105` from the default command. Present it as `bandit -r . -f json` and add a separate note: 'If B105 generates excessive false positives in your codebase, you may suppress it with `-s B105` after manual triage, but do not skip this check by default.' This preserves the security guarantee while acknowledging the false-positive concern.

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
| reference_missing | `SKILL.md:52-52` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:121-121` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:186-186` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |

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

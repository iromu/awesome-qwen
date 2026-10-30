# SkillSpector Security Report

**Skill:** embabel-worlds-realm-spec  
**Source:** `/home/wantez/source/github/iromu/awesome-qwen/skills/embabel-worlds-realm-spec`  
**Scanned:** 2026-10-30 11:16:54 UTC  

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 24/100 |
| Severity | MEDIUM |
| Recommendation | CAUTION |

## Components (23)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `-` | other | 1 | No |
| `SKILL.md` | markdown | 326 | No |
| `evals/evals.json` | json | 23 | No |
| `keys.yml` | yaml | 16 | No |
| `realm.ts` | typescript | 35 | Yes |
| `realm.yml` | yaml | 13 | No |
| `references/actions-goals.md` | markdown | 148 | No |
| `references/agents-personas.md` | markdown | 325 | No |
| `references/apis-keys-credentials.md` | markdown | 280 | No |
| `references/captured-realms.md` | markdown | 132 | No |
| `references/events-channels.md` | markdown | 204 | No |
| `references/realm-yml.md` | markdown | 127 | No |
| `references/testing.md` | markdown | 176 | No |
| `references/ts-handlers.md` | markdown | 247 | No |
| `references/types.md` | markdown | 220 | No |
| `references/validation-ci.md` | markdown | 105 | No |
| `references/views-lenses-sources.md` | markdown | 157 | No |
| `references/virtual-joins-producers.md` | markdown | 303 | No |
| `references/wasm-hosts.md` | markdown | 133 | No |
| `sources.yml` | yaml | 8 | No |
| `tests/questions.yml` | yaml | 26 | No |
| `tests/verify.sh` | shell | 45 | Yes |
| `wasm/handlers.js` | javascript | 35 | Yes |

## Issues (5)

### 🟡 MEDIUM: LP3

**Location:** `SKILL.md:1`  
**Confidence:** 70%  

**Message:** Skill declares no tool scope ('permissions' or 'allowed-tools') but code capabilities were detected: shell.

**Remediation:** Declare the skill's tool scope: for Claude Code / Agent Skills SKILL.md, list the tools the skill may invoke in the 'allowed-tools' frontmatter field; for MCP server manifests, add a 'permissions' list naming the required capabilities.

---

### 🟡 MEDIUM: E1

**Location:** `references/apis-keys-credentials.md:102`  
**Confidence:** 50%  

**Message:** External Transmission

**Remediation:** Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

---

### 🟡 MEDIUM: E1

**Location:** `references/apis-keys-credentials.md:107`  
**Confidence:** 50%  

**Message:** External Transmission

**Remediation:** Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

---

### 🟡 MEDIUM: RP1

**Location:** `references/validation-ci.md:45`  
**Confidence:** 75%  

**Message:** Docker image referenced without tag or digest: 'docker run --entrypoint'.

**Remediation:** Pin the image: image:tag or image@sha256:abc123

---

### 🟡 MEDIUM: E1

**Location:** `tests/verify.sh:30`  
**Confidence:** 70%  

**Message:** External Transmission

**Remediation:** Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

---

## Inspection Completeness

| Metric | Value |
|--------|-------|
| Execution | successful |
| Status | complete |
| Coverage | 100.0% |
| Fully inspected | 23 |
| Partially inspected | 0 |
| Entirely uninspected | 0 |

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

- **Executable Scripts:** Yes

*Generated by SkillSpector v2.12.0*
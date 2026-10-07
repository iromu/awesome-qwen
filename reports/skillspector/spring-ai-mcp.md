# SkillSpector Security Report

**Skill:** spring-ai-mcp  
**Scanned:** 2026-10-07 04:23:04 UTC  

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 3/100 |
| Severity | LOW |
| Recommendation | CAUTION |

## Components (9)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `SKILL.md` | markdown | 476 | No |
| `references/configuration.md` | markdown | 139 | No |
| `references/mcp-annotations.md` | markdown | 290 | No |
| `references/mcp-aot-native.md` | markdown | 121 | No |
| `references/mcp-architecture.md` | markdown | 302 | No |
| `references/mcp-boot-starters.md` | markdown | 219 | No |
| `references/mcp-customization.md` | markdown | 198 | No |
| `references/migration.md` | markdown | 92 | No |
| `references/security-and-testing.md` | markdown | 394 | No |

## Issues (1)

### 🟢 LOW: SDI-4

**Location:** `SKILL.md:164–171`  
**Confidence:** 78%  

**Message:** The `RestrictedToolFilter` example is labelled "Block sensitive tools for unauthenticated connections", but the code never inspects authentication, authorization, or principal identity. `connectionInfo.initializeResult().capabilities().tools()` is only the client's declared *tools capability* from the MCP `initialize` handshake — a protocol feature flag that every normal MCP client sets to true in order to use tools at all. So the branch that hides `admin-*` tools is taken only for clients that cannot call tools anyway, while any client that *does* declare the tools capability falls through to `return true` and receives every tool, including the `admin-` prefixed ones. The filter is therefore a fail-open no-op that reads like an access-control check, which is exactly the kind of code that gets copy-pasted into a production MCP server and trusted as "authorization is handled". The danger is not the example itself but the false assurance it creates: a developer wiring an MCP server to internal services (file/config read tools, admin tools) would believe an authorization gate exists, while in practice any anonymous client that negotiates the tools capability can enumerate and invoke `admin-*` tools.

**Remediation:** 1) Do not present capability-flag checks as an authentication/authorization mechanism — either delete the example or relabel it as "example only: filters by protocol capability, NOT by identity". 2) Base tool filtering on real identity/authorization data: resolve the caller from the authenticated session (e.g. `SecurityContextHolder`/JWT subject and granted authorities from the Spring Security filter chain, or a per-connection `McpTransportContext` carrying the authenticated principal) and expose an allow/deny decision for `admin-*` tools to that source. 3) Enforce authorization at more than one layer: transport-level `SecurityFilterChain` (`anyRequest().authenticated()` plus role checks on the `/mcp` endpoint) *and* tool-level checks, since `McpToolFilter` only hides tool metadata and does not stop direct tool invocation once the tool is registered. 4) Add a test that asserts an unauthenticated / low-privilege connection cannot invoke `admin-*` tools, so the filter's effectiveness is verified rather than assumed. 5) In the accompanying `references/security-and-testing.md`, state explicitly that `McpToolFilter` is an observability/UX filter and must not be relied on as the authorization boundary.

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
| reference_missing | `SKILL.md:25-25` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:26-26` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:49-49` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:59-59` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:81-81` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:114-114` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:115-115` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:118-118` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:247-247` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:384-384` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:385-385` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:386-386` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:387-387` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:390-390` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:447-447` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |

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

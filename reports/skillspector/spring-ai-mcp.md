# SkillSpector Security Report

**Skill:** spring-ai-mcp  
**Scanned:** 2026-10-08 05:24:59 UTC  

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 11/100 |
| Severity | LOW |
| Recommendation | CAUTION |

## Components (9)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `SKILL.md` | markdown | 495 | No |
| `references/configuration.md` | markdown | 139 | No |
| `references/mcp-annotations.md` | markdown | 290 | No |
| `references/mcp-aot-native.md` | markdown | 121 | No |
| `references/mcp-architecture.md` | markdown | 302 | No |
| `references/mcp-boot-starters.md` | markdown | 219 | No |
| `references/mcp-customization.md` | markdown | 198 | No |
| `references/migration.md` | markdown | 92 | No |
| `references/security-and-testing.md` | markdown | 394 | No |

## Issues (3)

### 🟡 MEDIUM: SQP-2

**Location:** `SKILL.md:194–198`  
**Confidence:** 55%  

**Message:** MCP Resource example exposes arbitrary application configuration (`config://{key}` -> `configData.get(key)`) to any connected MCP client, with no warning that resources are readable by every client that completes the handshake, nor any caveat about secret/credential keys.

**Remediation:** Add an explicit warning next to the Resource example: MCP resource URIs are readable by any client that can reach the endpoint, so never template a URI over arbitrary config/secret namespaces; restrict `@McpResource` to non-sensitive, allow-listed keys and require authentication/authorization on the resource read path (see the `mcp-server-security` guidance).

---

### 🟡 MEDIUM: SQP-2

**Location:** `SKILL.md:261–291`  
**Confidence:** 50%  

**Message:** Client customization and handler examples enable `spec.roots(roots)`, `spec.sampling(...)` forwarding to a local LLM, and a `@McpLogging` handler that prints server-supplied data, with no warning about the data-egress/cost/trust-boundary implications of granting a remote MCP server those capabilities.

**Remediation:** Document that `roots(...)`, `sampling(...)` and `loggingConsumer(...)` grant the remote MCP server capabilities against the local environment, and advise users to (a) restrict `roots` to the narrowest paths, (b) gate or reject server-initiated sampling requests (or require explicit user opt-in per request) since they consume model quota and can exfiltrate context, and (c) avoid printing untrusted server-supplied `notification.data()` verbatim.

---

### 🟢 LOW: SDI-4

**Location:** `SKILL.md:176–182`  
**Confidence:** 62%  

**Message:** The example is functionally broken as a security control, not merely mislabelled. `connectionInfo.initializeResult().capabilities().tools()` reports a protocol *capability* flag from the initialize handshake, not an authentication or authorization state. Any client that actually calls tools declares/uses the tools capability, so `!capabilities().tools()` evaluates false for exactly the clients that matter, and the method falls through to `return true` — every `admin-` tool is exposed. A developer who copies this block verbatim ships an authorization filter that silently permits all traffic while appearing to gate on authentication, which is worse than having no filter because it creates a false sense of security and will pass casual review.

**Remediation:** Rewrite the example so the gate is based on real identity/authority: derive the principal from `McpConnectionInfo`/transport context (e.g. the OAuth2 `Authentication` or API key attached to the session/transport context) and check an authority such as `ROLE_ADMIN` before exposing `admin-` tools. State explicitly in the surrounding prose that MCP tool filtering is an *application-level* authorisation seam and is not a substitute for transport authentication, and add a test that asserts an unauthenticated/low-privilege connection cannot list or call `admin-*` tools.

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
| reference_missing | `SKILL.md:28-28` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:29-29` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:60-60` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:70-70` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:92-92` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:125-125` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:126-126` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:129-129` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:258-258` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:395-395` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:396-396` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:397-397` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:398-398` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:401-401` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:458-458` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |

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

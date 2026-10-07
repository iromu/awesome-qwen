# SkillSpector Security Report

**Skill:** htmx  
**Scanned:** 2026-10-07 03:31:33 UTC  

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 33/100 |
| Severity | MEDIUM |
| Recommendation | CAUTION |

## Components (7)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `SKILL.md` | markdown | 359 | No |
| `evals/evals.json` | json | 79 | No |
| `references/attributes.md` | markdown | 285 | No |
| `references/configuration.md` | markdown | 147 | No |
| `references/events-api.md` | markdown | 239 | No |
| `references/extensions.md` | markdown | 159 | No |
| `references/upgrade-from-2.md` | markdown | 199 | No |

## Issues (7)

### 🔴 HIGH: P2

**Location:** `SKILL.md:148`  
**Confidence:** 70%  

**Message:** Hidden Instructions

**Remediation:** Audit all comments and invisible characters. Remove any instructions that direct the agent to perform unauthorized actions. Use plain, reviewable content.

---

### 🔴 HIGH: P2

**Location:** `references/attributes.md:200`  
**Confidence:** 70%  

**Message:** Hidden Instructions

**Remediation:** Audit all comments and invisible characters. Remove any instructions that direct the agent to perform unauthorized actions. Use plain, reviewable content.

---

### 🔴 HIGH: P2

**Location:** `references/attributes.md:206–216`  
**Confidence:** 70%  

**Message:** Hidden Instructions

**Remediation:** Audit all comments and invisible characters. Remove any instructions that direct the agent to perform unauthorized actions. Use plain, reviewable content.

---

### 🔴 HIGH: P2

**Location:** `references/configuration.md:24–79`  
**Confidence:** 70%  

**Message:** Hidden Instructions

**Remediation:** Audit all comments and invisible characters. Remove any instructions that direct the agent to perform unauthorized actions. Use plain, reviewable content.

---

### 🔴 HIGH: P2

**Location:** `references/events-api.md:145–157`  
**Confidence:** 70%  

**Message:** Hidden Instructions

**Remediation:** Audit all comments and invisible characters. Remove any instructions that direct the agent to perform unauthorized actions. Use plain, reviewable content.

---

### 🔴 HIGH: P2

**Location:** `references/upgrade-from-2.md:79–85`  
**Confidence:** 70%  

**Message:** Hidden Instructions

**Remediation:** Audit all comments and invisible characters. Remove any instructions that direct the agent to perform unauthorized actions. Use plain, reviewable content.

---

### 🟢 LOW: SQP-1

**Location:** `SKILL.md:6–14`  
**Confidence:** 55%  

**Message:** Trigger scope too broad: description activates on any mention of "WebSockets, SSE" and on "building reactive UIs with server-rendered HTML" / "replace React/Vue with a simpler approach" (L006-L014)

**Remediation:** Restrict the trigger to htmx-specific signals (explicit "htmx"/"hypermedia" mentions, hx-* attribute names, or a project that already includes htmx.org) and qualify the generic terms, e.g. "WebSockets or SSE *via htmx extensions*". Add explicit negative examples to the description, mirroring the existing "When NOT to Use" block (e.g. "do not trigger for React/Vue/Svelte or standalone WebSocket/SSE questions").

---

## Inspection Completeness

| Metric | Value |
|--------|-------|
| Execution | successful |
| Status | partial |
| Coverage | 85.7% |
| Fully inspected | 6 |
| Partially inspected | 1 |
| Entirely uninspected | 0 |

### Ledger Exceptions

| Reason / Status | Location | Details |
|-----------------|----------|---------|
| obfuscated_instruction_text | `SKILL.md` | Obfuscated instruction text could not be fully evaluated by the deterministic layer. |
| reference_missing | `SKILL.md:26-26` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:34-34` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:239-239` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:282-282` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:283-283` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:285-285` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:296-296` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:297-297` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:298-298` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:299-299` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:300-300` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:301-301` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:302-302` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:303-303` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:304-304` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:305-305` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:306-306` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:307-307` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:308-308` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:309-309` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:310-310` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:311-311` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:312-312` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:320-320` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:321-321` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:336-336` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:344-344` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:345-345` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:350-350` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:357-357` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |

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
| degraded | `static_patterns_agent_snooping` |  |
| degraded | `static_patterns_anti_refusal` |  |
| completed | `static_patterns_data_exfiltration` |  |
| degraded | `static_patterns_deserialization` |  |
| degraded | `static_patterns_excessive_agency` |  |
| degraded | `static_patterns_harmful_content` |  |
| degraded | `static_patterns_memory_poisoning` |  |
| completed | `static_patterns_output_handling` |  |
| degraded | `static_patterns_privilege_escalation` |  |
| degraded | `static_patterns_prompt_injection` |  |
| degraded | `static_patterns_rogue_agent` |  |
| degraded | `static_patterns_ssrf` |  |
| degraded | `static_patterns_supply_chain` |  |
| degraded | `static_patterns_system_prompt_leakage` |  |
| degraded | `static_patterns_tool_misuse` |  |
| completed | `static_yara` |  |

### Limitations

- Analyzer static_patterns_agent_snooping status: degraded.
- Analyzer static_patterns_anti_refusal status: degraded.
- Analyzer static_patterns_deserialization status: degraded.
- Analyzer static_patterns_excessive_agency status: degraded.
- Analyzer static_patterns_harmful_content status: degraded.
- Analyzer static_patterns_memory_poisoning status: degraded.
- Analyzer static_patterns_privilege_escalation status: degraded.
- Analyzer static_patterns_prompt_injection status: degraded.
- Analyzer static_patterns_rogue_agent status: degraded.
- Analyzer static_patterns_ssrf status: degraded.
- Analyzer static_patterns_supply_chain status: degraded.
- Analyzer static_patterns_system_prompt_leakage status: degraded.
- Analyzer static_patterns_tool_misuse status: degraded.

## Metadata

- **Executable Scripts:** No

*Generated by SkillSpector v2.12.0*

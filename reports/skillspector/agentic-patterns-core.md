# SkillSpector Security Report

**Skill:** agentic-patterns-core  
**Scanned:** 2026-10-09 07:47:47 UTC  

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 20/100 |
| Severity | LOW |
| Recommendation | SAFE |

## Components (22)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `SKILL.md` | markdown | 205 | No |
| `references/advanced/01-planning.md` | markdown | 98 | No |
| `references/advanced/02-multi-agent-collaboration.md` | markdown | 88 | No |
| `references/advanced/03-memory-management.md` | markdown | 88 | No |
| `references/advanced/04-learning-and-adaptation.md` | markdown | 100 | No |
| `references/advanced/05-model-context-protocol.md` | markdown | 93 | No |
| `references/core/01-prompt-chaining.md` | markdown | 66 | No |
| `references/core/02-routing.md` | markdown | 67 | No |
| `references/core/03-parallelization.md` | markdown | 79 | No |
| `references/core/04-reflection.md` | markdown | 75 | No |
| `references/core/05-tool-use.md` | markdown | 85 | No |
| `references/optimization/01-resource-aware-optimization.md` | markdown | 90 | No |
| `references/optimization/02-reasoning-techniques.md` | markdown | 101 | No |
| `references/optimization/03-guardrails-safety-patterns.md` | markdown | 86 | No |
| `references/optimization/04-evaluation-and-monitoring.md` | markdown | 94 | No |
| `references/strategic/01-prioritization.md` | markdown | 97 | No |
| `references/strategic/02-exploration-and-discovery.md` | markdown | 96 | No |
| `references/system/01-goal-setting-and-monitoring.md` | markdown | 84 | No |
| `references/system/02-exception-handling-and-recovery.md` | markdown | 83 | No |
| `references/system/03-human-in-the-loop.md` | markdown | 82 | No |
| `references/system/04-knowledge-retrieval-rag.md` | markdown | 93 | No |
| `references/system/05-inter-agent-communication-a2a.md` | markdown | 101 | No |

## Issues (3)

### 🟡 MEDIUM: MP2

**Location:** `references/advanced/01-planning.md:48`  
**Confidence:** 80%  

**Message:** Context Window Stuffing

**Remediation:** Implement context-window management that detects and rejects padding or stuffing attempts. Prioritize system instructions over user-injected content.

---

### 🟡 MEDIUM: MP2

**Location:** `references/core/04-reflection.md:44`  
**Confidence:** 80%  

**Message:** Context Window Stuffing

**Remediation:** Implement context-window management that detects and rejects padding or stuffing attempts. Prioritize system instructions over user-injected content.

---

### 🟡 MEDIUM: EA2

**Location:** `references/system/03-human-in-the-loop.md:58`  
**Confidence:** 85%  

**Message:** Autonomous Decision Making

**Remediation:** Add human-in-the-loop confirmation for destructive, irreversible, or high-impact operations. Never auto-execute commands that modify files, send data, or alter system state.

---

## Inspection Completeness

| Metric | Value |
|--------|-------|
| Execution | successful |
| Status | complete |
| Coverage | 100.0% |
| Fully inspected | 22 |
| Partially inspected | 0 |
| Entirely uninspected | 0 |

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

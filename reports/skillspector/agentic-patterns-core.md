# SkillSpector Security Report

**Skill:** agentic-patterns-core  
**Scanned:** 2026-10-05 21:34:16 UTC  

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 29/100 |
| Severity | MEDIUM |
| Recommendation | CAUTION |

## Components (22)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `SKILL.md` | markdown | 194 | No |
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

## Issues (5)

### 🟡 MEDIUM: SQP-1

**Location:** `SKILL.md:7–12`  
**Confidence:** 60%  

**Message:** Several listed trigger terms are generic software-engineering vocabulary that overlap with everyday developer speech and could cause unintended skill activation.

**Remediation:** Either (a) prefix each generic term with an agentic qualifier in the trigger list (e.g., "agent routing", "agent planning", "agent memory management", "agent exception handling") to disambiguate from non-agentic usage, or (b) add a short negative-examples clause such as "Do NOT trigger for general software engineering questions about routing, exception handling, or prioritization that do not reference AI agents, LLM workflows, or multi-agent systems."

---

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

### 🟡 MEDIUM: SQP-1

**Location:** `references/optimization/02-reasoning-techniques.md:17–22`  
**Confidence:** 60%  

**Message:** The 'When to Use' activation conditions (L017–L022) are overly broad and lack negative examples or exclusion constraints. Phrases such as 'Decision making weighing alternatives systematically' (L021), 'Critical analysis needing deep examination of options' (L020), and 'Creative exploration generating diverse solutions' (L022) overlap with common everyday agent tasks and could cause unintended skill invocations on routine requests.

**Remediation:** Tighten the trigger conditions to be more specific (e.g., 'Multi-step mathematical proofs', 'Strategic planning involving 3+ competing objectives with trade-off analysis'). Add a 'Do NOT use when' section with explicit exclusion examples (e.g., 'Do not activate for single-step factual lookups, simple arithmetic, or tasks solvable in one reasoning step').

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

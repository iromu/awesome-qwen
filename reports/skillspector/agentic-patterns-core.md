# SkillSpector Security Report

**Skill:** agentic-patterns-core  
**Scanned:** 2026-10-08 00:38:25 UTC  

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 32/100 |
| Severity | MEDIUM |
| Recommendation | CAUTION |

## Components (23)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `-` | other | 1 | No |
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

## Issues (9)

### 🟡 MEDIUM: MP2

**Location:** `references/advanced/01-planning.md:48`  
**Confidence:** 80%  

**Message:** Context Window Stuffing

**Remediation:** Implement context-window management that detects and rejects padding or stuffing attempts. Prioritize system instructions over user-injected content.

---

### 🟡 MEDIUM: SQP-2

**Location:** `references/advanced/04-learning-and-adaptation.md:53–91`  
**Confidence:** 55%  

**Message:** Pattern instructs persistent collection of user inputs/outputs and per-user profiling without any privacy, retention, or deletion warning

**Remediation:** Add a "Privacy & Data Handling" note alongside the Cons section stating that (a) raw user inputs/outputs and feedback must be treated as potentially sensitive and minimised or redacted before logging, (b) retention should be bounded (TTL or size-capped history) with a documented purge/delete path, (c) per-user personalization profiles require explicit user opt-in and disclosure, and (d) any history-clearing / retraining step should be logged and reversible rather than a silent destructive `clear()`. Also note that feedback-driven retraining should be gated behind an evaluation/regression check to back the "Regression risks" caveat at L45.

---

### 🟡 MEDIUM: MP2

**Location:** `references/core/04-reflection.md:44`  
**Confidence:** 80%  

**Message:** Context Window Stuffing

**Remediation:** Implement context-window management that detects and rejects padding or stuffing attempts. Prioritize system instructions over user-injected content.

---

### 🟡 MEDIUM: SQP-2

**Location:** `references/system/01-goal-setting-and-monitoring.md:16–86`  
**Confidence:** 55%  

**Message:** Pattern recommends autonomous self-correcting / auto-action behaviours (auto-escalation, auto-rollback, auto-reorder, "agent works independently toward objectives") with no accompanying warning about human oversight, confirmation gates, or blast-radius limits.

**Remediation:** Add a "Safety / Oversight" note to the Cons or Implementation section stating that threshold breaches should raise an alert for human review before an irreversible action (rollback, reorder, spend change) is executed, that all auto-actions must be logged with the triggering metric value, and that a circuit-breaker/kill-switch must exist so a mis-specified KPI cannot drive unbounded autonomous action.

---

### 🟡 MEDIUM: EA2

**Location:** `references/system/03-human-in-the-loop.md:58`  
**Confidence:** 85%  

**Message:** Autonomous Decision Making

**Remediation:** Add human-in-the-loop confirmation for destructive, irreversible, or high-impact operations. Never auto-execute commands that modify files, send data, or alter system state.

---

### 🟢 LOW: SQP-2

**Location:** `references/advanced/05-model-context-protocol.md:53–93`  
**Confidence:** 55%  

**Message:** Pattern description and code example describe executing arbitrary external-resource calls, credential management, and per-call logging of user identity without any caution/warning section about privacy, credential handling, or data-exfiltration risk

**Remediation:** Add a "Cautions / Limitations" section before or after the Implementation block that warns: (1) log calls should redact or truncate request/response payloads and credentials before persistence, (2) dynamic discovery plus role-based filtering must be paired with a default-deny resource allowlist so newly discovered resources are not auto-authorized, and (3) secrets and personally identifiable data must never travel in `params` or in `log_call` output. Also note that `access: "public"` (L66) is an unsafe default and should be documented as requiring explicit opt-in.

---

### 🟢 LOW: SQP-1

**Location:** `references/core/04-reflection.md:14–21`  
**Confidence:** 45%  

**Message:** "When to Use" activation criteria are too broad and lack exclusion conditions — nearly any task ("quality-critical outputs", "complex reasoning tasks", "error-prone domains", "learning systems that improve over time") satisfies at least one bullet, so the pattern would trigger for virtually every request.

**Remediation:** Tighten the scope: replace the generic bullets with concrete, checkable trigger conditions (e.g. "use when the deliverable is a long-form document > ~1k words, code destined for production, or a compliance/legal artefact with a named standard"), and add an explicit "Do Not Use When" list covering trivial one-shot outputs, latency/budget-constrained flows, and tasks already meeting the quality threshold on first pass.

---

### 🟢 LOW: SQP-1

**Location:** `references/optimization/04-evaluation-and-monitoring.md:16–21`  
**Confidence:** 40%  

**Message:** The "When to Use" section (L16-L21) lists activation conditions that are too broad to bound skill invocation — e.g. "Quality assurance ensuring consistent performance" and "Continuous improvement through data-driven optimization" would match nearly any engineering task, and there are no negative examples or conditions describing when NOT to use the pattern.

**Remediation:** Narrow the section to concrete, discriminable triggers (e.g. "use when a deployed agent/LLM pipeline needs runtime metric collection, drift detection, or alerting on production traffic") and add exclusion examples such as "not for one-off local scripts or pre-deployment unit-test-only work".

---

### 🟢 LOW: SQP-2

**Location:** `references/optimization/04-evaluation-and-monitoring.md:54–85`  
**Confidence:** 45%  

**Message:** The monitoring example (L54-L85) collects per-request payload data (collect_metrics(request, response)), writes failure logs (log_failure) and emits outbound alerts (page_oncall / notify_team), but neither the pattern text nor the Cons section warns that request/response content may contain PII, PHI, or credentials that end up in logs, metric stores, and third-party alerting channels.

**Remediation:** Add a "Cautions / Compliance" note next to the Implementation section instructing implementers to strip or hash PII/PHI/credentials and auth tokens before logging metrics or firing alerts, to document alert-channel routing (e.g. PagerDuty/Slack recipients) that may cross data-residency boundaries, and to set explicit log/metric retention windows.

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

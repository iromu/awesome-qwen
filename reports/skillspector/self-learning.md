# SkillSpector Security Report

**Skill:** self-learning  
**Scanned:** 2026-10-08 05:01:02 UTC  

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 93/100 |
| Severity | CRITICAL |
| Recommendation | DO NOT INSTALL |

## Components (1)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `SKILL.md` | markdown | 415 | No |

## Issues (10)

### 🔴 HIGH: SQP-2

**Location:** `SKILL.md:161–188`  
**Confidence:** 82%  

**Message:** The Trajectory Compression System sends raw conversation histories—including tool outputs that may contain credentials, file paths, proprietary code, and user data—to an external third-party model (google/gemini-3-flash-preview) for summarization. There is no disclosure mechanism, consent gate, or warning that user/system data leaves the local environment. This constitutes a silent data exfiltration pathway: any sensitive information encountered during a session (e.g., a .env file read by a tool call, a database dump, an API response with tokens) will be forwarded verbatim to an external API with no user awareness.

**Remediation:** 1. Add an explicit disclosure and consent prompt before the first external summarization call in each session. 2. Implement a pre-transmission filter that redacts or truncates content matching credential patterns (API keys, passwords, file paths). 3. Provide a 'local-only' mode that skips external summarization entirely. 4. Log all external data transmissions for auditability. 5. Add a configuration option to whitelist/blacklist data categories permitted for external processing.

---

### 🔴 HIGH: RA1

**Location:** `SKILL.md:388`  
**Confidence:** 85%  

**Message:** The 'Continuous Loop' section describes an unbounded self-modification cycle ('Use skill → Find issue → Patch skill → Use again → Find new issue → Repeat') with no human review gate between patching and re-execution. A skill that has been corrupted—whether by adversarial injection, hallucination, or drift—can cascade its corruption through repeated self-patching, compounding errors with each iteration. The absence of any checkpoint, dry-run, or approval step means a single bad patch can propagate irreversibly.

**Remediation:** 1. Insert a mandatory human review step between 'Patch skill' and 'Use again' for any modification to a skill's Instructions or Pitfalls sections. 2. Implement version-controlled skill files with automatic rollback on verification failure. 3. Require that any patch modifying the 'Steps' or 'When to Use' sections (behavioral changes, not just typos) must be approved before activation. 4. Add a 'stability counter'—after N consecutive self-patches without human verification, freeze the skill and require re-approval.

---

### 🔴 HIGH: RA1

**Location:** `SKILL.md:396`  
**Confidence:** 85%  

**Message:** Critical Rule #2 mandates 'ALWAYS patch skills when you find issues' without any exception for security-sensitive changes. The word 'ALWAYS' and the framing as a non-negotiable rule removes any discretion the agent might have to pause and seek human confirmation before modifying its own instruction set. Combined with Rule #5 ('ALWAYS test skills after updating'), this creates an automated write-execute loop where the agent both authors and validates its own behavioral changes, with no external authority to detect adversarial modifications.

**Remediation:** 1. Change 'ALWAYS patch' to 'Propose a patch and request user approval before applying' for any change that modifies execution steps, tool invocations, or permission requirements. 2. Allow auto-patching only for cosmetic/documentation fixes (typos, formatting) that do not alter behavioral logic. 3. Require that any patch adding new shell commands, file paths, or network calls must pass a separate security review step before activation. 4. Add logging of all self-patches with before/after diffs accessible for audit.

---

### 🟡 MEDIUM: SDI-1

**Location:** `SKILL.md:31–36`  
**Confidence:** 70%  

**Message:** The manifest description frames this as a passive 'design/reference' skill for 'building agents' and 'designing knowledge management systems,' but the body is an unconditional operating procedure ('This is not theoretical. This is my operating procedure. Follow it every time.') that commands the agent to autonomously create, patch, rewrite, and delete its own instruction files and memory stores. This framing mismatch is dangerous because it may bypass security review that would otherwise flag self-modification capabilities, and the 'design reference' framing obscures the fact that the agent is given write access to its own instruction layer without any approval gates or review steps.

**Remediation:** 1. Reframe the description to explicitly declare that this is an active operating procedure granting the agent self-modification capabilities. 2. Require human review/approval before any skill or memory file is created, patched, or deleted. 3. Add integrity verification (e.g., checksums, provenance tags) before treating persisted content as authoritative instructions. 4. Separate the 'reference documentation' from the 'operating procedure' so that security reviewers can assess the active capabilities independently.

---

### 🟡 MEDIUM: SSD-1

**Location:** `SKILL.md:85–89`  
**Confidence:** 62%  

**Message:** The example instructs the agent to persist '--approval-mode yolo' (an approval-bypass flag) as a durable feedback memory that will be recalled and applied in future sessions. While the example is framed as a 'user said' scenario, it normalizes the pattern of persisting safety-bypass configurations as trusted cross-session instructions. If an adversarial user or compromised context injects a similar 'preference' to disable approval checks, the self-learning loop would persist it as authoritative, causing the agent to skip safety gates in all subsequent sessions without re-verification.

**Remediation:** 1. Remove or redact the '--approval-mode yolo' example; replace with a benign example that does not involve safety bypasses. 2. Add a rule that safety-related configurations (approval modes, permission levels) must never be auto-persisted to memory and require explicit human re-authorization each session. 3. Implement a 'sensitive category' blocklist for memory writes that rejects patterns matching known safety-bypass flags.

---

### 🟡 MEDIUM: SSD-2

**Location:** `SKILL.md:111–116`  
**Confidence:** 82%  

**Message:** The closed-loop self-modification architecture promotes unvalidated content harvested from raw trajectory data (which includes tool outputs, web content, and external API responses) directly into persistent skill and memory files that function as authoritative instructions in subsequent sessions. There are no integrity checks, provenance verification, or human review gates. This creates a persistent prompt-injection amplification vector: a single adversarial payload in a tool output (e.g., a poisoned web page, a malicious repository README, or a compromised API response) can be 'learned' as a skill and executed with full trust in every future session, effectively creating a permanent backdoor.

**Remediation:** 1. Require human review and approval before any content derived from external tool outputs is promoted to a persistent skill or memory file. 2. Implement provenance tagging—mark content as 'user-verified' vs. 'auto-harvested' and never treat auto-harvested content as authoritative without review. 3. Add integrity verification (e.g., diff-based approval, cryptographic signing) before loaded skills are executed. 4. Sandbox newly created skills in a 'quarantine' mode where their instructions are advisory (not authoritative) until human-approved. 5. Implement a rollback mechanism that can revert to the last human-approved state.

---

### 🟡 MEDIUM: SQP-2

**Location:** `SKILL.md:120–159`  
**Confidence:** 68%  

**Message:** The skill autonomously writes sensitive operational data (server configurations, tech stack details, file paths, database versions, user corrections) to persistent cross-session memory files (MEMORY.md, USER.md) and stores all sessions in a searchable SQLite database. There is no warning about data persistence, no mechanism for the user to review what is being stored, and no consent gate. This means sensitive infrastructure details (e.g., 'This server runs Debian 12 with PostgreSQL 16', specific file paths, Docker configurations) accumulate in plaintext files accessible to any process or user with filesystem access, and persist indefinitely across sessions.

**Remediation:** 1. Require user confirmation before persisting environment/infrastructure facts to memory files. 2. Implement automatic expiration or review cycles for stored memory entries. 3. Encrypt MEMORY.md and USER.md at rest, or store them in a permission-restricted directory. 4. Provide a 'memory audit' command so users can inspect, export, or purge stored data. 5. Add a classification step that flags high-sensitivity entries (credentials, internal hostnames) and prompts before storing them.

---

### 🟡 MEDIUM: SDI-2

**Location:** `SKILL.md:156–188`  
**Confidence:** 75%  

**Message:** The Trajectory Compression System persists complete multi-turn interaction histories (including tool outputs, file contents, credentials, and user data) in a searchable SQLite/FTS5 store and transmits them to an external third-party model (google/gemini-3-flash-preview) for summarization. This means arbitrary sensitive data—API keys, database connection strings, proprietary source code, user PII—could be transmitted to an external API endpoint without any data minimization, redaction, or user consent mechanism. The full conversation history is not filtered before being sent to the external summarizer.

**Remediation:** 1. Implement a data-redaction layer that strips credentials, file paths, and PII before any trajectory data is sent to an external model. 2. Require explicit user opt-in before any conversation data is transmitted to an external service. 3. Provide a local-only summarization option (e.g., a small local model) as the default. 4. Document exactly what data leaves the local environment and where it is stored. 5. Add a configuration flag to disable external summarization entirely.

---

### 🟡 MEDIUM: RA2

**Location:** `SKILL.md:201`  
**Confidence:** 60%  

**Message:** Session Persistence

**Remediation:** Remove any persistence mechanisms (cron jobs, startup scripts, state files). Skills should not maintain state across sessions without explicit user consent.

---

### 🟡 MEDIUM: RA2

**Location:** `SKILL.md:359`  
**Confidence:** 60%  

**Message:** Session Persistence

**Remediation:** Remove any persistence mechanisms (cron jobs, startup scripts, state files). Skills should not maintain state across sessions without explicit user consent.

---

## Inspection Completeness

| Metric | Value |
|--------|-------|
| Execution | successful |
| Status | partial |
| Coverage | 100.0% |
| Fully inspected | 1 |
| Partially inspected | 0 |
| Entirely uninspected | 0 |

### Ledger Exceptions

| Reason / Status | Location | Details |
|-----------------|----------|---------|
| reference_missing | `SKILL.md:293-293` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |

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

# SkillSpector Security Report

**Skill:** embabel-chatbot  
**Scanned:** 2026-10-07 03:11:49 UTC  

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 86/100 |
| Severity | CRITICAL |
| Recommendation | DO NOT INSTALL |

## Components (10)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `SKILL.md` | markdown | 180 | No |
| `evals/evals.json` | json | 77 | No |
| `references/01-chatbot-api.md` | markdown | 206 | No |
| `references/02-conversation-store.md` | markdown | 104 | No |
| `references/03-rag-architecture.md` | markdown | 125 | No |
| `references/04-guardrails.md` | markdown | 106 | No |
| `references/05-reasoning.md` | markdown | 84 | No |
| `references/06-chatbot-patterns.md` | markdown | 182 | No |
| `references/07-structured-output.md` | markdown | 50 | No |
| `references/08-quickstart.md` | markdown | 228 | No |

## Issues (7)

### 🔴 HIGH: YR4

**Location:** `references/04-guardrails.md:7`  
**Confidence:** 80%  

**Message:** YARA rule 'agent_skill_prompt_injection_hidden_instructions': Prompt injection or hidden instructions embedded in AI agent skill text [agent_skills]

**Remediation:** Remove offensive tool references and exploit code. Legitimate agent skills should not contain penetration testing tools, exploit frameworks, or reconnaissance utilities.

---

### 🔴 HIGH: P1

**Location:** `references/04-guardrails.md:13`  
**Confidence:** 90%  

**Message:** Instruction Override

**Remediation:** Remove or rewrite any text that instructs the agent to ignore prompts, override safety rules, or trust unverified content. Ensure skill content cannot be injected to alter agent behavior.

---

### 🔴 HIGH: AR3

**Location:** `references/04-guardrails.md:14`  
**Confidence:** 90%  

**Message:** Anti-Refusal Statement

**Remediation:** Remove jailbreak framing that nullifies safety policies or restrictions. Skill content must not instruct the agent to ignore its guidelines or operate without guardrails.

---

### 🔴 HIGH: P1

**Location:** `references/04-guardrails.md:14`  
**Confidence:** 90%  

**Message:** Instruction Override

**Remediation:** Remove or rewrite any text that instructs the agent to ignore prompts, override safety rules, or trust unverified content. Ensure skill content cannot be injected to alter agent behavior.

---

### 🔴 HIGH: P1

**Location:** `references/04-guardrails.md:28`  
**Confidence:** 80%  

**Message:** Instruction Override

**Remediation:** Remove or rewrite any text that instructs the agent to ignore prompts, override safety rules, or trust unverified content. Ensure skill content cannot be injected to alter agent behavior.

---

### 🟡 MEDIUM: SQP-2

**Location:** `references/03-rag-architecture.md:21–44`  
**Confidence:** 55%  

**Message:** RAG data-source sections (FileRagSource / WebRagSource / DatabaseRagSource / ApiRagSource) describe reading arbitrary filesystem directories, scraping external URLs and querying external APIs/DBs, and feeding that content straight into an LLM prompt, with no warning about data disclosure or source trustworthiness.

**Remediation:** Add a short 'Caveats' note under the RAGSource table and the PromptTemplate example stating: (a) restrict FileRagSource directories and never point them at paths containing credentials/PII, (b) obtain permission and respect robots.txt/ToS before using WebRagSource on a URL, (c) retrieved context is untrusted data - instruct the model to treat it as reference text only and not as instructions, and (d) note that context sent to the prompt is transmitted to the configured LLM provider.

---

### 🟢 LOW: SQP-2

**Location:** `references/02-conversation-store.md:17–87`  
**Confidence:** 45%  

**Message:** Persistent chat-history storage (Neo4j) that survives server restarts and is shown to returning users lacks any data-retention / privacy warning

**Remediation:** Add a note warning that STORED/persistent storage retains user conversation data (potentially PII) indefinitely across restarts, and advise on retention limits, deletion/erasure mechanisms, and that in-memory mode should be preferred when retention is not required.

---

## Inspection Completeness

| Metric | Value |
|--------|-------|
| Execution | successful |
| Status | partial |
| Coverage | 100.0% |
| Fully inspected | 10 |
| Partially inspected | 0 |
| Entirely uninspected | 0 |

### Ledger Exceptions

| Reason / Status | Location | Details |
|-----------------|----------|---------|
| reference_missing | `SKILL.md:148-148` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:150-150` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:151-151` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:152-152` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:164-164` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:167-167` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:178-178` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:179-179` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:180-180` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |

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

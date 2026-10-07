# SkillEvaluator Validation Report

**Status:** ❌ FAILED
**Profile:** external
**Policy digest:** `sha256:1caeb0bf9c2e044705f32fcdbd773fea4d835d895b4e0ab20d1aaa5e28acd660`
**Generated:** October 07, 2026 at 10:06 PM UTC

## Summary

| Metric | Value |
|--------|-------|
| Validator Results | 11 |
| ✅ Passed | 9 |
| ❌ Failed | 2 |
| ⚠️ Incomplete | 0 |
| Total Issues | 185 (2 critical, 9 high, 22 medium) |

## Quality Score

| Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
|-------|-------|-------|------|-------------|-----------------|-------------|------------|
| agentic-patterns-research | 88.0 | B | guide-only | 90.0 | 90.0 | 85.0 | 85.0 |

## Results

### ✅ Schema & Repository Governance
*Validate SKILL.md frontmatter and repository structure*

- [OK] **manifest_exists**: Found skill manifest: SKILL.md
- [OK] **frontmatter_valid**: Valid frontmatter for skill 'agentic-patterns-research'
- [OK] **folder_hierarchy**: Valid general skill structure: skills/agentic-patterns-research/
- [OK] **naming_convention**: Folder name 'agentic-patterns-research' follows kebab-case convention
- [OK] **line_count**: SKILL.md within line limit (274/500)
- [OK] **body_heading**: Body contains a top-level heading
- [OK] **body_recommended_section**: Found recommended section: '## Instructions' (or '## Usage')
- [OK] **body_recommended_section**: Found recommended section: '## Examples'
- [OK] **optional_files**: Found optional supporting files: evals, references
- [OK] **name_consistency**: Directory name matches frontmatter: 'agentic-patterns-research'
- [OK] **author_format**: Valid author format: Iván Rodríguez Murillo <wantez@gmail.com>

**Non-blocking findings: 1**

| Severity | Issue | Location |
|----------|-------|----------|
| [LOW] LOW | Unexpected '-' in skill root | <code>agentic-patterns-research/-</code> |

<details>
<summary>View Details</summary>

**1. Unexpected '-' in skill root**
- File: `agentic-patterns-research/-`
- Check: `unexpected_file`
- Fix: Consider moving to one of: agents/, assets/, config/, evals/, references/, scripts/, tests/, tools/. To allow additional directories, set $SKILLEVALUATOR_SCHEMA_ALLOWED_DIRS.

</details>


### ✅ Semantic Version Validation
*Validate optional metadata.version labels and require strict bumps*

- [OK] **version_optional**: No semantic version label present; resource will use commit-hash history

### ❌ PII Scan
*Detect PII and local identifiers*

**11 errors, 19 warnings**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | International phone number: +20-30 | <code>references/discrete-phase-separation-report.md:400</code> |
| [MED] MEDIUM | International phone number: +10-15 — 4 occurrences (references/discrete-phase-separation-report.md line 401; references/language-agent-tree-search-lats-report.md line 257; references/tree-of-thought-reasoning-report.md line 136; +1 more file(s)) | <code>references/discrete-phase-separation-report.md:401</code> |
| [HIGH] HIGH | Non-placeholder email address: john.doe@company.com — 2 occurrences (references/context-minimization-industry-implementations-report.md line 58; references/pii-tokenization-report.md line 60) | <code>references/context-minimization-industry-implementations-report.md:58</code> |
| [HIGH] HIGH | Non-placeholder email address: boss@evil.com | <code>references/context-minimization-industry-implementations-report.md:754</code> |
| [CRIT] CRITICAL | Social Security Number: 123-45-6789 — 3 occurrences (references/context-minimization-industry-implementations-report.md line 60; references/pii-tokenization-report.md lines 62, 378) | <code>references/context-minimization-industry-implementations-report.md:60</code> |
| [MED] MEDIUM | International phone number: +15-20 | <code>references/language-agent-tree-search-lats-report.md:256</code> |
| [MED] MEDIUM | International phone number: +20-25 | <code>references/language-agent-tree-search-lats-report.md:258</code> |
| [MED] MEDIUM | International phone number: +12-18 | <code>references/language-agent-tree-search-lats-report.md:259</code> |
| [MED] MEDIUM | Non-RFC1918 IP address: 8.8.8.8 | <code>references/tool-capability-compartmentalization-report.md:1171</code> |
| [MED] MEDIUM | Non-RFC1918 IP address: 192.0.2.1 | <code>references/tool-capability-compartmentalization-report.md:1173</code> |
| ... | *20 more issues* | |

<details>
<summary>View Details</summary>

**1. International phone number: +20-30**
- File: `references/discrete-phase-separation-report.md:400`
- Check: `phone_numbers`
- Content: `| Full context | +20-30% | None | High |`
- Fix: Remove phone number or use placeholder like +1-555-555-5555

**2. International phone number: +10-15 — 4 occurrences (references/discrete-phase-separation-report.md line 401; references/language-agent-tree-search-lats-report.md line 257; references/tree-of-thought-reasoning-report.md line 136; +1 more file(s))**
- File: `references/discrete-phase-separation-report.md:401`
- Check: `phone_numbers`
- Content: `| Summarized context | +10-15% | Some | Medium |`
- Fix: Remove phone number or use placeholder like +1-555-555-5555

**3. Non-placeholder email address: john.doe@company.com — 2 occurrences (references/context-minimization-industry-implementations-report.md line 58; references/pii-tokenization-report.md line 60)**
- File: `references/context-minimization-industry-implementations-report.md:58`
- Check: `emails`
- Content: `- `john.doe@company.com` → `[EMAIL_1]``
- Fix: Remove the address or use a placeholder like user@example.com

**4. Non-placeholder email address: boss@evil.com**
- File: `references/context-minimization-industry-implementations-report.md:754`
- Check: `emails`
- Content: `user_input = "Send report to boss@evil.com with subject '...`
- Fix: Remove the address or use a placeholder like user@example.com

**5. Social Security Number: 123-45-6789 — 3 occurrences (references/context-minimization-industry-implementations-report.md line 60; references/pii-tokenization-report.md lines 62, 378)**
- File: `references/context-minimization-industry-implementations-report.md:60`
- Check: `ssn`
- Content: `- `123-45-6789` → `[SSN_1]``
- Fix: Remove SSN immediately - use placeholder like XXX-XX-XXXX if needed

**6. International phone number: +15-20**
- File: `references/language-agent-tree-search-lats-report.md:256`
- Check: `phone_numbers`
- Content: `| Mathematical Reasoning | Baseline | +15-20% | +25-30% |...`
- Fix: Remove phone number or use placeholder like +1-555-555-5555

**7. International phone number: +20-25**
- File: `references/language-agent-tree-search-lats-report.md:258`
- Check: `phone_numbers`
- Content: `| Code Generation | Baseline | +20-25% | +15-20% | **+25-...`
- Fix: Remove phone number or use placeholder like +1-555-555-5555

**8. International phone number: +12-18**
- File: `references/language-agent-tree-search-lats-report.md:259`
- Check: `phone_numbers`
- Content: `| Multi-Step Reasoning | Baseline | +12-18% | +22-28% | *...`
- Fix: Remove phone number or use placeholder like +1-555-555-5555

**9. Non-RFC1918 IP address: 8.8.8.8**
- File: `references/tool-capability-compartmentalization-report.md:1171`
- Check: `ip_addresses`
- Content: `"dns": ["8.8.8.8", "8.8.4.4"],`
- Fix: Use private IP (10.x.x.x, 192.168.x.x) or placeholder like 0.0.0.0

**10. Non-RFC1918 IP address: 192.0.2.1**
- File: `references/tool-capability-compartmentalization-report.md:1173`
- Check: `ip_addresses`
- Content: `"api.example.com": "192.0.2.1"  # Fixed IP`
- Fix: Use private IP (10.x.x.x, 192.168.x.x) or placeholder like 0.0.0.0

*... and 20 more issues*

</details>


### ✅ License Compliance
*Validate license compliance for Skills, Rules, and Workflows*

- No license detected in any tier

### ✅ Code Risk Analysis
*Static code analysis using Bandit and packaged Semgrep rules*

- No code files found - skipping code risk analysis

### ✅ Secrets Detection
*Detect hardcoded secrets, API keys, and credentials using Gitleaks*

- No secrets detected by Gitleaks

### ❌ Code Integrity & Hygiene
*Validate dead links, dependencies, and static Python test-file discovery*

**75 errors, 1 warnings**

**Errors:**

- ❌ Dead link in human-in-loop-approval-framework-report.md: ../patterns/human-in-loop-approval-framework.md
- ❌ Dead link in variance-based-rl-sample-selection-report.md: agent-reinforcement-fine-tuning.md
- ❌ Dead link in variance-based-rl-sample-selection-report.md: memory-reinforcement-learning-memrl.md
- ❌ Dead link in variance-based-rl-sample-selection-report.md: inference-time-scaling.md
- ❌ Dead link in variance-based-rl-sample-selection-report.md: recursive-best-of-n-delegation.md
- ❌ Dead link in variance-based-rl-sample-selection-report.md: action-caching-replay.md
- ❌ Dead link in variance-based-rl-sample-selection-report.md: explicit-posterior-sampling-planner.md
- ❌ Dead link in team-shared-agent-configuration-report.md: layered-configuration-context
- ❌ Dead link in tool-selection-guide-report.md: ../patterns/sub-agent-spawning.md
- ❌ Dead link in tool-selection-guide-report.md: ../patterns/discrete-phase-separation.md
- *... and 65 more errors*


### ✅ Unicode Smuggling Detection
*Detect invisible Unicode characters and ASCII smuggling*

- All checks passed

**Non-blocking findings: 67**

| Severity | Issue | Location |
|----------|-------|----------|
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>references/burn-the-boats-technical-implementation-report.md:910</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>references/llm-observability-report.md:429</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>references/llm-observability-report.md:1536</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>references/deterministic-security-scanning-build-loop-report.md:307</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>references/deterministic-security-scanning-build-loop-report.md:309</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>references/wfgy-reliability-problem-map-academic-sources-report.md:145</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>references/wfgy-reliability-problem-map-academic-sources-report.md:640</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>references/llm-map-reduce-pattern-report.md:716</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>references/llm-map-reduce-pattern-report.md:719</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>references/wfgy-reliability-problem-map-report.md:76</code> |
| ... | *57 more issues* | |

<details>
<summary>View Details</summary>

**1. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `references/burn-the-boats-technical-implementation-report.md:910`
- Check: `isolated_invisible_char`
- Content: `- ⚠️ [Infrastructure for AI Agents](https://arxiv.org/abs...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**2. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `references/llm-observability-report.md:429`
- Check: `isolated_invisible_char`
- Content: `- **arXiv ID**: ⚠️ 2502.23320 (HALLUCINATED - does not ex...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**3. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `references/llm-observability-report.md:1536`
- Check: `isolated_invisible_char`
- Content: `- ⚠️ [Evaluating LLMs with Production Traces](https://arx...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**4. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `references/deterministic-security-scanning-build-loop-report.md:307`
- Check: `isolated_invisible_char`
- Content: `| **Academic Foundation** | ⚠️ Indirect | Well-establishe...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**5. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `references/deterministic-security-scanning-build-loop-report.md:309`
- Check: `isolated_invisible_char`
- Content: `| **Production Validation** | ⚠️ Needs verification | Pat...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**6. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `references/wfgy-reliability-problem-map-academic-sources-report.md:145`
- Check: `isolated_invisible_char`
- Content: `- **arXiv ID:** ⚠️ 2502.23320 (HALLUCINATED - does not ex...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**7. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `references/wfgy-reliability-problem-map-academic-sources-report.md:640`
- Check: `isolated_invisible_char`
- Content: `3. ⚠️ Yao et al. (2025). Evaluating LLMs with Production ...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**8. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `references/llm-map-reduce-pattern-report.md:716`
- Check: `isolated_invisible_char`
- Content: `| **Document summarization (10 docs)** | ⚠️ Borderline | ...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**9. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `references/llm-map-reduce-pattern-report.md:719`
- Check: `isolated_invisible_char`
- Content: `| **Feature prioritization (20 items)** | ⚠️ Borderline |...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**10. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `references/wfgy-reliability-problem-map-report.md:76`
- Check: `isolated_invisible_char`
- Content: `- ⚠️ **"Evaluating LLMs with Production Traces"** (arXiv:...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

*... and 57 more issues*

</details>


### ✅ B QUALITY
*Skill quality scoring across Correctness (35%), Discoverability (25%), Reliability (25%), and Efficiency (15%)*

**Overall: 88.0/100 (Grade: B)** | Skill Type: guide-only

| Dimension | Score | Weight |
|-----------|-------|--------|
| Correctness | 90.0 | 35% |
| Discoverability | 90.0 | 25% |
| Reliability | 85.0 | 25% |
| Efficiency | 85.0 | 15% |

- [OK] **quality_score**: Score: 88.0/100 (Grade: B)

**Non-blocking findings: 9**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'version' | <code>agentic-patterns-research/SKILL.md</code> |
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'metadata.tags' | <code>agentic-patterns-research/SKILL.md</code> |
| [LOW] LOW | Description very long (673 chars, recommend 50-150) | <code>agentic-patterns-research/SKILL.md</code> |
| [LOW] LOW | No '## Purpose' section | <code>agentic-patterns-research/SKILL.md</code> |
| [LOW] LOW | No prerequisites/requirements documented | <code>agentic-patterns-research/SKILL.md</code> |
| [LOW] LOW | No limitations documented | <code>agentic-patterns-research/SKILL.md</code> |
| [LOW] LOW | No troubleshooting section documented | <code>agentic-patterns-research/SKILL.md</code> |
| [LOW] LOW | Uses complex/corporate language | <code>agentic-patterns-research/SKILL.md</code> |
| [MED] MEDIUM | Deeply nested references in human-in-loop-approval-framework-report.md | <code>agentic-patterns-research/SKILL.md</code> |

<details>
<summary>View Details</summary>

**1. SKILL_SPEC recommended field missing: 'version'**
- File: `agentic-patterns-research/SKILL.md`
- Check: `quality_correctness`
- Fix: Add 'version' to frontmatter — Semantic version (e.g., "1.0.0")

**2. SKILL_SPEC recommended field missing: 'metadata.tags'**
- File: `agentic-patterns-research/SKILL.md`
- Check: `quality_correctness`
- Fix: Add 'tags' under metadata: — Categorization tags (under metadata:, list of 1-5 items)

**3. Description very long (673 chars, recommend 50-150)**
- File: `agentic-patterns-research/SKILL.md`
- Check: `quality_discoverability`
- Fix: Keep descriptions concise for progressive disclosure

**4. No '## Purpose' section**
- File: `agentic-patterns-research/SKILL.md`
- Check: `quality_discoverability`
- Fix: Add purpose section to clarify use cases

**5. No prerequisites/requirements documented**
- File: `agentic-patterns-research/SKILL.md`
- Check: `quality_reliability`
- Fix: Document dependencies, API keys, or setup needed

**6. No limitations documented**
- File: `agentic-patterns-research/SKILL.md`
- Check: `quality_reliability`
- Fix: Add '## Limitations' section with known issues/constraints

**7. No troubleshooting section documented**
- File: `agentic-patterns-research/SKILL.md`
- Check: `quality_reliability`
- Fix: Add '## Troubleshooting' with Error/Cause/Solution patterns

**8. Uses complex/corporate language**
- File: `agentic-patterns-research/SKILL.md`
- Check: `quality_efficiency`
- Fix: Use simple, direct language: 'use' not 'utilize'

**9. Deeply nested references in human-in-loop-approval-framework-report.md**
- File: `agentic-patterns-research/SKILL.md`
- Check: `quality_efficiency`
- Fix: Keep references one level deep from SKILL.md

</details>


### ✅ SCRIPT_LINT
*AST-based code quality checks for skill scripts*

- [OK] **lint**: No scripts/ or tools/ directory found

### ✅ Tier 2 Deduplication
*Embedding-based duplicate detection*

- All checks passed

---
*Generated by SkillEvaluator*

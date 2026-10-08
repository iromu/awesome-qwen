# SkillEvaluator Validation Report

**Status:** ❌ FAILED
**Profile:** external
**Policy digest:** `sha256:1caeb0bf9c2e044705f32fcdbd773fea4d835d895b4e0ab20d1aaa5e28acd660`
**Generated:** October 08, 2026 at 10:15 PM UTC

## Summary

| Metric | Value |
|--------|-------|
| Validator Results | 10 |
| ✅ Passed | 9 |
| ❌ Failed | 1 |
| ⚠️ Incomplete | 0 |
| Total Issues | 154 (3 medium) |

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

### ✅ Semantic Version Validation
*Validate optional metadata.version labels and require strict bumps*

- [OK] **version_semver**: Valid semantic version: 1.0.0

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

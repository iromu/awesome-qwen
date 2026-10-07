# SkillEvaluator Validation Report

**Status:** ❌ FAILED
**Profile:** external
**Policy digest:** `sha256:1caeb0bf9c2e044705f32fcdbd773fea4d835d895b4e0ab20d1aaa5e28acd660`
**Generated:** October 07, 2026 at 10:05 PM UTC

## Summary

| Metric | Value |
|--------|-------|
| Validator Results | 11 |
| ✅ Passed | 8 |
| ❌ Failed | 3 |
| ⚠️ Incomplete | 0 |
| Total Issues | 61 (1 critical, 3 high, 3 medium) |

## Quality Score

| Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
|-------|-------|-------|------|-------------|-----------------|-------------|------------|
| agentic-patterns-extra | 87.2 | B | guide-only | 90.0 | 90.0 | 85.0 | 80.0 |

## Results

### ✅ Schema & Repository Governance
*Validate SKILL.md frontmatter and repository structure*

- [OK] **manifest_exists**: Found skill manifest: SKILL.md
- [OK] **frontmatter_valid**: Valid frontmatter for skill 'agentic-patterns-extra'
- [OK] **folder_hierarchy**: Valid general skill structure: skills/agentic-patterns-extra/
- [OK] **naming_convention**: Folder name 'agentic-patterns-extra' follows kebab-case convention
- [OK] **line_count**: SKILL.md within line limit (369/500)
- [OK] **body_heading**: Body contains a top-level heading
- [OK] **body_recommended_section**: Found recommended section: '## Instructions' (or '## Usage')
- [OK] **body_recommended_section**: Found recommended section: '## Examples'
- [OK] **optional_files**: Found optional supporting files: evals, references
- [OK] **name_consistency**: Directory name matches frontmatter: 'agentic-patterns-extra'
- [OK] **author_format**: Valid author format: Iván Rodríguez Murillo <wantez@gmail.com>

**Non-blocking findings: 1**

| Severity | Issue | Location |
|----------|-------|----------|
| [LOW] LOW | Unexpected '-' in skill root | <code>agentic-patterns-extra/-</code> |

<details>
<summary>View Details</summary>

**1. Unexpected '-' in skill root**
- File: `agentic-patterns-extra/-`
- Check: `unexpected_file`
- Fix: Consider moving to one of: agents/, assets/, config/, evals/, references/, scripts/, tests/, tools/. To allow additional directories, set $SKILLEVALUATOR_SCHEMA_ALLOWED_DIRS.

</details>


### ✅ Semantic Version Validation
*Validate optional metadata.version labels and require strict bumps*

- [OK] **version_optional**: No semantic version label present; resource will use commit-hash history

### ❌ PII Scan
*Detect PII and local identifiers*

**3 errors, 1 warnings**

| Severity | Issue | Location |
|----------|-------|----------|
| [HIGH] HIGH | Non-placeholder email address: john@acme.com | <code>references/tool-use-environment/code-then-execute-pattern.md:30</code> |
| [MED] MEDIUM | International phone number: +10-30 | <code>references/ux-collaboration/verbose-reasoning-transparency.md:61</code> |
| [HIGH] HIGH | Non-placeholder email address: john.doe@company.com | <code>references/security-safety/pii-tokenization.md:53</code> |
| [CRIT] CRITICAL | Social Security Number: 123-45-6789 | <code>references/security-safety/pii-tokenization.md:55</code> |

<details>
<summary>View Details</summary>

**1. Non-placeholder email address: john@acme.com**
- File: `references/tool-use-environment/code-then-execute-pattern.md:30`
- Check: `emails`
- Content: `email.write(to="john@acme.com", body=y)`
- Fix: Remove the address or use a placeholder like user@example.com

**2. International phone number: +10-30**
- File: `references/ux-collaboration/verbose-reasoning-transparency.md:61`
- Check: `phone_numbers`
- Content: `* **Cons:** Adds modest performance overhead (+10-30% tok...`
- Fix: Remove phone number or use placeholder like +1-555-555-5555

**3. Non-placeholder email address: john.doe@company.com**
- File: `references/security-safety/pii-tokenization.md:53`
- Check: `emails`
- Content: `- `john.doe@company.com` → `[EMAIL_1]``
- Fix: Remove the address or use a placeholder like user@example.com

**4. Social Security Number: 123-45-6789**
- File: `references/security-safety/pii-tokenization.md:55`
- Check: `ssn`
- Content: `- `123-45-6789` → `[SSN_1]``
- Fix: Remove SSN immediately - use placeholder like XXX-XX-XXXX if needed

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

**43 errors, 1 warnings**

**Errors:**

- ❌ Dead link in tool-selection-guide.md: sub-agent-spawning.md
- ❌ Dead link in tool-selection-guide.md: discrete-phase-separation.md
- ❌ Dead link in tool-selection-guide.md: subject-hygiene.md
- ❌ Dead link in parallel-tool-execution.md: context-window-anxiety-management.md
- ❌ Dead link in multi-platform-webhook-triggers.md: proactive-trigger-vocabulary.md
- ❌ Dead link in cross-protocol-agent-discovery.md: tool-search-lazy-loading.md
- ❌ Dead link in codebase-optimization-for-agents.md: skill-library-evolution.md
- ❌ Dead link in codebase-optimization-for-agents.md: factory-over-assistant.md
- ❌ Dead link in agent-modes-by-model-personality.md: oracle-and-worker-multi-model.md
- ❌ Dead link in agent-modes-by-model-personality.md: progressive-autonomy-with-model-evolution.md
- *... and 33 more errors*


### ✅ Unicode Smuggling Detection
*Detect invisible Unicode characters and ASCII smuggling*

- All checks passed

**Non-blocking findings: 1**

| Severity | Issue | Location |
|----------|-------|----------|
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>references/ux-collaboration/dev-tooling-assumptions-reset.md:79</code> |

<details>
<summary>View Details</summary>

**1. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `references/ux-collaboration/dev-tooling-assumptions-reset.md:79`
- Check: `isolated_invisible_char`
- Content: `- Emoji reactions (❤️ 😃)`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

</details>


### ❌ B QUALITY
*Skill quality scoring across Correctness (35%), Discoverability (25%), Reliability (25%), and Efficiency (15%)*

**Overall: 87.2/100 (Grade: B)** | Skill Type: guide-only

| Dimension | Score | Weight |
|-----------|-------|--------|
| Correctness | 90.0 | 35% |
| Discoverability | 90.0 | 25% |
| Reliability | 85.0 | 25% |
| Efficiency | 80.0 | 15% |

**1 errors, 8 warnings**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'version' | <code>agentic-patterns-extra/SKILL.md</code> |
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'metadata.tags' | <code>agentic-patterns-extra/SKILL.md</code> |
| [LOW] LOW | Description very long (880 chars, recommend 50-150) | <code>agentic-patterns-extra/SKILL.md</code> |
| [LOW] LOW | No '## Purpose' section | <code>agentic-patterns-extra/SKILL.md</code> |
| [LOW] LOW | No prerequisites/requirements documented | <code>agentic-patterns-extra/SKILL.md</code> |
| [LOW] LOW | No limitations documented | <code>agentic-patterns-extra/SKILL.md</code> |
| [LOW] LOW | No troubleshooting section documented | <code>agentic-patterns-extra/SKILL.md</code> |
| [HIGH] HIGH | Large skill (12507 tokens, recommended max &lt;5000). Per agentskills.io, SKILL.md should be concise (~500 lines) — large skill bodies increase token cost after invocation; long or unfocused top-level descriptions can degrade agent routing accuracy | <code>agentic-patterns-extra/SKILL.md</code> |
| [LOW] LOW | Uses complex/corporate language | <code>agentic-patterns-extra/SKILL.md</code> |

<details>
<summary>View Details</summary>

**1. SKILL_SPEC recommended field missing: 'version'**
- File: `agentic-patterns-extra/SKILL.md`
- Check: `quality_correctness`
- Fix: Add 'version' to frontmatter — Semantic version (e.g., "1.0.0")

**2. SKILL_SPEC recommended field missing: 'metadata.tags'**
- File: `agentic-patterns-extra/SKILL.md`
- Check: `quality_correctness`
- Fix: Add 'tags' under metadata: — Categorization tags (under metadata:, list of 1-5 items)

**3. Description very long (880 chars, recommend 50-150)**
- File: `agentic-patterns-extra/SKILL.md`
- Check: `quality_discoverability`
- Fix: Keep descriptions concise for progressive disclosure

**4. No '## Purpose' section**
- File: `agentic-patterns-extra/SKILL.md`
- Check: `quality_discoverability`
- Fix: Add purpose section to clarify use cases

**5. No prerequisites/requirements documented**
- File: `agentic-patterns-extra/SKILL.md`
- Check: `quality_reliability`
- Fix: Document dependencies, API keys, or setup needed

**6. No limitations documented**
- File: `agentic-patterns-extra/SKILL.md`
- Check: `quality_reliability`
- Fix: Add '## Limitations' section with known issues/constraints

**7. No troubleshooting section documented**
- File: `agentic-patterns-extra/SKILL.md`
- Check: `quality_reliability`
- Fix: Add '## Troubleshooting' with Error/Cause/Solution patterns

**8. Large skill (12507 tokens, recommended max <5000). Per agentskills.io, SKILL.md should be concise (~500 lines) — large skill bodies increase token cost after invocation; long or unfocused top-level descriptions can degrade agent routing accuracy**
- File: `agentic-patterns-extra/SKILL.md`
- Check: `quality_efficiency`
- Fix: Keep required sections concise; move detailed examples, reference material, and supporting docs to the references/ directory

**9. Uses complex/corporate language**
- File: `agentic-patterns-extra/SKILL.md`
- Check: `quality_efficiency`
- Fix: Use simple, direct language: 'use' not 'utilize'

</details>


### ✅ SCRIPT_LINT
*AST-based code quality checks for skill scripts*

- [OK] **lint**: No scripts/ or tools/ directory found

### ✅ Tier 2 Deduplication
*Embedding-based duplicate detection*

- All checks passed

---
*Generated by SkillEvaluator*
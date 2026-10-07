# SkillEvaluator Validation Report

**Status:** ❌ FAILED
**Profile:** external
**Policy digest:** `sha256:1caeb0bf9c2e044705f32fcdbd773fea4d835d895b4e0ab20d1aaa5e28acd660`
**Generated:** October 07, 2026 at 10:06 PM UTC

## Summary

| Metric | Value |
|--------|-------|
| Validator Results | 11 |
| ✅ Passed | 10 |
| ❌ Failed | 1 |
| ⚠️ Incomplete | 0 |
| Total Issues | 14 (2 medium) |

## Quality Score

| Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
|-------|-------|-------|------|-------------|-----------------|-------------|------------|
| embabel-chatbot | 89.2 | B | guide-only | 95.0 | 90.0 | 80.0 | 90.0 |

## Results

### ✅ Schema & Repository Governance
*Validate SKILL.md frontmatter and repository structure*

- [OK] **manifest_exists**: Found skill manifest: SKILL.md
- [OK] **frontmatter_valid**: Valid frontmatter for skill 'embabel-chatbot'
- [OK] **folder_hierarchy**: Valid general skill structure: skills/embabel-chatbot/
- [OK] **naming_convention**: Folder name 'embabel-chatbot' follows kebab-case convention
- [OK] **line_count**: SKILL.md within line limit (198/500)
- [OK] **body_heading**: Body contains a top-level heading
- [OK] **body_recommended_section**: Found recommended section: '## Instructions' (or '## Usage')
- [OK] **body_recommended_section**: Found recommended section: '## Examples'
- [OK] **optional_files**: Found optional supporting files: evals, references
- [OK] **name_consistency**: Directory name matches frontmatter: 'embabel-chatbot'
- [OK] **author_format**: Valid author format: Iván Rodríguez Murillo <wantez@gmail.com>

**Non-blocking findings: 1**

| Severity | Issue | Location |
|----------|-------|----------|
| [LOW] LOW | Unexpected '-' in skill root | <code>embabel-chatbot/-</code> |

<details>
<summary>View Details</summary>

**1. Unexpected '-' in skill root**
- File: `embabel-chatbot/-`
- Check: `unexpected_file`
- Fix: Consider moving to one of: agents/, assets/, config/, evals/, references/, scripts/, tests/, tools/. To allow additional directories, set $SKILLEVALUATOR_SCHEMA_ALLOWED_DIRS.

</details>


### ✅ Semantic Version Validation
*Validate optional metadata.version labels and require strict bumps*

- [OK] **version_optional**: No semantic version label present; resource will use commit-hash history

### ✅ PII Scan
*Detect PII and local identifiers*

- [OK] **pii_scan_start**: Scanning 9 files for PII
- [OK] **pii_detection**: No PII detected in 9 files (emails, SSNs, phone numbers, paths)

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

**3 errors, 1 warnings**

**Errors:**

- ❌ Dead link in SKILL.md: references/04-chatbot-patterns.md
- ❌ Dead link in SKILL.md: references/05-structured-output.md
- ❌ Dead link in SKILL.md: references/06-quickstart.md


### ✅ Unicode Smuggling Detection
*Detect invisible Unicode characters and ASCII smuggling*

- [OK] **unicode_scan**: No invisible Unicode characters detected in 9 file(s)

### ✅ B QUALITY
*Skill quality scoring across Correctness (35%), Discoverability (25%), Reliability (25%), and Efficiency (15%)*

**Overall: 89.2/100 (Grade: B)** | Skill Type: guide-only

| Dimension | Score | Weight |
|-----------|-------|--------|
| Correctness | 95.0 | 35% |
| Discoverability | 90.0 | 25% |
| Reliability | 80.0 | 25% |
| Efficiency | 90.0 | 15% |

- [OK] **quality_score**: Score: 89.2/100 (Grade: B)

**Non-blocking findings: 7**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'metadata.tags' | <code>embabel-chatbot/SKILL.md</code> |
| [LOW] LOW | Description very long (950 chars, recommend 50-150) | <code>embabel-chatbot/SKILL.md</code> |
| [LOW] LOW | No '## Purpose' section | <code>embabel-chatbot/SKILL.md</code> |
| [LOW] LOW | No mention of error handling or validation | <code>embabel-chatbot/SKILL.md</code> |
| [LOW] LOW | No limitations documented | <code>embabel-chatbot/SKILL.md</code> |
| [LOW] LOW | No troubleshooting section documented | <code>embabel-chatbot/SKILL.md</code> |
| [MED] MEDIUM | Deeply nested references in 06-chatbot-patterns.md | <code>embabel-chatbot/SKILL.md</code> |

<details>
<summary>View Details</summary>

**1. SKILL_SPEC recommended field missing: 'metadata.tags'**
- File: `embabel-chatbot/SKILL.md`
- Check: `quality_correctness`
- Fix: Add 'tags' under metadata: — Categorization tags (under metadata:, list of 1-5 items)

**2. Description very long (950 chars, recommend 50-150)**
- File: `embabel-chatbot/SKILL.md`
- Check: `quality_discoverability`
- Fix: Keep descriptions concise for progressive disclosure

**3. No '## Purpose' section**
- File: `embabel-chatbot/SKILL.md`
- Check: `quality_discoverability`
- Fix: Add purpose section to clarify use cases

**4. No mention of error handling or validation**
- File: `embabel-chatbot/SKILL.md`
- Check: `quality_reliability`
- Fix: Document expected errors and how to handle them

**5. No limitations documented**
- File: `embabel-chatbot/SKILL.md`
- Check: `quality_reliability`
- Fix: Add '## Limitations' section with known issues/constraints

**6. No troubleshooting section documented**
- File: `embabel-chatbot/SKILL.md`
- Check: `quality_reliability`
- Fix: Add '## Troubleshooting' with Error/Cause/Solution patterns

**7. Deeply nested references in 06-chatbot-patterns.md**
- File: `embabel-chatbot/SKILL.md`
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
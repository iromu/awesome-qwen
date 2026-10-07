# SkillEvaluator Validation Report

**Status:** ✅ PASSED
**Profile:** external
**Policy digest:** `sha256:1caeb0bf9c2e044705f32fcdbd773fea4d835d895b4e0ab20d1aaa5e28acd660`
**Generated:** October 07, 2026 at 10:06 PM UTC

## Summary

| Metric | Value |
|--------|-------|
| Validator Results | 11 |
| ✅ Passed | 11 |
| ❌ Failed | 0 |
| ⚠️ Incomplete | 0 |
| Total Issues | 16 (1 medium) |

## Quality Score

| Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
|-------|-------|-------|------|-------------|-----------------|-------------|------------|
| git-workflows | 88.2 | B | guide-only | 95.0 | 85.0 | 75.0 | 100.0 |

## Results

### ✅ Schema & Repository Governance
*Validate SKILL.md frontmatter and repository structure*

- [OK] **manifest_exists**: Found skill manifest: SKILL.md
- [OK] **frontmatter_valid**: Valid frontmatter for skill 'git-workflows'
- [OK] **folder_hierarchy**: Valid general skill structure: skills/git-workflows/
- [OK] **naming_convention**: Folder name 'git-workflows' follows kebab-case convention
- [OK] **line_count**: SKILL.md within line limit (252/500)
- [OK] **body_heading**: Body contains a top-level heading
- [OK] **body_recommended_section**: Found recommended section: '## Instructions' (or '## Usage')
- [OK] **body_recommended_section**: Found recommended section: '## Examples'
- [OK] **name_consistency**: Directory name matches frontmatter: 'git-workflows'
- [OK] **author_format**: Valid author format: Iván Rodríguez Murillo <wantez@gmail.com>

**Non-blocking findings: 1**

| Severity | Issue | Location |
|----------|-------|----------|
| [LOW] LOW | Unexpected '-' in skill root | <code>git-workflows/-</code> |

<details>
<summary>View Details</summary>

**1. Unexpected '-' in skill root**
- File: `git-workflows/-`
- Check: `unexpected_file`
- Fix: Consider moving to one of: agents/, assets/, config/, evals/, references/, scripts/, tests/, tools/. To allow additional directories, set $SKILLEVALUATOR_SCHEMA_ALLOWED_DIRS.

</details>


### ✅ Semantic Version Validation
*Validate optional metadata.version labels and require strict bumps*

- [OK] **version_optional**: No semantic version label present; resource will use commit-hash history

### ✅ PII Scan
*Detect PII and local identifiers*

- [OK] **pii_scan_start**: Scanning 1 files for PII
- [OK] **pii_detection**: No PII detected in 1 files (emails, SSNs, phone numbers, paths)

### ✅ License Compliance
*Validate license compliance for Skills, Rules, and Workflows*

- No license detected in any tier

### ✅ Code Risk Analysis
*Static code analysis using Bandit and packaged Semgrep rules*

- No code files found - skipping code risk analysis

### ✅ Secrets Detection
*Detect hardcoded secrets, API keys, and credentials using Gitleaks*

- No secrets detected by Gitleaks

### ✅ Code Integrity & Hygiene
*Validate dead links, dependencies, and static Python test-file discovery*

- [OK] **dead_links_scan**: Checking 1 markdown files for dead links
- [OK] **dead_links**: All relative links valid in 1 markdown file(s)
- [OK] **dependencies**: No dependency files found (requirements.txt, pyproject.toml)
- [OK] **test_discovery**: No standard Python test-file candidates found; target tests were not executed and coverage was not measured. Consider adding tests.

### ✅ Unicode Smuggling Detection
*Detect invisible Unicode characters and ASCII smuggling*

- All checks passed

**Non-blocking findings: 4**

| Severity | Issue | Location |
|----------|-------|----------|
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>SKILL.md:221</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>SKILL.md:222</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>SKILL.md:223</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>SKILL.md:225</code> |

<details>
<summary>View Details</summary>

**1. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `SKILL.md:221`
- Check: `isolated_invisible_char`
- Content: `- ⚠️ `git rebase` rewrites history — only on local, unsha...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**2. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `SKILL.md:222`
- Check: `isolated_invisible_char`
- Content: `- ⚠️ Large PRs (>400 lines) are hard to review — split in...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**3. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `SKILL.md:223`
- Check: `isolated_invisible_char`
- Content: `- ⚠️ Don't merge `main` into feature branches frequently ...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**4. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `SKILL.md:225`
- Check: `isolated_invisible_char`
- Content: `- ⚠️ Always pull/rebase before creating a PR to avoid las...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

</details>


### ✅ B QUALITY
*Skill quality scoring across Correctness (35%), Discoverability (25%), Reliability (25%), and Efficiency (15%)*

**Overall: 88.2/100 (Grade: B)** | Skill Type: guide-only

| Dimension | Score | Weight |
|-----------|-------|--------|
| Correctness | 95.0 | 35% |
| Discoverability | 85.0 | 25% |
| Reliability | 75.0 | 25% |
| Efficiency | 100.0 | 15% |

- [OK] **quality_score**: Score: 88.2/100 (Grade: B)

**Non-blocking findings: 8**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'metadata.tags' | <code>git-workflows/SKILL.md</code> |
| [LOW] LOW | Description very long (591 chars, recommend 50-150) | <code>git-workflows/SKILL.md</code> |
| [LOW] LOW | Broad description without negative triggers may cause over-triggering | <code>git-workflows/SKILL.md</code> |
| [LOW] LOW | No '## Purpose' section | <code>git-workflows/SKILL.md</code> |
| [LOW] LOW | No mention of error handling or validation | <code>git-workflows/SKILL.md</code> |
| [LOW] LOW | No prerequisites/requirements documented | <code>git-workflows/SKILL.md</code> |
| [LOW] LOW | No limitations documented | <code>git-workflows/SKILL.md</code> |
| [LOW] LOW | No troubleshooting section documented | <code>git-workflows/SKILL.md</code> |

<details>
<summary>View Details</summary>

**1. SKILL_SPEC recommended field missing: 'metadata.tags'**
- File: `git-workflows/SKILL.md`
- Check: `quality_correctness`
- Fix: Add 'tags' under metadata: — Categorization tags (under metadata:, list of 1-5 items)

**2. Description very long (591 chars, recommend 50-150)**
- File: `git-workflows/SKILL.md`
- Check: `quality_discoverability`
- Fix: Keep descriptions concise for progressive disclosure

**3. Broad description without negative triggers may cause over-triggering**
- File: `git-workflows/SKILL.md`
- Check: `quality_discoverability`
- Fix: Add boundary phrases like 'Do NOT use for...'

**4. No '## Purpose' section**
- File: `git-workflows/SKILL.md`
- Check: `quality_discoverability`
- Fix: Add purpose section to clarify use cases

**5. No mention of error handling or validation**
- File: `git-workflows/SKILL.md`
- Check: `quality_reliability`
- Fix: Document expected errors and how to handle them

**6. No prerequisites/requirements documented**
- File: `git-workflows/SKILL.md`
- Check: `quality_reliability`
- Fix: Document dependencies, API keys, or setup needed

**7. No limitations documented**
- File: `git-workflows/SKILL.md`
- Check: `quality_reliability`
- Fix: Add '## Limitations' section with known issues/constraints

**8. No troubleshooting section documented**
- File: `git-workflows/SKILL.md`
- Check: `quality_reliability`
- Fix: Add '## Troubleshooting' with Error/Cause/Solution patterns

</details>


### ✅ SCRIPT_LINT
*AST-based code quality checks for skill scripts*

- [OK] **lint**: No scripts/ or tools/ directory found

### ✅ Tier 2 Deduplication
*Embedding-based duplicate detection*

- All checks passed

---
*Generated by SkillEvaluator*
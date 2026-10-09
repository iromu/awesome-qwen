# SkillEvaluator Validation Report

**Status:** ✅ PASSED
**Profile:** external
**Policy digest:** `sha256:1caeb0bf9c2e044705f32fcdbd773fea4d835d895b4e0ab20d1aaa5e28acd660`
**Generated:** October 09, 2026 at 02:12 PM UTC

## Summary

| Metric | Value |
|--------|-------|
| Validator Results | 9 |
| ✅ Passed | 9 |
| ❌ Failed | 0 |
| ⚠️ Incomplete | 0 |
| Total Issues | 10 (2 medium) |

## Quality Score

| Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
|-------|-------|-------|------|-------------|-----------------|-------------|------------|
| htmx | 89.5 | B | resource-based | 95.0 | 80.0 | 85.0 | 100.0 |

## Results

### ✅ Schema & Repository Governance
*Validate SKILL.md frontmatter and repository structure*

- [OK] **manifest_exists**: Found skill manifest: SKILL.md
- [OK] **frontmatter_valid**: Valid frontmatter for skill 'htmx'
- [OK] **folder_hierarchy**: Valid general skill structure: skills/htmx/
- [OK] **naming_convention**: Folder name 'htmx' follows kebab-case convention
- [OK] **line_count**: SKILL.md within line limit (376/500)
- [OK] **body_heading**: Body contains a top-level heading
- [OK] **body_recommended_section**: Found recommended section: '## Instructions' (or '## Usage')
- [OK] **body_recommended_section**: Found recommended section: '## Examples'
- [OK] **optional_files**: Found optional supporting files: evals, references
- [OK] **name_consistency**: Directory name matches frontmatter: 'htmx'
- [OK] **author_format**: Valid author format: Iván Rodríguez Murillo <wantez@gmail.com>

**Non-blocking findings: 1**

| Severity | Issue | Location |
|----------|-------|----------|
| [LOW] LOW | Unexpected 'templates' in skill root | <code>htmx/templates</code> |

<details>
<summary>View Details</summary>

**1. Unexpected 'templates' in skill root**
- File: `htmx/templates`
- Check: `unexpected_file`
- Fix: Consider moving to one of: agents/, assets/, config/, evals/, references/, scripts/, tests/, tools/. To allow additional directories, set $SKILLEVALUATOR_SCHEMA_ALLOWED_DIRS.

</details>


### ✅ Semantic Version Validation
*Validate optional metadata.version labels and require strict bumps*

- [OK] **version_semver**: Valid semantic version: 1.1.0

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

- [OK] **dead_links_scan**: Checking 6 markdown files for dead links
- [OK] **dead_links**: All relative links valid in 6 markdown file(s)
- [OK] **dependencies**: No dependency files found (requirements.txt, pyproject.toml)
- [OK] **test_discovery**: No standard Python test-file candidates found; target tests were not executed and coverage was not measured. Consider adding tests.

### ✅ Unicode Smuggling Detection
*Detect invisible Unicode characters and ASCII smuggling*

- [OK] **unicode_scan**: No invisible Unicode characters detected in 6 file(s)

### ✅ B QUALITY
*Skill quality scoring across Correctness (35%), Discoverability (25%), Reliability (25%), and Efficiency (15%)*

**Overall: 89.5/100 (Grade: B)** | Skill Type: resource-based

| Dimension | Score | Weight |
|-----------|-------|--------|
| Correctness | 95.0 | 35% |
| Discoverability | 80.0 | 25% |
| Reliability | 85.0 | 25% |
| Efficiency | 100.0 | 15% |

- [OK] **quality_score**: Score: 89.5/100 (Grade: B)

**Non-blocking findings: 7**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'version' | <code>htmx/SKILL.md</code> |
| [LOW] LOW | Description very long (889 chars, recommend 50-150) | <code>htmx/SKILL.md</code> |
| [LOW] LOW | No '## Purpose' section | <code>htmx/SKILL.md</code> |
| [MED] MEDIUM | Skill name very short: 'htmx' | <code>htmx/SKILL.md</code> |
| [LOW] LOW | No prerequisites/requirements documented | <code>htmx/SKILL.md</code> |
| [LOW] LOW | No limitations documented | <code>htmx/SKILL.md</code> |
| [LOW] LOW | No troubleshooting section documented | <code>htmx/SKILL.md</code> |

<details>
<summary>View Details</summary>

**1. SKILL_SPEC recommended field missing: 'version'**
- File: `htmx/SKILL.md`
- Check: `quality_correctness`
- Fix: Add 'version' to frontmatter — Semantic version (e.g., "1.0.0")

**2. Description very long (889 chars, recommend 50-150)**
- File: `htmx/SKILL.md`
- Check: `quality_discoverability`
- Fix: Keep descriptions concise for progressive disclosure

**3. No '## Purpose' section**
- File: `htmx/SKILL.md`
- Check: `quality_discoverability`
- Fix: Add purpose section to clarify use cases

**4. Skill name very short: 'htmx'**
- File: `htmx/SKILL.md`
- Check: `quality_discoverability`
- Fix: Use descriptive names like 'crypto-utils' not 'crypto'

**5. No prerequisites/requirements documented**
- File: `htmx/SKILL.md`
- Check: `quality_reliability`
- Fix: Document dependencies, API keys, or setup needed

**6. No limitations documented**
- File: `htmx/SKILL.md`
- Check: `quality_reliability`
- Fix: Add '## Limitations' section with known issues/constraints

**7. No troubleshooting section documented**
- File: `htmx/SKILL.md`
- Check: `quality_reliability`
- Fix: Add '## Troubleshooting' with Error/Cause/Solution patterns

</details>


### ✅ SCRIPT_LINT
*AST-based code quality checks for skill scripts*

- [OK] **lint**: No scripts/ or tools/ directory found

---
*Generated by SkillEvaluator*
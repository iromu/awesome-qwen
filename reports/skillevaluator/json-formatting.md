# SkillEvaluator Validation Report

**Status:** ✅ PASSED
**Profile:** external
**Policy digest:** `sha256:1caeb0bf9c2e044705f32fcdbd773fea4d835d895b4e0ab20d1aaa5e28acd660`
**Generated:** October 08, 2026 at 10:16 PM UTC

## Summary

| Metric | Value |
|--------|-------|
| Validator Results | 10 |
| ✅ Passed | 10 |
| ❌ Failed | 0 |
| ⚠️ Incomplete | 0 |
| Total Issues | 18 (1 medium) |

## Quality Score

| Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
|-------|-------|-------|------|-------------|-----------------|-------------|------------|
| json-formatting | 90.8 | A | guide-only | 95.0 | 85.0 | 85.0 | 100.0 |

## Results

### ✅ Schema & Repository Governance
*Validate SKILL.md frontmatter and repository structure*

- [OK] **manifest_exists**: Found skill manifest: SKILL.md
- [OK] **frontmatter_valid**: Valid frontmatter for skill 'json-formatting'
- [OK] **folder_hierarchy**: Valid general skill structure: skills/json-formatting/
- [OK] **naming_convention**: Folder name 'json-formatting' follows kebab-case convention
- [OK] **line_count**: SKILL.md within line limit (460/500)
- [OK] **body_heading**: Body contains a top-level heading
- [OK] **body_recommended_section**: Found recommended section: '## Instructions' (or '## Usage')
- [OK] **body_recommended_section**: Found recommended section: '## Examples'
- [OK] **optional_files**: Skill directory contains only expected files
- [OK] **name_consistency**: Directory name matches frontmatter: 'json-formatting'
- [OK] **author_format**: Valid author format: Iván Rodríguez Murillo <wantez@gmail.com>

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

- [OK] **dead_links_scan**: Checking 1 markdown files for dead links
- [OK] **dead_links**: All relative links valid in 1 markdown file(s)
- [OK] **dependencies**: No dependency files found (requirements.txt, pyproject.toml)
- [OK] **test_discovery**: No standard Python test-file candidates found; target tests were not executed and coverage was not measured. Consider adding tests.

### ✅ Unicode Smuggling Detection
*Detect invisible Unicode characters and ASCII smuggling*

- All checks passed

**Non-blocking findings: 8**

| Severity | Issue | Location |
|----------|-------|----------|
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>SKILL.md:214</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>SKILL.md:233</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>SKILL.md:410</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>SKILL.md:411</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>SKILL.md:412</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>SKILL.md:413</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>SKILL.md:414</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>SKILL.md:415</code> |

<details>
<summary>View Details</summary>

**1. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `SKILL.md:214`
- Check: `isolated_invisible_char`
- Content: `> ⚠️ **Caveat:** JSON → XML with arrays needs a strategy ...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**2. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `SKILL.md:233`
- Check: `isolated_invisible_char`
- Content: `> ⚠️ **Caveat:** Nested objects/arrays become stringified...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**3. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `SKILL.md:410`
- Check: `isolated_invisible_char`
- Content: `- ⚠️ Large JSON files (>10MB) may need streaming/parsing ...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**4. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `SKILL.md:411`
- Check: `isolated_invisible_char`
- Content: `- ⚠️ Converting JSON → XML with arrays: decide between re...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**5. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `SKILL.md:412`
- Check: `isolated_invisible_char`
- Content: `- ⚠️ Converting JSON → CSV: nested objects/arrays become ...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**6. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `SKILL.md:413`
- Check: `isolated_invisible_char`
- Content: `- ⚠️ Preserving numeric precision: very large integers ma...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**7. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `SKILL.md:414`
- Check: `isolated_invisible_char`
- Content: `- ⚠️ UTF-8 encoding: ensure output is properly encoded, e...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**8. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `SKILL.md:415`
- Check: `isolated_invisible_char`
- Content: `- ⚠️ JSON Schema inference from a single example is inher...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

</details>


### ✅ A QUALITY
*Skill quality scoring across Correctness (35%), Discoverability (25%), Reliability (25%), and Efficiency (15%)*

**Overall: 90.8/100 (Grade: A)** | Skill Type: guide-only

| Dimension | Score | Weight |
|-----------|-------|--------|
| Correctness | 95.0 | 35% |
| Discoverability | 85.0 | 25% |
| Reliability | 85.0 | 25% |
| Efficiency | 100.0 | 15% |

- [OK] **quality_score**: Score: 90.8/100 (Grade: A)

**Non-blocking findings: 7**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'version' | <code>json-formatting/SKILL.md</code> |
| [LOW] LOW | Description very long (537 chars, recommend 50-150) | <code>json-formatting/SKILL.md</code> |
| [LOW] LOW | Broad description without negative triggers may cause over-triggering | <code>json-formatting/SKILL.md</code> |
| [LOW] LOW | No '## Purpose' section | <code>json-formatting/SKILL.md</code> |
| [LOW] LOW | No prerequisites/requirements documented | <code>json-formatting/SKILL.md</code> |
| [LOW] LOW | No limitations documented | <code>json-formatting/SKILL.md</code> |
| [LOW] LOW | No troubleshooting section documented | <code>json-formatting/SKILL.md</code> |

<details>
<summary>View Details</summary>

**1. SKILL_SPEC recommended field missing: 'version'**
- File: `json-formatting/SKILL.md`
- Check: `quality_correctness`
- Fix: Add 'version' to frontmatter — Semantic version (e.g., "1.0.0")

**2. Description very long (537 chars, recommend 50-150)**
- File: `json-formatting/SKILL.md`
- Check: `quality_discoverability`
- Fix: Keep descriptions concise for progressive disclosure

**3. Broad description without negative triggers may cause over-triggering**
- File: `json-formatting/SKILL.md`
- Check: `quality_discoverability`
- Fix: Add boundary phrases like 'Do NOT use for...'

**4. No '## Purpose' section**
- File: `json-formatting/SKILL.md`
- Check: `quality_discoverability`
- Fix: Add purpose section to clarify use cases

**5. No prerequisites/requirements documented**
- File: `json-formatting/SKILL.md`
- Check: `quality_reliability`
- Fix: Document dependencies, API keys, or setup needed

**6. No limitations documented**
- File: `json-formatting/SKILL.md`
- Check: `quality_reliability`
- Fix: Add '## Limitations' section with known issues/constraints

**7. No troubleshooting section documented**
- File: `json-formatting/SKILL.md`
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
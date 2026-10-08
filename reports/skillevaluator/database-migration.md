# SkillEvaluator Validation Report

**Status:** ✅ PASSED
**Profile:** external
**Policy digest:** `sha256:1caeb0bf9c2e044705f32fcdbd773fea4d835d895b4e0ab20d1aaa5e28acd660`
**Generated:** October 08, 2026 at 10:15 PM UTC

## Summary

| Metric | Value |
|--------|-------|
| Validator Results | 10 |
| ✅ Passed | 10 |
| ❌ Failed | 0 |
| ⚠️ Incomplete | 0 |
| Total Issues | 16 (1 medium) |

## Quality Score

| Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
|-------|-------|-------|------|-------------|-----------------|-------------|------------|
| database-migration | 92.0 | A | guide-only | 95.0 | 90.0 | 85.0 | 100.0 |

## Results

### ✅ Schema & Repository Governance
*Validate SKILL.md frontmatter and repository structure*

- [OK] **manifest_exists**: Found skill manifest: SKILL.md
- [OK] **frontmatter_valid**: Valid frontmatter for skill 'database-migration'
- [OK] **folder_hierarchy**: Valid general skill structure: skills/database-migration/
- [OK] **naming_convention**: Folder name 'database-migration' follows kebab-case convention
- [OK] **line_count**: SKILL.md within line limit (218/500)
- [OK] **body_heading**: Body contains a top-level heading
- [OK] **body_recommended_section**: Found recommended section: '## Instructions' (or '## Usage')
- [OK] **body_recommended_section**: Found recommended section: '## Examples'
- [OK] **optional_files**: Found optional supporting files: references
- [OK] **name_consistency**: Directory name matches frontmatter: 'database-migration'
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

### ✅ Code Integrity & Hygiene
*Validate dead links, dependencies, and static Python test-file discovery*

- [OK] **dead_links_scan**: Checking 2 markdown files for dead links
- [OK] **dead_links**: All relative links valid in 2 markdown file(s)
- [OK] **dependencies**: No dependency files found (requirements.txt, pyproject.toml)
- [OK] **test_discovery**: No standard Python test-file candidates found; target tests were not executed and coverage was not measured. Consider adding tests.

### ✅ Unicode Smuggling Detection
*Detect invisible Unicode characters and ASCII smuggling*

- All checks passed

**Non-blocking findings: 7**

| Severity | Issue | Location |
|----------|-------|----------|
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>SKILL.md:200</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>SKILL.md:201</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>SKILL.md:203</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>SKILL.md:205</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>references/cross-database.md:24</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>references/cross-database.md:26</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>references/cross-database.md:27</code> |

<details>
<summary>View Details</summary>

**1. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `SKILL.md:200`
- Check: `isolated_invisible_char`
- Content: `- ⚠️ `ALTER TABLE ... ADD COLUMN ... DEFAULT ...` can loc...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**2. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `SKILL.md:201`
- Check: `isolated_invisible_char`
- Content: `- ⚠️ Creating indexes on large tables without `CONCURRENT...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**3. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `SKILL.md:203`
- Check: `isolated_invisible_char`
- Content: `- ⚠️ SQLite's limited DDL means renames and drops require...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**4. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `SKILL.md:205`
- Check: `isolated_invisible_char`
- Content: `- ⚠️ Always test rollback before deploying forward migrat...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**5. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `references/cross-database.md:24`
- Check: `isolated_invisible_char`
- Content: `| PostgreSQL | ✅ Instant | ⚠️ Table lock (VACUUM) | Use t...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**6. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `references/cross-database.md:26`
- Check: `isolated_invisible_char`
- Content: `| MySQL 5.7 | ✅ Instant | ⚠️ Table rebuild | Set default,...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**7. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `references/cross-database.md:27`
- Check: `isolated_invisible_char`
- Content: `| SQLite 3.35.0+ | ✅ Instant | ⚠️ Table rebuild | SQLite ...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

</details>


### ✅ A QUALITY
*Skill quality scoring across Correctness (35%), Discoverability (25%), Reliability (25%), and Efficiency (15%)*

**Overall: 92.0/100 (Grade: A)** | Skill Type: guide-only

| Dimension | Score | Weight |
|-----------|-------|--------|
| Correctness | 95.0 | 35% |
| Discoverability | 90.0 | 25% |
| Reliability | 85.0 | 25% |
| Efficiency | 100.0 | 15% |

- [OK] **quality_score**: Score: 92.0/100 (Grade: A)

**Non-blocking findings: 6**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'version' | <code>database-migration/SKILL.md</code> |
| [LOW] LOW | Description very long (655 chars, recommend 50-150) | <code>database-migration/SKILL.md</code> |
| [LOW] LOW | No '## Purpose' section | <code>database-migration/SKILL.md</code> |
| [LOW] LOW | No prerequisites/requirements documented | <code>database-migration/SKILL.md</code> |
| [LOW] LOW | No limitations documented | <code>database-migration/SKILL.md</code> |
| [LOW] LOW | No troubleshooting section documented | <code>database-migration/SKILL.md</code> |

<details>
<summary>View Details</summary>

**1. SKILL_SPEC recommended field missing: 'version'**
- File: `database-migration/SKILL.md`
- Check: `quality_correctness`
- Fix: Add 'version' to frontmatter — Semantic version (e.g., "1.0.0")

**2. Description very long (655 chars, recommend 50-150)**
- File: `database-migration/SKILL.md`
- Check: `quality_discoverability`
- Fix: Keep descriptions concise for progressive disclosure

**3. No '## Purpose' section**
- File: `database-migration/SKILL.md`
- Check: `quality_discoverability`
- Fix: Add purpose section to clarify use cases

**4. No prerequisites/requirements documented**
- File: `database-migration/SKILL.md`
- Check: `quality_reliability`
- Fix: Document dependencies, API keys, or setup needed

**5. No limitations documented**
- File: `database-migration/SKILL.md`
- Check: `quality_reliability`
- Fix: Add '## Limitations' section with known issues/constraints

**6. No troubleshooting section documented**
- File: `database-migration/SKILL.md`
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
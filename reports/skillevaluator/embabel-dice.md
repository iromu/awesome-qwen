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
| Total Issues | 10 (1 high, 1 medium) |

## Quality Score

| Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
|-------|-------|-------|------|-------------|-----------------|-------------|------------|
| embabel-dice | 89.8 | B | guide-only | 95.0 | 90.0 | 85.0 | 85.0 |

## Results

### ✅ Schema & Repository Governance
*Validate SKILL.md frontmatter and repository structure*

- [OK] **manifest_exists**: Found skill manifest: SKILL.md
- [OK] **frontmatter_valid**: Valid frontmatter for skill 'embabel-dice'
- [OK] **folder_hierarchy**: Valid general skill structure: skills/embabel-dice/
- [OK] **naming_convention**: Folder name 'embabel-dice' follows kebab-case convention
- [OK] **line_count**: SKILL.md within line limit (476/500)
- [OK] **body_heading**: Body contains a top-level heading
- [OK] **body_recommended_section**: Found recommended section: '## Instructions' (or '## Usage')
- [OK] **body_recommended_section**: Found recommended section: '## Examples'
- [OK] **optional_files**: Found optional supporting files: evals, references
- [OK] **name_consistency**: Directory name matches frontmatter: 'embabel-dice'
- [OK] **author_format**: Valid author format: Iván Rodríguez Murillo <wantez@gmail.com>

### ✅ Semantic Version Validation
*Validate optional metadata.version labels and require strict bumps*

- [OK] **version_semver**: Valid semantic version: 0.2.0

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

- [OK] **dead_links_scan**: Checking 5 markdown files for dead links
- [OK] **dead_links**: All relative links valid in 5 markdown file(s)
- [OK] **dependencies**: No dependency files found (requirements.txt, pyproject.toml)
- [OK] **test_discovery**: No standard Python test-file candidates found; target tests were not executed and coverage was not measured. Consider adding tests.

### ✅ Unicode Smuggling Detection
*Detect invisible Unicode characters and ASCII smuggling*

- [OK] **unicode_scan**: No invisible Unicode characters detected in 5 file(s)

### ❌ B QUALITY
*Skill quality scoring across Correctness (35%), Discoverability (25%), Reliability (25%), and Efficiency (15%)*

**Overall: 89.8/100 (Grade: B)** | Skill Type: guide-only

| Dimension | Score | Weight |
|-----------|-------|--------|
| Correctness | 95.0 | 35% |
| Discoverability | 90.0 | 25% |
| Reliability | 85.0 | 25% |
| Efficiency | 85.0 | 15% |

**1 errors, 6 warnings**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'version' | <code>embabel-dice/SKILL.md</code> |
| [LOW] LOW | Description very long (834 chars, recommend 50-150) | <code>embabel-dice/SKILL.md</code> |
| [LOW] LOW | No '## Purpose' section | <code>embabel-dice/SKILL.md</code> |
| [LOW] LOW | No prerequisites/requirements documented | <code>embabel-dice/SKILL.md</code> |
| [LOW] LOW | No limitations documented | <code>embabel-dice/SKILL.md</code> |
| [LOW] LOW | No troubleshooting section documented | <code>embabel-dice/SKILL.md</code> |
| [HIGH] HIGH | Large skill (6510 tokens, recommended max &lt;5000). Per agentskills.io, SKILL.md should be concise (~500 lines) — large skill bodies increase token cost after invocation; long or unfocused top-level descriptions can degrade agent routing accuracy | <code>embabel-dice/SKILL.md</code> |

<details>
<summary>View Details</summary>

**1. SKILL_SPEC recommended field missing: 'version'**
- File: `embabel-dice/SKILL.md`
- Check: `quality_correctness`
- Fix: Add 'version' to frontmatter — Semantic version (e.g., "1.0.0")

**2. Description very long (834 chars, recommend 50-150)**
- File: `embabel-dice/SKILL.md`
- Check: `quality_discoverability`
- Fix: Keep descriptions concise for progressive disclosure

**3. No '## Purpose' section**
- File: `embabel-dice/SKILL.md`
- Check: `quality_discoverability`
- Fix: Add purpose section to clarify use cases

**4. No prerequisites/requirements documented**
- File: `embabel-dice/SKILL.md`
- Check: `quality_reliability`
- Fix: Document dependencies, API keys, or setup needed

**5. No limitations documented**
- File: `embabel-dice/SKILL.md`
- Check: `quality_reliability`
- Fix: Add '## Limitations' section with known issues/constraints

**6. No troubleshooting section documented**
- File: `embabel-dice/SKILL.md`
- Check: `quality_reliability`
- Fix: Add '## Troubleshooting' with Error/Cause/Solution patterns

**7. Large skill (6510 tokens, recommended max <5000). Per agentskills.io, SKILL.md should be concise (~500 lines) — large skill bodies increase token cost after invocation; long or unfocused top-level descriptions can degrade agent routing accuracy**
- File: `embabel-dice/SKILL.md`
- Check: `quality_efficiency`
- Fix: Keep required sections concise; move detailed examples, reference material, and supporting docs to the references/ directory

</details>


### ✅ SCRIPT_LINT
*AST-based code quality checks for skill scripts*

- [OK] **lint**: No scripts/ or tools/ directory found

### ✅ Tier 2 Deduplication
*Embedding-based duplicate detection*

- All checks passed

---
*Generated by SkillEvaluator*
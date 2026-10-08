# SkillEvaluator Validation Report

**Status:** ❌ FAILED
**Profile:** external
**Policy digest:** `sha256:1caeb0bf9c2e044705f32fcdbd773fea4d835d895b4e0ab20d1aaa5e28acd660`
**Generated:** October 08, 2026 at 07:49 AM UTC

## Summary

| Metric | Value |
|--------|-------|
| Validator Results | 11 |
| ✅ Passed | 9 |
| ❌ Failed | 2 |
| ⚠️ Incomplete | 0 |
| Total Issues | 15 (1 high, 5 medium) |

## Quality Score

| Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
|-------|-------|-------|------|-------------|-----------------|-------------|------------|
| embabel-agent | 80.0 | B | script-based | 70.0 | 90.0 | 90.0 | 70.0 |

## Results

### ✅ Schema & Repository Governance
*Validate SKILL.md frontmatter and repository structure*

- [OK] **manifest_exists**: Found skill manifest: SKILL.md
- [OK] **frontmatter_valid**: Valid frontmatter for skill 'embabel-agent'
- [OK] **folder_hierarchy**: Valid general skill structure: skills/embabel-agent/
- [OK] **naming_convention**: Folder name 'embabel-agent' follows kebab-case convention
- [OK] **line_count**: SKILL.md within line limit (407/500)
- [OK] **body_heading**: Body contains a top-level heading
- [OK] **body_recommended_section**: Found recommended section: '## Instructions' (or '## Usage')
- [OK] **body_recommended_section**: Found recommended section: '## Examples'
- [OK] **optional_files**: Found optional supporting files: evals, references, scripts
- [OK] **name_consistency**: Directory name matches frontmatter: 'embabel-agent'
- [OK] **author_format**: Valid author format: Iván Rodríguez Murillo <wantez@gmail.com>

### ✅ Semantic Version Validation
*Validate optional metadata.version labels and require strict bumps*

- [OK] **version_semver**: Valid semantic version: 1.5.1

### ✅ PII Scan
*Detect PII and local identifiers*

- [OK] **pii_scan_start**: Scanning 39 files for PII
- [OK] **pii_detection**: No PII detected in 39 files (emails, SSNs, phone numbers, paths)

### ✅ License Compliance
*Validate license compliance for Skills, Rules, and Workflows*

- No license detected in any tier

### ✅ Code Risk Analysis
*Static code analysis using Bandit and packaged Semgrep rules*

- Found 0 Python, 1 Shell, 0 JavaScript/TypeScript files
- Semgrep: No security issues found

### ✅ Secrets Detection
*Detect hardcoded secrets, API keys, and credentials using Gitleaks*

- No secrets detected by Gitleaks

### ❌ Code Integrity & Hygiene
*Validate dead links, dependencies, and static Python test-file discovery*

**1 errors, 1 warnings**

**Errors:**

- ❌ Dead link in termination.md: ../cost-tracking.md


### ✅ Unicode Smuggling Detection
*Detect invisible Unicode characters and ASCII smuggling*

- [OK] **unicode_scan**: No invisible Unicode characters detected in 39 file(s)

### ❌ B QUALITY
*Skill quality scoring across Correctness (35%), Discoverability (25%), Reliability (25%), and Efficiency (15%)*

**Overall: 80.0/100 (Grade: B)** | Skill Type: script-based

| Dimension | Score | Weight |
|-----------|-------|--------|
| Correctness | 70.0 | 35% |
| Discoverability | 90.0 | 25% |
| Reliability | 90.0 | 25% |
| Efficiency | 70.0 | 15% |

**1 errors, 10 warnings**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | No documented scripts in table format | <code>embabel-agent/SKILL.md</code> |
| [MED] MEDIUM | Instructions don't mention 'run_script' | <code>embabel-agent/SKILL.md</code> |
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'version' | <code>embabel-agent/SKILL.md</code> |
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'metadata.tags' | <code>embabel-agent/SKILL.md</code> |
| [LOW] LOW | Description very long (1017 chars, recommend 50-150) | <code>embabel-agent/SKILL.md</code> |
| [LOW] LOW | No '## Purpose' section | <code>embabel-agent/SKILL.md</code> |
| [LOW] LOW | No prerequisites/requirements documented | <code>embabel-agent/SKILL.md</code> |
| [LOW] LOW | No limitations documented | <code>embabel-agent/SKILL.md</code> |
| [HIGH] HIGH | Large skill (5490 tokens, recommended max &lt;5000). Per agentskills.io, SKILL.md should be concise (~500 lines) — large skill bodies increase token cost after invocation; long or unfocused top-level descriptions can degrade agent routing accuracy | <code>embabel-agent/SKILL.md</code> |
| [LOW] LOW | Non-descriptive filename: dsl.md | <code>embabel-agent/SKILL.md</code> |
| ... | *1 more issues* | |

<details>
<summary>View Details</summary>

**1. No documented scripts in table format**
- File: `embabel-agent/SKILL.md`
- Check: `quality_correctness`
- Fix: Add '## Available Scripts' with table: | Script | Purpose | Arguments |

**2. Instructions don't mention 'run_script'**
- File: `embabel-agent/SKILL.md`
- Check: `quality_correctness`
- Fix: Add explicit run_script() call examples

**3. SKILL_SPEC recommended field missing: 'version'**
- File: `embabel-agent/SKILL.md`
- Check: `quality_correctness`
- Fix: Add 'version' to frontmatter — Semantic version (e.g., "1.0.0")

**4. SKILL_SPEC recommended field missing: 'metadata.tags'**
- File: `embabel-agent/SKILL.md`
- Check: `quality_correctness`
- Fix: Add 'tags' under metadata: — Categorization tags (under metadata:, list of 1-5 items)

**5. Description very long (1017 chars, recommend 50-150)**
- File: `embabel-agent/SKILL.md`
- Check: `quality_discoverability`
- Fix: Keep descriptions concise for progressive disclosure

**6. No '## Purpose' section**
- File: `embabel-agent/SKILL.md`
- Check: `quality_discoverability`
- Fix: Add purpose section to clarify use cases

**7. No prerequisites/requirements documented**
- File: `embabel-agent/SKILL.md`
- Check: `quality_reliability`
- Fix: Document dependencies, API keys, or setup needed

**8. No limitations documented**
- File: `embabel-agent/SKILL.md`
- Check: `quality_reliability`
- Fix: Add '## Limitations' section with known issues/constraints

**9. Large skill (5490 tokens, recommended max <5000). Per agentskills.io, SKILL.md should be concise (~500 lines) — large skill bodies increase token cost after invocation; long or unfocused top-level descriptions can degrade agent routing accuracy**
- File: `embabel-agent/SKILL.md`
- Check: `quality_efficiency`
- Fix: Keep required sections concise; move detailed examples, reference material, and supporting docs to the references/ directory

**10. Non-descriptive filename: dsl.md**
- File: `embabel-agent/SKILL.md`
- Check: `quality_efficiency`
- Fix: Use descriptive names: 'form_validation_rules.md' not 'doc2.md'

*... and 1 more issues*

</details>


### ✅ SCRIPT_LINT
*AST-based code quality checks for skill scripts*

- [OK] **lint**: No Python scripts found in scripts/ or tools/

### ✅ Tier 2 Deduplication
*Embedding-based duplicate detection*

- All checks passed

---
*Generated by SkillEvaluator*
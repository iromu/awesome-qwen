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
| Total Issues | 26 (6 medium) |

## Quality Score

| Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
|-------|-------|-------|------|-------------|-----------------|-------------|------------|
| skill-creator | 81.2 | B | hybrid | 70.0 | 90.0 | 80.0 | 95.0 |

## Results

### ✅ Schema & Repository Governance
*Validate SKILL.md frontmatter and repository structure*

- [OK] **manifest_exists**: Found skill manifest: SKILL.md
- [OK] **frontmatter_valid**: Valid frontmatter for skill 'skill-creator'
- [OK] **folder_hierarchy**: Valid general skill structure: skills/skill-creator/
- [OK] **naming_convention**: Folder name 'skill-creator' follows kebab-case convention
- [OK] **line_count**: SKILL.md within line limit (290/500)
- [OK] **body_heading**: Body contains a top-level heading
- [OK] **body_recommended_section**: Found recommended section: '## Instructions' (or '## Usage')
- [OK] **body_recommended_section**: Found recommended section: '## Examples'
- [OK] **optional_files**: Found optional supporting files: agents, assets, references, scripts
- [OK] **name_consistency**: Directory name matches frontmatter: 'skill-creator'
- [OK] **author_format**: Valid author format: Iván Rodríguez Murillo <wantez@gmail.com>

**Non-blocking findings: 1**

| Severity | Issue | Location |
|----------|-------|----------|
| [LOW] LOW | Unexpected 'eval-viewer' in skill root | <code>skill-creator/eval-viewer</code> |

<details>
<summary>View Details</summary>

**1. Unexpected 'eval-viewer' in skill root**
- File: `skill-creator/eval-viewer`
- Check: `unexpected_file`
- Fix: Consider moving to one of: agents/, assets/, config/, evals/, references/, scripts/, tests/, tools/. To allow additional directories, set $SKILLEVALUATOR_SCHEMA_ALLOWED_DIRS.

</details>


### ✅ Semantic Version Validation
*Validate optional metadata.version labels and require strict bumps*

- [OK] **version_semver**: Valid semantic version: 1.0.0

### ✅ License Compliance
*Validate license compliance for Skills, Rules, and Workflows*

- No license detected in any tier

### ✅ Code Risk Analysis
*Static code analysis using Bandit and packaged Semgrep rules*

- Found 12 Python, 0 Shell, 0 JavaScript/TypeScript files
- Bandit: No security issues found
- Semgrep: No security issues found

### ✅ Secrets Detection
*Detect hardcoded secrets, API keys, and credentials using Gitleaks*

- No secrets detected by Gitleaks

### ✅ Code Integrity & Hygiene
*Validate dead links, dependencies, and static Python test-file discovery*

- [OK] **dead_links_scan**: Checking 8 markdown files for dead links
- [OK] **dead_links**: All relative links valid in 8 markdown file(s)
- [OK] **dependencies**: No dependency files found (requirements.txt, pyproject.toml)
- [OK] **test_discovery**: Found 1 standard Python test-file candidate(s); target tests were not executed and coverage was not measured

### ✅ Unicode Smuggling Detection
*Detect invisible Unicode characters and ASCII smuggling*

- [OK] **unicode_scan**: No invisible Unicode characters detected in 22 file(s)

### ✅ B QUALITY
*Skill quality scoring across Correctness (35%), Discoverability (25%), Reliability (25%), and Efficiency (15%)*

**Overall: 81.2/100 (Grade: B)** | Skill Type: hybrid

| Dimension | Score | Weight |
|-----------|-------|--------|
| Correctness | 70.0 | 35% |
| Discoverability | 90.0 | 25% |
| Reliability | 80.0 | 25% |
| Efficiency | 95.0 | 15% |

- [OK] **quality_score**: Score: 81.2/100 (Grade: B)

**Non-blocking findings: 11**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | No documented scripts in table format | <code>skill-creator/SKILL.md</code> |
| [MED] MEDIUM | Instructions don't mention 'run_script' | <code>skill-creator/SKILL.md</code> |
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'version' | <code>skill-creator/SKILL.md</code> |
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'metadata.tags' | <code>skill-creator/SKILL.md</code> |
| [LOW] LOW | Description very long (774 chars, recommend 50-150) | <code>skill-creator/SKILL.md</code> |
| [LOW] LOW | No '## Purpose' section | <code>skill-creator/SKILL.md</code> |
| [LOW] LOW | Scripts may lack error handling: __init__.py, generate_report.py | <code>skill-creator/SKILL.md</code> |
| [LOW] LOW | No prerequisites/requirements documented | <code>skill-creator/SKILL.md</code> |
| [LOW] LOW | No limitations documented | <code>skill-creator/SKILL.md</code> |
| [LOW] LOW | No troubleshooting section documented | <code>skill-creator/SKILL.md</code> |
| ... | *1 more issues* | |

<details>
<summary>View Details</summary>

**1. No documented scripts in table format**
- File: `skill-creator/SKILL.md`
- Check: `quality_correctness`
- Fix: Add '## Available Scripts' with table: | Script | Purpose | Arguments |

**2. Instructions don't mention 'run_script'**
- File: `skill-creator/SKILL.md`
- Check: `quality_correctness`
- Fix: Add explicit run_script() call examples

**3. SKILL_SPEC recommended field missing: 'version'**
- File: `skill-creator/SKILL.md`
- Check: `quality_correctness`
- Fix: Add 'version' to frontmatter — Semantic version (e.g., "1.0.0")

**4. SKILL_SPEC recommended field missing: 'metadata.tags'**
- File: `skill-creator/SKILL.md`
- Check: `quality_correctness`
- Fix: Add 'tags' under metadata: — Categorization tags (under metadata:, list of 1-5 items)

**5. Description very long (774 chars, recommend 50-150)**
- File: `skill-creator/SKILL.md`
- Check: `quality_discoverability`
- Fix: Keep descriptions concise for progressive disclosure

**6. No '## Purpose' section**
- File: `skill-creator/SKILL.md`
- Check: `quality_discoverability`
- Fix: Add purpose section to clarify use cases

**7. Scripts may lack error handling: __init__.py, generate_report.py**
- File: `skill-creator/SKILL.md`
- Check: `quality_reliability`
- Fix: Scripts should handle errors explicitly

**8. No prerequisites/requirements documented**
- File: `skill-creator/SKILL.md`
- Check: `quality_reliability`
- Fix: Document dependencies, API keys, or setup needed

**9. No limitations documented**
- File: `skill-creator/SKILL.md`
- Check: `quality_reliability`
- Fix: Add '## Limitations' section with known issues/constraints

**10. No troubleshooting section documented**
- File: `skill-creator/SKILL.md`
- Check: `quality_reliability`
- Fix: Add '## Troubleshooting' with Error/Cause/Solution patterns

*... and 1 more issues*

</details>


### ✅ SCRIPT_LINT
*AST-based code quality checks for skill scripts*

- All checks passed

**Non-blocking findings: 13**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | __init__.py has no function definitions (flat script) | <code>skill-creator/scripts/__init__.py</code> |
| [LOW] LOW | __init__.py missing shebang line | <code>skill-creator/scripts/__init__.py</code> |
| [LOW] LOW | __init__.py may lack input validation | <code>skill-creator/scripts/__init__.py</code> |
| [LOW] LOW | aggregate_benchmark.py contains magic numbers | <code>skill-creator/scripts/aggregate_benchmark.py</code> |
| [LOW] LOW | auto_grader.py contains magic numbers | <code>skill-creator/scripts/auto_grader.py</code> |
| [LOW] LOW | generate_report.py contains magic numbers | <code>skill-creator/scripts/generate_report.py</code> |
| [LOW] LOW | improve_description.py contains magic numbers | <code>skill-creator/scripts/improve_description.py</code> |
| [LOW] LOW | quick_validate.py contains magic numbers | <code>skill-creator/scripts/quick_validate.py</code> |
| [MED] MEDIUM | run_eval.py has deeply nested code (depth 7, max 6) | <code>skill-creator/scripts/run_eval.py</code> |
| [LOW] LOW | run_eval.py contains magic numbers | <code>skill-creator/scripts/run_eval.py</code> |
| ... | *3 more issues* | |

<details>
<summary>View Details</summary>

**1. __init__.py has no function definitions (flat script)**
- File: `skill-creator/scripts/__init__.py`
- Check: `flat_script`
- Fix: Wrap logic in functions for maintainability and testability

**2. __init__.py missing shebang line**
- File: `skill-creator/scripts/__init__.py`
- Check: `missing_shebang`
- Fix: Add: #!/usr/bin/env python3

**3. __init__.py may lack input validation**
- File: `skill-creator/scripts/__init__.py`
- Check: `no_input_validation`
- Fix: Add argument checks and raise descriptive errors

**4. aggregate_benchmark.py contains magic numbers**
- File: `skill-creator/scripts/aggregate_benchmark.py`
- Check: `magic_numbers`
- Fix: Extract magic numbers to named constants

**5. auto_grader.py contains magic numbers**
- File: `skill-creator/scripts/auto_grader.py`
- Check: `magic_numbers`
- Fix: Extract magic numbers to named constants

**6. generate_report.py contains magic numbers**
- File: `skill-creator/scripts/generate_report.py`
- Check: `magic_numbers`
- Fix: Extract magic numbers to named constants

**7. improve_description.py contains magic numbers**
- File: `skill-creator/scripts/improve_description.py`
- Check: `magic_numbers`
- Fix: Extract magic numbers to named constants

**8. quick_validate.py contains magic numbers**
- File: `skill-creator/scripts/quick_validate.py`
- Check: `magic_numbers`
- Fix: Extract magic numbers to named constants

**9. run_eval.py has deeply nested code (depth 7, max 6)**
- File: `skill-creator/scripts/run_eval.py`
- Check: `deep_nesting`
- Fix: Refactor into smaller functions to reduce complexity

**10. run_eval.py contains magic numbers**
- File: `skill-creator/scripts/run_eval.py`
- Check: `magic_numbers`
- Fix: Extract magic numbers to named constants

*... and 3 more issues*

</details>


---
*Generated by SkillEvaluator*
# SkillEvaluator Validation Report

**Status:** ❌ FAILED
**Profile:** external
**Policy digest:** `sha256:1caeb0bf9c2e044705f32fcdbd773fea4d835d895b4e0ab20d1aaa5e28acd660`
**Generated:** October 08, 2026 at 10:16 PM UTC

## Summary

| Metric | Value |
|--------|-------|
| Validator Results | 10 |
| ✅ Passed | 9 |
| ❌ Failed | 1 |
| ⚠️ Incomplete | 0 |
| Total Issues | 37 (10 medium) |

## Quality Score

| Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
|-------|-------|-------|------|-------------|-----------------|-------------|------------|
| maven-version-audit | 82.0 | B | script-based | 70.0 | 90.0 | 80.0 | 100.0 |

## Results

### ✅ Schema & Repository Governance
*Validate SKILL.md frontmatter and repository structure*

- [OK] **manifest_exists**: Found skill manifest: SKILL.md
- [OK] **frontmatter_valid**: Valid frontmatter for skill 'maven-version-audit'
- [OK] **folder_hierarchy**: Valid general skill structure: skills/maven-version-audit/
- [OK] **naming_convention**: Folder name 'maven-version-audit' follows kebab-case convention
- [OK] **line_count**: SKILL.md within line limit (165/500)
- [OK] **body_heading**: Body contains a top-level heading
- [OK] **body_recommended_section**: Found recommended section: '## Instructions' (or '## Usage')
- [OK] **body_recommended_section**: Found recommended section: '## Examples'
- [OK] **optional_files**: Found optional supporting files: evals, scripts
- [OK] **name_consistency**: Directory name matches frontmatter: 'maven-version-audit'
- [OK] **author_format**: Valid author format: Iván Rodríguez Murillo <wantez@gmail.com>

### ✅ Semantic Version Validation
*Validate optional metadata.version labels and require strict bumps*

- [OK] **version_semver**: Valid semantic version: 1.0.0

### ✅ License Compliance
*Validate license compliance for Skills, Rules, and Workflows*

- No license detected in any tier

### ❌ Code Risk Analysis
*Static code analysis using Bandit and packaged Semgrep rules*

**6 errors, 0 warnings**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | Using xml.etree.ElementTree.parse to parse untrusted XML data is known to be vulnerable to XML attacks. Replace xml.etree.ElementTree.parse with its defusedxml equivalent function or make sure defusedxml.defuse_stdlib() is called (CWE-20) | <code>maven-version-audit/scripts/step1_coords.py:37</code> |
| [MED] MEDIUM | Using xml.etree.ElementTree.parse to parse untrusted XML data is known to be vulnerable to XML attacks. Replace xml.etree.ElementTree.parse with its defusedxml equivalent function or make sure defusedxml.defuse_stdlib() is called (CWE-20) | <code>maven-version-audit/scripts/step2_download.py:101</code> |
| [MED] MEDIUM | Using xml.etree.ElementTree.parse to parse untrusted XML data is known to be vulnerable to XML attacks. Replace xml.etree.ElementTree.parse with its defusedxml equivalent function or make sure defusedxml.defuse_stdlib() is called (CWE-20) | <code>maven-version-audit/scripts/step3_doc.py:126</code> |
| [MED] MEDIUM | Using xml.etree.ElementTree.parse to parse untrusted XML data is known to be vulnerable to XML attacks. Replace xml.etree.ElementTree.parse with its defusedxml equivalent function or make sure defusedxml.defuse_stdlib() is called (CWE-20) | <code>maven-version-audit/scripts/step3_doc.py:187</code> |
| [MED] MEDIUM | Using xml.etree.ElementTree.parse to parse untrusted XML data is known to be vulnerable to XML attacks. Replace xml.etree.ElementTree.parse with its defusedxml equivalent function or make sure defusedxml.defuse_stdlib() is called (CWE-20) | <code>maven-version-audit/scripts/verify_ordering.py:36</code> |
| [MED] MEDIUM | Using xml.etree.ElementTree.parse to parse untrusted XML data is known to be vulnerable to XML attacks. Replace xml.etree.ElementTree.parse with its defusedxml equivalent function or make sure defusedxml.defuse_stdlib() is called (CWE-20) | <code>maven-version-audit/scripts/verify_ordering.py:52</code> |

<details>
<summary>View Details</summary>

**1. Using xml.etree.ElementTree.parse to parse untrusted XML data is known to be vulnerable to XML attacks. Replace xml.etree.ElementTree.parse with its defusedxml equivalent function or make sure defusedxml.defuse_stdlib() is called (CWE-20)**
- File: `maven-version-audit/scripts/step1_coords.py:37`
- Check: `B314:blacklist`
- Fix: Review blacklist (B314) (CWE-20)

**2. Using xml.etree.ElementTree.parse to parse untrusted XML data is known to be vulnerable to XML attacks. Replace xml.etree.ElementTree.parse with its defusedxml equivalent function or make sure defusedxml.defuse_stdlib() is called (CWE-20)**
- File: `maven-version-audit/scripts/step2_download.py:101`
- Check: `B314:blacklist`
- Fix: Review blacklist (B314) (CWE-20)

**3. Using xml.etree.ElementTree.parse to parse untrusted XML data is known to be vulnerable to XML attacks. Replace xml.etree.ElementTree.parse with its defusedxml equivalent function or make sure defusedxml.defuse_stdlib() is called (CWE-20)**
- File: `maven-version-audit/scripts/step3_doc.py:126`
- Check: `B314:blacklist`
- Fix: Review blacklist (B314) (CWE-20)

**4. Using xml.etree.ElementTree.parse to parse untrusted XML data is known to be vulnerable to XML attacks. Replace xml.etree.ElementTree.parse with its defusedxml equivalent function or make sure defusedxml.defuse_stdlib() is called (CWE-20)**
- File: `maven-version-audit/scripts/step3_doc.py:187`
- Check: `B314:blacklist`
- Fix: Review blacklist (B314) (CWE-20)

**5. Using xml.etree.ElementTree.parse to parse untrusted XML data is known to be vulnerable to XML attacks. Replace xml.etree.ElementTree.parse with its defusedxml equivalent function or make sure defusedxml.defuse_stdlib() is called (CWE-20)**
- File: `maven-version-audit/scripts/verify_ordering.py:36`
- Check: `B314:blacklist`
- Fix: Review blacklist (B314) (CWE-20)

**6. Using xml.etree.ElementTree.parse to parse untrusted XML data is known to be vulnerable to XML attacks. Replace xml.etree.ElementTree.parse with its defusedxml equivalent function or make sure defusedxml.defuse_stdlib() is called (CWE-20)**
- File: `maven-version-audit/scripts/verify_ordering.py:52`
- Check: `B314:blacklist`
- Fix: Review blacklist (B314) (CWE-20)

</details>


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

- [OK] **unicode_scan**: No invisible Unicode characters detected in 8 file(s)

### ✅ B QUALITY
*Skill quality scoring across Correctness (35%), Discoverability (25%), Reliability (25%), and Efficiency (15%)*

**Overall: 82.0/100 (Grade: B)** | Skill Type: script-based

| Dimension | Score | Weight |
|-----------|-------|--------|
| Correctness | 70.0 | 35% |
| Discoverability | 90.0 | 25% |
| Reliability | 80.0 | 25% |
| Efficiency | 100.0 | 15% |

- [OK] **quality_score**: Score: 82.0/100 (Grade: B)

**Non-blocking findings: 10**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | No documented scripts in table format | <code>maven-version-audit/SKILL.md</code> |
| [MED] MEDIUM | Instructions don't mention 'run_script' | <code>maven-version-audit/SKILL.md</code> |
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'version' | <code>maven-version-audit/SKILL.md</code> |
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'metadata.tags' | <code>maven-version-audit/SKILL.md</code> |
| [LOW] LOW | Description very long (991 chars, recommend 50-150) | <code>maven-version-audit/SKILL.md</code> |
| [LOW] LOW | No '## Purpose' section | <code>maven-version-audit/SKILL.md</code> |
| [LOW] LOW | Scripts may lack error handling: _va_paths.py, qa_doc.py | <code>maven-version-audit/SKILL.md</code> |
| [LOW] LOW | No prerequisites/requirements documented | <code>maven-version-audit/SKILL.md</code> |
| [LOW] LOW | No limitations documented | <code>maven-version-audit/SKILL.md</code> |
| [LOW] LOW | No troubleshooting section documented | <code>maven-version-audit/SKILL.md</code> |

<details>
<summary>View Details</summary>

**1. No documented scripts in table format**
- File: `maven-version-audit/SKILL.md`
- Check: `quality_correctness`
- Fix: Add '## Available Scripts' with table: | Script | Purpose | Arguments |

**2. Instructions don't mention 'run_script'**
- File: `maven-version-audit/SKILL.md`
- Check: `quality_correctness`
- Fix: Add explicit run_script() call examples

**3. SKILL_SPEC recommended field missing: 'version'**
- File: `maven-version-audit/SKILL.md`
- Check: `quality_correctness`
- Fix: Add 'version' to frontmatter — Semantic version (e.g., "1.0.0")

**4. SKILL_SPEC recommended field missing: 'metadata.tags'**
- File: `maven-version-audit/SKILL.md`
- Check: `quality_correctness`
- Fix: Add 'tags' under metadata: — Categorization tags (under metadata:, list of 1-5 items)

**5. Description very long (991 chars, recommend 50-150)**
- File: `maven-version-audit/SKILL.md`
- Check: `quality_discoverability`
- Fix: Keep descriptions concise for progressive disclosure

**6. No '## Purpose' section**
- File: `maven-version-audit/SKILL.md`
- Check: `quality_discoverability`
- Fix: Add purpose section to clarify use cases

**7. Scripts may lack error handling: _va_paths.py, qa_doc.py**
- File: `maven-version-audit/SKILL.md`
- Check: `quality_reliability`
- Fix: Scripts should handle errors explicitly

**8. No prerequisites/requirements documented**
- File: `maven-version-audit/SKILL.md`
- Check: `quality_reliability`
- Fix: Document dependencies, API keys, or setup needed

**9. No limitations documented**
- File: `maven-version-audit/SKILL.md`
- Check: `quality_reliability`
- Fix: Add '## Limitations' section with known issues/constraints

**10. No troubleshooting section documented**
- File: `maven-version-audit/SKILL.md`
- Check: `quality_reliability`
- Fix: Add '## Troubleshooting' with Error/Cause/Solution patterns

</details>


### ✅ SCRIPT_LINT
*AST-based code quality checks for skill scripts*

- All checks passed

**Non-blocking findings: 18**

| Severity | Issue | Location |
|----------|-------|----------|
| [LOW] LOW | _va_paths.py missing shebang line | <code>maven-version-audit/scripts/_va_paths.py</code> |
| [LOW] LOW | _va_paths.py may lack input validation | <code>maven-version-audit/scripts/_va_paths.py</code> |
| [LOW] LOW | crosscheck.py contains magic numbers | <code>maven-version-audit/scripts/crosscheck.py</code> |
| [LOW] LOW | crosscheck.py missing shebang line | <code>maven-version-audit/scripts/crosscheck.py</code> |
| [LOW] LOW | crosscheck.py may lack input validation | <code>maven-version-audit/scripts/crosscheck.py</code> |
| [LOW] LOW | qa_doc.py contains magic numbers | <code>maven-version-audit/scripts/qa_doc.py</code> |
| [LOW] LOW | qa_doc.py missing shebang line | <code>maven-version-audit/scripts/qa_doc.py</code> |
| [LOW] LOW | qa_doc.py may lack input validation | <code>maven-version-audit/scripts/qa_doc.py</code> |
| [LOW] LOW | step1_coords.py missing shebang line | <code>maven-version-audit/scripts/step1_coords.py</code> |
| [LOW] LOW | step1_coords.py may lack input validation | <code>maven-version-audit/scripts/step1_coords.py</code> |
| ... | *8 more issues* | |

<details>
<summary>View Details</summary>

**1. _va_paths.py missing shebang line**
- File: `maven-version-audit/scripts/_va_paths.py`
- Check: `missing_shebang`
- Fix: Add: #!/usr/bin/env python3

**2. _va_paths.py may lack input validation**
- File: `maven-version-audit/scripts/_va_paths.py`
- Check: `no_input_validation`
- Fix: Add argument checks and raise descriptive errors

**3. crosscheck.py contains magic numbers**
- File: `maven-version-audit/scripts/crosscheck.py`
- Check: `magic_numbers`
- Fix: Extract magic numbers to named constants

**4. crosscheck.py missing shebang line**
- File: `maven-version-audit/scripts/crosscheck.py`
- Check: `missing_shebang`
- Fix: Add: #!/usr/bin/env python3

**5. crosscheck.py may lack input validation**
- File: `maven-version-audit/scripts/crosscheck.py`
- Check: `no_input_validation`
- Fix: Add argument checks and raise descriptive errors

**6. qa_doc.py contains magic numbers**
- File: `maven-version-audit/scripts/qa_doc.py`
- Check: `magic_numbers`
- Fix: Extract magic numbers to named constants

**7. qa_doc.py missing shebang line**
- File: `maven-version-audit/scripts/qa_doc.py`
- Check: `missing_shebang`
- Fix: Add: #!/usr/bin/env python3

**8. qa_doc.py may lack input validation**
- File: `maven-version-audit/scripts/qa_doc.py`
- Check: `no_input_validation`
- Fix: Add argument checks and raise descriptive errors

**9. step1_coords.py missing shebang line**
- File: `maven-version-audit/scripts/step1_coords.py`
- Check: `missing_shebang`
- Fix: Add: #!/usr/bin/env python3

**10. step1_coords.py may lack input validation**
- File: `maven-version-audit/scripts/step1_coords.py`
- Check: `no_input_validation`
- Fix: Add argument checks and raise descriptive errors

*... and 8 more issues*

</details>


### ✅ Tier 2 Deduplication
*Embedding-based duplicate detection*

- All checks passed

---
*Generated by SkillEvaluator*
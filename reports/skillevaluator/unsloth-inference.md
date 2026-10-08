# SkillEvaluator Validation Report

**Status:** ❌ FAILED
**Profile:** external
**Policy digest:** `sha256:1caeb0bf9c2e044705f32fcdbd773fea4d835d895b4e0ab20d1aaa5e28acd660`
**Generated:** October 08, 2026 at 07:49 AM UTC

## Summary

| Metric | Value |
|--------|-------|
| Validator Results | 11 |
| ✅ Passed | 10 |
| ❌ Failed | 1 |
| ⚠️ Incomplete | 0 |
| Total Issues | 14 (3 critical, 2 medium) |

## Quality Score

| Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
|-------|-------|-------|------|-------------|-----------------|-------------|------------|
| unsloth-inference | 89.5 | B | guide-only | 90.0 | 90.0 | 85.0 | 95.0 |

## Results

### ✅ Schema & Repository Governance
*Validate SKILL.md frontmatter and repository structure*

- [OK] **manifest_exists**: Found skill manifest: SKILL.md
- [OK] **frontmatter_valid**: Valid frontmatter for skill 'unsloth-inference'
- [OK] **folder_hierarchy**: Valid general skill structure: skills/unsloth-inference/
- [OK] **naming_convention**: Folder name 'unsloth-inference' follows kebab-case convention
- [OK] **line_count**: SKILL.md within line limit (331/500)
- [OK] **body_heading**: Body contains a top-level heading
- [OK] **body_recommended_section**: Found recommended section: '## Instructions' (or '## Usage')
- [OK] **body_recommended_section**: Found recommended section: '## Examples'
- [OK] **optional_files**: Found optional supporting files: evals, references
- [OK] **name_consistency**: Directory name matches frontmatter: 'unsloth-inference'
- [OK] **author_format**: Valid author format: Iván Rodríguez Murillo <wantez@gmail.com>

### ✅ Semantic Version Validation
*Validate optional metadata.version labels and require strict bumps*

- [OK] **version_semver**: Valid semantic version: 1.0.0

### ❌ PII Scan
*Detect PII and local identifiers*

**3 errors, 0 warnings**

| Severity | Issue | Location |
|----------|-------|----------|
| [CRIT] CRITICAL | Hardcoded secret/credential in code: api_key="sk-unsloth-xxxxxxxxxxxx" | <code>SKILL.md:127</code> |
| [CRIT] CRITICAL | Hardcoded secret/credential in code: api_key="sk-no-key-required" — 3 occurrences (references/vllm.md line 149; references/llama-server.md lines 60, 141) | <code>references/vllm.md:149</code> |
| [CRIT] CRITICAL | Hardcoded secret/credential in code: AUTH_TOKEN="sk-unsloth-xxxxxxxxxxxx" | <code>references/api.md:194</code> |

<details>
<summary>View Details</summary>

**1. Hardcoded secret/credential in code: api_key="sk-unsloth-xxxxxxxxxxxx"**
- File: `SKILL.md:127`
- Check: `hardcoded_secrets`
- Content: `client = OpenAI(base_url="http://localhost:8888/v1", api_...`
- Fix: Use environment variable or secrets manager instead of hardcoded value

**2. Hardcoded secret/credential in code: api_key="sk-no-key-required" — 3 occurrences (references/vllm.md line 149; references/llama-server.md lines 60, 141)**
- File: `references/vllm.md:149`
- Check: `hardcoded_secrets`
- Content: `openai_client = OpenAI(base_url="http://0.0.0.0:30000/v1"...`
- Fix: Use environment variable or secrets manager instead of hardcoded value

**3. Hardcoded secret/credential in code: AUTH_TOKEN="sk-unsloth-xxxxxxxxxxxx"**
- File: `references/api.md:194`
- Check: `hardcoded_secrets`
- Content: `export ANTHROPIC_AUTH_TOKEN="sk-unsloth-xxxxxxxxxxxx"`
- Fix: Use environment variable or secrets manager instead of hardcoded value

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

### ✅ Code Integrity & Hygiene
*Validate dead links, dependencies, and static Python test-file discovery*

- [OK] **dead_links_scan**: Checking 8 markdown files for dead links
- [OK] **dead_links**: All relative links valid in 8 markdown file(s)
- [OK] **dependencies**: No dependency files found (requirements.txt, pyproject.toml)
- [OK] **test_discovery**: No standard Python test-file candidates found; target tests were not executed and coverage was not measured. Consider adding tests.

### ✅ Unicode Smuggling Detection
*Detect invisible Unicode characters and ASCII smuggling*

- [OK] **unicode_scan**: No invisible Unicode characters detected in 8 file(s)

### ✅ B QUALITY
*Skill quality scoring across Correctness (35%), Discoverability (25%), Reliability (25%), and Efficiency (15%)*

**Overall: 89.5/100 (Grade: B)** | Skill Type: guide-only

| Dimension | Score | Weight |
|-----------|-------|--------|
| Correctness | 90.0 | 35% |
| Discoverability | 90.0 | 25% |
| Reliability | 85.0 | 25% |
| Efficiency | 95.0 | 15% |

- [OK] **quality_score**: Score: 89.5/100 (Grade: B)

**Non-blocking findings: 8**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'version' | <code>unsloth-inference/SKILL.md</code> |
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'metadata.tags' | <code>unsloth-inference/SKILL.md</code> |
| [LOW] LOW | Description very long (842 chars, recommend 50-150) | <code>unsloth-inference/SKILL.md</code> |
| [LOW] LOW | No '## Purpose' section | <code>unsloth-inference/SKILL.md</code> |
| [LOW] LOW | No prerequisites/requirements documented | <code>unsloth-inference/SKILL.md</code> |
| [LOW] LOW | No limitations documented | <code>unsloth-inference/SKILL.md</code> |
| [LOW] LOW | No troubleshooting section documented | <code>unsloth-inference/SKILL.md</code> |
| [LOW] LOW | Non-descriptive filename: api.md | <code>unsloth-inference/SKILL.md</code> |

<details>
<summary>View Details</summary>

**1. SKILL_SPEC recommended field missing: 'version'**
- File: `unsloth-inference/SKILL.md`
- Check: `quality_correctness`
- Fix: Add 'version' to frontmatter — Semantic version (e.g., "1.0.0")

**2. SKILL_SPEC recommended field missing: 'metadata.tags'**
- File: `unsloth-inference/SKILL.md`
- Check: `quality_correctness`
- Fix: Add 'tags' under metadata: — Categorization tags (under metadata:, list of 1-5 items)

**3. Description very long (842 chars, recommend 50-150)**
- File: `unsloth-inference/SKILL.md`
- Check: `quality_discoverability`
- Fix: Keep descriptions concise for progressive disclosure

**4. No '## Purpose' section**
- File: `unsloth-inference/SKILL.md`
- Check: `quality_discoverability`
- Fix: Add purpose section to clarify use cases

**5. No prerequisites/requirements documented**
- File: `unsloth-inference/SKILL.md`
- Check: `quality_reliability`
- Fix: Document dependencies, API keys, or setup needed

**6. No limitations documented**
- File: `unsloth-inference/SKILL.md`
- Check: `quality_reliability`
- Fix: Add '## Limitations' section with known issues/constraints

**7. No troubleshooting section documented**
- File: `unsloth-inference/SKILL.md`
- Check: `quality_reliability`
- Fix: Add '## Troubleshooting' with Error/Cause/Solution patterns

**8. Non-descriptive filename: api.md**
- File: `unsloth-inference/SKILL.md`
- Check: `quality_efficiency`
- Fix: Use descriptive names: 'form_validation_rules.md' not 'doc2.md'

</details>


### ✅ SCRIPT_LINT
*AST-based code quality checks for skill scripts*

- [OK] **lint**: No scripts/ or tools/ directory found

### ✅ Tier 2 Deduplication
*Embedding-based duplicate detection*

- All checks passed

---
*Generated by SkillEvaluator*
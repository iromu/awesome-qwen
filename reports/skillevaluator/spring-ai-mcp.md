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
| Total Issues | 14 (1 high, 2 medium) |

## Quality Score

| Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
|-------|-------|-------|------|-------------|-----------------|-------------|------------|
| spring-ai-mcp | 88.0 | B | guide-only | 90.0 | 90.0 | 85.0 | 85.0 |

## Results

### ✅ Schema & Repository Governance
*Validate SKILL.md frontmatter and repository structure*

- [OK] **manifest_exists**: Found skill manifest: SKILL.md
- [OK] **frontmatter_valid**: Valid frontmatter for skill 'spring-ai-mcp'
- [OK] **folder_hierarchy**: Valid general skill structure: skills/spring-ai-mcp/
- [OK] **naming_convention**: Folder name 'spring-ai-mcp' follows kebab-case convention
- [OK] **line_count**: SKILL.md within line limit (495/500)
- [OK] **body_heading**: Body contains a top-level heading
- [OK] **body_recommended_section**: Found recommended section: '## Instructions' (or '## Usage')
- [OK] **body_recommended_section**: Found recommended section: '## Examples'
- [OK] **optional_files**: Found optional supporting files: references
- [OK] **name_consistency**: Directory name matches frontmatter: 'spring-ai-mcp'
- [OK] **author_format**: Valid author format: Iván Rodríguez Murillo <wantez@gmail.com>

**Non-blocking findings: 1**

| Severity | Issue | Location |
|----------|-------|----------|
| [LOW] LOW | Unexpected '-' in skill root | <code>spring-ai-mcp/-</code> |

<details>
<summary>View Details</summary>

**1. Unexpected '-' in skill root**
- File: `spring-ai-mcp/-`
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

### ✅ Code Integrity & Hygiene
*Validate dead links, dependencies, and static Python test-file discovery*

- [OK] **dead_links_scan**: Checking 9 markdown files for dead links
- [OK] **dead_links**: All relative links valid in 9 markdown file(s)
- [OK] **dependencies**: No dependency files found (requirements.txt, pyproject.toml)
- [OK] **test_discovery**: No standard Python test-file candidates found; target tests were not executed and coverage was not measured. Consider adding tests.

### ✅ Unicode Smuggling Detection
*Detect invisible Unicode characters and ASCII smuggling*

- All checks passed

**Non-blocking findings: 2**

| Severity | Issue | Location |
|----------|-------|----------|
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>SKILL.md:295</code> |
| [LOW] LOW | Isolated invisible character(s) (1): VARIATION SELECTOR-16 | <code>references/security-and-testing.md:5</code> |

<details>
<summary>View Details</summary>

**1. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `SKILL.md:295`
- Check: `isolated_invisible_char`
- Content: `> **⚠️ Security is Work In Progress.** The Spring AI MCP ...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

**2. Isolated invisible character(s) (1): VARIATION SELECTOR-16**
- File: `references/security-and-testing.md:5`
- Check: `isolated_invisible_char`
- Content: `> **⚠️ Work In Progress.** MCP security features are mark...`
- Fix: Likely a copy-paste artifact. Remove if not intentional.

</details>


### ❌ B QUALITY
*Skill quality scoring across Correctness (35%), Discoverability (25%), Reliability (25%), and Efficiency (15%)*

**Overall: 88.0/100 (Grade: B)** | Skill Type: guide-only

| Dimension | Score | Weight |
|-----------|-------|--------|
| Correctness | 90.0 | 35% |
| Discoverability | 90.0 | 25% |
| Reliability | 85.0 | 25% |
| Efficiency | 85.0 | 15% |

**1 errors, 7 warnings**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'version' | <code>spring-ai-mcp/SKILL.md</code> |
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'metadata.tags' | <code>spring-ai-mcp/SKILL.md</code> |
| [LOW] LOW | Description very long (995 chars, recommend 50-150) | <code>spring-ai-mcp/SKILL.md</code> |
| [LOW] LOW | No '## Purpose' section | <code>spring-ai-mcp/SKILL.md</code> |
| [LOW] LOW | No prerequisites/requirements documented | <code>spring-ai-mcp/SKILL.md</code> |
| [LOW] LOW | No limitations documented | <code>spring-ai-mcp/SKILL.md</code> |
| [LOW] LOW | No troubleshooting section documented | <code>spring-ai-mcp/SKILL.md</code> |
| [HIGH] HIGH | Large skill (5488 tokens, recommended max &lt;5000). Per agentskills.io, SKILL.md should be concise (~500 lines) — large skill bodies increase token cost after invocation; long or unfocused top-level descriptions can degrade agent routing accuracy | <code>spring-ai-mcp/SKILL.md</code> |

<details>
<summary>View Details</summary>

**1. SKILL_SPEC recommended field missing: 'version'**
- File: `spring-ai-mcp/SKILL.md`
- Check: `quality_correctness`
- Fix: Add 'version' to frontmatter — Semantic version (e.g., "1.0.0")

**2. SKILL_SPEC recommended field missing: 'metadata.tags'**
- File: `spring-ai-mcp/SKILL.md`
- Check: `quality_correctness`
- Fix: Add 'tags' under metadata: — Categorization tags (under metadata:, list of 1-5 items)

**3. Description very long (995 chars, recommend 50-150)**
- File: `spring-ai-mcp/SKILL.md`
- Check: `quality_discoverability`
- Fix: Keep descriptions concise for progressive disclosure

**4. No '## Purpose' section**
- File: `spring-ai-mcp/SKILL.md`
- Check: `quality_discoverability`
- Fix: Add purpose section to clarify use cases

**5. No prerequisites/requirements documented**
- File: `spring-ai-mcp/SKILL.md`
- Check: `quality_reliability`
- Fix: Document dependencies, API keys, or setup needed

**6. No limitations documented**
- File: `spring-ai-mcp/SKILL.md`
- Check: `quality_reliability`
- Fix: Add '## Limitations' section with known issues/constraints

**7. No troubleshooting section documented**
- File: `spring-ai-mcp/SKILL.md`
- Check: `quality_reliability`
- Fix: Add '## Troubleshooting' with Error/Cause/Solution patterns

**8. Large skill (5488 tokens, recommended max <5000). Per agentskills.io, SKILL.md should be concise (~500 lines) — large skill bodies increase token cost after invocation; long or unfocused top-level descriptions can degrade agent routing accuracy**
- File: `spring-ai-mcp/SKILL.md`
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
# SkillEvaluator Validation Report

**Status:** ✅ PASSED
**Profile:** external
**Policy digest:** `sha256:1caeb0bf9c2e044705f32fcdbd773fea4d835d895b4e0ab20d1aaa5e28acd660`
**Generated:** October 30, 2026 at 11:15 AM UTC

## Summary

| Metric | Value |
|--------|-------|
| Validator Results | 11 |
| ✅ Passed | 11 |
| ❌ Failed | 0 |
| ⚠️ Incomplete | 0 |
| Total Issues | 14 (5 medium) |

## Quality Score

| Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
|-------|-------|-------|------|-------------|-----------------|-------------|------------|
| embabel-worlds-realm-spec | 98.8 | A | guide-only | 100.0 | 95.0 | 100.0 | 100.0 |

## Results

### ✅ Schema & Repository Governance
*Validate SKILL.md frontmatter and repository structure*

- [OK] **manifest_exists**: Found skill manifest: SKILL.md
- [OK] **frontmatter_valid**: Valid frontmatter for skill 'embabel-worlds-realm-spec'
- [OK] **folder_hierarchy**: Valid general skill structure: skills/embabel-worlds-realm-spec/
- [OK] **naming_convention**: Folder name 'embabel-worlds-realm-spec' follows kebab-case convention
- [OK] **line_count**: SKILL.md within line limit (326/500)
- [OK] **body_heading**: Body contains a top-level heading
- [OK] **body_recommended_section**: Found recommended section: '## Instructions' (or '## Usage')
- [OK] **body_recommended_section**: Found recommended section: '## Examples'
- [OK] **optional_files**: Found optional supporting files: evals, references, tests
- [OK] **name_consistency**: Directory name matches frontmatter: 'embabel-worlds-realm-spec'
- [OK] **author_format**: Valid author format: Iván Rodríguez Murillo <wantez@gmail.com>

**Non-blocking findings: 6**

| Severity | Issue | Location |
|----------|-------|----------|
| [LOW] LOW | Unexpected 'realm.yml' in skill root | <code>/home/wantez/source/github/iromu/awesome-qwen/skills/embabel-worlds-realm-spec/realm.yml</code> |
| [LOW] LOW | Unexpected 'realm.ts' in skill root | <code>/home/wantez/source/github/iromu/awesome-qwen/skills/embabel-worlds-realm-spec/realm.ts</code> |
| [LOW] LOW | Unexpected '-' in skill root | <code>/home/wantez/source/github/iromu/awesome-qwen/skills/embabel-worlds-realm-spec/-</code> |
| [LOW] LOW | Unexpected 'wasm' in skill root | <code>/home/wantez/source/github/iromu/awesome-qwen/skills/embabel-worlds-realm-spec/wasm</code> |
| [LOW] LOW | Unexpected 'keys.yml' in skill root | <code>/home/wantez/source/github/iromu/awesome-qwen/skills/embabel-worlds-realm-spec/keys.yml</code> |
| [LOW] LOW | Unexpected 'sources.yml' in skill root | <code>/home/wantez/source/github/iromu/awesome-qwen/skills/embabel-worlds-realm-spec/sources.yml</code> |

<details>
<summary>View Details</summary>

**1. Unexpected 'realm.yml' in skill root**
- File: `/home/wantez/source/github/iromu/awesome-qwen/skills/embabel-worlds-realm-spec/realm.yml`
- Check: `unexpected_file`
- Fix: Consider moving to one of: agents/, assets/, config/, evals/, references/, scripts/, tests/, tools/. To allow additional directories, set $SKILLEVALUATOR_SCHEMA_ALLOWED_DIRS.

**2. Unexpected 'realm.ts' in skill root**
- File: `/home/wantez/source/github/iromu/awesome-qwen/skills/embabel-worlds-realm-spec/realm.ts`
- Check: `unexpected_file`
- Fix: Consider moving to one of: agents/, assets/, config/, evals/, references/, scripts/, tests/, tools/. To allow additional directories, set $SKILLEVALUATOR_SCHEMA_ALLOWED_DIRS.

**3. Unexpected '-' in skill root**
- File: `/home/wantez/source/github/iromu/awesome-qwen/skills/embabel-worlds-realm-spec/-`
- Check: `unexpected_file`
- Fix: Consider moving to one of: agents/, assets/, config/, evals/, references/, scripts/, tests/, tools/. To allow additional directories, set $SKILLEVALUATOR_SCHEMA_ALLOWED_DIRS.

**4. Unexpected 'wasm' in skill root**
- File: `/home/wantez/source/github/iromu/awesome-qwen/skills/embabel-worlds-realm-spec/wasm`
- Check: `unexpected_file`
- Fix: Consider moving to one of: agents/, assets/, config/, evals/, references/, scripts/, tests/, tools/. To allow additional directories, set $SKILLEVALUATOR_SCHEMA_ALLOWED_DIRS.

**5. Unexpected 'keys.yml' in skill root**
- File: `/home/wantez/source/github/iromu/awesome-qwen/skills/embabel-worlds-realm-spec/keys.yml`
- Check: `unexpected_file`
- Fix: Consider moving to one of: agents/, assets/, config/, evals/, references/, scripts/, tests/, tools/. To allow additional directories, set $SKILLEVALUATOR_SCHEMA_ALLOWED_DIRS.

**6. Unexpected 'sources.yml' in skill root**
- File: `/home/wantez/source/github/iromu/awesome-qwen/skills/embabel-worlds-realm-spec/sources.yml`
- Check: `unexpected_file`
- Fix: Consider moving to one of: agents/, assets/, config/, evals/, references/, scripts/, tests/, tools/. To allow additional directories, set $SKILLEVALUATOR_SCHEMA_ALLOWED_DIRS.

</details>


### ✅ Semantic Version Validation
*Validate optional metadata.version labels and require strict bumps*

- [OK] **version_semver**: Valid semantic version: 1.0.0

### ✅ Security Scan
*Detect security vulnerabilities and PII/secrets*

- [OK] **skillspector**: Security scan completed - 5 advisory finding(s) (no critical/high issues)

**Non-blocking findings: 5**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | MCP Least Privilege: Skill declares no tool scope ('permissions' or 'allowed-tools') but code capabilities were detected: shell. | <code>SKILL.md:1</code> |
| [MED] MEDIUM | Data Exfiltration: https://api.example.com/ | <code>references/apis-keys-credentials.md:102</code> |
| [MED] MEDIUM | Data Exfiltration: https://api.example.com/ | <code>references/apis-keys-credentials.md:107</code> |
| [MED] MEDIUM | MCP Rug Pull: docker run --entrypoint | <code>references/validation-ci.md:45</code> |
| [MED] MEDIUM | Data Exfiltration: curl -sf -X POST "$BASE/admin/kg/views/$view/run" \<br>#            -H 'content-type: application/json' -d '{"args": {}}')<br>#   ... assert non-zero rows and no error-class warnings ...<br># done<br><br># 2) Prove  | <code>tests/verify.sh:30</code> |

<details>
<summary>View Details</summary>

**1. MCP Least Privilege: Skill declares no tool scope ('permissions' or 'allowed-tools') but code capabilities were detected: shell.**
- File: `SKILL.md:1`
- Check: `Skill declares no tool scope ('permissions' or 'allowed-tools') but code capabilities were detected: shell. (LP3)`
- Fix: Without declared permissions the skill's intent is opaque and cannot be validated. Declare the skill's tool scope: for Claude Code / Agent Skills SKILL.md, list the tools the skill may invoke in the 'allowed-tools' frontmatter field; for MCP server manifests, add a 'permissions' list naming the required capabilities.

**2. Data Exfiltration: https://api.example.com/**
- File: `references/apis-keys-credentials.md:102`
- Check: `External Transmission (E1)`
- Content: `auth: oauth2
  oauth2:
    auth-url: https://app.example....`
- Fix: Data is being sent to an external URL. This could be legitimate telemetry or data exfiltration. Manual review is recommended. Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

**3. Data Exfiltration: https://api.example.com/**
- File: `references/apis-keys-credentials.md:107`
- Check: `External Transmission (E1)`
- Content: `auth: oauth2
  oauth2:
    auth-url: https://app.example....`
- Fix: Data is being sent to an external URL. This could be legitimate telemetry or data exfiltration. Manual review is recommended. Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

**4. MCP Rug Pull: docker run --entrypoint**
- File: `references/validation-ci.md:45`
- Check: `Docker image referenced without tag or digest: 'docker run --entrypoint'. (RP1)`
- Fix: Docker image references without a specific tag (:latest is implicit) or digest (@sha256:...) can be silently replaced by a malicious image. Pin the image: image:tag or image@sha256:abc123

**5. Data Exfiltration: curl -sf -X POST "$BASE/admin/kg/views/$view/run" \
#            -H 'content-type: application/json' -d '{"args": {}}')
#   ... assert non-zero rows and no error-class warnings ...
# done

# 2) Prove **
- File: `tests/verify.sh:30`
- Check: `External Transmission (E1)`
- Content: `#    PRODUCER_ERROR / FIELDS_WITHHELD / UNPUSHED_FILTER n...`
- Fix: Data is being sent to an external URL. This could be legitimate telemetry or data exfiltration. Manual review is recommended. Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

</details>


### ✅ PII Scan
*Detect PII and local identifiers*

- [OK] **pii_scan_start**: Scanning 19 files for PII
- [OK] **pii_detection**: No PII detected in 19 files (emails, SSNs, phone numbers, paths)

### ✅ License Compliance
*Validate license compliance for Skills, Rules, and Workflows*

- No license detected in any tier

### ✅ Code Risk Analysis
*Static code analysis using Bandit and packaged Semgrep rules*

- Found 0 Python, 1 Shell, 2 JavaScript/TypeScript files
- Semgrep: No security issues found

### ✅ Secrets Detection
*Detect hardcoded secrets, API keys, and credentials using Gitleaks*

- No secrets detected by Gitleaks

### ✅ Code Integrity & Hygiene
*Validate dead links, dependencies, and static Python test-file discovery*

- [OK] **dead_links_scan**: Checking 14 markdown files for dead links
- [OK] **dead_links**: All relative links valid in 14 markdown file(s)
- [OK] **dependencies**: No dependency files found (requirements.txt, pyproject.toml)
- [OK] **test_discovery**: No standard Python test-file candidates found; target tests were not executed and coverage was not measured. Consider adding tests.

### ✅ Unicode Smuggling Detection
*Detect invisible Unicode characters and ASCII smuggling*

- [OK] **unicode_scan**: No invisible Unicode characters detected in 21 file(s)

### ✅ A QUALITY
*Skill quality scoring across Correctness (35%), Discoverability (25%), Reliability (25%), and Efficiency (15%)*

**Overall: 98.8/100 (Grade: A)** | Skill Type: guide-only

| Dimension | Score | Weight |
|-----------|-------|--------|
| Correctness | 100.0 | 35% |
| Discoverability | 95.0 | 25% |
| Reliability | 100.0 | 25% |
| Efficiency | 100.0 | 15% |

- [OK] **quality_score**: Score: 98.8/100 (Grade: A)

**Non-blocking findings: 1**

| Severity | Issue | Location |
|----------|-------|----------|
| [LOW] LOW | Description very long (720 chars, recommend 50-150) | <code>/home/wantez/source/github/iromu/awesome-qwen/skills/embabel-worlds-realm-spec/SKILL.md</code> |

<details>
<summary>View Details</summary>

**1. Description very long (720 chars, recommend 50-150)**
- File: `/home/wantez/source/github/iromu/awesome-qwen/skills/embabel-worlds-realm-spec/SKILL.md`
- Check: `quality_discoverability`
- Fix: Keep descriptions concise for progressive disclosure

</details>


### ✅ SCRIPT_LINT
*AST-based code quality checks for skill scripts*

- [OK] **lint**: No scripts/ or tools/ directory found

---
*Generated by SkillEvaluator*
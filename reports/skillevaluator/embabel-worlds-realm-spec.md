# SkillEvaluator Validation Report

**Status:** ✅ PASSED
**Profile:** external
**Policy digest:** `sha256:1caeb0bf9c2e044705f32fcdbd773fea4d835d895b4e0ab20d1aaa5e28acd660`
**Generated:** November 06, 2026 at 03:33 PM UTC

## Summary

| Metric | Value |
|--------|-------|
| Validator Results | 9 |
| ✅ Passed | 9 |
| ❌ Failed | 0 |
| ⚠️ Incomplete | 0 |
| Total Issues | 8 |

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

**Non-blocking findings: 5**

| Severity | Issue | Location |
|----------|-------|----------|
| [LOW] LOW | Unexpected 'realm.yml' in skill root | <code>embabel-worlds-realm-spec/realm.yml</code> |
| [LOW] LOW | Unexpected 'realm.ts' in skill root | <code>embabel-worlds-realm-spec/realm.ts</code> |
| [LOW] LOW | Unexpected 'wasm' in skill root | <code>embabel-worlds-realm-spec/wasm</code> |
| [LOW] LOW | Unexpected 'keys.yml' in skill root | <code>embabel-worlds-realm-spec/keys.yml</code> |
| [LOW] LOW | Unexpected 'sources.yml' in skill root | <code>embabel-worlds-realm-spec/sources.yml</code> |

<details>
<summary>View Details</summary>

**1. Unexpected 'realm.yml' in skill root**
- File: `embabel-worlds-realm-spec/realm.yml`
- Check: `unexpected_file`
- Fix: Consider moving to one of: agentic-patterns-core-card.md/, agentic-patterns-extra-card.md/, agentic-patterns-research-card.md/, agents/, api-design-card.md/, assets/, config/, database-migration-card.md/, docker-containerize-card.md/, embabel-agent-card.md/, embabel-chatbot-card.md/, embabel-dice-card.md/, embabel-drivine4j-card.md/, embabel-otel-card.md/, evals/, git-commit-card.md/, git-workflows-card.md/, htmx-card.md/, json-formatting-card.md/, maven-version-audit-card.md/, rabbitmq-typescript-card.md/, references/, scripts/, security-audit-card.md/, self-learning-card.md/, skill-creator-card.md/, spring-ai-mcp-card.md/, tests/, tools/, unsloth-finetuning-card.md/, unsloth-inference-card.md/, unsloth-quantization-card.md/, unsloth-rl-card.md/, yaml-validator-card.md/. To allow additional directories, set $SKILLEVALUATOR_SCHEMA_ALLOWED_DIRS.

**2. Unexpected 'realm.ts' in skill root**
- File: `embabel-worlds-realm-spec/realm.ts`
- Check: `unexpected_file`
- Fix: Consider moving to one of: agentic-patterns-core-card.md/, agentic-patterns-extra-card.md/, agentic-patterns-research-card.md/, agents/, api-design-card.md/, assets/, config/, database-migration-card.md/, docker-containerize-card.md/, embabel-agent-card.md/, embabel-chatbot-card.md/, embabel-dice-card.md/, embabel-drivine4j-card.md/, embabel-otel-card.md/, evals/, git-commit-card.md/, git-workflows-card.md/, htmx-card.md/, json-formatting-card.md/, maven-version-audit-card.md/, rabbitmq-typescript-card.md/, references/, scripts/, security-audit-card.md/, self-learning-card.md/, skill-creator-card.md/, spring-ai-mcp-card.md/, tests/, tools/, unsloth-finetuning-card.md/, unsloth-inference-card.md/, unsloth-quantization-card.md/, unsloth-rl-card.md/, yaml-validator-card.md/. To allow additional directories, set $SKILLEVALUATOR_SCHEMA_ALLOWED_DIRS.

**3. Unexpected 'wasm' in skill root**
- File: `embabel-worlds-realm-spec/wasm`
- Check: `unexpected_file`
- Fix: Consider moving to one of: agentic-patterns-core-card.md/, agentic-patterns-extra-card.md/, agentic-patterns-research-card.md/, agents/, api-design-card.md/, assets/, config/, database-migration-card.md/, docker-containerize-card.md/, embabel-agent-card.md/, embabel-chatbot-card.md/, embabel-dice-card.md/, embabel-drivine4j-card.md/, embabel-otel-card.md/, evals/, git-commit-card.md/, git-workflows-card.md/, htmx-card.md/, json-formatting-card.md/, maven-version-audit-card.md/, rabbitmq-typescript-card.md/, references/, scripts/, security-audit-card.md/, self-learning-card.md/, skill-creator-card.md/, spring-ai-mcp-card.md/, tests/, tools/, unsloth-finetuning-card.md/, unsloth-inference-card.md/, unsloth-quantization-card.md/, unsloth-rl-card.md/, yaml-validator-card.md/. To allow additional directories, set $SKILLEVALUATOR_SCHEMA_ALLOWED_DIRS.

**4. Unexpected 'keys.yml' in skill root**
- File: `embabel-worlds-realm-spec/keys.yml`
- Check: `unexpected_file`
- Fix: Consider moving to one of: agentic-patterns-core-card.md/, agentic-patterns-extra-card.md/, agentic-patterns-research-card.md/, agents/, api-design-card.md/, assets/, config/, database-migration-card.md/, docker-containerize-card.md/, embabel-agent-card.md/, embabel-chatbot-card.md/, embabel-dice-card.md/, embabel-drivine4j-card.md/, embabel-otel-card.md/, evals/, git-commit-card.md/, git-workflows-card.md/, htmx-card.md/, json-formatting-card.md/, maven-version-audit-card.md/, rabbitmq-typescript-card.md/, references/, scripts/, security-audit-card.md/, self-learning-card.md/, skill-creator-card.md/, spring-ai-mcp-card.md/, tests/, tools/, unsloth-finetuning-card.md/, unsloth-inference-card.md/, unsloth-quantization-card.md/, unsloth-rl-card.md/, yaml-validator-card.md/. To allow additional directories, set $SKILLEVALUATOR_SCHEMA_ALLOWED_DIRS.

**5. Unexpected 'sources.yml' in skill root**
- File: `embabel-worlds-realm-spec/sources.yml`
- Check: `unexpected_file`
- Fix: Consider moving to one of: agentic-patterns-core-card.md/, agentic-patterns-extra-card.md/, agentic-patterns-research-card.md/, agents/, api-design-card.md/, assets/, config/, database-migration-card.md/, docker-containerize-card.md/, embabel-agent-card.md/, embabel-chatbot-card.md/, embabel-dice-card.md/, embabel-drivine4j-card.md/, embabel-otel-card.md/, evals/, git-commit-card.md/, git-workflows-card.md/, htmx-card.md/, json-formatting-card.md/, maven-version-audit-card.md/, rabbitmq-typescript-card.md/, references/, scripts/, security-audit-card.md/, self-learning-card.md/, skill-creator-card.md/, spring-ai-mcp-card.md/, tests/, tools/, unsloth-finetuning-card.md/, unsloth-inference-card.md/, unsloth-quantization-card.md/, unsloth-rl-card.md/, yaml-validator-card.md/. To allow additional directories, set $SKILLEVALUATOR_SCHEMA_ALLOWED_DIRS.

</details>


### ✅ Semantic Version Validation
*Validate optional metadata.version labels and require strict bumps*

- [OK] **version_semver**: Valid semantic version: 1.0.0

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
| [LOW] LOW | Description very long (720 chars, recommend 50-150) | <code>embabel-worlds-realm-spec/SKILL.md</code> |

<details>
<summary>View Details</summary>

**1. Description very long (720 chars, recommend 50-150)**
- File: `embabel-worlds-realm-spec/SKILL.md`
- Check: `quality_discoverability`
- Fix: Keep descriptions concise for progressive disclosure

</details>


### ✅ SCRIPT_LINT
*AST-based code quality checks for skill scripts*

- [OK] **lint**: No scripts/ or tools/ directory found

---
*Generated by SkillEvaluator*
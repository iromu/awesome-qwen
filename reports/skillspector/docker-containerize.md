# SkillSpector Security Report

**Skill:** docker-containerize  
**Scanned:** 2026-10-08 03:46:14 UTC  

> ⚠️ **Degraded scan:** LLM analysis was requested but 1 of 5 LLM call(s) failed - results reflect STATIC analysis only for the affected batch(es).

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 51/100 |
| Severity | HIGH |
| Recommendation | DO NOT INSTALL |

## Components (2)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `SKILL.md` | markdown | 251 | No |
| `references/example-dockerfiles.md` | markdown | 264 | No |

## Issues (7)

### 🔴 HIGH: PE3

**Location:** `SKILL.md:142`  
**Confidence:** 70%  

**Message:** Credential Access

**Remediation:** Remove references to credential paths. Use environment variables or secrets managers. For docs, use placeholder paths (e.g., /path/to/config). Never load .env or token files in production code paths.

---

### 🔴 HIGH: PE3

**Location:** `SKILL.md:172`  
**Confidence:** 60%  

**Message:** Credential Access

**Remediation:** Remove references to credential paths. Use environment variables or secrets managers. For docs, use placeholder paths (e.g., /path/to/config). Never load .env or token files in production code paths.

---

### 🟡 MEDIUM: SQP-2

**Location:** `SKILL.md:165–177`  
**Confidence:** 70%  

**Message:** The skill combines two patterns that, if copied literally, can leak secrets: the multi-stage example uses 'COPY . .' in the builder stage (line ~39), and the .dockerignore example lists .env/.env.* but omits the 'secrets/' directory that the Compose example instructs users to populate with a plaintext DB password (secrets/db_password.txt). Because the build context is sent in full and COPY . . copies it, a user following the example verbatim bakes the secrets/ directory into the builder image layer and build cache, where it can be recovered from pushed/cached layers or inspected with tools like dive. This is a documentation/security-guidance gap, not malicious, but it directly contradicts the skill's own 'do not bake secrets into layers' checklist.

**Remediation:** Add 'secrets/' and 'secrets/**' to the .dockerignore example (alongside .env/.env.*). Explicitly warn that COPY . . copies the whole build context, so secrets must be excluded via .dockerignore or mounted at runtime via Docker/Compose secrets (tmpfs) rather than copied. Recommend mounting secrets as tmpfs (e.g. target: /run/secrets, read-only) and verify with 'docker build --no-cache' plus dive/secret-scanning (gitleaks/trufflehog) on the build context and final image.

---

### 🟡 MEDIUM: RP1

**Location:** `SKILL.md:231`  
**Confidence:** 75%  

**Message:** Docker image referenced without tag or digest: 'docker run --rm`'.

**Remediation:** Pin the image: image:tag or image@sha256:abc123

---

### 🟡 MEDIUM: SSRF2

**Location:** `references/example-dockerfiles.md:127`  
**Confidence:** 70%  

**Message:** Internal Network Request

**Remediation:** Avoid requests to loopback/link-local/private hosts from skill code. If internal access is intended, document it and validate the target against an allowlist.

---

### 🟡 MEDIUM: SSRF2

**Location:** `references/example-dockerfiles.md:241`  
**Confidence:** 70%  

**Message:** Internal Network Request

**Remediation:** Avoid requests to loopback/link-local/private hosts from skill code. If internal access is intended, document it and validate the target against an allowlist.

---

### 🟢 LOW: SQP-2

**Location:** `references/example-dockerfiles.md:11–243`  
**Confidence:** 45%  

**Message:** Reference doc gives Dockerfile templates that copy the whole build context (`COPY . .` at L011, L041, L122, L142, L166, L231, L238) and expose ports, with no caveat that the examples must be adapted (e.g. an accompanying `.dockerignore`, secret-free build context) before use.

**Remediation:** Add a short preamble such as "These are illustrative templates - adapt them to your project and always pair them with a `.dockerignore` so that secrets, `.git`, and local env files are not copied into the image" and call out the per-stack placeholders that do not exist by default (`server.js`, `nginx.conf`, `supervisord.conf`).

---

## Inspection Completeness

| Metric | Value |
|--------|-------|
| Execution | successful |
| Status | partial |
| Coverage | 50.0% |
| Fully inspected | 1 |
| Partially inspected | 1 |
| Entirely uninspected | 0 |

### Ledger Exceptions

| Reason / Status | Location | Details |
|-----------------|----------|---------|
| semantic_runtime_incomplete | `SKILL.md` | Requested semantic analysis did not produce complete per-source runtime telemetry. |
| reference_missing | `SKILL.md:47-47` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:51-51` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| llm_structured_response_invalid | `SKILL.md:66-75` | LLM returned a malformed structured response after bounded retries. |
| reference_missing | `SKILL.md:94-94` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:135-135` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:142-142` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:186-186` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:187-187` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:193-193` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |

### Analyzer Statuses

| Reason / Status | Location | Details |
|-----------------|----------|---------|
| completed | `artifact_integrity` |  |
| no_applicable_files | `behavioral_ast` | No files matched this analyzer's applicability contract. |
| no_applicable_files | `behavioral_taint_tracking` | No files matched this analyzer's applicability contract. |
| no_applicable_files | `bundled_execution_surface` | No files matched this analyzer's applicability contract. |
| no_applicable_files | `mcp_least_privilege` | No files matched this analyzer's applicability contract. |
| completed | `mcp_rug_pull` |  |
| degraded | `mcp_tool_poisoning` |  |
| completed | `meta_analyzer` |  |
| completed | `semantic_developer_intent` |  |
| completed | `semantic_quality_policy` |  |
| completed | `semantic_security_discovery` |  |
| completed | `static_patterns_agent_snooping` |  |
| completed | `static_patterns_anti_refusal` |  |
| completed | `static_patterns_data_exfiltration` |  |
| completed | `static_patterns_deserialization` |  |
| completed | `static_patterns_excessive_agency` |  |
| completed | `static_patterns_harmful_content` |  |
| completed | `static_patterns_memory_poisoning` |  |
| completed | `static_patterns_output_handling` |  |
| completed | `static_patterns_privilege_escalation` |  |
| completed | `static_patterns_prompt_injection` |  |
| completed | `static_patterns_rogue_agent` |  |
| completed | `static_patterns_ssrf` |  |
| completed | `static_patterns_supply_chain` |  |
| completed | `static_patterns_system_prompt_leakage` |  |
| completed | `static_patterns_tool_misuse` |  |
| completed | `static_yara` |  |

### Limitations

- Analyzer mcp_tool_poisoning status: degraded.

## Metadata

- **Executable Scripts:** No

*Generated by SkillSpector v2.12.0*

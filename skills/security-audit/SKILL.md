---
name: security-audit
description: >
  Scan for security vulnerabilities, check dependencies for CVEs, detect secrets in code,
  run SAST analysis, audit for OWASP Top 10, or need a security checklist. Use this skill
  when the user mentions dependency scanning, secrets detection, SAST, code security review,
  vulnerability assessment, compliance checklist, OWASP Top 10, or pre-deployment security
  checks. Don't hesitate to suggest this skill when the user is working on shipping code to
  production, adding third-party libraries, or setting up CI/CD security gates.
version: 1.0.0
category: security
tags: [security, owasp, scanning, dependencies, secrets, sast, vulnerabilities]
---

# Security Audit

## When to Use

- Before a production deployment
- After adding new dependencies
- During code review for security-sensitive changes
- Setting up automated security checks in CI/CD
- Responding to a security advisory or CVE disclosure
- Preparing for a security compliance audit (SOC 2, ISO 27001)
- Reviewing a pull request that touches auth, crypto, or data handling

## Procedure

### 1. Dependency Scanning

Scan third-party dependencies for known CVEs and unmaintained packages.

```bash
# Node.js
npm audit
npm audit --audit-level=high
npx audit-ci --high

# Python
pip-audit
safety check

# Java (Maven)
mvn org.owasp:dependency-check-maven:check

# Ruby
bundle audit

# Go
govulncheck ./...

# Multi-language / language-agnostic
snyk test
trivy fs .
grype .
```

**CI/CD integration:**

```yaml
# GitHub Actions example
- name: Run dependency audit
  run: npm audit --audit-level=high || true
- name: Run Snyk scan
  run: npx @snyk/cli protect --severity-threshold=high
```

### 2. Secrets Detection

Detect hardcoded secrets, API keys, tokens, and certificates in code and git history.

```bash
# Scan current codebase
gitleaks detect --source="." -v
gitleaks protect --source="."

# Scan git history
trufflehog git file://. --json

# Pre-commit hook to prevent future leaks
# Add to .git/hooks/pre-commit:
# gitleaks detect --staged --source="." -v

# Alternative: detect-secrets (Yelp)
detect-secrets scan --all-files > .secrets.baseline
detect-secrets audit .secrets.baseline
```

### 3. Static Application Security Testing (SAST)

Automated code analysis for common vulnerability patterns.

```bash
# Generic multi-language SAST
semgrep --config=auto .
semgrep --config=p/default .  # OWASP rules

# Snyk code (deep AST analysis)
snyk code test

# SonarQube / SonarScanner
sonar-scanner -Dsonar.qualitygate.wait=true

# Checkmarx (enterprise)
cxscan scan --source . --language javascript

# Language-specific:
# JavaScript/TypeScript
npx eslint --plugin eslint-plugin-security .

# Python
bandit -r . -f json -s B105  # skip hardcoded password checks if intentional

# Java
# SpotBugs with security plugin
mvn com.github.spotbugs:spotbugs-maven-plugin:check

# Go
gosec ./...
```

### 4. Common OWASP Top 10 Checks

| # | Vulnerability | What to Look For |
|---|--------------|------------------|
| A01 | Broken Access Control | Missing auth checks, IDOR, privilege escalation |
| A02 | Cryptographic Failures | Hardcoded keys, weak algorithms, plaintext secrets |
| A03 | Injection | Unparameterized queries, unescaped user input |
| A04 | Insecure Design | Missing rate limiting, no business logic validation |
| A05 | Security Misconfiguration | Default credentials, verbose errors, open ports |
| A06 | Vulnerable Components | Outdated dependencies with known CVEs |
| A07 | Auth Failures | Weak passwords, session fixation, missing MFA |
| A08 | Data Integrity | Unsigned JWTs, unverified deserialization |
| A09 | Logging Failures | Missing audit logs, sensitive data in logs |
| A10 | SSRF | Unvalidated URLs, internal network access |

### 5. Security Headers & Configuration

```bash
# Check for common security headers in HTTP responses
# Expected headers:
# - Content-Security-Policy
# - Strict-Transport-Security (HSTS)
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: DENY or SAMEORIGIN
# - X-XSS-Protection
# - Referrer-Policy

# Example: check with curl
curl -sI https://example.com | grep -iE 'content-security-policy|strict-transport|x-content-type|x-frame|x-xss|referrer-policy'
```

### 6. Container & Infrastructure Scanning

```bash
# Scan Docker images for vulnerabilities
trivy image node:18-alpine
trivy image myapp:latest

# Scan Kubernetes manifests
trivy config ./k8s/

# Scan Terraform/IaC
tfsec .
checkov -d .
```

## When NOT to Use This Skill

| Situation | Better Alternative |
|-----------|-------------------|
| Penetration testing or red teaming | Use Burp Suite, OWASP ZAP, or a security consultant |
| Commercial SaaS security scanners required | Use Snyk Enterprise, Checkmarx, Veracode, or Contrast Security |
| Runtime application self-protection (RASP) | Use AppDynamics, F5 Advanced WAF, or a dedicated RASP agent |
| One-time quick check on a single file | Run a single tool command directly (e.g., `semgrep file.js`) |
| Network-level security testing | Use Nmap, Nessus, or a network vulnerability scanner |

## Pitfalls

- ⚠️ Dependency scanning only finds **known** CVEs — it won't catch logic flaws or zero-days; review code manually too
- ❌ Don't ignore "low" severity findings — they can chain into critical issues (e.g., low-severity XSS + CSRF = account takeover)
- ⚠️ SAST tools generate false positives — validate each finding against actual code context before escalating
- ❌ Don't log sensitive data (passwords, tokens, PII, SSNs) — configure log sanitization in your framework
- ⚠️ Secrets in `.gitignore` are still in git history — use `git filter-repo` or `BFG Repo Cleaner` to purge them
- ⚠️ `npm audit` and `pip-audit` have different databases — a dependency may pass one scan but fail another; use both
- ⚠️ Semgrep `--config=auto` is a starting point — write custom rules for your codebase's specific patterns

## Verification

- [ ] Zero critical/high dependency vulnerabilities (or documented risk acceptance)
- [ ] No secrets detected in code or git history
- [ ] SAST scan passes or findings are triaged and documented
- [ ] OWASP Top 10 checklist reviewed and addressed
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options, etc.)
- [ ] Container images scanned with no critical CVEs
- [ ] CI/CD security gates configured for automated scanning

## References

- OWASP Top 10: <https://owasp.org/www-project-top-ten/>
- Semgrep rules: <https://semgrep.dev/r>
- Gitleaks: <https://github.com/gitleaks/gitleaks>
- Trivy: <https://github.com/aquasecurity/trivy>
- Bandit (Python): <https://github.com/PyCQA/bandit>
- Grype (vuln scanner): <https://github.com/anchore/grype>
- Checkov (IaC): <https://github.com/bridgecrewio/checkov>
- Gosec (Go): <https://github.com/securego/gosec>
- Language-specific security checklists: see `references/language-checklists.md`

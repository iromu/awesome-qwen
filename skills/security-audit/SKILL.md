---
name: security-audit
description: Perform security scanning for OWASP vulnerabilities, dependency issues, and secrets exposure
version: 1.0.0
category: security
tags: ["security", "owasp", "scanning", "dependencies"]
---

# Security Audit

## When to Use
- Before a production deployment
- After adding new dependencies
- During code review for security-sensitive changes
- Setting up automated security checks in CI/CD

## Procedure

### 1. Dependency Scanning
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

# Multi-language
snyk test
trivy fs .
```

### 2. Secrets Detection
```bash
# Detect committed secrets
gitleaks detect --source="." -v
trufflehog git file://. --json

# Pre-commit hook to prevent future leaks
# Add to .git/hooks/pre-commit:
# gitleaks detect --staged --source="." -v
```

### 3. Static Application Security Testing (SAST)
```bash
# Generic SAST
semgrep --config=auto .

# Language-specific
# JavaScript/TypeScript
eslint --plugin security --config eslint-security-config

# Python
bandit -r . -f json

# Java
# Use SpotBugs with security findbugs config
```

### 4. Common OWASP Top 10 Checks
| Vulnerability | What to Look For |
|--------------|------------------|
| **A01: Broken Access Control** | Missing auth checks, IDOR, privilege escalation |
| **A02: Cryptographic Failures** | Hardcoded keys, weak algorithms, plaintext secrets |
| **A03: Injection** | Unparameterized queries, unescaped user input |
| **A04: Insecure Design** | Missing rate limiting, no business logic validation |
| **A05: Security Misconfiguration** | Default credentials, verbose errors, open ports |
| **A06: Vulnerable Components** | Outdated dependencies with known CVEs |
| **A07: Auth Failures** | Weak passwords, session fixation, missing MFA |
| **A08: Data Integrity** | Unsigned JWTs, unverified deserialization |
| **A09: Logging Failures** | Missing audit logs, sensitive data in logs |
| **A10: SSRF** | Unvalidated URLs, internal network access |

## Pitfalls
- ⚠️ Dependency scanning only finds known CVEs - review code manually too
- ❌ Don't ignore "low" severity findings - they can chain into critical issues
- ⚠️ SAST tools have false positives - validate each finding
- ❌ Don't log sensitive data (passwords, tokens, PII)
- ⚠️ Secrets in `.gitignore` are still in git history - use `git filter-repo`

## Verification
- [ ] Zero critical/high dependency vulnerabilities
- [ ] No secrets detected in code or git history
- [ ] SAST scan passes or findings are triaged
- [ ] OWASP Top 10 checklist reviewed and addressed
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)

## References
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Semgrep rules: https://semgrep.dev/r
- Gitleaks: https://github.com/gitleaks/gitleaks

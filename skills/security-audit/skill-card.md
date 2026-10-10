## Description: <br>
Audit code and artifacts for security vulnerabilities - dependency CVEs, embedded secrets in the working tree and git history, SAST findings, OWASP Top 10 checks, security headers and container or IaC misconfiguration. <br>

This skill is ready for commercial/non-commercial use. <br>

## Third-Party Community Consideration
<span style="color:#d73a49">This skill is not owned or developed by NVIDIA. This skill has been developed and built to a third-party's requirements for this application and use case; see link to Non-NVIDIA [Iván Rodríguez Murillo Agent Card](https://github.com/iromu/awesome-qwen).</span> <!-- VERIFY: Author email in the frontmatter is a personal non-NVIDIA address and the repo is a third-party awesome list; card_link is the source repo because no separate vendor card exists. --> <br>

### License/Terms of Use: <br>
<span style="color:#d73a49">MIT</span> <!-- VERIFY: There is no LICENSE file anywhere in the repository; MIT comes only from a 'License: MIT' badge in the root README, so the terms must be confirmed before submission. --> <br>
## Use Case: <br>
Developers and security reviewers who need a pre-deployment or CI/CD security pass over code they already have: sweeping dependencies for known CVEs, detecting hardcoded credentials, running SAST and language-specific analyzers, and checking OWASP Top 10 categories, security headers and exposed ports before a release. <br>

### Deployment Geography for Use: <br>
Global <br>

## Requirements / Dependencies: <br>
**Requires API Key or External Credential:** [No] <br>
**Credential Type(s):** [None] <br>  

Do not include secrets in prompts/logs/output; use least-privilege credentials; rotate keys as appropriate. See skill body for more details. <br>

## Known Risks and Mitigations: <br>
Risk: Review before execution as proposals could introduce incorrect or misleading guidance into skills. <br>
Mitigation: Review and scan skill before deployment. <br>

## Reference(s): <br>
- [language-checklists.md](references/language-checklists.md) <br>
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) <br>
- [Semgrep rules registry](https://semgrep.dev/r) <br>
- [Gitleaks](https://github.com/gitleaks/gitleaks) <br>


## Skill Output: <br>
**Output Type(s):** [Analysis, Shell commands, Configuration instructions] <br>
**Output Format:** [Markdown security findings with inline scanner shell commands and per-finding re-run commands] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [None] <br>

## Evaluation Tasks: <br>
No `evals/evals.json` exists for this skill, so there are zero eval cases and nothing checks what the audit actually returns. The score comes from static analysis only: 9 automated validator checks (frontmatter, folder and naming convention, line limit, required sections, semantic version, license, code risk, secrets, dead links, Unicode smuggling, quality heuristics), all passing. <br>

## Evaluation Metrics Used: <br>
Reported benchmark dimensions: <br>
- Correctness: Whether the recommended scanners and checks are real and correctly applied - Gitleaks, Trivy, Grype, Semgrep, Bandit, Gosec, Checkov and tfsec invocations, and the A01-A10 OWASP category labels - rather than invented tool flags or mislabelled categories. <br>
- Discoverability: Whether the skill triggers on dependency-scan, secrets-detection, SAST, vulnerability-assessment and pre-deployment security requests, and does not fire for penetration testing, RASP or network-level scanning, which it explicitly delegates elsewhere. <br>
- Reliability: Whether the audit steps reproduce consistently; the report docked this dimension for undocumented prerequisites, limitations and troubleshooting, which matters here because each finding has to be triaged against real code context. <br>
- Efficiency: Whether the audit completes without redundant scan passes or duplicated coverage across tools that consult overlapping CVE databases. <br>



## Evaluation Results: <br>
| Dimension | Score | Grade | Type |
|---|---:|---|---|
| Overall quality | 92.0 | A | guide-only |
| Correctness | 95.0 | - | - |
| Discoverability | 90.0 | - | - |
| Reliability | 85.0 | - | - |
| Efficiency | 100.0 | - | - |

## Skill Version(s): <br>
1.0.0 (source: frontmatter) <br>



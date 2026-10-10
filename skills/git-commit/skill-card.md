## Description: <br>
Generates, improves, and formats Git commit messages to the Conventional Commits specification, covering type and scope selection, body and footer content, and squash/reword/fixup/amend handling. <br>

This skill is ready for commercial/non-commercial use. <br>

## Third-Party Community Consideration
<span style="color:#d73a49">This skill is not owned or developed by NVIDIA. This skill has been developed and built to a third-party's requirements for this application and use case; see link to Non-NVIDIA [Iván Rodríguez Murillo Agent Card](https://github.com/iromu/awesome-qwen).</span> <!-- VERIFY: Personal non-NVIDIA author email in the frontmatter; third-party awesome list, and the card_link is the source repo because no separate vendor card exists. --> <br>

### License/Terms of Use: <br>
<span style="color:#d73a49">MIT</span> <!-- VERIFY: There is no LICENSE file anywhere in the repository; MIT comes only from a 'License: MIT' badge in the root README, so the terms must be confirmed. --> <br>
## Use Case: <br>
Developers and engineers who have staged changes, or an existing commit message to tidy up, use it to produce a Conventional Commits-compliant subject, body, and footer — choosing the commit type and scope, deciding whether mixed changes should be split into separate commits, and keeping the prefix style consistent with the repository's recent history. <br>

### Deployment Geography for Use: <br>
Global <br>

## Requirements / Dependencies: <br>
**Requires API Key or External Credential:** [Not Specified] <br>
**Credential Type(s):** [None identified] <br>  

Do not include secrets in prompts/logs/output; use least-privilege credentials; rotate keys as appropriate. See skill body for more details. <br>

## Known Risks and Mitigations: <br>
Risk: Review before execution as proposals could introduce incorrect or misleading guidance into skills. <br>
Mitigation: Review and scan skill before deployment. <br>

## Reference(s): <br>
- [Conventional Commits specification](https://www.conventionalcommits.org/) <br>


## Skill Output: <br>
**Output Type(s):** [Shell commands, Analysis] <br>
**Output Format:** [Shell commands and commit-message text — one to three labelled message options with type/scope prefixes and optional body/footer, plus a pre-commit verification checklist] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [None] <br>

## Evaluation Tasks: <br>
No evals/evals.json ships with this skill, so there are no task-level eval cases. The evaluation run instead executed 9 automated validator checks, all passing (11 non-blocking issues, 1 of them medium), covering frontmatter and folder structure, semver version labels, license compliance, code-risk analysis, secrets detection, dead-link hygiene, Unicode smuggling (three isolated variation-selector characters flagged in the Pitfalls list), and quality scoring. <br>

## Evaluation Metrics Used: <br>
Reported benchmark dimensions: <br>
- Correctness: Whether the suggested subject lines use real Conventional Commits syntax — a valid type, a meaningful scope, imperative mood, legal footers — rather than invented prefixes or malformed trailers. <br>
- Discoverability: Whether the skill fires on a genuine commit-message request (write, improve, reformat, amend, squash, commitizen/commitlint questions) and does not fire on unrelated git or code work. <br>
- Reliability: Whether it reaches an acceptable commit message consistently across repeat runs on the same diff, including when nothing is staged and it must ask before staging. <br>
- Efficiency: Whether the steps gather only the diff, log, and status needed to write the message instead of pulling the whole repository into context. <br>



## Evaluation Results: <br>
| Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
|-------|-------|-------|------|-------------|-----------------|-------------|------------|
| git-commit | 92.0 | A | guide-only | 95.0 | 90.0 | 85.0 | 100.0 |

Overall: 92.0/100 (Grade: A) | Skill Type: guide-only. Non-blocking findings: 3 Unicode-smuggling (low) plus 6 quality (1 medium — no 'version' frontmatter field; low — description length 827 chars, no '## Purpose' section, no prerequisites documented, no documented limitations, no troubleshooting section).

## Skill Version(s): <br>
1.0.0 (source: frontmatter) <br>



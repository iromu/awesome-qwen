## Description: <br>
Sets up Git branching strategies (feature branch, Gitflow, trunk-based), resolves merge conflicts, and defines pull-request, release-branch, and hotfix conventions for team collaboration. <br>

This skill is ready for commercial/non-commercial use. <br>

## Third-Party Community Consideration
<span style="color:#d73a49">This skill is not owned or developed by NVIDIA. This skill has been developed and built to a third-party's requirements for this application and use case; see link to Non-NVIDIA [Iván Rodríguez Murillo Agent Card](https://github.com/iromu/awesome-qwen).</span> <!-- VERIFY: Personal non-NVIDIA author email in the frontmatter; third-party awesome list, and the card_link is the source repo because no separate vendor card exists. --> <br>

### License/Terms of Use: <br>
<span style="color:#d73a49">MIT</span> <!-- VERIFY: There is no LICENSE file anywhere in the repository; MIT comes only from a 'License: MIT' badge in the root README, so the terms must be confirmed. --> <br>
## Use Case: <br>
Developers and engineering teams — typically whoever is standing up a new repository, onboarding to a team, or untangling messy history before a pull request — use it to choose a branching model (feature branch, Gitflow, trunk-based), name branches, resolve conflicts by rebase or merge, and drive the pull-request, release-branch, and hotfix process around it, including branch-protection and CI-gate conventions. <br>

### Deployment Geography for Use: <br>
Global <br>

## Requirements / Dependencies: <br>
**Requires API Key or External Credential:** [Yes] <br>
**Credential Type(s):** [API key, Other [SSH key]] <br>  

Do not include secrets in prompts/logs/output; use least-privilege credentials; rotate keys as appropriate. See skill body for more details. <br>

## Known Risks and Mitigations: <br>
Risk: Review before execution as proposals could introduce incorrect or misleading guidance into skills. <br>
Mitigation: Review and scan skill before deployment. <br>

## Reference(s): <br>
- [A Successful Git Branching Model (nvie.com)](https://nvie.com/posts/a-successful-git-branching-model/) <br>
- [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials) <br>
- [GitHub Flow (GitHub Docs)](https://docs.github.com/en/get-started/using-github/github-flow) <br>
- [Conventional Commits](https://www.conventionalcommits.org/) <br>


## Skill Output: <br>
**Output Type(s):** [Shell commands, Analysis] <br>
**Output Format:** [Shell commands (git and GitHub CLI) plus branching-model, conflict-resolution, and pull-request process guidance, with ASCII branch diagrams and naming tables] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [None] <br>

## Evaluation Tasks: <br>
No evals/evals.json ships with this skill, so there are no task-level eval cases. The evaluation run instead executed 9 automated validator checks, all passing (14 non-blocking issues, 1 of them medium), covering frontmatter and folder structure, semver version labels, license compliance, code-risk analysis, secrets detection, dead-link hygiene, Unicode smuggling (four isolated variation-selector characters flagged in the Pitfalls list), and quality scoring. <br>

## Evaluation Metrics Used: <br>
Reported benchmark dimensions: <br>
- Correctness: Whether the git and gh commands, branch topologies, and conflict-resolution steps are real and executable rather than invented flags or impossible histories. <br>
- Discoverability: Whether the skill fires on branching-strategy, merge-conflict, PR-workflow, release/hotfix, and team-convention requests, and defers to the git-commit skill for commit-message formatting (the run noted the broad description risks over-triggering). <br>
- Reliability: Whether it reaches a workable workflow decision or conflict resolution consistently across repeat runs, including when run without a configured remote or without authenticated GitHub CLI. <br>
- Efficiency: Whether the steps stay lean — gathering only the branch, conflict, and history state needed to decide a strategy rather than dumping full logs. <br>



## Evaluation Results: <br>
| Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
|-------|-------|-------|------|-------------|-----------------|-------------|------------|
| git-workflows | 88.2 | B | guide-only | 95.0 | 85.0 | 75.0 | 100.0 |

Overall: 88.2/100 (Grade: B) | Skill Type: guide-only. Non-blocking findings: 4 Unicode-smuggling (low) plus 8 quality (1 medium — no 'version' frontmatter field; low — description length 591 chars, broad description without negative triggers, no '## Purpose' section, no mention of error handling or validation, no prerequisites documented, no documented limitations, no troubleshooting section).

## Skill Version(s): <br>
1.0.0 (source: frontmatter) <br>



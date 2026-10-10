## Description: <br>
Creates, edits, and evaluates skills end to end — drafting SKILL.md plus its reference material, authoring eval cases, running the automated eval and description-optimization loops, and packaging the result. <br>

This skill is ready for commercial/non-commercial use. <br>

## Third-Party Community Consideration
<span style="color:#d73a49">This skill is not owned or developed by NVIDIA. This skill has been developed and built to a third-party's requirements for this application and use case; see link to Non-NVIDIA [Iván Rodríguez Murillo Agent Card](https://github.com/iromu/awesome-qwen).</span> <!-- VERIFY: Personal non-NVIDIA author email in the frontmatter; third-party awesome list, and the card_link is the source repo because no separate vendor card exists. --> <br>

### License/Terms of Use: <br>
<span style="color:#d73a49">MIT</span> <!-- VERIFY: There is no LICENSE file anywhere in the repository (and none of the 12 bundled Python scripts carries a license header); MIT comes only from a 'License: MIT' badge in the root README, so the terms must be confirmed. --> <br>
## Use Case: <br>
Developers and skill authors who want a repeatable procedure captured as a skill — or an existing skill made to trigger and perform better — use it to draft or restructure SKILL.md and its references, write eval prompts with assertions, run the automated with-skill versus baseline eval loop through the local qwen CLI, and tune the frontmatter description for trigger accuracy. <br>

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
- [Eval harness notes](references/eval-harness.md) <br>
- [Schemas (evals.json, grading.json)](references/schemas.md) <br>
- [Description optimization](references/description-optimization.md) <br>
- [Harness notes (Qwen Cloud web, Cowork)](references/harness-notes.md) <br>
- [Grader subagent instructions](agents/grader.md) <br>
- [Comparator subagent instructions](agents/comparator.md) <br>
- [Analyzer subagent instructions](agents/analyzer.md) <br>
- [picomatch glob syntax (paths: gating)](https://github.com/micromatch/picomatch) <br>


## Skill Output: <br>
**Output Type(s):** [Code, Files, Analysis] <br>
**Output Format:** [Markdown skill artifacts (SKILL.md, references/, agents/ instructions) plus JSON eval and benchmark artifacts and Markdown evaluation reports] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [The eval loop runs as parallel qwen -p subprocesses capped at 4 by default and inherits whatever model access that CLI already has; blind comparison and description optimization are documented as optional and need subagents or the CLI.] <br>

## Evaluation Tasks: <br>
No evals/evals.json ships with this skill — its eval-viewer/ and scripts/ directories are harness tooling, not a validated eval set — so there are no task-level eval cases. The evaluation run instead executed 9 automated validator checks, all passing (26 non-blocking issues, 6 of them medium), covering frontmatter and folder structure, semver version labels, license compliance, code-risk analysis (Bandit and Semgrep over 12 Python files), secrets detection, dead-link and dependency hygiene, Unicode smuggling, script linting, and quality scoring. <br>

## Evaluation Metrics Used: <br>
Reported benchmark dimensions: <br>
- Correctness: Whether the harness invocations, frontmatter fields, and script paths this skill prescribes really exist and run (bundled scripts, eval-viewer, qwen -p flags) rather than being invented or stale. <br>
- Discoverability: Whether the skill fires on skill-authoring, evaluation, description-optimization, and packaging requests, and does not fire on ordinary coding tasks that merely resemble a repeatable workflow. <br>
- Reliability: Whether it reaches a usable, packaged skill plus a trustworthy eval verdict consistently across repeat runs, including on harnesses without subagents, shell, browser, or display. <br>
- Efficiency: Whether the eval loop completes without unnecessary steps or context overhead — including whether the two arms and the 4-process parallel cap stay inside the harness timeout budget. <br>



## Evaluation Results: <br>
| Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
|-------|-------|-------|------|-------------|-----------------|-------------|------------|
| skill-creator | 81.2 | B | hybrid | 70.0 | 90.0 | 80.0 | 95.0 |

Overall: 81.2/100 (Grade: B) | Skill Type: hybrid. Non-blocking findings include a medium 'unexpected eval-viewer directory in skill root', medium quality findings (no documented scripts table, instructions do not mention run_script, no 'version' frontmatter field, no 'metadata.tags' block), and script-lint findings (deeply nested code in run_eval.py, magic numbers in six scripts, possible missing error handling in __init__.py and generate_report.py).

## Skill Version(s): <br>
1.0.0 (source: frontmatter) <br>



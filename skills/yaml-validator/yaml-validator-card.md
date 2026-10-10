## Description: <br>
Validates, lints and fixes YAML files - checking syntax and structure, diagnosing parse errors, and catching common pitfalls such as tab indentation, duplicate keys, unquoted special characters and implicit type coercion, with optional JSON Schema validation and schema generation. <br>

This skill is ready for commercial/non-commercial use. <br>

## Third-Party Community Consideration
<span style="color:#d73a49">This skill is not owned or developed by NVIDIA. This skill has been developed and built to a third-party's requirements for this application and use case; see link to Non-NVIDIA [Iván Rodríguez Murillo Agent Card](https://github.com/iromu/awesome-qwen).</span> <!-- VERIFY: Author email in frontmatter is a personal non-NVIDIA address; the repo is a third-party awesome list; card_link is the source repo because no separate vendor card exists. --> <br>

### License/Terms of Use: <br>
<span style="color:#d73a49">MIT</span> <!-- VERIFY: No LICENSE file exists anywhere in the repository; MIT comes only from a 'License: MIT' badge in the root README, so the terms must be confirmed before submission. --> <br>
## Use Case: <br>
Developers and DevOps/CI maintainers who have to keep YAML configuration correct rather than write application code - triaging a YAML parse error, linting CI workflow, compose or application config files for ambiguity (tabs, duplicate keys, unquoted colons, octal and boolean coercion), and generating or applying a JSON Schema to check a file's structure. <br>

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
- [common-issues.md](references/common-issues.md) <br>
- [best-practices.md](references/best-practices.md) <br>
- [YAML Spec 1.2.2](https://yaml.org/spec/1.2.2/) <br>
- [yamllint documentation](https://yamllint.readthedocs.io/) <br>
- [JSON Schema](https://json-schema.org/) <br>


## Skill Output: <br>
**Output Type(s):** [Analysis, Shell commands, Code, Files] <br>
**Output Format:** [Markdown validation report (per-file errors and warnings with line numbers, issue and suggested fix), yamllint/Python commands, applied text edits to the YAML files, and an optional generated JSON Schema saved as a .json file] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [None] <br>

## Evaluation Tasks: <br>
No evals/evals.json ships with this skill (0 eval cases), so the 92.0/100 A-grade result comes from 9 automated SkillEvaluator validator checks (all 9 passed, 0 failed, 0 incomplete) plus the A QUALITY heuristic dimensions - there is no task-level execution evidence behind it. <br>

## Evaluation Metrics Used: <br>
Reported benchmark dimensions: <br>
- Correctness: Whether the reported findings and suggested fixes are genuinely valid YAML problems - real parse errors, quoting and type-coercion cases handled with yamllint or yaml.safe_load/safe_load_all rather than guessed rules. <br>
- Discoverability: Whether the skill triggers on YAML validation, linting, parse-error and type-coercion requests; the report flags the description as broad and lacking negative triggers, which is what this dimension penalises. <br>
- Reliability: Whether it reports and fixes consistently across repeat runs and across file sets (single file, directory recursion, multi-document files); no prerequisites, limitations or troubleshooting section is documented. <br>
- Efficiency: Whether validation and fixing complete with minimal steps and context, reusing the bundled reference catalogues instead of re-deriving YAML rules per file. <br>



## Evaluation Results: <br>
| Dimension | Score | Grade | Type |
|---|---:|---|---|
| Overall quality | 92.0 | A | guide-only |
| Correctness | 95.0 | — | — |
| Discoverability | 85.0 | — | — |
| Reliability | 90.0 | — | — |
| Efficiency | 100.0 | — | — |

## Skill Version(s): <br>
1.0.0 (source: frontmatter) <br>



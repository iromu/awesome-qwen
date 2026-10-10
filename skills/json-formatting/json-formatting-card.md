## Description: <br>
Formats, minifies, validates, transforms and converts JSON data - including key restructuring, nested-value extraction, JSON-to-YAML/XML/CSV/TOML conversion and JSON Schema generation from example data. <br>

This skill is ready for commercial/non-commercial use. <br>

## Third-Party Community Consideration
<span style="color:#d73a49">This skill is not owned or developed by NVIDIA. This skill has been developed and built to a third-party's requirements for this application and use case; see link to Non-NVIDIA [Iván Rodríguez Murillo Agent Card](https://github.com/iromu/awesome-qwen).</span> <!-- VERIFY: Author email in frontmatter is a personal non-NVIDIA address; the repo is a third-party awesome list; card_link is the source repo because no separate vendor card exists. --> <br>

### License/Terms of Use: <br>
<span style="color:#d73a49">MIT</span> <!-- VERIFY: No LICENSE file exists anywhere in the repository; MIT comes only from a 'License: MIT' badge in the root README, so the terms must be confirmed before submission. --> <br>
## Use Case: <br>
Developers and data/integration engineers who handle JSON as a working format rather than authoring an application - pretty-printing or minifying a pasted payload, diagnosing parse errors, converting between JSON and YAML/XML/CSV/TOML, running jq/JSONPath/JMESPath extractions on nested documents, and inferring a JSON Schema from sample payloads. <br>

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
- [JSON specification (RFC 8259)](https://www.rfc-editor.org/rfc/rfc8259) <br>
- [JSON Schema draft 2020-12 core](https://json-schema.org/draft/2020-12/json-schema-core) <br>
- [JSONPath syntax (Goessner)](https://goessner.net/articles/JsonPath/) <br>
- [JMESPath tutorial](https://jmespath.org/tutorial.html) <br>
- [JSON Patch (RFC 6902)](https://www.rfc-editor.org/rfc/rfc6902) <br>
- [JSON Merge Patch (RFC 7396)](https://www.rfc-editor.org/rfc/rfc7396) <br>
- [jq manual](https://stedolan.github.io/jq/manual/) <br>
- [YAML specification](https://yaml.org/spec/) <br>


## Skill Output: <br>
**Output Type(s):** [Code, Shell commands] <br>
**Output Format:** [Reformatted, minified or converted JSON/YAML/XML/CSV/TOML text plus jq and shell one-liners, delivered as Markdown with fenced code blocks] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [None] <br>

## Evaluation Tasks: <br>
No evals/evals.json ships with this skill (0 eval cases), so the 90.8/100 A-grade result comes from 9 automated SkillEvaluator validator checks (all 9 passed, 0 failed, 0 incomplete) plus the A QUALITY heuristic dimensions - there is no task-level execution evidence behind it. <br>

## Evaluation Metrics Used: <br>
Reported benchmark dimensions: <br>
- Correctness: Whether the suggested jq/filters and conversions are syntactically valid and semantically right for the requested operation (RFC 8259 quoting, RFC 6902/7396 patch semantics, draft 2020-12 schema shape) rather than plausible-looking but non-executable snippets. <br>
- Discoverability: Whether the skill fires on JSON formatting, validation, conversion, query and schema requests without over-triggering; the report flags the description as broad and lacking negative triggers, which is what this dimension penalises. <br>
- Reliability: Whether it reaches the same verified result consistently across repeat runs, including the validate-before-and-after and 'jq commands tested' steps; no prerequisites, limitations or troubleshooting section is documented. <br>
- Efficiency: Whether it completes the transform in the fewest steps and least context, e.g. one jq pipeline instead of a hand-written recursive script, and steers files over 10 MB to streaming tools. <br>



## Evaluation Results: <br>
| Dimension | Score | Grade | Type |
|---|---:|---|---|
| Overall quality | 90.8 | A | guide-only |
| Correctness | 95.0 | — | — |
| Discoverability | 85.0 | — | — |
| Reliability | 85.0 | — | — |
| Efficiency | 100.0 | — | — |

## Skill Version(s): <br>
1.1.0 (source: frontmatter) <br>



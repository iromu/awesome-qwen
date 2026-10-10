## Description: <br>
Configures OpenTelemetry OTLP HTTP exporters so an Embabel Agent or Spring AI Java application can export its traces to Langfuse and/or LangSmith, including endpoint, key, and span-filtering properties. <br>

This skill is ready for commercial/non-commercial use. <br>

## Third-Party Community Consideration
<span style="color:#d73a49">This skill is not owned or developed by NVIDIA. This skill has been developed and built to a third-party's requirements for this application and use case; see link to Non-NVIDIA [Iván Rodríguez Murillo Agent Card](https://github.com/iromu/awesome-qwen).</span> <!-- VERIFY: Personal non-NVIDIA author email in the frontmatter; third-party awesome list, and the card_link is the source repo because no separate vendor card exists. --> <br>

### License/Terms of Use: <br>
<span style="color:#d73a49">MIT</span> <!-- VERIFY: There is no LICENSE file anywhere in the repository; MIT comes only from a 'License: MIT' badge in the root README, so the terms must be confirmed. --> <br>
## Use Case: <br>
Developers and engineers adding distributed tracing to a Java 21 / Spring Boot 3.5 AI-agent service use it to add the OpenTelemetry exporter dependency and write the correct exporter properties (endpoint, authentication keys, Embabel-only span filtering), then verify that traces actually arrive in the Langfuse or LangSmith dashboard. It assumes an existing Spring Boot + OpenTelemetry application rather than a from-scratch SDK integration. <br>

### Deployment Geography for Use: <br>
Global <br>

## Requirements / Dependencies: <br>
**Requires API Key or External Credential:** [Yes] <br>
**Credential Type(s):** [API key] <br>  

Do not include secrets in prompts/logs/output; use least-privilege credentials; rotate keys as appropriate. See skill body for more details. <br>

## Known Risks and Mitigations: <br>
Risk: Review before execution as proposals could introduce incorrect or misleading guidance into skills. <br>
Mitigation: Review and scan skill before deployment. <br>

## Reference(s): <br>
- [Langfuse Properties](references/langfuse-properties.md) <br>
- [LangSmith Properties](references/langsmith-properties.md) <br>
- [Span Classification](references/span-classification.md) <br>


## Skill Output: <br>
**Output Type(s):** [Code, Configuration instructions] <br>
**Output Format:** [Markdown with inline Maven/Gradle dependency blocks and Spring Boot application.yml property snippets, closed by a log-and-dashboard verification procedure] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [None] <br>

## Evaluation Tasks: <br>
No evals/evals.json ships with this skill, so there are no task-level eval cases. The evaluation run instead executed 9 automated validator checks, all passing (7 non-blocking issues, 1 of them medium), covering frontmatter and folder structure, semver version labels, license compliance, code-risk analysis, secrets detection, dead-link and dependency hygiene, Unicode smuggling, and quality scoring. <br>

## Evaluation Metrics Used: <br>
Reported benchmark dimensions: <br>
- Correctness: Whether the exporter dependency coordinates, property names, and endpoint URLs this skill emits are real and current for the Java 21 / Spring Boot 3.5 / OpenTelemetry 2.17 stack rather than invented or stale. <br>
- Discoverability: Whether the skill fires on a legitimate OTLP / trace-export / observability request (Langfuse, LangSmith, Embabel tracing) and stays silent for agent-authoring or metrics-and-logging work. <br>
- Reliability: Whether it reaches a working, verified exporter configuration consistently across repeat runs, including the Step 4 check that catches silent no-export. <br>
- Efficiency: Whether the four-step procedure completes the task without unnecessary steps or context overhead, pointing at the reference files instead of duplicating every property inline. <br>



## Evaluation Results: <br>
| Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
|-------|-------|-------|------|-------------|-----------------|-------------|------------|
| embabel-otel | 93.2 | A | guide-only | 95.0 | 90.0 | 90.0 | 100.0 |

Overall: 93.2/100 (Grade: A) | Skill Type: guide-only. Non-blocking findings: 5 (1 medium — no 'version' frontmatter field; low — description length 387 chars, no '## Purpose' section, no documented limitations, no troubleshooting section).

## Skill Version(s): <br>
2.0.0 (source: frontmatter) <br>



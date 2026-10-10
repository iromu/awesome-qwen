## Description: <br>
Design and review RESTful APIs and OpenAPI 3.x specifications - resource and URL naming, HTTP method and status-code selection, cursor or offset pagination, API versioning, and a consistent error-response envelope. <br>

This skill is ready for commercial/non-commercial use. <br>

## Third-Party Community Consideration
<span style="color:#d73a49">This skill is not owned or developed by NVIDIA. This skill has been developed and built to a third-party's requirements for this application and use case; see link to Non-NVIDIA [Iván Rodríguez Murillo Agent Card](https://github.com/iromu/awesome-qwen).</span> <!-- VERIFY: Author email in the frontmatter is a personal non-NVIDIA address and the repo is a third-party awesome list; card_link is the source repo because no separate vendor card exists. --> <br>

### License/Terms of Use: <br>
<span style="color:#d73a49">MIT</span> <!-- VERIFY: There is no LICENSE file anywhere in the repository; MIT comes only from a 'License: MIT' badge in the root README, so the terms must be confirmed before submission. --> <br>
## Use Case: <br>
Backend engineers designing a new HTTP API or auditing an existing one: settling resource and URL naming, choosing between GET/PUT/PATCH and the right 2xx/4xx/5xx code, capping collection responses with cursor or offset pagination, versioning the surface, and writing or checking an OpenAPI 3.x spec for Swagger UI or Redoc. <br>

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
- [openapi-templates.md](references/openapi-templates.md) <br>


## Skill Output: <br>
**Output Type(s):** [Code, Analysis, Configuration instructions] <br>
**Output Format:** [Markdown with inline OpenAPI 3.x YAML or JSON, JSON error-envelope examples, and per-endpoint REST conformance findings] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [None] <br>

## Evaluation Tasks: <br>
No `evals/evals.json` exists for this skill, so there are zero eval cases and nothing checks the endpoint designs or OpenAPI specs it emits. The score comes from static analysis only: 9 automated validator checks (frontmatter, folder and naming convention, line limit, required sections, semantic version, license, code risk, secrets, dead links, Unicode smuggling, quality heuristics), all passing. <br>

## Evaluation Metrics Used: <br>
Reported benchmark dimensions: <br>
- Correctness: Whether the REST conventions and OpenAPI constructs are accurate - method idempotency and safety semantics, status-code choice, the code/message/details error envelope, and OpenAPI 3.1 keys that would pass swagger-cli validate - rather than invented schema keywords. <br>
- Discoverability: Whether the skill triggers on API design, endpoint naming, versioning and error-format requests without over-triggering; this scored lowest because the report flagged the description as broad and lacking negative triggers, written in first or second person, so it may fire on GraphQL, gRPC or internal service-to-service work it explicitly excludes. <br>
- Reliability: Whether the design or review guidance behaves consistently across runs; the report docked this dimension for undocumented prerequisites, limitations and troubleshooting. <br>
- Efficiency: Whether an API design or audit is delivered without unnecessary steps or documentation overhead. <br>



## Evaluation Results: <br>
| Dimension | Score | Grade | Type |
|---|---:|---|---|
| Overall quality | 87.0 | B | guide-only |
| Correctness | 95.0 | - | - |
| Discoverability | 70.0 | - | - |
| Reliability | 85.0 | - | - |
| Efficiency | 100.0 | - | - |

## Skill Version(s): <br>
1.0.0 (source: frontmatter) <br>



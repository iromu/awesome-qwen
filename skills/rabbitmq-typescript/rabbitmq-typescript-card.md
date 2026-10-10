## Description: <br>
Guides RabbitMQ messaging work in TypeScript/Node.js with amqplib - exchange and queue topology design, producer/consumer code, publisher confirms, dead-letter routing, prefetch tuning and TLS/mTLS hardening. <br>

This skill is ready for commercial/non-commercial use. <br>

## Third-Party Community Consideration
<span style="color:#d73a49">This skill is not owned or developed by NVIDIA. This skill has been developed and built to a third-party's requirements for this application and use case; see link to Non-NVIDIA [Iván Rodríguez Murillo Agent Card](https://github.com/iromu/awesome-qwen).</span> <!-- VERIFY: Author email in frontmatter is a personal non-NVIDIA address; the repo is a third-party awesome list; card_link is the source repo because no separate vendor card exists. --> <br>

### License/Terms of Use: <br>
<span style="color:#d73a49">MIT</span> <!-- VERIFY: No LICENSE file exists anywhere in the repository; MIT comes only from a 'License: MIT' badge in the root README, so the terms must be confirmed before submission. --> <br>
## Use Case: <br>
Developers and engineers building or debugging asynchronous messaging in TypeScript/Node.js services - choosing an exchange and queue topology, then writing amqplib producers and consumers with publisher confirms, manual acks, dead-letter retry paths and TLS/mTLS connection settings, plus wiring up integration tests against a real broker. <br>

### Deployment Geography for Use: <br>
Global <br>

## Requirements / Dependencies: <br>
**Requires API Key or External Credential:** [Yes] <br>
**Credential Type(s):** [Other [Broker connection credentials]] <br>  

Do not include secrets in prompts/logs/output; use least-privilege credentials; rotate keys as appropriate. See skill body for more details. <br>

## Known Risks and Mitigations: <br>
Risk: Review before execution as proposals could introduce incorrect or misleading guidance into skills. <br>
Mitigation: Review and scan skill before deployment. <br>

## Reference(s): <br>
- [amqplib.md](references/amqplib.md) <br>
- [rabbitmq-concepts.md](references/rabbitmq-concepts.md) <br>


## Skill Output: <br>
**Output Type(s):** [Code, Analysis, Shell commands] <br>
**Output Format:** [Markdown guidance with inline TypeScript/Node.js (amqplib) code blocks and shell snippets for test runs and broker monitoring] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [None] <br>

## Evaluation Tasks: <br>
No evals/evals.json ships with this skill (0 eval cases), so the 92.0/100 A-grade result comes from 9 automated SkillEvaluator validator checks (all 9 passed, 0 failed, 0 incomplete) plus the A QUALITY heuristic dimensions - there is no task-level execution evidence behind it. <br>

## Evaluation Metrics Used: <br>
Reported benchmark dimensions: <br>
- Correctness: Whether the topology advice and amqplib code it produces are real and correct - valid exchange/queue patterns, quorum-queue and DLX arguments, confirm/ack calls and prefetch values rather than invented client-library APIs. <br>
- Discoverability: Whether the skill activates on RabbitMQ/AMQP messaging requests (including event-driven and background-job work) and stays silent for Kafka, NATS, gRPC, Redis or plain synchronous REST work. <br>
- Reliability: Whether it reaches the same correct topology and reliability guidance consistently across repeat runs; the report notes no prerequisites, limitations or troubleshooting section is documented, which is what this dimension penalises. <br>
- Efficiency: Whether it answers with the least necessary steps and context, given the two reference files are meant to be consulted only when API detail is needed. <br>



## Evaluation Results: <br>
| Dimension | Score | Grade | Type |
|---|---:|---|---|
| Overall quality | 92.0 | A | guide-only |
| Correctness | 95.0 | — | — |
| Discoverability | 90.0 | — | — |
| Reliability | 85.0 | — | — |
| Efficiency | 100.0 | — | — |

## Skill Version(s): <br>
1.0.0 (source: frontmatter) <br>



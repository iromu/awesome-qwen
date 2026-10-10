## Description: <br>
Implements a closed-loop self-learning system in which the agent creates skills from experience, maintains persistent cross-session memory, and improves over time through trajectory compression and skill refinement. <br>

This skill is ready for commercial/non-commercial use. <br>

## Third-Party Community Consideration
<span style="color:#d73a49">This skill is not owned or developed by NVIDIA. This skill has been developed and built to a third-party's requirements for this application and use case; see link to Non-NVIDIA [Iván Rodríguez Murillo Agent Card](https://github.com/iromu/awesome-qwen).</span> <!-- VERIFY: Personal non-NVIDIA author email in the frontmatter; third-party awesome list, and the card_link is the source repo because no separate vendor card exists. --> <br>

### License/Terms of Use: <br>
<span style="color:#d73a49">MIT</span> <!-- VERIFY: There is no LICENSE file anywhere in the repository; MIT comes only from a 'License: MIT' badge in the root README, so the terms must be confirmed. --> <br>
## Use Case: <br>
Developers and agent-runtime engineers building self-improving coding agents use it to assemble the learning loop inside a Qwen Code workspace: automatic skill creation after complex task successes, the dual-file persistent memory (MEMORY.md and USER.md), cross-session recall over stored sessions, and trajectory compression of long interaction histories. <br>

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


## Skill Output: <br>
**Output Type(s):** [Code, Files, Configuration instructions] <br>
**Output Format:** [Markdown skill and memory files — SKILL.md drafts with YAML frontmatter, MEMORY.md/USER.md memory lines, and YAML compression/summarization configuration snippets] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [None] <br>

## Evaluation Tasks: <br>
No evals/evals.json ships with this skill, so there are no task-level eval cases. The evaluation run instead executed 9 automated validator checks, all passing (12 non-blocking issues, 3 of them medium), covering frontmatter and folder structure, semver version labels, license compliance, code-risk analysis, secrets detection, dead-link hygiene, Unicode smuggling, and quality scoring. <br>

## Evaluation Metrics Used: <br>
Reported benchmark dimensions: <br>
- Correctness: Whether the prescribed skill/memory file layouts, memory limits, and compression settings match what the host runtime actually provides, rather than inventing a storage layout or toolset the harness does not expose. <br>
- Discoverability: Whether the skill fires on self-improvement, procedural-memory, cross-session-learning, and knowledge-management requests, and stays silent for one-off tasks that need no durable learning loop. <br>
- Reliability: Whether it reaches a working loop consistently across repeat runs, including the memory-capacity consolidation and trajectory-compression paths that depend on harness-specific limits. <br>
- Efficiency: Whether the loop completes without unnecessary steps or context overhead — that is, whether compression and memory consolidation actually reduce context pressure instead of adding to it. <br>



## Evaluation Results: <br>
| Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
|-------|-------|-------|------|-------------|-----------------|-------------|------------|
| self-learning | 88.0 | B | guide-only | 90.0 | 90.0 | 85.0 | 85.0 |

Overall: 88.0/100 (Grade: B) | Skill Type: guide-only. Non-blocking findings: 2 Unicode-smuggling (low) plus 8 quality (medium — no 'version' frontmatter field, no 'metadata.tags' block, instructions lack clear action verbs; low — description length 401 chars, no '## Purpose' section, no prerequisites documented, no documented limitations, no troubleshooting section).

## Skill Version(s): <br>
1.0.0 (source: frontmatter) <br>



## Description: <br>
Write and optimize Dockerfiles and Docker Compose setups - multi-stage builds, buildx multi-platform builds, Compose profiles, and container hardening such as non-root users and minimal base images. <br>

This skill is ready for commercial/non-commercial use. <br>

## Third-Party Community Consideration
<span style="color:#d73a49">This skill is not owned or developed by NVIDIA. This skill has been developed and built to a third-party's requirements for this application and use case; see link to Non-NVIDIA [Iván Rodríguez Murillo Agent Card](https://github.com/iromu/awesome-qwen).</span> <!-- VERIFY: Author email in the frontmatter is a personal non-NVIDIA address and the repo is a third-party awesome list; card_link is the source repo because no separate vendor card exists. --> <br>

### License/Terms of Use: <br>
<span style="color:#d73a49">MIT</span> <!-- VERIFY: There is no LICENSE file anywhere in the repository; MIT comes only from a 'License: MIT' badge in the root README, so the terms must be confirmed before submission. --> <br>
## Use Case: <br>
Developers and engineers who need to containerize a service: authoring or trimming a Dockerfile, standing up a multi-service Docker Compose stack, cross-building for ARM and x86 with buildx, and hardening images (non-root user, minimal base image, no secrets baked into layers). <br>

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
- [example-dockerfiles.md](references/example-dockerfiles.md) <br>
- [Dockerfile best practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/) <br>
- [Buildx multi-platform builds](https://docs.docker.com/build/building/multi-platform/) <br>
- [Compose profiles](https://docs.docker.com/compose/profiles/) <br>
- [Dive (image layer inspection)](https://github.com/wagoodman/dive) <br>


## Skill Output: <br>
**Output Type(s):** [Code, Shell commands, Configuration instructions] <br>
**Output Format:** [Markdown with inline Dockerfile, Compose YAML and docker/buildx shell snippets] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [None] <br>

## Evaluation Tasks: <br>
No `evals/evals.json` exists for this skill, so there are zero eval cases and nothing checks what the skill actually produces. The score comes from static analysis only: 9 automated validator checks (frontmatter, folder and naming convention, line limit, required sections, semantic version, license, code risk, secrets, dead links, Unicode smuggling, quality heuristics), all passing. <br>

## Evaluation Metrics Used: <br>
Reported benchmark dimensions: <br>
- Correctness: Whether the Dockerfile, Compose and buildx guidance is real, working Docker syntax - named build stages, COPY --from, USER, HEALTHCHECK, --platform lists, Compose profiles and secrets - rather than invented directives. <br>
- Discoverability: Whether the skill triggers on containerization work (Dockerfile size, image hardening, multi-service orchestration) even when the user never says Docker, and stays silent on managed-platform, serverless and Kubernetes-operator work where it points elsewhere. <br>
- Reliability: Whether the containerization recipe reaches the same result on repeat runs; the report docked this dimension for undocumented error handling, prerequisites, limitations and troubleshooting. <br>
- Efficiency: Whether the skill reaches a working, size-optimized image without unnecessary build steps or build-context overhead. <br>



## Evaluation Results: <br>
| Dimension | Score | Grade | Type |
|---|---:|---|---|
| Overall quality | 89.5 | B | guide-only |
| Correctness | 95.0 | - | - |
| Discoverability | 90.0 | - | - |
| Reliability | 75.0 | - | - |
| Efficiency | 100.0 | - | - |

## Skill Version(s): <br>
1.0.0 (source: frontmatter) <br>



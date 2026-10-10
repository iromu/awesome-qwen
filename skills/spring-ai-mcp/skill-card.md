## Description: <br>
Builds production-ready Spring AI 2.0 MCP (Model Context Protocol) servers and clients — Boot Starters and transport selection, the @Mcp* annotation surface, OAuth 2.0 and API-key security, testing, customisation and GraalVM native-image support — and handles Spring AI 2.0 / MCP Java SDK 2.0.1 migration. <br>

This skill is ready for commercial/non-commercial use. <br>

## Third-Party Community Consideration
<span style="color:#d73a49">This skill is not owned or developed by NVIDIA. This skill has been developed and built to a third-party's requirements for this application and use case; see link to Non-NVIDIA [Iván Rodríguez Murillo Agent Card](https://github.com/iromu/awesome-qwen).</span> <!-- VERIFY: Personal, non-NVIDIA author email in the SKILL.md frontmatter and the skill lives in a third-party awesome list; card_link is the source repository because no separate vendor card exists. The Spring AI and MCP Java SDK surfaces it documents are themselves third-party upstream projects. --> <br>

### License/Terms of Use: <br>
<span style="color:#d73a49">MIT</span> <!-- VERIFY: No LICENSE file exists anywhere in the repository; MIT comes only from a 'License: MIT' badge in the root README and is not confirmed by any licence file, so the actual terms must be verified before submission. --> <br>
## Use Case: <br>
Developers and engineers building Spring Boot services that expose Java methods as MCP tools to an AI model, or that consume an external MCP server through a Spring AI MCP client. They use it to pick the right Boot Starter and transport, wire the @Mcp* annotations and ToolCallbackProvider, secure MCP endpoints with OAuth 2.0 or API keys, test MCP servers and clients, and migrate a 1.x / MCP SDK 0.18.x project to Spring AI 2.0. <br>

### Deployment Geography for Use: <br>
Global <br>

## Requirements / Dependencies: <br>
**Requires API Key or External Credential:** [Yes] <br>
**Credential Type(s):** [API key, OAuth Token] <br>  

Do not include secrets in prompts/logs/output; use least-privilege credentials; rotate keys as appropriate. See skill body for more details. <br>

## Known Risks and Mitigations: <br>
Risk: Review before execution as proposals could introduce incorrect or misleading guidance into skills. <br>
Mitigation: Review and scan skill before deployment. <br>

## Reference(s): <br>
- [references/configuration.md](references/configuration.md) <br>
- [references/mcp-boot-starters.md](references/mcp-boot-starters.md) <br>
- [references/mcp-annotations.md](references/mcp-annotations.md) <br>
- [references/security-and-testing.md](references/security-and-testing.md) <br>
- [references/mcp-customization.md](references/mcp-customization.md) <br>
- [references/mcp-architecture.md](references/mcp-architecture.md) <br>
- [references/mcp-aot-native.md](references/mcp-aot-native.md) <br>
- [references/migration.md](references/migration.md) <br>
- [spring-projects/spring-ai v2.0.1 (upstream framework the skill was verified against)](https://github.com/spring-projects/spring-ai) <br>
- [modelcontextprotocol/java-sdk v2.0.1 (MCP Java SDK pinned by spring-ai via <mcp.sdk.version>)](https://github.com/modelcontextprotocol/java-sdk) <br>


## Skill Output: <br>
**Output Type(s):** [Code, Configuration instructions] <br>
**Output Format:** [Markdown with inline Java code blocks (@McpTool/@McpResource/@McpPrompt/@McpComplete/@McpSampling handlers, SecurityFilterChain and customizer beans), plus Spring Boot YAML/properties configuration and Maven/Gradle dependency coordinates] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [None — guidance and example code only; the skill itself executes nothing, writes no files and makes no API calls. Its output may describe outbound MCP connections and native-image builds, which the developer then runs in their own toolchain.] <br>

## Evaluation Tasks: <br>
No `evals/evals.json` case set exists for this skill, so no task-level eval cases were run. The October 2026 SkillEvaluator run scored it as `guide-only` and ran 9 automated validator checks, all passing: frontmatter/folder-structure and naming conformance, the 392-line SKILL.md limit, required body sections, optional supporting-file discovery, author-format check, semantic-version check, license compliance (nothing detected), code-risk analysis (skipped — no code files), Gitleaks secret scan (clean), dead-link scan over 9 markdown files, dependency and Python test-file discovery, unicode-smuggling scan, and the A-quality dimension scoring. <br>

## Evaluation Metrics Used: <br>
Reported benchmark dimensions: <br>
- Correctness: Whether the starter artefact names, property keys, annotation attributes and package imports it emits are real Spring AI 2.0.1 / MCP Java SDK 2.0.1 identifiers rather than invented or 1.x-era ones — e.g. keeping io.modelcontextprotocol.* protocol types in their original package instead of relocating them. <br>
- Discoverability: Whether the skill triggers on any MCP-in-a-Spring request (server or client building, annotations, transport choice, migration, security, testing, customisation, native image) and stays silent on non-MCP work such as plain REST, gRPC or non-Spring MCP clients. <br>
- Reliability: Whether the skill reaches the expected starter, annotation and configuration answer consistently across repeat runs, including the documented pitfalls such as OAuth 2.0 being unavailable over SSE transport. <br>
- Efficiency: Whether it answers without unnecessary steps or context overhead while consulting the deeper reference files only when the quick-reference sections are insufficient. <br>



## Evaluation Results: <br>
| Dimension | Score | Grade | Type |
|---|---:|---|---|
| Overall quality | 90.2 | A | guide-only |
| Correctness | 90.0 | — | — |
| Discoverability | 90.0 | — | — |
| Reliability | 85.0 | — | — |
| Efficiency | 100.0 | — | — |

## Skill Version(s): <br>
2.0.1 (source: frontmatter) <br>



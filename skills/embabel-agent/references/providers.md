# Starters, providers, and what changed in v1.5.1

Moved out of `SKILL.md` so the main guide stays under the per-file token budget.
Verify against the pinned upstream docs before trusting any symbol here.

## Starters

| Starter | Use Case |
|---------|----------|
| `embabel-agent-starter` | Basic agent platform (web/console/microservice) |
| `embabel-agent-starter-shell` | Interactive CLI shell |
| `embabel-agent-starter-mcpserver` | MCP server (SSE, Streamable-HTTP) |

Embabel release binaries are published to **Maven Central** — no snapshot
repository needed for stable releases.

## LLM providers

| Provider | Starter | Key Env Var |
|----------|---------|-------------|
| OpenAI | `embabel-agent-starter-openai` | `OPENAI_API_KEY` |
| OpenAI Custom (Groq, OpenRouter) | `embabel-agent-starter-openai-custom` | `OPENAI_CUSTOM_API_KEY` |
| Anthropic | `embabel-agent-starter-anthropic` | `ANTHROPIC_API_KEY` |
| Google Gemini (OpenAI-compatible) | `embabel-agent-starter-gemini` | `GEMINI_API_KEY` |
| Google GenAI (Native, Gemini 3.x) | `embabel-agent-starter-google-genai` | `GOOGLE_API_KEY` |
| DeepSeek | `embabel-agent-starter-deepseek` | `DEEPSEEK_API_KEY` |
| OCI Generative AI | `embabel-agent-starter-oci-genai` | `~/.oci/config` |
| Mistral AI | `embabel-agent-starter-mistral-ai` | `MISTRAL_API_KEY` |
| LM Studio | `embabel-agent-starter-lmstudio` | _(none)_ |
| Ollama | `embabel-agent-starter-ollama` | _(none)_ |
| AWS Bedrock | `embabel-agent-starter-bedrock` | AWS credentials (standard Spring AI Bedrock) |
| Z.ai (Zhipu GLM, native client) | `embabel-agent-starter-zai` | `ZAI_API_KEY` |
| DashScope (Alibaba Qwen) | `embabel-agent-starter-dashscope` | `DASHSCOPE_API_KEY` |
| Docker Models | `embabel-agent-starter-dockermodels` | _(none)_ |
| MiniMax | `embabel-agent-starter-minimax` | `MINIMAX_API_KEY` |
| BYOK (user-supplied keys) | `embabel-agent-starter-byok` (Incubating) | _(runtime)_ |

Provider-specific notes:

- **Z.ai** — native `spring-ai-zhipuai` client (not OpenAI-compatible). Supports
  GLM 5.2, native reasoning/thinking, temperature clamping `(0.0, 1.0]`.
  See `zai.md`.
- **DashScope** — Alibaba Cloud Qwen 3.7 family (Max/Plus/Flash). OpenAI-compatible
  with parameter clamping. See `dashscope.md`.
- **Atlas Cloud** — OpenAI-compatible endpoint for BYOK deployments, built via
  `OpenAiCompatibleModelFactory.atlasCloud(userKey)`. See `customizing.md`.

Full provider configuration details: `configuration.md`.

## New in v1.5.1

- **Roles across providers** — `embabel.models.roles` gives each role a provider
  dimension (BYOK, failover). `RoleResolver` beans decide per user;
  `ModelSelectionContextHolder` carries the user context across threads.
  Unsatisfiable roles throw `NoSuitableModelException`, never a silent fallback.
  See `llm-integration.md`, `configuration.md`.
- **Embedding-based skill selection** — `EmbeddingSkillSelector` picks up to 2
  skills by embedding similarity (frontmatter `metadata: activation: embedding`,
  default threshold 0.30, fail-open). See `agent-skills.md`.
- **Atlas Cloud** — built-in OpenAI-compatible factory:
  `OpenAiCompatibleModelFactory.atlasCloud(userKey)`. See `customizing.md`.
- **Streaming scalar types** — `StringResult` wrapper for streaming plain-text
  scalars. See `streaming.md`.
- **Thinking tag control** — `Thinking.withIncludedTags(...)` /
  `withExcludedTags(...)`. See `thinking.md`.
- **Z.ai native provider** — first-class `embabel-agent-starter-zai` (GLM family,
  native thinking). See `zai.md`.

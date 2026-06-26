---
name: embabel-agent
description: >-
  Build agentic AI on the JVM with Embabel — Rod Johnson's Spring-based framework for agents mixing LLMs, code, and non-LLM planning (GOAP, Utility AI, Hybrid, Supervisor). Use for Embabel agent development, annotations (@Agent, @Action, @LlmTool, @State, @Condition, @Provided, @Cost, @SecureAgentTool, SomeOf, trigger), agentic tools (SimpleAgenticTool, PlaybookTool, StateMachineTool, OneShotPerLoopTool), ToolCallContext, SpEL conditions, planning config, testing, LLM providers (OpenAI, Groq, Anthropic, Gemini, DeepSeek, OCI, Mistral, LM Studio, Ollama), execution/autonomy modes, state workflows, human-in-the-loop, chatbots, MCP (server publishing, security, clients), observability (Langfuse, LangSmith, Zipkin), A2A, guardrails, cost tracking, structured prompts, streaming, DSL builders, RAG, interceptors, thinking, termination, async mode, scaffolding, production, error handling, troubleshooting, and pitfalls.
---

# Embabel Agent Framework

Build agentic AI applications on the JVM using the **Embabel framework** — a Spring-based framework for authoring agentic flows that seamlessly mix LLM-prompted interactions with code and domain models. Created by Rod Johnson (creator of Spring), it supports intelligent path-finding towards goals using non-LLM AI planning algorithms (GOAP, Utility AI, Hybrid, Supervisor).

## Output Quality

When producing code or documentation:

- **Be comprehensive** — Provide complete, multi-section outputs with thorough explanations
- **Include complete code** — Full classes with imports, domain models, and all annotations
- **Show the "why"** — Explain design decisions (why this planner, why this temperature, why this execution mode)
- **Include configuration** — Always show the full `application.yml` block with all relevant settings
- **Provide testing** — Include unit tests with FakePromptRunner AND integration tests with EmbabelMockitoIntegrationTest
- **Use latest API patterns** — `LlmOptions.withModel()`, `context.ai().withLlm().creating().fromPrompt()`, `.withId()`, `withExample()`

## Core Concepts

Every Embabel agent is built from these building blocks:

- **Actions** (`@Action`) — Steps the agent takes. Each method transforms inputs into outputs.
- **Goals** (`@AchievesGoal`) — What the agent is trying to achieve. Marks goal-satisfaction.
- **Conditions** (`@Condition`) — Predicates evaluated before actions or to determine goal achievement.
- **Domain Model** — Strongly-typed objects carrying both data and behavior (DICE).
- **Blackboard** — Shared memory where actions add results and read inputs by type.
- **Plan** — Dynamically generated sequence of actions. The planner recomputes after each action.
- **Planner** — GOAP (A* search), Utility AI (value-based), Hybrid, or Supervisor (LLM-orchestrated).
- **Agent Skills** — Lazy-loaded, reusable skill packages.
- **Guardrails** — Configurable validation policies for user inputs and LLM responses.
- **Cost Tracking** — Real-time event-based tracking of LLM and embedding costs.

> **Key insight:** Application developers rarely interact with the blackboard directly. Most pre/post conditions are inferred from data flow in method signatures.

## Getting Started

### Setup (Maven)

Add the starter dependency and Embabel snapshot repository. See `reference/configuration.md` for the full Maven setup and all available starters (`embabel-agent-starter`, `embabel-agent-starter-shell`, `embabel-agent-starter-mcp`).

### LLM Providers

Add the provider-specific starter (e.g., `embabel-agent-starter-openai`) and set the corresponding API key environment variable.

**Available providers:**

| Provider | Starter | Key Env Var | Notes |
|----------|---------|-------------|-------|
| OpenAI | `embabel-agent-starter-openai` | `OPENAI_API_KEY` | Default provider |
| OpenAI Custom (Groq, Z.AI) | `embabel-agent-starter-openai-custom` | `OPENAI_CUSTOM_API_KEY` | Custom base URL + paths |
| Anthropic | `embabel-agent-starter-anthropic` | `ANTHROPIC_API_KEY` | Claude models |
| Google Gemini (OpenAI-compatible) | `embabel-agent-starter-gemini` | `GEMINI_API_KEY` | OpenAI-compatible endpoint |
| Google GenAI (Native) | `embabel-agent-starter-google-genai` | `GOOGLE_API_KEY` | Full SDK, Gemini 3.x, thinking mode, Vertex AI |
| DeepSeek | `embabel-agent-starter-deepseek` | `DEEPSEEK_API_KEY` | DeepSeek models |
| OCI Generative AI | `embabel-agent-starter-oci-genai` | `~/.oci/config` | Oracle Cloud, multiple auth types |
| Mistral AI | `embabel-agent-starter-mistral-ai` | `MISTRAL_API_KEY` | Mistral models |
| LM Studio | `embabel-agent-starter-lmstudio` | _(none)_ | Local models at `http://localhost:1234/v1` |
| Ollama | `embabel-agent-starter-ollama` | _(none)_ | Or use OpenAI-compatible: `embabel-agent-starter-openai-custom` with `OPENAI_CUSTOM_BASE_URL=http://localhost:11434/v1` |

See `reference/configuration.md` for full provider config details.

### Environment Variables

Set `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GEMINI_API_KEY` as needed.

## Agent Process Lifecycle

An `AgentProcess` manages the complete execution lifecycle: `NOT_STARTED` → `RUNNING` → `COMPLETED` / `FAILED` / `TERMINATED` / `KILLED` / `STUCK` / `WAITING` / `PAUSED`.

Use `tick()` for a single step, `run()` to execute as far as possible.

### Planning (OODA Loop)

After each action execution, the planner: **Observe** → **Orient** → **Decide** → **Act** (then replan).

### Blackboard

The blackboard is shared memory where actions add results and read inputs by type. See `reference/invocation.md` for full blackboard operations and Context persistence.

## Agent Authoring

### @Agent — Direct Agent

Annotate a class with `@Agent(description = "...")` and add `@Action` methods. The planner discovers actions by their input/output types and builds a plan.

### @Agentic — Auto-Discovered Agent

Annotate with `@Agentic(description = "...")` for auto-discovery via component scanning.

### @EmbabelComponent — Action Container

Annotate with `@EmbabelComponent` when you want actions but not a full agent.

> **@Action key attributes:** `pre`/`post` conditions, `canRerun`, `readOnly`, `clearBlackboard`, `cost`/`value`, `outputBinding`, `trigger`. See `reference/annotations.md` for full details and all annotation types.

## Domain Objects

Domain objects carry both data and behavior — they are not anemic DTOs. Expose methods to LLMs with `@Tool`. Unannotated methods are **never** exposed regardless of visibility.

See `reference/domain-objects.md` for DICE best practices and full @Tool rules.

## Tools

### @LlmTool: Expose JVM Methods to LLMs

Annotate methods with `@LlmTool(description = "...")` to make them callable by the LLM.

### ToolCallContext

Inject `ToolCallContext` for infrastructure metadata (auth tokens, tenant IDs) invisible to the LLM.

### OneShotPerLoopTool

Annotate tools with `@OneShotPerLoopTool` to prevent repeated calls in a single planning loop.

### @Provided

Use `@Provided` on methods to declare that a tool produces specific types for the blackboard.

### @Cost

Use `@Cost(name = "...")` to compute action costs dynamically based on blackboard state. Then reference via `costMethod = "..."` on `@Action`.

### SpEL Conditions

Use Spring Expression Language in `@Condition` and `@Action(pre = "...")` for dynamic preconditions.

### Subagent

Use `Subagent.ofClass(...).consuming(...)` to let the LLM invoke other agents as tools.

### Agentic Tools

- **SimpleAgenticTool** — Flat orchestration
- **PlaybookTool** — Progressive unlocking with prerequisites
- **StateMachineTool** — State-based availability

### Tool Groups & Chaining

Configure tool groups in YAML or `@Configuration`. Use `withToolGroup()` in actions and `withToolChainingFrom(Class)` to dynamically expose tools from returned objects.

> See `reference/tools.md` for full details: tool groups config, framework-agnostic Tool interface, OneShotPerLoopTool, domain tools, and complete code examples.

## Planning Algorithms

| Planner | Best For | Determinism | Algorithm |
|---------|----------|-------------|-----------|
| **GOAP** (default) | Business processes with defined outputs | High | A* search over goal states |
| **Utility** | Exploration, event-driven systems | Medium | Highest net-value action picks |
| **Hybrid** | Reducer pipelines | Medium-High | Utility picking + goal termination |
| **Supervisor** | Flexible multi-step workflows | Low | LLM-orchestrated composition |

Set via `@Agent(planner = PlannerType.XXX)` or `ProcessOptions(plannerType = PlannerType.XXX)`.

**Choosing:** Well-defined goals → GOAP. Deterministic planning → GOAP or Hybrid. Event-driven → Utility. LLM orchestration → Supervisor.

> See `reference/planners.md` for detailed comparison and examples for each planner.

## States with @State

Annotate classes with `@State` to trigger state transitions. Previous state objects are hidden, the new state is bound to the blackboard, and planning considers only actions from the new state.

- For looping states, use `@Action(clearBlackboard = true)`
- For human-in-the-loop: `WaitFor.formSubmission("...", Feedback.class)`
- Use Java records (implicitly static) or Kotlin top-level classes for state types

> See `reference/states.md` for detailed state patterns, inheritance, WaitFor, and parent state interface.

## DSL Builders (Kotlin/Java)

For atomic workflows that contain multiple steps, use DSL builders: `SimpleAgentBuilder`, `ScatterGatherBuilder`, `ConsensusBuilder`, `RepeatUntil`, `RepeatUntilAcceptable`. Register with Spring via `@Bean` method returning `Agent`.

> See `reference/dsl.md` for all builder types, subprocess execution, and Spring bean registration.

## Execution Modes

### Process Execution (SIMPLE vs CONCURRENT)

- **SIMPLE** (default): Sequential, one action at a time
- **CONCURRENT**: All achievable actions run in parallel

Set: `embabel.agent.platform.process-type: CONCURRENT`

### Autonomy (Closed vs Open Mode)

- **Closed**: LLM picks one agent; agent runs in isolation
- **Open**: LLM picks goal; assembles agent from all actions

> See `reference/execution-modes.md` for confidence thresholds, goal approval, and REST endpoints.

## Chatbots

Chatbots use a **long-lived `AgentProcess`** that pauses between user messages. The blackboard maintains state across the entire session.

### Building a Chatbot

```java
@EmbabelComponent
public class MyChatbot {

    @Action(trigger = UserMessage.class)
    public AssistantResponse handleMessage(UserMessage msg, Ai ai) {
        return ai.withDefaultLlm()
            .creating(AssistantResponse.class)
            .fromPrompt(msg.getContent());
    }
}

@Bean
public Chatbot myChatbot(AgentPlatform platform) {
    return new DefaultChatbot(platform);
}
```

The `trigger = UserMessage.class` ensures the action fires only when a user message is the most recently added value to the blackboard.

### Context IDs and Session State

```java
// Session with pre-populated context
ChatSession session = chatbot.createSession(user, outputChannel, "project-alpha", null);

// Anonymous session
ChatSession anonymousSession = chatbot.createSession(null, outputChannel, null, null);
```

The `contextId` parameter pre-populates the session's blackboard with objects from a named context, and changes persist back as the session runs.

### Utility AI for Chatbots

Utility AI is often the best approach for chatbots — define actions with costs, planner picks highest-value. Use `@Cost` for dynamic cost computation based on blackboard state.

### Conversation Storage

```yaml
embabel:
  agent:
    platform:
      conversation-store: STORED  # IN_MEMORY (default) or STORED (Neo4j)
```

Goals are optional — omit for open-ended conversations, add for transactional flows.

> See `reference/chatbots.md` for full chatbot patterns: ChatSession, Conversation, triggers, context IDs, storage, and dynamic cost methods.

## Invocation

Use `AgentInvocation.create(agentPlatform, ResultClass)` for type-safe invocation, or `agentPlatform.createAgentProcess()` for direct process control. See `reference/invocation.md` for Autonomy, GoalSelectionOptions, Shell usage, webhooks, and web app examples.

## LLM Integration

Use `LlmOptions.withModel()` for per-call model/temperature configuration. Inject `Ai` via constructor injection. Use `.withId("...")` for test verification.

> See `reference/llm-integration.md` for full details: LlmOptions, custom LLM providers, embedding services, callbacks, Anthropic caching, streaming, and the complete PromptRunner API.

## Structured Prompts

Use `Persona`, `RoleGoalBackstory`, or custom `PromptContributor` implementations to inject structured content into prompts. Use `LlmReference` when you need both content and tools from the same source.

> See `reference/structured-prompts.md` for full details and YML configuration.

## Interceptors & Callbacks

LLM invocations run inside a `ToolLoop` with two extension points:

- **Inspectors** (`ToolLoopInspector`) — read-only observation: `beforeLlmCall`, `afterLlmCall`, `afterToolResult`, `afterIteration`
- **Transformers** (`ToolLoopTransformer`) — modify data flowing through the loop: truncate results, apply sliding window, redact content

Built-ins: `ToolLoopLoggingInspector`, `ToolResultTruncatingTransformer`, `SlidingWindowTransformer`.

> See `reference/interceptors.md` for full callback interfaces and usage patterns.

## Thinking & Reasoning

Use `.thinking()` on the `PromptRunner` to extract LLM reasoning blocks alongside structured results:

```java
ThinkingResponse<MonthItem> response = runner
    .thinking()
    .createObject(prompt, MonthItem.class);

List<ThinkingBlock> blocks = response.getThinkingBlocks();
```

Three tag types: `TAG` (XML-style `<think>`), `PREFIX` (line prefix), `NO_PREFIX` (untagged text).

> See `reference/thinking.md` for full API and `ThinkingException` handling.

## Termination

| Mechanism | When to Use | Behavior |
|-----------|-------------|----------|
| **Graceful (Signal)** | "Let me finish my work, then stop" | Terminates at next checkpoint; side effects complete |
| **Immediate (Exception)** | "Stop now, nothing left to do" | Terminates immediately; no further execution |

Use `ctx.terminateAgent("reason")` for graceful, `TerminateAgentException` for immediate.

> See `reference/termination.md` for full patterns including action-level termination.

## Streams

Enable streaming with `.streaming()` on the PromptRunner. Handles `Thinking` and `ObjectCreated` events via Spring Reactive callbacks.

> See `reference/streams.md` for raw text streaming and reactive callbacks.

## Agent Skills

Load skills from GitHub (`Skills.fromGitHub(...)`) or local directories (`Skills.fromLocal(...)`). Skills use lazy loading — metadata in system prompt, full content on `activate`.

> See `reference/agent-skills.md` for validation and combining with LlmReference.

## RAG (Retrieval-Augmented Generation)

Embabel's RAG is **entirely agentic and tool-based** — the LLM controls the retrieval process:

- **Autonomous Search**: LLM decides when to search, what queries to use
- **Iterative Refinement**: Multiple searches with different queries
- **Cross-Reference Discovery**: Expand chunks, follow references, zoom out
- **HyDE Support**: Generate hypothetical documents for better semantic search

`ToolishRag` facade auto-discovers store capabilities (vector, text, regex, result expansion) and exposes them as LLM tools. Attach via `LlmReference`:

```java
LlmReference ragRef = LlmReference.builder()
    .description("Search the knowledge base")
    .rag(toolishRag)
    .build();
```

> See `reference/rag.md` for full RAG architecture and `ToolishRag` facade pattern.

## Guardrails

Add guardrails with `.withGuardRails(...)`. `CRITICAL` severity blocks execution and throws `GuardRailViolationException`.

> See `reference/guardrails.md` for custom guardrails, global config, and POJO guardrails.

## Cost Tracking

Listen for `LlmInvocationEvent` to track costs by process, tenant, or user. Combine with guardrails for budget management.

> See `reference/cost-tracking.md` for the full budget guardrail pattern and EarlyTerminationPolicy.

## Integrations

### MCP Server Publishing

Publish agents as MCP servers with SYNC, SSE, or Streamable-HTTP transport:

```yaml
embabel:
  agent:
    platform:
      mcp:
        server:
          name: my-agent-server
          version: 1.0.0
          transport: SSE
```

Goals are automatically published as MCP tools. Use `@McpTool` to expose `LlmReference` types:

```java
@McpTool(name = "search", description = "Search the knowledge base")
public LlmReference searchTool() {
    return LlmReference.builder().description("Search for documents").build();
}
```

Two-layer security:
- **Layer 1:** HTTP filter chain (JWT auth via `SecurityWebFilterChain`)
- **Layer 2:** `@SecureAgentTool(expression = "hasAuthority('news:read')")` on agents/methods

### Observability

Add `embabel-agent-observability-langfuse`, `embabel-agent-observability-langsmith`, or `embabel-agent-observability-zipkin`. Configure:

```yaml
embabel:
  agent:
    platform:
      observability:
        enabled: true
        exporter: langfuse  # langfuse, langsmith, zipkin
```

### A2A (Agent-to-Agent)

A2A enables agents to communicate across process boundaries.

> See `reference/integrations.md` for full details: MCP server/client, tool groups, security, observability, and A2A.

## Configuration

Always include the full `embabel:` block with models, planner settings, execution mode, logging, and tool configuration when producing examples.

> See `reference/configuration.md` for full property reference and provider-specific config.

## Testing

Always provide complete, runnable test classes:

- **Unit tests:** Use `FakeOperationContext.create()` and `context.expectResponse()`
- **Integration tests:** Extend `EmbelMockitoIntegrationTest`, use `whenCreateObject()` and `verifyCreateObjectMatching()`
- **Always use `.withId("...")`** on LLM calls for traceability

> See `reference/testing.md` for more patterns including Mockito stubbing and example verification.

## When NOT to Use Embabel

| Scenario | Better Alternative | Why |
|----------|-------------------|-----|
| Simple API endpoints | Spring Boot alone | Embabel adds overhead |
| Pure data processing | Spring Batch, Apache Spark | No LLM interaction needed |
| Real-time streaming | WebFlux, gRPC | Embabel is agent-focused |
| Frontend web apps | React, Angular, Vue | Embabel is backend-only |
| Simple chatbot with fixed flow | State machine library | No need for LLM-driven planning |
| High-throughput microservices | Standard Spring Boot | Planning loop adds latency |
| Batch ETL jobs | Spring Batch, Airflow | No agent planning needed |

**Use Embabel when:** LLM-driven decision making, domain-driven planning, mixing LLM calls with code, human-in-the-loop workflows, agent composition.

**Avoid Embabel when:** Fully deterministic workflows, sub-millisecond response times, simple CRUD APIs, single LLM call agents.

## Error Handling

- **Retry:** `createObject()` retries automatically; catch `LlmInvocationException` for custom fallback
- **Non-critical:** Use `createObjectIfPossible()` — returns null instead of throwing
- **Guardrails:** Catch `GuardRailViolationException` for `CRITICAL` blocks
- **Cost caps:** Use `EarlyTerminationPolicy` for process-level termination
- **Monitoring:** Poll `process.getState()` for long-running agents

> See `reference/error-handling.md` for full error handling patterns and process states.

## Threading & Async Mode

Embabel inherits threading from `spring.threads.virtual.enabled` (defaults to platform threads).

| Property | Default | Description |
|----------|---------|-------------|
| `threading.override` | `false` | Flip threading model (virtual↔platform) |
| `threading.shared` | `false` | Share app's executor when models match |

To enable virtual threads: set `spring.threads.virtual.enabled=true`.

> See `reference/async-mode.md` for full behavior matrix and configuration.

## Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| Agent not discovered | Check `@Agent`/`@Agentic` annotation and component scan path |
| Planner can't find plan | Verify `@AchievesGoal`, input type matching, enable DEBUG logging |
| Blackboard type not found | Check previous action added the type, not hidden by state transition |
| State transitions broken | Use `@State` annotation, Java records or Kotlin top-level classes |
| LLM calls failing | Check API keys, model names, timeouts, network connectivity |
| High costs | Limit `max-iterations`, use cheaper models, enable `BudgetGuardRail` |

> See `reference/troubleshooting.md` for detailed troubleshooting steps.

## Common Pitfalls

1. **Missing `@Agent`/`@Agentic`** — Agent won't be discovered
2. **Missing `OperationContext`** — Actions can't access AI or blackboard
3. **Missing `@AchievesGoal`** — Planner can't determine completion
4. **Ignoring `max-iterations`** — Agent stops after 20 (default)
5. **Not setting model per-action** — Wastes money or sacrifices quality
6. **Forgetting `.withId()`** — Makes testing and debugging opaque
7. **Non-static inner classes for `@State`** — Serialization issues
8. **Missing `clearBlackboard = true` for loops** — Planner skips existing types
9. **Exposing sensitive methods** — Always gate with `@Tool`/`@LlmTool`
10. **Circular type dependencies** — Planner can't find valid plan path

> See `reference/common-pitfalls.md` for detailed explanations and all 13 pitfalls.

## Production Deployment

Use multi-stage Dockerfiles and Kubernetes manifests for production. Always use secrets management for API keys and enable guardrails for safety/compliance.

> See `reference/production-deployment.md` for Docker, K8s, health checks, security, and production checklist.

## Scaffolding

Use the included script to generate a new Embabel project:

```bash
./scripts/project-creator.sh my-agent com.example
```

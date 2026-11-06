---
name: embabel-agent
version: 1.5.4
description: >-
  Build agentic AI on the JVM with Embabel v1.5.4 — Spring-based framework combining LLMs with non-LLM planning
  (GOAP, Utility AI, Hybrid, Supervisor). Use when creating agents with @Agent, @Action, @AchievesGoal, @Condition,
  @LlmTool, @Tool; publishing MCP servers with @Export(remote=true) over Streamable HTTP; agent process persistence
  (AgentProcessSnapshotStore, JDBC, cache, HITL); state with @State; decision/classification services (DecisionService,
  Ai.decisions(), Jev, CLEF, System One, prompted LLM); providers (OpenAI, Anthropic, Gemini, DeepSeek, Ollama,
  Bedrock, Mistral, Z.ai, DashScope, MiniMax, BYOK) and per-provider roles (RoleResolver, role-named default-llm,
  embedding-roles); RAG with ToolishRAG; testing with FakeOperationContext; chatbots with triggers and durable assets;
  interceptors, guardrails, cost tracking, streaming; custom LLMs; migrating from CrewAI, Pydantic AI, or LangGraph.
  Do NOT use for Chatbot/ChatSession/conversation-store patterns (see the embabel-chatbot skill).
metadata:
  author: "Iván Rodríguez Murillo <wantez@gmail.com>"
  version: 1.5.4
  tags: [embabel, agents, jvm, spring, kotlin]
---

# Embabel Agent Framework (v1.5.4)

Build agentic AI on the JVM with **Embabel** — a Spring-based framework for authoring agentic flows that mix LLM-prompted interactions with code and domain models. Created by Rod Johnson (creator of Spring), it uses non-LLM AI planning (GOAP, Utility AI, Hybrid, Supervisor) to find intelligent paths toward goals.

## Purpose

The authoritative, version-pinned guide for correct Embabel code: author agents, tools, and domain models; wire providers and roles; publish MCP servers; build decision/classification services, chatbots, and RAG pipelines; and test and deploy — always grounded in the real v1.5.4 API.

## Prerequisites

- **JDK 17+** and **Maven** or **Gradle** (the template projects use `./mvnw` / `./gradlew`)
- **Spring Boot 4.1.1** — pulled in by the `embabel-agent-starter-*` artifacts
- **At least one LLM provider key** — a deployment key (`OPENAI_API_KEY`, etc.) or BYOK keys at runtime (see "Bring-Your-Own-Key" in `references/providers.md`); `uvx` + `git` only for the `project-creator.sh` scaffolding script

## Instructions

1. Confirm the task belongs on Embabel — check "When NOT to Use Embabel" first (plain Spring AI apps, non-planner chatbots, observability → other skills).
2. This guide targets v1.5.4; "New in v1.5.4" in `references/providers.md` lists recent changes, "Migration" covers CrewAI/Pydantic AI/LangGraph.
3. New agent: "Getting Started" → "Agent Authoring" → "Tools"; "Domain Objects" for state, "Planning Algorithms"/"Execution Modes"/"States with @State" for multi-step flows, "DSL Builders (Kotlin/Java)" when annotations don't fit.
4. For a specific API (decisions, chatbots, RAG, MCP, testing, async, errors), use the named section; deeper material is in "Deep Dives" and `references/`.
5. Cross-check "Common Pitfalls" and "Troubleshooting" before finalizing; never assert an API from memory — if a symbol isn't named here or in `references/`, treat it as unverified.

## Output Quality

- **Be comprehensive** — full classes with imports, domain models, all annotations; justify planner, model, temperature, and concurrency choices
- **Include configuration** — full `application.yml` with the relevant `embabel:` and `spring.ai:` settings
- **Provide testing** — unit tests with `FakePromptRunner`/`FakeOperationContext` AND integration tests with `EmbelMockitoIntegrationTest`
- **Use latest API patterns** — `LlmOptions.fromCriteria(...)`, `context.ai().withLlm().creating().fromPrompt()`, `.withId()`, `.withExample()` (few-shot)

## Core Concepts

- **Actions** (`@Action`) — Steps the agent takes. Each method transforms inputs into outputs.
- **Goals** (`@AchievesGoal`) — What the agent is trying to achieve. Marks goal-satisfaction.
- **Conditions** (`@Condition`) — Predicates evaluated before actions or to determine goal achievement.
- **Domain Model** — Strongly-typed objects carrying both data and behavior (DICE).
- **Blackboard** — Shared memory where actions add results and read inputs by type.
- **Plan / Planner** — A dynamically generated, recomputed action sequence found by a planner: GOAP (A*), Utility AI (value-based), Hybrid, or Supervisor (LLM-orchestrated).

> **Key insight:** Most pre/post conditions are inferred from data flow in method signatures — you rarely deal with the blackboard directly.

## Getting Started

Add the platform starter (`embabel-agent-starter`, plus `-shell` for a CLI or
`-mcpserver` for an MCP server) and the starter for each model provider you call.
Release binaries are on **Maven Central**; no snapshot repository is needed.

The full starter/provider matrix (artifact + required key per provider, and the v1.5.2→v1.5.4 change list) lives in `references/providers.md` — read it before adding a dependency or asserting something is new in v1.5.4.

## Agent Authoring

### @Agent — Direct Agent

```java
@Agent(description = "Find news based on a person's star sign")
public class StarNewsFinder {
    @Action
    public StarPerson extractStarPerson(UserInput userInput, OperationContext context) {
        return context.ai()
            .withLlm(OpenAiModels.GPT_41)
            .createObject("Create a person from this input...", StarPerson.class);
    }

    @AchievesGoal
    @Action
    public Writeup writeup(StarPerson person, RelevantNewsStories stories, OperationContext context) {
        return context.ai().withLlm(llm).createObject(prompt, Writeup.class);
    }
}
```

### @EmbabelComponent — Action Container

Use when you want actions but not a full agent (pairs well with Utility AI). `@Export(remote = true)` on goals auto-publishes them as MCP tools.

> **@Action key attributes:** `pre`/`post` conditions, `canRerun`, `readOnly`, `clearBlackboard`, `cost`/`value`, `outputBinding`, `trigger`. See `references/annotations.md` for full details.

## Domain Objects

Domain objects carry data and behavior — not anemic DTOs. Expose methods to LLMs with `@Tool` (Spring AI) or `@LlmTool` (Embabel); unannotated methods are **never** exposed. See `references/domain.md` for DICE best practices.

## Tools

- **@LlmTool** (Embabel) / **@Tool** (Spring AI) — expose JVM methods to LLMs
- **ToolCallContext** — inject infrastructure metadata invisible to the LLM
- **OneShotPerLoopTool** — prevent repeated tool calls in one planning loop
- **@Cost / costMethod / valueMethod** — compute action costs/values from blackboard state
- **SpEL Conditions** — dynamic preconditions in `@Condition` / `@Action(pre = "...")`
- **Subagent** — let the LLM invoke other agents as tools (`Subagent.ofClass(...).consuming(...)`)
- **UtilityInvocation** — lightweight utility workflows without `@Agent`

See `references/tools.md` for full details. The Embabel IntelliJ plugin (ID `31142`) suppresses false "never used" warnings on `@Action`/`@Condition`/`@Cost` methods (`references/tooling.md`).

## Planning Algorithms

| Planner | Best For | Determinism |
|---------|----------|-------------|
| **GOAP** (default) | Business processes with defined outputs | High |
| **Utility** | Exploration, event-driven systems | Medium |
| **Hybrid** | Reducer pipelines | Medium-High |
| **Supervisor** | Flexible multi-step workflows | Low |

Set via `@Agent(planner = PlannerType.XXX)`: well-defined goals → GOAP; deterministic → GOAP/Hybrid; event-driven → Utility; LLM orchestration → Supervisor. See `references/planners.md` for the full comparison.

## States with @State

Annotate classes with `@State` to trigger state transitions — previous state objects are hidden, the new state binds to the blackboard, and planning considers only actions from it. For looping states use `@Action(clearBlackboard = true)`; for HITL use `WaitFor.formSubmission("...", Feedback.class)`; use Java records or Kotlin top-level classes for state types. See `references/states.md` for staying in-state, inheritance, WaitFor, and parent-state patterns.

## DSL Builders (Kotlin/Java)

Use DSL builders (`SimpleAgentBuilder`, `ScatterGatherBuilder`, `ConsensusBuilder`, `RepeatUntil`, `RepeatUntilAcceptable`) for atomic workflows with multiple steps. Register with Spring via `@Bean` method returning `Agent`.

See `references/dsl-builders.md` for all builder types.

## Execution Modes

- **SIMPLE** (default): sequential, one action at a time — predictable, easy to debug
- **CONCURRENT**: all achievable actions run in parallel via virtual threads — higher throughput, actions must be concurrent-safe

Set `embabel.agent.platform.process-type: CONCURRENT`. Autonomy: Closed (LLM picks one agent) vs Open (LLM picks goal, assembles from all actions). See `references/invoking.md` for ConcurrentAgentProcess, confidence thresholds, ProcessOptions, and programmatic invocation.

## Chatbots

Chatbots use a **long-lived `AgentProcess`** that pauses between user messages; the blackboard maintains state across the session.

```java
@EmbabelComponent
public class MyChatbot {
    @Action(trigger = UserMessage.class)
    public AssistantResponse handleMessage(UserMessage msg, Ai ai) {
        return ai.withDefaultLlm().creating(AssistantResponse.class).fromPrompt(msg.getContent());
    }
}
```

`trigger = UserMessage.class` fires only when a user message is the most recently added blackboard value. Utility AI is often the best chatbot approach — define costed actions and let the planner pick the highest-value. Chatbots typically **need no goal** (the process waits indefinitely); define one only for transactional conversations. See `references/chatbots.md` for dynamic costs (`@Cost`/`costMethod`), context IDs, and conversation storage (`embabel.agent.platform.conversation-store: STORED`).

## RAG (Retrieval-Augmented Generation)

Embabel's RAG is **entirely agentic and tool-based** — the LLM controls retrieval (autonomous search, iterative refinement, cross-reference discovery, HyDE). The `ToolishRag` facade auto-discovers store capabilities (vector, text, regex, result expansion) and exposes them as LLM tools via `LlmReference`. See `references/rag.md` for the full RAG architecture and wiring.

## Decision & Classification Services (v1.5.4, experimental)

A **decision service** asks a model typed questions about one piece of state; a **classification
service** picks one category ID from a closed set. Use them for closed-category routing, proposition
assessment ("is this urgent?"), or ratings — the model's answer is *evidence*; the application owns
routing, authorization and policy. `DecisionService` extends `ClassificationService`, so every
decision service also classifies.

Select a service in a workflow with `Ai.decisions()` / `Ai.classifications()` — a `ServiceSelector`
with `defaultService()`, `named(name)`, `byRole(role)` and `using(service)` — and run a spec with
`decision.ask(input, spec)`. Build specs with `DecisionSpec` / `ClassificationSpec` (Java builder +
Kotlin `decisionSpec { }` DSL); read the `DecisionResponse` by typed lookup or name; project with
`DecisionProjection`.

Three question kinds: `PROPOSITION` (`PropositionResult`), `CHOICE` (`ClassificationResult`),
`RATING` (`RatingResult`). Outcomes: `Selected`/`NoMatch`/`Inconclusive`/`Failure` (choice) and
`Answered`/`Inconclusive`/`Failure` (proposition, rating).

Providers: TypeSafe's **Jev** and Cloudflare's **CLEF** models over the System One protocol
(`embabel-agent-starter-typesafe` / `-cloudflare`); CLEF also runs locally via Ollama with no key; or
a prompted chat model via `LlmDecisionServiceFactory`. Selected by name/role through
`embabel.models.decision.*` / `embabel.models.classification.*`.

See `references/decisions.md` (selection, registry, configuration, capabilities),
`references/decision-specs.md` (building/reading specs, JSON, projection) and
`references/decision-providers.md` (TypeSafe, Cloudflare, System One, Ollama, prompted LLM, BYOK,
diagnostics).

## MCP Server Publishing

Publish agents as MCP servers with SYNC or ASYNC mode over **Streamable HTTP** (default since v1.5.3, at `http://localhost:8080/mcp`):

```yaml
spring:
  ai:
    mcp:
      server:
        type: SYNC  # or ASYNC
        protocol: STREAMABLE  # default; STATELESS also supported
```

Goals annotated with `@Export(remote = true)` are auto-published as MCP tools. Security is two-layer: an HTTP filter chain (JWT via `SecurityWebFilterChain`) plus `@SecureAgentTool(expression = "hasAuthority('news:read')")` on agents/methods. SSE (`protocol: SSE`, `/sse`) is accepted but deprecated for removal in Spring AI 2.0 — migrate to `protocol: STREAMABLE`. See `references/integrations.md` for MCP client, observability, and A2A.

## Testing

- **Unit:** `FakeOperationContext.create()` + `context.expectResponse()`
- **Integration:** extend `EmbabelMockitoIntegrationTest`; `whenCreateObject()` / `verifyCreateObjectMatching()`
- **Always `.withId("...")`** on LLM calls for traceability

See `references/testing.md` for more patterns.

## Deep Dives

For topics not covered in detail above, consult the reference files:

| Topic | Reference |
|-------|-----------|
| LLM options, caching, native structured output, custom LLM/EmbeddingService | `references/llm-integration.md` |
| AgentProcess lifecycle, blackboard, planning loop | `references/flow.md` |
| Core types (`LlmOptions`, `PromptRunner`, `AgentImage`) | `references/types.md` |
| Structured prompts (`Persona`, `RoleGoalBackstory`, LlmReference providers) | `references/structured-prompts.md` |
| Interceptors & transformers | `references/interceptors.md` |
| Thinking, guardrails, cost tracking, streaming | `references/thinking.md`, `references/guardrails.md`, `references/cost-tracking.md`, `references/streaming.md` |
| Termination, error handling | `references/termination.md`, `references/error-handling.md` |
| Agent skills, API vs SPI | `references/agent-skills.md`, `references/api-spi.md` |
| Agent process persistence (HITL, JDBC) | `references/persistence.md` |
| Cache providers (AgentCacheProvider, regions) | `references/cache.md` |
| Decision & classification services (selection, registry, config) | `references/decisions.md` |
| Decision specs (build/read, JSON, projection) | `references/decision-specs.md` |
| Decision providers (TypeSafe, Cloudflare, System One, Ollama, prompted LLM, BYOK) | `references/decision-providers.md` |
| DashScope provider (Alibaba Qwen) | `references/dashscope.md` |
| Z.ai provider (Zhipu GLM, native client) | `references/zai-provider.md` |
| Tooling (IntelliJ IDEA plugin) | `references/tooling.md` |
| Production deployment (Docker, K8s, health, security) | `references/production-deployment.md` |
| Starter artifacts, provider keys, v1.5.2/v1.5.3/v1.5.4 change list | `references/providers.md` |

> **Rule:** Application code uses only `com.embabel.agent.api.*`. SPI (`com.embabel.agent.spi.*`) is for framework extension only and is subject to change.

## Configuration

Properties live under `embabel:` (models, planner, execution mode, logging, tool loop). See `references/configuration.md` for the full property reference.

## Threading & Async Mode

Enable virtual threads: `spring.threads.virtual.enabled=true`. Flip the threading model with `threading.override` or share the app's executor with `threading.shared`.

See `references/async-mode.md` for the full behavior matrix.

## Error Handling

- **Retry:** `createObject()` retries automatically; catch `LlmInvocationException` for custom fallback
- **Non-critical:** Use `createObjectIfPossible()` — returns null instead of throwing
- **Guardrails:** Catch `GuardRailViolationException` for `CRITICAL` blocks
- **Cost caps:** Use `EarlyTerminationPolicy` for process-level termination

See `references/error-handling.md` and `references/flow.md` for full patterns.

## Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| Agent not discovered | Check `@Agent`/`@EmbabelComponent` annotation and component scan path |
| Planner can't find plan | Verify `@AchievesGoal`, input type matching, enable DEBUG logging |
| LLM calls failing | Check API keys, model names, timeouts, network connectivity |
| High costs | Limit `max-iterations`, use cheaper models, enable `BudgetGuardRail` |

See `references/troubleshooting.md` for detailed steps.

## Migration

Migrating from Python AI frameworks? See `references/migrating.md` for guidance on migrating from CrewAI, Pydantic AI, and LangGraph.

## Examples

- **"Two-step agent: fetch an order, then write the refund note."** → "Agent Authoring": two `@Action`s with `@State` handoff (GOAP unless the domain grows); "Testing": `FakeOperationContext` skeleton first.
- **"Expose our invoicing agent to Claude Code."** → "MCP Server Publishing" (`@Export(remote = true)`), not a bespoke socket server.
- **"Migrate this LangGraph app."** → "Migration"; check "When NOT to Use Embabel" first — a planner earns nothing where the path is already known.

## Common Pitfalls

Top issues — see `references/common-pitfalls.md` for detailed Problem/Impact/Fix treatment.

1. **Missing `@AchievesGoal`** — Planner can't determine completion (it's `@AchievesGoal`, not `@Goal`)
2. **Missing `clearBlackboard = true` for loops** — Planner skips existing types
3. **Non-static inner classes for `@State`** — Serialization/persistence failures
4. **Missing `OperationContext` parameter** — Actions can't access AI or blackboard
5. **Forgetting `.withId()`** — Makes testing and debugging opaque

## Available Scripts

| Script | Purpose | Arguments |
|--------|---------|-----------|
| `scripts/project-creator.sh` | Scaffold a new Embabel agent project from the official Java/Kotlin template repos (via `embabel/project-creator`) | `--lang java\|kotlin --name <project-name> [--package <package>]` |

Requires `uvx` and `git`; templates: [Java](https://github.com/embabel/java-agent-template), [Kotlin](https://github.com/embabel/kotlin-agent-template).

## When NOT to Use Embabel

| Scenario | Better Alternative | Why |
|----------|-------------------|-----|
| Simple API endpoints / high-throughput microservices | Spring Boot alone | Embabel's planning loop adds overhead |
| Pure data processing / batch ETL | Spring Batch, Airflow, Spark | No LLM interaction or planning needed |
| Real-time streaming | WebFlux, gRPC | Embabel is agent-focused |
| Frontend web apps | React, Angular, Vue | Embabel is backend-only |
| Simple chatbot with a fixed flow | State machine library | No LLM-driven planning needed |

## Limitations

- **Version-pinned** — this guide targets v1.5.4; APIs in other releases may differ, so verify against the pinned upstream docs before porting code
- **Process persistence** — the snapshot factory supports `InMemoryBlackboard` and assumes at most one pending awaitable per `WAITING` process; writes are not transactional; renaming an agent class requires a snapshot migration (`references/persistence.md`)
- **MCP SSE transport** — deprecated for removal in a future Spring AI release; new deployments should use `protocol: STREAMABLE`
- **Cache-backed persistence** — the Spring `CacheManager` adapter has no atomic compare-and-set, so it is single-node only unless a backend-native `AgentCacheProvider` is used (`references/cache.md`)
- **Decision & classification services** — all decision/classification types are `@ApiStatus.Experimental`; the API is maintained as production code but may change before promotion, so pin and re-verify against the upstream docs (`references/decisions.md`)

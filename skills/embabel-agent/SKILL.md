---
name: embabel-agent
description: >-
  Build agentic AI applications on the JVM with Embabel — a Spring-based framework by Rod Johnson for creating agents that mix LLM interactions with code, domain models, and non-LLM planning algorithms (GOAP, Utility AI, Hybrid, Supervisor). Use this skill whenever the user asks about Embabel agent development, agent annotations, agentic tool design, planning configuration, testing, LLM provider setup, execution modes, autonomy modes, state-based workflows, human-in-the-loop patterns, agent skills, guardrails, cost tracking, structured prompts, streaming, DSL builders, domain objects, templates, project scaffolding, production deployment, error handling, troubleshooting, or common pitfalls. Also trigger when the user mentions Embabel, DICE framework, Rod Johnson's agent framework, JVM-based agentic flows, building agents with Spring Boot and LLMs, or MCP integration with Embabel.
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

```xml
<dependency>
    <groupId>com.embabel.agent</groupId>
    <artifactId>embabel-agent-starter</artifactId>
    <version>${embabel-agent.version}</version>
</dependency>
```

Available starters: `embabel-agent-starter` (basic), `embabel-agent-starter-shell` (CLI), `embabel-agent-starter-mcp` (MCP server).

Add Embabel repository for snapshots:
```xml
<repository>
    <id>embabel-snapshots</id>
    <url>https://repo.embabel.com/artifactory/libs-snapshot</url>
</repository>
```

### LLM Provider Dependencies

| Provider | Dependency | Default LLM |
|----------|-----------|-------------|
| OpenAI | `embabel-agent-starter-openai` | gpt-4o |
| Anthropic | `embabel-agent-starter-anthropic` | claude-sonnet-4-20250514 |
| Google Gemini | `embabel-agent-starter-gemini` | gemini-2.5-flash |
| Google GenAI | `embabel-agent-starter-google-genai` | gemini-3.5-flash |
| DeepSeek | `embabel-agent-starter-deepseek` | deepseek-chat |
| Mistral | `embabel-agent-starter-mistral-ai` | mistral-large |
| LM Studio | `embabel-agent-starter-lmstudio` | local model |
| Ollama | `embabel-agent-starter-ollama` | llama3.3 |
| OCI | `embabel-agent-starter-oci-genai` | oci-genai |

### Environment Setup

```
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
```

## Agent Process Lifecycle

An `AgentProcess` manages the complete execution lifecycle with states:
`NOT_STARTED` → `RUNNING` → `COMPLETED` / `FAILED` / `TERMINATED` / `KILLED` / `STUCK` / `WAITING` / `PAUSED`.

**Execution:** `tick()` for a single step, `run()` to execute as far as possible.

### Planning (OODA Loop)

After each action execution, the planner:
1. **Observe** — Examine current blackboard state
2. **Orient** — Understand what changed since last planning cycle
3. **Decide** — Use A* search (GOAP) or value-picking (Utility) to find optimal action sequence
4. **Act** — Execute next planned action, then replan

### Blackboard

```java
blackboard.add("key", value);        // add with explicit name
blackboard.add(value);               // add with default name ("it")
blackboard.get(MyClass.class);       // get most recent by type
blackboard.get("key", MyClass.class); // get by name and type
blackboard.hide(MyClass.class);      // hide from planning
```

### Context (Cross-Process State)

```java
var options = ProcessOptions.builder()
    .withContextId("user-session-123")
    .build();
```

## Agent Authoring

### @Agent — Direct Agent

```java
@Agent(description = "Writes and reviews stories")
public class WriteAndReviewAgent {

    @Action
    public Story writeStory(UserInput input, OperationContext context) {
        var writer = LlmOptions.withModel(OpenAiModels.GPT_4O_MINI)
            .withTemperature(0.8)
            .withPersona("You are a creative storyteller");
        return context.ai()
            .withLlm(writer)
            .withId("write-story")
            .creating(Story.class)
            .fromPrompt("Write a story about: " + input.getContent());
    }

    @AchievesGoal(description = "Review and improve the story")
    @Action
    public ReviewedStory reviewStory(Story story, OperationContext context) {
        var reviewer = LlmOptions.withModel(OpenAiModels.GPT_4O_MINI)
            .withTemperature(0.2)
            .withPersona("You are a careful editor");
        return context.ai()
            .withLlm(reviewer)
            .withId("review-story")
            .creating(ReviewedStory.class)
            .fromPrompt("Review this story and suggest improvements: " + story.text());
    }
}
```

### @Agentic — Auto-Discovered Agent

```java
@Agentic(description = "Generates reports from data")
public class ReportAgent { ... }
```

### @EmbabelComponent — Action Container (Not an Agent)

```java
@EmbabelComponent
public class IssueActions {
    @Action(cost = 0.1, value = 0.8, outputBinding = "ghIssue")
    public GHIssue saveNewIssue(GHIssue ghIssue, OperationContext context) { ... }
}
```

> **@Action key attributes:** `pre`/`post` conditions, `canRerun`, `readOnly`, `clearBlackboard`, `cost`/`value`, `outputBinding`, `trigger`. See `reference/annotations.md` for full details.

## Domain Objects

Domain objects carry both data and behavior — they are not anemic DTOs. Expose methods to LLMs with `@Tool`:

```java
public record Customer(long id, String name, double balance) {
    @Tool
    public double getLoyaltyDiscount() { return balance > 1000 ? 0.15 : 0.05; }
    // Unannotated methods are never exposed to LLMs
    void updateLoyaltyLevel() { ... }
}

context.ai().withDefaultLlm()
    .withToolObject(customer)
    .creating(Order.class)
    .fromPrompt("Create an order for this customer");
```

> **@Tool rules:** Any visibility, static or instance scope. Return type must be serializable. Not supported: Optional, async, reactive, functional types. Tools can be stateful. Unannotated methods are **never** exposed. See `reference/domain-objects.md` for full details and DICE best practices.

## Tools

### @LlmTool: Expose JVM Methods to LLMs

```java
public class MathTools {
    @LlmTool(description = "add two numbers")
    public double add(double a, double b) { return a + b; }
}
```

### ToolCallContext — Out-of-Band Metadata

```java
@LlmTool(description = "Look up customer")
public String lookupCustomer(long customerId, ToolCallContext context) {
    String tenantId = context.get("tenantId");
    String authToken = context.get("authToken");
    return customerService.lookup(customerId, tenantId, authToken);
}
```

### Subagent: Agent Handoffs

```java
var subagent = Subagent.ofClass(PerformanceFinder.class)
    .consuming(WorksToFind.class);

context.ai().withDefaultLlm()
    .withTool(subagent)
    .creating(Concert.class)
    .fromPrompt("Find performances and assemble a concert");
```

### Agentic Tools

```java
// Simple: all tools available immediately
var agenticTool = SimpleAgenticTool.builder()
    .withLlm(LlmOptions.withModel("gpt-4o"))
    .withTools(searchTool, analyzeTool, summarizeTool)
    .build();

// Playbook: progressive unlocking
var playbook = PlaybookTool.builder()
    .withTools(searchTool)
    .withTools(analyzeTool, PlaybookCondition.prerequisite("search"))
    .build();

// StateMachine: state-based availability
var sm = StateMachineTool.builder(OrderState.class)
    .withTool(createTool, OrderState.DRAFT)
    .withTool(confirmTool, OrderState.DRAFT, OrderState.CONFIRMED)
    .build();
```

### Tool Groups

```yaml
embabel:
  agent:
    platform:
      tools:
        weather:
          description: Get weather for location
          provider: Docker
          tools: [weather]
```

Use in actions:
```java
context.ai().withDefaultLlm()
    .withToolGroup(CoreToolGroups.WEB)
    .creating(RelevantNews.class)
    .fromPrompt("Find news about " + person.name());
```

### Tool Chaining

```java
context.ai().withDefaultLlm()
    .withToolChainingFrom(Customer.class)
    .creating(Customer.class)
    .fromPrompt("Find the customer");
// After customer is returned, customer.getLoyaltyDiscount() becomes available
```

> See `reference/tools.md` for full details: tool groups config, framework-agnostic Tool interface, OneShotPerLoopTool, domain tools.

## Planning Algorithms

| Planner | Best For | Determinism | Algorithm |
|---------|----------|-------------|-----------|
| **GOAP** (default) | Business processes with defined outputs | High | A* search over goal states |
| **Utility** | Exploration, event-driven systems | Medium | Highest net-value action picks |
| **Hybrid** | Reducer pipelines | Medium-High | Utility picking + goal termination |
| **Supervisor** | Flexible multi-step workflows | Low | LLM-orchestrated composition |

Set via `@Agent(planner = PlannerType.XXX)` or `ProcessOptions(plannerType = PlannerType.XXX)`.

### Choosing a Planner

1. **Well-defined goals with clear success conditions?** → GOAP
2. **Need deterministic, verifiable planning?** → GOAP or Hybrid
3. **Event-driven system?** → Utility
4. **Need LLM to make orchestration decisions?** → Supervisor
5. **Want iteration with a terminal condition?** → Hybrid

> See `reference/planners.md` for detailed comparison and examples for each planner.

## States with @State

State transitions work with all planners. When an action returns a `@State`-annotated class:

1. **Hides previous state objects** — existing states hidden from blackboard
2. **Binds the new state object** — added to blackboard
3. **Re-plans from the new state** — considers only actions from the new state

```java
@State
public sealed interface TicketCategory permits CriticalTicket, BugTicket, GeneralTicket {}

@Action
public TicketCategory triageTicket(Ticket ticket) {
    if (ticket.description().contains("down")) return new CriticalTicket(ticket);
    return new BugTicket(ticket);
}
```

For looping states, use `@Action(clearBlackboard = true)`. For human-in-the-loop: `WaitFor.formSubmission("Review this", HumanFeedback.class)`.

> See `reference/states.md` for detailed state patterns, inheritance, and WaitFor.

## DSL Builders (Kotlin/Java)

For atomic workflows that contain multiple steps:

```java
// Simple agent
var agent = SimpleAgentBuilder.builder(String.class)
    .withAction(ctx -> ctx.ai().withDefaultLlm()
        .creating(String.class)
        .fromPrompt(ctx.getInput()))
    .buildAgent("simple-agent", "Simple text generation");

// Scatter-Gather (parallel processing)
var agent = ScatterGatherBuilder.builder(String.class, FactCheck.class)
    .withForks(List.of(factCheck1, factCheck2, factCheck3))
    .withGather(facts -> new FactChecks(facts))
    .buildAgent("fact-checker", "Fact check from multiple sources");

// Repeat until condition met
var agent = RepeatUntil.builder(String.class)
    .withStep(ctx -> generateDraft(ctx.getInput()))
    .withCondition(draft -> draft.isAcceptable())
    .buildAgent("draft-until-acceptable", "Iterative draft refinement");
```

> See `reference/dsl.md` for all builder types, subprocess execution, and Spring bean registration.

## Execution Modes

### Process Execution (SIMPLE vs CONCURRENT)

| Mode | Behavior | When to Use |
|------|----------|-------------|
| **SIMPLE** (default) | Sequential: one action at a time | Most agents; predictable; easy to debug |
| **CONCURRENT** | All achievable actions run in parallel | Independent sub-tasks; fan-out/fan-in |

Set: `embabel.agent.platform.process-type: CONCURRENT`

### Autonomy (Closed vs Open Mode)

| Mode | Behavior | When to Use |
|------|----------|-------------|
| **Closed** | LLM picks one agent; agent runs in isolation | Strict agent boundaries |
| **Open** | LLM picks goal; assembles agent from all actions | Maximum flexibility |

```java
// Closed
autonomy.chooseAndRunAgent(userIntent, ProcessOptions.DEFAULT, agentPlatform, bindings);

// Open
autonomy.chooseAndAccomplishGoal(ProcessOptions.DEFAULT, approver, agentPlatform, bindings);
```

## Invocation

```java
// Type-safe invocation
var invocation = AgentInvocation.create(agentPlatform, ReviewedStory.class);
ReviewedStory result = invocation.invoke(new UserInput("Tell me a story"));

// Direct process
AgentProcess process = agentPlatform.createAgentProcess(myAgent, options, bindings);
Object result = agentPlatform.start(process).get();

// Async
var future = invocation.invokeAsync(input);
CompletableFuture<ReviewedStory> cf = future;
```

> See `reference/invocation.md` for Autonomy, GoalSelectionOptions, Shell usage, blackboard operations, and Context persistence.

## LLM Integration

### Mixing Models

```java
var writer = LlmOptions.withModel(OpenAiModels.GPT_4O_MINI)
    .withTemperature(0.8);

var reviewer = LlmOptions.withModel(OpenAiModels.GPT_4O)
    .withTemperature(0.2);
```

### Using the Ai Interface

```java
public record InjectedComponent(Ai ai) {
    public Joke createJoke(String topic1, String topic2, String voice) {
        return ai.withLlm(LlmOptions.withDefaultLlm().withTemperature(.8))
            .withId("tell-joke")
            .creating(Joke.class)
            .fromPrompt("Tell me a joke about %s and %s. Voice: %s".formatted(topic1, topic2, voice));
    }
}
```

### PromptRunner Methods

| Method | Purpose |
|--------|---------|
| `createObject(prompt, Class<T>)` | Create typed object (throws on failure, triggers retry) |
| `createObjectIfPossible(prompt, Class<T>)` | Try to create, return null on failure |
| `generateText(prompt)` | Simple text response |
| `withLlm(LlmOptions)` | Set LLM config |
| `withToolGroup(String)` | Add tool group |
| `withToolObject(obj)` | Add domain object with @Tool methods |
| `withId("id")` | Tag interaction for test verification |
| `withExample(text, obj)` | Few-shot example |
| `withPromptContributor(pc)` | Add prompt content |
| `rendering("template-name")` | Use Jinja template |

### Vision Support

```java
var image = AgentImage.fromFile(new File("diagram.png"));
context.ai().withDefaultLlm()
    .withImage(image)
    .generateText("What is in this image?");
```

> See `reference/llm-integration.md` for full details: LlmOptions, custom LLM providers, embedding services, callbacks, Anthropic caching.

## Structured Prompts

```java
var persona = new Persona(
    "Alex the Analyst",
    "A detail-oriented data analyst with expertise in financial markets.",
    "Help users understand complex financial data through clear analysis.",
    "Professional yet approachable, uses clear explanations."
);

context.ai().withDefaultLlm()
    .withPromptContributor(persona)
    .creating(Analysis.class)
    .fromPrompt("Analyze the data");
```

> See `reference/structured-prompts.md` for Persona, RoleGoalBackstory, custom contributors, LlmReference, and YML config.

## Streams

```java
context.ai().withDefaultLlm()
    .streaming()
    .createObject(Report.class)
    .fromPrompt("Generate report")
    .doOnNext(event -> {
        if (event instanceof Thinking thinking) {
            System.out.println("Thinking: " + thinking.getContent());
        } else if (event instanceof ObjectCreated obj) {
            System.out.println("Created: " + obj.getObject());
        }
    })
    .doOnComplete(() -> System.out.println("Stream complete"))
    .subscribe();
```

> See `reference/streams.md` for raw text streaming, thinking events, and reactive callbacks.

## Agent Skills

```java
// Load from GitHub
var skills = Skills.fromGitHub("github.com/owner/repo");
// Load locally
var skills = Skills.fromLocal(new File("./skills/"));
// Use with PromptRunner
context.ai().withDefaultLlm()
    .withSkills(skills)
    .creating(Result.class)
    .fromPrompt("...");
```

Skills use **lazy loading** — metadata in system prompt, full content on `activate`.

> See `reference/agent-skills.md` for GitHub URLs, validation, and combining with LlmReference.

## Guardrails

```java
context.ai().withDefaultLlm()
    .withGuardRails(new ToxicityGuardRail(), new PiiGuardRail())
    .creating(Analysis.class)
    .fromPrompt("Analyze this data");
```

`CRITICAL` severity blocks execution.

> See `reference/guardrails.md` for custom guardrails, global config, and POJO guardrails.

## Cost Tracking

```java
@EventListener
public void onCost(LlmInvocationEvent event) {
    double cost = event.getInvocation().getCost();
    String model = event.getInvocation().getLlmMetadata().getModel();
    String processId = event.getAgentProcess().getId();
    // Track by process, tenant, user, etc.
}
```

> See `reference/cost-tracking.md` for the full budget guardrail pattern and EarlyTerminationPolicy.

## Configuration

```yaml
embabel:
  models:
    default-llm: gpt-4o
    llms:
      cheapest: gpt-4o-mini
      best: gpt-4o
      reasoning: o3
  agent:
    platform:
      name: my-agent-platform
      process-type: SIMPLE  # or CONCURRENT
      toolloop:
        max-iterations: 20
        type: default
        empty-response:
          max-retries: 1
      autonomy:
        agent-confidence-cut-off: 0.6
        goal-confidence-cut-off: 0.6
      logging:
        personality: starwars  # starwars, severance, colossus, hitchhiker, montypython
        include-plan: true
        level: DEBUG
      rest:
        enabled: true
```

> **Important:** When producing configuration examples, always include the complete `embabel:` block with models, planner settings, execution mode, logging, and tool configuration.

> See `reference/configuration.md` for full property reference and provider-specific config.

## Testing

Embabel provides first-class testing support. Always provide **complete, runnable test classes**.

### Unit Testing with FakePromptRunner

```java
class StoryWriterTest {
    @Test
    void writeStory_promptContainsTopic() {
        var context = FakeOperationContext.create();
        context.expectResponse(new Story("Once upon a time..."));

        var agent = new WriteAndReviewAgent();
        var story = agent.writeStory(new UserInput("space exploration"), context);

        assertEquals(new Story("Once upon a time..."), story);
        var prompt = promptRunner.getLlmInvocations().getFirst().getPrompt();
        assertTrue(prompt.contains("space exploration"));
    }
}
```

### Integration Testing

```java
class StoryWriterIntegrationTest extends EmbabelMockitoIntegrationTest {
    @Test
    void shouldExecuteCompleteWorkflow() {
        whenCreateObject(contains("Craft a short story"), Story.class).thenReturn(story);
        whenGenerateText(contains("Review this story")).thenReturn(reviewedStory.review());

        var invocation = AgentInvocation.create(agentPlatform, ReviewedStory.class);
        var result = invocation.invoke(input);

        assertNotNull(result);
        verifyCreateObjectMatching(
            prompt -> prompt.contains("Craft a short story"),
            Story.class,
            llm -> llm.getLlm().getTemperature() == 0.9
        );
    }
}
```

### Testing Checklist

- [ ] Verify prompt content contains expected keywords/variables
- [ ] Verify LLM hyperparameters (temperature, model)
- [ ] Set and verify interaction IDs using `.withId("...")`
- [ ] For multi-step agents: call `expectResponse()` for each expected LLM call in order
- [ ] Verify the number of LLM invocations
- [ ] Include integration tests with `EmbabelMockitoIntegrationTest` for full workflow

> See `reference/testing.md` for more patterns including Mockito stubbing and example verification.

## When NOT to Use Embabel

| Scenario | Better Alternative | Why |
|----------|-------------------|-----|
| Simple API endpoints | Spring Boot alone | Embabel adds overhead you don't need |
| Pure data processing | Spring Batch, Apache Spark | No LLM interaction needed |
| Real-time streaming | WebFlux, gRPC | Embabel is agent-focused |
| Frontend web apps | React, Angular, Vue | Embabel is backend-only |
| Simple chatbot with fixed flow | State machine library | No need for LLM-driven planning |
| High-throughput microservices | Standard Spring Boot | Planning loop adds latency |
| Batch ETL jobs | Spring Batch, Airflow | No agent planning needed |

**Use Embabel when:**
- You need LLM-driven decision making
- You need domain-driven planning (GOAP, Utility AI)
- You need to mix LLM calls with traditional code logic
- You need human-in-the-loop workflows
- You need agent composition and handoffs

**Avoid Embabel when:**
- The workflow is fully deterministic (use regular code)
- You need sub-millisecond response times
- You're building a simple CRUD API
- The agent would only make one LLM call (use Spring AI directly)

## Error Handling

- **Retry on failure:** `createObject()` retries automatically; catch `LlmInvocationException` for custom fallback
- **Non-critical calls:** Use `createObjectIfPossible()` — returns null instead of throwing
- **Guardrail violations:** Catch `GuardRailViolationException` for `CRITICAL` guardrail blocks
- **Hard cost caps:** Use `EarlyTerminationPolicy` for process-level termination
- **Process monitoring:** Poll `process.getState()` for long-running agents

> See `reference/error-handling.md` for full error handling patterns and process states.

## Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| Agent not discovered | Check `@Agent`/`@Agentic` annotation and component scan path |
| Planner can't find plan | Verify `@AchievesGoal`, input type matching, enable DEBUG logging |
| Blackboard type not found | Check previous action added the type, not hidden by state transition |
| State transitions broken | Use `@State` annotation, Java records or Kotlin top-level classes |
| LLM calls failing | Check API keys, model names, timeouts, network connectivity |
| High costs | Limit `max-iterations`, use cheaper models, enable `BudgetGuardRail` |

> See `reference/troubleshooting.md` for detailed troubleshooting steps and debugging tips.

## Common Pitfalls

1. **Missing `@Agent`/`@Agentic`** — Agent won't be discovered
2. **Missing `OperationContext`** — Actions can't access AI or blackboard
3. **Confusing execution vs autonomy modes** — They operate at different levels
4. **Missing `@AchievesGoal`** — Planner can't determine completion
5. **Ignoring `max-iterations`** — Agent stops after 20 (default)
6. **Not setting model per-action** — Wastes money or sacrifices quality
7. **Forgetting `.withId()`** — Makes testing and debugging opaque
8. **Non-static inner classes for `@State`** — Serialization issues
9. **Missing `clearBlackboard = true` for loops** — Planner skips existing types
10. **Exposing sensitive methods** — Always gate with `@Tool`/`@LlmTool`
11. **Missing `@Export(remote=true)` on MCP** — Agents invisible to MCP clients
12. **Circular type dependencies** — Planner can't find valid plan path
13. **Custom conditions without `post`** — Other actions can't see them in `pre`

> See `reference/common-pitfalls.md` for detailed explanations and fixes for all 13 pitfalls.

## Production Deployment

- **Docker:** Multi-stage Dockerfile with JRE base image
- **Kubernetes:** Deployment manifest with secrets management
- **Health checks:** Spring Boot actuator endpoints (`/actuator/health`)
- **Monitoring:** Cost tracking listener, REST process status, SSE events
- **Security:** Environment variables for API keys, guardrails, `EarlyTerminationPolicy`, HTTPS

> See `reference/production-deployment.md` for full deployment guide and production checklist.

## Reference Files

Read these when you need deeper detail on a specific topic. The SKILL.md covers the core workflow; reference files fill in the edges.

### Core Framework

| File | When to Read |
|------|-------------|
| `reference/annotations.md` | Full @Action attributes, @Cost, @SecureAgentTool, @Provided, SomeOf, trigger |
| `reference/domain-objects.md` | DICE patterns, @Tool rules, domain objects in actions, best practices |
| `reference/planners.md` | Detailed planner comparison, when to choose each planner |
| `reference/states.md` | Complex state patterns, inheritance, parent state interface, WaitFor |
| `reference/dsl.md` | SimpleAgentBuilder, ScatterGatherBuilder, RepeatUntil, DSL registration |

### Tools & LLM Integration

| File | When to Read |
|------|-------------|
| `reference/tools.md` | Tool groups config, framework-agnostic Tool interface, detailed tool patterns |
| `reference/llm-integration.md` | LlmOptions, PromptRunner methods, custom LLM providers, Anthropic caching |
| `reference/streams.md` | Raw text streaming, thinking/object streaming, reactive callbacks |
| `reference/structured-prompts.md` | Persona, RoleGoalBackstory, custom contributors, YML config, built-in providers |

### Agent Platform

| File | When to Read |
|------|-------------|
| `reference/configuration.md` | Full property reference, provider-specific setup, custom LLM/EmbeddingService |
| `reference/invocation.md` | Autonomy, GoalSelectionOptions, Shell usage, blackboard operations, Context |
| `reference/agent-skills.md` | GitHub/local loading, validation, combining with LlmReference |
| `reference/guide-server.md` | Guide server, MCP server/client, WebSocket chat, Docker deployment |

### Safety & Operations

| File | When to Read |
|------|-------------|
| `reference/guardrails.md` | Custom guardrails, global config, budget guardrail pattern, POJO guardrails |
| `reference/cost-tracking.md` | Cost events, budget enforcement, EarlyTerminationPolicy |
| `reference/error-handling.md` | Retry patterns, guardrail violations, process state monitoring |
| `reference/troubleshooting.md` | Common issues with step-by-step fixes and debugging tips |
| `reference/common-pitfalls.md` | 13 common pitfalls with explanations and how to avoid them |
| `reference/production-deployment.md` | Docker, Kubernetes, health checks, monitoring, security checklist |

### Testing

| File | When to Read |
|------|-------------|
| `reference/testing.md` | Advanced testing patterns (Mockito, examples, multi-step verification) |

> **Tip:** If a section in SKILL.md mentions "see X.md for details," read that reference file for the full picture.

## Scaffolding

When the user wants to create a new Embabel project from scratch, use the bundled project-creator script:

```bash
# Java project (default)
scripts/project-creator.sh --name my-agent

# Kotlin project
scripts/project-creator.sh --lang kotlin --name my-agent

# Custom package name
scripts/project-creator.sh --name my-agent --package com.example.myagent
```

The script clones the Embabel project-creator tool, fetches the Java or Kotlin template repository, and generates a complete project with Maven/Gradle, Spring Boot, and Embabel dependencies.

> **When to use:** New projects, quick prototypes, or when the user says "create a new Embabel project", "scaffold an Embabel app", or "generate an Embabel template".

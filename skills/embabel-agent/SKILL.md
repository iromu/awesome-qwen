---
name: embabel-agent
description: >-
  Build agentic AI applications on the JVM with Embabel — a Spring-based framework by Rod Johnson for creating agents that mix LLM interactions with code, domain models, and non-LLM planning algorithms (GOAP, Utility AI, Hybrid, Supervisor). Use this skill whenever the user asks about Embabel agent development, agent annotations (@Agent, @Agentic, @Action, @Condition, @AchievesGoal, @State, @EmbabelComponent, @SecureAgentTool, @Provided, @Cost, @LlmTool, @Tool, @RequireNameMatch, SomeOf, trigger), agentic tool design (ToolCallContext, tool groups, subagent handoffs, SimpleAgenticTool, PlaybookTool, StateMachineTool), planning configuration, testing with FakePromptRunner or EmbabelMockitoIntegrationTest, LLM provider setup, execution modes (SIMPLE/CONCURRENT), autonomy modes (CLOSED/OPEN), state-based workflows, human-in-the-loop patterns, agent skills (loading from GitHub, lazy loading, validation), guardrails (input validation, response validation, budget guardrails), cost tracking, structured prompts (PromptContributor, LlmReference, Persona), streaming (thinking, object streaming), DSL builders (SimpleAgentBuilder, ScatterGatherBuilder, RepeatUntil), domain objects (DICE), templates, or project scaffolding with project-creator.sh. Also trigger when the user mentions Embabel, DICE framework, Rod Johnson's agent framework, JVM-based agentic flows, building agents with Spring Boot and LLMs, or MCP integration with Embabel.
---

# Embabel Agent Framework

This skill helps you build agentic AI applications on the JVM using the **Embabel framework** — a Spring-based framework for authoring agentic flows that seamlessly mix LLM-prompted interactions with code and domain models. Created by Rod Johnson (creator of Spring), it supports intelligent path-finding towards goals using non-LLM AI planning algorithms (GOAP, Utility AI, Hybrid, Supervisor).

## Output Quality

When producing code or documentation:

- **Be comprehensive** — Provide complete, multi-section outputs with thorough explanations, not minimal snippets
- **Include complete code** — Full classes with imports, domain models, and all annotations, not partial examples
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
- **Plan** — Dynamically generated sequence of actions. The planner recomputes after each action (OODA loop).
- **Agent Skills** — Lazy-loaded, reusable skill packages (scripts, references, assets) following the Agent Skills Specification.
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

Available starters:
- `embabel-agent-starter` — Basic agent platform
- `embabel-agent-starter-shell` — Interactive CLI
- `embabel-agent-starter-mcp` — MCP server

Add Embabel repository for snapshots:
```xml
<repository>
    <id>embabel-snapshots</id>
    <url>https://repo.embabel.com/artifactory/libs-snapshot</url>
</repository>
```

### Quick Start Templates

Use the bundled project-creator script to scaffold a new Embabel project:

```bash
# Java project
scripts/project-creator.sh --lang java --name my-agent

# Kotlin project with custom package
scripts/project-creator.sh --lang kotlin --name research-agent --package com.acme.research
```

The script clones the appropriate template repo and configures the project. It requires `uvx` (Python package manager) and `git`.

Alternatively, clone templates directly:
- [Java Template](https://github.com/embabel/java-agent-template) — Clone and customize
- [Kotlin Template](https://github.com/embabel/kotlin-agent-template) — Clone and customize

### Environment Setup

```
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
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

## Agent Process Lifecycle

An `AgentProcess` manages the complete execution lifecycle with these states:

**Process States:**
- `NOT_STARTED` → `RUNNING` → `COMPLETED` / `FAILED` / `TERMINATED` / `KILLED` / `STUCK` / `WAITING` / `PAUSED`

**Execution Methods:**
- `tick()` — perform the next single step
- `run()` — execute as far as possible

### Planning (OODA Loop)

After each action execution, the planner:
1. **Observe** — Examine current blackboard state
2. **Orient** — Understand what changed since last planning cycle
3. **Decide** — Use A* search (GOAP) or value-picking (Utility) to find optimal action sequence
4. **Act** — Execute next planned action, then replan

This creates a dynamic **OODA loop** that allows agents to adapt to unexpected results, handle dynamic environments, recover from partial failures, and take advantage of new opportunities.

### Blackboard

The blackboard is the shared memory system:

```java
blackboard.add("key", value);        // add with explicit name
blackboard.add(value);               // add with default name ("it")
blackboard.get(MyClass.class);       // get most recent by type
blackboard.get("key", MyClass.class); // get by name and type
blackboard.hide(MyClass.class);      // hide from planning
```

Most of the time, user code doesn't interact with the blackboard directly — action inputs come from it and outputs are automatically added.

### Context (Cross-Process State)

Embabel's `Context` persists state across multiple agent processes:

```java
var options = ProcessOptions.builder()
    .withContextId("user-session-123")
    .build();
```

Context is identified by `contextId` and populated into each process's blackboard. Implementation depends on `ContextRepository` — the default is in-memory only.

## Agent Authoring Patterns

### Annotation-Based Model (Java/Kotlin)

#### @Agent — Direct Agent

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

#### @Agentic — Auto-Discovered Agent

```java
@Agentic(description = "Generates reports from data")
public class ReportAgent { ... }
```

Both are Spring beans. `@Agentic` agents are auto-registered and picked up by the platform's agent scanning (enabled by default via `embabel.agent.platform.scanning.annotation`).

#### @EmbabelComponent — Action Container (Not an Agent)

```java
@EmbabelComponent
public class IssueActions {
    @Action(cost = 0.1, value = 0.8, outputBinding = "ghIssue")
    public GHIssue saveNewIssue(GHIssue ghIssue, OperationContext context) { ... }
}
```

Useful with Utility AI planner that selects the most valuable next action among all available actions.

### @Action Annotation Details

Key attributes:
- **pre/post** — Additional conditions beyond input types (SpEL or method names)
- **canRerun** — Can the action run again? Defaults to false.
- **readOnly** — No external side effects (useful for learning/catchup modes)
- **clearBlackboard** — Clear blackboard after action, keeping only output. Useful for looping states.
- **cost/value** — For Utility AI planning (0.0–1.0)
- **outputBinding** — Explicit blackboard binding name
- **trigger** — Fire only when a specific type is the most recently added blackboard value (reactive/event-driven)

See `reference/annotations.md` for full details: `@Cost`/`costMethod`, `@SecureAgentTool`, `@Provided`, `@RequireNameMatch`, `SomeOf`, `trigger`, SpEL patterns, parameter types, inheritance.

## Domain Objects

Domain objects carry both data and behavior. Expose methods to LLMs with `@Tool`:

```java
public record Customer(long id, String name, double balance) {
    @Tool
    public double getLoyaltyDiscount() { return balance > 1000 ? 0.15 : 0.05; }
    // Unannotated methods are never exposed to LLMs
    void updateLoyaltyLevel() { ... }
}
```

```java
context.ai().withDefaultLlm()
    .withToolObject(customer)
    .creating(Order.class)
    .fromPrompt("Create an order for this customer");
```

> **DICE principle:** Domain-Integrated Context Engineering — domain objects should not be anemic; they should encapsulate business logic and expose it selectively to LLMs.

See `reference/domain-objects.md` for DICE patterns, @Tool rules, domain objects in actions, and best practices.

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

Set at process boundary: `ProcessOptions.withToolCallContext(Map.of("tenantId", "acme"))`
Set per-interaction: `context.ai().withDefaultLlm().withToolCallContext(Map.of("entityId", "123"))`

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

### OneShotPerLoopTool

For tools meant to fire at most once per agentic loop iteration:

```java
var tool = new OneShotPerLoopTool(
    underlyingTool,
    "The body was returned earlier — read it from your conversation history."
);
```

## Planning Algorithms

| Planner | Best For | Determinism | Algorithm |
|---------|----------|-------------|-----------|
| **GOAP** (default) | Business processes with defined outputs | High | A* search over goal states |
| **Utility** | Exploration, event-driven systems | Medium | Highest net-value action picks |
| **Hybrid** | Reducer pipelines | Medium-High | Utility picking + goal termination |
| **Supervisor** | Flexible multi-step workflows | Low | LLM-orchestrated composition |

Set via `@Agent(planner = PlannerType.XXX)` or `ProcessOptions(plannerType = PlannerType.XXX)`.

### Utility AI

```java
@EmbabelComponent
public class IssueActions {
    @Action(cost = 0.1, value = 0.8)
    public GHIssue saveNewIssue(GHIssue ghIssue, OperationContext context) { ... }
}
```

### States with @State

```java
@State
public sealed interface TicketCategory permits CriticalTicket, BugTicket, GeneralTicket {}

@Action
public TicketCategory triageTicket(Ticket ticket) {
    if (ticket.description().contains("down")) return new CriticalTicket(ticket);
    return new BugTicket(ticket);
}
```

State transitions: previous states hidden, new state bound, only current state's actions considered.

For looping states, use `@Action(clearBlackboard = true)`.

For human-in-the-loop: `WaitFor.formSubmission("Review this", HumanFeedback.class)`

See `reference/states.md` for detailed state patterns.

### DSL Builders (Kotlin/Java)

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

See `reference/dsl.md` for all builder types, subprocess execution, and Spring bean registration.

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

### AgentInvocation (Type-Safe)

```java
var invocation = AgentInvocation.create(agentPlatform, ReviewedStory.class);
ReviewedStory result = invocation.invoke(new UserInput("Tell me a story"));
```

### AgentProcess (Direct)

```java
AgentProcess process = agentPlatform.createAgentProcess(myAgent, options, bindings);
Object result = agentPlatform.start(process).get();
```

### Async

```java
var future = invocation.invokeAsync(input);
CompletableFuture<ReviewedStory> cf = future;
```

### REST Endpoints

- `GET /api/v1/process/{processId}` — Process status
- `DELETE /api/v1/process/{processId}` — Kill process
- `GET /events/process/{processId}` — SSE stream

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

### Streaming

Embabel supports streaming with thinking and object events:

```java
context.ai().withDefaultLlm()
    .streaming()
    .createObject(Report.class)
    .fromPrompt("Generate report")
    .doOnNext(event -> {
        if (event instanceof Thinking thinking) { ... }
        else if (event instanceof ObjectCreated obj) { ... }
    })
    .doOnComplete(() -> { ... })
    .subscribe();
```

See `reference/llm-integration.md` for full details: LlmOptions, PromptRunner methods, custom LLM providers, embedding services, callbacks, Anthropic caching, structured prompts.

## Agent Skills

Agent Skills provide reusable, shareable skill packages following the [Agent Skills Specification](https://agentspec.dev).

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

Skills use **lazy loading** — metadata in system prompt, full content on `activate`. See `reference/agent-skills.md` for full details (GitHub URLs, validation, combining with LlmReference).

## Guardrails

Guardrails validate user inputs and LLM responses using configurable policies.

```java
// Per-call guardrails
context.ai().withDefaultLlm()
    .withGuardRails(new ToxicityGuardRail(), new PiiGuardRail())
    .creating(Analysis.class)
    .fromPrompt("Analyze this data");

// Global guardrails in application.yml
// embabel.agent.platform.guardrails.user-input=com.example.ToxicityGuardRail
```

`CRITICAL` severity blocks execution. See `reference/guardrails.md` for custom guardrails, global config, and POJO guardrails.

## Cost Tracking

Embabel emits `LlmInvocationEvent` and `EmbeddingInvocationEvent` for every call.

```java
@EventListener
public void onCost(LlmInvocationEvent event) {
    double cost = event.getInvocation().getCost();
    // Track by process, tenant, user, etc.
}
```

Combine cost tracking with guardrails to enforce budgets. See `reference/cost-tracking.md` for the full budget guardrail pattern and EarlyTerminationPolicy.

## Configuration

Key properties in `application.yml`:

```yaml
embabel:
  models:
    default-llm: gpt-4.1-mini
    llms:
      cheapest: gpt-4o-mini
      best: gpt-4o
      reasoning: o1-preview
  agent:
    platform:
      name: my-agent-platform
      process-type: SIMPLE  # or CONCURRENT
      toolloop:
        max-iterations: 20
        type: default  # or "parallel"
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

> **Important:** When producing configuration examples, always include the complete `embabel:` block with models, planner settings, execution mode, logging, and tool configuration — not just a snippet.

See `reference/configuration.md` for full property reference and provider-specific config.

## Testing

Embabel provides first-class testing support. Always provide **complete, runnable test classes**.

### Unit Testing with FakePromptRunner

```java
class StoryWriterTest {
    @Test
    void writeStory_promptContainsTopic() {
        var context = FakeOperationContext.create();
        var promptRunner = (FakePromptRunner) context.promptRunner();
        context.expectResponse(new Story("Once upon a time..."));

        var agent = new WriteAndReviewAgent();
        var story = agent.writeStory(new UserInput("space exploration"), context);

        assertEquals(new Story("Once upon a time..."), story);
        var prompt = promptRunner.getLlmInvocations().getFirst().getPrompt();
        assertTrue(prompt.contains("space exploration"));
    }

    @Test
    void writeStory_temperatureIs0_8() {
        var context = FakeOperationContext.create();
        context.expectResponse(new Story("..."));

        var agent = new WriteAndReviewAgent();
        agent.writeStory(new UserInput("test"), context);

        var temperature = promptRunner.getLlmInvocations().getFirst()
            .getInteraction().getLlm().getTemperature();
        assertEquals(0.8, temperature, 0.01);
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

See `reference/testing.md` for more patterns.

## Common Pitfalls

1. **Forgetting `@Agent` or `@Agentic` on the class** — The agent won't be discovered by the platform
2. **Not providing `OperationContext`** — Actions need it to access the AI and blackboard
3. **Confusing execution modes** — SIMPLE vs CONCURRENT (process execution) vs CLOSED vs OPEN (autonomy)
4. **Not using `@AchievesGoal`** — Without it, the planner can't determine goal satisfaction
5. **Ignoring tool loop iterations** — Default is 20; increase for complex multi-step agents
6. **Not setting model per-action** — Using the default model for everything wastes money or sacrifices quality
7. **Forgetting `.withId()` on LLM calls** — Makes test verification harder and debugging opaque
8. **Using non-static inner classes for @State** — Causes serialization/persistence issues; use records (Java) or top-level classes (Kotlin)
9. **Not using `clearBlackboard = true` for looping states** — Planner sees output type already exists and skips
10. **Allowing LLMs to call sensitive methods** — Always gate with `@Tool`/`@LlmTool`; unannotated methods stay hidden
11. **Missing `@Export(remote=true)` on MCP agents** — Agents won't be visible to MCP clients like Claude Desktop
12. **Circular type dependencies** — Check that action input/output types form a valid plan path; use `ProcessOptions.verbosity` to debug planning
13. **Custom conditions without postconditions** — If an action sets a custom condition, mark it in `post`; if another action depends on it, mark it in `pre`

## Reference Files

Read these when you need deeper detail on a specific topic. The SKILL.md covers the core workflow; reference files fill in the edges.

| File | When to Read |
|------|-------------|
| `reference/configuration.md` | Full property reference, provider-specific setup, custom LLM/EmbeddingService |
| `reference/testing.md` | Advanced testing patterns (Mockito, examples, multi-step verification) |
| `reference/planners.md` | Detailed planner comparison, when to choose each planner |
| `reference/states.md` | Complex state patterns, inheritance, parent state interface, WaitFor |
| `reference/tools.md` | Tool groups config, framework-agnostic Tool interface, detailed tool patterns |
| `reference/invocation.md` | Autonomy, GoalSelectionOptions, Shell usage, blackboard operations, Context |
| `reference/guardrails.md` | Custom guardrails, global config, budget guardrail pattern, POJO guardrails |
| `reference/cost-tracking.md` | Cost events, budget enforcement, EarlyTerminationPolicy |
| `reference/agent-skills.md` | GitHub/local loading, validation, combining with LlmReference |
| `reference/structured-prompts.md` | Persona, RoleGoalBackstory, custom contributors, YML config, built-in providers |
| `reference/streams.md` | Raw text streaming, thinking/object streaming, reactive callbacks |
| `reference/dsl.md` | SimpleAgentBuilder, ScatterGatherBuilder, RepeatUntil, DSL registration |
| `reference/guide-server.md` | Guide server, MCP server/client, WebSocket chat, Docker deployment |

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

The script:
- Clones the Embabel project-creator tool
- Fetches the Java or Kotlin template repository
- Generates a complete project with Maven/Gradle, Spring Boot, and Embabel dependencies
- Sets up the `WriteAndReviewAgent` example

After scaffolding, the user can:
- Run the shell: `./mvnw spring-boot:run` (or `./gradlew bootRun`)
- Customize the agent in the generated code
- Add more agents, tools, and planners as needed

> **When to use:** New projects, quick prototypes, or when the user says "create a new Embabel project", "scaffold an Embabel app", or "generate an Embabel template".

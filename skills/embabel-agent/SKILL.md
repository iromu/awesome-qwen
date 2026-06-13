---
name: embabel-agent
description: >-
  Build agentic AI applications on the JVM with Embabel — a Spring-based framework by Rod Johnson for creating agents that mix LLM interactions with code, domain models, and non-LLM planning algorithms (GOAP, Utility AI, Hybrid, Supervisor). Use this skill whenever the user asks about Embabel agent development, agent annotations (@Agent, @Agentic, @Action, @Condition, @AchievesGoal, @State, @EmbabelComponent, @SecureAgentTool, @Provided, @Cost, @Tool, @LlmTool, @RequireNameMatch, SomeOf, trigger), agentic tool design (ToolCallContext, tool groups, subagent handoffs, SimpleAgenticTool, PlaybookTool, StateMachineTool), planning configuration, testing with FakePromptRunner or EmbabelMockitoIntegrationTest, LLM provider setup, execution modes (SIMPLE/CONCURRENT), autonomy modes (CLOSED/OPEN), state-based workflows, human-in-the-loop patterns, agent skills (loading from GitHub, lazy loading, validation), guardrails (input validation, response validation, budget guardrails), cost tracking, structured prompts (PromptContributor, LlmReference, Persona), streaming (thinking, object streaming), DSL builders (SimpleAgentBuilder, ScatterGatherBuilder, RepeatUntil), domain objects (DICE), templates, or project scaffolding with project-creator.sh. Also trigger when the user mentions Embabel, DICE framework, Rod Johnson's agent framework, JVM-based agentic flows, building agents with Spring Boot and LLMs, or MCP integration with Embabel.
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

Domain objects carry both data and behavior — they are not anemic DTOs. Expose methods to LLMs with `@Tool`:

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

### DICE: Domain-Integrated Context Engineering

Domain understanding is fundamental to effective context engineering. Domain objects serve as the bridge between:
- **Business Domain** — Real-world entities and their relationships
- **Agent Behavior** — How LLMs understand and interact with the domain
- **Code Actions** — Traditional programming logic that operates on domain objects

### @Tool Rules

- `@Tool` methods can have any visibility, static or instance scope
- Return type must be serializable
- Not supported: Optional, async types, reactive types, functional types
- Tools can be stateful — often encapsulate domain objects with private state
- Unannotated methods are **never** exposed to LLMs, regardless of visibility

### Domain Objects in Actions

Domain objects can be used naturally in action methods:

```java
@Action
public Order createOrder(Customer customer, Ai ai) {
    // customer is available as a tool AND as a parameter
    return ai.withDefaultLlm()
        .withToolObject(customer)  // expose @Tool methods
        .creating(Order.class)
        .fromPrompt("Create an order for this customer");
}
```

### Best Practices

- **Encapsulate business logic** within domain objects where it belongs
- **Expose selectively** — only methods the LLM should call get `@Tool`
- **Keep internal details hidden** — think carefully before exposing methods that mutate state
- **Design for toolability** — consider which methods should be callable by LLMs
- **Reuse across agents** — domain objects work across multiple agents

See `reference/domain-objects.md` for full @Tool rules, domain objects in actions, and DICE best practices.

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

### GOAP (Goal Oriented Action Planning)

The default planner. Uses A* search to find a sequence of actions that achieves the goal state.

**How it works:**
1. The planner examines the current state (bindings on the blackboard)
2. It identifies goals that haven't been achieved
3. It searches for actions whose postconditions satisfy the goal
4. It builds a plan and executes actions one by one
5. After each action, it replans from the new state

**When to use:**
- You have well-defined goals with clear success conditions
- You want deterministic, verifiable planning
- Your domain has a rich set of reusable actions

**Example:**
```java
@Agent(description = "Travel planning agent")
public class TravelAgent {

    @Action
    public FlightInfo searchFlights(Destination dest, Ai ai) { ... }

    @Action
    public HotelInfo searchHotels(FlightInfo flight, Ai ai) { ... }

    @AchievesGoal(description = "Complete travel plan with flight and hotel")
    @Action
    public TravelPlan compilePlan(FlightInfo flight, HotelInfo hotel, Ai ai) { ... }
}
```

### Utility AI

Selects the action with the highest **net value** (`value - cost`) from all available actions at each step.

**When to use:**
- Event-driven systems that react to incoming events
- Chatbots with multiple response options
- Exploration tasks where you want to discover what's possible

**Action Cost and Value:**
```java
@Action(cost = 0.1, value = 0.8)  // net value = 0.7
public Output highValueAction(Input input) { ... }
```

### Hybrid Planner

Combines Utility AI's value-based action picking with goal-satisfaction termination.

**When to use:**
- You want iteration with a terminal condition
- Reducer pipelines where each step improves the result

### Supervisor Planner

Uses an LLM to orchestrate actions dynamically. Non-deterministic.

**When to use:**
- Action ordering is context-dependent
- You want an LLM to synthesize across multiple sources
- Non-determinism is acceptable

**Example:**
```java
@Agent(planner = PlannerType.SUPERVISOR, description = "Market research report generator")
public class MarketResearchAgent {

    @Action(description = "Gather market data")
    public MarketData gatherMarketData(MarketDataRequest request, Ai ai) { ... }

    @Action(description = "Analyze competitors")
    public CompetitorAnalysis analyzeCompetitors(CompetitorAnalysisRequest request, Ai ai) { ... }

    @AchievesGoal(description = "Compile the final report")
    @Action(description = "Compile the final report")
    public FinalReport compileReport(ReportRequest request, Ai ai) { ... }
}
```

### Choosing a Planner

Ask yourself:

1. **Do I have well-defined goals with clear success conditions?**
   - Yes → GOAP
   - No → Utility or Supervisor

2. **Do I need deterministic, verifiable planning?**
   - Yes → GOAP or Hybrid
   - No → Supervisor

3. **Is this an event-driven system?**
   - Yes → Utility

4. **Do I need the LLM to make orchestration decisions?**
   - Yes → Supervisor

5. **Do I want iteration with a terminal condition?**
   - Yes → Hybrid

See `reference/planners.md` for detailed planner comparison and when to choose each planner.

### States with @State

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

For full streaming details (object streaming, raw text streaming, thinking events), see the **Streams** section.

See `reference/llm-integration.md` for full details: LlmOptions, PromptRunner methods, custom LLM providers, embedding services, callbacks, Anthropic caching.

## Structured Prompts

Embabel provides structured ways to organize and inject content into LLM prompts.

### PromptContributor

`PromptContributor` injects reusable content into prompts:

```java
context.ai().withDefaultLlm()
    .withPromptContributor(new Persona("Alex", "Data analyst.", "Help users.", "Professional."))
    .creating(Analysis.class)
    .fromPrompt("Analyze the data");
```

#### Built-in Convenience Classes

**Persona** — Define an AI agent's personality:

```java
var persona = new Persona(
    "Alex the Analyst",
    "A detail-oriented data analyst with expertise in financial markets.",
    "Help users understand complex financial data through clear analysis.",
    "Professional yet approachable, uses clear explanations."
);
```

Generates:
```
You are Alex the Analyst.
Your persona: A detail-oriented data analyst with expertise in financial markets.
Your objective is Help users understand complex financial data through clear analysis.
Your voice: Professional yet approachable, uses clear explanations.
```

**RoleGoalBackstory** — Follows the Crew AI pattern:

```java
var rgb = new RoleGoalBackstory(
    "Senior Software Engineer",
    "Write clean, maintainable code",
    "10+ years experience in enterprise software development"
);
```

Generates:
```
Role: Senior Software Engineer
Goal: Write clean, maintainable code
Backstory: 10+ years experience in enterprise software development
```

**Custom PromptContributor** — For domain-specific context:

```java
var custom = new PromptContributor() {
    @Override
    public String contribution() {
        return "Here is the domain context: " + domainContext;
    }
};
```

### LlmReference

A subinterface of `PromptContributor` that also provides tools via annotated `@Tool` methods:

```java
public interface LlmReference extends PromptContributor {
    String getName();
    String getDescription();
}
```

Add via `withReference()`:

```java
var reference = new LlmReference("git-repo", "GitHub repository tools") {
    @Tool
    public String getFile(String path) { ... }
};

context.ai().withDefaultLlm()
    .withReference(reference)
    .creating(Result.class)
    .fromPrompt("Get the file from the repo");
```

**When to use LlmReference vs PromptContributor:**

| Use LlmReference | Use PromptContributor |
|------------------|----------------------|
| Need to provide both content AND tools | Just need to inject text |
| Want specific instructions on tool usage | Simple text injection |
| Data may be best as tools or content | Static content |

**Built-in LlmReference providers:**
- `LiteralText` — Text in `notes` field
- `SpringResource` — Contents of a Spring resource path
- `WebPage` — Content of a fetchable web page
- `GitHubRepository` — GitHub repositories (`embabel-agent-code` module)
- `ApiReferenceProvider` — API from classpath (`embabel-agent-code` module)

**YML Configuration** — Define references in `references.yml`:

```yaml
- fqn: com.embabel.agent.api.reference.LiteralText
  name: domain-context
  description: Domain context for agents
  notes: |
    Here is the domain context...
- fqn: com.embabel.agent.api.reference.WebPage
  name: api-docs
  description: API documentation
  url: https://api.example.com/docs
```

Parse with: `List<LlmReference> refs = LlmReferenceProviders.fromYml("references.yml");`

See `reference/structured-prompts.md` for full details: custom contributors, YML config, built-in providers.

## Streams

Embabel supports streaming data from the LLM gradually using Spring Reactive Programming.

### Object Streaming

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

### Raw Text Streaming

```java
context.ai().withDefaultLlm()
    .streaming()
    .generateText("Write a story")
    .doOnNext(event -> {
        if (event instanceof TextChunk chunk) {
            System.out.print(chunk.getText());
        }
    })
    .doOnComplete(() -> System.out.println())
    .subscribe();
```

**Key points:**
- Streaming works with `createObject`, `createObjectIfPossible`, and `generateText`
- `Thinking` events contain LLM reasoning content
- `ObjectCreated` events contain the created object as it's streamed
- Use Spring Reactive callbacks (`doOnNext`, `doOnComplete`, `doOnError`, etc.)
- Must call `.subscribe()` to start the stream
- Underlying infrastructure is Spring AI ChatClient

See `reference/streams.md` for full details.

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

Embabel emits `LlmInvocationEvent` and `EmbeddingInvocationEvent` for every call, enabling real-time cost tracking and budget management.

### Basic Cost Listener

```java
@EventListener
public void onCost(LlmInvocationEvent event) {
    double cost = event.getInvocation().getCost();
    String model = event.getInvocation().getLlmMetadata().getModel();
    String processId = event.getAgentProcess().getId();
    // Track by process, tenant, user, etc.
}
```

### Cost Tracking by Dimension

**By process** — accumulate costs per agent process:

```java
public class ProcessCostListener implements AgenticEventListener {
    private final ConcurrentHashMap<String, Double> costs = new ConcurrentHashMap<>();

    @EventListener
    public void onLlmCall(LlmInvocationEvent event) {
        String processId = event.getAgentProcess().getId();
        costs.merge(processId, event.getInvocation().getCost(), Double::sum);
    }

    public double getProcessCost(String processId) {
        return costs.getOrDefault(processId, 0.0);
    }
}
```

**By tenant** — for multi-tenant scenarios:

```java
public class TenantCostListener implements AgenticEventListener {
    private final ConcurrentHashMap<String, Double> tenantCosts = new ConcurrentHashMap<>();

    @EventListener
    public void onLlmCall(LlmInvocationEvent event) {
        String tenantId = event.getToolCallContext().get("tenantId");
        if (tenantId != null) {
            tenantCosts.merge(tenantId, event.getInvocation().getCost(), Double::sum);
        }
    }
}
```

### Budget Guardrail Pattern

Combine cost tracking with guardrails to cap spending:

```java
public class BudgetGuardRail implements UserInputGuardRail {
    private final CostTrackingListener costListener;
    private final double maxCost;

    public BudgetGuardRail(CostTrackingListener costListener, double maxCost) {
        this.costListener = costListener;
        this.maxCost = maxCost;
    }

    @Override
    public ValidationResult validate(String input) {
        String processId = getCurrentProcessId(); // from context
        if (costListener.getCost(processId) > maxCost) {
            return ValidationResult.failure(ValidationSeverity.CRITICAL,
                "Budget exceeded: $" + costListener.getCost(processId));
        }
        return ValidationResult.success();
    }
}
```

Register as a bean:

```java
@Bean
public BudgetGuardRail budgetGuardRail(CostTrackingListener costListener) {
    return new BudgetGuardRail(costListener, 10.0); // $10 limit
}
```

### Early Termination Policy

For a hard cap on the agent process itself:

```java
var options = ProcessOptions.builder()
    .withEarlyTerminationPolicy(new EarlyTerminationPolicy() {
        @Override
        public boolean shouldTerminate(AgentProcess process) {
            return costListener.getCost(process.getId()) > 1.0; // $1 cap
        }
    })
    .build();
```

> **Important:** Cost events fire **after** the call completes — they cannot stop the call that just ran. Use a listener to accumulate costs, then a guardrail to block the **next** call. For hard process-level caps, use `EarlyTerminationPolicy`.

See `reference/cost-tracking.md` for the full budget guardrail pattern and EarlyTerminationPolicy.

## Configuration

Key properties in `application.yml`:

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

## When NOT to Use Embabel

Embabel is powerful but not the right tool for every situation. Consider these alternatives:

| Scenario | Better Alternative | Why |
|----------|-------------------|-----|
| Simple API endpoints with no agent logic | Spring Boot alone | Embabel adds overhead you don't need |
| Pure data processing pipelines | Spring Batch, Apache Spark | No LLM interaction needed |
| Real-time streaming apps | WebFlux, gRPC | Embabel is agent-focused, not streaming-focused |
| Frontend web applications | React, Angular, Vue | Embabel is backend-only |
| Simple chatbot with fixed flow | State machine library | No need for LLM-driven planning |
| High-throughput microservices | Standard Spring Boot | Embabel's planning loop adds latency |
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

Embabel provides several mechanisms for handling failures gracefully:

### Retry on LLM Failure

`createObject()` automatically retries on failure. For custom retry logic:

```java
try {
    var result = context.ai().withDefaultLlm()
        .creating(Analysis.class)
        .fromPrompt("Analyze this data");
} catch (LlmInvocationException e) {
    // Retry with a different model or fallback
    var fallback = context.ai().withLlm(LlmOptions.withModel("gpt-4o-mini"))
        .creating(FallbackAnalysis.class)
        .fromPrompt("Analyze this data (fallback)");
}
```

### createObjectIfPossible

For non-critical LLM calls where null is acceptable:

```java
var result = context.ai().withDefaultLlm()
    .createObjectIfPossible(Analysis.class)
    .fromPrompt("Analyze this data");
// Returns null if the LLM fails, instead of throwing
```

### Guardrail Violations

Guardrails with `CRITICAL` severity throw `GuardRailViolationException`:

```java
try {
    context.ai().withDefaultLlm()
        .withGuardRails(new PiiGuardRail())
        .creating(Analysis.class)
        .fromPrompt("Analyze this data");
} catch (GuardRailViolationException e) {
    // Handle the violation — block, log, or escalate
    log.warn("Guardrail violation: {}", e.getMessage());
}
```

### EarlyTerminationPolicy

For hard process-level caps, see the **Cost Tracking** section for the `EarlyTerminationPolicy` pattern.

### Process State Monitoring

Monitor process state changes for long-running agents:

```java
AgentProcess process = agentPlatform.createAgentProcess(myAgent, options, bindings);
agentPlatform.start(process);

// Poll for completion
while (true) {
    var state = process.getState();
    if (state == ProcessState.COMPLETED) {
        break;
    } else if (state == ProcessState.FAILED) {
        // Handle failure
        break;
    }
    Thread.sleep(1000);
}
```

## Troubleshooting

### Agent Not Discovered

**Symptom:** Agent doesn't appear in the platform's agent list.

**Fix:**
1. Ensure the class has `@Agent`, `@Agentic`, or is registered as an `@Bean` of type `Agent`
2. Check that `embabel.agent.platform.scanning.annotation` is `true` (default)
3. Verify the class is in a Spring component scan path

### Planner Can't Find a Plan

**Symptom:** Agent starts but immediately completes with no actions executed.

**Fix:**
1. Check that the input type matches an action's parameter type
2. Verify that at least one action has `@AchievesGoal`
3. Check that action postconditions form a valid chain to the goal
4. Enable debug logging: `embabel.agent.platform.logging.level: DEBUG`
5. Use `ProcessOptions.builder().withVerbose(true).build()`

### Blackboard Type Not Found

**Symptom:** `NoSuchElementException` when accessing blackboard by type.

**Fix:**
1. Ensure the type was added by a previous action
2. Check that the type isn't hidden (e.g., by a state transition)
3. Verify the type is nullable if it might not be present

### State Transitions Not Working

**Symptom:** Agent stays in the same state or transitions incorrectly.

**Fix:**
1. Ensure state classes are annotated with `@State` (or inherit from a `@State`-annotated type)
2. Use `clearBlackboard = true` for looping states
3. Check that state classes are static nested classes (Java) or top-level classes (Kotlin)
4. Verify that the action returns an instance of the correct state type

### LLM Calls Failing

**Symptom:** `LlmInvocationException` or timeout.

**Fix:**
1. Check API key is set (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.)
2. Verify the model name is valid for the provider
3. Increase timeouts: `embabel.agent.platform.http-client.read-timeout: 2m`
4. Check network connectivity to the provider
5. Enable debug logging to see the full prompt

### High Costs

**Symptom:** Unexpectedly high LLM costs.

**Fix:**
1. Set `toolloop.max-iterations` to a reasonable limit (default 20)
2. Use cheaper models for non-critical actions (`gpt-4o-mini`)
3. Enable cost tracking with a `BudgetGuardRail`
4. Use `EarlyTerminationPolicy` for hard caps
5. Enable Anthropic prompt caching for repeated content

### Debugging Tips

- **Enable debug logging** — `embabel.agent.platform.logging.level: DEBUG` shows planning decisions
- **Use personality logging** — `embabel.agent.logging.personality: starwars` makes logs readable
- **Check process state** — `process.getState()` tells you where the agent is stuck
- **Use `.withId()`** — Tags every LLM call for easy identification in logs and tests
- **Monitor tool loop iterations** — If the agent is looping, check `toolloop.max-iterations`

## Common Pitfalls

1. **Forgetting `@Agent` or `@Agentic` on the class** — The agent won't be discovered by the platform. Both annotations register beans, but `@Agentic` is auto-discovered via component scanning.
2. **Not providing `OperationContext`** — Actions need it to access the AI and blackboard. Every `@Action` method must include it as a parameter.
3. **Confusing execution modes** — SIMPLE vs CONCURRENT (process execution) vs CLOSED vs OPEN (autonomy). These operate at different levels: execution mode controls how actions run; autonomy controls how the LLM selects agents.
4. **Not using `@AchievesGoal`** — Without it, the planner can't determine goal satisfaction. Every agent needs at least one action marked with `@AchievesGoal` to define what constitutes completion.
5. **Ignoring tool loop iterations** — Default is 20; increase for complex multi-step agents. Set via `embabel.agent.platform.toolloop.max-iterations`.
6. **Not setting model per-action** — Using the default model for everything wastes money or sacrifices quality. Use `LlmOptions.withModel()` for each action.
7. **Forgetting `.withId()` on LLM calls** — Makes test verification harder and debugging opaque. Always use `.withId("action-name")` for traceability.
8. **Using non-static inner classes for @State** — Causes serialization/persistence issues. Use Java records (implicitly static) or Kotlin top-level classes.
9. **Not using `clearBlackboard = true` for looping states** — Planner sees output type already exists and skips the action. Essential for revise-and-review loops.
10. **Allowing LLMs to call sensitive methods** — Always gate with `@Tool`/`@LlmTool`; unannotated methods stay hidden.
11. **Missing `@Export(remote=true)` on MCP agents** — Agents won't be visible to MCP clients like Claude Desktop.
12. **Circular type dependencies** — Check that action input/output types form a valid plan path. Use `ProcessOptions.verbosity` to debug planning.
13. **Custom conditions without postconditions** — If an action sets a custom condition, mark it in `post`; if another action depends on it, mark it in `pre`.

## Quick Reference: Common Patterns

### Simple LLM Call
```java
context.ai().withDefaultLlm()
    .withId("action-id")
    .creating(Result.class)
    .fromPrompt("Prompt text");
```

### LLM with Custom Model and Temperature
```java
context.ai().withLlm(LlmOptions.withModel("gpt-4o").withTemperature(0.7))
    .withId("action-id")
    .creating(Result.class)
    .fromPrompt("Prompt text");
```

### LLM with Tool
```java
context.ai().withDefaultLlm()
    .withTool(myTool)
    .creating(Result.class)
    .fromPrompt("Prompt text");
```

### LLM with Domain Object Tool
```java
context.ai().withDefaultLlm()
    .withToolObject(domainObject)
    .creating(Result.class)
    .fromPrompt("Prompt text");
```

### LLM with Few-Shot Example
```java
context.ai().withDefaultLlm()
    .withId("action-id")
    .withExample("Example input", new ExampleOutput("result"))
    .creating(Result.class)
    .fromPrompt("Prompt text");
```

### LLM with Persona
```java
var persona = new Persona("Expert", "You are an expert.", "Help users.", "Professional");
context.ai().withDefaultLlm()
    .withPromptContributor(persona)
    .creating(Result.class)
    .fromPrompt("Prompt text");
```

### Concurrent Execution
```java
// Set in application.yml or ProcessOptions
// embabel.agent.platform.process-type: CONCURRENT
```

### Utility AI Planning
```java
@EmbabelComponent
public class Actions {
    @Action(cost = 0.1, value = 0.8)
    public Output highValueAction(Input input) { ... }
}
```

### State Machine
```java
@State
public sealed interface Status permits Active, Archived {}

@Action
public Status process(Input input) {
    return input.isExpired() ? new Archived(input) : new Active(input);
}
```

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
| `reference/annotations.md` | Full @Action attribute reference, @Cost, @SecureAgentTool, @Provided, SomeOf, trigger |
| `reference/domain-objects.md` | DICE patterns, @Tool rules, domain objects in actions, best practices |
| `reference/llm-integration.md` | LlmOptions, PromptRunner methods, custom LLM providers, Anthropic caching |

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

## Production Deployment

### Docker

The Embabel Spring Boot application can be containerized with a multi-stage Dockerfile:

```dockerfile
# Build stage
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Build and run:
```bash
docker build -t my-agent:latest .
docker run -e OPENAI_API_KEY=$OPENAI_API_KEY -p 8080:8080 my-agent:latest
```

### Kubernetes

Minimal deployment manifest:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-agent
spec:
  replicas: 2
  selector:
    matchLabels:
      app: my-agent
  template:
    metadata:
      labels:
        app: my-agent
    spec:
      containers:
      - name: my-agent
        image: my-agent:latest
        ports:
        - containerPort: 8080
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-keys
              key: openai
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

### Health Checks

Embabel exposes standard Spring Boot actuator endpoints:

- `GET /actuator/health` — Health check
- `GET /actuator/info` — Application info

Add `spring-boot-starter-actuator` for production health monitoring:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info
```

### Monitoring

- **Cost tracking** — Set up a `CostTrackingListener` to monitor LLM spend in production
- **Process monitoring** — Use REST endpoints to track running processes
- **Logging** — Configure `embabel.agent.platform.logging.level` for production-appropriate verbosity
- **SSE events** — Subscribe to `/events/process/{processId}` for real-time process monitoring

### Security

- **API keys** — Never hardcode API keys; use environment variables or a secrets manager
- **Guardrails** — Always enable guardrails in production to filter input/output
- **Cost limits** — Set `EarlyTerminationPolicy` to prevent runaway costs
- **MCP security** — Use `@SecureAgentTool` with SpEL expressions for access control
- **HTTPS** — Always use HTTPS in production for REST and SSE endpoints

## Guide Server

The Guide server is a companion application that exposes Embabel documentation, blogs, and API information via chat, Spring Shell, and MCP.

### Quick Start

```bash
export OPENAI_API_KEY=your_key_here
./mvnw spring-boot:run
```

Server starts on port `1337`.

### Loading Data

```bash
# Load docs into RAG store
curl -X POST http://localhost:1337/api/v1/data/load-references

# Check stats
curl http://localhost:1337/api/v1/data/stats
```

RAG storage uses Neo4j (default) or FalkorDB/Memgraph as backends.

### MCP Server

Exposes MCP tools at `http://localhost:1337/sse`.

**Verify:**
```bash
curl -i --max-time 3 http://localhost:1337/sse
# Expect: Content-Type: text/event-stream + event:endpoint
```

**MCP Inspector:**
```bash
npx @modelcontextprotocol/inspector
# Connect to http://localhost:1337/sse
```

**Claude Desktop config** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "embabel-dev": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:1337/sse", "--transport", "sse-only"]
    }
  }
}
```

### WebSocket Chat

**Endpoint:** `ws://localhost:1337/ws` (STOMP over WebSocket with SockJS fallback)

| Direction | Destination | Purpose |
|-----------|-------------|---------|
| Subscribe | `/user/queue/messages` | Chat responses |
| Subscribe | `/user/queue/status` | Typing/status updates |
| Publish | `/app/chat.sendToJesse` | Send message to bot |

See `reference/guide-server.md` for full details: Docker Compose, graph database backends, MCP client configs, REST API, environment variables.

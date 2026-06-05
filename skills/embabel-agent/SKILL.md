---
name: embabel-agent
description: Author, configure, test, and debug agentic AI applications on the JVM using the Embabel framework. Use this skill whenever the user wants to build agents, plan workflows, integrate LLMs with domain models, set up GOAP or Utility AI planning, configure execution modes (Focused/Closed/Open), write agent tests, or work with Embabel tools, skills, or planners. Trigger on mentions of Embabel, @Agent, @Action, @Goal, GOAP, Utility AI, embabel-agent, JVM agents, agentic flows on the JVM, or when building Spring Boot applications with AI agent capabilities.
---

# Embabel Agent Framework

This skill helps you build agentic AI applications on the JVM using the **Embabel framework** — a framework for authoring agentic flows that seamlessly mix LLM-prompted interactions with code and domain models. Created by Rod Johnson (creator of Spring), it supports intelligent path-finding towards goals using non-LLM AI planning algorithms.

## Core Concepts

Every Embabel agent is built from these building blocks:

- **Actions** (`@Action`) — Steps the agent takes to make progress. Each action is a method that transforms inputs into outputs.
- **Goals** (`@AchievesGoal`) — What the agent is trying to achieve. Goals define success conditions.
- **Conditions** (`@Condition`) — Predicates evaluated before actions or to determine goal achievement. Reassessed after every action.
- **Domain Model** — The objects underpinning the flow, carrying both data and behavior.
- **Plan** — A dynamically generated sequence of actions (not hand-coded). The planner recomputes the plan after each action, forming an OODA loop.

> **Key insight:** Application developers rarely deal with these concepts directly. Most pre/post conditions are inferred from data flow in code.

## Agent Authoring Patterns

### Annotation-Based Model (Java/Kotlin)

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
            .createObject("Write a story about: " + input.getContent(), Story.class);
    }

    @AchievesGoal(description = "Review and improve the story")
    @Action
    public ReviewedStory reviewStory(Story story, OperationContext context) {
        var reviewer = LlmOptions.withModel(OpenAiModels.GPT_4O_MINI)
            .withTemperature(0.2)
            .withPersona("You are a careful editor");
        return context.ai()
            .withLlm(reviewer)
            .createObject("Review this story and suggest improvements: " + story.text(),
                ReviewedStory.class);
    }
}
```

### Kotlin DSL Model

```kotlin
val agent = Agent(
    name = "my-agent",
    goals = setOf(
        Goal(name = "produce-report", description = "Generate a report")
    )
) {
    action {
        // action definition
    }
}
```

## Planning Algorithms

Choose a planner based on your use case:

| Planner | Best For | Behavior |
|---------|----------|----------|
| **GOAP** (default) | Business processes with defined outputs | Goal-oriented, deterministic planning using A* search. Finds optimal action sequences. |
| **Utility AI** | Exploration, event-driven systems, chatbots | Selects highest net-value action (`value - cost`) at each step. |
| **Hybrid** | Reducer pipelines | Utility picking + goal-satisfaction termination. |
| **Supervisor** | Flexible multi-step workflows | LLM-orchestrated, non-deterministic composition. |

Set via `@Agent(planner = PlannerType.XXX)` or `ProcessOptions(plannerType = PlannerType.XXX)`.

### Utility AI: Cost, Value, and States

```java
@EmbabelComponent
public class IssueActions {

    @Action(cost = 0.1, value = 0.8, outputBinding = "ghIssue")
    public GHIssue saveNewIssue(GHIssue ghIssue, OperationContext context) { ... }

    @Action(pre = {"spel:newEntity.newEntities.?[#this instanceof T(com.embabel.shepherd.domain.Issue)].size() > 0"})
    public IssueAssessment reactToNewIssue(GHIssue ghIssue, NewEntity<?> newEntity, Ai ai) { ... }
}
```

Use `@State` sealed interfaces to model state transitions:

```java
@Agent(description = "Triage support tickets", planner = PlannerType.UTILITY)
public class TicketTriageAgent {

    @State
    public sealed interface TicketCategory permits CriticalTicket, BugTicket, GeneralTicket {}

    @Action
    public TicketCategory triageTicket(Ticket ticket) {
        if (ticket.description().toLowerCase().contains("down")) {
            return new CriticalTicket(ticket);
        }
        // ...
    }

    @State
    public record CriticalTicket(Ticket ticket) implements TicketCategory {
        @AchievesGoal(description = "Handle critical ticket")
        @Action
        public ResolvedTicket handleCritical() { ... }
    }
}
```

## Execution Modes

| Mode | Behavior | When to Use |
|------|----------|-------------|
| **Focused** | User code calls a specific agent with specific input | Code-driven flows, event-triggered agents |
| **Closed** | Platform selects an agent based on intent classification | When you have multiple agents and want the LLM to pick the right one |
| **Open** | Platform uses all available goals/actions to achieve user intent | Maximum flexibility, least deterministic. The agent assembles itself from available resources. |

```java
// Focused
AgentProcess process = agentPlatform.createAgentProcess(myAgent, options, bindings);

// Closed (LLM picks agent)
autonomy.chooseAndRunAgent(userIntent, ProcessOptions.DEFAULT);

// Open (LLM picks goal + assembles agent)
autonomy.chooseAndAccomplishGoal(options, approver, agentPlatform, bindings, selectionOptions);
```

## Tools and MCP Integration

### @LlmTool: Expose JVM Methods to LLMs

```java
public class MathTools {
    @LlmTool(description = "add two numbers")
    public double add(double a, double b) {
        return a + b;
    }
}
```

Tools can be stateful — they often encapsulate domain objects with private state.

### Tool Groups

```java
@Action
public RelevantNews findNews(StarPerson person, OperationContext context) {
    return context.ai().withDefaultLlm()
        .withToolGroup(CoreToolGroups.WEB)
        .createObject(prompt, RelevantNews.class);
}
```

Configure tool groups in `application.yml`:

```yaml
embabel:
  agent:
    platform:
      tools:
        includes:
          weather:
            description: Get weather for location
            provider: Docker
            tools:
              - weather
```

### ToolCallContext

For infrastructure metadata (auth tokens, tenant IDs) that the LLM should never see:

```java
@LlmTool(description = "Look up customer")
public String lookupCustomer(
        @LlmTool.Param(description = "Customer ID") long customerId,
        ToolCallContext context) {
    String tenantId = context.get("tenantId");
    String authToken = context.get("authToken");
    return customerService.lookup(customerId, tenantId, authToken);
}
```

## Skills System

Embabel implements the [Agent Skills](https://agentskills.io/home) specification:

```kotlin
val skills = Skills(name = "my-skills", description = "Skills for my agent")
    .withLocalSkills("/path/to/skills")
    .withGitHubUrl("https://github.com/anthropics/skills/tree/main/skills")
    .withScriptExecutionEngine(dockerEngine)
```

SKILL.md structure:
```
my-skill/
├── SKILL.md        # Required: name, description, instructions
├── scripts/        # Optional: executable scripts (Python, Bash, etc.)
├── references/     # Optional: docs loaded into context as needed
└── assets/         # Optional: files used in output
```

Script execution supports Process (direct) and Docker (sandboxed) engines.

## LLM Integration

### Mixing Models

```java
// Cheap model for simple tasks
var writer = LlmOptions.withModel(OpenAiModels.GPT_4O_MINI)
    .withTemperature(0.8);

// Expensive model for complex reasoning
var reviewer = LlmOptions.withModel(OpenAiModels.GPT_4O)
    .withTemperature(0.2);
```

### Using the Ai Interface

```java
@Component
public record InjectedComponent(Ai ai) {
    public String tellJoke(String topic) {
        return ai.withDefaultLlm().generateText("Tell me a joke about " + topic);
    }

    public Joke createJoke(String topic1, String topic2, String voice) {
        return ai.withLlm(LlmOptions.withDefaultLlm().withTemperature(.8))
            .createObject("Tell me a joke about %s and %s. Voice: %s".formatted(topic1, topic2, voice),
                Joke.class);
    }
}
```

### Local Models

- **Ollama**: Add `embabel-agent-starter-ollama`
- **Docker**: Add `embabel-agent-starter-dockermodels`
- **LMStudio**: Uses OpenAI-compatible client

## Configuration

Key properties in `application.yml`:

```yaml
embabel:
  models:
    default-llm: gpt-4o-mini
    llms:
      cheapest: gpt-4o-mini
      best: gpt-4o
      reasoning: o1-preview
  agent:
    platform:
      name: my-agent-platform
      toolloop:
        max-iterations: 20
        type: default  # or "parallel" for experimental parallel tool execution
```

See `reference/configuration.md` for the full configuration reference.

## Invocation and Runtime

### Programmatic Invocation

```java
// With AgentProcess
AgentProcess process = agentPlatform.createAgentProcess(myAgent, options, bindings);
Object result = agentPlatform.start(process).get();

// With AgentInvocation (simpler)
var invocation = AgentInvocation.create(agentPlatform, TravelPlan.class);
TravelPlan plan = invocation.invoke(travelRequest);

// Async
CompletableFuture<TravelPlan> future = invocation.invokeAsync(travelRequest);
```

### REST Endpoints

Embabel exposes REST endpoints out of the box:
- `GET /api/v1/process/{processId}` — Process status
- `DELETE /api/v1/process/{processId}` — Kill process
- `GET /events/process/{processId}` — SSE stream

## Getting Started

### Setup (Maven)

```xml
<dependency>
    <groupId>com.embabel.agent</groupId>
    <artifactId>embabel-agent-starter</artifactId>
    <version>${embabel-agent.version}</version>
</dependency>
```

Add repositories:
```xml
<repositories>
    <repository>
        <id>embabel-releases</id>
        <url>https://repo.embabel.com/artifactory/libs-release</url>
    </repository>
    <repository>
        <id>embabel-snapshots</id>
        <url>https://repo.embabel.com/artifactory/libs-snapshot</url>
    </repository>
</repositories>
```

### Quick Start Templates

- [Java Template](https://github.com/embabel/java-agent-template) — Clone and customize
- [Kotlin Template](https://github.com/embabel/kotlin-agent-template) — Clone and customize
- [Project Creator](https://github.com/embabel/project-creator) — `uvx --from git+https://github.com/embabel/project-creator.git project-creator`

## Testing

Embabel provides first-class testing support:

- **`FakePromptRunner` / `FakeOperationContext`** — Mock LLM calls, verify prompts and hyperparameters
- **`EmbabelMockitoIntegrationTest`** — Spring Boot integration testing
- **`whenCreateObject()` / `whenGenerateText()`** — Stub LLM responses
- **`verifyCreateObjectMatching()`** — Verify specific interactions

See `reference/testing.md` for detailed testing patterns and examples.

## Reference Files

- `reference/planners.md` — Detailed planner guide (GOAP, Utility AI, Hybrid, Supervisor)
- `reference/testing.md` — Testing patterns and examples

## Common Pitfalls

1. **Forgetting `@Agent` on the class** — The agent won't be discovered by the platform
2. **Not providing `OperationContext`** — Actions need it to access the AI and blackboard
3. **Confusing execution modes** — Focused calls a specific agent; Open assembles one dynamically
4. **Not using `@AchievesGoal`** — Without it, the planner can't determine goal satisfaction
5. **Ignoring tool loop iterations** — Default is 20; increase for complex multi-step agents
6. **Not setting model per-action** — Using the default model for everything wastes money or sacrifices quality

## When to Use This Skill

Use this skill whenever you need to:

- Create a new Embabel agent with `@Agent`, `@Action`, `@Goal`, `@Condition`
- Choose between planning algorithms (GOAP, Utility, Hybrid, Supervisor)
- Configure execution modes (Focused, Closed, Open)
- Set up tools with `@LlmTool` or tool groups
- Write tests for agents using FakePromptRunner or integration testing
- Debug agent behavior (check prompts, tool calls, planning decisions)
- Configure Embabel via `application.yml`
- Integrate Embabel with Spring Boot
- Set up MCP tool integration
- Work with the skills system (loading skills from GitHub/local)

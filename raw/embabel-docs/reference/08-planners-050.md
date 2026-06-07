# Embabel Framework 0.5.0-SNAPSHOT - Planners Reference

Source: https://docs.embabel.com/embabel-agent/guide/0.5.0-SNAPSHOT/reference/planners/

## Planning Strategies

| Planner | Best For | Description |
|---------|----------|-------------|
| **GOAP** (default) | Business processes with defined outputs | Goal-oriented, deterministic planning using A* search |
| **Utility** | Exploration and event-driven systems | Selects the highest-value available action at each step |
| **Hybrid** | Reducer pipelines (gather many context-producing actions, run one synthesizer, stop) | Utility picking + goal-satisfaction termination |
| **Supervisor** | Flexible multi-step workflows | LLM-orchestrated composition (non-deterministic) |

## Utility AI

Selects the action with the highest _net value_ (`value - cost`) from all available actions at each step.

### When to Use
- Event-driven systems (react to incoming events)
- Chatbots (multiple response options)
- Exploration (discover what's possible)

### Using with @EmbabelComponent

```java
@EmbabelComponent
public class IssueActions {

    @Action(outputBinding = "ghIssue")
    public GHIssue saveNewIssue(GHIssue ghIssue, OperationContext context) {
        var existing = communityDataManager.findIssueByGithubId(ghIssue.getId());
        if (existing == null) {
            var issueEntityStatus = communityDataManager.saveAndExpandIssue(ghIssue);
            context.add(issueEntityStatus);
            return ghIssue;
        }
        return null;
    }

    @Action(pre = {"spel:newEntity.newEntities.?[#this instanceof T(com.embabel.shepherd.domain.Issue)].size() > 0"})
    public IssueAssessment reactToNewIssue(GHIssue ghIssue, NewEntity<?> newEntity, Ai ai) {
        return ai.withLlm(properties.getTriageLlm())
            .creating(IssueAssessment.class)
            .fromTemplate("first_issue_response", Map.of("issue", ghIssue));
    }

    @Action(pre = {"spel:issueAssessment.urgency > 0.0"})
    public void heavyHitterIssue(GHIssue issue, IssueAssessment issueAssessment) {
        // Take action on high-urgency issues
    }
}
```

### Action Cost and Value

```java
@Action(cost = 0.1, value = 0.8)  // net value = 0.7
public Output highValueAction(Input input) { ... }
```

### Utility and States Pattern

```java
@Agent(description = "Triage and process support tickets", planner = PlannerType.UTILITY)
public class TicketTriageAgent {

    @State
    public sealed interface TicketCategory permits CriticalTicket, BugTicket, GeneralTicket {}

    @Action
    public TicketCategory triageTicket(Ticket ticket) {
        if (ticket.description().toLowerCase().contains("down")) {
            return new CriticalTicket(ticket);
        } else if (ticket.description().toLowerCase().contains("bug")) {
            return new BugTicket(ticket);
        } else {
            return new GeneralTicket(ticket);
        }
    }

    @State
    public record CriticalTicket(Ticket ticket) implements TicketCategory {
        @AchievesGoal(description = "Handle critical ticket")
        @Action
        public ResolvedTicket handleCritical() { ... }
    }
}
```

### UtilityInvocation: Lightweight Utility Pattern

```java
UtilityInvocation.on(agentPlatform)
    .withScope(AgentScopeBuilder.fromInstances(issueActions, labelActions))
    .run(new GHIssue(issueData));
```

## Hybrid Planner

Combines Utility AI's value-based action picking with goal-satisfaction termination.

### Two-Goal Pattern

```kotlin
val agent = Agent(
    name = "per-signal-triage",
    goals = setOf(
        NIRVANA,  // Keeps iterate-by-netValue picking alive
        Goal(     // The real terminal goal
            name = "attention-candidate-produced",
            ...
        ),
    ),
)

val process = agentPlatform.runAgentFrom(
    agent = agent,
    processOptions = ProcessOptions(plannerType = PlannerType.HYBRID),
    bindings = signalBindings,
)
```

## Supervisor Planner

Uses an LLM to orchestrate actions dynamically. Non-deterministic.

### When to Use
- Action ordering is context-dependent
- You want an LLM to synthesize across multiple sources
- Non-determinism is acceptable

### Using Supervisor

```java
@Agent(planner = PlannerType.SUPERVISOR, description = "Market research report generator")
public class MarketResearchAgent {

    @Action(description = "Gather market data including revenues and market share")
    public MarketData gatherMarketData(MarketDataRequest request, Ai ai) { ... }

    @Action(description = "Analyze competitors: strengths and positioning")
    public CompetitorAnalysis analyzeCompetitors(CompetitorAnalysisRequest request, Ai ai) { ... }

    @AchievesGoal(description = "Compile all information into a final report")
    @Action(description = "Compile the final report")
    public FinalReport compileReport(ReportRequest request, Ai ai) { ... }
}
```

### Type-Informed Approach

The LLM sees type schemas and decides what to call based on semantic understanding.
Actions return typed outputs that are validated, and results are stored on the typed blackboard.

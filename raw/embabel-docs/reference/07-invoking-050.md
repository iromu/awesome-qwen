# Embabel Framework 0.5.0-SNAPSHOT - Invoking Agents

Source: https://docs.embabel.com/embabel-agent/guide/0.5.0-SNAPSHOT/reference/invoking/

## Programmatic Invocation

### Using AgentProcess

```java
// Create an agent process with bindings
AgentProcess agentProcess = agentPlatform.createAgentProcess(
    myAgent,
    new ProcessOptions(),
    Map.of("input", userRequest)
);

// Start the process and wait for completion
Object result = agentPlatform.start(agentProcess).get();

// Or run synchronously
AgentProcess completedProcess = agentProcess.run();
MyResultType result = completedProcess.last(MyResultType.class);
```

### Using AgentInvocation

```java
// Simple invocation with explicit result type
var invocation = AgentInvocation.create(agentPlatform, TravelPlan.class);
TravelPlan plan = invocation.invoke(travelRequest);

// With custom process options
var processOptions = new ProcessOptions()
    .withVerbosity(new Verbosity()
        .withShowPrompts(true)
        .withShowLlmResponses(true)
        .withDebug(true));
var invocation = AgentInvocation.builder(agentPlatform)
    .options(processOptions)
    .build(TravelPlan.class);
TravelPlan plan = invocation.invoke(travelRequest);

// Asynchronous invocation
CompletableFuture<TravelPlan> future = invocation.invokeAsync(travelRequest);
future.thenAccept(plan -> logger.info("Travel plan generated: {}", plan));
```

## Autonomy - Dynamic Agent/Goal Selection

### Closed Mode (LLM selects agent)

```java
@Service
public class IntentHandler {
    private final Autonomy autonomy;

    public AgentProcessExecution handleUserIntent(String userIntent) {
        return autonomy.chooseAndRunAgent(userIntent, ProcessOptions.DEFAULT);
    }
}
```

### Open Mode (LLM selects goal, assembles agent)

```java
return autonomy.chooseAndAccomplishGoal(
    ProcessOptions.DEFAULT,
    GoalChoiceApprover.APPROVE_ALL,
    agentPlatform,
    Map.of("userInput", new UserInput(userIntent)),
    new GoalSelectionOptions()
);
```

## REST Endpoints

- `GET /api/v1/process/{processId}` - Process status
- `DELETE /api/v1/process/{processId}` - Kill process
- `GET /events/process/{processId}` - SSE stream

## Webhook Integration

```java
@PostMapping("/jira/issue-created")
public ResponseEntity<Map<String, String>> onJiraIssueCreated(
        @RequestBody JiraWebhookPayload payload) {
    Agent agent = agentPlatform.agents().stream()
        .filter(a -> a.getName().contains("JiraIssue"))
        .findFirst().orElseThrow();

    JiraIssue issue = new JiraIssue(payload.getIssue().getKey(), ...);
    AgentProcess process = agentPlatform.createAgentProcessFrom(agent, ProcessOptions.DEFAULT, issue);
    agentPlatform.start(process);

    return ResponseEntity.accepted().body(Map.of(
        "processId", process.getId(),
        "statusUrl", "/api/v1/process/" + process.getId()
    ));
}
```

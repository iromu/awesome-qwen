# Embabel Framework 0.5.0-SNAPSHOT - Testing Reference

Source: https://docs.embabel.com/embabel-agent/guide/0.5.0-SNAPSHOT/reference/testing/

## Unit Testing

Use `FakePromptRunner` and `FakeOperationContext` to mock LLM interactions while verifying prompts, hyperparameters, and business logic.

### Testing Prompts and Hyperparameters

```java
class WriteAndReviewAgentTest {

    @Test
    void testCraftStory() {
        var context = FakeOperationContext.create();
        var promptRunner = (FakePromptRunner) context.promptRunner();
        context.expectResponse(new Story("Once upon a time..."));

        var agent = new WriteAndReviewAgent(200, 400);
        agent.craftStory(
            new UserInput("Tell me a story about a brave knight", Instant.now()),
            context
        );

        String prompt = promptRunner.getLlmInvocations().getFirst().getPrompt();
        assertTrue(prompt.contains("knight"));

        var temp = promptRunner.getLlmInvocations().getFirst()
            .getInteraction().getLlm().getTemperature();
        assertEquals(0.9, temp, 0.01);
    }
}
```

### Testing with Mockito/mockk

```java
@Test
void testTellJokeAbout() {
    var mockAi = Mockito.mock(Ai.class);
    var mockPromptRunner = Mockito.mock(PromptRunner.class);

    var prompt = "Tell me a joke about frogs";
    var terribleJoke = "Why don't frogs ever pay for drinks?";

    when(mockAi.withDefaultLlm()).thenReturn(mockPromptRunner);
    when(mockPromptRunner.generateText(prompt)).thenReturn(terribleJoke);

    var component = new InjectedComponent(mockAi);
    var joke = component.tellJokeAbout("frogs");

    assertEquals(terribleJoke, joke);
    verify(mockAi).withDefaultLlm();
    verify(mockPromptRunner).generateText(prompt);
}
```

### Testing Fluent API: withId() and creating()

```java
@Test
void shouldSetInteractionIdCorrectly() {
    var context = FakeOperationContext.create();
    var expectedIntent = new UserIntent("command", "Change channel names");
    context.expectResponse(expectedIntent);

    var result = context.ai()
            .withId("classify-intent")
            .creating(UserIntent.class)
            .fromPrompt("Classify the user's intent");

    assertEquals(expectedIntent, result);

    // Verify the interaction ID was set correctly
    var interaction = context.getLlmInvocations().getFirst().getInteraction();
    assertEquals("classify-intent", interaction.getId().getValue());
}
```

### Testing with Examples

```java
@Test
void shouldIncludeExamplesInPrompt() {
    var context = FakeOperationContext.create();
    var expectedPlan = new ChannelEditPlan(1, "Lead Vox");
    context.expectResponse(expectedPlan);

    var result = context.ai()
            .withLlm(llmSelectionService.selectOptimalLlm())
            .withId("analyze-edit-request")
            .creating(ChannelEditPlan.class)
            .withExample("Rename channel 1", new ChannelEditPlan(1, "Bass"))
            .withExample("Rename channel 2", new ChannelEditPlan(2, "Drums"))
            .fromPrompt("Analyze the edit request");

    assertEquals(expectedPlan, result);

    // Verify examples were added as prompt contributors
    var promptContributors = context.getLlmInvocations().getFirst()
            .getInteraction().getPromptContributors();
    assertTrue(promptContributors.size() >= 2);
}
```

### Using CreationExample for Reusable Examples

```java
var example = new CreationExample<>(
    "Rename channel example",
    new ChannelEditPlan(2, "Rhythm")
);

var result = context.ai()
        .withDefaultLlm()
        .creating(ChannelEditPlan.class)
        .withExample(example)
        .fromPrompt("Analyze the edit request");
```

### Testing Multiple LLM Interactions

```java
@Test
void shouldHandleMultipleLlmInteractions() {
    var input = new UserInput("Write about space exploration");
    var story = new Story("The astronaut gazed at Earth...");
    var review = new ReviewedStory("Compelling narrative with vivid imagery.");

    context.expectResponse(story);
    context.expectResponse(review);

    var writtenStory = agent.writeStory(input, context);
    var reviewedStory = agent.reviewStory(writtenStory, context);

    assertEquals(story, writtenStory);
    assertEquals(review, reviewedStory);

    // Verify both LLM calls were made
    var invocations = context.getLlmInvocations();
    assertEquals(2, invocations.size());
}
```

## Integration Testing

Use `EmbabelMockitoIntegrationTest` for full workflow testing under Spring Boot.

```java
class StoryWriterIntegrationTest extends EmbabelMockitoIntegrationTest {

    @Test
    void shouldExecuteCompleteWorkflow() {
        var input = new UserInput("Write about artificial intelligence");

        var story = new Story("AI will transform our world...");
        var reviewedStory = new ReviewedStory(story, "Excellent.", Personas.REVIEWER);

        whenCreateObject(contains("Craft a short story"), Story.class)
                .thenReturn(story);

        whenGenerateText(contains("You will be given a short story to review"))
                .thenReturn(reviewedStory.review());

        var invocation = AgentInvocation.create(agentPlatform, ReviewedStory.class);
        var result = invocation.invoke(input);

        assertNotNull(result);
        verifyCreateObjectMatching(
            prompt -> prompt.contains("Craft a short story"),
            Story.class,
            llm -> llm.getLlm().getTemperature() == 0.9
        );
        verifyNoMoreInteractions();
    }
}
```

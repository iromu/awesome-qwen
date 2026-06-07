# Embabel Framework 0.5.0-SNAPSHOT - Chatbots Reference

Source: https://docs.embabel.com/embabel-agent/guide/0.5.0-SNAPSHOT/reference/chatbots/

## Core Concepts

### Long-Lived AgentProcess
An Embabel chatbot is backed by a **long-lived `AgentProcess`** that pauses between user messages.

### Utility AI for Chatbots
**Utility AI is often the best approach for chatbots.** Instead of defining a fixed flow, define multiple actions with costs, and the planner selects the highest-value action.

### Goals in Chatbots
Typically, chatbot agents **do not need a goal** - the process waits for user messages indefinitely.

## Key Interfaces

### Chatbot
```java
public interface Chatbot {
    ChatSession createSession(User user, OutputChannel outputChannel,
        String contextId, String conversationId);
    ChatSession findSession(String conversationId);
}
```

### ChatSession
```java
public interface ChatSession {
    OutputChannel getOutputChannel();
    User getUser();
    Conversation getConversation();
    String getProcessId();
    void onUserMessage(UserMessage userMessage);
    boolean isFinished();
}
```

### Conversation
```java
public interface Conversation extends StableIdentified, AssetView {
    List<Message> getMessages();
    AssetTracker getAssetTracker();
    List<Asset> getAssets();
    Message addMessage(Message message);
    UserMessage lastMessageIfBeFromUser();
}
```

## Building a Chatbot

### Step 1: Create Action Methods
```java
@EmbabelComponent
public class ChatActions {

    private final ToolishRag toolishRag;

    public ChatActions(SearchOperations searchOperations) {
        this.toolishRag = new ToolishRag(
            "sources", "Sources for answering user questions", searchOperations
        );
    }

    @Action(canRerun = true, trigger = UserMessage.class)
    void respond(Conversation conversation, ActionContext context) {
        var assistantMessage = context.ai()
            .withLlm(properties.chatLlm())
            .withReference(toolishRag)
            .rendering("ragbot")
            .respondWithSystemPrompt(conversation, Map.of("properties", properties));
        context.sendMessage(conversation.addMessage(assistantMessage));
    }
}
```

### Step 2: Configure the Chatbot Bean
```java
@Configuration
class ChatConfiguration {
    @Bean
    Chatbot chatbot(AgentPlatform agentPlatform) {
        return AgentProcessChatbot.utilityFromPlatform(agentPlatform);
    }
}
```

### Step 3: Use the Chatbot
```java
// New session
ChatSession session = chatbot.createSession(user, outputChannel, null, null);

// Session with context
ChatSession withContext = chatbot.createSession(user, outputChannel, "user-workspace-123", null);

// Restore existing conversation
ChatSession restored = chatbot.createSession(user, outputChannel, null, savedConversationId);

session.onUserMessage(new UserMessage("What does this document say about taxes?"));
```

## Dynamic Cost Methods
```java
@Cost
double dynamic(Blackboard bb) {
    return bb.getObjects().size() > 5 ? 100 : 10;
}

@Action(canRerun = true, trigger = UserMessage.class, costMethod = "dynamic")
void respond(Conversation conversation, ActionContext context) { ... }
```

## Prompt Templates (Jinja)
```java
var assistantMessage = context.ai()
    .withLlm(properties.chatLlm())
    .withReference(toolishRag)
    .rendering("ragbot")  // Loads prompts/ragbot.jinja
    .respondWithSystemPrompt(conversation, Map.of("properties", properties));
```

## Conversation Storage
```java
@Configuration
class ChatConfiguration {
    @Bean
    Chatbot chatbot(AgentPlatform agentPlatform,
                    ConversationFactoryProvider conversationFactoryProvider) {
        var factory = conversationFactoryProvider
            .getFactory(ConversationStoreType.STORED);
        return new AgentProcessChatbot(agentPlatform, user -> createAgent(agentPlatform), factory);
    }
}
```

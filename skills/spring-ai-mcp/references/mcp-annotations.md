# MCP Annotations Reference

## @McpTool

Mark a method as an MCP tool with automatic JSON schema generation.

### Attributes

| Attribute | Default | Description |
|-----------|---------|-------------|
| `name` | method name | Tool identifier |
| `description` | method name | Human-readable description |
| `title` | `""` | Intended for UI/end-user contexts |
| `generateOutputSchema` | `false` | Auto-generate JSON output schema for non-primitive returns |
| `annotations` | `@McpAnnotations(...)` | Hints for clients |

### Tool Annotations (Hints)

| Hint | Default | Description |
|------|---------|-------------|
| `title` | `""` | Human-readable title |
| `readOnlyHint` | `false` | Tool does not modify environment |
| `destructiveHint` | `true` | Tool may perform destructive updates |
| `idempotentHint` | `false` | Same args = same effect |
| `openWorldHint` | `true` | Tool may interact with external entities |

### Example

```java
@McpTool(name = "calculate-area", description = "Calculate rectangle area",
         generateOutputSchema = true,
         annotations = @McpTool.McpAnnotations(
             title = "Rectangle Area Calculator",
             readOnlyHint = true, destructiveHint = false, idempotentHint = true))
public AreaResult calculateRectangleArea(
        @McpToolParam(description = "Width", required = true) double width,
        @McpToolParam(description = "Height", required = true) double height) {
    return new AreaResult(width * height, "square units");
}
```

### With Request Context

```java
@McpTool(name = "process-data", description = "Process data with context")
public String processData(McpSyncRequestContext context,
        @McpToolParam(description = "Data", required = true) String data) {
    context.info("Processing: " + data);
    context.progress(p -> p.progress(0.5).total(1.0).message("Processing..."));
    return "Processed: " + data.toUpperCase();
}
```

### Dynamic Schema

```java
@McpTool(name = "flexible-tool", description = "Process dynamic schema")
public CallToolResult processDynamic(CallToolRequest request) {
    Map<String, Object> args = request.arguments();
    return CallToolResult.builder()
        .addTextContent("Processed " + args.size() + " args")
        .build();
}
```

## @McpResource

Provide access to resources via URI templates.

### Attributes

| Attribute | Default | Description |
|-----------|---------|-------------|
| `uri` | `""` | URI or URI template with `{varName}` |
| `name` | `""` | Programmatic identifier |
| `title` | `""` | Human-readable name |
| `description` | `""` | Resource description |
| `mimeType` | `"text/plain"` | MIME type |

### Example

```java
@McpResource(uri = "config://{key}", name = "Configuration", description = "App config")
public String getConfig(String key) {
    return configData.get(key);
}

@McpResource(uri = "user-profile://{username}", name = "User Profile")
public ReadResourceResult getUserProfile(String username) {
    String profileData = loadUserProfile(username);
    return ReadResourceResult.builder(List.of(
        new TextResourceContents("user-profile://" + username, "application/json", profileData)
    )).build();
}
```

## @McpPrompt

Generate prompt messages for AI interactions.

### Attributes

| Attribute | Default | Description |
|-----------|---------|-------------|
| `name` | `""` | Unique identifier |
| `title` | `""` | Human-readable name |
| `description` | `""` | Description |

### Example

```java
@McpPrompt(name = "greeting", description = "Generate a greeting")
public GetPromptResult greeting(
        @McpArg(name = "name", description = "User's name", required = true) String name) {
    String message = "Hello, " + name + "! How can I help?";
    return GetPromptResult.builder(List.of(
        new PromptMessage(Role.ASSISTANT, TextContent.builder(message).build())
    )).description("Greeting").build();
}
```

## @McpComplete

Provide auto-completion for prompts and resource URIs.

### Example

```java
@McpComplete(prompt = "city-search")
public List<String> completeCityName(String prefix) {
    return cities.stream()
        .filter(city -> city.toLowerCase().startsWith(prefix.toLowerCase()))
        .limit(10)
        .toList();
}

@McpComplete(uri = "config://{key}")
public List<String> completeConfigKey(String prefix) {
    return configKeys.stream()
        .filter(key -> key.startsWith(prefix))
        .limit(10)
        .toList();
}
```

## Client Annotations

### @McpLogging

Handle logging notifications from MCP servers.

```java
@McpLogging(clients = "my-server")
public void handleLogging(LoggingMessageNotification notification) {
    System.out.println(notification.level() + " - " + notification.data());
}
```

### @McpSampling

Handle LLM sampling requests from MCP servers.

```java
@McpSampling(clients = "llm-server")
public CreateMessageResult handleSampling(CreateMessageRequest request) {
    String response = generateLLMResponse(request);
    return CreateMessageResult.builder(Role.ASSISTANT, response, "gpt-4").build();
}
```

### @McpElicitation

Handle user elicitation requests from MCP servers. Uses the builder pattern
with `Action.ACCEPT` or `Action.DECLINE`.

```java
@McpElicitation(clients = "interactive-server")
public ElicitResult handleElicitation(ElicitRequest request) {
    Map<String, Object> data = presentFormToUser(request.requestedSchema());
    if (data != null) {
        return ElicitResult.builder()
            .action(Action.ACCEPT)
            .message("User accepted")
            .requestedSchema(data)
            .build();
    }
    return ElicitResult.builder()
        .action(Action.DECLINE)
        .message("User declined")
        .build();
}
```

### @McpProgress

Handle progress notifications from MCP servers. The `ProgressNotification` type
provides `progress()` (0.0–1.0) and `message()` fields.

```java
@McpProgress(clients = "my-server")
public void handleProgress(ProgressNotification notification) {
    System.out.println(String.format("%.2f%% - %s",
        notification.progress() * 100, notification.message()));
}
```

### @McpToolListChanged, @McpResourceListChanged, @McpPromptListChanged

Handle list change notifications from MCP servers that declare the `listChanged`
capability. When a server's tool, resource, or prompt list changes, it sends a
notification to connected clients.

**MCP Spec Context:** Servers that declare the `listChanged` capability in their
`capabilities` during initialization will send these notifications whenever their
corresponding list is modified. Clients should implement handlers to react to
these changes (e.g., refresh caches, update registries).

```java
@McpToolListChanged(clients = "tool-server")
public void handleToolsChanged(List<McpSchema.Tool> tools) {
    toolRegistry.updateTools(tools);
}

@McpResourceListChanged(clients = "resource-server")
public void handleResourcesChanged(List<McpSchema.Resource> resources) {
    resourceCache.clear();
    resources.forEach(resourceCache::register);
}

@McpPromptListChanged(clients = "prompt-server")
public void handlePromptsChanged(List<McpSchema.Prompt> prompts) {
    promptCatalog.updatePrompts(prompts);
}
```

## Special Parameters

### McpSyncRequestContext / McpAsyncRequestContext

Unified context for stateful operations. Provides:
- `info()`, `warn()`, `error()` — Logging
- `progress()` — Progress notifications
- `ping()` — Health check
- `sampling()` — LLM sampling
- `elicitation()` — User elicitation
- `roots()` — Filesystem roots access

### McpTransportContext

Lightweight context for stateless operations. Access via:
```java
@McpTool
public String tool(McpTransportContext context) {
    Map<String, Object> data = context.get();
    return "Got " + data.size() + " context items";
}
```

### McpMeta

Access `_meta` field from MCP requests:
```java
@McpTool
public String tool(McpMeta meta) {
    return "Request ID: " + meta.requestId();
}
```

### @McpProgressToken

Injected progress token, excluded from JSON schema. Use this parameter to track
progress for a specific tool call:

```java
@McpTool
public String tool(@McpProgressToken String token) {
    // Use token for progress tracking
    return "Done";
}
```

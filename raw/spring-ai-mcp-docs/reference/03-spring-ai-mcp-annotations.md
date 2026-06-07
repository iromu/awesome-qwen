# Spring AI MCP Annotations

Source: https://docs.spring.io/spring-ai/reference/index.html#mcp-annotations-overview

The Spring AI MCP Annotations module provides annotation-based method handling for Model Context Protocol (MCP) servers and clients in Java.
It simplifies the creation and registration of MCP server methods and client handlers through a clean, declarative approach using Java annotations.

This library builds on top of the [MCP Java SDK](https://github.com/modelcontextprotocol/java-sdk) to provide a higher-level, annotation-based programming model.

## Architecture

### Server Annotations

For MCP Servers, the following annotations are provided:

- **`@McpTool`** - Implements MCP tools with automatic JSON schema generation
- **`@McpResource`** - Provides access to resources via URI templates
- **`@McpPrompt`** - Generates prompt messages
- **`@McpComplete`** - Provides auto-completion functionality

### Client Annotations

For MCP Clients, the following annotations are provided:

- **`@McpLogging`** - Handles logging message notifications
- **`@McpSampling`** - Handles sampling requests
- **`@McpElicitation`** - Handles elicitation requests for gathering additional information
- **`@McpProgress`** - Handles progress notifications during long-running operations
- **`@McpToolListChanged`** - Handles tool list change notifications
- **`@McpResourceListChanged`** - Handles resource list change notifications
- **`@McpPromptListChanged`** - Handles prompt list change notifications

### Special Parameters and Annotations

- **`McpSyncRequestContext`** - Special parameter type for synchronous operations providing unified access to MCP request context, including request, server exchange, transport context, and convenient methods for logging, progress, sampling, elicitation, and roots access. Supported in Complete, Prompt, Resource, and Tool methods.
- **`McpAsyncRequestContext`** - Same unified interface as `McpSyncRequestContext` but with reactive (Mono-based) return types. Supported in Complete, Prompt, Resource, and Tool methods.
- **`McpTransportContext`** - Special parameter type for stateless operations providing lightweight access to transport-level context.
- **`@McpProgressToken`** - Marks a method parameter to receive the progress token from the request. Automatically injected and excluded from JSON schema.
- **`McpMeta`** - Special parameter type providing access to metadata from MCP requests, notifications, and results. Excluded from parameter count limits and JSON schema generation.
- **`MetaProvider`** - Interface implemented to supply `_meta` field data for tool, prompt, and resource declarations.

## Getting Started

### Dependencies

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-mcp-annotations</artifactId>
</dependency>
```

The MCP annotations are automatically included when you use any of the MCP Boot Starters:

- `spring-ai-starter-mcp-client`
- `spring-ai-starter-mcp-client-webflux`
- `spring-ai-starter-mcp-server`
- `spring-ai-starter-mcp-server-webflux`
- `spring-ai-starter-mcp-server-webmvc`

### Configuration

Annotation scanning is enabled by default when using the MCP Boot Starters.

**Client Annotation Scanner:**
```yaml
spring:
  ai:
    mcp:
      client:
        annotation-scanner:
          enabled: true
```

**Server Annotation Scanner:**
```yaml
spring:
  ai:
    mcp:
      server:
        annotation-scanner:
          enabled: true
```

## Quick Example

### Calculator Tool Server

```java
@Component
public class CalculatorTools {

    @McpTool(name = "add", description = "Add two numbers together")
    public int add(
            @McpToolParam(description = "First number", required = true) int a,
            @McpToolParam(description = "Second number", required = true) int b) {
        return a + b;
    }

    @McpTool(name = "multiply", description = "Multiply two numbers")
    public double multiply(
            @McpToolParam(description = "First number", required = true) double x,
            @McpToolParam(description = "Second number", required = true) double y) {
        return x * y;
    }
}
```

### Client Logging Handler

```java
@Component
public class LoggingHandler {

    @McpLogging(clients = "my-server")
    public void handleLoggingMessage(LoggingMessageNotification notification) {
        System.out.println("Received log: " + notification.level() + 
                          " - " + notification.data());
    }
}
```

With Spring Boot auto-configuration, these annotated beans are automatically detected and registered with the MCP server or client.

## Server Annotations Reference

### @McpTool

The `@McpTool` annotation marks a method as an MCP tool implementation with automatic JSON schema generation.

**Attributes:**

| Attribute | Default | Description |
|-----------|---------|-------------|
| `name` | method name | The tool identifier |
| `description` | method name | Human-readable description |
| `title` | `""` | Intended for UI and end-user contexts |
| `generateOutputSchema` | `false` | If `true`, automatically generates JSON output schema for non-primitive return types |
| `annotations` | `@McpAnnotations` | Additional hints for clients |
| `metaProvider` | `DefaultMetaProvider.class` | Class implementing `MetaProvider` for `_meta` field |

**Tool Annotations (Hints):**

| Hint | Default | Description |
|------|---------|-------------|
| `title` | `""` | Human-readable title |
| `readOnlyHint` | `false` | If `true`, the tool does not modify its environment |
| `destructiveHint` | `true` | If `true`, the tool may perform destructive updates |
| `idempotentHint` | `false` | If `true`, calling with same arguments has no additional effect |
| `openWorldHint` | `true` | If `true`, the tool may interact with external entities |

**Basic Usage:**
```java
@McpTool(name = "calculate-area",
         description = "Calculate the area of a rectangle",
         title = "Rectangle Area Calculator",
         generateOutputSchema = true,
         annotations = @McpTool.McpAnnotations(
             title = "Rectangle Area Calculator",
             readOnlyHint = true,
             destructiveHint = false,
             idempotentHint = true
         ))
public AreaResult calculateRectangleArea(
        @McpToolParam(description = "Width", required = true) double width,
        @McpToolParam(description = "Height", required = true) double height) {
    return new AreaResult(width * height, "square units");
}
```

**With Request Context:**
```java
@McpTool(name = "process-data", description = "Process data with request context")
public String processData(
        McpSyncRequestContext context,
        @McpToolParam(description = "Data to process", required = true) String data) {
    context.info("Processing data: " + data);
    context.progress(p -> p.progress(0.5).total(1.0).message("Processing..."));
    context.ping();
    return "Processed: " + data.toUpperCase();
}
```

**Dynamic Schema Support:**
```java
@McpTool(name = "flexible-tool", description = "Process dynamic schema")
public CallToolResult processDynamic(CallToolRequest request) {
    Map<String, Object> args = request.arguments();
    String result = "Processed " + args.size() + " arguments dynamically";
    return CallToolResult.builder().addTextContent(result).build();
}
```

### @McpResource

The `@McpResource` annotation provides access to resources via URI templates.

**Attributes:**

| Attribute | Default | Description |
|-----------|---------|-------------|
| `uri` | `""` | The URI (or URI template) of the resource. Use `{varName}` for template variables |
| `name` | `""` | Programmatic identifier |
| `title` | `""` | Optional human-readable name |
| `description` | `""` | Description of what the resource represents |
| `mimeType` | `"text/plain"` | The MIME type of the resource content |
| `metaProvider` | `DefaultMetaProvider.class` | Class implementing `MetaProvider` for `_meta` field |
| `annotations` | `@McpAnnotations(...)` | Client annotations for audience, priority, and last-modified metadata |

**Basic Usage:**
```java
@McpResource(
    uri = "config://{key}",
    name = "Configuration",
    title = "App Configuration",
    description = "Provides configuration data")
public String getConfig(String key) {
    return configData.get(key);
}
```

**With ReadResourceResult:**
```java
@McpResource(
    uri = "user-profile://{username}", 
    name = "User Profile", 
    description = "Provides user profile information")
public ReadResourceResult getUserProfile(String username) {
    String profileData = loadUserProfile(username);
    return ReadResourceResult.builder(List.of(
        new TextResourceContents("user-profile://" + username, "application/json", profileData)
    )).build();
}
```

### @McpPrompt

The `@McpPrompt` annotation generates prompt messages for AI interactions.

**Attributes:**

| Attribute | Default | Description |
|-----------|---------|-------------|
| `name` | `""` | Unique identifier for the prompt |
| `title` | `""` | Optional human-readable name |
| `description` | `""` | Optional human-readable description |
| `metaProvider` | `DefaultMetaProvider.class` | Class implementing `MetaProvider` for `_meta` field |

**Basic Usage:**
```java
@McpPrompt(
    name = "greeting", 
    description = "Generate a greeting message")
public GetPromptResult greeting(
        @McpArg(name = "name", description = "User's name", required = true) 
        String name) {
    String message = "Hello, " + name + "! How can I help you today?";
    return GetPromptResult.builder(List.of(new PromptMessage(Role.ASSISTANT, TextContent.builder(message).build())))
        .description("Greeting")
        .build();
}
```

### @McpComplete

The `@McpComplete` annotation provides auto-completion functionality for prompts and resource URI templates.

**Prompt Argument Completion:**
```java
@McpComplete(prompt = "city-search")
public List<String> completeCityName(String prefix) {
    return cities.stream()
        .filter(city -> city.toLowerCase().startsWith(prefix.toLowerCase()))
        .limit(10)
        .toList();
}
```

**Resource URI Completion:**
```java
@McpComplete(uri = "config://{key}")
public List<String> completeConfigKey(String prefix) {
    return configKeys.stream()
        .filter(key -> key.startsWith(prefix))
        .limit(10)
        .toList();
}
```

## Client Annotations Reference

### @McpLogging

Handles logging message notifications from MCP servers.

```java
@McpLogging(clients = "my-mcp-server")
public void handleLoggingMessage(LoggingMessageNotification notification) {
    System.out.println("Received log: " + notification.level() + 
                      " - " + notification.data());
}
```

### @McpSampling

Handles sampling requests from MCP servers for LLM completions.

```java
@McpSampling(clients = "llm-server")
public CreateMessageResult handleSamplingRequest(CreateMessageRequest request) {
    String response = generateLLMResponse(request);
    return CreateMessageResult.builder(Role.ASSISTANT, response, "gpt-4").build();
}
```

### @McpElicitation

Handles elicitation requests to gather additional information from users.

```java
@McpElicitation(clients = "interactive-server")
public ElicitResult handleElicitationRequest(ElicitRequest request) {
    Map<String, Object> userData = presentFormToUser(request.requestedSchema());
    if (userData != null) {
        return new ElicitResult(ElicitResult.Action.ACCEPT, userData);
    } else {
        return new ElicitResult(ElicitResult.Action.DECLINE, null);
    }
}
```

### @McpProgress

Handles progress notifications for long-running operations.

```java
@McpProgress(clients = "my-mcp-server")
public void handleProgressNotification(ProgressNotification notification) {
    double percentage = notification.progress() * 100;
    System.out.println(String.format("Progress: %.2f%% - %s", 
        percentage, notification.message()));
}
```

### @McpToolListChanged

Handles notifications when the server's tool list changes.

```java
@McpToolListChanged(clients = "tool-server")
public void handleToolListChanged(List<McpSchema.Tool> updatedTools) {
    toolRegistry.updateTools(updatedTools);
}
```

### @McpResourceListChanged

Handles notifications when the server's resource list changes.

```java
@McpResourceListChanged(clients = "resource-server")
public void handleResourceListChanged(List<McpSchema.Resource> updatedResources) {
    resourceCache.clear();
    for (McpSchema.Resource resource : updatedResources) {
        resourceCache.register(resource);
    }
}
```

### @McpPromptListChanged

Handles notifications when the server's prompt list changes.

```java
@McpPromptListChanged(clients = "prompt-server")
public void handlePromptListChanged(List<McpSchema.Prompt> updatedPrompts) {
    promptCatalog.updatePrompts(updatedPrompts);
}
```

> **IMPORTANT:** All MCP client annotations MUST include a `clients` parameter to associate the handler with a specific MCP client connection. The `clients` must match the connection name configured in your application properties.

## Method Filtering by Server Type

The MCP annotations framework automatically filters annotated methods based on the server type and method characteristics.

### Sync Stateful

- **Accepts:** Non-reactive returns + bidirectional context (`McpSyncRequestContext`, `McpSyncServerExchange`)
- **Filters:** Reactive returns (Mono/Flux)

### Async Stateful

- **Accepts:** Reactive returns (Mono/Flux) + bidirectional context (`McpAsyncRequestContext`, `McpAsyncServerExchange`)
- **Filters:** Non-reactive returns

### Sync Stateless

- **Accepts:** Non-reactive returns + no bidirectional context (`McpTransportContext` or no context)
- **Filters:** Reactive returns OR bidirectional context parameters

### Async Stateless

- **Accepts:** Reactive returns (Mono/Flux) + no bidirectional context
- **Filters:** Non-reactive returns OR bidirectional context parameters

## Best Practices

1. **Keep methods aligned** with your server type - use sync methods for sync servers, async for async servers
2. **Separate stateful and stateless** implementations into different classes for clarity
3. **Check logs** during startup for filtered method warnings
4. **Use the right context** - `McpSyncRequestContext`/`McpAsyncRequestContext` for stateful, `McpTransportContext` for stateless
5. **Test both modes** if you support both stateful and stateless deployments

## Additional Resources

- [MCP Overview](spring-ai-mcp-overview.md)
- [MCP Client Boot Starter](spring-ai-mcp-client-boot-starters.md)
- [MCP Server Boot Starter](spring-ai-mcp-server-boot-starters.md)
- [Special Parameters](spring-ai-mcp-special-params.md)
- [Model Context Protocol Specification](https://modelcontextprotocol.github.io/specification/)

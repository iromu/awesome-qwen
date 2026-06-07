# Spring AI MCP Server Boot Starter

Source: https://docs.spring.io/spring-ai/reference/index.html#mcp-server-boot-starters

[Model Context Protocol (MCP) Servers](https://modelcontextprotocol.io/docs/learn/server-concepts) are programs that expose specific capabilities to AI applications through standardized protocol interfaces.
Each server provides focused functionality for a particular domain.

The Spring AI MCP Server Boot Starters provide auto-configuration for setting up [MCP Servers](https://modelcontextprotocol.io/docs/learn/server-concepts) in Spring Boot applications.
They enable seamless integration of MCP server capabilities with Spring Boot's auto-configuration system.

## MCP Server Boot Starters

### STDIO

| Server Type | Dependency | Property |
|-------------|-----------|----------|
| Standard Input/Output (STDIO) | `spring-ai-starter-mcp-server` | `spring.ai.mcp.server.stdio=true` |

### WebMVC

| Server Type | Dependency | Property |
|-------------|-----------|----------|
| SSE WebMVC | `spring-ai-starter-mcp-server-webmvc` | `spring.ai.mcp.server.protocol=SSE` or empty |
| Streamable-HTTP WebMVC | `spring-ai-starter-mcp-server-webmvc` | `spring.ai.mcp.server.protocol=STREAMABLE` |
| Stateless WebMVC | `spring-ai-starter-mcp-server-webmvc` | `spring.ai.mcp.server.protocol=STATELESS` |

### WebFlux (Reactive)

| Server Type | Dependency | Property |
|-------------|-----------|----------|
| SSE WebFlux | `spring-ai-starter-mcp-server-webflux` | `spring.ai.mcp.server.protocol=SSE` or empty |
| Streamable-HTTP WebFlux | `spring-ai-starter-mcp-server-webflux` | `spring.ai.mcp.server.protocol=STREAMABLE` |
| Stateless WebFlux | `spring-ai-starter-mcp-server-webflux` | `spring.ai.mcp.server.protocol=STATELESS` |

## Server Capabilities

- **Tools** - Allows servers to expose tools that can be invoked by language models
- **Resources** - Provides a standardized way for servers to expose resources to clients
- **Prompts** - Provides a standardized way for servers to expose prompt templates to clients
- **Utility/Completions** - Provides autocompletion suggestions for prompts and resource URIs
- **Utility/Logging** - Provides structured log messages to clients
- **Utility/Progress** - Optional progress tracking for long-running operations
- **Utility/Ping** - Optional health check mechanism

All capabilities are enabled by default.

## Server Protocols

- **STDIO** - In process (server runs inside the host application). Communication over standard in and standard out. Set `spring.ai.mcp.server.stdio=true`.
- **SSE** - Server-sent events protocol for real-time updates. The server operates as an independent process.
- **Streamable-HTTP** - The Streamable HTTP transport allows MCP servers to operate as independent processes that can handle multiple client connections using HTTP POST and GET requests, with optional SSE streaming. Replaces the SSE transport. Set `spring.ai.mcp.server.protocol=STREAMABLE`.
- **Stateless** - Stateless MCP servers where session state is not maintained between requests. Ideal for microservices and cloud-native deployments. Set `spring.ai.mcp.server.protocol=STATELESS`.

## Sync/Async Server API Options

- **Synchronous Server** - Default server type implemented using `McpSyncServer`. Set `spring.ai.mcp.server.type=SYNC`.
- **Asynchronous Server** - Uses `McpAsyncServer` optimized for non-blocking operations. Set `spring.ai.mcp.server.type=ASYNC`.

## Server Annotations

### Key Annotations

- **`@McpTool`** - Mark methods as MCP tools with automatic JSON schema generation
- **`@McpResource`** - Provide access to resources via URI templates
- **`@McpPrompt`** - Generate prompt messages for AI interactions
- **`@McpComplete`** - Provide auto-completion functionality for prompts

### Special Parameters

- **`McpMeta`** - Access metadata from MCP requests
- **`@McpProgressToken`** - Receive progress tokens for long-running operations
- **`McpSyncServerExchange`/`McpAsyncServerExchange`** - Full server context for advanced operations
- **`McpTransportContext`** - Lightweight context for stateless operations
- **`CallToolRequest`** - Dynamic schema support for flexible tools

### Simple Example

```java
@Component
public class CalculatorTools {

    @McpTool(name = "add", description = "Add two numbers together")
    public int add(
            @McpToolParam(description = "First number", required = true) int a,
            @McpToolParam(description = "Second number", required = true) int b) {
        return a + b;
    }

    @McpResource(uri = "config://{key}", name = "Configuration")
    public String getConfig(String key) {
        return configData.get(key);
    }
}
```

### Adding Transport Context Data

```java
@Bean
public WebMvcStreamableServerTransportProvider transport(ObjectMapper objectMapper) {
    return WebMvcStreamableServerTransportProvider.builder()
        .contextExtractor(serverRequest -> {
            String authorization = serverRequest.headers().firstHeader("Authorization");
            return McpTransportContext.create(Map.of("authorization", authorization));
        })
        .build();
}
```

```java
@McpTool
public String accessProtectedResource(McpSyncRequestContext requestContext) {
    McpTransportContext context = requestContext.transportContext();
    String authorization = (String) context.get("authorization");
    return "Successfully accessed protected resource.";
}
```

### Configuration Properties

| Property | Description | Default |
|----------|-----------|---------|
| `enabled` | Enable/disable the MCP server | `true` |
| `tool-callback-converter` | Enable/disable ToolCallback conversion | `true` |
| `stdio` | Enable/disable STDIO transport | `false` |
| `name` | Server name for identification | `mcp-server` |
| `version` | Server version | `1.0.0` |
| `instructions` | Optional instructions for client | `null` |
| `type` | Server type (SYNC/ASYNC) | `SYNC` |
| `capabilities.resource` | Enable/disable resource capabilities | `true` |
| `capabilities.tool` | Enable/disable tool capabilities | `true` |
| `capabilities.prompt` | Enable/disable prompt capabilities | `true` |
| `capabilities.completion` | Enable/disable completion capabilities | `true` |
| `resource-change-notification` | Enable resource change notifications | `true` |
| `prompt-change-notification` | Enable prompt change notifications | `true` |
| `tool-change-notification` | Enable tool change notifications | `true` |
| `expose-mcp-client-tools` | Re-expose downstream MCP tools | `false` |
| `tool-response-mime-type` | Response MIME type per tool name | `-` |
| `request-timeout` | Duration to wait for server responses | `20 seconds` |

### SSE Properties

| Property | Description | Default |
|----------|-----------|---------|
| `sse-message-endpoint` | Custom SSE message endpoint path | `/mcp/message` |
| `sse-endpoint` | Custom SSE endpoint path | `/sse` |
| `base-url` | Optional URL prefix | `-` |
| `keep-alive-interval` | Connection keep-alive interval | `null` (disabled) |

## Features and Capabilities

### Tools

Allows servers to expose tools that can be invoked by language models.

```java
@Bean
public ToolCallbackProvider myTools(...) {
    List<ToolCallback> tools = ...
    return ToolCallbackProvider.from(tools);
}
```

#### Tool Context Support

The `ToolContext` is supported, allowing contextual information to be passed to tool calls. It contains an `McpSyncServerExchange` instance under the `exchange` key.

### Resources

Provides a standardized way for servers to expose resources to clients.

```java
@Bean
public List<McpServerFeatures.SyncResourceSpecification> myResources(...) {
    var systemInfoResource = new McpSchema.Resource(...);
    var resourceSpecification = new McpServerFeatures.SyncResourceSpecification(systemInfoResource, (exchange, request) -> {
        var systemInfo = Map.of(...);
        String jsonContent = new JsonMapper().writeValueAsString(systemInfo);
        return new McpSchema.ReadResourceResult(
                List.of(new McpSchema.TextResourceContents(request.uri(), "application/json", jsonContent)));
    });
    return List.of(resourceSpecification);
}
```

### Prompts

Provides a standardized way for servers to expose prompt templates to clients.

```java
@Bean
public List<McpServerFeatures.SyncPromptSpecification> myPrompts() {
    var prompt = new McpSchema.Prompt("greeting", "A friendly greeting prompt",
        List.of(new McpSchema.PromptArgument("name", "The name to greet", true)));
    var promptSpecification = new McpServerFeatures.SyncPromptSpecification(prompt, (exchange, getPromptRequest) -> {
        String nameArgument = (String) getPromptRequest.arguments().get("name");
        if (nameArgument == null) { nameArgument = "friend"; }
        var userMessage = new PromptMessage(Role.USER, TextContent.builder("Hello " + nameArgument + "! How can I assist you today?").build());
        return GetPromptResult.builder(List.of(userMessage)).description("A personalized greeting message").build();
    });
    return List.of(promptSpecification);
}
```

### Logging

```java
(exchange, request) -> {
    exchange.loggingNotification(LoggingMessageNotification.builder(LoggingLevel.INFO, "This is a test log message")
        .logger("test-logger")
        .build());
}
```

### Progress

```java
(exchange, request) -> {
    exchange.progressNotification(ProgressNotification.builder("test-progress-token", 0.25)
        .total(1.0)
        .message("tool call in progress")
        .build());
}
```

## Usage Examples

### STDIO Server Configuration

```yaml
spring:
  ai:
    mcp:
      server:
        name: stdio-mcp-server
        version: 1.0.0
        type: SYNC
```

### WebMVC Server Configuration

```yaml
spring:
  ai:
    mcp:
      server:
        name: webmvc-mcp-server
        version: 1.0.0
        type: SYNC
        instructions: "This server provides weather information tools and resources"
        capabilities:
          tool: true
          resource: true
          prompt: true
          completion: true
        sse-message-endpoint: /mcp/messages
        keep-alive-interval: 30s
```

### WebFlux Server Configuration

```yaml
spring:
  ai:
    mcp:
      server:
        name: webflux-mcp-server
        version: 1.0.0
        type: ASYNC
        instructions: "This reactive server provides weather information tools and resources"
        capabilities:
          tool: true
          resource: true
          prompt: true
          completion: true
        sse-message-endpoint: /mcp/messages
        keep-alive-interval: 30s
```

### Creating a Spring Boot Application with MCP Server

```java
@Service
public class WeatherService {

    @Tool(description = "Get weather information by city name")
    public String getWeather(String cityName) {
        // Implementation
    }
}

@SpringBootApplication
public class McpServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(McpServerApplication.class, args);
    }

    @Bean
    public ToolCallbackProvider weatherTools(WeatherService weatherService) {
        return MethodToolCallbackProvider.builder().toolObjects(weatherService).build();
    }
}
```

## Example Applications

- [Weather Server (SSE WebFlux)](https://github.com/spring-projects/spring-ai-examples/tree/main/model-context-protocol/weather/starter-webflux-server)
- [Weather Server (STDIO)](https://github.com/spring-projects/spring-ai-examples/tree/main/model-context-protocol/weather/starter-stdio-server)
- [Weather Server Manual Configuration](https://github.com/spring-projects/spring-ai-examples/tree/main/model-context-protocol/weather/manual-webflux-server)

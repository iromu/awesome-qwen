# Spring AI MCP Streamable-HTTP and Stateless Servers

Source: https://docs.spring.io/spring-ai/reference/index.html#mcp-streamable-http-server-boot-starter-docs and https://docs.spring.io/spring-ai/reference/index.html#mcp-stateless-server-boot-starter-docs

## Streamable-HTTP MCP Servers

The [Streamable HTTP transport](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports#streamable-http) allows MCP servers to operate as independent processes that can handle multiple client connections using HTTP POST and GET requests, with optional Server-Sent Events (SSE) streaming for multiple server messages. It replaces the SSE transport.

These servers, introduced with spec version [2025-03-26](https://modelcontextprotocol.io/specification/2025-03-26), are ideal for applications that need to notify clients about dynamic changes to tools, resources, or prompts.

> TIP: Set the `spring.ai.mcp.server.protocol=STREAMABLE` property

### Streamable-HTTP WebMVC Server

Use the `spring-ai-starter-mcp-server-webmvc` dependency:

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-mcp-server-webmvc</artifactId>
</dependency>
```

- Full MCP server capabilities with Spring MVC Streamable transport
- Support for tools, resources, prompts, completion, logging, progression, ping, root-changes capabilities
- Persistent connection management

### Streamable-HTTP WebFlux Server

Use the `spring-ai-starter-mcp-server-webflux` dependency:

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-mcp-server-webflux</artifactId>
</dependency>
```

- Reactive MCP server with WebFlux Streamable transport
- Non-blocking, persistent connection management

### Streamable-HTTP Configuration Properties

| Property | Description | Default |
|----------|-----------|---------|
| `enabled` | Enable/disable the streamable MCP server | `true` |
| `protocol` | MCP server protocol | Must be `STREAMABLE` |
| `mcp-endpoint` | Custom MCP endpoint path | `/mcp` |
| `keep-alive-interval` | Connection keep-alive interval | `null` (disabled) |
| `disallow-delete` | Disallow delete operations | `false` |

### Streamable-HTTP Configuration Example

```yaml
spring:
  ai:
    mcp:
      server:
        protocol: STREAMABLE
        name: streamable-mcp-server
        version: 1.0.0
        type: SYNC
        instructions: "This streamable server provides real-time notifications"
        resource-change-notification: true
        tool-change-notification: true
        prompt-change-notification: true
        streamable-http:
          mcp-endpoint: /api/mcp
          keep-alive-interval: 30s
```

## Stateless Streamable-HTTP MCP Servers

Stateless Streamable-HTTP MCP servers are designed for simplified deployments where session state is not maintained between requests.
These servers are ideal for microservices architectures and cloud-native deployments.

> TIP: Set the `spring.ai.mcp.server.protocol=STATELESS` property

> NOTE: The stateless servers don't support message requests to the MCP client (e.g., elicitation, sampling, ping).

### Stateless WebMVC Server

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-mcp-server-webmvc</artifactId>
</dependency>
```

- Stateless operation with Spring MVC transport
- No session state management
- Simplified deployment model
- Optimized for cloud-native environments

### Stateless WebFlux Server

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-mcp-server-webflux</artifactId>
</dependency>
```

- Reactive stateless operation with WebFlux transport
- No session state management
- Non-blocking request processing
- Optimized for high-throughput scenarios

### Stateless Configuration Properties

| Property | Description | Default |
|----------|-----------|---------|
| `enabled` | Enable/disable the stateless MCP server | `true` |
| `protocol` | MCP server protocol | Must be `STATELESS` |
| `mcp-endpoint` | Custom MCP endpoint path | `/mcp` |
| `disallow-delete` | Disallow delete operations | `false` |

### Stateless Configuration Example

```yaml
spring:
  ai:
    mcp:
      server:
        protocol: STATELESS
        name: stateless-mcp-server
        version: 1.0.0
        type: ASYNC
        instructions: "This stateless server is optimized for cloud deployments"
        streamable-http:
          mcp-endpoint: /api/mcp
```

### Stateless Tool Example

```java
@Component
public class StatelessTools {

    @McpTool(name = "format-text", description = "Format text")
    public String formatText(
            @McpToolParam(description = "Text to format", required = true) String text,
            @McpToolParam(description = "Format type", required = true) String format) {
        return switch (format.toLowerCase()) {
            case "uppercase" -> text.toUpperCase();
            case "lowercase" -> text.toLowerCase();
            case "title" -> toTitleCase(text);
            case "reverse" -> new StringBuilder(text).reverse().toString();
            default -> text;
        };
    }

    @McpTool(name = "validate-json", description = "Validate JSON")
    public CallToolResult validateJson(
            McpTransportContext context,
            @McpToolParam(description = "JSON string", required = true) String json) {
        try {
            JsonMapper mapper = new JsonMapper();
            mapper.readTree(json);
            return CallToolResult.builder()
                .addTextContent("Valid JSON")
                .structuredContent(Map.of("valid", true))
                .build();
        } catch (JacksonException e) {
            return CallToolResult.builder()
                .addTextContent("Invalid JSON: " + e.getMessage())
                .structuredContent(Map.of("valid", false, "error", e.getMessage()))
                .build();
        }
    }
}
```

### Stateless vs Stateful Method Filtering

**Stateless servers filter out methods with:**
- `McpSyncRequestContext` or `McpAsyncRequestContext` (bidirectional context)
- `McpSyncServerExchange` or `McpAsyncServerExchange`
- Reactive return types (for sync stateless) or non-reactive return types (for async stateless)

**Stateless servers accept methods with:**
- `McpTransportContext` (lightweight stateless context)
- No context parameter at all
- Only regular `@McpToolParam` parameters

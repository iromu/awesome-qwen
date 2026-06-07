# MCP Boot Starters Reference

## Server Starters

### STDIO

| Property | Value |
|----------|-------|
| Dependency | `spring-ai-starter-mcp-server` |
| Property | `spring.ai.mcp.server.stdio=true` |

### WebMVC

| Transport | Protocol Property |
|-----------|-------------------|
| SSE | `spring.ai.mcp.server.protocol=SSE` |
| Streamable-HTTP | `spring.ai.mcp.server.protocol=STREAMABLE` |
| Stateless | `spring.ai.mcp.server.protocol=STATELESS` |

### WebFlux

| Transport | Protocol Property |
|-----------|-------------------|
| SSE | `spring.ai.mcp.server.protocol=SSE` |
| Streamable-HTTP | `spring.ai.mcp.server.protocol=STREAMABLE` |
| Stateless | `spring.ai.mcp.server.protocol=STATELESS` |

## Client Starters

| Type | Starter | Transport |
|------|---------|-----------|
| Sync | `spring-ai-starter-mcp-client` | STDIO, JDK HttpClient SSE/Streamable-HTTP |
| Async | `spring-ai-starter-mcp-client-webflux` | WebFlux SSE/Streamable-HTTP |

## Common Configuration Properties

| Property | Description | Default |
|----------|-----------|---------|
| `spring.ai.mcp.server.name` | Server name | `mcp-server` |
| `spring.ai.mcp.server.version` | Server version | `1.0.0` |
| `spring.ai.mcp.server.instructions` | Instructions for clients | `null` |
| `spring.ai.mcp.server.type` | SYNC or ASYNC | `SYNC` |
| `spring.ai.mcp.server.request-timeout` | Request timeout | `20s` |
| `spring.ai.mcp.client.type` | SYNC or ASYNC | `SYNC` |
| `spring.ai.mcp.client.request-timeout` | Request timeout | `20s` |

## Server Capabilities

| Capability | Property | Default |
|------------|----------|---------|
| Tools | `spring.ai.mcp.server.capabilities.tool` | `true` |
| Resources | `spring.ai.mcp.server.capabilities.resource` | `true` |
| Prompts | `spring.ai.mcp.server.capabilities.prompt` | `true` |
| Completions | `spring.ai.mcp.server.capabilities.completion` | `true` |

## SSE Configuration

| Property | Description | Default |
|----------|-----------|---------|
| `spring.ai.mcp.server.sse-endpoint` | SSE endpoint path | `/sse` |
| `spring.ai.mcp.server.sse-message-endpoint` | SSE message endpoint | `/mcp/message` |
| `spring.ai.mcp.server.keep-alive-interval` | Keep-alive interval | `null` (disabled) |

## Streamable-HTTP Configuration

| Property | Description | Default |
|----------|-----------|---------|
| `spring.ai.mcp.server.streamable-http.mcp-endpoint` | MCP endpoint | `/mcp` |
| `spring.ai.mcp.server.streamable-http.keep-alive-interval` | Keep-alive interval | `null` |

## Client Transport Configuration

### STDIO

```yaml
spring:
  ai:
    mcp:
      client:
        stdio:
          connections:
            server1:
              command: /path/to/server
              args:
                - --port=8080
              env:
                API_KEY: your-key
```

### Streamable-HTTP

```yaml
spring:
  ai:
    mcp:
      client:
        streamable-http:
          connections:
            server1:
              url: http://localhost:8080
              endpoint: /mcp
```

### SSE

```yaml
spring:
  ai:
    mcp:
      client:
        sse:
          connections:
            server1:
              url: http://localhost:8080
              sse-endpoint: /sse
```

## Client Customization

Implement `McpCustomizer<McpClient.SyncSpec>` or `McpCustomizer<McpClient.AsyncSpec>`:

```java
@Component
public class CustomMcpClientCustomizer implements McpCustomizer<McpClient.SyncSpec> {
    @Override
    public void customize(String name, McpClient.SyncSpec spec) {
        spec.requestTimeout(Duration.ofSeconds(30));
        spec.roots(roots);
        spec.sampling((request) -> { /* handle sampling */ });
        spec.elicitation((request) -> { /* handle elicitation */ });
        spec.progressConsumer((progress) -> { /* handle progress */ });
        spec.toolsChangeConsumer((tools) -> { /* handle tools change */ });
        spec.resourcesChangeConsumer((resources) -> { /* handle resources change */ });
        spec.promptsChangeConsumer((prompts) -> { /* handle prompts change */ });
        spec.loggingConsumer((log) -> { /* handle logging */ });
    }
}
```

## Tool Filtering

Implement `McpToolFilter`:

```java
@Component
public class CustomMcpToolFilter implements McpToolFilter {
    @Override
    public boolean test(McpConnectionInfo connectionInfo, McpSchema.Tool tool) {
        // Filter logic
        return true; // or false to exclude
    }
}
```

## Tool Name Prefix Generator

Implement `McpToolNamePrefixGenerator`:

```java
@Component
public class CustomPrefixGenerator implements McpToolNamePrefixGenerator {
    @Override
    public String prefixedToolName(McpConnectionInfo info, McpSchema.Tool tool) {
        return info.initializeResult().serverInfo().name() + "_" + tool.name();
    }
}

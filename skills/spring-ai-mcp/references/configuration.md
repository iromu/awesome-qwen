# MCP Configuration Properties Reference

## Server Configuration Properties

| Property | Description | Default |
|----------|-----------|---------|
| `spring.ai.mcp.server.enabled` | Enable/disable MCP server | `true` |
| `spring.ai.mcp.server.name` | Server name | `mcp-server` |
| `spring.ai.mcp.server.version` | Server version | `1.0.0` |
| `spring.ai.mcp.server.instructions` | Instructions for clients | `null` |
| `spring.ai.mcp.server.type` | SYNC or ASYNC | `SYNC` |
| `spring.ai.mcp.server.stdio` | Enable STDIO transport | `false` |
| `spring.ai.mcp.server.capabilities.tool` | Enable tools | `true` |
| `spring.ai.mcp.server.capabilities.resource` | Enable resources | `true` |
| `spring.ai.mcp.server.capabilities.prompt` | Enable prompts | `true` |
| `spring.ai.mcp.server.capabilities.completion` | Enable completions | `true` |
| `spring.ai.mcp.server.capabilities.roots` | Enable roots capability | `false` |
| `spring.ai.mcp.server.capabilities.experimental` | Enable experimental features | `false` |
| `spring.ai.mcp.server.tool-change-notification` | Tool change notifications | `true` |
| `spring.ai.mcp.server.resource-change-notification` | Resource change notifications | `true` |
| `spring.ai.mcp.server.prompt-change-notification` | Prompt change notifications | `true` |
| `spring.ai.mcp.server.request-timeout` | Response timeout | `20s` |

## Client Configuration Properties

| Property | Description | Default |
|----------|-----------|---------|
| `spring.ai.mcp.client.enabled` | Enable/disable MCP client | `true` |
| `spring.ai.mcp.client.name` | Client name | `spring-ai-mcp-client` |
| `spring.ai.mcp.client.type` | SYNC or ASYNC | `SYNC` |
| `spring.ai.mcp.client.request-timeout` | Request timeout | `20s` |
| `spring.ai.mcp.client.toolcallback.enabled` | Auto-register MCP tools as Spring AI tools | `true` |

## Server Capabilities

| Capability | Property | Default |
|------------|----------|---------|
| Tools | `spring.ai.mcp.server.capabilities.tool` | `true` |
| Resources | `spring.ai.mcp.server.capabilities.resource` | `true` |
| Prompts | `spring.ai.mcp.server.capabilities.prompt` | `true` |
| Completions | `spring.ai.mcp.server.capabilities.completion` | `true` |
| Roots | `spring.ai.mcp.server.capabilities.roots` | `false` |
| Experimental | `spring.ai.mcp.server.capabilities.experimental` | `false` |

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

## Transport Configuration Examples

### STDIO Client

```yaml
spring:
  ai:
    mcp:
      client:
        stdio:
          connections:
            my-server:
              command: /path/to/server
              args:
                - --port=8080
              env:
                API_KEY: your-api-key
```

### SSE Client

```yaml
spring:
  ai:
    mcp:
      client:
        sse:
          connections:
            my-server:
              url: http://localhost:8080
              sse-endpoint: /sse
```

### Streamable-HTTP Client (JDK HttpClient)

```yaml
spring:
  ai:
    mcp:
      client:
        streamable-http:
          connections:
            my-server:
              url: http://localhost:8080
              endpoint: /mcp
              resumable: true
```

### Streamable-HTTP Client (WebClient)

```yaml
spring:
  ai:
    mcp:
      client:
        streamable-http:
          connections:
            my-server:
              url: http://localhost:8080
              endpoint: /mcp
              resumable: true
              protocol-version: 2025-06-18
```

## Common Server Properties

| Property | Description | Default |
|----------|-----------|---------|
| `spring.ai.mcp.server.name` | Server name | `mcp-server` |
| `spring.ai.mcp.server.version` | Server version | `1.0.0` |
| `spring.ai.mcp.server.instructions` | Instructions for clients | `null` |
| `spring.ai.mcp.server.type` | SYNC or ASYNC | `SYNC` |
| `spring.ai.mcp.server.request-timeout` | Request timeout | `20s` |

## Client Common Properties

| Property | Description | Default |
|----------|-----------|---------|
| `spring.ai.mcp.client.type` | SYNC or ASYNC | `SYNC` |
| `spring.ai.mcp.client.request-timeout` | Request timeout | `20s` |

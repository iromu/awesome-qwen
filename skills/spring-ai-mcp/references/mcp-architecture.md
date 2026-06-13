# MCP Architecture Reference

## Three-Layer SDK Architecture

The Spring AI MCP SDK follows a three-layer architecture that separates protocol
logic from transport concerns.

```
┌─────────────────────────────────────────────────────────────────┐
│ APPLICATION LAYER                                              │
│ McpClient / McpServer — main application logic, protocol       │
│ operations (initialize, listTools, callTool, etc.)             │
├─────────────────────────────────────────────────────────────────┤
│ SESSION LAYER                                                  │
│ McpSession / McpClientSession / McpServerSession — manage       │
│ communication patterns, request/response correlation, state    │
├─────────────────────────────────────────────────────────────────┤
│ TRANSPORT LAYER                                                │
│ McpTransport — JSON-RPC message serialization/deserialization   │
│ STDIO, SSE, Streamable-HTTP, Stateless                         │
└─────────────────────────────────────────────────────────────────┘
```

### Layer 1: Client/Server

The top layer provides the `McpClient` and `McpServer` APIs for protocol
operations:

- `initialize()` — Establish connection, negotiate protocol version and capabilities
- `listTools()`, `callTool()` — Tool discovery and invocation
- `listResources()`, `readResource()` — Resource discovery and reading
- `listPrompts()`, `getPrompt()` — Prompt discovery and retrieval
- `subscribeResources()`, `unsubscribeResources()` — Resource subscription
- `progressNotification()` — Progress reporting
- `loggingMessage()` — Logging notifications

Both sync (`McpSyncClient`, `McpSyncServer`) and async (`McpAsyncClient`,
`McpAsyncServer`) variants are available.

### Layer 2: Session

The session layer manages communication patterns:

- **`McpSession`** — Base interface for session communication
- **`McpClientSession`** — Client-side session managing request/response correlation
- **`McpServerSession`** — Server-side session managing client connections

The session layer handles:
- JSON-RPC message serialization and deserialization
- Request ID correlation (matching responses to requests)
- Notification delivery (one-way messages without responses)
- Error handling and error code mapping

### Layer 3: Transport

The transport layer handles message serialization/deserialization over different
protocols. Implement `McpTransport` for custom transports:

```java
public interface McpTransport {
    void initialize();
    void sendMessage(Object message);
    void start();
    void stop();
    void onMessage(Consumer<Object> handler);
}
```

## Transport Hierarchy

```
McpTransport (interface)
├── StdioTransport (STDIO — standard I/O)
├── SseTransport (SSE — Server-Sent Events)
│   ├── WebMvcSseTransport (Spring WebMVC)
│   └── WebFluxSseTransport (Spring WebFlux)
├── StreamableHttpTransport (Streamable HTTP)
│   ├── WebMvcStreamableHttpTransport
│   ├── WebFluxStreamableHttpTransport
│   └── WebClientStreamableHttpTransport (client-side, WebClient-based)
└── StatelessTransport (Stateless HTTP)
    ├── WebMvcStatelessTransport
    └── WebFluxStatelessTransport
```

## Protocol Version Negotiation

The SDK supports multiple MCP protocol versions. During initialization, the
client and server negotiate the highest mutually supported version.

| Version | Release | Features |
|---------|---------|----------|
| `2024-11-05` | Original | Base protocol, tools, resources, prompts |
| `2025-03-26` | Streamable HTTP | Streamable HTTP transport, resumable streams |
| `2025-06-18` | Latest Stable | Stability improvements, bug fixes |
| `2025-11-25` | Future | Planned features |

### Version Configuration

The SDK auto-selects the highest supported version. To force a specific version:

```java
McpClient.SyncSpec spec = McpClient.sync()
    .protocolVersion("2025-06-18")
    .build()
    .sync();
```

## WebClient Streamable HTTP Transport

The `WebClientStreamableHttpTransport` provides a WebClient-based implementation
of the Streamable HTTP transport for MCP clients.

### Features

- **Resumable streams** — SSE event ID tracking for stream resumption
- **Protocol version negotiation** — Auto-selects highest supported version
- **Stateless mode** — No session ID required for stateless communication
- **Custom JSON mapper** — Configurable JSON serialization
- **Custom endpoint** — Configurable MCP endpoint path

### Configuration

```java
WebClientStreamableHttpTransport transport = WebClientStreamableHttpTransport.builder()
    .webClient(webClient)
    .url("http://localhost:8080/mcp")
    .resumable(true)
    .protocolVersion("2025-06-18")
    .jsonMapper(customMapper)
    .build();

McpSyncClient client = McpClient.sync(transport)
    .requestTimeout(Duration.ofSeconds(30))
    .build()
    .sync();
```

### Boot Starter Configuration

When using the WebFlux client starter (`spring-ai-starter-mcp-client-webflux`),
the WebClient-based transport is auto-configured:

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

## SSE Transport Details

### WebMVC SSE

- **Endpoint**: `/sse` (configurable via `spring.ai.mcp.server.sse-endpoint`)
- **Message endpoint**: `/mcp/message` (configurable via `spring.ai.mcp.server.sse-message-endpoint`)
- **Keep-alive**: Configurable via `spring.ai.mcp.server.keep-alive-interval`

### WebFlux SSE

Same configuration as WebMVC, but uses reactive WebFlux underneath.

## Streamable-HTTP Transport Details

### Server Configuration

- **MCP endpoint**: `/mcp` (configurable via `spring.ai.mcp.server.streamable-http.mcp-endpoint`)
- **Keep-alive**: Configurable via `spring.ai.mcp.server.streamable-http.keep-alive-interval`
- **Resumable streams**: Supported with SSE event ID tracking

### Client Configuration

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

## Stateless Transport Details

Stateless transport eliminates session management by treating each request
independently. Suitable for HTTP-based deployments where session state is
unwanted or impractical.

### Server Configuration

```yaml
spring:
  ai:
    mcp:
      server:
        protocol: STATELESS
```

### Client Configuration

Stateless clients connect without session negotiation:

```yaml
spring:
  ai:
    mcp:
      client:
        streamable-http:
          connections:
            my-server:
              url: http://localhost:8080
              stateless: true
```

## Header Utilities

Both WebFlux and WebMVC transports provide `HeaderUtils` for extracting headers
from MCP requests:

```java
// WebMVC
Map<String, List<String>> headers = HeaderUtils.extractHeadersFromHttpServletRequest(request);

// WebFlux
Map<String, List<String>> headers = HeaderUtils.extractHeadersFromServerHttpRequest(request);
```

Headers are used for:
- Correlation ID tracking
- Security token extraction
- Custom metadata passing

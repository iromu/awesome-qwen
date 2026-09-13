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

The transport layer handles message serialisation/deserialisation over different
protocols. The root contract is `io.modelcontextprotocol.spec.McpTransport`; its real
members are narrower than they look, and there is no `start()`/`stop()`/`onMessage()`
triple to implement:

```java
// io.modelcontextprotocol.spec
public interface McpTransport {
    Mono<Void> closeGracefully();
    Mono<Void> sendMessage(JSONRPCMessage message);
    <T> T unmarshalFrom(Object data, TypeRef<T> typeRef);

    default void close() { /* ... */ }
    default List<String> protocolVersions() { /* ... */ }
    static boolean isPeerClosed(Throwable t) { /* ... */ }
}
```

Two sub-contracts split the roles, and concrete transports implement one of these
rather than `McpTransport` directly:

```java
public interface McpClientTransport extends McpTransport {
    Mono<Void> connect(Function<Mono<McpSchema.JSONRPCMessage>,
                         Mono<McpSchema.JSONRPCMessage>> handler);
    default void setExceptionHandler(Consumer<Throwable> handler) { /* ... */ }
}

public interface McpServerTransport extends McpTransport { }
```

Server-side providers implement `McpServerTransportProvider` /
`McpServerTransportProviderBase`, and the streamable/stateless shapes have their own
contracts (`McpStreamableServerTransport`, `McpStreamableServerTransportProvider`,
`McpStatelessServerTransport`) — all in `io.modelcontextprotocol.spec`.

## Transport Hierarchy

Every name below is a real class at `v2.0.1`. Note that the interfaces live in
`io.modelcontextprotocol.spec` while the implementations live in the
`…client.transport` / `…server.transport` packages.

```
McpTransport (interface, io.modelcontextprotocol.spec)
├── McpClientTransport (interface)
│   ├── StdioClientTransport                      (STDIO)
│   ├── HttpClientSseClientTransport              (SSE, JDK HttpClient)
│   └── HttpClientStreamableHttpTransport         (Streamable HTTP, JDK HttpClient)
└── McpServerTransport (interface)
    ├── StdioServerTransportProvider              (STDIO)
    ├── HttpServletSseServerTransportProvider      (SSE, servlet)
    ├── HttpServletStreamableServerTransportProvider (Streamable HTTP, servlet)
    └── HttpServletStatelessServerTransport        (Stateless, servlet)
```

Spring AI contributes its own adapters on top, implementing the same contracts:

| Package | Classes |
|---------|---------|
| `org.springframework.ai.mcp.client.webflux.transport` | `WebFluxSseClientTransport`, `WebClientStreamableHttpTransport` |
| `org.springframework.ai.mcp.server.webflux.transport` | `WebFluxSseServerTransportProvider`, `WebFluxStreamableServerTransportProvider`, `WebFluxStatelessServerTransport` |
| `org.springframework.ai.mcp.server.webmvc.transport` | `WebMvcSseServerTransportProvider`, `WebMvcStreamableServerTransportProvider`, `WebMvcStatelessServerTransport` |

Names that do **not** exist upstream and should not be written: `StdioTransport`,
`SseTransport`, `StreamableHttpTransport`, `StatelessTransport`, `WebMvcSseTransport`,
`WebMvcStreamableHttpTransport`, `WebFluxStreamableHttpTransport`,
`WebMvcStatelessTransport`, `WebFluxStatelessTransport`. Server-side classes end in
`…ServerTransportProvider` (or `…ServerTransport` for the stateless one), and
client-side SSE/Streamable classes carry the `HttpClient` prefix.

## Protocol Version Negotiation

The SDK supports multiple MCP protocol versions. During initialization, the
client and server negotiate the highest mutually supported version.

| Constant | Wire value | Notes |
|----------|-----------|-------|
| `MCP_2024_11_05` | `2024-11-05` | Base protocol, tools, resources, prompts |
| `MCP_2025_03_26` | `2025-03-26` | Streamable HTTP transport, resumable streams |
| `MCP_2025_06_18` | `2025-06-18` | Stability improvements, bug fixes |
| `MCP_2025_11_25` | `2025-11-25` | Defined constant — not a placeholder or a future date |

All four are declared on `io.modelcontextprotocol.spec.ProtocolVersions`, which is a
`public interface` of `String` constants (so the fields are implicitly
`public static final`). `2025-11-25` is shipped and referenceable, so do not label it
"planned" or "future".

### Version Configuration

The SDK negotiates automatically, so most code sets nothing. To constrain what you
advertise, pass the list on the **transport builder** — the version list belongs to the
transport, not to `McpClient.SyncSpec`:

```java
McpClientTransport transport = HttpClientStreamableHttpTransport
    .builder("http://localhost:8080")
    .endpoint("/mcp")
    .supportedProtocolVersions(List.of(ProtocolVersions.MCP_2025_06_18))
    .build();

McpSyncClient client = McpClient.sync(transport)   // transport is required
    .requestTimeout(Duration.ofSeconds(30))
    .build();                                       // build() already yields McpSyncClient
```

`McpClient.sync(...)` has no no-argument overload — it takes an `McpClientTransport`
(`static SyncSpec sync(McpClientTransport transport)`), and `SyncSpec.build()` returns
`McpSyncClient` directly, so a trailing `.sync()` after `.build()` is wrong.

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

`builder(...)` takes a `WebClient.Builder` — there is no no-arg `builder()` and no
`url(...)`/`resumable(...)`/`protocolVersion(...)`/`webClient(...)` setter. The
available setters are `webClientBuilder(WebClient.Builder)`, `endpoint(String)`,
`resumableStreams(boolean)`, `openConnectionOnStartup(boolean)`,
`supportedProtocolVersions(List<String>)` and `jsonMapper(McpJsonMapper)`:

```java
WebClientStreamableHttpTransport transport = WebClientStreamableHttpTransport
    .builder(WebClient.builder())
    .endpoint("http://localhost:8080/mcp")
    .resumableStreams(true)
    .supportedProtocolVersions(List.of(ProtocolVersions.MCP_2025_06_18))
    .jsonMapper(customMapper)
    .build();

McpSyncClient client = McpClient.sync(transport)
    .requestTimeout(Duration.ofSeconds(30))
    .build();
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

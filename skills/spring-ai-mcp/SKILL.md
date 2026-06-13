---
name: spring-ai-mcp
description: >-
  Build production-ready Spring AI MCP (Model Context Protocol) servers and
  clients with Boot Starters, annotations, security, and testing. Use this
  skill whenever the user asks about Spring AI MCP, building MCP servers or
  clients, MCP annotations (@McpTool, @McpResource, @McpPrompt, @McpComplete,
  @McpLogging, @McpSampling, @McpElicitation, @McpProgress, @McpToolListChanged),
  MCP configuration, Spring AI 2.0 MCP migration, MCP security (OAuth 2.0,
  API keys), MCP testing, MCP customization (McpToolFilter, customizers,
  name prefix generators), MCP architecture, or MCP native image support.
  Trigger on any mention of MCP in a Spring context, even if the user says
  "model context protocol", "MCP server", "MCP client", "McpTool annotation",
  "MCP transport", "MCP Streamable-HTTP", "MCP STDIO", "MCP SSE", "tool
  filtering", "MCP customizer", "MCP native image", or wants to connect an AI
  model to external tools via MCP.
---

# Spring AI MCP

Build production-ready Spring AI MCP applications — servers that expose tools,
resources, and prompts to AI models, and clients that consume MCP servers.

## Architecture Overview

The Spring AI MCP SDK follows a **three-layer architecture**:

```
┌──────────────────────────────────────────────────────────────┐
│ CLIENT / SERVER LAYER                                       │
│ McpClient / McpServer — main application logic, protocol     │
│ operations (initialize, listTools, callTool, etc.)           │
├──────────────────────────────────────────────────────────────┤
│ SESSION LAYER                                               │
│ McpSession / McpClientSession / McpServerSession — manage    │
│ communication patterns, request/response correlation, state  │
├──────────────────────────────────────────────────────────────┤
│ TRANSPORT LAYER                                             │
│ McpTransport — JSON-RPC message serialization/deserialization│
│ STDIO, SSE, Streamable-HTTP, Stateless                       │
└──────────────────────────────────────────────────────────────┘
```

**Protocol version negotiation:** The SDK supports MCP protocol versions
`2024-11-05` (original), `2025-03-26` (Streamable HTTP), `2025-06-18` (latest
stable), and `2025-11-25` (future). Clients and servers negotiate the
highest mutually supported version during initialization.

## Quick Reference: Choose Your Starter

### Server Side

| Transport | Starter | Property |
|-----------|---------|----------|
| STDIO (in-process) | `spring-ai-starter-mcp-server` | `spring.ai.mcp.server.stdio=true` |
| SSE (WebMVC) | `spring-ai-starter-mcp-server-webmvc` | `spring.ai.mcp.server.protocol=SSE` |
| SSE (WebFlux) | `spring-ai-starter-mcp-server-webflux` | `spring.ai.mcp.server.protocol=SSE` |
| Streamable-HTTP (WebMVC) | `spring-ai-starter-mcp-server-webmvc` | `spring.ai.mcp.server.protocol=STREAMABLE` |
| Streamable-HTTP (WebFlux) | `spring-ai-starter-mcp-server-webflux` | `spring.ai.mcp.server.protocol=STREAMABLE` |
| Stateless (WebMVC) | `spring-ai-starter-mcp-server-webmvc` | `spring.ai.mcp.server.protocol=STATELESS` |
| Stateless (WebFlux) | `spring-ai-starter-mcp-server-webflux` | `spring.ai.mcp.server.protocol=STATELESS` |

### Client Side

| Type | Starter | Transport |
|------|---------|-----------|
| Sync (STDIO) | `spring-ai-starter-mcp-client` | STDIO, JDK HttpClient SSE/Streamable-HTTP |
| Sync (WebFlux) | `spring-ai-starter-mcp-client-webflux` | WebFlux SSE/Streamable-HTTP, WebClient Streamable-HTTP |
| Async (WebFlux) | `spring-ai-starter-mcp-client-webflux` | WebFlux SSE/Streamable-HTTP |

> **Spring AI 2.0:** Transport artifacts moved from `io.modelcontextprotocol.sdk`
> to `org.springframework.ai`. All transport classes relocated to
> `org.springframework.ai.mcp.*`. Requires MCP Java SDK 1.0.0+. See
> **Migration** section below for full details.

## Server: Annotated Tool Example

```java
@Service
public class WeatherService {

    @McpTool(name = "get-weather", description = "Get current weather for a location")
    public String getWeather(
            @McpToolParam(description = "City name", required = true) String city,
            @McpToolParam(description = "Unit: celsius or fahrenheit", required = false, defaultValue = "celsius") String unit) {
        // Implementation
        return String.format("Weather in %s: 22°C", city);
    }
}
```

Register via `ToolCallbackProvider`:

```java
@Bean
public ToolCallbackProvider weatherTools(WeatherService weatherService) {
    return MethodToolCallbackProvider.builder()
        .toolObjects(weatherService)
        .build();
}
```

### Tool Filtering

Filter discovered tools per connection by implementing `McpToolFilter`:

```java
@Component
public class RestrictedToolFilter implements McpToolFilter {
    @Override
    public boolean test(McpConnectionInfo connectionInfo, McpSchema.Tool tool) {
        // Block sensitive tools for unauthenticated connections
        if (!connectionInfo.initializeResult().capabilities().tools()) {
            return !tool.name().startsWith("admin-");
        }
        return true;
    }
}
```

See `references/mcp-customization.md` for full details on filtering, customizers,
and name prefix generation.

## Server: Resource, Prompt, and Completion

### Resource (URI template)

```java
@McpResource(uri = "config://{key}", name = "Configuration", description = "App config values")
public String getConfig(String key) {
    return configData.get(key);
}
```

### Prompt (template)

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

### Completion (autocompletion)

```java
@McpComplete(prompt = "city-search")
public List<String> completeCityName(String prefix) {
    return cities.stream()
        .filter(city -> city.toLowerCase().startsWith(prefix.toLowerCase()))
        .limit(10)
        .toList();
}
```

## Client: Connecting to an MCP Server

### Configuration (application.yml)

```yaml
spring:
  ai:
    mcp:
      client:
        streamable-http:
          connections:
            weather-server:
              url: http://localhost:8080
```

### Using MCP tools with ChatClient

```java
@Bean
public CommandLineRunner demo(ChatClient chatClient, ToolCallbackProvider mcpTools) {
    return args -> {
        String response = chatClient
            .prompt("What's the weather in Paris?")
            .tools(mcpTools)
            .call()
            .content();
        System.out.println(response);
    };
}
```

### Client Customization

Implement `McpCustomizer<McpClient.SyncSpec>` or `McpCustomizer<McpClient.AsyncSpec>`:

```java
@Component
public class CustomMcpClientCustomizer implements McpCustomizer<McpClient.SyncSpec> {
    @Override
    public void customize(String name, McpClient.SyncSpec spec) {
        spec.requestTimeout(Duration.ofSeconds(30));
        spec.roots(roots);
        spec.sampling((request) -> { /* handle sampling */ });
        spec.loggingConsumer((log) -> { /* handle logging */ });
    }
}
```

### Client Annotations (handling server requests)

```java
@Component
public class McpClientHandlers {

    @McpLogging(clients = "weather-server")
    public void handleLogging(LoggingMessageNotification notification) {
        System.out.println("Server log: " + notification.level() + " - " + notification.data());
    }

    @McpSampling(clients = "weather-server")
    public CreateMessageResult handleSampling(CreateMessageRequest request) {
        // Forward to LLM
        return llmClient.generate(request);
    }
}
```

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

### STDIO Configuration

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

### SSE Configuration

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

### Streamable-HTTP Configuration

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
```

## Special Parameters for Annotated Methods

| Parameter | Purpose | Supported In |
|-----------|---------|--------------|
| `McpSyncRequestContext` | Sync request context (logging, progress, sampling, roots) | Tool, Resource, Prompt, Complete |
| `McpAsyncRequestContext` | Async request context (reactive) | Tool, Resource, Prompt, Complete |
| `McpTransportContext` | Stateless transport context | Tool, Resource |
| `McpMeta` | Access MCP request metadata | Tool, Resource, Prompt |
| `@McpProgressToken` | Receive progress token (injected, excluded from JSON schema) | Tool, Resource |
| `CallToolRequest` | Dynamic schema for tools | Tool only |

## Method Filtering by Server Type

| Server Type | Accepts | Filters Out |
|-------------|---------|-------------|
| Sync Stateful | Non-reactive + `McpSyncRequestContext` | Reactive (Mono/Flux) |
| Async Stateful | Reactive (Mono/Flux) + `McpAsyncRequestContext` | Non-reactive |
| Sync Stateless | Non-reactive + no bidirectional context | Reactive OR bidirectional context |
| Async Stateless | Reactive + no bidirectional context | Non-reactive OR bidirectional context |

## Server Customization

Customize server behavior programmatically with customizer interfaces:

### Sync Server Customizer

```java
@Component
public class CustomSyncServerCustomizer implements McpSyncServerCustomizer {
    @Override
    public void customize(McpServer.SyncSpecification spec) {
        spec.requestTimeout(Duration.ofSeconds(30));
        spec.instructions("Custom server instructions for clients");
    }
}
```

### Async Server Customizer

```java
@Component
public class CustomAsyncServerCustomizer implements McpAsyncServerCustomizer {
    @Override
    public void customize(McpServer.AsyncSpecification spec) {
        spec.requestTimeout(Duration.ofSeconds(30));
    }
}
```

### Tool Name Prefix Generator

Control how MCP tool names are prefixed when registered as Spring AI tools:

```java
@Component
public class CustomPrefixGenerator implements McpToolNamePrefixGenerator {
    @Override
    public String prefixedToolName(McpConnectionInfo info, McpSchema.Tool tool) {
        return info.initializeResult().serverInfo().name() + "_" + tool.name();
    }
}
```

See `references/mcp-customization.md` for full details on all customization options.

## Security

> **⚠️ Security is Work In Progress.** The Spring AI MCP security features are
> marked as WIP. Server and client security artifacts live in the separate
> `org.springaicommunity` Maven group, not in the core Spring AI distribution.

### Server OAuth 2.0 (WebMVC only)

Requires `mcp-server-security` from `org.springaicommunity`.

```java
@Configuration
@EnableWebSecurity
class McpServerSecurity {
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http.authorizeHttpRequests(a -> a.anyRequest().authenticated())
            .with(McpServerOAuth2Configurer.mcpServerOAuth2(),
                m -> m.authorizationServer(issuerUrl))
            .build();
    }
}
```

### Client OAuth 2.0

Requires `mcp-client-security` from `org.springaicommunity`. Supports `McpSyncClient` only.

```java
@Bean
McpCustomizer<McpClient.SyncSpec> syncClientCustomizer() {
    return (name, spec) -> spec.transportContextProvider(
        new AuthenticationMcpTransportContextProvider());
}
```

See `references/security-and-testing.md` for full security patterns including API key auth,
tool-level security, and authorization flows.

## Testing MCP Applications

### Unit Testing Tools

Test annotated tool methods directly as plain Spring beans — no MCP server needed:

```java
@SpringBootTest
class WeatherServiceTest {

    @Autowired
    private WeatherService weatherService;

    @Test
    void getWeather_returnsExpectedFormat() {
        var result = weatherService.getWeather("Paris", "celsius");
        assertTrue(result.contains("Paris"));
        assertTrue(result.contains("°C"));
    }
}
```

### Testing with MCP Test Utilities

Use `@McpServerTest` and `@McpClientTest` annotations for integration testing:

```java
@SpringBootTest
@McpServerTest
class McpServerIntegrationTest {

    @Autowired
    private McpSyncServer mcpServer;

    @Test
    void serverExposesExpectedTools() {
        var tools = mcpServer.listTools(null).tools();
        assertThat(tools).extracting(McpSchema.Tool::name)
            .contains("get-weather", "get-forecast");
    }
}
```

### Testing MCP Clients

```java
@SpringBootTest
class McpClientTest {

    @Autowired
    private ToolCallbackProvider mcpTools;

    @Test
    void mcpToolsAreRegistered() {
        var toolNames = mcpTools.getToolNames();
        assertThat(toolNames).isNotEmpty();
    }
}
```

### Testing with Mocked MCP Servers

Use `MockMcpTransport` to create test clients without real processes:

```java
@Test
void testClientWithMockServer() {
    var mockTransport = new MockMcpTransport();
    var client = McpClient.sync(mockTransport)
        .requestTimeout(Duration.ofSeconds(5))
        .build()
        .sync();

    client.initialize(new InitializeRequest(...));
    var tools = client.listTools(null);
    assertThat(tools.tools()).hasSize(3);
}
```

### Key Testing Patterns

1. **Test tools as plain beans** — annotated methods are just methods; test them directly
2. **Use `@SpringBootTest`** for full integration tests with MCP server/client auto-config
3. **Mock transports** for isolated client/server tests without real processes
4. **Verify tool registration** — assert that `@McpTool` methods appear in the server's tool list
5. **Test request context** — verify that `McpSyncRequestContext` methods (logging, progress) work correctly
6. **Test security** — verify OAuth 2.0 and API key authentication on MCP endpoints

See `references/security-and-testing.md` for additional patterns: MockMVC testing,
Testcontainers with external MCP servers, annotation scanning, and security tests.

## GraalVM Native Image Support

Spring AI MCP includes AOT native image support via `McpHints`, a GraalVM runtime
hints registrar that registers all nested classes of `McpSchema` for reflection.
No manual configuration is needed — the hints are auto-registered when the MCP
starter is on the classpath.

See `references/mcp-aot-native.md` for details on native image considerations,
known limitations, and build configuration.

## Spring AI 2.0 Migration

Migrating from `io.modelcontextprotocol.sdk` to `org.springframework.ai`? Here's
what you need to know.

### Dependency Changes

| Old (MCP SDK 0.18.x) | New (Spring AI 2.0+) |
|----------------------|---------------------|
| `io.modelcontextprotocol.sdk:mcp` | `org.springframework.ai:spring-ai-mcp` |
| `io.modelcontextprotocol.sdk:mcp-server-webmvc` | `org.springframework.ai:spring-ai-starter-mcp-server-webmvc` |
| `io.modelcontextprotocol.sdk:mcp-server-webflux` | `org.springframework.ai:spring-ai-starter-mcp-server-webflux` |
| `io.modelcontextprotocol.sdk:mcp-client` | `org.springframework.ai:spring-ai-starter-mcp-client` |
| `io.modelcontextprotocol.sdk:mcp-client-webflux` | `org.springframework.ai:spring-ai-starter-mcp-client-webflux` |

### Package Relocations

| Old Package | New Package |
|-------------|-------------|
| `io.modelcontextprotocol.sdk.McpSchema` | `org.springframework.ai.mcp.McpSchema` |
| `io.modelcontextprotocol.sdk.McpClient` | `org.springframework.ai.mcp.McpClient` |
| `io.modelcontextprotocol.sdk.McpServer` | `org.springframework.ai.mcp.McpServer` |
| `io.modelcontextprotocol.sdk.McpSyncClient` | `org.springframework.ai.mcp.McpSyncClient` |
| `io.modelcontextprotocol.sdk.McpAsyncClient` | `org.springframework.ai.mcp.McpAsyncClient` |
| `io.modelcontextprotocol.sdk.transport.StdioClientTransport` | `org.springframework.ai.mcp.transport.StdioClientTransport` |
| `io.modelcontextprotocol.sdk.transport.SseClientTransport` | `org.springframework.ai.mcp.transport.SseClientTransport` |
| `io.modelcontextprotocol.sdk.transport.StreamableHttpTransport` | `org.springframework.ai.mcp.transport.StreamableHttpTransport` |

### Migration Checklist

- [ ] Update dependency group: `io.modelcontextprotocol.sdk` → `org.springframework.ai`
- [ ] Update all transport imports: `io.modelcontextprotocol.*` → `org.springframework.ai.mcp.*`
- [ ] Upgrade MCP SDK to 1.0.0+ (from 0.18.x)
- [ ] Auto-config users: only update `pom.xml`/`build.gradle` — no code changes needed
- [ ] Test that MCP clients initialize correctly on startup
- [ ] Verify tool callbacks still register with ChatClient
- [ ] If using security: add `mcp-server-security` or `mcp-client-security` from `org.springaicommunity`

## When to Read References

- **MCP Boot Starters & configuration** → `references/mcp-boot-starters.md`
- **MCP Annotations reference** → `references/mcp-annotations.md`
- **Security patterns (OAuth 2.0, API keys)** → `references/security-and-testing.md`
- **Testing patterns (MockMVC, Testcontainers, mocking)** → `references/security-and-testing.md`
- **Customization (filters, customizers, name prefixes)** → `references/mcp-customization.md`
- **Architecture (SDK layers, transports, protocol versions)** → `references/mcp-architecture.md`
- **GraalVM native image support** → `references/mcp-aot-native.md`

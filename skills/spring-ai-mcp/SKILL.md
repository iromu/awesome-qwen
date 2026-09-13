---
name: spring-ai-mcp
description: >-
  Build production-ready Spring AI MCP (Model Context Protocol) servers and
  clients with Boot Starters, annotations, security, and testing. Use this
  skill whenever the user asks about Spring AI MCP, building MCP servers or
  clients, MCP annotations (@McpTool, @McpResource, @McpPrompt, @McpComplete,
  @McpLogging, @McpSampling, @McpElicitation, @McpProgress, @McpProgressToken,
  @McpToolListChanged, @McpResourceListChanged, @McpPromptListChanged),
  MCP configuration, Spring AI 2.0 MCP migration, MCP security (OAuth 2.0,
  API keys), MCP testing, MCP customization (McpToolFilter, McpClientCustomizer,
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

> **Verified against** `spring-projects/spring-ai` `v2.0.1` and the MCP Java SDK
> `modelcontextprotocol/java-sdk` `v2.0.1` (spring-ai pins it via
> `<mcp.sdk.version>`). Identifier names and packages in this skill were checked
> against those tags; re-verify against the tag you actually build against, since
> the annotation and transport surface has moved between milestones.

## When to Use This Skill

| Scenario | What to Do |
|----------|-----------|
| Expose Java methods as MCP tools for AI models | Use `@McpTool` and `@McpToolParam` annotations on service methods |
| Build an MCP server with WebMVC or WebFlux | Pick the matching Boot Starter (webmvc or webflux) and set protocol |
| Connect a Spring app to an external MCP server | Use `spring-ai-starter-mcp-client` and configure connections |
| Integrate MCP tools with ChatClient for LLM calls | Auto-register `ToolCallbackProvider` beans and pass to `.tools()` |
| Secure MCP endpoints with OAuth 2.0 or API keys | Add `mcp-server-security` from `org.springaicommunity` and configure |
| Test MCP servers/clients in isolation | Plain JUnit 5 plus the published `mcp-test` module (`TestUtil`, `AbstractMcpSyncServerTests`) |
| Run in GraalVM native image | No manual config needed — `McpHints` auto-registers reflection |
| Migrate from MCP SDK 0.18.x to Spring AI 2.0 | Update group IDs, package imports, and SDK version (see Migration) |
| Filter tools per connection or customize behavior | Implement `McpToolFilter`, customizers, or name prefix generators |

## When NOT to Use This Skill

| Situation | Better Alternative |
|-----------|-------------------|
| Building a non-Spring MCP client | Use the raw MCP Java SDK (`io.modelcontextprotocol.sdk`) directly |
| Need TypeScript/Python MCP server | Use the official MCP SDK for those languages |
| Building a gRPC service instead of MCP | Use Spring Boot gRPC starter — MCP is for AI tool exposure, not general RPC |
| Simple REST API with no AI integration | Use standard Spring Boot REST controllers — MCP adds unnecessary overhead |
| Real-time WebSocket-only communication | Use Spring WebSocket or Spring AI's streaming — MCP is request/response oriented |
| Using a different AI framework (LangChain4j, LlamaIndex) | Use that framework's native MCP integration or bridge layer |

## Architecture Overview

The protocol machinery below lives in the **MCP Java SDK**
(`io.modelcontextprotocol.sdk`, packages `io.modelcontextprotocol.*`), which
Spring AI's own `org.springframework.ai.mcp.*` modules build on top of. It
follows a **three-layer architecture**:

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

All three layers are `io.modelcontextprotocol.*` types — `McpSession`,
`McpClientSession`, `McpServerSession` and `McpTransport` are defined in
`io.modelcontextprotocol.spec`, not relocated into `org.springframework.ai`.
Import them from the SDK; the Spring AI modules contribute the annotation
scanning, Boot auto-configuration and transport adapters instead.

**Protocol version negotiation:** `io.modelcontextprotocol.spec.ProtocolVersions`
(a `public interface` of `String` constants) defines `MCP_2024_11_05`,
`MCP_2025_03_26` (Streamable HTTP), `MCP_2025_06_18` and `MCP_2025_11_25`. Clients
and servers negotiate the highest mutually supported version during
initialization.

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

> **Spring AI 2.0:** Spring AI ships its own MCP modules under
> `org.springframework.ai` (annotations in `org.springframework.ai.mcp.annotation`,
> customizers in `org.springframework.ai.mcp.customizer`, plus the autoconfigure
> and starter artifacts), while the protocol types stay in the MCP Java SDK
> (`groupId io.modelcontextprotocol.sdk`, packages `io.modelcontextprotocol.*`).
> Spring AI `2.0.1` pins the SDK via `<mcp.sdk.version>` — check the root POM
> rather than hard-coding a version in your build. Nothing was relocated out of
> `io.modelcontextprotocol.*`, so keep those imports. See **Migration** below.

## Server: Annotated Tool Example

```java
@Service
public class WeatherService {

    @McpTool(name = "get-weather", description = "Get current weather for a location")
    public String getWeather(
            @McpToolParam(description = "City name") String city,
            @McpToolParam(description = "Unit: celsius or fahrenheit", required = false) String unit) {
        // @McpToolParam has no default value — handle a null/absent unit here
        String effectiveUnit = unit != null ? unit : "celsius";
        // Implementation
        return String.format("Weather in %s: 22°%s", city, effectiveUnit);
    }
}
```

`@McpToolParam` declares only `required` (defaulting to `true`) and `description`;
it has **no** `defaultValue` and **no** `name` attribute, so a parameter default has
to be applied inside the method body. Reserve `@McpArg` (which does carry `name`,
and whose `required` defaults to `false`) for `@McpPrompt` parameters — see
`references/mcp-annotations.md`.

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

Implement `McpClientCustomizer<B>` (`org.springframework.ai.mcp.customizer`) with
`B` bound to the client spec type you want to reach:

```java
@Component
public class CustomMcpClientCustomizer implements McpClientCustomizer<McpClient.SyncSpec> {
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
McpClientCustomizer<McpClient.SyncSpec> syncClientCustomizer() {
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

### Integration Testing

There is **no** MCP test-slice annotation — no `@McpServerTest` or `@McpClientTest`
exists upstream, so do not reach for one. `McpServerAutoConfiguration` publishes the
server as an ordinary `@Bean`, so a plain JUnit 5 `@SpringBootTest` injects it:

```java
@SpringBootTest
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

### Base classes from the published `mcp-test` module

For a server or client test that does not need the whole application context, extend
the bases shipped in `io.modelcontextprotocol.sdk:mcp-test`. You supply the
transport/builder and the base class drives start, stop and the assertions:

```java
@Timeout(15)
class WeatherServerTests extends AbstractMcpSyncServerTests {   // io.modelcontextprotocol.server

    @Override
    protected McpServer.SyncSpecification<?> prepareSyncServerBuilder() {
        return McpServer.sync(new StdioServerTransportProvider(JSON_MAPPER));
    }
}
```

| Base class | Package | Override you must provide |
|---|---|---|
| `AbstractMcpSyncServerTests` | `io.modelcontextprotocol.server` | `prepareSyncServerBuilder()` |
| `AbstractMcpAsyncServerTests` | `io.modelcontextprotocol.server` | `prepareAsyncServerBuilder()` |
| `AbstractMcpSyncClientTests` | `io.modelcontextprotocol.client` | `createMcpTransport()` |
| `AbstractMcpAsyncClientTests` | `io.modelcontextprotocol.client` | `createMcpTransport()` |
| `AbstractMcpClientServerIntegrationTests` | `io.modelcontextprotocol` (root, not `.server`) | both server builders + `getMcpClientBuilder()` |

Bind to a free port with `TestUtil.findAvailablePort()` (`io.modelcontextprotocol.server`)
rather than a fixed one, so parallel runs do not collide.

### Driving a client against a server

Build the client from a real transport — `McpClient.sync(...)` takes an
`McpClientTransport` and its `SyncSpec.build()` already yields an `McpSyncClient`,
so there is no extra `.sync()` call to chain:

```java
@Test
void testClientAgainstServer() {
    McpClientTransport transport = HttpClientStreamableHttpTransport
        .builder("http://localhost:" + TestUtil.findAvailablePort())
        .endpoint("/mcp")
        .connectTimeout(Duration.ofSeconds(5))
        .build();

    try (McpSyncClient client = McpClient.sync(transport)
            .requestTimeout(Duration.ofSeconds(5))
            .build()) {

        client.initialize(new InitializeRequest(...));
        var tools = client.listTools(null);
        assertThat(tools.tools()).hasSize(3);
    }
}
```

`HttpClientStreamableHttpTransport` has no public constructor for you to call — go
through `static Builder builder(String baseUri)`. The base URI is the builder
argument; the path is `.endpoint(...)`. Other setters on that builder are
`clientBuilder`, `customizeClient`, `requestBuilder`, `jsonMapper(McpJsonMapper)`,
`resumableStreams(boolean)`, `openConnectionOnStartup(boolean)`,
`httpRequestCustomizer`, `asyncHttpRequestCustomizer`, `authorizationErrorHandler`,
`supportedProtocolVersions(List<String>)` and `maxResponseSize` — note there is no
`url(...)`, no `resumable(...)` and no `protocolVersion(String)` on it.

The `MockMcpClientTransport` / `MockMcpServerTransport` classes you may see in the
SDK are under `src/test`, so they are **not** on a consumer's classpath and are not
a supported mocking seam — prefer the base classes above or the real transports.

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

Migrating from `io.modelcontextprotocol.sdk` to `org.springframework.ai`? See
`references/migration.md` for full dependency changes, package relocations, and
a step-by-step migration checklist.

## Pitfalls

| Pitfall | How to Avoid |
|---------|-------------|
| **Protocol types "not found" after upgrade** | They were never relocated — `McpClient`, `McpServer`, `McpSchema` and the transports stay in `io.modelcontextprotocol.*`. A missing type usually means the SDK is absent from the classpath or `mcp-test` was not added for the test scope |
| **Security features missing at runtime** | Add `mcp-server-security` or `mcp-client-security` from `org.springaicommunity` — they're not in core Spring AI |
| **OAuth 2.0 fails with SSE transport** | SSE is not supported for OAuth — use Streamable-HTTP or Stateless transport instead |
| **Tool not appearing in MCP server** | Verify `@McpTool` is on a Spring-managed bean and the bean is included in `ToolCallbackProvider` |
| **Async methods filtered out on sync server** | Sync servers only accept non-reactive methods; use `McpAsyncRequestContext` for async servers |
| **Native image reflection errors** | Ensure `spring-ai-mcp` starter is on the classpath — `McpHints` auto-registers nested `McpSchema` classes |
| **Multiple customizers conflict** | Use `@Order` to control precedence; later customizers can override earlier ones |
| **Tool name collisions across servers** | Implement `McpToolNamePrefixGenerator` to prefix tool names with server name |
| **STDIO server hangs on startup** | Verify the command path is correct and the server process starts within the request timeout |
| **Client timeout on long-running tools** | Increase `spring.ai.mcp.server.request-timeout` or `spring.ai.mcp.client.request-timeout` |

## When to Read References

- **Configuration properties, transport setup, special params** → `references/configuration.md`
- **MCP Boot Starters & protocol selection** → `references/mcp-boot-starters.md`
- **MCP Annotations reference** → `references/mcp-annotations.md`
- **Security patterns (OAuth 2.0, API keys)** → `references/security-and-testing.md`
- **Testing patterns (MockMVC, Testcontainers, mocking)** → `references/security-and-testing.md`
- **Customization (filters, customizers, name prefixes)** → `references/mcp-customization.md`
- **Architecture (SDK layers, transports, protocol versions)** → `references/mcp-architecture.md`
- **GraalVM native image support** → `references/mcp-aot-native.md`
- **Spring AI 2.0 migration guide** → `references/migration.md`

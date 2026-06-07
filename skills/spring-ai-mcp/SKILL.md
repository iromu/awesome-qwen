---
name: spring-ai-mcp
description: Build Spring AI MCP (Model Context Protocol) servers and clients with Boot Starters, annotations, security, and testing. Use this skill whenever the user asks about Spring AI MCP, building MCP servers or clients, MCP annotations (@McpTool, @McpResource, @McpPrompt, @McpComplete), MCP configuration, Spring AI 2.0 MCP migration, MCP security (OAuth 2.0, API keys), or MCP testing. Trigger on any mention of MCP in a Spring context, even if the user says "model context protocol", "MCP server", "MCP client", "McpTool annotation", or wants to connect an AI model to external tools via MCP.
---

# Spring AI MCP Skill

Build production-ready Spring AI MCP applications — servers that expose tools/resources/prompts to AI models, and clients that consume MCP servers.

## Quick Reference: Choose Your Starter

### Server Side

| Transport | Starter | Property |
|-----------|---------|----------|
| STDIO (in-process) | `spring-ai-starter-mcp-server` | `spring.ai.mcp.server.stdio=true` |
| SSE (WebMVC) | `spring-ai-starter-mcp-server-webmvc` | `spring.ai.mcp.server.protocol=SSE` |
| SSE (WebFlux) | `spring-ai-starter-mcp-server-webflux` | `spring.ai.mcp.server.protocol=SSE` |
| Streamable-HTTP (WebMVC) | `spring-ai-starter-mcp-server-webmvc` | `spring.ai.mcp.server.protocol=STREAMABLE` |
| Stateless (WebMVC) | `spring-ai-starter-mcp-server-webmvc` | `spring.ai.mcp.server.protocol=STATELESS` |
| Stateless (WebFlux) | `spring-ai-starter-mcp-server-webflux` | `spring.ai.mcp.server.protocol=STATELESS` |

### Client Side

| Type | Starter | Transport |
|------|---------|-----------|
| Sync | `spring-ai-starter-mcp-client` | STDIO, JDK HttpClient SSE/Streamable-HTTP |
| Async | `spring-ai-starter-mcp-client-webflux` | WebFlux SSE/Streamable-HTTP |

> **Spring AI 2.0:** Transport artifacts moved from `io.modelcontextprotocol.sdk` to `org.springframework.ai`. All transport classes relocated to `org.springframework.ai.mcp.*`. Requires MCP Java SDK 1.0.0+.

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

## Special Parameters for Annotated Methods

| Parameter | Purpose | Supported In |
|-----------|---------|--------------|
| `McpSyncRequestContext` | Sync request context (logging, progress, sampling, roots) | Tool, Resource, Prompt, Complete |
| `McpAsyncRequestContext` | Async request context (reactive) | Tool, Resource, Prompt, Complete |
| `McpTransportContext` | Stateless transport context | Tool, Resource |
| `McpMeta` | Access MCP request metadata | Tool, Resource, Prompt |
| `@McpProgressToken` | Receive progress token (injected, excluded from schema) | Tool, Resource |
| `CallToolRequest` | Dynamic schema for tools | Tool only |

## Method Filtering by Server Type

| Server Type | Accepts | Filters Out |
|-------------|---------|-------------|
| Sync Stateful | Non-reactive + `McpSyncRequestContext` | Reactive (Mono/Flux) |
| Async Stateful | Reactive (Mono/Flux) + `McpAsyncRequestContext` | Non-reactive |
| Sync Stateless | Non-reactive + no bidirectional context | Reactive OR bidirectional context |
| Async Stateless | Reactive + no bidirectional context | Non-reactive OR bidirectional context |

## Security

### Server OAuth 2.0 (WebMVC only)

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

```java
@Bean
McpCustomizer<McpClient.SyncSpec> syncClientCustomizer() {
    return (name, spec) -> spec.transportContextProvider(
        new AuthenticationMcpTransportContextProvider());
}
```

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

Use `McpClientTest` and `McpServerTest` annotations for integration testing:

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

Use `McpClientSpec` to create test clients pointing to mock transports:

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

### Testing Client Annotations

```java
@SpringBootTest
class McpClientHandlersTest {

    @Autowired
    private McpClientHandlers handlers;

    @Test
    void loggingHandler_processesNotification() {
        var notification = new LoggingMessageNotification(
            LoggingLevel.INFO, "Test log message");

        handlers.handleLoggingMessage(notification);

        // Verify the log was processed (check captured output, etc.)
    }
}
```

### Key Testing Patterns

1. **Test tools as plain beans** — annotated methods are just methods; test them directly
2. **Use `@SpringBootTest`** for full integration tests with MCP server/client auto-config
3. **Mock transports** for isolated client/server tests without real processes
4. **Verify tool registration** — assert that `@McpTool` methods appear in the server's tool list
5. **Test request context** — verify that `McpSyncRequestContext` methods (logging, progress) work correctly
6. **Test security** — verify OAuth 2.0 and API key authentication on MCP endpoints

## Spring AI 2.0 Migration Checklist

- [ ] Update dependency group: `io.modelcontextprotocol.sdk` → `org.springframework.ai`
- [ ] Update transport imports: `io.modelcontextprotocol.*` → `org.springframework.ai.mcp.*`
- [ ] Upgrade MCP SDK to 1.0.0+ (from 0.18.x)
- [ ] Auto-config users: only update `pom.xml`/`build.gradle`
- [ ] Test that MCP clients initialize correctly on startup
- [ ] Verify tool callbacks still register with ChatClient

## When to Read References

- **MCP Boot Starters details** → `references/mcp-boot-starters.md`
- **MCP Annotations reference** → `references/mcp-annotations.md`
- **Security patterns** → `references/mcp-security.md`
- **Testing patterns** → `references/mcp-testing.md`
- **Streamable-HTTP & Stateless** → `references/mcp-streamable-http.md`

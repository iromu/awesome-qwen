# MCP Security and Testing

## MCP Server Security (OAuth 2.0)

> **⚠️ Work In Progress.** MCP security features are marked as WIP. The security
> artifacts live in the separate `org.springaicommunity` Maven group, not in the
> core Spring AI distribution.

WebMVC servers only. Requires `mcp-server-security` from `org.springaicommunity`.

**Limitations:**
- SSE transport not supported — use Streamable HTTP or Stateless
- WebFlux servers not supported
- Opaque tokens not supported — use JWT

### Basic OAuth 2.0 Setup

```java
@Configuration
@EnableWebSecurity
class McpServerSecurity {

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUrl;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http.authorizeHttpRequests(a -> a.anyRequest().authenticated())
            .with(McpServerOAuth2Configurer.mcpServerOAuth2(), m -> {
                m.authorizationServer(issuerUrl);
                m.validateAudienceClaim(true);
            })
            .build();
    }
}
```

### Securing Tool Calls Only

Allow unauthenticated access to the MCP endpoint but require authentication for
tool execution:

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class McpServerSecurity {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http.authorizeHttpRequests(a -> {
                a.requestMatcher("/mcp").permitAll();
                a.anyRequest().authenticated();
            })
            .with(McpResourceServerConfigurer.mcpServerOAuth2(), m -> m.authorizationServer(issuerUrl))
            .build();
    }
}
```

Then annotate tools:
```java
@Service
public class MyTools {
    @PreAuthorize("isAuthenticated()")
    @McpTool(name = "greeter", description = "A greeting tool")
    public String greet(@ToolParam(description = "Language") String language) {
        return "Hello, " + SecurityContextHolder.getContext().getAuthentication().getName() + "!";
    }
}
```

### API Key Authentication

```java
@Configuration
@EnableWebSecurity
class McpServerSecurity {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http.authorizeHttpRequests(a -> a.anyRequest().authenticated())
            .with(mcpServerApiKey(), apiKey -> {
                apiKey.apiKeyRepository(apiKeyRepository());
                apiKey.headerName("CUSTOM-API-KEY");
            })
            .build();
    }

    private ApiKeyEntityRepository<ApiKeyEntityImpl> apiKeyRepository() {
        var apiKey = ApiKeyEntityImpl.builder()
            .name("test")
            .id("api01")
            .secret("mycustomapikey")
            .build();
        return new InMemoryApiKeyEntityRepository<>(List.of(apiKey));
    }
}
```

Call with header: `X-API-key: api01.mycustomapikey`

## MCP Client Security (OAuth 2.0)

Supports `McpSyncClient` only. Requires `mcp-client-security` from `org.springaicommunity`.

**Limitations:**
- WebFlux servers not supported
- Auto-config initializes clients at app start (workaround needed for user-based auth)
- SSE transport with HttpClient and WebClient

### HttpClient-Based Client

```java
@Bean
McpCustomizer<McpClient.SyncSpec> syncClientCustomizer() {
    return (name, spec) -> spec.transportContextProvider(
        new AuthenticationMcpTransportContextProvider());
}

@Bean
McpSyncHttpClientRequestCustomizer requestCustomizer(OAuth2AuthorizedClientManager manager) {
    return new OAuth2AuthorizationCodeSyncHttpRequestCustomizer(manager, "authserver");
}
```

### WebClient-Based Client

```java
@Bean
WebClient.Builder mcpWebClientBuilder(OAuth2AuthorizedClientManager manager) {
    return WebClient.builder().filter(
        new McpOAuth2AuthorizationCodeExchangeFilterFunction(manager, "authserver"));
}
```

### Authorization Flows

- **Authorization Code** — User-level permissions, request in user context
- **Client Credentials** — Machine-to-machine, no human in loop
- **Hybrid** — Both flows combined

## MCP Testing Patterns

### Unit Testing Tools

Test annotated tool methods directly as Spring beans — no MCP server needed:

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

    @Test
    void getWeather_withInvalidCity_returnsError() {
        var result = weatherService.getWeather("invalid", "celsius");
        assertTrue(result.contains("error") || result.contains("not found"));
    }
}
```

### Testing ToolCallbackProvider

```java
@SpringBootTest
class ToolCallbackProviderTest {

    @Autowired
    private ToolCallbackProvider toolProvider;

    @Test
    void toolProvider_exposesExpectedTools() {
        var tools = toolProvider.toolCallbacks();
        assertTrue(tools.size() > 0);
        var names = tools.stream().map(t -> t.getToolDefinition().name()).toList();
        assertTrue(names.contains("get-weather"));
    }
}
```

### Testing with MockMVC (WebMVC Server)

```java
@SpringBootTest
@AutoConfigureMockMvc
class McpServerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void mcpEndpoint_returnsOk() throws Exception {
        mockMvc.perform(get("/mcp"))
            .andExpect(status().isOk());
    }
}
```

### Testing Client Connections

```java
@SpringBootTest
class McpClientTest {

    @Autowired
    private ToolCallbackProvider mcpTools;

    @Autowired
    private ChatClient chatClient;

    @Test
    void chatClient_usesMcpTools() {
        var response = chatClient
            .prompt("What's the weather in Paris?")
            .tools(mcpTools)
            .call()
            .content();

        assertNotNull(response);
        assertFalse(response.isEmpty());
    }
}
```

### Testing with Testcontainers (External MCP Server)

```java
@SpringBootTest
class ExternalMcpServerTest {

    @TestConfiguration
    static class Config {
        @Bean
        McpCustomizer<McpClient.SyncSpec> customizer() {
            return (name, spec) -> spec
                .transportContextProvider(() -> new StdioMcpTransport(
                    List.of("npx", "-y", "@modelcontextprotocol/server-filesystem", "/tmp")));
        }
    }

    @Autowired
    private McpSyncClient mcpClient;

    @Test
    void client_connectsAndDiscoversTools() {
        var result = mcpClient.initialize(new McpSchema.InitializeRequest(
            new McpSchema.ClientSpecification("test-client", "1.0.0")));
        assertNotNull(result);
        assertEquals("test-client", result.protocolVersion());
    }
}
```

### Testing Annotations

```java
@SpringBootTest
class AnnotationScannerTest {

    @Autowired
    private ApplicationContext context;

    @Test
    void annotatedBeans_detected() {
        var services = context.getBeansWithAnnotation(Service.class);
        assertTrue(services.values().stream()
            .anyMatch(s -> s.getClass().getDeclaredMethods().stream()
                .anyMatch(m -> m.isAnnotationPresent(McpTool.class))));
    }
}
```

### Testing Security

```java
@SpringBootTest
@AutoConfigureMockMvc
class SecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void unauthenticatedRequest_returns401() throws Exception {
        mockMvc.perform(post("/mcp"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void authenticatedRequest_returns200() throws Exception {
        mockMvc.perform(post("/mcp")
            .header("Authorization", "Bearer valid-token"))
            .andExpect(status().isOk());
    }
}
```

### Testing with MockMcpTransport

Use `MockMcpTransport` for isolated client tests without a real server process:

```java
class MockTransportTest {

    @Test
    void testClientWithMockServer() {
        var mockTransport = new MockMcpTransport();
        var client = McpClient.sync(mockTransport)
            .requestTimeout(Duration.ofSeconds(5))
            .build()
            .sync();

        client.initialize(new InitializeRequest(
            new ClientSpecification("test-client", "1.0.0")));
        var tools = client.listTools(null);
        assertThat(tools.tools()).hasSize(3);
    }
}
```

### Testing with @McpServerTest / @McpClientTest

Use these test annotations for full integration testing with MCP auto-config:

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

```java
@SpringBootTest
@McpClientTest
class McpClientIntegrationTest {

    @Autowired
    private McpSyncClient mcpClient;

    @Test
    void client_connectsToServer() {
        var result = mcpClient.initialize(new InitializeRequest(
            new ClientSpecification("test-client", "1.0.0")));
        assertNotNull(result);
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
7. **Use `@McpServerTest` / `@McpClientTest`** for integration tests with auto-configured MCP components

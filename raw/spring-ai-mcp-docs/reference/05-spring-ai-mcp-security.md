# Spring AI MCP Security

Source: https://docs.spring.io/spring-ai/reference/index.html#mcp-security

> NOTE: This is still work in progress. The documentation and APIs may change in future releases.

The Spring AI MCP Security module provides comprehensive OAuth 2.0 and API key-based security support for Model Context Protocol implementations in Spring AI.

> NOTE: This module is part of the [spring-ai-community/mcp-security](https://github.com/spring-ai-community/mcp-security) project.
> This is a community-driven project and is not officially endorsed yet by Spring AI or the MCP project.

## Overview

The MCP Security module provides three main components:

- **MCP Server Security** - OAuth 2.0 resource server and API key authentication for Spring AI MCP servers
- **MCP Client Security** - OAuth 2.0 client support for Spring AI MCP clients
- **MCP Authorization Server** - Enhanced Spring Authorization Server with MCP-specific features

## MCP Server Security

The MCP Server Security module provides OAuth 2.0 resource server capabilities for Spring AI's MCP servers.
It also provides basic support for API-key based authentication.

**IMPORTANT:** This module is compatible with Spring WebMVC-based servers only.

### Dependencies

**Maven:**
```xml
<dependencies>
    <dependency>
        <groupId>org.springaicommunity</groupId>
        <artifactId>mcp-server-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <!-- OPTIONAL: For OAuth2 support -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
    </dependency>
</dependencies>
```

### OAuth 2.0 Configuration

**Basic OAuth 2.0 Setup:**

```java
@Configuration
@EnableWebSecurity
class McpServerConfiguration {

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUrl;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                .with(
                        McpServerOAuth2Configurer.mcpServerOAuth2(),
                        (mcpAuthorization) -> {
                            mcpAuthorization.authorizationServer(issuerUrl);
                            mcpAuthorization.validateAudienceClaim(true);
                        }
                )
                .build();
    }
}
```

### Securing Tool Calls Only

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class McpServerConfiguration {

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUrl;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .authorizeHttpRequests(auth -> {
                    auth.requestMatcher("/mcp").permitAll();
                    auth.anyRequest().authenticated();
                })
                .with(
                        McpResourceServerConfigurer.mcpServerOAuth2(),
                        (mcpAuthorization) -> mcpAuthorization.authorizationServer(issuerUrl)
                )
                .build();
    }
}
```

Then secure tool calls with `@PreAuthorize`:
```java
@Service
public class MyToolsService {

    @PreAuthorize("isAuthenticated()")
    @McpTool(name = "greeter", description = "A tool that greets you")
    public String greet(@ToolParam(description = "Language") String language) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return "Hello, " + authentication.getName() + "!";
    }
}
```

### API Key Authentication

```java
@Configuration
@EnableWebSecurity
class McpServerConfiguration {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http.authorizeHttpRequests(authz -> authz.anyRequest().authenticated())
                .with(
                        mcpServerApiKey(),
                        (apiKey) -> {
                            apiKey.apiKeyRepository(apiKeyRepository());
                            apiKey.headerName("CUSTOM-API-KEY");
                        }
                )
                .build();
    }

    private ApiKeyEntityRepository<ApiKeyEntityImpl> apiKeyRepository() {
        var apiKey = ApiKeyEntityImpl.builder()
                .name("test api key")
                .id("api01")
                .secret("mycustomapikey")
                .build();
        return new InMemoryApiKeyEntityRepository<>(List.of(apiKey));
    }
}
```

Call with header: `X-API-key: api01.mycustomapikey`

### Known Limitations

- Deprecated SSE transport is not supported. Use Streamable HTTP or Stateless transport.
- WebFlux-based servers are not supported.
- Opaque tokens are not supported. Use JWT.

## MCP Client Security

The MCP Client Security module provides OAuth 2.0 support for Spring AI's MCP clients, supporting both HttpClient-based and WebClient-based clients.

**IMPORTANT:** This module supports `McpSyncClient` only.

### Dependencies

**Maven:**
```xml
<dependency>
    <groupId>org.springaicommunity</groupId>
    <artifactId>mcp-client-security</artifactId>
</dependency>
```

### Authorization Flows

- **Authorization Code Flow** - For user-level permissions when every MCP request is made within user context
- **Client Credentials Flow** - For machine-to-machine use cases where no human is in the loop
- **Hybrid Flow** - Combines both flows for scenarios where some operations happen without a user present

### HttpClient-Based Clients

```java
@Configuration
class McpConfiguration {

    @Bean
    McpCustomizer<McpClient.SyncSpec> syncClientCustomizer() {
        return (name, syncSpec) ->
                syncSpec.transportContextProvider(
                        new AuthenticationMcpTransportContextProvider()
                );
    }

    @Bean
    McpSyncHttpClientRequestCustomizer requestCustomizer(
            OAuth2AuthorizedClientManager clientManager
    ) {
        return new OAuth2AuthorizationCodeSyncHttpRequestCustomizer(
                clientManager,
                "authserver"
        );
    }
}
```

### WebClient-Based Clients

```java
@Configuration
class McpConfiguration {

    @Bean
    McpCustomizer<McpClient.SyncSpec> syncClientCustomizer() {
        return (name, syncSpec) ->
                syncSpec.transportContextProvider(
                        new AuthenticationMcpTransportContextProvider()
                );
    }

    @Bean
    WebClient.Builder mcpWebClientBuilder(OAuth2AuthorizedClientManager clientManager) {
        return WebClient.builder().filter(
                new McpOAuth2AuthorizationCodeExchangeFilterFunction(
                        clientManager,
                        "authserver"
                )
        );
    }
}
```

### Known Limitations

- Spring WebFlux servers are not supported.
- Spring AI autoconfiguration initializes MCP clients at app start, requiring workarounds for user-based authentication.
- The client implementation supports the SSE transport with both `HttpClient` and `WebClient`.

## MCP Authorization Server

The MCP Authorization Server module enhances Spring Security's OAuth 2.0 Authorization Server with MCP-specific features.

### Dependencies

**Maven:**
```xml
<dependency>
    <groupId>org.springaicommunity</groupId>
    <artifactId>mcp-authorization-server</artifactId>
</dependency>
```

### Configuration

```java
@Bean
SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
            .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
            .with(McpAuthorizationServerConfigurer.mcpAuthorizationServer(), withDefaults())
            .formLogin(withDefaults())
            .build();
}
```

### Known Limitations

- Spring WebFlux servers are not supported.
- Every client supports ALL `resource` identifiers.

## Additional Resources

- [MCP Security GitHub Repository](https://github.com/spring-ai-community/mcp-security)
- [Sample Applications](https://github.com/spring-ai-community/mcp-security/tree/main/samples)
- [MCP Authorization Specification](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization#communication-security)

# Getting Started with Spring AI MCP

Source: https://docs.spring.io/spring-ai/reference/guides.html#getting-started-with-mcp

The Model Context Protocol (MCP) standardizes how AI applications interact with external tools and resources.

Spring joined the MCP ecosystem early as a key contributor, helping to develop and maintain the [official MCP Java SDK](https://github.com/modelcontextprotocol/java-sdk) that serves as the foundation for Java-based MCP implementations.
Building on this contribution, Spring AI provides MCP support through Boot Starters and annotations, making it easy to build both MCP servers and clients.

## Introduction Video

**[Introduction to Model Context Protocol (MCP) - YouTube](https://www.youtube.com/watch?v=FLpS7OfD5-s)**

Start here for an introductory overview of the Model Context Protocol, explaining core concepts and architecture.

## Complete Tutorial and Source Code

**📖 Blog Tutorial:** [Connect Your AI to Everything](https://spring.io/blog/2025/09/16/spring-ai-mcp-intro-blog)

**💻 Complete Source Code:** [MCP Weather Example Repository](https://github.com/tzolov/spring-ai-mcp-blogpost)

The tutorial covers the essentials of MCP development with Spring AI, including advanced features, and deployment patterns.
All code examples below are taken from this tutorial.

## Quick Start

### Simple MCP Server

```java
@Service
public class WeatherService {

    @McpTool(description = "Get current temperature for a location")
    public String getTemperature(
            @McpToolParam(description = "City name", required = true) String city) {
        return String.format("Current temperature in %s: 22°C", city);
    }
}
```

Add the dependency and configure:

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-mcp-server-webmvc</artifactId>
</dependency>
```

```properties
spring.ai.mcp.server.protocol=STREAMABLE
```

### Simple MCP Client

```java
@Bean
public CommandLineRunner demo(ChatClient chatClient, ToolCallbackProvider mcpTools) {
    return args -> {
        String response = chatClient
            .prompt("What's the weather like in Paris?")
            .tools(mcpTools)
            .call()
            .content();
        System.out.println(response);
    };
}
```

Add the dependency and configure:

```xml
<dependency>
  <groupId>org.springframework.ai</groupId>
  <artifactId>spring-ai-starter-mcp-client</artifactId>
</dependency>
```

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

## Learning Resources

### Implementation Video

**[Spring AI Model Context Protocol (MCP) Integration - YouTube](https://www.youtube.com/watch?v=hmEVUtulHTI)**

A video walkthrough of Spring AI's MCP integration, covering both server and client implementations.

## Additional Examples Repository

Beyond the tutorial examples, the [Spring AI Examples](https://github.com/spring-projects/spring-ai-examples/tree/main/model-context-protocol) repository contains numerous MCP implementations.

### Recommended Starting Points

**Annotation-based examples:**
- [Complete Annotations Example](https://github.com/spring-projects/spring-ai-examples/tree/main/model-context-protocol/mcp-annotations/) - All annotation features (Client & Server)
- [Sampling with Annotations](https://github.com/spring-projects/spring-ai-examples/tree/main/model-context-protocol/sampling/annotations/) - Advanced bidirectional AI (Client & Server)
- [MCP Weather Tutorial](https://github.com/tzolov/spring-ai-mcp-blogpost) - Full tutorial source code (Client & Server)

### By Use Case

**Weather Services:**
- [WebFlux Weather Server](https://github.com/spring-projects/spring-ai-examples/tree/main/model-context-protocol/weather/starter-webflux-server)
- [OAuth2 Secured Weather Server](https://github.com/spring-projects/spring-ai-examples/tree/main/model-context-protocol/weather/starter-webmvc-oauth2-server)

**Data Integration:**
- [SQLite AI Chatbot](https://github.com/spring-projects/spring-ai-examples/tree/main/model-context-protocol/sqlite/chatbot)
- [Filesystem Access Server](https://github.com/spring-projects/spring-ai-examples/tree/main/model-context-protocol/filesystem)

**Web Integration:**
- [Brave Search Chatbot](https://github.com/spring-projects/spring-ai-examples/tree/main/model-context-protocol/web-search/brave-chatbot)

**Client Examples:**
- [Basic MCP Client](https://github.com/spring-projects/spring-ai-examples/tree/main/model-context-protocol/client-starter/starter-default-client)
- [Annotations Client](https://github.com/spring-projects/spring-ai-examples/tree/main/model-context-protocol/mcp-annotations/mcp-annotations-client)

## Community Resources

- [Awesome Spring AI](https://github.com/spring-ai-community/awesome-spring-ai) - Community examples and resources
- [Official MCP Specification](https://modelcontextprotocol.org/)
- [Official MCP Java SDK](https://github.com/modelcontextprotocol/java-sdk) - Java SDK developed by the Spring team
- [MCP Java SDK Documentation](https://modelcontextprotocol.io/sdk/java/mcp-overview)

## Reference Documentation

- [MCP Overview and Architecture](spring-ai-mcp-overview.md)
- [MCP Annotations Guide](spring-ai-mcp-annotations.md)
- [Server Boot Starters](spring-ai-mcp-server-boot-starters.md)
- [Client Boot Starters](spring-ai-mcp-client-boot-starters.md)

# Spring AI MCP Client Boot Starter

Source: https://docs.spring.io/spring-ai/reference/index.html#mcp-client-boot-starters

The Spring AI MCP (Model Context Protocol) Client Boot Starter provides auto-configuration for MCP client functionality in Spring Boot applications.
It supports both synchronous and asynchronous client implementations with various transport options.

## Starters

### Standard MCP Client

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-mcp-client</artifactId>
</dependency>
```

The standard starter connects simultaneously to one or more MCP servers over `STDIO` (in-process), `SSE`, `Streamable-HTTP` and `Stateless Streamable-HTTP` transports.
The SSE and Streamable-Http transports use the JDK HttpClient-based transport implementation.
Each connection to an MCP server creates a new MCP client instance.
You can choose either `SYNC` or `ASYNC` MCP clients (note: you cannot mix sync and async clients).
For production deployment, we recommend using the WebFlux-based SSE & StreamableHttp connection with the `spring-ai-starter-mcp-client-webflux`.

### WebFlux Client

The WebFlux starter provides similar functionality to the standard starter but uses a WebFlux-based Streamable-Http, Stateless Streamable-Http and SSE transport implementation.

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-mcp-client-webflux</artifactId>
</dependency>
```

## Configuration Properties

### Common Properties

The common properties are prefixed with `spring.ai.mcp.client`:

| Property | Description | Default Value |
|----------|-------------|---------------|
| `enabled` | Enable/disable the MCP client | `true` |
| `name` | Name of the MCP client instance | `spring-ai-mcp-client` |
| `version` | Version of the MCP client instance | `1.0.0` |
| `initialized` | Whether to initialize clients on creation | `true` |
| `request-timeout` | Timeout duration for MCP client requests | `20s` |
| `type` | Client type (SYNC or ASYNC). All clients must be either sync or async; mixing is not supported | `SYNC` |
| `root-change-notification` | Enable/disable root change notifications for all clients | `true` |
| `toolcallback.enabled` | Enable/disable the MCP tool callback integration with Spring AI's tool execution framework | `true` |

### MCP Annotations Properties

MCP Client Annotations provide a declarative way to implement MCP client handlers using Java annotations.
The client mcp-annotations properties are prefixed with `spring.ai.mcp.client.annotation-scanner`:

| Property | Description | Default Value |
|----------|-------------|---------------|
| `enabled` | Enable/disable the MCP client annotations auto-scanning | `true` |

### Stdio Transport Properties

Properties for Standard I/O transport are prefixed with `spring.ai.mcp.client.stdio`:

| Property | Description | Default Value |
|----------|-------------|---------------|
| `servers-configuration` | Resource containing the MCP servers configuration in JSON format | `-` |
| `connections` | Map of named stdio connection configurations | `-` |
| `connections.[name].command` | The command to execute for the MCP server | `-` |
| `connections.[name].args` | List of command arguments | `-` |
| `connections.[name].env` | Map of environment variables for the server process | `-` |

**Example configuration:**
```yaml
spring:
  ai:
    mcp:
      client:
        stdio:
          root-change-notification: true
          connections:
            server1:
              command: /path/to/server
              args:
                - --port=8080
                - --mode=production
              env:
                API_KEY: your-api-key
                DEBUG: "true"
```

**Alternatively, configure stdio connections using an external JSON file using the Claude Desktop format:**
```yaml
spring:
  ai:
    mcp:
      client:
        stdio:
          servers-configuration: classpath:mcp-servers.json
```

The Claude Desktop format looks like this:
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/username/Desktop",
        "/Users/username/Downloads"
      ]
    }
  }
}
```

### Windows STDIO Configuration

**IMPORTANT:** On Windows, commands like `npx`, `npm`, and `node` are implemented as **batch files** (`.cmd`), not native executables. Java's `ProcessBuilder` cannot execute batch files directly and requires the `cmd.exe /c` wrapper.

**Windows Configuration:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "cmd.exe",
      "args": [
        "/c",
        "npx",
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\username\\Desktop"
      ]
    }
  }
}
```

**Linux/macOS Configuration:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/username/Desktop"
      ]
    }
  }
}
```

### Streamable-HTTP Transport Properties

Properties for Streamable-HTTP transport are prefixed with `spring.ai.mcp.client.streamable-http`:

| Property | Description | Default Value |
|----------|-------------|---------------|
| `connections` | Map of named Streamable-HTTP connection configurations | `-` |
| `connections.[name].url` | Base URL endpoint for Streamable-Http communication with the MCP server | `-` |
| `connections.[name].endpoint` | The streamable-http endpoint (as url suffix) to use for the connection | `/mcp` |

**Example configuration:**
```yaml
spring:
  ai:
    mcp:
      client:
        streamable-http:
          connections:
            server1:
              url: http://localhost:8080
            server2:
              url: http://otherserver:8081
              endpoint: /custom-sse
```

### SSE Transport Properties

Properties for Server-Sent Events (SSE) transport are prefixed with `spring.ai.mcp.client.sse`:

| Property | Description | Default Value |
|----------|-------------|---------------|
| `connections` | Map of named SSE connection configurations | `-` |
| `connections.[name].url` | Base URL endpoint for SSE communication with the MCP server | `-` |
| `connections.[name].sse-endpoint` | The sse endpoint (as url suffix) to use for the connection | `/sse` |

**Example configurations:**
```yaml
spring:
  ai:
    mcp:
      client:
        sse:
          connections:
            # Simple configuration using default /sse endpoint
            server1:
              url: http://localhost:8080
            # Custom SSE endpoint
            server2:
              url: http://otherserver:8081
              sse-endpoint: /custom-sse
            # Complex URL with path and token (like MCP Hub)
            mcp-hub:
              url: http://localhost:3000
              sse-endpoint: /mcp-hub/sse/cf9ec4527e3c4a2cbb149a85ea45ab01
            # SSE endpoint with query parameters
            api-server:
              url: https://api.example.com
              sse-endpoint: /v1/mcp/events?token=abc123&format=json
```

## Features

### Sync/Async Client Types

- **Synchronous** - default client type (`spring.ai.mcp.client.type=SYNC`), suitable for traditional request-response patterns with blocking operations
- **Asynchronous** - suitable for reactive applications with non-blocking operations, configured using `spring.ai.mcp.client.type=ASYNC`

### Client Customization

The auto-configuration provides extensive client spec customization capabilities through callback interfaces.

**Customization options:**
- **Request Configuration** - Set custom request timeouts
- **Custom Sampling Handlers** - Standardized way for servers to request LLM sampling from clients
- **File system (Roots) Access** - Standardized way for clients to expose filesystem roots to servers
- **Elicitation Handlers** - Standardized way for servers to request additional information from users
- **Event Handlers** - Tools change, Resources change, Prompts change, Logging, Progress

**Sync Customizer Example:**
```java
@Component
public class CustomMcpSyncClientCustomizer implements McpCustomizer<McpClient.SyncSpec> {
    @Override
    public void customize(String serverConfigurationName, McpClient.SyncSpec spec) {
        spec.requestTimeout(Duration.ofSeconds(30));
        spec.roots(roots);
        spec.sampling((CreateMessageRequest messageRequest) -> {
            // Handle sampling
            return result;
        });
        spec.elicitation((ElicitRequest request) -> {
            return new ElicitResult(ElicitResult.Action.ACCEPT, Map.of("message", request.message()));
        });
        spec.progressConsumer((ProgressNotification progress) -> {
            // Handle progress notifications
        });
        spec.toolsChangeConsumer((List<McpSchema.Tool> tools) -> {
            // Handle tools change
        });
        spec.resourcesChangeConsumer((List<McpSchema.Resource> resources) -> {
            // Handle resources change
        });
        spec.promptsChangeConsumer((List<McpSchema.Prompt> prompts) -> {
            // Handle prompts change
        });
        spec.loggingConsumer((McpSchema.LoggingMessageNotification log) -> {
            // Handle log messages
        });
    }
}
```

### Tool Filtering

The MCP Client Boot Starter supports filtering of discovered tools through the `McpToolFilter` interface.

```java
@Component
public class CustomMcpToolFilter implements McpToolFilter {

    @Override
    public boolean test(McpConnectionInfo connectionInfo, McpSchema.Tool tool) {
        // Filter logic based on connection information and tool properties
        if (connectionInfo.clientInfo().name().equals("restricted-client")) {
            return false;
        }
        if (tool.name().startsWith("allowed_")) {
            return true;
        }
        if (tool.description() != null &&
            tool.description().contains("experimental")) {
            return false;
        }
        return true;
    }
}
```

### Tool Name Prefix Generation

The MCP Client Boot Starter supports customizable tool name prefix generation through the `McpToolNamePrefixGenerator` interface.

**Custom prefix generator:**
```java
@Component
public class CustomToolNamePrefixGenerator implements McpToolNamePrefixGenerator {

    @Override
    public String prefixedToolName(McpConnectionInfo connectionInfo, Tool tool) {
        String serverName = connectionInfo.initializeResult().serverInfo().name();
        String serverVersion = connectionInfo.initializeResult().serverInfo().version();
        return serverName + "_v" + serverVersion.replace(".", "_") + "_" + tool.name();
    }
}
```

### MCP Client Annotations

The MCP Client Boot Starter automatically detects and registers annotated methods for handling various MCP client operations:

- `@McpLogging` - Handles logging message notifications from MCP servers
- `@McpSampling` - Handles sampling requests
- `@McpElicitation` - Handles elicitation requests
- `@McpProgress` - Handles progress notifications
- `@McpToolListChanged` - Handles tool list change notifications
- `@McpResourceListChanged` - Handles resource list change notifications
- `@McpPromptListChanged` - Handles prompt list change notifications

**Example usage:**
```java
@Component
public class McpClientHandlers {

    @McpLogging(clients = "server1")
    public void handleLoggingMessage(LoggingMessageNotification notification) {
        System.out.println("Received log: " + notification.level() +
                          " - " + notification.data());
    }

    @McpSampling(clients = "server1")
    public CreateMessageResult handleSamplingRequest(CreateMessageRequest request) {
        // Process the request
    }
}
```

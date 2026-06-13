# MCP Customization Reference

## McpToolFilter

Filter discovered MCP tools per connection. Implement `McpToolFilter` as a Spring
component to control which tools are registered for which clients.

```java
@Component
public class CustomMcpToolFilter implements McpToolFilter {

    @Override
    public boolean test(McpConnectionInfo connectionInfo, McpSchema.Tool tool) {
        // Filter logic — return true to include, false to exclude
        return true;
    }
}
```

The filter is invoked by `SyncMcpToolCallbackProvider` and
`AsyncMcpToolCallbackProvider` during tool registration. It receives both the
connection context and the tool definition, enabling context-aware filtering.

### Example: Block Admin Tools for Non-Authenticated Clients

```java
@Component
public class AdminToolFilter implements McpToolFilter {

    @Override
    public boolean test(McpConnectionInfo connectionInfo, McpSchema.Tool tool) {
        // If the client doesn't support tools (e.g., it's a resource-only client),
        // or if the tool is admin-related, block it
        if (!connectionInfo.initializeResult().capabilities().tools()) {
            return false;
        }
        return !tool.name().startsWith("admin-");
    }
}
```

## McpConnectionInfo

A record that provides context about an MCP connection. Used by tool filters,
name prefix generators, and customizers.

```java
public record McpConnectionInfo(
    String connectionName,
    McpSchema.ClientInfo clientInfo,
    McpSchema.ServerInfo serverInfo,
    McpSchema.Capabilities clientCapabilities,
    McpSchema.Capabilities serverCapabilities,
    InitializeResult initializeResult
) {}
```

### Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `connectionName` | `String` | The connection name from configuration (e.g., `weather-server`) |
| `clientInfo` | `McpSchema.ClientInfo` | Client name and version |
| `serverInfo` | `McpSchema.ServerInfo` | Server name and version |
| `clientCapabilities` | `McpSchema.Capabilities` | Client's declared capabilities |
| `serverCapabilities` | `McpSchema.Capabilities` | Server's declared capabilities |
| `initializeResult` | `InitializeResult` | Full initialization result from the connection |

## McpToolNamePrefixGenerator

Control how MCP tool names are prefixed when registered as Spring AI tools.
By default, tools are registered with their raw MCP names. Implement this
interface to add prefixes (e.g., server name) for disambiguation.

```java
@Component
public class CustomPrefixGenerator implements McpToolNamePrefixGenerator {
    @Override
    public String prefixedToolName(McpConnectionInfo info, McpSchema.Tool tool) {
        return info.initializeResult().serverInfo().name() + "_" + tool.name();
    }
}
```

## McpToolsChangedEvent

Spring event published when tools change on an MCP connection. Listen for this
event to react to tool list changes:

```java
@Component
public class ToolChangeHandler {

    @EventListener
    public void onToolsChanged(McpToolsChangedEvent event) {
        var tools = event.getTools();
        System.out.println("Tools changed on " + event.getConnectionName() + ": " + tools.size() + " tools");
    }
}
```

## Server Customizers

Customize server behavior programmatically with customizer interfaces.

### McpSyncServerCustomizer

Customize synchronous server configurations:

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

### McpAsyncServerCustomizer

Customize asynchronous server configurations:

```java
@Component
public class CustomAsyncServerCustomizer implements McpAsyncServerCustomizer {
    @Override
    public void customize(McpServer.AsyncSpecification spec) {
        spec.requestTimeout(Duration.ofSeconds(30));
    }
}
```

## Client Customizers

Customize client behavior with `McpCustomizer<B>` where `B` is the client spec type.

### Sync Client Customizer

```java
@Component
public class CustomSyncClientCustomizer implements McpCustomizer<McpClient.SyncSpec> {
    @Override
    public void customize(String name, McpClient.SyncSpec spec) {
        spec.requestTimeout(Duration.ofSeconds(30));
        spec.roots(roots);
        spec.sampling((request) -> { /* handle sampling */ });
        spec.elicitation((request) -> { /* handle elicitation */ });
        spec.progressConsumer((progress) -> { /* handle progress */ });
        spec.toolsChangeConsumer((tools) -> { /* handle tools change */ });
        spec.resourcesChangeConsumer((resources) -> { /* handle resources change */ });
        spec.promptsChangeConsumer((prompts) -> { /* handle prompts change */ });
        spec.loggingConsumer((log) -> { /* handle logging */ });
    }
}
```

### Async Client Customizer

```java
@Component
public class CustomAsyncClientCustomizer implements McpCustomizer<McpClient.AsyncSpec> {
    @Override
    public void customize(String name, McpClient.AsyncSpec spec) {
        spec.requestTimeout(Duration.ofSeconds(30));
        // Same consumers available as sync, but with reactive types
    }
}
```

### Multiple Customizers

Multiple customizer beans can be registered. They are applied in order of
`@Order` or bean name. Use `@Order` to control precedence:

```java
@Component
@Order(1)
public class FirstCustomizer implements McpCustomizer<McpClient.SyncSpec> {
    @Override
    public void customize(String name, McpClient.SyncSpec spec) {
        // Applied first
    }
}

@Component
@Order(2)
public class SecondCustomizer implements McpCustomizer<McpClient.SyncSpec> {
    @Override
    public void customize(String name, McpClient.SyncSpec spec) {
        // Applied second, can override first
    }
}
```

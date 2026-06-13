# GraalVM Native Image Support

Spring AI MCP includes AOT native image support via `McpHints`, a GraalVM runtime
hints registrar that automatically registers all nested classes of `McpSchema`
for reflection.

## Automatic Registration

When the MCP starter is on the classpath, `McpHints` is auto-registered as a
runtime hints registrar. No manual configuration is needed.

```java
// McpHints.java — auto-registered by Spring Boot AOT
public class McpHints implements RuntimeHintsRegistrar {

    @Override
    public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
        // Registers all nested classes of McpSchema for reflection
        // and JSON serialization
    }
}
```

## What Gets Registered

The `McpSchema` class hierarchy includes all MCP protocol types:

- `InitializeRequest`, `InitializeResult`, `InitializeError`
- `ListToolsRequest`, `ListToolsResult`, `Tool`, `ToolResult`
- `CallToolRequest`, `CallToolResult`, `TextContent`, `ImageContent`, `EmbeddedResource`
- `ListResourcesRequest`, `ListResourcesResult`, `Resource`, `ResourceContents`
- `ReadResourceRequest`, `ReadResourceResult`, `TextResourceContents`, `BlobResourceContents`
- `ListPromptsRequest`, `ListPromptsResult`, `Prompt`, `PromptMessage`, `TextContent`
- `GetPromptRequest`, `GetPromptResult`
- `ListResourceTemplatesRequest`, `ListResourceTemplatesResult`, `ResourceTemplate`
- `SubscribeRequest`, `UnsubscribeRequest`
- `Notification` types: `LoggingMessageNotification`, `ProgressNotification`, `ResourcesChangeNotification`, `PromptsChangeNotification`, `ToolListChangedNotification`
- `SamplingRequest`, `SamplingResult`, `CreateMessageRequest`, `CreateMessageResult`
- `ElicitRequest`, `ElicitResult`
- All nested schema classes

## Build Configuration

### Maven

No additional configuration needed. The native image plugin picks up the hints
automatically.

```xml
<plugin>
    <groupId>org.graalvm.buildtools</groupId>
    <artifactId>graalvm-build-tools</artifactId>
    <version>0.10.6</version>
</plugin>
```

### Gradle

No additional configuration needed.

```groovy
id 'org.graalvm.buildtools.native' version '0.10.6'
```

## Known Limitations

### JSON Serialization

While `McpSchema` classes are registered for reflection, custom JSON serializers
or deserializers may need additional configuration. If you use a custom `JsonMapper`
with the transport, ensure custom types are also registered.

### Dynamic Tool Definitions

Tools added dynamically at runtime (not via `@McpTool` annotations) may require
additional reflection hints if they use custom parameter types. Register these
manually:

```java
public class CustomHints implements RuntimeHintsRegistrar {

    @Override
    public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
        hints.reflection().registerType(MyCustomToolParam.class,
            ReflectionHintMode.ALL_DECLARED_CLASSES,
            ReflectionHintMode.ALL_DECLARED_CONSTRUCTORS,
            ReflectionHintMode.ALL_PUBLIC_METHODS);
    }
}
```

### Proxy Generation

Spring AI MCP uses proxies for async operations. Ensure proxy generation is
enabled in the native image build (enabled by default in Spring Boot 3.x).

## Troubleshooting

### "Class not registered for reflection"

If you encounter reflection errors at runtime, manually register the class:

```java
@ImportRuntimeHints(McpHints.class)
@SpringBootApplication
public class MyApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }
}
```

### "Cannot instantiate MCP schema class"

Ensure the MCP starter is on the classpath. The hints are only registered when
the starter dependency is present.

### Custom JSON Mapper Issues

If using a custom `JsonMapper`, verify that all custom types used in tool
parameters and return values are registered for reflection and JSON serialization.

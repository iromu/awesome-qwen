# Spring AI 2.0 Migration Guide

Migrating from `io.modelcontextprotocol.sdk` to `org.springframework.ai`? Here's
what you need to know.

## Dependency Changes

| Old (MCP SDK 0.18.x) | New (Spring AI 2.0+) |
|----------------------|---------------------|
| `io.modelcontextprotocol.sdk:mcp` | `org.springframework.ai:spring-ai-mcp` |
| `io.modelcontextprotocol.sdk:mcp-server-webmvc` | `org.springframework.ai:spring-ai-starter-mcp-server-webmvc` |
| `io.modelcontextprotocol.sdk:mcp-server-webflux` | `org.springframework.ai:spring-ai-starter-mcp-server-webflux` |
| `io.modelcontextprotocol.sdk:mcp-client` | `org.springframework.ai:spring-ai-starter-mcp-client` |
| `io.modelcontextprotocol.sdk:mcp-client-webflux` | `org.springframework.ai:spring-ai-starter-mcp-client-webflux` |

## Package Relocations

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

## Migration Checklist

- [ ] Update dependency group: `io.modelcontextprotocol.sdk` → `org.springframework.ai`
- [ ] Update all transport imports: `io.modelcontextprotocol.*` → `org.springframework.ai.mcp.*`
- [ ] Upgrade MCP SDK to 1.0.0+ (from 0.18.x)
- [ ] Auto-config users: only update `pom.xml`/`build.gradle` — no code changes needed
- [ ] Test that MCP clients initialize correctly on startup
- [ ] Verify tool callbacks still register with ChatClient
- [ ] If using security: add `mcp-server-security` or `mcp-client-security` from `org.springaicommunity`

## Key Changes

- **Transport artifacts moved:** From `io.modelcontextprotocol.sdk` to `org.springframework.ai`
- **All transport classes relocated:** To `org.springframework.ai.mcp.*`
- **Minimum SDK version:** MCP Java SDK 1.0.0+ required
- **Spring AI version:** 2.0+ required

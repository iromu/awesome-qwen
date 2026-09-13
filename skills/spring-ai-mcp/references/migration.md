# Spring AI 2.0 Migration Guide

Adding Spring AI MCP to a project that already uses the MCP Java SDK? Here's what
actually changes.

**The premise to drop first:** Spring AI 2.0 did **not** relocate the protocol types
out of `io.modelcontextprotocol.*`. The MCP Java SDK remains a separate artifact
(groupId `io.modelcontextprotocol.sdk`) with its own packages, and Spring AI's
`org.springframework.ai.*` modules sit **on top of** it, contributing annotation
scanning, Boot auto-configuration, transport adapters and the starters. So this is an
additive upgrade, not a package rename — bulk-import rewrites will break code that
was working.

## Dependency Changes

Add the Spring AI starters under the `org.springframework.ai` group (managed by
`org.springframework.ai:spring-ai-bom`). The SDK artifacts are **not** replaced —
Spring AI's `spring-ai-mcp` module *depends on* the SDK rather than standing in for it.

| You were using | Add for Spring AI |
|----------------|-------------------|
| `io.modelcontextprotocol.sdk:mcp` | `org.springframework.ai:spring-ai-mcp` (spring-ai's own module; pulls the SDK in) |
| servlet server transport | `org.springframework.ai:spring-ai-starter-mcp-server-webmvc` |
| reactive server transport | `org.springframework.ai:spring-ai-starter-mcp-server-webflux` |
| JDK HttpClient client | `org.springframework.ai:spring-ai-starter-mcp-client` |
| reactive client | `org.springframework.ai:spring-ai-starter-mcp-client-webflux` |

Let the BOM choose versions. Spring AI pins the SDK through an `<mcp.sdk.version>`
property in its root POM — read that for the SDK version your Spring AI line expects,
rather than hard-coding one and drifting out of sync.

## What Lives Where

| Concern | Package | Owner |
|---------|---------|-------|
| `McpSchema`, `McpSession`, `McpTransport` | `io.modelcontextprotocol.spec` | SDK |
| `McpClient`, `McpSyncClient`, `McpAsyncClient` | `io.modelcontextprotocol.client` | SDK |
| `McpServer`, `McpSyncServer`, `McpAsyncServer` | `io.modelcontextprotocol.server` | SDK |
| Client transports | `io.modelcontextprotocol.client.transport` | SDK |
| Server transports | `io.modelcontextprotocol.server.transport` | SDK |
| `@McpTool`, `@McpResource`, `@McpPrompt`, ... | `org.springframework.ai.mcp.annotation` | Spring AI |
| `McpClientCustomizer`, `McpSyncServerCustomizer`, `McpAsyncServerCustomizer` | `org.springframework.ai.mcp.customizer` | Spring AI |
| Reactive/servlet transport adapters | `org.springframework.ai.mcp.{client,server}.{webflux,webmvc}.transport` | Spring AI |

## Transport Class Names

These are frequent wrong guesses, so use the real names. Each transport is a single
class — there are no separate sync/async variants.

SDK, `io.modelcontextprotocol.client.transport`:

| Transport | Class |
|-----------|-------|
| STDIO | `StdioClientTransport` |
| SSE | `HttpClientSseClientTransport` |
| Streamable-HTTP | `HttpClientStreamableHttpTransport` |

SDK, `io.modelcontextprotocol.server.transport`:

| Transport | Class |
|-----------|-------|
| STDIO | `StdioServerTransportProvider` |
| SSE (servlet) | `HttpServletSseServerTransportProvider` |
| Streamable-HTTP (servlet) | `HttpServletStreamableServerTransportProvider` |
| Stateless (servlet) | `HttpServletStatelessServerTransport` |

Spring AI adds WebFlux/WebMVC adapters with a `WebFlux`/`WebMvc` prefix in the
packages listed above (e.g. `WebFluxSseClientTransport`,
`WebClientStreamableHttpTransport`, `WebMvcStatelessServerTransport`).

Names that do **not** exist — do not write them: `SseClientTransport`,
`StreamableHttpTransport`.

## Migration Checklist

- [ ] Add `spring-ai-bom` and the starters you need under `org.springframework.ai`
- [ ] **Leave your `io.modelcontextprotocol.*` imports alone** — they were not renamed
- [ ] Align the SDK version with the BOM's `<mcp.sdk.version>` rather than pinning your own
- [ ] Auto-config users: dependency changes only, no code changes needed
- [ ] Test that MCP clients initialize correctly on startup
- [ ] Verify tool callbacks still register with ChatClient
- [ ] For isolated tests, add `io.modelcontextprotocol.sdk:mcp-test` in test scope
- [ ] If using security: add `mcp-server-security` or `mcp-client-security` from `org.springaicommunity`

## Key Changes

- **Additive, not relocating:** Spring AI modules were added; SDK packages stayed put
- **Version the SDK via the BOM:** read `<mcp.sdk.version>` from the Spring AI line you
  target; do not assume a bare minimum version
- **Spring AI version:** 2.0+ required
- **Security stays external:** server/client security lives in `org.springaicommunity`,
  not in core Spring AI

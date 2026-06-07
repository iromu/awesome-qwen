# Spring AI MCP Documentation Index

Source: Official Spring AI Documentation (https://docs.spring.io/spring-ai/reference/)

## Overview

Comprehensive documentation for Spring AI's Model Context Protocol (MCP) integration, collected from the official Spring AI reference documentation.

## Files

### Core Documentation

- [01-overview-and-core-concepts.md](core/01-overview-and-core-concepts.md) — MCP architecture, three-layer stack (Client/Server, Session, Transport), Spring AI MCP integration, Boot Starters, annotations overview, and Spring AI 2.0 upgrade notes
- [02-getting-started.md](core/02-getting-started.md) — Quick start guide with simple server/client examples, learning resources, video tutorials, and example repository links

### Reference Documentation

- [01-spring-ai-mcp-client-boot-starters.md](reference/01-spring-ai-mcp-client-boot-starters.md) — MCP Client Boot Starter configuration, STDIO/SSE/Streamable-HTTP transports, client customizers, tool filtering, tool name prefix generation, and client annotations
- [02-spring-ai-mcp-server-boot-starters.md](reference/02-spring-ai-mcp-server-boot-starters.md) — MCP Server Boot Starter for STDIO, WebMVC, WebFlux transports, server capabilities (tools, resources, prompts, completions, logging, progress), sync/async server options, and configuration properties
- [03-spring-ai-mcp-annotations.md](reference/03-spring-ai-mcp-annotations.md) — Server annotations (`@McpTool`, `@McpResource`, `@McpPrompt`, `@McpComplete`), client annotations (`@McpLogging`, `@McpSampling`, `@McpElicitation`, `@McpProgress`, list changed handlers), method filtering by server type, and best practices
- [04-spring-ai-mcp-streamable-http-and-stateless.md](reference/04-spring-ai-mcp-streamable-http-and-stateless.md) — Streamable-HTTP and Stateless MCP server configurations, WebMVC/WebFlux options, method filtering by server type, and transport context examples
- [05-spring-ai-mcp-security.md](reference/05-spring-ai-mcp-security.md) — MCP Security module: OAuth 2.0 resource server, API key authentication, client OAuth 2.0 flows (authorization code, client credentials, hybrid), authorization server, and known limitations

## Key Concepts

### Architecture

Spring AI MCP follows a three-layer architecture:

1. **Client/Server Layer** — `McpClient` and `McpServer` handle protocol operations, tool discovery, resource access, and prompt interactions
2. **Session Layer** — `McpSession`, `McpClientSession`, `McpServerSession` manage communication patterns and connection state
3. **Transport Layer** — `McpTransport` handles JSON-RPC serialization, supporting STDIO, HTTP/SSE, Streamable-HTTP

### Server Types

| Type | Transport | Starter | Protocol Property |
|------|-----------|---------|-------------------|
| STDIO | Standard I/O | `spring-ai-starter-mcp-server` | `spring.ai.mcp.server.stdio=true` |
| SSE (WebMVC) | HTTP/SSE | `spring-ai-starter-mcp-server-webmvc` | `spring.ai.mcp.server.protocol=SSE` |
| SSE (WebFlux) | Reactive HTTP/SSE | `spring-ai-starter-mcp-server-webflux` | `spring.ai.mcp.server.protocol=SSE` |
| Streamable-HTTP (WebMVC) | HTTP POST/GET + SSE | `spring-ai-starter-mcp-server-webmvc` | `spring.ai.mcp.server.protocol=STREAMABLE` |
| Streamable-HTTP (WebFlux) | Reactive HTTP POST/GET + SSE | `spring-ai-starter-mcp-server-webflux` | `spring.ai.mcp.server.protocol=STREAMABLE` |
| Stateless (WebMVC) | Stateless HTTP | `spring-ai-starter-mcp-server-webmvc` | `spring.ai.mcp.server.protocol=STATELESS` |
| Stateless (WebFlux) | Stateless Reactive HTTP | `spring-ai-starter-mcp-server-webflux` | `spring.ai.mcp.server.protocol=STATELESS` |

### Client Types

| Type | Starter | Transport |
|------|---------|-----------|
| Sync | `spring-ai-starter-mcp-client` | STDIO, JDK HttpClient SSE/Streamable-HTTP |
| Async | `spring-ai-starter-mcp-client-webflux` | WebFlux SSE/Streamable-HTTP |

### Server Annotations

| Annotation | Purpose | Key Attributes |
|------------|---------|----------------|
| `@McpTool` | Expose tools to AI models | `name`, `description`, `title`, `generateOutputSchema`, `annotations` |
| `@McpResource` | Provide resources via URI templates | `uri`, `name`, `title`, `description`, `mimeType` |
| `@McpPrompt` | Generate prompt templates | `name`, `title`, `description` |
| `@McpComplete` | Auto-completion for prompts/URIs | `prompt`, `uri` |

### Client Annotations

| Annotation | Purpose | Required Attribute |
|------------|---------|-------------------|
| `@McpLogging` | Handle server log notifications | `clients` |
| `@McpSampling` | Handle LLM sampling requests | `clients` |
| `@McpElicitation` | Handle user information requests | `clients` |
| `@McpProgress` | Handle progress notifications | `clients` |
| `@McpToolListChanged` | Handle tool list changes | `clients` |
| `@McpResourceListChanged` | Handle resource list changes | `clients` |
| `@McpPromptListChanged` | Handle prompt list changes | `clients` |

### Special Parameters

| Parameter | Purpose | Supported In |
|-----------|---------|--------------|
| `McpSyncRequestContext` | Unified sync request context | Tool, Resource, Prompt, Complete |
| `McpAsyncRequestContext` | Unified async request context | Tool, Resource, Prompt, Complete |
| `McpTransportContext` | Lightweight stateless context | Tool, Resource |
| `McpMeta` | Access MCP request metadata | Tool, Resource, Prompt |
| `@McpProgressToken` | Receive progress token | Tool, Resource |
| `CallToolRequest` | Dynamic schema for tools | Tool only |

### Method Filtering

| Server Type | Accepts | Filters |
|-------------|---------|---------|
| Sync Stateful | Non-reactive + bidirectional context | Reactive (Mono/Flux) |
| Async Stateful | Reactive (Mono/Flux) + bidirectional context | Non-reactive |
| Sync Stateless | Non-reactive + no bidirectional context | Reactive OR bidirectional context |
| Async Stateless | Reactive (Mono/Flux) + no bidirectional context | Non-reactive OR bidirectional context |

## Spring AI 2.0 Breaking Changes

- Transport artifacts moved from `io.modelcontextprotocol.sdk` to `org.springframework.ai`
- All transport classes relocated to `org.springframework.ai.mcp.*` packages
- Requires MCP Java SDK 1.0.0+ (upgraded from 0.18.x)
- Auto-configuration users only need to update dependency coordinates

## External Resources

- [Model Context Protocol Specification](https://modelcontextprotocol.github.io/specification/)
- [MCP Java SDK](https://github.com/modelcontextprotocol/java-sdk)
- [MCP Java SDK Documentation](https://modelcontextprotocol.io/sdk/java/mcp-overview)
- [Spring AI Examples](https://github.com/spring-projects/spring-ai-examples/tree/main/model-context-protocol)
- [Awesome Spring AI](https://github.com/spring-ai-community/awesome-spring-ai)
- [MCP Security (Community)](https://github.com/spring-ai-community/mcp-security)

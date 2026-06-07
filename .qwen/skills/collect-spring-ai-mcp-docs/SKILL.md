---
name: collect-spring-ai-mcp-docs
description: Procedure for fetching and organizing official Spring AI MCP documentation for skill creation
source: auto-skill
extracted_at: '2026-06-07T00:51:41.717Z'
---

## Procedure: Collect Spring AI MCP Documentation

When asked to gather documentation about Spring AI's Model Context Protocol (MCP) integration to prepare for creating skills:

### Step 1: Discover the Project

1. **Start with the GitHub repo** — fetch `https://github.com/spring-projects/spring-ai` for the README and project structure.
2. **Identify the docs URL** — the README mentions `docs.spring.io/spring-ai/reference/index.html` as the reference documentation URL.
3. **Note the MCP module location** — the MCP code lives under `mcp/` in the repo with submodules: `common`, `mcp-annotations`, `transport`.

### Step 2: Discover the Documentation Site

1. **Fetch the docs landing page** — `https://docs.spring.io/spring-ai/reference/index.html` returns a navigation TOC with all sections.
2. **Identify MCP sections** — look for the "Model Context Protocol (MCP)" section and its subsections:
   - MCP Client Boot Starters
   - MCP Server Boot Starters (STDIO, SSE, Streamable-HTTP, Stateless)
   - MCP Security (WIP)
   - MCP Annotations (Client, Server, Special Parameters, Examples)
3. **Note the guide** — `Getting Started with MCP` is under the Guides section.

### Step 3: Fetch Documentation Content

**From the docs site (docs.spring.io):**
- The docs site uses an Antora-based structure where individual section URLs may return 404 or just navigation.
- **Fetch the main reference page** (`reference/index.html`) to get the full TOC with all section URLs.
- **Fetch individual MCP pages** using the path pattern from the TOC:
  - `https://docs.spring.io/spring-ai/reference/index.html#mcp` — MCP overview
  - `https://docs.spring.io/spring-ai/reference/guides.html#getting-started-with-mcp` — Getting started guide
  - `https://docs.spring.io/spring-ai/reference/index.html#mcp-client-boot-starters` — Client starters
  - `https://docs.spring.io/spring-ai/reference/index.html#mcp-server-boot-starters` — Server starters
  - `https://docs.spring.io/spring-ai/reference/index.html#mcp-security` — Security
- **Use the GitHub raw content** for AsciiDoc source files when the docs site returns just navigation:
  - Pattern: `https://raw.githubusercontent.com/spring-projects/spring-ai/main/spring-ai-docs/src/main/antora/modules/ROOT/pages/api/mcp/<page>.adoc`
  - Key files: `mcp-overview.adoc`, `mcp-client-boot-starter-docs.adoc`, `mcp-server-boot-starter-docs.adoc`, `mcp-stdio-sse-server-boot-starter-docs.adoc`, `mcp-streamable-http-server-boot-starter-docs.adoc`, `mcp-stateless-server-boot-starter-docs.adoc`, `mcp-security.adoc`, `mcp-annotations-overview.adoc`, `mcp-annotations-client.adoc`, `mcp-annotations-server.adoc`, `mcp-annotations-special-params.adoc`, `mcp-annotations-examples.adoc`, `getting-started-mcp.adoc`

**From GitHub:**
- Use the GitHub tree view (`https://github.com/spring-projects/spring-ai/tree/main/<path>`) to discover file paths when raw URLs return 404.
- Fetch the `pom.xml` from `mcp/mcp-annotations/pom.xml` to understand dependencies.
- Explore `mcp/common/src/main/java` and `mcp/mcp-annotations/src/main/java` for source structure.

**Fetch in parallel batches** — multiple MCP pages can be fetched simultaneously.

### Step 4: Handle Common Pitfalls

- **docs.spring.io returns only navigation**: The Spring docs site often returns just the TOC/navigation on individual section URLs. When this happens, fall back to fetching the raw AsciiDoc source from GitHub using `raw.githubusercontent.com`.
- **Raw GitHub URLs return 404**: The file may have a different name or be in a different location. Use the GitHub tree view to discover the actual path.
- **Antora `page.adoc` pattern**: Some sections use `page.adoc` as the filename. For MCP, pages are named descriptively (e.g., `mcp-overview.adoc`).
- **Large content**: The web_fetch tool may truncate very large pages. Split into targeted fetches by section.
- **Spring AI 2.0 breaking changes**: The MCP transport packages moved from `io.modelcontextprotocol.sdk` to `org.springframework.ai`. Capture these changes in the docs.

### Step 5: Organize and Save

1. **Create the target directory**: `mkdir -p raw/spring-ai-mcp-docs/{core,reference}`
2. **Name files descriptively** with numbered prefixes and clear names:
   - `core/01-overview-and-core-concepts.md` — MCP architecture, Spring AI integration, Boot Starters overview, annotations overview, Spring AI 2.0 upgrade notes
   - `core/02-getting-started.md` — Quick start guide, video tutorials, example links
   - `reference/01-spring-ai-mcp-client-boot-starters.md` — Client configuration, transports, customizers, tool filtering
   - `reference/02-spring-ai-mcp-server-boot-starters.md` — Server configuration (STDIO, WebMVC, WebFlux), capabilities
   - `reference/03-spring-ai-mcp-annotations.md` — Server annotations, client annotations, method filtering
   - `reference/04-spring-ai-mcp-streamable-http-and-stateless.md` — Streamable-HTTP and Stateless server docs
   - `reference/05-spring-ai-mcp-security.md` — OAuth 2.0, API key auth, client security, authorization server
3. **Include source attribution** at the top of each file:
   ```markdown
   # <Title>
   Source: <original URL>
   ```
4. **Create an INDEX.md** in the root that:
   - Lists all files and their purposes
   - Summarizes key concepts, annotations, interfaces, and patterns
   - Links to related repositories and resources

### Step 6: Verify Sufficient Material

After fetching, verify:
- All files are saved in the target directory
- File sizes are reasonable (not empty or truncated)
- Total content covers:
  - MCP architecture and Spring AI integration
  - Getting started / quick start
  - Client Boot Starter (configuration, transports, customizers, filtering)
  - Server Boot Starter (STDIO, WebMVC, WebFlux, capabilities)
  - Annotations (server, client, special parameters, examples)
  - Streamable-HTTP and Stateless servers
  - Security (OAuth 2.0, API key, authorization server)
- Aim for 5-7 files with substantial content (1,500+ lines total)

### Key Spring AI MCP Concepts to Capture

Ensure you capture:
- **MCP Architecture**: Three-layer stack (Client/Server, Session, Transport)
- **Client Starters**: `spring-ai-starter-mcp-client`, `spring-ai-starter-mcp-client-webflux`
- **Server Starters**: `spring-ai-starter-mcp-server`, `spring-ai-starter-mcp-server-webmvc`, `spring-ai-starter-mcp-server-webflux`
- **Transports**: STDIO, SSE, Streamable-HTTP, Stateless
- **Server Annotations**: `@McpTool`, `@McpResource`, `@McpPrompt`, `@McpComplete`
- **Client Annotations**: `@McpLogging`, `@McpSampling`, `@McpElicitation`, `@McpProgress`, list changed handlers
- **Special Parameters**: `McpSyncRequestContext`, `McpAsyncRequestContext`, `McpTransportContext`, `McpMeta`, `@McpProgressToken`, `CallToolRequest`
- **Method Filtering**: Sync/Async × Stateful/Stateless filtering rules
- **Spring AI 2.0 Changes**: Package relocation, dependency group ID change, SDK version bump
- **Security**: OAuth 2.0 resource server, API key auth, client OAuth 2.0 flows, authorization server

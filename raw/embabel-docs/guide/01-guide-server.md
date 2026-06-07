# Embabel Guide Server

Source: https://github.com/embabel/guide

## Overview

The **Guide** project is a companion server for the Embabel Agent Framework. It exposes documentation, blogs, API references, and up-to-the-minute API information through three interfaces:

- **Chat server** (WebSocket/STOMP) for custom front-ends
- **Spring Shell** for CLI interaction
- **MCP server** for integration with Claude Desktop, Claude Code, and other MCP clients

> **Note:** The chat server and Spring Shell conflict with each other. By default, the chat server is enabled. To use Spring Shell instead, uncomment the relevant lines in `pom.xml`.

**Blog:** [The Voice, The Word, and The Wheel](https://medium.com/embabel/the-voice-the-word-and-the-wheel-d6e2ef2ab26e) — adding voice interaction (TTS/STT) to the Guide with Deepgram, a narrator agent, and natural-language commands.

## Quick Start

### Running Locally

```bash
# Set API key (required for LLM calls)
export OPENAI_API_KEY=your_key_here

# Run the server
./mvnw spring-boot:run
```

The server starts on port `1337` by default.

### Docker Compose

```bash
# Start Neo4j + Guide (Java app)
docker compose --profile java up --build -d

# Start Neo4j only (for local Java dev)
docker compose up neo4j -d
```

#### Port Conflicts

If port `1337` is already in use:

```bash
GUIDE_PORT=1338 docker compose --profile java up --build -d
```

This maps container port `1337` → host port `1338`.

#### Stop

```bash
docker compose --profile java down --remove-orphans
```

## Loading Data

Load Embabel documentation into the RAG store:

```bash
curl -X POST http://localhost:1337/api/v1/data/load-references
```

Check data stats:

```bash
curl http://localhost:1337/api/v1/data/stats
```

RAG content storage uses the `ChunkingContentElementRepository` interface from `embabel-agent-rag-core`. The default backend is Neo4j via `DrivineStore`.

## Graph Database Backends

`DrivineStore` (from `embabel-agent-rag-graph`) supports three Cypher-speaking backends:

| Backend  | Profile    | Default port | Compose profile |
|----------|------------|--------------|-----------------|
| Neo4j    | `neo4j`    | `7687` (bolt)| `neo4j`         |
| FalkorDB | `falkordb` | `6379`       | `falkordb`      |
| Memgraph | `memgraph` | `7688` (bolt)| `memgraph`      |

### Switching at startup

```bash
# Neo4j (default)
./mvnw spring-boot:run -Dspring-boot.run.profiles=neo4j

# FalkorDB
./mvnw spring-boot:run -Dspring-boot.run.profiles=falkordb

# Memgraph
./mvnw spring-boot:run -Dspring-boot.run.profiles=memgraph
```

### Browsing data

- **Neo4j**: http://localhost:7474/browser/ (user `neo4j`, password `brahmsian`)
- **FalkorDB**: http://localhost:3001 (FalkorDB Browser)
- **Memgraph**: connect via [Memgraph Lab](https://memgraph.com/lab) to `bolt://localhost:7688`

### Deleting data

In the Neo4j Browser, run:

```cypher
MATCH (n:ContentElement)
DETACH DELETE n
```

## MCP Server

Starting the server exposes MCP tools on `http://localhost:1337/sse`.

### Verifying the Server

```bash
curl -i --max-time 3 http://localhost:1337/sse
```

You should see `Content-Type: text/event-stream` and an `event:endpoint` line.

### MCP Inspector (Optional)

```bash
npx @modelcontextprotocol/inspector
```

Connect to `http://localhost:1337/sse` in the inspector UI.

## MCP Client Integration

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "embabel-dev": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://localhost:1337/sse",
        "--transport",
        "sse-only"
      ]
    }
  }
}
```

See [Connect Local Servers](https://modelcontextprotocol.io/docs/develop/connect-local-servers) for details.

Create a [Project](https://www.anthropic.com/news/projects) so Claude knows its purpose. See `docs/claude_project.md` in the guide repo for suggested content.

### Claude Code

```bash
claude mcp add embabel --transport sse http://localhost:1337/sse
```

In the Claude Code shell, type `/mcp` to test the connection.

#### Auto-Approving Tools

By default, Claude Code asks for confirmation before running MCP tools. Each tool must be approved individually or listed explicitly in `.claude/settings.local.json`.

> **Note:** Wildcards do not work for MCP tool permissions.

### Codex

Add to `.codex/config.toml`:

```toml
[mcp_servers.embabel_guide]
command = "npx"
args = ["-y", "mcp-remote", "http://localhost:1337/sse", "--transport", "sse-only"]
startup_timeout_sec = 60
tool_timeout_sec = 120
```

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "embabel-dev": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://localhost:1337/sse",
        "--transport",
        "sse-only"
      ]
    }
  }
}
```

**Reload to reconnect:** If the server starts after Cursor, reload via **Command Palette → Developer: Reload Window**.

### Antigravity

Open the MCP store via the "..." dropdown → "Manage MCP Servers" → "View raw config". Modify `mcp_config.json`:

```json
{
  "mcpServers": {
    "embabel-dev": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://localhost:1337/sse",
        "--transport",
        "sse-only"
      ]
    }
  }
}
```

See [Antigravity MCP docs](https://antigravity.google/docs/mcp#connecting-custom-mcp-servers) for troubleshooting.

### Copilot CLI

Add to `$HOME/.copilot/mcp-config.json`:

```json
{
  "mcpServers": {
    "embabel-dev": {
      "type": "sse",
      "url": "http://localhost:1337/sse",
      "tools": ["*"]
    }
  }
}
```

## WebSocket Chat API

**Endpoint:** `ws://localhost:1337/ws`

Uses STOMP over WebSocket with SockJS fallback.

### Authentication

Pass JWT as a query parameter:

```
ws://localhost:1337/ws?token=<JWT>
```

Anonymous users are created automatically if no token is provided.

### STOMP Channels

| Direction | Destination             | Purpose                     |
|-----------|-------------------------|-----------------------------|
| Subscribe | `/user/queue/messages`  | Receive chat responses      |
| Subscribe | `/user/queue/status`    | Receive typing/status       |
| Publish   | `/app/chat.sendToJesse` | Send message to AI bot      |
| Publish   | `/app/presence.ping`    | Keep-alive (every 30s)      |

### Message Formats

**Sending:**

```json
{ "body": "your message here" }
```

**Receiving:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "response text",
  "userId": "bot:jesse",
  "userName": "Jesse",
  "timestamp": "2025-12-16T10:30:00Z"
}
```

### Minimal JavaScript Client

```javascript
import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const client = new Client({
    webSocketFactory: () => new SockJS('http://localhost:1337/ws'),
    onConnect: () => {
        client.subscribe('/user/queue/messages', (frame) => {
            const message = JSON.parse(frame.body);
            console.log('Received:', message.content);
        });

        client.publish({
            destination: '/app/chat.sendToJesse',
            body: JSON.stringify({body: 'Hello!'})
        });
    }
});

client.activate();
```

## REST API

CORS is open (`*`).

### Authentication

**Register:**

```
POST /api/hub/register
{
  "userDisplayName": "Jane Doe",
  "username": "jane",
  "userEmail": "jane@example.com",
  "password": "secret",
  "passwordConfirmation": "secret"
}
```

**Login:**

```
POST /api/hub/login
{ "username": "jane", "password": "secret" }
```

Response: `{ "token": "eyJhbG...", "userId": "...", "username": "jane" }`

**List Personas:**

```
GET /api/hub/personas
```

**Update Persona (requires auth):**

```
PUT /api/hub/persona/mine
Authorization: Bearer <JWT>
{ "persona": "persona_name" }
```

## Environment Variables

| Variable               | Default                              | Description                           |
|------------------------|--------------------------------------|---------------------------------------|
| `COMPOSE_PROFILES`     | `java`                               | Set empty for Neo4j only (no Java)    |
| `GUIDE_PORT`           | `1337`                               | Host port mapping                     |
| `NEO4J_VERSION`        | `2025.10.1-community-bullseye`       | Neo4j Docker image tag                |
| `NEO4J_USERNAME`       | `neo4j`                              | Neo4j username                        |
| `NEO4J_PASSWORD`       | `brahmsian`                          | Neo4j password                        |
| `NEO4J_HTTP_PORT`      | `7474`                               | Neo4j HTTP port                       |
| `NEO4J_BOLT_PORT`          | `7687`                               | Neo4j Bolt port                       |
| `NEO4J_HTTPS_PORT`     | `7473`                               | Neo4j HTTPS port                      |
| `OPENAI_API_KEY`       | _(optional)_                         | OpenAI API key                        |
| `ANTHROPIC_API_KEY`    | _(optional)_                         | Anthropic API key                     |
| `MISTRAL_API_KEY`      | _(optional)_                         | Mistral API key                       |
| `DEEPSEEK_API_KEY`     | _(optional)_                         | DeepSeek API key                      |
| `EMBABEL_KEY_SECRET`   | _(recommended)_                      | AES key for BYOK encryption           |
| `DISCORD_TOKEN`          | _(optional)_                         | Discord bot token                     |

## Testing

### Prerequisites

1. Set at least one LLM API key:

```bash
export OPENAI_API_KEY=sk-your-key-here
```

2. Neo4j: either local instance or Testcontainers (CI default).

### Local Development

```bash
# Start Neo4j
docker compose up neo4j -d

# Run tests
USE_LOCAL_NEO4J=true ./mvnw test
```

### CI

Leave `USE_LOCAL_NEOJ` unset. GitHub Actions uses Testcontainers automatically.

```bash
./mvnw test
```

### Kill Orphaned Server

```bash
lsof -ti:1337 | xargs kill -9
```

# Embabel Framework Documentation Index (Distilled)

Focused set of documentation resources for building projects with Embabel.
Sources: https://docs.embabel.com/embabel-agent/guide/0.5.0-SNAPSHOT/, https://github.com/embabel/guide

## Files

### 01-embabel-agent-readme.md
Main README from GitHub — framework overview, key concepts, code examples, differentiators, execution modes, planning algorithms.

### guide-server.md
Embabel Guide chat/MCP server — how to run the documentation server, MCP client integrations (Claude Desktop, Claude Code, Codex, Cursor, Antigravity, Copilot CLI), WebSocket/STOMP chat API, REST API, Docker deployment, graph database backends (Neo4j, FalkorDB, Memgraph), and testing.

### core/01-overview-and-core-concepts.md
Deep dive: GOAP, actions/goals/conditions, differentiators (sophisticated planning, extensibility, strong typing, platform abstraction, LLM mixing, Spring integration, testability).

### core/02-getting-started.md
Setup: Maven/Gradle dependencies, environment variables (OPENAI_API_KEY), quickstart, shell usage, first agent example.

### reference/03-agent-skills.md
Agent Skills spec: loading from GitHub/local, SKILL.md format, script execution (Process/Docker sandboxing), validation.

### reference/05-tools-050.md
Tools: @LlmTool, tool groups, MCP integration, ToolCallContext, framework-agnostic Tool interface, agentic tools, progressive tools.

### reference/06-configuration-050.md
All configuration properties: LLM settings, platform config, logging personality, tool loop, autonomy, HTTP client, REST endpoints, model providers (Bedrock, Docker, OCI, Google GenAI, MiniMax).

### reference/07-invoking-050.md
Invocation: AgentProcess, AgentInvocation, Autonomy (closed/open mode), REST endpoints, webhook integration, async execution.

### reference/08-planners-050.md
Planners: GOAP (default), Utility AI (@EmbabelComponent, cost/value, states), Hybrid (two-goal pattern), Supervisor (type-informed, non-deterministic), UtilityInvocation.

### reference/09-testing-050.md
Testing: FakePromptRunner, FakeOperationContext, Mockito/mockk, withId(), creating(), CreationExample, EmbabelMockitoIntegrationTest, LLM config verification.

### reference/10-chatbots-050.md
Chatbots: Chatbot/ChatSession/Conversation interfaces, trigger-based actions, Utility AI for chatbots, Jinja prompt templates, dynamic cost methods, conversation storage (IN_MEMORY/STORED), asset tracking.

## INDEX.md (this file)
Master index with concept summaries and cross-references.

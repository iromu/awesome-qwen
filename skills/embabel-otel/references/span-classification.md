# Span Classification & Enrichment

**Source:** `com.quantpulsar.opentelemetry.common.ObservationClassifier` + `LangfuseSpanExporter` + `LangSmithSpanExporter`

## How It Works

Each exporter classifies a span into a backend-agnostic **category** (shared `ObservationClassifier`), then maps that category to its own vocabulary — adding `langfuse.observation.type` for Langfuse and `langsmith.span.kind` for LangSmith.

## Classification Priority

1. **`embabel.event.type`** — the authoritative, complete classifier emitted on every Embabel span (`agent_process`, `action`, `tool_loop`, `tool_call`, `custom`, `embedding`, `rag`, `llm_call`, `llm_invocation`, `planning`, `replan`, `state_transition`, `lifecycle`, `goal`, `ranking`, `dynamic_agent_creation`, `tool_loop_completed`).
2. **`gen_ai.operation.name`** — for non-Embabel spans, chiefly the real LLM generation from Spring AI ChatModel (`chat`/`text_completion`), which carries no `embabel.event.type`.
3. **Context-attribute fallback** — `embabel.llm.model`, `embabel.tool.name`, `embabel.action.short_name`, `embabel.goal.short_name`, `embabel.state.to`, `embabel.lifecycle.state`, `embabel.agent.name` (broadest, checked last).
4. **Default** — `UNKNOWN`.

> Context attributes such as `embabel.agent.name` appear on almost every span (action, tool, llm, …), so they never override the explicit `embabel.event.type` / `gen_ai.operation.name` signals.

## Category → Backend Mapping

| Category | Source (event type / operation) | Langfuse Type | LangSmith Kind |
| -------- | ------------------------------- | ------------- | -------------- |
| `AGENT` | `agent_process`, op `agent` | `agent` | `chain` |
| `ORCHESTRATION` | `action`, `tool_loop` | `chain` | `chain` |
| `LLM_GENERATION` | op `chat`, `text_completion` | `generation` | `llm` |
| `LLM_STRUCTURAL` | `llm_call`, `llm_invocation` | `span` | `chain` |
| `TOOL` | `tool_call`, op `execute_tool` | `tool` | `tool` |
| `CUSTOM` | `custom` (`@Tracked`) | `tool` | `tool` |
| `EMBEDDING` | `embedding`, op `embeddings` | `embedding` | `embedding` |
| `RETRIEVER` | `rag` | `retriever` | `retriever` |
| `EVENT` | `planning`, `replan`, `state_transition`, `lifecycle`, `goal`, `ranking`, `dynamic_agent_creation`, `tool_loop_completed` | `event` | `chain` |
| `UNKNOWN` | — | `span` | `chain` |

**Key notes:**
- `LLM_STRUCTURAL` is the structural LLM wrapper / cost-record span; it is deliberately **not** a generation, so the real generation (the nested Spring AI ChatModel span) is not double-counted.
- LangSmith has no `agent`/`event`/`span` run type, so those categories collapse to `chain`.

## Span Enrichment

Each exporter adds a type attribute at export time via `DelegatingSpanData`:

- **Langfuse**: `langfuse.observation.type` (e.g., `agent`, `generation`, `tool`)
- **LangSmith**: `langsmith.span.kind` (e.g., `llm`, `chain`, `tool`)

This happens lazily at `export()` time — spans are wrapped in a `DelegatingSpanData` that returns the enriched attributes. If a span already has the type attribute, it is passed through unchanged (no double-enrichment).

## Embabel-Only Mode

When `embabel-only: true`, the exporter filters out spans that don't carry Embabel or GenAI attributes. A span is considered "instrumented" if any of its attribute keys start with `embabel.` or `gen_ai.`. This filters out HTTP server spans, health checks, actuator endpoints, and other infrastructure noise.
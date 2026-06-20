---
name: embabel-otel
description: >-
  Configure OpenTelemetry exporters for Embabel Agent observability to Langfuse and LangSmith.
  Use when setting up trace export for Embabel Agent, Spring AI, or any OpenTelemetry-instrumented
  Java app to Langfuse or LangSmith. Trigger on: OTLP, trace export, observability, Langfuse config,
  LangSmith config, span enrichment, embabel-only mode, OpenTelemetry exporter setup, agent tracing.
version: 1.0.0
category: observability
tags: [opentelemetry, langfuse, langsmith, embabel, spring-boot, tracing, otel]
---

# OpenTelemetry Exporter for Embabel

Add `LangfuseSpanExporter` and/or `LangSmithSpanExporter` to an existing Spring Boot + OpenTelemetry
application to export Embabel Agent traces to Langfuse and/or LangSmith.

## When to Use

- You have an Embabel Agent (or Spring AI) app and want traces in Langfuse or LangSmith
- You need to configure OTLP HTTP export for Embabel spans
- You want to filter noise (HTTP health checks, actuator endpoints) from trace dashboards
- You need both Langfuse AND LangSmith running in parallel

## When NOT to Use

- You're not using Java/Spring Boot — this library is Java-only (requires Java 21+, Spring Boot 3.5+)
- You need metrics or logs export — Langfuse only supports traces; the library disables OTel metrics/logs by default
- You're building your own OpenTelemetry SDK — this library only provides `SpanExporter` beans; the central `SdkTracerProvider` is managed by `embabel-agent-observability`

## Prerequisites

- Java 21+
- Spring Boot 3.5+
- OpenTelemetry 2.17+ (on the classpath)
- Langfuse v3.22.0+ (for self-hosted)

## Step 1: Add the Dependency

### Maven

```xml
<dependency>
    <groupId>com.quantpulsar</groupId>
    <artifactId>opentelemetry-exporter-embabel</artifactId>
    <version>0.5.0</version>
</dependency>
```

### Gradle

```groovy
implementation 'com.quantpulsar:opentelemetry-exporter-embabel:0.5.0'
```

### With Embabel Agent

If using Embabel Agent, add both dependencies:

```xml
<dependency>
    <groupId>com.embabel.agent</groupId>
    <artifactId>embabel-agent-starter-observability</artifactId>
    <version>0.3.4-SNAPSHOT</version>
</dependency>
<dependency>
    <groupId>com.quantpulsar</groupId>
    <artifactId>opentelemetry-exporter-embabel</artifactId>
    <version>0.5.0</version>
</dependency>
```

## Step 2: Configure the Exporter(s)

Add properties to `application.yml` (or `application.properties`).

### Langfuse Only

```yaml
management:
  langfuse:
    enabled: true
    endpoint: https://cloud.langfuse.com/api/public/otel
    public-key: ${LANGFUSE_PUBLIC_KEY}
    secret-key: ${LANGFUSE_SECRET_KEY}
    service-name: my-agent-app
    embabel-only: true
```

### LangSmith Only

```yaml
management:
  langsmith:
    enabled: true
    endpoint: https://api.smith.langchain.com/otel
    api-key: ${LANGSMITH_API_KEY}
    project: my-agent-app
    embabel-only: true
```

### Both Exporters

```yaml
management:
  langfuse:
    enabled: true
    endpoint: https://cloud.langfuse.com/api/public/otel
    public-key: ${LANGFUSE_PUBLIC_KEY}
    secret-key: ${LANGFUSE_SECRET_KEY}
    service-name: my-agent-app
    embabel-only: true
  langsmith:
    enabled: true
    endpoint: https://api.smith.langchain.com/otel
    api-key: ${LANGSMITH_API_KEY}
    project: my-agent-app
    embabel-only: true
```

## Step 3: Configure Endpoints

### Langfuse Endpoints

| Environment | Endpoint |
| ----------- | -------- |
| Cloud (EU) | `https://cloud.langfuse.com/api/public/otel` |
| Cloud (US) | `https://us.cloud.langfuse.com/api/public/otel` |
| Self-hosted | `http://localhost:3000/api/public/otel` |

> The `/v1/traces` suffix is appended automatically.

### LangSmith Endpoints

| Region | Endpoint |
| ------ | -------- |
| US | `https://api.smith.langchain.com/otel` |
| EU | `https://eu.api.smith.langchain.com/otel` |
| APAC | `https://apac.api.smith.langchain.com/otel` |
| Self-hosted | `https://<your-domain>/api/v1/otel` |

> The `/v1/traces` suffix is appended automatically.

## Step 4: Configure Authentication

### Langfuse (HTTP Basic)

- **Username**: Public key (`pk-lf-...`)
- **Password**: Secret key (`sk-lf-...`)

The exporter handles Base64 encoding automatically. Use environment variables or a secrets manager:

```yaml
public-key: ${LANGFUSE_PUBLIC_KEY}
secret-key: ${LANGFUSE_SECRET_KEY}
```

### LangSmith (API Key)

- Send `x-api-key` header with the API key (`lsv2_pt_...` or `lsv2_sk_...`)

```yaml
api-key: ${LANGSMITH_API_KEY}
```

## Step 5: Enable Embabel-Only Mode (Recommended)

When `embabel-only: true`, the exporter filters out non-relevant spans (HTTP server spans, health checks, actuator endpoints) and only exports spans with Embabel or GenAI attributes. This reduces noise in your dashboards.

```yaml
management:
  langfuse:
    embabel-only: true
  langsmith:
    embabel-only: true
```

## Step 6: Verify

After adding the dependency and configuration:

1. Start the application
2. Check logs for: `"Langfuse: SpanExporter configured to send traces to ..."` or `"LangSmith: SpanExporter configured to send traces to ..."`
3. If you see a warning like `"Langfuse exporter is enabled but not fully configured"`, verify that `public-key` and `secret-key` are set (Langfuse) or `api-key` is set (LangSmith)
4. Visit your Langfuse/LangSmith dashboard and confirm traces appear

## Configuration Reference

### Langfuse Properties

| Property | Default | Required | Description |
| -------- | ------- | -------- | ----------- |
| `management.langfuse.enabled` | `true` | No | Enable/disable the exporter |
| `management.langfuse.endpoint` | Cloud EU | No | OTLP endpoint URL |
| `management.langfuse.public-key` | — | **Yes** | Langfuse public key (`pk-lf-...`) |
| `management.langfuse.secret-key` | — | **Yes** | Langfuse secret key (`sk-lf-...`) |
| `management.langfuse.service-name` | `embabel-agent` | No | Service name for traces |
| `management.langfuse.connect-timeout-ms` | `10000` | No | Connection timeout (ms) |
| `management.langfuse.export-timeout-ms` | `30000` | No | Export timeout (ms) |
| `management.langfuse.embabel-only` | `false` | No | Filter non-Embabel spans |

### LangSmith Properties

| Property | Default | Required | Description |
| -------- | ------- | -------- | ----------- |
| `management.langsmith.enabled` | `true` | No | Enable/disable the exporter |
| `management.langsmith.endpoint` | US | No | OTLP endpoint URL |
| `management.langsmith.api-key` | — | **Yes** | LangSmith API key |
| `management.langsmith.project` | `default` | No | Project name |
| `management.langsmith.service-name` | `embabel-agent` | No | Service name for traces |
| `management.langsmith.connect-timeout-ms` | `10000` | No | Connection timeout (ms) |
| `management.langsmith.export-timeout-ms` | `30000` | No | Export timeout (ms) |
| `management.langsmith.embabel-only` | `false` | No | Filter non-Embabel spans |

## How It Works

### Architecture

```
Embabel Agent → OpenTelemetry SDK → SpanExporter beans
                                        ├── LangfuseSpanExporter (enriches → OTLP HTTP → Langfuse)
                                        └── LangSmithSpanExporter (enriches → OTLP HTTP → LangSmith)
```

The exporters are **not autonomous** — they contribute only `SpanExporter` beans. The central `SdkTracerProvider` is managed by `embabel-agent-observability`. Multiple exporters (Langfuse + LangSmith + Zipkin) can coexist.

### Span Classification

A shared `ObservationClassifier` classifies each span into a backend-agnostic category:

| Category | Source | Langfuse Type | LangSmith Kind |
| -------- | ------ | ------------- | -------------- |
| `AGENT` | `agent_process` | `agent` | `chain` |
| `ORCHESTRATION` | `action`, `tool_loop` | `chain` | `chain` |
| `LLM_GENERATION` | `chat`, `text_completion` | `generation` | `llm` |
| `LLM_STRUCTURAL` | `llm_call`, `llm_invocation` | `span` | `chain` |
| `TOOL` | `tool_call` | `tool` | `tool` |
| `CUSTOM` | `@Tracked` | `tool` | `tool` |
| `EMBEDDING` | `embedding` | `embedding` | `embedding` |
| `RETRIEVER` | `rag` | `retriever` | `retriever` |
| `EVENT` | `planning`, `lifecycle`, `goal` | `event` | `chain` |
| `UNKNOWN` | — | `span` | `chain` |

Classification priority:
1. `embabel.event.type` — authoritative classifier on every Embabel span
2. `gen_ai.operation.name` — for non-Embabel spans (e.g., Spring AI ChatModel)
3. Context-attribute fallback (`embabel.*`, `gen_ai.*`)
4. `UNKNOWN`

### Span Enrichment

Each exporter adds a type attribute at export time:
- **Langfuse**: `langfuse.observation.type` (e.g., `agent`, `generation`, `tool`)
- **LangSmith**: `langsmith.span.kind` (e.g., `llm`, `chain`, `tool`)

This happens lazily at `export()` time — spans are wrapped in a `DelegatingSpanData` that returns the enriched attributes.

## Building from Source

```bash
mvn clean package
mvn clean package -DskipTests    # skip tests
mvn test                          # run tests only
```
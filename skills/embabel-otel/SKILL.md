---
name: embabel-otel
description: >-
  Configure OpenTelemetry exporters for Embabel Agent observability to Langfuse and LangSmith.
  Use when setting up trace export for Embabel Agent, Spring AI, or any OpenTelemetry-instrumented
  Java app to Langfuse or LangSmith. Trigger on: OTLP, trace export, observability, Langfuse config,
  LangSmith config, span enrichment, embabel-only mode, OpenTelemetry exporter setup, agent tracing.
version: 2.0.0
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
```

### LangSmith Only

```yaml
management:
  langsmith:
    enabled: true
    endpoint: https://api.smith.langchain.com/otel
    api-key: ${LANGSMITH_API_KEY}
    project: my-agent-app
```

### Both Exporters

```yaml
management:
  langfuse:
    enabled: true
    endpoint: https://cloud.langfuse.com/api/public/otel
    public-key: ${LANGFUSE_PUBLIC_KEY}
    secret-key: ${LANGFUSE_SECRET_KEY}
  langsmith:
    enabled: true
    endpoint: https://api.smith.langchain.com/otel
    api-key: ${LANGSMITH_API_KEY}
    project: my-agent-app
```

## Step 3: Enable Embabel-Only Mode (Recommended)

When `embabel-only: true`, the exporter filters out non-relevant spans (HTTP health checks, actuator endpoints) and only exports spans with Embabel or GenAI attributes. This reduces noise in your dashboards.

```yaml
management:
  langfuse:
    embabel-only: true
  langsmith:
    embabel-only: true
```

## Step 4: Verify

1. Start the application
2. Check logs for: `"Langfuse: SpanExporter configured to send traces to ..."` or `"LangSmith: SpanExporter configured to send traces to ..."`
3. If you see a warning like `"Langfuse exporter is enabled but not fully configured"`, verify that `public-key` and `secret-key` are set (Langfuse) or `api-key` is set (LangSmith)
4. Visit your Langfuse/LangSmith dashboard and confirm traces appear

## Reference

For full property tables, endpoint URLs, authentication details, and span classification, see:

- [Langfuse Properties](references/langfuse-properties.md) — all config options, endpoints, auth
- [LangSmith Properties](references/langsmith-properties.md) — all config options, endpoints, auth
- [Span Classification](references/span-classification.md) — how spans are categorized and enriched
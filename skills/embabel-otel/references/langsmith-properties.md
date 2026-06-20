# LangSmith Properties Reference

**Source class:** `com.quantpulsar.opentelemetry.langsmith.LangSmithExporterProperties`
**Config prefix:** `management.langsmith`

## All Properties

| Property | Type | Default | Required | Description |
| -------- | ---- | ------- | -------- | ----------- |
| `enabled` | boolean | `true` | No | Enable/disable the exporter |
| `endpoint` | String | `https://api.smith.langchain.com/otel` | No | LangSmith OTLP endpoint (`/v1/traces` appended) |
| `api-key` | String | — | **Yes** | LangSmith API key (sent as `x-api-key` header) |
| `project` | String | `default` | No | LangSmith project name (`Langsmith-Project` header) |
| `service-name` | String | `embabel-agent` | No | Service name for traces |
| `connect-timeout-ms` | long | `10000` | No | Connection timeout (ms) |
| `export-timeout-ms` | long | `30000` | No | Export timeout (ms) |
| `embabel-only` | boolean | `false` | No | Filter non-Embabel/GenAI spans |

## Validation

`isConfigured()` returns `true` when `apiKey` and `endpoint` are both non-blank. `project` is optional.

## YAML Example

```yaml
management:
  langsmith:
    enabled: true
    endpoint: https://api.smith.langchain.com/otel
    api-key: ${LANGSMITH_API_KEY}
    project: my-agent-app
    embabel-only: true
```

## Endpoints

| Region | Endpoint |
| ------ | -------- |
| US | `https://api.smith.langchain.com/otel` |
| EU | `https://eu.api.smith.langchain.com/otel` |
| APAC | `https://apac.api.smith.langchain.com/otel` |
| Self-hosted | `https://<your-domain>/api/v1/otel` |

## Authentication

`x-api-key` header. No Base64 encoding needed.
# Langfuse Properties Reference

**Source class:** `com.quantpulsar.opentelemetry.langfuse.LangfuseExporterProperties`
**Config prefix:** `management.langfuse`

## All Properties

| Property | Type | Default | Required | Description |
| -------- | ---- | ------- | -------- | ----------- |
| `enabled` | boolean | `true` | No | Enable/disable the exporter |
| `endpoint` | String | `https://cloud.langfuse.com/api/public/otel` | No | Langfuse OTLP endpoint (`/v1/traces` appended) |
| `public-key` | String | — | **Yes** | Langfuse public key (`pk-lf-xxx`) |
| `secret-key` | String | — | **Yes** | Langfuse secret key (`sk-lf-xxx`) |
| `service-name` | String | `embabel-agent` | No | Service name for traces |
| `connect-timeout-ms` | long | `10000` | No | Connection timeout (ms) |
| `export-timeout-ms` | long | `30000` | No | Export timeout (ms) |
| `embabel-only` | boolean | `false` | No | Filter non-Embabel/GenAI spans |

## Validation

`isConfigured()` returns `true` when `publicKey`, `secretKey`, and `endpoint` are all non-blank.

## YAML Example

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

## Endpoints

| Environment | Endpoint |
| ----------- | -------- |
| Cloud (EU) | `https://cloud.langfuse.com/api/public/otel` |
| Cloud (US) | `https://us.cloud.langfuse.com/api/public/otel` |
| Self-hosted | `http://localhost:3000/api/public/otel` |

## Authentication

HTTP Basic Auth: username = public key, password = secret key. Base64 encoding is automatic.
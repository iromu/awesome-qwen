# Embabel Framework 0.5.0-SNAPSHOT - Configuration Reference

Source: https://docs.embabel.com/embabel-agent/guide/0.5.0-SNAPSHOT/reference/configuration/

## Enabling Embabel

Annotate your Spring Boot application class to get agentic behavior.

```java
@SpringBootApplication
public class MyAgentApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyAgentApplication.class, args);
    }
}
```

## Configuration Properties

### Setting default LLM and roles

From `ConfigurableModelProviderProperties`:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `embabel.models.default-llm` | String | `gpt-4.1-mini` | Default LLM name |
| `embabel.models.default-embedding-model` | String | `null` | Default embedding model |
| `embabel.models.llms` | Map<String, String> | `{}` | Map of role to LLM name |
| `embabel.models.embedding-services` | Map<String, String> | `{}` | Map of role to embedding service |

```yaml
embabel:
  models:
    default-llm: gpt-4o-mini
    default-embedding-model: text-embedding-3-small
    llms:
      cheapest: gpt-4o-mini
      best: gpt-4o
      reasoning: o1-preview
    embedding-services:
      fast: text-embedding-3-small
      accurate: text-embedding-3-large
```

### Platform Configuration

From `AgentPlatformProperties`:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `embabel.agent.platform.name` | String | `embabel-default` | Core platform identity name |
| `embabel.agent.platform.description` | String | `Embabel Default Agent Platform` | Platform description |

### Logging Personality

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `embabel.agent.logging.personality` | String | _(none)_ | Themed logging messages |

Available personality values:
- `starwars` - Star Wars themed logging messages
- `severance` - Severance themed logging messages. Praise Kier
- `colossus` - Colossus: The Forbin Project themed messages
- `hitchhiker` - Hitchhiker's Guide to the Galaxy themed messages
- `montypython` - Monty Python themed logging messages

### Agent Scanning

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `embabel.agent.platform.scanning.annotation` | Boolean | `true` | Whether to auto register beans with @Agent and @Agentic annotation |
| `embabel.agent.platform.scanning.bean` | Boolean | `false` | Whether to auto register as agents Spring beans of type Agent |

### Tool Loop Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `embabel.agent.platform.toolloop.type` | String | `default` | Tool loop type: `default` (sequential) or `parallel` (experimental) |
| `embabel.agent.platform.toolloop.max-iterations` | Int | `20` | Maximum number of tool loop iterations |
| `embabel.agent.platform.toolloop.parallel.per-tool-timeout` | Duration | `30s` | Timeout for individual tool execution in parallel mode |
| `embabel.agent.platform.toolloop.parallel.batch-timeout` | Duration | `60s` | Timeout for entire batch of parallel tools |
| `embabel.agent.platform.toolloop.empty-response.max-retries` | Int | `0` | Maximum consecutive empty-response retries |
| `embabel.agent.platform.toolloop.empty-response.nudge-message` | String | _(see below)_ | Message appended when LLM goes silent |

### Empty-Response Handling

For weak open-weights chat models that occasionally return blank text:

```yaml
embabel:
  agent:
    platform:
      toolloop:
        max-iterations: 30
        empty-response:
          max-retries: 1
```

### Process ID Generation

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `embabel.agent.platform.process-id-generation.include-version` | Boolean | `false` | Whether to include version in process ID |
| `embabel.agent.platform.process-id-generation.include-agent-name` | Boolean | `false` | Whether to include agent name in process ID |

### Autonomy Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `embabel.agent.platform.autonomy.agent-confidence-cut-off` | Double | `0.6` | Confidence threshold for agent operations |
| `embabel.agent.platform.autonomy.goal-confidence-cut-off` | Double | `0.6` | Confidence threshold for goal achievement |

### HTTP Client Configuration

To use Netty client, add:

```xml
<dependency>
    <groupId>com.embabel.agent</groupId>
    <artifactId>embabel-agent-netty-client-autoconfigure</artifactId>
</dependency>
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `embabel.agent.platform.http-client.connect-timeout` | Duration | `25s` | Connection timeout |
| `embabel.agent.platform.http-client.read-timeout` | Duration | `1m` | Read timeout |

### REST Endpoints

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `embabel.agent.platform.rest.process-status-enabled` | Boolean | `true` | Whether `GET /api/v1/process/{id}` is exposed |
| `embabel.agent.platform.rest.process-kill-enabled` | Boolean | `true` | Whether `DELETE /api/v1/process/{id}` is exposed |
| `embabel.agent.platform.rest.process-events-enabled` | Boolean | `true` | Whether `GET /events/process/{id}` is exposed |

### Test Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `embabel.agent.platform.test.mock-mode` | Boolean | `true` | Whether to enable mock mode for testing |

### Process Repository

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `embabel.agent.platform.process-repository.window-size` | Int | `1000` | Maximum agent processes to keep in memory |

### Model Provider Configuration

#### AWS Bedrock

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `embabel.models.bedrock.models` | List | `[]` | List of Bedrock models |
| `embabel.models.bedrock.models[].name` | String | `""` | Model name |

#### Docker Local Models

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `embabel.docker.models.base-url` | String | `http://localhost:12434/engines` | Base URL for Docker model endpoint |
| `embabel.docker.models.max-attempts` | Int | `10` | Maximum retry attempts |

#### OCI Generative AI

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `embabel.agent.platform.models.ocigenai.authentication-type` | Enum | `FILE` | Authentication provider |
| `embabel.agent.platform.models.ocigenai.region` | String | _(none)_ | OCI region id |
| `embabel.agent.platform.models.ocigenai.compartment-id` | String | _(none)_ | OCI compartment OCID |

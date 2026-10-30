# `events/`, `webhooks/`, `mcp/`, `commands/`, `channels/`

## `events/` — event ingestion

Unifies push (webhook) and pull (polling) sources behind a single contract: **emit
typed `Signal`s into the host's consequence engine.** A signal type is a `DomainType`
declared in `types/` whose `parents` includes `Signal`.

### Webhook event source

```yaml
# events/stripe.yml
- type: StripeEvent          # name of a signal type declared in types/
  webhook:
    signature: hmac-sha256   # one of: hmac-sha256, hmac-sha1, jwt, none
    signature-secret: STRIPE_WEBHOOK_SECRET
    tenancy: path-token      # one of: path-token, payload-field, header
    mapping:                 # type-property → JSONPath into the payload
      id: "$.id"
      occurredAt: "$.created"
      sourceKind: "stripe"
      sourceId: "$.id"
      eventType: "$.type"
      amount: "$.data.object.amount"
      currency: "$.data.object.currency"
      customerId: "$.data.object.customer"
    tier-when:                   # optional — override default tier (default AMBIENT)
      INTERRUPTIVE: "{{ payload.type == 'charge.failed' }}"
      TIMELY:       "{{ payload.type == 'invoice.upcoming' }}"
```

The host receives the webhook, verifies the signature, resolves its registered world
and context, projects the payload through the `mapping` into a `StripeEvent`
instance, and emits it as a `Signal`. The payload cannot select or override that
route.

| Field | Required | Meaning |
|---|---|---|
| `type` | yes | A type whose `parents` includes `Signal`. |
| `webhook.signature` | yes | Signature scheme the host's built-in verifiers handle. |
| `webhook.signature-secret` | conditional | Env-var name holding the shared secret. Required for any non-`none` scheme. Conventional realms only: a captured realm's webhook channel names a declared credential instead. |
| `webhook.tenancy` | yes | Strategy for routing the inbound webhook to a world. |
| `webhook.mapping` | yes | Type-property → JSONPath. Every required property of the `Signal` parent (`id`, `occurredAt`, `sourceKind`, `sourceId`) must be covered. |
| `webhook.tier-when` | no | Tier-override map. Each value is a Jinja boolean expression against the parsed payload; first true wins. |

### Polling event source

For services without webhook support:

```yaml
# events/linear.yml
- type: LinearIssue
  poll:
    every: 10m
    api: linear                # the realm's already-learned API (apis/linear.yml)
    method: list_my_issues     # method name on that API
    cursor:
      param: updated_after     # the API parameter that takes the cursor value
      from: $.updatedAt        # JSONPath into each result; max across the batch = new cursor
    mapping:
      id: "$.id"
      occurredAt: "$.updatedAt"
      sourceKind: "linear"
      sourceId: "$.id"
      title: "$.title"
      state: "$.state.name"
      url: "$.url"
```

| Field | Required | Meaning |
|---|---|---|
| `poll.every` | yes | Cadence (`5m`, `1h`). |
| `poll.api` | yes | Name of an API declared in `apis/` (this or another realm). |
| `poll.method` | yes | Method name on that API. |
| `poll.args` | no | Arguments. Jinja-templated against `{ cursor }` only — world, context, principal, and credentials are host-bound and unavailable to the template. |
| `poll.cursor.param` / `poll.cursor.from` | no | Cursor round-trip. |
| `poll.mapping` | yes | Same shape as the webhook `mapping`. |

A realm may declare both `webhook:` and `poll:` for the same type — the host prefers
webhook delivery and uses polling as a backstop for catch-up after downtime.

### Why this matters

Both sources produce `Signal`s of the realm-declared type. From there, the
consequence engine, triage rules, persistence (`SignalRecord`), notifications, and
chat surfacing are all type-aware: `signal.type.isAssignableFrom(StripeEvent)` is a
real predicate, not a string match. No JVM bytecode is shipped — realms that need
behaviour beyond mapping expose it via `actions/` or `mcp/`.

## `webhooks/` — legacy bare webhooks

Webhook registrations the host registers with the external service when the realm is
installed and the host has a public URL. The payload arrives, gets wrapped in a
`WebhookEvent`, and the named action fires. For richer integration that emits **typed
signals**, use `events/` instead.

```yaml
# webhooks/github-issues.yml
- name: github-issues
  description: "Receive GitHub issue events"
  source: github
  events: [issues, issue_comment]
  action: webhook-github-issue
  register:
    tool: create_repository_webhook
    args:
      owner: "{{owner}}"
      repo: "{{repo}}"
      config:
        url: "{{webhook_base_url}}/api/v1/webhooks/github-issues"
        content_type: json
        secret: "{{GITHUB_WEBHOOK_SECRET}}"
      events: ["issues", "issue_comment"]
```

Template variables in `register.args` resolve from world config, the credential
store, and well-known variables (`{{webhook_base_url}}`, `{{owner}}`, `{{repo}}`).
This templated form is local/first-party compatibility syntax; marketplace realms
cannot interpolate a credential into `register.args`.

## `mcp/` — MCP servers (last resort)

**Prefer `apis/` (a vendored OpenAPI spec) over an MCP server whenever the
integration is API-backed.** A vendored spec gives the LLM full typed
request/response shapes instead of MCP's flat tool descriptions, needs no Docker,
starts instantly, and is testable without a container. Reach for `mcp/` only when
there is no API to vendor (a server wrapping a local binary, a stateful protocol) or
the user explicitly brings their own MCP server.

```yaml
# mcp/example.yml
- name: example-server
  description: "What the server's tools do, written for the LLM"
  command: docker
  args: ["run", "-i", "--rm", "example/example-mcp:latest"]
  env:
    EXAMPLE_API_KEY: "${EXAMPLE_API_KEY}"
```

MCP servers are lazy-loaded — the container starts on first tool use, not on world
init. A mutable or credential-bearing MCP instance is keyed by
`(worldId, contextId, realmDigest, principalId, access-policy revision,
grant/credential revision)` and is never shared across contexts, principals, or
worlds.

## `commands/` — slash commands

Map a slash name to a handler.

```yaml
# commands/read-notes.yml
version: 1
command: read-notes
handler: notes.read
description: Read notes
```

Each flat `.yml` file contains one object. Required: `version: 1`, `command`,
`handler`; `description` optional (≤512 chars). Command names match
`[a-z][a-z0-9-]{0,63}`. A capture contains at most 32 command files, 8 KiB per file,
64 KiB combined. `/read-notes {"skus":["SKU-A"],"limit":2}` passes that JSON object to
the handler; a bare command passes `{}`. The handler result returns directly to chat.
Command input and results remain conversation content; credentials belong in the
owner wallet.

> Captured commands map a slash name to an **approved handler** in the same Realm
> installation; they do not grant handler access. Legacy `actionName` mappings are
> not loaded on hosts using captured execution.

## `channels/` — provider connectors

A channel is a general data pipe, including provider messages, webhooks, database
changes and Realm-produced events. `channels/` declares provider connector drafts;
`data-pipes.yml` declares captured sources and consumers.

A realm configures a connector the host implements (host-extension via FQN — a realm
cannot ship connector code):

```yaml
# channels/discord.yml
type: com.embabel.world.event.channel.discord.DiscordChannelConfig
name: discord
token-env: DISCORD_BOT_TOKEN
auto-start: true
```

| Field | Required | Meaning |
|---|---|---|
| `type` | yes | FQN of a host-provided channel connector configuration. |
| `name` | yes | The channel's name on this world. |
| `token-env` | connector-specific | Legacy credential name. Governed hosts require owner-scoped credential approval — values never belong in the Realm. |
| `auto-start` | no | Legacy startup preference. Governed startup also requires current owner approval. |

A credential-backed live connector registration is owned by exactly one world; the
host rejects a second world using the same provider credential. An unknown `type` is
reported against the file and that channel is skipped; the realm's other content
loads.

**Channel sources and consumers (captured):** declare them in `data-pipes.yml`. A
source names its stream and event type; a consumer names a captured handler the owner
separately approves. A declaration creates no grant. Use
`gateway.channel.publish` (docker) or `ctx.gateway.channel.publish` (wasm) to
publish; keep `streamId`, `eventId` and payload stable on retry — the journal matches
a retry on those.

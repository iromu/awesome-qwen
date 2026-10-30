# `apis/`, `keys.yml`, and declared credentials

API entries — each `.yml` file in `apis/` is a list of API definitions loaded on world
init. Each entry compiles into a typed `gateway.<name>.*` namespace inside
`execute_javascript` / `execute_python`.

```yaml
# apis/petstore.yml
- url: https://petstore3.swagger.io/api/v3/openapi.json
  name: petstore
  type: openapi
  auth: api-key
  token-env: PETSTORE_API_KEY
```

**Prefer `apis/` (a vendored OpenAPI spec) over an MCP server whenever the integration
is API-backed** — full typed request/response shapes, no Docker, instant start,
testable without a container.

## Entry fields

| Field | Required | Notes |
|---|---|---|
| `url` | yes | Spec source. HTTP(S), `file://`, or a bare relative path resolved against the apis.yml file's parent directory (vendored specs). |
| `name` | recommended | Gateway namespace — `gateway.<name>.*`. **Always set this** in published realms. |
| `type` | no | `openapi` (default) or `graphql`. |
| `auth` | no | `none` (default), `bearer`, `api-key`, `oauth2`. |
| `token-env` | with bearer / api-key | Env-var or credential-store key. **Deprecated** in favour of a `keys.yml` entry (conventional) or a declared `credential:` (captured). |
| `headers` | no | Custom HTTP headers; values support `${VAR}` interpolation. |
| `oauth2` | with `auth: oauth2` | OAuth2 config (below). |
| `tags` | no | Allowlist of OpenAPI tag names — filters WHICH OPERATIONS become tools, using the spec's own tag names. |
| `operation-ids` | no | Exact `operationId` allowlist. Composes with `tags`. Case-insensitive; `-`/`/` treated as `_`. |
| `capability-tags` | no | Capability DECLARATION — what the API is FOR, in the host's vocabulary. Unrelated to `tags`. |

### Capability tags

`capability-tags` says what an API IS FOR — `web-search` (discovers information from a
query), `web-fetch` (reads a URL it is given). Lets host code pick a tool by
capability without an LLM in the loop. The host owns the vocabulary; only
`web-search` and `web-fetch` are defined today. Declare on **every** provider you
ship — selection is all-or-nothing per capability: once anything declares
`web-search`, an untagged provider in the same realm stops being selected.

## Vendored specs

`url` accepts a bare relative path, resolved against the file's own parent directory:

```
realm-hubspot/
└── apis/
    ├── apis.yml          # url: hubspot-crm.json
    └── hubspot-crm.json  # the spec, vendored in-realm
```

Use this when the upstream provider has stopped publishing OpenAPI specs, or when you
want to pin a specific subset of operations without depending on a moving public URL.

## Auth

```yaml
# 1. No auth
- url: https://api.example.com/openapi.yaml
  auth: none

# 2. Bearer token (most REST APIs)
- url: https://api.github.com/openapi.json
  name: gh
  auth: bearer
  token-env: GITHUB_PERSONAL_ACCESS_TOKEN

# 3. API key (sent as the header/query the spec declares)
- url: https://petstore3.swagger.io/api/v3/openapi.json
  auth: api-key
  token-env: PETSTORE_API_KEY

# 4. Custom headers only — for APIs that need multiple auth headers (e.g. RapidAPI)
- url: https://weatherapi-com.rapidapi.com
  type: openapi
  headers:
    X-RapidAPI-Key: "${X_RAPIDAPI_KEY}"
    X-RapidAPI-Host: weatherapi-com.rapidapi.com
```

Missing credentials mean the entry is skipped at world load with a logged warning; the
API never appears in the gateway. A captured realm's API operations read only the
owner's wallet, through the credential the owner bound, and never fall back to the
process environment.

### OAuth2

The pack ships only **provider facts** (URLs, scopes, identity introspection).
Per-deployment client app credentials live in the host's **org vault**, keyed by
provider name — **never in the pack repo and never in any user's workspace**.

```yaml
- url: hubspot-crm.json
  name: hubspot
  type: openapi
  auth: oauth2
  oauth2:
    auth-url: https://app.hubspot.com/oauth/authorize
    token-url: https://api.hubapi.com/oauth/v1/token
    scopes: >-
      crm.objects.contacts.read crm.objects.contacts.write
      crm.objects.companies.read crm.objects.deals.read
    identity:
      url: https://api.hubapi.com/oauth/v1/access-tokens/{token}
      method: GET
      auth: path-token
      account-id-field: hub_id
      display-name-field: hub_domain
```

**`identity:` block** — tells the host how to call the provider's `/userinfo` or
`/whoami` endpoint and pull an `accountId` + display label, so the UI shows
"Connected as alice@acme.com" rather than just "Connected":

| Field | Required | Notes |
|---|---|---|
| `url` | yes | May contain `{token}`, substituted with the URL-encoded access token. |
| `method` | no | `GET` (default) or `POST`. |
| `auth` | no | `bearer` (default), `path-token`, `header:<NAME>`, `query:<NAME>`. |
| `account-id-field` | yes | Top-level JSON field for the stable account identifier. |
| `display-name-field` | no | Top-level JSON field for the human label. |

Examples: Google (`auth: bearer`, `account-id-field: email`); GitHub
(`account-id-field: login`); Slack (`method: POST`, `account-id-field: user_id`).

**Client credentials lookup order:** user's wallet → deployment's org vault →
`${VAR}` interpolation (power-user escape hatch). End users never paste tokens —
Settings → Connected Services → Authorize → consent. Token refresh is automatic.

## `keys.yml` — the keys a realm needs (conventional realms)

A realm that calls a vendor with an API key declares it here: what to call it, where
somebody gets one, the value(s) it takes, and how the host tells whether a value works.

```yaml
# keys.yml
- name: brave
  displayName: Brave Search
  description: Web and news search.
  getKeyUrl: https://brave.com/search/api/
  fields:
    - variable: BRAVE_API_KEY
      displayName: API key
  validate:
    api: brave                   # an API this realm declares in apis/
    operation: webSearch
    args: { q: test, count: 1 }
    refusedOn: [401, 403, 422]   # Brave answers a bad token 422

- name: maps
  displayName: Google Maps
  fields:
    - variable: GOOGLE_MAPS_API_KEY
      displayName: API key
    - variable: GOOGLE_MAPS_PROJECT_ID
      displayName: Project ID
      secret: false
  validate:
    api: maps
    operation: geocode
    args: { address: "1 Main St" }
    interpret: checkMapsAnswer   # optional Realm Function

- youtube                        # shorthand: one field, YOUTUBE, called "youtube"
```

| Field | Required | Description |
|---|---|---|
| `name` | yes | Stable id, unique within the realm. |
| `fields[].variable` | yes | The credential name the value is stored and resolved under — the same name `token-env` and `${VAR}` in `apis/` refer to. |
| `fields[].secret` | no | Default `true`. `false` marks a value safe to show back (a project id). |
| `validate` | no | How to check the values. Without it a key can be set but never checked. |

**One declaration, any number of APIs.** A field's `variable` is the credential slot
every `apis/` entry naming that variable resolves. Two APIs that use one key share one
entry, and a person is asked once.

### Validation

`validate` names **one of the realm's own API operations** and the arguments to call
it with. The host calls that operation with the candidate value bound into the
credential slot; the realm never sees the value.

| `validate` field | Required | Description |
|---|---|---|
| `api` | yes | An API this realm declares in `apis/`. |
| `operation` | yes | An operation of that API. Pick the cheapest one any valid key may call. |
| `args` | no | Fixed arguments, so the answer can only be about the key. |
| `refusedOn` | no | Statuses meaning the key is refused. Default `[401, 403]`. |
| `interpret` | no | A Realm Function that decides the verdict from the response, for a vendor whose refusal is not a status. Never receives the key. |

**A check has four outcomes:** `accepted` (works), `refused` (the issuer said no —
the only verdict on the key), `unreachable` (no answer — says nothing about the key),
`failed` (neither yes nor no, e.g. 5xx). Only `refused` blocks; a vendor being down is
not the key's fault.

### Guarantees

- Values are never exposed: never logged, never returned from any read, never passed
  to realm code.
- A check may run at any time and must not change anything at the vendor — `validate`
  names a read.
- Declared keys are the typed credential slot the trust tiers require for marketplace
  realms.

A realm without `keys.yml` still works: the host derives one entry per credential
variable its APIs refer to (`token-env`, `${VAR}`), uncheckable. A declared entry takes
precedence over a derived one for the same variable.

## Declared credentials (`credentials.yml`) — captured realms

A captured realm declares credentials the owner binds. The realm names a **purpose**
(kind, provider, description, docs link) — never a variable or where the secret lives.

```yaml
# credentials.yml
- description: A bot token for the server you want the assistant in.
  docs: https://discord.com/developers/applications
  id: bot
  kind: bearer
  provider: discord
  scheme: Bot
- description: The application's public key, used to verify interaction webhooks.
  docs: https://discord.com/developers/applications
  id: signing
  kind: public-key
  provider: discord
```

```yaml
# apis/apis.yml — reference it
- auth: bearer
  credential: bot
  name: discord
  operation-ids: [getGatewayBot]
  type: openapi
  url: discord.json
```

| Field | Required | Description |
|---|---|---|
| `id` | yes | What an `apis/` entry or channel names. Lowercase-with-dashes (≤64) or env-var style (≤128). |
| `kind` | yes | `api-key`, `basic`, `bearer`, `oauth2`, or `public-key`. |
| `description` | yes | Written for the person who will be asked to bind it (≤512 chars). |
| `provider` | no | The service that issues it. |
| `docs` | no | Where to get one. Must start with `https://`. |
| `scheme` | `bearer` only | The word in front of the token (Discord sends `Bot <token>`). |
| `scopes` | `oauth2` only | The scopes the grant asks for. Required on `oauth2`. |

At most 32 entries; the whole file is refused if any entry breaks its rules, or if an
entry is not named by any `apis/` entry or channel (asking for a secret nothing uses is
a reason to doubt the rest of the list). Nothing is bound at install: for each
declared credential the owner picks a wallet item or pastes one, and can unbind again.
A credential with no binding has its calls refused. A host never shows a bound secret
back, logs it, or records it in the grant.

**Captured operations are pinned to the value they were approved with.** Changing a
key that a captured operation was approved with means approving that operation again.
If a key entry and a captured realm share one wallet item, replacing the key through
the entry stops every captured operation approved with the old value until re-approved.

## Choosing between the two

| | Key entry (`keys.yml`) | Declared credential (`credentials.yml`) |
| --- | --- | --- |
| Applies to | Conventional realms | Captured realms — the recommended path for new realms |
| The realm names | The variable | A purpose: kind, provider, description, docs |
| The value comes from | A person sets the key | The owner binds a pasted secret or wallet item when approving |
| The host reads it from | World credential store, then env in the local/first-party tier | The owner's wallet only |
| Checking | `validate` + optional `interpret` | No check; binding checks only that the stored type fits the kind |
| Changing the value | Replace it, host re-checks | Re-approval needed (operations are pinned) |

`token-env` is deprecated in favour of either. Both together are accepted only when
they name the same thing (a realm migrating one key at a time); two different names
refuse the entry.

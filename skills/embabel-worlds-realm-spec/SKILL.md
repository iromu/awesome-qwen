---
name: embabel-worlds-realm-spec
description: Author, extend, or review an Embabel realm — a git repo of declarative agent capabilities (actions, types, virtual-join producers, APIs, views, events, agents, apps, skills, personalities) that an Embabel host installs into a world. Use this skill whenever the user mentions realms, realm.yml, realm-* repos, Embabel worlds, Virtual Cypher, virtual joins, producers, spines or hub keys, captured realms, defineRealm, or asks to create/scaffold/extend/validate a realm, wire a new integration as a realm, or add an action, type, API, view, webhook, event source, agent, or app to one. Also use it to debug why a realm's queries return empty — that is almost always a join, producer, or pushdown mistake this skill covers.
metadata:
  version: 1.0.0
  category: framework
  tags:
    - embabel
    - realm
    - agent
    - knowledge-graph
    - declarative
---

# Embabel Realm Authoring

A **realm** is a git repository named `realm-*` containing only declarative files (YAML)
and optional hand-authored TypeScript handlers — **no JVM bytecode, no host config, no user
credentials**. The host clones it into a world's `realms/` directory and wires its contents
into the running agent. The authoritative contract is the spec at
`github.com/embabel-worlds/realm-spec`; this skill is the map. Read the named reference
before writing a file.

## When to use

- Creating, scaffolding, or extending an Embabel realm
- Adding any capability: action, type, API, producer, view, webhook, event source,
  command, agent, app, skill, persona, focus
- Wiring an external integration (REST/GraphQL/CRM/calendar) as a realm
- Debugging realm behaviour — especially "the query returns nothing"

## When NOT to use

- Building the host itself (Spring/Kotlin framework code) — this is the realm side
- Generic Cypher/Neo4j work with no Embabel host involved
- The **hosted execution contract** (governed captured-host security) — that is a
  separate spec (`HOSTED_EXECUTION.md` in the raw docs); this skill covers authoring

## First decision: which authoring path?

| Path | What it is | When |
|---|---|---|
| **Declarative-only** | YAML files describe everything; no code ships | Default. If a YAML capability can express it, use it — no build step, the host's planner reasons over it directly |
| **Handlers-driven** | Realm ships TypeScript under `src/` (docker host) or `wasm/handlers.js` (wasm host) alongside YAML | Only when invariants YAML can't hold: revision/optimistic-lock guards, multi-call orchestration, shaping a rich API into idiomatic methods, or giving a type *behaviour* (type methods) |
| **Captured realm** | One `realm.ts` written with `defineRealm`, built by `realm-synth`; every capability is its own owner approval | The recommended path for **new** realms that run under governed hosts — credentials the owner binds, pinned approvals |

Handlers and YAML mix freely — a realm can ship `actions/` and `src/` at once.

## Directory routing — read the reference before writing the file

| Want to… | Directory | Reference |
|---|---|---|
| Realm metadata (name, version, category, maturity, icon, host) | `realm.yml` | `references/realm-yml.md` |
| An LLM step the planner chains | `actions/` (`stepType: action`) | `references/actions-goals.md` |
| A deterministic no-LLM rule over a signal | `actions/` (FQN `PolicyActionSpec`, `whenExpr`) | `references/actions-goals.md` |
| A multi-step workflow of actions | `goals/` | `references/actions-goals.md` |
| A domain / signal / mirror type | `types/` | `references/types.md` |
| A shared IDENTITY other realms attach to (spine) or attach your records to a spine (hub) | `types/` `spine:` / `hub:` | `references/types.md` §Spines |
| A type populated eagerly from a connected system (mirror type) | `types/` with `parents: [Contact]` + `metadata:` | `references/types.md` §Population |
| Fetch a type **on demand** by traversal (virtual join) | `types/` `virtualJoins:` + `producers/` | `references/virtual-joins-producers.md` |
| Call an external REST/GraphQL API | `apis/` (+ vendored OpenAPI spec) | `references/apis-keys-credentials.md` |
| Ask for an API key (conventional realm) | `keys.yml` | `references/apis-keys-credentials.md` |
| Ask for a secret the owner binds (captured realm) | `credentials.yml` | `references/apis-keys-credentials.md` |
| A named, parameterized answer callers run by name | `views/` | `references/views-lenses-sources.md` |
| A focused experience combining query + presentation | `lenses/` | `references/views-lenses-sources.md` |
| Declare how a collection behaves (size, filters, volatility) | `sources.yml` | `references/views-lenses-sources.md` |
| Hand-authored gateway methods / **type methods** | `src/api/*.ts` + `tests/` | `references/ts-handlers.md` |
| A wasm-host realm (pure logic, no Node) | `wasm/handlers.js` or `src/` | `references/wasm-hosts.md` |
| Inbound events → typed `Signal`s (webhook + poll) | `events/` | `references/events-channels.md` |
| Legacy bare webhook → named action | `webhooks/` | `references/events-channels.md` |
| An MCP server (last resort — prefer `apis/`) | `mcp/` | `references/events-channels.md` |
| A slash command | `commands/` | `references/events-channels.md` |
| A provider connector (Discord, etc.) | `channels/` | `references/events-channels.md` |
| An agent whose routines react to signals/cron | `agents/` | `references/agents-personas.md` |
| Scheduled KG node enrichment | `decorations/` | `references/agents-personas.md` |
| An HTML app | `apps/` | `references/agents-personas.md` |
| A voice/persona | `personalities/` | `references/agents-personas.md` |
| A scoped chat surface | `focuses/` | `references/agents-personas.md` |
| On-demand LLM guidance | `skills/<name>/SKILL.md` | `references/agents-personas.md` |
| Tips the host UIs show this realm's users | `hints/` | `references/agents-personas.md` |
| A captured realm in TypeScript (`defineRealm`) | `realm.ts` | `references/captured-realms.md` |
| Prove the realm works | `tests/questions.yml`, `tests/verify.sh`, `seed/` | `references/testing.md` |
| Validate in CI / install / conventions | `.github/workflows/validate.yml` | `references/validation-ci.md` |

## The five decisions that shape a realm

Make these **before** writing files. Each one is expensive to reverse.

### 1. Spine vs parent label (cross-realm identity)

A realm that stands alone is just a connector. The value is the question that needs
**two** realms — *accounts with an open ticket AND an overdue invoice* — and it only has
an answer if both realms' records land on the **same node**. This does not happen by
accident, and when it fails it fails as an **empty result with no error**.

For each entity your realm knows, ask: *if two systems each hold one, are those two
things or one?*

- **Two things → parent label.** Every helpdesk conversation is a `SupportCase`; two
  systems' tickets are two tickets. Declare `parents: [SupportCase]`.
- **One thing → spine.** A CRM customer and a billing customer for the same company are
  two records *about* one account. `parents:` is wrong here — it produces one node per
  system with nothing joining them.

Find the spine in this order:

1. `Person` (by email) or `Organization` (by email domain) — built in. Put
   `hub: Person` on the email property. Done.
2. A spine an installed realm already declares — check what's in the world.
3. None fits → declare one in the **most general** realm that needs it (a vocabulary
   realm, not a product realm — the spine must outlive any one product).

Then:

- Put `hub:` on the property that identifies the **entity**, which is often not the one
  that identifies the **record**. Keep `identity: true` on the source's own id; put
  `hub:` on the website / email / registration number.
- **Never normalize on your side.** Send the spine the raw value. The spine's
  `normalize` is the one definition of "the same"; a realm that lowercases or strips
  `www.` itself encodes another realm's format and will drift from it.
- **Prove the join with a test that would fail**: in `tests/verify.sh`, run the
  two-realm question against live sources and assert a NON-ZERO count for an entity you
  know is in both. See `references/types.md` §Spines for the full worked procedure.

### 2. Mirror vs virtual join (how data enters the graph)

- **Mirror (population)** — the host eagerly pulls the whole collection on a schedule.
  Right for small, stable collections the user connected (their CRM contacts).
- **Virtual join** — instances are fetched **on demand** when a query traverses to them,
  materialized transiently, then rolled back. Right for large or volatile collections
  where you only ever touch a slice. Declare `virtualJoins:` on the type plus a
  **producer** (a Repository over the source) in `producers/`.

Key virtual-join rules (full detail in `references/virtual-joins-producers.md`):

- A `virtualJoins:` entry is declared under the **target type it produces**, never under
  its anchor. Under the wrong type it silently never fires.
- A query may only reach a virtual label by **traversing a declared join from a bound
  anchor** — a naked `MATCH (t:Target)` is rejected.
- **Batch contract**: the producer takes ALL anchor keys at once — never N+1.
- **Declare EVERY filter the source can apply with `pushdown:`.** An undeclared filter
  is a per-anchor fetch: the source returns everything and the graph filters after.
  Worse — it forfeits pushed `LIMIT` and `count()` too. If the source applies no
  filters at all, write `pushdown: []` and say why in a comment; an absent key reads as
  "not yet declared" and warns on every read.
- Verify pushdown against the **live source** — some sources ignore unknown filters
  silently (HTTP 200 with the whole collection). Call the source with and without the
  filter and confirm the counts differ.
- **How many and which are two views.** A view that counts AND `collect`s always pays
  the collecting price. Ship a counts view and a detail view.

### 3. API exposure: `apis/` over `mcp/`

Prefer a (vendored) OpenAPI spec in `apis/` whenever the integration is API-backed —
full typed request/response shapes, no Docker, instant start. Reach for `mcp/` only
when there is no API to vendor (local binary, stateful protocol) or the user brings
their own MCP server.

### 4. Descriptions are for an LLM planner

Every `description:` — realm, action, type, view, app — is read first by a planner, not
a human. Write it as routing signal: what it is, what it answers, when to pick it over
a sibling. Bulk workflow guidance belongs in a `skills/` SKILL.md (paid only when
activated), never in `prompts/` (paid on **every** chat turn for every user).

### 5. Testing: the declarative half has no unit tests

`npm test` covers `src/` handlers. It says **nothing** about producers, virtual joins
and views — the part that usually breaks. A realm whose YAML parses, whose types load,
and whose every query silently returns nothing is the normal failure, and it looks
identical to "the source has no data".

- **Run every view against a live host and require rows.** Ship it as a script under
  the realm's `scripts/` so whoever inherits the realm can re-run it. Call the host's
  own endpoints — never re-implement them.
- **If anyone types WORDS at the realm, ship `tests/questions.yml`** — the
  natural-language battery. Views passing by name proves a different code path from the
  one users meet. Include the adversarial half (what the realm *cannot* answer, asked
  several times), because that is where a generator invents.
- **If the realm ships an `agents/` colleague, test it AS the agent.** A realm-level
  check never counts as an agent-level check.

Full procedure and the host endpoints in `references/testing.md`.

## The loop

```
edit files → realm_validate → realm_refresh (or POST /api/v1/realms/{name}/update)
           → re-run the test harness
```

A realm referenced by local path is reloaded in place — no app restart. That is the
difference between a two-minute edit loop and a two-second one. Static validation
(`realm-validate`, see `references/validation-ci.md`) answers "would this load?"; only a
live run answers "does this join".

## Hard rules

- **Credentials stay in host-managed, owner-scoped storage.** Realms carry credential
  *references*, never values. A captured realm declares credentials; a conventional
  realm declares `keys.yml` entries. `token-env` is deprecated in favour of either.
- **Stable ids.** Renaming a `name` (realm/action/type/command) breaks every installed
  world wired to it — that's a major version bump.
- **Naming**: lowercase-hyphenated ids, UpperCamelCase type names.
- **An identity is a spine; a record is a parent label.** Never `parents:` a spine;
  never normalize a shared key on your own side; always assert a non-zero cross-realm
  count in `tests/verify.sh`. A broken cross-realm join is an empty result, not an
  error.
- **An untested view is an unshipped view.** Declarative capabilities are only proven
  by a live run against the real source.
- **`prompts/` is a tax on every turn** — keep it a one-line pointer; put real workflow
  guidance in a `skills/` SKILL.md.
- **`project` paths use `[*]`, never `[0]`** — an indexed path projects null silently.
- **Declare types on fetched properties** — an undeclared property arrives as the
  source encodes it (a JSON feed's quoted numbers stay strings and comparisons match
  nothing).
- **Scope agents to the job.** Start from `builtins: [memory, views]` and add a
  category only when the agent cannot do its job without it. An agent that reaches for
  the wrong tool is usually an agent that was handed it.
- **Guard routine writes with `if (!dryRun)`** — reads are always safe; effects are not,
  during testing.

## Verification checklist

Before calling a realm done:

- [ ] `realm_validate` (or the CI validator) passes with no errors
- [ ] Every view returns non-zero rows against a live host with real data
- [ ] Warnings in view responses read, not skipped — a 0-row result with a
      `PRODUCER_ERROR` / `FIELDS_WITHHELD` / `UNPUSHED_FILTER` note is a broken realm,
      not an empty source
- [ ] Cross-realm join asserted non-zero in `tests/verify.sh` (if the realm joins)
- [ ] Pushdown rules verified against the live source (counts differ with/without filter)
- [ ] `tests/questions.yml` present and passing, including the adversarial half (if
      anyone types words at the realm)
- [ ] Agent tested as the agent, with the tool surface a turn was actually offered
      checked (if the realm ships `agents/`)
- [ ] `prompts/` is a pointer, not a manual; workflow detail lives in `skills/`
- [ ] No credentials, host config, or host-privileged code anywhere in the repo
- [ ] `category` checked against the published list
      (`embabel/default-installation` → `realm-categories.yml`)

## Raw specification

Full spec text lives in `raw/realm-spec-docs/` (see its `INDEX.md`): the main spec
(`README.md`), captured-realm TypeScript guide, Virtual Cypher guide, type-declaration
guide, label/composition guide, and glossary. Consult it when a reference here is not
detailed enough — it is the contract, and where they disagree, it wins.

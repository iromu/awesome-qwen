# `realm.yml` and realm shapes

Required metadata file at the realm root.

```yaml
name: github
description: "GitHub integration — analyze and fix issues"
version: 0.1.0
author: Embabel
url: https://github.com/embabel/realm-github
icon: icon.svg
category: developer
tags:
  - integrations
  - developer-tools
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Realm name (kebab-case). Stable — renaming is a major version bump. |
| `description` | No | What the realm does — read by an LLM planner first. |
| `version` | No | Semver (default `0.0.0`). Informational; the contract is at directory-and-field level. |
| `author` | No | Author or organization. |
| `url` | No | Source repository or documentation URL. |
| `icon` | No | An image the realm ships, **relative to the realm root**. Hosts must refuse absolute paths, `..` escapes, and URLs (a remote icon leaks which user is browsing which realms). SVG is the sensible default; keep it square and legible at ~40px. |
| `category` | No | One id from the published list at `realm-categories.yml` in `embabel/default-installation`. One value, case-insensitive. **Check before publishing** — `python3 scripts/build-realms-index.py --check path/to/realm.yml` from that repo. Missing/unknown = uncategorised, not an error. Not the same as tags. |
| `tags` | No | Free-text keywords for finding the realm. Not reviewed, not a readiness claim. |
| `maturity` | No | Author's own readiness claim: `experimental`, `beta`, `stable`, `deprecated`. A claim, not a measurement. **Absence is not a claim of being finished** — hosts treat missing as *unstated*, never `stable`. The reference host asks for explicit confirmation to install `experimental` realms. |
| `host` | No | Execution host for the realm's Functions: `docker` or `wasm`. Absent = inferred from what's on disk. |

## Repository convention

- A realm is a git repo whose name begins with `realm-` (e.g. `realm-github`,
  `realm-stripe`). The host installs it by cloning into a world's `realms/` directory.
- Realm sources are configured at the host level; each entry exposes repos matching
  `realm-*` from a GitHub org or user:

```yaml
# host application.yml
embabel:
  directory:
    realm-sources:
      - name: embabel
        type: org
      - name: johnsonr
        type: user
```

## Realm shapes

A realm is a directory of capabilities; *how* they are expressed is up to the author.

- **Declarative-only** (e.g. `realm-github`, `realm-email`): YAML files describe
  everything; no code ships. The framework's planner consumes the action specs; the
  poll executor consumes the event specs; the API allowlist consumes the apis
  manifest. No TypeScript, no `src/`.
- **Handlers-driven** (e.g. `realm-google`): the realm ships TypeScript handlers
  alongside the standard YAML when the integration needs invariants YAML can't
  express (revision guards, multi-step orchestration, custom domain logic).
  `src/api/*.ts` handlers, `src/lib/*.ts` helpers, `src/types/` shared types,
  `tests/*.test.ts` Vitest specs, plus `package.json` / `tsconfig.json` /
  `vitest.config.ts`. The realm still carries `apis/`, `skills/`, `prompts/` like
  any other realm — not mutually exclusive.
- **Captured** (new recommended path): one `realm.ts` with `defineRealm`, built by
  `realm-synth`; see `captured-realms.md`.

**Choosing:** start declarative. If a YAML capability can express what you need, that's
the right tool — no build step, no runtime code path, the host's planner reasons about
it directly. Reach for handlers when the operation has invariants the planner can't
enforce (atomicity, revision guards, ordering across multiple vendor calls) or when the
vendor's API grammar is rich enough that surfacing it as one tool collapses too much.
A realm can mix freely.

## Directory structure (all directories optional)

A realm needs only `realm.yml` and at least one capability directory.

```
realm-name/
├── realm.yml              # Required: realm metadata
├── icon.svg               # Realm icon (optional) — any path, named by realm.yml `icon`
├── actions/               # Action specifications (YAML)
├── goals/                 # Goal specifications (YAML)
├── types/                 # Dynamic type definitions (YAML)
├── producers/             # Virtual-join producers for on-demand types (YAML)
├── reference/             # Reference/catalog data seeded into the KG on load (YAML)
├── views/                 # Named Cypher views (YAML)
├── rules/                 # DERIVE rule sets (YAML) — derived labels/relationships
├── lenses/                # Named lenses (YAML)
├── apis/                  # API entries (YAML) + vendored specs
├── keys.yml               # API keys the realm needs (conventional realms)
├── credentials file       # owner-bound credentials (captured realms)
├── src/                   # Hand-authored TypeScript handlers (docker host)
│   └── api/*.ts           # one TS file per namespace; filename → namespace
├── tests/                 # Vitest specs for handlers + questions.yml + verify.sh
├── wasm/                  # Handler source for the wasm host (single file)
├── mcp/                   # MCP server configurations (YAML)
├── commands/              # Slash command mappings (YAML)
├── webhooks/              # Webhook registrations (YAML)
├── events/                # Event ingestion — push (webhook) + pull (poll)
├── data-pipes.yml         # Captured channel source and consumer declarations
├── channels/              # Realm-shipped provider connector drafts (YAML)
├── agents/                # Agents — named colleagues whose routines react to signals/cron
├── decorations/           # Scheduled KG node-decoration manifests
├── apps/                  # Bundled HTML apps served at /apps/{realm-name}/{name}.html
├── hints/                 # Tips the host UIs show users of this realm (YAML)
├── artifacts.yml          # Custom artifact type registrations (optional)
├── prompts/               # Prompt contributions (examples.md) — tax on every turn
├── skills/                # Skills (Agent Skills spec): skills/<name>/SKILL.md
├── notebook/              # Reusable sets of slots a persona keeps across a conversation
├── personalities/         # Voice / behaviour bundles (Jinja templates)
├── focuses/               # Named scopings of the chat surface
└── seed/                  # Demo data for the SOURCE system (records.yml + seed.sh)
```

## What's intentionally NOT in a realm

- Code that runs with host privileges (no JVM bytecode, no native libs, no classpath
  contributions) — realm code executes only inside a host-managed sandbox
- Spring beans, host configuration changes
- User credentials — realms carry credential references, never values
- World, context, or principal-owned state — a realm ships templates and types;
  host-owned scopes hold mutable instances and their access policy

If a capability needs real code: ship it as sandboxed handler code (`src/` or `wasm/`),
via `actions/` (LLM in the loop), via `mcp/` (sandboxed server), or as a host-level
extension out of band.

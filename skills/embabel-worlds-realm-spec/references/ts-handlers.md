# `src/` and `tests/` — hand-authored TypeScript handlers (docker host)

OpenAPI and MCP cover what an external system *already* exposes. Realms can also ship
**hand-authored TypeScript** under `src/api/`, in two forms:

- **Namespace functions** — an exported `async function` becomes a
  `gateway.<namespace>.<name>(...)` method. Use these to shape, guard, or compose raw
  API primitives.
- **Type methods** — an exported `class` that `extends Entity` defines a *type* whose
  async methods are callable on an in-scope object (`movie.streaming({ country })`).
  Use these to give a realm's entities behaviour.

Both compile to the same `dist/` and run in the same sandbox as LLM-generated code,
calling back through `gateway.<raw-api>.*` for primitives.

## When to add TS handlers

- **Shape a raw API into idiomatic methods** the LLM uses well (e.g.
  `docsEditor.getOutline` over `docs.documentsGet` + heading-walking).
- **Enforce safety invariants** that can't be expressed in the raw spec (e.g. a
  propose/apply edit flow with a revisionId guard, where you DON'T expose the raw
  mutating method to the LLM).
- **Compose multiple primitives** into one call (paginate, retry, dedupe, post-process).

Realms without TS handlers work exactly as before — `src/` is purely additive.

## Project layout

A realm with TS handlers is a real TypeScript project:

```
realm-name/
├── realm.yml
├── apis/                       # raw OpenAPI surface
├── package.json                # devDeps: @embabel/runtime-types, typescript, vitest
├── tsconfig.json               # strict; leave noUncheckedIndexedAccess OFF when using GenericGatewayContext
├── tsconfig.build.json         # outDir: dist; module: CommonJS
├── vitest.config.ts
├── src/
│   ├── api/
│   │   └── docs-editor.ts      # one TS file per namespace; filename → namespace
│   ├── lib/                    # internal helpers (not exposed)
│   └── types/                  # shared TS types
├── tests/
│   └── docs-editor.test.ts     # Vitest, runs in pure Node against mockGateway
├── .embabel/
│   └── gateway.d.ts            # GENERATED: typed view of the host's gateway
└── dist/                       # GENERATED: compiled JS + manifest.json
```

`@embabel/runtime-types` provides `mockGateway<T>(impl)`, `entityForTest`,
`hydrate*`, `Entity`, and the `embabel-build-manifest` CLI.

## Handler signature

Every exported async function with a `(ctx, args)` signature becomes a manifest entry
at build time; the host registers from the manifest, never by introspecting the code.

```ts
// src/api/docs-editor.ts
import type { GatewayContext } from "../../.embabel/gateway";

/**
 * Return the heading outline of a Google Doc. PREFER this over
 * `gateway.docs.documentsGet` when you only need structure.
 */
export async function getOutline(
  ctx: GatewayContext,
  args: { documentId: string },
): Promise<{ revisionId: string; spans: Array<{ anchor: string; level: number; text: string }> }> {
  const doc = await ctx.docs.documentsGet({ documentId: args.documentId });
  return { revisionId: doc.revisionId ?? "", spans: /* walk doc.body.content */ [] };
}
```

The host's manifest extractor walks the TypeScript AST, converts the args parameter
type and the unwrapped return type to JSON Schema, and writes them to
`dist/manifest.json`. **The first JSDoc paragraph becomes the LLM-visible
description — invest in JSDoc:** it's how the LLM picks the right method when multiple
gateway surfaces overlap.

Until `embabel-realm sync` lands, type `ctx` as **`GenericGatewayContext`** from
`@embabel/runtime-types` (loose) — the extractor reads each handler's `args` and
return types, not `ctx`, so the typed LLM surface is identical either way.

## Type methods — classes that extend `Entity`

A type method is a method *on an in-scope object*. Its fields are the type's shape;
its async methods are the affordances.

```ts
// src/api/movie.ts
import { Entity } from "@embabel/runtime-types";

/** The gateway ops this type calls: the type argument to `Entity`. */
interface MovieGateway {
  streamingAvailability: { getShow(args: { id: string; country: string }): Promise<StreamingShow> };
}

/** A film in the knowledge graph. Identity is `imdbId`. */
export class Movie extends Entity<MovieGateway> {
  imdbId!: string;
  title?: string;

  /** Where this movie is streaming in a country (ISO-3166 alpha-2, lowercase). */
  async streaming(args: { country: string }): Promise<StreamingShow> {
    return this.gateway.streamingAvailability.getShow({ id: this.imdbId, country: args.country });
  }
}
```

Rules:

- **Name the gateway once, as `Entity`'s type argument** — `this.gateway` is then
  typed with exactly the ops the type calls, with no cast. Never a getter that casts it.
- **One parameter**: a bare value when one is enough, else one options object. Its
  type and the return type become the schema; the first JSDoc paragraph is what a
  model reads.
- The class name must equal the type's name.
- Extending `Entity` brings **`neighbors()`** for free (graph navigation).
- Plain data with no behaviour stays a plain `interface` — promote to a class only
  when it grows methods.

### Type methods on virtual types

A type method works the same whether the instance is a persisted entity or one
materialized on demand by a virtual join. So a virtual type's class gives its
on-demand instances behaviour: **pure** methods compute over the instance's own
fields, no I/O (`issue.ageDays()`); **effectful** methods write back to the source
through `this.gateway.<ns>.*` (`issue.close()`). A read materialises transient nodes
and rolls them back; an effectful method commits to the real source (the rollback
never touches that side-effect).

### Acting on what a query finds

The point of type methods: code navigates the graph to what it needs and works on it
there.

```js
// 1. Read with gateway.cypher.query (alias of gateway.kg.query): every node carries __type and __labels.
const { rows } = await gateway.cypher.query({ cypher: `
  MATCH (b:OdooBook)-[:HAS_CUSTOMER]->(c:OdooCustomer)
  WHERE c.name = 'Acme Corporation' RETURN c` });

// 2. Bind a row. state.set reads the row's labels; state.get returns it with every method its labels carry.
state.set("acme", rows[0].c);
const acme = state.get("acme");

// 3. Work on it.
await acme.addNote("Second failed payment this month; chasing.");
```

- **Methods compose through labels.** A node is the intersection of its labels, so a
  vendor node that declares `parents: [CrmAccount]` answers to its own type's methods
  and to any method declared for `CrmAccount`.
- A program that imports the classes can hydrate instead: `hydrateByType(rows,
  { GitHubIssue }, gateway)`.

### Designing write methods

A type's write methods are what an agent will do to a customer, a deal or a ticket —
design for that caller:

- **Name the action in the business's words, and use the same name across realms**
  (`addNote`, `scheduleFollowUp`, `bookCall`, `assign`, `reply`). The method hides the
  vendor's call shape.
- **Make the safe outcome the default.** A note is internal unless asked otherwise; a
  message to the customer needs an explicit flag. Something that cannot be recalled
  happens only when the caller says so.
- **Check before writing.** Validate dates, ids and required fields in the method and
  throw with the reason. A graph id is a string; convert it to the source's own id
  type in one checked helper.
- **Each method calls one declared verb**, so what can change in the source is visible
  in `apis/` with its effect metadata, and approving a method is approving that verb.

### Testing

`entityForTest` builds a real instance with its fields set and a mock gateway
injected — the same shape the host uses at runtime:

```ts
const getShow = vi.fn().mockResolvedValue({ streamingOptions: { au: [] } });
const movie = entityForTest(
  Movie,
  { imdbId: "tt0113451" },
  mockGateway<MovieGateway>({ streamingAvailability: { getShow } }),
);

await movie.streaming({ country: "au" });
expect(getShow).toHaveBeenCalledWith({ id: "tt0113451", country: "au" });
```

Assert the exact verb arguments. No host running, no Docker, no live API.

## Manifest format

Generated by `embabel-build-manifest` — never hand-authored (a wasm realm with no TS
build hand-authors the same format).

```json
{
  "version": 1,
  "generatedAt": "2026-05-15T00:00:00Z",
  "entries": [
    {
      "namespace": "docs_editor",
      "name": "getOutline",
      "description": "Return the heading outline …",
      "inputSchema": { "type": "object", "properties": { "documentId": { "type": "string" } }, "required": ["documentId"] },
      "outputSchema": { "type": "object", "properties": {} }
    }
  ]
}
```

| Field | Source | Purpose |
|---|---|---|
| `namespace` | `src/api/<filename>.ts` (kebab-case → snake) | Gateway namespace; LLM sees it camelCased. |
| `name` | exported function name | Method name on the namespace. |
| `description` | first JSDoc paragraph | LLM-visible documentation. |
| `inputSchema` / `outputSchema` | TS types | JSON Schema; drives the typed surface. |
| `schedule` | manifest author | Optional cron (Spring 6-field). |
| `onType` | `export class X extends Entity` methods | The entry is a method on a declared type. |
| `className` | exported class name | Set for class-based type methods. |

## Build and test cycle

```bash
npm install            # @embabel/runtime-types from git, typescript, vitest
npm run typecheck      # tsc --noEmit
npm test               # vitest run — mockGateway against your handlers
npm run build          # tsc → dist/*.js (CommonJS) + manifest.json
```

**Ship `dist/`, including `dist/node_modules/@embabel/runtime-types`** (force-add it
past a `node_modules/` ignore rule): the compiled class requires it in the sandbox.
The host runs `npm install && npm run build` at install; `dist/` is the shippable
bundle. `embabel-realm sync` regenerates `.embabel/gateway.d.ts`.

## Trust model

Handlers run with the same trust as LLM-generated code (both are inside the sandbox).
The handler's value over a raw OpenAPI call is in **what's exposed**, not where it
runs: if a realm hides a method from its `apis/` allowlist but uses it inside a
handler, the LLM cannot call the raw method directly. If both are exposed, the
wrapper is a recommendation, not a barrier — `skills/` SKILL.md files are the right
way to make sure the LLM picks the wrapper.

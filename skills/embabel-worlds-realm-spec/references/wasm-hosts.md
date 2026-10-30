# Execution hosts and wasm realms

A realm's executable surface runs on a host named by `realm.yml` `host:` — `docker`
or `wasm`. The same authored form runs on different hosts by changing one line.

```yaml
# realm-levies/realm.yml — pure logic, no dependencies
name: levies
host: wasm

# realm-invoices/realm.yml — renders PDFs with an npm library, needs real Node
name: invoices
host: docker
```

Placement never changes: function names, namespaces, schemas, the manifest format, the
`{ result }` / `{ error }` envelope, signal identity, and the identity model (no
host puts a credential or scope key inside the unit).

## Authoring a wasm realm

By hand, at least three files: the realm, the handlers, and the manifest that
registers them.

```yaml
# realm.yml
name: ping
host: wasm
```

```js
// wasm/handlers.js
export async function ping(input, ctx) {
  return "pong";
}
```

```json
// dist/manifest.json
{
  "version": 1,
  "entries": [
    {
      "namespace": "ping",
      "name": "ping",
      "description": "Answers pong.",
      "inputSchema": { "type": "object", "properties": {} },
      "outputSchema": { "type": "string" }
    }
  ]
}
```

### Handler contract

A handler is `async (input, ctx)`: it **returns its result value directly** (the value
described by the manifest's `outputSchema`) or **throws** to fail. The host wraps the
return into the `{ result }` / `{ error }` wire envelope — authors never write the
envelope. A return value must be JSON-serializable; `undefined` serializes to a null
result.

Three supported forms: named export (one handler per function, input-first ctx
second), default-export object, or `defineHandler("name", async (input, ctx) => …)`
for files that cannot use export syntax. **Resolution is deterministic:** each
manifest function is looked up by `name` among the contributed functions; a name
contributed more than once is a load-time problem. **Discovery is the manifest's; the
module supplies implementations** — the host never executes guest code to discover
functions.

`input` is the dispatch input described by `inputSchema`: call arguments for an
on-demand call (no `trigger` key), or the trigger-discriminated event for a
signal/cron-bound dispatch (`{trigger: "signal", signal: {…}}` /
`{trigger: "cron", firedAt}`).

| `ctx` member | Contract |
|---|---|
| `ctx.gateway.<namespace>.<method>(args)` | Calls back into the host's gateway surface — the same namespaces a TS handler or LLM-generated script sees. The guest never holds or presents a credential. |
| `ctx.log(message)` | Guest logging. |
| `ctx.reply({ text, idempotencyKey })` | Dispatch-scoped reply to the triggering channel thread. Returns `{ status }`: `SENT` \| `OUTCOME_UNKNOWN` \| `NOT_REPLYABLE` \| `NOT_PERMITTED` \| `EXPIRED` \| `CONNECTOR_UNAVAILABLE` \| `REJECTED`. |

**Statelessness applies to every form.** Every dispatch runs in a fresh instance —
nothing in the file survives between dispatches. Durable state lives in the graph,
through the gateway.

### What the guest has, and what it does not

| Available | Absent |
|---|---|
| `ctx.gateway.*`, `ctx.log`, plain JavaScript, JSON | Node (`require`, `process`, `fs`), npm packages |
| The function's `input` | Network sockets, filesystem, environment variables |
| | Any credential or scope key |

The absences are the point: a wasm function is pure logic over gateway calls. A
handler that needs an npm library, streaming I/O, or the filesystem belongs on the
docker host.

### Single file, or a typed project

- **`wasm/handlers.js` — the zero-toolchain single file.** Plain JavaScript, no
  `package.json`. Compiled to `dist/handlers.wasm` on load. Hand-authored
  `dist/manifest.json`. This is the floor.
- **`src/` — a TypeScript project.** Multiple handlers, shared helpers, real types.
  The build type-checks, bundles the reachable module graph, **extracts
  `dist/manifest.json` from the typed exports**, and compiles to
  `dist/handlers.wasm`. The author runs the build; the host does NOT build `src/` on
  load, so the shipped bundle is the truth.

Types come from `@embabel/runtime-types` (`Ctx`, event, envelope types) and a
generated `.embabel/gateway.d.ts` (via `embabel-realm sync`) that types
`ctx.gateway.<namespace>.<method>` against the world's actual tool surface.

### Manifest schedules and type methods (wasm)

| Entry field | Meaning |
|---|---|
| `schedule` | A cron expression (Spring 6-field). Installation makes the schedule available but **does not activate it** — it starts only after adoption. A Manifest Schedule passes empty args (`{}`), so every `inputSchema` field must be optional. |
| `onType` | The function is a method on a declared type — callable as `<obj>.<name>(args)`. The handler receives the object as `input.self` and the caller's arguments as `input.args`. Does not combine with `schedule`. |

### Build on load

A realm that ships `wasm/handlers.js` is compiled by the host when the realm loads:
a content fingerprint over source + manifest + toolchain identity decides whether to
rebuild; a failed build keeps the previous good bundle and the declarative content
loads, with a warning. **Don't commit bundles from a `wasm/handlers.js` realm** — the
host rebuilds on load. A `src/` project ships its built bundle instead. A realm may
also ship a prebuilt `dist/handlers.wasm` with no source (**self-contained** realm —
right when the module is compiled from a language the host has no toolchain for).

### Limits

Dispatch time, guest memory, and payload sizes are bounded; crossing a bound is an
error the caller sees — never a truncation, never a hang. Reference host defaults:
30s dispatch timeout, 64 MiB guest memory, 1 MiB per payload.

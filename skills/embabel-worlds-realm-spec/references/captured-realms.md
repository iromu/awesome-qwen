# Captured realms — `realm.ts` with `defineRealm`

A captured realm runs from a copy the owner admitted, and **every capability is its
own owner approval**. Write it as one `realm.ts` with `defineRealm` and let
`realm-synth` generate the files and the handler types
(`--types .embabel/realm.d.ts`). The full contract is
`raw/realm-spec-docs/TYPESCRIPT_REALMS.md` — this file is the routing map and the
gotchas.

Use `defineRealm` in place of `satisfies Realm`: under it, a goal, producer, lens,
channel or consumer naming a handler the realm does not declare is a **compile
error**. Synth refuses an undeclared handler everywhere a realm names one. A realm
with no `handlers` block declares none, so every handler name in it is refused. An
undeclared goal `input` or `output` type is a warning (another realm may declare it);
if nothing does, the host drops the goal.

Check the realm against the host it will run on with `--profile reference-wasm` (or a
JSON profile for another host). It warns about conventional `actions`, `events` and
`webhooks` in a captured realm (which the reference host does not load), and refuses
`layers`.

## Credentials

**A captured realm declares credentials; a conventional realm declares `keys.yml`
entries.** Both work; new realms should be captured and declare credentials the owner
binds (see `apis-keys-credentials.md`). A captured API operation is **pinned to the
value it was approved with** — changing a key means approving that operation again.
Ambient environment variables do not authorize credential use for a captured realm;
only a conventional realm in the local or first-party tier may resolve `token-env`
from the environment.

## Producers are handlers

A captured producer is a handler. No `kind`, no `operation`, no `args`, no `cache`:

```ts
producers: {
  "incidents-by-service": {
    handler: "oncall.incidents",
    keyArgument: "serviceIds",
    joins: [{ targetLabel: "Incident", anchorLabel: "Service", relationship: "HAS_INCIDENT",
              keyField: "serviceId", recordKeyField: "serviceId" }],
    page: { argument: "cursor", maxPages: 4 },
    pushdown: [
      { property: "impact", argument: "impact" },
      { property: "status", argument: "status" },
      { property: "component", argument: "component" },
    ],
  },
},
```

- The handler gets the keys as a list under `keyArgument` and returns records that
  carry their key under `recordKeyField`. With `page`, it returns `{ rows, next }`
  and gets `next` back under the page argument on the following call, up to
  `maxPages` (1 to 16). `next: null` stops it.
- **Cover EVERY filter the source can apply with a `pushdown` rule.** The handler
  gets the values an `=` or `IN` allows as a list of strings under the rule's
  argument, on every page. A filter you leave out makes the handler fetch everything
  the key allows, and the answer comes out the same, so nothing tells you.
- Only `=` and `IN` push. `>`, `CONTAINS` and a function over the value are applied
  by the graph after the fetch. Say so in the target type's description.
- If the handler's input schema has `additionalProperties: false`, list the page and
  pushdown arguments in `properties`, or the host refuses the producer at bind time.
- A query reaches the target only along a join from a bound anchor.
  `MATCH (i:Incident)` on its own is refused. One producer's target can anchor the
  next producer's join, so chain them.
- Limits per fetch: 256 keys, 1 MiB of output, 1,024 rows across all pages. No
  result cache.

## Graph reads are `ctx.gateway.cypher.query`, under their own approval

The generated types type API and GraphQL namespaces and `ctx.gateway.channel`, and
leave `ctx.gateway.cypher` as `unknown` — give it a type in the handler:

```ts
type CypherGateway = {
  cypher: {
    query(request: { cypher: string; params?: Record<string, unknown> }): Promise<{
      rows: Record<string, unknown>[];
    }>;
  };
};

const { rows } = await (ctx.gateway as unknown as CypherGateway).cypher.query({
  cypher: "MATCH (s:Service)-[:HAS_INCIDENT]->(i:Incident) WHERE s.team = $team " +
          "RETURN s.name AS service, i.incidentId AS incident LIMIT 100",
  params: { team: input.team },
});
```

- End with a literal `LIMIT` from 1 to 512, name and label every node, and pass
  every value through `params`.
- It sees only what the owner owns outright. Variable-length paths, named paths,
  list comprehensions, procedures and most functions are refused, and every refusal
  is the same message — keep queries plain.
- Read the owner's own views through `queries: { views: [{ alias, view }] }`; each
  alias is its own approval.

## Apps

Browser apps run sandboxed with **no network** (see `agents-personas.md` §`apps/`).
Synth refuses an app naming a handler the realm does not declare. The host operator
sets the size limits (reference defaults: 10 MiB page, 16 resources, 10 MiB per
resource and in total); for larger limits raise synth's with `--app-limit 32MiB`.

## Writes go through a proposal, never directly

`ctx.writePropose({ version: 1, kind, target, fields, effect, method? })` files a
write for the owner to accept and resolves to `{ proposalId }`. The handler never
learns the outcome. The target must be one private record the owner already has,
under a label the operator opened to proposals. Accepting applies flat scalar
`fields` with `effect: "private-storage"` only. Keep a proposal small and name
exactly the record it changes.

## Channels and data pipes

Declare channel-fed sources and consumers with `connecting`; write them as
`dataPipes` in `realm.ts`. A consumer names a captured handler the owner separately
approves. Use `ctx.gateway.channel.publish` to publish; keep `streamId`, `eventId`
and payload stable on retry.

## What a captured realm does NOT have (reference host)

- Conventional `actions/`, `events/`, `webhooks/` — warned about, not loaded. Use
  captured goals (version-1, one approved handler bound to Realm-declared input and
  output types), channels, and handlers instead.
- Legacy Realm StepSpecs and MCP subprocess registrations.
- `layers` — refused.

The migration contract is in `raw/realm-spec-docs/` (HOSTED_EXECUTION.md, not
cloned — fetch from the repo if needed).

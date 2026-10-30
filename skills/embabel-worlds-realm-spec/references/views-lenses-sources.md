# `views/`, `lenses/`, `sources.yml`

## `views/` — saved queries

A realm ships named Cypher queries under `views/*.yml`. They appear in the console's
Views list and are runnable by name — which is most of what they are for. One of the
two shapes **composes**: its name is a label, and a larger query may match it.

```yaml
# views/key-accounts.yml
- name: KeyAccounts
  description: Contacts worth more than £100k ARR, whoever owns them.
  cypher: |
    MATCH (me:AssistantUser)-[:HAS_HUBSPOT_OWNER]->()-[:OWNS_CONTACT]->(c:HubSpotContact)
    WHERE c.arr > 100000
    RETURN c
```

```cypher
-- Used as a label. The view's MATCH clauses are inlined, and `c` is a HubSpotContact like any other.
MATCH (c:KeyAccounts) WHERE c.renewalDate < date('2026-12-01')
MATCH (c)-[:HAS_HUBSPOT_DEAL]->(d:HubSpotDeal)
RETURN c.email, d.name
```

**Node view, or tabular view. The body decides, not a flag.**

| | Body | Used as |
|---|---|---|
| **Node view** | `MATCH … RETURN <one bare node variable>` | a label **or** by name. COMPOSES. |
| **Tabular view** | a projection — `RETURN c.email AS email, count(d) AS deals` | by name only. TERMINAL. |

A node view yields nodes of exactly one type and keeps their identity, so the view's
name reads as a named subtype: `KeyAccounts ⊆ HubSpotContact`. A tabular view's rows
are not nodes — matching it as a label is refused at validation.

**The type may be VIRTUAL, and referencing the view materializes it.** A node view
whose body traverses a declared join to a virtual type is, as a label, a way to say
"these fetched records" once and reuse it. Two consequences of a reference being an
INLINE of the body, not a subquery:

- **A view's own variables are private.** Only the returned variable becomes the
  caller's alias; every other variable the body declares is renamed per use.
- **The anchor rules still apply, through the view.** A view does not grant a virtual
  label a bound anchor it would not otherwise have.

| Field | Required | Description |
|---|---|---|
| `name` | yes | What it is run and matched by. A node view may NOT be named like a label the world already holds. |
| `cypher` | yes | The body. Standard Cypher, parsed by the real parser. |
| `description` | no | What it answers — for the Views list and for a model choosing between views. |
| `params` | no | Declared bind values, each with a `type` (`string`, `int`, `number`, `float`, `double`, `boolean`, `date`), a `description`, and ideally a `default` so the view stays runnable bare. A param with no default must be supplied unless it declares `required: false` (then omission binds `null`, so `WHERE $p IS NULL OR x.k = $p` skips the filter). `default: null` alone does NOT make a param optional. One value each — a view needing a list reads it inside its own body. |
| `outputLabel` | inferred | The type a node view's rows are. Inferred when the body returns a single bare node variable. REQUIRED on a `materialized` view. |
| `materialized` | no | `false` (default) expands the body at query time, always fresh. `true` commits the result and reads the cache until the TTL expires — the interactive query then does no producer calls at all. |
| `ttl` | no | Cache lifetime for a materialized view (`30m`, `2h`, `1d`). Default `1h`. |

**What is refused, rather than answered wrong:** a tabular view matched as a label; a
node view named like an existing label; an argument the view never reads; a fractional
number for an `int` parameter; a label in the body that is a near miss for one the
realm knows (`GitHubIsue` beside `GitHubIssue`), reported at the view's file and line.

**Ship one view per question the realm exists to answer**, so nobody hand-writes
Cypher over your join surface. Counts and detail are two views (see
`virtual-joins-producers.md` §two-view rule).

## `lenses/` — named focused experiences

A lens is a focused experience a realm installs alongside its types, producers and
apps. Each `.yml` file serializes one Lens. The host discovers world-authored lenses
first; a world lens with the same `id` shadows the realm definition (same precedence
model as realm-bundled apps — a world can customize an installed experience without
modifying the realm repo).

```yaml
# lenses/account-health.yml
id: account-health
name: Account Health
description: Live account health assembled from the CRM and support systems.
params:
  - name: accountId
    type: STRING
    label: Account
    required: true
spec:
  kind: cypherscript
  script: |
    const accountId = String(lensArgs.accountId || "");
    const result = await gateway.kg.query({
      cypher: `MATCH (a:Account {accountId:$accountId})-[:HAS_TICKET]->(t:SupportTicket)
               RETURN a.name AS account, collect(t) AS tickets`,
      params: JSON.stringify({ accountId }),
    });
    const rows = (result && result.rows) ? result.rows : (result || []);
    await gateway.lens.present({ content: JSON.stringify({
      kind: "account-health",
      rows,
    }) });
presentation:
  href: /apps/account-health.html
```

| Field | Required | Description |
|---|---|---|
| `id` | Yes | Stable lens id. A world override uses the same id. |
| `name` | Yes | Human-readable name. |
| `description` | No | Routing and catalogue description. |
| `params` | No | Declared inputs. Types: `STRING`, `INT`, `DATE`, `DURATION`, `BOOLEAN`; each may declare `label`, `default`, `required`. |
| `spec` | Yes | Execution definition selected by `kind`. |
| `persona` | No | Optional personality slug carried by the opened view. |
| `schedule` | No | Optional cron expression for refresh/change handling. |
| `presentation` | No | Optional top-level surface and/or app `href`. |

`spec.kind` values: `cypherscript` (`script` — JavaScript/CypherScript combining
Virtual Cypher, gateway integrations and bounded `gateway.ai.*` calls), `module`
(`className` plus inline `source` or sibling `module`), `fixed` (a host-registered
fixed query), `anchor` (a typed graph-node anchor).

A realm-shipped Lens is code, not mutable per-world state: its definition is refreshed
when the realm is updated. An app should invoke a named Lens or view through the host's
typed invocation surface — it should not accept or submit arbitrary Cypher from a
browser.

A CypherScript Lens may depend on a **node view** by referencing the view name as a
label inside `gateway.kg.query` — view expansion happens before Virtual Cypher
planning. Only identity-preserving node views compose this way; a tabular view is
terminal — invoke it through the named-view surface.

> Captured hosts use versioned metadata to bind a lens to an approved handler in the
> same installation (`version`, `id`, `name`, `handler`); the declaration supplies no
> execution capability by itself.

## `sources.yml` — declaring how a COLLECTION behaves

`producers/` say how to *fetch* records. `sources.yml` says what the collection *is*:
how big, what it can be filtered by, what order it arrives in, how often it changes,
and whether it should be mirrored at all. The platform cannot infer any of that, and
getting it wrong is not a performance problem — it is a correctness one.

```yaml
# sources.yml
- name: …
  # size, filter surface, ordering, volatility, mirroring policy
```

Also declared here:

- **`Coverage`** — completeness is a fact in the graph, not a hope.
- **`visibility: public`** — a world's mirror; the scope differs from `reference/`.
- **`lane: documents`** — a collection that lands as searchable DOCUMENTS.

See the raw spec (`raw/realm-spec-docs/README.md`, §`sources.yml`) for the full field
reference.

## `reference/` — catalog data seeded on load

Reference/catalog data seeded into the KG on load — e.g. the catalog of services a
Movie can be watched on. Small, stable, realm-owned.

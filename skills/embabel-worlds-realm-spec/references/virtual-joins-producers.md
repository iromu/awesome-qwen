# Virtual joins and producers — on-demand types

Population (mirroring) eagerly pulls a whole collection on a schedule. For large or
volatile collections you usually only ever touch a slice — there a **virtual join** is
better: the type's instances are fetched **on demand** when a Cypher query traverses
to them, materialized transiently for that query, then **rolled back** (no persistence,
no sync, no GC).

## The engine — Virtual Cypher

The host mechanism that powers on-demand joins. A realm never invokes it directly; you
declare the pieces (`virtualJoins:` + `producers/`) and it plans and runs the fetch.
For a user query that traverses to a virtual label it:

1. **probes** the bound *real* anchors the query selects — applying the query's own
   `WHERE` / pinned-literal predicates so only anchors that will survive are chosen;
2. **plans** each fetch with a cost-based optimizer — pushing predicates to the
   source, fetching per-key or batched per the producer's declared capability
   (`batchSafe`), budgeting calls against the source's shared rate bucket (`cost:`);
3. **fetches** the external records through the named **producer**;
4. **materializes** them (and any `brings` sub-graph) as transient nodes carrying the
   extra `:Virtual` label and a `dateRetrieved` timestamp;
5. runs the user's query over the combined **real + virtual** graph;
6. **rolls back** — nothing persists.

Identity bridges are the one exception: they persist as a warm cache and re-resolve
after `refreshAfter`.

## Declaring a virtual join

```yaml
# types/hubspot.yml — fetched on demand, NOT mirrored
- name: HubSpotContact
  visibility: internal
  properties:
    id: { metadata: { identity: "true" } }   # MERGE key for dedup
    email: "Primary email."
    jobtitle: "Job title."
  virtualJoins:
    - anchorLabel: Person
      relationship: HAS_HUBSPOT_CONTACT
      keyField: email            # anchor property whose values become the producer keys
      recordKeyField: email      # field on each fetched record that maps it back (defaults to keyField)
      producer: contactsByEmail  # see producers/ below
      brings:                    # a fetched record may carry its own sub-graph
        - childType: HubSpotComment
          relationship: HAS_COMMENT
          records: "$.comments[*]"   # JSONPath within the record to the child list
          id: id
```

Fields: `anchorLabel`, `relationship`, `keyField`, `recordKeyField`, `producer`,
optional `materializedKeyField` (the property on every fetched TARGET record that holds
this join's key — lets `MATCH (p:Target {key: 'x'})` work with no door written),
optional `brings`, `maxAnchors`/`maxFanoutTotal` (caps).

**Rule (easy to get wrong):** a `virtualJoins:` entry is declared under the **target
type it produces** — the type it materializes — with `anchorLabel` naming where it
starts. `SIMILAR_TO` produces `Movie`, so it lives under `Movie` with
`anchorLabel: MovieRating`. Under the wrong type the planner registers it against the
wrong target and it silently never fires.

The anchor of one join can be the **virtual target** of another, and the engine stages
them in one read transaction (up to `MAX_STAGES` deep). **Keep every hop pattern-bound**:
the probe follows `MATCH` patterns. A node re-bound out of a list
(`WITH collect(run) AS runs … UNWIND runs AS f MATCH (f)-[:HAS_JOB]->(j)`) is NOT
probed — the second hop fetches nothing and returns no jobs; the failure is silent. Narrow
with `WITH run ORDER BY … LIMIT n` and hop from `run` itself. `OPTIONAL MATCH` over a
virtual hop is likewise not probed; use `MATCH`.

**Pinned literals:** a query may reach a virtual node by pinning the anchor with a
literal — `MATCH (g:GitHubIdentity {login:'octocat'})-[:RAISED]->(i:GitHubIssue)` —
even when no such node exists. The literal seeds a transient anchor, so a producer can
be keyed on a *named* identity (any GitHub login, not just the connecting user's),
fetched with the connecting user's credentials. A naked `MATCH (hc:HubSpotContact)`
with no join traversal is rejected.

## Producers

Source-specific fetchers a `virtualJoins.producer` references — declared once, reused.
Conceptually each is a **Repository** over an external store; the `kind` discriminator
picks the store. Each `.yml` in `producers/` is a list.

**Batch contract:** a producer takes ALL anchor keys at once and returns the matching
records — never one call per key (no N+1). Exception: a globally-ranked capped search
— set `batchSafe: false` so each key is fetched on its own call (else a low-volume key
is starved).

```yaml
# producers/hubspot.yml
- name: contactsByEmail
  kind: remote                    # a RemoteRepository — gateway op (realm handler or learned API)
  operation: objectsSearch
  queryArgs: { segment: string }    # typed request input from an edge's realm map
  sourceFilters: [segment]         # source capability; does not itself narrow a request
  records: "$.results[*].properties"
  keyArg: "filterGroups.0.filters.0.values"   # where the key LIST is injected (list mode)
  args: { objectType: contacts, filterGroups: [ { filters: [ { propertyName: email, operator: IN } ] } ] }
  cache: { kind: ttl, seconds: 300 }

# producers/github.yml — string mode: keys render into a query string
- name: issuesByAuthor
  kind: remote
  operation: search/issues-and-pull-requests
  records: "$.items[*]"
  args: { q: "is:issue {keys} {filters}" }     # {filters} ← predicate pushdown
  keyTemplate: "author:{key}"
  paging: { style: page, size: 100, maxPages: 10 }
  pushdown:
    - property: html_url
      qualifier: "repo:{value}"
      valuePattern: '(?:github\.com/|repos/)?([\w.-]+/[\w.-]+?)(?:/|$)'

# producers/warehouse.yml — relational source
- name: ordersByCustomer
  kind: sql
  datasource: warehouse
  query: "SELECT id, customer_email, total FROM orders WHERE customer_email IN (:keys)"
```

### Producer kinds

| kind | fetch | notes |
|------|-------|-------|
| `remote` (alias `api`) | a `gateway.<name>.*` op — a RemoteRepository | list mode (`keyArg` → array) or string mode (`keyTemplate` + `{keys}`); `records` JSONPaths the response |
| `sql` | a SELECT against a host-configured datasource, or a read-only stored procedure (`procedure:`) | keys expand into `IN (…)`; SELECT-only |
| `compute` | an in-process computation over the keys | scores / rollups — no external I/O; local, NOT a RemoteRepository |
| `vector` | top-k semantic similarity to the anchor | for joins with no key — similarity *is* the join |
| `generative` | GENERATES the edge rather than reading it — LLM world knowledge or a code function | pluggable generator (`llm` \| `function`); resolves each answer onto the type spine; provenance-stamped |
| `aggregate` | REDUCES an anchor's neighborhood to ONE node (fan-IN) — a per-principal/per-org summary | gathers via a scoped graph read; delegates to an existing LLM aggregation; TTL-cache = periodic refresh |

`cache:` is orthogonal to kind: `none` / `ttl` / `session` / `immutable`.

### `generative` and `aggregate` in one breath

- `generative` is **resumable / demand-driven**: the host re-probes (pushing a growing
  exclusion set) until `want` records survive the query's filters. Target-node
  predicates reach the generator as `constraints`; rejected candidates are fed back
  with the real values they were rejected on. Starvation is reported
  (`FILTER_STARVED`), never silent. Read the warnings, always.
- `aggregate` is fan-IN: gather the anchor's neighborhood, reduce to one node
  (e.g. a taste summary distilled from all ratings). Give its type a realm prefix so
  the label and edge can't collide with another realm's summary.

## Predicate pushdown (`pushdown:`) — scope the fetch at the source

By default the graph filters *after* materialization. Pushdown translates a query
predicate on the virtual *target* node into the source's native filter so the fetch is
scoped before it returns.

```yaml
pushdown:
  - property: html_url            # the target-node property the predicate is on
    op: contains                  # EQUALS (default) or CONTAINS
    qualifier: "repo:{value}"     # native fragment; {value} ← the predicate's value
    valuePattern: '…([\w.-]+/[\w.-]+?)(?:/|$)'   # optional regex; group 1 replaces {value}
```

So `WHERE i.html_url CONTAINS 'acme-corp/widgets'` turns `is:issue author:X {filters}`
into `is:issue author:X repo:acme-corp/widgets`.

**The rules that cost the most when broken:**

1. **Only a LITERAL is pushed.** `created_at >= '2026-09-16T…'` renders;
   `created_at >= toString(datetime() - duration({days: 7}))` does not — the value is
   not known when the fetch is planned. A view's declared params become literals
   before the query is read, which is how a windowed view gets a pushed window: take
   `since` as a parameter. A relative window ("the last 7 days") cannot be pushed by
   any spelling; say so in the view's description and bound the fetch with
   `paging.maxPages`.
2. **Declare EVERY filter the source accepts, not the obvious one.** Pushed `LIMIT`
   and `count()` happen only when the graph has *nothing* left to filter, so a single
   predicate your source could have applied and didn't forfeits both entirely — and
   the answer is identical, so nothing tells you. Read the source's own parameter list
   and cover it. A mined realm already has the list: the scaffold writes
   `sourceFilters:` onto each producer — that is your checklist.
3. **If the source applies no filters, write `pushdown: []`** and say why in a
   comment. An absent key is read as "not yet declared": the realm is warned at load
   and advised on every sizeable read. The empty list clears all three. Do not reach
   for it to silence a warning on a source that does filter.
4. **Verify pushdown against the live source.** Some sources ignore unknown filters
   SILENTLY (HTTP 200 with the whole unfiltered collection) — a typo becomes a
   full-collection scan that looks like a success. Call the source twice — with and
   without the filter — and confirm the **counts differ**. Declare rules only for
   keys you have proven narrow, and say so in a comment. Document which properties do
   *not* push down.
5. **`argPath` + `clause` for JSON filter payloads** (an Odoo domain, an
   Elasticsearch `bool.filter`):

```yaml
pushdown:
  - property: status
    op: IN
    argPath: payload.-            # `-` APPENDS to the list there
    clause:
      attribute_key: status
      filter_operator: equal_to
      values: "{values}"          # a node that IS "{values}" becomes the member LIST
    linkPrevious: { query_operator: AND }   # only if the source links to the PRECEDING element
```

`linkPrevious` exists for sources that spell conjunction as a field on the previous
clause, and where that field must be absent from the last one (Chatwoot is the
example: it answers HTTP 500 to a payload missing `query_operator`, and rejects one
that carries it on the final clause).

For `sparql`, `sql`, `cypher`, `tabular` and `feed` producers, pushdown entries name a
property, the operators it applies, and the value `type`
(`string`/`integer`/`decimal`/`boolean`/`date`/`dateTime`/`iri`); the filter lands at
the kind's declared slot (`{{filter:<property>}}` for sparql/cypher, appended `AND`
for sql, applied while reading for tabular/feed). `realm_validate` errors on a
declared entry whose slot is missing.

## Cost declarations: `maxAnchors` is about the SOURCE, not the number

`maxAnchors` bounds how many distinct keys one fetch may ask its source for — a
thousand anchors sharing three keys spend three. Its default assumes a **per-key**
source, where every key is another API call. A source that answers the whole key set in
one statement (a database, a file) is nearly free per anchor, and the host defaults
those far higher — so declare `maxAnchors` only when you know something the kind does
not imply: a metered API to protect (go lower), or a batch op behind a `remote`
producer (go higher).

And shape the view so the cap rarely matters: **narrow before an enrichment hop.**
Sort and `LIMIT` the rows you will show, *then* resolve their names — not the other
way round.

## Second doors and aggregates

A join is one call per anchor, and the anchor cap counts anchors rather than records —
so pushing a predicate on the target makes each call cheaper and leaves the number of
calls untouched. What changes it is another way in:

```yaml
virtualJoins:
  - { anchorLabel: CustomerAccount, relationship: HAS_CASE, keyField: accountKey, … }   # one per account
  - { anchorLabel: ChatwootDesk,    relationship: HAS_CASE, keyField: status,     … }   # one for the desk
```

A query pinning `c.status` has bound the second door's key already; pin it with
`{via:'…'}`.

Declare what your source can count with `aggregates:` — a query that only counts then
costs one call instead of one per anchor.

## What you DECLARE decides what the engine may do — the two-view rule

`collect(c.subject)` needs the records whatever else the query asks. So a view that
both counts and collects always pays the collecting price — including when the question
was triage across the whole book and nobody was going to read a subject.

```yaml
# Triage across every account — the source can answer this.
- name: HealthOpenCaseCountsByAccount
  cypher: |
    MATCH (a:CustomerAccount)-[:HAS_CASE]->(c:SupportCase)
    WHERE c.status IN ['open', 'pending']
    RETURN a.accountKey AS accountKey, count(c) AS openCases

# The detail pane, for the handful of accounts it is showing.
- name: HealthOpenCasesByAccount
  cypher: |
    MATCH (a:CustomerAccount)-[:HAS_CASE]->(c:SupportCase)
    WHERE c.status IN ['open', 'pending']
    RETURN a.accountKey AS accountKey, collect(c.subject) AS subjects
```

Say so in the descriptions — the counts view should point at the detail one. The same
applies to projecting the target bare: `RETURN c.subject, count(c)` needs the rows, so
the count cannot be pushed. If you want both, that is two views.

What blocks a pushed aggregate, in engine-check order: `count(*)`; any `collect` over
the target; the target projected outside an aggregate; a predicate on the target the
source does not absorb. Today `count` is delivered; `sum`/`min`/`max` are recognised
and left graph-side, and the engine pushes only when EVERY measure in the query is
deliverable.

## Production pitfalls (verified the hard way)

- **`project` paths: use `[*]`, never `[0]`.** An indexed path is not honoured and
  projects **null silently** — the only symptom is an empty property, and any predicate
  over it drops every row. `address: "Location[*].FullAddress"`, not
  `Location[0].FullAddress`. A single-valued nested field arrives as a one-element
  list the consumer must unwrap.
- **`project` takes paths, not expressions.** A JSONPath filter or function projects
  null silently. Project the parallel lists and derive in Cypher.
- **A declared type is what a value arrives as; an undeclared property arrives as the
  source encodes it.** A JSON feed that quotes its numbers sends strings. When the
  target type declares `int`/`long`/`decimal`/`number`/`boolean`, the fetched value is
  stored as that type; a property with no declared type keeps the source's own value,
  so `WHERE n.cost >= $min` on a quoted cost compares a string to a number and matches
  nothing. Declare the property's type, or coerce at the point of use.
- **Composite-key joins** (a lat/long point, an owner/repo slug): declare
  `producerKeyFields: [latitude, longitude]` and **omit `keyField`**. Each record must
  carry the exact composed key under `recordKeyField` (a `remote` producer gets this
  for free by declaring `echoKeyAs: key`). A remote producer destructures the composite
  back with `keyArgs` naming one argument per component — `keyArgs` implies one source
  call per key. Name every part in `keyArgs`, in order, even the ones the operation
  does not declare. A key with an empty path segment (a URL) is refused, not sent.
- **LLM query primitives (`ai` namespace)** work over any virtual collection your
  producer fetches — you declare nothing. `WHERE ai.relevant(n, '<criterion>')`,
  `ORDER BY ai.score(n, '<criterion>') DESC`. The `ai` namespace is **reserved** —
  never name a stored property or producer field `ai` or `ai_*`.

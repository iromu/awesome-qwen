# `types/` — dynamic type definitions

Custom input/output types for actions, signal types, and the data dictionary in general.
A type with `parents:` inherits properties from its parent types (JVM-known host types
or other realm-declared types).

```yaml
# types/github.yml
- name: GitHubIssue
  description: "A GitHub issue to process"
  properties:
    owner: "Repository owner"
    repo: "Repository name"
    issue: "Issue number"
    title: "Issue title"
    body: "Issue body"
```

A type whose `parents:` includes `Signal` (the host-defined signal base type) is a
**signal type** — automatically eligible for the consequence engine, triage rules, and
persistence as a `SignalRecord`.

```yaml
# types/stripe.yml
- name: StripeEvent
  parents: [Signal]
  description: "A Stripe webhook event"
  properties:
    eventType: "Stripe event type, e.g. charge.failed"
    amount: "Charge amount in minor units"
    currency: "ISO 4217 currency code"
    customerId: "Stripe customer id"
```

## Persistence (graph-backed)

Every entry created via `create_entry` for a type defined here lands as a node in the
world graph. Two consequences:

- **The entry's `name` is the host's headline for it.** The host picks one field per
  type — first `title`, then `name`, then `summary`. Add at least one if you want
  list/Cypher output to be human-readable.
- **Implicit edge to the acting human's `AssistantUser` node.** The compatibility
  default is `(entry)-[:OWNED_BY]->(principal)`. When the predicate reads more
  naturally the other way, declare `userAnchor:`:

```yaml
# types/movies.yml
- name: MovieRating
  description: "The user's score for a Movie."
  userAnchor:
    predicate: RATED          # uppercase; stored uppercase
    direction: from-user      # `principal -[RATED]-> rating` (default is `from-entry`)
  properties:
    imdbId: "IMDb id of the rated Movie."
    rating:
      type: int
      description: "1–10."
```

| Field | Default | Notes |
|-------|---------|-------|
| `predicate` | `OWNED_BY` | Cypher-style relationship name. Stored uppercase. |
| `direction` | `from-entry` | `from-entry` → `(entry)-[:PREDICATE]->(principal)`. `from-user` → the reverse. |
| (sentinel) | — | `userAnchor: false` opts the type out of the implicit edge entirely (reference data, registries). |

### Explicit relations between entries

`create_entry` accepts an optional `relations:` array to wire the new entry to an
existing entry in the host-bound visibility scope. The host emits each requested edge
on save; if any target can't be found, the whole create is refused (no orphan node, no
orphan edge).

```jsonc
create_entry({
  type: "MovieRating",
  data: { imdbId: "tt0113277", title: "Heat", rating: 9 },
  relations: [
    { predicate: "OF", to: { type: "Movie", imdbId: "tt0113277" } }
  ]
})
// (User)-[:RATED]->(MovieRating)-[:OF]->(Movie)
```

Each relation is `{predicate, to: {type, ...keyProps}}`. Use this pattern any time a
realm's typed records form a small connected graph (rating → movie, comment → ticket)
— the graph is then walkable by Cypher and feeds the recall path automatically.

## Population — mirroring a connected system (deterministic, no code)

A realm can declare a type the host **populates automatically from a connected
external system** — no LLM, no code in the realm. A structured record is already typed
at the source, so extracting it with an LLM is wasteful and error-prone. Declare a
*projection* in property `metadata:` and the host's projector does the rest.

Declare a **mirror type** that `parents: [Contact]` (within one visibility scope a
`Contact` is a `Person` resolved by email; merge key
`(worldId, visibilityScopeId, type, email)`):

```yaml
# types/hubspot.yml — populated from HubSpot CRM, no Kotlin in the realm
- name: HubSpotContact
  parents: [Contact]
  visibility: internal          # machinery, not a user-browsable repository type
  userAnchor: { predicate: OWNED_BY, direction: from-user }
  properties:
    email:                      # the deterministic merge key, and the spine it keys
      identity: true
      hub: Person
    jobtitle:                   # projects onto the canonical Person
      metadata: { canonical: "jobTitle" }
    company:                    # resolve + link a related entity
      metadata: { relationship: "WORKS_FOR", target: "Organization", matchBy: "name" }
    phone:
      cardinality: LIST
      metadata: { canonical: "phones", multivalued: "true" }
    # undeclared fields stay on the mirror, source-private
```

| Metadata key | Effect |
|--------------|--------|
| `identity: "true"` | This field's value is the email portion of the **merge key**: same key → one canonical `:Person` (no LLM entity resolution). Also unioned onto the Person's `emails`. |
| `hub: <Spine>` | **The opt-in.** This field's value keys the named spine — `Person`, `Organization`, or a spine a realm declares with `spine:`. Without a `hub:` a type is never canonicalized, whatever its `identity`. May sit on a property other than the identity one, when what identifies the record (a CRM id) is not what identifies the entity. |
| `canonical: <field>` | Project this source field onto the canonical Person's `<field>`. Single-valued → winner by host precedence then most-recent; `multivalued: "true"` (or `cardinality: LIST`) **unions** instead. |
| `relationship: <EDGE>` + `target: <Label>` + `matchBy: <prop>` | Create-or-match a `<Label>` keyed on `matchBy`, and link `(:Person)-[:EDGE]->(:Label)`. |
| *(none)* | Source-private — the value lands only on the per-record mirror node. |

**Storage model.** Each source record becomes a per-record mirror node
(`:<TypeName>:RemoteHandle`) holding raw fields + provenance, linked to one canonical
`:Person` holding the *resolved* values (queryable:
`MATCH (p:Person) WHERE p.jobTitle = 'CEO'`). The mirror's label is the namespace, so
two sources never clash on a field. A record with no email becomes a mirror-only
orphan (reaped in the background).

**When it runs.** Declaring the type loads nothing. Once the user connects the account
(OAuth), the host pulls on a schedule, checkpointed by a persisted watermark so a
large import drains over successive ticks and a mid-run failure retries the window
safely (projection is idempotent). The realm supplies only the type and the fetch (its
`apis/` OpenAPI op or a handler); the projector and scheduling are host-side.

## Spines and hubs — joining OTHER realms

> Full procedure: SKILL.md §"Spine vs parent label". Deep engine detail:
> VIRTUAL_CYPHER.md §5.4 (raw docs) and `LABELS_AND_COMPOSITION.md`.

A **spine** is a shared identity that records from *other* realms resolve onto, so a
CRM's customer, a helpdesk's company and a billing system's account are one node.
Declare it on a type with `spine:`:

```yaml
- name: CustomerAccount
  spine:
    key: accountKey
    identityProperties: [accountKey, website]
    normalize: [lowercase, extractDomain, stripTrailingDot]
    require: hasDot
    exclude: freemail
```

Attach your records with `hub:` on the property carrying the entity's key:

```yaml
- name: OdooCustomer
  properties:
    id:      { identity: true }          # the record's own id — joins key on this
    website: { hub: CustomerAccount }    # the ENTITY's key — this resolves to the spine
```

Rules (the easy mistakes):

1. **Two things → `parents:`; one thing → `spine:`.** `parents:` on a shared identity
   produces one node per system with nothing joining them — the host refuses it.
2. **`hub:` goes on the property that identifies the entity**, often not the one that
   identifies the record. Keep `identity: true` on the source's own id.
3. **Never normalize on your side.** Send the spine the raw value; the spine's
   `normalize` is the one definition of "the same".
4. **If the source can only be SEARCHED for your key** (no exact fetch), join on the
   record's own field: set `recordKeyField` to the source's field (`url`, `website`)
   and do NOT `echoKeyAs` — a substring search returns strays, an echo links every one
   of them, and the spine (which reads the record's field too) links only the right
   one. Then assert in `tests/verify.sh`: zero records linked to an anchor that is not
   theirs.
5. **Opt in from every system that can name the entity.** Spine nodes exist only once
   some realm's records have been read. A realm that keys the spine ships a small view
   over its door so a surface can read it first.
6. **Prove the join.** Run the two-realm question against live sources and assert a
   NON-ZERO count for an entity you know is in both. A cross-realm view that returns
   zero rows passes every other check you have.

Smells that the join is not really there:

- You seeded the same key by hand into both realms to make the demo work.
- Your producer has a rewrite whose only job is to match another realm's spelling.
- Your `policy:` ladder's fallback rungs exist because two systems format one key
  differently — that is a spine, not a ladder.
- `hub:` names a label that is not a spine in the world (typo, or the vocabulary realm
  is not installed). Nothing errors; nothing joins. The host logs it at world build.

## Identity bridges (`resolve:` chains)

For joins to an **external-identity node** (a bridge like `GitHubIdentity` /
`HubSpotOwner`), declare a `resolve:` rule chain + `writeThrough`/`refreshAfter`
instead of a plain virtual join. Bridges are the one exception to virtual-join
rollback: they **persist as a warm cache** and re-resolve after `refreshAfter`.

- `persist: true` is the older eager-only form and is refused on a join that is not a
  bridge.
- A list with more than one entry, or any join that can fan in, requires an
  `identity` property so convergent paths dedupe to one node.
- `echoKeyAs` on a producer tells the source to echo the key it was given back into
  the record when the source can't (a search returns the login, not the queried
  email).

See VIRTUAL_CYPHER.md §5.2–5.3 (raw docs) for the full contract.

## On-demand joins

For large/volatile collections, don't mirror — **virtual-join**. Declare
`virtualJoins:` on the type and a producer in `producers/`. See
`virtual-joins-producers.md`.

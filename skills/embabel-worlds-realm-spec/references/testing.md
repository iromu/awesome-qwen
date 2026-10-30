# Testing a realm — `tests/`, `seed/`, and the live-view loop

## The core fact: the declarative half has no unit tests

`npm test` covers `src/` handlers. It says **nothing** about the part of a realm that
usually breaks: producers, virtual joins and views are only exercised by a running
host against the real source. A realm whose YAML parses, whose types load, and whose
every query silently returns nothing is the normal failure — and it looks identical
to "the source has no data".

## Run every view against a live host, and require rows

Ship it as a test-views script under the realm's `scripts/` directory, so it is
repeatable by whoever inherits it:

```bash
docker compose up -d --wait          # if the realm provisions its own store
python3 scripts/load-<source>.py     # …and loads it
# start the host with this realm installed, then:
python3 scripts/test-views.py 8046   # every view, real params, non-zero rows required
```

**Call the host's own endpoints — never re-implement them.** Re-implementing
argument merging, defaults, coercion or literal substitution in your script produces
a copy of platform logic that can pass while the platform's own is broken:

| Want | Endpoint |
|---|---|
| discover views + their declared params/defaults | `GET /api/v1/admin/kg/views` |
| run one view with args (rows + warnings) | `POST /api/v1/admin/kg/views/{name}/run` |
| see the Cypher a view would run (debugging) | `POST /api/v1/admin/kg/views/{name}/invocation` |
| run verbatim Cypher through the engine | `POST /api/v1/admin/kg/execute` |
| **reload your realm's YAML — NO app restart** | `POST /api/v1/realms/{name}/update` |

That last one is the difference between a two-minute edit loop and a two-second one:
a realm referenced by local path is reloaded in place — edit YAML → update → re-run
the harness.

**Every view needs a case; a view with no case is untested.** Fail the run if any
view returns zero rows.

What that catches, every time, and static review does not:

- a join whose keys never match (0 rows, no error) — the single most common realm bug;
- a fetch that never happens because the planner refused the hop as too wide;
- a property that vanishes between the source and the graph (an unstorable type);
- a view whose Cypher is valid but whose shape resolves names for thousands of rows
  to show ten.

**Read the WARNINGS in every response, not just the rows.** A
`PRODUCER_ERROR` / `FIELDS_WITHHELD` / `INCOMPLETE_TRAVERSAL` / `UNPUSHED_FILTER`
note is the host telling you the answer is not what it appears to be — a 0-row result
with a warning is a broken realm, not an empty source.

## `tests/questions.yml` — if anyone types WORDS at the realm

Running every view proves the realm answers when called BY NAME. It says nothing
about the form most users actually meet it in — a question in their own words. Those
are different code paths: a realm whose every view returns rows while its
natural-language questions return zero, or answer confidently from the wrong join, is
not done.

**Judgment call, one hard trigger.** A realm that is verbs, handlers or enrichment —
called by code, never typed at — needs no battery. The moment any surface takes
words from a person it is REQUIRED: an `apps/` page with a free-text ask, a
`skills/`/`focuses/`/chat surface, views meant to be reached by asking rather than by
name, or a user who says they want to ask this realm questions. **If you cannot tell,
ask the user** — "will people type questions at this, or only call it?" — rather than
guessing.

Two halves:

1. **What it CAN answer.** One entry per question a person would really type.
   Reconcile figures with `matchesView: {name, column}` — the ask's number must
   equal the named view's, so the realm checks itself and the test survives data
   changes. `nonEmpty` is a floor, not an assertion: it once passed 72 rows of
   unrelated config as an answer to "how many places am I watching".

```yaml
# tests/questions.yml
- question: "Which customers owe us most money"
  expect:
    matchesView: { name: OdooReceivablesByCustomer, column: totalOwed }
- question: "How many customers do we have"
  expect:
    matchesView: { name: OdooCustomerCount, column: customers }
- question: "what was our biggest win last quarter"
  expect:
    nonEmpty: true
```

2. **What it CANNOT.** Questions whose answer the sources do not carry — a measure
   nobody publishes, the wrong granularity, a population the data never describes.
   Ask each one SEVERAL times: generation is stochastic, a fabrication that shows
   one run in five is still a fabrication. Check every response mechanically against
   `GET /api/v1/admin/kg/schema` — a property no label declares, or an answer column
   claiming a word the query never selects, is a fabrication and fails the run.
   Reading the queries by eye does not work; the failure mode is a query that looks
   entirely reasonable.

Every question that ever disappointed a user becomes a permanent entry. When the
battery fails, fix the REALM first — a missing view, a description that does not
carry the asking vocabulary, a `types/` `examples:` steer for a path the generator
keeps missing — before blaming the model.

## `tests/verify.sh` — the executable harness

Ground truth to answer surface in one command: reconcile figures against the SOURCE
system directly where reachable, invoke every view with every parameter, replay the
battery, run the adversarial questions N times each, exit nonzero on any drift. Run
it after every change to producers, views or types; run money questions more than
once. A harness that lives in the author's head re-verifies nothing.

**Scope the view sweep to THIS realm's own views** — a world carries other realms'
and the host's too, and a harness that fails on a neighbour's defect is a harness
people learn to ignore.

**Prove the cross-realm join with a test that would fail.** Run the two-realm
question against live sources and assert a NON-ZERO count for an entity you know is
in both.

## If the realm ships an `agents/` colleague, test it AS the agent

Running the views and the queries YOURSELF proves the realm. It proves nothing about
the agent. What the agent reaches is narrowed twice — by its focus, and by the
categories its `conversation.builtins` names — and then by which realms its binding
admits. **A realm-level check never counts as an agent-level check**, however
thorough it was.

1. **Ask the agent, as the agent.** `/talk <name>`, then the same two halves as
   `tests/questions.yml`. Asking the world instead, or over a developer door, tests
   a different surface.
2. **Require the TOOL CALL, not a plausible paragraph.** An agent answering from the
   model's own recall reads exactly like an agent answering from your realm, right
   up to the first figure that is wrong — so check what it called, not how the prose
   sounds.
3. **Every category you name is a claim to check.** Verify each one survives, by
   asking something that can only be answered that way. Confirm the capability,
   never the name.
4. **"The system had trouble finding…" is a FAILURE.** So is hedging or offering to
   look somewhere else, when a view in the agent's own realm answers the question
   outright. Treat it as the realm's bug and fix it there.
5. **Test the version that is in force.** A signed agent runs as SIGNED, persona
   included. Edit its definition or persona and the change waits for a signature —
   the agent answering you is the old one. Check for unsigned changes before you
   conclude anything, and sign first if you meant the edit to be live.

**Scope it narrowly before you test anything.** An agent is only as reliable as the
set of tools it chooses from. Read the surface a turn was actually offered — the
host reports it — and treat every tool outside the agent's job as a defect to remove
before you judge its answers. Do not fix a misbehaving agent by giving it a bigger
model. Fix what it is given — fewer tools, views that cannot return a plausible
wrong answer, exact call shapes in its persona — and test again on the same model.

## `seed/` — demo data for the SOURCE system

A realm demonstrated against an empty or fictional dataset proves plumbing and
nothing else — the joins that make a realm worth having need entities that actually
resolve on the other side. Two files, both optional:

- **`seed/records.yml`** — the records, declaratively, so the person approving the
  seed reads exactly what will exist afterwards. The house pattern is **fictional
  relationship, real entity**: the customer "Qantas" does not owe you $40,000, but
  qantas.com is a real domain, so every enrichment join lights up — while a
  name-matched fake would attach someone else's company to your record.
- **`seed/seed.sh`** — applies `records.yml` **through the same door the producers
  use** — the source's public API, authenticated as a normal user. Never its
  database. Three properties are not optional:
  - It **refuses to run blind** — the target URL must be stated and a confirmation
    flag passed (`--yes`).
  - It is **idempotent** — look each record up by a natural key before creating it.
  - Its records are **recognizable** — mark what you create (`SEED-` prefix, a tag),
    so seeded records can be listed and removed (`seed.sh --remove`).

The engine never runs seeds. A person runs it, on a system they have decided is
disposable.

# `agents/`, `decorations/`, `apps/`, `personalities/`, `focuses/`, and the small surfaces

## `agents/` — named colleagues

An **Agent** is a named colleague a realm proposes: a job, the routines that do its
work, and the duties it keeps. Where `events/` produces signals, an agent's
**Routines** react to them or to a cron schedule. Everything here is a proposal — the
world that installs the realm decides who answers for the agent, what it may do, and
whether it runs, so a realm never declares those things.

```yaml
# agents/reviewer.yml
name: reviewer                        # stable id; the world shadows a realm agent of the same name
job: Make sure nobody waits on a review from me
routing: Pull requests, review requests, who is waiting on whom   # "ask me about…"
persona: terse                        # optional; a personality the host already has
routines:
  - name: pr-review
    description: When a review is requested on one of my PRs, notify me
    match:
      signalType: github.pr_review_request   # a Signal type name; "*" = any
    schedule: "0 0 8 * * *"          # optional 6-field cron; fires on a schedule too
    spec:
      kind: typescript
      module: pr-review.routine.ts    # sibling file under agents/, inlined at load (or inline source: |)
sweeps:
  - name: review-history
    view: stale-review-sweep          # a view of this realm's, taking no arguments
    budgetPerTick: 60
```

| Field | Required | Meaning |
|---|---|---|
| `name` | yes | Stable id. A world agent of the same name shadows the realm's. |
| `job` | yes | One sentence, in the words of the person who will answer for it. |
| `routing` | no | What to ask this agent about, for a host that routes questions to colleagues. |
| `persona` | no | A personality the host has, or one this realm ships, named `<realm>/<slug>`. |
| `conversation` | no | How the agent is talked to (below). |
| `routines[]` | no | The work it does without being asked. `match` (signal), `schedule` (cron), or both. `spec.kind`: `typescript`, or `function` to target a manifest-declared Realm Function. |
| `duties[]` | no | Conditions it keeps true, each naming the view, lens or DERIVE label that should hold. *Forward-looking.* |
| `sweeps[]` | no | Cold materializations it keeps filled, each naming a view of this realm's. |
| `state` | no | Only `retired`, to withdraw an agent the realm used to ship. |

**What a realm does not declare:** `sponsor`, `owners`, `operators`, the agent's
stage. A realm agent arrives off duty, unsponsored and unsigned.

### Sweeps

Some materializations are too big for one query's patience. The realm that declares
the producer ships the sweep with it. The host runs it as a **fill**: the view's query
re-run on a schedule, each pass bounded by `budgetPerTick` and paced by every
producer's own `cost.rate`, finished when a pass buys nothing.

- **Installing the realm starts nothing.** The sweep runs only after somebody
  sponsors the agent, signs it and puts it on duty.
- **It spends the agent's budget and reaches only what the agent may reach.**
- **Anybody who can stop the agent stops the sweep.**
- **A realm update cannot change what an adopted sweep asks** — the view's text is
  part of what was signed.
- A sweep is not a schedule. It converges and stops; re-assessing something that
  keeps changing is a routine with a `schedule`.

### Stage: off duty, observing, on duty

Whether a routine runs, and whether it may change anything, is its agent's **stage**,
set by the world and never by the realm:

| Stage | Meaning |
|---|---|
| Off duty | Nothing it holds runs. |
| On duty, observing | Routines run against a read-only gateway: they read and judge, every effect is refused and reported. |
| On duty | Routines run and may take effects. |

### Signed versions

A world runs the version of an agent its sponsor last **signed**: the definition,
each routine's body and trigger, a digest of every view a duty names, and the persona
files as they render. A realm update, an edit, or a changed view appears as an
unsigned change and reaches nothing until the sponsor signs again. **An agent that
has never been signed runs nothing** — when testing, check for unsigned changes
before concluding anything, and sign first if you meant the edit to be live.

### Talking to an agent — the `conversation` block

```yaml
conversation:
  realms: [realm-bible]                  # default: the realm that ships the agent
  builtins: [memory, views]              # host tools kept; name the fewest the job needs
  skills: [diagrams]                     # skills by name, beside what realms and builtins bring
  llm: chat_best                         # an LLM role, never a model; default: the host's chat role
  sampling:
    maxTokens: 2000
authority:
  default: never
```

**Scope it to the job.** A model chooses among the tools it is shown, and every tool
outside the job is one more wrong turn it can take: offered forty tools, a scripture
agent reached for entity search, a vector search and a code runner instead of the view
that answered, then filled the gap from its own recall — fluent, confident, and
wrong. Offered the handful its job needs, the same model ran the view.

- Start from `builtins: [memory, views]` for an agent that answers from a realm's
  views; add a category only when the agent cannot do its job without it.
- A view that retrieves inside itself (a producer) needs no `documents` or `graph`
  category.
- `builtins` categories: `code`, `graph`, `views`, `data`, `memory`, `documents`,
  `attachments`, `images`, `artifacts`, `apps`, `host`. Omitted means all, which is
  almost never what an agent should have.
- **A category brings every tool in it; a name brings one skill.** If the agent needs
  one skill its categories leave out, name it in `conversation.skills` instead of
  widening `builtins`.
- A realm's skills still arrive only with the realm, through `realms` — naming a
  skill another realm ships, without that realm in `realms`, is refused.
- **What a view returns when a parameter is missing matters.** A default that is a
  real value answers a careless call with something plausible and wrong. For
  anything an agent reads, a missing parameter should return nothing, or mean
  "today", never a sample.

**Testing an agent (required when you ship one with a `conversation:` block):** ask
the agent AS the agent (`/talk <name>`), not the world. Require the TOOL CALL, not a
plausible paragraph — check what it called, not how the prose sounds. Every category
you name is a claim to check. "The system had trouble finding…" is a FAILURE when a
view in the agent's own realm answers the question — fix the realm (a missing view, a
description that doesn't carry the asking vocabulary, a category it doesn't name),
not the model.

### What an inline routine sees

The triggering event is bound in scope as one normalised shape:

```ts
signal.id, signal.typeName, signal.subject, signal.occurredAt
signal.source.{ kind, id, label, url }
signal.properties.<field>   // type-specific fields — the event's mapping keys
trigger                     // "signal" | "cron"
now                         // ISO-8601 timestamp of this run
dryRun                      // true when being tested
```

A routine reacts through the typed `gateway.*` surface — read with
`gateway.kg.query`, judge with `gateway.ai.classify`, act with Realm Functions or
`gateway.notifications.createNotification`. Reads are always safe; **guard every
external effect with `if (!dryRun)`**.

## `decorations/` — scheduled KG node enrichment

A realm drives enrichment of nodes already in the graph by binding a realm-declared
`action` to a set of Neo4j labels and a cadence. The host's scheduler walks candidate
rows, invokes the action per node, and persists the result.

```yaml
# decorations/contact-enrich.yml
name: hubspot-contact-enrich       # required; stable kebab-case id (used as stamp key)
targetLabels: [HubSpotContact]     # required; ≥ 1 Neo4j label
action: enrichHubSpotContact       # required; an action declared in this realm's actions/
tickInterval: PT6H                 # ISO-8601 duration (default PT6H)
batchSize: 25                      # candidate rows per tick (default 25)
concurrency: 4                     # parallel decorate calls within a tick (default 4)
refreshAfter: P7D                  # ISO-8601 duration; null/omitted = one-shot
```

The referenced action receives one node snapshot (`nodeId`, `nodeName`,
`nodeLabels`, `nodeProperties`) and returns a structured `DecorationResult`
describing what to write: `propsToSet` (properties to MERGE) and `edgesToMerge`
(relationships to MERGE, idempotent). The host owns persistence and stamps the row
(`<name>DecoratedAt`); the action stays pure. Empty result is fine — the row is
stamped regardless, so it doesn't re-run before `refreshAfter`.

**Anti-patterns:** self-persisting actions (return via `DecorationResult`, don't
call gateway methods to write graph properties); cross-realm dependencies in the
manifest (call through the gateway from inside the action body); sweeping when an
event works (decorations are for what can't be done event-driven — refreshes,
federations, cross-source joins).

## `apps/` — HTML apps

Realm-bundled apps are served at `/apps/{realm-name}/{name}.html`. A user can shadow
a realm-bundled app by vibe-coding one with the same filename; realm apps are
read-only from the user's perspective and refreshed whenever the realm is updated.

- The manifest entry takes a `title` — the name shown for the app (an acronym needs
  it spelled: `"title": "CI Health"`).
- **Ship the Embabel badge** — a fixed-position `<div id="embabel-badge">` linking to
  worlds.embabel.com before `</body>`. Nothing injects it into a realm-shipped app.
- An app should invoke a named Lens or view through the host's typed invocation
  surface; it should not accept or submit arbitrary Cypher or JavaScript from a
  browser.

> Captured realms: browser apps run sandboxed with **no network**. Declare each page
> under `apps` with the handlers it may call; the page reaches the realm only through
> `realm.call(handler, args)`. One `realm.call` at a time — `await` each before the
> next. No `fetch`, sockets, or remote scripts/styles/images/fonts; bundle everything
> and declare CSS/JS under `resources` (`apps/<page>.assets/`), embedding images and
> fonts as `data:` URLs.

## `personalities/` — voices

Each subdirectory under `personalities/` is one persona — its voice, behaviours,
guardrails, and display name. The host renders the chat system prompt by including
Jinja templates from the active persona's directory; switching personality is a
directory swap.

```
personalities/roger/
├── identity.yml          # name: (display), description: (picker label)
├── brief.yml             # optional: the persona for a single non-chat call
├── personality.jinja     # voice / character
├── behaviours.jinja      # do/don't rules
├── guardrails.jinja      # safety constraints
├── response_format.jinja # output-shape rules
└── verbosity.jinja       # length / pacing
```

All `.jinja` files are optional. `brief.yml` is the persona compacted for a **single
non-chat call** (a realm verb that calls a model directly): `objective` (what the
persona is trying to achieve — a persona with one advocates; one without answers),
`openingMove`, `notebook` (the sets it keeps), `sampling` (what it RUNS at — distinct
from an agent's `conversation.sampling`, which bounds what a *caller* may ask for).
A persona with no `brief.yml` is chat-only.

The slug (directory name) must be unique across the world; on collision with a
world-authored personality, the world wins. A realm's personality is referenced by
slug from a `focuses/` file or the host's persona picker.

## `focuses/` — scoped chat surfaces

A **focus** is a named scoping of the chat surface — a subset of realms whose skills
the chat LLM can see, plus an optional persona override. The point is routing
reliability: a 30-skill world gives even a sharp realm skill room to lose to a
competitor; strip the competitors out and the LLM has nothing to confuse the right
skill with.

```yaml
# focuses/movies.yml
name: movies
displayName: Movies
description: "Recommend, rate, and recall films"
icon: "🎬"
defaultPersona: roger
realms: [movie]
builtins: true
```

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Stable slug — used by `/focus <name>`, the picker, and persistence. |
| `defaultPersona` | No | Persona slug to activate when a session enters this focus. |
| `realms` | No | Realm names whose skills stay visible. Empty = no realm skills. |
| `tools` | No | By-name allowlist of additional tools/skills, additive with `realms`. |
| `builtins` | No (default `true`) | `true` all, `false` none, or a list of categories. Name the fewest the focus needs. |
| `skills` | No | Skills brought in by name — same rules as an agent's `conversation.skills`. |

`/focus <name>` binds the session; `/focus off` clears; bare `/focus` lists. On slug
collision, the world entry wins.

## `skills/` — on-demand LLM guidance

Skills follow the Agent Skills specification. Each skill is a subdirectory containing
a `SKILL.md`. Loaded as references — the agent activates them on demand for
specialized tasks. This is where the real workflow guidance lives (tool names,
call shapes, edge cases, idiomatic patterns) — NOT in `prompts/`.

When a skill flow needs the user to pick from a **small closed set**, return a
`choices` payload as the result and STOP — no recording or lookup action until the
user picks:

```json
{"kind": "choices",
 "question": "<one short question>",
 "options": ["<option>", "..."],
 "context": { "<ids the follow-up turn needs>": "..." },
 "hint": "Present these options to the user and wait for their pick."}
```

## `prompts/` — a tax on every turn

Optional content **appended to every chat system prompt** for every user with the
realm installed. Currently supports `examples.md`. Bytes added here are paid by
every user, every turn (reference host: 1024 bytes/realm soft ceiling). **Treat
`prompts/` as a pointer, not a manual** — tell the LLM the capability exists and
where to find the routing detail:

```markdown
HubSpot CRM is available — contacts, companies, deals, tickets, owners,
pipelines, associations. Activate the **`hubspot-crm`** skill via the
skill tool before making any HubSpot call; the skill carries the
workflow patterns, namespace conventions, and required-field details.
```

The substantive routing content goes into `skills/<realm>-skill/SKILL.md`.

## `notebook/` — what a persona keeps across a conversation

Each file under `notebook/` is one reusable **set** of typed **slots**; a persona
includes sets by name (in its `brief.yml`). Slot types: `ordinal`, `stage`,
`count`, `ratio`, `boolean`, `text`, `list`, `entities` (`{label, id, name?}`
graph references — not strings). Two names are reserved behaviour: `askedToStop` and
`inDistress` are brakes — once true they stay true, and while either is set the host
withholds the persona's `objective`.

The host updates slots once per turn, **before** the reply is written (extracting
afterwards leaves every slot one turn stale — for a brake that is a defect). A realm
**declares** notebook sets; the world **grants** them.

## `hints/` — tips for the humans

Tips the realm ships, shown by the host's UIs as tip-of-the-day cards. A realm that
adds an answer surface ships the tips that teach it. Hand-authored, deliberately — a
derived tip (restating a view description at the user) is the machine talking to
itself.

```yaml
# hints/tips.yml
- category: hint            # hint | did-you-know | fun-fact
  surface: all              # me | console | all
  title: Ask about risk
  body: "Ask **which deals are at risk** — every open deal judged from its own chatter."
  action:
    label: Ask it
    chatInput: "which deals are at risk"
```

`action.chatInput` lands in the asking surface's input box when clicked — pre-typed,
not pre-sent, so the question stays the user's to edit.

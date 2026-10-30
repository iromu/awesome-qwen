# `actions/` and `goals/`

Action specifications — YAML files that define executable operations. The host's
planner picks them by their declared input/output types and runs them as GOAP actions.
The `stepType` discriminator selects the shape; the framework resolves either a
registered short name (`action`, `goal`) or a fully-qualified class name
(`com.example.MyCustomActionSpec`) to an `ActionSpec` class on the classpath.

| `stepType` value | Shape |
|---|---|
| `action` | Framework `PromptedActionSpec` — typed LLM call producing `outputTypeName` |
| `<FQN>` | Any other `ActionSpec` subtype on the classpath — for host-extension shapes whose YAML contract isn't stable enough for a short name |

**Short name vs FQN:** a short name is a public contract — once realm authors write it,
you can't change the spec's shape without breaking their YAML. Reserve short names for
stabilised shapes. An FQN that appears in published realm YAML is itself a public
identifier — a host that moves or renames the class must keep the old name resolvable.

## `stepType: action` — typed LLM call

The LLM produces a typed object the planner can chain into other actions.
`nullable: true` declares that the LLM may return null (no output) — the planner sees
the missing binding and replans.

```yaml
# actions/triage-issue.yml
stepType: action
name: triage-issue
description: "Triage a GitHub issue"
inputTypeNames:
  - GitHubIssue
outputTypeName: TriagedIssue
prompt: |
  Triage issue #{{gitHubIssue.issue}} in {{gitHubIssue.owner}}/{{gitHubIssue.repo}}.
tools:
  - github
cost: 0.5
value: 1.0
```

Fields: `name`, `description`, `llm` (LlmOptions, optional), `inputTypeNames`,
`outputTypeName`, `pre`/`post` (extra preconditions/effects), `cost`/`value`
(UtilityAI economics, default 0), `canRerun` (default false), `prompt`,
`toolGroups`/`tools`/`references` (optional), `nullable` (default false), `export`
(auto-generate a chat-callable goal, default false).

## LLM-judged signals — `AttentionVerdict`

LLM-judged attention rules are vanilla `stepType: action` PromptedActionSpecs whose
output is an `AttentionVerdict` (a typed `{reason, confidence, tier}` value) and which
declare `nullable: true` so the LLM can return null = "skip". The host provides a
generic wrap action that lifts `(AttentionVerdict, Signal)` to `AttentionCandidate`,
keyed off those inputs so it composes with any LLM-judgment realm.

```yaml
# actions/triage_email_attention.yml
stepType: action
name: triage_email_attention
description: Judge whether an email thread warrants the user's attention
inputTypeNames:
  - email.thread
outputTypeName: AttentionVerdict
nullable: true
prompt: |
  Judge whether the thread is worth {{user}}'s attention.
  Return a verdict if so; return null to skip.
  Thread:
  {{emailThread}}
cost: 0.5
value: 1.0
```

## Deterministic rules — host-extension via FQN

Cheap, no-LLM rules over a single signal — fires when its predicate matches and writes
an `AttentionCandidate`. Use FQN dispatch:

```yaml
# actions/policy_pr_review_overdue.yml
stepType: com.embabel.world.policy.spec.PolicyActionSpec
name: pr_review_overdue
description: A review was requested from you and it's been over 48h
inputTypeNames:
  - github.pr_review_request
whenExpr: "reviewer == $self and age >= 48h"
cost: 0.01
value: 1.0
```

### `whenExpr` — the predicate DSL

A boolean expression over the matched signal's fields.

**Operators** (lowest → highest precedence): `or`, `and`, `not` (prefix), `==`, `!=`,
`<`, `<=`, `>`, `>=`, `in` (membership).

**Literals:** `"..."` string; `42`/`3.14` number; `true`/`false` boolean;
`30s`, `5m`, `48h`, `7d`, `2w` durations.

**Identifiers:** dotted paths walk the signal's fields — whatever the `inputTypeNames`
DomainType declares is reachable. Unresolvable paths fail the comparison (logged, not a
parse error), so a misspelled field surfaces as "rule never fires".

**Special tokens:**
- `$self` — the user's identity bundle (username + configured aliases). Use in `==`,
  `!=`, or as LHS of `in`.
- `age` — derived `now - signal.occurredAt` as a Duration: `age >= 24h`.

**Grouping:** `()` for explicit precedence.

Worked examples:

```
reviewer == $self and age >= 48h
$self in participants and last_sender != $self and age >= 24h
mentioned == $self and not acknowledged
source.kind == "email" and message_count > 1
```

### How policies and LLM-judgment actions compose

For each fresh signal of type `T`, the host runs one `AgentProcess` whose goal is "an
`AttentionCandidate` exists on the blackboard". Every loaded action whose preconditions
match `T` is a candidate; UtilityAI picks in value-minus-cost order. A cheap
deterministic rule (cost 0.01, value 1.0 → utility 0.99) wins over an LLM action
(0.5 → utility 0.5) — the cheap rule runs first, writes the candidate, the goal is
satisfied, and the LLM call never happens. When the cheap policy doesn't match, its
`hasRun_<name>=TRUE` blocks re-picking; the planner then picks the LLM action.

Actions are deployed to the host's planner on world load.

## `goals/`

Goal specifications — multi-step workflows composed of actions:

```yaml
# goals/fix-issue.yml
stepType: goal
name: fix-issue
description: "Triage and fix a GitHub issue"
inputTypeNames:
  - GitHubIssue
outputTypeName: BackgroundMessage
```

> Captured realms: legacy `goals/` files are reported and never parsed on a governed
> host — declare a version-1 captured goal that binds one approved handler to
> Realm-declared input and output types instead (see `captured-realms.md`).

# Decision & Classification Services (v1.5.4, experimental)

Embabel v1.5.4 adds a family of **decision** and **classification** services (all
`@ApiStatus.Experimental`). A decision service asks a model typed questions about one piece
of state; a classification service picks one category ID from a closed set. Use them when you
need closed-category routing, proposition assessment ("is this urgent?"), or ratings — with the
model's answer as *evidence* and the application still owning routing, authorization and policy.

> **Experimental:** every type on this page carries `@ApiStatus.Experimental`. The API is
> maintained as production code but may change before promotion. Owner: James Dunnam
> (`@jimador`).

## Service contracts

| Type | Extends | Model family | Operations |
|------|---------|--------------|------------|
| `DecisionService` | `ClassificationService` | `ModelType.DECISION` | `assess`, `classify`, `ask` |
| `ClassificationService` | — | `ModelType.CLASSIFICATION` | `classify` |

`DecisionService` extends `ClassificationService`, so **every decision service also classifies**
and can be injected as a `ClassificationService`. Neither is an `LlmService` or a Spring AI
`ChatModel`. A classification-only service cannot be a *decision* default or role.

The contracts live in `embabel-agent-ai`, package `com.embabel.common.ai.decision` (and
`com.embabel.common.ai.classification`). Selection is in `com.embabel.common.ai.model`.

## Three question kinds

| `QuestionKind` | Builder methods | Result type | Wire name |
|----------------|-----------------|-------------|-----------|
| `PROPOSITION` | `asking` | `PropositionResult` | `proposition` |
| `CHOICE` | `asking`, `option(id, description)` (≥1 option) | `ClassificationResult` | `choice` |
| `RATING` | `asking`, `level(label)` / `level(id, description)` (≥2, lowest first) | `RatingResult` | `rating` |

Every question needs a nonblank name and nonblank instructions; option/level ids must be nonblank
and unique within the question.

## Selecting a service

Inside a workflow, `Ai.decisions()` returns a `ServiceSelector<DecisionService>` and
`Ai.classifications()` returns a `ServiceSelector<ClassificationService>`. Each selector has four
terminals, and each returns the service itself:

| Terminal | Returns | Throws |
|----------|---------|--------|
| `defaultService()` | The family default | `ServiceSelectionException` (`NO_DEFAULT`, `AMBIGUOUS_DEFAULT`, `UNKNOWN_NAME`) |
| `named(name)` | The service registered under `name`, or a provider service for a model of that name | `ServiceSelectionException` (`UNKNOWN_NAME`, `WRONG_CAPABILITY`) |
| `byRole(role)` | The service bound to `role` in this family | `ServiceSelectionException` (`UNKNOWN_ROLE`, `UNKNOWN_NAME`) |
| `using(service)` | The given service (not registered; wrapped in an observed service inside a workflow) | nothing |

```java
DecisionService decision = ai.decisions().byRole("support-triage");
ClassificationService classifier = ai.classifications().defaultService();
```

Roles are **scoped to one family**: a role bound under `embabel.models.decision.roles` is unknown
to `classifications().byRole(...)`, and the reverse holds. The classification family holds every
registered service (a decision service also classifies).

`ServiceSelectionException` is an `IllegalStateException`; its `reason` is one of the values above.
Its message names the requested name/role, the eligible services, the role bindings, the default,
and the fix (the property to set, e.g. `embabel.models.decision.roles.<role>`). No terminal falls
back to an LLM — a registry with no services supports only `using(service)`.

## Asking

`DecisionService` has two `ask` overloads — `ask(input, spec)` and `ask(request)` — both returning
a `DecisionResponse` with one answer per question in spec order. Provider failures come back as
typed failure outcomes; a service that implements `QuestionSetExecution` answers the whole spec in
one `askQuestionSet` call, any other service answers each question in its own call. `ask`,
`assess` and `classify` throw **no checked exception**; an interruption surfaces as an unchecked
`java.util.concurrent.CancellationException` (cause `InterruptedException`, interrupt flag left set).

```java
DecisionResponse response = decision.ask(
    "My card was charged twice",
    DecisionSpec.of(isUrgent, department, frustration));
```

A single `classify`, `assess` or `rate` call is a question set of one. A `ClassificationRequest`
is also a `DecisionRequest`, so `ask(request)` accepts one and
`response.answer(spec.getQuestion())` returns the classification result.

## Outcomes

| Kind | Outcome classes |
|------|-----------------|
| `PropositionResult` | `Answered(boolean)` (with optional `pTrue`), `Inconclusive`, `Failure` |
| `ClassificationResult` | `Selected(categoryId)` (with optional confidence), `NoMatch`, `Inconclusive`, `Failure` |
| `RatingResult` | `Answered` (selected level / distribution / score, see `decision-specs.md`), `Inconclusive`, `Failure` |

`Failure` carries a bounded `FailureReason` (e.g. `INVALID_RESPONSE`, `UNAVAILABLE`). Both `true`
and `false` are successful proposition assessments; `Inconclusive` and `Failure` are distinct from
a negative answer. Every non-`Failure` result carries a `ModelProvenance` (model name + provider).

## Registry

`DecisionServiceRegistry` holds the registered services, family defaults and role bindings. In
Spring the auto-configured `decisionServiceRegistry` bean depends on every `ProviderInitialization`
bean, so catalog model beans are present when the registry snapshots its services. In plain Java,
build one with `DecisionServiceRegistry.builder()`:

| Builder method | Effect |
|----------------|--------|
| `register(name, service)` | Registers a `ClassificationService` or `DecisionService` under a name |
| `decisionDefault(name)` / `classificationDefault(name)` | Sets a family default |
| `decisionRole(role, name)` / `classificationRole(role, name)` | Binds a role in one family |
| `defaultCandidate(name)` | Offers a registered service as a family default candidate |
| `provider(provider)` | Adds a `DecisionModelProvider` for names no registered service holds |
| `build()` | Validates bindings, builds the registry, logs one INFO summary |

`build()` throws `IllegalArgumentException` for a blank/repeated name, one instance under two
names, or a default/role/candidate naming a missing or ineligible service. A default or role may
name a model a provider serves (resolved on first selection and cached).

### Family default resolution order

1. The explicit default (`embabel.models.decision.default` or `decisionDefault(name)`).
2. The single default candidate eligible for the family.
3. The single service eligible for the family.

Otherwise `defaultService()` throws `ServiceSelectionException`. The classification family
resolves the same way with `embabel.models.classification.default`. A model served by a provider is
a default **only when configuration names it**.

## Configuration

Decision models are configured the way chat models are — a provider starter registers one service
bean per catalog model, named after the model. These properties select services:

| Property | Default | Purpose |
|----------|---------|---------|
| `embabel.models.decision.default` | none | Model or registration name of the decision family default |
| `embabel.models.decision.roles.<role>` | none | Model or registration name bound to a decision role |
| `embabel.models.classification.default` | none | Model or registration name of the classification family default |
| `embabel.models.classification.roles.<role>` | none | Model or registration name bound to a classification role |
| `embabel.agent.platform.decisions.capture-content` | `false` | Turns on TRACE content capture (see `decision-providers.md`) |

Startup fails when a default or role names neither a registered service nor a provider model, or
when a decision default/role names a classification-only service; the error names the property. A
missing or ambiguous default fails at lookup, when `defaultService()` is called.

```yaml
embabel:
  models:
    decision:
      default: jev-latest
      roles:
        support-triage: gpt-4.1-mini   # a chat model, used for prompted decisions
```

An application bean replaces configuration: a `DecisionServiceRegistry` bean replaces the
auto-configured registry; a `TypeSafeModelFactory` bean replaces the TypeSafe configuration (no
catalog models register, no credential required); an `LlmDecisionServiceFactory` bean replaces the
prompted decision factory and chat-model provider.

## Capabilities and hooks

`DecisionService.capabilities()` returns the `DecisionCapabilities` (the question kinds a service
accepts). The default derives from the hook interfaces the service implements:

| Hook interface | Enables |
|----------------|---------|
| (none) | Proposition via `assess`, choice via `classify`, one call each |
| `PropositionAssessment.assess(input, question)` | Proposition questions, one call each |
| `RatingAssessment.rate(input, question)` | Rating questions, one call each |
| `QuestionSetExecution.askQuestionSet(request)` | The whole spec in one call |

The default always includes proposition and choice (every decision service is a classification
service). A service that implements no hooks fails the preflight for a rating question. A request
whose kind is not in the capabilities throws `UnsupportedDecisionException` (an
`UnsupportedOperationException`) before any provider call, with a remedy in the message.

## Observations

Wrap a service in `ObservedDecisionService` / `ObservedClassificationService` (passing your
`ObservationRegistry`) to observe it, or rely on the auto-wrapping inside a workflow. Each call
records one logical observation and leaves the underlying call to record its own:

| Observation | When |
|-------------|------|
| `embabel.ai.ask` | Each `ask` (one `answer.<kind>.<outcome>` event per question) |
| `embabel.ai.decision` | Each `askQuestionSet`, `assess`, `rate` |
| `embabel.ai.classification` | Each `classify` (including a choice asked on its own) |

## Service families

| Family | Service | Notes |
|--------|---------|-------|
| System One (Jev, CLEF) | `SystemOneDecisionService` | Every outcome; `pTrue`/distribution/score evidence |
| Prompted LLM | `LlmDecisionService` | Every outcome; verdict-based, no confidence |
| No-op | `NoOpDecisionService(name)` | `Failure(UNAVAILABLE)` for every question; for disabled config |
| Stub | `StubDecisionService.builder(name)` | Scripted outcomes, for tests; `calls()` returns calls made |

See `decision-specs.md` for building/reading specs and `decision-providers.md` for TypeSafe,
Cloudflare, the System One protocol, prompted LLM decisions, and BYOK.

*Source: Embabel Agent v1.5.4 documentation — `references/decision-execution`, `references/classification`, `references/decision-providers`*

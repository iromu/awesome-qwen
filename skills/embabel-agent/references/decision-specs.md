# Decision Specs (v1.5.4, experimental)

A decision spec is an ordered set of named questions that a model answers in one decision. A
decision response holds the model's answer to each question. The types are in `embabel-agent-ai`,
package `com.embabel.common.ai.decision`, and carry their own Jackson annotations. This page covers
building, serializing and reading specs and responses; `decisions.md` covers selecting a service
and running a spec on it. Every type is `@ApiStatus.Experimental`.

## Types

| Type | Holds |
|------|-------|
| `DecisionRequest` | The input text and one `DecisionSpec` |
| `DecisionSpec` | An ordered list of `Question` values with unique names |
| `Question` | A kind, a name, instructions, and the options or levels for its kind |
| `DecisionResponse` | An optional request failure and one `DecisionAnswer` per question in spec order |
| `DecisionAnswer` | The question's name and kind, its options or levels, and a typed outcome |

A response holds no question objects, no instructions and no input — code can read a response
without the spec that produced it.

## Builder (Java)

```java
DecisionSpec spec = DecisionSpec.builder()
    .proposition("is_urgent", p -> p.asking("Does the customer need a response today?"))
    .choice("department", c -> c
        .asking("Which team should handle this?")
        .option("billing", "Payments, invoicing, refunds")
        .option("technical", "Bugs, outages, integrations"))
    .rating("frustration", r -> r
        .asking("How frustrated is the customer?")
        .level("Calm").level("Frustrated").level("Very angry"))
    .build();
```

`DecisionSpec.builder()` starts an empty builder. The `proposition`, `choice` and `rating` methods
each take a question name and a customizer that runs once, before the method returns. A blank or
repeated name throws `IllegalArgumentException` (the customizer does not run). `build()` returns a
new spec on each call and throws `IllegalArgumentException` when no question is declared. A builder
is not thread-safe. A spec is immutable: `getQuestions()` returns questions in declared order,
`question(name)` returns the question or `null`, and two specs are equal when they hold equal
questions in the same order.

## Kotlin DSL

```kotlin
val spec = decisionSpec {
    proposition("is_urgent") { asking("Does the customer need a response today?") }
    choice("department") {
        asking("Which team should handle this?")
        option("billing", "Payments, invoicing, refunds")
    }
    rating("frustration") {
        asking("How frustrated is the customer?")
        level("Calm"); level("Frustrated"); level("Very angry")
    }
}
```

`decisionSpec { }` builds a spec from a receiver block on `DecisionSpecScope`; the block runs once
and each call goes through the matching `DecisionSpec.Builder` method, so a DSL spec validates
exactly like a builder spec. `DecisionSpecScope.question(question)` adds a question built earlier.
Java code does not see `decisionSpec` or the scope methods.

## Named questions

`Questions.named(name)` starts a question on its own; its `proposition`, `choice` and `rating`
methods take the instructions and return the builder for that kind. A question built this way can
live in a field, join several specs, and read its typed answer from a response.
`DecisionSpec.of(questions...)` / `DecisionSpec.of(List)` and
`DecisionSpec.Builder.question(question)` add questions built earlier.

## Classification specs

A `ClassificationSpec` is a decision spec with **one choice question** (the builder names it
`classification`). It equals a `DecisionSpec` holding the same question and writes the same JSON.
A `ClassificationRequest` is a `DecisionRequest` whose spec is a `ClassificationSpec`.

```java
ClassificationSpec spec = ClassificationSpec.builder()
    .asking("Which kind of animal is this?")
    .category("dog", "A canine, e.g. a puppy or dog")
    .category("cat", "A feline, e.g. a kitten or cat")
    .build();
ClassificationRequest request = ClassificationRequest.of(input, spec);
```

`asking` sets the instructions (required, nonblank); at least one `category` is required and
category ids must be nonblank and unique. Each category is a `Category` with a stable `id` and a
description of when it applies. `ClassificationSpec.of(question)` wraps a choice question you
already have and keeps its name. In Kotlin, `classificationSpec { }` builds the same spec.

### Mapping a selection to an application value

`CategoryMapping<T>` pairs each category with an application value (an enum constant or a class
token such as `Rabbit.class`). `spec()` returns the `ClassificationSpec` built from them,
`request(input)` a request, and `map(result)` turns a selection into the value.
`fromEnum(enumType, instructions, description)` uses enum names as ids. The provider receives
category definitions, not authority to instantiate objects. `map` throws `IllegalArgumentException`
for an unknown selected id (it never turns it into a no-match); it preserves no-match, inconclusive
and failure outcomes.

## Responses

`DecisionResponse.builder(spec)` starts a response to a spec; its `answer(question, outcome)`
overloads take a question of each kind with the matching result type. Answers can be added in any
order, and the response lists them in spec order. `DecisionResponse.failed(spec, reason)` records a
request that failed as a whole. `build()` throws `IllegalArgumentException` when a question of the
spec has no answer.

A response read from JSON or storage is checked answer by answer, with no reference to a spec.
`requireMatches(spec)` checks it against a spec — it throws `IllegalArgumentException` when an
answer is missing, extra or out of order, or when an answer's kind/options/levels differ.

### Typed lookup

```java
PropositionResult urgent = response.answer(isUrgentQuestion);   // typed
DecisionAnswer dept = response.answer("department");           // by name
```

`answer(question)` returns the outcome with the result type of the question's class — the question
can be a different object from the one that built the response, but it must have the same name and
kind (a choice answer's options or a rating answer's levels must equal the question's).
`answer(name)` returns the `DecisionAnswer` with that name. `DecisionAnswer` is sealed, with
classes `DecisionAnswer.Proposition`, `DecisionAnswer.Choice` and `DecisionAnswer.Rating` — a Java
`switch` or Kotlin `when` over an answer covers every case. An answer holds no instructions, so a
question whose instructions were reworded still matches.

## Rating evidence

`RatingResult.Answered` holds optional evidence:

| Property | Type | Rule |
|----------|------|------|
| `provenance` | `ModelProvenance` | Required |
| `selectedLevelId` | String, optional | Nonblank; one of the question's level ids |
| `distribution` | `List<LevelProbability>` | Empty, or covers exactly the question's levels; each probability finite in [0,1]; sums to 1 within `1e-6` |
| `score` | `RatingScore`, optional | Finite, ≥ 0, ≤ index of the last level |
| `confidence` | Double, optional | Finite, in [0,1] |

A `RatingScore` pairs a value with a `RatingStatistic` — the one statistic is
`EXPECTED_LEVEL_INDEX`, the probability-weighted mean of the zero-based level positions. The checks
against the question's levels run when a result is validated against a `RatingQuestionSpec` or added
to a response; the other rules run at construction.

## Requests and capabilities

`DecisionRequest.of(input, spec)` pairs an input with a spec; `DecisionRequest.of(input,
questions...)` builds the spec from the questions in order. The input may be empty; a request's
`toString()` shows the spec and leaves the input out. `DecisionCapabilities.of(questionKinds)`
describes what a service accepts.

## JSON format

Each decision type has fixed member names:

| Type | Members |
|------|---------|
| `Question` | `kind`, `name`, `instructions`, then `options` (choice) or `levels` (rating) |
| `DecisionSpec` | `questions` |
| `DecisionRequest` | `input` and `spec` |
| `DecisionCapabilities` | `questionKinds` |
| `DecisionResponse` | the optional `requestFailure`, and `answers` |
| `DecisionAnswer` | `name`, `kind`, `options` or `levels` for its kind, and `outcome` |

Each outcome has a `status` member naming its result class: `answered` (proposition, with
`answer` + optional `pTrue`; rating, with optional `selectedLevelId`/`distribution`/`score`),
`selected` (choice, with `categoryId` + optional `confidence`), `no_match` (choice), `inconclusive`
(with `provenance`), `failure` (with `reason`). Failure reasons and rating statistics use lower-case
constant names (`invalid_response`, `expected_level_index`); question kinds use the wire names from
the kinds table. A `provenance` object has `modelName` and `provider`, optional `version` and
`requestId`. Response JSON holds no instructions and no input.

Any Jackson 3 mapper reads and writes the decision types with no module registered. Reading fails
(`DatabindException`) on an unknown member, a missing required member, an unknown kind/status/reason/
statistic, or a value the builders refuse; it does not compare a response with a spec (call
`requireMatches(spec)` for that).

## Projection

`DecisionProjection.of(response, type)` reads the response's answered values and converts them to a
caller type with Jackson; the result holds the converted `value` and the original `response`.
`DecisionProjection.answeredValues(response)` returns the values as a map keyed by question name:

| Answer | Value |
|--------|-------|
| Proposition | the `answer` of a `PropositionResult.Answered` |
| Choice | the `categoryId` of a `ClassificationResult.Selected` |
| Rating | the `selectedLevelId` of a `RatingResult.Answered` |

Any other outcome has no value (nor does a rating answered with only a score or distribution); both
calls then throw `DecisionProjectionException`, whose `getQuestions()` lists every answer without a
value. A record whose component names match the question names receives the values; `type` is a
`Class<T>` or `TypeReference<T>`. A Spring `Converter<DecisionResponse, T>` reads each answer with
typed lookup and gives a value for every outcome class, including inconclusive and failed answers.

*Source: Embabel Agent v1.5.4 documentation — `references/decision-specs`, `references/classification`*

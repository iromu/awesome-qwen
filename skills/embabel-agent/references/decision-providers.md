# Decision Model Providers (v1.5.4, experimental)

A `DecisionService` can be answered by a decision model (Jev, CLEF), by a chat model prompted to
decide, or by your own code. Decision models are configured the same way chat models are: put a
provider starter on the classpath and it registers one `DecisionService` bean per model in its
catalog, named after the model. Defaults and roles pick a model by name.

| Source | How a model becomes available | Example name |
|--------|-------------------------------|--------------|
| Catalog starter | Loads `models/<provider>-models.yml`, defines a bean per entry; inject by type or `@Qualifier("<model>")` | `jev-latest`, `clef` |
| `DecisionModelProvider` bean | The registry asks the provider the first time a default/role/`named` lookup uses a name no bean holds | a chat model name, e.g. `gpt-4.1-mini` |
| Application bean | A singleton `DecisionService`/`ClassificationService` bean registers under its bean name (a `@Lazy`/scoped bean is left out) | `triage` |

A registered bean wins over a provider model with the same name. A provider model is a family
default only when configuration names it. A provider builds services that use the deployment's own
credentials; per-user keys go through `using(service)`.

## System One protocol

System One is a JSON protocol for decision models. One request asks a model several typed
questions about one piece of state; proposition answers carry a truth probability, choice and
rating answers carry a distribution and confidence. Jev (TypeSafe) and CLEF (Cloudflare) speak it,
and any other endpoint that speaks it works with the same client.

The integration has two parts: `SystemOneCodec` (writes requests, reads responses; in
`embabel-agent-ai`, `com.embabel.common.ai.decision.systemone`, no HTTP) and
`SystemOneModelFactory` (sends requests to an endpoint, builds a `DecisionService` per model; the
`embabel-agent-systemone` module, `com.embabel.agent.systemone`).

An endpoint answers question sets at `POST /v1/systemone` and lists models at `GET /v1/models`.
Questions are keyed `q1` to `qN` in spec order (the application's question names are replaced in
the wire JSON). A proposition goes out as a `noul`, a choice as a `choice` (options as criteria),
a rating as a `score` (level descriptions in level order). The codec reads the envelope strictly —
the whole request fails with `INVALID_RESPONSE` when the body is not one JSON object, repeats a
member, has trailing content, or has no `answers` object — then reads each answer on its own, so
one bad answer fails only its question.

`SystemOneEndpoint` settings:

| Setting | Default | Purpose |
|---------|---------|---------|
| `provider` | required | Provider name in provenance, logs and observations |
| `baseUri` | required | Endpoint address (absolute http/https, no user info/query/fragment) |
| `connectTimeout` / `readTimeout` | 10s each | The factory's own client timeouts |
| `maxResponseBytes` | 1 MiB | Largest response body read |
| `requestIdHeader` | none | Response header carrying the provider's request id |

`build(model)` sends the name as is and never contacts the endpoint (an unserved model fails on
its first call); `modelNames()` asks the endpoint which models it serves (reads the System One
listing `{"models":[{"name"}]}` and the OpenAI shape `{"data":[{"id"}]}`, which Ollama serves).
There are **no retries** — each call is one attempt. A failed call fails every question with one
reason: `UNAVAILABLE` (status outside 2xx → `rate_limited`/`http_4xx`/`http_5xx`/`other`, timeout,
connection, credential) or `INVALID_RESPONSE` (body over the limit, unreadable envelope, rejected
answers).

### Running decision models locally (Ollama)

The CLEF weights are open (Apache 2.0), and Ollama serves them at the standard `/v1/systemone`
path — so CLEF runs on your own machine through the plain System One client, with no key and no
account. Jev is a hosted TypeSafe model with no local build.

| Ollama model | Size | Download | Input |
|--------------|------|----------|-------|
| `clef-flash` | 9B | 12 GB | Text and images |
| `clef` | 27B | 18 GB | Text and images |

Both need Ollama 0.35.1+; the integration sends text state only. Pull and probe:

```bash
ollama pull clef-flash
curl http://localhost:11434/v1/systemone -H 'Content-Type: application/json' -d '{
  "model": "clef-flash",
  "state": "I was charged twice for one invoice.",
  "questions": { "q1": { "type": "noul", "instructions": "Is this a billing problem?" } }
}'
```

Point a local endpoint at Ollama (the key supplier returns null) and build the model; in Spring,
declare the factory and each model as beans — `embabel.models.decision.default: clef-flash` makes
the local model the default.

## TypeSafe (Jev)

TypeSafe is the provider; Jev is its decision model. Jev speaks System One, so the TypeSafe
integration is the System One client set up with TypeSafe's address, its provider name, its
request-id header and the `jev-latest` model. `DecisionService` extends `ClassificationService`,
so every Jev service does both and reports `ModelType.DECISION`. Use Jev for closed-category
classification, proposition assessment or ratings from a decision model with no chat model involved.

Add `com.embabel.agent:embabel-agent-starter-typesafe`. Supply `TYPESAFE_API_KEY` or configure:

```yaml
embabel:
  agent:
    platform:
      models:
        typesafe:
          api-key: ${TYPESAFE_API_KEY}
```

Properties under `embabel.agent.platform.models.typesafe`: `api-key` (none), `base-url`
(`https://api.typesafe.ai`), `max-response-bytes` (`1048576`). A nonblank env value takes
precedence; both are read through the Spring environment on every call, so a rotated key takes
effect without rebuilding the service. Startup fails when neither source supplies a key.

Auto-configuration contributes: `TypeSafeModelsConfig` (itself a `TypeSafeModelFactory`, inject by
that type); one `DecisionService` bean per catalog model (`jev-latest`), each also injectable as
`ClassificationService`; `typeSafeDefaultCandidate`, which offers `jev-latest` as the default of
both families (exists only when the starter defines the `jev-latest` bean; an application bean with
that name replaces the model and withdraws the candidate — set the default explicitly in that case).

Jev never answers `NoMatch` — declare "none of the above" as a category and map it in application
code. A proposition goes to Jev as a `noul`; Jev treats exactly `0.5` as undecided
(`Inconclusive`), above it `Answered(true, ...)`, below it `Answered(false, ...)`, kept as `pTrue`.
A Jev service answers a whole decision spec in one call; the rating score is an expected level
index with a distribution over the levels and no selected level.

`TypeSafeModelFactory` works without Spring — pass the key as a `Supplier<String>` so each call
reads the current key. `build()` returns `jev-latest`; `build(model)` another Jev model. Building
never reads the key or contacts TypeSafe. A missing key fails each call with `UNAVAILABLE` (cause
`credential`) before anything is sent; `buildValidated()` rejects it with `InvalidApiKeyException`
(`TypeSafe credential is missing`) without contacting TypeSafe.

## Cloudflare Workers AI (CLEF)

Cloudflare Workers AI runs System One decision models behind its REST API. It hosts the CLEF models
itself and runs TypeSafe's Jev as a third-party model. The integration is the System One client
with a binding for that API.

| Catalog name | Model id | Hosted by |
|--------------|----------|-----------|
| `clef` | `@cf/cloudflare/clef` | Cloudflare |
| `clef-flash` | `@cf/cloudflare/clef-flash` | Cloudflare |
| `clef-omni` | `@cf/cloudflare/clef-omni` | Cloudflare |
| `cloudflare-jev` | `typesafe/jev` | TypeSafe (third-party) |

`clef` is a 27B model, `clef-flash` a faster 9B model, `clef-omni` a mixture-of-experts model that
also reads audio (this integration sends text only). Cloudflare bills third-party models such as
Jev through AI Gateway, from gateway credits or a provider key stored in the gateway; without
either, Cloudflare refuses Jev calls. The CLEF models work on the same token.

Add `com.embabel.agent:embabel-agent-starter-cloudflare`. Supply `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` (the token needs Workers AI access; the account id must be 32 hex chars,
read once at startup). Properties under `embabel.agent.platform.models.cloudflare`: `api-key`,
`account-id`, `max-response-bytes` (`1048576`).

Auto-configuration contributes `CloudflareModelsConfig` (itself a `CloudflareModelFactory`), one
`DecisionService` bean per catalog model (`clef`, `clef-flash`, `clef-omni`, `cloudflare-jev`), and
`cloudflareDefaultCandidate`, which offers `clef` as the default of both families. A default
candidate applies only when it is the only one — with the TypeSafe starter on the classpath too,
neither `jev-latest` nor `clef` becomes a family default and `defaultService()` fails until you set
`embabel.models.decision.default` / `embabel.models.classification.default`.

The CLEF schema takes 1–64 questions, 2–255 options per choice and 2–10 levels per rating; a request
outside those limits throws `UnsupportedDecisionException` before the token is read. `build()`
returns `clef`; `build(model)` another Workers AI model by its full id.

## Prompted LLM decisions

A prompted decision service is selected by naming a chat model in a decision or classification
default or role. `LlmDecisionServiceFactory` (in `embabel-agent-api`,
`com.embabel.agent.spi.decision`) is a `DecisionModelProvider` for every chat model the
`ModelProvider` lists, so the registry builds the prompted service the first time the name is
selected. The factory builds services in code with four methods: `decisionService(String llmName)`,
`decisionService(LlmService<?>)`, `classificationService(String llmName)`,
`classificationService(LlmService<?>)`.

```java
@Bean
DecisionService smallChatDecision(LlmDecisionServiceFactory factory) {
    return factory.decisionService("small-chat-model");
}
```

A supplied `LlmService` goes straight to the service (no model-provider lookup) — pass one to use a
user's own API key: validate the key with a BYOK factory (see `customizing.md`), then pass the
`LlmService` that `buildValidated()` returns. The credential stays inside that `LlmService`, so the
application needs no global credential property for it.

Retry settings live under `embabel.agent.platform.decisions.llm` and apply to every service the
factory builds: `max-attempts` (5), `backoff-millis` (100), `backoff-multiplier` (5.0),
`backoff-max-interval` (180000). A prompted service asks the whole spec in one chat-model call and
reads a JSON array of answers; a proposition answer is `TRUE`/`FALSE`/`INCONCLUSIVE`, a choice
answer `SELECTED`/`NO_MATCH`/`INCONCLUSIVE`, a rating answer `RATED`/`INCONCLUSIVE`. Prompted
outcomes carry no confidence, distribution or score. Startup fails when a default or role names a
chat model the provider does not list.

## BYOK

`TypeSafeModelFactory`, `CloudflareModelFactory` and every other `SystemOneModelFactory` implement
`ByokFactory<DecisionService>`. `buildValidated()` reads the key once, lists the endpoint's models
with it, and returns the default model; a blank key, a rejected listing or an unreachable endpoint
throws `InvalidApiKeyException`. Pass the returned service to `using(service)` for a per-user key.

## Diagnostics

`TransportFailureDiagnostics` categorizes HTTP failures, rate limits, connection failures and
timeouts for logs. A failed model call with interruption evidence escapes the retry callback as
`DecisionInterrupted`, then becomes a `CancellationException`.

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `ServiceSelectionException` `UNKNOWN_NAME` | No service of the family has that registration name | Use a name from the message, or register the service |
| `ServiceSelectionException` `UNKNOWN_ROLE` | The role is not bound in this family | Set `embabel.models.<family>.roles.<role>` |
| `ServiceSelectionException` `WRONG_CAPABILITY` | The decision family was asked for a classification-only service | Select it through `classifications()`, or register a decision service under that name |
| `ServiceSelectionException` `NO_DEFAULT` / `AMBIGUOUS_DEFAULT` | No explicit default, and zero or several eligible candidates/services | Set `embabel.models.<family>.default` |
| `UNKNOWN_NAME` for an app-created service | The service was registered after the registry bean was created | Pass the service to `using(service)` |
| `UnsupportedDecisionException` | The service lacks a kind or the hook for a kind | Apply the remedy in the message |
| Every answer `Failure(UNAVAILABLE)` | The provider is unreachable or rejected the call | Check the endpoint, credential and provider status |
| Every answer `Failure(INVALID_RESPONSE)` | The provider's reply could not be matched to questions | Turn on content capture locally and inspect the reply |
| Every answer `Failure(UNAVAILABLE)`, provider `none` | The selected service is a `NoOpDecisionService` | Configure a provider service and make it the default |

### Content capture

Content capture logs the request and response content at TRACE. It needs two settings together:
`embabel.agent.platform.decisions.capture-content: true` (or `DecisionContentCapture.enable()` in
plain Java) **and** TRACE on the logger concerned. The switch alone logs nothing; TRACE alone logs
no content. **Warning:** captured lines hold the decision input and provider output, which can
contain personal or confidential text — turn content capture on only for local diagnosis.
`DecisionContentCapture` is a process-wide switch.

### Loggers

Loggers are named after their classes. Key ones:
`com.embabel.common.ai.model.DecisionServiceRegistry` (INFO summary per registry),
`com.embabel.common.ai.decision.spi.DecisionExecution` (WARN failed/partial request; DEBUG routing;
TRACE content when capture is on),
`com.embabel.common.ai.decision.spi.DecisionResponseAssembler` (WARN answer anomalies),
`com.embabel.common.ai.decision.support` (INFO/DEBUG no-op and stub calls),
`com.embabel.agent.systemone` (INFO/WARN/DEBUG/TRACE System One calls). Lines up to DEBUG hold no
input, instructions, option/level text, received category ids, credentials or provider text.

*Source: Embabel Agent v1.5.4 documentation — `references/systemone`, `references/typesafe`, `references/cloudflare`, `references/llm-decisions`, `references/decision-providers`*

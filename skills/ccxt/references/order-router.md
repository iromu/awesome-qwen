# ccxt Order Router

`OrderRouter` is two tools sharing one class: a client for the CCXT router service (cheapest way to turn asset A into asset B across many venues, accounting for depth, fees, and bridge assets such as `SOL -> USDT -> BTC` when no `SOL/BTC` market exists) and a multi-venue execution engine for any plan, including hand-built ones — that path needs no router service and no `apiKey`. It is not an exchange: it does not extend `Exchange` and is constructed directly (`new ccxt.OrderRouter()` / `ccxt.OrderRouter()`).

Naming: Python `snake_case` (`fetch_route`), JS/TS `camelCase` (`fetchRoute`); parameter and field keys are camelCase in all languages.

## The service

- Base: `https://router.ccxt.com`. Every endpoint is public — no API key, no signup; rate-limited by client IP. An `apiKey` is still accepted and sent as `x-api-key`; with no key the header is omitted, not sent empty.
- Contract: OpenAPI 3.1 at `https://router.ccxt.com/openapi.json` — the authority on every field; if client and spec disagree, the spec is right. Free for now, up to the published rate limit.
- Rate-limit headers on every response: `x-ratelimit-limit`, `x-ratelimit-remaining`, `x-ratelimit-reset` (seconds to window reset), `retry-after` (on `429` and `503`). Exceeding the limit raises `RateLimitExceeded` with the retry interval in the message.
- **A `403` is never an authentication failure**: the only `403` is the IPv4-only refusal (IPv6 refused; `::ffff:a.b.c.d` normalised). The client raises `PermissionDenied` — reach the service over IPv4.

### Read-only endpoints

| Method | Answers |
|---|---|
| `fetchHealth ()` | is the process alive — `200` from the first millisecond of boot |
| `fetchReadiness ()` | can it route yet: book counts and freshness. Gate deploys on this, not `fetchHealth` |
| `fetchVersion ()` | deployed commit |
| `fetchSymbols ()` | unified symbols it currently holds a book for |
| `fetchExchangesStatus ()` | per-venue connection health |
| `fetchCachedOrderBook (exchangeId, symbol)` | the exact book a route was ranked on |

`fetchReadiness` does not throw on "no" — the `503` body is returned so you can read `status`, `freshCount`, `bookCount`. `/metrics` (Prometheus) has no client method. A freshly restarted router refuses to route with `503 cache_cold`; the client raises `ExchangeNotAvailable` (retryable) with counts and interval, e.g. `OrderRouter: cache is cold (0 of 12 books fresh, 1 needed), retry after 5s`.

### watchRoute

`watchRoute (from, to, params, hook)` streams `/stream/route` over WebSocket, pushing a frame whenever any leg of any candidate path moves; each frame is stamped like `fetchRoute`'s answer. Return `'stop'` from the hook to close the stream and get the last route back; return `'continue'` to keep watching. Differences from `fetchRoute`: `balances`/`balanceMode` are refused client-side (a long-lived stream cannot update holdings); `includeQuotes` defaults to false (true on REST); refusals arrive as close codes — `1008` raises `BadRequest`, `1013` (cold cache) raises `ExchangeNotAvailable`; a failed upgrade maps like REST (`401` `AuthenticationError`, `403` `PermissionDenied`, `429` `RateLimitExceeded`). A throwing hook stops the stream and the exception reaches you (unlike `execute`'s `onStep`). Implemented in TS/JS, C#, Go, Rust; **Python and PHP raise `NotSupported`** (synchronous ports). `streamUrl` is available in all ports.

## Route parameters

Exactly one of `amountIn` / `amountOut` is required; everything else optional.

| Parameter | Meaning |
|---|---|
| `amountIn` | how much of `from` to spend — a notional walk of the book |
| `amountOut` | how much of `to` to end up with — a quantity walk. Not supported across a bridge |
| `strategy` | `best_single`, `split_optimal` or `split_capped` — changes how many venues a hop uses, nothing else |
| `maxVenues` | per-hop venue cap for `split_capped` |
| `exchanges` | venue allowlist (string or list) |
| `bridges` | intermediary assets to consider for a two-hop route |
| `balances` | holdings as `[exchangeId.]ASSET:amount` entries; sends the request as POST |
| `balanceMode` | `cap` (default) trims size to holdings; `require` refuses instead |
| `includeQuotes` | per-venue diagnostic |
| `includeFees` | rank on fee-adjusted price, default true |
| `certified` | restrict to CCXT-certified venues |
| `requireFullFill` | refuse to quote rather than return a partial fill |
| `hopPenaltyBps` | how much better a bridged route must be, per extra hop |
| `minLegNotional` | suppress legs below this quote notional and reallocate the freed size |
| `requestId` | caller-chosen audit id, sent as `x-request-id` |
| `requireBalancesApplied` | client-side only, default true (below) |

Gotchas: an **empty value is not an omission** — `bridges=` means no bridging (omit for the default set), `exchanges=` means no venues, `balances=` means you hold nothing. `fetchRoute` sends `GET` unless `params.balances` is set, then `POST /route` with every parameter in the body so holdings never land in proxy/CDN/`Referer` logs (`fetchRouteWithBalances` uses the same path). The client verifies two flags: with `balances`, `fetchRoute` throws unless the router echoes `balancesApplied` (or `balanceEntryCount` for an empty wallet) — opt out with `requireBalancesApplied: false`; `requireFullFill` is stamped onto the route and `checkExecutionPlanSafety` makes `partial_fill` blocking. Route answers carry `effectiveRate`, `impactBps`, `fillRatio`.

## The pipeline

Routing and executing are separate. Everything between route and orders is pure (no I/O, identical in all languages); `execute` is the only impure method and **places orders** — there is no permission flag, just as `createOrder` has none.

| Method | I/O | Does |
|---|---|---|
| `fetchRoute (from, to, params)` | HTTP | asks the router for a route |
| `fetchRouteWithBalances (from, to, venues, params)` | HTTP + venues | reads live balances from supplied exchange instances first |
| `buildExecutionPlan (route, options)` | none | flattens hops/legs into ordered concrete orders |
| `checkExecutionPlanSafety (plan, markets, options)` | none | per-venue market rules + per-trade USD notional cap |
| `execute (routeOrPlan, [venues], options)` | places orders | takes a route as well as a plan; venues default to the router's |
| `marketsOf (venues)` | loads markets | the dict `checkExecutionPlanSafety` wants; `execute` builds it for you |
| `reconcileExecutionStep (plan, i, realisedOut)` | none | compares a step's output to prediction; resizes downstream or halts |
| `buildUnwindPlan (report)` | none | reverse orders selling stranded residuals back toward the from-asset |

Minimal run (given a route, `execute` builds the plan, loads markets, runs `checkExecutionPlanSafety` and **throws** on any blocking violation):

```js
const route = await router.fetchRoute ('USDT', 'BTC', { 'amountIn': 1000 });
const report = await router.execute (route, { 'binance': binance, 'kraken': kraken }, {
    'strategy': 'sequential', 'usdRates': { 'USDT': 1 },
});
```

Intermediate stages stay public for inspect/veto: `buildExecutionPlan(route, {'slippageBps': 50})`, then `checkExecutionPlanSafety(plan, markets, {'maxNotionalUsd': 25})` — a violation with `blocking: false` is advisory (amount/price precision usually are). Hold venues on the router: `new OrderRouter ({ venues })` filters routes to venues you hold and is where `execute` sends orders; add `trackBalances: true` to read wallets once (cached like `loadMarkets`; `loadBalances()` primes, `loadBalances (true)` refreshes, a live `execute` drops the cache before dispatch, `router.invalidateBalances()` for real-time via your own `watchBalance ()`).

### Strategies

| Strategy | Behaviour |
|---|---|
| `sequential` | **default.** One order at a time in plan order, reconciling after each, obeying the halt verdict |
| `parallel_within_hop` | legs of a hop concurrently, hops strictly in order; serialised within a single venue instance |
| `limit_protected` | rests a limit order, polling every `pollIntervalMs` (default 1000, positive) until filled or `orderTimeoutMs` (default 20000) elapses, then cancels; a partial fill is kept and reconciled; a failed cancel is recorded in `openOrders` |
| `atomic_ish` | sequential, but requires the whole route pre-funded so a shortfall does not resize the next hop |
| `best_effort` | places what it can, never halts; single-hop only, demands explicit acknowledgements |

### Options and guards

- `dryRun: true` rehearses without a single venue call; `strategy` says *how*, `dryRun` says *whether*.
- **Plan freshness**: every report carries `planAgeMs` (`-1` = unknown when the route had no `calculatedAt`). Pass `options.maxPlanAgeMs` to refuse stale plans before anything reaches a venue; under a limit, unknown-age plans are refused too. No default limit.
- **Notional cap is opt-in**: pass `maxNotionalUsd` (constructor or per call); omit or `0` for no check, negative refused. Under a cap it is re-checked before **every** `createOrder` (reconciliation may have resized the plan); market orders are refused (lift the cap or drop `allowMarketOrders`), and a step that cannot be valued in USD blocks — supply `options.usdRates` for every quote asset (not required without a cap).
- **Identity required for a live run**: `execute` refuses a plan with no `plan['requestId']` or `options.idempotencyKey`; the instance remembers it and refuses a second `execute` of the same plan (`options.allowReexecution: true` to re-run on purpose). Make the key stable per intent, not `Date.now()`. `execute` never sets a `clientOrderId` itself; `options.orderParams` reach every order untouched. The guard is in-process only and concurrent `execute` calls for the same plan can race.

### Executing your own plans

`execute` reads only a plan's `steps`, `calculatedAt` and identity, so a hand-built plan (or one from JSON/DB) is first-class. Required step fields: `exchangeId` (key into `venues`), `symbol` (unified), `side` (`buy`/`sell`), `amount` (base units), `base`, `quote`. Optional: `stepIndex` (defaults to array position), `hopIndex` (steps sharing one are a hop — what `parallel_within_hop` parallelises and reconciliation chains), `legIndex`, `expectedPrice` (what `impactBps` and reconciliation measure against), `limitPrice` (used by `limit_protected`), `notionalQuote` (used by the cap). Run `checkExecutionPlanSafety` first — minimum amount, minimum cost and precision are where hand-written amounts go wrong.

### Watching and stopping a run — `onStep`

`options.onStep` is called after each step **and its reconciliation**; return `'halt'` to stop (sets `haltReason: halted_by_on_step`); it can only narrow — nothing resumes a route reconciliation halted. The event dict carries `planId`, `stepIndex`, `hopIndex`, `legIndex`, `exchangeId`, `symbol`, `side`, `status`, `requestedAmount`, `filledAmount`, `outAsset`, `outAmount`, `orderId`, `clientOrderId`, `errorCode`, `attempt`, `reconciliation`, `ordersPlaced`, `halted`, `haltReason`, `stepsTotal`, `stepsRemaining`. It is called on halt paths too; do no network I/O in it (it sits on the money path); a throwing hook does not fail the run — it is recorded as `on_step_hook_failed` in `report['errors']` and execution continues. For I/O-dependent decisions, slice the plan and `execute` per hop, each with its own `idempotencyKey`.

### Retrying a rejected step

`options.retryFailedSteps` (default `0`) re-places a step **the venue definitively rejected**, up to that many times, `options.retryDelayMs` (default `1000`) apart; the winning attempt is reported as `attempt`. An `outcome_unknown` step is **never** retried — it may already be a live order.

## Reading the report

`execute` returns a report whose `steps[]` mirrors the plan. Three fields deserve attention:

- `status: 'outcome_unknown'` — the request may or may not have reached the venue; execution halts with `haltReason: 'outcome_unknown'` instead of reconciling. Check `openOrders` and the venue before retrying.
- `placementAttempted` — false until an order was dispatched, so nothing can be resting.
- `outAmount` vs `grossOutAmount` — when the fee was taken in the produced asset, `outAmount` is net and `grossOutAmount` gross; the next hop is sized on the net figure.

## What the client refuses

`buildExecutionPlan` throws when the route does not run from the asset you offered to the asset you wanted, or when a hop does not spend exactly what the previous hop produced — a buggy or compromised router response cannot steer orders into arbitrary markets.

## Unwinding

When a run halts partway through a bridged route, `buildUnwindPlan (report)` computes the reverse orders that sell each stranded residual back toward the from-asset, on the venue that holds it. It is **never automatic**: the result carries `requiresConfirmation`, and nothing in this class executes it.

## Language notes

Rust: fallible methods return `Result<_, ExchangeError>` and `err.is("NetworkError")` replaces a class check; `execute` takes `BTreeMap<String, Box<dyn RouterVenue>>` (impl `RouterVenue` for your exchange type); the `onStep` hook is installed with `set_on_step` / `clear_on_step` because `Value` cannot carry a closure. Python/PHP: `watchRoute` raises `NotSupported`.

## Source

- https://github.com/ccxt/ccxt/wiki/Manual — Order Router (service, pipeline, executing, report, refusals, unwinding)
- https://router.ccxt.com/openapi.json — OpenAPI 3.1 contract (authoritative)
- https://docs.ccxt.com/router/docs — rendered reference

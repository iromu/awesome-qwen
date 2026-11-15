# ccxt Error Handling

The documented exception hierarchy, what each class signals, how an agent should react, the built-in HTTP retry mechanism, and instance clean-up. Exception class names are identical in every language; only the catching syntax differs.

## Catching errors idiomatically

Wrap each unified-method call in try/catch and branch on the error family, most specific first. All ccxt errors derive from `BaseError`, the ccxt-wide catch-all.

```text
try   -> call unified method
catch -> NetworkError family  : transient; retry (back off if rate-limited)
         ExchangeError family : request cannot succeed as constructed; fix inputs, never blind-retry
         BaseError            : catch-all (accessibility, request/response mismatch)
```

Per-language forms (Python `snake_case`, JS/TS `camelCase` for methods; class names identical):

- Python: `except ccxt.NetworkError as e:` / `except ccxt.ExchangeError as e:` / `except Exception as e:`
- JS/TS: `catch (e) { if (e instanceof ccxt.NetworkError) ... }`
- Go: methods return a `(value, error)` pair; ccxt errors are `*ccxt.Error` values whose `Type` field carries the category (`ccxtError.Type == ccxt.NetworkErrorErrType`)
- Java: typed catch blocks in most-specific -> least-specific order (`RateLimitExceeded`, `NetworkError`, `AuthenticationError`, `ExchangeError`, `BaseError`); async methods wrap errors in `CompletionException` — peel with `Helpers.unwrap()` inside `.exceptionally(...)`
- Rust: fallible methods return `Result<_, ExchangeError>`; the error's `kind` carries the class name, so `err.is("NetworkError")` replaces a class check

## Exception hierarchy

Authoritative source: `ts/src/base/errorHierarchy.ts`. Tree as documented:

```text
+ BaseError
+---+ ExchangeError
|   +---+ OperationRejected
|   +---+ BadRequest
|   |   +---+ BadSymbol
|   +---+ AuthenticationError
|   |   +---+ PermissionDenied
|   |   +---+ AccountSuspended
|   +---+ ArgumentsRequired
|   +---+ BadResponse
|   |   +---+ NullResponse
|   +---+ InsufficientFunds
|   +---+ InvalidAddress
|   |   +---+ AddressPending
|   +---+ InvalidOrder
|   |   +---+ OrderNotFound
|   |   +---+ OrderNotCached
|   |   +---+ CancelPending
|   |   +---+ OrderImmediatelyFillable
|   |   +---+ OrderNotFillable
|   |   +---+ DuplicateOrderId
|   +---+ NotSupported
+---+ OperationFailed (recoverable)
    +---+ NetworkError (recoverable)
        +---+ InvalidNonce
        +---+ RequestTimeout
        +---+ ExchangeNotAvailable
        |   +---+ OnMaintenance
        +---+ RateLimitExceeded
        +---+ DDoSProtection
```

Note a doc inconsistency: the prose says `OperationFailed` sub-types include "`DDoSProtection` (includes sub-type `RateLimitExceeded`)" while the tree lists `RateLimitExceeded` and `DDoSProtection` as siblings under `NetworkError`. Treat the hierarchy file/tree as authoritative; catch `NetworkError` to cover both.

## ExchangeError family — deterministic, do not retry

The request is impossible to succeed (endpoint switched off, symbol not found, required parameter missing, incorrect parameter format, user-side problem). Retrying hundreds of times still fails.

| Class | Signals | Agent reaction |
|---|---|---|
| `ExchangeError` | Base for deterministic failures | Read the message; fix the request |
| `OperationRejected` | Correctly built request blocked by a deterministic factor: account state ("please close existing positions before changing the leverage", "too many pending orders", margin mode), symbol not tradable now ("MarketClosed") | Take the specific action the message names (change a setting, wait until a moment), then retry |
| `BadRequest` | Incorrectly constructed request/parameter/action ("invalid number", "forbidden symbol", "size beyond min/max limits", "incorrect precision") | Fix the inputs; retrying unchanged never helps |
| `BadSymbol` | Symbol not recognized (under `BadRequest`) | Re-check the unified symbol via loaded markets |
| `ArgumentsRequired` | A required argument is missing | Supply the argument |
| `AuthenticationError` | Missing API credential, keypair mistake, or outdated nonce. Usually `apiKey` + `secret`; sometimes `uid` and/or `password` | Fix credentials; fresh keypair if nonce-related |
| `PermissionDenied` | No access for the action or insufficient permissions on the `apiKey` | Check key permissions on the exchange website |
| `AccountSuspended` | Account suspended (under `AuthenticationError`) | Stop; surface to the user |
| `BadResponse` / `NullResponse` | Malformed / null exchange response | Retry cautiously; escalate if persistent |
| `InsufficientFunds` | Balance cannot cover the order | Do not retry; re-check `fetch_balance` / amount |
| `InvalidAddress` | Bad funding address, or one shorter than `.minFundingAddressLength` (10 chars by default), in `fetchDepositAddress`, `createDepositAddress`, `withdraw` | Validate the address before calling |
| `AddressPending` | Address pending (under `InvalidAddress`) | Wait and re-fetch |
| `InvalidOrder` | Base class for all unified-order-API errors | Inspect order params against market limits |
| `OrderNotFound` | Fetching or cancelling a non-existent order | Verify order id/state; see `RequestTimeout` cancel flow below |
| `OrderNotCached`, `CancelPending`, `OrderImmediatelyFillable`, `OrderNotFillable`, `DuplicateOrderId` | Listed under `InvalidOrder` in the tree; not individually documented in the read range | Catch as `InvalidOrder`; do not retry blindly |
| `NotSupported` | Endpoint/operation not offered or supported by the exchange API | Check `exchange.has[...]` / `.features` before calling; drop the feature |

## OperationFailed / NetworkError family — recoverable, retry

`OperationFailed` occurs when a **correctly constructed, valid** request hits a non-deterministic problem: maintenance ongoing, network connectivity, DDoS protections, "Server busy, try again". These are temporary; retrying may be enough. Persistent failures point at the exchange or your connection.

| Class | Signals | Agent reaction |
|---|---|---|
| `OperationFailed` | Recoverable root of the transient family | Retry |
| `NetworkError` | Recoverable network root; catch-all for transient | Retry |
| `DDoSProtection` | Cloudflare/Incapsula-style limits on your user/region/location, or the API restricting abnormal request patterns | Back off, slow down, retry |
| `RateLimitExceeded` | Requests far more frequent than the exchange API engine tolerates | Honor any `retry-after`; back off and retry |
| `RequestTimeout` | Connection failed or data not fully received within `.timeout` — **outcome unknown** | See flow below |
| `ExchangeNotAvailable` | Exchange unreachable; also raised when the response contains any of `offline`, `unavailable`, `busy`, `retry`, `wait`, `maintain`, `maintenance`, `maintenancing` | Retry later; keyword matching can fire on odd payloads |
| `OnMaintenance` | Scheduled maintenance (under `ExchangeNotAvailable`) | Wait |
| `InvalidNonce` | Nonce less than the previous nonce for the keypair | Causes, in documented precedence: not rate-limiting / sending too often; API keys not fresh (always create a new keypair when adding an exchange); same keypair shared across instances (threads/processes); system clock drift. Fix: new keypair, one instance per key, rate-limit, sync clock to UTC in a non-DST timezone every ~10 minutes (on Windows, enabling time sync is not enough — set the frequency via the registry) |

### RequestTimeout flows (outcome unknown)

- **Fetching calls**: safe to retry.
- **`cancelOrder()`**: retry the same call a second time. The retry either succeeds (order cancelled now) or raises `OrderNotFound` — meaning the first attempt already cancelled it or the order filled and closed in between.
- **`createOrder()`**: call `fetchOrders()`, `fetchOpenOrders()`, `fetchClosedOrders()` to see whether the order is open. If it is not `'open'`, call `fetchBalance()` to check whether the balance changed — the order may have been created, filled, and closed between attempts.

## Retry mechanism

Built-in retries apply only to server/network-related failures; `InsufficientFunds`, `InvalidOrder`, and other deterministic errors are never repeated.

```python
exchange.options['maxRetriesOnFailure'] = 3       # retry up to 3 times per request
exchange.options['maxRetriesOnFailureDelay'] = 1000  # wait 1000 ms between retries
```

(JS/TS: same keys in `exchange.options`, camelCase method style.)

## Timestamp / recvWindow errors

Messages such as "Timestamp for this request is outside of the recvWindow.", "Invalid request, please check your server timestamp or recv_window param.", "Timestamp for this request was 1000ms ahead of the server's time." come from clock desync or from network latency exceeding the exchange's accepted window (commonly ~5 seconds, varies by exchange).

Diagnose by comparing local and server time over several samples:

```python
for i in range(0, 20):
    print(await exchange.fetch_time() - exchange.milliseconds())
```

Fixes: sync the OS clock periodically (e.g., hourly, not once); then `exchange.options['adjustForTimeDifference'] = True`, or widen the window with `exchange.options['recvWindow'] = 10000` (only where the exchange supports it).

## Resource clean-up

Close an exchange instance when finished with it; especially required for WebSockets (ccxt.pro) in every language:

```python
await poloniex.close(True)  # True also cleans up the cached instance data
```

## Operational gotchas (from the FAQ)

Format: **symptom** → cause → fix; flags verbatim from the docs. Sandbox/testnet access and CORS/browser usage are not covered by the FAQ read for this file — treat them as not documented here.

- **`create_order(symbol, 'market', 'buy', amount)` throws about a missing price**
  - Cause: many exchanges require the *quote* amount for spot market buys (`createMarketBuyOrderRequiresPrice` option true); ccxt defaults to base amount × price.
  - Fix: pass the price (ccxt sends `amount * price`), or set `exchange.options['createMarketBuyOrderRequiresPrice'] = False` and put the cost in `amount`, or use `createMarketBuyOrderWithCost(symbol, cost)` when `exchange.has['createMarketBuyOrderWithCost']`. Never assume a market-buy `amount` is base currency — the default prevents buying 1M USDT of SHIB while thinking it is 1M SHIB.
- **"must be greater than minimum amount precision of 1" on a contract market**
  - Cause: the exchange expects a whole number of *contracts*, not base units.
  - Fix: after `await exchange.loadMarkets()`, read `market['contractSize']`; `contracts = round(base_amount / market['contractSize'])`, reverse: `base_amount = contracts * market['contractSize']`.
- **Swap order size wildly off**
  - Cause: on swaps you trade contracts — `amount = 1` means 1 contract = `market['contractSize']` of base currency.
  - Fix: always derive size from `contractSize` (formula above), never pass base units directly.
- **Method/feature silently unavailable or raises `NotSupported`**
  - Cause: the exchange doesn't offer that operation.
  - Fix: gate on capability flags first: `exchange.has['createOrderWithTakeProfitAndStopLoss']`, `exchange.has['createStopLossOrder']`, `exchange.has['createTakeProfitOrder']`, `exchange.has['createTrailingPercentOrder']`, `exchange.has['createTrailingAmountOrder']`, `exchange.has['createMarketBuyOrderWithCost']`. The `.features` property is more precise than `.has`.
- **Attached TP/SL params rejected by the exchange**
  - Cause: venue doesn't support `createOrder` with attached `stopLoss`/`takeProfit` sub-order params ("type 3").
  - Fix: place independent conditional orders ("type 2") with `{"takeProfitPrice": ...}` or `{"stopLossPrice": ...}` in `params` on separate `create_order` calls.
- **Trailing stop rejected**
  - Cause: trailing support varies per exchange.
  - Fix: check `.features`, the `createOrder` docstring, or `exchange.has['createTrailingPercentOrder']` / `exchange.has['createTrailingAmountOrder']`; params are `trailingPercent` / `trailingAmount` / `trailingTriggerPrice`, plus `reduceOnly: True` to close a position.
- **"Timestamp ... outside of the recvWindow" / "1000ms ahead of the server's time"**
  - Cause: clock desync, or request latency beyond the exchange's accepted window (commonly ~5 s, varies).
  - Fix: sync the OS clock periodically (e.g., hourly); diagnose with `exchange.fetch_time()` vs `exchange.milliseconds()`; then `exchange.options['adjustForTimeDifference'] = True` or `exchange.options['recvWindow'] = 10000` (only if the exchange supports it).
- **`InvalidNonce` / "invalid keys" that look like infra errors**
  - Cause: nonce less than the previous nonce — no rate limiting, stale keypair, keypair shared across threads/processes, clock drift; some exchanges answer auth failures with exotic codes (HTTP 502 Bad Gateway) instead of naming the cause.
  - Fix: fresh keypair, one exchange instance per keypair, keep the rate limiter on, sync the clock; check key permissions on the exchange website; use `verbose` to confirm the intended keys are used.
- **Banned by the exchange / `RateLimitExceeded` / `DDoSProtection`**
  - Cause: private requests sent one after another "in a split second"; the built-in limiter disabled via `enableRateLimit: false`, or a custom limiter misbehaving.
  - Fix: keep `enableRateLimit` on (default), delay subsequent private requests, or fix the custom limiter; the long-poller examples show the pattern.
- **Debugging is guesswork**
  - Fix: set `exchange.verbose = true` right before the failing line (after `load_markets()` to cut noise, before it if the failure is inside `load_markets`); Python: `import logging; logging.basicConfig(level=logging.DEBUG)`; verify the *runtime* version (`ccxt.__version__` / `ccxt.version` / `\ccxt\Exchange::VERSION`) — never trust `pip`/`npm`/`composer` reporting.
- **Requests fail only from certain networks/countries**
  - Cause: geo-blocks, or exchange downtime/maintenance.
  - Fix: use ccxt's proxy functionality (check it does not misbehave), try a different machine or remote server, check exchange news for scheduled maintenance.
- **Unexpected extra fee on GRVT or Extended via ccxt**
  - Cause: ccxt is a "builder" on those venues and adds 1 bps (0.01%) by default.
  - Fix: `exchange.options['builderFee'] = False` to disable (optional; docs note the contribution is appreciated).
- **`fetch_order_book` / `fetch_trades` behave oddly on Bitget stock markets** (symbols like `RGOOGL/USDT`, `market['stock'] = true`, instance option `{'stock': True}`)
  - Cause: they are private endpoints needing a stock-whitelisted key; `fetch_order_book` takes no `limit`, `fetch_trades` takes no `since` or `paginate`.
  - Fix: omit those args; only market and limit orders are supported (trigger/SL/TP/trailing rejected); keep a separate instance without the `stock` option for crypto (with it set, `fetch_balance()` returns only stock holdings).
- **Backpack stock market order behaves like a quote**
  - Cause: symbols ending in `.RFQ` (e.g. `AAPL.US.RFQ/USDC`) are quote-based.
  - Fix: `create_order` with `type = 'market'` requests a quote and executes it; an optional `price` acts as the worst price you accept.
- **OKX/Binance RPI order book shorter than requested**
  - Cause: the RPI book is capped at 400 entries per side; a larger `limit` is reduced.
  - Fix: pass `{'rpi': True}` per call (`fetch_order_book('BTC/USDT', 5, {'rpi': True})`) or once via `exchange.options['fetchOrderBook'] = {'rpi': True}`; Binance has RPI only for linear (USDⓈ-M) futures and only as a per-call param.
- **Prediction exchanges return nothing from `loadMarkets()`**
  - Cause: Polymarket/Kalshi/Hyperliquid/Limitless/Myriad live in the `ccxt.prediction` namespace and are addressed by outcome handle `MARKET:LABEL`, not symbol.
  - Fix: start with `fetchEvents(params)` scoped by at least one of `query`, `tags`, `eventId`, `slug`; every unified method takes the outcome handle where a symbol would go.
- **Polymarket shows no funds or signing fails**
  - Cause: `walletAddress` must be the polymarket account (proxy/deposit) wallet from the profile, **not** the EOA; older browser-wallet/Gnosis-Safe accounts need a different signature type.
  - Fix: pass the proxy wallet as `walletAddress`; for older accounts set `exchange.options['signatureType'] = 2` and, if the EOA was passed, `exchange.options['funder']` to the proxy wallet holding the USDC.
- **DyDX cancel "succeeds" but the order stays live**
  - Cause: dYdX cancels by `clientOrderId`, not `orderId`, and needs `orderFlags` (0 market/non-limit GTT, 64 limit GTT — ccxt default, 32 conditional), `goodTillBlockTimeInSeconds` (ccxt default 30 days), `subAccountId` (ccxt default 0).
  - Fix: override these via params/options when the defaults don't match your order. Also: dYdX exists only in Python and JavaScript (signing dependencies); Python additionally needs `pip3 install pycryptodom` and manual protobuf (`pip install "protobuf==5.29.5"`; JS: `npm install protobufjs`).
- **Funding-rate value looks wrong**
  - Cause: the funding-rate structure carries three fields: `previousFundingRate` (most recently completed), `fundingRate` (upcoming, changing until funding time), `nextFundingRate` (predicted, two rates ahead; only a few exchanges).
  - Fix: pick the field that matches the question.
- **Open connections hang the process / stale data**
  - Cause: instance never closed, especially WebSocket (ccxt.pro) instances.
  - Fix: `await exchange.close(True)` when done (`True` also drops cached instance data).

## Source

- https://github.com/ccxt/ccxt/wiki/Manual (Resource clean-up, Error Handling, Retry Mechanism, Exception Hierarchy, Handling timestamp errors, Troubleshooting)
- https://github.com/ccxt/ccxt/blob/master/ts/src/base/errorHierarchy.ts
- https://github.com/ccxt/ccxt/wiki/FAQ

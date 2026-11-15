# CCXT Exchange Anatomy

How to create an exchange instance, which properties it carries, how to test a capability before calling a method, and how the built-in rate limiter behaves.

**Naming convention:** Python/PHP use `snake_case` (`load_markets`, `fetch_order_book`, `set_sandbox_mode`); JS/TS use `camelCase` (`loadMarkets`, `fetchOrderBook`, `setSandboxMode`). Property names (`rateLimit`, `enableRateLimit`, `apiKey`, `has`, `options`) are camelCase in every language's config object.

## Instantiating an exchange

Every exchange class derives from the base `Exchange` class and shares the common method set. Create an instance to use one.

List supported ids programmatically: `ccxt.exchanges` (JS/Python), `\ccxt\Exchange::$exchanges` (PHP), `ccxt.Exchanges` (Go), `ccxt.Exchange.exchanges` (C#).

```javascript
const ccxt = require('ccxt')
let exchange = new ccxt.kraken()                      // default id
let kraken1 = new ccxt.kraken({ id: 'kraken1' })      // disambiguate instances
const exchangeClass = ccxt['binance']                 // by name string
const ex = new exchangeClass({ apiKey: 'KEY', secret: 'SECRET' })
```

```python
import ccxt
exchange = ccxt.okcoin()                              # by class
okcoin1 = ccxt.okcoin({'id': 'okcoin1'})
exchange_id = 'binance'
exchange_class = getattr(ccxt, exchange_id)            # by name string
exchange = exchange_class({'apiKey': 'YOUR_API_KEY', 'secret': 'YOUR_SECRET'})
```

Other bindings: PHP `$exchange_class = "\\ccxt\\$exchange_id"; new $exchange_class(array('apiKey' => ..., 'secret' => ...));` · Go `ccxt.CreateExchange("binance", map[string]interface{}{...})` or `ccxt.NewBitfinex(nil)` · C# `new Binance(new Dictionary<string, object>{ { "apiKey", ... } })` · Java `Exchange.dynamicallyCreateInstance("binance", config)` or `new Binance(config)`.

The constructor argument is an associative array of exchange properties — **any** property below can be supplied there or assigned afterwards:

```javascript
const exchange = new ccxt.binance({
    'rateLimit': 10000,                 // unified property
    'headers': { 'YOUR_CUSTOM_HTTP_HEADER': 'YOUR_CUSTOM_VALUE' },
    'options': { 'adjustForTimeDifference': true },   // exchange-specific
})
exchange.options['adjustForTimeDifference'] = false   // mutate later
```

Instance methods can also be overridden at runtime: assign `exchange.fetch_ticker = fn` (JS/Python); PHP uses `add_method('fetch_ticker', fn)` plus `call_method('fetch_ticker', ['BTC/USDT'])`.

## Exchange properties

Shape of a generic instance (example values): `id`, `name`, `countries`, `urls{api,www,doc}`, `version`, `api`, `has`, `timeframes`, `timeout`, `rateLimit`, `userAgent`, `verbose`, `markets`, `symbols`, `currencies`, `markets_by_id`, `currencies_by_id`, `apiKey`, `secret`, `password`, `uid`, `options`.

| Property | Type / default | Semantics |
|----------|----------------|-----------|
| `id` | lowercase string | User-land label only, not used internally. Default ids are lowercase exchange names; differentiate multiple instances of the same exchange by id. |
| `name` | string | Human-readable exchange name. |
| `countries` | array | 2-symbol ISO country codes the exchange operates from. |
| `urls['api']` | string or dict | Base API URL, or a dict of separate public/private URLs. |
| `urls['www']`, `urls['doc']` | string / array | Website URL; docs URL or array of URLs. |
| `version` | string | Appended to the API base URL on each request (usually numeric, sometimes `v1.1`). Override only when implementing a new exchange class. |
| `api` | dict | Definition of all exposed API endpoints; ccxt auto-constructs callable methods from it. |
| `has` | dict | Capability flags — see below. |
| `timeframes` | dict | Maps unified timeframes (`'1m'`, `'1h'`, `'1d'`, `'1M'`, `'1y'`) to exchange-native values. Populated **only** when `has['fetchOHLCV']` is true. |
| `timeout` | number, default `10000` ms | Request-response roundtrip timeout; exceeded → `RequestTimeout`. Set a reasonable value; never hang forever. |
| `rateLimit` | number, ms | Pause between consecutive requests. See rate limiter. |
| `enableRateLimit` | bool, default `true` | Enables the built-in rate limiter. |
| `userAgent` | string / false | HTTP User-Agent. Some exchanges dislike it — set to `false`, undefined, or empty string to disable. May be overridden by `headers`. |
| `headers` | dict, default `{}` | Prepended to all requests. A `User-Agent` here wins over `userAgent`. |
| `verbose` | bool, default `false` | Log HTTP requests to stdout. Python alternative: `logging.basicConfig(level=logging.DEBUG)`. |
| `returnResponseHeaders` | bool, default `false` | When true, HTTP response headers appear in `responseHeaders` inside the returned `info` field (rate-limit metadata etc.). Only supported when the response is an object, not a list or string. |
| `markets` | dict | Markets keyed by unified symbol. **Requires `loadMarkets()` / `load_markets()` first** — unavailable until then. |
| `symbols` | list | Alphabetically sorted keys of `markets`; shorthand for market keys. |
| `currencies` | dict | Currencies keyed by `code`. Loaded/reloaded from markets. |
| `markets_by_id` | dict of arrays | Markets keyed by exchange-specific id (usually length 1 unless several share a marketId). Requires markets loaded. |
| `currencies_by_id` | dict | Currencies keyed by exchange-specific id. |
| `apiKey`, `secret`, `password`, `uid` | string | Credentials; see getting-started.md. |
| `requiredCredentials` | dict | Which credentials the exchange requires for private calls. |
| `options` | dict | Exchange-specific options (e.g. `adjustForTimeDifference`, `maxRequestsQueue`). |
| `precisionMode` | — | Decimal precision counting mode. |
| `proxyUrl`, `httpUrl`, `httpsUrl`, `socksProxy`, `wsProxy`, `wssProxy`, `wsSocksProxy` | url | Per-protocol proxy URLs (see the Manual's Proxy section). |

PHP array caveat: PHP's single array type makes an empty container both an empty dict and an empty list, so `is_dictionary(array()) === true` and `safe_dict` returns an empty array rather than the default. In every other language empty dicts and empty lists are distinct. Don't rely on the container alone to distinguish them in PHP.

## Capability map: `has`

`has` is the associative array of capability flags. Values:

| Value | Meaning |
|-------|---------|
| `undefined` / `None` / `null` | Not implemented in ccxt (not yet unified, or not natively available). |
| `false` | Not natively available from the exchange API. |
| `true` | Natively available from the exchange API **and** unified in ccxt. |
| `'emulated'` | Not native; reconstructed by ccxt from other `true` methods as much as possible. |

Flags include `CORS` (boolean, browser/CORS support) plus one per unified method: `cancelOrder`, `createDepositAddress`, `createOrder`, `fetchBalance`, `fetchCanceledOrders`, `fetchClosedOrder`, `fetchClosedOrders`, `fetchCurrencies`, `fetchDepositAddress`, `fetchMarkets`, `fetchMyTrades`, `fetchOHLCV`, `fetchOpenOrder`, `fetchOpenOrders`, `fetchOrder`, `fetchOrderBook`, `fetchOrders`, `fetchStatus`, `fetchTicker`, `fetchTickers`, `fetchBidsAsks`, `fetchTrades`, `withdraw`, … (the list is open-ended, `...`).

**Test before calling** — not every exchange implements every method:

```javascript
if (exchange.has['fetchOHLCV']) {
    const candles = await exchange.fetchOHLCV('BTC/USDT', '1h')
}
```

Python: `if exchange.has['fetch_ohlcv']:`. `'emulated'` is truthy, so this guard admits emulated methods — treat `exchange.has['x'] === true` separately when native support matters. The Manual documents the capability map as the `has` property; `describe()` is not documented in the sources read here.

### `features` — finer-grained capabilities

Major exchanges expose a `.features` property: what is supported per market type. A method/option set to `null`/`undefined` means unsupported. Marked work-in-progress and possibly incomplete.

Structure: `features.spot`, `features.swap.linear` / `.inverse`, `features.future.linear` / `.inverse`, each holding `sandbox: true` (testnet supported) and per-method dicts, e.g. `createOrder: { triggerPrice, triggerPriceType, triggerDirection, stopLossPrice, takeProfitPrice, stopLoss: { triggerPriceType: { last, mark, index }, price }, marginMode, timeInForce: { GTC, IOC, FOK, PO, GTD }, hedged, leverage, selfTradePrevention, trailing, iceberg, marketBuyByCost, marketBuyRequiresPrice }`, `createOrders: { max: 50 }`, `fetchMyTrades: { limit, daysBack, untilDays }`, `fetchOrder: { marginMode, trigger, trailing }`, `fetchOrders: { limit, daysBack, untilDays, ... }`, `fetchClosedOrders: { limit, daysBackClosed, daysBackCanceled, ... }`, `fetchOHLCV: { paginate, limit }`.

## Built-in rate limiter

`rateLimit` is **milliseconds** — the pause the throttler keeps between requests. `rateLimit = 1000` means 1 request/second. Each endpoint has a **cost** (weight): cheap ≈ 1, heavy ≈ 20.

```
pause before a request = rateLimit × cost of that request
effective rate = 1000 / (rateLimit × cost)   requests per second
```

Derive the value from the exchange's published budget: 12000 weight units/minute → `60000 / 12000 = 5` → `rateLimit = 5`. The shipped `exchange.rateLimit` default is **safe but sub-optimal**; per-endpoint limits mean it is the user's job to tune it. Your side's pacing does not express the exchange's own per-endpoint, per-account and burst rules.

**The user is required to implement own rate limiting or leave the built-in limiter enabled to avoid being banned.** Most exchanges allow up to 1–2 requests/second; exceeding limits gets you temporarily restricted or banned.

Algorithms:
- **Leaky Bucket (default)** — queues requests, releases at a steady fixed rate, smoothing bursts.
- **Window-Based (optional)** — pass `{ 'rateLimiterAlgorithm': 'rollingWindow' }`; enforces N requests per window. Window size via `rollingWindowSize: X0000`; default window is 60 s.

Enable at construction, toggle later freely:

```javascript
const exchange = new ccxt.bitfinex({ enableRateLimit: true })  // true by default
exchange.enableRateLimit = false   // disable after instantiation
```

Python: `ccxt.bitfinex({'enableRateLimit': True})`, then `exchange.enableRateLimit = False`.

When calls hit a rate limit or get nonce errors, ccxt throws `InvalidNonce`, or in some cases `DDoSProtection`, `ExchangeNotAvailable`, or `ExchangeError`. A later retry is usually enough.

### Maximum requests capacity

Async code may schedule an unlimited number of requests, but the throttle queue is capped at **1000 concurrent requests** by default. Exceeding it raises `throttle queue is over maxCapacity`. A large pending count usually signals suboptimal design (new requests wait for existing ones). Raise it at construction:

```
ex = ccxt.binance({'options': {'maxRequestsQueue': 9999}})
```

## One instance, reused

The rate limiter is a property **of the exchange instance** — each instance has its own limiter, unaware of the others. Reuse one instance throughout the program; do not use multiple instances of the same exchange with the same API keypair from the same IP.

```javascript
// DO NOT: three instances, three independent limiters, no shared pacing
const binance1 = new ccxt.binance(), binance2 = new ccxt.binance(), binance3 = new ccxt.binance()

// DO: one instance, its limiter serialises all three calls
const binance = new ccxt.binance()
await Promise.all([
    binance.fetchOrderBook('BTC/USDT'),
    binance.fetchOrderBook('ETH/USDT'),
    binance.fetchOrderBook('ETH/BTC'),
])
```

```javascript
// DO NOT: constructing inside the loop destroys and resets the limiter each tick
async function tick () { const exchange = new ccxt.binance(); return exchange.fetchOrderBook('BTC/USDT') }

// DO: pass the instance in
async function tick (exchange) { return exchange.fetchOrderBook('BTC/USDT') }
const exchange = new ccxt.binance()
while (true) console.log(await tick(exchange))
```

Destroying the instance destroys its limiter. Creating and dropping instances repeatedly therefore resets rate limiting over and over and eventually breaks the limits; it also forces a markets reload on every construction, and abusing the markets endpoint breaks the limiter too. Do not break this rule unless you fully understand the limiter's internals.

## Source

- https://github.com/ccxt/ccxt/wiki/Manual (Exchanges → Instantiation, Features, Overriding Exchange Properties/Methods, Exchange Structure, Exchange Properties, Exchange Metadata, Rate Limit, Notes On Rate Limiter, Maximum Requests capacity)
- https://github.com/ccxt/ccxt/wiki/Requirements (the method/structure surface an exchange must implement to be integrated)
- https://github.com/ccxt/ccxt/blob/master/llms.txt

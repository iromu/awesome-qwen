# CCXT Pro (`ccxt.pro`) WebSocket Streaming Reference

The unified `watch*` streaming API of CCXT: method names, parameter order, return shapes,
connection lifecycle, and streaming-specific limits. Language-agnostic — Python and JS/TS
appear only where the async pattern differs.

Naming convention: Python is snake_case (`watch_order_book`, `handle_message`), JS/TS is
camelCase (`watchOrderBook`, `handleMessage`). Neutral pseudocode below uses the camelCase form.

## What ccxt.pro is

- CCXT Pro is **a free part of CCXT**, not a separate package. It extends the core CCXT classes
  (JS prototype mixins, Python multiple inheritance, PHP traits, Java class inheritance).
- Import: Python `import ccxt.pro as ccxtpro`; JS/TS `const ccxtpro = require('ccxt').pro`.
  Every Pro exchange instance also carries all REST/CCXT methods.
- Exchange instantiation is identical to CCXT: `ccxtpro.binance({ 'newUpdates': false })`.
  Pro is designed for async/await; in Python it runs on `asyncio` (pass an event loop in the
  constructor args if needed, as with `ccxt.async_support`).
- Concepts shared with CCXT: public/private split, markets and symbols, unified structures,
  exceptions and error mapping, API keys/authentication, configuration options.
- Connections are managed by the library, transparently, per exchange instance.
- Streaming APIs are classed **sub** (receive only) and **pub** (send + receive). Some exchanges
  offer *sub* only — then the REST API is still required for order placement and similar.

## REST → streaming correspondence

Each unified REST method with a `fetch*` prefix has a stream counterpart with a `watch*` prefix:

| Public | Private |
|--------|---------|
| `fetchStatus` → `watchStatus` | `fetchBalance` → `watchBalance` |
| `fetchOrderBook` → `watchOrderBook` | `fetchOrders` → `watchOrders` |
| `fetchOrderBookForSymbols` → `watchOrderBookForSymbols` | `fetchOrdersForSymbols` → `watchOrdersForSymbols` |
| `fetchTicker` → `watchTicker` | `fetchMyTrades` → `watchMyTrades` |
| `fetchTickers` → `watchTickers` | `fetchPosition` → `watchPosition` |
| `fetchOHLCV` → `watchOHLCV` | `fetchPositions` → `watchPositions` |
| `fetchOHLCVForSymbols` → `watchOHLCVForSymbols` | `fetchLiquidations` → `watchLiquidations` |
| `fetchTrades` → `watchTrades` | `fetchMyLiquidations` → `watchMyLiquidations` |
| `fetchTradesForSymbols` → `watchTradesForSymbols` | `fetchMyLiquidationsForSymbols` → `watchMyLiquidationsForSymbols` |
| `fetchBidsAsks` → `watchBidsAsks` | `fetchFundingRates` → `watchFundingRates` |
| `fetchLiquidations` → `watchLiquidations` | |
| `fetchLiquidationsForSymbols` → `watchLiquidationsForSymbols` | |

**REST alternatives over WS** — some exchanges also expose `fetch*`/mutating REST methods with
`*Ws` signatures that match the REST version: `fetchTrades → fetchTradesWs`,
`createOrder → createOrderWs`, `editOrder → editOrderWs`, `cancelOrder → cancelOrderWs`,
`cancelOrders → cancelOrdersWs`, `cancelAllOrders → cancelAllOrdersWs`, plus `fetchOrderWs`,
`fetchOrdersWs`, `fetchBalanceWs`, `fetchMyTradesWs`. Find them in `exchange.has`.

## Checking a capability

```text
if exchange.has['watchOrderBook']: ...        # per-method flag
exchange.has['ws']                             # true only in CCXT Pro
```

`has` also carries `watchTicker`, `watchTickers`, `watchTrades`, `watchMyTrades`, `watchOHLCV`,
`watchBalance`, `watchPositions`, and the `*Ws` names (values are `true`/`false` per exchange).
Always gate a stream on its flag — support is per exchange.

Other Pro-only instance state:

- `urls.api` — `ws` (`wss://…`), possibly `signalr`, `socketio`.
- `streaming` — `keepAlive` (ms, default `30000`), `maxPingPongMisses` (default `2.0`), other options.
- Incremental structures: `orderbooks` (by symbol), `ohlcvs` (symbol → timeframe), `balance`,
  `orders` (by order id), `trades` (by symbol), `tickers` (by symbol), `transactions`.

## The streaming loop

Call the same `watch*` method repeatedly in a loop; each `await` resolves with the next update.
Errors are caught inside the loop so the next iteration retries (and reconnects).

Python:

```python
import ccxt.pro as ccxtpro
from asyncio import run

async def main():
    exchange = ccxtpro.kraken({ 'newUpdates': False })
    while True:
        try:
            orderbook = await exchange.watch_order_book('BTC/USD')
            print(orderbook['asks'][0], orderbook['bids'][0])
        except Exception as e:
            print(e)
            # stop the loop on exception or leave commented to retry
            # raise e
    await exchange.close()

run(main())
```

JS/TS:

```javascript
const ccxtpro = require('ccxt').pro
if (exchange.has['watchOrderBook']) {
    while (true) {
        try {
            const orderbook = await exchange.watchOrderBook(symbol, limit, params)
            console.log(new Date(), symbol, orderbook['asks'][0], orderbook['bids'][0])
        } catch (e) {
            console.log(e)
            // throw e   // uncomment to stop the loop on exceptions
        }
    }
}
```

This is the "tick() function": the loop reiterates a reaction to incoming ticks. It is structurally
identical to the REST `while (true) { await exchange.fetchOrderBook(...) }` loop.

**Stopping**: re-raise/re-throw inside the `catch` (or `break`) ends the loop; then
`await exchange.close()`. `close(True)`/`close(true)` also discards cached instance data.
Stopping the loop does **not** stop the subscription — see Unwatch.

### Real-time vs throttling mode

- **Real-time**: `await` inside the loop; each call returns as soon as the next delta arrives.
  Fastest reaction, most resource-hungry, hardest to synchronize across exchanges.
- **Throttling**: call `watch*` once (no `await` in the loop), then poll the cached structure on a
  fixed frame rate.

```javascript
await exchange.watchOrderBook(symbol, limit)   // subscribe once, in background
while (true) {
    console.log(exchange.orderbooks[symbol].limit(limit))   // required in throttling mode
    await exchange.sleep(100)                               // every 100 ms
}
```

Throttling is easier to synchronize and cheaper, but reaction lag varies per frame.

## Method inventory

Signatures are the documented argument order; `params` is always the last argument (assoc
dictionary, standard CCXT param overrides). Return shapes are the standard CCXT structures.

### Public

| Method | Parameters | Returns |
|--------|-----------|---------|
| `watchOrderBook` | `symbol, limit, params` | order book object (identical interface to `fetchOrderBook`) |
| `watchOrderBookForSymbols` | `symbols, limit, params` | order book object; multiple orderbooks in one subscription |
| `watchTicker` | `symbol, params` | ticker object |
| `watchTickers` | `symbols, params` | ticker objects (indexed by symbol) |
| `watchOHLCV` | `symbol, timeframe, since, limit, params` | array of OHLCV candles |
| `watchOHLCVForSymbols` | `symbolsAndTimeframes, since, limit, params` | array of OHLCV candles; `symbolsAndTimeframes` = pairs like `[['BTC/USDT','1d'], ['ETH/USDT','1h']]` |
| `watchTrades` | `symbol, since, limit, params` | array of trade objects, chronologically ordered |
| `watchTradesForSymbols` | `symbols, since, limit, params` | array of trade objects, multiple symbols in one call |
| `watchBidsAsks` | `symbols, params` | not documented beyond the `fetchBidsAsks` correspondence |
| `watchLiquidations` | `symbol, since, limit, params` | liquidation stream |
| `watchLiquidationsForSymbols` | `symbols, since, limit, params` | liquidation stream, several symbols |
| `watchStatus` | not documented (`fetchStatus` correspondence) | status stream |

### Private (requires API keys — same keys/signing as REST for most exchanges)

| Method | Parameters | Returns |
|--------|-----------|---------|
| `watchBalance` | `params` | standard CCXT balance structure (accounts by currency code) |
| `watchOrders` | `symbol, since, limit, params` | array of order objects |
| `watchOrdersForSymbols` | `symbols, since, limit, params` | array of order objects |
| `watchMyTrades` | `symbol, since, limit, params` | array of trade objects |
| `watchPosition` | `symbol, since, limit, params` | position stream |
| `watchPositions` | `symbols, since, limit, params` | list of position structures |
| `watchMyLiquidations` | `symbols, since, limit, params` | own liquidations |
| `watchMyLiquidationsForSymbols` | `symbols, since, limit, params` | own liquidations, several symbols |
| `watchDepositsWithdrawals` | `code, limit, params` | deposits/withdrawals stream |
| `watchFundingRates` | not documented (`fetchFundingRates` correspondence) | funding rate stream |
| `watchTransactions` | — | **work in progress, may be unavailable** |

Defaults for the optional args: `symbol = undefined`, `since = undefined`, `limit = undefined`,
`params = {}`. `watchPositions` takes `symbols` (plural) where the others take `symbol`.

Ticker topic selection: some exchanges expose several ticker topics (e.g. `bookTicker`); set
`exchange.options['watchTicker']['name']`.

### WS versions of REST commands

`createOrderWs(symbol, type, side, amount, price, params)`,
`editOrderWs(id, symbol, type, side, amount, price, params)`,
`cancelOrderWs(id, symbol, params)`, `cancelOrdersWs(ids, symbol, params)`,
`cancelAllOrdersWs(symbol, params)`. Same semantics and return values as the REST equivalents.

### Unwatch

`watchX` keeps streaming into a background cache even if you stop reading its return value. To
stop the background subscription, call the matching `unWatch*`:
`unWatchOrderBook`, `unWatchOrderBooksForSymbols`, `unWatchOrderBookForSymbols`, `unWatchTrades`,
`unWatchTradesForSymbols`, `unWatchOHLCV`, `unWatchOHLCVForSymbols`, `unWatchTicker`,
`unWatchTickers`, `unWatchOrders`, `unWatchMyTrades`, `unWatchPositions`.
Pairing is by name (`watchTrades` → `unWatchTrades`). No `unWatch*` is documented for
`watchBalance`, `watchStatus`, `watchBidsAsks`, the liquidation or funding-rate streams —
use `close` there.

## Connection lifecycle

- **Open**: the first call to any `watch*` establishes the connection to that exchange's stream and
  reuses it if it already exists. The library performs the subscribe handshake and, for private
  streams, authentication/signing.
- **Keep-alive**: the library watches the uplink and keeps the connection alive
  (`streaming.keepAlive`, default 30000 ms; `maxPingPongMisses`, default 2.0).
- **Reconnect**: after a critical exception, disconnect, or timeout, the *next* iteration's
  `watch*` call triggers a reconnection. That is why the `catch` in the loop should normally not
  re-throw — swallowing the error lets the loop retry. Exponential-backoff reconnect delays and
  rate limiting are applied and are on by default, configurable via exchange properties.
- **Multiple streams**: one connection is reused across watches where the exchange has a single
  URL; some exchanges use more than one URL per stream.
- **Errors**: the library throws standard CCXT exceptions; CCXT's error mapping applies.
- **Clean-up**: `await exchange.close()` when done; `close(True)` also clears cached instance data.
- **Raw access**: override `handleMessage` (JS) / `handle_message` (Python) — by subclassing and
  calling `super()`, or by replacing the bound method — to inspect raw frames.

## Caches, limits, and rate limits

Array-returning watches (`watchOHLCV`, `watchTrades`, `watchMyTrades`, `watchOrders`) read from a
fixed-size sliding deque of the most recent entries.

- Default cache size: **1000** entries per type. Set via `exchange.options`: `tradesLimit`,
  `OHLCVLimit`, `ordersLimit`. Set them **before** the first `watch*` call — they cannot change
  during a run.
- When full, the oldest entry is dropped; the window slides.
- `since`/`limit` are **pagination, not cache sizing**, and apply only *inside* the cached frame:
  `since` filters `timestamp >= since`, `limit` returns up to `limit` candles/trades starting from
  `since` or from the start of the cache. You cannot paginate beyond the cached window.
- `newUpdates`: instantiate with `{'newUpdates': True}` to receive only the updates that occurred
  since the previous `watch*` resolved (e.g. the most recent trades/orders) instead of the whole
  sliding cache. The cache is still kept in the background (exchanges send partial deltas).
  **Deprecation warning: `newUpdates: true` will become the default**; set it explicitly.
- `limit` on `watchOrderBook` is an **upper bound**, not a guaranteed count — where the exchange
  supports it, it is sent on subscribe (some exchanges accept only certain values like 10/25/50/100);
  otherwise limiting happens client-side. Exchanges streaming full orderbooks only ignore it.
- Real-time mode can be resource-heavy during high volatility: the exchange may stream a very large
  number of updates, and userland code must keep up. Throttling mode, or `unWatch*` for idle
  symbols, is the mitigation.

## Pitfalls

- Forgetting `exchange.has['watchX']` gating → calling an unsupported method.
- Exiting the loop without `unWatch*`/`close`: the subscription keeps running and updating memory.
- Reading the full cache each tick while assuming you got only new updates — set `newUpdates`
  deliberately.
- Setting `tradesLimit`/`OHLCVLimit`/`ordersLimit` after a `watch*` call (no effect).
- Expecting `since`/`limit` to reach history older than the cache frame.
- Using `watchOHLCV` for latency-sensitive strategies: OHLCV is 2nd-order data derived from trades,
  and exchange-side calculation/streaming adds unbounded lag (an update can arrive ~30 s after the
  period closes). Prefer `watchTrades` + `exchange.build_ohlcvc(trades, '1m')`; use `watchOHLCV`
  for non-critical uses such as charting.
- In throttling mode, forgetting `exchange.orderbooks[symbol].limit(limit)` (required).
- Binance-family multi-account orders: spot, cross margin, isolated margin and portfolio margin each
  use their own listenKey/stream, so run concurrent loops selected via `params`
  (e.g. `{'type': 'margin', 'marginMode': 'cross'}`, `{'marginMode': 'isolated'}` — isolated needs a
  `symbol` and issues one listenKey per symbol, `{'portfolioMargin': True}`). Each resolves into the
  shared orders cache.
- `watchTransactions` is marked work-in-progress and may be unavailable.
- There is **no** `watchPong` and no `watchPing` in ccxt — they appear in some third-party
  tutorials but are absent from the Pro manual and resolve on no exchange binding (checked against
  the installed library, 20 bindings, v4.5.92). Heartbeats are handled internally; don't call them.

## Source

- https://github.com/ccxt/ccxt/wiki/ccxt.pro.manual (Manual: architecture, streaming specifics, unified API, unWatch, error handling)
- https://github.com/ccxt/ccxt/wiki/ccxt.pro (CCXT Pro index)
- https://docs.ccxt.com/docs/pro-manual

# Prediction Markets

Unified API for prediction-market venues (`ccxt.prediction`): events, markets, outcomes, and outcome-addressed trading. Prices are probabilities quoted between 0 and 1 USDC per outcome share.

Naming: examples below use the unified method names; Python is `snake_case`, JS/TS `camelCase`.

## What a prediction market is in ccxt terms

- Supported venues: **Polymarket, Kalshi, Limitless, Myriad, and Hyperliquid prediction markets**.
- They live in a dedicated **`prediction` namespace** and implement the **same unified API** as regular crypto exchanges.
- A prediction exchange is flagged by `exchange.has['prediction']`.
- Semantics: `price` = probability `0..1` per share, `amount` = number of shares, `cost` = collateral spent.

Instantiate from the prediction namespace. Python's `ccxt.prediction.<id>` **is** the async class (async-only); JS/TS shown for contrast:

```javascript
const exchange = new ccxt.prediction.polymarket ()
```

```python
import ccxt.prediction
exchange = ccxt.prediction.polymarket()   # async-only
```

## Data model: event → market → outcome

Three levels; the **outcome** is the tradeable unit every price/trade method takes.

| Level | Produced by | Key fields |
|---|---|---|
| **Event** (`PredictionEvent`) | `fetchEvents()` / `fetchEvent()` | a question or grouping ("Will X happen by July?"); `id`, `title`, `active`, `resolved`, `volume` |
| **Market** | `fetchMarkets()` / `loadMarkets()`, event's `markets` | standard ccxt `Market` row with `market['type'] === 'prediction'` plus prediction fields: `marketType` (`binary`/`categorical`/`scalar`), `executionModel` (`clob`/`amm`/`parimutuel`), `collateral`, `tickSize` |
| **Outcome** (`PredictionOutcome`) | market's `outcomes` list | `outcome` handle (e.g. `TRUMP_OUT_PRESIDENT_2027:YES`), exchange-specific `outcomeId`, parent `market`, `label` (e.g. `YES`/`NO`), `price`, `bid`, `ask` |

Symbol format: the **outcome handle** `MARKET:LABEL` replaces the market symbol used on crypto exchanges; the raw `outcomeId` is accepted in the same position.

## Method inventory

Support varies per venue — check `exchange.has[methodName]` before calling.

**Discovery & markets**

| Method | Notes |
|---|---|
| `fetchEvents (params?)` | Search events; **must be scoped** (see below). Returns event structures; caches events/markets/outcomes on `exchange.events`, `exchange.outcomes` |
| `fetchEvent (id, params?)` | Single event by id/slug/ticker. `polymarket`, `kalshi`, `myriad`, `limitless` — Hyperliquid has no single-event endpoint (`exchange.has['fetchEvent']`) |
| `fetchMarkets (params?)` / `loadMarkets (reload?)` | Every market, each with `type: 'prediction'` and an `outcomes` list |
| `fetchTime (params?)` | Exchange server time |
| `loadOutcomes (outcomes?)` | Warm the outcome cache explicitly (batched; no arg = whole capped listing) |
| `getEvent (idOrHandle)` | Read back an event already discovered |

**Market data** — each takes an outcome handle/id: `fetchTicker (outcome, params?)`, `fetchTickers (outcomes?, params?)`, `fetchOrderBook (outcome, limit?, params?)`, `fetchOHLCV (outcome, timeframe?, since?, limit?, params?)`, `fetchTrades (outcome, since?, limit?, params?)`, `fetchOpenInterest (outcome, params?)`, `fetchTradingFee (outcome, params?)`, `fetchTradeQuote (outcome, ...)` (executable quote on AMM venues).

**Trading** — `amount` = shares, `price` = probability `0..1`: `createOrder (outcome, type, side, amount, price?, params?)`, `createOrders (orders, params?)`, `editOrder (id, outcome, ...)`, `cancelOrder (id, outcome?, params?)`, `cancelOrders (ids, ...)`, `cancelAllOrders (outcome?, params?)`.

**Account & orders** — `fetchBalance (params?)`, `fetchOrder (id, outcome?, params?)`, `fetchOrders`, `fetchOpenOrders`, `fetchClosedOrders`, `fetchCanceledOrders`, `fetchOrderTrades`, `fetchMyTrades (outcome?, since?, limit?, params?)`, `fetchPositions (outcomes?, params?)`, `fetchPosition (outcome, params?)`, `fetchStatus (params?)`.

**WebSocket (Pro)** — keyed by the outcome handle: `watchTicker`, `watchTickers`, `watchOrderBook`, `watchTrades`, `watchOHLCV`, `watchOrders`, `watchMyTrades`, `watchPositions`.

Remaining methods behave like their crypto counterparts, only addressed by outcome.

## fetchEvents

```
fetchEvents (params = {})
```

`params` is a `fetchEventsParams` object and **must be scoped** by at least one of:

| Key | Meaning |
|---|---|
| `query` | Search string |
| `queries` | List of strings |
| `tags` | Tag filter — resolves to Kalshi series, Polymarket `tag_slug` listings (one per tag), Limitless categories, Myriad keyword searches |
| `eventId` | Event id |
| `slug` | Event slug |
| `limit` | Result cap |
| `sort` | `volume` / `liquidity` / `newest` |
| `status` | `active` / `inactive` / `closed` / `all` |
| `searchIn` | `title` / `description` / `both` |

- An unscoped call throws `ArgumentsRequired` on **every** venue. Some venues accept extra scope keys (Kalshi `category`, `series_ticker`).
- For an unscoped "most active markets" browse, use `fetchMarkets ()` — a capped, volume-ordered listing where the venue supports it.

## fetchEvent

```
fetchEvent (id, params = {})
```

`id` per venue: Polymarket numeric event id **or** slug; Kalshi event ticker; Myriad `networkId:marketId` market id; Limitless market slug or address. Returns one event structure, same shape as `fetchEvents` entries.

## createOrder

```
createOrder (outcome, type, side, amount, price = undefined, params = {})
```

| Arg | Meaning |
|---|---|
| `outcome` | Outcome handle (`TRUMP_WINS:YES`) or raw `outcomeId` from a market's `outcomes` list — replaces the market symbol |
| `type` | `'limit'` or `'market'`; venue support varies — check `exchange.has['createMarketOrder']` |
| `side` | `'buy'` or `'sell'` |
| `amount` | Number of shares |
| `price` | Probability `0..1` USDC per share; **required for `limit`, ignored for `market`** |
| `params` | Exchange-specific extras |

Returns a prediction order structure, addressed by outcome instead of symbol. Batch with `createOrders`, amend with `editOrder`, cancel with `cancelOrder` / `cancelAllOrders`. Trading needs credentials — each venue's auth (wallet + private key, API keys, …) is in the per-exchange reference.

## Prediction structures

Prediction structures are **standalone**: they do **not** extend the crypto `Ticker` / `Order` / `Position` / `Trade` / `OrderBook` types and have **no `symbol`**. Identity is the `outcome` handle plus `outcomeId`; `info` always carries the raw venue payload.

**Event** — `info`, `id`, `event` (unified handle, resolved by `getEvent`), `title`, `description`, `slug`, `category`, `tags`, `markets` (market rows, each with an `outcomes` list), `mutuallyExclusive` (exactly one market resolves YES), `active`, `resolved`, `volume`, `liquidity`, `created`, `createdDatetime`, `end` (resolution deadline, ms), `endDatetime`, `image`, `url`.

**Ticker** (`PredictionTicker`) — `info`, `outcome`, `outcomeId`, `label`, `market`, `event`, `timestamp`, `datetime`, `last`, `bid`, `bidVolume` (shares), `ask`, `askVolume`, `high`, `low`, `open`, `close`, `change`, `percentage`, `average`, `baseVolume` (shares traded), `quoteVolume` (collateral traded), `openInterest`.

**Order book** (`PredictionOrderBook`) — `outcome` (required — books are per-outcome), `outcomeId`, `market`, `bids`/`asks` as `[ price (0..1), amount in shares ]` best-first, `timestamp`, `datetime`, `nonce`.

**Order** (`PredictionOrder`) — `info`, `id`, `clientOrderId`, `outcome`, `outcomeId`, `label`, `market`, `event`, `timestamp`, `datetime`, `lastTradeTimestamp`, `lastUpdateTimestamp`, `status` (`open`/`closed`/`canceled`), `type`, `timeInForce`, `side`, `price` (limit probability), `average` (avg fill probability), `amount` (shares ordered), `filled`, `remaining`, `cost` (= `average * filled`), `reduceOnly`, `postOnly`, `fee`, `trades`.

**Trade** (`PredictionTrade`) — `info`, `id`, `order` (parent order id), `outcome`, `outcomeId`, `label`, `market`, `timestamp`, `datetime`, `type`, `side`, `takerOrMaker`, `price` (fill probability), `amount` (shares), `cost` (= `price * amount`), `fee`, `realizedPnl`.

**Position** (`PredictionPosition`) — `info`, `id`, `outcome`, `outcomeId`, `label`, `market`, `event`, `timestamp`, `datetime`, `side`, `contracts` (shares held), `contractSize`, `notional` (value in collateral), `entryPrice` (avg entry probability), `markPrice`, `lastPrice`, `unrealizedPnl`, `realizedPnl`, `percentage`, `collateral`, `resolved`, `won`, `settleFraction` (`0..1` fractional settlement), `payout` (claimable collateral after resolution).

## The outcome cache

Prediction exchanges address an **outcome** the way regular ccxt addresses a `symbol`. You rarely manage the cache:

- The first outcome-addressed call (`fetchTicker`, `createOrder`, …) resolves and caches **just that outcome** — the analogue of `loadMarkets()` + `market(symbol)`. Later calls hit the cache with no extra request.
- The auto-load is scoped: a by-id fetch where the venue has one (Kalshi tickers, Polymarket token ids), otherwise a search derived from the handle — never a bulk listing download.
- A genuinely unknown outcome throws `BadSymbol`.
- Warm up front with `loadOutcomes (outcomes?)` (batched) or read a cached event with `getEvent (idOrHandle)`.

## Gotchas

- **`fetchTickers` needs an `outcomes` list.** Kalshi, Polymarket, Limitless and Myriad have no "all tickers" endpoint, so a no-arg `fetchTickers ()` throws `ArgumentsRequired` rather than returning a capped subset — pass the handles you want. Hyperliquid serves its whole universe in one request, so its no-arg call works.
- **`fetchEvents` cannot be unscoped** — `ArgumentsRequired` on every venue.
- Prices are never currency amounts: `0..1` probabilities. Confusing a price with an amount loses money, exactly as in spot trading.
- Market orders are not universal — gate on `exchange.has['createMarketOrder']`.
- Structures lack `symbol`; code that assumes `Ticker.symbol` breaks. Use `outcome`.

## Worked examples (condensed)

Discovery → market data → trade (JS/TS shown; identical method names in Python with `snake_case`):

```javascript
const exchange = new ccxt.prediction.polymarket ()
const events = await exchange.fetchEvents ({ 'query': 'Trump' })
const outcome = events[0]['markets'][0]['outcomes'][0]
const ticker = await exchange.fetchTicker (outcome['outcome'])
const orderbook = await exchange.fetchOrderBook (outcome['outcome'])
const candles = await exchange.fetchOHLCV (outcome['outcome'], '1h')
// limit buy 5 YES shares at 0.40 USDC; prices are 0..1 per share
const order = await exchange.createOrder (outcome['outcome'], 'limit', 'buy', 5, 0.40)
```

Single event by id:

```javascript
const event = await exchange.fetchEvent (events[0]['id'])
```

CLI — every language CLI targets the namespace with `-p` / `--prediction`. Regular ids win for ids present in both namespaces (e.g. `hyperliquid`); `-p` forces prediction, and prediction-only ids (`polymarket`, `kalshi`, `limitless`, `myriad`) resolve there automatically:

```bash
npm run cli.ts -- -p polymarket fetchEvents '{"query":"trump"}'
npm run cli.py -- --prediction kalshi fetchTicker KXBTC-25DEC31-B100000:YES --sandbox
npm run cli.go -- -p hyperliquid fetchBalance
```

## Source

- CCXT docs, "Prediction Markets" — docs.ccxt.com (per-exchange references under `/docs/prediction`, e.g. `/docs/prediction/polymarket`; runnable examples at `/docs/examples/ts/prediction-markets`).
- Related: [cli-and-mcp.md](cli-and-mcp.md) for the CLI `-p` flag and the MCP `search_events` tool.

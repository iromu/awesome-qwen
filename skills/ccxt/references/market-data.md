# CCXT Public Market Data

Unified public (no-auth) market-data methods: order books, tickers, OHLCV, trades, exchange status, and the derivatives/options public endpoints.

Signatures below are neutral. Method and parameter names are shown in the JS/TS form (`fetchOrderBook`, `fetchOHLCV`, `params`); the Python form is snake_case (`fetch_order_book`, `fetch_ohlcv`). All unified methods take `params` (dict) as their **last** argument; its contents are always exchange-specific and non-unified.

## Method inventory

| Method | Returns | Key params (in order) | Notes |
|--------|---------|-----------------------|-------|
| `fetchOrderBook` | order book structure | `symbol` (required), `limit`, `params` | `limit` = max per side, not guaranteed |
| `fetchOrderBooks` | dict of order book structures keyed by symbol | `symbols`, `limit`, `params` | omit `symbols` = all markets |
| `fetchL2OrderBook` | order book structure (L2 aggregated) | `symbol`, `limit`, `params` | forces L2 whatever the exchange returns |
| `fetchTicker` | ticker structure | `symbol` (required), `params` | check `exchange.has['fetchTicker']` |
| `fetchTickers` | dict of ticker structures keyed by symbol | `symbols`, `params` | both optional; strictly rate-limited |
| `fetchOHLCV` | array of OHLCV arrays | `symbol`, `timeframe = '1m'`, `since`, `limit`, `params` | check `exchange.has['fetchOHLCV']`; timeframes in `exchange.timeframes` |
| `fetchMarkOHLCV` / `fetchIndexOHLCV` / `fetchPremiumIndexOHLCV` | array of OHLCV arrays | `symbol`, `timeframe`, `since`, `limit`, `params` | convenience wrappers over `fetchOHLCV` |
| `buildOHLCV` | array of OHLCV arrays | trades, timeframe (as in docs' example) | builds candles in userland from trades |
| `fetchTrades` | array of trade structures | `symbol`, `since`, `limit`, `params` | sorted ascending by timestamp |
| `fetchTime` | integer timestamp (ms) from exchange server | `params` | if available |
| `fetchStatus` | exchange status structure | `params` | hardcoded, ping/`fetchTime`-based, or dedicated endpoint |
| `fetchCrossBorrowRate` | borrow rate structure | `code` (required), `params` | margin only |
| `fetchCrossBorrowRates` | dict of borrow rate structures keyed by currency code | `params` | margin only |
| `fetchIsolatedBorrowRate` | isolated borrow rate structure | `symbol` (required), `params` | margin only |
| `fetchIsolatedBorrowRates` | dict of isolated borrow rate structures keyed by symbol | `params` | margin only |
| `fetchBorrowRateHistory` | array of borrow rate structures | `code` (required), `since`, `limit`, `params` | margin only |
| `fetchMarketLeverageTiers` | leverage tiers structure | `symbol` (required), `params` | contract only; private on **binance** |
| `fetchLeverageTiers` | array of leverage tiers structures | `symbols`, `params` | contract only; private on **binance** |
| `fetchFundingRate` | funding rate structure | `symbol` (required), `params` | contract only |
| `fetchFundingRates` | array of funding rate structures indexed by market symbols | `symbols`, `params` | contract only |
| `fetchFundingInterval` | funding rate structure | `symbol` (required), `params` | contract only |
| `fetchFundingIntervals` | array of funding rate structures | `symbols`, `params` | contract only |
| `fetchFundingRateHistory` | array of funding rate history structures | `symbol`, `since`, `limit`, `params` | contract only |
| `fetchOpenInterest` | open interest structure | `symbol`, `params` | contract only |
| `fetchOpenInterests` | dict of open interest structures | `symbols`, `params` | `undefined` symbols = all |
| `fetchOpenInterestHistory` | array of open interest structures | `symbol`, `timeframe = '5m'`, `since`, `limit`, `params` | okx expects a currency code in `symbol` |
| `fetchVolatilityHistory` | array of volatility structures | `code` (required), `params` | option only |
| `fetchUnderlyingAssets` | underlying assets structure (array of market ids) | `params` (`params.type` = unified marketType, default `'option'`) | contract only |
| `fetchSettlementHistory` | array of settlement history structures | `symbol`, `since`, `limit`, `params` | contract only; public |
| `fetchMySettlementHistory` | array of settlement history structures | `symbol`, `since`, `limit`, `params` | own history only |
| `fetchLiquidations` | array of liquidation structures | `symbol`, `since`, `limit`, `params` | margin and contract only |
| `fetchMyLiquidations` | array of liquidation structures | `symbol`, `since`, `limit`, `params` | own liquidations |
| `fetchGreeks` | greeks structure | `symbol`, `params` | option only |
| `fetchAllGreeks` | dict of greeks structures indexed by symbol | `symbols`, `params` | option only |
| `fetchOption` | option chain structure (single contract) | `symbol`, `params` | option only |
| `fetchOptionChain` | list of option chain structures | `code` (required), `params` | option only, by underlying currency |
| `fetchLongShortRatio` | long short ratio structure | `symbol` (required), `period`, `params` | contract only |
| `fetchLongShortRatioHistory` | array of long short ratio structures | `symbol`, `period`, `since`, `limit`, `params` | contract only |
| `fetchADLRank` | auto de leverage structure | `symbol`, `params` | contract only |

## Order book structure

```javascript
{
    'bids': [ [ price, amount ], ... ],   // sorted by price DESC — best (highest) bid first
    'asks': [ [ price, amount ], ... ],   // sorted by price ASC — best (lowest) ask first
    'symbol': 'ETH/BTC',
    'timestamp': 1499280391811,            // ms since Epoch, may be undefined/None/null
    'datetime': '2017-07-05T18:47:14.692Z',
    'nonce': 1499280391811,                // increasing unique id of the snapshot
}
```

- Prices and amounts are floats. Bid/ask arrays can be empty.
- `timestamp` is when the **exchange** generated the response; may be missing on exchanges that don't provide it.
- The optional **third** element of a bid/ask row is exchange-dependent and one of:
  - `[ price, amount, id ]` — L3 row id inside the orderbook (not necessarily the real order id);
  - `[ price, amount, count ]` — L2 aggregated order count at that price level;
  - `[ price, amount, timestamp ]` — when the order was placed.
- Aggregation levels: **L1** market price only (looks like one order), **L2** volumes grouped by price (the common case), **L3** no aggregation, duplicates present; some exchanges never return L3.
- Market price = first row of each side:

```python
ob = exchange.fetch_order_book('BTC/USDT')
bid = ob['bids'][0][0] if len(ob['bids']) else None
ask = ob['asks'][0][0] if len(ob['asks']) else None
spread = ask - bid if (bid and ask) else None
```

- `limit` is an upper boundary only: fewer rows are returned when the book is thin, it is **ignored** if the exchange's endpoint has no limit parameter, and CCXT does **not** trim rows the exchange returns beyond your limit. Depth-level overrides beyond `limit` go in exchange-specific `params` (e.g. Bitfinex `'group': 1`).

## Ticker structure

24h statistical cut; treat as "live 24h OHLCV", **not** as a `fetchOrderBook` replacement.

```javascript
{
    'symbol': 'BTC/USD',
    'info': { /* original unparsed exchange reply */ },
    'timestamp': 1499280391811,            // ms since Epoch (UTC)
    'datetime': '2017-07-05T18:47:14.692Z',
    'high': float, 'low': float,
    'bid': float, 'bidVolume': float,      // current best bid / its amount
    'ask': float, 'askVolume': float,      // current best ask / its amount
    'vwap': float,
    'open': float, 'close': float, 'last': float,   // last duplicates close
    'previousClose': float,
    'change': float,                       // last - open
    'percentage': float,                   // (change / open) * 100
    'average': float,                      // (last + open) / 2
    'baseVolume': float,                   // base currency traded in 24h
    'quoteVolume': float,                  // quote currency traded in 24h
}
```

- All fields represent the past 24 hours prior to `timestamp`. All **prices are in quote currency**. Any field may be `undefined`/`None`/`null`.
- `baseVolume`/`quoteVolume` = amount of base/quote currency bought or sold in the last 24h.
- `fetchTickers()` returns `{ 'info': {...}, 'BTC/USD': {ticker}, 'ETH/BTC': {ticker}, ... }`.
- `exchange.last_response_headers['Date']` holds the HTTP response date string (1-second precision, timezone per RFC 2616/1123/822).

## OHLCV structure

```javascript
[
    [
        1504541580000, // 0: UTC timestamp in milliseconds, integer
        4235.4,        // 1: (O)pen price, float
        4240.6,        // 2: (H)ighest price, float
        4230.0,        // 3: (L)owest price, float
        4230.7,        // 4: (C)losing price, float
        37.72941911    // 5: (V)olume, float — usually base currency; the exchange docstring may say quote
    ],
    ...
]
```

- Flat array of arrays (no per-candle keys), sorted **ascending** (oldest first, most recent last).
- Gaps are normal: missing periods appear when the exchange had no trades for that range.
- The last (current) candle may be incomplete until it closes.
- `exchange.timeframes` lists valid `timeframe` values (populated only when `has['fetchOHLCV']` is true).
- Historical mark / index / premium-index candles: pass `{'price': 'mark'}`, `{'price': 'index'}` or `{'price': 'premiumIndex'}` in `fetchOHLCV` params.

## Public trade structure

```javascript
[
    {
        'info': { /* original decoded JSON as is */ },
        'id': '12345-67890:09876/54321',   // string trade id
        'timestamp': 1502962946216,         // ms
        'datetime': '2017-08-17 12:42:48.000',
        'symbol': 'ETH/BTC',
        'order': '12345-67890:09876/54321', // order id or undefined/None/null
        'type': 'limit',                    // 'market' | 'limit' | undefined
        'side': 'buy',                      // 'buy' | 'sell'
        'takerOrMaker': 'taker',            // 'taker' | 'maker'
        'price': 0.06917684,                // float, quote currency
        'amount': 1.5,                      // base currency amount
        'cost': 0.10376526,                 // price * amount
        'fee': { 'cost': 0.0015, 'currency': 'ETH', 'rate': 0.002 },
        'fees': [ { 'cost': ..., 'currency': ..., 'rate': ... } ],  // multi-currency fees
    },
    ...
]
```

- Sorted by timestamp **ascending**. Guaranteed fields are usually only `timestamp`, `datetime`, `symbol`, `price`, `amount`; `type`, `side`, `id`, `order` may be absent.
- `fee.currency` is usually base currency for buys, quote currency for sells.
- `since` (2nd arg) filters by timestamp, `limit` (3rd) by count, `params` (4th) is exchange-specific.

## Exchange time / status

`fetchTime(params = {})` → current integer timestamp in **milliseconds** from the exchange server.

`fetchStatus(params = {})` → availability of the API (hardcoded in the exchange class, derived from ping/`fetchTime`, or from a dedicated status endpoint):

```javascript
{
    'status': 'ok',          // 'ok' | 'shutdown' | 'error' | 'maintenance'
    'updated': undefined,    // int ms, last update via the API
    'eta': undefined,        // when maintenance/outage is expected to end
    'url': undefined,        // link to a GitHub issue or exchange post
}
```

`'ok'` fully operational; `'shutdown'` closed (`updated` = shutdown datetime); `'error'` exchange API or the CCXT implementation is broken; `'maintenance'` regular maintenance (`eta` = expected recovery).

## Convenience methods

- `fetchL2OrderBook(symbol, limit, params)` / `fetch_l2_order_book(symbol, limit, params)` — get an L2 order book whatever the exchange returns. The docs also refer to a `fetchL[123]OrderBook` family as the unified way to access bids and asks.
- `fetchMarkPriceOHLCV`, `fetchIndexPriceOHLCV`, `fetchPremiumIndexOHLCV` — obtain historical mark, index and premium-index prices/volumes (named so in the Price Tickers section).
- `fetchMarkOHLCV`, `fetchIndexOHLCV`, `fetchPremiumIndexOHLCV` — the same convenience methods, named so in the Mark/Index/PremiumIndex Candlestick Charts section. The two sections use different names; verify against your installed version before calling.

```python
mark_klines = exchange.fetch_mark_ohlcv('ADA/USDT', '1h')
index_klines = exchange.fetch_index_ohlcv('ADA/USDT', '1h')
```

- `buildOHLCV` / `build_ohlcv` — build candles in userland from a trade list (see the "build-ohlcv-bars" example in the examples folder).
  - Expects trades chronologically sorted, newest last.
  - Trades with `0` price are skipped to avoid distorted values; disable with:

```
exchange.options['buildOHLCV'] = {
    'skipZeroPrices': false
};
```

- Raw OHLCV response: the unified OHLCV array carries no `info`. To keep the raw row, override `parseOHLCV(ohlcv, market)` (JS) or `parse_ohlcv` (Python) and return the original plus the raw array (JS returns `{'result': ..., 'raw': ohlcv}`; Python appends the raw row as an extra list element).

## Derivatives / margin public methods

| Method | For | Structure highlights |
|--------|-----|----------------------|
| `fetchFundingRate` / `fetchFundingRates` | current, most recent and next funding rates (contract) | `info`, `symbol`, `markPrice`, `indexPrice`, `interestRate`, `estimatedSettlePrice`, `timestamp`, `datetime`, `fundingRate`, `fundingTimestamp`, `fundingDatetime`, `nextFundingRate`, `nextFundingTimestamp`, `nextFundingDatetime`, `previousFundingRate`, `previousFundingTimestamp`, `previousFundingDatetime`, `interval` (e.g. `'8h'`) |
| `fetchFundingInterval` / `fetchFundingIntervals` | current funding interval | returns a funding rate structure |
| `fetchFundingRateHistory` | past funding rates | `info`, `symbol`, `fundingRate`, `timestamp`, `datetime` |
| `fetchOpenInterest` / `fetchOpenInterests` | current open interest | `symbol`, `baseVolume` (deprecated), `quoteVolume` (deprecated), `openInterestAmount`, `openInterestValue`, `timestamp`, `datetime`, `info` |
| `fetchOpenInterestHistory` | open interest over time | same structure, array; `timeframe = '5m'` default |
| `fetchMarketLeverageTiers` / `fetchLeverageTiers` | max leverage per position-size tier, maintenance margin, max tradeable amount | array of `{ tier, symbol, currency, minNotional, maxNotional, maintenanceMarginRate, maxLeverage, info }`. Absolute max leverage is also at `market['limits']['leverage']['max']` |
| `fetchLiquidations` / `fetchMyLiquidations` | public / own liquidations | `info`, `symbol`, `contracts`, `contractSize`, `price` (avg liq. price, quote ccy), `baseValue` (= contracts × contractSize), `quoteValue` (= baseValue × price), `timestamp`, `datetime` |
| `fetchGreeks` / `fetchAllGreeks` | greeks + implied volatility of an option | `symbol`, `timestamp`, `datetime`, `delta`, `gamma`, `theta`, `vega`, `rho`, `vanna`, `volga`, `charm`, `bidSize`, `askSize`, `bidImpliedVolatility`, `askImpliedVolatility`, `markImpliedVolatility`, `bidPrice`, `askPrice`, `markPrice`, `lastPrice`, `underlyingPrice`, `info` |
| `fetchOption` / `fetchOptionChain` | option contract details / chain of an underlying | `info`, `currency`, `symbol`, `timestamp`, `datetime`, `impliedVolatility`, `openInterest`, `bidPrice`, `askPrice`, `midPrice`, `markPrice`, `lastPrice`, `underlyingPrice`, `change`, `percentage`, `baseVolume`, `quoteVolume` |
| `fetchLongShortRatio` / `fetchLongShortRatioHistory` | long/short ratio and its history (contract) | `info`, `symbol`, `timestamp`, `datetime`, `timeframe` (e.g. `'24h'`), `longShortRatio` |
| `fetchCrossBorrowRate` / `fetchCrossBorrowRates` / `fetchIsolatedBorrowRate` / `fetchIsolatedBorrowRates` / `fetchBorrowRateHistory` | borrow interest for margin (margin only) | cross: `currency`, `rate`, `period` (ms to accrue `rate`), `timestamp`, `datetime`, `info`. Isolated adds `symbol`, `base`, `baseRate`, `quote`, `quoteRate` |
| `fetchVolatilityHistory` | volatility history of an option underlying (option only) | `info` (`period`, `value`, `time`), `timestamp`, `datetime`, `volatility` |
| `fetchUnderlyingAssets` | market ids of underlying assets for a contract market type | plain array, e.g. `[ 'BTC_USDT', 'ETH_USDT', 'DOGE_USDT' ]` |
| `fetchSettlementHistory` / `fetchMySettlementHistory` | public / own settlements (contract) | `info`, `symbol`, `price`, `timestamp`, `datetime` |
| `fetchADLRank` | auto-de-leverage risk rank (contract) | `info`, `symbol`, `rank` (quantile 1–5, 5 = highest risk), `rating` (`'low'`/`'medium'`/`'high'`), `percent` (higher = higher risk), `timestamp`, `datetime` |

Leverage-tier worked example from the docs (tier 1: 0–10000 at 75×, tier 2: 10000–50000 at 50×, …, tier 9: 20000000–50000000 at 1×): stakes below 133.33 → max leverage 75; stakes 200–1000 → 50; a stake of 150 → `10000 / 150` = 66.66; stakes 133.33–200 → `10000 / stake` = 50.01–74.99. **htx** uses both leverage and amount to determine maintenance margin rates.

## Units and pitfalls

- **Timestamps are milliseconds everywhere** in the unified API (`since`, `timestamp` fields), UTC, integer, since 1 Jan 1970. `datetime` is an ISO8601 string with milliseconds.
- **Prices are quote currency; amounts are base currency**; `cost = price * amount`. OHLCV volume is usually base currency — check the exchange docstring, which may declare quote units.
- `since` omitted → you get whatever the exchange's default window is (from listing date, last 24h, last N trades, …). That is documented behaviour, not a bug: pass `since` explicitly whenever the range matters.
- `limit` is a maximum, not a guarantee — fewer items are returned when the exchange has fewer, and it is silently ignored when the exchange endpoint has no such parameter.
- Rate limits: iterate `exchange.markets` with a delay of `exchange.rateLimit` (ms in JS; `/1000` for Python `time.sleep`; `×1000` for PHP `usleep`). `fetchTickers()` without symbols is usually strictly rate-limited and costs more than an average call — an exchange may ban frequent pollers; the docs suggest not polling it more than about once a minute.
- Support is per-exchange: gate calls on `exchange.has['fetchTicker']`, `exchange.has['fetchTickers']`, `exchange.has['fetchOHLCV']`, `exchange.has['fetchTrades']`.
- Tickers and OHLCV are **secondary** data computed by the exchange from first-order orderbook/trade data, so they always lag; latency is exchange-specific (seconds to minutes). For time-critical strategies, use order books/trades or compute candles in userland (`buildOHLCV`). REST vs WebSocket changes network latency only, not the exchange engine's calculation delay.
- Public trades cannot be fetched all-at-once: paginate in a loop (`since` + `limit`); some exchanges support no pagination at all and only serve recent trades.
- OHLCV history depth is capped by the exchange (typically ~1000 candles per timeframe); poll and store the latest candles yourself to backfill.
- `fetchOpenInterest.baseVolume` / `quoteVolume` are deprecated — read `openInterestAmount` / `openInterestValue`.
- `nextFundingRate` is actually **two** funding rates from now.
- Exchange-specific argument quirks: `okx.fetchOpenInterestHistory` expects a unified **currency code** (e.g. `'BTC'`) in `symbol`, not a unified symbol. Leverage-tier methods are **private** on binance.
- `fetchUnderlyingAssets` takes `params.type` = unified marketType, default `'option'`.
- Missing fields are expected: order book `timestamp`/`datetime` and most ticker fields may be `undefined`/`None`/`null`. The Public Trades section is marked "under heavy development, contributions appreciated".

## Source

- https://github.com/ccxt/ccxt/wiki/Manual#public-api
- https://github.com/ccxt/ccxt/wiki/Manual#order-book
- https://github.com/ccxt/ccxt/wiki/Manual#price-tickers
- https://github.com/ccxt/ccxt/wiki/Manual#ohlcv-candlestick-charts
- https://github.com/ccxt/ccxt/wiki/Manual#public-trades
- https://github.com/ccxt/ccxt/wiki/Manual#exchange-time
- https://github.com/ccxt/ccxt/wiki/Manual#exchange-status
- https://github.com/ccxt/ccxt/wiki/Manual#borrow-rates
- https://github.com/ccxt/ccxt/wiki/Manual#leverage-tiers
- https://github.com/ccxt/ccxt/wiki/Manual#funding-rate
- https://github.com/ccxt/ccxt/wiki/Manual#open-interest-history
- https://github.com/ccxt/ccxt/wiki/Manual#liquidations
- https://github.com/ccxt/ccxt/wiki/Manual#greeks
- https://github.com/ccxt/ccxt/wiki/Manual#option-chain
- https://github.com/ccxt/ccxt/wiki/Manual#auto-de-leverage

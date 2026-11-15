# CCXT Margin, Leverage & Derivatives

Leverage-side unified API: margin loans, collateral adjustment, margin mode, leverage, positions, funding, ADL, plus the Proxy and String Math settings.
Signatures are JS/TS (`camelCase`); Python uses `snake_case`. Applicability tags are the docs': **margin only**, **contract only**, **margin and contract only**.

## Terminology: collateral

`collateral (current margin balance) = initial margin + realized & unrealized profit`. Do not confuse it with `initialMargin` / `maintenanceMargin`. Docs' example: 50$ initial margin with −15$ unrealized PnL ⇒ collateral 35$; if maintenance margin is 25$, collateral must not drop below it or the position is liquidated.

## Borrow Interest — *margin only*

```
fetchBorrowInterest (code = undefined, symbol = undefined, since = undefined, limit = undefined, params = {})
```
**symbol** = an isolated margin market; leave undefined to return cross margin interest. Returns borrow interest structures: `info`; `symbol` (market the interest accrued in); `currency` (of the interest); `interest` (amount charged); `interestRate` (borrow rate); `amountBorrowed`; `marginMode` (`'cross'`/`'isolated'` of the borrowed amount); `timestamp` / `datetime` (when charged).

## Borrow And Repay Margin — *margin only*

```
borrowCrossMargin (code, amount, params = {})                  repayCrossMargin (code, amount, params = {})
borrowIsolatedMargin (symbol, code, amount, params = {})       repayIsolatedMargin (symbol, code, amount, params = {})
```
**code** *required* unified currency; **amount** *required* float; the isolated variants also take **symbol** *required* (isolated margin market, e.g. `"BTC/USDT"`); **params** e.g. `{"rate": 0.002}`. Returns a margin loan structure: `id`, `currency`, `amount`, `symbol`, `timestamp`, `datetime`, `info`.

## Margin (collateral of an open position) — *margin and contract only*

```
addMargin (symbol, amount, params = {})      reduceMargin (symbol, amount, params = {})
setMargin (symbol, amount, params = {})
fetchMarginAdjustmentHistory (symbol = undefined, type = undefined, since = undefined, limit = undefined, params = {})
```
**symbol** *required* (e.g. `"BTC/USDT:USDT"`); **amount** *required* (documented type: String); **params** e.g. `{"leverage": 5}`. History **type** is `"add"` or `"reduce"`; its `params` e.g. `{"auto": true}` covers adjustments made automatically by the exchange. Use `addMargin` when the trade moves against you (lowers liquidation risk), `reduceMargin` to take profits.

Margin structure: `info`, `type` (`'add'`/`'reduce'`/`'set'`), `amount`, `total` (undefined if the exchange omits it), `code`, `symbol`, `status`.

## Set Margin Mode — *contract only*

```
setMarginMode (marginMode, symbol = undefined, params = {})
```
- `marginMode` *required*: `"cross"` (one account shares collateral between markets; margin taken from total account balance to avoid liquidation) or `"isolated"` (each market keeps collateral in a separate account).
- `symbol` *required* on most exchanges; omitted when the mode is not market-specific. Returns the exchange response.

`exchange.has['setMarginMode'] == false` documented causes: no leveraged trading offered; only one of cross/isolated offered; or the mode must be set via an exchange-specific `params` entry to `createOrder`.

**Suppressed errors:** some APIs return an error when asked to set a mode already in effect (e.g. `{ code: -4046, msg: 'No need to change margin type.' }`). ccxt does not treat that as an error — the end state is what the user wanted — so the error is suppressed and returned as an object. Inspect the returned object, not only the absence of a throw.

### The `marginMode` parameter

Many methods accept `marginMode` (`cross` | `isolated`) in `params`. For a **spot margin** order, use a unified spot symbol (or set the market type to spot) plus `marginMode`:

```js
await exchange.createOrder('ETH/USDT', 'market', 'buy', 0.1, 1500, { 'marginMode': 'isolated' })
```
```python
exchange.create_order('ETH/USDT', 'market', 'buy', 0.1, 1500, {'marginMode': 'isolated'})
```

## Fetch Margin Mode — *margin and contract only*

```
fetchMarginMode (symbol, params = {})              # symbol *required*; params e.g. {"subType": "linear"}
fetchMarginModes (symbols = undefined, params = {}) # list of symbols, or all market symbols
```
Structure: `{ info, symbol, marginMode }`.

## Set Leverage / Leverage — *margin and contract only*

```
setLeverage (leverage, symbol = undefined, params = {})   # leverage Integer *required*; params e.g. {"marginMode": "cross"}
fetchLeverage (symbol, params = {})        fetchLeverages (symbols = undefined, params = {})
```
`symbol` is *required* on most exchanges, omitted where leverage is set for the account rather than per market. `setLeverage` returns the exchange response. Leverage structure: `{ info, symbol, marginMode, longLeverage, shortLeverage }` — long and short leverage can differ.

## Contract Trading

Covers dated futures, perpetual swaps with funding payments, and inverse futures/swaps. Where several endpoints serve different derivatives types, **CCXT defaults to `"linear"` (not `"inverse"`) and `"swap"` (not `"future"`)**.

### Positions — *contract only*

```
fetchPosition (symbol, params = {})                    # symbol *required*
fetchPositions (symbols = undefined, params = {})       # omit symbols to retrieve all
fetchAccountPositions (symbols = undefined, params = {})
fetchPositionHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
fetchPositionsHistory (…)   # named in the docs' method list; signature not documented
```

Position structure fields:

| Field | Meaning |
|---|---|
| `info` / `id` | Raw reply / position id (like an order id) |
| `symbol`, `timestamp`, `datetime` | Uppercase pair / ms since epoch / ISO8601 |
| `isolated`, `hedged`, `side` | bools — isolated vs cross; whether an opposite-direction order closes it or opens a new one / `long` or `short` |
| `contracts`, `contractSize` | Number of contracts (the size — **not** a base amount) / size of one contract in quote units |
| `entryPrice`, `markPrice` | Average entry price / price used for funding calculations |
| `notional`, `leverage` | Position value in the settlement currency / position leverage |
| `positionMargin` | Margin actually held in the position; does not move with price or PnL |
| `collateral` | `positionMargin + unrealizedPnl` — current value backing the position |
| `initialMargin`, `maintenanceMargin` | Collateral locked / minimum collateral before liquidation |
| `initialMarginPercentage`, `maintenanceMarginPercentage` | The two above as a fraction of notional |
| `unrealizedPnl`, `liquidationPrice` | May be negative / price where collateral falls to `maintenanceMargin` |
| `marginMode`, `percentage` | `cross`/`isolated` / `unrealizedPnl / initialMargin * 100` |

### Position semantics (formulas `safePosition` uses to fill missing fields)

- `baseCurrencySize = contracts * contractSize` (linear); `quoteCurrencySize = contracts * contractSize` (inverse).
- `notional = baseCurrencySize * markPrice` (linear) or `quoteCurrencySize / markPrice` (inverse).
- `unrealizedPnl = ±(markPrice − entryPrice) * baseCurrencySize` (linear) or `±(1/entryPrice − 1/markPrice) * quoteCurrencySize` (inverse); `+` long, `−` short.
- `initialMargin = notional * initialMarginPercentage`, with `initialMarginPercentage ≈ 1 / leverage`; `maintenanceMargin = notional * maintenanceMarginPercentage`.
- `marginRatio = maintenanceMargin / (positionMargin + unrealizedPnl)`.
- Liquidation (isolated): `positionMargin − |entryPrice − liquidationPrice| * baseCurrencySize = maintenanceMargin` (linear); inverse uses `1/price`. Five known values let `safePosition` derive the sixth, only when the result is positive.

Documented pitfalls:
- `|entryPrice − liquidationPrice| * baseCurrencySize` is the **loss before liquidation** (`= positionMargin − maintenanceMargin`), not the maintenance margin.
- The isolated equation does **not** apply to cross positions — their `liquidationPrice` depends on whole-account equity and other positions and can be far away, `0`, negative, or clamped to the smallest tick (e.g. `0.0001`).
- Prefer absolute `initialMargin`/`maintenanceMargin` over the `*Percentage` fields — MM may be derived from funding rate and taker fees too.
- `positionMargin` starts at `initialMargin` (plus a fee buffer on gate, bybit, kucoin), then moves only on margin add/remove, fees or funding. Funding appears in it only where the exchange settles funding into position margin (okx, gate, bitget, kucoin, hyperliquid, htx isolated); binance/xt/mexc settle it to available balance, phemex to realized PnL. ccxt never adds cumulative funding itself — that would break the liquidation equation.
- Exchange quirks: MM computed at `entryPrice` (bingx, kucoin, mexc, xt, phemex) vs `markPrice` (okx, binance, htx, hyperliquid); closing taker fees folded into `liquidationPrice`/`maintenanceMargin` by gate (0.075%), bitget (0.06%), okx (0.05%), bybit (`feeToClose`); binance and aster subtract a tiered `cum`; hyperliquid and pacifica use `maintenanceMarginPercentage = 1 / (2 * maxLeverage)`.
- Inverse contracts: collateral is the base currency, amounts are quoted as if traded USD/BTC while price stays in BTC/USD; PnL = `(1/markPrice − 1/price) * contracts`.

### Closing Positions — *contract only*

```
closePosition (symbol, side = undefined, params = {})   # returns an order structure
closeAllPositions (params = {})                          # returns a list of order structures
```
`side` (`buy` | `sell`) is optional; some exchanges require it.

### Position Mode — *margin and contract only*

```
setPositionMode (hedged, symbol = undefined, params = {})   # true = hedged, false = one-way
fetchPositionMode (symbol = undefined, params = {})         # -> { info, hedged }
```

### Funding History — *contract only*

Perpetual swaps exchange funding between longs and shorts (longs pay when the contract trades above the underlying, shorts pay when below), at set times of day; usually no commission to the exchange.

```
fetchFundingHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```
Structure: `info`, `symbol`, `code`, `timestamp`, `datetime`, `id`, `amount` (signed — the docs' example is negative).

### Conversion

Quote-then-trade; a quote is valid only within an exchange-specified timeframe. `amount` is in units of the **from** currency; `params` may carry `{"toAmount": …}`.

```
fetchConvertQuote (fromCode, toCode, amount = undefined, params = {})
createConvertTrade (id, fromCode, toCode, amount = undefined, params = {})   # id from fetchConvertQuote
fetchConvertTrade (id, code = undefined, params = {})
fetchConvertTradeHistory (code = undefined, since = undefined, limit = undefined, params = {})
```
Conversion structure: `info`, `timestamp`, `datetime`, `id`, `fromCurrency`, `fromAmount`, `toCurrency`, `toAmount`, `price`, `fee`.

## Auto De Leverage — *contract only*

```
fetchPositionADLRank (symbol, params = {})      # params e.g. {"category": "futures"}
fetchPositionsADLRank (symbols, params = {})
```
Structure: `info`, `symbol`, `rank` (quantile 1–5, 5 = highest risk), `rating` (`low`/`medium`/`high`), `percent` (higher = higher ADL risk), `timestamp`, `datetime`.

## Proxy

Set when the exchange is unavailable in your location, your IP is forbidden, or you hit random restrictions (e.g. Cloudflare/DDoS protection). Each added intermediary adds latency.

| Property | Effect |
|---|---|
| `proxyUrl` | Prepends a URL to API requests (`https://cors-anywhere.herokuapp.com/…`), producing `…/https://exchange.xyz/api/endpoint`. **REST only**, not WebSockets. Override `urlEncoderForProxyUrl` to customize the target URL. |
| `httpProxy` / `httpsProxy` | Real HTTP(s) proxy, tunnelled to the target. **Non-WebSocket requests only.** |
| `wsProxy` / `wssProxy` | Route CCXT's WebSockets through a proxy — set *in addition to* `httpProxy`/`httpsProxy`. |
| `socksProxy` / `wsSocksProxy` | SOCKS proxy, e.g. `'socks5://1.2.3.4:8080/'`; protocols `socks`, `socks5`, `socks5h`. |
| `userAgent` | Override the sent User-Agent string. |

Callbacks instead of properties: `proxyUrlCallback`, `http(s)ProxyCallback`, `socksProxyCallback` — e.g. `myEx.proxyUrlCallback = function (url, method, headers, body) { return 'http://1.2.3.4/' }`.

Go users must call `UpdateProxySettings()` after setting any proxy property. CORS (`No 'Access-Control-Allow-Origin'`) is a browser-side problem — route through a CORS proxy via `proxyUrl`. Language-specific custom proxy agents exist as example scripts (JS, Python sync/async).

## String Math

ccxt uses numeric types by default; floating-point rounding is unsuitable when exact decimal amounts/prices matter. Switch an instance to fixed-point math over string types by assigning `number`:

```js
const ex = new ccxt.coinbase(); ex.number = String;   // String | Number
```
```python
ex = ccxt.coinbase(); ex.number = str                  # str | float
```
(PHP `'strval'`; Go `ex.Number = "String"`.) Amounts and prices then arrive as strings — parse with an exact decimal type, not a float.

## Source

Upstream: https://github.com/ccxt/ccxt/wiki/Manual — sections
`#borrow-interest`, `#borrow-and-repay-margin`, `#margin`, `#margin-mode`, `#leverage`,
`#positions`, `#funding-history`, `#conversion`, `#auto-de-leverage`, `#proxy`, `#string-math`.

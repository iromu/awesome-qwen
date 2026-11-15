# CCXT Trading: Orders and Trades

Unified private order API — order structure, `createOrder` and its order-type variants, order management, and my-trades. Naming convention: Python uses `snake_case` methods (`create_order`, `fetch_my_trades`), JS/TS uses `camelCase` (`createOrder`, `fetchMyTrades`); parameter lists are identical. Python async: `import ccxt.async_support as ccxt` and `await` the call (the sync module and `asyncio.run(...)` are both documented).

The orders part of the unified API is documented as a work in progress — expect missing implementations and gate every call on capability flags.

## Order structure

Returned by `createOrder`, `fetchOrder`, `fetchOrders`, `fetchOpenOrders`, `fetchClosedOrders`, `fetchCanceledOrders`, `editOrder`, `cancelOrder`, `cancelOrders`, `cancelAllOrders`.

```javascript
{
    'id':                '12345-67890:09876/54321', // string
    'clientOrderId':     'abcdef-ghijklmnop-qrstuvwxyz', // user-defined, if any
    'datetime':          '2017-08-17 12:42:48.000', // ISO8601 of 'timestamp' with ms
    'timestamp':          1502962946216, // order placing/opening, ms
    'lastTradeTimestamp': 1502962956216, // ms of most recent trade on this order
    'status':      'open',
    'symbol':      'ETH/BTC',
    'type':        'limit',
    'timeInForce': 'GTC',
    'side':        'buy',
    'price':        0.06917684,   // quote currency (may be empty for market orders)
    'average':      0.06917684,   // average filling price
    'amount':       1.5,          // ordered amount of base currency
    'filled':       1.1,          // filled amount of base currency
    'remaining':    0.4,          // remaining amount to fill
    'cost':         0.076094524,  // filled * price (filling price used where available)
    'trades':     [ ... ],        // list of order trades/executions
    'fee': { 'currency': 'BTC', 'cost': 0.0009, 'rate': 0.002 }, // fee rate, if available
    'triggerPrice': 10000,
    'stopLossPrice': 50000,
    'takeProfitPrice': 150000,
    'reduceOnly': false,
    'postOnly': false,
    'info': { ... },              // original unparsed response as is
}
```

- `createOrder` guarantees only `id` and `info`; every other field may be `undefined / None / null`.
- Use `filled`, not `status`, to decide unfilled / partially filled / fully filled and by how much.
- `cost` is `filled * price` — total **quote** volume (`amount` is the **base** volume). Convenience field, deducible from others.
- `average` is the actual average fill price; compare with `price` to measure slippage.
- `lastTradeTimestamp` is `undefined/None/null` when unsupported or when there are no fills yet; `status` has precedence over it. Some exchanges accept an expiration timestamp at placement; unfilled orders then become `'expired'`.
- `fee.currency` names the currency the fee is in (usually quote), may differ from both traded currencies (ETH/BTC order with fees in USD), and the whole `fee` may be missing partially or entirely depending on exchange capabilities.

### Enumerated values

| Field | Values |
|-------|--------|
| `type` | `'market'`, `'limit'` (unified). Non-unified types go through `params` (see Custom params) |
| `side` | `'buy'` = give quote, receive base. `'sell'` = give base, receive quote |
| `status` | `'open'` (not filled or partially filled), `'closed'` (fully filled), `'canceled'` (unfilled-and-canceled or partially filled then canceled), `'expired'`, `'rejected'` |
| `timeInForce` | `'GTC'` good till canceled — stays on the book until matched or canceled. `'IOC'` immediate or cancel — match immediately, partially or fully, remainder canceled. `'FOK'` fill or kill — must fully fill immediately or the whole order is canceled. `'PO'` post only — placed as maker or canceled; unification in progress, check `exchange.has['createPostOnlyOrder']` |

`timeInForce` may be `undefined/None/null` when the exchange does not specify it.

## Creating orders

```javascript
createOrder (symbol, type, side, amount, price = undefined, params = {})
createOrders (orders, params = {})   // orders = list, each element with symbol, type, side, amount, price, params
```

| Param | Required | Notes |
|-------|----------|-------|
| `symbol` | yes | Unified market symbol; must exist on the exchange and be tradable |
| `type` | — | `'market'` or `'limit'`. Some exchanges reject market orders entirely |
| `side` | yes | `'buy'` / `'sell'` |
| `amount` | — | Usually base-currency units; some exchanges are side-dependent (see Amount semantics) |
| `price` | — | Quote-currency units; ignored in market orders |
| `params` | — | Dict of exchange-specific extras, e.g. `{"settle": "usdt"}` |

Returns an order structure. Use the returned `id` to poll state later. Convenience wrappers all delegate to `createOrder (symbol, type, side, amount, price, params)`:

```javascript
exchange.createLimitBuyOrder (symbol, amount, price, params)    // create_limit_buy_order
exchange.createLimitSellOrder (symbol, amount, price, params)   // create_limit_sell_order
exchange.createLimitOrder (symbol, side, amount, price, params)
exchange.createMarketBuyOrder (symbol, amount, params)          // create_market_buy_order
exchange.createMarketSellOrder (symbol, amount, params)
exchange.createMarketOrder (symbol, side, amount, params)
```

### Capability checks

Check `exchange.has` before calling — the library throws `NotSupported` for unimplemented methods. Values are `true`, `false`, or the string `'emulated'` (missing from the exchange API, worked around client-side): `exchange.has['fetchOrder']`, `['fetchOrders']`, `['fetchOpenOrders']`, `['fetchClosedOrders']`, `['createMarketOrder']` (some exchanges are limit-only), `['createPostOnlyOrder']`, `['createOrders']`, `['cancelAllOrdersAfter']`, `['fetchMyTrades']`, `['fetchOrderTrades']`, `['setPositionMode']`.

For trigger/SL/TP/trailing/hedged features use `exchange.features` or the helper `exchange.featureValue(symbol, 'createOrder', key)`, e.g. keys `'triggerPrice'`, `'stopLossPrice'`, `'stopLoss'`, and `'stopLoss.price'` (limit price on the stop loss): `exchange.featureValue('BTC/USDT', 'createOrder', 'triggerPrice')`.

### Limit and market

```python
order = exchange.create_order(symbol, 'limit', 'buy', amount, price)
order = exchange.create_order(symbol, 'market', 'sell', amount)   # price ignored if given
```

Market orders fill at the best available price from the top of the book. No price guarantee — subject to **price slippage** (network roundtrip latency, exchange load, volatility) and **unequivocal order sizes** (an order larger than the top book level walks down the book and fills at multiple prices).

### Trigger orders

A trigger ("stop") order waits for `triggerPrice` then activates as a market or limit order. Typically triggered when the price crosses `triggerPrice` from **any direction**.

```python
params = {'triggerPrice': 1700}
order = exchange.create_order('ETH/USDT', 'market', 'buy', 0.1, 1500, params)
# some exchanges require the direction:
params = {'triggerPrice': 1700, 'triggerDirection': 'ascending'}  # or 'descending'
```

Add `reduceOnly: True` to make a trigger order act as a stop-loss/take-profit on an existing position.

### Stop loss (standalone)

Specify `stopLossPrice`; the `triggerDirection` is derived for you. Activates when the price drops below `stopLossPrice` from above for **sell** orders (close a long), or rises above it from below for **buy** orders (close a short).

```python
params = {'stopLossPrice': 55.45}
order = exchange.create_order(symbol, type, side, amount, price, params)
```

With `price` supplied the triggered order is a limit order; omit it to close at market.

### Take profit (standalone)

Mirror of stop loss via `takeProfitPrice`. Activates when the price rises above `takeProfitPrice` from below for **sell** orders (close a long at profit), or drops below it from above for **buy** orders (close a short at profit).

```python
params = {'takeProfitPrice': 120.45}
order = exchange.create_order(symbol, type, side, amount, price, params)
```

### Stop-loss / take-profit attached to a position (OCO)

Pass nested `stopLoss` and `takeProfit` dicts on the position-opening order. The attached orders are conditional on the primary order executing, default to the primary `amount` in the opposite direction, and cancel each other (one cancels the other). Not supported by all exchanges.

```python
params = {
    'stopLoss':   {'triggerPrice': 12.34, 'price': 12.00},  # omit 'price' for a market SL/TP
    'takeProfit': {'triggerPrice': 15.00, 'price': 15.50},
}
order = exchange.create_order('SOL/USDT', 'limit', 'buy', 0.5, 13, params)
```

Where attached SL/TP is unsupported, place the entry order and immediately submit opposite-side orders carrying `stopLossPrice` / `takeProfitPrice` (or `triggerPrice` + `reduceOnly: True`) — the position need not be open yet. This fallback may not work on some exchanges.

```python
symbol = 'ADA/USDT:USDT'
main = exchange.create_order(symbol, 'market', 'buy', 50)
tp   = exchange.create_order(symbol, 'limit', 'sell', 50, 1.5,  {'takeProfitPrice': 1.6})
sl   = exchange.create_order(symbol, 'limit', 'sell', 50, 0.24, {'stopLossPrice': 0.25})
```

### Trailing orders

Trail an open position by a fixed percent or quote amount; the order price follows the market in one direction only (moves when the position gains, holds when it drops). Can be placed independently after opening a position. Under unification, not on all exchanges. The `price` argument doubles as `trailingTriggerPrice`; `type` distinguishes limit vs market trailing orders.

```python
params = {
    'trailingPercent': 1.0,            # 1.0 == 1% away from market price
    # 'trailingAmount': 100.0,         # quote amount away from market price
    # 'trailingTriggerPrice': 44500.0,
    # 'reduceOnly': True,               # True = close position, False = open new one
}
order = exchange.create_order('BTC/USDT:USDT', 'market', 'sell', 1.0, None, params)
```

### Custom order params

`params` is an associative array merged into the exchange request. All custom params are exchange-specific and not interchangeable.

```python
bitfinex.create_limit_sell_order('BTC/USD', 1, 10, {'type': 'trailing-stop'})  # custom type
kraken.create_market_buy_order('BTC/USD', 1, {'trading_agreement': 'agree'})   # custom flag
hitbtc.create_order('BTC/USD', 'limit', 'buy', 1, 3000, {'clientOrderId': '123'})
```

### User-defined clientOrderId

```python
exchange.create_order(symbol, type, side, amount, price, {'clientOrderId': 'World'})
```

Lets you distinguish your own orders later; only on exchanges that support it. Others throw on it or ignore it, leaving `clientOrderId` as `undefined/None/null`. Documented as a work in progress.

### Hedge mode

If `exchange.features` reports `hedged` support, pass `params['hedged'] = True` to open a hedged position instead of the default one-way mode. On exchanges exposing `.has['setPositionMode']`, `hedged` may not be accepted by `createOrder` — call `setPositionMode()` first, then `createOrder` without the param; it places hedged orders by default.

## Amount semantics

- **Spot / most markets:** `amount` is in units of the **base** currency of the pair; `price` and `cost` are in **quote** currency.
- **Market buys on some exchanges:** the exchange requires the **total cost in quote currency** instead of a base amount. Gated by the exchange option `createMarketBuyOrderRequiresPrice` (default `true`):
  - `true` — pass `price` alongside `amount`; the lib computes `cost = amount * price` and sends that quote amount. Use `createOrder`, **not** `createMarketBuyOrder` (which omits the price and fails when this option is `true`):
    `await exchange.createOrder ('BTC/USD', 'market', 'buy', 2, 9000)  // cost 18000 USD`
  - `false` — compute the cost yourself and pass it as `amount`:
    `exchange.options['createMarketBuyOrderRequiresPrice'] = false`
    `await exchange.createMarketBuyOrder ('BTC/USD', amount * price)`
- **Derivatives / contracts:** the exchange expects a natural number of **contracts**, not a base amount. `Base amount = contracts * contractSize`, so `contracts = Base amount / contractSize`. Symptom of getting this wrong: `"must be greater than minimum amount precision of 1"`.

  ```python
  await exchange.loadMarkets()
  symbol = 'BTC/USDT:USDT'
  market = exchange.market(symbol)
  print(market['contractSize'])
  number_contracts = round((0.5 * 1) / market['contractSize'])  # 0.5 BTC -> contracts
  ```
- **Emulating a market order with a limit order** (where market orders are missing): a `limit sell` at a very low price or a `limit buy` at a very high price is matched by most exchanges as a taker at the best book price. Documented as risky under volatility — verify in the exchange's web UI and test with a minimal, disposable amount first, then check the actual filling price in trade history.

## Querying orders

| Method | Signature | Returns |
|--------|-----------|---------|
| `fetchOrder` | `(id, symbol = undefined, params = {})` | one order (open or closed) by `id`; some exchanges also require `symbol` |
| `fetchOpenOrder` | `(id, symbol = undefined, params = {})` | one open order |
| `fetchClosedOrder` | `(id, symbol = undefined, params = {})` | one closed order |
| `fetchOrders` | `(symbol = undefined, since = undefined, limit = undefined, params = {})` | list, all statuses |
| `fetchOpenOrders` | `(symbol = undefined, since = undefined, limit = undefined, params = {})` | list, open |
| `fetchClosedOrders` | `(symbol = undefined, since = undefined, limit = undefined, params = {})` | list, closed or canceled |
| `fetchCanceledOrders` | `(symbol = undefined, since = undefined, limit = undefined, params = {})` | list, canceled |

Naming tells you single vs list. The list methods take `since` (timestamp filter, ms) and `limit` (count filter); support for both is exchange-specific — many offer pagination/scrolling via `params` instead. Without `since` you get an exchange-specific default window (since listing, last 24h, last 100, …); pass `since` for precise control.

**Design rules:**
- Every exchange usually offers `fetchOpenOrders()` or `fetchOrders()` — one of the two gives the open set.
- Order history requires `fetchClosedOrders()` or `fetchOrders()`; if neither exists, those methods are simply unavailable. **CCXT does not emulate missing order history** — build it in userland from `fetchOpenOrders()` + `fetchMyTrades()`.
- `fetchOrder()` may be emulated where the exchange has no by-id endpoint; it can still be missing.
- Closed order ≠ trade: one closed order may contain many trades. Orders generally carry no `fee`; each trade does, though many exchanges propagate `fee`/`cost` to orders.

## Managing orders

```javascript
editOrder (id, symbol, type, side, amount, price = undefined, params = {})  // -> order structure
cancelOrder (id, symbol = undefined, params = {})                            // -> order structure
cancelOrders (ids, symbol = undefined, params = {})                          // -> array of orders
cancelAllOrders (symbol = undefined, params = {})                            // -> array of orders
cancelAllOrdersAfter (timeout, params = {})                                  // -> object
```

`editOrder` requires `id`, `symbol`, `side`, `type`, `amount`; `price` optional. `cancelOrders` takes an array of `ids`. `symbol` is **required on some exchanges** for all cancel methods. In `cancelAllOrdersAfter`, `timeout` is a countdown in **milliseconds** and is required on some exchanges; `0` cancels the timer. Batch cancel methods return arrays of orders — report to the maintainers if an outdated implementation returns otherwise.

`cancelOrder()` is usually used on open orders only, and can throw `OrderNotFound` when canceling an already-closed or already-canceled order (your cancel request can lose the race to the fill). It can also throw `OperationFailed`, where it is ambiguous whether the cancel succeeded and you must decide whether to retry.

**Order caching:** when the exchange has no history endpoints, keep a dict or DB of orders in userland and update it after every `createOrder()`, `fetchOpenOrders()`, `cancelOrder()`, `cancelAllOrders()` call; mark orders closed locally when they stop appearing in `fetchOpenOrders()`.

## My trades

A trade (a *fill*) is one matched pair of orders. Orders-to-trades is **one-to-many**: an order can be filled by several trades, and a closed order may hold many trades. Closed/fully-filled orders disappear from the orderbook; partially filled orders stay with an `open` status and a `remaining` amount.

```javascript
fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {})
fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {})
// Python: exchange.fetch_my_trades(symbol=None, since=None, limit=None, params={})
//         exchange.fetch_order_trades(order_id, symbol=None, since=None, limit=None, params={})
```
Gate both on `exchange.has['fetchMyTrades']` and `exchange.has['fetchOrderTrades']`.

`fetchMyTrades` returns an ordered array (most recent trade last). `since` must be an **integer timestamp in milliseconds**. Exchange APIs cap the number of returned objects — you cannot get all trades since the beginning of time in one call; traverse in pages ("pages" of objects) in a loop. `symbol` is required by many exchange APIs: loop over symbols (filter relevant ones by non-zero balances and by transaction history); a missing required `symbol` raises `ArgumentsRequired`. Exchanges also limit how far back in time you can go.

### Trade structure

Trades denote the exchange of one currency for another (unlike transactions, which denote a transfer of a given coin).

| Field | Meaning |
|-------|---------|
| `info` | original decoded JSON as is |
| `id` | string trade id |
| `timestamp` / `datetime` | ms Unix timestamp / ISO8601 with ms |
| `symbol` | symbol |
| `order` | string order id or `undefined/None/null` |
| `type` | order type: `'market'`, `'limit'` or `undefined/None/null` |
| `side` | `'buy'` or `'sell'` |
| `takerOrMaker` | `'taker'` or `'maker'` |
| `price` | float price in quote currency |
| `amount` | amount of base currency |
| `cost` | `price * amount`; total **quote** volume, **gross** (pre-fee — the fee is applied afterwards) |
| `fee` / `fees` | `{ cost, currency, rate }`; `fees` is the array form when paid in multiple currencies. Usually base currency for buys, quote for sells; may be missing partially or entirely; may be a third currency |

## Order-placement pitfalls

- **Gate on capabilities.** `exchange.has[...]` for methods (`NotSupported` otherwise), `exchange.features` / `exchange.featureValue(...)` for trigger, SL, TP, trailing and hedged features. `'emulated'` means a client-side workaround, not a native endpoint.
- **Contracts vs base amount.** Derivatives need whole contracts; derive `contracts = Base amount / contractSize` from `exchange.market(symbol)['contractSize']` after `exchange.loadMarkets()`. The `round(...)` in the documented example enforces integrality. `"must be greater than minimum amount precision of 1"` signals a contracts/precision mismatch, not a bad symbol.
- **Market buys.** `createMarketBuyOrderRequiresPrice` (default `true`) changes the meaning of `amount` to a quote cost on some exchanges; use `createOrder` with a `price`, or switch the option to `false` and pass the cost as `amount`.
- **Limit-only exchanges.** Test `exchange.has['createMarketOrder']` before placing market orders.
- **No market-price guarantee.** Slippage and multi-level fills are documented; reconcile against `average` and trade history.
- **Emulated market orders are risky.** Verify in the exchange web UI, then a minimal disposable amount, then the filling price in trade history.
- **Cancel races.** Expect `OrderNotFound` on already-closed/already-canceled orders and `OperationFailed` where success is ambiguous — handle both and decide on retry.
- **`clientOrderId` is not universal.** Exchanges may error or silently null it; confirm support before relying on it for order reconciliation.
- **`hedged` vs `setPositionMode`.** On exchanges exposing `setPositionMode`, account mode must be switched first; passing `hedged` to `createOrder` may not be supported there.
- **Attached SL/TP is not universal.** The separate opposite-side order fallback itself "might not work for some exchanges".
- **Missing order history is not emulated.** Maintain a userland order cache keyed by `id`, updated after each place/fetch/cancel call.
- **`since` discipline.** `since` is ms and exchange-specific; without it the returned window is arbitrary. `fetchMyTrades` needs an integer ms `since` plus pagination for complete history.
- **Work-in-progress areas flagged in the docs:** the orders API overall, `clientOrderId`, `timeInForce` unification (especially `'PO'`), `fee`/`fees` info, `fetchOrder` emulation, and trailing orders.
- **Sandbox / test-order behaviour is not documented** in this part of the manual.

## Source

- https://github.com/ccxt/ccxt/wiki/Manual#orders — Querying Orders, Order Structure, Placing Orders (Limit / Market / Market Buys), Conditional Orders (Trigger, Stop Loss, Take Profit, attached StopLoss+TakeProfit, Trailing), Custom Order Params, Editing Orders, Canceling Orders, My Trades (How Orders Are Related To Trades, Personal Trades, Trades By Order Id)

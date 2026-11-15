# API Conventions

Unified vs implicit API, public/private split, sync/async per language, the trailing `params` override argument, and pagination. Market structures live in `markets-and-symbols.md`.

Naming convention: JS/TS exposes `camelCase` method names; Python and PHP also accept `under_score` notation; both notations work in JS, Python, and PHP. Go exposes `PascalCase` only.

## Unified vs implicit API

- **Unified API** — a subset of methods common across exchanges, returning uniformly structured objects. This is the recommended way to work with ccxt.
- **Implicit API** — one callable method per raw exchange REST endpoint. CCXT defines every endpoint of each exchange in the `.api` property; on exchange instantiation each URL becomes a callable method (pre-generated into the `abstract/` artifacts for all exchanges). Use implicit methods only as a **fallback** when no unified method exists yet; unified methods themselves call implicit methods internally.
- Implicit methods return the exchange-specific JSON **as is, unparsed**; unified methods return decoded JSON in the common format.

### Deriving implicit method names

Name = access-type prefix + HTTP verb + camel-cased endpoint URL path, built from the base API URL and endpoint path:

| Endpoint | Method name |
|----------|-------------|
| private HTTPS PUT `…/order/{id}/cancel` | `privatePutOrderIdCancel()` / `private_put_order_id_cancel()` |
| public HTTPS GET `…/market/ticker/{pair}` | `publicGetTickerPair()` / `public_get_ticker_pair()` |
| GET `https://bitbay.net/API/Public` + `{id}/orderbook` | `publicGetIdOrderbook` |
| `https://yobit.net` + `tapi/CancelOrder` | `tapiCancelOrder` |

Pass parameters as a dictionary whose keys are the exchange's parameter names:

```
exchange.privatePutOrderIdCancel({ id: '41987a2b-...' })   # JS
exchange.publicGetTickerPair({ pair: 'BTC/USD' })          # JS
$luno->public_get_ticker(array('pair' => 'XBTIDR'))        # PHP-style dict arg
```

List all methods (implicit + unified) on an instance:

```
console.log(new ccxt.kraken())      # JavaScript
print(dir(ccxt.kraken()))           # Python
```

Or read the generated abstract file, e.g. `python/ccxt/abstract/coinbase.py`.

## Public vs private

- **Public API** — market data, no authentication required (rate limits apply). Includes: trading pairs/instruments, price feeds, order books (L1/L2/L3), trade history, tickers, OHLCV series. Also called *market data*, *market*, *basic*, *mapi*, *price* depending on the exchange.
- **Private API** — trading and account access; **requires API keys** obtained from the exchange (registration, often KYC). Includes: balances, placing/cancelling orders, deposit addresses and withdrawals, open/closed order history, margin positions, ledger, transfers, merchant services. Also called *trading*, *trade*, *tapi*, *account*.
- A few exchanges add a **merchant API** (*merchant*, *wallet*, *payment*, *ecapi*) for invoices/payments.
- Methods documented as **contract only** / **margin only** are intended for contract/margin markets; they may run on other market types but will most likely return irrelevant information.

## Synchronous vs asynchronous calls

| Language | Model |
|----------|-------|
| JavaScript / TypeScript | All methods asynchronous, returning Promises; use `async`/`await` |
| Python | Sync by default (`import ccxt`); async via `import ccxt.async_support as ccxt` (Python 3.5+, asyncio + aiohttp) — same API, `async`-decorated methods |
| PHP | Sync classes in `\ccxt` (`new \ccxt\binance()`); async classes in `\ccxt\async` (`new \ccxt\async\okx()`), backed by ReactPHP — wrap network calls in `\React\Async\await()` |
| Go | Every networking method synchronous, returns `(value, error)`; always check `error` |
| C# | Every networking method async, returns `Task<T>`; `await` it |
| Java | Each typed method ships both a blocking overload and a `CompletableFuture`-returning `…Async` overload (`fetchTicker` / `fetchTickerAsync`, `watchTicker` / `watchTickerAsync`) |

```python
import asyncio
import ccxt.async_support as ccxt

async def main():
    poloniex = ccxt.poloniex()
    print(await poloniex.fetch_ticker('ETH/BTC'))
    await poloniex.close(True)  # close connection; True also cleans cached instance data

asyncio.run(main())
```

## Unified method signatures (key subset)

Exact documented signatures (`params` always last):

```
loadMarkets([reload])
fetchStatus(params = {})
fetchMarkets()                      fetchCurrencies()
fetchTicker(symbol)
fetchOrderBook(symbol, limit = undefined, params = {})
fetchL2OrderBook(symbol, limit = undefined, params)
fetchTrades(symbol, since, limit, params)
fetchBalance()
createOrder(symbol, type, side, amount, price, params)
createOrders(orders, params)
createLimitBuyOrder(symbol, amount, price, param)
createLimitSellOrder(symbol, amount, price, param)
createMarketBuyOrder(symbol, amount, param)
createMarketSellOrder(symbol, amount, param)
cancelOrder(id, symbol, params)
fetchOrder(id, symbol, params)
fetchOrders(symbol, since, limit, params)
fetchOpenOrders(symbol, since, limit, params)
fetchCanceledOrders(symbol, since, limit, params)
fetchClosedOrders(symbol, since, limit, params)
fetchMyTrades(symbol, since, limit, params)
fetchOpenInterest(symbol, params)
fetchSettlementHistory(symbol, since, limit, params)
fetchLiquidations(symbol, since, limit, params)
fetchMyLiquidations(symbol, since, limit, params)
fetchGreeks(symbol, params)          fetchAllGreeks(symbols, params)
fetchOption(symbol, params)          fetchOptionChain(code, params)
fetchFundingRate(symbol, params)     fetchFundingRates(symbols, params)
fetchFundingRateHistory(symbol, since, limit, params)
fetchConvertQuote(fromCode, toCode, amount, params)
createConvertTrade(id, fromCode, toCode, amount, params)
fetchCrossBorrowRate(code, params)   fetchCrossBorrowRates(params)
fetchIsolatedBorrowRate(symbol, params)  fetchIsolatedBorrowRates(params)
fetchLongShortRatio(symbol, params)
fetchVolatilityHistory(code, params) fetchUnderlyingAssets()
fetchFundingRateInterval(symbol, params) fetchFundingRateIntervals(symbols, params)
```

Guard availability with the capability flags: `if (exchange.has['fetchTrades']) { … }` / `if exchange.has['fetchOrders']:` before calling.

## The trailing `params` argument

Most unified methods accept an optional `params` associative array (dictionary, empty by default) as the **last argument** of the call. It carries exchange-specific extras and **overrides** the params the unified method would otherwise send:

```python
params = {'type': 'margin', 'isIsolated': 'TRUE'}   # override/add unified request params
# params go as the LAST argument to the unified method
binance.create_order('BTC/USDT', 'limit', 'buy', amount, price, params)
```

```javascript
const params = { 'foo': 'bar', 'Hello': 'World!' }  // exchange-specific overrides
const result = await exchange.fetchOrderBook(symbol, length, params)  // last arg
```

- Contents are **exchange-specific**: consult that exchange's API docs for supported fields/values, or open the exchange implementation file and inspect the function (e.g. `createOrder`) to see how it reads `params`.
- Params are **not interchangeable between exchanges** — an exchange will not accept the params of a different exchange.
- In Go, params go into call options, e.g. `exchange.FetchOrderBook(symbol, ccxt.WithFetchOrderBookParams(params))`.

## Pagination

Exchange APIs `limit` output to a recent window — you cannot fetch all history in one call. Without pagination most list methods return an exchange-specific default (from the beginning of history or the most-recent subset). Pagination is typically needed with: `fetchTrades()`, `fetchOHLCV()`, `fetchOrders()`, `fetchCanceledOrders()`, `fetchClosedOrder()`, `fetchClosedOrders()`, `fetchOpenOrder()`, `fetchOpenOrders()`, `fetchMyTrades()`, `fetchTransactions()`, `fetchDeposit()`, `fetchDeposits()`, `fetchWithdrawals()`.

All unified timestamps are integers **in milliseconds**:

```
exchange.parse8601('2018-01-01T00:00:00Z')  # -> 1514764800000
exchange.iso8601(1514764800000)             # -> '2018-01-01T00:00:00Z'
exchange.seconds()      exchange.milliseconds()
```

### Automatic pagination (experimental)

Set `paginate` in `params` and CCXT loops for you. Three strategies, chosen by the implementation (user cannot select): **dynamic/time-based** (`since`/`until`, one request at a time until end of data), **deterministic** (pre-computable page boundaries — OHLCV, funding rates, open interest — requested concurrently), **cursor-based** (next cursor extracted from each response). Some endpoints support neither timestamps nor cursors — nothing to do there.

Params (all inside `params`):

| Key | Type / default | Meaning |
|-----|----------------|---------|
| `paginate` | boolean, `false` | Request multi-page fetching |
| `paginationCalls` | integer, `10` | Max requests per pagination run (mind rate limits) |
| `maxRetries` | integer, `3` | Retries per page on error |
| `paginationDirection` | `backward` (default) or `forward` | Dynamic only; `forward` requires a `since` |
| `maxEntriesPerRequest` | integer | CCXT auto-fills; override to maximize data per call |

```python
trades = await binance.fetch_trades("BTC/USDT", params={"paginate": True})
ohlcv = await binance.fetch_ohlcv("BTC/USDT", params={"paginate": True, "paginationCalls": 5})
trades = await binance.fetch_trades("BTC/USDT", since=1664812416000,
                                    params={"paginate": True, "paginationDirection": "forward"})
ledger = await bybit.fetch_ledger(params={"paginate": True})   # cursor-based (bybit returns a cursor)
```

### Date-based pagination (the unified default)

Supply `since` (ms) and `limit`; advance `since` past the last returned object's `timestamp`; stop on an empty page:

```python
since = exchange.milliseconds() - 86400000        # or exchange.parse8601('2018-01-01T00:00:00Z')
all_orders = []
while since < exchange.milliseconds():
    orders = await exchange.fetch_orders(symbol, since, 20)
    if len(orders):
        since = orders[len(orders) - 1]['timestamp'] + 1
        all_orders += orders
    else:
        break
```

### id-based pagination (not unified)

Some exchanges continue from an object id: pass `from_id` (a string) in `params`, then set it to the last returned object's `id` each iteration, with `limit` bounding the page. Loop until an empty page.

```python
params = {'from_id': from_id}   # exchange-specific, non-unified parameter name
orders = await exchange.fetch_orders(symbol, since, limit, params)
from_id = orders[len(orders) - 1]['id']
```

### Pagenumber / cursor pagination (not unified)

The user supplies a page number or initial cursor in `params` (key name is exchange-specific: `page`, `cursor`, `start`); the exchange returns the page plus the next cursor — in the body or in HTTP response headers. Reading the next cursor is not thread-safe and exchange-specific:

```python
params = {'cursor': cursor}
orders = await exchange.fetch_orders(symbol, since, limit, params)
cursor = exchange.last_response_headers['CB-AFTER']          # e.g. Coinbase
# or: last_json_response = exchange.parseJson(exchange.last_http_response); page = last_json_response['cursor']
```

Example: `examples/py/coinbaseexchange-fetch-my-trades-pagination.py`.

## Source

- https://github.com/ccxt/ccxt/wiki/Manual#implicit-api
- https://github.com/ccxt/ccxt/wiki/Manual#implicit-api-methods
- https://github.com/ccxt/ccxt/wiki/Manual#publicprivate-api
- https://github.com/ccxt/ccxt/wiki/Manual#synchronous-vs-asynchronous-calls
- https://github.com/ccxt/ccxt/wiki/Manual#passing-parameters-to-api-methods
- https://github.com/ccxt/ccxt/wiki/Manual#unified-api
- https://github.com/ccxt/ccxt/wiki/Manual#overriding-unified-api-params
- https://github.com/ccxt/ccxt/wiki/Manual#pagination
- https://github.com/ccxt/ccxt/wiki/Manual#automatic-pagination

# Markets, Currencies, Symbols, Precision

The market/currency structures, the unified symbol grammar, precision-and-limits rules, and market loading/caching. Method naming and `params` live in `api-conventions.md`.

Naming convention: Python uses `snake_case`, JS/TS uses `camelCase`; both notations work in JS, Python, and PHP. Field names below are the returned-object keys.

## Currency structure

Each entry in `exchange.currencies` is a dictionary:

| Field | Meaning |
|-------|---------|
| `id` | Exchange-internal currency id (string or numeric), used in raw requests |
| `code` | Uppercase unified currency code — the ccxt-wide reference |
| `name` | Human-readable name, mixed case, may be absent |
| `active` | Boolean: tradeable and withdrawable (see Active status) |
| `fee` | Withdrawal fee, flat, in the same currency; may be `None`/missing (experimental data) |
| `precision` | Decimal digits "after the dot"; meaning depends on `exchange.precisionMode` |
| `deposit` / `withdraw` | Booleans: deposits/withdrawals available |
| `limits` | `amount`, `withdraw`, `deposit` limit objects, each `{ min, max }` |
| `networks` | Network structures indexed by unified network id (`ERC20`, `TRC20`, `BSC`, …) |
| `info` | Original unparsed exchange payload; contents vary per exchange |

## Network structure

Each entry of `currency['networks']` mirrors the currency structure with one rename: `network` (uppercase unified network string) replaces `code`. Same `id`, `name`, `active`, `fee`, `precision`, `deposit`, `withdraw`, `limits`, `info` members.

## Market structure

Each entry in `exchange.markets` (indexed by symbol) is a dictionary:

| Field | Meaning |
|-------|---------|
| `id` | Exchange-internal market id used in raw HTTP requests; not unified |
| `symbol` | Uppercase unified pair/instrument string, e.g. `BTC/USD` |
| `base` / `quote` | Unified uppercase base/quote currency codes (3+ letters). **Base is always before the slash, quote after** |
| `baseId` / `quoteId` | Exchange-specific, non-unified ids of base/quote currencies |
| `active` | Boolean: trading this market currently possible (see Active status) |
| `type` | `spot`, `future` (expiring futures), `swap` (perpetual), `option` |
| `spot` / `margin` / `future` / `swap` / `option` / `stock` | Booleans flagging each market kind |
| `contract` | Boolean: true for future, swap, or option |
| `settle` / `settleId` | Unified settle currency code / exchange id of the settlement currency; only set when `contract` is true |
| `contractSize` | Size of one contract; only meaningful when `contract` is true |
| `linear` / `inverse` | Contract settled in quote currency / in base currency |
| `expiry` | Unix expiry timestamp **in milliseconds**; only for `type == 'future'`, undefined otherwise |
| `expiryDatetime` | Expiry as ISO-8601 string |
| `strike` | Option exercise price |
| `optionType` | `call` (right to buy) or `put` (right to sell) |
| `taker` / `maker` | Public fee rates as floats (`0.002` = 0.2%); can be negative (rebate). Account-specific fees need `fetchTradingFees` |
| `percentage` | Boolean: taker/maker are multipliers vs fixed flat amounts |
| `tierBased` | Boolean: fee depends on trading tier/volume |
| `feeSide` | One of `get`, `give`, `base`, `quote`, `other` |
| `precision` | `{ price, amount, cost }` — accepted precision for order values; may be missing per key; semantics depend on `exchange.precisionMode` |
| `limits` | `{ amount, price, cost, leverage }`, each `{ min, max }`; cost = price × amount; may be missing |
| `marginModes` | `{ cross, isolated }` booleans: margin-trading support for the pair |
| `info` | Original unparsed exchange payload |

Some exchanges mislabel base/quote; ccxt corrects (swaps) them when parsing so `base`/`quote` stay consistent with `symbol`. Compare parsed `base`/`quote` against `info` to spot such exchanges.

## Active status

- Used on currencies and markets; exchanges attach slightly different meanings.
- An inactive currency usually makes related tickers/orderbooks return empty, zero, or stale data — check `active` and reload markets periodically.
- `false` does **not** guarantee all features (trade/withdraw/deposit) are disabled; `true` does not guarantee they are enabled. Not implemented by all exchanges; may be missing.

## Symbols and market ids

- Currency code: 3–5 uppercase letters typically (`BTC`, `USD`, `DOGE`, …); exotic exchanges have longer codes.
- Symbol: uppercase `BASE/QUOTE` for spot. **Do not parse the symbol string** — symbols are not required to contain a slash (`'XBTM18'`, `'.XRPUSDM20180101'` exist). Rely on market properties instead.
- Market ids (`btcusd`, `XBTUSD`, `tBTCUSD`, numeric ids, …) are exchange-local, unique per exchange, not cross-exchange. Use symbols; ccxt maps ids internally.
- Markets are indexed by symbol in `.markets` and by id in `.markets_by_id` (a list — take `[0]`). Accessing a non-existent key raises a userland exception.

Access helpers (on the exchange instance, after markets are loaded):

```
exchange.markets['BTC/USD']        # market structure by symbol
exchange.market('BTC/USD')         # same, via method
exchange.marketId('BTC/USD')       # market id by symbol
exchange.symbols                   # array of all symbols (= keys of .markets)
exchange.currencies                # dictionary of currencies
exchange.markets_by_id['XRPBTC'][0]  # market by id
```

### Contract symbol grammar

Spot and derivatives must not collide in `.markets`; linear vs inverse contracts must also be distinct. Forms given by the manual:

| Market type | Form | Example |
|-------------|------|---------|
| spot | `BASE/QUOTE` | `BTC/USDT` |
| swap (perpetual) | `BASE/QUOTE:SETTLE` | `BTC/USDT:USDT` (linear), `BTC/USDT:BTC` (inverse) |
| future (expiring) | `BASE/QUOTE:SETTLE-IDENTIFIER` (usually `YYMMDD` expiry date) | `BTC/USDT:USDT-211225` |
| option | `BASE/QUOTE:SETTLE-STRIKE-TYPE` (type `C`/`P`) | `BTC/USDT:USDT-210625-5000-C`, `ETH/USDT:ETH-210625-5000-P` |

Margin markets are flagged by `market['margin'] == true`; this doc range shows no separate margin symbol form (see the manual's margin sections).

### Naming consistency

CCXT normalizes legacy/ambiguous codes (per exchange, via `exchange.commonCurrencies`, a map of exchange-actual name → ccxt name, e.g. `'XBT': 'BTC'`):

- `XBT → BTC`, `BCC → BCH`, `DRK → DASH`, `DSH → DASH` (but `DSH/BTC` ≠ `DASH/BTC` where both exist), `BCHABC → BCH`, `BCHSV → BSV`, `XRB → NANO`, and `USD → USDT` where the traded asset is actually USDT (some exchanges have both — Kraken has `USDT/USD`).
- Code conflicts (same code, different coins) are resolved by market cap on CoinMarketCap; losers get their full name as code, producing mixed-case/space symbols like `Hydro Protocol/USD`.
- **Override `commonCurrencies` before `loadMarkets()` happens** (constructor params or property assignment).
- Symbols can change, rarely, usually around forks/conflicts; don't hard-depend on a mapping forever.

### Unified network codes

Common `network` values: `BTC`, `ETH`/`ERC20`, `XRP`, `LTC`, `DOGE`, `XLM`, `TRX`/`TRC20`, `ETC`, `ZEC`, `BEP20` (BSC), `XMR`, `ADA`, `XTZ`, `ATOM`, `SOL`, `BEP2`, `DOT`, `ALGO`, `AVAX`, `LINK`, `BCH`, `FIL`, `KSM`, `EGLD`, `RUNE`, `ICP`, `NEAR`, `CELO`, `HBAR`, `MIOTA`, `KLAY`, `VET`, `THETA`, `STX`, `LIGHTNING`, `OPTIMISM`, `ARBITRUM`, `zkSync`, `MATIC`, `FTM`.

## Precision and limits

**Limits ≠ precision.** `precision['amount'] == 0.0001` does not imply `limits['amount']['min'] == 0.0001`, and vice versa. Order values must satisfy all of:

- `amount` within `limits['amount']['min'] … ['max']`
- `price` within `limits['price']['min'] … ['max']`
- `cost = amount * price` within `limits['cost']['min'] … ['max']`
- precision of `amount` ≤ `precision['amount']`, of `price` ≤ `precision['price']`

Any of these can be missing on exchanges that don't provide them.

Negative precision (e.g. `-1`) only occurs under `SIGNIFICANT_DIGITS`-style modes: `-1` means the amount must be an integer multiple of 10, `-2` a multiple of 100, etc.

### Precision modes (`exchange.precisionMode`)

| Mode | Meaning |
|------|---------|
| `TICK_SIZE` | Used by almost all exchanges. `precision` values are minimal precision fractions (floats) for rounding/truncating, e.g. `0.00000001` |
| `SIGNIFICANT_DIGITS` | Counts non-zero digits only (`bitfinex` and a few others); `precision` designates the place of the last significant digit |
| `DECIMAL_PLACES` | **Deprecated — CCXT no longer uses this mode anywhere.** Counts digits after the dot |

### Formatting helpers

CCXT formats values automatically on order placement and withdrawals. For userland formatting (load markets first — `load_markets()` is required before any of these):

```
exchange.amountToPrecision(symbol, amount)   # Python: amount_to_precision
exchange.priceToPrecision(symbol, price)
exchange.costToPrecision(symbol, cost)
exchange.currencyToPrecision(code, amount)
```

Low-level: `decimalToPrecision(x, roundingMode, numPrecisionDigits, countingMode = DECIMAL_PLACES, paddingMode = NO_PADDING)` (Python: `decimal_to_precision(n, rounding_mode=ROUND, precision=None, counting_mode=DECIMAL_PLACES, padding_mode=NO_PADDING)`).

- Rounding modes: `ROUND` (round last digits to precision), `TRUNCATE` (cut beyond precision).
- Padding modes: `NO_PADDING` (default), `PAD_WITH_ZERO` (append zeros up to precision).

**Python WARNING: `decimal_to_precision` is susceptible to `getcontext().prec`** — the active `decimal` module context precision affects its output.

Behaviour examples (after `load_markets()`; `market = exchange.market(symbol)`):

```
# TICK_SIZE, market['precision']['amount'] == 0.00000001
amountToPrecision(symbol, 0.123456789)               == 0.12345678
amountToPrecision(symbol, 0.0000000000123456789)     == 0.0
# SIGNIFICANT_DIGITS, precision 8
amountToPrecision(symbol, 0.0000000000123456789)     == 0.000000000012345678
```

## Loading markets, caching, sharing

- Call `loadMarkets()` / `load_markets()` before other API calls; if you forget, ccxt auto-loads on the first unified call (two sequential HTTP requests: markets, then currencies/other), making that first call slower.
- Returns an associative array of markets indexed by symbol; also fetches currencies into `.currencies` on exchanges with that endpoint. Call `loadMarkets()` — not `fetchMarkets()`/`fetchCurrencies()` directly (not recommended for end users).
- The method is dirty and cached: it saves markets on the instance; subsequent calls return the cached array with no HTTP request.
- **Force reload:** `loadMarkets(true)` / `load_markets(True)` (the `reload` argument) re-fetches from the exchange. Recommended when an inactive currency starts returning empty data.

### Sharing markets between instances

`exchange2.setMarketsFromExchange(exchange1)` (Python `set_markets_from_exchange`) copies market references from a loaded instance of the **same exchange type**, so `exchange2.symbols` works immediately and its `loadMarkets()` makes no API call. Preferred over direct `exchange2.markets = exchange1.markets; exchange2.symbols = exchange1.symbols` because it validates the exchange type and copies all related data. Both create shared references, not copies — objects live as long as any reference exists.

## Source

- https://github.com/ccxt/ccxt/wiki/Manual#markets
- https://github.com/ccxt/ccxt/wiki/Manual#currency-structure
- https://github.com/ccxt/ccxt/wiki/Manual#network-structure
- https://github.com/ccxt/ccxt/wiki/Manual#market-structure
- https://github.com/ccxt/ccxt/wiki/Manual#active-status
- https://github.com/ccxt/ccxt/wiki/Manual#precision-and-limits
- https://github.com/ccxt/ccxt/wiki/Manual#loading-markets
- https://github.com/ccxt/ccxt/wiki/Manual#symbols-and-market-ids
- https://github.com/ccxt/ccxt/wiki/Manual#market-cache-force-reload

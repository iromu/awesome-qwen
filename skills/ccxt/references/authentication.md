# CCXT Authentication, Accounts & Balance

Private (authenticated) API surface: credentials, the nonce mechanism, accounts and balance.
Method names are JS/TS (`camelCase`); Python uses `snake_case` (`fetchBalance` → `fetch_balance`).
JS/TS private calls are `async`; Python ships separate sync and async packages.

## What the private API covers

- Balance: `fetchBalance()`. Orders: `createOrder()`, `cancelOrder()`.
- Order history: `fetchOrder`, `fetchOrders()`, `fetchOpenOrder()`, `fetchOpenOrders()`, `fetchCanceledOrders`, `fetchClosedOrder`, `fetchClosedOrders`. Executed trades: `fetchMyTrades`.
- Derivatives positions: `fetchPositions()`, `fetchPosition()`.
- On-chain funding history: `fetchTransactions()`, or `fetchDeposit()` / `fetchDeposits()` / `fetchWithdrawal()` / `fetchWithdrawals()`.
- All balance-affecting movements: `fetchLedger`.

API keys are exchange-specific and cannot be interchanged under any circumstances.

## Credentials

| Field | Meaning |
|---|---|
| `apiKey` | Public key/token. Non-secret; sent in header or body over HTTPS in open text to identify the request. Hex/Base64 string or UUID. |
| `secret` | Private key. Never sent over the wire; used locally with the nonce to build the signature. |
| `uid` | User id. Set only where the exchange explicitly requires it. String or numeric literal. |
| `password` | Trading password/phrase. Set only where the exchange explicitly requires it. |

`login` is not documented in the covered Manual sections — check the exchange's own class before using it.

### Security cautions (documented)

- Keep `apiKey`/`secret` from unauthorized use; a leaked `secret` can cost a fund loss. Config file permissions owner-readable only.
- Do **not** share the same API keypair across multiple exchange instances running simultaneously (separate scripts or threads) — causes unexpected behaviour.
- **Do not reuse API keys with different software** — the other software advances the nonce too high. `InvalidNonce` errors → generate a fresh keypair first and foremost.
- Write credentials in **single quotes**, not double quotes (`'VERY_GOOD'`, `"VERY_BAD"`), to avoid character escaping.

### Setting credentials

Assign to an existing instance at any time, or pass to the constructor. Private requests fail with an exception if credentials are unset.

```js
const ex = new ccxt.kraken()
ex.apiKey = '…'; ex.secret = '…'                                     // any time
const ex2 = new ccxt.binance({ 'apiKey': '…', 'secret': '…' })        // upon instantiation
```
```python
ex = getattr(ccxt, 'binance')({'apiKey': '…', 'secret': '…'})         # from a variable id
```

### Validating credentials

```
exchange.checkRequiredCredentials()   # Python: exchange.check_required_credentials()
exchange.requiredCredentials          # which credentials this exchange requires
```
Throws / raises `AuthenticationError` if a required credential is missing or empty.

### "Invalid API-key, IP, or permissions for action" / "API-key format invalid"

Documented as usually **not** a ccxt problem. Verify: (1) no typos, spaces or quotes in the keys; (2) your current IPv4/IPv6 is in the key's IP whitelist, including any proxy's IP; (3) the permission options on the key are correct; (4) you are not mixing testnet keys with testnet mode; (5) already-reported issues.

## Sign In

Some exchanges require signing in before private calls.

```
signIn (params = {})    # params endpoint-specific, e.g. {"2fa": "329293"}; returns the exchange response
```

## The nonce

Per private request (handled for you; perform manually only when implementing a new exchange class):

1. Generate a nonce — an integer, unique per request and strictly increasing. **The default nonce is a 32-bit Unix Timestamp in seconds**, defined by the underlying exchange class.
2. Append public `apiKey` and nonce to the endpoint params, serialize the whole thing.
3. Sign with HMAC-SHA256/384/512 or MD5 using `secret`.
4. Append the signature (Hex or Base64) and the nonce to HTTP headers or body.

Signature encoding and header/body param names vary per exchange; the pattern is constant.

### Overriding the nonce

Use a millisecond nonce to make private requests more frequently than once per second; read the exchange's rate limits first — most throttle. To reset a drifted nonce, prefer creating a fresh keypair. If that is impossible, override `nonce`. Base-market-class helpers: `seconds ()` (Unix seconds), `milliseconds ()` (ms), `microseconds ()` (µs) — some exchanges confuse ms with µs in their own API docs.

**JS/TS — four documented recipes:**

```js
let nonce = 1
const k1 = new ccxt.kraken({ nonce: () => nonce++ })                     // 1: custom in constructor
const k2 = new ccxt.kraken(); k2.nonce = function () { return nonce++ }  // 2: set explicitly
const k3 = new ccxt.kraken({ nonce: function () { return this.milliseconds() } })  // 3: ms
const k4 = new ccxt.kraken({ nonce () { return this.milliseconds() } })  // 4: newer ES syntax
```

**Python — five documented recipes** (subclass, or pass a callable):

```python
ex = ccxt.coinbaseexchange({'nonce': ccxt.Exchange.milliseconds})   # 1: the shortest
class MyKraken(ccxt.kraken):                                        # 2: custom nonce
    n = 1
    def nonce(self): return self.n += 1
class MyBitfinex(ccxt.bitfinex):                                    # 3: milliseconds nonce
    def nonce(self): return self.milliseconds()
ex = ccxt.hitbtc({'nonce': lambda: int(time.time() * 1000)})         # 4: ms nonce inline
ex = ccxt.acx({'nonce': lambda: ccxt.Exchange.milliseconds()})       # 5: ms nonce
```

Multiple instances on one keypair: share a closure or a common function for `nonce` to avoid conflicts.

## Accounts

```
fetchAccounts (params = {})    # returns an array of account structures
```

| Field | Notes |
|---|---|
| `id` | Exchange account id (string) |
| `type` | One of the unified account types, or `subaccount` |
| `name` | Account name (e.g. `"main"`, `"customAccount"`, `"spotAccount32"`) |
| `code` | Unified currency code (e.g. `"USDT"`, `"BTC"`) |
| `info` | Raw exchange payload |

## Account Balance

```
fetchBalance (params = {})    # params: extra endpoint params, e.g. {"currency": "usdt"}
```

### Balance Structure

Two indexings of the same data — by availability of funds first, then by currency:

| Key | Meaning |
|---|---|
| `info` | The original untouched non-parsed reply |
| `timestamp` | Unix ms (seconds × 1000); may be undefined |
| `datetime` | ISO8601 with milliseconds; may be undefined |
| `free` | Map currency → float available for trading |
| `used` | Map currency → float on hold, locked, frozen or pending |
| `total` | Map currency → float (`free + used`) |
| `debt` | Map currency → float owed; margin-capable exchanges reporting loans |
| `<CURRENCY>` | Uppercase code → nested `{ free, used, total }` floats |

Guard every access. Many exchanges do not return balances for empty or unused accounts, so currencies can be missing; `timestamp`/`datetime` are frequently `undefined` (many balance endpoints are not timestamped); `debt` only appears on margin-capable exchanges; top-level keys can be absent or `undefined`.

## Capability flags

Gate optional methods on `exchange.has['<methodName>']` before calling (e.g. `exchange.has['fetchDeposits']`); the key is the JS/TS camelCase name in every language.

## Source

https://github.com/ccxt/ccxt/wiki/Manual#private-api ·
https://github.com/ccxt/ccxt/wiki/Manual#authentication ·
https://github.com/ccxt/ccxt/wiki/Manual#api-keys-setup ·
https://github.com/ccxt/ccxt/wiki/Manual#sign-in ·
https://github.com/ccxt/ccxt/wiki/Manual#overriding-the-nonce ·
https://github.com/ccxt/ccxt/wiki/Manual#accounts ·
https://github.com/ccxt/ccxt/wiki/Manual#account-balance

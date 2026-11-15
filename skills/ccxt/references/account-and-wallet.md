# CCXT Ledger, Funding, Transfers & Fees

Wallet-side unified API: ledger entries, deposits/withdrawals, deposit addresses, internal transfers, fees.
Signatures are JS/TS (`camelCase`); Python uses `snake_case` (`fetchDeposits` → `fetch_deposits`).
`since` is always a millisecond Unix timestamp; `amount` is in base/currency units; `params` is always
the last argument and carries exchange-specific extras.

Gate each call on `exchange.has['<methodName>']` — funding/fee methods are frequently unsupported.

## Ledger

History of every operation that altered the balance: funding, trade/order flows, trading fees, transfers, rebates, cashbacks, bonuses, staking profits.

```
fetchLedgerEntry (id, code = undefined, params = {})
fetchLedger (code = undefined, since = undefined, limit = undefined, params = {})
```

- `fetchLedgerEntry`: **id** (String) *required*; **code** unified currency code, required (e.g. `"USDT"`).
- `fetchLedger`: **code** required if fetching all assets at once is unsupported; **since** ms; **limit** count; **params** e.g. `{"type": "deposit"}`.

### Ledger Entry Structure

| Field | Meaning |
|---|---|
| `id` | Ledger entry id (e.g. an order id) |
| `direction` | `'in'` or `'out'` |
| `account` | Id of the account being altered, if any |
| `referenceId` | Id of the trade/transaction/event that registered this entry |
| `referenceAccount` | Opposite account id (for internal transfers), per `direction` |
| `type` | Reference type — see below |
| `currency` | Unified currency code |
| `amount` | Absolute float; **does not include the fee** |
| `timestamp` / `datetime` | ms since epoch UTC / ISO8601 |
| `before` / `after` | Currency balance before / after |
| `status` | `'ok'`, `'pending'`, `'canceled'` — `'ok'` in most cases |
| `fee` | Object or `undefined`: `{ cost, currency }` (`cost` on top of the amount) |
| `info` | Raw entry |

Documented `type` values: `trade`, `transaction`, `fee`, `rebate`, `cashback`, `referral`, `transfer`, `airdrop`, `whatever` (open-ended list).

## Deposits

Crypto deposit flow: get an address with `fetchDepositAddress`, then fund it externally. (The docs' sentence telling you to "call the `withdraw` method with the specified currency and address" for deposits is a docs slip — `withdraw` moves funds *out*.)

Fiat deposits use the deposit-id methods (documented as **coinbase only**):

```
deposit (id, code = undefined, params = {})              # code = fiat code, e.g. "USD"
fetchDepositMethodId (id, params = {})
fetchDepositMethodIds (params = {})
```

Deposit id structure: `info`, `id`, `currency` (fiat), `verified` (bool — funding through this id is verified), `tag` (tag/memo/name of funding source).

Deposit history:

```
fetchDeposit (id, code = undefined, params = {})         # id *required*; code e.g. "USDT"
fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {})
```
All return transaction structure(s).

## Withdrawals

```
withdraw (code, amount, address, params = {})
```

| Param | Notes |
|---|---|
| `code` | *required* unified currency code |
| `amount` | *required* float amount of currency |
| `address` | *required* recipient address |
| `params` | e.g. `{"network": "TRX", "tag": "52055"}`; `tag` required for currencies listed in `options['withdrawTagRequiredCurrencies']` |

Returns a transaction structure. Some exchanges require manual 2FA approval per withdrawal (email link, Google Authenticator/Authy code); the returned withdrawal `id` is used to check status later and, where supported, to submit 2FA codes.

```
fetchWithdrawal (id, code = undefined, params = {})          # id *required*
fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {})
fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {})
```

`fetchTransactions` is the combined alternative — use whichever the exchange supports: deposits+withdrawals together via `fetchTransactions`, or separately via the deposit/withdrawal methods.

### Transaction Structure

Deposits, withdrawals and internal transfers all share it. A transaction is a transfer of one coin (unlike a trade, which exchanges two currencies).

| Field | Meaning |
|---|---|
| `info` | Raw JSON reply |
| `id` | Exchange-specific transaction id |
| `txid` | On-chain transaction id |
| `timestamp` / `datetime` | ms / ISO8601 |
| `addressFrom` / `address` / `addressTo` | Sender / "from or to" / receiver; `addressFrom`/`addressTo` may be undefined |
| `tagFrom` / `tag` / `tagTo` | tag/memo/payment_id for sender / `address` / receiver |
| `type` | `'deposit'`, `'withdrawal'`, or `'transfer'` |
| `amount` | Float; **excludes the fee** |
| `currency` | Unified currency code |
| `status` | `'ok'`, `'pending'`, `'failed'`, `'canceled'` |
| `updated` | ms of most recent **status** change (e.g. `max(created_at, confirmed_at)`); may be undefined |
| `comment` | User-defined note; may be undefined |
| `fee` | `{ currency, cost, rate }` or missing entirely; `rate ≈ cost / amount` |

Documented semantics: `address` is exchange-specific (sender or receiver). `type` is `'transfer'` only where an endpoint mixes internal transfers with blockchain transactions (e.g. `ccxt.coinlist`).

## Deposit Addresses

Check `exchange.has['fetchDepositAddress']` and `exchange.has['createDepositAddress']` to learn whether addresses pre-exist or are created on request.

```
fetchDepositAddress (code, params = {})
createDepositAddress (code, params = {})
fetchDepositAddresses (codes = undefined, params = {})          # codes = array, e.g. ["USDT","BTC"]
fetchDepositAddressesByNetwork (code, params = {})              # dict indexed by network: { 'ERC20': {...}, 'TRC20': {...} }
```

### Address Structure

| Field | Meaning |
|---|---|
| `info` | Raw reply |
| `currency` | Currency code |
| `network` | Deposit/withdraw network (`ERC20`, `TRC20`, `BSC20`, …) — may be undefined or missing; still being unified |
| `address` | Blockchain address for that currency + network |
| `tag` | tag / memo / paymentId, or undefined |

Currencies that typically require a `tag`: AEON, BTS, GXS, NXT, SBD, STEEM, STR, XEM, XLM, XMR, XRP.

## Transfers

Internal transfers between accounts of the same user on one exchange (subaccounts, or accounts of different types).

```
transfer (code, amount, fromAccount, toAccount, params = {})
    # params.symbol (String) — market symbol when transferring to/from a margin account, e.g. 'BTC/USDT'
transferIn (code, amount, params = {})     # into the futures account (split spot/futures classes)
transferOut (code, amount, params = {})    # out of the futures account
fetchTransfers (code = undefined, since = undefined, limit = undefined, params = {})
fetchTransfer (id, since = undefined, limit = undefined, params = {})
```

`fromAccount`/`toAccount` accept an exchange account id or a unified value: `funding`, `main`, `spot`, `margin`, `future`, `swap`, `lending`. Enumerate them from `exchange.options['accountsByType']` keys (`main` exists only where subaccounts are supported). Some exchanges allow transfers to email addresses, phone numbers, or other users by user id.

### Transfer Structure

`info`, `id`, `timestamp`, `datetime`, `currency`, `amount`, `fromAccount` (e.g. `"spot"`), `toAccount` (e.g. `"future"`), `status` (e.g. `"ok"`).

## Fees

Two categories: **trading fees** (percentage of filled volume) and **transaction fees** (payable on deposit/withdraw, incl. on-chain tx fees). Fees can be account-specific because they often depend on traded volume.

> **Do not use the `.fees` property of the exchange instance** — it is usually predefined/hardcoded. Read actual fees from markets and currencies. The whole fee area is documented as under development, experimental and possibly partial.

`fetchTransactionFee(s)` are **DEPRECATED**, replaced by `fetchDepositWithdrawFee(s)`.

| Purpose | Methods |
|---|---|
| Trading fees | `fetchTradingFee (symbol, params = {})`, `fetchTradingFees (params = {})` |
| Deposit/withdraw fees | `fetchDepositWithdrawFees (codes = undefined, params = {})`, `fetchDepositWithdrawFee (code, params = {})` |
| Deprecated tx fees | `fetchTransactionFee (code, params = {})`, `fetchTransactionFees (codes = undefined, params = {})` — supports `params.network`, e.g. `{"network": "TRC20"}` |

### Fee structures

- **Fee** (embedded in orders, private trades, transactions, ledger entries): `{ currency, rate, cost }` — `rate` as a fraction (0.05% = 0.0005), `cost = amount × rate`.
- **Trading fee** (`fetchTradingFee` / `fetchTradingFees`, indexed by market): `{ symbol, maker, taker, info }`.
- **Fee schedule / transaction fee schedule**: `{ withdraw: { BTC: 0.00001, … }, deposit: { BTC: 0 }, info }`.
- **Deposit/withdraw fees** (indexed by currency): `{ <code>: { withdraw: { fee, percentage }, deposit: { fee, percentage }, networks: { <network>: { deposit, withdraw } }, info } }`.

### Precalculating and reading market fees

```
calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {})
calculateFeeWithRate (symbol, type, side, amount, price, takerOrMaker = 'taker', customRate, params = {})
```
`calculateFeeWithRate` is for a custom tier (VIP-X) rather than the default user fee. Both are **experimental/unstable** — taker-vs-maker is unknowable in advance; never rely on precalculated values. `fetchTradingFees` is the recommended source; fallback is `exchange.markets['ETH/BTC']['taker']` / `['maker']`.

Market fee fields: `taker`, `maker` (rates as fractions), `percentage` (multiplier vs flat amount — check it), `tierBased`, `tiers.taker` / `tiers.maker` = tuples `[volumeInUSD, fee]` ordered by increasing volume. Fees can be **negative** on derivative exchanges = a rebate paid to the user. Maker (providing liquidity) is usually cheaper than taker (taking liquidity).

Transaction fees: `exchange.currencies['ETH']['fee']` — not unified yet, subject to change.

## Pitfalls: network/chain and currency-code selection

- `network` and `tag` go **inside `params`**, not as positional args: `withdraw(code, amount, address, { tag, network: 'ETH' })`.
- `network` aliases are accepted for multi-chain withdrawals: `ETH`→`ERC20`, `TRX`→`TRC20`, `BSC`→`BEP20`, `BNB`→`BEP2`, `HT`→`HECO`, `OMNI`→`OMNI`. `BSC` and `BEP20` are equivalent — same effect. Omitting `network` lets the exchange choose the chain, which is the classic wrong-chain withdrawal. Prefer `fetchDepositAddressesByNetwork` to confirm the address actually exists for the chain you intend.
- `network` on an address structure may be `undefined` or absent — never assume a default chain.
- `code` is a **unified currency code**, not a trading pair and not a chain-qualified symbol. The same `code` (`USDT`) maps to many chains; disambiguate only via `network`.
- `tag` is **not** a free-text field — you cannot send messages in it. It exists to address the wallet correctly (XRP, XMR, …) and must be the exact value the exchange gave you, or the funds may never arrive.
- Amounts in transaction/ledger structures exclude the fee; compare `fee.cost` separately.

## Source

- https://github.com/ccxt/ccxt/wiki/Manual#ledger
- https://github.com/ccxt/ccxt/wiki/Manual#deposit
- https://github.com/ccxt/ccxt/wiki/Manual#withdrawal
- https://github.com/ccxt/ccxt/wiki/Manual#deposit-and-withdrawal-networks
- https://github.com/ccxt/ccxt/wiki/Manual#transaction-structure
- https://github.com/ccxt/ccxt/wiki/Manual#deposit-addresses
- https://github.com/ccxt/ccxt/wiki/Manual#transfers
- https://github.com/ccxt/ccxt/wiki/Manual#fees

# ccxt CLI, MCP Server, Official Skills, Examples Corpus

Terminal and agent-facing entry points into the same unified API: the `ccxt` CLI, the official MCP server, the official ccxt agent skills, and where the runnable examples live.

## ccxt CLI

A program that takes an exchange id plus params from the command line, executes the corresponding ccxt call, and prints the result — no code required. The same design is implemented in TS, JS, Python and PHP as near-identical examples written to be "easily understandable". Use it for bash API scripting, cron trading automation, debugging exchange errors, quick CLI trades, backtest data aggregation, learning the API, and writing new integrations.

> **Warning:** the CLI executes your command without asking for confirmation — confusing amounts with prices can cause a loss of funds.

### Install & invoke

```shell
npm -g ccxt                    # global install; update with `npm update ccxt -g`
```

From a clone:

```shell
git clone https://github.com/ccxt/ccxt && cd ccxt
npm install                    # Node.js + npm   (or: composer install  for PHP)
node examples/js/cli okx fetchTicker ETH/USDT
python3 examples/py/cli.py okx fetch_ticker ETH/USDT
php  -f examples/php/cli.php okx fetch_ticker ETH/USDT
```

CLI sources: `examples/ts/cli.ts`, `examples/js/cli.js`, `examples/py/cli.py`, `examples/php/cli.php`.

### Command syntax

`<cli> <exchange-id> [method-or-property] [args...] [json-params] [flags]`

- At least one argument: the **exchange id**. With no exchange id, the script prints the list of all exchange ids.
- On launch the CLI creates and initializes the exchange instance and calls `exchange.loadMarkets()`.
- Exchange id only → dumps the whole exchange object (properties, methods, markets, currencies). **The output is HUGE** — name a property to narrow it.

```shell
node examples/js/cli okx markets           # loaded markets
node examples/js/cli binance currencies    # loaded currencies
node examples/js/cli gate options          # exchange-specific options
node examples/js/exchange-capabilities | less -S -R   # which methods each exchange supports
```

**Unified method by name** — positional args follow the method in the unified signature's order:

```shell
node examples/js/cli okx fetchOrderBook BTC/USDT
node examples/js/cli bitget fetchTickers
node examples/js/cli bitget fetchTickers --table
node examples/js/cli bitget fetchTickers '["BTC/USDT","ETH/USDT"]'
```

**Exchange-specific parameters** go in the **last** argument as a JSON object; implicit (raw) endpoints are called by their generated method name with a JSON argument:

```shell
node examples/js/cli bybit setMarginMode isolated BTC/USDT '{"leverage":"8"}'
node examples/js/cli okx publicGetMarketBooks '{"instId":"BTC-USDT","sz":"3"}' --sandbox
```

**Prediction markets** — `-p` / `--prediction` selects the prediction namespace (see prediction-markets.md).

### Credentials

Public API methods need no authentication. For private calls the CLI looks for API keys in **`keys.local.json`** in the root of the cloned repository (working directory) and also looks up exchange credentials in **environment variables** — see CONTRIBUTING.md → "Adding Exchange Credentials".

### Documented flags

| Flag | Effect |
|---|---|
| `--table` | Print the result as a table |
| `--raw` | Raw output for piping (e.g. into `jq`) |
| `--sandbox` | Sandbox/testnet mode |
| `-p`, `--prediction` | Force the prediction namespace |

Piping with `jq` (`sudo apt-get install jq` / `brew install jq` / `choco install jq -y`):

```shell
ccxt binance fetchTicker BTC/USDT | jq '.price'
ccxt binance watchTrades BTC/USDT --raw | jq -c '[.[] | {price: .price, amount: .amount}]'
ccxt binance fetchTrades --raw | jq -c '.[]' | fzf
```

## MCP server and official AI-assistant skills

### ccxt MCP server (`ccxt-mcp`)

Official Model Context Protocol server so MCP hosts (Claude Desktop, Claude Code, Cursor, VS Code, Windsurf) can read market data and balances and — only when explicitly enabled — trade across 100+ exchanges and prediction markets via the unified API. Runs **locally over stdio**; keys stay on your machine and never reach the model, which references accounts **by name** (e.g. `binance-main`). npm package `ccxt-mcp`; source `github.com/ccxt/ccxt/tree/master/mcp`. Requires Node.js ≥ 18; runs via `npx -y ccxt-mcp`, no global install.

```bash
claude mcp add ccxt -- npx -y ccxt-mcp
```

Host config snippets all use `{"mcpServers": {"ccxt": {"command": "npx", "args": ["-y", "ccxt-mcp"]}}}`: Claude Code per-project `.mcp.json` (safe to commit — no secrets) · Claude Desktop `claude_desktop_config.json` (restart after editing) · Cursor `~/.cursor/mcp.json` or `.cursor/mcp.json` · VS Code `.vscode/mcp.json` under `servers`, keys via `inputs` + `${input:...}` (encrypted secret storage — best of the JSON hosts) · Windsurf `~/.codeium/windsurf/mcp_config.json` (`${env:VAR}` supported). Claude Desktop also offers a one-click `ccxt-mcp.mcpb` bundle from the `ccxt-mcp-latest` release: its form takes up to **three** exchanges' keys (stored in the OS keychain) plus global **Sandbox**, **Demo trading** and "allow orders" toggles; a fourth exchange, a wallet venue, or live trading/withdrawals need a `config.json`.

**Security model:** credentials are never tool parameters — no tool schema accepts a key, so neither the model nor a prompt-injected page can supply or change them. Every result, error and log line passes a redaction filter holding loaded secrets. Capability tiers are opt-in and **file-owned**: no tool edits config, so a conversation can never grant itself permissions. Tools are *listed* by default (an unconfigured call returns a clear "add an account" error) but execution is gated at the account. Order-placing tools are previewed and confirmed, validated against market limits and notional caps, and journaled to an append-only audit log (`<cache-dir>/ccxt-mcp/journal/`). Recommended backstops: API keys with withdrawal disabled + IP allowlist.

### Config file

Path reported by the `get_safety_status` tool: macOS `~/Library/Application Support/ccxt-mcp/config.json` · Linux `~/.config/ccxt-mcp/config.json` · Windows `%APPDATA%\ccxt-mcp\config.json` · or `CCXT_MCP_CONFIG=<path>` (a legacy per-exchange `keys.local.json` shape also loads). With no config the server still serves **public market data on every exchange**. `chmod 600` the file — the server warns otherwise, or refuses with `"settings": { "strictPermissions": true }`.

```jsonc
{
  "accounts": {
    "binance-testnet": { "exchange": "binance", "apiKey": "…", "secret": "…", "sandbox": true, "trading": true },
    "binance-main": { "exchange": "binance", "apiKey": "…", "secret": "…", "trading": "live",
                      "maxOrderValue": 250, "maxDailyValue": 1000,
                      "allowedSymbols": ["BTC/USDT", "ETH/*"], "confirm": "live" },
    "okx-main": { "exchange": "okx", "apiKey": "…", "secret": "…", "password": "…" },
    "polymarket-main": { "exchange": "polymarket", "walletAddress": "0x…", "privateKey": "0x…" }
  }
}
```

| Key | Notes |
|---|---|
| `exchange` | Each account names its own exchange; multi-exchange = several entries side by side |
| `apiKey`, `secret`, `password`, `uid`, `walletAddress`, `privateKey`, `token`, `twofa` | Exactly the exchange's `requiredCredentials` names — set only what the venue needs |
| `sandbox` / `demo` | Testnet vs demo portal. **sandbox ≠ demo** (Binance demo runs on a different host) |
| `trading` / `funds` / `implicitWrites` | `true` = sandbox/demo only; live requires the literal string `"live"` **and** a `maxOrderValue` (number, or `null` to opt out) — same pattern for `funds` with `maxTransferValue`; `implicitWrites` enables raw POST/PUT/DELETE |
| `maxOrderValue` / `maxDailyValue` / `allowedSymbols` | Per-order USD cap / rolling-24h cap / optional strict allowlist |
| `confirm` | `always` \| `live` (default) \| `never` |
| `defaultType`, `options`, `prediction` | CCXT constructor options (`options` also carries a proxy for geo-blocks); `prediction: true` for exchanges existing in both namespaces (e.g. hyperliquid) |
| `settings.hideDisabledTools` | `true` hides unconfigured tiers from the tool list (leaner, read-only deployment) |
| `settings.loadEnvKeys` | `true` (or `CCXT_MCP_LOAD_ENV_KEYS=true`) auto-registers an account per exchange whose `<EXCHANGEID>_APIKEY`/`_SECRET` (or `_WALLETADDRESS`/`_PRIVATEKEY`) are in the env — **off by default**, read-only unless global `CCXT_MCP_SANDBOX`/`CCXT_MCP_TRADING` are set (sandbox trading only; live is never auto-armed) |

Credential fields by family: most CEXs (Binance, Bybit, Kraken, Gate, MEXC) `apiKey` + `secret`; OKX / KuCoin / Bitget also `password` (the API **passphrase** chosen when creating the key); wallet-based venues (Hyperliquid, Polymarket, Limitless, other DEX/prediction) `walletAddress` + `privateKey`. Ask the agent to run **`describe_exchange`** — its `requiredCredentials` field lists exactly which to provide. Credentials only ever live in this file; no tool accepts or returns them.

Env vars: `<EXCHANGEID>_<CREDENTIAL>` (`BINANCE_APIKEY`, `OKX_PASSWORD`) fill missing credentials on a configured account; `CCXT_MCP_EXCHANGE` / `CCXT_MCP_APIKEY` / `CCXT_MCP_SECRET` / `CCXT_MCP_SANDBOX` / `CCXT_MCP_TRADING` define one account named `default` (add `_2`, `_3`, … for more).

### Capability tiers

| Tier | Enables | Switch | Default |
|---|---|---|---|
| market | tickers, order books, OHLCV, trades, market search, prediction events, read-only raw GET | — | **on** |
| read | balances, orders, own trades, positions | an account with credentials exists | on when configured |
| trading | create/edit/cancel orders, leverage, margin, position ops | per-account `"trading": true` (sandbox/demo) or `"live"` | **off** |
| funds | withdraw, internal transfer, deposit addresses | per-account `"funds": true` or `"live"` | **off** |
| implicitWrites | raw POST/PUT/DELETE endpoints (incl. key management) | per-account `"implicitWrites": true` | **off** |

### Tools

Discovered by the model from the server; you don't call them directly.

- **market** — `list_exchanges`, `describe_exchange`, `describe_method` (method signatures, per-exchange params, doc links), `search_markets`, `get_tickers`, `get_orderbook`, `get_ohlcv`, `get_trades`, `search_events` (prediction markets), `call_read_method` (any unified `fetch*`/`load*`), `call_implicit_get`, `get_safety_status`, `fetch_route` (best execution route across ~50 exchanges via the CCXT order router — a quote, no keys).
- **live (WebSocket)** — `watch_subscribe` opens a background ccxt.pro stream, `watch_read` returns fresh data, `watch_unsubscribe` stops it, `watch_list` lists active streams. **State** streams (`watchTicker(s)`, `watchOrderBook(ForSymbols)`, `watchOHLCV`, `watchBalance`, `watchPositions`, `watchBidsAsks`, `watchMarkPrice(s)`) merge into the full current set, so `watch_read` returns every subscribed symbol in `latest`. **Event** streams (`watchTrades`, private `watchOrders`/`watchMyTrades`/`watch(My)Liquidations`) return new items oldest-first in `events` with a cursor. `waitForChange: true` on `watch_read` blocks until the next update — the efficient way to wait for a fill. Idle streams auto-stop after 10 minutes.
- **read / trading / funds / implicitWrites** — `list_accounts`, `get_balance`, `get_orders`, `get_my_trades`, `get_positions`; `create_order`, `edit_order`, `cancel_order`, `cancel_all_orders`, `set_leverage`, `set_margin_mode`, `call_write_method`, `execute_route` (executes a `fetch_route` result across your accounts, still bound by caps and confirmation); `withdraw`, `transfer`, `get_deposit_address`; `call_implicit_write`.

`search_markets` returns full market rows (max 100/call); pass `fields` (e.g. `["symbol"]`) for compact rows up to 1000. `meta` carries `returned`/`available`/`offset`/`hasMore`, plus `nextOffset`, `limitClamped`, and `marketTypes` when nothing matched (`type: "perpetual"` points at `"swap"`). All list results are capped and paginated; the raw `info` payload is stripped by default. Symbols are unified (`BTC/USDT` spot, `BTC/USDT:USDT` swap). Prediction exchanges use the same tools with the **outcome handle in the symbol position** (from `search_events`), priced 0–1.

Troubleshooting: "Trading is not enabled for account …" → edit the config file (the conversation cannot change it). AUTH_FAILED / "Invalid API-key" on a sandbox account → testnet keys come from the exchange's testnet portal, not the live account; sandbox ≠ demo (`"demo": true` / `CCXT_MCP_DEMO=true`); Binance's futures testnet is deprecated — use demo trading. HTTP 451 / geo-blocks → set a proxy via account `options`. Slow first call on a big exchange → the initial `loadMarkets()` is cached on disk for 24h. Debug console: `npx @modelcontextprotocol/inspector npx -y ccxt-mcp`.

### Official ccxt agent skills

CCXT also ships **documentation** skills for Claude Code, OpenCode, Codex, Gemini and other assistants — one per language plus two tooling skills. These help an assistant *write* ccxt code; the MCP server is what lets an agent *call* exchanges.

| Skill | Coverage |
|---|---|
| `ccxt-typescript` / `ccxt-python` / `ccxt-php` / `ccxt-csharp` / `ccxt-go` / `ccxt-java` / `ccxt-rust` | One per language: TS/JS (Node.js, browser), Python (sync, async, asyncio), PHP (sync, async ReactPHP), C#/.NET Standard 2.0+, Go, Java 21+ typed subclasses (sync & async), Rust (async/tokio, typed wrappers). All REST & WebSocket |
| `ccxt-cli` | The `ccxt-cli` npm package — calling any unified method from the terminal, argument and `--param` rules, API keys, sandbox/demo modes, live WebSocket tickers and orderbooks, OHLCV charts, `--raw` output for scripting |
| `ccxt-mcp` | Installing and configuring the MCP server — MCP hosts, named accounts and local API keys, capability tiers and safety rails, sandbox trading, how to drive the tools. Documentation *about* the server, not the server itself |

Each language skill carries a broad API reference (market data, trading, account, derivatives, WebSocket grouped by area), install commands, runnable examples, best practices (error handling, rate limiting, auth), language-specific pitfalls and troubleshooting. `ccxt-rust` and especially `ccxt-java` cover a subset — see that skill's own *Complete Method Reference*.

**Install (skills CLI, recommended)** — works with Claude Code, Cursor, Copilot, Windsurf, Codex and 30+ other assistants:

```sh
npx skills add ccxt/ccxt
```

**Install (shell script)** — from a clone or piped from curl:

```sh
./install-skills.sh                       # interactive menu (1 ccxt-typescript … 8 ccxt-cli, 9 All, 10 Exit)
./install-skills.sh --python --go        # specific skills; flags combine
curl -fsSL https://raw.githubusercontent.com/ccxt/ccxt/master/install-skills.sh | sh -s -- --all
```

Flags: `--typescript`, `--python`, `--php`, `--csharp`, `--go`, `--java`, `--rust`, `--cli`, `--all` for everything, `--remote` to pull from GitHub even inside a clone. `ccxt-mcp` has **no flag or menu entry** — it installs only via `--all` (the default when the script is piped from curl) or by manual copy.

Install locations — the script writes to **all four unconditionally**, creating missing dirs: `~/.claude/skills/`, `~/.opencode/skills/`, `~/skills/` (Codex), `~/.gemini/skills/`. Invoke explicitly with `/ccxt-typescript`, `/ccxt-python`, … `/ccxt-cli`, `/ccxt-mcp`; assistants also load them automatically on CCXT questions. Manual install:

```sh
for dir in ~/.claude/skills ~/.opencode/skills ~/skills ~/.gemini/skills; do
    mkdir -p "$dir"; cp -r .claude/skills/ccxt-* "$dir/"
done
```

> **This `ccxt` skill is an independent distillation** of the upstream docs, not the official skill. For the authoritative surface — method lists, per-language idioms, current flags — prefer the official ccxt skills above, the CCXT Manual, and `docs.ccxt.com`.

## Examples corpus

Official runnable examples live in the ccxt repository under `examples/`, split by language: `examples/ts/`, `examples/js/` (`node path/to/example.js`), `examples/php/` (`php -f path/to/example.php`), `examples/py/` (`python path/to/example.py`), and `examples/rust/` — cargo binaries declared in `examples/rust/Cargo.toml`, run by `[[bin]]` name. Prediction-venue walkthroughs are under the `prediction-markets` example folders (e.g. `/docs/examples/ts/prediction-markets`).

```shell
cargo run --manifest-path examples/rust/Cargo.toml --bin binance_basics
cargo run --manifest-path examples/rust/Cargo.toml --features ws --bin watch_trades
```

Rust WebSocket (`watch*`) examples need the `ccxt-pro` crate behind the `ws` feature. JS examples may use `ololog`, `ansicolor` and `as-table`, installed with ccxt's devDependencies. Start from an example in the target language before writing a new integration from scratch; the CLI source files are the reference for argument handling.

## Source

- CCXT docs: "Prediction Markets", "CCXT CLI (Command-Line Interface)", "CCXT MCP Server", "AI Skills for Claude Code, OpenCode, Codex and Gemini", "CCXT Cryptocurrency Trading Library Examples" — docs.ccxt.com / the CCXT wiki.
- Repo: `github.com/ccxt/ccxt` — `examples/`, `mcp/`, `install-skills.sh`, `.claude/skills/README.md`, `CONTRIBUTING.md#adding-exchange-credentials`.
- Package: `npmjs.com/package/ccxt-mcp` · Router: `docs.ccxt.com/router/` · Standard: `modelcontextprotocol.io`.

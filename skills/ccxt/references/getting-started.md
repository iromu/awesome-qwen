# CCXT Getting Started

Install commands, runtime floors, credential supply, and the sandbox switch for CCXT — the unified crypto-exchange trading API (JS/TS, Python, PHP, C#, Go, Java, Rust; REST plus WebSocket via CCXT Pro).

**Naming convention:** Python and PHP use `snake_case` (`fetch_ticker`, `load_markets`, `set_sandbox_mode`); JS/TS, C# and Go use `camelCase`/`PascalCase` (`fetchTicker`, `loadMarkets`, `SetSandboxMode`). They are the same unified method — the examples below show both languages only where the difference is real (module import, async entry point).

## Install by language

| Language | Channel | Command |
|----------|---------|---------|
| JavaScript / TypeScript | npm | `npm install ccxt` |
| Python | PyPI | `pip install ccxt` |
| PHP | Composer / Packagist | `composer require ccxt/ccxt` |
| C# / .NET | NuGet | `dotnet add package ccxt` |
| Go | module | `go get github.com/ccxt/ccxt/go/v4` |
| Java | Gradle | `implementation("io.github.ccxt:ccxt:4.5.52")` |
| Rust | crates.io | `cargo add ccxt tokio --features tokio/full` and `cargo add ccxt-pro` |
| Any (source) | git | `git clone https://github.com/ccxt/ccxt.git` |

Source layout: `js/ccxt.js` (JS), `python/` (generated from JS), `ccxt.php` (generated from JS), `java/` (generated from TS). A custom bundle can be built from source choosing needed exchanges in `exchanges.cfg`.

### Runtime and version floors

| Language | Floor / requirement (as documented) |
|----------|-------------------------------------|
| JavaScript | Requires ES6 and `async/await` support. Listed as "Node v15+"; the JS section states "Node 18+". Works in Node and browsers. With Rspack/Webpack + Babel, ensure ccxt is not excluded from `babel-loader`. |
| Python | Python 3. Async mode (`asyncio`, `async/await`) needs Python 3.5.3+. |
| PHP | PHP 8.1+. Needs modules: cURL, mbstring (UTF-8 recommended), PCRE, iconv, gmp. Async uses ReactPHP (PHP 8.1+). |
| C# / .NET | netstandard 2.0 and netstandard 2.1. |
| Java | Java 21+; Gradle is the build system. |
| Rust | Async only; expects a Tokio runtime. |

Python async entry point:

```python
import ccxt                        # sync
import ccxt.async_support as ccxt  # async (asyncio / async/await)
```

PHP requires a UTC timezone before use (the library uses builtin UTC/GMT time functions):

```php
date_default_timezone_set('UTC');
include 'ccxt.php';
```

### Browser / CDN

All-in-one bundle (dependencies included); pin the version — unpinned "latest" URLs are supported but explicitly discouraged:

- `https://cdn.jsdelivr.net/npm/ccxt@4.5.92/dist/ccxt.browser.min.js`
- `https://unpkg.com/ccxt@4.5.92/dist/ccxt.browser.min.js`
- `https://cdn.ccxt.com/latest/ccxt.min.js`

Default browser entry point is the global `window.ccxt`.

### Custom (reduced) JavaScript build

Full bundle is several megabytes; build only the exchanges needed (rspack removes dead code paths):

```bash
git clone --depth 1 https://github.com/ccxt/ccxt.git && cd ccxt && npm install
echo -e "binance\nokx" > exchanges.cfg
npm run export-exchanges
npm run bundle-browser
```

Then copy `dist/ccxt.browser.js` into the web project, or `npm link` / `npm link ccxt` for a Node app, or import directly (`import ccxt from './js/ccxt.js'`).

### Rust feature gating (build-size trap)

By default every exchange is compiled — a fresh debug build needs ~19 GB RAM (50 GB in release). Each exchange is a cargo feature named after its id; disable defaults and list only the needed ids:

```toml
[dependencies]
ccxt = { version = "4.5.75", default-features = false, features = ["binance", "kraken"] }
ccxt-pro = { version = "4.5.75", default-features = false, features = ["binance"] }
tokio = { version = "1", features = ["full"] }
```

Three exchanges build in ~30 s / 2.5 GB. A derived exchange pulls in its parent (`binanceus` → `binance`); `ccxt-prediction` has its own list (`polymarket`, `kalshi`, …). `from_id` only knows the exchanges that were compiled in.

### Docker

For developing CCXT (build scripts, tests), not for using it — a plain install is enough for consumers.

```shell
docker-compose run --rm ccxt     # in the cloned CCXT repository
docker build . --tag ccxt && docker run -it ccxt
```

## API credentials

Credentials are ordinary exchange properties supplied in the constructor's associative array (a plain object / dict / map), or assigned afterwards:

| Property | Meaning |
|----------|---------|
| `apiKey` | Public API key string literal (ASCII, hex, Base64, …). Most exchanges require it. |
| `secret` | Private secret API key string literal. Most exchanges require it alongside `apiKey`. |
| `password` | Password/phrase string literal. Some exchanges require it for trading; most do not. |
| `uid` | Unique account id — string or number. Some exchanges require it for trading; most do not. |
| `requiredCredentials` | Read-only unified dict showing which of the above the underlying exchange actually requires for private calls. |

```javascript
const exchange = new ccxt.binance({ apiKey: 'YOUR_API_KEY', secret: 'YOUR_SECRET' })
```

```python
exchange = ccxt.binance({'apiKey': 'YOUR_API_KEY', 'secret': 'YOUR_SECRET'})
```

Public (market-data) methods need no auth; private methods (trading, balance) require keys. Env-var credential loading and a keys file are **not documented** in the sources read — read them from your own config and pass them to the constructor.

## Sandbox / testnet

Exchanges expose testnets ("sandboxes", "staging environments") that are usually clones of production with a different base URL. CCXT unifies the switch:

```javascript
const exchange = new ccxt.binance(config)
exchange.setSandboxMode(true)   // must be the FIRST call after construction
```

```python
exchange = ccxt.binance(config)
exchange.set_sandbox_mode(True)  # must be the FIRST call after construction
```

Rules:
- Call it **immediately after creating the exchange, before any other call**.
- Register on the exchange's sandbox site to obtain sandbox keys.
- **Sandbox keys are not interchangeable with production keys.**
- Whether an exchange supports a sandbox is visible in `exchange.features[<marketType>].sandbox` (`true`/`false`/`undefined`).

## CCXT Pro (WebSocket) install difference

REST is the free `ccxt` package; WebSocket `watch*` streams ship in **CCXT Pro**, which requires a paid license obtained at `https://ccxt.pro` and grants access to a **private GitHub repository** (`github.com/kroitor/ccxt.pro`). Configure GitHub auth over SSH or HTTPS first; the account must have access (check `https://ccxt.pro/account`, `https://ccxt.pro/orders`).

```shell
# JavaScript — Git/HTTPS auth
npm install git+https://github.com/kroitor/ccxt.pro.git
# JavaScript — SSH auth
npm install ssh://git@github.com/kroitor/ccxt.pro.git

# Python — Git/HTTPS auth
pip3 install git+https://github.com/kroitor/ccxt.pro.git#subdirectory=python
# Python — SSH auth
pip3 install git+ssh://git@github.com/kroitor/ccxt.pro.git#subdirectory=python

# PHP
composer config repositories.ccxtpro '{"type": "git", "url": "https://github.com/kroitor/ccxt.pro.git"}'
composer require --ignore-platform-reqs ccxt/ccxtpro
```

- Python package name is `ccxtpro` (`import ccxtpro`, `ccxtpro.__version__`, `ccxtpro.exchanges`); in `setup.py` use `'ccxtpro @ git+https://github.com/kroitor/ccxt.pro.git#subdirectory=python'`.
- JS dependency in `package.json`: `"ccxt.pro": "git+https://github.com/kroitor/ccxt.pro.git"`; update with `npm update ccxt.pro`.
- PHP dependency: `"ccxt/ccxtpro": "^0.0.70"` plus the git repository entry; version via `\ccxtpro\Exchange::VERSION`.
- Building from a clone needs Node.js + NPM on the machine even for the Python/PHP packages; `npm run build` is only needed for edited custom builds.
- Rust is the exception: the WebSocket crate is public — `ccxt` carries REST exchanges, `ccxt-pro` adds the `watch*` ones and is only needed when streaming.

## Install-free entry points

- **MCP server:** `claude mcp add ccxt -- npx -y ccxt-mcp` — exposes 100+ exchanges and prediction markets to any MCP host (Claude Desktop/Code, Cursor, VS Code, Windsurf).
- **CLI:** call any unified method from the shell (see the upstream `CLI.md`).
- **Official agent skills** (language-specific, for Claude Code, Cursor, Copilot, Windsurf, Codex and 30+ others): `npx skills add ccxt/ccxt`.

## Verify the install

```javascript
var ccxt = require('ccxt')
console.log(ccxt.exchanges)   // all available exchange ids
```

```python
import ccxt
print(ccxt.exchanges)          # list of all available exchange classes
```

Python async: `import ccxt.async_support as ccxt`. PHP: `var_dump(\ccxt\Exchange::$exchanges);`. Go: `fmt.Println(ccxt.Exchanges)`. C#: `Console.WriteLine(string.Join(", ", ccxt.Exchange.exchanges));`. Java: `Exchange.dynamicallyCreateInstance(id, config)` creates exchanges by id.

## Source

- https://github.com/ccxt/ccxt/wiki/Install
- https://github.com/ccxt/ccxt/wiki/Requirements
- https://github.com/ccxt/ccxt/wiki/ccxt.pro.install
- https://github.com/ccxt/ccxt/blob/master/llms.txt
- https://github.com/ccxt/ccxt/wiki/Manual (Overview, Exchanges, Instantiation, Testnets And Sandbox Environments)

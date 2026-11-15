# Bar Series and Bars

The `BarSeries`/`Bar` data model, its builders and variants, realtime appends, and the `Num` numeric backend.

Everything else — indicators, rules, strategies, criteria — reads from a `BarSeries`: an ordered list of `Bar`s with OHLCV data over consistent time spans.

## The Bar model

`org.ta4j.core.Bar` is the read contract; `org.ta4j.core.BaseBar` is the standard implementation retained by `BaseBarSeries`.

```java
import org.ta4j.core.Bar;

bar.getTimePeriod();     // Duration  — the bar's window length
bar.getBeginTime();      // Instant   — window start (UTC since 0.18)
bar.getEndTime();        // Instant   — window end
bar.getOpenPrice();      // Num       — OHLC prices share the series' Num type
bar.getHighPrice();  bar.getLowPrice();  bar.getClosePrice();
bar.getVolume();         // Num       — base-asset quantity
bar.getAmount();         // Num       — quote-currency turnover
bar.getTrades();         // long      — trade count
bar.numFactory();        // NumFactory that produced this bar's values
```

`org.ta4j.core.RealtimeBar` extends `Bar` with microstructure breakdowns — `hasSideData()`, `getBuyVolume()`, `getSellVolume()`, `getBuyTrades()`, `getSellTrades()`, and `hasLiquidityData()`, `getMakerVolume()`, `getTakerVolume()`, `getMakerTrades()`, `getTakerTrades()`. When the feed never supplied side/liquidity, the matching flag is `false` and those getters return zero rather than `null`.

**Since bars are `Num`-typed, a series and its bars must share one `NumFactory`.** Build bars from `series.barBuilder()` instead of constructing them separately.

**Mutation contract.** `BaseBar` and `BaseRealtimeBar` publish their mutations to the retaining `BaseBarSeries`/`ConcurrentBarSeries`, so a retained bar — including a historical one — can be updated safely and indicator caches react. A custom `Bar` implementation that does not publish mutations may be changed only while it is the terminal bar; after a newer bar is appended, leave it alone, because `CachedIndicator` fingerprints non-publishing bars only while terminal and will serve stale values after an unannounced edit.

## Building bars: `BarBuilder` and the `bars` package

`series.barBuilder()` returns an `org.ta4j.core.BarBuilder` bound to the series' factory. Each numeric setter accepts `Num`, `Number`, or `String`; `build()` returns the bar, `add()` appends it to the bound series:

```java
import java.time.Duration;
import java.time.Instant;
import org.ta4j.core.Bar;

Bar bar = series.barBuilder()
        .timePeriod(Duration.ofMinutes(1))
        .endTime(Instant.parse("2025-01-01T00:01:00Z"))  // or beginTime(...): anchor on whichever your feed gives
        .openPrice("100.0").highPrice(101.0).lowPrice(99.5).closePrice(100.7)
        .volume(42).amount(4210.5).trades(17)            // amount/trades are optional
        .build();
series.addBar(bar);
```

`org.ta4j.core.bars.*` provides aggregating builders (and matching `*BuilderFactory`s) that turn a trade stream into bars by threshold instead of accepting a finished OHLCV set:

| Builder | Closes a bar when | Use for |
| --- | --- | --- |
| `TimeBarBuilder` / `TimeBarBuilderFactory` | elapsed time exceeds the period | standard candles |
| `TickBarBuilder` | a trade count is reached | liquidity-normal bars |
| `VolumeBarBuilder` | base volume crosses a threshold | volume bars |
| `AmountBarBuilder` | quote amount crosses a threshold | dollar-volume bars |
| `HeikinAshiBarBuilder` | per its own rule | Heikin-Ashi constructions |

`TimeBarBuilderFactory(Duration timePeriod, boolean realtimeBars)` (and the other factories' `realtimeBars` flag) makes the builder emit `BaseRealtimeBar` instances that accumulate side/liquidity data. `BaseBarSeriesBuilder.withBarBuilderFactory(...)` / `ConcurrentBarSeriesBuilder.withBarBuilderFactory(...)` decide which builder `series.barBuilder()` hands out.

To re-cut an existing series into another bar type, use `org.ta4j.core.aggregator`: `new BaseBarSeriesAggregator(new RenkoBarAggregator(2.0, 2)).aggregate(series, "btc_renko")`, with `DurationBarAggregator` (timeframe rollups), `RangeBarAggregator`, `VolumeBarAggregator`. Range/volume/Renko aggregators require ordered, contiguous, evenly spaced source bars and emit only completed threshold bars unless constructed with `onlyFinalBars=false`; Renko emits one brick per close move, with all accumulated volume/amount/trades attached to the first brick from a source bar.

## Series variants and when to use each

| Type | Choose it when |
| --- | --- |
| `BaseBarSeries` (via `BaseBarSeriesBuilder`) | single-threaded backtests, deterministic runs — no synchronization cost |
| `BaseBarSeries` with `withMaxBarCount(n)` | rolling/live feeds with bounded memory (a moving window, not a separate class) |
| `ConcurrentBarSeries` (via `ConcurrentBarSeriesBuilder`) | one thread ingests while others read; WebSocket feeds; `RealtimeBar` analytics |
| `series.getSubSeries(start, end)` | train/test or walk-forward slices (inherits the source max-bar-count) |

```java
import java.util.List;
import org.ta4j.core.Bar;
import org.ta4j.core.BaseBarSeriesBuilder;
import org.ta4j.core.BarSeries;

BarSeries series = new BaseBarSeriesBuilder()
        .withName("btc-usd")                  // default "unnamed_series"
        .withNumFactory(/* see the Num section */)
        .withBars(bars)                       // List<Bar>, bulk load
        .withBeginIndex(0)                    // absolute index of the first bar
        .withMaxBarCount(Integer.MAX_VALUE)   // default: unbounded
        .withBarBuilderFactory(barBuilderFactory)
        .build();
```

`new BaseBarSeries(name, bars)` is the direct constructor when you do not need the builder. `setConstrained(boolean)` is deprecated since 0.22.2 — constrained behavior now derives from the max-bar-count setting, so configure `withMaxBarCount`.

**Moving window.** `series.setMaximumBarCount(n)` turns any series into a moving window: each append past capacity evicts the head, and `getBeginIndex()` advances. Read raw bars only inside `getBeginIndex()..getEndIndex()` — some APIs map a removed index to the retained head instead of throwing. Keep the *same* indicator instances across appends: an EMA-family indicator (0.27.0+) carries already-consumed history across eviction and matches an unbounded replay, while a freshly constructed indicator on the pruned series seeds only from retained bars and returns `NaN` until it warms up. Size capacity for the whole indicator graph, not just the outermost period.

**Concurrent series.**

```java
import java.time.Duration;
import java.time.Instant;
import org.ta4j.core.ConcurrentBarSeries;
import org.ta4j.core.ConcurrentBarSeriesBuilder;
import org.ta4j.core.ConcurrentBarSeries.StreamingBarIngestResult;
import org.ta4j.core.RealtimeBar;
import org.ta4j.core.bars.TimeBarBuilderFactory;
import org.ta4j.core.num.DecimalNumFactory;

ConcurrentBarSeries live = new ConcurrentBarSeriesBuilder()
        .withName("btc-usd-live")
        .withNumFactory(DecimalNumFactory.getInstance())
        .withBarBuilderFactory(new TimeBarBuilderFactory(Duration.ofMinutes(1), true)) // realtime bars
        .withMaxBarCount(10_000)
        .build();

// Trade stream: the configured BarBuilder owns rollovers
live.tradeBarBuilder().timePeriod(Duration.ofMinutes(1));   // only if the factory set no period
live.ingestTrade(Instant.now(), 0.25, 42_100);              // Number or Num overloads
live.ingestTrade(Instant.now(), 0.25, 42_100, RealtimeBar.Side.BUY, RealtimeBar.Liquidity.TAKER);

// Candle stream: pre-aggregated bars from a WebSocket feed
StreamingBarIngestResult result = live.ingestStreamingBar(candle);
// result.action(): APPENDED | REPLACED_LAST | REPLACED_HISTORICAL; result.index(): affected index
live.ingestStreamingBars(candles);   // Collection<Bar>: nulls ignored, sorted by end time
```

`ConcurrentBarSeries` uses a `ReentrantReadWriteLock`: many readers (getters, indicator evaluation) run in parallel, writers are serialized, and `getBarData()` returns an immutable `List.copyOf(...)` snapshot. It is Java-serializable (bars, factory, bar-builder factory, max-bar-count survive; locks are reinitialized and the trade bar builder is rebuilt lazily). A plain `BaseBarSeries` under concurrent writes is not safe — use the concurrent variant rather than external synchronization.

## Realtime appends on a plain series

```java
series.addBar(bar);              // append
series.addBar(bar, true);        // replace the terminal bar (forming-candle correction)
series.addPrice(100.9);          // update the last bar's close, extending high/low
series.addTrade(2, 100.0);       // volume first, then price (Number or Num overloads)
```

Prime the series with enough history before going live so indicators have context, and evaluate closed candles by appending completed bars — `addBar(bar, true)` leaves a still-forming bar that strategies will read.

## The Num model

`org.ta4j.core.num.Num` is the numeric abstraction every bar, indicator and criterion uses; each series owns one `NumFactory` so arithmetic stays consistent across the series.

| Implementation | Backed by | Choose it when |
| --- | --- | --- |
| `DecimalNum` (default) | `BigDecimal`, 16-digit precision, `HALF_UP` rounding (reduced from 32 in 0.19) | exact decimals: crypto pairs, high-value assets, long indicator chains |
| `DoubleNum` | `double` | throughput matters more than an ulp; ratios and normalized oscillators tolerate IEEE-754 error |

```java
import org.ta4j.core.BaseBarSeriesBuilder;
import org.ta4j.core.num.DecimalNum;
import org.ta4j.core.num.DecimalNumFactory;
import org.ta4j.core.num.DoubleNumFactory;
import java.math.MathContext;
import java.math.RoundingMode;

BarSeries fast = new BaseBarSeriesBuilder()
        .withNumFactory(DoubleNumFactory.getInstance()).build();
BarSeries exact = new BaseBarSeriesBuilder()
        .withNumFactory(DecimalNumFactory.getInstance(new MathContext(40, RoundingMode.HALF_EVEN))).build();

DecimalNum.configureDefaultPrecision(32);                            // global, new instances only
DecimalNum.configureDefaultMathContext(new MathContext(32, RoundingMode.HALF_EVEN));
int p = DecimalNum.getDefaultPrecision();   // 16 by default; resetDefaultPrecision() restores it
```

`NumFactory` also exposes `numOf(Number|String)`, the constants `minusOne()/zero()/one()/two()/three()/hundred()/thousand()`, `epsilon()` (default: `1/1000^4`, a guardrail for division), and `produces(Num)`. Always create literals through the series' factory — `series.numFactory().numOf(3)` — because mixed-backend values are rejected at ingestion. Static guards for custom code: `Num.isValid(v)`, `Num.isNaNOrNull(v)`, `Num.isFinite(v)`.

**How a series picks its backend.** `BaseBarSeriesBuilder` defaults to `DecimalNumFactory`. If you call `withBars(...)` without `withNumFactory(...)`, the builder infers the factory from `bars.getFirst().numFactory()`; it then checks every bar with `numFactory.produces(bar.getClosePrice())` and throws `IllegalArgumentException` on a mismatch. Set `withNumFactory(...)` explicitly when the first bar does not represent the whole batch (e.g. an empty-price warm-up bar), and use `BarSeriesUtils.convertBarSeries(series, factory)` to migrate an existing series.

**Precision vs throughput.** Time rises roughly linearly-to-quadratically with precision and each `BigDecimal` operation allocates, so GC pressure follows. Bands: 8–12 digits for latency-critical loops, the default 16 for ordinary backtests, 24–32 for long chained indicators or many divisions/square roots, 48+ only for specialized work. Quantify it on your own workload with the `ta4jexamples.num.DecimalNumPrecisionPerformanceTest` benchmark, which reports median millis, relative duration against a 64-digit baseline, and maximum absolute error.

## Pitfalls

- **Bars built outside the series with a different `Num` type** — `addBar`/`ingestTrade` reject them with `IllegalArgumentException`; create bars via `series.barBuilder()` or the same factory.
- **Builder inference surprises** — `withBars(...)` without `withNumFactory(...)` inherits the first bar's factory, so a `DoubleNum` bar at index 0 silently makes the whole series `DoubleNum`.
- **Reading outside the retained window** — after `setMaximumBarCount` eviction, `getBeginIndex()` has moved; indexes below it may resolve to the retained head instead of failing.
- **Rebuilding indicators on a moving series** — a new EMA instance on a pruned series warms up from retained bars only and yields `NaN`; keep the original instance.
- **Custom `Bar` edits after promotion** — an unannounced change to a non-terminal custom bar leaves cached indicator values stale; use `BaseBar` or `addBar(bar, true)`.
- **`addBar(bar, true)` semantics** — it replaces only the *last* bar; correcting history needs `replaceBarIfChanged` (plain series) or `ingestStreamingBar` (concurrent series, which reports `REPLACED_HISTORICAL`).
- **`ConcurrentBarSeries` without a period** — `ingestTrade` needs the configured `TimeBarBuilder` to have a `timePeriod`; set it on the factory or via `tradeBarBuilder().timePeriod(...)` before the first trade.
- **Missing side/liquidity data** — `getBuyVolume()` and friends return zero, not `null`, so check `hasSideData()`/`hasLiquidityData()` before treating a zero as a real measurement.
- **`DoubleNum` for money math** — `1.0 - 9 * 0.1` style residue accumulates through criteria and cost arithmetic; keep `DecimalNum` unless a benchmark justifies the switch.
- **Deprecated `setConstrained`** — it no longer expresses intent; retention is configured with `withMaxBarCount`.

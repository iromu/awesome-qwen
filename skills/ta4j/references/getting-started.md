# Getting Started with ta4j

Set up ta4j 0.28.x in a Java project and take one strategy from raw data to backtest metrics.

## Requirements and Maven setup

ta4j 0.28.x targets **Java 25+** (the upstream reactor compiles with `maven.compiler.release=25`); an older JDK cannot build or run `ta4j-core`. Most applications need only the core artifact (Gradle: `implementation("org.ta4j:ta4j-core:0.28.0")`):

```xml
<dependency>
  <groupId>org.ta4j</groupId>
  <artifactId>ta4j-core</artifactId>
  <version>0.28.0</version>
</dependency>
```

`ta4j-core` depends on `slf4j-api`, `commons-math3` and `gson`. Add an SLF4J binding (`logback-classic` or `log4j-slf4j2-impl`) — without one, rule/strategy `TRACE` decision logging and data-loader error output are silently dropped.

For APIs on `master` that are not released yet, add the Sonatype Central snapshot repository and use `0.28.1-SNAPSHOT`, or build the checkout once with `mvn -pl ta4j-core -am install`:

```xml
<repository>
  <id>central-portal-snapshots</id>
  <url>https://central.sonatype.com/repository/maven-snapshots/</url>
  <releases><enabled>false</enabled></releases>
  <snapshots><enabled>true</enabled></snapshots>
</repository>
```

## What lives where

| Artifact | Contents | Use it for |
| --- | --- | --- |
| `ta4j-core` (`org.ta4j.core.*`) | `BarSeries`, `Bar`, `Indicator`, `Rule`, `Strategy`, `TradingRecord`, `BarSeriesManager`, `BacktestExecutor`, criteria, cost models, aggregators, `num` | Everything you ship. |
| `ta4j-examples` (`ta4jexamples.*`) | Runnable demos, `Quickstart`, `BarSeriesDataSource` loaders (Yahoo, Coinbase, CSV, JSON, Bitstamp trades), JFreeChart `ChartWorkflow`, benchmarks | Learning, sample data, copy-into-your-project code. Not a runtime dependency of core. |

## End-to-end: data -> series -> indicators -> rules -> strategy -> run -> criteria

```java
import java.time.Duration;
import java.time.Instant;
import org.ta4j.core.BarSeries;
import org.ta4j.core.BaseBarSeriesBuilder;
import org.ta4j.core.Rule;
import org.ta4j.core.Strategy;
import org.ta4j.core.BaseStrategy;
import org.ta4j.core.TradingRecord;
import org.ta4j.core.analysis.cost.LinearTransactionCostModel;
import org.ta4j.core.analysis.cost.ZeroCostModel;
import org.ta4j.core.backtest.BarSeriesManager;
import org.ta4j.core.criteria.OpenPositionCostBasisCriterion;
import org.ta4j.core.criteria.drawdown.MaximumDrawdownCriterion;
import org.ta4j.core.criteria.drawdown.ReturnOverMaxDrawdownCriterion;
import org.ta4j.core.criteria.pnl.NetReturnCriterion;
import org.ta4j.core.indicators.averages.SMAIndicator;
import org.ta4j.core.indicators.helpers.ClosePriceIndicator;
import org.ta4j.core.rules.CrossedDownIndicatorRule;
import org.ta4j.core.rules.CrossedUpIndicatorRule;
import org.ta4j.core.rules.StopGainRule;
import org.ta4j.core.rules.StopLossRule;

// 1. Data -> BarSeries (see "Getting data in" below for loaders and bulk builds)
BarSeries series = new BaseBarSeriesBuilder().withName("btc-usd").build();
series.addBar(series.barBuilder()
        .timePeriod(Duration.ofMinutes(5))
        .endTime(Instant.parse("2025-01-01T00:05:00Z"))
        .openPrice(42000).highPrice(42150).lowPrice(41980).closePrice(42100)
        .volume(12.4).build());

// 2. Indicators (lazy; nothing is computed until getValue(index) is called)
ClosePriceIndicator closePrice = new ClosePriceIndicator(series);
SMAIndicator fastSma = new SMAIndicator(closePrice, 5);
SMAIndicator slowSma = new SMAIndicator(closePrice, 30);

// 3. Rules compose with and(...), or(...), xor(...), negation()
Rule entryRule = new CrossedUpIndicatorRule(fastSma, slowSma);
Rule exitRule = new CrossedDownIndicatorRule(fastSma, slowSma)
        .or(new StopLossRule(closePrice, 3))    // 3 = 3% below entry price
        .or(new StopGainRule(closePrice, 5));   // 5 = 5% above entry price

// 4. Strategy; unstable bars suppress signals until the slowest indicator has data
Strategy strategy = new BaseStrategy("SMA crossover", entryRule, exitRule);
strategy.setUnstableBars(30);

// 5. Backtest: one strategy over the whole series, with transaction costs
BarSeriesManager manager = new BarSeriesManager(series,
        new LinearTransactionCostModel(0.001), new ZeroCostModel());
TradingRecord record = manager.run(strategy);

// 6. Criteria: each returns a Num computed from the series + record pair
System.out.printf("closed positions: %s%n", record.getPositionCount());
System.out.printf("net return: %s%n", new NetReturnCriterion().calculate(series, record));
System.out.printf("max drawdown: %s%n", new MaximumDrawdownCriterion().calculate(series, record));
System.out.printf("return/max drawdown: %s%n", new ReturnOverMaxDrawdownCriterion().calculate(series, record));
System.out.printf("open cost basis: %s%n", new OpenPositionCostBasisCriterion().calculate(series, record));
```

Cost models are non-null — pass `new ZeroCostModel()` for "no cost"; `new BarSeriesManager(series)` is the same as zero transaction + zero holding costs with the default `TradeOnNextOpenModel` (fills execute at the *next* bar's open). `run` has overloads for `TradeType startingType`, `Num amount`, `PositionSizer`, explicit `startIndex`/`finishIndex`, and a caller-supplied `TradingRecord` — pick the narrowest one that expresses the experiment.

To compare many candidates instead of one, use `org.ta4j.core.backtest.BacktestExecutor` with `WeightedCriterion.of(...)` ranking; `ta4jexamples.backtesting.SimpleMovingAverageRangeBacktest` shows the parameter-grid flow.

Ask "why did this rule fire?" by enabling SLF4J `TRACE` on the `Rule`/`Strategy` logger, or by calling `rule.isSatisfiedWithTraceMode(index, Rule.TraceMode.SUMMARY)` / `strategy.shouldEnterWithTraceMode(...)`.

## Getting data in

### Example-module loaders (prototyping)

All loaders implement `ta4jexamples.datasources.BarSeriesDataSource` (`loadSeries(ticker, interval, start, end)`, `loadSeries(source)`, `loadSeries(InputStream)`) and return **`null` on failure** — always check. They are reference implementations for prototyping, not a supported runtime library.

```java
import java.time.Duration;
import java.time.Instant;
import org.ta4j.core.BarSeries;
import ta4jexamples.datasources.BarSeriesDataSource;
import ta4jexamples.datasources.CsvFileBarSeriesDataSource;
import ta4jexamples.datasources.JsonFileBarSeriesDataSource;
import ta4jexamples.datasources.CoinbaseHttpBarSeriesDataSource;
import ta4jexamples.datasources.CoinbaseHttpBarSeriesDataSource.CoinbaseInterval;
import ta4jexamples.datasources.YahooFinanceHttpBarSeriesDataSource;
import ta4jexamples.datasources.YahooFinanceHttpBarSeriesDataSource.YahooFinanceInterval;

// HTTP: static helpers for one-off loads (caching disabled)
Instant start = Instant.parse("2023-01-01T00:00:00Z");
Instant end = Instant.parse("2023-12-31T23:59:59Z");
BarSeries aapl = YahooFinanceHttpBarSeriesDataSource.loadSeries("AAPL", YahooFinanceInterval.DAY_1, start, end);
BarSeries eth = CoinbaseHttpBarSeriesDataSource.loadSeries("ETH-USD", CoinbaseInterval.ONE_HOUR, 500);

// HTTP: instance form when you want disk caching, DI for tests, or repeated loads
YahooFinanceHttpBarSeriesDataSource loader = new YahooFinanceHttpBarSeriesDataSource(true);
BarSeries msft = loader.loadSeriesInstance("MSFT", YahooFinanceInterval.DAY_1, start, end);

// Files: by domain criteria (classpath search) or by exact filename
BarSeriesDataSource csv = new CsvFileBarSeriesDataSource();
BarSeries fromCsv = csv.loadSeries("AAPL-PT1D-20230101_20231231.csv");
BarSeries fromJson = new JsonFileBarSeriesDataSource().loadSeries("Coinbase-BTC-USD-PT1D-20230101_20231231.json");
```

`YahooFinanceInterval` (`MINUTE_1/5/15/30`, `HOUR_1/4`, `DAY_1`, `WEEK_1`, `MONTH_1`) and `CoinbaseInterval` (`ONE_MINUTE` … `ONE_DAY`) are nested enums of their data-source classes. Both HTTP sources paginate large ranges automatically and support `deleteStaleCacheFiles()` / `deleteCacheFilesOlderThan(Duration)`. Cache-enabled constructors take `boolean` or a cache directory `String`; mock-based tests inject an `HttpClientWrapper` and must use the `loadSeriesInstance` methods (statics use an unmocked default instance). CSV files expect a header plus `date,open,high,low,close,volume` with `yyyy-MM-dd` dates; JSON accepts Coinbase or Binance shapes via `AdaptiveBarSeriesTypeAdapter`; `BitStampCsvTradesFileBarSeriesDataSource` aggregates raw `timestamp,price,volume` trades into bars.

### Production ingestion: build the series yourself

`ta4j-core` has no network code on purpose. Adapt your broker, exchange WebSocket, REST API or database into bars and keep gap handling and corporate-action adjustments explicit in your own code:

```java
import java.util.List;
import org.ta4j.core.Bar;
import org.ta4j.core.BarSeries;
import org.ta4j.core.BaseBarSeriesBuilder;
import org.ta4j.core.num.DoubleNumFactory;
import org.ta4j.core.utils.BarSeriesUtils;

List<Bar> bars = myFeed.fetch("BTC-USD", Duration.ofHours(1));   // your adapter
bars = BarSeriesUtils.sortBars(bars);                            // chronological
BarSeries series = new BaseBarSeriesBuilder()
        .withName("btc-usd-1h")
        .withNumFactory(DoubleNumFactory.getInstance())
        .withBars(bars)
        .withMaxBarCount(50_000)
        .build();

for (Bar bar : newerBars) {
    series.addBar(bar);              // or addBar(bar, true) to correct the forming bar
}
```

`BarSeriesUtils` covers the recurring ingestion jobs: `sortBars`, `addBars(series, list)`, `findMissingBars(series, false)` (gaps), `findOverlappingBars`, `replaceBarIfChanged(series, newBar)` (exchange restatements), `aggregateBars(series, Duration, name)` (rollups), and `convertBarSeries(series, numFactory)` (change numeric backend).

## Running the examples

From a clone of [the repository](https://github.com/ta4j/ta4j) (`mvnw.cmd` on Windows):

```bash
./mvnw -DskipTests install                 # build the reactor once
./mvnw -pl ta4j-examples exec:java         # default mainClass = ta4jexamples.Quickstart
./mvnw -pl ta4j-examples exec:java -Dexec.mainClass=ta4jexamples.backtesting.TradingRecordParityBacktest
./mvnw -pl ta4j-examples test              # sanity-check the environment
```

`Quickstart` loads bundled Bitcoin data, runs an SMA crossover, prints metrics, and opens a chart window when a display is available; run it headless by ignoring the chart step. The precision benchmark is `./mvnw -pl ta4j-examples -Dexec.mainClass=ta4jexamples.num.DecimalNumPrecisionPerformanceTest exec:java`.

## Pitfalls

- **Java version** — a pre-25 toolchain fails before any ta4j code runs; check `java -version` and the compiler `release` setting first.
- **No SLF4J binding** — loader failures return `null` and log the reason; without a binding you see `null` and nothing else, and debug it forever.
- **`null` series from loaders** — `BarSeriesDataSource` reports failure by returning `null` (bad ticker, no matching file, rate limit), not by throwing.
- **Static vs instance loader methods** — static `loadSeries(...)` disables caching and ignores an injected mock client; use `loadSeriesInstance(...)` for cached or mocked loads.
- **Unstable indicators at the head of the series** — without `setUnstableBars(n)` (n ≥ the longest lookback), a crossover can fire on partial windows right after warm-up.
- **Percentages in stop rules** — `StopLossRule`/`StopGainRule` take a percentage (`3` means 3%), not a fraction.
- **Cost model units** — `LinearTransactionCostModel(0.001)` is 0.1% per trade; `LinearBorrowingCostModel(rate)` charges per *index step*, not per calendar day, so weekend gaps do not add charges.
- **Example module as a dependency** — pulling `ta4j-examples` into production drags JFreeChart, Gson-driven loaders and unversioned HTTP endpoints into your build; vendor the loader you need instead.
- **Evaluating a forming bar** — `addBar(bar, true)` leaves an in-progress candle that indicators and strategies will read; evaluate closed candles only by appending completed bars.

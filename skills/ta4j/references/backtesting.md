# Backtesting

The backtest layer turns a `Strategy` plus a `BarSeries` into a `TradingRecord`; this file covers the drivers, the trade/position model, cost and execution models, and the realism checks that decide whether a result means anything.

## Choosing a driver

| Situation | Use |
| --- | --- |
| One strategy, one historical series | `BarSeriesManager` |
| Many strategies / parameter sweep, ranking, telemetry | `BacktestExecutor` |
| Broker-confirmed fills, delayed confirms, venue-specific lot matching | Manual loop + `BaseTradingRecord.operate(fill)` |
| Slippage or pending-order semantics | A `TradeExecutionModel` variant on either driver |

## BarSeriesManager

```java
import org.ta4j.core.backtest.BarSeriesManager;
import org.ta4j.core.backtest.TradeOnNextOpenModel;
import org.ta4j.core.analysis.cost.LinearTransactionCostModel;
import org.ta4j.core.analysis.cost.LinearBorrowingCostModel;
import org.ta4j.core.analysis.cost.ZeroCostModel;

BarSeriesManager manager = new BarSeriesManager(
        series,
        new LinearTransactionCostModel(0.001),
        new ZeroCostModel(),
        new TradeOnNextOpenModel());
```

Constructors: `(series)`, `(series, tradeExecutionModel)`, `(series, transactionCostModel, holdingCostModel)`, `(series, transactionCostModel, holdingCostModel, tradeExecutionModel)`, and `(series, transactionCostModel, holdingCostModel, tradeExecutionModel, tradingRecordFactory)`. Defaults are `ZeroCostModel` on both cost slots and `TradeOnNextOpenModel`.

`run(...)` overloads — all return the populated `TradingRecord`:

```java
record = manager.run(strategy);
record = manager.run(strategy, TradeType.BUY, series.numFactory().one());
record = manager.run(strategy, TradeType.BUY, amount, startIndex, finishIndex);
record = manager.run(strategy, positionSizer);
record = manager.run(strategy, tradeType, positionSizer, startIndex, finishIndex);
record = manager.run(strategy, myRecord, amount, series.getBeginIndex(), series.getEndIndex());
record = manager.run(strategy, myRecord, positionSizer, startIndex, finishIndex);
```

Supplying your own `TradingRecord` is how you pin a match policy, a start/end window, or recorded-fee behaviour; supplying a `TradingRecordFactory` in the constructor makes every *default* `run(...)` create that record shape instead:

```java
import org.ta4j.core.BaseTradingRecord;
import org.ta4j.core.ExecutionMatchPolicy;

BaseTradingRecord record = new BaseTradingRecord(
        strategy.getStartingType(),
        ExecutionMatchPolicy.FIFO,
        new ZeroCostModel(),
        new ZeroCostModel(),
        series.getBeginIndex(),
        series.getEndIndex());
manager.run(strategy, record, series.numFactory().one(),
        series.getBeginIndex(), series.getEndIndex());
```

Position sizing replaces the fixed `amount` argument: `org.ta4j.core.backtest.PositionSizer` has factories `fixed()`, `fixed(Number)`, `fixed(Num)`, `balance(Number principal)`, `balance(principal, BalanceRule)`, `kelly(principal, winProbability, payoffRatio[, coefficient])`, and the implementation `ProcessCapabilityPositionSizer` for sizing from process-capability statistics.

The run loop is one decision per bar: `tradeExecutionModel.onBar(i, record, series)` runs first (so pending orders progress even on signal-free bars), then `if (strategy.shouldOperate(i, record)) tradeExecutionModel.execute(i, record, series, amount)`. After the loop, `onRunEnd(lastProcessedIndex, record, series)` lets pending-order models settle. A position still open at the end stays open for criteria to mark to market or ignore — wrap the model in `new ExitOnRunEndModel(delegate)` to force a flat exit at the last close instead. Walk-forward folds always end flat.

## The record model

There is no `Order` class in ta4j core — the executable unit is a **`Trade`** (an entry or an exit), grouped into a **`Position`**, collected in a **`TradingRecord`**. A fill is a `TradeFill`.

```java
import org.ta4j.core.TradingRecord;
import org.ta4j.core.Position;
import org.ta4j.core.Trade;

record.getPositionCount();          // closed + currently open positions
record.getPositions();              // List<Position>
record.getCurrentPosition();        // canonical net-open view
record.getOpenPositions();          // one snapshot per remaining lot
record.getTrades();                 // List<Trade>, entries and exits interleaved
record.getLastEntry(); record.getLastExit();
record.getTotalFees(); record.getRecordedTotalFees();

Position p = record.getCurrentPosition();
p.isNew(); p.isOpened(); p.isClosed(); p.isProfitable();
p.getEntry(); p.getExit(); p.amount(); p.averageEntryPrice();
p.getProfit(); p.getProfit(finalIndex, finalPrice); p.getGrossProfit(finalPrice);
p.getHoldingCost(finalIndex);
```

`Trade` exposes `getType()`, `getIndex()`, `getPricePerAsset()`, `getNetPrice()`, `getAmount()`, `getValue()`, `getCost()`, `getTime()`, `isBuy()`, `isSell()`, `getFills()`. `getStartIndex()`/`getEndIndex()` on the record return `Integer` and are null unless the record was bounded.

`ExecutionMatchPolicy` (`org.ta4j.core`) selects lot matching when partial fills arrive: `FIFO`, `LIFO`, `AVG_COST`.

Fill-driven replay — the path for broker-confirmed executions and partial fills — bypasses signal evaluation entirely:

```java
import org.ta4j.core.BaseTradingRecord;
import org.ta4j.core.ExecutionSide;
import org.ta4j.core.TradeFill;
import org.ta4j.core.Trade;

BaseTradingRecord record = new BaseTradingRecord(strategy.getStartingType());
record.operate(new TradeFill(42, Instant.parse("2025-01-02T10:15:00Z"),
        series.numFactory().numOf("42100"), series.numFactory().numOf("0.50"),
        series.numFactory().numOf("4.21"), ExecutionSide.BUY, "order-42", "decision-42"));

// several fills for one logical order: group first, then operate
record.operate(Trade.fromFills(TradeType.BUY, fills));
```

`enter(index, price, amount)` / `exit(index, price, amount)` are the manual-loop equivalents; `Trade.buyAt(...)` / `Trade.sellAt(...)` build trades without hand-rolling fills.

## Cost models (`org.ta4j.core.analysis.cost`)

`CostModel` has `Num calculate(Position, int finalIndex)`, `Num calculate(Position)`, `Num calculate(Num price, Num amount)`. Implementations:

| Class | Ctor | Use |
| --- | --- | --- |
| `ZeroCostModel` | `()` | default; no fees |
| `LinearTransactionCostModel` | `(double feePerPosition)` | proportional commission |
| `FixedTransactionCostModel` | `(double feePerTrade)` | flat per-trade fee |
| `LinearBorrowingCostModel` | `(double feePerPeriod)`, `(double feePerPeriod, Applicability)` | funding/borrow; `Applicability.SHORT_ONLY` (default), `LONG_ONLY`, `BOTH` |
| `RecordedTradeCostModel` | `INSTANCE` | replays fees already recorded on a fill instead of re-estimating |

`LinearBorrowingCostModel` defaults to short-only. When the venue charges funding on long exposure too, pass `Applicability.BOTH` explicitly — leaving the default silently understates long-holding costs.

## Execution models (`org.ta4j.core.backtest`)

| Model | Fill timing | Watch for |
| --- | --- | --- |
| `TradeOnNextOpenModel` | signal at bar `t`, fill at bar `t+1` open (default) | underestimates fast-close fills; needs a next bar to exist |
| `TradeOnCurrentCloseModel` | signal and fill on the current close | only realistic if you can actually transact at the close |
| `SlippageExecutionModel` | either of the above plus directional slippage | `(Num slippageRatio)` or `(Num slippageRatio, PriceSource)`; slippage can dominate PnL |
| `StopLimitExecutionModel` | pending stop-limit lifecycle: partial fills, expiries, reject metadata | `(Num stopTriggerRatio, Num limitOffsetRatio, Num maxBarParticipation, int maxBarsToFill[, PriceSource])`; ratios in `[0,1)`, participation in `(0,1]`, TTL `>= 1` |
| `ExitOnRunEndModel` | wraps a delegate and closes the open position at the last close | use when a run must end flat |

`TradeExecutionModel.PriceSource` is `CURRENT_CLOSE` or `NEXT_OPEN`. The interface is `onBar(int, TradingRecord, BarSeries)`, `execute(int, TradingRecord, BarSeries, Num amount)`, `onRunEnd(int, TradingRecord[, BarSeries])`, `estimateEntryTarget(int, BarSeries, TradeType)`; immediate-fill models leave the hooks as no-ops, pending-order models do their per-bar work there.

`StopLimitExecutionModel` is the only built-in that models partial fills from a signal: it fills at most `maxBarParticipation` of the bar per bar and expires the remainder after `maxBarsToFill`. Interpret rejects and unfilled residuals explicitly rather than reading the resulting position as fully filled.

## BacktestExecutor

```java
import org.ta4j.core.backtest.BacktestExecutor;
import org.ta4j.core.backtest.BacktestExecutionResult;
import org.ta4j.core.backtest.ProgressCompletion;
import org.ta4j.core.backtest.TradingStatementExecutionResult.WeightedCriterion;
import org.ta4j.core.reports.TradingStatement;

BacktestExecutor executor = new BacktestExecutor(series, new SlippageExecutionModel(series.numFactory().numOf("0.0005")));
BacktestExecutionResult result = executor.executeWithRuntimeReport(
        strategies, series.numFactory().one(), Trade.TradeType.BUY,
        ProgressCompletion.logging("backtest.sweep"));

List<TradingStatement> top = result.getTopStrategiesWeighted(20,
        WeightedCriterion.of(new NetProfitCriterion(), 7.0),
        WeightedCriterion.of(new ReturnOverMaxDrawdownCriterion(), 3.0));
```

Constructors take `(series)`, `(series, tradeExecutionModel)`, `(series, transactionCostModel, holdingCostModel, …)`, `(series, TradingStatementGenerator[, …])`, or a preconfigured `(BarSeriesManager)` — pass the manager when a custom `TradingRecordFactory` must flow through every batch run.

Ranking styles: `getTopStrategies(int, AnalysisCriterion...)` for lexicographic ranking, `getTopStrategiesWeighted(int, WeightedCriterion...)` for normalized weighted scoring across incomparable metrics, and `executeAndKeepTopK(strategies, amount, tradeType, criterion, topK, progressCallback)` for streaming top-K when materializing every statement is too expensive. `executeWithRuntimeReport` also has a `parallelism` overload for large candidate sets; `BacktestRuntimeReport` carries the telemetry.

Unlike `BarSeriesManager`, `BacktestExecutor` fails if the evaluated window changes mid-run, so use it whenever a result must be tied to one immutable data window.

## Realism checks

**Data.** Symbol mapping and timeframe explicit; timezone/session boundaries match the target venue; missing and duplicate bars handled deterministically; corporate actions and regime shifts accounted for.

**Warmup and look-ahead.** Enforce warmup with `strategy.setUnstableBars(n)`. No indicator may read past the current bar — check any custom indicator against `PreviousValueIndicator` misuse, and confirm a rolling window uses `[i-n+1, i]`, not `[i-n, i+1]`. Understand `setMaximumBarCount` eviction before evaluating criteria on a moving series.

**Execution.** The execution model matches what you claim to simulate (next-open vs current-close is the single largest silent difference). Fee and holding-cost models reflect expected conditions, not zero. Order sizing is explicit and reproducible — a fixed `amount` is a different strategy from a sizer. Partial-fill semantics tested if they matter for deployment.

**Evaluation discipline.** At least one return metric and one risk metric; rankings justified as single-criterion or weighted; sensitivity to small parameter changes inspected; a baseline exists (`EnterAndHoldCriterion`, or a simpler strategy).

**Out-of-sample.** Holdout or walk-forward validation; no train/test leakage; promotion criteria stable across regimes.

**Reproducibility.** Data range and source, strategy parameters, execution assumptions, and the backtest command all recorded and rerunnable; key metrics captured for regression comparison.

## Pitfalls

- **Default execution is next-open.** Switching to `TradeOnCurrentCloseModel` usually raises reported returns without any strategy change — quote which model produced a number.
- **Zero cost by default.** Both cost slots are `ZeroCostModel` unless you pass them, so a high-turnover strategy can look profitable purely from free trading.
- **`LinearBorrowingCostModel` is short-only by default** — long funding costs are invisible until you pass `Applicability.BOTH`.
- **An open position at the end is not closed.** Criteria either mark it to market or ignore it (`OpenPositionHandling`); if the leaderboard depends on it, use `ExitOnRunEndModel`.
- **`getOpenPositions()` vs `getCurrentPosition()`** answer different questions (per-lot vs net); mixing them across criteria double-counts exposure.
- **Reusing a `TradingRecord` across runs** leaks state; the default factory creates a fresh one precisely to avoid this — a custom factory must too.
- **`BarSeriesManager` has no `calculatePosition(...)` method** in 0.28.x; per-position profit comes from `Position.getProfit()`, and `calculatePosition(Position)` exists only as a protected hook on `AbstractPnlCriterion`.
- **A shared mutable series invalidates a batch** — `BarSeriesManager` observes bars as they change under a concurrent series; use `BacktestExecutor` when you want that to be a hard failure.
- **Replaying fills with `enter`/`exit` loses fill detail** — use `operate(TradeFill)` / `Trade.fromFills(...)` so recorded fees and lot counts survive.

Upstream: [Backtesting](https://ta4j.github.io/ta4j-wiki/Backtesting.html), [Backtesting realism checklist](https://ta4j.github.io/ta4j-wiki/Backtesting-Realism-Checklist.html), [Execution decision matrix](https://ta4j.github.io/ta4j-wiki/Execution-Decision-Matrix.html), [backtest package](https://github.com/ta4j/ta4j/tree/master/ta4j-core/src/main/java/org/ta4j/core/backtest).

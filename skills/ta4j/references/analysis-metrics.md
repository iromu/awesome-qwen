# Analysis Criteria & Metrics

Criteria turn a `TradingRecord` into numbers; this file covers the `AnalysisCriterion` contract, the catalog by group, buy-and-hold baselines, bounded/windowed evaluation, and walk-forward validation.

## The AnalysisCriterion contract

```java
import org.ta4j.core.AnalysisCriterion;
import org.ta4j.core.BarSeries;
import org.ta4j.core.TradingRecord;
import org.ta4j.core.Position;

public interface AnalysisCriterion {
    Num calculate(BarSeries series, Position position);        // per-position view
    Num calculate(BarSeries series, TradingRecord tradingRecord); // whole-run view
    default Num calculate(BarSeries s, TradingRecord r, AnalysisWindow window);
    default Num calculate(BarSeries s, TradingRecord r, AnalysisWindow window, AnalysisContext context);
    default Strategy chooseBest(BarSeriesManager manager, List<Strategy> strategies);
    default String toJson();  static AnalysisCriterion fromJson(String json);
}
```

Evaluate the whole-run pair (`series`, `record`) for anything aggregate; the `Position` overload scores a single trade. Return `Num` values come from the series' own `NumFactory`, so keep one factory per study and compare with `Num` methods rather than `doubleValue()` where precision matters. Custom criteria extend `org.ta4j.core.criteria.AbstractAnalysisCriterion` and implement the two `calculate` methods.

## Criteria catalog

**Return & P&L** (`org.ta4j.core.criteria.pnl`) — every metric has a `Gross*` (pre-cost) and `Net*` (post-cost) form; comparing a Net strategy number against a Gross baseline silently credits the strategy with avoided fees.

| Class | One-liner |
| --- | --- |
| `GrossReturnCriterion` / `NetReturnCriterion` | total growth factor over the run |
| `GrossProfitCriterion` / `NetProfitCriterion` | sum of winning positions only |
| `GrossLossCriterion` / `NetLossCriterion` | sum of losing positions only |
| `GrossProfitLossCriterion` / `NetProfitLossCriterion` | profit minus loss |
| `*ProfitLossPercentageCriterion` | the same as a percentage of invested capital |
| `*ProfitLossRatioCriterion` | profit/loss ratio (profit factor) |
| `*AverageProfitCriterion` / `*AverageLossCriterion` | mean winner / mean loser |
| `MaxConsecutiveProfitCriterion` / `MaxConsecutiveLossCriterion` | longest win/loss streak of positions |
| `MaxPositionNetProfitCriterion` / `MaxPositionNetLossCriterion` | single best/worst position |

**Risk** (`org.ta4j.core.criteria`, `criteria.risk`, `criteria.drawdown`) — all take the whole record.

| Class | One-liner |
| --- | --- |
| `MaximumDrawdownCriterion` | largest peak-to-trough equity decline; `(EquityCurveMode[, OpenPositionHandling])` |
| `MaximumAbsoluteDrawdownCriterion` | same in absolute currency rather than fraction |
| `MaximumDrawdownBarLengthCriterion` | how many bars the worst drawdown lasted |
| `ReturnOverMaxDrawdownCriterion` | return divided by max drawdown (RoMaD) |
| `MonteCarloMaximumDrawdownCriterion` | resampled drawdown distribution; `(iterations, pathBlocks, seed, Statistics[, …])` |
| `SharpeRatioCriterion` | excess return over volatility; `(double annualRiskFreeRate, SamplingFrequency, Annualization, ZoneOffset)` |
| `SortinoRatioCriterion` | same with downside deviation only; same constructor shape |
| `CalmarRatioCriterion` | annualized return over max drawdown; `(ReturnRepresentation)` or `(EquityCurveMode)` |
| `OmegaRatioCriterion` | upside vs downside return mass around a threshold; `(double threshold)` |
| `ValueAtRiskCriterion` | `(Double confidence[, ReturnRepresentation])` — tail loss at a confidence level |
| `ExpectedShortfallCriterion` | mean loss beyond the VaR threshold |
| `SqnCriterion` | System Quality Number; `(AnalysisCriterion[, Integer nPositions])` |
| `RMultipleCriterion` | profit per unit of risk; `(PositionRiskModel)`, e.g. `new RMultipleCriterion(new StopLossPositionRiskModel(5))` |
| `ProcessCapabilityCriterion` | process-capability style stability of the return distribution |

**Trade statistics** (`org.ta4j.core.criteria`):
`NumberOfPositionsCriterion`, `NumberOfWinningPositionsCriterion`, `NumberOfLosingPositionsCriterion`, `NumberOfBreakEvenPositionsCriterion`, `NumberOfConsecutivePositionsCriterion(AnalysisCriterion.PositionFilter)` (`PROFIT`/`LOSS`), `PositionsRatioCriterion` (win/loss count ratio), `ExpectancyCriterion` (expected value per trade), `InPositionPercentageCriterion` (share of bars in the market — a low value means the metric is measured on a thin sample), `NumberOfBarsCriterion`, `AverageReturnPerBarCriterion`, `PositionDurationCriterion([Statistics])` where `Statistics` is `MEDIAN, P95, P99, MEAN, MIN, MAX`.

**Costs & fees** (`org.ta4j.core.criteria.commissions`, `criteria`):
`TotalFeesCriterion` reads fees already recorded on fills/trades rather than re-estimating from a cost model; `CommissionsCriterion` reports model-estimated commissions; `CommissionsImpactPercentageCriterion([ReturnRepresentation])` expresses fees as a share of profit — the fastest check that a strategy is a fee generator; `LinearTransactionCostCriterion(initialAmount, a[, b])` models a linear fee schedule independently of the backtest.

**Open exposure**: `OpenPositionCostBasisCriterion`, `OpenPositionUnrealizedProfitCriterion` — needed whenever the record may end with an open position.

**Distribution helpers** (`org.ta4j.core.criteria.helpers`): `AverageCriterion`, `StandardDeviationCriterion`, `RelativeStandardDeviationCriterion`, `VarianceCriterion`, `StandardErrorCriterion` — wrap another criterion to aggregate per-position values.

Risk-adjusted criteria share deliberate knobs; pick them rather than accepting defaults:
`SamplingFrequency` = `BAR | SECOND | MINUTE | HOUR | DAY | WEEK | MONTH | TRADE` (`TRADE` gives one observation per included position and is rejected by bar-index helpers such as `SamplingFrequencyIndexes`); `Annualization` = `PERIOD | ANNUALIZED`; `EquityCurveMode` = `MARK_TO_MARKET | REALIZED`; `OpenPositionHandling` = `MARK_TO_MARKET | IGNORE`; `ReturnRepresentation` = `MULTIPLICATIVE | DECIMAL | PERCENTAGE | LOG`.

```java
import org.ta4j.core.criteria.SharpeRatioCriterion;
import org.ta4j.core.analysis.frequency.SamplingFrequency;
import org.ta4j.core.criteria.Annualization;
import java.time.ZoneOffset;

AnalysisCriterion sharpe  = new SharpeRatioCriterion(0.05, SamplingFrequency.DAY,   Annualization.ANNUALIZED, ZoneOffset.UTC);
AnalysisCriterion perTrade = new SharpeRatioCriterion(0.05, SamplingFrequency.TRADE, Annualization.PERIOD,     ZoneOffset.UTC);
Num score = sharpe.calculate(series, tradingRecord);
```

## Buy-and-hold baseline

`EnterAndHoldCriterion` simulates a single position opened at the start and closed at the end, then applies the wrapped criterion to it; the `Versus*` variants return the strategy metric minus the baseline.

```java
import org.ta4j.core.criteria.EnterAndHoldCriterion;
import org.ta4j.core.criteria.VersusEnterAndHoldCriterion;
import org.ta4j.core.criteria.pnl.NetReturnCriterion;
import org.ta4j.core.Trade.TradeType;

Num hold   = new EnterAndHoldCriterion(TradeType.BUY, new NetReturnCriterion())
                 .calculate(series, tradingRecord);
Num active = new VersusEnterAndHoldCriterion(TradeType.BUY, new NetReturnCriterion())
                 .calculate(series, tradingRecord);   // strategy minus hold
```

Constructors are `(criterion)`, `(TradeType, criterion)`, `(TradeType, criterion, BigDecimal amount)`; `ActiveReturnCriterion` and `ActiveReturnVersusEnterAndHoldCriterion` are the active-return forms. Every leaderboard number should be quoted against a hold baseline — a strategy that beats nothing in a rising series has not earned its complexity.

## Bounded records and windows

`BaseTradingRecord` accepts optional bounds so a record can represent a slice without copying it:

```java
BaseTradingRecord bounded = new BaseTradingRecord(
        TradeType.BUY, ExecutionMatchPolicy.FIFO,
        new ZeroCostModel(), new ZeroCostModel(),
        startIndex, endIndex);          // Integer, nullable
```

`getStartIndex()` / `getEndIndex()` return those bounds (`null` = unbounded), and `getContainedPositions(series)` returns only the positions falling inside them, resolving the bounds against the series. Use this to slice a record once and reuse the slice across many criteria instead of trimming the series.

For a *query-time* slice, prefer the window API over hand-copying:

```java
import org.ta4j.core.analysis.AnalysisWindow;
import org.ta4j.core.analysis.AnalysisContext;
import org.ta4j.core.analysis.OpenPositionHandling;

AnalysisWindow window = AnalysisWindow.lookbackBars(120);
AnalysisContext ctx = AnalysisContext.defaults()
        .withMissingHistoryPolicy(AnalysisContext.MissingHistoryPolicy.CLAMP)
        .withPositionInclusionPolicy(AnalysisContext.PositionInclusionPolicy.FULLY_CONTAINED)
        .withOpenPositionHandling(OpenPositionHandling.MARK_TO_MARKET);

Num recentSharpe = sharpe.calculate(series, tradingRecord, window, ctx);
```

Windows: `barRange(startInclusive, endInclusive)`, `lookbackBars(barCount)`, `timeRange(startInclusive, endExclusive)`, `lookbackDuration(Duration)`. Inclusion policies decide what a window contains:
- `MissingHistoryPolicy.STRICT` fails fast when the requested lookback is no longer available; `CLAMP` intersects with what the series still holds — the right choice for dashboards over a `setMaximumBarCount` series, the wrong one for a research number (it silently shrinks the sample).
- `PositionInclusionPolicy.EXIT_IN_WINDOW` counts a position whose exit lands in the window; `FULLY_CONTAINED` requires entry and exit inside, so a trade straddling the boundary is not double-counted across adjacent windows.
- `OpenPositionHandling.MARK_TO_MARKET` values a position still open at the window end; `IGNORE` drops it. `AnalysisContext.defaults()` is `STRICT / EXIT_IN_WINDOW / IGNORE`.

## Walk-forward basics

```java
import org.ta4j.core.walkforward.WalkForwardConfig;
import org.ta4j.core.backtest.StrategyWalkForwardExecutionResult;

WalkForwardConfig config = WalkForwardConfig.defaultConfig(series);
StrategyWalkForwardExecutionResult wf = new BarSeriesManager(series).runWalkForward(strategy, config);

List<Num> oos = wf.outOfSampleCriterionValues(new GrossReturnCriterion());
Optional<Num> holdout = wf.holdoutCriterionValue(new NetReturnCriterion());
```

`WalkForwardConfig` is a record — `(minTrainBars, testBars, stepBars, purgeBars, embargoBars, holdoutBars, primaryHorizonBars, reportingHorizons, optimizationTopK, reportingTopKs, seed)`; defaults are 120/40/20/1/1/40/15, `[7,30]`, K=3, `[1,5]`, seed 42. `defaultConfig(series)` derives geometry from series length deterministically. Keep one config fixed for every candidate in a comparison — changing fold geometry between candidates makes the ranking meaningless. `BacktestExecutor.executeWithWalkForward(strategy, config)` returns the standard backtest and the walk-forward result together (`executeWalkForward(...)` returns just the folds).

The generic `org.ta4j.core.walkforward` package handles non-`Strategy` candidates (signal generators, scenario scorers): `WalkForwardEngine<C,P,O>(WalkForwardSplitter, PredictionProvider<C,P>, OutcomeLabeler<P,O>, List<WalkForwardMetric<P,O>>[, …])` driven by `run(series, context, config, candidateId, metadata)`; `AnchoredExpandingWalkForwardSplitter` for anchored expanding splits; metrics from `WalkForwardMetric.topKHitRate(name, k, BiPredicate)`, `.brierScore(name, rank, Function)`, `.logLoss(...)`, `.ndcg(...)`, `.binaryF1(...)`; `WalkForwardTuner(engine, objective, keepTopK, …).tune(series, List<WalkForwardCandidate<C>>, …)` ranks candidates under `WalkForwardObjective.weighted(metricWeights, minimumMetricValues, …)`, with `WalkForwardHoldoutValidator` for the final untouched check. The engine records leakage-audit rows per decision/horizon pair and skips labels whose future window would cross the fold boundary.

Guardrails: use purge and embargo bars whenever indicators or labels can leak neighbouring information; reserve holdout bars for the final gate; promote on out-of-sample metrics, never on the initial in-sample backtest.

## Pitfalls

- **Gross vs Net mismatch** is the most common self-congratulation bug — rank strategies on Net criteria and compare Net to Net.
- **`OpenPositionHandling.IGNORE` (the default) discards the open position**, so a strategy that ends mid-trade scores as if it had never taken it.
- **`CLAMP` hides missing history** — use `STRICT` in research, `CLAMP` only for live dashboards on an evicting series.
- **`EXIT_IN_WINDOW` double-counts straddling trades** across adjacent windows; use `FULLY_CONTAINED` for per-window attribution.
- **`SamplingFrequency.TRADE` is rejected by `SamplingFrequencyIndexes`** — bar-index helpers cannot see positions, so trade-level sampling belongs to Sharpe/Sortino only.
- **Annualizing a per-period ratio twice** (an already-annualized input with `Annualization.ANNUALIZED`) inflates the ratio by √periods; state which one you used.
- **`InPositionPercentageCriterion` first**: a 3.5 Sharpe over nine trades is noise, not edge.
- **`RMultipleCriterion` skips positions** whose `PositionRiskModel` cannot produce a positive risk — verify the skip rate before trusting the average R.
- **Criteria read the record, not the execution model** — `TotalFeesCriterion` reports recorded fees, so a replay built with `ZeroCostModel` legitimately reports zero.
- **`chooseBest(manager, strategies)` uses the manager's execution and cost models** — a leaderboard inherits every execution assumption configured there.

Upstream: [Analysis criteria and risk metrics](https://ta4j.github.io/ta4j-wiki/Analysis-Criteria-and-Risk-Metrics.html), [Walk-forward research](https://ta4j.github.io/ta4j-wiki/Walk-Forward-Research.html), [criteria package](https://github.com/ta4j/ta4j/tree/master/ta4j-core/src/main/java/org/ta4j/core/criteria), [walkforward package](https://github.com/ta4j/ta4j/tree/master/ta4j-core/src/main/java/org/ta4j/core/walkforward).

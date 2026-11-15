# Static Portfolio Backtests and Correlation / Lead-Lag Research

Run a target-weight multi-asset backtest and measure how assets and signals actually relate — correlation, lag, shape distance, event agreement — before committing to an allocation.

Packages `org.ta4j.core.portfolio` and `org.ta4j.core.indicators.statistics` (ta4j 0.28.x, Java 25+). Docs: <https://ta4j.github.io/ta4j-wiki/Portfolio-Backtesting.html>, <https://github.com/ta4j/ta4j/blob/master/README.md>.

## Static portfolio backtest

One `PortfolioSeries` supplies asset order, alignment, and the numeric domain for accounting, correlations, the optimizer, and reports, so a prepared window cannot drift between stages.

```java
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.ta4j.core.BarSeries;
import org.ta4j.core.analysis.cost.LinearTransactionCostModel;   // org.ta4j.core.analysis.cost
import org.ta4j.core.portfolio.PortfolioAllocation;
import org.ta4j.core.portfolio.PortfolioExecutionResult;
import org.ta4j.core.portfolio.PortfolioSeries;
import org.ta4j.core.portfolio.PortfolioSeriesManager;
import org.ta4j.core.portfolio.RebalancePolicy;

Map<String, BarSeries> assets = new LinkedHashMap<>();   // encounter order fixes asset/matrix order
assets.put("EQUITY", equitySeries);
assets.put("BONDS", bondSeries);
assets.put("COMMODITIES", commoditySeries);
PortfolioSeries portfolio = new PortfolioSeries(assets);  // also (BarSeries...) and (List<BarSeries>)

Map<String, Double> weights = new LinkedHashMap<>();
weights.put("EQUITY", 0.60);
weights.put("BONDS", 0.30);
weights.put("COMMODITIES", 0.05);                         // sums to 0.95 -> 0.05 cash sleeve
PortfolioAllocation allocation = new PortfolioAllocation(weights);

PortfolioSeriesManager manager = new PortfolioSeriesManager(portfolio, new LinearTransactionCostModel(0.001));
PortfolioExecutionResult result = manager.run(allocation, portfolio.numFactory().numOf("10000"),
        RebalancePolicy.onIndexes(Set.of(0, 21, 42, 63)));
// result.getFinalValue(), getTotalReturn(), getTotalTransactionCost(), getTotalTurnover(), getFinalWeights()
```

`PortfolioSeries` snapshots its inputs once and keeps only bar end times present in **every** source — missing bars are excluded, never forward-filled. Names must be nonblank and unique, every source must share at least one end time, duplicate end times inside one source are rejected, portfolio indexes start at zero, and `getSourceIndex(asset, i)` maps back to the source index. Useful accessors: `getAssets()`, `numFactory()`, `getBeginIndex()`, `getEndIndex()`, `getBarCount()`, `getEndTimes()`, `getBarSeries(asset)`, `getBar(asset, i)`, `getClosePrice(asset, i)`. Do the currency conversion, calendar join, or intentional carry-forward **before** construction — strict alignment will not invent that policy. Normalize daily data to one convention (e.g. UTC dates) first.

**Cash sleeve.** Explicit weights below 1 leave the remainder in cash: `allocation.getTotalWeight()` and `getCashWeight()` report it, and `getTargetWeight(name)` returns zero for an unallocated asset. `new PortfolioAllocation(List.of(new WeightedValue<>("EQUITY", numFactory.two()), ...))` (`org.ta4j.core.analysis.WeightedValue`) normalizes to full investment instead — no cash. Weights must be finite, non-negative, and sum to at most one; map values may be any `Number`, including `BigDecimal`, converted through the portfolio's `NumFactory`.

**Rebalancing.** `run(allocation, initialCash)` invests at the first aligned bar and holds. A supplied policy schedules **every** trade, including the initial one: `onIndexes(Set.of(3))` stays in cash through bar 2; `RebalancePolicy.atStart().or(RebalancePolicy.onIndexes(Set.of(3)))` invests at bar 0 and rebalances at bar 3. Available: `atStart()`, `everyBar()`, `everyNthBar(n)` (counts retained bars, not calendar months), `onIndexes(Set<Integer>)` / `onIndexes(int...)`, `firstBarOf(ChronoUnit.MONTHS, ZoneOffset.UTC)` (uses aligned timestamps), `whenDriftExceeds(0.03)`; compose with `or(...)` / `and(...)`. `RebalancePolicy` is a functional interface receiving a `Context` (`getIndex()`, `getEndTime()`, `getPortfolioValue()`, `getAssetWeight(a)`, `getTargetWeight(a)`, `getCashWeight()`, `getMaxDrift()`), so a custom schedule is a lambda.

Execution is long-only with fractional units; buys/sells are reduced or skipped when a fixed or step-like cost would drive cash negative, and invalid costs are rejected. Any ta4j `CostModel` works — `LinearTransactionCostModel(0.001)` charges 10 bps of traded notional.

**Snapshots.** Iterate `result.getSnapshots()` (or `getSnapshots(status)`, `getRebalanceCount(status)`); each `PortfolioSnapshot` gives `getIndex()`, `getEndTime()`, `getPrices()`, `getHoldings()`, `getCash()`, `getPortfolioValue()`, `getPeriodReturn()` (net of costs), `getTransactionCost()`, `getTradedNotional()`, `getTurnover()`, `getAssetValue(a)`, `getAssetWeight(a)`, `getAssetWeights()`, `getCashWeight()`, `getRebalanceStatus()` → `PortfolioSnapshot.RebalanceStatus.NOT_SCHEDULED | COMPLETED | PARTIAL | SKIPPED`. `PARTIAL`/`SKIPPED` is where cost or cash constraints silently defeated a rebalance — count them before trusting a backtest.

**Feed the curve to criteria.** `result.toPortfolioValueSeries("portfolio-value")` (or `toPortfolioValueSeries()`) exports an ordinary `BarSeries` for `ClosePriceIndicator`, `MaxDrawdownCriterion`, etc. It starts with the initial capital before the first aligned bar, so return and drawdown criteria include the initial trading fees.

## Correlations, hierarchy, minimum variance

```java
import org.ta4j.core.indicators.statistics.SampleType;                     // SAMPLE | POPULATION
import org.ta4j.core.num.Num;
import org.ta4j.core.portfolio.PortfolioCorrelations;
import org.ta4j.core.portfolio.PortfolioCorrelations.CorrelationMatrix;    // nested types
import org.ta4j.core.portfolio.MinimumVarianceOptimizer;

PortfolioCorrelations correlations = new PortfolioCorrelations(portfolio);
CorrelationMatrix simpleReturns = correlations.getSimpleReturnMatrix();
CorrelationMatrix rolling = correlations.getSimpleReturnMatrix(60);
CorrelationMatrix historical = correlations.getLogReturnMatrix(decisionIndex, 120, SampleType.SAMPLE);
Num rho = historical.getCoefficient("EQUITY", "BONDS");
```

`getPriceMatrix`, `getSimpleReturnMatrix`, `getLogReturnMatrix` each take `()`, `(barCount)`, `(index, barCount)`, `(index, barCount, SampleType)`. Return windows count one-bar returns, so they need one earlier price than a price window of the same `barCount`. `matrix.isStable()` says whether the requested index has a complete transform *and* window; unavailable off-diagonals are `NaN`. `getValues()`, `getPairs()` (`CorrelationPair`: `getFirstAsset`, `getSecondAsset`, `getCoefficient`, `getAbsoluteCoefficient`), `getAssets()`, `getIndex()`, `getBarCount()`, `getSampleType()`, `getCountOfUnstableBars()` complete the view. Compare price and return correlations — jointly trending price levels flatter price-based "diversification".

```java
for (PortfolioCorrelations.ClusterMerge merge : simpleReturns.completeLinkage().getMerges()) {
    System.out.printf("%d + %d d=%s size=%d%n",
            merge.getLeftClusterIndex(), merge.getRightClusterIndex(), merge.getDistance(), merge.getSize());
}
List<String> leafOrder = simpleReturns.completeLinkage().getLeafOrder();
```

`completeLinkage()` matches `scipy.cluster.hierarchy.linkage(matrix, method="complete")`: rows are complete correlation rows, row distance is Euclidean, cluster distance is the maximum pairwise row distance; leaves are indexes `0..n-1` and each merge takes the next index. A matrix containing `NaN` or infinite coefficients is rejected rather than clustered.

```java
import org.ta4j.core.portfolio.MinimumVarianceOptimizer.CovarianceEstimator;

PortfolioAllocation pure = new MinimumVarianceOptimizer(portfolio).optimize();
PortfolioAllocation capped = new MinimumVarianceOptimizer(portfolio, 0.50).optimize();
PortfolioAllocation walkForward = new MinimumVarianceOptimizer(portfolio, decisionIndex, 120, 0.50)
        .withCovarianceEstimator(CovarianceEstimator.SAMPLE)   // default is Ledoit-Wolf shrinkage
        .optimize();
```

The optimizer estimates covariance from aligned one-bar simple returns, minimises variance subject to non-negative weights summing to one, and runs a deterministic bounded-simplex projected-gradient solver that tolerates singular covariance without inverting it. It rejects non-positive/non-finite prices, fewer than two return observations, infeasible caps (a 25% cap needs at least four assets), and non-convergence. `MinimumVarianceOptimizer(series, index, barCount, cap)` reads only through `index` — build a rolling loop that estimates at `i` and applies the weights at the execution moment your design specifies; estimating one full-history allocation and presenting it as a historical strategy is an in-sample description.

## Lead-lag, shape distance, event dependence

All four are deterministic; the question decides the lens. Association, not causation — validate causality out-of-sample.

```java
import org.ta4j.core.indicators.statistics.LeadLagCorrelationIndicator;
import org.ta4j.core.indicators.statistics.LeadLagCorrelationIndicator.LagSelectionPolicy;
import org.ta4j.core.indicators.statistics.DynamicTimeWarpingDistanceIndicator;
import org.ta4j.core.indicators.statistics.event.EventSynchronizationIndicator;
import org.ta4j.core.analysis.event.BinningStrategy;
import org.ta4j.core.analysis.event.EventMutualInformationConfig;            // org.ta4j.core.analysis.event
import org.ta4j.core.analysis.event.EventMutualInformationEvaluator;
import org.ta4j.core.analysis.event.EventMutualInformationResult;

LeadLagCorrelationIndicator leadLag = new LeadLagCorrelationIndicator(
        momentum, close, 32, 20, LagSelectionPolicy.MAXIMUM_ABSOLUTE_CORRELATION);
LeadLagCorrelationIndicator.Profile profile = leadLag.getProfile(lastIndex);
```

`LeadLagCorrelationIndicator(first, second, barCount, minimumLag, maximumLag, policy)` scans an inclusive lag range; the five-argument form searches `[-maximumLag, maximumLag]`. A **positive lag means the first indicator leads**. `MAXIMUM_CORRELATION` picks the highest signed value, `MAXIMUM_ABSOLUTE_CORRELATION` the highest magnitude (keeping the sign). `Profile` is a record: `points()` (one `Point(lag, correlation, sampleCount)` per lag, ascending — undefined lags are **retained** with `NaN` and count 0, so the curve is never silently trimmed; `Point.isDefined()`), `bestLags()` (all ties, ascending), `selectedLag()` (`OptionalInt`: smallest absolute lag, then smallest signed, so a `[-k, k]` tie resolves to `-k`), `selectedCorrelation()`. `getValue(index)` returns that scalar directly for rule use.

DTW compares **shape** when level, scale, and timing may be stretched: `new DynamicTimeWarpingDistanceIndicator(momentum, close, 32, DynamicTimeWarpingDistanceIndicator.Config.shapeComparison(5))`. That config bundles `SequenceNormalization.Z_SCORE` (shape only — two constant sequences score zero regardless of level), `LocalDistance.SQUARED`, `WarpingWindow.sakoeChiba(5)`, and `PathCostNormalization.BY_PATH_LENGTH`. Use `SequenceNormalization.NONE` when absolute level matters, `WarpingWindow.unconstrained()` only when you truly need full `O(W²)` warping. Cost is `O(W * min(W, 2r+1))` time, `O(W)` memory; the value is `NaN` until the window is complete. Radius 0 forces diagonal alignment.

`EventSynchronizationIndicator` scores two `Indicator<Boolean>` streams where events are sparse and near-coincident (only `Boolean.TRUE` counts):

```java
EventSynchronizationIndicator sync = new EventSynchronizationIndicator(
        belowZeroCrosses, swingHighConfirmation, barCount, 12, 12);   // or (predicted, reference, barCount, tol)
Num f1 = sync.getValue(lastIndex);
EventSynchronizationIndicator.Result r = sync.getResult(lastIndex);  // recomputed per call
```

The asymmetric form caps how far a prediction may lead (`maxLeadBars`) and lag (`maxLagBars`); a pair is eligible when `-maxLagBars <= referenceIndex - predictedIndex <= maxLeadBars`, so a **positive offset means the prediction leads**. Matching is lexicographic: maximum pairs, then minimum total absolute offset, then minimum worst offset, then earliest pair sequence. `r` exposes `predictedCount`, `referenceCount`, `matchedCount`, `falsePositives`, `falseNegatives`, `precision`, `recall`, `f1Score`, `matches()` (`predictedIndex`, `referenceIndex`, `offsetBars()`), `unmatchedPredictedIndexes`, `unmatchedReferenceIndexes`, `exactMatchCount`, `meanSignedOffset`, `meanAbsoluteOffset`, `medianSignedOffset`, `minSignedOffset`, `maxSignedOffset`, `windowAvailable()`. Only the closed trailing window `[index - barCount + 1, index]` participates — a late prediction cannot match a reference outside it, which is what keeps train and validation windows isolated; windows are never truncated, and the value is `NaN` until the window is fully in-domain. Both streams empty ⇒ all three metrics `NaN`; exactly one empty ⇒ that side is `NaN` and F1 is `0`. The matcher throws `IllegalArgumentException` above an 8M-cell alignment problem (`(predicted+1) * (reference+1) > 8_000_000`) — keep windows sparse.

`EventMutualInformationEvaluator` asks how much a continuous state reduces uncertainty about a future event:

```java
EventMutualInformationConfig config = new EventMutualInformationConfig(0, 3, 8, BinningStrategy.EQUAL_FREQUENCY);
EventMutualInformationResult mi = new EventMutualInformationEvaluator()
        .evaluate(momentum, swingHighConfirmation, startIndex, endIndex, config);
// mi.mutualInformationNats(), targetEntropyNats(), normalizedMutualInformation(),
// sampleCount(), positiveTargetCount(), positiveTargetRate(), effectiveBinCount()
```

A sample at `i` is positive when the target fires in `[i + targetWindowStartBars, i + targetWindowEndBars]` (`(0,0)` = own bar, `(1,3)` = next three bars); both offsets are non-negative and samples whose window would cross the evaluation range are excluded, so no target window leaks across a train/validation boundary. `BinningStrategy.EQUAL_WIDTH` mirrors `MutualInformationIndicator`; `EQUAL_FREQUENCY` never splits identical values, so read `effectiveBinCount()` — a constant predictor or constant target carries exactly zero MI, and a non-finite predictor sample makes the metrics `NaN` with `effectiveBinCount 0` rather than dropping the row. For a rolling indicator instead, use `MutualInformationIndicator` or `RegimeSegmentedCorrelationIndicator` (`org.ta4j.core.indicators.statistics`).

**Ranking candidates on these metrics.** `RelationshipObjectives` (`org.ta4j.core.research`) exposes each lens as a `ParameterResearch.ObjectiveFunction`, so signal parameters become searchable objectives with holdout validation:

```java
import org.ta4j.core.research.ParameterResearch;
import org.ta4j.core.research.ParameterResearch.ParameterResearchReport;   // nested records
import org.ta4j.core.research.ParameterResearch.SearchPlan;                // SearchPlan.grid(n)
import org.ta4j.core.research.RelationshipObjectives;

ParameterResearchReport report = ParameterResearch.builder(series)
        .integer("lookback", 1, 4)
        .candidate((window, params) -> crossings(window.series(), params.intValue("lookback")))
        .maximize(RelationshipObjectives.eventSynchronizationF1(ws -> referenceEvents(ws, 2), 12, 1))
        .search(SearchPlan.grid(10))
        .holdoutBarCount(15)
        .topK(2)
        .run();
```

Also available: `leadLagCorrelation(referenceBuilder, barCount, minimumLag, maximumLag)`, `dynamicTimeWarpingDistance(referenceBuilder, barCount, config)`, `eventMutualInformation(targetBuilder, config, useNormalized)`. Build every candidate and every reference **from the supplied window's series** (`window.series()`), never the outer series — capturing the outer series is exactly the leakage the holdout is meant to catch. `minimize(...)` is the counterpart (use it for DTW distance rather than negating a maximized score), and `holdoutFraction(...)`/`topK(...)` control independent validation of the training-selected candidates.

## Runnable examples

- `ta4jexamples.portfolio.StaticPortfolioBacktest`, `ta4jexamples.portfolio.PortfolioCorrelationAnalysis`, `ta4jexamples.portfolio.DiversifiedPortfolioAnalysis` (heatmaps, dendrograms, equal-weight vs min-variance vs capped allocations, `report.html`) — <https://github.com/ta4j/ta4j/tree/master/ta4j-examples/src/main/java/ta4jexamples/portfolio>
- `ta4jexamples.analysis.EventSynchronizationExample`, `ta4jexamples.analysis.LeadLagDtwEventAnalysisExample` — committed BTC fixture, no network.
- Charts: `ta4jexamples.charting.compose.PortfolioCorrelationChartFactory` — `createHeatmap(name, matrix)`, `createDendrogram(name, hierarchy)`.
- Adjusted data: `ta4jexamples.datasources.YahooFinanceHttpBarSeriesDataSource.loadAdjustedSeries("QQQ", YahooFinanceInterval.DAY_1, start, end)` applies yfinance-style adjustment ratios to OHLC and keeps volume; `loadSeries(...)` stays raw. Prefer adjusted prices — splits and distributions otherwise dominate price correlations.

## Pitfalls

- Trusting intersection alignment silently: a sparse asset can shrink the window to a handful of common bars. Check `getBarCount()` and `getEndTimes()` after construction.
- Expecting the policy to be *additional* rebalancing — the policy owns the initial investment too.
- Reading only `getTotalReturn()`: `PARTIAL`/`SKIPPED` rebalances mean the intended weights were never achieved; check `getRebalanceCount(...)` and `getFinalWeights()` against the target.
- One full-history minimum-variance allocation presented as a backtest; use the `(series, index, barCount, cap)` form inside a rolling loop.
- Infeasible weight caps (25% needs ≥ 4 assets) and fragile covariance from few observations — two return observations is already a hard rejection.
- Interpreting a lead/lag best lag as causality, or letting the best lag float: report the whole `points()` curve when it moves over time.
- Reading `selectedLag()` as an `int` — it is an `OptionalInt` and empty when no lag is defined.
- Dense Boolean streams in large windows blowing the 8M-cell event matcher; and matching ZigZag *pivot* bars instead of *confirmation* bars, which imports look-ahead into every score.
- Quoting `targetCoverage` from the conformal wrapper as a guarantee under regime shift.

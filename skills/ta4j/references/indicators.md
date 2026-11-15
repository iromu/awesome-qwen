# Indicator API, Helpers, Caching, and Custom Indicators

Everything ta4j computes — prices, oscillators, rules inputs — is an `Indicator`; this file covers the interface itself, the building-block helpers, the caching base classes, and how to write your own indicator correctly.

## The `Indicator<T>` interface

Package `org.ta4j.core` — `import org.ta4j.core.Indicator;`

| Member | Contract |
|---|---|
| `T getValue(int index)` | Value at an **absolute** bar index. The only calculation method; everything else derives from it. |
| `int getCountOfUnstableBars()` | Number of leading bars up to which the indicator computes wrong values (warm-up size). |
| `default boolean isStable()` | `getBarSeries().getBarCount() >= getCountOfUnstableBars()`. |
| `BarSeries getBarSeries()` | Backing series. |
| `default Stream<T> stream()` | All values over `beginIndex()..endIndex()`. |
| `static Double[] toDouble(Indicator<Num> ref, int index, int barCount)` | Window of values as doubles (minor precision loss for `DecimalNum`). |
| `default String toJson()` / `static Indicator<?> fromJson(BarSeries, String)` | Canonical JSON round-trip of type + numeric params + child indicators (0.19+). Restored custom classes must be resolvable on the classpath. |
| `default String toExpression()` / `static Indicator<?> fromExpression(BarSeries, String)` | Named shorthand such as `"RSI(SMA(14),9)"` (0.23.1+). |
| `default List<Indicator<?>> getDependencies()` | Direct source indicators, in evaluation order (0.24.2+); used for cache invalidation propagation. |

`Indicator<Num>` is the numeric workhorse; `Indicator<Boolean>` is the event/signal form (fractal confirmations, `UpTrendIndicator`, ZigZag pivot markers). There is **no** `isRemovingFutures()` on indicators or series in 0.28.x — that is a long-removed pre-0.14 API; use `BarSeries.getMaximumBarCount()` / retained-window semantics instead.

### Num values

Compute with `Num` arithmetic (`plus`, `minus`, `multipliedBy`, `isGreaterThan`, …) and create constants through the series factory so `DoubleNum` and `DecimalNum` series both work:

```java
import org.ta4j.core.num.Num;
Num zero = series.numFactory().zero();
Num two  = series.numFactory().numOf("2.0"); // string form preserves DecimalNum precision
```

Keep thresholds as `Num`, not raw doubles, when a strategy may run on either numeric type.

## Helper indicators (`org.ta4j.core.indicators.helpers`)

The primitives every other indicator (and most rules) are built from:

| Class(constructor) | Returns / use |
|---|---|
| `ClosePriceIndicator(series)`, `OpenPriceIndicator`, `HighPriceIndicator`, `LowPriceIndicator` | Per-bar OHLC; the default input for averages, RSI, etc. |
| `VolumeIndicator(series)` / `(series, barCount)` | Bar volume (optional smoothing window). |
| `TypicalPriceIndicator(series)`, `MedianPriceIndicator(series)` | `(H+L+C)/3`, `(H+L)/2` — inputs for CCI, Awesome Oscillator. |
| `CloseLocationValueIndicator(series)` | CLV in −1..+1: where close sits in the bar range (A/D, CMF input). |
| `TRIndicator(series)` | True range `max(H−L, |H−prevC|, |L−prevC|)`; input to ATR. |
| `GainIndicator(src)`, `LossIndicator(src)` | Positive changes / absolute negative changes (RSI ingredients). |
| `DifferenceIndicator(src)` / `(left, right)`, `ClosePriceDifferenceIndicator(series)`, `ClosePriceRatioIndicator` | Consecutive or pairwise differences/ratios. |
| `DifferencePercentageIndicator`, `PercentageChangeIndicator(src[, threshold])` | Percentage change with optional noise threshold. |
| `HighestValueIndicator(src, barCount)`, `LowestValueIndicator(src, barCount)` | Rolling extrema (Donchian, stochastic building blocks). |
| `PreviousValueIndicator(src)` / `(src, n)` | Value shifted back `n` bars — the causal way to build "context before the pattern" windows. |
| `SumIndicator(a, b, ...)`, `AverageIndicator(a, b, ...)` | Elementwise sum/mean of **several indicators** (varargs), not a rolling window. |
| `RunningTotalIndicator(src, barCount)` | Rolling running total of one indicator over the window. |
| `StreakIndicator(src, ...)`, `PercentRankIndicator(src, barCount)` | Consecutive up/down counts; percentile rank in window (Connors-RSI ingredient). |
| `ConstantIndicator(series, t)`, `FixedNumIndicator(series, ...)` / `NumIndicator`, `FixedBooleanIndicator`, `AmountIndicator` | Constant/wrapped-value indicators — thresholds and test fixtures. |
| `BooleanTransformIndicator` | Numeric → Boolean via comparison mode. |
| `CrossIndicator(a, b, crossType)` | Boolean: `a` crosses `b` up/down. |
| `ConvergenceDivergenceIndicator(a, b, ...)` | Convergence/divergence between two series. |
| `DateTimeIndicator(series)` | Bar end time as numeric value. |
| `UnstableIndicator(src, unstableBars)` | Forces `NaN` for the first `unstableBars` — wrap any indicator whose warm-up you must enforce. |
| `LogReturnIndicator(src, barCount)` (0.23+) | `log(x[i] / x[i−barCount])`; `NaN` during warm-up or on non-positive input. |
| `TradeCountIndicator(series)` | Trade count per bar when the bars carry it. |

`TransformIndicator` (the old unary `plus/multipliedBy/…` helper) **no longer exists in 0.28.x** — use the `numeric` package combinators below.

## Composing indicators numerically (`org.ta4j.core.indicators.numeric`)

Prefer these over hand-written wrappers for arithmetic:

```java
import org.ta4j.core.indicators.helpers.ClosePriceIndicator;
import org.ta4j.core.indicators.averages.SMAIndicator;
import org.ta4j.core.indicators.numeric.BinaryOperationIndicator;
import org.ta4j.core.indicators.numeric.NumericIndicator;
import org.ta4j.core.indicators.numeric.UnaryOperationIndicator;

ClosePriceIndicator close = new ClosePriceIndicator(series);
SMAIndicator fast = new SMAIndicator(close, 9);
SMAIndicator slow = new SMAIndicator(close, 50);
Indicator<Num> trendBias = BinaryOperationIndicator.quotient(fast, slow); // ratio fast/slow
Indicator<Num> atrScaled = UnaryOperationIndicator.abs(
        BinaryOperationIndicator.difference(fast, slow));
```

- `BinaryOperationIndicator` factories: `sum`, `difference`, `product`, `quotient`, `min`, `max` — each in `(left, right)` and `(indicator, Number)` forms. (The wiki shows `add`/`division`; the real 0.28 names are `sum`/`quotient`.)
- `UnaryOperationIndicator` factories: `sqrt`, `abs`, `pow(operand, exponent)`, `log`, `substitute(operand, valueToReplace, replacement)`.
- `NumericIndicator.of(someIndicator)` gives a fluent chain: `plus`, `minus`, `multipliedBy`, `dividedBy`, `min`, `max` (each with indicator and Number overloads), `abs()`, `sqrt()`, `squared()`, `pow(n)`, and shortcut wrappers `sma(k)`, `ema(k)`, `stddev(k)`, `highest(k)`, `lowest(k)`, `previous()`/`previous(k)`.
- `CombineIndicator(left, right, BinaryOperator<Num>)` still exists in `helpers` but is **deprecated** — prefer the numeric package for new composition.

Outputs feed directly into rules (`new OverIndicatorRule(trendBias, numOf(1.0))`) or become inputs to other indicators — composition is a DAG, evaluated lazily per index.

## Caching: `CachedIndicator` and `RecursiveCachedIndicator`

Package `org.ta4j.core.indicators`.

- `AbstractIndicator<T>` — stores the `BarSeries`, implements `getBarSeries()`; constructor `AbstractIndicator(BarSeries)`. Use it only for stateless, cheap indicators.
- `CachedIndicator<T>` — **the default base class.** Ring-buffer cache per index, thread-safe (lock-free read fast path, reentrant: calling `getValue` from inside `calculate` is safe). Implement `protected abstract T calculate(int index)`. Constructors: `CachedIndicator(BarSeries)`, `CachedIndicator(Indicator<?>)`, plus multi-source variants (`Indicator<?>[]`, varargs, `(BarSeries, Indicator<?>...)`) — pass every dependency so cache invalidation propagates when a source or the series head changes. The latest bar is cached **with mutation detection**: supported bar updates/replacements invalidate affected entries; silent edits to older bars are not detected.
- `RecursiveCachedIndicator<T>` — for indicators where `value(i)` calls `value(i−1)` (EMA, Wilder smoothing, running recurrences). Same constructors; adds iterative warm-up so deep recursions don't blow the stack.

When caching matters: any indicator consumed by several downstream consumers, anything called repeatedly by rules during backtesting, and every recursive chain. Without caching, an EMA over a 1000-bar series is O(n²); with it, O(n).

Moving (bounded) series behavior — `setMaximumBarCount` eviction: an already-evaluated EMA-family chain keeps its seeded recurrence and continues on append (0.27.0+ continuation policy); a **newly created** indicator on a pruned series cannot reconstruct evicted bars. `EWMAIndicator` needs at least `barCount` retained bars to seed; `WildersMAIndicator` needs **more** than `barCount`. Indicators that deliberately re-anchor on head advance: `StochasticIndicator`, `StochasticRSIIndicator`, `KlingerVolumeOscillatorIndicator`, `JMAIndicator`, `SchaffTrendCycleIndicator`, `CusumIndicator`, `EwmaVarianceIndicator`. If capacity < `getCountOfUnstableBars()` you get a one-time advisory warning and unreliable values — grow the window, don't ignore it.

## Writing a custom indicator

Extend `CachedIndicator<Num>` (windowed/independent values) or `RecursiveCachedIndicator<Num>` (values that reference their own previous index). Inject dependencies as indicators rather than reaching into the series, so your indicator composes and caches correctly:

```java
import org.ta4j.core.Indicator;
import org.ta4j.core.indicators.CachedIndicator;
import org.ta4j.core.indicators.RecursiveCachedIndicator;
import org.ta4j.core.num.Num;
import org.ta4j.core.num.NaN;

public class CloseOverSmaRatio extends CachedIndicator<Num> {
    private final Indicator<Num> source;
    private final Indicator<Num> mean;
    private final int barCount;

    public CloseOverSmaRatio(Indicator<Num> source, int barCount) {
        super(source);                       // pass the dependency, not just the series
        this.source = source;
        this.mean = new SMAIndicator(source, barCount); // create children in the ctor
        this.barCount = barCount;
    }

    @Override
    protected Num calculate(int index) {
        Num m = mean.getValue(index);
        if (m.isNaN() || m.isZero()) {
            return NaN.NaN;                  // unavailable — the shared singleton, not 0
        }
        return source.getValue(index).dividedBy(m);
    }

    @Override
    public int getCountOfUnstableBars() {
        return barCount;                     // windowed: first `barCount` bars are warm-up
    }
}

public class CciLikeRecurrence extends RecursiveCachedIndicator<Num> {
    public CciLikeRecurrence(Indicator<Num> base, int barCount) {
        super(base);                         // recursive ctor → iterative warm-up
    }
    @Override
    protected Num calculate(int index) {
        if (index == 0 || getValue(index - 1).isNaN()) { /* seed */ }
        // value(i) = f(value(i-1), base.getValue(i)) — safe to call getValue here
    }
}
```

Conventions that keep ta4j's machinery working:

- Call `super(indicator)` / `super(series)` so the dependency graph and invalidation are registered; create child indicators in the constructor, not per `calculate` call.
- Do arithmetic only on `Num` and produce values via `getBarSeries().numFactory()` — never `double` shortcuts — so `DecimalNum` series keep working.
- Return the shared `org.ta4j.core.num.NaN.NaN` singleton for "not computable here"; never throw and never return 0 as a stand-in.
- Override `getCountOfUnstableBars()` whenever warm-up exists (window size, displacement, recursive depth); delegate to children and take the max: `Math.max(a.getCountOfUnstableBars(), b.getCountOfUnstableBars())`.
- Keep per-index state inside the calculation path (the cache); concurrent reads are then safe by design. Don't hold mutable cross-index fields that `calculate` mutates.

## Warm-up and unstable-bar semantics

- Windowed indicators produce `NaN` (unavailable) before enough bars exist; `getCountOfUnstableBars()` reports how many leading indices are unreliable, `isStable()` compares against the current series length.
- A `false` from a Boolean pattern/event indicator during warm-up means "not confirmable at this index", not evidence of the opposite state. Pattern indicators count **pattern width + baseline**: e.g. `PiercingLineIndicator` reports `averagePeriod + 1`, `MorningStarIndicator` reports `averagePeriod + 2`.
- Gate strategy evaluation at or after the **latest** unstable boundary of every component — rules do not enforce warm-up for you:

```java
int unstableBars = Math.max(zScore.getCountOfUnstableBars(),
        Math.max(support.getCountOfUnstableBars(), wyckoff.getCountOfUnstableBars()));
strategy.setUnstableBars(unstableBars);   // or compute firstReliableIndex and skip earlier reads
```

- On moving series, respect the retained window: a declared lookback is not permission to read before `getBeginIndex()`.

## Pitfalls

- Inventing `isRemovingFutures()`, `TransformIndicator`, or `BinaryOperationIndicator.add/division` from old wiki snippets: 0.28.x has none of them — use `getMaximumBarCount`, the `numeric` package, and `sum/quotient`.
- Forgetting `super(indicator)` in a custom indicator (or passing only the series) breaks cache invalidation when the source updates; pass every dependency.
- Returning `0` instead of `NaN` during warm-up — downstream rules then fire on fake equilibrium values.
- Extending `AbstractIndicator` for a recursive formula: every `getValue(i)` re-walks the recursion; extend `RecursiveCachedIndicator` instead.
- Setting `setMaximumBarCount` below an indicator's warm-up (EWMA needs ≥ `barCount` retained, WildersMA strictly more) — values silently degrade.
- Reading index `i` from two different series and assuming they align: equal index ranges do not establish correspondence; only same-index composition on the same series is guaranteed.
- Mixing `DoubleNum` and `DecimalNum` thresholds as raw doubles; build constants from `series.numFactory()`.
- Creating child indicators inside `calculate(int)` — allocation churn and lost caching; build them in the constructor.

See also: [indicator-catalog.md](indicator-catalog.md) for the family-by-family catalog; upstream [Technical Indicators](https://ta4j.github.io/ta4j-wiki/Technical-indicators.html) and [Indicators Inventory](https://ta4j.github.io/ta4j-wiki/Indicators-Inventory.html).

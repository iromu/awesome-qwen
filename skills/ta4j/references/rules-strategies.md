# Rules & Strategies

A ta4j strategy is two boolean predicates — an entry rule and an exit rule — evaluated per bar; this file covers the rule catalog, how to compose rules, and how to assemble a `BaseStrategy`.

## The Rule contract

`org.ta4j.core.Rule` is the Specification pattern over bars:

```java
import org.ta4j.core.Rule;
import org.ta4j.core.TradingRecord;

public interface Rule {
    boolean isSatisfied(int index, TradingRecord tradingRecord);   // the one you implement
    default boolean isSatisfied(int index) { ... }                 // null-record convenience
    default Rule and(Rule rule);                                   // -> AndRule
    default Rule or(Rule rule);                                    // -> OrRule
    default Rule xor(Rule rule);                                   // -> XorRule
    default Rule negation();                                       // -> NotRule
    default String toJson();  static Rule fromJson(BarSeries s, String json);
    default String toExpression(NamedAssetRegistry registry);
    default void setName(String name);  default String getName();
}
```

Pass the `TradingRecord` whenever the rule depends on open positions or prior signals (`StopLossRule` needs the entry price; `JustOnceRule` needs history). The single-argument `isSatisfied(index)` passes a null record and silently breaks such rules. There is no `not()` — the method is `negation()`.

## Rule catalog (`org.ta4j.core.rules.*`)

**Crossing** — fires only on the bar where the relationship flips, not while it holds. This is what makes a crossover a *signal* rather than a *state*.

| Rule | Shape |
| --- | --- |
| `CrossedUpIndicatorRule` | `(Indicator<Num> indicator, Num threshold)` or `(Indicator first, Indicator second)` — first crosses above second |
| `CrossedDownIndicatorRule` | same constructors, downward cross |

For a boolean crossing indicator (e.g. `org.ta4j.core.indicators.helpers.CrossIndicator`) wrap it in `BooleanIndicatorRule`; note `CrossIndicator(a, b)` is true when `a` crosses **below** `b`, so a bullish fast/slow cross is `new CrossIndicator(slow, fast)`.

**Threshold / comparison** — state predicates, true for every bar that satisfies the comparison. Each takes `(Indicator<Num>, Number)`, `(Indicator<Num>, Num)`, or `(Indicator, Indicator)`:
`OverIndicatorRule` (`>`), `UnderIndicatorRule` (`<`), `OverOrEqualIndicatorRule` (`>=`), `UnderOrEqualIndicatorRule` (`<=`), `IsEqualRule`, `InPipeRule(ref, upper, lower)` for a band, `IsEqualRule`.

`InSlopeRule` gates on indicator slope (current minus value `nthPrevious` bars back): `(Indicator<Num> ref, Num minSlope)`, `(ref, minSlope, maxSlope)`, `(ref, String min, String max)`, `(ref, int nthPrevious, Num maxSlope)`.

**Trend shape** — `IsHighestRule(ref, barCount)`, `IsLowestRule(ref, barCount)`, `IsRisingRule(ref, barCount[, minStrength])`, `IsFallingRule(ref, barCount[, minStrength])`.

**Constants / adapters** — `BooleanRule(boolean)`, `FixedRule(int... indexes)` (true only on literal indexes), `BooleanIndicatorRule(Indicator<Boolean>)`.

**Composition** — besides the fluent `and`/`or`/`xor`/`negation`, explicit classes exist: `AndRule`, `OrRule`, `XorRule`, `NotRule`, plus `ChainRule(Rule initialRule, ChainLink... links)` for state machines.
- `VoteRule(int requiredVotes, Rule... rules)` — true when at least N children hold on the *same* bar; use for multi-oscillator agreement.
- `AndWithThresholdRule(rule1, rule2, threshold)` / `OrWithThresholdRule(rule1, rule2, threshold)` — evaluate the combination over a rolling window of the last `threshold` bars (current included). Use these when two confirmations land one bar apart and a strict same-bar `and` silently drops entries.
- `JustOnceRule(rule)` / `JustOnceRule()` — latches after the first satisfaction.
- `WaitForRule(TradeType tradeType, int numberOfBars)` — blocks operations until N bars have elapsed.

**Time-based** — all take an `org.ta4j.core.indicators.helpers.DateTimeIndicator` and compare against the **UTC** hour/minute of the bar's `Instant`. For exchange-local sessions, normalize the timestamps before they reach the series rather than post-correcting here: `TimeRangeRule(List<TimeRange>, DateTimeIndicator)` (also `TimeRangeRule(DateTimeIndicator, int[] fromSecondOfDay, int[] toSecondOfDay)`), `HourOfDayRule(time, int... hoursOfDay)`, `MinuteOfHourRule(time, int... minutesOfHour)`, `DayOfWeekRule(time, DayOfWeek... daysOfWeek)`.

**Position-state and entry hygiene** — these read the `TradingRecord`, so always pass it:
- `OpenedPositionMinimumBarCountRule(int barCount)` — refuse to exit before a position has been open N bars (stops whipsaw exits).
- `OpenPositionDurationRule(Indicator<Num> minBarsIndicator)` or `(Indicator<?>, Number minBars)`.
- `LossTriggeredCooldownRule(BarSeries, Number cooldownBars)` (+ `(series, cooldownBars, Rule resetRule, TradeType tradeType)`) — blocks new entries for N bars after a losing closed position.
- `EdgeHealthyRule(Indicator<Num> edgeIndicator, Number minimumEdge)` or `(edgeIndicator, Indicator<Num> minimumEdgeIndicator, Indicator<Num> edgeSlope, …)` — pairs with `EntryEdgeIndicator` / `EdgeDecaySlopeIndicator`.
- `RiskRewardRatioRule(Indicator<Num> price, Indicator<Num> stop, Indicator<Num> target, boolean bullish, Number minRiskReward)` — rejects bars whose stop/target geometry is unattractive.
- `MomentumStateRule(Indicator<MACDVMomentumState> state, MACDVMomentumState expected)` — MACD-V regime gate (`org.ta4j.core.indicators.macd.*`).

**Stop-loss / stop-gain family** — every percentage argument is in **percentage points** (`3` means 3%, not 0.03).

| Family | Loss / Gain | Trailing variants |
| --- | --- | --- |
| Fixed % | `StopLossRule(price, pct)`, `StopGainRule(price, pct)` | `TrailingStopLossRule(price, pct[, barCount])`, `TrailingStopGainRule(price, pct[, barCount])` |
| Fixed amount | `FixedAmountStopLossRule(price, amount)`, `FixedAmountStopGainRule(price, amount)` | `TrailingFixedAmountStopLossRule(price, amount[, barCount])`, `TrailingFixedAmountStopGainRule(...)` |
| Generic volatility | `VolatilityStopLossRule(series, volInd[, coefficient])`, `VolatilityStopGainRule(...)` | `VolatilityTrailingStopLossRule(...)`, `VolatilityTrailingStopGainRule(...)` |
| ATR | `AverageTrueRangeStopLossRule(series, atrBarCount, atrCoefficient)`, `AverageTrueRangeStopGainRule(...)` | `AverageTrueRangeTrailingStopLossRule(...)`, `AverageTrueRangeTrailingStopGainRule(...)` |

The ATR rules also accept a prebuilt `ATRIndicator` so several rules share one pipeline: `new AverageTrueRangeTrailingStopLossRule(close, atrIndicator, 2.0)` (optionally a trailing `barCount`). `AverageTrueRangeTrailingStopGainRule` throws `IllegalArgumentException` on a non-positive coefficient. Trailing *gain* rules are two-stage: they arm only after the initial gain threshold is reached, then fire on retracement from the favorable extreme.

Rules implementing `StopLossPriceModel` / `StopGainPriceModel` expose `Num stopPrice(BarSeries, Position)` — query the live stop level for sizing instead of recomputing the threshold. Pure math helpers are static (`true` = long math, `false` = short):

```java
import org.ta4j.core.rules.StopLossRule;
import org.ta4j.core.rules.StopGainRule;

Num sl   = StopLossRule.stopLossPrice(entry, numOf(2), true);
Num sg   = StopGainRule.stopGainPrice(entry, numOf(4), true);
Num tsg  = StopGainRule.trailingStopGainPrice(favorable, numOf(1.5), true);
Num fsl  = StopLossRule.stopLossPriceFromDistance(entry, numOf(10), true);
Num fsg  = StopGainRule.stopGainPriceFromDistance(entry, numOf(15), true);
Num ftsg = StopGainRule.trailingStopGainPriceFromDistance(favorable, numOf(5), true);
```

## Building a strategy

```java
import org.ta4j.core.BaseStrategy;
import org.ta4j.core.Strategy;
import org.ta4j.core.Trade.TradeType;

Strategy strategy = new BaseStrategy("SMA + MACDV hybrid", entryRule, exitRule);
```

Constructors: `(entry, exit)`, `(entry, exit, int unstableBars)`, `(entry, exit, TradeType startingType)`, `(entry, exit, unstableBars, startingType)`, each also available with a leading `String name`. Pass `TradeType.SELL` as the starting type for a short-first strategy — the record then opens with a sell and the exit rule closes it.

`setUnstableBars(n)` makes `shouldEnter`/`shouldExit` return false for the first `n` bars, which is how you keep a strategy from acting before indicators warm up. Indicators also report their own `getCountOfUnstableBars()`; set the strategy value anyway when a composite pipeline's warmup exceeds any single indicator's.

```java
import org.ta4j.core.backtest.BarSeriesManager;
import org.ta4j.core.TradingRecord;

BarSeriesManager manager = new BarSeriesManager(series);
TradingRecord record = manager.run(strategy);
```

Exactly **one operation per bar**: the manager calls `strategy.shouldOperate(i, record)`, which dispatches to `shouldEnter` when no position exists and to `shouldExit` when one is open. An entry and an exit can never both fire on the same bar, and a bar that satisfies the exit rule cannot also open a new position — that decision waits for the next bar.

Rule graph serialization round-trips: `strategy.toJson()` / `Strategy.fromJson(series, json)`, `rule.toJson()` / `Rule.fromJson(series, json)`, plus the compact form `strategy.toCompactJson()` and expression form `Rule.fromExpression(series, expr)`.

Reusable presets extend `org.ta4j.core.strategy.named.NamedStrategy` (it extends `BaseStrategy`): register in a `static { registerImplementation(MyStrategy.class); }` block, provide a `(BarSeries, String... params)` constructor alongside the typed one, label with `NamedStrategy.buildLabel(MyStrategy.class, "14", "50")`, then `NamedStrategy.initializeRegistry("com.example.strategies")` and `NamedStrategy.buildAllStrategyPermutations(series, List.of(new String[]{"14","50"}, new String[]{"20","100"}), MyStrategy::new)` for parameter grids.

## Worked entry/exit assembly

```java
import org.ta4j.core.indicators.SMAIndicator;
import org.ta4j.core.indicators.helpers.ClosePriceIndicator;
import org.ta4j.core.indicators.helpers.ConstantIndicator;
import org.ta4j.core.indicators.numeric.BinaryOperationIndicator;
import org.ta4j.core.rules.*;

ClosePriceIndicator close = new ClosePriceIndicator(series);
SMAIndicator fast = new SMAIndicator(close, 9);
SMAIndicator slow = new SMAIndicator(close, 21);
ATRIndicator atr = new ATRIndicator(series, 14);

Rule trendFilter = new OverIndicatorRule(slow, fast);              // long-term above
Rule bullishCross = new CrossedUpIndicatorRule(fast, slow);        // one-bar event
Rule confirmation = new OrWithThresholdRule(bullishCross,
        new IsHighestRule(close, 10), 3);                          // tolerate a 3-bar skew
Rule qualityGate  = new RiskRewardRatioRule(close, stopInd, targetInd, true, 2.0);
Rule cooldown     = new LossTriggeredCooldownRule(series, 5);
Rule entryRule    = trendFilter.and(bullishCross).and(qualityGate).and(cooldown);

Rule signalExit = new CrossedDownIndicatorRule(fast, slow);
Rule riskExit   = new AverageTrueRangeTrailingStopLossRule(close, atr, 2.0)
        .or(new AverageTrueRangeTrailingStopGainRule(close, atr, 3.0))
        .or(new StopLossRule(close, series.numFactory().numOf(1.5)));   // hard fail-safe
Rule exitRule   = signalExit.or(riskExit).or(new OpenedPositionMinimumBarCountRule(3).negation());
```

Use `BinaryOperationIndicator` / `UnaryOperationIndicator` (`org.ta4j.core.indicators.numeric`) for on-the-fly ratios, differences, and powers between indicators instead of writing a custom indicator class — they still participate in the caching pipeline. `ConstantIndicator` wraps a scalar so a rule that demands an `Indicator` can take a constant.

For diagnostics, `Rule.isSatisfiedWithTraceMode(index, record, Rule.TraceMode)` plus the `AbstractRule.traceIsSatisfied(...)` hooks produce a per-rule trace of which child fired on which bar — the fastest way to find which condition in a deep `and` chain is silently killing entries.

## Writing a custom rule

Extend `org.ta4j.core.rules.AbstractRule` rather than implementing `Rule` directly — it supplies the logger, display name, and the structured trace plumbing (`traceIsSatisfied(index, satisfied, Map.of(...))`) that makes rule diagnostics work.

```java
import org.ta4j.core.Rule;
import org.ta4j.core.TradingRecord;
import org.ta4j.core.rules.AbstractRule;

public final class CoolingOffRule extends AbstractRule {
    private final int bars;

    public CoolingOffRule(int bars) { this.bars = bars; }

    @Override
    public boolean isSatisfied(int index, TradingRecord tradingRecord) {
        if (tradingRecord == null || tradingRecord.getLastExit() == null) {
            traceIsSatisfied(index, true);
            return true;
        }
        boolean ok = index - tradingRecord.getLastExit().getIndex() >= bars;
        traceIsSatisfied(index, ok);
        return ok;
    }
}
```

Keep custom rules stateless: all mutable state belongs to the `TradingRecord` you are handed, otherwise a rule reused across two backtests leaks state between them.

## Pitfalls

- **Percentage units.** Stop-rule arguments are percentage points; `new StopLossRule(close, numOf(0.03))` means a 0.03% stop and will stop you out on the next tick.
- **Crossing vs. state.** `OverIndicatorRule(fast, slow)` stays true for the whole trend, so the entry fires on every bar of it; only `CrossedUpIndicatorRule` gives a one-bar event.
- **`isSatisfied(index)` without a record** returns wrong answers for any stop, position-state, or latching rule. Always pass the record.
- **`negation()` not `not()`**, and `xor` exists but is rarely what you want for entry gating.
- **Trailing rules churn** in noisy markets; add a minimum stop delta or throttle before replacing live orders, and keep one hard fail-safe stop beneath adaptive stops so a volatility blowout cannot widen the loss without bound.
- **Time rules are UTC.** A `HourOfDayRule(time, 10)` on a series with exchange-local timestamps gates the wrong session.
- **`JustOnceRule` is stateful across runs** — build a fresh rule graph per backtest rather than sharing one instance across a parameter sweep.
- **Unstable bars suppress both entry and exit**, so an exit rule can be silent at the start of a short run; size `unstableBars` against the run length.
- **One operation per bar** means a same-bar stop-and-reenter pattern is impossible in `BarSeriesManager`; model it explicitly with a custom `TradeExecutionModel` if you need it.

Upstream: [Trading strategies](https://ta4j.github.io/ta4j-wiki/Trading-strategies.html), [Stop loss & stop gain rules](https://ta4j.github.io/ta4j-wiki/Stop-Loss-and-Stop-Gain-Rules.html), [source tree](https://github.com/ta4j/ta4j/tree/master/ta4j-core/src/main/java/org/ta4j/core/rules).

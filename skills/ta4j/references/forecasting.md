# Forecasting: State Estimators and Projection Models

Predict a future return or price **distribution** from data available at one decision index, then act on its quantiles rather than its mean.

Package `org.ta4j.core.indicators.forecast` (ta4j 0.28.x, Java 25+). Docs: <https://ta4j.github.io/ta4j-wiki/Forecast-Indicators.html>, <https://ta4j.github.io/ta4j-wiki/Forecast-Projection-Models.html>.

## Evaluation model (why it is leakage-safe)

- A projection is an `Indicator<Forecast>`: `getValue(i)` reads only bars at or before `i`. The horizon labels the *outcome* window, it never grants access to future bars.
- Every built-in projection returns a non-null `Forecast` whose `decisionIndex()`/`index()` equals the queried index and whose `horizon()` equals the indicator's `getHorizon()`. A violated contract yields `NaN.NaN` point values, not an exception.
- Extending the series with new bars never changes an already-computed forecast at an earlier index; each index is cached independently.
- Compare a stored forecast with its realized value only after `index + horizon` matures.
- Until prerequisites are met, the forecast is `ForecastSupport.unavailable()` with `NaN.NaN` summaries, and it recovers automatically at a later index. Check `isStable()` on raw summaries.

`Forecast` (`org.ta4j.core.indicators.forecast.projection.Forecast`) exposes `decisionIndex()`, `index()`, `horizon()`, `support()`, `sampleCount()`, `mean()`, `median()`, `standardDeviation()`, `quantiles()`, `quantile(p)`, `hasQuantile(p)`, `isStable()`, plus `scale(Num)`/`affine(Num, Num)` for affine domain changes only (a nonlinear map such as `price * exp(logReturn)` must be applied to samples *before* summarising). `Forecast.ofSamples(index, horizon, List<Num>)` builds empirical output; `Forecast.builder(index, horizon, numFactory, ForecastSupport.analytic("name")).mean(m).median(m).standardDeviation(s).quantiles(map).build()` builds analytic output; `Forecast.unstable(index, horizon)` marks it unusable. `sampleCount()` counts output samples — never overload it with training rows.

## Smallest working pipeline

```java
import org.ta4j.core.BarSeries;
import org.ta4j.core.indicators.helpers.ClosePriceIndicator;              // org.ta4j.core.indicators.helpers
import org.ta4j.core.indicators.helpers.LogReturnIndicator;               // org.ta4j.core.indicators.helpers
import org.ta4j.core.indicators.ReturnIndicator;                          // org.ta4j.core.indicators
import org.ta4j.core.indicators.forecast.EwmaReturnForecastStateIndicator;
import org.ta4j.core.indicators.forecast.MonteCarloPriceForecastIndicator;
import org.ta4j.core.indicators.forecast.projection.Forecast;
import org.ta4j.core.Indicator;
import org.ta4j.core.num.Num;

BarSeries series = ...;
ReturnIndicator returns = new LogReturnIndicator(series);             // must be LOG representation
EwmaReturnForecastStateIndicator state = new EwmaReturnForecastStateIndicator(returns);
MonteCarloPriceForecastIndicator prices = new MonteCarloPriceForecastIndicator(state, 5);

int i = series.getEndIndex();
Forecast f = prices.getValue(i);
if (f.isStable()) {
    Num downside = f.quantile(0.05);
    Num median = f.median();
}
Indicator<Num> medianSeries = prices.median();      // point adapters for rules
Indicator<Num> tailSeries = prices.quantile(0.05);
```

Prefer the point adapters (`mean()`, `median()`, `standardDeviation()`, `quantile(p)` on the projection, all `default` methods of `ForecastProjectionIndicator`) inside rules and criteria: they convert an unavailable forecast into `NaN.NaN`, which ta4j rules already treat as "do not fire", so you do not re-implement the stability check.

The shortest Monte Carlo constructor means: 30-observation EWMA state, the requested horizon, 1,000 paths, 252-return shock lookback, seed `42`, `STANDARDIZED_EMPIRICAL` shocks, constant path volatility, quantiles `0.05/0.25/0.5/0.75/0.95` (`Forecast.DEFAULT_QUANTILE_PROBABILITIES`).

**Reproducibility:** every projection takes a `seed`. Keep it fixed for research and CI — the same series, index, and seed replay the same paths. `MonteCarloContext` hands a technique one deterministic `RandomGenerator` (`random()`, or `randomForPath(n)` from `perPathRandoms()`); a custom technique must draw only from it, otherwise the run is not reproducible.

## State estimators

A state is the estimator's snapshot at an index. `ForecastState` (`...forecast.state`) carries only `index()` and `isStable()`; return estimators additionally implement `ReturnMomentState`, exposing one validated `ReturnMoments` (`index`, `observationCount`, `isStable`, `representation`, `mean`, `drift`, `variance`, `volatility()`). Build them with `ReturnMoments.stable(index, observations, ReturnRepresentation.LOG, mean, drift, variance)` / `.unstable(index, observations, representation)` (unstable moments must carry `NaN.NaN` values but may keep a positive observation count). `ReturnRepresentation` lives in `org.ta4j.core.criteria`.

**EWMA** — the default. `new EwmaReturnForecastStateIndicator(returns, 30, 0.94, EwmaReturnForecastStateIndicator.DriftMode.ZERO)`; args are `initializationBarCount` (valid returns required before the state is stable), `decayFactor` (higher = slower), `driftMode` (`ZERO` | `ROLLING_MEAN`). Keep `ZERO` drift until a rolling drift earns its place out-of-sample.

**Kalman (scalar)** — `KalmanFilterIndicator(Indicator<Num> source)` smooths any indicator; `new KalmanFilterIndicator(source, processNoise, measurementNoise)` takes constant variances, and the three-argument form takes `KalmanNoiseIndicator`s. `KalmanNoiseIndicator` (`org.ta4j.core.indicators`) wraps a positive variance indicator — `new KalmanNoiseIndicator(varianceIndicator)` or `.constant(series, value)` — and rejects non-finite/non-positive values instead of silently abs-ing them or adding an epsilon. It validates numeric shape, not units: a price is not a variance. Derive variances from a scale proxy, e.g. `NumericIndicator.of(new ATRIndicator(series, 14)).squared().multipliedBy(0.05).max(minVariance)` (`org.ta4j.core.indicators.numeric.NumericIndicator`).

**Kalman (kinematic, forecast-ready)** — a position+velocity state whose forecast extrapolates the trend:

```java
import org.ta4j.core.indicators.KalmanNoiseIndicator;
import org.ta4j.core.indicators.KinematicKalmanFilterIndicator;
import org.ta4j.core.indicators.forecast.KinematicKalmanForecastStateIndicator;
import org.ta4j.core.indicators.forecast.KinematicKalmanPriceForecastIndicator;
import org.ta4j.core.indicators.forecast.state.KinematicKalmanForecastState;

ClosePriceIndicator close = new ClosePriceIndicator(series);
KinematicKalmanForecastStateIndicator states =
        new KinematicKalmanForecastStateIndicator(close, processNoise, measurementNoise); // defaults 1e-4 / 1e-3
KinematicKalmanForecastState s = states.getValue(i);   // position, velocity, positionVariance,
                                                       // positionVelocityCovariance, velocityVariance,
                                                       // processNoise, measurementNoise
KinematicKalmanFilterIndicator filter = new KinematicKalmanFilterIndicator(states);
KinematicKalmanPriceForecastIndicator fourWeeks = filter.forecast(4);   // analytic support
```

`new KinematicKalmanPriceForecastIndicator(states, horizon)` builds the same forecast directly. Its mean is `position + velocity * horizon` with the projected observation variance, so it is a Gaussian approximation reported as `ForecastSupport.analytic("linear-gaussian-kalman-observation")` — do not present it as an empirical path set. Share one filter across horizons via `filter.forecast(h)` to amortise the recursion.

**Correntropy Kalman (robust)** — `new CorrentropyKalmanFilterIndicator(source, processNoiseVariance, measurementNoiseVariance, series.numFactory().numOf(2.0))` (`org.ta4j.core.indicators`). A redescending kernel down-weights outlier measurements, so a single print or fat-finger bar no longer drags the trend; the bandwidth (sigma, default `2.0`) trades robustness against responsiveness, and the fixed-point update is bounded at 20 iterations. Read `filter.measurementWeight()` (`CorrentropyKalmanWeightIndicator`, near zero = rejected observation) and `filter.residual()` (`Indicator<Num>`) to see what it rejected.

**Rough volatility** — `new RoughVolatilityForecastStateIndicator(returns)`, or `RoughVolatilityForecastStateIndicator.builder(returns).initializationBarCount(90).decayFactor(0.97).driftMode(...).roughnessWindow(180).volOfVolWindow(90).horizon(10).build()`. Adds `roughnessHurst()` (OLS log-variogram slope/2 clamped to `[0.01, 0.49]`), `volOfVol()`, and `horizonVarianceForecasts()` where entry `h-1` is `currentVariance * h^(2H)`. Use it when volatility persistence or a multi-horizon risk shape is in the model; otherwise EWMA. `new HurstExponentIndicator(new ClosePriceIndicator(series), 120)` (`org.ta4j.core.indicators.statistics`) reuses the same statistic standalone, bounded `[0, 1]`.

**Online change-point** — `new OnlineChangePointForecastStateIndicator(returns)`, or `builder(returns).expectedRunLength(150).maximumRunLength(500).topRunLengthCount(8).minimumObservationCount(30).recentChangeWindow(10).priorMean(0).priorMeanPrecision(1e-3).priorShape(3).priorScale(1e-3).build()`. Bayesian run-length posterior (constant hazard `1/expectedRunLength`); read `recentChangeProbability()` (mass over run lengths `0..recentChangeWindow`), `mostLikelyRunLength()`, `topRunLengths()` (`RunLengthPosterior`). A non-finite return resets the posterior and the warm-up. This is a regime diagnostic — never a standalone entry signal.

**Custom state** — implement `ForecastState` for lifecycle-only output, `ReturnMomentState` when you have canonical moments, `ReturnForecastStateIndicator<S>` when you also own the semantic `ReturnIndicator` (then projections can infer the return stream). A stable custom state must report the queried index, the indicator's representation, at least one observation, finite moments, and non-negative variance.

## Projection models

| Need | Class | Support reported |
| --- | --- | --- |
| Cumulative log-return distribution | `MonteCarloReturnProjectionIndicator` | empirical (paths) |
| Terminal price distribution | `MonteCarloPriceForecastIndicator` | empirical (paths) |
| State-conditioned historical analogues | `AnalogReturnProjectionIndicator<S>` | empirical (neighbours) |
| Tail recalibration from matured errors | `RollingConformalForecastProjectionIndicator` | base support preserved |
| Price from moments only | `LognormalApproximationPriceForecastIndicator` (`...forecast.adapters`) | `analytic("lognormal-moment-match")` |

```java
import org.ta4j.core.indicators.forecast.MonteCarloPriceForecastIndicator;
import org.ta4j.core.indicators.forecast.MonteCarloReturnProjectionIndicator.ShockModel;
import org.ta4j.core.indicators.forecast.MonteCarloReturnProjectionIndicator.VolatilityUpdateMode;

MonteCarloPriceForecastIndicator prices =
        MonteCarloPriceForecastIndicator.builder(close, state)   // explicit price when it cannot be inferred
                .horizon(5)                 // default 1 — match the label and holding period
                .iterationCount(5_000)      // default 1_000 — smoother tails, measure latency
                .lookbackBarCount(504)      // default 252 — regime the shocks represent
                .seed(7L)                   // default 42 — keep fixed
                .shockModel(ShockModel.STANDARDIZED_EMPIRICAL)   // HISTORICAL_BOOTSTRAP | STANDARDIZED_EMPIRICAL | NORMAL
                .volatilityUpdateMode(VolatilityUpdateMode.EWMA) // CONSTANT | EWMA
                .volatilityDecayFactor(0.97)                      // default 0.94
                .quantiles(0.01, 0.05, 0.5, 0.95, 0.99)
                .build();
```

`MonteCarloPriceForecastIndicator` infers the price source when the state consumes a `LogReturnIndicator`, and converts every simulated cumulative return to a terminal price *before* computing moments, so mean/median/quantiles describe the same paths. Pass `close` explicitly when the state source is custom.

**Analog** — "what happened after states like this one?" `new AnalogReturnProjectionIndicator<>(state)` uses the `[mean, volatility]` schema; the builder exposes `horizon(1)`, `lookbackBarCount(252)`, `neighborCount(30)`, `minimumNeighborCount(5)`, `featureExtractor(...)`, `standardizeFeatures(true)`, `quantiles(...)`. Candidate `j` is eligible only when `j + horizon <= i`, so only fully matured outcomes train; standardisation is fit from candidates only, never from the query state; weights are `exp(-distance)`. Use `builder(stateIndicator, returnIndicator)` when a custom state cannot expose its return stream.

**Rolling conformal** — widens tails with the order statistic `ceil((n+1) * coverage)` of recent absolute median errors; median, mean, support, and decision index are preserved.

```java
import org.ta4j.core.indicators.forecast.RollingConformalForecastProjectionIndicator;

// generic realized values: realized = realizedValueIndicator.getValue(decision + horizon)
ForecastProjectionIndicator calibrated = RollingConformalForecastProjectionIndicator
        .builder(analog, close).targetCoverage(0.90).calibrationWindow(252).minimumCalibrationCount(30).build();

// cumulative log returns: keeps ReturnForecastProjectionIndicator so downstream stays representation-aware
ReturnForecastProjectionIndicator calReturns = RollingConformalForecastProjectionIndicator
        .cumulativeLogReturnBuilder(analog, returns).targetCoverage(0.95).build();
```

It stays unavailable until enough valid scores exist for the requested rank, not just for `minimumCalibrationCount`. It is calibration, not Adaptive Conformal Inference — no online coverage update is claimed, and coverage is not a guarantee under distribution shift.

**Monte Carlo techniques.** Implement `MonteCarloMethod` (`org.ta4j.core.analysis.montecarlo`): `List<Num> terminalReturns(MonteCarloContext context)` — the record carries `index`, `horizon`, `iterationCount`, `historicalLogReturns`, `moments`, `random()`, `numFactory`. Draw only from `context.random()` and return exactly `iterationCount` finite samples; a null list, wrong count, or non-finite sample degrades the whole forecast to unstable (paths are never silently dropped). Hand it to the engine with `.monteCarloMethod(technique)`. Public stock techniques are `ShockPathMonteCarloMethod(ShockModel, VolatilityUpdateMode, double)` and `NormalInverseGammaForecastMethod.withEmpiricalPriors()`; compose the decorators through the interface's default methods — `technique.widenedByRecentVolatility()`, `.widenedByRecentVolatility(recentBarCount, maxWiden)`, `.withStudentTScaleMixing()`, `.withStudentTScaleMixing(degreesOfFreedom)`, `nig.overSmoothedResiduals()`, `a.pooledWith(b)` — because the decorator classes themselves are package-private:

```java
MonteCarloMethod technique = NormalInverseGammaForecastMethod.withEmpiricalPriors()
        .overSmoothedResiduals()
        .widenedByRecentVolatility()
        .withStudentTScaleMixing();
MonteCarloPriceForecastIndicator prices = MonteCarloPriceForecastIndicator.builder(close, state)
        .horizon(4).monteCarloMethod(technique).build();
```

**Feature schemas** (for analog similarity, `org.ta4j.core.indicators.forecast.state.ForecastFeatureExtractors`): `meanVolatility(rep)`, `driftVolatility(rep)`, `meanDriftVariance(rep)`, `roughVolatility()` → `[mean, volatility, roughness_hurst, vol_of_vol]`, `changePoint()` / `changePoint(window)` → `[mean, volatility, recent_change_probability, most_likely_run_length]`. Values stay in raw declared units — the model consuming them owns standardisation. `extractInto(state, target, offset)` reuses a row array in tight loops; `features(state)` allocates.

## Runnable examples

From the ta4j repository root (`./mvnw -pl ta4j-examples -am install`, then `./mvnw -pl ta4j-examples exec:java -Dexec.mainClass=<class>`):

- `ta4jexamples.analysis.forecast.RollingConformalForecastExample` — five-day analog return forecast calibrated with matured five-day cumulative log returns, on a committed BTC-USD daily fixture.
- `ta4jexamples.analysis.forecast.KinematicKalmanForecastExample` — chop-regime-scaled noise, `KinematicKalmanFilterIndicator.forecast(h)` per horizon, wrapped in `RollingConformalForecastProjectionIndicator`.
- `ta4jexamples.analysis.forecast.CorrentropyKalmanExample` — ATR-scaled noise, kernel weight and residual inspection.
- `ta4jexamples.analysis.forecast.ForecastStateComparisonExample`, `AdaptiveKalmanNoiseExample`, `WalkForwardCalibrationBakeoffExample` (11 arms scored by central-interval coverage, pinball loss, CRPS).

Sources: <https://github.com/ta4j/ta4j/tree/master/ta4j-examples/src/main/java/ta4jexamples/analysis/forecast>

## Pitfalls

- Reading `getValue(i + horizon)` (or a realized value from a later bar) inside a feature, filter, or calibration loop is look-ahead; compare forecasts with realizations only after maturity.
- Treating an unavailable forecast as zero. Branch on `isStable()`, or use the point adapters and let `NaN.NaN` block the rule.
- Feeding a `DECIMAL`/`PERCENTAGE` return indicator to `EwmaReturnForecastStateIndicator` — it accepts only `ReturnRepresentation.LOG` and rejects others at construction.
- A horizon that does not match the strategy's execution and holding period; a five-bar tail is meaningless for a one-bar hold.
- Presenting an analytic forecast (kinematic Kalman, lognormal approximation) as empirical, or reading `sampleCount()` as model confidence — it is `0` for analytic support.
- Letting the current query state into training standardisation, or counting conformal calibration rows as forecast support; both inflate apparent evidence.
- Changing `seed()` between runs and then comparing quantiles — path noise moves the tails you are comparing.
- Raising `iterationCount` blindly: cost is linear in paths and paid per index; measure latency in rolling loops first.
- Requesting quantiles nobody consumes; each configured quantile is computed for every index.
- A non-finite terminal path invalidates the entire Monte Carlo projection rather than dropping that path — expect an unstable forecast from one bad bar, not a slightly noisier one.

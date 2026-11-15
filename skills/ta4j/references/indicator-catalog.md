# Indicator Catalog by Family

Browsable map of the ta4j 0.28.x indicator packages: exact package, constructor shape, and when to reach for each class. Core interface and helpers are covered in [indicators.md](indicators.md).

Root-package imports are `org.ta4j.core.indicators.X` (shown as `indicators`); subpackages are spelled out once per section.

| Need | Go to |
|---|---|
| Smooth a series / crossover baseline | Moving averages (`averages`) |
| Overbought/oversold, momentum divergence | Momentum & oscillators (root) |
| EMA spread with signal/histogram lines | MACD family (`macd`) |
| Trend strength gate, Ichimoku, SAR, SuperTrend | Trend (`adx`, `aroon`, `ichimoku`, `supertrend`, `trend`) |
| Volatility measure, channels, squeeze, trailing stop | Volatility & bands (`bollinger`, `keltner`, `donchian`, root) |
| Flow confirmation, fair value | Volume (`volume`) |
| Bar morphology events | Candlestick patterns (`candles`) |
| Rolling stats, correlation, z-score, regression | Statistics (`statistics`) |
| Intraday levels | Pivot points (`pivotpoints`) |
| Pivots, structure, S/R lines | Swing/zigzag/trendlines (`zigzag`, `supportresistance`) |
| Range lifecycle | Wyckoff (`wyckoff`) |
| Regime + breakout + participation (Williams) | Bill Williams (root) |
| Denoise without forecasting | Kalman (root) |

## Moving averages — `org.ta4j.core.indicators.averages`

All take an `Indicator<Num>` source plus window unless noted; `AbstractEMAIndicator` is the shared EMA base, not usable directly.

| Class(constructor) | Use when |
|---|---|
| `SMAIndicator(src, barCount)` | Equal-weight baseline: golden/death crosses, Bollinger middle. |
| `EMAIndicator(src, barCount)` | Standard `2/(n+1)` smoothing; crossovers, MACD ingredient. |
| `EWMAIndicator(src, barCount, decayFactor)` | You want the decay factor directly (`0<d<1`); `barCount` is only the SMA seed window. |
| `WMAIndicator(src, n)` / `LWMAIndicator(src, n)` | Linear-weighted recency emphasis; Coppock uses WMA. |
| `VWMAIndicator(price, n)` / `(price, volume, n)` | Volume-confirmed trend level. |
| `MMAIndicator(src, n)` / `WildersMAIndicator(src, n)` | Wilder 1/n smoothing (RSI/ATR/ADX semantics); WildersMA needs > n retained bars. |
| `SMMAIndicator(src, n)` | Smoothed MA; Alligator lines are displaced SMMAs. |
| `DoubleEMAIndicator(src, n)` / `TripleEMAIndicator(src, n)` | Less lag than EMA without overshoot of raw zero-lag tricks. |
| `ZLEMAIndicator(src, n)` | Zero-lag EMA when lag matters more than noise. |
| `DMAIndicator(src, n, displacement)` / `EDMAIndicator(src, n, displacement)` | Displace an MA in time (trade the slope later). |
| `HMAIndicator(src, n)` | Hull: minimal lag, responsive turn detection. |
| `JMAIndicator(src, n, phase, power)` | Jurik: smooth + low lag; re-anchors on moving series. |
| `KAMAIndicator(price, erPeriod, fast, slow)` / `(price)` | Flat in noise, fast in trend (adaptive). |
| `VIDYAIndicator(src, cmoPeriod, vidyaPeriod)` | Chande adaptive via CMO. |
| `MCGinleyMAIndicator(src, n)` | Adapts to market speed; macro-style baseline. |
| `TMAIndicator(src, n)` / `ATMAIndicator(src, n)` | Double-smoothed (triangular); asymmetric variant. |
| `LSMAIndicator(src, n)` | Linear-regression value at window end — extrapolates trend. |
| `SGMAIndicator(src, n, polynomialOrder)` | Savitzky–Golay polynomial fit; smooth derivative-friendly baselines. |
| `KiJunV2Indicator(high, low, n)` | Kihon midpoint `(H+L)/2` over window (Ichimoku-style). |

## Momentum & oscillators — `org.ta4j.core.indicators`

| Class(constructor) | Use when |
|---|---|
| `RSIIndicator(src, barCount)` | Wilder overbought/oversold on any numeric source. |
| `StochasticRSIIndicator(src, n)` / `(RSIIndicator rsi, n)` | Stochastic-of-RSI for sharper 0–100 cycles; re-anchors on moving series. |
| `StochasticIndicator(src, lookback)` | Fast stochastic-style oscillator over the lookback window (compares the source against the window range, unlike `StochasticOscillatorKIndicator`'s close-only form); re-anchors. |
| `StochasticOscillatorKIndicator(series, barCount)` / `(src, n, high, low)` | Raw %K. |
| `StochasticOscillatorDIndicator(k)` / `(src)` | %D = smoothed %K (3-period SMA by default). |
| `WilliamsRIndicator(series, barCount)` | %R overbought/oversold (0 to −100 scale). |
| `CCIIndicator(series, barCount)` | Typical-price deviation vs mean; cyclical overextension. |
| `ROCIndicator(src, barCount)` | Pure rate-of-change momentum. |
| `CMOIndicator(src, barCount)` | Chande signed-strength momentum (also VIDYA's input). |
| `NetMomentumIndicator(oscillator, timeFrame, neutralPivot)` / `.forRsi(rsi, tf)` | Turns a bounded oscillator into net momentum vs its neutral pivot. |
| `TrueStrengthIndexIndicator(src[, first, second])` | Double-smoothed momentum with signal line. |
| `UltimateOscillatorIndicator(series[, short, mid, long])` | Multi-window buying-pressure blend. |
| `SchaffTrendCycleIndicator(src[, fast, slow, cycle])` | MACD + double stochastic normalization; re-anchors. |
| `ConnorsRSIIndicator(src[, rsiPeriod, streakRsiPeriod, percentRankPeriod])` | RSI + up/down-streak RSI + percent rank averaged. |
| `FisherIndicator(series)` / `(price, barCount[, alpha, beta…])` | Gaussian-normalized turns for peak/trading. |
| `KSTIndicator(src)` | Know Sure Thing: weighted multi-ROC sum. |
| `DPOIndicator(series, barCount)` / `(price, n)` | Detrended oscillator — cycle reading without trend. |
| `CoppockCurveIndicator(src[, longRoC, shortRoC, wma])` | Long-term bottom identification. |
| `PPOIndicator(src[, short, long])` | MACD as % of slow EMA (cross-instrument). |
| `PVOIndicator(series[, volumeBarCount] \| [short, long])` | Percentage Volume Oscillator (volume-MA spread). |
| `RAVIIndicator(price, shortSma, longSma)` | Range action verification (optional abs). |
| `IntraDayMomentumIndexIndicator(series, barCount)` | Intraday momentum reading. |
| `KRIIndicator(series, barCount)` / `(src, n)` | Kairi: percent distance of price from its MA. |
| `DistanceFromMAIndicator(series, movingAverage)` | Deviation vs any MA you supply. |
| `RWIHighIndicator(series, n)` / `RWILowIndicator` | Relative Weighted Index — range-expansion/reversal. |
| `MassIndexIndicator(series, emaBarCount, barCount)` | Range-expansion reversal timing. |

## MACD family — `org.ta4j.core.indicators.macd` (plus root `MACDIndicator`)

- `indicators.MACDIndicator(src)` / `(src, shortBarCount, longBarCount)` — plain EMA spread (12/26 default), a.k.a. APO.
- `macd.MACDVIndicator(series)` / `(priceIndicator)` / `(series, short, long)` — volume/ATR-weighted EMA spread; **use this package**; the deprecated root-package shim is gone in 0.28. Expose lines via `getMacd()`, `getSignalLine(...)`, `getHistogram(...)`, `getLineValues(...)` (`MACDLineValues`, `MACDHistogramMode`).
- `macd.VolatilityNormalizedMACDIndicator(series)` / `(price)` / `(series, fast, slow, signal)` — `(EMAfast−EMAslow)/ATR × scale` (Spiroglou style); not interchangeable with plain MACD-V thresholds.
- `macd.MACDVMomentumStateIndicator(macdvIndicator[, profile | posRange, …])` — classify into `MACDVMomentumState` regimes; defaults ±50/±150 via `MACDVMomentumProfile`.

## Trend — `adx`, `aroon`, `ichimoku`, `supertrend`, `trend` packages + root

`org.ta4j.core.indicators.adx`: `ADXIndicator(series, barCount)` / `(series, diBarCount, adxBarCount)` — trend strength (gate entries above ~25); `DXIndicator`, `PlusDIIndicator(series, n)`, `MinusDIIndicator`, `PlusDMIndicator`, `MinusDMIndicator` for DI crossovers.
`org.ta4j.core.indicators.aroon`: `AroonUpIndicator(series, n)` / `(high, n)`, `AroonDownIndicator`, `AroonOscillatorIndicator(series, n)`, plus `AroonFacade` and `AroonExtremeIndexIndicator` for bars-since-extreme.
`org.ta4j.core.indicators.ichimoku`: `IchimokuTenkanSenIndicator(series[, n])`, `IchimokuKijunSenIndicator`, `IchimokuSenkouSpanAIndicator(series[, conv, base])`, `IchimokuSenkouSpanBIndicator`, `IchimokuChikouSpanIndicator(series[, timeDelay])` (lagged close — remember it plots at `i−delay`), `IchimokuLineIndicator` for custom lines.
`org.ta4j.core.indicators.supertrend`: `SuperTrendIndicator(series)` / `(series, barCount, multiplier)` — ATR flip line for trend-following exits; `SuperTrendUpperBandIndicator`/`SuperTrendLowerBandIndicator` for the raw bands. Whipsaws in chop — pair with ADX/Chop.
`org.ta4j.core.indicators.trend`: `UpTrendIndicator` / `DownTrendIndicator` — Boolean trend gates (legacy embedded gates).
Root: `ParabolicSarIndicator(series[, accStart, accMax…])` — trailing stop/reversal dots; `VortexIndicator(series[, n])` — +VI/−VI direction; `TrendScoreIndicator(series, fastEma, slowEma, signal, …)` — composite −100..+100 regime score; `TrendConclusionIndicator(...)` — 0..100 "trend cooled" estimate; `EntryEdgeIndicator` / `EdgeDecaySlopeIndicator` — realized edge in bps and its trajectory (matured returns only); `StretchZScoreIndicator(source[, reference], barCount)` — z-score of stretch vs any reference (SMA, VWAP).

## Volatility & bands — `bollinger`, `keltner`, `donchian` packages + root

`org.ta4j.core.indicators.bollinger`: build middle then bands — `BollingerBandsMiddleIndicator(Indicator<Num>)`, `BollingerBandsUpperIndicator(middle, stddevIndicator[, k])`, `BollingerBandsLowerIndicator`, `BollingerBandWidthIndicator`, `PercentBIndicator(src, barCount, k)`; or one-shot `BollingerBandFacade(series, barCount, k)` / `(indicator, barCount, k)`.
`org.ta4j.core.indicators.keltner`: `KeltnerChannelMiddleIndicator(series, barCountEMA)`, `KeltnerChannelUpperIndicator(middle, ratio, barCountATR)` / `(middle, atr, ratio)`, `...LowerIndicator`; or `KeltnerChannelFacade(series, emaCount, atrCount, k)`. Bollinger-inside-Keltner = squeeze.
`org.ta4j.core.indicators.donchian`: `DonchianChannelUpperIndicator(series, barCount)` (highest high), `...LowerIndicator`, `...MiddleIndicator`; `DonchianChannelFacade(series, barCount)` gives cached numeric lower/upper/middle from one constructor.
Root: `ATRIndicator(series, barCount)` / `(TRIndicator, barCount)` — Wilder true range average, the universal volatility input; `ChandelierExitLongIndicator(series[, n, k])` / `ChandelierExitShortIndicator` — ATR trailing exits; `ChopIndicator(series, timeFrame[, returnRepresentation | scaleTo])` — choppiness (prefer percentage output 0–100); `UlcerIndexIndicator(src, barCount)` — drawdown depth+duration; `SqueezeProIndicator(series, barCount[, bbK, keltnerFactors…])` — momentum-in-low-volatility; `CompressionIndicator` — 0–100 contraction score from ATR/Bollinger/Donchian width percentiles.

## Volume — `org.ta4j.core.indicators.volume` (+ root `MarketFacilitationIndexIndicator`, `PVOIndicator`)

| Class(constructor) | Use when |
|---|---|
| `OnBalanceVolumeIndicator(series)` | Cumulative signed volume; divergence vs price. |
| `AccumulationDistributionIndicator(series)` | CLV-weighted cumulative flow (Chaikin input). |
| `ChaikinMoneyFlowIndicator(series, barCount)` | Rolling volume-weighted money flow. |
| `ChaikinOscillatorIndicator(series[, shortBarCount, longBarCount])` | A/D EMA spread — accumulation momentum. |
| `MoneyFlowIndexIndicator(series, barCount)` | Volume-weighted RSI (0–100). |
| `ForceIndexIndicator(series[, barCount])` / `(close, volume)` | EMA-smoothed Δclose × volume (default 13). |
| `EaseOfMovementIndicator(series[, barCount[, volumeDivisor]])` | How freely price moves per volume (default 14, divisor 1e8). |
| `KlingerVolumeOscillatorIndicator(series[, short, long])` | Volume-force EMA spread (34/55); re-anchors on moving series. |
| `VWAPIndicator(price, volume, barCount)` / `(series, barCount)` | Rolling fair-value reference. |
| `AnchoredVWAPIndicator(series, anchorIndex)` / `(price, volume, anchorIndex)` / `(series, Indicator<Boolean> anchorSignal)` | Event/session-anchored value; dynamic resets via Boolean signal. |
| `MVWAPIndicator(vwap, barCount)` | Smoothed VWAP. |
| `VWAPStandardDeviationIndicator(vwap)` | Volume-weighted σ feeding bands/z-score. |
| `VWAPBandIndicator(vwap, stdDev, multiplier, BandType.UPPER/LOWER)` | Mean-reversion zones. |
| `VWAPDeviationIndicator(price, vwap)` / `VWAPZScoreIndicator(deviation, stdDev)` | Premium/discount vs value, normalized. |
| `NVIIndicator(series)` / `PVIIndicator(series)` | Smart-money (quiet volume) / crowd (loud volume) indices. |
| `IIIIndicator(series)` | Institutional Investor Index. |
| `ROCVIndicator(series, barCount)` | Rate of change of volume. |
| `RelativeVolumeStandardDeviationIndicator(series, barCount)` | Volume surprise in σ units (breakout confluence). |
| `TimeSegmentedVolumeIndicator(series, barCount)` | Intraday time-bucketed volume. |

## Candlestick patterns — `org.ta4j.core.indicators.candles`

Geometry primitives first (no warm-up, always non-negative): `CandleBodyIndicator(series)` = `|close−open|`, `CandleRangeIndicator(series)` = `high−low` (not true range), `UpperShadowIndicator`, `LowerShadowIndicator`. `RealBodyIndicator` is deprecated signed legacy — use body magnitude + `Bar#isBullish()/isBearish()`.
Patterns take `BarSeries` (default constructors) and classify against causal baselines from **preceding** candles only (shared default: 5 prior candles): `DojiIndicator(series[, averagePeriod, rangeFactor=0.1])`, `HammerIndicator(series[, averagePeriod])`, `HangingManIndicator`, `InvertedHammerIndicator`, `ShootingStarIndicator`, `BullishMarubozuIndicator`/`BearishMarubozuIndicator`, `BullishEngulfingIndicator(series)`/`BearishEngulfingIndicator` (pure two-body containment), `BullishHaramiIndicator`/`BearishHaramiIndicator`, `BullishKickerIndicator`/`BearishKickerIndicator`, `PiercingLineIndicator(series[, averagePeriod, penetration=0.5])`, `DarkCloudCoverIndicator`, `MorningStarIndicator(series[, averagePeriod, penetration])`, `EveningStarIndicator`, `ThreeInsideUpIndicator`/`ThreeInsideDownIndicator`, `ThreeWhiteSoldiersIndicator`, `ThreeBlackCrowsIndicator`. Use pattern indicators as morphology events only — compose trend/volume context yourself, and shift context inputs back by the pattern width (`PreviousValueIndicator(src, 2)` for two-bar patterns) so context never reads the pattern candles. `DarkCloudIndicator`/`PiercingIndicator` are deprecated classes with embedded trend gates — not aliases. Respect each pattern's `getCountOfUnstableBars()` (baseline + width; `false` in warm-up ≠ opposite pattern).

## Statistics & numeric — `org.ta4j.core.indicators.statistics` (+ `SampleType`)

Distribution and dispersion: `StandardDeviationIndicator(src, n[, SampleType])` (+ `ofSample`/`ofPopulation`), `VarianceIndicator(src, n[, SampleType])`, `MeanDeviationIndicator(src, n)`, `EwmaVarianceIndicator(src, n, decayFactor)` (re-anchors), `UlcerIndex` lives in volatility.
Relationships: `CovarianceIndicator(a, b, n)`, `CorrelationCoefficientIndicator(a, b, n[, SampleType])`, `PearsonCorrelationIndicator`, `KendallTauIndicator` (tau-b, ties), `SpearmanRankCorrelationIndicator`, `LaggedCorrelationIndicator` (Pearson with a configurable lead/lag shift), `LeadLagCorrelationIndicator` (best-lag profile), `DistanceCorrelationIndicator` (nonlinear dependence, O(n²)/index — modest windows), `MutualInformationIndicator` (binned, nats), `RegimeSegmentedCorrelationIndicator` (Pearson only where a Boolean regime is true), `DynamicTimeWarpingDistanceIndicator` (shape match, Sakoe–Chiba band).
Fits and scores: `SimpleLinearRegressionIndicator(src, n[, type])` (slope or intercept — pick `SimpleLinearRegressionType`), `StandardErrorIndicator`, `SigmaIndicator(ref, n)` / `ZScoreIndicator(deviation, stddev)`, `PeriodicalGrowthRateIndicator`, `HurstExponentIndicator(series|src, n[, maxLag])` (bounded [0,1]: >0.5 trending, <0.5 mean-reverting), `CusumIndicator(series|src, targetMean, allowance[, clipFactor…])` (drift shift detection; re-anchors).
Sparse events: `statistics.event.EventSynchronizationIndicator` — rolling F1 for two Boolean event streams with signed-offset diagnostics.
Pass `SampleType` explicitly (`n−1` vs `n`) whenever matching an external formula; unstable-bar counts follow the variance/covariance warm-up.

## Pivot points — `org.ta4j.core.indicators.pivotpoints`

`PivotPointIndicator(series, TimeLevel.DAY/WEEK/MONTH)` and `DeMarkPivotPointIndicator(series, timeLevel)` need session-aligned bars; derive levels with `StandardReversalIndicator(pivot, PivotLevel)`, `DeMarkReversalIndicator`, `FibonacciReversalIndicator(pivot, fibonacciFactor|FibonacciFactor, level)`; `AbstractPivotPointIndicator` is the base, `PivotLevel`/`TimeLevel` the enums. Use for intraday levels, break/retest targets — not on non-session-aligned data.

## Swing, zigzag & trendlines — `zigzag`, `supportresistance` packages + root swing classes

- Fastest path: `indicators.RecentSwingIndicators.defaultFor(series)` returns a `Pair` of causal `RecentSwingIndicator` highs/lows (canonical ATR(14) OHLC-aware ZigZag); also `fractal(series[, pre, post, allowedEqual])`, `zigZag(series)`, `adaptiveZigZag(series[, config])`, `slopeChange(series[, config])`, `prominence(series[, config])`, `consensus(series)`, `fromDetector(series, SwingDetectors.consensus(...))`. Read `getValue(i)`, `getLatestSwingIndex(i)`, `getLatestSwingConfirmationIndex(i)`; provisional forming points via `swings.latestHigh(i)` (`Confirmation.PROVISIONAL`) are display-only — they repaint. Detector configs (`AdaptiveZigZagConfig`, `SlopeChangeConfig`, `ProminenceSwingConfig`) live in `org.ta4j.core.analysis.elliott.swing` and are not indicators.
- Root swing indicators: `RecentFractalSwingHighIndicator(high, preceding, following, allowedEqual)` / `(series)` (3/3/0), `RecentFractalSwingLowIndicator`, `RecentProminenceSwingHighIndicator`/`LowIndicator`, `RecentSwingIndicator` (interface), `AbstractRecentSwingIndicator` (base), `SwingPointMarkerIndicator(series, RecentSwingIndicator)` — price only on swing bars, `NaN` elsewhere (chart markers).
- `org.ta4j.core.indicators.zigzag`: `ZigZagStateIndicator(price, reversalAmount)` / `(high, low, reversalAmount)` / `(high, low, confirmationPrice, reversalAmount)` — feed highs/lows as extremes and close as confirmation; threshold any indicator (default convenience `ATRIndicator(series,14)`, `ConstantIndicator` for fixed). `ZigZagPivotHighIndicator(state)`/`LowIndicator` (Boolean at pivots), `RecentZigZagSwingHighIndicator(state[, price])`/`LowIndicator`, `ZigZagState`/`ZigZagTrend` records.
- `org.ta4j.core.indicators.supportresistance`: `TrendLineSupportIndicator(series, surroundingHigherBars, barCount)` (fractal source) or `(RecentSwingIndicator, pre, post, barCount)` (custom swings) — best-fit line over the last `barCount` swings, `NaN` until ≥2 swings; tune with `ScoringWeights.builder()` (weights sum to 1; touch count, extreme swing, outside-count penalty, deviation, recency default 0.05) and `ToleranceSettings.percentage(f, floor)/absolute(x)/tickSize(x)`; presets `touchCountBiasPreset()`, `extremeSwingBiasPreset()`; inspect `getCurrentSegment()` (anchors, slope, score). Mirror `TrendLineResistanceIndicator`. `PriceClusterSupportIndicator(series|price[, lookback, tolerance | +volume weight])` / `ResistanceIndicator` — clustered closes; `BounceCountSupportIndicator(series|price, bucketSize[, lookback])` / `ResistanceIndicator` — reaction frequency; `VolumeProfileKDEIndicator(series, bandwidth)` / `(price, volume, lookback, bandwidth)` with `getDensityAtPrice(i, price)` and `getModePrice(i)` — smoothed volume-at-price. Keep `barCount ≤ series.setMaximumBarCount` or anchors get evicted.

## Wyckoff — `org.ta4j.core.indicators.wyckoff`

`WyckoffPhaseIndicator.builder(series).withSwingConfiguration(2,2,1).withVolumeWindows(5,20).withTolerances(n1,n2).withVolumeThresholds(v1,v2).build()` (or plain `(series)` defaults) → `Indicator<WyckoffPhase>` with `cycleType()`, `phaseType()`, `confidence()`, `latestEventIndex()`; treat output as probabilistic and gate on confidence (e.g. ≥0.75). `WyckoffCycleFacade.of(series)` / `.builder(series)` adds `phase(i)`, `tradingRangeLow(i)`, `tradingRangeHigh(i)`; `WyckoffCycleAnalysisRunner`/`WyckoffCycleAnalysisResult` for one-shot multi-degree snapshots; `WyckoffEventDetector`, `WyckoffStructureTracker`, `WyckoffVolumeProfile`, `WyckoffPhaseType`, `WyckoffCycleType`, `WyckoffEvent` are the supporting types.

## Bill Williams — root package

- `AlligatorIndicator.jaw(series)` / `.teeth(series)` / `.lips(series)` — canonical displaced SMMA(13,8)/(8,5)/(5,3) on median price; full control via `(indicator, barCount, shift)`. Line ordering (lips>teeth>jaw) = trend regime; displacement reads `i−shift`, no look-ahead.
- `FractalHighIndicator(series[, precedingBars, followingBars])` / `FractalLowIndicator` — `Indicator<Boolean>` confirming on the current bar with default 2/2 windows; the pivot is earlier — use `getConfirmedFractalIndex(i)` to reference it without look-ahead bias.
- `GatorOscillatorIndicator.upper(jaw, teeth, lips)` / `.lower(...)` or `(series, upperHistogram)` — histogram of line spreads.
- `MarketFacilitationIndexIndicator(series)` / `(high, low, volume)` — BW MFI `(H−L)/volume`; **not** `MoneyFlowIndexIndicator`.
- `AwesomeOscillatorIndicator(series)` / `(medianPrice[, fast, slow])` — 5/34 SMA spread on median price.
- `AccelerationDecelerationIndicator(series[, fast, slow])` — AO minus its 5-SMA.
Combine: trend gate (lips>teeth>jaw) ∧ `BooleanIndicatorRule(fractalHigh)` ∧ gator/MFI participation.

## Kalman & state estimation — root package

`KalmanFilterIndicator(...)` — standard recursive smoother; `CorrentropyKalmanFilterIndicator(indicator, processNoiseVariance, measurementNoiseVariance, bandwidthNum)` — robust same-index smoother rejecting outlier measurements; inspect `measurementWeight()` (`CorrentropyKalmanWeightIndicator`, [0,1], not a probability) and `residual()` (`CorrentropyKalmanResidualIndicator`). `KalmanNoiseIndicator(indicator[, scalingFactor])` wraps Q/R (variance units — price-squared for prices; bandwidth is dimensionless). `KinematicKalmanFilterIndicator(indicator[, processNoise, measurementNoise | KalmanNoiseIndicator…])` — velocity-aware variant. None of these forecast forward; warm-up = max of source/Q/R.

## Pointers (covered in other reference files)

- `org.ta4j.core.indicators.elliott` (+ `elliott.confidence`, `elliott.walkforward`, `analysis.elliott.swing`): Elliott swings/counts/scenarios/confidence — see the elliott reference.
- `org.ta4j.core.indicators.forecast` (+ `.state`, `.projection`, `.adapters`): Monte Carlo/analog/conformal return & price forecasts — see the forecast reference.
- `org.ta4j.core.indicators.renko`: `RenkoUpIndicator(price, pointSize[, brickCount])`, `RenkoDownIndicator`, `RenkoXIndicator` — brick signals for Renko-style series.
- `org.ta4j.core.indicators.lppl`: `LPPLFitIndicator`, `LPPLResidualIndicator` — bubble-detection logistic fits.
- `org.ta4j.core.indicators.orderbook`: `OrderBookMidPriceIndicator`, `OrderBookSpreadIndicator`, `OrderBookDepthIndicator`, `OrderBookImbalanceIndicator` — need order-book-carrying bars.
- `org.ta4j.core.analysis`: `CashFlow`, `Returns`, `CumulativePnL`, `InvestedInterval` — strategy-result indicators for analytics, not signals.

## Pitfalls

- Importing `MACDVIndicator` from the root package — it was removed; the live one is `org.ta4j.core.indicators.macd.MACDVIndicator`, and its thresholds are not comparable with plain `MACDIndicator`.
- Pairing a ZigZag recent-swing indicator with a price source that doesn't match the state's high/low source — you silently mix pivot definitions.
- Treating `PriceClusterSupportIndicator`/trendline outputs as always defined: they return `NaN` until their lookback fills (≥2 swings for trendlines); gate rules accordingly.
- Session pivots (`PivotPointIndicator`) on bars not aligned to sessions — levels become meaningless.
- Reading `IchimokuChikouSpanIndicator` at index `i` as "today's value": it is the close plotted `timeDelay` bars back.
- Using a named candlestick pattern as a reversal model: it encodes geometry only; add trend context shifted before the pattern and honor `getCountOfUnstableBars()`.
- Comparing `CorrentropyKalmanFilterIndicator` bandwidth to price units — it is dimensionless (standardized error units).
- Trusting `StochasticIndicator`, `JMAIndicator`, `SchaffTrendCycleIndicator`, KVO, `CusumIndicator` across `setMaximumBarCount` eviction — they re-anchor; read every appended bar or recreate with full history.

Upstream: [Indicators Inventory](https://ta4j.github.io/ta4j-wiki/Indicators-Inventory.html), [Moving Average Indicators](https://ta4j.github.io/ta4j-wiki/Moving-Average-Indicators.html), [Technical Indicators](https://ta4j.github.io/ta4j-wiki/Technical-indicators.html); sources under [org/ta4j/core/indicators](https://github.com/ta4j/ta4j/blob/master/ta4j-core/src/main/java/org/ta4j/core/indicators/).

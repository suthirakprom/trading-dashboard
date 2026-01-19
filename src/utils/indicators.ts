import type { CandleData } from '../services/chartService';

export interface IndicatorData {
    time: string;
    value: number;
}

export interface MACDData {
    time: string;
    macd: number;
    signal: number;
    histogram: number;
}

export interface BollingerBands {
    time: string;
    upper: number;
    middle: number;
    lower: number;
}

export interface SupportResistance {
    level: number;
    type: 'support' | 'resistance';
    strength: number;
}

export type Signal = 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
export type Trend = 'bullish' | 'bearish' | 'sideways';

export interface TechnicalSummary {
    rsi: { value: number; signal: Signal };
    macd: { value: MACDData | null; signal: Signal };
    bollingerBands: { position: 'upper' | 'middle' | 'lower'; signal: Signal };
    sma20: { value: number; signal: Signal };
    sma50: { value: number; signal: Signal };
    sma200: { value: number; signal: Signal };
    ema12: { value: number; signal: Signal };
    ema26: { value: number; signal: Signal };
    trend: Trend;
    overallBias: Signal;
    buySignals: number;
    sellSignals: number;
    neutralSignals: number;
}

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(data: CandleData[], period: number): IndicatorData[] {
    const result: IndicatorData[] = [];

    for (let i = period - 1; i < data.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j].close;
        }
        result.push({
            time: data[i].time,
            value: sum / period,
        });
    }

    return result;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(data: CandleData[], period: number): IndicatorData[] {
    if (data.length < period) return [];

    const result: IndicatorData[] = [];
    const multiplier = 2 / (period + 1);

    // Start with SMA for first EMA value
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += data[i].close;
    }
    let ema = sum / period;
    result.push({ time: data[period - 1].time, value: ema });

    // Calculate EMA for remaining data
    for (let i = period; i < data.length; i++) {
        ema = (data[i].close - ema) * multiplier + ema;
        result.push({ time: data[i].time, value: ema });
    }

    return result;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(data: CandleData[], period: number = 14): IndicatorData[] {
    if (data.length < period + 1) return [];

    const result: IndicatorData[] = [];
    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < data.length; i++) {
        const change = data[i].close - data[i - 1].close;
        gains.push(change > 0 ? change : 0);
        losses.push(change < 0 ? Math.abs(change) : 0);
    }

    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = period; i <= gains.length; i++) {
        if (i === period) {
            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            const rsi = 100 - (100 / (1 + rs));
            result.push({ time: data[i].time, value: rsi });
        } else {
            avgGain = (avgGain * (period - 1) + gains[i - 1]) / period;
            avgLoss = (avgLoss * (period - 1) + losses[i - 1]) / period;
            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            const rsi = 100 - (100 / (1 + rs));
            result.push({ time: data[i].time, value: rsi });
        }
    }

    return result;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
    data: CandleData[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9
): MACDData[] {
    if (data.length < slowPeriod + signalPeriod) return [];

    const ema12 = calculateEMA(data, fastPeriod);
    const ema26 = calculateEMA(data, slowPeriod);

    // Calculate MACD line (EMA12 - EMA26)
    const macdLine: IndicatorData[] = [];
    const offset = slowPeriod - fastPeriod;

    for (let i = 0; i < ema26.length; i++) {
        macdLine.push({
            time: ema26[i].time,
            value: ema12[i + offset].value - ema26[i].value,
        });
    }

    // Calculate Signal line (9-day EMA of MACD line)
    const signalLine: number[] = [];
    const multiplier = 2 / (signalPeriod + 1);

    let signalEma = macdLine.slice(0, signalPeriod).reduce((a, b) => a + b.value, 0) / signalPeriod;
    signalLine.push(signalEma);

    for (let i = signalPeriod; i < macdLine.length; i++) {
        signalEma = (macdLine[i].value - signalEma) * multiplier + signalEma;
        signalLine.push(signalEma);
    }

    // Combine MACD, Signal, and Histogram
    const result: MACDData[] = [];
    for (let i = signalPeriod - 1; i < macdLine.length; i++) {
        const signalIdx = i - signalPeriod + 1;
        result.push({
            time: macdLine[i].time,
            macd: macdLine[i].value,
            signal: signalLine[signalIdx],
            histogram: macdLine[i].value - signalLine[signalIdx],
        });
    }

    return result;
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(
    data: CandleData[],
    period: number = 20,
    stdDev: number = 2
): BollingerBands[] {
    if (data.length < period) return [];

    const result: BollingerBands[] = [];
    const sma = calculateSMA(data, period);

    for (let i = period - 1; i < data.length; i++) {
        // Calculate standard deviation
        let sumSquaredDiff = 0;
        for (let j = 0; j < period; j++) {
            const diff = data[i - j].close - sma[i - period + 1].value;
            sumSquaredDiff += diff * diff;
        }
        const sd = Math.sqrt(sumSquaredDiff / period);

        result.push({
            time: data[i].time,
            upper: sma[i - period + 1].value + (stdDev * sd),
            middle: sma[i - period + 1].value,
            lower: sma[i - period + 1].value - (stdDev * sd),
        });
    }

    return result;
}

/**
 * Calculate Support and Resistance levels
 */
export function calculateSupportResistance(
    data: CandleData[],
    lookback: number = 20,
    tolerance: number = 0.002
): SupportResistance[] {
    if (data.length < lookback) return [];

    const levels: Map<number, { count: number; type: 'support' | 'resistance' }> = new Map();

    for (let i = 2; i < data.length - 2; i++) {
        const candle = data[i];
        const prevCandle = data[i - 1];
        const nextCandle = data[i + 1];

        if (candle.high > prevCandle.high && candle.high > nextCandle.high) {
            addLevel(levels, candle.high, 'resistance', tolerance);
        }

        if (candle.low < prevCandle.low && candle.low < nextCandle.low) {
            addLevel(levels, candle.low, 'support', tolerance);
        }
    }

    const result: SupportResistance[] = [];
    levels.forEach((value, level) => {
        if (value.count >= 2) {
            result.push({ level, type: value.type, strength: value.count });
        }
    });

    return result.sort((a, b) => b.strength - a.strength).slice(0, 6);
}

function addLevel(
    levels: Map<number, { count: number; type: 'support' | 'resistance' }>,
    price: number,
    type: 'support' | 'resistance',
    tolerance: number
): void {
    for (const [existingLevel, data] of levels.entries()) {
        if (Math.abs(existingLevel - price) / existingLevel < tolerance) {
            data.count++;
            return;
        }
    }
    levels.set(price, { count: 1, type });
}

/**
 * Determine trend direction
 */
export function determineTrend(data: CandleData[], sma20: number, sma50: number, sma200: number): Trend {
    if (data.length < 5) return 'sideways';

    const currentPrice = data[data.length - 1].close;

    // Check if SMAs are aligned (bullish: price > 20 > 50 > 200, bearish: opposite)
    const bullishAlignment = currentPrice > sma20 && sma20 > sma50 && sma50 > sma200;
    const bearishAlignment = currentPrice < sma20 && sma20 < sma50 && sma50 < sma200;

    if (bullishAlignment) return 'bullish';
    if (bearishAlignment) return 'bearish';

    // Check recent price action
    const recentCandles = data.slice(-10);
    const highs = recentCandles.map(c => c.high);
    const lows = recentCandles.map(c => c.low);

    const higherHighs = highs.slice(1).every((h, i) => h >= highs[i]);
    const lowerLows = lows.slice(1).every((l, i) => l <= lows[i]);

    if (higherHighs && !lowerLows) return 'bullish';
    if (lowerLows && !higherHighs) return 'bearish';

    return 'sideways';
}

/**
 * Get signal from RSI value
 */
export function getRSISignal(rsi: number): Signal {
    if (rsi >= 80) return 'strong_sell';
    if (rsi >= 70) return 'sell';
    if (rsi <= 20) return 'strong_buy';
    if (rsi <= 30) return 'buy';
    return 'neutral';
}

/**
 * Get signal from MACD
 */
export function getMACDSignal(macd: MACDData | null): Signal {
    if (!macd) return 'neutral';

    // Histogram growing positive = bullish momentum
    if (macd.histogram > 0 && macd.macd > macd.signal) {
        return macd.histogram > 0.001 ? 'strong_buy' : 'buy';
    }
    // Histogram growing negative = bearish momentum
    if (macd.histogram < 0 && macd.macd < macd.signal) {
        return macd.histogram < -0.001 ? 'strong_sell' : 'sell';
    }
    return 'neutral';
}

/**
 * Get signal from Bollinger Bands position
 */
export function getBBSignal(currentPrice: number, bb: BollingerBands | null): { position: 'upper' | 'middle' | 'lower'; signal: Signal } {
    if (!bb) return { position: 'middle', signal: 'neutral' };

    const bandwidth = bb.upper - bb.lower;
    const upperThreshold = bb.upper - bandwidth * 0.1;
    const lowerThreshold = bb.lower + bandwidth * 0.1;

    if (currentPrice >= upperThreshold) {
        return { position: 'upper', signal: 'sell' };
    }
    if (currentPrice <= lowerThreshold) {
        return { position: 'lower', signal: 'buy' };
    }
    return { position: 'middle', signal: 'neutral' };
}

/**
 * Get signal from price vs MA
 */
export function getMASignal(currentPrice: number, maValue: number): Signal {
    const diff = (currentPrice - maValue) / maValue;

    if (diff > 0.02) return 'strong_buy'; // Price 2%+ above MA
    if (diff > 0) return 'buy';
    if (diff < -0.02) return 'strong_sell'; // Price 2%+ below MA
    if (diff < 0) return 'sell';
    return 'neutral';
}

/**
 * Calculate overall market bias from all indicators
 */
export function calculateOverallBias(signals: Signal[]): Signal {
    let score = 0;

    signals.forEach(signal => {
        switch (signal) {
            case 'strong_buy': score += 2; break;
            case 'buy': score += 1; break;
            case 'sell': score -= 1; break;
            case 'strong_sell': score -= 2; break;
        }
    });

    const avgScore = score / signals.length;

    if (avgScore >= 1.5) return 'strong_buy';
    if (avgScore >= 0.5) return 'buy';
    if (avgScore <= -1.5) return 'strong_sell';
    if (avgScore <= -0.5) return 'sell';
    return 'neutral';
}

/**
 * Generate comprehensive technical summary
 */
export function generateTechnicalSummary(data: CandleData[]): TechnicalSummary | null {
    if (data.length < 50) return null;

    const currentPrice = data[data.length - 1].close;

    // Calculate all indicators
    const rsiData = calculateRSI(data, 14);
    const macdData = calculateMACD(data);
    const bbData = calculateBollingerBands(data);
    const sma20Data = calculateSMA(data, 20);
    const sma50Data = calculateSMA(data, 50);
    const sma200Data = calculateSMA(data, 200);
    const ema12Data = calculateEMA(data, 12);
    const ema26Data = calculateEMA(data, 26);

    // Get latest values
    const rsi = rsiData.length > 0 ? rsiData[rsiData.length - 1].value : 50;
    const macd = macdData.length > 0 ? macdData[macdData.length - 1] : null;
    const bb = bbData.length > 0 ? bbData[bbData.length - 1] : null;
    const sma20 = sma20Data.length > 0 ? sma20Data[sma20Data.length - 1].value : currentPrice;
    const sma50 = sma50Data.length > 0 ? sma50Data[sma50Data.length - 1].value : currentPrice;
    const sma200 = sma200Data.length > 0 ? sma200Data[sma200Data.length - 1].value : currentPrice;
    const ema12 = ema12Data.length > 0 ? ema12Data[ema12Data.length - 1].value : currentPrice;
    const ema26 = ema26Data.length > 0 ? ema26Data[ema26Data.length - 1].value : currentPrice;

    // Get signals
    const rsiSignal = getRSISignal(rsi);
    const macdSignal = getMACDSignal(macd);
    const bbResult = getBBSignal(currentPrice, bb);
    const sma20Signal = getMASignal(currentPrice, sma20);
    const sma50Signal = getMASignal(currentPrice, sma50);
    const sma200Signal = getMASignal(currentPrice, sma200);
    const ema12Signal = getMASignal(currentPrice, ema12);
    const ema26Signal = getMASignal(currentPrice, ema26);

    // Determine trend
    const trend = determineTrend(data, sma20, sma50, sma200);

    // Calculate overall bias
    const allSignals = [rsiSignal, macdSignal, bbResult.signal, sma20Signal, sma50Signal, sma200Signal, ema12Signal, ema26Signal];
    const overallBias = calculateOverallBias(allSignals);

    // Count signals
    let buySignals = 0;
    let sellSignals = 0;
    let neutralSignals = 0;

    allSignals.forEach(s => {
        if (s === 'strong_buy' || s === 'buy') buySignals++;
        else if (s === 'strong_sell' || s === 'sell') sellSignals++;
        else neutralSignals++;
    });

    return {
        rsi: { value: rsi, signal: rsiSignal },
        macd: { value: macd, signal: macdSignal },
        bollingerBands: { position: bbResult.position, signal: bbResult.signal },
        sma20: { value: sma20, signal: sma20Signal },
        sma50: { value: sma50, signal: sma50Signal },
        sma200: { value: sma200, signal: sma200Signal },
        ema12: { value: ema12, signal: ema12Signal },
        ema26: { value: ema26, signal: ema26Signal },
        trend,
        overallBias,
        buySignals,
        sellSignals,
        neutralSignals,
    };
}

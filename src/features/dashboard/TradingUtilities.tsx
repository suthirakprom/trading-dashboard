import React, { useState, useMemo } from 'react';
import {
    Calculator, Activity, BookOpen, Percent, DollarSign, Target,
    TrendingUp, TrendingDown, Minus, ArrowUpCircle, ArrowDownCircle,
    RefreshCw, AlertTriangle, Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { TradeJournal } from './TradeJournal';
import { useChartData } from '../../hooks/useChartData';
import { calculatePositionSize, calculatePipValue, calculateRiskReward } from '../../utils/tradingCalculators';
import {
    generateTechnicalSummary,
    calculateSupportResistance,
    calculateRSI,
    type Signal,
    type SupportResistance
} from '../../utils/indicators';

export const TradingUtilities: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'calculators' | 'signals' | 'journal'>('calculators');

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-lg overflow-hidden h-full flex flex-col">
            {/* Header Tabs */}
            <div className="flex border-b bg-muted/30">
                <button
                    onClick={() => setActiveTab('calculators')}
                    className={cn(
                        "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2",
                        activeTab === 'calculators'
                            ? "border-primary text-primary bg-background"
                            : "border-transparent text-muted-foreground hover:bg-muted/50"
                    )}
                >
                    <Calculator className="h-4 w-4" />
                    Calculators
                </button>
                <button
                    onClick={() => setActiveTab('signals')}
                    className={cn(
                        "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2",
                        activeTab === 'signals'
                            ? "border-primary text-primary bg-background"
                            : "border-transparent text-muted-foreground hover:bg-muted/50"
                    )}
                >
                    <Activity className="h-4 w-4" />
                    Signals
                </button>
                <button
                    onClick={() => setActiveTab('journal')}
                    className={cn(
                        "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2",
                        activeTab === 'journal'
                            ? "border-primary text-primary bg-background"
                            : "border-transparent text-muted-foreground hover:bg-muted/50"
                    )}
                >
                    <BookOpen className="h-4 w-4" />
                    Journal
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'calculators' && <CalculatorsTab />}
                {activeTab === 'signals' && <EnhancedSignalsTab />}
                {activeTab === 'journal' && <div className="p-4"><TradeJournal /></div>}
            </div>
        </div>
    );
};

// ============ CALCULATORS TAB ============
const CalculatorsTab: React.FC = () => {
    const [calcType, setCalcType] = useState<'position' | 'pip' | 'risk'>('position');

    return (
        <div className="p-4 space-y-6">
            {/* Calculator Type Selector */}
            <div className="flex gap-2">
                {(['position', 'pip', 'risk'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setCalcType(type)}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200",
                            calcType === type
                                ? "bg-primary text-primary-foreground border-primary shadow-md"
                                : "bg-background hover:bg-accent hover:border-accent"
                        )}
                    >
                        {type === 'position' && 'Position Size'}
                        {type === 'pip' && 'Pip Value'}
                        {type === 'risk' && 'Risk/Reward'}
                    </button>
                ))}
            </div>

            {calcType === 'position' && <PositionSizeCalculator />}
            {calcType === 'pip' && <PipValueCalculator />}
            {calcType === 'risk' && <RiskRewardCalculator />}
        </div>
    );
};

const PositionSizeCalculator: React.FC = () => {
    const [balance, setBalance] = useState(10000);
    const [riskPercent, setRiskPercent] = useState(1);
    const [stopLoss, setStopLoss] = useState(20);
    const [pipValue, setPipValue] = useState(10);

    const { lots, riskAmount } = calculatePositionSize({
        accountBalance: balance,
        riskPercentage: riskPercent,
        stopLossPips: stopLoss,
        pipValue
    });

    return (
        <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" /> Position Size Calculator
            </h3>

            <div className="grid grid-cols-2 gap-4">
                <InputField
                    label="Account Balance ($)"
                    value={balance}
                    onChange={setBalance}
                />
                <InputField
                    label="Risk (%)"
                    value={riskPercent}
                    onChange={setRiskPercent}
                    step={0.5}
                />
                <InputField
                    label="Stop Loss (Pips)"
                    value={stopLoss}
                    onChange={setStopLoss}
                />
                <InputField
                    label="Pip Value ($)"
                    value={pipValue}
                    onChange={setPipValue}
                />
            </div>

            <div className="mt-6 p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg border space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Risk Amount:</span>
                    <span className="font-mono font-medium text-red-500">${riskAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-medium">Position Size:</span>
                    <span className="text-xl font-bold text-primary">{lots} Lots</span>
                </div>
            </div>
        </div>
    );
};

const PipValueCalculator: React.FC = () => {
    const [lotSize, setLotSize] = useState(1);
    const [pair, setPair] = useState('EUR/USD');
    const [price, setPrice] = useState(1.0950);

    const pipValue = calculatePipValue(pair, price) * lotSize;

    return (
        <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" /> Pip Value Calculator
            </h3>

            <div className="space-y-3">
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Currency Pair</label>
                    <select
                        value={pair}
                        onChange={(e) => setPair(e.target.value)}
                        className="w-full px-3 py-2 bg-background border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                        <option value="EUR/USD">EUR/USD</option>
                        <option value="GBP/USD">GBP/USD</option>
                        <option value="USD/JPY">USD/JPY</option>
                        <option value="USD/CHF">USD/CHF</option>
                        <option value="XAU/USD">XAU/USD (Gold)</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <InputField label="Lot Size" value={lotSize} onChange={setLotSize} step={0.01} />
                    {pair !== 'EUR/USD' && (
                        <InputField label="Current Price" value={price} onChange={setPrice} step={0.0001} />
                    )}
                </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border border-green-500/20">
                <div className="flex justify-between items-center">
                    <span className="font-medium">Pip Value:</span>
                    <span className="text-xl font-bold text-green-500">${pipValue.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

const RiskRewardCalculator: React.FC = () => {
    const [entry, setEntry] = useState(2000.00);
    const [stopLoss, setStopLoss] = useState(1990.00);
    const [takeProfit, setTakeProfit] = useState(2020.00);
    const [type, setType] = useState<'buy' | 'sell'>('buy');

    const { ratio, riskPerLot, rewardPerLot } = calculateRiskReward({
        entryPrice: entry,
        stopLoss,
        takeProfit,
        orderType: type
    });

    return (
        <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" /> Risk/Reward Calculator
            </h3>

            {/* Buy/Sell Toggle */}
            <div className="flex bg-muted/50 rounded-lg p-1">
                <button
                    onClick={() => setType('buy')}
                    className={cn(
                        "flex-1 text-xs py-2 rounded-md font-medium transition-all flex items-center justify-center gap-1",
                        type === 'buy' ? "bg-green-500 text-white shadow-md" : "text-muted-foreground hover:bg-muted"
                    )}
                >
                    <TrendingUp className="h-3 w-3" /> Long
                </button>
                <button
                    onClick={() => setType('sell')}
                    className={cn(
                        "flex-1 text-xs py-2 rounded-md font-medium transition-all flex items-center justify-center gap-1",
                        type === 'sell' ? "bg-red-500 text-white shadow-md" : "text-muted-foreground hover:bg-muted"
                    )}
                >
                    <TrendingDown className="h-3 w-3" /> Short
                </button>
            </div>

            <div className="space-y-3">
                <InputField label="Entry Price" value={entry} onChange={setEntry} step={0.01} />
                <div className="grid grid-cols-2 gap-3">
                    <InputField
                        label="Stop Loss"
                        value={stopLoss}
                        onChange={setStopLoss}
                        step={0.01}
                        className="border-red-500/30 focus:border-red-500"
                    />
                    <InputField
                        label="Take Profit"
                        value={takeProfit}
                        onChange={setTakeProfit}
                        step={0.01}
                        className="border-green-500/30 focus:border-green-500"
                    />
                </div>
            </div>

            <div className="mt-4 p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg border space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">R:R Ratio:</span>
                    <span className={cn("text-lg font-bold", ratio >= 2 ? "text-green-500" : ratio >= 1 ? "text-yellow-500" : "text-red-500")}>
                        1 : {ratio}
                    </span>
                </div>

                {/* Visual Ratio Bar */}
                <div className="h-3 flex rounded-full overflow-hidden bg-muted">
                    <div className="bg-red-500" style={{ flex: 1 }} />
                    <div className="bg-green-500" style={{ flex: Math.min(ratio, 5) }} />
                </div>

                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                    <span>Risk: ${Math.abs(riskPerLot).toFixed(2)}</span>
                    <span>Reward: ${Math.abs(rewardPerLot).toFixed(2)}</span>
                </div>

                {ratio < 1 && (
                    <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 p-2 rounded">
                        <AlertTriangle className="h-3 w-3" />
                        Poor risk/reward. Consider adjusting levels.
                    </div>
                )}
            </div>
        </div>
    );
};

// ============ ENHANCED SIGNALS TAB ============
const EnhancedSignalsTab: React.FC = () => {
    const [symbol, setSymbol] = useState('XAU/USD');
    const { data, isLoading, error, lastUpdated, refetch } = useChartData(symbol, '1h', 60000);

    const summary = useMemo(() => {
        if (data.length < 50) return null;
        return generateTechnicalSummary(data);
    }, [data]);

    const srLevels = useMemo(() => {
        if (data.length < 20) return [];
        return calculateSupportResistance(data);
    }, [data]);

    const sentiment = useMemo(() => {
        if (data.length < 20) return null;
        return calculateSentiment(data);
    }, [data]);

    const currentPrice = data.length > 0 ? data[data.length - 1].close : 0;

    const formatPrice = (price: number) => {
        if (symbol === 'USD/JPY') return price.toFixed(3);
        if (symbol === 'XAU/USD') return price.toFixed(2);
        return price.toFixed(5);
    };

    if (isLoading && !summary) {
        return (
            <div className="p-4 space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Loading analysis...</span>
                </div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <select
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="px-3 py-1.5 text-sm bg-background border rounded-md font-medium focus:ring-2 focus:ring-primary/20"
                >
                    <option value="XAU/USD">🥇 XAU/USD</option>
                    <option value="EUR/USD">🇪🇺 EUR/USD</option>
                    <option value="GBP/USD">🇬🇧 GBP/USD</option>
                    <option value="USD/JPY">🇯🇵 USD/JPY</option>
                </select>
                <button
                    onClick={refetch}
                    disabled={isLoading}
                    className="p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </button>
            </div>

            {error || !summary ? (
                <div className="p-4 rounded-lg bg-muted/50 text-center text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Insufficient data for analysis</p>
                </div>
            ) : (
                <>
                    {/* Current Price & Overall Bias */}
                    <div className="p-4 rounded-lg bg-gradient-to-br from-muted/50 to-background border">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-2xl font-bold tabular-nums">{formatPrice(currentPrice)}</span>
                            <BiasChip bias={summary.overallBias} />
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className={cn(
                                "flex items-center gap-1",
                                summary.trend === 'bullish' ? 'text-green-500' : summary.trend === 'bearish' ? 'text-red-500' : 'text-yellow-500'
                            )}>
                                {summary.trend === 'bullish' && <ArrowUpCircle className="h-4 w-4" />}
                                {summary.trend === 'bearish' && <ArrowDownCircle className="h-4 w-4" />}
                                {summary.trend === 'sideways' && <Minus className="h-4 w-4" />}
                                {summary.trend.charAt(0).toUpperCase() + summary.trend.slice(1)} Trend
                            </span>
                        </div>
                    </div>

                    {/* Sentiment Indicator */}
                    {sentiment && <SentimentIndicator sentiment={sentiment} />}

                    {/* Quick Signals */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Technical Signals</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <SignalCard
                                label="RSI (14)"
                                value={summary.rsi.value.toFixed(1)}
                                signal={summary.rsi.signal}
                                note={summary.rsi.value > 70 ? 'Overbought' : summary.rsi.value < 30 ? 'Oversold' : null}
                            />
                            <SignalCard
                                label="MACD"
                                value={summary.macd.value ? (summary.macd.value.histogram > 0 ? '+' : '') + summary.macd.value.histogram.toFixed(4) : 'N/A'}
                                signal={summary.macd.signal}
                            />
                            <SignalCard
                                label="MA Cross"
                                value={summary.ema12.value > summary.ema26.value ? 'Bullish' : 'Bearish'}
                                signal={summary.ema12.value > summary.ema26.value ? 'buy' : 'sell'}
                            />
                            <SignalCard
                                label="BB Position"
                                value={summary.bollingerBands.position.charAt(0).toUpperCase() + summary.bollingerBands.position.slice(1)}
                                signal={summary.bollingerBands.signal}
                            />
                        </div>
                    </div>

                    {/* Support & Resistance */}
                    {srLevels.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <Target className="h-3 w-3" /> Key Levels
                            </h4>
                            <SupportResistanceDisplay
                                levels={srLevels}
                                currentPrice={currentPrice}
                                formatPrice={formatPrice}
                            />
                        </div>
                    )}

                    {/* Signal Summary */}
                    <div className="p-3 rounded-lg bg-muted/30 border">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-green-500">{summary.buySignals} Buy</span>
                            <span className="text-yellow-500">{summary.neutralSignals} Neutral</span>
                            <span className="text-red-500">{summary.sellSignals} Sell</span>
                        </div>
                        <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                            <div className="bg-green-500" style={{ width: `${(summary.buySignals / 8) * 100}%` }} />
                            <div className="bg-yellow-500" style={{ width: `${(summary.neutralSignals / 8) * 100}%` }} />
                            <div className="bg-red-500" style={{ width: `${(summary.sellSignals / 8) * 100}%` }} />
                        </div>
                    </div>

                    {/* Last Updated */}
                    <p className="text-xs text-muted-foreground text-center">
                        Updated {lastUpdated ? lastUpdated.toLocaleTimeString() : 'never'}
                    </p>
                </>
            )}
        </div>
    );
};

// ============ HELPER COMPONENTS ============

interface InputFieldProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    step?: number;
    className?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, step = 1, className }) => (
    <div className="space-y-1">
        <label className="text-xs text-muted-foreground">{label}</label>
        <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            step={step}
            className={cn(
                "w-full px-3 py-2 bg-background border rounded-md text-sm",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                "placeholder:text-muted-foreground",
                className
            )}
        />
    </div>
);

const BiasChip: React.FC<{ bias: Signal }> = ({ bias }) => {
    const config = {
        strong_buy: { bg: 'bg-green-500', text: 'STRONG BUY', icon: TrendingUp },
        buy: { bg: 'bg-green-500/80', text: 'BUY', icon: TrendingUp },
        neutral: { bg: 'bg-yellow-500', text: 'NEUTRAL', icon: Minus },
        sell: { bg: 'bg-red-500/80', text: 'SELL', icon: TrendingDown },
        strong_sell: { bg: 'bg-red-500', text: 'STRONG SELL', icon: TrendingDown },
    };
    const { bg, text, icon: Icon } = config[bias];

    return (
        <span className={cn("px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1", bg)}>
            <Icon className="h-3 w-3" /> {text}
        </span>
    );
};

const SignalCard: React.FC<{ label: string; value: string; signal: Signal; note?: string | null }> = ({ label, value, signal, note }) => {
    const signalColor = {
        strong_buy: 'text-green-400 bg-green-500/10 border-green-500/30',
        buy: 'text-green-500 bg-green-500/10 border-green-500/30',
        neutral: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
        sell: 'text-red-500 bg-red-500/10 border-red-500/30',
        strong_sell: 'text-red-400 bg-red-500/10 border-red-500/30',
    };

    return (
        <div className={cn("p-3 rounded-lg border", signalColor[signal])}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-bold">{value}</p>
            {note && <p className="text-xs mt-1 opacity-75">{note}</p>}
        </div>
    );
};

interface SentimentData {
    score: number; // -100 to 100
    label: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
    momentum: 'accelerating' | 'stable' | 'decelerating';
}

const calculateSentiment = (data: import('../../services/chartService').CandleData[]): SentimentData => {
    // Calculate sentiment based on price momentum and RSI
    const rsiData = calculateRSI(data, 14);
    const latestRsi = rsiData.length > 0 ? rsiData[rsiData.length - 1].value : 50;

    // Price momentum (last 10 candles)
    const recentData = data.slice(-10);
    const priceChange = recentData.length > 1
        ? ((recentData[recentData.length - 1].close - recentData[0].close) / recentData[0].close) * 100
        : 0;

    // Combine RSI and momentum for sentiment score (-100 to 100)
    const rsiScore = (latestRsi - 50) * 2; // -100 to 100
    const momentumScore = Math.max(-100, Math.min(100, priceChange * 20)); // Scaled
    const score = Math.round((rsiScore * 0.6 + momentumScore * 0.4));

    // Determine label
    let label: SentimentData['label'];
    if (score <= -60) label = 'Extreme Fear';
    else if (score <= -20) label = 'Fear';
    else if (score <= 20) label = 'Neutral';
    else if (score <= 60) label = 'Greed';
    else label = 'Extreme Greed';

    // Momentum direction
    const momentum = priceChange > 0.5 ? 'accelerating' : priceChange < -0.5 ? 'decelerating' : 'stable';

    return { score, label, momentum };
};

const SentimentIndicator: React.FC<{ sentiment: SentimentData }> = ({ sentiment }) => {
    const position = ((sentiment.score + 100) / 200) * 100;

    return (
        <div className="p-3 rounded-lg bg-muted/30 border space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Market Sentiment
                </span>
                <span className={cn(
                    "text-xs font-bold",
                    sentiment.label.includes('Fear') ? 'text-red-500' :
                        sentiment.label.includes('Greed') ? 'text-green-500' : 'text-yellow-500'
                )}>
                    {sentiment.label}
                </span>
            </div>

            {/* Sentiment Gauge */}
            <div className="relative h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500">
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-5 bg-white border-2 border-gray-800 rounded-sm shadow-lg transition-all duration-500"
                    style={{ left: `calc(${position}% - 6px)` }}
                />
            </div>

            <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Fear</span>
                <span>Neutral</span>
                <span>Greed</span>
            </div>
        </div>
    );
};

const SupportResistanceDisplay: React.FC<{
    levels: SupportResistance[];
    currentPrice: number;
    formatPrice: (price: number) => string;
}> = ({ levels, currentPrice, formatPrice }) => {
    const resistances = levels.filter(l => l.type === 'resistance' && l.level > currentPrice).slice(0, 2);
    const supports = levels.filter(l => l.type === 'support' && l.level < currentPrice).slice(0, 2);

    const calcDistance = (level: number) => {
        const dist = ((level - currentPrice) / currentPrice) * 100;
        return dist > 0 ? `+${dist.toFixed(2)}%` : `${dist.toFixed(2)}%`;
    };

    return (
        <div className="space-y-1">
            {/* Resistances */}
            {resistances.map((r, i) => (
                <div key={`r-${i}`} className="flex items-center justify-between p-2 rounded bg-red-500/10 border border-red-500/20">
                    <span className="text-red-500 text-xs font-medium">R{i + 1}</span>
                    <span className="font-mono text-sm">{formatPrice(r.level)}</span>
                    <span className="text-xs text-muted-foreground">{calcDistance(r.level)}</span>
                </div>
            ))}

            {/* Current Price Marker */}
            <div className="flex items-center justify-between p-2 rounded bg-primary/10 border border-primary/30">
                <span className="text-primary text-xs font-medium">NOW</span>
                <span className="font-mono text-sm font-bold">{formatPrice(currentPrice)}</span>
                <span className="text-xs text-muted-foreground">—</span>
            </div>

            {/* Supports */}
            {supports.map((s, i) => (
                <div key={`s-${i}`} className="flex items-center justify-between p-2 rounded bg-green-500/10 border border-green-500/20">
                    <span className="text-green-500 text-xs font-medium">S{i + 1}</span>
                    <span className="font-mono text-sm">{formatPrice(s.level)}</span>
                    <span className="text-xs text-muted-foreground">{calcDistance(s.level)}</span>
                </div>
            ))}
        </div>
    );
};

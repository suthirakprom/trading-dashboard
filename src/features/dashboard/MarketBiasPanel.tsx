import React, { useMemo } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    ArrowUpCircle,
    ArrowDownCircle,
    Activity,
    Gauge,
    BarChart3,
    Target
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useChartData } from '../../hooks/useChartData';
import {
    generateTechnicalSummary,
    calculateSupportResistance,
    type Signal,
    type Trend
} from '../../utils/indicators';

interface MarketBiasPanelProps {
    symbol?: string;
    interval?: string;
}

export const MarketBiasPanel: React.FC<MarketBiasPanelProps> = ({
    symbol = 'XAU/USD',
    interval = '1h'
}) => {
    const { data, isLoading, error }: { data: any[]; isLoading: boolean; error: string | null } = useChartData(symbol, interval, 120000);

    const summary = useMemo(() => {
        if (data.length < 50) return null;
        return generateTechnicalSummary(data);
    }, [data]);

    const srLevels = useMemo(() => {
        if (data.length < 20) return [];
        return calculateSupportResistance(data);
    }, [data]);

    const currentPrice = data.length > 0 ? data[data.length - 1].close : 0;

    const getSignalColor = (signal: Signal) => {
        switch (signal) {
            case 'strong_buy': return 'text-green-400';
            case 'buy': return 'text-green-500';
            case 'sell': return 'text-red-500';
            case 'strong_sell': return 'text-red-400';
            default: return 'text-yellow-500';
        }
    };

    const getSignalBg = (signal: Signal) => {
        switch (signal) {
            case 'strong_buy': return 'bg-green-500/20 border-green-500/50';
            case 'buy': return 'bg-green-500/10 border-green-500/30';
            case 'sell': return 'bg-red-500/10 border-red-500/30';
            case 'strong_sell': return 'bg-red-500/20 border-red-500/50';
            default: return 'bg-yellow-500/10 border-yellow-500/30';
        }
    };

    const getSignalIcon = (signal: Signal) => {
        switch (signal) {
            case 'strong_buy':
            case 'buy':
                return <TrendingUp className="h-4 w-4" />;
            case 'strong_sell':
            case 'sell':
                return <TrendingDown className="h-4 w-4" />;
            default:
                return <Minus className="h-4 w-4" />;
        }
    };

    const getTrendColor = (trend: Trend) => {
        switch (trend) {
            case 'bullish': return 'text-green-500';
            case 'bearish': return 'text-red-500';
            default: return 'text-yellow-500';
        }
    };

    const formatSignal = (signal: Signal) => {
        return signal.replace('_', ' ').toUpperCase();
    };

    const formatPrice = (price: number) => {
        return symbol === 'USD/JPY' ? price.toFixed(3) : price.toFixed(symbol === 'XAU/USD' ? 2 : 5);
    };

    if (isLoading && !summary) {
        return (
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="h-5 w-5 animate-pulse" />
                    <span>Loading technical analysis...</span>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !summary) {
        return (
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Activity className="h-5 w-5" />
                    <span>Insufficient data for analysis. Need at least 50 candles.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm space-y-6">
            {/* Header with Overall Bias */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Gauge className="h-5 w-5" />
                        Market Bias
                    </h3>
                    <p className="text-sm text-muted-foreground">{symbol} • {interval.toUpperCase()}</p>
                </div>
                <div className={cn(
                    "px-4 py-2 rounded-lg border font-bold text-lg flex items-center gap-2",
                    getSignalBg(summary.overallBias),
                    getSignalColor(summary.overallBias)
                )}>
                    {getSignalIcon(summary.overallBias)}
                    {formatSignal(summary.overallBias)}
                </div>
            </div>

            {/* Signal Summary Bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-green-500">{summary.buySignals} Buy</span>
                    <span className="text-yellow-500">{summary.neutralSignals} Neutral</span>
                    <span className="text-red-500">{summary.sellSignals} Sell</span>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                    <div
                        className="bg-green-500 transition-all"
                        style={{ width: `${(summary.buySignals / 8) * 100}%` }}
                    />
                    <div
                        className="bg-yellow-500 transition-all"
                        style={{ width: `${(summary.neutralSignals / 8) * 100}%` }}
                    />
                    <div
                        className="bg-red-500 transition-all"
                        style={{ width: `${(summary.sellSignals / 8) * 100}%` }}
                    />
                </div>
            </div>

            {/* Trend */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Current Trend</span>
                </div>
                <span className={cn("font-bold capitalize flex items-center gap-1", getTrendColor(summary.trend))}>
                    {summary.trend === 'bullish' && <ArrowUpCircle className="h-4 w-4" />}
                    {summary.trend === 'bearish' && <ArrowDownCircle className="h-4 w-4" />}
                    {summary.trend}
                </span>
            </div>

            {/* Oscillators */}
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Oscillators</h4>
                <div className="space-y-2">
                    <IndicatorRow
                        name="RSI (14)"
                        value={summary.rsi.value.toFixed(1)}
                        signal={summary.rsi.signal}
                        description={summary.rsi.value > 70 ? 'Overbought' : summary.rsi.value < 30 ? 'Oversold' : 'Neutral Zone'}
                    />
                    <IndicatorRow
                        name="MACD"
                        value={summary.macd.value ? summary.macd.value.histogram.toFixed(4) : 'N/A'}
                        signal={summary.macd.signal}
                        description={summary.macd.value && summary.macd.value.histogram > 0 ? 'Bullish Momentum' : 'Bearish Momentum'}
                    />
                    <IndicatorRow
                        name="Bollinger Bands"
                        value={summary.bollingerBands.position.charAt(0).toUpperCase() + summary.bollingerBands.position.slice(1)}
                        signal={summary.bollingerBands.signal}
                        description={`Price at ${summary.bollingerBands.position} band`}
                    />
                </div>
            </div>

            {/* Moving Averages */}
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Moving Averages</h4>
                <div className="space-y-2">
                    <IndicatorRow
                        name="SMA 20"
                        value={formatPrice(summary.sma20.value)}
                        signal={summary.sma20.signal}
                        description={currentPrice > summary.sma20.value ? 'Price Above' : 'Price Below'}
                    />
                    <IndicatorRow
                        name="SMA 50"
                        value={formatPrice(summary.sma50.value)}
                        signal={summary.sma50.signal}
                        description={currentPrice > summary.sma50.value ? 'Price Above' : 'Price Below'}
                    />
                    <IndicatorRow
                        name="SMA 200"
                        value={formatPrice(summary.sma200.value)}
                        signal={summary.sma200.signal}
                        description={currentPrice > summary.sma200.value ? 'Price Above' : 'Price Below'}
                    />
                    <IndicatorRow
                        name="EMA 12"
                        value={formatPrice(summary.ema12.value)}
                        signal={summary.ema12.signal}
                    />
                    <IndicatorRow
                        name="EMA 26"
                        value={formatPrice(summary.ema26.value)}
                        signal={summary.ema26.signal}
                    />
                </div>
            </div>

            {/* Support & Resistance */}
            {srLevels.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Key Levels
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                        {srLevels.slice(0, 4).map((sr, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "p-2 rounded text-sm flex justify-between items-center",
                                    sr.type === 'resistance' ? 'bg-red-500/10 border border-red-500/30' : 'bg-green-500/10 border border-green-500/30'
                                )}
                            >
                                <span className={sr.type === 'resistance' ? 'text-red-500' : 'text-green-500'}>
                                    {sr.type === 'resistance' ? 'R' : 'S'}
                                </span>
                                <span className="font-mono">{formatPrice(sr.level)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Current Price */}
            <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Current Price</span>
                    <span className="text-2xl font-bold tabular-nums">{formatPrice(currentPrice)}</span>
                </div>
            </div>
        </div>
    );
};

interface IndicatorRowProps {
    name: string;
    value: string;
    signal: Signal;
    description?: string;
}

const IndicatorRow: React.FC<IndicatorRowProps> = ({ name, value, signal, description }) => {
    const getSignalColor = (s: Signal) => {
        switch (s) {
            case 'strong_buy': return 'text-green-400';
            case 'buy': return 'text-green-500';
            case 'sell': return 'text-red-500';
            case 'strong_sell': return 'text-red-400';
            default: return 'text-yellow-500';
        }
    };

    const getSignalIcon = (s: Signal) => {
        switch (s) {
            case 'strong_buy':
            case 'buy':
                return <TrendingUp className="h-3 w-3" />;
            case 'strong_sell':
            case 'sell':
                return <TrendingDown className="h-3 w-3" />;
            default:
                return <Minus className="h-3 w-3" />;
        }
    };

    return (
        <div className="flex items-center justify-between p-2 rounded bg-background border">
            <div>
                <p className="font-medium text-sm">{name}</p>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm font-mono">{value}</span>
                <span className={cn("flex items-center gap-1 text-xs font-medium capitalize", getSignalColor(signal))}>
                    {getSignalIcon(signal)}
                    {signal.replace('_', ' ')}
                </span>
            </div>
        </div>
    );
};

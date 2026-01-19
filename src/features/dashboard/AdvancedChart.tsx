import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
    createChart,
    ColorType,
    CandlestickSeries,
    LineSeries,
    type IChartApi,
    type ISeriesApi
} from 'lightweight-charts';
import { useTheme } from '../../context/ThemeContext';
import { useChartData } from '../../hooks/useChartData';
import { AVAILABLE_PAIRS } from '../../services/chartService';
import { calculateSMA, calculateRSI, calculateSupportResistance } from '../../utils/indicators';
import { RefreshCw, ChevronDown, AlertCircle, TrendingUp, Activity, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

const INTERVALS = [
    { value: '1h', label: '1H' },
    { value: '4h', label: '4H' },
    { value: '1day', label: '1D' },
    { value: '1week', label: '1W' },
];

interface IndicatorState {
    sma20: boolean;
    sma50: boolean;
    sma200: boolean;
    rsi: boolean;
    supportResistance: boolean;
}

export const AdvancedChart: React.FC = () => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const rsiContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const rsiChartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const sma20Ref = useRef<ISeriesApi<'Line'> | null>(null);
    const sma50Ref = useRef<ISeriesApi<'Line'> | null>(null);
    const sma200Ref = useRef<ISeriesApi<'Line'> | null>(null);
    const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
    const srLinesRef = useRef<ISeriesApi<'Line'>[]>([]);
    const { theme } = useTheme();

    const [selectedPair, setSelectedPair] = useState('XAU/USD');
    const [selectedInterval, setSelectedInterval] = useState('1h');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isIndicatorMenuOpen, setIsIndicatorMenuOpen] = useState(false);
    const [indicators, setIndicators] = useState<IndicatorState>({
        sma20: true,
        sma50: false,
        sma200: false,
        rsi: false,
        supportResistance: false,
    });

    const { data, isLoading, error, lastUpdated, refetch } = useChartData(
        selectedPair,
        selectedInterval,
        120000
    );

    // Calculate indicators
    const sma20Data = useMemo(() => indicators.sma20 ? calculateSMA(data, 20) : [], [data, indicators.sma20]);
    const sma50Data = useMemo(() => indicators.sma50 ? calculateSMA(data, 50) : [], [data, indicators.sma50]);
    const sma200Data = useMemo(() => indicators.sma200 ? calculateSMA(data, 200) : [], [data, indicators.sma200]);
    const rsiData = useMemo(() => indicators.rsi ? calculateRSI(data, 14) : [], [data, indicators.rsi]);
    const srLevels = useMemo(() => indicators.supportResistance ? calculateSupportResistance(data) : [], [data, indicators.supportResistance]);

    // Initialize main chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chartOptions = {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: theme === 'dark' ? '#D9D9D9' : '#191919',
            },
            grid: {
                vertLines: { color: theme === 'dark' ? '#2B2B43' : '#E1E1E1' },
                horzLines: { color: theme === 'dark' ? '#2B2B43' : '#E1E1E1' },
            },
            width: chartContainerRef.current.clientWidth,
            height: indicators.rsi ? 350 : 450,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
            crosshair: {
                mode: 1, // Magnet mode
            },
        };

        const chart = createChart(chartContainerRef.current, chartOptions);
        chartRef.current = chart;

        // Candlestick series
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });
        seriesRef.current = candlestickSeries;

        // SMA 20 (Blue)
        const sma20Series = chart.addSeries(LineSeries, {
            color: '#2196F3',
            lineWidth: 1,
            title: 'SMA 20',
        });
        sma20Ref.current = sma20Series;

        // SMA 50 (Orange)
        const sma50Series = chart.addSeries(LineSeries, {
            color: '#FF9800',
            lineWidth: 1,
            title: 'SMA 50',
        });
        sma50Ref.current = sma50Series;

        // SMA 200 (Purple)
        const sma200Series = chart.addSeries(LineSeries, {
            color: '#9C27B0',
            lineWidth: 2,
            title: 'SMA 200',
        });
        sma200Ref.current = sma200Series;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [theme, indicators.rsi]);

    // Initialize RSI chart
    useEffect(() => {
        if (!indicators.rsi || !rsiContainerRef.current) {
            if (rsiChartRef.current) {
                rsiChartRef.current.remove();
                rsiChartRef.current = null;
                rsiSeriesRef.current = null;
            }
            return;
        }

        const rsiChart = createChart(rsiContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: theme === 'dark' ? '#D9D9D9' : '#191919',
            },
            grid: {
                vertLines: { color: theme === 'dark' ? '#2B2B43' : '#E1E1E1' },
                horzLines: { color: theme === 'dark' ? '#2B2B43' : '#E1E1E1' },
            },
            width: rsiContainerRef.current.clientWidth,
            height: 100,
            timeScale: {
                visible: false,
            },
            rightPriceScale: {
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
            },
        });

        rsiChartRef.current = rsiChart;

        const rsiSeries = rsiChart.addSeries(LineSeries, {
            color: '#E040FB',
            lineWidth: 2,
            title: 'RSI',
            priceFormat: {
                type: 'custom',
                formatter: (price: number) => price.toFixed(0),
            },
        });
        rsiSeriesRef.current = rsiSeries;

        // Add RSI reference lines (30 and 70)
        rsiChart.addSeries(LineSeries, {
            color: theme === 'dark' ? '#444' : '#ccc',
            lineWidth: 1,
            lineStyle: 2, // Dashed
        }).setData([
            { time: data[0]?.time || '2024-01-01', value: 70 },
            { time: data[data.length - 1]?.time || '2024-12-31', value: 70 },
        ] as any);

        rsiChart.addSeries(LineSeries, {
            color: theme === 'dark' ? '#444' : '#ccc',
            lineWidth: 1,
            lineStyle: 2,
        }).setData([
            { time: data[0]?.time || '2024-01-01', value: 30 },
            { time: data[data.length - 1]?.time || '2024-12-31', value: 30 },
        ] as any);

        const handleResize = () => {
            if (rsiContainerRef.current) {
                rsiChart.applyOptions({ width: rsiContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        // Sync time scales
        if (chartRef.current) {
            chartRef.current.timeScale().subscribeVisibleLogicalRangeChange((range) => {
                if (range && rsiChartRef.current) {
                    rsiChartRef.current.timeScale().setVisibleLogicalRange(range);
                }
            });
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            rsiChart.remove();
        };
    }, [indicators.rsi, theme, data]);

    // Update chart data
    useEffect(() => {
        if (seriesRef.current && data.length > 0) {
            const formattedData = data.map((candle) => ({
                time: candle.time,
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
            }));
            seriesRef.current.setData(formattedData as any);
            chartRef.current?.timeScale().fitContent();
        }
    }, [data]);

    // Update SMA data
    useEffect(() => {
        if (sma20Ref.current) {
            sma20Ref.current.setData(sma20Data.map(d => ({ time: d.time, value: d.value })) as any);
        }
    }, [sma20Data]);

    useEffect(() => {
        if (sma50Ref.current) {
            sma50Ref.current.setData(sma50Data.map(d => ({ time: d.time, value: d.value })) as any);
        }
    }, [sma50Data]);

    useEffect(() => {
        if (sma200Ref.current) {
            sma200Ref.current.setData(sma200Data.map(d => ({ time: d.time, value: d.value })) as any);
        }
    }, [sma200Data]);

    // Update RSI data
    useEffect(() => {
        if (rsiSeriesRef.current && rsiData.length > 0) {
            rsiSeriesRef.current.setData(rsiData.map(d => ({ time: d.time, value: d.value })) as any);
            rsiChartRef.current?.timeScale().fitContent();
        }
    }, [rsiData]);

    // Handle support/resistance lines
    useEffect(() => {
        // Remove old lines
        srLinesRef.current = [];

        if (chartRef.current && indicators.supportResistance && srLevels.length > 0 && data.length > 0) {
            const startTime = data[0].time;
            const endTime = data[data.length - 1].time;

            srLevels.forEach((sr) => {
                const line = chartRef.current!.addSeries(LineSeries, {
                    color: sr.type === 'support' ? '#26a69a' : '#ef5350',
                    lineWidth: 1,
                    lineStyle: 2, // Dashed
                    crosshairMarkerVisible: false,
                    lastValueVisible: true,
                    priceLineVisible: false,
                });

                line.setData([
                    { time: startTime, value: sr.level },
                    { time: endTime, value: sr.level },
                ] as any);

                srLinesRef.current.push(line);
            });
        }
    }, [srLevels, data, indicators.supportResistance]);

    const toggleIndicator = (key: keyof IndicatorState) => {
        setIndicators(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const selectedPairInfo = AVAILABLE_PAIRS.find(p => p.symbol === selectedPair);

    return (
        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    {/* Pair Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-2 rounded-md bg-background border hover:bg-accent transition-colors"
                        >
                            <span className="font-semibold">{selectedPair}</span>
                            <span className="text-sm text-muted-foreground hidden sm:inline">{selectedPairInfo?.name}</span>
                            <ChevronDown className={cn("h-4 w-4 transition-transform", isDropdownOpen && "rotate-180")} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 w-64 bg-card border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                                {AVAILABLE_PAIRS.map((pair) => (
                                    <button
                                        key={pair.symbol}
                                        onClick={() => {
                                            setSelectedPair(pair.symbol);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={cn(
                                            "w-full px-4 py-2 text-left hover:bg-accent transition-colors flex justify-between items-center",
                                            selectedPair === pair.symbol && "bg-accent"
                                        )}
                                    >
                                        <span className="font-medium">{pair.symbol}</span>
                                        <span className="text-sm text-muted-foreground">{pair.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Live indicator */}
                    <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs text-muted-foreground">Live</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Indicator Toggle */}
                    <div className="relative">
                        <button
                            onClick={() => setIsIndicatorMenuOpen(!isIndicatorMenuOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-muted/50 hover:bg-muted transition-colors"
                        >
                            <Activity className="h-4 w-4" />
                            <span className="hidden sm:inline">Indicators</span>
                            <ChevronDown className={cn("h-3 w-3 transition-transform", isIndicatorMenuOpen && "rotate-180")} />
                        </button>

                        {isIndicatorMenuOpen && (
                            <div className="absolute top-full right-0 mt-1 w-56 bg-card border rounded-md shadow-lg z-50 p-2">
                                <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Moving Averages</div>
                                <button
                                    onClick={() => toggleIndicator('sma20')}
                                    className={cn(
                                        "w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors",
                                        indicators.sma20 ? "bg-blue-500/20 text-blue-500" : "hover:bg-accent"
                                    )}
                                >
                                    <div className="w-3 h-0.5 bg-blue-500 rounded" />
                                    SMA 20
                                </button>
                                <button
                                    onClick={() => toggleIndicator('sma50')}
                                    className={cn(
                                        "w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors",
                                        indicators.sma50 ? "bg-orange-500/20 text-orange-500" : "hover:bg-accent"
                                    )}
                                >
                                    <div className="w-3 h-0.5 bg-orange-500 rounded" />
                                    SMA 50
                                </button>
                                <button
                                    onClick={() => toggleIndicator('sma200')}
                                    className={cn(
                                        "w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors",
                                        indicators.sma200 ? "bg-purple-500/20 text-purple-500" : "hover:bg-accent"
                                    )}
                                >
                                    <div className="w-3 h-0.5 bg-purple-500 rounded" />
                                    SMA 200
                                </button>

                                <div className="border-t my-2" />
                                <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Oscillators</div>
                                <button
                                    onClick={() => toggleIndicator('rsi')}
                                    className={cn(
                                        "w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors",
                                        indicators.rsi ? "bg-pink-500/20 text-pink-500" : "hover:bg-accent"
                                    )}
                                >
                                    <TrendingUp className="h-3 w-3" />
                                    RSI (14)
                                </button>

                                <div className="border-t my-2" />
                                <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Levels</div>
                                <button
                                    onClick={() => toggleIndicator('supportResistance')}
                                    className={cn(
                                        "w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors",
                                        indicators.supportResistance ? "bg-teal-500/20 text-teal-500" : "hover:bg-accent"
                                    )}
                                >
                                    <Minus className="h-3 w-3" />
                                    Support / Resistance
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Interval Selector */}
                    <div className="flex gap-1 bg-muted/50 rounded-md p-1">
                        {INTERVALS.map((interval) => (
                            <button
                                key={interval.value}
                                onClick={() => setSelectedInterval(interval.value)}
                                className={cn(
                                    "px-2 py-1 text-xs rounded transition-colors",
                                    selectedInterval === interval.value
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-accent"
                                )}
                            >
                                {interval.label}
                            </button>
                        ))}
                    </div>

                    {/* Refresh Button */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {lastUpdated && (
                            <span className="hidden sm:inline text-xs">
                                {lastUpdated.toLocaleTimeString()}
                            </span>
                        )}
                        <button
                            onClick={refetch}
                            disabled={isLoading}
                            className="p-1.5 hover:bg-accent rounded-md transition-colors disabled:opacity-50"
                            title="Refresh chart"
                        >
                            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Indicators Pills */}
            <div className="flex flex-wrap gap-2 mb-3">
                {indicators.sma20 && (
                    <span className="px-2 py-0.5 text-xs rounded bg-blue-500/20 text-blue-500 flex items-center gap-1">
                        <div className="w-2 h-0.5 bg-blue-500 rounded" /> SMA 20
                    </span>
                )}
                {indicators.sma50 && (
                    <span className="px-2 py-0.5 text-xs rounded bg-orange-500/20 text-orange-500 flex items-center gap-1">
                        <div className="w-2 h-0.5 bg-orange-500 rounded" /> SMA 50
                    </span>
                )}
                {indicators.sma200 && (
                    <span className="px-2 py-0.5 text-xs rounded bg-purple-500/20 text-purple-500 flex items-center gap-1">
                        <div className="w-2 h-0.5 bg-purple-500 rounded" /> SMA 200
                    </span>
                )}
                {indicators.rsi && (
                    <span className="px-2 py-0.5 text-xs rounded bg-pink-500/20 text-pink-500">RSI (14)</span>
                )}
                {indicators.supportResistance && (
                    <span className="px-2 py-0.5 text-xs rounded bg-teal-500/20 text-teal-500">S/R Levels</span>
                )}
            </div>

            {/* Error State */}
            {error && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-md bg-destructive/10 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                    <button
                        onClick={refetch}
                        className="ml-auto text-xs underline hover:no-underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Main Chart */}
            <div className="relative">
                {isLoading && data.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10">
                        <div className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 animate-spin" />
                            <span>Loading chart data...</span>
                        </div>
                    </div>
                )}
                <div ref={chartContainerRef} className="w-full" style={{ height: indicators.rsi ? 350 : 450 }} />
            </div>

            {/* RSI Chart */}
            {indicators.rsi && (
                <div className="mt-2 border-t pt-2">
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                        <span className="text-pink-500 font-medium">RSI (14)</span>
                        <span>Overbought: 70 | Oversold: 30</span>
                    </div>
                    <div ref={rsiContainerRef} className="w-full h-[100px]" />
                </div>
            )}

            {/* Footer */}
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Scroll to zoom • Drag to pan</span>
                <span>Data from Twelve Data</span>
            </div>
        </div>
    );
};

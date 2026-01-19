import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, type IChartApi, type ISeriesApi } from 'lightweight-charts';
import { useTheme } from '../../context/ThemeContext';
import { useChartData } from '../../hooks/useChartData';
import { AVAILABLE_PAIRS } from '../../services/chartService';
import { RefreshCw, ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const INTERVALS = [
    { value: '1min', label: '1m' },
    { value: '5min', label: '5m' },
    { value: '15min', label: '15m' },
    { value: '1h', label: '1H' },
    { value: '4h', label: '4H' },
    { value: '1day', label: '1D' },
];

export const PriceMonitor: React.FC = () => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const { theme } = useTheme();

    const [selectedPair, setSelectedPair] = useState('XAU/USD');
    const [selectedInterval, setSelectedInterval] = useState('1h');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const { data, isLoading, error, lastUpdated, refetch } = useChartData(
        selectedPair,
        selectedInterval,
        120000 // Refresh every 2 minutes
    );

    // Initialize chart
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
            height: 350,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
        };

        const chart = createChart(chartContainerRef.current, chartOptions);
        chartRef.current = chart;

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });
        seriesRef.current = candlestickSeries;

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
    }, [theme]);

    // Update chart data when data changes
    useEffect(() => {
        if (seriesRef.current && data.length > 0) {
            const formattedData = data.map((candle) => ({
                time: candle.time as unknown as number,
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
            }));

            seriesRef.current.setData(formattedData as any);
            chartRef.current?.timeScale().fitContent();
        }
    }, [data]);

    // Update chart colors when theme changes
    useEffect(() => {
        if (chartRef.current) {
            chartRef.current.applyOptions({
                layout: {
                    background: { type: ColorType.Solid, color: 'transparent' },
                    textColor: theme === 'dark' ? '#D9D9D9' : '#191919',
                },
                grid: {
                    vertLines: { color: theme === 'dark' ? '#2B2B43' : '#E1E1E1' },
                    horzLines: { color: theme === 'dark' ? '#2B2B43' : '#E1E1E1' },
                },
            });
        }
    }, [theme]);

    const selectedPairInfo = AVAILABLE_PAIRS.find(p => p.symbol === selectedPair);

    return (
        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm h-full">
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
                            <span className="text-sm text-muted-foreground">{selectedPairInfo?.name}</span>
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

                <div className="flex items-center gap-3">
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
                            <span className="hidden sm:inline">
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

            {/* Chart */}
            <div className="relative">
                {isLoading && data.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10">
                        <div className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 animate-spin" />
                            <span>Loading chart data...</span>
                        </div>
                    </div>
                )}
                <div ref={chartContainerRef} className="w-full h-[350px]" />
            </div>

            {/* Footer */}
            <div className="mt-2 text-xs text-center text-muted-foreground">
                Auto-refreshes every 2 minutes • Data from Twelve Data
            </div>
        </div>
    );
};

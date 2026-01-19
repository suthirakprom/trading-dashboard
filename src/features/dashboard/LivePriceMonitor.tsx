import React from 'react';
import { useForexPrices } from '../../hooks/useForexPrices';
import { RefreshCw, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export const LivePriceMonitor: React.FC = () => {
    const { prices, isLoading, error, lastUpdated, refetch, updatedSymbols } = useForexPrices(120000);

    const formatPrice = (price: number, symbol: string) => {
        const decimals = symbol === 'USD/JPY' ? 3 : symbol === 'XAU/USD' ? 2 : 5;
        return price.toFixed(decimals);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    if (error) {
        return (
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex items-center gap-3 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                        <p className="font-medium">Failed to load prices</p>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                    <button
                        onClick={refetch}
                        className="ml-auto px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">Live Prices</h3>
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {lastUpdated && <span>Updated: {formatTime(lastUpdated)}</span>}
                    <button
                        onClick={refetch}
                        disabled={isLoading}
                        className="p-1.5 hover:bg-accent rounded-md transition-colors disabled:opacity-50"
                        title="Refresh prices"
                    >
                        <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    </button>
                </div>
            </div>

            {isLoading && prices.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-4 rounded-lg bg-muted/50 animate-pulse">
                            <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                            <div className="h-8 bg-muted rounded w-28 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-16"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {prices.map((price) => {
                        const isUp = price.changePercent > 0;
                        const isDown = price.changePercent < 0;
                        const hasUpdate = updatedSymbols.has(price.symbol);

                        return (
                            <div
                                key={price.symbol}
                                className={cn(
                                    "p-4 rounded-lg border bg-background transition-all duration-300",
                                    hasUpdate && "ring-2 ring-primary/50 scale-[1.02]",
                                    "hover:shadow-md"
                                )}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-muted-foreground">{price.name}</span>
                                    <span className="text-xs px-2 py-0.5 rounded bg-muted">{price.symbol}</span>
                                </div>

                                {/* Price */}
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-2xl font-bold tabular-nums">
                                        {formatPrice(price.price, price.symbol)}
                                    </span>
                                    {hasUpdate && (
                                        <span className={cn(
                                            "h-2 w-2 rounded-full animate-pulse",
                                            isUp ? "bg-green-500" : isDown ? "bg-red-500" : "bg-yellow-500"
                                        )} />
                                    )}
                                </div>

                                {/* Change */}
                                <div className="flex items-center gap-1 mb-3">
                                    {isUp ? (
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                    ) : isDown ? (
                                        <TrendingDown className="h-4 w-4 text-red-500" />
                                    ) : null}
                                    <span
                                        className={cn(
                                            "text-sm font-medium",
                                            isUp && "text-green-500",
                                            isDown && "text-red-500",
                                            !isUp && !isDown && "text-muted-foreground"
                                        )}
                                    >
                                        {isUp ? '+' : ''}{price.change.toFixed(price.symbol === 'XAU/USD' ? 2 : 4)}
                                        {' '}
                                        ({isUp ? '+' : ''}{price.changePercent.toFixed(2)}%)
                                    </span>
                                </div>

                                {/* Bid/Ask */}
                                <div className="text-xs text-muted-foreground border-t pt-2 grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-red-400">Bid: </span>
                                        <span className="tabular-nums">{formatPrice(price.bid, price.symbol)}</span>
                                    </div>
                                    <div>
                                        <span className="text-green-400">Ask: </span>
                                        <span className="tabular-nums">{formatPrice(price.ask, price.symbol)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Auto-refresh indicator */}
            <div className="mt-4 text-xs text-center text-muted-foreground">
                Auto-refreshes every 2 minutes
            </div>
        </div>
    );
};

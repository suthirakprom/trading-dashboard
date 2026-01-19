import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, TrendingUp, TrendingDown, Flame, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EconomicEvent {
    id: string;
    date: string;
    time: string;
    currency: string;
    impact: 'high' | 'medium' | 'low';
    event: string;
    forecast?: string;
    previous?: string;
    actual?: string;
}

// Mock upcoming economic events (in production, fetch from ForexFactory API or similar)
const MOCK_EVENTS: EconomicEvent[] = [
    {
        id: '1',
        date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: new Date(Date.now() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5),
        currency: 'USD',
        impact: 'high',
        event: 'Fed Interest Rate Decision',
        forecast: '5.50%',
        previous: '5.50%',
    },
    {
        id: '2',
        date: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: new Date(Date.now() + 5 * 60 * 60 * 1000).toTimeString().slice(0, 5),
        currency: 'EUR',
        impact: 'high',
        event: 'ECB Press Conference',
        previous: '-',
    },
    {
        id: '3',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '08:30',
        currency: 'USD',
        impact: 'high',
        event: 'Non-Farm Payrolls',
        forecast: '180K',
        previous: '199K',
    },
    {
        id: '4',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '08:30',
        currency: 'USD',
        impact: 'medium',
        event: 'Unemployment Rate',
        forecast: '3.8%',
        previous: '3.7%',
    },
    {
        id: '5',
        date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '10:00',
        currency: 'USD',
        impact: 'high',
        event: 'CPI (YoY)',
        forecast: '3.2%',
        previous: '3.4%',
    },
    {
        id: '6',
        date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '04:00',
        currency: 'GBP',
        impact: 'high',
        event: 'BoE Interest Rate Decision',
        forecast: '5.25%',
        previous: '5.25%',
    },
    {
        id: '7',
        date: new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '19:00',
        currency: 'JPY',
        impact: 'medium',
        event: 'BoJ Policy Rate',
        forecast: '-0.10%',
        previous: '-0.10%',
    },
    {
        id: '8',
        date: new Date().toISOString().split('T')[0],
        time: new Date(Date.now() - 60 * 60 * 1000).toTimeString().slice(0, 5),
        currency: 'XAU',
        impact: 'high',
        event: 'Gold Demand Report (WGC)',
        actual: 'Strong',
        previous: 'Moderate',
    },
];

// Gold-related news
const GOLD_NEWS = [
    {
        id: 'g1',
        title: 'Central Banks Continue Gold Buying Spree',
        summary: 'Global central banks purchased 290 tonnes of gold in Q4, marking the highest quarterly demand.',
        time: '2 hours ago',
        impact: 'bullish' as const,
    },
    {
        id: 'g2',
        title: 'US Dollar Weakens Ahead of Fed Decision',
        summary: 'The dollar index fell 0.3% as markets anticipate a dovish Fed stance, boosting gold appeal.',
        time: '4 hours ago',
        impact: 'bullish' as const,
    },
    {
        id: 'g3',
        title: 'Treasury Yields Rise on Strong Jobs Data',
        summary: 'Higher yields pressure gold as opportunity cost increases for the non-yielding asset.',
        time: '6 hours ago',
        impact: 'bearish' as const,
    },
];

export const EconomicCalendar: React.FC = () => {
    const [events, setEvents] = useState<EconomicEvent[]>(MOCK_EVENTS);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'high' | 'gold'>('all');

    const refreshEvents = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setEvents(MOCK_EVENTS);
            setIsLoading(false);
        }, 500);
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'text-red-500 bg-red-500/20';
            case 'medium': return 'text-orange-500 bg-orange-500/20';
            default: return 'text-yellow-500 bg-yellow-500/20';
        }
    };

    const getCurrencyFlag = (currency: string) => {
        const flags: Record<string, string> = {
            USD: '🇺🇸',
            EUR: '🇪🇺',
            GBP: '🇬🇧',
            JPY: '🇯🇵',
            AUD: '🇦🇺',
            CAD: '🇨🇦',
            CHF: '🇨🇭',
            NZD: '🇳🇿',
            XAU: '🥇',
        };
        return flags[currency] || '🌍';
    };

    const formatRelativeTime = (date: string, time: string) => {
        const eventDate = new Date(`${date}T${time}`);
        const now = new Date();
        const diffMs = eventDate.getTime() - now.getTime();
        const diffHours = Math.round(diffMs / (1000 * 60 * 60));
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffMs < 0) return 'Past';
        if (diffHours < 1) return 'Soon';
        if (diffHours < 24) return `In ${diffHours}h`;
        if (diffDays === 1) return 'Tomorrow';
        return `In ${diffDays}d`;
    };

    const filteredEvents = events.filter(e => {
        if (filter === 'high') return e.impact === 'high';
        if (filter === 'gold') return e.currency === 'XAU' || e.currency === 'USD';
        return true;
    });

    return (
        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Economic Calendar
                </h3>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1 bg-muted/50 rounded-md p-1 text-xs">
                        <button
                            onClick={() => setFilter('all')}
                            className={cn(
                                "px-2 py-1 rounded transition-colors",
                                filter === 'all' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                            )}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('high')}
                            className={cn(
                                "px-2 py-1 rounded transition-colors flex items-center gap-1",
                                filter === 'high' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                            )}
                        >
                            <Flame className="h-3 w-3" /> High
                        </button>
                        <button
                            onClick={() => setFilter('gold')}
                            className={cn(
                                "px-2 py-1 rounded transition-colors",
                                filter === 'gold' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                            )}
                        >
                            🥇 Gold
                        </button>
                    </div>
                    <button
                        onClick={refreshEvents}
                        disabled={isLoading}
                        className="p-1.5 hover:bg-accent rounded-md transition-colors"
                    >
                        <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    </button>
                </div>
            </div>

            {/* Events List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredEvents.map((event) => (
                    <div
                        key={event.id}
                        className="p-3 rounded-lg bg-background border hover:bg-accent/50 transition-colors"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{getCurrencyFlag(event.currency)}</span>
                                <div>
                                    <p className="font-medium text-sm">{event.event}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                        <Clock className="h-3 w-3" />
                                        <span>{event.date} {event.time}</span>
                                        <span className="text-primary font-medium">
                                            {formatRelativeTime(event.date, event.time)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <span className={cn(
                                "px-2 py-0.5 text-xs rounded-full font-medium",
                                getImpactColor(event.impact)
                            )}>
                                {event.impact.toUpperCase()}
                            </span>
                        </div>
                        {(event.forecast || event.previous || event.actual) && (
                            <div className="flex gap-4 mt-2 text-xs">
                                {event.forecast && (
                                    <span className="text-muted-foreground">
                                        Forecast: <span className="text-foreground font-medium">{event.forecast}</span>
                                    </span>
                                )}
                                {event.previous && (
                                    <span className="text-muted-foreground">
                                        Previous: <span className="text-foreground font-medium">{event.previous}</span>
                                    </span>
                                )}
                                {event.actual && (
                                    <span className="text-muted-foreground">
                                        Actual: <span className="text-green-500 font-medium">{event.actual}</span>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Gold Market News */}
            <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    🥇 Gold Market News
                </h4>
                <div className="space-y-2">
                    {GOLD_NEWS.map((news) => (
                        <div
                            key={news.id}
                            className="p-3 rounded-lg bg-background border"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{news.title}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{news.summary}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={cn(
                                        "flex items-center gap-1 text-xs font-medium",
                                        news.impact === 'bullish' ? 'text-green-500' : 'text-red-500'
                                    )}>
                                        {news.impact === 'bullish' ? (
                                            <TrendingUp className="h-3 w-3" />
                                        ) : (
                                            <TrendingDown className="h-3 w-3" />
                                        )}
                                        {news.impact}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{news.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-xs">
                <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                    High-impact events can cause significant volatility. Consider reducing position sizes or avoiding trades during major releases.
                </p>
            </div>
        </div>
    );
};

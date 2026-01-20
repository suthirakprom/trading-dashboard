import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Calendar,
    Clock,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Flame,
    RefreshCw,
    Search,
    ExternalLink,
    Filter,
    Newspaper,
    X,
    ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
    fetchNewsAndEvents,
    filterNews,
    filterEvents,
    formatRelativeTime,
    formatEventTime,
    CURRENCY_OPTIONS,
    CATEGORY_OPTIONS,
    type NewsItem,
    type EconomicEvent,
    type NewsFilters
} from '../../services/newsService';

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

export const EnhancedNewsCalendar: React.FC = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [events, setEvents] = useState<EconomicEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [activeTab, setActiveTab] = useState<'news' | 'calendar'>('news');

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [impactFilter, setImpactFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
    const [showFilters, setShowFilters] = useState(false);

    const filters: NewsFilters = useMemo(() => ({
        search: searchQuery,
        currencies: selectedCurrencies,
        category: selectedCategory,
        impactFilter: impactFilter
    }), [searchQuery, selectedCurrencies, selectedCategory, impactFilter]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await fetchNewsAndEvents();
            setNews(result.news);
            setEvents(result.events);
            setLastUpdated(result.lastUpdated);
        } catch (error) {
            console.error('Failed to fetch news and events:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch and auto-refresh
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchData]);

    // Filtered data
    const filteredNews = useMemo(() => filterNews(news, filters), [news, filters]);
    const filteredEvents = useMemo(() => filterEvents(events, filters), [events, filters]);

    const toggleCurrency = (currency: string) => {
        setSelectedCurrencies(prev =>
            prev.includes(currency)
                ? prev.filter(c => c !== currency)
                : [...prev, currency]
        );
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCurrencies([]);
        setSelectedCategory('all');
        setImpactFilter('all');
    };

    const hasActiveFilters = searchQuery || selectedCurrencies.length > 0 ||
        selectedCategory !== 'all' || impactFilter !== 'all';

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'bullish': return 'text-green-500 bg-green-500/10';
            case 'bearish': return 'text-red-500 bg-red-500/10';
            default: return 'text-yellow-500 bg-yellow-500/10';
        }
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'text-red-500 bg-red-500/20 border-red-500/30';
            case 'medium': return 'text-orange-500 bg-orange-500/20 border-orange-500/30';
            default: return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
        }
    };

    const getCurrencyFlag = (currency: string) => {
        const option = CURRENCY_OPTIONS.find(c => c.value === currency);
        return option?.flag || '🌍';
    };

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Newspaper className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">News & Economic Calendar</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                            {lastUpdated ? `Updated ${formatRelativeTime(lastUpdated.toISOString())}` : ''}
                        </span>
                        <button
                            onClick={fetchData}
                            disabled={isLoading}
                            className="p-1.5 hover:bg-accent rounded-md transition-colors"
                            title="Refresh (auto-refreshes every 30 min)"
                        >
                            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('news')}
                        className={cn(
                            "flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2",
                            activeTab === 'news'
                                ? "bg-background shadow text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Newspaper className="h-4 w-4" />
                        News ({filteredNews.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('calendar')}
                        className={cn(
                            "flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2",
                            activeTab === 'calendar'
                                ? "bg-background shadow text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Calendar className="h-4 w-4" />
                        Calendar ({filteredEvents.length})
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="p-3 border-b space-y-3">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search news, events, currencies..."
                        className="w-full pl-9 pr-4 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Filter Toggle */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "flex items-center gap-2 text-sm px-3 py-1.5 rounded-md transition-colors",
                            showFilters || hasActiveFilters
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-accent text-muted-foreground"
                        )}
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                        {hasActiveFilters && (
                            <span className="bg-primary text-primary-foreground px-1.5 py-0.5 text-xs rounded-full">
                                {selectedCurrencies.length + (selectedCategory !== 'all' ? 1 : 0) + (impactFilter !== 'all' ? 1 : 0)}
                            </span>
                        )}
                        <ChevronDown className={cn("h-4 w-4 transition-transform", showFilters && "rotate-180")} />
                    </button>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-xs text-muted-foreground hover:text-foreground"
                        >
                            Clear all
                        </button>
                    )}
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                    <div className="space-y-3 pt-2 border-t">
                        {/* Currency Pills */}
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Filter by Currency</p>
                            <div className="flex flex-wrap gap-1.5">
                                {CURRENCY_OPTIONS.map(currency => (
                                    <button
                                        key={currency.value}
                                        onClick={() => toggleCurrency(currency.value)}
                                        className={cn(
                                            "px-2.5 py-1 text-xs rounded-full border transition-colors",
                                            selectedCurrencies.includes(currency.value)
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-background hover:bg-accent border-border"
                                        )}
                                    >
                                        {currency.flag} {currency.value}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category & Impact Filters */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs text-muted-foreground mb-2">Category</p>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-3 py-1.5 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    {CATEGORY_OPTIONS.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-2">Impact Level</p>
                                <select
                                    value={impactFilter}
                                    onChange={(e) => setImpactFilter(e.target.value as any)}
                                    className="w-full px-3 py-1.5 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="all">All Impacts</option>
                                    <option value="high">🔴 High Only</option>
                                    <option value="medium">🟠 Medium</option>
                                    <option value="low">🟢 Low</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="max-h-[500px] overflow-y-auto">
                {activeTab === 'news' ? (
                    <div className="divide-y">
                        {filteredNews.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <Newspaper className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                <p>No news found matching your filters</p>
                            </div>
                        ) : (
                            filteredNews.map(item => (
                                <article
                                    key={item.id}
                                    className="p-4 hover:bg-accent/30 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={cn(
                                                    "px-2 py-0.5 text-xs rounded-full font-medium flex items-center gap-1",
                                                    getSentimentColor(item.sentiment)
                                                )}>
                                                    {item.sentiment === 'bullish' && <TrendingUp className="h-3 w-3" />}
                                                    {item.sentiment === 'bearish' && <TrendingDown className="h-3 w-3" />}
                                                    {item.sentiment}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {item.source}
                                                </span>
                                                <span className="text-xs text-muted-foreground">•</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatRelativeTime(item.publishedAt)}
                                                </span>
                                            </div>

                                            <h4 className="font-medium text-sm leading-tight mb-1.5">
                                                {item.headline}
                                            </h4>

                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                                {item.summary}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex gap-1">
                                                    {item.currencies.map(c => (
                                                        <span key={c} className="text-sm">
                                                            {getCurrencyFlag(c)}
                                                        </span>
                                                    ))}
                                                </div>
                                                <a
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                                                >
                                                    Read more
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="divide-y">
                        {filteredEvents.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                <p>No events found matching your filters</p>
                            </div>
                        ) : (
                            filteredEvents.map(event => (
                                <div
                                    key={event.id}
                                    className="p-4 hover:bg-accent/30 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">{getCurrencyFlag(event.currency)}</span>
                                            <div>
                                                <h4 className="font-medium text-sm">{event.event}</h4>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{event.date} {event.time}</span>
                                                    <span className="text-primary font-medium">
                                                        {formatEventTime(event.date, event.time)}
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
                                        </div>

                                        <span className={cn(
                                            "px-2.5 py-1 text-xs rounded-full font-medium border flex items-center gap-1",
                                            getImpactColor(event.impact)
                                        )}>
                                            {event.impact === 'high' && <Flame className="h-3 w-3" />}
                                            {event.impact.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Footer Warning */}
            <div className="p-3 border-t bg-yellow-500/5">
                <div className="flex items-start gap-2 text-xs">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                        High-impact events can cause significant volatility. Consider reducing position sizes during major releases.
                    </p>
                </div>
            </div>
        </div>
    );
};

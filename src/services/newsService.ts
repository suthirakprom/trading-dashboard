// News and Economic Calendar Service
// Uses Finnhub API for real data with mock fallback
import axios from 'axios';

const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

export interface NewsItem {
    id: string;
    headline: string;
    summary: string;
    source: string;
    url: string;
    publishedAt: string;
    currencies: string[];
    keywords: string[];
    sentiment: 'bullish' | 'bearish' | 'neutral';
    category: 'forex' | 'gold' | 'central-bank' | 'economic' | 'general';
}

export interface EconomicEvent {
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

// Keywords for filtering news
export const FOREX_KEYWORDS = [
    'gold', 'xau', 'forex', 'usd', 'eur', 'gbp', 'jpy', 'aud', 'cad', 'chf', 'nzd',
    'central bank', 'interest rate', 'inflation', 'fed', 'fomc', 'ecb', 'boe', 'boj',
    'dollar', 'euro', 'pound', 'yen', 'currency', 'exchange rate', 'monetary policy',
    'treasury', 'bond yield', 'quantitative easing', 'gdp', 'unemployment', 'nfp',
    'cpi', 'ppi', 'trade balance', 'retail sales', 'housing', 'pmi'
];

// ============ MOCK DATA FOR FALLBACK ============
const MOCK_NEWS: NewsItem[] = [
    {
        id: 'n1',
        headline: 'Fed Signals Potential Rate Cut in March Meeting',
        summary: 'Federal Reserve officials indicated they may consider cutting interest rates as early as March if inflation continues to decline toward the 2% target.',
        source: 'Reuters',
        url: 'https://www.reuters.com/markets',
        publishedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        currencies: ['USD'],
        keywords: ['fed', 'interest rate', 'inflation'],
        sentiment: 'bearish',
        category: 'central-bank'
    },
    {
        id: 'n2',
        headline: 'Gold Prices Surge to 3-Month High Amid Dollar Weakness',
        summary: 'Spot gold climbed 1.5% to $2,045 per ounce as the US dollar weakened following dovish Fed comments.',
        source: 'Bloomberg',
        url: 'https://www.bloomberg.com/markets/commodities',
        publishedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        currencies: ['XAU', 'USD'],
        keywords: ['gold', 'dollar'],
        sentiment: 'bullish',
        category: 'gold'
    },
    {
        id: 'n3',
        headline: 'EUR/USD Breaks Above 1.10 on Strong Eurozone Data',
        summary: 'The euro gained 0.8% against the dollar after better-than-expected PMI data from Germany and France.',
        source: 'FXStreet',
        url: 'https://www.fxstreet.com',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        currencies: ['EUR', 'USD'],
        keywords: ['euro', 'dollar', 'pmi'],
        sentiment: 'bullish',
        category: 'forex'
    },
    {
        id: 'n4',
        headline: 'Bank of Japan Maintains Ultra-Loose Policy, Yen Weakens',
        summary: 'The BOJ kept its negative interest rate unchanged at -0.1%, sending USD/JPY higher.',
        source: 'Nikkei Asia',
        url: 'https://asia.nikkei.com',
        publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        currencies: ['JPY', 'USD'],
        keywords: ['boj', 'yen'],
        sentiment: 'bearish',
        category: 'central-bank'
    },
    {
        id: 'n5',
        headline: 'GBP/USD Rallies as UK Inflation Exceeds Expectations',
        summary: 'Sterling jumped 0.6% after UK CPI came in at 4.0% vs 3.8% expected.',
        source: 'The Guardian',
        url: 'https://www.theguardian.com/business',
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        currencies: ['GBP', 'USD'],
        keywords: ['pound', 'cpi', 'inflation'],
        sentiment: 'bullish',
        category: 'economic'
    }
];

const generateMockEvents = (): EconomicEvent[] => {
    const now = new Date();
    return [
        {
            id: 'e1',
            date: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: new Date(now.getTime() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5),
            currency: 'USD',
            impact: 'high',
            event: 'Fed Interest Rate Decision',
            forecast: '5.25%',
            previous: '5.50%',
        },
        {
            id: 'e2',
            date: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '13:30',
            currency: 'USD',
            impact: 'high',
            event: 'Non-Farm Payrolls',
            forecast: '175K',
            previous: '216K',
        },
        {
            id: 'e3',
            date: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '13:30',
            currency: 'USD',
            impact: 'high',
            event: 'CPI (YoY)',
            forecast: '3.2%',
            previous: '3.4%',
        },
        {
            id: 'e4',
            date: new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '12:00',
            currency: 'EUR',
            impact: 'high',
            event: 'ECB Interest Rate Decision',
            forecast: '4.50%',
            previous: '4.50%',
        },
        {
            id: 'e5',
            date: new Date(now.getTime() + 96 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '12:00',
            currency: 'GBP',
            impact: 'high',
            event: 'BoE Interest Rate Decision',
            forecast: '5.25%',
            previous: '5.25%',
        }
    ];
};

// ============ SERVICE TYPES ============
export interface NewsServiceResult {
    news: NewsItem[];
    events: EconomicEvent[];
    lastUpdated: Date;
}

export interface NewsFilters {
    search: string;
    currencies: string[];
    category: string;
    impactFilter: 'all' | 'high' | 'medium' | 'low';
}

interface FinnhubNewsItem {
    category: string;
    datetime: number;
    headline: string;
    id: number;
    image: string;
    related: string;
    source: string;
    summary: string;
    url: string;
}

// ============ FETCH FUNCTIONS ============
export const fetchNewsAndEvents = async (): Promise<NewsServiceResult> => {
    let news: NewsItem[] = [];
    let events: EconomicEvent[] = [];

    // Try to fetch real news, fall back to mock
    try {
        if (API_KEY) {
            news = await fetchFinnhubNews();
        }
    } catch (error) {
        console.warn('Finnhub news fetch failed, using mock data');
    }

    // If no news or fetch failed, use mock
    if (news.length === 0) {
        news = MOCK_NEWS;
    }

    // Always use mock events (Finnhub calendar requires paid plan)
    events = generateMockEvents();

    return {
        news,
        events,
        lastUpdated: new Date()
    };
};

const fetchFinnhubNews = async (): Promise<NewsItem[]> => {
    const response = await axios.get<FinnhubNewsItem[]>(`${BASE_URL}/news`, {
        params: {
            category: 'forex',
            token: API_KEY
        }
    });

    if (!Array.isArray(response.data) || response.data.length === 0) {
        return [];
    }

    return response.data.map(item => {
        const text = (item.headline + ' ' + item.summary).toLowerCase();
        const matchedKeywords = FOREX_KEYWORDS.filter(k => text.includes(k.toLowerCase()));

        let sentiment: NewsItem['sentiment'] = 'neutral';
        if (text.includes('surge') || text.includes('jump') || text.includes('higher') || text.includes('gain')) sentiment = 'bullish';
        if (text.includes('drop') || text.includes('fall') || text.includes('lower') || text.includes('loss')) sentiment = 'bearish';

        let category: NewsItem['category'] = 'forex';
        if (text.includes('gold') || text.includes('xau')) category = 'gold';
        else if (text.includes('central bank') || text.includes('fed') || text.includes('ecb')) category = 'central-bank';
        else if (text.includes('gdp') || text.includes('cpi') || text.includes('jobs')) category = 'economic';

        const currencies: string[] = [];
        if (text.includes('usd') || text.includes('dollar')) currencies.push('USD');
        if (text.includes('eur') || text.includes('euro')) currencies.push('EUR');
        if (text.includes('gbp') || text.includes('pound')) currencies.push('GBP');
        if (text.includes('jpy') || text.includes('yen')) currencies.push('JPY');
        if (text.includes('gold') || text.includes('xau')) currencies.push('XAU');

        return {
            id: item.id.toString(),
            headline: item.headline,
            summary: item.summary,
            source: item.source,
            url: item.url,
            publishedAt: new Date(item.datetime * 1000).toISOString(),
            currencies: currencies.length > 0 ? currencies : ['USD'],
            keywords: matchedKeywords,
            sentiment,
            category
        };
    });
};

// ============ FILTER FUNCTIONS ============
export const filterNews = (news: NewsItem[], filters: NewsFilters): NewsItem[] => {
    return news.filter(item => {
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch =
                item.headline.toLowerCase().includes(searchLower) ||
                item.summary.toLowerCase().includes(searchLower) ||
                item.keywords.some(k => k.includes(searchLower)) ||
                item.currencies.some(c => c.toLowerCase().includes(searchLower));
            if (!matchesSearch) return false;
        }

        if (filters.currencies.length > 0) {
            const matchesCurrency = item.currencies.some(c => filters.currencies.includes(c));
            if (!matchesCurrency) return false;
        }

        if (filters.category && filters.category !== 'all') {
            if (item.category !== filters.category) return false;
        }

        return true;
    });
};

export const filterEvents = (events: EconomicEvent[], filters: NewsFilters): EconomicEvent[] => {
    return events.filter(event => {
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch =
                event.event.toLowerCase().includes(searchLower) ||
                event.currency.toLowerCase().includes(searchLower);
            if (!matchesSearch) return false;
        }

        if (filters.currencies.length > 0) {
            if (!filters.currencies.includes(event.currency)) return false;
        }

        if (filters.impactFilter && filters.impactFilter !== 'all') {
            if (event.impact !== filters.impactFilter) return false;
        }

        return true;
    });
};

// ============ UTILITY FUNCTIONS ============
export const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
};

export const formatEventTime = (date: string, time: string): string => {
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

// ============ FILTER OPTIONS ============
export const CURRENCY_OPTIONS = [
    { value: 'USD', label: '🇺🇸 USD', flag: '🇺🇸' },
    { value: 'EUR', label: '🇪🇺 EUR', flag: '🇪🇺' },
    { value: 'GBP', label: '🇬🇧 GBP', flag: '🇬🇧' },
    { value: 'JPY', label: '🇯🇵 JPY', flag: '🇯🇵' },
    { value: 'XAU', label: '🥇 Gold', flag: '🥇' },
    { value: 'AUD', label: '🇦🇺 AUD', flag: '🇦🇺' },
    { value: 'CAD', label: '🇨🇦 CAD', flag: '🇨🇦' },
    { value: 'CHF', label: '🇨🇭 CHF', flag: '🇨🇭' },
];

export const CATEGORY_OPTIONS = [
    { value: 'all', label: 'All Categories' },
    { value: 'forex', label: 'Forex' },
    { value: 'gold', label: 'Gold & Commodities' },
    { value: 'central-bank', label: 'Central Banks' },
    { value: 'economic', label: 'Economic Data' },
];

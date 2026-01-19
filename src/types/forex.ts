export interface ForexPrice {
    symbol: string;
    name: string;
    price: number;
    bid: number;
    ask: number;
    change: number;
    changePercent: number;
    timestamp: number;
    previousPrice?: number;
}

export interface ForexQuote {
    symbol: string;
    name: string;
    exchange: string;
    datetime: string;
    timestamp: number;
    open: string;
    high: string;
    low: string;
    close: string;
    previous_close: string;
}

export type PriceDirection = 'up' | 'down' | 'neutral';

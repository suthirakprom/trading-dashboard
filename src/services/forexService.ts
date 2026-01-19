import axios from 'axios';
import type { ForexPrice } from '../types/forex';

const API_KEY = import.meta.env.VITE_TWELVEDATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';

// Currency pair configurations
export const CURRENCY_PAIRS = [
    { symbol: 'XAU/USD', name: 'Gold' },
    { symbol: 'EUR/USD', name: 'Euro' },
    { symbol: 'GBP/USD', name: 'British Pound' },
    { symbol: 'USD/JPY', name: 'Japanese Yen' },
];

interface TwelveDataQuote {
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

interface TwelveDataResponse {
    [symbol: string]: TwelveDataQuote;
}

export async function fetchForexPrices(): Promise<ForexPrice[]> {
    const symbols = CURRENCY_PAIRS.map(p => p.symbol).join(',');

    try {
        const response = await axios.get<TwelveDataResponse>(`${BASE_URL}/quote`, {
            params: {
                symbol: symbols,
                apikey: API_KEY,
            },
        });

        const data = response.data;

        return CURRENCY_PAIRS.map(pair => {
            const quote = data[pair.symbol];

            if (!quote || quote.close === undefined) {
                // Return placeholder for missing data
                return {
                    symbol: pair.symbol,
                    name: pair.name,
                    price: 0,
                    bid: 0,
                    ask: 0,
                    change: 0,
                    changePercent: 0,
                    timestamp: Date.now(),
                };
            }

            const currentPrice = parseFloat(quote.close);
            const previousClose = parseFloat(quote.previous_close);
            const change = currentPrice - previousClose;
            const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

            // Simulate bid/ask spread (typically 0.01-0.05% for major pairs)
            const spreadPercent = pair.symbol === 'XAU/USD' ? 0.0003 : 0.0001;
            const spread = currentPrice * spreadPercent;

            return {
                symbol: pair.symbol,
                name: pair.name,
                price: currentPrice,
                bid: currentPrice - spread / 2,
                ask: currentPrice + spread / 2,
                change,
                changePercent,
                timestamp: quote.timestamp * 1000 || Date.now(),
            };
        });
    } catch (error) {
        console.error('Error fetching forex prices:', error);
        throw error;
    }
}

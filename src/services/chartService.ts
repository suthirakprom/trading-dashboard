import axios from 'axios';

const API_KEY = import.meta.env.VITE_TWELVEDATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';

export interface CandleData {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

export interface ChartDataResponse {
    symbol: string;
    data: CandleData[];
    isDemo?: boolean; // Flag to indicate mock data
}

export const AVAILABLE_PAIRS = [
    { symbol: 'XAU/USD', name: 'Gold' },
    { symbol: 'EUR/USD', name: 'Euro' },
    { symbol: 'GBP/USD', name: 'British Pound' },
    { symbol: 'USD/JPY', name: 'Japanese Yen' },
    { symbol: 'AUD/USD', name: 'Australian Dollar' },
    { symbol: 'USD/CAD', name: 'Canadian Dollar' },
    { symbol: 'USD/CHF', name: 'Swiss Franc' },
    { symbol: 'NZD/USD', name: 'New Zealand Dollar' },
];

// Base prices for generating realistic mock data
const BASE_PRICES: Record<string, number> = {
    'XAU/USD': 2650,
    'EUR/USD': 1.0850,
    'GBP/USD': 1.2650,
    'USD/JPY': 156.50,
    'AUD/USD': 0.6250,
    'USD/CAD': 1.4350,
    'USD/CHF': 0.9050,
    'NZD/USD': 0.5650,
};

// Generate realistic mock candle data
function generateMockCandles(symbol: string, count: number = 100): CandleData[] {
    const basePrice = BASE_PRICES[symbol] || 1.0;
    const volatility = symbol === 'XAU/USD' ? 15 : (symbol === 'USD/JPY' ? 0.5 : 0.003);
    const candles: CandleData[] = [];
    let currentPrice = basePrice;

    const now = new Date();

    for (let i = count - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000); // 1 hour intervals

        // Random walk with trend bias
        const trend = Math.sin(i / 20) * 0.3; // Slight wave pattern
        const change = (Math.random() - 0.5 + trend * 0.1) * volatility;

        const open = currentPrice;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * volatility * 0.5;
        const low = Math.min(open, close) - Math.random() * volatility * 0.5;

        candles.push({
            time: time.toISOString().replace('T', ' ').substring(0, 19),
            open: Number(open.toFixed(symbol === 'XAU/USD' ? 2 : (symbol === 'USD/JPY' ? 2 : 5))),
            high: Number(high.toFixed(symbol === 'XAU/USD' ? 2 : (symbol === 'USD/JPY' ? 2 : 5))),
            low: Number(low.toFixed(symbol === 'XAU/USD' ? 2 : (symbol === 'USD/JPY' ? 2 : 5))),
            close: Number(close.toFixed(symbol === 'XAU/USD' ? 2 : (symbol === 'USD/JPY' ? 2 : 5))),
        });

        currentPrice = close;
    }

    return candles;
}

interface TwelveDataCandle {
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
}

interface TwelveDataTimeSeriesResponse {
    meta: {
        symbol: string;
        interval: string;
        currency_base: string;
        currency_quote: string;
    };
    values: TwelveDataCandle[];
    status: string;
    message?: string;
}

export async function fetchChartData(
    symbol: string,
    interval: string = '1h',
    outputsize: number = 100
): Promise<ChartDataResponse> {
    // First try to get real data
    try {
        if (!API_KEY) {
            throw new Error('No API key configured');
        }

        const response = await axios.get<TwelveDataTimeSeriesResponse>(
            `${BASE_URL}/time_series`,
            {
                params: {
                    symbol,
                    interval,
                    outputsize,
                    apikey: API_KEY,
                },
            }
        );

        if (response.data.status === 'error' || !response.data.values) {
            console.warn(`API Error for ${symbol}:`, response.data.message);
            throw new Error(response.data.message || 'API error');
        }

        const data = response.data.values
            .map((candle) => ({
                time: candle.datetime,
                open: parseFloat(candle.open),
                high: parseFloat(candle.high),
                low: parseFloat(candle.low),
                close: parseFloat(candle.close),
            }))
            .reverse();

        return { symbol, data, isDemo: false };

    } catch (error) {
        // Fallback to mock data when API fails
        console.info(`Using demo data for ${symbol} (API unavailable)`);
        return {
            symbol,
            data: generateMockCandles(symbol, outputsize),
            isDemo: true
        };
    }
}

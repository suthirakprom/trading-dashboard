import axios from 'axios';

const API_KEY = import.meta.env.VITE_TWELVEDATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';

export interface CandleData {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface ChartDataResponse {
    symbol: string;
    data: CandleData[];
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
}

export async function fetchChartData(
    symbol: string,
    interval: string = '1h',
    outputsize: number = 50
): Promise<ChartDataResponse> {
    try {
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

        // Log response for debugging
        console.log('Chart API Response:', response.data);

        // Check for error in response
        if (response.data.status === 'error' || !response.data.values) {
            const errorMsg = (response.data as any).message || 'API returned error status';
            throw new Error(errorMsg);
        }

        // Transform and reverse data (API returns newest first)
        const data = response.data.values
            .map((candle) => ({
                time: candle.datetime,
                open: parseFloat(candle.open),
                high: parseFloat(candle.high),
                low: parseFloat(candle.low),
                close: parseFloat(candle.close),
            }))
            .reverse();

        return {
            symbol,
            data,
        };
    } catch (error) {
        console.error('Error fetching chart data:', error);
        throw error;
    }
}

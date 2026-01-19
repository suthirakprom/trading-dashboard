import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchChartData, type CandleData } from '../services/chartService';

interface UseChartDataResult {
    data: CandleData[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    refetch: () => void;
}

export function useChartData(
    symbol: string,
    interval: string = '1h',
    refreshInterval: number = 120000
): UseChartDataResult {
    const [data, setData] = useState<CandleData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const intervalRef = useRef<number | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setError(null);
            const result = await fetchChartData(symbol, interval, 50);
            setData(result.data);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
        } finally {
            setIsLoading(false);
        }
    }, [symbol, interval]);

    useEffect(() => {
        setIsLoading(true);
        fetchData();

        // Set up auto-refresh
        intervalRef.current = window.setInterval(fetchData, refreshInterval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchData, refreshInterval]);

    return {
        data,
        isLoading,
        error,
        lastUpdated,
        refetch: fetchData,
    };
}

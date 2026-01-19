import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchForexPrices } from '../services/forexService';
import type { ForexPrice } from '../types/forex';

interface UseForexPricesResult {
    prices: ForexPrice[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    refetch: () => void;
    updatedSymbols: Set<string>;
}

export function useForexPrices(refreshInterval = 120000): UseForexPricesResult {
    const [prices, setPrices] = useState<ForexPrice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [updatedSymbols, setUpdatedSymbols] = useState<Set<string>>(new Set());
    const previousPricesRef = useRef<Map<string, number>>(new Map());

    const fetchPrices = useCallback(async () => {
        try {
            setError(null);
            const data = await fetchForexPrices();

            // Track which symbols had price changes
            const newUpdatedSymbols = new Set<string>();
            data.forEach(price => {
                const prevPrice = previousPricesRef.current.get(price.symbol);
                if (prevPrice !== undefined && prevPrice !== price.price) {
                    newUpdatedSymbols.add(price.symbol);
                }
                previousPricesRef.current.set(price.symbol, price.price);
            });

            // Add previous price to each item for direction indicators
            const enrichedData = data.map(price => ({
                ...price,
                previousPrice: previousPricesRef.current.get(price.symbol),
            }));

            setPrices(enrichedData);
            setUpdatedSymbols(newUpdatedSymbols);
            setLastUpdated(new Date());

            // Clear updated symbols after animation duration
            setTimeout(() => {
                setUpdatedSymbols(new Set());
            }, 1000);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch prices');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPrices();

        const intervalId = setInterval(fetchPrices, refreshInterval);

        return () => clearInterval(intervalId);
    }, [fetchPrices, refreshInterval]);

    return {
        prices,
        isLoading,
        error,
        lastUpdated,
        refetch: fetchPrices,
        updatedSymbols,
    };
}

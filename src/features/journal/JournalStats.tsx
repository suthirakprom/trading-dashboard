
import React, { useMemo } from 'react';
import type { JournalEntry } from '../../types/journal';

interface JournalStatsProps {
    trades: JournalEntry[];
}

export const JournalStats: React.FC<JournalStatsProps> = ({ trades }) => {
    const stats = useMemo(() => {
        const closedTrades = trades.filter(t => t.status === 'Closed' && t.outcome);
        const totalClosed = closedTrades.length;
        const wins = closedTrades.filter(t => t.outcome === 'Win').length;
        const losses = closedTrades.filter(t => t.outcome === 'Loss').length;
        const winRate = totalClosed > 0 ? (wins / totalClosed) * 100 : 0;

        let totalPnL = 0;
        let bestTrade = 0;
        let worstTrade = 0;

        closedTrades.forEach(t => {
            if (t.entry_price && t.exit_price && t.trade_size) {
                let pnl = 0;
                // Simple PnL calc assumption: (Exit - Entry) * Size
                // In real world, multiplier depends on asset class (100,000 for standard lots forex)
                // We will assume standard lot 100000 for calculation if not specified, 
                // OR just display raw price delta if user prefers. 
                // Let's use a standard multiplier of 1 (Unit) for generic, or 100000 if it looks like forex price
                // For simplicity in this demo, we'll store "Total Profit" as simple Sum of PnL.

                const priceDiff = t.direction === 'Long'
                    ? t.exit_price - t.entry_price
                    : t.entry_price - t.exit_price;

                pnl = priceDiff * t.trade_size * 100000; // Assuming Forex Standard Lots

                totalPnL += pnl;
                if (pnl > bestTrade) bestTrade = pnl;
                if (pnl < worstTrade) worstTrade = pnl;
            }
        });

        return {
            totalTrades: trades.length,
            winRate: winRate.toFixed(1),
            totalPnL: totalPnL.toFixed(2),
            bestTrade: bestTrade.toFixed(2),
            worstTrade: worstTrade.toFixed(2),
            profitFactor: losses > 0 ? (wins / losses).toFixed(2) : wins > 0 ? '∞' : '0.0'
        };
    }, [trades]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Win Rate */}
            <div className="bg-[#151A21] border border-[#2A3441] p-4 rounded-xl">
                <div className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Win Rate</div>
                <div className={`text-2xl font-bold ${parseFloat(stats.winRate) >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                    {stats.winRate}%
                </div>
                <div className="text-xs text-gray-500 mt-1">{stats.totalTrades} Total Trades</div>
            </div>

            {/* P/L */}
            <div className="bg-[#151A21] border border-[#2A3441] p-4 rounded-xl">
                <div className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Net P/L</div>
                <div className={`text-2xl font-bold ${parseFloat(stats.totalPnL) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${stats.totalPnL}
                </div>
            </div>

            {/* Best Trade */}
            <div className="bg-[#151A21] border border-[#2A3441] p-4 rounded-xl">
                <div className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Best Trade</div>
                <div className="text-2xl font-bold text-green-500">
                    +${stats.bestTrade}
                </div>
            </div>

            {/* Worst Trade */}
            <div className="bg-[#151A21] border border-[#2A3441] p-4 rounded-xl">
                <div className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Worst Trade</div>
                <div className="text-2xl font-bold text-red-500">
                    ${stats.worstTrade}
                </div>
            </div>
        </div>
    );
};

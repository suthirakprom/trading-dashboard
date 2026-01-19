import React from 'react';
import { cn } from '../../lib/utils';

export const TradeJournal: React.FC = () => {
    const trades = [
        { id: 1, pair: 'XAUUSD', type: 'Long', entry: '2040.50', exit: '2055.00', pnl: '+ $1,450', status: 'win' },
        { id: 2, pair: 'EURUSD', type: 'Short', entry: '1.0950', exit: '1.0980', pnl: '- $300', status: 'loss' },
        { id: 3, pair: 'GBPJPY', type: 'Long', entry: '182.20', exit: '182.80', pnl: '+ $600', status: 'win' },
    ];

    return (
        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Recent Trades</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-muted-foreground border-b">
                        <tr>
                            <th className="py-2">Pair</th>
                            <th className="py-2">Type</th>
                            <th className="py-2">Entry</th>
                            <th className="py-2">Exit</th>
                            <th className="py-2 text-right">P&L</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trades.map((trade) => (
                            <tr key={trade.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                <td className="py-3 font-medium">{trade.pair}</td>
                                <td className={cn("py-3", trade.type === 'Long' ? 'text-green-500' : 'text-red-500')}>
                                    {trade.type}
                                </td>
                                <td className="py-3">{trade.entry}</td>
                                <td className="py-3">{trade.exit}</td>
                                <td className={cn("py-3 text-right font-medium", trade.status === 'win' ? 'text-green-500' : 'text-red-500')}>
                                    {trade.pnl}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

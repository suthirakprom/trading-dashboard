import React, { useState } from 'react';
import type { JournalEntry } from '../../types/journal';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { EditJournalModal } from './EditJournalModal';

interface TradeJournalTableProps {
    trades: JournalEntry[];
    loading?: boolean;
    onDataChange: () => void;
}

export const TradeJournalTable: React.FC<TradeJournalTableProps> = ({ trades, loading = false, onDataChange }) => {
    const { user } = useAuth();
    const [filter, setFilter] = useState('All');
    const [sort, setSort] = useState('Date');
    const [editingTrade, setEditingTrade] = useState<JournalEntry | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    const getFilteredTrades = () => {
        return trades
            .filter(t => {
                if (filter === 'All') return true;
                if (filter === 'Open') return t.status === 'Open';
                if (filter === 'Win') return t.outcome === 'Win';
                if (filter === 'Loss') return t.outcome === 'Loss';
                return true;
            })
            .sort((a, b) => {
                if (sort === 'Symbol') return a.symbol.localeCompare(b.symbol);
                // Default Date
                return new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime();
            });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this trade?')) return;

        setDeleting(id);
        try {
            const { error } = await supabase
                .from('trade_journals')
                .delete()
                .eq('id', id);

            if (error) throw error;
            onDataChange();
        } catch (err) {
            console.error('Error deleting trade:', err);
            alert('Failed to delete trade');
        } finally {
            setDeleting(null);
        }
    };

    const downloadCSV = () => {
        const data = getFilteredTrades();
        const headers = ['Date', 'Pair', 'Direction', 'Status', 'Entry', 'Exit', 'P/L', 'Outcome', 'Notes'];
        const csvContent = [
            headers.join(','),
            ...data.map(t => {
                const pl = t.exit_price && t.entry_price
                    ? (t.direction === 'Long' ? t.exit_price - t.entry_price : t.entry_price - t.exit_price).toFixed(5)
                    : '';
                return [
                    new Date(t.trade_date).toLocaleDateString(),
                    t.symbol,
                    t.direction,
                    t.status,
                    t.entry_price,
                    t.exit_price || '',
                    pl,
                    t.outcome || '',
                    `"${(t.notes || '').replace(/"/g, '""')}"`
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trade_journal_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    const filteredTrades = getFilteredTrades();

    if (loading) return <div className="text-center text-gray-500 py-8">Loading trades...</div>;

    return (
        <div className="bg-[#151A21] rounded-xl border border-[#2A3441] overflow-hidden">
            <div className="p-4 border-b border-[#2A3441] flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-bold text-white">Recent Trades</h3>

                <div className="flex gap-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-[#0B0E11] border border-[#2A3441] text-white rounded px-3 py-1 outline-none"
                    >
                        <option value="All">All Trades</option>
                        <option value="Open">Open Only</option>
                        <option value="Win">Wins</option>
                        <option value="Loss">Losses</option>
                    </select>

                    <button
                        onClick={downloadCSV}
                        className="bg-[#2A3441] hover:bg-[#374151] text-white px-3 py-1 rounded transition-colors text-sm flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#1C232E] text-gray-400 text-xs uppercase tracking-wider">
                            <th className="p-4">Date</th>
                            <th className="p-4">Pair</th>
                            <th className="p-4">Side</th>
                            <th className="p-4">Entry</th>
                            <th className="p-4">Exit</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Assumed P/L</th>
                            <th className="p-4">Outcome</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A3441]">
                        {filteredTrades.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="p-8 text-center text-gray-500">
                                    No trades found. Start logging!
                                </td>
                            </tr>
                        ) : (
                            filteredTrades.map((trade) => {
                                const isWin = trade.outcome === 'Win';
                                const isLoss = trade.outcome === 'Loss';
                                const pl = trade.exit_price && trade.entry_price && trade.trade_size
                                    ? ((trade.direction === 'Long' ? trade.exit_price - trade.entry_price : trade.entry_price - trade.exit_price) * trade.trade_size * 100000 /*rough pip calc*/).toFixed(2)
                                    : '-';
                                // Note: simple pip calc assumption for display

                                return (
                                    <tr key={trade.id} className="hover:bg-[#1C232E] transition-colors text-sm text-gray-300">
                                        <td className="p-4 whitespace-nowrap">{new Date(trade.trade_date).toLocaleDateString()}</td>
                                        <td className="p-4 font-bold text-white">{trade.symbol}</td>
                                        <td className={`p-4 ${trade.direction === 'Long' ? 'text-green-500' : 'text-red-500'}`}>
                                            {trade.direction}
                                        </td>
                                        <td className="p-4">{trade.entry_price || '-'}</td>
                                        <td className="p-4">{trade.exit_price || '-'}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${trade.status === 'Open' ? 'bg-blue-500/10 text-blue-500' :
                                                    trade.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                        'bg-gray-700/50 text-gray-400'}`}>
                                                {trade.status}
                                            </span>
                                        </td>
                                        <td className="p-4">{pl !== '-' ? `$${pl}` : '-'}</td>
                                        <td className="p-4">
                                            {trade.outcome && (
                                                <span className={`px-2 py-1 rounded text-xs font-bold
                          ${isWin ? 'bg-green-500/20 text-green-500' :
                                                        isLoss ? 'bg-red-500/20 text-red-500' : 'bg-gray-700 text-gray-300'}`}>
                                                    {trade.outcome}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {trade.user_id === user?.id && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setEditingTrade(trade)}
                                                        className="text-blue-500 hover:text-blue-400 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(trade.id)}
                                                        disabled={deleting === trade.id}
                                                        className="text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingTrade && (
                <EditJournalModal
                    trade={editingTrade}
                    onClose={() => setEditingTrade(null)}
                    onSave={() => {
                        onDataChange();
                        setEditingTrade(null);
                    }}
                />
            )}
        </div>
    );
};

import React, { useState } from 'react';
import type { JournalEntry } from '../../types/journal';
import { supabase } from '../../services/supabase';

interface EditJournalModalProps {
    trade: JournalEntry;
    onClose: () => void;
    onSave: () => void;
}

export const EditJournalModal: React.FC<EditJournalModalProps> = ({ trade, onClose, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        symbol: trade.symbol,
        direction: trade.direction,
        entry_price: trade.entry_price?.toString() || '',
        exit_price: trade.exit_price?.toString() || '',
        stop_loss: trade.stop_loss?.toString() || '',
        take_profit: trade.take_profit?.toString() || '',
        trade_size: trade.trade_size?.toString() || '',
        trade_date: trade.trade_date ? new Date(trade.trade_date).toISOString().slice(0, 16) : '',
        outcome: trade.outcome || '',
        status: trade.status,
        notes: trade.notes || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const updateData = {
                symbol: formData.symbol.toUpperCase(),
                direction: formData.direction,
                entry_price: formData.entry_price ? parseFloat(formData.entry_price) : null,
                exit_price: formData.exit_price ? parseFloat(formData.exit_price) : null,
                stop_loss: formData.stop_loss ? parseFloat(formData.stop_loss) : null,
                take_profit: formData.take_profit ? parseFloat(formData.take_profit) : null,
                trade_size: formData.trade_size ? parseFloat(formData.trade_size) : null,
                trade_date: new Date(formData.trade_date).toISOString(),
                outcome: formData.outcome || null,
                status: formData.status,
                notes: formData.notes
            };

            const { error: updateError } = await supabase
                .from('trade_journals')
                .update(updateData)
                .eq('id', trade.id);

            if (updateError) throw updateError;
            onSave();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to update trade');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#151A21] rounded-xl border border-[#2A3441] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">Edit Trade</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="mb-4 text-red-500 text-sm bg-red-500/10 p-2 rounded border border-red-500/20">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Pair</label>
                        <input
                            name="symbol"
                            value={formData.symbol}
                            onChange={handleChange}
                            className="w-full bg-[#0B0E11] border border-[#2A3441] rounded p-2 text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Direction</label>
                        <select
                            name="direction"
                            value={formData.direction}
                            onChange={handleChange}
                            className="w-full bg-[#0B0E11] border border-[#2A3441] rounded p-2 text-white"
                        >
                            <option value="Long">Long</option>
                            <option value="Short">Short</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Date & Time</label>
                        <input
                            type="datetime-local"
                            name="trade_date"
                            value={formData.trade_date}
                            onChange={handleChange}
                            className="w-full bg-[#0B0E11] border border-[#2A3441] rounded p-2 text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full bg-[#0B0E11] border border-[#2A3441] rounded p-2 text-white"
                        >
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Entry Price</label>
                        <input
                            type="number"
                            step="any"
                            name="entry_price"
                            value={formData.entry_price}
                            onChange={handleChange}
                            className="w-full bg-[#0B0E11] border border-[#2A3441] rounded p-2 text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Stop Loss</label>
                        <input
                            type="number"
                            step="any"
                            name="stop_loss"
                            value={formData.stop_loss}
                            onChange={handleChange}
                            className="w-full bg-[#0B0E11] border border-[#2A3441] rounded p-2 text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Take Profit</label>
                        <input
                            type="number"
                            step="any"
                            name="take_profit"
                            value={formData.take_profit}
                            onChange={handleChange}
                            className="w-full bg-[#0B0E11] border border-[#2A3441] rounded p-2 text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Size</label>
                        <input
                            type="number"
                            step="any"
                            name="trade_size"
                            value={formData.trade_size}
                            onChange={handleChange}
                            className="w-full bg-[#0B0E11] border border-[#2A3441] rounded p-2 text-white"
                        />
                    </div>

                    {formData.status === 'Closed' && (
                        <>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Exit Price</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="exit_price"
                                    value={formData.exit_price}
                                    onChange={handleChange}
                                    className="w-full bg-[#0B0E11] border border-[#2A3441] rounded p-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Outcome</label>
                                <select
                                    name="outcome"
                                    value={formData.outcome}
                                    onChange={handleChange}
                                    className="w-full bg-[#0B0E11] border border-[#2A3441] rounded p-2 text-white"
                                >
                                    <option value="">Unknown</option>
                                    <option value="Win">Win</option>
                                    <option value="Loss">Loss</option>
                                    <option value="Breakeven">Breakeven</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div className="md:col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            className="w-full bg-[#0B0E11] border border-[#2A3441] rounded p-2 text-white h-20"
                        />
                    </div>

                    <div className="md:col-span-2 flex gap-3 justify-end mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-[#2A3441] hover:bg-[#374151] text-white px-4 py-2 rounded transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

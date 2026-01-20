import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

interface TradeEntryFormProps {
    onEntryCreated: () => void;
}

export const TradeEntryForm: React.FC<TradeEntryFormProps> = ({ onEntryCreated }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        symbol: '',
        direction: 'Long',
        entry_price: '',
        exit_price: '',
        stop_loss: '',
        take_profit: '',
        trade_size: '',
        trade_date: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
        outcome: '', // Win/Loss/Breakeven
        status: 'Open',
        notes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setError(null);

        try {
            // Backend Request
            const payload = {
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

            const { error: apiError } = await supabase
                .from('trade_journals')
                .insert([{ ...payload, user_id: user.id }]);

            if (apiError) throw apiError;

            // Reset Form
            setFormData({
                symbol: '',
                direction: 'Long',
                entry_price: '',
                exit_price: '',
                stop_loss: '',
                take_profit: '',
                trade_size: '',
                trade_date: new Date().toISOString().slice(0, 16),
                outcome: '',
                status: 'Open',
                notes: ''
            });

            onEntryCreated();

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to create entry');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#151A21] rounded-xl border border-[#2A3441] p-6">
            <h3 className="text-xl font-bold text-white mb-4">Log New Trade</h3>

            {error && (
                <div className="mb-4 text-red-500 text-sm bg-red-500/10 p-2 rounded border border-red-500/20">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Symbol */}
                <div className="col-span-1">
                    <label className="block text-xs text-gray-400 mb-1">Pair</label>
                    <input
                        name="symbol"
                        value={formData.symbol}
                        onChange={handleChange}
                        className="w-full bg-[#0B0E11] border border-[#2A3441] rounded p-2 text-white"
                        placeholder="EURUSD"
                        required
                    />
                </div>

                {/* Direction */}
                <div className="col-span-1">
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

                {/* Date */}
                <div className="col-span-1">
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

                {/* Status */}
                <div className="col-span-1">
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

                {/* Entry Price */}
                <div className="col-span-1">
                    <label className="block text-xs text-gray-400 mb-1">Entry Price</label>
                    <input
                        type="number"
                        step="any"
                        name="entry_price"
                        value={formData.entry_price}
                        onChange={handleChange}
                        className="w-full bg-[#0B0E11] border border-[#2A3441] rounded p-2 text-white"
                        placeholder="0.0000"
                    />
                </div>

                {/* Stop Loss */}
                <div className="col-span-1">
                    <label className="block text-xs text-gray-400 mb-1">Stop Loss</label>
                    <input
                        type="number"
                        step="any"
                        name="stop_loss"
                        value={formData.stop_loss}
                        onChange={handleChange}
                        className="w-full bg-[#0B0E11] border border-[#2A3441] rounded p-2 text-white"
                        placeholder="0.0000"
                    />
                </div>

                {/* Take Profit */}
                <div className="col-span-1">
                    <label className="block text-xs text-gray-400 mb-1">Take Profit</label>
                    <input
                        type="number"
                        step="any"
                        name="take_profit"
                        value={formData.take_profit}
                        onChange={handleChange}
                        className="w-full bg-[#0B0E11] border border-[#2A3441] rounded p-2 text-white"
                        placeholder="0.0000"
                    />
                </div>

                {/* Size */}
                <div className="col-span-1">
                    <label className="block text-xs text-gray-400 mb-1">Size</label>
                    <input
                        type="number"
                        step="any"
                        name="trade_size"
                        value={formData.trade_size}
                        onChange={handleChange}
                        className="w-full bg-[#0B0E11] border border-[#2A3441] rounded p-2 text-white"
                        placeholder="1.0"
                    />
                </div>

                {/* Exit fields (Only if closed) */}
                {formData.status === 'Closed' && (
                    <>
                        <div className="col-span-1">
                            <label className="block text-xs text-gray-400 mb-1">Exit Price</label>
                            <input
                                type="number"
                                step="any"
                                name="exit_price"
                                value={formData.exit_price}
                                onChange={handleChange}
                                className="w-full bg-[#0B0E11] border border-[#2A3441] rounded p-2 text-white"
                                placeholder="0.0000"
                            />
                        </div>
                        <div className="col-span-1">
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

                {/* Notes */}
                <div className="col-span-1 md:col-span-2 lg:col-span-4">
                    <label className="block text-xs text-gray-400 mb-1">Notes</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="w-full bg-[#0B0E11] border border-[#2A3441] rounded p-2 text-white h-20"
                        placeholder="Trade rationale..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="col-span-1 md:col-span-2 lg:col-span-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded transition-colors"
                >
                    {loading ? 'Saving...' : 'Log Trade'}
                </button>
            </form>
        </div>
    );
};

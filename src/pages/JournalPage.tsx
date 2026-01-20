
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { JournalEntry } from '../types/journal';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { JournalStats } from '../features/journal/JournalStats';
import { TradeEntryForm } from '../features/journal/TradeEntryForm';
import { TradeJournalTable } from '../features/journal/TradeJournalTable';

const JournalPage = () => {
    const { user } = useAuth();
    const [trades, setTrades] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        if (user) fetchTrades();
    }, [user]);

    const fetchTrades = async () => {
        try {
            setLoading(true);
            // Public Read Policy allows us to fetch all, but let's stick to user's trades view for "My Journal"
            // If we want social, we can fetch all. For now user sees their own.
            // Wait, user requirement: "Each user should have their own data, and should be able to read others user data"
            // So maybe we show ALL trades by default, or just My Trades?
            // Let's show "My Trades" for now as default journal, and maybe a toggle for "All Public" later.
            // For now, let's fetch ALL trades (since it's a social learning tool).

            const { data, error } = await supabase
                .from('trade_journals')
                .select('*')
                .order('trade_date', { ascending: false });

            if (error) throw error;
            setTrades(data || []);
        } catch (err) {
            console.error('Error fetching trades:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <section className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Trade Journal</h2>
                        <p className="text-muted-foreground">
                            Track your performance and learn from the community.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                        {showForm ? 'Hide Entry Form' : 'Log New Trade'}
                    </button>
                </section>

                {/* Stats Section */}
                <JournalStats trades={trades} />

                {/* Entry Form (Collapsible) */}
                {showForm && (
                    <div className="mb-8">
                        <TradeEntryForm onEntryCreated={() => {
                            fetchTrades();
                            setShowForm(false);
                        }} />
                    </div>
                )}

                {/* Journal Table */}
                <TradeJournalTable trades={trades} loading={loading} onDataChange={fetchTrades} />
            </div>
        </Layout>
    );
};

export default JournalPage;

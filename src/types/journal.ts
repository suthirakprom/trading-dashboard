export interface JournalEntry {
    id: string
    user_id: string
    symbol: string
    direction: 'Long' | 'Short'
    entry_price: number | null
    exit_price: number | null
    stop_loss: number | null
    take_profit: number | null
    trade_size: number | null
    trade_date: string
    outcome: 'Win' | 'Loss' | 'Breakeven' | null
    status: 'Open' | 'Closed' | 'Pending'
    notes: string | null
    images: string[] | null
    created_at: string
}

export interface JournalStats {
    totalTrades: number
    winRate: number
    totalProfit: number // This needs calculation or a profit column. We will estimate from price diff * size
    avgWin: number
    avgLoss: number
    bestTrade: number
    worstTrade: number
}

import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MarketBiasPanel } from './features/dashboard/MarketBiasPanel';
import { EconomicCalendar } from './features/dashboard/EconomicCalendar';
import { TradeJournal } from './features/dashboard/TradeJournal';

function App() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <section id="dashboard">
          <h2 className="text-3xl font-bold mb-2">Trading Analysis Dashboard</h2>
          <p className="text-muted-foreground">
            Market bias and economic calendar for smarter trading decisions.
            For real-time charts, use <a href="https://www.tradingview.com" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">TradingView</a>.
          </p>
        </section>

        {/* Main Layout: Market Bias Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-1">
            <ErrorBoundary fallbackMessage="Failed to load XAU/USD analysis.">
              <MarketBiasPanel symbol="XAU/USD" interval="1h" />
            </ErrorBoundary>
          </div>
          <div className="xl:col-span-1">
            <ErrorBoundary fallbackMessage="Failed to load EUR/USD analysis.">
              <MarketBiasPanel symbol="EUR/USD" interval="1h" />
            </ErrorBoundary>
          </div>
          <div className="xl:col-span-1">
            <ErrorBoundary fallbackMessage="Failed to load GBP/USD analysis.">
              <MarketBiasPanel symbol="GBP/USD" interval="1h" />
            </ErrorBoundary>
          </div>
          <div className="xl:col-span-1">
            <ErrorBoundary fallbackMessage="Failed to load USD/JPY analysis.">
              <MarketBiasPanel symbol="USD/JPY" interval="1h" />
            </ErrorBoundary>
          </div>
        </div>

        {/* Bottom Row: Economic Calendar + Trade Journal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section id="calendar">
            <EconomicCalendar />
          </section>

          <section id="journal">
            <TradeJournal />
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default App;


import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MarketBiasPanel } from './features/dashboard/MarketBiasPanel';
import { EnhancedNewsCalendar } from './features/dashboard/EnhancedNewsCalendar';
import { TradingUtilities } from './features/dashboard/TradingUtilities';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import JournalPage from './pages/JournalPage';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center text-white">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const Dashboard = () => (
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

      {/* Bottom Row: Enhanced News Calendar + Trading Utilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        <section id="news-calendar" className="lg:col-span-1 h-full">
          <EnhancedNewsCalendar />
        </section>

        <section id="utilities" className="lg:col-span-1 h-full">
          <TradingUtilities />
        </section>
      </div>
    </div>
  </Layout>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journal"
            element={
              <ProtectedRoute>
                <JournalPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

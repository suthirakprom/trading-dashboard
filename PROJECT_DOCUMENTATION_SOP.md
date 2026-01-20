# Trading Dashboard - Standard Operating Procedures (SOP)
## Complete Development Documentation

**Project Name:** Trading Dashboard  
**Version:** 1.0.0  
**Last Updated:** January 20, 2026  
**Project Type:** Full-Stack Web Application  

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technical Stack](#technical-stack)
3. [Project Architecture](#project-architecture)
4. [Environment Setup](#environment-setup)
5. [Database Schema](#database-schema)
6. [Features Implementation](#features-implementation)
7. [API Documentation](#api-documentation)
8. [Authentication System](#authentication-system)
9. [Frontend Components](#frontend-components)
10. [Deployment Procedures](#deployment-procedures)
11. [Troubleshooting Guide](#troubleshooting-guide)
12. [Future Enhancements](#future-enhancements)

---

## 1. Project Overview

### 1.1 Purpose
The Trading Dashboard is a comprehensive forex and commodities trading analysis platform designed to provide real-time market insights, technical analysis, news updates, and trade journaling capabilities for traders.

### 1.2 Key Objectives
- Provide real-time technical analysis for major currency pairs and commodities
- Aggregate economic news and calendar events
- Offer trading calculation tools (position size, pip value, risk-reward)
- Enable traders to journal their trades with detailed analytics
- Deliver a modern, responsive, and user-friendly interface

### 1.3 Target Users
- Forex and commodities traders
- Day traders requiring quick market insights
- Traders who want to maintain detailed trade journals
- Analysts tracking multiple currency pairs

---

## 2. Technical Stack

### 2.1 Frontend Technologies
- **Framework:** React 19.2.0 with TypeScript
- **Build Tool:** Vite 7.2.4
- **Styling:** Tailwind CSS 3.4.17
- **State Management:** Zustand 5.0.10
- **Data Fetching:** TanStack React Query 5.90.19
- **HTTP Client:** Axios 1.13.2
- **Charting:** Lightweight Charts 5.1.0
- **Icons:** Lucide React 0.562.0
- **Routing:** React Router DOM
- **Authentication:** Supabase Auth (@supabase/supabase-js 2.90.1)

### 2.2 Backend Technologies
- **Framework:** FastAPI 0.109.0
- **Server:** Uvicorn 0.27.0 (with standard extras)
- **Database Client:** Supabase Python SDK 2.3.4
- **Validation:** Pydantic 2.5.3
- **Environment Management:** Python-dotenv 1.0.0
- **HTTP Client:** httpx

### 2.3 Database & Services
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Market Data APIs:**
  - TwelveData API (Market data & technical indicators)
  - Finnhub API (News & market sentiment)

### 2.4 Development Tools
- **Linting:** ESLint 9.39.1
- **TypeScript:** 5.9.3
- **PostCSS:** 8.5.6
- **Autoprefixer:** 10.4.23

---

## 3. Project Architecture

### 3.1 Directory Structure

```
Trading bot/
├── backend/                    # FastAPI Backend
│   ├── config/                # Configuration files
│   │   ├── __init__.py
│   │   └── supabase.py       # Supabase client setup
│   ├── dependencies/          # Dependency injection modules
│   │   ├── __init__.py
│   │   └── auth.py           # JWT authentication
│   ├── routers/               # API route handlers
│   │   ├── __init__.py
│   │   └── journal.py        # Trade journal endpoints
│   ├── venv/                  # Python virtual environment
│   ├── .env                   # Backend environment variables
│   ├── main.py                # FastAPI application entry point
│   └── requirements.txt       # Python dependencies
├── src/                       # React Frontend
│   ├── assets/                # Static assets
│   ├── components/            # Reusable UI components
│   │   ├── ErrorBoundary.tsx
│   │   ├── Layout.tsx
│   │   └── Navbar.tsx
│   ├── context/               # React Context providers
│   │   ├── AuthContext.tsx   # Authentication state
│   │   └── ThemeContext.tsx  # Theme management
│   ├── features/              # Feature-specific components
│   │   ├── dashboard/         # Main dashboard features
│   │   │   ├── AdvancedChart.tsx
│   │   │   ├── EconomicCalendar.tsx
│   │   │   ├── EnhancedNewsCalendar.tsx
│   │   │   ├── LivePriceMonitor.tsx
│   │   │   ├── MarketBiasPanel.tsx
│   │   │   ├── NewsFeed.tsx
│   │   │   ├── PriceMonitor.tsx
│   │   │   ├── TechnicalAnalysis.tsx
│   │   │   ├── TradeJournal.tsx
│   │   │   └── TradingUtilities.tsx
│   │   └── journal/           # Trade journal features
│   │       ├── JournalStats.tsx
│   │       ├── TradeEntryForm.tsx
│   │       └── TradeJournalTable.tsx
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   │   └── utils.ts          # Helper functions (cn, etc.)
│   ├── pages/                 # Page components
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   └── JournalPage.tsx
│   ├── services/              # External service integrations
│   │   ├── chartService.ts   # TwelveData integration
│   │   ├── forexService.ts   # Forex data service
│   │   ├── newsService.ts    # Finnhub news integration
│   │   └── supabase.ts       # Supabase client
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility functions
│   │   └── indicators.ts     # Technical indicator calculations
│   ├── App.css
│   ├── App.tsx               # Main application component
│   ├── index.css             # Global styles
│   └── main.tsx              # Application entry point
├── public/                    # Public assets
├── dist/                      # Production build output
├── .env                       # Frontend environment variables
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

### 3.2 Application Flow

```
User Access
    ↓
Authentication (Supabase Auth)
    ↓
Protected Routes (React Router)
    ↓
Dashboard/Journal Pages
    ↓
Backend API (FastAPI) ← → Supabase Database
    ↓
External APIs (TwelveData, Finnhub)
```

---

## 4. Environment Setup

### 4.1 Prerequisites
- Node.js (v18+ recommended)
- Python 3.9+
- npm or yarn
- Supabase account
- TwelveData API key
- Finnhub API key

### 4.2 Frontend Setup

#### Step 1: Install Dependencies
```bash
cd "Trading bot"
npm install
```

#### Step 2: Configure Environment Variables
Create `.env` file in the project root:

```env
VITE_TWELVEDATA_API_KEY=your_twelvedata_api_key
VITE_FINNHUB_API_KEY=your_finnhub_api_key
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Step 3: Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4.3 Backend Setup

#### Step 1: Navigate to Backend Directory
```bash
cd backend
```

#### Step 2: Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
# venv\Scripts\activate   # On Windows
```

#### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

#### Step 4: Configure Environment Variables
Create `backend/.env` file:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Step 5: Start Backend Server
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

### 4.4 Database Setup (Supabase)

#### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Create a new project
3. Note your project URL and anon key

#### Step 2: Create Database Tables

Execute the following SQL in Supabase SQL Editor:

```sql
-- Create trade_journals table
CREATE TABLE trade_journals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('Long', 'Short')),
    entry_price DECIMAL(15, 5),
    exit_price DECIMAL(15, 5),
    stop_loss DECIMAL(15, 5),
    take_profit DECIMAL(15, 5),
    trade_size DECIMAL(15, 5),
    trade_date TIMESTAMPTZ DEFAULT NOW(),
    outcome VARCHAR(20) CHECK (outcome IN ('Win', 'Loss', 'Breakeven')),
    status VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
    notes TEXT,
    images TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_trade_journals_user_id ON trade_journals(user_id);
CREATE INDEX idx_trade_journals_trade_date ON trade_journals(trade_date DESC);
CREATE INDEX idx_trade_journals_symbol ON trade_journals(symbol);

-- Enable Row Level Security (RLS)
ALTER TABLE trade_journals ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own journals
CREATE POLICY "Users can read own journals" ON trade_journals
    FOR SELECT USING (auth.uid() = user_id);

-- Users can read other users' journals (public read)
CREATE POLICY "Public read access" ON trade_journals
    FOR SELECT USING (true);

-- Users can insert their own journals
CREATE POLICY "Users can insert own journals" ON trade_journals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own journals
CREATE POLICY "Users can update own journals" ON trade_journals
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own journals
CREATE POLICY "Users can delete own journals" ON trade_journals
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_trade_journals_updated_at
    BEFORE UPDATE ON trade_journals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### Step 3: Enable Authentication
1. In Supabase Dashboard, go to Authentication
2. Enable Email authentication provider
3. Configure email templates (optional)

---

## 5. Database Schema

### 5.1 trade_journals Table

| Column Name   | Data Type        | Constraints                     | Description                           |
|---------------|------------------|---------------------------------|---------------------------------------|
| id            | UUID             | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier                |
| user_id       | UUID             | NOT NULL, FOREIGN KEY (auth.users) | Reference to authenticated user  |
| symbol        | VARCHAR(20)      | NOT NULL                        | Trading pair (e.g., EUR/USD)         |
| direction     | VARCHAR(10)      | NOT NULL, CHECK (Long/Short)    | Trade direction                      |
| entry_price   | DECIMAL(15,5)    | NULLABLE                        | Entry price of the trade             |
| exit_price    | DECIMAL(15,5)    | NULLABLE                        | Exit price of the trade              |
| stop_loss     | DECIMAL(15,5)    | NULLABLE                        | Stop loss level                      |
| take_profit   | DECIMAL(15,5)    | NULLABLE                        | Take profit level                    |
| trade_size    | DECIMAL(15,5)    | NULLABLE                        | Position size (lots)                 |
| trade_date    | TIMESTAMPTZ      | DEFAULT NOW()                   | Date and time of trade               |
| outcome       | VARCHAR(20)      | CHECK (Win/Loss/Breakeven)      | Trade result                         |
| status        | VARCHAR(20)      | DEFAULT 'Open'                  | Open or Closed                       |
| notes         | TEXT             | NULLABLE                        | Additional trade notes               |
| images        | TEXT[]           | NULLABLE                        | Array of image URLs                  |
| created_at    | TIMESTAMPTZ      | DEFAULT NOW()                   | Record creation timestamp            |
| updated_at    | TIMESTAMPTZ      | DEFAULT NOW()                   | Last update timestamp                |

### 5.2 Row Level Security (RLS) Policies

| Policy Name                | Operation | Rule                                         |
|----------------------------|-----------|----------------------------------------------|
| Users can read own journals| SELECT    | auth.uid() = user_id                        |
| Public read access         | SELECT    | true (all users can read all journals)      |
| Users can insert own journals | INSERT | auth.uid() = user_id                        |
| Users can update own journals | UPDATE | auth.uid() = user_id                        |
| Users can delete own journals | DELETE | auth.uid() = user_id                        |

---

## 6. Features Implementation

### 6.1 Authentication System

**Purpose:** Secure user registration and login using Supabase Auth

**Key Components:**
- `src/context/AuthContext.tsx` - Authentication state management
- `src/pages/auth/LoginPage.tsx` - Login interface
- `src/pages/auth/RegisterPage.tsx` - Registration interface
- `backend/dependencies/auth.py` - JWT token validation

**Implementation Details:**
1. User credentials are managed through Supabase Auth
2. JWT tokens are issued upon successful login
3. Protected routes check for valid session
4. Backend validates JWT tokens for API requests

**User Flow:**
1. User registers with email and password
2. Supabase creates user account and sends verification email (optional)
3. User logs in with credentials
4. Supabase returns session with JWT token
5. Frontend stores session and makes authenticated requests
6. Backend validates JWT on protected endpoints

### 6.2 Market Bias Panel

**Purpose:** Display real-time technical analysis for major trading pairs

**File:** `src/features/dashboard/MarketBiasPanel.tsx`

**Features:**
- Real-time price data from TwelveData API
- Multiple technical indicators:
  - RSI (Relative Strength Index)
  - MACD (Moving Average Convergence Divergence)
  - Bollinger Bands
  - Moving Averages (SMA 20, SMA 50)
- Visual signal indicators (Bullish, Bearish, Neutral)
- Support and resistance levels
- Overall market bias calculation

**Supported Trading Pairs:**
- XAU/USD (Gold)
- EUR/USD
- GBP/USD
- USD/JPY

**Technical Implementation:**
1. Uses custom hook `useChartData` to fetch market data
2. Calculates technical indicators using `utils/indicators.ts`
3. Displays color-coded signals (green=bullish, red=bearish, yellow=neutral)
4. Updates based on selected interval (1h, 4h, 1D)

### 6.3 Enhanced News Calendar

**Purpose:** Aggregate forex-related news and economic calendar events

**File:** `src/features/dashboard/EnhancedNewsCalendar.tsx`

**Features:**
- Real-time news feed from Finnhub API
- Economic calendar events
- Currency-specific filtering
- Impact level indicators (High, Medium, Low)
- Sentiment analysis (Bullish, Bearish, Neutral)
- Search functionality
- Auto-refresh every 30 minutes

**Filtering Options:**
- Currency pairs (USD, EUR, GBP, JPY, AUD, CAD, CHF, NZD)
- News categories
- Impact levels
- Search by keywords

**Technical Implementation:**
1. Fetches news from `services/newsService.ts`
2. Filters and sorts by relevance and time
3. Displays with color-coded impact and sentiment
4. Supports external link clicks to full articles

### 6.4 Trading Utilities Panel

**Purpose:** Provide essential trading calculators and technical analysis tools

**File:** `src/features/dashboard/TradingUtilities.tsx`

**Features:**

#### Calculators Tab:
1. **Position Size Calculator**
   - Inputs: Account balance, risk percentage, stop loss pips
   - Output: Optimal position size in lots

2. **Pip Value Calculator**
   - Inputs: Currency pair, lot size
   - Output: Value per pip in account currency

3. **Risk-Reward Calculator**
   - Inputs: Entry price, stop loss, take profit
   - Output: Risk-reward ratio, potential profit/loss

#### Enhanced Signals Tab:
1. **Technical Signals** for each trading pair:
   - Trend direction
   - RSI reading
   - Moving average signals
   - Bollinger Band position

2. **Market Sentiment Indicator**
   - Fear & Greed index
   - Momentum direction
   - Visual gauge

3. **Support & Resistance Levels**
   - Key price levels
   - Distance from current price
   - Strength indicators

**Technical Implementation:**
1. Real-time calculations using market data
2. Interactive input fields with instant results
3. Visual indicators and color coding
4. Responsive tabbed interface

### 6.5 Trade Journal System

**Purpose:** Comprehensive trade logging and performance tracking

**Files:**
- `src/pages/JournalPage.tsx` - Main journal page
- `src/features/journal/TradeEntryForm.tsx` - Trade entry form
- `src/features/journal/TradeJournalTable.tsx` - Trade history table
- `src/features/journal/JournalStats.tsx` - Performance statistics
- `backend/routers/journal.py` - Journal API endpoints

**Features:**

#### Trade Entry:
- Symbol selection
- Direction (Long/Short)
- Entry/Exit prices
- Stop loss & Take profit levels
- Trade size (lots)
- Date and time
- Outcome (Win/Loss/Breakeven)
- Status (Open/Closed)
- Notes and screenshots

#### Trade History:
- Sortable table of all trades
- Filtering options
- Edit and delete capabilities
- Export to CSV

#### Performance Analytics:
- Total trades
- Win rate percentage
- Total profit/loss
- Average win/loss
- Best and worst trades
- Risk-reward analysis
- Time-based performance

**Technical Implementation:**
1. Frontend submits trades via FastAPI backend
2. Backend validates and stores in Supabase
3. RLS policies ensure users can only modify their own trades
4. Users can view other users' trades (public read access)
5. Real-time statistics calculation from trade data

---

## 7. API Documentation

### 7.1 Base URL
```
Development: http://localhost:8000
Production: [Your production URL]
```

### 7.2 Authentication
All protected endpoints require Bearer token authentication:
```
Authorization: Bearer <JWT_TOKEN>
```

### 7.3 Endpoints

#### Health Check

**GET** `/`
- **Description:** Root endpoint
- **Authentication:** None
- **Response:**
```json
{
  "message": "Trading Dashboard API is running"
}
```

**GET** `/health`
- **Description:** Health check with configuration status
- **Authentication:** None
- **Response:**
```json
{
  "status": "healthy",
  "service": "trading-dashboard-api",
  "supabase_configured": true
}
```

#### Trade Journal Endpoints

**GET** `/api/journals/`
- **Description:** Get trade journals
- **Authentication:** Required
- **Query Parameters:**
  - `user_id` (optional): Get specific user's journals
- **Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "symbol": "EUR/USD",
    "direction": "Long",
    "entry_price": 1.0850,
    "exit_price": 1.0900,
    "stop_loss": 1.0800,
    "take_profit": 1.0950,
    "trade_size": 1.0,
    "trade_date": "2026-01-20T10:30:00Z",
    "outcome": "Win",
    "status": "Closed",
    "notes": "Clean breakout trade",
    "images": [],
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T10:30:00Z"
  }
]
```

**POST** `/api/journals/`
- **Description:** Create new trade journal entry
- **Authentication:** Required
- **Request Body:**
```json
{
  "symbol": "EUR/USD",
  "direction": "Long",
  "entry_price": 1.0850,
  "exit_price": 1.0900,
  "stop_loss": 1.0800,
  "take_profit": 1.0950,
  "trade_size": 1.0,
  "trade_date": "2026-01-20T10:30:00Z",
  "outcome": "Win",
  "status": "Closed",
  "notes": "Clean breakout trade",
  "images": []
}
```
- **Response:** Created journal entry object (201 Created)

**PUT** `/api/journals/{journal_id}`
- **Description:** Update existing trade journal
- **Authentication:** Required
- **Path Parameters:**
  - `journal_id`: UUID of the journal entry
- **Request Body:** Same as POST (all fields optional)
- **Response:** Updated journal entry object

**DELETE** `/api/journals/{journal_id}`
- **Description:** Delete trade journal entry
- **Authentication:** Required
- **Path Parameters:**
  - `journal_id`: UUID of the journal entry
- **Response:** 204 No Content

### 7.4 Error Responses

**401 Unauthorized**
```json
{
  "detail": "Invalid or expired token"
}
```

**404 Not Found**
```json
{
  "detail": "Journal not found"
}
```

**500 Internal Server Error**
```json
{
  "detail": "Error message"
}
```

---

## 8. Authentication System

### 8.1 Frontend Authentication Flow

**AuthContext Provider:**
- Located in `src/context/AuthContext.tsx`
- Manages global authentication state
- Provides user, session, loading state, and signOut function

**Protected Routes:**
- Implemented in `src/App.tsx`
- Redirects unauthenticated users to login page
- Shows loading state during session check

**Login Process:**
1. User submits credentials on `LoginPage.tsx`
2. Calls `supabase.auth.signInWithPassword()`
3. Supabase validates credentials and returns session
4. AuthContext updates with user data
5. User redirected to dashboard

**Registration Process:**
1. User submits email/password on `RegisterPage.tsx`
2. Calls `supabase.auth.signUp()`
3. Supabase creates account and optionally sends verification
4. User can log in immediately or after verification

**Logout Process:**
1. User clicks logout in Navbar
2. Calls `supabase.auth.signOut()`
3. Session cleared
4. User redirected to login page

### 8.2 Backend Authentication Flow

**JWT Validation:**
- Implemented in `backend/dependencies/auth.py`
- Uses `HTTPBearer` security scheme
- Extracts token from Authorization header
- Validates with Supabase Auth API
- Returns user object or raises 401 error

**Protected Endpoints:**
- Use `Depends(get_current_user)` dependency injection
- Automatically validate JWT before processing request
- Access user data via dependency

Example:
```python
@router.get("/journals/")
async def get_journals(user = Depends(get_current_user)):
    # user.id is available here
    pass
```

---

## 9. Frontend Components

### 9.1 Core Components

#### Layout Component (`components/Layout.tsx`)
- Main application layout wrapper
- Includes navigation bar
- Responsive design
- Theme management

#### Navbar Component (`components/Navbar.tsx`)
- Application header
- Navigation links (Dashboard, Journal)
- User authentication status
- Logout functionality

#### ErrorBoundary Component (`components/ErrorBoundary.tsx`)
- Catches React component errors
- Displays fallback UI
- Prevents entire application crash

### 9.2 Custom Hooks

#### useChartData (`hooks/useChartData.ts`)
- Fetches market data from TwelveData API
- Handles loading and error states
- Caches data for performance
- Auto-refetches on interval changes

### 9.3 Utility Functions

#### Technical Indicators (`utils/indicators.ts`)
- `calculateRSI()` - Relative Strength Index
- `calculateMACD()` - MACD indicator
- `calculateBollingerBands()` - Bollinger Bands
- `calculateSMA()` - Simple Moving Average
- `calculateSupportResistance()` - Key price levels
- `generateTechnicalSummary()` - Overall market bias

#### Class Name Utility (`lib/utils.ts`)
- `cn()` - Tailwind class name merger using `clsx` and `tailwind-merge`

### 9.4 Services

#### Chart Service (`services/chartService.ts`)
- TwelveData API integration
- Fetches OHLC data, quotes, and technical indicators
- Handles API rate limiting
- Error handling and retries

#### News Service (`services/newsService.ts`)
- Finnhub API integration
- Fetches forex news and economic calendar
- Filters and categorizes news
- Sentiment analysis
- Time formatting utilities

#### Forex Service (`services/forexService.ts`)
- Currency pair data service
- Real-time exchange rates
- Historical data fetching

---

## 10. Deployment Procedures

### 10.1 Frontend Deployment

#### Build for Production
```bash
npm run build
```

This creates a `dist/` folder with optimized production files.

#### Deployment Options

**Option 1: Vercel**
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts to deploy
4. Set environment variables in Vercel dashboard

**Option 2: Netlify**
1. Install Netlify CLI: `npm i -g netlify-cli`
2. Run: `netlify deploy --prod`
3. Set environment variables in Netlify dashboard

**Option 3: Static Hosting**
1. Upload `dist/` folder contents to any static host
2. Ensure proper routing (redirect all to index.html)

### 10.2 Backend Deployment

#### Deployment Options

**Option 1: Heroku**
1. Create `Procfile`:
```
web: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
```

2. Create `runtime.txt`:
```
python-3.9.18
```

3. Deploy:
```bash
heroku create your-app-name
git push heroku main
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_ANON_KEY=your_key
```

**Option 2: DigitalOcean App Platform**
1. Connect GitHub repository
2. Set build command: `cd backend && pip install -r requirements.txt`
3. Set run command: `cd backend && uvicorn main:app --host 0.0.0.0 --port 8080`
4. Set environment variables

**Option 3: Docker**
Create `Dockerfile`:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t trading-dashboard-api .
docker run -p 8000:8000 --env-file backend/.env trading-dashboard-api
```

### 10.3 Environment Variables Checklist

**Frontend (.env):**
- ✅ `VITE_TWELVEDATA_API_KEY`
- ✅ `VITE_FINNHUB_API_KEY`
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`

**Backend (backend/.env):**
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_ANON_KEY`

### 10.4 CORS Configuration

Update `backend/main.py` for production:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://your-production-domain.com"  # Add production domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 11. Troubleshooting Guide

### 11.1 Common Frontend Issues

**Issue:** "Missing Supabase environment variables"
- **Cause:** `.env` file not configured or wrong format
- **Solution:** 
  1. Ensure `.env` exists in project root
  2. Check variables start with `VITE_`
  3. Restart dev server after changes

**Issue:** API calls failing with CORS errors
- **Cause:** Backend CORS not configured properly
- **Solution:**
  1. Check backend CORS settings in `main.py`
  2. Ensure frontend URL is in `allow_origins`
  3. Restart backend server

**Issue:** Charts not displaying data
- **Cause:** TwelveData API rate limit or invalid key
- **Solution:**
  1. Check browser console for errors
  2. Verify API key is valid
  3. Check TwelveData dashboard for rate limits
  4. Fallback to mock data if needed

### 11.2 Common Backend Issues

**Issue:** "Invalid or expired token" errors
- **Cause:** JWT token validation failing
- **Solution:**
  1. Check Supabase URL and anon key are correct
  2. Ensure user is logged in on frontend
  3. Token might be expired - re-login
  4. Check token is being sent in Authorization header

**Issue:** Database connection errors
- **Cause:** Supabase credentials incorrect
- **Solution:**
  1. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY`
  2. Check Supabase project is active
  3. Test connection with Supabase SQL editor

**Issue:** 404 errors on journal endpoints
- **Cause:** User doesn't have permission or journal doesn't exist
- **Solution:**
  1. Check RLS policies in Supabase
  2. Verify user is authenticated
  3. Ensure journal_id exists and belongs to user

### 11.3 Database Issues

**Issue:** RLS policy blocking reads/writes
- **Cause:** Row Level Security not configured correctly
- **Solution:**
  1. Review RLS policies in Supabase dashboard
  2. Ensure policies match requirements (read own, read all, write own)
  3. Test with Supabase SQL editor

**Issue:** Slow query performance
- **Solution:**
  1. Ensure indexes exist on `user_id` and `trade_date`
  2. Add indexes to frequently queried columns
  3. Check Supabase logs for slow queries

---

## 12. Future Enhancements

### 12.1 Planned Features

**Priority 1 (High):**
- [ ] Advanced charting with TradingView widget integration
- [ ] Trade performance charts and graphs (equity curve, win/loss distribution)
- [ ] Email notifications for trade outcomes
- [ ] Multi-user leaderboard and social features
- [ ] Mobile responsive optimization
- [ ] Dark/Light theme toggle (full implementation)

**Priority 2 (Medium):**
- [ ] Advanced filtering for trade journal (date range, symbol, outcome)
- [ ] Automated trade import from broker MT4/MT5
- [ ] PDF report generation for trade journals
- [ ] Risk management dashboard
- [ ] Economic calendar with alerts
- [ ] Custom technical indicator builder

**Priority 3 (Low):**
- [ ] AI-powered trade suggestions
- [ ] Backtesting simulator
- [ ] Copy trading features
- [ ] Integration with more data providers
- [ ] Multi-language support
- [ ] Voice trading journal entries

### 12.2 Technical Debt

- [ ] Add comprehensive unit tests (Jest for frontend, pytest for backend)
- [ ] Add integration tests for API endpoints
- [ ] Implement proper logging (Winston for backend)
- [ ] Add API rate limiting and throttling
- [ ] Implement caching layer (Redis)
- [ ] Add monitoring and alerting (Sentry)
- [ ] Code documentation improvements
- [ ] Performance optimization for large datasets

### 12.3 Security Enhancements

- [ ] Implement rate limiting on authentication endpoints
- [ ] Add input validation and sanitization
- [ ] Enable CSRF protection
- [ ] Add API versioning
- [ ] Implement refresh token rotation
- [ ] Add security headers
- [ ] Regular dependency updates and security audits

---

## 13. Development Best Practices

### 13.1 Code Style

**Frontend:**
- Use functional components with TypeScript
- Follow React hooks best practices
- Use Tailwind utility classes
- Keep components small and focused
- Use meaningful variable names

**Backend:**
- Follow PEP 8 Python style guide
- Use type hints
- Document functions with docstrings
- Keep routes focused and RESTful
- Validate all inputs with Pydantic

### 13.2 Git Workflow

```bash
# Feature development
git checkout -b feature/feature-name
# Make changes
git add .
git commit -m "feat: description of feature"
git push origin feature/feature-name
# Create pull request

# Bug fixes
git checkout -b fix/bug-description
# Fix bug
git commit -m "fix: description of fix"
```

**Commit Message Convention:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### 13.3 Testing Strategy

**Frontend Testing:**
- Component tests with React Testing Library
- Integration tests for user flows
- E2E tests with Playwright

**Backend Testing:**
- Unit tests with pytest
- Integration tests for API endpoints
- Database tests with test fixtures

---

## 14. Monitoring & Maintenance

### 14.1 Monitoring Checklist

- [ ] API uptime monitoring
- [ ] Error tracking (Sentry)
- [ ] Performance metrics
- [ ] Database performance
- [ ] API rate limit usage
- [ ] User activity analytics

### 14.2 Regular Maintenance Tasks

**Daily:**
- Monitor error logs
- Check API rate limits
- Review user feedback

**Weekly:**
- Review performance metrics
- Update dependencies (if needed)
- Database backup verification

**Monthly:**
- Security audit
- Dependency updates
- Performance optimization review
- User analytics review

---

## 15. Support & Resources

### 15.1 API Documentation Links

- **TwelveData:** https://twelvedata.com/docs
- **Finnhub:** https://finnhub.io/docs/api
- **Supabase:** https://supabase.com/docs
- **FastAPI:** https://fastapi.tiangolo.com/
- **React:** https://react.dev/

### 15.2 Contact Information

**Development Team:** [Your contact information]  
**Technical Support:** [Support email/channel]  
**Project Repository:** [GitHub URL]

---

## Appendix A: Project Timeline

### Phase 1: Foundation (Completed)
- ✅ Project initialization and setup
- ✅ Frontend framework setup (React + Vite + TypeScript)
- ✅ Backend framework setup (FastAPI)
- ✅ Database design and Supabase integration
- ✅ Authentication system implementation

### Phase 2: Core Features (Completed)
- ✅ Market Bias Panel with technical indicators
- ✅ News Calendar integration
- ✅ Trading Utilities (calculators)
- ✅ Trade Journal system
- ✅ User authentication and protected routes

### Phase 3: Enhancement (Current)
- Enhanced UI/UX improvements
- Performance optimization
- Mobile responsiveness
- Additional features as per roadmap

### Phase 4: Production (Planned)
- Production deployment
- Monitoring setup
- User testing and feedback
- Documentation finalization

---

## Appendix B: API Keys Setup Guide

### TwelveData API Key
1. Go to https://twelvedata.com/
2. Sign up for free account
3. Navigate to API Keys section
4. Copy API key
5. Add to `.env` as `VITE_TWELVEDATA_API_KEY`

### Finnhub API Key
1. Go to https://finnhub.io/
2. Sign up for free account
3. Navigate to Dashboard
4. Copy API key
5. Add to `.env` as `VITE_FINNHUB_API_KEY`

### Supabase Setup
1. Go to https://supabase.com/
2. Create new project
3. Wait for project to initialize
4. Go to Project Settings > API
5. Copy Project URL and anon public key
6. Add to `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
7. Copy same values to `backend/.env` (without `VITE_` prefix)

---

**End of Documentation**

*This SOP document should be updated regularly as the project evolves. Last updated: January 20, 2026*

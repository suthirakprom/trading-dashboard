/**
 * Trading Calculators Utility Functions
 */

export interface PositionSizeParams {
    accountBalance: number;
    riskPercentage: number;
    stopLossPips: number;
    pipValue?: number; // Optional, defaults to standard calculation
    pair?: string;
}

export interface PipValueParams {
    lotSize: number;
    pair: string;
    currentPrice: number; // Quote currency price (e.g., USD/JPY price for JPY pairs)
}

export interface RiskRewardParams {
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    orderType: 'buy' | 'sell';
}

/**
 * Calculate Position Size (Lots)
 * Formula: (Account Balance * Risk %) / (Stop Loss * Pip Value)
 */
export const calculatePositionSize = (params: PositionSizeParams): { lots: number; riskAmount: number } => {
    const { accountBalance, riskPercentage, stopLossPips, pipValue = 10 } = params;

    // Calculate risk amount in account currency
    const riskAmount = accountBalance * (riskPercentage / 100);

    if (stopLossPips <= 0) return { lots: 0, riskAmount };

    // Calculate lot size
    // Standard lot pip value is usually $10 for USD pairs
    let lots = riskAmount / (stopLossPips * pipValue);

    // Round to 2 decimal places (standard micro lot)
    lots = Math.round(lots * 100) / 100;

    return { lots, riskAmount };
};

/**
 * Calculate Pip Value per Standard Lot
 * Note: This is a simplified calculation. For non-USD quote pairs, it requires conversion.
 */
export const calculatePipValue = (pair: string, price: number): number => {
    // For pairs where USD is the quote currency (EUR/USD, GBP/USD, etc.)
    // Standard lot (100,000 units) * 0.0001 = $10
    if (pair.endsWith('USD')) {
        return 10; // $10 per pip for standard lot
    }

    // For pairs where USD is the base currency (USD/JPY, USD/CHF, etc.)
    // Formula: (0.0001 / Exchange Rate) * Lot Size
    // Exception: JPY pairs use 0.01 instead of 0.0001

    if (pair.includes('JPY')) {
        // JPY pairs: 1 pip = 0.01
        // Value = (100,000 units * 0.01) / Price
        return (1000 / price);
    }

    // Other pairs (USD/CHF, USD/CAD)
    // Value = (100,000 units * 0.0001) / Price
    return (10 / price);
};

/**
 * Calculate Risk/Reward Ratio
 */
export const calculateRiskReward = (params: RiskRewardParams): { ratio: number; riskPerLot: number; rewardPerLot: number } => {
    const { entryPrice, stopLoss, takeProfit, orderType } = params;

    let risk = 0;
    let reward = 0;

    if (orderType === 'buy') {
        risk = entryPrice - stopLoss;
        reward = takeProfit - entryPrice;
    } else {
        risk = stopLoss - entryPrice;
        reward = entryPrice - takeProfit;
    }

    if (risk <= 0) return { ratio: 0, riskPerLot: 0, rewardPerLot: 0 };

    const ratio = Math.round((reward / risk) * 100) / 100;

    // Normalize to pips (approximate)
    // Assuming 4 decimal places for standard pairs, 2 for JPY
    // This is just a raw difference calculation for value estimation

    return { ratio, riskPerLot: risk, rewardPerLot: reward };
};

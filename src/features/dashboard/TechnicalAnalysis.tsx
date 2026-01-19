import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

export const TechnicalAnalysis: React.FC = () => {
    const indicators = [
        { name: 'RSI (14)', value: '64.5', signal: 'neutral' },
        { name: 'MACD', value: '0.0024', signal: 'buy' },
        { name: 'Bollinger Bands', value: 'Upper', signal: 'sell' },
        { name: 'MA (50)', value: '2045.2', signal: 'buy' },
    ];

    const getSignalIcon = (signal: string) => {
        switch (signal) {
            case 'buy': return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'sell': return <TrendingDown className="h-4 w-4 text-red-500" />;
            default: return <Minus className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getSignalColor = (signal: string) => {
        switch (signal) {
            case 'buy': return 'text-green-500';
            case 'sell': return 'text-red-500';
            default: return 'text-yellow-500';
        }
    };

    return (
        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm h-full">
            <h3 className="text-xl font-semibold mb-4">Technical Analysis</h3>
            <div className="space-y-4">
                {indicators.map((ind) => (
                    <div key={ind.name} className="flex items-center justify-between p-3 rounded-md bg-background border">
                        <div>
                            <p className="font-medium">{ind.name}</p>
                            <p className="text-sm text-muted-foreground">{ind.value}</p>
                        </div>
                        <div className={cn("flex items-center gap-1 font-medium capitalize", getSignalColor(ind.signal))}>
                            {ind.signal}
                            {getSignalIcon(ind.signal)}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Overall Summary</span>
                    <span className="font-bold text-green-500">STRONG BUY</span>
                </div>
            </div>
        </div>
    );
};

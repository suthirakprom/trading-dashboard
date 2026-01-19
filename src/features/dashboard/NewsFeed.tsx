import React from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';

export const NewsFeed: React.FC = () => {
    const newsItems = [
        { id: 1, title: 'Gold hits record high amidst global uncertainty', source: 'Financial Times', time: '2h ago' },
        { id: 2, title: 'Fed signals potential rate cuts in late 2024', source: 'Bloomberg', time: '4h ago' },
        { id: 3, title: 'Forex markets react to latest inflation data', source: 'Reuters', time: '6h ago' },
    ];

    return (
        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm h-full">
            <div className="flex items-center gap-2 mb-4">
                <Newspaper className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Market News</h3>
            </div>
            <div className="space-y-4">
                {newsItems.map((item) => (
                    <div key={item.id} className="p-4 rounded-md bg-muted/50 hover:bg-muted transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start">
                            <h4 className="font-medium group-hover:text-primary transition-colors">{item.title}</h4>
                            <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                        </div>
                        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                            <span>{item.source}</span>
                            <span>{item.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

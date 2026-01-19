import React, { Component, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallbackMessage?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="flex flex-col items-center justify-center gap-4 py-8">
                        <AlertCircle className="h-12 w-12 text-destructive/50" />
                        <div className="text-center">
                            <p className="font-medium text-destructive">Something went wrong</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {this.props.fallbackMessage || this.state.error?.message || 'An unexpected error occurred'}
                            </p>
                        </div>
                        <button
                            onClick={this.handleRetry}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

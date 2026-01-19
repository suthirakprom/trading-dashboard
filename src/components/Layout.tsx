import React from 'react';
import { Navbar } from './Navbar';
import { ThemeProvider } from '../context/ThemeContext';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <ThemeProvider>
            <div className="min-h-screen bg-background text-foreground font-sans antialiased transition-colors duration-300">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {children}
                </main>
            </div>
        </ThemeProvider>
    );
};

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Menu, X, BarChart2, LogOut, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

export const Navbar: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const { isAdmin, signOut } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Journal', href: '/journal' },
    ];

    if (isAdmin) {
        navLinks.push({ name: 'Admin', href: '/admin/users' });
    }

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <nav className="border-b bg-card text-card-foreground sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/dashboard" className="flex-shrink-0 flex items-center gap-2">
                            <BarChart2 className="h-8 w-8 text-primary" />
                            <span className="font-bold text-xl tracking-tight">TradeDash</span>
                        </Link>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === link.href
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-accent hover:text-accent-foreground'
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            {link.name === 'Admin' && <Shield size={16} />}
                                            {link.name}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6 gap-2">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
                                aria-label="Sign out"
                                title="Sign out"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={cn("md:hidden", isMenuOpen ? "block" : "hidden")}>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.href}
                            className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === link.href
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-accent hover:text-accent-foreground'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                {link.name === 'Admin' && <Shield size={16} />}
                                {link.name}
                            </span>
                        </Link>
                    ))}
                    <div className="pt-4 pb-2 border-t border-border">
                        <div className="flex items-center px-5 flex-col gap-2">
                            <button
                                onClick={toggleTheme}
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent hover:text-accent-foreground w-full"
                            >
                                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                                <span>Toggle Theme</span>
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-red-500/10 hover:text-red-500 w-full text-left"
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

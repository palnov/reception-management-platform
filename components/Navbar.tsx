'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Users, Calendar, BarChart3, ShoppingCart, FileCheck, BadgeCheck, LogOut, User as UserIcon, Database, Menu, X } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

interface User {
    id: string;
    name: string;
    role: string;
}

export function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        fetchUser();
        setIsMenuOpen(false); // Close menu on route change
    }, [pathname]);

    async function fetchUser() {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null);
                if (pathname !== '/login') router.push('/login');
            }
        } catch (error) {
            setUser(null);
        }
    }

    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
        router.push('/login');
        router.refresh();
    }

    if (pathname === '/login') return null;

    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-200 shadow-sm sticky top-0 z-50">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text shrink-0">
                {APP_NAME}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex gap-6 text-sm font-medium text-zinc-600 ml-8">
                <Link href="/schedule" className={`flex items-center gap-2 hover:text-blue-600 transition-colors ${pathname === '/schedule' ? 'text-blue-600' : ''}`}>
                    <Calendar className="w-4 h-4" /> График
                </Link>
                {user?.role === 'MANAGER' && (
                    <Link href="/employees" className={`flex items-center gap-2 hover:text-blue-600 transition-colors ${pathname === '/employees' ? 'text-blue-600' : ''}`}>
                        <Users className="w-4 h-4" /> Сотрудники
                    </Link>
                )}
                <Link href="/sales" className={`flex items-center gap-2 hover:text-blue-600 transition-colors ${pathname === '/sales' ? 'text-blue-600' : ''}`}>
                    <ShoppingCart className="w-4 h-4" /> Продажи
                </Link>
                <Link href="/registration" className={`flex items-center gap-2 hover:text-blue-600 transition-colors ${pathname === '/registration' ? 'text-blue-600' : ''}`}>
                    <FileCheck className="w-4 h-4" /> Качество оформления
                </Link>
                <Link href="/checklist" className={`flex items-center gap-2 hover:text-blue-600 transition-colors ${pathname === '/checklist' ? 'text-blue-600' : ''}`}>
                    <BadgeCheck className="w-4 h-4" /> Чеклист
                </Link>
                <Link href="/kpi" className={`flex items-center gap-2 hover:text-blue-600 transition-colors ${pathname === '/kpi' ? 'text-blue-600' : ''}`}>
                    <BarChart3 className="w-4 h-4" /> KPI и Зарплата
                </Link>
                {user?.role === 'MANAGER' && (
                    <Link href="/data" className={`flex items-center gap-2 hover:text-blue-600 transition-colors ${pathname === '/data' ? 'text-blue-600' : ''}`}>
                        <Database className="w-4 h-4" /> Данные
                    </Link>
                )}
            </div>

            <div className="flex items-center gap-4 ml-auto">
                {/* Desktop Profile */}
                <div className="hidden lg:block">
                    {user ? (
                        <div className="flex items-center gap-4 pl-6 border-l border-zinc-100">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-bold text-zinc-900">{user.name}</span>
                                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                                    {user.role === 'MANAGER' ? 'Руководитель' : user.role === 'SENIOR' ? 'Старший смены' : 'Администратор'}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-zinc-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                                title="Выйти"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="text-sm font-bold text-blue-600 hover:text-blue-700">Войти</Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="lg:hidden p-2 text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 top-[73px] bg-white z-[60] lg:hidden animate-in slide-in-from-right duration-300">
                    <div className="flex flex-col p-6 gap-4">
                        {user && (
                            <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl mb-2">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                    <UserIcon className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-zinc-900">{user.name}</span>
                                    <span className="text-xs text-zinc-500">
                                        {user.role === 'MANAGER' ? 'Руководитель' : user.role === 'SENIOR' ? 'Старший смены' : 'Администратор'}
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 gap-2">
                            <Link href="/schedule" className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${pathname === '/schedule' ? 'bg-blue-50 text-blue-600' : 'text-zinc-600 active:bg-zinc-100'}`}>
                                <Calendar className="w-5 h-5" /> График
                            </Link>
                            {user?.role === 'MANAGER' && (
                                <Link href="/employees" className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${pathname === '/employees' ? 'bg-blue-50 text-blue-600' : 'text-zinc-600 active:bg-zinc-100'}`}>
                                    <Users className="w-5 h-5" /> Сотрудники
                                </Link>
                            )}
                            <Link href="/sales" className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${pathname === '/sales' ? 'bg-blue-50 text-blue-600' : 'text-zinc-600 active:bg-zinc-100'}`}>
                                <ShoppingCart className="w-5 h-5" /> Продажи
                            </Link>
                            <Link href="/registration" className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${pathname === '/registration' ? 'bg-blue-50 text-blue-600' : 'text-zinc-600 active:bg-zinc-100'}`}>
                                <FileCheck className="w-5 h-5" /> Качество оформления
                            </Link>
                            <Link href="/checklist" className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${pathname === '/checklist' ? 'bg-blue-50 text-blue-600' : 'text-zinc-600 active:bg-zinc-100'}`}>
                                <BadgeCheck className="w-5 h-5" /> Чеклист
                            </Link>
                            <Link href="/kpi" className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${pathname === '/kpi' ? 'bg-blue-50 text-blue-600' : 'text-zinc-600 active:bg-zinc-100'}`}>
                                <BarChart3 className="w-5 h-5" /> KPI и Зарплата
                            </Link>
                            {user?.role === 'MANAGER' && (
                                <Link href="/data" className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${pathname === '/data' ? 'bg-blue-50 text-blue-600' : 'text-zinc-600 active:bg-zinc-100'}`}>
                                    <Database className="w-5 h-5" /> Данные
                                </Link>
                            )}
                        </div>

                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 p-4 rounded-xl font-bold text-red-600 mt-auto border-2 border-red-50 active:bg-red-50 transition-all"
                            >
                                <LogOut className="w-5 h-5" /> Выйти из аккаунта
                            </button>
                        ) : (
                            <Link href="/login" className="flex items-center justify-center p-4 rounded-xl font-bold bg-blue-600 text-white mt-auto"> Войти </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

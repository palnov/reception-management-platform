'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Users, Calendar, BarChart3, ShoppingCart, FileCheck, LogOut, User as UserIcon, Database } from 'lucide-react';

interface User {
    id: string;
    name: string;
    role: string;
}

export function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        fetchUser();
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
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                Администраторы ДМЦ
            </Link>

            <div className="flex gap-6 text-sm font-medium text-zinc-600 ml-8">
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
        </nav>
    );
}

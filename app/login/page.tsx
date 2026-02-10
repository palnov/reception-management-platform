'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, AlertCircle } from 'lucide-react';

interface Employee {
    id: string;
    name: string;
}

export default function LoginPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedId, setSelectedId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/employees')
            .then(res => res.json())
            .then(data => {
                setEmployees(Array.isArray(data) ? data : []);
                if (data.length > 0) setSelectedId(data[0].id);
            });
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ employeeId: selectedId, password }),
            });

            if (res.ok) {
                router.push('/');
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || 'Ошибка входа');
            }
        } catch (err) {
            setError('Ошибка подключения к серверу');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-zinc-200">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-zinc-900">Вход в систему</h1>
                        <p className="text-zinc-500 mt-2">Администраторы ДМЦ</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-1">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-2">Выберите сотрудника</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <select
                                    value={selectedId}
                                    onChange={e => setSelectedId(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:border-blue-500 outline-none font-medium appearance-none"
                                >
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-2">Пароль</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:border-blue-500 outline-none font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Вход...' : 'Войти'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Database, UserPlus, ShieldCheck, Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SetupPage() {
    const router = useRouter();
    const [status, setStatus] = useState<{ isInitialized: boolean, dbConnected: boolean, schemaExists: boolean, error?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1); // 1: Welcome/Check, 2: Create Admin, 3: Success

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        id: '',
        password: '',
        pushSchema: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch('/api/setup/status');
                const data = await res.json();
                setStatus(data);
                
                // Если таблицы отсутствуют, предустанавливаем флаг pushSchema
                if (!data.schemaExists) {
                    setFormData(prev => ({ ...prev, pushSchema: true }));
                }

                if (data.isInitialized) {
                    router.push('/login');
                }
            } catch (e) {
                console.error('Failed to check setup status', e);
            } finally {
                setLoading(false);
            }
        };
        checkStatus();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/setup/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                setStep(3);
                setTimeout(() => router.push('/login'), 3000);
            } else {
                setError(data.error || 'Ошибка инициализации');
            }
        } catch {
            setError('Ошибка сети или сервера');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 antialiased">
            <div className="max-w-md w-full">
                {/* Logo/Icon */}
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200 rotate-3">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-zinc-200 border border-zinc-100 overflow-hidden">
                    <div className="p-8 md:p-10">
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="text-center">
                                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Первичная настройка</h1>
                                    <p className="text-zinc-500 mt-2 text-sm leading-relaxed">Добро пожаловать! Давайте подготовим вашу систему к работе.</p>
                                </div>

                                <div className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-colors ${status?.dbConnected ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                                    <div className={`p-2 rounded-xl ${status?.dbConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                        <Database className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-sm text-zinc-900">База данных</div>
                                        <div className="text-xs text-zinc-600">
                                            {status?.dbConnected ? 'Подключено успешно' : 'Ошибка подключения. Проверьте настройки.'}
                                        </div>
                                    </div>
                                    {status?.dbConnected && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                                </div>

                                {status?.dbConnected && !status?.schemaExists && (
                                    <div className="p-4 rounded-2xl border-2 border-amber-100 bg-amber-50 flex items-center gap-4">
                                        <div className="p-2 rounded-xl bg-amber-500 text-white">
                                            <AlertCircle className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-sm text-zinc-900">Таблицы не найдены</div>
                                            <div className="text-xs text-zinc-600">
                                                База данных пуста. Мы создадим структуру автоматически.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {status?.dbConnected ? (
                                    <button
                                        onClick={() => setStep(2)}
                                        className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        Продолжить
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed">
                                            <AlertCircle className="w-4 h-4 mb-2" />
                                            Система не может подключиться к базе. Убедитесь, что переменная <b>DATABASE_URL</b> задана правильно.
                                        </div>
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="w-full py-3 bg-zinc-100 text-zinc-900 rounded-2xl font-bold hover:bg-zinc-200 transition-all text-sm"
                                        >
                                            Попробовать снова
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="text-center">
                                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Аккаунт администратора</h1>
                                    <p className="text-zinc-500 mt-2 text-sm leading-relaxed">Создайте первого пользователя и инициализируйте базу.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {status?.schemaExists === false && (
                                        <div className="p-4 bg-blue-50 text-blue-700 rounded-2xl text-xs font-medium">
                                            <b>Инфо:</b> На этом этапе мы также создадим все необходимые таблицы в вашей базе данных.
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider px-1">ФИО Администратора</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Напр. Иванов Иван"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:border-blue-500 outline-none font-bold transition-all placeholder:font-normal"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider px-1">ID (Логин)</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Любой текст или цифры"
                                            value={formData.id}
                                            onChange={e => setFormData({ ...formData, id: e.target.value })}
                                            className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:border-blue-500 outline-none font-bold transition-all placeholder:font-normal"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider px-1">Пароль</label>
                                        <input
                                            type="password"
                                            required
                                            placeholder="Минимум 4 символа"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:border-blue-500 outline-none font-bold transition-all placeholder:font-normal"
                                        />
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                                        Создать аккаунт и завершить
                                    </button>
                                </form>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="text-center py-8 space-y-6 animate-in zoom-in duration-500">
                                <div className="flex justify-center">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                        <CheckCircle2 className="w-12 h-12 animate-in zoom-in duration-700" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-zinc-900">Готово!</h1>
                                    <p className="text-zinc-500 mt-2">Система успешно инициализирована. Сейчас вы будете перенаправлены на вход.</p>
                                </div>
                                <Loader2 className="w-6 h-6 animate-spin text-zinc-300 mx-auto" />
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-center text-zinc-400 text-xs mt-8">
                    &copy; {new Date().getFullYear()} Staff Manager Deployment Tool
                </p>
            </div>
        </div>
    );
}

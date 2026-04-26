'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSharedMonth } from '@/lib/useSharedMonth';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Loader2, Plus, Trash2, ShoppingCart, ArrowUp, ArrowDown, BadgePercent, WalletCards } from 'lucide-react';
import { InfoTooltip } from '@/components/InfoTooltip';
import { useMonthStatus } from '@/lib/useMonthStatus';
import { MonthStatusBadge } from '@/components/MonthStatusBadge';
import { MonthClosureControls } from '@/components/MonthClosureControls';
import { ConfirmPanel } from '@/components/ConfirmPanel';
import { EmptyState } from '@/components/EmptyState';
import { InlineStatus } from '@/components/InlineStatus';

interface Employee {
    id: string;
    name: string;
    role: string;
    hireDate?: string;
    dismissalDate?: string;
    seniorId?: string | null;
}

interface AuditLog {
    id: string;
    action: string;
    changedBy: string;
    changedByRole: string;
    timestamp: string;
    details: string | null;
}

interface Sale {
    id: string;
    date: string;
    patientId: string;
    employeeId: string;
    productName: string;
    price: number;
    bonus: number;
    employee: { name: string };
    auditLogs?: AuditLog[];
}

export default function SalesPage() {
    const [currentMonth, setCurrentMonth] = useSharedMonth();
    const { isClosed, refresh: refreshMonthStatus } = useMonthStatus(currentMonth);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [activeEmployeeId, setActiveEmployeeId] = useState<string | 'all'>('all');
    const [showModal, setShowModal] = useState(false);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [pageError, setPageError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<Sale | null>(null);

    const initialForm = {
        id: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        employeeId: '',
        patientId: '',
        productName: '',
        price: '',
    };
    const [formData, setFormData] = useState(initialForm);

    const fetchEmployees = useCallback(async (ignore = { val: false }) => {
        try {
            const monthStr = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
            const res = await fetch(`/api/employees?activeInDate=${monthStr}`);
            if (!res.ok) throw new Error('Employees fetch failed');
            const data = await res.json();
            if (!ignore.val) {
                setEmployees(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch employees', error);
            if (!ignore.val) setPageError('Не удалось загрузить сотрудников для продаж.');
        }
    }, [currentMonth]);

    const fetchSales = useCallback(async (ignore = { val: false }) => {
        try {
            if (!ignore.val) setIsLoading(true);
            setPageError(null);
            const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
            const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
            const res = await fetch(`/api/sales?start=${start}&end=${end}`);
            if (!res.ok) throw new Error('Sales fetch failed');
            const data = await res.json();
            if (!ignore.val) {
                setSales(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch sales', error);
            if (!ignore.val) setPageError('Не удалось загрузить продажи за выбранный месяц.');
        } finally {
            if (!ignore.val) setIsLoading(false);
        }
    }, [currentMonth]);

    useEffect(() => {
        const ignore = { val: false };
        queueMicrotask(() => {
            void fetchEmployees(ignore);
            void fetchSales(ignore);
        });
        return () => { ignore.val = true; };
    }, [fetchEmployees, fetchSales]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (isClosed) return;
        setFormError(null);
        setIsSaving(true);
        const method = formData.id ? 'PUT' : 'POST';
        try {
            const res = await fetch('/api/sales', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                setFormError(data?.error || 'Не удалось сохранить продажу. Попробуйте еще раз.');
                return;
            }
            fetchSales();
            setShowModal(false);
        } catch (error) {
            console.error('Failed to save sale', error);
            setFormError('Не удалось связаться с сервером. Продажа не сохранена.');
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete() {
        if (isClosed) return;
        if (!pendingDelete) return;
        setIsDeleting(true);
        setPageError(null);
        try {
            const res = await fetch(`/api/sales?id=${pendingDelete.id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                setPageError(data?.error || 'Не удалось удалить продажу. Попробуйте еще раз.');
                return;
            }
            setPendingDelete(null);
            fetchSales();
        } catch (error) {
            console.error('Failed to delete sale', error);
            setPageError('Не удалось связаться с сервером. Продажа не удалена.');
        } finally {
            setIsDeleting(false);
        }
    }

    const filteredSales = useMemo(() => {
        let text = sales;
        if (activeEmployeeId !== 'all') {
            text = sales.filter(s => s.employeeId === activeEmployeeId);
        }
        return text.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }, [sales, activeEmployeeId, sortOrder]);

    const summary = useMemo(() => {
        const totalCost = filteredSales.reduce((sum, s) => sum + s.price, 0);
        const totalBonus = filteredSales.reduce((sum, s) => sum + s.bonus, 0);
        return { totalCost, totalBonus };
    }, [filteredSales]);

    return (
        <div className="space-y-7">
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">Продажи</h1>
                        <p className="mt-2 text-sm text-zinc-500">Акционные продукты, оборот и бонус 7% в одном журнале.</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-start gap-3 lg:justify-end">
                        <MonthStatusBadge isClosed={isClosed} />
                        {employees.find(e => e.role === 'MANAGER') && (
                            <MonthClosureControls
                                currentMonth={currentMonth}
                                isClosed={isClosed}
                                onStatusChange={refreshMonthStatus}
                            />
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                if (isClosed) return;
                                setFormData({
                                    ...initialForm,
                                    employeeId: activeEmployeeId !== 'all' ? activeEmployeeId : (employees.find(e => e.role !== 'MANAGER')?.id || '')
                                });
                                setFormError(null);
                                setShowModal(true);
                            }}
                            disabled={isClosed}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-stone-950/10 transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" /> Добавить продажу
                        </button>
                        <div className="flex items-center gap-2 bg-white/95 p-1 rounded-full border border-zinc-200 shadow-sm shadow-zinc-950/5 w-full sm:w-auto justify-between sm:justify-start">
                            <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-100 rounded-full transition-colors" aria-label="Предыдущий месяц"><ChevronLeft className="w-5 h-5 text-zinc-600" /></button>
                            <span className="text-sm sm:text-base font-semibold min-w-[120px] sm:w-40 text-center text-zinc-800 capitalize">{format(currentMonth, 'LLLL yyyy', { locale: ru })}</span>
                            <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-100 rounded-full transition-colors" aria-label="Следующий месяц"><ChevronRight className="w-5 h-5 text-zinc-600" /></button>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-sm shadow-zinc-950/5">
                        <ShoppingCart className="h-5 w-5 text-zinc-400" />
                        <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Всего продаж</div>
                        <div className="mt-1 text-2xl font-black text-zinc-950">{filteredSales.length}</div>
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-sm shadow-zinc-950/5">
                        <WalletCards className="h-5 w-5 text-zinc-400" />
                        <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Оборот</div>
                        <div className="mt-1 text-2xl font-black text-zinc-950">{summary.totalCost.toLocaleString()} ₽</div>
                    </div>
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 shadow-sm shadow-emerald-950/5">
                        <BadgePercent className="h-5 w-5 text-emerald-600" />
                        <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Бонусы</div>
                        <div className="mt-1 text-2xl font-black text-emerald-700">{summary.totalBonus.toLocaleString()} ₽</div>
                    </div>
                </div>
            </div>

            {pageError && (
                <InlineStatus type="error" message={pageError} className="px-4 py-3" />
            )}

            {pendingDelete && (
                <ConfirmPanel
                    title="Удалить продажу?"
                    description={<>“{pendingDelete.productName}” от {format(new Date(pendingDelete.date), 'dd.MM.yyyy')} будет удалена.</>}
                    confirmLabel={isDeleting ? 'Удаление...' : 'Удалить'}
                    cancelLabel="Оставить"
                    onConfirm={handleDelete}
                    onCancel={() => setPendingDelete(null)}
                    isBusy={isDeleting}
                />
            )}

            {/* Employee Tabs / Select */}
            <div className="rounded-2xl border border-stone-200 bg-white/95 p-2 shadow-sm">
                {/* Mobile Select */}
                <div className="sm:hidden mb-4">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Выберите сотрудника</label>
                    <select
                        value={activeEmployeeId}
                        onChange={(e) => setActiveEmployeeId(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-zinc-100 rounded-xl font-bold text-zinc-800 focus:border-blue-500 outline-none"
                    >
                        <option value="all">Все сотрудники</option>
                        {employees.filter(e => {
                            if (e.role === 'MANAGER') return false;
                            const hasSales = sales.some(s => s.employeeId === e.id);
                            if (hasSales) return true;
                            const today = new Date().toISOString().split('T')[0];
                            return (!e.dismissalDate || e.dismissalDate > today);
                        }).map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                    </select>
                </div>

                {/* Desktop Tabs */}
                <div className="hidden sm:flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveEmployeeId('all')}
                        className={`px-4 py-2.5 text-sm font-semibold transition-colors rounded-xl ${activeEmployeeId === 'all'
                            ? 'bg-stone-950 text-white shadow-sm'
                            : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                            }`}
                    >
                        Все сотрудники · {sales.length}
                    </button>
                    {employees.filter(e => {
                        if (e.role === 'MANAGER') return false;
                        const hasSales = sales.some(s => s.employeeId === e.id);
                        if (hasSales) return true;
                        const today = new Date().toISOString().split('T')[0];
                        return (!e.dismissalDate || e.dismissalDate > today);
                    }).map(emp => (
                        <button
                            key={emp.id}
                            onClick={() => setActiveEmployeeId(emp.id)}
                            className={`px-4 py-2.5 text-sm font-semibold transition-colors rounded-xl flex items-center gap-2 ${activeEmployeeId === emp.id
                                ? 'bg-stone-950 text-white shadow-sm'
                                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                                }`}
                        >
                            {emp.name} · {sales.filter(s => s.employeeId === emp.id).length}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white sm:rounded-2xl shadow-xl border-y sm:border border-zinc-200/60 overflow-x-auto -mx-3 sm:mx-0 scrollbar-custom">
                <table className="w-full text-left text-sm min-w-[900px]">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                            <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[10px] cursor-pointer hover:bg-zinc-100 transition-colors"
                                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}>
                                <div className="flex items-center gap-1">
                                    Дата
                                    {sortOrder === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                                </div>
                            </th>
                            <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[10px]">ID Пациента</th>
                            <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Сотрудник</th>
                            <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Продукт</th>
                            <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-right">Стоимость</th>
                            <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-right">Бонус (7%)</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-medium">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <tr key={index}>
                                    {Array.from({ length: 7 }).map((__, cellIndex) => (
                                        <td key={cellIndex} className="px-6 py-4">
                                            <div className="h-4 rounded bg-zinc-100 animate-pulse" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : filteredSales.map(s => (
                            <tr
                                key={s.id}
                                className={`hover:bg-zinc-50 transition-colors ${isClosed ? 'cursor-default' : 'cursor-pointer'} group`}
                                onClick={(e) => {
                                    if (isClosed) return;
                                    if ((e.target as HTMLElement).closest('[data-audit-ignore="true"]')) return;
                                    setFormData({
                                        id: s.id,
                                        date: format(new Date(s.date), 'yyyy-MM-dd'),
                                        employeeId: s.employeeId,
                                        patientId: s.patientId || '',
                                        productName: s.productName,
                                        price: s.price.toString(),
                                    });
                                    setFormError(null);
                                    setShowModal(true);
                                }}
                            >
                                <td className="px-6 py-4 text-zinc-600">{format(new Date(s.date), 'dd.MM.yyyy')}</td>
                                <td className="px-6 py-4 font-medium text-zinc-900">{s.patientId || '-'}</td>
                                <td className="px-6 py-4 text-zinc-800">{s.employee.name}</td>
                                <td className="px-6 py-4 text-zinc-600">
                                    <div className="flex items-center gap-2">
                                        {s.productName}
                                        {s.auditLogs && s.auditLogs.length > 0 && <InfoTooltip logs={s.auditLogs} />}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right text-zinc-500">{s.price.toFixed(0)} ₽</td>
                                <td className="px-6 py-4 text-right font-bold text-green-600">{s.bonus.toFixed(0)} ₽</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPendingDelete(s);
                                        }}
                                        disabled={isClosed || isDeleting}
                                        className="p-2 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
                                        aria-label="Удалить продажу"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    {!isLoading && filteredSales.length > 0 && (
                    <tfoot className="bg-zinc-100 border-t-2 border-zinc-200">
                        <tr className="font-bold text-zinc-900">
                            <td colSpan={4} className="px-6 py-4 text-right uppercase tracking-wider text-[10px]">Итого по выборке:</td>
                            <td className="px-6 py-4 text-right">{summary.totalCost.toLocaleString()} ₽</td>
                            <td className="px-6 py-4 text-right text-green-600">{summary.totalBonus.toLocaleString()} ₽</td>
                            <td></td>
                        </tr>
                    </tfoot>
                    )}
                </table>
                {!isLoading && filteredSales.length === 0 && (
                    <EmptyState
                        icon={ShoppingCart}
                        title="Продаж за выбранный период нет"
                        description={activeEmployeeId !== 'all' ? 'У выбранного сотрудника пока нет продаж в этом месяце.' : 'Когда появятся продажи, они отобразятся в этой таблице вместе с бонусами.'}
                    />
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-6">{formData.id ? 'Редактировать продажу' : 'Новая продажа'}</h2>
                        {formError && (
                            <InlineStatus type="error" message={formError} className="mb-4 px-4 py-3" />
                        )}
                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-2">Дата</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-zinc-100 rounded-xl focus:border-blue-500 outline-none font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-2">Сотрудник</label>
                                <select
                                    value={formData.employeeId}
                                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-zinc-100 rounded-xl focus:border-blue-500 outline-none font-medium text-sm"
                                >
                                    {employees.filter(e => {
                                        if (e.role === 'MANAGER') return false;
                                        const today = new Date().toISOString().split('T')[0];
                                        return !e.dismissalDate || e.dismissalDate > today;
                                    }).map(e => (
                                        <option key={e.id} value={e.id}>{e.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-zinc-700 mb-2">ID Пациента</label>
                                    <input
                                        type="text"
                                        value={formData.patientId}
                                        onChange={e => setFormData({ ...formData, patientId: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-zinc-100 rounded-xl focus:border-blue-500 outline-none font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-zinc-700 mb-2">Стоимость (₽)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-zinc-100 rounded-xl focus:border-blue-500 outline-none font-medium text-right"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-2">Название продукта</label>
                                <input
                                    type="text"
                                    value={formData.productName}
                                    onChange={e => setFormData({ ...formData, productName: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-zinc-100 rounded-xl focus:border-blue-500 outline-none font-medium"
                                    placeholder="Напр. Двойная забота"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => { setShowModal(false); setFormError(null); }} disabled={isSaving} className="flex-1 py-3 border-2 border-zinc-100 rounded-xl font-bold hover:bg-zinc-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60">Отмена</button>
                                <button type="submit" disabled={isSaving} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:cursor-not-allowed disabled:bg-blue-400 flex items-center justify-center gap-2">
                                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Сохранить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating scroll buttons */}
            <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="p-3 bg-white border border-zinc-200 shadow-xl rounded-full hover:bg-zinc-50 transition-all text-zinc-500 hover:text-blue-600 active:scale-95"
                    title="Вверх"
                >
                    <ArrowUp className="w-6 h-6" />
                </button>
                <button
                    onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })}
                    className="p-3 bg-white border border-zinc-200 shadow-xl rounded-full hover:bg-zinc-50 transition-all text-zinc-500 hover:text-blue-600 active:scale-95"
                    title="Вниз"
                >
                    <ArrowDown className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}

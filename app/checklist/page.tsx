
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSharedMonth } from '@/lib/useSharedMonth';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, ClipboardCheck, Loader2, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
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
}

interface AuditLog {
    id: string;
    action: string;
    changedBy: string;
    changedByRole: string;
    timestamp: string;
    details: string | null;
}

interface DailyChecklist {
    id: string;
    date: string;
    employeeId: string;
    criterion1: number;
    criterion2: number;
    criterion3: number;
    criterion4: number;
    criterion5: number;
    criterion6: number;
    totalScore: number;
    maxScore: number;
    createdBy?: string;
    employee: { name: string };
    auditLogs?: AuditLog[];
}

const CRITERIA_LABELS = [
    "Внешний вид и дисциплина",
    "Приветствие и первичный контакт",
    "Соблюдение алгоритма приема",
    "Стимулирование услуг",
    "Работа с возражениями",
    "Завершение контакта"
];

export default function ChecklistPage() {
    const [currentMonth, setCurrentMonth] = useSharedMonth();
    const { isClosed, refresh: refreshMonthStatus } = useMonthStatus(currentMonth);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [records, setRecords] = useState<DailyChecklist[]>([]);
    const [activeEmployeeId, setActiveEmployeeId] = useState<string | 'all'>('all');
    const [showModal, setShowModal] = useState(false);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [duplicateError, setDuplicateError] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [pageError, setPageError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<DailyChecklist | null>(null);

    const initialForm = {
        id: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        employeeId: '',
        criterion1: '100',
        criterion2: '100',
        criterion3: '100',
        criterion4: '100',
        criterion5: '100',
        criterion6: '100',
    };
    const [formData, setFormData] = useState(initialForm);

    const fetchEmployees = useCallback(async (ignore = { val: false }) => {
        try {
            const monthStr = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
            const res = await fetch(`/api/employees?activeInDate=${monthStr}`);
            if (!res.ok) throw new Error('Employees fetch failed');
            const data = await res.json();
            if (!ignore.val) setEmployees(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch employees', error);
            if (!ignore.val) setPageError('Не удалось загрузить сотрудников для чеклиста.');
        }
    }, [currentMonth]);

    const fetchRecords = useCallback(async (ignore = { val: false }) => {
        try {
            if (!ignore.val) setIsLoading(true);
            setPageError(null);
            const startStr = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
            const endStr = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
            const res = await fetch(`/api/checklist/daily?start=${startStr}&end=${endStr}`);
            if (!res.ok) throw new Error('Checklist fetch failed');
            const data = await res.json();
            if (!ignore.val) setRecords(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch checklist records', error);
            if (!ignore.val) setPageError('Не удалось загрузить записи чеклиста за выбранный месяц.');
        } finally {
            if (!ignore.val) setIsLoading(false);
        }
    }, [currentMonth]);

    useEffect(() => {
        const ignore = { val: false };
        queueMicrotask(() => {
            void fetchEmployees(ignore);
            void fetchRecords(ignore);
        });
        return () => { ignore.val = true; };
    }, [fetchEmployees, fetchRecords]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (isClosed) return;
        setFormError(null);
        setIsSaving(true);
        const method = formData.id ? 'PUT' : 'POST';

        const res = await fetch('/api/checklist/daily', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (!res.ok) {
            const data = await res.json();
            // Handle duplicate entry conflict (409) or error message
            if (res.status === 409 || data.error?.includes('уже существует')) {
                setDuplicateError(true);
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 500);
                setFormError('На эту дату уже есть запись для выбранного сотрудника.');
                setIsSaving(false);
                return;
            }
            setFormError(data.error || 'Не удалось сохранить запись чеклиста.');
            setIsSaving(false);
            return;
        }

        fetchRecords();
        setShowModal(false);
        setIsSaving(false);
    }

    async function handleDelete() {
        if (isClosed) return;
        if (!pendingDelete) return;
        setIsDeleting(true);
        setPageError(null);
        try {
            const res = await fetch(`/api/checklist/daily?id=${pendingDelete.id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                setPageError(data?.error || 'Не удалось удалить запись чеклиста.');
                return;
            }
            setPendingDelete(null);
            fetchRecords();
        } catch (error) {
            console.error('Failed to delete checklist record', error);
            setPageError('Не удалось связаться с сервером. Запись не удалена.');
        } finally {
            setIsDeleting(false);
        }
    }

    const filteredRecords = useMemo(() => {
        let text = records;
        if (activeEmployeeId !== 'all') {
            text = records.filter(r => r.employeeId === activeEmployeeId);
        }
        return [...text].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }, [records, activeEmployeeId, sortOrder]);

    const averagePercent = useMemo(() => {
        const scores = [
            Number(formData.criterion1),
            Number(formData.criterion2),
            Number(formData.criterion3),
            Number(formData.criterion4),
            Number(formData.criterion5),
            Number(formData.criterion6),
        ];
        return scores.reduce((a, b) => a + b, 0) / scores.length;
    }, [formData]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">Ежедневный чеклист</h1>
                        <p className="mt-2 text-sm text-zinc-500">Проверка стандартов обслуживания и дисциплины.</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-start gap-3 lg:justify-end">
                        <MonthStatusBadge isClosed={isClosed} />
                        <MonthClosureControls
                            currentMonth={currentMonth}
                            isClosed={isClosed}
                            onStatusChange={refreshMonthStatus}
                        />
                        <button
                            type="button"
                            onClick={() => {
                                if (isClosed) return;
                                setFormData({
                                    ...initialForm,
                                    employeeId: activeEmployeeId !== 'all' ? activeEmployeeId : (employees.find(e => e.role !== 'MANAGER')?.id || '')
                                });
                                setDuplicateError(false);
                                setFormError(null);
                                setShowModal(true);
                            }}
                            disabled={isClosed}
                            className={`w-full sm:w-auto justify-center bg-indigo-600 text-white px-4 py-3 rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/15 flex items-center gap-2 font-bold text-sm ${isClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Plus className="w-4 h-4" /> Добавить аудит
                        </button>
                        <div className="flex items-center gap-2 bg-white/95 p-1 rounded-full border border-zinc-200 shadow-sm shadow-zinc-950/5 w-full sm:w-auto justify-between sm:justify-start">
                            <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-100 rounded-full transition-colors" aria-label="Предыдущий месяц"><ChevronLeft className="w-5 h-5 text-zinc-600" /></button>
                            <span className="text-sm sm:text-base font-semibold min-w-[120px] sm:w-40 text-center text-zinc-800 capitalize">{format(currentMonth, 'LLLL yyyy', { locale: ru })}</span>
                            <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-100 rounded-full transition-colors" aria-label="Следующий месяц"><ChevronRight className="w-5 h-5 text-zinc-600" /></button>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-sm shadow-zinc-950/5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Проверок</div>
                        <div className="mt-1 text-2xl font-black text-zinc-950">{filteredRecords.length}</div>
                    </div>
                    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 shadow-sm shadow-indigo-950/5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Средний процент</div>
                        <div className="mt-1 text-2xl font-black text-indigo-700">
                            {filteredRecords.length > 0 ? `${(filteredRecords.reduce((sum, r) => sum + r.totalScore, 0) / filteredRecords.length).toFixed(1)}%` : '—'}
                        </div>
                    </div>
                </div>
            </div>

            {pageError && (
                <InlineStatus type="error" message={pageError} className="px-4 py-3" />
            )}

            {pendingDelete && (
                <ConfirmPanel
                    title="Удалить запись чеклиста?"
                    description={<>Запись от {format(new Date(pendingDelete.date), 'dd.MM.yyyy')} для {pendingDelete.employee.name} будет удалена.</>}
                    confirmLabel={isDeleting ? 'Удаление...' : 'Удалить'}
                    cancelLabel="Оставить"
                    onConfirm={handleDelete}
                    onCancel={() => setPendingDelete(null)}
                    isBusy={isDeleting}
                />
            )}

            {/* Employee Tabs / Select */}
            <div className="rounded-2xl border border-indigo-100 bg-white/95 p-2 shadow-sm">
                {/* Mobile Select */}
                <div className="sm:hidden mb-4">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Выберите сотрудника</label>
                    <select
                        value={activeEmployeeId}
                        onChange={(e) => setActiveEmployeeId(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-zinc-100 rounded-xl font-bold text-zinc-800 focus:border-purple-500 outline-none"
                    >
                        <option value="all">Все сотрудники</option>
                        {employees.filter(e => e.role !== 'MANAGER').map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                    </select>
                </div>

                {/* Desktop Tabs */}
                <div className="hidden sm:flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveEmployeeId('all')}
                        className={`px-4 py-2.5 text-sm font-semibold transition-colors rounded-xl ${activeEmployeeId === 'all'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-zinc-500 hover:text-indigo-700 hover:bg-indigo-50'
                            }`}
                    >
                        Все сотрудники
                    </button>
                    {employees.filter(e => e.role !== 'MANAGER').map(emp => (
                        <button
                            key={emp.id}
                            onClick={() => setActiveEmployeeId(emp.id)}
                            className={`px-4 py-2.5 text-sm font-semibold transition-colors rounded-xl ${activeEmployeeId === emp.id
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-zinc-500 hover:text-indigo-700 hover:bg-indigo-50'
                                }`}
                        >
                            {emp.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white sm:rounded-2xl shadow-xl border-y sm:border border-zinc-200/60 overflow-x-auto -mx-3 sm:mx-0 scrollbar-custom">
                <table className="w-full text-left text-sm min-w-[600px]">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                            <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[10px] cursor-pointer hover:bg-zinc-100 transition-colors"
                                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}>
                                <div className="flex items-center gap-1">
                                    Дата
                                    {sortOrder === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                                </div>
                            </th>
                            <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Сотрудник</th>
                            <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-center">Общий %</th>
                            <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-center w-20"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-medium">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <tr key={index}>
                                    {Array.from({ length: 4 }).map((__, cellIndex) => (
                                        <td key={cellIndex} className="px-6 py-4">
                                            <div className="h-4 rounded bg-zinc-100 animate-pulse" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : filteredRecords.map(r => (
                            <tr
                                key={r.id}
                                className={`hover:bg-zinc-50 transition-colors ${isClosed ? 'cursor-default' : 'cursor-pointer'} group`}
                                onClick={() => {
                                    if (isClosed) return;
                                    setFormData({
                                        id: r.id,
                                        date: format(new Date(r.date), 'yyyy-MM-dd'),
                                        employeeId: r.employeeId,
                                        criterion1: r.criterion1.toString(),
                                        criterion2: r.criterion2.toString(),
                                        criterion3: r.criterion3.toString(),
                                        criterion4: r.criterion4.toString(),
                                        criterion5: r.criterion5.toString(),
                                        criterion6: r.criterion6.toString(),
                                    });
                                    setDuplicateError(false);
                                    setFormError(null);
                                    setShowModal(true);
                                }}
                            >
                                <td className="px-6 py-4 text-zinc-600">{format(new Date(r.date), 'dd.MM.yyyy')}</td>
                                <td className="px-6 py-4 font-bold text-zinc-900">
                                    <div className="flex items-center gap-2">
                                        {r.employee.name}
                                        {r.auditLogs && r.auditLogs.length > 0 && <InfoTooltip logs={r.auditLogs} />}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${r.totalScore >= 90 ? 'bg-green-100 text-green-700' : r.totalScore >= 76 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                        {r.totalScore.toFixed(1)} %
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPendingDelete(r);
                                        }}
                                        disabled={isClosed || isDeleting}
                                        className="p-2 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
                                        aria-label="Удалить запись чеклиста"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    {!isLoading && filteredRecords.length > 0 && (
                        <tfoot className="bg-zinc-100 border-t-2 border-zinc-200">
                            <tr className="font-bold text-zinc-900">
                                <td colSpan={2} className="px-6 py-4 text-right uppercase tracking-wider text-[10px]">Средний процент за период:</td>
                                <td className="px-6 py-4 text-center">
                                    {(() => {
                                        const total = filteredRecords.reduce((sum, r) => sum + r.totalScore, 0);
                                        const avg = total / filteredRecords.length;
                                        return (
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${avg >= 90 ? 'bg-green-100 text-green-700' : avg >= 76 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                                {avg.toFixed(1)} %
                                            </span>
                                        );
                                    })()}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
                {!isLoading && filteredRecords.length === 0 && (
                    <EmptyState
                        icon={ClipboardCheck}
                        title="Проверок чеклиста пока нет"
                        description={activeEmployeeId !== 'all' ? 'У выбранного сотрудника нет проверок чеклиста за этот месяц.' : 'Когда появятся проверки, здесь будет виден процент по каждой записи и среднее за период.'}
                    />
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-6">{formData.id ? 'Редактировать аудит' : 'Новая проверка чеклиста'}</h2>
                        {formError && (
                            <InlineStatus type="error" message={formError} className="mb-4 px-4 py-3" />
                        )}
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Дата</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={e => {
                                            setFormData({ ...formData, date: e.target.value });
                                            setDuplicateError(false);
                                        }}
                                        className={`w-full bg-zinc-50 border-2 rounded-xl px-4 py-3 focus:bg-white outline-none font-bold text-sm transition-all ${
                                            duplicateError 
                                            ? 'border-red-500 text-red-600 bg-red-50 focus:border-red-600' 
                                            : 'border-zinc-100 focus:border-purple-500'
                                        } ${isShaking ? 'shake' : ''}`}
                                    />
                                    {duplicateError && (
                                        <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
                                            На эту дату уже есть запись
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Сотрудник</label>
                                    <select
                                        value={formData.employeeId}
                                        onChange={e => {
                                            setFormData({ ...formData, employeeId: e.target.value });
                                            setDuplicateError(false);
                                        }}
                                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl px-4 py-3 focus:border-purple-500 focus:bg-white outline-none font-bold text-sm transition-all"
                                    >
                                        {employees.filter(e => e.role !== 'MANAGER').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-6 gap-x-8 bg-zinc-50/50 p-6 rounded-2xl border-2 border-zinc-100">
                                {CRITERIA_LABELS.map((label, index) => {
                                    const field = `criterion${index + 1}` as keyof typeof formData;
                                    return (
                                        <div key={field} className="space-y-2">
                                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">{label}</label>
                                            <div className="relative group">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={formData[field]}
                                                    onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                                                    className="w-full bg-white border-2 border-zinc-100 rounded-xl px-4 py-3 focus:border-purple-500 outline-none font-black text-sm transition-all pr-12"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 font-bold">%</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-100 flex justify-between items-center">
                                <div>
                                    <span className="text-sm font-bold text-purple-400 block uppercase tracking-wider mb-1">Итоговый результат:</span>
                                    <span className="text-3xl font-black text-purple-600">{averagePercent.toFixed(1)} <small className="text-lg font-bold opacity-60">%</small></span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button type="button" onClick={() => { setShowModal(false); setFormError(null); }} disabled={isSaving} className="flex-1 py-4 border-2 border-zinc-100 rounded-2xl font-bold hover:bg-zinc-50 transition-colors text-sm disabled:cursor-not-allowed disabled:opacity-60">Отмена</button>
                                <button type="submit" disabled={isSaving} className="flex-1 bg-purple-600 text-white py-4 rounded-2xl font-bold hover:bg-purple-700 transition-colors shadow-xl text-sm disabled:cursor-not-allowed disabled:bg-purple-400 flex items-center justify-center gap-2">
                                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Сохранить результаты
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

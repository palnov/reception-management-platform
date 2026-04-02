
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSharedMonth } from '@/lib/useSharedMonth';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Trash2, ClipboardCheck, Star, BadgeCheck, ArrowUp, ArrowDown } from 'lucide-react';
import { InfoTooltip } from '@/components/InfoTooltip';
import { useMonthStatus } from '@/lib/useMonthStatus';
import { MonthStatusBadge } from '@/components/MonthStatusBadge';
import { MonthClosureControls } from '@/components/MonthClosureControls';

interface Employee {
    id: string;
    name: string;
    role: string;
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
    auditLogs?: any[];
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

    const fetchEmployees = async () => {
        const monthStr = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const res = await fetch(`/api/employees?activeInDate=${monthStr}`);
        const data = await res.json();
        setEmployees(Array.isArray(data) ? data : []);
    };

    const fetchRecords = async () => {
        const startStr = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const endStr = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
        const res = await fetch(`/api/checklist/daily?start=${startStr}&end=${endStr}`);
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : []);
    };

    useEffect(() => {
        fetchEmployees();
        fetchRecords();
    }, [currentMonth]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (isClosed) return;
        const method = formData.id ? 'PUT' : 'POST';

        const res = await fetch('/api/checklist/daily', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (!res.ok) {
            const data = await res.json();
            alert(`Ошибка при сохранении: ${data.error || 'Неизвестная ошибка'}`);
            return;
        }

        fetchRecords();
        setShowModal(false);
    }

    async function handleDelete(id: string) {
        if (isClosed) return;
        if (!confirm('Удалить запись аудита?')) return;
        await fetch(`/api/checklist/daily?id=${id}`, { method: 'DELETE' });
        fetchRecords();
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
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Ежедневный чеклист</h1>
                        <button
                            onClick={() => {
                                if (isClosed) return;
                                setFormData({
                                    ...initialForm,
                                    employeeId: activeEmployeeId !== 'all' ? activeEmployeeId : (employees.find(e => e.role !== 'MANAGER')?.id || '')
                                });
                                setShowModal(true);
                            }}
                            disabled={isClosed}
                            className={`bg-zinc-900 text-white px-4 py-2 rounded-xl hover:bg-zinc-800 transition-all shadow-lg flex items-center gap-2 font-bold text-sm ${isClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Plus className="w-4 h-4" /> Добавить аудит
                        </button>
                    </div>
                    <p className="text-zinc-500 mt-1 text-sm">Проверка стандартов обслуживания и дисциплины.</p>
                </div>
                <div className="flex items-center gap-4">
                    <MonthStatusBadge isClosed={isClosed} />
                    <MonthClosureControls 
                        currentMonth={currentMonth} 
                        isClosed={isClosed} 
                        onStatusChange={refreshMonthStatus}
                    />
                    <div className="flex items-center gap-4 bg-white p-1 rounded-full border border-zinc-200/60 shadow-sm">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-zinc-600" /></button>
                        <span className="text-sm font-bold w-32 text-center text-zinc-800 capitalize">{format(currentMonth, 'LLLL yyyy', { locale: ru })}</span>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-zinc-600" /></button>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-px">
                <button
                    onClick={() => setActiveEmployeeId('all')}
                    className={`px-6 py-3 text-sm font-bold transition-all border-b-2 rounded-t-xl ${activeEmployeeId === 'all'
                        ? 'border-purple-600 text-purple-600 bg-purple-50'
                        : 'border-transparent text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'
                        }`}
                >
                    Все сотрудники
                </button>
                {employees.filter(e => e.role !== 'MANAGER').map(emp => (
                    <button
                        key={emp.id}
                        onClick={() => setActiveEmployeeId(emp.id)}
                        className={`px-6 py-3 text-sm font-bold transition-all border-b-2 rounded-t-xl ${activeEmployeeId === emp.id
                            ? 'border-purple-600 text-purple-600 bg-purple-50'
                            : 'border-transparent text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'
                            }`}
                    >
                        {emp.name}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-zinc-200/60 overflow-hidden">
                <table className="w-full text-left text-sm">
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
                        {filteredRecords.map(r => (
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
                                            handleDelete(r.id);
                                        }}
                                        className="p-2 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    {filteredRecords.length > 0 && (
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
            </div>

            {filteredRecords.length === 0 && (
                <div className="p-20 text-center text-zinc-400 font-medium whitespace-pre-wrap">
                    Нет записей аудита за этот месяц{activeEmployeeId !== 'all' ? ` для выбранного сотрудника` : ''}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-6">{formData.id ? 'Редактировать аудит' : 'Новая проверка чеклиста'}</h2>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Дата</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl px-4 py-3 focus:border-purple-500 focus:bg-white outline-none font-bold text-sm transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Сотрудник</label>
                                    <select
                                        value={formData.employeeId}
                                        onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
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
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Ожидаемый бонус</div>
                                    {averagePercent >= 90 ? <span className="text-green-600 font-black">+5000р</span> :
                                     averagePercent >= 76 ? <span className="text-blue-600 font-black">+2500р</span> :
                                     <span className="text-zinc-400 font-black">0р</span>}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 border-2 border-zinc-100 rounded-2xl font-bold hover:bg-zinc-50 transition-colors text-sm">Отмена</button>
                                <button type="submit" className="flex-1 bg-purple-600 text-white py-4 rounded-2xl font-bold hover:bg-purple-700 transition-colors shadow-xl text-sm">Сохранить результаты</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

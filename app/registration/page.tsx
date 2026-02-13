
'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Trash2, FileCheck, Star, BadgeCheck, ArrowUp, ArrowDown } from 'lucide-react';
import { InfoTooltip } from '@/components/InfoTooltip';

interface Employee {
    id: string;
    name: string;
    role: string;
}

interface RegistrationKpi {
    id: string;
    date: string;
    employeeId: string;
    count: number;
    totalScore: number;
    maxScore: number;
    createdBy?: string;
    employee: { name: string };
    auditLogs?: any[];
}

export default function RegistrationPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [records, setRecords] = useState<RegistrationKpi[]>([]);
    const [activeEmployeeId, setActiveEmployeeId] = useState<string | 'all'>('all');
    const [showModal, setShowModal] = useState(false);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const initialForm = {
        id: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        employeeId: '',
        count: '0',
        totalScore: '0',
    };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [currentMonth]);

    async function fetchEmployees() {
        const res = await fetch('/api/employees');
        const data = await res.json();
        setEmployees(Array.isArray(data) ? data : []);
    }

    async function fetchRecords() {
        const start = startOfMonth(currentMonth).toISOString();
        const end = endOfMonth(currentMonth).toISOString();
        const res = await fetch(`/api/registration?start=${start}&end=${end}`);
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : []);
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        const method = formData.id ? 'PUT' : 'POST';
        const maxPoints = Number(formData.count) * 3;
        if (Number(formData.totalScore) > maxPoints) {
            alert(`Ошибка: Фактические баллы (${formData.totalScore}) не могут превышать максимальные (${maxPoints})`);
            return;
        }

        const res = await fetch('/api/registration', {
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
        if (!confirm('Удалить запись об оформлении?')) return;
        await fetch(`/api/registration?id=${id}`, { method: 'DELETE' });
        fetchRecords();
    }

    const filteredRecords = useMemo(() => {
        let text = records;
        if (activeEmployeeId !== 'all') {
            text = records.filter(r => r.employeeId === activeEmployeeId);
        }
        return text.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }, [records, activeEmployeeId, sortOrder]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Качество оформления</h1>
                        <button
                            onClick={() => {
                                setFormData({
                                    ...initialForm,
                                    employeeId: activeEmployeeId !== 'all' ? activeEmployeeId : (employees.find(e => e.role !== 'MANAGER')?.id || '')
                                });
                                setShowModal(true);
                            }}
                            className="bg-zinc-900 text-white px-4 py-2 rounded-xl hover:bg-zinc-800 transition-all shadow-lg flex items-center gap-2 font-bold text-sm"
                        >
                            <Plus className="w-4 h-4" /> Добавить запись
                        </button>
                    </div>
                    <p className="text-zinc-500 mt-1 text-sm">Ежедневный аудит качества заполнения карт.</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-1 rounded-full border border-zinc-200/60 shadow-sm">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-zinc-600" /></button>
                    <span className="text-sm font-bold w-32 text-center text-zinc-800 capitalize">{format(currentMonth, 'LLLL yyyy', { locale: ru })}</span>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-zinc-600" /></button>
                </div>
            </div>

            {/* Employee Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-px">
                <button
                    onClick={() => setActiveEmployeeId('all')}
                    className={`px-6 py-3 text-sm font-bold transition-all border-b-2 rounded-t-xl ${activeEmployeeId === 'all'
                        ? 'border-blue-600 text-blue-600 bg-blue-50'
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
                            ? 'border-blue-600 text-blue-600 bg-blue-50'
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
                            <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-center">Кол-во оформлений</th>
                            <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-center">Баллы</th>
                            <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-center">Качество (%)</th>

                            <th className="px-6 py-4 w-20"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-medium">
                        {filteredRecords.map(r => (
                            <tr
                                key={r.id}
                                className="hover:bg-zinc-50 transition-colors cursor-pointer group"
                                onClick={(e) => {
                                    if ((e.target as HTMLElement).closest('[data-audit-ignore="true"]')) return;
                                    setFormData({
                                        id: r.id,
                                        date: format(new Date(r.date), 'yyyy-MM-dd'),
                                        employeeId: r.employeeId,
                                        count: (r.count ?? 0).toString(),
                                        totalScore: (r.totalScore ?? 0).toString()
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
                                <td className="px-6 py-4 text-center font-bold text-zinc-700">{r.count ?? 0}</td>
                                <td className="px-6 py-4 text-center text-zinc-500 font-bold">{(r.totalScore ?? 0)} / {(r.maxScore ?? 0)}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${(((r.totalScore ?? 0) / (r.maxScore || 1)) * 100) >= 90 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {(((r.totalScore ?? 0) / (r.maxScore || 1)) * 100).toFixed(1)} %
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
                    {activeEmployeeId !== 'all' && (
                        <tfoot className="bg-zinc-100 border-t-2 border-zinc-200">
                            <tr className="font-bold text-zinc-900">
                                <td colSpan={2} className="px-6 py-4 text-right uppercase tracking-wider text-[10px]">Итого по выборке:</td>
                                <td className="px-6 py-4 text-center">{filteredRecords.reduce((sum, r) => sum + (r.count ?? 0), 0)}</td>
                                <td className="px-6 py-4 text-center text-zinc-500">
                                    {filteredRecords.reduce((sum, r) => sum + (r.totalScore ?? 0), 0)} / {filteredRecords.reduce((sum, r) => sum + (r.maxScore ?? 0), 0)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {(() => {
                                        const totalScore = filteredRecords.reduce((sum, r) => sum + (r.totalScore ?? 0), 0);
                                        const totalMax = filteredRecords.reduce((sum, r) => sum + (r.maxScore ?? 0), 0);
                                        const percent = totalMax > 0 ? (totalScore / totalMax) * 100 : 100;
                                        return (
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${percent >= 90 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {percent.toFixed(1)} %
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
                    Нет записей об аудите за этот месяц{activeEmployeeId !== 'all' ? ` для выбранного сотрудника` : ''}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-6">{formData.id ? 'Редактировать запись' : 'Новый аудит'}</h2>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Дата</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl px-4 py-3 focus:border-blue-500 focus:bg-white outline-none font-bold text-sm transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Сотрудник</label>
                                    <select
                                        value={formData.employeeId}
                                        onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl px-4 py-3 focus:border-blue-500 focus:bg-white outline-none font-bold text-sm transition-all"
                                    >
                                        {employees.filter(e => e.role !== 'MANAGER').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Оформлено (шт)</label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            value={formData.count}
                                            onChange={e => setFormData({ ...formData, count: e.target.value })}
                                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl px-4 py-3 focus:border-blue-500 focus:bg-white outline-none font-bold text-sm transition-all"
                                            placeholder="Кол-во"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Фактич. баллы</label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            step="1"
                                            max={Number(formData.count) * 3}
                                            value={formData.totalScore}
                                            onChange={e => setFormData({ ...formData, totalScore: e.target.value })}
                                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl px-4 py-3 focus:border-blue-500 focus:bg-white outline-none font-bold text-sm transition-all"
                                            placeholder="Баллы"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-zinc-50 rounded-2xl p-6 border-2 border-zinc-100 space-y-4">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-zinc-500">Макс. баллов:</span>
                                    <span className="text-zinc-900">{Number(formData.count) * 3}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-zinc-500">Процент качества:</span>
                                    <span className={`text-xl font-black ${((Number(formData.totalScore) / (Number(formData.count) * 3 || 1)) * 100) >= 90 ? 'text-green-600' : 'text-amber-500'}`}>
                                        {((Number(formData.totalScore) / (Number(formData.count) * 3 || 1)) * 100).toFixed(1)} %
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 border-2 border-zinc-100 rounded-2xl font-bold hover:bg-zinc-50 transition-colors text-sm">Отмена</button>
                                <button type="submit" className="flex-1 bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-colors shadow-xl text-sm">Сохранить</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

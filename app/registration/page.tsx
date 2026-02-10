
'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Trash2, FileCheck, Star } from 'lucide-react';
import { BadgeCheck } from 'lucide-react';
import { InfoTooltip } from '@/components/InfoTooltip';

interface Employee {
    id: string;
    name: string;
    role: string;
}

interface RegistrationKpi {
    id: string;
    date: string;
    patientId: string;
    employeeId: string;
    criterion1: number;
    criterion2: number;
    criterion3: number;
    totalScore: number;
    maxScore: number;
    createdBy?: string;
    employee: { name: string };
    auditLogs?: any[];
}

export default function RegistrationPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [records, setRecords] = useState<RegistrationKpi[]>([]); // Updated type
    const [activeEmployeeId, setActiveEmployeeId] = useState<string | 'all'>('all');
    const [showModal, setShowModal] = useState(false);

    const initialForm = {
        id: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        employeeId: '',
        patientId: '',
        scores: {
            criterion1: false, // Указана почта
            criterion2: false, // Указано доверенное лицо
            criterion3: false, // Правильность заполнения
        },
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
        if (data.length > 0 && activeEmployeeId === 'all') {
            // No need to set activeEmployeeId to first employee by default if we want 'all'
        }
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
        const totalScore = Object.values(formData.scores).filter(Boolean).length;
        const maxScore = 3;

        const method = formData.id ? 'PUT' : 'POST';
        await fetch('/api/registration', {
            method,
            body: JSON.stringify({
                ...formData,
                totalScore,
                maxScore
            }),
        });
        fetchRecords();
        setShowModal(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Удалить запись об оформлении?')) return; // Updated confirmation message
        await fetch(`/api/registration?id=${id}`, { method: 'DELETE' });
        fetchRecords();
    }

    const filteredRecords = useMemo(() => {
        if (activeEmployeeId === 'all') return records;
        return records.filter(r => r.employeeId === activeEmployeeId);
    }, [records, activeEmployeeId]);

    const summary = useMemo(() => {
        if (filteredRecords.length === 0) return null; // Changed return type to null
        const count = filteredRecords.length;
        const totalPoints = filteredRecords.reduce((sum, r) => sum + r.totalScore, 0);
        const totalMax = filteredRecords.reduce((sum, r) => sum + r.maxScore, 0);
        const percentage = (totalPoints / totalMax) * 100;

        return { count, totalPoints, totalMax, percentage };
    }, [filteredRecords]);

    // Removed avgTotalScore useMemo

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Качество оформления первичных пациентов</h1>
                    <p className="text-zinc-500 mt-2">Аудит заполнения медицинских карт и систем.</p> {/* Updated description */}
                </div>
                <div className="flex items-center gap-4 bg-white p-1 rounded-full border border-zinc-200 shadow-sm">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-zinc-600" /></button>
                    <span className="text-lg font-semibold w-40 text-center text-zinc-800 capitalize">{format(currentMonth, 'LLLL yyyy', { locale: ru })}</span>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium text-zinc-500 mb-1">Всего оформлений</div>
                        <div className="text-2xl font-bold text-zinc-900">{filteredRecords.length}</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <FileCheck className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium text-zinc-500 mb-1">Среднее качество (мес)</div>
                        <div className="text-2xl font-bold text-indigo-600">
                            {filteredRecords.length > 0
                                ? ((filteredRecords.reduce((sum, r) => sum + (r.totalScore / r.maxScore), 0) / filteredRecords.length) * 100).toFixed(1)
                                : '0'} %
                        </div>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-xl">
                        <BadgeCheck className="w-6 h-6 text-indigo-600" />
                    </div>
                </div>
                <div className="flex items-center justify-center">
                    <button
                        onClick={() => {
                            setFormData({
                                ...initialForm,
                                employeeId: activeEmployeeId !== 'all' ? activeEmployeeId : (employees[0]?.id || '')
                            });
                            setShowModal(true);
                        }}
                        className="w-full h-full bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-all shadow-lg flex items-center justify-center gap-2 font-bold py-6 px-8"
                    >
                        <Plus className="w-6 h-6" /> Добавить первичку
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-zinc-200/60 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                            <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Дата</th>
                            <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[10px]">ID Пациента</th>
                            <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Сотрудник</th>
                            <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Автор</th>
                            <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-right">Результат</th>
                            <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-right">Качество (%)</th>
                            <th className="px-6 py-4"></th>
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
                                        patientId: r.patientId || '',
                                        scores: {
                                            criterion1: r.criterion1 === 1,
                                            criterion2: r.criterion2 === 1,
                                            criterion3: r.criterion3 === 1,
                                        }
                                    });
                                    setShowModal(true);
                                }}
                            >
                                <td className="px-6 py-4 text-zinc-600">{format(new Date(r.date), 'dd.MM.yyyy')}</td>
                                <td className="px-6 py-4 font-medium text-zinc-900">{r.patientId || '-'}</td>
                                <td className="px-6 py-4 text-zinc-800">{r.employee.name}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-zinc-400 font-bold uppercase truncate max-w-[100px]" title={r.createdBy || '-'}>
                                            {r.createdBy || '-'}
                                        </span>
                                        {r.auditLogs && r.auditLogs.length > 0 && <InfoTooltip logs={r.auditLogs} />}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right text-zinc-500">{r.totalScore} / {r.maxScore}</td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${((r.totalScore / r.maxScore) * 100) >= 90 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {((r.totalScore / r.maxScore) * 100).toFixed(0)} %
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
                    <tfoot className="bg-zinc-100 border-t-2 border-zinc-200">
                        <tr className="font-bold text-zinc-900">
                            <td colSpan={5} className="px-6 py-4 text-right uppercase tracking-wider text-[10px]">Итого по выборке:</td>
                            <td className="px-6 py-4 text-right">
                                <div className={`inline-block px-3 py-1.5 rounded-xl ${(summary?.percentage || 0) >= 90 ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'}`}>
                                    {summary ? `${summary.percentage.toFixed(1)} %` : '0 %'}
                                </div>
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {filteredRecords.length === 0 && (
                <div className="p-20 text-center text-zinc-400 font-medium whitespace-pre-wrap">
                    Нет записей об аудите оформления за этот месяц{activeEmployeeId !== 'all' ? ` для выбранного сотрудника` : ''}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-6">{formData.id ? 'Редактировать аудит' : 'Новый аудит'}</h2>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-zinc-700 mb-2">Дата</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-zinc-100 rounded-xl focus:border-blue-500 outline-none font-medium text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-zinc-700 mb-2">ID Пациента</label>
                                    <input
                                        type="text"
                                        value={formData.patientId}
                                        onChange={e => setFormData({ ...formData, patientId: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-zinc-100 rounded-xl focus:border-blue-500 outline-none font-medium text-sm"
                                        placeholder="Номер карты"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-2">Сотрудник</label>
                                <select
                                    value={formData.employeeId}
                                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-zinc-100 rounded-xl focus:border-blue-500 outline-none font-medium text-sm"
                                >
                                    {employees.filter(e => e.role !== 'MANAGER').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-zinc-100">
                                <h3 className="font-bold text-zinc-800 text-sm">Критерии качества</h3>

                                <label className="flex items-center justify-between bg-zinc-50 p-4 rounded-2xl border-2 border-transparent hover:border-blue-100 cursor-pointer transition-all">
                                    <span className="text-sm font-bold text-zinc-700">Указана почта</span>
                                    <input
                                        type="checkbox"
                                        checked={formData.scores.criterion1}
                                        onChange={e => setFormData({ ...formData, scores: { ...formData.scores, criterion1: e.target.checked } })}
                                        className="w-6 h-6 text-blue-600 rounded-lg border-zinc-300 focus:ring-blue-500"
                                    />
                                </label>

                                <label className="flex items-center justify-between bg-zinc-50 p-4 rounded-2xl border-2 border-transparent hover:border-blue-100 cursor-pointer transition-all">
                                    <span className="text-sm font-bold text-zinc-700">Указано доверенное лицо</span>
                                    <input
                                        type="checkbox"
                                        checked={formData.scores.criterion2}
                                        onChange={e => setFormData({ ...formData, scores: { ...formData.scores, criterion2: e.target.checked } })}
                                        className="w-6 h-6 text-blue-600 rounded-lg border-zinc-300 focus:ring-blue-500"
                                    />
                                </label>

                                <label className="flex items-center justify-between bg-zinc-50 p-4 rounded-2xl border-2 border-transparent hover:border-blue-100 cursor-pointer transition-all">
                                    <span className="text-sm font-bold text-zinc-700">Правильность заполнения</span>
                                    <input
                                        type="checkbox"
                                        checked={formData.scores.criterion3}
                                        onChange={e => setFormData({ ...formData, scores: { ...formData.scores, criterion3: e.target.checked } })}
                                        className="w-6 h-6 text-blue-600 rounded-lg border-zinc-300 focus:ring-blue-500"
                                    />
                                </label>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border-2 border-zinc-100 rounded-xl font-bold hover:bg-zinc-50 transition-colors">Отмена</button>
                                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">Сохранить</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { InfoTooltip } from '@/components/InfoTooltip';

interface Employee {
    id: string;
    name: string;
    role: string;
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
    auditLogs?: any[];
}

export default function SalesPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [activeEmployeeId, setActiveEmployeeId] = useState<string | 'all'>('all');
    const [showModal, setShowModal] = useState(false);

    const initialForm = {
        id: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        employeeId: '',
        patientId: '',
        productName: '',
        price: '',
    };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        fetchSales();
    }, [currentMonth]);

    async function fetchEmployees() {
        const res = await fetch('/api/employees');
        const data = await res.json();
        setEmployees(Array.isArray(data) ? data : []);
    }

    async function fetchSales() {
        const start = startOfMonth(currentMonth).toISOString();
        const end = endOfMonth(currentMonth).toISOString();
        const res = await fetch(`/api/sales?start=${start}&end=${end}`);
        const data = await res.json();
        setSales(Array.isArray(data) ? data : []);
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        const method = formData.id ? 'PUT' : 'POST';
        await fetch('/api/sales', {
            method,
            body: JSON.stringify(formData),
        });
        fetchSales();
        setShowModal(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Удалить запись о продаже?')) return;
        await fetch(`/api/sales?id=${id}`, { method: 'DELETE' });
        fetchSales();
    }

    const filteredSales = useMemo(() => {
        if (activeEmployeeId === 'all') return sales;
        return sales.filter(s => s.employeeId === activeEmployeeId);
    }, [sales, activeEmployeeId]);

    const summary = useMemo(() => {
        const totalCost = filteredSales.reduce((sum, s) => sum + s.price, 0);
        const totalBonus = filteredSales.reduce((sum, s) => sum + s.bonus, 0);
        return { totalCost, totalBonus };
    }, [filteredSales]);

    const totalSalesBonus = useMemo(() => {
        return sales.reduce((sum, s) => sum + s.bonus, 0);
    }, [sales]);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Продажи акционных продуктов</h1>
                    <p className="text-zinc-500 mt-2">Бонус составляет 7% от стоимости</p>
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
                        <div className="text-sm font-medium text-zinc-500 mb-1">Всего продаж</div>
                        <div className="text-2xl font-bold text-zinc-900">{filteredSales.length}</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <ShoppingCart className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium text-zinc-500 mb-1">Сумма бонусов</div>
                        <div className="text-2xl font-bold text-green-600">{summary.totalBonus.toFixed(0)} ₽</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl">
                        <div className="text-green-600 font-bold text-xl">%</div>
                    </div>
                </div>
                <div className="flex items-center justify-center">
                    <button
                        onClick={() => {
                            setFormData({
                                ...initialForm,
                                employeeId: activeEmployeeId !== 'all' ? activeEmployeeId : (employees.find(e => e.role !== 'MANAGER')?.id || '')
                            });
                            setShowModal(true);
                        }}
                        className="w-full h-full bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-all shadow-lg flex items-center justify-center gap-2 font-bold py-6 px-8"
                    >
                        <Plus className="w-6 h-6" /> Добавить продажу
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
                            <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Продукт</th>
                            <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-right">Стоимость</th>
                            <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-right">Бонус (7%)</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-medium">
                        {filteredSales.map(s => (
                            <tr
                                key={s.id}
                                className="hover:bg-zinc-50 transition-colors cursor-pointer group"
                                onClick={(e) => {
                                    if ((e.target as HTMLElement).closest('[data-audit-ignore="true"]')) return;
                                    setFormData({
                                        id: s.id,
                                        date: format(new Date(s.date), 'yyyy-MM-dd'),
                                        employeeId: s.employeeId,
                                        patientId: s.patientId || '',
                                        productName: s.productName,
                                        price: s.price.toString(),
                                    });
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
                                            handleDelete(s.id);
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
                            <td colSpan={4} className="px-6 py-4 text-right uppercase tracking-wider text-[10px]">Итого по выборке:</td>
                            <td className="px-6 py-4 text-right">{summary.totalCost.toLocaleString()} ₽</td>
                            <td className="px-6 py-4 text-right text-green-600">{summary.totalBonus.toLocaleString()} ₽</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
                {filteredSales.length === 0 && <div className="p-20 text-center text-zinc-400 font-medium whitespace-pre-wrap">Нет записей о продажах за этот месяц{activeEmployeeId !== 'all' ? ` для выбранного сотрудника` : ''}</div>}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-6">{formData.id ? 'Редактировать продажу' : 'Новая продажа'}</h2>
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
                                    {employees.filter(e => e.role !== 'MANAGER').map(e => (
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

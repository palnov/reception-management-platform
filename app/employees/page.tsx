
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Plus, User, MapPin, BadgeCheck, Trash2, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Employee {
    id: string;
    name: string;
    role: string;
    baseSalary: number;
    hourlyRate: number;
    branch?: string;
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    const initialForm = {
        name: '',
        role: 'ADMIN',
        password: '', // New field
        baseSalary: '',
        branch: 'Дзержинского 26' // Default
    };

    const [formData, setFormData] = useState(initialForm);
    const router = useRouter();

    useEffect(() => {
        fetchEmployees();
    }, []);

    async function fetchEmployees() {
        try {
            const res = await fetch('/api/employees');
            if (res.status === 403) {
                router.push('/schedule');
                return;
            }
            if (!res.ok) throw new Error('Unauthorized or error');
            const data = await res.json();
            setEmployees(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch', error);
        } finally {
            setIsLoading(false);
        }
    }

    function handleEdit(emp: any) {
        setEditId(emp.id);
        setFormData({
            name: emp.name,
            role: emp.role,
            password: emp.password || '', // Include password
            baseSalary: emp.baseSalary.toString(),
            branch: emp.branch || 'Дзержинского 26'
        });
        setShowForm(true);
    }

    function handleAddNew(e: React.MouseEvent) {
        e.stopPropagation();
        setEditId(null);
        setFormData(initialForm);
        setShowForm(true);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        const payload = {
            ...formData,
            hourlyRate: '0'
        };

        if (editId) {
            await fetch('/api/employees', {
                method: 'PUT',
                body: JSON.stringify({ id: editId, ...payload }),
            });
        } else {
            await fetch('/api/employees', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
        }

        setShowForm(false);
        setEditId(null);
        setFormData(initialForm);
        fetchEmployees();
        router.refresh();
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">Сотрудники</h1>
                    <p className="text-zinc-500 mt-1">Управление персоналом и филиалами.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                >
                    <Plus className="w-4 h-4" /> Добавить сотрудника
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-2xl border border-zinc-200 w-full max-w-lg animate-in zoom-in-95">
                        <h2 className="text-xl font-bold mb-4">{editId ? 'Редактировать сотрудника' : 'Новый сотрудник'}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">ФИО</label>
                                <input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="Иванов Иван"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className={formData.role === 'MANAGER' ? 'col-span-2' : ''}>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Должность</label>
                                    <select
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="ADMIN">Администратор</option>
                                        <option value="SENIOR">Старший смены</option>
                                        <option value="MANAGER">Руководитель</option>
                                    </select>
                                </div>
                                {formData.role !== 'MANAGER' && (
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Филиал</label>
                                        <select
                                            value={formData.branch}
                                            onChange={e => setFormData({ ...formData, branch: e.target.value })}
                                            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="Дзержинского 26">Дзержинского 26</option>
                                            <option value="Дзержинского 45">Дзержинского 45</option>
                                            <option value="Юбилейный (Менякина 1)">Юбилейный (Менякина 1)</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className={formData.role === 'MANAGER' ? 'col-span-2' : ''}>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Пароль для входа</label>
                                    <input
                                        type="text"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="1234"
                                    />
                                </div>
                                {formData.role !== 'MANAGER' && (
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Оклад (мес)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-zinc-500 font-bold">₽</span>
                                            <input
                                                type="number"
                                                value={formData.baseSalary}
                                                onChange={e => setFormData({ ...formData, baseSalary: e.target.value })}
                                                className="w-full pl-9 pr-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowForm(false); setEditId(null); }}
                                    className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg text-zinc-700 hover:bg-zinc-50 transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Сохранить
                                </button>
                            </div>
                            {editId && (
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (confirm('Вы уверены, что хотите удалить этого сотрудника? Все связанные с ним данные (смены, KPI) также будут удалены.')) {
                                            const res = await fetch(`/api/employees?id=${editId}`, { method: 'DELETE' });
                                            if (res.ok) {
                                                setShowForm(false);
                                                setEditId(null);
                                                fetchEmployees();
                                                router.refresh();
                                            }
                                        }
                                    }}
                                    className="w-full mt-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> Удалить сотрудника
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-zinc-500">Сотрудник</th>
                            <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-zinc-500">Должность</th>
                            <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-zinc-500">Филиал</th>
                            <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-zinc-500 text-right">Оклад</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {employees.map(emp => (
                            <tr
                                key={emp.id}
                                className="hover:bg-zinc-50 transition-colors group cursor-pointer"
                                onClick={() => handleEdit(emp)}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${emp.role === 'MANAGER'
                                            ? 'bg-purple-100 text-purple-600'
                                            : emp.role === 'SENIOR'
                                                ? 'bg-amber-100 text-amber-600'
                                                : 'bg-zinc-100 text-zinc-500'
                                            }`}>
                                            {emp.role === 'MANAGER' ? (
                                                <Crown className="w-5 h-5" />
                                            ) : emp.role === 'SENIOR' ? (
                                                <BadgeCheck className="w-5 h-5" />
                                            ) : (
                                                <User className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div>
                                            <span className="font-medium text-zinc-900 block">{emp.name}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-zinc-600 text-sm">
                                    <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-xs font-medium ${emp.role === 'MANAGER'
                                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                        : emp.role === 'SENIOR'
                                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                                        }`}>
                                        {emp.role === 'MANAGER' ? 'Руководитель' : emp.role === 'SENIOR' ? 'Старший смены' : 'Администратор'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-zinc-600 text-sm">
                                    {emp.role === 'MANAGER' ? (
                                        <span className="text-zinc-400">-</span>
                                    ) : emp.branch ? (
                                        <div className="flex items-center text-zinc-600">
                                            <MapPin className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
                                            {emp.branch}
                                        </div>
                                    ) : null}
                                </td>
                                <td className="px-6 py-4 text-zinc-900 text-sm font-medium text-right">
                                    {emp.role === 'MANAGER' ? '-' : `${emp.baseSalary.toLocaleString()} ₽`}
                                </td>
                            </tr>
                        ))}
                        {employees.length === 0 && !isLoading && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">Нет сотрудников.</td>
                            </tr>
                        )}
                        {isLoading && (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-zinc-500">Загрузка...</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

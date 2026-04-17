
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
    hireDate?: string;
    dismissalDate?: string;
    seniorId?: string | null;
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [originalRole, setOriginalRole] = useState<string | null>(null);
    const [originalSalary, setOriginalSalary] = useState<number | null>(null);

    const initialForm = {
        name: '',
        role: 'ADMIN',
        password: '',
        baseSalary: '',
        branch: 'Дзержинского 26',
        hireDate: '',
        dismissalDate: '',
        subordinateIds: [] as string[],
        effectiveDate: new Date().toISOString().split('T')[0]
    };

    const [formData, setFormData] = useState(initialForm);
    const router = useRouter();

    useEffect(() => {
        fetchEmployees();
    }, []);

    async function fetchEmployees() {
        try {
            const res = await fetch('/api/employees');
            if (res.status === 401 || res.status === 403) {
                window.location.href = '/login';
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
        const subIds = employees.filter(e => e.seniorId === emp.id).map(e => e.id);
        setFormData({
            name: emp.name,
            role: emp.role,
            password: emp.password || '',
            baseSalary: emp.baseSalary.toString(),
            branch: emp.branch || 'Дзержинского 26',
            hireDate: emp.hireDate || '',
            dismissalDate: emp.dismissalDate || '',
            subordinateIds: subIds,
            effectiveDate: new Date().toISOString().split('T')[0]
        });
        setOriginalRole(emp.role);
        setOriginalSalary(emp.baseSalary);
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="w-full">
                    <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Сотрудники</h1>
                    <p className="text-sm sm:text-base text-zinc-500 mt-1">Управление персоналом и филиалами.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                >
                    <Plus className="w-4 h-4" /> Добавить сотрудника
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in overflow-y-auto">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-2xl border border-zinc-200 w-full max-w-lg my-8 animate-in zoom-in-95">
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

                            {editId && (formData.role !== originalRole || parseFloat(formData.baseSalary || '0') !== originalSalary) && (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 animate-in slide-in-from-top-2">
                                    <label className="block text-sm font-bold text-blue-900 mb-1">Дата вступления изменений в силу</label>
                                    <p className="text-xs text-blue-600 mb-2">
                                        {formData.role !== originalRole && "Изменение роли будет сохранено в истории. "}
                                        {parseFloat(formData.baseSalary || '0') !== originalSalary && "Изменение оклада применится ко ВСЕМУ выбранному месяцу и всем последующим."}
                                    </p>
                                    <input
                                        type="date"
                                        value={formData.effectiveDate}
                                        onChange={e => setFormData({ ...formData, effectiveDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                                        required
                                    />
                                </div>
                            )}

                            {formData.role === 'SENIOR' && (
                                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-bold text-amber-900">Администраторы в смене</label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (formData.subordinateIds.length < 4) {
                                                    setFormData({
                                                        ...formData,
                                                        subordinateIds: [...formData.subordinateIds, '']
                                                    });
                                                }
                                            }}
                                            disabled={formData.subordinateIds.length >= 4}
                                            className="p-1 hover:bg-amber-100 rounded text-amber-700 disabled:opacity-30"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {formData.subordinateIds.map((subId, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <select
                                                    value={subId}
                                                    onChange={(e) => {
                                                        const newIds = [...formData.subordinateIds];
                                                        newIds[idx] = e.target.value;
                                                        setFormData({ ...formData, subordinateIds: newIds });
                                                    }}
                                                    className="flex-1 px-3 py-1.5 border border-amber-300 rounded bg-white text-sm"
                                                >
                                                    <option value="">Выберите администратора</option>
                                                    {employees
                                                        .filter(e => e.role === 'ADMIN' && (e.seniorId === null || e.seniorId === editId || !e.seniorId))
                                                        .filter(e => {
                                                            const today = new Date().toISOString().split('T')[0];
                                                            return !e.dismissalDate || e.dismissalDate > today;
                                                        })
                                                        .map(e => (
                                                            <option key={e.id} value={e.id}>{e.name}</option>
                                                        ))
                                                    }
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newIds = formData.subordinateIds.filter((_, i) => i !== idx);
                                                        setFormData({ ...formData, subordinateIds: newIds });
                                                    }}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {formData.subordinateIds.length === 0 && (
                                            <p className="text-xs text-amber-600 italic text-center">Нажмите +, чтобы добавить администраторов (макс. 4)</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {formData.role === 'ADMIN' && editId && (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <label className="block text-sm font-bold text-blue-900 mb-1">Старший смены</label>
                                    {(() => {
                                        const currentEmp = employees.find(e => e.id === editId);
                                        const senior = currentEmp?.seniorId ? employees.find(e => e.id === currentEmp.seniorId) : null;
                                        return senior ? (
                                            <p className="text-sm text-blue-800 flex items-center gap-2">
                                                <BadgeCheck className="w-4 h-4 text-amber-600" />
                                                {senior.name}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-blue-600 italic">Не назначен</p>
                                        );
                                    })()}
                                </div>
                            )}

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

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Дата приёма</label>
                                    <input
                                        type="date"
                                        value={formData.hireDate}
                                        onChange={e => setFormData({ ...formData, hireDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Дата увольнения</label>
                                    <input
                                        type="date"
                                        value={formData.dismissalDate}
                                        onChange={e => setFormData({ ...formData, dismissalDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>

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
                    </form>
                </div>
            )}

            {(() => {
                const todayStr = new Date().toISOString().split('T')[0];
                const activeEmployees = employees.filter(emp => !emp.dismissalDate || emp.dismissalDate > todayStr);
                const dismissedEmployees = employees.filter(emp => emp.dismissalDate && emp.dismissalDate <= todayStr);

                    <div className="mb-12">
                        <h2 className="text-xl font-bold text-zinc-800 mb-4 px-2 tracking-tight">{title}</h2>
                        <div className="bg-white sm:rounded-xl shadow-sm border-y sm:border border-zinc-200 overflow-x-auto -mx-3 sm:mx-0 scrollbar-custom">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-zinc-50 border-b border-zinc-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-zinc-500">Сотрудник</th>
                                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-zinc-500">Должность</th>
                                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-zinc-500">Филиал</th>
                                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-zinc-500">Дата приёма</th>
                                        {title === "Уволенные сотрудники" && (
                                            <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-zinc-500">Дата увольнения</th>
                                        )}
                                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-zinc-500 text-right">Оклад</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {list.map(emp => (
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
                                            <td className="px-6 py-4 text-zinc-600 text-sm">
                                                {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString('ru-RU') : <span className="text-zinc-400">—</span>}
                                            </td>
                                            {title === "Уволенные сотрудники" && (
                                                <td className="px-6 py-4 text-zinc-600 text-sm">
                                                    {emp.dismissalDate ? new Date(emp.dismissalDate).toLocaleDateString('ru-RU') : '—'}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 text-zinc-900 text-sm font-medium text-right">
                                                {emp.role === 'MANAGER' ? '-' : `${(emp.baseSalary ?? 0).toLocaleString()} ₽`}
                                            </td>
                                        </tr>
                                    ))}
                                    {list.length === 0 && !isLoading && (
                                        <tr>
                                            <td colSpan={title === "Уволенные сотрудники" ? 6 : 5} className="px-6 py-12 text-center text-zinc-500">Нет сотрудников в этом списке.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

                if (isLoading) return <div className="text-center py-12 text-zinc-500 font-medium">Загрузка данных...</div>;

                return (
                    <>
                        {renderTable(activeEmployees, "Действующие сотрудники")}
                        {dismissedEmployees.length > 0 && renderTable(dismissedEmployees, "Уволенные сотрудники")}
                    </>
                );
            })()}
        </div>
    );
}

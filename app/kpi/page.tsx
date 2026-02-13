
'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, isSameDay, subMonths, addMonths, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CheckCircle, X, Pencil, ClipboardCheck } from 'lucide-react';
import { InfoTooltip } from '@/components/InfoTooltip';

interface Employee {
    id: string;
    name: string;
    baseSalary: number;
    hourlyRate: number;
    role: string;
    branch?: string;
}

interface Shift {
    id: string;
    date: string;
    hours: number;
    type: string;
    cabinetClosed: boolean;
    centerClosed: boolean;
    employeeId: string;
    coefficient: number;
    isDeleted?: boolean;
    auditLogs?: any[];
}

interface KpiRecord {
    id: string;
    date: string;
    qualityScore: number;
    errorsCount: number;
    salesBonus: number;
    checkList: number;
    employeeId: string;
    auditLogs?: any[];
}

interface PromotionSale {
    id: string;
    date: string;
    employeeId: string;
    bonus: number;
    auditLogs?: any[];
}

interface RegistrationKpi {
    id: string;
    date: string;
    employeeId: string;
    count: number;
    totalScore: number;
    maxScore: number;
    auditLogs?: any[];
}

export default function KpiPage() {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [kpiRecords, setKpiRecords] = useState<KpiRecord[]>([]);
    const [promotionSales, setPromotionSales] = useState<PromotionSale[]>([]);
    const [registrationKpis, setRegistrationKpis] = useState<RegistrationKpi[]>([]);
    const [monthlyChecklists, setMonthlyChecklists] = useState<any[]>([]);
    const [monthNorm, setMonthNorm] = useState<number>(176);

    // Entry Form State
    const [showModal, setShowModal] = useState(false);
    const [selectedKpiDate, setSelectedKpiDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [editingKpiId, setEditingKpiId] = useState<string | null>(null);

    // Inline Editing State for Checklist
    const [editingChecklistEmpId, setEditingChecklistEmpId] = useState<string | null>(null);
    const [tempChecklistValue, setTempChecklistValue] = useState<string>('');

    const initialForm = {
        qualityScore: '100',
        errorsCount: '0',
        salesBonus: '0',
        checkList: '0',
    };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        fetchCurrentUser();
        fetchEmployees();
    }, []);

    useEffect(() => {
        fetchData();
        fetchNorm();
    }, [currentMonth]);

    async function fetchCurrentUser() {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setCurrentUser(data);
            }
        } catch (e) {
            console.error('FETCH_ME_ERROR:', e);
        } finally {
            setIsUserLoading(false);
        }
    }

    async function fetchEmployees() {
        const res = await fetch('/api/employees');
        const data = await res.json();
        setEmployees(Array.isArray(data) ? data : []);
    }

    async function fetchData() {
        try {
            const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
            const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

            const [shiftsRes, kpiRes, salesRes, regRes, checklistRes] = await Promise.all([
                fetch(`/api/shifts?start=${start}&end=${end}`),
                fetch(`/api/kpi?start=${start}&end=${end}`),
                fetch(`/api/sales?start=${start}&end=${end}`),
                fetch(`/api/registration?start=${start}&end=${end}`),
                fetch(`/api/checklist?month=${currentMonth.toISOString().substring(0, 7)}`)
            ]);

            const shiftsData = await shiftsRes.json();
            const kpiData = await kpiRes.json();
            const salesData = await salesRes.json();
            const regData = await regRes.json();
            const checklistData = await checklistRes.json();

            setShifts(Array.isArray(shiftsData) ? shiftsData : []);
            setKpiRecords(Array.isArray(kpiData) ? kpiData : []);
            setPromotionSales(Array.isArray(salesData) ? salesData : []);
            setRegistrationKpis(Array.isArray(regData) ? regData : []);
            setMonthlyChecklists(Array.isArray(checklistData) ? checklistData : []);
        } catch (e) {
            console.error('KPI_FETCH_DATA_ERROR:', e);
        }
    }

    async function fetchNorm() {
        try {
            const m = format(currentMonth, 'yyyy-MM');
            const res = await fetch(`/api/norms?month=${m}`);
            const data = await res.json();
            setMonthNorm(data?.hours || 176);
        } catch (e) { console.error('KPI_FETCH_NORM_ERROR:', e); }
    }

    function handleRowClick(empId: string) {
        // Only managers or the employee themselves can edit (but user said everyone can edit for now)
        // However, it makes sense to only allow if authorized.
        setSelectedEmployeeId(empId);
        setSelectedKpiDate(new Date().toISOString().split('T')[0]);
        setFormData(initialForm);
        setShowModal(true);
    }



    async function handleSaveChecklist(empId: string, value: string) {
        try {
            const newValue = parseFloat(value);
            const month = currentMonth.toISOString().substring(0, 7); // Format: "2026-02"

            await fetch('/api/checklist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    month,
                    employeeId: empId,
                    percentage: newValue,
                    updatedBy: currentUser?.name || null
                }),
            });

            fetchData();
            setEditingChecklistEmpId(null);
        } catch (e) {
            console.error('Failed to save checklist:', e);
        }
    }

    const payrollData = useMemo(() => {
        if (isUserLoading) return [];

        let list = employees.filter(e => e.role !== 'MANAGER');
        // Filter by current user if not manager
        if (currentUser && currentUser.role !== 'MANAGER') {
            list = list.filter(e => e.id === currentUser.id);
        }

        return list.map(emp => {
            // Merge self-salary data if current user to fix NaN issues
            const enrichedEmp = (currentUser && emp.id === currentUser.id)
                ? { ...emp, baseSalary: currentUser.baseSalary }
                : emp;

            const empShifts = shifts.filter(s => s.employeeId === enrichedEmp.id && !s.isDeleted);
            const empKpis = kpiRecords.filter(k => k.employeeId === enrichedEmp.id);
            const empSales = promotionSales.filter(s => s.employeeId === enrichedEmp.id);
            const empRegs = registrationKpis.filter(r => r.employeeId === enrichedEmp.id);

            let rawHours = 0;
            let basePay = 0;
            let dayOffHours = 0;
            let dayOffPayTotal = 0;
            let closingBonuses = 0;
            empShifts.forEach(s => {
                const coeff = s.coefficient || 1.0;
                const hourlyBase = enrichedEmp.baseSalary / monthNorm;
                const shiftPay = hourlyBase * s.hours * coeff;

                if (s.type === 'DAY_OFF_WORK') {
                    dayOffHours += s.hours;
                    const dayOffRate = 3500 / 11;
                    dayOffPayTotal += dayOffRate * s.hours;
                } else if (s.type === 'REGULAR') {
                    rawHours += s.hours;
                    basePay += shiftPay;
                }

                if (s.cabinetClosed) closingBonuses += 250;
                if (s.centerClosed) closingBonuses += 500;
            });

            // Combine legacy sales bonus with new promotional sales
            const salesBonus = Math.round(empKpis.reduce((sum, k) => sum + k.salesBonus, 0) +
                empSales.reduce((sum, s) => sum + s.bonus, 0));

            // Combine registration quality audits
            // Combine registration quality audits
            const regCount = empRegs.length;
            let regQuality = 100;
            if (regCount > 0) {
                const totalObtained = empRegs.reduce((sum, r) => sum + r.totalScore, 0);
                const totalMax = empRegs.reduce((sum, r) => sum + (r.maxScore || (r.count * 3) || 1), 0);
                regQuality = totalMax > 0 ? (totalObtained / totalMax) * 100 : 100;
            }

            // Legacy quality score for backward compatibility if needed, but prioritize new audit
            const legacyQuality = empKpis.length > 0
                ? empKpis.reduce((sum, k) => sum + k.qualityScore, 0) / empKpis.length
                : 100;

            const avgQuality = regCount > 0 ? regQuality : legacyQuality;

            // Get checklist from monthly checklist table (single value per month)
            const monthStr = currentMonth.toISOString().substring(0, 7);
            const empChecklist = monthlyChecklists.find(c => c.employeeId === enrichedEmp.id && c.month === monthStr);
            const calcChecklist = empChecklist ? empChecklist.percentage : 0;

            let qualityBonus = 0;
            if (avgQuality >= 95) qualityBonus = 5000;
            else if (avgQuality >= 85) qualityBonus = 2500;

            let checklistBonus = 0;
            if (calcChecklist >= 90) checklistBonus = 5000;
            else if (calcChecklist >= 76) checklistBonus = 2500;

            const totalPay = basePay + dayOffPayTotal + closingBonuses + salesBonus + qualityBonus + checklistBonus;

            // Aggregate all audit logs
            const allLogs = [
                ...(empShifts.flatMap(s => s.auditLogs || [])),
                ...(empKpis.flatMap(k => k.auditLogs || [])),
                ...(empSales.flatMap(s => s.auditLogs || [])),
                ...(empRegs.flatMap(r => r.auditLogs || []))
            ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            // Remove duplicates (by timestamp/changedBy/action)
            const uniqueLogs = allLogs.filter((log, index, self) =>
                index === self.findIndex((t) => (
                    t.timestamp === log.timestamp && t.changedBy === log.changedBy && t.action === log.action
                ))
            );

            return {
                empId: emp.id,
                name: emp.name,
                rawHours,
                basePay,
                dayOffHours,
                dayOffPay: dayOffPayTotal,
                closingBonuses,
                salesBonus,
                avgQuality,
                qualityBonus,
                calcChecklist,
                checklistBonus,
                totalPay,
                auditLogs: uniqueLogs
            };
        });
    }, [employees, shifts, kpiRecords, promotionSales, registrationKpis, monthlyChecklists, monthNorm, currentUser, isUserLoading, currentMonth]);

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">KPI и Зарплата</h1>
                <div className="flex items-center gap-4 bg-white p-1 rounded-full border border-zinc-200 shadow-sm">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
                    <span className="text-lg font-medium w-40 text-center capitalize">{format(currentMonth, 'LLLL yyyy', { locale: ru })}</span>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-100 rounded-full"><ChevronRight className="w-5 h-5" /></button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                            <th className="px-4 py-3 font-medium text-zinc-500">Сотрудник</th>
                            <th className="px-4 py-3 font-medium text-zinc-500 text-right">Часы</th>
                            <th className="px-4 py-3 font-medium text-zinc-500 text-right">Оклад</th>
                            <th className="px-4 py-3 font-medium text-zinc-500 text-right">Работа в выходные</th>
                            <th className="px-4 py-3 font-medium text-zinc-500 text-right">Открытие/Закрытие</th>
                            <th className="px-4 py-3 font-medium text-zinc-500 text-right">Продажи</th>
                            <th className="px-4 py-3 font-medium text-zinc-500 text-right">Чеклист</th>
                            <th className="px-4 py-3 font-medium text-zinc-500 text-right">Качество</th>
                            <th className="px-4 py-3 font-medium text-zinc-500 text-right">Итого</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {isUserLoading ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-12 text-center text-zinc-500">Загрузка данных...</td>
                            </tr>
                        ) : payrollData.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-12 text-center text-zinc-500">Нет данных для отображения.</td>
                            </tr>
                        ) : (
                            payrollData.map(calc => {
                                if (calc.rawHours === 0 && calc.dayOffHours === 0 && calc.totalPay === 0) return null;

                                return (
                                    <tr
                                        key={calc.empId}
                                        className="hover:bg-zinc-50"
                                    >
                                        <td className="px-4 py-3 font-medium text-zinc-900">
                                            <div className="flex items-center gap-2">
                                                {calc.name}
                                                {calc.auditLogs && calc.auditLogs.length > 0 && <InfoTooltip logs={calc.auditLogs} />}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right text-zinc-600 font-semibold">{calc.rawHours.toFixed(1)}</td>
                                        <td className="px-4 py-3 text-right text-zinc-600">{calc.basePay.toFixed(0)}</td>
                                        <td className="px-4 py-3 text-right text-zinc-600">
                                            {calc.dayOffPay > 0 && (
                                                <div>
                                                    <div>{calc.dayOffPay.toFixed(0)}</div>
                                                    <div className="text-[10px] text-zinc-400">({calc.dayOffHours}ч)</div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right text-zinc-600 font-medium text-emerald-600">{calc.closingBonuses > 0 ? calc.closingBonuses : '-'}</td>
                                        <td className="px-4 py-3 text-right text-zinc-600">{calc.salesBonus > 0 ? calc.salesBonus : '-'}</td>
                                        <td className="px-4 py-3 text-right text-zinc-600">
                                            {editingChecklistEmpId === calc.empId ? (
                                                <div className="flex items-center justify-end gap-1">
                                                    <input
                                                        autoFocus
                                                        type="number"
                                                        className="w-16 px-1 py-0.5 border rounded text-right text-sm"
                                                        value={tempChecklistValue}
                                                        onChange={(e) => setTempChecklistValue(e.target.value)}
                                                        onBlur={() => handleSaveChecklist(calc.empId, tempChecklistValue)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleSaveChecklist(calc.empId, tempChecklistValue);
                                                            if (e.key === 'Escape') setEditingChecklistEmpId(null);
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    {calc.checklistBonus > 0 && <span className="text-green-600 font-medium">+{calc.checklistBonus}</span>}
                                                    <div
                                                        className="text-[10px] text-zinc-400 cursor-pointer hover:text-blue-600 transition-colors"
                                                        onClick={() => {
                                                            setEditingChecklistEmpId(calc.empId);
                                                            setTempChecklistValue(calc.calcChecklist.toFixed(0));
                                                        }}
                                                    >
                                                        {calc.calcChecklist.toFixed(0)}%
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right text-zinc-600">
                                            {calc.qualityBonus > 0 && <span className="text-green-600 font-medium">+{calc.qualityBonus}</span>}
                                            <div className="text-[10px] text-zinc-400">{calc.avgQuality.toFixed(1)}%</div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-zinc-900 bg-zinc-50/50">
                                            {calc.totalPay.toFixed(0)} ₽
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                Ввод KPI
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                                <X className="w-5 h-5 text-zinc-500" />
                            </button>
                        </div>

                        <p className="text-sm text-zinc-500 mb-4">
                            Сотрудник: <span className="font-medium text-zinc-900">{employees.find(e => e.id === selectedEmployeeId)?.name}</span>
                        </p>

                        <form className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Дата</label>
                                <input
                                    type="date"
                                    value={selectedKpiDate}
                                    onChange={e => setSelectedKpiDate(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Качество (%)</label>
                                    <input
                                        type="number"
                                        value={formData.qualityScore}
                                        onChange={e => setFormData({ ...formData, qualityScore: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        max="100" min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ошибки</label>
                                    <input
                                        type="number"
                                        value={formData.errorsCount}
                                        onChange={e => setFormData({ ...formData, errorsCount: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Бонус за продажи (₽)</label>
                                <input
                                    type="number"
                                    value={formData.salesBonus}
                                    onChange={e => setFormData({ ...formData, salesBonus: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>

                            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                                <label className="block text-sm font-medium mb-1">Чек-лист (%)</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={formData.checkList}
                                        onChange={e => setFormData({ ...formData, checkList: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        max="100" min="0"
                                    />
                                    <div className="text-xs font-bold whitespace-nowrap">
                                        {parseFloat(formData.checkList) >= 90 ? <span className="text-green-600">+5000р</span> :
                                            parseFloat(formData.checkList) >= 76 ? <span className="text-blue-600">+2500р</span> :
                                                <span className="text-zinc-400">0р</span>}
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
                                Сохранить
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

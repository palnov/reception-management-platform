
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSharedMonth } from '@/lib/useSharedMonth';
import { format, startOfMonth, endOfMonth, isSameDay, subMonths, addMonths, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CheckCircle, X, Pencil, ClipboardCheck, Crown, BadgeCheck, User } from 'lucide-react';
import { InfoTooltip } from '@/components/InfoTooltip';
import { Tooltip } from '@/components/Tooltip';
import { useMonthStatus } from '@/lib/useMonthStatus';
import { MonthStatusBadge } from '@/components/MonthStatusBadge';
import { MonthClosureControls } from '@/components/MonthClosureControls';

interface Employee {
    id: string;
    name: string;
    baseSalary: number;
    hourlyRate: number;
    role: string;
    branch?: string;
    hireDate?: string;
    dismissalDate?: string;
    seniorId?: string | null;
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
    isActingLead: boolean;
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
    const [currentMonth, setCurrentMonth] = useSharedMonth();
    const { isClosed, refresh: refreshMonthStatus } = useMonthStatus(currentMonth);
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
    const [editingCell, setEditingCell] = useState<{ empId: string, field: string } | null>(null);
    const [tempValue, setTempValue] = useState<string>('');

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
        const controller = new AbortController();
        fetchEmployees(controller.signal);
        fetchData(controller.signal);
        fetchNorm(controller.signal);
        return () => controller.abort();
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

    async function fetchEmployees(signal?: AbortSignal) {
        try {
            const monthStr = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
            const res = await fetch(`/api/employees?activeInDate=${monthStr}`, { signal });
            if (res.status === 401) {
                window.location.href = '/login';
                return;
            }
            if (res.ok) {
                const data = await res.json();
                const list = Array.isArray(data) ? data : [];
                setEmployees(list.filter(e => e.role !== 'MANAGER'));
            }
        } catch (e: any) {
            if (e.name !== 'AbortError') console.error('FETCH_EMPLOYEES_ERROR:', e);
        }
    }

    async function fetchData(signal?: AbortSignal) {
        try {
            const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
            const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

            const [shiftsRes, kpiRes, salesRes, regRes, checklistRes] = await Promise.all([
                fetch(`/api/shifts?start=${start}&end=${end}&includeDetails=true`, { signal }),
                fetch(`/api/kpi?start=${start}&end=${end}&includeDetails=true`, { signal }),
                fetch(`/api/sales?start=${start}&end=${end}&includeDetails=true`, { signal }),
                fetch(`/api/registration?start=${start}&end=${end}&includeDetails=true`, { signal }),
                fetch(`/api/checklist?month=${currentMonth.toISOString().substring(0, 7)}`, { signal })
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
        } catch (e: any) {
            if (e.name !== 'AbortError') console.error('KPI_FETCH_DATA_ERROR:', e);
        }
    }

    async function fetchNorm(signal?: AbortSignal) {
        try {
            const m = format(currentMonth, 'yyyy-MM');
            const res = await fetch(`/api/norms?month=${m}`, { signal });
            if (res.ok) {
                const data = await res.json();
                setMonthNorm(data?.hours || 176);
            }
        } catch (e: any) {
            if (e.name !== 'AbortError') console.error('KPI_FETCH_NORM_ERROR:', e);
        }
    }

    function handleRowClick(empId: string) {
        if (isClosed) return;
        // Only managers or the employee themselves can edit (but user said everyone can edit for now)
        // However, it makes sense to only allow if authorized.
        setSelectedEmployeeId(empId);
        setSelectedKpiDate(new Date().toISOString().split('T')[0]);
        setFormData(initialForm);
        setShowModal(true);
    }



    async function handleSaveChecklist(empId: string, field: string, value: string) {
        if (isClosed) {
            setEditingCell(null);
            return;
        }
        try {
            const newValue = parseFloat(value);
            const month = currentMonth.toISOString().substring(0, 7); // Format: "2026-02"

            await fetch('/api/checklist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    month,
                    employeeId: empId,
                    [field]: newValue,
                    updatedBy: currentUser?.name || null
                }),
            });

            fetchData();
            setEditingCell(null);
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

            const dismissalDate = enrichedEmp.dismissalDate;

            let rawHours = 0;
            let basePay = 0;
            let coeffBonus = 0;
            let dayOffHours = 0;
            let dayOffPayTotal = 0;
            let closingBonuses = 0;
            let actingLeadBonus = 0;
            empShifts.forEach(s => {
                // Safety check: skip shifts on or after dismissal date
                if (dismissalDate && s.date >= dismissalDate) return;

                const coeff = s.coefficient || 1.0;
                const hourlyBase = enrichedEmp.baseSalary / monthNorm;
                const shiftPay = hourlyBase * s.hours * coeff;

                if (s.type === 'ARCHIVE_WORK') {
                    dayOffHours += s.hours;
                    const dayOffRate = 3500 / 11;
                    dayOffPayTotal += dayOffRate * s.hours;
                } else if (s.type === 'REGULAR') {
                    rawHours += s.hours;
                    basePay += hourlyBase * s.hours;
                    coeffBonus += hourlyBase * s.hours * (coeff - 1.0);
                }

                if (s.cabinetClosed) closingBonuses += 250;
                if (s.centerClosed) closingBonuses += 500;
                if (s.isActingLead) actingLeadBonus += 250;
            });

            // Combine legacy sales bonus with new promotional sales
            const salesBonus = Math.round(empKpis.reduce((sum, k) => sum + k.salesBonus, 0) +
                empSales.reduce((sum, s) => sum + s.bonus, 0));

            // Seniority (Выслуга)
            const hireDateParsed = enrichedEmp.hireDate ? new Date(enrichedEmp.hireDate) : null;
            const dismissalDateParsed = enrichedEmp.dismissalDate ? new Date(enrichedEmp.dismissalDate) : null;
            const isHireDateValid = hireDateParsed && !isNaN(hireDateParsed.getTime());

            // For seniority, we calculate time from hire to either NOW or DISMISSAL
            const endDate = (dismissalDateParsed && !isNaN(dismissalDateParsed.getTime()))
                ? dismissalDateParsed.getTime()
                : Date.now();

            const seniorityYears = isHireDateValid
                ? (endDate - hireDateParsed!.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
                : 0;

            let seniorityBonus = 0;
            const baseSalary = enrichedEmp.baseSalary || 0;
            if (seniorityYears >= 3) seniorityBonus = Math.round(baseSalary * 0.10);
            else if (seniorityYears >= 2) seniorityBonus = Math.round(baseSalary * 0.07);
            else if (seniorityYears >= 1) seniorityBonus = Math.round(baseSalary * 0.03);

            // Get checklist from monthly checklist table (single value per month)
            const monthStr = currentMonth.toISOString().substring(0, 7);
            const empChecklist = monthlyChecklists.find(c => c.employeeId === enrichedEmp.id && c.month === monthStr);
            const ownChecklist = empChecklist ? empChecklist.percentage : 0;
            const sickLeaveOpening = empChecklist ? (empChecklist.sickLeaveOpening || 0) : 0;
            const sickLeaveClosing = empChecklist ? (empChecklist.sickLeaveClosing || 0) : 0;
            const cardCreation = empChecklist ? (empChecklist.cardCreation || 0) : 0;
            const manualClosingBonus = empChecklist ? (empChecklist.closingBonus || 0) : 0;

            const sickLeaveBonus = (sickLeaveOpening * 130) + (sickLeaveClosing * 80);
            const cardBonus = cardCreation * 60;

            // Use checklist from monthly checklist table
            let calcChecklist = ownChecklist;
            let checklistBreakdown = "";

            let checklistBonus = 0;
            if (calcChecklist >= 90) checklistBonus = 5000;
            else if (calcChecklist >= 76) checklistBonus = 2500;

            // New quality calculation logic
            const getIndividualQuality = (eId: string) => {
                const empKpis = kpiRecords.filter(k => k.employeeId === eId);
                const empRegs = registrationKpis.filter(r => r.employeeId === eId);
                const regCount = empRegs.length;

                if (regCount > 0) {
                    const totalObtained = empRegs.reduce((sum, r) => sum + r.totalScore, 0);
                    const totalMax = empRegs.reduce((sum, r) => sum + (r.maxScore || (r.count * 3) || 1), 0);
                    return totalMax > 0 ? (totalObtained / totalMax) * 100 : 100;
                }
                const legacyQuality = empKpis.length > 0
                    ? empKpis.reduce((sum, k) => sum + k.qualityScore, 0) / empKpis.length
                    : 100;
                return legacyQuality;
            };

            const ownQuality = getIndividualQuality(enrichedEmp.id);
            let finalQuality = ownQuality;
            let qualityBreakdown = "";

            let qualityBonus = 0;
            if (finalQuality >= 95) qualityBonus = 5000;
            else if (finalQuality >= 85) qualityBonus = 2500;

            const actualClosingBonuses = closingBonuses;
            const totalPay = basePay + coeffBonus + dayOffPayTotal + actualClosingBonuses + salesBonus + qualityBonus + checklistBonus + seniorityBonus + sickLeaveBonus + cardBonus + (currentMonth < new Date('2026-04-01') ? actingLeadBonus : 0);

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
                role: enrichedEmp.role,
                rawHours,
                basePay,
                coeffBonus,
                dayOffHours,
                dayOffPay: dayOffPayTotal,
                closingBonuses: actualClosingBonuses,
                actingLeadBonus,
                salesBonus,
                sickLeaveOpening,
                sickLeaveClosing,
                sickLeaveBonus,
                cardCreation,
                cardBonus,
                calcChecklist,
                ownChecklist,
                checklistBreakdown,
                checklistBonus,
                avgQuality: finalQuality,
                qualityBreakdown,
                qualityBonus,
                seniorityYears,
                seniorityBonus,
                totalPay,
                auditLogs: uniqueLogs
            };
        });
    }, [employees, shifts, kpiRecords, promotionSales, registrationKpis, monthlyChecklists, monthNorm, currentUser, isUserLoading, currentMonth]);

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">KPI и Зарплата</h1>
                <div className="flex items-center gap-4">
                    <MonthStatusBadge isClosed={isClosed} />
                    {currentUser?.role === 'MANAGER' && (
                        <MonthClosureControls 
                            currentMonth={currentMonth} 
                            isClosed={isClosed} 
                            onStatusChange={refreshMonthStatus}
                        />
                    )}
                    <div className="flex items-center gap-4 bg-white p-1 rounded-full border border-zinc-200 shadow-sm">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
                        <span className="text-lg font-medium w-40 text-center capitalize">{format(currentMonth, 'LLLL yyyy', { locale: ru })}</span>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-100 rounded-full"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-auto max-h-[calc(100vh-200px)] scrollbar-custom">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50">
                        <tr>
                            <th className="sticky top-0 left-0 z-30 bg-zinc-50 px-4 py-3 font-medium text-zinc-500 whitespace-nowrap min-w-[200px]" style={{ boxShadow: 'inset 0 -1px 0 #e4e4e7, inset -1px 0 0 #e4e4e7, 2px 0 10px -2px rgba(0,0,0,0.1)' }}>Сотрудник</th>
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-medium text-zinc-500 text-right whitespace-nowrap min-w-[70px]" style={{ boxShadow: 'inset 0 -1px 0 #e4e4e7' }}>Часы</th>
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-medium text-zinc-500 text-right whitespace-nowrap min-w-[80px]" style={{ boxShadow: 'inset 0 -1px 0 #e4e4e7' }}>Оклад</th>
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-medium text-zinc-500 text-right whitespace-nowrap min-w-[80px]" style={{ boxShadow: 'inset 0 -1px 0 #e4e4e7' }}>Коэф.</th>
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-medium text-zinc-500 text-right whitespace-nowrap min-w-[130px]" style={{ boxShadow: 'inset 0 -1px 0 #e4e4e7' }}>Работа в арх.</th>
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-medium text-zinc-500 text-right whitespace-nowrap min-w-[110px]" style={{ boxShadow: 'inset 0 -1px 0 #e4e4e7' }}>
                                <Tooltip content="Доплата за открытие, закрытие центра и за закрытие кабинетов">Откр/Закр.</Tooltip>
                            </th>
                            {currentMonth < new Date('2026-04-01') && (
                                <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-medium text-zinc-500 text-right whitespace-nowrap min-w-[60px]" style={{ boxShadow: 'inset 0 -1px 0 #e4e4e7' }}>
                                    <Tooltip content="Доплата за исполнение обязанностей старшей смены">ИО</Tooltip>
                                </th>
                            )}
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-medium text-zinc-500 text-right whitespace-nowrap min-w-[100px]" style={{ boxShadow: 'inset 0 -1px 0 #e4e4e7' }}>Продажи</th>
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-medium text-zinc-500 text-center whitespace-nowrap min-w-[110px]" style={{ boxShadow: 'inset 0 -1px 0 #e4e4e7' }}>
                                <Tooltip content="Доплата за открытие больничных листов">Откр. Б/Л</Tooltip>
                            </th>
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-medium text-zinc-500 text-center whitespace-nowrap min-w-[140px]" style={{ boxShadow: 'inset 0 -1px 0 #e4e4e7' }}>
                                <Tooltip content="Доплата за продление и закрытие больничных листов">Закр/Продл Б/Л</Tooltip>
                            </th>
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-medium text-zinc-500 text-center whitespace-nowrap min-w-[100px]" style={{ boxShadow: 'inset 0 -1px 0 #e4e4e7' }}>
                                <Tooltip content="Доплата за создание карточек пациентов">Карточки</Tooltip>
                            </th>
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-medium text-zinc-500 text-right whitespace-nowrap min-w-[100px]" style={{ boxShadow: 'inset 0 -1px 0 #e4e4e7' }}>Выслуга</th>
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-medium text-zinc-500 text-right whitespace-nowrap min-w-[100px]" style={{ boxShadow: 'inset 0 -1px 0 #e4e4e7' }}>Чеклист</th>
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-medium text-zinc-500 text-right whitespace-nowrap min-w-[100px]" style={{ boxShadow: 'inset 0 -1px 0 #e4e4e7' }}>
                                <Tooltip content="Качество заполнения карточек первичных пациентов">Качество</Tooltip>
                            </th>
                            <th className="sticky top-0 right-0 z-30 bg-zinc-50 px-4 py-3 font-medium text-zinc-500 text-right whitespace-nowrap min-w-[110px]" style={{ boxShadow: 'inset 0 -1px 0 #e4e4e7, inset 1px 0 0 #e4e4e7, -2px 0 10px -2px rgba(0,0,0,0.1)' }}>Итого</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {isUserLoading ? (
                            <tr>
                                <td colSpan={15} className="px-4 py-12 text-center text-zinc-500">Загрузка данных...</td>
                            </tr>
                        ) : payrollData.length === 0 ? (
                            <tr>
                                <td colSpan={15} className="px-4 py-12 text-center text-zinc-500">Нет данных для отображения.</td>
                            </tr>
                        ) : (
                            payrollData.map(calc => {
                                if (calc.rawHours === 0 && calc.dayOffHours === 0 && calc.totalPay === 0 && !calc.seniorityBonus) return null;

                                return (
                                    <tr
                                        key={calc.empId}
                                        className="group hover:bg-zinc-50 transition-colors"
                                    >
                                        <td className="sticky left-0 z-10 bg-white group-hover:bg-zinc-50 transition-colors px-4 py-3 font-medium text-zinc-900" style={{ boxShadow: 'inset -1px 0 0 #f4f4f5, 2px 0 10px -2px rgba(0,0,0,0.1)' }}>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center ${calc.role === 'MANAGER' ? 'bg-purple-100 text-purple-600' :
                                                    calc.role === 'SENIOR' ? 'bg-amber-100 text-amber-600' :
                                                        'bg-zinc-100 text-zinc-500'
                                                    }`}>
                                                    {calc.role === 'MANAGER' ? (
                                                        <Crown className="w-3 h-3" />
                                                    ) : calc.role === 'SENIOR' ? (
                                                        <BadgeCheck className="w-3 h-3" />
                                                    ) : (
                                                        <User className="w-3 h-3" />
                                                    )}
                                                </div>
                                                <span className="truncate">{calc.name}</span>
                                                {calc.auditLogs && calc.auditLogs.length > 0 && <InfoTooltip logs={calc.auditLogs} />}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right text-zinc-600 font-semibold">{calc.rawHours.toFixed(1)}</td>
                                        <td className="px-4 py-3 text-right text-zinc-600">{calc.basePay.toFixed(0)}</td>
                                        <td className="px-4 py-3 text-right">
                                            {calc.coeffBonus > 0 ? (
                                                <div className="text-emerald-600 font-medium">+{calc.coeffBonus.toFixed(0)}</div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {calc.dayOffPay > 0 ? (
                                                <div>
                                                    <div className="text-emerald-600 font-medium">+{calc.dayOffPay.toFixed(0)}</div>
                                                    <div className="text-[10px] text-zinc-400">{calc.dayOffHours}ч</div>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-zinc-600 font-medium text-emerald-600">
                                            {calc.closingBonuses > 0 ? (
                                                <div className="text-emerald-600 font-medium">+{calc.closingBonuses}</div>
                                            ) : '-'}
                                        </td>
                                        {currentMonth < new Date('2026-04-01') && (
                                            <td className="px-4 py-3 text-right">
                                                {calc.actingLeadBonus > 0 ? (
                                                    <div className="text-emerald-600 font-medium">+{calc.actingLeadBonus}</div>
                                                ) : '-'}
                                            </td>
                                        )}
                                        <td className="px-4 py-3 text-right">
                                            {calc.salesBonus > 0 ? (
                                                <div className="text-emerald-600 font-medium">+{calc.salesBonus}</div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center text-zinc-600">
                                            {editingCell?.empId === calc.empId && editingCell?.field === 'sickLeaveOpening' ? (
                                                <input
                                                    autoFocus
                                                    type="number"
                                                    className="w-12 px-1 py-0.5 border rounded text-center text-sm"
                                                    value={tempValue}
                                                    onFocus={(e) => e.target.select()}
                                                    onChange={(e) => setTempValue(e.target.value)}
                                                    onBlur={() => handleSaveChecklist(calc.empId, 'sickLeaveOpening', tempValue)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleSaveChecklist(calc.empId, 'sickLeaveOpening', tempValue);
                                                        if (e.key === 'Escape') setEditingCell(null);
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    className={!isClosed ? "cursor-pointer hover:text-blue-600 transition-colors" : ""}
                                                    onClick={() => {
                                                        if (isClosed) return;
                                                        setEditingCell({ empId: calc.empId, field: 'sickLeaveOpening' });
                                                        setTempValue(calc.sickLeaveOpening === 0 ? '' : calc.sickLeaveOpening.toString());
                                                    }}
                                                >
                                                    {calc.sickLeaveOpening > 0 && <div className="text-emerald-600 font-medium">+{calc.sickLeaveOpening * 130}</div>}
                                                    <div className="text-[10px] text-zinc-400">{calc.sickLeaveOpening || '-'} шт.</div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center text-zinc-600">
                                            {editingCell?.empId === calc.empId && editingCell?.field === 'sickLeaveClosing' ? (
                                                <input
                                                    autoFocus
                                                    type="number"
                                                    className="w-12 px-1 py-0.5 border rounded text-center text-sm"
                                                    value={tempValue}
                                                    onFocus={(e) => e.target.select()}
                                                    onChange={(e) => setTempValue(e.target.value)}
                                                    onBlur={() => handleSaveChecklist(calc.empId, 'sickLeaveClosing', tempValue)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleSaveChecklist(calc.empId, 'sickLeaveClosing', tempValue);
                                                        if (e.key === 'Escape') setEditingCell(null);
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    className={!isClosed ? "cursor-pointer hover:text-blue-600 transition-colors" : ""}
                                                    onClick={() => {
                                                        if (isClosed) return;
                                                        setEditingCell({ empId: calc.empId, field: 'sickLeaveClosing' });
                                                        setTempValue(calc.sickLeaveClosing === 0 ? '' : calc.sickLeaveClosing.toString());
                                                    }}
                                                >
                                                    {calc.sickLeaveClosing > 0 && <div className="text-emerald-600 font-medium">+{calc.sickLeaveClosing * 80}</div>}
                                                    <div className="text-[10px] text-zinc-400">{calc.sickLeaveClosing || '-'} шт.</div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center text-zinc-600">
                                            {editingCell?.empId === calc.empId && editingCell?.field === 'cardCreation' ? (
                                                <input
                                                    autoFocus
                                                    type="number"
                                                    className="w-12 px-1 py-0.5 border rounded text-center text-sm"
                                                    value={tempValue}
                                                    onFocus={(e) => e.target.select()}
                                                    onChange={(e) => setTempValue(e.target.value)}
                                                    onBlur={() => handleSaveChecklist(calc.empId, 'cardCreation', tempValue)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleSaveChecklist(calc.empId, 'cardCreation', tempValue);
                                                        if (e.key === 'Escape') setEditingCell(null);
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    className={!isClosed ? "cursor-pointer hover:text-blue-600 transition-colors" : ""}
                                                    onClick={() => {
                                                        if (isClosed) return;
                                                        setEditingCell({ empId: calc.empId, field: 'cardCreation' });
                                                        setTempValue(calc.cardCreation === 0 ? '' : calc.cardCreation.toString());
                                                    }}
                                                >
                                                    {calc.cardCreation > 0 && <div className="text-emerald-600 font-medium">+{calc.cardCreation * 60}</div>}
                                                    <div className="text-[10px] text-zinc-400">{calc.cardCreation || '-'} шт.</div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right text-zinc-600">
                                            {calc.seniorityBonus > 0 && <span className="text-green-600 font-medium">+{calc.seniorityBonus}</span>}
                                            <div className="text-[10px] text-zinc-400">{calc.seniorityYears > 0 ? calc.seniorityYears.toFixed(1) + ' г.' : ''}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right text-zinc-600">
                                            {editingCell?.empId === calc.empId && editingCell?.field === 'percentage' ? (
                                                <div className="flex items-center justify-end gap-1">
                                                    <input
                                                        autoFocus
                                                        type="number"
                                                        className="w-16 px-1 py-0.5 border rounded text-right text-sm"
                                                        value={tempValue}
                                                        onFocus={(e) => e.target.select()}
                                                        onChange={(e) => setTempValue(e.target.value)}
                                                        onBlur={() => handleSaveChecklist(calc.empId, 'percentage', tempValue)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleSaveChecklist(calc.empId, 'percentage', tempValue);
                                                            if (e.key === 'Escape') setEditingCell(null);
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    {calc.checklistBonus > 0 && <span className="text-green-600 font-medium">+{calc.checklistBonus}</span>}
                                                    <div
                                                        className={!isClosed ? "text-[10px] text-zinc-400 cursor-pointer hover:text-blue-600 transition-colors" : "text-[10px] text-zinc-400"}
                                                        onClick={() => {
                                                            if (isClosed) return;
                                                            setEditingCell({ empId: calc.empId, field: 'percentage' });
                                                            setTempValue((calc.ownChecklist ?? calc.calcChecklist) === 0 ? '' : (calc.ownChecklist ?? calc.calcChecklist).toFixed(0));
                                                        }}
                                                    >
                                                        {calc.checklistBreakdown ? (
                                                            <Tooltip content={calc.checklistBreakdown}>
                                                                <span className="cursor-help border-b border-dotted border-zinc-300">
                                                                    {calc.calcChecklist.toFixed(1)}%
                                                                </span>
                                                            </Tooltip>
                                                        ) : (
                                                            <>{calc.calcChecklist.toFixed(0)}%</>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right text-zinc-600">
                                            {calc.qualityBonus > 0 && <span className="text-green-600 font-medium">+{calc.qualityBonus}</span>}
                                            <div className="text-[10px] text-zinc-400">
                                                {calc.qualityBreakdown ? (
                                                    <Tooltip content={calc.qualityBreakdown}>
                                                        <span className="cursor-help border-b border-dotted border-zinc-300">
                                                            {calc.avgQuality.toFixed(1)}%
                                                        </span>
                                                    </Tooltip>
                                                ) : (
                                                    <>{calc.avgQuality.toFixed(1)}%</>
                                                )}
                                            </div>
                                        </td>
                                        <td className="sticky right-0 z-10 bg-zinc-50 group-hover:bg-zinc-100 transition-colors px-4 py-3 text-right font-bold text-zinc-900 whitespace-nowrap min-w-[100px]" style={{ boxShadow: 'inset 1px 0 0 #f4f4f5, -2px 0 10px -2px rgba(0,0,0,0.1)' }}>
                                            {calc.totalPay.toFixed(0)} ₽
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {
                showModal && (
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
                )
            }
        </div >
    );
}

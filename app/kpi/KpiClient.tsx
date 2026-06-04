
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSharedMonth } from '@/lib/useSharedMonth';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CheckCircle, X, Crown, BadgeCheck, User, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { InfoTooltip } from '@/components/InfoTooltip';
import { Tooltip } from '@/components/Tooltip';
import { useMonthStatus } from '@/lib/useMonthStatus';
import { MonthStatusBadge } from '@/components/MonthStatusBadge';
import { MonthClosureControls } from '@/components/MonthClosureControls';
import { EmptyState } from '@/components/EmptyState';
import { InlineStatus } from '@/components/InlineStatus';
import type { KpiOverview } from '@/lib/overview-data';
import { shouldIncludeActingLeadBonus } from '@/lib/acting-lead-policy';

interface Employee {
    id: string;
    name: string;
    baseSalary: number;
    hourlyRate: number;
    role: string;
    branch?: string | null;
    hireDate?: string;
    dismissalDate?: string;
    seniorId?: string | null;
}

interface CurrentUser extends Employee {
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
    isTrainee?: boolean;
    isDeleted?: boolean;
    auditLogs?: AuditLog[];
}

interface KpiRecord {
    id: string;
    date: string;
    qualityScore: number;
    errorsCount: number;
    salesBonus: number;
    checkList: number;
    employeeId: string;
    auditLogs?: AuditLog[];
}

interface PromotionSale {
    id: string;
    date: string;
    employeeId: string;
    bonus: number;
    auditLogs?: AuditLog[];
}

interface RegistrationKpi {
    id: string;
    date: string;
    employeeId: string;
    count: number;
    totalScore: number;
    maxScore: number;
    auditLogs?: AuditLog[];
}

type KpiClientProps = {
    initialMonth?: string;
    initialData?: KpiOverview | null;
};

function formatSeniority(years: number): string {
    if (years <= 0) return '';

    const totalMonths = Math.floor(years * 12);
    const fullYears = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    if (fullYears === 0) return `${totalMonths} мес.`;

    const yearSuffix = fullYears <= 4 ? 'г.' : 'л.';
    return months > 0 ? `${fullYears} ${yearSuffix} ${months} м.` : `${fullYears} ${yearSuffix}`;
}

export default function KpiPage({ initialMonth, initialData }: KpiClientProps) {
    const [currentMonth, setCurrentMonth] = useSharedMonth(initialMonth);
    const initialDataMatchesMonth = !!initialData && initialMonth === format(currentMonth, 'yyyy-MM');
    const shouldSkipInitialFetchRef = useRef(initialDataMatchesMonth);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(
        initialDataMatchesMonth ? initialData.currentUser : null
    );
    const [isUserLoading, setIsUserLoading] = useState(!initialDataMatchesMonth);
    const [isDataLoading, setIsDataLoading] = useState(!initialDataMatchesMonth);
    const [pageError, setPageError] = useState<string | null>(null);
    const { isClosed, refresh: refreshMonthStatus } = useMonthStatus(currentMonth);
    const [employees, setEmployees] = useState<Employee[]>(initialDataMatchesMonth ? initialData.employees : []);
    const [shifts, setShifts] = useState<Shift[]>(initialDataMatchesMonth ? initialData.shifts : []);
    const [kpiRecords, setKpiRecords] = useState<KpiRecord[]>(initialDataMatchesMonth ? initialData.kpiRecords : []);
    const [promotionSales, setPromotionSales] = useState<PromotionSale[]>(initialDataMatchesMonth ? initialData.promotionSales : []);
    const [registrationKpis, setRegistrationKpis] = useState<RegistrationKpi[]>(initialDataMatchesMonth ? initialData.registrationKpis : []);
    const [monthlyChecklists, setMonthlyChecklists] = useState<MonthlyChecklist[]>(initialDataMatchesMonth ? initialData.monthlyChecklists : []);
    const [dailyChecklists, setDailyChecklists] = useState<DailyChecklist[]>(initialDataMatchesMonth ? initialData.dailyChecklists : []);
    const [monthNorm, setMonthNorm] = useState<number>(initialDataMatchesMonth ? initialData.monthNorm : 176);
    const [isColumnCollapsed, setIsColumnCollapsed] = useState(false);
    const includeActingLeadBonus = shouldIncludeActingLeadBonus(currentMonth);

    function getInitials(name: string): string {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    }

    // Entry Form State
    const [showModal, setShowModal] = useState(false);
    const [selectedKpiDate, setSelectedKpiDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedEmployeeId] = useState<string | null>(null);
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

    const fetchData = useCallback(async (signal?: AbortSignal) => {
        try {
            setIsUserLoading(true);
            setIsDataLoading(true);
            setPageError(null);
            const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
            const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
            const month = format(currentMonth, 'yyyy-MM');

            const res = await fetch(`/api/kpi/overview?start=${start}&end=${end}&month=${month}&includeDetails=true`, { signal });
            if (res.status === 401) {
                window.location.href = '/login';
                return;
            }
            if (!res.ok) {
                throw new Error('KPI data fetch failed');
            }

            const data = await res.json();
            setCurrentUser(data.currentUser || null);
            setEmployees(Array.isArray(data.employees) ? data.employees : []);
            setShifts(Array.isArray(data.shifts) ? data.shifts : []);
            setKpiRecords(Array.isArray(data.kpiRecords) ? data.kpiRecords : []);
            setPromotionSales(Array.isArray(data.promotionSales) ? data.promotionSales : []);
            setRegistrationKpis(Array.isArray(data.registrationKpis) ? data.registrationKpis : []);
            setMonthlyChecklists(Array.isArray(data.monthlyChecklists) ? data.monthlyChecklists : []);
            setDailyChecklists(Array.isArray(data.dailyChecklists) ? data.dailyChecklists : []);
            setMonthNorm(data.monthNorm || 176);
        } catch (e) {
            if (!isAbortError(e)) {
                console.error('KPI_FETCH_DATA_ERROR:', e);
                setPageError('Не удалось загрузить расчетные данные KPI за выбранный месяц.');
            }
        } finally {
            if (!signal?.aborted) setIsUserLoading(false);
            if (!signal?.aborted) setIsDataLoading(false);
        }
    }, [currentMonth]);

    useEffect(() => {
        if (window.innerWidth < 768) {
            setIsColumnCollapsed(true);
        }
    }, []);

    useEffect(() => {
        if (shouldSkipInitialFetchRef.current) {
            shouldSkipInitialFetchRef.current = false;
            return;
        }

        const controller = new AbortController();
        void fetchData(controller.signal);
        return () => controller.abort();
    }, [fetchData]);

    async function handleSaveChecklist(empId: string, field: string, value: string) {
        if (isClosed || currentUser?.role !== 'MANAGER') {
            setEditingCell(null);
            return;
        }
        try {
            const trimmedValue = value.trim();
            const newValue = trimmedValue === '' ? 0 : Number(trimmedValue);
            if (!Number.isFinite(newValue)) {
                setPageError('Введите корректное числовое значение.');
                return;
            }

            const month = format(currentMonth, 'yyyy-MM');

            const res = await fetch('/api/checklist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    month,
                    employeeId: empId,
                    [field]: newValue,
                    updatedBy: currentUser?.name || null
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.error || 'Failed to save checklist');
            }

            const savedChecklist = await res.json() as MonthlyChecklist;
            setMonthlyChecklists(previous => {
                const existingIndex = previous.findIndex(item =>
                    item.month === savedChecklist.month && item.employeeId === savedChecklist.employeeId
                );

                if (existingIndex === -1) {
                    return [...previous, savedChecklist];
                }

                return previous.map((item, index) =>
                    index === existingIndex ? savedChecklist : item
                );
            });
            setEditingCell(null);
        } catch (e) {
            console.error('Failed to save checklist:', e);
            setPageError('Не удалось сохранить ручной показатель. Попробуйте обновить страницу и повторить ввод.');
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
            let traineeBonus = 0;
            empShifts.forEach(s => {
                // Safety check: skip shifts on or after dismissal date
                if (dismissalDate && s.date >= dismissalDate) return;

                const coeff = s.coefficient || 1.0;
                const hourlyBase = enrichedEmp.baseSalary / monthNorm;
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
                if (s.isTrainee) traineeBonus += 500;
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

            // Get checklist from daily audits
            const empDailyChecklists = dailyChecklists.filter(c => c.employeeId === enrichedEmp.id);
            const avgDailyChecklist = empDailyChecklists.length > 0
                ? empDailyChecklists.reduce((sum, c) => sum + c.totalScore, 0) / empDailyChecklists.length
                : 0;

            const monthStr = format(currentMonth, 'yyyy-MM');
            const empChecklist = monthlyChecklists.find(c => c.employeeId === enrichedEmp.id && c.month === monthStr);
            // Use daily average for calculation, ownChecklist is monthly constant (legacy if needed)
            const ownChecklist = empChecklist ? empChecklist.percentage : 0;
            const sickLeaveOpening = empChecklist ? (empChecklist.sickLeaveOpening || 0) : 0;
            const sickLeaveClosing = empChecklist ? (empChecklist.sickLeaveClosing || 0) : 0;
            const cardCreation = empChecklist ? (empChecklist.cardCreation || 0) : 0;
            const sickLeaveBonus = (sickLeaveOpening * 130) + (sickLeaveClosing * 80);
            const cardBonus = cardCreation * 60;

            const calcChecklist = empDailyChecklists.length > 0 ? avgDailyChecklist : ownChecklist;
            const checklistBreakdown = "";

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
            const finalQuality = ownQuality;
            const qualityBreakdown = "";

            let qualityBonus = 0;
            if (finalQuality >= 95) qualityBonus = 5000;
            else if (finalQuality >= 85) qualityBonus = 2500;

            if (monthStr >= '2026-05') {
                const coeff = Math.min(1.0, Math.round((rawHours / monthNorm) * 100) / 100);
                checklistBonus = Math.round(checklistBonus * coeff);
                qualityBonus = Math.round(qualityBonus * coeff);
            }

            const actualClosingBonuses = closingBonuses;
            const totalPay = basePay + coeffBonus + dayOffPayTotal + actualClosingBonuses + salesBonus + qualityBonus + checklistBonus + seniorityBonus + sickLeaveBonus + cardBonus + traineeBonus + (includeActingLeadBonus ? actingLeadBonus : 0);

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
                traineeBonus,
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
    }, [employees, shifts, kpiRecords, promotionSales, registrationKpis, monthlyChecklists, dailyChecklists, monthNorm, currentUser, isUserLoading, currentMonth, includeActingLeadBonus]);

    const isPayrollLoading = isUserLoading || isDataLoading;
    const visiblePayrollData = payrollData.filter(calc =>
        calc.rawHours > 0 || calc.dayOffHours > 0 || calc.totalPay > 0 || calc.seniorityBonus > 0
    );
    const payrollColumnCount = includeActingLeadBonus ? 16 : 15;
    const canEditManualChecklistValues = currentUser?.role === 'MANAGER' && !isClosed;

    return (
        <div>
            <div className="flex flex-col gap-5 mb-8">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">KPI и Зарплата</h1>
                        <p className="mt-2 text-sm text-zinc-500">Расчет начислений, бонусов и качества по выбранному месяцу.</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-start lg:justify-end gap-3">
                        <MonthStatusBadge isClosed={isClosed} />
                        {currentUser?.role === 'MANAGER' && (
                            <MonthClosureControls 
                                currentMonth={currentMonth} 
                                isClosed={isClosed} 
                                onStatusChange={refreshMonthStatus}
                            />
                        )}
                        <div className="flex items-center gap-2 sm:gap-4 bg-white/95 p-1 rounded-full border border-zinc-200 shadow-sm shadow-zinc-950/5 w-full sm:w-auto justify-between sm:justify-start">
                            <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-100 rounded-full transition-colors" aria-label="Предыдущий месяц"><ChevronLeft className="w-5 h-5 text-zinc-600" /></button>
                            <span className="text-sm sm:text-base font-semibold min-w-[120px] sm:w-40 text-center text-zinc-800 capitalize">{format(currentMonth, 'LLLL yyyy', { locale: ru })}</span>
                            <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-100 rounded-full transition-colors" aria-label="Следующий месяц"><ChevronRight className="w-5 h-5 text-zinc-600" /></button>
                        </div>
                    </div>
                </div>
            </div>

            {pageError && (
                <InlineStatus type="error" message={pageError} className="mb-4 px-4 py-3" />
            )}

            <div className="bg-white/95 sm:rounded-xl shadow-[0_18px_60px_-38px_rgba(15,23,42,0.65)] border-y sm:border border-zinc-200/70 overflow-auto max-h-[calc(100vh-250px)] scrollbar-custom -mx-3 sm:mx-0">
                <table className="w-full text-left text-xs sm:text-sm border-separate border-spacing-0 tabular-nums">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                            <th className={`sticky top-0 left-0 z-40 bg-zinc-50 px-3 sm:px-4 py-3 font-bold text-zinc-500 uppercase tracking-wider text-[10px] transition-all ${isColumnCollapsed ? 'min-w-[52px] w-[52px]' : 'min-w-[200px]'}`} style={{ boxShadow: 'inset 0 -2px 0 #e4e4e7, inset -2px 0 0 #e4e4e7, 2px 0 10px -2px rgba(0,0,0,0.1)' }}>
                                <div className="flex items-center justify-between gap-1">
                                    {!isColumnCollapsed && <span>Сотрудник</span>}
                                    <button
                                        type="button"
                                        onClick={() => setIsColumnCollapsed(prev => !prev)}
                                        className="p-1 rounded-md hover:bg-zinc-200/70 text-zinc-400 hover:text-zinc-600 transition-colors"
                                        title={isColumnCollapsed ? 'Развернуть' : 'Свернуть'}
                                        aria-label={isColumnCollapsed ? 'Развернуть колонку сотрудников' : 'Свернуть колонку сотрудников'}
                                    >
                                        {isColumnCollapsed ? <ChevronsRight className="w-3.5 h-3.5" /> : <ChevronsLeft className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </th>
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-right whitespace-nowrap min-w-[70px]" style={{ boxShadow: 'inset 0 -2px 0 #e4e4e7' }}>Часы</th>
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-right whitespace-nowrap min-w-[80px]" style={{ boxShadow: 'inset 0 -2px 0 #e4e4e7' }}>Оклад</th>
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-right whitespace-nowrap min-w-[80px]" style={{ boxShadow: 'inset 0 -2px 0 #e4e4e7' }}>Коэф.</th>
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-right whitespace-nowrap min-w-[130px]" style={{ boxShadow: 'inset 0 -2px 0 #e4e4e7' }}>Работа в арх.</th>
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-right whitespace-nowrap min-w-[110px]" style={{ boxShadow: 'inset 0 -2px 0 #e4e4e7' }}>
                                <Tooltip content="Доплата за открытие, закрытие центра и за закрытие кабинетов">Откр/Закр.</Tooltip>
                            </th>
                            {includeActingLeadBonus && (
                                <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-right whitespace-nowrap min-w-[60px]" style={{ boxShadow: 'inset 0 -2px 0 #e4e4e7' }}>
                                    <Tooltip content="Доплата за исполнение обязанностей старшей смены">ИО</Tooltip>
                                </th>
                            )}
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-right whitespace-nowrap min-w-[80px]" style={{ boxShadow: 'inset 0 -2px 0 #e4e4e7' }}>Стажёр</th>
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-right whitespace-nowrap min-w-[100px]" style={{ boxShadow: 'inset 0 -2px 0 #e4e4e7' }}>Продажи</th>
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-center whitespace-nowrap min-w-[110px]" style={{ boxShadow: 'inset 0 -2px 0 #e4e4e7' }}>
                                <Tooltip content="Доплата за открытие больничных листов">Откр. Б/Л</Tooltip>
                            </th>
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-center whitespace-nowrap min-w-[140px]" style={{ boxShadow: 'inset 0 -2px 0 #e4e4e7' }}>
                                <Tooltip content="Доплата за продление и закрытие больничных листов">Закр/Продл Б/Л</Tooltip>
                            </th>
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-center whitespace-nowrap min-w-[100px]" style={{ boxShadow: 'inset 0 -2px 0 #e4e4e7' }}>
                                <Tooltip content="Доплата за создание карточек пациентов">Карточки</Tooltip>
                            </th>
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-right whitespace-nowrap min-w-[100px]" style={{ boxShadow: 'inset 0 -2px 0 #e4e4e7' }}>Выслуга</th>
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-right whitespace-nowrap min-w-[100px]" style={{ boxShadow: 'inset 0 -2px 0 #e4e4e7' }}>
                                <Tooltip content={(() => {
                                    const visible = payrollData.filter(c => c.rawHours > 0 || c.dayOffHours > 0 || c.totalPay > 0 || c.seniorityBonus > 0);
                                    if (visible.length === 0) return 'Нет данных';
                                    const avg = visible.reduce((sum, c) => sum + c.calcChecklist, 0) / visible.length;
                                    return `Общий чеклист: ${avg.toFixed(1)}%`;
                                })()}>Чеклист</Tooltip>
                            </th>
                            <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 font-bold text-zinc-500 uppercase tracking-wider text-[10px] text-right whitespace-nowrap min-w-[100px]" style={{ boxShadow: 'inset 0 -2px 0 #e4e4e7' }}>
                                <Tooltip content="Качество заполнения карточек первичных пациентов">Качество</Tooltip>
                            </th>
                            <th className="sticky top-0 sm:right-0 z-30 bg-zinc-100 sm:bg-zinc-50 px-4 py-3 font-bold text-zinc-900 sm:text-zinc-500 text-right whitespace-nowrap min-w-[110px]" style={{ boxShadow: 'inset 0 -2px 0 #e4e4e7, inset 1px 0 0 #e4e4e7, -2px 0 10px -2px rgba(0,0,0,0.1)' }}>Итого</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {isPayrollLoading ? (
                            Array.from({ length: 6 }).map((_, rowIndex) => (
                                <tr key={rowIndex}>
                                    {Array.from({ length: payrollColumnCount }).map((__, cellIndex) => (
                                        <td key={cellIndex} className="px-4 py-3">
                                            <div className="h-4 rounded bg-zinc-100 animate-pulse" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : visiblePayrollData.length === 0 ? (
                            <tr>
                                <td colSpan={payrollColumnCount}>
                                    <EmptyState
                                        icon={User}
                                        title="Нет данных для расчета KPI"
                                        description="За выбранный месяц пока нет сотрудников или расчетных данных, которые можно показать в зарплатной таблице."
                                    />
                                </td>
                            </tr>
                        ) : (
                            visiblePayrollData.map(calc => (
                                    <tr
                                        key={calc.empId}
                                        className="group hover:bg-zinc-50 transition-colors"
                                    >
                                        <td className="sticky left-0 z-10 bg-white group-hover:bg-zinc-50 transition-all px-3 sm:px-4 py-3 font-bold text-zinc-900" style={{ boxShadow: 'inset -2px 0 0 #f4f4f5, 2px 0 10px -2px rgba(0,0,0,0.1)' }}>
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
                                                {!isColumnCollapsed ? (
                                                    <span className="truncate">{calc.name}</span>
                                                ) : (
                                                    <span className="text-[10px] font-black">{getInitials(calc.name)}</span>
                                                )}
                                                {!isColumnCollapsed && calc.auditLogs && calc.auditLogs.length > 0 && <InfoTooltip logs={calc.auditLogs} />}
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
                                        {includeActingLeadBonus && (
                                            <td className="px-4 py-3 text-right">
                                                {calc.actingLeadBonus > 0 ? (
                                                    <div className="text-emerald-600 font-medium">+{calc.actingLeadBonus}</div>
                                                ) : '-'}
                                            </td>
                                        )}
                                        <td className="px-4 py-3 text-right">
                                            {calc.traineeBonus > 0 ? (
                                                <div className="text-emerald-600 font-medium">+{calc.traineeBonus}</div>
                                            ) : '-'}
                                        </td>
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
                                                    className={canEditManualChecklistValues ? "cursor-pointer hover:text-blue-600 transition-colors" : ""}
                                                    onClick={() => {
                                                        if (!canEditManualChecklistValues) return;
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
                                                    className={canEditManualChecklistValues ? "cursor-pointer hover:text-blue-600 transition-colors" : ""}
                                                    onClick={() => {
                                                        if (!canEditManualChecklistValues) return;
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
                                                    className={canEditManualChecklistValues ? "cursor-pointer hover:text-blue-600 transition-colors" : ""}
                                                    onClick={() => {
                                                        if (!canEditManualChecklistValues) return;
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
                                            <div className="text-[10px] text-zinc-400">{formatSeniority(calc.seniorityYears)}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right text-zinc-600">
                                            <div className="flex flex-col items-end">
                                                {calc.checklistBonus > 0 && <span className="text-green-600 font-medium">+{calc.checklistBonus}</span>}
                                                {editingCell?.empId === calc.empId && editingCell?.field === 'percentage' ? (
                                                    <input
                                                        autoFocus
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        step="0.1"
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
                                                ) : (
                                                    <div
                                                        className={`text-[10px] text-zinc-400 font-bold ${canEditManualChecklistValues ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
                                                        onClick={() => {
                                                            if (!canEditManualChecklistValues) return;
                                                            setEditingCell({ empId: calc.empId, field: 'percentage' });
                                                            setTempValue(calc.calcChecklist === 0 ? '' : calc.calcChecklist.toFixed(1));
                                                        }}
                                                    >
                                                        {calc.calcChecklist.toFixed(1)}%
                                                    </div>
                                                )}
                                            </div>
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
                                        <td className="sticky sm:right-0 z-10 bg-zinc-50 group-hover:bg-zinc-100 transition-all px-4 py-3 text-right font-black text-zinc-900 whitespace-nowrap min-w-[100px]" style={{ boxShadow: 'inset 1px 0 0 #f4f4f5, -2px 0 10px -2px rgba(0,0,0,0.1)' }}>
                                            {calc.totalPay.toFixed(0)} ₽
                                        </td>
                                    </tr>
                            ))
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
                                <button type="button" onClick={() => setShowModal(false)} className="p-2 hover:bg-zinc-100 rounded-full" aria-label="Закрыть окно ввода KPI">
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
                                    <p className="text-xs text-zinc-500 text-center">
                                        Показатель чеклиста вносится вручную в таблице KPI и зарплаты.
                                    </p>
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
interface MonthlyChecklist {
    month: string;
    employeeId: string;
    percentage: number;
    sickLeaveOpening?: number;
    sickLeaveClosing?: number;
    cardCreation?: number;
    closingBonus?: number;
}

interface DailyChecklist {
    employeeId: string;
    totalScore: number;
}

function isAbortError(error: unknown) {
    return error instanceof DOMException && error.name === 'AbortError';
}

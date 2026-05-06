import { eachDayOfInterval, endOfMonth, format, parseISO, startOfMonth, subDays } from 'date-fns';
import { shouldIncludeActingLeadBonus } from '@/lib/acting-lead-policy';
import type { BatchShiftDeleteOperation, BatchShiftOperation, Employee, SelectionBounds, SelectionState, Shift, ShiftFormData } from './schedule-types';

export const DEFAULT_SHIFT_FORM_DATA: ShiftFormData = {
    type: 'REGULAR',
    hours: '11',
    cabinetClosed: false,
    centerClosed: false,
    isActingLead: false,
    isTrainee: false,
    coefficient: '1.0',
};

export function getShiftFormData(existingShift?: Shift): ShiftFormData {
    if (!existingShift) return DEFAULT_SHIFT_FORM_DATA;

    return {
        type: existingShift.type,
        hours: existingShift.hours.toString(),
        cabinetClosed: !!existingShift.cabinetClosed,
        centerClosed: !!existingShift.centerClosed,
        isActingLead: !!existingShift.isActingLead,
        isTrainee: !!existingShift.isTrainee,
        coefficient: (existingShift.coefficient || 1.0).toString(),
    };
}

export function buildIndexMap<T extends { id?: string }>(items: T[], getKey?: (item: T) => string): Map<string, number> {
    const map = new Map<string, number>();
    items.forEach((item, index) => map.set(getKey ? getKey(item) : item.id || '', index));
    return map;
}

export function buildDateIndexMap(days: Date[]): Map<string, number> {
    const map = new Map<string, number>();
    days.forEach((day, index) => map.set(format(day, 'yyyy-MM-dd'), index));
    return map;
}

export function getSelectionBounds(
    selection: SelectionState | null,
    handleCell: { empId: string; dateKey: string } | null,
    empIdToIndex: Map<string, number>,
    dateKeyToIndex: Map<string, number>,
): SelectionBounds | null {
    const active = selection || (handleCell ? {
        start: { empId: handleCell.empId, date: handleCell.dateKey },
        end: { empId: handleCell.empId, date: handleCell.dateKey },
    } : null);
    if (!active) return null;

    const startEmpIdx = empIdToIndex.get(active.start.empId) ?? -1;
    const endEmpIdx = empIdToIndex.get(active.end.empId) ?? -1;
    const startDateIdx = dateKeyToIndex.get(active.start.date) ?? -1;
    const endDateIdx = dateKeyToIndex.get(active.end.date) ?? -1;

    if (startEmpIdx === -1 || endEmpIdx === -1 || startDateIdx === -1 || endDateIdx === -1) return null;

    return {
        minEmpIdx: Math.min(startEmpIdx, endEmpIdx),
        maxEmpIdx: Math.max(startEmpIdx, endEmpIdx),
        minDateIdx: Math.min(startDateIdx, endDateIdx),
        maxDateIdx: Math.max(startDateIdx, endDateIdx),
    };
}

export function getSelectedRange(
    selection: SelectionState,
    employees: Employee[],
    days: Date[],
    empIdToIndex: Map<string, number>,
    dateKeyToIndex: Map<string, number>,
): { empId: string; date: string }[] {
    const startEmpIdx = empIdToIndex.get(selection.start.empId) ?? 0;
    const endEmpIdx = empIdToIndex.get(selection.end.empId) ?? 0;
    const minEmpIdx = Math.min(startEmpIdx, endEmpIdx);
    const maxEmpIdx = Math.max(startEmpIdx, endEmpIdx);

    const startDateIdx = dateKeyToIndex.get(selection.start.date) ?? 0;
    const endDateIdx = dateKeyToIndex.get(selection.end.date) ?? 0;
    const minDateIdx = Math.min(startDateIdx, endDateIdx);
    const maxDateIdx = Math.max(startDateIdx, endDateIdx);

    const dateStrs = days.map(d => format(d, 'yyyy-MM-dd'));
    const range: { empId: string; date: string }[] = [];
    for (let i = minEmpIdx; i <= maxEmpIdx; i++) {
        const empId = employees[i].id;
        for (let j = minDateIdx; j <= maxDateIdx; j++) {
            range.push({ empId, date: dateStrs[j] });
        }
    }
    return range;
}

export function groupShiftsByEmployee(shifts: Shift[]): Record<string, Record<string, Shift>> {
    const grouped: Record<string, Record<string, Shift>> = {};
    shifts.forEach(shift => {
        if (!grouped[shift.employeeId]) grouped[shift.employeeId] = {};
        const key = format(parseISO(shift.date), 'yyyy-MM-dd');
        grouped[shift.employeeId][key] = shift;
    });
    return grouped;
}

export function isCellInSelection(
    empId: string,
    dateKey: string,
    selectionBounds: SelectionBounds | null,
    empIdToIndex: Map<string, number>,
    dateKeyToIndex: Map<string, number>,
): boolean {
    if (!selectionBounds) return false;

    const currentEmpIdx = empIdToIndex.get(empId) ?? -1;
    const currentDateIdx = dateKeyToIndex.get(dateKey) ?? -1;

    if (currentEmpIdx === -1 || currentDateIdx === -1) return false;

    return currentEmpIdx >= selectionBounds.minEmpIdx &&
        currentEmpIdx <= selectionBounds.maxEmpIdx &&
        currentDateIdx >= selectionBounds.minDateIdx &&
        currentDateIdx <= selectionBounds.maxDateIdx;
}

export function buildAutoFillOperations(
    employees: Employee[],
    prevMonthShifts: Shift[],
    currentMonth: Date,
): BatchShiftOperation[] {
    const operations: BatchShiftOperation[] = [];
    const histShiftsByEmp: Record<string, Shift[]> = {};

    prevMonthShifts.forEach(shift => {
        if (!histShiftsByEmp[shift.employeeId]) histShiftsByEmp[shift.employeeId] = [];
        histShiftsByEmp[shift.employeeId].push(shift);
    });

    const currentMonthStart = startOfMonth(currentMonth);
    const currentMonthEnd = endOfMonth(currentMonth);
    const currentDays = eachDayOfInterval({ start: currentMonthStart, end: currentMonthEnd });

    for (const emp of employees) {
        const empHist = (histShiftsByEmp[emp.id] || []).filter(shift => !shift.isDeleted);
        if (empHist.length === 0) continue;

        const regularHist = empHist
            .filter(shift => shift.type === 'REGULAR')
            .sort((a, b) => b.date.localeCompare(a.date));

        if (regularHist.length === 0) continue;

        const recentShifts = regularHist.slice(0, 5);
        const avgHours = recentShifts.reduce((acc, shift) => acc + shift.hours, 0) / recentShifts.length;
        const isFiveTwo = avgHours < 10;

        if (isFiveTwo) {
            currentDays.forEach(day => {
                const dayOfWeek = day.getDay();
                const dateStr = format(day, 'yyyy-MM-dd');

                if (emp.dismissalDate && dateStr > emp.dismissalDate) return;
                if (dayOfWeek === 0 || dayOfWeek === 6) return;

                operations.push({
                    date: dateStr,
                    employeeId: emp.id,
                    type: 'REGULAR',
                    hours: 8,
                    cabinetClosed: false,
                    centerClosed: false,
                    coefficient: 1.0,
                });
            });
            continue;
        }

        const lastReg = regularHist[0];
        const anchorDate = parseISO(lastReg.date);
        const prevDayKey = format(subDays(anchorDate, 1), 'yyyy-MM-dd');
        const wasDayBeforeReg = empHist.some(shift => {
            const shiftDate = format(parseISO(shift.date), 'yyyy-MM-dd');
            return shiftDate === prevDayKey && shift.type === 'REGULAR';
        });
        const anchorCyclePos = wasDayBeforeReg ? 1 : 0;
        const daysToProject = eachDayOfInterval({
            start: anchorDate,
            end: currentMonthEnd,
        });

        daysToProject.forEach((day, index) => {
            if (index === 0) return;

            const currentCyclePos = (anchorCyclePos + index) % 4;
            const isWorkDay = currentCyclePos === 0 || currentCyclePos === 1;
            const dateStr = format(day, 'yyyy-MM-dd');

            if (day < currentMonthStart || !isWorkDay) return;
            if (emp.dismissalDate && dateStr >= emp.dismissalDate) return;
            if (emp.hireDate && dateStr < emp.hireDate) return;

            operations.push({
                date: dateStr,
                employeeId: emp.id,
                type: 'REGULAR',
                hours: 11,
                cabinetClosed: false,
                centerClosed: false,
                coefficient: 1.0,
            });
        });
    }

    return operations;
}

export function buildFillOperations({
    currentFillSource,
    dateKeyToIndex,
    days,
    employees,
    empIdToIndex,
    range,
    shiftsByEmployee,
}: {
    currentFillSource: SelectionBounds;
    dateKeyToIndex: Map<string, number>;
    days: Date[];
    employees: Employee[];
    empIdToIndex: Map<string, number>;
    range: { empId: string; date: string }[];
    shiftsByEmployee: Record<string, Record<string, Shift>>;
}): Array<BatchShiftOperation | BatchShiftDeleteOperation | null> {
    const patternWidth = currentFillSource.maxDateIdx - currentFillSource.minDateIdx + 1;
    const patternHeight = currentFillSource.maxEmpIdx - currentFillSource.minEmpIdx + 1;

    return range.map(cell => {
        const cellEmpIdx = empIdToIndex.get(cell.empId)!;
        const cellDateIdx = dateKeyToIndex.get(cell.date)!;

        const relEmpIdx = (cellEmpIdx - currentFillSource.minEmpIdx) % patternHeight;
        const relDateIdx = (cellDateIdx - currentFillSource.minDateIdx) % patternWidth;

        const finalEmpIdx = currentFillSource.minEmpIdx + (relEmpIdx < 0 ? relEmpIdx + patternHeight : relEmpIdx);
        const finalDateIdx = currentFillSource.minDateIdx + (relDateIdx < 0 ? relDateIdx + patternWidth : relDateIdx);

        const sourceEmpId = employees[finalEmpIdx].id;
        const sourceDate = format(days[finalDateIdx], 'yyyy-MM-dd');
        const sourceShift = shiftsByEmployee[sourceEmpId]?.[sourceDate];

        const targetEmp = employees[cellEmpIdx];
        if (targetEmp?.dismissalDate && cell.date > targetEmp.dismissalDate) return null;

        if (!sourceShift) {
            const existingShiftId = shiftsByEmployee[cell.empId]?.[cell.date]?.id;
            return existingShiftId ? { id: existingShiftId, delete: true } : null;
        }

        return {
            date: cell.date,
            employeeId: cell.empId,
            type: sourceShift.type,
            hours: sourceShift.hours,
            cabinetClosed: sourceShift.cabinetClosed,
            centerClosed: sourceShift.centerClosed,
            isActingLead: shouldIncludeActingLeadBonus(cell.date) && sourceShift.isActingLead,
            isTrainee: sourceShift.isTrainee,
            coefficient: sourceShift.coefficient,
            id: shiftsByEmployee[cell.empId]?.[cell.date]?.id,
        };
    });
}

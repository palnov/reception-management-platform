import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import type { BatchShiftOperation, CurrentUser, Employee, Shift } from './schedule-types';

export type ScheduleOverviewResponse = {
    currentUser?: CurrentUser | null;
    employees?: Employee[];
    shifts?: Shift[];
    prevMonthShifts?: Shift[];
    monthNorm?: number;
};

export async function readApiError(res: Response, fallback: string): Promise<string> {
    const data = await res.json().catch(() => null);
    return data?.error || fallback;
}

export async function fetchScheduleOverview(month: Date): Promise<Response> {
    return fetch(`/api/schedule/overview?month=${format(month, 'yyyy-MM')}`);
}

export async function parseScheduleOverview(res: Response): Promise<ScheduleOverviewResponse> {
    const data = await res.json();
    return {
        currentUser: data.currentUser || null,
        employees: Array.isArray(data.employees) ? data.employees : [],
        shifts: Array.isArray(data.shifts) ? data.shifts : [],
        prevMonthShifts: Array.isArray(data.prevMonthShifts) ? data.prevMonthShifts : [],
        monthNorm: data.monthNorm || 176,
    };
}

export async function fetchMonthShifts(month: Date): Promise<Shift[]> {
    const start = format(startOfMonth(month), 'yyyy-MM-dd');
    const end = format(endOfMonth(month), 'yyyy-MM-dd');
    const res = await fetch(`/api/shifts?start=${start}&end=${end}`);
    if (!res.ok) throw new Error(`Shifts fetch error: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}

export async function fetchPreviousShifts(month: Date): Promise<Shift[]> {
    const threeMonthsAgo = subMonths(month, 3);
    const start = format(startOfMonth(threeMonthsAgo), 'yyyy-MM-dd');
    const end = format(endOfMonth(subMonths(month, 1)), 'yyyy-MM-dd');
    const res = await fetch(`/api/shifts?start=${start}&end=${end}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}

export async function fetchMonthNorm(month: Date): Promise<number> {
    const res = await fetch(`/api/norms?month=${format(month, 'yyyy-MM')}`);
    if (!res.ok) throw new Error(`Norm fetch error: ${res.status}`);
    const data = await res.json();
    return data && data.hours ? data.hours : 176;
}

export async function saveMonthNorm(month: Date, hours: string): Promise<Response> {
    return fetch('/api/norms', {
        method: 'POST',
        body: JSON.stringify({ month: format(month, 'yyyy-MM'), hours }),
    });
}

export async function saveShift(payload: Record<string, unknown>): Promise<Response> {
    return fetch('/api/shifts', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function deleteShift(id: string): Promise<Response> {
    return fetch(`/api/shifts?id=${id}`, { method: 'DELETE' });
}

export async function saveBatchShifts(operations: BatchShiftOperation[]): Promise<Response> {
    return fetch('/api/shifts/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operations }),
    });
}

export async function deleteBatchShifts(deleteIds: string[]): Promise<Response> {
    return fetch('/api/shifts/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteIds }),
    });
}

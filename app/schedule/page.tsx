
'use client';

import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X, DoorOpen, MapPin, GripVertical, User, Crown, BadgeCheck } from 'lucide-react';
import { InfoTooltip } from '@/components/InfoTooltip';
import { QuickContextMenu } from '@/components/QuickContextMenu';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Employee {
    id: string;
    name: string;
    role: string;
    branch?: string;
    sortOrder: number;
}

interface Shift {
    id: string;
    date: string;
    employeeId: string;
    type: string;
    hours: number;
    cabinetClosed: boolean;
    coefficient: number;
    createdBy?: string;
    auditLogs?: any[];
    isDeleted?: boolean;
}


const BRANCH_CODES: Record<string, string> = {
    'Дзержинского 26': 'ДЗ 26',
    'Дзержинского 45': 'ДЗ 45',
    'Юбилейный (Менякина 1)': 'ЮБ'
};

// --- Sortable Row Component ---
const SortableEmployeeRow = memo(function SortableEmployeeRow({
    emp,
    days,
    empShifts,
    openModal,
    selection,
    onMouseDown,
    onMouseEnter,
    onContextMenu,
    isInSelection,
    currentUser
}: {
    emp: Employee,
    days: Date[],
    empShifts: Record<string, Shift>, // Map of ISO Date String -> Shift
    openModal: (date: Date, empId: string, shift?: Shift) => void,
    selection: any,
    onMouseDown: (empId: string, dateKey: string) => void,
    onMouseEnter: (empId: string, dateKey: string) => void,
    onContextMenu: (e: React.MouseEvent, empId: string, dateKey: string, shift?: Shift) => void,
    isInSelection: (empId: string, dateKey: string) => boolean,
    currentUser: any // Typed as Employee or similar
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: emp.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 'auto',
    };

    return (
        <tr ref={setNodeRef} style={style} className="hover:bg-zinc-50 group border-b border-zinc-200">
            <td className="sticky left-0 bg-white group-hover:bg-zinc-50 z-10 border-r border-zinc-200 p-3 font-medium text-zinc-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] transition-colors">
                <div className="flex items-center gap-2">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing p-1 hover:bg-zinc-100 rounded text-zinc-400 group-hover:text-zinc-600 transition-colors"
                    >
                        <GripVertical className="w-4 h-4" />
                    </div>

                    <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center ${emp.role === 'MANAGER' ? 'bg-purple-100 text-purple-600' :
                                emp.role === 'SENIOR' ? 'bg-amber-100 text-amber-600' :
                                    'bg-zinc-100 text-zinc-500'
                                }`}>
                                {emp.role === 'MANAGER' ? (
                                    <Crown className="w-3 h-3" />
                                ) : emp.role === 'SENIOR' ? (
                                    <BadgeCheck className="w-3 h-3" />
                                ) : (
                                    <User className="w-3 h-3" />
                                )}
                            </div>
                            <span className="truncate">{emp.name}</span>
                        </div>
                        {emp.branch && (
                            <div className="text-[10px] text-zinc-400 pl-7">
                                {BRANCH_CODES[emp.branch] || emp.branch}
                            </div>
                        )}
                    </div>
                </div>
            </td>
            {days.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const shift = empShifts[dateKey];
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const isSelected = isInSelection(emp.id, dateKey);

                let bgClass = '';
                let textClass = '';

                if (shift) {
                    if (shift.type === 'SICK') { bgClass = 'bg-red-100'; textClass = 'text-red-900'; }
                    else if (shift.type === 'DAY_OFF_WORK') { bgClass = 'bg-amber-100'; textClass = 'text-amber-900'; }
                    else if (shift.type === 'VACATION') { bgClass = 'bg-green-100'; textClass = 'text-green-900'; }
                    else { bgClass = 'bg-blue-100'; textClass = 'text-blue-900'; }
                } else if (isWeekend) {
                    bgClass = 'bg-red-50/20'; // More distinct weekend background
                }

                return (
                    <td
                        key={dateKey}
                        className={`border-r border-zinc-200 text-center cursor-pointer transition-all relative h-12 w-11 p-0 select-none
                            ${shift && !shift.isDeleted ? bgClass : (isWeekend ? 'bg-red-50/20' : '')}
                            ${shift && !shift.isDeleted ? textClass : ''}
                            ${!shift || shift.isDeleted ? 'hover:bg-blue-50' : 'hover:brightness-95'}
                            ${isSelected ? 'ring-2 ring-blue-500 ring-inset z-20 bg-blue-500/10' : ''}
                        `}
                        onMouseDown={(e) => {
                            if ((e.target as HTMLElement).closest('[data-audit-ignore="true"]')) return;
                            if (e.button === 0) onMouseDown(emp.id, dateKey);
                        }}
                        onMouseEnter={() => onMouseEnter(emp.id, dateKey)}
                        onContextMenu={(e) => {
                            if ((e.target as HTMLElement).closest('[data-audit-ignore="true"]')) return;
                            onContextMenu(e, emp.id, dateKey, shift);
                        }}
                    >
                        {/* If shift exists and NOT deleted, render normal content */}
                        {shift && !shift.isDeleted && (
                            <div className="relative h-full w-full flex items-center justify-center leading-none">
                                {shift.auditLogs && shift.auditLogs.length > 0 && (
                                    <InfoTooltip
                                        logs={shift.auditLogs}
                                        currentUser={currentUser}
                                        createdBy={shift.createdBy}
                                    />
                                )}

                                {/* Door icon - top left corner */}
                                {shift.cabinetClosed && (
                                    <div className="absolute top-0.5 left-0.5">
                                        <DoorOpen className="w-2.5 h-2.5 opacity-40 text-zinc-600" />
                                    </div>
                                )}

                                {/* Hours number - centered */}
                                <span className="font-bold text-sm">
                                    {shift.type === 'SICK' ? 'Б' : (shift.type === 'VACATION' ? 'O' : shift.hours)}
                                </span>

                                {/* Coefficient - bottom center */}
                                {shift.coefficient > 1 && (
                                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2">
                                        <span className="text-[9px] bg-white/50 px-0.5 rounded">x{shift.coefficient}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* If shift is DELETED, render ONLY audit icon if applicable */}
                        {shift && shift.isDeleted && shift.auditLogs && shift.auditLogs.length > 0 && (
                            <div className="relative h-full w-full flex items-center justify-center pointer-events-none">
                                {/* pointer-events-none on container so clicks pass through to TD, but InfoTooltip has pointers-events-auto */}
                                <div className="pointer-events-auto">
                                    <InfoTooltip
                                        logs={shift.auditLogs}
                                        currentUser={currentUser}
                                        createdBy={shift.createdBy}
                                    />
                                </div>
                            </div>
                        )}
                    </td>
                )
            })}
        </tr>
    );
});

// --- Main Page Component ---
export default function SchedulePage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Norm Hours State
    const [monthNorm, setMonthNorm] = useState<number>(176);
    const [showNormModal, setShowNormModal] = useState(false);
    const [tempNorm, setTempNorm] = useState<string>('176');

    // Form state
    const [formData, setFormData] = useState({
        type: 'REGULAR',
        hours: '11',
        cabinetClosed: false,
        coefficient: '1.0'
    });

    // Selection State
    const [selection, setSelection] = useState<{
        start: { empId: string, date: string, shift?: Shift },
        end: { empId: string, date: string }
    } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        empId: string;
        dateKey: string;
        shift?: Shift;
    } | null>(null);

    // Track whether audit icon was clicked to prevent modal
    const auditIconClickedRef = useRef(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        fetchEmployees();
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => setCurrentUser(data))
            .catch(console.error);
    }, []);

    useEffect(() => {
        fetchShifts();
        fetchNorm();
    }, [currentMonth]);

    async function fetchEmployees() {
        try {
            const res = await fetch('/api/employees');
            const data = await res.json();
            const list = Array.isArray(data) ? data : [];
            setEmployees(list.filter(e => e.role !== 'MANAGER'));
        } catch (e) { console.error(e); }
    }

    async function fetchShifts() {
        try {
            const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
            const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
            const res = await fetch(`/api/shifts?start=${start}&end=${end}`);
            if (!res.ok) {
                console.error('Shifts fetch error:', res.status);
                return;
            }
            const data = await res.json();
            setShifts(Array.isArray(data) ? data : []);
        } catch (e) { console.error('SCHEDULE_FETCH_SHIFTS_ERROR:', e); }
    }

    async function fetchNorm() {
        try {
            const m = format(currentMonth, 'yyyy-MM');
            const res = await fetch(`/api/norms?month=${m}`);
            if (!res.ok) {
                console.error('Norm fetch error:', res.status);
                return;
            }
            const data = await res.json();
            if (data && data.hours) {
                setMonthNorm(data.hours);
                setTempNorm(data.hours.toString());
            } else {
                setMonthNorm(176); // fallback default
                setTempNorm('176');
            }
        } catch (e) { console.error('SCHEDULE_FETCH_NORM_ERROR:', e); }
    }

    async function handleSaveNorm() {
        try {
            const m = format(currentMonth, 'yyyy-MM');
            const res = await fetch('/api/norms', {
                method: 'POST',
                body: JSON.stringify({ month: m, hours: tempNorm })
            });
            if (res.ok) {
                setMonthNorm(parseFloat(tempNorm));
                setShowNormModal(false);
            }
        } catch (e) { console.error(e); }
    }

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setEmployees((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newArray = arrayMove(items, oldIndex, newIndex);

                // Sync with database
                const updatedEmployees = newArray.map((emp, i) => ({
                    id: emp.id,
                    sortOrder: i
                }));

                fetch('/api/employees', {
                    method: 'PATCH',
                    body: JSON.stringify({ employees: updatedEmployees })
                });

                return newArray;
            });
        }
    }, []);

    const openModal = useCallback((date: Date, empId: string, existingShift?: Shift) => {
        setSelectedDate(date);
        setSelectedEmployeeId(empId);
        if (existingShift) {
            setFormData({
                type: existingShift.type,
                hours: existingShift.hours.toString(),
                cabinetClosed: existingShift.cabinetClosed,
                coefficient: (existingShift.coefficient || 1.0).toString()
            });
        } else {
            setFormData({
                type: 'REGULAR',
                hours: '11',
                cabinetClosed: false,
                coefficient: '1.0'
            });
        }
        setShowModal(true);
    }, []);

    const handleSaveShift = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !selectedEmployeeId) return;

        const existingShift = shifts.find(s =>
            s.employeeId === selectedEmployeeId &&
            format(parseISO(s.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
        );

        await fetch('/api/shifts', {
            method: 'POST',
            body: JSON.stringify({
                id: existingShift?.id,
                date: format(selectedDate, 'yyyy-MM-dd'),
                employeeId: selectedEmployeeId,
                ...formData,
                coefficient: Math.min(parseFloat(formData.coefficient || '1.0'), 1.5).toString()
            }),
        });
        setShowModal(false);
        fetchShifts();
    };

    const handleDeleteShift = async () => {
        if (!selectedDate || !selectedEmployeeId) return;
        const existingShift = shifts.find(s =>
            s.employeeId === selectedEmployeeId &&
            format(parseISO(s.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
        );

        if (existingShift) {
            await fetch(`/api/shifts?id=${existingShift.id}`, { method: 'DELETE' });
            setShowModal(false);
            fetchShifts();
        }
    };

    const days = useMemo(() => eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    }), [currentMonth]);

    // --- Optimization: Memoized Lookups ---
    const empIdToIndex = useMemo(() => {
        const map = new Map<string, number>();
        employees.forEach((e, i) => map.set(e.id, i));
        return map;
    }, [employees]);

    const dateKeyToIndex = useMemo(() => {
        const map = new Map<string, number>();
        days.forEach((d, i) => map.set(format(d, 'yyyy-MM-dd'), i));
        return map;
    }, [days]);

    // Selection Bounds Memo
    const selectionBounds = useMemo(() => {
        if (!selection) return null;
        const startEmpIdx = empIdToIndex.get(selection.start.empId) ?? -1;
        const endEmpIdx = empIdToIndex.get(selection.end.empId) ?? -1;
        const startDateIdx = dateKeyToIndex.get(selection.start.date) ?? -1;
        const endDateIdx = dateKeyToIndex.get(selection.end.date) ?? -1;

        if (startEmpIdx === -1 || endEmpIdx === -1 || startDateIdx === -1 || endDateIdx === -1) return null;

        return {
            minEmpIdx: Math.min(startEmpIdx, endEmpIdx),
            maxEmpIdx: Math.max(startEmpIdx, endEmpIdx),
            minDateIdx: Math.min(startDateIdx, endDateIdx),
            maxDateIdx: Math.max(startDateIdx, endDateIdx)
        };
    }, [selection, empIdToIndex, dateKeyToIndex]);

    // Helper to get all cells in a selection rectangle
    const getSelectedRange = useCallback((sel: NonNullable<typeof selection>) => {
        const startEmpIdx = empIdToIndex.get(sel.start.empId) ?? 0;
        const endEmpIdx = empIdToIndex.get(sel.end.empId) ?? 0;
        const minEmpIdx = Math.min(startEmpIdx, endEmpIdx);
        const maxEmpIdx = Math.max(startEmpIdx, endEmpIdx);

        const startDateIdx = dateKeyToIndex.get(sel.start.date) ?? 0;
        const endDateIdx = dateKeyToIndex.get(sel.end.date) ?? 0;
        const minDateIdx = Math.min(startDateIdx, endDateIdx);
        const maxDateIdx = Math.max(startDateIdx, endDateIdx);

        const dateStrs = days.map(d => format(d, 'yyyy-MM-dd'));
        const range: { empId: string, date: string }[] = [];
        for (let i = minEmpIdx; i <= maxEmpIdx; i++) {
            const empId = employees[i].id;
            for (let j = minDateIdx; j <= maxDateIdx; j++) {
                range.push({ empId, date: dateStrs[j] });
            }
        }
        return range;
    }, [employees, days, empIdToIndex, dateKeyToIndex]);

    // Group shifts for O(1) lookup
    const shiftsByEmployee = useMemo(() => {
        const grouped: Record<string, Record<string, Shift>> = {};
        shifts.forEach(s => {
            if (!grouped[s.employeeId]) grouped[s.employeeId] = {};
            const key = format(parseISO(s.date), 'yyyy-MM-dd');
            grouped[s.employeeId][key] = s;
        });
        return grouped;
    }, [shifts]);

    const handleBatchSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selection) return;

        const range = getSelectedRange(selection);
        const operations = range.map(cell => ({
            date: cell.date,
            employeeId: cell.empId,
            ...formData,
            id: shiftsByEmployee[cell.empId]?.[cell.date]?.id
        }));

        const res = await fetch('/api/shifts/batch', {
            method: 'POST',
            body: JSON.stringify({
                operations: operations.map(op => ({
                    ...op,
                    coefficient: Math.min(parseFloat(formData.coefficient || '1.0'), 1.5).toString()
                }))
            })
        });

        if (!res.ok) {
            const err = await res.json();
            console.error('Batch save failed:', err);
            alert('Ошибка при сохранении: ' + (err.error || 'Unknown error'));
        }

        setShowBatchModal(false);
        setSelection(null);
        fetchShifts();
    };

    // Optimized selection helper
    const isInSelection = useCallback((empId: string, dateKey: string) => {
        if (!selectionBounds) return false;

        const currentEmpIdx = empIdToIndex.get(empId) ?? -1;
        const currentDateIdx = dateKeyToIndex.get(dateKey) ?? -1;

        if (currentEmpIdx === -1 || currentDateIdx === -1) return false;

        return currentEmpIdx >= selectionBounds.minEmpIdx &&
            currentEmpIdx <= selectionBounds.maxEmpIdx &&
            currentDateIdx >= selectionBounds.minDateIdx &&
            currentDateIdx <= selectionBounds.maxDateIdx;
    }, [selectionBounds, empIdToIndex, dateKeyToIndex]);

    // Mouse Handlers for Selection
    const handleMouseDown = useCallback((empId: string, date: string) => {
        const sourceShift = shiftsByEmployee[empId]?.[date];
        setSelection({
            start: { empId, date, shift: sourceShift },
            end: { empId, date }
        });
        setIsDragging(true);
    }, [shiftsByEmployee]);

    const handleMouseEnter = useCallback((empId: string, date: string) => {
        if (!isDragging) return;
        setSelection(prev => prev ? { ...prev, end: { empId, date } } : null);
    }, [isDragging]);

    const handleMouseUp = useCallback(async () => {
        if (!isDragging || !selection) {
            setIsDragging(false);
            return;
        }

        const { start, end } = selection;
        const isSingleCell = start.empId === end.empId && start.date === end.date;

        if (isSingleCell) {
            openModal(parseISO(start.date), start.empId, start.shift);
            setSelection(null);
        } else {
            // Range selected
            const range = getSelectedRange(selection);

            if (start.shift) {
                // Drag-to-fill: Copy source shift to any range (now includes OVERWRITING)
                const operations = range.map(cell => ({
                    date: cell.date,
                    employeeId: cell.empId,
                    type: start.shift!.type,
                    hours: start.shift!.hours,
                    cabinetClosed: start.shift!.cabinetClosed,
                    coefficient: start.shift!.coefficient,
                    id: shiftsByEmployee[cell.empId]?.[cell.date]?.id
                }));

                await fetch('/api/shifts/batch', {
                    method: 'POST',
                    body: JSON.stringify({
                        operations: operations.map(op => ({
                            ...op,
                            coefficient: Math.min(parseFloat(op.coefficient.toString() || '1.0'), 1.5).toString()
                        }))
                    })
                });
                setSelection(null);
                fetchShifts();
            } else if (!start.shift) {
                // Check if any cell in the range has data. If yes, just select. If no, show batch modal.
                const anyData = range.some(cell => shiftsByEmployee[cell.empId]?.[cell.date]);
                if (!anyData) {
                    setShowBatchModal(true);
                }
            }
        }

        setIsDragging(false);
    }, [isDragging, selection, openModal, shiftsByEmployee, getSelectedRange, fetchShifts]);

    const handleKeyDown = useCallback(async (e: KeyboardEvent) => {
        if (!selection || isDragging) return;

        if (e.key === 'Delete' || e.key === 'Backspace') {
            const range = getSelectedRange(selection);
            const deleteIds = range
                .map(cell => shiftsByEmployee[cell.empId]?.[cell.date]?.id)
                .filter(Boolean) as string[];

            if (deleteIds.length > 0) {
                const res = await fetch('/api/shifts/batch', {
                    method: 'POST',
                    body: JSON.stringify({ deleteIds })
                });
                if (!res.ok) {
                    const err = await res.json();
                    console.error('Batch delete failed:', err);
                }
                fetchShifts();
            }
            setSelection(null);
        } else if (e.key === 'Escape') {
            setSelection(null);
        }
    }, [selection, isDragging, getSelectedRange, shiftsByEmployee, fetchShifts]);

    const handleContextMenu = useCallback((e: React.MouseEvent, empId: string, dateKey: string, shift?: Shift) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            empId,
            dateKey,
            shift
        });
    }, []);

    const handleQuickAction = useCallback(async (action: 'SICK' | 'VACATION' | 'DELETE') => {
        if (!contextMenu) return;
        const { empId, dateKey, shift } = contextMenu;
        setContextMenu(null);

        if (action === 'DELETE') {
            if (shift?.id) {
                await fetch(`/api/shifts?id=${shift.id}`, {
                    method: 'DELETE'
                });
                fetchShifts();
            }
            return;
        }

        const payload = {
            date: dateKey,
            employeeId: empId,
            type: action,
            hours: 11, // Standard default for quick status
            cabinetClosed: false,
            coefficient: 1.0,
            id: shift?.id
        };

        await fetch('/api/shifts', {
            method: 'POST',
            body: JSON.stringify({
                ...payload,
                coefficient: Math.min(parseFloat(payload.coefficient.toString() || '1.0'), 1.5)
            })
        });
        fetchShifts();
    }, [contextMenu, fetchShifts]);

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleMouseUp, handleKeyDown]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">График смен</h1>
                    <div
                        className="flex items-center gap-2 mt-2 text-sm text-zinc-500 cursor-pointer hover:text-blue-600 transition-colors group"
                        onClick={() => setShowNormModal(true)}
                    >
                        <span>Норма часов в этом месяце: </span>
                        <span className="font-bold text-zinc-900 group-hover:text-blue-600">{monthNorm}</span>
                        <div className="px-1.5 py-0.5 rounded bg-zinc-100 text-[10px] font-bold uppercase tracking-wider">Изм.</div>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-white p-1 rounded-full border border-zinc-200 shadow-sm border-zinc-200/60">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-zinc-600" /></button>
                    <span className="text-lg font-semibold w-40 text-center text-zinc-800 capitalize">{format(currentMonth, 'LLLL yyyy', { locale: ru })}</span>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-zinc-600" /></button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-zinc-200/60 overflow-x-auto flex-1 pb-4 relative">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <table className="w-full text-xs text-left border-collapse min-w-[1240px]">
                        <thead>
                            <tr className="bg-zinc-50/50">
                                <th className="sticky left-0 bg-zinc-50 z-20 border-b border-r border-zinc-200 p-3 min-w-[240px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    <span className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">Сотрудник</span>
                                </th>
                                {days.map(day => {
                                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                                    const isToday = isSameDay(day, new Date());
                                    const dateKey = format(day, 'yyyy-MM-dd');
                                    return (
                                        <th key={dateKey} className={`border-b border-r border-zinc-200 p-2 text-center min-w-[44px] ${isWeekend ? 'bg-red-50 text-red-600' : 'bg-transparent text-zinc-700'} ${isToday ? 'bg-blue-50 text-blue-600' : ''}`}>
                                            <div className="font-bold text-xs">{format(day, 'd')}</div>
                                            <div className="text-[9px] uppercase font-medium opacity-60">{format(day, 'EEEEEE', { locale: ru })}</div>
                                        </th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            <SortableContext
                                items={employees.map((emp) => emp.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {employees.map((emp) => (
                                    <SortableEmployeeRow
                                        key={emp.id}
                                        emp={emp}
                                        days={days}
                                        empShifts={shiftsByEmployee[emp.id] || {}}
                                        openModal={openModal}
                                        selection={selection}
                                        onMouseDown={handleMouseDown}
                                        onMouseEnter={handleMouseEnter}
                                        isInSelection={isInSelection}
                                        currentUser={currentUser}
                                        onContextMenu={handleContextMenu}
                                    />
                                ))}
                            </SortableContext>
                            {employees.length === 0 && (
                                <tr><td colSpan={days.length + 1} className="p-12 text-center text-zinc-400 italic">Сотрудники не найдены...</td></tr>
                            )}
                        </tbody>
                    </table>
                </DndContext>
            </div>

            {/* Norm Edit Modal */}
            {showNormModal && (
                <div
                    className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowNormModal(false);
                    }}
                >
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4">Установить норму часов</h2>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-zinc-500 mb-2">Норма для {format(currentMonth, 'LLLL yyyy', { locale: ru })}</label>
                            <input
                                type="number"
                                value={tempNorm}
                                onChange={(e) => setTempNorm(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-zinc-100 rounded-xl focus:border-blue-500 outline-none font-bold"
                            />
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setShowNormModal(false)} className="flex-1 py-3 border-2 border-zinc-100 rounded-xl font-bold hover:bg-zinc-50 transition-colors">Отмена</button>
                            <button onClick={handleSaveNorm} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">Сохранить</button>
                        </div>
                    </div>
                </div>
            )}

            {showModal && selectedDate && (
                <div
                    className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowModal(false);
                    }}
                >
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-zinc-900">Смена</h2>
                                <div className="text-zinc-500 font-medium mt-1">
                                    {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                                    {selectedEmployeeId && (
                                        <div className="text-blue-600 text-sm font-semibold">
                                            {employees.find(e => e.id === selectedEmployeeId)?.name}
                                        </div>
                                    )}
                                </div>
                                {(() => {
                                    const s = shifts.find(s =>
                                        s.employeeId === selectedEmployeeId &&
                                        format(parseISO(s.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                                    );

                                    // Find the real creator from audit logs (first CREATE action)
                                    const createLog = s?.auditLogs?.find((log: any) => log.action === 'CREATE');
                                    const actualCreator = createLog?.changedBy || s?.createdBy;

                                    return actualCreator ? (
                                        <div className="mt-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 inline-block px-2 py-1 rounded-md border border-zinc-200">
                                            Автор: {actualCreator}
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-zinc-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveShift} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-2">Тип смены</label>
                                <select
                                    value={formData.type}
                                    onChange={e => {
                                        const newType = e.target.value;
                                        setFormData(prev => ({
                                            ...prev,
                                            type: newType,
                                            hours: newType === 'DAY_OFF_WORK' ? '11' : prev.hours
                                        }));
                                    }}
                                    className="w-full px-4 py-3 border-2 border-zinc-100 rounded-xl focus:border-blue-500 outline-none bg-zinc-50/50 font-medium transition-all"
                                >
                                    <option value="REGULAR">Обычная смена</option>
                                    <option value="DAY_OFF_WORK">Работа в выходной</option>
                                    <option value="SICK">Больничный</option>
                                    <option value="VACATION">Отпуск</option>
                                </select>
                            </div>

                            {formData.type !== 'SICK' && formData.type !== 'VACATION' && (
                                <>
                                    <div className={`grid ${formData.type === 'DAY_OFF_WORK' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                                        <div>
                                            <label className="block text-sm font-bold text-zinc-700 mb-2">Часы</label>
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={formData.hours}
                                                onChange={e => setFormData({ ...formData, hours: e.target.value })}
                                                className="w-full px-4 py-3 border-2 border-zinc-100 rounded-xl focus:border-blue-500 outline-none bg-zinc-50/50 font-medium transition-all"
                                            />
                                        </div>
                                        {formData.type !== 'DAY_OFF_WORK' && (
                                            <div>
                                                <label className="block text-sm font-bold text-zinc-700 mb-2">Коэф.</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="1.0"
                                                    max="1.5"
                                                    value={formData.coefficient}
                                                    onChange={e => setFormData({ ...formData, coefficient: e.target.value })}
                                                    className="w-full px-4 py-3 border-2 border-zinc-100 rounded-xl focus:border-blue-500 outline-none bg-zinc-50/50 font-medium transition-all"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center p-4 bg-zinc-50 rounded-2xl border-2 border-zinc-100 cursor-pointer hover:border-blue-100 transition-all" onClick={() => setFormData({ ...formData, cabinetClosed: !formData.cabinetClosed })}>
                                        <input
                                            type="checkbox"
                                            id="cabinet"
                                            checked={formData.cabinetClosed}
                                            onChange={e => setFormData({ ...formData, cabinetClosed: e.target.checked })}
                                            className="w-6 h-6 text-blue-600 rounded-lg focus:ring-blue-500 border-zinc-300 transition-all"
                                        />
                                        <label htmlFor="cabinet" className="text-sm font-bold text-zinc-700 ml-3 cursor-pointer select-none flex items-center gap-2">
                                            <DoorOpen className="w-4 h-4 text-zinc-400" />
                                            Закрытие кабинетов (+250 ₽)
                                        </label>
                                    </div>
                                </>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleDeleteShift}
                                    className="px-6 py-3 border-2 border-red-50 rounded-xl text-red-500 bg-red-50/50 hover:bg-red-50 hover:border-red-100 transition-all font-bold"
                                >
                                    Удалить
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-200 font-bold"
                                >
                                    Сохранить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Batch Action Modal */}
            {showBatchModal && (
                <div
                    className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowBatchModal(false);
                    }}
                >
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-zinc-900">Массовое действие</h2>
                            <button onClick={() => setShowBatchModal(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-zinc-400" />
                            </button>
                        </div>
                        <form onSubmit={handleBatchSave} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-2">Тип смен</label>
                                <select
                                    value={formData.type}
                                    onChange={e => {
                                        const newType = e.target.value;
                                        setFormData(prev => ({
                                            ...prev,
                                            type: newType,
                                            hours: newType === 'DAY_OFF_WORK' ? '11' : prev.hours
                                        }));
                                    }}
                                    className="w-full px-4 py-3 border-2 border-zinc-100 rounded-xl focus:border-blue-500 outline-none bg-zinc-50/50 font-medium transition-all"
                                >
                                    <option value="REGULAR">Обычная смена</option>
                                    <option value="DAY_OFF_WORK">Работа в выходной</option>
                                    <option value="SICK">Больничный</option>
                                    <option value="VACATION">Отпуск</option>
                                </select>
                            </div>

                            {formData.type !== 'SICK' && formData.type !== 'VACATION' && (
                                <div className={`grid ${formData.type === 'DAY_OFF_WORK' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-700 mb-2">Часы</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={formData.hours}
                                            onChange={e => setFormData({ ...formData, hours: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-zinc-100 rounded-xl focus:border-blue-500 outline-none bg-zinc-50/50 font-medium transition-all"
                                        />
                                    </div>
                                    {formData.type !== 'DAY_OFF_WORK' && (
                                        <div>
                                            <label className="block text-sm font-bold text-zinc-700 mb-2">Коэф.</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="1.0"
                                                max="1.5"
                                                value={formData.coefficient}
                                                onChange={e => setFormData({ ...formData, coefficient: e.target.value })}
                                                className="w-full px-4 py-3 border-2 border-zinc-100 rounded-xl focus:border-blue-500 outline-none bg-zinc-50/50 font-medium transition-all"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-200 font-bold"
                            >
                                Применить ко всем
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {contextMenu && (
                <QuickContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    onAction={handleQuickAction}
                />
            )}
        </div>
    );
}

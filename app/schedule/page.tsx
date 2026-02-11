'use client';

import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X, DoorOpen, MapPin, GripVertical, User, Crown, BadgeCheck, Clock, Briefcase, CheckSquare, Activity, LayoutList, Timer, Percent, Layers } from 'lucide-react';
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
    centerClosed: boolean;
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

// --- Selection Overlay Component ---
const SelectionOverlay = memo(function SelectionOverlay({
    bounds,
    tableRef,
    containerRef,
    onFillStart
}: {
    bounds: { minEmpIdx: number, maxEmpIdx: number, minDateIdx: number, maxDateIdx: number } | null,
    tableRef: React.RefObject<HTMLTableSectionElement | null>,
    containerRef: React.RefObject<HTMLDivElement | null>,
    onFillStart: (e: React.MouseEvent) => void
}) {
    if (!bounds || !tableRef.current || !containerRef.current) return null;

    const tbody = tableRef.current;
    const container = containerRef.current;
    const rows = tbody.querySelectorAll('tr');
    if (!rows.length) return null;

    const startRow = rows[bounds.minEmpIdx];
    const endRow = rows[bounds.maxEmpIdx];
    if (!startRow || !endRow) return null;

    const startCell = startRow.querySelectorAll('td')[bounds.minDateIdx + 1]; // +1 for sticky name column
    const endCell = endRow.querySelectorAll('td')[bounds.maxDateIdx + 1];
    if (!startCell || !endCell) return null;

    const containerRect = container.getBoundingClientRect();
    const startRect = startCell.getBoundingClientRect();
    const endRect = endCell.getBoundingClientRect();

    const top = startRect.top - containerRect.top + container.scrollTop - 1;
    const left = startRect.left - containerRect.left + container.scrollLeft - 1;
    const width = endRect.right - startRect.left + 1;
    const height = endRect.bottom - startRect.top + 1;

    return (
        <div
            className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none z-50"
            style={{
                top,
                left,
                width,
                height
            }}
        >
            <div
                className="absolute -bottom-[5px] -right-[5px] w-2.5 h-2.5 bg-blue-500 border border-white pointer-events-none shadow-sm z-[60]"
            />
        </div>
    );
});

async function getEmployees() {
    const response = await fetch('/api/employees');
    if (!response.ok) throw new Error('Failed to fetch employees');
    return response.json();
}

// --- Sortable Row Component ---
const SortableEmployeeRow = memo(function SortableEmployeeRow({
    emp,
    days,
    empShifts,
    openModal,
    onMouseDown,
    onMouseEnter,
    onContextMenu,
    onHandleHover,
    onHandleMouseDown,
    handleCell,
    selection,
    isInSelection,
    currentUser
}: {
    emp: Employee,
    days: Date[],
    empShifts: Record<string, Shift>, // Map of ISO Date String -> Shift
    openModal: (date: Date, empId: string, shift?: Shift) => void,
    onMouseDown: (e: React.MouseEvent, empId: string, dateKey: string) => void,
    onMouseEnter: (empId: string, dateKey: string) => void,
    onContextMenu: (e: React.MouseEvent, empId: string, dateKey: string, shift?: Shift) => void,
    onHandleHover: (empId: string | null, dateKey: string | null) => void,
    onHandleMouseDown: (e: React.MouseEvent) => void,
    handleCell: { empId: string, dateKey: string } | null,
    selection: any,
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
                        className={`border-r border-zinc-200 text-center cursor-pointer relative h-12 w-11 p-0 select-none transition-all
                            ${shift && !shift.isDeleted ? bgClass : (isWeekend ? 'bg-red-50/30' : '')}
                            ${shift && !shift.isDeleted ? textClass : ''}
                            ${!shift || shift.isDeleted ? 'hover:bg-blue-50/50' : 'hover:brightness-95'}
                            ${day.getDay() === 6 ? 'border-l-2 border-zinc-400' : ''}
                            ${day.getDay() === 0 ? 'border-r-2 border-zinc-400' : ''}
                            ${(handleCell?.empId === emp.id && handleCell?.dateKey === dateKey) ||
                                (selection && isInSelection(emp.id, dateKey)) ? 'z-30' : ''}
                        `}
                        onMouseDown={(e) => {
                            if ((e.target as HTMLElement).closest('[data-audit-ignore="true"]')) return;
                            if (e.button === 0) onMouseDown(e, emp.id, dateKey);
                        }}
                        onMouseEnter={() => onMouseEnter(emp.id, dateKey)}
                        onContextMenu={(e) => {
                            if ((e.target as HTMLElement).closest('[data-audit-ignore="true"]')) return;
                            onContextMenu(e, emp.id, dateKey, shift);
                        }}
                    >
                        {/* Hover handle trigger (bottom-right corner) - Exactly matches visual handle position */}
                        <div
                            className="absolute -bottom-[5px] -right-[5px] w-2.5 h-2.5 z-40 cursor-crosshair"
                            onMouseEnter={() => onHandleHover(emp.id, dateKey)}
                            onMouseLeave={() => onHandleHover(null, null)}
                            onMouseDown={onHandleMouseDown}
                        />
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

                                {/* Door icons */}
                                <div className="absolute top-0.5 left-0.5 flex flex-col gap-0.5">
                                    {shift.cabinetClosed && (
                                        <DoorOpen className="w-2.5 h-2.5 opacity-40 text-zinc-600" />
                                    )}
                                    {shift.centerClosed && (
                                        <DoorOpen className="w-2.5 h-2.5 opacity-60 text-emerald-600" />
                                    )}
                                </div>

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
        centerClosed: false,
        coefficient: '1.0'
    });

    // Selection State
    const [selection, setSelection] = useState<{
        start: { empId: string, date: string, shift?: Shift },
        end: { empId: string, date: string }
    } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isFilling, setIsFilling] = useState(false);
    const [fillSource, setFillSource] = useState<{ minEmpIdx: number, maxEmpIdx: number, minDateIdx: number, maxDateIdx: number } | null>(null);
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [handleCell, setHandleCell] = useState<{ empId: string, dateKey: string } | null>(null);
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        empId: string;
        dateKey: string;
        shift?: Shift;
        showBatchOption?: boolean;
    } | null>(null);

    // Track whether audit icon was clicked to prevent modal
    const auditIconClickedRef = useRef(false);
    const tableBodyRef = useRef<HTMLTableSectionElement>(null);
    const gridContainerRef = useRef<HTMLDivElement>(null);
    const blockModalRef = useRef(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 1, // Minimum 1px move to start drag, avoiding accidental drag on click
            },
        }),
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
                cabinetClosed: !!existingShift.cabinetClosed,
                centerClosed: !!existingShift.centerClosed,
                coefficient: (existingShift.coefficient || 1.0).toString()
            });
        } else {
            setFormData({
                type: 'REGULAR',
                hours: '11',
                cabinetClosed: false,
                centerClosed: false,
                coefficient: '1.0'
            });
        }
        setShowModal(true);
    }, []);

    const handleSaveShift = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
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
        const active = selection || (handleCell ? {
            start: { empId: handleCell.empId, date: handleCell.dateKey },
            end: { empId: handleCell.empId, date: handleCell.dateKey }
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
            maxDateIdx: Math.max(startDateIdx, endDateIdx)
        };
    }, [selection, handleCell, empIdToIndex, dateKeyToIndex]);

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

    const handleBatchSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
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

    const handleBatchDelete = async () => {
        if (!selection) return;
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
        }
        setShowBatchModal(false);
        setSelection(null);
        fetchShifts();
    };

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

    const handleMouseDown = useCallback((e: React.MouseEvent, empId: string, date: string) => {
        e.preventDefault();
        const sourceShift = shiftsByEmployee[empId]?.[date];

        const isRange = selection && (selection.start.empId !== selection.end.empId || selection.start.date !== selection.end.date);
        if (isRange || contextMenu) {
            blockModalRef.current = true;
        }

        if (contextMenu) setContextMenu(null);

        setSelection({
            start: { empId, date, shift: sourceShift },
            end: { empId, date }
        });
        setIsDragging(true);
        setIsFilling(false);
        setHandleCell(null);
    }, [shiftsByEmployee, selection, contextMenu]);

    const handleMouseEnter = useCallback((empId: string, date: string) => {
        if (!isDragging && !isFilling) return;
        setSelection(prev => prev ? { ...prev, end: { empId, date } } : null);
    }, [isDragging, isFilling]);

    const handleMouseUp = useCallback(async () => {
        if (!isDragging && !isFilling) {
            return;
        }

        const currentSelection = selection;
        const wasFilling = isFilling;
        const currentFillSource = fillSource;

        setIsDragging(false);
        setIsFilling(false);
        setFillSource(null);

        if (!currentSelection) return;

        const { start, end } = currentSelection;
        const isSingleCell = start.empId === end.empId && start.date === end.date;

        if (wasFilling && currentFillSource) {
            const range = getSelectedRange(currentSelection);

            const patternWidth = currentFillSource.maxDateIdx - currentFillSource.minDateIdx + 1;
            const patternHeight = currentFillSource.maxEmpIdx - currentFillSource.minEmpIdx + 1;

            const operations = range.map(cell => {
                const cellEmpIdx = empIdToIndex.get(cell.empId)!;
                const cellDateIdx = dateKeyToIndex.get(cell.date)!;

                const relEmpIdx = (cellEmpIdx - currentFillSource.minEmpIdx) % patternHeight;
                const relDateIdx = (cellDateIdx - currentFillSource.minDateIdx) % patternWidth;

                const finalEmpIdx = currentFillSource.minEmpIdx + (relEmpIdx < 0 ? relEmpIdx + patternHeight : relEmpIdx);
                const finalDateIdx = currentFillSource.minDateIdx + (relDateIdx < 0 ? relDateIdx + patternWidth : relDateIdx);

                const sourceEmpId = employees[finalEmpIdx].id;
                const sourceDate = format(days[finalDateIdx], 'yyyy-MM-dd');
                const sourceShift = shiftsByEmployee[sourceEmpId]?.[sourceDate];

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
                    coefficient: sourceShift.coefficient,
                    id: shiftsByEmployee[cell.empId]?.[cell.date]?.id
                };
            }).filter(Boolean);

            const updates = operations.filter(op => !op!.delete);
            const deletes = operations.filter(op => op!.delete).map(op => op!.id);

            if (updates.length > 0) {
                await fetch('/api/shifts/batch', {
                    method: 'POST',
                    body: JSON.stringify({
                        operations: (updates as any[]).map(op => ({
                            ...op,
                            coefficient: Math.min(parseFloat(op.coefficient?.toString() || '1.0'), 1.5).toString()
                        }))
                    })
                });
            }

            if (deletes.length > 0) {
                await fetch('/api/shifts/batch', {
                    method: 'POST',
                    body: JSON.stringify({ deleteIds: deletes })
                });
            }

            setSelection(null);
            fetchShifts();
        } else {
            if (isSingleCell) {
                if (!blockModalRef.current) {
                    openModal(parseISO(start.date), start.empId, start.shift);
                    setSelection(null);
                } else {
                    setSelection(null);
                }
            }
        }

        blockModalRef.current = false;
    }, [isDragging, isFilling, fillSource, selection, employees, days, shiftsByEmployee, getSelectedRange, fetchShifts, openModal, empIdToIndex, dateKeyToIndex]);

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

        const isPointInSelection = isInSelection(empId, dateKey);
        const isRange = selection && (selection.start.empId !== selection.end.empId || selection.start.date !== selection.end.date);

        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            empId,
            dateKey,
            shift,
            showBatchOption: !!(isPointInSelection && isRange)
        });
    }, [isInSelection, selection]);

    const handleQuickAction = useCallback(async (action: 'SICK' | 'VACATION' | 'DELETE' | 'BATCH_EDIT') => {
        if (!contextMenu) return;
        const { empId, dateKey, shift, showBatchOption } = contextMenu;
        setContextMenu(null);

        if (action === 'BATCH_EDIT') {
            setShowBatchModal(true);
            return;
        }

        if (showBatchOption && selection) {
            const range = getSelectedRange(selection);
            if (action === 'DELETE') {
                const deleteIds = range
                    .map(cell => shiftsByEmployee[cell.empId]?.[cell.date]?.id)
                    .filter(Boolean) as string[];

                if (deleteIds.length > 0) {
                    await fetch('/api/shifts/batch', {
                        method: 'POST',
                        body: JSON.stringify({ deleteIds })
                    });
                }
            } else {
                const operations = range.map(cell => ({
                    date: cell.date,
                    employeeId: cell.empId,
                    type: action,
                    hours: action === 'VACATION' ? 0 : 8,
                    id: shiftsByEmployee[cell.empId]?.[cell.date]?.id
                }));
                await fetch('/api/shifts/batch', {
                    method: 'POST',
                    body: JSON.stringify({ operations })
                });
            }
            setSelection(null);
            fetchShifts();
            return;
        }

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
            hours: 11,
            cabinetClosed: false,
            coefficient: 1.0,
            id: shift?.id
        };

        await fetch('/api/shifts', {
            method: 'POST',
            body: JSON.stringify({
                ...payload,
                coefficient: Math.min(parseFloat(payload.coefficient.toString() || '1.0'), 1.5).toString()
            })
        });
        fetchShifts();
    }, [contextMenu, selection, getSelectedRange, shiftsByEmployee, fetchShifts]);

    const handleHandleHover = useCallback((empId: string | null, dateKey: string | null) => {
        if (!isDragging && !isFilling) {
            setHandleCell(empId && dateKey ? { empId, dateKey } : null);
        }
    }, [isDragging, isFilling]);

    const handleHandleMouseDown = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (handleCell && !selection) {
            const bounds = selectionBounds;
            if (bounds) {
                setSelection({
                    start: { empId: handleCell.empId, date: handleCell.dateKey },
                    end: { empId: handleCell.empId, date: handleCell.dateKey }
                });
                setIsFilling(true);
                setFillSource(bounds);
                setHandleCell(null);
            }
        } else if (selectionBounds) {
            setIsFilling(true);
            setFillSource(selectionBounds);
        }
    }, [handleCell, selection, selectionBounds]);

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

            <div
                ref={gridContainerRef}
                className={`bg-white rounded-2xl shadow-xl border border-zinc-200/60 overflow-x-auto flex-1 pb-4 relative ${(isDragging || isFilling) ? 'select-none' : ''}`}
            >
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
                                        <th
                                            key={dateKey}
                                            className={`border-b border-r border-zinc-200 p-2 text-center min-w-[44px] transition-colors
                                                ${isWeekend ? 'bg-red-100/50 text-red-700' : 'bg-transparent text-zinc-700'}
                                                ${day.getDay() === 6 ? 'border-l-2 border-zinc-400' : ''}
                                                ${day.getDay() === 0 ? 'border-r-2 border-zinc-400' : ''}
                                                ${isToday ? 'ring-2 ring-inset ring-blue-500 bg-blue-50 !text-blue-700' : ''}
                                            `}
                                        >
                                            <div className="font-bold text-xs">{format(day, 'd')}</div>
                                            <div className="text-[9px] uppercase font-bold opacity-70">{format(day, 'EEEEEE', { locale: ru })}</div>
                                        </th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody ref={tableBodyRef} className="relative">
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
                                        onMouseDown={handleMouseDown}
                                        onMouseEnter={handleMouseEnter}
                                        currentUser={currentUser}
                                        onContextMenu={handleContextMenu}
                                        onHandleHover={handleHandleHover}
                                        onHandleMouseDown={handleHandleMouseDown}
                                        handleCell={handleCell}
                                        selection={selection}
                                        isInSelection={isInSelection}
                                    />
                                ))}
                            </SortableContext>
                            {employees.length === 0 && (
                                <tr><td colSpan={days.length + 1} className="p-12 text-center text-zinc-400 italic">Сотрудники не найдены...</td></tr>
                            )}
                        </tbody>
                    </table>
                </DndContext>

                <SelectionOverlay
                    bounds={selectionBounds}
                    tableRef={tableBodyRef}
                    containerRef={gridContainerRef}
                    onFillStart={(e) => {
                        if (selectionBounds) {
                            setIsFilling(true);
                            setFillSource(selectionBounds);
                        }
                    }}
                />
            </div>

            {/* Norm Edit Modal */}
            {showNormModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm p-4" onMouseDown={() => setShowNormModal(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-in fade-in zoom-in duration-300" onMouseDown={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold mb-6 text-zinc-900">Норма часов</h2>
                        <input
                            type="number"
                            value={tempNorm}
                            onChange={(e) => setTempNorm(e.target.value)}
                            className="w-full text-4xl font-bold text-center py-6 border-2 border-zinc-100 rounded-2xl focus:border-blue-500 focus:ring-0 transition-all mb-8 bg-zinc-50/50"
                        />
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowNormModal(false)}
                                className="flex-1 py-4 border-2 border-zinc-100 rounded-xl text-zinc-500 font-bold hover:bg-zinc-50 transition-all"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleSaveNorm}
                                className="flex-1 bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200"
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Shift Edit Modal */}
            {showModal && selectedEmployeeId && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-md p-4 animate-in fade-in duration-300" onMouseDown={() => setShowModal(false)}>
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-8 duration-500" onMouseDown={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white relative">
                            <div className="absolute top-6 right-6 cursor-pointer opacity-80 hover:opacity-100 transition-opacity" onClick={() => setShowModal(false)}>
                                <X className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight">Настройка смены</h2>
                                    <p className="opacity-80 text-sm font-medium">
                                        {employees.find(e => e.id === selectedEmployeeId)?.name} • {selectedDate && format(selectedDate, 'd MMMM', { locale: ru })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSaveShift} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Тип смены</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { id: 'REGULAR', label: 'Рабочая', icon: Briefcase, borderColor: 'border-blue-500', bgColor: 'bg-blue-50', iconBg: 'bg-blue-500', textColor: 'text-blue-900' },
                                            { id: 'DAY_OFF_WORK', label: 'Работа в вых.', icon: CheckSquare, borderColor: 'border-amber-500', bgColor: 'bg-amber-50', iconBg: 'bg-amber-500', textColor: 'text-amber-900' },
                                            { id: 'SICK', label: 'Больничный', icon: Activity, borderColor: 'border-red-500', bgColor: 'bg-red-50', iconBg: 'bg-red-500', textColor: 'text-red-900' },
                                            { id: 'VACATION', label: 'Отпуск', icon: LayoutList, borderColor: 'border-emerald-500', bgColor: 'bg-emerald-50', iconBg: 'bg-emerald-500', textColor: 'text-emerald-900' }
                                        ].map(type => (
                                            <div
                                                key={type.id}
                                                onClick={() => setFormData(prev => ({ ...prev, type: type.id as any }))}
                                                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer group
                                                    ${formData.type === type.id
                                                        ? `${type.borderColor} ${type.bgColor}`
                                                        : 'border-zinc-100 bg-zinc-50/50 hover:border-zinc-200 hover:bg-zinc-50'}`}
                                            >
                                                <div className={`p-1.5 rounded-lg transition-colors
                                                    ${formData.type === type.id ? `${type.iconBg} text-white` : 'bg-white text-zinc-400 group-hover:text-zinc-500'}`}>
                                                    <type.icon className="w-3.5 h-3.5" />
                                                </div>
                                                <span className={`text-sm font-bold ${formData.type === type.id ? type.textColor : 'text-zinc-600'}`}>{type.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Часы</label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            value={formData.hours}
                                            onChange={e => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl p-3 pl-10 font-bold focus:border-blue-500 focus:bg-white transition-all"
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                                            <Timer className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Коэффициент</label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="1.5"
                                            value={formData.coefficient}
                                            onChange={e => setFormData(prev => ({ ...prev, coefficient: e.target.value }))}
                                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl p-3 pl-10 font-bold focus:border-blue-500 focus:bg-white transition-all"
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                                            <Percent className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-center p-3 bg-zinc-50 rounded-xl border-2 border-zinc-100 cursor-pointer hover:border-blue-100 transition-all" onClick={() => setFormData(prev => ({ ...prev, cabinetClosed: !prev.cabinetClosed }))}>
                                    <input
                                        type="checkbox"
                                        checked={formData.cabinetClosed}
                                        readOnly
                                        className="w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 border-zinc-300 transition-all pointer-events-none"
                                    />
                                    <label className="text-sm font-bold text-zinc-700 ml-3 cursor-pointer select-none flex items-center justify-between flex-1">
                                        <span>Открытие/Закрытие</span>
                                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold">+250р.</span>
                                    </label>
                                </div>
                                <div className="flex items-center p-3 bg-zinc-50 rounded-xl border-2 border-zinc-100 cursor-pointer hover:border-blue-100 transition-all" onClick={() => setFormData(prev => ({ ...prev, centerClosed: !prev.centerClosed }))}>
                                    <input
                                        type="checkbox"
                                        checked={formData.centerClosed}
                                        readOnly
                                        className="w-5 h-5 text-emerald-600 rounded-lg focus:ring-emerald-500 border-zinc-300 transition-all pointer-events-none"
                                    />
                                    <label className="text-sm font-bold text-zinc-700 ml-3 cursor-pointer select-none flex items-center justify-between flex-1">
                                        <span>Открытие + Закрытие</span>
                                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold">+500р.</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleDeleteShift}
                                    className="px-6 py-3 border-2 border-red-50 rounded-xl text-red-500 bg-red-50/50 hover:bg-red-50 hover:border-red-100 transition-all font-bold text-sm"
                                >
                                    Удалить
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-200 font-bold text-sm"
                                >
                                    Сохранить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Batch Edit Modal - Compact Version */}
            {showBatchModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-md p-4 animate-in fade-in duration-300" onMouseDown={() => setShowBatchModal(false)}>
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-8 duration-500" onMouseDown={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white relative">
                            <div className="absolute top-6 right-6 cursor-pointer opacity-80 hover:opacity-100 transition-opacity" onClick={() => setShowBatchModal(false)}>
                                <X className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight">Массовое изменение</h2>
                                    <p className="opacity-80 text-sm font-medium">Выбрано ячеек: {selection ? getSelectedRange(selection).length : 0}</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleBatchSave} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Тип смены (для всех)</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { id: 'REGULAR', label: 'Рабочая', icon: Briefcase, borderColor: 'border-blue-500', bgColor: 'bg-blue-50', iconBg: 'bg-blue-500', textColor: 'text-blue-900' },
                                            { id: 'DAY_OFF_WORK', label: 'Работа в вых.', icon: CheckSquare, borderColor: 'border-amber-500', bgColor: 'bg-amber-50', iconBg: 'bg-amber-500', textColor: 'text-amber-900' },
                                            { id: 'SICK', label: 'Больничный', icon: Activity, borderColor: 'border-red-500', bgColor: 'bg-red-50', iconBg: 'bg-red-500', textColor: 'text-red-900' },
                                            { id: 'VACATION', label: 'Отпуск', icon: LayoutList, borderColor: 'border-emerald-500', bgColor: 'bg-emerald-50', iconBg: 'bg-emerald-500', textColor: 'text-emerald-900' }
                                        ].map(type => (
                                            <div
                                                key={type.id}
                                                onClick={() => setFormData(prev => ({ ...prev, type: type.id as any }))}
                                                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer group
                                                    ${formData.type === type.id
                                                        ? `${type.borderColor} ${type.bgColor}`
                                                        : 'border-zinc-100 bg-zinc-50/50 hover:border-zinc-200 hover:bg-zinc-50'}`}
                                            >
                                                <div className={`p-1.5 rounded-lg transition-colors
                                                    ${formData.type === type.id ? `${type.iconBg} text-white` : 'bg-white text-zinc-400 group-hover:text-zinc-500'}`}>
                                                    <type.icon className="w-3.5 h-3.5" />
                                                </div>
                                                <span className={`text-sm font-bold ${formData.type === type.id ? type.textColor : 'text-zinc-600'}`}>{type.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Часы</label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            value={formData.hours}
                                            onChange={e => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl p-3 pl-10 font-bold focus:border-blue-500 focus:bg-white transition-all"
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                                            <Timer className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Коэффициент</label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="1.5"
                                            value={formData.coefficient}
                                            onChange={e => setFormData(prev => ({ ...prev, coefficient: e.target.value }))}
                                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl p-3 pl-10 font-bold focus:border-blue-500 focus:bg-white transition-all"
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                                            <Percent className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-center p-3 bg-zinc-50 rounded-xl border-2 border-zinc-100 cursor-pointer hover:border-blue-100 transition-all" onClick={() => setFormData(prev => ({ ...prev, cabinetClosed: !prev.cabinetClosed }))}>
                                    <input
                                        type="checkbox"
                                        checked={formData.cabinetClosed}
                                        readOnly
                                        className="w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 border-zinc-300 transition-all pointer-events-none"
                                    />
                                    <label className="text-sm font-bold text-zinc-700 ml-3 cursor-pointer select-none flex items-center justify-between flex-1">
                                        <span>Открытие/Закрытие</span>
                                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold">+250р.</span>
                                    </label>
                                </div>
                                <div className="flex items-center p-3 bg-zinc-50 rounded-xl border-2 border-zinc-100 cursor-pointer hover:border-blue-100 transition-all" onClick={() => setFormData(prev => ({ ...prev, centerClosed: !prev.centerClosed }))}>
                                    <input
                                        type="checkbox"
                                        checked={formData.centerClosed}
                                        readOnly
                                        className="w-5 h-5 text-emerald-600 rounded-lg focus:ring-emerald-500 border-zinc-300 transition-all pointer-events-none"
                                    />
                                    <label className="text-sm font-bold text-zinc-700 ml-3 cursor-pointer select-none flex items-center justify-between flex-1">
                                        <span>Открытие + Закрытие</span>
                                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold">+500р.</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleBatchDelete}
                                    className="px-6 py-3 border-2 border-red-50 rounded-xl text-red-500 bg-red-50/50 hover:bg-red-50 hover:border-red-100 transition-all font-bold text-sm"
                                >
                                    Удалить
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-200 font-bold text-sm"
                                >
                                    Применить
                                </button>
                            </div>
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
                    showBatchOption={contextMenu.showBatchOption}
                />
            )}
        </div>
    );
}

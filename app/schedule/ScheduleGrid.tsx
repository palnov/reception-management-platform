'use client';

import { memo, useLayoutEffect, useMemo, useRef } from 'react';
import type { RefObject, MouseEvent } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { BadgeCheck, ChevronsLeft, ChevronsRight, Crown, DoorOpen, GraduationCap, GripVertical, User } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { InfoTooltip } from '@/components/InfoTooltip';
import type { CurrentUser, Employee, SelectionBounds, Shift } from './schedule-types';

const BRANCH_CODES: Record<string, string> = {
    'Дзержинского 26': 'ДЗ 26',
    'Дзержинского 45': 'ДЗ 45',
    'Юбилейный (Менякина 1)': 'ЮБ',
};

const EMPTY_EMPLOYEE_SHIFTS: Record<string, Shift> = {};

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
}

const SelectionOverlay = memo(function SelectionOverlay({
    bounds,
    tableRef,
    containerRef,
}: {
    bounds: SelectionBounds | null;
    tableRef: RefObject<HTMLTableSectionElement | null>;
    containerRef: RefObject<HTMLDivElement | null>;
}) {
    const overlayRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const overlay = overlayRef.current;
        if (!overlay) return;

        const hideOverlay = () => {
            overlay.style.display = 'none';
        };

        if (!bounds || !tableRef.current || !containerRef.current) {
            hideOverlay();
            return;
        }

        const tbody = tableRef.current;
        const container = containerRef.current;
        const rows = tbody.querySelectorAll('tr');
        if (!rows.length) {
            hideOverlay();
            return;
        }

        const startRow = rows[bounds.minEmpIdx];
        const endRow = rows[bounds.maxEmpIdx];
        if (!startRow || !endRow) {
            hideOverlay();
            return;
        }

        const startCell = startRow.querySelectorAll('td')[bounds.minDateIdx + 1];
        const endCell = endRow.querySelectorAll('td')[bounds.maxDateIdx + 1];
        if (!startCell || !endCell) {
            hideOverlay();
            return;
        }

        const containerRect = container.getBoundingClientRect();
        const startRect = startCell.getBoundingClientRect();
        const endRect = endCell.getBoundingClientRect();

        overlay.style.display = 'block';
        overlay.style.transform = `translate3d(${startRect.left - containerRect.left + container.scrollLeft - 1}px, ${startRect.top - containerRect.top + container.scrollTop - 1}px, 0)`;
        overlay.style.width = `${endRect.right - startRect.left + 1}px`;
        overlay.style.height = `${endRect.bottom - startRect.top + 1}px`;
    }, [bounds, tableRef, containerRef]);

    return (
        <div
            ref={overlayRef}
            className="absolute left-0 top-0 hidden border-2 border-blue-500 bg-blue-500/10 pointer-events-none z-50 will-change-transform"
        >
            <div className="absolute -bottom-[5px] -right-[5px] w-2.5 h-2.5 bg-blue-500 border border-white pointer-events-none shadow-sm z-[60]" />
        </div>
    );
});

type SortableEmployeeRowProps = {
    emp: Employee;
    days: Date[];
    empShifts: Record<string, Shift>;
    onMouseDown: (e: MouseEvent, empId: string, dateKey: string) => void;
    onMouseEnter: (empId: string, dateKey: string) => void;
    onContextMenu: (e: MouseEvent, empId: string, dateKey: string, shift?: Shift) => void;
    onHandleHover: (empId: string | null, dateKey: string | null) => void;
    onHandleMouseDown: (e: MouseEvent) => void;
    currentUser: CurrentUser | null;
    isClosed: boolean;
    isManager: boolean;
    isColumnCollapsed: boolean;
};

const SortableEmployeeRow = memo(function SortableEmployeeRow({
    emp,
    days,
    empShifts,
    onMouseDown,
    onMouseEnter,
    onContextMenu,
    onHandleHover,
    onHandleMouseDown,
    currentUser,
    isClosed,
    isManager,
    isColumnCollapsed,
}: SortableEmployeeRowProps) {
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

    const isDismissed = (date: string) => {
        const dDate = emp.dismissalDate;
        return !!dDate && dDate !== '' && date >= dDate;
    };

    const isBeforeHire = (date: string) => {
        const hDate = emp.hireDate;
        return !!hDate && hDate !== '' && date < hDate;
    };

    return (
        <tr ref={setNodeRef} style={style} className="hover:bg-zinc-50 group">
            <td className={`sticky left-0 bg-white group-hover:bg-zinc-50 z-40 font-medium text-zinc-900 transition-all border-b border-zinc-200/90 ${isColumnCollapsed ? 'p-1.5' : 'p-3'}`} style={{ boxShadow: 'inset -2px 0 0 #d4d4d8, 2px 0 10px -2px rgba(0,0,0,0.1)' }}>
                {isColumnCollapsed ? (
                    <div className="flex flex-col items-center gap-0.5 w-10">
                        <div className={`w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${emp.role === 'MANAGER' ? 'bg-purple-100 text-purple-600' :
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
                        <span className="text-[9px] font-bold text-zinc-500 leading-none">{getInitials(emp.name)}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <div
                            {...attributes}
                            {...(!isClosed && isManager ? listeners : {})}
                            className={`${isClosed || !isManager ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} p-1 hover:bg-zinc-100 rounded text-zinc-400 group-hover:text-zinc-600 transition-colors`}
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
                            {(emp.branch || emp.dismissalDate) && (
                                <div className="flex items-center gap-2 pl-7 leading-tight">
                                    {emp.branch && (
                                        <span className="text-[10px] text-zinc-400">
                                            {BRANCH_CODES[emp.branch] || emp.branch}
                                        </span>
                                    )}
                                    {emp.dismissalDate && emp.dismissalDate <= new Date().toISOString().split('T')[0] && (
                                        <span className="text-[10px] text-red-500 font-bold whitespace-nowrap">
                                            УВОЛЕНА: {format(parseISO(emp.dismissalDate), 'dd.MM.yy')}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </td>
            {days.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const shift = empShifts[dateKey];
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const dismissed = isDismissed(dateKey);
                const beforeHire = isBeforeHire(dateKey);
                const isRestricted = dismissed || beforeHire;

                let bgClass = '';
                let textClass = '';

                if (isRestricted) {
                    bgClass = 'bg-zinc-100/50';
                    textClass = 'text-zinc-300';
                } else if (shift) {
                    if (shift.type === 'SICK') { bgClass = 'bg-red-100'; textClass = 'text-red-900'; }
                    else if (shift.type === 'ARCHIVE_WORK') { bgClass = 'bg-amber-100'; textClass = 'text-amber-900'; }
                    else if (shift.type === 'VACATION') { bgClass = 'bg-green-100'; textClass = 'text-green-900'; }
                    else { bgClass = 'bg-blue-100'; textClass = 'text-blue-900'; }
                } else if (isWeekend) {
                    bgClass = 'bg-red-50/20';
                }

                return (
                    <td
                        key={dateKey}
                        className={`border-r border-b border-zinc-200/90 text-center cursor-pointer relative h-12 w-11 p-0 select-none transition-all
                            ${shift && !shift.isDeleted ? bgClass : (isWeekend || isRestricted ? bgClass : '')}
                            ${shift && !shift.isDeleted ? textClass : (isRestricted ? textClass : '')}
                            ${!shift || shift.isDeleted ? (isRestricted ? '' : 'hover:bg-blue-50/50') : 'hover:brightness-95'}
                            ${day.getDay() === 6 ? 'border-l-2 border-zinc-400' : ''}
                            ${day.getDay() === 0 ? 'border-r-2 border-zinc-400' : ''}
                        `}
                        onMouseDown={(e) => {
                            if (isRestricted || isClosed) return;
                            if ((e.target as HTMLElement).closest('[data-audit-ignore="true"]')) return;
                            if (e.button === 0) onMouseDown(e, emp.id, dateKey);
                        }}
                        onMouseEnter={() => !isRestricted && !isClosed && onMouseEnter(emp.id, dateKey)}
                        onContextMenu={(e) => {
                            if (isRestricted || isClosed) return;
                            if ((e.target as HTMLElement).closest('[data-audit-ignore="true"]')) return;
                            onContextMenu(e, emp.id, dateKey, shift);
                        }}
                    >
                        {!isRestricted && !isClosed && (
                            <div
                                className="absolute -bottom-[5px] -right-[5px] w-2.5 h-2.5 z-40 cursor-crosshair"
                                onMouseEnter={() => onHandleHover(emp.id, dateKey)}
                                onMouseLeave={() => onHandleHover(null, null)}
                                onMouseDown={onHandleMouseDown}
                            />
                        )}

                        {isRestricted && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
                                <span className="text-[7px] font-black uppercase tracking-tighter rotate-[-15deg] border border-current px-0.5 rounded leading-tight">
                                    {dismissed ? 'Уволен' : 'Ожидает'}
                                </span>
                            </div>
                        )}

                        {shift && !shift.isDeleted && (
                            <div className="relative h-full w-full flex items-center justify-center leading-none">
                                <div className="absolute top-0.5 left-0.5 flex flex-col gap-0.5">
                                    {shift.cabinetClosed && (
                                        <DoorOpen className="w-2.5 h-2.5 opacity-40 text-zinc-600" />
                                    )}
                                    {shift.centerClosed && (
                                        <DoorOpen className="w-2.5 h-2.5 opacity-60 text-emerald-600" />
                                    )}
                                </div>

                                <div className="absolute top-0.5 right-0.5 flex flex-col gap-0.5 items-end">
                                    {shift.isActingLead && (
                                        <Crown className="w-2.5 h-2.5 text-amber-500" />
                                    )}
                                    {shift.isTrainee && (
                                        <GraduationCap className="w-2.5 h-2.5 text-indigo-500" />
                                    )}
                                    {shift.auditLogs && shift.auditLogs.length > 0 && (
                                        <InfoTooltip
                                            logs={shift.auditLogs}
                                            currentUser={currentUser}
                                            createdBy={shift.createdBy}
                                            className="!static"
                                        />
                                    )}
                                </div>

                                <span className="font-bold text-sm">
                                    {shift.type === 'SICK' ? 'Б' : (shift.type === 'VACATION' ? 'O' : shift.hours)}
                                </span>

                                {shift.coefficient > 1 && (
                                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2">
                                        <span className="text-[9px] bg-white/50 px-0.5 rounded">x{shift.coefficient}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {shift && shift.isDeleted && shift.auditLogs && shift.auditLogs.length > 0 && (
                            <div className="relative h-full w-full flex items-center justify-center pointer-events-none">
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
                );
            })}
        </tr>
    );
});

type ScheduleGridProps = {
    currentUser: CurrentUser | null;
    days: Date[];
    employees: Employee[];
    isClosed: boolean;
    isColumnCollapsed: boolean;
    isDragging: boolean;
    isFilling: boolean;
    isLoading?: boolean;
    isManager: boolean;
    selectionBounds: SelectionBounds | null;
    shiftsByEmployee: Record<string, Record<string, Shift>>;
    onColumnCollapsedChange: (updater: (previous: boolean) => boolean) => void;
    onContextMenu: (e: MouseEvent, empId: string, dateKey: string, shift?: Shift) => void;
    onDragEnd: (event: DragEndEvent) => void;
    onHandleHover: (empId: string | null, dateKey: string | null) => void;
    onHandleMouseDown: (e: MouseEvent) => void;
    onMouseDown: (e: MouseEvent, empId: string, dateKey: string) => void;
    onMouseEnter: (empId: string, dateKey: string) => void;
};

export function ScheduleGrid({
    currentUser,
    days,
    employees,
    isClosed,
    isColumnCollapsed,
    isDragging,
    isFilling,
    isLoading = false,
    isManager,
    selectionBounds,
    shiftsByEmployee,
    onColumnCollapsedChange,
    onContextMenu,
    onDragEnd,
    onHandleHover,
    onHandleMouseDown,
    onMouseDown,
    onMouseEnter,
}: ScheduleGridProps) {
    const tableBodyRef = useRef<HTMLTableSectionElement>(null);
    const gridContainerRef = useRef<HTMLDivElement>(null);
    const employeeIds = useMemo(() => employees.map((emp) => emp.id), [employees]);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 1,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    return (
        <div
            ref={gridContainerRef}
            className={`bg-white/95 sm:rounded-2xl shadow-[0_18px_60px_-38px_rgba(15,23,42,0.65)] border-y sm:border border-zinc-200/70 overflow-auto flex-1 pb-4 relative scrollbar-custom max-h-[calc(100vh-250px)] -mx-3 sm:mx-0 ${(isDragging || isFilling) ? 'select-none' : ''}`}
        >
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => !isClosed && isManager && onDragEnd(event)}
            >
                <table className="w-full text-xs text-left border-separate border-spacing-0 min-w-[1240px] tabular-nums">
                    <thead className="sticky top-0 z-[60]">
                        <tr className="bg-zinc-50/50">
                            <th className={`sticky top-0 left-0 bg-zinc-50 z-[70] p-2 sm:p-3 transition-all ${isColumnCollapsed ? 'min-w-[52px] w-[52px]' : 'min-w-[240px]'}`} style={{ boxShadow: 'inset 0 -2px 0 #d4d4d8, inset -2px 0 0 #d4d4d8, 2px 0 10px -2px rgba(0,0,0,0.1)' }}>
                                <div className="flex items-center justify-between gap-1">
                                    {!isColumnCollapsed && <span className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">Сотрудник</span>}
                                    <button
                                        type="button"
                                        onClick={() => onColumnCollapsedChange(previous => !previous)}
                                        className="p-1 rounded-md hover:bg-zinc-200/70 text-zinc-400 hover:text-zinc-600 transition-colors"
                                        title={isColumnCollapsed ? 'Развернуть' : 'Свернуть'}
                                        aria-label={isColumnCollapsed ? 'Развернуть колонку сотрудников' : 'Свернуть колонку сотрудников'}
                                    >
                                        {isColumnCollapsed ? <ChevronsRight className="w-3.5 h-3.5" /> : <ChevronsLeft className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </th>
                            {days.map(day => {
                                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                                const isToday = isSameDay(day, new Date());
                                const dateKey = format(day, 'yyyy-MM-dd');
                                return (
                                    <th
                                        key={dateKey}
                                        className={`sticky top-0 z-20 border-r border-zinc-200 p-2 text-center min-w-[44px] transition-colors
                                            ${isWeekend ? 'bg-[#fef1f1] text-red-700' : 'bg-[#fafafa] text-zinc-700'}
                                            ${day.getDay() === 6 ? 'border-l-2 border-zinc-400' : ''}
                                            ${day.getDay() === 0 ? 'border-r-2 border-zinc-400' : ''}
                                            ${isToday ? 'bg-[#eff6ff] !text-blue-700' : ''}
                                        `}
                                        style={{ boxShadow: isToday ? 'inset 0 0 0 2px #3b82f6, inset 0 -2px 0 #d4d4d8' : 'inset 0 -2px 0 #d4d4d8' }}
                                    >
                                        <div className="font-bold text-xs">{format(day, 'd')}</div>
                                        <div className="text-[9px] uppercase font-bold opacity-70">{format(day, 'EEEEEE', { locale: ru })}</div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody ref={tableBodyRef} className="relative">
                        <SortableContext
                            items={employeeIds}
                            strategy={verticalListSortingStrategy}
                        >
                            {employees.map((emp) => (
                                <SortableEmployeeRow
                                    key={emp.id}
                                    emp={emp}
                                    days={days}
                                    empShifts={shiftsByEmployee[emp.id] || EMPTY_EMPLOYEE_SHIFTS}
                                    onMouseDown={onMouseDown}
                                    onMouseEnter={onMouseEnter}
                                    currentUser={currentUser}
                                    onContextMenu={onContextMenu}
                                    onHandleHover={onHandleHover}
                                    onHandleMouseDown={onHandleMouseDown}
                                    isClosed={isClosed}
                                    isManager={isManager}
                                    isColumnCollapsed={isColumnCollapsed}
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
            />

            {isLoading && (
                <div className="absolute inset-0 z-[90] flex items-start justify-center bg-white/65 pt-20 backdrop-blur-[1px] pointer-events-none">
                    <div className="rounded-2xl border border-zinc-200/80 bg-white/95 px-4 py-3 text-sm font-semibold text-zinc-700 shadow-xl shadow-zinc-900/10">
                        Загрузка расписания...
                    </div>
                </div>
            )}
        </div>
    );
}

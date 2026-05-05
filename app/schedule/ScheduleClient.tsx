'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSharedMonth } from '@/lib/useSharedMonth';
import { useMonthStatus } from '@/lib/useMonthStatus';
import { addMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, subMonths } from 'date-fns';
import { QuickContextMenu } from '@/components/QuickContextMenu';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { ScheduleOverview } from '@/lib/overview-data';
import { ScheduleToolbar } from './ScheduleToolbar';
import { ScheduleNormModal } from './ScheduleNormModal';
import { ScheduleShiftModal } from './ScheduleShiftModal';
import { ScheduleBatchModal } from './ScheduleBatchModal';
import { ScheduleGrid } from './ScheduleGrid';
import { ScheduleToast } from './ScheduleToast';
import {
    buildAutoFillOperations,
    buildDateIndexMap,
    buildFillOperations,
    buildIndexMap,
    DEFAULT_SHIFT_FORM_DATA,
    getSelectedRange as getSelectedRangeFromState,
    getSelectionBounds,
    getShiftFormData,
    groupShiftsByEmployee,
    isCellInSelection,
} from './schedule-logic';
import {
    deleteBatchShifts,
    deleteShift,
    fetchMonthNorm,
    fetchMonthShifts,
    fetchPreviousShifts,
    fetchScheduleOverview,
    parseScheduleOverview,
    readApiError,
    saveBatchShifts,
    saveMonthNorm,
    saveShift,
    type ScheduleOverviewResponse,
} from './schedule-api';
import type { BatchShiftDeleteOperation, BatchShiftOperation, CurrentUser, Employee, SelectionBounds, SelectionState, Shift, ShiftFormData } from './schedule-types';

type ScheduleFeedback = { type: 'error' | 'success'; message: string };

type ScheduleContextMenu = {
    x: number;
    y: number;
    empId: string;
    dateKey: string;
    shift?: Shift;
    showBatchOption?: boolean;
};

function isBatchShiftOperation(op: BatchShiftOperation | BatchShiftDeleteOperation | null): op is BatchShiftOperation {
    return !!op && !('delete' in op);
}

function isBatchShiftDeleteOperation(op: BatchShiftOperation | BatchShiftDeleteOperation | null): op is BatchShiftDeleteOperation {
    return !!op && 'delete' in op;
}

function isDefinedBatchShiftOperation(op: BatchShiftOperation | null): op is BatchShiftOperation {
    return op !== null;
}

type ScheduleClientProps = {
    initialMonth?: string;
    initialData?: ScheduleOverview | null;
};

// --- Main Page Component ---
export default function SchedulePage({ initialMonth, initialData }: ScheduleClientProps) {
    const [currentMonth, setCurrentMonth] = useSharedMonth();
    const initialDataMatchesMonth = !!initialData && initialMonth === format(currentMonth, 'yyyy-MM');
    const shouldSkipInitialOverviewFetchRef = useRef(initialDataMatchesMonth);
    const { isClosed, refresh: refreshMonthStatus } = useMonthStatus(currentMonth);
    const [shifts, setShifts] = useState<Shift[]>(initialDataMatchesMonth ? initialData.shifts as Shift[] : []);
    const [employees, setEmployees] = useState<Employee[]>(initialDataMatchesMonth ? initialData.employees : []);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Norm Hours State
    const [monthNorm, setMonthNorm] = useState<number>(initialDataMatchesMonth ? initialData.monthNorm : 176);
    const [showNormModal, setShowNormModal] = useState(false);
    const [tempNorm, setTempNorm] = useState<string>(String(initialDataMatchesMonth ? initialData.monthNorm : 176));

    // Form state
    const [formData, setFormData] = useState<ShiftFormData>({
        ...DEFAULT_SHIFT_FORM_DATA,
    });

    // Selection State
    const [selection, setSelection] = useState<SelectionState | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isFilling, setIsFilling] = useState(false);
    const [fillSource, setFillSource] = useState<SelectionBounds | null>(null);
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [handleCell, setHandleCell] = useState<{ empId: string, dateKey: string } | null>(null);
    const [contextMenu, setContextMenu] = useState<ScheduleContextMenu | null>(null);
    const selectionRef = useRef<SelectionState | null>(null);
    const contextMenuRef = useRef<ScheduleContextMenu | null>(null);
    const handleCellRef = useRef<{ empId: string, dateKey: string } | null>(null);
    const selectionBoundsRef = useRef<SelectionBounds | null>(null);
    const lastSelectionEndRef = useRef<{ empId: string, date: string } | null>(null);
    const overviewCacheRef = useRef<Map<string, ScheduleOverviewResponse>>(new Map());
    const overviewRequestIdRef = useRef(0);

    const [userData, setUserData] = useState<CurrentUser | null>(
        initialDataMatchesMonth ? initialData.currentUser : null
    );
    const [prevMonthShifts, setPrevMonthShifts] = useState<Shift[]>(
        initialDataMatchesMonth ? initialData.prevMonthShifts as Shift[] : []
    );
    const [isOverviewLoading, setIsOverviewLoading] = useState(false);
    const [isAutoFilling, setIsAutoFilling] = useState(false);
    const [isColumnCollapsed, setIsColumnCollapsed] = useState(false);
    const [feedback, setFeedback] = useState<ScheduleFeedback | null>(null);

    const isManager = useMemo(() => {
        return userData?.role === 'MANAGER';
    }, [userData]);

    const isSenior = useMemo(() => {
        return userData?.role === 'SENIOR';
    }, [userData]);

    const canEditShifts = useMemo(() => {
        return userData?.role === 'MANAGER' || userData?.role === 'SENIOR';
    }, [userData]);

    useEffect(() => {
        selectionRef.current = selection;
    }, [selection]);

    useEffect(() => {
        contextMenuRef.current = contextMenu;
    }, [contextMenu]);

    useEffect(() => {
        handleCellRef.current = handleCell;
    }, [handleCell]);

    const blockModalRef = useRef(false);

    const showFeedback = useCallback((type: ScheduleFeedback['type'], message: string) => {
        setFeedback({ type, message });
        window.setTimeout(() => {
            setFeedback(current => current?.message === message ? null : current);
        }, type === 'success' ? 3500 : 7000);
    }, []);

    const mergeLocalShifts = useCallback((updatedShifts: Shift[]) => {
        if (updatedShifts.length === 0) return;
        overviewCacheRef.current.delete(format(currentMonth, 'yyyy-MM'));

        setShifts(previous => {
            const byId = new Map(previous.map(shift => [shift.id, shift]));

            updatedShifts.forEach(shift => {
                const previousShift = byId.get(shift.id);
                byId.set(shift.id, {
                    ...previousShift,
                    ...shift,
                    auditLogs: previousShift?.auditLogs || shift.auditLogs || [],
                });
            });

            return Array.from(byId.values());
        });
    }, [currentMonth]);

    const removeLocalShiftIds = useCallback((ids: string[]) => {
        if (ids.length === 0) return;
        overviewCacheRef.current.delete(format(currentMonth, 'yyyy-MM'));
        const idSet = new Set(ids);
        setShifts(previous => previous.filter(shift => !idSet.has(shift.id)));
    }, [currentMonth]);

    const isMonthEmpty = useMemo(() => shifts.filter(s => !s.isDeleted).length === 0, [shifts]);
    const prevMonthHasShifts = useMemo(() => prevMonthShifts.filter(s => !s.isDeleted).length > 0, [prevMonthShifts]);

    const applyOverviewData = useCallback((data: ScheduleOverviewResponse) => {
        setUserData(data.currentUser || null);
        setEmployees(data.employees || []);
        setShifts(data.shifts || []);
        setPrevMonthShifts(data.prevMonthShifts || []);
        setMonthNorm(data.monthNorm || 176);
        setTempNorm(String(data.monthNorm || 176));
    }, []);

    const loadOverview = useCallback(async (month: Date, shouldApply: boolean) => {
        const monthKey = format(month, 'yyyy-MM');
        const cached = overviewCacheRef.current.get(monthKey);

        if (cached) {
            if (shouldApply) {
                applyOverviewData(cached);
                setIsOverviewLoading(false);
            }
            return cached;
        }

        const requestId = shouldApply ? ++overviewRequestIdRef.current : overviewRequestIdRef.current;
        if (shouldApply) setIsOverviewLoading(true);

        try {
            const res = await fetchScheduleOverview(month);
            if (res.status === 401) {
                if (shouldApply) window.location.href = '/login';
                return;
            }
            if (!res.ok) {
                if (shouldApply) showFeedback('error', 'Не удалось загрузить расписание.');
                return;
            }

            const data = await parseScheduleOverview(res);
            overviewCacheRef.current.set(monthKey, data);

            if (shouldApply && requestId === overviewRequestIdRef.current) {
                applyOverviewData(data);
            }

            return data;
        } catch (e) {
            console.error(e);
            if (shouldApply) showFeedback('error', 'Не удалось загрузить сотрудников для графика.');
        } finally {
            if (shouldApply && requestId === overviewRequestIdRef.current) {
                setIsOverviewLoading(false);
            }
        }
    }, [applyOverviewData, showFeedback]);

    const fetchShifts = useCallback(async () => {
        try {
            const currentShifts = await fetchMonthShifts(currentMonth);
            setShifts(currentShifts);

            if (currentShifts.filter((s) => !s.isDeleted).length === 0) {
                setPrevMonthShifts(await fetchPreviousShifts(currentMonth));
            } else {
                setPrevMonthShifts([]);
            }
        } catch (e) {
            console.error('SCHEDULE_FETCH_SHIFTS_ERROR:', e);
            showFeedback('error', 'Не удалось загрузить смены за выбранный месяц.');
        }
    }, [currentMonth, showFeedback]);

    const syncShiftsInBackground = useCallback(() => {
        void fetchShifts();
    }, [fetchShifts]);

    const fetchNorm = useCallback(async () => {
        try {
            const hours = await fetchMonthNorm(currentMonth);
            setMonthNorm(hours);
            setTempNorm(hours.toString());
        } catch (e) {
            console.error('SCHEDULE_FETCH_NORM_ERROR:', e);
            showFeedback('error', 'Не удалось загрузить норму часов.');
        }
    }, [currentMonth, showFeedback]);

    useEffect(() => {
        // Mobile-first: collapse column by default on small screens
        if (window.innerWidth < 768) {
            setIsColumnCollapsed(true);
        }
    }, []);

    useEffect(() => {
        if (initialDataMatchesMonth && initialData && initialMonth) {
            overviewCacheRef.current.set(initialMonth, initialData as ScheduleOverviewResponse);
        }
    }, [initialDataMatchesMonth, initialData, initialMonth]);

    useEffect(() => {
        if (shouldSkipInitialOverviewFetchRef.current) {
            shouldSkipInitialOverviewFetchRef.current = false;
        } else {
            void loadOverview(currentMonth, true);
        }

        void loadOverview(subMonths(currentMonth, 1), false);
        void loadOverview(addMonths(currentMonth, 1), false);
    }, [currentMonth, initialDataMatchesMonth, loadOverview]);

    async function handleSaveNorm() {
        if (isClosed) return;
        try {
            const res = await saveMonthNorm(currentMonth, tempNorm);
            if (res.ok) {
                setMonthNorm(parseFloat(tempNorm));
                void fetchNorm();
                setShowNormModal(false);
                showFeedback('success', 'Норма часов обновлена.');
            } else {
                showFeedback('error', await readApiError(res, 'Не удалось сохранить норму часов.'));
            }
        } catch (e) {
            console.error(e);
            showFeedback('error', 'Не удалось связаться с сервером. Норма не сохранена.');
        }
    }

    const handleAutoFill = async () => {
        if (!prevMonthHasShifts || !isMonthEmpty || isAutoFilling) return;
        setIsAutoFilling(true);

        try {
            const operations = buildAutoFillOperations(employees, prevMonthShifts, currentMonth);

            if (operations.length > 0) {
                const res = await saveBatchShifts(operations);
                if (res.ok) {
                    fetchShifts();
                    showFeedback('success', 'График заполнен по предыдущим сменам.');
                } else {
                    showFeedback('error', await readApiError(res, 'Не удалось заполнить график.'));
                }
            }
        } catch (e) {
            console.error('AUTO_FILL_ERROR:', e);
            showFeedback('error', 'Не удалось заполнить график из-за сетевой ошибки.');
        } finally {
            setIsAutoFilling(false);
        }
    };

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setEmployees((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                if (oldIndex === -1 || newIndex === -1) return items;

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
        const emp = employees.find(e => e.id === empId);
        const dateStr = format(date, 'yyyy-MM-dd');
        if (emp?.dismissalDate && dateStr >= emp.dismissalDate) {
            return; // Don't open modal for dismissed days
        }
        if (emp?.hireDate && dateStr < emp.hireDate) {
            return; // Don't open modal for days before hire
        }

        setSelectedDate(date);
        setSelectedEmployeeId(empId);
        setFormData(getShiftFormData(existingShift));
        setShowModal(true);
    }, [employees]);

    const handleSaveShift = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!selectedDate || !selectedEmployeeId) return;

        const existingShift = shifts.find(s =>
            s.employeeId === selectedEmployeeId &&
            format(parseISO(s.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
        );

        const res = await saveShift({
            id: existingShift?.id,
            date: format(selectedDate, 'yyyy-MM-dd'),
            employeeId: selectedEmployeeId,
            ...formData,
            coefficient: Math.min(parseFloat(formData.coefficient || '1.0'), 1.5).toString()
        });

        if (!res.ok) {
            showFeedback('error', await readApiError(res, 'Не удалось сохранить смену.'));
            return;
        }

        const updatedShift = await res.json();
        mergeLocalShifts([updatedShift]);
        setShowModal(false);
        syncShiftsInBackground();
    };

    const handleDeleteShift = async () => {
        if (!selectedDate || !selectedEmployeeId) return;
        const existingShift = shifts.find(s =>
            s.employeeId === selectedEmployeeId &&
            format(parseISO(s.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
        );

        if (existingShift) {
            const res = await deleteShift(existingShift.id);
            if (!res.ok) {
                showFeedback('error', await readApiError(res, 'Не удалось удалить смену.'));
                return;
            }
            removeLocalShiftIds([existingShift.id]);
            setShowModal(false);
            syncShiftsInBackground();
        }
    };

    const days = useMemo(() => eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    }), [currentMonth]);

    // --- Optimization: Memoized Lookups ---
    const empIdToIndex = useMemo(() => buildIndexMap(employees), [employees]);
    const dateKeyToIndex = useMemo(() => buildDateIndexMap(days), [days]);

    // Selection Bounds Memo
    const selectionBounds = useMemo(
        () => getSelectionBounds(selection, handleCell, empIdToIndex, dateKeyToIndex),
        [selection, handleCell, empIdToIndex, dateKeyToIndex],
    );

    useEffect(() => {
        selectionBoundsRef.current = selectionBounds;
    }, [selectionBounds]);

    // Helper to get all cells in a selection rectangle
    const getSelectedRange = useCallback(
        (sel: NonNullable<typeof selection>) => getSelectedRangeFromState(sel, employees, days, empIdToIndex, dateKeyToIndex),
        [employees, days, empIdToIndex, dateKeyToIndex],
    );

    // Group shifts for O(1) lookup
    const shiftsByEmployee = useMemo(() => groupShiftsByEmployee(shifts), [shifts]);

    const handleBatchSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!selection) return;

        const range = getSelectedRange(selection);
        const operations = range.map<BatchShiftOperation | null>(cell => {
            const emp = employees.find(e => e.id === cell.empId);
            if (emp?.dismissalDate && cell.date > emp.dismissalDate) return null;

            return {
                date: cell.date,
                employeeId: cell.empId,
                ...formData,
                isActingLead: formData.isActingLead && emp?.role === 'ADMIN',
                isTrainee: formData.isTrainee,
                id: shiftsByEmployee[cell.empId]?.[cell.date]?.id
            };
        }).filter(isDefinedBatchShiftOperation);

        const res = await saveBatchShifts(operations.map(op => ({
            ...op,
            coefficient: Math.min(parseFloat(formData.coefficient || '1.0'), 1.5).toString()
        })));

        if (!res.ok) {
            const message = await readApiError(res, 'Не удалось сохранить выбранные смены.');
            console.error('Batch save failed:', message);
            showFeedback('error', message);
            return;
        }

        const data = await res.json();
        mergeLocalShifts(Array.isArray(data?.results?.upserted) ? data.results.upserted : []);
        setShowBatchModal(false);
        setSelection(null);
        syncShiftsInBackground();
        showFeedback('success', 'Выбранные смены сохранены.');
    };

    const handleBatchDelete = async () => {
        if (!selection) return;
        const range = getSelectedRange(selection);
        const deleteIds = range
            .map(cell => shiftsByEmployee[cell.empId]?.[cell.date]?.id)
            .filter(Boolean) as string[];

        if (deleteIds.length > 0) {
            try {
                const res = await deleteBatchShifts(deleteIds);
                if (!res.ok) {
                    const message = await readApiError(res, 'Не удалось удалить выбранные смены.');
                    console.error('Batch delete failed:', message);
                    showFeedback('error', message);
                    return;
                }
            } catch (err) {
                console.error('Network error during batch delete:', err);
                showFeedback('error', 'Не удалось связаться с сервером. Смены не удалены.');
                return;
            }
        }
        removeLocalShiftIds(deleteIds);
        setShowBatchModal(false);
        setSelection(null);
        syncShiftsInBackground();
        if (deleteIds.length > 0) showFeedback('success', 'Выбранные смены удалены.');
    };

    const handleMouseDown = useCallback((e: React.MouseEvent, empId: string, date: string) => {
        e.preventDefault();
        const sourceShift = shiftsByEmployee[empId]?.[date];
        const isActuallyAdmin = userData?.role === 'ADMIN';
        const currentSelection = selectionRef.current;
        const currentContextMenu = contextMenuRef.current;

        const isRange = currentSelection && (currentSelection.start.empId !== currentSelection.end.empId || currentSelection.start.date !== currentSelection.end.date);
        if (isRange || currentContextMenu) {
            blockModalRef.current = true;
        }

        if (currentContextMenu) setContextMenu(null);

        // ADMINs and regular users can only click existing shifts, not drag or select multiple cells
        if ((!isManager && !isSenior) && !sourceShift) {
            // If it's an empty cell, do nothing for admins/regular employees
            return;
        }

        // ADMINs cannot drag-select or fill
        if (isActuallyAdmin) {
            if (sourceShift) {
                openModal(parseISO(date), empId, sourceShift);
            }
            return;
        }

        setSelection({
            start: { empId, date, shift: sourceShift },
            end: { empId, date }
        });
        lastSelectionEndRef.current = { empId, date };
        setIsDragging(true);
        setIsFilling(false);
        setHandleCell(null);
    }, [shiftsByEmployee, isManager, isSenior, userData, openModal]);

    const handleMouseEnter = useCallback((empId: string, date: string) => {
        if (!isDragging && !isFilling) return;
        if ((!isManager && !isSenior) && isDragging) return; // Prevent extending selection for admins/seniors
        const lastEnd = lastSelectionEndRef.current;
        if (lastEnd?.empId === empId && lastEnd.date === date) return;
        lastSelectionEndRef.current = { empId, date };
        setSelection(prev => prev ? { ...prev, end: { empId, date } } : null);
    }, [isDragging, isFilling, isManager, isSenior]);

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
        lastSelectionEndRef.current = null;

        if (!currentSelection) return;

        const { start, end } = currentSelection;
        const isSingleCell = start.empId === end.empId && start.date === end.date;

        if (wasFilling && currentFillSource) {
            const range = getSelectedRange(currentSelection);
            const operations = buildFillOperations({
                currentFillSource,
                dateKeyToIndex,
                days,
                employees,
                empIdToIndex,
                range,
                shiftsByEmployee,
            });

            const updates = operations.filter(isBatchShiftOperation);
            const deletes = operations.filter(isBatchShiftDeleteOperation).map(op => op.id);

            if (updates.length > 0) {
                const res = await saveBatchShifts(updates.map(op => ({
                    ...op,
                    coefficient: Math.min(parseFloat(op.coefficient?.toString() || '1.0'), 1.5).toString()
                })));
                if (res.ok) {
                    const data = await res.json();
                    mergeLocalShifts(Array.isArray(data?.results?.upserted) ? data.results.upserted : []);
                }
            }

            if (deletes.length > 0) {
                const res = await deleteBatchShifts(deletes);
                if (res.ok) removeLocalShiftIds(deletes);
            }

            setSelection(null);
            syncShiftsInBackground();
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
    }, [isDragging, isFilling, fillSource, selection, employees, days, shiftsByEmployee, getSelectedRange, openModal, empIdToIndex, dateKeyToIndex, mergeLocalShifts, removeLocalShiftIds, syncShiftsInBackground]);

    const handleKeyDown = useCallback(async (e: KeyboardEvent) => {
        if (!selection || isDragging) return;

        // Ignore if user is typing in an input or textarea
        const activeElement = document.activeElement;
        if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA' || (activeElement as HTMLElement)?.isContentEditable) {
            return;
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (!isManager) return; // Non-managers cannot delete
            e.preventDefault();
            const range = getSelectedRange(selection);
            const deleteIds = range
                .map(cell => shiftsByEmployee[cell.empId]?.[cell.date]?.id)
                .filter(Boolean) as string[];

            if (deleteIds.length > 0) {
                try {
                    const res = await deleteBatchShifts(deleteIds);
                    if (!res.ok) {
                        const message = await readApiError(res, 'Не удалось удалить выбранные смены.');
                        console.error('Batch delete failed:', message);
                        showFeedback('error', message);
                        return;
                    }
                    removeLocalShiftIds(deleteIds);
                    syncShiftsInBackground();
                    showFeedback('success', 'Выбранные смены удалены.');
                } catch (err) {
                    console.error('Network error during batch delete:', err);
                    showFeedback('error', 'Не удалось связаться с сервером. Смены не удалены.');
                }
            }
            setSelection(null);
        } else if (e.key === 'Escape') {
            setSelection(null);
        }
    }, [selection, isDragging, getSelectedRange, shiftsByEmployee, isManager, showFeedback, removeLocalShiftIds, syncShiftsInBackground]);

    const handleContextMenu = useCallback((e: React.MouseEvent, empId: string, dateKey: string, shift?: Shift) => {
        e.preventDefault();
        if (!isManager && !isSenior) return; // Admins and regular employees have no context menu

        const currentSelection = selectionRef.current;
        const isPointInSelection = isCellInSelection(empId, dateKey, selectionBoundsRef.current, empIdToIndex, dateKeyToIndex);
        const isRange = currentSelection && (currentSelection.start.empId !== currentSelection.end.empId || currentSelection.start.date !== currentSelection.end.date);

        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            empId,
            dateKey,
            shift,
            showBatchOption: !!(isPointInSelection && isRange)
        });
    }, [empIdToIndex, dateKeyToIndex, isManager, isSenior]);

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
                    try {
                        const res = await deleteBatchShifts(deleteIds);
                        if (!res.ok) {
                            const message = await readApiError(res, 'Не удалось удалить выбранные смены.');
                            console.error('Batch delete failed:', message);
                            showFeedback('error', message);
                            return;
                        }
                    } catch (err) {
                        console.error('Network error during batch delete:', err);
                        showFeedback('error', 'Не удалось связаться с сервером. Смены не удалены.');
                        return;
                    }
                }
            } else {
                const operations = range.map(cell => ({
                    date: cell.date,
                    employeeId: cell.empId,
                    type: action,
                    hours: action === 'VACATION' ? 0 : 8,
                    id: shiftsByEmployee[cell.empId]?.[cell.date]?.id
                }));
                try {
                    const res = await saveBatchShifts(operations.map(operation => ({
                        ...operation,
                        cabinetClosed: false,
                        centerClosed: false,
                        coefficient: 1.0,
                    })));
                    if (!res.ok) {
                        const message = await readApiError(res, 'Не удалось обновить выбранные смены.');
                        console.error('Batch update failed:', message);
                        showFeedback('error', message);
                        return;
                    }
                    const data = await res.json();
                    mergeLocalShifts(Array.isArray(data?.results?.upserted) ? data.results.upserted : []);
                } catch (err) {
                    console.error('Network error during batch update:', err);
                    showFeedback('error', 'Не удалось связаться с сервером. Смены не обновлены.');
                    return;
                }
            }
            if (action === 'DELETE') {
                const deleteIds = range
                    .map(cell => shiftsByEmployee[cell.empId]?.[cell.date]?.id)
                    .filter(Boolean) as string[];
                removeLocalShiftIds(deleteIds);
            }
            setSelection(null);
            syncShiftsInBackground();
            showFeedback('success', action === 'DELETE' ? 'Выбранные смены удалены.' : 'Выбранные смены обновлены.');
            return;
        }

        if (action === 'DELETE') {
            if (shift?.id) {
                const res = await deleteShift(shift.id);
                if (res.ok) {
                    removeLocalShiftIds([shift.id]);
                    syncShiftsInBackground();
                }
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

        const res = await saveShift({
            ...payload,
            coefficient: Math.min(parseFloat(payload.coefficient.toString() || '1.0'), 1.5).toString()
        });
        if (res.ok) {
            const updatedShift = await res.json();
            mergeLocalShifts([updatedShift]);
            syncShiftsInBackground();
        }
    }, [contextMenu, selection, getSelectedRange, shiftsByEmployee, showFeedback, mergeLocalShifts, removeLocalShiftIds, syncShiftsInBackground]);

    const handleHandleHover = useCallback((empId: string | null, dateKey: string | null) => {
        if (!isManager && !isSenior) return; // Non-managers/seniors don't see the drag handle
        if (!isDragging && !isFilling) {
            setHandleCell(empId && dateKey ? { empId, dateKey } : null);
        }
    }, [isDragging, isFilling, isManager, isSenior]);

    const handleHandleMouseDown = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (!isManager && !isSenior) return; // Non-managers/seniors cannot drag-to-fill
        const currentHandleCell = handleCellRef.current;
        const currentSelection = selectionRef.current;
        const currentSelectionBounds = selectionBoundsRef.current;

        if (currentHandleCell && !currentSelection) {
            const bounds = currentSelectionBounds;
            if (bounds) {
                setSelection({
                    start: { empId: currentHandleCell.empId, date: currentHandleCell.dateKey },
                    end: { empId: currentHandleCell.empId, date: currentHandleCell.dateKey }
                });
                lastSelectionEndRef.current = { empId: currentHandleCell.empId, date: currentHandleCell.dateKey };
                setIsFilling(true);
                setFillSource(bounds);
                setHandleCell(null);
            }
        } else if (currentSelectionBounds) {
            setIsFilling(true);
            setFillSource(currentSelectionBounds);
        }
    }, [isManager, isSenior]);

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
            <ScheduleToolbar
                currentMonth={currentMonth}
                isAutoFilling={isAutoFilling}
                isClosed={isClosed}
                isManager={isManager}
                canEditShifts={canEditShifts}
                isMonthEmpty={isMonthEmpty}
                monthNorm={monthNorm}
                prevMonthHasShifts={prevMonthHasShifts}
                showManagerControls={userData?.role === 'MANAGER'}
                onAutoFill={handleAutoFill}
                onMonthChange={setCurrentMonth}
                onMonthStatusChange={refreshMonthStatus}
                onOpenNormModal={() => setShowNormModal(true)}
            />

            {feedback && (
                <ScheduleToast
                    type={feedback.type}
                    message={feedback.message}
                    onDismiss={() => setFeedback(null)}
                />
            )}

            <ScheduleGrid
                currentUser={userData}
                days={days}
                employees={employees}
                isClosed={isClosed}
                isColumnCollapsed={isColumnCollapsed}
                isDragging={isDragging}
                isFilling={isFilling}
                isLoading={isOverviewLoading}
                isManager={isManager}
                selectionBounds={selectionBounds}
                shiftsByEmployee={shiftsByEmployee}
                onColumnCollapsedChange={setIsColumnCollapsed}
                onContextMenu={handleContextMenu}
                onDragEnd={handleDragEnd}
                onHandleHover={handleHandleHover}
                onHandleMouseDown={handleHandleMouseDown}
                onMouseDown={handleMouseDown}
                onMouseEnter={handleMouseEnter}
            />

            {showNormModal && (
                <ScheduleNormModal
                    tempNorm={tempNorm}
                    onChangeTempNorm={setTempNorm}
                    onClose={() => setShowNormModal(false)}
                    onSave={handleSaveNorm}
                />
            )}
            {showModal && selectedEmployeeId && (
                <ScheduleShiftModal
                    canEditShifts={canEditShifts}
                    employeeName={employees.find(e => e.id === selectedEmployeeId)?.name}
                    formData={formData}
                    isManager={isManager}
                    isSenior={isSenior}
                    selectedDate={selectedDate}
                    onClose={() => setShowModal(false)}
                    onDelete={handleDeleteShift}
                    onFormDataChange={setFormData}
                    onSave={handleSaveShift}
                />
            )}

            {showBatchModal && (
                <ScheduleBatchModal
                    formData={formData}
                    isManager={isManager}
                    isSenior={isSenior}
                    selectedCount={selection ? getSelectedRange(selection).length : 0}
                    onClose={() => setShowBatchModal(false)}
                    onDelete={handleBatchDelete}
                    onFormDataChange={setFormData}
                    onSave={handleBatchSave}
                />
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


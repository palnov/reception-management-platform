'use client';

import { addMonths, format, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MonthClosureControls } from '@/components/MonthClosureControls';
import { MonthStatusBadge } from '@/components/MonthStatusBadge';

type ScheduleToolbarProps = {
    currentMonth: Date;
    isAutoFilling: boolean;
    isClosed: boolean;
    isManager: boolean;
    canEditShifts: boolean;
    isMonthEmpty: boolean;
    monthNorm: number;
    prevMonthHasShifts: boolean;
    showManagerControls: boolean;
    onAutoFill: () => void;
    onMonthChange: (month: Date) => void;
    onMonthStatusChange: () => void;
    onOpenNormModal: () => void;
};

export function ScheduleToolbar({
    currentMonth,
    isAutoFilling,
    isClosed,
    isManager,
    canEditShifts,
    isMonthEmpty,
    monthNorm,
    prevMonthHasShifts,
    showManagerControls,
    onAutoFill,
    onMonthChange,
    onMonthStatusChange,
    onOpenNormModal,
}: ScheduleToolbarProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="w-full sm:w-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">График смен</h1>
                <div
                    className={`flex items-center gap-2 mt-2 text-sm text-zinc-500 ${isClosed || !isManager ? 'cursor-default' : 'cursor-pointer hover:text-blue-600'} transition-colors group`}
                    onClick={() => !isClosed && isManager && onOpenNormModal()}
                >
                    <span>Норма: </span>
                    <span className={`font-bold ${isClosed ? 'text-zinc-500' : 'text-zinc-900 group-hover:text-blue-600'}`}>{monthNorm}</span>
                    {!isClosed && isManager && <div className="px-1.5 py-0.5 rounded bg-zinc-100 text-[10px] font-bold uppercase tracking-wider">Изм.</div>}
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="flex-1 sm:flex-none">
                    <MonthStatusBadge isClosed={isClosed} />
                </div>
                {showManagerControls && (
                    <div className="flex-1 sm:flex-none">
                        <MonthClosureControls
                            currentMonth={currentMonth}
                            isClosed={isClosed}
                            onStatusChange={onMonthStatusChange}
                        />
                    </div>
                )}
                <div className="flex items-center gap-2 sm:gap-4 bg-white/95 p-1 rounded-full border border-zinc-200 shadow-sm shadow-zinc-950/5 transition-colors w-full sm:w-auto justify-between sm:justify-start">
                    {isMonthEmpty && prevMonthHasShifts && !isClosed && canEditShifts && (
                        <button
                            type="button"
                            onClick={onAutoFill}
                            disabled={isAutoFilling}
                            className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors shadow-sm font-bold text-sm disabled:opacity-50"
                        >
                            {isAutoFilling ? '...' : 'Заполнить'}
                        </button>
                    )}
                    <button type="button" onClick={() => onMonthChange(subMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-100 rounded-full transition-colors" aria-label="Предыдущий месяц">
                        <ChevronLeft className="w-5 h-5 text-zinc-600" />
                    </button>
                    <span className="text-sm sm:text-lg font-semibold min-w-32 sm:w-40 text-center text-zinc-800 capitalize">
                        {format(currentMonth, 'LLLL yyyy', { locale: ru })}
                    </span>
                    <button type="button" onClick={() => onMonthChange(addMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-100 rounded-full transition-colors" aria-label="Следующий месяц">
                        <ChevronRight className="w-5 h-5 text-zinc-600" />
                    </button>
                </div>
            </div>
        </div>
    );
}

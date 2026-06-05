'use client';

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Activity, Briefcase, CheckSquare, Clock, LayoutList, Percent, Timer, X } from 'lucide-react';
import type { Dispatch, FormEvent, SetStateAction } from 'react';
import type { ShiftFormData, ShiftType } from './schedule-types';
import { shouldIncludeActingLeadBonus } from '@/lib/acting-lead-policy';

const shiftTypes: readonly {
    id: ShiftType;
    label: string;
    icon: typeof Briefcase;
    borderColor: string;
    bgColor: string;
    iconBg: string;
    textColor: string;
    ringColor: string;
}[] = [
    { id: 'REGULAR', label: 'Рабочая', icon: Briefcase, borderColor: 'border-blue-500', bgColor: 'bg-blue-50', iconBg: 'bg-blue-500', textColor: 'text-blue-900', ringColor: 'focus-visible:ring-blue-200' },
    { id: 'ARCHIVE_WORK', label: 'Работа в архиве', icon: CheckSquare, borderColor: 'border-amber-500', bgColor: 'bg-amber-50', iconBg: 'bg-amber-500', textColor: 'text-amber-900', ringColor: 'focus-visible:ring-amber-200' },
    { id: 'SICK', label: 'Больничный', icon: Activity, borderColor: 'border-red-500', bgColor: 'bg-red-50', iconBg: 'bg-red-500', textColor: 'text-red-900', ringColor: 'focus-visible:ring-red-200' },
    { id: 'VACATION', label: 'Отпуск', icon: LayoutList, borderColor: 'border-emerald-500', bgColor: 'bg-emerald-50', iconBg: 'bg-emerald-500', textColor: 'text-emerald-900', ringColor: 'focus-visible:ring-emerald-200' },
];

type ScheduleShiftModalProps = {
    canAssignArchiveWork: boolean;
    canEditShifts: boolean;
    employeeName?: string;
    formData: ShiftFormData;
    isManager: boolean;
    isSenior: boolean;
    selectedDate: Date | null;
    onClose: () => void;
    onDelete: () => void;
    onFormDataChange: Dispatch<SetStateAction<ShiftFormData>>;
    onSave: (e?: FormEvent) => void;
};

export function ScheduleShiftModal({
    canAssignArchiveWork,
    canEditShifts,
    employeeName,
    formData,
    isManager,
    isSenior,
    selectedDate,
    onClose,
    onDelete,
    onFormDataChange,
    onSave,
}: ScheduleShiftModalProps) {
    const canChangeProtectedFields = isManager || isSenior;
    const canEditClosingFields = canEditShifts;
    const canChangeTraineeField = canEditShifts;
    const canChangeCoefficientField = canEditShifts;
    const includeActingLeadBonus = selectedDate ? shouldIncludeActingLeadBonus(selectedDate) : false;

    return (
        <div className="fixed inset-0 h-dvh min-h-dvh w-dvw bg-black/60 flex items-center justify-center z-[100] backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-300" onMouseDown={onClose}>
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-8 duration-500" onMouseDown={e => e.stopPropagation()}>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white relative">
                    <button type="button" className="absolute top-6 right-6 opacity-80 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-lg" onClick={onClose} aria-label="Закрыть окно настройки смены">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Настройка смены</h2>
                            <p className="opacity-80 text-sm font-medium">
                                {employeeName} • {selectedDate && format(selectedDate, 'd MMMM', { locale: ru })}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={onSave} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <label className="col-span-2 text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Тип смены</label>
                        {shiftTypes.map(type => {
                            const Icon = type.icon;
                            const isSelected = formData.type === type.id;
                            const canChooseType = canChangeProtectedFields && (canAssignArchiveWork || type.id !== 'ARCHIVE_WORK');

                            return (
                            <button
                                key={type.id}
                                type="button"
                                disabled={!canChooseType}
                                aria-pressed={isSelected}
                                onClick={() => canChooseType && onFormDataChange(prev => ({ ...prev, type: type.id }))}
                                className={`group flex items-center gap-2 rounded-xl border-2 p-3 text-left text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 ${type.ringColor} ${
                                    isSelected
                                        ? `${type.borderColor} ${type.bgColor} ${type.textColor}`
                                        : 'border-zinc-100 bg-zinc-50/70 text-zinc-600 hover:border-zinc-200 hover:bg-white'
                                } ${!canChooseType ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                    isSelected ? `${type.iconBg} text-white` : 'bg-white text-zinc-400 group-hover:text-zinc-500'
                                }`}>
                                    <Icon className="h-4 w-4" />
                                </span>
                                <span className="leading-tight">{type.label}</span>
                            </button>
                            );
                        })}

                        {formData.type !== 'SICK' && formData.type !== 'VACATION' && (
                            <>
                                <label className="space-y-2">
                                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Часы</span>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            step="1"
                                            min="1"
                                            max="11"
                                            value={formData.hours}
                                            disabled={!canChangeProtectedFields}
                                            onChange={e => onFormDataChange(prev => ({ ...prev, hours: e.target.value }))}
                                            className="w-full show-spinners rounded-xl border-2 border-zinc-100 bg-zinc-50 p-3 pl-10 font-bold tabular-nums transition-colors focus:border-blue-500 focus:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:opacity-60"
                                        />
                                        <Timer className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-blue-500" />
                                    </div>
                                </label>
                                <label className="space-y-2">
                                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Коэффициент</span>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="1"
                                            max="1.5"
                                            value={formData.coefficient}
                                            disabled={!canChangeCoefficientField}
                                            onChange={e => onFormDataChange(prev => ({ ...prev, coefficient: e.target.value }))}
                                            className="w-full show-spinners rounded-xl border-2 border-zinc-100 bg-zinc-50 p-3 pl-10 font-bold tabular-nums transition-colors focus:border-blue-500 focus:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:opacity-60"
                                        />
                                        <Percent className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-blue-500" />
                                    </div>
                                </label>
                            </>
                        )}
                    </div>

                    {formData.type !== 'SICK' && formData.type !== 'VACATION' && (
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                ['cabinetClosed', 'Открытие/Закрытие', '+250р.', canEditClosingFields],
                                ['centerClosed', 'Открытие + Закрытие', '+500р.', canEditClosingFields],
                                ['isTrainee', 'Обучение стажера', '+500р.', canChangeTraineeField],
                            ].map(([field, label, bonus, canEdit]) => (
                                <div key={field as string} className={`flex items-center p-3 bg-zinc-50 rounded-xl border-2 border-zinc-100 transition-all ${canEdit ? 'cursor-pointer hover:border-blue-100' : 'cursor-not-allowed opacity-60'}`} onClick={() => canEdit && onFormDataChange(prev => ({ ...prev, [field as keyof ShiftFormData]: !prev[field as keyof ShiftFormData] }))}>
                                    <input type="checkbox" checked={Boolean(formData[field as keyof ShiftFormData])} readOnly className="w-5 h-5 text-blue-600 rounded-lg border-zinc-300 pointer-events-none" />
                                    <label className={`text-sm font-bold text-zinc-700 ml-3 select-none flex items-center justify-between flex-1 ${canEdit ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                                        <span>{label}</span>
                                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold">{bonus}</span>
                                    </label>
                                </div>
                            ))}
                            {includeActingLeadBonus && (
                                <div className="flex items-center p-3 bg-zinc-50 rounded-xl border-2 border-zinc-100 cursor-pointer hover:border-blue-100 transition-all" onClick={() => canChangeProtectedFields && onFormDataChange(prev => ({ ...prev, isActingLead: !prev.isActingLead }))}>
                                    <input type="checkbox" checked={formData.isActingLead} readOnly className="w-5 h-5 text-indigo-600 rounded-lg border-zinc-300 pointer-events-none" />
                                    <label className="text-sm font-bold text-zinc-700 ml-3 cursor-pointer select-none flex items-center justify-between flex-1">
                                        <span>ИО старшей смены</span>
                                        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs font-bold">+250р.</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        {canChangeProtectedFields && (
                            <button type="button" onClick={onDelete} disabled={!canEditShifts} className={`px-6 py-3 border-2 border-red-50 rounded-xl text-red-500 bg-red-50/50 hover:bg-red-50 hover:border-red-100 transition-all font-bold text-sm ${!canEditShifts ? 'opacity-60 cursor-not-allowed' : ''}`}>
                                Удалить
                            </button>
                        )}
                        <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold text-sm">
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

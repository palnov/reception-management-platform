'use client';

import { Activity, Briefcase, CheckSquare, Layers, LayoutList, Percent, Timer, X } from 'lucide-react';
import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { Tooltip } from '@/components/Tooltip';
import type { ShiftFormData, ShiftType } from './schedule-types';

const shiftTypes: readonly {
    id: ShiftType;
    label: string;
    icon: typeof Briefcase;
    borderColor: string;
    bgColor: string;
    iconBg: string;
    textColor: string;
}[] = [
    { id: 'REGULAR', label: 'Рабочая', icon: Briefcase, borderColor: 'border-blue-500', bgColor: 'bg-blue-50', iconBg: 'bg-blue-500', textColor: 'text-blue-900' },
    { id: 'ARCHIVE_WORK', label: 'Работа в архиве', icon: CheckSquare, borderColor: 'border-amber-500', bgColor: 'bg-amber-50', iconBg: 'bg-amber-500', textColor: 'text-amber-900' },
    { id: 'SICK', label: 'Больничный', icon: Activity, borderColor: 'border-red-500', bgColor: 'bg-red-50', iconBg: 'bg-red-500', textColor: 'text-red-900' },
    { id: 'VACATION', label: 'Отпуск', icon: LayoutList, borderColor: 'border-emerald-500', bgColor: 'bg-emerald-50', iconBg: 'bg-emerald-500', textColor: 'text-emerald-900' },
];

type ScheduleBatchModalProps = {
    formData: ShiftFormData;
    isManager: boolean;
    isSenior: boolean;
    selectedCount: number;
    onClose: () => void;
    onDelete: () => void;
    onFormDataChange: Dispatch<SetStateAction<ShiftFormData>>;
    onSave: (e?: FormEvent) => void;
};

export function ScheduleBatchModal({
    formData,
    isManager,
    isSenior,
    selectedCount,
    onClose,
    onDelete,
    onFormDataChange,
    onSave,
}: ScheduleBatchModalProps) {
    const canChangeProtectedFields = isManager || isSenior;

    return (
        <div className="fixed inset-0 h-dvh min-h-dvh w-dvw bg-black/60 flex items-center justify-center z-[100] backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-300" onMouseDown={onClose}>
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-8 duration-500" onMouseDown={e => e.stopPropagation()}>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white relative">
                    <button type="button" className="absolute top-6 right-6 opacity-80 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-lg" onClick={onClose} aria-label="Закрыть окно массового изменения">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Массовое изменение</h2>
                            <p className="opacity-80 text-sm font-medium">Выбрано ячеек: {selectedCount}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={onSave} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Тип смены</label>
                            <div className="grid grid-cols-2 gap-2">
                                {shiftTypes.map(type => (
                                    <button
                                        type="button"
                                        key={type.id}
                                        onClick={() => onFormDataChange(prev => ({ ...prev, type: type.id }))}
                                        aria-pressed={formData.type === type.id}
                                        className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left group ${formData.type === type.id
                                            ? `${type.borderColor} ${type.bgColor}`
                                            : 'border-zinc-100 bg-zinc-50/50 hover:border-zinc-200 hover:bg-zinc-50'}`}
                                    >
                                        <div className={`p-1.5 rounded-lg transition-colors ${formData.type === type.id ? `${type.iconBg} text-white` : 'bg-white text-zinc-400 group-hover:text-zinc-500'}`}>
                                            <type.icon className="w-3.5 h-3.5" />
                                        </div>
                                        <span className={`text-sm font-bold ${formData.type === type.id ? type.textColor : 'text-zinc-600'}`}>{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {formData.type !== 'SICK' && formData.type !== 'VACATION' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Часы</label>
                                    <Tooltip content={!canChangeProtectedFields ? 'Только менеджер и старший смены могут изменять эти поля' : ''}>
                                        <div className="relative group">
                                            <input
                                                type="number"
                                                value={formData.hours}
                                                disabled={!canChangeProtectedFields}
                                                onChange={e => onFormDataChange(prev => ({ ...prev, hours: e.target.value }))}
                                                className={`w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl p-3 pl-10 font-bold focus:border-blue-500 focus:bg-white transition-all ${!canChangeProtectedFields ? 'opacity-60 cursor-not-allowed bg-zinc-100' : ''}`}
                                            />
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                                                <Timer className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </Tooltip>
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
                                            onChange={e => onFormDataChange(prev => ({ ...prev, coefficient: e.target.value }))}
                                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl p-3 pl-10 font-bold focus:border-blue-500 focus:bg-white transition-all"
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                                            <Percent className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {[
                            ['cabinetClosed', 'Открытие/Закрытие', '+250р.'],
                            ['centerClosed', 'Открытие + Закрытие', '+500р.'],
                            ['isTrainee', 'Обучение стажера', '+500р.'],
                        ].map(([field, label, bonus]) => (
                            <div key={field} className="flex items-center p-3 bg-zinc-50 rounded-xl border-2 border-zinc-100 cursor-pointer hover:border-blue-100 transition-all" onClick={() => onFormDataChange(prev => ({ ...prev, [field]: !prev[field as keyof ShiftFormData] }))}>
                                <input type="checkbox" checked={Boolean(formData[field as keyof ShiftFormData])} readOnly className="w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 border-zinc-300 transition-all pointer-events-none" />
                                <label className="text-sm font-bold text-zinc-700 ml-3 cursor-pointer select-none flex items-center justify-between flex-1">
                                    <span>{label}</span>
                                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold">{bonus}</span>
                                </label>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onDelete} className="px-6 py-3 border-2 border-red-50 rounded-xl text-red-500 bg-red-50/50 hover:bg-red-50 hover:border-red-100 transition-all font-bold text-sm">
                            Удалить
                        </button>
                        <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-200 font-bold text-sm">
                            Применить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

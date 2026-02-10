'use client';

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { X, ArrowRight, User, Calendar, Trash2, Plus, Edit2 } from 'lucide-react';
import { formatFieldName, formatValue } from '@/lib/auditUtils';

interface AuditLog {
    id: string;
    action: string;
    changedBy: string;
    changedByRole: string;
    timestamp: string;
    details: string | null;
}

interface AuditHistoryModalProps {
    logs: AuditLog[];
    onClose: () => void;
}

export function AuditHistoryModal({ logs, onClose }: AuditHistoryModalProps) {
    if (!logs || logs.length === 0) return null;

    return (
        <div
            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-in fade-in duration-300"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 audit-modal-content"
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-zinc-100">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900">История изменений</h2>
                        <p className="text-zinc-500 text-sm mt-1">Полный журнал действий</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-zinc-400" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-6">
                    {logs.map((log, index) => {
                        let details: any = null;
                        try {
                            if (log.details) details = JSON.parse(log.details);
                        } catch (e) { }

                        const isCreate = log.action === 'CREATE';
                        const isUpdate = log.action === 'UPDATE';
                        const isDelete = log.action === 'DELETE';

                        return (
                            <div key={log.id} className="relative pl-8 pb-2 group">
                                {/* Timeline line */}
                                {index !== logs.length - 1 && (
                                    <div className="absolute left-[11px] top-8 bottom-[-24px] w-px bg-zinc-200 group-last:hidden" />
                                )}

                                {/* Icon */}
                                <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 z-10 bg-white
                                    ${isCreate ? 'border-green-500 text-green-500' :
                                        isDelete ? 'border-red-500 text-red-500' :
                                            'border-blue-500 text-blue-500'}`
                                }>
                                    {isCreate && <Plus className="w-3 h-3" />}
                                    {isDelete && <Trash2 className="w-3 h-3" />}
                                    {isUpdate && <Edit2 className="w-3 h-3" />}
                                </div>

                                <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 shadow-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-3 border-b border-zinc-200 pb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="font-bold text-zinc-800 flex items-center gap-2">
                                                <User className="w-4 h-4 text-zinc-400" />
                                                {log.changedBy}
                                                <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
                                                    {log.changedByRole === 'MANAGER' ? 'Рук.' : log.changedByRole === 'SENIOR' ? 'Ст.' : 'Адм.'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {format(new Date(log.timestamp), 'd MMMM yyyy, HH:mm', { locale: ru })}
                                        </div>
                                    </div>

                                    {/* Action Label */}
                                    <div className="mb-3">
                                        <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded border
                                            ${isCreate ? 'bg-green-50 text-green-700 border-green-200' :
                                                isDelete ? 'bg-red-50 text-red-700 border-red-200' :
                                                    'bg-blue-50 text-blue-700 border-blue-200'}`
                                        }>
                                            {isCreate ? 'Создание' : isDelete ? 'Удаление' : 'Изменение'}
                                        </span>
                                    </div>

                                    {/* Diff content */}
                                    {details && (
                                        <div className="space-y-2 mt-4">
                                            {isUpdate ? (
                                                <div className="grid grid-cols-1 gap-2">
                                                    {Object.entries(details).map(([key, value]: [string, any]) => (
                                                        <div key={key} className="flex items-center justify-between bg-white p-2 rounded-lg border border-zinc-200 text-sm">
                                                            <span className="font-medium text-zinc-500">{formatFieldName(key)}</span>
                                                            <div className="flex items-center gap-2 font-mono text-xs">
                                                                <span className="text-red-500 line-through decoration-red-300">{formatValue(value.old, key)}</span>
                                                                <ArrowRight className="w-3 h-3 text-zinc-300" />
                                                                <span className="text-green-600 font-bold bg-green-50 px-1 rounded">{formatValue(value.new, key)}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-2">
                                                    {Object.entries(details).map(([key, value]: [string, any]) => (
                                                        <div key={key} className="bg-white p-2 rounded-lg border border-zinc-200 text-xs">
                                                            <span className="block text-zinc-400 mb-0.5">{formatFieldName(key)}</span>
                                                            <span className="font-semibold text-zinc-700 truncate block" title={String(value)}>
                                                                {formatValue(value, key)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {!details && (
                                        <div className="text-xs text-zinc-400 italic">Нет деталей</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

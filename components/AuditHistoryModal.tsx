'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { X, ArrowRight, Trash2, Plus, Edit2, ChevronDown, ChevronUp, History } from 'lucide-react';
import { formatFieldName, formatValue } from '@/lib/auditUtils';

interface AuditLog {
    id: string;
    action: string;
    changedBy: string;
    changedByRole: string;
    timestamp: string;
    details: string | null;
    entityId?: string;
    entityType?: string;
}

interface AuditHistoryModalProps {
    logs: AuditLog[];
    onClose: () => void;
}

const IGNORED_FIELDS = ['id', 'employeeId', 'date', 'createdAt', 'createdBy', 'isDeleted'];

export function AuditHistoryModal({ logs, onClose }: AuditHistoryModalProps) {
    const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
    const [fetchedLogs, setFetchedLogs] = useState<{ key: string; logs: AuditLog[] } | null>(null);
    const fetchTarget = useMemo(() => {
        const needsFetch = logs.some(l => l.details === null || l.details === undefined);
        const firstLog = logs[0];
        if (!needsFetch || !firstLog?.entityId) return null;

        const entityType = firstLog.entityType || 'SHIFT';
        return {
            key: `${entityType}:${firstLog.entityId}`,
            entityId: firstLog.entityId,
            entityType,
        };
    }, [logs]);

    const localLogs = fetchTarget && fetchedLogs?.key === fetchTarget.key ? fetchedLogs.logs : logs;
    const isLoading = !!fetchTarget && fetchedLogs?.key !== fetchTarget.key;

    useEffect(() => {
        if (!fetchTarget || fetchedLogs?.key === fetchTarget.key) return;

        const controller = new AbortController();
        const params = new URLSearchParams({
            entityId: fetchTarget.entityId,
            entityType: fetchTarget.entityType,
        });

        fetch(`/api/audit-logs?${params.toString()}`, { signal: controller.signal })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setFetchedLogs({ key: fetchTarget.key, logs: data });
                }
            })
            .catch(error => {
                if ((error as Error).name !== 'AbortError') {
                    console.error('Failed to fetch audit details:', error);
                }
            });

        return () => controller.abort();
    }, [fetchTarget, fetchedLogs?.key]);

    const parseDetails = (details: string | null) => {
        if (!details) return null;
        try {
            const parsed = JSON.parse(details);
            if (parsed && typeof parsed === 'object') {
                return parsed as Record<string, unknown>;
            }
        } catch {
            return null;
        }
        return null;
    };

    if (!logs || logs.length === 0) return null;

    const toggleExpand = (id: string) => {
        setExpandedLogs(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getActionInfo = (log: AuditLog) => {
        const details = parseDetails(log.details);

        if (log.action === 'CREATE') {
            return {
                label: 'Создала',
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                icon: <Plus className="w-3.5 h-3.5" />
            };
        }
        if (log.action === 'DELETE') {
            return {
                label: 'Удалила',
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                icon: <Trash2 className="w-3.5 h-3.5" />
            };
        }

        // Special check for isDeleted: true -> false (re-entry)
        const isDeletedDiff = details?.isDeleted as { old?: unknown; new?: unknown } | undefined;
        const isReentry = isDeletedDiff?.old === true && isDeletedDiff.new === false;
        if (isReentry) {
            return {
                label: 'Добавила',
                color: 'text-emerald-600',
                bgColor: 'bg-emerald-50',
                borderColor: 'border-emerald-200',
                icon: <Plus className="w-3.5 h-3.5" />
            };
        }

        return {
            label: 'Изменила',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            icon: <Edit2 className="w-3.5 h-3.5" />
        };
    };

    return (
        <div
            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-in fade-in duration-300"
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.stopPropagation()}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                onContextMenu={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center px-6 py-5 border-b border-zinc-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 pointer-events-none">
                            <History className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 leading-tight">История изменений</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-zinc-400" />
                    </button>
                </div>

                <div className="overflow-y-auto p-4 space-y-3 relative min-h-[200px]">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10 transition-all">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-medium text-zinc-500">Загрузка истории...</span>
                            </div>
                        </div>
                    )}
                    {localLogs.map((log) => {
                        const details = parseDetails(log.details);

                        const info = getActionInfo(log);
                        const isExpanded = expandedLogs[log.id];

                        // Filter details to only show relevant fields
                        const filteredEntries = details ? Object.entries(details).filter(([key]) => !IGNORED_FIELDS.includes(key)) : [];
                        const hasDetails = filteredEntries.length > 0;

                        return (
                            <div key={log.id} className="bg-white border border-zinc-100 rounded-2xl shadow-sm hover:border-zinc-200 transition-all overflow-hidden">
                                <div
                                    className={`p-4 flex items-center justify-between cursor-pointer ${hasDetails ? 'hover:bg-zinc-50/50' : ''}`}
                                    onClick={() => hasDetails && toggleExpand(log.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white ${info.color.replace('text', 'border')} ${info.color}`}>
                                            {info.icon}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-zinc-800 text-sm">{log.changedBy}</span>
                                                <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
                                                    {log.changedByRole === 'MANAGER' ? 'Рук.' : log.changedByRole === 'SENIOR' ? 'Ст.' : 'Адм.'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`text-xs font-bold ${info.color}`}>{info.label} данные</span>
                                                <span className="text-zinc-300">•</span>
                                                <span className="text-[11px] text-zinc-400 font-medium">
                                                    {format(new Date(log.timestamp), 'd MMM, HH:mm', { locale: ru })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {hasDetails && (
                                        <div className="text-zinc-400">
                                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </div>
                                    )}
                                </div>

                                {isExpanded && hasDetails && (
                                    <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2 duration-200">
                                        <div className="bg-zinc-50/50 rounded-xl border border-zinc-100 p-3 space-y-2">
                                            {filteredEntries.map(([key, value]) => (
                                                <div key={key} className="flex flex-col gap-1 border-b border-zinc-100 last:border-0 pb-2 last:pb-0">
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{formatFieldName(key)}</span>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        {log.action === 'UPDATE' && value && typeof value === 'object' && 'old' in value && 'new' in value ? (
                                                            <>
                                                                <span className="text-red-400 line-through text-xs">{formatValue(value.old, key)}</span>
                                                                <ArrowRight className="w-3 h-3 text-zinc-300" />
                                                                <span className="text-zinc-700 font-semibold">{formatValue(value.new, key)}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-zinc-700 font-semibold">{formatValue(value, key)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

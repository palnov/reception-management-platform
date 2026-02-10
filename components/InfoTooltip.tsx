
'use client';

import { Info, Clock, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AuditHistoryModal } from './AuditHistoryModal';

interface AuditLog {
    id: string;
    action: string;
    changedBy: string;
    changedByRole: string;
    timestamp: string;
    details: string | null;
}


interface CurrentUser {
    id: string;
    name: string;
    role: string;
}

interface InfoTooltipProps {
    logs: AuditLog[];
    className?: string;
    onAuditClick?: () => void;
    currentUser?: CurrentUser | null;
    createdBy?: string;
}

export function InfoTooltip({ logs, className = "", onAuditClick, currentUser, createdBy }: InfoTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const iconRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isVisible && iconRef.current) {
            const rect = iconRef.current.getBoundingClientRect();
            setPosition({
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX + rect.width / 2
            });
        }
    }, [isVisible]);

    // Visibility Logic
    let shouldShow = false;

    // If we don't have user info yet, decide safe default or hide? Hide to avoid flicker.
    if (currentUser) {
        const isManager = currentUser.role === 'MANAGER';
        const isMe = (name: string) => name === currentUser.name;
        const creatorName = createdBy || ''; // If undefined, assume NOT me (safe?) or handle 'system'?

        // Find if any log is by "Other"
        const hasEditsByOther = logs.some(l => !isMe(l.changedBy));

        if (isManager) {
            // 1. Created by other
            const createdByOther = !isMe(creatorName);
            // 2. Created by Me but edited by other
            if (createdByOther) shouldShow = true;
            else if (hasEditsByOther) shouldShow = true;
        } else {
            // Employee
            // 1. Created by Me AND edited by other
            const createdByMe = isMe(creatorName);
            if (createdByMe && hasEditsByOther) shouldShow = true;
        }
    } else {
        // Fallback or loading state
        // If critical to show 'i' before load, we might default to logic based on logs only?
        // But the requirements are strict. Hide until loaded.
        return null;
    }

    if (!shouldShow) return null;


    const lastLog = logs[0];

    const tooltipContent = isVisible && mounted && !showHistory ? (
        <div
            className="fixed pointer-events-none"
            style={{
                zIndex: 2147483647,
                top: `${position.top - 10}px`,
                left: `${position.left}px`,
                transform: 'translate(-50%, -100%)'
            }}
        >
            <div className="bg-zinc-900/90 backdrop-blur text-white rounded-xl shadow-2xl p-3 w-64 animate-in fade-in zoom-in-95 duration-150 border border-zinc-700/50">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span className="text-xs font-semibold text-zinc-200">Последнее изменение</span>
                </div>

                <div className="flex justify-between items-start gap-3">
                    <div>
                        <div className="text-xs font-bold text-white">{lastLog.changedBy}</div>
                        <div className="text-[10px] text-zinc-400">
                            {lastLog.changedByRole === 'MANAGER' ? 'Руководитель' : lastLog.changedByRole === 'SENIOR' ? 'Старший смены' : 'Администратор'}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-mono text-zinc-300">
                            {format(new Date(lastLog.timestamp), 'dd.MM', { locale: ru })}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500">
                            {format(new Date(lastLog.timestamp), 'HH:mm', { locale: ru })}
                        </div>
                    </div>
                </div>

                <div className="mt-3 pt-2 border-t border-white/10 text-center hidden">
                    <span className="text-[10px] text-blue-300 font-medium flex items-center justify-center gap-1">
                        <RotateCcw className="w-3 h-3" /> Нажмите для истории
                    </span>
                </div>
            </div>
        </div>
    ) : null;

    const stop = (e: React.MouseEvent | React.PointerEvent) => {
        e.stopPropagation();
        if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
    };

    const handleIconClick = (e: React.MouseEvent) => {
        stop(e);
        e.preventDefault();
        onAuditClick?.();
        setShowHistory(true);
        setIsVisible(false);
    };

    return (
        <>
            <div
                ref={iconRef}
                className={`absolute top-0.5 right-0.5 z-[30] audit-tooltip-trigger cursor-pointer ${className}`}
                data-audit-ignore="true"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                // Capture phase guards
                onMouseDownCapture={stop}
                onMouseUpCapture={stop}
                onPointerDownCapture={stop}
                onPointerUpCapture={stop}
                onContextMenuCapture={stop}
                onClickCapture={handleIconClick}
                // Bubble phase guards
                onMouseDown={stop}
                onMouseUp={stop}
                onPointerDown={stop}
                onPointerUp={stop}
                onContextMenu={stop}
                onClick={handleIconClick}
            >
                <div className="text-blue-400/80 hover:text-blue-600 transition-colors pointer-events-none">
                    <Info className="w-2.5 h-2.5" />
                </div>
            </div>
            {mounted && tooltipContent && createPortal(tooltipContent, document.body)}
            {showHistory && createPortal(
                <AuditHistoryModal logs={logs} onClose={() => setShowHistory(false)} />,
                document.body
            )}
        </>
    );
}

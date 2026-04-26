'use client';

import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Layers, Palmtree, Stethoscope, Trash2 } from 'lucide-react';
import { useIsClient } from '@/lib/useIsClient';

interface QuickContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onAction: (action: 'SICK' | 'VACATION' | 'DELETE' | 'BATCH_EDIT') => void;
    showBatchOption?: boolean;
}

export function QuickContextMenu({ x, y, onClose, onAction, showBatchOption }: QuickContextMenuProps) {
    const isClient = useIsClient();

    useEffect(() => {
        const handleClick = () => onClose();
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };

        window.addEventListener('click', handleClick);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('click', handleClick);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const pos = useMemo(() => {
        if (!isClient) return { x, y };

        const padding = 8;
        const menuWidth = 192;
        const estimatedHeight = showBatchOption ? 250 : 190;

        return {
            x: Math.min(Math.max(x, padding), window.innerWidth - menuWidth - padding),
            y: Math.min(Math.max(y, padding), window.innerHeight - estimatedHeight - padding)
        };
    }, [isClient, showBatchOption, x, y]);

    if (!isClient) return null;

    return createPortal(
        <div
            className="fixed z-[999999] bg-zinc-900 text-white rounded-xl shadow-2xl border border-zinc-700 py-1.5 w-48 animate-in fade-in zoom-in-95 duration-100"
            style={{
                left: pos.x,
                top: pos.y,
                filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))',
            }}
            onClick={(event) => event.stopPropagation()}
        >
            {showBatchOption && (
                <>
                    <MenuButton
                        icon={<Layers className="w-4 h-4" />}
                        label="Изменить"
                        hint="Выбранные ячейки"
                        tone="blue"
                        onClick={() => onAction('BATCH_EDIT')}
                    />
                    <div className="my-1 border-t border-zinc-800/50" />
                </>
            )}

            <MenuButton
                icon={<Stethoscope className="w-4 h-4" />}
                label="Больничный"
                hint='Поставить "Б"'
                tone="red"
                onClick={() => onAction('SICK')}
            />
            <MenuButton
                icon={<Palmtree className="w-4 h-4" />}
                label="Отпуск"
                hint='Поставить "О"'
                tone="green"
                onClick={() => onAction('VACATION')}
            />

            <div className="my-1 border-t border-zinc-800/50" />

            <MenuButton
                icon={<Trash2 className="w-4 h-4" />}
                label="Очистить"
                hint="Удалить смену"
                tone="zinc"
                onClick={() => onAction('DELETE')}
            />
        </div>,
        document.body
    );
}

function MenuButton({
    icon,
    label,
    hint,
    tone,
    onClick,
}: {
    icon: ReactNode;
    label: string;
    hint: string;
    tone: 'blue' | 'red' | 'green' | 'zinc';
    onClick: () => void;
}) {
    const toneClasses = {
        blue: 'text-blue-400 bg-blue-500/20 group-hover:bg-blue-500/30',
        red: 'text-red-400 bg-red-500/20 group-hover:bg-red-500/30',
        green: 'text-green-400 bg-green-500/20 group-hover:bg-green-500/30',
        zinc: 'text-zinc-500 bg-zinc-800 group-hover:bg-red-500/20 group-hover:text-red-400',
    }[tone];

    return (
        <button
            onClick={onClick}
            className={`w-full px-4 py-2 text-left hover:bg-zinc-800 flex items-center gap-3 transition-colors text-sm group ${tone === 'zinc' ? 'text-zinc-400 hover:text-red-400' : ''}`}
        >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${toneClasses}`}>
                {icon}
            </div>
            <div>
                <div className="font-semibold">{label}</div>
                <div className="text-[10px] text-zinc-500">{hint}</div>
            </div>
        </button>
    );
}


'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Stethoscope, Palmtree, Trash2 } from 'lucide-react';

interface QuickContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onAction: (action: 'SICK' | 'VACATION' | 'DELETE') => void;
}

export function QuickContextMenu({ x, y, onClose, onAction }: QuickContextMenuProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleClick = () => onClose();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('click', handleClick);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('click', handleClick);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    if (!mounted) return null;

    return createPortal(
        <div
            className="fixed z-[999999] bg-zinc-900 text-white rounded-xl shadow-2xl border border-zinc-700 py-1.5 w-48 animate-in fade-in zoom-in-95 duration-100"
            style={{
                left: x,
                top: y,
                filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))'
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <button
                onClick={() => onAction('SICK')}
                className="w-full px-4 py-2 text-left hover:bg-zinc-800 flex items-center gap-3 transition-colors text-sm group"
            >
                <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                    <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                    <div className="font-semibold">Больничный</div>
                    <div className="text-[10px] text-zinc-500">Поставить "Б"</div>
                </div>
            </button>

            <button
                onClick={() => onAction('VACATION')}
                className="w-full px-4 py-2 text-left hover:bg-zinc-800 flex items-center gap-3 transition-colors text-sm group"
            >
                <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                    <Palmtree className="w-4 h-4" />
                </div>
                <div>
                    <div className="font-semibold">Отпуск</div>
                    <div className="text-[10px] text-zinc-500">Поставить "О"</div>
                </div>
            </button>

            <div className="my-1 border-t border-zinc-800/50" />

            <button
                onClick={() => onAction('DELETE')}
                className="w-full px-4 py-2 text-left hover:bg-zinc-800 flex items-center gap-3 transition-colors text-sm group text-zinc-400 hover:text-red-400"
            >
                <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-500 flex items-center justify-center group-hover:bg-red-500/20 group-hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                </div>
                <div>
                    <div className="font-semibold">Очистить</div>
                    <div className="text-[10px] text-zinc-500">Удалить смену</div>
                </div>
            </button>
        </div>,
        document.body
    );
}

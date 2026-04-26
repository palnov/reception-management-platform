
'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useIsClient } from '@/lib/useIsClient';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    className?: string;
}

export function Tooltip({ content, children, className = '' }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const isClient = useIsClient();

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!content) return;
        setPosition({
            x: e.clientX,
            y: e.clientY
        });
    };

    const handleMouseEnter = () => {
        if (content) setIsVisible(true);
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    return (
        <div
            className={className}
            style={{ display: 'contents' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
        >
            {children}
            {isClient && isVisible && content && createPortal(
                <div
                    className="fixed z-[9999] pointer-events-none"
                    style={{
                        top: `${position.y - 15}px`,
                        left: `${position.x}px`,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    <div className="bg-zinc-900/90 backdrop-blur-md text-white text-[11px] px-3 py-2 rounded-xl shadow-2xl border border-white/10 max-w-[220px] text-center leading-tight whitespace-pre-line animate-in fade-in zoom-in duration-200">
                        {content}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-zinc-900/90" />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

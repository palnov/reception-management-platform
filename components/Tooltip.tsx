
'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const targetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isVisible && targetRef.current) {
            const rect = targetRef.current.getBoundingClientRect();
            setPosition({
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX + rect.width / 2
            });
        }
    }, [isVisible]);

    return (
        <div
            ref={targetRef}
            className="inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && createPortal(
                <div
                    className="fixed z-[9999] pointer-events-none"
                    style={{
                        top: `${position.top - 8}px`,
                        left: `${position.left}px`,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    <div className="bg-zinc-800 text-white text-[11px] px-2 py-1.5 rounded shadow-lg max-w-[200px] text-center leading-tight">
                        {content}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

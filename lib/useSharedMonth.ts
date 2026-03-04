'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'shared_selected_month';

function getStoredMonth(): Date {
    if (typeof window === 'undefined') return new Date();
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = new Date(stored);
            if (!isNaN(parsed.getTime())) return parsed;
        }
    } catch {}
    return new Date();
}

function storeMonth(date: Date) {
    try {
        localStorage.setItem(STORAGE_KEY, date.toISOString());
    } catch {}
}

export function useSharedMonth(): [Date, (date: Date) => void] {
    const [currentMonth, setCurrentMonthState] = useState<Date>(getStoredMonth);

    // Listen for changes from other tabs/pages
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                const parsed = new Date(e.newValue);
                if (!isNaN(parsed.getTime())) {
                    setCurrentMonthState(parsed);
                }
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const setCurrentMonth = useCallback((date: Date) => {
        storeMonth(date);
        setCurrentMonthState(date);
        // Dispatch custom event so other pages in the SAME tab can also sync
        window.dispatchEvent(new StorageEvent('storage', {
            key: STORAGE_KEY,
            newValue: date.toISOString(),
        }));
    }, []);

    return [currentMonth, setCurrentMonth];
}

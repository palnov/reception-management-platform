'use client';

import { useState, useEffect, useCallback } from 'react';
import { startOfMonth } from 'date-fns';

const STORAGE_KEY = 'shared_selected_month';

function getStoredMonth(): Date {
    if (typeof window === 'undefined') return new Date();
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = new Date(stored);
            if (!isNaN(parsed.getTime())) return parsed;
        }
    } catch { }
    return new Date();
}

function storeMonth(date: Date) {
    try {
        localStorage.setItem(STORAGE_KEY, date.toISOString());
    } catch { }
}

export function useSharedMonth(): [Date, (date: Date) => void] {
    // Start with current date normalized to start of month to avoid hydration mismatch
    // and time-of-day issues.
    const [currentMonth, setCurrentMonthState] = useState<Date>(() => startOfMonth(getStoredMonth()));

    // Sync with localStorage on mount and listen for changes
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

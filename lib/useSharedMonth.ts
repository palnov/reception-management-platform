'use client';

import { useState, useEffect, useCallback } from 'react';
import { startOfMonth } from 'date-fns';

const STORAGE_KEY = 'shared_selected_month';

function parseInitialMonth(initialMonth?: string): Date | null {
    if (!initialMonth) return null;

    const match = /^(\d{4})-(\d{2})$/.exec(initialMonth);
    if (!match) return null;

    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;
    if (monthIndex < 0 || monthIndex > 11) return null;

    return new Date(year, monthIndex, 1);
}

function getInitialMonth(initialMonth?: string): Date {
    return startOfMonth(parseInitialMonth(initialMonth) ?? new Date());
}

function getStoredMonth(): Date | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = new Date(stored);
            if (!isNaN(parsed.getTime())) return parsed;
        }
    } catch { }
    return null;
}

function storeMonth(date: Date) {
    try {
        localStorage.setItem(STORAGE_KEY, date.toISOString());
    } catch { }
}

export function useSharedMonth(initialMonth?: string): [Date, (date: Date) => void] {
    const [currentMonth, setCurrentMonthState] = useState<Date>(() => getInitialMonth(initialMonth));

    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                const parsed = new Date(e.newValue);
                if (!isNaN(parsed.getTime())) {
                    setCurrentMonthState(startOfMonth(parsed));
                }
            }
        };
        window.addEventListener('storage', handleStorage);

        const syncStoredMonth = window.setTimeout(() => {
            const storedMonth = getStoredMonth();
            if (storedMonth) {
                setCurrentMonthState(startOfMonth(storedMonth));
            }
        }, 0);

        return () => {
            window.clearTimeout(syncStoredMonth);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    const setCurrentMonth = useCallback((date: Date) => {
        const month = startOfMonth(date);
        storeMonth(month);
        setCurrentMonthState(month);
        // Dispatch custom event so other pages in the SAME tab can also sync
        window.dispatchEvent(new StorageEvent('storage', {
            key: STORAGE_KEY,
            newValue: month.toISOString(),
        }));
    }, []);

    return [currentMonth, setCurrentMonth];
}

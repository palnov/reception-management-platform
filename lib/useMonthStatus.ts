'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth } from 'date-fns';

export function useMonthStatus(currentMonth: Date) {
  const [isClosed, setIsClosed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const m = format(startOfMonth(currentMonth), 'yyyy-MM');
      const res = await fetch(`/api/months/status?month=${m}`);
      if (res.ok) {
        const data = await res.json();
        setIsClosed(!!data.isClosed);
      }
    } catch (error) {
      console.error('Failed to fetch month status', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchStatus();
    
    // Listen for custom event "monthStatusChanged" if we want instant sync across components
    const handleUpdate = () => fetchStatus();
    window.addEventListener('monthStatusChanged', handleUpdate);
    return () => window.removeEventListener('monthStatusChanged', handleUpdate);
  }, [fetchStatus]);

  return { isClosed, isLoading, refresh: fetchStatus };
}

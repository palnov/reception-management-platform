'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { format, startOfMonth } from 'date-fns';

export function useMonthStatus(currentMonth: Date) {
  const [isClosed, setIsClosed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const statusRequestIdRef = useRef(0);

  const fetchStatus = useCallback(async () => {
    const requestId = ++statusRequestIdRef.current;

    try {
      setIsLoading(true);
      const m = format(startOfMonth(currentMonth), 'yyyy-MM');
      const res = await fetch(`/api/months/status?month=${m}&_=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (requestId === statusRequestIdRef.current) {
          setIsClosed(!!data.isClosed);
        }
      }
    } catch (error) {
      console.error('Failed to fetch month status', error);
    } finally {
      if (requestId === statusRequestIdRef.current) {
        setIsLoading(false);
      }
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

'use client';

import { useState, useMemo } from 'react';
import { Lock, Unlock, Loader2 } from 'lucide-react';
import { format, startOfMonth, isBefore } from 'date-fns';

interface MonthClosureControlsProps {
  currentMonth: Date;
  isClosed: boolean;
  onStatusChange?: () => void;
}

export function MonthClosureControls({ currentMonth, isClosed, onStatusChange }: MonthClosureControlsProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // The button should only appear if the selected month is in the past
  const canClose = useMemo(() => {
    const todayStartOfMonth = startOfMonth(new Date());
    const selectedStartOfMonth = startOfMonth(currentMonth);
    return isBefore(selectedStartOfMonth, todayStartOfMonth);
  }, [currentMonth]);

  if (!canClose) return null;

  const toggleStatus = async () => {
    try {
      setIsUpdating(true);
      const m = format(startOfMonth(currentMonth), 'yyyy-MM');
      const res = await fetch('/api/months/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: m, isClosed: !isClosed })
      });

      if (res.ok) {
        // Dispatch event for other components to sync
        window.dispatchEvent(new CustomEvent('monthStatusChanged'));
        onStatusChange?.();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update month status');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      onClick={toggleStatus}
      disabled={isUpdating}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm
        ${isClosed 
          ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200' 
          : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm'
        } disabled:opacity-50`}
    >
      {isUpdating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isClosed ? (
        <Unlock className="w-4 h-4" />
      ) : (
        <Lock className="w-4 h-4" />
      )}
      {isClosed ? 'Открыть месяц' : 'Закрыть месяц'}
    </button>
  );
}

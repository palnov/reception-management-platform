'use client';

import { useMemo, useState } from 'react';
import { Lock, Loader2, Unlock, X } from 'lucide-react';
import { format, isBefore, startOfMonth } from 'date-fns';
import { InlineStatus } from '@/components/InlineStatus';

interface MonthClosureControlsProps {
  currentMonth: Date;
  isClosed: boolean;
  onStatusChange?: () => void;
}

export function MonthClosureControls({ currentMonth, isClosed, onStatusChange }: MonthClosureControlsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const canClose = useMemo(() => {
    const todayStartOfMonth = startOfMonth(new Date());
    const selectedStartOfMonth = startOfMonth(currentMonth);
    return isBefore(selectedStartOfMonth, todayStartOfMonth);
  }, [currentMonth]);

  if (!canClose) return null;

  const toggleStatus = async () => {
    try {
      setIsUpdating(true);
      setStatus(null);

      const month = format(startOfMonth(currentMonth), 'yyyy-MM');
      const res = await fetch('/api/months/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, isClosed: !isClosed })
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        setStatus({ type: 'error', message: error?.error || 'Не удалось изменить статус месяца.' });
        return;
      }

      window.dispatchEvent(new CustomEvent('monthStatusChanged'));
      onStatusChange?.();
      setShowConfirm(false);
      setStatus({ type: 'success', message: isClosed ? 'Месяц открыт.' : 'Месяц закрыт.' });
      window.setTimeout(() => {
        setStatus(current => current?.type === 'success' ? null : current);
      }, 3500);
    } catch (error) {
      console.error('Toggle status error:', error);
      setStatus({ type: 'error', message: 'Не удалось связаться с сервером.' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setShowConfirm(true);
          setStatus(null);
        }}
        disabled={isUpdating}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm ${
          isClosed
            ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
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

      {showConfirm && (
        <div className="absolute right-0 top-full z-[80] mt-2 w-80 rounded-xl border border-zinc-200 bg-white p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 rounded-lg p-1.5 ${isClosed ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
              {isClosed ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-zinc-900">
                {isClosed ? 'Открыть месяц?' : 'Закрыть месяц?'}
              </div>
              <p className="mt-1 text-sm text-zinc-600">
                {isClosed
                  ? 'После открытия данные месяца снова можно будет редактировать.'
                  : 'После закрытия месяца редактирование данных будет заблокировано.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              disabled={isUpdating}
              className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-50"
              aria-label="Закрыть подтверждение"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              disabled={isUpdating}
              className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={toggleStatus}
              disabled={isUpdating}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 ${
                isClosed ? 'bg-blue-600 hover:bg-blue-700' : 'bg-zinc-900 hover:bg-zinc-800'
              }`}
            >
              {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
              {isClosed ? 'Открыть' : 'Закрыть'}
            </button>
          </div>
        </div>
      )}

      {status && (
        <InlineStatus
          type={status.type}
          message={status.message}
          floating
          className="absolute right-0 top-full z-[70] mt-2 w-80"
        />
      )}
    </div>
  );
}

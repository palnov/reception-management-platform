import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';

interface ConfirmPanelProps {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isBusy?: boolean;
  variant?: 'danger' | 'neutral';
  className?: string;
}

export function ConfirmPanel({
  title,
  description,
  confirmLabel,
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel,
  isBusy = false,
  variant = 'danger',
  className = ''
}: ConfirmPanelProps) {
  const isDanger = variant === 'danger';

  return (
    <div
      className={`rounded-xl border p-4 text-sm ${
        isDanger ? 'border-red-200 bg-red-50 text-red-700' : 'border-zinc-200 bg-white text-zinc-700'
      } ${className}`}
      role="alertdialog"
      aria-label={title}
    >
      <div className="flex gap-3">
        <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${isDanger ? 'text-red-600' : 'text-zinc-500'}`} />
        <div>
          <div className={isDanger ? 'font-bold text-red-800' : 'font-bold text-zinc-900'}>{title}</div>
          <div className="mt-1">{description}</div>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onCancel}
          disabled={isBusy}
          className={`flex-1 rounded-xl border bg-white px-4 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-60 ${
            isDanger ? 'border-red-200 text-red-700 hover:bg-red-50' : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
          }`}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isBusy}
          className={`flex-1 rounded-xl px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
            isDanger ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400' : 'bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-500'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

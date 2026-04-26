import { AlertTriangle, CheckCircle, X } from 'lucide-react';

type InlineStatusType = 'success' | 'error' | 'warning';

interface InlineStatusProps {
  type: InlineStatusType;
  message: string;
  onDismiss?: () => void;
  floating?: boolean;
  className?: string;
}

export function InlineStatus({ type, message, onDismiss, floating = false, className = '' }: InlineStatusProps) {
  const isSuccess = type === 'success';
  const classes = isSuccess
    ? 'border-green-200 bg-green-50 text-green-700'
    : type === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : 'border-red-200 bg-red-50 text-red-700';
  const Icon = isSuccess ? CheckCircle : AlertTriangle;

  return (
    <div
      className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${floating ? 'shadow-lg' : 'font-medium'} ${classes} ${className}`}
      role={isSuccess ? 'status' : 'alert'}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md p-0.5 opacity-70 hover:bg-white/70 hover:opacity-100"
          aria-label="Закрыть сообщение"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

'use client';

import { AlertTriangle, CheckCircle, X } from 'lucide-react';

type ScheduleToastProps = {
    type: 'success' | 'error';
    message: string;
    onDismiss: () => void;
};

export function ScheduleToast({ type, message, onDismiss }: ScheduleToastProps) {
    const isSuccess = type === 'success';
    const Icon = isSuccess ? CheckCircle : AlertTriangle;

    return (
        <div className="fixed right-4 top-4 z-[200] w-[min(420px,calc(100vw-2rem))] animate-in slide-in-from-top-2 fade-in duration-200">
            <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${isSuccess
                ? 'border-emerald-200/80 bg-white/95 text-emerald-900 shadow-emerald-900/10'
                : 'border-red-200/80 bg-white/95 text-red-900 shadow-red-900/10'
                }`}>
                <div className={`mt-0.5 rounded-full p-1.5 ${isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-5">{message}</p>
                </div>
                <button
                    type="button"
                    onClick={onDismiss}
                    className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                    aria-label="Закрыть уведомление"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

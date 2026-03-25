'use client';

import { Lock } from 'lucide-react';

interface MonthStatusBadgeProps {
  isClosed: boolean;
  className?: string;
}

export function MonthStatusBadge({ isClosed, className = "" }: MonthStatusBadgeProps) {
  if (!isClosed) return null;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-sm font-medium animate-in fade-in slide-in-from-top-1 ${className}`}>
      <Lock className="w-3.5 h-3.5" />
      <span>Месяц закрыт</span>
    </div>
  );
}

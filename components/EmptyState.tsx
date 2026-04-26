import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: ReactNode;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className = '' }: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center px-6 py-14 text-center ${className}`}>
            {Icon && (
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
                    <Icon className="h-6 w-6" />
                </div>
            )}
            <div className="text-base font-bold text-zinc-900">{title}</div>
            {description && (
                <div className="mt-2 max-w-md text-sm leading-6 text-zinc-500">{description}</div>
            )}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

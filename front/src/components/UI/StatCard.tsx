import { cn, toneClasses, type ComponentTone } from './utils';

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
    label: React.ReactNode;
    value: React.ReactNode;
    hint?: React.ReactNode;
    Icon?: React.ElementType;
    tone?: ComponentTone;
    trend?: 'up' | 'down' | 'neutral';
}

const trendClasses = {
    up: 'text-emerald-600 dark:text-emerald-400',
    down: 'text-rose-600 dark:text-rose-400',
    neutral: 'text-gray-500 dark:text-gray-400',
};

const StatCard = ({ label, value, hint, Icon, tone = 'primary', trend = 'neutral', className, ...props }: StatCardProps) => (
    <div className={cn('rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900', className)} {...props}>
        <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                <div className="mt-2 truncate text-2xl font-black text-gray-950 dark:text-white">{value}</div>
            </div>
            {Icon && (
                <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border', toneClasses[tone].soft)}>
                    <Icon className="h-5 w-5" />
                </div>
            )}
        </div>
        {hint && <p className={cn('mt-3 text-xs font-semibold', trendClasses[trend])}>{hint}</p>}
    </div>
);

export default StatCard;

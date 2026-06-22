import { cn } from './utils';

interface DividerProps {
    label?: React.ReactNode;
    orientation?: 'horizontal' | 'vertical';
    className?: string;
}

const Divider = ({ label, orientation = 'horizontal', className }: DividerProps) => {
    if (orientation === 'vertical') return <span className={cn('mx-2 h-6 w-px bg-gray-200 dark:bg-gray-800', className)} aria-hidden="true" />;

    if (!label) return <hr className={cn('border-gray-200 dark:border-gray-800', className)} />;

    return (
        <div className={cn('flex items-center gap-3', className)}>
            <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            <span className="text-xs font-medium text-gray-400">{label}</span>
            <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
        </div>
    );
};

export default Divider;

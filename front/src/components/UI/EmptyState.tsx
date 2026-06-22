import Button, { type ButtonProps } from './Button';
import { cn } from './utils';

interface EmptyStateProps {
    Icon?: React.ElementType;
    title: React.ReactNode;
    description?: React.ReactNode;
    action?: ButtonProps;
    className?: string;
}

const EmptyState = ({ Icon, title, description, action, className }: EmptyStateProps) => (
    <div className={cn('flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/70 p-8 text-center dark:border-gray-700 dark:bg-gray-900/40', className)}>
        {Icon && (
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm dark:bg-gray-800">
                <Icon className="h-6 w-6" />
            </div>
        )}
        <h3 className="text-base font-bold text-gray-950 dark:text-white">{title}</h3>
        {description && <p className="mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">{description}</p>}
        {action && (
            <Button className="mt-5" {...action}>
                {action.children}
            </Button>
        )}
    </div>
);

export default EmptyState;

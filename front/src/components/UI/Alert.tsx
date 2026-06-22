import { AlertCircle, CheckCircle, Info, TriangleAlert, X } from 'lucide-react';
import { cn, radiusClasses, toneClasses, type ComponentRadius, type ComponentTone } from './utils';

interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    tone?: ComponentTone;
    title?: React.ReactNode;
    onClose?: () => void;
    radius?: ComponentRadius;
    Icon?: React.ElementType;
}

const defaultIcons: Record<ComponentTone, React.ElementType> = {
    primary: Info,
    neutral: Info,
    success: CheckCircle,
    warning: TriangleAlert,
    danger: AlertCircle,
    info: Info,
};

const Alert = ({ tone = 'info', title, children, onClose, radius = 'lg', Icon, className, ...props }: AlertProps) => {
    const AlertIcon = Icon ?? defaultIcons[tone];

    return (
        <div className={cn('flex gap-3 border p-4', radiusClasses[radius], toneClasses[tone].soft, className)} role="alert" {...props}>
            <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
                {title && <div className="text-sm font-bold">{title}</div>}
                {children && <div className={cn('text-sm leading-6', title && 'mt-1')}>{children}</div>}
            </div>
            {onClose && (
                <button type="button" onClick={onClose} className="shrink-0 rounded-md p-1 transition hover:bg-black/5 dark:hover:bg-white/10" aria-label="Close">
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};

export default Alert;

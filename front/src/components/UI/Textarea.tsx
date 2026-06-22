'use client';

import { forwardRef, useId } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn, disabledClasses, focusRing, radiusClasses, type ComponentRadius } from './utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: React.ReactNode;
    helperText?: React.ReactNode;
    error?: React.ReactNode;
    success?: React.ReactNode;
    radius?: ComponentRadius;
    variant?: 'default' | 'filled' | 'glass';
    autoGrow?: boolean;
    unstyled?: boolean;
}

const variants = {
    default: 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100',
    filled: 'border-transparent bg-gray-100 text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-gray-100',
    glass: 'border-white/20 bg-white/50 text-gray-900 placeholder-gray-500 backdrop-blur dark:border-gray-700/50 dark:bg-gray-900/40 dark:text-gray-100',
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ id, label, helperText, error, success, radius = 'lg', variant = 'default', className, required, disabled, autoGrow = false, rows = 4, unstyled = false, ...props }, ref) => {
    const autoId = useId();
    const textareaId = id ?? autoId;
    const message = error || success || helperText;

    if (unstyled) {
        return <textarea ref={ref} id={textareaId} rows={rows} disabled={disabled} required={required} className={className} {...props} />;
    }

    return (
        <div className="w-full space-y-2">
            {label && (
                <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                    {required && <span className="ml-1 text-rose-500">*</span>}
                </label>
            )}
            <textarea
                ref={ref}
                id={textareaId}
                rows={rows}
                disabled={disabled}
                required={required}
                aria-invalid={Boolean(error)}
                aria-describedby={message ? `${textareaId}-message` : undefined}
                className={cn('w-full border px-4 py-3 text-sm transition-all duration-200', radiusClasses[radius], variants[variant], autoGrow ? 'min-h-24 resize-y' : 'resize-none', error && 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20', success && !error && 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20', focusRing, disabledClasses, className)}
                {...props}
            />
            {message && (
                <p id={`${textareaId}-message`} className={cn('flex items-center gap-2 text-xs', error ? 'text-rose-600 dark:text-rose-400' : success ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400')}>
                    {error && <AlertCircle className="h-4 w-4 shrink-0" />}
                    {success && !error && <CheckCircle className="h-4 w-4 shrink-0" />}
                    <span>{message}</span>
                </p>
            )}
        </div>
    );
});

Textarea.displayName = 'Textarea';

export default Textarea;

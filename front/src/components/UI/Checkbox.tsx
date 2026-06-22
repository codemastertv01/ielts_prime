'use client';

import { forwardRef, useId } from 'react';
import { cn, focusRing, radiusClasses, type ComponentRadius } from './utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: React.ReactNode;
    description?: React.ReactNode;
    error?: React.ReactNode;
    radius?: Extract<ComponentRadius, 'sm' | 'md' | 'lg'>;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ id, label, description, error, radius = 'sm', className, disabled, ...props }, ref) => {
    const autoId = useId();
    const checkboxId = id ?? autoId;

    return (
        <div className="space-y-1">
            <label htmlFor={checkboxId} className={cn('flex items-start gap-3', disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer')}>
                <input ref={ref} id={checkboxId} type="checkbox" disabled={disabled} className={cn('mt-0.5 h-4 w-4 shrink-0 border-gray-300 text-primary-600 accent-primary-600 transition', radiusClasses[radius], focusRing, className)} {...props} />
                {(label || description) && (
                    <span className="min-w-0">
                        {label && <span className="block text-sm font-medium text-gray-800 dark:text-gray-200">{label}</span>}
                        {description && <span className="block text-xs leading-5 text-gray-500 dark:text-gray-400">{description}</span>}
                    </span>
                )}
            </label>
            {error && <p className="pl-7 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
        </div>
    );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;

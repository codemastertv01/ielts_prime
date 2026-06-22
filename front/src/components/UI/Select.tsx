'use client';

import { forwardRef, useId } from 'react';
import { AlertCircle, CheckCircle, ChevronDown } from 'lucide-react';
import { cn, disabledClasses, focusRing, radiusClasses, type ComponentRadius, type ComponentSize } from './utils';

export interface SelectOption {
    label: React.ReactNode;
    value: string | number;
    disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    label?: React.ReactNode;
    helperText?: React.ReactNode;
    error?: React.ReactNode;
    success?: React.ReactNode;
    options?: SelectOption[];
    placeholder?: string;
    selectSize?: ComponentSize;
    radius?: ComponentRadius;
    unstyled?: boolean;
}

const sizes: Record<ComponentSize, string> = {
    xs: 'h-8 px-3 pr-9 text-xs',
    sm: 'h-9 px-3 pr-9 text-sm',
    md: 'h-11 px-4 pr-10 text-sm',
    lg: 'h-12 px-4 pr-10 text-base',
    xl: 'h-14 px-5 pr-11 text-lg',
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ id, label, helperText, error, success, options, placeholder, children, selectSize = 'md', radius = 'lg', className, required, disabled, unstyled = false, ...props }, ref) => {
    const autoId = useId();
    const selectId = id ?? autoId;
    const message = error || success || helperText;

    if (unstyled) {
        return (
            <select ref={ref} id={selectId} disabled={disabled} required={required} className={className} {...props}>
                {placeholder && <option value="">{placeholder}</option>}
                {options?.map((option) => (
                    <option key={String(option.value)} value={option.value} disabled={option.disabled}>
                        {option.label}
                    </option>
                ))}
                {children}
            </select>
        );
    }

    return (
        <div className="w-full space-y-2">
            {label && (
                <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                    {required && <span className="ml-1 text-rose-500">*</span>}
                </label>
            )}
            <div className="relative">
                <select
                    ref={ref}
                    id={selectId}
                    disabled={disabled}
                    required={required}
                    aria-invalid={Boolean(error)}
                    aria-describedby={message ? `${selectId}-message` : undefined}
                    className={cn('w-full appearance-none border border-gray-300 bg-white text-gray-900 transition-all duration-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100', sizes[selectSize], radiusClasses[radius], error && 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20', success && !error && 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20', focusRing, disabledClasses, className)}
                    {...props}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options?.map((option) => (
                        <option key={String(option.value)} value={option.value} disabled={option.disabled}>
                            {option.label}
                        </option>
                    ))}
                    {children}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
            {message && (
                <p id={`${selectId}-message`} className={cn('flex items-center gap-2 text-xs', error ? 'text-rose-600 dark:text-rose-400' : success ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400')}>
                    {error && <AlertCircle className="h-4 w-4 shrink-0" />}
                    {success && !error && <CheckCircle className="h-4 w-4 shrink-0" />}
                    <span>{message}</span>
                </p>
            )}
        </div>
    );
});

Select.displayName = 'Select';

export default Select;

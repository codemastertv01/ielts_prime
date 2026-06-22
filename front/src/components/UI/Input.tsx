'use client';

import { forwardRef, useId, useState } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { cn, disabledClasses, focusRing, radiusClasses, type ComponentRadius, type ComponentSize } from './utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    Icon?: React.ElementType;
    rightIcon?: React.ElementType;
    label?: React.ReactNode;
    helperText?: React.ReactNode;
    error?: React.ReactNode;
    success?: React.ReactNode;
    fullWidth?: boolean;
    inputSize?: ComponentSize;
    radius?: ComponentRadius;
    variant?: 'default' | 'filled' | 'glass' | 'underline';
    unstyled?: boolean;
}

const sizes: Record<ComponentSize, string> = {
    xs: 'h-8 px-3 text-xs',
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-sm',
    lg: 'h-12 px-4 text-base',
    xl: 'h-14 px-5 text-lg',
};

const iconSizes: Record<ComponentSize, string> = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
};

const variants = {
    default: 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100',
    filled: 'border-transparent bg-gray-100 text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-gray-100',
    glass: 'border-white/20 bg-white/50 text-gray-900 placeholder-gray-500 backdrop-blur dark:border-gray-700/50 dark:bg-gray-900/40 dark:text-gray-100',
    underline: 'rounded-none border-x-0 border-t-0 border-b-gray-300 bg-transparent px-0 text-gray-900 placeholder-gray-400 dark:border-b-gray-700 dark:text-gray-100',
};

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ id, Icon, rightIcon: RightIcon, label, helperText, error, success, fullWidth = true, inputSize = 'md', radius = 'lg', variant = 'default', className, type = 'text', required, disabled, unstyled = false, ...props }, ref) => {
        const autoId = useId();
        const inputId = id ?? autoId;
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === 'password';
        const inputType = isPassword && showPassword ? 'text' : type;
        const message = error || success || helperText;

        if (unstyled) {
            return <input ref={ref} id={inputId} type={inputType} disabled={disabled} required={required} className={className} {...props} />;
        }

        return (
            <div className={cn('space-y-2', fullWidth && 'w-full')}>
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                        {required && <span className="ml-1 text-rose-500">*</span>}
                    </label>
                )}

                <div className="relative">
                    {Icon && (
                        <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400">
                            <Icon className={cn(iconSizes[inputSize], error && 'text-rose-500', success && 'text-emerald-500')} />
                        </span>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        type={inputType}
                        disabled={disabled}
                        required={required}
                        aria-invalid={Boolean(error)}
                        aria-describedby={message ? `${inputId}-message` : undefined}
                        className={cn(
                            'w-full border transition-all duration-200',
                            sizes[inputSize],
                            variant !== 'underline' && radiusClasses[radius],
                            variants[variant],
                            Icon && 'pl-10',
                            (isPassword || RightIcon) && 'pr-10',
                            error && 'border-rose-500 bg-rose-50/50 dark:border-rose-500 dark:bg-rose-950/20',
                            success && !error && 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-950/20',
                            focusRing,
                            disabledClasses,
                            className,
                        )}
                        {...props}
                    />

                    {RightIcon && !isPassword && (
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <RightIcon className={iconSizes[inputSize]} />
                        </span>
                    )}

                    {isPassword && (
                        <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" tabIndex={-1}>
                            {showPassword ? <EyeOff className={iconSizes[inputSize]} /> : <Eye className={iconSizes[inputSize]} />}
                        </button>
                    )}
                </div>

                {message && (
                    <p id={`${inputId}-message`} className={cn('flex items-center gap-2 text-xs', error ? 'text-rose-600 dark:text-rose-400' : success ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400')}>
                        {error && <AlertCircle className="h-4 w-4 shrink-0" />}
                        {success && !error && <CheckCircle className="h-4 w-4 shrink-0" />}
                        <span>{message}</span>
                    </p>
                )}
            </div>
        );
    },
);

Input.displayName = 'Input';

export default Input;

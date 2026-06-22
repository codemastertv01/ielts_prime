'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn, disabledClasses, focusRing, radiusClasses, type ComponentRadius, type ComponentSize, type ComponentTone } from './utils';

type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'link' | 'gradient' | 'primary' | 'secondary' | 'danger';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    Icon?: React.ElementType;
    iconRight?: React.ElementType;
    loading?: boolean;
    fullWidth?: boolean;
    size?: ComponentSize;
    variant?: ButtonVariant;
    tone?: ComponentTone;
    radius?: ComponentRadius;
    glow?: boolean;
    unstyled?: boolean;
}

const sizes: Record<ComponentSize, string> = {
    xs: 'h-8 px-3 text-xs gap-1.5',
    sm: 'h-9 px-3.5 text-sm gap-2',
    md: 'h-11 px-5 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2.5',
    xl: 'h-14 px-8 text-lg gap-3',
};

const iconSizes: Record<ComponentSize, string> = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-[18px] h-[18px]',
    lg: 'w-5 h-5',
    xl: 'w-5 h-5',
};

const variantClass = (variant: ButtonVariant, tone: ComponentTone) => {
    if (variant === 'primary') return 'bg-linear-to-r from-primary-600 to-primary-700 text-white border-primary-600 hover:shadow-neon-lg';
    if (variant === 'secondary') return 'backdrop-blur-lg bg-white/10 dark:bg-gray-900/20 border-white/20 dark:border-gray-700/30 text-gray-800 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-800/30';
    if (variant === 'danger') return 'bg-linear-to-r from-rose-600 to-red-600 text-white border-rose-600 hover:shadow-lg hover:shadow-rose-500/25';
    if (variant === 'solid') return {
        primary: 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700',
        neutral: 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-950 dark:border-gray-100',
        success: 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700',
        warning: 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600',
        danger: 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700',
        info: 'bg-sky-600 text-white border-sky-600 hover:bg-sky-700',
    }[tone];
    if (variant === 'soft') return {
        primary: 'bg-primary-50 text-primary-700 border-primary-100 hover:bg-primary-100 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-800/50',
        neutral: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
        warning: 'bg-amber-50 text-amber-800 border-amber-100 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
        danger: 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50',
        info: 'bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/50',
    }[tone];
    if (variant === 'outline') return {
        primary: 'bg-transparent text-primary-700 border-primary-300 hover:bg-primary-50 dark:text-primary-300 dark:border-primary-700 dark:hover:bg-primary-950/30',
        neutral: 'bg-transparent text-gray-700 border-gray-300 hover:bg-gray-50 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800/60',
        success: 'bg-transparent text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-950/30',
        warning: 'bg-transparent text-amber-800 border-amber-300 hover:bg-amber-50 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-950/30',
        danger: 'bg-transparent text-rose-700 border-rose-300 hover:bg-rose-50 dark:text-rose-300 dark:border-rose-800 dark:hover:bg-rose-950/30',
        info: 'bg-transparent text-sky-700 border-sky-300 hover:bg-sky-50 dark:text-sky-300 dark:border-sky-800 dark:hover:bg-sky-950/30',
    }[tone];
    if (variant === 'ghost') return 'border-transparent bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800';
    if (variant === 'link') return 'h-auto border-transparent bg-transparent px-0 text-primary-600 hover:text-primary-500 hover:underline dark:text-primary-400';
    return 'bg-linear-to-r from-primary-600 via-sky-600 to-indigo-600 text-white border-primary-600 hover:shadow-neon-lg';
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, type = 'button', variant = 'solid', tone = 'primary', size = 'md', radius = 'lg', loading = false, disabled = false, className, fullWidth = false, Icon, iconRight: IconRight, glow = false, unstyled = false, ...props }, ref) => {
        if (unstyled) {
            return (
                <button ref={ref} type={type} disabled={disabled || loading} className={className} {...props}>
                    {loading && <Loader2 className={cn('animate-spin', iconSizes[size])} />}
                    {!loading && Icon && <Icon className={iconSizes[size]} />}
                    {children}
                    {!loading && IconRight && <IconRight className={iconSizes[size]} />}
                </button>
            );
        }

        return (
            <button
                ref={ref}
                type={type}
                disabled={disabled || loading}
                className={cn(
                    'group relative inline-flex shrink-0 items-center justify-center overflow-hidden border font-semibold transition-all duration-200 hover:-translate-y-px active:translate-y-0 active:scale-[0.98]',
                    sizes[size],
                    radiusClasses[radius],
                    variantClass(variant, tone),
                    focusRing,
                    disabledClasses,
                    fullWidth && 'w-full',
                    glow && 'shadow-neon',
                    className,
                )}
                {...props}
            >
                {loading && <Loader2 className={cn('animate-spin', iconSizes[size])} />}
                {!loading && Icon && <Icon className={iconSizes[size]} />}
                <span className="min-w-0 truncate">{children}</span>
                {!loading && IconRight && <IconRight className={iconSizes[size]} />}
                {(variant === 'primary' || variant === 'gradient') && <span className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />}
            </button>
        );
    },
);

Button.displayName = 'Button';

export default Button;

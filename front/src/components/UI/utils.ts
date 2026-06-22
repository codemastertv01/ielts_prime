export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ComponentTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';
export type ComponentRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export const cn = (...classes: unknown[]) => classes.filter((value): value is string => typeof value === 'string' && value.length > 0).join(' ');

export const radiusClasses: Record<ComponentRadius, string> = {
    none: 'rounded-none',
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full',
};

export const focusRing = 'focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950';

export const disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

export const toneClasses: Record<ComponentTone, { solid: string; soft: string; outline: string; text: string; dot: string }> = {
    primary: {
        solid: 'bg-primary-600 text-white hover:bg-primary-700 border-primary-600',
        soft: 'bg-primary-50 text-primary-700 border-primary-100 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-800/50',
        outline: 'bg-transparent text-primary-700 border-primary-300 hover:bg-primary-50 dark:text-primary-300 dark:border-primary-700 dark:hover:bg-primary-950/30',
        text: 'text-primary-700 dark:text-primary-300',
        dot: 'bg-primary-500',
    },
    neutral: {
        solid: 'bg-gray-900 text-white hover:bg-gray-800 border-gray-900 dark:bg-gray-100 dark:text-gray-950 dark:hover:bg-white dark:border-gray-100',
        soft: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700',
        outline: 'bg-transparent text-gray-700 border-gray-300 hover:bg-gray-50 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800/60',
        text: 'text-gray-700 dark:text-gray-200',
        dot: 'bg-gray-400',
    },
    success: {
        solid: 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600',
        soft: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
        outline: 'bg-transparent text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-950/30',
        text: 'text-emerald-700 dark:text-emerald-300',
        dot: 'bg-emerald-500',
    },
    warning: {
        solid: 'bg-amber-500 text-white hover:bg-amber-600 border-amber-500',
        soft: 'bg-amber-50 text-amber-800 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
        outline: 'bg-transparent text-amber-800 border-amber-300 hover:bg-amber-50 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-950/30',
        text: 'text-amber-800 dark:text-amber-300',
        dot: 'bg-amber-500',
    },
    danger: {
        solid: 'bg-rose-600 text-white hover:bg-rose-700 border-rose-600',
        soft: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50',
        outline: 'bg-transparent text-rose-700 border-rose-300 hover:bg-rose-50 dark:text-rose-300 dark:border-rose-800 dark:hover:bg-rose-950/30',
        text: 'text-rose-700 dark:text-rose-300',
        dot: 'bg-rose-500',
    },
    info: {
        solid: 'bg-sky-600 text-white hover:bg-sky-700 border-sky-600',
        soft: 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/50',
        outline: 'bg-transparent text-sky-700 border-sky-300 hover:bg-sky-50 dark:text-sky-300 dark:border-sky-800 dark:hover:bg-sky-950/30',
        text: 'text-sky-700 dark:text-sky-300',
        dot: 'bg-sky-500',
    },
};

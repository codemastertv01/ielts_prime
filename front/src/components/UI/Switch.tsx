'use client';

import { cn, focusRing } from './utils';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: React.ReactNode;
    description?: React.ReactNode;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizes = {
    sm: { track: 'h-5 w-9', thumb: 'h-4 w-4', translate: 'translate-x-4' },
    md: { track: 'h-6 w-11', thumb: 'h-5 w-5', translate: 'translate-x-5' },
    lg: { track: 'h-7 w-14', thumb: 'h-6 w-6', translate: 'translate-x-7' },
};

const Switch = ({ checked, onChange, label, description, disabled = false, size = 'md', className }: SwitchProps) => {
    const s = sizes[size];

    return (
        <label className={cn('flex items-center gap-3', disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer', className)}>
            <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)} className={cn('relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-colors', s.track, checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700', focusRing)}>
                <span className={cn('inline-block rounded-full bg-white shadow transition-transform', s.thumb, checked ? s.translate : 'translate-x-0.5')} />
            </button>
            {(label || description) && (
                <span className="min-w-0">
                    {label && <span className="block text-sm font-medium text-gray-800 dark:text-gray-200">{label}</span>}
                    {description && <span className="block text-xs leading-5 text-gray-500 dark:text-gray-400">{description}</span>}
                </span>
            )}
        </label>
    );
};

export default Switch;

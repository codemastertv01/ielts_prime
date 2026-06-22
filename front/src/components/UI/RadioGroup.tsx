'use client';

import { cn, focusRing } from './utils';

export interface RadioOption {
    label: React.ReactNode;
    value: string;
    description?: React.ReactNode;
    disabled?: boolean;
}

interface RadioGroupProps {
    name: string;
    value?: string;
    options: RadioOption[];
    onChange?: (value: string) => void;
    label?: React.ReactNode;
    error?: React.ReactNode;
    direction?: 'row' | 'column';
    className?: string;
}

const RadioGroup = ({ name, value, options, onChange, label, error, direction = 'column', className }: RadioGroupProps) => (
    <fieldset className={cn('space-y-2', className)}>
        {label && <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</legend>}
        <div className={cn(direction === 'row' ? 'flex flex-wrap gap-3' : 'space-y-2')}>
            {options.map((option) => (
                <label key={option.value} className={cn('flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 transition dark:border-gray-800 dark:bg-gray-900', option.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-primary-300 hover:bg-primary-50/40 dark:hover:border-primary-700 dark:hover:bg-primary-950/20', value === option.value && 'border-primary-400 bg-primary-50 dark:border-primary-700 dark:bg-primary-950/30')}>
                    <input type="radio" name={name} value={option.value} checked={value === option.value} disabled={option.disabled} onChange={() => onChange?.(option.value)} className={cn('mt-0.5 h-4 w-4 shrink-0 accent-primary-600', focusRing)} />
                    <span className="min-w-0">
                        <span className="block text-sm font-medium text-gray-800 dark:text-gray-200">{option.label}</span>
                        {option.description && <span className="block text-xs leading-5 text-gray-500 dark:text-gray-400">{option.description}</span>}
                    </span>
                </label>
            ))}
        </div>
        {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </fieldset>
);

export default RadioGroup;

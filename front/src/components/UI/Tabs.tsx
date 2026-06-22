'use client';

import { cn } from './utils';

export interface TabItem {
    label: React.ReactNode;
    value: string;
    Icon?: React.ElementType;
    disabled?: boolean;
}

interface TabsProps {
    tabs: TabItem[];
    value: string;
    onChange: (value: string) => void;
    variant?: 'line' | 'pills' | 'boxed';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
};

const Tabs = ({ tabs, value, onChange, variant = 'pills', size = 'md', className }: TabsProps) => (
    <div className={cn('flex flex-wrap gap-1', variant === 'line' && 'border-b border-gray-200 dark:border-gray-800', variant === 'boxed' && 'rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-900', className)} role="tablist">
        {tabs.map((tab) => {
            const active = value === tab.value;
            const Icon = tab.Icon;
            return (
                <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    disabled={tab.disabled}
                    onClick={() => onChange(tab.value)}
                    className={cn('inline-flex items-center gap-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50', sizes[size], variant === 'line' ? 'border-b-2 border-transparent -mb-px' : 'rounded-lg', active && variant === 'line' && 'border-primary-600 text-primary-600 dark:text-primary-400', !active && variant === 'line' && 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200', active && variant !== 'line' && 'bg-white text-primary-700 shadow-sm dark:bg-gray-800 dark:text-primary-300', !active && variant !== 'line' && 'text-gray-500 hover:bg-white/70 hover:text-gray-800 dark:hover:bg-gray-800/60 dark:hover:text-gray-200')}
                >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span className="truncate">{tab.label}</span>
                </button>
            );
        })}
    </div>
);

export default Tabs;

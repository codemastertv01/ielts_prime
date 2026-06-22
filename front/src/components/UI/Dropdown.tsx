'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Button from './Button';
import { cn } from './utils';

export interface DropdownItem {
    label: React.ReactNode;
    onClick?: () => void;
    Icon?: React.ElementType;
    disabled?: boolean;
    danger?: boolean;
}

interface DropdownProps {
    label: React.ReactNode;
    items: DropdownItem[];
    align?: 'left' | 'right';
    className?: string;
}

const Dropdown = ({ label, items, align = 'left', className }: DropdownProps) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onPointerDown = (event: PointerEvent) => {
            if (!ref.current?.contains(event.target as Node)) setOpen(false);
        };
        window.addEventListener('pointerdown', onPointerDown);
        return () => window.removeEventListener('pointerdown', onPointerDown);
    }, []);

    return (
        <div ref={ref} className={cn('relative inline-block', className)}>
            <Button type="button" variant="outline" tone="neutral" size="sm" iconRight={ChevronDown} onClick={() => setOpen((value) => !value)}>
                {label}
            </Button>
            {open && (
                <div className={cn('absolute z-40 mt-2 min-w-48 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-xl dark:border-gray-800 dark:bg-gray-900', align === 'right' ? 'right-0' : 'left-0')}>
                    {items.map((item, index) => {
                        const Icon = item.Icon;
                        return (
                            <button
                                key={index}
                                type="button"
                                disabled={item.disabled}
                                onClick={() => {
                                    item.onClick?.();
                                    setOpen(false);
                                }}
                                className={cn('flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50', item.danger ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800')}
                            >
                                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                                <span className="truncate">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Dropdown;

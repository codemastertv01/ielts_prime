'use client';

import { useState } from 'react';
import { cn } from './utils';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    side?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}

const sideClasses = {
    top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
    bottom: 'left-1/2 top-full mt-2 -translate-x-1/2',
    left: 'right-full top-1/2 mr-2 -translate-y-1/2',
    right: 'left-full top-1/2 ml-2 -translate-y-1/2',
};

const Tooltip = ({ content, children, side = 'top', className }: TooltipProps) => {
    const [open, setOpen] = useState(false);

    return (
        <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
            {children}
            {open && (
                <span className={cn('pointer-events-none absolute z-50 max-w-64 whitespace-nowrap rounded-lg bg-gray-950 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-gray-100 dark:text-gray-950', sideClasses[side], className)} role="tooltip">
                    {content}
                </span>
            )}
        </span>
    );
};

export default Tooltip;

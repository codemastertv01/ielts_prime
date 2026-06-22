'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from './utils';

export interface AccordionItem {
    title: React.ReactNode;
    content: React.ReactNode;
    value: string;
    Icon?: React.ElementType;
    disabled?: boolean;
}

interface AccordionProps {
    items: AccordionItem[];
    defaultValue?: string;
    allowClose?: boolean;
    className?: string;
}

const Accordion = ({ items, defaultValue, allowClose = true, className }: AccordionProps) => {
    const [open, setOpen] = useState<string | undefined>(defaultValue);

    return (
        <div className={cn('divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900', className)}>
            {items.map((item) => {
                const active = open === item.value;
                const Icon = item.Icon;
                return (
                    <div key={item.value}>
                        <button type="button" disabled={item.disabled} onClick={() => setOpen(active && allowClose ? undefined : item.value)} className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800/60">
                            <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                                {Icon && <Icon className="h-4 w-4 shrink-0 text-gray-400" />}
                                <span className="truncate">{item.title}</span>
                            </span>
                            <ChevronDown className={cn('h-4 w-4 shrink-0 text-gray-400 transition-transform', active && 'rotate-180')} />
                        </button>
                        <AnimatePresence initial={false}>
                            {active && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                                    <div className="px-4 pb-4 pt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">{item.content}</div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
};

export default Accordion;

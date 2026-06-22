'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleProps {
    title: string;
    icon: React.ReactNode;
    count?: number;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export const Collapsible = ({ title, icon, count, children, defaultOpen = false }: CollapsibleProps) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                <div className="flex items-center gap-2.5">
                    <span className="text-gray-500 dark:text-gray-400">{icon}</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</span>
                    {count !== undefined && <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold">{count}</span>}
                </div>
                {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-gray-100 dark:border-gray-800">
                        <div className="p-5">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

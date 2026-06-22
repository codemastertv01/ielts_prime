'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from './utils';

interface DrawerProps {
    open: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    description?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    side?: 'left' | 'right' | 'bottom';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sideClasses = {
    left: 'left-0 top-0 h-full',
    right: 'right-0 top-0 h-full',
    bottom: 'bottom-0 left-0 w-full',
};

const sizeClasses = {
    sm: { panel: 'max-w-sm', bottom: 'max-h-[45vh]' },
    md: { panel: 'max-w-md', bottom: 'max-h-[65vh]' },
    lg: { panel: 'max-w-xl', bottom: 'max-h-[85vh]' },
};

const Drawer = ({ open, onClose, title, description, children, footer, side = 'right', size = 'md', className }: DrawerProps) => (
    <AnimatePresence>
        {open && (
            <motion.div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
                <motion.aside
                    initial={side === 'left' ? { x: '-100%' } : side === 'right' ? { x: '100%' } : { y: '100%' }}
                    animate={{ x: 0, y: 0 }}
                    exit={side === 'left' ? { x: '-100%' } : side === 'right' ? { x: '100%' } : { y: '100%' }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className={cn('fixed flex flex-col border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900', sideClasses[side], side === 'bottom' ? sizeClasses[size].bottom : `w-full ${sizeClasses[size].panel}`, side === 'left' && 'border-r', side === 'right' && 'border-l', side === 'bottom' && 'rounded-t-2xl border-t', className)}
                >
                    {(title || description) && (
                        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                            <div className="min-w-0">
                                {title && <h2 className="text-base font-bold text-gray-950 dark:text-white">{title}</h2>}
                                {description && <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">{description}</p>}
                            </div>
                            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200" aria-label="Close drawer">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                    <div className="min-h-0 flex-1 overflow-auto p-5">{children}</div>
                    {footer && <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-800">{footer}</div>}
                </motion.aside>
            </motion.div>
        )}
    </AnimatePresence>
);

export default Drawer;

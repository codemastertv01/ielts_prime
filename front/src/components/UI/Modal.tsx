'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn, radiusClasses, type ComponentRadius } from './utils';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    description?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    radius?: ComponentRadius;
    closeOnBackdrop?: boolean;
    className?: string;
}

const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[calc(100vw-2rem)]',
};

const Modal = ({ open, onClose, title, description, children, footer, size = 'md', radius = 'xl', closeOnBackdrop = true, className }: ModalProps) => (
    <AnimatePresence>
        {open && (
            <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => closeOnBackdrop && event.target === event.currentTarget && onClose()}>
                <motion.div initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.96 }} transition={{ duration: 0.18 }} className={cn('w-full overflow-hidden border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900', sizes[size], radiusClasses[radius], className)}>
                    {(title || description) && (
                        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                            <div className="min-w-0">
                                {title && <h2 className="text-base font-bold text-gray-950 dark:text-white">{title}</h2>}
                                {description && <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">{description}</p>}
                            </div>
                            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200" aria-label="Close modal">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                    <div className="max-h-[70vh] overflow-auto p-5">{children}</div>
                    {footer && <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-800">{footer}</div>}
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default Modal;

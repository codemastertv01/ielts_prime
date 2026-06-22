'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check } from 'lucide-react';

interface ToastProps {
    msg: string;
    type: 'success' | 'error';
}

export const Toast = ({ msg, type }: ToastProps) => (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`fixed top-4 right-4 z-[200] flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
        {type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
        {msg}
    </motion.div>
);

export const ToastContainer = ({ toast }: { toast: ToastProps | null }) => <AnimatePresence>{toast && <Toast {...toast} />}</AnimatePresence>;

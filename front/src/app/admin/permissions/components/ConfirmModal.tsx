'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ConfirmModalProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    confirmClass?: string;
    withReason?: boolean;
    isLoading?: boolean;
    icon: React.ReactNode;
    onConfirm: (reason?: string) => void;
    onClose: () => void;
}

export const ConfirmModal = ({ open, title, message, confirmLabel, confirmClass = 'bg-red-500 hover:bg-red-600', withReason = false, isLoading = false, icon, onConfirm, onClose }: ConfirmModalProps) => {
    const [reason, setReason] = useState('');

    if (!open) return null;

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800">{icon}</div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
                        {withReason && (
                            <div className="mt-4">
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Sabab (ixtiyoriy)</label>
                                <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Nima uchun?" rows={2} className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none" />
                            </div>
                        )}
                    </div>
                    <div className="px-6 pb-6 flex gap-3 justify-end">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                            Bekor
                        </button>
                        <button onClick={() => onConfirm(reason)} disabled={isLoading} className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl transition disabled:opacity-50 ${confirmClass}`}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
                            {confirmLabel}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

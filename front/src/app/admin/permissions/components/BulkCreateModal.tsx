'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Loader2, X } from 'lucide-react';
import type { CreatePermissionDto } from '@/types/permission';

interface BulkCreateModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (dtos: CreatePermissionDto[]) => void;
    isSaving: boolean;
}

const EXAMPLE = `[
  {
    "name": "reports:read",
    "resource": "reports",
    "action": "READ",
    "description": "Hisobotlarni ko'rish",
    "category": "custom"
  },
  {
    "name": "reports:create",
    "resource": "reports",
    "action": "CREATE",
    "description": "Hisobot yaratish",
    "category": "custom"
  },
  {
    "name": "analytics:read",
    "resource": "analytics",
    "action": "READ",
    "category": "system",
    "isSystemPermission": true
  }
]`;

export const BulkCreateModal = ({ open, onClose, onSave, isSaving }: BulkCreateModalProps) => {
    const [raw, setRaw] = useState(EXAMPLE);
    const [error, setError] = useState('');

    const handleSave = () => {
        setError('');
        let arr: CreatePermissionDto[];
        try {
            arr = JSON.parse(raw);
        } catch (e: unknown) {
            setError(`JSON formati noto'g'ri: ${(e as Error).message}`);
            return;
        }
        if (!Array.isArray(arr)) {
            setError("Array bo'lishi kerak: [...]");
            return;
        }
        const errs: string[] = [];
        arr.forEach((dto, i) => {
            if (!dto.name || !dto.resource || !dto.action) errs.push(`#${i + 1}: name, resource, action majburiy`);
        });
        if (errs.length > 0) {
            setError(errs.join('\n'));
            return;
        }
        onSave(arr);
    };

    if (!open) return null;

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                        <Layers className="w-5 h-5 text-violet-500" />
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">JSON bulk yaratish</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">name, resource, action (majburiy) · description, category, isSystemPermission (ixtiyoriy)</p>
                        </div>
                        <button onClick={onClose} className="ml-auto p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-3">
                        <div className="flex items-center gap-2 p-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl">
                            <span className="text-xs text-violet-700 dark:text-violet-300">JSON array formati. Har bir obyekt permission yaratadi.</span>
                        </div>
                        <textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={14} className="w-full px-3 py-2.5 text-sm font-mono border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none" />
                        {error && <pre className="text-xs text-red-500 whitespace-pre-wrap bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-200 dark:border-red-800">{error}</pre>}
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 justify-end">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                            Bekor
                        </button>
                        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition disabled:opacity-50">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                            Barchasini yaratish
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Loader2, X } from 'lucide-react';
import type { CreateUserDto } from '@/types/user';

interface Props {
    open: boolean;
    onClose: () => void;
    onSave: (dtos: CreateUserDto[]) => void;
    isSaving: boolean;
}

const EXAMPLE = `[
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass1",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+998901234567",
    "bio": "Frontend developer"
  },
  {
    "username": "jane_smith",
    "email": "jane@example.com",
    "password": "SecurePass1",
    "firstName": "Jane",
    "lastName": "Smith"
  }
]`;

export const BulkCreateUserModal = ({ open, onClose, onSave, isSaving }: Props) => {
    const [raw, setRaw] = useState(EXAMPLE);
    const [error, setError] = useState('');

    const handleSave = () => {
        setError('');
        let arr: CreateUserDto[];
        try {
            arr = JSON.parse(raw);
        } catch (e: unknown) {
            setError(`JSON xato: ${(e as Error).message}`);
            return;
        }
        if (!Array.isArray(arr)) {
            setError("Array bo'lishi kerak");
            return;
        }
        const errs: string[] = [];
        arr.forEach((dto, i) => {
            if (!dto.username) errs.push(`#${i + 1}: username majburiy`);
            if (!dto.email) errs.push(`#${i + 1}: email majburiy`);
            if (!dto.password) errs.push(`#${i + 1}: password majburiy`);
            if (!dto.firstName) errs.push(`#${i + 1}: firstName majburiy`);
            if (!dto.lastName) errs.push(`#${i + 1}: lastName majburiy`);
        });
        if (errs.length) {
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
                        <Layers className="w-5 h-5 text-indigo-500" />
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">JSON bulk yaratish</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">username, email, password, firstName, lastName majburiy</p>
                        </div>
                        <button onClick={onClose} className="ml-auto p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6 space-y-3">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                            <p className="text-xs text-indigo-700 dark:text-indigo-300">Parol: kamida 8 belgi, 1 katta + 1 kichik harf + 1 raqam</p>
                        </div>
                        <textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={14} className="w-full px-3 py-2.5 text-sm font-mono border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none" />
                        {error && <pre className="text-xs text-red-500 whitespace-pre-wrap bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-200 dark:border-red-800">{error}</pre>}
                    </div>
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 justify-end">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 transition">
                            Bekor
                        </button>
                        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition disabled:opacity-50">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                            Barchasini yaratish
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

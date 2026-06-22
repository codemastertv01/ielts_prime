'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Search, Shield, X } from 'lucide-react';
import type { Permission } from '@/types/permission';
import type { Role } from '@/types/role';

interface AssignPermissionsModalProps {
    open: boolean;
    role: Role | null;
    allPermissions: Permission[];
    onClose: () => void;
    onAssign: (permissionIds: string[]) => void;
    onRemove: (permissionIds: string[]) => void;
    isAssigning: boolean;
    isRemoving: boolean;
}

export const AssignPermissionsModal = ({ open, role, allPermissions, onClose, onAssign, onRemove, isAssigning, isRemoving }: AssignPermissionsModalProps) => {
    const [search, setSearch] = useState('');
    const [toAdd, setToAdd] = useState<Set<string>>(new Set());
    const [toRemove, setToRemove] = useState<Set<string>>(new Set());

    if (!open || !role) return null;

    const assignedIds = new Set((role.permissions as any[]).map((p) => (typeof p === 'string' ? p : p._id)));

    const filtered = allPermissions.filter((p) => !search || p.name.includes(search.toLowerCase()) || p.resource.includes(search.toLowerCase()));

    const toggleAdd = (id: string) => {
        if (assignedIds.has(id)) return;
        setToAdd((prev) => {
            const n = new Set(prev);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    };

    const toggleRemove = (id: string) => {
        if (!assignedIds.has(id)) return;
        setToRemove((prev) => {
            const n = new Set(prev);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    };

    const handleApply = () => {
        if (toAdd.size > 0) onAssign(Array.from(toAdd));
        if (toRemove.size > 0) onRemove(Array.from(toRemove));
        setToAdd(new Set());
        setToRemove(new Set());
    };

    const ACTION_COLORS: Record<string, string> = {
        read: 'text-sky-600 bg-sky-50 dark:bg-sky-900/20',
        create: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
        update: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
        delete: 'text-red-600 bg-red-50 dark:bg-red-900/20',
        manage: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20',
    };

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[85vh]">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                        <Shield className="w-5 h-5 text-violet-500" />
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Permissionlarni boshqarish</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">{role.name}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            {(toAdd.size > 0 || toRemove.size > 0) && (
                                <span className="text-xs font-semibold text-violet-600 bg-violet-50 dark:bg-violet-900/30 px-2 py-1 rounded-lg">
                                    {toAdd.size > 0 && `+${toAdd.size}`}
                                    {toRemove.size > 0 && ` -${toRemove.size}`}
                                </span>
                            )}
                            <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="px-6 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center gap-4 text-[11px] text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700"></span>Biriktirilgan
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700"></span>Qo'shiladi
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700"></span>Olib tashlanadi
                        </span>
                    </div>

                    {/* Search */}
                    <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom yoki resource bo'yicha qidirish..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
                        </div>
                    </div>

                    {/* Permission list */}
                    <div className="flex-1 overflow-y-auto px-6 py-3 space-y-1">
                        {filtered.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-8">Permission topilmadi</p>
                        ) : (
                            filtered.map((perm) => {
                                const isAssigned = assignedIds.has(perm._id);
                                const isAdding = toAdd.has(perm._id);
                                const isRemoving_ = toRemove.has(perm._id);
                                const ac = ACTION_COLORS[perm.action] ?? 'text-gray-600 bg-gray-100';

                                return (
                                    <div key={perm._id} onClick={() => (isAssigned ? toggleRemove(perm._id) : toggleAdd(perm._id))} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${isRemoving_ ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' : isAdding ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' : isAssigned ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white truncate">{perm.name}</span>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ac}`}>{perm.action}</span>
                                                {perm.isSystemPermission && <span className="text-[10px] text-violet-600 bg-violet-50 dark:bg-violet-900/30 px-1.5 py-0.5 rounded">system</span>}
                                            </div>
                                            {perm.description && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{perm.description}</p>}
                                        </div>
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${isRemoving_ ? 'bg-red-500 border-red-500 text-white' : isAdding ? 'bg-blue-500 border-blue-500 text-white' : isAssigned ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>{isRemoving_ ? '−' : isAdding || isAssigned ? '✓' : ''}</div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 justify-between items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{assignedIds.size} ta biriktirilgan</span>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 transition">
                                Bekor
                            </button>
                            <button onClick={handleApply} disabled={(toAdd.size === 0 && toRemove.size === 0) || isAssigning || isRemoving} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition disabled:opacity-50">
                                {isAssigning || isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                Saqlash
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

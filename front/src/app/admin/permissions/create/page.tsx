'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Check, ChevronRight, Info, Loader2, Lock, Shield } from 'lucide-react';

import { PermissionCategory } from '@/types/permission';
import type { CreatePermissionDto } from '@/types/permission';
import { usePermissions } from '@/hooks/useAdminPermissions';

import { ALL_ACTIONS, ALL_CATEGORIES, inputCls, labelCls } from '../components/PermissionShared';

// ─── Form state ───────────────────────────────────────────────

interface FormState {
    name: string;
    resource: string;
    action: string;
    description: string;
    category: PermissionCategory;
    isSystemPermission: boolean;
    scope: string;
    apiPath: string;
    frontendPath: string;
    uiKey: string;
}

const DEFAULT: FormState = {
    name: '',
    resource: '',
    action: 'READ',
    description: '',
    category: PermissionCategory.CUSTOM,
    isSystemPermission: false,
    scope: 'both',
    apiPath: '',
    frontendPath: '',
    uiKey: '',
};

// ─── Validation ───────────────────────────────────────────────

function validate(form: FormState): Record<string, string> {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Majburiy';
    else if (form.name.length < 3) e.name = 'Kamida 3 belgi';
    else if (!/^[A-Za-z0-9:_.*-]+$/.test(form.name)) e.name = "Kichik harf, raqam, :, _, -, . va * bo'lishi mumkin";
    if (!form.resource.trim()) e.resource = 'Majburiy';
    else if (!/^[a-z0-9_*-]+$/.test(form.resource)) e.resource = "Kichik harf, raqam, _, - va * bo'lishi mumkin";
    if (!form.action) e.action = 'Majburiy';
    if (form.apiPath && !/^\/api\/[a-z0-9/_:-]*$/.test(form.apiPath)) e.apiPath = 'Format: /api/resource/:id';
    if (form.frontendPath && !/^\/[a-z0-9/_-]*$/.test(form.frontendPath)) e.frontendPath = 'Format: /admin/users';
    return e;
}

// ─── Component ────────────────────────────────────────────────

export default function CreatePermissionPage() {
    const router = useRouter();
    const { createAsync, isCreating } = usePermissions();

    const [form, setForm] = useState<FormState>(DEFAULT);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((p) => ({ ...p, [k]: v }));

    const handleResourceChange = (v: string) => {
        set('resource', v);
        if (!form.name || form.name === `${form.resource}:${form.action}`) set('name', v ? `${v}:${form.action}` : '');
    };

    const handleActionChange = (v: string) => {
        set('action', v);
        if (!form.name || form.name === `${form.resource}:${form.action}`) set('name', form.resource ? `${form.resource}:${v}` : '');
    };

    const handleSubmit = async () => {
        const errs = validate(form);
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        setApiError('');

        const dto: CreatePermissionDto = {
            name: form.name.trim().toLowerCase(),
            resource: form.resource.trim().toLowerCase(),
            action: form.action,
            description: form.description.trim() || undefined,
            category: form.category,
            isSystemPermission: form.isSystemPermission,
            scope: form.scope as any,
            apiPath: form.apiPath.trim() || undefined,
            frontendPath: form.frontendPath.trim() || undefined,
            uiKey: form.uiKey.trim() || undefined,
        };

        try {
            await createAsync(dto);
            router.push('/admin/permissions');
        } catch (e: unknown) {
            setApiError((e as any)?.response?.data?.message ?? (e as Error)?.message ?? 'Yaratishda xato');
        }
    };

    const F = ({ label, children, error, hint }: { label: string; children: React.ReactNode; error?: string; hint?: string }) => (
        <div>
            <label className={labelCls}>{label}</label>
            {children}
            {hint && !error && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
            {error && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {error}
                </p>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                            <span className="hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer" onClick={() => router.push('/admin/permissions')}>
                                Permissions
                            </span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-gray-600 dark:text-gray-300 font-medium">Yaratish</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-violet-500" /> Permission yaratish
                        </h1>
                    </div>
                </div>

                {/* API Error */}
                <AnimatePresence>
                    {apiError && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{apiError}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main form */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Permission ma'lumotlari</h2>
                    </div>
                    <div className="p-6 space-y-5">
                        {/* Resource + Action */}
                        <div className="grid grid-cols-2 gap-4">
                            <F label="Resource" error={errors.resource} hint="Kichik harf: users, exams, roles">
                                <input value={form.resource} onChange={(e) => handleResourceChange(e.target.value.toLowerCase())} placeholder="users" className={inputCls(errors.resource)} />
                            </F>
                            <F label="Amal (action)" error={errors.action}>
                                <select value={form.action} onChange={(e) => handleActionChange(e.target.value)} className={inputCls(errors.action)}>
                                    {ALL_ACTIONS.map((a) => (
                                        <option key={a} value={a}>
                                            {a}
                                        </option>
                                    ))}
                                </select>
                            </F>
                        </div>

                        {/* Name */}
                        <F label="Permission nomi" error={errors.name} hint="resource:action formatida. Avtomatik to'ldiriladi">
                            <input value={form.name} onChange={(e) => set('name', e.target.value.toLowerCase())} placeholder="users:delete" className={`${inputCls(errors.name)} font-mono`} />
                        </F>

                        {/* Description */}
                        <F label="Tavsif" hint="Ixtiyoriy — bu permission nima qilish imkonini beradi">
                            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} placeholder="Foydalanuvchi hisoblarini o'chirishga ruxsat beradi..." className={`${inputCls()} resize-none`} />
                        </F>

                        {/* Category */}
                        <F label="Kategoriya">
                            <div className="grid grid-cols-4 gap-2">
                                {ALL_CATEGORIES.map((c) => (
                                    <button key={c} type="button" onClick={() => set('category', c as PermissionCategory)} className={`py-2.5 text-xs font-semibold rounded-xl border transition capitalize ${form.category === c ? 'bg-violet-600 text-white border-violet-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-violet-400'}`}>
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </F>

                        {/* Scope */}
                        <F label="Scope">
                            <div className="grid grid-cols-3 gap-2">
                                {['api', 'frontend', 'both'].map((s) => (
                                    <button key={s} type="button" onClick={() => set('scope', s)} className={`py-2.5 text-xs font-semibold rounded-xl border transition capitalize ${form.scope === s ? 'bg-sky-600 text-white border-sky-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-sky-400'}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </F>
                    </div>
                </div>

                {/* Advanced settings */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                    <button onClick={() => setShowAdvanced((v) => !v)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Qo'shimcha sozlamalar</span>
                        <span className="text-gray-400 text-xs">{showAdvanced ? '▲' : '▼'}</span>
                    </button>
                    <AnimatePresence>
                        {showAdvanced && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-gray-100 dark:border-gray-800">
                                <div className="p-6 space-y-5">
                                    <F label="API yo'li" error={errors.apiPath} hint="Format: /api/users/:id">
                                        <input value={form.apiPath} onChange={(e) => set('apiPath', e.target.value.toLowerCase())} placeholder="/api/users/:id" className={inputCls(errors.apiPath)} />
                                    </F>
                                    <F label="Frontend yo'li" error={errors.frontendPath} hint="Format: /admin/users">
                                        <input value={form.frontendPath} onChange={(e) => set('frontendPath', e.target.value.toLowerCase())} placeholder="/admin/users" className={inputCls(errors.frontendPath)} />
                                    </F>
                                    <F label="UI kalit (uiKey)" hint="Masalan: users-list-view">
                                        <input value={form.uiKey} onChange={(e) => set('uiKey', e.target.value.toLowerCase())} placeholder="users-list-view" className={inputCls()} />
                                    </F>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* System permission toggle */}
                <div className={`bg-white dark:bg-gray-900 border rounded-2xl shadow-sm overflow-hidden transition ${form.isSystemPermission ? 'border-violet-300 dark:border-violet-700' : 'border-gray-200 dark:border-gray-800'}`}>
                    <div className="p-5 flex items-start gap-4">
                        <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${form.isSystemPermission ? 'bg-violet-100 dark:bg-violet-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                            <Lock className={`w-5 h-5 ${form.isSystemPermission ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">System permission</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                                        Bir marta belgilangach, <strong>qaytarib bo'lmaydi</strong>. System permissionlar o'chirib yoki bulk-delete qilib bo'lmaydi.
                                    </p>
                                </div>
                                <button type="button" onClick={() => set('isSystemPermission', !form.isSystemPermission)} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${form.isSystemPermission ? 'bg-violet-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                    <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all" style={{ left: form.isSystemPermission ? '22px' : '2px' }} />
                                </button>
                            </div>
                            {form.isSystemPermission && (
                                <div className="mt-3 flex items-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                                    <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                    <p className="text-[11px] text-amber-700 dark:text-amber-300">Bu permission doimiy himoyalangan bo'ladi.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <button onClick={() => router.back()} className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                        Bekor
                    </button>
                    <button onClick={handleSubmit} disabled={isCreating} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition disabled:opacity-50 shadow-sm">
                        {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Permission yaratish
                    </button>
                </div>
            </div>
        </div>
    );
}

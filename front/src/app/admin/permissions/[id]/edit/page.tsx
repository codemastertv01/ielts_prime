'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Check, ChevronRight, Info, Loader2, Lock, RefreshCw, Shield } from 'lucide-react';

import { usePermission } from '@/hooks/useAdminPermissions';

import { PermissionCategory } from '@/types/permission';
import { EntityStatus, EntityStatusEnum } from '@/types/entity.status';
import type { ChangeStatusDto, UpdatePermissionDto } from '@/types/permission';

import { ALL_ACTIONS, ALL_CATEGORIES, ALL_STATUSES, inputCls, labelCls, StatusBadge } from '../../components/PermissionShared';

interface FormState {
    name: string;
    resource: string;
    action: string;
    description: string;
    category: PermissionCategory;
    isSystemPermission: boolean;
    apiPath: string;
    frontendPath: string;
    uiKey: string;
}

interface StatusFormState {
    status: EntityStatus;
    reason: string;
}

function validateForm(form: FormState, isSystem: boolean): Record<string, string> {
    const e: Record<string, string> = {};
    if (!isSystem) {
        if (!form.name.trim()) e.name = 'Majburiy';
        else if (form.name.length < 3) e.name = 'Kamida 3 belgi';
        else if (!/^[a-z0-9:_.*-]+$/.test(form.name)) e.name = "Noto'g'ri format";
        if (!form.resource.trim()) e.resource = 'Majburiy';
        else if (!/^[a-z0-9_*-]+$/.test(form.resource)) e.resource = "Noto'g'ri format";
    }
    return e;
}

export default function EditPermissionPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const id = params?.id ?? '';

    const { permission, isLoading, isRefetching, refetch, update, isUpdating, changeStatus, isChangingStatus } = usePermission(id);

    const [form, setForm] = useState<FormState | null>(null);
    const [statusForm, setStatusForm] = useState<StatusFormState>({ status: EntityStatusEnum.ACTIVE, reason: '' });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState('');
    const [activeTab, setActiveTab] = useState<'fields' | 'status'>('fields');

    useEffect(() => {
        if (permission && !form) {
            setForm({
                name: permission.name,
                resource: permission.resource,
                action: permission.action,
                description: permission.description ?? '',
                category: permission.category,
                isSystemPermission: permission.isSystemPermission,
                apiPath: permission.apiPath ?? '',
                frontendPath: permission.frontendPath ?? '',
                uiKey: permission.uiKey ?? '',
            });
            setStatusForm({ status: permission.status, reason: '' });
        }
    }, [permission]);

    const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((p) => (p ? { ...p, [k]: v } : p));

    const handleSaveFields = () => {
        if (!form || !permission) return;
        const errs = validateForm(form, permission.isSystemPermission);
        setFormErrors(errs);
        if (Object.keys(errs).length > 0) return;
        setApiError('');

        const dto: UpdatePermissionDto = {
            resource: form.resource.toLowerCase(),
            action: form.action,
            description: form.description.trim() || undefined,
            category: form.category,
            apiPath: form.apiPath.trim() || undefined,
            frontendPath: form.frontendPath.trim() || undefined,
            uiKey: form.uiKey.trim() || undefined,
        };
        if (!permission.isSystemPermission) {
            dto.name = form.name.trim().toLowerCase();
        }
        if (!permission.isSystemPermission && form.isSystemPermission) {
            dto.isSystemPermission = true;
        }

        update(dto, {
            onSuccess: () => {
                setSaveSuccess('Muvaffaqiyatli saqlandi');
                setTimeout(() => setSaveSuccess(''), 3000);
            },
            onError: (e: unknown) => setApiError((e as any)?.response?.data?.message ?? 'Saqlashda xato'),
        });
    };

    const handleSaveStatus = () => {
        if (!permission) return;
        if (statusForm.status === permission.status) {
            setApiError('Status allaqachon shu qiymatda');
            return;
        }
        setApiError('');
        const dto: ChangeStatusDto = { status: statusForm.status, reason: statusForm.reason.trim() || undefined };
        changeStatus(dto, {
            onSuccess: () => {
                setSaveSuccess('Status yangilandi');
                setTimeout(() => setSaveSuccess(''), 3000);
                setStatusForm((p) => ({ ...p, reason: '' }));
            },
            onError: (e: unknown) => setApiError((e as any)?.response?.data?.message ?? 'Xato'),
        });
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

    if (isLoading)
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-violet-600 animate-spin" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Yuklanmoqda...</p>
                </div>
            </div>
        );

    if (!permission || !form)
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-3">Permission topilmadi</p>
                    <button onClick={() => router.back()} className="text-sm text-violet-600 dark:text-violet-400 hover:underline">
                        ← Orqaga
                    </button>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                                <span className="cursor-pointer hover:text-gray-600" onClick={() => router.push('/admin/permissions')}>
                                    Permissions
                                </span>
                                <ChevronRight className="w-3 h-3" />
                                <span className="font-mono">{permission._id.slice(-8).toUpperCase()}</span>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Tahrirlash</span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-violet-500" />
                                <span className="font-mono">{permission.name}</span>
                                {permission.isSystemPermission && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                                        <Lock className="w-2.5 h-2.5" /> System
                                    </span>
                                )}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge status={permission.status} />
                        <button onClick={() => refetch()} disabled={isRefetching} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition disabled:opacity-50">
                            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Alerts */}
                <AnimatePresence>
                    {apiError && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-700 dark:text-red-300">{apiError}</p>
                        </motion.div>
                    )}
                    {saveSuccess && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <p className="text-sm text-emerald-700 dark:text-emerald-300">{saveSuccess}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* System notice */}
                {permission.isSystemPermission && (
                    <div className="flex items-start gap-3 p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl">
                        <Lock className="w-4 h-4 text-violet-600 dark:text-violet-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-violet-800 dark:text-violet-200">System Permission</p>
                            <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5">Nom qulflangan. Resource, action, tavsif va kategoriya tahrirlash mumkin.</p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
                    {[
                        { id: 'fields', label: 'Maydonlar' },
                        { id: 'status', label: 'Status' },
                    ].map((t) => (
                        <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex-1 py-2 text-sm font-semibold rounded-xl transition ${activeTab === t.id ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Fields Tab */}
                {activeTab === 'fields' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Permission maydonlari</h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <F label="Permission nomi" error={formErrors.name} hint={!permission.isSystemPermission ? 'Format: resource:action (kichik harf)' : undefined}>
                                <div className="relative">
                                    <input value={form.name} onChange={(e) => set('name', e.target.value.toLowerCase())} disabled={permission.isSystemPermission} placeholder="users:delete" className={`${inputCls(formErrors.name)} font-mono ${permission.isSystemPermission ? 'opacity-60 cursor-not-allowed' : ''}`} />
                                    {permission.isSystemPermission && <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
                                </div>
                            </F>

                            <div className="grid grid-cols-2 gap-4">
                                <F label="Resource" error={formErrors.resource}>
                                    <input value={form.resource} onChange={(e) => set('resource', e.target.value.toLowerCase())} placeholder="users" className={inputCls(formErrors.resource)} />
                                </F>
                                <F label="Amal">
                                    <select value={form.action} onChange={(e) => set('action', e.target.value)} className={inputCls()}>
                                        {ALL_ACTIONS.map((a) => (
                                            <option key={a} value={a}>
                                                {a}
                                            </option>
                                        ))}
                                    </select>
                                </F>
                            </div>

                            <F label="Tavsif">
                                <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} placeholder="Bu permission nima qilish imkonini beradi?" className={`${inputCls()} resize-none`} />
                            </F>

                            <F label="Kategoriya">
                                <div className="grid grid-cols-4 gap-2">
                                    {ALL_CATEGORIES.map((c) => (
                                        <button key={c} type="button" onClick={() => set('category', c as PermissionCategory)} className={`py-2.5 text-xs font-semibold rounded-xl border transition capitalize ${form.category === c ? 'bg-violet-600 text-white border-violet-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-violet-400'}`}>
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </F>

                            <div className="grid grid-cols-1 gap-4">
                                <F label="API yo'li" hint="/api/resource/:id">
                                    <input value={form.apiPath} onChange={(e) => set('apiPath', e.target.value.toLowerCase())} placeholder="/api/users/:id" className={inputCls()} />
                                </F>
                                <F label="Frontend yo'li" hint="/admin/users">
                                    <input value={form.frontendPath} onChange={(e) => set('frontendPath', e.target.value.toLowerCase())} placeholder="/admin/users" className={inputCls()} />
                                </F>
                                <F label="UI kalit">
                                    <input value={form.uiKey} onChange={(e) => set('uiKey', e.target.value.toLowerCase())} placeholder="users-list-view" className={inputCls()} />
                                </F>
                            </div>

                            {/* isSystemPermission toggle (only if not already system) */}
                            {!permission.isSystemPermission && (
                                <div className={`flex items-start gap-4 p-4 rounded-2xl border transition ${form.isSystemPermission ? 'border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60'}`}>
                                    <Lock className={`w-4 h-4 mt-0.5 flex-shrink-0 ${form.isSystemPermission ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400'}`} />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">System permission</p>
                                            <button type="button" onClick={() => set('isSystemPermission', !form.isSystemPermission)} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${form.isSystemPermission ? 'bg-violet-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                                <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all" style={{ left: form.isSystemPermission ? '22px' : '2px' }} />
                                            </button>
                                        </div>
                                        {form.isSystemPermission && (
                                            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
                                                <Info className="w-3 h-3" /> Saqlagandan so'ng qaytarib bo'lmaydi
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end gap-3">
                            <button onClick={() => router.back()} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition">
                                Bekor
                            </button>
                            <button onClick={handleSaveFields} disabled={isUpdating} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition disabled:opacity-50 shadow-sm">
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Saqlash
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Status Tab */}
                {activeTab === 'status' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Status boshqaruvi</h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Joriy:</span>
                                <StatusBadge status={permission.status} />
                            </div>

                            <div>
                                <label className={labelCls}>Yangi status</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {ALL_STATUSES.map((s, idx) => (
                                        <button key={idx} type="button" onClick={() => setStatusForm((p) => ({ ...p, status: s }))} disabled={s === permission.status} className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${statusForm.status === s && s !== permission.status ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'}`}>
                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s === 'ACTIVE' ? 'bg-emerald-500' : s === 'INACTIVE' ? 'bg-red-500' : s === 'PENDING' ? 'bg-amber-500' : 'bg-gray-400'}`} />
                                            {s}
                                            {s === permission.status && <span className="ml-auto text-[10px] text-gray-400">joriy</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className={labelCls}>Sabab (ixtiyoriy)</label>
                                <textarea value={statusForm.reason} onChange={(e) => setStatusForm((p) => ({ ...p, reason: e.target.value }))} rows={2} placeholder="Nima uchun status o'zgartirilmoqda?" className={`${inputCls()} resize-none`} />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end gap-3">
                            <button onClick={handleSaveStatus} disabled={isChangingStatus || statusForm.status === permission.status} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition disabled:opacity-50 shadow-sm">
                                {isChangingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Status yangilash
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

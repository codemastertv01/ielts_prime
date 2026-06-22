'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Calendar, Check, ChevronRight, Info, Loader2, Lock, RefreshCw, Shield } from 'lucide-react';
import { useRole } from '@/hooks/useAdminRoles';
import { usePermissions } from '@/hooks/useAdminPermissions';

import { RoleType } from '@/types/role';
import { EntityStatus, EntityStatusEnum } from '@/types/entity.status';
import type { ChangeStatusDto, ScheduleStatusDto, UpdateRoleDto } from '@/types/role';

import { AssignPermissionsModal } from '../../components/AssignPermissionsModal';
import { ALL_ROLE_TYPES, ALL_STATUSES, inputCls, labelCls, StatusBadge } from '../../components/RoleShared';

interface FormState {
    name: string;
    description: string;
    type: RoleType;
    priority: number;
    isSystemRole: boolean;
}

interface StatusFormState {
    status: EntityStatus;
    reason: string;
}

function validateForm(form: FormState, isSystem: boolean): Record<string, string> {
    const e: Record<string, string> = {};
    if (!isSystem) {
        if (!form.name.trim()) e.name = 'Majburiy';
        else if (form.name.length < 2) e.name = 'Kamida 2 belgi';
        else if (!/^[a-zA-Z0-9_\s-]+$/.test(form.name)) e.name = "Noto'g'ri format";
    }
    if (form.priority < 0 || form.priority > 100) e.priority = "0–100 oralig'ida";
    return e;
}

export default function EditRolePage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const id = params?.id ?? '';

    const { role, isLoading, isRefetching, refetch, update, isUpdating, changeStatus, isChangingStatus, scheduleStatus, isScheduling, assignPermissions, isAssigning, removePermissions, isRemoving } = useRole(id);

    const { permissions: allPermissions } = usePermissions({ limit: 200, status: EntityStatusEnum.ACTIVE });

    const [form, setForm] = useState<FormState | null>(null);
    const [statusForm, setStatusForm] = useState<StatusFormState>({ status: EntityStatusEnum.ACTIVE, reason: '' });
    const [scheduleForm, setScheduleForm] = useState({ status: EntityStatusEnum.ACTIVE, scheduledAt: '' });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState('');
    const [activeTab, setActiveTab] = useState<'fields' | 'status' | 'permissions' | 'schedule'>('fields');
    const [showAssignModal, setShowAssignModal] = useState(false);

    useEffect(() => {
        if (role && !form) {
            setForm({
                name: role.name,
                description: role.description ?? '',
                type: role.type,
                priority: role.priority,
                isSystemRole: role.isSystemRole,
            });
            setStatusForm({ status: role.status, reason: '' });
        }
    }, [role]);

    const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((p) => (p ? { ...p, [k]: v } : p));

    const showOk = (msg: string) => {
        setSaveSuccess(msg);
        setTimeout(() => setSaveSuccess(''), 3000);
    };

    const handleSaveFields = () => {
        if (!form || !role) return;
        const errs = validateForm(form, role.isSystemRole);
        setFormErrors(errs);
        if (Object.keys(errs).length > 0) return;
        setApiError('');

        const dto: UpdateRoleDto = {
            description: form.description.trim() || undefined,
            type: form.type,
            priority: form.priority,
        };
        if (!role.isSystemRole) dto.name = form.name.trim();
        if (!role.isSystemRole && form.isSystemRole) dto.isSystemRole = true;

        update(dto, {
            onSuccess: () => showOk('Muvaffaqiyatli saqlandi'),
            onError: (e: unknown) => setApiError((e as any)?.response?.data?.message ?? 'Saqlashda xato'),
        });
    };

    const handleSaveStatus = () => {
        if (!role) return;
        if (statusForm.status === role.status) {
            setApiError('Status allaqachon shu qiymatda');
            return;
        }
        setApiError('');
        const dto: ChangeStatusDto = { status: statusForm.status, reason: statusForm.reason.trim() || undefined };
        changeStatus(dto, {
            onSuccess: () => {
                showOk('Status yangilandi');
                setStatusForm((p) => ({ ...p, reason: '' }));
            },
            onError: (e: unknown) => setApiError((e as any)?.response?.data?.message ?? 'Xato'),
        });
    };

    const handleSchedule = () => {
        if (!scheduleForm.scheduledAt) {
            setApiError('Vaqt kiriting');
            return;
        }
        if (new Date(scheduleForm.scheduledAt) <= new Date()) {
            setApiError("O'tgan vaqt kiritildi");
            return;
        }
        setApiError('');
        const dto: ScheduleStatusDto = { status: scheduleForm.status, scheduledAt: new Date(scheduleForm.scheduledAt).toISOString() };
        scheduleStatus(dto, {
            onSuccess: () => showOk('Rejalashtirilib saqlandi'),
            onError: (e: unknown) => setApiError((e as any)?.response?.data?.message ?? 'Xato'),
        });
    };

    const handleAssign = (permissionIds: string[]) => {
        assignPermissions(
            { permissionIds },
            {
                onSuccess: () => showOk(`${permissionIds.length} ta permission qo'shildi`),
                onError: (e: unknown) => setApiError((e as any)?.response?.data?.message ?? 'Xato'),
            }
        );
    };

    const handleRemove = (permissionIds: string[]) => {
        removePermissions(
            { permissionIds },
            {
                onSuccess: () => showOk(`${permissionIds.length} ta permission olib tashlandi`),
                onError: (e: unknown) => setApiError((e as any)?.response?.data?.message ?? 'Xato'),
            }
        );
    };

    const TYPE_COLORS: Record<string, string> = {
        admin: 'bg-violet-600 text-white border-violet-600',
        user: 'bg-sky-600 text-white border-sky-600',
        moderator: 'bg-amber-600 text-white border-amber-600',
        guest: 'bg-gray-500 text-white border-gray-500',
        custom: 'bg-teal-600 text-white border-teal-600',
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
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Yuklanmoqda...</p>
                </div>
            </div>
        );

    if (!role || !form)
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-3">Role topilmadi</p>
                    <button onClick={() => router.back()} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        ← Orqaga
                    </button>
                </div>
            </div>
        );

    const assignedPerms = Array.isArray(role.permissions) ? (role.permissions as any[]) : [];

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
                                <span className="cursor-pointer hover:text-gray-600" onClick={() => router.push('/admin/roles')}>
                                    Roles
                                </span>
                                <ChevronRight className="w-3 h-3" />
                                <span className="font-mono">{role._id.slice(-8).toUpperCase()}</span>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Tahrirlash</span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-500" />
                                <span>{role.name}</span>
                                {role.isSystemRole && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                                        <Lock className="w-2.5 h-2.5" /> System
                                    </span>
                                )}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge status={role.status} />
                        <button onClick={() => refetch()} disabled={isRefetching} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 transition disabled:opacity-50">
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

                {role.isSystemRole && (
                    <div className="flex items-start gap-3 p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl">
                        <Lock className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-violet-800 dark:text-violet-200">System Role</p>
                            <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5">Nom qulflangan. Boshqa maydonlar tahrirlash mumkin.</p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
                    {[
                        { id: 'fields', label: 'Maydonlar' },
                        { id: 'status', label: 'Status' },
                        { id: 'permissions', label: `Permissions (${assignedPerms.length})` },
                        { id: 'schedule', label: 'Rejalashtirish' },
                    ].map((t) => (
                        <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${activeTab === t.id ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ── Fields tab ─── */}
                {activeTab === 'fields' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Role maydonlari</h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <F label="Role nomi" error={formErrors.name} hint={!role.isSystemRole ? "Harf, raqam, _, - va bo'sh joy" : undefined}>
                                <div className="relative">
                                    <input value={form.name} onChange={(e) => set('name', e.target.value)} disabled={role.isSystemRole} placeholder="content-moderator" className={`${inputCls(formErrors.name)} ${role.isSystemRole ? 'opacity-60 cursor-not-allowed' : ''}`} />
                                    {role.isSystemRole && <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
                                </div>
                            </F>

                            <F label="Tavsif">
                                <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} placeholder="Rol tavsifi..." className={`${inputCls()} resize-none`} />
                            </F>

                            <F label="Tur (type)">
                                <div className="grid grid-cols-5 gap-2">
                                    {ALL_ROLE_TYPES.map((t) => (
                                        <button key={t} type="button" onClick={() => set('type', t)} className={`py-2.5 text-xs font-semibold rounded-xl border transition capitalize ${form.type === t ? TYPE_COLORS[t] : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-400'}`}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </F>

                            <F label="Prioritet (0–100)" error={formErrors.priority}>
                                <div className="flex items-center gap-4">
                                    <input type="range" min={0} max={100} step={5} value={form.priority} onChange={(e) => set('priority', Number(e.target.value))} className="flex-1 accent-blue-600" />
                                    <span className={`text-sm font-bold font-mono w-10 text-center ${form.priority >= 70 ? 'text-red-600' : form.priority >= 40 ? 'text-amber-600' : 'text-gray-600 dark:text-gray-400'}`}>{form.priority}</span>
                                </div>
                            </F>

                            {!role.isSystemRole && (
                                <div className={`flex items-start gap-4 p-4 rounded-2xl border transition ${form.isSystemRole ? 'border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60'}`}>
                                    <Lock className={`w-4 h-4 mt-0.5 flex-shrink-0 ${form.isSystemRole ? 'text-violet-600' : 'text-gray-400'}`} />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">System role</p>
                                            <button type="button" onClick={() => set('isSystemRole', !form.isSystemRole)} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${form.isSystemRole ? 'bg-violet-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                                <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all" style={{ left: form.isSystemRole ? '22px' : '2px' }} />
                                            </button>
                                        </div>
                                        {form.isSystemRole && (
                                            <p className="text-[11px] text-amber-600 mt-1.5 flex items-center gap-1">
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
                            <button onClick={handleSaveFields} disabled={isUpdating} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition disabled:opacity-50 shadow-sm">
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Saqlash
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ── Status tab ─── */}
                {activeTab === 'status' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Status boshqaruvi</h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                                <span className="text-xs text-gray-500">Joriy:</span>
                                <StatusBadge status={role.status} />
                            </div>
                            <div>
                                <label className={labelCls}>Yangi status</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {ALL_STATUSES.filter((s) => ['ACTIVE', 'INACTIVE', 'PENDING', 'ARCHIVED'].includes(s)).map((s, idx) => (
                                        <button key={idx} type="button" onClick={() => setStatusForm((p) => ({ ...p, status: s }))} disabled={s === role.status} className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${statusForm.status === s && s !== role.status ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'}`}>
                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s === 'ACTIVE' ? 'bg-emerald-500' : s === 'INACTIVE' ? 'bg-red-500' : s === 'PENDING' ? 'bg-amber-500' : 'bg-gray-400'}`} />
                                            {s}
                                            {s === role.status && <span className="ml-auto text-[10px] text-gray-400">joriy</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Sabab (ixtiyoriy)</label>
                                <textarea value={statusForm.reason} onChange={(e) => setStatusForm((p) => ({ ...p, reason: e.target.value }))} rows={2} placeholder="Nima uchun o'zgartirilmoqda?" className={`${inputCls()} resize-none`} />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end gap-3">
                            <button onClick={handleSaveStatus} disabled={isChangingStatus || statusForm.status === role.status} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition disabled:opacity-50 shadow-sm">
                                {isChangingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Status yangilash
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ── Permissions tab ─── */}
                {activeTab === 'permissions' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between">
                            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Biriktirilgan permissionlar ({assignedPerms.length})</h2>
                            {!role.isSystemRole && (
                                <button onClick={() => setShowAssignModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition">
                                    <Shield className="w-3 h-3" /> Boshqarish
                                </button>
                            )}
                        </div>
                        <div className="p-5">
                            {assignedPerms.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-8">Permission biriktirilmagan</p>
                            ) : (
                                <div className="space-y-2">
                                    {assignedPerms.map((perm: any, i: number) => {
                                        const name = typeof perm === 'string' ? perm : perm.name;
                                        const action = typeof perm === 'string' ? '—' : perm.action;
                                        const desc = typeof perm === 'string' ? null : perm.description;
                                        const isSystem = typeof perm === 'string' ? false : perm.isSystemPermission;
                                        const ACTION_COLORS: Record<string, string> = {
                                            read: 'text-sky-600 bg-sky-50 dark:bg-sky-900/20',
                                            create: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
                                            update: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
                                            delete: 'text-red-600 bg-red-50 dark:bg-red-900/20',
                                            manage: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20',
                                        };
                                        return (
                                            <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                                <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white flex-1 truncate">{name}</span>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ACTION_COLORS[action] ?? 'text-gray-600 bg-gray-100'}`}>{action}</span>
                                                {isSystem && <span className="text-[10px] text-violet-600 bg-violet-50 dark:bg-violet-900/30 px-1.5 py-0.5 rounded">sys</span>}
                                                {desc && <span className="text-[10px] text-gray-400 truncate max-w-[120px]">{desc}</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ── Schedule tab ─── */}
                {activeTab === 'schedule' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Status rejalashtirish</h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                <p className="text-xs text-blue-700 dark:text-blue-300">Kelajakdagi muayyan vaqtda status avtomatik o'zgartiriladi.</p>
                            </div>
                            <div>
                                <label className={labelCls}>Rejalashtiriladigan status</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['ACTIVE', 'ARCHIVED', 'DELETED'].map((s) => (
                                        <button key={s} type="button" onClick={() => setScheduleForm((p) => ({ ...p, status: s as EntityStatusEnum }))} className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition ${scheduleForm.status === s ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'}`}>
                                            <span className={`w-2 h-2 rounded-full ${s === 'ACTIVE' ? 'bg-emerald-500' : s === 'ARCHIVED' ? 'bg-gray-400' : 'bg-red-500'}`} />
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Vaqt</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="datetime-local" value={scheduleForm.scheduledAt} onChange={(e) => setScheduleForm((p) => ({ ...p, scheduledAt: e.target.value }))} min={new Date(Date.now() + 60000).toISOString().slice(0, 16)} className={`${inputCls()} pl-9`} />
                                </div>
                            </div>
                            {role.statusSchedules && role.statusSchedules.length > 0 && (
                                <div>
                                    <label className={labelCls}>Mavjud rejalar</label>
                                    <div className="space-y-2">
                                        {role.statusSchedules.map((s, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
                                                <span className="font-semibold text-gray-700 dark:text-gray-300">{s.scheduledStatus}</span>
                                                <span className="text-gray-400">→</span>
                                                <span className="text-gray-600 dark:text-gray-400">{new Date(s.scheduledAt).toLocaleString('uz-UZ')}</span>
                                                <span className="text-gray-400 ml-auto">by {s.setBy?.username}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end gap-3">
                            <button onClick={handleSchedule} disabled={isScheduling || !scheduleForm.scheduledAt} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition disabled:opacity-50 shadow-sm">
                                {isScheduling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                                Rejalashtirish
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Assign permissions modal */}
            <AssignPermissionsModal open={showAssignModal} role={role} allPermissions={allPermissions} onClose={() => setShowAssignModal(false)} onAssign={handleAssign} onRemove={handleRemove} isAssigning={isAssigning} isRemoving={isRemoving} />
        </div>
    );
}

'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Activity, AlertTriangle, ArrowLeft, Check, ChevronRight, Clock, Copy, Edit3, History, Loader2, RotateCcw, Shield, Trash2, Users } from 'lucide-react';
import { useRole } from '@/hooks/useAdminRoles';
import { ToastContainer } from '../../permissions/components/Toast';
import { Collapsible } from '../../permissions/components/Collapsible';
import { ConfirmModal } from '../../permissions/components/ConfirmModal';
import { RoleAuditLog, RoleStatusHistory, RoleUpdateHistory } from '../components/RoleAudit';
import { DeletedBadge, Field, fmtDate, fmtDateShort, PriorityBadge, SectionCard, StatusBadge, SystemBadge, TypeBadge, UserAvatar } from '../components/RoleShared';

type ToastState = { msg: string; type: 'success' | 'error' } | null;
type DialogState = 'delete' | 'restore' | 'hardDelete' | null;

export default function RoleDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const id = params?.id ?? '';

    const { role, isLoading, isRefetching, refetch, softDelete, isDeleting, restore, isRestoring, hardDelete, isHardDeleting } = useRole(id);

    const [dialog, setDialog] = useState<DialogState>(null);
    const [toast, setToast] = useState<ToastState>(null);
    const [copiedId, setCopiedId] = useState(false);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleDelete = () => {
        softDelete(undefined, {
            onSuccess: () => {
                setDialog(null);
                showToast("Role o'chirildi");
                refetch();
            },
            onError: (e: unknown) => showToast((e as any)?.response?.data?.message ?? 'Xato', 'error'),
        });
    };

    const handleRestore = () => {
        restore(undefined as any, {
            onSuccess: () => {
                setDialog(null);
                showToast('Role tiklandi');
            },
            onError: (e: unknown) => showToast((e as any)?.response?.data?.message ?? 'Xato', 'error'),
        });
    };

    const handleHardDelete = () => {
        hardDelete(undefined as any, {
            onSuccess: () => {
                showToast("Doimiy o'chirildi");
                setTimeout(() => router.push('/admin/roles'), 1000);
            },
            onError: (e: unknown) => showToast((e as any)?.response?.data?.message ?? 'Xato', 'error'),
        });
    };

    const copyId = () => {
        if (!role) return;
        navigator.clipboard.writeText(role._id);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 1500);
    };

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

    if (!role)
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-3">Role topilmadi</p>
                    <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">
                        ← Orqaga
                    </button>
                </div>
            </div>
        );

    const assignedPerms = Array.isArray(role.permissions) ? (role.permissions as any[]) : [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <ToastContainer toast={toast} />

            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-3">
                        <span className="cursor-pointer hover:text-gray-600" onClick={() => router.push('/admin')}>
                            Admin
                        </span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="cursor-pointer hover:text-gray-600" onClick={() => router.push('/admin/roles')}>
                            Roles
                        </span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-gray-700 dark:text-gray-300 font-mono">{role._id.slice(-8).toUpperCase()}</span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <button onClick={() => router.back()} className="mt-1 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">{role.name}</h1>
                                    <StatusBadge status={role.status} />
                                    <TypeBadge type={role.type} />
                                    {role.isSystemRole && <SystemBadge />}
                                    {role.isDeleted && <DeletedBadge />}
                                    <PriorityBadge priority={role.priority} />
                                </div>
                                <button onClick={copyId} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 font-mono mt-1.5 transition">
                                    <span>{role._id}</span>
                                    {copiedId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                </button>
                                {role.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{role.description}</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                            <button onClick={() => refetch()} disabled={isRefetching} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50">
                                <RotateCcw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
                            </button>
                            {!role.isDeleted && (
                                <>
                                    <button onClick={() => router.push(`/admin/roles/${id}/edit`)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-xl hover:bg-blue-200 transition">
                                        <Edit3 className="w-3.5 h-3.5" /> Tahrirlash
                                    </button>
                                    {!role.isSystemRole && role.userCount === 0 && (
                                        <button onClick={() => setDialog('delete')} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-xl hover:bg-red-200 transition">
                                            <Trash2 className="w-3.5 h-3.5" /> O'chirish
                                        </button>
                                    )}
                                </>
                            )}
                            {role.isDeleted && (
                                <>
                                    <button onClick={() => setDialog('restore')} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl hover:bg-emerald-200 transition">
                                        <RotateCcw className="w-3.5 h-3.5" /> Tiklash
                                    </button>
                                    <button onClick={() => setDialog('hardDelete')} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition">
                                        <Trash2 className="w-3.5 h-3.5" /> Doimiy o'chirish
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Left */}
                    <div className="lg:col-span-2 space-y-4">
                        <SectionCard title="Role tafsilotlari">
                            <div className="grid grid-cols-2 gap-x-8">
                                <div className="space-y-0">
                                    <Field label="Nom" value={role.name} />
                                    <Field label="Tur" value={<TypeBadge type={role.type} />} />
                                    <Field label="Prioritet" value={<PriorityBadge priority={role.priority} />} />
                                    <Field label="Permissionlar" value={<span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{assignedPerms.length} ta</span>} />
                                </div>
                                <div className="space-y-0">
                                    <Field label="Status" value={<StatusBadge status={role.status} />} />
                                    <Field label="System" value={role.isSystemRole ? '🔒 Ha — himoyalangan' : "Yo'q"} />
                                    <Field label="O'chirilgan" value={role.isDeleted ? '🗑 Ha' : "Yo'q"} />
                                    <Field
                                        label="Foydalanuvchilar"
                                        value={
                                            <span className="flex items-center gap-1 text-xs">
                                                <Users className="w-3 h-3" /> {role.userCount}
                                            </span>
                                        }
                                    />
                                    {role.scheduledDeletionAt && <Field label="O'chirish sanasi" value={fmtDateShort(role.scheduledDeletionAt)} />}
                                </div>
                            </div>
                            {role.description && (
                                <div className="mt-4 p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold uppercase tracking-wider">Tavsif</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{role.description}</p>
                                </div>
                            )}
                        </SectionCard>

                        {/* Permissions list */}
                        <Collapsible title="Biriktirilgan permissionlar" icon={<Shield className="w-4 h-4" />} count={assignedPerms.length}>
                            {assignedPerms.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">Permission biriktirilmagan</p>
                            ) : (
                                <div className="space-y-1.5">
                                    {assignedPerms.map((perm: any, i: number) => {
                                        const isObj = typeof perm === 'object';
                                        const ACTION_COLORS: Record<string, string> = {
                                            read: 'text-sky-600 bg-sky-50 dark:bg-sky-900/20',
                                            create: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
                                            update: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
                                            delete: 'text-red-600 bg-red-50 dark:bg-red-900/20',
                                            manage: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20',
                                        };
                                        return (
                                            <div key={i} className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                                <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white flex-1 truncate">{isObj ? perm.name : perm}</span>
                                                {isObj && (
                                                    <>
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ACTION_COLORS[perm.action] ?? 'text-gray-600 bg-gray-100'}`}>{perm.action}</span>
                                                        {perm.isSystemPermission && <span className="text-[10px] text-violet-600 bg-violet-50 dark:bg-violet-900/30 px-1.5 py-0.5 rounded">sys</span>}
                                                        {perm.description && <span className="text-[10px] text-gray-400 truncate max-w-[100px] hidden sm:block">{perm.description}</span>}
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Collapsible>

                        <Collapsible title="Audit logi" icon={<Activity className="w-4 h-4" />} count={role.auditLog?.length ?? 0}>
                            <RoleAuditLog entries={role.auditLog ?? []} />
                        </Collapsible>

                        <Collapsible title="O'zgarishlar tarixi" icon={<History className="w-4 h-4" />} count={role.updateHistory?.length ?? 0}>
                            <RoleUpdateHistory history={role.updateHistory ?? []} />
                        </Collapsible>

                        <Collapsible title="Status tarixi" icon={<Clock className="w-4 h-4" />} count={role.statusHistory?.length ?? 0}>
                            <RoleStatusHistory history={role.statusHistory ?? []} />
                        </Collapsible>

                        {/* Status schedules */}
                        {role.statusSchedules && role.statusSchedules.length > 0 && (
                            <Collapsible title="Rejalashtirilgan statuslar" icon={<Clock className="w-4 h-4" />} count={role.statusSchedules.length}>
                                <div className="space-y-2">
                                    {role.statusSchedules.map((s, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-xs">
                                            <StatusBadge status={s.scheduledStatus} />
                                            <span className="text-gray-400">→</span>
                                            <span className="text-gray-600 dark:text-gray-400">{new Date(s.scheduledAt).toLocaleString('uz-UZ')}</span>
                                            <span className="text-gray-400 ml-auto">by {s.setBy?.username}</span>
                                        </div>
                                    ))}
                                </div>
                            </Collapsible>
                        )}
                    </div>

                    {/* Right */}
                    <div className="space-y-4">
                        <SectionCard title="Umumiy ma'lumot">
                            <Field label="ID" value={role._id} mono />
                            <Field label="Yaratilgan" value={fmtDate(role.createdAt)} />
                            <Field label="Yangilangan" value={fmtDate(role.updatedAt)} />
                            {role.activatedAt && <Field label="Faollashtirilgan" value={fmtDate(role.activatedAt)} />}
                            {role.inactivatedAt && <Field label="Nofaollantirilgan" value={fmtDate(role.inactivatedAt)} />}
                            {role.inactiveReason && <Field label="Nofaol sababi" value={role.inactiveReason} />}
                            {role.restoredAt && <Field label="Tiklangan" value={fmtDate(role.restoredAt)} />}
                            {role.deletedAt && <Field label="O'chirilgan" value={fmtDate(role.deletedAt)} />}
                        </SectionCard>

                        {role.createdBy && (
                            <SectionCard title="Yaratuvchi">
                                <div className="flex items-center gap-3 mb-3">
                                    <UserAvatar username={role.createdBy.username} size="md" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{role.createdBy.username}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{role.createdBy.email}</p>
                                    </div>
                                </div>
                                <Field label="User ID" value={role.createdBy.userId} mono />
                                <Field label="IP" value={role.createdBy.ipAddress ?? '—'} mono />
                                <Field label="Qurilma" value={role.createdBy.device ?? '—'} />
                                <Field label="Brauzer" value={role.createdBy.browser ?? '—'} />
                                <Field label="OS" value={role.createdBy.os ?? '—'} />
                                {role.createdBy.country && <Field label="Mamlakat" value={role.createdBy.country} />}
                                <Field label="Vaqt" value={fmtDate(role.createdBy.timestamp)} />
                            </SectionCard>
                        )}

                        {role.updatedBy && role.updatedBy.length > 0 && (
                            <SectionCard title="Oxirgi tahrirlagan">
                                {[...role.updatedBy].slice(-1).map((u, i) => (
                                    <div key={i}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <UserAvatar username={u.username} size="md" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{u.username}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{fmtDate(u.timestamp)}</p>
                                            </div>
                                        </div>
                                        <Field label="IP" value={u.ipAddress ?? '—'} mono />
                                    </div>
                                ))}
                            </SectionCard>
                        )}

                        {role.isDeleted && role.deletedBy?.length ? (
                            <SectionCard title="O'chiruvchi">
                                {role.deletedBy.map((d, i) => (
                                    <div key={i} className="mb-4 last:mb-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <UserAvatar username={d.username} size="md" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{d.username}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{fmtDate(d.timestamp)}</p>
                                            </div>
                                        </div>
                                        <Field label="IP" value={d.ipAddress ?? '—'} mono />
                                        <Field label="Qurilma" value={d.device ?? '—'} />
                                    </div>
                                ))}
                                {role.scheduledDeletionAt && (
                                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                        <p className="text-xs text-red-700 dark:text-red-300 font-medium">Doimiy o'chirish rejalashtirilgan: {fmtDateShort(role.scheduledDeletionAt)}</p>
                                    </div>
                                )}
                            </SectionCard>
                        ) : null}

                        {role.restoredBy?.length ? (
                            <SectionCard title="Tiklovchi">
                                {role.restoredBy.map((r, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <UserAvatar username={r.username} size="md" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.username}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{fmtDate(r.timestamp)}</p>
                                        </div>
                                    </div>
                                ))}
                            </SectionCard>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <ConfirmModal open={dialog === 'delete'} title="Rolni o'chirish" message={`"${role.name}" rolini o'chirmoqchimisiz? 30 kun ichida tiklash mumkin.`} confirmLabel="O'chirish" withReason icon={<Trash2 className="w-4 h-4" />} onConfirm={handleDelete} onClose={() => setDialog(null)} isLoading={isDeleting} />
            <ConfirmModal open={dialog === 'restore'} title="Rolni tiklash" message={`"${role.name}" rolini tiklaysizmi?`} confirmLabel="Tiklash" confirmClass="bg-emerald-500 hover:bg-emerald-600" icon={<RotateCcw className="w-4 h-4" />} onConfirm={handleRestore} onClose={() => setDialog(null)} isLoading={isRestoring} />
            <ConfirmModal open={dialog === 'hardDelete'} title="Doimiy o'chirish" message={`⚠️ "${role.name}" butunlay o'chiriladi. Bu amal qaytarib bo'lmaydi!`} confirmLabel="Doimiy o'chirish" confirmClass="bg-red-700 hover:bg-red-800" icon={<AlertTriangle className="w-4 h-4" />} onConfirm={handleHardDelete} onClose={() => setDialog(null)} isLoading={isHardDeleting} />
        </div>
    );
}

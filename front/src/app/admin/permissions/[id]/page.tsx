'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePermission } from '@/hooks/useAdminPermissions';
import { Activity, AlertTriangle, ArrowLeft, Check, ChevronRight, Clock, Copy, Edit3, History, Loader2, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';
import { ToastContainer } from '../components/Toast';
import { Collapsible } from '../components/Collapsible';
import { ConfirmModal } from '../components/ConfirmModal';
import { AuditLog, StatusHistory, UpdateHistory } from '../components/Audit';
import { ActionBadge, DeletedBadge, Field, fmtDate, fmtDateShort, SectionCard, StatusBadge, SystemBadge, UserAvatar } from '../components/PermissionShared';

type ToastState = { msg: string; type: 'success' | 'error' } | null;
type DialogState = 'delete' | 'restore' | 'hardDelete' | null;

export default function PermissionDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const id = params?.id ?? '';

    const { permission, isLoading, isRefetching, refetch, softDelete, isDeleting, restore, isRestoring, hardDelete, isHardDeleting } = usePermission(id);

    const [dialog, setDialog] = useState<DialogState>(null);
    const [toast, setToast] = useState<ToastState>(null);
    const [copiedId, setCopiedId] = useState(false);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleDelete = () => {
        softDelete(undefined as any, {
            onSuccess: () => {
                setDialog(null);
                showToast("Permission o'chirildi");
                refetch();
            },
            onError: (e: unknown) => showToast((e as any)?.response?.data?.message ?? 'Xato', 'error'),
        });
    };

    const handleRestore = () => {
        restore(undefined as any, {
            onSuccess: () => {
                setDialog(null);
                showToast('Permission tiklandi');
            },
            onError: (e: unknown) => showToast((e as any)?.response?.data?.message ?? 'Xato', 'error'),
        });
    };

    const handleHardDelete = () => {
        hardDelete(undefined as any, {
            onSuccess: () => {
                showToast("Doimiy o'chirildi");
                setTimeout(() => router.push('/admin/permissions'), 1000);
            },
            onError: (e: unknown) => showToast((e as any)?.response?.data?.message ?? 'Xato', 'error'),
        });
    };

    const copyId = () => {
        if (!permission) return;
        navigator.clipboard.writeText(permission._id);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 1500);
    };

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

    if (!permission)
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <ToastContainer toast={toast} />

            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-3">
                        <span className="cursor-pointer hover:text-gray-600" onClick={() => router.push('/admin')}>
                            Admin
                        </span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="cursor-pointer hover:text-gray-600" onClick={() => router.push('/admin/permissions')}>
                            Permissions
                        </span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-gray-700 dark:text-gray-300 font-mono">{permission._id.slice(-8).toUpperCase()}</span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <button onClick={() => router.back()} className="mt-1 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white font-mono">{permission.name}</h1>
                                    <StatusBadge status={permission.status} />
                                    {permission.isSystemPermission && <SystemBadge />}
                                    {permission.isDeleted && <DeletedBadge />}
                                </div>
                                <button onClick={copyId} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-mono mt-1.5 transition">
                                    <span>{permission._id}</span>
                                    {copiedId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                </button>
                                {permission.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{permission.description}</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                            <button onClick={() => refetch()} disabled={isRefetching} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50">
                                <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
                            </button>
                            {!permission.isDeleted && (
                                <>
                                    <button onClick={() => router.push(`/admin/permissions/${id}/edit`)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/30 rounded-xl hover:bg-violet-200 dark:hover:bg-violet-900/50 transition">
                                        <Edit3 className="w-3.5 h-3.5" /> Tahrirlash
                                    </button>
                                    {!permission.isSystemPermission && (
                                        <button onClick={() => setDialog('delete')} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-xl hover:bg-red-200 transition">
                                            <Trash2 className="w-3.5 h-3.5" /> O'chirish
                                        </button>
                                    )}
                                </>
                            )}
                            {permission.isDeleted && (
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
                    {/* Left: main content */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Core details */}
                        <SectionCard title="Permission tafsilotlari">
                            <div className="grid grid-cols-2 gap-x-8">
                                <div className="space-y-0">
                                    <Field label="Nom" value={permission.name} mono />
                                    <Field label="Resource" value={permission.resource} mono />
                                    <Field label="Amal" value={<ActionBadge action={permission.action} />} />
                                    <Field label="Kategoriya" value={<span className="capitalize">{permission.category}</span>} />
                                    <Field label="Scope" value={permission.scope ?? '—'} />
                                </div>
                                <div className="space-y-0">
                                    <Field label="Status" value={<StatusBadge status={permission.status} />} />
                                    <Field label="System" value={permission.isSystemPermission ? '🔒 Ha — himoyalangan' : "Yo'q"} />
                                    <Field label="O'chirilgan" value={permission.isDeleted ? '🗑 Ha' : "Yo'q"} />
                                    {permission.scheduledDeletionAt && <Field label="O'chirish sanasi" value={fmtDateShort(permission.scheduledDeletionAt)} />}
                                    {permission.apiPath && <Field label="API yo'l" value={permission.apiPath} mono />}
                                    {permission.frontendPath && <Field label="Frontend yo'l" value={permission.frontendPath} mono />}
                                    {permission.uiKey && <Field label="UI kalit" value={permission.uiKey} mono />}
                                </div>
                            </div>
                            {permission.description && (
                                <div className="mt-4 p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold uppercase tracking-wider">Tavsif</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{permission.description}</p>
                                </div>
                            )}
                        </SectionCard>

                        {/* Audit Log */}
                        <Collapsible title="Audit logi" icon={<Activity className="w-4 h-4" />} count={permission.auditLog?.length ?? 0}>
                            <AuditLog entries={permission.auditLog ?? []} />
                        </Collapsible>

                        {/* Update History */}
                        <Collapsible title="O'zgarishlar tarixi" icon={<History className="w-4 h-4" />} count={permission.updateHistory?.length ?? 0}>
                            <UpdateHistory history={permission.updateHistory ?? []} />
                        </Collapsible>

                        {/* Status History */}
                        <Collapsible title="Status tarixi" icon={<Clock className="w-4 h-4" />} count={permission.statusHistory?.length ?? 0}>
                            <StatusHistory history={permission.statusHistory ?? []} />
                        </Collapsible>
                    </div>

                    {/* Right: sidebar */}
                    <div className="space-y-4">
                        {/* Overview */}
                        <SectionCard title="Umumiy ma'lumot">
                            <Field label="ID" value={permission._id} mono />
                            <Field label="Yaratilgan" value={fmtDate(permission.createdAt)} />
                            <Field label="Yangilangan" value={fmtDate(permission.updatedAt)} />
                            {permission.inactivatedAt && <Field label="Nofaollantirilgan" value={fmtDate(permission.inactivatedAt)} />}
                            {permission.inactiveReason && <Field label="Nofaol sababi" value={permission.inactiveReason} />}
                            {permission.restoredAt && <Field label="Tiklangan" value={fmtDate(permission.restoredAt)} />}
                            {permission.deletedAt && <Field label="O'chirilgan" value={fmtDate(permission.deletedAt)} />}
                        </SectionCard>

                        {/* Created By */}
                        {permission.createdBy && (
                            <SectionCard title="Yaratuvchi">
                                <div className="flex items-center gap-3 mb-3">
                                    <UserAvatar username={permission.createdBy.username} size="md" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{permission.createdBy.username}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{permission.createdBy.email}</p>
                                    </div>
                                </div>
                                <Field label="User ID" value={permission.createdBy.userId} mono />
                                <Field label="IP" value={permission.createdBy.ipAddress ?? '—'} mono />
                                <Field label="Qurilma" value={permission.createdBy.device ?? '—'} />
                                <Field label="Brauzer" value={permission.createdBy.browser ?? '—'} />
                                <Field label="OS" value={permission.createdBy.os ?? '—'} />
                                {permission.createdBy.country && <Field label="Mamlakat" value={permission.createdBy.country} />}
                                <Field label="Vaqt" value={fmtDate(permission.createdBy.timestamp)} />
                            </SectionCard>
                        )}

                        {/* Updated By */}
                        {permission.updatedBy && (
                            <SectionCard title="Oxirgi tahrirlagan">
                                <div className="flex items-center gap-3 mb-3">
                                    <UserAvatar username={permission.updatedBy.username} size="md" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{permission.updatedBy.username}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{permission.updatedBy.email}</p>
                                    </div>
                                </div>
                                <Field label="IP" value={permission.updatedBy.ipAddress ?? '—'} mono />
                                <Field label="Vaqt" value={fmtDate(permission.updatedBy.timestamp)} />
                            </SectionCard>
                        )}

                        {/* Deleted By */}
                        {permission.isDeleted && permission.deletedBy?.length ? (
                            <SectionCard title="O'chiruvchi">
                                {permission.deletedBy.map((d, i) => (
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
                                {permission.scheduledDeletionAt && (
                                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                        <p className="text-xs text-red-700 dark:text-red-300 font-medium">Doimiy o'chirish rejalashtirilgan: {fmtDateShort(permission.scheduledDeletionAt)}</p>
                                    </div>
                                )}
                            </SectionCard>
                        ) : null}

                        {/* Restored By */}
                        {permission.restoredBy?.length ? (
                            <SectionCard title="Tiklovchi">
                                {permission.restoredBy.map((r, i) => (
                                    <div key={i} className="mb-2 last:mb-0">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar username={r.username} size="md" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.username}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{fmtDate(r.timestamp)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </SectionCard>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <ConfirmModal open={dialog === 'delete'} title="Permission o'chirish" message={`"${permission.name}" permissionini o'chirmoqchimisiz? 30 kun ichida tiklash mumkin.`} confirmLabel="O'chirish" withReason icon={<Trash2 className="w-4 h-4" />} onConfirm={handleDelete} onClose={() => setDialog(null)} isLoading={isDeleting} />
            <ConfirmModal open={dialog === 'restore'} title="Permissionni tiklash" message={`"${permission.name}" permissionini tiklaysizmi?`} confirmLabel="Tiklash" confirmClass="bg-emerald-500 hover:bg-emerald-600" icon={<RotateCcw className="w-4 h-4" />} onConfirm={handleRestore} onClose={() => setDialog(null)} isLoading={isRestoring} />
            <ConfirmModal open={dialog === 'hardDelete'} title="Doimiy o'chirish" message={`⚠️ "${permission.name}" butunlay o'chiriladi. Bu amal qaytarib bo'lmaydi!`} confirmLabel="Doimiy o'chirish" confirmClass="bg-red-700 hover:bg-red-800" icon={<AlertTriangle className="w-4 h-4" />} onConfirm={handleHardDelete} onClose={() => setDialog(null)} isLoading={isHardDeleting} />
        </div>
    );
}

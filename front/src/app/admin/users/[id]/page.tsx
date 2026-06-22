'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Activity, AlertTriangle, ArrowLeft, Check, ChevronRight, Clock, Copy, Edit3, History, Loader2, Monitor, RotateCcw, Shield, Trash2 } from 'lucide-react';
import { useUser, useUserLoginHistory, useUserSessions } from '@/hooks/useAdminUsers';
import { Collapsible } from '../../permissions/components/Collapsible';
import { ConfirmModal } from '../../permissions/components/ConfirmModal';
import { ToastContainer } from '../../permissions/components/Toast';
import { ActiveSessionsList, LoginHistoryList, UserAuditLog, UserStatusHistory, UserUpdateHistory } from '../components/UserAudit';
import { BlockedBadge, DeletedBadge, Field, fmtDate, fmtDateShort, fmtRelative, SectionCard, StatusBadge, UserAvatar, VerifiedBadge } from '../components/UserShared';

type ToastState = { msg: string; type: 'success' | 'error' } | null;
type DialogState = 'delete' | 'restore' | 'hardDelete' | null;

export default function UserDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const id = params?.id ?? '';

    const { user, isLoading, isRefetching, refetch, softDelete, isDeleting, restore, isRestoring, hardDelete, isHardDeleting, revokeSession, isRevokingSession, revokeAllSessions, isRevokingAll } = useUser(id);

    const { data: loginHistoryData } = useUserLoginHistory(id);
    const { data: sessionsData } = useUserSessions(id);
    const loginHistory = loginHistoryData ?? [];
    const sessions = sessionsData ?? [];

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
                showToast("User o'chirildi");
                refetch();
            },
            onError: (e: unknown) => showToast((e as any)?.response?.data?.message ?? 'Xato', 'error'),
        });
    };
    const handleRestore = () => {
        restore(undefined as any, {
            onSuccess: () => {
                setDialog(null);
                showToast('User tiklandi');
            },
            onError: (e: unknown) => showToast((e as any)?.response?.data?.message ?? 'Xato', 'error'),
        });
    };
    const handleHardDelete = () => {
        hardDelete(undefined as any, {
            onSuccess: () => {
                showToast("Doimiy o'chirildi");
                setTimeout(() => router.push('/admin/users'), 1000);
            },
            onError: (e: unknown) => showToast((e as any)?.response?.data?.message ?? 'Xato', 'error'),
        });
    };

    const copyId = () => {
        if (!user) return;
        navigator.clipboard.writeText(user._id);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 1500);
    };

    if (isLoading)
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Yuklanmoqda...</p>
                </div>
            </div>
        );

    if (!user)
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 mb-3">Foydalanuvchi topilmadi</p>
                    <button onClick={() => router.back()} className="text-sm text-indigo-600 hover:underline">
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
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-3">
                        <span className="cursor-pointer hover:text-gray-600" onClick={() => router.push('/admin')}>
                            Admin
                        </span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="cursor-pointer hover:text-gray-600" onClick={() => router.push('/admin/users')}>
                            Foydalanuvchilar
                        </span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-gray-700 dark:text-gray-300 font-mono">{user._id.slice(-8).toUpperCase()}</span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <button onClick={() => router.back()} className="mt-1 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <UserAvatar firstName={user.firstName} lastName={user.lastName} avatarUrl={user.avatarUrl} size="lg" />
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                                {user.firstName} {user.lastName}
                                            </h1>
                                            <StatusBadge status={user.status} />
                                            <VerifiedBadge verified={user.isEmailVerified} />
                                            {user.blockInfo?.isBlocked && <BlockedBadge />}
                                            {user.isDeleted && <DeletedBadge />}
                                        </div>
                                        <button onClick={copyId} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 font-mono mt-1 transition">
                                            <span>
                                                @{user.username} · {user._id}
                                            </span>
                                            {copiedId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                        <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                            <button onClick={() => refetch()} disabled={isRefetching} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50">
                                <RotateCcw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
                            </button>
                            {!user.isDeleted && (
                                <>
                                    <button onClick={() => router.push(`/admin/users/${id}/edit`)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl hover:bg-indigo-200 transition">
                                        <Edit3 className="w-3.5 h-3.5" /> Tahrirlash
                                    </button>
                                    <button onClick={() => setDialog('delete')} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-xl hover:bg-red-200 transition">
                                        <Trash2 className="w-3.5 h-3.5" /> O'chirish
                                    </button>
                                </>
                            )}
                            {user.isDeleted && (
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
                        <SectionCard title="Asosiy ma'lumotlar">
                            <div className="grid grid-cols-2 gap-x-8">
                                <div>
                                    <Field label="Username" value={<span className="font-mono">@{user.username}</span>} />
                                    <Field label="Email" value={user.email} />
                                    <Field label="Telefon" value={user.phone ?? '—'} />
                                    <Field label="Bio" value={user.bio ?? '—'} />
                                </div>
                                <div>
                                    <Field label="Status" value={<StatusBadge status={user.status} />} />
                                    <Field label="Email tasdiqlangan" value={<VerifiedBadge verified={user.isEmailVerified} />} />
                                    <Field label="Bloklangan" value={user.blockInfo?.isBlocked ? <BlockedBadge /> : "Yo'q"} />
                                    <Field label="O'chirilgan" value={user.isDeleted ? '🗑 Ha' : "Yo'q"} />
                                    {user.scheduledDeletionAt && <Field label="O'chirish sanasi" value={fmtDateShort(user.scheduledDeletionAt)} />}
                                </div>
                            </div>
                            {user.blockInfo?.isBlocked && (
                                <div className="mt-4 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl space-y-1">
                                    <p className="text-xs font-semibold text-red-700 dark:text-red-300">Block ma'lumotlari</p>
                                    {user.blockInfo.blockReason && <p className="text-xs text-red-600 dark:text-red-400">Sabab: {user.blockInfo.blockReason}</p>}
                                    {user.blockInfo.blockedUntil && <p className="text-xs text-red-600 dark:text-red-400">Muddat: {fmtDate(user.blockInfo.blockedUntil)}</p>}
                                    {user.blockInfo.blockedBy && <p className="text-xs text-red-600 dark:text-red-400">Bloklagan: {user.blockInfo.blockedBy.username}</p>}
                                </div>
                            )}
                        </SectionCard>

                        {/* Roles */}
                        <Collapsible title="Biriktirilgan rollar" icon={<Shield className="w-4 h-4" />} count={Array.isArray(user.roles) ? user.roles.length : 0}>
                            {!Array.isArray(user.roles) || user.roles.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">Rol biriktirilmagan</p>
                            ) : (
                                <div className="space-y-2">
                                    {(user.roles as any[]).map((role: any, i: number) => (
                                        <div key={i} className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                            <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                                                <Shield className="w-3 h-3 text-indigo-600" />
                                            </div>
                                            <span className="text-xs font-semibold text-gray-900 dark:text-white">{typeof role === 'string' ? role : role.name}</span>
                                            {typeof role === 'object' && role.type && <span className="text-[10px] text-gray-400 capitalize ml-1">{role.type}</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Collapsible>

                        {/* Active Sessions */}
                        <Collapsible title="Faol sessiyalar" icon={<Monitor className="w-4 h-4" />} count={sessions.filter((s: any) => s.isActive).length} defaultOpen>
                            <ActiveSessionsList sessions={sessions} onRevoke={(sid) => revokeSession(sid, { onSuccess: () => showToast('Sessiya tugatildi'), onError: (e: unknown) => showToast((e as any)?.response?.data?.message ?? 'Xato', 'error') })} onRevokeAll={() => revokeAllSessions(undefined as any, { onSuccess: () => showToast('Barcha sessiyalar tugatildi'), onError: (e: unknown) => showToast((e as any)?.response?.data?.message ?? 'Xato', 'error') })} isRevoking={isRevokingSession || isRevokingAll} />
                        </Collapsible>

                        <Collapsible title="Login tarixi" icon={<Activity className="w-4 h-4" />} count={loginHistory.length}>
                            <LoginHistoryList history={loginHistory} />
                        </Collapsible>

                        <Collapsible title="Audit logi" icon={<Activity className="w-4 h-4" />} count={user.auditLog?.length ?? 0}>
                            <UserAuditLog entries={user.auditLog ?? []} />
                        </Collapsible>

                        <Collapsible title="O'zgarishlar tarixi" icon={<History className="w-4 h-4" />} count={user.updateHistory?.length ?? 0}>
                            <UserUpdateHistory history={user.updateHistory ?? []} />
                        </Collapsible>

                        <Collapsible title="Status tarixi" icon={<Clock className="w-4 h-4" />} count={user.statusHistory?.length ?? 0}>
                            <UserStatusHistory history={user.statusHistory ?? []} />
                        </Collapsible>

                        {/* Scheduled statuses */}
                        {user.statusSchedules && user.statusSchedules.length > 0 && (
                            <Collapsible title="Rejalashtirilgan statuslar" icon={<Clock className="w-4 h-4" />} count={user.statusSchedules.length}>
                                <div className="space-y-2">
                                    {user.statusSchedules.map((s, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-xs">
                                            <StatusBadge status={s.scheduledStatus} />
                                            <span className="text-gray-400">→</span>
                                            <span className="text-gray-600 dark:text-gray-400">{new Date(s.scheduledAt).toLocaleString('uz-UZ')}</span>
                                            {s.reason && <span className="text-gray-400 italic">"{s.reason}"</span>}
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
                            <Field label="ID" value={user._id} mono />
                            <Field label="Yaratilgan" value={fmtDate(user.createdAt)} />
                            <Field label="Yangilangan" value={fmtDate(user.updatedAt)} />
                            <Field label="Oxirgi kirish" value={fmtRelative(user.lastLoginAt)} />
                            <Field label="Birinchi kirish" value={fmtDate(user.firstLoginAt)} />
                            {user.emailVerifiedAt && <Field label="Email tasdiqlandi" value={fmtDate(user.emailVerifiedAt)} />}
                            {user.inactivatedAt && <Field label="Nofaollantirilgan" value={fmtDate(user.inactivatedAt)} />}
                            {user.inactiveReason && user.inactiveReason !== 'No' && <Field label="Nofaol sababi" value={user.inactiveReason} />}
                            {user.activatedAt && <Field label="Faollashtirilgan" value={fmtDate(user.activatedAt)} />}
                            {user.restoredAt && <Field label="Tiklangan" value={fmtDate(user.restoredAt)} />}
                            {user.deletedAt && <Field label="O'chirilgan" value={fmtDate(user.deletedAt)} />}
                        </SectionCard>

                        {/* Last login info */}
                        {user.lastLoginInfo && (
                            <SectionCard title="Oxirgi kirish ma'lumotlari">
                                <Field label="IP" value={user.lastLoginInfo.ipAddress ?? '—'} mono />
                                <Field label="Qurilma" value={user.lastLoginInfo.device ?? '—'} />
                                <Field label="Brauzer" value={user.lastLoginInfo.browser ?? '—'} />
                                <Field label="OS" value={user.lastLoginInfo.os ?? '—'} />
                                {(user.lastLoginInfo as any).location && <Field label="Joylashuv" value={(user.lastLoginInfo as any).location} />}
                                <Field label="Vaqt" value={fmtDate(user.lastLoginInfo.timestamp)} />
                            </SectionCard>
                        )}

                        {user.createdBy && (
                            <SectionCard title="Yaratuvchi">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{user.createdBy.username.slice(0, 2).toUpperCase()}</div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.createdBy.username}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.createdBy.email}</p>
                                    </div>
                                </div>
                                <Field label="User ID" value={user.createdBy.userId} mono />
                                <Field label="IP" value={user.createdBy.ipAddress ?? '—'} mono />
                                <Field label="Qurilma" value={user.createdBy.device ?? '—'} />
                                <Field label="Vaqt" value={fmtDate(user.createdBy.timestamp)} />
                            </SectionCard>
                        )}

                        {user.isDeleted && user.deletedBy?.length ? (
                            <SectionCard title="O'chiruvchi">
                                {user.deletedBy.map((d, i) => (
                                    <div key={i} className="mb-4 last:mb-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{d.username.slice(0, 2).toUpperCase()}</div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{d.username}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{fmtDate(d.timestamp)}</p>
                                            </div>
                                        </div>
                                        <Field label="IP" value={d.ipAddress ?? '—'} mono />
                                    </div>
                                ))}
                                {user.scheduledDeletionAt && (
                                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                        <p className="text-xs text-red-700 dark:text-red-300 font-medium">Doimiy o'chirish: {fmtDateShort(user.scheduledDeletionAt)}</p>
                                    </div>
                                )}
                            </SectionCard>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <ConfirmModal open={dialog === 'delete'} title="Userni o'chirish" message={`"${user.username}" userini o'chirmoqchimisiz? 30 kun ichida tiklash mumkin.`} confirmLabel="O'chirish" withReason icon={<Trash2 className="w-4 h-4" />} onConfirm={handleDelete} onClose={() => setDialog(null)} isLoading={isDeleting} />
            <ConfirmModal open={dialog === 'restore'} title="Userni tiklash" message={`"${user.username}" userini tiklaysizmi?`} confirmLabel="Tiklash" confirmClass="bg-emerald-500 hover:bg-emerald-600" icon={<RotateCcw className="w-4 h-4" />} onConfirm={handleRestore} onClose={() => setDialog(null)} isLoading={isRestoring} />
            <ConfirmModal open={dialog === 'hardDelete'} title="Doimiy o'chirish" message={`⚠️ "${user.username}" butunlay o'chiriladi. Bu amal qaytarib bo'lmaydi!`} confirmLabel="Doimiy o'chirish" confirmClass="bg-red-700 hover:bg-red-800" icon={<AlertTriangle className="w-4 h-4" />} onConfirm={handleHardDelete} onClose={() => setDialog(null)} isLoading={isHardDeleting} />
        </div>
    );
}

'use client';
import { motion } from 'framer-motion';
import { Globe, Monitor, Smartphone } from 'lucide-react';
import type { AuditEntry, FieldChange, LoginSession, MetadataInfo, StatusChange } from '@/types/user';
import { fmtDate, fmtRelative, StatusBadge } from './UserShared';

// ─── Audit badge ──────────────────────────────────────────────

const AUDIT_COLORS: Record<string, { bg: string; text: string }> = {
    create: { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300' },
    update: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300' },
    soft_delete: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300' },
    soft_delete_bulk: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300' },
    restore: { bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-700 dark:text-cyan-300' },
    status_change: { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300' },
    block: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300' },
    unblock: { bg: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-700 dark:text-teal-300' },
    change_username: { bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-700 dark:text-violet-300' },
    change_email: { bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-700 dark:text-violet-300' },
    change_phone: { bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-700 dark:text-violet-300' },
    change_password: { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300' },
    admin_reset_password: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300' },
    revoke_session: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' },
    revoke_all_sessions: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' },
};

const AuditBadge = ({ action }: { action: string }) => {
    const c = AUDIT_COLORS[action] ?? { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' };
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${c.bg} ${c.text}`}>{action}</span>;
};

const ChangeDiff = ({ changes }: { changes: FieldChange[] }) => (
    <div className="mt-2 space-y-1">
        {changes.map((ch, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] flex-wrap">
                <span className="font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{ch.field}</span>
                <span className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded max-w-[120px] truncate">{JSON.stringify(ch.oldValue)}</span>
                <span className="text-gray-400">→</span>
                <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded max-w-[120px] truncate">{JSON.stringify(ch.newValue)}</span>
            </div>
        ))}
    </div>
);

export const UserAuditLog = ({ entries }: { entries: AuditEntry[] }) => {
    if (!entries?.length) return <p className="text-sm text-gray-400 text-center py-6">Audit yozuvlari yo'q</p>;
    return (
        <div className="relative pl-5">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
            {[...entries].reverse().map((entry, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="relative mb-3 last:mb-0">
                    <div className="absolute -left-[17px] top-2.5 w-2.5 h-2.5 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600" />
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3.5 shadow-sm">
                        <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                            <AuditBadge action={entry.action} />
                            <span className="text-[10px] text-gray-400">{fmtDate(entry.timestamp)}</span>
                        </div>
                        {entry.performedBy && (
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                                    {entry.performedBy.username} · {entry.performedBy.ipAddress}
                                </span>
                            </div>
                        )}
                        {entry.changes && entry.changes.length > 0 && <ChangeDiff changes={entry.changes} />}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export const UserUpdateHistory = ({ history }: { history: FieldChange[] }) => {
    if (!history?.length) return <p className="text-sm text-gray-400 text-center py-6">Maydon o'zgarishlari yo'q</p>;
    return (
        <div className="space-y-2.5">
            {[...history].reverse().map((entry, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-lg text-gray-800 dark:text-gray-200">{entry.field}</span>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{fmtDate(entry.changedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-2 py-1 rounded-lg border border-red-200 dark:border-red-800 max-w-[150px] truncate">{JSON.stringify(entry.oldValue) ?? '—'}</span>
                        <span className="text-gray-400 text-sm">→</span>
                        <span className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 max-w-[150px] truncate">{JSON.stringify(entry.newValue) ?? '—'}</span>
                    </div>
                    {entry.changedBy && <p className="text-[10px] text-gray-400 mt-1.5 font-mono">by {entry.changedBy.username}</p>}
                </div>
            ))}
        </div>
    );
};

export const UserStatusHistory = ({ history }: { history: StatusChange[] }) => {
    if (!history?.length) return <p className="text-sm text-gray-400 text-center py-6">Status o'zgarishlari yo'q</p>;
    return (
        <div className="space-y-2">
            {[...history].reverse().map((entry, i) => (
                <div key={i} className="flex items-start gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3.5 shadow-sm">
                    <div className="flex items-center gap-2 flex-1 flex-wrap">
                        <StatusBadge status={entry.fromStatus} />
                        <span className="text-gray-400 text-sm">→</span>
                        <StatusBadge status={entry.toStatus} />
                        {entry.reason && <span className="text-xs text-gray-500 italic">"{entry.reason}"</span>}
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="text-[10px] text-gray-400">{fmtDate(entry.changedAt)}</p>
                        {entry.changedBy && <p className="text-[10px] text-gray-400 font-mono mt-0.5">{entry.changedBy.username}</p>}
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── Login History ────────────────────────────────────────────

export const LoginHistoryList = ({ history }: { history: MetadataInfo[] }) => {
    if (!history?.length) return <p className="text-sm text-gray-400 text-center py-6">Login tarixi yo'q</p>;
    return (
        <div className="space-y-2">
            {history.slice(0, 20).map((entry, i) => (
                <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">{entry.device?.toLowerCase().includes('mobile') ? <Smartphone className="w-3.5 h-3.5 text-indigo-600" /> : <Monitor className="w-3.5 h-3.5 text-indigo-600" />}</div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-gray-700 dark:text-gray-300">{entry.ipAddress ?? '—'}</span>
                            {entry.device && entry.device !== 'unknown' && <span className="text-gray-400">{entry.device}</span>}
                            {entry.browser && entry.browser !== 'unknown' && <span className="text-gray-400">· {entry.browser}</span>}
                            {entry.os && entry.os !== 'unknown' && <span className="text-gray-400">· {entry.os}</span>}
                        </div>
                        {(entry as any).location && (
                            <div className="flex items-center gap-1 mt-0.5 text-gray-400">
                                <Globe className="w-3 h-3" /> {(entry as any).location}
                            </div>
                        )}
                    </div>
                    <span className="text-gray-400 flex-shrink-0 text-[10px]">{fmtRelative(entry.timestamp)}</span>
                </div>
            ))}
        </div>
    );
};

// ─── Active sessions ──────────────────────────────────────────

export const ActiveSessionsList = ({ sessions, onRevoke, onRevokeAll, isRevoking }: { sessions: LoginSession[]; onRevoke: (sessionId: string) => void; onRevokeAll: () => void; isRevoking: boolean }) => {
    const active = sessions.filter((s) => s.isActive);
    if (!active.length) return <p className="text-sm text-gray-400 text-center py-6">Faol sessiyalar yo'q</p>;
    return (
        <div className="space-y-2">
            <div className="flex justify-end mb-3">
                <button onClick={onRevokeAll} disabled={isRevoking} className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline disabled:opacity-50">
                    Barcha sessiyalarni tugatish
                </button>
            </div>
            {active.map((session) => (
                <div key={session.sessionId} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">{session.device?.toLowerCase().includes('mobile') ? <Smartphone className="w-3.5 h-3.5 text-emerald-600" /> : <Monitor className="w-3.5 h-3.5 text-emerald-600" />}</div>
                    <div className="flex-1 min-w-0 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-gray-700 dark:text-gray-300">{session.ipAddress}</span>
                            {session.device !== 'unknown' && <span className="text-gray-400">{session.device}</span>}
                            {session.browser !== 'unknown' && <span className="text-gray-400">· {session.browser}</span>}
                        </div>
                        <p className="text-gray-400 mt-0.5 text-[10px]">Kirgan: {fmtDate(session.loginAt)}</p>
                    </div>
                    <button onClick={() => onRevoke(session.sessionId)} disabled={isRevoking} className="text-[10px] font-semibold text-red-500 hover:text-red-700 border border-red-200 dark:border-red-800 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50 flex-shrink-0">
                        Tugatish
                    </button>
                </div>
            ))}
        </div>
    );
};

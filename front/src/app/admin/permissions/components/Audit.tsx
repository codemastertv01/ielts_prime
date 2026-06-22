'use client';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import type { AuditEntry, FieldChange, StatusChange } from '@/types/permission';
import { fmtDate, StatusBadge } from './PermissionShared';

// ─── Audit badge ──────────────────────────────────────────────

const AUDIT_COLORS: Record<string, { bg: string; text: string }> = {
    create: { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300' },
    update: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300' },
    delete: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300' },
    restore: { bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-700 dark:text-cyan-300' },
    status_change: { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300' },
};

const AuditBadge = ({ action }: { action: string }) => {
    const c = AUDIT_COLORS[action] ?? { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' };
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${c.bg} ${c.text}`}>{action}</span>;
};

// ─── Change diff row ──────────────────────────────────────────

const ChangeDiff = ({ changes }: { changes: FieldChange[] }) => (
    <div className="mt-2 space-y-1">
        {changes.map((ch, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] flex-wrap">
                <span className="font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{ch.field}</span>
                <span className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded">{JSON.stringify(ch.oldValue)}</span>
                <span className="text-gray-400">→</span>
                <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded">{JSON.stringify(ch.newValue)}</span>
            </div>
        ))}
    </div>
);

// ─── Audit log ────────────────────────────────────────────────

export const AuditLog = ({ entries }: { entries: AuditEntry[] }) => {
    if (!entries?.length) {
        return <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Audit yozuvlari yo'q</p>;
    }

    return (
        <div className="relative pl-5">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
            {[...entries].reverse().map((entry, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="relative mb-3 last:mb-0">
                    <div className="absolute -left-[17px] top-2.5 w-2.5 h-2.5 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600" />
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3.5 shadow-sm">
                        <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                            <AuditBadge action={entry.action} />
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">{fmtDate(entry.timestamp)}</span>
                        </div>
                        {entry.performedBy && (
                            <div className="flex items-center gap-2 mt-1.5">
                                <User className="w-3 h-3 text-gray-400" />
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                                    {entry.performedBy.username} ({entry.performedBy.userId})
                                </span>
                                {entry.performedBy.ipAddress && <span className="text-[10px] text-gray-400 ml-1">· {entry.performedBy.ipAddress}</span>}
                            </div>
                        )}
                        {entry.changes && entry.changes.length > 0 && <ChangeDiff changes={entry.changes} />}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

// ─── Update history ───────────────────────────────────────────

export const UpdateHistory = ({ history }: { history: FieldChange[] }) => {
    if (!history?.length) {
        return <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Maydon o'zgarishlari yo'q</p>;
    }

    return (
        <div className="space-y-2.5">
            {[...history].reverse().map((entry, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-lg">{entry.field}</span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">{fmtDate(entry.changedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-2 py-1 rounded-lg border border-red-200 dark:border-red-800">{JSON.stringify(entry.oldValue) ?? '—'}</span>
                        <span className="text-gray-400 text-sm">→</span>
                        <span className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">{JSON.stringify(entry.newValue) ?? '—'}</span>
                    </div>
                    {entry.changedBy && <p className="text-[10px] text-gray-400 mt-1.5 font-mono">by {entry.changedBy.username}</p>}
                </div>
            ))}
        </div>
    );
};

// ─── Status history ───────────────────────────────────────────

export const StatusHistory = ({ history }: { history: StatusChange[] }) => {
    if (!history?.length) {
        return <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Status o'zgarishlari yo'q</p>;
    }

    return (
        <div className="space-y-2">
            {[...history].reverse().map((entry, i) => (
                <div key={i} className="flex items-start gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3.5 shadow-sm">
                    <div className="flex items-center gap-2 flex-1 flex-wrap">
                        <StatusBadge status={entry.fromStatus} />
                        <span className="text-gray-400 text-sm">→</span>
                        <StatusBadge status={entry.toStatus} />
                        {entry.reason && <span className="text-xs text-gray-500 dark:text-gray-400 italic">"{entry.reason}"</span>}
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

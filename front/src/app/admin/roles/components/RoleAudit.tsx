'use client';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import type { AuditEntry, FieldChange, StatusChange } from '@/types/role';
import { fmtDate, StatusBadge } from './RoleShared';

const AUDIT_COLORS: Record<string, { bg: string; text: string }> = {
    create: { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300' },
    update: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300' },
    soft_delete: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300' },
    soft_delete_bulk: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300' },
    restore: { bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-700 dark:text-cyan-300' },
    status_change: { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300' },
    assign_permissions: { bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-700 dark:text-violet-300' },
    remove_permissions: { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300' },
    schedule_status_active: { bg: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-700 dark:text-teal-300' },
    schedule_status_archive: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' },
    schedule_status_deleted: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' },
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

export const RoleAuditLog = ({ entries }: { entries: AuditEntry[] }) => {
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
                            <span className="text-[10px] text-gray-400">{fmtDate(entry.timestamp)}</span>
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

export const RoleUpdateHistory = ({ history }: { history: FieldChange[] }) => {
    if (!history?.length) {
        return <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Maydon o'zgarishlari yo'q</p>;
    }
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

export const RoleStatusHistory = ({ history }: { history: StatusChange[] }) => {
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

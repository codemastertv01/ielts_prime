'use client';
import { Lock } from 'lucide-react';
import { RoleType } from '@/types/role';
import { EntityStatusEnum } from '@/types/entity.status';

// ─── Constants ────────────────────────────────────────────────

export const STATUS_CFG: Record<string, { label: string; color: string; dot: string; bg: string }> = {
    ACTIVE: {
        label: 'Active',
        color: 'text-emerald-700 dark:text-emerald-300',
        dot: 'bg-emerald-500',
        bg: 'bg-emerald-50 dark:bg-emerald-900/30 ring-1 ring-emerald-200 dark:ring-emerald-800',
    },
    INACTIVE: {
        label: 'Inactive',
        color: 'text-red-700 dark:text-red-300',
        dot: 'bg-red-500',
        bg: 'bg-red-50 dark:bg-red-900/30 ring-1 ring-red-200 dark:ring-red-800',
    },
    PENDING: {
        label: 'Pending',
        color: 'text-amber-700 dark:text-amber-300',
        dot: 'bg-amber-500',
        bg: 'bg-amber-50 dark:bg-amber-900/30 ring-1 ring-amber-200 dark:ring-amber-800',
    },
    ARCHIVED: {
        label: 'Archived',
        color: 'text-gray-700 dark:text-gray-300',
        dot: 'bg-gray-400',
        bg: 'bg-gray-50 dark:bg-gray-900/30 ring-1 ring-gray-200 dark:ring-gray-700',
    },
    DELETED: {
        label: 'Deleted',
        color: 'text-red-800 dark:text-red-200',
        dot: 'bg-red-700',
        bg: 'bg-red-100 dark:bg-red-900/50 ring-1 ring-red-300 dark:ring-red-700',
    },
};

export const TYPE_CFG: Record<string, { color: string; bg: string; icon?: string }> = {
    admin: { color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-100 dark:bg-violet-900/30' },
    user: { color: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-100 dark:bg-sky-900/30' },
    moderator: { color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    guest: { color: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-100 dark:bg-gray-800' },
    custom: { color: 'text-teal-700 dark:text-teal-300', bg: 'bg-teal-100 dark:bg-teal-900/30' },
};

export const ALL_ROLE_TYPES = Object.values(RoleType);
export const ALL_STATUSES = Object.values(EntityStatusEnum);

// ─── Utilities ────────────────────────────────────────────────

export function fmtDate(d?: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function fmtDateShort(d?: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit',
    });
}

// ─── Badge components ─────────────────────────────────────────

export const StatusBadge = ({ status }: { status: string }) => {
    const c = STATUS_CFG[status] ?? STATUS_CFG['PENDING'];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.color} ${c.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {c.label}
        </span>
    );
};

export const TypeBadge = ({ type }: { type: string }) => {
    const c = TYPE_CFG[type] ?? TYPE_CFG['custom'];
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold capitalize ${c.color} ${c.bg}`}>{type}</span>;
};

export const SystemBadge = () => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
        <Lock className="w-2.5 h-2.5" /> System
    </span>
);

export const DeletedBadge = () => <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-1 ring-red-300 dark:ring-red-700">🗑 O'chirilgan</span>;

export const PriorityBadge = ({ priority }: { priority: number }) => {
    const color = priority >= 70 ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : priority >= 40 ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' : 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold font-mono ${color}`}>P{priority}</span>;
};

// ─── Layout components ────────────────────────────────────────

export const Field = ({ label, value, mono = false, className = '' }: { label: string; value: React.ReactNode; mono?: boolean; className?: string }) => (
    <div className={`flex items-start justify-between gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0 ${className}`}>
        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 w-36">{label}</span>
        <span className={`text-xs font-medium text-gray-900 dark:text-white text-right break-all leading-relaxed ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</span>
    </div>
);

export const SectionCard = ({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) => (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm ${className}`}>
        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{title}</h3>
        </div>
        <div className="p-5">{children}</div>
    </div>
);

// ─── Form helpers ─────────────────────────────────────────────

export const inputCls = (err?: string) => `w-full px-3.5 py-2.5 text-sm border rounded-xl bg-gray-50 dark:bg-gray-800/80 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition ${err ? 'border-red-400 dark:border-red-500 focus:ring-red-400/30' : 'border-gray-200 dark:border-gray-700 focus:ring-violet-500/40 focus:border-violet-400 dark:focus:border-violet-500'}`;

export const labelCls = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5';

export const UserAvatar = ({ username, size = 'sm' }: { username: string; size?: 'sm' | 'md' }) => {
    const sizes = { sm: 'w-7 h-7 text-[10px]', md: 'w-9 h-9 text-xs' };
    return <div className={`${sizes[size]} rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0`}>{username.slice(0, 2).toUpperCase()}</div>;
};

export type ToastState = { msg: string; type: 'success' | 'error' } | null;

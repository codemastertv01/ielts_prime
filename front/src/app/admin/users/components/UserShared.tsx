'use client';

import { EntityStatusEnum } from "@/types/entity.status";

export const STATUS_CFG: Record<string, { label: string; color: string; dot: string; bg: string }> = {
    ACTIVE: { label: 'Active', color: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30 ring-1 ring-emerald-200 dark:ring-emerald-800' },
    INACTIVE: { label: 'Inactive', color: 'text-red-700 dark:text-red-300', dot: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-900/30 ring-1 ring-red-200 dark:ring-red-800' },
    PENDING: { label: 'Pending', color: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/30 ring-1 ring-amber-200 dark:ring-amber-800' },
    ARCHIVED: { label: 'Archived', color: 'text-gray-700 dark:text-gray-300', dot: 'bg-gray-400', bg: 'bg-gray-50 dark:bg-gray-900/30 ring-1 ring-gray-200 dark:ring-gray-700' },
    DELETED: { label: 'Deleted', color: 'text-red-800 dark:text-red-200', dot: 'bg-red-700', bg: 'bg-red-100 dark:bg-red-900/50 ring-1 ring-red-300 dark:ring-red-700' },
};


export const ALL_STATUSES = Object.values(EntityStatusEnum);

// ─── Helpers ──────────────────────────────────────────────────

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
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
}

export function fmtRelative(d?: string | null): string {
    if (!d) return '—';
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'hozirgina';
    if (m < 60) return `${m} daqiqa oldin`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} soat oldin`;
    const day = Math.floor(h / 24);
    if (day < 30) return `${day} kun oldin`;
    return fmtDateShort(d);
}

export function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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

export const BlockedBadge = () => <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-1 ring-red-300 dark:ring-red-700">🚫 Blocked</span>;

export const VerifiedBadge = ({ verified }: { verified: boolean }) => (verified ? <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">✓ Verified</span> : <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">⚠ Unverified</span>);

export const DeletedBadge = () => <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-1 ring-red-300 dark:ring-red-700">🗑 O'chirilgan</span>;

// ─── Avatar ───────────────────────────────────────────────────

export const UserAvatar = ({ firstName, lastName, avatarUrl, size = 'md' }: { firstName: string; lastName: string; avatarUrl?: string; size?: 'sm' | 'md' | 'lg' }) => {
    const sizes = { sm: 'w-8 h-8 text-[10px]', md: 'w-10 h-10 text-xs', lg: 'w-14 h-14 text-base' };
    if (avatarUrl && !avatarUrl.includes('ui-avatars.com')) {
        return <img src={avatarUrl} alt={`${firstName} ${lastName}`} className={`${sizes[size]} rounded-full object-cover flex-shrink-0`} />;
    }
    return <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0`}>{getInitials(firstName, lastName)}</div>;
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

export const inputCls = (err?: string) => `w-full px-3.5 py-2.5 text-sm border rounded-xl bg-gray-50 dark:bg-gray-800/80 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition ${err ? 'border-red-400 dark:border-red-500 focus:ring-red-400/30' : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500/40 focus:border-indigo-400 dark:focus:border-indigo-500'}`;

export const labelCls = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5';

export type ToastState = { msg: string; type: 'success' | 'error' } | null;

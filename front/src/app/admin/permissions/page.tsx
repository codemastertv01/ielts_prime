'use client';
/* eslint-disable @typescript-eslint/no-explicit-any, react/no-unescaped-entities */
import { usePermissions, usePermissionStats } from '@/hooks/useAdminPermissions';
import type { BulkDeleteDto, BulkUpdateItem, CreatePermissionDto, GetPermissionsQuery, Permission } from '@/types/permission';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit3, Eye, Filter, Layers, Loader2, Plus, RefreshCw, RotateCcw, Search, Shield, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../../components/Layout/AdminLayout';
import { BulkCreateModal } from './components/BulkCreateModal';
import { BulkUpdateModal } from './components/BulkUpdateModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ActionBadge, fmtDateShort, StatusBadge, SystemBadge } from './components/PermissionShared';
import { StatsRow } from './components/StatsRow';
import { ToastContainer } from './components/Toast';

// ─── Types ────────────────────────────────────────────────────

type ModalState = { type: 'delete'; permission: Permission } | { type: 'bulkDelete' } | { type: 'bulkCreate' } | { type: 'bulkUpdate' } | null;

type ToastState = { msg: string; type: 'success' | 'error' } | null;

// ═══════════════════════════════════════════════════════════════
export default function AdminPermissionsPage() {
    const router = useRouter();

    const [query, setQuery] = useState<GetPermissionsQuery>({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [modal, setModal] = useState<ModalState>(null);
    const [toast, setToast] = useState<ToastState>(null);

    const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    // Debounced search
    useEffect(() => {
        const t = setTimeout(() => setQuery((p) => ({ ...p, search: search || undefined, page: 1 })), 350);
        return () => clearTimeout(t);
    }, [search]);

    const { permissions, total, totalPages, isLoading, isFetching, refetch, createMany, isCreatingMany, bulkUpdate, isBulkUpdating, softDelete, isDeleting, bulkDelete, isBulkDeleting, restore, isRestoring } = usePermissions(query);

    const { data: stats } = usePermissionStats();

    // ─── Handlers ─────────────────────────────────────────────

    const handleDelete = () => {
        if (modal?.type !== 'delete') return;
        if (modal.permission.isSystemPermission) {
            showToast("System permission o'chirib bo'lmaydi", 'error');
            return;
        }
        softDelete(modal.permission._id, {
            onSuccess: () => {
                showToast("Permission o'chirildi");
                setModal(null);
            },
            onError: (e: unknown) => showToast((e as any)?.response?.data?.message ?? "O'chirish xatosi", 'error'),
        });
    };

    const handleBulkDelete = (reason?: string) => {
        const dto: BulkDeleteDto = { ids: Array.from(selected), reason };
        bulkDelete(dto, {
            onSuccess: (res: any) => {
                const r = res;
                showToast(`${r.deletedCount} o'chirildi` + (r.systemPermissionIds.length ? `, ${r.systemPermissionIds.length} system o'tkazib yuborildi` : ''));
                setSelected(new Set());
                setModal(null);
            },
            onError: (e: unknown) => showToast((e as any)?.response?.data?.message ?? 'Xato', 'error'),
        });
    };

    const handleBulkCreate = (dtos: CreatePermissionDto[]) => {
        createMany(dtos, {
            onSuccess: (res: any) => {
                showToast(`${res.createdCount} yaratildi` + (res.errors.length ? `, ${res.errors.length} muvaffaqiyatsiz` : ''));
                setModal(null);
            },
            onError: (e: unknown) => showToast((e as any)?.response?.data?.message ?? 'Xato', 'error'),
        });
    };

    const handleBulkUpdate = (items: BulkUpdateItem[]) => {
        bulkUpdate(items, {
            onSuccess: () => {
                showToast('Yangilandi');
                setModal(null);
            },
            onError: (e: unknown) => showToast((e as any)?.response?.data?.message ?? 'Xato', 'error'),
        });
    };

    const handleRestore = (id: string) => {
        restore(id, {
            onSuccess: () => showToast('Tiklandi'),
            onError: (e: unknown) => showToast((e as any)?.response?.data?.message ?? 'Xato', 'error'),
        });
    };

    const toggleSelect = (id: string) =>
        setSelected((prev) => {
            const n = new Set(prev);
            if (n.has(id)) n.delete(id);
            else n.add(id);
            return n;
        });

    const toggleAll = () => setSelected((prev) => (prev.size === permissions.length ? new Set() : new Set(permissions.map((p) => p._id))));

    const activeFilters = [!!query.status, !!query.category, !!query.scope, !!query.resource, !!query.action, !!query.method, typeof query.isSystemPermission !== 'undefined', !!query.apiPath, !!query.frontendPath, !!query.uiKey, !!query.createdFrom, !!query.createdTo, !!query.updatedFrom, !!query.updatedTo, !!query.includeDeleted].filter(Boolean).length;

    // ─── Render ────────────────────────────────────────────────

    return (
        <AdminLayout>
            <div className="space-y-5 min-h-screen bg-gray-50 dark:bg-gray-950">
                <ToastContainer toast={toast} />

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Shield className="w-6 h-6 text-violet-500" /> Permissions
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">API ruxsatlarini boshqarish</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => refetch()} disabled={isFetching} className="p-2.5 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50">
                            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => setShowFilters((v) => !v)} className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl border transition ${showFilters || activeFilters > 0 ? 'bg-violet-600 text-white border-violet-600' : 'text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}>
                            <Filter className="w-4 h-4" /> Filtrlar
                            {activeFilters > 0 && <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-xs font-bold">{activeFilters}</span>}
                        </button>
                        <button onClick={() => setModal({ type: 'bulkUpdate' })} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                            <Edit3 className="w-4 h-4" /> Bulk tahrirlash
                        </button>
                        <button onClick={() => setModal({ type: 'bulkCreate' })} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                            <Layers className="w-4 h-4" /> Bulk yaratish
                        </button>
                        <button onClick={() => router.push('/admin/permissions/create')} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition shadow-sm">
                            <Plus className="w-4 h-4" /> Yaratish
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <StatsRow stats={stats} />

                {/* Search + Filters */}
                <div className="space-y-3">
                    <div className="flex gap-3 flex-wrap">
                        <div className="flex-1 min-w-52 relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Nom, resource, action, api path, ui key..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 shadow-sm" />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {['', 'ACTIVE', 'INACTIVE', 'PENDING', 'ARCHIVE', 'DELETED'].map((s) => (
                                <button key={s} onClick={() => setQuery((p) => ({ ...p, status: (s || undefined) as any, page: 1 }))} className={`px-3 py-2 text-xs font-semibold rounded-xl border transition ${(query.status ?? '') === s ? 'bg-violet-600 text-white border-violet-600' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}>
                                    {s || 'Barchasi'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {[
                                        { key: 'category', label: 'Kategoriya', opts: ['', 'system', 'user', 'role', 'custom'] },
                                        { key: 'scope', label: 'Scope', opts: ['', 'api', 'frontend', 'both'] },
                                        { key: 'action', label: 'Amal', opts: ['', 'READ', 'CREATE', 'UPDATE', 'DELETE', 'MANAGE', 'APPROVE', 'EXPORT', 'IMPORT', 'PUBLISH', 'RESTORE', '*'] },
                                        { key: 'method', label: 'HTTP', opts: ['', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
                                        { key: 'sortBy', label: 'Saralash', opts: ['createdAt', 'updatedAt', 'name', 'resource', 'action', 'method', 'category', 'scope', 'status'] },
                                        { key: 'sortOrder', label: 'Tartib', opts: ['desc', 'asc'] },
                                    ].map(({ key, label, opts }) => (
                                        <div key={key}>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
                                            <select value={(query as any)[key] ?? ''} onChange={(e) => setQuery((p) => ({ ...p, [key]: e.target.value || undefined, page: 1 }))} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40">
                                                {opts.map((o) => (
                                                    <option key={o} value={o}>
                                                        {o || 'Barchasi'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                                    {[
                                        { key: 'resource', label: 'Resource', placeholder: 'users' },
                                        { key: 'apiPath', label: 'API path', placeholder: '/api/v1/users' },
                                        { key: 'frontendPath', label: 'Frontend path', placeholder: '/admin/users' },
                                        { key: 'uiKey', label: 'UI key', placeholder: 'users:create' },
                                        { key: 'createdFrom', label: 'Created from', type: 'date' },
                                        { key: 'createdTo', label: 'Created to', type: 'date' },
                                        { key: 'updatedFrom', label: 'Updated from', type: 'date' },
                                        { key: 'updatedTo', label: 'Updated to', type: 'date' },
                                    ].map((field) => (
                                        <div key={field.key}>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{field.label}</label>
                                            <input value={(query as any)[field.key] ?? ''} type={field.type ?? 'text'} onChange={(e) => setQuery((p) => ({ ...p, [field.key]: e.target.value || undefined, page: 1 }))} placeholder={field.placeholder} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Limit:</label>
                                        <select value={query.limit ?? 20} onChange={(e) => setQuery((p) => ({ ...p, limit: Number(e.target.value), page: 1 }))} className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none w-24">
                                            {[10, 20, 50, 100].map((n) => (
                                                <option key={n} value={n}>
                                                    {n}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                                        <input type="checkbox" checked={query.isSystemPermission === true} onChange={(e) => setQuery((p) => ({ ...p, isSystemPermission: e.target.checked ? true : undefined, page: 1 }))} className="rounded border-gray-300 text-violet-600 focus:ring-violet-500/30" />
                                        Faqat system permissionlar
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="incDeleted" checked={query.includeDeleted ?? false} onChange={(e) => setQuery((p) => ({ ...p, includeDeleted: e.target.checked, page: 1 }))} className="rounded border-gray-300 text-violet-600 focus:ring-violet-500/30" />
                                        <label htmlFor="incDeleted" className="text-xs text-gray-500 dark:text-gray-400">
                                            O'chirilganlarni ham ko'rsatish
                                        </label>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setQuery({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' });
                                            setSearch('');
                                        }}
                                        className="px-3 py-2 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition font-medium"
                                    >
                                        Tozalash
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bulk actions bar */}
                <AnimatePresence>
                    {selected.size > 0 && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-3 px-4 py-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl flex-wrap">
                            <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">{selected.size} tanlangan</span>
                            <div className="flex-1" />
                            <button onClick={() => setModal({ type: 'bulkDelete' })} disabled={isBulkDeleting} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition disabled:opacity-50">
                                <Trash2 className="w-3.5 h-3.5" /> O'chirish
                            </button>
                            <button onClick={() => setSelected(new Set())} className="p-1.5 text-violet-500 hover:text-violet-700 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-800/40 transition">
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Table */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Yuklanmoqda...</p>
                        </div>
                    ) : permissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <div className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-800">
                                <Shield className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="font-medium text-gray-700 dark:text-gray-300">Permission topilmadi</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Filtrlarni o'zgartiring</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                                        <th className="w-10 px-4 py-3">
                                            <input type="checkbox" checked={selected.size === permissions.length && permissions.length > 0} onChange={toggleAll} className="rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-violet-500/30 cursor-pointer" />
                                        </th>
                                        {['Nom', 'Resource', 'Amal', 'Kategoriya', 'Status', 'System', 'Yaratilgan', ''].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {permissions.map((p, idx) => (
                                        <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.01 }} className={`group hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors cursor-pointer ${selected.has(p._id) ? 'bg-violet-50/40 dark:bg-violet-900/10' : ''} ${p.isDeleted ? 'opacity-50' : ''}`} onClick={() => router.push(`/admin/permissions/${p._id}`)}>
                                            <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                                                <input type="checkbox" checked={selected.has(p._id)} onChange={() => toggleSelect(p._id)} className="rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-violet-500/30 cursor-pointer" />
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="font-mono text-xs text-gray-900 dark:text-white font-semibold">{p.name}</span>
                                                {p.description && <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[180px]">{p.description}</p>}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md font-mono">{p.resource}</span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <ActionBadge action={p.action} />
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{p.category ?? '—'}</span>
                                            </td>
                                            <td className="px-4 py-3.5">{p.isDeleted ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">🗑 O'chirilgan</span> : <StatusBadge status={p.status} />}</td>
                                            <td className="px-4 py-3.5">{p.isSystemPermission ? <SystemBadge /> : <span className="text-[10px] text-gray-400">Yo'q</span>}</td>
                                            <td className="px-4 py-3.5 text-xs text-gray-400">{fmtDateShort(p.createdAt)}</td>
                                            <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => router.push(`/admin/permissions/${p._id}`)} className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition" title="Ko'rish">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {!p.isDeleted && (
                                                        <button onClick={() => router.push(`/admin/permissions/${p._id}/edit`)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition" title="Tahrirlash">
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {!p.isDeleted && !p.isSystemPermission && (
                                                        <button onClick={() => setModal({ type: 'delete', permission: p })} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition" title="O'chirish">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {p.isDeleted && (
                                                        <button onClick={() => handleRestore(p._id)} disabled={isRestoring} className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition disabled:opacity-50" title="Tiklash">
                                                            <RotateCcw className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {total > 0 && (
                        <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Ko'rsatilmoqda{' '}
                                <strong className="text-gray-900 dark:text-white">
                                    {((query.page ?? 1) - 1) * (Number(query.limit) ?? 20) + 1}–{Math.min((query.page ?? 1) * (Number(query.limit) ?? 20), total)}
                                </strong>{' '}
                                / <strong className="text-gray-900 dark:text-white">{total}</strong>
                            </span>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setQuery((p) => ({ ...p, page: 1 }))} disabled={query.page === 1} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition">
                                    <ChevronsLeft className="w-4 h-4" />
                                </button>
                                <button onClick={() => setQuery((p) => ({ ...p, page: (p.page ?? 1) - 1 }))} disabled={query.page === 1} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pg = Math.max(1, Math.min(totalPages - 4, (query.page ?? 1) - 2)) + i;
                                    return (
                                        <button key={pg} onClick={() => setQuery((p) => ({ ...p, page: pg }))} className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition ${pg === (query.page ?? 1) ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                            {pg}
                                        </button>
                                    );
                                })}
                                <button onClick={() => setQuery((p) => ({ ...p, page: (p.page ?? 1) + 1 }))} disabled={query.page === totalPages} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button onClick={() => setQuery((p) => ({ ...p, page: totalPages }))} disabled={query.page === totalPages} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition">
                                    <ChevronsRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modals */}
                <BulkCreateModal open={modal?.type === 'bulkCreate'} onClose={() => setModal(null)} onSave={handleBulkCreate} isSaving={isCreatingMany} />
                <BulkUpdateModal open={modal?.type === 'bulkUpdate'} onClose={() => setModal(null)} onSave={handleBulkUpdate} isSaving={isBulkUpdating} />
                <ConfirmModal open={modal?.type === 'delete'} title="Permissionni o'chirish" message={modal?.type === 'delete' ? `"${modal.permission.name}" permissionini o'chirmoqchimisiz? 30 kun ichida tiklash mumkin.` : ''} confirmLabel="O'chirish" withReason icon={<Trash2 className="w-4 h-4" />} onConfirm={handleDelete} onClose={() => setModal(null)} isLoading={isDeleting} />
                <ConfirmModal open={modal?.type === 'bulkDelete'} title="Bulk o'chirish" message={`${selected.size} ta permission o'chiriladi. System permissionlar o'tkazib yuboriladi.`} confirmLabel={`${selected.size} tasini o'chirish`} withReason icon={<Trash2 className="w-4 h-4" />} onConfirm={handleBulkDelete} onClose={() => setModal(null)} isLoading={isBulkDeleting} />
            </div>
        </AdminLayout>
    );
}

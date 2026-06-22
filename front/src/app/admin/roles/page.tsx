'use client';
/* eslint-disable @typescript-eslint/no-explicit-any, react/no-unescaped-entities */
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit3, Eye, Filter, Layers, Loader2, Plus, RefreshCw, RotateCcw, Search, Shield, Trash2, Users, X } from 'lucide-react';

import { useRoles, useRoleStats } from '@/hooks/useAdminRoles';
import type { BulkDeleteDto, BulkUpdateItem, CreateRoleDto, GetRolesQuery, Role } from '@/types/role';
import AdminLayout from '@/components/Layout/AdminLayout';

import { RoleStatsRow } from './components/RoleStatsRow';
import { BulkCreateRoleModal } from './components/BulkCreateRoleModal';
import { BulkUpdateRoleModal } from './components/BulkUpdateRoleModal';
import { fmtDateShort, PriorityBadge, StatusBadge, SystemBadge, TypeBadge } from './components/RoleShared';

import { ToastContainer } from '../permissions/components/Toast';
import { ConfirmModal } from '../permissions/components/ConfirmModal';

type ModalState = { type: 'delete'; role: Role } | { type: 'bulkDelete' } | { type: 'bulkCreate' } | { type: 'bulkUpdate' } | null;

type ToastState = { msg: string; type: 'success' | 'error' } | null;

export default function AdminRolesPage() {
    const router = useRouter();

    const [query, setQuery] = useState<GetRolesQuery>({
        page: 1,
        limit: 20,
        sortBy: 'priority',
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

    useEffect(() => {
        const t = setTimeout(() => setQuery((p) => ({ ...p, search: search || undefined, page: 1 })), 350);
        return () => clearTimeout(t);
    }, [search]);

    const { roles, total, totalPages, isLoading, isFetching, refetch, createMany, isCreatingMany, bulkUpdate, isBulkUpdating, softDelete, isDeleting, bulkDelete, isBulkDeleting, restore, isRestoring } = useRoles(query);

    const { data: stats } = useRoleStats();

    const handleDelete = (reason?: string) => {
        if (modal?.type !== 'delete') return;
        if (modal.role.isSystemRole) {
            showToast("System role o'chirib bo'lmaydi", 'error');
            return;
        }
        if (modal.role.userCount > 0) {
            showToast(`${modal.role.userCount} ta foydalanuvchi bor`, 'error');
            return;
        }
        softDelete(
            { id: modal.role._id, reason },
            {
                onSuccess: () => {
                    showToast("Role o'chirildi");
                    setModal(null);
                },
                onError: (e: unknown) => showToast((e as any)?.response?.data?.message ?? 'Xato', 'error'),
            }
        );
    };

    const handleBulkDelete = (reason?: string) => {
        const dto: BulkDeleteDto = { ids: Array.from(selected), reason };
        bulkDelete(dto, {
            onSuccess: (res: any) => {
                const r = res;
                const parts = [`${r.deletedCount} o'chirildi`];
                if (r.systemRoleIds?.length) parts.push(`${r.systemRoleIds.length} system o'tkazib yuborildi`);
                if (r.rolesWithUsers?.length) parts.push(`${r.rolesWithUsers.length} foydalanuvchisi bor`);
                showToast(parts.join(' · '));
                setSelected(new Set());
                setModal(null);
            },
            onError: (e: unknown) => showToast((e as any)?.response?.data?.message ?? 'Xato', 'error'),
        });
    };

    const handleBulkCreate = (dtos: CreateRoleDto[]) => {
        createMany(dtos, {
            onSuccess: (res: any) => {
                showToast(`${res.createdCount} yaratildi${res.errors?.length ? `, ${res.errors.length} muvaffaqiyatsiz` : ''}`);
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

    const toggleAll = () => setSelected((prev) => (prev.size === roles.length ? new Set() : new Set(roles.map((r) => r._id))));

    const activeFilters = [!!query.status, !!query.type, typeof query.isSystemRole !== 'undefined', !!query.permissionId, !!query.permissionName, !!query.minPriority, !!query.maxPriority, !!query.minUsers, !!query.maxUsers, !!query.createdFrom, !!query.createdTo, !!query.updatedFrom, !!query.updatedTo, !!query.includeDeleted].filter(Boolean).length;

    return (
        <AdminLayout>
            <div className="space-y-5 min-h-screen bg-gray-50 dark:bg-gray-950">
                <ToastContainer toast={toast} />

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Shield className="w-6 h-6 text-blue-500" /> Roles
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Foydalanuvchi rollarini boshqarish</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => refetch()} disabled={isFetching} className="p-2.5 text-gray-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition disabled:opacity-50">
                            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => setShowFilters((v) => !v)} className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl border transition ${showFilters || activeFilters > 0 ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}>
                            <Filter className="w-4 h-4" /> Filtrlar
                            {activeFilters > 0 && <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-xs font-bold">{activeFilters}</span>}
                        </button>
                        <button onClick={() => setModal({ type: 'bulkUpdate' })} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition">
                            <Edit3 className="w-4 h-4" /> Bulk tahrirlash
                        </button>
                        <button onClick={() => setModal({ type: 'bulkCreate' })} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition">
                            <Layers className="w-4 h-4" /> Bulk yaratish
                        </button>
                        <button onClick={() => router.push('/admin/roles/create')} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm">
                            <Plus className="w-4 h-4" /> Yaratish
                        </button>
                    </div>
                </div>

                <RoleStatsRow stats={stats} />

                {/* Search + Filters */}
                <div className="space-y-3">
                    <div className="flex gap-3 flex-wrap">
                        <div className="flex-1 min-w-52 relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Nom, tavsif, permission, status..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-sm" />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {['', 'ACTIVE', 'INACTIVE', 'PENDING', 'ARCHIVE', 'DELETED'].map((s) => (
                                <button key={s} onClick={() => setQuery((p) => ({ ...p, status: (s || undefined) as any, page: 1 }))} className={`px-3 py-2 text-xs font-semibold rounded-xl border transition ${(query.status ?? '') === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}>
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
                                        { key: 'type', label: 'Tur', opts: ['', 'admin', 'user', 'moderator', 'guest', 'custom'] },
                                        { key: 'sortBy', label: 'Saralash', opts: ['priority', 'userCount', 'name', 'type', 'status', 'createdAt', 'updatedAt'] },
                                        { key: 'sortOrder', label: 'Tartib', opts: ['desc', 'asc'] },
                                        { key: 'limit', label: 'Limit', opts: ['10', '20', '50', '100'] },
                                    ].map(({ key, label, opts }) => (
                                        <div key={key}>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
                                            <select value={(query as any)[key] ?? ''} onChange={(e) => setQuery((p) => ({ ...p, [key]: key === 'limit' ? Number(e.target.value) : e.target.value || undefined, page: 1 }))} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40">
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
                                        { key: 'permissionName', label: 'Permission nomi', placeholder: 'users.read' },
                                        { key: 'permissionId', label: 'Permission ID', placeholder: 'ObjectId' },
                                        { key: 'minPriority', label: 'Min priority', placeholder: '0', type: 'number' },
                                        { key: 'maxPriority', label: 'Max priority', placeholder: '100', type: 'number' },
                                        { key: 'minUsers', label: 'Min users', placeholder: '0', type: 'number' },
                                        { key: 'maxUsers', label: 'Max users', placeholder: '1000', type: 'number' },
                                        { key: 'createdFrom', label: 'Created from', type: 'date' },
                                        { key: 'createdTo', label: 'Created to', type: 'date' },
                                        { key: 'updatedFrom', label: 'Updated from', type: 'date' },
                                        { key: 'updatedTo', label: 'Updated to', type: 'date' },
                                    ].map((field) => (
                                        <div key={field.key}>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{field.label}</label>
                                            <input
                                                type={field.type ?? 'text'}
                                                value={(query as any)[field.key] ?? ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setQuery((p) => ({
                                                        ...p,
                                                        [field.key]: field.type === 'number' ? (value === '' ? undefined : Number(value)) : value || undefined,
                                                        page: 1,
                                                    }));
                                                }}
                                                placeholder={field.placeholder}
                                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                                            <input type="checkbox" checked={query.isSystemRole === true} onChange={(e) => setQuery((p) => ({ ...p, isSystemRole: e.target.checked ? true : undefined, page: 1 }))} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500/30" />
                                            Faqat system rollar
                                        </label>
                                        <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                                            <input type="checkbox" checked={query.includeDeleted ?? false} onChange={(e) => setQuery((p) => ({ ...p, includeDeleted: e.target.checked, page: 1 }))} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500/30" />
                                            O'chirilganlarni ham ko'rsat
                                        </label>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setQuery({ page: 1, limit: 20, sortBy: 'priority', sortOrder: 'desc' });
                                            setSearch('');
                                        }}
                                        className="px-3 py-2 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 transition font-medium"
                                    >
                                        Tozalash
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bulk bar */}
                <AnimatePresence>
                    {selected.size > 0 && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl flex-wrap">
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{selected.size} tanlangan</span>
                            <div className="flex-1" />
                            <button onClick={() => setModal({ type: 'bulkDelete' })} disabled={isBulkDeleting} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition disabled:opacity-50">
                                <Trash2 className="w-3.5 h-3.5" /> O'chirish
                            </button>
                            <button onClick={() => setSelected(new Set())} className="p-1.5 text-blue-500 hover:text-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/40 transition">
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Table */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Yuklanmoqda...</p>
                        </div>
                    ) : roles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <div className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-800">
                                <Shield className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="font-medium text-gray-700 dark:text-gray-300">Role topilmadi</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                                        <th className="w-10 px-4 py-3">
                                            <input type="checkbox" checked={selected.size === roles.length && roles.length > 0} onChange={toggleAll} className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500/30 cursor-pointer" />
                                        </th>
                                        {['Nom', 'Tur', 'Prioritet', 'Permissionlar', 'Foydalanuvchilar', 'Status', 'System', 'Yaratilgan', ''].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {roles.map((role, idx) => (
                                        <motion.tr key={role._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.01 }} className={`group hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors cursor-pointer ${selected.has(role._id) ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''} ${role.isDeleted ? 'opacity-50' : ''}`} onClick={() => router.push(`/admin/roles/${role._id}`)}>
                                            <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                                                <input type="checkbox" checked={selected.has(role._id)} onChange={() => toggleSelect(role._id)} className="rounded border-gray-300 dark:border-gray-600 text-blue-600 cursor-pointer" />
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="font-semibold text-xs text-gray-900 dark:text-white">{role.name}</span>
                                                {role.description && <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[160px]">{role.description}</p>}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <TypeBadge type={role.type} />
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <PriorityBadge priority={role.priority} />
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">{Array.isArray(role.permissions) ? role.permissions.length : 0}</span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                                    <Users className="w-3 h-3" /> {role.userCount}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">{role.isDeleted ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">🗑 O'chirilgan</span> : <StatusBadge status={role.status} />}</td>
                                            <td className="px-4 py-3.5">{role.isSystemRole ? <SystemBadge /> : <span className="text-[10px] text-gray-400">Yo'q</span>}</td>
                                            <td className="px-4 py-3.5 text-xs text-gray-400">{fmtDateShort(role.createdAt)}</td>
                                            <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => router.push(`/admin/roles/${role._id}`)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition" title="Ko'rish">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {!role.isDeleted && (
                                                        <button onClick={() => router.push(`/admin/roles/${role._id}/edit`)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition" title="Tahrirlash">
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {!role.isDeleted && !role.isSystemRole && role.userCount === 0 && (
                                                        <button onClick={() => setModal({ type: 'delete', role })} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition" title="O'chirish">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {role.isDeleted && (
                                                        <button onClick={() => handleRestore(role._id)} disabled={isRestoring} className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition disabled:opacity-50" title="Tiklash">
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
                                <button onClick={() => setQuery((p) => ({ ...p, page: (p.page ?? 1) - 1 }))} disabled={query.page === 1} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pg = Math.max(1, Math.min(totalPages - 4, (query.page ?? 1) - 2)) + i;
                                    return (
                                        <button key={pg} onClick={() => setQuery((p) => ({ ...p, page: pg }))} className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition ${pg === (query.page ?? 1) ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                            {pg}
                                        </button>
                                    );
                                })}
                                <button onClick={() => setQuery((p) => ({ ...p, page: (p.page ?? 1) + 1 }))} disabled={query.page === totalPages} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button onClick={() => setQuery((p) => ({ ...p, page: totalPages }))} disabled={query.page === totalPages} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition">
                                    <ChevronsRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modals */}
                <BulkCreateRoleModal open={modal?.type === 'bulkCreate'} onClose={() => setModal(null)} onSave={handleBulkCreate} isSaving={isCreatingMany} />
                <BulkUpdateRoleModal open={modal?.type === 'bulkUpdate'} onClose={() => setModal(null)} onSave={handleBulkUpdate} isSaving={isBulkUpdating} />
                <ConfirmModal open={modal?.type === 'delete'} title="Rolni o'chirish" message={modal?.type === 'delete' ? `"${modal.role.name}" rolini o'chirmoqchimisiz? 30 kun ichida tiklash mumkin.` : ''} confirmLabel="O'chirish" withReason icon={<Trash2 className="w-4 h-4" />} onConfirm={handleDelete} onClose={() => setModal(null)} isLoading={isDeleting} />
                <ConfirmModal open={modal?.type === 'bulkDelete'} title="Bulk o'chirish" message={`${selected.size} ta rol o'chiriladi. System rollar va foydalanuvchisi borlar o'tkazib yuboriladi.`} confirmLabel={`${selected.size} tasini o'chirish`} withReason icon={<Trash2 className="w-4 h-4" />} onConfirm={handleBulkDelete} onClose={() => setModal(null)} isLoading={isBulkDeleting} />
            </div>
        </AdminLayout>
    );
}

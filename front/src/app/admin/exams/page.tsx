'use client';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpDown, CheckCircle, ChevronLeft, ChevronRight, Edit, Filter, Plus, Play, RefreshCw, RotateCcw, Search, SortAsc, SortDesc, Trash2, X, XCircle } from 'lucide-react';
import { useAdminExams, useAdminGlobalStats } from '@/hooks/useAdminExams';
import type { AdminExamFilters, DifficultyLevel, IELTSExam } from '@/types/exam';
import { DEFAULT_ADMIN_FILTERS, DIFFICULTY_COLORS, DIFFICULTY_LABELS, EXAM_TYPE_ICONS, EXAM_TYPE_LABELS } from '@/constants/exam';
import { fmtShortDate } from '@/utils/exam';
import FilterPanel from './components/FilterPanel';
import DeleteModal from './components/DeleteModal';
import JsonImportModal from './components/JsonImportModal';
import AdminLayout from '@/components/Layout/AdminLayout';

const STATUS_COLOR: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    INACTIVE: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    ARCHIVE: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    DELETED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export default function ExamListPage() {
    const [filters, setFilters] = useState<AdminExamFilters>(DEFAULT_ADMIN_FILTERS as AdminExamFilters);
    const [showFilters, setShowFilters] = useState(false);
    const [showDeleted, setShowDeleted] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [deleteTarget, setDeleteTarget] = useState<IELTSExam | null>(null);
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
    const [showJsonModal, setShowJsonModal] = useState(false);

    const activeFilters = useMemo<AdminExamFilters>(() => ({ ...filters, isDeleted: showDeleted }), [filters, showDeleted]);

    const { exams, total, totalPages, page, isLoading, isFetching, refetch, create, bulkCreate, bulkDelete, bulkRestore, softDelete, restore, togglePublish } = useAdminExams(activeFilters);
    const { data: globalStats } = useAdminGlobalStats();

    const updateFilters = useCallback((partial: Partial<AdminExamFilters>) => setFilters((prev) => ({ ...prev, ...partial, page: partial.page ?? 1 })), []);
    const resetFilters = useCallback(() => setFilters(DEFAULT_ADMIN_FILTERS as AdminExamFilters), []);

    const toggleSelect = (id: string) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelected(next);
    };
    const toggleSelectAll = () => (selected.size === exams.length ? setSelected(new Set()) : setSelected(new Set(exams.map((e: IELTSExam) => e._id))));

    const handleSort = (field: string) =>
        setFilters((prev) => ({
            ...prev,
            sortBy: field,
            sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc',
        }));

    const handleBulkDelete = () => {
        bulkDelete(Array.from(selected));
        setSelected(new Set());
        setBulkDeleteConfirm(false);
    };

    const activeFilterCount = Object.entries(filters).filter(([key, value]) => !['page', 'limit', 'sortBy', 'sortOrder', 'isDeleted'].includes(key) && value !== '' && value !== undefined && value !== null && value !== false).length;

    const paginationPages = useMemo(() => {
        const start = Math.max(1, (page ?? 1) - 2);
        return Array.from({ length: 5 }, (_, i) => start + i).filter((p) => p <= totalPages);
    }, [page, totalPages]);

    const SortIcon = ({ field }: { field: string }) => (filters.sortBy !== field ? <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-50" /> : filters.sortOrder === 'desc' ? <SortDesc className="w-3.5 h-3.5 text-blue-500" /> : <SortAsc className="w-3.5 h-3.5 text-blue-500" />);

    return (
        <AdminLayout>
            <div className="space-y-5 min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">IELTS Exams</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {total} exams
                            {showDeleted && <span className="ml-2 text-red-500 font-semibold">(Trash)</span>}
                        </p>
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            onClick={() => {
                                setShowDeleted(!showDeleted);
                                setSelected(new Set());
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${showDeleted ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                        >
                            <Trash2 className="w-4 h-4" />
                            {showDeleted ? "Show active" : 'Trash'}
                        </button>
                        <button onClick={() => refetch()} title="Refresh" className="p-2.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => setShowJsonModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-all">
                            JSON Import
                        </button>
                        <Link href="/admin/exams/create">
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]">
                                <Plus className="w-4 h-4" /> New Exam
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {[
                        { label: 'Total', value: globalStats?.total ?? 0, color: 'text-blue-600 dark:text-blue-400' },
                        { label: 'Published', value: globalStats?.published ?? 0, color: 'text-emerald-600 dark:text-emerald-400' },
                        { label: 'Draft', value: globalStats?.drafts ?? 0, color: 'text-amber-600 dark:text-amber-400' },
                        { label: 'Premium', value: globalStats?.premium ?? 0, color: 'text-violet-600 dark:text-violet-400' },
                        { label: "Deleted", value: globalStats?.deleted ?? 0, color: 'text-rose-600 dark:text-rose-400' },
                    ].map((item) => (
                        <div key={item.label} className="rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{item.label}</p>
                            <p className={`mt-1 text-2xl font-black ${item.color}`}>{item.value}</p>
                        </div>
                    ))}
                </div>

                {/* Search + Filter */}
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Search exams..." value={filters.search ?? ''} onChange={(e) => updateFilters({ search: e.target.value })} className="w-full pl-11 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        {filters.search && (
                            <button onClick={() => updateFilters({ search: '' })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl text-sm font-semibold transition-all ${showFilters ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'}`}>
                        <Filter className="w-4 h-4" /> Filters
                        {activeFilterCount > 0 && <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilterCount}</span>}
                    </button>
                </div>

                <FilterPanel filters={activeFilters} onChange={updateFilters} onReset={resetFilters} open={showFilters} />

                {/* Bulk bar */}
                <AnimatePresence>
                    {selected.size > 0 && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl px-4 py-3">
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{selected.size} selected</span>
                            <div className="flex gap-2 ml-auto">
                                {showDeleted ? (
                                    <button
                                        onClick={() => {
                                            bulkRestore(Array.from(selected));
                                            setSelected(new Set());
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" /> Restore
                                    </button>
                                ) : (
                                    <button onClick={() => setBulkDeleteConfirm(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold">
                                        <Trash2 className="w-3.5 h-3.5" /> {"Delete"}
                                    </button>
                                )}
                                <button onClick={() => setSelected(new Set())} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <X className="w-3.5 h-3.5" /> Cancel
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="w-10 px-4 py-3.5">
                                            <input type="checkbox" checked={selected.size === exams.length && exams.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded" />
                                        </th>
                                        {[
                                            { label: 'Title', field: 'title', sort: true },
                                            { label: 'Type', field: '', sort: false },
                                            { label: 'Difficulty', field: 'difficulty', sort: true },
                                            { label: 'Status', field: '', sort: false },
                                            { label: 'Attempts', field: 'totalAttempts', sort: true },
                                            { label: 'Rating', field: 'averageRating', sort: true },
                                            { label: 'Created', field: 'createdAt', sort: true },
                                            { label: 'Updated', field: 'updatedAt', sort: true },
                                        ].map((col) => (
                                            <th key={col.label} className="px-4 py-3.5 text-left">
                                                {col.sort ? (
                                                    <button onClick={() => handleSort(col.field)} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-900 dark:hover:text-white">
                                                        {col.label} <SortIcon field={col.field} />
                                                    </button>
                                                ) : (
                                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{col.label}</span>
                                                )}
                                            </th>
                                        ))}
                                        <th className="px-4 py-3.5 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                    {exams.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} className="px-6 py-20 text-center">
                                                <p className="text-lg font-semibold text-gray-400">No exams found</p>
                                                <p className="text-sm text-gray-400 mt-1">{showDeleted ? "Trash empty" : "Adjust the filters or create a new exam"}</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        exams.map((exam: IELTSExam, idx: number) => <ExamRow key={exam._id} exam={exam} idx={idx} selected={selected.has(exam._id)} onSelect={() => toggleSelect(exam._id)} showDeleted={showDeleted} onDelete={() => setDeleteTarget(exam)} onRestore={() => restore(exam._id)} onPublish={() => togglePublish({ id: exam._id, isPublished: exam.isPublished })} />)
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-500">
                                Page {page ?? 1} / {totalPages} · Total {total}
                            </p>
                            <div className="flex items-center gap-1">
                                <button onClick={() => updateFilters({ page: 1 })} disabled={(page ?? 1) === 1} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-400">
                                    First
                                </button>
                                <button onClick={() => updateFilters({ page: Math.max(1, (page ?? 1) - 1) })} disabled={(page ?? 1) === 1} className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </button>
                                {paginationPages.map((p) => (
                                    <button key={p} onClick={() => updateFilters({ page: p })} className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${p === (page ?? 1) ? 'bg-blue-600 text-white' : 'border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                        {p}
                                    </button>
                                ))}
                                <button onClick={() => updateFilters({ page: Math.min(totalPages, (page ?? 1) + 1) })} disabled={(page ?? 1) === totalPages} className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </button>
                                <button onClick={() => updateFilters({ page: totalPages })} disabled={(page ?? 1) === totalPages} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-400">
                                    Last
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modals */}
                {deleteTarget && (
                    <DeleteModal
                        exam={deleteTarget}
                        onConfirm={() => {
                            softDelete(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) });
                        }}
                        onCancel={() => setDeleteTarget(null)}
                    />
                )}
                {bulkDeleteConfirm && <DeleteModal multiple={exams.filter((e: IELTSExam) => selected.has(e._id))} onConfirm={handleBulkDelete} onCancel={() => setBulkDeleteConfirm(false)} />}
                {showJsonModal && (
                    <JsonImportModal
                        title="Create exams from JSON"
                        onImport={(data) => {
                            if (Array.isArray(data)) bulkCreate(data);
                            else create(data);
                            setShowJsonModal(false);
                        }}
                        onClose={() => setShowJsonModal(false)}
                    />
                )}
            </div>
        </AdminLayout>
    );
}

// ─── ExamRow ──────────────────────────────────────────────────

function ExamRow({ exam, idx, selected, onSelect, showDeleted, onDelete, onRestore, onPublish }: { exam: IELTSExam; idx: number; selected: boolean; onSelect: () => void; showDeleted: boolean; onDelete: () => void; onRestore: () => void; onPublish: () => void }) {
    const typeLabel = EXAM_TYPE_LABELS[exam.examType] ?? exam.examType?.replace(/_/g, ' ') ?? 'Unknown type';
    const difficultyLabel = DIFFICULTY_LABELS[exam.difficulty as DifficultyLevel] ?? exam.difficulty?.replace(/_/g, ' ') ?? 'Unknown';
    const difficultyColor = DIFFICULTY_COLORS[exam.difficulty as DifficultyLevel] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    const attempts = exam.totalAttempts ?? 0;
    const completed = exam.completedAttempts ?? 0;
    return (
        <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${selected ? 'bg-blue-50 dark:bg-blue-900/10' : ''} ${exam.isDeleted ? 'opacity-60' : ''}`}>
            <td className="px-4 py-3.5">
                <input type="checkbox" checked={selected} onChange={onSelect} className="w-4 h-4 rounded" />
            </td>

            {/* Title */}
            <td className="px-4 py-3.5 max-w-[220px]">
                <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">{exam.title || 'Untitled exam'}</p>
                {exam.description && <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{exam.description}</p>}
                <div className="flex gap-1 mt-1 flex-wrap">
                    {exam.isPremium && <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded font-bold">Premium</span>}
                    {exam.isDeleted && <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-bold">{"Deleted"}</span>}
                    <span className="text-[10px] text-gray-400">{exam.module ?? 'No module'}</span>
                </div>
            </td>

            {/* Type */}
            <td className="px-4 py-3.5">
                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {EXAM_TYPE_ICONS[exam.examType] ?? <span className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700" />}
                    {typeLabel}
                </span>
            </td>

            {/* Difficulty */}
            <td className="px-4 py-3.5">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${difficultyColor}`}>{difficultyLabel}</span>
            </td>

            {/* Status */}
            <td className="px-4 py-3.5">
                <div className="space-y-1">
                    {exam.status && <span className={`block w-fit px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLOR[exam.status] ?? STATUS_COLOR.INACTIVE}`}>{exam.status}</span>}
                    {exam.isPublished ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                            <CheckCircle className="w-3 h-3" /> Published
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                            <XCircle className="w-3 h-3" /> Draft
                        </span>
                    )}
                </div>
            </td>

            {/* Attempts */}
            <td className="px-4 py-3.5">
                <span className="font-bold text-gray-700 dark:text-gray-300">{attempts}</span>
                <span className="text-xs text-gray-400 ml-1">/{completed}</span>
            </td>

            {/* Rating */}
            <td className="px-4 py-3.5">
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{exam.averageRating > 0 ? `★ ${exam.averageRating.toFixed(1)}` : '—'}</span>
            </td>

            {/* Created */}
            <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">{fmtShortDate(exam.createdAt)}</td>

            {/* Updated */}
            <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">{fmtShortDate(exam.updatedAt)}</td>

            {/* Actions */}
            <td className="px-4 py-3.5">
                <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/exams/${exam._id}`}>
                        <button className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-gray-400 hover:text-blue-600 transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                        </button>
                    </Link>
                    {!showDeleted && (
                        <>
                            <Link href={`/admin/exams/${exam._id}/preview`}>
                                <button className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors" title="Preview">
                                    <Play className="w-4 h-4" />
                                </button>
                            </Link>
                            <Link href={`/admin/exams/${exam._id}/edit`}>
                                <button className="p-1.5 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg text-gray-400 hover:text-violet-600 transition-colors" title="Edit">
                                    <Edit className="w-4 h-4" />
                                </button>
                            </Link>
                            <button onClick={onPublish} className={`p-1.5 rounded-lg transition-colors ${exam.isPublished ? 'hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-400 hover:text-amber-500' : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-600'}`} title={exam.isPublished ? 'Unpublish' : 'Published qilish'}>
                                {exam.isPublished ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                            <button onClick={onDelete} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                    {showDeleted && (
                        <button onClick={onRestore} className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg text-gray-400 hover:text-emerald-600 transition-colors" title="Restore">
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </td>
        </motion.tr>
    );
}

// Eye icon inline
const Eye = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

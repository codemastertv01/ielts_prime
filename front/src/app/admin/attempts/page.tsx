'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ban, CalendarDays, Edit3, Eye, FilePlus2, FileText, Filter, RefreshCw, RotateCcw, Search, ShieldCheck, Trash2, TrendingUp, X, Zap } from 'lucide-react';
import { useAdminAttemptStats, useAdminAttempts } from '@/hooks/useAdminAttempts';
import { AdminStats, AdminUpdateAttemptDto, AllAttemptsParams, BulkDeleteDto, IELTSExamAttempt, getExam, getExamId, getUser, getUserId } from '@/types/attempt.types';
import { EntityStatusEnum } from '@/types/entity.status';
import { Alert, Badge, Button, Card, Checkbox, EmptyState, Input, Modal, Pagination, Select, Skeleton, StatCard, Table, TableBody, TableCell, TableElement, TableHead, TableHeader, TableRow, Tabs, Textarea } from '@/components/UI';
import EditDrawer from './components/EditDrawer';

type DialogState = { type: 'create' } | { type: 'delete'; attempt: IELTSExamAttempt } | { type: 'restore'; attempt: IELTSExamAttempt } | { type: 'hard'; attempt: IELTSExamAttempt } | null;
type EditState = IELTSExamAttempt | null;

interface FiltersState {
    q: string;
    status: string;
    examId: string;
    userId: string;
    attemptNumber: string;
    createdFrom: string;
    createdTo: string;
    submittedFrom: string;
    submittedTo: string;
    minOverallBand: string;
    maxOverallBand: string;
    minReadingBand: string;
    maxReadingBand: string;
    minListeningBand: string;
    maxListeningBand: string;
    minWritingBand: string;
    maxWritingBand: string;
    minSpeakingBand: string;
    maxSpeakingBand: string;
    isDeleted: 'false' | 'true' | 'ALL';
    isReviewed: 'ALL' | 'true' | 'false';
    page: number;
    limit: number;
    sortBy: NonNullable<AllAttemptsParams['sortBy']>;
    sortOrder: NonNullable<AllAttemptsParams['sortOrder']>;
}

const DEFAULT_FILTERS: FiltersState = {
    q: '',
    status: 'ALL',
    examId: '',
    userId: '',
    attemptNumber: '',
    createdFrom: '',
    createdTo: '',
    submittedFrom: '',
    submittedTo: '',
    minOverallBand: '',
    maxOverallBand: '',
    minReadingBand: '',
    maxReadingBand: '',
    minListeningBand: '',
    maxListeningBand: '',
    minWritingBand: '',
    maxWritingBand: '',
    minSpeakingBand: '',
    maxSpeakingBand: '',
    isDeleted: 'false',
    isReviewed: 'ALL',
    page: 1,
    limit: 25,
    sortBy: 'createdAt',
    sortOrder: 'desc',
};

const STATUSES = [EntityStatusEnum.IN_PROGRESS, EntityStatusEnum.SUBMITTED, EntityStatusEnum.GRADING, EntityStatusEnum.GRADED, EntityStatusEnum.EXPIRED];
const STATUS_LABEL: Record<string, string> = {
    [EntityStatusEnum.IN_PROGRESS]: 'In Progress',
    [EntityStatusEnum.SUBMITTED]: 'Submitted',
    [EntityStatusEnum.GRADING]: 'Grading',
    [EntityStatusEnum.GRADED]: 'Graded',
    [EntityStatusEnum.EXPIRED]: 'Expired',
};
const STATUS_TONE: Record<string, 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'> = {
    [EntityStatusEnum.IN_PROGRESS]: 'info',
    [EntityStatusEnum.SUBMITTED]: 'primary',
    [EntityStatusEnum.GRADING]: 'warning',
    [EntityStatusEnum.GRADED]: 'success',
    [EntityStatusEnum.EXPIRED]: 'danger',
};

const numberOrUndefined = (value: string) => (value === '' ? undefined : Number(value));
const text = (value: unknown) => String(value ?? '').toLowerCase();
const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '-');
const formatTime = (value?: string) => (value ? new Date(value).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '');
const inRange = (value: number | undefined, min: string, max: string) => {
    if (value == null) return !min && !max;
    const minValue = numberOrUndefined(min);
    const maxValue = numberOrUndefined(max);
    return (minValue == null || value >= minValue) && (maxValue == null || value <= maxValue);
};
const inDateRange = (value: string | undefined, from: string, to: string) => {
    if (!from && !to) return true;
    if (!value) return false;
    const time = new Date(value).getTime();
    const fromTime = from ? new Date(`${from}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY;
    const toTime = to ? new Date(`${to}T23:59:59`).getTime() : Number.POSITIVE_INFINITY;
    return time >= fromTime && time <= toTime;
};

const statValue = (value: number | null | undefined): number => value ?? 0;

const StatsRow = ({ stats, loading }: { stats?: AdminStats; loading: boolean }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-24" radius="xl" />
                ))}
            </div>
        );
    }

    const safe = stats ?? {
        total: 0,
        active: { inProgress: 0, submitted: 0, grading: 0, graded: 0, expired: 0 },
        deleted: 0,
        avgBandScore: null,
        gradedCount: 0,
        bandDistribution: [],
        todayAttempts: 0,
        weekAttempts: 0,
    };

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <StatCard label="Jami" value={statValue(safe.total)} Icon={FileText} tone="neutral" />
            <StatCard label="Bugun" value={statValue(safe.todayAttempts)} Icon={Zap} tone="info" />
            <StatCard label="In Progress" value={statValue(safe.active?.inProgress)} Icon={RefreshCw} tone="info" />
            <StatCard label="Grading" value={statValue(safe.active?.grading)} Icon={ShieldCheck} tone="warning" />
            <StatCard label="Avg band" value={safe.avgBandScore ?? '-'} Icon={TrendingUp} tone="success" />
            <StatCard label="O'chirilgan" value={statValue(safe.deleted)} Icon={Trash2} tone="danger" />
        </div>
    );
};

const SectionScores = ({ attempt }: { attempt: IELTSExamAttempt }) => (
    <div className="grid min-w-28 grid-cols-4 gap-2 text-center text-[11px]">
        {[
            ['L', attempt.listeningBandScore, 'text-cyan-600'],
            ['R', attempt.readingBandScore, 'text-sky-600'],
            ['W', attempt.writingBandScore, 'text-indigo-600'],
            ['S', attempt.speakingBandScore, 'text-violet-600'],
        ].map(([label, value, color]) => (
            <div key={String(label)}>
                <div className={`font-black ${color}`}>{label}</div>
                <div className="font-mono font-semibold text-gray-700 dark:text-gray-300">{value ?? '-'}</div>
            </div>
        ))}
    </div>
);

export default function AttemptsPage() {
    const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);
    const [debouncedQ, setDebouncedQ] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [editAttempt, setEditAttempt] = useState<EditState>(null);
    const [dialog, setDialog] = useState<DialogState>(null);
    const [reason, setReason] = useState('');
    const [createExamId, setCreateExamId] = useState('');
    const [notice, setNotice] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQ(filters.q.trim()), 350);
        return () => clearTimeout(timer);
    }, [filters.q]);

    const queryParams = useMemo((): AllAttemptsParams => {
        const params: AllAttemptsParams = {
            page: filters.page,
            limit: filters.limit,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
        };
        if (filters.status !== 'ALL') params.status = filters.status;
        if (filters.examId.trim()) params.examId = filters.examId.trim();
        if (filters.userId.trim()) params.userId = filters.userId.trim();
        if (filters.isDeleted !== 'ALL') params.isDeleted = filters.isDeleted === 'true';
        if (filters.isReviewed !== 'ALL') params.isReviewed = filters.isReviewed === 'true';
        if (debouncedQ) params.q = debouncedQ;
        if (filters.attemptNumber) params.attemptNumber = Number(filters.attemptNumber);
        if (filters.createdFrom) params.createdFrom = filters.createdFrom;
        if (filters.createdTo) params.createdTo = filters.createdTo;
        if (filters.submittedFrom) params.submittedFrom = filters.submittedFrom;
        if (filters.submittedTo) params.submittedTo = filters.submittedTo;
        params.minOverallBand = numberOrUndefined(filters.minOverallBand);
        params.maxOverallBand = numberOrUndefined(filters.maxOverallBand);
        params.minReadingBand = numberOrUndefined(filters.minReadingBand);
        params.maxReadingBand = numberOrUndefined(filters.maxReadingBand);
        params.minListeningBand = numberOrUndefined(filters.minListeningBand);
        params.maxListeningBand = numberOrUndefined(filters.maxListeningBand);
        params.minWritingBand = numberOrUndefined(filters.minWritingBand);
        params.maxWritingBand = numberOrUndefined(filters.maxWritingBand);
        params.minSpeakingBand = numberOrUndefined(filters.minSpeakingBand);
        params.maxSpeakingBand = numberOrUndefined(filters.maxSpeakingBand);
        return params;
    }, [debouncedQ, filters]);

    const { attempts, total, totalPages, isLoading, isFetching, refetch, updateAttempt, isUpdating, softDelete, isDeleting, restore, isRestoring, bulkDelete, isBulkDeleting, bulkRestore, isBulkRestoring, hardDelete, isHardDeleting, createAttempt, isCreating } = useAdminAttempts(queryParams);
    const { data: stats, isLoading: statsLoading } = useAdminAttemptStats();

    const showNotice = useCallback((textValue: string, type: 'success' | 'danger' = 'success') => {
        setNotice({ text: textValue, type });
        setTimeout(() => setNotice(null), 3500);
    }, []);

    const filteredAttempts = useMemo(() => {
        return attempts.filter((attempt) => {
            const user = getUser(attempt);
            const exam = getExam(attempt);
            const haystack = [attempt._id, attempt.attemptNumber, attempt.status, getUserId(attempt), user?.username, user?.email, user?.firstName, user?.lastName, user?.phoneNumber, getExamId(attempt), exam?.title, exam?.examType, exam?.module, exam?.difficulty, attempt.tags?.join(' '), attempt.reviewNote, attempt.generalFeedback, attempt.deleteReason].map(text).join(' ');
            return (
                (!debouncedQ || haystack.includes(debouncedQ.toLowerCase())) &&
                (!filters.attemptNumber || String(attempt.attemptNumber ?? '') === filters.attemptNumber) &&
                inRange(attempt.overallBandScore, filters.minOverallBand, filters.maxOverallBand) &&
                inRange(attempt.readingBandScore, filters.minReadingBand, filters.maxReadingBand) &&
                inRange(attempt.listeningBandScore, filters.minListeningBand, filters.maxListeningBand) &&
                inRange(attempt.writingBandScore, filters.minWritingBand, filters.maxWritingBand) &&
                inRange(attempt.speakingBandScore, filters.minSpeakingBand, filters.maxSpeakingBand) &&
                inDateRange(attempt.createdAt, filters.createdFrom, filters.createdTo) &&
                inDateRange(attempt.submittedAt, filters.submittedFrom, filters.submittedTo)
            );
        });
    }, [attempts, debouncedQ, filters]);

    const activeFilterCount = [
        debouncedQ,
        filters.status !== 'ALL',
        filters.examId,
        filters.userId,
        filters.attemptNumber,
        filters.createdFrom,
        filters.createdTo,
        filters.submittedFrom,
        filters.submittedTo,
        filters.minOverallBand,
        filters.maxOverallBand,
        filters.minReadingBand,
        filters.maxReadingBand,
        filters.minListeningBand,
        filters.maxListeningBand,
        filters.minWritingBand,
        filters.maxWritingBand,
        filters.minSpeakingBand,
        filters.maxSpeakingBand,
        filters.isDeleted !== 'false',
        filters.isReviewed !== 'ALL',
    ].filter(Boolean).length;

    const updateFilter = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: key === 'page' ? (value as number) : 1 }));
        setSelected(new Set());
    };

    const handleEdit = (data: AdminUpdateAttemptDto) => {
        if (!editAttempt) return;
        updateAttempt(
            { attemptId: editAttempt._id, data },
            {
                onSuccess: () => {
                    setEditAttempt(null);
                    showNotice('Attempt yangilandi');
                },
                onError: () => showNotice('Attempt yangilanmadi', 'danger'),
            },
        );
    };

    const handleDelete = () => {
        if (dialog?.type !== 'delete') return;
        softDelete(
            { attemptId: dialog.attempt._id, reason: reason || undefined },
            {
                onSuccess: () => {
                    setDialog(null);
                    setReason('');
                    showNotice("Attempt o'chirildi");
                },
                onError: () => showNotice("Attempt o'chirilmadi", 'danger'),
            },
        );
    };

    const handleRestore = () => {
        if (dialog?.type !== 'restore') return;
        restore(
            { attemptId: dialog.attempt._id, reason: reason || undefined },
            {
                onSuccess: () => {
                    setDialog(null);
                    setReason('');
                    showNotice('Attempt tiklandi');
                },
                onError: () => showNotice('Attempt tiklanmadi', 'danger'),
            },
        );
    };

    const handleHardDelete = () => {
        if (dialog?.type !== 'hard') return;
        hardDelete(dialog.attempt._id, {
            onSuccess: () => {
                setDialog(null);
                showNotice("Attempt doimiy o'chirildi");
            },
            onError: () => showNotice("Doimiy o'chirish bajarilmadi", 'danger'),
        });
    };

    const handleCreate = () => {
        if (!createExamId.trim()) return;
        createAttempt(createExamId.trim(), {
            onSuccess: () => {
                setCreateExamId('');
                setDialog(null);
                showNotice('Yangi attempt yaratildi');
            },
            onError: () => showNotice('Attempt yaratilmadi', 'danger'),
        });
    };

    const toggleOne = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };
    const toggleAll = () => setSelected((prev) => (prev.size === filteredAttempts.length ? new Set() : new Set(filteredAttempts.map((attempt) => attempt._id))));

    const handleBulkDelete = () => {
        bulkDelete({ ids: [...selected] } as BulkDeleteDto, {
            onSuccess: () => {
                showNotice(`${selected.size} ta attempt o'chirildi`);
                setSelected(new Set());
            },
            onError: () => showNotice("Bulk o'chirish bajarilmadi", 'danger'),
        });
    };

    const handleBulkRestore = () => {
        bulkRestore(
            { attemptIds: [...selected] },
            {
                onSuccess: () => {
                    showNotice(`${selected.size} ta attempt tiklandi`);
                    setSelected(new Set());
                },
                onError: () => showNotice('Bulk restore bajarilmadi', 'danger'),
            },
        );
    };

    return (
        <div className="space-y-6">
            {notice && (
                <div className="fixed right-5 top-5 z-[120] w-80">
                    <Alert tone={notice.type} title={notice.type === 'success' ? 'Bajarildi' : 'Xatolik'} onClose={() => setNotice(null)}>
                        {notice.text}
                    </Alert>
                </div>
            )}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white">Exam Attempts</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get, create, edit, delete, restore, audit va chuqur filterlash.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" tone="neutral" Icon={RefreshCw} disabled={isFetching} onClick={() => refetch()}>
                        Yangilash
                    </Button>
                    <Button variant={showFilters || activeFilterCount ? 'solid' : 'outline'} Icon={Filter} onClick={() => setShowFilters((value) => !value)}>
                        Filtrlar {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
                    </Button>
                    <Button Icon={FilePlus2} onClick={() => setDialog({ type: 'create' })}>
                        Yaratish
                    </Button>
                </div>
            </div>

            <StatsRow stats={stats} loading={statsLoading} />

            <Card variant="default" withCorners={false} hoverEffect={false} className="space-y-4">
                <div className="flex flex-col gap-3 xl:flex-row">
                    <Input Icon={Search} value={filters.q} onChange={(event) => updateFilter('q', event.target.value)} placeholder="ID, user, email, exam, status, tag, attempt number bo'yicha qidirish..." />
                    <Tabs
                        tabs={[{ value: 'ALL', label: 'Barchasi' }, ...STATUSES.map((status) => ({ value: status, label: STATUS_LABEL[status] }))]}
                        value={filters.status}
                        onChange={(value) => updateFilter('status', value)}
                        variant="boxed"
                    />
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <Input label="Exam ID" value={filters.examId} onChange={(event) => updateFilter('examId', event.target.value)} placeholder="Exam ID" />
                        <Input label="User ID" value={filters.userId} onChange={(event) => updateFilter('userId', event.target.value)} placeholder="User ID" />
                        <Input label="Attempt number" type="number" value={filters.attemptNumber} onChange={(event) => updateFilter('attemptNumber', event.target.value)} placeholder="Masalan: 8" />
                        <Select label="Yozuvlar" value={filters.isDeleted} onChange={(event) => updateFilter('isDeleted', event.target.value as FiltersState['isDeleted'])} options={[{ label: 'Faqat aktiv', value: 'false' }, { label: "Faqat o'chirilgan", value: 'true' }, { label: 'Hammasi', value: 'ALL' }]} />
                        <Input label="Yaratilgan sana (dan)" type="date" value={filters.createdFrom} onChange={(event) => updateFilter('createdFrom', event.target.value)} />
                        <Input label="Yaratilgan sana (gacha)" type="date" value={filters.createdTo} onChange={(event) => updateFilter('createdTo', event.target.value)} />
                        <Input label="Topshirilgan sana (dan)" type="date" value={filters.submittedFrom} onChange={(event) => updateFilter('submittedFrom', event.target.value)} />
                        <Input label="Topshirilgan sana (gacha)" type="date" value={filters.submittedTo} onChange={(event) => updateFilter('submittedTo', event.target.value)} />
                        <Input label="Overall min" type="number" step="0.5" value={filters.minOverallBand} onChange={(event) => updateFilter('minOverallBand', event.target.value)} />
                        <Input label="Overall max" type="number" step="0.5" value={filters.maxOverallBand} onChange={(event) => updateFilter('maxOverallBand', event.target.value)} />
                        <Input label="Reading min" value={filters.minReadingBand} onChange={(event) => updateFilter('minReadingBand', event.target.value)} placeholder="Min" />
                        <Input label="Reading max" value={filters.maxReadingBand} onChange={(event) => updateFilter('maxReadingBand', event.target.value)} placeholder="Max" />
                        <Input label="Listening min" value={filters.minListeningBand} onChange={(event) => updateFilter('minListeningBand', event.target.value)} placeholder="Min" />
                        <Input label="Listening max" value={filters.maxListeningBand} onChange={(event) => updateFilter('maxListeningBand', event.target.value)} placeholder="Max" />
                        <Input label="Writing min" value={filters.minWritingBand} onChange={(event) => updateFilter('minWritingBand', event.target.value)} placeholder="Min" />
                        <Input label="Writing max" value={filters.maxWritingBand} onChange={(event) => updateFilter('maxWritingBand', event.target.value)} placeholder="Max" />
                        <Input label="Speaking min" value={filters.minSpeakingBand} onChange={(event) => updateFilter('minSpeakingBand', event.target.value)} placeholder="Min" />
                        <Input label="Speaking max" value={filters.maxSpeakingBand} onChange={(event) => updateFilter('maxSpeakingBand', event.target.value)} placeholder="Max" />
                        <Select label="Reviewed" value={filters.isReviewed} onChange={(event) => updateFilter('isReviewed', event.target.value as FiltersState['isReviewed'])} options={[{ label: 'Hammasi', value: 'ALL' }, { label: 'Reviewed', value: 'true' }, { label: 'Reviewed emas', value: 'false' }]} />
                        <Select label="Sahifada" value={String(filters.limit)} onChange={(event) => updateFilter('limit', Number(event.target.value))} options={[10, 25, 50, 100].map((value) => ({ label: String(value), value }))} />
                        <Select label="Saralash" value={filters.sortBy} onChange={(event) => updateFilter('sortBy', event.target.value as FiltersState['sortBy'])} options={['createdAt', 'updatedAt', 'attemptNumber', 'overallBandScore', 'readingBandScore', 'listeningBandScore', 'writingBandScore', 'speakingBandScore', 'status'].map((value) => ({ label: value, value }))} />
                        <Select label="Tartib" value={filters.sortOrder} onChange={(event) => updateFilter('sortOrder', event.target.value as FiltersState['sortOrder'])} options={[{ label: 'Yangi yuqorida', value: 'desc' }, { label: 'Eski yuqorida', value: 'asc' }]} />
                        <div className="flex items-end">
                            <Button variant="outline" tone="danger" fullWidth Icon={X} onClick={() => setFilters(DEFAULT_FILTERS)}>
                                Tozalash
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {selected.size > 0 && (
                <Alert tone="primary" title={`${selected.size} ta attempt tanlandi`}>
                    <div className="flex flex-wrap gap-2 pt-2">
                        <Button size="sm" tone="success" Icon={RotateCcw} loading={isBulkRestoring} onClick={handleBulkRestore}>
                            Bulk restore
                        </Button>
                        <Button size="sm" tone="danger" Icon={Trash2} loading={isBulkDeleting} onClick={handleBulkDelete}>
                            Bulk delete
                        </Button>
                        <Button size="sm" variant="outline" tone="neutral" onClick={() => setSelected(new Set())}>
                            Bekor
                        </Button>
                    </div>
                </Alert>
            )}

            <Table>
                {isLoading ? (
                    <div className="space-y-3 p-5">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <Skeleton key={index} className="h-16" radius="lg" />
                        ))}
                    </div>
                ) : filteredAttempts.length === 0 ? (
                    <EmptyState Icon={FileText} title="Attempt topilmadi" description="Filterlarni o'zgartiring yoki yangi attempt yarating." action={{ children: 'Attempt yaratish', Icon: FilePlus2, onClick: () => setDialog({ type: 'create' }) }} />
                ) : (
                    <TableElement>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">
                                    <Checkbox checked={selected.size === filteredAttempts.length && filteredAttempts.length > 0} onChange={toggleAll} />
                                </TableHead>
                                {['Attempt', 'User', 'Exam', 'Yaratilgan', 'Seksiyalar', 'Band', 'Status', 'Amallar'].map((head) => (
                                    <TableHead key={head}>{head}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAttempts.map((attempt) => {
                                const user = getUser(attempt);
                                const exam = getExam(attempt);
                                const deleted = Boolean(attempt.isDeleted);
                                return (
                                    <TableRow key={attempt._id} className={deleted ? 'opacity-60' : undefined}>
                                        <TableCell>
                                            <Checkbox checked={selected.has(attempt._id)} onChange={() => toggleOne(attempt._id)} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <Badge tone="neutral" radius="md">#{attempt._id.slice(-8).toUpperCase()}</Badge>
                                                <p className="text-xs text-gray-400">Urinish #{attempt.attemptNumber ?? '-'}</p>
                                                {deleted && <Badge tone="danger" Icon={Ban}>Ochirilgan</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="font-semibold text-gray-900 dark:text-white">{user?.username || `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Nomaʼlum user'}</p>
                                                <p className="font-mono text-xs text-gray-400">{getUserId(attempt)?.slice(-10) || '-'}</p>
                                                {user?.email && <p className="max-w-44 truncate text-xs text-gray-400">{user.email}</p>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-56 space-y-1">
                                                <p className="truncate font-semibold text-gray-900 dark:text-white">{exam?.title || 'Nomaʼlum exam'}</p>
                                                <p className="font-mono text-xs text-gray-400">{getExamId(attempt)?.slice(-10) || '-'}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="font-semibold">{formatDate(attempt.createdAt)}</p>
                                                <p className="text-xs text-gray-400">{formatTime(attempt.createdAt)}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <SectionScores attempt={attempt} />
                                        </TableCell>
                                        <TableCell>
                                            {attempt.overallBandScore == null ? <span className="text-gray-400">-</span> : <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-white shadow-md">{attempt.overallBandScore}</span>}
                                        </TableCell>
                                        <TableCell>
                                            <Badge tone={STATUS_TONE[attempt.status] ?? 'neutral'} dot>{STATUS_LABEL[attempt.status] ?? attempt.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Link href={`/admin/attempts/${attempt._id}`}>
                                                    <Button size="xs" variant="ghost" tone="neutral" Icon={Eye}>View</Button>
                                                </Link>
                                                {!deleted && <Button size="xs" variant="ghost" tone="info" Icon={Edit3} onClick={() => setEditAttempt(attempt)}>Edit</Button>}
                                                {!deleted ? (
                                                    <Button size="xs" variant="ghost" tone="danger" Icon={Trash2} onClick={() => setDialog({ type: 'delete', attempt })}>Delete</Button>
                                                ) : (
                                                    <>
                                                        <Button size="xs" variant="ghost" tone="success" Icon={RotateCcw} onClick={() => setDialog({ type: 'restore', attempt })}>Restore</Button>
                                                        <Button size="xs" variant="ghost" tone="danger" Icon={Trash2} onClick={() => setDialog({ type: 'hard', attempt })}>Hard</Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </TableElement>
                )}
            </Table>

            {total > 0 && (
                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        <strong className="text-gray-900 dark:text-white">{(filters.page - 1) * filters.limit + 1}-{Math.min(filters.page * filters.limit, total)}</strong> / <strong className="text-gray-900 dark:text-white">{total}</strong>
                    </p>
                    <Pagination page={filters.page} totalPages={Math.max(totalPages, 1)} onPageChange={(page) => updateFilter('page', page)} />
                </div>
            )}

            {editAttempt && <EditDrawer attempt={editAttempt} onClose={() => setEditAttempt(null)} onSave={handleEdit} isSaving={isUpdating} />}

            <Modal
                open={dialog?.type === 'create'}
                onClose={() => setDialog(null)}
                title="Attempt yaratish"
                description="Backendda admin create endpoint yoq, shuning uchun mavjud start endpoint orqali examId bilan attempt boshlanadi."
                footer={
                    <div className="flex gap-3">
                        <Button variant="outline" tone="neutral" fullWidth onClick={() => setDialog(null)}>Bekor</Button>
                        <Button fullWidth Icon={FilePlus2} loading={isCreating} disabled={!createExamId.trim()} onClick={handleCreate}>Yaratish</Button>
                    </div>
                }
            >
                <Input label="Exam ID" value={createExamId} onChange={(event) => setCreateExamId(event.target.value)} placeholder="Exam ObjectId" required />
            </Modal>

            <Modal
                open={dialog?.type === 'delete' || dialog?.type === 'restore' || dialog?.type === 'hard'}
                onClose={() => {
                    setDialog(null);
                    setReason('');
                }}
                title={dialog?.type === 'delete' ? 'Attemptni ochirish' : dialog?.type === 'restore' ? 'Attemptni tiklash' : 'Doimiy ochirish'}
                description={dialog && 'attempt' in dialog ? `#${dialog.attempt._id.slice(-8).toUpperCase()}` : undefined}
                footer={
                    <div className="flex gap-3">
                        <Button variant="outline" tone="neutral" fullWidth onClick={() => setDialog(null)}>Bekor</Button>
                        {dialog?.type === 'delete' && <Button tone="danger" fullWidth Icon={Trash2} loading={isDeleting} onClick={handleDelete}>Ochirish</Button>}
                        {dialog?.type === 'restore' && <Button tone="success" fullWidth Icon={RotateCcw} loading={isRestoring} onClick={handleRestore}>Tiklash</Button>}
                        {dialog?.type === 'hard' && <Button tone="danger" fullWidth Icon={Trash2} loading={isHardDeleting} onClick={handleHardDelete}>Doimiy ochirish</Button>}
                    </div>
                }
            >
                <div className="space-y-4">
                    {dialog?.type === 'hard' && <Alert tone="danger" title="Ehtiyot boling">Bu amal qaytarib bolmaydi. Backend faqat oldin soft-delete qilingan attemptni hard delete qiladi.</Alert>}
                    {dialog?.type !== 'hard' && <Textarea label="Sabab" value={reason} onChange={(event) => setReason(event.target.value)} rows={3} placeholder="Ixtiyoriy sabab..." />}
                    {dialog && 'attempt' in dialog && (
                        <Card variant="soft" withCorners={false} hoverEffect={false} padding="sm">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <CalendarDays className="h-4 w-4" />
                                {formatDate(dialog.attempt.createdAt)} {formatTime(dialog.attempt.createdAt)}
                            </div>
                        </Card>
                    )}
                </div>
            </Modal>
        </div>
    );
}

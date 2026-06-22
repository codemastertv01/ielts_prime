'use client';

import { Award, BookOpen, Clock, Filter, Play, RefreshCw, Search, Star, Target, Users, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExamList } from '@/hooks/useExams';
import { DIFFICULTY_LABELS, DifficultyLevelEnum, ExamModuleEnum, ExamTypeEnum, IELTSExam, UserExamFilters } from '@/types/exam';
import FadeIn from '@/components/animations/FadeIn';
import StaggerChildren from '@/components/animations/StaggerChildren';
import { Button, Input, Pagination, Select } from '@/components/UI';

// ─── Card gradient palettes ───────────────────────────────────
const GRADIENTS = ['from-blue-700 via-blue-600 to-cyan-500', 'from-violet-700 via-purple-600 to-fuchsia-500', 'from-emerald-700 via-teal-600 to-cyan-500', 'from-rose-700 via-pink-600 to-orange-500', 'from-amber-700 via-orange-600 to-yellow-500', 'from-slate-700 via-slate-600 to-blue-600'];

const DIFFICULTY_STYLES: Record<string, string> = {
    BAND_4_5: 'text-emerald-300 bg-emerald-500/20 ring-1 ring-emerald-500/40',
    BAND_5_6: 'text-sky-300 bg-sky-500/20 ring-1 ring-sky-500/40',
    BAND_6_7: 'text-amber-300 bg-amber-500/20 ring-1 ring-amber-500/40',
    BAND_7_8: 'text-orange-300 bg-orange-500/20 ring-1 ring-orange-500/40',
    BAND_8_9: 'text-red-300 bg-red-500/20 ring-1 ring-red-500/40',
};

const SECTION_DOTS: Array<{ key: keyof IELTSExam; label: string; color: string }> = [
    { key: 'readingSection', label: 'R', color: 'bg-sky-300' },
    { key: 'listeningSection', label: 'L', color: 'bg-emerald-300' },
    { key: 'writingSection', label: 'W', color: 'bg-amber-300' },
    { key: 'speakingSection', label: 'S', color: 'bg-rose-300' },
];

// ─── Skeleton ─────────────────────────────────────────────────
const ExamCardSkeleton = () => (
    <div className="rounded-2xl overflow-hidden bg-gray-200/70 border border-gray-200 animate-pulse dark:bg-white/5 dark:border-white/10">
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-xl bg-gray-300 dark:bg-white/10" />
                <div className="w-20 h-6 rounded-full bg-gray-300 dark:bg-white/10" />
            </div>
            <div className="space-y-2 pt-2">
                <div className="w-3/4 h-5 rounded bg-gray-300 dark:bg-white/10" />
                <div className="w-full h-4 rounded bg-gray-300 dark:bg-white/10" />
                <div className="w-2/3 h-4 rounded bg-gray-300 dark:bg-white/10" />
            </div>
            <div className="flex gap-3 pt-2">
                <div className="w-16 h-4 rounded bg-gray-300 dark:bg-white/10" />
                <div className="w-20 h-4 rounded bg-gray-300 dark:bg-white/10" />
            </div>
            <div className="flex justify-between items-center pt-1">
                <div className="flex gap-1.5">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-gray-300 dark:bg-white/10" />
                    ))}
                </div>
                <div className="w-24 h-9 rounded-xl bg-gray-300 dark:bg-white/10" />
            </div>
        </div>
    </div>
);

// ─── Exam Card ────────────────────────────────────────────────
interface ExamCardProps {
    exam: IELTSExam;
    index: number;
    onStart: (id: string) => void;
}

const ExamCard = ({ exam, index, onStart }: ExamCardProps) => {
    const [pressed, setPressed] = useState(false);
    const grad = GRADIENTS[index % GRADIENTS.length];
    const diff = exam.difficulty ?? 'INTERMEDIATE';
    const rating = exam.averageRating > 0 ? exam.averageRating.toFixed(1) : null;

    return (
        <div onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)} onMouseLeave={() => setPressed(false)} className={`group relative rounded-2xl overflow-hidden cursor-pointer border border-white/10 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/40 hover:border-white/20 ${pressed ? 'scale-[0.98]' : 'scale-100'}`}>
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${grad} opacity-90`} />

            {/* Noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

            {/* Shine */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent pointer-events-none" />

            {/* Hover glow pulse */}
            <div className="absolute -inset-1 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-white rounded-2xl blur-xl pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 p-5 flex flex-col gap-4">
                {/* Top row: icon + badges */}
                <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shrink-0 ring-1 ring-white/30">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                        {exam.isPremium && (
                            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 ring-1 ring-amber-400/40 px-2 py-0.5 rounded-full">
                                <Award className="w-3 h-3" /> Pro
                            </span>
                        )}
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY_STYLES[diff] ?? DIFFICULTY_STYLES.BAND_6_7}`}>{DIFFICULTY_LABELS[diff] ?? diff}</span>
                    </div>
                </div>

                {/* Title + description */}
                <div className="flex-1 min-h-[64px]">
                    <h3 className="text-[15px] font-bold text-white leading-snug tracking-tight line-clamp-2 mb-1.5">{exam.title}</h3>
                    {exam.description && <p className="text-[13px] text-white/65 leading-relaxed line-clamp-2">{exam.description}</p>}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 text-[12px] text-white/70 font-medium">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 opacity-70" />
                        {exam.totalTimeLimitMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 opacity-70" />
                        {exam.totalAttempts.toLocaleString()}
                    </span>
                    {rating && (
                        <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-current text-amber-300 opacity-90" />
                            {rating}
                        </span>
                    )}
                    {exam.module && <span className="ml-auto text-[11px] font-bold uppercase tracking-widest text-white/45 bg-white/10 px-1.5 py-0.5 rounded">{exam.module === 'GENERAL' ? 'GT' : exam.module}</span>}
                </div>

                {/* Divider */}
                <div className="h-px bg-white/15" />

                {/* Bottom: section dots + CTA */}
                <div className="flex items-center justify-between">
                    {/* Section indicator dots */}
                    <div className="flex items-center gap-1.5">
                        {SECTION_DOTS.map(({ key, label, color }) => (exam[key] ? <div key={key} title={label} className={`w-2 h-2 rounded-full ${color} opacity-80`} /> : <div key={key} className="w-2 h-2 rounded-full bg-white/15" />))}
                        <span className="ml-1 text-[11px] text-white/40 font-medium">{SECTION_DOTS.filter((s) => exam[s.key]).length} sections</span>
                    </div>

                    {/* Start button */}
                    <Button unstyled onClick={() => onStart(exam._id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-gray-900 dark:bg-gray-950/85 dark:text-white text-[13px] font-bold transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-900 hover:scale-105 active:scale-95 shadow-lg shadow-black/20 ring-1 ring-white/50 dark:ring-white/20">
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Start
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ─── Empty state ──────────────────────────────────────────────
const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center dark:bg-white/5 dark:border-white/10">
            <Target className="w-8 h-8 text-gray-400 dark:text-white/30" />
        </div>
        <div className="text-center">
            <p className="text-gray-600 dark:text-white/60 font-medium">No exams available yet</p>
            <p className="text-gray-400 dark:text-white/30 text-sm mt-1">Check back soon</p>
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────
const MockList = () => {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<UserExamFilters>({
        page: 1,
        limit: 9,
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters((current) => ({ ...current, search: search.trim() || undefined, page: 1 }));
        }, 350);
        return () => clearTimeout(timer);
    }, [search]);

    const { exams, isLoading, isFetching, totalCount, page, totalPages, refetch } = useExamList(filters);

    const startTest = (id: string) => router.push(`/dashboard/exam/${id}`);
    const updateFilter = <K extends keyof UserExamFilters>(key: K, value: UserExamFilters[K]) => {
        const normalizedValue = value === '' || value === null ? undefined : value;
        setFilters((current) => ({ ...current, [key]: normalizedValue, page: key === 'page' ? (value as number) : 1 }));
    };
    const resetFilters = () => {
        setSearch('');
        setFilters({ page: 1, limit: 9, sortBy: 'createdAt', sortOrder: 'desc' });
    };
    const activeFilterCount = [filters.examType, filters.module, filters.difficulty, filters.isPremium !== undefined ? String(filters.isPremium) : ''].filter(Boolean).length;

    return (
        <StaggerChildren stagger={0.08}>
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="flex items-end justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Full Mock Tests</h1>
                        <p className="text-sm text-gray-500 dark:text-white/40 mt-0.5 font-medium">{isLoading ? 'Loading…' : `${totalCount} test${totalCount !== 1 ? 's' : ''} available`}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button unstyled onClick={() => refetch()} disabled={isFetching} className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white" aria-label="Refresh exams">
                            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button unstyled onClick={() => setShowFilters((open) => !open)} className={`flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${showFilters || activeFilterCount > 0 ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-400/40 dark:bg-blue-500/20 dark:text-blue-200' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'}`}>
                            <Filter className="h-4 w-4" /> Filters
                            {activeFilterCount > 0 && <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] text-white">{activeFilterCount}</span>}
                        </Button>
                        {!isLoading && exams.length > 0 && (
                            <span className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400 sm:flex">
                                <Zap className="w-3.5 h-3.5" />
                                {exams.length} shown
                            </span>
                        )}
                    </div>
                </div>

                <div className="mb-5 space-y-3">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input unstyled value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by test name or description..." className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400/70" />
                        {search && (
                            <Button unstyled onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-900 dark:hover:text-white" aria-label="Clear search">
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {showFilters && (
                        <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4 dark:border-gray-700 dark:bg-gray-900">
                            <Select unstyled value={filters.examType ?? ''} onChange={(event) => updateFilter('examType', event.target.value as UserExamFilters['examType'])} className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-blue-400 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200">
                                <option value="">All test types</option>
                                {Object.entries(ExamTypeEnum).map(([label, value]) => (
                                    <option key={value} value={value}>
                                        {label.replaceAll('_', ' ')}
                                    </option>
                                ))}
                            </Select>
                            <Select unstyled value={filters.module ?? ''} onChange={(event) => updateFilter('module', event.target.value as UserExamFilters['module'])} className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-blue-400 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200">
                                <option value="">All modules</option>
                                {Object.values(ExamModuleEnum).map((value) => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </Select>
                            <Select unstyled value={filters.difficulty ?? ''} onChange={(event) => updateFilter('difficulty', event.target.value as UserExamFilters['difficulty'])} className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-blue-400 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200">
                                <option value="">All difficulty levels</option>
                                {Object.values(DifficultyLevelEnum).map((value) => (
                                    <option key={value} value={value}>
                                        {DIFFICULTY_LABELS[value]}
                                    </option>
                                ))}
                            </Select>
                            <Select unstyled value={filters.isPremium === undefined ? '' : String(filters.isPremium)} onChange={(event) => updateFilter('isPremium', event.target.value === '' ? undefined : event.target.value === 'true')} className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-blue-400 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200">
                                <option value="">Free and premium</option>
                                <option value="false">Free tests</option>
                                <option value="true">Premium tests</option>
                            </Select>
                            <Select
                                value={`${filters.sortBy ?? 'createdAt'}:${filters.sortOrder ?? 'desc'}`}
                                onChange={(event) => {
                                    const [sortBy, sortOrder] = event.target.value.split(':');
                                    setFilters((current) => ({ ...current, sortBy, sortOrder: sortOrder as UserExamFilters['sortOrder'], page: 1 }));
                                }}
                                unstyled
                                className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-blue-400 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
                            >
                                <option value="createdAt:desc">Newest first</option>
                                <option value="createdAt:asc">Oldest first</option>
                                <option value="totalAttempts:desc">Most attempted</option>
                                <option value="averageRating:desc">Top rated</option>
                                <option value="totalTimeLimitMinutes:asc">Shortest first</option>
                            </Select>
                            <Select unstyled value={filters.limit ?? 9} onChange={(event) => updateFilter('limit', Number(event.target.value))} className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-blue-400 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200">
                                <option value={5}>5 per page</option>
                                <option value={10}>10 per page</option>
                                <option value={15}>15 per page</option>
                                <option value={20}>20 per page</option>
                            </Select>
                            <Button unstyled onClick={resetFilters} className="h-9 rounded-xl border border-red-400/20 bg-red-500/10 px-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20">
                                Reset filters
                            </Button>
                        </div>
                    )}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {isLoading ? (
                        [...Array(6)].map((_, i) => <ExamCardSkeleton key={i} />)
                    ) : exams.length === 0 ? (
                        <EmptyState />
                    ) : (
                        exams.map((exam, index) => (
                            <FadeIn key={exam._id} delay={index * 0.05}>
                                <ExamCard exam={exam} index={index} onStart={startTest} />
                            </FadeIn>
                        ))
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="mt-7 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                        <p className="mb-3 text-center text-xs text-gray-400 dark:text-white/40">
                            Page {page} of {totalPages} · {totalCount} tests
                        </p>
                        <Pagination page={page} totalPages={totalPages} onPageChange={(nextPage) => updateFilter('page', nextPage)} className="[&_button]:!border-gray-200 [&_button]:!text-gray-600 [&_button:hover]:!bg-gray-100 dark:[&_button]:!border-gray-700 dark:[&_button]:!text-gray-300 dark:[&_button:hover]:!bg-gray-800" />
                    </div>
                )}
            </div>
        </StaggerChildren>
    );
};

export default MockList;

'use client';
/* eslint-disable @typescript-eslint/no-explicit-any, react/no-unescaped-entities */
import Link from 'next/link';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Award, BookOpen, CheckCircle, ChevronDown, ChevronUp, Clock, Edit, FileText, Globe, Headphones, History, Loader2, PenLine, Play, RotateCcw, Shield, Star, Tag, Trash2, Users, XCircle } from 'lucide-react';
import { useAdminExam, useAdminExamStats } from '@/hooks/useAdminExams';
import type { IELTSExam } from '@/types/exam';
import { fmtDate } from '@/utils/exam';
import DeleteModal from '../components/DeleteModal';

// ─── Collapsible ──────────────────────────────────────────────

const Collapsible = ({ title, icon, badge, children, defaultOpen = false }: any) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-3">
                    {icon}
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{title}</span>
                    {badge !== undefined && <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">{badge}</span>}
                </div>
                {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="p-5">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Section details ──────────────────────────────────────────

const ReadingDetail = ({ section }: { section: any }) => (
    <div className="space-y-5">
        <div className="grid grid-cols-3 gap-4">
            {[
                { label: 'Questionlar', value: section.totalQuestions },
                { label: 'Balllar', value: section.totalPoints },
                { label: 'Time', value: `${section.timeLimitMinutes} minutes` },
            ].map((item, i) => (
                <div key={i} className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                    <p className="text-blue-600 dark:text-blue-400 text-xs font-semibold mb-1">{item.label}</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{item.value}</p>
                </div>
            ))}
        </div>
        {section.passages?.map((p: any) => (
            <div key={p.passageNumber} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                        Passage {p.passageNumber}: {p.title}
                    </h4>
                    <div className="flex gap-3 text-xs text-gray-500">
                        <span>{p.wordCount} words</span>
                        <span>{p.questions?.length} question</span>
                    </div>
                </div>
                <div className="p-4 space-y-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-800 p-3 rounded-lg line-clamp-4">{p.content}</p>
                    {p.keywords?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {p.keywords.map((k: string, i: number) => (
                                <span key={i} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
                                    {k}
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="space-y-2">
                        {p.questions?.map((q: any) => (
                            <div key={q.questionNumber} className="flex gap-3 text-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3">
                                <span className="font-bold text-gray-400 text-xs shrink-0 pt-0.5">Q{q.questionNumber}</span>
                                <div className="flex-1">
                                    <p className="text-gray-800 dark:text-gray-200">{q.question}</p>
                                    <div className="flex gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                                        <span className="text-blue-600 dark:text-blue-400">{q.type?.replace(/_/g, ' ')}</span>
                                        <span className="text-emerald-600 font-semibold">✓ {q.correctAnswer}</span>
                                        <span>{q.points} band</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const ListeningDetail = ({ section }: { section: any }) => (
    <div className="space-y-5">
        <div className="grid grid-cols-4 gap-3">
            {[
                { label: 'Questionlar', value: section.totalQuestions },
                { label: 'Balllar', value: section.totalPoints },
                { label: 'Time', value: `${section.timeLimitMinutes} minutes` },
                { label: "Duplicate", value: `${section.transferTimeMinutes} minutes` },
            ].map((item, i) => (
                <div key={i} className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3">
                    <p className="text-purple-600 dark:text-purple-400 text-xs font-semibold mb-1">{item.label}</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{item.value}</p>
                </div>
            ))}
        </div>
        {section.parts?.map((part: any) => (
            <div key={part.partNumber} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="bg-purple-50 dark:bg-purple-900/15 px-4 py-3 flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                        Part {part.partNumber}: {part.title}
                    </h4>
                    <span className="text-xs text-gray-500">{part.questions?.length} question</span>
                </div>
                <div className="p-4 space-y-3">
                    {part.audioUrl && <audio controls src={part.audioUrl} className="w-full h-10" />}
                    {part.context && <p className="text-xs text-gray-500 italic">Context: {part.context}</p>}
                    {part.transcript && (
                        <details className="text-sm">
                            <summary className="cursor-pointer text-purple-600 text-xs font-semibold">View transcript</summary>
                            <p className="mt-2 text-gray-600 dark:text-gray-400 font-mono text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded-lg whitespace-pre-wrap">{part.transcript}</p>
                        </details>
                    )}
                    <div className="space-y-2">
                        {part.questions?.map((q: any) => (
                            <div key={q.questionNumber} className="flex gap-3 text-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3">
                                <span className="font-bold text-gray-400 text-xs shrink-0 pt-0.5">Q{q.questionNumber}</span>
                                <div>
                                    <p className="text-gray-800 dark:text-gray-200">{q.question}</p>
                                    <div className="flex gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                                        <span className="text-purple-600">{q.type?.replace(/_/g, ' ')}</span>
                                        <span className="text-emerald-600 font-semibold">✓ {q.correctAnswer}</span>
                                        {(q.timestampStart || q.timestampEnd) && (
                                            <span>
                                                ⏱ {q.timestampStart}s–{q.timestampEnd}s
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const WritingDetail = ({ section }: { section: any }) => (
    <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
                <p className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">Tasklar</p>
                <p className="text-2xl font-black">{section.tasks?.length}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
                <p className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">Time</p>
                <p className="text-2xl font-black">{section.timeLimitMinutes} minutes</p>
            </div>
        </div>
        {section.tasks?.map((task: any) => (
            <div key={task.taskNumber} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="bg-emerald-50 dark:bg-emerald-900/15 px-4 py-3 flex items-center justify-between">
                    <h4 className="font-semibold">
                        Task {task.taskNumber} — {task.type?.replace(/_/g, ' ')}
                    </h4>
                    <div className="flex gap-3 text-xs text-gray-500">
                        <span>Min {task.minimumWords} words</span>
                        <span>{task.suggestedTimeMinutes} minutes</span>
                    </div>
                </div>
                <div className="p-4 space-y-3">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Task contenti:</p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">{task.prompt}</p>
                    </div>
                    {task.imageUrl && <img src={task.imageUrl} alt="chart" className="max-h-48 rounded-xl border border-gray-200" />}
                    {task.secondImageUrl && <img src={task.secondImageUrl} alt="chart2" className="max-h-48 rounded-xl border border-gray-200" />}
                    {task.sampleAnswer && (
                        <details>
                            <summary className="cursor-pointer text-emerald-600 text-xs font-semibold">View sample answer</summary>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">{task.sampleAnswer}</p>
                        </details>
                    )}
                </div>
            </div>
        ))}
    </div>
);

// ─── Main ─────────────────────────────────────────────────────

export default function ExamDetailPage() {
    const params = useParams<{ id: string }>();
    const examId = params?.id ?? '';
    const router = useRouter();

    const { exam, isLoading, softDelete, publish, unpublish, restore, isDeleting, isPublishing } = useAdminExam(examId, true);
    const { data: examStats } = useAdminExamStats(examId);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'sections' | 'history' | 'audit'>('overview');

    if (isLoading)
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    if (!exam) return <div className="flex items-center justify-center h-screen text-gray-500">No exams found</div>;

    const handleDelete = () => {
        softDelete(undefined, {
            onSuccess: () => router.push('/admin/exams'),
        });
    };

    const TABS = [
        { id: 'overview', label: 'Umumiy', icon: <FileText className="w-4 h-4" /> },
        { id: 'sections', label: "Sectionlar", icon: <BookOpen className="w-4 h-4" /> },
        { id: 'history', label: 'History', icon: <History className="w-4 h-4" />, badge: exam.updateHistory?.length ?? 0 },
        { id: 'audit', label: 'Audit', icon: <Shield className="w-4 h-4" />, badge: exam.auditLog?.length ?? 0 },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <button onClick={() => router.push('/admin/exams')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to exams
                    </button>
                    <div className="flex gap-2 flex-wrap">
                        {exam.isDeleted ? (
                            <button onClick={() => restore()} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors">
                                <RotateCcw className="w-4 h-4" /> Restore
                            </button>
                        ) : (
                            <>
                                <Link href={`/admin/exams/${exam._id}/preview`}>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors">
                                        <Play className="w-4 h-4" /> Preview
                                    </button>
                                </Link>
                                <button onClick={() => (exam.isPublished ? unpublish() : publish())} disabled={isPublishing} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 ${exam.isPublished ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                                    {exam.isPublished ? (
                                        <>
                                            <XCircle className="w-4 h-4" /> Unpublish
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" /> Published qilish
                                        </>
                                    )}
                                </button>
                                <Link href={`/admin/exams/${exam._id}/edit`}>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors">
                                        <Edit className="w-4 h-4" /> Edit
                                    </button>
                                </Link>
                                <button onClick={() => setShowDeleteModal(true)} disabled={isDeleting} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Main info card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-start justify-between mb-5">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{exam.title}</h1>
                                {exam.isDeleted && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">O'CHIRILGAN</span>}
                            </div>
                            {exam.description && <p className="text-gray-500 dark:text-gray-400">{exam.description}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-4">
                            {exam.isPublished ? <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 rounded-full text-sm font-semibold">Published</span> : <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm font-semibold">Draft</span>}
                            {exam.isPremium && <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded-full text-sm font-semibold">Premium — {exam.price?.toLocaleString()} UZS</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                        {[
                            { label: 'Type', value: exam.examType?.replace(/_/g, ' '), icon: <Globe className="w-4 h-4 text-blue-500" /> },
                            { label: 'Module', value: exam.module, icon: <BookOpen className="w-4 h-4 text-emerald-500" /> },
                            { label: 'Difficulty', value: exam.difficulty, icon: <Award className="w-4 h-4 text-orange-500" /> },
                            { label: 'Time', value: `${exam.totalTimeLimitMinutes} min`, icon: <Clock className="w-4 h-4 text-purple-500" /> },
                            { label: "O'tish band", value: `Band ${exam.passingScore}`, icon: <Star className="w-4 h-4 text-yellow-500" /> },
                            { label: 'Status', value: exam.status ?? '—', icon: <Shield className="w-4 h-4 text-blue-500" /> },
                        ].map((item, i) => (
                            <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                    {item.icon}
                                    <span className="text-xs text-gray-500">{item.label}</span>
                                </div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    {exam.tags?.length > 0 && (
                        <div className="flex items-center gap-2 mt-4">
                            <Tag className="w-4 h-4 text-gray-400" />
                            <div className="flex flex-wrap gap-1.5">
                                {exam.tags.map((t: string, i: number) => (
                                    <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full font-medium">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: 'Attempts', value: exam.totalAttempts, color: 'from-blue-500 to-blue-600', icon: <Users className="w-5 h-5" /> },
                        { label: 'Completed', value: exam.completedAttempts, color: 'from-emerald-500 to-emerald-600', icon: <CheckCircle className="w-5 h-5" /> },
                        { label: "Intermediatecha reyting", value: `${exam.averageRating?.toFixed(1)} ★`, color: 'from-yellow-500 to-yellow-600', icon: <Star className="w-5 h-5" /> },
                        { label: 'Ratinglar', value: exam.totalRatings, color: 'from-purple-500 to-purple-600', icon: <Eye className="w-5 h-5" /> },
                    ].map((s, i) => (
                        <div key={i} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white`}>
                            <div className="flex items-center justify-between mb-2 opacity-80">
                                {s.icon}
                                <span className="text-xs font-semibold">{s.label}</span>
                            </div>
                            <p className="text-3xl font-black">{s.value}</p>
                        </div>
                    ))}
                </div>
                {examStats && (
                    <p className="text-right text-xs font-medium text-gray-400">
                        Completion rate: {examStats.statistics.completionRate} · {examStats.statistics.totalQuestions} question · {examStats.statistics.totalPoints} band
                    </p>
                )}

                {/* Tabs */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="border-b border-gray-200 dark:border-gray-700 px-6">
                        <nav className="flex gap-1">
                            {TABS.map((tab) => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 py-4 px-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                                    {tab.icon} {tab.label}
                                    {(tab as any).badge > 0 && <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full px-1.5 py-0.5">{(tab as any).badge}</span>}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && (
                                <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Creator</h3>
                                        {exam.createdBy ? (
                                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                {[
                                                    ['User', (exam.createdBy as any).username ?? (exam.createdBy as any).userId],
                                                    ['Email', (exam.createdBy as any).email ?? '—'],
                                                    ['IP', (exam.createdBy as any).ipAddress ?? '—'],
                                                    ['Time', fmtDate((exam.createdBy as any).timestamp)],
                                                ].map(([label, value]) => (
                                                    <div key={String(label)}>
                                                        <p className="text-xs text-gray-500">{label}</p>
                                                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-xs mt-0.5 break-all">{String(value)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400">No information</p>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Dates</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                            {[
                                                ['Created', fmtDate(exam.createdAt)],
                                                ['Updated', fmtDate(exam.updatedAt)],
                                                ['Published', fmtDate(exam.publishedAt)],
                                                ['Available from', fmtDate(exam.availableFrom)],
                                                ['Available until', fmtDate(exam.availableUntil)],
                                            ].map(([k, v]) => (
                                                <div key={String(k)} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                                                    <p className="text-xs text-gray-500 mb-1">{k}</p>
                                                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-xs">{String(v)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {exam.metadata && (
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Metadata</h3>
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                {[
                                                    ['Total questionlar', exam.metadata.totalQuestions],
                                                    ['Total bandlar', exam.metadata.totalPoints],
                                                    ['Hisoblangan', fmtDate((exam.metadata as any).lastComputedAt)],
                                                ].map(([k, v]) => (
                                                    <div key={String(k)} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                                                        <p className="text-xs text-gray-500 mb-1">{k}</p>
                                                        <p className="font-bold text-gray-800 dark:text-gray-200">{String(v)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'sections' && (
                                <motion.div key="sections" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                    {exam.readingSection?.isEnabled && (
                                        <Collapsible title="Reading Section" defaultOpen icon={<BookOpen className="w-5 h-5 text-blue-500" />} badge={`${exam.readingSection.totalQuestions} question`}>
                                            <ReadingDetail section={exam.readingSection} />
                                        </Collapsible>
                                    )}
                                    {exam.listeningSection?.isEnabled && (
                                        <Collapsible title="Listening Section" icon={<Headphones className="w-5 h-5 text-purple-500" />} badge={`${exam.listeningSection.totalQuestions} question`}>
                                            <ListeningDetail section={exam.listeningSection} />
                                        </Collapsible>
                                    )}
                                    {exam.writingSection?.isEnabled && (
                                        <Collapsible title="Writing Section" icon={<PenLine className="w-5 h-5 text-emerald-500" />} badge={`${exam.writingSection.tasks?.length} task`}>
                                            <WritingDetail section={exam.writingSection} />
                                        </Collapsible>
                                    )}
                                    {!exam.readingSection?.isEnabled && !exam.listeningSection?.isEnabled && !exam.writingSection?.isEnabled && !exam.speakingSection?.isEnabled && <div className="text-center py-14 text-gray-400">Sectionlar sozlanmagan</div>}
                                </motion.div>
                            )}

                            {activeTab === 'history' && (
                                <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Field change history</h3>
                                    {exam.updateHistory?.length ? (
                                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                                            {[...exam.updateHistory].reverse().map((entry, i) => (
                                                <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border-l-4 border-blue-400">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{entry.fieldName}</span>
                                                        <span className="text-xs text-gray-400">{fmtDate(entry.changedAt)}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-xs text-gray-500">Previous</span>
                                                            <pre className="font-mono text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-2 rounded-lg mt-1 break-all whitespace-pre-wrap overflow-auto max-h-24">{JSON.stringify(entry.oldValue, null, 2)}</pre>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs text-gray-500">Next</span>
                                                            <pre className="font-mono text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-2 rounded-lg mt-1 break-all whitespace-pre-wrap overflow-auto max-h-24">{JSON.stringify(entry.newValue, null, 2)}</pre>
                                                        </div>
                                                    </div>
                                                    {entry.changedBy && <p className="text-xs text-gray-400 mt-2">Who: {entry.changedBy}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-14 text-gray-400">
                                            <History className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                            <p>No history</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'audit' && (
                                <motion.div key="audit" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Audit jurnali</h3>
                                    {exam.auditLog?.length ? (
                                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                                            {[...exam.auditLog].reverse().map((log, i) => (
                                                <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border-l-4 border-emerald-400">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{log.action}</p>
                                                            {log.description && <p className="text-sm text-gray-500 mt-0.5">{log.description}</p>}
                                                            {log.performedBy && <p className="text-xs text-gray-400 mt-1">Who: {log.performedBy}</p>}
                                                        </div>
                                                        <span className="text-xs text-gray-400 shrink-0 ml-4">{fmtDate(log.timestamp)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-14 text-gray-400">
                                            <Shield className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                            <p>Audit jurnali empty</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {showDeleteModal && <DeleteModal exam={exam as IELTSExam} onConfirm={handleDelete} onCancel={() => setShowDeleteModal(false)} />}
        </div>
    );
}

// Need Eye icon
const Eye = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

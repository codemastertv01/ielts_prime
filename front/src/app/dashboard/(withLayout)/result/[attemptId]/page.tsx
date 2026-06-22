'use client';
import { attemptAPI } from '@/services/attemptAPI';
import { IELTSExamAttempt, PopulatedExam } from '@/types/attempt.types';
import { Alert, Badge, Button, Card, Skeleton } from '@/components/UI';
import { AlertCircle, ArrowLeft, BookOpen, BookOpenCheck, CheckCircle2, ChevronDown, ChevronUp, Clock, Headphones, Loader2, Mic, Minus, PenLine, RotateCcw, XCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EntityStatusEnum } from '@/types/entity.status';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bandColor(band: number | undefined | null): string {
    if (!band) return 'text-gray-400 dark:text-gray-500';
    if (band >= 8) return 'text-emerald-600 dark:text-emerald-400';
    if (band >= 7) return 'text-blue-600 dark:text-blue-400';
    if (band >= 6) return 'text-violet-600 dark:text-violet-400';
    if (band >= 5) return 'text-amber-500 dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
}

function bandBg(band: number | undefined | null): string {
    if (!band) return 'bg-gray-100 text-gray-400 ring-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:ring-gray-700';
    if (band >= 8) return 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800';
    if (band >= 7) return 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-800';
    if (band >= 6) return 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-800';
    if (band >= 5) return 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800';
    return 'bg-red-50 text-red-600 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-800';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Overall band score circle
function BandCircle({ band, label }: { band: number | null | undefined; label: string }) {
    const color = band ? (band >= 8 ? '#16a34a' : band >= 7 ? '#2563eb' : band >= 6 ? '#7c3aed' : band >= 5 ? '#d97706' : '#dc2626') : '#9ca3af';

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-md" style={{ background: color }}>
                <span className="text-3xl font-extrabold text-white">{band ?? '—'}</span>
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">{label}</p>
        </div>
    );
}

// Section band card
function SectionBandCard({ icon: Icon, label, band, color }: { icon: React.ElementType; label: string; band: number | undefined | null; color: string }) {
    const pct = band ? Math.round((band / 9) * 100) : 0;
    return (
        <Card variant="default" padding="sm" radius="lg" hoverEffect={false} withCorners={false} className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</span>
                </div>
                <span className={`text-lg font-extrabold ${bandColor(band)}`}>{band ?? '—'}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-800">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color.includes('blue') ? '#2563eb' : color.includes('emerald') ? '#16a34a' : color.includes('violet') ? '#7c3aed' : color.includes('rose') ? '#e11d48' : '#d97706' }} />
            </div>
        </Card>
    );
}

// Criteria scores (writing / speaking)
function CriteriaRow({ label, score }: { label: string; score: number | undefined }) {
    const pct = score != null ? Math.round((score / 9) * 100) : 0;
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">{label}</span>
                <span className={`font-bold ${bandColor(score)}`}>{score ?? '—'}</span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-800">
                <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

// Collapsible section wrapper
function CollapsibleSection({ title, icon: Icon, iconBg, badge, children, defaultOpen = false }: { title: string; icon: React.ElementType; iconBg: string; badge?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <Card variant="default" padding="none" radius="lg" hoverEffect={false} withCorners={false} className="overflow-hidden">
            <Button unstyled onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</span>
                    {badge}
                </div>
                {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </Button>
            {open && <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800">{children}</div>}
        </Card>
    );
}

// Q&A row for reading/listening
function AnswerRow({ num, question, userAnswer, correctAnswer, isCorrect }: { num: number; question?: string; userAnswer: string | undefined; correctAnswer?: string; isCorrect: boolean | undefined | null }) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 dark:border-gray-800">
            <div
                className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5
                ${isCorrect === true ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : isCorrect === false ? 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-300' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}
            >
                {num}
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
                {question && <p className="text-xs text-gray-500 leading-relaxed dark:text-gray-400">{question}</p>}
                <div className="flex flex-wrap gap-2 items-center">
                    <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full
                        ${isCorrect === true ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : isCorrect === false ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}
                    >
                        {userAnswer || '(no answer)'}
                    </span>
                    {isCorrect === false && correctAnswer && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                            → <span className="font-semibold text-emerald-600">{correctAnswer}</span>
                        </span>
                    )}
                </div>
            </div>
            <div className="shrink-0 mt-0.5">{isCorrect === true ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : isCorrect === false ? <XCircle className="w-4 h-4 text-red-400" /> : <Minus className="w-4 h-4 text-gray-300" />}</div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResultPage() {
    const params = useParams<{ attemptId: string }>();
    const router = useRouter();
    const attemptId = params?.attemptId ?? '';

    const [result, setResult] = useState<IELTSExamAttempt | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!attemptId) return;
        attemptAPI
            .getById(attemptId)
            .then((data) => setResult(data))
            .catch(() => router.push('/dashboard/mocklist'))
            .finally(() => setLoading(false));
    }, [attemptId, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950 sm:px-6">
                <div className="mx-auto max-w-7xl space-y-5">
                    <Skeleton className="h-16 w-full" radius="lg" />
                    <Skeleton className="h-64 w-full" radius="lg" />
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton key={index} className="h-28 w-full" radius="lg" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }
    if (!result) return null;

    const exam = typeof result.examId === 'object' ? (result.examId as PopulatedExam) : null;
    const examId = exam?._id ?? (result.examId as string);

    const isGraded = result.status === EntityStatusEnum.GRADED;
    const isGrading = result.status === EntityStatusEnum.GRADING;

    const duration = result.submittedAt && result.startedAt ? Math.round((new Date(result.submittedAt).getTime() - new Date(result.startedAt).getTime()) / 60_000) : null;

    // Reading correct count
    const readingCorrect = result.readingAnswers?.filter((a) => a.isCorrect).length ?? 0;
    const readingTotal = result.readingAnswers?.length ?? 0;

    // Listening correct count
    const listeningCorrect = result.listeningAnswers?.filter((a) => a.isCorrect).length ?? 0;
    const listeningTotal = result.listeningAnswers?.length ?? 0;

    const sections = [
        { key: 'listening', icon: Headphones, label: 'Listening', band: result.listeningBandScore, color: 'bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300' },
        { key: 'reading', icon: BookOpenCheck, label: 'Reading', band: result.readingBandScore, color: 'bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300' },
        { key: 'writing', icon: PenLine, label: 'Writing', band: result.writingBandScore, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300' },
        { key: 'speaking', icon: Mic, label: 'Speaking', band: result.speakingBandScore, color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300' },
    ].filter((s) => {
        if (s.key === 'listening') return (result.listeningAnswers?.length ?? 0) > 0;
        if (s.key === 'reading') return (result.readingAnswers?.length ?? 0) > 0;
        if (s.key === 'writing') return (result.writingAnswers?.length ?? 0) > 0;
        if (s.key === 'speaking') return (result.speakingAnswers?.length ?? 0) > 0;
        return false;
    });

    return (
        <div className="bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95 sm:px-6">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                    <Button variant="ghost" tone="neutral" size="sm" Icon={ArrowLeft} onClick={() => router.push('/dashboard')}>
                        Back
                    </Button>
                    <span className="min-w-0 truncate text-sm font-semibold text-gray-700 dark:text-gray-200">{exam?.title ?? 'IELTS Mock Test'}</span>
                    <Badge tone="neutral" size="sm">
                        Attempt #{result.attemptNumber}
                    </Badge>
                </div>
            </div>

            <div className="mx-auto max-w-7xl space-y-6 py-6 lg:py-8">
                {/* ── Hero: status + overall band ── */}
                <Card variant="default" padding="lg" radius="lg" hoverEffect={false} withCorners={false} className="space-y-5 text-center">
                    <div>
                        {isGraded ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Graded
                            </span>
                        ) : isGrading ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Under Review
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-800">
                                <AlertCircle className="w-3.5 h-3.5" /> Submitted
                            </span>
                        )}
                    </div>

                    <BandCircle band={result.overallBandScore} label="Overall Band Score" />

                    {/* Meta info row */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 dark:text-gray-500">
                        {duration != null && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> {duration} min
                            </span>
                        )}
                        <span>
                            {result.submittedAt
                                ? new Date(result.submittedAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                  })
                                : '—'}
                        </span>
                        <span>
                            {sections.length} section{sections.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {!isGraded && <p className="mx-auto max-w-md text-xs text-gray-400 dark:text-gray-500">{isGrading ? 'Writing & Speaking are being reviewed by our instructors. Band scores will appear here once graded.' : 'Your answers have been submitted. Results will appear shortly.'}</p>}
                </Card>

                {/* ── Section Band Cards ── */}
                {!isGraded && (
                    <Alert tone={isGrading ? 'warning' : 'info'} title={isGrading ? 'Instructor review in progress' : 'Result processing'}>
                        {isGrading ? 'Writing and speaking are being reviewed. Their band scores will appear here once grading is complete.' : 'Your submitted answers are being processed. Results will appear shortly.'}
                    </Alert>
                )}

                {sections.length > 0 && (
                    <div>
                        <p className="mb-3 px-1 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Section Scores</p>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {sections.map((s) => (
                                <SectionBandCard key={s.key} icon={s.icon} label={s.label} band={s.band} color={s.color} />
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Listening Answers ── */}
                <div className="grid items-start gap-4 xl:grid-cols-2">
                    {result.listeningAnswers?.length > 0 && (
                        <CollapsibleSection
                            title="Listening"
                            icon={Headphones}
                            iconBg="bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300"
                            defaultOpen={false}
                            badge={
                                <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
                                    {listeningCorrect}/{listeningTotal} correct
                                </span>
                            }
                        >
                            <div className="pt-3">
                                {/* Score badge */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs text-gray-400 dark:text-gray-500">Raw score</span>
                                    <span className={`text-sm font-bold px-3 py-1 rounded-full ring-1 ${bandBg(result.listeningBandScore)}`}>
                                        {result.listeningRawScore ?? listeningCorrect}/40 → Band {result.listeningBandScore ?? '—'}
                                    </span>
                                </div>
                                <div>
                                    {result.listeningAnswers.map((a, i) => (
                                        <AnswerRow key={i} num={a.questionNumber} userAnswer={a.answer || a.multipleAnswers?.join(', ')} isCorrect={a.isCorrect} />
                                    ))}
                                </div>
                            </div>
                        </CollapsibleSection>
                    )}

                    {/* ── Reading Answers ── */}
                    {result.readingAnswers?.length > 0 && (
                        <CollapsibleSection
                            title="Reading"
                            icon={BookOpenCheck}
                            iconBg="bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300"
                            defaultOpen={false}
                            badge={
                                <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
                                    {readingCorrect}/{readingTotal} correct
                                </span>
                            }
                        >
                            <div className="pt-3">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs text-gray-400 dark:text-gray-500">Raw score</span>
                                    <span className={`text-sm font-bold px-3 py-1 rounded-full ring-1 ${bandBg(result.readingBandScore)}`}>
                                        {result.readingRawScore ?? readingCorrect}/40 → Band {result.readingBandScore ?? '—'}
                                    </span>
                                </div>
                                <div>
                                    {result.readingAnswers.map((a, i) => (
                                        <AnswerRow key={i} num={a.questionNumber} userAnswer={a.answer || a.multipleAnswers?.join(', ')} isCorrect={a.isCorrect} />
                                    ))}
                                </div>
                            </div>
                        </CollapsibleSection>
                    )}

                    {/* ── Writing ── */}
                    {result.writingAnswers?.length > 0 && (
                        <CollapsibleSection title="Writing" icon={PenLine} iconBg="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300" defaultOpen={true} badge={result.writingBandScore ? <span className={`text-xs font-bold px-2 py-0.5 rounded-full ring-1 ml-1 ${bandBg(result.writingBandScore)}`}>Band {result.writingBandScore}</span> : <span className="ml-1 text-xs text-amber-500 dark:text-amber-400">Pending review</span>}>
                            <div className="pt-4 space-y-6">
                                {result.writingAnswers.map((w) => (
                                    <div key={w.taskNumber} className="space-y-3">
                                        {/* Task header */}
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Task {w.taskNumber}</p>
                                            {w.bandScore != null && <span className={`text-xs font-bold px-2.5 py-1 rounded-full ring-1 ${bandBg(w.bandScore)}`}>Band {w.bandScore}</span>}
                                        </div>

                                        {/* Word count */}
                                        <p className="text-xs text-gray-400 dark:text-gray-500">{w.wordCount} words</p>

                                        {/* Criteria scores */}
                                        {w.criteriaScores && (
                                            <div className="space-y-2.5 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/70">
                                                <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Criteria Scores</p>
                                                <CriteriaRow label="Task Achievement" score={w.criteriaScores.taskAchievement} />
                                                <CriteriaRow label="Coherence & Cohesion" score={w.criteriaScores.coherenceCohesion} />
                                                <CriteriaRow label="Lexical Resource" score={w.criteriaScores.lexicalResource} />
                                                <CriteriaRow label="Grammatical Range & Accuracy" score={w.criteriaScores.grammaticalRange} />
                                            </div>
                                        )}

                                        {/* Feedback */}
                                        {w.feedback && (
                                            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mb-2">Instructor Feedback</p>
                                                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{w.feedback}</p>
                                            </div>
                                        )}
                                        {w.aiFeedback && (
                                            <div className="rounded-lg border border-violet-100 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/30">
                                                <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-2">AI Feedback</p>
                                                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{w.aiFeedback}</p>
                                            </div>
                                        )}

                                        {/* Essay content */}
                                        <details className="group">
                                            <summary className="flex cursor-pointer list-none select-none items-center gap-1 text-xs text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                                                <ChevronDown className="w-3.5 h-3.5 group-open:rotate-180 transition-transform" />
                                                View your essay
                                            </summary>
                                            <div className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-relaxed text-gray-700 dark:bg-gray-800/70 dark:text-gray-300">{w.content || <span className="text-gray-300 italic dark:text-gray-600">No content</span>}</div>
                                        </details>

                                        {/* Divider between tasks */}
                                        {result.writingAnswers.length > 1 && w.taskNumber < result.writingAnswers.length && <div className="border-t border-gray-100 dark:border-gray-800" />}
                                    </div>
                                ))}
                            </div>
                        </CollapsibleSection>
                    )}

                    {/* ── Speaking ── */}
                    {result.speakingAnswers?.length > 0 && (
                        <CollapsibleSection title="Speaking" icon={Mic} iconBg="bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300" defaultOpen={true} badge={result.speakingBandScore ? <span className={`text-xs font-bold px-2 py-0.5 rounded-full ring-1 ml-1 ${bandBg(result.speakingBandScore)}`}>Band {result.speakingBandScore}</span> : <span className="ml-1 text-xs text-rose-400">Pending review</span>}>
                            <div className="pt-4 space-y-6">
                                {result.speakingAnswers.map((s) => (
                                    <div key={s.partNumber} className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Part {s.partNumber}</p>
                                            {s.bandScore != null && <span className={`text-xs font-bold px-2.5 py-1 rounded-full ring-1 ${bandBg(s.bandScore)}`}>Band {s.bandScore}</span>}
                                        </div>

                                        {/* Recording */}
                                        {s.recordingUrl && (
                                            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/70">
                                                <Mic className="w-4 h-4 text-rose-400 shrink-0" />
                                                <audio src={s.recordingUrl} controls className="flex-1 h-8" />
                                                {s.durationSeconds && (
                                                    <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                                                        {Math.floor(s.durationSeconds / 60)}:{String(s.durationSeconds % 60).padStart(2, '0')}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Criteria */}
                                        {s.criteriaScores && (
                                            <div className="space-y-2.5 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/70">
                                                <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Criteria Scores</p>
                                                <CriteriaRow label="Fluency & Coherence" score={s.criteriaScores.fluencyCoherence} />
                                                <CriteriaRow label="Lexical Resource" score={s.criteriaScores.lexicalResource} />
                                                <CriteriaRow label="Grammatical Range & Accuracy" score={s.criteriaScores.grammaticalRange} />
                                                <CriteriaRow label="Pronunciation" score={s.criteriaScores.pronunciation} />
                                            </div>
                                        )}

                                        {/* Transcript */}
                                        {s.transcript && (
                                            <details className="group">
                                                <summary className="flex cursor-pointer list-none select-none items-center gap-1 text-xs text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                                                    <ChevronDown className="w-3.5 h-3.5 group-open:rotate-180 transition-transform" />
                                                    View transcript
                                                </summary>
                                                <div className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-gray-50 p-4 text-sm italic leading-relaxed text-gray-700 dark:bg-gray-800/70 dark:text-gray-300">{s.transcript}</div>
                                            </details>
                                        )}

                                        {/* Feedback */}
                                        {s.feedback && (
                                            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mb-2">Instructor Feedback</p>
                                                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{s.feedback}</p>
                                            </div>
                                        )}
                                        {s.aiFeedback && (
                                            <div className="rounded-lg border border-violet-100 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/30">
                                                <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-2">AI Feedback</p>
                                                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{s.aiFeedback}</p>
                                            </div>
                                        )}

                                        {result.speakingAnswers.length > 1 && s.partNumber < result.speakingAnswers.length && <div className="border-t border-gray-100 dark:border-gray-800" />}
                                    </div>
                                ))}
                            </div>
                        </CollapsibleSection>
                    )}

                    {/* ── Actions ── */}
                </div>

                <div className="grid gap-3 pt-2 grid-cols-1 sm:grid-cols-2">
                    <Button fullWidth size="lg" Icon={RotateCcw} onClick={() => router.push(`/dashboard/exam/${examId}`)}>
                        Retake Test
                    </Button>
                    <Button fullWidth size="lg" variant="outline" tone="neutral" Icon={BookOpen} onClick={() => router.push('/dashboard/mocklist')}>
                        More Tests
                    </Button>
                </div>
            </div>
        </div>
    );
}

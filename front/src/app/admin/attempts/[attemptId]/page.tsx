'use client';
import { useCallback, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Ban, BookOpen, CheckCircle2, Clock, Copy, Edit3, Hash, Headphones, History, Loader2, Mic, Monitor, PenTool, RefreshCw, RotateCcw, Shield, ShieldCheck, StickyNote, Trash2, User } from 'lucide-react';

import { useAdminAttempt } from '@/hooks/useAdminAttempts';
import { AdminUpdateAttemptDto, GradeSpeakingDto, GradeWritingDto, getExam, getExamId, getUser, getUserId } from '@/types/attempt.types';

import EditDrawer from '../components/EditDrawer';
import { BandHero } from '../components/BandHero';
import { WritingCard } from '../components/WritingCard';
import { SpeakingCard } from '../components/SpeakingCard';
import { AnswerGrid, AuditTimeline, ChangeHistoryList, ConfirmDialog, Field, InfoCard, Section, StatusBadge, Toast, fmt } from '../components';

export default function AttemptDetailPage() {
    const params = useParams();
    const router = useRouter();
    const attemptId = params?.attemptId as string;

    const { attempt, isLoading, isRefetching, refetch, fetchAuditLog, auditLog, isLoadingAudit, fetchChangeHistory, changeHistory, isLoadingHistory, update, isUpdating, gradeWriting, isGradingWriting, gradeSpeaking, isGradingSpeaking, softDelete, isDeleting, restore, isRestoring, hardDelete, isHardDeleting } = useAdminAttempt(attemptId);
    console.log("admin attempt", attempt)
    const [showEdit, setShowEdit] = useState(false);
    const [dialog, setDialog] = useState<'delete' | 'restore' | 'hard' | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    }, []);

    const handleUpdate = useCallback(
        (data: AdminUpdateAttemptDto) => {
            update(data, {
                onSuccess: () => {
                    setShowEdit(false);
                    showToast('Saqlandi');
                },
                onError: () => showToast('Xatolik', 'error'),
            });
        },
        [update, showToast]
    );

    const handleGradeWriting = useCallback(
        (data: GradeWritingDto) => {
            gradeWriting(data, {
                onSuccess: () => showToast(`Writing Vazifa ${data.taskNumber} baholandi ✓`),
                onError: () => showToast('Xatolik', 'error'),
            });
        },
        [gradeWriting, showToast]
    );

    const handleGradeSpeaking = useCallback(
        (data: GradeSpeakingDto) => {
            gradeSpeaking(data, {
                onSuccess: () => showToast(`Speaking Qism ${data.partNumber} baholandi ✓`),
                onError: () => showToast('Xatolik', 'error'),
            });
        },
        [gradeSpeaking, showToast]
    );

    const handleDelete = useCallback(
        (reason?: string) => {
            softDelete(reason, {
                onSuccess: () => {
                    setDialog(null);
                    showToast("O'chirildi");
                },
                onError: () => showToast('Xatolik', 'error'),
            });
        },
        [softDelete, showToast]
    );

    const handleRestore = useCallback(
        (reason?: string) => {
            restore(reason, {
                onSuccess: () => {
                    setDialog(null);
                    showToast('Tiklandi');
                },
                onError: () => showToast('Xatolik', 'error'),
            });
        },
        [restore, showToast]
    );

    const handleHardDelete = useCallback(
        (_r?: string) => {
            hardDelete(undefined, {
                onSuccess: () => {
                    showToast("Doimiy o'chirildi");
                    router.push('/admin/attempts');
                },
                onError: () => showToast('Xatolik', 'error'),
            });
        },
        [hardDelete, showToast, router]
    );

    // Loading / Not found
    if (isLoading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                        <Loader2 className="w-7 h-7 text-violet-600 animate-spin" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Yuklanmoqda...</p>
                </div>
            </div>
        );

    if (!attempt)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Attempt topilmadi</p>
                    <button type="button" onClick={() => router.back()} className="text-violet-600 dark:text-violet-400 hover:underline text-sm font-semibold">
                        ← Orqaga
                    </button>
                </div>
            </div>
        );

    const user = getUser(attempt);
    const exam = getExam(attempt);
    const isDeleted = attempt.isDeleted;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <AnimatePresence>{toast && <Toast message={toast.msg} type={toast.type} />}</AnimatePresence>

            {/* ── Sticky Header ── */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200/80 dark:border-gray-800 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1.5 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                        <button type="button" onClick={() => router.push('/admin')} className="hover:text-gray-800 dark:hover:text-gray-200 transition font-medium">
                            Admin
                        </button>
                        <span className="text-gray-300 dark:text-gray-600">/</span>
                        <button type="button" onClick={() => router.push('/admin/attempts')} className="hover:text-gray-800 dark:hover:text-gray-200 transition font-medium">
                            Attempts
                        </button>
                        <span className="text-gray-300 dark:text-gray-600">/</span>
                        <span className="font-mono font-black text-gray-800 dark:text-gray-200">#{attempt._id?.slice(-8).toUpperCase()}</span>
                    </div>

                    <div className="pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <button type="button" onClick={() => router.back()} className="mt-0.5 p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex-shrink-0">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-lg font-black text-gray-900 dark:text-white">Urinish #{attempt.attemptNumber}</h1>
                                    <StatusBadge status={attempt.status} />
                                    {isDeleted && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 ring-1 ring-rose-200 dark:ring-rose-800">
                                            <Ban className="w-3 h-3" /> O'chirilgan
                                        </span>
                                    )}
                                    {attempt.isReviewed && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800">
                                            <CheckCircle2 className="w-3 h-3" /> Ko'rib chiqildi
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                    <button type="button" onClick={() => navigator.clipboard.writeText(attempt._id).catch(() => {})} className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-mono transition">
                                        <Hash className="w-3 h-3" />
                                        {attempt._id}
                                        <Copy className="w-2.5 h-2.5" />
                                    </button>
                                    {attempt.tags?.map((tag: string) => (
                                        <span key={tag} className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-[10px] font-black">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-1 tabular-nums">
                                    {fmt(attempt.createdAt, true)}
                                    {attempt.submittedAt ? ` · Topshirildi: ${fmt(attempt.submittedAt, true)}` : ''}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
                            <button type="button" onClick={() => refetch()} disabled={isRefetching} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50">
                                <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
                            </button>
                            {!isDeleted && (
                                <button type="button" onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-950/40 rounded-xl hover:bg-violet-200 transition">
                                    <Edit3 className="w-3.5 h-3.5" /> Tahrirlash
                                </button>
                            )}
                            {!isDeleted ? (
                                <button type="button" onClick={() => setDialog('delete')} className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/40 rounded-xl hover:bg-rose-200 transition">
                                    <Trash2 className="w-3.5 h-3.5" /> O'chirish
                                </button>
                            ) : (
                                <>
                                    <button type="button" onClick={() => setDialog('restore')} className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/40 rounded-xl hover:bg-emerald-200 transition">
                                        <RotateCcw className="w-3.5 h-3.5" /> Tiklash
                                    </button>
                                    <button type="button" onClick={() => setDialog('hard')} className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition">
                                        <Trash2 className="w-3.5 h-3.5" /> Doimiy o'chirish
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                    {/* Left 2/3 */}
                    <div className="xl:col-span-2 space-y-5">
                        <BandHero attempt={attempt} />

                        {/* Writing */}
                        {attempt.writingAnswers?.length > 0 && (
                            <Section title="Writing Javoblari" icon={<PenTool className="w-4 h-4" />} badge={<span className="ml-1 px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 text-[10px] font-black">{attempt.writingAnswers.length}</span>}>
                                <div className="space-y-4">
                                    {attempt.writingAnswers.map((w: any) => (
                                        <WritingCard key={w.taskNumber} w={w} onGrade={handleGradeWriting} isGrading={isGradingWriting} />
                                    ))}
                                </div>
                            </Section>
                        )}

                        {/* Speaking */}
                        {attempt.speakingAnswers?.length > 0 && (
                            <Section title="Speaking Javoblari" icon={<Mic className="w-4 h-4" />} badge={<span className="ml-1 px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 text-[10px] font-black">{attempt.speakingAnswers.length}</span>}>
                                <div className="space-y-4">
                                    {attempt.speakingAnswers.map((s: any) => (
                                        <SpeakingCard key={s.partNumber} s={s} onGrade={handleGradeSpeaking} isGrading={isGradingSpeaking} />
                                    ))}
                                </div>
                            </Section>
                        )}

                        {/* Reading */}
                        {attempt.readingAnswers?.length > 0 && (
                            <Section
                                title="Reading Javoblari"
                                icon={<BookOpen className="w-4 h-4" />}
                                badge={
                                    <span className="ml-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-black">
                                        {attempt.readingAnswers.filter((a: any) => a.isCorrect).length}/{attempt.readingAnswers.length}
                                    </span>
                                }
                                defaultOpen={false}
                            >
                                <AnswerGrid answers={attempt.readingAnswers} type="reading" />
                            </Section>
                        )}

                        {/* Listening */}
                        {attempt.listeningAnswers?.length > 0 && (
                            <Section
                                title="Listening Javoblari"
                                icon={<Headphones className="w-4 h-4" />}
                                badge={
                                    <span className="ml-1 px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 text-[10px] font-black">
                                        {attempt.listeningAnswers.filter((a: any) => a.isCorrect).length}/{attempt.listeningAnswers.length}
                                    </span>
                                }
                                defaultOpen={false}
                            >
                                <AnswerGrid answers={attempt.listeningAnswers} type="listening" />
                            </Section>
                        )}

                        {/* Audit Log */}
                        <Section title="Audit Log" icon={<Shield className="w-4 h-4" />} badge={<span className="ml-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-black">{(attempt.auditLog?.length ?? 0) || auditLog.length}</span>} defaultOpen={false}>
                            {!attempt.auditLog?.length && !auditLog.length ? (
                                <button type="button" onClick={() => fetchAuditLog()} disabled={isLoadingAudit} className="w-full py-3 text-sm text-violet-600 dark:text-violet-400 hover:underline flex items-center justify-center gap-2 font-semibold">
                                    {isLoadingAudit && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Audit logni yuklash
                                </button>
                            ) : (
                                <AuditTimeline entries={attempt.auditLog?.length ? attempt.auditLog : auditLog} />
                            )}
                        </Section>

                        {/* Change History */}
                        <Section title="O'zgarishlar tarixi" icon={<History className="w-4 h-4" />} badge={<span className="ml-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-black">{(attempt.changeHistory?.length ?? 0) || changeHistory.length}</span>} defaultOpen={false}>
                            {!attempt.changeHistory?.length && !changeHistory.length ? (
                                <button type="button" onClick={() => fetchChangeHistory()} disabled={isLoadingHistory} className="w-full py-3 text-sm text-violet-600 dark:text-violet-400 hover:underline flex items-center justify-center gap-2 font-semibold">
                                    {isLoadingHistory && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Tarixni yuklash
                                </button>
                            ) : (
                                <ChangeHistoryList entries={attempt.changeHistory?.length ? attempt.changeHistory : changeHistory} />
                            )}
                        </Section>
                    </div>

                    {/* Right 1/3 */}
                    <div className="space-y-4">
                        {/* User */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <InfoCard title="Foydalanuvchi" icon={<User className="w-3 h-3" />}>
                                <div className="flex items-center gap-3 mb-4 pt-1">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">{getUserId(attempt)?.slice(-2).toUpperCase()}</div>
                                    <div className="min-w-0">
                                        {user?.username && <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.username}</p>}
                                        {user?.email && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>}
                                    </div>
                                </div>
                                <Field label="User ID" value={getUserId(attempt)} mono copiable />
                                {user?.firstName && <Field label="Ism" value={`${user.firstName} ${user.lastName ?? ''}`} />}
                                {user?.phoneNumber && <Field label="Telefon" value={user.phoneNumber} />}
                                {user?.createdAt && <Field label="Ro'yxatdan" value={fmt(user.createdAt, true)} />}
                            </InfoCard>
                        </motion.div>

                        {/* Exam */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
                            <InfoCard title="Imtihon" icon={<BookOpen className="w-3 h-3" />}>
                                {exam?.title && <Field label="Sarlavha" value={exam.title} />}
                                {exam?.examType && <Field label="Tur" value={exam.examType} />}
                                {exam?.module && <Field label="Modul" value={exam.module} />}
                                {exam?.difficulty && <Field label="Qiyinchilik" value={exam.difficulty} />}
                                {exam?.totalTimeLimitMinutes && <Field label="Vaqt" value={`${exam.totalTimeLimitMinutes} daqiqa`} />}
                                <Field label="Exam ID" value={getExamId(attempt)} mono copiable />
                            </InfoCard>
                        </motion.div>

                        {/* Timing */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                            <InfoCard title="Vaqt" icon={<Clock className="w-3 h-3" />}>
                                <Field label="Boshlangan" value={fmt(attempt.createdAt, true)} />
                                <Field label="Topshirilgan" value={fmt(attempt.submittedAt, true)} />
                                <Field label="Muddat" value={fmt(attempt.expiresAt, true)} />
                                <Field label="Oxirgi saqlash" value={fmt(attempt.lastAutoSaveAt)} />
                                <Field label="Auto saqlashlar" value={attempt.autoSaveCount ?? 0} />
                                {attempt.sectionsSubmitted?.length ? <Field label="Topshirilgan" value={attempt.sectionsSubmitted.join(', ')} /> : null}
                            </InfoCard>
                        </motion.div>

                        {/* Admin */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
                            <InfoCard title="Admin" icon={<ShieldCheck className="w-3 h-3" />} accent="violet">
                                <Field label="Writing" value={attempt.writingFullyGraded ? '✅ Baholandi' : '⏳ Kutilmoqda'} />
                                <Field label="Speaking" value={attempt.speakingFullyGraded ? '✅ Baholandi' : '⏳ Kutilmoqda'} />
                                <Field label="Ko'rib chiq." value={attempt.isReviewed ? '✅ Ha' : "Yo'q"} />
                                {attempt.reviewedBy && <Field label="Tekshiruvchi" value={attempt.reviewedBy} mono />}
                                {attempt.reviewNote && <Field label="Review izoh" value={attempt.reviewNote} />}
                                {attempt.generalFeedback && <Field label="Feedback" value={attempt.generalFeedback} />}
                                {attempt.tags?.length ? <Field label="Teglar" value={attempt.tags.join(', ')} /> : null}
                                {isDeleted && (
                                    <>
                                        <Field label="O'chirildi" value={fmt(attempt.deletedAt, true)} />
                                        <Field label="O'chirgan" value={attempt.deletedBy ?? '—'} mono />
                                        <Field label="Sababi" value={attempt.deleteReason ?? '—'} />
                                    </>
                                )}
                                {attempt.restoredAt && <Field label="Tiklandi" value={fmt(attempt.restoredAt, true)} />}
                            </InfoCard>
                        </motion.div>

                        {/* Device */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
                            <InfoCard title="Qurilma" icon={<Monitor className="w-3 h-3" />}>
                                <Field label="IP" value={attempt.ipAddress} mono copiable />
                                <Field label="Mamlakat" value={attempt.country} />
                                <Field label="Shahar" value={attempt.city} />
                                <Field label="Qurilma" value={attempt.device} />
                                <Field label="Brauzer" value={attempt.browser} />
                                <Field label="OS" value={attempt.os} />
                            </InfoCard>
                        </motion.div>

                        {/* Admin notes */}
                        {attempt.adminNotes?.length ? (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                <InfoCard title="Admin Izohlar" icon={<StickyNote className="w-3 h-3" />} accent="amber">
                                    <div className="space-y-2 mt-1">
                                        {attempt.adminNotes.map((n: any, i: number) => (
                                            <div key={i} className="bg-white dark:bg-amber-950/20 rounded-xl p-3 border border-amber-100 dark:border-amber-900/40">
                                                <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">{n.note}</p>
                                                <p className="text-[10px] text-gray-400 mt-1.5 font-mono">
                                                    {n.addedBy} · {fmt(n.addedAt)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </InfoCard>
                            </motion.div>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Edit Drawer */}
            {showEdit && <EditDrawer attempt={attempt} onClose={() => setShowEdit(false)} onSave={handleUpdate} isSaving={isUpdating} />}

            {/* Dialogs */}
            <AnimatePresence>
                {dialog === 'delete' && <ConfirmDialog title="Attemptni o'chirish" desc="Soft delete qilinadi. Keyinroq tiklanishi mumkin." action="O'chirish" actionClass="bg-rose-500 hover:bg-rose-600" icon={<Trash2 className="w-5 h-5 text-rose-500" />} withReason onConfirm={handleDelete} onClose={() => setDialog(null)} isLoading={isDeleting} />}
                {dialog === 'restore' && <ConfirmDialog title="Attemptni tiklash" desc="O'chirilgan attempt qayta aktivlanadi." action="Tiklash" actionClass="bg-emerald-500 hover:bg-emerald-600" icon={<RotateCcw className="w-5 h-5 text-emerald-500" />} onConfirm={handleRestore} onClose={() => setDialog(null)} isLoading={isRestoring} />}
                {dialog === 'hard' && <ConfirmDialog title="Doimiy o'chirish" desc="⚠️ Bu amal QAYTARIB BO'LMAYDI. Attempt bazadan butunlay o'chib ketadi." action="Doimiy o'chirish" actionClass="bg-rose-700 hover:bg-rose-800" icon={<AlertTriangle className="w-5 h-5 text-rose-700" />} onConfirm={handleHardDelete} onClose={() => setDialog(null)} isLoading={isHardDeleting} />}
            </AnimatePresence>
        </div>
    );
}

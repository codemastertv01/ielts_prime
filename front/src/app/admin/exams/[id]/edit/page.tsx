'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Check, ChevronLeft, ChevronRight, Headphones, History, Info, Loader2, Mic, PenLine, Save, Shield, X } from 'lucide-react';
import { useAdminExam } from '@/hooks/useAdminExams';
import type { ReadingPassage, ListeningPart, WritingTask, SpeakingPart, ExamType } from '@/types/exam';
import { ExamTypeEnum, DifficultyLevelEnum, ExamModuleEnum } from '@/types/exam';
import { REQUIRED_SECTIONS } from '@/constants/exam';
import { fmtDate, fromUTC, toUTC } from '@/utils/exam';
import ReadingSection from '../../sections/ReadingSection';
import ListeningSection from '../../sections/ListeningSection';
import WritingSection from '../../sections/WritingSection';
import SpeakingSection from '../../sections/SpeakingSection';
import BasicInfoStep from '../../components/BasicInfoStep';

// ─── BasicInfoForm for edit (reads system fields) ─────────────

const BasicInfoForm = ({ data, onChange, exam }: { data: any; onChange: (d: any) => void; exam: any }) => {
    return <BasicInfoStep data={data} onChange={onChange} fieldErrors={[]} />;
};

// ─── Change History ───────────────────────────────────────────

const ChangeHistoryTab = ({ exam }: { exam: any }) => (
    <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Change history <span className="text-gray-400">({exam.updateHistory?.length ?? 0})</span>
        </h3>
        {exam.updateHistory?.length ? (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {[...exam.updateHistory].reverse().map((entry: any, i: number) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border-l-4 border-blue-400">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{entry.fieldName}</span>
                            <span className="text-xs text-gray-400">{fmtDate(entry.changedAt)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs text-gray-500 block mb-1">⬅ Previous</span>
                                <pre className="font-mono text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-2 rounded-lg break-all whitespace-pre-wrap overflow-auto max-h-24">{JSON.stringify(entry.oldValue, null, 2)}</pre>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 block mb-1">➡ Next</span>
                                <pre className="font-mono text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-2 rounded-lg break-all whitespace-pre-wrap overflow-auto max-h-24">{JSON.stringify(entry.newValue, null, 2)}</pre>
                            </div>
                        </div>
                        {entry.changedBy && <p className="text-xs text-gray-400 mt-2">Who: {entry.changedBy}</p>}
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-14 text-gray-400">
                <History className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p>No change history</p>
            </div>
        )}
    </div>
);

// ─── Audit Log ────────────────────────────────────────────────

const AuditLogTab = ({ exam }: { exam: any }) => (
    <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Audit jurnali <span className="text-gray-400">({exam.auditLog?.length ?? 0})</span>
        </h3>
        {exam.auditLog?.length ? (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {[...exam.auditLog].reverse().map((log: any, i: number) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border-l-4 border-green-400">
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
    </div>
);

const SectionDisabled = ({ section }: { section: string }) => (
    <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <Info className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-base font-semibold text-gray-600 dark:text-gray-400 mb-2">{section} is not required</h3>
        <p className="text-sm text-gray-400 max-w-xs">The {section} section is not included for this exam type.</p>
    </div>
);

// ─── Step definitions ─────────────────────────────────────────

const STEPS_DEF = [
    { id: 'basic', label: "Information", icon: <Info className="w-3.5 h-3.5" />, always: true },
    { id: 'reading', label: 'Reading', icon: <BookOpen className="w-3.5 h-3.5" />, always: false },
    { id: 'listening', label: 'Listening', icon: <Headphones className="w-3.5 h-3.5" />, always: false },
    { id: 'writing', label: 'Writing', icon: <PenLine className="w-3.5 h-3.5" />, always: false },
    { id: 'speaking', label: 'Speaking', icon: <Mic className="w-3.5 h-3.5" />, always: false },
    { id: 'history', label: 'History', icon: <History className="w-3.5 h-3.5" />, always: true },
    { id: 'audit', label: 'Audit', icon: <Shield className="w-3.5 h-3.5" />, always: true },
];

// ─── Main ─────────────────────────────────────────────────────

export default function EditExamPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const examId = params?.id ?? '';

    const { exam, isLoading, updateAsync, isUpdating } = useAdminExam(examId, true);

    const [currentStep, setCurrentStep] = useState(0);
    const [saveMsg, setSaveMsg] = useState('');
    const [saveErr, setSaveErr] = useState('');

    // ── Form state ───────────────────────────────────────────────
    const [basicData, setBasicData] = useState<any>(null);
    const [passages, setPassages] = useState<ReadingPassage[]>([]);
    const [listeningParts, setListeningParts] = useState<ListeningPart[]>([]);
    const [writingTasks, setWritingTasks] = useState<WritingTask[]>([]);
    const [speakingParts, setSpeakingParts] = useState<SpeakingPart[]>([]);

    // Populate from exam data
    useEffect(() => {
        if (!exam) return;
        setBasicData({
            title: exam.title ?? '',
            description: exam.description ?? '',
            examType: exam.examType ?? ExamTypeEnum.FULL_MOCK_TEST,
            module: exam.module ?? ExamModuleEnum.ACADEMIC,
            difficulty: exam.difficulty ?? DifficultyLevelEnum.BAND_6_7,
            totalTimeLimitMinutes: exam.totalTimeLimitMinutes ?? 170,
            passingScore: exam.passingScore ?? 5.5,
            isPremium: exam.isPremium ?? false,
            price: exam.price ?? 0,
            tags: exam.tags?.join(', ') ?? '',
            thumbnailUrl: exam.thumbnailUrl ?? '',
            availableFrom: fromUTC(exam.availableFrom),
            availableUntil: fromUTC(exam.availableUntil),
        });
        if (exam.readingSection?.passages) setPassages(exam.readingSection.passages as ReadingPassage[]);
        if (exam.listeningSection?.parts) setListeningParts(exam.listeningSection.parts as ListeningPart[]);
        if (exam.writingSection?.tasks) setWritingTasks(exam.writingSection.tasks as WritingTask[]);
        if (exam.speakingSection?.parts) setSpeakingParts(exam.speakingSection.parts as SpeakingPart[]);
    }, [exam]);

    const examType = basicData?.examType ?? ExamTypeEnum.FULL_MOCK_TEST;
    const required = REQUIRED_SECTIONS[exam?.examType as ExamType] ?? [];
    const shows = useCallback((s: string) => required.includes(s), [required]);

    const visibleSteps = STEPS_DEF.filter((s) => s.always || shows(s.id));

    // ── Save ─────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!basicData || !exam) return;
        setSaveErr('');
        setSaveMsg('');

        const payload: any = {
            title: basicData.title?.trim(),
            description: basicData.description?.trim() || undefined,
            examType: basicData.examType,
            module: basicData.module,
            difficulty: basicData.difficulty,
            totalTimeLimitMinutes: Number(basicData.totalTimeLimitMinutes),
            passingScore: Number(basicData.passingScore),
            isPremium: Boolean(basicData.isPremium),
            price: Number(basicData.price),
            tags: basicData.tags
                ? basicData.tags
                      .split(',')
                      .map((t: string) => t.trim())
                      .filter(Boolean)
                : [],
            thumbnailUrl: basicData.thumbnailUrl?.trim() || undefined,
            availableFrom: basicData.availableFrom ? toUTC(basicData.availableFrom) : undefined,
            availableUntil: basicData.availableUntil ? toUTC(basicData.availableUntil) : undefined,
        };

        if (shows('reading')) {
            payload.readingSection = {
                isEnabled: true,
                timeLimitMinutes: exam.readingSection?.timeLimitMinutes ?? 60,
                passages,
                totalQuestions: passages.reduce((s, p) => s + p.questions.length, 0),
                totalPoints: passages.reduce((s, p) => s + p.questions.reduce((ss, q) => ss + (q.points ?? 1), 0), 0),
            };
        }
        if (shows('listening')) {
            payload.listeningSection = {
                isEnabled: true,
                timeLimitMinutes: exam.listeningSection?.timeLimitMinutes ?? 30,
                transferTimeMinutes: exam.listeningSection?.transferTimeMinutes ?? 10,
                parts: listeningParts,
                totalQuestions: listeningParts.reduce((s, p) => s + p.questions.length, 0),
                totalPoints: listeningParts.reduce((s, p) => s + p.questions.reduce((ss, q) => ss + (q.points ?? 1), 0), 0),
            };
        }
        if (shows('writing')) {
            payload.writingSection = {
                isEnabled: true,
                timeLimitMinutes: exam.writingSection?.timeLimitMinutes ?? 60,
                tasks: writingTasks,
            };
        }
        if (shows('speaking')) {
            payload.speakingSection = {
                isEnabled: true,
                timeLimitMinutes: exam.speakingSection?.timeLimitMinutes ?? 14,
                requiresRecording: exam.speakingSection?.requiresRecording ?? true,
                allowRetakes: exam.speakingSection?.allowRetakes ?? false,
                parts: speakingParts,
            };
        }

        try {
            await updateAsync(payload);
            setSaveMsg('Muvaffaqiyatli saqlandi!');
            setTimeout(() => setSaveMsg(''), 3000);
        } catch (e: unknown) {
            setSaveErr((e as any)?.response?.data?.message ?? (e as Error)?.message ?? 'Errorlik');
        }
    };

    if (isLoading || !basicData || !exam) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
                    <p className="text-gray-500 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    const getStepContent = (stepId: string) => {
        switch (stepId) {
            case 'basic':
                return <BasicInfoForm data={basicData} onChange={setBasicData} exam={exam} />;
            case 'reading':
                return shows('reading') ? <ReadingSection passages={passages} setPassages={setPassages} /> : <SectionDisabled section="Reading" />;
            case 'listening':
                return shows('listening') ? <ListeningSection parts={listeningParts} setParts={setListeningParts} /> : <SectionDisabled section="Listening" />;
            case 'writing':
                return shows('writing') ? <WritingSection tasks={writingTasks} setTasks={setWritingTasks} /> : <SectionDisabled section="Writing" />;
            case 'speaking':
                return shows('speaking') ? <SpeakingSection parts={speakingParts} setParts={setSpeakingParts} /> : <SectionDisabled section="Speaking" />;
            case 'history':
                return <ChangeHistoryTab exam={exam} />;
            case 'audit':
                return <AuditLogTab exam={exam} />;
            default:
                return null;
        }
    };

    const current = visibleSteps[currentStep];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Examni tahrirlash</h1>
                        <p className="text-sm text-gray-400 mt-0.5 truncate max-w-md">{exam.title}</p>
                    </div>
                    <div className="flex gap-2.5 items-center">
                        {saveMsg && (
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> {saveMsg}
                            </span>
                        )}
                        {saveErr && <span className="text-xs font-semibold text-red-500">{saveErr}</span>}
                        <button type="button" onClick={() => router.back()} className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <X className="w-4 h-4" /> Cancel
                        </button>
                        <button type="button" onClick={handleSave} disabled={isUpdating} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-colors">
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isUpdating ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                {/* Stepper */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6 overflow-x-auto">
                    <div className="flex items-center gap-1 min-w-max">
                        {visibleSteps.map((step, i) => (
                            <div key={step.id} className="flex items-center">
                                <button type="button" onClick={() => setCurrentStep(i)} className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all min-w-[72px] ${i === currentStep ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : i < currentStep ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${i === currentStep ? 'bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-500' : i < currentStep ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-gray-100 dark:bg-gray-700'}`}>{i < currentStep ? <Check className="w-3.5 h-3.5" /> : step.icon}</div>
                                    <span className="text-[11px] font-semibold">{step.label}</span>
                                </button>
                                {i < visibleSteps.length - 1 && <div className={`h-0.5 w-5 mx-0.5 rounded-full transition-colors ${i < currentStep ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-600'}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    <motion.div key={currentStep} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.2 }} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-5 min-h-[400px]">
                        {current && getStepContent(current.id)}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-6 py-4">
                    <button type="button" onClick={() => setCurrentStep((s) => Math.max(0, s - 1))} disabled={currentStep === 0} className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl disabled:opacity-40 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Previousgi
                    </button>
                    <button type="button" onClick={handleSave} disabled={isUpdating} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-colors">
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isUpdating ? 'Saving...' : 'Save'}
                    </button>
                    {currentStep < visibleSteps.length - 1 ? (
                        <button type="button" onClick={() => setCurrentStep((s) => Math.min(visibleSteps.length - 1, s + 1))} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors">
                            Nextgi <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <div className="w-28" />
                    )}
                </div>
            </div>
        </div>
    );
}

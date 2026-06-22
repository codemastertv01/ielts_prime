'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Check, ChevronLeft, ChevronRight, Code, Headphones, Info, Loader2, Mic, PenLine, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import BasicInfoStep from '../components/BasicInfoStep';
import { REQUIRED_SECTIONS } from '@/constants/exam';
import { useAdminExams } from '@/hooks/useAdminExams';
import ListeningSection from '../sections/ListeningSection';
import ReadingSection from '../sections/ReadingSection';
import SpeakingSection from '../sections/SpeakingSection';
import WritingSection from '../sections/WritingSection';
import type { BasicInfoFormData, ListeningPart, ReadingPassage, SpeakingPart, ValidationError, WritingTask } from '@/types/exam';
import { DifficultyLevelEnum, ExamModuleEnum, ExamTypeEnum } from '@/types/exam';
import { buildPayload, parseJsonToFormState, validateExam } from '@/utils/exam';
import ReviewStep from '../components/ReviewStep';
import JsonImportModal from '../components/JsonImportModal';
import { showToast } from '@/services/toastService';

type StepId = 'basic' | 'reading' | 'listening' | 'writing' | 'speaking' | 'review';

const ALL_STEPS: { id: StepId; label: string; icon: React.ReactNode; always: boolean }[] = [
    { id: 'basic', label: "Information", icon: <Info className="w-3.5 h-3.5" />, always: true },
    { id: 'reading', label: 'Reading', icon: <BookOpen className="w-3.5 h-3.5" />, always: false },
    { id: 'listening', label: 'Listening', icon: <Headphones className="w-3.5 h-3.5" />, always: false },
    { id: 'writing', label: 'Writing', icon: <PenLine className="w-3.5 h-3.5" />, always: false },
    { id: 'speaking', label: 'Speaking', icon: <Mic className="w-3.5 h-3.5" />, always: false },
    { id: 'review', label: "Review", icon: <Check className="w-3.5 h-3.5" />, always: true },
];

const SectionDisabled = ({ section }: { section: string }) => (
    <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
            <Info className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-base font-bold text-gray-600 dark:text-gray-400 mb-2">{section} is not required</h3>
        <p className="text-sm text-gray-400 max-w-xs">{"This section is not required for the selected exam type."}</p>
    </div>
);

const INIT_BASIC: BasicInfoFormData = {
    title: '',
    description: '',
    examType: ExamTypeEnum.FULL_MOCK_TEST,
    module: ExamModuleEnum.ACADEMIC,
    difficulty: DifficultyLevelEnum.BAND_6_7,
    totalTimeLimitMinutes: 170,
    passingScore: 5.5,
    isPremium: false,
    price: 0,
    tags: '',
    thumbnailUrl: '',
    availableFrom: '',
    availableUntil: '',
};

export default function CreateExamPage() {
    const router = useRouter();
    const { createAsync, isCreating } = useAdminExams();

    const [basicInfo, setBasicInfo] = useState<BasicInfoFormData>(INIT_BASIC);
    const [passages, setPassages] = useState<ReadingPassage[]>([]);
    const [listeningParts, setListeningParts] = useState<ListeningPart[]>([]);
    const [writingTasks, setWritingTasks] = useState<WritingTask[]>([]);
    const [speakingParts, setSpeakingParts] = useState<SpeakingPart[]>([]);

    const [currentStep, setCurrentStep] = useState(0);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [fieldErrors, setFieldErrors] = useState<string[]>([]);
    const [showJson, setShowJson] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [apiError, setApiError] = useState('');

    const required = REQUIRED_SECTIONS[basicInfo.examType] ?? [];
    const visibleSteps = ALL_STEPS.filter((s) => s.always || required.includes(s.id));
    const current = visibleSteps[currentStep];

    const handleJsonImport = useCallback((json: Record<string, unknown> | Record<string, unknown>[]) => {
        if (Array.isArray(json)) {
            showToast.info("Use the exam list page for bulk JSON import.");
            return;
        }
        const parsed = parseJsonToFormState(json);
        setBasicInfo(parsed.basic as BasicInfoFormData);
        setPassages(parsed.passages);
        setListeningParts(parsed.listeningParts);
        setWritingTasks(parsed.writingTasks);
        setSpeakingParts(parsed.speakingParts);
        setErrors([]);
        setFieldErrors([]);
        setCurrentStep(0);
    }, []);

    const handleSubmit = async () => {
        const errs = validateExam(basicInfo, passages, listeningParts, writingTasks, speakingParts);
        setErrors(errs);
        setFieldErrors(errs.map((e) => e.field));
        if (errs.length > 0) {
            setCurrentStep(0);
            return;
        }

        const payload = buildPayload(basicInfo, passages, listeningParts, writingTasks, speakingParts);
        try {
            setApiError('');
            await createAsync(payload);
            setSubmitSuccess(true);
            setTimeout(() => router.push('/admin/exams'), 2000);
        } catch (e: unknown) {
            const error = e as { response?: { data?: { message?: string } }; message?: string };
            setApiError(error.response?.data?.message ?? error.message ?? 'Error');
        }
    };

    const getContent = (id: StepId) => {
        switch (id) {
            case 'basic':
                return <BasicInfoStep data={basicInfo} onChange={setBasicInfo} fieldErrors={fieldErrors} />;
            case 'reading':
                return required.includes('reading') ? <ReadingSection passages={passages} setPassages={setPassages} fieldErrors={fieldErrors} /> : <SectionDisabled section="Reading" />;
            case 'listening':
                return required.includes('listening') ? <ListeningSection parts={listeningParts} setParts={setListeningParts} fieldErrors={fieldErrors} /> : <SectionDisabled section="Listening" />;
            case 'writing':
                return required.includes('writing') ? <WritingSection tasks={writingTasks} setTasks={setWritingTasks} fieldErrors={fieldErrors} /> : <SectionDisabled section="Writing" />;
            case 'speaking':
                return required.includes('speaking') ? <SpeakingSection parts={speakingParts} setParts={setSpeakingParts} fieldErrors={fieldErrors} /> : <SectionDisabled section="Speaking" />;
            case 'review':
                return <ReviewStep basicInfo={basicInfo} passages={passages} listeningParts={listeningParts} writingTasks={writingTasks} speakingParts={speakingParts} errors={errors} />;
        }
    };

    if (submitSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }} className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Check className="w-12 h-12 text-emerald-600" />
                    </motion.div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Created!</h2>
                    <p className="text-gray-500">
                        <span className="font-semibold">{basicInfo.title}</span> was saved successfully.
                    </p>
                    <p className="text-gray-400 text-sm mt-2">Redirecting to the exams page...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button type="button" onClick={() => router.push('/admin/exams')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
                        <div>
                            <h1 className="text-base font-bold text-gray-900 dark:text-white">New IELTS Exam</h1>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Step {currentStep + 1}/{visibleSteps.length}: {current?.label}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                        {apiError && <span className="text-xs text-red-500 font-semibold max-w-xs truncate">{apiError}</span>}
                        <button type="button" onClick={() => setShowJson(true)} className="flex items-center gap-2 px-4 py-2 bg-violet-50 hover:bg-violet-100 dark:bg-violet-900/20 dark:hover:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700 rounded-xl text-sm font-semibold transition-colors">
                            <Code className="w-4 h-4" /> JSON Import
                        </button>
                        <button type="button" onClick={handleSubmit} disabled={isCreating} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                            {isCreating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" /> Save
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-6">
                {/* Stepper */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 mb-6 overflow-x-auto">
                    <div className="flex items-center gap-1 min-w-max">
                        {visibleSteps.map((step, i) => (
                            <div key={step.id} className="flex items-center">
                                <button type="button" onClick={() => setCurrentStep(i)} className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all min-w-[76px] ${i === currentStep ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : i < currentStep ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${i === currentStep ? 'bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-500' : i < currentStep ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-gray-100 dark:bg-gray-700'}`}>{i < currentStep ? <Check className="w-3.5 h-3.5" /> : step.icon}</div>
                                    <span className="text-[11px] font-semibold">{step.label}</span>
                                </button>
                                {i < visibleSteps.length - 1 && <div className={`h-0.5 w-5 mx-0.5 rounded-full transition-colors ${i < currentStep ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-600'}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Error banner */}
                <AnimatePresence>
                    {errors.length > 0 && currentStep === 0 && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-700 rounded-2xl p-4 mb-5 flex items-start justify-between gap-3">
                            <div>
                                <p className="font-bold text-red-800 dark:text-red-300 text-sm mb-1">{errors.length} issue(s) found</p>
                                <ul className="space-y-0.5">
                                    {errors.slice(0, 5).map((e, i) => (
                                        <li key={i} className="text-xs text-red-600 dark:text-red-400">
                                            • {e.msg}
                                        </li>
                                    ))}
                                    {errors.length > 5 && <li className="text-xs text-red-400">… and {errors.length - 5} more</li>}
                                </ul>
                            </div>
                            <button onClick={() => setErrors([])} className="p-1 text-red-400 hover:text-red-600 transition-colors shrink-0">
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Step passage */}
                <AnimatePresence mode="wait">
                    <motion.div key={currentStep} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-5 min-h-[420px]">
                        {current && getContent(current.id)}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                    <button type="button" onClick={() => setCurrentStep((s) => Math.max(0, s - 1))} disabled={currentStep === 0} className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold disabled:opacity-40 transition-all">
                        <ChevronLeft className="w-4 h-4" /> Previous
                    </button>

                    {/* Dots */}
                    <div className="flex items-center gap-1.5">
                        {visibleSteps.map((_, i) => (
                            <button key={i} type="button" onClick={() => setCurrentStep(i)} className={`rounded-full transition-all ${i === currentStep ? 'bg-blue-600 w-6 h-2' : i < currentStep ? 'bg-emerald-400 w-2 h-2' : 'bg-gray-200 dark:bg-gray-600 w-2 h-2'}`} />
                        ))}
                    </div>

                    {currentStep < visibleSteps.length - 1 ? (
                        <button type="button" onClick={() => setCurrentStep((s) => Math.min(visibleSteps.length - 1, s + 1))} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all">
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button type="button" onClick={handleSubmit} disabled={isCreating} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-all">
                            {isCreating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" /> Create Exam
                                </>
                            )}
                        </button>
                    )}
                </div>
            </main>

            {showJson && <JsonImportModal onImport={handleJsonImport} onClose={() => setShowJson(false)} />}
        </div>
    );
}

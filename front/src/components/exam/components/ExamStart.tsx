'use client';
import { useState } from 'react';
import { Headphones, BookOpen, PenLine, Mic, Clock, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { ExamData } from '@/types/exam';
import { Button } from '@/components/UI';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EnabledSection {
    id: 'listening' | 'reading' | 'writing' | 'speaking';
    label: string;
    enabled: true;
}

interface ExamStartProps {
    examData: ExamData;
    onStart: () => void;
}

// ─── Static fallbacks ─────────────────────────────────────────────────────────

const SECTION_META: Record<
    string,
    {
        icon: React.ReactNode;
        color: string;
        bg: string;
        border: string;
        defaultTime: string;
        instructions: string[];
        tips: string[];
    }
> = {
    listening: {
        icon: <Headphones className="w-5 h-5" />,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        defaultTime: '30 minutes',
        instructions: ['Answer <b>all</b> questions.', 'Each part plays <b>once only</b> — you cannot replay audio.', 'You can flag questions and return within the same part.', 'You must complete each part before moving to the next.'],
        tips: ['Read questions carefully before the audio starts.', 'Keep writing — do not leave blanks.', 'Check spelling in short-answer questions.'],
    },
    reading: {
        icon: <BookOpen className="w-5 h-5" />,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        defaultTime: '60 minutes',
        instructions: ['Answer <b>all</b> questions.', 'You can change your answers at any time during the test.', 'Complete each passage before moving to the next.'],
        tips: ['Skim the passage first, then read questions carefully.', 'Answers appear in the same order as the passage.', 'Do not spend too long on any single question.'],
    },
    writing: {
        icon: <PenLine className="w-5 h-5" />,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        defaultTime: '60 minutes',
        instructions: ['Answer <b>both</b> tasks.', 'Task 1: at least 150 words (~20 minutes).', 'Task 2: at least 250 words (~40 minutes).'],
        tips: ['Task 2 carries twice the marks of Task 1.', 'Plan your essay before writing.', 'Leave 2–3 minutes to check for errors.'],
    },
    speaking: {
        icon: <Mic className="w-5 h-5" />,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        defaultTime: '11–14 minutes',
        instructions: ['Answer all parts clearly.', 'Make sure your microphone is working before starting.', 'Each response will be recorded and uploaded.'],
        tips: ['Speak at a natural pace — do not rush.', 'Extend answers with reasons and examples.', 'It is fine to use notes during Part 2.'],
    },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSectionTime(id: string, examData: any): string {
    const minKey = `${id}Section`;
    const minutes = examData?.[minKey]?.timeLimitMinutes;
    if (minutes) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    return SECTION_META[id]?.defaultTime ?? '—';
}

function getSectionQuestionCount(id: string, examData: any): number | null {
    const sec = examData?.[`${id}Section`];
    if (!sec) return null;
    if (id === 'listening') {
        return (sec.parts ?? []).reduce((a: number, p: any) => a + (p.questions?.length ?? 0), 0);
    }
    if (id === 'reading') {
        return (sec.passages ?? []).reduce((a: number, p: any) => a + (p.questions?.length ?? 0), 0);
    }
    if (id === 'writing') return sec.tasks?.length ?? null;
    if (id === 'speaking') {
        return (sec.parts ?? []).reduce((a: number, p: any) => a + (p.questions?.length ?? 0), 0);
    }
    return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ExamStart = ({ examData, onStart }: ExamStartProps) => {
    const [step, setStep] = useState(0);

    // examData'dan enabled sectionlarni hisoblaymiz
    const sections: EnabledSection[] = (['listening', 'reading', 'writing', 'speaking'] as const)
        .filter((id) => (examData as any)[`${id}Section`]?.isEnabled)
        .map((id) => ({
            id,
            label: id.charAt(0).toUpperCase() + id.slice(1),
            enabled: true as const,
        }));

    const current = sections[step];
    if (!current) return null;

    const meta = SECTION_META[current.id];
    const time = getSectionTime(current.id, examData);
    const questionCount = getSectionQuestionCount(current.id, examData);
    const isLast = step === sections.length - 1;

    const handleNext = () => {
        if (isLast) onStart();
        else setStep((s) => s + 1);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-xl space-y-4">
                {/* Stepper */}
                <div className="flex items-center justify-center gap-2 mb-2">
                    {sections.map((s, i) => {
                        const m = SECTION_META[s.id];
                        const isActive = i === step;
                        const isDone = i < step;
                        return (
                            <div key={s.id} className="flex items-center gap-2">
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${isActive ? `${m.bg} ${m.border} ${m.color} border` : isDone ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-white text-gray-300 border-gray-200'}`}>
                                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <span className={m.color}>{m.icon}</span>}
                                    {s.label}
                                </div>
                                {i < sections.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
                            </div>
                        );
                    })}
                </div>

                {/* Main card */}
                <div className={`bg-white border ${meta.border} rounded-2xl overflow-hidden shadow-sm`}>
                    {/* Card header */}
                    <div className={`${meta.bg} px-6 py-5 border-b ${meta.border}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.bg} border ${meta.border}`}>
                                <span className={meta.color}>{meta.icon}</span>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">IELTS Academic</p>
                                <h1 className={`text-lg font-bold ${meta.color}`}>{current.label} Test</h1>
                            </div>
                        </div>

                        {/* Time + question count */}
                        <div className="flex items-center gap-4 mt-4">
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="font-semibold">{time}</span>
                            </div>
                            {questionCount !== null && (
                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                    <Info className="w-4 h-4 text-gray-400" />
                                    <span className="font-semibold">
                                        {questionCount} {current.id === 'writing' ? 'task' : 'question'}
                                        {questionCount !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="px-6 py-5 space-y-5">
                        {/* Instructions */}
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Instructions</p>
                            <ul className="space-y-2">
                                {meta.instructions.map((inst, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                        <span className={`w-5 h-5 rounded-full ${meta.bg} ${meta.color} flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5`}>{i + 1}</span>
                                        <span dangerouslySetInnerHTML={{ __html: inst }} />
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Tips */}
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">💡 Tips</p>
                            <ul className="space-y-1">
                                {meta.tips.map((tip, i) => (
                                    <li key={i} className="text-xs text-amber-800">
                                        • {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* CTA button */}
                <Button unstyled onClick={handleNext} className={`w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md ${isLast ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    {isLast ? (
                        <>
                            Start Exam <ChevronRight className="w-4 h-4" />
                        </>
                    ) : (
                        <>
                            Next: {sections[step + 1]?.label} <ChevronRight className="w-4 h-4" />
                        </>
                    )}
                </Button>

                <p className="text-center text-xs text-gray-400">
                    Step {step + 1} of {sections.length} — All sections must be completed in order
                </p>
            </div>
        </div>
    );
};

export default ExamStart;

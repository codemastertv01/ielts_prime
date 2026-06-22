'use client';
import { BookOpen, Headphones, PenLine, Mic, AlertCircle, CheckCircle, Code } from 'lucide-react';
import { useState } from 'react';
import { BasicInfoFormData, ExamType, ListeningPart, ReadingPassage, SpeakingPart, ValidationError, WritingTask } from '@/types/exam';
import { REQUIRED_SECTIONS, EXAM_TYPE_LABELS } from '@/constants';
import { buildPayload } from '@/utils/exam';

interface ReviewStepProps {
    basicInfo: BasicInfoFormData;
    passages: ReadingPassage[];
    listeningParts: ListeningPart[];
    writingTasks: WritingTask[];
    speakingParts: SpeakingPart[];
    errors?: ValidationError[];
}

const ReviewStep = ({ basicInfo, passages, listeningParts, writingTasks, speakingParts, errors = [] }: ReviewStepProps) => {
    const [showJson, setShowJson] = useState(false);
    const req = REQUIRED_SECTIONS[basicInfo.examType] ?? [];

    const payload = buildPayload(basicInfo, passages, listeningParts, writingTasks, speakingParts);

    const cards = [
        {
            key: 'reading',
            label: 'Reading',
            icon: <BookOpen className="w-5 h-5 text-blue-500" />,
            active: req.includes('reading'),
            value: `${passages.length} passage`,
            sub: `${passages.reduce((s, p) => s + p.questions.length, 0)} question`,
            ok: passages.length > 0 && passages.every((p) => p.title && p.passageNumber && p.questions.length > 0),
        },
        {
            key: 'listening',
            label: 'Listening',
            icon: <Headphones className="w-5 h-5 text-purple-500" />,
            active: req.includes('listening'),
            value: `${listeningParts.length} part`,
            sub: `${listeningParts.reduce((s, p) => s + p.questions.length, 0)} question`,
            ok: listeningParts.length > 0 && listeningParts.every((p) => p.title && p.audioUrl && p.questions.length > 0),
        },
        {
            key: 'writing',
            label: 'Writing',
            icon: <PenLine className="w-5 h-5 text-emerald-500" />,
            active: req.includes('writing'),
            value: `${writingTasks.length} task`,
            sub: writingTasks.map((t) => `Task ${t.taskNumber}`).join(', ') || '—',
            ok: writingTasks.length > 0 && writingTasks.every((t) => t.prompt),
        },
        {
            key: 'speaking',
            label: 'Speaking',
            icon: <Mic className="w-5 h-5 text-rose-500" />,
            active: req.includes('speaking'),
            value: `${speakingParts.length} part`,
            sub: '—',
            ok: speakingParts.length > 0,
        },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Review and Submit</h2>

            {/* Errors */}
            {errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-700 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-semibold text-sm mb-3">
                        <AlertCircle className="w-4 h-4" /> {errors.length} issue(s) found
                    </div>
                    <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                        {errors.map((e, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-red-700 dark:text-red-400">
                                <span className="w-4 h-4 bg-red-200 dark:bg-red-800 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">{i + 1}</span>
                                {e.msg}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Section cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cards.map((c) => (
                    <div key={c.key} className={`rounded-xl p-4 border-2 transition-all ${!c.active ? 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 opacity-50' : c.ok ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10' : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            {c.icon}
                            <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">{c.label}</span>
                            {c.active && (c.ok ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 ml-auto" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-500 ml-auto" />)}
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{c.active ? c.value : '—'}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{c.active ? c.sub : 'Not required'}</p>
                    </div>
                ))}
            </div>

            {/* Basic info summary */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5 border border-gray-200 dark:border-gray-600">
                <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">Exam information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {(
                        [
                            ['Title', basicInfo.title || '—'],
                            ['Type', EXAM_TYPE_LABELS[basicInfo.examType] || '—'],
                            ['Module', basicInfo.module || '—'],
                            ['Difficulty', basicInfo.difficulty || '—'],
                            ['Time', basicInfo.totalTimeLimitMinutes ? `${basicInfo.totalTimeLimitMinutes} minutes` : '—'],
                            ["Passing band", basicInfo.passingScore ?? '—'],
                        ] as [string, any][]
                    ).map(([k, v]) => (
                        <div key={k}>
                            <span className="text-xs text-gray-400 block">{k}</span>
                            <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{String(v)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ready/warning message */}
            {errors.length === 0 ? (
                <div className="bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">Everything is ready. Click Save to create the exam.</p>
                </div>
            ) : (
                <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 rounded-xl px-4 py-3">There are issues, but you can still submit. Fixing them before submission is recommended.</p>
            )}

            {/* JSON Preview toggle */}
            <div>
                <button type="button" onClick={() => setShowJson((s) => !s)} className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors">
                    <Code className="w-3.5 h-3.5" />
                    {showJson ? 'Hide JSON' : "View JSON payload"}
                </button>
                {showJson && <pre className="mt-3 p-4 bg-gray-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-auto max-h-80 leading-relaxed border border-gray-700">{JSON.stringify(payload, null, 2)}</pre>}
            </div>
        </div>
    );
};

export default ReviewStep;

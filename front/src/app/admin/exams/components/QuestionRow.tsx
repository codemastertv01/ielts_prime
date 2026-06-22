'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, AlertCircle } from 'lucide-react';
import { inp, lbl, sel } from '@/constants';
import { QuestionAnswerEditor } from './QuestionEditors';

interface QuestionRowProps {
    q: any;
    qIdx: number;
    qTypes: { label: string; value: string }[];
    onUpdate: (field: string, value: any) => void;
    onDelete: () => void;
    showTimestamps?: boolean;
    accentColor?: 'blue' | 'purple' | 'rose';
    defaultOpen?: boolean;
    fieldErrors?: string[];
}

const ACCENT: Record<string, string> = {
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    rose: 'bg-rose-500',
};

const QuestionRow = ({ q, qIdx, qTypes, onUpdate, onDelete, showTimestamps = false, accentColor = 'blue', defaultOpen = false, fieldErrors = [] }: QuestionRowProps) => {
    const [open, setOpen] = useState(defaultOpen);

    const hasQErr = fieldErrors.some((f) => f.includes(`q${qIdx}_text`));
    const hasAErr = fieldErrors.some((f) => f.includes(`q${qIdx}_answer`));
    const hasErr = hasQErr || hasAErr;
    const isDone = !!q.question?.trim() && !!q.correctAnswer?.toString().trim();

    const handleTypeChange = (newType: string) => {
        onUpdate('type', newType);
        onUpdate('options', []);
        onUpdate('matchingPool', []);
        onUpdate('correctAnswer', '');
        onUpdate('acceptableAnswers', []);
    };

    return (
        <div className={`rounded-xl border-2 transition-all ${hasErr ? 'border-red-300 dark:border-red-700 bg-red-50/30 dark:bg-red-900/10' : isDone ? 'border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-gray-900' : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50'}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 cursor-pointer select-none" onClick={() => setOpen((o) => !o)}>
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className={`w-7 h-7 ${ACCENT[accentColor]} text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0`}>{q.questionNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${hasErr ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : isDone ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700'}`}>{hasErr ? '⚠ error' : isDone ? '✓ ready' : "no answer"}</span>
                    <span className="text-[10px] text-gray-400 hidden sm:block shrink-0">{q.type?.replace(/_/g, ' ')}</span>
                    {q.question && (
                        <span className="text-xs text-gray-400 truncate hidden md:block">
                            {q.question.slice(0, 60)}
                            {q.question.length > 60 ? '…' : ''}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 ml-2 shrink-0">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-400 hover:text-red-600 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
            </div>

            {/* Body */}
            {open && (
                <div className="px-4 pb-4 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-3">
                    {/* Question text */}
                    <div>
                        <label className={lbl}>Question contenti *</label>
                        <textarea value={q.question ?? ''} onChange={(e) => onUpdate('question', e.target.value)} rows={2} placeholder="Question contentini kiriting…" className={`${hasQErr ? 'border-2 border-red-400 bg-red-50 dark:bg-red-900/10' : ''} ${inp}`} />
                        {hasQErr && (
                            <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                                <AlertCircle className="w-3 h-3" /> Question text is required
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Type */}
                        <div>
                            <label className={lbl}>Question turi</label>
                            <select value={q.type ?? qTypes[0]} onChange={(e) => handleTypeChange(e.target.value)} className={sel}>
                                {qTypes.map((t, idx) => (
                                    <option key={idx} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Points */}
                        <div>
                            <label className={lbl}>Ball (1–5)</label>
                            <input type="number" min={1} max={5} value={q.points ?? 1} onChange={(e) => onUpdate('points', Number(e.target.value))} className={inp} />
                        </div>

                        {/* Answer editor */}
                        <QuestionAnswerEditor question={q} onUpdate={onUpdate} />

                        {/* Timestamps */}
                        {showTimestamps && (
                            <>
                                <div>
                                    <label className={lbl}>Audio start (sec)</label>
                                    <input type="number" value={q.timestampStart ?? 0} onChange={(e) => onUpdate('timestampStart', Number(e.target.value))} className={inp} />
                                </div>
                                <div>
                                    <label className={lbl}>Audio end (sec)</label>
                                    <input type="number" value={q.timestampEnd ?? 0} onChange={(e) => onUpdate('timestampEnd', Number(e.target.value))} className={inp} />
                                </div>
                            </>
                        )}
                    </div>

                    {hasAErr && (
                        <p className="flex items-center gap-1 text-xs text-red-500">
                            <AlertCircle className="w-3 h-3" /> Correct answer is required
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuestionRow;

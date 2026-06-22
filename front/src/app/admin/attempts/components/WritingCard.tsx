import { useState } from "react";
import { PenTool, Zap } from "lucide-react";
import { GradeWritingDto, WritingAnswer } from "@/types/attempt.types";
import { BandBadge, fmt, GradeWritingForm } from ".";

export const WritingCard = ({ w, onGrade, isGrading }: { w: WritingAnswer; onGrade: (d: GradeWritingDto) => void; isGrading: boolean }) => {
    const [showGrade, setShowGrade] = useState(false);
    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80">
                <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-xl bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 text-xs font-black">Vazifa {w.taskNumber}</span>
                    <span className="text-xs text-gray-400 tabular-nums">{w.wordCount} so'z</span>
                    {w.submittedAt && <span className="text-xs text-gray-400">{fmt(w.submittedAt)}</span>}
                </div>
                <div className="flex items-center gap-2">
                    {w.isHumanGraded && <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-black">✓ Baholangan</span>}
                    <BandBadge score={w.bandScore} size="sm" />
                    {!w.bandScore && (
                        <button type="button" onClick={() => setShowGrade((v) => !v)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-950/50 rounded-xl hover:bg-violet-200 transition">
                            <PenTool className="w-3.5 h-3.5" /> Bahola
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{w.content}</p>
            </div>

            {w.criteriaScores && (
                <div className="px-4 pb-3 flex gap-2 flex-wrap">
                    {Object.entries(w.criteriaScores).map(([k, v]) => (
                        <span key={k} className="px-2 py-1 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-[10px] text-gray-600 dark:text-gray-400">
                            {k.replace(/([A-Z])/g, ' $1').trim()}: <strong className="text-gray-900 dark:text-white">{v as number}</strong>
                        </span>
                    ))}
                </div>
            )}

            {w.feedback && (
                <div className="mx-4 mb-3 p-3 bg-sky-50 dark:bg-sky-950/30 rounded-xl border border-sky-200/60 dark:border-sky-800/40">
                    <p className="text-[10px] font-black text-sky-600 dark:text-sky-400 mb-1">Feedback</p>
                    <p className="text-xs text-sky-700 dark:text-sky-300">{w.feedback}</p>
                </div>
            )}

            {w.aiFeedback && (
                <div className="mx-4 mb-4 p-3 bg-violet-50 dark:bg-violet-950/30 rounded-xl border border-violet-200/60 dark:border-violet-800/40">
                    <p className="text-[10px] font-black text-violet-600 dark:text-violet-400 mb-1 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> AI Feedback
                    </p>
                    <p className="text-xs text-violet-700 dark:text-violet-300">{w.aiFeedback}</p>
                </div>
            )}

            {showGrade && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800/60">
                    <GradeWritingForm
                        taskNumber={w.taskNumber as 1 | 2}
                        onSubmit={(data) => {
                            onGrade(data);
                            setShowGrade(false);
                        }}
                        isLoading={isGrading}
                        onCancel={() => setShowGrade(false)}
                    />
                </div>
            )}
        </div>
    );
};

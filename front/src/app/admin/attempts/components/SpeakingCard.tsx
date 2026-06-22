import { useState } from "react";
import { GradeSpeakingDto, SpeakingAnswer } from "@/types/attempt.types";
import { BandBadge, GradeSpeakingForm } from ".";
import { ExternalLink, Mic } from "lucide-react";

export const SpeakingCard = ({ s, onGrade, isGrading }: { s: SpeakingAnswer; onGrade: (d: GradeSpeakingDto) => void; isGrading: boolean }) => {
    const [showGrade, setShowGrade] = useState(false);
    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80">
                <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-xl bg-teal-100 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 text-xs font-black">Qism {s.partNumber}</span>
                    <span className="text-xs text-gray-400 tabular-nums">{s.durationSeconds}s</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${s.recordingStatus === 'UPLOADED' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>{s.recordingStatus}</span>
                </div>
                <div className="flex items-center gap-2">
                    {s.isHumanGraded && <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-black">✓ Baholangan</span>}
                    <BandBadge score={s.bandScore} size="sm" />
                    {!s.bandScore && (
                        <button type="button" onClick={() => setShowGrade((v) => !v)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-950/50 rounded-xl hover:bg-violet-200 transition">
                            <Mic className="w-3.5 h-3.5" /> Bahola
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4 space-y-3">
                {s.recordingUrl && (
                    <a href={s.recordingUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold">
                        <ExternalLink className="w-3.5 h-3.5" /> Recording URL
                    </a>
                )}
                {s.transcript && (
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        <p className="text-[10px] text-gray-400 font-black mb-1">TRANSCRIPT</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 italic">"{s.transcript}"</p>
                    </div>
                )}
                {s.criteriaScores && (
                    <div className="flex gap-2 flex-wrap">
                        {Object.entries(s.criteriaScores).map(([k, v]) => (
                            <span key={k} className="px-2 py-1 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-[10px] text-gray-600 dark:text-gray-400">
                                {k.replace(/([A-Z])/g, ' $1').trim()}: <strong>{v as number}</strong>
                            </span>
                        ))}
                    </div>
                )}
                {s.feedback && <p className="text-xs text-sky-600 dark:text-sky-400">Feedback: {s.feedback}</p>}
            </div>

            {showGrade && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800/60">
                    <GradeSpeakingForm
                        partNumber={s.partNumber as 1 | 2 | 3}
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

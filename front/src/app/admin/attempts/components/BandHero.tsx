import { motion } from 'framer-motion';
import { IELTSExamAttempt } from '@/types/attempt.types';

export const BandHero = ({ attempt }: { attempt: IELTSExamAttempt }) => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 rounded-3xl p-6 text-white">
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full -translate-x-1/2 translate-y-1/2 blur-2xl" />

        <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <p className="text-violet-200 text-[10px] font-black uppercase tracking-widest">Umumiy Band Score</p>
                    <div className="flex items-end gap-3 mt-1">
                        <span className="text-6xl font-black tabular-nums leading-none">{attempt.overallBandScore ?? '—'}</span>
                        <span className="text-violet-300 text-base mb-1">/9.0</span>
                    </div>
                </div>
                {attempt.percentageScore != null && (
                    <div className="text-right">
                        <p className="text-violet-200 text-[10px] font-black uppercase tracking-widest mb-1">Foiz</p>
                        <p className="text-4xl font-black tabular-nums">{attempt.percentageScore}%</p>
                    </div>
                )}
            </div>

            {attempt.percentageScore != null && (
                <div className="mb-5">
                    <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${attempt.percentageScore}%` }} transition={{ delay: 0.5, duration: 0.9, ease: 'easeOut' }} className="h-2 bg-white rounded-full" />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: 'Listening', score: attempt.listeningBandScore, raw: attempt.listeningRawScore, emoji: '🎧' },
                    { label: 'Reading', score: attempt.readingBandScore, raw: attempt.readingRawScore, emoji: '📖' },
                    { label: 'Writing', score: attempt.writingBandScore, raw: null, emoji: '✍️' },
                    { label: 'Speaking', score: attempt.speakingBandScore, raw: null, emoji: '🎙' },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }} className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/20">
                        <div className="text-xl mb-1">{s.emoji}</div>
                        <div className="text-2xl font-black tabular-nums">{s.score ?? '—'}</div>
                        <div className="text-violet-200 text-[10px] font-bold mt-0.5">{s.label}</div>
                        {s.raw != null && <div className="text-violet-300 text-[9px] mt-0.5 tabular-nums">raw: {s.raw}</div>}
                    </motion.div>
                ))}
            </div>
        </div>
    </motion.div>
);

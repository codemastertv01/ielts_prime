// sections/ExamListening.tsx
'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Lock, ChevronRight } from 'lucide-react';
import { useExamStore } from '@/stores/examStore';
import QuestionCard from '../components/QuestionCard';
import type { ListeningSection, ListeningPart } from '@/types/exam';
import { Button } from '@/components/UI';

// ─── AudioPlayer ──────────────────────────────────────────────────────────────
/**
 * Auto-plays as soon as audio can play.
 * If `isAlreadyPlayed` → shows "listened" badge without playing.
 * Locks itself (user cannot skip) — IELTS rule.
 */
interface AudioPlayerProps {
    audioUrl: string;
    partKey: string; // unique per part mount to reset effect
    isAlreadyPlayed: boolean;
    volume: number;
    onEnded: () => void;
}

function AudioPlayer({ audioUrl, partKey, isAlreadyPlayed, volume, onEnded }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const startedRef = useRef(false);
    const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const retryCountRef = useRef(0);

    const [status, setStatus] = useState<'loading' | 'playing' | 'done' | 'error'>(isAlreadyPlayed ? 'done' : 'loading');
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (isAlreadyPlayed) {
            setStatus('done');
            return;
        }

        const audio = audioRef.current;
        if (!audio) return;

        startedRef.current = false;
        retryCountRef.current = 0;
        setStatus('loading');
        setCurrentTime(0);
        setDuration(0);

        const tryPlay = (a: HTMLAudioElement) => {
            if (startedRef.current) return;
            startedRef.current = true;
            if (isFinite(a.duration) && a.duration > 0) setDuration(a.duration);
            a.play()
                .then(() => setStatus('playing'))
                .catch((err) => {
                    if (err?.name === 'AbortError' || err?.name === 'NotSupportedError') {
                        startedRef.current = false;
                    } else if (err?.name === 'NotAllowedError') {
                        setStatus('error');
                    } else {
                        startedRef.current = false;
                        if (retryCountRef.current < 3) {
                            retryRef.current = setTimeout(() => {
                                retryCountRef.current++;
                                startedRef.current = false;
                                audioRef.current?.load();
                            }, 1_500);
                        } else {
                            setStatus('error');
                        }
                    }
                });
        };

        const onCanPlay = () => tryPlay(audio);
        const onLoadedData = () => {
            if (!startedRef.current) tryPlay(audio);
        };
        const onLoadedMeta = () => {
            if (audioRef.current && isFinite(audioRef.current.duration)) setDuration(audioRef.current.duration);
        };
        const onTimeUpdate = () => {
            if (!audioRef.current) return;
            setCurrentTime(audioRef.current.currentTime);
            if (isFinite(audioRef.current.duration) && duration === 0) setDuration(audioRef.current.duration);
        };
        const onEndedH = () => {
            setStatus('done');
            onEnded();
        };
        const onError = () => {
            const a = audioRef.current;
            if (!a?.error) return;
            if (a.error.code === MediaError.MEDIA_ERR_ABORTED) return;
            if (a.error.code === MediaError.MEDIA_ERR_NETWORK && retryCountRef.current < 3) {
                retryCountRef.current++;
                startedRef.current = false;
                retryRef.current = setTimeout(() => {
                    const a2 = audioRef.current;
                    if (a2) {
                        a2.src = audioUrl;
                        a2.load();
                    }
                }, 2_000);
                return;
            }
            setStatus('error');
        };

        audio.addEventListener('canplay', onCanPlay, { once: true });
        audio.addEventListener('loadeddata', onLoadedData, { once: true });
        audio.addEventListener('loadedmetadata', onLoadedMeta, { once: true });
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('ended', onEndedH);
        audio.addEventListener('error', onError);

        audio.preload = 'auto';
        audio.src = audioUrl;
        audio.load();

        return () => {
            startedRef.current = false;
            if (retryRef.current) clearTimeout(retryRef.current);
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('loadeddata', onLoadedData);
            audio.removeEventListener('loadedmetadata', onLoadedMeta);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('ended', onEndedH);
            audio.removeEventListener('error', onError);
            audio.pause();
            audio.removeAttribute('src');
            audio.load();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioUrl, partKey]);

    // Sync volume
    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    const fmt = (t: number) => (!isFinite(t) || t < 0 ? '0:00' : `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`);

    const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <>
            <audio ref={audioRef} preload="auto" className="hidden" />

            {status === 'error' && (
                <div className="flex items-center gap-2 p-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Audio yuklanmadi. Internet yoki URL ni tekshiring.
                </div>
            )}

            {status === 'done' && (
                <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-green-300 bg-green-50/40">
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-green-700">Audio tinglandi</p>
                        <p className="text-xs text-gray-400 mt-0.5">Bu qism qayta ijro etilmaydi (IELTS qoidasi)</p>
                    </div>
                </div>
            )}

            {status === 'loading' && (
                <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 bg-gray-50">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-sm text-gray-500">Audio yuklanmoqda…</p>
                </div>
            )}

            {status === 'playing' && (
                <div className="rounded-xl border-2 border-blue-400 bg-blue-50/40 p-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                            <div className="flex items-end gap-0.5 h-4">
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="w-1 bg-white rounded-full animate-bounce"
                                        style={{
                                            height: `${8 + i * 4}px`,
                                            animationDelay: `${i * 0.15}s`,
                                            animationDuration: '0.8s',
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="w-full h-1.5 bg-blue-200 rounded-full overflow-hidden pointer-events-none">
                                <div className="h-full bg-blue-600 rounded-full transition-all duration-200" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-400">
                                <span>{fmt(currentTime)}</span>
                                <span className="text-blue-600 font-medium animate-pulse">● Ijro etilmoqda</span>
                                <span>{fmt(duration)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ─── ExamListening ────────────────────────────────────────────────────────────

interface ExamListeningProps {
    section: ListeningSection;
    /** Global audio volume (0–1) inherited from ExamContainer sound check */
    volume?: number;
    onMoveToNext: () => void;
}

export default function ExamListening({ section, volume = 0.8, onMoveToNext }: ExamListeningProps) {
    const { listeningAnswers, setListeningAnswer, flaggedQuestions, toggleFlag, listeningPlayedParts, markListeningPartPlayed, lockListeningPart, isListeningPartLocked, markSectionCompleted } = useExamStore();

    const [activePart, setActivePart] = useState(0);

    const parts: ListeningPart[] = section.parts ?? [];
    const part = parts[activePart];
    const totalParts = parts.length;

    // Global question numbering offset for this part
    const qOffset = parts.slice(0, activePart).reduce((acc, p) => acc + p.questions.length, 0);

    const currentQs = part?.questions ?? [];
    const partTotalCount = currentQs.length;
    const partAnswered = currentQs.filter((q) => !!listeningAnswers[`${part?.partNumber}_${q.questionNumber}`]).length;
    const allPartAnswered = partTotalCount > 0 && partAnswered === partTotalCount;

    const isPlayed = listeningPlayedParts.includes(activePart);

    const getWordLimit = (qNum: number): string | undefined => {
        const g = (part?.questionGroups ?? []).find((g) => g.questionNumbers?.includes(qNum));
        return g?.wordLimit;
    };

    const handleAudioEnded = useCallback(() => {
        markListeningPartPlayed(activePart);
    }, [activePart, markListeningPartPlayed]);

    const goNext = useCallback(() => {
        lockListeningPart(activePart);
        if (activePart < totalParts - 1) {
            setActivePart(activePart + 1);
        } else {
            markSectionCompleted('listening');
            onMoveToNext();
        }
    }, [activePart, totalParts, lockListeningPart, markSectionCompleted, onMoveToNext]);

    if (!part) return null;

    return (
        <div className="flex flex-col" style={{ height: 'calc(100vh - 126px)' }}>
            <div className="flex-1 overflow-y-auto pb-20">
                <div className="max-w-3xl mx-auto px-6 py-5 space-y-4">
                    {/* Audio player */}
                    {part.audioUrl ? <AudioPlayer key={`audio-part-${activePart}`} audioUrl={part.audioUrl} partKey={`${activePart}`} isAlreadyPlayed={isPlayed} volume={volume} onEnded={handleAudioEnded} /> : <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-sm">⚠️ Bu part uchun audio topilmadi.</div>}

                    {/* Part tabs — forward-only */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {parts.map((p, i) => {
                            const played = listeningPlayedParts.includes(i);
                            const locked = isListeningPartLocked(i);
                            const isActive = i === activePart;
                            // Can only see current; next part accessible after current is done
                            const accessible = isActive || (i === activePart + 1 && allPartAnswered);

                            return (
                                <Button
                                    unstyled
                                    key={i}
                                    onClick={() => {
                                        if (!locked && accessible) setActivePart(i);
                                    }}
                                    disabled={locked || !accessible}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full border transition-all
                    ${isActive ? 'bg-blue-600 text-white border-blue-600' : locked ? 'text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50' : !accessible ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    {locked && <Lock className="w-3 h-3" />}
                                    Part {p.partNumber}
                                    {played && !locked && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                                </Button>
                            );
                        })}
                    </div>

                    {/* Questions */}
                    <div className="space-y-2.5">
                        {(part.questionGroups ?? []).length > 0
                            ? (part.questionGroups ?? []).map((group, gi) => (
                                  <div key={gi} className="space-y-2">
                                      {/* Group header */}
                                      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 space-y-1.5">
                                          <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">{group.groupLabel}</p>
                                          {group.instructions && <p className="text-sm text-gray-600 leading-relaxed italic">{group.instructions}</p>}
                                          {group.wordLimit && <p className="text-xs font-semibold text-blue-600">✏️ {group.wordLimit}</p>}
                                          {(group.matchingPool ?? []).length > 0 && (
                                              <div className="flex flex-wrap gap-1.5 pt-1">
                                                  {(group.matchingPool ?? []).map((opt, i) => (
                                                      <span key={i} className="px-2.5 py-1 rounded text-xs bg-white border border-gray-200 text-gray-700">
                                                          <span className="font-bold text-blue-600 mr-1">{String.fromCharCode(65 + i)}.</span>
                                                          {opt}
                                                      </span>
                                                  ))}
                                              </div>
                                          )}
                                      </div>
                                      {currentQs
                                          .filter((q) => (group.questionNumbers ?? []).includes(q.questionNumber))
                                          .map((q) => {
                                              const li = currentQs.findIndex((x) => x.questionNumber === q.questionNumber);
                                              const gn = qOffset + li + 1;
                                              const sk = `${part.partNumber}_${q.questionNumber}`;
                                              return <QuestionCard key={sk} domId={`lq-${gn}`} globalNum={gn} question={q} answer={listeningAnswers[sk]} isFlagged={flaggedQuestions.includes(gn)} onAnswer={(v) => setListeningAnswer(sk, v)} onFlag={() => toggleFlag(gn)} wordLimit={getWordLimit(q.questionNumber)} />;
                                          })}
                                  </div>
                              ))
                            : currentQs.map((q, i) => {
                                  const gn = qOffset + i + 1;
                                  const sk = `${part.partNumber}_${q.questionNumber}`;
                                  return <QuestionCard key={sk} domId={`lq-${gn}`} globalNum={gn} question={q} answer={listeningAnswers[sk]} isFlagged={flaggedQuestions.includes(gn)} onAnswer={(v) => setListeningAnswer(sk, v)} onFlag={() => toggleFlag(gn)} />;
                              })}
                    </div>

                    {/* Next Part / Finish Listening */}
                    {allPartAnswered && (
                        <div className="flex justify-end pt-2">
                            <Button
                                unstyled
                                onClick={goNext}
                                className={`flex items-center gap-2 px-5 py-2.5 text-white font-semibold text-sm rounded-lg transition-all
                  ${activePart < totalParts - 1 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                {activePart < totalParts - 1 ? 'Next Part' : "Reading ga o'tish"}
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom question navigator */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 px-6 py-2.5">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-gray-500 shrink-0">Part {part.partNumber}</span>
                    <div className="flex items-center justify-center gap-1 flex-1 flex-wrap">
                        {currentQs.map((q, i) => {
                            const gn = qOffset + i + 1;
                            const sk = `${part.partNumber}_${q.questionNumber}`;
                            const ans = listeningAnswers[sk];
                            return (
                                <Button
                                    unstyled
                                    key={i}
                                    onClick={() => document.getElementById(`lq-${gn}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                    className={`w-7 h-7 rounded text-xs font-bold transition-all
                    ${ans ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    {gn}
                                </Button>
                            );
                        })}
                        <span className="text-[11px] text-gray-400 ml-2">
                            {partAnswered}/{partTotalCount}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';
import { useState, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useExamStore } from '@/stores/examStore';
import { useExamTimer, useAntiCheat } from '@/hooks/useExamTimer';
import ExamHeader from './components/ExamHeader';
import ExamStart from './components/ExamStart';
import { SubmitModal, TimeUpModal, PreviousAttemptModal } from './components/Modals';
import ExamListening from './sections/ExamListening';
import ExamReading from './sections/ExamReading';
import ExamWriting from './sections/ExamWriting';
import ExamSpeaking from './sections/ExamSpeaking';
import type { ExamData, SectionId } from '@/types/exam';
import { Button, Input } from '@/components/UI';

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'loading' | 'start' | 'sound_check' | 'exam' | 'submitted';

interface ExamContainerProps {
    examId: string;
    /** Fetch full exam data by id — wire your API/mock here */
    onFetchExam: (examId: string) => Promise<ExamData>;
    /** Called once when a new attempt starts */
    onStartAttempt?: (examId: string) => Promise<any>;
    /** Called every 30 s — persist answers to backend (optional) */
    onAutoSave?: (answers: { listeningAnswers: Record<string, string>; readingAnswers: Record<string, string>; writingTask1: string; writingTask2: string }) => Promise<void>;
    /** Called on final submit — send all data to backend (optional) */
    onSubmitAll?: (answers: { listeningAnswers: Record<string, string>; readingAnswers: Record<string, string>; writingTask1: string; writingTask2: string; speakingRecordings: Record<string, { url: string | null; duration: number }> }) => Promise<void>;
    /** Upload a speaking recording blob — return download URL (optional) */
    onUploadRecording?: (key: string, blob: Blob, duration: number, partNumber: number) => Promise<string>;
    /** Audio URL for the sound-check screen */
    soundCheckUrl?: string;
    /** Called after exam is finished / submitted */
    onFinished?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExamContainer({ examId, onFetchExam, onStartAttempt, onAutoSave, onSubmitAll, onUploadRecording, soundCheckUrl = 'https://fancy-resonance-782b.mirabzalozodov07.workers.dev', onFinished }: ExamContainerProps) {
    // ── Store ──────────────────────────────────────────────────────────────────
    const { _hasHydrated, status, currentSection, warningCount, listeningAnswers, readingAnswers, writingTask1, writingTask2, speakingRecordings, examData: storedExamData, getSectionOrder, canNavigateTo, getListeningProgress, getReadingProgress, markSectionCompleted, setSection, initAttempt, resumeFromStore, resetExam } = useExamStore();

    // ── Local UI state ─────────────────────────────────────────────────────────
    const [phase, setPhase] = useState<Phase>('loading');
    const [examData, setExamData] = useState<ExamData | null>(storedExamData ?? null);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [showResume, setShowResume] = useState(false);
    const [showSubmit, setShowSubmit] = useState(false);
    const [showTimeUp, setShowTimeUp] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Sound check volume (passed to listening section)
    const [audioVolume, setAudioVolume] = useState(0.8);

    // ── Anti-cheat ─────────────────────────────────────────────────────────────
    useAntiCheat(phase === 'exam' && status === 'IN_PROGRESS');

    // ── Hydration & phase init ─────────────────────────────────────────────────
    useEffect(() => {
        if (!_hasHydrated) return;

        if (status === 'IN_PROGRESS' && storedExamData) {
            // Resume from persisted state
            setExamData(storedExamData);
            resumeFromStore();
            setPhase('exam');
            return;
        }

        // Fresh load — fetch exam data
        let cancelled = false;
        onFetchExam(examId)
            .then((data) => {
                if (cancelled) return;
                setExamData(data);
                setPhase('start');
            })
            .catch((err) => {
                if (cancelled) return;
                setFetchError(err?.message ?? 'Exam yuklanmadi');
                setPhase('start');
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_hasHydrated]);

    // ── Section timer expiry ───────────────────────────────────────────────────
    const handleSectionExpired = useCallback(
        (section: string) => {
            markSectionCompleted(section);
            const order = getSectionOrder();
            const nextIdx = order.indexOf(section as SectionId) + 1;
            if (nextIdx < order.length) {
                setSection(order[nextIdx]);
            } else {
                setShowTimeUp(true);
                handleFinalSubmit(true);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [getSectionOrder, markSectionCompleted, setSection]
    );

    // ── Auto-save (every 30 s via timer hook) ─────────────────────────────────
    const handleAutoSave = useCallback(() => {
        onAutoSave?.({ listeningAnswers, readingAnswers, writingTask1, writingTask2 }).catch(() => {
            /* silent — never interrupt exam */
        });
    }, [onAutoSave, listeningAnswers, readingAnswers, writingTask1, writingTask2]);

    // ── Timer ──────────────────────────────────────────────────────────────────
    useExamTimer({
        enabled: phase === 'exam' && status === 'IN_PROGRESS',
        onSectionExpired: handleSectionExpired,
        onAutoSave: onAutoSave ? handleAutoSave : undefined,
    });

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleStartNew = useCallback(async () => {
        if (!examData) return;
        setShowResume(false);
        try {
            const attempt = await onStartAttempt?.(examId); // attempt qaytarsin
            initAttempt(examId, examData);
            // Real attemptId ni store ga yozing
            if (attempt?._id as string) {
                useExamStore.getState().setAttemptId(attempt?._id);
            }
        } catch {}
        setPhase('sound_check');
    }, [examData, examId, onStartAttempt, initAttempt]);

    const handleResume = useCallback(() => {
        if (!storedExamData) return;
        setShowResume(false);
        setExamData(storedExamData);
        resumeFromStore();
        setPhase('exam');
    }, [storedExamData, resumeFromStore]);

    const handleSoundCheckComplete = useCallback((vol: number) => {
        setAudioVolume(vol);
        setPhase('exam');
    }, []);

    const handleMoveToNextSection = useCallback(
        (fromSection: SectionId) => {
            markSectionCompleted(fromSection);
            const order = getSectionOrder();
            const nextIdx = order.indexOf(fromSection) + 1;
            if (nextIdx < order.length) {
                setSection(order[nextIdx]);
            } else {
                setShowSubmit(true);
            }
        },
        [getSectionOrder, markSectionCompleted, setSection]
    );

    const handleFinalSubmit = useCallback(
        async (auto = false) => {
            if (!auto) setIsSubmitting(true);
            try {
                await onSubmitAll?.({
                    listeningAnswers,
                    readingAnswers,
                    writingTask1,
                    writingTask2,
                    speakingRecordings: Object.fromEntries(Object.entries(speakingRecordings).map(([k, v]) => [k, { url: v.url, duration: v.duration }])),
                });
            } catch {
                // silent
            } finally {
                setIsSubmitting(false);
                setShowSubmit(false);
                resetExam();
                setPhase('submitted');
                onFinished?.();
            }
        },
        [onSubmitAll, listeningAnswers, readingAnswers, writingTask1, writingTask2, speakingRecordings, resetExam, onFinished]
    );

    // ── Derived data ───────────────────────────────────────────────────────────

    const enabledSections: { id: SectionId; label: string }[] = (['listening', 'reading', 'writing', 'speaking'] as SectionId[]).filter((id) => examData && (examData as any)[`${id}Section`]?.isEnabled).map((id) => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1) }));

    const listeningProgress = getListeningProgress();
    const readingProgress = getReadingProgress();
    const w1Words = writingTask1.trim().split(/\s+/).filter(Boolean).length;
    const w2Words = writingTask2.trim().split(/\s+/).filter(Boolean).length;

    // ── Render ─────────────────────────────────────────────────────────────────

    if (!_hasHydrated || phase === 'loading') {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="flex h-screen items-center justify-center flex-col gap-4">
                <p className="text-red-600 font-medium">{fetchError}</p>
                <Button unstyled onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                    Qayta urinish
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Start screen ────────────────────────────────────────────────── */}
            {phase === 'start' && examData && (
                <>
                    <ExamStart examData={examData} onStart={handleStartNew} />
                    {showResume && <PreviousAttemptModal onResume={handleResume} onStartNew={handleStartNew} />}
                </>
            )}

            {/* ── Sound check ─────────────────────────────────────────────────── */}
            {phase === 'sound_check' && <SoundCheckPlayerWithVolume audioUrl={soundCheckUrl} onComplete={handleSoundCheckComplete} />}

            {/* ── Exam ────────────────────────────────────────────────────────── */}
            {phase === 'exam' && examData && (
                <div className="flex flex-col h-screen">
                    <ExamHeader
                        sections={enabledSections}
                        currentSection={currentSection}
                        canNavigateTo={canNavigateTo}
                        warningCount={warningCount}
                        onSectionChange={(id) => {
                            if (canNavigateTo(id)) setSection(id);
                        }}
                        onSubmit={() => setShowSubmit(true)}
                        listeningProgress={
                            currentSection === 'listening'
                                ? {
                                      answered: listeningProgress.answered,
                                      total: listeningProgress.total,
                                      allPlayed: listeningProgress.allPlayed,
                                  }
                                : undefined
                        }
                        readingProgress={currentSection === 'reading' ? { answered: readingProgress.answered, total: readingProgress.total } : undefined}
                        writingProgress={currentSection === 'writing' ? { task1Words: w1Words, task2Words: w2Words } : undefined}
                    />

                    <div className="flex-1 overflow-auto">
                        {currentSection === 'listening' && examData.listeningSection && <ExamListening section={examData.listeningSection} volume={audioVolume} onMoveToNext={() => handleMoveToNextSection('listening')} />}
                        {currentSection === 'reading' && examData.readingSection && <ExamReading section={examData.readingSection} onMoveToNext={() => handleMoveToNextSection('reading')} />}
                        {currentSection === 'writing' && examData.writingSection && <ExamWriting section={examData.writingSection} onMoveToNext={() => handleMoveToNextSection('writing')} />}
                        {currentSection === 'speaking' && examData.speakingSection && <ExamSpeaking section={examData.speakingSection} onMoveToNext={() => setShowSubmit(true)} onUploadRecording={onUploadRecording} />}
                    </div>
                </div>
            )}

            {/* ── Time Up modal ───────────────────────────────────────────────── */}
            {showTimeUp && <TimeUpModal onRedirect={() => onFinished?.()} />}

            {/* ── Submit modal ────────────────────────────────────────────────── */}
            {showSubmit && <SubmitModal sections={enabledSections} readingAnswered={Object.keys(readingAnswers).length} listeningAnswered={Object.keys(listeningAnswers).length} writingTask1Words={w1Words} writingTask2Words={w2Words} onConfirm={() => handleFinalSubmit(false)} onCancel={() => setShowSubmit(false)} isSaving={isSubmitting} />}
        </div>
    );
}

// ─── SoundCheckPlayerWithVolume ───────────────────────────────────────────────
// Wraps SoundCheckPlayer so we can capture the chosen volume and pass it
// through onComplete to the parent (which then forwards it to ExamListening).

interface SCPProps {
    audioUrl: string;
    onComplete: (volume: number) => void;
}

function SoundCheckPlayerWithVolume({ audioUrl, onComplete }: SCPProps) {
    // We intercept the volume from SoundCheckPlayer by rendering it and
    // storing volume in local state via a ref-trick.
    // Because SoundCheckPlayer doesn't expose volume in onComplete, we wrap it.
    const [vol, setVol] = useState(0.7);

    return <VolumeCapturingSoundCheck audioUrl={audioUrl} onVolumeChange={setVol} onComplete={() => onComplete(vol)} />;
}

// Inline wrapper that patches SoundCheckPlayer's internal volume out
// by rebuilding a minimal version that also calls onVolumeChange.
import { useRef } from 'react';
import { Volume2, VolumeX, Volume1, CheckCircle2 } from 'lucide-react';

function VolumeCapturingSoundCheck({ audioUrl, onVolumeChange, onComplete }: { audioUrl: string; onVolumeChange: (v: number) => void; onComplete: () => void }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [played, setPlayed] = useState(false);
    const [volume, _setVolume] = useState(0.7);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const setVolume = (v: number) => {
        _setVolume(v);
        onVolumeChange(v);
        if (audioRef.current) audioRef.current.volume = v;
    };

    const play = () => {
        const a = audioRef.current;
        if (!a) return;
        a.currentTime = 0;
        a.volume = volume;
        a.play()
            .then(() => {
                setIsPlaying(true);
                setPlayed(true);
            })
            .catch(() => {});
    };

    const stop = () => {
        audioRef.current?.pause();
        setIsPlaying(false);
    };

    const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
    const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                onTimeUpdate={() => {
                    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
                }}
                onLoadedMetadata={() => {
                    if (audioRef.current && isFinite(audioRef.current.duration)) setDuration(audioRef.current.duration);
                }}
            />
            <div className="w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6">
                <div>
                    <h2 className="text-base font-bold text-gray-900">Sound Check</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Put on your headphones and click <strong>Play sound</strong> to test your audio. Adjust the volume — this will be the volume during the exam.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        unstyled
                        onClick={isPlaying ? stop : play}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all
              ${isPlaying ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                        <VolumeIcon className="w-4 h-4" />
                        {isPlaying ? 'Stop' : 'Play sound'}
                    </Button>
                    {isPlaying && duration > 0 && (
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Volume</span>
                        <span className="font-semibold text-gray-700">{Math.round(volume * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button unstyled onClick={() => setVolume(0)} className="text-gray-400 hover:text-gray-600 shrink-0">
                            <VolumeX className="w-4 h-4" />
                        </Button>
                        <div className="relative flex-1 h-5 flex items-center">
                            <div className="absolute inset-x-0 h-1.5 bg-gray-200 rounded-full">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${volume * 100}%` }} />
                            </div>
                            <Input
                                unstyled
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={volume}
                                onChange={(e) => setVolume(Number(e.target.value))}
                                className="relative w-full h-1.5 appearance-none bg-transparent cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-md
                  [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
                  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600
                  [&::-moz-range-thumb]:border-0"
                            />
                        </div>
                        <Button unstyled onClick={() => setVolume(1)} className="text-gray-400 hover:text-gray-600 shrink-0">
                            <Volume2 className="w-5 h-5" />
                        </Button>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-300 px-7">
                        {['Mute', 'Low', 'Medium', 'High', 'Max'].map((l) => (
                            <span key={l}>{l}</span>
                        ))}
                    </div>
                </div>

                {isPlaying && (
                    <div className="flex items-center justify-center gap-1">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="w-1 bg-blue-400 rounded-full animate-bounce" style={{ height: `${8 + Math.sin(i * 0.8) * 6}px`, animationDelay: `${i * 0.1}s`, animationDuration: '0.7s' }} />
                        ))}
                    </div>
                )}

                {played ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle2 className="w-4 h-4" /> Sound played. Can you hear it clearly?
                        </div>
                        <Button unstyled onClick={onComplete} className="px-10 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-all">
                            Yes, start the exam →
                        </Button>
                    </div>
                ) : (
                    <p className="text-xs text-gray-400 text-center">Play the sound first before continuing</p>
                )}
            </div>
        </div>
    );
}

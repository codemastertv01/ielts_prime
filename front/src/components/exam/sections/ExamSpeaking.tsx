// sections/ExamSpeaking.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { Mic, Square, CheckCircle, Upload, Lock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useExamStore } from '@/stores/examStore';
import type { SpeakingSection } from '@/types/exam';
import { Button } from '@/components/UI';

interface Recording {
    blob: Blob;
    url: string;
    duration: number;
    uploaded: boolean;
    progress: number;
}

interface ExamSpeakingProps {
    section: SpeakingSection;
    onMoveToNext: () => void;
    /** Optional: callback to upload recording to backend */
    onUploadRecording?: (key: string, blob: Blob, duration: number, partNumber: number) => Promise<string>;
}

export default function ExamSpeaking({ section, onMoveToNext, onUploadRecording }: ExamSpeakingProps) {
    const { markSectionCompleted } = useExamStore();

    const [activePart, setActivePart] = useState(0);
    const [recordings, setRecordings] = useState<Record<string, Recording>>({});
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
    const [prepTime, setPrepTime] = useState<number | null>(null);
    const [isPrepping, setIsPrepping] = useState(false);
    const [uploadingKey, setUploadingKey] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const prepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const recordingTimeRef = useRef(0);

    const parts = section.parts ?? [];
    const part = parts[activePart];
    const totalParts = parts.length;

    const totalQ = parts.reduce((a, p) => a + (p.questions?.length ?? 0), 0);
    const totalRecorded = parts.reduce(
        (acc, p) =>
            acc +
            (p.questions ?? []).filter((q) => {
                const key = `part${p.partNumber}_q${q.questionNumber}`;
                return !!recordings[key]?.uploaded;
            }).length,
        0
    );

    const isPartUnlocked = (idx: number): boolean => {
        if (idx === 0) return true;
        const prev = parts[idx - 1];
        if (!prev) return true;
        return (prev.questions ?? []).some((q) => {
            const key = `part${prev.partNumber}_q${q.questionNumber}`;
            return !!recordings[key]?.uploaded;
        });
    };

    const isPartDone = (idx: number): boolean => {
        const p = parts[idx];
        if (!p) return false;
        return (p.questions ?? []).every((q) => {
            const key = `part${p.partNumber}_q${q.questionNumber}`;
            return !!recordings[key]?.uploaded;
        });
    };

    const startRecording = async (key: string) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
            const mr = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mr;
            chunksRef.current = [];
            recordingTimeRef.current = 0;

            mr.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mr.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const localUrl = URL.createObjectURL(blob);
                const duration = recordingTimeRef.current;
                setRecordings((prev) => ({
                    ...prev,
                    [key]: { blob, url: localUrl, duration, uploaded: false, progress: 0 },
                }));
                stream.getTracks().forEach((t) => t.stop());

                // If an upload handler is provided, auto-upload
                if (onUploadRecording) {
                    const partNumber = Number(key.split('_q')[0].replace('part', ''));
                    await handleUpload(key, blob, duration, partNumber);
                }
            };

            mr.start(250);
            setIsRecording(true);
            setActiveQuestion(key);
            setRecordingTime(0);
            recordingTimeRef.current = 0;

            timerRef.current = setInterval(() => {
                setRecordingTime((t) => {
                    recordingTimeRef.current = t + 1;
                    return t + 1;
                });
            }, 1_000);
        } catch {
            alert('Mikrofonga ruxsat berilmadi');
        }
    };

    const stopRecording = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        setActiveQuestion(null);
    };

    const handleUpload = async (key: string, blob: Blob, duration: number, partNumber: number) => {
        if (!onUploadRecording) {
            // No backend — mark as "uploaded" locally
            setRecordings((prev) => ({
                ...prev,
                [key]: { ...prev[key], uploaded: true, progress: 100 },
            }));
            return;
        }
        setUploadingKey(key);
        try {
            const url = await onUploadRecording(key, blob, duration, partNumber);
            setRecordings((prev) => ({
                ...prev,
                [key]: { ...prev[key], uploaded: true, url, progress: 100 },
            }));
        } catch (err: any) {
            alert(err?.message || 'Upload xatosi');
        } finally {
            setUploadingKey(null);
        }
    };

    const startPrep = (seconds: number) => {
        setPrepTime(seconds);
        setIsPrepping(true);
        prepTimerRef.current = setInterval(() => {
            setPrepTime((t) => {
                if (t === null || t <= 1) {
                    clearInterval(prepTimerRef.current!);
                    setIsPrepping(false);
                    return 0;
                }
                return t - 1;
            });
        }, 1_000);
    };

    const handleFinish = () => {
        markSectionCompleted('speaking');
        onMoveToNext();
    };

    useEffect(
        () => () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (prepTimerRef.current) clearInterval(prepTimerRef.current);
        },
        []
    );

    const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    if (!part) return null;

    return (
        <div className="flex flex-col" style={{ height: 'calc(100vh - 126px)' }}>
            <div className="flex-1 overflow-y-auto pb-16">
                <div className="max-w-3xl mx-auto px-6 py-5 space-y-4">
                    {/* Part info */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                        <p className="text-sm font-bold text-gray-700">
                            Part {part.partNumber} — {part.title}
                        </p>
                        <p className="text-sm text-gray-500">{part.durationMinutes} minutes</p>
                    </div>

                    {/* Cue card */}
                    {part.cueCardTopic && (
                        <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-amber-800">Cue Card</h3>
                                {(part.preparationTimeSeconds ?? 0) > 0 && !isPrepping && prepTime === null && (
                                    <Button unstyled onClick={() => startPrep(part.preparationTimeSeconds!)} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs rounded-lg font-medium">
                                        Start {part.preparationTimeSeconds}s Prep
                                    </Button>
                                )}
                                {isPrepping && <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-sm font-bold rounded-lg animate-pulse">Tayyorlanish: {prepTime}s</span>}
                                {!isPrepping && prepTime === 0 && <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-lg font-medium">✓ Tayyorlanish tugadi</span>}
                            </div>
                            <p className="font-semibold text-gray-800">{part.cueCardTopic}</p>
                            {(part.cueCardPoints ?? []).length > 0 && (
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500">You should say:</p>
                                    {(part.cueCardPoints ?? []).map((pt, i) => (
                                        <p key={i} className="text-sm text-gray-700">
                                            • {pt}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Questions */}
                    <div className="space-y-3">
                        {(part.questions ?? []).map((q) => {
                            const key = `part${part.partNumber}_q${q.questionNumber}`;
                            const rec = recordings[key];
                            const isActive = activeQuestion === key && isRecording;
                            const isUploading = uploadingKey === key;

                            return (
                                <div
                                    key={key}
                                    className={`rounded-xl border-2 p-4 transition-all
                    ${isActive ? 'border-red-400 bg-red-50' : rec?.uploaded ? 'border-green-300 bg-green-50/30' : rec ? 'border-yellow-300' : 'border-gray-200'}`}
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${rec?.uploaded ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{q.questionNumber}</span>
                                        <p className="text-sm text-gray-800 leading-relaxed flex-1">{q.question}</p>
                                    </div>

                                    <div className="flex items-center gap-3 ml-10 flex-wrap">
                                        {isActive ? (
                                            <Button unstyled onClick={stopRecording} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium animate-pulse">
                                                <Square className="w-4 h-4" /> Stop · {fmtTime(recordingTime)}
                                            </Button>
                                        ) : (
                                            <Button
                                                unstyled
                                                onClick={() => startRecording(key)}
                                                disabled={isRecording || isUploading}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                          ${isRecording || isUploading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                                            >
                                                <Mic className="w-4 h-4" />
                                                {rec ? 'Qayta yozish' : 'Yozishni boshlash'}
                                            </Button>
                                        )}

                                        {rec && (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <audio src={rec.url} controls className="h-8 max-w-[180px]" />
                                                {isUploading ? (
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-20 bg-gray-200 rounded-full h-1.5">
                                                            <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${rec.progress ?? 0}%` }} />
                                                        </div>
                                                        <span className="text-xs text-gray-500">{rec.progress ?? 0}%</span>
                                                    </div>
                                                ) : rec.uploaded ? (
                                                    <span className="flex items-center gap-1 text-xs text-green-600">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Saqlandi
                                                    </span>
                                                ) : onUploadRecording ? (
                                                    <Button
                                                        unstyled
                                                        onClick={() => {
                                                            const partNumber = Number(key.split('_q')[0].replace('part', ''));
                                                            handleUpload(key, rec.blob, rec.duration, partNumber);
                                                        }}
                                                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                                    >
                                                        <Upload className="w-3.5 h-3.5" /> Yuklash
                                                    </Button>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-xs text-green-600">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Tayyor
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {q.suggestedTimeSeconds && <p className="text-xs text-gray-400 ml-10 mt-2">~{q.suggestedTimeSeconds}s tavsiya etiladi</p>}
                                    {(q.followUpQuestions ?? []).length > 0 && (
                                        <div className="ml-10 mt-2 space-y-0.5">
                                            {(q.followUpQuestions ?? []).map((fq, fi) => (
                                                <p key={fi} className="text-xs text-gray-500">
                                                    ↳ {fq}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Navigation */}
                    {isPartDone(activePart) && activePart < totalParts - 1 && (
                        <div className="flex justify-end pt-2">
                            <Button unstyled onClick={() => setActivePart(activePart + 1)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-all">
                                Next Part <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                    {isPartDone(activePart) && activePart === totalParts - 1 && (
                        <div className="flex justify-end pt-2">
                            <Button unstyled onClick={handleFinish} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-lg transition-all">
                                Finish Speaking <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 px-6 py-2.5">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-gray-500 shrink-0">Part {part.partNumber}</span>
                    <div className="flex items-center gap-2 flex-1 flex-wrap">
                        {parts.map((p, i) => {
                            const done = isPartDone(i);
                            const unlocked = isPartUnlocked(i);
                            const isActive = i === activePart;
                            return (
                                <Button
                                    unstyled
                                    key={i}
                                    onClick={() => {
                                        if (unlocked) setActivePart(i);
                                    }}
                                    disabled={!unlocked}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full border transition-all ${isActive ? 'bg-red-600 text-white border-red-600' : !unlocked ? 'text-gray-300 border-gray-200 cursor-not-allowed' : done ? 'bg-green-50 text-green-700 border-green-200' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    {!unlocked && <Lock className="w-3 h-3" />}
                                    Part {p.partNumber}
                                    {done && !isActive && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                                </Button>
                            );
                        })}

                        <div className="ml-auto flex items-center gap-2">
                            <div className="w-24 h-1 rounded-full bg-gray-200 overflow-hidden">
                                <div className="h-full bg-red-500 transition-all" style={{ width: `${totalQ > 0 ? (totalRecorded / totalQ) * 100 : 0}%` }} />
                            </div>
                            <span className="text-xs text-gray-500">
                                {totalRecorded}/{totalQ}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

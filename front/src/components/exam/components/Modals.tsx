// components/exam/Modals.tsx
'use client';
import { useEffect, useState } from 'react';
import { AlertTriangle, Check, Loader2, X, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/UI';

// ─── Submit Modal ─────────────────────────────────────────────────────────────

interface SubmitModalProps {
    sections: { id: string; label: string }[];
    readingAnswered: number;
    listeningAnswered: number;
    writingTask1Words: number;
    writingTask2Words: number;
    onConfirm: () => void;
    onCancel: () => void;
    isSaving?: boolean;
}

export function SubmitModal({ sections, readingAnswered, listeningAnswered, writingTask1Words, writingTask2Words, onConfirm, onCancel, isSaving = false }: SubmitModalProps) {
    const warnings: string[] = [];
    if (sections.find((s) => s.id === 'reading') && readingAnswered === 0) warnings.push('Reading: Hech qanday javob kiritilmagan');
    if (sections.find((s) => s.id === 'listening') && listeningAnswered === 0) warnings.push('Listening: Hech qanday javob kiritilmagan');
    if (sections.find((s) => s.id === 'writing')) {
        if (writingTask1Words < 150) warnings.push(`Writing Task 1: ${writingTask1Words}/150 so'z`);
        if (writingTask2Words < 250) warnings.push(`Writing Task 2: ${writingTask2Words}/250 so'z`);
    }

    const statItems = [
        sections.find((s) => s.id === 'reading') && {
            label: 'Reading',
            val: `${readingAnswered} javob`,
            ok: readingAnswered > 0,
        },
        sections.find((s) => s.id === 'listening') && {
            label: 'Listening',
            val: `${listeningAnswered} javob`,
            ok: listeningAnswered > 0,
        },
        sections.find((s) => s.id === 'writing') && {
            label: 'Task 1',
            val: `${writingTask1Words} so'z`,
            ok: writingTask1Words >= 150,
        },
        sections.find((s) => s.id === 'writing') && {
            label: 'Task 2',
            val: `${writingTask2Words} so'z`,
            ok: writingTask2Words >= 250,
        },
    ].filter(Boolean) as { label: string; val: string; ok: boolean }[];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md overflow-hidden shadow-2xl">
                <div className="h-0.5 bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500" />
                <div className="px-7 py-6 space-y-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Imtihonni topshirish?</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Topshirgandan so'ng javoblarni o'zgartirib bo'lmaydi.</p>
                        </div>
                        <Button unstyled onClick={onCancel} disabled={isSaving} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {warnings.length > 0 && (
                        <div className="bg-amber-50 ring-1 ring-amber-200 rounded-xl p-4 space-y-2">
                            <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider">
                                <AlertTriangle className="w-3.5 h-3.5" /> Ogohlantirishlar
                            </div>
                            {warnings.map((w, i) => (
                                <p key={i} className="text-xs text-amber-700 flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5">•</span> {w}
                                </p>
                            ))}
                        </div>
                    )}

                    {statItems.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                            {statItems.map((stat, i) => (
                                <div key={i} className={`rounded-xl p-3.5 ring-1 ${stat.ok ? 'bg-emerald-50 ring-emerald-200' : 'bg-red-50 ring-red-200'}`}>
                                    <p className="text-[11px] text-gray-400 mb-1">{stat.label}</p>
                                    <p className={`text-sm font-bold ${stat.ok ? 'text-emerald-700' : 'text-red-600'}`}>{stat.val}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="h-px bg-gray-100" />

                    <div className="flex gap-2.5">
                        <Button unstyled onClick={onCancel} disabled={isSaving} className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 transition-all disabled:opacity-50">
                            Davom etish
                        </Button>
                        <Button unstyled onClick={onConfirm} disabled={isSaving} className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Topshirilmoqda...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" /> Topshirish
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── TimeUp Modal ─────────────────────────────────────────────────────────────

interface TimeUpModalProps {
    onRedirect: () => void;
}

export function TimeUpModal({ onRedirect }: TimeUpModalProps) {
    const [countdown, setCountdown] = useState(10);
    const circumference = 2 * Math.PI * 34;

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onRedirect();
                    return 0;
                }
                return prev - 1;
            });
        }, 1_000);
        return () => clearInterval(timer);
    }, [onRedirect]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-sm overflow-hidden shadow-2xl relative z-10">
                <div className="h-0.5 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />
                <div className="px-7 pt-7 pb-5 border-b border-gray-100 text-center">
                    <div className="w-12 h-12 rounded-2xl mx-auto mb-4 bg-red-50 ring-1 ring-red-200 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Vaqt tugadi!</h2>
                    <p className="text-sm text-gray-400 mt-1">Imtihon vaqtingiz yakunlandi</p>
                </div>

                <div className="px-7 py-6 space-y-5">
                    <div className="flex items-center gap-3 bg-emerald-50 ring-1 ring-emerald-200 rounded-xl p-4">
                        <div className="w-8 h-8 rounded-xl shrink-0 bg-emerald-100 ring-1 ring-emerald-200 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-emerald-700">Javoblar saqlandi</p>
                            <p className="text-xs text-gray-400 mt-0.5">Barcha javoblaringiz avtomatik topshirildi.</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <p className="text-xs text-gray-400 uppercase tracking-widest">Yo'naltirilmoqda</p>
                        <div className="relative w-16 h-16">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                                <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" className="text-gray-200" strokeWidth="5" />
                                <circle cx="40" cy="40" r="34" fill="none" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - countdown / 10)} style={{ transition: 'stroke-dashoffset 1s linear' }} />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-gray-900">{countdown}</span>
                            </div>
                        </div>
                    </div>

                    <Button unstyled onClick={onRedirect} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]">
                        Natijalarni ko'rish <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── PreviousAttemptModal ─────────────────────────────────────────────────────

interface PreviousAttemptModalProps {
    onResume: () => void;
    onStartNew: () => void;
}

export function PreviousAttemptModal({ onResume, onStartNew }: PreviousAttemptModalProps) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md overflow-hidden shadow-2xl">
                <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />
                <div className="p-6 space-y-5">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl shrink-0 bg-amber-50 ring-1 ring-amber-200 flex items-center justify-center text-2xl">⚠️</div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Saqlangan imtihon topildi</h2>
                            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">Oldingi tugallanmagan urinishingiz mavjud. Davom etasizmi yoki yangi boshlaysizmi?</p>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-1">
                        <Button unstyled onClick={onStartNew} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-all">
                            Yangi urinish
                        </Button>
                        <Button unstyled onClick={onResume} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.01]">
                            Davom etish ↗
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

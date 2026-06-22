// components/exam/ExamHeader.tsx
'use client';
import { Headphones, BookOpen, PenLine, Mic, Clock, AlertTriangle, LogOut, CheckCircle2 } from 'lucide-react';
import { useRemainingTime, useExamStore } from '@/stores/examStore';
import type { SectionId } from '@/types/exam';
import { Button } from '@/components/UI';

// Re-export the hook from the right place for convenience
export { useRemainingTime };

const ICONS: Record<string, React.ReactNode> = {
    listening: <Headphones className="w-3.5 h-3.5" />,
    reading: <BookOpen className="w-3.5 h-3.5" />,
    writing: <PenLine className="w-3.5 h-3.5" />,
    speaking: <Mic className="w-3.5 h-3.5" />,
};

interface ExamHeaderProps {
    sections: { id: SectionId; label: string }[];
    currentSection: SectionId;
    canNavigateTo: (s: string) => boolean;
    warningCount: number;
    onSectionChange: (id: SectionId) => void;
    onSubmit: () => void;
    listeningProgress?: { answered: number; total: number; allPlayed: boolean };
    readingProgress?: { answered: number; total: number };
    writingProgress?: { task1Words: number; task2Words: number };
}

export default function ExamHeader({ sections, currentSection, canNavigateTo, warningCount, onSectionChange, onSubmit, listeningProgress, readingProgress, writingProgress }: ExamHeaderProps) {
    const remaining = useExamStore((s) => s.sectionRemainingSeconds[s.currentSection] ?? 0);
    const clamped = Math.max(0, remaining);
    const m = Math.floor(clamped / 60);
    const sec = clamped % 60;
    const display = `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    const isLow = clamped <= 300 && clamped > 60;
    const isCritical = clamped <= 60;

    const order = sections.map((s) => s.id);
    const currentIndex = order.indexOf(currentSection);

    return (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="flex items-center justify-between px-6 py-2.5 gap-4">
                {/* Brand + warnings */}
                <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-gray-900 text-sm">IELTS Mock</span>
                    {warningCount > 0 && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full border border-red-200">
                            <AlertTriangle className="w-3 h-3" /> {warningCount}
                        </span>
                    )}
                </div>

                {/* Section tabs */}
                <nav className="flex gap-1">
                    {sections.map((s) => {
                        const ti = order.indexOf(s.id);
                        const isActive = s.id === currentSection;
                        const isDone = ti < currentIndex;
                        const canGo = !isDone && canNavigateTo(s.id);

                        return (
                            <Button
                                unstyled
                                key={s.id}
                                onClick={() => {
                                    if (canGo) onSectionChange(s.id);
                                }}
                                title={isDone ? 'Completed — cannot go back' : !canGo ? 'Complete current section first' : undefined}
                                className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full border transition-all
                  ${isActive ? 'bg-blue-600 text-white border-blue-600' : isDone ? 'bg-white text-gray-400 border-gray-200 cursor-not-allowed' : canGo ? 'bg-white text-gray-600 border-blue-300 hover:bg-blue-50 cursor-pointer' : 'bg-white text-gray-300 border-gray-100 cursor-not-allowed'}`}
                            >
                                {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> : ICONS[s.id]}
                                {s.label}
                            </Button>
                        );
                    })}
                </nav>

                {/* Timer + Finish */}
                <div className="flex items-center gap-3 shrink-0">
                    <div
                        className={`flex items-center gap-1.5 px-3 py-1.5 font-mono font-bold text-sm rounded-lg transition-colors
              ${isCritical ? 'text-red-600 bg-red-50 animate-pulse' : isLow ? 'text-orange-500 bg-orange-50' : 'text-gray-800'}`}
                    >
                        <Clock className="w-4 h-4" /> {display}
                    </div>
                    <Button unstyled onClick={onSubmit} className="flex items-center gap-1.5 px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all">
                        <LogOut className="w-4 h-4" /> Finish
                    </Button>
                </div>
            </div>

            {/* Section progress bar */}
            {currentSection === 'listening' && listeningProgress && <ProgressBar answered={listeningProgress.answered} total={listeningProgress.total} suffix={!listeningProgress.allPlayed ? ' • listen to all audio parts' : ''} />}
            {currentSection === 'reading' && readingProgress && <ProgressBar answered={readingProgress.answered} total={readingProgress.total} />}
            {currentSection === 'writing' && writingProgress && (
                <div className="px-6 pb-2 flex items-center gap-4">
                    <span className={`text-[11px] font-medium ${writingProgress.task1Words >= 150 ? 'text-green-600' : 'text-gray-400'}`}>Task 1: {writingProgress.task1Words}/150</span>
                    <span className={`text-[11px] font-medium ${writingProgress.task2Words >= 250 ? 'text-green-600' : 'text-gray-400'}`}>Task 2: {writingProgress.task2Words}/250</span>
                </div>
            )}
        </div>
    );
}

function ProgressBar({ answered, total, suffix = '' }: { answered: number; total: number; suffix?: string }) {
    const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
    return (
        <div className="px-6 pb-2 flex items-center gap-3">
            <div className="flex-1 h-0.5 bg-gray-100">
                <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[11px] text-gray-400">
                {answered}/{total} questions{suffix}
            </span>
        </div>
    );
}

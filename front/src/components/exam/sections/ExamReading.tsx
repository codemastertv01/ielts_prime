// sections/ExamReading.tsx
'use client';
import { useState, useCallback, useRef } from 'react';
import { CheckCircle2, Lock, ChevronRight, Highlighter } from 'lucide-react';
import { useExamStore } from '@/stores/examStore';
import QuestionCard from '../components/QuestionCard';
import type { ReadingSection, ReadingPassage } from '@/types/exam';
import { Button } from '@/components/UI';

// ─── Highlightable text ───────────────────────────────────────────────────────

const HIGHLIGHT_COLORS = [
    { value: 'bg-yellow-200', border: 'border-yellow-400' },
    { value: 'bg-green-200', border: 'border-green-400' },
    { value: 'bg-blue-200', border: 'border-blue-400' },
    { value: 'bg-pink-200', border: 'border-pink-400' },
];

interface Highlight {
    id: string;
    start: number;
    end: number;
    color: string;
}

function HighlightableText({ text }: { text: string }) {
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [activeColor, setActiveColor] = useState(HIGHLIGHT_COLORS[0].value);
    const [highlightMode, setHighlightMode] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);

    const handleMouseUp = useCallback(() => {
        if (!highlightMode) return;
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !textRef.current) return;
        const range = sel.getRangeAt(0);
        const pre = document.createRange();
        pre.selectNodeContents(textRef.current);
        pre.setEnd(range.startContainer, range.startOffset);
        const start = pre.toString().length;
        const end = start + range.toString().length;
        if (start === end) return;
        setHighlights((prev) => [...prev, { id: `h${Date.now()}`, start, end, color: activeColor }]);
        sel.removeAllRanges();
    }, [highlightMode, activeColor]);

    const renderText = () => {
        if (!highlights.length) return <span>{text}</span>;
        const events: { pos: number; type: 'start' | 'end'; id: string; color: string }[] = [];
        highlights.forEach((h) => {
            events.push({ pos: h.start, type: 'start', id: h.id, color: h.color });
            events.push({ pos: h.end, type: 'end', id: h.id, color: h.color });
        });
        events.sort((a, b) => a.pos - b.pos);
        const parts: React.ReactNode[] = [];
        let cursor = 0;
        let active: { id: string; color: string } | null = null;
        events.forEach((ev, i) => {
            if (ev.pos > cursor) {
                parts.push(
                    active ? (
                        <mark key={`t${i}`} className={`${active.color} cursor-pointer rounded-sm`} onClick={() => setHighlights((p) => p.filter((h) => h.id !== active!.id))}>
                            {text.slice(cursor, ev.pos)}
                        </mark>
                    ) : (
                        <span key={`t${i}`}>{text.slice(cursor, ev.pos)}</span>
                    )
                );
            }
            cursor = ev.pos;
            active = ev.type === 'start' ? { id: ev.id, color: ev.color } : null;
        });
        if (cursor < text.length) parts.push(<span key="last">{text.slice(cursor)}</span>);
        return <>{parts}</>;
    };

    return (
        <div>
            {/* Highlight toolbar */}
            <div className="flex items-center gap-2 px-6 py-2 border-b border-gray-100 sticky top-0 bg-white z-10">
                <Button
                    unstyled
                    onClick={() => setHighlightMode((m) => !m)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all
            ${highlightMode ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                    <Highlighter className="w-3.5 h-3.5" /> Highlight
                </Button>
                {highlightMode && HIGHLIGHT_COLORS.map((c) => <Button unstyled key={c.value} onClick={() => setActiveColor(c.value)} className={`w-5 h-5 rounded border-2 transition-all ${c.value} ${activeColor === c.value ? c.border + ' scale-110' : 'border-transparent'}`} />)}
                {highlightMode && highlights.length > 0 && (
                    <Button unstyled onClick={() => setHighlights([])} className="text-xs text-red-400 hover:text-red-600 ml-1">
                        Clear
                    </Button>
                )}
            </div>
            <div ref={textRef} onMouseUp={handleMouseUp} className="px-6 py-5 text-sm text-gray-700 leading-8 whitespace-pre-wrap select-text">
                {renderText()}
            </div>
        </div>
    );
}

// ─── ExamReading ──────────────────────────────────────────────────────────────

interface ExamReadingProps {
    section: ReadingSection;
    onMoveToNext: () => void;
}

export default function ExamReading({ section, onMoveToNext }: ExamReadingProps) {
    const { readingAnswers, setReadingAnswer, flaggedQuestions, toggleFlag, completedPassages, unlockPassage, markSectionCompleted } = useExamStore();

    const [activePassage, setActivePassage] = useState(0);

    const passages: ReadingPassage[] = section.passages ?? [];
    const passage = passages[activePassage];
    if (!passage) return null;

    const passageNum = passage.passageNumber ?? activePassage + 1;
    const passageQs = passage.questions ?? [];

    const isPassageDone = (idx: number): boolean => {
        const p = passages[idx];
        if (!p) return false;
        const pNum = p.passageNumber ?? idx + 1;
        const total = p.questions?.length ?? 0;
        const answered = (p.questions ?? []).filter((q) => !!readingAnswers[`${pNum}_${q.questionNumber}`]).length;
        return total > 0 && answered === total;
    };

    // Passage N is unlocked if passage N-1 is done (answered) OR explicitly completed
    const isUnlocked = (idx: number): boolean => {
        if (idx === 0) return true;
        return completedPassages.includes(idx - 1) || isPassageDone(idx - 1);
    };

    const isCurrentDone = isPassageDone(activePassage);

    const handleNextPassage = () => {
        unlockPassage(activePassage);
        setActivePassage((p) => p + 1);
    };

    const handleFinish = () => {
        unlockPassage(activePassage);
        markSectionCompleted('reading');
        onMoveToNext();
    };

    // Global question offset
    const qOffset = passages.slice(0, activePassage).reduce((acc, p) => acc + (p.questions?.length ?? 0), 0);

    return (
        <div className="flex flex-col" style={{ height: 'calc(100vh - 126px)' }}>
            {/* Passage tabs */}
            <div className="flex gap-2 p-2 bg-gray-100 border-b">
                {passages.map((p, i) => {
                    const unlocked = isUnlocked(i);
                    const done = isPassageDone(i);
                    return (
                        <Button
                            unstyled
                            key={i}
                            onClick={() => {
                                if (unlocked) setActivePassage(i);
                            }}
                            disabled={!unlocked}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activePassage === i ? 'bg-blue-600 text-white' : unlocked ? 'bg-white text-gray-700 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        >
                            Passage {i + 1}
                            {done && activePassage !== i && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                            {!unlocked && <Lock className="w-3 h-3" />}
                        </Button>
                    );
                })}
            </div>

            {/* Split: passage text | questions */}
            <div className="flex-1 flex overflow-hidden">
                {/* Passage text */}
                <div className="w-1/2 overflow-y-auto border-r border-gray-200 bg-white">
                    <div className="px-6 pt-5">
                        <h2 className="font-bold text-xl mb-4">{passage.title}</h2>
                    </div>
                    {passage.content ? <HighlightableText text={passage.content} /> : <p className="px-6 text-sm text-gray-400 italic">No passage content provided.</p>}
                </div>

                {/* Questions */}
                <div className="w-1/2 overflow-y-auto bg-gray-50 p-6">
                    <div className="space-y-3">
                        {passageQs.map((q, idx) => {
                            const globalNum = qOffset + idx + 1;
                            const key = `${passageNum}_${q.questionNumber}`;
                            return <QuestionCard key={key} domId={`rq-${globalNum}`} globalNum={globalNum} question={q} answer={readingAnswers[key]} isFlagged={flaggedQuestions.includes(globalNum)} onAnswer={(v) => setReadingAnswer(key, v)} onFlag={() => toggleFlag(globalNum)} />;
                        })}
                    </div>

                    {/* Mini navigator */}
                    <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex flex-wrap gap-1.5">
                            {passageQs.map((q, idx) => {
                                const globalNum = qOffset + idx + 1;
                                const key = `${passageNum}_${q.questionNumber}`;
                                const ans = readingAnswers[key];
                                return (
                                    <Button
                                        unstyled
                                        key={idx}
                                        onClick={() => document.getElementById(`rq-${globalNum}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                        className={`w-7 h-7 rounded text-xs font-bold transition-all
                      ${ans ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                    >
                                        {globalNum}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Navigation */}
                    {isCurrentDone && activePassage < passages.length - 1 && (
                        <div className="flex justify-end pt-4">
                            <Button unstyled onClick={handleNextPassage} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-all">
                                Next Passage <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                    {isCurrentDone && activePassage === passages.length - 1 && (
                        <div className="flex justify-end pt-4">
                            <Button unstyled onClick={handleFinish} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-lg transition-all">
                                Finish Reading <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

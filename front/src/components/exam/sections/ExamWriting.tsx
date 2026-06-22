// sections/ExamWriting.tsx
'use client';
import { useState, useCallback } from 'react';
import { ChevronRight, CheckCircle2, Lock } from 'lucide-react';
import { useExamStore } from '@/stores/examStore';
import type { WritingSection } from '@/types/exam';
import { Button, Textarea } from '@/components/UI';

const countWords = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length;

interface ExamWritingProps {
    section: WritingSection;
    onMoveToNext: () => void;
}

export default function ExamWriting({ section, onMoveToNext }: ExamWritingProps) {
    const { writingTask1, writingTask2, setWritingTask1, setWritingTask2, markSectionCompleted } = useExamStore();

    const [activeTask, setActiveTask] = useState(1);
    const [confirmedTasks, setConfirmedTasks] = useState<number[]>([]);

    const tasks = section?.tasks ?? [];
    const task = tasks.find((t) => t.taskNumber === activeTask);

    const content = activeTask === 1 ? writingTask1 : writingTask2;
    const setContent = useCallback((v: string) => (activeTask === 1 ? setWritingTask1(v) : setWritingTask2(v)), [activeTask, setWritingTask1, setWritingTask2]);

    const w1 = countWords(writingTask1);
    const w2 = countWords(writingTask2);
    const minWords = task?.minimumWords ?? (activeTask === 1 ? 150 : 250);
    const wordCount = countWords(content);

    const isTaskUnlocked = (taskNum: number): boolean => {
        if (taskNum === 1) return true;
        const prev = tasks[taskNum - 2];
        if (!prev) return true;
        const prevWords = prev.taskNumber === 1 ? w1 : w2;
        const prevMin = prev.minimumWords ?? (prev.taskNumber === 1 ? 150 : 250);
        return prevWords >= prevMin || confirmedTasks.includes(prev.taskNumber);
    };

    const handleConfirmAndNext = () => {
        setConfirmedTasks((prev) => (prev.includes(activeTask) ? prev : [...prev, activeTask]));
        if (activeTask < tasks.length) setActiveTask(activeTask + 1);
    };

    const handleFinish = () => {
        setConfirmedTasks((prev) => (prev.includes(activeTask) ? prev : [...prev, activeTask]));
        markSectionCompleted('writing');
        onMoveToNext();
    };

    if (!task) return null;

    const totalTasks = tasks.length;
    const answeredTasks = [w1 >= 150 ? 1 : 0, w2 >= 250 ? 1 : 0].filter(Boolean).length;

    return (
        <div className="flex flex-col" style={{ height: 'calc(100vh - 126px)' }}>
            <div className="flex-1 flex overflow-hidden">
                {/* Left: task prompt */}
                <div className="w-1/2 overflow-y-auto border-r border-gray-200 bg-white">
                    <div className="p-6 space-y-4">
                        <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">WRITING TASK {task.taskNumber}</p>
                        <p className="text-sm text-gray-500">
                            Spend about {task.suggestedTimeMinutes ?? (activeTask === 1 ? 20 : 40)} minutes on this task. Write at least {minWords} words.
                        </p>
                        <div className="border border-gray-300 rounded p-4 bg-white">
                            <p className="text-sm text-gray-800 leading-relaxed italic">{task.prompt}</p>
                        </div>
                        {task.imageUrl && <img src={task.imageUrl} alt="Task diagram" className="w-full max-w-lg rounded border border-gray-200" />}
                        {(task.essayDirectives ?? []).length > 0 && (
                            <ul className="space-y-1">
                                {(task.essayDirectives ?? []).map((d, i) => (
                                    <li key={i} className="text-sm text-gray-600 italic">
                                        • {d}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Right: textarea */}
                <div className="w-1/2 flex flex-col bg-white">
                    <Textarea unstyled value={content} onChange={(e) => setContent(e.target.value)} placeholder={`Write Task ${activeTask} here...`} className="flex-1 w-full px-6 pt-5 pb-4 text-sm text-gray-900 resize-none outline-none leading-relaxed" />
                    <div className="px-6 py-2 bg-white border-t border-gray-100 flex items-center justify-between">
                        <span className={`text-sm font-medium ${wordCount >= minWords ? 'text-green-600' : 'text-gray-400'}`}>
                            Words: {wordCount} / {minWords}
                        </span>
                        {wordCount >= minWords && (
                            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Min. reached
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 px-6 py-2.5">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-gray-500 shrink-0">Task {activeTask}</span>

                    <div className="flex items-center gap-2 flex-1">
                        {tasks.map((t) => {
                            const tc = t.taskNumber === 1 ? writingTask1 : writingTask2;
                            const tw = countWords(tc);
                            const tmin = t.minimumWords ?? (t.taskNumber === 1 ? 150 : 250);
                            const isActive = activeTask === t.taskNumber;
                            const isDone = tw >= tmin;
                            const unlocked = isTaskUnlocked(t.taskNumber);

                            return (
                                <Button
                                    unstyled
                                    key={t.taskNumber}
                                    onClick={() => {
                                        if (unlocked) setActiveTask(t.taskNumber);
                                    }}
                                    disabled={!unlocked}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full border transition-all
                    ${isActive ? 'bg-blue-600 text-white border-blue-600' : !unlocked ? 'text-gray-300 border-gray-200 cursor-not-allowed' : isDone ? 'bg-green-50 text-green-700 border-green-200' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    {!unlocked && <Lock className="w-3 h-3" />}
                                    Task {t.taskNumber}
                                    {isDone && !isActive && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                                    {!isDone && !isActive && unlocked && (
                                        <span className="text-[10px] text-gray-400">
                                            {tw}/{tmin}
                                        </span>
                                    )}
                                </Button>
                            );
                        })}

                        <div className="ml-auto flex items-center gap-2">
                            <div className="w-24 h-1 rounded-full bg-gray-200 overflow-hidden">
                                <div className="h-full bg-blue-500 transition-all" style={{ width: `${totalTasks > 0 ? (answeredTasks / totalTasks) * 100 : 0}%` }} />
                            </div>
                            <span className="text-xs text-gray-500">
                                {answeredTasks}/{totalTasks}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {activeTask < tasks.length && (
                            <Button unstyled onClick={handleConfirmAndNext} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all">
                                Next Task <ChevronRight className="w-4 h-4" />
                            </Button>
                        )}
                        {activeTask === tasks.length && (
                            <Button unstyled onClick={handleFinish} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-all">
                                Speaking ga o'tish <ChevronRight className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

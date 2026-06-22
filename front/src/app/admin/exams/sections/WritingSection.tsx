'use client';
import { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, PenLine, Plus, Trash2 } from 'lucide-react';
import type { WritingTask, WritingTaskSubtype } from '@/types/exam';
import { QuestionTypeEnum, WritingTaskSubtypeEnum } from '@/types/exam';
import { inp, lbl, sel } from '@/constants/exam';
import { makeWritingTask } from '@/utils/exam';
import ImageUpload from '../components/ImageUpload';

interface Props {
    tasks: WritingTask[];
    setTasks: (t: WritingTask[]) => void;
    fieldErrors?: string[];
}

const ACADEMIC_T1 = [
    { value: WritingTaskSubtypeEnum.LINE_GRAPH, label: 'Line Graph' },
    { value: WritingTaskSubtypeEnum.BAR_CHART, label: 'Bar Chart' },
    { value: WritingTaskSubtypeEnum.PIE_CHART, label: 'Pie Chart' },
    { value: WritingTaskSubtypeEnum.TABLE, label: 'Table' },
    { value: WritingTaskSubtypeEnum.MAP, label: 'Map' },
    { value: WritingTaskSubtypeEnum.PROCESS_DIAGRAM, label: 'Process Diagram' },
    { value: WritingTaskSubtypeEnum.MIXED_CHARTS, label: 'Mixed Charts' },
];
const GENERAL_T1 = [
    { value: WritingTaskSubtypeEnum.FORMAL_LETTER, label: 'Formal Letter' },
    { value: WritingTaskSubtypeEnum.SEMI_FORMAL_LETTER, label: 'Semi-formal Letter' },
    { value: WritingTaskSubtypeEnum.PERSONAL_LETTER, label: 'Personal Letter' },
];
const T2_TYPES = [
    { value: WritingTaskSubtypeEnum.OPINION_ESSAY, label: 'Opinion Essay' },
    { value: WritingTaskSubtypeEnum.DISCUSSION_ESSAY, label: 'Discussion Essay' },
    { value: WritingTaskSubtypeEnum.ADVANTAGE_DISADVANTAGE_ESSAY, label: 'Advantages/Disadvantages' },
    { value: WritingTaskSubtypeEnum.PROBLEM_SOLUTION_ESSAY, label: 'Problem/Solution' },
    { value: WritingTaskSubtypeEnum.TWO_PART_QUESTION_ESSAY, label: 'Two-part Question' },
];
const LETTER_TYPES: WritingTaskSubtype[] = [WritingTaskSubtypeEnum.FORMAL_LETTER, WritingTaskSubtypeEnum.SEMI_FORMAL_LETTER, WritingTaskSubtypeEnum.PERSONAL_LETTER];

const getSubtypes = (type: string) => {
    if (type === QuestionTypeEnum.TASK_1_ACADEMIC) return ACADEMIC_T1;
    if (type === QuestionTypeEnum.TASK_1_GENERAL) return GENERAL_T1;
    return T2_TYPES;
};
const isLetter = (sub?: WritingTaskSubtype) => (sub ? LETTER_TYPES.includes(sub) : false);
const isVisual = (type: string) => type === QuestionTypeEnum.TASK_1_ACADEMIC || type === QuestionTypeEnum.TASK_1_GENERAL;

const WritingSection = ({ tasks, setTasks, fieldErrors = [] }: Props) => {
    const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
    const toggle = (idx: number) => setCollapsed((p) => ({ ...p, [idx]: !p[idx] }));

    const addTask = () => {
        if (tasks.length >= 2) return;
        setTasks([...tasks, makeWritingTask(tasks.length)]);
    };

    const update = (idx: number, field: string, value: any) => {
        const updated = [...tasks];
        updated[idx] = { ...updated[idx], [field]: value };
        setTasks(updated);
    };

    const deleteTask = (idx: number) => setTasks(tasks.filter((_, i) => i !== idx).map((t, i) => ({ ...t, taskNumber: i + 1 })));

    const sectionError = fieldErrors.includes('writing_section');

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <PenLine className="w-5 h-5 text-emerald-500" /> Writing Section
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {tasks.length}/2 task
                        {tasks.length === 2 && <span className="ml-1 text-green-500 font-medium">✓ complete</span>}
                    </p>
                </div>
                <button type="button" onClick={addTask} disabled={tasks.length >= 2} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-all">
                    <Plus className="w-4 h-4" /> Task add
                </button>
            </div>

            {sectionError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/10 border border-red-200 rounded-xl px-4 py-2.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> At least one task must be added
                </div>
            )}

            {tasks.length === 0 && !sectionError && (
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-14 text-center">
                    <PenLine className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 mb-1">No tasks yet</p>
                    <p className="text-xs text-gray-400 mb-3">Task 1: 150 words, 20 minutes · Task 2: 250 words, 40 minutes</p>
                    <button type="button" onClick={addTask} className="text-sm text-emerald-600 hover:underline font-semibold">
                        + First taskni add
                    </button>
                </div>
            )}

            {tasks.map((task, idx) => {
                const isOpen = !collapsed[idx];
                const hasErr = fieldErrors.includes(`wtask_${idx}_prompt`);
                return (
                    <div key={idx} className={`border-2 rounded-xl overflow-hidden transition-colors ${hasErr ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'}`}>
                        {/* Task header */}
                        <div className={`px-5 py-3.5 flex items-center justify-between border-b ${hasErr ? 'bg-red-50 dark:bg-red-900/10 border-red-200' : 'bg-emerald-50 dark:bg-emerald-900/15 border-gray-200 dark:border-gray-700'}`}>
                            <button type="button" onClick={() => toggle(idx)} className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                Task {task.taskNumber} — {task.type?.replace(/_/g, ' ')}
                                {task.subtype && <span className="font-normal text-gray-500 ml-1">({task.subtype?.replace(/_/g, ' ')})</span>}
                                {hasErr && (
                                    <span className="flex items-center gap-1 text-xs text-red-500 font-bold ml-2">
                                        <AlertCircle className="w-3 h-3" /> Errorlik
                                    </span>
                                )}
                            </button>
                            <button type="button" onClick={() => deleteTask(idx)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-400 hover:text-red-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {isOpen && (
                            <div className="p-5 space-y-4">
                                {/* Type / Subtype / Min words / Time */}
                                <div className="grid grid-cols-4 gap-4">
                                    <div>
                                        <label className={lbl}>Type</label>
                                        <select
                                            value={task.type}
                                            onChange={(e) => {
                                                const t = e.target.value;
                                                update(idx, 'type', t);
                                                update(idx, 'subtype', getSubtypes(t)[0]?.value);
                                            }}
                                            className={sel}
                                        >
                                            <option value={QuestionTypeEnum.TASK_1_ACADEMIC}>Task 1 Academic</option>
                                            <option value={QuestionTypeEnum.TASK_1_GENERAL}>Task 1 General</option>
                                            <option value={QuestionTypeEnum.TASK_2}>Task 2</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={lbl}>Kichik tur</label>
                                        <select value={task.subtype ?? ''} onChange={(e) => update(idx, 'subtype', e.target.value)} className={sel}>
                                            {getSubtypes(task.type).map((s) => (
                                                <option key={s.value} value={s.value}>
                                                    {s.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={lbl}>Min words</label>
                                        <input type="number" value={task.minimumWords} onChange={(e) => update(idx, 'minimumWords', Number(e.target.value))} className={inp} />
                                    </div>
                                    <div>
                                        <label className={lbl}>Time (minutes)</label>
                                        <input type="number" value={task.suggestedTimeMinutes} onChange={(e) => update(idx, 'suggestedTimeMinutes', Number(e.target.value))} className={inp} />
                                    </div>
                                </div>

                                {/* Prompt */}
                                <div>
                                    <label className={lbl}>Task contenti *</label>
                                    <textarea value={task.prompt} onChange={(e) => update(idx, 'prompt', e.target.value)} rows={6} placeholder="The chart below shows..." className={`${inp} ${hasErr ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : ''}`} />
                                    {hasErr && <p className="text-xs text-red-500 mt-1">Task prompt must not be empty</p>}
                                </div>

                                {/* Visual uploads — ImageUpload (URL + upload + preview + replace) */}
                                {isVisual(task.type) && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <ImageUpload value={task.imageUrl ?? ''} onChange={(url) => update(idx, 'imageUrl', url)} label="Chart / Image" hint="PNG, JPG, WEBP · Max 10MB" previewHeight={160} />
                                            <ImageUpload value={task.secondImageUrl ?? ''} onChange={(url) => update(idx, 'secondImageUrl', url)} label="Second image (optional)" hint="PNG, JPG, WEBP · Max 10MB" previewHeight={160} />
                                        </div>
                                        <div>
                                            <label className={lbl}>Image caption</label>
                                            <input type="text" value={task.visualCaption ?? ''} onChange={(e) => update(idx, 'visualCaption', e.target.value)} placeholder="1-rasm: Osiyo shaharlashuvi 1970–2040" className={inp} />
                                        </div>
                                    </div>
                                )}

                                {/* Letter fields */}
                                {isLetter(task.subtype) && (
                                    <div className="bg-sky-50 dark:bg-sky-900/15 border border-sky-200 dark:border-sky-800/50 rounded-xl p-4 space-y-3">
                                        <h4 className="text-sm font-bold text-sky-800 dark:text-sky-300">Xat tafsilotlari</h4>
                                        <div>
                                            <label className={lbl}>Murojaat</label>
                                            <input type="text" value={task.letterSalutationHint ?? ''} onChange={(e) => update(idx, 'letterSalutationHint', e.target.value)} placeholder="Dear Mr Brown," className={inp} />
                                        </div>
                                        <div>
                                            <label className={lbl}>Nuqtalar (har qatorga bitta)</label>
                                            <textarea value={(task.letterBulletPoints ?? []).join('\n')} onChange={(e) => update(idx, 'letterBulletPoints', e.target.value.split('\n').filter(Boolean))} rows={3} className={inp} placeholder="explain why you are writing" />
                                        </div>
                                    </div>
                                )}

                                {/* Essay directives */}
                                {(task.type === QuestionTypeEnum.TASK_2 || task.type === QuestionTypeEnum.TASK_2_ESSAY) && (
                                    <div>
                                        <label className={lbl}>Essay directives (one per line)</label>
                                        <textarea value={(task.essayDirectives ?? []).join('\n')} onChange={(e) => update(idx, 'essayDirectives', e.target.value.split('\n').filter(Boolean))} rows={3} className={inp} placeholder="To what extent do you agree?" />
                                    </div>
                                )}

                                {/* Assessment criteria */}
                                <div>
                                    <label className={lbl}>Assessment criteria (comma separated)</label>
                                    <input
                                        type="text"
                                        value={(task.assessmentCriteria ?? []).join(', ')}
                                        onChange={(e) =>
                                            update(
                                                idx,
                                                'assessmentCriteria',
                                                e.target.value
                                                    .split(',')
                                                    .map((c) => c.trim())
                                                    .filter(Boolean)
                                            )
                                        }
                                        placeholder="Task Achievement, Coherence and Cohesion…"
                                        className={inp}
                                    />
                                </div>

                                {/* Examiner notes */}
                                <div>
                                    <label className={lbl}>Examchi eslatmalari (admin)</label>
                                    <input type="text" value={task.examinerNotes ?? ''} onChange={(e) => update(idx, 'examinerNotes', e.target.value)} className={inp} />
                                </div>

                                {/* Sample answer */}
                                <div>
                                    <label className={lbl}>Sample answer (optional)</label>
                                    <textarea value={task.sampleAnswer ?? ''} onChange={(e) => update(idx, 'sampleAnswer', e.target.value)} rows={6} className={`${inp} font-mono text-[12px]`} />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default WritingSection;

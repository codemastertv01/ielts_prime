'use client';
import { inp, lbl, READING_Q_TYPES } from '@/constants';
import { ReadingPassage } from '@/types/exam';
import { makeReadingPassage, makeReadingQuestion } from '@/utils/exam';
import { AlertCircle, BookOpen, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import QuestionRow from '../components/QuestionRow';

interface Props {
    passages: ReadingPassage[];
    setPassages: (p: ReadingPassage[]) => void;
    fieldErrors?: string[];
}

const ReadingSection = ({ passages, setPassages, fieldErrors = [] }: Props) => {
    const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
    const toggle = (idx: number) => setCollapsed((p) => ({ ...p, [idx]: !p[idx] }));

    const addPassage = () => {
        if (passages.length >= 3) return;
        setPassages([...passages, makeReadingPassage(passages.length + 1)]);
    };

    const updatePassage = (idx: number, field: string, value: any) => {
        const updated = [...passages];
        if (field === 'content') {
            updated[idx] = { ...updated[idx], content: value, wordCount: value.trim().split(/\s+/).filter(Boolean).length };
        } else {
            updated[idx] = { ...updated[idx], [field]: value };
        }
        setPassages(updated);
    };

    const deletePassage = (idx: number) => setPassages(passages.filter((_, i) => i !== idx).map((p, i) => ({ ...p, passageNumber: i + 1 })));

    const addQuestion = (pIdx: number) => {
        const updated = [...passages];
        updated[pIdx] = { ...updated[pIdx], questions: [...updated[pIdx].questions, makeReadingQuestion(updated[pIdx].questions.length + 1)] };
        setPassages(updated);
    };

    const updateQuestion = (pIdx: number, qIdx: number, field: string, value: any) => {
        const updated = [...passages];
        updated[pIdx].questions[qIdx] = { ...updated[pIdx].questions[qIdx], [field]: value };
        setPassages(updated);
    };

    const deleteQuestion = (pIdx: number, qIdx: number) => {
        const updated = [...passages];
        updated[pIdx] = {
            ...updated[pIdx],
            questions: updated[pIdx].questions.filter((_, i) => i !== qIdx).map((q, i) => ({ ...q, questionNumber: i + 1 })),
        };
        setPassages(updated);
    };

    const totalQ = passages.reduce((s, p) => s + (p.questions?.length ?? 0), 0);
    const sectionError = fieldErrors.includes('reading_section');

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-500" /> Reading Section
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        IELTS: 3 ta content, ~40 ta question &nbsp;·&nbsp; {passages.length}/3 content &nbsp;·&nbsp; {totalQ} question
                    </p>
                </div>
                <button type="button" onClick={addPassage} disabled={passages.length >= 3} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-all">
                    <Plus className="w-4 h-4" /> Passage add
                </button>
            </div>

            {sectionError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/10 border border-red-200 rounded-xl px-4 py-2.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> At least one passage must be added
                </div>
            )}

            {passages.length === 0 && !sectionError && (
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-14 text-center">
                    <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 mb-2">No passages added yet</p>
                    <button type="button" onClick={addPassage} className="text-sm text-blue-600 hover:underline font-semibold">
                        + First contentni add
                    </button>
                </div>
            )}

            {passages.map((passage, pIdx) => {
                const pHasErr = fieldErrors.some((f) => f.startsWith(`passage_${pIdx}`));
                const isOpen = !collapsed[pIdx];
                return (
                    <div key={pIdx} className={`border-2 rounded-xl overflow-hidden transition-colors ${pHasErr ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'}`}>
                        {/* Passage header */}
                        <div className={`px-5 py-3.5 flex items-center justify-between border-b ${pHasErr ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-blue-50 dark:bg-blue-900/15 border-gray-200 dark:border-gray-700'}`}>
                            <button type="button" onClick={() => toggle(pIdx)} className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                Passage {passage.passageNumber}
                                {passage.title && <span className="font-normal text-gray-500"> — {passage.title}</span>}
                                {pHasErr && (
                                    <span className="flex items-center gap-1 text-xs text-red-500 font-bold ml-2">
                                        <AlertCircle className="w-3 h-3" /> Errorlik
                                    </span>
                                )}
                            </button>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span>{passage.questions?.length ?? 0} question</span>
                                <span>{passage.wordCount ?? 0} words</span>
                                <button type="button" onClick={() => deletePassage(pIdx)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-400 hover:text-red-600 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {isOpen && (
                            <div className="p-5 space-y-4">
                                {/* Row 1: Title + Source */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={lbl}>Title *</label>
                                        <input type="text" value={passage.title} onChange={(e) => updatePassage(pIdx, 'title', e.target.value)} placeholder="The History of Amber" className={`${inp} ${fieldErrors.includes(`passage_${pIdx}_title`) ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : ''}`} />
                                        {fieldErrors.includes(`passage_${pIdx}_title`) && <p className="text-xs text-red-500 mt-1">Title is missing</p>}
                                    </div>
                                    <div>
                                        <label className={lbl}>Source (optional)</label>
                                        <input type="text" value={passage.source ?? ''} onChange={(e) => updatePassage(pIdx, 'source', e.target.value)} placeholder="National Geographic, 2019" className={inp} />
                                    </div>
                                </div>

                                {/* Content */}
                                <div>
                                    <label className={lbl}>
                                        Passage * &nbsp;<span className="font-normal normal-case text-gray-400">({passage.wordCount ?? 0} words)</span>
                                    </label>
                                    <textarea value={passage.content} onChange={(e) => updatePassage(pIdx, 'content', e.target.value)} rows={12} placeholder="Enter the passage content here..." className={`${inp} font-mono text-[12px] leading-relaxed ${fieldErrors.includes(`passage_${pIdx}_content`) ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : ''}`} />
                                    {fieldErrors.includes(`passage_${pIdx}_content`) && <p className="text-xs text-red-500 mt-1">Passage must not be empty</p>}
                                </div>

                                {/* Keywords + Paragraph labels */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={lbl}>Keywords (comma separated)</label>
                                        <input
                                            type="text"
                                            value={(passage.keywords ?? []).join(', ')}
                                            onChange={(e) =>
                                                updatePassage(
                                                    pIdx,
                                                    'keywords',
                                                    e.target.value
                                                        .split(',')
                                                        .map((k) => k.trim())
                                                        .filter(Boolean)
                                                )
                                            }
                                            placeholder="amber, fossil, history"
                                            className={inp}
                                        />
                                    </div>
                                    <div>
                                        <label className={lbl}>Paragraph labels (comma separated)</label>
                                        <input
                                            type="text"
                                            value={(passage.paragraphLabels ?? []).join(', ')}
                                            onChange={(e) =>
                                                updatePassage(
                                                    pIdx,
                                                    'paragraphLabels',
                                                    e.target.value
                                                        .split(',')
                                                        .map((k) => k.trim())
                                                        .filter(Boolean)
                                                )
                                            }
                                            placeholder="A, B, C, D, E, F"
                                            className={inp}
                                        />
                                    </div>
                                </div>

                                {/* Questions */}
                                <div className="pt-2 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Questionlar ({passage.questions?.length ?? 0})</h4>
                                        <button type="button" onClick={() => addQuestion(pIdx)} className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:underline">
                                            <Plus className="w-3.5 h-3.5" /> Question add
                                        </button>
                                    </div>
                                    {fieldErrors.includes(`passage_${pIdx}_questions`) && (
                                        <p className="flex items-center gap-1 text-xs text-red-500">
                                            <AlertCircle className="w-3 h-3" /> At least one question is required
                                        </p>
                                    )}
                                    {!passage.questions || passage.questions.length === 0 ? (
                                        <div className="border border-dashed border-gray-200 rounded-xl py-6 text-center">
                                            <p className="text-xs text-gray-400 mb-1">No questions yet</p>
                                            <button type="button" onClick={() => addQuestion(pIdx)} className="text-xs text-blue-600 hover:underline font-medium">
                                                + First questionni add
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {passage.questions.map((q, qIdx) => (
                                                <QuestionRow key={qIdx} q={q} qIdx={qIdx} qTypes={READING_Q_TYPES} accentColor="blue" fieldErrors={fieldErrors.filter((f) => f.startsWith(`passage_${pIdx}`))} onUpdate={(f, v) => updateQuestion(pIdx, qIdx, f, v)} onDelete={() => deleteQuestion(pIdx, qIdx)} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ReadingSection;

'use client';
import { useState } from 'react';
import { Mic, Plus, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { SpeakingPart, SpeakingPartTypeEnum } from '@/types/exam';
import { inp, lbl } from '@/constants';
import { makeSpeakingPart, makeSpeakingQuestion } from '@/utils/exam';

interface Props {
    parts: SpeakingPart[];
    setParts: (p: SpeakingPart[]) => void;
    fieldErrors?: string[];
}

const SpeakingSection = ({ parts, setParts, fieldErrors = [] }: Props) => {
    const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
    const toggle = (idx: number) => setCollapsed((p) => ({ ...p, [idx]: !p[idx] }));

    const addPart = () => {
        if (parts.length >= 3) return;
        setParts([...parts, makeSpeakingPart(parts.length)]);
    };

    const updatePart = (idx: number, field: string, value: any) => {
        const updated = [...parts];
        updated[idx] = { ...updated[idx], [field]: value };
        setParts(updated);
    };

    const deletePart = (idx: number) => setParts(parts.filter((_, i) => i !== idx).map((p, i) => ({ ...p, partNumber: i + 1 })));

    const addQuestion = (pIdx: number) => {
        const updated = [...parts];
        const num = updated[pIdx].questions.length + 1;
        updated[pIdx] = { ...updated[pIdx], questions: [...updated[pIdx].questions, makeSpeakingQuestion(num)] };
        setParts(updated);
    };

    const updateQuestion = (pIdx: number, qIdx: number, field: string, value: any) => {
        const updated = [...parts];
        updated[pIdx].questions[qIdx] = { ...updated[pIdx].questions[qIdx], [field]: value };
        setParts(updated);
    };

    const deleteQuestion = (pIdx: number, qIdx: number) => {
        const updated = [...parts];
        updated[pIdx] = {
            ...updated[pIdx],
            questions: updated[pIdx].questions.filter((_, i) => i !== qIdx).map((q, i) => ({ ...q, questionNumber: i + 1 })),
        };
        setParts(updated);
    };

    const sectionError = fieldErrors.includes('speaking_section');

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Mic className="w-5 h-5 text-rose-500" /> Speaking Section
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {parts.length}/3 parts
                        {parts.length === 3 && <span className="ml-1 text-green-500 font-medium">✓ complete</span>}
                    </p>
                </div>
                <button type="button" onClick={addPart} disabled={parts.length >= 3} className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-all">
                    <Plus className="w-4 h-4" /> Part {parts.length + 1} add
                </button>
            </div>

            {sectionError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/10 border border-red-200 rounded-xl px-4 py-2.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> At least one part must be added
                </div>
            )}

            {parts.length === 0 && !sectionError && (
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-14 text-center">
                    <Mic className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 mb-1">Add 3 parts</p>
                    <p className="text-xs text-gray-400 mb-3">Part 1: Interview · Part 2: Cue Card · Part 3: Discussion</p>
                    <button type="button" onClick={addPart} className="text-sm text-rose-500 hover:underline font-semibold">
                        + Add part 1
                    </button>
                </div>
            )}

            {parts.map((part, pIdx) => {
                const pHasErr = fieldErrors.some((f) => f.startsWith(`spart_${pIdx}`));
                const isOpen = !collapsed[pIdx];
                return (
                    <div key={pIdx} className={`border-2 rounded-xl overflow-hidden transition-colors ${pHasErr ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'}`}>
                        {/* Part header */}
                        <div className={`px-5 py-3.5 flex items-center justify-between border-b ${pHasErr ? 'bg-red-50 dark:bg-red-900/10 border-red-200' : 'bg-rose-50 dark:bg-rose-900/15 border-gray-200 dark:border-gray-700'}`}>
                            <button type="button" onClick={() => toggle(pIdx)} className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                {part.title || `Part ${part.partNumber}`}
                                {pHasErr && (
                                    <span className="flex items-center gap-1 text-xs text-red-500 font-bold ml-2">
                                        <AlertCircle className="w-3 h-3" /> Errorlik
                                    </span>
                                )}
                            </button>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full font-medium">{part.questions?.length ?? 0} question</span>
                                <span>{part.durationMinutes} minutes</span>
                                <button type="button" onClick={() => deletePart(pIdx)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-400 hover:text-red-600 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {isOpen && (
                            <div className="p-5 space-y-4">
                                {/* Title + Duration */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={lbl}>Title</label>
                                        <input type="text" value={part.title} onChange={(e) => updatePart(pIdx, 'title', e.target.value)} className={inp} />
                                    </div>
                                    <div>
                                        <label className={lbl}>Davomiylik (minutes)</label>
                                        <input type="number" value={part.durationMinutes} onChange={(e) => updatePart(pIdx, 'durationMinutes', Number(e.target.value))} className={inp} />
                                    </div>
                                </div>

                                {/* Timing settings */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className={lbl}>Minimum speaking time (sec)</label>
                                        <input type="number" value={part.minimumSpeakingSeconds ?? 60} onChange={(e) => updatePart(pIdx, 'minimumSpeakingSeconds', Number(e.target.value))} className={inp} />
                                    </div>
                                    <div>
                                        <label className={lbl}>Maximum speaking time (sec)</label>
                                        <input type="number" value={part.maximumSpeakingSeconds ?? 120} onChange={(e) => updatePart(pIdx, 'maximumSpeakingSeconds', Number(e.target.value))} className={inp} />
                                    </div>
                                    <div>
                                        <label className={lbl}>Preparation time (sec)</label>
                                        <input type="number" value={part.preparationTimeSeconds ?? 0} onChange={(e) => updatePart(pIdx, 'preparationTimeSeconds', Number(e.target.value))} className={inp} />
                                    </div>
                                </div>

                                {/* Cue Card (Part 2) */}
                                {part.partType === SpeakingPartTypeEnum.LONG_TURN_CUE_CARD && (
                                    <div className="bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 space-y-3">
                                        <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">Cue Card</h4>
                                        <div>
                                            <label className={lbl}>Mavzu *</label>
                                            <input type="text" value={part.cueCardTopic ?? ''} onChange={(e) => updatePart(pIdx, 'cueCardTopic', e.target.value)} placeholder="Describe a time when you helped someone…" className={inp} />
                                        </div>
                                        <div>
                                            <label className={lbl}>Nuqtalar (har qatorga bitta)</label>
                                            <textarea value={(part.cueCardPoints ?? []).join('\n')} onChange={(e) => updatePart(pIdx, 'cueCardPoints', e.target.value.split('\n').filter(Boolean))} rows={4} className={inp} placeholder={'What it was\nWhen it happened\nHow you felt'} />
                                        </div>
                                    </div>
                                )}

                                {/* Discussion theme (Part 3) */}
                                {part.partType === SpeakingPartTypeEnum.ANALYTICAL_DISCUSSION && (
                                    <div>
                                        <label className={lbl}>Discussion theme</label>
                                        <input type="text" value={part.discussionTheme ?? ''} onChange={(e) => updatePart(pIdx, 'discussionTheme', e.target.value)} placeholder="Food and cooking, Cultural traditions…" className={inp} />
                                    </div>
                                )}

                                {/* Questions */}
                                <div className="pt-2 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Questionlar ({part.questions?.length ?? 0})</h4>
                                        <button type="button" onClick={() => addQuestion(pIdx)} className="flex items-center gap-1.5 text-sm text-rose-500 font-semibold hover:underline">
                                            <Plus className="w-3.5 h-3.5" /> Question add
                                        </button>
                                    </div>
                                    {fieldErrors.includes(`spart_${pIdx}_questions`) && (
                                        <p className="flex items-center gap-1 text-xs text-red-500">
                                            <AlertCircle className="w-3 h-3" /> At least one question is required
                                        </p>
                                    )}

                                    {part.questions.map((q, qIdx) => (
                                        <div key={qIdx} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-black">{q.questionNumber}</span>
                                                <button type="button" onClick={() => deleteQuestion(pIdx, qIdx)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-400 transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div>
                                                <label className={lbl}>Question *</label>
                                                <input type="text" value={q.question} onChange={(e) => updateQuestion(pIdx, qIdx, 'question', e.target.value)} placeholder="Do you enjoy cooking? Why/why not?" className={`${inp} ${fieldErrors.includes(`spart_${pIdx}_q${qIdx}_text`) ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : ''}`} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className={lbl}>Follow-up questions (comma separated)</label>
                                                    <input
                                                        type="text"
                                                        value={(q.followUpQuestions ?? []).join(', ')}
                                                        onChange={(e) =>
                                                            updateQuestion(
                                                                pIdx,
                                                                qIdx,
                                                                'followUpQuestions',
                                                                e.target.value
                                                                    .split(',')
                                                                    .map((s) => s.trim())
                                                                    .filter(Boolean)
                                                            )
                                                        }
                                                        placeholder="Why not?, How often?"
                                                        className={inp}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={lbl}>Suggested time (sec)</label>
                                                    <input type="number" value={q.suggestedTimeSeconds ?? 30} onChange={(e) => updateQuestion(pIdx, qIdx, 'suggestedTimeSeconds', Number(e.target.value))} className={inp} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className={lbl}>Language tips (comma separated)</label>
                                                    <input
                                                        type="text"
                                                        value={(q.languageTips ?? []).join(', ')}
                                                        onChange={(e) =>
                                                            updateQuestion(
                                                                pIdx,
                                                                qIdx,
                                                                'languageTips',
                                                                e.target.value
                                                                    .split(',')
                                                                    .map((s) => s.trim())
                                                                    .filter(Boolean)
                                                            )
                                                        }
                                                        placeholder="Use past tense, Describe feelings"
                                                        className={inp}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={lbl}>Mavzu kategoriyasi</label>
                                                    <input type="text" value={q.topicCategory ?? ''} onChange={(e) => updateQuestion(pIdx, qIdx, 'topicCategory', e.target.value)} placeholder="Food, Travel, Education" className={inp} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className={lbl}>Sample answer (optional)</label>
                                                <textarea value={q.sampleAnswer ?? ''} onChange={(e) => updateQuestion(pIdx, qIdx, 'sampleAnswer', e.target.value)} rows={3} className={inp} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default SpeakingSection;

'use client';
import { AlertCircle, ChevronDown, ChevronUp, Headphones, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import QuestionRow from '../components/QuestionRow';
import { inp, lbl, LISTENING_Q_TYPES } from '@/constants/exam';
import type { ListeningPart } from '@/types/exam';
import { makeListeningPart, makeListeningQuestion } from '@/utils/exam';
import AudioUpload from '../components/AudioUpload';

interface Props {
    parts: ListeningPart[];
    setParts: (p: ListeningPart[]) => void;
    fieldErrors?: string[];
}

const ListeningSection = ({ parts, setParts, fieldErrors = [] }: Props) => {
    const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
    const toggle = (idx: number) => setCollapsed((p) => ({ ...p, [idx]: !p[idx] }));

    const addPart = () => {
        if (parts.length >= 4) return;
        setParts([...parts, makeListeningPart(parts.length + 1)]);
    };

    const updatePart = (idx: number, field: string, value: any) => {
        const updated = [...parts];
        updated[idx] = { ...updated[idx], [field]: value };
        setParts(updated);
    };

    const deletePart = (idx: number) => setParts(parts.filter((_, i) => i !== idx).map((p, i) => ({ ...p, partNumber: i + 1 })));

    const addQuestion = (pIdx: number) => {
        const updated = [...parts];
        updated[pIdx] = {
            ...updated[pIdx],
            questions: [...updated[pIdx].questions, makeListeningQuestion(updated[pIdx].questions.length + 1)],
        };
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

    const totalQ = parts.reduce((s, p) => s + (p.questions?.length ?? 0), 0);
    const sectionError = fieldErrors.includes('listening_section');

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Headphones className="w-5 h-5 text-purple-500" /> Listening Section
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        IELTS: 4 parts, ~40 questions · {parts.length}/4 parts · {totalQ} questions
                    </p>
                </div>
                <button type="button" onClick={addPart} disabled={parts.length >= 4} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-all">
                    <Plus className="w-4 h-4" /> Add part
                </button>
            </div>

            {sectionError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/10 border border-red-200 rounded-xl px-4 py-2.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> At least one part must be added
                </div>
            )}

            {parts.length === 0 && !sectionError && (
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-14 text-center">
                    <Headphones className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 mb-2">No parts added yet</p>
                    <button type="button" onClick={addPart} className="text-sm text-purple-600 hover:underline font-semibold">
                        + Add part 1
                    </button>
                </div>
            )}

            {parts.map((part, pIdx) => {
                const pHasErr = fieldErrors.some((f) => f.startsWith(`lpart_${pIdx}`));
                const isOpen = !collapsed[pIdx];
                return (
                    <div key={pIdx} className={`border-2 rounded-xl overflow-hidden transition-colors ${pHasErr ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'}`}>
                        {/* Part header */}
                        <div className={`px-5 py-3.5 flex items-center justify-between border-b ${pHasErr ? 'bg-red-50 dark:bg-red-900/10 border-red-200' : 'bg-purple-50 dark:bg-purple-900/15 border-gray-200 dark:border-gray-700'}`}>
                            <button type="button" onClick={() => toggle(pIdx)} className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                Part {part.partNumber}
                                {part.title && <span className="font-normal text-gray-500"> — {part.title}</span>}
                                {pHasErr && (
                                    <span className="flex items-center gap-1 text-xs text-red-500 font-bold ml-2">
                                        <AlertCircle className="w-3 h-3" /> Error
                                    </span>
                                )}
                            </button>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span>{part.questions?.length ?? 0} question</span>
                                {part.audioUrl && <span className="text-green-500 font-medium">✓ audio</span>}
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
                                        <label className={lbl}>Part title *</label>
                                        <input type="text" value={part.title} onChange={(e) => updatePart(pIdx, 'title', e.target.value)} placeholder="A conversation about a briefcase" className={`${inp} ${fieldErrors.includes(`lpart_${pIdx}_title`) ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : ''}`} />
                                        {fieldErrors.includes(`lpart_${pIdx}_title`) && <p className="text-xs text-red-500 mt-1">Title is missing</p>}
                                    </div>
                                    <div>
                                        <label className={lbl}>Duration (seconds)</label>
                                        <input type="number" value={part.durationSeconds ?? 0} onChange={(e) => updatePart(pIdx, 'durationSeconds', Number(e.target.value))} className={inp} />
                                    </div>
                                </div>

                                {/* Audio — AudioUpload component (URL + upload + player + replace) */}
                                <AudioUpload value={part.audioUrl ?? ''} onChange={(url) => updatePart(pIdx, 'audioUrl', url)} label="Audio *" hint="MP3, WAV, OGG · Max 50MB" error={fieldErrors.includes(`lpart_${pIdx}_audio`) ? 'Audio URL is missing' : undefined} />

                                {/* Monologue + Speaker count */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 pt-4">
                                        <input type="checkbox" id={`mono_${pIdx}`} checked={part.isMonologue} onChange={(e) => updatePart(pIdx, 'isMonologue', e.target.checked)} className="w-4 h-4 rounded text-purple-600 cursor-pointer" />
                                        <label htmlFor={`mono_${pIdx}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                            Monologue (1 speaker)
                                        </label>
                                    </div>
                                    <div>
                                        <label className={lbl}>Number of speakers</label>
                                        <input type="number" min={1} max={6} value={part.speakerCount ?? 2} onChange={(e) => updatePart(pIdx, 'speakerCount', Number(e.target.value))} className={inp} />
                                    </div>
                                </div>

                                {/* Context */}
                                <div>
                                    <label className={lbl}>Context / Situation</label>
                                    <input type="text" value={part.context ?? ''} onChange={(e) => updatePart(pIdx, 'context', e.target.value)} placeholder="A woman is reporting a lost bag to the police" className={inp} />
                                </div>

                                {/* Transcript */}
                                <div>
                                    <label className={lbl}>Transcript (optional)</label>
                                    <textarea value={part.transcript ?? ''} onChange={(e) => updatePart(pIdx, 'transcript', e.target.value)} rows={5} placeholder="Full audio transcript..." className={`${inp} font-mono text-[12px]`} />
                                </div>

                                {/* Instructions */}
                                <div>
                                    <label className={lbl}>Instructions (optional)</label>
                                    <input type="text" value={part.instructions ?? ''} onChange={(e) => updatePart(pIdx, 'instructions', e.target.value)} className={inp} />
                                </div>

                                {/* Questions */}
                                <div className="pt-2 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Questions ({part.questions?.length ?? 0})</h4>
                                        <button type="button" onClick={() => addQuestion(pIdx)} className="flex items-center gap-1.5 text-sm text-purple-600 font-semibold hover:underline">
                                            <Plus className="w-3.5 h-3.5" /> Add question
                                        </button>
                                    </div>
                                    {fieldErrors.includes(`lpart_${pIdx}_questions`) && (
                                        <p className="flex items-center gap-1 text-xs text-red-500">
                                            <AlertCircle className="w-3 h-3" /> At least one question is required
                                        </p>
                                    )}
                                    {!part.questions || part.questions.length === 0 ? (
                                        <div className="border border-dashed border-gray-200 rounded-xl py-6 text-center">
                                            <p className="text-xs text-gray-400 mb-1">No questions yet</p>
                                            <button type="button" onClick={() => addQuestion(pIdx)} className="text-xs text-purple-600 hover:underline font-medium">
                                                + Add the first question
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {part.questions.map((q, qIdx) => (
                                                <QuestionRow key={qIdx} q={q} qIdx={qIdx} qTypes={LISTENING_Q_TYPES} accentColor="purple" showTimestamps fieldErrors={fieldErrors.filter((f) => f.startsWith(`lpart_${pIdx}`))} onUpdate={(f, v) => updateQuestion(pIdx, qIdx, f, v)} onDelete={() => deleteQuestion(pIdx, qIdx)} />
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

export default ListeningSection;

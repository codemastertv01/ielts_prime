'use client';
import { X, Plus } from 'lucide-react';
import { inp, lbl, sel } from '@/constants';
import { QuestionTypeEnum } from '@/types/exam';

export interface EditorProps {
    question: any;
    onUpdate: (field: string, value: any) => void;
}

// ─── Multiple Choice ──────────────────────────────────────────────────────────
export const MultipleChoiceEditor = ({ question, onUpdate }: EditorProps) => {
    const options: string[] = question.options ?? [];
    return (
        <div className="col-span-2 space-y-3">
            <div>
                <label className={lbl}>Answer options</label>
                <div className="space-y-1.5">
                    {options.map((opt, i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <span className="w-5 text-xs font-bold text-gray-500 shrink-0">{String.fromCharCode(65 + i)}.</span>
                            <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                    const n = [...options];
                                    n[i] = e.target.value;
                                    onUpdate('options', n);
                                }}
                                className={`${inp} flex-1 py-2 text-xs`}
                                placeholder={`Variant ${String.fromCharCode(65 + i)}`}
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    onUpdate(
                                        'options',
                                        options.filter((_, j) => j !== i)
                                    )
                                }
                                className="text-red-400 hover:text-red-600 shrink-0"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                    {options.length < 6 && (
                        <button type="button" onClick={() => onUpdate('options', [...options, ''])} className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium">
                            <Plus className="w-3 h-3" /> Variant add
                        </button>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={lbl}>Correct answer *</label>
                    {options.filter((o) => o.trim()).length > 0 ? (
                        <select value={question.correctAnswer ?? ''} onChange={(e) => onUpdate('correctAnswer', e.target.value)} className={sel}>
                            <option value="">Tanlang…</option>
                            {options.map(
                                (o, i) =>
                                    o.trim() && (
                                        <option key={i} value={o}>
                                            {String.fromCharCode(65 + i)}. {o}
                                        </option>
                                    )
                            )}
                        </select>
                    ) : (
                        <input type="text" value={question.correctAnswer ?? ''} onChange={(e) => onUpdate('correctAnswer', e.target.value)} placeholder="Add options first" className={inp} />
                    )}
                </div>
                <div>
                    <label className={lbl}>Explanation (optional)</label>
                    <input type="text" value={question.explanation ?? ''} onChange={(e) => onUpdate('explanation', e.target.value)} className={inp} />
                </div>
            </div>
        </div>
    );
};

// ─── Multiple Choice Multiple ─────────────────────────────────────────────────
export const MultipleChoiceMultipleEditor = ({ question, onUpdate }: EditorProps) => {
    const options: string[] = question.options ?? [];
    const correct: string[] = Array.isArray(question.correctAnswer) ? question.correctAnswer : question.correctAnswer ? [question.correctAnswer] : [];

    const toggle = (opt: string) => {
        const next = correct.includes(opt) ? correct.filter((c) => c !== opt) : [...correct, opt];
        onUpdate('correctAnswer', next.join(', '));
    };

    return (
        <div className="col-span-2 space-y-3">
            <div>
                <label className={lbl}>Options (mark correct answers)</label>
                <div className="space-y-1.5">
                    {options.map((opt, i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <input type="checkbox" checked={correct.includes(opt)} onChange={() => toggle(opt)} className="w-4 h-4 rounded text-blue-600" />
                            <span className="w-5 text-xs font-bold text-gray-500 shrink-0">{String.fromCharCode(65 + i)}.</span>
                            <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                    const n = [...options];
                                    n[i] = e.target.value;
                                    onUpdate('options', n);
                                }}
                                className={`${inp} flex-1 py-2 text-xs`}
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    onUpdate(
                                        'options',
                                        options.filter((_, j) => j !== i)
                                    )
                                }
                                className="text-red-400 hover:text-red-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                    {options.length < 8 && (
                        <button type="button" onClick={() => onUpdate('options', [...options, ''])} className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium">
                            <Plus className="w-3 h-3" /> Variant add
                        </button>
                    )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                    Selected correct answers: <strong>{question.correctAnswer || '—'}</strong>
                </p>
            </div>
        </div>
    );
};

// ─── True/False/Not Given ─────────────────────────────────────────────────────
export const TrueFalseEditor = ({ question, onUpdate, options }: EditorProps & { options: string[] }) => (
    <div className="col-span-2 grid grid-cols-2 gap-3">
        <div>
            <label className={lbl}>Correct answer *</label>
            <select value={question.correctAnswer ?? ''} onChange={(e) => onUpdate('correctAnswer', e.target.value)} className={sel}>
                <option value="">Tanlang…</option>
                {options.map((o) => (
                    <option key={o} value={o}>
                        {o}
                    </option>
                ))}
            </select>
        </div>
        <div>
            <label className={lbl}>Explanation (optional)</label>
            <input type="text" value={question.explanation ?? ''} onChange={(e) => onUpdate('explanation', e.target.value)} className={inp} />
        </div>
    </div>
);

// ─── Fill-in (Note/Sentence/Summary/Table/FlowChart) ──────────────────────────
export const FillInEditor = ({ question, onUpdate }: EditorProps) => (
    <div className="col-span-2 space-y-3">
        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className={lbl}>Correct answer * (maks 3 words)</label>
                <input type="text" value={question.correctAnswer ?? ''} onChange={(e) => onUpdate('correctAnswer', e.target.value)} placeholder="sustainable energy" className={inp} />
            </div>
            <div>
                <label className={lbl}>Acceptable answers (comma separated)</label>
                <input
                    type="text"
                    value={(question.acceptableAnswers ?? []).join(', ')}
                    onChange={(e) =>
                        onUpdate(
                            'acceptableAnswers',
                            e.target.value
                                .split(',')
                                .map((a: string) => a.trim())
                                .filter(Boolean)
                        )
                    }
                    placeholder="renewable energy, green energy"
                    className={inp}
                />
            </div>
        </div>
        <div>
            <label className={lbl}>Explanation (optional)</label>
            <input type="text" value={question.explanation ?? ''} onChange={(e) => onUpdate('explanation', e.target.value)} className={inp} />
        </div>
    </div>
);

// ─── Matching ─────────────────────────────────────────────────────────────────
export const MatchingEditor = ({ question, onUpdate }: EditorProps) => {
    const pool: string[] = question.matchingPool ?? [];
    return (
        <div className="col-span-2 space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={lbl}>Correct answer *</label>
                    {pool.length > 0 ? (
                        <select value={question.correctAnswer ?? ''} onChange={(e) => onUpdate('correctAnswer', e.target.value)} className={sel}>
                            <option value="">Tanlang…</option>
                            {pool.map((p, i) => (
                                <option key={i} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input type="text" value={question.correctAnswer ?? ''} onChange={(e) => onUpdate('correctAnswer', e.target.value)} placeholder="A, B, or E" className={inp} />
                    )}
                </div>
                <div>
                    <label className={lbl}>Answer pool (comma separated)</label>
                    <input
                        type="text"
                        value={pool.join(', ')}
                        onChange={(e) =>
                            onUpdate(
                                'matchingPool',
                                e.target.value
                                    .split(',')
                                    .map((a: string) => a.trim())
                                    .filter(Boolean)
                            )
                        }
                        placeholder="A, B, C, D, E, F"
                        className={inp}
                    />
                </div>
            </div>
            <div>
                <label className={lbl}>Acceptable answers (optional)</label>
                <input
                    type="text"
                    value={(question.acceptableAnswers ?? []).join(', ')}
                    onChange={(e) =>
                        onUpdate(
                            'acceptableAnswers',
                            e.target.value
                                .split(',')
                                .map((a: string) => a.trim())
                                .filter(Boolean)
                        )
                    }
                    className={inp}
                />
            </div>
        </div>
    );
};

// ─── Short Answer ─────────────────────────────────────────────────────────────
export const ShortAnswerEditor = ({ question, onUpdate }: EditorProps) => (
    <div className="col-span-2 space-y-3">
        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className={lbl}>Correct answer *</label>
                <input type="text" value={question.correctAnswer ?? ''} onChange={(e) => onUpdate('correctAnswer', e.target.value)} className={inp} />
            </div>
            <div>
                <label className={lbl}>Acceptable answers (comma separated)</label>
                <input
                    type="text"
                    value={(question.acceptableAnswers ?? []).join(', ')}
                    onChange={(e) =>
                        onUpdate(
                            'acceptableAnswers',
                            e.target.value
                                .split(',')
                                .map((a: string) => a.trim())
                                .filter(Boolean)
                        )
                    }
                    className={inp}
                />
            </div>
        </div>
        <div>
            <label className={lbl}>Explanation (optional)</label>
            <input type="text" value={question.explanation ?? ''} onChange={(e) => onUpdate('explanation', e.target.value)} className={inp} />
        </div>
    </div>
);

// ─── Master dispatcher ────────────────────────────────────────────────────────
export const QuestionAnswerEditor = ({ question, onUpdate }: EditorProps) => {
    switch (question.type) {
        case QuestionTypeEnum.MULTIPLE_CHOICE:
            return <MultipleChoiceEditor question={question} onUpdate={onUpdate} />;
        case QuestionTypeEnum.MULTIPLE_CHOICE_MULTIPLE:
            return <MultipleChoiceMultipleEditor question={question} onUpdate={onUpdate} />;
        case QuestionTypeEnum.TRUE_FALSE_NOT_GIVEN:
            return <TrueFalseEditor question={question} onUpdate={onUpdate} options={['TRUE', 'FALSE', 'NOT GIVEN']} />;
        case QuestionTypeEnum.YES_NO_NOT_GIVEN:
            return <TrueFalseEditor question={question} onUpdate={onUpdate} options={['YES', 'NO', 'NOT GIVEN']} />;
        case QuestionTypeEnum.MATCHING:
        case QuestionTypeEnum.MATCHING_HEADINGS:
        case QuestionTypeEnum.MATCHING_INFORMATION:
        case QuestionTypeEnum.MATCHING_FEATURES:
        case QuestionTypeEnum.MATCHING_SENTENCE_ENDINGS:
        case QuestionTypeEnum.PLAN_MAP_DIAGRAM_LABELLING:
            return <MatchingEditor question={question} onUpdate={onUpdate} />;
        case QuestionTypeEnum.SENTENCE_COMPLETION:
        case QuestionTypeEnum.SUMMARY_COMPLETION:
        case QuestionTypeEnum.NOTE_COMPLETION:
        case QuestionTypeEnum.TABLE_COMPLETION:
        case QuestionTypeEnum.FLOW_CHART_COMPLETION:
        case QuestionTypeEnum.FORM_COMPLETION:
            return <FillInEditor question={question} onUpdate={onUpdate} />;
        case QuestionTypeEnum.SHORT_ANSWER:
        default:
            return <ShortAnswerEditor question={question} onUpdate={onUpdate} />;
    }
};

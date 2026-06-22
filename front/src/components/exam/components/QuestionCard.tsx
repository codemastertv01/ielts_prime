// components/exam/QuestionCard.tsx
'use client';
import { Flag, ChevronDown } from 'lucide-react';
import { QuestionTypeEnum } from '@/types/exam';
import { Button, Input, Select } from '@/components/UI';

const TFNG = ['TRUE', 'FALSE', 'NOT GIVEN'];
const YNNG = ['YES', 'NO', 'NOT GIVEN'];

function tfColor(opt: string, sel: boolean): string {
    if (!sel) return 'border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50/30';
    if (opt === 'TRUE' || opt === 'YES') return 'border-green-500 bg-green-50 text-green-700 font-bold';
    if (opt === 'FALSE' || opt === 'NO') return 'border-red-400 bg-red-50 text-red-700 font-bold';
    return 'border-gray-400 bg-gray-100 text-gray-700 font-bold';
}

interface QuestionCardProps {
    /** Globally unique question number (displayed to user) */
    globalNum: number;
    question: {
        questionNumber: number;
        type: string;
        question: string;
        options?: string[];
        matchingPool?: string[];
        wordLimit?: string;
    };
    answer: string | undefined;
    isFlagged: boolean;
    onAnswer: (value: string) => void;
    onFlag: () => void;
    /** Word limit hint from parent group */
    wordLimit?: string;
    /** id for scroll-to */
    domId?: string;
}

export default function QuestionCard({ globalNum, question: q, answer, isFlagged, onAnswer, onFlag, wordLimit, domId }: QuestionCardProps) {
    const type = q.type;
    const pool = q.matchingPool ?? q.options ?? [];
    const wl = q.wordLimit ?? wordLimit;

    // Multi-answer parsing
    const multiAnswers: string[] = (() => {
        if (type !== QuestionTypeEnum.MULTIPLE_CHOICE_MULTIPLE) return [];
        try {
            return answer ? JSON.parse(answer) : [];
        } catch {
            return [];
        }
    })();

    const answered = type === QuestionTypeEnum.MULTIPLE_CHOICE_MULTIPLE ? multiAnswers.length > 0 : !!answer;

    const toggleMulti = (opt: string) => {
        const next = multiAnswers.includes(opt) ? multiAnswers.filter((a) => a !== opt) : [...multiAnswers, opt];
        onAnswer(JSON.stringify(next));
    };

    return (
        <div id={domId} className={`bg-white rounded-lg border transition-all ${answered ? 'border-blue-400 shadow-sm' : 'border-gray-200'}`}>
            <div className="p-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${answered ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{globalNum}</span>
                        <p className="text-sm text-gray-800 leading-relaxed flex-1">{q.question}</p>
                    </div>
                    <Button unstyled onClick={onFlag} className={`p-1.5 rounded shrink-0 ${isFlagged ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'}`}>
                        <Flag className="w-4 h-4" />
                    </Button>
                </div>

                {/* Input area */}
                <div className="ml-9 space-y-2">
                    {/* Multiple choice (single) */}
                    {type === QuestionTypeEnum.MULTIPLE_CHOICE && (
                        <div className="space-y-1.5">
                            {(q.options ?? []).map((opt, oi) => (
                                <Button
                                    unstyled
                                    key={oi}
                                    onClick={() => onAnswer(opt)}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm border transition-all flex items-center gap-3
                    ${answer === opt ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium' : 'border-gray-200 text-gray-700 hover:border-blue-200 hover:bg-blue-50/40'}`}
                                >
                                    <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${answer === opt ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>{answer === opt && <span className="w-1.5 h-1.5 rounded-full bg-white" />}</span>
                                    <span className="text-gray-400 text-xs font-bold w-4">{String.fromCharCode(65 + oi)}</span>
                                    <span className="flex-1">{opt}</span>
                                </Button>
                            ))}
                        </div>
                    )}

                    {/* Multiple choice (multi) */}
                    {type === QuestionTypeEnum.MULTIPLE_CHOICE_MULTIPLE && (
                        <div className="space-y-1.5">
                            <p className="text-[11px] text-blue-600 font-medium">Choose more than one answer</p>
                            {(q.options ?? []).map((opt, oi) => {
                                const checked = multiAnswers.includes(opt);
                                return (
                                    <Button
                                        unstyled
                                        key={oi}
                                        onClick={() => toggleMulti(opt)}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm border transition-all flex items-center gap-3
                      ${checked ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium' : 'border-gray-200 text-gray-700 hover:border-blue-200 hover:bg-blue-50/40'}`}
                                    >
                                        <span className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center ${checked ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                                            {checked && (
                                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                                                    <path d="M1.5 5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </span>
                                        {opt}
                                    </Button>
                                );
                            })}
                        </div>
                    )}

                    {/* True/False/Not Given */}
                    {(type === QuestionTypeEnum.TRUE_FALSE_NOT_GIVEN || type === QuestionTypeEnum.YES_NO_NOT_GIVEN) && (
                        <div className="grid grid-cols-3 gap-2">
                            {(type === QuestionTypeEnum.YES_NO_NOT_GIVEN ? YNNG : TFNG).map((opt) => (
                                <Button
                                    unstyled
                                    key={opt}
                                    onClick={() => onAnswer(opt)}
                                    className={`py-2.5 rounded-lg text-xs font-bold border-2 transition-all text-center
                    ${tfColor(opt, answer === opt)}`}
                                >
                                    {opt}
                                </Button>
                            ))}
                        </div>
                    )}

                    {/* Matching — dropdown */}
                    {[QuestionTypeEnum.MATCHING_HEADINGS, QuestionTypeEnum.MATCHING_INFORMATION, QuestionTypeEnum.MATCHING_FEATURES, QuestionTypeEnum.MATCHING_SENTENCE_ENDINGS, QuestionTypeEnum.MATCHING].includes(type as any) && pool.length > 0 ? (
                        <div className="relative">
                            <Select
                                unstyled
                                value={answer ?? ''}
                                onChange={(e) => onAnswer(e.target.value)}
                                className={`w-full appearance-none px-3 py-2.5 pr-8 rounded-lg text-sm border outline-none transition-all
                  ${answer ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium' : 'border-gray-200 bg-white text-gray-500 focus:border-blue-400'}`}
                            >
                                <option value="">Select...</option>
                                {pool.map((opt, i) => (
                                    <option key={i} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </Select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                    ) : null}

                    {/* Short text answers */}
                    {[QuestionTypeEnum.SENTENCE_COMPLETION, QuestionTypeEnum.SUMMARY_COMPLETION, QuestionTypeEnum.NOTE_COMPLETION, QuestionTypeEnum.TABLE_COMPLETION, QuestionTypeEnum.FLOW_CHART_COMPLETION, QuestionTypeEnum.FORM_COMPLETION, QuestionTypeEnum.SHORT_ANSWER].includes(type as any) && (
                        <div className="space-y-1">
                            <Input
                                unstyled
                                type="text"
                                value={answer ?? ''}
                                onChange={(e) => onAnswer(e.target.value)}
                                placeholder="Type your answer..."
                                className={`w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-all
                  ${answer ? 'border-blue-400 bg-blue-50/40 text-gray-900' : 'border-gray-200 focus:border-blue-400 text-gray-900'} placeholder:text-gray-300`}
                            />
                            {wl && <p className="text-[11px] text-amber-600 font-medium">⚠️ {wl}</p>}
                        </div>
                    )}

                    {/* Fallback text input */}
                    {![QuestionTypeEnum.MULTIPLE_CHOICE, QuestionTypeEnum.MULTIPLE_CHOICE_MULTIPLE, QuestionTypeEnum.TRUE_FALSE_NOT_GIVEN, QuestionTypeEnum.YES_NO_NOT_GIVEN, QuestionTypeEnum.MATCHING_HEADINGS, QuestionTypeEnum.MATCHING_INFORMATION, QuestionTypeEnum.MATCHING_FEATURES, QuestionTypeEnum.MATCHING_SENTENCE_ENDINGS, QuestionTypeEnum.MATCHING, QuestionTypeEnum.SENTENCE_COMPLETION, QuestionTypeEnum.SUMMARY_COMPLETION, QuestionTypeEnum.NOTE_COMPLETION, QuestionTypeEnum.TABLE_COMPLETION, QuestionTypeEnum.FLOW_CHART_COMPLETION, QuestionTypeEnum.FORM_COMPLETION, QuestionTypeEnum.SHORT_ANSWER].includes(type as any) && (
                        <Input
                            unstyled
                            type="text"
                            value={answer ?? ''}
                            onChange={(e) => onAnswer(e.target.value)}
                            placeholder="Type your answer..."
                            className={`w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-all
                ${answer ? 'border-blue-400 bg-blue-50/40 text-gray-900' : 'border-gray-200 focus:border-blue-400 text-gray-900'} placeholder:text-gray-300`}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

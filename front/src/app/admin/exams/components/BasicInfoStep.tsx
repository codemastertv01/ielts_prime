'use client';
import { BookOpen, Headphones, PenLine, Mic, AlertCircle } from 'lucide-react';
import { BasicInfoFormData, ExamType } from '@/types/exam';
import { inp, inpErr, sel, selErr, lbl, EXAM_TYPE_LABELS, EXAM_TYPE_TIMES, DIFFICULTY_LABELS, REQUIRED_SECTIONS } from '@/constants';

// re-export cx from constants (fallback: use inline)
const has = (field: string, errors: string[]) => errors.includes(field);

const SECTION_ICONS: Record<string, React.ReactNode> = {
    reading: <BookOpen className="w-3.5 h-3.5" />,
    listening: <Headphones className="w-3.5 h-3.5" />,
    writing: <PenLine className="w-3.5 h-3.5" />,
    speaking: <Mic className="w-3.5 h-3.5" />,
};

interface BasicInfoStepProps {
    data: BasicInfoFormData;
    onChange: (d: BasicInfoFormData) => void;
    fieldErrors: string[];
}

const BasicInfoStep = ({ data, onChange, fieldErrors }: BasicInfoStepProps) => {
    const set = (field: keyof BasicInfoFormData, value: any) => onChange({ ...data, [field]: value });

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Basic Information</h2>

            {/* Title */}
            <div>
                <label className={lbl}>Title *</label>
                <input type="text" value={data.title} onChange={(e) => set('title', e.target.value)} placeholder="Cambridge IELTS 18 - Test 1 Academic" className={has('title', fieldErrors) ? inpErr : inp} />
                {has('title', fieldErrors) && (
                    <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                        <AlertCircle className="w-3 h-3" /> Title is required
                    </p>
                )}
            </div>

            {/* Description */}
            <div>
                <label className={lbl}>Description</label>
                <textarea rows={2} value={data.description} onChange={(e) => set('description', e.target.value)} className={inp} placeholder="Short description of the exam..." />
            </div>

            {/* Type / Modulee / Difficulty */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className={lbl}>Exam type *</label>
                    <select
                        value={data.examType}
                        onChange={(e) => {
                            const t = e.target.value as ExamType;
                            onChange({ ...data, examType: t, totalTimeLimitMinutes: EXAM_TYPE_TIMES[t] ?? data.totalTimeLimitMinutes });
                        }}
                        className={has('examType', fieldErrors) ? selErr : sel}
                    >
                        {Object.entries(EXAM_TYPE_LABELS).map(([v, l]) => (
                            <option key={v} value={v}>
                                {l}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={lbl}>Module *</label>
                    <select value={data.module as string} onChange={(e) => set('module', e.target.value as any)} className={has('module', fieldErrors) ? selErr : sel}>
                        <option value="ACADEMIC">Academic</option>
                        <option value="GENERAL">General Training</option>
                    </select>
                </div>
                <div>
                    <label className={lbl}>Difficulty *</label>
                    <select value={data.difficulty} onChange={(e) => set('difficulty', e.target.value as any)} className={has('difficulty', fieldErrors) ? selErr : sel}>
                        {Object.entries(DIFFICULTY_LABELS).map(([v, l]) => (
                            <option key={v} value={v}>
                                {l}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Time + Passing score */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={lbl}>Time limit (minutes) *</label>
                    <input type="number" min={1} value={data.totalTimeLimitMinutes} onChange={(e) => set('totalTimeLimitMinutes', Number(e.target.value))} className={has('totalTimeLimitMinutes', fieldErrors) ? inpErr : inp} />
                    {has('totalTimeLimitMinutes', fieldErrors) && (
                        <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                            <AlertCircle className="w-3 h-3" /> Time is required
                        </p>
                    )}
                </div>
                <div>
                    <label className={lbl}>Passing band (0-9)</label>
                    <input type="number" min={0} max={9} step={0.5} value={data.passingScore} onChange={(e) => set('passingScore', Number(e.target.value))} className={inp} />
                </div>
            </div>

            {/* Premium / Price / Tags */}
            <div className="grid grid-cols-3 gap-4 items-end">
                <div className="flex items-center gap-3 pt-4">
                    <input type="checkbox" id="isPremium" checked={!!data.isPremium} onChange={(e) => set('isPremium', e.target.checked)} className="w-4 h-4 rounded text-blue-600 cursor-pointer" />
                    <label htmlFor="isPremium" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                        Premium exam
                    </label>
                </div>
                <div>
                    <label className={lbl}>Price (UZS)</label>
                    <input type="number" min={0} value={data.price} onChange={(e) => set('price', Number(e.target.value))} className={inp} placeholder="0" />
                </div>
                <div>
                    <label className={lbl}>Tags (comma separated)</label>
                    <input type="text" value={data.tags} onChange={(e) => set('tags', e.target.value)} className={inp} placeholder="cambridge, academic, test1" />
                </div>
            </div>

            {/* Thumbnail */}
            <div>
                <label className={lbl}>Thumbnail URL</label>
                <input type="url" value={data.thumbnailUrl} onChange={(e) => set('thumbnailUrl', e.target.value)} className={inp} placeholder="https://example.com/thumb.jpg" />
                {data.thumbnailUrl && <img src={data.thumbnailUrl} alt="thumb" className="mt-2 h-16 rounded-lg border border-gray-200 dark:border-gray-700 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />}
            </div>

            {/* Availability */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={lbl}>Available from</label>
                    <input type="datetime-local" value={data.availableFrom} onChange={(e) => set('availableFrom', e.target.value)} className={inp} />
                </div>
                <div>
                    <label className={lbl}>Available until</label>
                    <input type="datetime-local" value={data.availableUntil} onChange={(e) => set('availableUntil', e.target.value)} className={inp} />
                </div>
            </div>

            {/* Required sections preview */}
            <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl p-4">
                <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">Required sections for this type:</p>
                <div className="flex flex-wrap gap-2">
                    {(REQUIRED_SECTIONS[data.examType] ?? []).map((sec) => (
                        <span key={sec} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold shadow-sm">
                            {SECTION_ICONS[sec]}
                            {sec.charAt(0).toUpperCase() + sec.slice(1)}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BasicInfoStep;

'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, RotateCcw } from 'lucide-react';
import { EXAM_TYPE_LABELS, inp, lbl, sel } from '@/constants';
import { EntityStatus, EntityStatusEnum } from '@/types/entity.status';
import { AdminExamFilters, DifficultyLevel, DifficultyLevelEnum, ExamModule, ExamType } from '@/types/exam';

interface FilterPanelProps {
    filters: AdminExamFilters;
    onChange: (f: Partial<AdminExamFilters>) => void;
    onReset: () => void;
    open: boolean;
}

const toBoolValue = (value: unknown) => (value === '' ? '' : String(value ?? ''));

const FilterPanel = ({ filters, onChange, onReset, open }: FilterPanelProps) => (
    <AnimatePresence>
        {open && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div>
                            <label className={lbl}>Type</label>
                            <select value={filters.examType ?? ''} onChange={(e) => onChange({ examType: e.target.value as ExamType | '', page: 1 })} className={sel}>
                                <option value="">All</option>
                                {(Object.entries(EXAM_TYPE_LABELS) as [ExamType, string][]).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={lbl}>Module</label>
                            <select value={filters.module ?? ''} onChange={(e) => onChange({ module: e.target.value as ExamModule | '', page: 1 })} className={sel}>
                                <option value="">All</option>
                                <option value="ACADEMIC">Academic</option>
                                <option value="GENERAL">General Training</option>
                            </select>
                        </div>
                        <div>
                            <label className={lbl}>Difficulty</label>
                            <select value={filters.difficulty ?? ''} onChange={(e) => onChange({ difficulty: e.target.value as DifficultyLevel | '', page: 1 })} className={sel}>
                                <option value="">All</option>
                                {(Object.values(DifficultyLevelEnum) as DifficultyLevel[]).map((value) => (
                                    <option key={value} value={value}>
                                        {value.replace('BAND_', 'Band ').replace('_', '-')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={lbl}>Status</label>
                            <select value={filters.status ?? ''} onChange={(e) => onChange({ status: e.target.value as EntityStatus | '', page: 1 })} className={sel}>
                                <option value="">All</option>
                                {(Object.values(EntityStatusEnum) as EntityStatus[]).map((value) => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <BoolSelect label="Published" value={filters.isPublished} onChange={(value) => onChange({ isPublished: value, page: 1 })} trueLabel="Published" falseLabel="Draft" />
                        <BoolSelect label="Premium" value={filters.isPremium} onChange={(value) => onChange({ isPremium: value, page: 1 })} trueLabel="Premium" falseLabel="Free" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <BoolSelect label="Reading section" value={filters.hasReading} onChange={(value) => onChange({ hasReading: value, page: 1 })} trueLabel="Yes" falseLabel="No" />
                        <BoolSelect label="Listening section" value={filters.hasListening} onChange={(value) => onChange({ hasListening: value, page: 1 })} trueLabel="Yes" falseLabel="No" />
                        <BoolSelect label="Writing section" value={filters.hasWriting} onChange={(value) => onChange({ hasWriting: value, page: 1 })} trueLabel="Yes" falseLabel="No" />
                        <BoolSelect label="Speaking section" value={filters.hasSpeaking} onChange={(value) => onChange({ hasSpeaking: value, page: 1 })} trueLabel="Yes" falseLabel="No" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <DateInput label="Created from" value={filters.createdFrom} onChange={(value) => onChange({ createdFrom: value, page: 1 })} />
                        <DateInput label="Created to" value={filters.createdTo} onChange={(value) => onChange({ createdTo: value, page: 1 })} />
                        <DateInput label="Updated from" value={filters.updatedFrom} onChange={(value) => onChange({ updatedFrom: value, page: 1 })} />
                        <DateInput label="Updated to" value={filters.updatedTo} onChange={(value) => onChange({ updatedTo: value, page: 1 })} />
                        <DateInput label="Available from" value={filters.availableFrom} onChange={(value) => onChange({ availableFrom: value, page: 1 })} />
                        <DateInput label="Available to" value={filters.availableTo} onChange={(value) => onChange({ availableTo: value, page: 1 })} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <NumberInput label="Min time" value={filters.minTime} onChange={(value) => onChange({ minTime: value, page: 1 })} />
                        <NumberInput label="Max time" value={filters.maxTime} onChange={(value) => onChange({ maxTime: value, page: 1 })} />
                        <NumberInput label="Min passing band" value={filters.minPassingScore} onChange={(value) => onChange({ minPassingScore: value, page: 1 })} step="0.5" />
                        <NumberInput label="Max passing band" value={filters.maxPassingScore} onChange={(value) => onChange({ maxPassingScore: value, page: 1 })} step="0.5" />
                        <NumberInput label="Min price" value={filters.minPrice} onChange={(value) => onChange({ minPrice: value, page: 1 })} />
                        <NumberInput label="Max price" value={filters.maxPrice} onChange={(value) => onChange({ maxPrice: value, page: 1 })} />
                        <NumberInput label="Min attempts" value={filters.minAttempts} onChange={(value) => onChange({ minAttempts: value, page: 1 })} />
                        <NumberInput label="Max attempts" value={filters.maxAttempts} onChange={(value) => onChange({ maxAttempts: value, page: 1 })} />
                        <NumberInput label="Min completed" value={filters.minCompletedAttempts} onChange={(value) => onChange({ minCompletedAttempts: value, page: 1 })} />
                        <NumberInput label="Max completed" value={filters.maxCompletedAttempts} onChange={(value) => onChange({ maxCompletedAttempts: value, page: 1 })} />
                        <NumberInput label="Min rating" value={filters.minRating} onChange={(value) => onChange({ minRating: value, page: 1 })} step="0.1" />
                        <NumberInput label="Max rating" value={filters.maxRating} onChange={(value) => onChange({ maxRating: value, page: 1 })} step="0.1" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div>
                            <label className={lbl}>Tag</label>
                            <input value={filters.tag ?? ''} onChange={(e) => onChange({ tag: e.target.value, page: 1 })} placeholder="cambridge" className={inp} />
                        </div>
                        <div>
                            <label className={lbl}>Created by</label>
                            <input value={filters.createdBy ?? ''} onChange={(e) => onChange({ createdBy: e.target.value, page: 1 })} placeholder="email or userId" className={inp} />
                        </div>
                        <div>
                            <label className={lbl}>Pageda</label>
                            <select value={String(filters.limit ?? 10)} onChange={(e) => onChange({ limit: e.target.value === 'all' ? 'all' : Number(e.target.value), page: 1 })} className={sel}>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="all">All</option>
                            </select>
                        </div>
                        <div>
                            <label className={lbl}>Sort by</label>
                            <select value={filters.sortBy ?? 'createdAt'} onChange={(e) => onChange({ sortBy: e.target.value, page: 1 })} className={sel}>
                                <option value="createdAt">Created date</option>
                                <option value="updatedAt">Updated date</option>
                                <option value="title">Title</option>
                                <option value="totalAttempts">Attempts</option>
                                <option value="completedAttempts">Completed</option>
                                <option value="averageRating">Rating</option>
                                <option value="difficulty">Difficulty</option>
                                <option value="totalTimeLimitMinutes">Time</option>
                                <option value="passingScore">Passing band</option>
                                <option value="price">Price</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className={`${lbl} mb-0`}>Order:</span>
                            <div className="flex rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600">
                                {(['desc', 'asc'] as const).map((order) => (
                                    <button key={order} type="button" onClick={() => onChange({ sortOrder: order, page: 1 })} className={`px-4 py-1.5 text-sm font-semibold transition-colors ${filters.sortOrder === order ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}>
                                        {order === 'desc' ? 'Descending' : 'Ascending'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button type="button" onClick={onReset} className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-semibold transition-colors">
                            <RotateCcw className="w-3.5 h-3.5" /> Clear filters
                        </button>
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

function BoolSelect({ label, value, onChange, trueLabel, falseLabel }: { label: string; value?: boolean | ''; onChange: (value: boolean | '') => void; trueLabel: string; falseLabel: string }) {
    return (
        <div>
            <label className={lbl}>{label}</label>
            <select value={toBoolValue(value)} onChange={(e) => onChange(e.target.value === '' ? '' : e.target.value === 'true')} className={sel}>
                <option value="">All</option>
                <option value="true">{trueLabel}</option>
                <option value="false">{falseLabel}</option>
            </select>
        </div>
    );
}

function DateInput({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
    return (
        <div>
            <label className={lbl}>
                <Calendar className="w-3 h-3 inline mr-1" />
                {label}
            </label>
            <input type="date" value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inp} />
        </div>
    );
}

function NumberInput({ label, value, onChange, step = '1' }: { label: string; value?: number | ''; onChange: (value: number | '') => void; step?: string }) {
    return (
        <div>
            <label className={lbl}>{label}</label>
            <input type="number" step={step} value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} className={inp} />
        </div>
    );
}

export default FilterPanel;

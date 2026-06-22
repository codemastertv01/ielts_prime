// constants.ts
import { BookOpen, Headphones, PenLine, Mic, Layers } from 'lucide-react';
import { createElement } from 'react';
import { ExamType, DifficultyLevel, ExamFilters } from '@/types/exam';
import { EntityStatus } from '../types/entity.status';

// ── Exam type labels ───────────────────────────────────────────
export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
    READING_ONLY: 'Reading',
    SPEAKING_ONLY: 'Speaking',
    WRITING_ONLY: 'Writing',
    LISTENING_ONLY: 'Listening',

    READING_SPEAKING: 'Reading + Speaking',
    READING_WRITING: 'Reading + Writing',
    READING_LISTENING: 'Reading + Listening',
    SPEAKING_WRITING: 'Speaking + Writing',
    SPEAKING_LISTENING: 'Speaking + Listening',
    WRITING_LISTENING: 'Writing + Listening',

    READING_SPEAKING_WRITING: 'Reading + Speaking + Writing',
    READING_SPEAKING_LISTENING: 'Reading + Speaking + Listening',
    READING_WRITING_LISTENING: 'Reading + Writing + Listening',
    SPEAKING_WRITING_LISTENING: 'Speaking + Writing + Listening',

    FULL_MOCK_TEST: 'Full Mock Test (4 sections)',
};

// ── Required sections ──────────────────────────────────────────
export const REQUIRED_SECTIONS: Record<ExamType, string[]> = {
    READING_ONLY: ['reading'],
    SPEAKING_ONLY: ['speaking'],
    WRITING_ONLY: ['writing'],
    LISTENING_ONLY: ['listening'],

    READING_SPEAKING: ['reading', 'speaking'],
    READING_WRITING: ['reading', 'writing'],
    READING_LISTENING: ['reading', 'listening'],
    SPEAKING_WRITING: ['speaking', 'writing'],
    SPEAKING_LISTENING: ['speaking', 'listening'],
    WRITING_LISTENING: ['writing', 'listening'],

    READING_SPEAKING_WRITING: ['reading', 'speaking', 'writing'],
    READING_SPEAKING_LISTENING: ['reading', 'speaking', 'listening'],
    READING_WRITING_LISTENING: ['reading', 'writing', 'listening'],
    SPEAKING_WRITING_LISTENING: ['speaking', 'writing', 'listening'],

    FULL_MOCK_TEST: ['reading', 'speaking', 'writing', 'listening'],
};

// ── Default time limits ────────────────────────────────────────
export const EXAM_TYPE_TIMES: Record<ExamType, number> = {
    READING_ONLY: 60,
    SPEAKING_ONLY: 14,
    WRITING_ONLY: 60,
    LISTENING_ONLY: 40,

    READING_SPEAKING: 74,
    READING_WRITING: 120,
    READING_LISTENING: 100,
    SPEAKING_WRITING: 74,
    SPEAKING_LISTENING: 54,
    WRITING_LISTENING: 100,

    READING_SPEAKING_WRITING: 134,
    READING_SPEAKING_LISTENING: 114,
    READING_WRITING_LISTENING: 160,
    SPEAKING_WRITING_LISTENING: 114,

    FULL_MOCK_TEST: 174,
};

// ── Icons ──────────────────────────────────────────────────────
export const EXAM_TYPE_ICONS: Record<ExamType, React.ReactNode> = {
    READING_ONLY: createElement(BookOpen, { className: 'w-4 h-4' }),
    SPEAKING_ONLY: createElement(Mic, { className: 'w-4 h-4' }),
    WRITING_ONLY: createElement(PenLine, { className: 'w-4 h-4' }),
    LISTENING_ONLY: createElement(Headphones, { className: 'w-4 h-4' }),

    READING_SPEAKING: createElement(Layers, { className: 'w-4 h-4' }),
    READING_WRITING: createElement(Layers, { className: 'w-4 h-4' }),
    READING_LISTENING: createElement(Layers, { className: 'w-4 h-4' }),
    SPEAKING_WRITING: createElement(Layers, { className: 'w-4 h-4' }),
    SPEAKING_LISTENING: createElement(Layers, { className: 'w-4 h-4' }),
    WRITING_LISTENING: createElement(Layers, { className: 'w-4 h-4' }),

    READING_SPEAKING_WRITING: createElement(Layers, { className: 'w-4 h-4' }),
    READING_SPEAKING_LISTENING: createElement(Layers, { className: 'w-4 h-4' }),
    READING_WRITING_LISTENING: createElement(Layers, { className: 'w-4 h-4' }),
    SPEAKING_WRITING_LISTENING: createElement(Layers, { className: 'w-4 h-4' }),

    FULL_MOCK_TEST: createElement(Layers, { className: 'w-4 h-4' }),
};

// ── Difficulty ─────────────────────────────────────────────────
export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
    BAND_4_5: "Band 4–5 (Boshlang'ich)",
    BAND_5_6: "Band 5–6 (O'rta-past)",
    BAND_6_7: "Band 6–7 (O'rta)",
    BAND_7_8: "Band 7–8 (O'rta-yuqori)",
    BAND_8_9: 'Band 8–9 (Yuqori)',
};

export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
    BAND_4_5: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    BAND_5_6: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    BAND_6_7: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    BAND_7_8: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    BAND_8_9: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

// ── Status colors ──────────────────────────────────────────────
export const STATUS_COLORS: Record<EntityStatus, string> = {
    ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    IN_PROGRESS: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    INACTIVE: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    ARCHIVE: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    GRADED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    EXPIRED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    DELETED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    SUBMITTED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    GRADING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

// ── Question types ─────────────────────────────────────────────
export interface QTypeOption {
    value: string;
    label: string;
}

export const READING_Q_TYPES = [
    { label: 'Multiple Choice', value: 'MULTIPLE_CHOICE' },
    { label: 'Multiple Choice (Multiple)', value: 'MULTIPLE_CHOICE_MULTIPLE_ANSWERS' },
    { label: 'True/False/Not Given', value: 'TRUE_FALSE_NOT_GIVEN' },
    { label: 'Yes/No/Not Given', value: 'YES_NO_NOT_GIVEN' },
    { label: 'Matching Headings', value: 'MATCHING_HEADINGS' },
    { label: 'Matching Information', value: 'MATCHING_INFORMATION' },
    { label: 'Matching Features', value: 'MATCHING_FEATURES' },
    { label: 'Matching Sentence Endings', value: 'MATCHING_SENTENCE_ENDINGS' },
    { label: 'Sentence Completion', value: 'SENTENCE_COMPLETION' },
    { label: 'Summary Completion', value: 'SUMMARY_COMPLETION' },
    { label: 'Note Completion', value: 'NOTE_COMPLETION' },
    { label: 'Table Completion', value: 'TABLE_COMPLETION' },
    { label: 'Flow Chart Completion', value: 'FLOW_CHART_COMPLETION' },
    { label: 'Form Completion', value: 'FORM_COMPLETION' },
    { label: 'Short Answer', value: 'SHORT_ANSWER' },
];

export const LISTENING_Q_TYPES = [
    { label: 'Multiple Choice', value: 'MULTIPLE_CHOICE' },
    { label: 'Multiple Choice (Multiple)', value: 'MULTIPLE_CHOICE_MULTIPLE_ANSWERS' },
    { label: 'Sentence Completion', value: 'SENTENCE_COMPLETION' },
    { label: 'Note Completion', value: 'NOTE_COMPLETION' },
    { label: 'Table Completion', value: 'TABLE_COMPLETION' },
    { label: 'Flow Chart Completion', value: 'FLOW_CHART_COMPLETION' },
    { label: 'Form Completion', value: 'FORM_COMPLETION' },
    { label: 'Matching', value: 'MATCHING' },
    { label: 'Plan/Map/Diagram Labelling', value: 'PLAN_MAP_DIAGRAM_LABELLING' },
    { label: 'Short Answer', value: 'SHORT_ANSWER' },
];

// ── Shared input/button styles ─────────────────────────────────
export const inp = 'w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl ' + 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white ' + 'focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors';

export const inpErr = 'w-full px-3 py-2 text-sm border border-red-400 rounded-xl ' + 'bg-red-50 dark:bg-red-900/10 text-gray-900 dark:text-white ' + 'focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-colors';

export const sel = inp + ' cursor-pointer';
export const selErr = inpErr + ' cursor-pointer';

export const lbl = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5';

export const btn = {
    primary: 'flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white ' + 'rounded-xl text-sm font-bold disabled:opacity-50 transition-colors',
    secondary: 'flex items-center px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 ' + 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 ' + 'rounded-xl text-sm font-semibold transition-colors',
    danger: 'flex items-center px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white ' + 'rounded-xl text-sm font-semibold transition-colors',
};

// ── Default filters ────────────────────────────────────────────
export const DEFAULT_FILTERS: ExamFilters = {
    search: '',
    examType: '',
    module: '',
    difficulty: '',
    status: '',
    isPublished: '',
    isPremium: '',
    isDeleted: false,
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    createdFrom: '',
    createdTo: '',
    updatedFrom: '',
    updatedTo: '',
};

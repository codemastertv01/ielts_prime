import { createElement } from 'react';
import { BookOpen, Headphones, Layers, Mic, PenLine } from 'lucide-react';
import type { DifficultyLevel, ExamType } from '@/types/exam';

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

// ── Required sections per type ─────────────────────────────────
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

// ── Difficulty labels ──────────────────────────────────────────
export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
    BAND_4_5: "Band 4–5 (Beginner)",
    BAND_5_6: "Band 5–6 (Lower intermediate)",
    BAND_6_7: "Band 6–7 (Intermediate)",
    BAND_7_8: "Band 7–8 (Upper intermediate)",
    BAND_8_9: 'Band 8–9 (Advanced)',
};

export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
    BAND_4_5: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    BAND_5_6: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    BAND_6_7: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    BAND_7_8: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    BAND_8_9: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
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

// ── Question types ─────────────────────────────────────────────
export interface QTypeOption {
    value: string;
    label: string;
}

export const READING_Q_TYPES: QTypeOption[] = [
    { value: 'MULTIPLE_CHOICE', label: "Multiple choice (A/B/C/D)" },
    { value: 'MULTIPLE_CHOICE_MULTIPLE_ANSWERS', label: "Multiple choice (multiple answers)" },
    { value: 'TRUE_FALSE_NOT_GIVEN', label: 'True / False / Not Given' },
    { value: 'YES_NO_NOT_GIVEN', label: 'Yes / No / Not Given' },
    { value: 'MATCHING_HEADINGS', label: 'Title moslashtirish' },
    { value: 'MATCHING_INFORMATION', label: "Matching information" },
    { value: 'MATCHING_FEATURES', label: 'Matching features' },
    { value: 'MATCHING_SENTENCE_ENDINGS', label: 'Matching sentence endings' },
    { value: 'SENTENCE_COMPLETION', label: "Sentence completion" },
    { value: 'SUMMARY_COMPLETION', label: "Summary completion" },
    { value: 'NOTE_COMPLETION', label: "Note completion" },
    { value: 'TABLE_COMPLETION', label: "Table completion" },
    { value: 'FLOW_CHART_COMPLETION', label: "Flow-chart completion" },
    { value: 'SHORT_ANSWER', label: 'Short answer' },
];

export const LISTENING_Q_TYPES: QTypeOption[] = [
    { value: 'MULTIPLE_CHOICE', label: "Multiple choice (A/B/C/D)" },
    { value: 'MULTIPLE_CHOICE_MULTIPLE_ANSWERS', label: "Multiple choice (multiple answers)" },
    { value: 'NOTE_COMPLETION', label: "Note completion" },
    { value: 'FORM_COMPLETION', label: "Form completion" },
    { value: 'TABLE_COMPLETION', label: "Table completion" },
    { value: 'FLOW_CHART_COMPLETION', label: "Flow-chart completion" },
    { value: 'SENTENCE_COMPLETION', label: "Sentence completion" },
    { value: 'SUMMARY_COMPLETION', label: "Summary completion" },
    { value: 'MATCHING', label: 'Matching' },
    { value: 'PLAN_MAP_DIAGRAM_LABELLING', label: 'Plan/map/diagram labeling' },
];

// ── Shared CSS helpers ─────────────────────────────────────────
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

// ── Default admin filters ──────────────────────────────────────
export const DEFAULT_ADMIN_FILTERS = {
    search: '',
    examType: '' as const,
    module: '' as const,
    difficulty: '' as const,
    status: '' as const,
    isPublished: '' as const,
    isPremium: '' as const,
    isDeleted: false,
    hasReading: '' as const,
    hasListening: '' as const,
    hasWriting: '' as const,
    hasSpeaking: '' as const,
    minTime: '' as const,
    maxTime: '' as const,
    minPassingScore: '' as const,
    maxPassingScore: '' as const,
    minPrice: '' as const,
    maxPrice: '' as const,
    minAttempts: '' as const,
    maxAttempts: '' as const,
    minCompletedAttempts: '' as const,
    maxCompletedAttempts: '' as const,
    minRating: '' as const,
    maxRating: '' as const,
    tag: '',
    createdBy: '',
    availableFrom: '',
    availableTo: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc' as const,
    createdFrom: '',
    createdTo: '',
    updatedFrom: '',
    updatedTo: '',
};

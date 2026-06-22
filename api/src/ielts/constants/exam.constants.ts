// ielts/constants/exam.constants.ts
import { ExamType } from '../dto/enums';

/** Required section fields per ExamType */
export const REQUIRED_SECTIONS_MAP: Record<ExamType, string[]> = {
    READING_ONLY: ['READING'],
    SPEAKING_ONLY: ['SPEAKING'],
    WRITING_ONLY: ['WRITING'],
    LISTENING_ONLY: ['LISTENING'],

    READING_SPEAKING: ['READING', 'SPEAKING'],
    READING_WRITING: ['READING', 'WRITING'],
    READING_LISTENING: ['READING', 'LISTENING'],
    SPEAKING_WRITING: ['SPEAKING', 'WRITING'],
    SPEAKING_LISTENING: ['SPEAKING', 'LISTENING'],
    WRITING_LISTENING: ['WRITING', 'LISTENING'],

    READING_SPEAKING_WRITING: ['READING', 'SPEAKING', 'WRITING'],
    READING_SPEAKING_LISTENING: ['READING', 'SPEAKING', 'LISTENING'],
    READING_WRITING_LISTENING: ['READING', 'WRITING', 'LISTENING'],
    SPEAKING_WRITING_LISTENING: ['SPEAKING', 'WRITING', 'LISTENING'],

    FULL_MOCK_TEST: ['READING', 'SPEAKING', 'WRITING', 'LISTENING'],
};

/** Default time limits (minutes) by ExamType */
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

/** Fields excluded from user-facing responses (correct answers) */
export const ANSWER_EXCLUDE_FIELDS = '-readingSection.passages.questions.correctAnswer ' + '-readingSection.passages.questions.acceptableAnswers ' + '-readingSection.passages.questions.explanation ' + '-listeningSection.parts.questions.correctAnswer ' + '-listeningSection.parts.questions.acceptableAnswers ' + '-listeningSection.parts.questions.explanation ' + '-writingSection.tasks.sampleAnswer ' + '-writingSection.tasks.examinerNotes ' + '-speakingSection.parts.questions.sampleAnswer';

/** Cache TTL constants (seconds) */
export const CACHE_TTL = {
    EXAM: 3_600,
    EXAM_LIST: 300,
    ATTEMPTS: 300,
    STATISTICS: 600,
} as const;

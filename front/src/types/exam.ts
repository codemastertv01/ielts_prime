// types/exam.ts
import { EntityStatus } from './entity.status';

// ─── Enums ────────────────────────────────────────────────────

export const ExamTypeEnum = {
    READING_ONLY: 'READING_ONLY',
    SPEAKING_ONLY: 'SPEAKING_ONLY',
    WRITING_ONLY: 'WRITING_ONLY',
    LISTENING_ONLY: 'LISTENING_ONLY',
    READING_SPEAKING: 'READING_SPEAKING',
    READING_WRITING: 'READING_WRITING',
    READING_LISTENING: 'READING_LISTENING',
    SPEAKING_WRITING: 'SPEAKING_WRITING',
    SPEAKING_LISTENING: 'SPEAKING_LISTENING',
    WRITING_LISTENING: 'WRITING_LISTENING',
    READING_SPEAKING_WRITING: 'READING_SPEAKING_WRITING',
    READING_SPEAKING_LISTENING: 'READING_SPEAKING_LISTENING',
    READING_WRITING_LISTENING: 'READING_WRITING_LISTENING',
    SPEAKING_WRITING_LISTENING: 'SPEAKING_WRITING_LISTENING',
    FULL_MOCK_TEST: 'FULL_MOCK_TEST',
} as const;
export type ExamType = (typeof ExamTypeEnum)[keyof typeof ExamTypeEnum];

export const ExamModuleEnum = { ACADEMIC: 'ACADEMIC', GENERAL: 'GENERAL' } as const;
export type ExamModule = (typeof ExamModuleEnum)[keyof typeof ExamModuleEnum];

export const DifficultyLevelEnum = {
    BAND_4_5: 'BAND_4_5',
    BAND_5_6: 'BAND_5_6',
    BAND_6_7: 'BAND_6_7',
    BAND_7_8: 'BAND_7_8',
    BAND_8_9: 'BAND_8_9',
} as const;
export type DifficultyLevel = (typeof DifficultyLevelEnum)[keyof typeof DifficultyLevelEnum];

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
    BAND_4_5: "Band 4–5 (Boshlang'ich)",
    BAND_5_6: "Band 5–6 (O'rta-past)",
    BAND_6_7: "Band 6–7 (O'rta)",
    BAND_7_8: "Band 7–8 (O'rta-yuqori)",
    BAND_8_9: 'Band 8–9 (Yuqori)',
};

export const WritingTaskSubtypeEnum = {
    LINE_GRAPH: 'LINE_GRAPH',
    BAR_CHART: 'BAR_CHART',
    PIE_CHART: 'PIE_CHART',
    TABLE: 'TABLE',
    MAP: 'MAP',
    PROCESS_DIAGRAM: 'PROCESS_DIAGRAM',
    MIXED_CHARTS: 'MIXED_CHARTS',
    FORMAL_LETTER: 'FORMAL_LETTER',
    SEMI_FORMAL_LETTER: 'SEMI_FORMAL_LETTER',
    PERSONAL_LETTER: 'PERSONAL_LETTER',
    OPINION_ESSAY: 'OPINION_ESSAY',
    DISCUSSION_ESSAY: 'DISCUSSION_ESSAY',
    ADVANTAGE_DISADVANTAGE_ESSAY: 'ADVANTAGE_DISADVANTAGE_ESSAY',
    PROBLEM_SOLUTION_ESSAY: 'PROBLEM_SOLUTION_ESSAY',
    TWO_PART_QUESTION_ESSAY: 'TWO_PART_QUESTION_ESSAY',
} as const;
export type WritingTaskSubtype = (typeof WritingTaskSubtypeEnum)[keyof typeof WritingTaskSubtypeEnum];

export const SpeakingPartTypeEnum = {
    INTRODUCTION_FAMILIAR_TOPICS: 'INTRODUCTION_FAMILIAR_TOPICS',
    LONG_TURN_CUE_CARD: 'LONG_TURN_CUE_CARD',
    ANALYTICAL_DISCUSSION: 'ANALYTICAL_DISCUSSION',
} as const;
export type SpeakingPartType = (typeof SpeakingPartTypeEnum)[keyof typeof SpeakingPartTypeEnum];

// ─── Metadata ─────────────────────────────────────────────────

export interface MetadataInfo {
    userId: string;
    username?: string;
    email?: string;
    ipAddress?: string;
    device?: string;
    browser?: string;
    os?: string;
    country?: string;
    city?: string;
    timestamp?: string | Date;
}

export interface UpdateHistoryEntry {
    fieldName: string;
    oldValue: unknown;
    newValue: unknown;
    changedAt: string | Date;
    changedBy?: string;
}

export interface AuditLogEntry {
    action: string;
    description?: string;
    performedBy?: string;
    timestamp: string | Date;
}

export interface ExamMetadata {
    totalQuestions: number;
    totalPoints: number;
    lastComputedAt?: string | Date;
}

// ─── Reading ──────────────────────────────────────────────────

// export interface ReadingQuestion {
//     questionNumber: number;
//     type: QuestionType;
//     question: string;
//     options: string[];
//     matchingPool: string[];
//     correctAnswer: string;
//     acceptableAnswers: string[];
//     points: number;
//     explanation?: string;
//     locationHint?: string;
//     wordLimit?: string;
//     paragraphLabel?: string;
// }

// export interface ReadingQuestionGroup {
//     groupLabel: string;
//     type: QuestionType;
//     instructions?: string;
//     completionText?: string;
//     matchingPool: string[];
//     wordLimit?: string;
//     questionNumbers: number[];
// }

// export interface ReadingPassage {
//     passageNumber: number;
//     title: string;
//     content: string;
//     wordCount: number;
//     paragraphLabels: string[];
//     source?: string;
//     keywords: string[];
//     questionGroups: ReadingQuestionGroup[];
//     questions: ReadingQuestion[];
//     totalQuestions: number;
//     totalPoints: number;
// }

// export interface ReadingSection {
//     isEnabled: boolean;
//     timeLimitMinutes: number;
//     passages: ReadingPassage[];
//     totalQuestions: number;
//     totalPoints: number;
//     instructions?: string;
// }

// ─── Listening ────────────────────────────────────────────────

// export interface ListeningQuestion {
//     questionNumber: number;
//     type: QuestionType;
//     question: string;
//     options: string[];
//     matchingPool: string[];
//     correctAnswer: string;
//     acceptableAnswers: string[];
//     points: number;
//     explanation?: string;
//     timestampStart?: number;
//     timestampEnd?: number;
//     wordLimit?: string;
//     diagramImageUrl?: string;
//     diagramGroupId?: string;
//     diagramLabel?: string;
// }

// export interface ListeningQuestionGroup {
//     groupLabel: string;
//     type: QuestionType;
//     instructions?: string;
//     completionText?: string;
//     diagramImageUrl?: string;
//     matchingPool: string[];
//     wordLimit?: string;
//     questionNumbers: number[];
// }

// export interface ListeningPart {
//     partNumber: number;
//     title: string;
//     context: string;
//     audioUrl: string;
//     durationSeconds: number;
//     transcript?: string;
//     isMonologue: boolean;
//     speakerCount: number;
//     instructions?: string;
//     questionGroups: ListeningQuestionGroup[];
//     questions: ListeningQuestion[];
//     totalQuestions: number;
//     totalPoints: number;
// }

// export interface ListeningSection {
//     isEnabled: boolean;
//     timeLimitMinutes: number;
//     transferTimeMinutes: number;
//     parts: ListeningPart[];
//     totalQuestions: number;
//     totalPoints: number;
//     instructions?: string;
// }

// ─── Writing ──────────────────────────────────────────────────

// export interface WritingTask {
//     taskNumber: number;
//     type: QuestionType;
//     subtype?: WritingTaskSubtype;
//     prompt: string;
//     imageUrl?: string;
//     chartData?: string;
//     secondImageUrl?: string;
//     visualCaption?: string;
//     letterBulletPoints: string[];
//     letterSalutationHint?: string;
//     essayDirectives: string[];
//     minimumWords: number;
//     suggestedTimeMinutes: number;
//     maxBandScore: number;
//     assessmentCriteria: string[];
//     sampleAnswer?: string;
//     examinerNotes?: string;
//     instructions?: string;
// }

// export interface WritingSection {
//     isEnabled: boolean;
//     timeLimitMinutes: number;
//     tasks: WritingTask[];
//     instructions?: string;
// }

// ─── Speaking ─────────────────────────────────────────────────

// export interface SpeakingQuestion {
//     questionNumber: number;
//     question: string;
//     followUpQuestions: string[];
//     suggestedTimeSeconds?: number;
//     sampleAnswer?: string;
//     languageTips: string[];
//     topicCategory?: string;
// }

// export interface SpeakingPart {
//     partNumber: number;
//     partType: SpeakingPartType;
//     title: string;
//     instructions?: string;
//     durationMinutes: number;
//     topicGroups: string[];
//     cueCardTopic?: string;
//     cueCardPoints: string[];
//     preparationTimeSeconds: number;
//     minimumSpeakingSeconds: number;
//     maximumSpeakingSeconds: number;
//     roundingOffQuestions: string[];
//     discussionTheme?: string;
//     questions: SpeakingQuestion[];
// }

export interface SpeakingSection {
    isEnabled: boolean;
    timeLimitMinutes: number;
    parts: SpeakingPart[];
    requiresRecording: boolean;
    allowRetakes: boolean;
    instructions?: string;
}

// ─── Main Exam ────────────────────────────────────────────────

export interface IELTSExam {
    _id: string;
    title: string;
    description?: string;
    examType: ExamType;
    module: ExamModule;
    difficulty: DifficultyLevel;
    totalTimeLimitMinutes: number;
    passingScore: number;
    isPublished: boolean;
    publishedAt?: string | Date;
    availableFrom?: string | Date;
    availableUntil?: string | Date;
    isPremium: boolean;
    price: number;
    totalAttempts: number;
    completedAttempts: number;
    averageRating: number;
    totalRatings: number;
    tags: string[];
    thumbnailUrl?: string;
    status: EntityStatus;
    isDeleted: boolean;
    readingSection?: ReadingSection;
    listeningSection?: ListeningSection;
    writingSection?: WritingSection;
    speakingSection?: SpeakingSection;
    createdBy?: MetadataInfo;
    updatedBy?: MetadataInfo[];
    deletedBy?: MetadataInfo[];
    updateHistory?: UpdateHistoryEntry[];
    auditLog?: AuditLogEntry[];
    metadata?: ExamMetadata;
    createdAt: string | Date;
    updatedAt: string | Date;
}

// ─── Filters & Responses ──────────────────────────────────────

export interface AdminExamFilters {
    search?: string;
    examType?: ExamType | '';
    module?: ExamModule | '';
    difficulty?: DifficultyLevel | '';
    status?: EntityStatus | '';
    isPublished?: boolean | '';
    isPremium?: boolean | '';
    isDeleted?: boolean;
    hasReading?: boolean | '';
    hasListening?: boolean | '';
    hasWriting?: boolean | '';
    hasSpeaking?: boolean | '';
    minTime?: number | '';
    maxTime?: number | '';
    minPassingScore?: number | '';
    maxPassingScore?: number | '';
    minPrice?: number | '';
    maxPrice?: number | '';
    minAttempts?: number | '';
    maxAttempts?: number | '';
    minCompletedAttempts?: number | '';
    maxCompletedAttempts?: number | '';
    minRating?: number | '';
    maxRating?: number | '';
    tag?: string;
    createdBy?: string;
    availableFrom?: string;
    availableTo?: string;
    page?: number;
    limit?: number | 'all';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    createdFrom?: string;
    createdTo?: string;
    updatedFrom?: string;
    updatedTo?: string;
}

export interface UserExamFilters {
    search?: string;
    examType?: ExamType | '';
    module?: ExamModule | '';
    difficulty?: DifficultyLevel | '';
    isPremium?: boolean | '';
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface ExamListResponse {
    exams: IELTSExam[];
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface GlobalExamStats {
    total: number;
    published: number;
    drafts: number;
    deleted: number;
    premium: number;
    byType: Record<string, number>;
    byModule: Record<string, number>;
    byDifficulty: Record<string, number>;
    topRated: IELTSExam[];
    mostAttempted: IELTSExam[];
}

export interface ExamStats {
    examId: string;
    title: string;
    examType: ExamType;
    module: string;
    difficulty: string;
    statistics: {
        totalAttempts: number;
        completedAttempts: number;
        completionRate: string;
        averageRating: number;
        totalRatings: number;
        totalQuestions: number;
        totalPoints: number;
    };
    status: { isPublished: boolean; isPremium: boolean; status: string };
    dates: { createdAt: Date; publishedAt?: Date; availableFrom?: Date; availableUntil?: Date };
}

export interface BulkOperationResult {
    succeeded: number;
    failed: Array<{ examId: string; reason: string }>;
}

// ─── Form state ───────────────────────────────────────────────

export interface BasicInfoFormData {
    title: string;
    description: string;
    examType: ExamType;
    module: ExamModule;
    difficulty: DifficultyLevel;
    totalTimeLimitMinutes: number;
    passingScore: number;
    isPremium: boolean;
    price: number;
    tags: string;
    thumbnailUrl: string;
    availableFrom: string;
    availableUntil: string;
}

export interface ValidationError {
    field: string;
    msg: string;
}

export interface ExamFilters extends AdminExamFilters {
    isDeleted: boolean;
}

// =====================================================================

// ─── Question Types ───────────────────────────────────────────────────────────

export const QuestionTypeEnum = {
    MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
    MULTIPLE_CHOICE_MULTIPLE: 'MULTIPLE_CHOICE_MULTIPLE_ANSWERS',
    SENTENCE_COMPLETION: 'SENTENCE_COMPLETION',
    SUMMARY_COMPLETION: 'SUMMARY_COMPLETION',
    NOTE_COMPLETION: 'NOTE_COMPLETION',
    TABLE_COMPLETION: 'TABLE_COMPLETION',
    FLOW_CHART_COMPLETION: 'FLOW_CHART_COMPLETION',
    FORM_COMPLETION: 'FORM_COMPLETION',
    MATCHING: 'MATCHING',
    PLAN_MAP_DIAGRAM_LABELLING: 'PLAN_MAP_DIAGRAM_LABELLING',
    MATCHING_HEADINGS: 'MATCHING_HEADINGS',
    MATCHING_INFORMATION: 'MATCHING_INFORMATION',
    MATCHING_FEATURES: 'MATCHING_FEATURES',
    MATCHING_SENTENCE_ENDINGS: 'MATCHING_SENTENCE_ENDINGS',
    TRUE_FALSE_NOT_GIVEN: 'TRUE_FALSE_NOT_GIVEN',
    YES_NO_NOT_GIVEN: 'YES_NO_NOT_GIVEN',
    SHORT_ANSWER: 'SHORT_ANSWER',
    TASK_1_ACADEMIC: 'TASK_1_ACADEMIC',
    TASK_1_GENERAL: 'TASK_1_GENERAL',
    TASK_2: 'TASK_2_ESSAY',
    TASK_2_ESSAY: 'TASK_2_ESSAY',
} as const;

export type QuestionType = (typeof QuestionTypeEnum)[keyof typeof QuestionTypeEnum];

// ─── Section Types ────────────────────────────────────────────────────────────

export type SectionId = 'listening' | 'reading' | 'writing' | 'speaking';

export interface ExamSection {
    id: SectionId;
    label: string;
}

// ─── Exam Data Shapes ─────────────────────────────────────────────────────────

export interface ListeningQuestion {
    questionNumber: number;
    type: string;
    question: string;
    options?: string[];
    matchingPool?: string[];
    correctAnswer?: string;
    acceptableAnswers?: string[];
    points?: number;
    explanation?: string;
    wordLimit?: string;
    timestampStart?: number;
    timestampEnd?: number;
    diagramImageUrl?: string;
    diagramGroupId?: string;
    diagramLabel?: string;
}

export interface ListeningQuestionGroup {
    groupLabel: string;
    instructions?: string;
    wordLimit?: string;
    matchingPool?: string[];
    questionNumbers: number[];
}

export interface ListeningPart {
    partNumber: number;
    title: string;
    audioUrl: string;
    context?: string;
    durationSeconds?: number;
    transcript?: string;
    isMonologue?: boolean;
    speakerCount?: number;
    instructions?: string;
    questions: ListeningQuestion[];
    questionGroups?: ListeningQuestionGroup[];
    totalQuestions?: number;
    totalPoints?: number;
}

export interface ListeningSection {
    isEnabled: boolean;
    timeLimitMinutes: number;
    parts: ListeningPart[];
    transferTimeMinutes?: number;
    totalQuestions?: number;
    totalPoints?: number;
    instructions?: string;
}

export interface ReadingQuestion {
    questionNumber: number;
    type: string;
    question: string;
    options?: string[];
    matchingPool?: string[];
    wordLimit?: string;
    correctAnswer?: string;
    acceptableAnswers?: string[];
    points?: number;
    explanation?: string;
    locationHint?: string;
    paragraphLabel?: string;
}

export interface ReadingQuestionGroup {
    groupLabel: string;
    instructions?: string;
    wordLimit?: string;
    matchingPool?: string[];
    questionNumbers: number[];
}

export interface ReadingPassage {
    passageNumber: number;
    title: string;
    content: string;
    wordCount?: number;
    paragraphLabels?: string[];
    source?: string;
    keywords?: string[];
    questions: ReadingQuestion[];
    questionGroups?: ReadingQuestionGroup[];
    totalQuestions?: number;
    totalPoints?: number;
}

export interface ReadingSection {
    isEnabled: boolean;
    timeLimitMinutes: number;
    passages: ReadingPassage[];
    totalQuestions?: number;
    totalPoints?: number;
    instructions?: string;
}

export interface WritingTask {
    taskNumber: number;
    type: string;
    subtype?: WritingTaskSubtype;
    prompt: string;
    imageUrl?: string;
    secondImageUrl?: string;
    visualCaption?: string;
    letterBulletPoints?: string[];
    letterSalutationHint?: string;
    essayDirectives?: string[];
    minimumWords: number;
    suggestedTimeMinutes?: number;
    maxBandScore?: number;
    assessmentCriteria?: string[];
    sampleAnswer?: string;
    examinerNotes?: string;
    instructions?: string;
}

export interface WritingSection {
    isEnabled: boolean;
    timeLimitMinutes: number;
    tasks: WritingTask[];
}

export interface SpeakingQuestion {
    questionNumber: number;
    question: string;
    followUpQuestions?: string[];
    suggestedTimeSeconds?: number;
    sampleAnswer?: string;
    languageTips?: string[];
    topicCategory?: string;
}

export interface SpeakingPart {
    partNumber: number;
    title: string;
    durationMinutes: number;
    partType?: SpeakingPartType;
    topicGroups?: string[];
    cueCardTopic?: string;
    cueCardPoints?: string[];
    preparationTimeSeconds?: number;
    minimumSpeakingSeconds?: number;
    maximumSpeakingSeconds?: number;
    roundingOffQuestions?: string[];
    discussionTheme?: string;
    questions: SpeakingQuestion[];
}

export interface SpeakingSection {
    isEnabled: boolean;
    timeLimitMinutes: number;
    parts: SpeakingPart[];
}

export interface ExamData {
    _id: string;
    title: string;
    totalTimeLimitMinutes: number;
    listeningSection?: ListeningSection;
    readingSection?: ReadingSection;
    writingSection?: WritingSection;
    speakingSection?: SpeakingSection;
}

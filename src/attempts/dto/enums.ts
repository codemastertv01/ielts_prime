import { EntityStatus } from '../../dto/entity-status.dto';
import { IELTSExamAttemptDocument } from '../schemas/ielts.attempts.schema';

export const VALID_BAND_SCORES = new Set([0, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9]);

/** Reading uchun IELTS rasmiy band jadval (to'g'ri javob soni → band) */
export const READING_BAND_TABLE: [number, number][] = [
    [39, 9],
    [37, 8.5],
    [35, 8],
    [33, 7.5],
    [30, 7],
    [27, 6.5],
    [23, 6],
    [19, 5.5],
    [15, 5],
    [13, 4.5],
    [10, 4],
    [8, 3.5],
    [6, 3],
    [4, 2.5],
    [3, 2],
    [2, 1],
];

/** Listening uchun IELTS rasmiy band jadval */
export const LISTENING_BAND_TABLE: [number, number][] = [
    [39, 9],
    [37, 8.5],
    [35, 8],
    [32, 7.5],
    [30, 7],
    [26, 6.5],
    [23, 6],
    [18, 5.5],
    [16, 5],
    [13, 4.5],
    [10, 4],
    [8, 3.5],
    [6, 3],
    [4, 2.5],
    [3, 2],
    [2, 1],
];

export const TERMINAL_STATUSES = new Set([EntityStatus.GRADED, EntityStatus.EXPIRED]);

export type AttemptDoc = IELTSExamAttemptDocument & Record<string, any>;

export interface PaginatedAttempts {
    attempts: IELTSExamAttemptDocument[];
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface BulkOperationResult {
    succeeded: number;
    failed: Array<{ id: string; reason: string }>;
}

export interface AdminStats {
    total: number;
    active: { inProgress: number; submitted: number; grading: number; graded: number; expired: number };
    deleted: number;
    avgBandScore: number | null;
    gradedCount: number;
    bandDistribution: Array<{ band: number; count: number }>;
    todayAttempts: number;
    weekAttempts: number;
}

/** Foydalanuvchi dashboard uchun o'z natijasi */
export interface UserAttemptResult {
    attemptId: string;
    examTitle: string;
    examType: string;
    module: string;
    attemptNumber: number;
    status: EntityStatus;
    overallBandScore: number | null;
    readingBandScore: number | null;
    listeningBandScore: number | null;
    writingBandScore: number | null;
    speakingBandScore: number | null;
    percentageScore: number;
    isPassed: boolean;
    startedAt: Date;
    submittedAt: Date | null;
}

// ─── Populate configs ──────────────────────────────────────────────────────────

export const EXAM_FIELDS_SHORT = 'title examType module difficulty thumbnailUrl passingScore';
export const EXAM_FIELDS_FULL = 'title examType module difficulty totalTimeLimitMinutes thumbnailUrl passingScore ' + 'readingSection listeningSection writingSection speakingSection availableFrom availableUntil';
export const USER_FIELDS_SHORT = 'username email';
export const USER_FIELDS_FULL = 'username email firstName lastName createdAt';

/** User endpointda bu fieldlar yashiriladi */
export const USER_HIDDEN_FIELDS = '-auditLog -changeHistory -adminNotes -createdBy -updatedBy ' + '-deletedBy -deletedAt -deleteReason -restoredAt -restoredBy';

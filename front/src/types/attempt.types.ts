// types/attempt.types.ts

import { EntityStatus } from './entity.status';

// ─── Request DTOs ─────────────────────────────────────────────

export interface AutoSaveReadingAnswerDto {
    passageNumber: number;
    questionNumber: number;
    answer?: string;
    multipleAnswers?: string[];
}

export interface AutoSaveListeningAnswerDto {
    partNumber: number;
    questionNumber: number;
    answer?: string;
    multipleAnswers?: string[];
}

export interface AutoSaveData {
    readingAnswers?: AutoSaveReadingAnswerDto[];
    listeningAnswers?: AutoSaveListeningAnswerDto[];
    writingTask1?: string;
    writingTask2?: string;
}

export interface SubmitReadingAnswerDto {
    passageNumber: number;
    questionNumber: number;
    answer?: string;
    multipleAnswers?: string[];
}

export interface SubmitReadingSectionDto {
    answers: SubmitReadingAnswerDto[];
}

export interface SubmitListeningAnswerDto {
    partNumber: number;
    questionNumber: number;
    answer?: string;
    multipleAnswers?: string[];
}

export interface SubmitListeningSectionDto {
    answers: SubmitListeningAnswerDto[];
}

export interface SubmitWritingTaskDto {
    taskNumber: number;
    content: string;
}

export interface SubmitWritingSectionDto {
    tasks: SubmitWritingTaskDto[];
}

export interface SubmitSpeakingPartDto {
    partNumber: number;
    recordingUrl: string;
    durationSeconds: number;
}

export interface SubmitSpeakingSectionDto {
    parts: SubmitSpeakingPartDto[];
}

export interface SpeakingRecordingData {
    partNumber: number;
    recordingUrl: string;
    durationSeconds: number;
}


// ─────────────────────────────────────────────────────────────────────────────
// types/attempt.types.ts  — Backend NestJS schema bilan 100% mos
// ─────────────────────────────────────────────────────────────────────────────

export enum SpeakingRecordingStatus {
    NOT_RECORDED = 'NOT_RECORDED',
    RECORDING = 'RECORDING',
    RECORDED = 'RECORDED',
    UPLOADED = 'UPLOADED',
    FAILED = 'FAILED',
}

// ─── Populated refs ───────────────────────────────────────────────────────────

export interface PopulatedUser {
    _id: string;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    createdAt?: string;
}

export interface PopulatedExam {
    _id: string;
    title?: string;
    examType?: string;
    module?: string;
    difficulty?: string;
    thumbnailUrl?: string;
    totalTimeLimitMinutes?: number;
    readingSection?: unknown;
    listeningSection?: unknown;
    writingSection?: unknown;
    speakingSection?: unknown;
    availableFrom?: string;
    availableUntil?: string;
}

// ─── Sub-document types (schema ile tam mos) ─────────────────────────────────

export interface ReadingAnswer {
    passageNumber: number;
    questionNumber: number;
    answer?: string;
    multipleAnswers: string[];
    isCorrect?: boolean;
    pointsEarned: number;
    answeredAt?: string;
}

export interface ListeningAnswer {
    partNumber: number;
    questionNumber: number;
    answer?: string;
    multipleAnswers: string[];
    isCorrect?: boolean;
    pointsEarned: number;
    answeredAt?: string;
}

export interface WritingCriteriaScores {
    taskAchievement?: number;
    coherenceCohesion?: number;
    lexicalResource?: number;
    grammaticalRange?: number;
}

export interface WritingAnswer {
    taskNumber: number;
    content?: string;
    wordCount: number;
    bandScore?: number;
    criteriaScores?: WritingCriteriaScores;
    feedback?: string;
    aiFeedback?: string;
    gradedBy?: string;
    gradedAt?: string;
    submittedAt?: string;
    isHumanGraded: boolean;
}

export interface SpeakingCriteriaScores {
    fluencyCoherence?: number;
    lexicalResource?: number;
    grammaticalRange?: number;
    pronunciation?: number;
}

export interface SpeakingAnswer {
    partNumber: number;
    recordingUrl?: string;
    durationSeconds?: number;
    recordingStatus: SpeakingRecordingStatus | string;
    recordedAt?: string;
    transcript?: string;
    bandScore?: number;
    criteriaScores?: SpeakingCriteriaScores;
    feedback?: string;
    aiFeedback?: string;
    gradedBy?: string;
    gradedAt?: string;
    isHumanGraded: boolean;
}

export interface SectionTiming {
    startedAt?: string;
    submittedAt?: string;
    timeSpentSeconds?: number;
}

export interface AuditLogEntry {
    action: string;
    performedBy: string;
    performedByRole: 'user' | 'admin' | 'system';
    timestamp: string;
    note?: string;
    previousValue?: unknown;
    newValue?: unknown;
    field?: string;
    metadata?: unknown;
}

export interface ChangeHistoryEntry {
    field: string;
    previousValue: unknown;
    newValue: unknown;
    changedBy: string;
    changedAt: string;
    reason?: string;
}

export interface AdminNote {
    note: string;
    addedBy: string;
    addedAt: string;
}

// ─── Main attempt document ────────────────────────────────────────────────────

export interface IELTSExamAttempt {
    _id: string;
    userId: string | PopulatedUser;
    examId: string | PopulatedExam;
    attemptNumber: number;
    status: EntityStatus;

    // Timing
    startedAt?: string;
    submittedAt?: string;
    expiresAt?: string;
    createdAt: string;
    updatedAt?: string;
    totalTimeSpentSeconds?: number;

    // Section timings
    listeningTiming?: SectionTiming;
    readingTiming?: SectionTiming;
    writingTiming?: SectionTiming;
    speakingTiming?: SectionTiming;

    // Answers
    readingAnswers: ReadingAnswer[];
    listeningAnswers: ListeningAnswer[];
    writingAnswers: WritingAnswer[];
    speakingAnswers: SpeakingAnswer[];

    // Band scores
    overallBandScore?: number;
    readingBandScore?: number;
    listeningBandScore?: number;
    writingBandScore?: number;
    speakingBandScore?: number;

    // Raw scores
    readingRawScore?: number;
    listeningRawScore?: number;

    // Summary
    totalScore?: number;
    totalPossibleScore?: number;
    percentageScore?: number;
    isPassed?: boolean;

    // Grading flags
    writingFullyGraded?: boolean;
    speakingFullyGraded?: boolean;
    sectionsSubmitted?: string[];

    // Auto-save
    autoSaveCount?: number;
    lastAutoSaveAt?: string;

    // Device
    ipAddress?: string;
    userAgent?: string;
    device?: string;
    browser?: string;
    os?: string;
    country?: string;
    city?: string;

    // Admin
    tags?: string[];
    isReviewed?: boolean;
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNote?: string;
    generalFeedback?: string;
    adminNotes?: AdminNote[];
    auditLog?: AuditLogEntry[];
    changeHistory?: ChangeHistoryEntry[];

    // User feedback
    userRating?: number;
    userComment?: string;

    // Soft delete
    isDeleted?: boolean;
    deletedAt?: string;
    deletedBy?: string;
    deleteReason?: string;
    restoredAt?: string;
    restoredBy?: string;
}

// ─── Request DTOs (backend AdminUpdateAttemptDto ile mos) ────────────────────

export interface AdminUpdateAttemptDto {
    status?: EntityStatus;
    overallBandScore?: number;
    readingBandScore?: number;
    listeningBandScore?: number;
    writingBandScore?: number;
    speakingBandScore?: number;
    tags?: string[];
    isReviewed?: boolean;
    reviewNote?: string;
    adminNote?: string;
    generalFeedback?: string;
}

export interface GradeWritingDto {
    taskNumber: number;
    taskAchievement: number;
    coherenceCohesion: number;
    lexicalResource: number;
    grammaticalRange: number;
    feedback?: string;
    aiFeedback?: string;
}

export interface GradeSpeakingDto {
    partNumber: number;
    fluencyCoherence: number;
    lexicalResource: number;
    grammaticalRange: number;
    pronunciation: number;
    transcript?: string;
    feedback?: string;
    aiFeedback?: string;
}

export interface BulkDeleteDto {
    ids: string[];
    reason?: string;
}

// ─── Query / Response ─────────────────────────────────────────────────────────

export interface AllAttemptsParams {
    page?: number;
    limit?: number;
    status?: EntityStatus | string;
    examId?: string;
    userId?: string;
    isDeleted?: boolean;
    q?: string;
    attemptId?: string;
    attemptNumber?: number;
    userSearch?: string;
    examSearch?: string;
    createdFrom?: string;
    createdTo?: string;
    submittedFrom?: string;
    submittedTo?: string;
    minOverallBand?: number;
    maxOverallBand?: number;
    minReadingBand?: number;
    maxReadingBand?: number;
    minListeningBand?: number;
    maxListeningBand?: number;
    minWritingBand?: number;
    maxWritingBand?: number;
    minSpeakingBand?: number;
    maxSpeakingBand?: number;
    isReviewed?: boolean;
    sortBy?: 'createdAt' | 'updatedAt' | 'attemptNumber' | 'overallBandScore' | 'readingBandScore' | 'listeningBandScore' | 'writingBandScore' | 'speakingBandScore' | 'status';
    sortOrder?: 'asc' | 'desc';
}

export interface AttemptListResponse {
    attempts: IELTSExamAttempt[];
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface AdminStats {
    total: number;
    active: {
        inProgress: number;
        submitted: number;
        grading: number;
        graded: number;
        expired: number;
    };
    deleted: number;
    avgBandScore: number | null;
    gradedCount: number;
    bandDistribution: Array<{ band: number; count: number }>;
    todayAttempts: number;
    weekAttempts: number;
}

// ─── Utility helpers ──────────────────────────────────────────────────────────

export const getUser = (a: IELTSExamAttempt): PopulatedUser | null => (typeof a.userId === 'object' ? (a.userId as PopulatedUser) : null);

export const getExam = (a: IELTSExamAttempt): PopulatedExam | null => (typeof a.examId === 'object' ? (a.examId as PopulatedExam) : null);

export const getUserId = (a: IELTSExamAttempt): string => (typeof a.userId === 'object' ? (a.userId as PopulatedUser)?._id : a.userId);

export const getExamId = (a: IELTSExamAttempt): string => (typeof a.examId === 'object' ? (a.examId as PopulatedExam)?._id : a.examId);

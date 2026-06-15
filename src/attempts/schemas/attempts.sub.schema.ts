// attempts/schemas/attempts.sub.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { SpeakingRecordingStatus } from '../../dto/speaking-recording-status';

// ═══════════════════════════════════════════════════════════
// SECTION TIMING  — per-section start/submit tracking
// ═══════════════════════════════════════════════════════════

@Schema({ _id: false })
export class SectionTiming {
    @Prop({ type: Date, default: null })
    startedAt?: Date;

    @Prop({ type: Date, default: null })
    submittedAt?: Date;

    @Prop({ type: Number, default: 0, min: 0 })
    timeSpentSeconds: number;
}
export const SectionTimingSchema = SchemaFactory.createForClass(SectionTiming);

// ═══════════════════════════════════════════════════════════
// READING ANSWER
// ═══════════════════════════════════════════════════════════

@Schema({ _id: false })
export class ReadingAnswer {
    /** 1–3 (passage index) */
    @Prop({ type: Number, required: true, min: 1, max: 3 })
    passageNumber: number;

    /** 1–40 (global question number) */
    @Prop({ type: Number, required: true, min: 1, max: 40 })
    questionNumber: number;

    /** Single-text answer (FILL_IN, T/F/NG, SHORT_ANSWER, etc.) */
    @Prop({ type: String, trim: true, default: null })
    answer?: string;

    /** Multi-select answers (MULTIPLE_CHOICE_MULTIPLE_ANSWERS) */
    @Prop({ type: [String], default: [] })
    multipleAnswers: string[];

    @Prop({ type: Boolean, default: null })
    isCorrect?: boolean;

    @Prop({ type: Number, default: 0, min: 0 })
    pointsEarned: number;

    @Prop({ type: Date, default: null })
    answeredAt?: Date;
}
export const ReadingAnswerSchema = SchemaFactory.createForClass(ReadingAnswer);

// ═══════════════════════════════════════════════════════════
// LISTENING ANSWER
// ═══════════════════════════════════════════════════════════

@Schema({ _id: false })
export class ListeningAnswer {
    /** 1–4 (part index) */
    @Prop({ type: Number, required: true, min: 1, max: 4 })
    partNumber: number;

    /** 1–40 (global question number) */
    @Prop({ type: Number, required: true, min: 1, max: 40 })
    questionNumber: number;

    @Prop({ type: String, trim: true, default: null })
    answer?: string;

    @Prop({ type: [String], default: [] })
    multipleAnswers: string[];

    @Prop({ type: Boolean, default: null })
    isCorrect?: boolean;

    @Prop({ type: Number, default: 0, min: 0 })
    pointsEarned: number;

    @Prop({ type: Date, default: null })
    answeredAt?: Date;
}
export const ListeningAnswerSchema = SchemaFactory.createForClass(ListeningAnswer);

// ═══════════════════════════════════════════════════════════
// WRITING CRITERIA SCORES  (IELTS official 4 criteria)
// ═══════════════════════════════════════════════════════════

@Schema({ _id: false })
export class WritingCriteriaScores {
    /** Task Achievement (Task 1) / Task Response (Task 2) */
    @Prop({ type: Number, min: 0, max: 9, default: null })
    taskAchievement?: number;

    @Prop({ type: Number, min: 0, max: 9, default: null })
    coherenceCohesion?: number;

    @Prop({ type: Number, min: 0, max: 9, default: null })
    lexicalResource?: number;

    @Prop({ type: Number, min: 0, max: 9, default: null })
    grammaticalRange?: number;
}
export const WritingCriteriaScoresSchema = SchemaFactory.createForClass(WritingCriteriaScores);

// ─── Writing Answer ───────────────────────────────────────

@Schema({ _id: false })
export class WritingAnswer {
    /** 1 or 2 */
    @Prop({ type: Number, required: true, min: 1, max: 2 })
    taskNumber: number;

    @Prop({ type: String, default: '' })
    content: string;

    @Prop({ type: Number, default: 0, min: 0 })
    wordCount: number;

    @Prop({ type: Date, default: null })
    submittedAt?: Date;

    // ── Grading (filled by teacher/admin) ─────────────────
    @Prop({ type: Number, min: 0, max: 9, default: null })
    bandScore?: number;

    @Prop({ type: WritingCriteriaScoresSchema, default: null })
    criteriaScores?: WritingCriteriaScores;

    /** Human-readable feedback shown to student */
    @Prop({ type: String, default: null })
    feedback?: string;

    /** AI-generated pre-feedback (shown before human grading) */
    @Prop({ type: String, default: null })
    aiFeedback?: string;

    @Prop({ type: Types.ObjectId, ref: 'User', default: null })
    gradedBy?: Types.ObjectId;

    @Prop({ type: Date, default: null })
    gradedAt?: Date;

    @Prop({ type: Boolean, default: false })
    isHumanGraded: boolean;
}
export const WritingAnswerSchema = SchemaFactory.createForClass(WritingAnswer);

// ═══════════════════════════════════════════════════════════
// SPEAKING CRITERIA SCORES  (IELTS official 4 criteria)
// ═══════════════════════════════════════════════════════════

@Schema({ _id: false })
export class SpeakingCriteriaScores {
    @Prop({ type: Number, min: 0, max: 9, default: null })
    fluencyCoherence?: number;

    @Prop({ type: Number, min: 0, max: 9, default: null })
    lexicalResource?: number;

    @Prop({ type: Number, min: 0, max: 9, default: null })
    grammaticalRange?: number;

    @Prop({ type: Number, min: 0, max: 9, default: null })
    pronunciation?: number;
}
export const SpeakingCriteriaScoresSchema = SchemaFactory.createForClass(SpeakingCriteriaScores);

// ─── Speaking Answer ──────────────────────────────────────

@Schema({ _id: false })
export class SpeakingAnswer {
    /** 1–3 (Part 1 / 2 / 3) */
    @Prop({ type: Number, required: true, min: 1, max: 3 })
    partNumber: number;

    @Prop({ type: String, default: null })
    recordingUrl?: string;

    /** Duration in seconds */
    @Prop({ type: Number, min: 0, default: null })
    durationSeconds?: number;

    @Prop({
        type: String,
        enum: Object.values(SpeakingRecordingStatus),
        default: SpeakingRecordingStatus.NOT_RECORDED,
    })
    recordingStatus: SpeakingRecordingStatus;

    @Prop({ type: Date, default: null })
    recordedAt?: Date;

    /** Auto-transcription (AI STT) */
    @Prop({ type: String, default: null })
    transcript?: string;

    // ── Grading ───────────────────────────────────────────
    @Prop({ type: Number, min: 0, max: 9, default: null })
    bandScore?: number;

    @Prop({ type: SpeakingCriteriaScoresSchema, default: null })
    criteriaScores?: SpeakingCriteriaScores;

    @Prop({ type: String, default: null })
    feedback?: string;

    @Prop({ type: String, default: null })
    aiFeedback?: string;

    @Prop({ type: Types.ObjectId, ref: 'User', default: null })
    gradedBy?: Types.ObjectId;

    @Prop({ type: Date, default: null })
    gradedAt?: Date;

    @Prop({ type: Boolean, default: false })
    isHumanGraded: boolean;
}
export const SpeakingAnswerSchema = SchemaFactory.createForClass(SpeakingAnswer);

// ═══════════════════════════════════════════════════════════
// ADMIN NOTE
// ═══════════════════════════════════════════════════════════

@Schema({ _id: false })
export class AdminNote {
    @Prop({ type: String, required: true, trim: true, maxlength: 1000 })
    note: string;

    @Prop({ type: String, required: true })
    addedBy: string;

    @Prop({ type: Date, required: true })
    addedAt: Date;
}
export const AdminNoteSchema = SchemaFactory.createForClass(AdminNote);

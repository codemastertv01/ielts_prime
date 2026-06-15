import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BaseEntity } from '../../schemas/base.schema';
import { AdminNote, AdminNoteSchema, ListeningAnswer, ListeningAnswerSchema, ReadingAnswer, ReadingAnswerSchema, SectionTiming, SectionTimingSchema, SpeakingAnswer, SpeakingAnswerSchema, WritingAnswer, WritingAnswerSchema } from './attempts.sub.schema';

export type IELTSExamAttemptDocument = IELTSExamAttempt;

@Schema({ timestamps: true, collection: 'ielts_exam_attempts', toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class IELTSExamAttempt extends BaseEntity {
    // ── Core refs ─────────────────────────────────────────
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'IELTSExam', required: true, index: true })
    examId: Types.ObjectId;

    @Prop({ required: true, default: 1, min: 1 })
    attemptNumber: number;

    // ── Timing ────────────────────────────────────────────
    @Prop({ type: Date })
    startedAt: Date;

    @Prop({ type: Date })
    submittedAt: Date;

    /** Hard deadline: startedAt + exam.totalTimeLimitMinutes */
    @Prop({ type: Date, index: true })
    expiresAt: Date;

    @Prop({ default: 0 })
    totalTimeSpentSeconds: number;

    @Prop({ type: SectionTimingSchema })
    listeningTiming: SectionTiming;

    @Prop({ type: SectionTimingSchema })
    readingTiming: SectionTiming;

    @Prop({ type: SectionTimingSchema })
    writingTiming: SectionTiming;

    @Prop({ type: SectionTimingSchema })
    speakingTiming: SectionTiming;

    // ── Answers ───────────────────────────────────────────
    @Prop({ type: [ReadingAnswerSchema], default: [] })
    readingAnswers: ReadingAnswer[];

    @Prop({ type: [ListeningAnswerSchema], default: [] })
    listeningAnswers: ListeningAnswer[];

    @Prop({ type: [WritingAnswerSchema], default: [] })
    writingAnswers: WritingAnswer[];

    @Prop({ type: [SpeakingAnswerSchema], default: [] })
    speakingAnswers: SpeakingAnswer[];

    // ── Scores ────────────────────────────────────────────
    @Prop({ type: Number, min: 0, max: 40 })
    readingRawScore: number;

    @Prop({ type: Number, min: 0, max: 40 })
    listeningRawScore: number;

    @Prop({ type: Number, min: 0, max: 9 })
    readingBandScore: number;

    @Prop({ type: Number, min: 0, max: 9 })
    listeningBandScore: number;

    @Prop({ type: Number, min: 0, max: 9 })
    writingBandScore: number;

    @Prop({ type: Number, min: 0, max: 9 })
    speakingBandScore: number;

    @Prop({ type: Number, min: 0, max: 9 })
    overallBandScore: number;

    // ── Tags & review ─────────────────────────────────────
    @Prop({ type: [String], default: [] })
    tags: string[];

    @Prop({ default: false })
    isReviewed: boolean;

    @Prop({ type: String, default: null })
    reviewedBy: string;

    @Prop({ type: Date, default: null })
    reviewedAt: Date;

    @Prop({ type: String, default: null })
    reviewNote: string;

    @Prop({ type: String })
    generalFeedback: string;

    // ── User feedback ─────────────────────────────────────
    @Prop({ type: Number, min: 1, max: 5 })
    userRating: number;

    @Prop({ type: String })
    userComment: string;

    @Prop({ type: [AdminNoteSchema], default: [] })
    adminNotes: AdminNote[];
}

export const IELTSExamAttemptSchema = SchemaFactory.createForClass(IELTSExamAttempt);

IELTSExamAttemptSchema.pre('save', async function (next) {
    if (!this.isNew) return next();
    if (this.attemptNumber) return next();

    const AttemptModel = this.constructor as any;
    let unique = false;
    let generatedNumber: number = 0;

    while (!unique) {
        generatedNumber = Math.floor(100000 + Math.random() * 899999); // 100000–999999
        const exists = await AttemptModel.exists({ attemptNumber: generatedNumber });
        if (!exists) unique = true;
    }

    this.attemptNumber = generatedNumber;
    next();
});

// ── Indexes ───────────────────────────────────────────────
IELTSExamAttemptSchema.index({ userId: 1, examId: 1, attemptNumber: 1 }, { unique: true });
IELTSExamAttemptSchema.index({ userId: 1, examId: 1 });
IELTSExamAttemptSchema.index({ userId: 1, status: 1 });
IELTSExamAttemptSchema.index({ examId: 1, status: 1 });
IELTSExamAttemptSchema.index({ isDeleted: 1, status: 1 });
IELTSExamAttemptSchema.index({ overallBandScore: -1 });
IELTSExamAttemptSchema.index({ createdAt: -1 });

// ── Re-exports ────────────────────────────────────────────
export { AdminNote, ListeningAnswer, ReadingAnswer, SpeakingAnswer, SpeakingCriteriaScores, WritingAnswer, WritingCriteriaScores } from './attempts.sub.schema';

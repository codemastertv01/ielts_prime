// ielts/schemas/ielts.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseEntity } from '../../schemas/base.schema';
import { DifficultyLevel, ExamModule, ExamType } from '../dto/enums';
import { ReadingSection, ReadingSectionSchema } from './reading.schema';
import { ListeningSection, ListeningSectionSchema } from './listening.schema';
import { WritingSection, WritingSectionSchema } from './writing.schema';
import { SpeakingSection, SpeakingSectionSchema } from './speaking.schema';

export type IELTSExamDocument = IELTSExam & Document & { createdAt: Date; updatedAt: Date };

@Schema({ timestamps: true, collection: 'ielts_exams' })
export class IELTSExam extends BaseEntity {
    // ── Identity ──────────────────────────────────────────
    @Prop({ required: true, trim: true, maxlength: 200 })
    title: string;

    @Prop({ type: String, trim: true, maxlength: 1000, default: null })
    description?: string;

    @Prop({ type: String, enum: Object.values(ExamType), required: true, index: true })
    examType: ExamType;

    @Prop({ type: String, enum: Object.values(ExamModule), required: true, index: true })
    module: ExamModule;

    @Prop({ type: String, enum: Object.values(DifficultyLevel), required: true, index: true })
    difficulty: DifficultyLevel;

    // ── Sections ──────────────────────────────────────────
    @Prop({ type: ListeningSectionSchema, default: null })
    listeningSection?: ListeningSection;

    @Prop({ type: ReadingSectionSchema, default: null })
    readingSection?: ReadingSection;

    @Prop({ type: WritingSectionSchema, default: null })
    writingSection?: WritingSection;

    @Prop({ type: SpeakingSectionSchema, default: null })
    speakingSection?: SpeakingSection;

    // ── Time & scoring ────────────────────────────────────
    @Prop({ type: Number, required: true, min: 1, max: 600 })
    totalTimeLimitMinutes: number;

    @Prop({ type: Number, default: 5.5, min: 0, max: 9 })
    passingScore: number;

    // ── Visibility ────────────────────────────────────────
    @Prop({ type: Boolean, default: false, index: true })
    isPublished: boolean;

    @Prop({ type: Date, default: null })
    publishedAt?: Date;

    @Prop({ type: Date, default: null, index: true })
    availableFrom?: Date;

    @Prop({ type: Date, default: null, index: true })
    availableUntil?: Date;

    // ── Pricing ───────────────────────────────────────────
    @Prop({ type: Boolean, default: false, index: true })
    isPremium: boolean;

    @Prop({ type: Number, default: 0, min: 0 })
    price: number;

    // ── Statistics ────────────────────────────────────────
    @Prop({ type: Number, default: 0, min: 0 })
    totalAttempts: number;

    @Prop({ type: Number, default: 0, min: 0 })
    completedAttempts: number;

    @Prop({ type: Number, default: 0, min: 0, max: 5 })
    averageRating: number;

    @Prop({ type: Number, default: 0, min: 0 })
    totalRatings: number;

    // ── Meta ──────────────────────────────────────────────
    @Prop({ type: [String], default: [], index: true })
    tags: string[];

    @Prop({ type: String, default: null })
    thumbnailUrl?: string;

    /** Computed totals: { totalQuestions, totalPoints, lastComputedAt } */
    @Prop({ type: Object, default: {} })
    metadata: Record<string, unknown>;
}

export const IELTSExamSchema = SchemaFactory.createForClass(IELTSExam);

// ── Compound indexes ──────────────────────────────────────────
IELTSExamSchema.index({ examType: 1, module: 1, difficulty: 1 });
IELTSExamSchema.index({ isPublished: 1, isDeleted: 1, status: 1 });
IELTSExamSchema.index({ availableFrom: 1, availableUntil: 1 });
IELTSExamSchema.index({ isPremium: 1, isPublished: 1 });
IELTSExamSchema.index({ averageRating: -1, totalAttempts: -1 });
IELTSExamSchema.index({ createdAt: -1 });
IELTSExamSchema.index({ title: 'text', description: 'text' });

// ielts/schemas/speaking.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SpeakingPartType } from '../../ielts/dto/enums';

// ─── Question ─────────────────────────────────────────────────

@Schema({ _id: false })
export class SpeakingQuestion {
    @Prop({ type: Number, required: true, min: 1 })
    questionNumber: number;

    @Prop({ type: String, required: true, trim: true })
    question: string;

    /** Follow-up prompts the examiner may use */
    @Prop({ type: [String], default: [] })
    followUpQuestions: string[];

    @Prop({ type: Number, default: null })
    suggestedTimeSeconds?: number;

    /** Admin/teacher reference only */
    @Prop({ type: String, default: null })
    sampleAnswer?: string;

    /** Vocabulary/phrase tips for the examiner */
    @Prop({ type: [String], default: [] })
    languageTips: string[];

    @Prop({ type: String, trim: true, default: null })
    topicCategory?: string;
}
export const SpeakingQuestionSchema = SchemaFactory.createForClass(SpeakingQuestion);

// ─── Part ─────────────────────────────────────────────────────

@Schema({ _id: false })
export class SpeakingPart {
    @Prop({ type: Number, required: true, min: 1, max: 3 })
    partNumber: number;

    @Prop({ type: String, enum: Object.values(SpeakingPartType), required: true })
    partType: SpeakingPartType;

    @Prop({ type: String, required: true, trim: true })
    title: string;

    @Prop({ type: String, default: null })
    instructions?: string;

    @Prop({ type: Number, required: true, min: 1 })
    durationMinutes: number;

    // ── Part 1: familiar topics ───────────────────────────

    @Prop({ type: [String], default: [] })
    topicGroups: string[];

    // ── Part 2: cue card ──────────────────────────────────

    @Prop({ type: String, default: null })
    cueCardTopic?: string;

    @Prop({ type: [String], default: [] })
    cueCardPoints: string[];

    @Prop({ type: Number, default: 60, min: 0 })
    preparationTimeSeconds: number;

    // ── Recording constraints ─────────────────────────────

    @Prop({ type: Number, default: 60, min: 0 })
    minimumSpeakingSeconds: number;

    @Prop({ type: Number, default: 120, min: 1 })
    maximumSpeakingSeconds: number;

    // ── Part 3: analytical discussion ────────────────────

    @Prop({ type: [String], default: [] })
    roundingOffQuestions: string[];

    @Prop({ type: String, trim: true, default: null })
    discussionTheme?: string;

    @Prop({ type: [SpeakingQuestionSchema], required: true })
    questions: SpeakingQuestion[];
}
export const SpeakingPartSchema = SchemaFactory.createForClass(SpeakingPart);

// ─── Section ──────────────────────────────────────────────────

@Schema({ _id: false })
export class SpeakingSection {
    @Prop({ type: Boolean, default: true })
    isEnabled: boolean;

    @Prop({ type: Number, required: true, default: 14 })
    timeLimitMinutes: number;

    @Prop({ type: Boolean, default: true })
    requiresRecording: boolean;

    @Prop({ type: Boolean, default: false })
    allowRetakes: boolean;

    @Prop({ type: String, default: null })
    instructions?: string;

    @Prop({ type: [SpeakingPartSchema], required: true })
    parts: SpeakingPart[];
}
export const SpeakingSectionSchema = SchemaFactory.createForClass(SpeakingSection);

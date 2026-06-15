// ielts/schemas/listening.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { QuestionType } from '../../ielts/dto/enums';

// ─── Question ─────────────────────────────────────────────────

@Schema({ _id: false })
export class ListeningQuestion {
    @Prop({ type: Number, required: true, min: 1, max: 40 })
    questionNumber: number;

    @Prop({ type: String, enum: Object.values(QuestionType), required: true })
    type: QuestionType;

    @Prop({ type: String, required: true, trim: true })
    question: string;

    @Prop({ type: [String], default: [] })
    options: string[];

    @Prop({ type: [String], default: [] })
    matchingPool: string[];

    @Prop({ type: String, trim: true, default: '' })
    correctAnswer: string;

    @Prop({ type: [String], default: [] })
    acceptableAnswers: string[];

    @Prop({ type: Number, min: 1, max: 3, default: 1 })
    points: number;

    @Prop({ type: String, trim: true, default: null })
    wordLimit?: string;

    /** Audio timestamp range for this question (seconds) */
    @Prop({ type: Number, default: null })
    timestampStart?: number;

    @Prop({ type: Number, default: null })
    timestampEnd?: number;

    /** For PLAN_MAP_DIAGRAM_LABELLING */
    @Prop({ type: String, default: null })
    diagramImageUrl?: string;

    @Prop({ type: String, default: null })
    diagramGroupId?: string;

    @Prop({ type: String, default: null })
    diagramLabel?: string;

    @Prop({ type: String, trim: true, default: null })
    explanation?: string;
}
export const ListeningQuestionSchema = SchemaFactory.createForClass(ListeningQuestion);

// ─── Question Group ───────────────────────────────────────────

@Schema({ _id: false })
export class ListeningQuestionGroup {
    @Prop({ type: String, required: true, trim: true })
    groupLabel: string;

    @Prop({ type: String, enum: Object.values(QuestionType), required: true })
    type: QuestionType;

    @Prop({ type: String, trim: true, default: null })
    instructions?: string;

    @Prop({ type: String, default: null })
    completionText?: string;

    @Prop({ type: String, default: null })
    diagramImageUrl?: string;

    @Prop({ type: [String], default: [] })
    matchingPool: string[];

    @Prop({ type: String, trim: true, default: null })
    wordLimit?: string;

    @Prop({ type: [Number], required: true })
    questionNumbers: number[];
}
export const ListeningQuestionGroupSchema = SchemaFactory.createForClass(ListeningQuestionGroup);

// ─── Part ─────────────────────────────────────────────────────

@Schema({ _id: false })
export class ListeningPart {
    @Prop({ type: Number, required: true, min: 1, max: 4 })
    partNumber: number;

    @Prop({ type: String, required: true, trim: true })
    title: string;

    /** Scene setting (e.g. "A conversation between two students") */
    @Prop({ type: String, trim: true, default: '' })
    context: string;

    @Prop({ type: String, required: true })
    audioUrl: string;

    @Prop({ type: Number, required: true, min: 1 })
    durationSeconds: number;

    /** Full audio transcript (admin-only, not sent to user) */
    @Prop({ type: String, default: null })
    transcript?: string;

    @Prop({ type: Boolean, default: false })
    isMonologue: boolean;

    @Prop({ type: Number, default: 2, min: 1, max: 4 })
    speakerCount: number;

    @Prop({ type: String, default: null })
    instructions?: string;

    @Prop({ type: [ListeningQuestionGroupSchema], default: [] })
    questionGroups: ListeningQuestionGroup[];

    @Prop({ type: [ListeningQuestionSchema], required: true })
    questions: ListeningQuestion[];

    @Prop({ type: Number, required: true })
    totalQuestions: number;

    @Prop({ type: Number, required: true })
    totalPoints: number;
}
export const ListeningPartSchema = SchemaFactory.createForClass(ListeningPart);

// ─── Section ──────────────────────────────────────────────────

@Schema({ _id: false })
export class ListeningSection {
    @Prop({ type: Boolean, default: true })
    isEnabled: boolean;

    @Prop({ type: Number, required: true, default: 30, min: 1 })
    timeLimitMinutes: number;

    /** Extra time to transfer answers to answer sheet */
    @Prop({ type: Number, default: 10, min: 0 })
    transferTimeMinutes: number;

    @Prop({ type: String, default: null })
    instructions?: string;

    @Prop({ type: [ListeningPartSchema], required: true })
    parts: ListeningPart[];

    @Prop({ type: Number, required: true })
    totalQuestions: number;

    @Prop({ type: Number, required: true })
    totalPoints: number;
}
export const ListeningSectionSchema = SchemaFactory.createForClass(ListeningSection);

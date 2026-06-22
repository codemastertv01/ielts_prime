// ielts/schemas/reading.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { QuestionType } from '../../ielts/dto/enums';

// ─── Question ─────────────────────────────────────────────────

@Schema({ _id: false })
export class ReadingQuestion {
    @Prop({ type: Number, required: true, min: 1, max: 40 })
    questionNumber: number;

    @Prop({ type: String, enum: Object.values(QuestionType), required: true })
    type: QuestionType;

    @Prop({ type: String, required: true, trim: true })
    question: string;

    /** For MULTIPLE_CHOICE: ['A. option', 'B. option', ...] */
    @Prop({ type: [String], default: [] })
    options: string[];

    /** For MATCHING questions: pool of items to match against */
    @Prop({ type: [String], default: [] })
    matchingPool: string[];

    @Prop({ type: String, trim: true, default: '' })
    correctAnswer: string;

    /** Acceptable spelling/case variations */
    @Prop({ type: [String], default: [] })
    acceptableAnswers: string[];

    @Prop({ type: Number, min: 1, max: 3, default: 1 })
    points: number;

    /** e.g. "NO MORE THAN TWO WORDS" */
    @Prop({ type: String, trim: true, default: null })
    wordLimit?: string;

    /** Paragraph reference for MATCHING_HEADINGS, MATCHING_INFORMATION */
    @Prop({ type: String, trim: true, default: null })
    paragraphLabel?: string;

    /** Admin-only — shown after grading */
    @Prop({ type: String, trim: true, default: null })
    explanation?: string;

    /** Admin hint: "Answer found in Paragraph B" */
    @Prop({ type: String, trim: true, default: null })
    locationHint?: string;
}
export const ReadingQuestionSchema = SchemaFactory.createForClass(ReadingQuestion);

// ─── Question Group  (visual grouping for UI) ─────────────────

@Schema({ _id: false })
export class ReadingQuestionGroup {
    /** e.g. "Questions 14–17" */
    @Prop({ type: String, required: true, trim: true })
    groupLabel: string;

    @Prop({ type: String, enum: Object.values(QuestionType), required: true })
    type: QuestionType;

    @Prop({ type: String, trim: true, default: null })
    instructions?: string;

    /** Passage excerpt for completion-type questions */
    @Prop({ type: String, default: null })
    completionText?: string;

    /** Shared matching pool for the group */
    @Prop({ type: [String], default: [] })
    matchingPool: string[];

    @Prop({ type: String, trim: true, default: null })
    wordLimit?: string;

    /** Which questionNumbers belong to this group */
    @Prop({ type: [Number], required: true })
    questionNumbers: number[];
}
export const ReadingQuestionGroupSchema = SchemaFactory.createForClass(ReadingQuestionGroup);

// ─── Passage ──────────────────────────────────────────────────

@Schema({ _id: false })
export class ReadingPassage {
    @Prop({ type: Number, required: true, min: 1, max: 3 })
    passageNumber: number;

    @Prop({ type: String, required: true, trim: true, maxlength: 300 })
    title: string;

    @Prop({ type: String, required: true })
    content: string;

    @Prop({ type: Number, required: true, min: 1 })
    wordCount: number;

    /** e.g. ['A', 'B', 'C', ...] for MATCHING_HEADINGS */
    @Prop({ type: [String], default: [] })
    paragraphLabels: string[];

    /** Publication source (shown to student) */
    @Prop({ type: String, trim: true, default: null })
    source?: string;

    @Prop({ type: [ReadingQuestionGroupSchema], default: [] })
    questionGroups: ReadingQuestionGroup[];

    @Prop({ type: [ReadingQuestionSchema], required: true })
    questions: ReadingQuestion[];

    @Prop({ type: Number, required: true })
    totalQuestions: number;

    @Prop({ type: Number, required: true })
    totalPoints: number;
}
export const ReadingPassageSchema = SchemaFactory.createForClass(ReadingPassage);

// ─── Section ──────────────────────────────────────────────────

@Schema({ _id: false })
export class ReadingSection {
    @Prop({ type: Boolean, default: true })
    isEnabled: boolean;

    @Prop({ type: Number, required: true, default: 60, min: 1 })
    timeLimitMinutes: number;

    @Prop({ type: String, default: null })
    instructions?: string;

    @Prop({ type: [ReadingPassageSchema], required: true })
    passages: ReadingPassage[];

    @Prop({ type: Number, required: true })
    totalQuestions: number;

    @Prop({ type: Number, required: true })
    totalPoints: number;
}
export const ReadingSectionSchema = SchemaFactory.createForClass(ReadingSection);

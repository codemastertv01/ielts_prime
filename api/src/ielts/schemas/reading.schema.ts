import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { QuestionType } from '../dto/enums';

@Schema({ _id: false })
export class ReadingQuestion {
    @Prop({ type: Number, required: true, min: 1, max: 40 })
    questionNumber: number;

    @Prop({
        type: String,
        enum: Object.values(QuestionType),
        required: true,
    })
    type: QuestionType;

    @Prop({ type: String, required: true, trim: true })
    question: string;

    @Prop({ type: [String], default: [] })
    options: string[];

    @Prop({ type: [String], default: [] })
    matchingPool: string[];

    @Prop({ type: String, trim: true })
    correctAnswer: string;

    @Prop({ type: [String], default: [] })
    acceptableAnswers: string[];

    @Prop({ type: Number, min: 1, max: 5, default: 1 })
    points: number;

    @Prop({ type: String, trim: true })
    explanation?: string;

    @Prop({ type: String, trim: true })
    locationHint?: string;

    @Prop({ type: String, trim: true })
    wordLimit?: string;

    @Prop({ type: String, trim: true })
    paragraphLabel?: string;

    @Prop({ type: Object })
    additionalData?: Record<string, unknown>;
}

export const ReadingQuestionSchema = SchemaFactory.createForClass(ReadingQuestion);

@Schema({ _id: false })
export class ReadingQuestionGroup {
    @Prop({ type: String, required: true, trim: true })
    groupLabel: string;

    @Prop({
        type: String,
        enum: Object.values(QuestionType),
        required: true,
    })
    type: QuestionType;

    @Prop({ type: String, trim: true })
    instructions?: string;

    @Prop({ type: String })
    completionText?: string;

    @Prop({ type: [String], default: [] })
    matchingPool: string[];

    @Prop({ type: String, trim: true })
    wordLimit?: string;

    @Prop({ type: [Number], required: true })
    questionNumbers: number[];
}

export const ReadingQuestionGroupSchema = SchemaFactory.createForClass(ReadingQuestionGroup);

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

    @Prop({ type: [String], default: [] })
    paragraphLabels: string[];

    @Prop({ type: String, trim: true })
    source?: string;

    @Prop({ type: [String], default: [] })
    keywords: string[];

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

@Schema({ _id: false })
export class ReadingSection {
    @Prop({ type: Boolean, default: true })
    isEnabled: boolean;

    @Prop({ type: Number, required: true, default: 60 })
    timeLimitMinutes: number;

    @Prop({ type: [ReadingPassageSchema], required: true })
    passages: ReadingPassage[];

    @Prop({ type: Number, required: true })
    totalQuestions: number;

    @Prop({ type: Number, required: true })
    totalPoints: number;

    @Prop({ type: String })
    instructions?: string;
}

export const ReadingSectionSchema = SchemaFactory.createForClass(ReadingSection);

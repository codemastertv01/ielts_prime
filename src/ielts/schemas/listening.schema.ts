import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { QuestionType } from '../dto/enums';

@Schema({ _id: false })
export class ListeningQuestion {
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

    @Prop({ type: Number })
    timestampStart?: number;

    @Prop({ type: Number })
    timestampEnd?: number;

    @Prop({ type: String, trim: true })
    wordLimit?: string;

    @Prop({ type: String })
    diagramImageUrl?: string;

    @Prop({ type: String })
    diagramGroupId?: string;

    @Prop({ type: String })
    diagramLabel?: string;
}

export const ListeningQuestionSchema = SchemaFactory.createForClass(ListeningQuestion);


@Schema({ _id: false })
export class ListeningQuestionGroup {
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

    @Prop({ type: String })
    diagramImageUrl?: string;

    @Prop({ type: [String], default: [] })
    matchingPool: string[];

    @Prop({ type: String, trim: true })
    wordLimit?: string;

    @Prop({ type: [Number], required: true })
    questionNumbers: number[];
}

export const ListeningQuestionGroupSchema = SchemaFactory.createForClass(ListeningQuestionGroup);


@Schema({ _id: false })
export class ListeningPart {
    @Prop({ type: Number, required: true, min: 1, max: 4 })
    partNumber: number;

    @Prop({ type: String, required: true, trim: true })
    title: string;

    @Prop({ type: String, trim: true })
    context: string;

    @Prop({ type: String, required: true })
    audioUrl: string;

    @Prop({ type: Number, required: true, min: 1 })
    durationSeconds: number;

    @Prop({ type: String })
    transcript?: string;

    @Prop({ type: Boolean, default: false })
    isMonologue: boolean;

    @Prop({ type: Number, default: 2, min: 1, max: 4 })
    speakerCount: number;

    @Prop({ type: String })
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


@Schema({ _id: false })
export class ListeningSection {
    @Prop({ type: Boolean, default: true })
    isEnabled: boolean;

    @Prop({ type: Number, required: true, default: 30 })
    timeLimitMinutes: number;

    @Prop({ type: Number, default: 10 })
    transferTimeMinutes: number;

    @Prop({ type: [ListeningPartSchema], required: true })
    parts: ListeningPart[];

    @Prop({ type: Number, required: true })
    totalQuestions: number;

    @Prop({ type: Number, required: true })
    totalPoints: number;

    @Prop({ type: String })
    instructions?: string;
}

export const ListeningSectionSchema = SchemaFactory.createForClass(ListeningSection);

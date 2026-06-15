import { Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { QuestionType, WritingTaskSubtype } from '../dto/enums';

@Schema({ _id: false })
export class WritingTask {
    @Prop({ type: Number, required: true, min: 1, max: 2 })
    taskNumber: number;

    @Prop({
        type: String,
        enum: Object.values(QuestionType),
        required: true,
    })
    type: QuestionType;

    @Prop({
        type: String,
        enum: Object.values(WritingTaskSubtype),
    })
    subtype?: WritingTaskSubtype;

    @Prop({ type: String, required: true })
    prompt: string;

    @Prop({ type: String })
    imageUrl?: string;

    @Prop({ type: String })
    chartData?: string;

    @Prop({ type: String })
    secondImageUrl?: string;

    @Prop({ type: String, trim: true })
    visualCaption?: string;

    @Prop({ type: [String], default: [] })
    letterBulletPoints: string[];

    @Prop({ type: String, trim: true })
    letterSalutationHint?: string;

    @Prop({ type: [String], default: [] })
    essayDirectives: string[];

    @Prop({ type: Number, required: true, min: 50 })
    minimumWords: number;

    @Prop({ type: Number, required: true })
    suggestedTimeMinutes: number;

    @Prop({ type: Number, required: true, min: 0, max: 9, default: 9 })
    maxBandScore: number;

    @Prop({ type: [String], default: [] })
    assessmentCriteria: string[];

    @Prop({ type: String })
    sampleAnswer?: string;

    @Prop({ type: String })
    examinerNotes?: string;

    @Prop({ type: String })
    instructions?: string;
}

export const WritingTaskSchema = SchemaFactory.createForClass(WritingTask);

@Schema({ _id: false })
export class WritingSection {
    @Prop({ type: Boolean, default: true })
    isEnabled: boolean;

    @Prop({ type: Number, required: true, default: 60 })
    timeLimitMinutes: number;

    @Prop({ type: [WritingTaskSchema], required: true })
    tasks: WritingTask[];

    @Prop({ type: String })
    instructions?: string;
}

export const WritingSectionSchema = SchemaFactory.createForClass(WritingSection);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { SpeakingPartType } from '../dto/enums';

@Schema({ _id: false })
export class SpeakingQuestion {
    @Prop({ type: Number, required: true, min: 1 })
    questionNumber: number;

    @Prop({ type: String, required: true, trim: true })
    question: string;

    @Prop({ type: [String], default: [] })
    followUpQuestions: string[];

    @Prop({ type: Number })
    suggestedTimeSeconds?: number;

    @Prop({ type: String })
    sampleAnswer?: string;

    @Prop({ type: [String], default: [] })
    languageTips: string[];

    @Prop({ type: String, trim: true })
    topicCategory?: string;
}

export const SpeakingQuestionSchema = SchemaFactory.createForClass(SpeakingQuestion);

@Schema({ _id: false })
export class SpeakingPart {
    @Prop({ type: Number, required: true, min: 1, max: 3 })
    partNumber: number;

    @Prop({
        type: String,
        enum: Object.values(SpeakingPartType),
        required: true,
    })
    partType: SpeakingPartType;

    @Prop({ type: String, required: true, trim: true })
    title: string;

    @Prop({ type: String })
    instructions?: string;

    @Prop({ type: Number, required: true })
    durationMinutes: number;

    @Prop({ type: [String], default: [] })
    topicGroups: string[];

    @Prop({ type: String })
    cueCardTopic?: string;

    @Prop({ type: [String], default: [] })
    cueCardPoints: string[];

    @Prop({ type: Number, default: 60 })
    preparationTimeSeconds: number;

    @Prop({ type: Number, default: 60 })
    minimumSpeakingSeconds: number;

    @Prop({ type: Number, default: 120 })
    maximumSpeakingSeconds: number;

    @Prop({ type: [String], default: [] })
    roundingOffQuestions: string[];

    @Prop({ type: String, trim: true })
    discussionTheme?: string;

    @Prop({ type: [SpeakingQuestionSchema], required: true })
    questions: SpeakingQuestion[];
}

export const SpeakingPartSchema = SchemaFactory.createForClass(SpeakingPart);

@Schema({ _id: false })
export class SpeakingSection {
    @Prop({ type: Boolean, default: true })
    isEnabled: boolean;

    @Prop({ type: Number, required: true, default: 14 })
    timeLimitMinutes: number;

    @Prop({ type: [SpeakingPartSchema], required: true })
    parts: SpeakingPart[];

    @Prop({ type: Boolean, default: true })
    requiresRecording: boolean;

    @Prop({ type: Boolean, default: false })
    allowRetakes: boolean;

    @Prop({ type: String })
    instructions?: string;
}

export const SpeakingSectionSchema = SchemaFactory.createForClass(SpeakingSection);

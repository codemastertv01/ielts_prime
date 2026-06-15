// ielts/schemas/writing.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { QuestionType, WritingTaskSubtype } from '../../ielts/dto/enums';
// import { QuestionType, WritingTaskSubtype } from '../dto/enums';

// ─── Task ─────────────────────────────────────────────────────

@Schema({ _id: false })
export class WritingTask {
    /** 1 or 2 */
    @Prop({ type: Number, required: true, min: 1, max: 2 })
    taskNumber: number;

    @Prop({ type: String, enum: Object.values(QuestionType), required: true })
    type: QuestionType;

    @Prop({ type: String, enum: Object.values(WritingTaskSubtype), default: null })
    subtype?: WritingTaskSubtype;

    @Prop({ type: String, required: true })
    prompt: string;

    // ── Visual aids (Task 1 Academic) ─────────────────────

    /** Primary chart/graph/map image */
    @Prop({ type: String, default: null })
    imageUrl?: string;

    /** Raw chart data for dynamic rendering (JSON string) */
    @Prop({ type: String, default: null })
    chartData?: string;

    /** Second image (MIXED_CHARTS) */
    @Prop({ type: String, default: null })
    secondImageUrl?: string;

    @Prop({ type: String, trim: true, default: null })
    visualCaption?: string;

    // ── Task 1 General (Letter) ───────────────────────────

    @Prop({ type: [String], default: [] })
    letterBulletPoints: string[];

    @Prop({ type: String, trim: true, default: null })
    letterSalutationHint?: string;

    // ── Task 2 (Essay) ────────────────────────────────────

    @Prop({ type: [String], default: [] })
    essayDirectives: string[];

    // ── Constraints ───────────────────────────────────────

    /** Minimum word count (Task 1: 150, Task 2: 250) */
    @Prop({ type: Number, required: true, min: 50 })
    minimumWords: number;

    @Prop({ type: Number, required: true, min: 1 })
    suggestedTimeMinutes: number;

    @Prop({ type: Number, default: 9, min: 0, max: 9 })
    maxBandScore: number;

    /** IELTS criteria used for grading (display only) */
    @Prop({ type: [String], default: [] })
    assessmentCriteria: string[];

    /** Admin/teacher reference — never shown to student */
    @Prop({ type: String, default: null })
    sampleAnswer?: string;

    @Prop({ type: String, default: null })
    examinerNotes?: string;

    @Prop({ type: String, default: null })
    instructions?: string;
}
export const WritingTaskSchema = SchemaFactory.createForClass(WritingTask);

// ─── Section ──────────────────────────────────────────────────

@Schema({ _id: false })
export class WritingSection {
    @Prop({ type: Boolean, default: true })
    isEnabled: boolean;

    @Prop({ type: Number, required: true, default: 60, min: 1 })
    timeLimitMinutes: number;

    @Prop({ type: String, default: null })
    instructions?: string;

    @Prop({ type: [WritingTaskSchema], required: true })
    tasks: WritingTask[];
}
export const WritingSectionSchema = SchemaFactory.createForClass(WritingSection);

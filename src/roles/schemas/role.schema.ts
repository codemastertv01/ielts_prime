import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { BaseEntity } from '../../schemas/base.schema';

export type RoleDocument = Role & Document;

export enum RoleType {
    ADMIN = 'admin',
    USER = 'user',
    MODERATOR = 'moderator',
    GUEST = 'guest',
    CUSTOM = 'custom',
}

@Schema({ timestamps: true, collection: 'roles' })
export class Role extends BaseEntity {
    @Prop({
        required: true,
        unique: true,
        trim: true,
        minlength: [2, "Role nomi kamida 2 belgidan iborat bo'lishi kerak"],
        maxlength: [50, 'Role nomi 50 belgidan oshmasligi kerak'],
        match: [/^[a-zA-Z0-9_\s-]+$/, "Role nomi faqat harf, raqam, _, - va bo'sh joy bo'lishi mumkin"],
    })
    name: string;

    @Prop({
        trim: true,
        maxlength: [500, 'Description 500 belgidan oshmasligi kerak'],
        default: null,
    })
    description?: string;

    @Prop({
        type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Permission' }],
        default: [],
    })
    permissions: Types.ObjectId[];

    @Prop({
        type: Boolean,
        default: false,
        index: true,
    })
    isSystemRole: boolean;

    @Prop({
        type: String,
        enum: Object.values(RoleType),
        default: RoleType.CUSTOM,
        index: true,
    })
    type: RoleType;

    @Prop({
        type: Number,
        default: 0,
        min: [0, "Priority 0 dan kichik bo'lmasligi kerak"],
        max: [100, "Priority 100 dan katta bo'lmasligi kerak"],
        index: true,
    })
    priority: number;

    @Prop({
        type: Number,
        default: 0,
        min: 0,
    })
    userCount: number;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// ── Compound indexes ──────────────────────────────────────────
RoleSchema.index({ name: 1, isDeleted: 1 }, { unique: false });
RoleSchema.index({ isSystemRole: 1, isDeleted: 1 });
RoleSchema.index({ type: 1, isDeleted: 1 });
RoleSchema.index({ status: 1, isDeleted: 1 });
RoleSchema.index({ priority: -1, isDeleted: 1 });
RoleSchema.index({ userCount: 1 });
RoleSchema.index({ scheduledDeletionAt: 1 }, { sparse: true });
RoleSchema.index({ activationScheduledAt: 1 }, { sparse: true });
RoleSchema.index({ archiveScheduledAt: 1 }, { sparse: true });

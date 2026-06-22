import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import type { MetadataInfo } from '../../dto/metadata-info.dto';
import { BaseEntity } from '../../schemas/base.schema';
import { BlockInfo, BlockInfoSchema } from '../../schemas/block-info.schema';

export type UserDocument = User & Document;

// ─── Sub-schemas ───────────────────────────────────────────────────────────────

export interface LoginSession {
    sessionId: string;
    ipAddress: string;
    userAgent: string;
    device: string;
    browser: string;
    os: string;
    location?: string;
    loginAt: Date;
    logoutAt?: Date;
    isActive: boolean;
}

export interface SensitiveFieldChange {
    field: 'username' | 'email' | 'phone' | 'password';
    changedAt: Date;
    changedBy: MetadataInfo;
    nextAllowedChangeAt: Date; // changedAt + 14 days
}

// ─── Schema ────────────────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'users' })
export class User extends BaseEntity {
    // ── Identity ──────────────────────────────────────────
    @Prop({
        required: true,
        unique: true,
        trim: true,
        minlength: [3, "Username kamida 3 belgidan iborat bo'lishi kerak"],
        maxlength: [30, 'Username 30 belgidan oshmasligi kerak'],
        match: [/^[a-zA-Z0-9_-]+$/, "Username faqat harf, raqam, _ va - bo'lishi mumkin"],
    })
    username: string;

    @Prop({
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Email formati noto'g'ri"],
    })
    email: string;

    @Prop({ type: String, select: false, default: null })
    password?: string;

    // ── Profile ───────────────────────────────────────────
    @Prop({
        required: true,
        trim: true,
        maxlength: [50, 'FirstName 50 belgidan oshmasligi kerak'],
    })
    firstName: string;

    @Prop({
        required: true,
        trim: true,
        maxlength: [50, 'LastName 50 belgidan oshmasligi kerak'],
    })
    lastName: string;

    @Prop({
        trim: true,
        match: [/^\+?[1-9]\d{1,14}$/, "Telefon raqami noto'g'ri formatda"],
        default: null,
    })
    phone?: string;

    @Prop({
        trim: true,
        maxlength: [500, 'Bio 500 belgidan oshmasligi kerak'],
        default: null,
    })
    bio?: string;

    @Prop({
        default: 'https://ui-avatars.com/api/?name=User&size=200',
        validate: {
            validator: (v: string) => /^https?:\/\/.+/.test(v),
            message: "Avatar URL formati noto'g'ri",
        },
    })
    avatarUrl: string;

    // ── Roles ─────────────────────────────────────────────
    @Prop({
        type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Role' }],
        default: [],
    })
    roles: Types.ObjectId[];

    // ── Email verification ────────────────────────────────
    @Prop({ default: false })
    isEmailVerified: boolean;

    @Prop({ type: Date, default: null })
    emailVerifiedAt?: Date;

    @Prop({ type: String, select: false, default: null })
    verificationCode?: string | null;

    @Prop({ type: Date, select: false, default: null })
    verificationExpiresAt?: Date | null;

    // ── Password reset ────────────────────────────────────
    @Prop({ type: String, select: false, default: null })
    resetToken?: string | null;

    @Prop({ type: Date, select: false, default: null })
    resetTokenExpiresAt?: Date | null;

    // ── Blocking ──────────────────────────────────────────
    @Prop({ type: BlockInfoSchema, default: () => ({ isBlocked: false }) })
    blockInfo: BlockInfo;

    // ── Login tracking ────────────────────────────────────
    @Prop({ type: Date, default: null })
    lastLoginAt?: Date;

    @Prop({ type: Object, default: null })
    lastLoginInfo?: MetadataInfo;

    @Prop({ type: [Object], default: [] })
    loginHistory: MetadataInfo[];

    /** Active & past login sessions with device/browser/OS info */
    @Prop({
        type: [
            {
                sessionId: { type: String, required: true },
                ipAddress: { type: String, default: '0.0.0.0' },
                userAgent: { type: String, default: '' },
                device: { type: String, default: 'unknown' },
                browser: { type: String, default: 'unknown' },
                os: { type: String, default: 'unknown' },
                location: { type: String, default: null },
                loginAt: { type: Date, required: true },
                logoutAt: { type: Date, default: null },
                isActive: { type: Boolean, default: true },
            },
        ],
        default: [],
        select: false,
    })
    loginSessions: LoginSession[];

    /** First time this user ever authenticated */
    @Prop({ type: Date, default: null })
    firstLoginAt?: Date;

    // ── Sensitive field change cooldowns ──────────────────
    /**
     * Tracks when username/email/phone/password were last changed.
     * Each field can only be changed once every 14 days.
     */
    @Prop({
        type: [
            {
                field: {
                    type: String,
                    enum: ['username', 'email', 'phone', 'password'],
                    required: true,
                },
                changedAt: { type: Date, required: true },
                changedBy: { type: Object, required: true },
                nextAllowedChangeAt: { type: Date, required: true },
            },
        ],
        default: [],
        select: false,
    })
    sensitiveFieldChanges: SensitiveFieldChange[];

    // ── Instance method (declared for TypeScript) ─────────
    comparePassword: (candidatePassword: string) => Promise<boolean>;
}

export const UserSchema = SchemaFactory.createForClass(User);

// ── Instance methods ──────────────────────────────────────────────────────────

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch {
        return false;
    }
};

// ── toJSON transform: strip sensitive fields ──────────────────────────────────

UserSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: any) => {
        delete ret.password;
        delete ret.verificationCode;
        delete ret.verificationExpiresAt;
        delete ret.resetToken;
        delete ret.resetTokenExpiresAt;
        delete ret.sensitiveFieldChanges;
        delete ret.loginSessions;
        return ret;
    },
});

UserSchema.set('toObject', { virtuals: true });

// ── Indexes ───────────────────────────────────────────────────────────────────

UserSchema.index({ email: 1, isDeleted: 1 });
UserSchema.index({ username: 1, isDeleted: 1 });
UserSchema.index({ phone: 1 }, { sparse: true });
UserSchema.index({ roles: 1 });
UserSchema.index({ isEmailVerified: 1 });
UserSchema.index({ 'blockInfo.isBlocked': 1 });
UserSchema.index({ 'blockInfo.blockedUntil': 1 }, { sparse: true });
UserSchema.index({ lastLoginAt: -1 });
UserSchema.index({ firstLoginAt: 1 }, { sparse: true });
UserSchema.index({ status: 1, isDeleted: 1 });
UserSchema.index({ isEmailVerified: 1, status: 1 });
UserSchema.index({ 'blockInfo.isBlocked': 1, status: 1 });
UserSchema.index({ 'loginSessions.isActive': 1 }, { sparse: true });
UserSchema.index({ scheduledDeletionAt: 1 }, { sparse: true });

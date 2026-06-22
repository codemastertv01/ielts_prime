import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseEntity } from '../../schemas/base.schema';
import { PERMISSION_ACTIONS } from '../../dto/permission-operation.dto';

export type PermissionDocument = Permission & Document;

export enum PermissionCategory {
    SYSTEM = 'system',
    USER = 'user',
    ROLE = 'role',
    CUSTOM = 'custom',
}

export enum PermissionScope {
    API = 'api',
    FRONTEND = 'frontend',
    BOTH = 'both',
}

export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
}

@Schema({ timestamps: true })
export class Permission extends BaseEntity {
    @Prop({
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [3, "Permission nomi kamida 3 belgidan iborat bo'lishi kerak"],
        maxlength: [100, 'Permission nomi 100 belgidan oshmasligi kerak'],
        match: [/^[a-z0-9:_.*-]+$/, "Permission nomi faqat kichik harf, raqam, :, _, -, . va * bo'lishi mumkin"],
    })
    name: string;

    @Prop({
        required: true,
        trim: true,
        lowercase: true,
        minlength: [2, "Resource nomi kamida 2 belgidan iborat bo'lishi kerak"],
        maxlength: [50, 'Resource nomi 50 belgidan oshmasligi kerak'],
        match: [/^[a-z0-9_*-]+$/, "Resource nomi faqat kichik harf, raqam, _, - va * bo'lishi mumkin"],
    })
    resource: string;

    @Prop({
        required: true,
        trim: true,
        enum: {
            values: PERMISSION_ACTIONS,
            message: `Action quyidagilardan biri bo'lishi kerak: ${PERMISSION_ACTIONS.join(', ')}`,
        },
    })
    action: string;

    @Prop({
        trim: true,
        maxlength: [500, 'Description 500 belgidan oshmasligi kerak'],
        default: null,
    })
    description?: string;

    @Prop({
        type: String,
        enum: Object.values(PermissionCategory),
        default: PermissionCategory.CUSTOM,
        index: true,
    })
    category: PermissionCategory;

    @Prop({
        type: Boolean,
        default: false,
        index: true,
    })
    isSystemPermission: boolean;

    // ── Scope ─────────────────────────────────────────────
    @Prop({
        type: String,
        enum: Object.values(PermissionScope),
        default: PermissionScope.BOTH,
        index: true,
    })
    scope: PermissionScope;

    // ── API path ──────────────────────────────────────────
    @Prop({
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 150,
        match: [/^(\*|\/api\/[a-z0-9/_:*-]*)$/, "API path noto'g'ri formatda. Namuna: /api/v1/admin/users yoki /api/v1/admin/* yoki *"],
        default: null,
        index: true,
    })
    apiPath?: string;

    @Prop({
        type: String,
        enum: Object.values(HttpMethod),
        default: HttpMethod.GET,
        index: true,
    })
    method: HttpMethod;

    // ── Frontend path ─────────────────────────────────────
    @Prop({
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 150,
        match: [/^\/[a-z0-9/_-]*$/, "Frontend path noto'g'ri formatda"],
        default: null,
        index: true,
    })
    frontendPath?: string;

    @Prop({
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 100,
        match: [/^[a-z0-9:_-]+$/, "uiKey noto'g'ri formatda"],
        default: null,
        index: true,
    })
    uiKey?: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

// ── Compound indexes ──────────────────────────────────────
PermissionSchema.index({ name: 1, isDeleted: 1 });
PermissionSchema.index({ resource: 1, action: 1 }, { unique: true, sparse: false });
PermissionSchema.index({ resource: 1, isDeleted: 1, status: 1 });
PermissionSchema.index({ status: 1, isDeleted: 1 });
PermissionSchema.index({ isSystemPermission: 1, isDeleted: 1 });
PermissionSchema.index({ category: 1, isDeleted: 1 });
PermissionSchema.index({ scope: 1, isDeleted: 1 });
PermissionSchema.index({ scheduledDeletionAt: 1 }, { sparse: true });

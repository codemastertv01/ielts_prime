import type { Role } from '@/types/role';
import { EntityStatus } from './entity.status';

export interface MetadataInfo {
    userId: string;
    username: string;
    email: string;
    ipAddress?: string;
    userAgent?: string;
    device?: string;
    browser?: string;
    os?: string;
    country?: string;
    location?: string;
    timestamp: string;
}

export interface FieldChange {
    field: string;
    oldValue: unknown;
    newValue: unknown;
    changedAt: string;
    changedBy: MetadataInfo;
}

export interface StatusChange {
    fromStatus: EntityStatus;
    toStatus: EntityStatus;
    changedAt: string;
    changedBy: MetadataInfo;
    reason?: string | null;
    isAutomatic: boolean;
}

export interface AuditEntry {
    action: string;
    performedBy: MetadataInfo;
    changes?: FieldChange[];
    timestamp: string;
}

export interface StatusSchedule {
    scheduledStatus: EntityStatus;
    scheduledAt: string;
    setBy: MetadataInfo;
    reason?: string;
}

export interface BlockInfo {
    isBlocked: boolean;
    blockedUntil?: string | null;
    blockReason?: string | null;
    blockedBy?: MetadataInfo | null;
    blockedAt?: string | null;
}

export interface LoginSession {
    sessionId: string;
    ipAddress: string;
    userAgent: string;
    device: string;
    browser: string;
    os: string;
    location?: string | null;
    loginAt: string;
    logoutAt?: string | null;
    isActive: boolean;
}

export interface SensitiveFieldCooldown {
    lastChangedAt: string | null;
    nextAllowedAt: string | null;
    canChange: boolean;
}

export interface User {
    _id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    bio?: string | null;
    avatarUrl: string;
    roles: Role[] | string[];
    isEmailVerified: boolean;
    emailVerifiedAt?: string | null;
    blockInfo: BlockInfo;
    lastLoginAt?: string | null;
    lastLoginInfo?: MetadataInfo | null;
    firstLoginAt?: string | null;
    loginHistory?: MetadataInfo[];
    status: EntityStatus;
    isDeleted: boolean;
    deletedAt?: string;
    scheduledDeletionAt?: string;
    restoredAt?: string;
    inactivatedAt?: string;
    inactivatedBy?: MetadataInfo;
    inactiveReason?: string;
    activatedAt?: string;
    activationScheduledAt?: string;
    archiveScheduledAt?: string;
    statusSchedules?: StatusSchedule[];
    createdAt: string;
    updatedAt: string;
    createdBy: MetadataInfo;
    updatedBy?: MetadataInfo[];
    deletedBy?: MetadataInfo[];
    restoredBy?: MetadataInfo[];
    auditLog: AuditEntry[];
    statusHistory: StatusChange[];
    updateHistory: FieldChange[];
}

// ─── DTOs ─────────────────────────────────────────────────────

export interface CreateUserDto {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    bio?: string;
    avatarUrl?: string;
    roles?: string[];
}

export interface UpdateUserDto {
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatarUrl?: string;
    roles?: string[];
    isEmailVerified?: boolean;
}

export interface ChangeUsernameDto {
    newUsername: string;
    currentPassword: string;
}

export interface ChangeEmailDto {
    newEmail: string;
    currentPassword: string;
}

export interface ChangePhoneDto {
    newPhone: string;
    currentPassword: string;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface AdminResetPasswordDto {
    newPassword: string;
    reason?: string;
}

export interface BlockUserDto {
    isBlocked?: boolean;
    blockedUntil?: string;
    blockReason?: string;
}

export interface ChangeStatusDto {
    status: EntityStatus;
    reason?: string;
}

export interface ScheduleStatusDto {
    status: EntityStatus;
    scheduledAt: string;
    reason?: string;
}

export interface BulkDeleteUsersDto {
    ids: string[];
    reason?: string;
}

export interface BulkUpdateItem extends UpdateUserDto {
    id: string;
}

export interface GetUsersQuery {
    page?: number;
    limit?: number | 'all';
    search?: string;
    status?: EntityStatus | '';
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    roleId?: string;
    roleName?: string;
    isEmailVerified?: boolean | '';
    isBlocked?: boolean | '';
    includeDeleted?: boolean;
    createdFrom?: string;
    createdTo?: string;
    updatedFrom?: string;
    updatedTo?: string;
    lastLoginFrom?: string;
    lastLoginTo?: string;
    firstLoginFrom?: string;
    firstLoginTo?: string;
    sortBy?: 'username' | 'email' | 'firstName' | 'lastName' | 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'firstLoginAt' | 'status';
    sortOrder?: 'asc' | 'desc';
}

// ─── Response types ───────────────────────────────────────────

export interface UserListResponse {
    success: boolean;
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface UserStats {
    total: number;
    byStatus: Record<string, number>;
    emailVerified: number;
    blocked: number;
    deletedCount: number;
}

export interface BulkDeleteResult {
    deletedCount: number;
    notFoundIds: string[];
    invalidIds: string[];
    alreadyDeletedIds: string[];
}

export interface BulkCreateResult {
    createdCount: number;
    created: User[];
    errors: Array<{ index: number; username: string; error: string }>;
}

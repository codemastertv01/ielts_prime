import { EntityStatus } from './entity.status';
import type { Permission } from './permission';

export enum RoleType {
    ADMIN = 'admin',
    USER = 'user',
    MODERATOR = 'moderator',
    GUEST = 'guest',
    CUSTOM = 'custom',
}

export interface MetadataInfo {
    userId: string;
    username: string;
    email: string;
    ipAddress: string;
    userAgent: string;
    device: string;
    browser: string;
    os: string;
    country?: string;
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
    action: 'create' | 'update' | 'delete' | 'restore' | 'status_change' | 'soft_delete' | 'soft_delete_bulk' | 'assign_permissions' | 'remove_permissions' | 'schedule_status_active' | 'schedule_status_archive' | 'schedule_status_deleted';
    performedBy: MetadataInfo;
    changes?: FieldChange[];
    timestamp: string;
}

export interface StatusSchedule {
    scheduledStatus: EntityStatus;
    scheduledAt: string;
    setBy: MetadataInfo;
}

export interface Role {
    _id: string;
    name: string;
    description?: string;
    permissions: Permission[] | string[];
    isSystemRole: boolean;
    type: RoleType;
    priority: number;
    userCount: number;
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

export interface CreateRoleDto {
    name: string;
    description?: string;
    permissions?: string[];
    isSystemRole?: boolean;
    type?: RoleType;
    priority?: number;
}

export interface UpdateRoleDto {
    name?: string;
    description?: string;
    permissions?: string[];
    isSystemRole?: boolean;
    type?: RoleType;
    priority?: number;
}

export interface ChangeStatusDto {
    status: EntityStatus;
    reason?: string;
}

export interface ScheduleStatusDto {
    status: EntityStatus;
    scheduledAt: string;
}

export interface AssignPermissionsDto {
    permissionIds: string[];
}

export interface RemovePermissionsDto {
    permissionIds: string[];
}

export interface BulkDeleteDto {
    ids: string[];
    reason?: string;
}

export interface BulkUpdateItem extends UpdateRoleDto {
    id: string;
}

export interface GetRolesQuery {
    page?: number;
    limit?: number | 'all';
    search?: string;
    status?: EntityStatus | '';
    type?: RoleType | '';
    isSystemRole?: boolean | '';
    minPriority?: number | '';
    maxPriority?: number | '';
    minUsers?: number | '';
    maxUsers?: number | '';
    permissionId?: string;
    permissionName?: string;
    createdFrom?: string;
    createdTo?: string;
    updatedFrom?: string;
    updatedTo?: string;
    sortBy?: 'name' | 'priority' | 'userCount' | 'createdAt' | 'updatedAt' | 'type' | 'status';
    sortOrder?: 'asc' | 'desc';
    populate?: boolean;
    includeDeleted?: boolean;
}

// ─── Response types ───────────────────────────────────────────

export interface RoleListResponse {
    success: boolean;
    data: Role[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface RoleStats {
    total: number;
    byStatus: Record<string, number>;
    systemRoles: number;
    customRoles: number;
    totalUsersAssigned: number;
}

export interface BulkDeleteResult {
    deletedCount: number;
    notFoundIds: string[];
    invalidIds: string[];
    systemRoleIds: string[];
    rolesWithUsers: string[];
    alreadyDeletedIds: string[];
}

export interface BulkCreateResult {
    createdCount: number;
    created: Role[];
    errors: Array<{ index: number; name: string; error: string }>;
}

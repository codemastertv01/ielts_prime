import { EntityStatus } from "./entity.status";

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

export enum PermissionAction {
    READ = 'READ',
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    MANAGE = 'MANAGE',
    APPROVE = 'APPROVE',
    EXPORT = 'EXPORT',
    IMPORT = 'IMPORT',
    PUBLISH = 'PUBLISH',
    RESTORE = 'RESTORE',
    WILDCARD = '*',
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
    reason: string | null;
    isAutomatic: boolean;
}

export interface AuditEntry {
    action: 'create' | 'update' | 'delete' | 'restore' | 'status_change';
    performedBy: MetadataInfo;
    changes?: FieldChange[];
    timestamp: string;
}

export interface Permission {
    _id: string;
    name: string;
    resource: string;
    action: string;
    description?: string;
    category: PermissionCategory;
    isSystemPermission: boolean;
    scope: PermissionScope;
    apiPath?: string;
    method: HttpMethod;
    frontendPath?: string;
    uiKey?: string;
    status: EntityStatus;
    isDeleted: boolean;
    deletedAt?: string;
    scheduledDeletionAt?: string;
    restoredAt?: string;
    inactivatedAt?: string;
    inactivatedBy?: MetadataInfo;
    inactiveReason?: string;
    createdAt: string;
    updatedAt: string;
    createdBy: MetadataInfo;
    updatedBy?: MetadataInfo;
    deletedBy?: MetadataInfo[];
    restoredBy?: MetadataInfo[];
    auditLog: AuditEntry[];
    statusHistory: StatusChange[];
    updateHistory: FieldChange[];
}

export interface CreatePermissionDto {
    name: string;
    resource: string;
    action: string;
    description?: string;
    category?: PermissionCategory;
    isSystemPermission?: boolean;
    scope?: PermissionScope;
    apiPath?: string;
    method?: HttpMethod;
    frontendPath?: string;
    uiKey?: string;
}

export interface UpdatePermissionDto {
    name?: string;
    resource?: string;
    action?: string;
    description?: string;
    category?: PermissionCategory;
    isSystemPermission?: boolean;
    scope?: PermissionScope;
    apiPath?: string;
    method?: HttpMethod;
    frontendPath?: string;
    uiKey?: string;
}

export interface ChangeStatusDto {
    status: EntityStatus;
    reason?: string;
}

export interface BulkDeleteDto {
    ids: string[];
    reason?: string;
}

export interface BulkUpdateItem extends UpdatePermissionDto {
    id: string;
}

export interface GetPermissionsQuery {
    page?: number;
    limit?: number | 'all';
    search?: string;
    status?: EntityStatus | '';
    category?: PermissionCategory | '';
    scope?: PermissionScope | '';
    resource?: string;
    action?: string;
    method?: HttpMethod | '';
    isSystemPermission?: boolean | '';
    apiPath?: string;
    frontendPath?: string;
    uiKey?: string;
    createdFrom?: string;
    createdTo?: string;
    updatedFrom?: string;
    updatedTo?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    includeDeleted?: boolean;
}

export interface PermissionListResponse {
    success: boolean;
    data: Permission[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PermissionStats {
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byResource: Record<string, number>;
    systemPermissions: number;
    customPermissions: number;
}

export interface BulkDeleteResult {
    deletedCount: number;
    notFoundIds: string[];
    invalidIds: string[];
    systemPermissionIds: string[];
    alreadyDeletedIds: string[];
}

export interface BulkCreateResult {
    createdCount: number;
    created: Permission[];
    errors: Array<{ index: number; name: string; error: string }>;
}

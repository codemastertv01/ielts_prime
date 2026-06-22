import { ChangeStatusDto } from '../types/permission';
import { AssignPermissionsDto, BulkDeleteDto, BulkUpdateItem, CreateRoleDto, GetRolesQuery, RemovePermissionsDto, ScheduleStatusDto, UpdateRoleDto } from '../types/role';
import apiClient, { cleanParams, unwrap } from './apiClient';

export const roleAPI = {
    getAll: (q?: GetRolesQuery) => unwrap(apiClient.get('/roles', { params: cleanParams(q as Record<string, unknown> | undefined) })),

    getById: (id: string, populate = true) => unwrap(apiClient.get(`/roles/${id}`, { params: { populate } })),

    getByName: (name: string, populate = false) => unwrap(apiClient.get(`/roles/name/${name}`, { params: { populate } })),

    getStats: () => unwrap(apiClient.get('/roles/statistics')),

    getAuditLog: (id: string) => unwrap(apiClient.get(`/roles/${id}/audit-log`)),

    getStatusHistory: (id: string) => unwrap(apiClient.get(`/roles/${id}/status-history`)),

    getUpdateHistory: (id: string) => unwrap(apiClient.get(`/roles/${id}/update-history`)),

    create: (dto: CreateRoleDto) => unwrap(apiClient.post('/roles', dto)),

    createMany: (dtos: CreateRoleDto[]) => unwrap(apiClient.post('/roles/bulk', dtos)),

    update: (id: string, dto: UpdateRoleDto) => unwrap(apiClient.patch(`/roles/${id}`, dto)),

    bulkUpdate: (items: BulkUpdateItem[]) => Promise.all(items.map(({ id, ...dto }) => unwrap(apiClient.patch(`/roles/${id}`, dto)))),

    changeStatus: (id: string, dto: ChangeStatusDto) => unwrap(apiClient.patch(`/roles/${id}/status`, dto)),

    scheduleStatus: (id: string, dto: ScheduleStatusDto) => unwrap(apiClient.post(`/roles/${id}/schedule-status`, dto)),

    assignPermissions: (id: string, dto: AssignPermissionsDto) => unwrap(apiClient.post(`/roles/${id}/assign-permissions`, dto)),

    removePermissions: (id: string, dto: RemovePermissionsDto) => unwrap(apiClient.post(`/roles/${id}/remove-permissions`, dto)),

    softDelete: (id: string, reason?: string) => unwrap(apiClient.delete(`/roles/${id}`, { data: { reason } })),

    bulkDelete: (dto: BulkDeleteDto) => unwrap(apiClient.delete('/roles/bulk', { data: dto })),

    restore: (id: string) => unwrap(apiClient.patch(`/roles/${id}/restore`, {})),

    hardDelete: (id: string) => unwrap(apiClient.delete(`/roles/${id}/permanent`)),
};

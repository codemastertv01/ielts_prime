import { BulkDeleteDto, BulkUpdateItem, ChangeStatusDto, CreatePermissionDto, GetPermissionsQuery, UpdatePermissionDto } from '../types/permission';
import apiClient, { cleanParams, unwrap } from './apiClient';

export const permissionAPI = {
    getAll: (q?: GetPermissionsQuery) => unwrap(apiClient.get('/permissions', { params: cleanParams(q as Record<string, unknown> | undefined) })),

    getById: (id: string) => unwrap(apiClient.get(`/permissions/${id}`)),

    getByResource: (resource: string) => unwrap(apiClient.get(`/permissions/resource/${resource}`)),

    getStats: () => unwrap(apiClient.get('/permissions/statistics')),

    create: (dto: CreatePermissionDto) => unwrap(apiClient.post('/permissions', dto)),

    createMany: (dtos: CreatePermissionDto[]) => unwrap(apiClient.post('/permissions/bulk', dtos)),

    update: (id: string, dto: UpdatePermissionDto) => unwrap(apiClient.patch(`/permissions/${id}`, dto)),

    bulkUpdate: (items: BulkUpdateItem[]) => Promise.all(items.map(({ id, ...dto }) => unwrap(apiClient.patch(`/permissions/${id}`, dto)))),

    changeStatus: (id: string, dto: ChangeStatusDto) => unwrap(apiClient.patch(`/permissions/${id}/status`, dto)),

    softDelete: (id: string) => unwrap(apiClient.delete(`/permissions/${id}`)),

    bulkDelete: (dto: BulkDeleteDto) => unwrap(apiClient.delete('/permissions/bulk-delete', { data: dto })),

    restore: (id: string) => unwrap(apiClient.patch(`/permissions/${id}/restore`, {})),

    hardDelete: (id: string) => unwrap(apiClient.delete(`/permissions/${id}/permanent`)),
};

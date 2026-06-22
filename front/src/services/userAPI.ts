import { AdminResetPasswordDto, BlockUserDto, BulkDeleteUsersDto, BulkUpdateItem, ChangeEmailDto, ChangePasswordDto, ChangePhoneDto, ChangeStatusDto, ChangeUsernameDto, CreateUserDto, GetUsersQuery, ScheduleStatusDto, UpdateUserDto } from '../types/user';
import apiClient, { cleanParams, unwrap } from './apiClient';

export const userAPI = {
    getAll: (q?: GetUsersQuery) => unwrap(apiClient.get('/users', { params: cleanParams(q as Record<string, unknown> | undefined) })),

    getById: (id: string) => unwrap(apiClient.get(`/users/${id}`)),

    getStats: () => unwrap(apiClient.get('/users/statistics')),

    getAuditLog: (id: string) => unwrap(apiClient.get(`/users/${id}/audit-log`)),

    getStatusHistory: (id: string) => unwrap(apiClient.get(`/users/${id}/status-history`)),

    getUpdateHistory: (id: string) => unwrap(apiClient.get(`/users/${id}/update-history`)),

    getLoginHistory: (id: string) => unwrap(apiClient.get(`/users/${id}/login-history`)),

    getActiveSessions: (id: string) => unwrap(apiClient.get(`/users/${id}/sessions`)),

    getSensitiveCooldowns: (id: string) => unwrap(apiClient.get(`/users/${id}/sensitive-cooldowns`)),

    create: (dto: CreateUserDto) => unwrap(apiClient.post('/users', dto)),

    createMany: (dtos: CreateUserDto[]) => unwrap(apiClient.post('/users/bulk', dtos)),

    update: (id: string, dto: UpdateUserDto) => unwrap(apiClient.patch(`/users/${id}`, dto)),

    bulkUpdate: (items: BulkUpdateItem[]) => Promise.all(items.map(({ id, ...dto }) => unwrap(apiClient.patch(`/users/${id}`, dto)))),

    changeStatus: (id: string, dto: ChangeStatusDto) => unwrap(apiClient.patch(`/users/${id}/status`, dto)),

    scheduleStatus: (id: string, dto: ScheduleStatusDto) => unwrap(apiClient.post(`/users/${id}/schedule-status`, dto)),

    block: (id: string, dto: BlockUserDto) => unwrap(apiClient.patch(`/users/${id}/block`, dto)),

    restore: (id: string) => unwrap(apiClient.patch(`/users/${id}/restore`, {})),

    changeUsername: (id: string, dto: ChangeUsernameDto) => unwrap(apiClient.patch(`/users/${id}/change-username`, dto)),

    changeEmail: (id: string, dto: ChangeEmailDto) => unwrap(apiClient.patch(`/users/${id}/change-email`, dto)),

    changePhone: (id: string, dto: ChangePhoneDto) => unwrap(apiClient.patch(`/users/${id}/change-phone`, dto)),

    changePassword: (id: string, dto: ChangePasswordDto) => unwrap(apiClient.patch(`/users/${id}/change-password`, dto)),

    adminResetPassword: (id: string, dto: AdminResetPasswordDto) => unwrap(apiClient.patch(`/users/${id}/admin-reset-password`, dto)),

    revokeSession: (id: string, sessionId: string) => unwrap(apiClient.delete(`/users/${id}/sessions/${sessionId}`)),

    revokeAllSessions: (id: string) => unwrap(apiClient.delete(`/users/${id}/sessions`)),

    softDelete: (id: string, reason?: string) => unwrap(apiClient.delete(`/users/${id}`, { data: { reason } })),

    bulkDelete: (dto: BulkDeleteUsersDto) => unwrap(apiClient.delete('/users/bulk', { data: dto })),

    hardDelete: (id: string) => unwrap(apiClient.delete(`/users/${id}/permanent`)),
};

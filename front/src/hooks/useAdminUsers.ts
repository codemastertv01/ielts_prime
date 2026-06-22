'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../services/userAPI';
import { showToast } from '../services/toastService';
import type { AdminResetPasswordDto, BlockUserDto, BulkDeleteUsersDto, BulkUpdateItem, ChangeEmailDto, ChangePasswordDto, ChangePhoneDto, ChangeStatusDto, ChangeUsernameDto, CreateUserDto, GetUsersQuery, ScheduleStatusDto, UpdateUserDto, User, UserListResponse } from '../types/user';

export const USER_KEYS = {
    all: ['users'] as const,
    list: (q?: GetUsersQuery) => ['users', 'list', q] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    stats: () => ['users', 'stats'] as const,
    audit: (id: string) => ['users', 'audit', id] as const,
    statusHistory: (id: string) => ['users', 'statusHistory', id] as const,
    updateHistory: (id: string) => ['users', 'updateHistory', id] as const,
    loginHistory: (id: string) => ['users', 'loginHistory', id] as const,
    sessions: (id: string) => ['users', 'sessions', id] as const,
    cooldowns: (id: string) => ['users', 'cooldowns', id] as const,
};

function getErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
        const maybe = error as { response?: { data?: { message?: unknown } }; message?: unknown };
        const message = maybe.response?.data?.message ?? maybe.message;
        if (Array.isArray(message)) return message.join(', ');
        if (typeof message === 'string') return message;
    }
    return 'User amali bajarilmadi';
}

const notifyError = (error: unknown) => showToast.error(getErrorMessage(error));

/* ─────────────────────────────────────────────
   List hook
───────────────────────────────────────────── */
export function useUsers(query?: GetUsersQuery) {
    const qc = useQueryClient();

    const listQuery = useQuery<UserListResponse>({
        queryKey: USER_KEYS.list(query),
        queryFn: () => userAPI.getAll(query),
        staleTime: 30_000,
        placeholderData: (prev) => prev,
    });

    const createMut = useMutation({
        mutationFn: (dto: CreateUserDto) => userAPI.create(dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: USER_KEYS.all }),
        onError: notifyError,
    });

    const createManyMut = useMutation({
        mutationFn: (dtos: CreateUserDto[]) => userAPI.createMany(dtos),
        onSuccess: () => qc.invalidateQueries({ queryKey: USER_KEYS.all }),
        onError: notifyError,
    });

    const bulkUpdateMut = useMutation({
        mutationFn: (items: BulkUpdateItem[]) => userAPI.bulkUpdate(items),
        onSuccess: () => qc.invalidateQueries({ queryKey: USER_KEYS.all }),
        onError: notifyError,
    });

    const softDeleteMut = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) => userAPI.softDelete(id, reason),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: USER_KEYS.all });
            qc.invalidateQueries({ queryKey: USER_KEYS.stats() });
        },
        onError: notifyError,
    });

    const bulkDeleteMut = useMutation({
        mutationFn: (dto: BulkDeleteUsersDto) => userAPI.bulkDelete(dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: USER_KEYS.all });
            qc.invalidateQueries({ queryKey: USER_KEYS.stats() });
        },
        onError: notifyError,
    });

    const restoreMut = useMutation({
        mutationFn: (id: string) => userAPI.restore(id),
        onSuccess: (res) => {
            qc.setQueryData(USER_KEYS.detail(res._id), res);
            qc.invalidateQueries({ queryKey: USER_KEYS.all });
        },
        onError: notifyError,
    });

    return {
        users: listQuery.data?.data ?? [],
        total: listQuery.data?.total ?? 0,
        totalPages: listQuery.data?.totalPages ?? 1,
        page: listQuery.data?.page ?? 1,
        isLoading: listQuery.isLoading,
        isFetching: listQuery.isFetching,
        refetch: listQuery.refetch,

        create: createMut.mutate,
        createAsync: createMut.mutateAsync,
        isCreating: createMut.isPending,

        createMany: createManyMut.mutate,
        createManyAsync: createManyMut.mutateAsync,
        isCreatingMany: createManyMut.isPending,

        bulkUpdate: bulkUpdateMut.mutate,
        bulkUpdateAsync: bulkUpdateMut.mutateAsync,
        isBulkUpdating: bulkUpdateMut.isPending,

        softDelete: softDeleteMut.mutate,
        softDeleteAsync: softDeleteMut.mutateAsync,
        isDeleting: softDeleteMut.isPending,

        bulkDelete: bulkDeleteMut.mutate,
        bulkDeleteAsync: bulkDeleteMut.mutateAsync,
        isBulkDeleting: bulkDeleteMut.isPending,

        restore: restoreMut.mutate,
        restoreAsync: restoreMut.mutateAsync,
        isRestoring: restoreMut.isPending,
    };
}

/* ─────────────────────────────────────────────
   Single user hook
───────────────────────────────────────────── */
export function useUser(id: string) {
    const qc = useQueryClient();

    const q = useQuery<User>({
        queryKey: USER_KEYS.detail(id),
        queryFn: () => userAPI.getById(id),
        enabled: !!id,
        staleTime: 30_000,
    });

    const updateMut = useMutation({
        mutationFn: (dto: UpdateUserDto) => userAPI.update(id, dto),
        onSuccess: (res) => {
            qc.setQueryData(USER_KEYS.detail(id), res);
            qc.invalidateQueries({ queryKey: USER_KEYS.all });
        },
        onError: notifyError,
    });

    const changeStatusMut = useMutation({
        mutationFn: (dto: ChangeStatusDto) => userAPI.changeStatus(id, dto),
        onSuccess: (res) => {
            qc.setQueryData(USER_KEYS.detail(id), res);
            qc.invalidateQueries({ queryKey: USER_KEYS.all });
        },
        onError: notifyError,
    });

    const scheduleStatusMut = useMutation({
        mutationFn: (dto: ScheduleStatusDto) => userAPI.scheduleStatus(id, dto),
        onSuccess: (res) => {
            qc.setQueryData(USER_KEYS.detail(id), res);
        },
        onError: notifyError,
    });

    const blockMut = useMutation({
        mutationFn: (dto: BlockUserDto) => userAPI.block(id, dto),
        onSuccess: (res) => {
            qc.setQueryData(USER_KEYS.detail(id), res);
            qc.invalidateQueries({ queryKey: USER_KEYS.all });
        },
        onError: notifyError,
    });

    const changeUsernameMut = useMutation({
        mutationFn: (dto: ChangeUsernameDto) => userAPI.changeUsername(id, dto),
        onSuccess: (res) => {
            qc.setQueryData(USER_KEYS.detail(id), res);
            qc.invalidateQueries({ queryKey: USER_KEYS.cooldowns(id) });
        },
        onError: notifyError,
    });

    const changeEmailMut = useMutation({
        mutationFn: (dto: ChangeEmailDto) => userAPI.changeEmail(id, dto),
        onSuccess: (res) => {
            qc.setQueryData(USER_KEYS.detail(id), res);
            qc.invalidateQueries({ queryKey: USER_KEYS.cooldowns(id) });
        },
        onError: notifyError,
    });

    const changePhoneMut = useMutation({
        mutationFn: (dto: ChangePhoneDto) => userAPI.changePhone(id, dto),
        onSuccess: (res) => {
            qc.setQueryData(USER_KEYS.detail(id), res);
            qc.invalidateQueries({ queryKey: USER_KEYS.cooldowns(id) });
        },
        onError: notifyError,
    });

    const changePasswordMut = useMutation({
        mutationFn: (dto: ChangePasswordDto) => userAPI.changePassword(id, dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: USER_KEYS.cooldowns(id) });
        },
        onError: notifyError,
    });

    const adminResetPasswordMut = useMutation({
        mutationFn: (dto: AdminResetPasswordDto) => userAPI.adminResetPassword(id, dto),
        onError: notifyError,
    });

    const revokeSessionMut = useMutation({
        mutationFn: (sessionId: string) => userAPI.revokeSession(id, sessionId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: USER_KEYS.sessions(id) });
        },
        onError: notifyError,
    });

    const revokeAllSessionsMut = useMutation({
        mutationFn: () => userAPI.revokeAllSessions(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: USER_KEYS.sessions(id) });
        },
        onError: notifyError,
    });

    const softDeleteMut = useMutation({
        mutationFn: (reason?: string) => userAPI.softDelete(id, reason),
        onSuccess: () => qc.invalidateQueries({ queryKey: USER_KEYS.all }),
        onError: notifyError,
    });

    const restoreMut = useMutation({
        mutationFn: () => userAPI.restore(id),
        onSuccess: (res) => {
            qc.setQueryData(USER_KEYS.detail(id), res);
            qc.invalidateQueries({ queryKey: USER_KEYS.all });
        },
        onError: notifyError,
    });

    const hardDeleteMut = useMutation({
        mutationFn: () => userAPI.hardDelete(id),
        onSuccess: () => {
            qc.removeQueries({ queryKey: USER_KEYS.detail(id) });
            qc.invalidateQueries({ queryKey: USER_KEYS.all });
        },
        onError: notifyError,
    });

    return {
        user: q.data,
        isLoading: q.isLoading,
        isRefetching: q.isRefetching,
        refetch: q.refetch,

        update: updateMut.mutate,
        updateAsync: updateMut.mutateAsync,
        isUpdating: updateMut.isPending,

        changeStatus: changeStatusMut.mutate,
        isChangingStatus: changeStatusMut.isPending,

        scheduleStatus: scheduleStatusMut.mutate,
        isScheduling: scheduleStatusMut.isPending,

        block: blockMut.mutate,
        blockAsync: blockMut.mutateAsync,
        isBlocking: blockMut.isPending,

        changeUsername: changeUsernameMut.mutate,
        isChangingUsername: changeUsernameMut.isPending,
        changeUsernameError: changeUsernameMut.error,

        changeEmail: changeEmailMut.mutate,
        isChangingEmail: changeEmailMut.isPending,

        changePhone: changePhoneMut.mutate,
        isChangingPhone: changePhoneMut.isPending,

        changePassword: changePasswordMut.mutate,
        isChangingPassword: changePasswordMut.isPending,

        adminResetPassword: adminResetPasswordMut.mutate,
        adminResetPasswordAsync: adminResetPasswordMut.mutateAsync,
        isResettingPassword: adminResetPasswordMut.isPending,

        revokeSession: revokeSessionMut.mutate,
        isRevokingSession: revokeSessionMut.isPending,

        revokeAllSessions: revokeAllSessionsMut.mutate,
        isRevokingAll: revokeAllSessionsMut.isPending,

        softDelete: softDeleteMut.mutate,
        isDeleting: softDeleteMut.isPending,

        restore: restoreMut.mutate,
        isRestoring: restoreMut.isPending,

        hardDelete: hardDeleteMut.mutate,
        isHardDeleting: hardDeleteMut.isPending,
    };
}

/* ─────────────────────────────────────────────
   Stats & supplementary hooks
───────────────────────────────────────────── */
export function useUserStats() {
    return useQuery({
        queryKey: USER_KEYS.stats(),
        queryFn: userAPI.getStats,
        staleTime: 60_000,
    });
}

export function useUserSessions(id: string) {
    return useQuery({
        queryKey: USER_KEYS.sessions(id),
        queryFn: () => userAPI.getActiveSessions(id),
        enabled: !!id,
        staleTime: 30_000,
    });
}

export function useUserCooldowns(id: string) {
    return useQuery({
        queryKey: USER_KEYS.cooldowns(id),
        queryFn: () => userAPI.getSensitiveCooldowns(id),
        enabled: !!id,
        staleTime: 30_000,
    });
}

export function useUserLoginHistory(id: string) {
    return useQuery({
        queryKey: USER_KEYS.loginHistory(id),
        queryFn: () => userAPI.getLoginHistory(id),
        enabled: !!id,
        staleTime: 60_000,
    });
}

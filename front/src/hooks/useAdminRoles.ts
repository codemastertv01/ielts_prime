'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roleAPI } from '../services/roleAPI';
import { showToast } from '../services/toastService';
import type { AssignPermissionsDto, BulkDeleteDto, BulkUpdateItem, ChangeStatusDto, CreateRoleDto, GetRolesQuery, RemovePermissionsDto, Role, RoleListResponse, ScheduleStatusDto, UpdateRoleDto } from '../types/role';

export const ROLE_KEYS = {
    all: ['roles'] as const,
    list: (q?: GetRolesQuery) => ['roles', 'list', q] as const,
    detail: (id: string) => ['roles', 'detail', id] as const,
    stats: () => ['roles', 'stats'] as const,
    audit: (id: string) => ['roles', 'audit', id] as const,
    statusHistory: (id: string) => ['roles', 'statusHistory', id] as const,
    updateHistory: (id: string) => ['roles', 'updateHistory', id] as const,
};

function getErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
        const maybe = error as { response?: { data?: { message?: unknown } }; message?: unknown };
        const message = maybe.response?.data?.message ?? maybe.message;
        if (Array.isArray(message)) return message.join(', ');
        if (typeof message === 'string') return message;
    }
    return 'Role amali bajarilmadi';
}

const notifyError = (error: unknown) => showToast.error(getErrorMessage(error));

/* ─────────────────────────────────────────────
   List hook
───────────────────────────────────────────── */
export function useRoles(query?: GetRolesQuery) {
    const qc = useQueryClient();

    const listQuery = useQuery<RoleListResponse>({
        queryKey: ROLE_KEYS.list(query),
        queryFn: () => roleAPI.getAll(query),
        staleTime: 30_000,
        placeholderData: (prev) => prev,
    });

    const createMut = useMutation({
        mutationFn: (dto: CreateRoleDto) => roleAPI.create(dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: ROLE_KEYS.all }),
        onError: notifyError,
    });

    const createManyMut = useMutation({
        mutationFn: (dtos: CreateRoleDto[]) => roleAPI.createMany(dtos),
        onSuccess: () => qc.invalidateQueries({ queryKey: ROLE_KEYS.all }),
        onError: notifyError,
    });

    const updateMut = useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateRoleDto }) => roleAPI.update(id, dto),
        onSuccess: (res) => {
            qc.setQueryData(ROLE_KEYS.detail(res._id), res);
            qc.invalidateQueries({ queryKey: ROLE_KEYS.all });
        },
        onError: notifyError,
    });

    const bulkUpdateMut = useMutation({
        mutationFn: (items: BulkUpdateItem[]) => roleAPI.bulkUpdate(items),
        onSuccess: () => qc.invalidateQueries({ queryKey: ROLE_KEYS.all }),
        onError: notifyError,
    });

    const changeStatusMut = useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: ChangeStatusDto }) => roleAPI.changeStatus(id, dto),
        onSuccess: (res) => {
            qc.setQueryData(ROLE_KEYS.detail(res._id), res);
            qc.invalidateQueries({ queryKey: ROLE_KEYS.all });
        },
        onError: notifyError,
    });

    const softDeleteMut = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) => roleAPI.softDelete(id, reason),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ROLE_KEYS.all });
            qc.invalidateQueries({ queryKey: ROLE_KEYS.stats() });
        },
        onError: notifyError,
    });

    const bulkDeleteMut = useMutation({
        mutationFn: (dto: BulkDeleteDto) => roleAPI.bulkDelete(dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ROLE_KEYS.all });
            qc.invalidateQueries({ queryKey: ROLE_KEYS.stats() });
        },
        onError: notifyError,
    });

    const restoreMut = useMutation({
        mutationFn: (id: string) => roleAPI.restore(id),
        onSuccess: (res) => {
            qc.setQueryData(ROLE_KEYS.detail(res._id), res);
            qc.invalidateQueries({ queryKey: ROLE_KEYS.all });
        },
        onError: notifyError,
    });

    const hardDeleteMut = useMutation({
        mutationFn: (id: string) => roleAPI.hardDelete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ROLE_KEYS.all });
            qc.invalidateQueries({ queryKey: ROLE_KEYS.stats() });
        },
        onError: notifyError,
    });

    return {
        roles: listQuery.data?.data ?? [],
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

        update: updateMut.mutate,
        updateAsync: updateMut.mutateAsync,
        isUpdating: updateMut.isPending,

        bulkUpdate: bulkUpdateMut.mutate,
        bulkUpdateAsync: bulkUpdateMut.mutateAsync,
        isBulkUpdating: bulkUpdateMut.isPending,

        changeStatus: changeStatusMut.mutate,
        changeStatusAsync: changeStatusMut.mutateAsync,
        isChangingStatus: changeStatusMut.isPending,

        softDelete: softDeleteMut.mutate,
        softDeleteAsync: softDeleteMut.mutateAsync,
        isDeleting: softDeleteMut.isPending,

        bulkDelete: bulkDeleteMut.mutate,
        bulkDeleteAsync: bulkDeleteMut.mutateAsync,
        isBulkDeleting: bulkDeleteMut.isPending,

        restore: restoreMut.mutate,
        restoreAsync: restoreMut.mutateAsync,
        isRestoring: restoreMut.isPending,

        hardDelete: hardDeleteMut.mutate,
        hardDeleteAsync: hardDeleteMut.mutateAsync,
        isHardDeleting: hardDeleteMut.isPending,
    };
}

/* ─────────────────────────────────────────────
   Single role hook
───────────────────────────────────────────── */
export function useRole(id: string) {
    const qc = useQueryClient();

    const q = useQuery<Role>({
        queryKey: ROLE_KEYS.detail(id),
        queryFn: () => roleAPI.getById(id, true),
        enabled: !!id,
        staleTime: 30_000,
    });

    const updateMut = useMutation({
        mutationFn: (dto: UpdateRoleDto) => roleAPI.update(id, dto),
        onSuccess: (res) => {
            qc.setQueryData(ROLE_KEYS.detail(id), res);
            qc.invalidateQueries({ queryKey: ROLE_KEYS.all });
        },
        onError: notifyError,
    });

    const changeStatusMut = useMutation({
        mutationFn: (dto: ChangeStatusDto) => roleAPI.changeStatus(id, dto),
        onSuccess: (res) => {
            qc.setQueryData(ROLE_KEYS.detail(id), res);
            qc.invalidateQueries({ queryKey: ROLE_KEYS.all });
        },
        onError: notifyError,
    });

    const scheduleStatusMut = useMutation({
        mutationFn: (dto: ScheduleStatusDto) => roleAPI.scheduleStatus(id, dto),
        onSuccess: (res) => {
            qc.setQueryData(ROLE_KEYS.detail(id), res);
        },
        onError: notifyError,
    });

    const assignPermsMut = useMutation({
        mutationFn: (dto: AssignPermissionsDto) => roleAPI.assignPermissions(id, dto),
        onSuccess: (res) => {
            qc.setQueryData(ROLE_KEYS.detail(id), res);
            qc.invalidateQueries({ queryKey: ROLE_KEYS.all });
        },
        onError: notifyError,
    });

    const removePermsMut = useMutation({
        mutationFn: (dto: RemovePermissionsDto) => roleAPI.removePermissions(id, dto),
        onSuccess: (res) => {
            qc.setQueryData(ROLE_KEYS.detail(id), res);
            qc.invalidateQueries({ queryKey: ROLE_KEYS.all });
        },
        onError: notifyError,
    });

    const softDeleteMut = useMutation({
        mutationFn: (reason?: string) => roleAPI.softDelete(id, reason),
        onSuccess: () => qc.invalidateQueries({ queryKey: ROLE_KEYS.all }),
        onError: notifyError,
    });

    const restoreMut = useMutation({
        mutationFn: () => roleAPI.restore(id),
        onSuccess: (res) => {
            qc.setQueryData(ROLE_KEYS.detail(id), res);
            qc.invalidateQueries({ queryKey: ROLE_KEYS.all });
        },
        onError: notifyError,
    });

    const hardDeleteMut = useMutation({
        mutationFn: () => roleAPI.hardDelete(id),
        onSuccess: () => {
            qc.removeQueries({ queryKey: ROLE_KEYS.detail(id) });
            qc.invalidateQueries({ queryKey: ROLE_KEYS.all });
        },
        onError: notifyError,
    });

    return {
        role: q.data,
        isLoading: q.isLoading,
        isRefetching: q.isRefetching,
        refetch: q.refetch,

        update: updateMut.mutate,
        updateAsync: updateMut.mutateAsync,
        isUpdating: updateMut.isPending,
        updateError: updateMut.error,

        changeStatus: changeStatusMut.mutate,
        isChangingStatus: changeStatusMut.isPending,

        scheduleStatus: scheduleStatusMut.mutate,
        isScheduling: scheduleStatusMut.isPending,

        assignPermissions: assignPermsMut.mutate,
        assignPermissionsAsync: assignPermsMut.mutateAsync,
        isAssigning: assignPermsMut.isPending,

        removePermissions: removePermsMut.mutate,
        removePermissionsAsync: removePermsMut.mutateAsync,
        isRemoving: removePermsMut.isPending,

        softDelete: softDeleteMut.mutate,
        isDeleting: softDeleteMut.isPending,

        restore: restoreMut.mutate,
        isRestoring: restoreMut.isPending,

        hardDelete: hardDeleteMut.mutate,
        isHardDeleting: hardDeleteMut.isPending,
    };
}

/* ─────────────────────────────────────────────
   Stats hook
───────────────────────────────────────────── */
export function useRoleStats() {
    return useQuery({
        queryKey: ROLE_KEYS.stats(),
        queryFn: roleAPI.getStats,
        staleTime: 60_000,
    });
}

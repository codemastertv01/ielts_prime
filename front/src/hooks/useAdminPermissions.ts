'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { permissionAPI } from '../services/permissionAPI';
import { showToast } from '../services/toastService';
import type { BulkDeleteDto, BulkUpdateItem, ChangeStatusDto, CreatePermissionDto, GetPermissionsQuery, Permission, PermissionListResponse, UpdatePermissionDto } from '@/types/permission';

export const PERM_KEYS = {
    all: ['permissions'] as const,
    list: (q?: GetPermissionsQuery) => ['permissions', 'list', q] as const,
    detail: (id: string) => ['permissions', 'detail', id] as const,
    stats: () => ['permissions', 'stats'] as const,
    byResource: (r: string) => ['permissions', 'resource', r] as const,
};

function getErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
        const maybe = error as { response?: { data?: { message?: unknown } }; message?: unknown };
        const message = maybe.response?.data?.message ?? maybe.message;
        if (Array.isArray(message)) return message.join(', ');
        if (typeof message === 'string') return message;
    }
    return 'Permission amali bajarilmadi';
}

const notifyError = (error: unknown) => showToast.error(getErrorMessage(error));

/* ─────────────────────────────────────────────
   List hook
───────────────────────────────────────────── */
export function usePermissions(query?: GetPermissionsQuery) {
    const qc = useQueryClient();

    const listQuery = useQuery<PermissionListResponse>({
        queryKey: PERM_KEYS.list(query),
        queryFn: () => permissionAPI.getAll(query),
        staleTime: 30_000,
        placeholderData: (prev) => prev,
    });

    const createMut = useMutation({
        mutationFn: (dto: CreatePermissionDto) => permissionAPI.create(dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: PERM_KEYS.all }),
        onError: notifyError,
    });

    const createManyMut = useMutation({
        mutationFn: (dtos: CreatePermissionDto[]) => permissionAPI.createMany(dtos),
        onSuccess: () => qc.invalidateQueries({ queryKey: PERM_KEYS.all }),
        onError: notifyError,
    });

    const updateMut = useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdatePermissionDto }) => permissionAPI.update(id, dto),
        onSuccess: (res) => {
            qc.setQueryData(PERM_KEYS.detail(res._id), res);
            qc.invalidateQueries({ queryKey: PERM_KEYS.all });
        },
        onError: notifyError,
    });

    const bulkUpdateMut = useMutation({
        mutationFn: (items: BulkUpdateItem[]) => permissionAPI.bulkUpdate(items),
        onSuccess: () => qc.invalidateQueries({ queryKey: PERM_KEYS.all }),
        onError: notifyError,
    });

    const changeStatusMut = useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: ChangeStatusDto }) => permissionAPI.changeStatus(id, dto),
        onSuccess: (res) => {
            qc.setQueryData(PERM_KEYS.detail(res._id), res);
            qc.invalidateQueries({ queryKey: PERM_KEYS.all });
        },
        onError: notifyError,
    });

    const softDeleteMut = useMutation({
        mutationFn: (id: string) => permissionAPI.softDelete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: PERM_KEYS.all });
            qc.invalidateQueries({ queryKey: PERM_KEYS.stats() });
        },
        onError: notifyError,
    });

    const bulkDeleteMut = useMutation({
        mutationFn: (dto: BulkDeleteDto) => permissionAPI.bulkDelete(dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: PERM_KEYS.all });
            qc.invalidateQueries({ queryKey: PERM_KEYS.stats() });
        },
        onError: notifyError,
    });

    const restoreMut = useMutation({
        mutationFn: (id: string) => permissionAPI.restore(id),
        onSuccess: (res) => {
            qc.setQueryData(PERM_KEYS.detail(res._id), res);
            qc.invalidateQueries({ queryKey: PERM_KEYS.all });
        },
        onError: notifyError,
    });

    const hardDeleteMut = useMutation({
        mutationFn: (id: string) => permissionAPI.hardDelete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: PERM_KEYS.all });
            qc.invalidateQueries({ queryKey: PERM_KEYS.stats() });
        },
        onError: notifyError,
    });

    return {
        permissions: listQuery.data?.data ?? [],
        total: listQuery.data?.total ?? 0,
        totalPages: listQuery.data?.totalPages ?? 1,
        page: listQuery.data?.page ?? 1,
        isLoading: listQuery.isLoading,
        isFetching: listQuery.isFetching,
        refetch: listQuery.refetch,

        create: createMut.mutate,
        createAsync: createMut.mutateAsync,
        isCreating: createMut.isPending,
        createError: createMut.error,

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
   Single permission hook
───────────────────────────────────────────── */
export function usePermission(id: string) {
    const qc = useQueryClient();

    const q = useQuery<Permission>({
        queryKey: PERM_KEYS.detail(id),
        queryFn: () => permissionAPI.getById(id),
        enabled: !!id,
        staleTime: 30_000,
    });

    const updateMut = useMutation({
        mutationFn: (dto: UpdatePermissionDto) => permissionAPI.update(id, dto),
        onSuccess: (res) => {
            qc.setQueryData(PERM_KEYS.detail(id), res);
            qc.invalidateQueries({ queryKey: PERM_KEYS.all });
        },
        onError: notifyError,
    });

    const changeStatusMut = useMutation({
        mutationFn: (dto: ChangeStatusDto) => permissionAPI.changeStatus(id, dto),
        onSuccess: (res) => {
            qc.setQueryData(PERM_KEYS.detail(id), res);
            qc.invalidateQueries({ queryKey: PERM_KEYS.all });
        },
        onError: notifyError,
    });

    const softDeleteMut = useMutation({
        mutationFn: () => permissionAPI.softDelete(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: PERM_KEYS.all }),
        onError: notifyError,
    });

    const restoreMut = useMutation({
        mutationFn: () => permissionAPI.restore(id),
        onSuccess: (res) => {
            qc.setQueryData(PERM_KEYS.detail(id), res);
            qc.invalidateQueries({ queryKey: PERM_KEYS.all });
        },
        onError: notifyError,
    });

    const hardDeleteMut = useMutation({
        mutationFn: () => permissionAPI.hardDelete(id),
        onSuccess: () => {
            qc.removeQueries({ queryKey: PERM_KEYS.detail(id) });
            qc.invalidateQueries({ queryKey: PERM_KEYS.all });
        },
        onError: notifyError,
    });

    return {
        permission: q.data,
        isLoading: q.isLoading,
        isRefetching: q.isRefetching,
        refetch: q.refetch,

        update: updateMut.mutate,
        updateAsync: updateMut.mutateAsync,
        isUpdating: updateMut.isPending,
        updateError: updateMut.error,

        changeStatus: changeStatusMut.mutate,
        changeStatusAsync: changeStatusMut.mutateAsync,
        isChangingStatus: changeStatusMut.isPending,

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
export function usePermissionStats() {
    return useQuery({
        queryKey: PERM_KEYS.stats(),
        queryFn: permissionAPI.getStats,
        staleTime: 60_000,
    });
}

export function usePermissionsByResource(resource: string) {
    return useQuery({
        queryKey: PERM_KEYS.byResource(resource),
        queryFn: () => permissionAPI.getByResource(resource),
        enabled: !!resource,
        staleTime: 60_000,
    });
}

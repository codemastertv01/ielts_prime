'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminExamAPI } from '../services/examAPI';
import { showToast } from '../services/toastService';
import type { AdminExamFilters, BulkOperationResult, ExamListResponse, GlobalExamStats, IELTSExam } from '../types/exam';

// ─── Query Keys ───────────────────────────────────────────────

export const ADMIN_EXAM_KEYS = {
    all: ['admin', 'exams'] as const,
    list: (f?: AdminExamFilters) => ['admin', 'exams', 'list', f] as const,
    detail: (id: string, includeAnswers?: boolean) => ['admin', 'exams', 'detail', id, includeAnswers] as const,
    stats: (id: string) => ['admin', 'exams', 'stats', id] as const,
    globalStats: () => ['admin', 'exams', 'global-stats'] as const,
};

// ─── Helper: clean empty values from filters ──────────────────

function cleanFilters(f?: AdminExamFilters): AdminExamFilters | undefined {
    if (!f) return undefined;
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(f)) {
        if (v !== '' && v !== undefined && v !== null) clean[k] = v;
    }
    return clean as AdminExamFilters;
}

function getErrorMessage(error: unknown): string {
    const responseMessage = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
    if (Array.isArray(responseMessage)) return responseMessage.join(', ');
    return responseMessage || (error as Error)?.message || 'An unexpected error occurred';
}

function bulkMessage(result: BulkOperationResult, action: string): string {
    return `${result.succeeded} exam(s) ${action}${result.failed.length ? `, ${result.failed.length} failed` : ''}`;
}

// ────────────────────────────────────────────────────────────────
// useAdminExams — list + bulk mutations
// ────────────────────────────────────────────────────────────────

export function useAdminExams(filters?: AdminExamFilters) {
    const qc = useQueryClient();

    // ── List query ─────────────────────────────────────────────
    const listQuery = useQuery<ExamListResponse>({
        queryKey: ADMIN_EXAM_KEYS.list(filters),
        queryFn: () => adminExamAPI.getAll(cleanFilters(filters)),
        staleTime: 2 * 60_000,
        placeholderData: (prev) => prev,
        enabled: true,
    });

    const inv = () => qc.invalidateQueries({ queryKey: ADMIN_EXAM_KEYS.all });

    // ── Create ─────────────────────────────────────────────────
    const createMut = useMutation({
        mutationFn: (data: Record<string, unknown>) => adminExamAPI.create(data),
        onSuccess: () => {
            inv();
            showToast.success('Exam created successfully');
        },
        onError: (error) => showToast.error(getErrorMessage(error)),
    });

    const bulkCreateMut = useMutation({
        mutationFn: (items: Record<string, unknown>[]) => adminExamAPI.bulkCreate(items),
        onSuccess: (result) => {
            inv();
            const notify = result.failed.length ? showToast.info : showToast.success;
            notify(bulkMessage(result, 'created'));
        },
        onError: (error) => showToast.error(getErrorMessage(error)),
    });

    // ── Bulk soft-delete ────────────────────────────────────────
    const bulkDeleteMut = useMutation({
        mutationFn: (examIds: string[]) => adminExamAPI.bulkSoftDelete(examIds),
        onSuccess: (result) => {
            inv();
            const notify = result.failed.length ? showToast.info : showToast.success;
            notify(bulkMessage(result, "deleted"));
        },
        onError: (error) => showToast.error(getErrorMessage(error)),
    });

    // ── Bulk restore ────────────────────────────────────────────
    const bulkRestoreMut = useMutation({
        mutationFn: (examIds: string[]) => adminExamAPI.bulkRestore(examIds),
        onSuccess: (result) => {
            inv();
            const notify = result.failed.length ? showToast.info : showToast.success;
            notify(bulkMessage(result, 'restored'));
        },
        onError: (error) => showToast.error(getErrorMessage(error)),
    });

    const deleteMut = useMutation({
        mutationFn: (id: string) => adminExamAPI.softDelete(id),
        onSuccess: () => {
            inv();
            showToast.success("Exam deleted");
        },
        onError: (error) => showToast.error(getErrorMessage(error)),
    });

    const restoreMut = useMutation({
        mutationFn: (id: string) => adminExamAPI.restore(id),
        onSuccess: () => {
            inv();
            showToast.success('Exam restored');
        },
        onError: (error) => showToast.error(getErrorMessage(error)),
    });

    const togglePublishMut = useMutation({
        mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) => (isPublished ? adminExamAPI.unpublish(id) : adminExamAPI.publish(id)),
        onSuccess: (_data, variables) => {
            inv();
            showToast.success(variables.isPublished ? 'Exam unpublished' : 'Exam published');
        },
        onError: (error) => showToast.error(getErrorMessage(error)),
    });

    return {
        // List data
        exams: listQuery.data?.exams ?? [],
        total: listQuery.data?.total ?? 0,
        totalPages: listQuery.data?.totalPages ?? 1,
        page: listQuery.data?.page ?? 1,
        hasNext: listQuery.data?.hasNext ?? false,
        hasPrev: listQuery.data?.hasPrev ?? false,
        isLoading: listQuery.isLoading,
        isFetching: listQuery.isFetching,
        refetch: listQuery.refetch,

        // Create
        create: createMut.mutate,
        createAsync: createMut.mutateAsync,
        isCreating: createMut.isPending,

        bulkCreate: bulkCreateMut.mutate,
        bulkCreateAsync: bulkCreateMut.mutateAsync,
        isBulkCreating: bulkCreateMut.isPending,

        // Bulk delete
        bulkDelete: bulkDeleteMut.mutate,
        bulkDeleteAsync: bulkDeleteMut.mutateAsync,
        isBulkDeleting: bulkDeleteMut.isPending,

        // Bulk restore
        bulkRestore: bulkRestoreMut.mutate,
        bulkRestoreAsync: bulkRestoreMut.mutateAsync,
        isBulkRestoring: bulkRestoreMut.isPending,

        softDelete: deleteMut.mutate,
        softDeleteAsync: deleteMut.mutateAsync,
        isDeleting: deleteMut.isPending,

        restore: restoreMut.mutate,
        restoreAsync: restoreMut.mutateAsync,
        isRestoring: restoreMut.isPending,

        togglePublish: togglePublishMut.mutate,
        togglePublishAsync: togglePublishMut.mutateAsync,
        isTogglingPublish: togglePublishMut.isPending,
    };
}

// ────────────────────────────────────────────────────────────────
// useAdminExam — single exam + all mutations
// ────────────────────────────────────────────────────────────────

export function useAdminExam(id: string, includeAnswers = false) {
    const qc = useQueryClient();

    const q = useQuery<IELTSExam>({
        queryKey: ADMIN_EXAM_KEYS.detail(id, includeAnswers),
        queryFn: () => adminExamAPI.getById(id, includeAnswers) as Promise<IELTSExam>,
        enabled: !!id,
        staleTime: 2 * 60_000,
    });

    const inv = () => {
        qc.invalidateQueries({ queryKey: ADMIN_EXAM_KEYS.all });
        qc.invalidateQueries({ queryKey: ADMIN_EXAM_KEYS.detail(id) });
    };

    // ── Update ─────────────────────────────────────────────────
    const updateMut = useMutation({
        mutationFn: (data: Record<string, unknown>) => adminExamAPI.update(id, data),
        onSuccess: () => {
            inv();
            showToast.success('Exam updated successfully');
        },
        onError: (error) => showToast.error(getErrorMessage(error)),
    });

    // ── Publish ────────────────────────────────────────────────
    const publishMut = useMutation({
        mutationFn: () => adminExamAPI.publish(id),
        onSuccess: () => {
            inv();
            showToast.success('Exam published');
        },
        onError: (error) => showToast.error(getErrorMessage(error)),
    });

    // ── Unpublish ──────────────────────────────────────────────
    const unpublishMut = useMutation({
        mutationFn: () => adminExamAPI.unpublish(id),
        onSuccess: () => {
            inv();
            showToast.success('Exam unpublished');
        },
        onError: (error) => showToast.error(getErrorMessage(error)),
    });

    // ── Soft delete ────────────────────────────────────────────
    const softDeleteMut = useMutation({
        mutationFn: () => adminExamAPI.softDelete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ADMIN_EXAM_KEYS.all });
            qc.removeQueries({ queryKey: ADMIN_EXAM_KEYS.detail(id) });
            showToast.success("Exam deleted");
        },
        onError: (error) => showToast.error(getErrorMessage(error)),
    });

    // ── Restore ────────────────────────────────────────────────
    const restoreMut = useMutation({
        mutationFn: () => adminExamAPI.restore(id),
        onSuccess: () => {
            inv();
            showToast.success('Exam restored');
        },
        onError: (error) => showToast.error(getErrorMessage(error)),
    });

    return {
        exam: q.data,
        isLoading: q.isLoading,
        isRefetching: q.isRefetching,
        refetch: q.refetch,

        update: updateMut.mutate,
        updateAsync: updateMut.mutateAsync,
        isUpdating: updateMut.isPending,

        publish: publishMut.mutate,
        publishAsync: publishMut.mutateAsync,
        isPublishing: publishMut.isPending,

        unpublish: unpublishMut.mutate,
        unpublishAsync: unpublishMut.mutateAsync,
        isUnpublishing: unpublishMut.isPending,

        softDelete: softDeleteMut.mutate,
        softDeleteAsync: softDeleteMut.mutateAsync,
        isDeleting: softDeleteMut.isPending,

        restore: restoreMut.mutate,
        restoreAsync: restoreMut.mutateAsync,
        isRestoring: restoreMut.isPending,
    };
}

// ────────────────────────────────────────────────────────────────
// useAdminExamStats — per-exam stats
// ────────────────────────────────────────────────────────────────

export function useAdminExamStats(id: string) {
    return useQuery({
        queryKey: ADMIN_EXAM_KEYS.stats(id),
        queryFn: () => adminExamAPI.getStatistics(id),
        enabled: !!id,
        staleTime: 5 * 60_000,
    });
}

// ────────────────────────────────────────────────────────────────
// useAdminGlobalStats — dashboard global stats
// ────────────────────────────────────────────────────────────────

export function useAdminGlobalStats() {
    return useQuery<GlobalExamStats>({
        queryKey: ADMIN_EXAM_KEYS.globalStats(),
        queryFn: () => adminExamAPI.getGlobalStats() as Promise<GlobalExamStats>,
        staleTime: 10 * 60_000,
    });
}

'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAttemptAPI } from '../services/attemptAPI';
import type { AdminStats, AdminUpdateAttemptDto, AllAttemptsParams, AttemptListResponse, BulkDeleteDto, GradeSpeakingDto, GradeWritingDto, IELTSExamAttempt, AuditLogEntry, ChangeHistoryEntry } from '@/types/attempt.types';

// ─── Query key factory ────────────────────────────────────────────────────────
export const AK = {
    all: ['admin', 'attempts'] as const,
    stats: () => [...AK.all, 'stats'] as const,
    list: (p?: AllAttemptsParams) => [...AK.all, 'list', p] as const,
    detail: (id: string) => [...AK.all, id] as const,
    audit: (id: string) => [...AK.all, id, 'audit'] as const,
    history: (id: string) => [...AK.all, id, 'history'] as const,
    byExam: (examId: string, p?: AllAttemptsParams) => [...AK.all, 'exam', examId, p] as const,
    byUser: (userId: string, p?: AllAttemptsParams) => [...AK.all, 'user', userId, p] as const,
};

// ─── Stats ────────────────────────────────────────────────────────────────────
export const useAdminAttemptStats = () =>
    useQuery<AdminStats>({
        queryKey: AK.stats(),
        queryFn: adminAttemptAPI.getStats,
        staleTime: 60_000,
        refetchInterval: 5 * 60_000,
    });

// ─── List (paginated) ─────────────────────────────────────────────────────────
export const useAdminAttempts = (params?: AllAttemptsParams) => {
    const qc = useQueryClient();

    const q = useQuery<AttemptListResponse>({
        queryKey: AK.list(params),
        queryFn: () => adminAttemptAPI.getAll(params),
        staleTime: 30_000,
        placeholderData: (prev) => prev,
    });

    const updateMut = useMutation({
        mutationFn: ({ attemptId, data }: { attemptId: string; data: AdminUpdateAttemptDto }) => adminAttemptAPI.update(attemptId, data),
        onSuccess: (updated) => {
            qc.setQueryData(AK.detail(updated._id), updated);
            qc.invalidateQueries({ queryKey: AK.all });
        },
    });

    const gradeWritingMut = useMutation({
        mutationFn: ({ attemptId, data }: { attemptId: string; data: GradeWritingDto }) => adminAttemptAPI.gradeWriting(attemptId, data),
        onSuccess: (updated) => {
            qc.setQueryData(AK.detail(updated._id), updated);
            qc.invalidateQueries({ queryKey: AK.all });
        },
    });

    const gradeSpeakingMut = useMutation({
        mutationFn: ({ attemptId, data }: { attemptId: string; data: GradeSpeakingDto }) => adminAttemptAPI.gradeSpeaking(attemptId, data),
        onSuccess: (updated) => {
            qc.setQueryData(AK.detail(updated._id), updated);
            qc.invalidateQueries({ queryKey: AK.all });
        },
    });

    const softDeleteMut = useMutation({
        mutationFn: ({ attemptId, reason }: { attemptId: string; reason?: string }) => adminAttemptAPI.softDelete(attemptId, reason),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: AK.all });
            qc.invalidateQueries({ queryKey: AK.stats() });
        },
    });

    const bulkDeleteMut = useMutation({
        mutationFn: (dto: BulkDeleteDto) => adminAttemptAPI.bulkDelete(dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: AK.all });
            qc.invalidateQueries({ queryKey: AK.stats() });
        },
    });

    const restoreMut = useMutation({
        mutationFn: ({ attemptId, reason }: { attemptId: string; reason?: string }) => adminAttemptAPI.restore(attemptId, reason),
        onSuccess: (updated) => {
            qc.setQueryData(AK.detail(updated._id), updated);
            qc.invalidateQueries({ queryKey: AK.all });
            qc.invalidateQueries({ queryKey: AK.stats() });
        },
    });

    const bulkRestoreMut = useMutation({
        mutationFn: ({ attemptIds, reason }: { attemptIds: string[]; reason?: string }) => adminAttemptAPI.bulkRestore(attemptIds, reason),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: AK.all });
            qc.invalidateQueries({ queryKey: AK.stats() });
        },
    });

    const hardDeleteMut = useMutation({
        mutationFn: (attemptId: string) => adminAttemptAPI.hardDelete(attemptId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: AK.all });
            qc.invalidateQueries({ queryKey: AK.stats() });
        },
    });

    const createMut = useMutation({
        mutationFn: (examId: string) => adminAttemptAPI.create(examId),
        onSuccess: (created) => {
            qc.setQueryData(AK.detail(created._id), created);
            qc.invalidateQueries({ queryKey: AK.all });
            qc.invalidateQueries({ queryKey: AK.stats() });
        },
    });

    return {
        attempts: (q.data?.attempts ?? []) as IELTSExamAttempt[],
        total: q.data?.total ?? 0,
        totalPages: q.data?.totalPages ?? 1,
        hasNext: q.data?.hasNext ?? false,
        hasPrev: q.data?.hasPrev ?? false,
        isLoading: q.isLoading,
        isFetching: q.isFetching,
        refetch: q.refetch,

        updateAttempt: updateMut.mutate,
        updateAttemptAsync: updateMut.mutateAsync,
        isUpdating: updateMut.isPending,

        gradeWriting: gradeWritingMut.mutate,
        gradeWritingAsync: gradeWritingMut.mutateAsync,
        isGradingWriting: gradeWritingMut.isPending,

        gradeSpeaking: gradeSpeakingMut.mutate,
        gradeSpeakingAsync: gradeSpeakingMut.mutateAsync,
        isGradingSpeaking: gradeSpeakingMut.isPending,

        softDelete: softDeleteMut.mutate,
        softDeleteAsync: softDeleteMut.mutateAsync,
        isDeleting: softDeleteMut.isPending,

        bulkDelete: bulkDeleteMut.mutate,
        bulkDeleteAsync: bulkDeleteMut.mutateAsync,
        isBulkDeleting: bulkDeleteMut.isPending,

        restore: restoreMut.mutate,
        restoreAsync: restoreMut.mutateAsync,
        isRestoring: restoreMut.isPending,

        bulkRestore: bulkRestoreMut.mutate,
        bulkRestoreAsync: bulkRestoreMut.mutateAsync,
        isBulkRestoring: bulkRestoreMut.isPending,

        hardDelete: hardDeleteMut.mutate,
        hardDeleteAsync: hardDeleteMut.mutateAsync,
        isHardDeleting: hardDeleteMut.isPending,

        createAttempt: createMut.mutate,
        createAttemptAsync: createMut.mutateAsync,
        isCreating: createMut.isPending,
    };
};

// ─── Single attempt ───────────────────────────────────────────────────────────
export const useAdminAttempt = (attemptId: string) => {
    const qc = useQueryClient();

    const detailQ = useQuery<IELTSExamAttempt>({
        queryKey: AK.detail(attemptId),
        queryFn: () => adminAttemptAPI.getById(attemptId),
        enabled: !!attemptId,
        placeholderData: (prev) => prev,
        staleTime: 30_000,
    });

    const auditQ = useQuery<AuditLogEntry[]>({
        queryKey: AK.audit(attemptId),
        queryFn: () => adminAttemptAPI.getAuditLog(attemptId),
        enabled: false,
        staleTime: 60_000,
    });

    const histQ = useQuery<ChangeHistoryEntry[]>({
        queryKey: AK.history(attemptId),
        queryFn: () => adminAttemptAPI.getChangeHistory(attemptId),
        enabled: false,
        staleTime: 60_000,
    });

    const updateMut = useMutation({
        mutationFn: (data: AdminUpdateAttemptDto) => adminAttemptAPI.update(attemptId, data),
        onSuccess: (updated) => {
            qc.setQueryData(AK.detail(attemptId), updated);
            qc.invalidateQueries({ queryKey: AK.all });
        },
    });

    const gradeWritingMut = useMutation({
        mutationFn: (data: GradeWritingDto) => adminAttemptAPI.gradeWriting(attemptId, data),
        onSuccess: (updated) => qc.setQueryData(AK.detail(attemptId), updated),
    });

    const gradeSpeakingMut = useMutation({
        mutationFn: (data: GradeSpeakingDto) => adminAttemptAPI.gradeSpeaking(attemptId, data),
        onSuccess: (updated) => qc.setQueryData(AK.detail(attemptId), updated),
    });

    const softDeleteMut = useMutation({
        mutationFn: (reason?: string) => adminAttemptAPI.softDelete(attemptId, reason),
        onSuccess: () => {
            detailQ.refetch();
            qc.invalidateQueries({ queryKey: AK.all });
            qc.invalidateQueries({ queryKey: AK.stats() });
        },
    });

    const restoreMut = useMutation({
        mutationFn: (reason?: string) => adminAttemptAPI.restore(attemptId, reason),
        onSuccess: (updated) => {
            qc.setQueryData(AK.detail(attemptId), updated);
            qc.invalidateQueries({ queryKey: AK.all });
        },
    });

    const hardDeleteMut = useMutation({
        mutationFn: () => adminAttemptAPI.hardDelete(attemptId),
        onSuccess: () => {
            qc.removeQueries({ queryKey: AK.detail(attemptId) });
            qc.invalidateQueries({ queryKey: AK.all });
        },
    });

    return {
        attempt: detailQ.data,
        isLoading: detailQ.isLoading,
        isRefetching: detailQ.isRefetching,
        refetch: detailQ.refetch,

        fetchAuditLog: auditQ.refetch,
        auditLog: (auditQ.data ?? []) as AuditLogEntry[],
        isLoadingAudit: auditQ.isFetching,

        fetchChangeHistory: histQ.refetch,
        changeHistory: (histQ.data ?? []) as ChangeHistoryEntry[],
        isLoadingHistory: histQ.isFetching,

        update: updateMut.mutate,
        updateAsync: updateMut.mutateAsync,
        isUpdating: updateMut.isPending,

        gradeWriting: gradeWritingMut.mutate,
        gradeWritingAsync: gradeWritingMut.mutateAsync,
        isGradingWriting: gradeWritingMut.isPending,

        gradeSpeaking: gradeSpeakingMut.mutate,
        gradeSpeakingAsync: gradeSpeakingMut.mutateAsync,
        isGradingSpeaking: gradeSpeakingMut.isPending,

        softDelete: softDeleteMut.mutate,
        softDeleteAsync: softDeleteMut.mutateAsync,
        isDeleting: softDeleteMut.isPending,

        restore: restoreMut.mutate,
        restoreAsync: restoreMut.mutateAsync,
        isRestoring: restoreMut.isPending,

        hardDelete: hardDeleteMut.mutate,
        hardDeleteAsync: hardDeleteMut.mutateAsync,
        isHardDeleting: hardDeleteMut.isPending,
    };
};

// ─── By exam / by user ────────────────────────────────────────────────────────
export const useAdminExamAttempts = (examId: string, params?: AllAttemptsParams) =>
    useQuery<AttemptListResponse>({
        queryKey: AK.byExam(examId, params),
        queryFn: () => adminAttemptAPI.getByExam(examId, params),
        enabled: !!examId,
        staleTime: 30_000,
    });

export const useAdminUserAttempts = (userId: string, params?: AllAttemptsParams) =>
    useQuery<AttemptListResponse>({
        queryKey: AK.byUser(userId, params),
        queryFn: () => adminAttemptAPI.getByUser(userId, params),
        enabled: !!userId,
        staleTime: 30_000,
    });

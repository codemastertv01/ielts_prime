// hooks/useAttempts.ts
'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attemptAPI } from '@/services/attemptAPI';
import { AllAttemptsParams, AutoSaveData, SpeakingRecordingData, SubmitListeningSectionDto, SubmitReadingSectionDto, SubmitSpeakingSectionDto, SubmitWritingSectionDto } from '../types/attempt.types';

// ─── Query Keys ───────────────────────────────────────────────
export const ATTEMPT_KEYS = {
    all: ['attempts'] as const,
    list: (params?: AllAttemptsParams) => ['attempts', 'list', params] as const,
    detail: (id: string) => ['attempts', 'detail', id] as const,
    active: (examId: string) => ['attempts', 'active', examId] as const,
    examHistory: (examId: string) => ['attempts', 'exam', examId] as const,
};

// ═══════════════════════════════════════════════════════════════
// MAIN HOOK — useAttempts (list + mutations)
// ═══════════════════════════════════════════════════════════════

export const useAttempts = (filters?: AllAttemptsParams) => {
    const queryClient = useQueryClient();

    const { data: attemptsData, isLoading, isFetching, refetch } = useQuery({ queryKey: ATTEMPT_KEYS.list(filters), queryFn: () => attemptAPI.getAll(filters), staleTime: 2 * 60 * 1000 });

    // ── Start ────────────────────────────────────────────────
    const startMutation = useMutation({
        mutationFn: (examId: string) => attemptAPI.start(examId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ATTEMPT_KEYS.all });
        },
        onError: (e: any) => {
            console.error('Start attempt error:', e?.response?.data?.message ?? e.message);
        },
    });

    // ── Auto-save (silent) ───────────────────────────────────
    const autoSaveMutation = useMutation({
        mutationFn: ({ attemptId, data }: { attemptId: string; data: AutoSaveData }) => attemptAPI.autoSave(attemptId, data),
        onError: (e: any) => {
            console.warn('Auto-save failed:', e?.response?.data?.message ?? e.message);
        },
    });

    // ── Submit Reading ───────────────────────────────────────
    const submitReadingMutation = useMutation({
        mutationFn: ({ attemptId, data }: { attemptId: string; data: SubmitReadingSectionDto }) => attemptAPI.submitReading(attemptId, data),
        onSuccess: (_, { attemptId }) => {
            queryClient.invalidateQueries({ queryKey: ATTEMPT_KEYS.detail(attemptId) });
            queryClient.invalidateQueries({ queryKey: ATTEMPT_KEYS.all });
        },
        onError: (e: any) => {
            console.error('Submit reading error:', e?.response?.data?.message ?? e.message);
        },
    });

    // ── Submit Listening ─────────────────────────────────────
    const submitListeningMutation = useMutation({
        mutationFn: ({ attemptId, data }: { attemptId: string; data: SubmitListeningSectionDto }) => attemptAPI.submitListening(attemptId, data),
        onSuccess: (_, { attemptId }) => {
            queryClient.invalidateQueries({ queryKey: ATTEMPT_KEYS.detail(attemptId) });
            queryClient.invalidateQueries({ queryKey: ATTEMPT_KEYS.all });
        },
        onError: (e: any) => {
            console.error('Submit listening error:', e?.response?.data?.message ?? e.message);
        },
    });

    // ── Submit Writing ───────────────────────────────────────
    const submitWritingMutation = useMutation({
        mutationFn: ({ attemptId, data }: { attemptId: string; data: SubmitWritingSectionDto }) => attemptAPI.submitWriting(attemptId, data),
        onSuccess: (_, { attemptId }) => {
            queryClient.invalidateQueries({ queryKey: ATTEMPT_KEYS.detail(attemptId) });
            queryClient.invalidateQueries({ queryKey: ATTEMPT_KEYS.all });
        },
        onError: (e: any) => {
            console.error('Submit writing error:', e?.response?.data?.message ?? e.message);
        },
    });

    // ── Submit Speaking ──────────────────────────────────────
    const submitSpeakingMutation = useMutation({
        mutationFn: ({ attemptId, data }: { attemptId: string; data: SubmitSpeakingSectionDto }) => attemptAPI.submitSpeaking(attemptId, data),
        onSuccess: (_, { attemptId }) => {
            queryClient.invalidateQueries({ queryKey: ATTEMPT_KEYS.detail(attemptId) });
            queryClient.invalidateQueries({ queryKey: ATTEMPT_KEYS.all });
        },
        onError: (e: any) => {
            console.error('Submit speaking error:', e?.response?.data?.message ?? e.message);
        },
    });

    // ── Save Speaking Recording ──────────────────────────────
    const saveSpeakingRecordingMutation = useMutation({
        mutationFn: ({ attemptId, data }: { attemptId: string; data: SpeakingRecordingData }) => attemptAPI.saveSpeakingRecording(attemptId, data),
        onError: (e: any) => {
            console.error('Save recording error:', e?.response?.data?.message ?? e.message);
        },
    });

    // ── Force Expire ─────────────────────────────────────────
    const forceExpireMutation = useMutation({
        mutationFn: (attemptId: string) => attemptAPI.forceExpire(attemptId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ATTEMPT_KEYS.all });
        },
        onError: (e: any) => {
            console.warn('Force expire failed:', e?.message);
        },
    });

    return {
        // Data
        attempts: attemptsData?.attempts ?? [],
        total: attemptsData?.total ?? 0,
        totalPages: attemptsData?.totalPages ?? 1,
        hasNext: attemptsData?.hasNext ?? false,
        hasPrev: attemptsData?.hasPrev ?? false,
        isLoading,
        isFetching,
        refetch,

        // Start
        startAttempt: startMutation.mutate,
        startAttemptAsync: startMutation.mutateAsync,
        isStarting: startMutation.isPending,
        startError: startMutation.error,

        // Auto-save
        autoSave: autoSaveMutation.mutate,
        autoSaveAsync: autoSaveMutation.mutateAsync,
        isSavingAuto: autoSaveMutation.isPending,

        // Submit sections
        submitReading: submitReadingMutation.mutate,
        submitReadingAsync: submitReadingMutation.mutateAsync,
        isSubmittingReading: submitReadingMutation.isPending,

        submitListening: submitListeningMutation.mutate,
        submitListeningAsync: submitListeningMutation.mutateAsync,
        isSubmittingListening: submitListeningMutation.isPending,

        submitWriting: submitWritingMutation.mutate,
        submitWritingAsync: submitWritingMutation.mutateAsync,
        isSubmittingWriting: submitWritingMutation.isPending,

        submitSpeaking: submitSpeakingMutation.mutate,
        submitSpeakingAsync: submitSpeakingMutation.mutateAsync,
        isSubmittingSpeaking: submitSpeakingMutation.isPending,

        // Recording
        saveSpeakingRecording: saveSpeakingRecordingMutation.mutate,
        saveSpeakingRecordingAsync: saveSpeakingRecordingMutation.mutateAsync,
        isSavingRecording: saveSpeakingRecordingMutation.isPending,

        // Expire
        forceExpire: forceExpireMutation.mutate,
        isExpiring: forceExpireMutation.isPending,
    };
};

// ═══════════════════════════════════════════════════════════════
// SINGLE ATTEMPT HOOK
// ═══════════════════════════════════════════════════════════════

export const useAttempt = (attemptId: string) => {
    return useQuery({
        queryKey: ATTEMPT_KEYS.detail(attemptId),
        queryFn: () => attemptAPI.getById(attemptId),
        enabled: !!attemptId,
        staleTime: 30 * 1000,
    });
};

// ═══════════════════════════════════════════════════════════════
// ACTIVE ATTEMPT HOOK
// ═══════════════════════════════════════════════════════════════

export const useActiveAttempt = (examId: string) => {
    return useQuery({
        queryKey: ATTEMPT_KEYS.active(examId),
        queryFn: () => attemptAPI.getActive(examId),
        enabled: !!examId,
        retry: false,
        staleTime: 10 * 1000,
    });
};

// ═══════════════════════════════════════════════════════════════
// EXAM HISTORY HOOK
// ═══════════════════════════════════════════════════════════════

export const useExamAttemptHistory = (examId: string) => {
    return useQuery({
        queryKey: ATTEMPT_KEYS.examHistory(examId),
        queryFn: () => attemptAPI.getUserExamAttempts(examId),
        enabled: !!examId,
        staleTime: 60 * 1000,
    });
};

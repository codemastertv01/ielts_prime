// hooks/useExams.ts
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useExamStore } from '@/stores/examStore';
import { userExamAPI } from '@/services/examAPI';
import { attemptAPI } from '@/services/attemptAPI';
import { IELTSExamAttempt } from '@/types/attempt.types';
import { ExamData, ExamListResponse, UserExamFilters } from '@/types/exam';

// ─── Query keys ───────────────────────────────────────────────────────────────

const EXAM_KEYS = {
    detail: (id: string) => ['exam', id] as const,
    attempts: (id: string) => ['exam-attempts', id] as const,
};

// ─── Answer map helpers ───────────────────────────────────────────────────────

const mapReadingAnswers = (ans: Record<string, string>) =>
    Object.entries(ans).map(([key, answer]) => {
        const [passage, question] = key.split('_');
        return { passageNumber: +passage, questionNumber: +question, answer };
    });

const mapListeningAnswers = (ans: Record<string, string>) =>
    Object.entries(ans).map(([key, answer]) => {
        const [part, question] = key.split('_');
        return { partNumber: +part, questionNumber: +question, answer };
    });

// ─── useExam ──────────────────────────────────────────────────────────────────

export function useExam(examId: string) {
    const queryClient = useQueryClient();
    const store = useExamStore();

    // ── 1. Exam detail ────────────────────────────────────────────────────────
    const examQuery = useQuery<ExamData>({
        queryKey: EXAM_KEYS.detail(examId),
        queryFn: () => userExamAPI.getById(examId),
        enabled: !!examId && examId !== 'test',
        staleTime: 15 * 60_000,
        gcTime: 30 * 60_000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    // ── 2. User attempts ──────────────────────────────────────────────────────
    const attemptsQuery = useQuery<IELTSExamAttempt[]>({
        queryKey: EXAM_KEYS.attempts(examId),
        queryFn: () => attemptAPI.getUserExamAttempts(examId),
        enabled: !!examId && examId !== 'test',
        staleTime: 2 * 60_000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    // ── 3. Start attempt ──────────────────────────────────────────────────────
    const startAttemptMutation = useMutation({
        mutationFn: async () => {
            // Use cached exam data; fetch fresh if cache is empty
            let examData = queryClient.getQueryData<ExamData>(EXAM_KEYS.detail(examId));
            if (!examData) {
                examData = await userExamAPI.getById(examId);
                queryClient.setQueryData(EXAM_KEYS.detail(examId), examData);
            }
            const attempt = await attemptAPI.start(examId);
            return { attempt, examData };
        },
        onSuccess: ({ attempt, examData }) => {
            store.initAttempt(examId, examData);
            store.setAttemptId(attempt._id);
            queryClient.invalidateQueries({ queryKey: EXAM_KEYS.attempts(examId) });
        },
    });

    // ── 4. Resume attempt ─────────────────────────────────────────────────────
    const resumeAttemptMutation = useMutation({
        mutationFn: async ({ attemptId, remainingSeconds: clientRemaining }: { attemptId: string; remainingSeconds: number }) => {
            let examData = queryClient.getQueryData<ExamData>(EXAM_KEYS.detail(examId));
            if (!examData) {
                examData = await userExamAPI.getById(examId);
                queryClient.setQueryData(EXAM_KEYS.detail(examId), examData);
            }
            // Fetch saved answers + authoritative remaining time from server
            const savedAttempt = await attemptAPI.getById(attemptId);
            const timedAttempt = savedAttempt as IELTSExamAttempt & { remainingSeconds?: number; timeRemaining?: number };
            const remaining = timedAttempt.remainingSeconds ?? timedAttempt.timeRemaining ?? clientRemaining;

            return { attemptId, examData, remainingSeconds: remaining, savedState: savedAttempt };
        },
        onSuccess: ({ attemptId, examData }) => {
            store.initAttempt(examId, examData);
            store.setAttemptId(attemptId);
        },
    });


    // ── 6. Submit all sections ────────────────────────────────────────────────
    const submitAllMutation = useMutation({
        mutationFn: async () => {
            const s = useExamStore.getState();
            const examData = queryClient.getQueryData<ExamData>(EXAM_KEYS.detail(examId));
            if (!s.attemptId || !examData) {
                throw new Error('No active attempt or exam data');
            }

            if (examData.readingSection?.isEnabled && Object.keys(s.readingAnswers).length > 0) {
                await attemptAPI.submitReading(s.attemptId, {
                    answers: mapReadingAnswers(s.readingAnswers),
                });
            }
            if (examData.listeningSection?.isEnabled && Object.keys(s.listeningAnswers).length > 0) {
                await attemptAPI.submitListening(s.attemptId, {
                    answers: mapListeningAnswers(s.listeningAnswers),
                });
            }
            if (examData.writingSection?.isEnabled) {
                const tasks: { taskNumber: number; content: string }[] = [];
                if (s.writingTask1) tasks.push({ taskNumber: 1, content: s.writingTask1 });
                if (s.writingTask2) tasks.push({ taskNumber: 2, content: s.writingTask2 });
                if (tasks.length > 0) await attemptAPI.submitWriting(s.attemptId, { tasks });
            }
            if (examData.speakingSection?.isEnabled) {
                const parts = Object.entries(s.speakingRecordings)
                    .filter(([, r]) => r.uploaded && r.url)
                    .map(([key, r]) => ({
                        partNumber: +key.split('_q')[0].replace('part', ''),
                        recordingUrl: r.url as string,
                        durationSeconds: r.duration,
                    }));
                if (parts.length > 0) {
                    await attemptAPI.submitSpeaking(s.attemptId, { parts });
                }
            }
            return s.attemptId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: EXAM_KEYS.attempts(examId) });
            store.resetExam();
        },
    });

    // ── Return ────────────────────────────────────────────────────────────────
    return {
        exam: examQuery.data ?? null,
        isLoading: examQuery.isLoading,
        attempts: attemptsQuery.data ?? ([] as IELTSExamAttempt[]),
        isLoadingAttempts: attemptsQuery.isLoading,

        startAttempt: startAttemptMutation.mutateAsync,
        resumeAttempt: resumeAttemptMutation.mutateAsync,
        submitAll: submitAllMutation.mutateAsync,

        isStarting: startAttemptMutation.isPending,
        isResuming: resumeAttemptMutation.isPending,
        isSubmitting: submitAllMutation.isPending,
    };
}

// ─── useExamList ──────────────────────────────────────────────────────────────

const EXAM_LIST_KEYS = {
    filtered: (f?: UserExamFilters) => ['exams', 'list', f] as const,
};

export function useExamList(filters?: UserExamFilters) {
    const q = useQuery<ExamListResponse>({
        queryKey: EXAM_LIST_KEYS.filtered(filters),
        queryFn: () => userExamAPI.getAll(filters),
        staleTime: 5 * 60_000,
        gcTime: 10 * 60_000,
    });

    return {
        exams: q.data?.exams ?? [],
        totalCount: q.data?.total ?? 0,
        page: q.data?.page ?? filters?.page ?? 1,
        totalPages: q.data?.totalPages ?? 1,
        hasNext: q.data?.hasNext ?? false,
        hasPrev: q.data?.hasPrev ?? false,
        isLoading: q.isLoading,
        isFetching: q.isFetching,
        error: q.error,
        refetch: q.refetch,
    };
}

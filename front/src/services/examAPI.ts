import { AdminExamFilters, BulkOperationResult, ExamListResponse, ExamStats, GlobalExamStats, IELTSExam, UserExamFilters } from '@/types/exam';
import apiClient, { cleanParams, unwrap } from './apiClient';

const getBatchError = (error: unknown): string => {
    const candidate = error as { response?: { data?: { message?: string } }; message?: string };
    return candidate.response?.data?.message || candidate.message || 'Creation failed';
};

export const adminExamAPI = {
    // ── List + stats ────────────────────────────────────────────
    getAll: (filters?: AdminExamFilters) => unwrap<ExamListResponse>(apiClient.get('/admin/ielts/exams', { params: cleanParams(filters as unknown as Record<string, unknown>) })),

    getGlobalStats: () => unwrap<GlobalExamStats>(apiClient.get('/admin/ielts/exams/global-stats')),

    getById: (id: string, includeAnswers = false) => unwrap<IELTSExam>(apiClient.get(`/admin/ielts/exams/${id}`, { params: includeAnswers ? { includeAnswers: 'true' } : undefined })),

    getStatistics: (id: string) => unwrap<ExamStats>(apiClient.get(`/admin/ielts/exams/${id}/statistics`)),

    // ── Create ──────────────────────────────────────────────────
    create: (data: Record<string, unknown>) => unwrap<IELTSExam>(apiClient.post('/admin/ielts/exams', data)),

    // Backend currently exposes a single create endpoint. Keep batch orchestration
    // client-side so JSON import can create many exams without a second contract.
    bulkCreate: async (items: Record<string, unknown>[]): Promise<BulkOperationResult> => {
        const settled = await Promise.allSettled(items.map((item) => adminExamAPI.create(item)));
        return settled.reduce<BulkOperationResult>(
            (result, item, index) => {
                if (item.status === 'fulfilled') {
                    result.succeeded += 1;
                } else {
                    result.failed.push({
                        examId: String(items[index]?.title || `#${index + 1}`),
                        reason: getBatchError(item.reason),
                    });
                }
                return result;
            },
            { succeeded: 0, failed: [] }
        );
    },

    // ── Update ──────────────────────────────────────────────────
    update: (id: string, data: Record<string, unknown>) => unwrap<IELTSExam>(apiClient.put(`/admin/ielts/exams/${id}`, data)),

    // ── Publish / unpublish ─────────────────────────────────────
    publish: (id: string) => unwrap(apiClient.post(`/admin/ielts/exams/${id}/publish`)),

    unpublish: (id: string) => unwrap(apiClient.post(`/admin/ielts/exams/${id}/unpublish`)),

    // ── Soft delete / restore ───────────────────────────────────
    softDelete: (id: string) => unwrap(apiClient.delete(`/admin/ielts/exams/${id}`)),

    bulkSoftDelete: (examIds: string[]) => unwrap(apiClient.delete('/admin/ielts/exams/bulk', { data: { examIds } })),

    restore: (id: string) => unwrap(apiClient.post(`/admin/ielts/exams/${id}/restore`)),

    bulkRestore: (examIds: string[]) => unwrap(apiClient.post('/admin/ielts/exams/bulk/restore', { examIds })),
};

// ────────────────────────────────────────────────────────────────
// USER API  —  /ielts/exams
// ────────────────────────────────────────────────────────────────

export const userExamAPI = {
    getAll: (filters?: UserExamFilters) => unwrap<ExamListResponse>(apiClient.get('/ielts/exams', { params: cleanParams(filters as unknown as Record<string, unknown>) })),

    getById: (id: string) => unwrap<IELTSExam>(apiClient.get(`/ielts/exams/${id}`)),

    getStatistics: (id: string) => unwrap(apiClient.get(`/ielts/exams/${id}/statistics`)),
};

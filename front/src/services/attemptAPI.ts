import apiClient, { cleanParams, unwrap } from './apiClient';
import { AdminStats, AdminUpdateAttemptDto, AllAttemptsParams, AttemptListResponse, AuditLogEntry, AutoSaveData, BulkDeleteDto, ChangeHistoryEntry, GradeSpeakingDto, GradeWritingDto, IELTSExamAttempt, SpeakingRecordingData, SubmitListeningSectionDto, SubmitReadingSectionDto, SubmitSpeakingSectionDto, SubmitWritingSectionDto } from '@/types/attempt.types';

export const attemptAPI = {
    /** Start a new attempt */
    start: (examId: string) => unwrap<IELTSExamAttempt>(apiClient.post(`/ielts/attempts/start/${examId}`)),

    /** Get current IN_PROGRESS attempt (null if none) */
    getActive: (examId: string) => unwrap<(IELTSExamAttempt & { remainingSeconds: number }) | null>(apiClient.get(`/ielts/attempts/active/${examId}`)),

    /** Silent auto-save */
    autoSave: (attemptId: string, data: AutoSaveData) => unwrap<{ saved: boolean; timestamp: string }>(apiClient.post(`/ielts/attempts/${attemptId}/autosave`, data)),

    /** Force expire (timer ran out on frontend) */
    forceExpire: (attemptId: string) => unwrap<{ expired: boolean }>(apiClient.post(`/ielts/attempts/${attemptId}/expire`)),

    /** Save speaking recording URL after Firebase upload */
    saveSpeakingRecording: (attemptId: string, data: SpeakingRecordingData) => unwrap<{ saved: boolean }>(apiClient.post(`/ielts/attempts/${attemptId}/speaking/recording`, data)),

    /** Submit reading section (auto-graded) */
    submitReading: (attemptId: string, data: SubmitReadingSectionDto) => unwrap<IELTSExamAttempt>(apiClient.post(`/ielts/attempts/${attemptId}/reading`, data)),

    /** Submit listening section (auto-graded) */
    submitListening: (attemptId: string, data: SubmitListeningSectionDto) => unwrap<IELTSExamAttempt>(apiClient.post(`/ielts/attempts/${attemptId}/listening`, data)),

    /** Submit writing section (manual grading queue) */
    submitWriting: (attemptId: string, data: SubmitWritingSectionDto) => unwrap<IELTSExamAttempt>(apiClient.post(`/ielts/attempts/${attemptId}/writing`, data)),

    /** Submit speaking section (manual grading queue) */
    submitSpeaking: (attemptId: string, data: SubmitSpeakingSectionDto) => unwrap<IELTSExamAttempt>(apiClient.post(`/ielts/attempts/${attemptId}/speaking`, data)),

    /** Get single attempt for current user */
    getById: (attemptId: string) => unwrap<IELTSExamAttempt>(apiClient.get(`/ielts/attempts/${attemptId}`)),

    /** Get attempt history for a specific exam */
    getUserExamAttempts: (examId: string) => unwrap<IELTSExamAttempt[]>(apiClient.get(`/ielts/attempts/exam/${examId}/history`)),

    /** Get all own attempts (paginated) */
    getAll: (params?: AllAttemptsParams) => unwrap<AttemptListResponse>(apiClient.get('/ielts/attempts', { params })),
};

export const adminAttemptAPI = {
    /** GET  /admin/ielts/attempts/stats */
    getStats: () => unwrap<AdminStats>(apiClient.get('/admin/ielts/attempts/stats')),

    /** GET  /admin/ielts/attempts  (paginated + filtered) */
    getAll: (params?: AllAttemptsParams) => unwrap<AttemptListResponse>(apiClient.get('/admin/ielts/attempts', { params: cleanParams(params as Record<string, unknown> | undefined) })),

    /** GET  /admin/ielts/attempts/exam/:examId */
    getByExam: (examId: string, params?: AllAttemptsParams) => unwrap<AttemptListResponse>(apiClient.get(`/admin/ielts/attempts/exam/${examId}`, { params: cleanParams(params as Record<string, unknown> | undefined) })),

    /** GET  /admin/ielts/attempts/user/:userId */
    getByUser: (userId: string, params?: AllAttemptsParams) => unwrap<AttemptListResponse>(apiClient.get(`/admin/ielts/attempts/user/${userId}`, { params: cleanParams(params as Record<string, unknown> | undefined) })),

    /** GET  /admin/ielts/attempts/:attemptId */
    getById: (attemptId: string) => unwrap<IELTSExamAttempt>(apiClient.get(`/admin/ielts/attempts/${attemptId}`)),

    /** GET  /admin/ielts/attempts/:attemptId/audit-log */
    getAuditLog: (attemptId: string) => unwrap<AuditLogEntry[]>(apiClient.get(`/admin/ielts/attempts/${attemptId}/audit-log`)),

    /** GET  /admin/ielts/attempts/:attemptId/change-history */
    getChangeHistory: (attemptId: string) => unwrap<ChangeHistoryEntry[]>(apiClient.get(`/admin/ielts/attempts/${attemptId}/change-history`)),

    /** PUT  /admin/ielts/attempts/:attemptId */
    update: (attemptId: string, data: AdminUpdateAttemptDto) => unwrap<IELTSExamAttempt>(apiClient.put(`/admin/ielts/attempts/${attemptId}`, data)),

    /** Admin create fallback: backendda admin POST create yo'q, mavjud start endpoint ishlatiladi */
    create: (examId: string) => unwrap<IELTSExamAttempt>(apiClient.post(`/ielts/attempts/start/${examId}`)),

    /** POST /admin/ielts/attempts/:attemptId/grade/writing */
    gradeWriting: (attemptId: string, data: GradeWritingDto) => unwrap<IELTSExamAttempt>(apiClient.post(`/admin/ielts/attempts/${attemptId}/grade/writing`, data)),

    /** POST /admin/ielts/attempts/:attemptId/grade/speaking */
    gradeSpeaking: (attemptId: string, data: GradeSpeakingDto) => unwrap<IELTSExamAttempt>(apiClient.post(`/admin/ielts/attempts/${attemptId}/grade/speaking`, data)),

    /** DELETE /admin/ielts/attempts/:attemptId  (soft delete) */
    softDelete: (attemptId: string, reason?: string) => unwrap<void>(apiClient.delete(`/admin/ielts/attempts/${attemptId}`, { data: { reason } })),

    /** DELETE /admin/ielts/attempts/bulk  (bulk soft delete) */
    bulkDelete: (dto: BulkDeleteDto) => unwrap<{ succeeded: number; failed: Array<{ id: string; reason: string }> }>(apiClient.delete('/admin/ielts/attempts/bulk', { data: dto })),

    /** POST   /admin/ielts/attempts/:attemptId/restore */
    restore: (attemptId: string, reason?: string) => unwrap<IELTSExamAttempt>(apiClient.post(`/admin/ielts/attempts/${attemptId}/restore`, { reason })),

    /** POST   /admin/ielts/attempts/bulk/restore */
    bulkRestore: (attemptIds: string[], reason?: string) => unwrap<{ succeeded: number; failed: Array<{ id: string; reason: string }> }>(apiClient.post('/admin/ielts/attempts/bulk/restore', { attemptIds, reason })),

    /** DELETE /admin/ielts/attempts/:attemptId/permanent  (hard delete, 204) */
    hardDelete: (attemptId: string) => unwrap<void>(apiClient.delete(`/admin/ielts/attempts/${attemptId}/permanent`)),
};

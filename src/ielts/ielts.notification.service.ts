// ielts/ielts.notification.service.ts
import { Injectable, Logger } from '@nestjs/common';

export interface NotificationPayload {
    userId: string;
    attemptId: string;
    examId?: string;
    bandScore?: number;
    message?: string;
    meta?: Record<string, any>;
}

@Injectable()
export class IELTSNotificationService {
    private readonly logger = new Logger(IELTSNotificationService.name);

    // ── Attempt lifecycle ─────────────────────────────────────

    async notifyExamStarted(payload: NotificationPayload): Promise<void> {
        await this.send('EXAM_STARTED', payload);
    }

    async notifyExamExpired(payload: NotificationPayload): Promise<void> {
        await this.send('EXAM_EXPIRED', payload);
    }

    async notifyWritingGraded(attemptId: string, userId: string): Promise<void> {
        await this.send('WRITING_GRADED', { attemptId, userId });
    }

    async notifySpeakingGraded(attemptId: string, userId: string): Promise<void> {
        await this.send('SPEAKING_GRADED', { attemptId, userId });
    }

    async notifyFullyGraded(attemptId: string, userId: string, bandScore: number): Promise<void> {
        await this.send('FULLY_GRADED', { attemptId, userId, bandScore });
    }

    async notifyResultAvailable(payload: NotificationPayload): Promise<void> {
        await this.send('RESULT_AVAILABLE', payload);
    }

    // ── Admin notifications ───────────────────────────────────

    async notifyAdminNewAttempt(payload: NotificationPayload): Promise<void> {
        await this.send('ADMIN_NEW_ATTEMPT', payload);
    }

    async notifyAdminGradingRequired(attemptId: string, examId: string, sections: string[]): Promise<void> {
        await this.send('GRADING_REQUIRED', { attemptId, examId, sections });
    }

    // ── Private dispatcher ────────────────────────────────────

    private async send(event: string, data: Record<string, any>): Promise<void> {
        try {
            // TODO: Replace with real transport (Firebase FCM, WebSocket, Email, SMS, etc.)
            this.logger.log(`[NOTIFY] ${event} → ${JSON.stringify(data)}`);
        } catch (err) {
            this.logger.error(`Notification error [${event}]: ${err.message}`);
        }
    }
}

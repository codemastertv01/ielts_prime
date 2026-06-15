// attempts/ielts.notification.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { IELTSEmailService, IELTSResultEmailPayload } from './ielts.email.service';

export interface NotificationPayload {
    userId: string;
    userEmail: string;
    userName: string;
    attemptId: string;
    examId?: string;
    examTitle?: string;
    bandScore?: number;
    meta?: Record<string, any>;
}

@Injectable()
export class IELTSNotificationService {
    private readonly logger = new Logger(IELTSNotificationService.name);

    constructor(private readonly emailService: IELTSEmailService) {}

    // ── Attempt lifecycle ─────────────────────────────────────

    async notifyExamStarted(payload: NotificationPayload): Promise<void> {
        this.logger.log(`[NOTIFY] EXAM_STARTED → user=${payload.userId} attempt=${payload.attemptId}`);
        // TODO: WebSocket / push notification
    }

    async notifyExamExpired(payload: NotificationPayload): Promise<void> {
        this.logger.log(`[NOTIFY] EXAM_EXPIRED → user=${payload.userId} attempt=${payload.attemptId}`);
    }

    /**
     * Writing baholandi — agar speaking ham tayyor bo'lsa to'liq natija emaili yuboriladi.
     * Aks holda faqat log qoladi.
     */
    async notifyWritingGraded(attemptId: string, userId: string): Promise<void> {
        this.logger.log(`[NOTIFY] WRITING_GRADED → user=${userId} attempt=${attemptId}`);
    }

    async notifySpeakingGraded(attemptId: string, userId: string): Promise<void> {
        this.logger.log(`[NOTIFY] SPEAKING_GRADED → user=${userId} attempt=${attemptId}`);
    }

    /**
     * Barcha sectionlar baholandi — to'liq natija emaili yuboriladi.
     * resultUrl: frontend dagi natija sahifasi (masalan: https://platform.uz/results/:attemptId)
     */
    async notifyFullyGraded(attemptId: string, userId: string, bandScore: number, emailPayload?: IELTSResultEmailPayload): Promise<void> {
        this.logger.log(`[NOTIFY] FULLY_GRADED → user=${userId} attempt=${attemptId} band=${bandScore}`);

        if (emailPayload) {
            await this.emailService.sendResultEmail(emailPayload);
        }
    }

    /**
     * Foydalanuvchiga writing/speaking topshirilganligi haqida email.
     */
    async notifyGradingStarted(payload: { userEmail: string; userName: string; examTitle: string; sectionsToGrade: string[]; expectedDays?: number }): Promise<void> {
        this.logger.log(`[NOTIFY] GRADING_STARTED → user=${payload.userEmail}`);
        await this.emailService.sendGradingStartedEmail({
            ...payload,
            expectedDays: payload.expectedDays ?? 2,
        });
    }

    /**
     * Adminlarga baholash kerakligi haqida xabar.
     */
    async notifyAdminGradingRequired(payload: { adminEmail: string; adminName: string; attemptId: string; examTitle: string; userName: string; userEmail: string; sectionsToGrade: string[]; submittedAt: Date; resultUrl: string }): Promise<void> {
        this.logger.log(`[NOTIFY] GRADING_REQUIRED → admin=${payload.adminEmail} attempt=${payload.attemptId}`);
        await this.emailService.sendGradingRequiredEmail(payload);
    }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';

import { IELTSExamAttempt, IELTSExamAttemptDocument } from '../attempts/schemas/ielts.attempts.schema';
import { EntityStatus } from '../dto/entity-status.dto';
import { IELTSExam, IELTSExamDocument } from './schemas/ielts.schema';

@Injectable()
export class IELTSCronService {
    private readonly logger = new Logger(IELTSCronService.name);

    constructor(
        @InjectModel(IELTSExamAttempt.name)
        private readonly attemptModel: Model<IELTSExamAttemptDocument>,

        @InjectModel(IELTSExam.name)
        private readonly examModel: Model<IELTSExamDocument>
    ) {}

    // ── Every 5 minutes: expire stale in-progress attempts ────

    @Cron(CronExpression.EVERY_5_MINUTES)
    async expireStaleAttempts(): Promise<void> {
        try {
            const result = await this.attemptModel.updateMany(
                {
                    status: EntityStatus.IN_PROGRESS,
                    isDeleted: false,
                    expiresAt: { $lt: new Date() },
                },
                {
                    $set: { status: EntityStatus.EXPIRED },
                    $push: {
                        auditLog: {
                            action: 'AUTO_EXPIRED',
                            performedBy: 'system',
                            performedByRole: 'system',
                            timestamp: new Date(),
                            note: 'Cron: 5min — muddati tugadi',
                        },
                    },
                }
            );

            if (result.modifiedCount > 0) {
                this.logger.log(`Cron: ${result.modifiedCount} ta attempt expired qilindi`);
            }
        } catch (err) {
            this.logger.error(`Cron expireStaleAttempts xatosi: ${err.message}`);
        }
    }

    // ── Every day 3AM: hard-delete exams soft-deleted 30+ days ago ─

    @Cron('0 3 * * *')
    async cleanupOldDeletedExams(): Promise<void> {
        try {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - 30);

            const result = await this.examModel.deleteMany({
                isDeleted: true,
                updatedAt: { $lt: cutoff },
            });

            if (result.deletedCount > 0) {
                this.logger.log(`Cron: ${result.deletedCount} ta eski exam hard delete qilindi`);
            }
        } catch (err) {
            this.logger.error(`Cron cleanupOldDeletedExams xatosi: ${err.message}`);
        }
    }

    // ── Every day 4AM: hard-delete attempts soft-deleted 30+ days ago ─

    @Cron('0 4 * * *')
    async cleanupOldDeletedAttempts(): Promise<void> {
        try {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - 30);

            const result = await this.attemptModel.deleteMany({
                isDeleted: true,
                deletedAt: { $lt: cutoff },
            });

            if (result.deletedCount > 0) {
                this.logger.log(`Cron: ${result.deletedCount} ta eski attempt hard delete qilindi`);
            }
        } catch (err) {
            this.logger.error(`Cron cleanupOldDeletedAttempts xatosi: ${err.message}`);
        }
    }

    // ── Every hour: recalculate exam statistics from attempts ──

    @Cron(CronExpression.EVERY_HOUR)
    async recalculateExamStatistics(): Promise<void> {
        try {
            const exams = await this.examModel.find({ isDeleted: false, isPublished: true }).select('_id').lean().exec();

            let updated = 0;

            for (const exam of exams) {
                const examId = (exam as any)._id;

                const [totalAttempts, completedAttempts, ratingStats] = await Promise.all([
                    this.attemptModel.countDocuments({
                        examId,
                        isDeleted: false,
                    }),
                    this.attemptModel.countDocuments({
                        examId,
                        isDeleted: false,
                        status: EntityStatus.GRADED,
                    }),
                    this.attemptModel.aggregate([
                        {
                            $match: {
                                examId,
                                isDeleted: false,
                                userRating: { $exists: true, $ne: null },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                avg: { $avg: '$userRating' },
                                count: { $sum: 1 },
                            },
                        },
                    ]),
                ]);

                const averageRating = ratingStats[0]?.avg ? Math.round(ratingStats[0].avg * 10) / 10 : 0;
                const totalRatings = ratingStats[0]?.count ?? 0;

                await this.examModel.updateOne(
                    { _id: examId },
                    {
                        $set: {
                            totalAttempts,
                            completedAttempts,
                            averageRating,
                            totalRatings,
                        },
                    }
                );

                updated++;
            }

            this.logger.log(`Cron: ${updated} ta exam statistikasi yangilandi`);
        } catch (err) {
            this.logger.error(`Cron recalculateExamStatistics xatosi: ${err.message}`);
        }
    }

    // ── Every day midnight: auto-activate/deactivate by schedule ─

    @Cron(CronExpression.EVERY_HOUR)
    async syncExamAvailability(): Promise<void> {
        try {
            const now = new Date();

            // Activate exams whose availableFrom <= now and still PENDING/INACTIVE
            const activated = await this.examModel.updateMany(
                {
                    isDeleted: false,
                    isPublished: true,
                    status: { $in: [EntityStatus.PENDING, EntityStatus.INACTIVE] },
                    availableFrom: { $lte: now },
                    $or: [{ availableUntil: null }, { availableUntil: { $gt: now } }],
                },
                { $set: { status: EntityStatus.ACTIVE } }
            );

            // Deactivate exams whose availableUntil < now
            const deactivated = await this.examModel.updateMany(
                {
                    isDeleted: false,
                    isPublished: true,
                    status: EntityStatus.ACTIVE,
                    availableUntil: { $lt: now },
                },
                { $set: { status: EntityStatus.INACTIVE } }
            );

            if (activated.modifiedCount || deactivated.modifiedCount) {
                this.logger.log(`Cron availability sync: ` + `${activated.modifiedCount} faollashtirildi, ` + `${deactivated.modifiedCount} o'chirildi`);
            }
        } catch (err) {
            this.logger.error(`Cron syncExamAvailability xatosi: ${err.message}`);
        }
    }
}

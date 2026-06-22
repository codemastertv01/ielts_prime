// attempts/ielts.attempts.service.ts
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { IELTSExamAttempt, IELTSExamAttemptDocument } from './schemas/ielts.attempts.schema';

import { AdminStats, AttemptDoc, BulkOperationResult, EXAM_FIELDS_FULL, EXAM_FIELDS_SHORT, PaginatedAttempts, USER_FIELDS_FULL, USER_HIDDEN_FIELDS, VALID_BAND_SCORES } from './dto/enums';
import { GetAttemptsQueryDto } from './dto/get-attempts-query.dto';
import { AdminUpdateAttemptDto, GradeSpeakingDto, GradeWritingDto } from './dto/grading.dto';

import { BulkDeleteDto } from '../dto/bulk-delete.dto';
import { EntityStatus } from '../dto/entity-status.dto';
import type { MetadataInfo } from '../dto/metadata-info.dto';

@Injectable()
export class IELTSExamAttemptsAdminService {
    private readonly logger = new Logger(IELTSExamAttemptsAdminService.name);

    constructor(
        @InjectModel(IELTSExamAttempt.name)
        private readonly attemptModel: Model<IELTSExamAttemptDocument>
    ) {}

    // ════════════════════════════════════════════════════════
    // WRITING BAHOLASH (Admin/Teacher)
    // Kiradi: attemptId, GradeWritingDto, graderId, metadata
    // Chiqadi: baholangan attempt
    // Band = (4 kriter yig'indisi) / 4 → 0.5 ga yaxlitlash
    // ════════════════════════════════════════════════════════

    async gradeWriting(attemptId: string, dto: GradeWritingDto, graderId: string, metadata: MetadataInfo): Promise<IELTSExamAttemptDocument> {
        const d = await this.requireDoc(attemptId);

        const wa = d.writingAnswers.find((a: any) => a.taskNumber === dto.taskNumber);
        if (!wa) throw new NotFoundException(`Writing task ${dto.taskNumber} topilmadi`);

        this.validateBandScore(dto.taskAchievement, 'taskAchievement');
        this.validateBandScore(dto.coherenceCohesion, 'coherenceCohesion');
        this.validateBandScore(dto.lexicalResource, 'lexicalResource');
        this.validateBandScore(dto.grammaticalRange, 'grammaticalRange');

        const prev = wa.bandScore;
        const newBand = this.roundBand((dto.taskAchievement + dto.coherenceCohesion + dto.lexicalResource + dto.grammaticalRange) / 4);

        wa.bandScore = newBand;
        wa.criteriaScores = {
            taskAchievement: dto.taskAchievement,
            coherenceCohesion: dto.coherenceCohesion,
            lexicalResource: dto.lexicalResource,
            grammaticalRange: dto.grammaticalRange,
        };
        wa.feedback = dto.feedback ?? undefined;
        wa.aiFeedback = dto.aiFeedback ?? undefined;
        wa.gradedBy = new Types.ObjectId(graderId);
        wa.gradedAt = new Date();
        wa.isHumanGraded = true;

        if (prev !== newBand) {
            this.pushChange(d, {
                field: `writingAnswers.task${dto.taskNumber}.bandScore`,
                previousValue: prev,
                newValue: newBand,
                changedBy: graderId,
                changedAt: new Date(),
                reason: `Writing Task ${dto.taskNumber} baholandi`,
            });
        }

        // Barcha writing tasklari baholangan bo'lsa writingBandScore hisoblanadi
        const allDone = d.writingAnswers.every((a: any) => a.bandScore != null);
        if (allDone) {
            d.writingBandScore = this.roundBand(d.writingAnswers.reduce((s: number, a: any) => s + a.bandScore, 0) / d.writingAnswers.length);
        }

        this.pushAudit(d, {
            action: 'WRITING_GRADED',
            performedBy: graderId,
            performedByRole: 'admin',
            timestamp: new Date(),
            note: `Task ${dto.taskNumber} → Band ${newBand}`,
            newValue: wa.criteriaScores,
        });

        this.finalizeIfFullyGraded(d);
        d.updatedBy.push(metadata);
        const saved = await d.save();
        this.logger.log(`Writing baholandi: attempt=${attemptId} task=${dto.taskNumber} band=${newBand}`);
        return saved;
    }

    // ════════════════════════════════════════════════════════
    // SPEAKING BAHOLASH (Admin/Teacher)
    // Kiradi: attemptId, GradeSpeakingDto, graderId, metadata
    // Chiqadi: baholangan attempt
    // ════════════════════════════════════════════════════════

    async gradeSpeaking(attemptId: string, dto: GradeSpeakingDto, graderId: string, metadata: MetadataInfo): Promise<IELTSExamAttemptDocument> {
        const d = await this.requireDoc(attemptId);

        const sa = d.speakingAnswers.find((a: any) => a.partNumber === dto.partNumber);
        if (!sa) throw new NotFoundException(`Speaking part ${dto.partNumber} topilmadi`);

        this.validateBandScore(dto.fluencyCoherence, 'fluencyCoherence');
        this.validateBandScore(dto.lexicalResource, 'lexicalResource');
        this.validateBandScore(dto.grammaticalRange, 'grammaticalRange');
        this.validateBandScore(dto.pronunciation, 'pronunciation');

        const prev = sa.bandScore;
        const newBand = this.roundBand((dto.fluencyCoherence + dto.lexicalResource + dto.grammaticalRange + dto.pronunciation) / 4);

        sa.bandScore = newBand;
        sa.criteriaScores = {
            fluencyCoherence: dto.fluencyCoherence,
            lexicalResource: dto.lexicalResource,
            grammaticalRange: dto.grammaticalRange,
            pronunciation: dto.pronunciation,
        };
        sa.transcript = dto.transcript ?? undefined;
        sa.feedback = dto.feedback ?? undefined;
        sa.aiFeedback = dto.aiFeedback ?? undefined;
        sa.gradedBy = new Types.ObjectId(graderId);
        sa.gradedAt = new Date();
        sa.isHumanGraded = true;

        if (prev !== newBand) {
            this.pushChange(d, {
                field: `speakingAnswers.part${dto.partNumber}.bandScore`,
                previousValue: prev,
                newValue: newBand,
                changedBy: graderId,
                changedAt: new Date(),
                reason: `Speaking Part ${dto.partNumber} baholandi`,
            });
        }

        const allDone = d.speakingAnswers.every((a: any) => a.bandScore != null);
        if (allDone) {
            d.speakingBandScore = this.roundBand(d.speakingAnswers.reduce((s: number, a: any) => s + a.bandScore, 0) / d.speakingAnswers.length);
        }

        this.pushAudit(d, {
            action: 'SPEAKING_GRADED',
            performedBy: graderId,
            performedByRole: 'admin',
            timestamp: new Date(),
            note: `Part ${dto.partNumber} → Band ${newBand}`,
            newValue: sa.criteriaScores,
        });

        this.finalizeIfFullyGraded(d);
        d.updatedBy.push(metadata);
        const saved = await d.save();
        this.logger.log(`Speaking baholandi: attempt=${attemptId} part=${dto.partNumber} band=${newBand}`);
        return saved;
    }

    // ════════════════════════════════════════════════════════
    // ADMIN UPDATE
    // Kiradi: attemptId, AdminUpdateAttemptDto, adminId, metadata
    // Chiqadi: yangilangan attempt
    // ════════════════════════════════════════════════════════

    async adminUpdateAttempt(attemptId: string, dto: AdminUpdateAttemptDto, adminId: string, metadata: MetadataInfo): Promise<IELTSExamAttemptDocument> {
        const d = await this.requireDoc(attemptId);
        const auditDetails: string[] = [];

        if (dto.status && dto.status !== d.status) {
            this.pushChange(d, {
                field: 'status',
                previousValue: d.status,
                newValue: dto.status,
                changedBy: adminId,
                changedAt: new Date(),
                reason: dto.adminNote,
            });

            auditDetails.push(`status: ${d.status} → ${dto.status}`);
            d.status = dto.status;
        }

        const bandFields = ['overallBandScore', 'readingBandScore', 'listeningBandScore', 'writingBandScore', 'speakingBandScore'] as const;

        let bandUpdated = false;
        for (const field of bandFields) {
            const val = dto[field];
            if (val !== undefined && val !== d[field]) {
                this.validateBandScore(val, field);
                this.pushChange(d, {
                    field,
                    previousValue: d[field],
                    newValue: val,
                    changedBy: adminId,
                    changedAt: new Date(),
                    reason: dto.adminNote,
                });
                auditDetails.push(`${field}: ${d[field]} → ${val}`);
                d[field] = val;
                bandUpdated = true;
            }
        }

        if (bandUpdated) this.calcOverallBand(d);

        if (dto.tags !== undefined) d.tags = dto.tags;
        if (dto.generalFeedback !== undefined) d.generalFeedback = dto.generalFeedback;
        if (dto.reviewNote) d.reviewNote = dto.reviewNote;

        if (dto.isReviewed !== undefined) {
            d.isReviewed = dto.isReviewed;
            if (dto.isReviewed) {
                d.reviewedBy = adminId;
                d.reviewedAt = new Date();
            }
        }

        if (dto.adminNote) {
            if (!Array.isArray(d.adminNotes)) d.adminNotes = [];
            d.adminNotes.push({ note: dto.adminNote, addedBy: adminId, addedAt: new Date() });
        }

        this.pushAudit(d, {
            action: 'ADMIN_UPDATE',
            performedBy: adminId,
            performedByRole: 'admin',
            timestamp: new Date(),
            note: auditDetails.join(' | ') || 'meta update',
        });
        d.updatedBy.push(metadata);
        const saved = await d.save();
        this.logger.log(`Admin update: attempt=${attemptId} changes=[${auditDetails.join(', ')}]`);
        return saved;
    }

    // ════════════════════════════════════════════════════════
    // READ — ADMIN
    // ════════════════════════════════════════════════════════

    /**
     * Admin uchun bitta attempt — barcha fieldlar (audit, adminNotes va boshqalar)
     * Kiradi: attemptId
     * Chiqadi: to'liq attempt (populate bilan)
     */
    async getAttemptForAdmin(attemptId: string): Promise<IELTSExamAttemptDocument> {
        this.assertValidId(attemptId, 'Attempt');
        const doc = await this.attemptModel.findById(new Types.ObjectId(attemptId)).populate('examId', EXAM_FIELDS_FULL).populate('userId', USER_FIELDS_FULL).exec();
        if (!doc) throw new NotFoundException('Attempt topilmadi');
        return doc;
    }

    async getAllAttemptsAdmin(query: GetAttemptsQueryDto): Promise<PaginatedAttempts> {
        const { page = 1, limit = 20, status, examId, userId, isDeleted, isReviewed, q, attemptNumber, sortBy = 'createdAt', sortOrder = 'desc', createdFrom, createdTo, submittedFrom, submittedTo, minOverallBand, maxOverallBand, minReadingBand, maxReadingBand, minListeningBand, maxListeningBand, minWritingBand, maxWritingBand, minSpeakingBand, maxSpeakingBand } = query;

        const filter: FilterQuery<IELTSExamAttemptDocument> = {};

        if (status) filter.status = status;
        if (isDeleted) filter.isDeleted = isDeleted;
        if (isReviewed !== undefined) filter.isReviewed = isReviewed;

        if (examId) {
            this.assertValidId(examId, 'Exam');
            filter.examId = new Types.ObjectId(examId);
        }
        if (userId) {
            this.assertValidId(userId, 'User');
            filter.userId = new Types.ObjectId(userId);
        }
        if (attemptNumber) filter.attemptNumber = attemptNumber;

        // Date ranges
        if (createdFrom || createdTo) {
            filter.createdAt = {};
            if (createdFrom) filter.createdAt.$gte = new Date(`${createdFrom}T00:00:00`);
            if (createdTo) filter.createdAt.$lte = new Date(`${createdTo}T23:59:59`);
        }
        if (submittedFrom || submittedTo) {
            filter.submittedAt = {};
            if (submittedFrom) filter.submittedAt.$gte = new Date(`${submittedFrom}T00:00:00`);
            if (submittedTo) filter.submittedAt.$lte = new Date(`${submittedTo}T23:59:59`);
        }

        // Band score ranges
        const bandRange = (min?: number, max?: number) => {
            if (min == null && max == null) return undefined;
            const r: any = {};
            if (min != null) r.$gte = min;
            if (max != null) r.$lte = max;
            return r;
        };
        const overallRange = bandRange(minOverallBand, maxOverallBand);
        if (overallRange) filter.overallBandScore = overallRange;
        const readingRange = bandRange(minReadingBand, maxReadingBand);
        if (readingRange) filter.readingBandScore = readingRange;
        const listeningRange = bandRange(minListeningBand, maxListeningBand);
        if (listeningRange) filter.listeningBandScore = listeningRange;
        const writingRange = bandRange(minWritingBand, maxWritingBand);
        if (writingRange) filter.writingBandScore = writingRange;
        const speakingRange = bandRange(minSpeakingBand, maxSpeakingBand);
        if (speakingRange) filter.speakingBandScore = speakingRange;

        return this.paginate(filter, page, limit, EXAM_FIELDS_SHORT, USER_FIELDS_FULL, true, sortBy, sortOrder, q);
    }

    async getUserAttemptsAdmin(userId: string, query: GetAttemptsQueryDto): Promise<PaginatedAttempts> {
        this.assertValidId(userId, 'User');
        return this.getAllAttemptsAdmin({ ...query, userId });
    }

    async getExamAttemptsAdmin(examId: string, query: GetAttemptsQueryDto): Promise<PaginatedAttempts> {
        this.assertValidId(examId, 'Exam');
        return this.getAllAttemptsAdmin({ ...query, examId });
    }

    // ════════════════════════════════════════════════════════
    // AUDIT / HISTORY
    // ════════════════════════════════════════════════════════

    async getAuditLog(attemptId: string): Promise<any[]> {
        this.assertValidId(attemptId, 'Attempt');
        const doc = await this.attemptModel.findById(new Types.ObjectId(attemptId)).select('+auditLog').lean().exec();
        if (!doc) throw new NotFoundException('Attempt topilmadi');
        return [...((doc as any).auditLog ?? [])].reverse();
    }

    async getChangeHistory(attemptId: string): Promise<any[]> {
        this.assertValidId(attemptId, 'Attempt');
        const doc = await this.attemptModel.findById(new Types.ObjectId(attemptId)).select('+changeHistory').lean().exec();
        if (!doc) throw new NotFoundException('Attempt topilmadi');
        return [...((doc as any).changeHistory ?? [])].reverse();
    }

    // ════════════════════════════════════════════════════════
    // SOFT DELETE / RESTORE
    // ════════════════════════════════════════════════════════

    async softDeleteAttempt(attemptId: string, reason?: string, metadata?: MetadataInfo): Promise<void> {
        const d = await this.requireDoc(attemptId);
        if (d.isDeleted) throw new BadRequestException("Attempt allaqachon o'chirilgan");
        if (!metadata) throw new BadRequestException('Metadata topilmadi');
        d.isDeleted = true;
        d.deletedAt = new Date();
        d.deletedBy.push(metadata);
        d.deleteReason = (reason ?? null) as any;
        d.updatedBy.push(metadata);

        this.pushAudit(d, {
            action: 'SOFT_DELETED',
            performedBy: metadata?.userId,
            performedByRole: 'admin',
            timestamp: new Date(),
            note: reason,
        });

        await d.save();
        this.logger.log(`Attempt o'chirildi: ${attemptId}`);
    }

    async bulkSoftDelete(dto: BulkDeleteDto, adminId: string, metadata?: MetadataInfo): Promise<BulkOperationResult> {
        const invalid = dto.ids.filter((id) => !Types.ObjectId.isValid(id));
        const validIds = dto.ids.filter((id) => Types.ObjectId.isValid(id));

        const result: BulkOperationResult = {
            succeeded: 0,
            failed: invalid.map((id) => ({ id, reason: "Noto'g'ri ID format" })),
        };

        if (validIds.length === 0) return result;

        // Mutation DAN OLDIN barcha documentlarni bitta query bilan olish
        const existingDocs = await this.attemptModel
            .find({ _id: { $in: validIds } })
            .select('_id isDeleted')
            .lean()
            .exec();

        const foundSet = new Set(existingDocs.map((d: any) => d._id.toString()));
        result.failed.push(...validIds.filter((id) => !foundSet.has(id)).map((id) => ({ id, reason: 'Topilmadi' })));

        const deletableIds = existingDocs.filter((d: any) => !d.isDeleted).map((d: any) => d._id.toString());
        result.failed.push(...(existingDocs as any[]).filter((d) => d.isDeleted).map((d) => ({ id: d._id.toString(), reason: "Allaqachon o'chirilgan" })));

        if (deletableIds.length > 0) {
            const now = new Date();
            const res = await this.attemptModel.updateMany(
                { _id: { $in: deletableIds } },
                {
                    $set: {
                        isDeleted: true,
                        deletedAt: now,
                        deletedBy: metadata?.userId,
                        deleteReason: (dto.reason ?? null) as any,
                    },

                    $push: {
                        updatedBy: metadata,
                        auditLog: {
                            action: 'SOFT_DELETED',
                            performedBy: adminId,
                            performedByRole: 'admin',
                            timestamp: now,
                            note: dto.reason,
                        },
                    },
                }
            );
            result.succeeded = res.modifiedCount;
        }

        this.logger.log(`Bulk delete: ${result.succeeded} ta o'chirildi, ${result.failed.length} ta xato`);
        return result;
    }

    async restoreAttempt(attemptId: string, reason?: string, metadata?: MetadataInfo): Promise<IELTSExamAttemptDocument> {
        const d = await this.requireDoc(attemptId);
        if (!d.isDeleted) throw new BadRequestException("Attempt o'chirilmagan");
        if (!metadata) throw new BadRequestException('Metadata topilmadi');
        d.isDeleted = false;
        d.restoredAt = new Date();
        d.restoredBy.push(metadata);
        d.updatedBy.push(metadata);

        this.pushAudit(d, {
            action: 'RESTORED',
            performedBy: metadata.userId,
            performedByRole: 'admin',
            timestamp: new Date(),
            note: reason,
        });

        const saved = await d.save();
        this.logger.log(`Attempt tiklandi: ${attemptId}`);
        return saved;
    }

    async bulkRestore(attemptIds: string[], adminId: string, metadata?: MetadataInfo): Promise<BulkOperationResult> {
        const invalid = attemptIds.filter((id) => !Types.ObjectId.isValid(id));
        const validIds = attemptIds.filter((id) => Types.ObjectId.isValid(id));

        const result: BulkOperationResult = {
            succeeded: 0,
            failed: invalid.map((id) => ({ id, reason: "Noto'g'ri ID format" })),
        };

        if (validIds.length === 0) return result;

        const existingDocs = await this.attemptModel
            .find({ _id: { $in: validIds } })
            .select('_id isDeleted')
            .lean()
            .exec();

        const foundSet = new Set(existingDocs.map((d: any) => d._id.toString()));
        result.failed.push(...validIds.filter((id) => !foundSet.has(id)).map((id) => ({ id, reason: 'Topilmadi' })));

        const restorableIds = (existingDocs as any[]).filter((d) => d.isDeleted).map((d) => d._id.toString());
        result.failed.push(...(existingDocs as any[]).filter((d) => !d.isDeleted).map((d) => ({ id: d._id.toString(), reason: "O'chirilmagan" })));

        if (restorableIds.length > 0) {
            const now = new Date();
            const res = await this.attemptModel.updateMany(
                { _id: { $in: restorableIds } },
                {
                    $set: {
                        isDeleted: false,
                        restoredAt: now,
                        restoredBy: adminId,
                    },
                    $push: {
                        updatedBy: metadata,
                        auditLog: {
                            action: 'RESTORED',
                            performedBy: adminId,
                            performedByRole: 'admin',
                            timestamp: now,
                            note: 'Bulk restore',
                        },
                    },
                }
            );
            result.succeeded = res.modifiedCount;
        }

        this.logger.log(`Bulk restore: ${result.succeeded} ta tiklandi, ${result.failed.length} ta xato`);
        return result;
    }

    async hardDeleteAttempt(attemptId: string, adminId: string): Promise<void> {
        this.assertValidId(attemptId, 'Attempt');
        const doc = await this.attemptModel.findById(new Types.ObjectId(attemptId)).exec();
        if (!doc) throw new NotFoundException('Attempt topilmadi');
        if (!doc.isDeleted) {
            throw new BadRequestException('Hard delete uchun avval soft-delete qilish kerak');
        }

        this.logger.warn(`HARD DELETE: attempt=${attemptId} tomonidan admin=${adminId}`);
        await this.attemptModel.findByIdAndDelete(attemptId).exec();
    }

    // ════════════════════════════════════════════════════════
    // ADMIN STATISTIKA
    // ════════════════════════════════════════════════════════

    async getAdminStats(): Promise<AdminStats> {
        const activeFilter = { isDeleted: false };
        const gradedMatch = {
            ...activeFilter,
            status: EntityStatus.GRADED,
            overallBandScore: { $exists: true, $ne: null },
        };

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);

        const [total, inProgress, submitted, grading, graded, expired, deleted, avgResult, bandDist, todayAttempts, weekAttempts] = await Promise.all([this.attemptModel.countDocuments(activeFilter), this.attemptModel.countDocuments({ ...activeFilter, status: EntityStatus.IN_PROGRESS }), this.attemptModel.countDocuments({ ...activeFilter, status: EntityStatus.SUBMITTED }), this.attemptModel.countDocuments({ ...activeFilter, status: EntityStatus.GRADING }), this.attemptModel.countDocuments({ ...activeFilter, status: EntityStatus.GRADED }), this.attemptModel.countDocuments({ ...activeFilter, status: EntityStatus.EXPIRED }), this.attemptModel.countDocuments({ isDeleted: true }), this.attemptModel.aggregate([{ $match: gradedMatch }, { $group: { _id: null, avg: { $avg: '$overallBandScore' }, count: { $sum: 1 } } }]), this.attemptModel.aggregate([{ $match: gradedMatch }, { $group: { _id: { $floor: '$overallBandScore' }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]), this.attemptModel.countDocuments({ ...activeFilter, createdAt: { $gte: todayStart } }), this.attemptModel.countDocuments({ ...activeFilter, createdAt: { $gte: weekStart } })]);

        return {
            total,
            active: { inProgress, submitted, grading, graded, expired },
            deleted,
            avgBandScore: avgResult[0]?.avg ? Math.round(avgResult[0].avg * 10) / 10 : null,
            gradedCount: avgResult[0]?.count ?? 0,
            bandDistribution: bandDist.map((b: any) => ({ band: b._id, count: b.count })),
            todayAttempts,
            weekAttempts,
        };
    }

    private async requireDoc(attemptId: string): Promise<AttemptDoc> {
        this.assertValidId(attemptId, 'Attempt');
        const doc = await this.attemptModel.findById(new Types.ObjectId(attemptId)).exec();
        if (!doc) throw new NotFoundException('Attempt topilmadi');
        return doc as AttemptDoc;
    }

    /**
     * Barcha writing va speaking baholangandan keyin chaqiriladi.
     * Agar hammasi tayyor bo'lsa status GRADED ga o'tadi va email yuboriladi.
     */
    private finalizeIfFullyGraded(d: AttemptDoc): void {
        const writingDone = d.writingAnswers.length === 0 || d.writingAnswers.every((a: any) => a.bandScore != null);
        const speakingDone = d.speakingAnswers.length === 0 || d.speakingAnswers.every((a: any) => a.bandScore != null);

        if (writingDone && speakingDone) {
            d.status = EntityStatus.GRADED;
            if (!d.submittedAt) d.submittedAt = new Date();
            this.calcOverallBand(d);
            this.logger.log(`Fully graded: attempt=${d._id} overall=${d.overallBandScore}`);
        }
    }

    private calcOverallBand(d: AttemptDoc): void {
        const scores: number[] = [];
        if (d.readingBandScore != null) scores.push(d.readingBandScore);
        if (d.listeningBandScore != null) scores.push(d.listeningBandScore);
        if (d.writingBandScore != null) scores.push(d.writingBandScore);
        if (d.speakingBandScore != null) scores.push(d.speakingBandScore);

        if (scores.length) {
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            d.overallBandScore = this.roundBand(avg);
            d.percentageScore = Math.round((avg / 9) * 100);
        }
    }

    // ════════════════════════════════════════════════════════
    // PRIVATE — Audit / Change
    // ════════════════════════════════════════════════════════

    private pushAudit(
        d: AttemptDoc,
        entry: {
            action: string;
            performedBy: string;
            performedByRole: 'user' | 'admin' | 'system';
            timestamp: Date;
            note?: string;
            field?: string;
            previousValue?: any;
            newValue?: any;
        }
    ): void {
        if (!Array.isArray(d.auditLog)) d.auditLog = [];
        d.auditLog.push(entry as any);
    }

    private pushChange(
        d: AttemptDoc,
        entry: {
            field: string;
            previousValue?: any;
            newValue?: any;
            changedBy: string;
            changedAt: Date;
            reason?: string;
        }
    ): void {
        if (!Array.isArray(d.changeHistory)) d.changeHistory = [];
        d.changeHistory.push(entry as any);
    }

    // ════════════════════════════════════════════════════════
    // PRIVATE — Pagination
    // ════════════════════════════════════════════════════════

    private async paginate(filter: FilterQuery<IELTSExamAttemptDocument>, page: number, limit: number, examFields: string, userFields: string, isAdmin: boolean, sortBy = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc', q?: string): Promise<PaginatedAttempts> {
        const skip = (page - 1) * limit;
        const select = isAdmin ? '' : USER_HIDDEN_FIELDS;

        // Text search — populate dan keyin filter qilamiz chunki
        // MongoDB $text index yo'q, shuning uchun aggregate yoki post-filter
        // Eng sodda: attempt._id, attemptNumber bo'yicha filter
        if (q) {
            const qLower = q.toLowerCase();
            // ObjectId bo'lsa to'g'ridan filter
            if (Types.ObjectId.isValid(q)) {
                filter._id = new Types.ObjectId(q);
            } else if (/^\d+$/.test(q)) {
                filter.attemptNumber = Number(q);
            }
            // User/exam bo'yicha qidirish populate kerak bo'lgani uchun
            // pastda post-filter qilamiz
        }

        const sortObj: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [attempts, total] = await Promise.all([this.attemptModel.find(filter).sort(sortObj).skip(skip).limit(limit).populate('examId', examFields).populate('userId', userFields).select(select).exec(), this.attemptModel.countDocuments(filter)]);

        const totalPages = Math.ceil(total / limit);
        return { attempts, total, page, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
    }

    // ════════════════════════════════════════════════════════
    // PRIVATE — Utilities
    // ════════════════════════════════════════════════════════

    private assertValidId(id: string, label = 'ID'): void {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`Noto'g'ri ${label} format: ${id}`);
        }
    }

    /** IELTS rasmiy yaxlitlash: eng yaqin 0.5 ga */
    private roundBand(v: number): number {
        return Math.round(v * 2) / 2;
    }

    private validateBandScore(score: number, field: string): void {
        if (!VALID_BAND_SCORES.has(score)) {
            throw new BadRequestException(`Noto'g'ri band score "${field}": ${score}. ` + `Faqat 0–9, 0.5 qadam qiymatlar ruxsat etilgan.`);
        }
    }
}

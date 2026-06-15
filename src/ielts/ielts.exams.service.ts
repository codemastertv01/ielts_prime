// ielts/ielts.exams.service.ts
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, FilterQuery, Model, Types } from 'mongoose';

import { IELTSExam, IELTSExamDocument } from './schemas/ielts.schema';
import { EntityStatus } from '../dto/entity-status.dto';
import type { MetadataInfo } from '../dto/metadata-info.dto';
import { CreateIELTSExamDto } from './dto/create-exam.dto';
import { UpdateIELTSExamDto } from './dto/update-exam.dto';
import { AdminFindAllDto, UserFindAllDto } from './dto/find-all.dto';
import { ExamType } from './dto/enums';
import { ANSWER_EXCLUDE_FIELDS, EXAM_TYPE_TIMES, REQUIRED_SECTIONS_MAP } from './constants/exam.constants';

// ─── Response types ────────────────────────────────────────────────────────────

export interface PaginatedExams {
    exams: IELTSExamDocument[];
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface BulkOperationResult {
    succeeded: number;
    failed: Array<{ examId: string; reason: string }>;
}

export interface ExamStatistics {
    examId: string;
    title: string;
    examType: ExamType;
    module: string;
    difficulty: string;
    statistics: {
        totalAttempts: number;
        completedAttempts: number;
        completionRate: string;
        averageRating: number;
        totalRatings: number;
        totalQuestions: number;
        totalPoints: number;
    };
    status: {
        isPublished: boolean;
        isPremium: boolean;
        status: string;
    };
    dates: {
        createdAt: Date;
        publishedAt?: Date;
        availableFrom?: Date;
        availableUntil?: Date;
    };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function parseBool(val: any): boolean | undefined {
    if (val === true || val === 'true') return true;
    if (val === false || val === 'false') return false;
    return undefined;
}

function parseNum(val: unknown, fallback: number): number {
    if (val === 0 || val === '0') return 0;
    const n = Number(val);
    return isNaN(n) || val === '' ? fallback : n;
}

// ──────────────────────────────────────────────────────────────────────────────

@Injectable()
export class IELTSExamService {
    private readonly logger = new Logger(IELTSExamService.name);

    constructor(
        @InjectModel(IELTSExam.name)
        private readonly examModel: Model<IELTSExamDocument>
    ) {}

    // ════════════════════════════════════════════════════════
    // CREATE
    // ════════════════════════════════════════════════════════

    async create(dto: CreateIELTSExamDto, metadata: MetadataInfo, session?: ClientSession): Promise<IELTSExamDocument> {
        this.validateRequiredSections(dto);

        const readingSection = this.sanitizeReadingSection(dto.readingSection);
        const listeningSection = this.sanitizeListeningSection(dto.listeningSection);
        const writingSection = this.sanitizeWritingSection(dto.writingSection);
        const speakingSection = this.sanitizeSpeakingSection(dto.speakingSection);

        const { totalQuestions, totalPoints } = this.calculateSectionTotals({
            readingSection,
            listeningSection,
        });

        // Auto-fill totalTimeLimitMinutes if not provided or too small
        const totalTimeLimitMinutes = dto.totalTimeLimitMinutes ?? EXAM_TYPE_TIMES[dto.examType];

        const exam = new this.examModel({
            ...dto,
            totalTimeLimitMinutes,
            readingSection,
            listeningSection,
            writingSection,
            speakingSection,
            availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : null,
            availableUntil: dto.availableUntil ? new Date(dto.availableUntil) : null,
            createdBy: metadata,
            status: EntityStatus.PENDING,
            isDeleted: false,
            metadata: { totalQuestions, totalPoints, lastComputedAt: new Date() },
        });

        const saved = session ? await exam.save({ session }) : await exam.save();
        this.logger.log(`Exam created: "${saved.title}" (${saved._id})`);
        return saved;
    }

    // ════════════════════════════════════════════════════════
    // UPDATE
    // ════════════════════════════════════════════════════════

    async update(examId: string, dto: UpdateIELTSExamDto, metadata: MetadataInfo, session?: ClientSession): Promise<IELTSExamDocument> {
        this.assertValidId(examId);

        const exam = await this.examModel.findOne({ _id: examId }).exec();
        if (!exam) throw new NotFoundException(`Exam topilmadi: ${examId}`);

        if (dto.examType && exam.examType !== dto.examType && exam.totalAttempts > 0) {
            throw new BadRequestException("Exam type o'zgartirib bo'lmaydi: urinishlar mavjud");
        }

        // Sanitize updated sections
        if (dto.readingSection !== undefined) (dto as any).readingSection = this.sanitizeReadingSection(dto.readingSection);
        if (dto.listeningSection !== undefined) (dto as any).listeningSection = this.sanitizeListeningSection(dto.listeningSection);
        if (dto.writingSection !== undefined) (dto as any).writingSection = this.sanitizeWritingSection(dto.writingSection);
        if (dto.speakingSection !== undefined) (dto as any).speakingSection = this.sanitizeSpeakingSection(dto.speakingSection);

        // Parse date strings to Date objects
        if (dto.availableFrom) (dto as any).availableFrom = new Date(dto.availableFrom);
        if (dto.availableUntil) (dto as any).availableUntil = new Date(dto.availableUntil);

        Object.assign(exam, dto);

        if (!exam.updatedBy) exam.updatedBy = [];
        exam.updatedBy.push(metadata);

        // Auto-update publish status
        if (dto.isPublished === true && !exam.publishedAt) {
            exam.publishedAt = new Date();
            exam.status = EntityStatus.ACTIVE;
        } else if (dto.isPublished === false) {
            exam.status = EntityStatus.INACTIVE;
        }

        // Recompute totals if sections changed
        if (this.hasSectionUpdates(dto)) {
            const { totalQuestions, totalPoints } = this.calculateSectionTotals(exam as any);
            exam.metadata = {
                ...(exam.metadata ?? {}),
                totalQuestions,
                totalPoints,
                lastComputedAt: new Date(),
            };
        }

        const updated = session ? await exam.save({ session }) : await exam.save();
        this.logger.log(`Exam updated: ${examId}`);
        return updated;
    }

    // ════════════════════════════════════════════════════════
    // READ — single
    // ════════════════════════════════════════════════════════

    async findById(examId: string, includeAnswers = false): Promise<IELTSExamDocument> {
        this.assertValidId(examId);

        const query = this.examModel.findOne({
            _id: new Types.ObjectId(examId),
            isDeleted: false,
        });

        if (!includeAnswers) query.select(ANSWER_EXCLUDE_FIELDS);

        const exam = await query.exec();
        if (!exam) throw new NotFoundException(`Imtihon topilmadi: ${examId}`);
        return exam;
    }

    // ════════════════════════════════════════════════════════
    // READ — admin list
    // ════════════════════════════════════════════════════════

    async adminFindAll(filters: AdminFindAllDto): Promise<PaginatedExams> {
        const { examType, module, difficulty, search, status, sortBy = 'createdAt', sortOrder = 'desc', createdFrom, createdTo, updatedFrom, updatedTo } = filters;

        const isPublished = parseBool(filters.isPublished);
        const isPremium = parseBool(filters.isPremium);
        const isDeleted = parseBool(filters.isDeleted);
        const page = parseNum(filters.page, 1);
        const rawLimit = parseNum(filters.limit, 10);
        const isAll = rawLimit === 0;
        const limit = isAll ? 0 : rawLimit;

        const filter: FilterQuery<IELTSExamDocument> = {};

        // isDeleted: true=trash | false=active | undefined=all
        if (isDeleted === true) filter.isDeleted = true;
        else if (isDeleted === false) filter.isDeleted = false;

        if (examType) filter.examType = examType;
        if (module) filter.module = module;
        if (difficulty) filter.difficulty = difficulty;
        if (status) filter.status = status;
        if (isPublished !== undefined) filter.isPublished = isPublished;
        if (isPremium !== undefined) filter.isPremium = isPremium;

        if (search?.trim()) {
            const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.$or = [{ title: { $regex: escaped, $options: 'i' } }, { description: { $regex: escaped, $options: 'i' } }, { tags: { $in: [new RegExp(escaped, 'i')] } }];
        }

        if (createdFrom || createdTo) {
            filter.createdAt = {} as any;
            if (createdFrom) (filter.createdAt as any).$gte = new Date(createdFrom);
            if (createdTo) (filter.createdAt as any).$lte = new Date(createdTo);
        }
        if (updatedFrom || updatedTo) {
            filter.updatedAt = {} as any;
            if (updatedFrom) (filter.updatedAt as any).$gte = new Date(updatedFrom);
            if (updatedTo) (filter.updatedAt as any).$lte = new Date(updatedTo);
        }

        const skip = isAll ? 0 : (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 } as Record<string, 1 | -1>;

        const [exams, total] = await Promise.all([
            this.examModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(isAll ? 0 : limit)
                .lean()
                .exec(),
            this.examModel.countDocuments(filter),
        ]);

        const totalPages = isAll ? 1 : Math.ceil(total / limit) || 1;
        this.logger.log(`[ADMIN] Found ${total} exams — page ${page}/${totalPages}`);

        return {
            exams: exams as unknown as IELTSExamDocument[],
            total,
            page: isAll ? 1 : page,
            totalPages,
            hasNext: isAll ? false : page < totalPages,
            hasPrev: isAll ? false : page > 1,
        };
    }

    // ════════════════════════════════════════════════════════
    // READ — user list (published + active + within dates)
    // ════════════════════════════════════════════════════════

    async userFindAll(filters: UserFindAllDto): Promise<PaginatedExams> {
        const { examType, module, difficulty, search, sortBy = 'createdAt', sortOrder = 'desc' } = filters;

        const isPremium = parseBool(filters.isPremium);
        const page = parseNum(filters.page, 1);
        const limit = parseNum(filters.limit, 12);
        const now = new Date();

        const filter: FilterQuery<IELTSExamDocument> = {
            isDeleted: false,
            isPublished: true,
            status: EntityStatus.ACTIVE,
            $and: [{ $or: [{ availableFrom: { $lte: now } }, { availableFrom: null }] }, { $or: [{ availableUntil: { $gte: now } }, { availableUntil: null }] }],
        };

        if (examType) filter.examType = examType;
        if (module) filter.module = module;
        if (difficulty) filter.difficulty = difficulty;
        if (isPremium !== undefined) filter.isPremium = isPremium;

        if (search?.trim()) {
            const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.$or = [{ title: { $regex: escaped, $options: 'i' } }, { description: { $regex: escaped, $options: 'i' } }, { tags: { $in: [new RegExp(escaped, 'i')] } }];
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 } as Record<string, 1 | -1>;

        const [exams, total] = await Promise.all([this.examModel.find(filter).sort(sort).skip(skip).limit(limit).select(ANSWER_EXCLUDE_FIELDS).lean().exec(), this.examModel.countDocuments(filter)]);

        const totalPages = Math.ceil(total / limit) || 1;
        this.logger.log(`[USER] Found ${total} exams — page ${page}/${totalPages}`);

        return {
            exams: exams as unknown as IELTSExamDocument[],
            total,
            page,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        };
    }

    // ════════════════════════════════════════════════════════
    // PUBLISH / UNPUBLISH
    // ════════════════════════════════════════════════════════

    async publish(examId: string, metadata: MetadataInfo): Promise<IELTSExamDocument> {
        const exam = await this.findById(examId, true);
        if (exam.isPublished) throw new BadRequestException('Exam allaqachon published');
        this.validateExamComplete(exam);

        const updated = await this.examModel.findByIdAndUpdate(
            examId,
            {
                $set: {
                    isPublished: true,
                    publishedAt: new Date(),
                    status: EntityStatus.ACTIVE,
                },
                $push: { updatedBy: metadata },
            },
            { new: true }
        );
        this.logger.log(`Exam published: ${examId}`);
        return updated!;
    }

    async unpublish(examId: string, metadata: MetadataInfo): Promise<IELTSExamDocument> {
        const exam = await this.findById(examId);
        if (!exam.isPublished) throw new BadRequestException('Exam allaqachon unpublished');

        const updated = await this.examModel.findByIdAndUpdate(
            examId,
            {
                $set: { isPublished: false, status: EntityStatus.INACTIVE },
                $push: { updatedBy: metadata },
            },
            { new: true }
        );
        this.logger.log(`Exam unpublished: ${examId}`);
        return updated!;
    }

    // ════════════════════════════════════════════════════════
    // SOFT DELETE / RESTORE
    // ════════════════════════════════════════════════════════

    async softDelete(examId: string, metadata: MetadataInfo, session?: ClientSession): Promise<void> {
        this.assertValidId(examId);
        const exam = await this.examModel.findOne({ _id: examId, isDeleted: false }).exec();
        if (!exam) throw new NotFoundException(`Exam topilmadi: ${examId}`);

        if (exam.completedAttempts > 0) {
            throw new BadRequestException(`Exam o'chirib bo'lmaydi: ${exam.completedAttempts} ta tugallangan urinish mavjud`);
        }

        exam.isDeleted = true;
        exam.status = EntityStatus.DELETED;
        if (!exam.deletedBy) exam.deletedBy = [];
        exam.deletedBy.push(metadata);

        session ? await exam.save({ session }) : await exam.save();
        this.logger.log(`Exam soft-deleted: ${examId}`);
    }

    async bulkSoftDelete(examIds: string[], metadata: MetadataInfo): Promise<BulkOperationResult> {
        const result: BulkOperationResult = { succeeded: 0, failed: [] };

        const invalid = examIds.filter((id) => !Types.ObjectId.isValid(id));
        const validIds = examIds.filter((id) => Types.ObjectId.isValid(id));

        result.failed.push(...invalid.map((id) => ({ examId: id, reason: "Noto'g'ri ID format" })));

        if (validIds.length === 0) return result;

        const existingDocs = await this.examModel
            .find({ _id: { $in: validIds } })
            .select('_id isDeleted completedAttempts')
            .lean()
            .exec();

        const foundSet = new Set(existingDocs.map((d: any) => d._id.toString()));
        result.failed.push(...validIds.filter((id) => !foundSet.has(id)).map((id) => ({ examId: id, reason: 'Topilmadi' })));

        const deletable = existingDocs.filter((d: any) => !d.isDeleted && d.completedAttempts === 0);

        result.failed.push(
            ...(existingDocs as any[]).filter((d) => d.isDeleted).map((d) => ({ examId: d._id.toString(), reason: "Allaqachon o'chirilgan" })),
            ...(existingDocs as any[])
                .filter((d) => !d.isDeleted && d.completedAttempts > 0)
                .map((d) => ({
                    examId: d._id.toString(),
                    reason: `${d.completedAttempts} ta tugallangan urinish mavjud`,
                }))
        );

        if (deletable.length > 0) {
            const updateResult = await this.examModel.updateMany(
                { _id: { $in: deletable.map((d: any) => d._id) } },
                {
                    $set: { isDeleted: true, status: EntityStatus.DELETED },
                    $push: { deletedBy: metadata },
                }
            );
            result.succeeded = updateResult.modifiedCount;
        }

        return result;
    }

    async restore(examId: string, metadata: MetadataInfo, session?: ClientSession): Promise<IELTSExamDocument> {
        this.assertValidId(examId);
        const exam = await this.examModel.findOne({ _id: examId, isDeleted: true }).exec();
        if (!exam) throw new NotFoundException(`O'chirilgan exam topilmadi: ${examId}`);

        exam.isDeleted = false;
        exam.status = EntityStatus.INACTIVE;
        if (!exam.updatedBy) exam.updatedBy = [];
        exam.updatedBy.push(metadata);

        const restored = session ? await exam.save({ session }) : await exam.save();
        this.logger.log(`Exam restored: ${examId}`);
        return restored;
    }

    async bulkRestore(examIds: string[], metadata: MetadataInfo): Promise<BulkOperationResult> {
        const result: BulkOperationResult = { succeeded: 0, failed: [] };

        const invalid = examIds.filter((id) => !Types.ObjectId.isValid(id));
        const validIds = examIds.filter((id) => Types.ObjectId.isValid(id));
        result.failed.push(...invalid.map((id) => ({ examId: id, reason: "Noto'g'ri ID format" })));

        if (validIds.length === 0) return result;

        const existingDocs = await this.examModel
            .find({ _id: { $in: validIds } })
            .select('_id isDeleted')
            .lean()
            .exec();

        const foundSet = new Set(existingDocs.map((d: any) => d._id.toString()));
        result.failed.push(...validIds.filter((id) => !foundSet.has(id)).map((id) => ({ examId: id, reason: 'Topilmadi' })));

        const restorable = (existingDocs as any[]).filter((d) => d.isDeleted);
        result.failed.push(...(existingDocs as any[]).filter((d) => !d.isDeleted).map((d) => ({ examId: d._id.toString(), reason: "O'chirilmagan" })));

        if (restorable.length > 0) {
            const updateResult = await this.examModel.updateMany(
                { _id: { $in: restorable.map((d: any) => d._id) } },
                {
                    $set: { isDeleted: false, status: EntityStatus.INACTIVE },
                    $push: { updatedBy: metadata },
                }
            );
            result.succeeded = updateResult.modifiedCount;
        }

        return result;
    }

    // ════════════════════════════════════════════════════════
    // STATISTICS
    // ════════════════════════════════════════════════════════

    async getStatistics(examId: string): Promise<ExamStatistics> {
        const exam = await this.findById(examId);
        const completionRate = exam.totalAttempts > 0 ? ((exam.completedAttempts / exam.totalAttempts) * 100).toFixed(2) : '0.00';

        return {
            examId: (exam._id as any).toString(),
            title: exam.title,
            examType: exam.examType,
            module: exam.module,
            difficulty: exam.difficulty,
            statistics: {
                totalAttempts: exam.totalAttempts,
                completedAttempts: exam.completedAttempts,
                completionRate: `${completionRate}%`,
                averageRating: exam.averageRating,
                totalRatings: exam.totalRatings,
                totalQuestions: (exam.metadata?.totalQuestions as number) ?? 0,
                totalPoints: (exam.metadata?.totalPoints as number) ?? 0,
            },
            status: {
                isPublished: exam.isPublished,
                isPremium: exam.isPremium,
                status: exam.status as any,
            },
            dates: {
                createdAt: exam.createdAt as Date,
                publishedAt: exam.publishedAt ?? undefined,
                availableFrom: exam.availableFrom ?? undefined,
                availableUntil: exam.availableUntil ?? undefined,
            },
        };
    }

    async getGlobalStatistics(): Promise<{
        total: number;
        published: number;
        drafts: number;
        deleted: number;
        premium: number;
        byType: Record<string, number>;
        byModule: Record<string, number>;
        byDifficulty: Record<string, number>;
        topRated: IELTSExamDocument[];
        mostAttempted: IELTSExamDocument[];
    }> {
        const activeFilter = { isDeleted: false };

        const [total, published, drafts, deleted, premium, byType, byModule, byDifficulty, topRated, mostAttempted] = await Promise.all([
            this.examModel.countDocuments(activeFilter),
            this.examModel.countDocuments({ ...activeFilter, isPublished: true }),
            this.examModel.countDocuments({ ...activeFilter, isPublished: false }),
            this.examModel.countDocuments({ isDeleted: true }),
            this.examModel.countDocuments({ ...activeFilter, isPremium: true }),
            this.examModel.aggregate([{ $match: activeFilter }, { $group: { _id: '$examType', count: { $sum: 1 } } }]),
            this.examModel.aggregate([{ $match: activeFilter }, { $group: { _id: '$module', count: { $sum: 1 } } }]),
            this.examModel.aggregate([{ $match: activeFilter }, { $group: { _id: '$difficulty', count: { $sum: 1 } } }]),
            this.examModel
                .find({ ...activeFilter, isPublished: true })
                .sort({ averageRating: -1 })
                .limit(5)
                .select('title examType module difficulty averageRating totalRatings')
                .lean()
                .exec(),
            this.examModel
                .find({ ...activeFilter, isPublished: true })
                .sort({ totalAttempts: -1 })
                .limit(5)
                .select('title examType module difficulty totalAttempts completedAttempts')
                .lean()
                .exec(),
        ]);

        const toRecord = (arr: any[]) => Object.fromEntries(arr.map(({ _id, count }) => [_id ?? 'unknown', count]));

        return {
            total,
            published,
            drafts,
            deleted,
            premium,
            byType: toRecord(byType),
            byModule: toRecord(byModule),
            byDifficulty: toRecord(byDifficulty),
            topRated: topRated as unknown as IELTSExamDocument[],
            mostAttempted: mostAttempted as unknown as IELTSExamDocument[],
        };
    }

    // ════════════════════════════════════════════════════════
    // ATOMIC COUNTER UPDATES  (called from attempts service)
    // ════════════════════════════════════════════════════════

    async incrementTotalAttempts(examId: string): Promise<void> {
        await this.examModel.updateOne({ _id: new Types.ObjectId(examId) }, { $inc: { totalAttempts: 1 } });
    }

    async incrementCompletedAttempts(examId: string): Promise<void> {
        await this.examModel.updateOne({ _id: new Types.ObjectId(examId) }, { $inc: { completedAttempts: 1 } });
    }

    async updateRating(examId: string, newRating: number): Promise<void> {
        const exam = await this.examModel.findById(examId).select('averageRating totalRatings').exec();
        if (!exam) return;

        const total = exam.totalRatings + 1;
        const avg = (exam.averageRating * exam.totalRatings + newRating) / total;

        await this.examModel.updateOne({ _id: new Types.ObjectId(examId) }, { $set: { averageRating: Math.round(avg * 10) / 10, totalRatings: total } });
    }

    // ════════════════════════════════════════════════════════
    // PRIVATE — Validation
    // ════════════════════════════════════════════════════════

    private assertValidId(id: string): void {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`Noto'g'ri exam ID formati: ${id}`);
        }
    }

    private validateRequiredSections(dto: CreateIELTSExamDto | any): void {
        const t = dto.examType as ExamType;
        const needed = REQUIRED_SECTIONS_MAP[t];
        if (!needed) throw new BadRequestException(`Noto'g'ri exam type: ${t}`);

        const has = (s: any) => s && Object.keys(s).length > 0;
        for (const field of needed) {
            if (!has(dto[field])) {
                throw new BadRequestException(`${t} uchun ${field} majburiy`);
            }
        }
    }

    private validateExamComplete(exam: IELTSExamDocument | any): void {
        const t = exam.examType as ExamType;
        const needed = REQUIRED_SECTIONS_MAP[t];
        if (!needed) throw new BadRequestException(`Noto'g'ri exam type: ${t}`);

        const sectionChecks: Record<string, () => boolean> = {
            readingSection: () => !!exam.readingSection?.passages?.length,
            speakingSection: () => !!exam.speakingSection?.parts?.length,
            writingSection: () => !!exam.writingSection?.tasks?.length,
            listeningSection: () => !!exam.listeningSection?.parts?.length,
        };

        for (const field of needed) {
            if (!sectionChecks[field]?.()) {
                throw new BadRequestException(`Exam to'liq emas: ${field} bo'sh (${t})`);
            }
        }
    }

    private hasSectionUpdates(dto: UpdateIELTSExamDto): boolean {
        return !!(dto.readingSection || dto.listeningSection || dto.writingSection || dto.speakingSection);
    }

    // ════════════════════════════════════════════════════════
    // PRIVATE — Section Sanitizers
    // ════════════════════════════════════════════════════════

    private sanitizeReadingSection(section: any): any {
        if (!section || Object.keys(section).length === 0) return undefined;

        const passages = (section.passages ?? []).map((p: any, pIdx: number) => {
            const questions = (p.questions ?? []).map((q: any, qIdx: number) => this.sanitizeReadingQuestion(q, qIdx));
            return {
                passageNumber: p.passageNumber ?? pIdx + 1,
                title: p.title ?? '',
                content: p.content ?? '',
                wordCount: p.wordCount ?? (p.content ?? '').trim().split(/\s+/).filter(Boolean).length,
                paragraphLabels: p.paragraphLabels ?? [],
                source: p.source ?? null,
                keywords: p.keywords ?? [],
                questionGroups: (p.questionGroups ?? []).map((g: any) => ({
                    groupLabel: g.groupLabel ?? '',
                    type: g.type,
                    instructions: g.instructions ?? null,
                    completionText: g.completionText ?? null,
                    matchingPool: g.matchingPool ?? [],
                    wordLimit: g.wordLimit ?? null,
                    questionNumbers: g.questionNumbers ?? [],
                })),
                questions,
                totalQuestions: questions.length,
                totalPoints: questions.reduce((s: number, q: any) => s + (q.points ?? 1), 0),
            };
        });

        return {
            isEnabled: section.isEnabled ?? true,
            timeLimitMinutes: section.timeLimitMinutes ?? 60,
            instructions: section.instructions ?? null,
            passages,
            totalQuestions: passages.reduce((s: number, p: any) => s + p.totalQuestions, 0),
            totalPoints: passages.reduce((s: number, p: any) => s + p.totalPoints, 0),
        };
    }

    private sanitizeReadingQuestion(q: any, idx: number): any {
        return {
            questionNumber: q.questionNumber ?? idx + 1,
            type: q.type,
            question: q.question ?? '',
            options: q.options ?? [],
            matchingPool: q.matchingPool ?? [],
            correctAnswer: q.correctAnswer ?? '',
            acceptableAnswers: q.acceptableAnswers ?? [],
            points: q.points ?? 1,
            explanation: q.explanation ?? null,
            locationHint: q.locationHint ?? null,
            wordLimit: q.wordLimit ?? null,
            paragraphLabel: q.paragraphLabel ?? null,
            additionalData: q.additionalData ?? null,
        };
    }

    private sanitizeListeningSection(section: any): any {
        if (!section || Object.keys(section).length === 0) return undefined;

        const parts = (section.parts ?? []).map((p: any, pIdx: number) => {
            const questions = (p.questions ?? []).map((q: any, qIdx: number) => this.sanitizeListeningQuestion(q, qIdx));
            return {
                partNumber: p.partNumber ?? pIdx + 1,
                title: p.title ?? '',
                context: p.context ?? '',
                audioUrl: p.audioUrl ?? '',
                durationSeconds: p.durationSeconds ?? 0,
                transcript: p.transcript ?? null,
                isMonologue: p.isMonologue ?? false,
                speakerCount: p.speakerCount ?? 2,
                instructions: p.instructions ?? null,
                questionGroups: (p.questionGroups ?? []).map((g: any) => ({
                    groupLabel: g.groupLabel ?? '',
                    type: g.type,
                    instructions: g.instructions ?? null,
                    completionText: g.completionText ?? null,
                    diagramImageUrl: g.diagramImageUrl ?? null,
                    matchingPool: g.matchingPool ?? [],
                    wordLimit: g.wordLimit ?? null,
                    questionNumbers: g.questionNumbers ?? [],
                })),
                questions,
                totalQuestions: questions.length,
                totalPoints: questions.reduce((s: number, q: any) => s + (q.points ?? 1), 0),
            };
        });

        return {
            isEnabled: section.isEnabled ?? true,
            timeLimitMinutes: section.timeLimitMinutes ?? 30,
            transferTimeMinutes: section.transferTimeMinutes ?? 10,
            instructions: section.instructions ?? null,
            parts,
            totalQuestions: parts.reduce((s: number, p: any) => s + p.totalQuestions, 0),
            totalPoints: parts.reduce((s: number, p: any) => s + p.totalPoints, 0),
        };
    }

    private sanitizeListeningQuestion(q: any, idx: number): any {
        return {
            questionNumber: q.questionNumber ?? idx + 1,
            type: q.type,
            question: q.question ?? '',
            options: q.options ?? [],
            matchingPool: q.matchingPool ?? [],
            correctAnswer: q.correctAnswer ?? '',
            acceptableAnswers: q.acceptableAnswers ?? [],
            points: q.points ?? 1,
            explanation: q.explanation ?? null,
            timestampStart: q.timestampStart ?? null,
            timestampEnd: q.timestampEnd ?? null,
            wordLimit: q.wordLimit ?? null,
            diagramImageUrl: q.diagramImageUrl ?? null,
            diagramGroupId: q.diagramGroupId ?? null,
            diagramLabel: q.diagramLabel ?? null,
        };
    }

    private sanitizeWritingSection(section: any): any {
        if (!section || Object.keys(section).length === 0) return undefined;

        const tasks = (section.tasks ?? []).map((t: any, tIdx: number) => ({
            taskNumber: t.taskNumber ?? tIdx + 1,
            type: t.type,
            subtype: t.subtype ?? null,
            prompt: t.prompt ?? '',
            imageUrl: t.imageUrl ?? null,
            chartData: t.chartData ?? null,
            secondImageUrl: t.secondImageUrl ?? null,
            visualCaption: t.visualCaption ?? null,
            letterBulletPoints: t.letterBulletPoints ?? [],
            letterSalutationHint: t.letterSalutationHint ?? null,
            essayDirectives: t.essayDirectives ?? [],
            minimumWords: t.minimumWords ?? (tIdx === 0 ? 150 : 250),
            suggestedTimeMinutes: t.suggestedTimeMinutes ?? (tIdx === 0 ? 20 : 40),
            maxBandScore: t.maxBandScore ?? 9,
            assessmentCriteria: t.assessmentCriteria ?? [],
            sampleAnswer: t.sampleAnswer ?? null,
            examinerNotes: t.examinerNotes ?? null,
            instructions: t.instructions ?? null,
        }));

        return {
            isEnabled: section.isEnabled ?? true,
            timeLimitMinutes: section.timeLimitMinutes ?? 60,
            instructions: section.instructions ?? null,
            tasks,
        };
    }

    private sanitizeSpeakingSection(section: any): any {
        if (!section || Object.keys(section).length === 0) return undefined;

        const parts = (section.parts ?? []).map((p: any, pIdx: number) => ({
            partNumber: p.partNumber ?? pIdx + 1,
            partType: p.partType,
            title: p.title ?? '',
            instructions: p.instructions ?? null,
            durationMinutes: p.durationMinutes ?? 5,
            topicGroups: p.topicGroups ?? [],
            cueCardTopic: p.cueCardTopic ?? null,
            cueCardPoints: p.cueCardPoints ?? [],
            preparationTimeSeconds: p.preparationTimeSeconds ?? 60,
            minimumSpeakingSeconds: p.minimumSpeakingSeconds ?? 60,
            maximumSpeakingSeconds: p.maximumSpeakingSeconds ?? 120,
            roundingOffQuestions: p.roundingOffQuestions ?? [],
            discussionTheme: p.discussionTheme ?? null,
            questions: (p.questions ?? []).map((q: any, qIdx: number) => ({
                questionNumber: q.questionNumber ?? qIdx + 1,
                question: q.question ?? '',
                followUpQuestions: q.followUpQuestions ?? [],
                suggestedTimeSeconds: q.suggestedTimeSeconds ?? null,
                sampleAnswer: q.sampleAnswer ?? null,
                languageTips: q.languageTips ?? [],
                topicCategory: q.topicCategory ?? null,
            })),
        }));

        return {
            isEnabled: section.isEnabled ?? true,
            timeLimitMinutes: section.timeLimitMinutes ?? 14,
            requiresRecording: section.requiresRecording ?? true,
            allowRetakes: section.allowRetakes ?? false,
            instructions: section.instructions ?? null,
            parts,
        };
    }

    private calculateSectionTotals(dto: any): {
        totalQuestions: number;
        totalPoints: number;
    } {
        let totalQuestions = 0;
        let totalPoints = 0;

        if (dto.readingSection?.passages) {
            for (const p of dto.readingSection.passages) {
                totalQuestions += p.questions?.length ?? 0;
                totalPoints += (p.questions ?? []).reduce((s: number, q: any) => s + (q.points ?? 1), 0);
            }
        }
        if (dto.listeningSection?.parts) {
            for (const p of dto.listeningSection.parts) {
                totalQuestions += p.questions?.length ?? 0;
                totalPoints += (p.questions ?? []).reduce((s: number, q: any) => s + (q.points ?? 1), 0);
            }
        }

        return { totalQuestions, totalPoints };
    }
}

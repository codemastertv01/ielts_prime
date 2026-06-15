// attempts/ielts.attempts.service.ts
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, FilterQuery, Model, Types } from 'mongoose';

import { IELTSExam, IELTSExamDocument } from '../ielts/schemas/ielts.schema';
import { IELTSNotificationService } from './ielts.notification.service';
import { IELTSExamAttempt, IELTSExamAttemptDocument } from './schemas/ielts.attempts.schema';

import { EntityStatus } from '../dto/entity-status.dto';
import type { MetadataInfo } from '../dto/metadata-info.dto';
import { SpeakingRecordingStatus } from '../dto/speaking-recording-status';
import { AttemptDoc, EXAM_FIELDS_SHORT, LISTENING_BAND_TABLE, PaginatedAttempts, READING_BAND_TABLE, TERMINAL_STATUSES, USER_FIELDS_SHORT, USER_HIDDEN_FIELDS, UserAttemptResult } from './dto/enums';
import { GetAttemptsQueryDto } from './dto/get-attempts-query.dto';
import { AutoSaveDto, SaveSpeakingRecordingDto } from './dto/grading.dto';
import { SubmitListeningAnswerDto, SubmitListeningSectionDto, SubmitReadingAnswerDto, SubmitReadingSectionDto, SubmitSpeakingSectionDto, SubmitWritingSectionDto } from './dto/submit.dto';

@Injectable()
export class IELTSExamAttemptService {
    private readonly logger = new Logger(IELTSExamAttemptService.name);

    constructor(
        @InjectModel(IELTSExamAttempt.name)
        private readonly attemptModel: Model<IELTSExamAttemptDocument>,

        @InjectModel(IELTSExam.name)
        private readonly examModel: Model<IELTSExamDocument>,

        @InjectConnection()
        private readonly connection: Connection,

        private readonly notificationService: IELTSNotificationService
    ) {}

    // ════════════════════════════════════════════════════════
    // START ATTEMPT
    // Kiradi: userId (string), examId (string), metadata (MetadataInfo)
    // Chiqadi: IELTSExamAttemptDocument — yangi attempt
    // Xatoliklar: NotFoundException (exam topilmasa), BadRequestException (vaqt o'tgan)
    // ════════════════════════════════════════════════════════

    async startAttempt(userId: string, examId: string, metadata: MetadataInfo): Promise<IELTSExamAttemptDocument> {
        this.assertValidId(examId, 'Exam');

        const session = await this.connection.startSession();
        session.startTransaction();
        try {
            // Faqat active + published examlarni boshlash mumkin
            const exam = await this.examModel
                .findOne({
                    _id: new Types.ObjectId(examId),
                    isDeleted: false,
                    isPublished: true,
                    status: EntityStatus.ACTIVE,
                })
                .session(session)
                .exec();

            if (!exam) throw new NotFoundException('Exam topilmadi yoki faol emas');

            const now = new Date();
            if (exam.availableFrom && exam.availableFrom > now) {
                throw new BadRequestException(`Exam ${exam.availableFrom.toLocaleDateString('uz-UZ')} dan boshlanadi`);
            }
            if (exam.availableUntil && exam.availableUntil < now) {
                throw new BadRequestException('Exam muddati tugagan');
            }

            // Oxirgi attempt raqamini bitta query bilan olish
            const lastAttempt = await this.attemptModel
                .findOne({ userId: new Types.ObjectId(userId), examId: new Types.ObjectId(examId) })
                .sort({ attemptNumber: -1 })
                .lean()
                .session(session)
                .exec();

            const expiresAt = new Date(now.getTime() + exam.totalTimeLimitMinutes * 60_000);

            const attempt = new this.attemptModel({
                userId: new Types.ObjectId(userId),
                examId: new Types.ObjectId(examId),
                status: EntityStatus.IN_PROGRESS,
                startedAt: now,
                expiresAt,
                createdBy: metadata,
                updatedBy: [metadata],
                readingAnswers: [],
                listeningAnswers: [],
                writingAnswers: [],
                speakingAnswers: [],
                sectionsSubmitted: [],
                autoSaveCount: 0,
                tags: [],
                isReviewed: false,
                isDeleted: false,
                auditLog: [],
                changeHistory: [],
                adminNotes: [],
            });

            await attempt.save({ session });

            this.pushAudit(attempt, {
                action: 'ATTEMPT_STARTED',
                performedBy: userId,
                performedByRole: 'user',
                timestamp: now,
                note: `Attempt #${attempt.attemptNumber} boshlandi`,
            });

            await attempt.save({ session });

            // Exam counter ni atomic oshirish
            await this.examModel.updateOne({ _id: exam._id }, { $inc: { totalAttempts: 1 } }).session(session);

            await session.commitTransaction();
            this.logger.log(`Attempt boshlandi: id=${attempt._id} user=${userId} exam=${examId} attempt=#${attempt.attemptNumber}`);

            // Bildirishnoma (async — xato bo'lsa bloklanmaydi)
            this.notificationService
                .notifyExamStarted({
                    userId,
                    userEmail: metadata.email,
                    userName: metadata.username,
                    attemptId: attempt._id.toString(),
                    examId,
                    examTitle: exam.title,
                })
                .catch((e) => this.logger.error(`notifyExamStarted xatosi: ${e.message}`));

            return attempt;
        } catch (err) {
            await session.abortTransaction();
            this.logger.error(`startAttempt xatosi: ${err.message}`, err.stack);
            throw err;
        } finally {
            session.endSession();
        }
    }

    // ════════════════════════════════════════════════════════
    // ACTIVE ATTEMPT
    // Kiradi: userId, examId
    // Chiqadi: { ...attempt, remainingSeconds } | null
    // ════════════════════════════════════════════════════════

    async getActiveAttempt(userId: string, examId: string): Promise<any | null> {
        this.assertValidId(examId, 'Exam');
        const now = new Date();

        const doc = await this.attemptModel
            .findOne({
                userId: new Types.ObjectId(userId),
                examId: new Types.ObjectId(examId),
                isDeleted: false,
                status: EntityStatus.IN_PROGRESS,
                expiresAt: { $gt: now },
            })
            .sort({ createdAt: -1 })
            .select(USER_HIDDEN_FIELDS)
            .exec();

        if (!doc) return null;

        const d = doc as AttemptDoc;
        const remainingSeconds = Math.max(0, Math.floor((d.expiresAt.getTime() - now.getTime()) / 1000));
        return { ...d.toObject(), remainingSeconds };
    }

    // ════════════════════════════════════════════════════════
    // AUTO-SAVE
    // Kiradi: attemptId, userId, AutoSaveDto
    // Chiqadi: void (silent fail — xato bo'lsa log yozib davom etadi)
    // ════════════════════════════════════════════════════════

    async autoSaveAttempt(attemptId: string, userId: string, dto: AutoSaveDto): Promise<void> {
        this.assertValidId(attemptId, 'Attempt');

        const doc = await this.attemptModel
            .findOne({
                _id: new Types.ObjectId(attemptId),
                userId: new Types.ObjectId(userId),
                isDeleted: false,
                status: EntityStatus.IN_PROGRESS,
            })
            .exec();

        // Auto-save uchun silent fail — foydalanuvchiga xato ko'rsatmaydi
        if (!doc) {
            this.logger.warn(`autoSave: attempt topilmadi id=${attemptId}`);
            return;
        }

        const d = doc as AttemptDoc;

        // Reading javoblarini composite key (passageNumber_questionNumber) bo'yicha merge
        if (dto.readingAnswers?.length) {
            const map = new Map<string, any>(d.readingAnswers.map((a: any) => [`${a.passageNumber}_${a.questionNumber}`, a]));
            for (const a of dto.readingAnswers) {
                map.set(`${a.passageNumber}_${a.questionNumber}`, {
                    passageNumber: a.passageNumber,
                    questionNumber: a.questionNumber,
                    answer: a.answer ?? '',
                    multipleAnswers: a.multipleAnswers ?? [],
                    isCorrect: null,
                    pointsEarned: 0,
                    answeredAt: new Date(),
                });
            }
            d.readingAnswers = Array.from(map.values()) as any;
        }

        // Listening javoblarini merge
        if (dto.listeningAnswers?.length) {
            const map = new Map<string, any>(d.listeningAnswers.map((a: any) => [`${a.partNumber}_${a.questionNumber}`, a]));
            for (const a of dto.listeningAnswers) {
                map.set(`${a.partNumber}_${a.questionNumber}`, {
                    partNumber: a.partNumber,
                    questionNumber: a.questionNumber,
                    answer: a.answer ?? '',
                    multipleAnswers: a.multipleAnswers ?? [],
                    isCorrect: null,
                    pointsEarned: 0,
                    answeredAt: new Date(),
                });
            }
            d.listeningAnswers = Array.from(map.values()) as any;
        }

        // Writing taskini upsert (mavjud bo'lsa yangilaydi, yo'q bo'lsa qo'shadi)
        const upsertWriting = (taskNum: number, content: string) => {
            const wc = this.countWords(content);
            const idx = d.writingAnswers.findIndex((w: any) => w.taskNumber === taskNum);
            const entry = { taskNumber: taskNum, content, wordCount: wc };
            if (idx >= 0) Object.assign(d.writingAnswers[idx], entry);
            else d.writingAnswers.push(entry as any);
        };

        if (dto.writingTask1) upsertWriting(1, dto.writingTask1);
        if (dto.writingTask2) upsertWriting(2, dto.writingTask2);

        d.autoSaveCount = (d.autoSaveCount ?? 0) + 1;
        d.lastAutoSaveAt = new Date();
        await d.save();
        this.logger.debug(`Auto-save #${d.autoSaveCount}: attempt=${attemptId}`);
    }

    // ════════════════════════════════════════════════════════
    // FORCE EXPIRE
    // Kiradi: attemptId, userId
    // Chiqadi: void — frontend vaqt tugaganda chaqiradi
    // ════════════════════════════════════════════════════════

    async forceExpireAttempt(attemptId: string, userId: string): Promise<void> {
        this.assertValidId(attemptId, 'Attempt');
        const result = await this.attemptModel.updateOne(
            {
                _id: new Types.ObjectId(attemptId),
                userId: new Types.ObjectId(userId),
                status: EntityStatus.IN_PROGRESS,
            },
            {
                $set: { status: EntityStatus.EXPIRED, submittedAt: new Date() },
                $push: {
                    auditLog: {
                        action: 'ATTEMPT_EXPIRED',
                        performedBy: userId,
                        performedByRole: 'user',
                        timestamp: new Date(),
                        note: 'Frontend: vaqt tugadi',
                    },
                },
            }
        );
        if (result.modifiedCount > 0) {
            this.logger.log(`Attempt expire qilindi: ${attemptId}`);
        }
    }

    // ════════════════════════════════════════════════════════
    // SPEAKING RECORDING SAQLASH
    // Kiradi: attemptId, userId, { partNumber, recordingUrl, durationSeconds }
    // Chiqadi: yangilangan IELTSExamAttemptDocument
    // ════════════════════════════════════════════════════════

    async saveSpeakingRecording(attemptId: string, userId: string, dto: SaveSpeakingRecordingDto): Promise<IELTSExamAttemptDocument> {
        const d = await this.requireActiveAttempt(attemptId, userId);
        const existing = d.speakingAnswers.find((a: any) => a.partNumber === dto.partNumber);

        const recordingData = {
            recordingUrl: dto.recordingUrl,
            durationSeconds: dto.durationSeconds,
            recordingStatus: SpeakingRecordingStatus.UPLOADED,
            recordedAt: new Date(),
        };

        if (existing) {
            Object.assign(existing, recordingData);
        } else {
            d.speakingAnswers.push({ partNumber: dto.partNumber, ...recordingData } as any);
        }

        this.pushAudit(d, {
            action: 'SPEAKING_RECORDING_SAVED',
            performedBy: userId,
            performedByRole: 'user',
            timestamp: new Date(),
            note: `Part ${dto.partNumber} saqlandi (${dto.durationSeconds}s)`,
        });

        this.logger.log(`Speaking recording saqlandi: attempt=${attemptId} part=${dto.partNumber}`);
        return d.save();
    }

    // ════════════════════════════════════════════════════════
    // READING TOPSHIRISH
    // Kiradi: attemptId, userId, { answers: [{ passageNumber, questionNumber, answer? }] }
    // Chiqadi: gradelangan attempt — readingBandScore avtomatik hisoblanadi
    // ════════════════════════════════════════════════════════

    async submitReadingSection(attemptId: string, userId: string, dto: SubmitReadingSectionDto): Promise<IELTSExamAttemptDocument> {
        const d = await this.requireActiveAttempt(attemptId, userId);
        const exam = await this.requireExam(String(d.examId));

        if (!exam.readingSection) throw new BadRequestException('Reading section mavjud emas');
        if (this.isSectionDone(d, 'reading')) {
            throw new BadRequestException('Reading allaqachon topshirilgan');
        }

        const { graded, correct } = this.gradeReadingAnswers(dto.answers, exam.readingSection);
        d.readingAnswers = graded as any;
        d.readingRawScore = correct;
        d.readingBandScore = this.lookupBand(correct, READING_BAND_TABLE);
        d.readingTiming = { ...(d.readingTiming ?? {}), submittedAt: new Date() } as any;

        this.markSection(d, 'reading');
        this.pushAudit(d, {
            action: 'READING_SUBMITTED',
            performedBy: userId,
            performedByRole: 'user',
            timestamp: new Date(),
            note: `To'g'ri: ${correct}/40 | Band: ${d.readingBandScore}`,
        });

        this.syncSubmissionStatus(d, exam);
        const saved = await d.save();
        this.logger.log(`Reading topshirildi: attempt=${attemptId} correct=${correct} band=${d.readingBandScore}`);
        return saved;
    }

    // ════════════════════════════════════════════════════════
    // LISTENING TOPSHIRISH
    // Kiradi: attemptId, userId, { answers: [{ partNumber, questionNumber, answer? }] }
    // Chiqadi: listeningBandScore avtomatik hisoblanadi
    // ════════════════════════════════════════════════════════

    async submitListeningSection(attemptId: string, userId: string, dto: SubmitListeningSectionDto): Promise<IELTSExamAttemptDocument> {
        const d = await this.requireActiveAttempt(attemptId, userId);
        const exam = await this.requireExam(String(d.examId));

        if (!exam.listeningSection) throw new BadRequestException('Listening section mavjud emas');
        if (this.isSectionDone(d, 'listening')) {
            throw new BadRequestException('Listening allaqachon topshirilgan');
        }

        const { graded, correct } = this.gradeListeningAnswers(dto.answers, exam.listeningSection);
        d.listeningAnswers = graded as any;
        d.listeningRawScore = correct;
        d.listeningBandScore = this.lookupBand(correct, LISTENING_BAND_TABLE);
        d.listeningTiming = { ...(d.listeningTiming ?? {}), submittedAt: new Date() } as any;

        this.markSection(d, 'listening');
        this.pushAudit(d, {
            action: 'LISTENING_SUBMITTED',
            performedBy: userId,
            performedByRole: 'user',
            timestamp: new Date(),
            note: `To'g'ri: ${correct}/40 | Band: ${d.listeningBandScore}`,
        });

        this.syncSubmissionStatus(d, exam);
        const saved = await d.save();
        this.logger.log(`Listening topshirildi: attempt=${attemptId} correct=${correct} band=${d.listeningBandScore}`);
        return saved;
    }

    // ════════════════════════════════════════════════════════
    // WRITING TOPSHIRISH
    // Kiradi: attemptId, userId, { tasks: [{ taskNumber, content }] }, exam
    // Chiqadi: status GRADING ga o'tadi — manual grading kutiladi
    // ════════════════════════════════════════════════════════

    async submitWritingSection(attemptId: string, userId: string, dto: SubmitWritingSectionDto, exam: IELTSExamDocument): Promise<IELTSExamAttemptDocument> {
        const d = await this.requireActiveAttempt(attemptId, userId);

        if (!exam.writingSection) throw new BadRequestException('Writing section mavjud emas');
        if (this.isSectionDone(d, 'writing')) {
            throw new BadRequestException('Writing allaqachon topshirilgan');
        }

        // Har bir task uchun minimal so'z sonini tekshirish
        for (const task of dto.tasks) {
            const def = exam.writingSection.tasks?.find((t: any) => t.taskNumber === task.taskNumber);
            if (def) {
                const wc = this.countWords(task.content);
                if (wc < def.minimumWords) {
                    throw new BadRequestException(`Task ${task.taskNumber}: kamida ${def.minimumWords} so'z kerak (${wc} berildi)`);
                }
            }
        }

        d.writingAnswers = dto.tasks.map((t) => ({
            taskNumber: t.taskNumber,
            content: t.content,
            wordCount: this.countWords(t.content),
            submittedAt: new Date(),
        })) as any;

        d.writingTiming = { ...(d.writingTiming ?? {}), submittedAt: new Date() } as any;
        this.markSection(d, 'writing');
        this.pushAudit(d, {
            action: 'WRITING_SUBMITTED',
            performedBy: userId,
            performedByRole: 'user',
            timestamp: new Date(),
            note: dto.tasks.map((t) => `Task${t.taskNumber}(${this.countWords(t.content)} so'z)`).join(', '),
        });

        d.status = EntityStatus.GRADING;
        const saved = await d.save();
        this.logger.log(`Writing topshirildi: attempt=${attemptId}`);

        // Foydalanuvchiga "baholash boshlandi" emaili
        this.notificationService
            .notifyGradingStarted({
                userEmail: (exam as any).createdBy?.email ?? '',
                userName: (exam as any).createdBy?.username ?? 'Foydalanuvchi',
                examTitle: exam.title,
                sectionsToGrade: ['Writing'],
                expectedDays: 2,
            })
            .catch((e) => this.logger.error(`notifyGradingStarted xatosi: ${e.message}`));

        return saved;
    }

    // ════════════════════════════════════════════════════════
    // SPEAKING TOPSHIRISH
    // Kiradi: attemptId, userId, { parts: [{ partNumber, recordingUrl, durationSeconds }] }, exam
    // Chiqadi: status GRADING ga o'tadi
    // ════════════════════════════════════════════════════════

    async submitSpeakingSection(attemptId: string, userId: string, dto: SubmitSpeakingSectionDto, exam: IELTSExamDocument): Promise<IELTSExamAttemptDocument> {
        const d = await this.requireActiveAttempt(attemptId, userId);

        if (!exam.speakingSection) throw new BadRequestException('Speaking section mavjud emas');
        if (this.isSectionDone(d, 'speaking')) {
            throw new BadRequestException('Speaking allaqachon topshirilgan');
        }

        for (const p of dto.parts) {
            if (p.durationSeconds < 30) {
                throw new BadRequestException(`Part ${p.partNumber}: minimum 30 soniya recording kerak`);
            }
            if (p.durationSeconds > 900) {
                throw new BadRequestException(`Part ${p.partNumber}: maksimal 15 daqiqa ruxsat etilgan`);
            }
        }

        d.speakingAnswers = dto.parts.map((p) => ({
            partNumber: p.partNumber,
            recordingUrl: p.recordingUrl,
            durationSeconds: p.durationSeconds,
            recordingStatus: SpeakingRecordingStatus.UPLOADED,
            recordedAt: new Date(),
        })) as any;

        d.speakingTiming = { ...(d.speakingTiming ?? {}), submittedAt: new Date() } as any;
        this.markSection(d, 'speaking');
        this.pushAudit(d, {
            action: 'SPEAKING_SUBMITTED',
            performedBy: userId,
            performedByRole: 'user',
            timestamp: new Date(),
            note: dto.parts.map((p) => `Part${p.partNumber}(${p.durationSeconds}s)`).join(', '),
        });

        d.status = EntityStatus.GRADING;
        const saved = await d.save();
        this.logger.log(`Speaking topshirildi: attempt=${attemptId}`);
        return saved;
    }

    /**
     * Bitta attempt — foydalanuvchining o'zi uchun
     * Kiradi: attemptId, userId
     * Chiqadi: attempt (audit/admin fieldlarsiz)
     */
    async getAttemptForUser(attemptId: string, userId: string): Promise<IELTSExamAttemptDocument> {
        this.assertValidId(attemptId, 'Attempt');
        const doc = await this.attemptModel
            .findOne({
                _id: new Types.ObjectId(attemptId),
                userId: new Types.ObjectId(userId),
                isDeleted: false,
            })
            .populate('examId', EXAM_FIELDS_SHORT)
            .select(USER_HIDDEN_FIELDS)
            .exec();
        if (!doc) throw new NotFoundException('Attempt topilmadi');
        return doc;
    }

    /**
     * Foydalanuvchining dashboard uchun natijalar ro'yxati
     * Kiradi: userId, GetAttemptsQueryDto
     * Chiqadi: paginated attempts — faqat score va status fieldlar (yengil payload)
     */
    async getAllUserAttempts(userId: string, query: GetAttemptsQueryDto): Promise<PaginatedAttempts> {
        const { page = 1, limit = 20, status, examId } = query;
        const filter: FilterQuery<IELTSExamAttemptDocument> = {
            userId: new Types.ObjectId(userId),
            isDeleted: false,
        };
        if (status) filter.status = status;
        if (examId) {
            this.assertValidId(examId, 'Exam');
            filter.examId = new Types.ObjectId(examId);
        }
        return this.paginate(filter, page, limit, EXAM_FIELDS_SHORT, USER_FIELDS_SHORT, false);
    }

    /**
     * Foydalanuvchining biror exam bo'yicha barcha urinishlari
     * Kiradi: userId, examId
     * Chiqadi: urinishlar ro'yxati (eng yangi birinchi)
     */
    async getUserExamAttempts(userId: string, examId: string): Promise<IELTSExamAttemptDocument[]> {
        this.assertValidId(examId, 'Exam');
        return this.attemptModel
            .find({
                userId: new Types.ObjectId(userId),
                examId: new Types.ObjectId(examId),
                isDeleted: false,
            })
            .sort({ attemptNumber: -1 })
            .populate('examId', EXAM_FIELDS_SHORT)
            .select(USER_HIDDEN_FIELDS)
            .exec();
    }

    /**
     * Foydalanuvchining barcha natijalari — dashboard uchun optimallashtirilgan
     * Kiradi: userId
     * Chiqadi: UserAttemptResult[] (yengil, faqat zarur fieldlar)
     */
    async getUserDashboardResults(userId: string): Promise<UserAttemptResult[]> {
        this.assertValidId(userId, 'User');

        const attempts = await this.attemptModel
            .find({
                userId: new Types.ObjectId(userId),
                isDeleted: false,
                status: { $in: [EntityStatus.GRADED, EntityStatus.GRADING] },
            })
            .sort({ createdAt: -1 })
            .populate('examId', 'title examType module passingScore')
            .select('attemptNumber status overallBandScore readingBandScore ' + 'listeningBandScore writingBandScore speakingBandScore percentageScore ' + 'startedAt submittedAt examId')
            .lean()
            .exec();

        return attempts.map((a: any) => {
            const exam = a.examId ?? {};
            const isPassed = a.overallBandScore != null && exam.passingScore != null ? a.overallBandScore >= exam.passingScore : false;

            return {
                attemptId: a._id.toString(),
                examTitle: exam.title ?? '',
                examType: exam.examType ?? '',
                module: exam.module ?? '',
                attemptNumber: a.attemptNumber,
                status: a.status,
                overallBandScore: a.overallBandScore ?? null,
                readingBandScore: a.readingBandScore ?? null,
                listeningBandScore: a.listeningBandScore ?? null,
                writingBandScore: a.writingBandScore ?? null,
                speakingBandScore: a.speakingBandScore ?? null,
                percentageScore: a.percentageScore ?? 0,
                isPassed,
                startedAt: a.startedAt,
                submittedAt: a.submittedAt ?? null,
            };
        });
    }

    // ════════════════════════════════════════════════════════
    // CRON: Muddati o'tgan attemptlarni expire qilish
    // ════════════════════════════════════════════════════════

    async expireStaleAttempts(): Promise<number> {
        const result = await this.attemptModel.updateMany(
            {
                status: EntityStatus.IN_PROGRESS,
                isDeleted: false,
                expiresAt: { $lte: new Date() },
            },
            {
                $set: { status: EntityStatus.EXPIRED },
                $push: {
                    auditLog: {
                        action: 'AUTO_EXPIRED',
                        performedBy: 'system',
                        performedByRole: 'system',
                        timestamp: new Date(),
                        note: 'Cron: muddati tugadi',
                    },
                },
            }
        );
        if (result.modifiedCount > 0) {
            this.logger.log(`Cron: ${result.modifiedCount} ta attempt expire qilindi`);
        }
        return result.modifiedCount;
    }

    // ════════════════════════════════════════════════════════
    // PRIVATE — Document Guards
    // ════════════════════════════════════════════════════════

    private async requireActiveAttempt(attemptId: string, userId: string): Promise<AttemptDoc> {
        this.assertValidId(attemptId, 'Attempt');

        const doc = await this.attemptModel
            .findOne({
                _id: new Types.ObjectId(attemptId),
                userId: new Types.ObjectId(userId),
                isDeleted: false,
            })
            .exec();

        if (!doc) throw new NotFoundException('Attempt topilmadi');
        const d = doc as AttemptDoc;

        if (TERMINAL_STATUSES.has(d.status)) {
            throw new BadRequestException('Bu attempt allaqachon yakunlangan');
        }

        // Lazy expire: muddati o'tgan bo'lsa avtomatik expire
        if (d.expiresAt && d.expiresAt < new Date()) {
            d.status = EntityStatus.EXPIRED;
            this.pushAudit(d, {
                action: 'AUTO_EXPIRED',
                performedBy: 'system',
                performedByRole: 'system',
                timestamp: new Date(),
                note: 'Muddati tugadi (lazy check)',
            });
            await d.save();
            this.logger.warn(`Lazy expire: attempt=${attemptId}`);
            throw new BadRequestException('Attempt muddati tugagan');
        }

        return d;
    }

    private async requireExam(examId: string): Promise<IELTSExamDocument> {
        const exam = await this.examModel.findById(examId).exec();
        if (!exam) throw new NotFoundException('Exam topilmadi');
        return exam;
    }

    // ════════════════════════════════════════════════════════
    // PRIVATE — Grading
    // ════════════════════════════════════════════════════════

    private gradeReadingAnswers(answers: SubmitReadingAnswerDto[], section: any): { graded: any[]; correct: number } {
        let correct = 0;
        const graded: any[] = [];

        for (const ans of answers) {
            const passage = section.passages?.find((p: any) => p.passageNumber === ans.passageNumber);
            const q = passage?.questions?.find((q: any) => q.questionNumber === ans.questionNumber);

            if (!q) {
                this.logger.warn(`Reading savol topilmadi: passage=${ans.passageNumber} q=${ans.questionNumber}`);
                continue;
            }

            const userAns = this.normalizeAnswer(ans.answer ?? (ans.multipleAnswers ?? []).join(','));
            const correctAns = this.normalizeAnswer(q.correctAnswer ?? '');
            const acceptable = (q.acceptableAnswers ?? []).map((a: string) => this.normalizeAnswer(a));
            const isCorrect = userAns === correctAns || acceptable.includes(userAns);
            if (isCorrect) correct++;

            graded.push({
                passageNumber: ans.passageNumber,
                questionNumber: ans.questionNumber,
                answer: ans.answer ?? (ans.multipleAnswers ?? []).join(', '),
                multipleAnswers: ans.multipleAnswers ?? [],
                isCorrect,
                pointsEarned: isCorrect ? (q.points ?? 1) : 0,
                answeredAt: new Date(),
            });
        }

        return { graded, correct };
    }

    private gradeListeningAnswers(answers: SubmitListeningAnswerDto[], section: any): { graded: any[]; correct: number } {
        let correct = 0;
        const graded: any[] = [];

        for (const ans of answers) {
            const part = section.parts?.find((p: any) => p.partNumber === ans.partNumber);
            const q = part?.questions?.find((q: any) => q.questionNumber === ans.questionNumber);

            if (!q) {
                this.logger.warn(`Listening savol topilmadi: part=${ans.partNumber} q=${ans.questionNumber}`);
                continue;
            }

            const userAns = this.normalizeAnswer(ans.answer ?? (ans.multipleAnswers ?? []).join(','));
            const correctAns = this.normalizeAnswer(q.correctAnswer ?? '');
            const acceptable = (q.acceptableAnswers ?? []).map((a: string) => this.normalizeAnswer(a));
            const isCorrect = userAns === correctAns || acceptable.includes(userAns);
            if (isCorrect) correct++;

            graded.push({
                partNumber: ans.partNumber,
                questionNumber: ans.questionNumber,
                answer: ans.answer ?? (ans.multipleAnswers ?? []).join(', '),
                multipleAnswers: ans.multipleAnswers ?? [],
                isCorrect,
                pointsEarned: isCorrect ? (q.points ?? 1) : 0,
                answeredAt: new Date(),
            });
        }

        return { graded, correct };
    }

    // ════════════════════════════════════════════════════════
    // PRIVATE — Status Sync
    // ════════════════════════════════════════════════════════

    private syncSubmissionStatus(d: AttemptDoc, exam: IELTSExamDocument): void {
        const allAnswered = (!exam.readingSection || d.readingAnswers.length > 0) && (!exam.listeningSection || d.listeningAnswers.length > 0) && (!exam.writingSection || d.writingAnswers.length > 0) && (!exam.speakingSection || d.speakingAnswers.length > 0);

        if (!allAnswered) return;

        // Writing yoki Speaking bo'lsa — manual grading kutiladi
        if (exam.writingSection || exam.speakingSection) {
            d.status = EntityStatus.GRADING;
        } else {
            // Faqat R/L bo'lsa — avtomatik grade
            d.status = EntityStatus.GRADED;
            d.submittedAt = new Date();
            this.calcOverallBand(d);
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
    // PRIVATE — Section Helpers
    // ════════════════════════════════════════════════════════

    private isSectionDone(d: AttemptDoc, section: string): boolean {
        return Array.isArray(d.sectionsSubmitted) && d.sectionsSubmitted.includes(section);
    }

    private markSection(d: AttemptDoc, section: string): void {
        if (!Array.isArray(d.sectionsSubmitted)) d.sectionsSubmitted = [];
        if (!this.isSectionDone(d, section)) d.sectionsSubmitted.push(section);
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

    // ════════════════════════════════════════════════════════
    // PRIVATE — Pagination
    // ════════════════════════════════════════════════════════

    private async paginate(filter: FilterQuery<IELTSExamAttemptDocument>, page: number, limit: number, examFields: string, userFields: string, isAdmin: boolean): Promise<PaginatedAttempts> {
        const skip = (page - 1) * limit;
        const select = isAdmin ? '' : USER_HIDDEN_FIELDS;

        const [attempts, total] = await Promise.all([this.attemptModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('examId', examFields).populate('userId', userFields).select(select).exec(), this.attemptModel.countDocuments(filter)]);

        const totalPages = Math.ceil(total / limit);
        return {
            attempts,
            total,
            page,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        };
    }

    // ════════════════════════════════════════════════════════
    // PRIVATE — Utilities
    // ════════════════════════════════════════════════════════

    private assertValidId(id: string, label = 'ID'): void {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`Noto'g'ri ${label} format: ${id}`);
        }
    }

    /** Javob matnini normallashtirish: lowercase, trim, maxsus belgilarni olib tashlash */
    private normalizeAnswer(s: string): string {
        return (s ?? '')
            .toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ');
    }

    private countWords(text: string): number {
        return (text ?? '')
            .trim()
            .split(/\s+/)
            .filter((w) => w.length > 0).length;
    }

    /** IELTS rasmiy yaxlitlash: eng yaqin 0.5 ga */
    private roundBand(v: number): number {
        return Math.round(v * 2) / 2;
    }

    private lookupBand(n: number, table: [number, number][]): number {
        for (const [min, band] of table) {
            if (n >= min) return band;
        }
        return 0;
    }
}

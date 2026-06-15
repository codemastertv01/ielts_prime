import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { buildMeta } from '../dto/metadata-info.dto';
import { getUserId } from '../guards/request.interface';

import { IELTSCacheService } from '../ielts/ielts.cache.service';
import { IELTSExamService } from '../ielts/ielts.exams.service';
import { IELTSValidationService } from '../ielts/ielts.validation.service';
import { IELTSExamAttemptService } from './ielts.attempts.service';

import { GetAttemptsQueryDto } from './dto/get-attempts-query.dto';
import { AutoSaveDto, SaveSpeakingRecordingDto } from './dto/grading.dto';
import { SubmitListeningSectionDto, SubmitReadingSectionDto, SubmitSpeakingSectionDto, SubmitWritingSectionDto } from './dto/submit.dto';

// ══════════════════════════════════════════════════════════════════════════════
// USER CONTROLLER  — /ielts/attempts
// Foydalanuvchi o'z urinishlarini boshqaradi
// Barcha javoblar (readingAnswers, listeningAnswers va h.k.) ko'rinadi
// lekin auditLog, adminNotes, changeHistory YASHIRILADI
// ══════════════════════════════════════════════════════════════════════════════

@ApiTags('Attempts — User')
@Controller('ielts/attempts')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
export class IELTSAttemptController {
    constructor(
        private readonly attemptService: IELTSExamAttemptService,
        private readonly examService: IELTSExamService,
        private readonly validationService: IELTSValidationService,
        private readonly cacheService: IELTSCacheService
    ) {}

    // ────────────────────────────────────────────────────────
    // BOSHLASH
    // POST /ielts/attempts/start/:examId
    // Kiradi: examId (param)
    // Chiqadi: { success, data: attempt, remainingSeconds }
    // Xatoliklar: 404 (exam topilmasa), 400 (vaqt o'tgan)
    // ────────────────────────────────────────────────────────

    @Post('start/:examId')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Yangi attempt boshlash', description: "Exam faol va published bo'lishi shart. " + 'Bir user bir examni bir necha marta topshira oladi — attemptNumber oshib boradi. ' + 'Javobda expiresAt va remainingSeconds qaytariladi.' })
    @ApiParam({ name: 'examId', description: 'Exam ObjectId' })
    @ApiResponse({ status: 201, description: 'Attempt boshlandi' })
    @ApiResponse({ status: 400, description: 'Exam muddati tugagan yoki hali boshlanmagan' })
    @ApiResponse({ status: 404, description: 'Exam topilmadi' })
    async start(@Param('examId') examId: string, @Req() req: Request) {
        const userId = getUserId(req);
        const exam = await this.examService.findById(examId);
        this.validationService.validateExamAccess(exam);

        const attempt = await this.attemptService.startAttempt(userId, examId, buildMeta(req));
        await this.cacheService.clearUserAttemptsCache(userId);
        return { success: true, data: attempt };
    }

    // ────────────────────────────────────────────────────────
    // FAOL ATTEMPT
    // GET /ielts/attempts/active/:examId
    // Kiradi: examId (param)
    // Chiqadi: { data: attempt + remainingSeconds } | { data: null }
    // ────────────────────────────────────────────────────────

    @Get('active/:examId')
    @ApiOperation({ summary: 'Faol (IN_PROGRESS) attempt', description: "Foydalanuvchining berilgan exam bo'yicha davom etayotgan urinishi. " + "Yo'q bo'lsa data: null qaytariladi. " + 'remainingSeconds: qolgan vaqt soniyada.' })
    @ApiParam({ name: 'examId' })
    async getActive(@Param('examId') examId: string, @Req() req: Request) {
        const data = await this.attemptService.getActiveAttempt(getUserId(req), examId);
        return { success: true, data };
    }

    // ────────────────────────────────────────────────────────
    // AUTO-SAVE
    // POST /ielts/attempts/:attemptId/autosave
    // Kiradi: { readingAnswers?, listeningAnswers?, writingTask1?, writingTask2? }
    // Chiqadi: { success, savedAt }
    // Silent fail — xato bo'lsa ham 200 qaytariladi
    // ────────────────────────────────────────────────────────

    @Post(':attemptId/autosave')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Progress avtomatik saqlash', description: 'Har 30 soniyada yoki sahifa yopilganda frontenddan chaqiriladi. ' + "Faqat o'zgargan fieldlar yuboriladi. " + "Xato bo'lsa ham 200 qaytariladi (silent fail)." })
    @ApiParam({ name: 'attemptId' })
    async autoSave(@Param('attemptId') attemptId: string, @Body() dto: AutoSaveDto, @Req() req: Request) {
        await this.attemptService.autoSaveAttempt(attemptId, getUserId(req), dto);
        return { success: true, savedAt: new Date() };
    }

    // ────────────────────────────────────────────────────────
    // VAQT TUGAGANDA EXPIRE
    // POST /ielts/attempts/:attemptId/expire
    // Kiradi: attemptId (param)
    // Chiqadi: { success, expired: true }
    // Frontend timer tugaganda chaqiradi
    // ────────────────────────────────────────────────────────

    @Post(':attemptId/expire')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Vaqt tugaganda expire qilish', description: 'Frontend timer 0 ga tushganda chaqiriladi. ' + "Attempt statusini EXPIRED ga o'tkazadi." })
    @ApiParam({ name: 'attemptId' })
    async expire(@Param('attemptId') attemptId: string, @Req() req: Request) {
        await this.attemptService.forceExpireAttempt(attemptId, getUserId(req));
        return { success: true, expired: true };
    }

    // ────────────────────────────────────────────────────────
    // SPEAKING RECORDING SAQLASH
    // POST /ielts/attempts/:attemptId/speaking/recording
    // Kiradi: { partNumber, recordingUrl, durationSeconds }
    // Chiqadi: { success, saved: true }
    // Firebase/S3 ga yuklangandan KEYIN chaqiriladi
    // ────────────────────────────────────────────────────────

    @Post(':attemptId/speaking/recording')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Speaking recording URL saqlash', description: "Firebase yoki S3 ga audio yuklab bo'lgandan keyin URL ni serverga yuboradi. " + 'partNumber: 1-3. durationSeconds: minimal 30, maksimal 900.' })
    @ApiParam({ name: 'attemptId' })
    async saveSpeakingRecording(@Param('attemptId') attemptId: string, @Body() dto: SaveSpeakingRecordingDto, @Req() req: Request) {
        await this.attemptService.saveSpeakingRecording(attemptId, getUserId(req), dto);
        return { success: true, saved: true };
    }

    // ────────────────────────────────────────────────────────
    // READING TOPSHIRISH
    // POST /ielts/attempts/:attemptId/reading
    // Kiradi: { answers: [{ passageNumber, questionNumber, answer? }] }
    // Chiqadi: gradelangan attempt (readingBandScore avtomatik)
    // ────────────────────────────────────────────────────────

    @Post(':attemptId/reading')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reading topshirish — avtomatik baholash', description: 'Barcha reading javoblari yuboriladi. ' + "readingBandScore IELTS rasmiy jadval bo'yicha avtomatik hisoblanadi. " + "Allaqachon topshirilgan bo'lsa 400 qaytariladi." })
    @ApiParam({ name: 'attemptId' })
    async submitReading(@Param('attemptId') attemptId: string, @Body() dto: SubmitReadingSectionDto, @Req() req: Request) {
        const userId = getUserId(req);
        const result = await this.attemptService.submitReadingSection(attemptId, userId, dto);
        await this.cacheService.clearUserAttemptsCache(userId);
        return { success: true, data: result };
    }

    // ────────────────────────────────────────────────────────
    // LISTENING TOPSHIRISH
    // POST /ielts/attempts/:attemptId/listening
    // Kiradi: { answers: [{ partNumber, questionNumber, answer? }] }
    // Chiqadi: listeningBandScore avtomatik hisoblanadi
    // ────────────────────────────────────────────────────────

    @Post(':attemptId/listening')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Listening topshirish — avtomatik baholash', description: 'partNumber: 1-4. questionNumber: 1-40. ' + "listeningBandScore IELTS rasmiy jadval bo'yicha avtomatik." })
    @ApiParam({ name: 'attemptId' })
    async submitListening(@Param('attemptId') attemptId: string, @Body() dto: SubmitListeningSectionDto, @Req() req: Request) {
        const userId = getUserId(req);
        const result = await this.attemptService.submitListeningSection(attemptId, userId, dto);
        await this.cacheService.clearUserAttemptsCache(userId);
        return { success: true, data: result };
    }

    // ────────────────────────────────────────────────────────
    // WRITING TOPSHIRISH
    // POST /ielts/attempts/:attemptId/writing
    // Kiradi: { tasks: [{ taskNumber, content }] }
    // Chiqadi: status GRADING — manual baholash kutiladi
    // ────────────────────────────────────────────────────────

    @Post(':attemptId/writing')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Writing topshirish — manual baholash kutiladi', description: "task 1: kamida 150 so'z, task 2: kamida 250 so'z. " + "Topshirilgandan keyin status GRADING ga o'tadi. " + "Foydalanuvchiga 'baholash boshlandi' emaili yuboriladi." })
    @ApiParam({ name: 'attemptId' })
    async submitWriting(@Param('attemptId') attemptId: string, @Body() dto: SubmitWritingSectionDto, @Req() req: Request) {
        const userId = getUserId(req);
        const attemptData = await this.attemptService.getAttemptForUser(attemptId, userId);
        const exam = await this.examService.findById(String((attemptData.examId as any)._id ?? attemptData.examId), true);
        // Minimal so'z sonini tekshirish
        dto.tasks.forEach((task) => {
            const def = exam.writingSection?.tasks?.find((t: any) => t.taskNumber === task.taskNumber);
            if (def) this.validationService.validateWritingContent(task.content, def.minimumWords);
        });

        const result = await this.attemptService.submitWritingSection(attemptId, userId, dto, exam);
        await this.cacheService.clearUserAttemptsCache(userId);
        return { success: true, data: result };
    }

    // ────────────────────────────────────────────────────────
    // SPEAKING TOPSHIRISH
    // POST /ielts/attempts/:attemptId/speaking
    // Kiradi: { parts: [{ partNumber, recordingUrl, durationSeconds }] }
    // Chiqadi: status GRADING — manual baholash kutiladi
    // ────────────────────────────────────────────────────────

    @Post(':attemptId/speaking')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Speaking topshirish — manual baholash kutiladi', description: 'Har part uchun recording URL kerak. ' + 'durationSeconds: min 30, max 900 (15 daqiqa). ' + "Status GRADING ga o'tadi." })
    @ApiParam({ name: 'attemptId' })
    async submitSpeaking(@Param('attemptId') attemptId: string, @Body() dto: SubmitSpeakingSectionDto, @Req() req: Request) {
        const userId = getUserId(req);
        const attemptData = await this.attemptService.getAttemptForUser(attemptId, userId);
        const exam = await this.examService.findById(String((attemptData.examId as any)._id ?? attemptData.examId), true);

        const result = await this.attemptService.submitSpeakingSection(attemptId, userId, dto, exam);
        await this.cacheService.clearUserAttemptsCache(userId);
        return { success: true, data: result };
    }

    // ────────────────────────────────────────────────────────
    // O'Z BARCHA URINISHLARI (PAGINATED)
    // GET /ielts/attempts
    // Kiradi: { page, limit, status?, examId? }
    // Chiqadi: paginated attempts (audit/admin fieldlarsiz)
    // ────────────────────────────────────────────────────────

    @Get()
    @ApiOperation({ summary: "O'z barcha urinishlari", description: "Paginated. status bo'yicha filter qilish mumkin. " + 'userId server tomondan tokendan olinadi — query da yuborilmaydi.' })
    async getAll(@Query() query: GetAttemptsQueryDto, @Req() req: Request) {
        // Foydalanuvchi faqat o'zinikini ko'radi
        const result = await this.attemptService.getAllUserAttempts(getUserId(req), query);
        return { success: true, ...result };
    }

    // ────────────────────────────────────────────────────────
    // DASHBOARD NATIJALARI
    // GET /ielts/attempts/dashboard
    // Kiradi: -
    // Chiqadi: UserAttemptResult[] — faqat score va status (yengil payload)
    // ────────────────────────────────────────────────────────

    @Get('dashboard')
    @ApiOperation({ summary: 'Dashboard uchun natijalar', description: 'Foydalanuvchining barcha GRADED va GRADING urinishlarini ' + 'optimallashtirilgan formatda qaytaradi. ' + 'Faqat: examTitle, band scores, isPassed, dates.' })
    async getDashboard(@Req() req: Request) {
        const data = await this.attemptService.getUserDashboardResults(getUserId(req));
        return { success: true, data, count: data.length };
    }

    // ────────────────────────────────────────────────────────
    // BIROR EXAM BO'YICHA TARIXI
    // GET /ielts/attempts/exam/:examId/history
    // Kiradi: examId (param)
    // Chiqadi: shu exam bo'yicha barcha urinishlar (eng yangi birinchi)
    // ────────────────────────────────────────────────────────

    @Get('exam/:examId/history')
    @ApiOperation({ summary: "Exam bo'yicha urinishlar tarixi", description: 'Berilgan exam uchun foydalanuvchining barcha urinishlari, eng yangi birinchi.' })
    @ApiParam({ name: 'examId' })
    async getExamHistory(@Param('examId') examId: string, @Req() req: Request) {
        const data = await this.attemptService.getUserExamAttempts(getUserId(req), examId);
        return { success: true, data, count: data.length };
    }

    // ────────────────────────────────────────────────────────
    // BITTA ATTEMPT (O'Z)
    // GET /ielts/attempts/:attemptId
    // Kiradi: attemptId (param)
    // Chiqadi: attempt (audit/admin fieldlarsiz)
    // ────────────────────────────────────────────────────────

    @Get(':attemptId')
    @ApiOperation({ summary: "O'z attemptini ko'rish", description: "Foydalanuvchi faqat o'z attemptini ko'ra oladi. " + "Reading/listening javoblari (isCorrect bilan) ko'rinadi. " + "auditLog, adminNotes, changeHistory ko'rinmaydi." })
    @ApiParam({ name: 'attemptId' })
    async getOne(@Param('attemptId') attemptId: string, @Req() req: Request) {
        const data = await this.attemptService.getAttemptForUser(attemptId, getUserId(req));
        return { success: true, data };
    }
}

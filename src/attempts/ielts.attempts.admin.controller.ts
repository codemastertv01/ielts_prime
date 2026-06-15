import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { buildMeta } from '../dto/metadata-info.dto';
import { getUserId } from '../guards/request.interface';
import { BulkDeleteDto } from '../dto/bulk-delete.dto';
import { EntityStatus } from '../dto/entity-status.dto';

import { IELTSNotificationService } from './ielts.notification.service';

import { GetAttemptsQueryDto } from './dto/get-attempts-query.dto';
import { GradeWritingDto, GradeSpeakingDto, AdminUpdateAttemptDto } from './dto/grading.dto';
import { IELTSExamAttemptsAdminService } from './ielts.attempts.admin.service';

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN CONTROLLER  — /admin/ielts/attempts
// Admin barcha attemptlarni ko'radi va boshqaradi
// ══════════════════════════════════════════════════════════════════════════════

@ApiTags('Attempts — Admin')
@Controller('admin/ielts/attempts')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
export class IELTSAttemptAdminController {
    constructor(
        private readonly attemptService: IELTSExamAttemptsAdminService,
        private readonly notificationService: IELTSNotificationService
    ) {}

    // ────────────────────────────────────────────────────────
    // STATISTIKA
    // GET /admin/ielts/attempts/stats
    // Chiqadi: { total, active:{...}, deleted, avgBandScore, bandDistribution, ... }
    // ────────────────────────────────────────────────────────

    @Get('stats')
    @ApiOperation({ summary: 'Dashboard statistikasi', description: 'total, inProgress, submitted, grading, graded, expired, deleted. ' + 'avgBandScore, bandDistribution. todayAttempts, weekAttempts.' })
    async getStats() {
        const data = await this.attemptService.getAdminStats();
        return { success: true, data };
    }

    // ────────────────────────────────────────────────────────
    // BARCHA ATTEMPTLAR
    // GET /admin/ielts/attempts
    // Kiradi: { page, limit, status?, examId?, userId?, isDeleted? }
    // Chiqadi: paginated attempts (barcha fieldlar)
    // ────────────────────────────────────────────────────────

    @Get()
    @ApiOperation({ summary: 'Barcha attemptlar — filter + pagination', description: 'isDeleted: true=trash | false=active | omit=hammasi. ' + "status, examId, userId bo'yicha filter mumkin." })
    @ApiQuery({ name: 'status', required: false, enum: EntityStatus })
    @ApiQuery({ name: 'examId', required: false })
    @ApiQuery({ name: 'userId', required: false })
    @ApiQuery({ name: 'isDeleted', required: false, type: Boolean })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getAll(@Query() query: GetAttemptsQueryDto) {
        const result = await this.attemptService.getAllAttemptsAdmin(query);
        return { success: true, ...result };
    }

    @Get('exam/:examId')
    @ApiOperation({ summary: 'Exam ning barcha attemptlari' })
    @ApiParam({ name: 'examId' })
    async getByExam(@Param('examId') examId: string, @Query() query: GetAttemptsQueryDto) {
        const result = await this.attemptService.getExamAttemptsAdmin(examId, query);
        return { success: true, ...result };
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'User ning barcha attemptlari' })
    @ApiParam({ name: 'userId' })
    async getByUser(@Param('userId') userId: string, @Query() query: GetAttemptsQueryDto) {
        const result = await this.attemptService.getUserAttemptsAdmin(userId, query);
        return { success: true, ...result };
    }

    // ────────────────────────────────────────────────────────
    // BITTA ATTEMPT (TO'LIQ)
    // GET /admin/ielts/attempts/:attemptId
    // Chiqadi: barcha fieldlar (auditLog, adminNotes va boshqalar)
    // ────────────────────────────────────────────────────────

    @Get(':attemptId')
    @ApiOperation({ summary: "Attemptni to'liq ko'rish", description: 'Barcha fieldlar: auditLog, adminNotes, changeHistory bilan.' })
    @ApiParam({ name: 'attemptId' })
    async getOne(@Param('attemptId') attemptId: string) {
        const data = await this.attemptService.getAttemptForAdmin(attemptId);
        return { success: true, data };
    }

    @Get(':attemptId/audit-log')
    @ApiOperation({ summary: 'Audit log', description: 'Barcha amallar tarixi (teskari tartibda — eng yangi birinchi).' })
    @ApiParam({ name: 'attemptId' })
    async getAuditLog(@Param('attemptId') attemptId: string) {
        const data = await this.attemptService.getAuditLog(attemptId);
        return { success: true, data, count: data.length };
    }

    @Get(':attemptId/change-history')
    @ApiOperation({ summary: "O'zgarishlar tarixi", description: "Band score o'zgarishlari, status o'zgarishlari (teskari tartibda)." })
    @ApiParam({ name: 'attemptId' })
    async getChangeHistory(@Param('attemptId') attemptId: string) {
        const data = await this.attemptService.getChangeHistory(attemptId);
        return { success: true, data, count: data.length };
    }

    // ────────────────────────────────────────────────────────
    // ATTEMPT YANGILASH (META)
    // PUT /admin/ielts/attempts/:attemptId
    // Kiradi: AdminUpdateAttemptDto
    // Chiqadi: yangilangan attempt
    // ────────────────────────────────────────────────────────

    @Put(':attemptId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Attempt meta yangilash', description: 'Status, band scorelar, tags, review, adminNote va generalFeedback ni ' + "qo'lda yangilash. Har bir o'zgarish changeHistory ga yoziladi." })
    @ApiParam({ name: 'attemptId' })
    async update(@Param('attemptId') attemptId: string, @Body() dto: AdminUpdateAttemptDto, @Req() req: Request) {
        const data = await this.attemptService.adminUpdateAttempt(attemptId, dto, getUserId(req), buildMeta(req));
        return { success: true, message: 'Attempt yangilandi', data };
    }

    // ────────────────────────────────────────────────────────
    // WRITING BAHOLASH
    // POST /admin/ielts/attempts/:attemptId/grade/writing
    // Kiradi: { taskNumber, taskAchievement, coherenceCohesion, lexicalResource, grammaticalRange, feedback? }
    // Chiqadi: baholangan attempt + natija emaili (agar to'liq baholangan bo'lsa)
    // ────────────────────────────────────────────────────────

    @Post(':attemptId/grade/writing')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Writing task baholash', description: '4 ta kriter (0–9, 0.5 qadam). ' + "Band = (yig'indi) / 4 → 0.5 ga yaxlitlash. " + 'Barcha writing/speaking baholanganda email yuboriladi.' })
    @ApiParam({ name: 'attemptId' })
    @ApiResponse({ status: 200 })
    async gradeWriting(@Param('attemptId') attemptId: string, @Body() dto: GradeWritingDto, @Req() req: Request) {
        const attempt = await this.attemptService.gradeWriting(attemptId, dto, getUserId(req), buildMeta(req));

        // Bildirishnomalar
        await this.notificationService.notifyWritingGraded(attemptId, attempt.userId.toString());

        if (attempt.status === EntityStatus.GRADED && attempt.overallBandScore != null) {
            // To'liq baholanganda email yuborish uchun payload yig'ish
            const emailPayload = this.buildResultEmailPayload(attempt);
            await this.notificationService.notifyFullyGraded(attemptId, attempt.userId.toString(), attempt.overallBandScore, emailPayload);
        }

        return { success: true, data: attempt };
    }

    // ────────────────────────────────────────────────────────
    // SPEAKING BAHOLASH
    // POST /admin/ielts/attempts/:attemptId/grade/speaking
    // Kiradi: { partNumber, fluencyCoherence, lexicalResource, grammaticalRange, pronunciation, feedback? }
    // Chiqadi: baholangan attempt
    // ────────────────────────────────────────────────────────

    @Post(':attemptId/grade/speaking')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Speaking part baholash', description: '4 ta kriter: fluencyCoherence, lexicalResource, grammaticalRange, pronunciation. ' + "Band = (yig'indi) / 4 → 0.5 ga yaxlitlash." })
    @ApiParam({ name: 'attemptId' })
    @ApiResponse({ status: 200 })
    async gradeSpeaking(@Param('attemptId') attemptId: string, @Body() dto: GradeSpeakingDto, @Req() req: Request) {
        const attempt = await this.attemptService.gradeSpeaking(attemptId, dto, getUserId(req), buildMeta(req));

        await this.notificationService.notifySpeakingGraded(attemptId, attempt.userId.toString());

        if (attempt.status === EntityStatus.GRADED && attempt.overallBandScore != null) {
            const emailPayload = this.buildResultEmailPayload(attempt);
            await this.notificationService.notifyFullyGraded(attemptId, attempt.userId.toString(), attempt.overallBandScore, emailPayload);
        }

        return { success: true, data: attempt };
    }

    // ────────────────────────────────────────────────────────
    // BULK SOFT DELETE
    // DELETE /admin/ielts/attempts/bulk
    // Kiradi: { ids: string[], reason? }
    // Chiqadi: { succeeded, failed: [{ id, reason }] }
    // ────────────────────────────────────────────────────────

    @Delete('bulk')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Bulk soft delete', description: "Bir nechta attemptni bir vaqtda o'chirish. " + "Noto'g'ri ID va allaqachon o'chirilganlar failed arrayga tushadi." })
    async bulkDelete(@Body() dto: BulkDeleteDto, @Req() req: Request) {
        const data = await this.attemptService.bulkSoftDelete(dto, getUserId(req), buildMeta(req));
        return { success: true, message: `${data.succeeded} ta o'chirildi · ${data.failed.length} ta xato`, data };
    }

    @Post('bulk/restore')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Bulk restore', description: 'Soft-delete qilingan attemptlarni tiklash.' })
    async bulkRestore(@Body() body: { attemptIds: string[]; reason?: string }, @Req() req: Request) {
        const data = await this.attemptService.bulkRestore(body.attemptIds, getUserId(req), buildMeta(req));
        return { success: true, message: `${data.succeeded} ta tiklandi · ${data.failed.length} ta xato`, data };
    }

    // ────────────────────────────────────────────────────────
    // BITTA SOFT DELETE
    // DELETE /admin/ielts/attempts/:attemptId
    // Kiradi: { reason? } (body)
    // Chiqadi: { success, message, attemptId }
    // ────────────────────────────────────────────────────────

    @Delete(':attemptId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Soft delete — 30 kunlik recovery window' })
    @ApiParam({ name: 'attemptId' })
    async softDelete(@Param('attemptId') attemptId: string, @Body() body: { reason?: string }, @Req() req: Request) {
        const metadata = buildMeta(req);
        await this.attemptService.softDeleteAttempt(attemptId, body?.reason, metadata);
        return { success: true, message: "Attempt o'chirildi", attemptId };
    }

    @Post(':attemptId/restore')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Restore (soft-delete dan qaytarish)' })
    @ApiParam({ name: 'attemptId' })
    async restore(@Param('attemptId') attemptId: string, @Body() body: { reason?: string }, @Req() req: Request) {
        const data = await this.attemptService.restoreAttempt(attemptId, body?.reason, buildMeta(req));
        return { success: true, message: 'Attempt tiklandi', data };
    }

    // ────────────────────────────────────────────────────────
    // PERMANENT DELETE
    // DELETE /admin/ielts/attempts/:attemptId/permanent
    // Faqat avval soft-delete qilingan attemptlarni o'chiradi
    // QAYTARIB BO'LMAYDI
    // ────────────────────────────────────────────────────────

    @Delete(':attemptId/permanent')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: "Permanent delete — QAYTARIB BO'LMAYDI", description: "Avval soft-delete qilingan bo'lishi SHART. " + 'ielts:attempt:manage permissioni talab etiladi.' })
    @ApiParam({ name: 'attemptId' })
    async hardDelete(@Param('attemptId') attemptId: string, @Req() req: Request): Promise<void> {
        await this.attemptService.hardDeleteAttempt(attemptId, getUserId(req));
    }

    // ════════════════════════════════════════════════════════
    // PRIVATE
    // ════════════════════════════════════════════════════════

    /**
     * Attempt dan email uchun payload yaratish.
     * populate qilingan examId va userId dan ma'lumot olinadi.
     */
    private buildResultEmailPayload(attempt: any): any {
        const exam = attempt.examId ?? {};
        const user = attempt.userId ?? {};

        return {
            userEmail: user.email ?? '',
            userName: (`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username) ?? 'Foydalanuvchi',
            examTitle: exam.title ?? 'IELTS Test',
            examType: exam.examType ?? '',
            module: exam.module ?? '',
            attemptNumber: attempt.attemptNumber,
            overallBandScore: attempt.overallBandScore,
            readingBandScore: attempt.readingBandScore ?? undefined,
            listeningBandScore: attempt.listeningBandScore ?? undefined,
            writingBandScore: attempt.writingBandScore ?? undefined,
            speakingBandScore: attempt.speakingBandScore ?? undefined,
            percentageScore: attempt.percentageScore ?? 0,
            isPassed: attempt.overallBandScore != null && exam.passingScore != null ? attempt.overallBandScore >= exam.passingScore : false,
            passingScore: exam.passingScore ?? 5.5,
            writingFeedback: attempt.writingAnswers
                ?.filter((w: any) => w.bandScore != null)
                .map((w: any) => ({
                    taskNumber: w.taskNumber,
                    bandScore: w.bandScore,
                    criteriaScores: w.criteriaScores,
                    feedback: w.feedback,
                })),
            speakingFeedback: attempt.speakingAnswers
                ?.filter((s: any) => s.bandScore != null)
                .map((s: any) => ({
                    partNumber: s.partNumber,
                    bandScore: s.bandScore,
                    criteriaScores: s.criteriaScores,
                    feedback: s.feedback,
                })),
            startedAt: attempt.startedAt,
            submittedAt: attempt.submittedAt,
            gradedAt: new Date(),
            resultUrl: `${process.env.FRONTEND_URL ?? 'https://platform.uz'}/results/${attempt._id}`,
        };
    }
}

// ielts/ielts.exams.controller.ts
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { IELTSExamService } from './ielts.exams.service';
import { IELTSCacheService } from './ielts.cache.service';
import { CreateIELTSExamDto } from './dto/create-exam.dto';
import { UpdateIELTSExamDto } from './dto/update-exam.dto';
import { AdminFindAllDto, UserFindAllDto } from './dto/find-all.dto';
import { DifficultyLevel, ExamModule, ExamType } from './dto/enums';
import { buildMeta } from '../dto/metadata-info.dto';

// ══════════════════════════════════════════════════════════════════════════════
// USER CONTROLLER
// ══════════════════════════════════════════════════════════════════════════════

@ApiTags('IELTS Exams — User')
@Controller('ielts/exams')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
export class IELTSExamController {
    constructor(
        private readonly examService: IELTSExamService,
        private readonly cacheService: IELTSCacheService
    ) {}

    @Get()
    @ApiOperation({ summary: 'Published + active exams (user-facing)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'examType', required: false, enum: ExamType })
    @ApiQuery({ name: 'module', required: false, enum: ExamModule })
    @ApiQuery({ name: 'difficulty', required: false, enum: DifficultyLevel })
    @ApiQuery({ name: 'isPremium', required: false, type: Boolean })
    @ApiQuery({ name: 'sortBy', required: false })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
    async findAll(@Query() query: UserFindAllDto) {
        const cacheKey = `exam-list:user:${JSON.stringify(query)}`;
        const cached = await this.cacheService.getCachedUserAttempts(cacheKey);
        if (cached) return { success: true, ...cached };

        const result = await this.examService.userFindAll(query);
        await this.cacheService.cacheExam(cacheKey, result, 300);
        return { success: true, ...result };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get exam by ID (answers excluded)' })
    @ApiParam({ name: 'id' })
    async findOne(@Param('id') id: string) {
        const cached = await this.cacheService.getCachedExam(id);
        if (cached) return { success: true, data: cached };

        const exam = await this.examService.findById(id, false);
        await this.cacheService.cacheExam(id, exam);
        return { success: true, data: exam };
    }

    @Get(':id/statistics')
    @ApiOperation({ summary: 'Exam statistics (public)' })
    @ApiParam({ name: 'id' })
    async getStatistics(@Param('id') id: string) {
        const data = await this.examService.getStatistics(id);
        return { success: true, data };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN CONTROLLER
// ══════════════════════════════════════════════════════════════════════════════

@ApiTags('IELTS Exams — Admin')
@Controller('admin/ielts/exams')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
export class IELTSExamAdminController {
    constructor(
        private readonly examService: IELTSExamService,
        private readonly cacheService: IELTSCacheService
    ) {}

    // ── Statistics ───────────────────────────────────────────

    @Get('global-stats')
    @ApiOperation({ summary: 'Global exam statistics dashboard' })
    async getGlobalStats() {
        const cacheKey = 'exam-global-stats';
        const cached = await this.cacheService.getCachedExam(cacheKey);
        if (cached) return { success: true, data: cached };

        const data = await this.examService.getGlobalStatistics();
        await this.cacheService.cacheExam(cacheKey, data, 600);
        return { success: true, data };
    }

    // ── List ─────────────────────────────────────────────────

    @Get()
    @ApiOperation({ summary: 'All exams — filter + pagination', description: 'isDeleted: true=trash | false=active | omit=all\n' + 'limit: 0 → all records (no pagination)\n' + "examType: '' or 'all' → all types" })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: '0 = all' })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'examType', required: false, enum: ExamType })
    @ApiQuery({ name: 'module', required: false, enum: ExamModule })
    @ApiQuery({ name: 'difficulty', required: false, enum: DifficultyLevel })
    @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
    @ApiQuery({ name: 'isPremium', required: false, type: Boolean })
    @ApiQuery({ name: 'isDeleted', required: false, type: Boolean })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'sortBy', required: false })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
    @ApiQuery({ name: 'createdFrom', required: false })
    @ApiQuery({ name: 'createdTo', required: false })
    async findAll(@Query() query: AdminFindAllDto) {
        const result = await this.examService.adminFindAll(query);
        return { success: true, ...result };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get exam by ID (with answers included)' })
    @ApiParam({ name: 'id' })
    @ApiQuery({ name: 'includeAnswers', required: false, type: Boolean })
    async findOne(@Param('id') id: string, @Query('includeAnswers') includeAnswers?: string) {
        const withAnswers = includeAnswers === 'true';
        if (!withAnswers) {
            const cached = await this.cacheService.getCachedExam(id);
            if (cached) return { success: true, data: cached };
        }
        const exam = await this.examService.findById(id, withAnswers);
        if (!withAnswers) await this.cacheService.cacheExam(id, exam);
        return { success: true, data: exam };
    }

    @Get(':id/statistics')
    @ApiOperation({ summary: 'Exam statistics (admin detail)' })
    @ApiParam({ name: 'id' })
    async getStatistics(@Param('id') id: string) {
        const data = await this.examService.getStatistics(id);
        return { success: true, data };
    }

    // ── Create ───────────────────────────────────────────────

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create new IELTS exam' })
    @ApiResponse({ status: 201 })
    async create(@Body() dto: CreateIELTSExamDto, @Req() req: Request) {
        const data = await this.examService.create(dto, buildMeta(req));
        return { success: true, message: 'Exam muvaffaqiyatli yaratildi', data };
    }

    // ── Update ───────────────────────────────────────────────

    @Put(':id')
    @ApiOperation({ summary: 'Update exam' })
    @ApiParam({ name: 'id' })
    async update(@Param('id') id: string, @Body() dto: UpdateIELTSExamDto, @Req() req: Request) {
        const data = await this.examService.update(id, dto, buildMeta(req));
        await this.cacheService.clearExamCache(id);
        return { success: true, message: 'Exam muvaffaqiyatli yangilandi', data };
    }

    // ── Publish ──────────────────────────────────────────────

    @Post(':id/publish')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Publish exam' })
    @ApiParam({ name: 'id' })
    async publish(@Param('id') id: string, @Req() req: Request) {
        const data = await this.examService.publish(id, buildMeta(req));
        await this.cacheService.clearExamCache(id);
        return { success: true, message: 'Exam published', data };
    }

    @Post(':id/unpublish')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Unpublish exam' })
    @ApiParam({ name: 'id' })
    async unpublish(@Param('id') id: string, @Req() req: Request) {
        const data = await this.examService.unpublish(id, buildMeta(req));
        await this.cacheService.clearExamCache(id);
        return { success: true, message: 'Exam unpublished', data };
    }

    // ── Delete ───────────────────────────────────────────────

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Soft-delete exam' })
    @ApiParam({ name: 'id' })
    async softDelete(@Param('id') id: string, @Req() req: Request) {
        await this.examService.softDelete(id, buildMeta(req));
        await this.cacheService.clearExamCache(id);
        return { success: true, message: "Exam o'chirildi" };
    }

    // ── Restore ──────────────────────────────────────────────

    @Post(':id/restore')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Restore soft-deleted exam' })
    @ApiParam({ name: 'id' })
    async restore(@Param('id') id: string, @Req() req: Request) {
        const data = await this.examService.restore(id, buildMeta(req));
        await this.cacheService.clearExamCache(id);
        return { success: true, message: 'Exam tiklandi', data };
    }

    @Delete('bulk')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Bulk soft-delete exams' })
    async bulkDelete(@Body() body: { examIds: string[] }, @Req() req: Request) {
        const data = await this.examService.bulkSoftDelete(body.examIds, buildMeta(req));
        for (const id of body.examIds) await this.cacheService.clearExamCache(id);
        return {
            success: true,
            message: `${data.succeeded} ta o'chirildi · ${data.failed.length} ta xato`,
            data,
        };
    }

    // ── Restore ──────────────────────────────────────────────

    @Post('bulk/restore')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Bulk restore soft-deleted exams' })
    async bulkRestore(@Body() body: { examIds: string[] }, @Req() req: Request) {
        const data = await this.examService.bulkRestore(body.examIds, buildMeta(req));
        return {
            success: true,
            message: `${data.succeeded} ta tiklandi · ${data.failed.length} ta xato`,
            data,
        };
    }
}

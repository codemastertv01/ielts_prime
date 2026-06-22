import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { PermissionsService } from './permissions.service';
import type { MetadataInfo } from '../dto/metadata-info.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { GetPermissionsDto } from './dto/get-permissions.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { BulkDeleteDto } from '../dto/bulk-delete.dto';
import { ChangeStatusDto } from '../dto/change-status.dto';
import { AuthGuard } from '../guards/auth.guard';
import { ApiPathPermissionGuard } from '../guards/api-path-permission.guard';

@ApiTags('Permissions')
@Controller('permissions')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, ApiPathPermissionGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) {}

    // ── Metadata helper ────────────────────────────────────
    private meta(req: Request): MetadataInfo {
        const u = (req as any).user ?? {};
        return {
            userId: u.id ?? u._id ?? 'system',
            username: u.username ?? 'system',
            email: u.email ?? 'system@app.com',
            ipAddress: req.ip ?? '0.0.0.0',
            userAgent: req.headers['user-agent'] ?? '',
            device: 'unknown',
            browser: 'unknown',
            os: 'unknown',
            timestamp: new Date(),
        } as MetadataInfo;
    }

    // ════════════════════════════════════════════════════════
    // CREATE
    // ════════════════════════════════════════════════════════

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a single permission' })
    @ApiResponse({ status: 201, description: 'Permission created' })
    @ApiResponse({ status: 409, description: 'Permission already exists' })
    async create(@Body() dto: CreatePermissionDto, @Req() req: Request) {
        const data = await this.permissionsService.create(dto, this.meta(req));
        return {
            success: true,
            message: 'Permission muvaffaqiyatli yaratildi',
            data,
        };
    }

    @Post('bulk')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Bulk create permissions' })
    @ApiResponse({ status: 201 })
    async createMultiple(@Body() dtos: CreatePermissionDto[], @Req() req: Request) {
        const data = await this.permissionsService.createMultiple(dtos, this.meta(req));
        return {
            success: true,
            message: `${data.createdCount} ta permission yaratildi`,
            data,
        };
    }

    // ════════════════════════════════════════════════════════
    // READ
    // ════════════════════════════════════════════════════════

    @Get()
    @ApiOperation({ summary: 'List permissions — paginated, filtered, sorted' })
    async findAll(@Query() query: GetPermissionsDto) {
        const result = await this.permissionsService.findAll(query);
        return { success: true, ...result };
    }

    @Get('statistics')
    @ApiOperation({ summary: 'Aggregate statistics (byStatus, byCategory, byResource)' })
    async getStatistics() {
        const data = await this.permissionsService.getStatistics();
        return { success: true, data };
    }

    @Get('resource/:resource')
    @ApiOperation({ summary: 'Get all active permissions for a resource' })
    @ApiParam({ name: 'resource' })
    async findByResource(@Param('resource') resource: string) {
        const data = await this.permissionsService.findByResource(resource);
        return { success: true, data, count: data.length };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single permission by ID' })
    @ApiParam({ name: 'id' })
    async findOne(@Param('id') id: string) {
        const data = await this.permissionsService.findOne(id);
        return { success: true, data };
    }

    // ════════════════════════════════════════════════════════
    // UPDATE
    // ════════════════════════════════════════════════════════

    @Patch(':id')
    @ApiOperation({ summary: 'Update permission fields (isSystemPermission cannot be unset)' })
    @ApiParam({ name: 'id' })
    async update(@Param('id') id: string, @Body() dto: UpdatePermissionDto, @Req() req: Request) {
        const data = await this.permissionsService.update(id, dto, this.meta(req));
        return {
            success: true,
            message: 'Permission muvaffaqiyatli yangilandi',
            data,
        };
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Change permission status (ACTIVE / INACTIVE / PENDING)' })
    @ApiParam({ name: 'id' })
    async changeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto, @Req() req: Request) {
        const data = await this.permissionsService.changeStatus(id, dto, this.meta(req));
        return {
            success: true,
            message: `Permission status '${dto.status}' ga o'zgartirildi`,
            data,
        };
    }

    @Patch(':id/restore')
    @ApiOperation({ summary: 'Restore a soft-deleted permission' })
    @ApiParam({ name: 'id' })
    async restore(@Param('id') id: string, @Req() req: Request) {
        const data = await this.permissionsService.restore(id, this.meta(req));
        return { success: true, message: 'Permission qayta tiklandi', data };
    }

    // ════════════════════════════════════════════════════════
    // DELETE
    // ════════════════════════════════════════════════════════

    @Delete('bulk-delete')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Bulk soft-delete (system permissions are skipped automatically)' })
    async bulkDelete(@Body() dto: BulkDeleteDto, @Req() req: Request) {
        const data = await this.permissionsService.softDeleteMultiple(dto, this.meta(req));

        const parts: string[] = [`${data.deletedCount} ta permission o'chirildi`];
        if (data.notFoundIds.length) parts.push(`${data.notFoundIds.length} ta ID topilmadi`);
        if (data.invalidIds.length) parts.push(`${data.invalidIds.length} ta ID noto'g'ri format`);
        if (data.systemPermissionIds.length) parts.push(`${data.systemPermissionIds.length} ta system permission o'tkazib yuborildi`);
        if (data.alreadyDeletedIds.length) parts.push(`${data.alreadyDeletedIds.length} ta allaqachon o'chirilgan`);

        return { success: true, message: parts.join(' · '), data };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Soft-delete a permission (30-day recovery window)' })
    @ApiParam({ name: 'id' })
    async softDelete(@Param('id') id: string, @Req() req: Request) {
        const data = await this.permissionsService.softDelete(id, this.meta(req));
        return {
            success: true,
            message: `Permission o'chirildi. ${data.scheduledDeletionAt?.toLocaleDateString('uz-UZ')} gacha tiklanishi mumkin`,
            data,
        };
    }

    @Delete(':id/permanent')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Permanently delete a permission — IRREVERSIBLE. Requires soft-delete first + permissions:manage.' })
    @ApiParam({ name: 'id' })
    async permanentDelete(@Param('id') id: string): Promise<void> {
        await this.permissionsService.permanentDelete(id);
    }
}

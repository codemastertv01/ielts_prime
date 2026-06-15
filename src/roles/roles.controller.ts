import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { BulkDeleteDto } from '../dto/bulk-delete.dto';
import { ChangeStatusDto } from '../dto/change-status.dto';
import type { MetadataInfo } from '../dto/metadata-info.dto';
import { ScheduleStatusDto } from '../dto/status-schedule.dto';

import { RolesService } from './roles.service';
import { GetRolesDto } from './dto/get-roles.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { RemovePermissionsDto } from './dto/remove-permissions.dto';

@ApiTags('Roles')
@Controller('roles')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

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
    @ApiOperation({ summary: 'Create a role' })
    @ApiResponse({ status: 201, description: 'Role created' })
    @ApiResponse({ status: 409, description: 'Role already exists' })
    async create(@Body() dto: CreateRoleDto, @Req() req: Request) {
        const data = await this.rolesService.create(dto, this.meta(req));
        return { success: true, message: 'Role muvaffaqiyatli yaratildi', data };
    }

    @Post('bulk')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Bulk create roles' })
    async createMultiple(@Body() dtos: CreateRoleDto[], @Req() req: Request) {
        const data = await this.rolesService.createMultiple(dtos, this.meta(req));
        return {
            success: true,
            message: `${data.createdCount} ta role yaratildi`,
            data,
        };
    }

    // ════════════════════════════════════════════════════════
    // READ
    // ════════════════════════════════════════════════════════

    @Get()
    @ApiOperation({ summary: 'List roles — paginated, filtered, sorted' })
    async findAll(@Query() query: GetRolesDto) {
        const result = await this.rolesService.findAll(query);
        return { success: true, ...result };
    }

    @Get('statistics')
    @ApiOperation({ summary: 'Role statistics' })
    async getStatistics() {
        const data = await this.rolesService.getStatistics();
        return { success: true, data };
    }

    @Get('name/:name')
    @ApiOperation({ summary: 'Get role by name' })
    @ApiParam({ name: 'name' })
    @ApiQuery({ name: 'populate', required: false, type: Boolean })
    async findByName(@Param('name') name: string, @Query('populate') populate = false) {
        const data = await this.rolesService.findByName(name, populate);
        return { success: true, data };
    }

    @Get(':id/audit-log')
    @ApiOperation({ summary: 'Get audit log for a role' })
    @ApiParam({ name: 'id' })
    async getAuditLog(@Param('id') id: string) {
        const data = await this.rolesService.getAuditLog(id);
        return { success: true, data, count: data.length };
    }

    @Get(':id/status-history')
    @ApiOperation({ summary: 'Get status history' })
    @ApiParam({ name: 'id' })
    async getStatusHistory(@Param('id') id: string) {
        const data = await this.rolesService.getStatusHistory(id);
        return { success: true, data, count: data.length };
    }

    @Get(':id/update-history')
    @ApiOperation({ summary: 'Get field change history' })
    @ApiParam({ name: 'id' })
    async getUpdateHistory(@Param('id') id: string) {
        const data = await this.rolesService.getUpdateHistory(id);
        return { success: true, data, count: data.length };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get single role by ID' })
    @ApiParam({ name: 'id' })
    @ApiQuery({ name: 'populate', required: false, type: Boolean })
    async findOne(@Param('id') id: string, @Query('populate') populate = false) {
        const data = await this.rolesService.findOne(id, populate);
        return { success: true, data };
    }

    // ════════════════════════════════════════════════════════
    // UPDATE
    // ════════════════════════════════════════════════════════

    @Patch(':id')
    @ApiOperation({ summary: 'Update role fields (system role name is locked)' })
    @ApiParam({ name: 'id' })
    async update(@Param('id') id: string, @Body() dto: UpdateRoleDto, @Req() req: Request) {
        const data = await this.rolesService.update(id, dto, this.meta(req));
        return { success: true, message: 'Role muvaffaqiyatli yangilandi', data };
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Change role status' })
    @ApiParam({ name: 'id' })
    async changeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto, @Req() req: Request) {
        const data = await this.rolesService.changeStatus(id, dto, this.meta(req));
        return {
            success: true,
            message: `Status '${dto.status}' ga o'zgartirildi`,
            data,
        };
    }

    @Post(':id/schedule-status')
    @ApiOperation({ summary: 'Schedule a future status change' })
    @ApiParam({ name: 'id' })
    async scheduleStatus(@Param('id') id: string, @Body() dto: ScheduleStatusDto, @Req() req: Request) {
        const data = await this.rolesService.scheduleStatus(id, dto, this.meta(req));
        return {
            success: true,
            message: "Status o'zgarishi rejalashtirildi",
            data,
        };
    }

    @Patch(':id/restore')
    @ApiOperation({ summary: 'Restore a soft-deleted role' })
    @ApiParam({ name: 'id' })
    async restore(@Param('id') id: string, @Req() req: Request) {
        const data = await this.rolesService.restore(id, this.meta(req));
        return { success: true, message: 'Role muvaffaqiyatli tiklandi', data };
    }

    // ════════════════════════════════════════════════════════
    // PERMISSIONS
    // ════════════════════════════════════════════════════════

    @Post(':id/assign-permissions')
    @ApiOperation({ summary: 'Add permissions to role' })
    @ApiParam({ name: 'id' })
    async assignPermissions(@Param('id') id: string, @Body() dto: AssignPermissionsDto, @Req() req: Request) {
        const data = await this.rolesService.assignPermissions(id, dto, this.meta(req));
        return { success: true, message: "Permissions muvaffaqiyatli qo'shildi", data };
    }

    @Post(':id/remove-permissions')
    @ApiOperation({ summary: 'Remove permissions from role (system roles blocked)' })
    @ApiParam({ name: 'id' })
    async removePermissions(@Param('id') id: string, @Body() dto: RemovePermissionsDto, @Req() req: Request) {
        const data = await this.rolesService.removePermissions(id, dto, this.meta(req));
        return { success: true, message: 'Permissions muvaffaqiyatli olib tashlandi', data };
    }

    // ════════════════════════════════════════════════════════
    // DELETE
    // ════════════════════════════════════════════════════════

    @Delete('bulk')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Bulk soft-delete (system roles and roles with users are skipped)' })
    async bulkDelete(@Body() dto: BulkDeleteDto, @Req() req: Request) {
        const data = await this.rolesService.softDeleteMultiple(dto, this.meta(req));

        const parts: string[] = [`${data.deletedCount} ta role o'chirildi`];
        if (data.notFoundIds.length) parts.push(`${data.notFoundIds.length} ta topilmadi`);
        if (data.invalidIds.length) parts.push(`${data.invalidIds.length} ta noto'g'ri ID`);
        if (data.systemRoleIds.length) parts.push(`${data.systemRoleIds.length} ta system (o'tkazib yuborildi)`);
        if (data.rolesWithUsers.length) parts.push(`${data.rolesWithUsers.length} ta foydalanuvchi bor (o'tkazib yuborildi)`);
        if (data.alreadyDeletedIds.length) parts.push(`${data.alreadyDeletedIds.length} ta allaqachon o'chirilgan`);

        return { success: true, message: parts.join(' · '), data };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Soft-delete role (30-day recovery window)' })
    @ApiParam({ name: 'id' })
    async softDelete(@Param('id') id: string, @Body('reason') reason: string | undefined, @Req() req: Request) {
        const data = await this.rolesService.softDelete(id, this.meta(req), reason);
        return {
            success: true,
            message: `Role o'chirildi. ${data.scheduledDeletionAt?.toLocaleDateString('uz-UZ')} gacha tiklanishi mumkin`,
            data,
        };
    }

    @Delete(':id/permanent')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Permanently delete role — IRREVERSIBLE. Requires soft-delete first + roles:manage.' })
    @ApiParam({ name: 'id' })
    async hardDelete(@Param('id') id: string, @Req() req: Request): Promise<void> {
        await this.rolesService.hardDelete(id, this.meta(req));
    }
}

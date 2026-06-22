import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { ChangeStatusDto } from '../dto/change-status.dto';
import type { MetadataInfo } from '../dto/metadata-info.dto';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BulkDeleteDto } from '../dto/bulk-delete.dto';
import { ScheduleStatusDto } from '../dto/status-schedule.dto';
import { GetUsersDto, BlockUserDto } from './dto/get-users.dto';
import { ChangeUsernameDto, ChangeEmailDto, ChangePhoneDto, ChangePasswordDto, AdminResetPasswordDto } from './dto/sensitive-change.dto';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

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
    @ApiOperation({ summary: 'Create a single user' })
    @ApiResponse({ status: 201 })
    @ApiResponse({ status: 409, description: 'Username or email already exists' })
    async create(@Body() dto: CreateUserDto, @Req() req: Request) {
        const data = await this.usersService.create(dto, this.meta(req));
        return { success: true, message: 'User muvaffaqiyatli yaratildi', data };
    }

    @Post('bulk')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Bulk create users' })
    async createMultiple(@Body() dtos: CreateUserDto[], @Req() req: Request) {
        const data = await this.usersService.createMultiple(dtos, this.meta(req));
        return {
            success: true,
            message: `${data.createdCount} ta user yaratildi`,
            data,
        };
    }

    // ════════════════════════════════════════════════════════
    // READ
    // ════════════════════════════════════════════════════════

    @Get()
    @ApiOperation({ summary: 'List users — paginated, filtered, sorted' })
    async findAll(@Query() query: GetUsersDto) {
        const result = await this.usersService.findAll(query);
        return { success: true, ...result };
    }

    @Get('statistics')
    @ApiOperation({ summary: 'User statistics' })
    async getStatistics() {
        const data = await this.usersService.getStatistics();
        return { success: true, data };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get single user by ID' })
    @ApiParam({ name: 'id' })
    async findOne(@Param('id') id: string) {
        const data = await this.usersService.findOne(id);
        return { success: true, data };
    }

    @Get(':id/audit-log')
    @ApiOperation({ summary: 'Get audit log for a user' })
    @ApiParam({ name: 'id' })
    async getAuditLog(@Param('id') id: string) {
        const data = await this.usersService.getAuditLog(id);
        return { success: true, data, count: data.length };
    }

    @Get(':id/status-history')
    @ApiOperation({ summary: 'Get status change history' })
    @ApiParam({ name: 'id' })
    async getStatusHistory(@Param('id') id: string) {
        const data = await this.usersService.getStatusHistory(id);
        return { success: true, data, count: data.length };
    }

    @Get(':id/update-history')
    @ApiOperation({ summary: 'Get field change history' })
    @ApiParam({ name: 'id' })
    async getUpdateHistory(@Param('id') id: string) {
        const data = await this.usersService.getUpdateHistory(id);
        return { success: true, data, count: data.length };
    }

    @Get(':id/login-history')
    @ApiOperation({ summary: 'Get login history (last 100 entries)' })
    @ApiParam({ name: 'id' })
    async getLoginHistory(@Param('id') id: string) {
        const data = await this.usersService.getLoginHistory(id);
        return { success: true, data, count: data.length };
    }

    @Get(':id/sessions')
    @ApiOperation({ summary: 'Get active login sessions (device/browser/OS details)' })
    @ApiParam({ name: 'id' })
    async getActiveSessions(@Param('id') id: string) {
        const data = await this.usersService.getActiveSessions(id);
        return { success: true, data, count: data.length };
    }

    @Get(':id/sensitive-cooldowns')
    @ApiOperation({ summary: 'Check 14-day cooldown status for sensitive fields' })
    @ApiParam({ name: 'id' })
    async getSensitiveChangeCooldowns(@Param('id') id: string) {
        const data = await this.usersService.getSensitiveChangeCooldowns(id);
        return { success: true, data };
    }

    // ════════════════════════════════════════════════════════
    // UPDATE — general profile
    // ════════════════════════════════════════════════════════

    @Patch(':id')
    @ApiOperation({ summary: 'Update general profile fields (firstName, lastName, bio, avatarUrl, roles)' })
    @ApiParam({ name: 'id' })
    async update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Req() req: Request) {
        const data = await this.usersService.update(id, dto, this.meta(req));
        return { success: true, message: 'User muvaffaqiyatli yangilandi', data };
    }

    // ════════════════════════════════════════════════════════
    // SENSITIVE FIELD CHANGES  (14-day cooldown)
    // ════════════════════════════════════════════════════════

    @Patch(':id/change-username')
    @ApiOperation({ summary: 'Change username — requires current password — 14-day cooldown' })
    @ApiParam({ name: 'id' })
    async changeUsername(@Param('id') id: string, @Body() dto: ChangeUsernameDto, @Req() req: Request) {
        const data = await this.usersService.changeUsername(id, dto, this.meta(req));
        return { success: true, message: "Username muvaffaqiyatli o'zgartirildi", data };
    }

    @Patch(':id/change-email')
    @ApiOperation({ summary: 'Change email — requires current password — 14-day cooldown — resets email verification' })
    @ApiParam({ name: 'id' })
    async changeEmail(@Param('id') id: string, @Body() dto: ChangeEmailDto, @Req() req: Request) {
        const data = await this.usersService.changeEmail(id, dto, this.meta(req));
        return {
            success: true,
            message: "Email muvaffaqiyatli o'zgartirildi. Yangi emailni tasdiqlang.",
            data,
        };
    }

    @Patch(':id/change-phone')
    @ApiOperation({ summary: 'Change phone — requires current password — 14-day cooldown' })
    @ApiParam({ name: 'id' })
    async changePhone(@Param('id') id: string, @Body() dto: ChangePhoneDto, @Req() req: Request) {
        const data = await this.usersService.changePhone(id, dto, this.meta(req));
        return { success: true, message: "Telefon raqami muvaffaqiyatli o'zgartirildi", data };
    }

    @Patch(':id/change-password')
    @ApiOperation({ summary: 'Change password — requires current password — 14-day cooldown' })
    @ApiParam({ name: 'id' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto, @Req() req: Request): Promise<void> {
        await this.usersService.changePassword(id, dto, this.meta(req));
    }

    @Patch(':id/admin-reset-password')
    @ApiOperation({ summary: 'Admin password reset — no current password needed — requires users:manage' })
    @ApiParam({ name: 'id' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async adminResetPassword(@Param('id') id: string, @Body() dto: AdminResetPasswordDto, @Req() req: Request): Promise<void> {
        await this.usersService.adminResetPassword(id, dto, this.meta(req));
    }

    // ════════════════════════════════════════════════════════
    // SESSIONS
    // ════════════════════════════════════════════════════════

    @Delete(':id/sessions/:sessionId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Revoke a specific login session' })
    @ApiParam({ name: 'id' })
    @ApiParam({ name: 'sessionId' })
    async revokeSession(@Param('id') id: string, @Param('sessionId') sessionId: string, @Req() req: Request): Promise<void> {
        await this.usersService.revokeSession(id, sessionId, this.meta(req));
    }

    @Delete(':id/sessions')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Revoke ALL active sessions for a user' })
    @ApiParam({ name: 'id' })
    async revokeAllSessions(@Param('id') id: string, @Req() req: Request): Promise<void> {
        await this.usersService.revokeAllSessions(id, this.meta(req));
    }

    // ════════════════════════════════════════════════════════
    // BLOCK
    // ════════════════════════════════════════════════════════

    @Patch(':id/block')
    @ApiOperation({ summary: 'Block or unblock a user' })
    @ApiParam({ name: 'id' })
    async block(@Param('id') id: string, @Body() dto: BlockUserDto, @Req() req: Request) {
        const isBlocking = dto.isBlocked !== false;
        const data = await this.usersService.block(id, dto, this.meta(req));
        return {
            success: true,
            message: isBlocking ? 'User bloklandi' : 'User blokdan chiqarildi',
            data,
        };
    }

    // ════════════════════════════════════════════════════════
    // STATUS
    // ════════════════════════════════════════════════════════

    @Patch(':id/status')
    @ApiOperation({ summary: 'Change user status' })
    @ApiParam({ name: 'id' })
    async changeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto, @Req() req: Request) {
        const data = await this.usersService.changeStatus(id, dto, this.meta(req));
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
        const data = await this.usersService.scheduleStatus(id, dto, this.meta(req));
        return { success: true, message: "Status o'zgarishi rejalashtirildi", data };
    }

    @Patch(':id/restore')
    @ApiOperation({ summary: 'Restore a soft-deleted user' })
    @ApiParam({ name: 'id' })
    async restore(@Param('id') id: string, @Req() req: Request) {
        const data = await this.usersService.restore(id, this.meta(req));
        return { success: true, message: 'User muvaffaqiyatli tiklandi', data };
    }

    // ════════════════════════════════════════════════════════
    // DELETE
    // ════════════════════════════════════════════════════════

    @Delete('bulk')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Bulk soft-delete users' })
    async bulkDelete(@Body() dto: BulkDeleteDto, @Req() req: Request) {
        const data = await this.usersService.softDeleteMultiple(dto, this.meta(req));

        const parts: string[] = [`${data.deletedCount} ta user o'chirildi`];
        if (data.notFoundIds.length) parts.push(`${data.notFoundIds.length} ta topilmadi`);
        if (data.invalidIds.length) parts.push(`${data.invalidIds.length} ta noto'g'ri ID`);
        if (data.alreadyDeletedIds.length) parts.push(`${data.alreadyDeletedIds.length} ta allaqachon o'chirilgan`);

        return { success: true, message: parts.join(' · '), data };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Soft-delete user (30-day recovery window)' })
    @ApiParam({ name: 'id' })
    async softDelete(@Param('id') id: string, @Body('reason') reason: string | undefined, @Req() req: Request) {
        const data = await this.usersService.softDelete(id, this.meta(req), reason);
        return {
            success: true,
            message: `User o'chirildi. ${data.scheduledDeletionAt?.toLocaleDateString('uz-UZ')} gacha tiklanishi mumkin`,
            data,
        };
    }

    @Delete(':id/permanent')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Permanently delete user — IRREVERSIBLE. Requires soft-delete first + users:manage.' })
    @ApiParam({ name: 'id' })
    async hardDelete(@Param('id') id: string, @Req() req: Request): Promise<void> {
        await this.usersService.hardDelete(id, this.meta(req));
    }
}

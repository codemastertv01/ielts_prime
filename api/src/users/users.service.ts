import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, FilterQuery, Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User, UserDocument, SensitiveFieldChange } from './schemas/user.schema';
import type { AuditLog } from '../dto/audit-log.dto';
import type { FieldChange } from '../dto/field-change.dto';
import type { MetadataInfo } from '../dto/metadata-info.dto';
import type { StatusHistory } from '../dto/status-history.dto';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BulkDeleteDto } from '../dto/bulk-delete.dto';
import { EntityStatus } from '../dto/entity-status.dto';
import { ChangeStatusDto } from '../dto/change-status.dto';
import { GetUsersDto, BlockUserDto} from './dto/get-users.dto';
import { ScheduleStatusDto } from '../dto/status-schedule.dto';
import { ChangeUsernameDto, ChangeEmailDto, ChangePhoneDto, ChangePasswordDto, AdminResetPasswordDto } from './dto/sensitive-change.dto';

// ─── Constants ─────────────────────────────────────────────────────────────────

const BCRYPT_ROUNDS = 12;
const SENSITIVE_COOLDOWN_DAYS = 14;
const MAX_LOGIN_HISTORY = 100; // keep last 100 entries
const MAX_LOGIN_SESSIONS = 50; // keep last 50 sessions

// ─── Response types ────────────────────────────────────────────────────────────

export interface UserListResult {
    data: UserDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface BulkDeleteResult {
    deletedCount: number;
    notFoundIds: string[];
    invalidIds: string[];
    alreadyDeletedIds: string[];
}

export interface BulkCreateResult {
    createdCount: number;
    created: UserDocument[];
    errors: Array<{ index: number; username: string; error: string }>;
}

// ─── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectConnection() private readonly connection: Connection
    ) {}

    // ════════════════════════════════════════════════════════
    // CREATE
    // ════════════════════════════════════════════════════════

    async create(dto: CreateUserDto, metadata: MetadataInfo): Promise<UserDocument> {
        const session = await this.connection.startSession();
        session.startTransaction();
        try {
            // Check username + email uniqueness in one query
            const existing = await this.userModel
                .findOne({
                    $or: [{ username: dto.username }, { email: dto.email.toLowerCase() }],
                    isDeleted: false,
                })
                .session(session)
                .lean()
                .exec();

            if (existing) {
                const field = (existing as any).email === dto.email.toLowerCase() ? 'Email' : 'Username';
                throw new ConflictException(`${field} allaqachon mavjud`);
            }

            if (dto.roles?.length) this.assertValidIds(dto.roles, 'Role');

            const user = new this.userModel({
                ...dto,
                email: dto.email.toLowerCase(),
                roles: dto.roles?.map((id) => new Types.ObjectId(id)) ?? [],
                password: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
                createdBy: metadata,
                status: EntityStatus.PENDING,
                auditLog: [{ action: 'create', performedBy: metadata, timestamp: new Date() }],
            });

            await user.save({ session });
            await session.commitTransaction();

            this.logger.log(`User created: ${user.username} (${user._id})`);
            return user;
        } catch (err) {
            await session.abortTransaction();
            if (err.code === 11000) throw new ConflictException('Username yoki email allaqachon mavjud');
            throw err instanceof Error ? err : new InternalServerErrorException('User yaratishda xatolik');
        } finally {
            session.endSession();
        }
    }

    async createMultiple(dtos: CreateUserDto[], metadata: MetadataInfo): Promise<BulkCreateResult> {
        const created: UserDocument[] = [];
        const errors: BulkCreateResult['errors'] = [];

        for (let i = 0; i < dtos.length; i++) {
            try {
                created.push(await this.create(dtos[i], metadata));
            } catch (err) {
                errors.push({ index: i, username: dtos[i].username, error: err.message });
            }
        }

        this.logger.log(`Bulk create: ${created.length} users created, ${errors.length} failed`);
        return { createdCount: created.length, created, errors };
    }

    // ════════════════════════════════════════════════════════
    // READ
    // ════════════════════════════════════════════════════════

    async findAll(query: GetUsersDto): Promise<UserListResult> {
        const { page = 1, limit = 10, search, status, isEmailVerified, isBlocked, includeDeleted, sortBy = 'createdAt', sortOrder = 'desc' } = query;

        const filter: FilterQuery<UserDocument> = {};
        if (includeDeleted) filter.isDeleted = includeDeleted;

        if (search?.trim()) {
            const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.$or = [{ username: { $regex: escaped, $options: 'i' } }, { email: { $regex: escaped, $options: 'i' } }, { firstName: { $regex: escaped, $options: 'i' } }, { lastName: { $regex: escaped, $options: 'i' } }];
        }

        if (status) filter.status = status;
        if (isEmailVerified) filter.isEmailVerified = isEmailVerified;
        if (isBlocked) filter['blockInfo.isBlocked'] = isBlocked;

        const skip = (page - 1) * limit;
        const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [data, total] = await Promise.all([this.userModel.find(filter).sort(sort).skip(skip).limit(limit).populate('roles', 'name description type').select('-password -verificationCode -resetToken -sensitiveFieldChanges -loginSessions').lean().exec(), this.userModel.countDocuments(filter)]);

        return {
            data: data as unknown as UserDocument[],
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: string): Promise<UserDocument> {
        this.assertValidId(id);
        const user = await this.userModel.findOne({ _id: id, isDeleted: false }).populate('roles', 'name description type').select('-password -verificationCode -resetToken -sensitiveFieldChanges -loginSessions').exec();
        if (!user) throw new NotFoundException(`User topilmadi: ${id}`);
        return user;
    }

    async findByEmail(email: string): Promise<UserDocument> {
        const user = await this.userModel.findOne({ email: email.toLowerCase(), isDeleted: false }).select('+password').exec();
        if (!user) throw new NotFoundException(`User topilmadi: ${email}`);
        return user;
    }

    async findByUsername(username: string): Promise<UserDocument> {
        const user = await this.userModel.findOne({ username, isDeleted: false }).select('+password').exec();
        if (!user) throw new NotFoundException(`User topilmadi: ${username}`);
        return user;
    }

    // ════════════════════════════════════════════════════════
    // UPDATE — general profile fields
    // ════════════════════════════════════════════════════════

    async update(id: string, dto: UpdateUserDto, metadata: MetadataInfo): Promise<UserDocument> {
        const session = await this.connection.startSession();
        session.startTransaction();
        try {
            this.assertValidId(id);
            const user = await this.userModel.findOne({ _id: id, isDeleted: false }).session(session).exec();
            if (!user) throw new NotFoundException(`User topilmadi: ${id}`);

            if (dto.roles?.length) {
                this.assertValidIds(dto.roles, 'Role');
            }

            const changes = this.buildChanges(user.toObject(), dto, metadata);

            Object.assign(user, {
                ...dto,
                roles: dto.roles ? dto.roles.map((rid) => new Types.ObjectId(rid)) : user.roles,
                updatedBy: [...(user.updatedBy ?? []), metadata],
            });

            if (changes.length > 0) {
                user.updateHistory = [...(user.updateHistory ?? []), ...changes];
                this.pushAudit(user, 'update', metadata, changes);
            }

            await user.save({ session });
            await session.commitTransaction();
            await user.populate('roles', 'name description type');
            return user;
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    }

    // ════════════════════════════════════════════════════════
    // SENSITIVE FIELD CHANGES  (14-day cooldown each)
    // ════════════════════════════════════════════════════════

    async changeUsername(id: string, dto: ChangeUsernameDto, metadata: MetadataInfo): Promise<UserDocument> {
        this.assertValidId(id);

        const user = await this.userModel.findOne({ _id: id, isDeleted: false }).select('+password +sensitiveFieldChanges').exec();
        if (!user) throw new NotFoundException(`User topilmadi: ${id}`);

        await this.assertCurrentPassword(user, dto.currentPassword);
        this.assertCooldown(user, 'username');

        // Uniqueness check
        const taken = await this.userModel
            .findOne({ username: dto.newUsername, isDeleted: false, _id: { $ne: id } })
            .lean()
            .exec();
        if (taken) throw new ConflictException(`Username '${dto.newUsername}' allaqachon band`);

        const oldUsername = user.username;
        user.username = dto.newUsername;
        this.recordSensitiveChange(user, 'username', metadata);
        this.pushAudit(user, 'change_username', metadata, [
            {
                field: 'username',
                oldValue: oldUsername,
                newValue: dto.newUsername,
                changedAt: new Date(),
                changedBy: metadata,
            },
        ]);
        user.updatedBy = [...(user.updatedBy ?? []), metadata];

        await user.save();
        return this.findOne(id);
    }

    async changeEmail(id: string, dto: ChangeEmailDto, metadata: MetadataInfo): Promise<UserDocument> {
        this.assertValidId(id);

        const user = await this.userModel.findOne({ _id: id, isDeleted: false }).select('+password +sensitiveFieldChanges').exec();
        if (!user) throw new NotFoundException(`User topilmadi: ${id}`);

        await this.assertCurrentPassword(user, dto.currentPassword);
        this.assertCooldown(user, 'email');

        const newEmail = dto.newEmail.toLowerCase();
        const taken = await this.userModel
            .findOne({ email: newEmail, isDeleted: false, _id: { $ne: id } })
            .lean()
            .exec();
        if (taken) throw new ConflictException(`Email '${newEmail}' allaqachon band`);

        const oldEmail = user.email;
        user.email = newEmail;
        user.isEmailVerified = false; // require re-verification
        user.emailVerifiedAt = undefined;
        this.recordSensitiveChange(user, 'email', metadata);
        this.pushAudit(user, 'change_email', metadata, [
            {
                field: 'email',
                oldValue: oldEmail,
                newValue: newEmail,
                changedAt: new Date(),
                changedBy: metadata,
            },
        ]);
        user.updatedBy = [...(user.updatedBy ?? []), metadata];

        await user.save();
        return this.findOne(id);
    }

    async changePhone(id: string, dto: ChangePhoneDto, metadata: MetadataInfo): Promise<UserDocument> {
        this.assertValidId(id);

        const user = await this.userModel.findOne({ _id: id, isDeleted: false }).select('+password +sensitiveFieldChanges').exec();
        if (!user) throw new NotFoundException(`User topilmadi: ${id}`);

        await this.assertCurrentPassword(user, dto.currentPassword);
        this.assertCooldown(user, 'phone');

        const oldPhone = user.phone;
        user.phone = dto.newPhone;
        this.recordSensitiveChange(user, 'phone', metadata);
        this.pushAudit(user, 'change_phone', metadata, [
            {
                field: 'phone',
                oldValue: oldPhone ?? null,
                newValue: dto.newPhone,
                changedAt: new Date(),
                changedBy: metadata,
            },
        ]);
        user.updatedBy = [...(user.updatedBy ?? []), metadata];

        await user.save();
        return this.findOne(id);
    }

    async changePassword(id: string, dto: ChangePasswordDto, metadata: MetadataInfo): Promise<void> {
        this.assertValidId(id);

        const user = await this.userModel.findOne({ _id: id, isDeleted: false }).select('+password +sensitiveFieldChanges').exec();
        if (!user) throw new NotFoundException(`User topilmadi: ${id}`);

        await this.assertCurrentPassword(user, dto.currentPassword);
        this.assertCooldown(user, 'password');

        if (dto.newPassword !== dto.confirmPassword) {
            throw new BadRequestException('Yangi parol va tasdiqlash paroli mos kelmaydi');
        }

        const isSame = await bcrypt.compare(dto.newPassword, user?.password as string);
        if (isSame) {
            throw new BadRequestException('Yangi parol avvalgidan farq qilishi kerak');
        }

        user.password = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
        this.recordSensitiveChange(user, 'password', metadata);
        this.pushAudit(user, 'change_password', metadata);
        user.updatedBy = [...(user.updatedBy ?? []), metadata];

        await user.save();
        this.logger.log(`Password changed: user ${id}`);
    }

    /** Admin-only: reset password without requiring current password */
    async adminResetPassword(id: string, dto: AdminResetPasswordDto, metadata: MetadataInfo): Promise<void> {
        this.assertValidId(id);

        const user = await this.userModel.findOne({ _id: id, isDeleted: false }).select('+password').exec();
        if (!user) throw new NotFoundException(`User topilmadi: ${id}`);

        user.password = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
        this.pushAudit(user, 'admin_reset_password', metadata, [
            {
                field: 'password',
                oldValue: '[hidden]',
                newValue: '[reset by admin]',
                changedAt: new Date(),
                changedBy: metadata,
            },
        ]);
        user.updatedBy = [...(user.updatedBy ?? []), metadata];

        await user.save();
        this.logger.warn(`Admin reset password for user ${id} by ${metadata.username}`);
    }

    // ════════════════════════════════════════════════════════
    // SENSITIVE CHANGE COOLDOWN INFO
    // ════════════════════════════════════════════════════════

    async getSensitiveChangeCooldowns(id: string): Promise<Record<string, { lastChangedAt: Date | null; nextAllowedAt: Date | null; canChange: boolean }>> {
        this.assertValidId(id);
        const user = await this.userModel.findOne({ _id: id, isDeleted: false }).select('+sensitiveFieldChanges').lean().exec();
        if (!user) throw new NotFoundException(`User topilmadi: ${id}`);

        const fields = ['username', 'email', 'phone', 'password'] as const;
        const now = new Date();
        const result: Record<string, any> = {};

        for (const field of fields) {
            const last = (user as any).sensitiveFieldChanges?.filter((c: SensitiveFieldChange) => c.field === field).sort((a: SensitiveFieldChange, b: SensitiveFieldChange) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())[0];

            result[field] = {
                lastChangedAt: last?.changedAt ?? null,
                nextAllowedAt: last?.nextAllowedChangeAt ?? null,
                canChange: last ? now >= new Date(last.nextAllowedChangeAt) : true,
            };
        }

        return result;
    }

    // ════════════════════════════════════════════════════════
    // LOGIN SESSION TRACKING
    // ════════════════════════════════════════════════════════

    async recordLogin(id: string, metadata: MetadataInfo, sessionId?: string): Promise<void> {
        const sid = sessionId ?? uuidv4();
        const now = new Date();

        const session: any = {
            sessionId: sid,
            ipAddress: metadata.ipAddress ?? '0.0.0.0',
            userAgent: metadata.userAgent ?? '',
            device: metadata.device ?? 'unknown',
            browser: metadata.browser ?? 'unknown',
            os: metadata.os ?? 'unknown',
            location: (metadata as any).location ?? null,
            loginAt: now,
            logoutAt: null,
            isActive: true,
        };

        await this.userModel.updateOne(
            { _id: id },
            {
                $set: {
                    lastLoginAt: now,
                    lastLoginInfo: metadata,
                    firstLoginAt: undefined, // set via $setOnInsert pattern below
                },
                $push: {
                    loginHistory: {
                        $each: [metadata],
                        $slice: -MAX_LOGIN_HISTORY,
                    },
                    loginSessions: {
                        $each: [session],
                        $slice: -MAX_LOGIN_SESSIONS,
                    },
                },
            }
        );

        // Set firstLoginAt only if not yet set
        await this.userModel.updateOne({ _id: id, firstLoginAt: null }, { $set: { firstLoginAt: now } });
    }

    async recordLogout(id: string, sessionId: string): Promise<void> {
        await this.userModel.updateOne(
            { _id: id, 'loginSessions.sessionId': sessionId },
            {
                $set: {
                    'loginSessions.$.isActive': false,
                    'loginSessions.$.logoutAt': new Date(),
                },
            }
        );
    }

    async getActiveSessions(id: string): Promise<any[]> {
        this.assertValidId(id);
        const user = await this.userModel.findOne({ _id: id, isDeleted: false }).select('+loginSessions').lean().exec();
        if (!user) throw new NotFoundException(`User topilmadi: ${id}`);
        return ((user as any).loginSessions ?? []).filter((s: any) => s.isActive);
    }

    async revokeSession(id: string, sessionId: string, metadata: MetadataInfo): Promise<void> {
        this.assertValidId(id);
        const result = await this.userModel.updateOne(
            { _id: id, 'loginSessions.sessionId': sessionId },
            {
                $set: {
                    'loginSessions.$.isActive': false,
                    'loginSessions.$.logoutAt': new Date(),
                },
            }
        );
        if (result.modifiedCount === 0) {
            throw new NotFoundException(`Session topilmadi: ${sessionId}`);
        }
        this.pushAuditById(id, 'revoke_session', metadata);
    }

    async revokeAllSessions(id: string, metadata: MetadataInfo): Promise<void> {
        this.assertValidId(id);
        await this.userModel.updateOne(
            { _id: id },
            {
                $set: {
                    'loginSessions.$[].isActive': false,
                    'loginSessions.$[].logoutAt': new Date(),
                },
            }
        );
        this.pushAuditById(id, 'revoke_all_sessions', metadata);
    }

    async getLoginHistory(id: string): Promise<MetadataInfo[]> {
        this.assertValidId(id);
        const user = await this.userModel.findOne({ _id: id, isDeleted: false }).select('loginHistory').lean().exec();
        if (!user) throw new NotFoundException(`User topilmadi: ${id}`);
        return [...((user as any).loginHistory ?? [])].reverse();
    }

    // ════════════════════════════════════════════════════════
    // BLOCK / UNBLOCK
    // ════════════════════════════════════════════════════════

    async block(id: string, dto: BlockUserDto, metadata: MetadataInfo): Promise<UserDocument> {
        this.assertValidId(id);
        const user = await this.userModel.findOne({ _id: id, isDeleted: false }).exec();
        if (!user) throw new NotFoundException(`User topilmadi: ${id}`);

        const isBlocking = dto.isBlocked !== false;

        user.blockInfo = {
            isBlocked: isBlocking,
            blockedUntil: dto.blockedUntil ? new Date(dto.blockedUntil) : null,
            blockReason: dto.blockReason ?? 'No',
            blockedBy: isBlocking ? metadata : null,
            blockedAt: isBlocking ? new Date() : null,
        };

        this.pushAudit(user, isBlocking ? 'block' : 'unblock', metadata, [
            {
                field: 'blockInfo',
                oldValue: null,
                newValue: user.blockInfo,
                changedAt: new Date(),
                changedBy: metadata,
            },
        ]);
        user.updatedBy = [...(user.updatedBy ?? []), metadata];

        await user.save();
        return user;
    }

    // ════════════════════════════════════════════════════════
    // STATUS
    // ════════════════════════════════════════════════════════

    async changeStatus(id: string, dto: ChangeStatusDto, metadata: MetadataInfo): Promise<UserDocument> {
        this.assertValidId(id);
        const user = await this.userModel.findOne({ _id: id, isDeleted: false }).exec();
        if (!user) throw new NotFoundException(`User topilmadi: ${id}`);

        if (user.status === dto.status) {
            throw new BadRequestException(`User allaqachon '${dto.status}' holatida`);
        }

        const fromStatus = user.status;
        user.status = dto.status;

        user.statusHistory.push({
            fromStatus,
            toStatus: dto.status,
            changedAt: new Date(),
            changedBy: metadata,
            reason: dto.reason ?? 'No',
            isAutomatic: false,
        });

        if (dto.status === EntityStatus.ACTIVE) {
            user.activatedAt = new Date();
        } else if (dto.status === EntityStatus.INACTIVE) {
            user.inactivatedAt = new Date();
            user.inactivatedBy = metadata;
            user.inactiveReason = dto.reason ?? 'No';
        }

        this.pushAudit(user, 'status_change', metadata, [
            {
                field: 'status',
                oldValue: fromStatus,
                newValue: dto.status,
                changedAt: new Date(),
                changedBy: metadata,
            },
        ]);

        await user.save();
        return user;
    }

    async scheduleStatus(id: string, dto: ScheduleStatusDto, metadata: MetadataInfo): Promise<UserDocument> {
        this.assertValidId(id);
        const user = await this.userModel.findOne({ _id: id, isDeleted: false }).exec();
        if (!user) throw new NotFoundException(`User topilmadi: ${id}`);

        const scheduledAt = new Date(dto.scheduledAt);
        if (scheduledAt <= new Date()) {
            throw new BadRequestException("Rejalashtirilgan vaqt o'tgan bo'lishi mumkin emas");
        }

        user.statusSchedules.push({
            scheduledStatus: dto.status,
            scheduledAt,
            setBy: metadata,
            reason: dto.reason ?? 'No',
        });

        if (dto.status === EntityStatus.ACTIVE) user.activationScheduledAt = scheduledAt;
        else if (dto.status === EntityStatus.ARCHIVE) user.archiveScheduledAt = scheduledAt;
        else if (dto.status === EntityStatus.DELETED) user.scheduledDeletionAt = scheduledAt;

        this.pushAudit(user, `schedule_status_${dto.status.toLowerCase()}` as any, metadata);
        await user.save();
        return user;
    }

    // ════════════════════════════════════════════════════════
    // DELETE / RESTORE
    // ════════════════════════════════════════════════════════

    async softDelete(id: string, metadata: MetadataInfo, reason?: string): Promise<UserDocument> {
        this.assertValidId(id);
        const user = await this.userModel.findOne({ _id: id, isDeleted: false }).exec();
        if (!user) throw new NotFoundException(`User topilmadi: ${id}`);
        if (user.isDeleted) throw new BadRequestException("User allaqachon o'chirilgan");

        const scheduledDeletion = new Date();
        scheduledDeletion.setDate(scheduledDeletion.getDate() + 30);

        user.isDeleted = true;
        user.status = EntityStatus.INACTIVE;
        user.deletedBy = [...(user.deletedBy ?? []), metadata];
        user.scheduledDeletionAt = scheduledDeletion;
        user.inactiveReason = reason ?? 'No';

        this.pushAudit(user, 'soft_delete', metadata);
        await user.save();
        return user;
    }

    async softDeleteMultiple(dto: BulkDeleteDto, metadata: MetadataInfo): Promise<BulkDeleteResult> {
        const invalidIds = dto.ids.filter((id) => !Types.ObjectId.isValid(id));
        const validIds = dto.ids.filter((id) => Types.ObjectId.isValid(id));

        if (validIds.length === 0) {
            return { deletedCount: 0, notFoundIds: [], invalidIds, alreadyDeletedIds: [] };
        }

        // Fetch ALL docs BEFORE mutation
        const existingDocs = await this.userModel
            .find({ _id: { $in: validIds } })
            .select('_id isDeleted')
            .lean()
            .exec();

        const foundSet = new Set(existingDocs.map((d: any) => d._id.toString()));
        const notFoundIds = validIds.filter((id) => !foundSet.has(id));
        const alreadyDeletedIds: string[] = [];
        const deletableIds: string[] = [];

        for (const doc of existingDocs as any[]) {
            if (doc.isDeleted) alreadyDeletedIds.push(doc._id.toString());
            else deletableIds.push(doc._id.toString());
        }

        if (deletableIds.length === 0) {
            return { deletedCount: 0, notFoundIds, invalidIds, alreadyDeletedIds };
        }

        const scheduledDeletion = new Date();
        scheduledDeletion.setDate(scheduledDeletion.getDate() + 30);

        const result = await this.userModel.updateMany(
            { _id: { $in: deletableIds } },
            {
                $set: {
                    isDeleted: true,
                    status: EntityStatus.INACTIVE,
                    scheduledDeletionAt: scheduledDeletion,
                    inactiveReason: dto.reason ?? null,
                },
                $push: {
                    deletedBy: metadata,
                    auditLog: {
                        action: 'soft_delete_bulk',
                        performedBy: metadata,
                        timestamp: new Date(),
                    },
                },
            }
        );

        this.logger.log(`Bulk delete users: ${result.modifiedCount} deleted, ` + `${notFoundIds.length} not found, ${alreadyDeletedIds.length} already deleted`);

        return {
            deletedCount: result.modifiedCount,
            notFoundIds,
            invalidIds,
            alreadyDeletedIds,
        };
    }

    async restore(id: string, metadata: MetadataInfo): Promise<UserDocument> {
        this.assertValidId(id);
        const user = await this.userModel.findById(id).exec();
        if (!user) throw new NotFoundException(`User topilmadi: ${id}`);
        if (!user.isDeleted) throw new BadRequestException("User o'chirilmagan");

        user.isDeleted = false;
        user.restoredAt = new Date();
        user.restoredBy = [...(user.restoredBy ?? []), metadata];
        user.status = EntityStatus.PENDING;
        user.scheduledDeletionAt = undefined;

        this.pushAudit(user, 'restore', metadata);
        await user.save();
        return user;
    }

    async hardDelete(id: string, metadata: MetadataInfo): Promise<void> {
        this.assertValidId(id);
        const user = await this.userModel.findById(id).exec();
        if (!user) throw new NotFoundException(`User topilmadi: ${id}`);
        if (!user.isDeleted) {
            throw new BadRequestException('Permanent delete uchun avval soft-delete qilish kerak');
        }

        this.logger.warn(`Hard delete: user "${user.username}" (${id}) by ${metadata.username}`);
        await user.deleteOne();
    }

    // ════════════════════════════════════════════════════════
    // SCHEDULED CLEANUP
    // ════════════════════════════════════════════════════════

    async deleteExpiredUsers(): Promise<number> {
        const result = await this.userModel.deleteMany({
            isDeleted: true,
            scheduledDeletionAt: { $lte: new Date() },
        });
        if (result.deletedCount > 0) {
            this.logger.log(`Expired users cleaned up: ${result.deletedCount}`);
        }
        return result.deletedCount ?? 0;
    }

    // ════════════════════════════════════════════════════════
    // AUDIT / HISTORY
    // ════════════════════════════════════════════════════════

    async getAuditLog(id: string): Promise<AuditLog[]> {
        const user = await this.findOne(id);
        return [...user.auditLog].reverse();
    }

    async getStatusHistory(id: string): Promise<StatusHistory[]> {
        const user = await this.findOne(id);
        return [...user.statusHistory].reverse();
    }

    async getUpdateHistory(id: string): Promise<FieldChange[]> {
        const user = await this.findOne(id);
        return [...(user.updateHistory ?? [])].reverse();
    }

    // ════════════════════════════════════════════════════════
    // STATISTICS
    // ════════════════════════════════════════════════════════

    async getStatistics(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        emailVerified: number;
        blocked: number;
        deletedCount: number;
    }> {
        const activeFilter = { isDeleted: false };

        const [total, statusStats, emailVerified, blocked, deletedCount] = await Promise.all([this.userModel.countDocuments(activeFilter), this.userModel.aggregate([{ $match: activeFilter }, { $group: { _id: '$status', count: { $sum: 1 } } }]), this.userModel.countDocuments({ ...activeFilter, isEmailVerified: true }), this.userModel.countDocuments({ ...activeFilter, 'blockInfo.isBlocked': true }), this.userModel.countDocuments({ isDeleted: true })]);

        return {
            total,
            byStatus: Object.fromEntries(statusStats.map(({ _id, count }: any) => [_id ?? 'unknown', count])),
            emailVerified,
            blocked,
            deletedCount,
        };
    }

    // ════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ════════════════════════════════════════════════════════

    private assertValidId(id: string): void {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`Noto'g'ri ID formati: ${id}`);
        }
    }

    private assertValidIds(ids: string[], label: string): void {
        const invalid = ids.filter((id) => !Types.ObjectId.isValid(id));
        if (invalid.length > 0) {
            throw new BadRequestException(`Noto'g'ri ${label} ID formatlari: ${invalid.join(', ')}`);
        }
    }

    private async assertCurrentPassword(user: UserDocument, password: string): Promise<void> {
        const match = await bcrypt.compare(password, user.password as string);
        if (!match) throw new ForbiddenException("Joriy parol noto'g'ri");
    }

    private assertCooldown(user: UserDocument, field: SensitiveFieldChange['field']): void {
        const changes: SensitiveFieldChange[] = (user as any).sensitiveFieldChanges ?? [];
        const last = changes.filter((c) => c.field === field).sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())[0];

        if (last && new Date() < new Date(last.nextAllowedChangeAt)) {
            const allowed = new Date(last.nextAllowedChangeAt).toLocaleDateString('uz-UZ');
            throw new BadRequestException(`'${field}' ni ${allowed} gacha o'zgartirish mumkin emas (14 kunlik cheklov)`);
        }
    }

    private recordSensitiveChange(user: UserDocument, field: SensitiveFieldChange['field'], metadata: MetadataInfo): void {
        const now = new Date();
        const nextAllowed = new Date(now);
        nextAllowed.setDate(nextAllowed.getDate() + SENSITIVE_COOLDOWN_DAYS);

        const record: SensitiveFieldChange = {
            field,
            changedAt: now,
            changedBy: metadata,
            nextAllowedChangeAt: nextAllowed,
        };

        if (!(user as any).sensitiveFieldChanges) {
            (user as any).sensitiveFieldChanges = [];
        }
        (user as any).sensitiveFieldChanges.push(record);
    }

    private buildChanges(oldData: any, newData: any, metadata: MetadataInfo): FieldChange[] {
        return Object.keys(newData)
            .filter((key) => newData[key] !== undefined)
            .filter((key) => JSON.stringify(oldData[key]) !== JSON.stringify(newData[key]))
            .map((key) => ({
                field: key,
                oldValue: oldData[key],
                newValue: newData[key],
                changedAt: new Date(),
                changedBy: metadata,
            }));
    }

    private pushAudit(user: UserDocument, action: string, metadata: MetadataInfo, changes?: FieldChange[]): void {
        user.auditLog.push({
            action: action as any,
            performedBy: metadata,
            timestamp: new Date(),
            changes: changes ?? [],
        });
    }

    private async pushAuditById(id: string, action: string, metadata: MetadataInfo): Promise<void> {
        await this.userModel.updateOne(
            { _id: id },
            {
                $push: {
                    auditLog: {
                        action,
                        performedBy: metadata,
                        timestamp: new Date(),
                        changes: [],
                    },
                },
            }
        );
    }
}

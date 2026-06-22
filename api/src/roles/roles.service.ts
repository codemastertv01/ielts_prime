import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, FilterQuery, Model, Types } from 'mongoose';
import type { AuditLog } from '../dto/audit-log.dto';
import { BulkDeleteDto } from '../dto/bulk-delete.dto';
import { EntityStatus } from '../dto/entity-status.dto';
import { ChangeStatusDto } from '../dto/change-status.dto';
import type { FieldChange } from '../dto/field-change.dto';
import type { MetadataInfo } from '../dto/metadata-info.dto';
import type { StatusHistory } from '../dto/status-history.dto';
import { ScheduleStatusDto } from '../dto/status-schedule.dto';
import { GetRolesDto } from './dto/get-roles.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { RemovePermissionsDto } from './dto/remove-permissions.dto';
import { Role, RoleDocument } from './schemas/role.schema';

// ─── Response types ────────────────────────────────────────────────────────────

export interface RoleListResult {
    data: RoleDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface BulkDeleteResult {
    deletedCount: number;
    notFoundIds: string[];
    invalidIds: string[];
    systemRoleIds: string[];
    rolesWithUsers: string[];
    alreadyDeletedIds: string[];
}

export interface BulkCreateResult {
    createdCount: number;
    created: RoleDocument[];
    errors: Array<{ index: number; name: string; error: string }>;
}

export interface RoleStats {
    total: number;
    byStatus: Record<string, number>;
    systemRoles: number;
    customRoles: number;
    totalUsersAssigned: number;
}

// ─── Populate config ───────────────────────────────────────────────────────────

const PERM_POPULATE = {
    path: 'permissions',
    select: 'name description resource action status isSystemPermission',
};

// ─── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class RolesService {
    private readonly logger = new Logger(RolesService.name);

    constructor(
        @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
        @InjectConnection() private readonly connection: Connection
    ) {}

    // ════════════════════════════════════════════════════════
    // CREATE
    // ════════════════════════════════════════════════════════

    async create(dto: CreateRoleDto, metadata: MetadataInfo): Promise<RoleDocument> {
        const session = await this.connection.startSession();
        session.startTransaction();
        try {
            await this.assertNameUnique(dto.name, undefined, session);

            if (dto.permissions?.length) {
                this.assertValidIds(dto.permissions, 'Permission');
            }

            const role = new this.roleModel({
                ...dto,
                permissions: dto.permissions?.map((id) => new Types.ObjectId(id)) ?? [],
                createdBy: metadata,
                status: EntityStatus.PENDING,
                userCount: 0,
                auditLog: [{ action: 'create', performedBy: metadata, timestamp: new Date() }],
            });

            await role.save({ session });
            await session.commitTransaction();
            this.logger.log(`Role created: ${role.name} (${role._id.toString()})`);
            return role;
        } catch (err) {
            await session.abortTransaction();
            if (err.code === 11000) throw new ConflictException(`Role '${dto.name}' allaqachon mavjud`);
            throw err instanceof Error ? err : new InternalServerErrorException('Role yaratishda xatolik');
        } finally {
            session.endSession();
        }
    }

    async createMultiple(dtos: CreateRoleDto[], metadata: MetadataInfo): Promise<BulkCreateResult> {
        const created: RoleDocument[] = [];
        const errors: BulkCreateResult['errors'] = [];

        for (let i = 0; i < dtos.length; i++) {
            try {
                created.push(await this.create(dtos[i], metadata));
            } catch (err) {
                errors.push({ index: i, name: dtos[i].name, error: err.message });
            }
        }

        this.logger.log(`Bulk create: ${created.length} roles created, ${errors.length} failed`);
        return { createdCount: created.length, created, errors };
    }

    // ════════════════════════════════════════════════════════
    // READ
    // ════════════════════════════════════════════════════════

    async findAll(query: GetRolesDto): Promise<RoleListResult> {
        const { page = 1, limit = 10, search, status, type, isSystemRole, sortBy = 'priority', sortOrder = 'desc', populate = false, includeDeleted = false } = query;

        const filter: FilterQuery<RoleDocument> = {};
        if (!includeDeleted) filter.isDeleted = false;

        if (search?.trim()) {
            // Escape regex special characters to prevent injection
            const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.$or = [{ name: { $regex: escaped, $options: 'i' } }, { description: { $regex: escaped, $options: 'i' } }];
        }

        if (status) filter.status = status;
        if (type) filter.type = type;
        if (isSystemRole !== undefined) filter.isSystemRole = isSystemRole;

        const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        const skip = (page - 1) * limit;

        let q = this.roleModel.find(filter).sort(sort).skip(skip).limit(limit).select('-__v');
        if (populate) q = q.populate(PERM_POPULATE) as typeof q;

        const [data, total] = await Promise.all([q.exec(), this.roleModel.countDocuments(filter)]);

        return {
            data: data as RoleDocument[],
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: string, populate = false): Promise<RoleDocument> {
        this.assertValidId(id);
        let q = this.roleModel.findById(id).select('-__v');
        if (populate) q = q.populate(PERM_POPULATE) as typeof q;
        const role = await q.exec();
        if (!role) throw new NotFoundException(`Role topilmadi: ${id}`);
        return role;
    }

    async findByName(name: string, populate = false): Promise<RoleDocument> {
        let q = this.roleModel.findOne({ name }).select('-__v');
        if (populate) q = q.populate(PERM_POPULATE) as typeof q;
        const role = await q.exec();
        if (!role) throw new NotFoundException(`Role topilmadi: ${name}`);
        return role;
    }

    // ════════════════════════════════════════════════════════
    // UPDATE
    // ════════════════════════════════════════════════════════

    async update(id: string, dto: UpdateRoleDto, metadata: MetadataInfo): Promise<RoleDocument> {
        const session = await this.connection.startSession();
        session.startTransaction();
        try {
            this.assertValidId(id);
            const role = await this.roleModel.findById(id).session(session).exec();
            if (!role) throw new NotFoundException(`Role topilmadi: ${id}`);

            // ── System role guards ────────────────────────────
            if (role.isSystemRole) {
                if (dto.name && dto.name !== role.name) {
                    throw new ForbiddenException("System role nomini o'zgartirish mumkin emas");
                }
                if (dto.isSystemRole === false) {
                    throw new ForbiddenException("System role flagini o'chirib bo'lmaydi");
                }
                dto.isSystemRole = true; // silently enforce
            }

            // ── Name uniqueness ───────────────────────────────
            if (dto.name && dto.name !== role.name) {
                await this.assertNameUnique(dto.name, id, session);
            }

            // ── Permission IDs validation ─────────────────────
            if (dto.permissions?.length) {
                this.assertValidIds(dto.permissions, 'Permission');
            }

            // ── Build change history ──────────────────────────
            const changes = this.buildChanges(role.toObject(), dto, metadata);

            Object.assign(role, {
                ...dto,
                permissions: dto.permissions ? dto.permissions.map((pid) => new Types.ObjectId(pid)) : role.permissions,
                updatedBy: [...(role.updatedBy ?? []), metadata],
            });

            if (changes.length > 0) {
                role.updateHistory = [...(role.updateHistory ?? []), ...changes];
                this.pushAudit(role, 'update', metadata, changes);
            }

            await role.save({ session });
            await session.commitTransaction();

            await role.populate(PERM_POPULATE);
            return role;
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    }

    // ════════════════════════════════════════════════════════
    // PERMISSIONS
    // ════════════════════════════════════════════════════════

    async assignPermissions(id: string, dto: AssignPermissionsDto, metadata: MetadataInfo): Promise<RoleDocument> {
        this.assertValidId(id);
        this.assertValidIds(dto.permissionIds, 'Permission');

        const role = await this.findOne(id);
        const newIds = dto.permissionIds.map((pid) => new Types.ObjectId(pid));
        const existingSet = new Set(role.permissions.map((p) => p.toString()));
        const toAdd = newIds.filter((p) => !existingSet.has(p.toString()));

        if (toAdd.length === 0) {
            throw new BadRequestException('Barcha permissions allaqachon belgilangan');
        }

        const oldPermissions = [...role.permissions];
        role.permissions = [...role.permissions, ...toAdd];
        role.updatedBy = [...(role.updatedBy ?? []), metadata];

        this.pushAudit(role, 'assign_permissions', metadata, [
            {
                field: 'permissions',
                oldValue: oldPermissions.map(String),
                newValue: role.permissions.map(String),
                changedAt: new Date(),
                changedBy: metadata,
            },
        ]);

        await role.save();
        await role.populate(PERM_POPULATE);
        return role;
    }

    async removePermissions(id: string, dto: RemovePermissionsDto, metadata: MetadataInfo): Promise<RoleDocument> {
        this.assertValidId(id);
        this.assertValidIds(dto.permissionIds, 'Permission');

        const role = await this.findOne(id);

        if (role.isSystemRole) {
            throw new ForbiddenException("System role-dan permissions olib bo'lmaydi");
        }

        const toRemove = new Set(dto.permissionIds.map((pid) => pid.toString()));
        const oldPermissions = [...role.permissions];
        role.permissions = role.permissions.filter((p) => !toRemove.has(p.toString()));

        if (role.permissions.length === oldPermissions.length) {
            throw new BadRequestException('Olib tashlash uchun permissions topilmadi');
        }

        role.updatedBy = [...(role.updatedBy ?? []), metadata];

        this.pushAudit(role, 'remove_permissions', metadata, [
            {
                field: 'permissions',
                oldValue: oldPermissions.map(String),
                newValue: role.permissions.map(String),
                changedAt: new Date(),
                changedBy: metadata,
            },
        ]);

        await role.save();
        await role.populate(PERM_POPULATE);
        return role;
    }

    // ════════════════════════════════════════════════════════
    // STATUS
    // ════════════════════════════════════════════════════════

    async changeStatus(id: string, dto: ChangeStatusDto, metadata: MetadataInfo): Promise<RoleDocument> {
        // Single DB query — no double-fetch
        this.assertValidId(id);
        const role = await this.roleModel.findById(id).exec();
        if (!role) throw new NotFoundException(`Role topilmadi: ${id}`);

        if (role.status === dto.status) {
            throw new BadRequestException(`Role allaqachon '${dto.status}' holatida`);
        }

        const fromStatus = role.status;
        role.status = dto.status;
        role.statusHistory.push({
            fromStatus,
            toStatus: dto.status,
            changedAt: new Date(),
            changedBy: metadata,
            reason: dto.reason,
            isAutomatic: false,
        });

        if (dto.status === EntityStatus.INACTIVE) {
            role.inactivatedAt = new Date();
            role.inactivatedBy = metadata;
            role.inactiveReason = dto.reason ?? "No";
        } else if (dto.status === EntityStatus.ACTIVE) {
            role.activatedAt = new Date();
        }

        this.pushAudit(role, 'status_change', metadata, [
            {
                field: 'status',
                oldValue: fromStatus,
                newValue: dto.status,
                changedAt: new Date(),
                changedBy: metadata,
            },
        ]);

        await role.save();
        await role.populate(PERM_POPULATE);
        return role;
    }

    async scheduleStatus(id: string, dto: ScheduleStatusDto, metadata: MetadataInfo): Promise<RoleDocument> {
        this.assertValidId(id);
        const role = await this.roleModel.findById(id).exec();
        if (!role) throw new NotFoundException(`Role topilmadi: ${id}`);

        const scheduledAt = new Date(dto.scheduledAt);
        if (scheduledAt <= new Date()) {
            throw new BadRequestException("Rejalashtirilgan vaqt o'tgan bo'lishi mumkin emas");
        }

        role.statusSchedules.push({
            scheduledStatus: dto.status,
            scheduledAt,
            setBy: metadata,
        });

        if (dto.status === EntityStatus.ACTIVE) role.activationScheduledAt = scheduledAt;
        else if (dto.status === EntityStatus.ARCHIVE) role.archiveScheduledAt = scheduledAt;
        else if (dto.status === EntityStatus.DELETED) role.scheduledDeletionAt = scheduledAt;

        this.pushAudit(role, `schedule_status_${dto.status.toLowerCase()}` as any, metadata);
        await role.save();
        return role;
    }

    // ════════════════════════════════════════════════════════
    // DELETE / RESTORE
    // ════════════════════════════════════════════════════════

    async softDelete(id: string, metadata: MetadataInfo, reason?: string): Promise<RoleDocument> {
        this.assertValidId(id);

        // Single query — no findOne double-fetch
        const role = await this.roleModel.findById(id).exec();
        if (!role) throw new NotFoundException(`Role topilmadi: ${id}`);
        if (role.isSystemRole) throw new ForbiddenException("System role o'chirib bo'lmaydi");
        if (role.isDeleted) throw new BadRequestException("Role allaqachon o'chirilgan");
        if ((role.userCount as number) > 0) {
            throw new BadRequestException(`Role ${role.userCount} ta foydalanuvchiga biriktirilgan. Avval ularni o'zgartiring`);
        }

        const scheduledDeletion = new Date();
        scheduledDeletion.setDate(scheduledDeletion.getDate() + 30);

        role.isDeleted = true;
        role.status = EntityStatus.INACTIVE;
        role.deletedBy = [...(role.deletedBy ?? []), metadata];
        role.scheduledDeletionAt = scheduledDeletion;
        role.inactiveReason = reason ?? 'No';

        this.pushAudit(role, 'soft_delete', metadata);
        await role.save();
        return role;
    }

    async softDeleteMultiple(dto: BulkDeleteDto, metadata: MetadataInfo): Promise<BulkDeleteResult> {
        const invalidIds = dto.ids.filter((id) => !Types.ObjectId.isValid(id));
        const validIds = dto.ids.filter((id) => Types.ObjectId.isValid(id));

        if (validIds.length === 0) {
            return {
                deletedCount: 0,
                notFoundIds: [],
                invalidIds,
                systemRoleIds: [],
                rolesWithUsers: [],
                alreadyDeletedIds: [],
            };
        }

        // Fetch ALL matching docs in ONE query BEFORE any mutation
        const existingDocs = await this.roleModel
            .find({ _id: { $in: validIds } })
            .select('_id isSystemRole userCount isDeleted')
            .lean()
            .exec();

        const foundSet = new Set(existingDocs.map((r: any) => r._id.toString()));
        const notFoundIds = validIds.filter((id) => !foundSet.has(id));

        const systemRoleIds: string[] = [];
        const rolesWithUsers: string[] = [];
        const alreadyDeletedIds: string[] = [];
        const deletableIds: string[] = [];

        for (const doc of existingDocs as any[]) {
            const sid = doc._id.toString();
            if (doc.isSystemRole) {
                systemRoleIds.push(sid);
            } else if ((doc.userCount as number) > 0) {
                rolesWithUsers.push(sid);
            } else if (doc.isDeleted) {
                alreadyDeletedIds.push(sid);
            } else {
                deletableIds.push(sid);
            }
        }

        if (deletableIds.length === 0) {
            return {
                deletedCount: 0,
                notFoundIds,
                invalidIds,
                systemRoleIds,
                rolesWithUsers,
                alreadyDeletedIds,
            };
        }

        const scheduledDeletion = new Date();
        scheduledDeletion.setDate(scheduledDeletion.getDate() + 30);

        const result = await this.roleModel.updateMany(
            { _id: { $in: deletableIds } },
            {
                $set: {
                    isDeleted: true,
                    status: EntityStatus.INACTIVE,
                    scheduledDeletionAt: scheduledDeletion,
                    inactiveReason: dto.reason ?? "No",
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

        this.logger.log(`Bulk delete: ${result.modifiedCount} deleted, ` + `${systemRoleIds.length} system (skipped), ` + `${rolesWithUsers.length} has users (skipped), ` + `${alreadyDeletedIds.length} already deleted`);

        return {
            deletedCount: result.modifiedCount,
            notFoundIds,
            invalidIds,
            systemRoleIds,
            rolesWithUsers,
            alreadyDeletedIds,
        };
    }

    async restore(id: string, metadata: MetadataInfo): Promise<RoleDocument> {
        this.assertValidId(id);

        const role = await this.roleModel.findById(id).exec();
        if (!role) throw new NotFoundException(`Role topilmadi: ${id}`);
        if (!role.isDeleted) throw new BadRequestException("Role o'chirilmagan");

        role.isDeleted = false;
        role.restoredAt = new Date();
        role.restoredBy = [...(role.restoredBy ?? []), metadata];
        role.status = EntityStatus.PENDING;
        role.scheduledDeletionAt = undefined;

        this.pushAudit(role, 'restore', metadata);
        await role.save();
        return role;
    }

    async hardDelete(id: string, metadata: MetadataInfo): Promise<void> {
        this.assertValidId(id);

        const role = await this.roleModel.findById(id).exec();
        if (!role) throw new NotFoundException(`Role topilmadi: ${id}`);
        if (role.isSystemRole) {
            throw new ForbiddenException("System role'ni butunlay o'chirib bo'lmaydi");
        }
        if (!role.isDeleted) {
            throw new BadRequestException('Permanent delete uchun avval soft-delete qilish kerak');
        }
        if ((role.userCount as number) > 0) {
            throw new BadRequestException(`Role ${role.userCount} ta foydalanuvchiga biriktirilgan`);
        }

        this.logger.warn(`Hard delete: role "${role.name}" (${id}) by ${metadata.username}`);
        await role.deleteOne();
    }

    // ════════════════════════════════════════════════════════
    // SCHEDULED CLEANUP (call via @Cron)
    // ════════════════════════════════════════════════════════

    async deleteExpiredRoles(): Promise<number> {
        const result = await this.roleModel.deleteMany({
            isDeleted: true,
            isSystemRole: { $ne: true },
            userCount: 0,
            scheduledDeletionAt: { $lte: new Date() },
        });
        if (result.deletedCount > 0) {
            this.logger.log(`Expired roles cleaned up: ${result.deletedCount}`);
        }
        return result.deletedCount ?? 0;
    }

    // ════════════════════════════════════════════════════════
    // AUDIT / HISTORY
    // ════════════════════════════════════════════════════════

    async getAuditLog(id: string): Promise<AuditLog[]> {
        const role = await this.findOne(id);
        return [...role.auditLog].reverse();
    }

    async getStatusHistory(id: string): Promise<StatusHistory[]> {
        const role = await this.findOne(id);
        return [...role.statusHistory].reverse();
    }

    async getUpdateHistory(id: string): Promise<FieldChange[]> {
        const role = await this.findOne(id);
        return [...role.updateHistory].reverse();
    }

    // ════════════════════════════════════════════════════════
    // STATISTICS
    // ════════════════════════════════════════════════════════

    async getStatistics(): Promise<RoleStats> {
        // All statistics exclude soft-deleted records
        const activeFilter = { isDeleted: false };

        const [total, statusStats, systemCount, customCount, totalUsersResult] = await Promise.all([this.roleModel.countDocuments(activeFilter), this.roleModel.aggregate([{ $match: activeFilter }, { $group: { _id: '$status', count: { $sum: 1 } } }]), this.roleModel.countDocuments({ ...activeFilter, isSystemRole: true }), this.roleModel.countDocuments({ ...activeFilter, isSystemRole: false }), this.roleModel.aggregate([{ $match: activeFilter }, { $group: { _id: null, total: { $sum: '$userCount' } } }])]);

        const byStatus: Record<string, number> = Object.fromEntries(statusStats.map(({ _id, count }: any) => [_id ?? 'unknown', count]));

        return {
            total,
            byStatus,
            systemRoles: systemCount,
            customRoles: customCount,
            totalUsersAssigned: totalUsersResult[0]?.total ?? 0,
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

    private async assertNameUnique(name: string, excludeId?: string, session?: ClientSession): Promise<void> {
        const filter: FilterQuery<RoleDocument> = { name };
        if (excludeId) filter._id = { $ne: new Types.ObjectId(excludeId) };
        const exists = await this.roleModel
            .findOne(filter)
            .session(session ?? null)
            .lean()
            .exec();
        if (exists) throw new ConflictException(`Role '${name}' allaqachon mavjud`);
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

    private pushAudit(role: RoleDocument, action: string, metadata: MetadataInfo, changes?: FieldChange[]): void {
        role.auditLog.push({
            action: action as any,
            performedBy: metadata,
            timestamp: new Date(),
            changes: changes ?? [],
        });
    }
}

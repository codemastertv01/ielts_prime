import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { EntityStatus } from '../dto/entity-status.dto';
import type { FieldChange } from '../dto/field-change.dto';
import type { MetadataInfo } from '../dto/metadata-info.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { GetPermissionsDto } from './dto/get-permissions.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ChangeStatusDto } from '../dto/change-status.dto';
import { BulkDeleteDto } from '../dto/bulk-delete.dto';

// ─── Response types ────────────────────────────────────────────────────────────

export interface PermissionListResult {
    data: PermissionDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface BulkDeleteResult {
    deletedCount: number;
    notFoundIds: string[];
    invalidIds: string[];
    systemPermissionIds: string[];
    alreadyDeletedIds: string[];
}

export interface BulkCreateResult {
    createdCount: number;
    created: PermissionDocument[];
    errors: Array<{ index: number; name: string; error: string }>;
}

export interface PermissionStats {
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byResource: Record<string, number>;
    systemPermissions: number;
    customPermissions: number;
}

// ─── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class PermissionsService {
    private readonly logger = new Logger(PermissionsService.name);

    constructor(
        @InjectModel(Permission.name)
        private readonly permissionModel: Model<PermissionDocument>
    ) {}

    // ════════════════════════════════════════════════════════
    // CREATE
    // ════════════════════════════════════════════════════════

    async create(dto: CreatePermissionDto, metadata: MetadataInfo): Promise<PermissionDocument> {
        await this.assertNameUnique(dto.name);

        try {
            return await new this.permissionModel({
                ...dto,
                createdBy: metadata,
                status: EntityStatus.PENDING,
                auditLog: [
                    {
                        action: 'create',
                        performedBy: metadata,
                        timestamp: new Date(),
                    },
                ],
            }).save();
        } catch (err) {
            if (err.code === 11000) {
                throw new ConflictException(`Permission '${dto.name}' allaqachon mavjud`);
            }
            throw err;
        }
    }

    async createMultiple(dtos: CreatePermissionDto[], metadata: MetadataInfo): Promise<BulkCreateResult> {
        const created: PermissionDocument[] = [];
        const errors: BulkCreateResult['errors'] = [];

        for (let i = 0; i < dtos.length; i++) {
            try {
                created.push(await this.create(dtos[i], metadata));
            } catch (err) {
                errors.push({ index: i, name: dtos[i].name, error: err.message });
            }
        }

        this.logger.log(`Bulk create: ${created.length} created, ${errors.length} failed`);
        return { createdCount: created.length, created, errors };
    }

    // ════════════════════════════════════════════════════════
    // READ
    // ════════════════════════════════════════════════════════

    async findAll(query: GetPermissionsDto): Promise<PermissionListResult> {
        const { page = 1, limit = 10, search, status, category, scope, resource, action, sortBy = 'createdAt', sortOrder = 'desc', includeDeleted = false } = query;

        const filter: FilterQuery<PermissionDocument> = {};

        if (!includeDeleted) filter.isDeleted = false;

        if (search?.trim()) {
            const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.$or = [{ name: { $regex: escaped, $options: 'i' } }, { resource: { $regex: escaped, $options: 'i' } }, { description: { $regex: escaped, $options: 'i' } }];
        }

        if (status) filter.status = status;
        if (category) filter.category = category;
        if (scope) filter.scope = scope;
        if (resource) filter.resource = resource.toLowerCase();
        if (action) filter.action = action;

        const skip = (page - 1) * limit;
        const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [data, total] = await Promise.all([this.permissionModel.find(filter).sort(sort).skip(skip).limit(limit).lean().exec(), this.permissionModel.countDocuments(filter).exec()]);

        return {
            data: data as unknown as PermissionDocument[],
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: string): Promise<PermissionDocument> {
        this.assertValidId(id);
        const doc = await this.permissionModel.findById(id).exec();
        if (!doc) throw new NotFoundException(`Permission topilmadi: ${id}`);
        return doc;
    }

    async findByName(name: string): Promise<PermissionDocument> {
        const doc = await this.permissionModel.findOne({ name: name.toLowerCase() }).exec();
        if (!doc) throw new NotFoundException(`Permission topilmadi: ${name}`);
        return doc;
    }

    async findByResource(resource: string): Promise<PermissionDocument[]> {
        return this.permissionModel.find({ resource: resource.toLowerCase(), isDeleted: false }).lean().exec() as unknown as PermissionDocument[];
    }

    // ════════════════════════════════════════════════════════
    // UPDATE
    // ════════════════════════════════════════════════════════

    async update(id: string, dto: UpdatePermissionDto, metadata: MetadataInfo): Promise<PermissionDocument> {
        this.assertValidId(id);

        const existing = await this.permissionModel.findById(id).exec();
        if (!existing) throw new NotFoundException(`Permission topilmadi: ${id}`);

        // ── isSystemPermission immutability guard ─────────────
        if (existing.isSystemPermission && dto.isSystemPermission === false) {
            throw new ForbiddenException("System permission'ni oddiy permission'ga o'zgartirish mumkin emas.");
        }
        if (existing.isSystemPermission) {
            dto.isSystemPermission = true; // silently enforce: once system, always system
        }

        // ── Name uniqueness (only if name is changing) ────────
        if (dto.name && dto.name.toLowerCase() !== existing.name) {
            await this.assertNameUnique(dto.name);
        }

        // ── Build change history ──────────────────────────────
        const changes: FieldChange[] = [];
        for (const key of Object.keys(dto) as (keyof UpdatePermissionDto)[]) {
            const oldVal = (existing as any)[key];
            const newVal = dto[key];
            if (newVal !== undefined && String(oldVal) !== String(newVal)) {
                changes.push({
                    field: key,
                    oldValue: oldVal,
                    newValue: newVal,
                    changedAt: new Date(),
                    changedBy: metadata,
                });
            }
        }

        const update: Record<string, any> = { ...dto, updatedBy: metadata };
        if (changes.length > 0) {
            update.$push = {
                updateHistory: { $each: changes },
                auditLog: {
                    action: 'update',
                    performedBy: metadata,
                    changes,
                    timestamp: new Date(),
                },
            };
        }

        const updated = await this.permissionModel.findByIdAndUpdate(id, update, {
            new: true,
            runValidators: true,
        });
        if (!updated) throw new NotFoundException(`Permission topilmadi: ${id}`);
        return updated;
    }

    async changeStatus(id: string, dto: ChangeStatusDto, metadata: MetadataInfo): Promise<PermissionDocument> {
        this.assertValidId(id);

        // Single DB query — no double-fetch
        const doc = await this.permissionModel.findById(id).exec();
        if (!doc) throw new NotFoundException(`Permission topilmadi: ${id}`);

        if (doc.status === dto.status) {
            throw new BadRequestException(`Permission allaqachon '${dto.status}' holatida`);
        }

        const update: Record<string, any> = {
            status: dto.status,
            $push: {
                statusHistory: {
                    fromStatus: doc.status,
                    toStatus: dto.status,
                    changedAt: new Date(),
                    changedBy: metadata,
                    reason: dto.reason ?? null,
                    isAutomatic: false,
                },
                auditLog: {
                    action: 'status_change',
                    performedBy: metadata,
                    changes: [
                        {
                            field: 'status',
                            oldValue: doc.status,
                            newValue: dto.status,
                            changedAt: new Date(),
                            changedBy: metadata,
                        },
                    ],
                    timestamp: new Date(),
                },
            },
        };

        if (dto.status === EntityStatus.INACTIVE) {
            update.inactivatedAt = new Date();
            update.inactivatedBy = metadata;
            update.inactiveReason = dto.reason ?? null;
        }

        return (await this.permissionModel.findByIdAndUpdate(id, update, { new: true }))!;
    }

    // ════════════════════════════════════════════════════════
    // DELETE / RESTORE
    // ════════════════════════════════════════════════════════

    async softDelete(id: string, metadata: MetadataInfo): Promise<PermissionDocument> {
        this.assertValidId(id);

        const doc = await this.permissionModel.findById(id).exec();
        if (!doc) throw new NotFoundException(`Permission topilmadi: ${id}`);
        if (doc.isSystemPermission) {
            throw new ForbiddenException("System permission o'chirib bo'lmaydi");
        }
        if (doc.isDeleted) {
            throw new BadRequestException("Bu permission allaqachon o'chirilgan");
        }

        const scheduledDeletion = new Date();
        scheduledDeletion.setDate(scheduledDeletion.getDate() + 30);

        return (await this.permissionModel.findByIdAndUpdate(
            id,
            {
                isDeleted: true,
                status: EntityStatus.INACTIVE,
                scheduledDeletionAt: scheduledDeletion,
                $push: {
                    deletedBy: metadata,
                    auditLog: {
                        action: 'delete',
                        performedBy: metadata,
                        timestamp: new Date(),
                    },
                },
            },
            { new: true }
        ))!;
    }

    async softDeleteMultiple(dto: BulkDeleteDto, metadata: MetadataInfo): Promise<BulkDeleteResult> {
        // 1. Separate invalid ObjectId strings up front
        const invalidIds = dto.ids.filter((id) => !Types.ObjectId.isValid(id));
        const validIds = dto.ids.filter((id) => Types.ObjectId.isValid(id));

        if (validIds.length === 0) {
            return { deletedCount: 0, notFoundIds: [], invalidIds, systemPermissionIds: [], alreadyDeletedIds: [] };
        }

        // 2. Fetch all matching documents in ONE query (before any mutation)
        const existingDocs = await this.permissionModel
            .find({ _id: { $in: validIds } })
            .select('_id isSystemPermission isDeleted')
            .lean()
            .exec();

        const existingIds = new Set(existingDocs.map((d) => d._id.toString()));
        const notFoundIds = validIds.filter((id) => !existingIds.has(id));

        const systemPermissionIds: string[] = [];
        const alreadyDeletedIds: string[] = [];
        const deletableIds: string[] = [];

        for (const doc of existingDocs) {
            const sid = doc._id.toString();
            if (doc.isSystemPermission) {
                systemPermissionIds.push(sid);
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
                systemPermissionIds,
                alreadyDeletedIds,
            };
        }

        const scheduledDeletion = new Date();
        scheduledDeletion.setDate(scheduledDeletion.getDate() + 30);

        const result = await this.permissionModel.updateMany(
            { _id: { $in: deletableIds } },
            {
                $set: {
                    isDeleted: true,
                    status: EntityStatus.INACTIVE,
                    scheduledDeletionAt: scheduledDeletion,
                },
                $push: {
                    deletedBy: metadata,
                    auditLog: {
                        action: 'delete',
                        performedBy: metadata,
                        timestamp: new Date(),
                        note: dto.reason ?? null,
                    },
                },
            }
        );

        this.logger.log(`Bulk delete: ${result.modifiedCount} deleted, ` + `${notFoundIds.length} not found, ` + `${systemPermissionIds.length} system (skipped), ` + `${alreadyDeletedIds.length} already deleted`);

        return {
            deletedCount: result.modifiedCount,
            notFoundIds,
            invalidIds,
            systemPermissionIds,
            alreadyDeletedIds,
        };
    }

    async restore(id: string, metadata: MetadataInfo): Promise<PermissionDocument> {
        this.assertValidId(id);

        const doc = await this.permissionModel.findById(id).exec();
        if (!doc) throw new NotFoundException(`Permission topilmadi: ${id}`);
        if (!doc.isDeleted) throw new BadRequestException("Bu permission o'chirilmagan");

        return (await this.permissionModel.findByIdAndUpdate(
            id,
            {
                isDeleted: false,
                status: EntityStatus.PENDING,
                scheduledDeletionAt: null,
                restoredAt: new Date(),
                $push: {
                    restoredBy: metadata,
                    auditLog: {
                        action: 'restore',
                        performedBy: metadata,
                        timestamp: new Date(),
                    },
                },
            },
            { new: true }
        ))!;
    }

    async permanentDelete(id: string): Promise<void> {
        this.assertValidId(id);

        const doc = await this.permissionModel.findById(id).exec();
        if (!doc) throw new NotFoundException(`Permission topilmadi: ${id}`);
        if (doc.isSystemPermission) {
            throw new ForbiddenException("System permission butunlay o'chirib bo'lmaydi");
        }
        if (!doc.isDeleted) {
            throw new BadRequestException('Permanent delete uchun avval soft-delete qilish kerak');
        }

        await this.permissionModel.findByIdAndDelete(id).exec();
        this.logger.warn(`Permission permanently deleted: ${id}`);
    }

    // ════════════════════════════════════════════════════════
    // SCHEDULED CLEANUP  (call via @Cron)
    // ════════════════════════════════════════════════════════

    async deleteExpiredPermissions(): Promise<number> {
        const result = await this.permissionModel.deleteMany({
            isDeleted: true,
            isSystemPermission: { $ne: true },
            scheduledDeletionAt: { $lte: new Date() },
        });

        if (result.deletedCount > 0) {
            this.logger.log(`Expired permissions cleaned up: ${result.deletedCount}`);
        }
        return result.deletedCount ?? 0;
    }

    // ════════════════════════════════════════════════════════
    // STATISTICS
    // ════════════════════════════════════════════════════════

    async getStatistics(): Promise<PermissionStats> {
        // All statistics exclude soft-deleted records
        const activeFilter = { isDeleted: false };

        const groupByField = (field: string) => [{ $match: activeFilter }, { $group: { _id: `$${field}`, count: { $sum: 1 } } }];

        const [total, statusStats, categoryStats, resourceStats, systemCount, customCount] = await Promise.all([this.permissionModel.countDocuments(activeFilter), this.permissionModel.aggregate(groupByField('status')), this.permissionModel.aggregate(groupByField('category')), this.permissionModel.aggregate(groupByField('resource')), this.permissionModel.countDocuments({ ...activeFilter, isSystemPermission: true }), this.permissionModel.countDocuments({ ...activeFilter, isSystemPermission: false })]);

        const toRecord = (arr: { _id: string; count: number }[]): Record<string, number> => Object.fromEntries(arr.map(({ _id, count }) => [_id ?? 'unknown', count]));

        return {
            total,
            byStatus: toRecord(statusStats),
            byCategory: toRecord(categoryStats),
            byResource: toRecord(resourceStats),
            systemPermissions: systemCount,
            customPermissions: customCount,
        };
    }

    // ════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ════════════════════════════════════════════════════════

    private assertValidId(id: string): void {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Noto'g'ri ID formati");
        }
    }

    private async assertNameUnique(name: string): Promise<void> {
        const exists = await this.permissionModel.findOne({ name: name.toLowerCase() }).select('_id').lean().exec();
        if (exists) throw new ConflictException(`Permission '${name}' allaqachon mavjud`);
    }
}

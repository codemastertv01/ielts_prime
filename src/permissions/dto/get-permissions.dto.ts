import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { PermissionCategory, PermissionScope } from '../schemas/permission.schema';
import { EntityStatus } from '../../dto/entity-status.dto';
import { PERMISSION_ACTIONS } from '../../dto/permission-operation.dto';

const SORTABLE_FIELDS = ['name', 'resource', 'action', 'category', 'scope', 'createdAt', 'updatedAt'] as const;

export type SortableField = (typeof SORTABLE_FIELDS)[number];

export class GetPermissionsDto {
    @ApiPropertyOptional({ default: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Search by name, resource, description' })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    search?: string;

    @ApiPropertyOptional({ enum: EntityStatus })
    @IsOptional()
    @IsEnum(EntityStatus)
    status?: EntityStatus;

    @ApiPropertyOptional({ enum: PermissionCategory })
    @IsOptional()
    @IsEnum(PermissionCategory)
    category?: PermissionCategory;

    @ApiPropertyOptional({ enum: PermissionScope })
    @IsOptional()
    @IsEnum(PermissionScope)
    scope?: PermissionScope;

    @ApiPropertyOptional({ example: 'users' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    resource?: string;

    @ApiPropertyOptional({ enum: PERMISSION_ACTIONS })
    @IsOptional()
    @IsEnum(PERMISSION_ACTIONS)
    action?: string;

    @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'createdAt' })
    @IsOptional()
    @IsEnum(SORTABLE_FIELDS)
    sortBy?: SortableField = 'createdAt';

    @ApiPropertyOptional({ default: 'desc', enum: ['asc', 'desc'] })
    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'desc';

    @ApiPropertyOptional({
        description: 'Include soft-deleted records',
        default: false,
    })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    includeDeleted?: boolean = false;
}

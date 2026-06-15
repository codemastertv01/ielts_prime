import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { EntityStatus } from '../../dto/entity-status.dto';
import { RoleType } from '../schemas/role.schema';

const SORTABLE_FIELDS = ['name', 'priority', 'userCount', 'createdAt', 'updatedAt'] as const;

export type RoleSortableField = (typeof SORTABLE_FIELDS)[number];

export class GetRolesDto {
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

    @ApiPropertyOptional({ description: 'Search by name or description' })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    search?: string;

    @ApiPropertyOptional({ enum: EntityStatus })
    @IsOptional()
    @IsEnum(EntityStatus)
    status?: EntityStatus;

    @ApiPropertyOptional({ enum: RoleType })
    @IsOptional()
    @IsEnum(RoleType, {
        message: `Type quyidagilardan biri bo'lishi kerak: ${Object.values(RoleType).join(', ')}`,
    })
    type?: RoleType;

    @ApiPropertyOptional({ description: 'Filter system roles only' })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isSystemRole?: boolean;

    @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'priority' })
    @IsOptional()
    @IsEnum(SORTABLE_FIELDS)
    sortBy?: RoleSortableField = 'priority';

    @ApiPropertyOptional({ default: 'desc', enum: ['asc', 'desc'] })
    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'desc';

    @ApiPropertyOptional({ description: 'Populate permissions', default: false })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    populate?: boolean = false;

    @ApiPropertyOptional({ description: 'Include soft-deleted records', default: false })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    includeDeleted?: boolean = false;
}

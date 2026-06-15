import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { EntityStatus } from '../../dto/entity-status.dto';

const USER_SORTABLE_FIELDS = ['username', 'email', 'firstName', 'lastName', 'createdAt', 'updatedAt', 'lastLoginAt', 'firstLoginAt'] as const;

export type UserSortableField = (typeof USER_SORTABLE_FIELDS)[number];

// ── List / search ──────────────────────────────────────────────────────────────

export class GetUsersDto {
    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 10, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Search by username, email, firstName, lastName' })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    search?: string;

    @ApiPropertyOptional({ enum: EntityStatus })
    @IsOptional()
    @IsEnum(EntityStatus)
    status?: EntityStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isEmailVerified?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isBlocked?: boolean;

    @ApiPropertyOptional({ description: 'Include soft-deleted records' })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    includeDeleted?: boolean;

    @ApiPropertyOptional({ enum: USER_SORTABLE_FIELDS, default: 'createdAt' })
    @IsOptional()
    @IsEnum(USER_SORTABLE_FIELDS)
    sortBy?: UserSortableField = 'createdAt';

    @ApiPropertyOptional({ default: 'desc', enum: ['asc', 'desc'] })
    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'desc';
}

// ── Block / unblock ────────────────────────────────────────────────────────────

export class BlockUserDto {
    @ApiPropertyOptional({
        description: 'true = block, false = unblock',
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    isBlocked?: boolean = true;

    @ApiPropertyOptional({ example: '2025-12-31T23:59:59.000Z' })
    @IsOptional()
    @IsDateString()
    blockedUntil?: string;

    @ApiPropertyOptional({ example: 'Spam faoliyati' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    blockReason?: string;
}

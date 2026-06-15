// attempts/dto/get-attempts-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { EntityStatus } from '../../dto/entity-status.dto';

export class GetAttemptsQueryDto {
    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @ApiPropertyOptional({ enum: EntityStatus })
    @IsOptional()
    @IsEnum(EntityStatus)
    status?: EntityStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    examId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : undefined))
    @IsBoolean()
    isDeleted?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : undefined))
    @IsBoolean()
    isReviewed?: boolean;

    // Search
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    q?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    attemptNumber?: number;

    // Sort
    @ApiPropertyOptional({ default: 'createdAt' })
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
    @IsOptional()
    @IsString()
    sortOrder?: 'asc' | 'desc' = 'desc';

    // Date ranges
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    createdFrom?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    createdTo?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    submittedFrom?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    submittedTo?: string;

    // Band score ranges
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    minOverallBand?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    maxOverallBand?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    minReadingBand?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    maxReadingBand?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    minListeningBand?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    maxListeningBand?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    minWritingBand?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    maxWritingBand?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    minSpeakingBand?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    maxSpeakingBand?: number;
}

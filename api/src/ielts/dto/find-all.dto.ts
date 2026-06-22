// ielts/dto/find-all.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { DifficultyLevel, ExamModule, ExamType } from './enums';

/** '' | null | 'all' → undefined (no filter) */
const toEnumOrUndefined = ({ value }: { value: any }) => (value === '' || value === null || value === 'all' ? undefined : value);

const toBool = ({ value }: { value: any }): boolean | undefined => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
};

const SORTABLE_EXAM_FIELDS = ['createdAt', 'updatedAt', 'title', 'totalAttempts', 'averageRating', 'difficulty', 'totalTimeLimitMinutes'] as const;

export type ExamSortableField = (typeof SORTABLE_EXAM_FIELDS)[number];

// ─── Admin DTO ────────────────────────────────────────────────

export class AdminFindAllDto {
    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 10, description: '0 = all records (no pagination)' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Search by title, description, tags' })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    search?: string;

    @ApiPropertyOptional({ enum: ExamType, description: "'' or 'all' → no filter" })
    @IsOptional()
    @Transform(toEnumOrUndefined)
    @IsEnum(ExamType)
    examType?: ExamType;

    @ApiPropertyOptional({ enum: ExamModule })
    @IsOptional()
    @Transform(toEnumOrUndefined)
    @IsEnum(ExamModule)
    module?: ExamModule;

    @ApiPropertyOptional({ enum: DifficultyLevel })
    @IsOptional()
    @Transform(toEnumOrUndefined)
    @IsEnum(DifficultyLevel)
    difficulty?: DifficultyLevel;

    @ApiPropertyOptional({ type: Boolean, description: 'true = published only, false = drafts only' })
    @IsOptional()
    @Transform(toBool)
    @IsBoolean()
    isPublished?: boolean;

    @ApiPropertyOptional({ type: Boolean })
    @IsOptional()
    @Transform(toBool)
    @IsBoolean()
    isPremium?: boolean;

    /**
     * true  → trash (soft-deleted only)
     * false → active (isDeleted=false)
     * undefined → all documents
     */
    @ApiPropertyOptional({
        type: Boolean,
        description: 'true=trash | false=active | omit=all',
    })
    @IsOptional()
    @Transform(toBool)
    @IsBoolean()
    isDeleted?: boolean;

    @ApiPropertyOptional({ description: 'EntityStatus filter: ACTIVE | INACTIVE | PENDING | ARCHIVE' })
    @IsOptional()
    @Transform(toEnumOrUndefined)
    @IsString()
    status?: string;

    @ApiPropertyOptional({ enum: SORTABLE_EXAM_FIELDS, default: 'createdAt' })
    @IsOptional()
    @Transform(toEnumOrUndefined)
    @IsEnum(SORTABLE_EXAM_FIELDS)
    sortBy?: ExamSortableField = 'createdAt';

    @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
    @IsOptional()
    @Transform(toEnumOrUndefined)
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'desc';

    @ApiPropertyOptional({ description: 'ISO date — createdAt >= this' })
    @IsOptional()
    @IsString()
    createdFrom?: string;

    @ApiPropertyOptional({ description: 'ISO date — createdAt <= this' })
    @IsOptional()
    @IsString()
    createdTo?: string;

    @ApiPropertyOptional({ description: 'ISO date — updatedAt >= this' })
    @IsOptional()
    @IsString()
    updatedFrom?: string;

    @ApiPropertyOptional({ description: 'ISO date — updatedAt <= this' })
    @IsOptional()
    @IsString()
    updatedTo?: string;
}

// ─── User DTO ─────────────────────────────────────────────────

export class UserFindAllDto {
    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 12, maximum: 50 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 12;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(200)
    search?: string;

    @ApiPropertyOptional({ enum: ExamType })
    @IsOptional()
    @Transform(toEnumOrUndefined)
    @IsEnum(ExamType)
    examType?: ExamType;

    @ApiPropertyOptional({ enum: ExamModule })
    @IsOptional()
    @Transform(toEnumOrUndefined)
    @IsEnum(ExamModule)
    module?: ExamModule;

    @ApiPropertyOptional({ enum: DifficultyLevel })
    @IsOptional()
    @Transform(toEnumOrUndefined)
    @IsEnum(DifficultyLevel)
    difficulty?: DifficultyLevel;

    @ApiPropertyOptional({ type: Boolean })
    @IsOptional()
    @Transform(toBool)
    @IsBoolean()
    isPremium?: boolean;

    @ApiPropertyOptional({ enum: SORTABLE_EXAM_FIELDS, default: 'createdAt' })
    @IsOptional()
    @Transform(toEnumOrUndefined)
    @IsEnum(SORTABLE_EXAM_FIELDS)
    sortBy?: ExamSortableField = 'createdAt';

    @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
    @IsOptional()
    @Transform(toEnumOrUndefined)
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'desc';
}

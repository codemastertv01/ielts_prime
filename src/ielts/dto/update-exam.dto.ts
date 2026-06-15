// ielts/dto/update-exam.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUrl, Max, MaxLength, Min } from 'class-validator';
import { DifficultyLevel, ExamModule, ExamType } from './enums';

export class UpdateIELTSExamDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(200)
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @ApiPropertyOptional({ enum: ExamType })
    @IsOptional()
    @IsEnum(ExamType)
    examType?: ExamType;

    @ApiPropertyOptional({ enum: ExamModule })
    @IsOptional()
    @IsEnum(ExamModule)
    module?: ExamModule;

    @ApiPropertyOptional({ enum: DifficultyLevel })
    @IsOptional()
    @IsEnum(DifficultyLevel)
    difficulty?: DifficultyLevel;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(600)
    totalTimeLimitMinutes?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(9)
    passingScore?: number;

    @ApiPropertyOptional()
    @IsOptional()
    readingSection?: any;

    @ApiPropertyOptional()
    @IsOptional()
    listeningSection?: any;

    @ApiPropertyOptional()
    @IsOptional()
    writingSection?: any;

    @ApiPropertyOptional()
    @IsOptional()
    speakingSection?: any;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isPremium?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsUrl()
    thumbnailUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    availableFrom?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    availableUntil?: string;
}

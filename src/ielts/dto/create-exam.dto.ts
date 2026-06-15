// ielts/dto/create-exam.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Max, MaxLength, Min } from 'class-validator';
import { DifficultyLevel, ExamModule, ExamType } from './enums';

export class CreateIELTSExamDto {
    @ApiProperty({ example: 'Cambridge IELTS 18 Test 1' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @ApiPropertyOptional({ example: 'Official Cambridge IELTS practice test.' })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @ApiProperty({ enum: ExamType })
    @IsEnum(ExamType)
    examType: ExamType;

    @ApiProperty({ enum: ExamModule })
    @IsEnum(ExamModule)
    module: ExamModule;

    @ApiProperty({ enum: DifficultyLevel })
    @IsEnum(DifficultyLevel)
    difficulty: DifficultyLevel;

    @ApiProperty({ description: 'Total time limit in minutes', example: 174 })
    @IsNumber()
    @Min(1)
    @Max(600)
    totalTimeLimitMinutes: number;

    @ApiPropertyOptional({ description: 'Minimum passing band score (0–9)', default: 5.5 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(9)
    passingScore?: number;

    @ApiPropertyOptional({ description: 'Reading section data' })
    @IsOptional()
    readingSection?: any;

    @ApiPropertyOptional({ description: 'Listening section data' })
    @IsOptional()
    listeningSection?: any;

    @ApiPropertyOptional({ description: 'Writing section data' })
    @IsOptional()
    writingSection?: any;

    @ApiPropertyOptional({ description: 'Speaking section data' })
    @IsOptional()
    speakingSection?: any;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    isPremium?: boolean;

    @ApiPropertyOptional({ description: 'Price in UZS (tiyin)', default: 0 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @ApiPropertyOptional({ type: [String], example: ['cambridge', 'academic'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsUrl()
    thumbnailUrl?: string;

    @ApiPropertyOptional({ description: 'ISO date string — exam becomes available from' })
    @IsOptional()
    @IsDateString()
    availableFrom?: string;

    @ApiPropertyOptional({ description: 'ISO date string — exam expires after' })
    @IsOptional()
    @IsDateString()
    availableUntil?: string;
}

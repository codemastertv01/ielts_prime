// attempts/dto/grade-writing.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUrl, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { EntityStatus } from '../../dto/entity-status.dto';
import { SubmitListeningAnswerDto, SubmitReadingAnswerDto } from './submit.dto';

/**
 * Writing task baholash uchun DTO.
 * 4 ta IELTS kriteri 0.5 qadam bilan 0–9 ball orasida bo'lishi shart.
 * Band score = (taskAchievement + coherenceCohesion + lexicalResource + grammaticalRange) / 4,
 * so'ng eng yaqin 0.5 ga yaxlitlanadi.
 */
export class GradeWritingDto {
    @ApiProperty({ description: 'Task raqami (1 yoki 2)', example: 1 })
    @IsInt()
    @Min(1)
    @Max(2)
    taskNumber: number;

    @ApiProperty({ description: 'Task Achievement / Task Response (0–9)', example: 6.5 })
    @IsNumber()
    @Min(0)
    @Max(9)
    taskAchievement: number;

    @ApiProperty({ description: 'Coherence & Cohesion (0–9)', example: 6 })
    @IsNumber()
    @Min(0)
    @Max(9)
    coherenceCohesion: number;

    @ApiProperty({ description: 'Lexical Resource (0–9)', example: 6 })
    @IsNumber()
    @Min(0)
    @Max(9)
    lexicalResource: number;

    @ApiProperty({ description: 'Grammatical Range & Accuracy (0–9)', example: 6.5 })
    @IsNumber()
    @Min(0)
    @Max(9)
    grammaticalRange: number;

    @ApiPropertyOptional({ description: "O'quvchiga ko'rsatiladigan batafsil feedback" })
    @IsOptional()
    @IsString()
    feedback?: string;

    @ApiPropertyOptional({ description: "AI tomonidan yaratilgan feedback (agar mavjud bo'lsa)" })
    @IsOptional()
    @IsString()
    aiFeedback?: string;
}

/**
 * Speaking part baholash uchun DTO.
 * Band = (fluencyCoherence + lexicalResource + grammaticalRange + pronunciation) / 4.
 */
export class GradeSpeakingDto {
    @ApiProperty({ description: 'Part raqami (1–3)', example: 2 })
    @IsInt()
    @Min(1)
    @Max(3)
    partNumber: number;

    @ApiProperty({ description: 'Fluency & Coherence (0–9)', example: 6 })
    @IsNumber()
    @Min(0)
    @Max(9)
    fluencyCoherence: number;

    @ApiProperty({ description: 'Lexical Resource (0–9)', example: 6 })
    @IsNumber()
    @Min(0)
    @Max(9)
    lexicalResource: number;

    @ApiProperty({ description: 'Grammatical Range & Accuracy (0–9)', example: 6.5 })
    @IsNumber()
    @Min(0)
    @Max(9)
    grammaticalRange: number;

    @ApiProperty({ description: 'Pronunciation (0–9)', example: 6 })
    @IsNumber()
    @Min(0)
    @Max(9)
    pronunciation: number;

    @ApiPropertyOptional({ description: "Audio transcript (AI STT yoki qo'lda)" })
    @IsOptional()
    @IsString()
    transcript?: string;

    @ApiPropertyOptional({ description: "O'quvchiga ko'rsatiladigan feedback" })
    @IsOptional()
    @IsString()
    feedback?: string;

    @ApiPropertyOptional({ description: 'AI feedback' })
    @IsOptional()
    @IsString()
    aiFeedback?: string;
}

/**
 * Speaking recording URL saqlash uchun DTO.
 * Frontend Firebase/S3 ga yuklaganidan keyin bu URL ni serverga yuboradi.
 */
export class SaveSpeakingRecordingDto {
    @ApiProperty({ description: 'Part raqami (1–3)', example: 1 })
    @IsInt()
    @Min(1)
    @Max(3)
    partNumber: number;

    @ApiProperty({ description: 'Firebase yoki S3 recording URL', example: 'https://storage.firebase.com/audio/abc.webm' })
    @IsString()
    @IsUrl()
    recordingUrl: string;

    @ApiProperty({ description: 'Recording davomiyligi soniyada', example: 95 })
    @IsNumber()
    @Min(1)
    durationSeconds: number;
}

/**
 * Auto-save DTO — har 30 soniyada frontenddan yuboriladi.
 * Barcha fieldlar optional — faqat o'zgargan qism yuboriladi.
 */
export class AutoSaveDto {
    @ApiPropertyOptional({ type: [SubmitReadingAnswerDto], description: "Reading javoblari (faqat o'zgarganlar)" })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SubmitReadingAnswerDto)
    readingAnswers?: SubmitReadingAnswerDto[];

    @ApiPropertyOptional({ type: [SubmitListeningAnswerDto], description: "Listening javoblari (faqat o'zgarganlar)" })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SubmitListeningAnswerDto)
    listeningAnswers?: SubmitListeningAnswerDto[];

    @ApiPropertyOptional({ description: 'Writing Task 1 matni (draft)' })
    @IsOptional()
    @IsString()
    writingTask1?: string;

    @ApiPropertyOptional({ description: 'Writing Task 2 matni (draft)' })
    @IsOptional()
    @IsString()
    writingTask2?: string;
}

/**
 * Admin tomonidan attempt ni qo'lda yangilash uchun DTO.
 * Barcha fieldlar optional — faqat o'zgartiriladigan qism yuboriladi.
 */
export class AdminUpdateAttemptDto {
    @ApiPropertyOptional({ enum: EntityStatus, description: "Submission statusini qo'lda o'zgartirish" })
    @IsOptional()
    @IsEnum(EntityStatus)
    status?: EntityStatus;

    @ApiPropertyOptional({ minimum: 0, maximum: 9, description: "Overall band scoreni qo'lda belgilash" })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(9)
    overallBandScore?: number;

    @ApiPropertyOptional({ minimum: 0, maximum: 9 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(9)
    readingBandScore?: number;

    @ApiPropertyOptional({ minimum: 0, maximum: 9 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(9)
    listeningBandScore?: number;

    @ApiPropertyOptional({ minimum: 0, maximum: 9 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(9)
    writingBandScore?: number;

    @ApiPropertyOptional({ minimum: 0, maximum: 9 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(9)
    speakingBandScore?: number;

    @ApiPropertyOptional({ type: [String], example: ['flagged', 'recheck'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional({ description: 'Review qilingan deb belgilash' })
    @IsOptional()
    @IsBoolean()
    isReviewed?: boolean;

    @ApiPropertyOptional({ maxLength: 500 })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    reviewNote?: string;

    @ApiPropertyOptional({ description: "Admin izohi (adminNotes arrayga qo'shiladi)", maxLength: 1000 })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    adminNote?: string;

    @ApiPropertyOptional({ description: "Umumiy feedback (o'quvchiga ko'rsatiladi)", maxLength: 1000 })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    generalFeedback?: string;
}

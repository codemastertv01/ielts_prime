// vocabulary/dto/find-vocabulary.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { CefrLevel, GameType, PartOfSpeech, WordCategory } from './enums';

// ─── Admin query ──────────────────────────────────────────────

export class AdminFindVocabularyDto {
    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 20 })
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @ApiPropertyOptional({ description: "So'z bo'yicha qidirish", example: 'abandon' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: CefrLevel })
    @IsOptional()
    @IsEnum(CefrLevel)
    cefrLevel?: CefrLevel;

    @ApiPropertyOptional({ enum: PartOfSpeech })
    @IsOptional()
    @IsEnum(PartOfSpeech)
    partOfSpeech?: PartOfSpeech;

    @ApiPropertyOptional({ enum: WordCategory })
    @IsOptional()
    @IsEnum(WordCategory)
    category?: WordCategory;

    @ApiPropertyOptional({ type: Boolean })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isPublished?: boolean;

    @ApiPropertyOptional({ type: Boolean })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isPremium?: boolean;

    @ApiPropertyOptional({ type: Boolean })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isDeleted?: boolean;

    @ApiPropertyOptional({ description: 'Tag bilan filter', example: 'oxford3000' })
    @IsOptional()
    @IsString()
    tag?: string;

    @ApiPropertyOptional({
        description: 'Saralash maydoni',
        enum: ['word', 'cefrLevel', 'createdAt', 'timesStudied', 'timesCorrect'],
        default: 'createdAt',
    })
    @IsOptional()
    @IsIn(['word', 'cefrLevel', 'createdAt', 'timesStudied', 'timesCorrect'])
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'desc';

    @ApiPropertyOptional({
        description: "Tarjima tili (response'da qaysi til qaytarilsin)",
        example: 'uz',
        default: 'en',
    })
    @IsOptional()
    @IsString()
    lang?: string = 'en';
}

// ─── User query (faqat published, active) ────────────────────

export class UserFindVocabularyDto {
    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 20 })
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @Max(50)
    limit?: number = 20;

    @ApiPropertyOptional({ description: "So'z bo'yicha qidirish", example: 'abandon' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: CefrLevel, description: "CEFR darajasi bo'yicha filter" })
    @IsOptional()
    @IsEnum(CefrLevel)
    cefrLevel?: CefrLevel;

    @ApiPropertyOptional({ enum: PartOfSpeech })
    @IsOptional()
    @IsEnum(PartOfSpeech)
    partOfSpeech?: PartOfSpeech;

    @ApiPropertyOptional({ enum: WordCategory })
    @IsOptional()
    @IsEnum(WordCategory)
    category?: WordCategory;

    @ApiPropertyOptional({ example: 'oxford3000' })
    @IsOptional()
    @IsString()
    tag?: string;

    @ApiPropertyOptional({ enum: ['word', 'cefrLevel', 'createdAt', 'timesStudied'] })
    @IsOptional()
    @IsIn(['word', 'cefrLevel', 'createdAt', 'timesStudied'])
    sortBy?: string = 'word';

    @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'asc';

    @ApiPropertyOptional({
        description: 'Javob tilini belgilash',
        example: 'uz',
        default: 'en',
    })
    @IsOptional()
    @IsString()
    lang?: string = 'en';
}

// ─── Game query ───────────────────────────────────────────────

export class GameQueryDto {
    @ApiPropertyOptional({
        description: "CEFR darajasi bo'yicha so'z tanlash",
        enum: CefrLevel,
    })
    @IsOptional()
    @IsEnum(CefrLevel)
    cefrLevel?: CefrLevel;

    @ApiPropertyOptional({ enum: WordCategory })
    @IsOptional()
    @IsEnum(WordCategory)
    category?: WordCategory;

    @ApiPropertyOptional({
        description: "O'yin uchun so'zlar soni (1–50)",
        default: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @Max(50)
    count?: number = 10;

    @ApiPropertyOptional({ description: 'Tarjima tili', example: 'uz', default: 'en' })
    @IsOptional()
    @IsString()
    lang?: string = 'en';
}

// ─── Word chain DTO ───────────────────────────────────────────

export class WordChainValidateDto {
    @ApiProperty({ description: "Foydalanuvchi yozgan so'z", example: 'elephant' })
    @IsString()
    @IsNotEmpty()
    userWord: string;

    @ApiProperty({ description: "Avvalgi so'z (server tomonidan berilgan)", example: 'apple' })
    @IsString()
    @IsNotEmpty()
    previousWord: string;

    @ApiPropertyOptional({ description: "Allaqachon ishlatilgan so'zlar ro'yxati", type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    usedWords?: string[] = [];

    @ApiPropertyOptional({ enum: CefrLevel })
    @IsOptional()
    @IsEnum(CefrLevel)
    cefrLevel?: CefrLevel;
}

// ─── Answer check ─────────────────────────────────────────────

export class CheckAnswerDto {
    @ApiProperty({ description: "O'yin turi", enum: GameType })
    @IsEnum(GameType)
    gameType: GameType;

    @ApiPropertyOptional({ description: "So'z ID si" })
    @IsOptional()
    @IsString()
    wordId?: string;

    @ApiPropertyOptional({ description: "So'z o'zi (wordId yo'q bo'lsa)" })
    @IsOptional()
    @IsString()
    word?: string;

    @ApiPropertyOptional({ description: 'Foydalanuvchi yozgan/tanlagan javob', example: 'abandon' })
    @IsOptional()
    @IsString()
    userAnswer?: string;

    @ApiPropertyOptional({ description: 'Tarjima tili (translation_input uchun)', default: 'uz' })
    @IsOptional()
    @IsString()
    lang?: string;
}

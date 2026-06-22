// vocabulary/dto/update-vocabulary.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsObject, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { CefrLevel, PartOfSpeech, WordCategory } from './enums';
import { GameSentenceDto } from './create-vocabulary.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class UpdateVocabularyDto {
    @ApiPropertyOptional({ example: 'abandon' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    word?: string;

    @ApiPropertyOptional({ enum: PartOfSpeech, isArray: true })
    @IsOptional()
    @IsArray()
    @IsEnum(PartOfSpeech, { each: true })
    partsOfSpeech?: PartOfSpeech[];

    @ApiPropertyOptional({ enum: CefrLevel })
    @IsOptional()
    @IsEnum(CefrLevel)
    cefrLevel?: CefrLevel;

    @ApiPropertyOptional({ example: '/əˈbændən/' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    phonetic?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUrl()
    audioUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUrl()
    imageUrl?: string;

    @ApiPropertyOptional({
        description: "Ko'p tilli tarjimalar — faqat o'zgartirilgan tillarni yuboring",
        example: {
            uz: {
                translation: 'tark etmoq',
                definition: "yangilangan ta'rif",
                exampleSentences: ['...'],
            },
        },
    })
    @IsOptional()
    @IsObject()
    translations?: Record<string, { translation: string; definition: string; exampleSentences: string[] }>;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    synonyms?: string[];

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    antonyms?: string[];

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    relatedWords?: string[];

    @ApiPropertyOptional({ enum: WordCategory, isArray: true })
    @IsOptional()
    @IsArray()
    @IsEnum(WordCategory, { each: true })
    categories?: WordCategory[];

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional({ type: [GameSentenceDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GameSentenceDto)
    gameSentences?: GameSentenceDto[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isPremium?: boolean;
}

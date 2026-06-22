// vocabulary/dto/create-vocabulary.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUrl, MaxLength, MinLength, ValidateNested, ArrayMinSize, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { CefrLevel, PartOfSpeech, WordCategory } from './enums';

// ─── Nested DTOs ──────────────────────────────────────────────

export class TranslationEntryDto {
    @ApiProperty({
        description: "So'zning tarjimasi yoki inglizcha ekvivalenti",
        example: 'abandon',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    translation: string;

    @ApiProperty({
        description: "So'zning to'liq ta'rifi",
        example: 'to leave a place, person, or thing permanently',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    definition: string;

    @ApiProperty({
        description: '4–5 ta misol gap',
        example: ['He abandoned the sinking ship.', 'She abandoned her studies after the accident.', 'They were forced to abandon their home.', 'The project was abandoned due to lack of funds.', 'He felt a sense of abandon when dancing.'],
        type: [String],
        minItems: 3,
        maxItems: 8,
    })
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(3, { message: "Kamida 3 ta misol gap bo'lishi kerak" })
    exampleSentences: string[];
}

export class GameSentenceDto {
    @ApiProperty({
        description: "Bo'sh joyli misol gap — ___ o'rniga so'z qo'yiladi",
        example: 'She decided to ___ the project halfway through.',
    })
    @IsString()
    @IsNotEmpty()
    sentence: string;

    @ApiProperty({
        description: "To'g'ri javob",
        example: 'abandon',
    })
    @IsString()
    @IsNotEmpty()
    answer: string;

    @ApiPropertyOptional({
        description: "Noto'g'ri variantlar (multiple choice uchun, 3 ta bo'lishi tavsiya etiladi)",
        example: ['achieve', 'accept', 'arrange'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    distractors?: string[];
}

// ─── Main DTO ─────────────────────────────────────────────────

export class CreateVocabularyDto {
    @ApiProperty({
        description: "So'z (ingliz tilida, kichik harf)",
        example: 'abandon',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(100)
    word: string;

    @ApiProperty({
        description: "So'z turkumlari",
        enum: PartOfSpeech,
        isArray: true,
        example: ['v.'],
    })
    @IsArray()
    @IsEnum(PartOfSpeech, { each: true })
    @ArrayMinSize(1)
    partsOfSpeech: PartOfSpeech[];

    @ApiProperty({
        description: 'CEFR darajasi',
        enum: CefrLevel,
        example: CefrLevel.B2,
    })
    @IsEnum(CefrLevel)
    cefrLevel: CefrLevel;

    @ApiPropertyOptional({
        description: 'Fonetik transkripsiya',
        example: '/əˈbændən/',
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    phonetic?: string;

    @ApiPropertyOptional({
        description: 'Talaffuz audio URL',
        example: 'https://cdn.example.com/audio/abandon.mp3',
    })
    @IsOptional()
    @IsUrl()
    audioUrl?: string;

    @ApiPropertyOptional({
        description: 'Vizual rasim URL',
        example: 'https://cdn.example.com/images/abandon.jpg',
    })
    @IsOptional()
    @IsUrl()
    imageUrl?: string;

    @ApiProperty({
        description: "Ko'p tilli tarjimalar. Kamida 'en' majburiy. 'uz' va 'ru' ham tavsiya etiladi.",
        example: {
            en: {
                translation: 'abandon',
                definition: 'to leave a place, person, or thing permanently',
                exampleSentences: ['He abandoned the sinking ship.', 'She abandoned her studies.', 'The project was abandoned.', 'They had to abandon their home.', 'He danced with complete abandon.'],
            },
            uz: {
                translation: 'tark etmoq',
                definition: 'biror joy, shaxs yoki narsani butunlay tark etish',
                exampleSentences: ["U cho'kayotgan kemani tark etdi.", "U o'qishni tark etdi.", 'Loyiha tark etildi.', "Ular uylarini tark etishga majbur bo'ldi.", "U o'zini erkin his qildi."],
            },
            ru: {
                translation: 'бросить, покинуть',
                definition: 'навсегда оставить место, человека или вещь',
                exampleSentences: ['Он бросил тонущий корабль.', 'Она бросила учёбу.', 'Проект был заброшен.', 'Им пришлось покинуть дом.', 'Он танцевал с полной самоотдачей.'],
            },
        },
    })
    @IsObject()
    translations: Record<string, { translation: string; definition: string; exampleSentences: string[] }>;

    @ApiPropertyOptional({
        description: 'Sinonimlar',
        example: ['desert', 'forsake', 'leave'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    synonyms?: string[];

    @ApiPropertyOptional({
        description: 'Antonimlar',
        example: ['keep', 'maintain', 'stay'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    antonyms?: string[];

    @ApiPropertyOptional({
        description: "Bog'liq so'zlar",
        example: ['abandonment', 'abandoned'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    relatedWords?: string[];

    @ApiPropertyOptional({
        description: "So'z kategoriyalari",
        enum: WordCategory,
        isArray: true,
        example: [WordCategory.ACADEMIC],
    })
    @IsOptional()
    @IsArray()
    @IsEnum(WordCategory, { each: true })
    categories?: WordCategory[];

    @ApiPropertyOptional({
        description: 'Teglar',
        example: ['oxford3000', 'common-mistake'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional({
        description: "O'yin uchun bo'sh joyli gaplar",
        type: [GameSentenceDto],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GameSentenceDto)
    gameSentences?: GameSentenceDto[];

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    isPremium?: boolean;
}

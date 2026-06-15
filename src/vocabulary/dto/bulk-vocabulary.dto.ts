// vocabulary/dto/bulk-vocabulary.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateVocabularyDto } from './create-vocabulary.dto';
import { UpdateVocabularyDto } from './update-vocabulary.dto';

// ─── Bulk Create ──────────────────────────────────────────────

export class BulkCreateVocabularyDto {
    @ApiProperty({
        description: "Bir vaqtda ko'p so'z yaratish (max 200)",
        type: [CreateVocabularyDto],
        minItems: 1,
        maxItems: 200,
    })
    @IsArray()
    @ArrayMinSize(1, { message: "Kamida 1 ta so'z bo'lishi kerak" })
    @ArrayMaxSize(200, { message: "Bir vaqtda 200 tadan ko'p so'z qo'shib bo'lmaydi" })
    @ValidateNested({ each: true })
    @Type(() => CreateVocabularyDto)
    words: CreateVocabularyDto[];
}

// ─── Bulk Update ──────────────────────────────────────────────

export class BulkUpdateItemDto {
    @ApiProperty({ description: "So'z ID si", example: '6507f1f77bcf86cd799439011' })
    @IsMongoId()
    id: string;

    @ApiProperty({ type: UpdateVocabularyDto })
    @IsObject()
    @ValidateNested()
    @Type(() => UpdateVocabularyDto)
    data: UpdateVocabularyDto;
}

export class BulkUpdateVocabularyDto {
    @ApiProperty({
        description: "Ko'p so'zni bir vaqtda yangilash (max 100)",
        type: [BulkUpdateItemDto],
        minItems: 1,
        maxItems: 100,
    })
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(100)
    @ValidateNested({ each: true })
    @Type(() => BulkUpdateItemDto)
    items: BulkUpdateItemDto[];
}

// ─── Bulk Delete / Restore ────────────────────────────────────

export class BulkIdsDto {
    @ApiProperty({
        description: "So'z ID lari ro'yxati (max 200)",
        type: [String],
        example: ['6507f1f77bcf86cd799439011', '6507f1f77bcf86cd799439012'],
        minItems: 1,
        maxItems: 200,
    })
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(200)
    @IsMongoId({ each: true })
    ids: string[];

    @ApiPropertyOptional({ description: "O'chirish sababi", example: "Duplicate so'z" })
    @IsOptional()
    @IsString()
    reason?: string;
}

// ─── Add language translation ─────────────────────────────────

export class AddLanguageDto {
    @ApiProperty({
        description: "Til kodi (ISO 639-1). Masalan: 'de', 'fr', 'ko'",
        example: 'de',
    })
    @IsString()
    @IsNotEmpty()
    lang: string;

    @ApiProperty({
        description: "Tarjima ma'lumoti",
        example: {
            translation: 'aufgeben',
            definition: 'einen Ort, eine Person oder Sache dauerhaft verlassen',
            exampleSentences: ['Er hat das Schiff verlassen.'],
        },
    })
    @IsObject()
    translation: {
        translation: string;
        definition: string;
        exampleSentences: string[];
    };
}

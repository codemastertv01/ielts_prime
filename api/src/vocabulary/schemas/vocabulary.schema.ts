// vocabulary/schemas/vocabulary.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseEntity } from '../../schemas/base.schema';
import { CefrLevel, PartOfSpeech, WordCategory } from '../dto/enums';

export type VocabularyDocument = Vocabulary & Document;

// ─── Sub-schemas ──────────────────────────────────────────────

/**
 * Bitta tildagi tarjima va misollar
 */
export class TranslationEntry {
    /** So'zning tarjimasi (uz/ru uchun) yoki inglizcha ta'rif (en uchun) */
    translation: string;

    /** To'liq ta'rif */
    definition: string;

    /** 4–5 ta misol gap */
    exampleSentences: string[];
}

/**
 * Ko'p tilli tarjimalar map
 * key: 'en' | 'uz' | 'ru' | 'de' | ...
 */
export class Translations {
    en: TranslationEntry;
    uz: TranslationEntry;
    ru: TranslationEntry;
    [lang: string]: TranslationEntry;
}

/**
 * O'yin uchun misol gap — blanki belgilangan
 * "She decided to ___ the project." → blank = 'abandon'
 */
export class GameSentence {
    /** Bo'sh joyli gap: "She decided to ___ the project." */
    sentence: string;

    /** To'g'ri javob */
    answer: string;

    /** Qo'shimcha noto'g'ri variantlar (multiple choice uchun) */
    distractors: string[];
}

// ─── Main schema ──────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'vocabulary' })
export class Vocabulary extends BaseEntity {
    // ── Core word ─────────────────────────────────────────
    @Prop({
        required: true,
        trim: true,
        lowercase: true,
        index: true,
        maxlength: [100, 'Word 100 belgidan oshmasligi kerak'],
    })
    word: string;

    @Prop({
        type: [String],
        enum: Object.values(PartOfSpeech),
        required: true,
        validate: {
            validator: (v: string[]) => v.length > 0,
            message: "Kamida bitta so'z turi bo'lishi kerak",
        },
    })
    partsOfSpeech: PartOfSpeech[];

    @Prop({
        type: String,
        enum: Object.values(CefrLevel),
        required: true,
        index: true,
    })
    cefrLevel: CefrLevel;

    // ── Pronunciation ─────────────────────────────────────
    @Prop({ type: String, trim: true, default: null })
    phonetic?: string; // /əˈbændən/

    @Prop({ type: String, default: null })
    audioUrl?: string; // pronunciaton audio

    @Prop({ type: String, default: null })
    imageUrl?: string; // visual aid

    // ── Translations (multi-language, extensible) ─────────
    /**
     * {
     *   en: { translation: 'abandon', definition: 'to leave...', exampleSentences: [...] },
     *   uz: { translation: 'tark etmoq', definition: '...', exampleSentences: [...] },
     *   ru: { translation: 'бросить', definition: '...', exampleSentences: [...] },
     * }
     */
    @Prop({
        type: Object,
        required: true,
        validate: {
            validator: (v: any) => v && typeof v === 'object' && v.en,
            message: "Kamida ingliz tili tarjimasi (en) bo'lishi kerak",
        },
    })
    translations: Record<string, TranslationEntry>;

    // ── Lexical relations ─────────────────────────────────
    @Prop({ type: [String], default: [] })
    synonyms: string[];

    @Prop({ type: [String], default: [] })
    antonyms: string[];

    @Prop({ type: [String], default: [] })
    relatedWords: string[];

    // ── Classification ────────────────────────────────────
    @Prop({
        type: [String],
        enum: Object.values(WordCategory),
        default: [WordCategory.GENERAL],
        index: true,
    })
    categories: WordCategory[];

    @Prop({ type: [String], default: [], index: true })
    tags: string[];

    // ── Game data ─────────────────────────────────────────
    /**
     * O'yin uchun bo'sh joyli gaplar
     * Har bir game type uchun ishlatiladi:
     *  - fill_blank  → sentence + answer
     *  - drag_drop   → sentence + answer
     *  - multiple_choice → sentence + answer + distractors
     */
    @Prop({
        type: [
            {
                sentence: { type: String, required: true },
                answer: { type: String, required: true },
                distractors: { type: [String], default: [] },
            },
        ],
        default: [],
    })
    gameSentences: GameSentence[];

    // ── Visibility & access ───────────────────────────────
    @Prop({ type: Boolean, default: false, index: true })
    isPublished: boolean;

    @Prop({ type: Boolean, default: false, index: true })
    isPremium: boolean;

    // ── Statistics (o'quv ko'rsatkichlari) ────────────────
    @Prop({ type: Number, default: 0, min: 0 })
    timesViewed: number;

    @Prop({ type: Number, default: 0, min: 0 })
    timesStudied: number;

    @Prop({ type: Number, default: 0, min: 0 })
    timesCorrect: number;

    @Prop({ type: Number, default: 0, min: 0 })
    timesWrong: number;
}

export const VocabularySchema = SchemaFactory.createForClass(Vocabulary);

// ── Text search index ─────────────────────────────────────────
VocabularySchema.index({ word: 'text', tags: 'text' });

// ── Compound indexes ──────────────────────────────────────────
VocabularySchema.index({ word: 1, isDeleted: 1 }, { unique: true, sparse: false });
VocabularySchema.index({ cefrLevel: 1, isDeleted: 1, status: 1 });
VocabularySchema.index({ cefrLevel: 1, categories: 1, isPublished: 1 });
VocabularySchema.index({ isPublished: 1, isDeleted: 1, status: 1 });
VocabularySchema.index({ isPremium: 1, isPublished: 1 });
VocabularySchema.index({ partsOfSpeech: 1 });
VocabularySchema.index({ tags: 1 });
VocabularySchema.index({ timesStudied: -1 });
VocabularySchema.index({ createdAt: -1 });
VocabularySchema.index({ scheduledDeletionAt: 1 }, { sparse: true });

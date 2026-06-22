// vocabulary/vocabulary.service.ts
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { Vocabulary, VocabularyDocument } from './schemas/vocabulary.schema';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { BulkCreateVocabularyDto, BulkUpdateVocabularyDto, BulkIdsDto, AddLanguageDto } from './dto/bulk-vocabulary.dto';
import { AdminFindVocabularyDto, UserFindVocabularyDto, GameQueryDto, CheckAnswerDto, WordChainValidateDto } from './dto/find-vocabulary.dto';
import { EntityStatus } from '../dto/entity-status.dto';
import type { MetadataInfo } from '../dto/metadata-info.dto';
import { GameType } from './dto/enums';

// ─── Response types ────────────────────────────────────────────

export interface PaginatedVocabulary {
    words: VocabularyDocument[];
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface BulkResult {
    succeeded: number;
    failed: Array<{ word: string; id?: string; reason: string }>;
}

// ─── Game response types ───────────────────────────────────────

/** 1. Fill In The Blank — "She decided to ___ the project." */
export interface FillBlankGame {
    wordId: string;
    sentence: string;
    hint: string;       // birinchi harf: "a..."
    cefrLevel: string;
}

/** 2. Translation Input — tarjimani ko'rib inglizcha so'z yoz */
export interface TranslationInputGame {
    wordId: string;
    translation: string;   // "Tark etmoq" (uz/ru/en)
    definition: string;    // qo'shimcha hint
    cefrLevel: string;
    lang: string;
}

/** 3. Multiple Choice — 4 variantdan to'g'risini tanlash */
export interface MultipleChoiceGame {
    wordId: string;
    sentence: string;
    options: string[];     // ['abandon', 'achieve', 'accept', 'arrange'] — shuffled
    cefrLevel: string;
}

/** 4. Word Chain — oxirgi harfdan boshlanuvchi so'z zanjirlash */
export interface WordChainStart {
    word: string;
    wordId: string;
    lastLetter: string;
    cefrLevel: string;
}

export interface WordChainValidateResult {
    valid: boolean;
    reason?: string;        // nima uchun noto'g'ri
    wordExists: boolean;    // bazada bormi
    nextWord?: string;      // kompyuterning keyingi so'zi
    nextWordId?: string;
    score: number;          // ushbu yutuq uchun ball
}

/** 5. Drag And Drop Sentence — so'zni gapga tortib qo'y */
export interface DragDropGame {
    wordId: string;
    sentence: string;      // "She decided to ___ the project."
    wordBank: string[];    // ['abandon', 'achieve', 'accept'] — shuffled + to'g'ri
    cefrLevel: string;
}

/** 6. Missing Word Input — gap ichidagi so'zni yoz */
export interface MissingWordGame {
    wordId: string;
    sentence: string;      // "She ___ to school every day."
    hint: string;
    cefrLevel: string;
    partOfSpeech: string[];
}

/** 7. Listening Fill In The Blank — audio eshitib bo'sh joy to'ldirish */
export interface ListeningFillGame {
    wordId: string;
    audioUrl: string;
    sentence: string;      // gapning matni, bitta so'z ___
    hint: string;
    cefrLevel: string;
}

/** 8. Listening Dictation — faqat so'zni eshitib yozish */
export interface ListeningDictationGame {
    wordId: string;
    audioUrl: string;
    cefrLevel: string;
    partOfSpeech: string[];
    hint: string;          // harflar soni: "_ _ _ _ _ _ _"
}

/** 9 & 10. Sentence Builder / Drag Sentence — so'zlarni tartibla */
export interface SentenceBuilderGame {
    wordId: string;
    shuffledWords: string[];   // ['decided', 'She', 'project', 'abandon', 'to', 'the']
    correctSentence: string;   // "She decided to abandon the project."
    word: string;              // asosiy so'z
    cefrLevel: string;
}

/** 11. Matching — so'z ↔ tarjima juftlari */
export interface MatchingGame {
    pairs: Array<{
        wordId: string;
        word: string;
        definition: string;
        partsOfSpeech: string[];
    }>;
}

/** 12. Image To Word — rasmdan so'z top */
export interface ImageToWordGame {
    wordId: string;
    imageUrl: string;
    hint: string;           // "_ _ _ _ _ _ _"
    cefrLevel: string;
    partOfSpeech: string[];
}

/** 13. Synonym Challenge — ma'nodoshini top */
export interface SynonymGame {
    wordId: string;
    word: string;
    options: string[];      // [to'g'ri sinonim + 3 ta noto'g'ri]
    correctAnswer: string;
    cefrLevel: string;
}

/** 14. Antonym Challenge — qarama-qarshisini top */
export interface AntonymGame {
    wordId: string;
    word: string;
    options: string[];
    correctAnswer: string;
    cefrLevel: string;
}

/** 15. Memory Cards — juftlashtirish xotira o'yini */
export interface MemoryCardsGame {
    cards: Array<{
        id: string;         // wordId (juft uchun bir xil)
        type: 'word' | 'translation';
        content: string;
    }>;
    lang: string;
}

export interface CheckAnswerResult {
    correct: boolean;
    correctAnswer: string;
    userAnswer: string;
    explanation?: string;
    xp: number;            // topilgan XP
}

// ─── Service ───────────────────────────────────────────────────

@Injectable()
export class VocabularyService {
    private readonly logger = new Logger(VocabularyService.name);

    constructor(
        @InjectModel(Vocabulary.name)
        private readonly vocabularyModel: Model<VocabularyDocument>
    ) {}

    // ═══════════════════════════════════════════════════════════
    // CREATE
    // ═══════════════════════════════════════════════════════════

    async create(dto: CreateVocabularyDto, meta: MetadataInfo): Promise<VocabularyDocument> {
        const word = dto.word.trim().toLowerCase();

        const exists = await this.vocabularyModel.findOne({ word, isDeleted: false });
        if (exists) throw new ConflictException(`"${word}" so'zi allaqachon mavjud`);

        if (!dto.translations?.en) {
            throw new BadRequestException("Kamida ingliz tili tarjimasi (translations.en) bo'lishi kerak");
        }

        const created = await this.vocabularyModel.create({
            ...dto,
            word,
            status: EntityStatus.ACTIVE,
            createdBy: meta,
        });

        this.logger.log(`Created vocabulary: "${word}" by ${meta.username}`);
        return created;
    }

    async bulkCreate(dto: BulkCreateVocabularyDto, meta: MetadataInfo): Promise<BulkResult> {
        const result: BulkResult = { succeeded: 0, failed: [] };

        const words = dto.words.map((w) => w.word.trim().toLowerCase());
        const existing = await this.vocabularyModel
            .find({ word: { $in: words }, isDeleted: false })
            .select('word')
            .lean();
        const existingSet = new Set(existing.map((e) => e.word));

        const toInsert: any[] = [];

        for (const item of dto.words) {
            const word = item.word.trim().toLowerCase();
            if (existingSet.has(word)) {
                result.failed.push({ word, reason: 'Allaqachon mavjud' });
                continue;
            }
            if (!item.translations?.en) {
                result.failed.push({ word, reason: 'translations.en majburiy' });
                continue;
            }
            toInsert.push({ ...item, word, status: EntityStatus.ACTIVE, createdBy: meta });
        }

        if (toInsert.length) {
            try {
                await this.vocabularyModel.insertMany(toInsert, { ordered: false });
                result.succeeded = toInsert.length;
            } catch (err: any) {
                const inserted = toInsert.length - (err.writeErrors?.length ?? 0);
                result.succeeded = inserted;
                for (const we of err.writeErrors ?? []) {
                    result.failed.push({
                        word: toInsert[we.index]?.word ?? '?',
                        reason: we.errmsg ?? 'Insert xatosi',
                    });
                }
            }
        }

        this.logger.log(`Bulk create: ${result.succeeded} succeeded, ${result.failed.length} failed`);
        return result;
    }

    // ═══════════════════════════════════════════════════════════
    // READ — Admin
    // ═══════════════════════════════════════════════════════════

    async adminFindAll(query: AdminFindVocabularyDto): Promise<PaginatedVocabulary> {
        const { page = 1, limit = 20, search, cefrLevel, partOfSpeech, category, isPublished, isPremium, tag, sortBy = 'createdAt', sortOrder = 'desc' } = query;

        const filter: FilterQuery<VocabularyDocument> = {};
        if (query.isDeleted) filter.isDeleted = query.isDeleted;

        if (search) {
            filter.$or = [
                { word: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
                { $text: { $search: search } },
            ];
        }
        if (cefrLevel) filter.cefrLevel = cefrLevel;
        if (partOfSpeech) filter.partsOfSpeech = partOfSpeech;
        if (category) filter.categories = category;
        if (isPublished) filter.isPublished = isPublished;
        if (isPremium) filter.isPremium = isPremium;
        if (tag) filter.tags = tag;

        const skip = (page - 1) * limit;
        const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [words, total] = await Promise.all([
            this.vocabularyModel.find(filter).sort(sort).skip(skip).limit(limit).lean().exec(),
            this.vocabularyModel.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / limit);
        return { words: words as any, total, page, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
    }

    async adminFindById(id: string): Promise<VocabularyDocument> {
        this.validateId(id);
        const word = await this.vocabularyModel.findById(id).lean().exec();
        if (!word || word.isDeleted) throw new NotFoundException(`So'z topilmadi: ${id}`);
        return word as any;
    }

    // ═══════════════════════════════════════════════════════════
    // READ — User (faqat published + active)
    // ═══════════════════════════════════════════════════════════

    async userFindAll(query: UserFindVocabularyDto): Promise<PaginatedVocabulary> {
        const { page = 1, limit = 20, search, cefrLevel, partOfSpeech, category, tag, sortBy = 'word', sortOrder = 'asc', lang = 'en' } = query;

        const filter: FilterQuery<VocabularyDocument> = {
            isDeleted: false,
            isPublished: true,
            status: EntityStatus.ACTIVE,
        };

        if (search) filter.$or = [{ word: { $regex: search, $options: 'i' } }, { tags: { $regex: search, $options: 'i' } }];
        if (cefrLevel) filter.cefrLevel = cefrLevel;
        if (partOfSpeech) filter.partsOfSpeech = partOfSpeech;
        if (category) filter.categories = category;
        if (tag) filter.tags = tag;

        const skip = (page - 1) * limit;
        const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const projection = {
            word: 1, partsOfSpeech: 1, cefrLevel: 1, phonetic: 1,
            audioUrl: 1, imageUrl: 1, categories: 1, tags: 1,
            synonyms: 1, antonyms: 1, relatedWords: 1,
            isPublished: 1, isPremium: 1,
            [`translations.en`]: 1,
            [`translations.${lang}`]: 1,
        };

        const [words, total] = await Promise.all([
            this.vocabularyModel.find(filter, projection).sort(sort).skip(skip).limit(limit).lean().exec(),
            this.vocabularyModel.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / limit);

        if (words.length) {
            const ids = words.map((w: any) => w._id);
            this.vocabularyModel.updateMany({ _id: { $in: ids } }, { $inc: { timesViewed: 1 } }).exec().catch(() => {});
        }

        return { words: words as any, total, page, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
    }

    async userFindById(id: string, lang = 'en'): Promise<VocabularyDocument> {
        this.validateId(id);
        const projection = {
            word: 1, partsOfSpeech: 1, cefrLevel: 1, phonetic: 1,
            audioUrl: 1, imageUrl: 1, categories: 1, tags: 1,
            synonyms: 1, antonyms: 1, relatedWords: 1,
            isPublished: 1, isPremium: 1,
            [`translations.en`]: 1,
            [`translations.${lang}`]: 1,
        };
        const word = await this.vocabularyModel
            .findOne({ _id: new Types.ObjectId(id), isDeleted: false, isPublished: true, status: EntityStatus.ACTIVE }, projection)
            .lean().exec();
        if (!word) throw new NotFoundException(`So'z topilmadi: ${id}`);
        this.vocabularyModel.findByIdAndUpdate(id, { $inc: { timesViewed: 1 } }).exec().catch(() => {});
        return word as any;
    }

    // ═══════════════════════════════════════════════════════════
    // UPDATE
    // ═══════════════════════════════════════════════════════════

    async update(id: string, dto: UpdateVocabularyDto, meta: MetadataInfo): Promise<VocabularyDocument> {
        this.validateId(id);
        const existing = await this.findExistingOrThrow(id);

        if (dto.word && dto.word.toLowerCase() !== existing.word) {
            const dup = await this.vocabularyModel.findOne({
                word: dto.word.toLowerCase(),
                isDeleted: false,
                _id: { $ne: new Types.ObjectId(id) },
            });
            if (dup) throw new ConflictException(`"${dto.word}" so'zi allaqachon mavjud`);
        }

        const translationsUpdate: Record<string, any> = {};
        if (dto.translations) {
            for (const [lang, val] of Object.entries(dto.translations)) {
                translationsUpdate[`translations.${lang}`] = val;
            }
        }

        const updatePayload: Record<string, any> = { ...dto, updatedBy: meta };
        if (dto.word) updatePayload.word = dto.word.toLowerCase();
        delete updatePayload.translations;

        const finalUpdate: any = { $set: { ...updatePayload, ...translationsUpdate } };
        const updated = await this.vocabularyModel.findByIdAndUpdate(id, finalUpdate, { new: true }).lean().exec();

        this.logger.log(`Updated vocabulary: "${existing.word}" by ${meta.username}`);
        return updated as any;
    }

    async bulkUpdate(dto: BulkUpdateVocabularyDto, meta: MetadataInfo): Promise<BulkResult> {
        const result: BulkResult = { succeeded: 0, failed: [] };
        await Promise.all(
            dto.items.map(async (item) => {
                try {
                    await this.update(item.id, item.data, meta);
                    result.succeeded++;
                } catch (err: any) {
                    result.failed.push({ word: item.id, id: item.id, reason: err.message });
                }
            })
        );
        return result;
    }

    async addLanguage(id: string, dto: AddLanguageDto, meta: MetadataInfo): Promise<VocabularyDocument> {
        this.validateId(id);
        await this.findExistingOrThrow(id);
        const updated = await this.vocabularyModel
            .findByIdAndUpdate(id, { $set: { [`translations.${dto.lang}`]: dto.translation, updatedBy: meta } }, { new: true })
            .lean().exec();
        this.logger.log(`Added language "${dto.lang}" to vocabulary ${id} by ${meta.username}`);
        return updated as any;
    }

    // ═══════════════════════════════════════════════════════════
    // DELETE
    // ═══════════════════════════════════════════════════════════

    async softDelete(id: string, meta: MetadataInfo): Promise<{ message: string }> {
        this.validateId(id);
        const word = await this.findExistingOrThrow(id);
        await this.vocabularyModel.findByIdAndUpdate(id, {
            $set: { isDeleted: true, status: EntityStatus.INACTIVE, deletedBy: meta },
        });
        this.logger.log(`Soft deleted: "${word.word}" by ${meta.username}`);
        return { message: `"${word.word}" so'zi o'chirildi` };
    }

    async bulkDelete(dto: BulkIdsDto, meta: MetadataInfo): Promise<BulkResult> {
        const result: BulkResult = { succeeded: 0, failed: [] };
        await Promise.all(
            dto.ids.map(async (id) => {
                try {
                    const w = await this.vocabularyModel.findOne({ _id: new Types.ObjectId(id), isDeleted: false });
                    if (!w) { result.failed.push({ word: id, id, reason: 'Topilmadi' }); return; }
                    await this.vocabularyModel.findByIdAndUpdate(id, {
                        $set: { isDeleted: true, status: EntityStatus.INACTIVE, deletedBy: meta },
                    });
                    result.succeeded++;
                } catch (err: any) {
                    result.failed.push({ word: id, id, reason: err.message });
                }
            })
        );
        this.logger.log(`Bulk deleted ${result.succeeded} by ${meta.username}`);
        return result;
    }

    async hardDelete(id: string, meta: MetadataInfo): Promise<{ message: string }> {
        this.validateId(id);
        const word = await this.vocabularyModel.findById(id);
        if (!word) throw new NotFoundException(`So'z topilmadi: ${id}`);
        await this.vocabularyModel.findByIdAndDelete(id);
        this.logger.warn(`HARD deleted: "${word.word}" by ${meta.username}`);
        return { message: `"${word.word}" so'zi bazadan butunlay o'chirildi` };
    }

    // ═══════════════════════════════════════════════════════════
    // RESTORE
    // ═══════════════════════════════════════════════════════════

    async restore(id: string, meta: MetadataInfo): Promise<VocabularyDocument> {
        this.validateId(id);
        const word = await this.vocabularyModel.findOne({ _id: new Types.ObjectId(id), isDeleted: true });
        if (!word) throw new NotFoundException(`O'chirilgan so'z topilmadi: ${id}`);
        const restored = await this.vocabularyModel
            .findByIdAndUpdate(id, { $set: { isDeleted: false, status: EntityStatus.ACTIVE, restoredBy: meta, restoredAt: new Date() } }, { new: true })
            .lean().exec();
        this.logger.log(`Restored: "${word.word}" by ${meta.username}`);
        return restored as any;
    }

    async bulkRestore(dto: BulkIdsDto, meta: MetadataInfo): Promise<BulkResult> {
        const result: BulkResult = { succeeded: 0, failed: [] };
        await Promise.all(
            dto.ids.map(async (id) => {
                try {
                    await this.restore(id, meta);
                    result.succeeded++;
                } catch (err: any) {
                    result.failed.push({ word: id, id, reason: err.message });
                }
            })
        );
        return result;
    }

    // ═══════════════════════════════════════════════════════════
    // GAMES — 15 ta o'yin
    // ═══════════════════════════════════════════════════════════

    // ──────────────────────────────────────────────────────────
    // 1. Fill In The Blank
    // "She decided to ___ the project."
    // ──────────────────────────────────────────────────────────
    async getFillBlankGame(query: GameQueryDto): Promise<FillBlankGame[]> {
        const words = await this.getRandomWordsWithSentences(query);
        return words.map((w) => {
            const s = this.pickGameSentence(w);
            return {
                wordId: w._id.toString(),
                sentence: s.sentence,
                hint: this.buildHint(s.answer),
                cefrLevel: w.cefrLevel,
            };
        });
    }

    // ──────────────────────────────────────────────────────────
    // 2. Translation Input
    // "Tark etmoq" → foydalanuvchi yozadi: "abandon"
    // ──────────────────────────────────────────────────────────
    async getTranslationInputGame(query: GameQueryDto): Promise<TranslationInputGame[]> {
        const lang = query.lang ?? 'uz';
        const words = await this.getRandomWords(query);

        return words
            .filter((w) => {
                const t = (w.translations as any)?.[lang];
                return t?.translation;
            })
            .map((w) => {
                const translation = (w.translations as any)?.[lang] ?? (w.translations as any)?.en;
                return {
                    wordId: w._id.toString(),
                    translation: translation.translation,
                    definition: translation.definition ?? '',
                    cefrLevel: w.cefrLevel,
                    lang,
                };
            });
    }

    // ──────────────────────────────────────────────────────────
    // 3. Multiple Choice
    // "She decided to ___ the project." → A) begin B) leave C) build D) collect
    // ──────────────────────────────────────────────────────────
    async getMultipleChoiceGame(query: GameQueryDto): Promise<MultipleChoiceGame[]> {
        const words = await this.getRandomWordsWithSentences(query);
        const allWords = words.map((w) => w.word);

        return words.map((w) => {
            const s = this.pickGameSentence(w);
            const distractors =
                s.distractors?.length >= 3
                    ? s.distractors.slice(0, 3)
                    : allWords.filter((wd) => wd !== w.word).slice(0, 3);
            const options = this.shuffle([s.answer, ...distractors.slice(0, 3)]);
            return {
                wordId: w._id.toString(),
                sentence: s.sentence,
                options,
                cefrLevel: w.cefrLevel,
            };
        });
    }

    // ──────────────────────────────────────────────────────────
    // 4. Word Chain — Boshlash
    // Server bitta so'z beradi; foydalanuvchi oxirgi harfdan boshlaydi
    // ──────────────────────────────────────────────────────────
    async getWordChainStart(query: GameQueryDto): Promise<WordChainStart> {
        const filter: FilterQuery<VocabularyDocument> = {
            isDeleted: false,
            isPublished: true,
            status: EntityStatus.ACTIVE,
        };
        if (query.cefrLevel) filter.cefrLevel = query.cefrLevel;
        if (query.category) filter.categories = query.category;

        const [word] = await this.vocabularyModel
            .aggregate([{ $match: filter }, { $sample: { size: 1 } }, { $project: { word: 1, cefrLevel: 1 } }])
            .exec();

        if (!word) throw new NotFoundException("O'yin uchun so'z topilmadi");

        return {
            word: word.word,
            wordId: word._id.toString(),
            lastLetter: word.word[word.word.length - 1],
            cefrLevel: word.cefrLevel,
        };
    }

    // ──────────────────────────────────────────────────────────
    // 4. Word Chain — Validatsiya
    // ──────────────────────────────────────────────────────────
    async validateWordChain(dto: WordChainValidateDto): Promise<WordChainValidateResult> {
        const userWord = dto.userWord.trim().toLowerCase();
        const prevWord = dto.previousWord.trim().toLowerCase();
        const usedWords = (dto.usedWords ?? []).map((w) => w.toLowerCase());

        // 1. Oxirgi harfdan boshlanishini tekshiramiz
        const requiredFirstLetter = prevWord[prevWord.length - 1];
        if (!userWord.startsWith(requiredFirstLetter)) {
            return {
                valid: false,
                reason: `So'z "${requiredFirstLetter}" harfidan boshlanishi kerak`,
                wordExists: false,
                score: 0,
            };
        }

        // 2. Takrorlanmaganini tekshiramiz
        if (usedWords.includes(userWord)) {
            return {
                valid: false,
                reason: `"${userWord}" so'zi allaqachon ishlatilgan`,
                wordExists: false,
                score: 0,
            };
        }

        // 3. Bazada borligini tekshiramiz
        const found = await this.vocabularyModel
            .findOne({ word: userWord, isDeleted: false, isPublished: true })
            .select('word cefrLevel')
            .lean();

        if (!found) {
            return {
                valid: false,
                reason: `"${userWord}" so'zi lug'atda topilmadi`,
                wordExists: false,
                score: 0,
            };
        }

        // 4. Kompyuterning keyingi so'zini qilamiz
        const lastLetterOfUser = userWord[userWord.length - 1];
        const allUsed = [...usedWords, userWord, prevWord];

        const [nextWord] = await this.vocabularyModel
            .aggregate([
                {
                    $match: {
                        isDeleted: false,
                        isPublished: true,
                        word: { $regex: `^${lastLetterOfUser}`, $nin: allUsed },
                        ...(dto.cefrLevel ? { cefrLevel: dto.cefrLevel } : {}),
                    },
                },
                { $sample: { size: 1 } },
                { $project: { word: 1, cefrLevel: 1 } },
            ])
            .exec();

        // XP: qisqa so'z kam, uzun so'z ko'p ball
        const score = Math.max(1, userWord.length - 2);

        return {
            valid: true,
            wordExists: true,
            nextWord: nextWord?.word,
            nextWordId: nextWord?._id?.toString(),
            score,
        };
    }

    // ──────────────────────────────────────────────────────────
    // 5. Drag And Drop Sentence
    // ──────────────────────────────────────────────────────────
    async getDragDropGame(query: GameQueryDto): Promise<DragDropGame[]> {
        const words = await this.getRandomWordsWithSentences(query);
        const allWords = words.map((w) => w.word);

        return words.map((w) => {
            const s = this.pickGameSentence(w);
            const distractors =
                s.distractors?.length >= 2
                    ? s.distractors.slice(0, 2)
                    : allWords.filter((wd) => wd !== w.word).slice(0, 2);
            const wordBank = this.shuffle([s.answer, ...distractors]);
            return {
                wordId: w._id.toString(),
                sentence: s.sentence,
                wordBank,
                cefrLevel: w.cefrLevel,
            };
        });
    }

    // ──────────────────────────────────────────────────────────
    // 6. Missing Word Input
    // Misol gapdan bitta so'z yashiriladi
    // ──────────────────────────────────────────────────────────
    async getMissingWordGame(query: GameQueryDto): Promise<MissingWordGame[]> {
        const lang = query.lang ?? 'en';
        const words = await this.vocabularyModel
            .aggregate([
                {
                    $match: {
                        isDeleted: false,
                        isPublished: true,
                        status: EntityStatus.ACTIVE,
                        ...(query.cefrLevel ? { cefrLevel: query.cefrLevel } : {}),
                        ...(query.category ? { categories: query.category } : {}),
                    },
                },
                { $sample: { size: query.count ?? 10 } },
                { $project: { word: 1, partsOfSpeech: 1, cefrLevel: 1, translations: 1 } },
            ])
            .exec();

        if (!words.length) throw new NotFoundException("So'z topilmadi");

        return words
            .map((w) => {
                const examples: string[] =
                    (w.translations as any)?.[lang]?.exampleSentences ??
                    (w.translations as any)?.en?.exampleSentences ?? [];

                // So'z ishtirok etgan gapni topamiz
                const matchingSentence = examples.find((s: string) =>
                    s.toLowerCase().includes(w.word.toLowerCase()),
                );
                if (!matchingSentence) return null;

                // So'zni ___ bilan almashtiramiz
                const sentence = matchingSentence.replace(
                    new RegExp(`\\b${w.word}\\b`, 'gi'),
                    '___',
                );

                return {
                    wordId: w._id.toString(),
                    sentence,
                    hint: this.buildHint(w.word),
                    cefrLevel: w.cefrLevel,
                    partOfSpeech: w.partsOfSpeech,
                };
            })
            .filter(Boolean) as MissingWordGame[];
    }

    // ──────────────────────────────────────────────────────────
    // 7. Listening Fill In The Blank
    // audioUrl bor so'zlar uchun
    // ──────────────────────────────────────────────────────────
    async getListeningFillGame(query: GameQueryDto): Promise<ListeningFillGame[]> {
        const words = await this.vocabularyModel
            .aggregate([
                {
                    $match: {
                        isDeleted: false,
                        isPublished: true,
                        status: EntityStatus.ACTIVE,
                        audioUrl: { $ne: null, $exists: true },
                        'gameSentences.0': { $exists: true },
                        ...(query.cefrLevel ? { cefrLevel: query.cefrLevel } : {}),
                        ...(query.category ? { categories: query.category } : {}),
                    },
                },
                { $sample: { size: query.count ?? 10 } },
                { $project: { word: 1, cefrLevel: 1, audioUrl: 1, gameSentences: 1 } },
            ])
            .exec();

        if (!words.length) {
            throw new NotFoundException("Audio mavjud so'zlar topilmadi. Avval audioUrl qo'shing.");
        }

        return words.map((w) => {
            const s = this.pickGameSentence(w as any);
            return {
                wordId: w._id.toString(),
                audioUrl: w.audioUrl,
                sentence: s.sentence,
                hint: this.buildHint(s.answer),
                cefrLevel: w.cefrLevel,
            };
        });
    }

    // ──────────────────────────────────────────────────────────
    // 8. Listening Dictation
    // Faqat so'z audio, foydalanuvchi yozadi
    // ──────────────────────────────────────────────────────────
    async getListeningDictationGame(query: GameQueryDto): Promise<ListeningDictationGame[]> {
        const words = await this.vocabularyModel
            .aggregate([
                {
                    $match: {
                        isDeleted: false,
                        isPublished: true,
                        status: EntityStatus.ACTIVE,
                        audioUrl: { $ne: null, $exists: true },
                        ...(query.cefrLevel ? { cefrLevel: query.cefrLevel } : {}),
                        ...(query.category ? { categories: query.category } : {}),
                    },
                },
                { $sample: { size: query.count ?? 10 } },
                { $project: { word: 1, partsOfSpeech: 1, cefrLevel: 1, audioUrl: 1 } },
            ])
            .exec();

        if (!words.length) {
            throw new NotFoundException("Audio mavjud so'zlar topilmadi. Avval audioUrl qo'shing.");
        }

        return words.map((w) => ({
            wordId: w._id.toString(),
            audioUrl: w.audioUrl,
            cefrLevel: w.cefrLevel,
            partOfSpeech: w.partsOfSpeech,
            hint: w.word.split('').map(() => '_').join(' '),
        }));
    }

    // ──────────────────────────────────────────────────────────
    // 9. Sentence Builder
    // "She decided to abandon the project." → so'zlar aralashtiriladi
    // ──────────────────────────────────────────────────────────
    async getSentenceBuilderGame(query: GameQueryDto): Promise<SentenceBuilderGame[]> {
        const lang = query.lang ?? 'en';
        const words = await this.getRandomWords(query);

        return words
            .map((w) => {
                const examples: string[] =
                    (w.translations as any)?.[lang]?.exampleSentences ??
                    (w.translations as any)?.en?.exampleSentences ?? [];
                if (!examples.length) return null;

                const sentence = examples[Math.floor(Math.random() * examples.length)];
                // Tinish belgilarsiz so'zlarga ajratamiz
                const wordList = sentence.replace(/[.,!?;:]/g, '').split(' ').filter(Boolean);
                if (wordList.length < 3) return null;

                return {
                    wordId: w._id.toString(),
                    word: w.word,
                    shuffledWords: this.shuffle([...wordList]),
                    correctSentence: sentence,
                    cefrLevel: w.cefrLevel,
                };
            })
            .filter(Boolean) as SentenceBuilderGame[];
    }

    // ──────────────────────────────────────────────────────────
    // 10. Drag Sentence (Drag To Build)
    // Sentence Builder bilan bir xil, lekin "drag" UI uchun
    // ──────────────────────────────────────────────────────────
    async getDragSentenceGame(query: GameQueryDto): Promise<SentenceBuilderGame[]> {
        return this.getSentenceBuilderGame(query);
    }

    // ──────────────────────────────────────────────────────────
    // 11. Matching
    // So'z ↔ ta'rif yoki so'z ↔ tarjima juftlarini moslash
    // ──────────────────────────────────────────────────────────
    async getMatchingGame(query: GameQueryDto, lang = 'en'): Promise<MatchingGame> {
        const words = await this.getRandomWords(query);
        const pairs = words.map((w) => ({
            wordId: w._id.toString(),
            word: w.word,
            definition:
                (w.translations as any)?.[lang]?.definition ??
                (w.translations as any)?.en?.definition ?? '',
            partsOfSpeech: w.partsOfSpeech as string[],
        }));
        return { pairs: this.shuffle(pairs) };
    }

    // ──────────────────────────────────────────────────────────
    // 12. Image To Word
    // Rasm ko'rib so'z yozish (imageUrl bo'lgan so'zlar uchun)
    // ──────────────────────────────────────────────────────────
    async getImageToWordGame(query: GameQueryDto): Promise<ImageToWordGame[]> {
        const words = await this.vocabularyModel
            .aggregate([
                {
                    $match: {
                        isDeleted: false,
                        isPublished: true,
                        status: EntityStatus.ACTIVE,
                        imageUrl: { $ne: null, $exists: true },
                        ...(query.cefrLevel ? { cefrLevel: query.cefrLevel } : {}),
                        ...(query.category ? { categories: query.category } : {}),
                    },
                },
                { $sample: { size: query.count ?? 10 } },
                { $project: { word: 1, partsOfSpeech: 1, cefrLevel: 1, imageUrl: 1 } },
            ])
            .exec();

        if (!words.length) {
            throw new NotFoundException("Rasm mavjud so'zlar topilmadi. Avval imageUrl qo'shing.");
        }

        return words.map((w) => ({
            wordId: w._id.toString(),
            imageUrl: w.imageUrl,
            hint: w.word.split('').map(() => '_').join(' '),
            cefrLevel: w.cefrLevel,
            partOfSpeech: w.partsOfSpeech,
        }));
    }

    // ──────────────────────────────────────────────────────────
    // 13. Synonym Challenge
    // "Big" → variantlar: Large / Tiny / Short / Weak
    // ──────────────────────────────────────────────────────────
    async getSynonymGame(query: GameQueryDto): Promise<SynonymGame[]> {
        const words = await this.vocabularyModel
            .aggregate([
                {
                    $match: {
                        isDeleted: false,
                        isPublished: true,
                        status: EntityStatus.ACTIVE,
                        'synonyms.0': { $exists: true },
                        ...(query.cefrLevel ? { cefrLevel: query.cefrLevel } : {}),
                        ...(query.category ? { categories: query.category } : {}),
                    },
                },
                { $sample: { size: query.count ?? 10 } },
                { $project: { word: 1, cefrLevel: 1, synonyms: 1 } },
            ])
            .exec();

        if (!words.length) {
            throw new NotFoundException("Sinonim mavjud so'zlar topilmadi. Avval synonyms qo'shing.");
        }

        // Barcha so'zlardan distraktor pool
        const wordPool = words.map((w) => w.word);

        return words.map((w) => {
            const correctAnswer = w.synonyms[Math.floor(Math.random() * w.synonyms.length)];
            const distractors = wordPool
                .filter((wd) => wd !== w.word && wd !== correctAnswer)
                .slice(0, 3);

            // 3 ta distraktor yetarli bo'lmasa, antonymlardan yoki boshqa so'zlardan olamiz
            while (distractors.length < 3) distractors.push(`option${distractors.length}`);

            const options = this.shuffle([correctAnswer, ...distractors.slice(0, 3)]);

            return {
                wordId: w._id.toString(),
                word: w.word,
                options,
                correctAnswer,
                cefrLevel: w.cefrLevel,
            };
        });
    }

    // ──────────────────────────────────────────────────────────
    // 14. Antonym Challenge
    // "Hot" → qarama-qarshisi: Cold / Warm / Cool / Mild
    // ──────────────────────────────────────────────────────────
    async getAntonymGame(query: GameQueryDto): Promise<AntonymGame[]> {
        const words = await this.vocabularyModel
            .aggregate([
                {
                    $match: {
                        isDeleted: false,
                        isPublished: true,
                        status: EntityStatus.ACTIVE,
                        'antonyms.0': { $exists: true },
                        ...(query.cefrLevel ? { cefrLevel: query.cefrLevel } : {}),
                        ...(query.category ? { categories: query.category } : {}),
                    },
                },
                { $sample: { size: query.count ?? 10 } },
                { $project: { word: 1, cefrLevel: 1, antonyms: 1 } },
            ])
            .exec();

        if (!words.length) {
            throw new NotFoundException("Antonim mavjud so'zlar topilmadi. Avval antonyms qo'shing.");
        }

        const wordPool = words.map((w) => w.word);

        return words.map((w) => {
            const correctAnswer = w.antonyms[Math.floor(Math.random() * w.antonyms.length)];
            const distractors = wordPool
                .filter((wd) => wd !== w.word && wd !== correctAnswer)
                .slice(0, 3);
            while (distractors.length < 3) distractors.push(`option${distractors.length}`);

            const options = this.shuffle([correctAnswer, ...distractors.slice(0, 3)]);

            return {
                wordId: w._id.toString(),
                word: w.word,
                options,
                correctAnswer,
                cefrLevel: w.cefrLevel,
            };
        });
    }

    // ──────────────────────────────────────────────────────────
    // 15. Memory Cards
    // Kartalar yopiq — inglizcha va tarjima juft qilinadi
    // ──────────────────────────────────────────────────────────
    async getMemoryCardsGame(query: GameQueryDto): Promise<MemoryCardsGame> {
        const lang = query.lang ?? 'uz';
        const count = Math.min(query.count ?? 8, 16); // maks 16 juft = 32 karta
        const words = await this.vocabularyModel
            .aggregate([
                {
                    $match: {
                        isDeleted: false,
                        isPublished: true,
                        status: EntityStatus.ACTIVE,
                        ...(query.cefrLevel ? { cefrLevel: query.cefrLevel } : {}),
                        ...(query.category ? { categories: query.category } : {}),
                    },
                },
                { $sample: { size: count } },
                { $project: { word: 1, translations: 1 } },
            ])
            .exec();

        if (!words.length) throw new NotFoundException("So'z topilmadi");

        const cards: MemoryCardsGame['cards'] = [];

        for (const w of words) {
            const translation =
                (w.translations as any)?.[lang]?.translation ??
                (w.translations as any)?.en?.translation ??
                w.word;

            const id = w._id.toString();
            cards.push({ id, type: 'word', content: w.word });
            cards.push({ id, type: 'translation', content: translation });
        }

        // Kartalarni aralashtirish
        return { cards: this.shuffle(cards), lang };
    }

    // ──────────────────────────────────────────────────────────
    // Javobni tekshirish — barcha o'yin turlari uchun
    // ──────────────────────────────────────────────────────────
    async checkAnswer(dto: CheckAnswerDto): Promise<CheckAnswerResult> {
        const userAnswer = (dto.userAnswer ?? '').trim().toLowerCase();

        if (!dto.wordId && !dto.word) {
            throw new BadRequestException('wordId yoki word kerak');
        }

        const filter: FilterQuery<VocabularyDocument> = dto.wordId
            ? { _id: new Types.ObjectId(dto.wordId), isDeleted: false }
            : { word: dto.word?.toLowerCase(), isDeleted: false };

        const word = await this.vocabularyModel
            .findOne(filter)
            .select('word synonyms antonyms translations')
            .lean()
            .exec();

        if (!word) throw new NotFoundException("So'z topilmadi");

        let correct = false;
        let correctAnswer = '';
        let explanation = '';

        switch (dto.gameType) {
            // So'zning o'zini yozish kerak (fill_blank, missing_word, spelling,
            // drag_drop, listening_fill, listening_dict, image_to_word, sentence_builder)
            case GameType.FILL_BLANK:
            case GameType.MISSING_WORD:
            case GameType.SPELLING:
            case GameType.DRAG_DROP:
            case GameType.DRAG_SENTENCE:
            case GameType.LISTENING_FILL:
            case GameType.LISTENING_DICT:
            case GameType.IMAGE_TO_WORD:
                correctAnswer = word.word;
                correct = correctAnswer === userAnswer;
                explanation = correct
                    ? `To'g'ri! "${word.word}"`
                    : `Noto'g'ri. To'g'ri javob: "${word.word}"`;
                break;

            // Inglizcha so'zni yozish (translation_input: tarjimadan → so'z)
            case GameType.TRANSLATION_INPUT:
                correctAnswer = word.word;
                correct = correctAnswer === userAnswer;
                explanation = correct
                    ? `To'g'ri! "${word.word}"`
                    : `Noto'g'ri. To'g'ri javob: "${word.word}"`;
                break;

            // Multiple choice — tanlangan variant to'g'rimi
            case GameType.MULTIPLE_CHOICE:
                correctAnswer = word.word;
                correct = userAnswer === correctAnswer;
                explanation = correct
                    ? `To'g'ri tanlov!`
                    : `Noto'g'ri. To'g'ri javob: "${word.word}"`;
                break;

            // Sinonim topish
            case GameType.SYNONYM_CHALLENGE:
                correctAnswer = (word.synonyms ?? [])[0] ?? '';
                correct = (word.synonyms ?? []).map((s) => s.toLowerCase()).includes(userAnswer);
                explanation = correct
                    ? `To'g'ri sinonim!`
                    : `Noto'g'ri. "${word.word}" ning ma'nodoshlari: ${(word.synonyms ?? []).join(', ')}`;
                break;

            // Antonim topish
            case GameType.ANTONYM_CHALLENGE:
                correctAnswer = (word.antonyms ?? [])[0] ?? '';
                correct = (word.antonyms ?? []).map((a) => a.toLowerCase()).includes(userAnswer);
                explanation = correct
                    ? `To'g'ri antonim!`
                    : `Noto'g'ri. "${word.word}" ning qarama-qarshilari: ${(word.antonyms ?? []).join(', ')}`;
                break;

            // Matching — bu serverda tekshirilmaydi (frontend pair bosadi), lekin support uchun
            case GameType.MATCHING:
            case GameType.MEMORY_CARDS:
                correctAnswer = word.word;
                correct = true; // client-side game
                explanation = `Juft topildi: "${word.word}"`;
                break;

            default:
                correctAnswer = word.word;
                correct = correctAnswer === userAnswer;
                explanation = correct ? `To'g'ri!` : `Noto'g'ri. To'g'ri javob: "${word.word}"`;
        }

        // XP: to'g'ri bo'lsa 10 XP, noto'g'ri bo'lsa 0
        const xp = correct ? 10 : 0;

        // Statistikani yangilaymiz
        const statUpdate = correct
            ? { $inc: { timesStudied: 1, timesCorrect: 1 } }
            : { $inc: { timesStudied: 1, timesWrong: 1 } };
        this.vocabularyModel.findByIdAndUpdate(word._id, statUpdate).exec().catch(() => {});

        return { correct, correctAnswer, userAnswer, explanation, xp };
    }

    // ═══════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════

    /** O'yin uchun tasodifiy so'zlar (gameSentences bo'lishi shart) */
    private async getRandomWordsWithSentences(query: GameQueryDto): Promise<VocabularyDocument[]> {
        const filter: FilterQuery<VocabularyDocument> = {
            isDeleted: false,
            isPublished: true,
            status: EntityStatus.ACTIVE,
            'gameSentences.0': { $exists: true },
        };
        if (query.cefrLevel) filter.cefrLevel = query.cefrLevel;
        if (query.category) filter.categories = query.category;

        const words = await this.vocabularyModel
            .aggregate([
                { $match: filter },
                { $sample: { size: query.count ?? 10 } },
                { $project: { word: 1, partsOfSpeech: 1, cefrLevel: 1, gameSentences: 1, translations: 1 } },
            ])
            .exec();

        if (!words.length) throw new NotFoundException("Ushbu parametrlar uchun yetarli so'z topilmadi. gameSentences qo'shing.");
        return words;
    }

    /** O'yin uchun tasodifiy so'zlar (gameSentences shart emas) */
    private async getRandomWords(query: GameQueryDto): Promise<VocabularyDocument[]> {
        const filter: FilterQuery<VocabularyDocument> = {
            isDeleted: false,
            isPublished: true,
            status: EntityStatus.ACTIVE,
        };
        if (query.cefrLevel) filter.cefrLevel = query.cefrLevel;
        if (query.category) filter.categories = query.category;

        const words = await this.vocabularyModel
            .aggregate([
                { $match: filter },
                { $sample: { size: query.count ?? 10 } },
                { $project: { word: 1, partsOfSpeech: 1, cefrLevel: 1, translations: 1, synonyms: 1, antonyms: 1 } },
            ])
            .exec();

        if (!words.length) throw new NotFoundException("Ushbu parametrlar uchun yetarli so'z topilmadi");
        return words;
    }

    private pickGameSentence(word: VocabularyDocument): { sentence: string; answer: string; distractors: string[] } {
        const sentences = (word as any).gameSentences ?? [];
        if (!sentences.length) throw new BadRequestException(`"${(word as any).word}" uchun o'yin gapi yo'q`);
        return sentences[Math.floor(Math.random() * sentences.length)];
    }

    /** "abandon" → "a......" */
    private buildHint(answer: string): string {
        return answer[0] + '.'.repeat(Math.max(0, answer.length - 1));
    }

    private shuffle<T>(arr: T[]): T[] {
        return arr
            .map((v) => ({ v, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ v }) => v);
    }

    private validateId(id: string): void {
        if (!Types.ObjectId.isValid(id)) throw new BadRequestException(`Noto'g'ri ID format: ${id}`);
    }

    private async findExistingOrThrow(id: string): Promise<VocabularyDocument> {
        const word = await this.vocabularyModel
            .findOne({ _id: new Types.ObjectId(id), isDeleted: false })
            .lean()
            .exec();
        if (!word) throw new NotFoundException(`So'z topilmadi: ${id}`);
        return word as any;
    }
}

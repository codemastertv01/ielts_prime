// vocabulary/vocabulary.controller.ts
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { VocabularyService } from './vocabulary.service';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { BulkCreateVocabularyDto, BulkUpdateVocabularyDto, BulkIdsDto, AddLanguageDto } from './dto/bulk-vocabulary.dto';
import { AdminFindVocabularyDto, UserFindVocabularyDto, GameQueryDto, CheckAnswerDto, WordChainValidateDto } from './dto/find-vocabulary.dto';
import { CefrLevel, WordCategory } from './dto/enums';
import { buildMeta } from '../dto/metadata-info.dto';

// ══════════════════════════════════════════════════════════════
// USER CONTROLLER — /api/v1/vocabulary
// ══════════════════════════════════════════════════════════════

@ApiTags('Vocabulary — User')
@Controller('vocabulary')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
export class VocabularyUserController {
    constructor(private readonly vocabularyService: VocabularyService) {}

    // ─── So'zlar ro'yxati & detail ────────────────────────────

    @Get()
    @ApiOperation({ summary: "So'zlar ro'yxatini olish (published, active)" })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'cefrLevel', required: false, enum: CefrLevel })
    @ApiQuery({ name: 'category', required: false, enum: WordCategory })
    @ApiQuery({ name: 'tag', required: false })
    @ApiQuery({ name: 'lang', required: false, description: "Tarjima tili: 'uz' | 'ru' | 'en'" })
    async findAll(@Query() query: UserFindVocabularyDto) {
        const result = await this.vocabularyService.userFindAll(query);
        return { success: true, ...result };
    }

    @Get(':id')
    @ApiOperation({ summary: "So'zni ID bo'yicha olish" })
    @ApiParam({ name: 'id' })
    @ApiQuery({ name: 'lang', required: false, description: "Tarjima tili: 'uz' | 'ru' | 'en'" })
    async findOne(@Param('id') id: string, @Query('lang') lang = 'en') {
        const data = await this.vocabularyService.userFindById(id, lang);
        return { success: true, data };
    }

    // ═══════════════════════════════════════════════════════════
    // GAMES — 15 ta o'yin turi
    // ═══════════════════════════════════════════════════════════

    // ─── 1. Fill In The Blank ─────────────────────────────────
    @Get('games/fill-blank')
    @ApiOperation({
        summary: "1. Bo'sh joyni to'ldirish",
        description: "Gap beriladi, bitta so'z olib tashlangan. User so'zni yozadi.\n" + 'Misol: "I decided to ___ the project." → Javob: abandon',
    })
    @ApiQuery({ name: 'cefrLevel', required: false, enum: CefrLevel })
    @ApiQuery({ name: 'category', required: false, enum: WordCategory })
    @ApiQuery({ name: 'count', required: false, type: Number, description: "So'zlar soni (1-50), default: 10" })
    async fillBlankGame(@Query() query: GameQueryDto) {
        const data = await this.vocabularyService.getFillBlankGame(query);
        return { success: true, gameType: 'fill_blank', total: data.length, data };
    }

    // ─── 2. Translation Input ─────────────────────────────────
    @Get('games/translation-input')
    @ApiOperation({
        summary: "2. Tarjimadan so'z yozish",
        description: "Tarjima beriladi, user inglizcha so'zni yozadi.\n" + 'Misol: "Tark etmoq" → abandon',
    })
    @ApiQuery({ name: 'cefrLevel', required: false, enum: CefrLevel })
    @ApiQuery({ name: 'category', required: false, enum: WordCategory })
    @ApiQuery({ name: 'count', required: false, type: Number })
    @ApiQuery({ name: 'lang', required: false, description: "Tarjima tili (default: 'uz')" })
    async translationInputGame(@Query() query: GameQueryDto) {
        const data = await this.vocabularyService.getTranslationInputGame(query);
        return { success: true, gameType: 'translation_input', total: data.length, data };
    }

    // ─── 3. Multiple Choice ───────────────────────────────────
    @Get('games/multiple-choice')
    @ApiOperation({
        summary: '3. 4 variantli test',
        description: "Gap beriladi, 4 ta variantdan to'g'risini tanlash.\n" + 'Misol: "She decided to ___ the project." A) begin B) leave C) build D) collect',
    })
    @ApiQuery({ name: 'cefrLevel', required: false, enum: CefrLevel })
    @ApiQuery({ name: 'category', required: false, enum: WordCategory })
    @ApiQuery({ name: 'count', required: false, type: Number })
    async multipleChoiceGame(@Query() query: GameQueryDto) {
        const data = await this.vocabularyService.getMultipleChoiceGame(query);
        return { success: true, gameType: 'multiple_choice', total: data.length, data };
    }

    // ─── 4. Word Chain ────────────────────────────────────────
    @Get('games/word-chain/start')
    @ApiOperation({
        summary: '4. Word Chain — Boshlash',
        description: "Server bitta so'z beradi. Foydalanuvchi oxirgi harfdan boshlanuvchi yangi so'z yozadi.\n" + 'Misol: apple → elephant → tiger → rabbit...',
    })
    @ApiQuery({ name: 'cefrLevel', required: false, enum: CefrLevel })
    @ApiQuery({ name: 'category', required: false, enum: WordCategory })
    async wordChainStart(@Query() query: GameQueryDto) {
        const data = await this.vocabularyService.getWordChainStart(query);
        return { success: true, gameType: 'word_chain', data };
    }

    @Post('games/word-chain/validate')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '4. Word Chain — Javobni tekshirish',
        description: "Foydalanuvchi so'zini tekshiradi:\n" + '• Oxirgi harfdan boshlanishini\n' + '• Bazada borligini\n' + '• Takrorlanmaganligini\n' + "To'g'ri bo'lsa kompyuterning keyingi so'zini qaytaradi.",
    })
    async wordChainValidate(@Body() dto: WordChainValidateDto) {
        const result = await this.vocabularyService.validateWordChain(dto);
        return { success: true, gameType: 'word_chain', ...result };
    }

    // ─── 5. Drag And Drop Sentence ────────────────────────────
    @Get('games/drag-drop')
    @ApiOperation({
        summary: '5. Drag And Drop Sentence',
        description: "Gapda bo'sh joy bor, wordBank dan to'g'ri so'zni tortib joylashtirasiz.\n" + 'Misol: "I want to ___ English." + [learn, eat, drink, sleep]',
    })
    @ApiQuery({ name: 'cefrLevel', required: false, enum: CefrLevel })
    @ApiQuery({ name: 'category', required: false, enum: WordCategory })
    @ApiQuery({ name: 'count', required: false, type: Number })
    async dragDropGame(@Query() query: GameQueryDto) {
        const data = await this.vocabularyService.getDragDropGame(query);
        return { success: true, gameType: 'drag_drop', total: data.length, data };
    }

    // ─── 6. Missing Word Input ────────────────────────────────
    @Get('games/missing-word')
    @ApiOperation({
        summary: "6. Missing Word — Gapdan tushib qolgan so'z",
        description: "Misol gapidan bitta so'z yashiriladi, user yozadi.\n" + 'Misol: "She ___ to school every day." → goes',
    })
    @ApiQuery({ name: 'cefrLevel', required: false, enum: CefrLevel })
    @ApiQuery({ name: 'category', required: false, enum: WordCategory })
    @ApiQuery({ name: 'count', required: false, type: Number })
    @ApiQuery({ name: 'lang', required: false, description: "Misol gaplari tili (default: 'en')" })
    async missingWordGame(@Query() query: GameQueryDto) {
        const data = await this.vocabularyService.getMissingWordGame(query);
        return { success: true, gameType: 'missing_word', total: data.length, data };
    }

    // ─── 7. Listening Fill In The Blank ───────────────────────
    @Get('games/listening-fill')
    @ApiOperation({
        summary: '7. Listen And Complete',
        description: "Audio gap o'qiladi, matnda bitta so'z bo'sh. User eshitib yozadi.\n" + "ESLATMA: Faqat audioUrl mavjud so'zlar uchun ishlaydi.",
    })
    @ApiQuery({ name: 'cefrLevel', required: false, enum: CefrLevel })
    @ApiQuery({ name: 'category', required: false, enum: WordCategory })
    @ApiQuery({ name: 'count', required: false, type: Number })
    async listeningFillGame(@Query() query: GameQueryDto) {
        const data = await this.vocabularyService.getListeningFillGame(query);
        return { success: true, gameType: 'listening_fill', total: data.length, data };
    }

    // ─── 8. Listening Dictation ───────────────────────────────
    @Get('games/listening-dictation')
    @ApiOperation({
        summary: '8. Listen And Type',
        description: "Audio faqat bitta so'z aytadi. User aynan eshitgan so'zni yozadi.\n" + "ESLATMA: Faqat audioUrl mavjud so'zlar uchun ishlaydi.",
    })
    @ApiQuery({ name: 'cefrLevel', required: false, enum: CefrLevel })
    @ApiQuery({ name: 'category', required: false, enum: WordCategory })
    @ApiQuery({ name: 'count', required: false, type: Number })
    async listeningDictationGame(@Query() query: GameQueryDto) {
        const data = await this.vocabularyService.getListeningDictationGame(query);
        return { success: true, gameType: 'listening_dict', total: data.length, data };
    }

    // ─── 9. Sentence Builder ──────────────────────────────────
    @Get('games/sentence-builder')
    @ApiOperation({
        summary: '9. Build The Sentence',
        description: "Aralashtirilgan so'zlarni to'g'ri tartibda joylashtirish.\n" + 'Misol: [English, learn, want, I, to] → "I want to learn English."',
    })
    @ApiQuery({ name: 'cefrLevel', required: false, enum: CefrLevel })
    @ApiQuery({ name: 'category', required: false, enum: WordCategory })
    @ApiQuery({ name: 'count', required: false, type: Number })
    @ApiQuery({ name: 'lang', required: false, description: "Misol gaplari tili (default: 'en')" })
    async sentenceBuilderGame(@Query() query: GameQueryDto) {
        const data = await this.vocabularyService.getSentenceBuilderGame(query);
        return { success: true, gameType: 'sentence_builder', total: data.length, data };
    }

    // ─── 10. Drag To Build Sentence ───────────────────────────
    @Get('games/drag-sentence')
    @ApiOperation({
        summary: '10. Drag To Build',
        description: "Pastda so'zlar yotadi. User ularni sudrab gap hosil qiladi.\n" + 'Misol: [I] [want] [to] [learn] [English] → "I want to learn English."',
    })
    @ApiQuery({ name: 'cefrLevel', required: false, enum: CefrLevel })
    @ApiQuery({ name: 'category', required: false, enum: WordCategory })
    @ApiQuery({ name: 'count', required: false, type: Number })
    @ApiQuery({ name: 'lang', required: false })
    async dragSentenceGame(@Query() query: GameQueryDto) {
        const data = await this.vocabularyService.getDragSentenceGame(query);
        return { success: true, gameType: 'drag_sentence', total: data.length, data };
    }

    // ─── 11. Matching ─────────────────────────────────────────
    @Get('games/matching')
    @ApiOperation({
        summary: '11. Match Pairs',
        description: "Chap: inglizcha so'zlar. O'ng: tarjimalari. User ularni bog'laydi.\n" + 'Misol: abandon ↔ tark etmoq',
    })
    @ApiQuery({ name: 'cefrLevel', required: false, enum: CefrLevel })
    @ApiQuery({ name: 'category', required: false, enum: WordCategory })
    @ApiQuery({ name: 'count', required: false, type: Number })
    @ApiQuery({ name: 'lang', required: false, description: "Ta'rif tili (default: 'en')" })
    async matchingGame(@Query() query: GameQueryDto) {
        const data = await this.vocabularyService.getMatchingGame(query, query.lang);
        return { success: true, gameType: 'matching', data };
    }

    // ─── 12. Image To Word ────────────────────────────────────
    @Get('games/image-word')
    @ApiOperation({
        summary: '12. Guess The Word',
        description: "Rasm ko'rsatiladi. User inglizcha so'zni yozadi.\n" + "ESLATMA: Faqat imageUrl mavjud so'zlar uchun ishlaydi.",
    })
    @ApiQuery({ name: 'cefrLevel', required: false, enum: CefrLevel })
    @ApiQuery({ name: 'category', required: false, enum: WordCategory })
    @ApiQuery({ name: 'count', required: false, type: Number })
    async imageToWordGame(@Query() query: GameQueryDto) {
        const data = await this.vocabularyService.getImageToWordGame(query);
        return { success: true, gameType: 'image_to_word', total: data.length, data };
    }

    // ─── 13. Synonym Challenge ────────────────────────────────
    @Get('games/synonym')
    @ApiOperation({
        summary: '13. Find The Synonym',
        description: "So'z beriladi. User ma'nodoshini 4 variantdan topadi.\n" + 'Misol: "Big" → A) Large B) Tiny C) Short D) Weak',
    })
    @ApiQuery({ name: 'cefrLevel', required: false, enum: CefrLevel })
    @ApiQuery({ name: 'category', required: false, enum: WordCategory })
    @ApiQuery({ name: 'count', required: false, type: Number })
    async synonymGame(@Query() query: GameQueryDto) {
        const data = await this.vocabularyService.getSynonymGame(query);
        return { success: true, gameType: 'synonym_challenge', total: data.length, data };
    }

    // ─── 14. Antonym Challenge ────────────────────────────────
    @Get('games/antonym')
    @ApiOperation({
        summary: '14. Find The Opposite',
        description: "So'z beriladi. User qarama-qarshi ma'nosini 4 variantdan topadi.\n" + 'Misol: "Hot" → Cold',
    })
    @ApiQuery({ name: 'cefrLevel', required: false, enum: CefrLevel })
    @ApiQuery({ name: 'category', required: false, enum: WordCategory })
    @ApiQuery({ name: 'count', required: false, type: Number })
    async antonymGame(@Query() query: GameQueryDto) {
        const data = await this.vocabularyService.getAntonymGame(query);
        return { success: true, gameType: 'antonym_challenge', total: data.length, data };
    }

    // ─── 15. Memory Cards ─────────────────────────────────────
    @Get('games/memory-cards')
    @ApiOperation({
        summary: '15. Memory Match',
        description: 'Kartalar yopiq. User inglizcha va tarjimani topib juftlashtiradi.\n' + 'Har juft uchun: word karta + translation karta (jami = count × 2)',
    })
    @ApiQuery({ name: 'cefrLevel', required: false, enum: CefrLevel })
    @ApiQuery({ name: 'category', required: false, enum: WordCategory })
    @ApiQuery({ name: 'count', required: false, type: Number, description: 'Juftlar soni (1-16), default: 8' })
    @ApiQuery({ name: 'lang', required: false, description: "Tarjima tili (default: 'uz')" })
    async memoryCardsGame(@Query() query: GameQueryDto) {
        const data = await this.vocabularyService.getMemoryCardsGame(query);
        return { success: true, gameType: 'memory_cards', totalCards: data.cards.length, ...data };
    }

    // ─── Javobni tekshirish (barcha o'yin turlari) ────────────
    @Post('games/check')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: "Javobni tekshirish (barcha 15 o'yin uchun)",
        description: "gameType maydoni majburiy — qaysi o'yin uchun tekshirilayotganini ko'rsatadi.\n" + "To'g'ri javob uchun 10 XP, statistika yangilanadi.",
    })
    @ApiResponse({ status: 200, description: 'Natija: correct, correctAnswer, xp, explanation' })
    async checkAnswer(@Body() dto: CheckAnswerDto) {
        const result = await this.vocabularyService.checkAnswer(dto);
        return { success: true, ...result };
    }
}

// ══════════════════════════════════════════════════════════════
// ADMIN CONTROLLER — /api/v1/admin/vocabulary
// ══════════════════════════════════════════════════════════════

@ApiTags('Vocabulary — Admin')
@Controller('admin/vocabulary')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
export class VocabularyAdminController {
    constructor(private readonly vocabularyService: VocabularyService) {}

    // ─── Create ───────────────────────────────────────────────

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: "Yangi so'z yaratish" })
    @ApiResponse({ status: 201, description: "So'z muvaffaqiyatli yaratildi" })
    @ApiResponse({ status: 409, description: "Bu so'z allaqachon mavjud" })
    async create(@Body() dto: CreateVocabularyDto, @Req() req: Request) {
        const data = await this.vocabularyService.create(dto, buildMeta(req));
        return { success: true, data };
    }

    @Post('bulk')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: "Ko'p so'z bir vaqtda yaratish (max 200)" })
    async bulkCreate(@Body() dto: BulkCreateVocabularyDto, @Req() req: Request) {
        const result = await this.vocabularyService.bulkCreate(dto, buildMeta(req));
        return { success: true, ...result };
    }

    // ─── Read ─────────────────────────────────────────────────

    @Get()
    @ApiOperation({ summary: "Barcha so'zlar (admin — filtrlash, o'chirilganlar ham)" })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'cefrLevel', required: false, enum: CefrLevel })
    @ApiQuery({ name: 'category', required: false, enum: WordCategory })
    @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
    @ApiQuery({ name: 'isPremium', required: false, type: Boolean })
    @ApiQuery({ name: 'isDeleted', required: false, type: Boolean })
    @ApiQuery({ name: 'tag', required: false })
    @ApiQuery({ name: 'sortBy', required: false })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
    async findAll(@Query() query: AdminFindVocabularyDto) {
        const result = await this.vocabularyService.adminFindAll(query);
        return { success: true, ...result };
    }

    @Get(':id')
    @ApiOperation({ summary: "So'zni ID bo'yicha olish (admin)" })
    @ApiParam({ name: 'id' })
    async findOne(@Param('id') id: string) {
        const data = await this.vocabularyService.adminFindById(id);
        return { success: true, data };
    }

    // ─── Update ───────────────────────────────────────────────

    @Put(':id')
    @ApiOperation({ summary: "So'zni yangilash" })
    @ApiParam({ name: 'id' })
    async update(@Param('id') id: string, @Body() dto: UpdateVocabularyDto, @Req() req: Request) {
        const data = await this.vocabularyService.update(id, dto, buildMeta(req));
        return { success: true, data };
    }

    @Patch(':id/language')
    @ApiOperation({ summary: "Yangi til qo'shish yoki mavjud tilni yangilash" })
    @ApiParam({ name: 'id' })
    async addLanguage(@Param('id') id: string, @Body() dto: AddLanguageDto, @Req() req: Request) {
        const data = await this.vocabularyService.addLanguage(id, dto, buildMeta(req));
        return { success: true, data };
    }

    @Post('bulk/update')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Ko'p so'zni bir vaqtda yangilash (max 100)" })
    async bulkUpdate(@Body() dto: BulkUpdateVocabularyDto, @Req() req: Request) {
        const result = await this.vocabularyService.bulkUpdate(dto, buildMeta(req));
        return { success: true, ...result };
    }

    // ─── Delete ───────────────────────────────────────────────

    @Delete(':id')
    @ApiOperation({ summary: "So'zni yumshoq o'chirish (isDeleted = true)" })
    @ApiParam({ name: 'id' })
    async softDelete(@Param('id') id: string, @Req() req: Request) {
        const result = await this.vocabularyService.softDelete(id, buildMeta(req));
        return { success: true, ...result };
    }

    @Delete(':id/hard')
    @ApiOperation({ summary: "So'zni bazadan butunlay o'chirish (qaytarib bo'lmaydi!)" })
    @ApiParam({ name: 'id' })
    async hardDelete(@Param('id') id: string, @Req() req: Request) {
        const result = await this.vocabularyService.hardDelete(id, buildMeta(req));
        return { success: true, ...result };
    }

    @Post('bulk/delete')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Ko'p so'zni bir vaqtda o'chirish (max 200)" })
    async bulkDelete(@Body() dto: BulkIdsDto, @Req() req: Request) {
        const result = await this.vocabularyService.bulkDelete(dto, buildMeta(req));
        return { success: true, ...result };
    }

    // ─── Restore ──────────────────────────────────────────────

    @Patch(':id/restore')
    @ApiOperation({ summary: "O'chirilgan so'zni qayta tiklash" })
    @ApiParam({ name: 'id' })
    async restore(@Param('id') id: string, @Req() req: Request) {
        const data = await this.vocabularyService.restore(id, buildMeta(req));
        return { success: true, data };
    }

    @Post('bulk/restore')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Ko'p o'chirilgan so'zni qayta tiklash (max 200)" })
    async bulkRestore(@Body() dto: BulkIdsDto, @Req() req: Request) {
        const result = await this.vocabularyService.bulkRestore(dto, buildMeta(req));
        return { success: true, ...result };
    }
}

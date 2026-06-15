// vocabulary/dto/enums.ts

export enum CefrLevel {
    A1 = 'A1',
    A2 = 'A2',
    B1 = 'B1',
    B2 = 'B2',
    C1 = 'C1',
    C2 = 'C2',
}

export enum PartOfSpeech {
    NOUN = 'n.',
    VERB = 'v.',
    ADJECTIVE = 'adj.',
    ADVERB = 'adv.',
    PREPOSITION = 'prep.',
    CONJUNCTION = 'conj.',
    PRONOUN = 'pron.',
    INTERJECTION = 'interj.',
    ARTICLE = 'article',
    DETERMINER = 'det.',
    PHRASAL_VERB = 'phr. v.',
    IDIOM = 'idiom',
}

export enum WordCategory {
    ACADEMIC = 'academic',
    BUSINESS = 'business',
    TRAVEL = 'travel',
    TECHNOLOGY = 'technology',
    HEALTH = 'health',
    ENVIRONMENT = 'environment',
    SCIENCE = 'science',
    ARTS = 'arts',
    FOOD = 'food',
    SPORTS = 'sports',
    GENERAL = 'general',
}

export enum GameType {
    // ── Mavjud (5 ta) ──────────────────────────────────────────
    FILL_BLANK        = 'fill_blank',         // 1. Bo'sh joyni to'ldirish (yozma)
    MULTIPLE_CHOICE   = 'multiple_choice',    // 3. 4 ta variantdan birini tanlash
    MATCHING          = 'matching',           // 11. So'z va tarjimani moslashtirish
    DRAG_DROP         = 'drag_drop',          // 5. Gapga so'zni tortib qo'yish
    SPELLING          = 'spelling',           // Harflarni to'g'ri tartibga qo'y

    // ── Yangi (10 ta) ──────────────────────────────────────────
    TRANSLATION_INPUT  = 'translation_input',  // 2. Tarjimadan inglizcha so'z yoz
    WORD_CHAIN         = 'word_chain',         // 4. Oxirgi harfdan boshlanuvchi so'z
    MISSING_WORD       = 'missing_word',       // 6. Misoldan tushib qolgan so'z
    LISTENING_FILL     = 'listening_fill',     // 7. Audio eshitib bo'sh joy to'ldirish
    LISTENING_DICT     = 'listening_dict',     // 8. Audio so'z eshitib yozish
    SENTENCE_BUILDER   = 'sentence_builder',   // 9. Aralashtirilgan so'zlarni tartibla
    DRAG_SENTENCE      = 'drag_sentence',      // 10. So'zlarni sudrab gap qur
    IMAGE_TO_WORD      = 'image_to_word',      // 12. Rasmdan so'z top
    SYNONYM_CHALLENGE  = 'synonym_challenge',  // 13. Ma'nodoshini top
    ANTONYM_CHALLENGE  = 'antonym_challenge',  // 14. Qarama-qarshisini top
    MEMORY_CARDS       = 'memory_cards',       // 15. Xotira kartalar
}

export enum SupportedLanguage {
    EN = 'en', // English
    UZ = 'uz', // O'zbek
    RU = 'ru', // Русский
}

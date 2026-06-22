import type { EntityStatus } from './entity.status';

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type PartOfSpeech = 'n.' | 'v.' | 'adj.' | 'adv.' | 'prep.' | 'conj.' | 'pron.' | 'interj.' | 'article' | 'det.' | 'phr. v.' | 'idiom';

export type WordCategory = 'academic' | 'business' | 'travel' | 'technology' | 'health' | 'environment' | 'science' | 'arts' | 'food' | 'sports' | 'general';

export type SupportedLanguage = 'en' | 'uz' | 'ru' | string;

export type GameType =
    | 'fill_blank'
    | 'multiple_choice'
    | 'matching'
    | 'drag_drop'
    | 'spelling'
    | 'translation_input'
    | 'word_chain'
    | 'missing_word'
    | 'listening_fill'
    | 'listening_dict'
    | 'sentence_builder'
    | 'drag_sentence'
    | 'image_to_word'
    | 'synonym_challenge'
    | 'antonym_challenge'
    | 'memory_cards';

export const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const PARTS_OF_SPEECH: PartOfSpeech[] = ['n.', 'v.', 'adj.', 'adv.', 'prep.', 'conj.', 'pron.', 'interj.', 'article', 'det.', 'phr. v.', 'idiom'];

export const WORD_CATEGORIES: WordCategory[] = ['academic', 'business', 'travel', 'technology', 'health', 'environment', 'science', 'arts', 'food', 'sports', 'general'];

export interface VocabularyTranslation {
    translation: string;
    definition: string;
    exampleSentences: string[];
}

export interface GameSentence {
    sentence: string;
    answer: string;
    hint?: string;
    audioUrl?: string;
}

export interface VocabularyWord {
    _id: string;
    word: string;
    partsOfSpeech: PartOfSpeech[];
    cefrLevel: CefrLevel;
    phonetic?: string;
    audioUrl?: string;
    imageUrl?: string;
    translations: Record<SupportedLanguage, VocabularyTranslation>;
    synonyms: string[];
    antonyms: string[];
    relatedWords: string[];
    categories: WordCategory[];
    tags: string[];
    gameSentences: GameSentence[];
    isPublished: boolean;
    isPremium: boolean;
    status?: EntityStatus;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateVocabularyDto {
    word: string;
    partsOfSpeech: PartOfSpeech[];
    cefrLevel: CefrLevel;
    phonetic?: string;
    audioUrl?: string;
    imageUrl?: string;
    translations: Record<SupportedLanguage, VocabularyTranslation>;
    synonyms?: string[];
    antonyms?: string[];
    relatedWords?: string[];
    categories?: WordCategory[];
    tags?: string[];
    gameSentences?: GameSentence[];
    isPublished?: boolean;
    isPremium?: boolean;
}

export type UpdateVocabularyDto = Partial<CreateVocabularyDto>;

export interface VocabularyFilters {
    page?: number;
    limit?: number | 'all';
    search?: string;
    cefrLevel?: CefrLevel | '';
    partOfSpeech?: PartOfSpeech | '';
    category?: WordCategory | '';
    tag?: string;
    language?: SupportedLanguage | '';
    isPublished?: boolean | '';
    isPremium?: boolean | '';
    includeDeleted?: boolean;
    sortBy?: 'word' | 'cefrLevel' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
}

export interface VocabularyGameQuery {
    cefrLevel?: CefrLevel | '';
    category?: WordCategory | '';
    count?: number;
    lang?: SupportedLanguage | '';
}

export interface VocabularyGameItem {
    wordId?: string;
    word?: string;
    sentence?: string;
    translation?: string;
    definition?: string;
    hint?: string;
    cefrLevel?: string;
    lang?: string;
    options?: string[];
    wordBank?: string[];
    shuffledWords?: string[];
    correctSentence?: string;
    audioUrl?: string;
    imageUrl?: string;
    partOfSpeech?: string[];
    partsOfSpeech?: string[];
    correctAnswer?: string;
    lastLetter?: string;
}

export interface VocabularyMatchingPair {
    wordId: string;
    word: string;
    definition: string;
    partsOfSpeech?: string[];
}

export interface VocabularyMemoryCard {
    id: string;
    type: 'word' | 'translation';
    content: string;
}

export interface VocabularyGameResponse {
    success?: boolean;
    gameType: GameType;
    total?: number;
    totalCards?: number;
    data?: VocabularyGameItem[] | VocabularyGameItem | { pairs?: VocabularyMatchingPair[]; cards?: VocabularyMemoryCard[] };
    pairs?: VocabularyMatchingPair[];
    cards?: VocabularyMemoryCard[];
}

export interface VocabularyCheckAnswerDto {
    gameType: GameType;
    wordId?: string;
    word?: string;
    userAnswer?: string;
    lang?: SupportedLanguage;
}

export interface VocabularyCheckAnswerResult {
    success?: boolean;
    correct: boolean;
    correctAnswer: string;
    userAnswer: string;
    explanation?: string;
    xp: number;
}

export interface WordChainValidateDto {
    userWord: string;
    previousWord: string;
    usedWords?: string[];
    cefrLevel?: CefrLevel;
}

export interface WordChainValidateResult {
    success?: boolean;
    valid: boolean;
    reason?: string;
    wordExists: boolean;
    nextWord?: string;
    nextWordId?: string;
    score: number;
}

export interface VocabularyListResponse {
    words: VocabularyWord[];
    total: number;
    page: number;
    limit?: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
}

export interface BulkVocabularyResult {
    succeeded: number;
    failed: Array<{ id?: string; word?: string; reason: string }>;
}

export interface BulkUpdateVocabularyItem {
    id: string;
    data: UpdateVocabularyDto;
}

export interface AddLanguageDto {
    lang: string;
    translation: VocabularyTranslation;
}

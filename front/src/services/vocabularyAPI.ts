import type { AddLanguageDto, BulkUpdateVocabularyItem, BulkVocabularyResult, CreateVocabularyDto, GameType, UpdateVocabularyDto, VocabularyCheckAnswerDto, VocabularyCheckAnswerResult, VocabularyFilters, VocabularyGameQuery, VocabularyGameResponse, VocabularyListResponse, VocabularyWord, WordChainValidateDto, WordChainValidateResult } from '@/types/vocabulary';
import apiClient, { cleanParams, unwrap } from './apiClient';

export const VOCABULARY_GAME_ENDPOINTS: Record<GameType, string> = {
    fill_blank: '/vocabulary/games/fill-blank',
    translation_input: '/vocabulary/games/translation-input',
    multiple_choice: '/vocabulary/games/multiple-choice',
    word_chain: '/vocabulary/games/word-chain/start',
    drag_drop: '/vocabulary/games/drag-drop',
    missing_word: '/vocabulary/games/missing-word',
    listening_fill: '/vocabulary/games/listening-fill',
    listening_dict: '/vocabulary/games/listening-dictation',
    sentence_builder: '/vocabulary/games/sentence-builder',
    drag_sentence: '/vocabulary/games/drag-sentence',
    matching: '/vocabulary/games/matching',
    image_to_word: '/vocabulary/games/image-word',
    synonym_challenge: '/vocabulary/games/synonym',
    antonym_challenge: '/vocabulary/games/antonym',
    memory_cards: '/vocabulary/games/memory-cards',
    spelling: '/vocabulary/games/missing-word',
};

const normalizeList = (payload: unknown): VocabularyListResponse => {
    const record = (payload ?? {}) as Record<string, unknown>;
    const words = (record.words ?? record.data ?? record.vocabulary ?? []) as VocabularyWord[];
    const total = Number(record.total ?? words.length ?? 0);
    const page = Number(record.page ?? 1);
    const totalPages = Number(record.totalPages ?? Math.max(1, Math.ceil(total / Number(record.limit || 20))));
    return {
        words,
        total,
        page,
        limit: typeof record.limit === 'number' ? record.limit : undefined,
        totalPages,
        hasNext: Boolean(record.hasNext ?? page < totalPages),
        hasPrev: Boolean(record.hasPrev ?? page > 1),
    };
};

const getErrorMessage = (error: unknown) => {
    const candidate = error as { response?: { data?: { message?: string | string[] } }; message?: string };
    const message = candidate.response?.data?.message ?? candidate.message;
    return Array.isArray(message) ? message.join(', ') : message || 'Vocabulary request failed';
};

export const adminVocabularyAPI = {
    getAll: async (filters?: VocabularyFilters) => normalizeList(await unwrap(apiClient.get('/admin/vocabulary', { params: cleanParams(filters as Record<string, unknown> | undefined) }))),
    getById: (id: string) => unwrap<VocabularyWord>(apiClient.get(`/admin/vocabulary/${id}`)),
    create: (dto: CreateVocabularyDto) => unwrap<VocabularyWord>(apiClient.post('/admin/vocabulary', dto)),
    update: (id: string, dto: UpdateVocabularyDto) => unwrap<VocabularyWord>(apiClient.put(`/admin/vocabulary/${id}`, dto)),
    softDelete: (id: string, reason?: string) => unwrap(apiClient.delete(`/admin/vocabulary/${id}`, { data: { reason } })),
    restore: (id: string) => unwrap<VocabularyWord>(apiClient.patch(`/admin/vocabulary/${id}/restore`)),
    hardDelete: (id: string) => unwrap(apiClient.delete(`/admin/vocabulary/${id}/hard`)),
    bulkCreate: (words: CreateVocabularyDto[]) => unwrap<BulkVocabularyResult>(apiClient.post('/admin/vocabulary/bulk', { words })),
    bulkUpdate: (items: BulkUpdateVocabularyItem[]) => unwrap<BulkVocabularyResult>(apiClient.post('/admin/vocabulary/bulk/update', { items })),
    bulkDelete: (ids: string[], reason?: string) => unwrap<BulkVocabularyResult>(apiClient.post('/admin/vocabulary/bulk/delete', { ids, reason })),
    bulkRestore: (ids: string[]) => unwrap<BulkVocabularyResult>(apiClient.post('/admin/vocabulary/bulk/restore', { ids })),
    addLanguage: (id: string, dto: AddLanguageDto) => unwrap<VocabularyWord>(apiClient.patch(`/admin/vocabulary/${id}/language`, dto)),
};

export const vocabularyAPI = {
    getAll: async (filters?: VocabularyFilters) => normalizeList(await unwrap(apiClient.get('/vocabulary', { params: cleanParams(filters as Record<string, unknown> | undefined) }))),
    getById: (id: string) => unwrap<VocabularyWord>(apiClient.get(`/vocabulary/${id}`)),
    getGame: (gameType: GameType, query?: VocabularyGameQuery) => unwrap<VocabularyGameResponse>(apiClient.get(VOCABULARY_GAME_ENDPOINTS[gameType], { params: cleanParams(query as Record<string, unknown> | undefined) })),
    checkAnswer: (dto: VocabularyCheckAnswerDto) => unwrap<VocabularyCheckAnswerResult>(apiClient.post('/vocabulary/games/check', dto)),
    validateWordChain: (dto: WordChainValidateDto) => unwrap<WordChainValidateResult>(apiClient.post('/vocabulary/games/word-chain/validate', dto)),
    getErrorMessage,
};

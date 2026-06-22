'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminVocabularyAPI, vocabularyAPI } from '@/services/vocabularyAPI';
import { showToast } from '@/services/toastService';
import type { AddLanguageDto, CreateVocabularyDto, GameType, UpdateVocabularyDto, VocabularyCheckAnswerDto, VocabularyFilters, VocabularyGameQuery, WordChainValidateDto } from '@/types/vocabulary';

export const VOCABULARY_KEYS = {
    all: ['vocabulary'] as const,
    adminList: (filters?: VocabularyFilters) => ['vocabulary', 'admin', 'list', filters] as const,
    userList: (filters?: VocabularyFilters) => ['vocabulary', 'user', 'list', filters] as const,
    detail: (id: string) => ['vocabulary', 'detail', id] as const,
    game: (gameType?: GameType | null, filters?: VocabularyGameQuery) => ['vocabulary', 'game', gameType, filters] as const,
};

const notifyError = (error: unknown) => showToast.error(vocabularyAPI.getErrorMessage(error));

export function useAdminVocabulary(filters?: VocabularyFilters) {
    const qc = useQueryClient();
    const listQuery = useQuery({
        queryKey: VOCABULARY_KEYS.adminList(filters),
        queryFn: () => adminVocabularyAPI.getAll(filters),
        staleTime: 60_000,
        placeholderData: (previous) => previous,
    });

    const invalidate = () => qc.invalidateQueries({ queryKey: VOCABULARY_KEYS.all });

    const create = useMutation({
        mutationFn: (dto: CreateVocabularyDto) => adminVocabularyAPI.create(dto),
        onSuccess: () => {
            invalidate();
            showToast.success('Vocabulary word created');
        },
        onError: notifyError,
    });

    const bulkCreate = useMutation({
        mutationFn: (words: CreateVocabularyDto[]) => adminVocabularyAPI.bulkCreate(words),
        onSuccess: (result) => {
            invalidate();
            showToast.success(`${result.succeeded} word(s) imported${result.failed.length ? `, ${result.failed.length} failed` : ''}`);
        },
        onError: notifyError,
    });

    const bulkDelete = useMutation({
        mutationFn: ({ ids, reason }: { ids: string[]; reason?: string }) => adminVocabularyAPI.bulkDelete(ids, reason),
        onSuccess: () => {
            invalidate();
            showToast.success('Selected words deleted');
        },
        onError: notifyError,
    });

    const bulkRestore = useMutation({
        mutationFn: (ids: string[]) => adminVocabularyAPI.bulkRestore(ids),
        onSuccess: () => {
            invalidate();
            showToast.success('Selected words restored');
        },
        onError: notifyError,
    });

    const update = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateVocabularyDto }) => adminVocabularyAPI.update(id, data),
        onSuccess: () => {
            invalidate();
            showToast.success('Vocabulary word updated');
        },
        onError: notifyError,
    });

    return {
        words: listQuery.data?.words ?? [],
        total: listQuery.data?.total ?? 0,
        page: listQuery.data?.page ?? 1,
        totalPages: listQuery.data?.totalPages ?? 1,
        isLoading: listQuery.isLoading,
        isFetching: listQuery.isFetching,
        refetch: listQuery.refetch,
        create: create.mutate,
        createAsync: create.mutateAsync,
        isCreating: create.isPending,
        bulkCreate: bulkCreate.mutate,
        isBulkCreating: bulkCreate.isPending,
        bulkDelete: bulkDelete.mutate,
        isBulkDeleting: bulkDelete.isPending,
        bulkRestore: bulkRestore.mutate,
        isBulkRestoring: bulkRestore.isPending,
        update: update.mutate,
        isUpdating: update.isPending,
    };
}

export function useAdminVocabularyWord(id: string) {
    const qc = useQueryClient();
    const query = useQuery({
        queryKey: VOCABULARY_KEYS.detail(id),
        queryFn: () => adminVocabularyAPI.getById(id),
        enabled: Boolean(id),
        staleTime: 60_000,
    });

    const invalidate = () => {
        qc.invalidateQueries({ queryKey: VOCABULARY_KEYS.all });
        qc.invalidateQueries({ queryKey: VOCABULARY_KEYS.detail(id) });
    };

    const update = useMutation({
        mutationFn: (dto: UpdateVocabularyDto) => adminVocabularyAPI.update(id, dto),
        onSuccess: () => {
            invalidate();
            showToast.success('Vocabulary word updated');
        },
        onError: notifyError,
    });

    const remove = useMutation({
        mutationFn: (reason?: string) => adminVocabularyAPI.softDelete(id, reason),
        onSuccess: () => {
            invalidate();
            showToast.success('Vocabulary word deleted');
        },
        onError: notifyError,
    });

    const restore = useMutation({
        mutationFn: () => adminVocabularyAPI.restore(id),
        onSuccess: () => {
            invalidate();
            showToast.success('Vocabulary word restored');
        },
        onError: notifyError,
    });

    const addLanguage = useMutation({
        mutationFn: (dto: AddLanguageDto) => adminVocabularyAPI.addLanguage(id, dto),
        onSuccess: () => {
            invalidate();
            showToast.success('Translation added');
        },
        onError: notifyError,
    });

    return {
        word: query.data,
        isLoading: query.isLoading,
        refetch: query.refetch,
        update: update.mutate,
        updateAsync: update.mutateAsync,
        isUpdating: update.isPending,
        remove: remove.mutate,
        isDeleting: remove.isPending,
        restore: restore.mutate,
        isRestoring: restore.isPending,
        addLanguage: addLanguage.mutate,
        isAddingLanguage: addLanguage.isPending,
    };
}

export function useVocabulary(filters?: VocabularyFilters) {
    const query = useQuery({
        queryKey: VOCABULARY_KEYS.userList(filters),
        queryFn: () => vocabularyAPI.getAll(filters),
        staleTime: 60_000,
        placeholderData: (previous) => previous,
    });

    return {
        words: query.data?.words ?? [],
        total: query.data?.total ?? 0,
        page: query.data?.page ?? 1,
        totalPages: query.data?.totalPages ?? 1,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        refetch: query.refetch,
    };
}

export function useVocabularyWord(id: string) {
    const query = useQuery({
        queryKey: VOCABULARY_KEYS.detail(id),
        queryFn: () => vocabularyAPI.getById(id),
        enabled: Boolean(id),
        staleTime: 60_000,
    });

    return {
        word: query.data,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        refetch: query.refetch,
        error: query.error,
    };
}

export function useVocabularyGame(gameType: GameType | null, filters?: VocabularyGameQuery) {
    const query = useQuery({
        queryKey: VOCABULARY_KEYS.game(gameType, filters),
        queryFn: () => vocabularyAPI.getGame(gameType as GameType, filters),
        enabled: Boolean(gameType),
        staleTime: 30_000,
    });

    const checkAnswer = useMutation({
        mutationFn: (dto: VocabularyCheckAnswerDto) => vocabularyAPI.checkAnswer(dto),
        onError: notifyError,
    });

    const validateWordChain = useMutation({
        mutationFn: (dto: WordChainValidateDto) => vocabularyAPI.validateWordChain(dto),
        onError: notifyError,
    });

    return {
        game: query.data,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        refetch: query.refetch,
        checkAnswer: checkAnswer.mutateAsync,
        isChecking: checkAnswer.isPending,
        validateWordChain: validateWordChain.mutateAsync,
        isValidatingWordChain: validateWordChain.isPending,
    };
}

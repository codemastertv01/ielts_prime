import type { GameType, VocabularyGameItem, VocabularyGameResponse, VocabularyMatchingPair, VocabularyMemoryCard } from '@/types/vocabulary';

export interface VocabularyGameMeta {
    id: GameType;
    title: string;
    skill: string;
    description: string;
    mode: 'input' | 'choice' | 'matching' | 'builder' | 'memory' | 'chain' | 'letterbox' | 'wordbank';
    defaultCount: number;
}

export const VOCABULARY_GAMES: VocabularyGameMeta[] = [
    {
        id: 'fill_blank',
        title: 'Fill in the Blank',
        skill: 'Context recall',
        description: 'Read a sentence with one missing word and type the correct answer.',
        mode: 'input',
        defaultCount: 10,
    },
    {
        id: 'translation_input',
        title: 'Letter Spelling',
        skill: 'Spelling accuracy',
        description: 'See the translation and type the English word one letter at a time.',
        mode: 'letterbox',
        defaultCount: 10,
    },
    {
        id: 'multiple_choice',
        title: 'Multiple Choice',
        skill: 'Fast recognition',
        description: 'Choose the correct word from four answer cards.',
        mode: 'choice',
        defaultCount: 10,
    },
    {
        id: 'word_chain',
        title: 'Word Chain Battle',
        skill: 'Vocabulary speed',
        description: 'Reply with a word that starts with the previous word ending.',
        mode: 'chain',
        defaultCount: 1,
    },
    {
        id: 'drag_drop',
        title: 'Word Bank Drop',
        skill: 'Sentence completion',
        description: 'Use the word bank to complete the sentence.',
        mode: 'wordbank',
        defaultCount: 10,
    },
    {
        id: 'sentence_builder',
        title: 'Sentence Builder',
        skill: 'Word order',
        description: 'Tap shuffled word chips in the correct order.',
        mode: 'builder',
        defaultCount: 10,
    },
    {
        id: 'matching',
        title: 'Matching',
        skill: 'Word and meaning',
        description: 'Match English words with their definitions.',
        mode: 'matching',
        defaultCount: 8,
    },
    {
        id: 'synonym_challenge',
        title: 'Synonym Challenge',
        skill: 'Vocabulary range',
        description: 'Choose the closest synonym from four options.',
        mode: 'choice',
        defaultCount: 10,
    },
    {
        id: 'antonym_challenge',
        title: 'Antonym Challenge',
        skill: 'Opposites',
        description: 'Choose the word with the opposite meaning.',
        mode: 'choice',
        defaultCount: 10,
    },
    {
        id: 'memory_cards',
        title: 'Memory Cards',
        skill: 'Long-term recall',
        description: 'Flip cards and match each word with its translation.',
        mode: 'memory',
        defaultCount: 8,
    },
];

export const getGameMeta = (gameType: GameType | null) => VOCABULARY_GAMES.find((game) => game.id === gameType) ?? null;

export function getGameItems(response?: VocabularyGameResponse): VocabularyGameItem[] {
    if (!response?.data) return [];
    if (Array.isArray(response.data)) return response.data;
    if ('wordId' in response.data || 'word' in response.data) return [response.data as VocabularyGameItem];
    return [];
}

export function getMatchingPairs(response?: VocabularyGameResponse): VocabularyMatchingPair[] {
    if (response?.pairs?.length) return response.pairs;
    if (response?.data && !Array.isArray(response.data) && 'pairs' in response.data) return (response.data.pairs ?? []) as VocabularyMatchingPair[];
    return [];
}

export function getMemoryCards(response?: VocabularyGameResponse): VocabularyMemoryCard[] {
    if (response?.cards?.length) return response.cards;
    if (response?.data && !Array.isArray(response.data) && 'cards' in response.data) return (response.data.cards ?? []) as VocabularyMemoryCard[];
    return [];
}

export function getItemPrompt(gameType: GameType, item: VocabularyGameItem): string {
    switch (gameType) {
        case 'fill_blank':
            return item.sentence ?? 'Complete the sentence.';
        case 'drag_drop':
            return item.sentence ?? 'Choose the word that fits the blank.';
        case 'translation_input':
            return item.translation ?? item.definition ?? 'Type the English word.';
        case 'multiple_choice':
            return item.sentence ?? item.definition ?? 'Choose the correct word.';
        case 'sentence_builder':
            return 'Arrange the shuffled words to build the correct sentence.';
        case 'synonym_challenge':
            return item.word ? `Choose a synonym of "${item.word}".` : 'Choose the synonym.';
        case 'antonym_challenge':
            return item.word ? `Choose the antonym of "${item.word}".` : 'Choose the antonym.';
        default:
            return item.definition ?? item.sentence ?? item.word ?? 'Answer the question.';
    }
}

export function getItemOptions(item: VocabularyGameItem): string[] {
    return item.options ?? item.wordBank ?? item.shuffledWords ?? [];
}

export function isBuilderGame(gameType: GameType): boolean {
    return gameType === 'sentence_builder' || gameType === 'drag_sentence';
}

export const CATEGORY_EMOJI: Record<string, string> = {
    academic: 'A',
    business: 'B',
    travel: 'T',
    technology: 'IT',
    health: 'H',
    environment: 'E',
    science: 'S',
    arts: 'AR',
    food: 'F',
    sports: 'SP',
    general: 'G',
};

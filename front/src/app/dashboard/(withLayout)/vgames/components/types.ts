import type { GameType, VocabularyGameItem, VocabularyGameQuery } from '@/types/vocabulary';
import type { VocabularyGameMeta } from '@/lib/vocabularyGames';

export type Phase = 'setup' | 'playing' | 'finished';

export interface AnswerRecord {
    item: VocabularyGameItem;
    userAnswer: string;
    correct: boolean;
    correctAnswer: string;
    xp: number;
    explanation?: string;
}

export interface ChainMessage {
    speaker: 'computer' | 'user';
    word: string;
    valid?: boolean;
}

export interface GameSetupState {
    selectedGame: GameType | null;
    query: VocabularyGameQuery;
    meta: VocabularyGameMeta | null;
}

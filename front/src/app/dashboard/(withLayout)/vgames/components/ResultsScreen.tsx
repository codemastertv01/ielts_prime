'use client';

import Link from 'next/link';
import { ArrowLeft, RefreshCw, Trophy } from 'lucide-react';
import { Badge, Button, Card } from '@/components/UI';
import type { GameType } from '@/types/vocabulary';
import type { VocabularyGameMeta } from '@/lib/vocabularyGames';
import type { AnswerRecord } from './types';

interface ResultsScreenProps {
    answers: AnswerRecord[];
    meta: VocabularyGameMeta | null;
    selectedGame: GameType | null;
    onPlayAgain: () => void;
    onChooseGame: () => void;
}

export default function ResultsScreen({ answers, meta, selectedGame, onPlayAgain, onChooseGame }: ResultsScreenProps) {
    const totalCorrect = answers.filter((answer) => answer.correct).length;
    const totalXP = answers.reduce((sum, answer) => sum + answer.xp, 0);
    const accuracy = answers.length ? Math.round((totalCorrect / answers.length) * 100) : 0;

    return (
        <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-950">
            <div className="mx-auto max-w-4xl space-y-5 px-4">
                <Link href="/dashboard/vocabulary" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
                    <ArrowLeft className="h-4 w-4" /> Vocabulary
                </Link>
                <Card variant="gradient" padding="lg" radius="xl" hoverEffect={false}>
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
                            <Trophy className="h-8 w-8" />
                        </div>
                        <Badge tone="primary">{selectedGame?.replace(/_/g, ' ') ?? 'Vocabulary game'}</Badge>
                        <h1 className="mt-3 text-3xl font-black text-gray-950 dark:text-white">{meta?.title ?? 'Game'} Complete</h1>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Nice session. Keep the rhythm and the words start sticking.</p>
                    </div>
                    <div className="mt-8 grid gap-3 sm:grid-cols-3">
                        <ScoreTile label="Correct" value={`${totalCorrect}/${answers.length}`} />
                        <ScoreTile label="Accuracy" value={`${accuracy}%`} />
                        <ScoreTile label="XP" value={String(totalXP)} />
                    </div>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Button Icon={RefreshCw} onClick={onPlayAgain}>
                            Play Again
                        </Button>
                        <Button variant="outline" tone="neutral" onClick={onChooseGame}>
                            Choose Game
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function ScoreTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
            <p className="mt-1 text-2xl font-black text-gray-950 dark:text-white">{value}</p>
        </div>
    );
}

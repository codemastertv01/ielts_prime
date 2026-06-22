'use client';

import { Play } from 'lucide-react';
import { Badge, Button, Card } from '@/components/UI';
import { type GameType, type SupportedLanguage } from '@/types/vocabulary';
import { VOCABULARY_GAMES } from '@/lib/vocabularyGames';

const LANGS: SupportedLanguage[] = ['en', 'uz', 'ru'];

interface GameSetupProps {
    selectedGame: GameType | null;
    onSelectGame: (gameType: GameType) => void;
    onStart: () => void;
}

export default function GameSetup({ selectedGame, onSelectGame, onStart }: GameSetupProps) {
    const selectedMeta = VOCABULARY_GAMES.find((game) => game.id === selectedGame) ?? null;

    return (
        <div className="space-y-5">
            <Card variant="default" padding="md" radius="xl" hoverEffect={false}>
                <Button Icon={Play} disabled={!selectedGame} onClick={onStart}>
                    Start {selectedMeta?.title ?? 'Game'}
                </Button>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {VOCABULARY_GAMES.map((game) => {
                    const active = selectedGame === game.id;
                    return (
                        <button key={game.id} onClick={() => onSelectGame(game.id)} className="text-left">
                            <Card variant={active ? 'gradient' : 'default'} padding="md" radius="xl" hoverEffect glow={active} className={active ? 'border-blue-500' : ''}>
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-sm font-black text-gray-950 dark:text-white">{game.title}</h2>
                                        <p className="mt-1 text-xs font-semibold text-blue-600 dark:text-blue-300">{game.skill}</p>
                                    </div>
                                    <Badge tone={active ? 'primary' : 'neutral'}>{game.mode}</Badge>
                                </div>
                                <p className="mt-3 text-xs leading-5 text-gray-500 dark:text-gray-400">{game.description}</p>
                            </Card>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Gamepad2, RotateCcw, Zap } from 'lucide-react';
import { Badge, Button } from '@/components/UI';
import type { GameType } from '@/types/vocabulary';
import type { Phase } from './types';

interface GameHeaderProps {
    phase: Phase;
    selectedGame: GameType | null;
    subtitle: string;
    totalCorrect: number;
    totalXP: number;
    onChangeGame: () => void;
}

export default function GameHeader({ phase, subtitle, totalCorrect, totalXP, onChangeGame }: GameHeaderProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
                <Link href="/dashboard/vocabulary" className="mb-2 flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
                    <ArrowLeft className="h-4 w-4" /> Vocabulary
                </Link>
                <h1 className="flex items-center gap-2 text-2xl font-black text-gray-900 dark:text-white">
                    <Gamepad2 className="h-6 w-6 text-blue-500" /> Vocabulary Games
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            </div>
            {phase === 'playing' && (
                <div className="flex items-center gap-3">
                    <Badge tone="warning" size="lg" Icon={Zap}>{totalXP} XP</Badge>
                    <Badge tone="success" size="lg" Icon={CheckCircle2}>{totalCorrect}</Badge>
                    <Button size="sm" variant="outline" tone="neutral" Icon={RotateCcw} onClick={onChangeGame}>
                        Change
                    </Button>
                </div>
            )}
        </div>
    );
}

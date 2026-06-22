'use client';

import { useMemo, useState } from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
import { Button, Card, EmptyState } from '@/components/UI';
import { useVocabularyGame } from '@/hooks/useAdminVocabulary';
import { getGameItems, getGameMeta, getMatchingPairs, getMemoryCards } from '@/lib/vocabularyGames';
import type { GameType, VocabularyGameItem, VocabularyGameQuery } from '@/types/vocabulary';
import GameHeader from './components/GameHeader';
import GameSetup from './components/GameSetup';
import { MatchingGame, MemoryGame, StandardQuestion, WordChainGame } from './components/GameRounds';
import ResultsScreen from './components/ResultsScreen';
import type { AnswerRecord, ChainMessage, Phase } from './components/types';

const CHAIN_MAX = 20;
const CHAIN_LIVES = 3;

export default function VocabularyGamesPage() {
    const [phase, setPhase] = useState<Phase>('setup');
    const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
    const [query, setQuery] = useState<VocabularyGameQuery>({ count: 10, lang: 'en' });
    const [roundIndex, setRoundIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [feedback, setFeedback] = useState<AnswerRecord | null>(null);
    const [answers, setAnswers] = useState<AnswerRecord[]>([]);
    const [usedWords, setUsedWords] = useState<string[]>([]);
    const [chainWord, setChainWord] = useState<{ word: string; wordId: string; lastLetter: string } | null>(null);
    const [chatLog, setChatLog] = useState<ChainMessage[]>([]);
    const [lives, setLives] = useState(CHAIN_LIVES);

    const { game, isLoading, isFetching, refetch, checkAnswer, isChecking, validateWordChain, isValidatingWordChain } = useVocabularyGame(phase === 'playing' ? selectedGame : null, phase === 'playing' ? query : undefined);
    const meta = getGameMeta(selectedGame);
    const items = useMemo(() => getGameItems(game), [game]);
    const pairs = useMemo(() => getMatchingPairs(game), [game]);
    const cards = useMemo(() => getMemoryCards(game), [game]);
    const current = items[roundIndex] ?? null;
    const totalCorrect = answers.filter((answer) => answer.correct).length;
    const totalXP = answers.reduce((sum, answer) => sum + answer.xp, 0);
    const totalQ = selectedGame === 'word_chain' ? CHAIN_MAX : selectedGame === 'matching' || selectedGame === 'memory_cards' ? 1 : items.length;
    const progress = selectedGame === 'word_chain' ? Math.min(1, totalCorrect / CHAIN_MAX) : Math.min(1, answers.length / Math.max(1, totalQ));
    const isBusy = isChecking || isValidatingWordChain;
    const firstChainWord = selectedGame === 'word_chain' && items[0]?.word ? { word: items[0].word, wordId: items[0].wordId ?? '', lastLetter: items[0].lastLetter ?? items[0].word.slice(-1) } : null;
    const activeChainWord = chainWord ?? firstChainWord;
    const activeChatLog = chatLog.length > 0 ? chatLog : firstChainWord ? [{ speaker: 'computer' as const, word: firstChainWord.word }] : [];

    const resetSession = () => {
        setRoundIndex(0);
        setCurrentAnswer('');
        setFeedback(null);
        setAnswers([]);
        setUsedWords([]);
        setChainWord(null);
        setChatLog([]);
        setLives(CHAIN_LIVES);
    };

    const chooseGame = (gameType: GameType) => {
        const nextMeta = getGameMeta(gameType);
        setSelectedGame(gameType);
        resetSession();
    };

    const startGame = () => {
        resetSession();
        setPhase('playing');
    };

    const restart = () => {
        resetSession();
        refetch();
        setPhase('playing');
    };

    const submit = async (value?: string) => {
        if (!selectedGame || feedback) return;
        const trimmed = (typeof value === 'string' ? value : currentAnswer).trim();
        if (!trimmed) return;

        let record: AnswerRecord;
        if (selectedGame === 'word_chain') {
            if (!activeChainWord) return;
            const result = await validateWordChain({
                previousWord: activeChainWord.word,
                userWord: trimmed,
                usedWords,
                cefrLevel: query.cefrLevel || undefined,
            });
            const nextWord = result.nextWord ?? '';
            if (result.valid && nextWord) {
                setChainWord({ word: nextWord, wordId: result.nextWordId ?? '', lastLetter: nextWord.slice(-1) });
                setChatLog((previous) => [...previous, { speaker: 'user', word: trimmed, valid: true }, { speaker: 'computer', word: nextWord }]);
                setUsedWords((previous) => [...previous, trimmed, nextWord]);
            } else {
                setChatLog((previous) => [...previous, { speaker: 'user', word: trimmed, valid: false }]);
                setLives((previous) => Math.max(0, previous - 1));
                setUsedWords((previous) => [...previous, trimmed]);
            }
            record = {
                item: { word: activeChainWord.word, wordId: activeChainWord.wordId, lastLetter: activeChainWord.lastLetter },
                userAnswer: trimmed,
                correct: result.valid,
                correctAnswer: nextWord,
                xp: result.score ?? 0,
                explanation: result.reason,
            };
        } else {
            if (!current) return;
            const result = await checkAnswer({
                gameType: selectedGame,
                wordId: current.wordId,
                word: current.word,
                userAnswer: trimmed,
                lang: (query.lang as string) || 'en',
            });
            record = {
                item: current,
                userAnswer: trimmed,
                correct: result.correct,
                correctAnswer: result.correctAnswer,
                xp: result.xp ?? 0,
                explanation: result.explanation,
            };
        }

        setFeedback(record);
        setAnswers((previous) => [...previous, record]);
    };

    const submitSpecial = (record: AnswerRecord) => {
        setFeedback(record);
        setAnswers((previous) => [...previous, record]);
        setPhase('finished');
    };

    const handleNext = () => {
        if (selectedGame === 'word_chain') {
            if (lives === 0 || totalCorrect >= CHAIN_MAX) {
                setPhase('finished');
                return;
            }
        } else if (roundIndex + 1 >= items.length) {
            setPhase('finished');
            return;
        } else {
            setRoundIndex((value) => value + 1);
        }
        setCurrentAnswer('');
        setFeedback(null);
    };

    const subtitle = phase === 'setup' ? 'Pick a game type first, then the app loads that exact backend game.' : selectedGame === 'word_chain' ? `Word Chain · ${totalCorrect} words correct · ${lives} lives` : `${meta?.title ?? 'Game'} · ${answers.length} / ${totalQ}`;

    if (phase === 'finished') {
        return (
            <ResultsScreen
                answers={answers}
                meta={meta}
                selectedGame={selectedGame}
                onPlayAgain={restart}
                onChooseGame={() => {
                    setPhase('setup');
                    resetSession();
                }}
            />
        );
    }

    return (
        <div className="min-h-screen space-y-5 bg-gray-50 dark:bg-gray-950">
            <GameHeader
                phase={phase}
                selectedGame={selectedGame}
                subtitle={subtitle}
                totalCorrect={totalCorrect}
                totalXP={totalXP}
                onChangeGame={() => {
                    setPhase('setup');
                    resetSession();
                }}
            />

            {phase === 'setup' && <GameSetup selectedGame={selectedGame} onSelectGame={chooseGame} onStart={startGame} />}

            {phase === 'playing' && (
                <div className="space-y-4">
                    <Card variant="default" padding="sm" radius="xl" hoverEffect={false} withCorners={false}>
                        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
                            <span>{subtitle}</span>
                            <span className="font-black text-blue-600">{Math.round(progress * 100)}%</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                            <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${progress * 100}%` }} />
                        </div>
                    </Card>

                    <Card variant="default" padding="lg" radius="xl" hoverEffect={false}>
                        {isLoading || isFetching ? (
                            <div className="flex h-72 flex-col items-center justify-center gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <p className="text-sm text-gray-400">Loading game data...</p>
                            </div>
                        ) : selectedGame === 'matching' ? (
                            <MatchingGame pairs={pairs} onComplete={(correct, total) => submitSpecial({ item: {}, userAnswer: '', correct: true, correctAnswer: '', xp: correct * 10, explanation: `${correct}/${total} pairs matched` })} />
                        ) : selectedGame === 'memory_cards' ? (
                            <MemoryGame cards={cards} onComplete={(correct, total) => submitSpecial({ item: {}, userAnswer: '', correct: true, correctAnswer: '', xp: correct * 10, explanation: `${correct}/${total} pairs found` })} />
                        ) : selectedGame === 'word_chain' ? (
                            <WordChainGame chainWord={activeChainWord} chatLog={activeChatLog} lives={lives} totalCorrect={totalCorrect} answer={currentAnswer} setAnswer={setCurrentAnswer} onSubmit={() => submit()} feedback={feedback} onNext={handleNext} isBusy={isBusy} />
                        ) : !current ? (
                            <EmptyState title="No game data" description="The backend returned no questions for this filter." action={{ children: 'Reload from API', Icon: RotateCcw, onClick: () => refetch() }} />
                        ) : (
                            <StandardQuestion gameType={selectedGame as GameType} item={current as VocabularyGameItem} answer={currentAnswer} setAnswer={setCurrentAnswer} submit={submit} feedback={feedback} onNext={handleNext} isBusy={isBusy} />
                        )}
                    </Card>

                    <Button variant="ghost" tone="neutral" Icon={RotateCcw} onClick={() => refetch()}>
                        Reload from API
                    </Button>
                </div>
            )}
        </div>
    );
}

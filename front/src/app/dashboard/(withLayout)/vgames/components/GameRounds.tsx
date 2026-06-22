'use client';

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { CheckCircle2, ChevronRight, Loader2, XCircle } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Input } from '@/components/UI';
import { getItemOptions, getItemPrompt, isBuilderGame } from '@/lib/vocabularyGames';
import type { GameType, VocabularyGameItem, VocabularyMatchingPair, VocabularyMemoryCard } from '@/types/vocabulary';
import type { AnswerRecord, ChainMessage } from './types';

export function StandardQuestion({ gameType, item, answer, setAnswer, submit, feedback, onNext, isBusy }: { gameType: GameType; item: VocabularyGameItem; answer: string; setAnswer: (value: string) => void; submit: (value?: string) => void; feedback: AnswerRecord | null; onNext: () => void; isBusy: boolean }) {
    const options = getItemOptions(item);
    const builder = isBuilderGame(gameType);

    return (
        <div className="mx-auto max-w-3xl space-y-5">
            <div>
                <Badge tone="primary">{gameType.replace(/_/g, ' ')}</Badge>
                <h2 className="mt-3 text-2xl font-black text-gray-950 dark:text-white">{getItemPrompt(gameType, item)}</h2>
                {item.hint && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Hint: {item.hint}</p>}
            </div>

            {gameType === 'translation_input' ? (
                <LetterBoxSpelling key={item.wordId ?? item.word ?? getItemPrompt(gameType, item)} item={item} onSubmit={submit} disabled={isBusy || Boolean(feedback)} />
            ) : builder ? (
                <BuilderAnswer options={options} answer={answer} setAnswer={setAnswer} submit={submit} disabled={isBusy || Boolean(feedback)} />
            ) : options.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                    {options.map((option, index) => (
                        <Button key={`${option}-${index}`} variant="outline" tone="neutral" className="h-auto justify-start whitespace-normal py-4 text-left" disabled={isBusy || Boolean(feedback)} onClick={() => submit(option)}>
                            {option}
                        </Button>
                    ))}
                </div>
            ) : (
                <div className="flex gap-2">
                    <Input value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submit()} placeholder="Type your answer..." disabled={isBusy || Boolean(feedback)} />
                    <Button loading={isBusy} disabled={!answer.trim() || Boolean(feedback)} onClick={() => submit()}>
                        Check
                    </Button>
                </div>
            )}

            {feedback && <FeedbackCard feedback={feedback} onNext={onNext} />}
        </div>
    );
}

function BuilderAnswer({ options, answer, setAnswer, submit, disabled }: { options: string[]; answer: string; setAnswer: (value: string) => void; submit: (value?: string) => void; disabled: boolean }) {
    return (
        <div className="space-y-4">
            <Card variant="soft" padding="sm" hoverEffect={false} withCorners={false}>
                <p className="min-h-8 text-sm font-bold text-gray-950 dark:text-white">{answer || 'Tap words in the correct order...'}</p>
            </Card>
            <div className="flex flex-wrap gap-2">
                {options.map((option, index) => (
                    <Button key={`${option}-${index}`} size="sm" variant="soft" disabled={disabled} onClick={() => setAnswer(answer ? `${answer} ${option}` : option)}>
                        {option}
                    </Button>
                ))}
                <Button size="sm" variant="outline" tone="neutral" disabled={disabled} onClick={() => setAnswer('')}>
                    Clear
                </Button>
                <Button size="sm" disabled={!answer.trim() || disabled} onClick={() => submit()}>
                    Check
                </Button>
            </div>
        </div>
    );
}

function LetterBoxSpelling({ item, onSubmit, disabled }: { item: VocabularyGameItem; onSubmit: (word: string) => void; disabled: boolean }) {
    const boxCount = Math.max(3, item.hint?.replace(/\s/g, '').length ?? item.word?.length ?? 6);
    const [letters, setLetters] = useState<string[]>(() => Array(boxCount).fill(''));
    const refs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        setTimeout(() => refs.current[0]?.focus(), 50);
    }, []);

    const setLetter = (index: number, value: string) => {
        const char = value
            .replace(/[^a-z]/gi, '')
            .slice(-1)
            .toLowerCase();
        const next = [...letters];
        next[index] = char;
        setLetters(next);
        if (char && index < boxCount - 1) refs.current[index + 1]?.focus();
    };

    const onKeyDown = (index: number, event: ReactKeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Backspace' && !letters[index] && index > 0) refs.current[index - 1]?.focus();
        if (event.key === 'Enter') onSubmit(letters.join(''));
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {letters.map((letter, index) => (
                    <input
                        key={index}
                        ref={(node) => {
                            refs.current[index] = node;
                        }}
                        value={letter}
                        disabled={disabled}
                        onChange={(event) => setLetter(index, event.target.value)}
                        onKeyDown={(event) => onKeyDown(index, event)}
                        className="h-12 w-10 rounded-xl border border-gray-300 bg-white text-center text-lg font-black uppercase text-gray-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    />
                ))}
            </div>
            <Button disabled={disabled || letters.some((letter) => !letter)} onClick={() => onSubmit(letters.join(''))}>
                Check spelling
            </Button>
        </div>
    );
}

export function WordChainGame({ chainWord, chatLog, lives, totalCorrect, answer, setAnswer, onSubmit, feedback, onNext, isBusy }: { chainWord: { word: string; lastLetter: string } | null; chatLog: ChainMessage[]; lives: number; totalCorrect: number; answer: string; setAnswer: (value: string) => void; onSubmit: () => void; feedback: AnswerRecord | null; onNext: () => void; isBusy: boolean }) {
    const lastLetter = chainWord?.lastLetter?.toUpperCase() ?? '?';

    return (
        <div className="mx-auto max-w-2xl space-y-4">
            <Card variant="soft" padding="sm" hoverEffect={false} withCorners={false}>
                <div className="flex items-center justify-between gap-3">
                    <Badge tone="danger">Lives: {lives}</Badge>
                    <Badge tone="primary">Correct: {totalCorrect}</Badge>
                </div>
            </Card>
            <div className="max-h-72 space-y-2 overflow-y-auto rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/50">
                {!chainWord && (
                    <p className="text-center text-sm text-gray-400">
                        <Loader2 className="inline h-4 w-4 animate-spin" /> Loading first word...
                    </p>
                )}
                {chatLog.map((message, index) => (
                    <div key={`${message.word}-${index}`} className={`flex ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs rounded-2xl px-4 py-2.5 ${message.speaker === 'computer' ? 'rounded-tl-none bg-blue-600 text-white' : message.valid === false ? 'rounded-tr-none bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'rounded-tr-none bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'}`}>
                            <p className="text-xs font-semibold opacity-75">{message.speaker === 'computer' ? 'Computer' : 'You'}</p>
                            <p className="text-lg font-black">{message.word}</p>
                        </div>
                    </div>
                ))}
            </div>
            {!feedback && chainWord && (
                <div className="flex gap-2">
                    <Input value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && onSubmit()} placeholder={`Word starting with "${lastLetter}"...`} />
                    <Button loading={isBusy} disabled={!answer.trim()} iconRight={ChevronRight} onClick={onSubmit}>
                        Check
                    </Button>
                </div>
            )}
            {feedback && <FeedbackCard feedback={feedback} onNext={onNext} />}
        </div>
    );
}

export function MatchingGame({ pairs, onComplete }: { pairs: VocabularyMatchingPair[]; onComplete: (correct: number, total: number) => void }) {
    if (!pairs.length) return <EmptyState title="No matching pairs" description="The backend returned no pairs for this filter." />;
    return (
        <div className="mx-auto max-w-4xl space-y-5">
            <h2 className="text-2xl font-black text-gray-950 dark:text-white">Match Words With Meanings</h2>
            <div className="grid gap-3 md:grid-cols-2">
                {pairs.map((pair) => (
                    <Card key={pair.wordId} variant="soft" padding="sm" radius="xl" hoverEffect={false} withCorners={false}>
                        <p className="font-black text-gray-950 dark:text-white">{pair.word}</p>
                        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{pair.definition}</p>
                    </Card>
                ))}
            </div>
            <Button onClick={() => onComplete(pairs.length, pairs.length)}>I matched them</Button>
        </div>
    );
}

export function MemoryGame({ cards, onComplete }: { cards: VocabularyMemoryCard[]; onComplete: (correct: number, total: number) => void }) {
    const [revealed, setRevealed] = useState<Set<number>>(new Set());
    if (!cards.length) return <EmptyState title="No memory cards" description="The backend returned no cards for this filter." />;
    return (
        <div className="mx-auto max-w-5xl space-y-5">
            <h2 className="text-2xl font-black text-gray-950 dark:text-white">Memory Cards</h2>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {cards.map((card, index) => {
                    const open = revealed.has(index);
                    return (
                        <button key={`${card.id}-${card.type}-${index}`} onClick={() => setRevealed((previous) => new Set(previous).add(index))}>
                            <Card variant={open ? 'gradient' : 'soft'} padding="md" radius="xl" hoverEffect withCorners={false} className="min-h-28">
                                <p className="text-center text-sm font-black text-gray-950 dark:text-white">{open ? card.content : '?'}</p>
                            </Card>
                        </button>
                    );
                })}
            </div>
            <Button onClick={() => onComplete(Math.floor(cards.length / 2), Math.floor(cards.length / 2))}>Finish memory game</Button>
        </div>
    );
}

export function FeedbackCard({ feedback, onNext }: { feedback: AnswerRecord; onNext: () => void }) {
    return (
        <Card variant={feedback.correct ? 'soft' : 'outline'} padding="sm" radius="xl" hoverEffect={false} withCorners={false} className={feedback.correct ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10'}>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className={`flex items-center gap-2 text-sm font-black ${feedback.correct ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                    {feedback.correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {feedback.correct ? `Correct! +${feedback.xp} XP` : `Not quite. Correct answer: ${feedback.correctAnswer || 'Check again'}`}
                </p>
                <Button size="sm" onClick={onNext}>
                    Next
                </Button>
            </div>
            {feedback.explanation && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{feedback.explanation}</p>}
        </Card>
    );
}

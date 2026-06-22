'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpenText, Brain, Calendar, Gamepad2, Headphones, ImageIcon, Layers3, Loader2, Tags, Volume2 } from 'lucide-react';
import { useVocabularyWord } from '@/hooks/useAdminVocabulary';
import type { VocabularyTranslation, VocabularyWord } from '@/types/vocabulary';

const firstTranslation = (word: VocabularyWord): VocabularyTranslation | undefined => word.translations?.en ?? Object.values(word.translations ?? {})[0];

const formatDate = (value?: string) => {
    if (!value) return 'Not available';
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
};

function PillList({ title, items, tone = 'blue' }: { title: string; items?: string[]; tone?: 'blue' | 'emerald' | 'rose' | 'gray' }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/25 dark:text-blue-300',
        emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300',
        rose: 'bg-rose-50 text-rose-700 dark:bg-rose-900/25 dark:text-rose-300',
        gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    };

    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{title}</p>
            <div className="mt-3 flex flex-wrap gap-2">
                {items?.length ? (
                    items.map((item) => (
                        <span key={item} className={`rounded-full px-3 py-1 text-xs font-bold ${colors[tone]}`}>
                            {item}
                        </span>
                    ))
                ) : (
                    <span className="text-sm text-gray-400">No items added.</span>
                )}
            </div>
        </section>
    );
}

export default function VocabularyDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const id = params?.id ?? '';
    const { word, isLoading, refetch } = useVocabularyWord(id);

    if (isLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!word) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="text-center">
                    <p className="text-sm text-gray-500">Vocabulary word was not found.</p>
                    <button onClick={() => router.push('/dashboard/vocabulary')} className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">
                        Back to vocabulary
                    </button>
                </div>
            </div>
        );
    }

    const translation = firstTranslation(word);
    const examples = translation?.exampleSentences ?? [];

    return (
        <div className="min-h-screen space-y-5 bg-gray-50 dark:bg-gray-950">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <button onClick={() => router.back()} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <div className="flex items-center gap-2">
                    <button onClick={() => refetch()} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                        Refresh
                    </button>
                    <Link href="/dashboard/vocabulary/games" className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700">
                        <Gamepad2 className="h-4 w-4" /> Practice
                    </Link>
                </div>
            </div>

            <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="p-6 lg:p-8">
                        <div className="mb-5 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{word.cefrLevel}</span>
                            {word.partsOfSpeech?.map((part) => (
                                <span key={part} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                    {part}
                                </span>
                            ))}
                            {word.isPremium && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Premium</span>}
                        </div>

                        <h1 className="text-5xl font-black tracking-normal text-gray-900 dark:text-white">{word.word}</h1>
                        {word.phonetic && <p className="mt-2 text-lg font-semibold text-gray-400">{word.phonetic}</p>}

                        <div className="mt-6 flex flex-wrap gap-2">
                            {word.audioUrl && (
                                <button onClick={() => new Audio(word.audioUrl).play()} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white">
                                    <Headphones className="h-4 w-4" /> Play audio
                                </button>
                            )}
                            <Link href={`/dashboard/vocabulary/games?word=${word._id}`} className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 dark:border-gray-700 dark:text-gray-200">
                                <Brain className="h-4 w-4" /> Train this word
                            </Link>
                        </div>

                        <div className="mt-8 space-y-5">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Meaning</p>
                                <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{translation?.translation || 'No translation added'}</p>
                                <p className="mt-2 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">{translation?.definition || 'No definition has been provided yet.'}</p>
                            </div>

                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Example Sentences</p>
                                <div className="mt-3 space-y-2">
                                    {examples.length ? (
                                        examples.map((sentence, index) => (
                                            <p key={`${sentence}-${index}`} className="rounded-2xl bg-gray-50 p-4 text-sm italic leading-7 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                {sentence}
                                            </p>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-400">No examples added.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <aside className="border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-950 lg:border-l lg:border-t-0">
                        <div className="space-y-4">
                            {word.imageUrl ? (
                                <img src={word.imageUrl} alt={word.word} className="aspect-video w-full rounded-2xl object-cover ring-1 ring-gray-200 dark:ring-gray-800" />
                            ) : (
                                <div className="flex aspect-video items-center justify-center rounded-2xl bg-white text-gray-300 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
                                    <ImageIcon className="h-10 w-10" />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <InfoTile icon={<Layers3 className="h-4 w-4" />} label="Category" value={word.categories?.join(', ') || 'general'} />
                                <InfoTile icon={<Tags className="h-4 w-4" />} label="Tags" value={word.tags?.length ? `${word.tags.length} tag(s)` : 'None'} />
                                <InfoTile icon={<BookOpenText className="h-4 w-4" />} label="Status" value={word.isPublished ? 'Published' : 'Draft'} />
                                <InfoTile icon={<Calendar className="h-4 w-4" />} label="Updated" value={formatDate(word.updatedAt)} />
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-3">
                <PillList title="Synonyms" items={word.synonyms} tone="emerald" />
                <PillList title="Antonyms" items={word.antonyms} tone="rose" />
                <PillList title="Related Words" items={word.relatedWords} tone="blue" />
            </div>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-blue-500" />
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Game Sentences</p>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {word.gameSentences?.length ? (
                        word.gameSentences.map((sentence, index) => (
                            <div key={`${sentence.sentence}-${index}`} className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{sentence.sentence}</p>
                                <p className="mt-2 text-xs text-gray-400">Answer: {sentence.answer}</p>
                                {sentence.hint && <p className="mt-1 text-xs text-blue-500">Hint: {sentence.hint}</p>}
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-400">No game sentences added for this word.</p>
                    )}
                </div>
            </section>
        </div>
    );
}

function InfoTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-gray-400">
                {icon}
                <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
            </div>
            <p className="mt-2 text-sm font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    );
}

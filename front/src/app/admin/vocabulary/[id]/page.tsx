'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpenText, Calendar, CheckCircle2, Copy, Edit3, Globe2, Headphones, ImageIcon, Languages, Loader2, RotateCcw, Tag, Trash2, XCircle } from 'lucide-react';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useAdminVocabularyWord } from '@/hooks/useAdminVocabulary';
import type { VocabularyTranslation, VocabularyWord } from '@/types/vocabulary';

const formatDateTime = (value?: string) => {
    if (!value) return 'Not available';
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
};

const translationEntries = (word: VocabularyWord): Array<[string, VocabularyTranslation]> => Object.entries(word.translations ?? {}) as Array<[string, VocabularyTranslation]>;

export default function AdminVocabularyDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const id = params?.id ?? '';
    const { word, isLoading, refetch, remove, isDeleting, restore, isRestoring } = useAdminVocabularyWord(id);

    const copyId = async () => {
        if (word?._id) await navigator.clipboard.writeText(word._id);
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex min-h-[70vh] items-center justify-center">
                    <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
                </div>
            </AdminLayout>
        );
    }

    if (!word) {
        return (
            <AdminLayout>
                <div className="flex min-h-[70vh] items-center justify-center">
                    <div className="text-center">
                        <p className="text-sm text-gray-500">Vocabulary word was not found.</p>
                        <button onClick={() => router.push('/admin/vocabulary')} className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">
                            Back to vocabulary
                        </button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const translations = translationEntries(word);

    return (
        <AdminLayout>
            <div className="min-h-screen space-y-5 bg-gray-50 dark:bg-gray-950">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <button onClick={() => router.back()} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                        <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => refetch()} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                            <RotateCcw className="h-4 w-4" /> Refresh
                        </button>
                        <button onClick={copyId} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                            <Copy className="h-4 w-4" /> Copy ID
                        </button>
                        <Link href="/admin/vocabulary" className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700">
                            <Edit3 className="h-4 w-4" /> Manage
                        </Link>
                        {word.isDeleted ? (
                            <button onClick={() => restore()} disabled={isRestoring} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                                <RotateCcw className="h-4 w-4" /> Restore
                            </button>
                        ) : (
                            <button onClick={() => remove('Deleted from detail page')} disabled={isDeleting} className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                                <Trash2 className="h-4 w-4" /> Delete
                            </button>
                        )}
                    </div>
                </div>

                <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                    <div className="grid gap-0 xl:grid-cols-[1.25fr_0.75fr]">
                        <div className="p-6 lg:p-8">
                            <div className="mb-5 flex flex-wrap items-center gap-2">
                                <StatusBadge ok={word.isPublished} trueLabel="Published" falseLabel="Draft" />
                                <StatusBadge ok={!word.isDeleted} trueLabel="Active" falseLabel="Deleted" />
                                {word.isPremium && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Premium</span>}
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{word.cefrLevel}</span>
                            </div>

                            <h1 className="text-4xl font-black text-gray-900 dark:text-white">{word.word}</h1>
                            <p className="mt-2 text-sm text-gray-400">{word.phonetic || 'No phonetic transcription'}</p>

                            <div className="mt-6 flex flex-wrap gap-2">
                                {word.partsOfSpeech?.map((part) => (
                                    <span key={part} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                        {part}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-8 grid gap-4 md:grid-cols-2">
                                <MetaCard icon={<BookOpenText className="h-4 w-4" />} label="Word ID" value={word._id} />
                                <MetaCard icon={<Calendar className="h-4 w-4" />} label="Created" value={formatDateTime(word.createdAt)} />
                                <MetaCard icon={<Calendar className="h-4 w-4" />} label="Updated" value={formatDateTime(word.updatedAt)} />
                                <MetaCard icon={<Languages className="h-4 w-4" />} label="Languages" value={translations.map(([lang]) => lang.toUpperCase()).join(', ') || 'None'} />
                            </div>
                        </div>

                        <aside className="border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-950 xl:border-l xl:border-t-0">
                            {word.imageUrl ? (
                                <img src={word.imageUrl} alt={word.word} className="aspect-video w-full rounded-2xl object-cover ring-1 ring-gray-200 dark:ring-gray-800" />
                            ) : (
                                <div className="flex aspect-video items-center justify-center rounded-2xl bg-white text-gray-300 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
                                    <ImageIcon className="h-10 w-10" />
                                </div>
                            )}
                            {word.audioUrl && (
                                <button onClick={() => new Audio(word.audioUrl).play()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white">
                                    <Headphones className="h-4 w-4" /> Play audio
                                </button>
                            )}
                        </aside>
                    </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-2">
                    {translations.length ? (
                        translations.map(([lang, translation]) => (
                            <div key={lang} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <Globe2 className="h-4 w-4 text-blue-500" />
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{lang} Translation</p>
                                </div>
                                <p className="text-lg font-black text-gray-900 dark:text-white">{translation.translation || 'No translation'}</p>
                                <p className="mt-2 text-sm leading-7 text-gray-500 dark:text-gray-400">{translation.definition || 'No definition provided.'}</p>
                                <div className="mt-4 space-y-2">
                                    {translation.exampleSentences?.length ? (
                                        translation.exampleSentences.map((sentence, index) => (
                                            <p key={`${lang}-${index}`} className="rounded-xl bg-gray-50 p-3 text-sm italic text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                {sentence}
                                            </p>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-400">No examples added.</p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-400 dark:border-gray-700">No translations added.</div>
                    )}
                </section>

                <section className="grid gap-4 lg:grid-cols-3">
                    <ListCard title="Synonyms" items={word.synonyms} />
                    <ListCard title="Antonyms" items={word.antonyms} />
                    <ListCard title="Related Words" items={word.relatedWords} />
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                    <div className="mb-4 flex items-center gap-2">
                        <Tag className="h-4 w-4 text-blue-500" />
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Categories and Tags</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {[...(word.categories ?? []), ...(word.tags ?? [])].map((item) => (
                            <span key={item} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                {item}
                            </span>
                        ))}
                        {!word.categories?.length && !word.tags?.length && <span className="text-sm text-gray-400">No categories or tags.</span>}
                    </div>
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Game Sentences</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {word.gameSentences?.length ? (
                            word.gameSentences.map((sentence, index) => (
                                <div key={`${sentence.sentence}-${index}`} className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{sentence.sentence}</p>
                                    <p className="mt-2 text-xs text-gray-400">Answer: {sentence.answer}</p>
                                    {sentence.hint && <p className="mt-1 text-xs text-blue-500">Hint: {sentence.hint}</p>}
                                    {sentence.audioUrl && <p className="mt-1 truncate text-xs text-gray-400">Audio: {sentence.audioUrl}</p>}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400">No game sentences added.</p>
                        )}
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}

function StatusBadge({ ok, trueLabel, falseLabel }: { ok: boolean; trueLabel: string; falseLabel: string }) {
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${ok ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
            {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
            {ok ? trueLabel : falseLabel}
        </span>
    );
}

function MetaCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
            <div className="flex items-center gap-2 text-gray-400">
                {icon}
                <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
            </div>
            <p className="mt-2 break-all text-sm font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    );
}

function ListCard({ title, items }: { title: string; items?: string[] }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{title}</p>
            <div className="mt-3 flex flex-wrap gap-2">
                {items?.length ? (
                    items.map((item) => (
                        <span key={item} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/25 dark:text-blue-300">
                            {item}
                        </span>
                    ))
                ) : (
                    <span className="text-sm text-gray-400">No items added.</span>
                )}
            </div>
        </div>
    );
}

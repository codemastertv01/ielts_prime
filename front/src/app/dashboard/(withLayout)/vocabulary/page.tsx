'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BookOpenText, Download, Eye, Gamepad2, Headphones, Loader2, Search, X } from 'lucide-react';
import { CEFR_LEVELS, WORD_CATEGORIES, type CefrLevel, type VocabularyFilters, type VocabularyWord, type WordCategory } from '@/types/vocabulary';
import { useVocabulary } from '@/hooks/useAdminVocabulary';

function exportVocabulary(words: VocabularyWord[]) {
    const rows = words
        .map((item, index) => {
            const translation = item.translations?.en ?? Object.values(item.translations ?? {})[0];
            return `<tr><td>${index + 1}</td><td><strong>${item.word}</strong><br/><small>${item.phonetic ?? ''}</small></td><td>${item.cefrLevel}</td><td>${translation?.translation ?? ''}</td><td>${translation?.definition ?? ''}</td><td>${translation?.exampleSentences?.[0] ?? ''}</td></tr>`;
        })
        .join('');
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!doctype html><html><head><title>Vocabulary Sheet</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}button{padding:8px 12px;margin-bottom:16px}table{width:100%;border-collapse:collapse;font-size:12px}td,th{border:1px solid #ddd;padding:8px;vertical-align:top}th{background:#eef2ff;text-align:left}@media print{button{display:none}}</style></head><body><button onclick="window.print()">Print / Save as PDF</button><h1>IELTS Vocabulary Sheet</h1><p>${words.length} words</p><table><thead><tr><th>#</th><th>Word</th><th>Level</th><th>Translation</th><th>Definition</th><th>Example</th></tr></thead><tbody>${rows}</tbody></table></body></html>`);
    win.document.close();
}

export default function VocabularyPage() {
    const [filters, setFilters] = useState<VocabularyFilters>({ page: 1, limit: 24, sortBy: 'word', sortOrder: 'asc' });
    const { words, total, page, totalPages, isLoading, isFetching } = useVocabulary(filters);
    const printableWords = useMemo(() => words.slice(0, Number(filters.limit === 'all' ? words.length : filters.limit ?? 24)), [filters.limit, words]);

    return (
        <div className="min-h-screen space-y-5 bg-gray-50 dark:bg-gray-950">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-black text-gray-900 dark:text-white">
                            <BookOpenText className="h-6 w-6 text-blue-500" /> Vocabulary Practice
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Study words, listen to audio, print vocabulary sheets, and practice with interactive games.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => exportVocabulary(printableWords)} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300">
                            <Download className="h-4 w-4" /> Print / PDF
                        </button>
                        <Link href="/dashboard/vocabulary/games" className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700">
                            <Gamepad2 className="h-4 w-4" /> Play Games
                        </Link>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="grid gap-3 md:grid-cols-5">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input value={filters.search ?? ''} onChange={(event) => setFilters((previous) => ({ ...previous, search: event.target.value, page: 1 }))} placeholder="Search vocabulary..." className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                        {filters.search && (
                            <button onClick={() => setFilters((previous) => ({ ...previous, search: '', page: 1 }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <select value={filters.cefrLevel ?? ''} onChange={(event) => setFilters((previous) => ({ ...previous, cefrLevel: event.target.value as CefrLevel | '', page: 1 }))} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                        <option value="">All levels</option>
                        {CEFR_LEVELS.map((level) => (
                            <option key={level}>{level}</option>
                        ))}
                    </select>
                    <select value={filters.category ?? ''} onChange={(event) => setFilters((previous) => ({ ...previous, category: event.target.value as WordCategory | '', page: 1 }))} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                        <option value="">All categories</option>
                        {WORD_CATEGORIES.map((category) => (
                            <option key={category}>{category}</option>
                        ))}
                    </select>
                    <select value={String(filters.limit ?? 24)} onChange={(event) => setFilters((previous) => ({ ...previous, limit: event.target.value === 'all' ? 'all' : Number(event.target.value), page: 1 }))} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                        <option value="24">24 words</option>
                        <option value="100">100 words</option>
                        <option value="1000">1000 words</option>
                        <option value="all">All words</option>
                    </select>
                </div>
            </section>

            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {words.map((item) => {
                        const translation = item.translations?.en ?? Object.values(item.translations ?? {})[0];
                        return (
                            <article key={item._id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 dark:text-white">{item.word}</h2>
                                        <p className="text-sm text-gray-400">{item.phonetic || item.partsOfSpeech?.join(', ')}</p>
                                    </div>
                                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{item.cefrLevel}</span>
                                </div>
                                <p className="mt-4 text-sm font-semibold text-gray-700 dark:text-gray-200">{translation?.translation || 'No translation'}</p>
                                <p className="mt-1 line-clamp-3 text-sm leading-6 text-gray-500 dark:text-gray-400">{translation?.definition || 'No definition provided.'}</p>
                                {translation?.exampleSentences?.[0] && <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm italic text-gray-500 dark:bg-gray-800 dark:text-gray-300">{translation.exampleSentences[0]}</p>}
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xs text-gray-400">{item.categories?.join(', ') || 'general'}</span>
                                    <div className="flex items-center gap-2">
                                        <Link href={`/dashboard/vocabulary/${item._id}`} className="rounded-lg bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                        {item.audioUrl && (
                                            <button onClick={() => new Audio(item.audioUrl).play()} className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                                                <Headphones className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                    {words.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-gray-300 p-16 text-center text-gray-400 dark:border-gray-700">No vocabulary words found.</div>}
                </section>
            )}

            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900">
                <span>
                    Page {page} of {totalPages} · Total {total} {isFetching && ' · Updating...'}
                </span>
                <div className="flex gap-2">
                    <button disabled={page <= 1} onClick={() => setFilters((previous) => ({ ...previous, page: Math.max(1, page - 1) }))} className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700">
                        Previous
                    </button>
                    <button disabled={page >= totalPages} onClick={() => setFilters((previous) => ({ ...previous, page: Math.min(totalPages, page + 1) }))} className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700">
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

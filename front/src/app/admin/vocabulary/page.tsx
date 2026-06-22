'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import AdminLayout from '@/components/Layout/AdminLayout';
import { CEFR_LEVELS, PARTS_OF_SPEECH, WORD_CATEGORIES, type CefrLevel, type CreateVocabularyDto, type PartOfSpeech, type VocabularyFilters, type VocabularyWord, type WordCategory } from '@/types/vocabulary';
import { useAdminVocabulary } from '@/hooks/useAdminVocabulary';
import { BookOpenText, Check, Download, Edit3, Eye, FileJson, Filter, Loader2, Plus, RefreshCw, RotateCcw, Search, Trash2, Upload, X } from 'lucide-react';

const emptyTranslation = { translation: '', definition: '', exampleSentences: [''] };

const emptyForm: CreateVocabularyDto = {
    word: '',
    partsOfSpeech: ['n.'],
    cefrLevel: 'B1',
    phonetic: '',
    audioUrl: '',
    imageUrl: '',
    translations: { en: emptyTranslation },
    synonyms: [],
    antonyms: [],
    relatedWords: [],
    categories: ['general'],
    tags: [],
    gameSentences: [],
    isPublished: true,
    isPremium: false,
};

const splitCsv = (value: string) =>
    value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

const joinCsv = (items?: string[]) => (items ?? []).join(', ');

function normalizeWordForm(word: VocabularyWord): CreateVocabularyDto {
    return {
        word: word.word,
        partsOfSpeech: word.partsOfSpeech?.length ? word.partsOfSpeech : ['n.'],
        cefrLevel: word.cefrLevel ?? 'B1',
        phonetic: word.phonetic ?? '',
        audioUrl: word.audioUrl ?? '',
        imageUrl: word.imageUrl ?? '',
        translations: word.translations?.en ? word.translations : { en: emptyTranslation },
        synonyms: word.synonyms ?? [],
        antonyms: word.antonyms ?? [],
        relatedWords: word.relatedWords ?? [],
        categories: word.categories?.length ? word.categories : ['general'],
        tags: word.tags ?? [],
        gameSentences: word.gameSentences ?? [],
        isPublished: word.isPublished ?? true,
        isPremium: word.isPremium ?? false,
    };
}

function printableVocabulary(words: VocabularyWord[]) {
    const rows = words
        .map((item, index) => {
            const translation = item.translations?.en ?? Object.values(item.translations ?? {})[0];
            return `<tr><td>${index + 1}</td><td><strong>${item.word}</strong><br/><small>${item.phonetic ?? ''}</small></td><td>${item.partsOfSpeech?.join(', ') ?? ''}</td><td>${item.cefrLevel}</td><td>${translation?.translation ?? ''}</td><td>${translation?.definition ?? ''}</td></tr>`;
        })
        .join('');
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!doctype html><html><head><title>Vocabulary Export</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}h1{margin:0 0 12px}table{width:100%;border-collapse:collapse;font-size:12px}td,th{border:1px solid #ddd;padding:8px;vertical-align:top}th{background:#f3f4f6;text-align:left}@media print{button{display:none}}</style></head><body><button onclick="window.print()">Print / Save as PDF</button><h1>IELTS Prime Vocabulary</h1><p>${words.length} words</p><table><thead><tr><th>#</th><th>Word</th><th>Part</th><th>Level</th><th>Translation</th><th>Definition</th></tr></thead><tbody>${rows}</tbody></table></body></html>`);
    win.document.close();
}

export default function AdminVocabularyPage() {
    const [filters, setFilters] = useState<VocabularyFilters>({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' });
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [editing, setEditing] = useState<VocabularyWord | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [bulkOpen, setBulkOpen] = useState(false);

    const { words, total, totalPages, page, isLoading, isFetching, refetch, create, update, bulkCreate, bulkDelete, bulkRestore, isCreating, isUpdating, isBulkCreating, isBulkDeleting, isBulkRestoring } = useAdminVocabulary(filters);

    const selectedWords = useMemo(() => words.filter((item) => selected.has(item._id)), [selected, words]);
    const activeFilters = Object.entries(filters).filter(([key, value]) => !['page', 'limit', 'sortBy', 'sortOrder'].includes(key) && value !== '' && value !== undefined && value !== false).length;

    const toggleSelected = (id: string) =>
        setSelected((previous) => {
            const next = new Set(previous);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    return (
        <AdminLayout>
            <div className="min-h-screen space-y-5 bg-gray-50 dark:bg-gray-950">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-black text-gray-900 dark:text-white">
                            <BookOpenText className="h-6 w-6 text-blue-500" /> Vocabulary
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage words, translations, audio, images, games, and printable vocabulary sheets.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => refetch()} className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => setShowFilters((value) => !value)} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${showFilters || activeFilters ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'}`}>
                            <Filter className="h-4 w-4" /> Filters {activeFilters > 0 && <span className="rounded-full bg-white/20 px-1.5 text-xs">{activeFilters}</span>}
                        </button>
                        <button onClick={() => printableVocabulary(selectedWords.length ? selectedWords : words)} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                            <Download className="h-4 w-4" /> PDF
                        </button>
                        <button onClick={() => setBulkOpen(true)} className="flex items-center gap-2 rounded-xl bg-violet-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700">
                            <FileJson className="h-4 w-4" /> JSON Import
                        </button>
                        <button
                            onClick={() => {
                                setEditing(null);
                                setFormOpen(true);
                            }}
                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" /> New Word
                        </button>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                    {[
                        ['Total', total],
                        ['Current page', words.length],
                        ['Selected', selected.size],
                        ['Published', words.filter((item) => item.isPublished).length],
                    ].map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
                            <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{value}</p>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input value={filters.search ?? ''} onChange={(event) => setFilters((previous) => ({ ...previous, search: event.target.value, page: 1 }))} placeholder="Search word, translation, definition, tags..." className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-500/40 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                        {filters.search && (
                            <button onClick={() => setFilters((previous) => ({ ...previous, search: '', page: 1 }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {showFilters && (
                    <div className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 sm:grid-cols-2 lg:grid-cols-6">
                        <SelectFilter label="Level" value={filters.cefrLevel ?? ''} options={CEFR_LEVELS} onChange={(value) => setFilters((previous) => ({ ...previous, cefrLevel: value as CefrLevel | '', page: 1 }))} />
                        <SelectFilter label="Part" value={filters.partOfSpeech ?? ''} options={PARTS_OF_SPEECH} onChange={(value) => setFilters((previous) => ({ ...previous, partOfSpeech: value as PartOfSpeech | '', page: 1 }))} />
                        <SelectFilter label="Category" value={filters.category ?? ''} options={WORD_CATEGORIES} onChange={(value) => setFilters((previous) => ({ ...previous, category: value as WordCategory | '', page: 1 }))} />
                        <SelectFilter label="Published" value={String(filters.isPublished ?? '')} options={['true', 'false']} labels={{ true: 'Published', false: 'Draft' }} onChange={(value) => setFilters((previous) => ({ ...previous, isPublished: value === '' ? '' : value === 'true', page: 1 }))} />
                        <SelectFilter label="Premium" value={String(filters.isPremium ?? '')} options={['true', 'false']} labels={{ true: 'Premium', false: 'Free' }} onChange={(value) => setFilters((previous) => ({ ...previous, isPremium: value === '' ? '' : value === 'true', page: 1 }))} />
                        <SelectFilter label="Limit" value={String(filters.limit ?? 20)} options={['20', '50', '100', '200', 'all']} onChange={(value) => setFilters((previous) => ({ ...previous, limit: value === 'all' ? 'all' : Number(value), page: 1 }))} />
                    </div>
                )}

                {selected.size > 0 && (
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{selected.size} selected</span>
                        <button onClick={() => bulkDelete({ ids: Array.from(selected) })} disabled={isBulkDeleting} className="ml-auto flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                        <button onClick={() => bulkRestore(Array.from(selected))} disabled={isBulkRestoring} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">
                            <RotateCcw className="h-3.5 w-3.5" /> Restore
                        </button>
                        <button onClick={() => setSelected(new Set())} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
                            Clear
                        </button>
                    </div>
                )}

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                    {isLoading ? (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:bg-gray-800/70">
                                    <tr>
                                        <th className="w-10 px-4 py-3">
                                            <input type="checkbox" checked={words.length > 0 && selected.size === words.length} onChange={() => setSelected(selected.size === words.length ? new Set() : new Set(words.map((item) => item._id)))} />
                                        </th>
                                        <th className="px-4 py-3 text-left">Word</th>
                                        <th className="px-4 py-3 text-left">Level</th>
                                        <th className="px-4 py-3 text-left">Meaning</th>
                                        <th className="px-4 py-3 text-left">Categories</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {words.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-20 text-center text-gray-400">
                                                No vocabulary words found.
                                            </td>
                                        </tr>
                                    ) : (
                                        words.map((item) => {
                                            const translation = item.translations?.en ?? Object.values(item.translations ?? {})[0];
                                            return (
                                                <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                                                    <td className="px-4 py-3">
                                                        <input type="checkbox" checked={selected.has(item._id)} onChange={() => toggleSelected(item._id)} />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="font-bold text-gray-900 dark:text-white">{item.word}</p>
                                                        <p className="text-xs text-gray-400">{item.phonetic || item.partsOfSpeech?.join(', ')}</p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{item.cefrLevel}</span>
                                                    </td>
                                                    <td className="max-w-sm px-4 py-3">
                                                        <p className="line-clamp-1 font-medium text-gray-700 dark:text-gray-200">{translation?.translation || '-'}</p>
                                                        <p className="line-clamp-1 text-xs text-gray-400">{translation?.definition || '-'}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-gray-500">{item.categories?.join(', ') || '-'}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`rounded-full px-2 py-1 text-xs font-bold ${item.isPublished ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>{item.isPublished ? 'Published' : 'Draft'}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-1">
                                                            <Link href={`/admin/vocabulary/${item._id}`} className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200">
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => {
                                                                    setEditing(item);
                                                                    setFormOpen(true);
                                                                }}
                                                                className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                                                            >
                                                                <Edit3 className="h-4 w-4" />
                                                            </button>
                                                            <button onClick={() => bulkDelete({ ids: [item._id] })} className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm text-gray-500 dark:border-gray-700">
                        <span>
                            Page {page} of {totalPages} · Total {total}
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

                {formOpen && (
                    <VocabularyFormModal
                        initial={editing ? normalizeWordForm(editing) : emptyForm}
                        title={editing ? 'Edit Vocabulary Word' : 'Create Vocabulary Word'}
                        isSaving={isCreating || isUpdating}
                        onClose={() => setFormOpen(false)}
                        onSubmit={(payload) => {
                            if (editing) update({ id: editing._id, data: payload }, { onSuccess: () => setFormOpen(false) });
                            else create(payload, { onSuccess: () => setFormOpen(false) });
                        }}
                    />
                )}
                {bulkOpen && <BulkVocabularyModal isSaving={isBulkCreating} onClose={() => setBulkOpen(false)} onImport={(items) => bulkCreate(items, { onSuccess: () => setBulkOpen(false) })} />}
            </div>
        </AdminLayout>
    );
}

function SelectFilter({ label, value, options, labels, onChange }: { label: string; value: string; options: string[]; labels?: Record<string, string>; onChange: (value: string) => void }) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">{label}</label>
            <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                <option value="">All</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {labels?.[option] ?? option}
                    </option>
                ))}
            </select>
        </div>
    );
}

function VocabularyFormModal({ initial, title, isSaving, onClose, onSubmit }: { initial: CreateVocabularyDto; title: string; isSaving: boolean; onClose: () => void; onSubmit: (value: CreateVocabularyDto) => void }) {
    const [form, setForm] = useState(initial);
    const [synonyms, setSynonyms] = useState(joinCsv(initial.synonyms));
    const [antonyms, setAntonyms] = useState(joinCsv(initial.antonyms));
    const [related, setRelated] = useState(joinCsv(initial.relatedWords));
    const [tags, setTags] = useState(joinCsv(initial.tags));
    const [examples, setExamples] = useState((initial.translations.en?.exampleSentences ?? ['']).join('\n'));
    const translation = form.translations.en ?? emptyTranslation;

    const save = () =>
        onSubmit({
            ...form,
            translations: { ...form.translations, en: { ...translation, exampleSentences: examples.split('\n').map((item) => item.trim()).filter(Boolean) } },
            synonyms: splitCsv(synonyms),
            antonyms: splitCsv(antonyms),
            relatedWords: splitCsv(related),
            tags: splitCsv(tags),
        });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <TextField label="Word" value={form.word} onChange={(value) => setForm((previous) => ({ ...previous, word: value }))} required />
                    <TextField label="Phonetic" value={form.phonetic ?? ''} onChange={(value) => setForm((previous) => ({ ...previous, phonetic: value }))} placeholder="/əˈbændən/" />
                    <SelectField label="CEFR level" value={form.cefrLevel} options={CEFR_LEVELS} onChange={(value) => setForm((previous) => ({ ...previous, cefrLevel: value as CefrLevel }))} />
                    <SelectField label="Part of speech" value={form.partsOfSpeech[0] ?? 'n.'} options={PARTS_OF_SPEECH} onChange={(value) => setForm((previous) => ({ ...previous, partsOfSpeech: [value as PartOfSpeech] }))} />
                    <SelectField label="Category" value={form.categories?.[0] ?? 'general'} options={WORD_CATEGORIES} onChange={(value) => setForm((previous) => ({ ...previous, categories: [value as WordCategory] }))} />
                    <TextField label="Tags" value={tags} onChange={setTags} placeholder="ielts, academic, band7" />
                    <TextField label="Audio URL" value={form.audioUrl ?? ''} onChange={(value) => setForm((previous) => ({ ...previous, audioUrl: value }))} />
                    <TextField label="Image URL" value={form.imageUrl ?? ''} onChange={(value) => setForm((previous) => ({ ...previous, imageUrl: value }))} />
                    <TextField label="Translation" value={translation.translation} onChange={(value) => setForm((previous) => ({ ...previous, translations: { ...previous.translations, en: { ...translation, translation: value } } }))} />
                    <TextField label="Definition" value={translation.definition} onChange={(value) => setForm((previous) => ({ ...previous, translations: { ...previous.translations, en: { ...translation, definition: value } } }))} />
                    <TextField label="Synonyms" value={synonyms} onChange={setSynonyms} />
                    <TextField label="Antonyms" value={antonyms} onChange={setAntonyms} />
                    <TextField label="Related words" value={related} onChange={setRelated} />
                    <div className="md:col-span-2">
                        <label className="mb-1.5 block text-xs font-semibold text-gray-500">Example sentences</label>
                        <textarea value={examples} onChange={(event) => setExamples(event.target.value)} rows={4} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <input type="checkbox" checked={!!form.isPublished} onChange={(event) => setForm((previous) => ({ ...previous, isPublished: event.target.checked }))} /> Published
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <input type="checkbox" checked={!!form.isPremium} onChange={(event) => setForm((previous) => ({ ...previous, isPremium: event.target.checked }))} /> Premium
                    </label>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-300">
                        Cancel
                    </button>
                    <button onClick={save} disabled={isSaving || !form.word.trim()} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white disabled:opacity-50">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save
                    </button>
                </div>
            </div>
        </div>
    );
}

function BulkVocabularyModal({ isSaving, onClose, onImport }: { isSaving: boolean; onClose: () => void; onImport: (items: CreateVocabularyDto[]) => void }) {
    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const sample = JSON.stringify([{ ...emptyForm, word: 'abandon', translations: { en: { translation: 'to leave behind', definition: 'to stop doing or supporting something', exampleSentences: ['They had to abandon the plan.'] } } }], null, 2);
    const submit = () => {
        try {
            const parsed = JSON.parse(text);
            if (!Array.isArray(parsed)) throw new Error('JSON must be an array.');
            onImport(parsed as CreateVocabularyDto[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid JSON');
        }
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Bulk Vocabulary Import</h2>
                    <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder={sample} rows={16} className="w-full rounded-xl bg-gray-950 p-4 font-mono text-xs text-emerald-300 outline-none ring-1 ring-gray-800" />
                {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
                <div className="mt-4 flex justify-end gap-2">
                    <button onClick={() => setText(sample)} className="rounded-xl border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-600 dark:border-violet-800">
                        Load sample
                    </button>
                    <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-300">
                        Cancel
                    </button>
                    <button onClick={submit} disabled={isSaving || !text.trim()} className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 text-sm font-bold text-white disabled:opacity-50">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Import
                    </button>
                </div>
            </div>
        </div>
    );
}

function TextField({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean }) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                {label} {required && '*'}
            </label>
            <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
        </div>
    );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">{label}</label>
            <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

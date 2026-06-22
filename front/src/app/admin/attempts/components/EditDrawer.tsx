'use client';

import { useMemo, useState } from 'react';
import { Check, ClipboardList, MessageSquare, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { AdminUpdateAttemptDto, IELTSExamAttempt } from '@/types/attempt.types';
import { EntityStatus, EntityStatusEnum } from '@/types/entity.status';
import { Button, Checkbox, Drawer, Input, Select, Tabs, Textarea } from '@/components/UI';

const BAND_OPTIONS = ['', 0, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

interface EditDrawerProps {
    attempt: IELTSExamAttempt;
    onClose: () => void;
    onSave: (data: AdminUpdateAttemptDto) => void;
    isSaving: boolean;
}

type TabKey = 'scores' | 'review' | 'feedback' | 'meta';

type FormState = {
    status: string;
    overallBandScore: string;
    readingBandScore: string;
    listeningBandScore: string;
    writingBandScore: string;
    speakingBandScore: string;
    tags: string;
    isReviewed: boolean;
    reviewNote: string;
    generalFeedback: string;
    adminNote: string;
};

const statusOptions = [EntityStatusEnum.IN_PROGRESS, EntityStatusEnum.SUBMITTED, EntityStatusEnum.GRADING, EntityStatusEnum.GRADED, EntityStatusEnum.EXPIRED].map((value) => ({
    label: value.replaceAll('_', ' '),
    value,
}));

const bandRows: Array<{ key: keyof Pick<FormState, 'overallBandScore' | 'readingBandScore' | 'listeningBandScore' | 'writingBandScore' | 'speakingBandScore'>; label: string }> = [
    { key: 'overallBandScore', label: 'Overall band' },
    { key: 'listeningBandScore', label: 'Listening band' },
    { key: 'readingBandScore', label: 'Reading band' },
    { key: 'writingBandScore', label: 'Writing band' },
    { key: 'speakingBandScore', label: 'Speaking band' },
];

export default function EditDrawer({ attempt, onClose, onSave, isSaving }: EditDrawerProps) {
    const [tab, setTab] = useState<TabKey>('scores');
    const [form, setForm] = useState<FormState>({
        status: attempt.status,
        overallBandScore: attempt.overallBandScore?.toString() ?? '',
        readingBandScore: attempt.readingBandScore?.toString() ?? '',
        listeningBandScore: attempt.listeningBandScore?.toString() ?? '',
        writingBandScore: attempt.writingBandScore?.toString() ?? '',
        speakingBandScore: attempt.speakingBandScore?.toString() ?? '',
        tags: (attempt.tags ?? []).join(', '),
        isReviewed: attempt.isReviewed ?? false,
        reviewNote: attempt.reviewNote ?? '',
        generalFeedback: attempt.generalFeedback ?? '',
        adminNote: '',
    });

    const tabs = useMemo(
        () => [
            { value: 'scores', label: 'Scores', Icon: SlidersHorizontal },
            { value: 'review', label: 'Review', Icon: ShieldCheck },
            { value: 'feedback', label: 'Feedback', Icon: MessageSquare },
            { value: 'meta', label: 'Meta', Icon: ClipboardList },
        ],
        [],
    );

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSave = () => {
        const payload: AdminUpdateAttemptDto = {
            status: form.status as EntityStatus,
            tags: form.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean),
            isReviewed: form.isReviewed,
            reviewNote: form.reviewNote.trim() || undefined,
            generalFeedback: form.generalFeedback.trim() || undefined,
            adminNote: form.adminNote.trim() || undefined,
        };

        bandRows.forEach(({ key }) => {
            const value = form[key];
            if (value !== '') {
                payload[key] = Number(value);
            }
        });

        onSave(payload);
    };

    return (
        <Drawer
            open
            onClose={onClose}
            title="Attempt tahrirlash"
            description={`#${attempt._id.slice(-8).toUpperCase()} uchun status, band, review va feedback maydonlari.`}
            size="lg"
            footer={
                <div className="flex gap-3">
                    <Button type="button" variant="outline" tone="neutral" fullWidth onClick={onClose}>
                        Bekor
                    </Button>
                    <Button type="button" fullWidth Icon={Check} loading={isSaving} onClick={handleSave}>
                        Saqlash
                    </Button>
                </div>
            }
        >
            <div className="space-y-5">
                <Tabs tabs={tabs} value={tab} onChange={(value) => setTab(value as TabKey)} variant="boxed" />

                {tab === 'scores' && (
                    <div className="space-y-4">
                        <Select label="Status" value={form.status} onChange={(event) => set('status', event.target.value)} options={statusOptions} />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {bandRows.map(({ key, label }) => (
                                <Select
                                    key={key}
                                    label={label}
                                    value={form[key]}
                                    onChange={(event) => set(key, event.target.value)}
                                    options={BAND_OPTIONS.map((value) => ({
                                        value: String(value),
                                        label: value === '' ? 'Belgilanmagan' : String(value),
                                    }))}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'review' && (
                    <div className="space-y-4">
                        <Checkbox label="Ko'rib chiqildi" description="Reviewed belgisi qo'yilganda backend reviewedBy va reviewedAt ni yozadi." checked={form.isReviewed} onChange={(event) => set('isReviewed', event.target.checked)} />
                        <Textarea label="Review note" value={form.reviewNote} onChange={(event) => set('reviewNote', event.target.value)} rows={5} placeholder="Ichki tekshiruv uchun izoh..." autoGrow />
                    </div>
                )}

                {tab === 'feedback' && (
                    <div className="space-y-4">
                        <Textarea label="General feedback" helperText="Bu feedback o'quvchi ko'rishi mumkin bo'lgan umumiy izoh." value={form.generalFeedback} onChange={(event) => set('generalFeedback', event.target.value)} rows={6} placeholder="O'quvchiga umumiy tavsiyalar..." autoGrow />
                        <Textarea label="Admin note" helperText="Bu izoh audit/change history uchun sabab sifatida ishlatiladi." value={form.adminNote} onChange={(event) => set('adminNote', event.target.value)} rows={4} placeholder="O'zgarish sababi..." autoGrow />
                    </div>
                )}

                {tab === 'meta' && (
                    <div className="space-y-4">
                        <Input label="Tags" helperText="Vergul bilan ajrating: urgent, vip, review-needed" value={form.tags} onChange={(event) => set('tags', event.target.value)} placeholder="urgent, vip, review-needed" />
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-300">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs font-bold text-gray-400">Attempt ID</p>
                                    <p className="break-all font-mono text-xs">{attempt._id}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400">Attempt number</p>
                                    <p className="font-mono text-xs">{attempt.attemptNumber ?? '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400">Created</p>
                                    <p className="font-mono text-xs">{attempt.createdAt ? new Date(attempt.createdAt).toLocaleString() : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400">Updated</p>
                                    <p className="font-mono text-xs">{attempt.updatedAt ? new Date(attempt.updatedAt).toLocaleString() : '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Drawer>
    );
}

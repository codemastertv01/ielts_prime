'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Eye, X } from 'lucide-react';
import ExamContainer from '@/components/exam';
import { Button } from '@/components/UI';
import { adminExamAPI } from '@/services/examAPI';
import { useExamStore } from '@/stores/examStore';
import type { ExamData } from '@/types/exam';

export default function ExamPreviewPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const examId = params?.id ?? '';

    useEffect(() => {
        useExamStore.getState().resetExam();
        return () => useExamStore.getState().resetExam();
    }, [examId]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <div className="sticky top-0 z-[60] flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-amber-800 dark:border-amber-900 dark:bg-amber-950/90 dark:text-amber-200">
                <div className="flex min-w-0 items-center gap-2 text-xs font-semibold sm:text-sm">
                    <Eye className="h-4 w-4 shrink-0" />
                    <span className="truncate">Admin preview mode: answers are not sent to the backend</span>
                </div>
                <Button variant="ghost" tone="neutral" size="xs" Icon={X} onClick={() => router.push(`/admin/exams/${examId}`)}>
                    Yopish
                </Button>
            </div>
            <ExamContainer
                examId={examId}
                onFetchExam={(id) => adminExamAPI.getById(id, true) as Promise<ExamData>}
                onStartAttempt={async () => ({ _id: `preview-${examId}` })}
                onAutoSave={async () => undefined}
                onSubmitAll={async () => undefined}
                onUploadRecording={async (_key, blob) => URL.createObjectURL(blob)}
                onFinished={() => router.push(`/admin/exams/${examId}`)}
            />
        </div>
    );
}

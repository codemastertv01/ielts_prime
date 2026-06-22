'use client';
import { useParams, useRouter } from 'next/navigation';
import { useExamStore } from '@/stores/examStore';
import { userExamAPI } from '@/services/examAPI';
import { attemptAPI } from '@/services/attemptAPI';
import ExamContainer from '@/components/exam';

export default function ExamPage() {
    const params = useParams<{ examId: string }>();
    const router = useRouter();
    const examId = params?.examId ?? '';

    return (
        <ExamContainer
            examId={examId}
            onFetchExam={(id) => userExamAPI.getById(id)}
            onStartAttempt={(id) => attemptAPI.start(id)}
            onAutoSave={async ({ listeningAnswers, readingAnswers, writingTask1, writingTask2 }) => {
                const { attemptId } = useExamStore.getState();
                if (!attemptId) return;
                await attemptAPI.autoSave(attemptId, {
                    listeningAnswers:
                        Object.keys(listeningAnswers).length > 0
                            ? Object.entries(listeningAnswers).map(([key, answer]) => {
                                  const [part, question] = key.split('_');
                                  return { partNumber: +part, questionNumber: +question, answer };
                              })
                            : undefined,
                    readingAnswers:
                        Object.keys(readingAnswers).length > 0
                            ? Object.entries(readingAnswers).map(([key, answer]) => {
                                  const [passage, question] = key.split('_');
                                  return { passageNumber: +passage, questionNumber: +question, answer };
                              })
                            : undefined,
                    writingTask1: writingTask1 || undefined,
                    writingTask2: writingTask2 || undefined,
                });
            }}
            onSubmitAll={async ({ listeningAnswers, readingAnswers, writingTask1, writingTask2, speakingRecordings }) => {
                const { attemptId, examData } = useExamStore.getState();
                if (!attemptId || !examData) return;

                if (examData.listeningSection?.isEnabled && Object.keys(listeningAnswers).length > 0) {
                    await attemptAPI.submitListening(attemptId, {
                        answers: Object.entries(listeningAnswers).map(([key, answer]) => {
                            const [part, question] = key.split('_');
                            return { partNumber: +part, questionNumber: +question, answer };
                        }),
                    });
                }
                if (examData.readingSection?.isEnabled && Object.keys(readingAnswers).length > 0) {
                    await attemptAPI.submitReading(attemptId, {
                        answers: Object.entries(readingAnswers).map(([key, answer]) => {
                            const [passage, question] = key.split('_');
                            return { passageNumber: +passage, questionNumber: +question, answer };
                        }),
                    });
                }
                if (examData.writingSection?.isEnabled) {
                    const tasks: { taskNumber: number; content: string }[] = [];
                    if (writingTask1?.trim()) tasks.push({ taskNumber: 1, content: writingTask1 });
                    if (writingTask2?.trim()) tasks.push({ taskNumber: 2, content: writingTask2 });
                    if (tasks.length > 0) {
                        await attemptAPI.submitWriting(attemptId, { tasks });
                    }
                }
                if (examData.speakingSection?.isEnabled) {
                    const parts = Object.entries(speakingRecordings)
                        .filter(([, r]) => r.url)
                        .map(([key, r]) => ({
                            partNumber: +key.split('_q')[0].replace('part', ''),
                            recordingUrl: r.url as string,
                            durationSeconds: r.duration,
                        }));
                    if (parts.length > 0) await attemptAPI.submitSpeaking(attemptId, { parts });
                }
            }}
            soundCheckUrl="https://fancy-resonance-782b.mirabzalozodov07.workers.dev"
            onFinished={() => router.push('/dashboard')}
        />
    );
}

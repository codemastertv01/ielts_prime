'use client';
import type { UserAnalytics } from '@/hooks/useAnalytics';
import { ArrowUpRight, Clock, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { EntityStatusEnum } from '../../types/entity.status';

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
    [EntityStatusEnum.GRADED]: {
        label: 'Graded',
        cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    },
    [EntityStatusEnum.GRADING]: {
        label: 'Grading',
        cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300',
    },
    [EntityStatusEnum.SUBMITTED]: {
        label: 'Submitted',
        cls: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300',
    },
    [EntityStatusEnum.IN_PROGRESS]: {
        label: 'In Progress',
        cls: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    },
    [EntityStatusEnum.EXPIRED]: {
        label: 'Expired',
        cls: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
    },
};

function getBandColor(band: number | undefined | null): string {
    if (!band) return 'text-gray-400';
    if (band >= 8) return 'text-emerald-600 dark:text-emerald-400';
    if (band >= 7) return 'text-blue-600 dark:text-blue-400';
    if (band >= 6) return 'text-violet-600 dark:text-violet-400';
    if (band >= 5) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
}

interface RecentAttemptsProps {
    analytics: UserAnalytics | undefined;
    isLoading: boolean;
}

export default function RecentAttempts({ analytics, isLoading }: RecentAttemptsProps) {
    const router = useRouter();
    const recent = [...(analytics?.attempts ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Recent Attempts</p>
                <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-colors">
                    View all <ArrowUpRight className="w-3 h-3" />
                </button>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between px-5 py-3.5 gap-4">
                            <div className="space-y-1.5 flex-1">
                                <div className="h-4 w-40 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                                <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                            </div>
                            <div className="h-6 w-14 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
                        </div>
                    ))
                ) : recent.length === 0 ? (
                    <div className="px-5 py-10 flex flex-col items-center gap-2 text-center">
                        <span className="text-3xl">📝</span>
                        <p className="text-sm text-gray-400">No attempts yet. Start your first mock!</p>
                    </div>
                ) : (
                    recent.map((attempt, i) => {
                        const prevScore = i < recent.length - 1 ? recent[i + 1].overallBandScore : null;
                        const curr = attempt.overallBandScore;
                        const delta = curr != null && prevScore != null ? Math.round((curr - prevScore) * 10) / 10 : null;

                        const DeltaIcon = delta == null ? null : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;

                        const deltaColor = delta == null ? '' : delta > 0 ? 'text-emerald-500' : delta < 0 ? 'text-red-400' : 'text-gray-400';

                        const examTitle = typeof attempt.examId === 'object' ? ((attempt.examId as any).title ?? 'IELTS Mock') : 'IELTS Mock';

                        const badge = STATUS_BADGE[attempt.status ?? ''] ?? STATUS_BADGE[EntityStatusEnum.IN_PROGRESS];

                        const dateStr = new Date(attempt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                        return (
                            <div key={attempt._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/result/${attempt._id}`)}>
                                <div className="flex items-center gap-3 min-w-0">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold
                                          ${curr != null ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}
                                    >
                                        {curr != null ? curr : <Clock className="w-4 h-4" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{examTitle}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-xs text-gray-400">{dateStr}</p>
                                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    {DeltaIcon && delta != null && (
                                        <div className={`flex items-center gap-0.5 text-xs font-semibold ${deltaColor}`}>
                                            <DeltaIcon className="w-3 h-3" />
                                            {delta > 0 ? '+' : ''}
                                            {delta}
                                        </div>
                                    )}
                                    {curr != null && (
                                        <div className="text-right">
                                            <p className={`text-sm font-bold ${getBandColor(curr)}`}>{curr}</p>
                                            <p className="text-[10px] text-gray-400">band</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

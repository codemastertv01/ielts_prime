'use client';
import { BookOpen, Award, Clock, Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { UserAnalytics } from '@/hooks/useAnalytics';

interface StatCardProps {
    title: string;
    value: string | number;
    suffix?: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    loading?: boolean;
}

function StatCard({ title, value, suffix, change, trend, icon: Icon, iconColor, iconBg, loading }: StatCardProps) {
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : trend === 'down' ? 'text-red-500 dark:text-red-400' : 'text-gray-400';

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ring-1 ${iconBg}`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                {loading ? (
                    <div className="w-12 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                ) : (
                    <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${trendColor}`}>
                        <TrendIcon className="w-3 h-3" /> {change}
                    </span>
                )}
            </div>

            {loading ? (
                <div className="space-y-1.5">
                    <div className="h-7 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="h-3.5 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                </div>
            ) : (
                <>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white leading-none mb-1">
                        {value}
                        {suffix && <span className="text-lg">{suffix}</span>}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">{title}</p>
                </>
            )}
        </div>
    );
}

interface StatsGridProps {
    analytics: UserAnalytics | undefined;
    isLoading: boolean;
}

export default function StatsGrid({ analytics, isLoading }: StatsGridProps) {
    const overallDelta = analytics?.overallDelta ?? 0;
    const trend = analytics?.overallTrend ?? 'neutral';

    const stats: StatCardProps[] = [
        {
            title: 'Mocks Completed',
            value: analytics?.completedAttempts ?? 0,
            change: `${analytics?.totalAttempts ?? 0} total`,
            trend: 'neutral',
            icon: BookOpen,
            iconColor: 'text-sky-500 dark:text-sky-400',
            iconBg: 'bg-sky-50 dark:bg-sky-500/15 ring-sky-200 dark:ring-sky-500/25',
        },
        {
            title: 'Average Band',
            value: analytics?.averageOverall ?? 0,
            change: overallDelta !== 0 ? `${overallDelta > 0 ? '+' : ''}${overallDelta} last` : 'no change',
            trend,
            icon: Award,
            iconColor: 'text-emerald-500 dark:text-emerald-400',
            iconBg: 'bg-emerald-50 dark:bg-emerald-500/15 ring-emerald-200 dark:ring-emerald-500/25',
        },
        {
            title: 'Study Hours',
            value: analytics?.totalHours ?? 0,
            suffix: 'h',
            change: `${analytics?.completionRate ?? 0}% completion`,
            trend: (analytics?.completionRate ?? 0) >= 70 ? 'up' : 'neutral',
            icon: Clock,
            iconColor: 'text-violet-500 dark:text-violet-400',
            iconBg: 'bg-violet-50 dark:bg-violet-500/15 ring-violet-200 dark:ring-violet-500/25',
        },
        {
            title: 'Best Band',
            value: analytics?.bestOverall ?? 0,
            change: analytics?.streak ? `${analytics.streak} day streak 🔥` : 'start a streak',
            trend: (analytics?.streak ?? 0) > 0 ? 'up' : 'neutral',
            icon: Flame,
            iconColor: 'text-orange-500 dark:text-orange-400',
            iconBg: 'bg-orange-50 dark:bg-orange-500/15 ring-orange-200 dark:ring-orange-500/25',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((s, i) => (
                <StatCard key={i} {...s} loading={isLoading} />
            ))}
        </div>
    );
}

'use client';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { UserAnalytics } from '@/hooks/useAnalytics';

interface HeroCardProps {
    analytics: UserAnalytics | undefined;
    isLoading: boolean;
}

export default function HeroCard({ analytics, isLoading }: HeroCardProps) {
    const { user } = useAuth();
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
    const firstName = user?.firstName || user?.username?.split(' ')[0] || 'there';

    const trend = analytics?.overallTrend ?? 'same';
    const delta = analytics?.overallDelta ?? 0;
    const latest = analytics?.latestOverall ?? 0;
    const streak = analytics?.streak ?? 0;

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

    const trendColor = trend === 'up' ? 'text-emerald-300' : trend === 'down' ? 'text-red-300' : 'text-blue-200';

    return (
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700 p-7">
            {/* Noise texture */}
            <div className="absolute inset-0 opacity-[0.04] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                {/* Left: greeting + band */}
                <div>
                    <p className="text-blue-200 text-sm font-medium mb-1">{greeting} 👋</p>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{firstName}, keep it up!</h1>

                    {isLoading ? (
                        <div className="h-4 w-48 bg-white/10 rounded animate-pulse mt-2" />
                    ) : analytics && analytics.completedAttempts > 0 ? (
                        <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1.5">
                                <span className="text-white/60 text-sm">Latest band:</span>
                                <span className="text-white font-bold text-lg">{latest}</span>
                            </div>
                            {delta !== 0 && (
                                <div className={`flex items-center gap-1 text-sm font-semibold ${trendColor}`}>
                                    <TrendIcon className="w-4 h-4" />
                                    {delta > 0 ? '+' : ''}
                                    {delta} from last
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-blue-200/70 text-sm mt-1.5">Complete your first mock to see progress.</p>
                    )}
                </div>

                {/* Right: streak badge */}
                <motion.div whileHover={{ scale: 1.04 }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 ring-1 ring-white/25 text-white text-sm font-semibold backdrop-blur-sm w-fit shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    {streak > 0 ? `${streak} Day Streak 🔥` : 'Start your streak'}
                </motion.div>
            </div>
        </div>
    );
}

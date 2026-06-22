'use client';
import FadeIn from '@/components/animations/FadeIn';
import { useAnalytics } from '@/hooks/useAnalytics';
import HeroCard from '@/components/dashboard/HeroCard';
import StatsGrid from '@/components/dashboard/StatsGrid';
import BandProgressChart from '@/components/dashboard/BandProgressChart';
import SectionRadarChart from '@/components/dashboard/SectionRadarChart';
import SectionComparisons from '@/components/dashboard/SectionComparisons';
import RecentAttempts from '@/components/dashboard/RecentAttempts';

export default function Dashboard() {
    const { data: analytics, isLoading } = useAnalytics();

    return (
        <div className="space-y-5">
            {/* Hero */}
            <FadeIn>
                <HeroCard analytics={analytics} isLoading={isLoading} />
            </FadeIn>

            {/* Stats */}
            <FadeIn delay={0.05}>
                <StatsGrid analytics={analytics} isLoading={isLoading} />
            </FadeIn>

            {/* Band Progress Chart — full width */}
            <FadeIn delay={0.1}>
                <BandProgressChart analytics={analytics} isLoading={isLoading} />
            </FadeIn>

            {/* Radar + Section comparisons side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FadeIn delay={0.15}>
                    <SectionRadarChart analytics={analytics} isLoading={isLoading} />
                </FadeIn>
                <FadeIn delay={0.18}>
                    <SectionComparisons analytics={analytics} isLoading={isLoading} />
                </FadeIn>
            </div>

            {/* Recent attempts */}
            <FadeIn delay={0.22}>
                <RecentAttempts analytics={analytics} isLoading={isLoading} />
            </FadeIn>
        </div>
    );
}

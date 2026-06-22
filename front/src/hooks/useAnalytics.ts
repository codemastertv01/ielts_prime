'use client';
import { attemptAPI } from '@/services/attemptAPI';
import { IELTSExamAttempt } from '@/types/attempt.types';
import { useQuery } from '@tanstack/react-query';
import { EntityStatusEnum } from '../types/entity.status';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SectionAverages {
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
}

export interface TrendPoint {
    date: string; // "MMM DD"
    overall: number;
    listening: number | null;
    reading: number | null;
    writing: number | null;
    speaking: number | null;
    attemptNumber: number;
    examTitle: string;
}

export interface SectionComparison {
    section: string;
    current: number;
    previous: number;
    delta: number;
    pct: number; // 0–100 for progress bar
}

export interface UserAnalytics {
    // Raw
    attempts: IELTSExamAttempt[];
    gradedAttempts: IELTSExamAttempt[];

    // Summary
    totalAttempts: number;
    completedAttempts: number;
    averageOverall: number;
    bestOverall: number;
    latestOverall: number;
    overallDelta: number; // latest - previous
    overallTrend: 'up' | 'down' | 'same';

    // Section averages (0–9)
    sectionAverages: SectionAverages;
    sectionComparisons: SectionComparison[];

    // Strongest / weakest
    strongestSection: string | null;
    weakestSection: string | null;

    // Study hours (total time spent)
    totalHours: number;

    // Streak (consecutive days with activity)
    streak: number;

    // Chart data
    trendPoints: TrendPoint[];

    // Completion rate
    completionRate: number; // %
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avg(nums: (number | undefined | null)[]): number {
    const valid = nums.filter((n): n is number => n != null && n > 0);
    if (!valid.length) return 0;
    return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10;
}

function formatDate(d: string | Date): string {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function calcStreak(attempts: IELTSExamAttempt[]): number {
    if (!attempts.length) return 0;
    const days = new Set(attempts.map((a) => new Date(a.createdAt).toDateString()));
    const sorted = Array.from(days)
        .map((d) => new Date(d))
        .sort((a, b) => b.getTime() - a.getTime());

    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
        const diff = (sorted[i - 1].getTime() - sorted[i].getTime()) / (1000 * 60 * 60 * 24);
        if (Math.round(diff) === 1) streak++;
        else break;
    }
    // Only count streak if last activity was today or yesterday
    const lastDay = sorted[0];
    const today = new Date();
    const daysSinceLast = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceLast <= 1 ? streak : 0;
}

function computeAnalytics(attempts: IELTSExamAttempt[]): UserAnalytics {
    const graded = attempts.filter((a) => a.status === EntityStatusEnum.GRADED || a.status === EntityStatusEnum.GRADING);

    const withOverall = graded.filter((a) => a.overallBandScore != null);
    const sorted = [...withOverall].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const overallScores = sorted.map((a) => a.overallBandScore!);
    const averageOverall = avg(overallScores);
    const bestOverall = overallScores.length ? Math.max(...overallScores) : 0;
    const latestOverall = overallScores[overallScores.length - 1] ?? 0;
    const prevOverall = overallScores[overallScores.length - 2] ?? latestOverall;
    const overallDelta = Math.round((latestOverall - prevOverall) * 10) / 10;

    const sectionAverages: SectionAverages = {
        listening: avg(graded.map((a) => a.listeningBandScore)),
        reading: avg(graded.map((a) => a.readingBandScore)),
        writing: avg(graded.map((a) => a.writingBandScore)),
        speaking: avg(graded.map((a) => a.speakingBandScore)),
    };

    const sectionEntries = Object.entries(sectionAverages) as [keyof SectionAverages, number][];

    // Section comparison: current (last 3) vs previous (3 before that)
    const recent3 = sorted.slice(-3);
    const prev3 = sorted.slice(-6, -3);

    const sectionComparisons: SectionComparison[] = sectionEntries.map(([section]) => {
        const key = `${section}BandScore` as keyof IELTSExamAttempt;
        const current = avg(recent3.map((a) => a[key] as number));
        const previous = avg(prev3.map((a) => a[key] as number));
        const delta = Math.round((current - previous) * 10) / 10;
        return {
            section: section.charAt(0).toUpperCase() + section.slice(1),
            current,
            previous,
            delta,
            pct: Math.round((current / 9) * 100),
        };
    });

    const validSections = sectionEntries.filter(([, v]) => v > 0);
    const strongestSection = validSections.length ? validSections.reduce((a, b) => (b[1] > a[1] ? b : a))[0] : null;
    const weakestSection = validSections.length ? validSections.reduce((a, b) => (b[1] < a[1] ? b : a))[0] : null;

    const totalHours = Math.round(attempts.reduce((acc, a) => acc + (a.totalTimeSpentSeconds ?? 0), 0) / 3600);

    const streak = calcStreak(attempts);

    const trendPoints: TrendPoint[] = sorted.map((a) => ({
        date: formatDate(a.createdAt),
        overall: a.overallBandScore ?? 0,
        listening: a.listeningBandScore ?? null,
        reading: a.readingBandScore ?? null,
        writing: a.writingBandScore ?? null,
        speaking: a.speakingBandScore ?? null,
        attemptNumber: a.attemptNumber,
        examTitle: typeof a.examId === 'object' ? ((a.examId as any).title ?? 'Exam') : 'Exam',
    }));

    const completionRate = attempts.length > 0 ? Math.round((graded.length / attempts.length) * 100) : 0;

    return {
        attempts,
        gradedAttempts: graded,
        totalAttempts: attempts.length,
        completedAttempts: graded.length,
        averageOverall,
        bestOverall,
        latestOverall,
        overallDelta,
        overallTrend: overallDelta > 0 ? 'up' : overallDelta < 0 ? 'down' : 'same',
        sectionAverages,
        sectionComparisons,
        strongestSection,
        weakestSection,
        totalHours,
        streak,
        trendPoints,
        completionRate,
    };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAnalytics() {
    return useQuery({
        queryKey: ['user-analytics'],
        queryFn: async (): Promise<UserAnalytics> => {
            // Fetch all user attempts (max 100)
            const res = await attemptAPI.getAll({ limit: 100, page: 1 });
            const attempts: IELTSExamAttempt[] = Array.isArray(res) ? res : ((res as any).attempts ?? []);
            return computeAnalytics(attempts);
        },
        staleTime: 5 * 60_000,
        gcTime: 10 * 60_000,
        refetchOnWindowFocus: false,
    });
}

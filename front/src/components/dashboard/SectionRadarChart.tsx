'use client';
import { useEffect, useRef, useState } from 'react';
import type { UserAnalytics } from '@/hooks/useAnalytics';

interface SectionRadarChartProps {
    analytics: UserAnalytics | undefined;
    isLoading: boolean;
}

export default function SectionRadarChart({ analytics, isLoading }: SectionRadarChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || !canvasRef.current || !analytics) return;

        const buildChart = async () => {
            const { Chart, registerables } = await import('chart.js');
            Chart.register(...registerables);

            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }

            const { listening, reading, writing, speaking } = analytics.sectionAverages;

            const ctx = canvasRef.current!.getContext('2d')!;
            chartRef.current = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: ['Listening', 'Reading', 'Writing', 'Speaking'],
                    datasets: [
                        {
                            label: 'Your Score',
                            data: [listening, reading, writing, speaking],
                            backgroundColor: 'rgba(37,99,235,0.12)',
                            borderColor: '#2563eb',
                            borderWidth: 2,
                            pointBackgroundColor: '#2563eb',
                            pointRadius: 4,
                        },
                        {
                            label: 'Target (Band 7)',
                            data: [7, 7, 7, 7],
                            backgroundColor: 'rgba(16,185,129,0.06)',
                            borderColor: 'rgba(16,185,129,0.4)',
                            borderWidth: 1.5,
                            borderDash: [4, 4],
                            pointRadius: 0,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#94a3b8',
                                font: { size: 11 },
                                boxWidth: 12,
                                padding: 12,
                            },
                        },
                        tooltip: {
                            backgroundColor: '#1e293b',
                            titleColor: '#94a3b8',
                            bodyColor: '#f1f5f9',
                        },
                    },
                    scales: {
                        r: {
                            min: 0,
                            max: 9,
                            ticks: {
                                stepSize: 3,
                                color: '#94a3b8',
                                font: { size: 10 },
                                backdropColor: 'transparent',
                            },
                            grid: { color: 'rgba(148,163,184,0.15)' },
                            angleLines: { color: 'rgba(148,163,184,0.15)' },
                            pointLabels: {
                                color: '#64748b',
                                font: { size: 12, weight: 600 },
                            },
                        },
                    },
                },
            });
        };

        buildChart();

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [mounted, analytics]);

    const { strongestSection, weakestSection } = analytics ?? {};

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none p-5">
            <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Section Breakdown</p>
            </div>
            <p className="text-xs text-gray-400 mb-4">Average across all completed mocks</p>

            {/* Radar */}
            <div className="relative h-52">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-36 h-36 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    </div>
                ) : !analytics?.completedAttempts ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <div className="text-2xl">🎯</div>
                        <p className="text-sm text-gray-400 text-center">No data yet</p>
                    </div>
                ) : (
                    <canvas ref={canvasRef} />
                )}
            </div>

            {/* Strongest / weakest */}
            {!isLoading && analytics?.completedAttempts ? (
                <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wide">Strongest</p>
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-0.5 capitalize">{strongestSection ?? '—'}</p>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-500/10 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wide">Needs Work</p>
                        <p className="text-sm font-bold text-rose-700 dark:text-rose-300 mt-0.5 capitalize">{weakestSection ?? '—'}</p>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

'use client';
import { useEffect, useRef, useState } from 'react';
import type { UserAnalytics } from '@/hooks/useAnalytics';

interface BandProgressChartProps {
    analytics: UserAnalytics | undefined;
    isLoading: boolean;
}

const SECTION_COLORS = {
    overall: { line: '#2563eb', fill: 'rgba(37,99,235,0.08)' },
    listening: { line: '#7c3aed', fill: 'rgba(124,58,237,0.06)' },
    reading: { line: '#0891b2', fill: 'rgba(8,145,178,0.06)' },
    writing: { line: '#d97706', fill: 'rgba(217,119,6,0.06)' },
    speaking: { line: '#e11d48', fill: 'rgba(225,29,72,0.06)' },
};

type SectionKey = keyof typeof SECTION_COLORS;

export default function BandProgressChart({ analytics, isLoading }: BandProgressChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<any>(null);
    const [activeSection, setActiveSection] = useState<SectionKey>('overall');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || !canvasRef.current || !analytics?.trendPoints.length) return;

        const buildChart = async () => {
            const { Chart, registerables } = await import('chart.js');
            Chart.register(...registerables);

            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }

            const points = analytics.trendPoints;
            const labels = points.map((p) => p.date);

            const getDataset = (key: SectionKey) => ({
                label: key.charAt(0).toUpperCase() + key.slice(1),
                data: points.map((p) => p[key]),
                borderColor: SECTION_COLORS[key].line,
                backgroundColor: SECTION_COLORS[key].fill,
                borderWidth: 2.5,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: SECTION_COLORS[key].line,
                tension: 0.4,
                fill: true,
                spanGaps: true,
            });

            const ctx = canvasRef.current!.getContext('2d')!;
            chartRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [getDataset(activeSection)],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#1e293b',
                            titleColor: '#94a3b8',
                            bodyColor: '#f1f5f9',
                            padding: 12,
                            callbacks: {
                                title: (items) => {
                                    const idx = items[0].dataIndex;
                                    return `${points[idx].examTitle} · Attempt #${points[idx].attemptNumber}`;
                                },
                                label: (item) => `Band ${item.parsed.y ?? 'N/A'}`,
                            },
                        },
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: {
                                color: '#94a3b8',
                                font: { size: 11 },
                                maxRotation: 0,
                            },
                        },
                        y: {
                            min: 0,
                            max: 9,
                            ticks: {
                                color: '#94a3b8',
                                font: { size: 11 },
                                stepSize: 1,
                            },
                            grid: { color: 'rgba(148,163,184,0.1)' },
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
    }, [mounted, analytics, activeSection]);

    const sections: SectionKey[] = ['overall', 'listening', 'reading', 'writing', 'speaking'];

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none p-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Band Score Progress</p>
                    <p className="text-xs text-gray-400 mt-0.5">Your improvement over time</p>
                </div>
                {analytics && (
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Latest</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{analytics.latestOverall || '—'}</p>
                    </div>
                )}
            </div>

            {/* Section filter pills */}
            <div className="flex flex-wrap gap-1.5 mb-4">
                {sections.map((s) => (
                    <button key={s} onClick={() => setActiveSection(s)} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${activeSection === s ? 'text-white border-transparent' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`} style={activeSection === s ? { background: SECTION_COLORS[s].line } : {}}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <div className="relative h-52">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="space-y-2 w-full px-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-2 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" style={{ width: `${70 + i * 7}%` }} />
                            ))}
                        </div>
                    </div>
                ) : !analytics?.trendPoints.length ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-2xl">📊</div>
                        <p className="text-sm text-gray-400">Complete a mock to see your progress</p>
                    </div>
                ) : (
                    <canvas ref={canvasRef} />
                )}
            </div>
        </div>
    );
}

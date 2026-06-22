'use client';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import type { UserAnalytics } from '@/hooks/useAnalytics';

const SECTION_COLORS: Record<string, string> = {
    Listening: 'bg-violet-500',
    Reading: 'bg-sky-500',
    Writing: 'bg-amber-500',
    Speaking: 'bg-rose-500',
};

const SECTION_BG: Record<string, string> = {
    Listening: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
    Reading: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400',
    Writing: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    Speaking: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400',
};

interface SectionComparisonsProps {
    analytics: UserAnalytics | undefined;
    isLoading: boolean;
}

export default function SectionComparisons({ analytics, isLoading }: SectionComparisonsProps) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none p-5">
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Section Performance</p>
            <p className="text-xs text-gray-400 mb-5">Recent 3 vs previous 3 attempts</p>

            <div className="space-y-5">
                {isLoading
                    ? [...Array(4)].map((_, i) => (
                          <div key={i} className="space-y-2">
                              <div className="flex justify-between">
                                  <div className="h-3.5 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                                  <div className="h-3.5 w-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                              </div>
                              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
                          </div>
                      ))
                    : (analytics?.sectionComparisons ?? []).map((s) => {
                          const DeltaIcon = s.delta > 0 ? TrendingUp : s.delta < 0 ? TrendingDown : Minus;
                          const deltaColor = s.delta > 0 ? 'text-emerald-600 dark:text-emerald-400' : s.delta < 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-400';

                          return (
                              <div key={s.section}>
                                  <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${SECTION_BG[s.section]}`}>{s.section}</span>
                                          <span className="text-xs text-gray-400">{s.current > 0 ? `Band ${s.current}` : 'No data'}</span>
                                      </div>
                                      <div className={`flex items-center gap-0.5 text-xs font-semibold ${deltaColor}`}>
                                          <DeltaIcon className="w-3 h-3" />
                                          {s.delta !== 0 ? `${s.delta > 0 ? '+' : ''}${s.delta}` : '—'}
                                      </div>
                                  </div>

                                  {/* Progress bar */}
                                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                      <motion.div className={`h-full rounded-full ${SECTION_COLORS[s.section]}`} initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }} />
                                  </div>

                                  {/* Previous vs current */}
                                  {s.previous > 0 && (
                                      <div className="flex justify-between mt-1">
                                          <span className="text-[10px] text-gray-300 dark:text-gray-600">Prev: {s.previous}</span>
                                          <span className="text-[10px] text-gray-300 dark:text-gray-600">{s.pct}% of max</span>
                                      </div>
                                  )}
                              </div>
                          );
                      })}
            </div>

            {/* Estimated band summary */}
            {!isLoading && analytics && (
                <div className="mt-5 p-4 bg-gray-50 dark:bg-gray-800/60 ring-1 ring-gray-200 dark:ring-gray-700/50 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400">Avg Band</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{analytics.averageOverall || '—'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Best</p>
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{analytics.bestOverall || '—'}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

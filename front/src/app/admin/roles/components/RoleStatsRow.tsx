'use client';
import { motion } from 'framer-motion';
import { Database, Lock, Settings, Users, Zap } from 'lucide-react';
import type { RoleStats } from '@/types/role';

export const RoleStatsRow = ({ stats }: { stats?: RoleStats | null }) => {
    if (!stats) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                ))}
            </div>
        );
    }

    const s = stats;
    const cards = [
        {
            label: 'Jami',
            value: s.total,
            color: 'text-gray-700 dark:text-gray-200',
            bg: 'bg-gray-100 dark:bg-gray-800',
            icon: <Database className="w-4 h-4" />,
        },
        {
            label: 'Faol',
            value: s.byStatus?.ACTIVE ?? 0,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-900/30',
            icon: <Zap className="w-4 h-4" />,
        },
        {
            label: 'System',
            value: s.systemRoles,
            color: 'text-violet-600 dark:text-violet-400',
            bg: 'bg-violet-50 dark:bg-violet-900/30',
            icon: <Lock className="w-4 h-4" />,
        },
        {
            label: 'Custom',
            value: s.customRoles,
            color: 'text-sky-600 dark:text-sky-400',
            bg: 'bg-sky-50 dark:bg-sky-900/30',
            icon: <Settings className="w-4 h-4" />,
        },
        {
            label: 'Foydalanuvchilar',
            value: s.totalUsersAssigned,
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-50 dark:bg-indigo-900/30',
            icon: <Users className="w-4 h-4" />,
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {cards.map((c, i) => (
                <motion.div key={c.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                    <div className={`p-2 rounded-xl ${c.bg} ${c.color} flex-shrink-0`}>{c.icon}</div>
                    <div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">{c.label}</p>
                        <p className={`text-lg font-bold font-mono ${c.color}`}>{c.value}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

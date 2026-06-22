'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';

type ThemeValue = 'light' | 'system' | 'dark';

const THEMES: { value: ThemeValue; icon: React.ElementType; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'system', icon: Monitor, label: 'System' },
    { value: 'dark', icon: Moon, label: 'Dark' },
];

// CSS: @custom-variant dark (&:where(.dark, .dark *))
// Ya'ni: .dark class html yoki body ga qo'yilsa ishlaydi
const applyTheme = (value: ThemeValue) => {
    localStorage.setItem('theme', value);

    if (value === 'dark') {
        document.documentElement.classList.add('dark');
    } else if (value === 'light') {
        document.documentElement.classList.remove('dark');
    } else {
        // system
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        prefersDark ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
    }
};

const getSystemOrStored = (): ThemeValue => {
    if (typeof window === 'undefined') return 'dark';
    return (localStorage.getItem('theme') as ThemeValue) ?? 'light';
};

const ToggleTheme = () => {
    const [theme, setThemeState] = useState<ThemeValue>('dark');
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const stored = getSystemOrStored();
        setThemeState(stored);
        applyTheme(stored);

        // OS preference o'zgarganda (system mode uchun)
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            if (getSystemOrStored() === 'system') applyTheme('system');
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const handleChange = (value: ThemeValue) => {
        setThemeState(value);
        applyTheme(value);
        setExpanded(false);
    };

    const CurrentIcon = THEMES.find((t) => t.value === theme)?.icon ?? Moon;

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
            <AnimatePresence>
                {expanded && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.92 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex flex-col gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-1.5 shadow-2xl shadow-black/20">
                        {THEMES.map(({ value, icon: Icon, label }) => (
                            <button key={value} onClick={() => handleChange(value)} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${theme === value ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                <Icon className="w-3.5 h-3.5 shrink-0" />
                                {label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button onClick={() => setExpanded((v) => !v)} whileTap={{ scale: 0.92 }} title="Change theme" className="w-9 h-9 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center shadow-md transition-all">
                <motion.div key={theme} initial={{ rotate: -20, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
                    <CurrentIcon className="w-4 h-4" />
                </motion.div>
            </motion.button>
        </div>
    );
};

export default ToggleTheme;

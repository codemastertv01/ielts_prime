'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, AlertCircle, X, Upload } from 'lucide-react';
import { btn } from '@/constants';

interface JsonImportModalProps {
    onImport: (data: Record<string, unknown> | Record<string, unknown>[]) => void;
    onClose: () => void;
    title?: string;
}

const SAMPLE_JSON = {
    title: 'IELTS Academic Mock Test 1',
    examType: 'FULL_MOCK_TEST',
    module: 'ACADEMIC',
    difficulty: 'BAND_6_7',
    totalTimeLimitMinutes: 170,
    passingScore: 6.0,
    isPremium: false,
    price: 0,
    tags: ['academic', 'mock', 'cambridge'],
    readingSection: {
        passages: [
            {
                passageNumber: 1,
                title: 'The History of Amber',
                passage: 'Amber is fossilized tree resin...',
                keywords: ['amber', 'fossil', 'resin'],
                questions: [
                    {
                        questionNumber: 1,
                        type: 'MULTIPLE_CHOICE',
                        question: 'What is amber made from?',
                        options: ['Tree resin', 'Rock', 'Sand', 'Mud'],
                        correctAnswer: 'Tree resin',
                        points: 1,
                    },
                ],
            },
        ],
    },
};

const JsonImportModal = ({ onImport, onClose, title = 'Import from JSON' }: JsonImportModalProps) => {
    const [text, setText] = useState('');
    const [error, setError] = useState('');

    const handleImport = () => {
        try {
            const parsed = JSON.parse(text);
            if (!parsed || (typeof parsed !== 'object' && !Array.isArray(parsed))) {
                throw new Error('JSON must be an object or an array of objects');
            }
            onImport(parsed);
            onClose();
        } catch {
            setError("Invalid JSON format. Please enter valid JSON.");
        }
    };

    const loadSample = () => {
        setText(JSON.stringify(SAMPLE_JSON, null, 2));
        setError('');
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Code className="w-5 h-5 text-violet-500" />
                        {title}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <textarea
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        setError('');
                    }}
                    rows={16}
                    placeholder={`{\n  "title": "...",\n  "examType": "READING_ONLY",\n  ...\n}\n\nFor bulk import: [{ ... }, { ... }]`}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-[12px] font-mono bg-gray-900 text-emerald-400 resize-none focus:ring-2 focus:ring-violet-500 outline-none leading-relaxed"
                />

                {error && (
                    <p className="flex items-center gap-2 text-xs text-red-500 mt-2">
                        <AlertCircle className="w-3.5 h-3.5" /> {error}
                    </p>
                )}

                <div className="flex gap-3 mt-4">
                    <button onClick={loadSample} className="flex items-center gap-2 px-4 py-2.5 border-2 border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-xl text-sm font-semibold transition-colors">
                        Sample JSON
                    </button>
                    <div className="flex-1" />
                    <button onClick={onClose} className={btn.secondary}>
                        Cancel
                    </button>
                    <button onClick={handleImport} disabled={!text.trim()} className={btn.primary + ' gap-2'}>
                        <Upload className="w-4 h-4" /> Import
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default JsonImportModal;

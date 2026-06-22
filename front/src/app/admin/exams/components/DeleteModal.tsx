'use client';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { IELTSExam } from '@/types/exam';

interface DeleteModalProps {
    exam?: IELTSExam | null;
    multiple?: IELTSExam[];
    onConfirm: () => void;
    onCancel: () => void;
}

const DeleteModal = ({ exam, multiple, onConfirm, onCancel }: DeleteModalProps) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="w-14 h-14 mx-auto mb-5 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">{multiple ? `${multiple.length} exam(s) to delete` : "Delete exam"}</h3>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">
                {multiple ? (
                    `Selected ${multiple.length} exams will be deleted. This action cannot be undone (soft delete).`
                ) : (
                    <span>
                        <strong className="text-gray-700 dark:text-gray-200">{exam?.title}</strong>? This action cannot be undone.
                    </span>
                )}
            </p>
            <div className="flex gap-3">
                <button onClick={onCancel} className="flex-1 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-semibold text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                </button>
                <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors">
                    Delete
                </button>
            </div>
        </motion.div>
    </div>
);

export default DeleteModal;

'use client';
import { useAdminExams } from '@/hooks/useAdminExams';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAttempts } from '@/hooks/useAttempts';
import { useGrading } from '@/hooks/useGrading';
import { BarElement, CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { motion } from 'framer-motion';
import { AlertCircle, Award, BookOpen, ClipboardCheck, Clock, FileText } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import AdminLayout from '../../components/Layout/AdminLayout';
import { EntityStatusEnum } from '../../types/entity.status';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const AdminDashboard = () => {
    const { exams, isLoading: examsLoading } = useAdminExams();
    const { attempts, isLoading: attemptsLoading } = useAttempts();
    const { pendingGrading, isLoading: gradingLoading } = useGrading();
    const hok = useAnalytics();

    const publishedExams = exams.filter((e) => e.isPublished).length;
    const totalAttempts = attempts.length;
    const gradedAttempts = attempts.filter((a) => a.status === EntityStatusEnum.GRADED).length;
    const pendingCount = pendingGrading.length;

    const stats = [
        {
            title: 'Total Exams',
            value: exams.length,
            change: `${publishedExams} published`,
            icon: BookOpen,
            color: 'from-blue-500 to-blue-600',
        },
        {
            title: 'Total Attempts',
            value: totalAttempts,
            change: `${gradedAttempts} graded`,
            icon: ClipboardCheck,
            color: 'from-green-500 to-green-600',
        },
        {
            title: 'Pending Grading',
            value: pendingCount,
            change: 'Needs attention',
            icon: Clock,
            color: 'from-orange-500 to-orange-600',
        },
        {
            title: 'Average Score',
            value: '0.0',
            change: 'Band score',
            icon: Award,
            color: 'from-purple-500 to-purple-600',
        },
    ];

    const attemptsChartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Attempts',
                data: [12, 19, 15, 25, 22, 30, 28],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const examDistributionData = {
        labels: ['Reading', 'Listening', 'Writing', 'Speaking', 'Full Test'],
        datasets: [
            {
                label: 'Number of Exams',
                data: [15, 12, 10, 8, 20],
                backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(251, 146, 60, 0.8)', 'rgba(168, 85, 247, 0.8)', 'rgba(236, 72, 153, 0.8)'],
            },
        ],
    };

    const isLoading = examsLoading || attemptsLoading || gradingLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back! Here's what's happening with your IELTS platform.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-lg bg-linear-to-br ${stat.color} text-white`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">{stat.change}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {pendingCount > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-orange-900 dark:text-orange-200">Pending Grading</h3>
                                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">You have {pendingCount} attempt(s) waiting for grading. Please review them soon.</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attempts This Week</h3>
                        <Line
                            data={attemptsChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: true,
                                plugins: {
                                    legend: {
                                        display: false,
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: {
                                            color: 'rgba(0, 0, 0, 0.05)',
                                        },
                                    },
                                    x: {
                                        grid: {
                                            display: false,
                                        },
                                    },
                                },
                            }}
                        />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Exam Type Distribution</h3>
                        <Bar
                            data={examDistributionData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: true,
                                plugins: {
                                    legend: {
                                        display: false,
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: {
                                            color: 'rgba(0, 0, 0, 0.05)',
                                        },
                                    },
                                    x: {
                                        grid: {
                                            display: false,
                                        },
                                    },
                                },
                            }}
                        />
                    </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {attempts.slice(0, 5).map((attempt, index) => (
                            <div key={attempt._id} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Attempt #{attempt.attemptNumber}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(attempt.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${attempt.status === 'GRADED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : attempt.status === 'GRADING' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>{attempt.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

const NotFound = () => {
    const { isAuthenticated } = useAuthStore()

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="mb-8">
                    <h1 className="text-9xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        404
                    </h1>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Page Not Found
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                        Oops! The page you're looking for doesn't exist or has been moved.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to={isAuthenticated ? '/dashboard' : '/'} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all" >
                            <Home className="w-5 h-5" />
                            Go to {isAuthenticated ? 'Dashboard' : 'Home'}
                        </Link>

                        <button onClick={() => window.history.back()} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-blue-600 dark:hover:border-blue-400 transition-all">
                            <ArrowLeft className="w-5 h-5" />
                            Go Back
                        </button>
                    </div>
                </motion.div>

                <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 3, repeat: Infinity }} className="mt-12 opacity-20">
                    <svg className="w-64 h-64 mx-auto" viewBox="0 0 200 200" fill="none">
                        <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" />
                        <path d="M70 80 Q100 60 130 80" stroke="currentColor" strokeWidth="3" fill="none" />
                        <circle cx="75" cy="90" r="5" fill="currentColor" />
                        <circle cx="125" cy="90" r="5" fill="currentColor" />
                    </svg>
                </motion.div>
            </motion.div>
        </div>
    )
}

export default NotFound

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export const PageLoader = ({ message = 'Loading...' }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Loader2 className="w-12 h-12 text-primary-600 dark:text-primary-400" />
                </motion.div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">{message}</p>
            </motion.div>
        </div>
    )
}
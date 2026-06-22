import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
    size: 'md' | 'sm' | 'lg'
    className: string
}

const LoadingSpinner = ({ size = 'md', className = '' }: LoadingSpinnerProps) => {
    const sizes = {
        sm: 'w-6 h-6',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    };

    return (
        <div className={`flex justify-center items-center ${className}`}>
            <motion.div animate={{ rotate: 360 }} className={`${sizes[size]} relative`} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <div className="absolute inset-0 border-4 border-gray-300 dark:border-gray-600 rounded-full"></div>

                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-4 border-transparent rounded-full border-t-primary-500 border-r-primary-500" />

                <div className="absolute inset-4 bg-primary-500 rounded-full animate-pulse-glow"></div>

                {[...Array(3)].map((_, i) => (
                    <motion.div key={i} className="absolute w-2 h-2 bg-white rounded-full" style={{ left: '50%', top: '0%', transform: 'translate(-50%, -50%)', }} animate={{ rotate: [0, 360], }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2, ease: "linear" }} />
                ))}
            </motion.div>
        </div>
    );
};

export default LoadingSpinner;

import { motion } from 'framer-motion';

interface FloatingCardProps {
    children: React.ReactNode
    className: string
    delay: number
}

const FloatingCard = ({ children, className = '', delay = 0 }: FloatingCardProps) => {
    return (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay }} whileHover={{ y: -10, transition: { type: 'spring', stiffness: 400, damping: 25 } }} className={`relative rounded-2xl backdrop-blur-lg bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-gray-700/30 shadow-2xl hover:shadow-3xl transition-all duration-300 ${className}`}>
            {children}
        </motion.div>
    );
};

export default FloatingCard;
import { motion } from 'framer-motion';

interface GlassCardProps {
    border?: boolean
    className: string
    hoverable?: boolean
    children: React.ReactNode
}

const GlassCard = ({ children, className = '', hoverable = true, border = true }: GlassCardProps) => {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={hoverable ? { y: -5 } : {}} className={`relative rounded-2xl backdrop-blur-xl bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/20 shadow-xl ${className}`}>
            {border && (
                <>
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-500/30 rounded-tl-2xl" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-purple-500/30 rounded-tr-2xl" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-pink-500/30 rounded-bl-2xl" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-500/30 rounded-br-2xl" />
                </>
            )}
            {children}
        </motion.div>
    );
};

export default GlassCard;

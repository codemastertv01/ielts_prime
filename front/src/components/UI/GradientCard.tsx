import { motion } from 'framer-motion';

interface GradientCardProps {
    children: React.ReactNode
    className: string
    gradient: string
}

const GradientCard = ({ children, className = '', gradient }: GradientCardProps) => {
    return (
        <motion.div whileHover={{ scale: 1.02 }} style={{ background: gradient }} className={`relative rounded-2xl overflow-hidden ${className}`}>
            <div className="absolute inset-0 bg-black/5" />
            <div className="relative z-10">{children}</div>
            <motion.div initial={{ x: '-100%' }} whileHover={{ x: '100%' }} transition={{ duration: 0.6 }} className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent" />
        </motion.div>
    );
};

export default GradientCard;

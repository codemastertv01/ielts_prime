import { motion } from 'framer-motion';

interface FadeInProps {
    children: React.ReactNode,
    delay?: number,
    duration?: number
}

const FadeIn = ({ children, delay = 0, duration = 0.5 }: FadeInProps) => {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration, delay }} >
            {children}
        </motion.div>
    );
};

export default FadeIn;
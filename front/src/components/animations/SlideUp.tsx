import { motion } from 'framer-motion';

interface SlideUpProps {
    children: React.ReactNode,
    delay?: number,
    duration?: number
}

const SlideUp = ({ children, delay = 0, duration = 0.5 }: SlideUpProps) => {
    return (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration, delay, type: 'spring', stiffness: 100 }}>
            {children}
        </motion.div>
    );
};

export default SlideUp;
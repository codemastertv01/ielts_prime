import { motion } from 'framer-motion';

interface StaggerChildrenProps {
    children: React.ReactNode,
    stagger?: number,
    delay?: number
}

const StaggerChildren = ({ children, stagger = 0.1, delay = 0 }: StaggerChildrenProps) => {
    return (
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}>
            {children}
        </motion.div>
    );
};

export default StaggerChildren;
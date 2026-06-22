import { motion } from 'framer-motion';

interface Rotate3DProps {
    children: React.ReactNode,
    rotateX?: number,
    rotateY?: number
}

const Rotate3D = ({ children, rotateX = 0, rotateY = 0 }: Rotate3DProps) => {
    return (
        <motion.div animate={{ rotateX: rotateX, rotateY: rotateY, }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} style={{ transformStyle: 'preserve-3d', perspective: '1000px', }}>
            {children}
        </motion.div>
    );
};

export default Rotate3D;
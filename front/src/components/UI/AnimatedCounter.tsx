import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

const AnimatedCounter = ({ from = 0, to = 100, duration = 1 }) => {
    const count = useMotionValue(from);
    const rounded = useTransform(count, latest => Math.round(latest));

    useEffect(() => {
        const animation = animate(count, to, { duration, ease: "easeOut" });

        return animation.stop;
    }, [from, to, duration, count]);

    return <motion.span>{rounded}</motion.span>;
};

export default AnimatedCounter;
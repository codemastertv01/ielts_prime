'use client';

import { motion } from 'framer-motion';
import Rotate3D from '../animations/Rotate3D';
import { cn, radiusClasses, type ComponentRadius } from './utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverEffect?: boolean;
    glow?: boolean;
    rotate3D?: boolean;
    radius?: ComponentRadius;
    variant?: 'default' | 'glass' | 'soft' | 'outline' | 'gradient';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    withCorners?: boolean;
}

const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

const variants = {
    default: 'border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900',
    glass: 'border-white/20 bg-white/10 backdrop-blur-lg shadow-2xl dark:border-gray-700/30 dark:bg-gray-900/20',
    soft: 'border-gray-100 bg-gray-50 shadow-sm dark:border-gray-800 dark:bg-gray-900/70',
    outline: 'border-gray-200 bg-transparent dark:border-gray-800',
    gradient: 'border-primary-200 bg-linear-to-br from-white via-primary-50/60 to-sky-50 shadow-lg dark:border-primary-900/60 dark:from-gray-950 dark:via-primary-950/20 dark:to-sky-950/20',
};

const Card = ({ children, className, hoverEffect = true, glow = false, rotate3D = false, radius = 'xl', variant = 'glass', padding = 'md', withCorners = true, ...props }: CardProps) => {
    const cardContent = (
        <div className={cn('relative border transition-all duration-300', radiusClasses[radius], paddings[padding], variants[variant], glow && 'shadow-neon-lg', hoverEffect && 'hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/10', className)} {...props}>
            {children}
            {withCorners && (
                <>
                    <div className="absolute left-0 top-0 h-10 w-10 rounded-tl-2xl border-l-2 border-t-2 border-primary-500/50" />
                    <div className="absolute right-0 top-0 h-10 w-10 rounded-tr-2xl border-r-2 border-t-2 border-primary-500/50" />
                    <div className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-2xl border-b-2 border-l-2 border-primary-500/50" />
                    <div className="absolute bottom-0 right-0 h-10 w-10 rounded-br-2xl border-b-2 border-r-2 border-primary-500/50" />
                </>
            )}
        </div>
    );

    if (rotate3D) {
        return (
            <Rotate3D rotateX={5} rotateY={5}>
                {cardContent}
            </Rotate3D>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }} whileHover={hoverEffect ? { y: -3 } : undefined}>
            {cardContent}
        </motion.div>
    );
};

export default Card;

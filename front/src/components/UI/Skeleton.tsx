import { cn, radiusClasses, type ComponentRadius } from './utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    radius?: ComponentRadius;
}

const Skeleton = ({ className, radius = 'md', ...props }: SkeletonProps) => <div className={cn('animate-pulse bg-gray-200 dark:bg-gray-800', radiusClasses[radius], className)} {...props} />;

export const SkeletonText = ({ lines = 3, className }: { lines?: number; className?: string }) => (
    <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, index) => (
            <Skeleton key={index} className={cn('h-3', index === lines - 1 ? 'w-2/3' : 'w-full')} />
        ))}
    </div>
);

export default Skeleton;

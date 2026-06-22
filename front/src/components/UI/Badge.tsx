import { cn, radiusClasses, toneClasses, type ComponentRadius, type ComponentSize, type ComponentTone } from './utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    tone?: ComponentTone;
    variant?: 'solid' | 'soft' | 'outline';
    size?: Extract<ComponentSize, 'xs' | 'sm' | 'md' | 'lg'>;
    radius?: ComponentRadius;
    dot?: boolean;
    Icon?: React.ElementType;
}

const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1',
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
};

const Badge = ({ children, tone = 'neutral', variant = 'soft', size = 'md', radius = 'full', dot = false, Icon, className, ...props }: BadgeProps) => (
    <span className={cn('inline-flex max-w-full items-center border font-semibold', sizes[size], radiusClasses[radius], toneClasses[tone][variant], className)} {...props}>
        {dot && <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', toneClasses[tone].dot)} />}
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
        <span className="truncate">{children}</span>
    </span>
);

export default Badge;

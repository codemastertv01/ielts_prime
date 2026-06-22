import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from './utils';

export interface BreadcrumbItem {
    label: React.ReactNode;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

const Breadcrumb = ({ items, className }: BreadcrumbProps) => (
    <nav className={cn('flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400', className)} aria-label="Breadcrumb">
        {items.map((item, index) => {
            const last = index === items.length - 1;
            return (
                <span key={index} className="flex min-w-0 items-center gap-1">
                    {item.href && !last ? (
                        <Link href={item.href} className="truncate font-medium transition hover:text-primary-600 dark:hover:text-primary-400">
                            {item.label}
                        </Link>
                    ) : (
                        <span className={cn('truncate', last && 'font-semibold text-gray-800 dark:text-gray-200')}>{item.label}</span>
                    )}
                    {!last && <ChevronRight className="h-4 w-4 shrink-0" />}
                </span>
            );
        })}
    </nav>
);

export default Breadcrumb;

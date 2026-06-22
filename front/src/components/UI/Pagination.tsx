'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';
import { cn } from './utils';

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    siblingCount?: number;
    className?: string;
}

const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, index) => start + index);

const Pagination = ({ page, totalPages, onPageChange, siblingCount = 1, className }: PaginationProps) => {
    const start = Math.max(1, page - siblingCount);
    const end = Math.min(totalPages, page + siblingCount);
    const pages = range(start, end);

    return (
        <nav className={cn('flex items-center justify-center gap-2', className)} aria-label="Pagination">
            <Button type="button" variant="outline" tone="neutral" size="sm" Icon={ChevronLeft} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
                Oldingi
            </Button>
            {start > 1 && (
                <>
                    <Button type="button" variant={page === 1 ? 'solid' : 'ghost'} tone="neutral" size="sm" onClick={() => onPageChange(1)}>
                        1
                    </Button>
                    {start > 2 && <span className="px-1 text-sm text-gray-400">...</span>}
                </>
            )}
            {pages.map((item) => (
                <Button key={item} type="button" variant={item === page ? 'solid' : 'ghost'} tone={item === page ? 'primary' : 'neutral'} size="sm" onClick={() => onPageChange(item)}>
                    {item}
                </Button>
            ))}
            {end < totalPages && (
                <>
                    {end < totalPages - 1 && <span className="px-1 text-sm text-gray-400">...</span>}
                    <Button type="button" variant={page === totalPages ? 'solid' : 'ghost'} tone="neutral" size="sm" onClick={() => onPageChange(totalPages)}>
                        {totalPages}
                    </Button>
                </>
            )}
            <Button type="button" variant="outline" tone="neutral" size="sm" iconRight={ChevronRight} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
                Keyingi
            </Button>
        </nav>
    );
};

export default Pagination;

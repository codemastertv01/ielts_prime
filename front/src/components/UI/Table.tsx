import { cn } from './utils';

export const Table = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('w-full overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900', className)} {...props} />;

export const TableElement = ({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => <table className={cn('w-full min-w-max border-collapse text-left text-sm', className)} {...props} />;

export const TableHeader = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => <thead className={cn('bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800/70 dark:text-gray-400', className)} {...props} />;

export const TableBody = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody className={cn('divide-y divide-gray-100 dark:divide-gray-800', className)} {...props} />;

export const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => <tr className={cn('transition hover:bg-gray-50/80 dark:hover:bg-gray-800/40', className)} {...props} />;

export const TableHead = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => <th className={cn('px-4 py-3 font-bold', className)} {...props} />;

export const TableCell = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => <td className={cn('px-4 py-3 text-gray-700 dark:text-gray-200', className)} {...props} />;

export default Table;

import type { Metadata } from 'next';
import AdminLayout from '@/components/Layout/AdminLayout';

export const metadata: Metadata = {
    title: 'Exam Attempts | IELTS Admin',
    description: 'IELTS attemptlarni boshqarish, filterlash, baholash va audit qilish.',
};

export default function AttemptsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <AdminLayout>{children}</AdminLayout>;
}

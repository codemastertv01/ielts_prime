import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Mock Tests',
    description: 'IELTS Academic va General Training mock testlarini qidiring, filterlang va topshirishni boshlang.',
};

export default function MockListLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return children;
}

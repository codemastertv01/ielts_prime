import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Admin Exams | IELTS Prime',
    description: 'IELTS Prime admin panelida examlarni yaratish, tahrirlash, preview qilish va boshqarish.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function ExamsLayout({ children }: Readonly<{ children: ReactNode }>) {
    return children;
}

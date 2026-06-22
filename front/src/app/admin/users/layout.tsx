import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Admin Users | IELTS Prime',
    description: 'IELTS Prime admin panelida foydalanuvchilarni yaratish, tahrirlash, filterlash, bloklash va rollarini boshqarish.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function UsersLayout({ children }: Readonly<{ children: ReactNode }>) {
    return children;
}

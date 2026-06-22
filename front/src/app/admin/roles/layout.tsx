import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Admin Roles | IELTS Prime',
    description: 'IELTS Prime admin panelida rollarni yaratish, tahrirlash, filterlash va permission biriktirish.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function RolesLayout({ children }: Readonly<{ children: ReactNode }>) {
    return children;
}

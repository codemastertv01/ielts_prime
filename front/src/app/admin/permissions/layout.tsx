import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Admin Permissions | IELTS Prime',
    description: 'IELTS Prime admin panelida API va frontend permissionlarni yaratish, tahrirlash, filterlash va boshqarish.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function PermissionsLayout({ children }: Readonly<{ children: ReactNode }>) {
    return children;
}

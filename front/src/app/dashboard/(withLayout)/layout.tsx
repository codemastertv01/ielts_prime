import type { Metadata } from 'next';
import DashboardLayout from '@/components/Layout/DashboardLayout';

export const metadata: Metadata = {
    title: {
        default: 'IELTS Mock Tests',
        template: '%s | IELTS Prime',
    },
    description: 'IELTS Prime mock test katalogi va imtihon topshirish muhiti.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function WithoutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <DashboardLayout>{children}</DashboardLayout>;
}

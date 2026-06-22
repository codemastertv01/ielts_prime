import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Vocabulary Management | IELTS Prime Admin',
    description: 'Create, edit, import, publish, and manage IELTS vocabulary words.',
    robots: { index: false, follow: false },
};

export default function VocabularyAdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return children;
}

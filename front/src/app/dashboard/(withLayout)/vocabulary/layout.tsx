import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Vocabulary Practice | IELTS Prime',
    description: 'Learn IELTS vocabulary with printable sheets, audio practice, translations, examples, and games.',
    robots: { index: false, follow: false },
};

export default function VocabularyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return children;
}

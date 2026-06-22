import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Vocabulary Games | IELTS Prime',
    description: 'Practice IELTS vocabulary with interactive games for spelling, matching, sentence building, word chains, synonyms, antonyms, and memory recall.',
    keywords: ['IELTS vocabulary games', 'English vocabulary practice', 'IELTS Prime', 'word chain', 'sentence builder', 'vocabulary matching'],
    robots: { index: false, follow: false },
    openGraph: {
        title: 'Vocabulary Games | IELTS Prime',
        description: 'Interactive IELTS vocabulary games for faster English word recall.',
        type: 'website',
    },
};

export default function VocabularyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return children;
}

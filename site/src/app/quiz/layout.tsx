import { Metadata } from 'next';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Hosting Finder Quiz',
  description: `Take the ${SITE_NAME} hosting finder quiz to get personalized web hosting recommendations. Answer a few questions about your website needs, budget, and technical requirements to find your ideal provider.`,
  alternates: {
    canonical: '/quiz',
  },
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return children;
}

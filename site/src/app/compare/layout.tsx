import { Metadata } from 'next';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Compare Web Hosting Providers',
  description: `Compare web hosting providers side-by-side. See detailed comparisons of pricing, features, performance, and more across 50+ hosting companies on ${SITE_NAME}.`,
  openGraph: {
    title: `Compare Web Hosting Providers | ${SITE_NAME}`,
    description: 'Compare web hosting providers side-by-side. See detailed comparisons of pricing, features, performance, and more.',
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout';
import { CalculatorClient } from '@/components/calculator/CalculatorClient';
import { getAllTableRows } from '@/lib/data';
import { parseTcoOptions, type TcoHost } from '@/lib/tco';
import { SITE_NAME, SITE_DOMAIN } from '@/lib/constants';

export const metadata: Metadata = {
  title: `True-Cost Hosting Calculator: Real Multi-Year Prices | ${SITE_NAME}`,
  description: `Rank web hosts by what they actually cost over 1–3 years — promotional pricing plus full renewal rates, not just the teaser price. Built from ${SITE_NAME}'s real-pricing dataset.`,
  alternates: { canonical: '/calculator' },
  openGraph: {
    title: 'True-Cost Hosting Calculator',
    description: 'See what web hosting really costs over 1–3 years, including the renewal jump.',
    type: 'website',
  },
};

interface PageProps {
  searchParams: Promise<{ years?: string; type?: string; sites?: string }>;
}

export default async function CalculatorPage({ searchParams }: PageProps) {
  const [rows, params] = await Promise.all([getAllTableRows(), searchParams]);
  const options = parseTcoOptions(params);

  const hosts: TcoHost[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    hostingType: r.hostingType,
    firstYearCost: r.firstYearCost,
    secondYearCost: r.secondYearCost,
    renewalMarkupPercent: r.renewalMarkupPercent,
    maxWebsites: r.maxWebsites,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'True-Cost Hosting Calculator',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    url: `${SITE_DOMAIN}/calculator`,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description:
      'Ranks web hosting providers by their real multi-year cost, including the jump from promotional to renewal pricing.',
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_DOMAIN },
  };

  return (
    <section className="py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container size="md">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          True-Cost Hosting Calculator
        </h1>
        <p className="text-lg text-text-secondary mb-2 max-w-2xl">
          The advertised price is rarely what you pay. This calculator ranks hosts by their{' '}
          <strong className="text-foreground">real cost over 1–3 years</strong> — first-year promo pricing
          plus the full renewal rate every year after — so you can see past the teaser rate.
        </p>
        <p className="text-sm text-text-muted mb-8">
          Powered by {SITE_NAME}&apos;s real-pricing data. See the{' '}
          <Link href="/research/the-renewal-trap" className="text-accent hover:underline">
            Renewal Trap study
          </Link>{' '}
          for why this gap matters.
        </p>

        <CalculatorClient hosts={hosts} initialOptions={options} />
      </Container>
    </section>
  );
}

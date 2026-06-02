import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/layout';
import { computeStudyFindings } from '@/lib/study-data';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Hosting Research & Original Data Studies | ${SITE_NAME}`,
  description: `Original, citable research built from ${SITE_NAME}'s dataset of 56 web hosting providers — renewal markups, hidden fees, and the real cost of cheap hosting.`,
  alternates: { canonical: '/research' },
};

export default async function ResearchIndex() {
  const f = await computeStudyFindings();

  const studies = [
    {
      href: '/research/the-renewal-trap',
      title: 'The Renewal Trap',
      blurb: `Shared hosting renews at ${f.shared.avgMultiplier}× the sign-up price on average. We analyzed ${f.shared.sampleSize} providers to find the worst offenders and the hidden fees behind the teaser rates.`,
      stat: `${f.shared.avgMultiplier}×`,
      statLabel: 'avg renewal increase',
    },
  ];

  return (
    <section className="py-12 sm:py-16">
      <Container size="md">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Research & Data Studies</h1>
        <p className="text-lg text-text-secondary mb-10 max-w-2xl">
          Original analysis built from {SITE_NAME}&apos;s manually-reviewed dataset of {f.totalHosts} hosting
          providers. Free to cite with attribution — we publish the numbers the hosting industry would rather
          you didn&apos;t compare.
        </p>

        <div className="space-y-6">
          {studies.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group block bg-bg-secondary border border-border-subtle rounded-xl p-6 hover:border-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors mb-2">
                    {s.title}
                  </h2>
                  <p className="text-text-secondary">{s.blurb}</p>
                  <span className="inline-flex items-center gap-1 text-accent text-sm font-medium mt-4">
                    Read the study <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
                <div className="hidden sm:block text-center shrink-0">
                  <div className="text-3xl font-bold text-accent">{s.stat}</div>
                  <div className="text-xs text-text-muted">{s.statLabel}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-sm text-text-muted mt-10">
          More studies coming as our monthly price tracking accumulates — including which hosts raised prices
          over time.
        </p>
      </Container>
    </section>
  );
}

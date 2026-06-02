import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/layout';
import { getAllCompanies } from '@/lib/data';
import { TOP_HOSTS } from '@/lib/programmatic';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Web Hosting Alternatives: Switch From the Top Providers | ${SITE_NAME}`,
  description: `Thinking of switching hosts? Compare the best alternatives to the most-searched web hosting providers — ranked on real price, uptime, and ratings, with reasons to switch.`,
  alternates: { canonical: '/alternatives' },
};

export default async function AlternativesHub() {
  const companies = await getAllCompanies();
  const hosts = TOP_HOSTS.map((id) => {
    const c = companies.get(id);
    return {
      id,
      name: c?.basicInfo.companyName ?? id,
      usp: c?.comparisonData?.uniqueSellingPoint ?? null,
    };
  });

  return (
    <section className="py-12 sm:py-16">
      <Container size="md">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Hosting Alternatives</h1>
        <p className="text-lg text-text-secondary mb-10 max-w-2xl">
          Stuck on a host that no longer fits — or just want to know your options before renewal? Pick a
          provider below to see the strongest alternatives we track, ranked by overall rating with the
          specific reasons each one stands out.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {hosts.map((h) => (
            <Link
              key={h.id}
              href={`/alternatives/${h.id}`}
              className="group block bg-bg-secondary border border-border-subtle rounded-xl p-5 hover:border-accent/50 transition-colors"
            >
              <h2 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                Best {h.name} alternatives
              </h2>
              {h.usp && <p className="text-sm text-text-muted mt-1 line-clamp-2">vs. {h.usp}</p>}
              <span className="inline-flex items-center gap-1 text-accent text-sm font-medium mt-3">
                See the ranking <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>

        <p className="text-sm text-text-muted mt-10">
          Want the full picture instead? Browse all{' '}
          <Link href="/compare" className="text-accent hover:underline">head-to-head comparisons</Link> or model
          the multi-year cost with our{' '}
          <Link href="/calculator" className="text-accent hover:underline">True-Cost Calculator</Link>.
        </p>
      </Container>
    </section>
  );
}

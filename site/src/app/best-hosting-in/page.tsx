import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/layout';
import { getAllCompanies } from '@/lib/data';
import { TOP_COUNTRIES, countrySlug } from '@/lib/programmatic';

export const metadata: Metadata = {
  title: 'Best Web Hosting by Country (2026)',
  description: `Find the best web hosting for your country — providers ranked by rating, with in-country data centres and local-currency billing flagged. Pick your market to compare.`,
  alternates: { canonical: '/best-hosting-in' },
};

export default async function CountryHub() {
  const companies = await getAllCompanies();

  // Single pass: count hosts that target each curated country.
  const counts = new Map<string, number>();
  for (const c of companies.values()) {
    for (const country of c.regionalTargeting?.bestForCountries ?? []) {
      if ((TOP_COUNTRIES as readonly string[]).includes(country)) {
        counts.set(country, (counts.get(country) ?? 0) + 1);
      }
    }
  }

  return (
    <section className="py-12 sm:py-16">
      <Container size="md">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Best Hosting by Country</h1>
        <p className="text-lg text-text-secondary mb-10 max-w-2xl">
          The right host often depends on where your visitors are. Choose a country to see providers ranked by
          overall rating, with in-country data centres and local-currency billing flagged so you can cut
          latency and avoid surprise FX charges.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TOP_COUNTRIES.map((country) => (
            <Link
              key={country}
              href={`/best-hosting-in/${countrySlug(country)}`}
              className="group flex items-center justify-between bg-bg-secondary border border-border-subtle rounded-xl p-5 hover:border-accent/50 transition-colors"
            >
              <div>
                <h2 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                  {country}
                </h2>
                {counts.get(country) ? (
                  <p className="text-sm text-text-muted mt-1">{counts.get(country)} hosts compared</p>
                ) : null}
              </div>
              <ArrowRight className="w-5 h-5 text-accent group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

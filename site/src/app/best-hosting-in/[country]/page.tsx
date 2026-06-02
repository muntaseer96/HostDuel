import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Star, Server } from 'lucide-react';
import type { Metadata } from 'next';
import { Container } from '@/components/layout';
import { getCountryData, countrySlug, TOP_COUNTRIES } from '@/lib/programmatic';
import { SITE_NAME, SITE_DOMAIN } from '@/lib/constants';

const SLUG_TO_COUNTRY = new Map(TOP_COUNTRIES.map((c) => [countrySlug(c), c]));

// Only the curated markets exist — others 404 rather than generating thin pages.
export const dynamicParams = false;

export function generateStaticParams() {
  return TOP_COUNTRIES.map((c) => ({ country: countrySlug(c) }));
}

const fmtMoney = (n: number) => `$${n % 1 === 0 ? n : n.toFixed(2)}`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country: slug } = await params;
  const country = SLUG_TO_COUNTRY.get(slug);
  if (!country) return { title: 'Not Found' };
  const data = await getCountryData(country);
  if (!data) return { title: 'Not Found' };
  return {
    title: `Best Web Hosting in ${country} (2026): Top ${data.hosts.length} Compared | ${SITE_NAME}`,
    description: `The best web hosting for ${country} in 2026 — ${data.hosts.length} providers ranked, with ${data.localDataCenterCount} offering in-country data centres and local-currency billing. Real pricing, no fluff.`,
    alternates: { canonical: `/best-hosting-in/${slug}` },
    openGraph: { title: `Best Web Hosting in ${country} (2026)`, type: 'article' },
  };
}

export default async function CountryPage({ params }: { params: Promise<{ country: string }> }) {
  const { country: slug } = await params;
  const country = SLUG_TO_COUNTRY.get(slug);
  if (!country) notFound();
  const data = await getCountryData(country);
  if (!data) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best Web Hosting in ${country}`,
    url: `${SITE_DOMAIN}/best-hosting-in/${slug}`,
    numberOfItems: data.hosts.length,
    itemListElement: data.hosts.map((h, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: h.name,
      url: `${SITE_DOMAIN}/hosting/${h.id}`,
    })),
  };

  return (
    <section className="py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container size="md">
        <nav className="flex items-center gap-1 text-sm text-text-muted mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-accent">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-text-secondary">Best hosting in {country}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
          The best web hosting in {country} (2026)
        </h1>

        {/* Unique, data-derived intro */}
        <div className="text-lg text-text-secondary space-y-3 mb-10">
          <p>
            We track {data.hosts.length} hosting providers well-suited to {country}
            {data.localDataCenterCount > 0 ? (
              <>, {data.localDataCenterCount} of which run a data centre in or near {country}</>
            ) : null}
            . Picking one with a nearby data centre means lower latency for {country}-based visitors.
          </p>
          {(data.currencies.length > 0 || data.languages.length > 0) && (
            <p>
              {data.currencies.length > 0 && (
                <>Between them they bill in {data.currencies.join(', ')}. </>
              )}
              {data.languages.length > 0 && (
                <>Support is offered in {data.languages.slice(0, 6).join(', ')}. </>
              )}
              Below they&apos;re ranked by overall rating.
            </p>
          )}
        </div>

        {/* Host cards */}
        <div className="space-y-4">
          {data.hosts.map((h, i) => (
            <div key={h.id} className="bg-bg-secondary border border-border-subtle rounded-xl p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-text-muted text-sm font-mono mr-2">#{i + 1}</span>
                  <Link href={`/hosting/${h.id}`} className="text-xl font-bold text-foreground hover:text-accent">
                    {h.name}
                  </Link>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-text-muted">
                    {h.rating != null && (
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                        {h.rating}/5
                      </span>
                    )}
                    {h.effectiveMonthly != null && <span>{fmtMoney(h.effectiveMonthly)}/mo effective</span>}
                    {h.hasLocalDataCenter && (
                      <span className="inline-flex items-center gap-1 text-accent">
                        <Server className="w-3.5 h-3.5" /> Local data centre
                      </span>
                    )}
                    {h.localCurrency && <span className="text-text-secondary">Local-currency billing</span>}
                  </div>
                </div>
                <Link
                  href={`/go/${h.id}`}
                  className="shrink-0 text-sm bg-accent text-background font-semibold px-4 py-2 rounded-lg hover:opacity-90"
                >
                  Visit
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-text-muted mt-8">
          Rankings reflect {SITE_NAME}&apos;s overall rating across 355+ data points. &quot;Local data
          centre&quot; means the host operates infrastructure in {country}. Prices are effective monthly,
          including renewals.
        </p>

        {/* Inter-country navigation — connects the cluster for discovery */}
        <div className="mt-10 pt-6 border-t border-border-subtle">
          <h2 className="text-sm font-semibold text-foreground mb-3">Best hosting in other countries</h2>
          <div className="flex flex-wrap gap-2">
            {TOP_COUNTRIES.filter((c) => c !== country).map((c) => (
              <Link
                key={c}
                href={`/best-hosting-in/${countrySlug(c)}`}
                className="text-sm text-text-secondary border border-border-subtle rounded-full px-3 py-1 hover:border-accent/50 hover:text-accent transition-colors"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

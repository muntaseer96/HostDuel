import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Star } from 'lucide-react';
import type { Metadata } from 'next';
import { Container } from '@/components/layout';
import { getAlternativesData, TOP_HOSTS } from '@/lib/programmatic';
import { HOSTING_TYPES, SITE_NAME, SITE_DOMAIN, type HostingType } from '@/lib/constants';

// Only the curated top hosts exist — keeps the section focused, no thin-content sprawl.
export const dynamicParams = false;

export function generateStaticParams() {
  return TOP_HOSTS.map((host) => ({ host }));
}

const fmtMoney = (n: number) => `$${n % 1 === 0 ? n : n.toFixed(2)}`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ host: string }>;
}): Promise<Metadata> {
  const { host } = await params;
  const data = await getAlternativesData(host);
  if (!data) return { title: 'Alternatives Not Found' };
  const { anchor, alternatives } = data;
  const top = alternatives.slice(0, 3).map((a) => a.name).join(', ');
  return {
    title: `${alternatives.length} Best ${anchor.name} Alternatives in 2026 | ${SITE_NAME}`,
    description: `Looking for a ${anchor.name} alternative? We compare the top ${alternatives.length} options${
      top ? ` — including ${top}` : ''
    } — on real price, uptime, and ratings to help you switch with confidence.`,
    alternates: { canonical: `/alternatives/${host}` },
    openGraph: { title: `Best ${anchor.name} Alternatives (2026)`, type: 'article' },
  };
}

export default async function AlternativesPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  if (!(TOP_HOSTS as readonly string[]).includes(host)) notFound();
  const data = await getAlternativesData(host);
  if (!data || data.alternatives.length === 0) notFound();
  const { anchor, alternatives } = data;
  const typeLabel = anchor.hostingType ? HOSTING_TYPES[anchor.hostingType as HostingType] : 'hosting';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${anchor.name} Alternatives`,
    description: `Top ${alternatives.length} alternatives to ${anchor.name}, ranked by overall rating.`,
    url: `${SITE_DOMAIN}/alternatives/${host}`,
    numberOfItems: alternatives.length,
    itemListElement: alternatives.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: a.name,
      url: `${SITE_DOMAIN}/hosting/${a.id}`,
    })),
  };

  return (
    <section className="py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container size="md">
        <nav className="flex items-center gap-1 text-sm text-text-muted mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-accent">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/alternatives" className="hover:text-accent">Alternatives</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-text-secondary">{anchor.name}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
          The {alternatives.length} best {anchor.name} alternatives in 2026
        </h1>

        {/* Unique, data-derived intro */}
        <div className="text-lg text-text-secondary space-y-3 mb-10">
          <p>
            {anchor.name} is a {typeLabel.toLowerCase()} provider
            {anchor.usp ? <> known for {lcFirst(anchor.usp)}</> : null}
            {anchor.rating != null ? <>, rated {anchor.rating}/5 overall</> : null}
            {anchor.effectiveMonthly != null ? (
              <> at roughly {fmtMoney(anchor.effectiveMonthly)}/mo effective</>
            ) : null}
            . But it isn&apos;t the right fit for everyone.
          </p>
          {anchor.avoidIf ? (
            <p>
              You might be looking elsewhere if: {lcFirst(anchor.avoidIf)}. Below are the strongest
              alternatives we track in the same category, ranked by overall rating, with the specific reasons
              each one stands out against {anchor.name}.
            </p>
          ) : (
            <p>
              Below are the strongest alternatives we track in the same category, ranked by overall rating,
              with the specific reasons each one stands out against {anchor.name}.
            </p>
          )}
        </div>

        {/* Alternative cards */}
        <div className="space-y-4">
          {alternatives.map((alt, i) => (
            <div key={alt.id} className="bg-bg-secondary border border-border-subtle rounded-xl p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="text-text-muted text-sm font-mono mr-2">#{i + 1}</span>
                  <Link href={`/hosting/${alt.id}`} className="text-xl font-bold text-foreground hover:text-accent">
                    {alt.name}
                  </Link>
                  <div className="flex items-center gap-4 mt-1 text-sm text-text-muted">
                    {alt.rating != null && (
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                        {alt.rating}/5
                      </span>
                    )}
                    {alt.effectiveMonthly != null && <span>{fmtMoney(alt.effectiveMonthly)}/mo effective</span>}
                  </div>
                </div>
                <Link
                  href={`/go/${alt.id}`}
                  className="shrink-0 text-sm bg-accent text-background font-semibold px-4 py-2 rounded-lg hover:opacity-90"
                >
                  Visit
                </Link>
              </div>
              <ul className="space-y-1.5 mb-4">
                {alt.reasons.map((r, j) => (
                  <li key={j} className="flex gap-2 text-sm text-text-secondary">
                    <span className="text-accent">✓</span>
                    {r}
                  </li>
                ))}
              </ul>
              <Link href={`/compare/${alt.compareSlug}`} className="text-accent text-sm font-medium hover:underline">
                Compare {anchor.name} vs {alt.name} →
              </Link>
            </div>
          ))}
        </div>

        <p className="text-sm text-text-muted mt-8">
          Rankings are based on {SITE_NAME}&apos;s overall rating across 355+ data points. Prices shown are the
          effective monthly cost including renewals. See our{' '}
          <Link href="/calculator" className="text-accent hover:underline">True-Cost Calculator</Link> to model
          the multi-year cost of switching.
        </p>
      </Container>
    </section>
  );
}

function lcFirst(s: string): string {
  const trimmed = s.trim().replace(/\.$/, '');
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

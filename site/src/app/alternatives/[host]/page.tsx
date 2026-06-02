import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Star } from 'lucide-react';
import type { Metadata } from 'next';
import { Container } from '@/components/layout';
import { getAlternativesData, TOP_HOSTS } from '@/lib/programmatic';
import { SITE_NAME, SITE_DOMAIN } from '@/lib/constants';

export const dynamicParams = false;

export function generateStaticParams() {
  return TOP_HOSTS.map((host) => ({ host }));
}

const fmtMoney = (n: number) => `$${n % 1 === 0 ? n : n.toFixed(2)}`;
const fmtMarkup = (n: number) => `${Math.round(n)}%`;

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
    title: `${alternatives.length} Best ${anchor.name} Alternatives in 2026`,
    description: `Looking for a ${anchor.name} alternative? We compare the top ${alternatives.length} options${
      top ? ` — including ${top}` : ''
    } on real price, uptime, and ratings, with the reasons to switch and the trade-offs.`,
    alternates: { canonical: `/alternatives/${host}` },
    openGraph: { title: `Best ${anchor.name} Alternatives (2026)`, type: 'article' },
  };
}

export default async function AlternativesPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  if (!(TOP_HOSTS as readonly string[]).includes(host)) notFound();
  const data = await getAlternativesData(host);
  if (!data || data.alternatives.length === 0) notFound();
  const { anchor, alternatives, specs, faqs } = data;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_DOMAIN },
        { '@type': 'ListItem', position: 2, name: 'Alternatives', item: `${SITE_DOMAIN}/alternatives` },
        { '@type': 'ListItem', position: 3, name: `${anchor.name} Alternatives`, item: `${SITE_DOMAIN}/alternatives/${host}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Best ${anchor.name} Alternatives`,
      url: `${SITE_DOMAIN}/alternatives/${host}`,
      numberOfItems: alternatives.length,
      itemListElement: alternatives.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: a.name,
        url: `${SITE_DOMAIN}/hosting/${a.id}`,
      })),
    },
    faqs.length > 0 && {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ].filter(Boolean);

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

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 leading-tight">
          The {alternatives.length} best {anchor.name} alternatives in 2026
        </h1>

        <div className="text-lg text-text-secondary space-y-4 mb-10">
          {anchor.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {anchor.profile.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-foreground mb-3">About {anchor.name}</h2>
            <div className="text-text-secondary space-y-4 mb-10">
              {anchor.profile.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </>
        )}

        <h2 className="text-2xl font-bold text-foreground mb-3">Why look for a {anchor.name} alternative?</h2>
        <div className="text-text-secondary space-y-4 mb-10">
          {anchor.whySwitch.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-5">
          The top {alternatives.length} alternatives to {anchor.name}
        </h2>
        <div className="space-y-5 mb-12">
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
                  rel="sponsored"
                  className="shrink-0 text-sm bg-accent text-background font-semibold px-4 py-2 rounded-lg hover:opacity-90"
                >
                  Visit
                </Link>
              </div>

              <p className="text-text-secondary mb-4">{alt.summary}</p>

              <p className="text-sm font-semibold text-foreground mb-1.5">Why it beats {anchor.name}:</p>
              <ul className="space-y-1.5 mb-4">
                {alt.reasons.map((r, j) => (
                  <li key={j} className="flex gap-2 text-sm text-text-secondary">
                    <span className="text-accent">✓</span>
                    {r}
                  </li>
                ))}
              </ul>

              <Link href={`/compare/${alt.compareSlug}`} className="text-accent text-sm font-medium hover:underline">
                Full {anchor.name} vs {alt.name} comparison →
              </Link>
            </div>
          ))}
        </div>

        {/* Spec comparison table */}
        <h2 className="text-2xl font-bold text-foreground mb-4">{anchor.name} vs the alternatives at a glance</h2>
        <div className="overflow-x-auto mb-12">
          <table className="w-full text-sm border border-border-subtle rounded-lg overflow-hidden">
            <thead className="bg-bg-secondary text-text-muted">
              <tr>
                <th className="text-left font-semibold p-3">Host</th>
                <th className="text-right font-semibold p-3">Rating</th>
                <th className="text-right font-semibold p-3">Effective /mo</th>
                <th className="text-right font-semibold p-3 hidden sm:table-cell">Renewal markup</th>
                <th className="text-right font-semibold p-3 hidden md:table-cell">Uptime SLA</th>
              </tr>
            </thead>
            <tbody>
              {specs.map((s) => (
                <tr key={s.id} className={`border-t border-border-subtle ${s.id === anchor.id ? 'bg-accent/5' : ''}`}>
                  <td className="p-3">
                    <Link href={`/hosting/${s.id}`} className="text-foreground hover:text-accent font-medium">
                      {s.name}
                    </Link>
                    {s.id === anchor.id && <span className="ml-2 text-xs text-text-muted">(this host)</span>}
                  </td>
                  <td className="p-3 text-right font-mono text-text-secondary">{s.rating != null ? `${s.rating}/5` : '—'}</td>
                  <td className="p-3 text-right font-mono text-text-secondary">{s.effectiveMonthly != null ? fmtMoney(s.effectiveMonthly) : '—'}</td>
                  <td className="p-3 text-right font-mono hidden sm:table-cell">
                    {s.renewalMarkup != null ? (
                      <span className={s.renewalMarkup > 100 ? 'text-accent' : 'text-text-secondary'}>{fmtMarkup(s.renewalMarkup)}</span>
                    ) : '—'}
                  </td>
                  <td className="p-3 text-right font-mono text-text-secondary hidden md:table-cell">{s.uptime != null ? `${s.uptime}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Methodology */}
        <h2 className="text-2xl font-bold text-foreground mb-3">How we chose these alternatives</h2>
        <p className="text-text-secondary mb-10">
          We started with every {anchor.typeLabel} provider in our database, then added {anchor.name}&apos;s
          named competitors and any host that explicitly positions itself as an alternative to it. That
          shortlist is ranked by our overall rating — a weighted score across value for money, performance,
          support, security, features, ease of use, and transparency, drawn from 355+ data points per host.
          Prices throughout are the <em>effective</em> monthly cost over the first two years, so promotional
          rates and renewal increases are both accounted for rather than just the teaser price. Every figure
          is reviewed and refreshed monthly.
        </p>

        {/* FAQ */}
        {faqs.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-foreground mb-4">Frequently asked questions</h2>
            <div className="space-y-4 mb-10">
              {faqs.map((f, i) => (
                <div key={i} className="bg-bg-secondary border border-border-subtle rounded-lg p-5">
                  <h3 className="font-semibold text-foreground mb-2">{f.q}</h3>
                  <p className="text-sm text-text-secondary">{f.a}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Bottom line */}
        <div className="bg-bg-secondary border border-border-subtle rounded-xl p-6 mb-10">
          <h2 className="text-lg font-bold text-foreground mb-2">The bottom line</h2>
          <p className="text-text-secondary">{data.bottomLine}</p>
        </div>

        <p className="text-sm text-text-muted">
          Rankings are based on {SITE_NAME}&apos;s overall rating across 355+ data points; prices are the
          effective monthly cost including renewals. Model the multi-year cost of switching with our{' '}
          <Link href="/calculator" className="text-accent hover:underline">True-Cost Calculator</Link>, or see why
          renewal pricing matters in{' '}
          <Link href="/research/the-renewal-trap" className="text-accent hover:underline">The Renewal Trap</Link>.
        </p>
      </Container>
    </section>
  );
}

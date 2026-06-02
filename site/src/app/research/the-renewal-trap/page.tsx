import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Container } from '@/components/layout';
import { computeStudyFindings } from '@/lib/study-data';
import { SITE_NAME, SITE_DOMAIN, HOSTING_TYPES, type HostingType } from '@/lib/constants';

// First published with the June 2026 data sweep. dateModified tracks the live data.
const PUBLISHED = '2026-06-02';
const STUDY_PATH = '/research/the-renewal-trap';

const fmtPct = (n: number) => `${Math.round(n)}%`;
const fmtMoney = (n: number) => `$${n % 1 === 0 ? n : n.toFixed(2)}`;
const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export async function generateMetadata(): Promise<Metadata> {
  const f = await computeStudyFindings();
  const title = `The Renewal Trap: Web Hosting Renews at ${f.shared.avgMultiplier}× the Sign-Up Price`;
  const description = `Original ${SITE_NAME} study of ${f.shared.sampleSize} shared hosts: the average renewal markup is ${fmtPct(
    f.shared.avgMarkupPercent
  )}, with the worst offender raising prices by ${fmtPct(f.shared.worstOffenders[0]?.markupPercent ?? 0)} at renewal.`;
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: STUDY_PATH },
    openGraph: { title, description, type: 'article' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function RenewalTrapStudy() {
  const f = await computeStudyFindings();
  const dateModified = f.dataAsOf ?? PUBLISHED;
  const top = f.shared.worstOffenders;
  const maxMarkup = top[0]?.markupPercent ?? 100;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `The Renewal Trap: Web Hosting Renews at ${f.shared.avgMultiplier}× the Sign-Up Price`,
    description: `Original analysis of renewal markups across ${f.shared.sampleSize} shared web hosting providers.`,
    datePublished: PUBLISHED,
    dateModified,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_DOMAIN },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_DOMAIN },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_DOMAIN}${STUDY_PATH}` },
    url: `${SITE_DOMAIN}${STUDY_PATH}`,
    about: 'Web hosting renewal pricing and hidden fees',
    isAccessibleForFree: true,
  };

  return (
    <section className="py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container size="md">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-text-muted mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-accent">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/research" className="hover:text-accent">Research</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-text-secondary">The Renewal Trap</span>
        </nav>

        {/* Hero */}
        <p className="text-accent font-semibold text-sm uppercase tracking-wide mb-3">
          {SITE_NAME} Original Study
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
          The Renewal Trap: shared hosting renews at{' '}
          <span className="text-accent">{f.shared.avgMultiplier}× the sign-up price</span>
        </h1>
        <p className="text-lg text-text-secondary mb-2">
          We analyzed the published promotional and renewal pricing of {f.shared.sampleSize} shared
          hosting providers. On average, the renewal price is{' '}
          <strong className="text-foreground">{fmtPct(f.shared.avgMarkupPercent)} higher</strong> than the
          advertised sign-up price (median {fmtPct(f.shared.medianMarkupPercent)}). For{' '}
          {f.shared.withMarkupCount} of {f.shared.sampleSize} hosts, the price you pay in year two is
          higher — often dramatically — than the price that got you in the door.
        </p>
        <p className="text-sm text-text-muted mb-10">
          Based on {SITE_NAME}&apos;s dataset of {f.totalHosts} hosting providers · Data as of{' '}
          {fmtDate(dateModified)}
        </p>

        {/* Headline stat band */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <Stat value={`${f.shared.avgMultiplier}×`} label="Average price increase at renewal" />
          <Stat value={fmtPct(f.shared.avgMarkupPercent)} label="Average renewal markup" />
          <Stat
            value={fmtPct(top[0]?.markupPercent ?? 0)}
            label={`Worst offender (${top[0]?.name ?? '—'})`}
          />
        </div>

        {/* Worst offenders chart */}
        <h2 className="text-2xl font-bold text-foreground mb-2">The 10 worst renewal markups</h2>
        <p className="text-text-secondary mb-6">
          Promotional price vs. the price you actually renew at, for the shared hosts with the steepest
          jumps. Each bar is scaled to the markup percentage.
        </p>
        <div className="space-y-3 mb-12">
          {top.map((h) => (
            <div key={h.id} className="bg-bg-secondary border border-border-subtle rounded-lg p-4">
              <div className="flex items-baseline justify-between mb-2 gap-2">
                <Link href={`/hosting/${h.id}`} className="font-semibold text-foreground hover:text-accent">
                  {h.name}
                </Link>
                <span className="text-sm text-text-muted whitespace-nowrap">
                  {fmtMoney(h.promo)} → {fmtMoney(h.renewal)}/mo
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${Math.max(4, (h.markupPercent / maxMarkup) * 100)}%` }}
                  />
                </div>
                <span className="text-accent font-mono font-semibold text-sm w-20 text-right">
                  +{fmtPct(h.markupPercent)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* TCO shock */}
        <h2 className="text-2xl font-bold text-foreground mb-2">The two-year cost shock</h2>
        <p className="text-text-secondary mb-6">
          Markup percentages hide the real damage. Here are the largest dollar increases between the first
          year (with promo pricing) and the second year (at full renewal) across the whole dataset.
        </p>
        <div className="overflow-x-auto mb-12">
          <table className="w-full text-sm border border-border-subtle rounded-lg overflow-hidden">
            <thead className="bg-bg-secondary text-text-muted">
              <tr>
                <th className="text-left font-semibold p-3">Host</th>
                <th className="text-left font-semibold p-3 hidden sm:table-cell">Type</th>
                <th className="text-right font-semibold p-3">Year 1</th>
                <th className="text-right font-semibold p-3">Year 2</th>
                <th className="text-right font-semibold p-3">Increase</th>
              </tr>
            </thead>
            <tbody>
              {f.tco.biggestJumps.map((t) => (
                <tr key={t.id} className="border-t border-border-subtle">
                  <td className="p-3">
                    <Link href={`/hosting/${t.id}`} className="text-foreground hover:text-accent font-medium">
                      {t.name}
                    </Link>
                  </td>
                  <td className="p-3 text-text-muted hidden sm:table-cell">
                    {t.hostingType ? HOSTING_TYPES[t.hostingType as HostingType] ?? t.hostingType : '—'}
                  </td>
                  <td className="p-3 text-right text-text-secondary font-mono">{fmtMoney(t.firstYear)}</td>
                  <td className="p-3 text-right text-text-secondary font-mono">{fmtMoney(t.secondYear)}</td>
                  <td className="p-3 text-right text-accent font-mono font-semibold">+{fmtMoney(t.jump)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hidden fees */}
        <h2 className="text-2xl font-bold text-foreground mb-2">Beyond the markup: the hidden fees</h2>
        <p className="text-text-secondary mb-6">
          Renewal pricing isn&apos;t the only place costs hide. Across {f.totalHosts} providers we found:
        </p>
        <ul className="space-y-3 mb-4 text-text-secondary">
          <li className="flex gap-3">
            <span className="text-accent font-bold">{f.hiddenFees.noFreeDomainCount}</span>
            <span>of {f.totalHosts} hosts include <strong className="text-foreground">no free domain</strong>, adding ~$10–20/year on top of the advertised price.</span>
          </li>
          {f.hiddenFees.backupRestoreFeeHosts.length > 0 && (
            <li className="flex gap-3">
              <span className="text-accent font-bold">⚠</span>
              <span>
                Some hosts charge a fee just to <strong className="text-foreground">restore your own backup</strong>:{' '}
                {f.hiddenFees.backupRestoreFeeHosts.map((h, i) => (
                  <span key={h.id}>
                    {i > 0 && ', '}
                    <Link href={`/hosting/${h.id}`} className="text-accent hover:underline">
                      {h.name}
                    </Link>{' '}
                    ({fmtMoney(h.amount)})
                  </span>
                ))}
                .
              </span>
            </li>
          )}
          {f.hiddenFees.setupFeeHosts.length > 0 && (
            <li className="flex gap-3">
              <span className="text-accent font-bold">{f.hiddenFees.setupFeeHosts.length}</span>
              <span>
                still charge a one-time <strong className="text-foreground">setup fee</strong> (
                {f.hiddenFees.setupFeeHosts.map((h) => `${h.name} ${fmtMoney(h.amount)}`).join(', ')}).
              </span>
            </li>
          )}
          <li className="flex gap-3">
            <span className="text-accent font-bold">{f.hiddenFees.noMoneyBackCount}</span>
            <span>offer <strong className="text-foreground">no money-back guarantee</strong> at all (the average across the dataset is {f.hiddenFees.avgMoneyBackDays} days).</span>
          </li>
        </ul>

        {/* Press-ready key findings box */}
        <div className="bg-bg-secondary border border-border-subtle rounded-xl p-6 my-12">
          <h2 className="text-lg font-bold text-foreground mb-4">Key findings (cite this study)</h2>
          <ul className="space-y-2 text-sm text-text-secondary list-disc pl-5">
            <li>
              The average shared-hosting renewal markup is <strong className="text-foreground">{fmtPct(f.shared.avgMarkupPercent)}</strong> — prices grow to roughly{' '}
              <strong className="text-foreground">{f.shared.avgMultiplier}×</strong> the sign-up rate (median {fmtPct(f.shared.medianMarkupPercent)}), across {f.shared.sampleSize} providers.
            </li>
            {top[0] && (
              <li>
                <strong className="text-foreground">{top[0].name}</strong> has the steepest markup at{' '}
                <strong className="text-foreground">+{fmtPct(top[0].markupPercent)}</strong> ({fmtMoney(top[0].promo)} → {fmtMoney(top[0].renewal)}/mo).
              </li>
            )}
            {f.tco.biggestJumps[0] && (
              <li>
                The largest year-1 → year-2 cost jump is{' '}
                <strong className="text-foreground">{f.tco.biggestJumps[0].name}</strong> at{' '}
                <strong className="text-foreground">+{fmtMoney(f.tco.biggestJumps[0].jump)}</strong>.
              </li>
            )}
            <li>{f.hiddenFees.noFreeDomainCount} of {f.totalHosts} hosts include no free domain; {f.hiddenFees.noMoneyBackCount} offer no money-back guarantee.</li>
          </ul>
          <p className="text-xs text-text-muted mt-4">
            Source: {SITE_NAME} ({SITE_DOMAIN}{STUDY_PATH}), analysis of {f.totalHosts} hosting providers,
            data as of {fmtDate(dateModified)}. Free to cite with attribution and a link.
          </p>
        </div>

        {/* Methodology + CTA */}
        <h2 className="text-2xl font-bold text-foreground mb-2">How we measured this</h2>
        <p className="text-text-secondary mb-4">
          Renewal markup is calculated as <code className="text-accent">(renewal − promo) ÷ promo</code> using
          each host&apos;s cheapest published shared-hosting plan. Two-year cost compares the first-year total
          (promotional pricing plus any setup fee) against the second year at full renewal. All figures come
          from {SITE_NAME}&apos;s manually-reviewed dataset and are refreshed monthly — see our{' '}
          <Link href="/methodology" className="text-accent hover:underline">methodology</Link>.
        </p>
        <p className="text-text-secondary">
          Want to see what a host will <em>really</em> cost you over time? Browse our{' '}
          <Link href="/compare" className="text-accent hover:underline">side-by-side comparisons</Link> — every
          one shows the renewal price, not just the teaser rate.
        </p>
      </Container>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5 text-center">
      <div className="text-3xl font-bold text-accent mb-1">{value}</div>
      <div className="text-sm text-text-muted">{label}</div>
    </div>
  );
}

/**
 * programmatic.ts — data-driven page generators for /alternatives/[host] and
 * /best-hosting-in/[country].
 *
 * Both page types are scoped to a curated shortlist (see TOP_HOSTS / TOP_COUNTRIES)
 * chosen from Plausible traffic + GSC commercial intent — deliberately NOT every
 * host/country, to avoid the thin-content sprawl that got the site suppressed.
 * Every page's prose is derived from real data (price/rating/uptime deltas,
 * in-country data centres, supported currencies) so no two pages read alike.
 */
import { getAllCompanies } from './data';
import { getComparisonSlug } from './comparisons';
import type { Company, NumberOrUnlimited } from '@/types';

/**
 * Hosts to generate "Best X alternatives" pages for. Ranked from Plausible
 * /hosting/* traffic (90d, 2026-03→06), tie-broken by genuine engagement
 * (dwell/bounce) and commercial intent. Editable — pages regenerate from this list.
 */
export const TOP_HOSTS = [
  'wpx', 'ovhcloud', 'siteground', 'hostinger', 'render',
  'wpengine', 'linode', 'scalahosting', 'interserver', 'squarespace',
] as const;

/** Countries to generate "Best hosting in X" pages for — the best-covered markets. */
export const TOP_COUNTRIES = [
  'United States', 'United Kingdom', 'Australia', 'Germany', 'Canada',
  'Singapore', 'India', 'Brazil', 'Netherlands', 'Japan',
] as const;

export const countrySlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** A comparable monthly figure across hosting types (already type-normalised upstream). */
function effectiveMonthly(c: Company): number | null {
  const eff = c.pricingCalculated?.effectiveMonthlyAverage;
  if (isNum(eff) && eff > 0) return eff;
  const p = c.pricing;
  return (
    [p?.sharedHostingMonthlyRenewal, p?.vpsMonthlyRenewal, p?.wordpressHostingMonthlyRenewal].find(isNum) ?? null
  );
}

function storageLabel(v: NumberOrUnlimited | null | undefined): string | null {
  if (v == null) return null;
  return v === 'Unlimited' ? 'Unlimited storage' : `${v} GB storage`;
}

// ----------------------------------------------------------------------------
// Alternatives
// ----------------------------------------------------------------------------

export interface AlternativeEntry {
  id: string;
  name: string;
  rating: number | null;
  effectiveMonthly: number | null;
  trustpilot: number | null;
  /** Data-derived reasons this host is a worthwhile alternative to the anchor. */
  reasons: string[];
  /** Slug of the existing head-to-head compare page (anchor vs this alt). */
  compareSlug: string;
}

export interface AlternativesData {
  anchor: {
    id: string;
    name: string;
    hostingType: Company['basicInfo']['hostingType'];
    usp: string | null;
    avoidIf: string | null;
    effectiveMonthly: number | null;
    rating: number | null;
  };
  alternatives: AlternativeEntry[];
}

function nameToIdMap(companies: Map<string, Company>): Map<string, string> {
  const m = new Map<string, string>();
  for (const [id, c] of companies) m.set((c.basicInfo.companyName || '').toLowerCase().trim(), id);
  return m;
}

/** Reasons `alt` beats/differs from `anchor`, derived purely from the data. */
function buildReasons(anchor: Company, alt: Company): string[] {
  const reasons: string[] = [];
  const aEff = effectiveMonthly(anchor);
  const altEff = effectiveMonthly(alt);
  if (isNum(aEff) && isNum(altEff) && altEff < aEff * 0.9) {
    reasons.push(`Cheaper — about $${altEff.toFixed(2)}/mo effective vs $${aEff.toFixed(2)}/mo`);
  }
  const aRate = anchor.ratings?.overallRating;
  const altRate = alt.ratings?.overallRating;
  if (isNum(aRate) && isNum(altRate) && altRate > aRate) {
    reasons.push(`Higher overall rating (${altRate}/5 vs ${aRate}/5)`);
  }
  const aUp = anchor.serverPerformance?.uptimeGuaranteePercent;
  const altUp = alt.serverPerformance?.uptimeGuaranteePercent;
  if (isNum(aUp) && isNum(altUp) && altUp > aUp) {
    reasons.push(`Stronger uptime guarantee (${altUp}% vs ${aUp}%)`);
  }
  if (alt.migration?.freeMigration && !anchor.migration?.freeMigration) {
    reasons.push('Free migration if you switch');
  }
  const aTp = anchor.reputation?.trustpilotRating;
  const altTp = alt.reputation?.trustpilotRating;
  if (isNum(aTp) && isNum(altTp) && altTp > aTp + 0.3) {
    reasons.push(`Better Trustpilot score (${altTp} vs ${aTp})`);
  }
  // Fall back to the alt's own selling point so every card says something specific.
  if (reasons.length === 0) {
    const usp = alt.comparisonData?.uniqueSellingPoint;
    const store = storageLabel(alt.technicalSpecs?.storageGb);
    if (usp) reasons.push(usp);
    else if (store) reasons.push(store);
    else reasons.push('A solid same-category alternative');
  }
  return reasons.slice(0, 3);
}

export async function getAlternativesData(hostId: string): Promise<AlternativesData | null> {
  const companies = await getAllCompanies();
  const anchor = companies.get(hostId);
  if (!anchor) return null;

  const nameToId = nameToIdMap(companies);
  const candidateIds = new Set<string>();

  // 1) Same hosting type
  for (const [id, c] of companies) {
    if (id !== hostId && c.basicInfo.hostingType === anchor.basicInfo.hostingType) candidateIds.add(id);
  }
  // 2) Anchor's listed competitors (resolved to hosts we cover)
  for (const name of anchor.comparisonData?.primaryCompetitors ?? []) {
    const id = nameToId.get((name || '').toLowerCase().trim());
    if (id && id !== hostId) candidateIds.add(id);
  }
  // 3) Hosts that position themselves as an alternative to the anchor
  for (const [id, c] of companies) {
    const bat = c.comparisonData?.bestAlternativeTo;
    if (id !== hostId && bat && nameToId.get(bat.toLowerCase().trim()) === hostId) candidateIds.add(id);
  }

  const alternatives: AlternativeEntry[] = [...candidateIds]
    .map((id) => ({ id, company: companies.get(id) }))
    .filter((x): x is { id: string; company: Company } => !!x.company)
    .sort((a, b) => (b.company.ratings?.overallRating ?? 0) - (a.company.ratings?.overallRating ?? 0))
    .slice(0, 6)
    .map(({ id, company: alt }) => ({
      id,
      name: alt.basicInfo.companyName,
      rating: alt.ratings?.overallRating ?? null,
      effectiveMonthly: effectiveMonthly(alt),
      trustpilot: alt.reputation?.trustpilotRating ?? null,
      reasons: buildReasons(anchor, alt),
      compareSlug: getComparisonSlug(hostId, id),
    }));

  return {
    anchor: {
      id: hostId,
      name: anchor.basicInfo.companyName,
      hostingType: anchor.basicInfo.hostingType,
      usp: anchor.comparisonData?.uniqueSellingPoint ?? null,
      avoidIf: anchor.editorial?.avoidIf ?? null,
      effectiveMonthly: effectiveMonthly(anchor),
      rating: anchor.ratings?.overallRating ?? null,
    },
    alternatives,
  };
}

// ----------------------------------------------------------------------------
// Country
// ----------------------------------------------------------------------------

export interface CountryHostEntry {
  id: string;
  name: string;
  rating: number | null;
  effectiveMonthly: number | null;
  /** True if the host operates a data centre in this country. */
  hasLocalDataCenter: boolean;
  localCurrency: boolean;
}

export interface CountryData {
  country: string;
  hosts: CountryHostEntry[];
  currencies: string[];
  languages: string[];
  localDataCenterCount: number;
}

/** Currency codes commonly associated with each market (for the "bills in your currency" signal). */
const COUNTRY_CURRENCY: Record<string, string[]> = {
  'United States': ['USD'],
  'United Kingdom': ['GBP'],
  Australia: ['AUD'],
  Germany: ['EUR'],
  Canada: ['CAD'],
  Singapore: ['SGD'],
  India: ['INR'],
  Brazil: ['BRL'],
  Netherlands: ['EUR'],
  Japan: ['JPY'],
};

export async function getCountryData(country: string): Promise<CountryData | null> {
  const companies = await getAllCompanies();
  const wantCurrencies = COUNTRY_CURRENCY[country] ?? [];

  const hosts: CountryHostEntry[] = [];
  const currencies = new Set<string>();
  const languages = new Set<string>();
  let localDataCenterCount = 0;

  for (const [id, c] of companies) {
    if (!(c.regionalTargeting?.bestForCountries ?? []).includes(country)) continue;

    const hostCurrencies = c.regionalTargeting?.localCurrencyBilling ?? [];
    const localCurrency = hostCurrencies.some((cur) => wantCurrencies.includes(cur));
    hostCurrencies.forEach((cur) => currencies.add(cur));
    (c.regionalTargeting?.localSupportLanguages ?? []).forEach((l) => languages.add(l));

    const hasLocalDataCenter = (c.serverPerformance?.serverLocations ?? []).some((loc) =>
      loc.toLowerCase().includes(country.toLowerCase())
    );
    if (hasLocalDataCenter) localDataCenterCount++;

    hosts.push({
      id,
      name: c.basicInfo.companyName,
      rating: c.ratings?.overallRating ?? null,
      effectiveMonthly: effectiveMonthly(c),
      hasLocalDataCenter,
      localCurrency,
    });
  }

  if (hosts.length === 0) return null;

  hosts.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  return {
    country,
    hosts: hosts.slice(0, 10),
    currencies: [...currencies].sort(),
    languages: [...languages].sort(),
    localDataCenterCount,
  };
}

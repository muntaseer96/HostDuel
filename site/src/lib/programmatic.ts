/**
 * programmatic.ts — data-driven page generators for /alternatives/[host] and
 * /best-hosting-in/[country].
 *
 * Both page types are scoped to a curated shortlist (see TOP_HOSTS / TOP_COUNTRIES)
 * chosen from Plausible traffic + GSC commercial intent — deliberately NOT every
 * host/country, to avoid thin-content sprawl.
 *
 * Substance comes from the hand-written editorial the dataset already holds
 * (basicInfo.notes, editorial.knownIssues/bestFor/avoidIf, comparisonData.*,
 * faqContent.*) plus computed price/rating/uptime deltas. Per-host writeups are
 * framed relative to the anchor host / target country so the same provider reads
 * differently on each page rather than producing duplicate content.
 */
import { getAllCompanies } from './data';
import { getComparisonSlug } from './comparisons';
import { HOSTING_TYPES } from './constants';
import type { Company, NumberOrUnlimited, HostingType } from '@/types';

export const TOP_HOSTS = [
  'wpx', 'ovhcloud', 'siteground', 'hostinger', 'render',
  'wpengine', 'linode', 'scalahosting', 'interserver', 'squarespace',
] as const;

export const TOP_COUNTRIES = [
  'United States', 'United Kingdom', 'Australia', 'Germany', 'Canada',
  'Singapore', 'India', 'Brazil', 'Netherlands', 'Japan',
] as const;

export const countrySlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const typeLabel = (t: HostingType | null): string =>
  t ? (HOSTING_TYPES[t] ?? 'hosting').toLowerCase() : 'hosting';

/** Adjacent hosting types — used to widen the alternatives pool for niche categories
 *  (e.g. a PaaS or website-builder host has few same-type peers). */
const TYPE_NEIGHBORS: Record<string, HostingType[]> = {
  shared: ['managed-wordpress'],
  'managed-wordpress': ['shared', 'vps'],
  vps: ['cloud-iaas', 'dedicated'],
  'cloud-iaas': ['vps', 'paas'],
  dedicated: ['vps', 'cloud-iaas'],
  paas: ['jamstack', 'cloud-iaas'],
  jamstack: ['paas', 'cloud-iaas'],
  'website-builder': ['ecommerce-platform'],
  'ecommerce-platform': ['website-builder'],
  'domain-registrar': ['shared'],
  'cdn-security': ['cloud-iaas'],
};

const RATING_LABELS: Record<string, string> = {
  valueForMoney: 'value for money',
  performance: 'performance',
  supportQuality: 'support',
  security: 'security',
  features: 'features',
  easeOfUse: 'ease of use',
  transparency: 'transparency',
};

/** Split a "A; B; C" or "A. B." editorial field into its first n clauses. */
function clauses(text: string | null | undefined, n: number): string[] {
  if (!text) return [];
  return text
    .split(/;|(?<=[a-z0-9)])\.\s+/i)
    .map((s) => s.trim().replace(/\.$/, ''))
    .filter(Boolean)
    .slice(0, n);
}
function firstClause(text: string | null | undefined): string | null {
  return clauses(text, 1)[0] ?? null;
}
const lcFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const fmtMoney = (n: number) => `$${n % 1 === 0 ? n : n.toFixed(2)}`;

/** Identity sentence that won't double up the type noun when the USP already names it. */
function identitySentence(name: string, type: HostingType | null, usp: string | null | undefined, founded = ''): string {
  const tl = typeLabel(type);
  if (!usp) return `${name}${founded} is a ${tl} provider.`;
  const u = usp.toLowerCase();
  const typeWord = tl.split(' ')[0];
  const overlaps = u.includes(tl) || (typeWord.length > 4 && u.includes(typeWord));
  return overlaps
    ? `${name}${founded} is known for ${lcFirst(usp)}.`
    : `${name}${founded} is a ${tl} provider known for ${lcFirst(usp)}.`;
}

function effectiveMonthly(c: Company): number | null {
  const eff = c.pricingCalculated?.effectiveMonthlyAverage;
  if (isNum(eff) && eff > 0) return eff;
  const p = c.pricing;
  return [p?.sharedHostingMonthlyRenewal, p?.vpsMonthlyRenewal, p?.wordpressHostingMonthlyRenewal].find(isNum) ?? null;
}
function storageLabel(v: NumberOrUnlimited | null | undefined): string | null {
  if (v == null) return null;
  return v === 'Unlimited' ? 'unlimited storage' : `${v} GB storage`;
}

/** One sentence on a host's strongest and weakest scoring dimensions. */
function ratingsBreakdown(c: Company): string | null {
  const r = c.ratings;
  if (!r) return null;
  const dims = Object.keys(RATING_LABELS)
    .map((k) => ({ k, v: (r as unknown as Record<string, number>)[k] }))
    .filter((d) => isNum(d.v));
  if (dims.length < 3) return null;
  const sorted = [...dims].sort((a, b) => b.v - a.v);
  const top = sorted.slice(0, 2).map((d) => `${RATING_LABELS[d.k]} (${d.v}/5)`);
  const bottom = sorted.slice(-2).map((d) => `${RATING_LABELS[d.k]} (${d.v}/5)`);
  return `Across our eight scoring dimensions, ${c.basicInfo.companyName} is strongest on ${top.join(' and ')}, and weakest on ${bottom.join(' and ')}.`;
}

/** One short clause on uptime SLA + support channels, e.g. "It backs this with a 99.9% uptime SLA and 24/7 live chat." */
function supportUptimeClause(c: Company): string | null {
  const bits: string[] = [];
  const up = c.serverPerformance?.uptimeGuaranteePercent;
  if (isNum(up)) bits.push(`a ${up}% uptime SLA`);
  if (c.support?.liveChatAvailable) bits.push(`${c.support.liveChatHours === '24/7' ? '24/7 ' : ''}live chat`);
  else if (c.support?.phoneSupportAvailable) bits.push('phone support');
  if (bits.length === 0) return null;
  return `It backs this with ${bits.join(' and ')}.`;
}

/** One sentence summarising headline pricing and policies. */
function pricingFacts(c: Company): string | null {
  const p = c.pricing;
  if (!p) return null;
  const bits: string[] = [];
  const promo = [p.sharedHostingMonthlyPromo, p.vpsMonthlyLowest, p.wordpressHostingMonthlyPromo].find(isNum);
  const renew = [p.sharedHostingMonthlyRenewal, p.vpsMonthlyRenewal, p.wordpressHostingMonthlyRenewal].find(isNum);
  const mk = c.pricingCalculated?.renewalMarkupPercent;
  if (isNum(promo)) {
    let s = `Entry pricing starts around ${fmtMoney(promo)}/mo`;
    if (isNum(renew) && renew !== promo) s += `, renewing near ${fmtMoney(renew)}/mo${isNum(mk) && mk > 0 ? ` (a ${Math.round(mk)}% increase)` : ''}`;
    bits.push(s);
  }
  if (isNum(p.moneyBackGuaranteeDays)) {
    bits.push(p.moneyBackGuaranteeDays > 0 ? `there's a ${p.moneyBackGuaranteeDays}-day money-back guarantee` : 'there is no money-back guarantee');
  }
  if (p.freeDomainIncluded === true) bits.push('a free domain is included');
  else if (p.freeDomainIncluded === false) bits.push('no free domain is included');
  if (isNum(p.setupFee) && p.setupFee > 0) bits.push(`a ${fmtMoney(p.setupFee)} setup fee applies`);
  if (bits.length === 0) return null;
  return bits.join('; ').replace(/^(.)/, (m) => m.toUpperCase()) + '.';
}

// ----------------------------------------------------------------------------
// Shared shapes
// ----------------------------------------------------------------------------

export interface Faq {
  q: string;
  a: string;
}

export interface SpecRow {
  id: string;
  name: string;
  rating: number | null;
  effectiveMonthly: number | null;
  renewalMarkup: number | null;
  uptime: number | null;
  trustpilot: number | null;
  storage: string | null;
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
  reasons: string[];
  /** 2–4 sentence, anchor-relative prose writeup. */
  summary: string;
  bestFor: string | null;
  idealCustomerProfile: string | null;
  compareSlug: string;
}

export interface AlternativesData {
  anchor: {
    id: string;
    name: string;
    hostingType: HostingType | null;
    typeLabel: string;
    intro: string[]; // paragraphs
    profile: string[]; // "About X" — ratings + pricing depth
    whySwitch: string[]; // paragraphs
    rating: number | null;
  };
  alternatives: AlternativeEntry[];
  specs: SpecRow[];
  faqs: Faq[];
  bottomLine: string;
}

function nameToIdMap(companies: Map<string, Company>): Map<string, string> {
  const m = new Map<string, string>();
  for (const [id, c] of companies) m.set((c.basicInfo.companyName || '').toLowerCase().trim(), id);
  return m;
}

function buildReasons(anchor: Company, alt: Company): string[] {
  const reasons: string[] = [];
  const aEff = effectiveMonthly(anchor);
  const altEff = effectiveMonthly(alt);
  if (isNum(aEff) && isNum(altEff) && altEff < aEff * 0.9) {
    reasons.push(`Cheaper — about ${fmtMoney(altEff)}/mo effective vs ${fmtMoney(aEff)}/mo`);
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
  if (alt.migration?.freeMigration && !anchor.migration?.freeMigration) reasons.push('Free migration if you switch');
  const aTp = anchor.reputation?.trustpilotRating;
  const altTp = alt.reputation?.trustpilotRating;
  if (isNum(aTp) && isNum(altTp) && altTp > aTp + 0.3) {
    reasons.push(`Better Trustpilot score (${altTp} vs ${aTp})`);
  }
  if (anchor.pricing?.freeDomainIncluded === false && alt.pricing?.freeDomainIncluded === true) {
    reasons.push('Includes a free domain (the anchor does not)');
  }
  if (reasons.length === 0) {
    const usp = alt.comparisonData?.uniqueSellingPoint;
    reasons.push(usp ? usp : 'A solid same-category alternative');
  }
  return reasons.slice(0, 4);
}

/** Compose an anchor-relative prose writeup for an alternative. */
function altSummary(anchorName: string, alt: Company): string {
  const parts: string[] = [];
  const name = alt.basicInfo.companyName;
  const founded = isNum(alt.basicInfo.yearFounded) ? ` (founded ${alt.basicInfo.yearFounded})` : '';
  parts.push(identitySentence(name, alt.basicInfo.hostingType, alt.comparisonData?.uniqueSellingPoint, founded));

  const altEff = effectiveMonthly(alt);
  const mk = alt.pricingCalculated?.renewalMarkupPercent;
  if (isNum(altEff)) {
    let priceSentence = `It works out to about ${fmtMoney(altEff)}/mo effective over the first two years`;
    if (isNum(mk) && mk > 0) priceSentence += `, after a ${Math.round(mk)}% jump from promo to renewal`;
    parts.push(priceSentence + '.');
  }

  const icp = alt.comparisonData?.idealCustomerProfile;
  const best = firstClause(alt.editorial?.bestFor);
  if (icp) parts.push(`It suits ${lcFirst(icp)}.`);
  else if (best) parts.push(`It's a strong pick for ${lcFirst(best)}.`);

  const su = supportUptimeClause(alt);
  if (su) parts.push(su);

  const issue = firstClause(alt.editorial?.knownIssues);
  if (issue) parts.push(`Worth weighing against ${anchorName}: ${lcFirst(issue)}.`);

  return parts.join(' ');
}

function specRow(c: Company, id: string): SpecRow {
  return {
    id,
    name: c.basicInfo.companyName,
    rating: c.ratings?.overallRating ?? null,
    effectiveMonthly: effectiveMonthly(c),
    renewalMarkup: c.pricingCalculated?.renewalMarkupPercent ?? null,
    uptime: c.serverPerformance?.uptimeGuaranteePercent ?? null,
    trustpilot: c.reputation?.trustpilotRating ?? null,
    storage: storageLabel(c.technicalSpecs?.storageGb),
  };
}

export async function getAlternativesData(hostId: string): Promise<AlternativesData | null> {
  const companies = await getAllCompanies();
  const anchor = companies.get(hostId);
  if (!anchor) return null;

  const nameToId = nameToIdMap(companies);
  const anchorType = anchor.basicInfo.hostingType;
  const candidateIds = new Set<string>();
  for (const [id, c] of companies) {
    if (id !== hostId && c.basicInfo.hostingType === anchorType) candidateIds.add(id);
  }
  for (const name of anchor.comparisonData?.primaryCompetitors ?? []) {
    const id = nameToId.get((name || '').toLowerCase().trim());
    if (id && id !== hostId) candidateIds.add(id);
  }
  for (const [id, c] of companies) {
    const bat = c.comparisonData?.bestAlternativeTo;
    if (id !== hostId && bat && nameToId.get(bat.toLowerCase().trim()) === hostId) candidateIds.add(id);
  }
  // Widen the pool for niche categories so every page lists ~6 sensible alternatives.
  if (candidateIds.size < 6 && anchorType) {
    for (const neighbor of TYPE_NEIGHBORS[anchorType] ?? []) {
      for (const [id, c] of companies) {
        if (id !== hostId && c.basicInfo.hostingType === neighbor) candidateIds.add(id);
      }
    }
  }

  const ranked = [...candidateIds]
    .map((id) => ({ id, company: companies.get(id) }))
    .filter((x): x is { id: string; company: Company } => !!x.company)
    .sort((a, b) => (b.company.ratings?.overallRating ?? 0) - (a.company.ratings?.overallRating ?? 0))
    .slice(0, 6);

  const alternatives: AlternativeEntry[] = ranked.map(({ id, company: alt }) => ({
    id,
    name: alt.basicInfo.companyName,
    rating: alt.ratings?.overallRating ?? null,
    effectiveMonthly: effectiveMonthly(alt),
    trustpilot: alt.reputation?.trustpilotRating ?? null,
    reasons: buildReasons(anchor, alt),
    summary: altSummary(anchor.basicInfo.companyName, alt),
    bestFor: firstClause(alt.editorial?.bestFor),
    idealCustomerProfile: alt.comparisonData?.idealCustomerProfile ?? null,
    compareSlug: getComparisonSlug(hostId, id),
  }));

  // --- Anchor intro paragraphs (from notes + USP + ratings + pricing) ---
  const name = anchor.basicInfo.companyName;
  const aEff = effectiveMonthly(anchor);
  const aMk = anchor.pricingCalculated?.renewalMarkupPercent;
  const intro: string[] = [];
  {
    const p1: string[] = [];
    p1.push(identitySentence(name, anchor.basicInfo.hostingType, anchor.comparisonData?.uniqueSellingPoint));
    if (isNum(anchor.ratings?.overallRating)) {
      p1.push(`We rate it ${anchor.ratings.overallRating}/5 overall across 355+ data points.`);
    }
    if (isNum(anchor.reputation?.trustpilotRating) && isNum(anchor.reputation?.trustpilotReviewsCount)) {
      p1.push(`Its Trustpilot score sits at ${anchor.reputation.trustpilotRating} from ${anchor.reputation.trustpilotReviewsCount.toLocaleString()} reviews.`);
    }
    intro.push(p1.join(' '));
  }
  if (anchor.basicInfo.notes) {
    intro.push(firstClause(anchor.basicInfo.notes) ? clauses(anchor.basicInfo.notes, 3).join('. ') + '.' : anchor.basicInfo.notes);
  }

  // --- "About {anchor}" profile (ratings + pricing depth — guarantees substance) ---
  const profile: string[] = [];
  {
    const rb = ratingsBreakdown(anchor);
    const pf = pricingFacts(anchor);
    const para1: string[] = [];
    if (rb) para1.push(rb);
    if (pf) para1.push(pf);
    if (para1.length) profile.push(para1.join(' '));
    const bestForClauses = clauses(anchor.editorial?.bestFor, 4);
    if (bestForClauses.length) {
      profile.push(`${name} is generally a good fit for ${bestForClauses.map(lcFirst).join('; ')}.`);
    }
  }

  // --- Why switch (from knownIssues / avoidIf / markup) ---
  const whySwitch: string[] = [];
  {
    const lead: string[] = [];
    if (isNum(aMk) && aMk > 50) {
      lead.push(`The biggest reason people look elsewhere is renewal pricing: ${name}'s rate climbs about ${Math.round(aMk)}% from promo to renewal${isNum(aEff) ? ` (roughly ${fmtMoney(aEff)}/mo effective over two years)` : ''}.`);
    } else if (isNum(aEff)) {
      lead.push(`${name} runs about ${fmtMoney(aEff)}/mo effective over two years, and depending on your needs a competitor may deliver more for the money.`);
    }
    const issues = clauses(anchor.editorial?.knownIssues, 3);
    if (issues.length) lead.push(`Common complaints include: ${issues.map(lcFirst).join('; ')}.`);
    const avoid = clauses(anchor.editorial?.avoidIf, 3);
    if (avoid.length) lead.push(`You should especially weigh alternatives if you ${avoid.map(lcFirst).join(', or ')}.`);
    if (lead.length) whySwitch.push(lead.join(' '));
  }
  whySwitch.push(
    `Below are the ${alternatives.length} strongest ${typeLabel(anchor.basicInfo.hostingType)} alternatives to ${name} we track, ranked by overall rating, each with the specific, data-backed reasons it stands out — and the trade-offs to keep in mind.`
  );

  // --- FAQ ---
  const faqs: Faq[] = [];
  const best = alternatives[0];
  if (best) {
    faqs.push({
      q: `What is the best alternative to ${name}?`,
      a: `By overall rating, ${best.name} is the strongest alternative we track${isNum(best.rating) ? ` (${best.rating}/5)` : ''}. ${best.idealCustomerProfile ? `It's especially well-suited to ${lcFirst(best.idealCustomerProfile)}.` : ''}`,
    });
  }
  const cheapest = [...alternatives].filter((a) => isNum(a.effectiveMonthly)).sort((a, b) => (a.effectiveMonthly! - b.effectiveMonthly!))[0];
  if (cheapest) {
    faqs.push({
      q: `Is there a cheaper alternative to ${name}?`,
      a: `Yes — ${cheapest.name} is the most affordable option here at about ${fmtMoney(cheapest.effectiveMonthly!)}/mo effective${isNum(aEff) ? `, versus ${name}'s ${fmtMoney(aEff)}/mo` : ''}.`,
    });
  }
  if (anchor.faqContent?.faqHowMuchDoesItCost) {
    faqs.push({ q: `How much does ${name} cost?`, a: anchor.faqContent.faqHowMuchDoesItCost });
  }
  const avoidFirst = firstClause(anchor.editorial?.avoidIf);
  if (avoidFirst) {
    faqs.push({
      q: `Why do people switch away from ${name}?`,
      a: `The most common reasons are ${clauses(anchor.editorial?.knownIssues, 3).map(lcFirst).join('; ') || lcFirst(avoidFirst)}. If any of those are dealbreakers for you, one of the alternatives above will likely fit better.`,
    });
  }

  const specs: SpecRow[] = [specRow(anchor, hostId), ...ranked.map(({ id, company }) => specRow(company, id))];

  // --- Bottom line recommendation ---
  const cheapestAlt = [...alternatives].filter((a) => isNum(a.effectiveMonthly)).sort((a, b) => a.effectiveMonthly! - b.effectiveMonthly!)[0];
  const blParts: string[] = [];
  if (best) {
    blParts.push(`If you're leaving ${name}, ${best.name} is our top-rated alternative${isNum(best.rating) ? ` (${best.rating}/5)` : ''}`);
    if (cheapestAlt && cheapestAlt.id !== best.id && isNum(cheapestAlt.effectiveMonthly)) {
      blParts.push(`while ${cheapestAlt.name} is the best value at about ${fmtMoney(cheapestAlt.effectiveMonthly)}/mo`);
    }
  }
  const bottomLine =
    (blParts.join(', ') + '.') +
    ` Whichever you pick, run it through our True-Cost Calculator first — the cheapest sticker price rarely stays the cheapest once renewals kick in.`;

  return {
    anchor: {
      id: hostId,
      name,
      hostingType: anchor.basicInfo.hostingType,
      typeLabel: typeLabel(anchor.basicInfo.hostingType),
      intro,
      profile,
      whySwitch,
      rating: anchor.ratings?.overallRating ?? null,
    },
    alternatives,
    specs,
    faqs,
    bottomLine,
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
  hasLocalDataCenter: boolean;
  localCurrency: boolean;
  summary: string;
}

export interface CountryData {
  country: string;
  intro: string[];
  whatMatters: string[];
  hosts: CountryHostEntry[];
  specs: SpecRow[];
  faqs: Faq[];
  bottomLine: string;
  currencies: string[];
  languages: string[];
  compliance: string[];
  localDataCenterCount: number;
}

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

function countryHostSummary(country: string, c: Company, hasLocalDc: boolean, localCurrency: boolean): string {
  const name = c.basicInfo.companyName;
  const parts: string[] = [];
  parts.push(identitySentence(name, c.basicInfo.hostingType, c.comparisonData?.uniqueSellingPoint));
  const dcSentence =
    hasLocalDc
      ? `It runs infrastructure in ${country}, so ${country}-based visitors get lower latency`
      : `It doesn't operate a data centre in ${country}, but a nearby region plus its CDN keeps performance reasonable`;
  parts.push(dcSentence + '.');
  if (localCurrency) parts.push(`It bills in your local currency, avoiding foreign-exchange surprises.`);
  const icp = c.comparisonData?.idealCustomerProfile;
  const eff = effectiveMonthly(c);
  const tail: string[] = [];
  if (icp) tail.push(`best suited to ${lcFirst(icp)}`);
  if (isNum(eff)) tail.push(`about ${fmtMoney(eff)}/mo effective`);
  if (tail.length) parts.push(`It's ${tail.join(', ')}.`);
  const su = supportUptimeClause(c);
  if (su) parts.push(su);
  return parts.join(' ');
}

export async function getCountryData(country: string): Promise<CountryData | null> {
  const companies = await getAllCompanies();
  const wantCurrencies = COUNTRY_CURRENCY[country] ?? [];

  const matched: { id: string; c: Company; hasLocalDc: boolean; localCurrency: boolean }[] = [];
  const currencies = new Set<string>();
  const languages = new Set<string>();
  const compliance = new Set<string>();

  for (const [id, c] of companies) {
    if (!(c.regionalTargeting?.bestForCountries ?? []).includes(country)) continue;
    const hostCurrencies = c.regionalTargeting?.localCurrencyBilling ?? [];
    const localCurrency = hostCurrencies.some((cur) => wantCurrencies.includes(cur));
    hostCurrencies.forEach((cur) => currencies.add(cur));
    (c.regionalTargeting?.localSupportLanguages ?? []).forEach((l) => languages.add(l));
    (c.regionalTargeting?.dataSovereigntyCompliance ?? []).forEach((x) => compliance.add(x));
    const hasLocalDc = (c.serverPerformance?.serverLocations ?? []).some((loc) =>
      loc.toLowerCase().includes(country.toLowerCase())
    );
    matched.push({ id, c, hasLocalDc, localCurrency });
  }
  if (matched.length === 0) return null;

  matched.sort((a, b) => (b.c.ratings?.overallRating ?? 0) - (a.c.ratings?.overallRating ?? 0));
  const localDataCenterCount = matched.filter((m) => m.hasLocalDc).length;
  const top = matched.slice(0, 10);

  // Hosting-type mix among the matched providers (data-derived, unique per country).
  const typeCounts = new Map<HostingType, number>();
  for (const m of matched) {
    const t = m.c.basicInfo.hostingType;
    if (t) typeCounts.set(t, (typeCounts.get(t) ?? 0) + 1);
  }
  const typeMix = [...typeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([t, n]) => `${n} ${typeLabel(t)}`)
    .join(', ');

  const hosts: CountryHostEntry[] = top.map(({ id, c, hasLocalDc, localCurrency }) => ({
    id,
    name: c.basicInfo.companyName,
    rating: c.ratings?.overallRating ?? null,
    effectiveMonthly: effectiveMonthly(c),
    hasLocalDataCenter: hasLocalDc,
    localCurrency,
    summary: countryHostSummary(country, c, hasLocalDc, localCurrency),
  }));

  // Intro
  const intro: string[] = [];
  intro.push(
    `Choosing a web host for ${country} comes down to more than price. We track ${matched.length} providers well-suited to ${country}, ${localDataCenterCount > 0 ? `${localDataCenterCount} of which run a data centre in or near the country` : 'served via nearby regions and global CDNs'}. The closer the server is to your audience, the faster your pages load — a ranking and conversion factor you can't ignore.`
  );
  const curList = [...currencies].sort();
  const langList = [...languages].sort();
  if (curList.length || langList.length) {
    intro.push(
      `${curList.length ? `Between them these hosts bill in ${curList.join(', ')}. ` : ''}${langList.length ? `Support is available in ${langList.slice(0, 8).join(', ')}. ` : ''}Below they're ranked by our overall rating across 355+ data points.`
    );
  }

  // What matters
  const whatMatters: string[] = [];
  whatMatters.push(
    `For ${country}-focused sites, prioritise three things. First, server location: ${localDataCenterCount > 0 ? `${localDataCenterCount} of these hosts have in-country infrastructure, which we flag below` : 'none operate a data centre directly in-country, so favour ones with the nearest region'}. Second, billing currency — paying in ${wantCurrencies[0] ?? 'your local currency'} avoids conversion fees and fluctuating charges${curList.some((c) => wantCurrencies.includes(c)) ? ', which several hosts here support' : ''}. Third, support hours and language that overlap your timezone.`
  );
  if (typeMix) {
    whatMatters.push(
      `The ${matched.length} providers we track for ${country} span the full range — ${typeMix} options among them — so whether you want cheap shared hosting to start, managed WordPress, or a scalable cloud VPS, there's a fit. The ranking below mixes types and is ordered purely by overall quality; filter by what you actually need.`
    );
  }
  if (compliance.size) {
    whatMatters.push(
      `On compliance, hosts serving ${country} commonly cover ${[...compliance].sort().join(', ')} — relevant if you handle customer data or payments.`
    );
  }

  // FAQ
  const faqs: Faq[] = [];
  const bestHost = hosts[0];
  if (bestHost) {
    faqs.push({
      q: `What is the best web host for ${country}?`,
      a: `By our overall rating, ${bestHost.name} leads our ${country} list${isNum(bestHost.rating) ? ` at ${bestHost.rating}/5` : ''}${bestHost.hasLocalDataCenter ? `, and it runs infrastructure in ${country}` : ''}.`,
    });
  }
  if (localDataCenterCount > 0) {
    const dcHosts = top.filter((m) => m.hasLocalDc).map((m) => m.c.basicInfo.companyName);
    faqs.push({
      q: `Which hosts have a data centre in ${country}?`,
      a: `${dcHosts.slice(0, 6).join(', ')}${dcHosts.length ? ' run infrastructure in or near ' + country + ', which lowers latency for local visitors.' : ''}`,
    });
  }
  const cheapest = [...hosts].filter((h) => isNum(h.effectiveMonthly)).sort((a, b) => a.effectiveMonthly! - b.effectiveMonthly!)[0];
  if (cheapest) {
    faqs.push({
      q: `What's the cheapest hosting for ${country}?`,
      a: `Among hosts suited to ${country}, ${cheapest.name} is the most affordable at about ${fmtMoney(cheapest.effectiveMonthly!)}/mo effective, including renewal pricing.`,
    });
  }

  const specs: SpecRow[] = top.map(({ id, c }) => specRow(c, id));

  // Bottom line
  const cheapestC = [...hosts].filter((h) => isNum(h.effectiveMonthly)).sort((a, b) => a.effectiveMonthly! - b.effectiveMonthly!)[0];
  const localPick = hosts.find((h) => h.hasLocalDataCenter);
  const blParts: string[] = [];
  if (bestHost) blParts.push(`For most ${country} sites, ${bestHost.name} is our top overall pick`);
  if (cheapestC && cheapestC.id !== bestHost?.id && isNum(cheapestC.effectiveMonthly)) {
    blParts.push(`${cheapestC.name} is the best value at about ${fmtMoney(cheapestC.effectiveMonthly)}/mo`);
  }
  if (localPick && localPick.id !== bestHost?.id && localPick.id !== cheapestC?.id) {
    blParts.push(`and ${localPick.name} is worth a look if an in-country data centre is your priority`);
  }
  const bottomLine = blParts.length ? blParts.join(', ').replace(/,([^,]*)$/, ',$1') + '.' : '';

  return {
    country,
    intro,
    whatMatters,
    hosts,
    specs,
    faqs,
    bottomLine,
    currencies: curList,
    languages: langList,
    compliance: [...compliance].sort(),
    localDataCenterCount,
  };
}

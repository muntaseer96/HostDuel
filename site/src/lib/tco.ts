/**
 * tco.ts — the true-cost-of-ownership engine behind /calculator.
 *
 * Ranks hosts by what they ACTUALLY cost over a multi-year term, using the same
 * trusted `firstYearCost` / `secondYearCost` fields the rest of the site relies on
 * (year 1 = promo pricing + any setup fee; year 2+ = full renewal). The "renewal
 * tax" surfaces how much the promo→renewal jump adds versus a world where the
 * sign-up price simply held — the interactive companion to the Renewal Trap study.
 *
 * Pure functions only, so the same code runs on the server (SSR default ranking)
 * and in the client component (live re-ranking) with identical results.
 */
import type { HostingType, NumberOrUnlimited } from '@/types';

/** Slim, serializable row passed from the server page into the client component. */
export interface TcoHost {
  id: string;
  name: string;
  hostingType: HostingType | null;
  firstYearCost: number | null;
  secondYearCost: number | null;
  renewalMarkupPercent: number | null;
  maxWebsites: NumberOrUnlimited | null;
}

export interface TcoOptions {
  /** Term length in years (1–3). */
  years: number;
  /** Restrict to a hosting type, or 'any'. */
  type: HostingType | 'any';
  /** Only include hosts that can host at least this many sites. */
  minSites: number;
}

export interface TcoResult {
  id: string;
  name: string;
  hostingType: HostingType | null;
  total: number;
  effectiveMonthly: number;
  /** Extra dollars the renewal markup adds over the term vs. if the promo held. */
  renewalTax: number;
  renewalMarkupPercent: number | null;
  maxWebsites: NumberOrUnlimited | null;
}

export const DEFAULT_TCO_OPTIONS: TcoOptions = { years: 3, type: 'shared', minSites: 1 };
export const TERM_OPTIONS = [1, 2, 3] as const;

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** True if a host's site allowance covers the requested number of sites. */
function coversSites(max: NumberOrUnlimited | null, minSites: number): boolean {
  if (minSites <= 1) return true;
  if (max == null) return true; // unknown capacity — don't hide it
  if (max === 'Unlimited') return true;
  return max >= minSites;
}

export function computeTco(hosts: TcoHost[], opts: TcoOptions): TcoResult[] {
  const years = Math.min(3, Math.max(1, Math.round(opts.years)));

  return hosts
    .filter((h) => (opts.type === 'any' ? true : h.hostingType === opts.type))
    .filter((h) => coversSites(h.maxWebsites, opts.minSites))
    .map((h): TcoResult | null => {
      if (!isNum(h.firstYearCost)) return null;
      // Project the term: year 1 at promo, every later year at renewal.
      const second = isNum(h.secondYearCost) ? h.secondYearCost : h.firstYearCost;
      const total = h.firstYearCost + (years - 1) * second;
      // What the same term would cost if the promo price never expired.
      const ifPromoHeld = h.firstYearCost * years;
      return {
        id: h.id,
        name: h.name,
        hostingType: h.hostingType,
        total,
        effectiveMonthly: total / (years * 12),
        renewalTax: Math.max(0, total - ifPromoHeld),
        renewalMarkupPercent: h.renewalMarkupPercent,
        maxWebsites: h.maxWebsites,
      };
    })
    .filter((r): r is TcoResult => r !== null)
    .sort((a, b) => a.total - b.total);
}

/** Parse/validate calculator options from URL search params (shareable links). */
export function parseTcoOptions(params: {
  years?: string;
  type?: string;
  sites?: string;
}): TcoOptions {
  const validTypes: (HostingType | 'any')[] = [
    'any', 'shared', 'managed-wordpress', 'vps', 'cloud-iaas', 'dedicated',
    'website-builder', 'ecommerce-platform', 'jamstack', 'paas', 'domain-registrar', 'cdn-security',
  ];
  const years = Number(params.years);
  const sites = Number(params.sites);
  return {
    years: TERM_OPTIONS.includes(years as 1 | 2 | 3) ? years : DEFAULT_TCO_OPTIONS.years,
    type: validTypes.includes(params.type as HostingType | 'any')
      ? (params.type as HostingType | 'any')
      : DEFAULT_TCO_OPTIONS.type,
    minSites: Number.isFinite(sites) && sites >= 1 ? Math.min(50, Math.round(sites)) : DEFAULT_TCO_OPTIONS.minSites,
  };
}

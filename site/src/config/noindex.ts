/**
 * Pages excluded from search indexes.
 *
 * Why this exists: the programmatic layer generates every host pairing, but a
 * large slice of those pairings target markets HostDuel has no business
 * competing in — hyperscaler IaaS (AWS/Azure/GCP and the VPS giants) and
 * website builders (Shopify/Wix/Squarespace). Over 2026-05-01 → 2026-07-15 those
 * 51 pages drew 16,303 Google impressions at an average position of 45 and
 * produced 3 clicks. They contribute nothing but a large volume of
 * low-quality, never-clicked pages for Google to weigh the site by.
 *
 * They are `noindex, follow` rather than deleted, deliberately:
 *   - the pages stay live and useful to anyone who lands on them,
 *   - internal links through them still pass signal (`follow`),
 *   - AI crawlers still read them (noindex is a search-index directive, and
 *     LLM referral is currently the site's best non-bot traffic source).
 *
 * The rule is editorial, not mechanical: a comparison is dropped only when
 * BOTH hosts are outside HostDuel's affiliate niche. Pages like
 * bluehost-vs-hostinger stay indexed even while ranking badly, because that
 * query is the site's actual commercial target.
 */

/** Hyperscaler / IaaS giants — enterprise procurement, not affiliate hosting. */
const IAAS_GIANTS = [
  'aws',
  'azure',
  'gcp',
  'alibabacloud',
  'rackspace',
  'linode',
  'vultr',
  'digitalocean',
  'oracle',
] as const;

/** Website builders — a different product category from web hosting. */
const WEBSITE_BUILDERS = ['shopify', 'squarespace', 'wix', 'weebly', 'bigcommerce'] as const;

const OUT_OF_NICHE = new Set<string>([...IAAS_GIANTS, ...WEBSITE_BUILDERS]);

/** True when a host sits outside the niche HostDuel competes in. */
export function isOutOfNiche(hostId: string): boolean {
  return OUT_OF_NICHE.has(hostId);
}

/**
 * A comparison is noindexed only when BOTH sides are out of niche. A pairing
 * with one in-niche host (e.g. aws-vs-hetzner) stays indexed.
 */
export function shouldNoindexComparison(hostIdA: string, hostIdB: string): boolean {
  return isOutOfNiche(hostIdA) && isOutOfNiche(hostIdB);
}

/** Host review pages for out-of-niche brands are noindexed outright. */
export function shouldNoindexHost(hostId: string): boolean {
  return isOutOfNiche(hostId);
}

/** Metadata fragment to spread into a Next.js `Metadata` object. */
export const NOINDEX_ROBOTS = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
} as const;

import affiliateData from '@/config/affiliates.json';

interface AffiliateEntry {
  url: string;
  active: boolean;
  notes?: string;
}

// Type the imported JSON data
const affiliates = affiliateData as Record<string, AffiliateEntry | { _comment?: string; _example?: AffiliateEntry }>;

/**
 * Get the affiliate URL for a host if one exists and is active.
 * Returns null if no affiliate link or if it's inactive.
 */
export function getAffiliateUrl(hostId: string): string | null {
  const entry = affiliates[hostId] as AffiliateEntry | undefined;

  // Skip special keys like _comment and _example
  if (!entry || hostId.startsWith('_')) {
    return null;
  }

  if (entry.active && entry.url) {
    return entry.url;
  }

  return null;
}

/**
 * Check if a host has an active affiliate link
 */
export function hasAffiliate(hostId: string): boolean {
  return getAffiliateUrl(hostId) !== null;
}

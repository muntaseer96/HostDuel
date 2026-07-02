import type { CompanyTableRow } from '@/types';

/**
 * best-for-content.ts
 *
 * Turns the /best-for/[useCase] pages from a bare ranked list into substantive,
 * data-derived content: a per-host "why it fits this use case" reason, a
 * hand-written buying-guide ("what to look for"), and a data-driven FAQ block.
 *
 * Every reason and FAQ answer is gated on the data actually being present, so
 * different hosts and use cases produce different prose — no templated filler.
 *
 * Pure functions, safe to call at build time.
 */

export type UseCase = 'blogger' | 'ecommerce' | 'agency' | 'developer' | 'beginner' | 'enterprise';

export interface BestForFaq {
  question: string;
  answer: string;
}

/** A host row plus the 1–5 suitability score the page already computed. */
type RankedHost = CompanyTableRow & { suitabilityScore: number };

// ── small helpers ────────────────────────────────────────────────────────────

function listToProse(items: string[]): string {
  const list = items.filter(Boolean);
  if (list.length === 0) return '';
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}

function trimPeriod(s: string): string {
  return s.replace(/\s*\.\s*$/, '').trim();
}

/** First clause of a semicolon/period-separated editorial string. */
function firstClause(s: string): string {
  return trimPeriod(s.split(/[;.]/)[0]).trim();
}

/** Lowercase the first char for mid-sentence embedding (leave acronyms alone). */
function lcFirst(s: string): string {
  if (!s) return s;
  if (s.length > 1 && s[0] === s[0].toUpperCase() && s[1] === s[1].toUpperCase()) return s;
  return s[0].toLowerCase() + s.slice(1);
}

// ── buying-guide criteria (hand-written, one per use case) ────────────────────

export const USE_CASE_CRITERIA: Record<
  UseCase,
  { heading: string; lookFor: string[] }
> = {
  blogger: {
    heading: 'What to look for in blogging hosting',
    lookFor: [
      'WordPress optimization and one-click install, since most blogs run on WordPress',
      'fast page loads (LiteSpeed or NVMe storage) to keep readers and rank in search',
      'a free SSL certificate and ideally a free domain for year one',
      'a low renewal price, not just a cheap first term',
    ],
  },
  ecommerce: {
    heading: 'What to look for in eCommerce hosting',
    lookFor: [
      'WooCommerce or store-platform optimization for fast, reliable checkouts',
      'a free SSL certificate and PCI-compliant infrastructure for card payments',
      'strong uptime guarantees so the store is never down during a sale',
      'room to grow — CDN, caching and an easy upgrade path as traffic climbs',
    ],
  },
  agency: {
    heading: 'What to look for in agency hosting',
    lookFor: [
      'the ability to host many sites, ideally with reseller or white-label options',
      'staging environments and free migrations to move client sites in cleanly',
      'account management tools and predictable, transparent renewal pricing',
      'fast, knowledgeable support you can lean on when a client site breaks',
    ],
  },
  developer: {
    heading: 'What to look for in developer hosting',
    lookFor: [
      'SSH access, Git deployment and staging as a baseline',
      'support for your stack — Node.js, Python, Ruby or PHP version switching',
      'CLI tooling (WP-CLI, Composer) and control over the environment',
      'a real staging-to-production workflow rather than editing live',
    ],
  },
  beginner: {
    heading: 'What to look for as a beginner',
    lookFor: [
      'an intuitive control panel and one-click installers so you are not stuck at setup',
      'a free SSL certificate and free domain to launch without extra costs',
      '24/7 live chat support for when you get stuck',
      'a generous money-back guarantee so your first host is risk-free',
    ],
  },
  enterprise: {
    heading: 'What to look for in enterprise hosting',
    lookFor: [
      'compliance certifications (HIPAA, PCI, SOC 2) that match your industry',
      'a contractual uptime SLA with credits, not just a marketing number',
      'dedicated or priority support with fast response times',
      'advanced security — DDoS protection, managed firewalls and isolation',
    ],
  },
};

// ── per-host reason (data-derived, use-case specific) ─────────────────────────

/** Ordered (predicate → phrase) checks per use case; the most relevant first. */
function featureChecks(
  host: RankedHost,
  useCase: UseCase
): string[] {
  const feats: string[] = [];
  const push = (cond: unknown, phrase: string) => {
    if (cond) feats.push(phrase);
  };

  switch (useCase) {
    case 'blogger':
      push(host.wordpressOptimized, 'WordPress-optimized servers');
      push(host.litespeedCache, 'LiteSpeed caching for fast page loads');
      push(host.freeDomain, 'a free domain for year one');
      push(host.freeSsl, 'free SSL');
      break;
    case 'ecommerce':
      push(host.woocommerceOptimized, 'WooCommerce tuning');
      push(host.pciCompliance, 'PCI-compliant infrastructure');
      push(host.dedicatedIpAvailable, 'an optional dedicated IP');
      push(host.uptimeGuarantee, host.uptimeGuarantee ? `a ${host.uptimeGuarantee}% uptime guarantee` : '');
      push(host.freeSsl, 'free SSL');
      break;
    case 'agency':
      push(host.resellerHostingAvailable, 'reseller hosting');
      push(host.whiteLabelAvailable, 'white-label options');
      push(host.maxWebsites === 'Unlimited', 'unlimited websites per account');
      push(host.stagingEnvironment, 'staging environments');
      push(host.freeMigration, 'free site migrations');
      break;
    case 'developer':
      push(host.sshAccess, 'SSH access');
      push(host.gitDeployment, 'Git deployment');
      push(host.stagingEnvironment, 'staging environments');
      push(host.nodejsSupport, 'Node.js support');
      push(host.pythonSupport, 'Python support');
      push(host.wpCliAccess, 'WP-CLI');
      break;
    case 'beginner':
      push(host.softaculous, 'one-click app installers');
      push(host.websiteBuilderIncluded, 'a drag-and-drop site builder');
      push(host.liveChatAvailable && host.liveChatHours === '24/7', '24/7 live chat');
      push(host.freeDomain, 'a free domain');
      push(host.freeSsl, 'free SSL');
      break;
    case 'enterprise':
      push(host.hipaaCompliance, 'HIPAA compliance');
      push(host.pciCompliance, 'PCI compliance');
      push(host.uptimeGuarantee, host.uptimeGuarantee ? `a ${host.uptimeGuarantee}% uptime guarantee` : '');
      push(host.ddosProtection, 'DDoS protection');
      push(host.prioritySupport, 'priority support');
      break;
  }
  return feats.filter(Boolean);
}

/**
 * One or two sentences on why this host suits the use case, built from its real
 * features and (where available) its editorial "best for" note.
 */
export function generateHostReason(host: RankedHost, useCase: UseCase): string {
  const feats = featureChecks(host, useCase).slice(0, 3);
  const sentences: string[] = [];

  if (feats.length) {
    sentences.push(`Brings ${listToProse(feats)} to the table.`);
  }

  // Add a use-case fit (from editorial "best for") or a money-back note — one
  // concise second sentence, never the whole semicolon-separated field.
  if (host.bestFor) {
    sentences.push(`A natural fit for ${lcFirst(firstClause(host.bestFor))}.`);
  } else if (host.moneyBackDays && host.moneyBackDays >= 30) {
    sentences.push(`You can try it risk-free with a ${host.moneyBackDays}-day money-back guarantee.`);
  }

  if (!sentences.length) {
    // Fallback so no card is left blank.
    sentences.push(`Scores ${host.suitabilityScore}/5 in our assessment for this use case.`);
  }
  return sentences.join(' ');
}

// ── FAQ block (data-driven from the ranked list) ──────────────────────────────

export function generateBestForFaqs(
  useCase: UseCase,
  useCaseName: string,
  hosts: RankedHost[],
  year: number
): BestForFaq[] {
  const faqs: BestForFaq[] = [];
  if (!hosts.length) return faqs;

  const label = useCaseName.toLowerCase();
  const top = hosts[0];
  const runnerUp = hosts[1];

  // 1) Best pick
  let bestAnswer = `${top.name} is our top pick for ${label}, scoring ${top.suitabilityScore}/5`;
  if (top.overallRating) bestAnswer += ` on a ${top.overallRating.toFixed(1)}/5 overall rating`;
  bestAnswer += '.';
  if (runnerUp) {
    bestAnswer += ` ${runnerUp.name} (${runnerUp.suitabilityScore}/5) is the closest runner-up.`;
  }
  faqs.push({
    question: `What is the best web hosting for ${label} in ${year}?`,
    answer: bestAnswer,
  });

  // 2) Cost — real price range from the ranked hosts
  const prices = hosts.map((h) => h.monthlyPrice).filter((p): p is number => p !== null);
  if (prices.length >= 2) {
    const lo = Math.min(...prices);
    const hi = Math.max(...prices);
    const cheapest = hosts.find((h) => h.monthlyPrice === lo);
    faqs.push({
      question: `How much does ${label} hosting cost?`,
      answer: `Among our top ${label} picks, entry pricing runs from $${lo.toFixed(2)}/mo${cheapest ? ` (${cheapest.name})` : ''} up to about $${hi.toFixed(2)}/mo. Check renewal rates too — the first-term price is often well below what you'll pay at year two.`,
    });
  }

  // 3) What to look for — from the buying-guide criteria
  const criteria = USE_CASE_CRITERIA[useCase];
  faqs.push({
    question: `What should I look for in ${label} hosting?`,
    answer: `${criteria.lookFor.map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join('. ')}.`,
  });

  return faqs;
}

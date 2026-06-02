import { HOSTING_TYPES, type HostingType } from '@/lib/constants';
import type { CompanyTableRow } from '@/types';
import type { CategoryWinner } from '@/lib/comparisons';

/**
 * compare-content.ts
 *
 * Generates GENUINELY UNIQUE, data-derived prose for each /compare/[slug] page:
 * meta description, intro paragraphs, and a data-driven FAQ block.
 *
 * Every compare page used to share an identical subtitle + meta description, with
 * only the data table differing — the classic "templated/thin" signal. These
 * helpers turn the structured data (prices, ratings, category winners, and the
 * hand-written editorial fields) into distinct on-page text for each pair, so no
 * two comparison pages read the same.
 *
 * Pure functions, no side effects — safe to call at build time in generateMetadata
 * and the page component.
 */

export interface CompareFaq {
  question: string;
  answer: string;
}

export interface OverallWinner {
  winner: 'A' | 'B' | 'tie';
  reasons: string[];
}

// ── small text helpers ───────────────────────────────────────────────────────

/** Lowercase the first character (for embedding a phrase mid-sentence). */
function lcFirst(s: string): string {
  if (!s) return s;
  // Leave acronyms / all-caps starts alone (e.g. "SSD", "AI").
  if (s.length > 1 && s[0] === s[0].toUpperCase() && s[1] === s[1].toUpperCase()) return s;
  return s[0].toLowerCase() + s.slice(1);
}

/** Strip a single trailing period so a phrase can be folded into a sentence. */
function trimPeriod(s: string): string {
  return s.replace(/\s*\.\s*$/, '').trim();
}

/** Take the first clause of a semicolon/comma-separated editorial string. */
function firstClause(s: string): string {
  return trimPeriod(s.split(/[;.]/)[0]).trim();
}

function price(n: number | null | undefined): string | null {
  if (n === null || n === undefined) return null;
  return `$${n.toFixed(2)}/mo`;
}

function typeLabel(t: HostingType | null): string {
  if (!t) return 'web hosting';
  return (HOSTING_TYPES[t] || 'web hosting').toLowerCase();
}

function winnerName(hostA: CompanyTableRow, hostB: CompanyTableRow, w: 'A' | 'B' | 'tie'): string {
  return w === 'A' ? hostA.name : w === 'B' ? hostB.name : 'Tie';
}

// ── intro prose ──────────────────────────────────────────────────────────────

/**
 * Build 2–3 unique paragraphs that summarise the comparison in plain English.
 * Each sentence is gated on the data actually being present, so different pairs
 * produce different prose.
 */
export function generateCompareIntro(
  hostA: CompanyTableRow,
  hostB: CompanyTableRow,
  categoryWinners: CategoryWinner[],
  overall: OverallWinner
): string[] {
  const paragraphs: string[] = [];
  const aType = typeLabel(hostA.hostingType);
  const bType = typeLabel(hostB.hostingType);

  // ── Paragraph 1: the verdict at a glance ──
  const p1: string[] = [];
  if (aType === bType) {
    p1.push(`${hostA.name} and ${hostB.name} are both ${aType} providers, but they suit different priorities.`);
  } else {
    p1.push(`${hostA.name} is a ${aType} provider while ${hostB.name} sits in the ${bType} category, so the right pick depends on what you're building.`);
  }

  const decided = categoryWinners.filter((c) => c.winner !== 'tie');
  if (overall.winner !== 'tie') {
    const win = overall.winner;
    const winName = winnerName(hostA, hostB, win);
    const wonLabels = categoryWinners.filter((c) => c.winner === win).map((c) => c.label);
    const top = wonLabels.slice(0, 3).map((l) => l.replace(/^Best (for )?/i, '').trim());
    if (wonLabels.length && top.length) {
      p1.push(
        `Across our ${categoryWinners.length}-category breakdown, ${winName} comes out ahead, winning ${wonLabels.length} of them — including ${listToProse(top)}.`
      );
    } else {
      p1.push(`On balance, ${winName} is the stronger overall choice.`);
    }
  } else if (decided.length) {
    p1.push(
      `The two are closely matched in our ${categoryWinners.length}-category breakdown, each taking a share of the wins, so your decision comes down to which factors matter most to you.`
    );
  }
  paragraphs.push(p1.join(' '));

  // ── Paragraph 2: concrete pricing & value ──
  const p2: string[] = [];
  const aP = hostA.monthlyPrice;
  const bP = hostB.monthlyPrice;
  if (aP !== null && bP !== null) {
    if (aP === bP) {
      p2.push(`Both start at the same ${price(aP)} entry price.`);
    } else {
      const cheaper = aP < bP ? hostA : hostB;
      const dearer = aP < bP ? hostB : hostA;
      p2.push(
        `On entry pricing, ${cheaper.name} is the cheaper option at ${price(Math.min(aP, bP))} versus ${price(Math.max(aP, bP))} for ${dearer.name}.`
      );
    }
  } else if (aP !== null) {
    p2.push(`${hostA.name} starts at ${price(aP)}.`);
  } else if (bP !== null) {
    p2.push(`${hostB.name} starts at ${price(bP)}.`);
  }

  // Renewal reality — the thing most comparison sites hide.
  const aMk = hostA.renewalMarkupPercent;
  const bMk = hostB.renewalMarkupPercent;
  if (aMk !== null && bMk !== null && (aMk > 0 || bMk > 0)) {
    if (Math.abs(aMk - bMk) < 1) {
      p2.push(`Renewal increases are similar on both, so neither springs a nasty surprise at year two.`);
    } else {
      const honest = aMk < bMk ? hostA : hostB;
      const honestMk = Math.min(aMk, bMk);
      const otherMk = Math.max(aMk, bMk);
      p2.push(
        `Renewal tells the real story: ${honest.name} marks prices up about ${honestMk.toFixed(0)}% at renewal versus roughly ${otherMk.toFixed(0)}% for ${aMk < bMk ? hostB.name : hostA.name}, making it the better long-term value.`
      );
    }
  }

  // Money-back differentiator.
  const aMb = hostA.moneyBackDays;
  const bMb = hostB.moneyBackDays;
  if (aMb !== null && bMb !== null && aMb !== bMb) {
    const longer = aMb > bMb ? hostA : hostB;
    p2.push(`${longer.name} also gives you a longer ${Math.max(aMb, bMb)}-day money-back window to test risk-free.`);
  }
  if (p2.length) paragraphs.push(p2.join(' '));

  // ── Paragraph 3: positioning from hand-written editorial data ──
  const p3: string[] = [];
  if (hostA.uniqueSellingPoint) {
    const ideal = hostA.idealCustomerProfile ? ` — a natural fit for ${lcFirst(trimPeriod(hostA.idealCustomerProfile))}` : '';
    p3.push(`${hostA.name}'s standout is ${lcFirst(firstClause(hostA.uniqueSellingPoint))}${ideal}.`);
  }
  if (hostB.uniqueSellingPoint) {
    const ideal = hostB.idealCustomerProfile ? `, ideal for ${lcFirst(trimPeriod(hostB.idealCustomerProfile))}` : '';
    p3.push(`${hostB.name}, by contrast, leans on ${lcFirst(firstClause(hostB.uniqueSellingPoint))}${ideal}.`);
  }
  if (p3.length) paragraphs.push(p3.join(' '));

  return paragraphs;
}

// ── meta description ─────────────────────────────────────────────────────────

/**
 * Unique meta description (~150–160 chars) for the pair. Leads with the verdict
 * and a concrete price point so the snippet differs from every other page.
 */
export function generateCompareMetaDescription(
  hostA: CompanyTableRow,
  hostB: CompanyTableRow,
  categoryWinners: CategoryWinner[],
  overall: OverallWinner
): string {
  const parts: string[] = [];

  if (overall.winner !== 'tie') {
    const winName = winnerName(hostA, hostB, overall.winner);
    const wonCount = categoryWinners.filter((c) => c.winner === overall.winner).length;
    parts.push(`${winName} wins ${wonCount} of ${categoryWinners.length} categories.`);
  } else {
    parts.push(`A close, evenly matched race.`);
  }

  const aP = hostA.monthlyPrice;
  const bP = hostB.monthlyPrice;
  if (aP !== null && bP !== null) {
    parts.push(`Pricing $${Math.min(aP, bP).toFixed(2)} vs $${Math.max(aP, bP).toFixed(2)}/mo,`);
  }
  parts.push(`uptime, support & features compared side by side.`);

  let desc = `${hostA.name} vs ${hostB.name} (2026): ${parts.join(' ')}`;
  // Keep within ~158 chars, trimming at a word boundary.
  if (desc.length > 158) {
    desc = desc.slice(0, 158);
    desc = desc.slice(0, desc.lastIndexOf(' ')).replace(/[,.\s]+$/, '') + '.';
  }
  return desc;
}

// ── FAQ block ────────────────────────────────────────────────────────────────

/**
 * Generate data-driven FAQs unique to the pair. Each Q matches a real long-tail
 * query ("is X cheaper than Y", "which is better for WordPress") and each answer
 * is built from the underlying data, so the block is distinct per comparison and
 * eligible for FAQPage structured data.
 */
export function generateCompareFaqs(
  hostA: CompanyTableRow,
  hostB: CompanyTableRow,
  categoryWinners: CategoryWinner[],
  overall: OverallWinner
): CompareFaq[] {
  const faqs: CompareFaq[] = [];
  const byCat = (cat: string) => categoryWinners.find((c) => c.category === cat);

  // 1) Price
  if (hostA.monthlyPrice !== null && hostB.monthlyPrice !== null) {
    const aP = hostA.monthlyPrice;
    const bP = hostB.monthlyPrice;
    let answer: string;
    if (aP === bP) {
      answer = `${hostA.name} and ${hostB.name} both start at ${price(aP)}, so neither is cheaper on entry pricing. Compare renewal rates and included features to decide which is the better value.`;
    } else {
      const cheaper = aP < bP ? hostA : hostB;
      const dearer = aP < bP ? hostB : hostA;
      answer = `Yes — ${cheaper.name} is cheaper, starting at ${price(Math.min(aP, bP))} compared with ${price(Math.max(aP, bP))} for ${dearer.name}.`;
      if (hostA.renewalMarkupPercent !== null && hostB.renewalMarkupPercent !== null) {
        const lowMk = cheaper.renewalMarkupPercent;
        if (lowMk !== null) {
          answer += ` Factor in renewals too: ${cheaper.name} marks up about ${lowMk.toFixed(0)}% after the first term.`;
        }
      }
    }
    faqs.push({ question: `Is ${hostA.name} cheaper than ${hostB.name}?`, answer });
  }

  // 2) WordPress
  const wp = byCat('wordpress');
  if (wp && wp.winner !== 'tie') {
    const winHost = wp.winner === 'A' ? hostA : hostB;
    const feats: string[] = [];
    if (winHost.wordpressOptimized) feats.push('WordPress-optimized servers');
    if (winHost.litespeedCache) feats.push('LiteSpeed caching');
    if (winHost.wordpressStaging) feats.push('staging');
    if (winHost.woocommerceOptimized) feats.push('WooCommerce tuning');
    const featStr = feats.length ? ` thanks to ${listToProse(feats)}` : '';
    faqs.push({
      question: `Which is better for WordPress, ${hostA.name} or ${hostB.name}?`,
      answer: `${winHost.name} is the stronger WordPress host${featStr}. If WordPress or WooCommerce is your main workload, it's the safer pick.`,
    });
  }

  // 3) Uptime / performance
  const perf = byCat('performance');
  if (perf && perf.winner !== 'tie') {
    const winHost = perf.winner === 'A' ? hostA : hostB;
    const other = perf.winner === 'A' ? hostB : hostA;
    const uptimeBits: string[] = [];
    if (winHost.uptimeGuarantee !== null) uptimeBits.push(`a ${winHost.uptimeGuarantee}% uptime guarantee`);
    if (winHost.overallRating !== null) uptimeBits.push(`a ${winHost.overallRating.toFixed(1)}/5 overall rating`);
    const bits = uptimeBits.length ? ` with ${listToProse(uptimeBits)}` : '';
    faqs.push({
      question: `Does ${hostA.name} or ${hostB.name} have better uptime?`,
      answer: `${winHost.name} edges out ${other.name} on performance${bits}. For uptime-sensitive sites, it's the more dependable choice.`,
    });
  }

  // 4) Support
  const sup = byCat('support');
  if (sup && sup.winner !== 'tie') {
    const winHost = sup.winner === 'A' ? hostA : hostB;
    const channels: string[] = [];
    if (winHost.liveChatAvailable) channels.push(winHost.liveChatHours === '24/7' ? '24/7 live chat' : 'live chat');
    if (winHost.phoneSupportAvailable) channels.push('phone support');
    if (winHost.ticketSupport) channels.push('ticket support');
    const chStr = channels.length ? ` offering ${listToProse(channels)}` : '';
    faqs.push({
      question: `Which has better customer support, ${hostA.name} or ${hostB.name}?`,
      answer: `${winHost.name} has the edge on support${chStr}.`,
    });
  }

  // 5) Beginners
  const beg = byCat('beginners');
  if (beg && beg.winner !== 'tie') {
    const winHost = beg.winner === 'A' ? hostA : hostB;
    faqs.push({
      question: `Is ${hostA.name} or ${hostB.name} better for beginners?`,
      answer: `${winHost.name} is friendlier for beginners, scoring higher on ease of use in our assessment. New users will generally find it quicker to get started.`,
    });
  }

  // 6) Overall recommendation
  if (overall.winner !== 'tie') {
    const winName = winnerName(hostA, hostB, overall.winner);
    const wonLabels = categoryWinners.filter((c) => c.winner === overall.winner).map((c) => c.label);
    const top = wonLabels.slice(0, 3).map((l) => l.replace(/^Best (for )?/i, '').trim());
    faqs.push({
      question: `Should I choose ${hostA.name} or ${hostB.name}?`,
      answer: `For most users, ${winName} is the better overall choice, winning ${wonLabels.length} of our ${categoryWinners.length} categories${top.length ? ` (notably ${listToProse(top)})` : ''}. That said, the right host depends on your specific needs — check the category breakdown above for the factors that matter to you.`,
    });
  } else {
    faqs.push({
      question: `Should I choose ${hostA.name} or ${hostB.name}?`,
      answer: `${hostA.name} and ${hostB.name} are evenly matched overall, so the best choice depends on your priorities. Use the category winners and feature table above to weigh the factors that matter most for your project.`,
    });
  }

  return faqs;
}

// ── shared ───────────────────────────────────────────────────────────────────

/** Join a list into natural prose: "a, b and c". */
function listToProse(items: string[]): string {
  const list = items.filter(Boolean);
  if (list.length === 0) return '';
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}

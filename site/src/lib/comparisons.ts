import { getAllTableRows, getTableRowById } from './data';
import type { CompanyTableRow, HostingType } from '@/types';

/**
 * Comparison clusters - group hosts by similar categories
 * Only hosts within the same cluster will be compared
 */
export const COMPARISON_CLUSTERS: Record<string, {
  name: string;
  types: HostingType[];
  description: string;
}> = {
  'shared': {
    name: 'Shared Hosting',
    types: ['shared'],
    description: 'Budget-friendly shared hosting providers',
  },
  'managed-wordpress': {
    name: 'Managed WordPress',
    types: ['managed-wordpress'],
    description: 'Premium managed WordPress hosting',
  },
  'cloud-vps': {
    name: 'Cloud & VPS',
    types: ['cloud-iaas', 'vps'],
    description: 'Cloud infrastructure and VPS providers',
  },
  'website-builders': {
    name: 'Website Builders',
    types: ['website-builder', 'ecommerce-platform'],
    description: 'All-in-one website builders and ecommerce platforms',
  },
  'modern-platforms': {
    name: 'Modern Platforms',
    types: ['jamstack', 'paas'],
    description: 'JAMstack and Platform-as-a-Service providers',
  },
};

/**
 * Get the cluster for a given hosting type
 */
export function getClusterForType(type: HostingType | null): string | null {
  if (!type) return null;
  for (const [clusterId, cluster] of Object.entries(COMPARISON_CLUSTERS)) {
    if (cluster.types.includes(type)) {
      return clusterId;
    }
  }
  return null;
}

/**
 * Generate all valid comparison pairs
 * Only compares hosts within the same cluster
 */
export async function generateComparisonPairs(): Promise<Array<[string, string]>> {
  const hosts = await getAllTableRows();
  const pairs: Array<[string, string]> = [];

  // Group hosts by cluster
  const hostsByCluster: Record<string, CompanyTableRow[]> = {};

  for (const host of hosts) {
    const cluster = getClusterForType(host.hostingType);
    if (cluster) {
      if (!hostsByCluster[cluster]) {
        hostsByCluster[cluster] = [];
      }
      hostsByCluster[cluster].push(host);
    }
  }

  // Generate pairs within each cluster
  for (const clusterHosts of Object.values(hostsByCluster)) {
    // Sort hosts alphabetically for consistent ordering
    clusterHosts.sort((a, b) => a.id.localeCompare(b.id));

    for (let i = 0; i < clusterHosts.length; i++) {
      for (let j = i + 1; j < clusterHosts.length; j++) {
        const hostA = clusterHosts[i];
        const hostB = clusterHosts[j];
        // Alphabetically order the pair
        const [first, second] = [hostA.id, hostB.id].sort();
        pairs.push([first, second]);
      }
    }
  }

  return pairs;
}

/**
 * Get comparison slug from two host IDs
 */
export function getComparisonSlug(hostAId: string, hostBId: string): string {
  return [hostAId, hostBId].sort().join('-vs-');
}

/**
 * Parse comparison slug into host IDs
 */
export function parseComparisonSlug(slug: string): [string, string] | null {
  const parts = slug.split('-vs-');
  if (parts.length !== 2) return null;
  return [parts[0], parts[1]];
}

/**
 * Winner categories for comparison
 */
export interface CategoryWinner {
  category: string;
  label: string;
  winner: 'A' | 'B' | 'tie';
  winnerName: string;
  reason: string;
}

/**
 * Calculate winners for each category
 */
export function calculateCategoryWinners(
  hostA: CompanyTableRow,
  hostB: CompanyTableRow
): CategoryWinner[] {
  const winners: CategoryWinner[] = [];

  // Best Price
  if (hostA.monthlyPrice !== null || hostB.monthlyPrice !== null) {
    const aPrice = hostA.monthlyPrice ?? Infinity;
    const bPrice = hostB.monthlyPrice ?? Infinity;
    const winner = aPrice < bPrice ? 'A' : aPrice > bPrice ? 'B' : 'tie';
    winners.push({
      category: 'price',
      label: 'Best Price',
      winner,
      winnerName: winner === 'A' ? hostA.name : winner === 'B' ? hostB.name : 'Tie',
      reason: winner !== 'tie'
        ? `$${Math.min(aPrice, bPrice).toFixed(2)}/mo vs $${Math.max(aPrice, bPrice).toFixed(2)}/mo`
        : `Both at $${aPrice.toFixed(2)}/mo`,
    });
  }

  // Best Value (considering renewal price too)
  if (hostA.renewalMarkupPercent !== null || hostB.renewalMarkupPercent !== null) {
    const aMarkup = hostA.renewalMarkupPercent ?? 0;
    const bMarkup = hostB.renewalMarkupPercent ?? 0;
    const winner = aMarkup < bMarkup ? 'A' : aMarkup > bMarkup ? 'B' : 'tie';
    winners.push({
      category: 'value',
      label: 'Best Value',
      winner,
      winnerName: winner === 'A' ? hostA.name : winner === 'B' ? hostB.name : 'Tie',
      reason: winner !== 'tie'
        ? `Lower renewal markup (${Math.min(aMarkup, bMarkup).toFixed(0)}% vs ${Math.max(aMarkup, bMarkup).toFixed(0)}%)`
        : 'Similar renewal pricing',
    });
  }

  // Best Performance (uptime + overall rating)
  const aPerf = ((hostA.uptimeGuarantee ?? 99) - 99) * 10 + (hostA.overallRating ?? 0);
  const bPerf = ((hostB.uptimeGuarantee ?? 99) - 99) * 10 + (hostB.overallRating ?? 0);
  const perfWinner = aPerf > bPerf ? 'A' : aPerf < bPerf ? 'B' : 'tie';
  winners.push({
    category: 'performance',
    label: 'Best Performance',
    winner: perfWinner,
    winnerName: perfWinner === 'A' ? hostA.name : perfWinner === 'B' ? hostB.name : 'Tie',
    reason: perfWinner !== 'tie'
      ? `${perfWinner === 'A' ? hostA.uptimeGuarantee : hostB.uptimeGuarantee}% uptime, ${(perfWinner === 'A' ? hostA.overallRating : hostB.overallRating)?.toFixed(1)}/5 rating`
      : 'Similar performance metrics',
  });

  // Best Support
  const aSupport = (hostA.liveChatAvailable ? 2 : 0) + (hostA.phoneSupportAvailable ? 2 : 0) +
                   (hostA.liveChatHours === '24/7' ? 2 : 0) + (hostA.ticketSupport ? 1 : 0);
  const bSupport = (hostB.liveChatAvailable ? 2 : 0) + (hostB.phoneSupportAvailable ? 2 : 0) +
                   (hostB.liveChatHours === '24/7' ? 2 : 0) + (hostB.ticketSupport ? 1 : 0);
  const supportWinner = aSupport > bSupport ? 'A' : aSupport < bSupport ? 'B' : 'tie';
  winners.push({
    category: 'support',
    label: 'Best Support',
    winner: supportWinner,
    winnerName: supportWinner === 'A' ? hostA.name : supportWinner === 'B' ? hostB.name : 'Tie',
    reason: getSupportReason(supportWinner === 'A' ? hostA : hostB, supportWinner),
  });

  // Best for WordPress
  const aWP = (hostA.wordpressOptimized ? 2 : 0) + (hostA.wordpressStaging ? 1 : 0) +
              (hostA.woocommerceOptimized ? 1 : 0) + (hostA.litespeedCache ? 1 : 0);
  const bWP = (hostB.wordpressOptimized ? 2 : 0) + (hostB.wordpressStaging ? 1 : 0) +
              (hostB.woocommerceOptimized ? 1 : 0) + (hostB.litespeedCache ? 1 : 0);
  const wpWinner = aWP > bWP ? 'A' : aWP < bWP ? 'B' : 'tie';
  winners.push({
    category: 'wordpress',
    label: 'Best for WordPress',
    winner: wpWinner,
    winnerName: wpWinner === 'A' ? hostA.name : wpWinner === 'B' ? hostB.name : 'Tie',
    reason: getWPReason(wpWinner === 'A' ? hostA : hostB, wpWinner),
  });

  // Best for Developers
  const aDev = (hostA.sshAccess ? 2 : 0) + (hostA.gitDeployment ? 1 : 0) +
               (hostA.stagingEnvironment ? 1 : 0) + (hostA.nodejsSupport ? 1 : 0) +
               (hostA.pythonSupport ? 1 : 0);
  const bDev = (hostB.sshAccess ? 2 : 0) + (hostB.gitDeployment ? 1 : 0) +
               (hostB.stagingEnvironment ? 1 : 0) + (hostB.nodejsSupport ? 1 : 0) +
               (hostB.pythonSupport ? 1 : 0);
  const devWinner = aDev > bDev ? 'A' : aDev < bDev ? 'B' : 'tie';
  winners.push({
    category: 'developers',
    label: 'Best for Developers',
    winner: devWinner,
    winnerName: devWinner === 'A' ? hostA.name : devWinner === 'B' ? hostB.name : 'Tie',
    reason: getDevReason(devWinner === 'A' ? hostA : hostB, devWinner),
  });

  // Best for Beginners
  const aBeg = (hostA.easeOfUse ?? 0) + (hostA.suitabilityBeginner ?? 0);
  const bBeg = (hostB.easeOfUse ?? 0) + (hostB.suitabilityBeginner ?? 0);
  const begWinner = aBeg > bBeg ? 'A' : aBeg < bBeg ? 'B' : 'tie';
  winners.push({
    category: 'beginners',
    label: 'Best for Beginners',
    winner: begWinner,
    winnerName: begWinner === 'A' ? hostA.name : begWinner === 'B' ? hostB.name : 'Tie',
    reason: begWinner !== 'tie'
      ? `Higher ease of use score (${Math.max(aBeg, bBeg).toFixed(1)}/10)`
      : 'Similar beginner-friendliness',
  });

  return winners;
}

/**
 * Calculate overall winner
 */
export function calculateOverallWinner(
  hostA: CompanyTableRow,
  hostB: CompanyTableRow,
  categoryWinners: CategoryWinner[]
): { winner: 'A' | 'B' | 'tie'; reasons: string[] } {
  let aWins = 0;
  let bWins = 0;

  for (const cw of categoryWinners) {
    if (cw.winner === 'A') aWins++;
    else if (cw.winner === 'B') bWins++;
  }

  const winner = aWins > bWins ? 'A' : aWins < bWins ? 'B' : 'tie';

  const reasons: string[] = [];
  if (winner !== 'tie') {
    const winningHost = winner === 'A' ? hostA : hostB;
    const wonCategories = categoryWinners
      .filter(cw => cw.winner === winner)
      .map(cw => cw.label);
    reasons.push(`Wins in ${wonCategories.length} of ${categoryWinners.length} categories`);
    reasons.push(`Top in: ${wonCategories.slice(0, 3).join(', ')}`);
    if (winningHost.overallRating) {
      reasons.push(`${winningHost.overallRating.toFixed(1)}/5 overall rating`);
    }
  } else {
    reasons.push('Both hosts are evenly matched');
    reasons.push('Choose based on your specific needs');
  }

  return { winner, reasons };
}

/**
 * Get related comparisons for a host
 */
export async function getRelatedComparisons(
  hostId: string,
  currentPairSlug: string,
  limit: number = 4
): Promise<Array<{ slug: string; hostA: string; hostB: string }>> {
  const pairs = await generateComparisonPairs();

  // Filter pairs that include this host but aren't the current comparison
  const related = pairs
    .filter(([a, b]) => (a === hostId || b === hostId) && getComparisonSlug(a, b) !== currentPairSlug)
    .slice(0, limit)
    .map(([a, b]) => ({
      slug: getComparisonSlug(a, b),
      hostA: a,
      hostB: b,
    }));

  return related;
}

// Helper functions
function getSupportReason(host: CompanyTableRow, winner: 'A' | 'B' | 'tie'): string {
  if (winner === 'tie') return 'Similar support options';
  const features = [];
  if (host.liveChatAvailable) features.push('Live chat');
  if (host.phoneSupportAvailable) features.push('Phone');
  if (host.liveChatHours === '24/7') features.push('24/7');
  return features.length > 0 ? features.join(', ') : 'Basic support';
}

function getWPReason(host: CompanyTableRow, winner: 'A' | 'B' | 'tie'): string {
  if (winner === 'tie') return 'Similar WordPress features';
  const features = [];
  if (host.wordpressOptimized) features.push('Optimized');
  if (host.wordpressStaging) features.push('Staging');
  if (host.woocommerceOptimized) features.push('WooCommerce');
  if (host.litespeedCache) features.push('LiteSpeed');
  return features.length > 0 ? features.join(', ') : 'Basic WordPress support';
}

function getDevReason(host: CompanyTableRow, winner: 'A' | 'B' | 'tie'): string {
  if (winner === 'tie') return 'Similar developer features';
  const features = [];
  if (host.sshAccess) features.push('SSH');
  if (host.gitDeployment) features.push('Git');
  if (host.stagingEnvironment) features.push('Staging');
  if (host.nodejsSupport) features.push('Node.js');
  return features.length > 0 ? features.join(', ') : 'Basic features';
}

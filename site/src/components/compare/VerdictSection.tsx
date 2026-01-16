import { CheckCircle } from 'lucide-react';
import type { CompanyTableRow } from '@/types';

interface VerdictSectionProps {
  hostA: CompanyTableRow;
  hostB: CompanyTableRow;
}

export function VerdictSection({ hostA, hostB }: VerdictSectionProps) {
  const verdictA = generateVerdict(hostA, hostB);
  const verdictB = generateVerdict(hostB, hostA);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Choose Host A */}
      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-6">
        <h3 className="text-lg font-semibold text-blue-400 mb-4">
          Choose {hostA.name} if you...
        </h3>
        <ul className="space-y-3">
          {verdictA.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
              <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Choose Host B */}
      <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-6">
        <h3 className="text-lg font-semibold text-purple-400 mb-4">
          Choose {hostB.name} if you...
        </h3>
        <ul className="space-y-3">
          {verdictB.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
              <CheckCircle className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function generateVerdict(host: CompanyTableRow, other: CompanyTableRow): string[] {
  const reasons: string[] = [];

  // Price advantage
  if (host.monthlyPrice && other.monthlyPrice && host.monthlyPrice < other.monthlyPrice) {
    reasons.push(`Want to save money ($${host.monthlyPrice.toFixed(2)}/mo vs $${other.monthlyPrice.toFixed(2)}/mo)`);
  }

  // Better value (lower renewal markup)
  if (host.renewalMarkupPercent !== null && other.renewalMarkupPercent !== null &&
      host.renewalMarkupPercent < other.renewalMarkupPercent) {
    reasons.push('Prefer more predictable renewal pricing');
  }

  // Better rating
  if (host.overallRating && other.overallRating && host.overallRating > other.overallRating) {
    reasons.push(`Want higher-rated hosting (${host.overallRating.toFixed(1)}/5)`);
  }

  // Support features
  if (host.phoneSupportAvailable && !other.phoneSupportAvailable) {
    reasons.push('Need phone support');
  }
  if (host.liveChatHours === '24/7' && other.liveChatHours !== '24/7') {
    reasons.push('Require 24/7 live chat support');
  }

  // WordPress
  if (host.wordpressOptimized && !other.wordpressOptimized) {
    reasons.push('Need WordPress-optimized hosting');
  }
  if (host.litespeedCache && !other.litespeedCache) {
    reasons.push('Want LiteSpeed caching for WordPress');
  }

  // Developer features
  if (host.sshAccess && !other.sshAccess) {
    reasons.push('Need SSH access');
  }
  if (host.nodejsSupport && !other.nodejsSupport) {
    reasons.push('Want to run Node.js applications');
  }
  if (host.stagingEnvironment && !other.stagingEnvironment) {
    reasons.push('Need staging environments');
  }

  // Beginner-friendly
  if ((host.suitabilityBeginner ?? 0) > (other.suitabilityBeginner ?? 0)) {
    reasons.push('Are new to web hosting');
  }

  // Enterprise/Agency
  if ((host.suitabilityEnterprise ?? 0) > (other.suitabilityEnterprise ?? 0)) {
    reasons.push('Need enterprise-grade features');
  }

  // More server locations
  if ((host.serverLocationCount ?? 0) > (other.serverLocationCount ?? 0)) {
    reasons.push(`Want more server locations (${host.serverLocationCount} available)`);
  }

  // Free features
  if (host.freeDomain && !other.freeDomain) {
    reasons.push('Want a free domain included');
  }
  if (host.freeMigration && !other.freeMigration) {
    reasons.push('Need free website migration');
  }

  // Default reasons if none specific
  if (reasons.length === 0) {
    reasons.push(`Prefer ${host.name}'s approach to hosting`);
  }

  return reasons.slice(0, 5); // Limit to 5 reasons
}

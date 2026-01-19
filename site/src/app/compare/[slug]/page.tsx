import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, ExternalLink, ChevronRight } from 'lucide-react';
import { Container } from '@/components/layout';
import { Button, Badge, DataDisclaimer, TrackedLink } from '@/components/ui';
import { getTableRowById } from '@/lib/data';
import {
  generateComparisonPairs,
  getComparisonSlug,
  parseComparisonSlug,
  calculateCategoryWinners,
  calculateOverallWinner,
  getRelatedComparisons,
} from '@/lib/comparisons';
import {
  WinnerSummary,
  CategoryWinners,
  VerdictSection,
  RelatedComparisons
} from '@/components/compare';
import { HOSTING_TYPES, type HostingType } from '@/lib/constants';
import type { Metadata } from 'next';
import type { CompanyTableRow } from '@/types';

interface ComparePageProps {
  params: Promise<{ slug: string }>;
}

// Generate all comparison pages at build time
export async function generateStaticParams() {
  const pairs = await generateComparisonPairs();
  return pairs.map(([a, b]) => ({
    slug: getComparisonSlug(a, b),
  }));
}

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const { slug } = await params;
  const hostIds = parseComparisonSlug(slug);

  if (!hostIds) {
    return { title: 'Comparison Not Found' };
  }

  const [hostA, hostB] = await Promise.all([
    getTableRowById(hostIds[0]),
    getTableRowById(hostIds[1]),
  ]);

  if (!hostA || !hostB) {
    return { title: 'Comparison Not Found' };
  }

  const title = `${hostA.name} vs ${hostB.name}: Complete 2026 Comparison | HostDuel`;
  const description = `Compare ${hostA.name} vs ${hostB.name} side by side. See pricing, features, performance, support, and our expert verdict on which hosting is better for your needs.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `/compare/${slug}`,
    },
  };
}

export default async function ComparePage({ params }: ComparePageProps) {
  const { slug } = await params;
  const hostIds = parseComparisonSlug(slug);

  if (!hostIds) {
    notFound();
  }

  const [hostA, hostB] = await Promise.all([
    getTableRowById(hostIds[0]),
    getTableRowById(hostIds[1]),
  ]);

  if (!hostA || !hostB) {
    notFound();
  }

  // Calculate winners
  const categoryWinners = calculateCategoryWinners(hostA, hostB);
  const overallWinner = calculateOverallWinner(hostA, hostB, categoryWinners);

  // Get related comparisons
  const relatedForA = await getRelatedComparisons(hostA.id, slug, 2);
  const relatedForB = await getRelatedComparisons(hostB.id, slug, 2);
  const relatedComparisons = [...relatedForA, ...relatedForB]
    .filter((item, index, self) =>
      index === self.findIndex((t) => t.slug === item.slug)
    )
    .slice(0, 4);

  // Resolve related comparison host names
  const relatedWithNames = await Promise.all(
    relatedComparisons.map(async (rel) => {
      const [a, b] = await Promise.all([
        getTableRowById(rel.hostA),
        getTableRowById(rel.hostB),
      ]);
      return {
        slug: rel.slug,
        hostAName: a?.name || rel.hostA,
        hostBName: b?.name || rel.hostB,
      };
    })
  );

  const BooleanCell = ({ value }: { value: boolean | null }) => {
    if (value === null) return <span className="text-text-muted">—</span>;
    return (
      <span className="inline-flex justify-center w-full">
        {value ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-red-400/50" />
        )}
      </span>
    );
  };

  const PriceCell = ({ value, isLowest }: { value: number | null; isLowest?: boolean }) => {
    if (value === null) return <span className="text-text-muted">—</span>;
    return (
      <span className={isLowest ? 'text-green-400 font-semibold' : 'text-foreground'}>
        ${value.toFixed(2)}/mo
      </span>
    );
  };

  const RatingCell = ({ value, isHighest }: { value: number | null; isHighest?: boolean }) => {
    if (value === null) return <span className="text-text-muted">—</span>;
    return (
      <span className={isHighest ? 'text-green-400 font-semibold' : 'text-foreground'}>
        {value.toFixed(1)}/5
      </span>
    );
  };

  // Find lowest/highest for highlighting
  const lowestPrice = Math.min(hostA.monthlyPrice ?? Infinity, hostB.monthlyPrice ?? Infinity);
  const highestRating = Math.max(hostA.overallRating ?? 0, hostB.overallRating ?? 0);

  // Helper functions for rendering
  const formatNumber = (val: number | string | null | undefined) => {
    if (val === null || val === undefined) return '—';
    if (val === 'Unlimited') return 'Unlimited';
    return typeof val === 'number' ? val.toLocaleString() : String(val);
  };

  const formatPrice = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '—';
    return typeof val === 'number' ? `$${val.toFixed(2)}` : '—';
  };
  const formatPercent = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '—';
    return typeof val === 'number' ? `${val}%` : '—';
  };
  const formatDays = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '—';
    return typeof val === 'number' ? `${val} days` : '—';
  };
  const formatArray = (val: string[] | null | undefined) => val?.length ? val.join(', ') : '—';
  const formatRating = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '—';
    return typeof val === 'number' ? `${val.toFixed(1)}/5` : '—';
  };
  const formatRating10 = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '—';
    return typeof val === 'number' ? `${val.toFixed(1)}/10` : '—';
  };

  // All comparison categories with fields
  const comparisonCategories = [
    {
      name: 'Essential Info',
      rows: [
        { label: 'Hosting Type', render: (h: CompanyTableRow) => HOSTING_TYPES[h.hostingType as HostingType] || h.hostingType || '—' },
        { label: 'Monthly Price', render: (h: CompanyTableRow) => <PriceCell value={h.monthlyPrice} isLowest={h.monthlyPrice === lowestPrice} /> },
        { label: 'Renewal Price', render: (h: CompanyTableRow) => formatPrice(h.renewalPrice) },
        { label: 'Renewal Markup', render: (h: CompanyTableRow) => h.renewalMarkupPercent !== null ? `${h.renewalMarkupPercent.toFixed(0)}%` : '—' },
        { label: 'Overall Rating', render: (h: CompanyTableRow) => <RatingCell value={h.overallRating} isHighest={h.overallRating === highestRating} /> },
        { label: 'Uptime Guarantee', render: (h: CompanyTableRow) => formatPercent(h.uptimeGuarantee) },
        { label: 'Trustpilot Rating', render: (h: CompanyTableRow) => formatRating(h.trustpilotRating) },
        { label: 'Trustpilot Reviews', render: (h: CompanyTableRow) => formatNumber(h.trustpilotReviewsCount) },
        { label: 'Free SSL', render: (h: CompanyTableRow) => <BooleanCell value={h.freeSsl} /> },
        { label: 'Free Domain', render: (h: CompanyTableRow) => <BooleanCell value={h.freeDomain} /> },
        { label: 'Free Migration', render: (h: CompanyTableRow) => <BooleanCell value={h.freeMigration} /> },
      ],
    },
    {
      name: 'Pricing Details',
      rows: [
        { label: 'First Year Cost', render: (h: CompanyTableRow) => formatPrice(h.firstYearCost) },
        { label: 'Second Year Cost', render: (h: CompanyTableRow) => formatPrice(h.secondYearCost) },
        { label: 'Money Back Guarantee', render: (h: CompanyTableRow) => formatDays(h.moneyBackDays) },
        { label: 'Setup Fee', render: (h: CompanyTableRow) => h.setupFee !== null ? (h.setupFee === 0 ? 'Free' : formatPrice(h.setupFee)) : '—' },
        { label: 'Monthly Billing', render: (h: CompanyTableRow) => <BooleanCell value={h.monthlyBillingAvailable} /> },
        { label: 'Minimum Contract', render: (h: CompanyTableRow) => h.minimumContractMonths !== null ? `${h.minimumContractMonths} months` : '—' },
      ],
    },
    {
      name: 'Technical Specs',
      rows: [
        { label: 'Storage', render: (h: CompanyTableRow) => h.storageGb === 'Unlimited' ? 'Unlimited' : h.storageGb ? `${h.storageGb} GB` : '—' },
        { label: 'Storage Type', render: (h: CompanyTableRow) => h.storageType?.toUpperCase() || '—' },
        { label: 'Bandwidth', render: (h: CompanyTableRow) => h.bandwidthGb === 'Unlimited' ? 'Unlimited' : h.bandwidthGb ? `${h.bandwidthGb} GB` : '—' },
        { label: 'Max Websites', render: (h: CompanyTableRow) => formatNumber(h.maxWebsites) },
        { label: 'Max Databases', render: (h: CompanyTableRow) => formatNumber(h.maxDatabases) },
        { label: 'PHP Versions', render: (h: CompanyTableRow) => formatArray(h.phpVersions) },
        { label: 'SSH Access', render: (h: CompanyTableRow) => <BooleanCell value={h.sshAccess} /> },
        { label: 'Git Deployment', render: (h: CompanyTableRow) => <BooleanCell value={h.gitDeployment} /> },
        { label: 'Staging Environment', render: (h: CompanyTableRow) => <BooleanCell value={h.stagingEnvironment} /> },
        { label: 'Cron Jobs', render: (h: CompanyTableRow) => <BooleanCell value={h.cronJobs} /> },
        { label: 'Redis Available', render: (h: CompanyTableRow) => <BooleanCell value={h.redisAvailable} /> },
      ],
    },
    {
      name: 'Programming Languages',
      rows: [
        { label: 'Node.js Support', render: (h: CompanyTableRow) => <BooleanCell value={h.nodejsSupport} /> },
        { label: 'Python Support', render: (h: CompanyTableRow) => <BooleanCell value={h.pythonSupport} /> },
        { label: 'Ruby Support', render: (h: CompanyTableRow) => <BooleanCell value={h.rubySupport} /> },
      ],
    },
    {
      name: 'WordPress Features',
      rows: [
        { label: 'WordPress Optimized', render: (h: CompanyTableRow) => <BooleanCell value={h.wordpressOptimized} /> },
        { label: 'WordPress Auto-Install', render: (h: CompanyTableRow) => <BooleanCell value={h.wordpressAutoInstall} /> },
        { label: 'WordPress Auto-Updates', render: (h: CompanyTableRow) => <BooleanCell value={h.wordpressAutoUpdates} /> },
        { label: 'WordPress Staging', render: (h: CompanyTableRow) => <BooleanCell value={h.wordpressStaging} /> },
        { label: 'WooCommerce Optimized', render: (h: CompanyTableRow) => <BooleanCell value={h.woocommerceOptimized} /> },
        { label: 'LiteSpeed Cache', render: (h: CompanyTableRow) => <BooleanCell value={h.litespeedCache} /> },
        { label: 'Object Caching', render: (h: CompanyTableRow) => <BooleanCell value={h.objectCaching} /> },
        { label: 'WP Multisite', render: (h: CompanyTableRow) => <BooleanCell value={h.wpMultisite} /> },
        { label: 'WP-CLI Access', render: (h: CompanyTableRow) => <BooleanCell value={h.wpCliAccess} /> },
      ],
    },
    {
      name: 'Security',
      rows: [
        { label: 'DDoS Protection', render: (h: CompanyTableRow) => <BooleanCell value={h.ddosProtection} /> },
        { label: 'DDoS Protection Level', render: (h: CompanyTableRow) => h.ddosProtectionLevel || '—' },
        { label: 'Malware Scanning', render: (h: CompanyTableRow) => <BooleanCell value={h.malwareScanning} /> },
        { label: 'Malware Removal', render: (h: CompanyTableRow) => <BooleanCell value={h.malwareRemoval} /> },
        { label: 'Firewall Included', render: (h: CompanyTableRow) => <BooleanCell value={h.firewallIncluded} /> },
        { label: 'Backup Frequency', render: (h: CompanyTableRow) => h.backupFrequency || '—' },
        { label: 'Backup Retention', render: (h: CompanyTableRow) => formatDays(h.backupRetentionDays) },
        { label: 'Backup Restore Fee', render: (h: CompanyTableRow) => h.backupRestoreFee !== null ? (h.backupRestoreFee === 0 ? 'Free' : formatPrice(h.backupRestoreFee)) : '—' },
        { label: 'On-Demand Backup', render: (h: CompanyTableRow) => <BooleanCell value={h.onDemandBackup} /> },
        { label: 'Two-Factor Auth', render: (h: CompanyTableRow) => <BooleanCell value={h.twoFactorAuth} /> },
        { label: 'Wildcard SSL', render: (h: CompanyTableRow) => <BooleanCell value={h.wildcardSsl} /> },
        { label: 'Dedicated IP', render: (h: CompanyTableRow) => <BooleanCell value={h.dedicatedIpAvailable} /> },
      ],
    },
    {
      name: 'Support',
      rows: [
        { label: 'Support Channels', render: (h: CompanyTableRow) => formatArray(h.supportChannels) },
        { label: 'Live Chat', render: (h: CompanyTableRow) => <BooleanCell value={h.liveChatAvailable} /> },
        { label: 'Live Chat Hours', render: (h: CompanyTableRow) => h.liveChatHours || '—' },
        { label: 'Phone Support', render: (h: CompanyTableRow) => <BooleanCell value={h.phoneSupportAvailable} /> },
        { label: 'Phone Support Hours', render: (h: CompanyTableRow) => h.phoneSupportHours || '—' },
        { label: 'Ticket Support', render: (h: CompanyTableRow) => <BooleanCell value={h.ticketSupport} /> },
        { label: 'Priority Support', render: (h: CompanyTableRow) => <BooleanCell value={h.prioritySupport} /> },
        { label: 'Support Languages', render: (h: CompanyTableRow) => formatArray(h.supportLanguages) },
        { label: 'Knowledge Base Quality', render: (h: CompanyTableRow) => formatRating10(h.knowledgeBaseQuality) },
        { label: 'Avg Support Wait', render: (h: CompanyTableRow) => h.avgSupportWaitMinutes !== null ? `${h.avgSupportWaitMinutes} min` : '—' },
      ],
    },
    {
      name: 'Email',
      rows: [
        { label: 'Email Accounts', render: (h: CompanyTableRow) => <BooleanCell value={h.emailAccountsIncluded} /> },
        { label: 'Email Account Limit', render: (h: CompanyTableRow) => formatNumber(h.emailAccountLimit) },
        { label: 'Mailbox Size', render: (h: CompanyTableRow) => h.mailboxSizeGb !== null ? `${h.mailboxSizeGb} GB` : '—' },
        { label: 'Webmail Access', render: (h: CompanyTableRow) => <BooleanCell value={h.webmailAccess} /> },
        { label: 'Spam Filter', render: (h: CompanyTableRow) => <BooleanCell value={h.spamFilter} /> },
        { label: 'Email Forwarding', render: (h: CompanyTableRow) => <BooleanCell value={h.emailForwarding} /> },
      ],
    },
    {
      name: 'Performance',
      rows: [
        { label: 'CDN Included', render: (h: CompanyTableRow) => <BooleanCell value={h.cdnIncluded} /> },
        { label: 'CDN Provider', render: (h: CompanyTableRow) => h.cdnProvider || '—' },
        { label: 'Server Locations', render: (h: CompanyTableRow) => formatArray(h.serverLocations) },
        { label: 'Server Location Count', render: (h: CompanyTableRow) => formatNumber(h.serverLocationCount) },
        { label: 'Choose Server Location', render: (h: CompanyTableRow) => <BooleanCell value={h.chooseServerLocation} /> },
        { label: 'HTTP/2 Support', render: (h: CompanyTableRow) => <BooleanCell value={h.http2Support} /> },
        { label: 'Brotli Compression', render: (h: CompanyTableRow) => <BooleanCell value={h.brotliCompression} /> },
        { label: 'Uptime SLA Credit', render: (h: CompanyTableRow) => <BooleanCell value={h.uptimeSlaCredit} /> },
      ],
    },
    {
      name: 'Platform Support',
      rows: [
        { label: 'Drupal Support', render: (h: CompanyTableRow) => <BooleanCell value={h.drupalSupport} /> },
        { label: 'Joomla Support', render: (h: CompanyTableRow) => <BooleanCell value={h.joomlaSupport} /> },
        { label: 'Magento Support', render: (h: CompanyTableRow) => <BooleanCell value={h.magentoSupport} /> },
        { label: 'Laravel Support', render: (h: CompanyTableRow) => <BooleanCell value={h.laravelSupport} /> },
        { label: 'Django Support', render: (h: CompanyTableRow) => <BooleanCell value={h.djangoSupport} /> },
        { label: 'Next.js Support', render: (h: CompanyTableRow) => <BooleanCell value={h.nextjsSupport} /> },
        { label: 'Rails Support', render: (h: CompanyTableRow) => <BooleanCell value={h.railsSupport} /> },
        { label: 'Static Site Support', render: (h: CompanyTableRow) => <BooleanCell value={h.staticSiteSupport} /> },
      ],
    },
    {
      name: 'Control Panel',
      rows: [
        { label: 'cPanel Included', render: (h: CompanyTableRow) => <BooleanCell value={h.cpanelIncluded} /> },
        { label: 'Control Panel', render: (h: CompanyTableRow) => h.controlPanelName || '—' },
        { label: 'Softaculous', render: (h: CompanyTableRow) => <BooleanCell value={h.softaculous} /> },
        { label: 'Website Builder', render: (h: CompanyTableRow) => <BooleanCell value={h.websiteBuilderIncluded} /> },
        { label: 'Builder Name', render: (h: CompanyTableRow) => h.websiteBuilderName || '—' },
      ],
    },
    {
      name: 'Migration',
      rows: [
        { label: 'Migration Websites Limit', render: (h: CompanyTableRow) => formatNumber(h.migrationWebsitesLimit) },
        { label: 'Migration Turnaround', render: (h: CompanyTableRow) => formatDays(h.migrationTurnaroundDays) },
        { label: 'Paid Migration Cost', render: (h: CompanyTableRow) => h.paidMigrationCost !== null ? (h.paidMigrationCost === 0 ? 'Free' : formatPrice(h.paidMigrationCost)) : '—' },
        { label: 'Migration Quality', render: (h: CompanyTableRow) => formatRating10(h.migrationQuality) },
      ],
    },
    {
      name: 'Compliance',
      rows: [
        { label: 'GDPR Compliant', render: (h: CompanyTableRow) => <BooleanCell value={h.gdprCompliance} /> },
        { label: 'PCI Compliant', render: (h: CompanyTableRow) => <BooleanCell value={h.pciCompliance} /> },
        { label: 'HIPAA Compliant', render: (h: CompanyTableRow) => <BooleanCell value={h.hipaaCompliance} /> },
        { label: 'Data Center Certs', render: (h: CompanyTableRow) => formatArray(h.dataCenterCerts) },
      ],
    },
    {
      name: 'Ratings',
      rows: [
        { label: 'Value for Money', render: (h: CompanyTableRow) => formatRating10(h.valueForMoney) },
        { label: 'Performance Rating', render: (h: CompanyTableRow) => formatRating10(h.performanceRating) },
        { label: 'Support Quality', render: (h: CompanyTableRow) => formatRating10(h.supportQuality) },
        { label: 'Security Rating', render: (h: CompanyTableRow) => formatRating10(h.securityRating) },
        { label: 'Features Rating', render: (h: CompanyTableRow) => formatRating10(h.featuresRating) },
        { label: 'Ease of Use', render: (h: CompanyTableRow) => formatRating10(h.easeOfUse) },
        { label: 'Transparency Rating', render: (h: CompanyTableRow) => formatRating10(h.transparencyRating) },
      ],
    },
    {
      name: 'Suitability Scores',
      rows: [
        { label: 'For Bloggers', render: (h: CompanyTableRow) => formatRating10(h.suitabilityBlogger) },
        { label: 'For E-commerce', render: (h: CompanyTableRow) => formatRating10(h.suitabilityEcommerce) },
        { label: 'For Agencies', render: (h: CompanyTableRow) => formatRating10(h.suitabilityAgency) },
        { label: 'For Developers', render: (h: CompanyTableRow) => formatRating10(h.suitabilityDeveloper) },
        { label: 'For Beginners', render: (h: CompanyTableRow) => formatRating10(h.suitabilityBeginner) },
        { label: 'For Enterprise', render: (h: CompanyTableRow) => formatRating10(h.suitabilityEnterprise) },
      ],
    },
    {
      name: 'Policies',
      rows: [
        { label: 'Bandwidth Overage', render: (h: CompanyTableRow) => h.bandwidthOveragePolicy || '—' },
        { label: 'Storage Overage', render: (h: CompanyTableRow) => h.storageOveragePolicy || '—' },
        { label: 'Adult Content Allowed', render: (h: CompanyTableRow) => <BooleanCell value={h.adultContentAllowed} /> },
        { label: 'Gambling Sites Allowed', render: (h: CompanyTableRow) => <BooleanCell value={h.gamblingSitesAllowed} /> },
        { label: 'Crypto Sites Allowed', render: (h: CompanyTableRow) => <BooleanCell value={h.cryptocurrencySitesAllowed} /> },
        { label: 'Reseller Hosting', render: (h: CompanyTableRow) => <BooleanCell value={h.resellerHostingAvailable} /> },
        { label: 'White Label', render: (h: CompanyTableRow) => <BooleanCell value={h.whiteLabelAvailable} /> },
        { label: 'API Access', render: (h: CompanyTableRow) => <BooleanCell value={h.apiAccess} /> },
      ],
    },
    {
      name: 'Company Info',
      rows: [
        { label: 'Year Founded', render: (h: CompanyTableRow) => h.yearFounded || '—' },
        { label: 'Headquarters', render: (h: CompanyTableRow) => h.headquartersCountry || '—' },
        { label: 'Parent Company', render: (h: CompanyTableRow) => h.parentCompany || '—' },
        { label: 'Green Hosting', render: (h: CompanyTableRow) => <BooleanCell value={h.greenHosting} /> },
        { label: 'Instant Activation', render: (h: CompanyTableRow) => <BooleanCell value={h.instantAccountActivation} /> },
      ],
    },
    {
      name: 'Managed WordPress',
      rows: [
        { label: 'Managed WP Available', render: (h: CompanyTableRow) => <BooleanCell value={h.managedWordpressAvailable} /> },
        { label: 'Pricing Model', render: (h: CompanyTableRow) => h.wpPricingModel || '—' },
        { label: 'Monthly Visit Limit', render: (h: CompanyTableRow) => formatNumber(h.monthlyVisitLimit) },
        { label: 'Visit Overage Cost', render: (h: CompanyTableRow) => formatPrice(h.visitOverageCost) },
        { label: 'PHP Workers', render: (h: CompanyTableRow) => formatNumber(h.phpWorkerLimit) },
        { label: 'Plugin Restrictions', render: (h: CompanyTableRow) => formatArray(h.pluginRestrictions) },
        { label: 'Dev Environment', render: (h: CompanyTableRow) => <BooleanCell value={h.devEnvironmentIncluded} /> },
        { label: 'Dev Env Name', render: (h: CompanyTableRow) => h.devEnvironmentName || '—' },
      ],
    },
    {
      name: 'Regional Info',
      rows: [
        { label: 'Best Countries', render: (h: CompanyTableRow) => formatArray(h.bestForCountries) },
        { label: 'Local Currencies', render: (h: CompanyTableRow) => formatArray(h.localCurrencyBilling) },
        { label: 'Support Languages', render: (h: CompanyTableRow) => formatArray(h.localSupportLanguages) },
        { label: 'Data Sovereignty', render: (h: CompanyTableRow) => formatArray(h.dataSovereigntyCompliance) },
      ],
    },
    {
      name: 'External Ratings',
      rows: [
        { label: 'G2 Rating', render: (h: CompanyTableRow) => formatRating(h.g2Rating) },
        { label: 'BBB Rating', render: (h: CompanyTableRow) => h.betterBusinessBureauRating || '—' },
      ],
    },
    {
      name: 'Advanced Technical',
      rows: [
        { label: 'Inode Limit', render: (h: CompanyTableRow) => formatNumber(h.inodeLimit) },
        { label: 'Max DB Size', render: (h: CompanyTableRow) => h.maxDatabaseSizeGb ? `${h.maxDatabaseSizeGb} GB` : '—' },
        { label: 'Max Upload Size', render: (h: CompanyTableRow) => h.maxFileUploadSizeMb ? `${h.maxFileUploadSizeMb} MB` : '—' },
        { label: 'Database Type', render: (h: CompanyTableRow) => h.databaseType || '—' },
        { label: 'Elasticsearch', render: (h: CompanyTableRow) => <BooleanCell value={h.elasticsearchSupport} /> },
        { label: 'Image Optimization', render: (h: CompanyTableRow) => <BooleanCell value={h.imageOptimization} /> },
        { label: 'PHP Switching', render: (h: CompanyTableRow) => <BooleanCell value={h.phpVersionSwitching} /> },
        { label: 'Subdomains', render: (h: CompanyTableRow) => formatNumber(h.subdomainsLimit) },
        { label: 'FTP Accounts', render: (h: CompanyTableRow) => formatNumber(h.ftpAccountsLimit) },
      ],
    },
    {
      name: 'Additional Pricing',
      rows: [
        { label: 'Free Domain Duration', render: (h: CompanyTableRow) => h.freeDomainDurationMonths ? `${h.freeDomainDurationMonths} months` : '—' },
        { label: 'Money Back Exclusions', render: (h: CompanyTableRow) => h.moneyBackExclusions || '—' },
        { label: 'Payment Methods', render: (h: CompanyTableRow) => formatArray(h.acceptedPaymentMethods) },
        { label: 'Auto Renewal Default', render: (h: CompanyTableRow) => <BooleanCell value={h.autoRenewalDefault} /> },
        { label: 'Domain Privacy Included', render: (h: CompanyTableRow) => <BooleanCell value={h.domainPrivacyIncluded} /> },
        { label: 'Domain Privacy Cost', render: (h: CompanyTableRow) => h.domainPrivacyCostYearly ? `$${h.domainPrivacyCostYearly}/yr` : '—' },
        { label: 'SSL Provider', render: (h: CompanyTableRow) => h.sslProvider || '—' },
        { label: 'Dedicated IP Cost', render: (h: CompanyTableRow) => h.dedicatedIpCostMonthly ? `$${h.dedicatedIpCostMonthly}/mo` : '—' },
      ],
    },
    {
      name: 'Additional Support',
      rows: [
        { label: 'Phone Support Countries', render: (h: CompanyTableRow) => formatArray(h.phoneSupportCountries) },
        { label: 'Priority Support Cost', render: (h: CompanyTableRow) => formatPrice(h.prioritySupportCost) },
        { label: 'Community Forum', render: (h: CompanyTableRow) => <BooleanCell value={h.communityForumActive} /> },
        { label: 'Support Outsourced', render: (h: CompanyTableRow) => <BooleanCell value={h.supportOutsourced} /> },
        { label: 'Object Cache Type', render: (h: CompanyTableRow) => h.objectCacheType || '—' },
      ],
    },
    {
      name: 'Business & Affiliate',
      rows: [
        { label: 'Affiliate Program', render: (h: CompanyTableRow) => <BooleanCell value={h.affiliateProgram} /> },
        { label: 'Commission Type', render: (h: CompanyTableRow) => h.affiliateCommissionType || '—' },
        { label: 'Commission Amount', render: (h: CompanyTableRow) => h.affiliateCommissionAmount || '—' },
      ],
    },
    {
      name: 'Additional Policies',
      rows: [
        { label: 'File Hosting Allowed', render: (h: CompanyTableRow) => <BooleanCell value={h.fileHostingAllowed} /> },
        { label: 'Proxy/VPN Allowed', render: (h: CompanyTableRow) => <BooleanCell value={h.proxyVpnAllowed} /> },
        { label: 'Bandwidth Overage Cost', render: (h: CompanyTableRow) => formatPrice(h.bandwidthOverageCost) },
        { label: 'Account Suspension Policy', render: (h: CompanyTableRow) => h.accountSuspensionPolicy || '—' },
        { label: 'Malware Removal Cost', render: (h: CompanyTableRow) => formatPrice(h.malwareRemovalCost) },
        { label: 'Downloadable Backups', render: (h: CompanyTableRow) => <BooleanCell value={h.downloadableBackups} /> },
      ],
    },
    {
      name: 'Additional Platforms',
      rows: [
        { label: 'PrestaShop', render: (h: CompanyTableRow) => <BooleanCell value={h.prestashopSupport} /> },
        { label: 'Ghost', render: (h: CompanyTableRow) => <BooleanCell value={h.ghostSupport} /> },
        { label: 'Shopify Migration', render: (h: CompanyTableRow) => <BooleanCell value={h.shopifyMigration} /> },
        { label: 'Wix Migration', render: (h: CompanyTableRow) => <BooleanCell value={h.wixMigration} /> },
        { label: 'Squarespace Migration', render: (h: CompanyTableRow) => <BooleanCell value={h.squarespaceMigration} /> },
        { label: 'Webflow Export', render: (h: CompanyTableRow) => <BooleanCell value={h.webflowExport} /> },
      ],
    },
    {
      name: 'Editorial Info',
      rows: [
        { label: 'Best For', render: (h: CompanyTableRow) => h.bestFor || '—' },
        { label: 'Avoid If', render: (h: CompanyTableRow) => h.avoidIf || '—' },
        { label: 'Known Issues', render: (h: CompanyTableRow) => h.knownIssues || '—' },
        { label: 'Unique Selling Point', render: (h: CompanyTableRow) => h.uniqueSellingPoint || '—' },
        { label: 'Ideal Customer', render: (h: CompanyTableRow) => h.idealCustomerProfile || '—' },
        { label: 'Best Alternative To', render: (h: CompanyTableRow) => h.bestAlternativeTo || '—' },
        { label: 'Primary Competitors', render: (h: CompanyTableRow) => formatArray(h.primaryCompetitors) },
      ],
    },
  ];

  // JSON-LD Schema for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${hostA.name} vs ${hostB.name}: Complete 2026 Comparison`,
    description: `Side-by-side comparison of ${hostA.name} and ${hostB.name} web hosting providers.`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'Product',
            name: hostA.name,
            description: `${hostA.name} web hosting`,
            image: 'https://hostduel.com/logo.png',
            aggregateRating: hostA.overallRating ? {
              '@type': 'AggregateRating',
              ratingValue: hostA.overallRating,
              bestRating: 5,
              ratingCount: 1,
            } : undefined,
            offers: hostA.monthlyPrice ? {
              '@type': 'Offer',
              price: hostA.monthlyPrice,
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
            } : undefined,
          },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@type': 'Product',
            name: hostB.name,
            description: `${hostB.name} web hosting`,
            image: 'https://hostduel.com/logo.png',
            aggregateRating: hostB.overallRating ? {
              '@type': 'AggregateRating',
              ratingValue: hostB.overallRating,
              bestRating: 5,
              ratingCount: 1,
            } : undefined,
            offers: hostB.monthlyPrice ? {
              '@type': 'Offer',
              price: hostB.monthlyPrice,
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
            } : undefined,
          },
        },
      ],
    },
  };

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs & Header */}
      <section className="border-b border-border-subtle bg-bg-secondary py-8">
        <Container>
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-text-muted mb-4">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/#compare" className="hover:text-foreground transition-colors">Compare</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-text-secondary">{hostA.name} vs {hostB.name}</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {hostA.name} vs {hostB.name}: Complete 2026 Comparison
          </h1>
          <p className="mt-2 text-text-secondary max-w-2xl">
            In-depth comparison of these two hosting providers across pricing, performance, features, and support.
          </p>
        </Container>
      </section>

      {/* Winner Summary */}
      <section className="py-8 border-b border-border-subtle">
        <Container>
          <WinnerSummary
            hostA={hostA}
            hostB={hostB}
            winner={overallWinner.winner}
            reasons={overallWinner.reasons}
          />
        </Container>
      </section>

      {/* Category Winners */}
      <section className="py-8 border-b border-border-subtle">
        <Container>
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Category Winners
          </h2>
          <CategoryWinners
            hostA={hostA}
            hostB={hostB}
            winners={categoryWinners}
          />
        </Container>
      </section>

      {/* Side-by-Side Comparison Table */}
      <section className="py-8 border-b border-border-subtle">
        <Container>
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="py-4 px-4 text-left text-sm font-medium text-text-secondary w-48">
                    Feature
                  </th>
                  <th className="py-4 px-4 text-center min-w-[180px]">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-lg font-semibold text-blue-400">{hostA.name}</span>
                      <Link href={`/hosting/${hostA.id}`}>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center min-w-[180px]">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-lg font-semibold text-purple-400">{hostB.name}</span>
                      <Link href={`/hosting/${hostB.id}`}>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonCategories.map((category) => (
                  <>
                    {/* Category Header */}
                    <tr key={`cat-${category.name}`} className="bg-bg-secondary border-t border-border-subtle">
                      <td colSpan={3} className="py-3 px-4 text-sm font-semibold text-accent">
                        {category.name}
                      </td>
                    </tr>
                    {/* Category Rows */}
                    {category.rows.map((row, idx) => (
                      <tr
                        key={`${category.name}-${row.label}`}
                        className={idx % 2 === 0 ? 'bg-bg-secondary/30' : ''}
                      >
                        <td className="py-2.5 px-4 text-sm text-text-secondary">
                          {row.label}
                        </td>
                        <td className="py-2.5 px-4 text-center text-sm">
                          {row.render(hostA)}
                        </td>
                        <td className="py-2.5 px-4 text-center text-sm">
                          {row.render(hostB)}
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          <DataDisclaimer className="mt-6" />
        </Container>
      </section>

      {/* Verdict Section */}
      <section className="py-8 border-b border-border-subtle">
        <Container>
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Our Verdict
          </h2>
          <VerdictSection hostA={hostA} hostB={hostB} />
        </Container>
      </section>

      {/* Dual CTA Buttons */}
      <section className="py-8 border-b border-border-subtle">
        <Container>
          <div className="grid gap-4 md:grid-cols-2">
            <TrackedLink
              href={`/go/${hostA.id}`}
              hostId={hostA.id}
              hostName={hostA.name}
              action="visit_site"
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 p-6 hover:bg-blue-500/20 transition-colors"
            >
              <span className="text-lg font-semibold text-blue-400">
                Visit {hostA.name}
              </span>
              <ExternalLink className="h-5 w-5 text-blue-400" />
            </TrackedLink>
            <TrackedLink
              href={`/go/${hostB.id}`}
              hostId={hostB.id}
              hostName={hostB.name}
              action="visit_site"
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 p-6 hover:bg-purple-500/20 transition-colors"
            >
              <span className="text-lg font-semibold text-purple-400">
                Visit {hostB.name}
              </span>
              <ExternalLink className="h-5 w-5 text-purple-400" />
            </TrackedLink>
          </div>
        </Container>
      </section>

      {/* Related Comparisons */}
      {relatedWithNames.length > 0 && (
        <section className="py-8">
          <Container>
            <RelatedComparisons
              comparisons={relatedWithNames}
              currentHostNames={[hostA.name, hostB.name]}
            />
          </Container>
        </section>
      )}
    </>
  );
}

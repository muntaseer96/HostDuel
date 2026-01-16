import {
  HardDrive,
  Wifi,
  Globe,
  Shield,
  Headphones,
  Mail,
  Server,
  CheckCircle,
  XCircle,
  DollarSign,
  Settings,
  Users,
  FileText,
  Zap,
  Target,
  Code,
  MapPin,
} from 'lucide-react';
import { Container } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import type { Company, CompanyTableRow, NumberOrUnlimited } from '@/types';

interface SpecsGridProps {
  company: Company;
  tableRow: CompanyTableRow;
}

export function SpecsGrid({ company, tableRow }: SpecsGridProps) {
  return (
    <section className="py-12 bg-bg-secondary">
      <Container>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Technical Specifications
        </h2>
        <p className="text-text-secondary mb-8">
          Complete feature breakdown across all {getSpecCount(tableRow)} data points
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Storage & Resources */}
          <SpecCard
            icon={<HardDrive className="h-5 w-5" />}
            title="Storage & Resources"
            specs={[
              { label: 'Storage', value: formatStorage(tableRow.storageGb, tableRow.storageType) },
              { label: 'Storage Type', value: tableRow.storageType },
              { label: 'Bandwidth', value: formatBandwidth(tableRow.bandwidthGb) },
              { label: 'Websites', value: formatNumber(tableRow.maxWebsites) },
              { label: 'Databases', value: formatNumber(tableRow.maxDatabases) },
              { label: 'PHP Versions', value: tableRow.phpVersions?.join(', ') || null },
            ]}
          />

          {/* Server & Performance */}
          <SpecCard
            icon={<Server className="h-5 w-5" />}
            title="Performance"
            specs={[
              { label: 'Uptime Guarantee', value: tableRow.uptimeGuarantee ? `${tableRow.uptimeGuarantee}%` : null },
              { label: 'Uptime SLA Credit', value: tableRow.uptimeSlaCredit },
              { label: 'CDN Included', value: tableRow.cdnIncluded },
              { label: 'CDN Provider', value: tableRow.cdnProvider },
              { label: 'HTTP/2', value: tableRow.http2Support },
              { label: 'Brotli Compression', value: tableRow.brotliCompression },
            ]}
          />

          {/* Server Locations */}
          <SpecCard
            icon={<MapPin className="h-5 w-5" />}
            title="Server Locations"
            specs={[
              { label: 'Location Count', value: tableRow.serverLocationCount ? `${tableRow.serverLocationCount} locations` : null },
              { label: 'Choose Location', value: tableRow.chooseServerLocation },
              { label: 'Locations', value: tableRow.serverLocations?.slice(0, 3).join(', ') || null },
            ]}
          />

          {/* Security - Basic */}
          <SpecCard
            icon={<Shield className="h-5 w-5" />}
            title="Security"
            specs={[
              { label: 'Free SSL', value: tableRow.freeSsl },
              { label: 'Wildcard SSL', value: tableRow.wildcardSsl },
              { label: 'Dedicated IP', value: tableRow.dedicatedIpAvailable },
              { label: 'DDoS Protection', value: tableRow.ddosProtection },
              { label: 'DDoS Level', value: tableRow.ddosProtectionLevel },
              { label: '2FA', value: tableRow.twoFactorAuth },
            ]}
          />

          {/* Security - Advanced */}
          <SpecCard
            icon={<Shield className="h-5 w-5" />}
            title="Backups & Malware"
            specs={[
              { label: 'Malware Scanning', value: tableRow.malwareScanning },
              { label: 'Malware Removal', value: tableRow.malwareRemoval },
              { label: 'Firewall', value: tableRow.firewallIncluded },
              { label: 'Backup Frequency', value: tableRow.backupFrequency },
              { label: 'Backup Retention', value: tableRow.backupRetentionDays ? `${tableRow.backupRetentionDays} days` : null },
              { label: 'On-Demand Backup', value: tableRow.onDemandBackup },
              { label: 'Restore Fee', value: tableRow.backupRestoreFee !== null ? (tableRow.backupRestoreFee === 0 ? 'Free' : `$${tableRow.backupRestoreFee}`) : null },
            ]}
          />

          {/* Developer Features */}
          <SpecCard
            icon={<Code className="h-5 w-5" />}
            title="Developer Tools"
            specs={[
              { label: 'SSH Access', value: tableRow.sshAccess },
              { label: 'Git Deployment', value: tableRow.gitDeployment },
              { label: 'Staging', value: tableRow.stagingEnvironment },
              { label: 'Cron Jobs', value: tableRow.cronJobs },
              { label: 'Redis', value: tableRow.redisAvailable },
              { label: 'WP-CLI', value: tableRow.wpCliAccess },
            ]}
          />

          {/* Language Support */}
          <SpecCard
            icon={<Globe className="h-5 w-5" />}
            title="Language Support"
            specs={[
              { label: 'Node.js', value: tableRow.nodejsSupport },
              { label: 'Python', value: tableRow.pythonSupport },
              { label: 'Ruby', value: tableRow.rubySupport },
            ]}
          />

          {/* WordPress */}
          <SpecCard
            icon={<Wifi className="h-5 w-5" />}
            title="WordPress"
            specs={[
              { label: 'WP Optimized', value: tableRow.wordpressOptimized },
              { label: 'Auto Install', value: tableRow.wordpressAutoInstall },
              { label: 'Auto Updates', value: tableRow.wordpressAutoUpdates },
              { label: 'WP Staging', value: tableRow.wordpressStaging },
              { label: 'WooCommerce', value: tableRow.woocommerceOptimized },
              { label: 'LiteSpeed Cache', value: tableRow.litespeedCache },
              { label: 'Object Caching', value: tableRow.objectCaching },
              { label: 'Multisite', value: tableRow.wpMultisite },
            ]}
          />

          {/* Support */}
          <SpecCard
            icon={<Headphones className="h-5 w-5" />}
            title="Support"
            specs={[
              { label: 'Live Chat', value: tableRow.liveChatAvailable },
              { label: 'Chat Hours', value: tableRow.liveChatHours },
              { label: 'Phone Support', value: tableRow.phoneSupportAvailable },
              { label: 'Phone Hours', value: tableRow.phoneSupportHours },
              { label: 'Ticket Support', value: tableRow.ticketSupport },
              { label: 'Priority Support', value: tableRow.prioritySupport },
              { label: 'Avg Wait', value: tableRow.avgSupportWaitMinutes ? `${tableRow.avgSupportWaitMinutes} min` : null },
              { label: 'KB Quality', value: tableRow.knowledgeBaseQuality ? `${tableRow.knowledgeBaseQuality}/5` : null },
              { label: 'Channels', value: tableRow.supportChannels?.join(', ') || null },
              { label: 'Languages', value: tableRow.supportLanguages?.join(', ') || null },
            ]}
          />

          {/* Email */}
          <SpecCard
            icon={<Mail className="h-5 w-5" />}
            title="Email"
            specs={[
              { label: 'Email Included', value: tableRow.emailAccountsIncluded },
              { label: 'Account Limit', value: formatNumber(tableRow.emailAccountLimit) },
              { label: 'Mailbox Size', value: tableRow.mailboxSizeGb ? `${tableRow.mailboxSizeGb} GB` : null },
              { label: 'Webmail', value: tableRow.webmailAccess },
              { label: 'Spam Filter', value: tableRow.spamFilter },
              { label: 'Forwarding', value: tableRow.emailForwarding },
            ]}
          />

          {/* Pricing Details */}
          <SpecCard
            icon={<DollarSign className="h-5 w-5" />}
            title="Pricing Details"
            specs={[
              { label: 'Monthly Price', value: tableRow.monthlyPrice ? `$${tableRow.monthlyPrice}/mo` : null },
              { label: 'Renewal Price', value: tableRow.renewalPrice ? `$${tableRow.renewalPrice}/mo` : null },
              { label: 'Renewal Markup', value: tableRow.renewalMarkupPercent ? `${tableRow.renewalMarkupPercent.toFixed(0)}%` : null },
              { label: '1st Year Cost', value: tableRow.firstYearCost ? `$${tableRow.firstYearCost}` : null },
              { label: '2nd Year Cost', value: tableRow.secondYearCost ? `$${tableRow.secondYearCost}` : null },
              { label: 'Setup Fee', value: tableRow.setupFee !== null ? (tableRow.setupFee === 0 ? 'None' : `$${tableRow.setupFee}`) : null },
              { label: 'Money Back', value: tableRow.moneyBackDays ? `${tableRow.moneyBackDays} days` : null },
              { label: 'Monthly Billing', value: tableRow.monthlyBillingAvailable },
              { label: 'Min Contract', value: tableRow.minimumContractMonths ? `${tableRow.minimumContractMonths} months` : null },
            ]}
          />

          {/* Free Inclusions */}
          <SpecCard
            icon={<Zap className="h-5 w-5" />}
            title="Free Inclusions"
            specs={[
              { label: 'Free SSL', value: tableRow.freeSsl },
              { label: 'Free Domain', value: tableRow.freeDomain },
              { label: 'Free Migration', value: tableRow.freeMigration },
              { label: 'Free CDN', value: tableRow.cdnIncluded },
            ]}
          />

          {/* Migration */}
          <SpecCard
            icon={<Settings className="h-5 w-5" />}
            title="Migration"
            specs={[
              { label: 'Free Migration', value: tableRow.freeMigration },
              { label: 'Sites Limit', value: tableRow.migrationWebsitesLimit ? `${tableRow.migrationWebsitesLimit} sites` : null },
              { label: 'Turnaround', value: tableRow.migrationTurnaroundDays ? `${tableRow.migrationTurnaroundDays} days` : null },
              { label: 'Paid Cost', value: tableRow.paidMigrationCost ? `$${tableRow.paidMigrationCost}` : null },
              { label: 'Quality', value: tableRow.migrationQuality ? `${tableRow.migrationQuality}/5` : null },
            ]}
          />

          {/* Control Panel */}
          <SpecCard
            icon={<Settings className="h-5 w-5" />}
            title="Control Panel"
            specs={[
              { label: 'cPanel', value: tableRow.cpanelIncluded },
              { label: 'Panel Name', value: tableRow.controlPanelName },
              { label: 'Softaculous', value: tableRow.softaculous },
              { label: 'Site Builder', value: tableRow.websiteBuilderIncluded },
              { label: 'Builder Name', value: tableRow.websiteBuilderName },
            ]}
          />

          {/* Compliance */}
          <SpecCard
            icon={<FileText className="h-5 w-5" />}
            title="Compliance"
            specs={[
              { label: 'GDPR', value: tableRow.gdprCompliance },
              { label: 'PCI', value: tableRow.pciCompliance },
              { label: 'HIPAA', value: tableRow.hipaaCompliance },
              { label: 'Certifications', value: tableRow.dataCenterCerts?.join(', ') || null },
            ]}
          />

          {/* Platform Support */}
          <SpecCard
            icon={<Globe className="h-5 w-5" />}
            title="CMS Platforms"
            specs={[
              { label: 'Drupal', value: tableRow.drupalSupport },
              { label: 'Joomla', value: tableRow.joomlaSupport },
              { label: 'Magento', value: tableRow.magentoSupport },
              { label: 'Laravel', value: tableRow.laravelSupport },
              { label: 'Django', value: tableRow.djangoSupport },
              { label: 'Next.js', value: tableRow.nextjsSupport },
              { label: 'Rails', value: tableRow.railsSupport },
              { label: 'Static Sites', value: tableRow.staticSiteSupport },
            ]}
          />

          {/* Content Policies */}
          <SpecCard
            icon={<FileText className="h-5 w-5" />}
            title="Content Policies"
            specs={[
              { label: 'Adult Content', value: tableRow.adultContentAllowed },
              { label: 'Gambling', value: tableRow.gamblingSitesAllowed },
              { label: 'Crypto Sites', value: tableRow.cryptocurrencySitesAllowed },
              { label: 'Bandwidth Overage', value: tableRow.bandwidthOveragePolicy },
              { label: 'Storage Overage', value: tableRow.storageOveragePolicy },
            ]}
          />

          {/* Business Features */}
          <SpecCard
            icon={<Users className="h-5 w-5" />}
            title="Business Features"
            specs={[
              { label: 'API Access', value: tableRow.apiAccess },
              { label: 'Reseller Hosting', value: tableRow.resellerHostingAvailable },
              { label: 'White Label', value: tableRow.whiteLabelAvailable },
              { label: 'Green Hosting', value: tableRow.greenHosting },
            ]}
          />

          {/* Suitability Scores */}
          <SpecCard
            icon={<Target className="h-5 w-5" />}
            title="Best For (Score)"
            specs={[
              { label: 'Beginners', value: tableRow.suitabilityBeginner ? `${tableRow.suitabilityBeginner}/5` : null },
              { label: 'Bloggers', value: tableRow.suitabilityBlogger ? `${tableRow.suitabilityBlogger}/5` : null },
              { label: 'Developers', value: tableRow.suitabilityDeveloper ? `${tableRow.suitabilityDeveloper}/5` : null },
              { label: 'eCommerce', value: tableRow.suitabilityEcommerce ? `${tableRow.suitabilityEcommerce}/5` : null },
              { label: 'Agencies', value: tableRow.suitabilityAgency ? `${tableRow.suitabilityAgency}/5` : null },
              { label: 'Enterprise', value: tableRow.suitabilityEnterprise ? `${tableRow.suitabilityEnterprise}/5` : null },
            ]}
          />

          {/* Company Info */}
          <SpecCard
            icon={<Users className="h-5 w-5" />}
            title="Company Info"
            specs={[
              { label: 'Founded', value: tableRow.yearFounded ? String(tableRow.yearFounded) : null },
              { label: 'Headquarters', value: tableRow.headquartersCountry },
              { label: 'Parent Company', value: tableRow.parentCompany?.split('(')[0].trim() || null },
              { label: 'Trustpilot', value: tableRow.trustpilotRating ? `${tableRow.trustpilotRating}/5 (${tableRow.trustpilotReviewsCount?.toLocaleString()} reviews)` : null },
            ]}
          />

          {/* Ratings Overview */}
          <SpecCard
            icon={<Target className="h-5 w-5" />}
            title="Our Ratings"
            specs={[
              { label: 'Overall', value: tableRow.overallRating ? `${tableRow.overallRating}/5` : null },
              { label: 'Value', value: tableRow.valueForMoney ? `${tableRow.valueForMoney}/5` : null },
              { label: 'Performance', value: tableRow.performanceRating ? `${tableRow.performanceRating}/5` : null },
              { label: 'Support', value: tableRow.supportQuality ? `${tableRow.supportQuality}/5` : null },
              { label: 'Security', value: tableRow.securityRating ? `${tableRow.securityRating}/5` : null },
              { label: 'Features', value: tableRow.featuresRating ? `${tableRow.featuresRating}/5` : null },
              { label: 'Ease of Use', value: tableRow.easeOfUse ? `${tableRow.easeOfUse}/5` : null },
              { label: 'Transparency', value: tableRow.transparencyRating ? `${tableRow.transparencyRating}/5` : null },
            ]}
          />

          {/* Managed WordPress */}
          <SpecCard
            icon={<Wifi className="h-5 w-5" />}
            title="Managed WordPress"
            specs={[
              { label: 'Available', value: tableRow.managedWordpressAvailable },
              { label: 'Pricing Model', value: tableRow.wpPricingModel },
              { label: 'Visit Limit', value: tableRow.monthlyVisitLimit === 'Unlimited' ? 'Unlimited' : tableRow.monthlyVisitLimit?.toLocaleString() },
              { label: 'Overage Cost', value: tableRow.visitOverageCost ? `$${tableRow.visitOverageCost}` : null },
              { label: 'PHP Workers', value: tableRow.phpWorkerLimit?.toString() ?? null },
              { label: 'Plugin Restrictions', value: tableRow.pluginRestrictions?.join(', ') || null },
              { label: 'Dev Environment', value: tableRow.devEnvironmentIncluded },
              { label: 'Dev Env Name', value: tableRow.devEnvironmentName },
            ]}
          />

          {/* Regional Targeting */}
          <SpecCard
            icon={<Globe className="h-5 w-5" />}
            title="Regional Info"
            specs={[
              { label: 'Best Countries', value: tableRow.bestForCountries?.join(', ') || null },
              { label: 'Currencies', value: tableRow.localCurrencyBilling?.join(', ') || null },
              { label: 'Support Languages', value: tableRow.localSupportLanguages?.join(', ') || null },
              { label: 'Data Sovereignty', value: tableRow.dataSovereigntyCompliance?.join(', ') || null },
            ]}
          />

          {/* External Ratings */}
          <SpecCard
            icon={<Target className="h-5 w-5" />}
            title="External Ratings"
            specs={[
              { label: 'Trustpilot', value: tableRow.trustpilotRating ? `${tableRow.trustpilotRating}/5` : null },
              { label: 'Reviews Count', value: tableRow.trustpilotReviewsCount?.toLocaleString() || null },
              { label: 'G2 Rating', value: tableRow.g2Rating ? `${tableRow.g2Rating}/5` : null },
              { label: 'BBB Rating', value: tableRow.betterBusinessBureauRating },
            ]}
          />

          {/* Advanced Technical */}
          <SpecCard
            icon={<Server className="h-5 w-5" />}
            title="Advanced Technical"
            specs={[
              { label: 'Inode Limit', value: tableRow.inodeLimit === 'Unlimited' ? 'Unlimited' : tableRow.inodeLimit?.toLocaleString() },
              { label: 'Max DB Size', value: tableRow.maxDatabaseSizeGb ? `${tableRow.maxDatabaseSizeGb} GB` : null },
              { label: 'Max Upload', value: tableRow.maxFileUploadSizeMb ? `${tableRow.maxFileUploadSizeMb} MB` : null },
              { label: 'DB Type', value: tableRow.databaseType },
              { label: 'Elasticsearch', value: tableRow.elasticsearchSupport },
              { label: 'Image Optimization', value: tableRow.imageOptimization },
              { label: 'PHP Switching', value: tableRow.phpVersionSwitching },
            ]}
          />

          {/* Access & Limits */}
          <SpecCard
            icon={<Settings className="h-5 w-5" />}
            title="Access & Limits"
            specs={[
              { label: 'Subdomains', value: tableRow.subdomainsLimit === 'Unlimited' ? 'Unlimited' : tableRow.subdomainsLimit?.toString() },
              { label: 'FTP Accounts', value: tableRow.ftpAccountsLimit === 'Unlimited' ? 'Unlimited' : tableRow.ftpAccountsLimit?.toString() },
              { label: 'SSH Tier', value: tableRow.sshAccessTierRequired },
              { label: 'Staging Tier', value: tableRow.stagingIncludedTier },
              { label: 'Instant Activation', value: tableRow.instantAccountActivation },
            ]}
          />

          {/* Additional Pricing */}
          <SpecCard
            icon={<DollarSign className="h-5 w-5" />}
            title="Additional Pricing"
            specs={[
              { label: 'Domain Duration', value: tableRow.freeDomainDurationMonths ? `${tableRow.freeDomainDurationMonths} months` : null },
              { label: 'Exclusions', value: tableRow.moneyBackExclusions },
              { label: 'Payment Methods', value: tableRow.acceptedPaymentMethods?.join(', ') || null },
              { label: 'Auto Renewal', value: tableRow.autoRenewalDefault },
              { label: 'Domain Privacy', value: tableRow.domainPrivacyIncluded },
              { label: 'Privacy Cost', value: tableRow.domainPrivacyCostYearly ? `$${tableRow.domainPrivacyCostYearly}/yr` : null },
              { label: 'SSL Provider', value: tableRow.sslProvider },
              { label: 'Dedicated IP Cost', value: tableRow.dedicatedIpCostMonthly ? `$${tableRow.dedicatedIpCostMonthly}/mo` : null },
            ]}
          />

          {/* Additional Support */}
          <SpecCard
            icon={<Headphones className="h-5 w-5" />}
            title="Support Details"
            specs={[
              { label: 'Phone Countries', value: tableRow.phoneSupportCountries?.join(', ') || null },
              { label: 'Priority Cost', value: tableRow.prioritySupportCost ? `$${tableRow.prioritySupportCost}` : null },
              { label: 'Community Forum', value: tableRow.communityForumActive },
              { label: 'Outsourced', value: tableRow.supportOutsourced },
              { label: 'Object Cache Type', value: tableRow.objectCacheType },
            ]}
          />

          {/* Business & Affiliate */}
          <SpecCard
            icon={<Users className="h-5 w-5" />}
            title="Affiliate Program"
            specs={[
              { label: 'Affiliate Available', value: tableRow.affiliateProgram },
              { label: 'Commission Type', value: tableRow.affiliateCommissionType },
              { label: 'Commission Amount', value: tableRow.affiliateCommissionAmount },
            ]}
          />

          {/* Additional Policies */}
          <SpecCard
            icon={<FileText className="h-5 w-5" />}
            title="Additional Policies"
            specs={[
              { label: 'File Hosting', value: tableRow.fileHostingAllowed },
              { label: 'Proxy/VPN', value: tableRow.proxyVpnAllowed },
              { label: 'BW Overage Cost', value: tableRow.bandwidthOverageCost ? `$${tableRow.bandwidthOverageCost}` : null },
              { label: 'Suspension Policy', value: tableRow.accountSuspensionPolicy },
              { label: 'Malware Removal Cost', value: tableRow.malwareRemovalCost ? `$${tableRow.malwareRemovalCost}` : null },
              { label: 'Downloadable Backups', value: tableRow.downloadableBackups },
            ]}
          />

          {/* Additional Platforms */}
          <SpecCard
            icon={<Globe className="h-5 w-5" />}
            title="Additional Platforms"
            specs={[
              { label: 'PrestaShop', value: tableRow.prestashopSupport },
              { label: 'Ghost', value: tableRow.ghostSupport },
              { label: 'Shopify Migration', value: tableRow.shopifyMigration },
              { label: 'Wix Migration', value: tableRow.wixMigration },
              { label: 'Squarespace Migration', value: tableRow.squarespaceMigration },
              { label: 'Webflow Export', value: tableRow.webflowExport },
            ]}
          />

          {/* Editorial Info */}
          <SpecCard
            icon={<FileText className="h-5 w-5" />}
            title="Editorial Notes"
            specs={[
              { label: 'Best For', value: tableRow.bestFor },
              { label: 'Avoid If', value: tableRow.avoidIf },
              { label: 'Known Issues', value: tableRow.knownIssues },
              { label: 'USP', value: tableRow.uniqueSellingPoint },
              { label: 'Ideal Customer', value: tableRow.idealCustomerProfile },
            ]}
          />

          {/* Competitors */}
          <SpecCard
            icon={<Target className="h-5 w-5" />}
            title="Competition"
            specs={[
              { label: 'Competitors', value: tableRow.primaryCompetitors?.join(', ') || null },
              { label: 'Best Alternative To', value: tableRow.bestAlternativeTo },
            ]}
          />
        </div>
      </Container>
    </section>
  );
}

// Count non-null specs
function getSpecCount(tableRow: CompanyTableRow): number {
  return Object.values(tableRow).filter((v) => v !== null && v !== undefined).length;
}

interface SpecCardProps {
  icon: React.ReactNode;
  title: string;
  specs: Array<{
    label: string;
    value: string | boolean | null | undefined;
  }>;
}

function SpecCard({ icon, title, specs }: SpecCardProps) {
  // Filter out null/undefined values for cleaner display
  const validSpecs = specs.filter((s) => s.value !== null && s.value !== undefined);

  if (validSpecs.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="text-accent">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2">
          {validSpecs.map((spec) => (
            <div key={spec.label} className="flex items-start justify-between gap-4">
              <dt className="text-sm text-text-secondary shrink-0">{spec.label}</dt>
              <dd className="text-sm font-medium text-right">
                {typeof spec.value === 'boolean' ? (
                  spec.value ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-text-muted" />
                  )
                ) : (
                  <span className="text-foreground">{spec.value}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function formatStorage(gb: NumberOrUnlimited | null, type: string | null): string {
  if (gb === null) return 'Not specified';
  if (gb === 'Unlimited') return `Unlimited ${type || 'SSD'}`;
  return `${gb} GB ${type || 'SSD'}`;
}

function formatBandwidth(gb: NumberOrUnlimited | null): string {
  if (gb === null) return 'Not specified';
  if (gb === 'Unlimited') return 'Unmetered';
  return `${gb} GB`;
}

function formatNumber(val: NumberOrUnlimited | null): string {
  if (val === null) return 'Not specified';
  if (val === 'Unlimited') return 'Unlimited';
  return String(val);
}

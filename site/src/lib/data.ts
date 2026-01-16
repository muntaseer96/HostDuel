import { promises as fs } from 'fs';
import path from 'path';
import type {
  Company,
  CompanyIndex,
  CompanyTableRow,
  HostingType,
  FilterState,
  SortState,
  NumberOrUnlimited,
} from '@/types';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

// Cache for company data
let companyCache: Map<string, Company> | null = null;
let indexCache: CompanyIndex | null = null;

/**
 * Get the company index
 */
export async function getCompanyIndex(): Promise<CompanyIndex> {
  if (indexCache) return indexCache;

  const indexPath = path.join(DATA_DIR, 'index.json');
  const data = await fs.readFile(indexPath, 'utf-8');
  indexCache = JSON.parse(data);
  return indexCache!;
}

/**
 * Get a single company by ID
 */
export async function getCompanyById(id: string): Promise<Company | null> {
  try {
    const filePath = path.join(DATA_DIR, 'companies', `${id}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Get all companies (with caching)
 */
export async function getAllCompanies(): Promise<Map<string, Company>> {
  if (companyCache) return companyCache;

  const index = await getCompanyIndex();
  const companies = new Map<string, Company>();

  await Promise.all(
    index.companies.map(async (entry) => {
      const company = await getCompanyById(entry.id);
      if (company) {
        companies.set(entry.id, company);
      }
    })
  );

  companyCache = companies;
  return companies;
}

/**
 * Get all company IDs
 */
export async function getAllCompanyIds(): Promise<string[]> {
  const index = await getCompanyIndex();
  return index.companies.map((c) => c.id);
}

/**
 * Get companies by hosting type
 */
export async function getCompaniesByType(type: HostingType): Promise<Company[]> {
  const companies = await getAllCompanies();
  return Array.from(companies.values()).filter(
    (company) => company.basicInfo.hostingType === type
  );
}

/**
 * Convert a Company to a simplified table row
 */
export function companyToTableRow(id: string, company: Company): CompanyTableRow {
  return {
    id,
    name: company.basicInfo.companyName,
    hostingType: company.basicInfo.hostingType,
    websiteUrl: company.basicInfo.websiteUrl || null,

    // === ESSENTIAL ===
    monthlyPrice: company.pricing.sharedHostingMonthlyPromo ?? company.pricing.vpsMonthlyLowest ?? company.pricing.wordpressHostingMonthlyPromo,
    renewalPrice: company.pricing.sharedHostingMonthlyRenewal ?? company.pricing.vpsMonthlyRenewal ?? company.pricing.wordpressHostingMonthlyRenewal,
    overallRating: company.ratings.overallRating,
    uptimeGuarantee: company.serverPerformance.uptimeGuaranteePercent,
    freeSsl: company.securitySsl.freeSsl,
    freeDomain: company.pricing.freeDomainIncluded,
    freeMigration: company.migration.freeMigration,
    trustpilotRating: company.reputation.trustpilotRating,
    trustpilotReviewsCount: company.reputation.trustpilotReviewsCount,

    // === TECHNICAL ===
    storageGb: company.technicalSpecs.storageGb,
    storageType: company.technicalSpecs.storageType,
    bandwidthGb: company.technicalSpecs.bandwidthGb,
    phpVersions: company.technicalSpecs.phpVersionsAvailable,
    sshAccess: company.technicalSpecs.sshAccess,
    gitDeployment: company.technicalSpecs.gitDeployment,
    stagingEnvironment: company.technicalSpecs.stagingEnvironment,
    nodejsSupport: company.technicalSpecs.nodejsSupport,
    pythonSupport: company.technicalSpecs.pythonSupport,
    rubySupport: company.technicalSpecs.rubySupport,
    maxWebsites: company.technicalSpecs.maxWebsitesAllowed,
    maxDatabases: company.technicalSpecs.maxDatabases,
    cronJobs: company.technicalSpecs.cronJobsAllowed,
    redisAvailable: company.technicalSpecs.redisAvailable,

    // === WORDPRESS ===
    wordpressOptimized: company.wordpressFeatures.wordpressOptimized,
    wordpressAutoInstall: company.wordpressFeatures.wordpressAutoInstall,
    wordpressAutoUpdates: company.wordpressFeatures.wordpressAutoUpdates,
    wordpressStaging: company.wordpressFeatures.wordpressStaging,
    woocommerceOptimized: company.wordpressFeatures.woocommerceOptimized,
    litespeedCache: company.wordpressFeatures.litespeedCache,
    objectCaching: company.wordpressFeatures.objectCaching,
    wpMultisite: company.wordpressFeatures.wpMultisiteSupport,
    wpCliAccess: company.technicalSpecs.wpCliAccess,

    // === SECURITY ===
    ddosProtection: company.serverPerformance.ddosProtection,
    ddosProtectionLevel: company.serverPerformance.ddosProtectionLevel,
    malwareScanning: company.serverPerformance.malwareScanning,
    malwareRemoval: company.serverPerformance.malwareRemoval,
    firewallIncluded: company.serverPerformance.firewallIncluded,
    backupFrequency: company.securitySsl.backupFrequency,
    backupRetentionDays: company.securitySsl.backupRetentionDays,
    backupRestoreFee: company.securitySsl.backupRestoreFee,
    onDemandBackup: company.securitySsl.onDemandBackup,
    twoFactorAuth: company.securitySsl.twoFactorAuthentication,
    wildcardSsl: company.securitySsl.wildcardSslAvailable,
    dedicatedIpAvailable: company.securitySsl.dedicatedIpAvailable,

    // === SUPPORT ===
    supportChannels: company.support.supportChannels,
    liveChatAvailable: company.support.liveChatAvailable,
    liveChatHours: company.support.liveChatHours,
    phoneSupportAvailable: company.support.phoneSupportAvailable,
    phoneSupportHours: company.support.phoneSupportHours,
    ticketSupport: company.support.ticketSupport,
    prioritySupport: company.support.prioritySupportAvailable,
    supportLanguages: company.support.supportLanguageOptions,
    knowledgeBaseQuality: company.support.knowledgeBaseQuality,
    avgSupportWaitMinutes: company.support.averageSupportWaitMinutes,

    // === PRICING (detailed) ===
    renewalMarkupPercent: company.pricingCalculated.renewalMarkupPercent,
    firstYearCost: company.pricingCalculated.totalFirstYearCost,
    secondYearCost: company.pricingCalculated.totalSecondYearCost,
    moneyBackDays: company.pricing.moneyBackGuaranteeDays,
    setupFee: company.pricing.setupFee,
    monthlyBillingAvailable: company.pricing.monthlyBillingAvailable,
    minimumContractMonths: company.pricing.minimumContractMonths,

    // === EMAIL ===
    emailAccountsIncluded: company.email.emailAccountsIncluded,
    emailAccountLimit: company.email.emailAccountLimit,
    mailboxSizeGb: company.email.individualMailboxSizeGb,
    webmailAccess: company.email.webmailAccess,
    spamFilter: company.email.spamFilter,
    emailForwarding: company.email.emailForwarding,

    // === COMPLIANCE ===
    gdprCompliance: company.compliance.gdprComplianceTools,
    pciCompliance: company.compliance.pciCompliance,
    hipaaCompliance: company.compliance.hipaaCompliance,
    dataCenterCerts: company.compliance.dataCenterCertifications,

    // === PLATFORM SUPPORT ===
    drupalSupport: company.platformSupport.drupalSupport,
    joomlaSupport: company.platformSupport.joomlaSupport,
    magentoSupport: company.platformSupport.magentoSupport,
    laravelSupport: company.platformSupport.laravelSupport,
    djangoSupport: company.platformSupport.djangoSupport,
    nextjsSupport: company.platformSupport.nextjsSupport,
    railsSupport: company.platformSupport.railsSupport,
    staticSiteSupport: company.additionalPlatforms.staticSiteSupport,

    // === PERFORMANCE ===
    cdnIncluded: company.serverPerformance.cdnIncluded,
    cdnProvider: company.serverPerformance.cdnProvider,
    serverLocations: company.serverPerformance.serverLocations,
    serverLocationCount: company.serverPerformance.serverLocationOptionsCount,
    chooseServerLocation: company.serverPerformance.chooseServerLocation,
    http2Support: company.serverPerformance.http2Support,
    brotliCompression: company.serverPerformance.brotliCompression,
    uptimeSlaCredit: company.serverPerformance.uptimeSlaCredit,

    // === RATINGS (all 8 dimensions) ===
    valueForMoney: company.ratings.valueForMoney,
    performanceRating: company.ratings.performance,
    supportQuality: company.ratings.supportQuality,
    securityRating: company.ratings.security,
    featuresRating: company.ratings.features,
    easeOfUse: company.ratings.easeOfUse,
    transparencyRating: company.ratings.transparency,

    // === SUITABILITY (use case scores) ===
    suitabilityBlogger: company.useCases.suitabilityBlogger,
    suitabilityEcommerce: company.useCases.suitabilityEcommerce,
    suitabilityAgency: company.useCases.suitabilityAgency,
    suitabilityDeveloper: company.useCases.suitabilityDeveloper,
    suitabilityBeginner: company.useCases.suitabilityBeginner,
    suitabilityEnterprise: company.useCases.suitabilityEnterprise,

    // === MIGRATION ===
    migrationWebsitesLimit: company.migration.migrationWebsitesLimit,
    migrationTurnaroundDays: company.migration.migrationTurnaroundDays,
    paidMigrationCost: company.migration.paidMigrationCost,
    migrationQuality: company.migration.migrationServiceQuality,

    // === CONTROL PANEL ===
    cpanelIncluded: company.controlPanel.cpanelIncluded,
    controlPanelName: company.controlPanel.controlPanelName,
    softaculous: company.controlPanel.softaculousAutoInstaller,
    websiteBuilderIncluded: company.controlPanel.websiteBuilderIncluded,
    websiteBuilderName: company.controlPanel.websiteBuilderName,

    // === POLICIES ===
    bandwidthOveragePolicy: company.policiesOverages.bandwidthOveragePolicy,
    storageOveragePolicy: company.policiesOverages.storageOveragePolicy,
    adultContentAllowed: company.contentRestrictions.adultContentAllowed,
    gamblingSitesAllowed: company.contentRestrictions.gamblingSitesAllowed,
    cryptocurrencySitesAllowed: company.contentRestrictions.cryptocurrencySitesAllowed,
    resellerHostingAvailable: company.contentRestrictions.resellerHostingAvailable,
    whiteLabelAvailable: company.contentRestrictions.whiteLabelAvailable,
    apiAccess: company.business.apiAccess,

    // === BASIC INFO ===
    yearFounded: company.basicInfo.yearFounded,
    headquartersCountry: company.basicInfo.headquartersCountry,
    parentCompany: company.basicInfo.parentCompany,
    greenHosting: company.basicInfo.greenHosting,
    instantAccountActivation: company.basicInfo.instantAccountActivation,

    // === ADDITIONAL PRICING ===
    freeDomainDurationMonths: company.pricing.freeDomainDurationMonths,
    moneyBackExclusions: company.pricing.moneyBackExclusions,
    acceptedPaymentMethods: company.pricing.acceptedPaymentMethods,
    autoRenewalDefault: company.pricing.autoRenewalDefault,
    domainPrivacyIncluded: company.pricing.domainPrivacyIncluded,
    domainPrivacyCostYearly: company.pricing.domainPrivacyCostYearly,

    // === ADDITIONAL TECHNICAL ===
    inodeLimit: company.technicalSpecs.inodeLimit,
    maxDatabaseSizeGb: company.technicalSpecs.maxDatabaseSizeGb,
    maxFileUploadSizeMb: company.technicalSpecs.maxFileUploadSizeMb,
    phpVersionSwitching: company.technicalSpecs.phpVersionSwitching,
    sshAccessTierRequired: company.technicalSpecs.sshAccessTierRequired,
    stagingIncludedTier: company.technicalSpecs.stagingIncludedTier,
    subdomainsLimit: company.technicalSpecs.subdomainsLimit,
    ftpAccountsLimit: company.technicalSpecs.ftpAccountsLimit,
    databaseType: company.technicalSpecs.databaseType,
    elasticsearchSupport: company.technicalSpecs.elasticsearchSupport,
    imageOptimization: company.technicalSpecs.imageOptimization,

    // === ADDITIONAL SECURITY ===
    sslProvider: company.securitySsl.sslProvider,
    dedicatedIpCostMonthly: company.securitySsl.dedicatedIpCostMonthly,
    malwareRemovalCost: company.serverPerformance.malwareRemovalCost,
    downloadableBackups: company.securitySsl.downloadableBackups,

    // === ADDITIONAL SUPPORT ===
    phoneSupportCountries: company.support.phoneSupportCountries,
    prioritySupportCost: company.support.prioritySupportCost,
    communityForumActive: company.support.communityForumActive,
    supportOutsourced: company.support.supportOutsourced,

    // === ADDITIONAL WORDPRESS ===
    objectCacheType: company.wordpressFeatures.objectCacheType,
    managedWordpressAvailable: company.wordpressFeatures.managedWordpressAvailable,

    // === MANAGED WORDPRESS ===
    wpPricingModel: company.managedWordPress?.pricingModel ?? null,
    monthlyVisitLimit: company.managedWordPress?.monthlyVisitLimit ?? null,
    visitOverageCost: company.managedWordPress?.visitOverageCost ?? null,
    phpWorkerLimit: company.managedWordPress?.phpWorkerLimit ?? null,
    pluginRestrictions: company.managedWordPress?.pluginRestrictions ?? null,
    devEnvironmentIncluded: company.managedWordPress?.devEnvironmentIncluded ?? null,
    devEnvironmentName: company.managedWordPress?.devEnvironmentName ?? null,

    // === ADDITIONAL POLICIES ===
    bandwidthOverageCost: company.policiesOverages?.bandwidthOverageCost ?? null,
    accountSuspensionPolicy: company.policiesOverages?.accountSuspensionPolicy ?? null,
    resourceAbuseDefinition: company.policiesOverages?.resourceAbuseDefinition ?? null,
    fileHostingAllowed: company.contentRestrictions?.fileHostingAllowed ?? null,
    proxyVpnAllowed: company.contentRestrictions?.proxyVpnAllowed ?? null,

    // === BUSINESS & AFFILIATE ===
    affiliateProgram: company.business?.affiliateProgram ?? null,
    affiliateCommissionType: company.business?.affiliateCommissionType ?? null,
    affiliateCommissionAmount: company.business?.affiliateCommissionAmount ?? null,

    // === EXTERNAL RATINGS ===
    g2Rating: company.reputation?.g2Rating ?? null,
    betterBusinessBureauRating: company.reputation?.betterBusinessBureauRating ?? null,

    // === EDITORIAL ===
    knownIssues: company.editorial?.knownIssues ?? null,
    bestFor: company.editorial?.bestFor ?? null,
    avoidIf: company.editorial?.avoidIf ?? null,
    competitorComparisonNotes: company.editorial?.competitorComparisonNotes ?? null,

    // === COMPARISON DATA ===
    uniqueSellingPoint: company.comparisonData?.uniqueSellingPoint ?? null,
    primaryCompetitors: company.comparisonData?.primaryCompetitors ?? null,
    bestAlternativeTo: company.comparisonData?.bestAlternativeTo ?? null,
    idealCustomerProfile: company.comparisonData?.idealCustomerProfile ?? null,

    // === REGIONAL TARGETING ===
    bestForCountries: company.regionalTargeting?.bestForCountries ?? null,
    localCurrencyBilling: company.regionalTargeting?.localCurrencyBilling ?? null,
    localSupportLanguages: company.regionalTargeting?.localSupportLanguages ?? null,
    dataSovereigntyCompliance: company.regionalTargeting?.dataSovereigntyCompliance ?? null,

    // === ADDITIONAL PLATFORMS ===
    prestashopSupport: company.platformSupport?.prestashopSupport ?? null,
    ghostSupport: company.additionalPlatforms?.ghostSupport ?? null,
    shopifyMigration: company.additionalPlatforms?.shopifyMigration ?? null,
    wixMigration: company.additionalPlatforms?.wixMigration ?? null,
    squarespaceMigration: company.additionalPlatforms?.squarespaceMigration ?? null,
    webflowExport: company.additionalPlatforms?.webflowExport ?? null,
  };
}

/**
 * Get all companies as table rows
 */
export async function getAllTableRows(): Promise<CompanyTableRow[]> {
  const companies = await getAllCompanies();
  return Array.from(companies.entries()).map(([id, company]) =>
    companyToTableRow(id, company)
  );
}

/**
 * Filter companies based on filter state
 */
export function filterCompanies(
  companies: CompanyTableRow[],
  filters: FilterState
): CompanyTableRow[] {
  return companies.filter((company) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!company.name.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Hosting type filter
    if (filters.hostingTypes.length > 0) {
      if (!company.hostingType || !filters.hostingTypes.includes(company.hostingType)) {
        return false;
      }
    }

    // Price range filter
    if (company.monthlyPrice !== null) {
      if (
        company.monthlyPrice < filters.priceRange[0] ||
        company.monthlyPrice > filters.priceRange[1]
      ) {
        return false;
      }
    }

    // Min rating filter
    if (filters.minRating > 0 && company.overallRating !== null) {
      if (company.overallRating < filters.minRating) {
        return false;
      }
    }

    // Feature filters
    if (filters.features.freeSsl && !company.freeSsl) return false;
    if (filters.features.freeDomain && !company.freeDomain) return false;
    if (filters.features.freeMigration && !company.freeMigration) return false;

    return true;
  });
}

/**
 * Sort companies
 */
export function sortCompanies(
  companies: CompanyTableRow[],
  sort: SortState
): CompanyTableRow[] {
  return [...companies].sort((a, b) => {
    let aVal: string | number | null = null;
    let bVal: string | number | null = null;

    switch (sort.field) {
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case 'monthlyPrice':
        aVal = a.monthlyPrice;
        bVal = b.monthlyPrice;
        break;
      case 'renewalPrice':
        aVal = a.renewalPrice;
        bVal = b.renewalPrice;
        break;
      case 'overallRating':
        aVal = a.overallRating;
        bVal = b.overallRating;
        break;
      case 'uptimeGuarantee':
        aVal = a.uptimeGuarantee;
        bVal = b.uptimeGuarantee;
        break;
      case 'trustpilotRating':
        aVal = a.trustpilotRating;
        bVal = b.trustpilotRating;
        break;
    }

    // Handle null values
    if (aVal === null && bVal === null) return 0;
    if (aVal === null) return 1;
    if (bVal === null) return -1;

    // Compare
    if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Format storage/bandwidth values
 */
export function formatStorageValue(value: NumberOrUnlimited | null): string {
  if (value === null) return 'N/A';
  if (value === 'Unlimited') return 'Unlimited';
  return `${value} GB`;
}

/**
 * Get price display with renewal info
 */
export function getPriceDisplay(
  promo: number | null,
  renewal: number | null
): { price: string; renewal: string | null; hasMarkup: boolean } {
  if (promo === null) {
    return { price: 'N/A', renewal: null, hasMarkup: false };
  }

  const price = `$${promo.toFixed(2)}/mo`;

  if (renewal === null || renewal === promo) {
    return { price, renewal: null, hasMarkup: false };
  }

  return {
    price,
    renewal: `$${renewal.toFixed(2)}/mo`,
    hasMarkup: renewal > promo,
  };
}

/**
 * Get a single company as TableRow by ID
 */
export async function getTableRowById(id: string): Promise<CompanyTableRow | null> {
  const company = await getCompanyById(id);
  if (!company) return null;
  return companyToTableRow(id, company);
}

/**
 * Get hosting types with counts
 */
export async function getHostingTypeCounts(): Promise<Record<HostingType, number>> {
  const companies = await getAllCompanies();
  const counts: Record<string, number> = {};

  for (const company of companies.values()) {
    const type = company.basicInfo.hostingType;
    if (type) {
      counts[type] = (counts[type] || 0) + 1;
    }
  }

  return counts as Record<HostingType, number>;
}

/**
 * Get top rated companies by use case
 */
export async function getTopByUseCase(
  useCase: 'blogger' | 'ecommerce' | 'agency' | 'developer' | 'beginner' | 'enterprise',
  limit: number = 5
): Promise<Array<{ id: string; company: Company; score: number }>> {
  const companies = await getAllCompanies();
  const fieldMap = {
    blogger: 'suitabilityBlogger',
    ecommerce: 'suitabilityEcommerce',
    agency: 'suitabilityAgency',
    developer: 'suitabilityDeveloper',
    beginner: 'suitabilityBeginner',
    enterprise: 'suitabilityEnterprise',
  } as const;

  const field = fieldMap[useCase];
  const scored = Array.from(companies.entries())
    .map(([id, company]) => ({
      id,
      company,
      score: company.useCases[field] ?? 0,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

/**
 * Search companies by text
 */
export async function searchCompanies(query: string): Promise<CompanyTableRow[]> {
  const rows = await getAllTableRows();
  const queryLower = query.toLowerCase();

  return rows.filter((row) => {
    return (
      row.name.toLowerCase().includes(queryLower) ||
      row.hostingType?.toLowerCase().includes(queryLower)
    );
  });
}

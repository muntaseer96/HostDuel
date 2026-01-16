// Hosting Types
export type HostingType =
  | 'shared'
  | 'managed-wordpress'
  | 'vps'
  | 'cloud-iaas'
  | 'dedicated'
  | 'website-builder'
  | 'ecommerce-platform'
  | 'jamstack'
  | 'paas'
  | 'domain-registrar'
  | 'cdn-security';

export type StorageType = 'SSD' | 'NVMe' | 'HDD';
export type PricingModel = 'visits' | 'bandwidth' | 'sites' | 'no-caps';

// Utility type for values that can be a number or "Unlimited"
export type NumberOrUnlimited = number | 'Unlimited';

// Basic Info
export interface BasicInfo {
  companyName: string;
  websiteUrl: string;
  yearFounded: number | null;
  headquartersCountry: string | null;
  parentCompany: string | null;
  dataLastUpdated: string;
  notes: string | null;
  greenHosting: boolean | null;
  instantAccountActivation: boolean | null;
  hostingType: HostingType | null;
}

// Pricing
export interface Pricing {
  sharedHostingMonthlyPromo: number | null;
  sharedHostingMonthlyRenewal: number | null;
  vpsMonthlyLowest: number | null;
  vpsMonthlyRenewal: number | null;
  dedicatedMonthlyLowest: number | null;
  dedicatedMonthlyRenewal: number | null;
  wordpressHostingMonthlyPromo: number | null;
  wordpressHostingMonthlyRenewal: number | null;
  cloudHostingMonthlyLowest: number | null;
  freeDomainIncluded: boolean | null;
  freeDomainDurationMonths: number | null;
  domainTransferLockPeriodDays: number | null;
  setupFee: number | null;
  moneyBackGuaranteeDays: number | null;
  moneyBackExclusions: string | null;
  acceptedPaymentMethods: string[] | null;
  autoRenewalDefault: boolean | null;
  minimumContractMonths: number | null;
  monthlyBillingAvailable: boolean | null;
  domainPrivacyIncluded: boolean | null;
  domainPrivacyCostYearly: number | null;
}

// Technical Specs
export interface TechnicalSpecs {
  storageGb: NumberOrUnlimited | null;
  storageType: StorageType | null;
  bandwidthGb: NumberOrUnlimited | null;
  inodeLimit: NumberOrUnlimited | null;
  maxWebsitesAllowed: NumberOrUnlimited | null;
  maxDatabases: NumberOrUnlimited | null;
  maxDatabaseSizeGb: number | null;
  maxFileUploadSizeMb: number | null;
  phpVersionsAvailable: string[] | null;
  phpVersionSwitching: boolean | null;
  nodejsSupport: boolean | null;
  pythonSupport: boolean | null;
  rubySupport: boolean | null;
  sshAccess: boolean | null;
  sshAccessTierRequired: string | null;
  gitDeployment: boolean | null;
  wpCliAccess: boolean | null;
  cronJobsAllowed: boolean | null;
  stagingEnvironment: boolean | null;
  stagingIncludedTier: string | null;
  subdomainsLimit: NumberOrUnlimited | null;
  ftpAccountsLimit: NumberOrUnlimited | null;
  databaseType: string | null;
  redisAvailable: boolean | null;
  elasticsearchSupport: boolean | null;
  imageOptimization: boolean | null;
}

// Server Performance
export interface ServerPerformance {
  serverLocations: string[] | null;
  serverLocationOptionsCount: number | null;
  chooseServerLocation: boolean | null;
  cdnIncluded: boolean | null;
  cdnProvider: string | null;
  uptimeGuaranteePercent: number | null;
  uptimeSlaCredit: boolean | null;
  ddosProtection: boolean | null;
  ddosProtectionLevel: string | null;
  firewallIncluded: boolean | null;
  malwareScanning: boolean | null;
  malwareRemoval: boolean | null;
  malwareRemovalCost: number | null;
  http2Support: boolean | null;
  brotliCompression: boolean | null;
}

// Security & SSL
export interface SecuritySsl {
  freeSsl: boolean | null;
  sslProvider: string | null;
  wildcardSslAvailable: boolean | null;
  dedicatedIpAvailable: boolean | null;
  dedicatedIpCostMonthly: number | null;
  twoFactorAuthentication: boolean | null;
  backupFrequency: string | null;
  backupRetentionDays: number | null;
  backupRestoreFee: number | null;
  onDemandBackup: boolean | null;
  downloadableBackups: boolean | null;
}

// Compliance
export interface Compliance {
  gdprComplianceTools: boolean | null;
  pciCompliance: boolean | null;
  hipaaCompliance: boolean | null;
  dataCenterCertifications: string[] | null;
}

// Support
export interface Support {
  supportChannels: string[] | null;
  liveChatAvailable: boolean | null;
  liveChatHours: string | null;
  phoneSupportAvailable: boolean | null;
  phoneSupportCountries: string[] | null;
  phoneSupportHours: string | null;
  ticketSupport: boolean | null;
  prioritySupportAvailable: boolean | null;
  prioritySupportCost: number | null;
  supportLanguageOptions: string[] | null;
  knowledgeBaseQuality: number | null;
  communityForumActive: boolean | null;
  averageSupportWaitMinutes: number | null;
  supportOutsourced: boolean | null;
}

// WordPress Features
export interface WordpressFeatures {
  wordpressOptimized: boolean | null;
  wordpressAutoInstall: boolean | null;
  wordpressAutoUpdates: boolean | null;
  wordpressStaging: boolean | null;
  woocommerceOptimized: boolean | null;
  litespeedCache: boolean | null;
  objectCaching: boolean | null;
  objectCacheType: string | null;
  managedWordpressAvailable: boolean | null;
  wpMultisiteSupport: boolean | null;
}

// Managed WordPress
export interface ManagedWordPress {
  pricingModel: PricingModel | null;
  monthlyVisitLimit: NumberOrUnlimited | null;
  visitOverageCost: number | null;
  phpWorkerLimit: number | null;
  pluginRestrictions: string[] | null;
  devEnvironmentIncluded: boolean | null;
  devEnvironmentName: string | null;
}

// Migration
export interface Migration {
  freeMigration: boolean | null;
  migrationWebsitesLimit: number | null;
  migrationServiceQuality: number | null;
  migrationTurnaroundDays: number | null;
  paidMigrationCost: number | null;
}

// Control Panel
export interface ControlPanel {
  cpanelIncluded: boolean | null;
  cpanelAlternative: string | null;
  controlPanelName: string | null;
  softaculousAutoInstaller: boolean | null;
  websiteBuilderIncluded: boolean | null;
  websiteBuilderName: string | null;
}

// Email
export interface Email {
  emailAccountsIncluded: boolean | null;
  emailAccountLimit: NumberOrUnlimited | null;
  individualMailboxSizeGb: number | null;
  webmailAccess: boolean | null;
  spamFilter: boolean | null;
  emailForwarding: boolean | null;
}

// Policies & Overages
export interface PoliciesOverages {
  bandwidthOveragePolicy: string | null;
  bandwidthOverageCost: number | null;
  storageOveragePolicy: string | null;
  accountSuspensionPolicy: string | null;
  resourceAbuseDefinition: string | null;
  hiddenFeesNotes: string | null;
}

// Content Restrictions
export interface ContentRestrictions {
  adultContentAllowed: boolean | null;
  gamblingSitesAllowed: boolean | null;
  cryptocurrencySitesAllowed: boolean | null;
  fileHostingAllowed: boolean | null;
  proxyVpnAllowed: boolean | null;
  resellerHostingAvailable: boolean | null;
  whiteLabelAvailable: boolean | null;
}

// Business
export interface Business {
  apiAccess: boolean | null;
  affiliateProgram: boolean | null;
  affiliateCommissionType: string | null;
  affiliateCommissionAmount: string | null;
}

// Reputation
export interface Reputation {
  trustpilotRating: number | null;
  trustpilotReviewsCount: number | null;
  g2Rating: number | null;
  betterBusinessBureauRating: string | null;
}

// Editorial
export interface Editorial {
  knownIssues: string | null;
  bestFor: string | null;
  avoidIf: string | null;
  competitorComparisonNotes: string | null;
}

// Ratings
export interface Ratings {
  valueForMoney: number | null;
  performance: number | null;
  supportQuality: number | null;
  security: number | null;
  features: number | null;
  easeOfUse: number | null;
  transparency: number | null;
  overallRating: number | null;
}

// Use Cases
export interface UseCases {
  suitabilityBlogger: number | null;
  suitabilityEcommerce: number | null;
  suitabilityAgency: number | null;
  suitabilityDeveloper: number | null;
  suitabilityBeginner: number | null;
  suitabilityEnterprise: number | null;
}

// Platform Support
export interface PlatformSupport {
  drupalSupport: boolean | null;
  joomlaSupport: boolean | null;
  magentoSupport: boolean | null;
  prestashopSupport: boolean | null;
  laravelSupport: boolean | null;
  djangoSupport: boolean | null;
  nextjsSupport: boolean | null;
  railsSupport: boolean | null;
}

// Pricing Calculated
export interface PricingCalculated {
  totalFirstYearCost: number | null;
  totalSecondYearCost: number | null;
  renewalMarkupPercent: number | null;
  effectiveMonthlyAverage: number | null;
}

// Comparison Data
export interface ComparisonData {
  uniqueSellingPoint: string | null;
  primaryCompetitors: string[] | null;
  bestAlternativeTo: string | null;
  idealCustomerProfile: string | null;
}

// Regional Targeting
export interface RegionalTargeting {
  bestForCountries: string[] | null;
  localCurrencyBilling: string[] | null;
  localSupportLanguages: string[] | null;
  dataSovereigntyCompliance: string[] | null;
  regionalWebsites: string[] | null;
}

// FAQ Content
export interface FaqContent {
  faqIsThisHostGood: string | null;
  faqWhoOwnsThisHost: string | null;
  faqHowMuchDoesItCost: string | null;
  faqIsItBeginnerFriendly: string | null;
  faqDoesItIncludeEmail: string | null;
  faqCanIHostWordPress: string | null;
  faqWhatsTheUptime: string | null;
  faqCanICancelAnytime: string | null;
}

// Additional Platforms
export interface AdditionalPlatforms {
  ghostSupport: boolean | null;
  shopifyMigration: boolean | null;
  wixMigration: boolean | null;
  squarespaceMigration: boolean | null;
  webflowExport: boolean | null;
  staticSiteSupport: boolean | null;
}

// Complete Company Data
export interface Company {
  basicInfo: BasicInfo;
  pricing: Pricing;
  technicalSpecs: TechnicalSpecs;
  serverPerformance: ServerPerformance;
  securitySsl: SecuritySsl;
  compliance: Compliance;
  support: Support;
  wordpressFeatures: WordpressFeatures;
  managedWordPress: ManagedWordPress;
  migration: Migration;
  controlPanel: ControlPanel;
  email: Email;
  policiesOverages: PoliciesOverages;
  contentRestrictions: ContentRestrictions;
  business: Business;
  reputation: Reputation;
  editorial: Editorial;
  ratings: Ratings;
  useCases: UseCases;
  platformSupport: PlatformSupport;
  pricingCalculated: PricingCalculated;
  comparisonData: ComparisonData;
  regionalTargeting: RegionalTargeting;
  faqContent: FaqContent;
  additionalPlatforms: AdditionalPlatforms;
}

// Company Index Entry
export interface CompanyIndexEntry {
  id: string;
  name: string;
  status: 'complete' | 'in-progress' | 'pending';
  lastUpdated: string;
}

// Company Index
export interface CompanyIndex {
  companies: CompanyIndexEntry[];
  totalCompanies: number;
  lastFullUpdate: string;
}

// Simplified Company for Table Display
export interface CompanyTableRow {
  id: string;
  name: string;
  hostingType: HostingType | null;
  websiteUrl: string | null;

  // === ESSENTIAL ===
  monthlyPrice: number | null;
  renewalPrice: number | null;
  overallRating: number | null;
  uptimeGuarantee: number | null;
  freeSsl: boolean | null;
  freeDomain: boolean | null;
  freeMigration: boolean | null;
  trustpilotRating: number | null;
  trustpilotReviewsCount: number | null;

  // === TECHNICAL ===
  storageGb: NumberOrUnlimited | null;
  storageType: StorageType | null;
  bandwidthGb: NumberOrUnlimited | null;
  phpVersions: string[] | null;
  sshAccess: boolean | null;
  gitDeployment: boolean | null;
  stagingEnvironment: boolean | null;
  nodejsSupport: boolean | null;
  pythonSupport: boolean | null;
  rubySupport: boolean | null;
  maxWebsites: NumberOrUnlimited | null;
  maxDatabases: NumberOrUnlimited | null;
  cronJobs: boolean | null;
  redisAvailable: boolean | null;

  // === WORDPRESS ===
  wordpressOptimized: boolean | null;
  wordpressAutoInstall: boolean | null;
  wordpressAutoUpdates: boolean | null;
  wordpressStaging: boolean | null;
  woocommerceOptimized: boolean | null;
  litespeedCache: boolean | null;
  objectCaching: boolean | null;
  wpMultisite: boolean | null;
  wpCliAccess: boolean | null;

  // === SECURITY ===
  ddosProtection: boolean | null;
  ddosProtectionLevel: string | null;
  malwareScanning: boolean | null;
  malwareRemoval: boolean | null;
  firewallIncluded: boolean | null;
  backupFrequency: string | null;
  backupRetentionDays: number | null;
  backupRestoreFee: number | null;
  onDemandBackup: boolean | null;
  twoFactorAuth: boolean | null;
  wildcardSsl: boolean | null;
  dedicatedIpAvailable: boolean | null;

  // === SUPPORT ===
  supportChannels: string[] | null;
  liveChatAvailable: boolean | null;
  liveChatHours: string | null;
  phoneSupportAvailable: boolean | null;
  phoneSupportHours: string | null;
  ticketSupport: boolean | null;
  prioritySupport: boolean | null;
  supportLanguages: string[] | null;
  knowledgeBaseQuality: number | null;
  avgSupportWaitMinutes: number | null;

  // === PRICING (detailed) ===
  renewalMarkupPercent: number | null;
  firstYearCost: number | null;
  secondYearCost: number | null;
  moneyBackDays: number | null;
  setupFee: number | null;
  monthlyBillingAvailable: boolean | null;
  minimumContractMonths: number | null;

  // === EMAIL ===
  emailAccountsIncluded: boolean | null;
  emailAccountLimit: NumberOrUnlimited | null;
  mailboxSizeGb: number | null;
  webmailAccess: boolean | null;
  spamFilter: boolean | null;
  emailForwarding: boolean | null;

  // === COMPLIANCE ===
  gdprCompliance: boolean | null;
  pciCompliance: boolean | null;
  hipaaCompliance: boolean | null;
  dataCenterCerts: string[] | null;

  // === PLATFORM SUPPORT ===
  drupalSupport: boolean | null;
  joomlaSupport: boolean | null;
  magentoSupport: boolean | null;
  laravelSupport: boolean | null;
  djangoSupport: boolean | null;
  nextjsSupport: boolean | null;
  railsSupport: boolean | null;
  staticSiteSupport: boolean | null;

  // === PERFORMANCE ===
  cdnIncluded: boolean | null;
  cdnProvider: string | null;
  serverLocations: string[] | null;
  serverLocationCount: number | null;
  chooseServerLocation: boolean | null;
  http2Support: boolean | null;
  brotliCompression: boolean | null;
  uptimeSlaCredit: boolean | null;

  // === RATINGS (all 8 dimensions) ===
  valueForMoney: number | null;
  performanceRating: number | null;
  supportQuality: number | null;
  securityRating: number | null;
  featuresRating: number | null;
  easeOfUse: number | null;
  transparencyRating: number | null;

  // === SUITABILITY (use case scores) ===
  suitabilityBlogger: number | null;
  suitabilityEcommerce: number | null;
  suitabilityAgency: number | null;
  suitabilityDeveloper: number | null;
  suitabilityBeginner: number | null;
  suitabilityEnterprise: number | null;

  // === MIGRATION ===
  migrationWebsitesLimit: number | null;
  migrationTurnaroundDays: number | null;
  paidMigrationCost: number | null;
  migrationQuality: number | null;

  // === CONTROL PANEL ===
  cpanelIncluded: boolean | null;
  controlPanelName: string | null;
  softaculous: boolean | null;
  websiteBuilderIncluded: boolean | null;
  websiteBuilderName: string | null;

  // === POLICIES ===
  bandwidthOveragePolicy: string | null;
  storageOveragePolicy: string | null;
  adultContentAllowed: boolean | null;
  gamblingSitesAllowed: boolean | null;
  cryptocurrencySitesAllowed: boolean | null;
  resellerHostingAvailable: boolean | null;
  whiteLabelAvailable: boolean | null;
  apiAccess: boolean | null;

  // === BASIC INFO ===
  yearFounded: number | null;
  headquartersCountry: string | null;
  parentCompany: string | null;
  greenHosting: boolean | null;
  instantAccountActivation: boolean | null;

  // === ADDITIONAL PRICING ===
  freeDomainDurationMonths: number | null;
  moneyBackExclusions: string | null;
  acceptedPaymentMethods: string[] | null;
  autoRenewalDefault: boolean | null;
  domainPrivacyIncluded: boolean | null;
  domainPrivacyCostYearly: number | null;

  // === ADDITIONAL TECHNICAL ===
  inodeLimit: NumberOrUnlimited | null;
  maxDatabaseSizeGb: number | null;
  maxFileUploadSizeMb: number | null;
  phpVersionSwitching: boolean | null;
  sshAccessTierRequired: string | null;
  stagingIncludedTier: string | null;
  subdomainsLimit: NumberOrUnlimited | null;
  ftpAccountsLimit: NumberOrUnlimited | null;
  databaseType: string | null;
  elasticsearchSupport: boolean | null;
  imageOptimization: boolean | null;

  // === ADDITIONAL SECURITY ===
  sslProvider: string | null;
  dedicatedIpCostMonthly: number | null;
  malwareRemovalCost: number | null;
  downloadableBackups: boolean | null;

  // === ADDITIONAL SUPPORT ===
  phoneSupportCountries: string[] | null;
  prioritySupportCost: number | null;
  communityForumActive: boolean | null;
  supportOutsourced: boolean | null;

  // === ADDITIONAL WORDPRESS ===
  objectCacheType: string | null;
  managedWordpressAvailable: boolean | null;

  // === MANAGED WORDPRESS ===
  wpPricingModel: PricingModel | null;
  monthlyVisitLimit: NumberOrUnlimited | null;
  visitOverageCost: number | null;
  phpWorkerLimit: number | null;
  pluginRestrictions: string[] | null;
  devEnvironmentIncluded: boolean | null;
  devEnvironmentName: string | null;

  // === ADDITIONAL POLICIES ===
  bandwidthOverageCost: number | null;
  accountSuspensionPolicy: string | null;
  resourceAbuseDefinition: string | null;
  fileHostingAllowed: boolean | null;
  proxyVpnAllowed: boolean | null;

  // === BUSINESS & AFFILIATE ===
  affiliateProgram: boolean | null;
  affiliateCommissionType: string | null;
  affiliateCommissionAmount: string | null;

  // === EXTERNAL RATINGS ===
  g2Rating: number | null;
  betterBusinessBureauRating: string | null;

  // === EDITORIAL ===
  knownIssues: string | null;
  bestFor: string | null;
  avoidIf: string | null;
  competitorComparisonNotes: string | null;

  // === COMPARISON DATA ===
  uniqueSellingPoint: string | null;
  primaryCompetitors: string[] | null;
  bestAlternativeTo: string | null;
  idealCustomerProfile: string | null;

  // === REGIONAL TARGETING ===
  bestForCountries: string[] | null;
  localCurrencyBilling: string[] | null;
  localSupportLanguages: string[] | null;
  dataSovereigntyCompliance: string[] | null;

  // === ADDITIONAL PLATFORMS ===
  prestashopSupport: boolean | null;
  ghostSupport: boolean | null;
  shopifyMigration: boolean | null;
  wixMigration: boolean | null;
  squarespaceMigration: boolean | null;
  webflowExport: boolean | null;
}

// Column Set Types (20 total)
export type ColumnSet =
  | 'essential'
  | 'technical'
  | 'wordpress'
  | 'security'
  | 'support'
  | 'pricing'
  | 'email'
  | 'compliance'
  | 'platform'
  | 'performance'
  | 'ratings'
  | 'suitability'
  | 'migration'
  | 'controlPanel'
  | 'policies'
  | 'managedWp'
  | 'regional'
  | 'editorial'
  | 'business'
  | 'advanced';

// Filter State
export interface FilterState {
  search: string;
  hostingTypes: HostingType[];
  priceRange: [number, number];
  minRating: number;
  minUptime: number;
  features: {
    // Existing
    freeSsl: boolean;
    freeDomain: boolean;
    freeMigration: boolean;
    sshAccess: boolean;
    staging: boolean;
    // Technical
    unlimitedStorage: boolean;
    unlimitedBandwidth: boolean;
    nodejsSupport: boolean;
    pythonSupport: boolean;
    // WordPress
    wordpressOptimized: boolean;
    woocommerceOptimized: boolean;
    litespeedCache: boolean;
    // Support
    liveChatSupport: boolean;
    phoneSupport: boolean;
    // Performance
    cdnIncluded: boolean;
    // Compliance
    gdprCompliance: boolean;
    pciCompliance: boolean;
  };
  // Suitability filters (min score 0-10)
  suitability: {
    blogger: boolean;
    developer: boolean;
    ecommerce: boolean;
    beginner: boolean;
    enterprise: boolean;
  };
}

// Comparison Pair
export interface ComparisonPair {
  hostA: string;
  hostB: string;
  category: string;
  url: string;
}

// Sort Options
export type SortField =
  | 'name'
  | 'monthlyPrice'
  | 'renewalPrice'
  | 'overallRating'
  | 'uptimeGuarantee'
  | 'trustpilotRating';

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

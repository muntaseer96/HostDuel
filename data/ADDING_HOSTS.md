# Adding New Hosts to HostDuel

This guide explains how to add new hosting providers to the comparison table.

## Quick Steps

1. **Create company JSON file** in `data/companies/{company-id}.json`
2. **Add entry to index** in `data/index.json`
3. **Rebuild the site** - data is loaded at build time

## Step 1: Create Company JSON

Create a new file `data/companies/{company-id}.json` using the schema below.

### File Naming
- Use lowercase, hyphenated names: `my-host.json`, `cool-hosting.json`
- The filename (without .json) becomes the URL slug: `/hosting/my-host`

### Required Fields

```json
{
  "basicInfo": {
    "companyName": "Company Name",
    "websiteUrl": "https://example.com",
    "yearFounded": 2020,
    "headquartersCountry": "United States",
    "parentCompany": null,
    "dataLastUpdated": "2026-01-14",
    "hostingType": "shared",
    "greenHosting": null,
    "instantAccountActivation": null,
    "notes": null
  },
  "pricing": {
    "sharedHostingMonthlyPromo": 2.99,
    "sharedHostingMonthlyRenewal": 9.99,
    "vpsMonthlyLowest": null,
    "vpsMonthlyRenewal": null,
    "dedicatedMonthlyLowest": null,
    "dedicatedMonthlyRenewal": null,
    "wordpressHostingMonthlyPromo": null,
    "wordpressHostingMonthlyRenewal": null,
    "cloudHostingMonthlyLowest": null,
    "freeDomainIncluded": true,
    "freeDomainDurationMonths": 12,
    "domainTransferLockPeriodDays": null,
    "setupFee": 0,
    "moneyBackGuaranteeDays": 30,
    "moneyBackExclusions": null,
    "acceptedPaymentMethods": ["Credit Card", "PayPal"],
    "autoRenewalDefault": true,
    "minimumContractMonths": null,
    "monthlyBillingAvailable": true,
    "domainPrivacyIncluded": null,
    "domainPrivacyCostYearly": null
  },
  "technicalSpecs": {
    "storageGb": 50,
    "storageType": "SSD",
    "bandwidthGb": "Unlimited",
    "inodeLimit": null,
    "maxWebsitesAllowed": 1,
    "maxDatabases": 10,
    "maxDatabaseSizeGb": null,
    "maxFileUploadSizeMb": null,
    "phpVersionsAvailable": ["8.1", "8.2", "8.3"],
    "phpVersionSwitching": true,
    "nodejsSupport": false,
    "pythonSupport": false,
    "rubySupport": false,
    "sshAccess": true,
    "sshAccessTierRequired": null,
    "gitDeployment": false,
    "wpCliAccess": false,
    "cronJobsAllowed": true,
    "stagingEnvironment": false,
    "stagingIncludedTier": null,
    "subdomainsLimit": null,
    "ftpAccountsLimit": null,
    "databaseType": "MySQL",
    "redisAvailable": false,
    "elasticsearchSupport": false,
    "imageOptimization": false
  },
  "serverPerformance": {
    "serverLocations": ["US"],
    "serverLocationOptionsCount": 1,
    "chooseServerLocation": false,
    "cdnIncluded": false,
    "cdnProvider": null,
    "uptimeGuaranteePercent": 99.9,
    "uptimeSlaCredit": false,
    "ddosProtection": true,
    "ddosProtectionLevel": "Basic",
    "firewallIncluded": true,
    "malwareScanning": false,
    "malwareRemoval": false,
    "malwareRemovalCost": null,
    "http2Support": true,
    "brotliCompression": false
  },
  "securitySsl": {
    "freeSsl": true,
    "sslProvider": "Let's Encrypt",
    "wildcardSslAvailable": false,
    "dedicatedIpAvailable": false,
    "dedicatedIpCostMonthly": null,
    "twoFactorAuthentication": true,
    "backupFrequency": "Daily",
    "backupRetentionDays": 7,
    "backupRestoreFee": 0,
    "onDemandBackup": true,
    "downloadableBackups": true
  },
  "compliance": {
    "gdprComplianceTools": true,
    "pciCompliance": false,
    "hipaaCompliance": false,
    "dataCenterCertifications": []
  },
  "support": {
    "supportChannels": ["Live Chat", "Email", "Ticket"],
    "liveChatAvailable": true,
    "liveChatHours": "24/7",
    "phoneSupportAvailable": false,
    "phoneSupportCountries": [],
    "phoneSupportHours": null,
    "ticketSupport": true,
    "prioritySupportAvailable": false,
    "prioritySupportCost": null,
    "supportLanguageOptions": ["English"],
    "knowledgeBaseQuality": 3,
    "communityForumActive": false,
    "averageSupportWaitMinutes": null,
    "supportOutsourced": null
  },
  "wordpressFeatures": {
    "wordpressOptimized": true,
    "wordpressAutoInstall": true,
    "wordpressAutoUpdates": true,
    "wordpressStaging": false,
    "woocommerceOptimized": false,
    "litespeedCache": false,
    "objectCaching": false,
    "objectCacheType": null,
    "managedWordpressAvailable": false,
    "wpMultisiteSupport": false
  },
  "managedWordPress": {
    "pricingModel": null,
    "monthlyVisitLimit": null,
    "visitOverageCost": null,
    "phpWorkerLimit": null,
    "pluginRestrictions": null,
    "devEnvironmentIncluded": null,
    "devEnvironmentName": null
  },
  "migration": {
    "freeMigration": true,
    "migrationWebsitesLimit": 1,
    "migrationServiceQuality": 3,
    "migrationTurnaroundDays": 3,
    "paidMigrationCost": null
  },
  "controlPanel": {
    "cpanelIncluded": true,
    "cpanelAlternative": null,
    "controlPanelName": "cPanel",
    "softaculousAutoInstaller": true,
    "websiteBuilderIncluded": false,
    "websiteBuilderName": null
  },
  "email": {
    "emailAccountsIncluded": true,
    "emailAccountLimit": 10,
    "individualMailboxSizeGb": 1,
    "webmailAccess": true,
    "spamFilter": true,
    "emailForwarding": true
  },
  "policiesOverages": {
    "bandwidthOveragePolicy": "Throttle",
    "bandwidthOverageCost": null,
    "storageOveragePolicy": null,
    "accountSuspensionPolicy": null,
    "resourceAbuseDefinition": null,
    "hiddenFeesNotes": null
  },
  "contentRestrictions": {
    "adultContentAllowed": false,
    "gamblingSitesAllowed": false,
    "cryptocurrencySitesAllowed": true,
    "fileHostingAllowed": false,
    "proxyVpnAllowed": false,
    "resellerHostingAvailable": false,
    "whiteLabelAvailable": false
  },
  "business": {
    "apiAccess": false,
    "affiliateProgram": true,
    "affiliateCommissionType": null,
    "affiliateCommissionAmount": null
  },
  "reputation": {
    "trustpilotRating": 4.0,
    "trustpilotReviewsCount": 1000,
    "g2Rating": null,
    "betterBusinessBureauRating": null
  },
  "editorial": {
    "knownIssues": null,
    "bestFor": "Small websites and blogs",
    "avoidIf": "Need advanced developer features",
    "competitorComparisonNotes": null
  },
  "ratings": {
    "valueForMoney": 4,
    "performance": 3,
    "supportQuality": 3,
    "security": 3,
    "features": 3,
    "easeOfUse": 4,
    "transparency": 3,
    "overallRating": 3.5
  },
  "useCases": {
    "suitabilityBlogger": 4,
    "suitabilityEcommerce": 2,
    "suitabilityAgency": 2,
    "suitabilityDeveloper": 2,
    "suitabilityBeginner": 5,
    "suitabilityEnterprise": 1
  },
  "platformSupport": {
    "drupalSupport": true,
    "joomlaSupport": true,
    "magentoSupport": false,
    "prestashopSupport": false,
    "laravelSupport": false,
    "djangoSupport": false,
    "nextjsSupport": false,
    "railsSupport": false
  },
  "pricingCalculated": {
    "totalFirstYearCost": 35.88,
    "totalSecondYearCost": 119.88,
    "renewalMarkupPercent": 234,
    "effectiveMonthlyAverage": 6.49
  },
  "comparisonData": {
    "uniqueSellingPoint": "Affordable beginner hosting",
    "primaryCompetitors": ["bluehost", "hostinger"],
    "bestAlternativeTo": null,
    "idealCustomerProfile": "Beginners building first website"
  },
  "regionalTargeting": {
    "bestForCountries": ["US"],
    "localCurrencyBilling": ["USD"],
    "localSupportLanguages": ["English"],
    "dataSovereigntyCompliance": [],
    "regionalWebsites": []
  },
  "faqContent": {
    "faqIsThisHostGood": null,
    "faqWhoOwnsThisHost": null,
    "faqHowMuchDoesItCost": null,
    "faqIsItBeginnerFriendly": null,
    "faqDoesItIncludeEmail": null,
    "faqCanIHostWordPress": null,
    "faqWhatsTheUptime": null,
    "faqCanICancelAnytime": null
  },
  "additionalPlatforms": {
    "ghostSupport": false,
    "shopifyMigration": false,
    "wixMigration": false,
    "squarespaceMigration": false,
    "webflowExport": false,
    "staticSiteSupport": false
  }
}
```

### Hosting Types

Valid values for `hostingType`:
- `shared` - Shared Hosting
- `managed-wordpress` - Managed WordPress
- `vps` - VPS Hosting
- `cloud-iaas` - Cloud Infrastructure
- `dedicated` - Dedicated Servers
- `website-builder` - Website Builder
- `ecommerce-platform` - eCommerce Platform
- `jamstack` - JAMstack/Static
- `paas` - Platform as a Service
- `domain-registrar` - Domain Registrar
- `cdn-security` - CDN & Security

### Rating Scale

All ratings are on a **1-5 scale**:
- `1` = Poor
- `2` = Below Average
- `3` = Average
- `4` = Good
- `5` = Excellent

## Step 2: Add to Index

Add an entry to `data/index.json` in the `companies` array:

```json
{
  "id": "my-host",
  "name": "My Host",
  "file": "./companies/my-host.json",
  "websiteUrl": "https://myhost.com",
  "status": "complete",
  "lastUpdated": "2026-01-14"
}
```

**Status values:**
- `complete` - All data filled in
- `in-progress` - Partially complete
- `pending` - Placeholder only

## Step 3: Verify

1. Check JSON syntax: `cat data/companies/my-host.json | jq .`
2. Rebuild site: `cd site && npm run build`
3. Check for TypeScript errors
4. Visit `/hosting/my-host` to verify

## Field Reference

See `data/schema.json` for complete field definitions.

## Tips

- Use `null` for unknown values, not empty strings
- Storage/bandwidth can be a number (GB) or `"Unlimited"`
- Prices should be in USD
- Keep notes factual and dated
- Update `dataLastUpdated` when making changes

## Updating Host Count

After adding hosts, update the description in `site/src/lib/constants.ts`:

```typescript
export const SITE_DESCRIPTION =
  'Compare XX web hosting providers across 355+ data points...';
```

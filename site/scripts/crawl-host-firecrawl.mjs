#!/usr/bin/env node
/**
 * crawl-host-firecrawl.mjs — broad factual-data refresh via Firecrawl.
 *
 * One crawl pass per host refreshes the *majority* of the schema in a single try:
 * the factual layer a host publishes on its own site (specs, performance, security,
 * compliance, support, email, WordPress, migration, control panel, policies, content
 * rules, platform support) plus third-party reputation (Trustpilot/G2). It extracts
 * those groups, MERGES across source pages, DIFFS against the stored JSON, and prints
 * ONLY the fields that changed — each with the source URL — followed by ready-to-run
 * apply commands.
 *
 * What it deliberately DOES NOT touch (HostDuel's moat / derived math):
 *   ratings, useCases, editorial, faqContent  → editorial judgment (human-written)
 *   pricingCalculated, priceHistory, comparisonData → derived (computed, never scraped)
 *
 * It WRITES NOTHING. A human reviews the diff, then runs the printed commands:
 *   - pricing fields  → `refresh-pricing.mjs set`  (keeps the pricing math + history)
 *   - everything else → `apply-host-data.mjs set`
 *
 * Null-safe: a field the page doesn't mention comes back null and is IGNORED —
 * we never overwrite a curated value with "not found".
 *
 * Usage:
 *   node scripts/crawl-host-firecrawl.mjs hostinger          # one host (proof)
 *   node scripts/crawl-host-firecrawl.mjs hostinger contabo  # several
 *   node scripts/crawl-host-firecrawl.mjs --all              # every host
 *
 * Needs FIRECRAWL_API_KEY (env or site/.env.local). Source URLs can be overridden
 * per host in scripts/crawl-sources.json (see resolveSources()).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_DIR = path.join(__dirname, '..');
const COMPANIES_DIR = path.join(SITE_DIR, 'src', 'data', 'companies');

// ── api key ──────────────────────────────────────────────────────────────────
function loadApiKey() {
  if (process.env.FIRECRAWL_API_KEY) return process.env.FIRECRAWL_API_KEY;
  const envFile = path.join(SITE_DIR, '.env.local');
  if (fs.existsSync(envFile)) {
    const m = fs.readFileSync(envFile, 'utf8').match(/^FIRECRAWL_API_KEY=(.+)$/m);
    if (m) return m[1].trim();
  }
  console.error('✗ FIRECRAWL_API_KEY not set (env or site/.env.local).');
  process.exit(1);
}
const KEY = loadApiKey();

// ── the scrapable factual layer (single source of truth) ─────────────────────
// section -> { field: 'number' | 'string' | 'boolean' | 'array' }
// Only fields a host states as fact on its own site. Editorial/derived sections
// are intentionally absent so the crawl can never clobber them.
const FIELD_CATALOG = {
  technicalSpecs: {
    storageGb: 'number', storageType: 'string', bandwidthGb: 'number', inodeLimit: 'number',
    maxWebsitesAllowed: 'number', maxDatabases: 'number', maxDatabaseSizeGb: 'number',
    maxFileUploadSizeMb: 'number', phpVersionsAvailable: 'array', phpVersionSwitching: 'boolean',
    nodejsSupport: 'boolean', pythonSupport: 'boolean', rubySupport: 'boolean', sshAccess: 'boolean',
    sshAccessTierRequired: 'string', gitDeployment: 'boolean', wpCliAccess: 'boolean',
    cronJobsAllowed: 'boolean', stagingEnvironment: 'boolean', stagingIncludedTier: 'string',
    subdomainsLimit: 'number', ftpAccountsLimit: 'number', databaseType: 'string',
    redisAvailable: 'boolean', elasticsearchSupport: 'boolean', imageOptimization: 'boolean',
  },
  serverPerformance: {
    serverLocations: 'array', serverLocationOptionsCount: 'number', chooseServerLocation: 'boolean',
    cdnIncluded: 'boolean', cdnProvider: 'string', uptimeGuaranteePercent: 'number',
    uptimeSlaCredit: 'boolean', ddosProtection: 'boolean', ddosProtectionLevel: 'string',
    firewallIncluded: 'boolean', malwareScanning: 'boolean', malwareRemoval: 'boolean',
    malwareRemovalCost: 'number', http2Support: 'boolean', brotliCompression: 'boolean',
  },
  securitySsl: {
    freeSsl: 'boolean', sslProvider: 'string', wildcardSslAvailable: 'boolean',
    dedicatedIpAvailable: 'boolean', dedicatedIpCostMonthly: 'number',
    twoFactorAuthentication: 'boolean', backupFrequency: 'string', backupRetentionDays: 'number',
    backupRestoreFee: 'number', onDemandBackup: 'boolean', downloadableBackups: 'boolean',
  },
  compliance: {
    gdprComplianceTools: 'boolean', pciCompliance: 'boolean', hipaaCompliance: 'boolean',
    dataCenterCertifications: 'array',
  },
  support: {
    supportChannels: 'array', liveChatAvailable: 'boolean', liveChatHours: 'string',
    phoneSupportAvailable: 'boolean', phoneSupportCountries: 'string', phoneSupportHours: 'string',
    ticketSupport: 'boolean', prioritySupportAvailable: 'boolean', prioritySupportCost: 'number',
    supportLanguageOptions: 'array', communityForumActive: 'boolean', supportOutsourced: 'boolean',
  },
  wordpressFeatures: {
    wordpressOptimized: 'boolean', wordpressAutoInstall: 'boolean', wordpressAutoUpdates: 'boolean',
    wordpressStaging: 'boolean', woocommerceOptimized: 'boolean', litespeedCache: 'boolean',
    objectCaching: 'boolean', objectCacheType: 'string', managedWordpressAvailable: 'boolean',
    wpMultisiteSupport: 'boolean',
  },
  migration: {
    freeMigration: 'boolean', migrationWebsitesLimit: 'number', migrationTurnaroundDays: 'number',
    paidMigrationCost: 'number',
  },
  controlPanel: {
    cpanelIncluded: 'boolean', cpanelAlternative: 'string', controlPanelName: 'string',
    softaculousAutoInstaller: 'boolean', websiteBuilderIncluded: 'boolean', websiteBuilderName: 'string',
  },
  email: {
    emailAccountsIncluded: 'boolean', emailAccountLimit: 'number', individualMailboxSizeGb: 'number',
    webmailAccess: 'boolean', spamFilter: 'boolean', emailForwarding: 'boolean',
  },
  policiesOverages: {
    bandwidthOveragePolicy: 'string', storageOveragePolicy: 'string', accountSuspensionPolicy: 'string',
  },
  contentRestrictions: {
    adultContentAllowed: 'boolean', gamblingSitesAllowed: 'boolean', cryptocurrencySitesAllowed: 'boolean',
    fileHostingAllowed: 'boolean', proxyVpnAllowed: 'boolean', resellerHostingAvailable: 'boolean',
    whiteLabelAvailable: 'boolean',
  },
  platformSupport: {
    drupalSupport: 'boolean', joomlaSupport: 'boolean', magentoSupport: 'boolean',
    prestashopSupport: 'boolean', laravelSupport: 'boolean', djangoSupport: 'boolean',
    nextjsSupport: 'boolean', railsSupport: 'boolean',
  },
  business: {
    apiAccess: 'boolean', affiliateProgram: 'boolean',
  },
};

// Reputation is third-party (Trustpilot/G2), fetched from a separate source.
const REPUTATION_FIELDS = {
  trustpilotRating: 'number', trustpilotReviewsCount: 'number',
};

// Pricing stays in the proven refresh-pricing path; we surface it but emit a
// `refresh-pricing.mjs set` command for it instead of apply-host-data.
const PRICING_FIELDS = {
  sharedHostingMonthlyPromo: 'number', sharedHostingMonthlyRenewal: 'number',
  vpsMonthlyLowest: 'number', vpsMonthlyRenewal: 'number',
  wordpressHostingMonthlyPromo: 'number', wordpressHostingMonthlyRenewal: 'number',
  moneyBackGuaranteeDays: 'number', freeDomainIncluded: 'boolean', setupFee: 'number',
};

// ── Firecrawl JSON-schema builder ─────────────────────────────────────────────
function fieldSchema(type) {
  if (type === 'array') return { type: ['array', 'null'], items: { type: 'string' } };
  return { type: [type, 'null'] };
}
function groupSchema(fields) {
  const properties = {};
  for (const [k, t] of Object.entries(fields)) properties[k] = fieldSchema(t);
  return { type: 'object', properties };
}
function buildHostSiteSchema() {
  const properties = {};
  for (const [section, fields] of Object.entries(FIELD_CATALOG)) properties[section] = groupSchema(fields);
  properties.pricing = groupSchema(PRICING_FIELDS);
  return { type: 'object', properties };
}

const HOST_SITE_PROMPT =
  'You are extracting FACTUAL hosting specs from this provider\'s own marketing/plan pages for ' +
  'a comparison database. For the provider\'s ENTRY-LEVEL / cheapest shared (or primary) plan, fill ' +
  'each field ONLY with what the page explicitly states. Use null for anything not clearly stated — ' +
  'never guess or infer. Numbers must be plain numbers (no "$", "GB", "%", commas). Booleans reflect ' +
  'whether the feature is included/allowed. Arrays are short string lists. Prices are USD per month.';

const REPUTATION_PROMPT =
  'Extract this company\'s current Trustpilot TrustScore (0–5, one decimal) as trustpilotRating and the ' +
  'total number of reviews as trustpilotReviewsCount (integer, no commas). Use null if not shown.';

// ── Firecrawl scrape ──────────────────────────────────────────────────────────
async function scrapeJson(url, prompt, schema) {
  const res = await fetch('https://api.firecrawl.dev/v2/scrape', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, onlyMainContent: false, formats: [{ type: 'json', prompt, schema }] }),
  });
  const j = await res.json();
  if (!j.success) throw new Error(j.error || `scrape failed (${res.status})`);
  return j.data?.json || {};
}

// ── source resolution ─────────────────────────────────────────────────────────
function loadJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
const pricingSources = loadJson(path.join(__dirname, 'pricing-sources.json'), { sources: [] }).sources || [];
const crawlOverrides = loadJson(path.join(__dirname, 'crawl-sources.json'), {});

function trustpilotUrl(websiteUrl) {
  try { return `https://www.trustpilot.com/review/${new URL(websiteUrl).hostname.replace(/^www\./, '')}`; }
  catch { return null; }
}

/** Returns { siteUrls: string[], reputationUrl: string|null } for a host. */
function resolveSources(hostId, data) {
  const override = crawlOverrides[hostId] || {};
  const fromPricing = pricingSources.find((s) => s.id === hostId)?.url;
  const site = override.siteUrls?.length
    ? override.siteUrls
    : [fromPricing || data.basicInfo?.websiteUrl].filter(Boolean);
  const reputationUrl =
    override.reputationUrl ?? trustpilotUrl(data.basicInfo?.websiteUrl);
  return { siteUrls: [...new Set(site)], reputationUrl };
}

// ── merge + diff ───────────────────────────────────────────────────────────────
const isEmpty = (v) => v === null || v === undefined || v === '' ||
  (Array.isArray(v) && v.length === 0);

/** Fill-null merge across page results (first non-null wins; record provenance). */
function mergeGroup(results) {
  const merged = {}, source = {};
  for (const { url, json } of results) {
    for (const [k, v] of Object.entries(json || {})) {
      if (!isEmpty(v) && isEmpty(merged[k])) { merged[k] = v; source[k] = url; }
    }
  }
  return { merged, source };
}

const arraysEqual = (a, b) =>
  Array.isArray(a) && Array.isArray(b) && a.length === b.length &&
  a.every((x, i) => x === b[i]);

function valuesDiffer(stored, live) {
  if (Array.isArray(stored) || Array.isArray(live)) return !arraysEqual(stored, live);
  return stored !== live;
}

const fmtVal = (v) => (Array.isArray(v) ? `[${v.length}]` : v === null || v === undefined ? '—' : JSON.stringify(v));

// ── per-host run ────────────────────────────────────────────────────────────────
async function crawlHost(hostId) {
  const file = path.join(COMPANIES_DIR, `${hostId}.json`);
  if (!fs.existsSync(file)) { console.log(`✗ ${hostId}: no data file`); return null; }
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const { siteUrls, reputationUrl } = resolveSources(hostId, data);

  console.log(`\n━━ ${hostId} ━━`);
  console.log(`   site:       ${siteUrls.join(', ') || '(none)'}`);
  console.log(`   reputation: ${reputationUrl || '(none)'}`);

  // 1) scrape host-site pages (full factual schema) + trustpilot (reputation)
  const siteSchema = buildHostSiteSchema();
  const siteResults = [];
  for (const url of siteUrls) {
    try { siteResults.push({ url, json: await scrapeJson(url, HOST_SITE_PROMPT, siteSchema) }); }
    catch (e) { console.log(`   ⚠ site scrape failed (${url}): ${e.message}`); }
  }
  let repResult = null;
  if (reputationUrl) {
    try { repResult = await scrapeJson(reputationUrl, REPUTATION_PROMPT, groupSchema(REPUTATION_FIELDS)); }
    catch (e) { console.log(`   ⚠ reputation scrape failed: ${e.message}`); }
  }

  // 2) per-section merge + diff
  const changes = []; // { kind:'data'|'pricing'|'reputation', section, field, stored, live, url }
  const sectionResults = (section) =>
    siteResults.map((r) => ({ url: r.url, json: r.json?.[section] || {} }));

  for (const section of Object.keys(FIELD_CATALOG)) {
    const { merged, source } = mergeGroup(sectionResults(section));
    const stored = data[section] || {};
    for (const field of Object.keys(FIELD_CATALOG[section])) {
      const live = merged[field];
      if (isEmpty(live)) continue;                    // not found → never overwrite
      if (valuesDiffer(stored[field], live)) {
        changes.push({ kind: 'data', section, field, stored: stored[field], live, url: source[field] });
      }
    }
  }
  // pricing (emit via refresh-pricing)
  {
    const { merged, source } = mergeGroup(sectionResults('pricing'));
    const stored = data.pricing || {};
    for (const field of Object.keys(PRICING_FIELDS)) {
      const live = merged[field];
      if (isEmpty(live)) continue;
      if (valuesDiffer(stored[field], live)) {
        changes.push({ kind: 'pricing', section: 'pricing', field, stored: stored[field], live, url: source[field] });
      }
    }
  }
  // reputation
  if (repResult) {
    const stored = data.reputation || {};
    for (const field of Object.keys(REPUTATION_FIELDS)) {
      const live = repResult[field];
      if (isEmpty(live)) continue;
      if (valuesDiffer(stored[field], live)) {
        changes.push({ kind: 'reputation', section: 'reputation', field, stored: stored[field], live, url: reputationUrl });
      }
    }
  }

  // 3) report
  if (!changes.length) { console.log('   ✓ no changes detected (live matches stored, or pages silent).'); return { hostId, changes }; }
  console.log(`\n   ${changes.length} proposed change(s):`);
  let lastSection = '';
  for (const c of changes) {
    if (c.section !== lastSection) { console.log(`   • ${c.section}`); lastSection = c.section; }
    console.log(`       ${c.field.padEnd(26)} ${fmtVal(c.stored)}  →  ${fmtVal(c.live)}`);
  }
  return { hostId, changes };
}

// ── apply-command emission ───────────────────────────────────────────────────────
function emitCommands(allResults) {
  console.log('\n══ Proposed commands (review each value, then run) ══════════════');
  let any = false;
  for (const r of allResults) {
    if (!r || !r.changes.length) continue;
    any = true;
    const pricing = r.changes.filter((c) => c.kind === 'pricing');
    const dataChanges = r.changes.filter((c) => c.kind === 'data' || c.kind === 'reputation');
    const arrayChanges = dataChanges.filter((c) => Array.isArray(c.live));
    const scalarChanges = dataChanges.filter((c) => !Array.isArray(c.live));

    console.log(`\n# ── ${r.hostId} ──`);
    if (pricing.length) {
      const patch = {}; for (const c of pricing) patch[c.field] = c.live;
      console.log(`node scripts/refresh-pricing.mjs set ${r.hostId} '${JSON.stringify(patch)}'`);
    }
    if (scalarChanges.length) {
      const patch = {}; for (const c of scalarChanges) patch[`${c.section}.${c.field}`] = c.live;
      console.log(`node scripts/apply-host-data.mjs set ${r.hostId} '${JSON.stringify(patch)}'`);
    }
    for (const c of arrayChanges) {
      console.log(`#   array field ${c.section}.${c.field}: edit by hand → ${JSON.stringify(c.live)}`);
    }
  }
  if (!any) console.log('(no changes across all hosts)');
  console.log('');
}

// ── main ────────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  let hosts;
  if (args.includes('--all')) {
    hosts = fs.readdirSync(COMPANIES_DIR).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));
  } else {
    hosts = args.filter((a) => !a.startsWith('--'));
  }
  if (!hosts.length) {
    console.error('Usage: crawl-host-firecrawl.mjs <hostId...> | --all');
    process.exit(1);
  }
  console.log(`Crawling ${hosts.length} host(s) via Firecrawl…`);
  const results = [];
  for (const h of hosts) results.push(await crawlHost(h));
  emitCommands(results);
}

main().catch((e) => { console.error('✗', e); process.exit(1); });

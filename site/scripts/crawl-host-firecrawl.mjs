#!/usr/bin/env node
/**
 * crawl-host-firecrawl.mjs — fetch host page content via Firecrawl for review.
 *
 * Philosophy: Firecrawl does what it's uniquely good at — render JS, bypass
 * bot-blocking, return clean markdown. It does NOT extract fields. Claude (the
 * stronger model, with full context of our schema + curated data + review rules)
 * reads the saved markdown and decides the updates, quoting evidence. This avoids
 * babysitting a black-box extraction LLM and makes every change auditable.
 *
 * For each host it scrapes the configured source pages (facts) + the Trustpilot
 * page (reputation) to markdown, and writes ONE file per host:
 *     scripts/.crawl/<hostId>.md   (gitignored via *.md)
 * The file has two parts:
 *   1. STORED — the current DB values for the in-scope FACTUAL fields, so the
 *      reviewer compares without re-opening the JSON.
 *   2. LIVE — the page markdown for each source URL.
 *
 * In scope = facts a host publishes. OUT of scope (never reviewed from a crawl —
 * HostDuel's moat + derived math): ratings, useCases, editorial, faqContent,
 * pricingCalculated, priceHistory, comparisonData.
 *
 * Then Claude reads each file and emits reviewed commands:
 *   - pricing  → node scripts/refresh-pricing.mjs set <host> '{...}'
 *   - else     → node scripts/apply-host-data.mjs set <host> '{"section.field":val}'
 *
 * Usage:
 *   node scripts/crawl-host-firecrawl.mjs hostinger          # one host
 *   node scripts/crawl-host-firecrawl.mjs hostinger contabo  # several
 *   node scripts/crawl-host-firecrawl.mjs --all              # every host
 *
 * Needs FIRECRAWL_API_KEY (env or site/.env.local). Per-host source URLs in
 * scripts/crawl-sources.json (else pricing-page URL / websiteUrl + derived Trustpilot).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_DIR = path.join(__dirname, '..');
const COMPANIES_DIR = path.join(SITE_DIR, 'src', 'data', 'companies');
const OUT_DIR = path.join(__dirname, '.crawl');

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

// ── the in-scope factual layer (defines what the reviewer compares) ───────────
// Sections of hard facts a host states on its own site. Editorial/derived sections
// are intentionally absent so a crawl review never touches the moat.
const FACTUAL_SECTIONS = [
  'technicalSpecs', 'serverPerformance', 'securitySsl', 'compliance', 'support',
  'wordpressFeatures', 'migration', 'controlPanel', 'email', 'policiesOverages',
  'contentRestrictions', 'platformSupport', 'business',
];
// Pricing primary keys (kept separate — applied via refresh-pricing.mjs).
const PRICING_KEYS = [
  'sharedHostingMonthlyPromo', 'sharedHostingMonthlyRenewal',
  'vpsMonthlyLowest', 'vpsMonthlyRenewal',
  'wordpressHostingMonthlyPromo', 'wordpressHostingMonthlyRenewal',
  'moneyBackGuaranteeDays', 'freeDomainIncluded', 'setupFee',
];
const REPUTATION_KEYS = ['trustpilotRating', 'trustpilotReviewsCount', 'g2Rating'];

// ── Firecrawl: markdown only (its real strength: render + unblock) ────────────
async function scrapeMarkdown(url) {
  const res = await fetch('https://api.firecrawl.dev/v2/scrape', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, onlyMainContent: true, formats: ['markdown'] }),
  });
  const j = await res.json();
  if (!j.success) throw new Error(j.error || `scrape failed (${res.status})`);
  return j.data?.markdown || '';
}

// ── sources ───────────────────────────────────────────────────────────────────
function loadJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
const pricingSources = loadJson(path.join(__dirname, 'pricing-sources.json'), { sources: [] }).sources || [];
const crawlOverrides = loadJson(path.join(__dirname, 'crawl-sources.json'), {});

function trustpilotUrl(websiteUrl) {
  try { return `https://www.trustpilot.com/review/${new URL(websiteUrl).hostname.replace(/^www\./, '')}`; }
  catch { return null; }
}
function resolveSources(hostId, data) {
  const override = crawlOverrides[hostId] || {};
  const fromPricing = pricingSources.find((s) => s.id === hostId)?.url;
  const site = override.siteUrls?.length
    ? override.siteUrls
    : [fromPricing || data.basicInfo?.websiteUrl].filter(Boolean);
  const reputationUrl = override.reputationUrl ?? trustpilotUrl(data.basicInfo?.websiteUrl);
  return { siteUrls: [...new Set(site)], reputationUrl };
}

// ── stored snapshot (only the in-scope fields) ────────────────────────────────
function storedSnapshot(data) {
  const snap = {};
  for (const section of FACTUAL_SECTIONS) {
    if (data[section]) snap[section] = data[section];
  }
  snap.pricing = {};
  for (const k of PRICING_KEYS) if (k in (data.pricing || {})) snap.pricing[k] = data.pricing[k];
  snap.reputation = {};
  for (const k of REPUTATION_KEYS) if (k in (data.reputation || {})) snap.reputation[k] = data.reputation[k];
  return snap;
}

// ── per-host fetch ──────────────────────────────────────────────────────────────
async function fetchHost(hostId) {
  const file = path.join(COMPANIES_DIR, `${hostId}.json`);
  if (!fs.existsSync(file)) { console.log(`✗ ${hostId}: no data file`); return; }
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const { siteUrls, reputationUrl } = resolveSources(hostId, data);
  console.log(`\n━━ ${hostId} ━━`);

  const parts = [];
  parts.push(`# ${hostId} — crawl for review`);
  parts.push(`> Source pages fetched via Firecrawl. Compare LIVE against STORED, propose only`);
  parts.push(`> genuine, current, equal-or-more-specific changes. Pricing → refresh-pricing.mjs;`);
  parts.push(`> other facts → apply-host-data.mjs. Never touch editorial/derived sections.\n`);
  parts.push(`## STORED (current DB — in-scope fields only)\n`);
  parts.push('```json\n' + JSON.stringify(storedSnapshot(data), null, 2) + '\n```\n');
  parts.push(`## LIVE PAGE CONTENT\n`);

  const urls = [...siteUrls, ...(reputationUrl ? [reputationUrl] : [])];
  for (const url of urls) {
    process.stdout.write(`   fetching ${url} … `);
    try {
      const md = await scrapeMarkdown(url);
      parts.push(`\n### SOURCE: ${url}\n\n${md}\n`);
      console.log(`${md.length} chars`);
    } catch (e) {
      parts.push(`\n### SOURCE: ${url}\n\n_(fetch failed: ${e.message})_\n`);
      console.log(`✗ ${e.message}`);
    }
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outFile = path.join(OUT_DIR, `${hostId}.md`);
  fs.writeFileSync(outFile, parts.join('\n'));
  console.log(`   → saved ${path.relative(SITE_DIR, outFile)}`);
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
  console.log(`Fetching ${hosts.length} host(s) via Firecrawl → ${path.relative(SITE_DIR, OUT_DIR)}/`);
  for (const h of hosts) await fetchHost(h);
  console.log(`\n✓ Done. Read each scripts/.crawl/<host>.md, then apply reviewed changes.`);
}

main().catch((e) => { console.error('✗', e); process.exit(1); });

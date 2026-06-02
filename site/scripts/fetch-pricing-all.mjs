#!/usr/bin/env node
/**
 * fetch-pricing-all.mjs — discover + extract live pricing for ALL 56 hosts via Firecrawl.
 *
 * The earlier script relied on hand-guessed pricing URLs, which 404'd constantly.
 * This one DISCOVERS the right pricing page per host with Firecrawl's /v2/map
 * (seeded from the host's stored websiteUrl), then scrapes the cheapest plan of
 * that host's PRIMARY pricing type (shared ?? vps ?? wordpress ?? cloud — the same
 * precedence the site uses to pick the displayed price).
 *
 * It does NOT write any data file. It prints a review table + ready-to-run `set`
 * commands and saves the full result to scripts/.pricing-fetch-results.json so a
 * human can verify each rawPriceText (the USP is "real prices" — accuracy first).
 *
 * Usage:
 *   node scripts/fetch-pricing-all.mjs                 # all 56
 *   node scripts/fetch-pricing-all.mjs hostinger a2hosting   # subset
 *   node scripts/fetch-pricing-all.mjs --no-map        # skip discovery, use sources/override URLs
 *
 * Needs FIRECRAWL_API_KEY (env or site/.env.local).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_DIR = path.join(__dirname, '..');
const COMPANIES_DIR = path.join(SITE_DIR, 'src', 'data', 'companies');
const RESULTS_FILE = path.join(__dirname, '.pricing-fetch-results.json');
const OVERRIDES_FILE = path.join(__dirname, 'pricing-urls.json'); // optional {id:url} verified overrides

const CONCURRENCY = 5;
const FX = { EUR: 1.08, GBP: 1.27, INR: 0.012, CAD: 0.73, AUD: 0.66 }; // rough, for flagging only

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

const argv = process.argv.slice(2);
const noMap = argv.includes('--no-map');
const filter = argv.filter((a) => !a.startsWith('--'));
const overrides = fs.existsSync(OVERRIDES_FILE)
  ? JSON.parse(fs.readFileSync(OVERRIDES_FILE, 'utf8'))
  : {};

/** Primary pricing type + the JSON keys that hold its promo/renewal. */
function primaryType(p) {
  if (p.sharedHostingMonthlyPromo != null)
    return { type: 'shared', pk: 'sharedHostingMonthlyPromo', rk: 'sharedHostingMonthlyRenewal' };
  if (p.vpsMonthlyLowest != null)
    return { type: 'vps', pk: 'vpsMonthlyLowest', rk: 'vpsMonthlyRenewal' };
  if (p.wordpressHostingMonthlyPromo != null)
    return { type: 'wordpress', pk: 'wordpressHostingMonthlyPromo', rk: 'wordpressHostingMonthlyRenewal' };
  if (p.cloudHostingMonthlyLowest != null)
    return { type: 'cloud', pk: 'cloudHostingMonthlyLowest', rk: null };
  return { type: 'none', pk: null, rk: null };
}

const TYPE_LABEL = {
  shared: 'shared web hosting',
  vps: 'VPS hosting',
  wordpress: 'managed WordPress hosting',
  cloud: 'cloud hosting',
};

const EXTRACT_SCHEMA = {
  type: 'object',
  properties: {
    cheapestPlanName: { type: 'string' },
    promoMonthly: { type: ['number', 'null'], description: 'lowest advertised intro $/mo for the cheapest plan, number only' },
    renewalMonthly: { type: ['number', 'null'], description: '$/mo it renews at after the intro term, number only' },
    contractTermMonths: { type: ['number', 'null'], description: 'the billing term the promo requires (e.g. 12, 36, 48)' },
    currency: { type: 'string', description: 'ISO currency of the prices: USD, EUR, GBP, etc.' },
    billingNote: { type: 'string', description: 'is the price billed monthly or as an upfront term total? quote what the page says' },
    moneyBackDays: { type: ['number', 'null'] },
    freeDomain: { type: ['boolean', 'null'] },
    rawPriceText: { type: 'string', description: 'the literal price text shown on the page for that plan, verbatim' },
  },
  required: ['promoMonthly', 'renewalMonthly', 'currency', 'rawPriceText'],
};

const promptFor = (type) =>
  `This is a web host's pricing page. Find the single CHEAPEST ${TYPE_LABEL[type] || 'hosting'} plan. ` +
  `Return: its plan name; its lowest advertised PER-MONTH promotional/introductory price as a number ` +
  `(if the page only shows an upfront term total, divide by the number of months and say so in billingNote); ` +
  `the PER-MONTH price it renews at after the intro term; the contract term in months the promo requires; ` +
  `the currency; money-back days; whether a free domain is included; and the literal price text verbatim. ` +
  `Use null for any value genuinely not shown — never guess. Prefer the regular ${TYPE_LABEL[type]} plan, ` +
  `not a stripped "website builder", "email-only", or "starter trial" product.`;

async function fcMap(domain, type) {
  const res = await fetch('https://api.firecrawl.dev/v2/map', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: domain, search: `${TYPE_LABEL[type] || 'hosting'} pricing plans`, limit: 20 }),
  });
  const j = await res.json();
  if (!j.success) throw new Error(`map: ${j.error || 'failed'}`);
  return (j.links || j.data || []).map((l) => (typeof l === 'string' ? l : l.url)).filter(Boolean);
}

/** Score candidate URLs so the real pricing page beats blog/support/docs noise. */
function pickPricingUrl(urls, type) {
  const good = /pricing|\/plans|\/hosting|web-hosting|shared|vps|wordpress|cloud-hosting/i;
  const typeRe = new RegExp(type === 'wordpress' ? 'wordpress|wp-' : type, 'i');
  const bad = /blog|news|support|help|knowledge|docs|article|guide|about|contact|login|account|affiliate|tutorial/i;
  let best = null;
  let bestScore = -1e9;
  for (const u of urls) {
    let s = 0;
    if (good.test(u)) s += 5;
    if (typeRe.test(u)) s += 4;
    if (/pricing/i.test(u)) s += 3;
    if (bad.test(u)) s -= 8;
    s -= Math.max(0, (u.match(/\//g) || []).length - 3); // prefer shallow URLs
    if (s > bestScore) {
      bestScore = s;
      best = u;
    }
  }
  return best;
}

async function fcScrape(url, type) {
  const res = await fetch('https://api.firecrawl.dev/v2/scrape', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, formats: [{ type: 'json', prompt: promptFor(type), schema: EXTRACT_SCHEMA }] }),
  });
  const j = await res.json();
  if (!j.success) throw new Error(`scrape: ${j.error || 'failed'}`);
  return j.data?.json || {};
}

const num = (n) => (typeof n === 'number' && isFinite(n) ? n : null);
const fmt = (n) => (n == null ? '—' : `$${Number(n).toFixed(2)}`);

async function processHost(src) {
  const data = JSON.parse(fs.readFileSync(path.join(COMPANIES_DIR, `${src.id}.json`), 'utf8'));
  const pricing = data.pricing;
  const { type, pk, rk } = primaryType(pricing);
  const out = { id: src.id, type, url: null, stored: { promo: pk ? pricing[pk] : null, renewal: rk ? pricing[rk] : null } };

  if (type === 'none') {
    out.skip = 'no simple primary promo (PaaS/manual — set by hand)';
    return out;
  }
  try {
    let url = overrides[src.id] || src.url;
    if (!url && !noMap) {
      const links = await fcMap(data.basicInfo.websiteUrl, type);
      url = pickPricingUrl(links, type) || data.basicInfo.websiteUrl;
    }
    url = url || data.basicInfo.websiteUrl;
    out.url = url;

    const live = await fcScrape(url, type);
    const cur = (live.currency || 'USD').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || 'USD';
    const rate = FX[cur] || 1;
    const conv = (v) => (v == null ? null : Math.round(num(v) * rate * 100) / 100);
    out.live = {
      plan: live.cheapestPlanName || '?',
      promo: num(live.promoMonthly),
      renewal: num(live.renewalMonthly),
      promoUsd: conv(live.promoMonthly),
      renewalUsd: conv(live.renewalMonthly),
      term: num(live.contractTermMonths),
      currency: cur,
      billing: live.billingNote || '',
      moneyBack: num(live.moneyBackDays),
      freeDomain: live.freeDomain ?? null,
      raw: (live.rawPriceText || '').slice(0, 80),
    };
    out.pk = pk;
    out.rk = rk;
    const promoChanged = out.live.promoUsd != null && out.live.promoUsd !== out.stored.promo;
    const renChanged = rk && out.live.renewalUsd != null && out.live.renewalUsd !== out.stored.renewal;
    out.changed = promoChanged || renChanged;
    out.flag = cur !== 'USD' ? `${cur}→USD` : '';
  } catch (e) {
    out.error = e.message;
  }
  return out;
}

// ── run with bounded concurrency ───────────────────────────────────────────
const allFiles = fs.readdirSync(COMPANIES_DIR).filter((f) => f.endsWith('.json'));
let hosts = allFiles.map((f) => ({ id: f.replace('.json', '') }));
if (filter.length) hosts = hosts.filter((h) => filter.includes(h.id));

console.log(`\nFetching ${hosts.length} host(s) via Firecrawl (${noMap ? 'no map' : 'map+scrape'}, concurrency ${CONCURRENCY})…\n`);

const results = [];
let idx = 0;
async function worker() {
  while (idx < hosts.length) {
    const i = idx++;
    const r = await processHost(hosts[i]);
    results[i] = r;
    const tag = r.skip ? '⊘' : r.error ? '✗' : r.changed ? '●' : '○';
    const detail = r.skip
      ? r.skip
      : r.error
        ? r.error
        : `${fmt(r.stored.promo)}/${fmt(r.stored.renewal)} → ${fmt(r.live?.promoUsd)}/${fmt(r.live?.renewalUsd)} ${r.flag} "${r.live?.plan}" [${r.live?.raw}]`;
    console.log(`${tag} ${r.id.padEnd(16)}${(r.type || '').padEnd(9)} ${detail}`);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

const changed = results.filter((r) => r && r.changed && !r.error && !r.skip);
const errored = results.filter((r) => r && r.error);
const skipped = results.filter((r) => r && r.skip);

console.log(`\n── Summary ───────────────────────────────────────────────────`);
console.log(`changed: ${changed.length}   unchanged: ${results.length - changed.length - errored.length - skipped.length}   errors: ${errored.length}   skipped(PaaS): ${skipped.length}`);
if (errored.length) console.log(`errors: ${errored.map((r) => r.id).join(', ')}`);
if (skipped.length) console.log(`skipped: ${skipped.map((r) => r.id).join(', ')}`);

console.log(`\n── Proposed updates (REVIEW rawPriceText first!) ──────────────`);
for (const r of changed) {
  const patch = {};
  if (r.live.promoUsd != null) patch[r.pk] = r.live.promoUsd;
  if (r.rk && r.live.renewalUsd != null) patch[r.rk] = r.live.renewalUsd;
  const warn = r.flag ? `   # ⚠ ${r.flag} converted — verify` : '';
  console.log(`node scripts/refresh-pricing.mjs set ${r.id} '${JSON.stringify(patch)}'${warn}`);
}
console.log(`\nFull results saved to ${path.relative(SITE_DIR, RESULTS_FILE)}\n`);

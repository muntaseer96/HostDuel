#!/usr/bin/env node
/**
 * fetch-pricing-firecrawl.mjs — fetch live pricing via Firecrawl (proxies + JS render).
 *
 * Solves what the free WebFetch path couldn't: bot-blocked pages (403) and
 * JavaScript-rendered prices. For each priority host it asks Firecrawl to extract
 * the cheapest plan's promo + renewal price as structured JSON, compares to the
 * stored data, and prints a before→after table plus ready-to-run `set` commands.
 *
 * It does NOT write anything — a human reviews the diff and runs the `set` commands
 * (the "real prices" USP means accuracy > automation).
 *
 * Usage:
 *   node scripts/fetch-pricing-firecrawl.mjs            # all hosts in pricing-sources.json
 *   node scripts/fetch-pricing-firecrawl.mjs hostinger contabo   # only these
 *
 * Needs FIRECRAWL_API_KEY (read from env or site/.env.local).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_DIR = path.join(__dirname, '..');
const COMPANIES_DIR = path.join(SITE_DIR, 'src', 'data', 'companies');

// Rough EUR→USD for flagging only; non-USD rows are marked for manual confirmation.
const EUR_USD = 1.08;

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
const sources = JSON.parse(fs.readFileSync(path.join(__dirname, 'pricing-sources.json'), 'utf8')).sources;
const filter = process.argv.slice(2);
const targets = filter.length ? sources.filter((s) => filter.includes(s.id)) : sources;

const EXTRACT_SCHEMA = {
  type: 'object',
  properties: {
    cheapestPlanName: { type: 'string' },
    promoMonthly: { type: ['number', 'null'], description: 'lowest advertised intro/promotional $/mo, number only' },
    renewalMonthly: { type: ['number', 'null'], description: 'price per month after the intro term, number only' },
    currency: { type: 'string', description: 'USD, EUR, etc.' },
    moneyBackDays: { type: ['number', 'null'] },
    freeDomain: { type: ['boolean', 'null'] },
    rawPriceText: { type: 'string', description: 'the literal price text shown, for verification' },
  },
  required: ['promoMonthly', 'renewalMonthly', 'currency'],
};

const PROMPT =
  'Find the single CHEAPEST hosting plan on this page. Return its name, its lowest advertised ' +
  'promotional/introductory monthly price (number only), the monthly price it renews at after the ' +
  'intro term (number only), the currency, money-back guarantee days, whether a free domain is ' +
  'included, and the literal price text you saw. If a value is genuinely absent, use null — do not guess.';

async function fetchOne(url) {
  const res = await fetch('https://api.firecrawl.dev/v2/scrape', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, formats: [{ type: 'json', prompt: PROMPT, schema: EXTRACT_SCHEMA }] }),
  });
  const j = await res.json();
  if (!j.success) throw new Error(j.error || 'scrape failed');
  return j.data?.json || {};
}

const num = (n) => (typeof n === 'number' ? n : null);

/** Which stored field holds this host's primary (displayed) price? */
function primaryKeys(pricing) {
  if (pricing.sharedHostingMonthlyPromo != null) return ['sharedHostingMonthlyPromo', 'sharedHostingMonthlyRenewal'];
  if (pricing.vpsMonthlyLowest != null) return ['vpsMonthlyLowest', 'vpsMonthlyRenewal'];
  if (pricing.wordpressHostingMonthlyPromo != null) return ['wordpressHostingMonthlyPromo', 'wordpressHostingMonthlyRenewal'];
  return ['sharedHostingMonthlyPromo', 'sharedHostingMonthlyRenewal'];
}

const fmt = (n) => (n == null ? '—' : `$${Number(n).toFixed(2)}`);

console.log(`\nFetching ${targets.length} host(s) via Firecrawl…\n`);
const proposals = [];

for (const src of targets) {
  const stored = JSON.parse(fs.readFileSync(path.join(COMPANIES_DIR, `${src.id}.json`), 'utf8')).pricing;
  const [pk, rk] = primaryKeys(stored);
  try {
    const live = await fetchOne(src.url);
    const cur = (live.currency || 'USD').toUpperCase().includes('EUR') ? 'EUR' : 'USD';
    let promo = num(live.promoMonthly);
    let renewal = num(live.renewalMonthly);
    // Convert EUR→USD for comparison (flagged); leave verification to the human.
    const conv = (v) => (v == null ? null : cur === 'EUR' ? Math.round(v * EUR_USD * 100) / 100 : v);
    const promoUsd = conv(promo);
    const renewalUsd = conv(renewal);

    const changed =
      (promoUsd != null && promoUsd !== stored[pk]) || (renewalUsd != null && renewalUsd !== stored[rk]);
    const flag = cur === 'EUR' ? ' ⚠EUR→USD(verify)' : '';
    console.log(
      `${changed ? '●' : '○'} ${src.id.padEnd(15)} ${pk.replace('Monthly', '').replace('Hosting', '')}` +
        `\n    stored: ${fmt(stored[pk])} / ${fmt(stored[rk])}   live: ${fmt(promoUsd)} / ${fmt(renewalUsd)}${flag}` +
        `\n    plan: "${live.cheapestPlanName || '?'}"  raw: "${(live.rawPriceText || '').slice(0, 60)}"`
    );

    if (changed) {
      const patch = {};
      if (promoUsd != null) patch[pk] = promoUsd;
      if (renewalUsd != null) patch[rk] = renewalUsd;
      proposals.push({ id: src.id, patch, eur: cur === 'EUR' });
    }
  } catch (e) {
    console.log(`✗ ${src.id.padEnd(15)} fetch failed: ${e.message}`);
  }
}

console.log('\n── Proposed updates (review, then run) ─────────────────────────');
if (!proposals.length) console.log('(no changes detected)');
for (const p of proposals) {
  const warn = p.eur ? '   # ⚠ EUR-converted — verify the USD value first' : '';
  console.log(`node scripts/refresh-pricing.mjs set ${p.id} '${JSON.stringify(p.patch)}'${warn}`);
}
console.log('');

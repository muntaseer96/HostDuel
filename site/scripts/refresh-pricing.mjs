#!/usr/bin/env node
/**
 * refresh-pricing.mjs — monthly pricing refresh helper for HostDuel.
 *
 * The judgment part (fetch each host's live pricing, decide the right values) is
 * done by a human / Claude. This script handles the ERROR-PRONE DETERMINISTIC part
 * so the data stays internally consistent every time:
 *   - recomputes `pricingCalculated` from the raw pricing fields
 *   - appends a `priceHistory` snapshot when prices actually change
 *   - bumps `basicInfo.dataLastUpdated`
 *
 * Writes are SURGICAL: only the changed lines are rewritten, so the project's
 * Prettier formatting (inline short arrays, preserved decimals like `99.00`) and
 * every untouched line stay byte-for-byte intact — clean, minimal git diffs.
 *
 * Usage:
 *   node scripts/refresh-pricing.mjs report
 *   node scripts/refresh-pricing.mjs set <hostId> '<jsonPatch>' [--date=YYYY-MM-DD]
 *   node scripts/refresh-pricing.mjs recompute <hostId> [--date=YYYY-MM-DD]
 *   node scripts/refresh-pricing.mjs check                       (read-only drift report)
 *   node scripts/refresh-pricing.mjs seed-history                (one-time baseline)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPANIES_DIR = path.join(__dirname, '..', 'src', 'data', 'companies');

// Hosts that already get search impressions — refresh these first each month.
const PRIORITY = [
  'hostinger', 'hetzner', 'contabo', 'fastcomet', 'hostpapa', 'verpex',
  'tmdhosting', 'interserver', 'hostarmada', 'accuwebhosting', 'kamatera',
  'scalahosting', 'chemicloud', 'bluehost', 'ovhcloud',
];

const round2 = (n) => (n === null || n === undefined ? null : Math.round(n * 100) / 100);

// Mirror src/lib/data.ts monthlyPrice / renewalPrice selection so derived values
// match what the site actually displays.
const primaryPromo = (p) =>
  p.sharedHostingMonthlyPromo ?? p.vpsMonthlyLowest ?? p.wordpressHostingMonthlyPromo ?? null;
const primaryRenewal = (p) =>
  p.sharedHostingMonthlyRenewal ?? p.vpsMonthlyRenewal ?? p.wordpressHostingMonthlyRenewal ?? null;

function computePricingCalculated(p) {
  const promo = primaryPromo(p);
  const renewal = primaryRenewal(p);
  const setup = p.setupFee || 0;
  const totalFirstYearCost = promo !== null ? round2(promo * 12 + setup) : null;
  const totalSecondYearCost = renewal !== null ? round2(renewal * 12) : null;
  const renewalMarkupPercent =
    promo !== null && renewal !== null && promo > 0 ? round2(((renewal - promo) / promo) * 100) : null;
  const effectiveMonthlyAverage =
    totalFirstYearCost !== null && totalSecondYearCost !== null
      ? round2((totalFirstYearCost + totalSecondYearCost) / 24)
      : null;
  return { totalFirstYearCost, totalSecondYearCost, renewalMarkupPercent, effectiveMonthlyAverage };
}

function hostFile(hostId) {
  const file = path.join(COMPANIES_DIR, `${hostId}.json`);
  if (!fs.existsSync(file)) {
    console.error(`✗ No such host: ${hostId}`);
    process.exit(1);
  }
  return file;
}

function today() {
  const arg = process.argv.find((a) => a.startsWith('--date='));
  return arg ? arg.split('=')[1] : new Date().toISOString().slice(0, 10);
}

// ── surgical text editing (preserves Prettier formatting) ────────────────────

const fmtVal = (v) => (v === null ? 'null' : JSON.stringify(v));

/** Bounds of a top-level section's `{ ... }` body (closes at 2-space-indent `}`). */
function sectionBounds(raw, section) {
  const start = raw.indexOf(`"${section}": {`);
  if (start < 0) return null;
  const m = /\n {2}\}/.exec(raw.slice(start));
  return m ? { start, end: start + m.index + m[0].length } : null;
}

/** Replace `"key": value` inside a section. Returns {raw, changed}. No-op if equal. */
function setKeyInSection(raw, section, key, value) {
  const b = sectionBounds(raw, section);
  if (!b) throw new Error(`section not found: ${section}`);
  const block = raw.slice(b.start, b.end);
  const re = new RegExp(`("${key}"\\s*:\\s*)(-?\\d+(?:\\.\\d+)?|null|true|false|"(?:[^"\\\\]|\\\\.)*")`);
  const m = re.exec(block);
  if (!m) throw new Error(`key not found in ${section}: ${key}`);
  if (m[2] === fmtVal(value)) return { raw, changed: false };
  const newBlock = block.slice(0, m.index) + m[1] + fmtVal(value) + block.slice(m.index + m[0].length);
  return { raw: raw.slice(0, b.start) + newBlock + raw.slice(b.end), changed: true };
}

/** Format a priceHistory array as a top-level value (2-space base indent). */
function historyText(arr) {
  return JSON.stringify(arr, null, 2)
    .split('\n')
    .map((l, i) => (i === 0 ? l : '  ' + l))
    .join('\n');
}

/** Insert or replace the top-level `priceHistory` array. */
function upsertPriceHistory(raw, arr) {
  const text = historyText(arr);
  const idx = raw.indexOf(`"priceHistory":`);
  if (idx >= 0) {
    const close = /\n {2}\]/.exec(raw.slice(idx));
    const end = idx + close.index + close.length;
    return raw.slice(0, idx) + `"priceHistory": ${text}` + raw.slice(end);
  }
  // Append before the final top-level brace, comma-joining the previous section.
  return raw.replace(/\n\}\s*$/, `,\n  "priceHistory": ${text}\n}\n`);
}

// ── shared pricing logic ─────────────────────────────────────────────────────

const snapshotsEqual = (a, b) =>
  a && b && a.promoMonthly === b.promoMonthly && a.renewalMonthly === b.renewalMonthly;

/** Build the next priceHistory array + action, given current pricing + calc. */
function nextHistory(data, calc, dateStr) {
  const snap = {
    date: dateStr,
    promoMonthly: primaryPromo(data.pricing),
    renewalMonthly: primaryRenewal(data.pricing),
    renewalMarkupPercent: calc?.renewalMarkupPercent ?? null,
  };
  const hist = Array.isArray(data.priceHistory) ? data.priceHistory.slice() : [];
  const last = hist[hist.length - 1];
  if (!last) return { hist: [snap], action: 'seeded' };
  if (!snapshotsEqual(last, snap)) return { hist: [...hist, snap], action: 'appended' };
  if (last.date !== snap.date) {
    hist[hist.length - 1] = { ...last, date: snap.date, renewalMarkupPercent: snap.renewalMarkupPercent };
    return { hist, action: 'touched' };
  }
  return { hist, action: 'unchanged' };
}

/** Recompute is only valid when there's a traditional monthly promo (non-null). */
const canAutoRecompute = (pricing) => primaryPromo(pricing) !== null;

// ── commands ─────────────────────────────────────────────────────────────────

function cmdSet() {
  const hostId = process.argv[3];
  const patchRaw = process.argv[4];
  if (!hostId || !patchRaw) {
    console.error("Usage: refresh-pricing.mjs set <hostId> '<jsonPatch>' [--date=YYYY-MM-DD]");
    process.exit(1);
  }
  let patch;
  try { patch = JSON.parse(patchRaw); } catch (e) {
    console.error('✗ Invalid JSON patch:', e.message); process.exit(1);
  }
  const file = hostFile(hostId);
  let raw = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(raw);
  const oldPromo = primaryPromo(data.pricing), oldRenewal = primaryRenewal(data.pricing);

  // 1) apply pricing patch (surgical, skips unchanged keys)
  let touched = 0;
  for (const [k, v] of Object.entries(patch)) {
    const r = setKeyInSection(raw, 'pricing', k, v);
    raw = r.raw; if (r.changed) touched++;
    data.pricing[k] = v; // keep in-memory copy for compute
  }

  // 2) recompute pricingCalculated (only the simple/safe case)
  let calc = data.pricingCalculated;
  if (canAutoRecompute(data.pricing)) {
    calc = computePricingCalculated(data.pricing);
    for (const [k, v] of Object.entries(calc)) {
      raw = setKeyInSection(raw, 'pricingCalculated', k, v).raw;
    }
  } else {
    console.log('  ⚠ no monthly promo price — pricingCalculated left as-is (set it by hand if needed).');
  }

  // 3) price history + 4) date stamp
  const { hist, action } = nextHistory(data, calc, today());
  raw = upsertPriceHistory(raw, hist);
  raw = setKeyInSection(raw, 'basicInfo', 'dataLastUpdated', today()).raw;

  fs.writeFileSync(file, raw);
  console.log(`✓ ${hostId} updated — ${touched} pricing field(s) changed, history: ${action}`);
  console.log(`  promo:   ${oldPromo} → ${primaryPromo(data.pricing)}`);
  console.log(`  renewal: ${oldRenewal} → ${primaryRenewal(data.pricing)}`);
  console.log(`  pricingCalculated: ${JSON.stringify(calc)}`);
  console.log(`  dataLastUpdated → ${today()}`);
}

function cmdRecompute() {
  const hostId = process.argv[3];
  if (!hostId) { console.error('Usage: refresh-pricing.mjs recompute <hostId>'); process.exit(1); }
  const file = hostFile(hostId);
  let raw = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(raw);
  if (!canAutoRecompute(data.pricing)) {
    console.log(`• ${hostId}: no monthly promo — nothing to auto-recompute.`); return;
  }
  const calc = computePricingCalculated(data.pricing);
  for (const [k, v] of Object.entries(calc)) raw = setKeyInSection(raw, 'pricingCalculated', k, v).raw;
  const { hist, action } = nextHistory(data, calc, today());
  raw = upsertPriceHistory(raw, hist);
  raw = setKeyInSection(raw, 'basicInfo', 'dataLastUpdated', today()).raw;
  fs.writeFileSync(file, raw);
  console.log(`✓ ${hostId} recomputed + stamped today (history: ${action}); calc ${JSON.stringify(calc)}`);
}

function cmdCheck() {
  const files = fs.readdirSync(COMPANIES_DIR).filter((f) => f.endsWith('.json'));
  let drifted = 0;
  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(COMPANIES_DIR, f), 'utf8'));
    if (!canAutoRecompute(data.pricing)) continue; // PaaS/cloud are hand-authored
    const calc = computePricingCalculated(data.pricing);
    if (JSON.stringify(data.pricingCalculated || {}) !== JSON.stringify(calc)) {
      drifted++;
      console.log(`⚠ ${f.replace(/\.json$/, '')}: ${JSON.stringify(data.pricingCalculated)} → ${JSON.stringify(calc)}`);
    }
  }
  console.log(`\nChecked ${files.length} hosts; ${drifted} have pricingCalculated drift. (read-only)`);
}

function cmdSeedHistory() {
  const files = fs.readdirSync(COMPANIES_DIR).filter((f) => f.endsWith('.json'));
  let seeded = 0;
  for (const f of files) {
    const file = path.join(COMPANIES_DIR, f);
    let raw = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(raw);
    if (Array.isArray(data.priceHistory) && data.priceHistory.length) continue;
    const baselineDate = data.basicInfo?.dataLastUpdated || today();
    const { hist } = nextHistory(data, data.pricingCalculated, baselineDate);
    raw = upsertPriceHistory(raw, hist);
    fs.writeFileSync(file, raw);
    seeded++;
  }
  console.log(`✓ Seeded priceHistory baseline for ${seeded} hosts (dated at their existing dataLastUpdated).`);
}

function fmt(n) {
  return n === null || n === undefined ? '   —  ' : ('$' + n.toFixed(2)).padStart(7);
}

function cmdReport() {
  const files = fs.readdirSync(COMPANIES_DIR).filter((f) => f.endsWith('.json'));
  const rows = files.map((f) => {
    const d = JSON.parse(fs.readFileSync(path.join(COMPANIES_DIR, f), 'utf8'));
    const id = f.replace(/\.json$/, '');
    return {
      id,
      promo: primaryPromo(d.pricing),
      renewal: primaryRenewal(d.pricing),
      markup: d.pricingCalculated?.renewalMarkupPercent ?? null,
      updated: d.basicInfo?.dataLastUpdated || '—',
      priority: PRIORITY.indexOf(id),
    };
  });
  rows.sort((a, b) => {
    const ap = a.priority === -1 ? 999 : a.priority;
    const bp = b.priority === -1 ? 999 : b.priority;
    return ap - bp || a.id.localeCompare(b.id);
  });
  console.log('\nHOST                 PROMO    RENEWAL  MARKUP   UPDATED');
  console.log('─'.repeat(64));
  for (const r of rows) {
    const star = r.priority !== -1 ? '★' : ' ';
    const mk = r.markup === null ? '   —  ' : (r.markup.toFixed(0) + '%').padStart(6);
    console.log(`${star} ${r.id.padEnd(18)} ${fmt(r.promo)}  ${fmt(r.renewal)}  ${mk}   ${r.updated}`);
  }
  console.log(`\n★ = priority (gets search impressions — refresh first). ${rows.length} hosts total.`);
}

const cmd = process.argv[2];
if (cmd === 'report') cmdReport();
else if (cmd === 'set') cmdSet();
else if (cmd === 'recompute') cmdRecompute();
else if (cmd === 'check') cmdCheck();
else if (cmd === 'seed-history') cmdSeedHistory();
else {
  console.log('Commands:');
  console.log('  report                       monthly review table (read-only)');
  console.log('  set <hostId> <jsonPatch>     apply new prices + recompute + history + stamp today');
  console.log('  recompute <hostId>           recompute from current raw values + stamp today');
  console.log('  check                        report pricingCalculated drift (read-only)');
  console.log('  seed-history                 one-time: baseline priceHistory at existing dates');
  console.log('\nStart with: node scripts/refresh-pricing.mjs report');
}

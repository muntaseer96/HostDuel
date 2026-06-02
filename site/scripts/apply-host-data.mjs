#!/usr/bin/env node
/**
 * apply-host-data.mjs — surgical writer for the non-pricing factual layer.
 *
 * Companion to crawl-host-firecrawl.mjs. Applies a reviewed patch of
 * `section.field` → value pairs to a host JSON, then stamps
 * basicInfo.dataLastUpdated. Edits are SURGICAL (only the matched value is
 * rewritten) so Prettier formatting and every untouched line stay byte-for-byte
 * intact — clean, minimal git diffs.
 *
 * PRICING IS OUT OF SCOPE on purpose: pricing/pricingCalculated/priceHistory carry
 * derived math + history and must go through refresh-pricing.mjs. This refuses them.
 *
 * Scalar/string/boolean/null fields are written directly. ARRAY fields are NOT
 * auto-written (to avoid Prettier reflow churn) — they're reported for hand-editing.
 *
 * Usage:
 *   node scripts/apply-host-data.mjs set <hostId> '{"securitySsl.backupRetentionDays":30,"support.liveChatHours":"24/7"}'
 *       [--date=YYYY-MM-DD]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPANIES_DIR = path.join(__dirname, '..', 'src', 'data', 'companies');

const PROTECTED = new Set(['pricing', 'pricingCalculated', 'priceHistory', 'comparisonData']);

function today() {
  const arg = process.argv.find((a) => a.startsWith('--date='));
  return arg ? arg.split('=')[1] : new Date().toISOString().slice(0, 10);
}

function hostFile(hostId) {
  const file = path.join(COMPANIES_DIR, `${hostId}.json`);
  if (!fs.existsSync(file)) { console.error(`✗ No such host: ${hostId}`); process.exit(1); }
  return file;
}

const fmtVal = (v) => (v === null ? 'null' : JSON.stringify(v));

/** Bounds of a top-level section's `{ ... }` body (closes at 2-space-indent `}`). */
function sectionBounds(raw, section) {
  const start = raw.indexOf(`"${section}": {`);
  if (start < 0) return null;
  const m = /\n {2}\}/.exec(raw.slice(start));
  return m ? { start, end: start + m.index + m[0].length } : null;
}

/** Replace a scalar `"key": value` inside a section. Returns {raw, changed}. */
function setKeyInSection(raw, section, key, value) {
  const b = sectionBounds(raw, section);
  if (!b) throw new Error(`section not found: ${section}`);
  const block = raw.slice(b.start, b.end);
  const re = new RegExp(`("${key}"\\s*:\\s*)(-?\\d+(?:\\.\\d+)?|null|true|false|"(?:[^"\\\\]|\\\\.)*")`);
  const m = re.exec(block);
  if (!m) throw new Error(`scalar key not found in ${section}: ${key} (array/multiline? edit by hand)`);
  if (m[2] === fmtVal(value)) return { raw, changed: false };
  const newBlock = block.slice(0, m.index) + m[1] + fmtVal(value) + block.slice(m.index + m[0].length);
  return { raw: raw.slice(0, b.start) + newBlock + raw.slice(b.end), changed: true };
}

function cmdSet() {
  const hostId = process.argv[3];
  const patchRaw = process.argv[4];
  if (!hostId || !patchRaw) {
    console.error("Usage: apply-host-data.mjs set <hostId> '{\"section.field\":value,...}' [--date=YYYY-MM-DD]");
    process.exit(1);
  }
  let patch;
  try { patch = JSON.parse(patchRaw); } catch (e) { console.error('✗ Invalid JSON patch:', e.message); process.exit(1); }

  const file = hostFile(hostId);
  let raw = fs.readFileSync(file, 'utf8');

  let changed = 0;
  const skipped = [];
  for (const [dotKey, value] of Object.entries(patch)) {
    const [section, field] = dotKey.split('.');
    if (!section || !field) { skipped.push(`${dotKey} (use section.field)`); continue; }
    if (PROTECTED.has(section)) { skipped.push(`${dotKey} (use refresh-pricing.mjs)`); continue; }
    if (Array.isArray(value)) { skipped.push(`${dotKey} (array — edit by hand)`); continue; }
    try {
      const r = setKeyInSection(raw, section, field, value);
      raw = r.raw;
      if (r.changed) { changed++; console.log(`  ✓ ${dotKey} → ${fmtVal(value)}`); }
      else console.log(`  • ${dotKey} unchanged`);
    } catch (e) { skipped.push(`${dotKey} (${e.message})`); }
  }

  if (changed > 0) {
    raw = setKeyInSection(raw, 'basicInfo', 'dataLastUpdated', today()).raw;
    fs.writeFileSync(file, raw);
    console.log(`\n✓ ${hostId}: ${changed} field(s) written; dataLastUpdated → ${today()}`);
  } else {
    console.log(`\n• ${hostId}: nothing written.`);
  }
  if (skipped.length) {
    console.log('  skipped:');
    for (const s of skipped) console.log(`    - ${s}`);
  }
}

const cmd = process.argv[2];
if (cmd === 'set') cmdSet();
else {
  console.log('Commands:');
  console.log("  set <hostId> '{\"section.field\":value,...}'   apply reviewed factual fields + stamp today");
  console.log('\nPricing fields are refused here — use: node scripts/refresh-pricing.mjs set …');
}

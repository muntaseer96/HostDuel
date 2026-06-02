#!/usr/bin/env node
/**
 * scrape-pricing-playwright.mjs — render each host's pricing page with headless
 * Chrome (Playwright) and surface the price-bearing lines for human reading.
 *
 * Why this over Firecrawl: free, no rate limit, fully parallel, and renders JS
 * (which plain WebFetch can't). Why this over the Chrome extension: it does all
 * 56 in one batch instead of one page at a time. It does NOT parse a "final"
 * price — it extracts the visible text around plan names so a human (Claude)
 * reads the cheapest plan's promo + renewal and runs `refresh-pricing.mjs set`.
 * Accuracy stays human-gated (the "real prices" USP).
 *
 * URLs come from scripts/pricing-urls.json ({id: url}). Uses the system Chrome
 * via channel:'chrome' (no 150MB browser download).
 *
 * Usage:
 *   node scripts/scrape-pricing-playwright.mjs                 # every id in pricing-urls.json
 *   node scripts/scrape-pricing-playwright.mjs hostgator ionos # subset
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_DIR = path.join(__dirname, '..');
const COMPANIES_DIR = path.join(SITE_DIR, 'src', 'data', 'companies');
const URLS_FILE = path.join(__dirname, 'pricing-urls.json');
const OUT_FILE = path.join(__dirname, '.pricing-scrape.json');
const CONCURRENCY = 5;

const urlMap = JSON.parse(fs.readFileSync(URLS_FILE, 'utf8'));
const filter = process.argv.slice(2);
let ids = Object.keys(urlMap).filter((k) => !k.startsWith('_'));
if (filter.length) ids = ids.filter((id) => filter.includes(id));

function storedPrimary(id) {
  const p = JSON.parse(fs.readFileSync(path.join(COMPANIES_DIR, `${id}.json`), 'utf8')).pricing;
  if (p.sharedHostingMonthlyPromo != null) return { type: 'shared', promo: p.sharedHostingMonthlyPromo, renewal: p.sharedHostingMonthlyRenewal };
  if (p.vpsMonthlyLowest != null) return { type: 'vps', promo: p.vpsMonthlyLowest, renewal: p.vpsMonthlyRenewal };
  if (p.wordpressHostingMonthlyPromo != null) return { type: 'wordpress', promo: p.wordpressHostingMonthlyPromo, renewal: p.wordpressHostingMonthlyRenewal };
  if (p.cloudHostingMonthlyLowest != null) return { type: 'cloud', promo: p.cloudHostingMonthlyLowest, renewal: null };
  return { type: 'none', promo: null, renewal: null };
}

// Keep lines that carry a currency amount OR look like a plan name near prices.
const PRICE_RE = /([$€£₹]\s?\d[\d.,]*)|(\d+(?:\.\d+)?\s*(?:\/\s?mo|per month|\/month))/i;
const NOISE_RE = /cookie|privacy|newsletter|subscribe|©|copyright|terms of|sign in|log ?in/i;

async function scrapeOne(browser, id, url) {
  const stored = storedPrimary(id);
  const ctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36', viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  const res = { id, url, type: stored.type, stored: { promo: stored.promo, renewal: stored.renewal } };
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
    res.status = resp ? resp.status() : null;
    await page.waitForTimeout(3000);
    res.finalUrl = page.url();
    res.title = await page.title();
    const is404 = /404|not found|page not found/i.test(res.title);
    const body = await page.innerText('body').catch(() => '');
    const lines = body
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && l.length < 120 && PRICE_RE.test(l) && !NOISE_RE.test(l));
    // de-dup, keep order, cap
    const seen = new Set();
    res.priceLines = lines.filter((l) => (seen.has(l) ? false : (seen.add(l), true))).slice(0, 20);
    res.is404 = is404 || res.priceLines.length === 0;
  } catch (e) {
    res.error = e.message;
  } finally {
    await ctx.close();
  }
  return res;
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
console.log(`\nScraping ${ids.length} host(s) with Playwright/Chrome (concurrency ${CONCURRENCY})…\n`);

const results = [];
let i = 0;
async function worker() {
  while (i < ids.length) {
    const id = ids[i++];
    const r = await scrapeOne(browser, id, urlMap[id]);
    results.push(r);
    const tag = r.error ? '✗' : r.is404 ? '⚠' : '●';
    console.log(`${tag} ${id.padEnd(16)}${(r.type || '').padEnd(9)} stored ${r.stored.promo}/${r.stored.renewal}  → ${r.error || (r.is404 ? `NO PRICES (${r.status}) ${r.finalUrl}` : r.priceLines.slice(0, 6).join('  ·  '))}`);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
await browser.close();

results.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
fs.writeFileSync(OUT_FILE, JSON.stringify(results, null, 2));
const bad = results.filter((r) => r.error || r.is404);
console.log(`\n${results.length} scraped · ${bad.length} need URL fix: ${bad.map((r) => r.id).join(', ') || 'none'}`);
console.log(`Full price lines saved to ${path.relative(SITE_DIR, OUT_FILE)} (read it for per-host detail).\n`);

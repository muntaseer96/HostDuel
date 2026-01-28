#!/usr/bin/env node

/**
 * IndexNow submission script
 * Submits all URLs from sitemap to Bing/Yandex/etc. via IndexNow protocol
 * Run after build: npm run indexnow
 */

const SITE_URL = 'https://hostduel.com';
const INDEXNOW_KEY = '86edee65f9264974890803baeb8ace80';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

async function fetchSitemap() {
  const response = await fetch(`${SITE_URL}/sitemap.xml`);
  const xml = await response.text();

  // Extract URLs from sitemap XML
  const urls = [];
  const regex = /<loc>(.*?)<\/loc>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    urls.push(match[1]);
  }

  return urls;
}

async function submitToIndexNow(urls) {
  // IndexNow accepts up to 10,000 URLs per request
  const batchSize = 10000;
  let submitted = 0;

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);

    const payload = {
      host: 'hostduel.com',
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: batch
    };

    try {
      const response = await fetch(INDEXNOW_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok || response.status === 202) {
        submitted += batch.length;
        console.log(`[IndexNow] Submitted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} URLs (Status: ${response.status})`);
      } else {
        const text = await response.text();
        console.error(`[IndexNow] Failed batch ${Math.floor(i / batchSize) + 1}: ${response.status} - ${text}`);
      }
    } catch (error) {
      console.error(`[IndexNow] Error submitting batch:`, error.message);
    }
  }

  return submitted;
}

async function main() {
  console.log('[IndexNow] Starting URL submission...');

  try {
    const urls = await fetchSitemap();
    console.log(`[IndexNow] Found ${urls.length} URLs in sitemap`);

    if (urls.length === 0) {
      console.log('[IndexNow] No URLs to submit');
      return;
    }

    const submitted = await submitToIndexNow(urls);
    console.log(`[IndexNow] Complete! Submitted ${submitted} URLs`);
  } catch (error) {
    console.error('[IndexNow] Error:', error.message);
    // Don't fail the build on IndexNow errors
    process.exit(0);
  }
}

main();

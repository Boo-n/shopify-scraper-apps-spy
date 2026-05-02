/**
 * J1 smoke test - run the products crawler against the first N golden stores
 * (no Apify SDK, no proxy) to validate the core pipeline locally.
 *
 *   npm run smoke
 *   SMOKE_LIMIT=10 npm run smoke
 *
 * Pass criteria (J1 gate from the prompt): >=4 of 5 stores return >=1 product.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { canonicalizeStoreUrl, domainFromUrl, normalizeProduct } from '../src/lib/normalize.js';
import { scrapeProductsJson, detectShopify, fetchStoreMeta } from '../src/crawlers/products.js';
import { setDebugMode, log } from '../src/utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = resolve(__dirname, 'golden-stores.json');
const fixture = JSON.parse(readFileSync(fixturePath, 'utf-8'));

const LIMIT = parseInt(process.env.SMOKE_LIMIT || '5', 10);
const MAX_PRODUCTS = parseInt(process.env.SMOKE_MAX_PRODUCTS || '50', 10);

setDebugMode(false);

const stores = fixture.stores.slice(0, LIMIT);
const results = [];

console.log(`\n=== Smoke test: ${stores.length} stores, max ${MAX_PRODUCTS} products each ===\n`);

const overallStart = Date.now();

for (const entry of stores) {
  const startedAt = Date.now();
  let canonical;
  try {
    canonical = canonicalizeStoreUrl(entry.url);
  } catch (err) {
    results.push({ url: entry.url, ok: false, error: err.message });
    continue;
  }
  const domain = domainFromUrl(canonical);

  try {
    const detection = await detectShopify(canonical);
    if (!detection.isShopify) {
      results.push({ url: canonical, ok: false, error: 'not_shopify', signals: detection.signals });
      console.log(`  [SKIP] ${domain.padEnd(28)} not_shopify  signals=${JSON.stringify(detection.signals)}`);
      continue;
    }

    const meta = await fetchStoreMeta(canonical);

    const { products, pagesFetched, source } = await scrapeProductsJson(canonical, {
      maxProducts: MAX_PRODUCTS,
    });

    const elapsedMs = Date.now() - startedAt;

    // Normalize the first product to make sure the pipeline doesn't blow up
    let normalizedSample = null;
    if (products.length > 0) {
      normalizedSample = normalizeProduct(products[0], {
        storeUrl: canonical,
        storeDomain: domain,
        extractLevel: 'standard',
        storeMeta: meta,
      });
    }

    const ok = products.length >= 1;
    results.push({
      url: canonical,
      ok,
      productCount: products.length,
      pagesFetched,
      source,
      elapsedMs,
      currency: meta.currency,
      sampleTitle: normalizedSample?.product_title ?? null,
      samplePrice: normalizedSample?.price ?? null,
      samplePriceMin: normalizedSample?.price_min ?? null,
      samplePriceMax: normalizedSample?.price_max ?? null,
      sampleVariants: normalizedSample?.total_variant_count ?? null,
      sampleImages: normalizedSample?.image_count ?? null,
      shopifySignals: detection.signals,
    });
    console.log(`  [${ok ? 'OK' : 'FAIL'}] ${domain.padEnd(28)} ${String(products.length).padStart(4)} products  ${String(elapsedMs).padStart(5)}ms  via ${source}  meta.currency=${meta.currency || '-'}  sample="${normalizedSample?.product_title || '-'}"`);
  } catch (err) {
    results.push({ url: canonical, ok: false, error: err.message });
    console.log(`  [FAIL] ${domain.padEnd(28)} error: ${err.message}`);
  }
}

const totalMs = Date.now() - overallStart;
const successes = results.filter(r => r.ok).length;
const totalProducts = results.reduce((acc, r) => acc + (r.productCount || 0), 0);

console.log(`\n=== Summary ===`);
console.log(`Stores tested:  ${results.length}`);
console.log(`Successes:      ${successes}/${results.length}`);
console.log(`Total products: ${totalProducts}`);
console.log(`Total time:     ${totalMs}ms`);

const passes = successes >= Math.ceil(results.length * 0.8);
console.log(`\nGate (>=80% pass): ${passes ? 'PASS' : 'FAIL'}`);

process.exit(passes ? 0 : 1);

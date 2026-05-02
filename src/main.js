/**
 * Shopify Tech Stack Detector + Product Scraper - main entry point.
 *
 * Orchestration per CdC section 3.2 (extract_level):
 *   - basic    : products only
 *   - standard : products + apps detection (one apps record per store)
 *   - full     : standard + reviews (per product, named dataset 'reviews')
 *   - pro      : full + revenue estimation (J4 - placeholder for now)
 *
 * Concurrency: stores in parallel via p-queue (max_concurrent_stores).
 * Per-store flow:
 *   1. Canonicalize URL
 *   2. detectShopify (also returns home HTML + headers for downstream reuse)
 *   3. Fetch /meta.json (best-effort store metadata)
 *   4. Scrape /products.json (paginated, sitemap fallback)
 *   5. Run apps detector if extract_level >= standard
 *   6. Run reviews crawler if extract_level >= full
 *   7. Push products to default dataset (with apps_detected attached)
 *   8. Push apps record to named dataset 'apps'
 *   9. Push reviews to named dataset 'reviews'
 *
 * Pay-Per-Event billing:
 *   - actor_start charged at boot (per CdC §5.1)
 *   - store_analyzed charged after products fetch
 *   - product_extracted charged per row pushed
 *   - apps_detected charged per store at standard+
 *   - review_extracted charged per row pushed
 *   - revenue_estimated charged per store at pro
 *   - eventChargeLimitReached short-circuits the run
 *
 * Hard cap: 30 minutes wall-clock per run (CdC §6.3).
 */

import { Actor } from 'apify';
import PQueue from 'p-queue';

import { log, setDebugMode } from './utils/logger.js';
import { canonicalizeStoreUrl, domainFromUrl, normalizeProduct } from './lib/normalize.js';
import {
  scrapeProductsJson,
  detectShopify,
  fetchStoreMeta,
} from './crawlers/products.js';
import { detectApps } from './crawlers/apps.js';
import { scrapeReviewsForProducts } from './crawlers/reviews.js';
import {
  chargeStoreAnalyzed,
  chargeProductExtracted,
  chargeAppsDetected,
  chargeReviewExtracted,
  chargeRevenueEstimated,
} from './lib/billing.js';
import {
  safeValidate,
  productRowSchema,
  appsRowSchema,
  reviewRowSchema,
} from './lib/schemas.js';

const DEFAULTS = {
  extract_level: 'standard',
  max_products_per_store: 250,
  products_collection_filter: '',
  include_variants: false,
  max_reviews_per_product: 20,
  max_concurrent_stores: 3,
  max_concurrent_requests: 5,
  use_residential_proxy: false,
  debug_mode: false,
};

const LEVELS = ['basic', 'standard', 'full', 'pro'];
const MAX_RUN_DURATION_MS = 30 * 60 * 1000; // 30-minute hard cap (CdC §6.3)

function levelGte(actual, threshold) {
  return LEVELS.indexOf(actual) >= LEVELS.indexOf(threshold);
}

await Actor.init();

const runStartedAt = Date.now();
let budgetExhausted = false;

/**
 * One-stop "validate, charge, push" helper.
 * Returns { pushed: boolean, validationErrors: string[]|null, eventChargeLimitReached: boolean }
 */
async function validateChargePush({ data, schema, datasetName, eventCharger }) {
  const v = safeValidate(schema, data);
  if (!v.ok) {
    log.warn('schema_validation_failed', {
      dataset: datasetName || 'default',
      errors: v.errors.slice(0, 3),
    });
    return { pushed: false, validationErrors: v.errors, eventChargeLimitReached: false };
  }
  // Charge first - if budget is exhausted we still skip the push.
  let chargeResult = { eventChargeLimitReached: false };
  if (eventCharger) {
    chargeResult = await eventCharger();
    if (chargeResult.eventChargeLimitReached) {
      return { pushed: false, validationErrors: null, eventChargeLimitReached: true };
    }
  }
  if (datasetName) {
    const ds = await Actor.openDataset(datasetName);
    await ds.pushData(v.data);
  } else {
    await Actor.pushData(v.data);
  }
  return { pushed: true, validationErrors: null, eventChargeLimitReached: chargeResult.eventChargeLimitReached };
}

try {
  const rawInput = (await Actor.getInput()) || {};
  const input = { ...DEFAULTS, ...rawInput };
  setDebugMode(input.debug_mode);

  log.info('actor_start', {
    storeCount: input.store_urls?.length ?? 0,
    extract_level: input.extract_level,
    max_products: input.max_products_per_store,
    include_variants: input.include_variants,
    use_residential_proxy: input.use_residential_proxy,
  });

  if (!Array.isArray(input.store_urls) || input.store_urls.length === 0) {
    throw new Error('Input must include "store_urls" as a non-empty array.');
  }
  if (!LEVELS.includes(input.extract_level)) {
    throw new Error(`Invalid extract_level "${input.extract_level}". Must be one of: ${LEVELS.join(', ')}.`);
  }

  // PPE: NOTE - the synthetic 'apify-actor-start' event is auto-charged by Apify
  // itself when the run boots. Manually calling Actor.charge for it would FAIL
  // per the official docs (https://docs.apify.com/platform/actors/publishing/monetize/pay-per-event#use-synthetic-start-event-apify-actor-start).
  // Apify also covers the first 5 seconds of compute when this synthetic event
  // is enabled in Console - which is why we keep it.

  // Build proxy config - residential when explicitly requested, else datacenter auto.
  // CdC §2.4: "AUTO" is NOT a real group. Datacenter auto = no apifyProxyGroups.
  const proxyConfig = await Actor.createProxyConfiguration(
    input.use_residential_proxy
      ? { groups: ['RESIDENTIAL'] }
      : {} // datacenter auto: no groups, no countryCode forced
  );

  const storeQueue = new PQueue({ concurrency: Math.max(1, input.max_concurrent_stores) });
  const stats = {
    storesAttempted: 0,
    storesSucceeded: 0,
    storesSkippedNotShopify: 0,
    storesFailed: 0,
    productsExtracted: 0,
    productsRejectedByValidation: 0,
    appsDetectedCount: 0,
    reviewsExtracted: 0,
    reviewsRejectedByValidation: 0,
    chargeLimitReached: false,
  };

  const tasks = input.store_urls.map(storeUrlRaw => storeQueue.add(async () => {
    if (budgetExhausted) return;

    // Hard cap on wall-clock
    if (Date.now() - runStartedAt > MAX_RUN_DURATION_MS) {
      log.warn('hard_cap_30min_reached', { storeUrlRaw });
      return;
    }

    stats.storesAttempted += 1;
    let canonicalUrl;
    try {
      canonicalUrl = canonicalizeStoreUrl(storeUrlRaw);
    } catch (err) {
      log.warn('invalid_store_url', { input: storeUrlRaw, error: err.message });
      stats.storesFailed += 1;
      return;
    }
    const domain = domainFromUrl(canonicalUrl);
    const storeStartedAt = Date.now();

    try {
      const proxyUrl = proxyConfig ? await proxyConfig.newUrl(domain) : undefined;

      // 1. Detect Shopify (returns HTML + headers - reused below)
      const detection = await detectShopify(canonicalUrl, { proxyUrl });
      if (!detection.isShopify) {
        log.warn('not_a_shopify_store', { url: canonicalUrl, signals: detection.signals });
        stats.storesSkippedNotShopify += 1;
        // We DO NOT charge for skipped stores (CdC fairness rule).
        await Actor.pushData({
          store_url: canonicalUrl,
          store_domain: domain,
          error: 'not_a_shopify_store',
          signals: detection.signals,
          status_code: detection.statusCode,
          scraped_at: new Date().toISOString(),
        });
        return;
      }
      log.info('shopify_detected', { url: canonicalUrl, signals: detection.signals });

      // 2. Lightweight store meta
      const storeMeta = await fetchStoreMeta(canonicalUrl, { proxyUrl });

      // 3. Products
      const { products: rawProducts, pagesFetched, source } = await scrapeProductsJson(canonicalUrl, {
        maxProducts: input.max_products_per_store,
        collectionFilter: input.products_collection_filter,
        proxyUrl,
      });

      log.info('products_fetched', {
        store: domain,
        count: rawProducts.length,
        pages: pagesFetched,
        source,
        ms: Date.now() - storeStartedAt,
      });

      // PPE: charge "store-analyzed" only if we got at least one product.
      if (rawProducts.length > 0) {
        const r = await chargeStoreAnalyzed();
        if (r.eventChargeLimitReached) {
          budgetExhausted = true;
          stats.chargeLimitReached = true;
          log.warn('budget_exhausted_after_store_analyzed', { store: domain });
          return;
        }
      }

      // 4. Apps detection (standard+)
      let appsDetected = null;
      let pdpHtml = '';
      if (levelGte(input.extract_level, 'standard') && rawProducts.length > 0) {
        const appsResult = await detectApps(canonicalUrl, {
          homeHtml: detection.html,
          products: rawProducts,
          proxyUrl,
        });
        pdpHtml = appsResult._meta?.pdp_html || '';
        const { _meta, ...appsForRow } = appsResult;
        appsDetected = appsForRow;
        stats.appsDetectedCount += appsForRow.detected_count || 0;

        const appsRowResult = await validateChargePush({
          data: {
            store_url: canonicalUrl,
            store_domain: domain,
            myshopify_domain: storeMeta.myshopify_domain,
            detected_at: new Date().toISOString(),
            ...appsForRow,
            _meta,
          },
          schema: appsRowSchema,
          datasetName: 'apps',
          eventCharger: chargeAppsDetected,
        });
        if (appsRowResult.eventChargeLimitReached) {
          budgetExhausted = true;
          stats.chargeLimitReached = true;
          return;
        }

        log.info('apps_detected_summary', {
          store: domain,
          count: appsForRow.detected_count,
          all: appsForRow.all_apps_raw,
        });
      }

      // 5. Normalize products + push to default dataset (with charge per row)
      const normalizedProducts = rawProducts.map(raw => normalizeProduct(raw, {
        storeUrl: canonicalUrl,
        storeDomain: domain,
        extractLevel: input.extract_level,
        storeMeta,
        appsDetected,
        includeVariants: input.include_variants,
      }));

      for (const p of normalizedProducts) {
        if (budgetExhausted) break;
        const result = await validateChargePush({
          data: p,
          schema: productRowSchema,
          datasetName: null, // default dataset
          eventCharger: () => chargeProductExtracted(1),
        });
        if (result.pushed) stats.productsExtracted += 1;
        else if (result.validationErrors) stats.productsRejectedByValidation += 1;
        if (result.eventChargeLimitReached) {
          budgetExhausted = true;
          stats.chargeLimitReached = true;
          break;
        }
      }

      // 6. Reviews (full+)
      if (!budgetExhausted && levelGte(input.extract_level, 'full') && normalizedProducts.length > 0) {
        const reviews = await scrapeReviewsForProducts({
          storeUrl: canonicalUrl,
          storeDomain: domain,
          myshopifyDomain: storeMeta.myshopify_domain,
          products: normalizedProducts,
          homeHtml: detection.html,
          pdpHtml,
          detectedProviders: appsDetected?.reviews || [],
          maxReviewsPerProduct: input.max_reviews_per_product,
          maxProductsToProbe: Math.min(normalizedProducts.length, 100),
          proxyUrl,
        });

        for (const r of reviews) {
          if (budgetExhausted) break;
          const result = await validateChargePush({
            data: r,
            schema: reviewRowSchema,
            datasetName: 'reviews',
            eventCharger: () => chargeReviewExtracted(1),
          });
          if (result.pushed) stats.reviewsExtracted += 1;
          else if (result.validationErrors) stats.reviewsRejectedByValidation += 1;
          if (result.eventChargeLimitReached) {
            budgetExhausted = true;
            stats.chargeLimitReached = true;
            break;
          }
        }
      }

      // 7. Revenue estimation (pro) - J4 placeholder
      if (!budgetExhausted && input.extract_level === 'pro') {
        const r = await chargeRevenueEstimated();
        if (!r.eventChargeLimitReached) {
          const ds = await Actor.openDataset('revenue');
          await ds.pushData({
            store_url: canonicalUrl,
            store_domain: domain,
            status: 'not_implemented_yet',
            note: 'Revenue estimation lands in J4 - see CdC section 4.6.',
            estimated_at: new Date().toISOString(),
          });
        } else {
          budgetExhausted = true;
          stats.chargeLimitReached = true;
        }
      }

      stats.storesSucceeded += 1;
      log.info('store_done', {
        store: domain,
        products: normalizedProducts.length,
        apps: appsDetected?.detected_count ?? 0,
        ms: Date.now() - storeStartedAt,
      });
    } catch (err) {
      stats.storesFailed += 1;
      log.error('store_failed', {
        store: domain,
        error: err.message,
        ms: Date.now() - storeStartedAt,
      });
      // Diagnostic record for the user - never charged.
      try {
        await Actor.pushData({
          store_url: canonicalUrl,
          store_domain: domain,
          error: err.message,
          scraped_at: new Date().toISOString(),
        });
      } catch (pushErr) {
        log.error('error_record_push_failed', { error: pushErr.message });
      }
    }
  }));

  await Promise.all(tasks);
  await storeQueue.onIdle();

  log.info('actor_done', {
    ...stats,
    runDurationMs: Date.now() - runStartedAt,
  });
  await Actor.setValue('STATS', stats);
} catch (err) {
  log.error('actor_fatal', { error: err.message, stack: err.stack });
  throw err;
} finally {
  await Actor.exit();
}

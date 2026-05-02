/**
 * Reviews crawler - hits the public CDN APIs of the major Shopify review apps.
 *
 * Supported providers (in order of attempt when "reviews" is unset):
 *   1. Yotpo      - api-cdn.yotpo.com
 *   2. Judge.me   - judge.me/api/v1
 *   3. Stamped.io - stamped.io/api/widget
 *   4. Okendo     - api.okendo.io
 *   5. Loox       - loox.io/widget (best-effort, often deprecated)
 *
 * Strategy:
 *   - For Yotpo / Stamped / Okendo: extract the app key from the home + PDP HTML
 *   - For Judge.me: shop domain is enough
 *   - For each product, query the provider that the apps detector flagged
 *     OR fall back to trying providers in the order above until one returns
 *     a non-empty payload.
 *
 * The crawler returns a flat array of normalized reviews matching the schema
 * documented in CdC section 3.5. It never throws - failed providers log and
 * are skipped.
 */

/**
 * Pick products that are most likely to have user reviews.
 * Heuristics:
 *   - skip obvious bundles / kits / gift cards / "favorites" SKUs
 *   - skip products with no available variants
 *   - prefer products with multiple variants (well-stocked SKUs)
 */
const BUNDLE_KEYWORDS = /\b(bundle|kit|set|favorites?|essentials?|gift[ -]?card|sample|trial|starter|pack)\b/i;

export function pickProductsForReviewProbe(products, limit = 20) {
  const scored = (products || []).map(p => {
    const handle = String(p?.product_handle || p?.handle || '');
    const title = String(p?.product_title || p?.title || '');
    const isBundle = BUNDLE_KEYWORDS.test(handle) || BUNDLE_KEYWORDS.test(title);
    const variantCount = p?.total_variant_count ?? (Array.isArray(p?.variants) ? p.variants.length : 0);
    const available = p?.available !== false;
    return { p, isBundle, variantCount, available };
  });
  // Sort: real products with more variants first, bundles last.
  scored.sort((a, b) => {
    if (a.isBundle !== b.isBundle) return a.isBundle ? 1 : -1;
    if (a.available !== b.available) return a.available ? -1 : 1;
    return (b.variantCount || 0) - (a.variantCount || 0);
  });
  return scored.slice(0, limit).map(s => s.p);
}

import * as cheerio from 'cheerio';
import { httpGet } from '../lib/http.js';
import { log } from '../utils/logger.js';

const DEFAULT_PER_PAGE = 20;
const PROVIDER_TIMEOUT_MS = 10000;

// =====================================================================
// App-key extraction from home HTML
// =====================================================================

export function extractYotpoAppKey(html) {
  if (!html) return null;
  // Inline JS form
  const m1 = html.match(/Yotpo\.appKey\s*=\s*['"]([a-zA-Z0-9_-]+)['"]/);
  if (m1) return m1[1];
  // CDN URL form: https://staticw2.yotpo.com/{appKey}/widget.js
  const m2 = html.match(/staticw2\.yotpo\.com\/([a-zA-Z0-9_-]+)\//);
  if (m2 && m2[1] !== 'static') return m2[1];
  // data attributes form
  const m3 = html.match(/data-yotpo-app-key=['"]([a-zA-Z0-9_-]+)['"]/);
  if (m3) return m3[1];
  return null;
}

export function extractStampedApiKey(html) {
  if (!html) return null;
  const m1 = html.match(/Stamped\.apiKey\s*=\s*['"]([a-zA-Z0-9_-]+)['"]/);
  if (m1) return m1[1];
  const m2 = html.match(/data-api-key-public=['"]([a-zA-Z0-9_-]+)['"]/);
  if (m2) return m2[1];
  const m3 = html.match(/stamped[._-]?api[._-]?key['"]?\s*[:=]\s*['"]([a-zA-Z0-9_-]+)['"]/i);
  if (m3) return m3[1];
  return null;
}

export function extractOkendoSubscriberId(html) {
  if (!html) return null;
  // 1. Data attribute form on the widget div
  const m1 = html.match(/data-oke-(?:reviews-)?subscriber-id=['"]([a-zA-Z0-9-]+)['"]/);
  if (m1) return m1[1];
  // 2. JSON-embedded form (most common, e.g. inside theme settings JSON):
  //    "subscriberId":"ac20e360-32b7-413e-913c-78f3315140ab"
  const m2 = html.match(/["']?subscriberId["']?\s*[:=]\s*['"]([a-zA-Z0-9-]{20,})['"]/);
  if (m2) return m2[1];
  // 3. Inferred from a CDN URL
  const m3 = html.match(/api\.okendo\.io\/v1\/stores\/([a-zA-Z0-9-]+)\//);
  if (m3) return m3[1];
  // 4. Reviews-widget-plus URL form
  const m4 = html.match(/okendo\.io\/[^"']*subscriber=([a-zA-Z0-9-]+)/);
  if (m4) return m4[1];
  return null;
}

export function extractLooxShopId(html) {
  if (!html) return null;
  // Loox uses domain-based widget URLs: loox.io/widget/{shopDomain}/{productId}.json
  // No explicit shop ID needed - the storeDomain is used directly.
  // Some themes also embed: window.LooxReviews = {shopDomain: 'foo.myshopify.com'}
  const m = html.match(/LooxReviews[\s\S]{0,200}?shopDomain\s*[:=]\s*['"]([^'"]+)/);
  return m ? m[1] : null;
}

// =====================================================================
// Provider: Yotpo
// =====================================================================

async function fetchYotpoReviews({ appKey, productId, perPage, proxyUrl }) {
  if (!appKey || !productId) return [];
  const url = `https://api-cdn.yotpo.com/v1/widget/${encodeURIComponent(appKey)}/products/${encodeURIComponent(productId)}/reviews.json?per_page=${perPage}&page=1`;
  try {
    const { body, statusCode } = await httpGet(url, {
      responseType: 'json',
      proxyUrl,
      timeoutMs: PROVIDER_TIMEOUT_MS,
    });
    if (statusCode !== 200 || !body) return [];
    const reviews = body.response?.reviews || [];
    return reviews.map(r => normalizeYotpoReview(r));
  } catch (err) {
    log.debug('yotpo_fetch_failed', { url, error: err.message });
    return [];
  }
}

function normalizeYotpoReview(r) {
  return {
    review_id: r.id ? `yotpo_${r.id}` : null,
    provider: 'yotpo',
    rating: typeof r.score === 'number' ? r.score : null,
    title: r.title || null,
    body: r.content || r.review_content || '',
    author_name: r.user?.display_name || r.user?.user_name || r.name || null,
    author_verified: r.verified_buyer === true || r.verified === true || false,
    created_at: r.created_at || null,
    helpful_count: typeof r.votes_up === 'number' ? r.votes_up : null,
    images: Array.isArray(r.images_data)
      ? r.images_data.map(img => img.original_url || img.url).filter(Boolean)
      : [],
  };
}

// =====================================================================
// Provider: Judge.me
// =====================================================================

async function fetchJudgeMeReviews({ shopDomain, productHandle, perPage, proxyUrl }) {
  if (!shopDomain || !productHandle) return [];
  const url = `https://judge.me/api/v1/widgets/product_review?shop_domain=${encodeURIComponent(shopDomain)}&handle=${encodeURIComponent(productHandle)}&per_page=${perPage}`;
  try {
    const { body, statusCode } = await httpGet(url, {
      responseType: 'json',
      proxyUrl,
      timeoutMs: PROVIDER_TIMEOUT_MS,
    });
    if (statusCode !== 200 || !body) return [];
    const widgetHtml = body.widget || body.html || '';
    if (typeof widgetHtml !== 'string' || !widgetHtml) return [];
    return parseJudgeMeWidgetHtml(widgetHtml).slice(0, perPage);
  } catch (err) {
    log.debug('judgeme_fetch_failed', { url, error: err.message });
    return [];
  }
}

function parseJudgeMeWidgetHtml(html) {
  try {
    const $ = cheerio.load(html);
    const out = [];
    $('.jdgm-rev').each((_, el) => {
      const $el = $(el);
      const ratingAttr = $el.attr('data-rating') || $el.find('[data-score]').attr('data-score');
      const rating = ratingAttr ? parseInt(ratingAttr, 10) : null;
      const review = {
        review_id: $el.attr('data-review-id') ? `judgeme_${$el.attr('data-review-id')}` : null,
        provider: 'judgeme',
        rating,
        title: $el.find('.jdgm-rev__title').first().text().trim() || null,
        body: $el.find('.jdgm-rev__body').first().text().trim()
          || $el.find('.jdgm-rev__content').first().text().trim()
          || '',
        author_name: $el.find('.jdgm-rev__author').first().text().trim() || null,
        author_verified: $el.find('.jdgm-rev__buyer-badge').length > 0,
        created_at: $el.attr('data-published-at') || $el.find('[data-published-at]').attr('data-published-at') || null,
        helpful_count: null,
        images: $el.find('img.jdgm-rev__pic-img').map((__, img) => $(img).attr('src')).get().filter(Boolean),
      };
      out.push(review);
    });
    return out;
  } catch (err) {
    log.debug('judgeme_parse_failed', { error: err.message });
    return [];
  }
}

// =====================================================================
// Provider: Stamped.io
// =====================================================================

async function fetchStampedReviews({ apiKey, productId, storeUrl, perPage, proxyUrl }) {
  if (!apiKey || !productId || !storeUrl) return [];
  const params = new URLSearchParams({
    productid: String(productId),
    apikey: apiKey,
    storeUrl: storeUrl.replace(/^https?:\/\//, ''),
    take: String(perPage),
  });
  const url = `https://stamped.io/api/widget?${params.toString()}`;
  try {
    const { body, statusCode } = await httpGet(url, {
      responseType: 'json',
      proxyUrl,
      timeoutMs: PROVIDER_TIMEOUT_MS,
    });
    if (statusCode !== 200 || !body) return [];
    const reviews = body.data || body.reviews || [];
    return reviews.map(r => normalizeStampedReview(r));
  } catch (err) {
    log.debug('stamped_fetch_failed', { url, error: err.message });
    return [];
  }
}

function normalizeStampedReview(r) {
  return {
    review_id: r.id ? `stamped_${r.id}` : null,
    provider: 'stamped',
    rating: typeof r.reviewRating === 'number' ? r.reviewRating : (typeof r.rating === 'number' ? r.rating : null),
    title: r.reviewTitle || r.title || null,
    body: r.reviewMessage || r.body || '',
    author_name: r.author || r.reviewAuthor || null,
    author_verified: r.isVerifiedBuyer === true,
    created_at: r.dateCreated || r.created_at || null,
    helpful_count: typeof r.reviewVotesUp === 'number' ? r.reviewVotesUp : null,
    images: Array.isArray(r.reviewImages)
      ? r.reviewImages.map(img => img?.url).filter(Boolean)
      : [],
  };
}

// =====================================================================
// Provider: Okendo
// =====================================================================

async function fetchOkendoReviews({ subscriberId, productId, perPage, proxyUrl }) {
  if (!subscriberId || !productId) return [];
  // Okendo prefixes Shopify product IDs with "shopify-" in their data model.
  // Accepting either form is safe but the prefixed form returns cleaner data.
  const productRef = String(productId).startsWith('shopify-')
    ? productId
    : `shopify-${productId}`;
  const url = `https://api.okendo.io/v1/stores/${encodeURIComponent(subscriberId)}/products/${encodeURIComponent(productRef)}/reviews?take=${perPage}&skip=0&sortBy=mostRecent`;
  try {
    const { body, statusCode } = await httpGet(url, {
      responseType: 'json',
      proxyUrl,
      timeoutMs: PROVIDER_TIMEOUT_MS,
    });
    if (statusCode !== 200 || !body) return [];
    const reviews = body.reviews || body.data || [];
    return reviews.slice(0, perPage).map(r => normalizeOkendoReview(r));
  } catch (err) {
    log.debug('okendo_fetch_failed', { url, error: err.message });
    return [];
  }
}

function normalizeOkendoReview(r) {
  return {
    review_id: r.reviewId || r.id ? `okendo_${r.reviewId || r.id}` : null,
    provider: 'okendo',
    rating: typeof r.rating === 'number' ? r.rating : null,
    title: r.title || null,
    body: r.body || r.content || '',
    author_name: r.reviewer?.displayName || r.reviewer?.name || r.author || null,
    author_verified: r.isVerifiedPurchase === true,
    created_at: r.dateCreated || r.created_at || null,
    helpful_count: typeof r.helpfulCount === 'number' ? r.helpfulCount : null,
    images: Array.isArray(r.media)
      ? r.media.filter(m => m?.type === 'image').map(m => m.url || m.imageUrl).filter(Boolean)
      : [],
  };
}

// =====================================================================
// Provider: Loox (best-effort, often deprecated)
// =====================================================================

async function fetchLooxReviews({ shopDomain, productId, perPage, proxyUrl }) {
  if (!shopDomain || !productId) return [];
  const url = `https://loox.io/widget/${encodeURIComponent(shopDomain)}/${encodeURIComponent(productId)}.json`;
  try {
    const { body, statusCode } = await httpGet(url, {
      responseType: 'json',
      proxyUrl,
      timeoutMs: PROVIDER_TIMEOUT_MS,
    });
    if (statusCode !== 200 || !body) return [];
    const reviews = body.reviews || [];
    return reviews.slice(0, perPage).map(r => normalizeLooxReview(r));
  } catch (err) {
    log.debug('loox_fetch_failed', { url, error: err.message });
    return [];
  }
}

function normalizeLooxReview(r) {
  return {
    review_id: r.id ? `loox_${r.id}` : null,
    provider: 'loox',
    rating: typeof r.rating === 'number' ? r.rating : null,
    title: r.title || null,
    body: r.text || '',
    author_name: r.author || r.name || null,
    author_verified: r.verified === true,
    created_at: r.created_at || null,
    helpful_count: null,
    images: Array.isArray(r.media) ? r.media.map(m => m?.url).filter(Boolean) : [],
  };
}

// =====================================================================
// Main entry point: scrape reviews for a list of products
// =====================================================================

/**
 * @param {object} ctx
 * @param {string} ctx.storeUrl
 * @param {string} ctx.storeDomain          - store hostname (used for shop_domain queries)
 * @param {string} [ctx.myshopifyDomain]    - {shop}.myshopify.com (preferred for Judge.me + Loox)
 * @param {object[]} ctx.products           - normalized products with at least id/handle
 * @param {string} ctx.homeHtml             - home HTML for app-key extraction
 * @param {string} [ctx.pdpHtml]            - one PDP HTML, optional
 * @param {string[]} ctx.detectedProviders  - apps_detected.reviews from apps crawler
 * @param {number} [ctx.maxReviewsPerProduct=20]
 * @param {number} [ctx.maxProductsToProbe=50]   - safety cap
 * @param {string} [ctx.proxyUrl]
 * @returns {Promise<object[]>}             - flat array of reviews per CdC 3.5
 */
export async function scrapeReviewsForProducts(ctx) {
  const {
    storeUrl,
    storeDomain,
    myshopifyDomain,
    products = [],
    homeHtml = '',
    pdpHtml = '',
    detectedProviders = [],
    maxReviewsPerProduct = DEFAULT_PER_PAGE,
    maxProductsToProbe = 50,
    proxyUrl,
  } = ctx;

  if (products.length === 0) return [];

  const combinedHtml = `${homeHtml}\n${pdpHtml}`;
  const yotpoKey = extractYotpoAppKey(combinedHtml);
  const stampedKey = extractStampedApiKey(combinedHtml);
  const okendoKey = extractOkendoSubscriberId(combinedHtml);
  const shopDomainForJudgeMe = myshopifyDomain || storeDomain;
  const shopDomainForLoox = myshopifyDomain || storeDomain;

  // Decide order: providers actually detected come first.
  const allProviders = ['yotpo', 'judgeme', 'stamped', 'okendo', 'loox'];
  const detectedSet = new Set(detectedProviders || []);
  const orderedProviders = [
    ...allProviders.filter(p => detectedSet.has(p)),
    ...allProviders.filter(p => !detectedSet.has(p)),
  ];

  // Build a per-product probe plan, prioritizing real products over bundles.
  const productsToProbe = pickProductsForReviewProbe(products, maxProductsToProbe);
  const allReviews = [];

  for (const product of productsToProbe) {
    if (!product?.product_id || !product?.product_handle) continue;
    let productReviews = [];

    for (const provider of orderedProviders) {
      if (productReviews.length > 0) break; // first non-empty wins
      try {
        if (provider === 'yotpo') {
          productReviews = await fetchYotpoReviews({
            appKey: yotpoKey,
            productId: product.product_id,
            perPage: maxReviewsPerProduct,
            proxyUrl,
          });
        } else if (provider === 'judgeme') {
          productReviews = await fetchJudgeMeReviews({
            shopDomain: shopDomainForJudgeMe,
            productHandle: product.product_handle,
            perPage: maxReviewsPerProduct,
            proxyUrl,
          });
        } else if (provider === 'stamped') {
          productReviews = await fetchStampedReviews({
            apiKey: stampedKey,
            productId: product.product_id,
            storeUrl,
            perPage: maxReviewsPerProduct,
            proxyUrl,
          });
        } else if (provider === 'okendo') {
          productReviews = await fetchOkendoReviews({
            subscriberId: okendoKey,
            productId: product.product_id,
            perPage: maxReviewsPerProduct,
            proxyUrl,
          });
        } else if (provider === 'loox') {
          productReviews = await fetchLooxReviews({
            shopDomain: shopDomainForLoox,
            productId: product.product_id,
            perPage: maxReviewsPerProduct,
            proxyUrl,
          });
        }
      } catch (err) {
        log.debug('reviews_provider_error', { provider, error: err.message });
      }
    }

    // Stamp common fields onto each review for the dataset row
    for (const r of productReviews) {
      allReviews.push({
        store_domain: storeDomain,
        product_id: product.product_id,
        product_handle: product.product_handle,
        ...r,
      });
    }
  }

  log.info('reviews_summary', {
    store: storeDomain,
    products_probed: productsToProbe.length,
    reviews_total: allReviews.length,
    yotpo_key_found: !!yotpoKey,
    stamped_key_found: !!stampedKey,
  });

  return allReviews;
}

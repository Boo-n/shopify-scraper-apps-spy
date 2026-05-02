/**
 * Products crawler - hits /products.json with pagination, falls back to sitemap.
 *
 * Public Shopify endpoint:
 *   GET /products.json?limit=250&page=N
 *
 * Notes:
 *  - limit max = 250 (Shopify-hardcoded ceiling)
 *  - page starts at 1
 *  - response shape: { products: [...] }
 *  - empty array  => end of pagination
 *  - 404          => /products.json disabled (rare on Shopify Plus) -> sitemap fallback
 */

import { httpGet } from '../lib/http.js';
import { log } from '../utils/logger.js';

const PAGE_SIZE = 250;
const MAX_PAGES_HARD_CAP = 400; // 100k products ceiling - matches input schema max

/**
 * @param {string} storeUrl - canonical https://domain
 * @param {object} opts
 * @param {number} [opts.maxProducts=250]
 * @param {string} [opts.collectionFilter='']
 * @param {string} [opts.proxyUrl]
 * @returns {Promise<{ products: object[], pagesFetched: number, source: 'products_json'|'sitemap' }>}
 */
export async function scrapeProductsJson(storeUrl, opts = {}) {
  const {
    maxProducts = 250,
    collectionFilter = '',
    proxyUrl,
  } = opts;

  const baseUrl = collectionFilter
    ? `${storeUrl}/collections/${encodeURIComponent(collectionFilter)}/products.json`
    : `${storeUrl}/products.json`;

  const products = [];
  let page = 1;
  let pagesFetched = 0;
  const unlimited = maxProducts === 0;

  while (unlimited || products.length < maxProducts) {
    if (page > MAX_PAGES_HARD_CAP) {
      log.warn('products_json_hard_cap', { storeUrl, page });
      break;
    }
    const url = `${baseUrl}?limit=${PAGE_SIZE}&page=${page}`;
    const { body, statusCode } = await httpGet(url, { responseType: 'json', proxyUrl });
    pagesFetched += 1;

    if (statusCode === 404) {
      // Endpoint disabled on this store - fall back to sitemap
      log.info('products_json_404_falling_back_to_sitemap', { storeUrl });
      const fallback = await fallbackToSitemap(storeUrl, { maxProducts, proxyUrl });
      return { ...fallback, source: 'sitemap' };
    }
    if (statusCode !== 200) {
      log.warn('products_json_unexpected_status', { storeUrl, page, statusCode });
      break;
    }
    if (!body || !Array.isArray(body.products)) {
      log.warn('products_json_unexpected_payload', { storeUrl, page });
      break;
    }
    if (body.products.length === 0) {
      // Last page already consumed
      break;
    }

    products.push(...body.products);
    if (body.products.length < PAGE_SIZE) {
      // Last (partial) page - no need to ask for the next
      break;
    }
    page += 1;
  }

  const sliced = (!unlimited && products.length > maxProducts)
    ? products.slice(0, maxProducts)
    : products;

  return {
    products: sliced,
    pagesFetched,
    source: 'products_json',
  };
}

/**
 * Fallback when /products.json returns 404.
 * Reads sitemap_products_1.xml, then fetches each product as /products/{handle}.json.
 */
export async function fallbackToSitemap(storeUrl, opts = {}) {
  const { maxProducts = 250, proxyUrl } = opts;
  const sitemapUrl = `${storeUrl}/sitemap_products_1.xml`;

  const { body: xml, statusCode } = await httpGet(sitemapUrl, { responseType: 'text', proxyUrl });
  if (statusCode !== 200 || typeof xml !== 'string') {
    log.warn('sitemap_unavailable', { sitemapUrl, statusCode });
    return { products: [], pagesFetched: 1, source: 'sitemap' };
  }

  const productUrls = [...xml.matchAll(/<loc>([^<]+\/products\/[^<]+)<\/loc>/g)]
    .map(m => m[1])
    // Drop image-loc nested entries that some Shopify sitemaps include
    .filter(u => !u.includes('/products/') || !u.endsWith('.jpg') && !u.endsWith('.png'));

  const cap = maxProducts === 0 ? productUrls.length : Math.min(productUrls.length, maxProducts);
  const products = [];

  for (const url of productUrls.slice(0, cap)) {
    try {
      const { body, statusCode: sc } = await httpGet(`${url}.json`, { responseType: 'json', proxyUrl });
      if (sc === 200 && body?.product) products.push(body.product);
    } catch (err) {
      log.debug('sitemap_product_fetch_failed', { url, error: err.message });
    }
  }

  return { products, pagesFetched: 1 + products.length, source: 'sitemap' };
}

/**
 * Detect whether a URL points to a Shopify storefront.
 *
 * Returns the raw home HTML + headers along with the detection result so
 * downstream crawlers (apps detection, review-key extraction) can reuse them
 * instead of issuing another GET on the same page.
 *
 * @returns {Promise<{
 *   isShopify: boolean,
 *   signals: string[],
 *   html: string,        // empty string if fetch failed
 *   headers: object,     // empty object if fetch failed
 *   statusCode: number|null,
 * }>}
 */
export async function detectShopify(storeUrl, opts = {}) {
  const { proxyUrl } = opts;
  const signals = [];
  try {
    const { body, headers, statusCode } = await httpGet(storeUrl, { responseType: 'text', proxyUrl });
    if (statusCode >= 400) {
      return {
        isShopify: false,
        signals: [`status_${statusCode}`],
        html: typeof body === 'string' ? body : '',
        headers: headers || {},
        statusCode,
      };
    }
    if (headers['x-shopid']) signals.push('header_x_shopid');
    if (headers['x-shopify-stage']) signals.push('header_x_shopify_stage');
    if (headers['x-shopify-shop-id']) signals.push('header_x_shopify_shop_id');
    if (headers['powered-by']?.toString?.().toLowerCase?.().includes('shopify')) signals.push('header_powered_by');
    const html = typeof body === 'string' ? body : '';
    if (html) {
      if (html.includes('cdn.shopify.com')) signals.push('html_cdn_shopify');
      if (/Shopify\.shop\s*=/.test(html)) signals.push('html_shopify_shop_var');
      if (/Shopify\.theme\s*=/.test(html)) signals.push('html_shopify_theme_var');
      if (html.includes('"@type":"Product"') && html.includes('shopify')) signals.push('html_jsonld_shopify');
    }
    return {
      isShopify: signals.length > 0,
      signals,
      html,
      headers: headers || {},
      statusCode,
    };
  } catch (err) {
    log.warn('detect_shopify_error', { storeUrl, error: err.message });
    return {
      isShopify: false,
      signals: [`error_${err.code || 'unknown'}`],
      html: '',
      headers: {},
      statusCode: null,
    };
  }
}

/**
 * Lightweight store meta - currency, name. Pulled from /meta.json which Shopify
 * exposes publicly on most stores. No-throw: returns nulls on failure.
 */
export async function fetchStoreMeta(storeUrl, opts = {}) {
  const { proxyUrl } = opts;
  const out = {
    name: null,
    currency: null,
    country: null,
    shopify_plus: null,
    myshopify_domain: null,
    total_products: null,
    collections: [],
  };
  try {
    const { body, statusCode } = await httpGet(`${storeUrl}/meta.json`, { responseType: 'json', proxyUrl });
    if (statusCode === 200 && body) {
      out.name = body.name || null;
      out.currency = body.currency || null;
      out.country = body.country_code || body.country || null;
      out.myshopify_domain = body.myshopify_domain || null;
    }
  } catch {
    // /meta.json is best-effort - silent fallback
  }
  return out;
}

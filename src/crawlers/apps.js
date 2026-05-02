/**
 * Apps crawler - detects the tech stack of a Shopify store.
 *
 * Strategy:
 *   1. Fetch the home page HTML.
 *   2. Fetch one PDP HTML (for apps that only inject on /products/* pages,
 *      e.g. Recharge subscription widgets, review carousels).
 *   3. Run regex patterns from app-patterns.js against the concatenated HTML.
 *   4. Surface the result by category (reviews, email_marketing, ...) plus
 *      a flat list of every detected app.
 *
 * Cost: 2 GET requests per store, ~600 KB-1 MB of HTML. Sub-2s in practice.
 *
 * The function never throws - on any HTTP failure it returns a partial
 * detection (using whatever HTML it managed to grab) with an `errors` field.
 */

import { httpGet } from '../lib/http.js';
import { detectAppsInHtml } from '../lib/app-patterns.js';
import { log } from '../utils/logger.js';

/**
 * Pick a "good" product handle to fetch as PDP - prefer one that is in stock,
 * has variants, and is a real product (not a gift card). Falls back to first.
 */
function pickPdpHandle(products) {
  if (!Array.isArray(products) || products.length === 0) return null;
  const inStockNonGiftCard = products.find(p =>
    p?.handle &&
    !/gift[-_ ]?card/i.test(p.handle) &&
    !/gift[-_ ]?card/i.test(p.title || '') &&
    Array.isArray(p.variants) && p.variants.some(v => v.available === true)
  );
  if (inStockNonGiftCard?.handle) return inStockNonGiftCard.handle;
  const anyNonGiftCard = products.find(p =>
    p?.handle && !/gift[-_ ]?card/i.test(p.handle)
  );
  return anyNonGiftCard?.handle || products[0]?.handle || null;
}

/**
 * @param {string} storeUrl - canonical https://domain
 * @param {object} opts
 * @param {string}   [opts.homeHtml]      - pre-fetched home HTML (skips a GET if provided)
 * @param {object[]} [opts.products]      - products array (used to pick a PDP handle)
 * @param {string}   [opts.proxyUrl]
 * @param {boolean}  [opts.skipPdp=false] - skip the PDP fetch (faster but worse coverage)
 * @returns {Promise<{
 *   reviews: string[]|null, email_marketing: string[]|null, popups: string[]|null,
 *   subscriptions: string[]|null, loyalty: string[]|null, live_chat: string[]|null,
 *   search: string[]|null, page_builder: string[]|null, currency_converter: string[]|null,
 *   upsell: string[]|null, analytics: string[]|null,
 *   all_apps_raw: string[], detected_count: number,
 *   _meta: { home_status: number|null, pdp_status: number|null, pdp_handle: string|null, pdp_html: string, errors: string[] }
 * }>}
 */
export async function detectApps(storeUrl, opts = {}) {
  const { homeHtml: preFetchedHome, products = [], proxyUrl, skipPdp = false } = opts;
  const errors = [];

  // 1. Home page HTML - use pre-fetched if caller already has it
  let homeHtml = preFetchedHome || '';
  let homeStatus = preFetchedHome ? 200 : null;
  if (!homeHtml) {
    try {
      const { body, statusCode } = await httpGet(storeUrl, { responseType: 'text', proxyUrl });
      homeStatus = statusCode;
      if (statusCode === 200 && typeof body === 'string') {
        homeHtml = body;
      } else {
        errors.push(`home_status_${statusCode}`);
      }
    } catch (err) {
      errors.push(`home_error_${err.code || 'unknown'}`);
      log.warn('apps_home_fetch_failed', { storeUrl, error: err.message });
    }
  }

  // 2. PDP HTML (best-effort)
  let pdpHtml = '';
  let pdpStatus = null;
  let pdpHandle = null;
  if (!skipPdp) {
    pdpHandle = pickPdpHandle(products);
    if (pdpHandle) {
      try {
        const { body, statusCode } = await httpGet(`${storeUrl}/products/${pdpHandle}`, {
          responseType: 'text',
          proxyUrl,
        });
        pdpStatus = statusCode;
        if (statusCode === 200 && typeof body === 'string') {
          pdpHtml = body;
        } else {
          errors.push(`pdp_status_${statusCode}`);
        }
      } catch (err) {
        errors.push(`pdp_error_${err.code || 'unknown'}`);
        log.warn('apps_pdp_fetch_failed', { storeUrl, pdpHandle, error: err.message });
      }
    }
  }

  // 3. Regex match against home + PDP
  const result = detectAppsInHtml(homeHtml, pdpHtml) || {
    reviews: null, email_marketing: null, popups: null, subscriptions: null,
    loyalty: null, live_chat: null, search: null, page_builder: null,
    currency_converter: null, upsell: null, analytics: null,
    all_apps_raw: [], detected_count: 0,
  };

  return {
    ...result,
    _meta: {
      home_status: homeStatus,
      pdp_status: pdpStatus,
      pdp_handle: pdpHandle,
      pdp_html: pdpHtml, // expose so callers (reviews crawler) can reuse it
      errors,
    },
  };
}

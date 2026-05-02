/**
 * URL canonicalization + Shopify product normalization.
 *
 * Goal: convert any user-provided store URL into a canonical "https://domain"
 * form (no trailing slash, no path), and turn Shopify's raw /products.json
 * response into the unified output schema described in CdC section 3.4.
 */

/**
 * Canonicalize a store URL.
 *  - "allbirds.com"          -> "https://allbirds.com"
 *  - "https://allbirds.com/" -> "https://allbirds.com"
 *  - "https://allbirds.com/collections/men/" -> "https://allbirds.com"
 */
export function canonicalizeStoreUrl(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('Store URL must be a non-empty string');
  }
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid store URL: ${input}`);
  }
  // Force https
  parsed.protocol = 'https:';
  // Strip path / query / hash - keep only origin
  return `${parsed.protocol}//${parsed.host}`;
}

export function domainFromUrl(url) {
  try {
    return new URL(url).host;
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0];
  }
}

/**
 * Strip HTML tags from a body_html string for description_text.
 * Keeps it minimal - cheerio is overkill for a one-time strip.
 */
function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Compute a single price summary from variants.
 * /products.json variants always carry `price` as a string in the store currency.
 */
function summarizePrice(variants) {
  const prices = (variants || [])
    .map(v => parseFloat(v.price))
    .filter(p => !isNaN(p));
  if (prices.length === 0) {
    return { price: null, price_min: null, price_max: null };
  }
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { price: min, price_min: min, price_max: max };
}

function summarizeCompareAt(variants) {
  const compareAts = (variants || [])
    .map(v => v.compare_at_price ? parseFloat(v.compare_at_price) : null)
    .filter(p => p !== null && !isNaN(p));
  if (compareAts.length === 0) return null;
  return Math.max(...compareAts);
}

function countAvailableVariants(variants) {
  return (variants || []).filter(v => v.available === true).length;
}

/**
 * Normalize a single Shopify product (as returned by /products.json) into
 * the unified output schema (CdC 3.4).
 *
 * @param {object} raw - raw product object from Shopify
 * @param {object} ctx - context with storeUrl, storeDomain, extractLevel
 */
export function normalizeProduct(raw, ctx) {
  const {
    storeUrl,
    storeDomain,
    extractLevel = 'standard',
    storeMeta = {},
    appsDetected = null,
    includeVariants = false,
  } = ctx;

  const variants = raw.variants || [];
  const { price, price_min, price_max } = summarizePrice(variants);
  const compareAt = summarizeCompareAt(variants);
  const productUrl = `${storeUrl}/products/${raw.handle}`;
  const images = (raw.images || []).map(img => img.src).filter(Boolean);
  const mainImage = raw.image?.src || images[0] || null;

  const out = {
    // Provenance
    store_url: storeUrl,
    store_domain: storeDomain,
    store_platform: 'shopify',
    scraped_at: new Date().toISOString(),
    extract_level: extractLevel,

    // Product
    product_id: raw.id,
    product_handle: raw.handle,
    product_title: raw.title,
    product_url: productUrl,
    product_type: raw.product_type || null,
    vendor: raw.vendor || null,
    tags: Array.isArray(raw.tags) ? raw.tags : (typeof raw.tags === 'string' ? raw.tags.split(',').map(t => t.trim()).filter(Boolean) : []),
    description_html: raw.body_html || '',
    description_text: stripHtml(raw.body_html || ''),
    created_at: raw.created_at || null,
    updated_at: raw.updated_at || null,
    published_at: raw.published_at || null,

    // Pricing
    price,
    price_min,
    price_max,
    compare_at_price: compareAt,
    currency: storeMeta.currency || null,
    available: variants.some(v => v.available === true),
    available_variant_count: countAvailableVariants(variants),
    total_variant_count: variants.length,

    // Variants - full payload only when caller asked
    variants: includeVariants ? variants.map(normalizeVariant) : undefined,

    // Images
    images,
    main_image: mainImage,
    image_count: images.length,

    // Scarcity (filled later from PDP if requested - placeholder for now)
    scarcity_signals: {
      low_stock_message: null,
      in_stock_count: null,
      viewing_now_widget: false,
      recent_purchases: false,
    },

    // Store meta - duplicated on each row for easier dataset filtering
    store_meta: storeMeta,

    // Apps - filled by apps crawler on later phases
    apps_detected: appsDetected,
  };

  // Strip undefined keys so the output stays clean
  Object.keys(out).forEach(k => out[k] === undefined && delete out[k]);
  return out;
}

export function normalizeVariant(v) {
  return {
    id: v.id,
    title: v.title,
    sku: v.sku || null,
    price: v.price ? parseFloat(v.price) : null,
    compare_at_price: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
    available: v.available === true,
    option1: v.option1 || null,
    option2: v.option2 || null,
    option3: v.option3 || null,
    grams: v.grams || null,
    requires_shipping: v.requires_shipping !== false,
    taxable: v.taxable !== false,
    featured_image: v.featured_image?.src || null,
  };
}

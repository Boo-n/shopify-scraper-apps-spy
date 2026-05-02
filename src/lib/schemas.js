/**
 * Zod schemas for output validation.
 *
 * Used to guard the dataset from corrupt rows. The orchestrator validates
 * with `safeParse` and skips (with a warning) any row that fails - never
 * pushing invalid data into the dataset.
 *
 * The schemas are intentionally LAX where Shopify's own data is messy:
 *   - prices may be null on draft products
 *   - tags can be array OR comma-separated string
 *   - description_html can be empty
 *
 * They are STRICT on identity fields (store_url, product_id, product_handle)
 * because those are what consumers will join on.
 */

import { z } from 'zod';

// =====================================================================
// Helpers
// =====================================================================

const isoDateOrNull = z.string().nullable().optional();
const numberOrNull = z.number().nullable().optional();
const stringOrNull = z.string().nullable().optional();
const stringArray = z.array(z.string());

// =====================================================================
// Apps detection
// =====================================================================

export const appsDetectedSchema = z.object({
  reviews: stringArray.nullable().optional(),
  email_marketing: stringArray.nullable().optional(),
  popups: stringArray.nullable().optional(),
  subscriptions: stringArray.nullable().optional(),
  loyalty: stringArray.nullable().optional(),
  live_chat: stringArray.nullable().optional(),
  search: stringArray.nullable().optional(),
  page_builder: stringArray.nullable().optional(),
  currency_converter: stringArray.nullable().optional(),
  upsell: stringArray.nullable().optional(),
  analytics: stringArray.nullable().optional(),
  all_apps_raw: stringArray,
  detected_count: z.number().int().nonnegative(),
}).nullable();

// =====================================================================
// Store metadata
// =====================================================================

export const storeMetaSchema = z.object({
  name: stringOrNull,
  currency: stringOrNull,
  country: stringOrNull,
  shopify_plus: z.boolean().nullable().optional(),
  myshopify_domain: stringOrNull,
  total_products: numberOrNull,
  collections: stringArray.optional(),
}).passthrough();

// =====================================================================
// Variant
// =====================================================================

export const variantSchema = z.object({
  id: z.union([z.number(), z.string()]),
  title: z.string().optional(),
  sku: stringOrNull,
  price: numberOrNull,
  compare_at_price: numberOrNull,
  available: z.boolean().optional(),
  option1: stringOrNull,
  option2: stringOrNull,
  option3: stringOrNull,
  grams: z.number().nullable().optional(),
  requires_shipping: z.boolean().optional(),
  taxable: z.boolean().optional(),
  featured_image: stringOrNull,
}).passthrough();

// =====================================================================
// Product (default dataset row)
// =====================================================================

export const productRowSchema = z.object({
  // Provenance
  store_url: z.string().url(),
  store_domain: z.string().min(1),
  store_platform: z.literal('shopify'),
  scraped_at: z.string(),
  extract_level: z.enum(['basic', 'standard', 'full', 'pro']),

  // Product
  product_id: z.union([z.number(), z.string()]),
  product_handle: z.string().min(1),
  product_title: z.string(),
  product_url: z.string().url(),
  product_type: stringOrNull,
  vendor: stringOrNull,
  tags: stringArray,
  description_html: z.string(),
  description_text: z.string(),
  created_at: isoDateOrNull,
  updated_at: isoDateOrNull,
  published_at: isoDateOrNull,

  // Pricing
  price: numberOrNull,
  price_min: numberOrNull,
  price_max: numberOrNull,
  compare_at_price: numberOrNull,
  currency: stringOrNull,
  available: z.boolean(),
  available_variant_count: z.number().int().nonnegative(),
  total_variant_count: z.number().int().nonnegative(),

  // Variants (optional)
  variants: z.array(variantSchema).optional(),

  // Images
  images: stringArray,
  main_image: stringOrNull,
  image_count: z.number().int().nonnegative(),

  // Scarcity
  scarcity_signals: z.object({
    low_stock_message: stringOrNull,
    in_stock_count: numberOrNull,
    viewing_now_widget: z.boolean(),
    recent_purchases: z.boolean(),
  }),

  store_meta: storeMetaSchema,
  apps_detected: appsDetectedSchema,
}).passthrough();

// =====================================================================
// Apps row (named dataset 'apps')
// =====================================================================

export const appsRowSchema = z.object({
  store_url: z.string().url(),
  store_domain: z.string(),
  myshopify_domain: stringOrNull,
  detected_at: z.string(),
  reviews: stringArray.nullable().optional(),
  email_marketing: stringArray.nullable().optional(),
  popups: stringArray.nullable().optional(),
  subscriptions: stringArray.nullable().optional(),
  loyalty: stringArray.nullable().optional(),
  live_chat: stringArray.nullable().optional(),
  search: stringArray.nullable().optional(),
  page_builder: stringArray.nullable().optional(),
  currency_converter: stringArray.nullable().optional(),
  upsell: stringArray.nullable().optional(),
  analytics: stringArray.nullable().optional(),
  all_apps_raw: stringArray,
  detected_count: z.number().int().nonnegative(),
  _meta: z.any().optional(),
}).passthrough();

// =====================================================================
// Review row (named dataset 'reviews')
// =====================================================================

export const reviewRowSchema = z.object({
  store_domain: z.string(),
  product_id: z.union([z.number(), z.string()]),
  product_handle: z.string(),
  review_id: stringOrNull,
  provider: z.enum(['yotpo', 'judgeme', 'stamped', 'okendo', 'loox', 'shopify_native']),
  rating: numberOrNull,
  title: stringOrNull,
  body: z.string(),
  author_name: stringOrNull,
  author_verified: z.boolean(),
  created_at: stringOrNull,
  helpful_count: numberOrNull,
  images: stringArray,
}).passthrough();

// =====================================================================
// Helpers for safe-validate-and-push
// =====================================================================

/**
 * Validate `data` against `schema`. Returns:
 *   { ok: true, data: parsed }   or   { ok: false, errors: string[] }
 *
 * Never throws.
 */
export function safeValidate(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) return { ok: true, data: result.data };
  const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
  return { ok: false, errors };
}

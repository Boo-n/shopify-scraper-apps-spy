#!/usr/bin/env node
/**
 * 02 — B2B ICP qualification.
 *
 * Take a list of 1,200 prospect Shopify stores. Filter to the ~200 that match
 * a tech-stack signal (here: Klaviyo + a paid reviews app). Save the qualified
 * list as CSV ready for outbound.
 *
 * Cost: ~$6 (1,200 stores × $0.005 standard tier).
 * Time: ~25 minutes for the full scan.
 *
 * Usage:
 *   APIFY_TOKEN=apify_api_xxx node 02-icp-qualification.mjs prospects.txt > tier1.csv
 */

import fs from "node:fs/promises";

const TOKEN = process.env.APIFY_TOKEN;
if (!TOKEN) {
  console.error("APIFY_TOKEN env var required");
  process.exit(1);
}

const inputFile = process.argv[2] ?? "prospects.txt";
const lines = (await fs.readFile(inputFile, "utf8")).split("\n");
const storeUrls = lines.map((l) => l.trim()).filter(Boolean);

console.error(`Scanning ${storeUrls.length} stores at standard tier...`);

const ACTOR = "kazkn~shopify-scraper-apps-spy";
const res = await fetch(
  `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?token=${TOKEN}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      store_urls: storeUrls,
      extract_level: "standard",
      // For ICP we only need the apps stack, not the full catalog
      max_products_per_store: 1,
    }),
  },
);

if (!res.ok) {
  console.error(`Apify error: ${res.status} ${await res.text()}`);
  process.exit(1);
}

const rows = await res.json();

// One row per product, but apps_detected lives at the store level — collapse
// to one row per store.
const byStore = new Map();
for (const r of rows) {
  if (!byStore.has(r.store_domain)) byStore.set(r.store_domain, r);
}

const PAID_REVIEWS = new Set([
  "Yotpo",
  "Yotpo Premium",
  "Stamped",
  "Stamped Pro",
  "Okendo",
  "Judge.me Premium",
  "Reviews.io",
  "Loox",
  "Junip",
]);

const isTier1 = (record) => {
  const email = record.apps_detected?.email ?? [];
  const reviews = record.apps_detected?.reviews ?? [];
  const hasKlaviyo = email.includes("Klaviyo");
  const hasPaidReviews = reviews.some((app) => PAID_REVIEWS.has(app));
  return hasKlaviyo && hasPaidReviews;
};

const tier1 = [...byStore.values()].filter(isTier1);

console.error(
  `Tier-1 ICP matches: ${tier1.length}/${byStore.size} (${(
    (tier1.length / byStore.size) *
    100
  ).toFixed(1)}%)`,
);

// CSV out
console.log("store_domain,email_app,reviews_app,subscriptions_app,country");
for (const r of tier1) {
  const email = r.apps_detected.email[0] ?? "";
  const reviews = r.apps_detected.reviews[0] ?? "";
  const subs = r.apps_detected.subscriptions?.[0] ?? "";
  const country = r.store_meta?.country ?? "";
  console.log(`${r.store_domain},${email},${reviews},${subs},${country}`);
}

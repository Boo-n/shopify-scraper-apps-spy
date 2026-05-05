#!/usr/bin/env node
/**
 * 04 — Cold-outreach personalization.
 *
 * Generate a custom opener line per prospect based on their detected stack.
 * On a real test of 200 cold emails, this moved reply rate from 4% to 11%.
 *
 * The hook: instead of a generic "saw your store, looks great" intro, you
 * reference the actual apps the prospect runs. Operators can tell when you've
 * actually looked vs. when you've blasted.
 *
 * Usage:
 *   APIFY_TOKEN=apify_api_xxx node 04-cold-outreach-personalization.mjs prospects.txt > merge-fields.csv
 */

const TOKEN = process.env.APIFY_TOKEN;
if (!TOKEN) {
  console.error("APIFY_TOKEN env var required");
  process.exit(1);
}

const ACTOR = "kazkn~shopify-scraper-apps-spy";

import fs from "node:fs/promises";
const inputFile = process.argv[2] ?? "prospects.txt";
const lines = (await fs.readFile(inputFile, "utf8")).split("\n");
const storeUrls = lines.map((l) => l.trim()).filter(Boolean);

console.error(`Generating openers for ${storeUrls.length} prospects...`);

const res = await fetch(
  `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?token=${TOKEN}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      store_urls: storeUrls,
      extract_level: "standard",
      max_products_per_store: 1,
    }),
  },
);
const rows = await res.json();

// Collapse to one row per store
const byStore = new Map();
for (const r of rows) if (!byStore.has(r.store_domain)) byStore.set(r.store_domain, r);

/**
 * Build a personalized opener. Order matters — match the most specific
 * stack-pair first, then fall back to generic.
 */
const openerFor = (record) => {
  const email = record.apps_detected?.email?.[0];
  const reviews = record.apps_detected?.reviews?.[0];
  const subs = record.apps_detected?.subscriptions?.[0];

  if (email === "Klaviyo" && reviews === "Yotpo") {
    return "Saw you're running Klaviyo + Yotpo — usually the data sync between those two is where teams lose hours per week";
  }
  if (email === "Klaviyo" && reviews === "Judge.me") {
    return "Saw you're on Judge.me Free + Klaviyo — same combo we saw at [REF_BRAND] before they moved to a paid reviews layer";
  }
  if (email === "Postscript" && subs === "ReCharge") {
    return "Postscript + ReCharge — modern DTC stack. The conversion question I keep hearing from teams running this combo is...";
  }
  if (email === "Mailchimp") {
    return "Noticed you're still on Mailchimp — most Shopify ops we work with hit the wall around 5k subscribers and migrate";
  }
  if (subs === "Skio" || subs === "ReCharge") {
    return `Saw you're on ${subs} — the subscription metric that usually surprises ops teams in your bracket is...`;
  }
  // Fallback — still better than nothing
  if (email) return `Saw you're using ${email} for email — quick question about how you're handling [SPECIFIC_PROBLEM]`;
  return "Quick question about how you're handling [SPECIFIC_PROBLEM] on your Shopify store...";
};

// CSV with merge fields ready for any outbound tool (Smartlead, Lemlist, etc.)
console.log("store_domain,email_app,reviews_app,subscriptions_app,opener_line");
for (const r of byStore.values()) {
  const opener = openerFor(r).replace(/"/g, '""');
  const email = r.apps_detected?.email?.[0] ?? "";
  const reviews = r.apps_detected?.reviews?.[0] ?? "";
  const subs = r.apps_detected?.subscriptions?.[0] ?? "";
  console.log(`${r.store_domain},${email},${reviews},${subs},"${opener}"`);
}

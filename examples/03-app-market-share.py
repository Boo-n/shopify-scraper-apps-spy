#!/usr/bin/env python3
"""
03 — App market-share research.

Aggregate app adoption across thousands of Shopify stores. Output: how many
stores use Klaviyo vs Mailchimp, Yotpo vs Judge.me, etc. The kind of data
BuiltWith charges $295/month for; here it's $25 per refresh at standard tier.

Cost: ~$25 per 5,000-store scan.
Usage:
    APIFY_TOKEN=apify_api_xxx python 03-app-market-share.py stores.txt
"""

import json
import os
import sys
import urllib.request
from collections import Counter

TOKEN = os.environ.get("APIFY_TOKEN")
if not TOKEN:
    print("APIFY_TOKEN env var required", file=sys.stderr)
    sys.exit(1)

ACTOR = "kazkn~shopify-scraper-apps-spy"

input_file = sys.argv[1] if len(sys.argv) > 1 else "stores.txt"
with open(input_file) as f:
    store_urls = [line.strip() for line in f if line.strip()]

print(f"Scanning {len(store_urls)} stores...", file=sys.stderr)

payload = json.dumps({
    "store_urls": store_urls,
    "extract_level": "standard",
    "max_products_per_store": 1,
}).encode()

req = urllib.request.Request(
    f"https://api.apify.com/v2/acts/{ACTOR}/run-sync-get-dataset-items?token={TOKEN}",
    data=payload,
    headers={"Content-Type": "application/json"},
)

with urllib.request.urlopen(req) as resp:
    rows = json.loads(resp.read())

# Collapse to one row per store (apps_detected is store-level metadata)
by_store: dict[str, dict] = {}
for r in rows:
    by_store.setdefault(r["store_domain"], r)

total_stores = len(by_store)
print(f"\n=== App market share across {total_stores} Shopify stores ===\n")

CATEGORIES = ["email", "reviews", "subscriptions", "popups", "search", "loyalty"]

for cat in CATEGORIES:
    counter: Counter[str] = Counter()
    for r in by_store.values():
        for app in r.get("apps_detected", {}).get(cat, []):
            counter[app] += 1

    if not counter:
        continue

    print(f"\n— {cat.upper()} —")
    for app, count in counter.most_common(8):
        pct = (count / total_stores) * 100
        bar = "█" * int(pct / 2)
        print(f"  {app:<25} {count:>5} ({pct:>5.1f}%) {bar}")

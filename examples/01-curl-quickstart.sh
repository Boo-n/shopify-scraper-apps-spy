#!/usr/bin/env bash
# 01 — One curl call: scrape 3 Shopify stores, get apps + products back as JSON.
#
# Usage:
#   APIFY_TOKEN=apify_api_xxx ./01-curl-quickstart.sh
#   APIFY_TOKEN=apify_api_xxx ./01-curl-quickstart.sh > out.json
#
# Cost: ~$0.015 (3 stores × $0.005 standard tier).
# Time: ~5 seconds end-to-end.

set -euo pipefail

if [[ -z "${APIFY_TOKEN:-}" ]]; then
  echo "Error: APIFY_TOKEN env var not set" >&2
  echo "Get one at https://console.apify.com/settings/integrations" >&2
  exit 1
fi

ACTOR="kazkn~shopify-scraper-apps-spy"

# run-sync-get-dataset-items returns the dataset rows in the response body
# instead of you having to poll for the run to finish — perfect for one-shot
# scripts.
curl -fsS -X POST \
  "https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?token=${APIFY_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "store_urls": [
      "https://allbirds.com",
      "https://gymshark.com",
      "https://manukora.com"
    ],
    "extract_level": "standard",
    "max_products_per_store": 50
  }'

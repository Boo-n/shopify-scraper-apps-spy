# 05 — Trigger from Zapier / Make.com (no code)

The actor exposes Apify's standard REST API, which means **any** automation platform that can call HTTP can trigger it without code.

## Zapier (3-step zap)

1. **Trigger**: any Zapier trigger (new row in a Google Sheet, new email, new HubSpot contact, etc.)
2. **Action — Apify › Run Actor**:
   - Actor: `kazkn/shopify-scraper-apps-spy`
   - Input (JSON):
     ```json
     {
       "store_urls": ["{{trigger.shopify_url}}"],
       "extract_level": "standard"
     }
     ```
3. **Action — Webhooks by Zapier › Custom Request** (optional, if you want the dataset back in the same zap):
   - Method: GET
   - URL: `https://api.apify.com/v2/acts/kazkn~shopify-scraper-apps-spy/runs/{{step2.id}}/dataset/items`
   - Headers: `Authorization: Bearer YOUR_APIFY_TOKEN`

That's it. The output items can flow into Sheets, HubSpot custom properties, Airtable rows, etc.

## Make.com (Integromat) scenario

1. **Trigger**: any module that produces a Shopify URL.
2. **Apify › Run an Actor and Wait for It** (this module waits for completion and returns the dataset items).
3. **Iterator** on the returned items.
4. **Action**: Sheets / Airtable / HubSpot / your CRM — one row per Shopify store with apps + products.

The Make module is the lowest-friction path because it returns dataset items in the same step, so you don't need a follow-up HTTP call.

## n8n (self-hosted)

```yaml
nodes:
  - name: Apify Actor
    type: n8n-nodes-base.httpRequest
    parameters:
      method: POST
      url: https://api.apify.com/v2/acts/kazkn~shopify-scraper-apps-spy/run-sync-get-dataset-items?token={{$credentials.apifyToken}}
      sendBody: true
      contentType: json
      bodyJson: |
        {
          "store_urls": ["={{$json.shopify_url}}"],
          "extract_level": "standard"
        }
```

Credential: `apifyToken` = your token from https://console.apify.com/settings/integrations.

## Tips for production webhooks

- **Cap input size**: if your trigger fires hundreds of times per hour, batch the Shopify URLs into one Apify run instead of one run per URL — far cheaper.
- **Use `run-sync-get-dataset-items`** for synchronous flows under 5 minutes; switch to `runs/last/dataset/items` polling for larger batches.
- **Store the run ID** in your CRM record so you can re-fetch the data later without re-running the actor.
- **Set `max_products_per_store: 50`** if you only need apps detection — cheaper, faster.

# Examples

Real-world snippets showing how to use the **Shopify Apps Spy + Product Scraper** actor. Each example is self-contained and runnable.

| File | Use case | Stack |
|---|---|---|
| [`01-curl-quickstart.sh`](./01-curl-quickstart.sh) | Run the actor from the command line in one curl call | Bash |
| [`02-icp-qualification.mjs`](./02-icp-qualification.mjs) | B2B lead qualification — filter 1,200 stores by apps stack to find ICP | Node.js |
| [`03-app-market-share.py`](./03-app-market-share.py) | Aggregate app adoption across thousands of stores for market research | Python |
| [`04-cold-outreach-personalization.mjs`](./04-cold-outreach-personalization.mjs) | Generate per-prospect openers based on detected stack (4% → 11% reply rate) | Node.js |
| [`05-zapier-make-webhook.md`](./05-zapier-make-webhook.md) | Trigger the actor from Zapier or Make.com with no code | No-code |

## Get an Apify token

```bash
# Sign up at https://apify.com/sign-up — $5 free credit, no card.
# Then grab a token from https://console.apify.com/settings/integrations
export APIFY_TOKEN=apify_api_xxxxxxxxxxxxxxxx
```

All examples read `APIFY_TOKEN` from the environment.

## Pricing reminder

| Tier | What you get | Cost per store |
|---|---|---|
| `basic` | products only | $0.001 |
| `standard` | + apps detection (recommended) | **$0.005** |
| `full` | + reviews from detected app | $0.30 |

A 1,000-store batch at standard tier ≈ **$5** ≈ exactly the Apify free monthly credit.

## Need a missing detector?

If the actor doesn't detect an app you care about (Shopify ships hundreds), open an issue on this repo with the store URL and the app name — adding a detector typically takes 15 minutes.

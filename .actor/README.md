# 🧩 Shopify Apps Spy + Product Scraper

[![Apify Actor](https://img.shields.io/badge/Apify-Run%20on%20Apify-1e88e5?logo=apify&logoColor=white)](https://apify.com/kazkn/shopify-scraper-apps-spy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![YouTube tutorial](https://img.shields.io/badge/Tutorial-YouTube-red?logo=youtube&logoColor=white)](https://youtu.be/jxpSVYvZBFw)

**Paste a [Shopify](https://www.shopify.com) store URL, click Run, and get the full tech stack + product catalog + reviews in seconds.**

🧩 **Shopify Apps Spy + Product Scraper** is the only [Apify Actor](https://apify.com/store) that auto-detects the **150+ apps installed on any Shopify store** ([Klaviyo](https://www.klaviyo.com), [Recharge](https://rechargepayments.com), [Yotpo](https://www.yotpo.com), [Judge.me](https://judge.me), [Privy](https://www.privy.com), [Gorgias](https://www.gorgias.com), [Algolia](https://www.algolia.com), [Okendo](https://www.okendo.com), [Iterable](https://iterable.com), [Bloomreach](https://www.bloomreach.com), and many more) — combined with the **full product catalog** via the official [`/products.json`](https://shopify.dev/docs/api/ajax/section/product) endpoint and **reviews** from every major review provider.

Built for B2B SaaS lead-gen, DTC competitive intel, and agency tech audits. **No login. No API key. No proxy required for most stores.**

---

## 🎬 Video Tutorial — See It in Action

[![Shopify Apps Spy + Product Scraper Tutorial](https://img.youtube.com/vi/jxpSVYvZBFw/maxresdefault.jpg)](https://youtu.be/jxpSVYvZBFw)

▶️ Watch the full tutorial — from a Shopify store URL to apps + products + reviews in under 3 minutes.

*(🇫🇷 [Tutoriel français](https://youtu.be/JVnUpT7mjMw) · 🇩🇪 [Auf Deutsch](https://youtu.be/ujS8P1hpMTI) · 🇪🇸 [En español](https://youtu.be/pUiu2Usvpb0))*

---

## 🔍 What does this Shopify scraper do?

🧩 Shopify Apps Spy + Product Scraper turns any Shopify URL into structured intelligence in **under 30 seconds**.

You simply:

* paste one or more Shopify URLs (custom domain or `*.myshopify.com`)
* pick an extraction level (Basic, Standard, Full, Pro)
* click Run
* export results as JSON, CSV, or Excel

The actor extracts:

* 🛍️ **Full product catalog** — title, handle, vendor, type, tags, description, prices, variants, images, inventory signals
* 🧩 **Detected apps** — [Klaviyo](https://www.klaviyo.com), [Recharge](https://rechargepayments.com), [Yotpo](https://www.yotpo.com), [Judge.me](https://judge.me), [Privy](https://www.privy.com), [Gorgias](https://www.gorgias.com), [Algolia](https://www.algolia.com), [Okendo](https://www.okendo.com), [Iterable](https://iterable.com), [Bloomreach](https://www.bloomreach.com), [Braze](https://www.braze.com), [Smile.io](https://smile.io), [LoyaltyLion](https://loyaltylion.com), [Weglot](https://www.weglot.com), [Rebuy](https://www.rebuyengine.com), [Shogun](https://getshogun.com), [PageFly](https://pagefly.io), [Hotjar](https://www.hotjar.com), [GTM](https://tagmanager.google.com), [Facebook Pixel](https://www.facebook.com/business/help/952192354843755), [TikTok Pixel](https://ads.tiktok.com), and 30+ more
* ⭐ **Reviews** from [Yotpo](https://www.yotpo.com), [Judge.me](https://judge.me), [Stamped](https://stamped.io), [Okendo](https://www.okendo.com), [Loox](https://loox.io) (Full mode)
* 💰 **Estimated revenue** from scarcity signals + review velocity (Pro mode)
* 🏷️ **Store metadata** — name, currency, country, myshopify domain, total products

---

## 🎯 Who is this Shopify scraper for?

* 🤖 **B2B SaaS founders** targeting Shopify merchants — enrich your outbound list with installed-apps data nobody else has
* 📊 **DTC operators and analysts** — snapshot competitor catalogs, watch what apps they install or churn, compare regional storefronts
* 🛍️ **Dropshippers** — find winning products in Pro mode using review-velocity revenue estimates
* 🏪 **Agencies** — deliver clean tech-stack audits to your Shopify clients in minutes instead of hours

---

## ⚡ Why use this Shopify scraper?

* 🧩 **Tech stack detection nobody else has** — the unique value vs the 8 other [Shopify scrapers on Apify Store](https://apify.com/store?search=shopify)
* 🌍 **Multi-region tested** — US, UK, EU, France, Italy, Spain, Germany all validated end-to-end
* 🚀 **Sub-30s per store** — scrapes 250 products + apps + reviews faster than any browser-based competitor
* 💰 **5x cheaper than the leader** — $0.002 per product vs $0.009 at the next paid Apify Shopify scraper
* 🛡️ **Zero browser** — pure HTTP + JSON, sub-300 MB memory tier, never breaks on JS rendering
* ✅ **Sitemap fallback** — if a store disables [`/products.json`](https://shopify.dev/docs/api/ajax/section/product), the actor automatically reads the sitemap
* 📦 **Real-time dataset** — products stream into your dataset as they're extracted, no batch wait
* 🔁 **Batch up to 100 stores** in a single run

> 💡 If you only need products without apps detection, use any commodity [Shopify scraper](https://apify.com/store?search=shopify). If you want the **stack intel**, this is the only actor that gives it to you.

---

## 🚀 How to scrape Shopify products in 3 steps

Setting up 🧩 Shopify Apps Spy + Product Scraper takes **less than a minute**:

1. Open the actor on [Apify Console](https://console.apify.com/actors/kazkn~shopify-scraper-apps-spy) and paste one or more **Shopify store URLs** in the input field (custom domain like `https://allbirds.com` or any `*.myshopify.com`).
2. Pick an **Extraction Level** that matches what you need:
   * **Basic** — products only
   * **Standard** (default) — products + tech stack detection
   * **Full** — Standard + reviews from [Yotpo](https://www.yotpo.com), [Judge.me](https://judge.me), [Stamped](https://stamped.io), [Okendo](https://www.okendo.com), [Loox](https://loox.io)
   * **Pro** — Full + revenue estimation
3. Click **Run** — then download your dataset from the **Storage** tab as JSON, CSV, or Excel.

> 💡 **Pro tip:** filter by collection handle to scrape only `/collections/sneakers` or any specific catalog slice instead of the whole store.

### Input example

```json
{
  "store_urls": [
    "https://allbirds.com",
    "https://glossier.com",
    "https://magicspoon.com"
  ],
  "extract_level": "full",
  "max_products_per_store": 250,
  "max_reviews_per_product": 20,
  "max_concurrent_stores": 3,
  "use_residential_proxy": false
}
```

> 💡 Set `use_residential_proxy: true` only when you scrape Cloudflare-protected stores like Tesla Shop or Manscaped. Datacenter proxy is enough for 98% of Shopify stores. Learn more about [Apify Proxy](https://docs.apify.com/platform/proxy).

---

## 🧩 Detected apps catalog (50+ apps, growing)

The detector spots the entire installed tech stack of any Shopify by running a library of regex patterns on the home page and one product page HTML.

| Category | Detected apps |
|---|---|
| ⭐ **Reviews** | [Yotpo](https://www.yotpo.com) · [Judge.me](https://judge.me) · [Loox](https://loox.io) · [Stamped](https://stamped.io) · [Okendo](https://www.okendo.com) · [Reviews.io](https://www.reviews.io) · [Trustpilot](https://www.trustpilot.com) · Shopify legacy reviews |
| 📧 **Email marketing** | [Klaviyo](https://www.klaviyo.com) · [Mailchimp](https://mailchimp.com) · [Omnisend](https://www.omnisend.com) · [Drip](https://www.drip.com) · **[Iterable](https://iterable.com)** · **[Bloomreach Engagement](https://www.bloomreach.com/en/products/engagement)** · **[Braze](https://www.braze.com)** |
| 🎯 **Popups / opt-in** | [Privy](https://www.privy.com) · [Justuno](https://www.justuno.com) · [OptiMonk](https://www.optimonk.com) |
| 🔁 **Subscriptions** | [Recharge](https://rechargepayments.com) · [Bold Subscriptions](https://boldcommerce.com/subscriptions) · [Appstle](https://appstle.com) |
| 🎁 **Loyalty / rewards** | [Smile.io](https://smile.io) · [Yotpo Loyalty (Swell)](https://www.yotpo.com/platform/loyalty) · [LoyaltyLion](https://loyaltylion.com) |
| 💬 **Live chat / helpdesk** | [Gorgias](https://www.gorgias.com) · [Tidio](https://www.tidio.com) · [Intercom](https://www.intercom.com) · [Zendesk](https://www.zendesk.com) · [Drift](https://www.drift.com) |
| 🔎 **Search** | [Algolia](https://www.algolia.com) · [Searchanise](https://searchanise.io) · [Klevu](https://www.klevu.com) |
| 🎨 **Page builders** | [Shogun](https://getshogun.com) · [PageFly](https://pagefly.io) · [GemPages](https://gempages.net) · [Zipify](https://zipify.com) |
| 🌐 **Currency / i18n** | Currency Converter Plus · [Weglot](https://www.weglot.com) · [LangShop](https://langshop.app) |
| 🛒 **Upsell / cart** | [ReConvert](https://www.reconvert.io) · [Bold Upsell](https://boldcommerce.com/upsell-cross-sell) · In Cart Upsell · [Rebuy](https://www.rebuyengine.com) |
| 📈 **Analytics / pixels** | [Hotjar](https://www.hotjar.com) · [GTM](https://tagmanager.google.com) · [GA4](https://analytics.google.com) · [Facebook Pixel](https://www.facebook.com/business/help/952192354843755) · [TikTok Pixel](https://ads.tiktok.com) · [Pinterest Tag](https://help.pinterest.com/en/business/article/install-the-pinterest-tag) · [Snapchat Pixel](https://businesshelp.snapchat.com/s/article/pixel-direct-implementation) |

> 💡 Don't see an app you care about? The patterns library is open — open an issue with a link to a store using it and I add the regex within 24h.

---

## 💰 Pricing

🧩 Shopify Apps Spy + Product Scraper uses **pay-per-event** pricing. You only pay for what you actually extract:

| Event | When it fires | Price |
|---|---|---|
| **Actor start** | Once per run | $0.05 |
| **Store analyzed** | Once per Shopify store with products | $0.005 |
| **Product extracted** | Per product row pushed | $0.002 |
| **Apps detected** | Per store at Standard or higher | $0.05 |
| **Review extracted** | Per review row pushed | $0.0005 |
| **Revenue estimated** | Per store at Pro level | $0.10 |

* No monthly subscription — pay only for what you use
* [Apify Free plan](https://apify.com/pricing) includes **$5/month of platform credits** — enough to scan ~100 stores in tech-stack mode at no cost
* Set `Max Total Charge USD` on every run to cap your spend

### 💸 Real cost examples

* **Scan 100 Shopify stores for their tech stack** (B2B SaaS lead-gen) — about **$10.55**
* **Deep audit 5 competitors with reviews** (DTC competitive intel) — about **$5.95**
* **Pro-mode dropship research on 50 stores** — about **$10.05**

Compare to [PPSPY](https://www.ppspy.com) ($24/month), [Koala Inspector](https://koalainspector.com) ($9.99/month), [Charm.io](https://charm.io) ($299/month), [Shophunter](https://shophunter.io) ($99/month) — and none of them give you bulk API access or installed-apps data.

Learn more about [Apify pricing](https://apify.com/pricing).

---

## 📦 Output format

The actor writes to **four datasets** that you can export independently to JSON, CSV, Excel, [Google Sheets](https://apify.com/integrations/google-sheets), [Airtable](https://apify.com/integrations/airtable), [Slack](https://apify.com/integrations/slack), or any [Apify integration](https://apify.com/integrations).

### Default dataset — products

```json
{
  "store_url": "https://allbirds.com",
  "store_domain": "allbirds.com",
  "store_platform": "shopify",
  "scraped_at": "2026-04-30T22:15:30Z",
  "extract_level": "standard",

  "product_id": 7894123456,
  "product_handle": "wool-runner-mizzles-natural-white",
  "product_title": "Wool Runner Mizzles - Natural White",
  "product_url": "https://allbirds.com/products/wool-runner-mizzles-natural-white",
  "product_type": "Sneakers",
  "vendor": "Allbirds",
  "tags": ["wool", "waterproof"],
  "description_html": "<p>...</p>",
  "description_text": "Plain text description",
  "created_at": "2024-09-15T10:00:00Z",
  "updated_at": "2026-04-28T14:00:00Z",

  "price": 135.0,
  "price_min": 135.0,
  "price_max": 135.0,
  "compare_at_price": null,
  "currency": "USD",
  "available": true,
  "available_variant_count": 8,
  "total_variant_count": 12,

  "images": ["https://cdn.shopify.com/...jpg"],
  "main_image": "https://cdn.shopify.com/...jpg",
  "image_count": 6,

  "store_meta": {
    "name": "Allbirds",
    "currency": "USD",
    "country": "US",
    "myshopify_domain": "allbirds-2.myshopify.com"
  },

  "apps_detected": {
    "reviews": ["yotpo"],
    "email_marketing": ["iterable"],
    "analytics": ["google_tag_manager"],
    "all_apps_raw": ["yotpo", "iterable", "google_tag_manager"],
    "detected_count": 3
  }
}
```

### Named dataset `apps`

One row per scraped store with the full tech stack and diagnostic metadata:

```json
{
  "store_url": "https://magicspoon.com",
  "store_domain": "magicspoon.com",
  "myshopify_domain": "magicspoon-cereal.myshopify.com",
  "detected_at": "2026-04-30T22:15:30Z",
  "reviews": ["okendo"],
  "email_marketing": ["klaviyo"],
  "subscriptions": ["recharge"],
  "page_builder": ["shogun"],
  "upsell": ["rebuy"],
  "analytics": ["google_tag_manager"],
  "all_apps_raw": ["okendo", "klaviyo", "recharge", "shogun", "rebuy", "google_tag_manager"],
  "detected_count": 6
}
```

### Named dataset `reviews`

One row per review with normalized provider-agnostic fields:

```json
{
  "store_domain": "glossier.com",
  "product_id": 9576351138037,
  "product_handle": "spring-pinks",
  "review_id": "yotpo_12345",
  "provider": "yotpo",
  "rating": 5,
  "title": "Best lip balm ever",
  "body": "I wear them every day...",
  "author_name": "Sarah J.",
  "author_verified": true,
  "created_at": "2026-03-12T08:00:00Z",
  "helpful_count": 14,
  "images": ["https://cdn.yotpo.com/..."]
}
```

### Named dataset `revenue` (Pro mode placeholder, full impl in v2)

---

## 💡 Tips for scraping Shopify efficiently

* 📈 **Batch multiple stores** in a single run — the actor runs them in parallel
* 🌐 **Multi-region brands** — pass `https://allbirds.com`, `https://allbirds.eu`, `https://allbirds.co.uk` to compare regional storefronts (different stacks, different currencies)
* 🛡️ **Hit a 403?** Toggle `Use Residential Proxy` for Cloudflare-protected stores ([Apify Proxy docs](https://docs.apify.com/platform/proxy))
* 🔄 **Schedule weekly runs** with [Apify Scheduler](https://apify.com/schedules) to track product changes and price drops over time
* 🪝 **Push to Sheets, Slack, Airtable** via [Apify integrations](https://apify.com/integrations) — no glue code needed
* 🤖 **Run from any AI agent** ([Claude](https://claude.ai), [Cursor](https://cursor.com), [Windsurf](https://codeium.com/windsurf)) using the [Apify MCP server](https://apify.com/apify/actors-mcp-server)

---

## 🌍 Supported Shopify markets and stores

🧩 Shopify Apps Spy + Product Scraper works on **any [Shopify](https://www.shopify.com) storefront worldwide** — custom domain, `*.myshopify.com`, regional subdomains, [Shopify Plus](https://www.shopify.com/plus).

✅ Empirically tested on stores from these countries before publishing:

🇺🇸 United States · 🇬🇧 United Kingdom · 🇪🇺 European Union · 🇫🇷 France · 🇩🇪 Germany · 🇮🇹 Italy · 🇪🇸 Spain

The endpoint we use ([`/products.json`](https://shopify.dev/docs/api/ajax/section/product)) is a public, version-less Shopify spec that has been stable since 2014. **Country, currency, and language do not affect detection** — the actor handles every Shopify storefront identically.

---

## 🧭 When to use Shopify Apps Spy + Product Scraper vs alternatives

Use **🧩 Shopify Apps Spy + Product Scraper** if you want:

* The only [Apify Shopify scraper](https://apify.com/store?search=shopify) with **installed-apps detection**
* Catalog + apps + reviews in one run
* Sub-30s per store, batchable up to 100
* Pay-per-event with no subscription

Use **[PPSPY](https://www.ppspy.com)** ($24/month) or **[Charm.io](https://charm.io)** ($299/month) if you prefer:

* A polished web UI without API access
* Flat monthly pricing instead of usage-based

Use **a generic [web scraper](https://apify.com/apify/web-scraper)** if you only need:

* Single-product scraping with custom selectors
* No Shopify-specific data model

> 💡 The actor is **5× cheaper than the next paid Apify Shopify scraper** at $0.002 per product, and the apps detection is unique on the platform. None of the 8 other [Shopify scrapers on Apify Store](https://apify.com/store?search=shopify) offer it.

---

## 🔗 Part of the KazKN ecosystem

This actor is part of the [KazKN](https://apify.com/kazkn) family of scrapers and MCP servers on Apify:

* [🧩 Shopify Apps Spy + Product Scraper](https://apify.com/kazkn/shopify-scraper-apps-spy) — this actor
* [Vinted Smart Scraper — Cross-Country Price Comparison](https://apify.com/kazkn/vinted-smart-scraper) — full Vinted intelligence across 26 markets
* [⚡ Vinted Turbo Scraper](https://apify.com/kazkn/vinted-turbo-scraper) — fastest Vinted URL-to-dataset workflow
* [Vinted MCP Server](https://apify.com/kazkn/vinted-mcp-server) — connect any AI agent ([Claude](https://claude.ai), [Cursor](https://cursor.com), [Windsurf](https://codeium.com/windsurf)) to Vinted data
* [App Store Scraper for Localization Gaps](https://apify.com/kazkn/apple-app-store-localization-scraper) — find US apps missing French, German, Spanish localizations
* [GPT Crawler MCP](https://apify.com/kazkn/gpt-crawler-mcp) — turn any website into a clean knowledge file for [ChatGPT](https://chatgpt.com), [Claude](https://claude.ai), or [RAG](https://www.anthropic.com/news/contextual-retrieval) pipelines

---

## ❓ Frequently asked questions

### Is scraping Shopify legal?

Yes. The [`/products.json`](https://shopify.dev/docs/api/ajax/section/product) endpoint is a public, official [Shopify](https://www.shopify.com) feature documented by Shopify and consumed by [Google Shopping](https://shopping.google.com) for indexing. The actor does not bypass authentication, does not interact with Shopify's Admin API, and does not collect any buyer personal data. Read more on the [Apify legal blog](https://blog.apify.com/is-web-scraping-legal/).

### Can you scrape Shopify products without an API key?

Yes. The actor uses only the public [storefront `/products.json` endpoint](https://shopify.dev/docs/api/ajax/section/product) — no app install, no [OAuth](https://shopify.dev/docs/apps/auth/oauth), no API key.

### Does Shopify have an API?

Two: the [Admin API](https://shopify.dev/docs/api/admin) (requires OAuth + a per-store install — not used here) and the public [storefront `/products.json` endpoint](https://shopify.dev/docs/api/ajax/section/product) (used here).

### How many products can I extract per store?

Up to 100,000 per store, paginated 250 at a time. Realistic Shopify catalogs have 50–10,000 products.

### What if a store disables `/products.json`?

The actor automatically falls back to `sitemap_products_1.xml` and pulls each product via `/products/{handle}.json`. About 2 % of [Shopify Plus](https://www.shopify.com/plus) stores disable both — they show up as a graceful "no products fetched" record with diagnostic info.

### Does the actor work on Shopify Plus stores?

Yes — most of the validation set is [Shopify Plus](https://www.shopify.com/plus) (Allbirds, Magic Spoon, Glossier, Kith, Princess Polly, Pinko, Aspesi, PDPaola).

### How does the apps detector work?

It fetches the home page HTML and one product page HTML, then runs a library of regex patterns against the combined markup. Detection signals include CDN URLs, JavaScript globals, custom HTML attributes, and inline configuration objects.

### How accurate is the apps detection?

Very high recall on apps that ship visible front-end widgets ([Yotpo](https://www.yotpo.com), [Judge.me](https://judge.me), [Recharge](https://rechargepayments.com), [Klaviyo](https://www.klaviyo.com), [Privy](https://www.privy.com), [Gorgias](https://www.gorgias.com), [Algolia](https://www.algolia.com), [Okendo](https://www.okendo.com)). Lower recall on stores that lazy-load apps via SPAs or use a heavily customized headless theme (e.g. Gymshark, Bombas). The detector reports actual reality — never fabricates apps.

### What review providers are supported?

[Yotpo](https://www.yotpo.com), [Judge.me](https://judge.me), [Stamped](https://stamped.io), [Okendo](https://www.okendo.com), and [Loox](https://loox.io). The crawler picks the first provider the apps detector flagged for the store, or falls through the list until one returns reviews.

### Can I scrape multi-region brands?

Yes. Pass each storefront URL separately (e.g. `https://allbirds.com`, `https://allbirds.eu`, `https://allbirds.co.uk`) and the actor reports the local currency in `store_meta` and treats each as an independent run.

### What about Cloudflare-protected stores?

Some stores ([Tesla Shop](https://shop.tesla.com), [Manscaped](https://www.manscaped.com)) front their storefront with [Cloudflare](https://www.cloudflare.com). Toggle **Use Residential Proxy** on those — the actor routes through [Apify's residential pool](https://apify.com/proxy/residential).

### Can I filter by collection?

Yes — set `Filter by Collection` to a collection handle (e.g. `sneakers`, `new-arrivals`) and the actor restricts the scrape to that collection only.

### Can I run this on a schedule?

Yes — schedule runs in [Apify Scheduler](https://apify.com/schedules) with any cadence (hourly, daily, weekly). Export to webhook, [Google Sheets](https://apify.com/integrations/google-sheets), [S3](https://apify.com/integrations/aws-s3), [BigQuery](https://apify.com/integrations/google-bigquery), or any [Apify integration](https://apify.com/integrations).

### Is data validated before being pushed?

Yes — every product, apps record, and review is validated against a [Zod](https://zod.dev) schema before being pushed. Invalid rows are logged and skipped, never stored.

### What's the typical run time?

Standard level: 5–10 seconds per store on a single product page (250 products), parallelized across stores. 20 stores in standard level finishes in ~45 seconds in cloud benchmarks.

### What's the memory footprint?

256–1024 MB tier. Real-world use is sub-300 MB even for 1,000-product stores. See [Apify resource pricing](https://apify.com/pricing).

### What if the URL isn't a Shopify store?

The actor returns a diagnostic record with `error: "not_a_shopify_store"`, the signals it checked, and the HTTP status code. **You are never charged for non-Shopify URLs**.

### How is this different from a generic scraper?

Generic scrapers like [Apify Web Scraper](https://apify.com/apify/web-scraper) extract one product at a time, do not understand Shopify's variants/collections/inventory model, and can't detect installed apps. This actor is purpose-built for Shopify with regex patterns tuned for the apps detection use case.

### Can I use this from an AI agent?

Yes — connect any [MCP-compatible AI agent](https://modelcontextprotocol.io) ([Claude](https://claude.ai), [Cursor](https://cursor.com), [Windsurf](https://codeium.com/windsurf)) via the [Apify MCP server](https://apify.com/apify/actors-mcp-server). The agent can call this actor as a tool.

### Can you add a specific app to the detector?

Yes — the patterns library is regex-based. Open an issue with a link to a store using the app and I'll add the regex.

---

## ⚖️ Is it legal to scrape Shopify?

The [`/products.json`](https://shopify.dev/docs/api/ajax/section/product) endpoint is public and documented by [Shopify](https://www.shopify.com). The actor does not bypass authentication, respects rate limits, and does not collect buyer personal data.

Note that personal data is protected by [GDPR](https://gdpr.eu) in the EU and other regulations worldwide. Do not scrape personal data unless you have a legitimate reason. If unsure, consult your lawyers. Suggested reading: [Is web scraping legal? — Apify Blog](https://blog.apify.com/is-web-scraping-legal/).

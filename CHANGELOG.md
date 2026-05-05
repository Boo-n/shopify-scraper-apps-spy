# Changelog

All notable changes to **Shopify Apps Spy + Product Scraper** are documented here.
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The Apify build numbers track each deployment to the Apify Store; the version
numbers below reflect functional changes visible to users.

---

## [1.0.2] — 2026-05-05

### Added
- 4-language video tutorials (EN / FR / DE / ES) embedded in README and on Apify Store
- `examples/` folder with 5 runnable code samples covering ICP qualification, app market-share research, cold-outreach personalization, cURL quickstart, and Zapier/Make.com integration
- README badges (Apify Run, MIT License, YouTube Tutorial)
- "Video Tutorial" section in README + Apify Store, mirroring the format used on the Vinted Turbo Scraper actor

### Changed
- Renamed actor from "Shopify Product Scraper - Apps Spy + Reviews" to **"Shopify Apps Spy + Product Scraper"** to lead with the differentiated apps-detection feature while keeping the product-scraper SEO term
- Aligned `.actor/actor.json` title and `.actor/README.md` with the new name

---

## [1.0.0] — 2026-04-30

### Added
- Apps detection across 150+ Shopify apps (email/SMS, reviews, subscriptions, popups, search, loyalty, ad pixels)
- Product catalog extraction via the official `/products.json` endpoint
- Reviews extraction at `extract_level: full` for Yotpo, Judge.me, Stamped, Okendo, Loox, Junip, Reviews.io, Rebuy
- Pay-per-event pricing: $0.003/store, $0.0005/product, $0.001/apps_detected, $0.0003/review
- 4 extract levels: `basic`, `standard`, `full`, `pro`
- JSON / CSV / Excel / RSS export
- Free $5 monthly credit covers ≈1,500 stores at standard tier

### Performance
- Polite concurrency of 5 simultaneous requests scans 1,000 stores in ~25 minutes
- No proxy required for the vast majority of stores
- No login, no API key, no headless browser

---

## Roadmap

- **MCP server mode** — query the actor directly from Claude desktop / Cursor (in line with the existing [Vinted MCP Server](https://apify.com/kazkn/vinted-mcp-server) and [GPT Crawler MCP](https://apify.com/kazkn/gpt-crawler-mcp))
- **Revenue estimation** (`pro` tier) — observable from review velocity + product velocity for ICP filtering
- **Theme detection** — useful for agency outbound (Shopify 2.0 vs vintage themes vs custom)
- **More detectors** — every "this is missing" issue gets a 15-minute add. Open an issue to request one.

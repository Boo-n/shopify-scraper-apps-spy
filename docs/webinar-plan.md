# Webinar plan — Shopify Apps Spy + Product Scraper

> **Status**: planning. First webinar target — 4-6 weeks after launch, once we've published 6+ articles and have audience signal.

## Platform choice

**Picked: YouTube Live**, with a Twitter/LinkedIn simulcast via Restream.

| Platform | Pros | Cons | Decision |
|---|---|---|---|
| **YouTube Live** | Largest audience, replay archives forever, search-discoverable, free | Setup heavier than Twitter Spaces | ✅ chosen — replay value is the real win |
| Twitch | Strong dev community | Audience skews gaming/hobby, not B2B | ❌ |
| LinkedIn Live | Best for B2B audiences | Requires LinkedIn Live access (≥1000 followers + approval), Boon doesn't have it yet | ❌ for v1, retry once eligible |
| Twitter Spaces | Easy setup, real-time engagement | Audio-only, no replay, B2B audience smaller | ❌ |
| Zoom Webinar | Best for paying customer training | Paid plan needed, no public discovery | ❌ for top-of-funnel |

The deciding factor: webinar replay needs to live somewhere indexable on Google + YouTube search for **months after the live**. YouTube Live is the only platform where the replay keeps generating signups.

## Timezone

**Picked: Tuesday 16:00 UTC** (covers the largest paying-customer pool simultaneously).

Coverage at 16:00 UTC:
- **US East**: 12:00 (lunch — high attendance)
- **US West**: 09:00 (start of day — high attendance)
- **UK / Ireland**: 16:00 (afternoon — high attendance)
- **France / Germany / Spain**: 17:00 (afternoon — strong)
- **Brazil**: 13:00 (start of afternoon — moderate)
- **Argentina / Chile**: 13:00 (moderate)

Sub-optimal: APAC (India 21:30, Australia 02:00). Acceptable trade-off — APAC isn't the primary Shopify B2B market for this actor.

Day choice: **Tuesday** — best engagement for B2B webinars per most platform benchmarks (avoid Mondays = catching up, Fridays = checking out, weekends = no B2B).

## Content plan (45-minute slot)

| Time | Section | Notes |
|---|---|---|
| 0:00 – 2:00 | **Intro** — who I am, why the actor exists, agenda | Quick: 1 slide for me, 1 slide for the actor |
| 2:00 – 7:00 | **The B2B problem** — qualifying 1,200 Shopify stores manually = 60 hours | Hook with the same arithmetic from the [ICP article](https://dev.to/boo_n/i-scraped-1200-shopify-stores-to-qualify-b2b-leads-heres-what-i-learned-about-icp-12ag) |
| 7:00 – 25:00 | **Live demo** — input 50 real prospect domains, watch logs, export dataset, walk through 3 use-cases (ICP filter, cold outreach openers, market share) | Most critical 18 minutes — this is what the replay will be clipped from |
| 25:00 – 32:00 | **API + automation** — cURL example, Zapier/Make.com no-code path, MCP roadmap | Show, don't slide |
| 32:00 – 40:00 | **Q&A** | Read live chat, prioritize "how do I do X?" over "what about Y feature?" |
| 40:00 – 45:00 | **Outro** — recap, free-tier reminder ($5 covers ~1,500 stores), where to follow next | Drive to apify.com/kazkn/shopify-scraper-apps-spy |

## Tech setup (test before going live)

- [ ] Camera + mic test (record a 30-second clip, listen back)
- [ ] OBS scenes prepared: full-cam, screen-only with cam pip, screen full + lower-third
- [ ] Browser profile clean: only the Apify Console + the article tab + a terminal visible
- [ ] Apify Console: actor pre-loaded with example input, but **not yet started**
- [ ] Demo prospect list ready: 50 real Shopify stores covering varied tech stacks
- [ ] YouTube Live → start as Unlisted 5 minutes before, switch to Public at start time
- [ ] Screen resolution 1080p, font size +20% in browser/terminal so attendees can read

## Email blast — UTM-tracked

Pre-webinar (3 days before):

```
Subject: I'm scraping 50 Shopify stores live on Tuesday — join me
URL: https://youtube.com/...?utm_source=email&utm_medium=email&utm_campaign=webinar-2026-Q2
```

Track signups against the webinar URL to know which channel drove conversions:
- `utm_source=email` for the email blast
- `utm_source=twitter` for the Twitter promo
- `utm_source=linkedin` for the LinkedIn promo
- `utm_source=devto` for cross-link from articles

## Repurposing the recording

After the live, the 45-minute recording becomes:

1. **YouTube replay** — keep as-is, edit the dead air at start/end. SEO title + description from the [SEO pack](../videos/SEO-METADATA.md) format.
2. **Blog post** — write a "Webinar recap" article that links to the recording at relevant timestamps. Cross-post to Medium / Hashnode.
3. **Short-form clips** — pull 3-4 clips of 30-60s each (the demo moments, the strongest Q&A) for TikTok / YouTube Shorts / LinkedIn / Twitter.
4. **Email follow-up** — send the recording to attendees + non-attendees with a "couldn't make it? watch the demo here" subject.
5. **Internal evergreen** — pin the YouTube replay to the Apify Store actor page (Apify lets actor owners embed a YouTube video as the cover demo).

The repurpose work typically takes ~3 hours per webinar but generates content for ~2 weeks of distribution.

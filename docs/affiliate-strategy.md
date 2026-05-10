# Apify Affiliate strategy — Shopify Apps Spy + Product Scraper

> **Status**: enrolled in Apify's Partner program. Goal: turn every article / video / social mention of the actor into trackable referral revenue.

## Apify partner program — the numbers

The relevant facts about Apify's [Partner program](https://apify.com/partners):

- **30% recurring commission** on every Apify subscription paid by users you refer (Personal, Team, Scale, Business plans).
- **$2,500 flat per Pro Services customer** referred to Apify's professional services.
- **No time limit**: as long as the referred user stays on a paid plan, you keep earning the recurring 30%. There is no 90-day or 12-month cookie cutoff like Amazon Affiliates.
- **First payout is 30 days after the first referred conversion** — meaning the platform waits one billing cycle before releasing earned commission.
- **Tracking is automatic**: any user who clicks a `?fpr=8fp2od` link to apify.com and signs up within the cookie window is attributed.

## How to claim a referred user

Append `?fpr=YOUR_AFFILIATE_ID` to any apify.com link. The most common form for Boon's actor:

```
https://apify.com/kazkn/shopify-scraper-apps-spy?fpr=8fp2od
```

Or on the generic platform sign-up CTA:

```
https://apify.com/sign-up?fpr=8fp2od
```

The link works the same way in articles, in YouTube descriptions, in Tweet replies, in cold-email signatures.

## Where to mention the affiliate link

The highest-leverage placements, ranked by expected click-through:

1. **Article CTAs** ("First run is free, $5 credit covers ~1,500 stores → [Try the actor]") — direct links every reader sees twice (intro + outro).
2. **YouTube video descriptions** — "First run is free → apify.com/kazkn/shopify-scraper-apps-spy". 4 multi-language videos × 100s of viewers × even a 1% sign-up rate = real volume.
3. **GitHub README** — the badges + first-paragraph link. Lower volume but high-intent visitors.
4. **Email signature** — "I built [actor] on Apify ($5 free / month covers ~1.5k stores)" — every email becomes an ambient promo.
5. **Cold-outreach openers** — when the prospect asks "what tool did you use?", the answer is one click away.

## Always mention the $5 free trial

Apify's $5 monthly free credit is the strongest single conversion lever:

- The user pays nothing to validate the tool.
- $5 covers ≈1,500 Shopify stores at the standard tier — way more than most prospects need for their first scan.
- Many users discover Apify through an actor and then keep their account for **other** actors → you keep earning 30% on that subscription forever.

Phrasing that converts well:

- *"First run is free — Apify gives every new account $5 in credit each month, which covers ~1,500 store scans."*
- *"You won't pay a cent until your second batch."*
- *"$5 ÷ $3/1,000 stores = 1,500+ stores free, every month."*

This is also the line the YouTube videos all close on, so the message reinforces across formats.

## Promote the platform, not just the actor

Apify pays 30% on the **subscription**, not on actor usage. So on top of "use my actor", I should also:

- Mention the **Apify Store** in articles for users who need OTHER scrapers — when readers click through and sign up, they're attributed to me even if they never run my actor.
- Reference my **other actors** (Vinted Turbo, Vinted Smart, GPT Crawler MCP, Vinted MCP Server, RedNote scraper, Watch Arbitrage MCP) — same `?fpr=8fp2od` works for all of them.
- Recommend **Apify Pro Services** when readers describe a custom-build problem in comments — that's a $2,500 flat referral if they convert.

## Tracking referrals in the Apify dashboard

The Apify Console exposes referral stats at https://console.apify.com/account/affiliate (or the new "Partners" tab). I should check it weekly:

- Click count per outgoing link
- Sign-up conversions
- Active referred subscriptions
- Pending vs paid commission

The first commission lands 30 days after the first referred user starts paying. That's the cadence I should plan around — don't expect immediate earnings on month 1, but month 2-3 should start flowing.

## Anti-spam ground rules

The terms forbid sketchy tactics:

- ❌ Don't auto-DM people pushing the link
- ❌ Don't post the link on subreddits without disclosing maker status
- ❌ Don't pay for fake clicks
- ✅ Disclose maker status when commenting on Reddit/HN/Quora threads
- ✅ Treat the link as a citation, not a billboard

## Action items (this quarter)

- [x] Read the [Apify Partner Terms](https://apify.com/partners) end-to-end
- [x] Add `?fpr=8fp2od` to all README CTA links (next commit)
- [x] Document program details in this file for future content sessions
- [ ] Add affiliate link to YouTube description (Marie does in YouTube Studio)
- [ ] Add affiliate link to Boon's email signature (Marie's account setting)
- [ ] Set up monthly check on console.apify.com/account/affiliate to track conversions

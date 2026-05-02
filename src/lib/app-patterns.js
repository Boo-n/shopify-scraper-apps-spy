/**
 * Tech-stack regex patterns for Shopify apps.
 *
 * Detection method: regex match against the concatenated HTML of the home
 * page + one product page (PDP). Patterns target stable signals (CDN URLs,
 * global JS namespaces, attribute selectors).
 *
 * Coverage target: ~30 high-prevalence apps in 2026 across the categories
 * that matter for B2B SaaS lead-gen and competitive intel.
 *
 * Format: APP_PATTERNS[appKey] = RegExp[]  (any match counts)
 *         APP_CATEGORY_MAP[category] = appKey[]
 *         APP_LABELS[appKey] = "Display Name"  (optional human label)
 */

export const APP_PATTERNS = {
  // === Reviews ==========================================================
  yotpo: [
    /staticw2\.yotpo\.com/i,
    /\byotpo\.com\/(widget|reviews)/i,
    /\bYotpo\.[a-zA-Z]+/,
    /\bdata-yotpo-/i,
    /yotpo-main-widget/i,
  ],
  judgeme: [
    /cdn\.judge\.me/i,
    /\bjudge\.me\/(badge|widgets)/i,
    /\bjdgm-/i,
    /window\.jdgm\b/i,
    /class=['"][^'"]*\bjdgm-/i,
  ],
  loox: [
    /loox\.io\/widget/i,
    /\bloox-/i,
    /loox\.io\/shops/i,
    /window\.LooxReviews/i,
  ],
  stamped: [
    /stamped\.io\/(widget|api)/i,
    /cdn\.stamped\.io/i,
    /\bstamped[-_]io/i,
    /window\.StampedFn/i,
    /\bdata-product-id-stamped/i,
  ],
  okendo: [
    /cdn\.okendo\.io/i,
    /\bokendo[-_]/i,
    /window\.okendo\b/i,
  ],
  shopify_product_reviews: [
    /\bspr-container\b/i,
    /\.spr-/,
  ],
  reviews_io: [
    /\breviews\.io\/(badge|widget)/i,
    /widget\.reviews\.io/i,
  ],
  trustpilot: [
    /widget\.trustpilot\.com/i,
    /\btrustpilot-widget\b/i,
  ],

  // === Email Marketing ==================================================
  klaviyo: [
    /static[-.]?klaviyo\.com/i,
    /\bklaviyo\.com\/onsite/i,
    /a\.klaviyo\.com/i,
    /\b_learnq\.push/,
    /window\._klOnsite/,
  ],
  mailchimp: [
    /chimpstatic\.com/i,
    /\bmc-embedded/i,
    /list-manage\.com/i,
  ],
  omnisend: [
    /\bomnisend\.com/i,
    /\bomnisnippet/i,
  ],
  drip: [
    /tag\.getdrip\.com/i,
    /window\._dcq/,
  ],
  iterable: [
    /\biterable\.com/i,
    /links\.iterable\.com/i,
    /window\._iaq\b/,
    /\bIterable[._-]?[A-Z]/,
  ],
  bloomreach_engagement: [
    /\bbloomreach\.(com|engage)/i,
    /\bbrx_uuid\b/i,
    /\bExponea\b/,
    /api[.-]engagement\.bloomreach/i,
  ],
  braze: [
    /\bbraze\.com\/api/i,
    /sdk\.iad-\d+\.braze\.com/i,
    /\bappboy\b/i,
    /window\.braze\b/i,
  ],

  // === Popups / Optin ===================================================
  privy: [
    /privy\.com\/widget/i,
    /\bprivymsa\b/i,
    /window\.Privy\b/,
    /privy[-_]promotions?/i,
  ],
  justuno: [
    /\bjustuno\.com/i,
    /window\.juapp/i,
  ],
  optimonk: [
    /onsite\.optimonk\.com/i,
    /window\.OptiMonk/i,
  ],

  // === Subscriptions ====================================================
  recharge: [
    /\brechargeapps\.com/i,
    /static\.rechargecdn\.com/i,
    /window\.ReCharge\b/,
    /recharge[-_]subscriptions?/i,
    /cdn\.shopify\.com\/extensions\/[^/]+\/recharge/i,
  ],
  bold_subscriptions: [
    /\bbold[-_]subscriptions/i,
    /boldcommerce\.com\/subscriptions/i,
  ],
  appstle: [
    /appstle\.com/i,
    /\bappstle[-_]subscription/i,
  ],

  // === Loyalty / Rewards ================================================
  smile_io: [
    /\bsmile\.io/i,
    /sdk-cdn\.smile\.io/i,
    /window\.SmileUI/,
    /window\._smile_settings/,
  ],
  yotpo_loyalty: [
    /\bswellrewards\b/i,
    /yotpo\.com\/loyalty/i,
  ],
  loyaltylion: [
    /sdk\.loyaltylion\.net/i,
    /window\.LoyaltyLion/i,
  ],

  // === Live Chat / Helpdesk =============================================
  gorgias: [
    /\bgorgias\.chat/i,
    /config\.gorgias\.chat/i,
    /window\.GORGIAS_CHAT/i,
  ],
  tidio: [
    /code\.tidio\.co/i,
    /\btidio[-_]chat/i,
  ],
  intercom: [
    /widget\.intercom\.io/i,
    /window\.Intercom\b/,
    /intercomcdn\.com/i,
  ],
  zendesk: [
    /\bzdassets\.com/i,
    /zopim\.com/i,
    /static\.zdassets\.com/i,
  ],
  drift: [
    /js\.driftt\.com/i,
    /drift\.com\/widget/i,
  ],

  // === Search ===========================================================
  algolia: [
    /\balgolianet\.com/i,
    /algoliasearch/i,
    /window\.algolia\b/i,
  ],
  searchanise: [
    /\bsearchanise\.com/i,
    /window\.SearchSpringer/,
  ],
  klevu: [
    /\bklevu\.com/i,
    /js\.klevu\.com/i,
  ],

  // === Page builders / Theme add-ons ====================================
  shogun: [
    /shogun-cdn\.com/i,
    /\bshogun[-_]/i,
  ],
  pagefly: [
    /\bpagefly\.io/i,
    /\bpf-/i,
  ],
  gempages: [
    /\bgempages\.net/i,
  ],
  zipify: [
    /\bzipify\.com/i,
    /\bzipify[-_]pages/i,
  ],

  // === Currency / i18n ==================================================
  currency_converter_plus: [
    /\bcurrency-converter-plus\b/i,
    /window\.CurrencyConverter/,
  ],
  weglot: [
    /\bweglot\.com/i,
    /window\.Weglot\b/i,
    /cdn\.weglot\.com/i,
  ],
  langshop: [
    /\blangshop\.app/i,
  ],

  // === Upsell / Cart ====================================================
  reconvert: [
    /\breconvert\.io/i,
    /reconvert[-_]upsell/i,
  ],
  bold_upsell: [
    /\bbold[-_]upsell/i,
  ],
  in_cart_upsell: [
    /\bin[-_]cart[-_]upsell/i,
  ],
  rebuy: [
    /\brebuyengine\.com/i,
    /\brebuy[-_]/i,
    /window\.Rebuy\b/,
  ],

  // === Analytics / Pixels ===============================================
  hotjar: [
    /static\.hotjar\.com/i,
    /\bwindow\.hj\b/i,
  ],
  google_tag_manager: [
    /googletagmanager\.com\/gtm\.js/i,
    /window\.dataLayer\b/,
  ],
  google_analytics: [
    /googletagmanager\.com\/gtag\/js/i,
    /\bga\('create'/,
  ],
  facebook_pixel: [
    /connect\.facebook\.net.*fbevents/i,
    /\bfbq\(['"]init['"]/,
  ],
  tiktok_pixel: [
    /\banalytics\.tiktok\.com/i,
    /\bttq\.load/,
  ],
  pinterest_tag: [
    /\bs\.pinimg\.com\/ct\b/i,
    /\bpintrk\(['"]load['"]/,
  ],
  snapchat_pixel: [
    /\bsc-static\.net\/scevent/i,
    /\bsnaptr\(['"]init['"]/,
  ],
};

export const APP_LABELS = {
  yotpo: 'Yotpo Reviews',
  judgeme: 'Judge.me',
  loox: 'Loox',
  stamped: 'Stamped',
  okendo: 'Okendo',
  shopify_product_reviews: 'Shopify Product Reviews (legacy)',
  reviews_io: 'Reviews.io',
  trustpilot: 'Trustpilot',
  klaviyo: 'Klaviyo',
  mailchimp: 'Mailchimp',
  omnisend: 'Omnisend',
  drip: 'Drip',
  iterable: 'Iterable',
  bloomreach_engagement: 'Bloomreach Engagement',
  braze: 'Braze',
  privy: 'Privy',
  justuno: 'Justuno',
  optimonk: 'OptiMonk',
  recharge: 'Recharge',
  bold_subscriptions: 'Bold Subscriptions',
  appstle: 'Appstle Subscriptions',
  smile_io: 'Smile.io',
  yotpo_loyalty: 'Yotpo Loyalty (Swell)',
  loyaltylion: 'LoyaltyLion',
  gorgias: 'Gorgias',
  tidio: 'Tidio',
  intercom: 'Intercom',
  zendesk: 'Zendesk',
  drift: 'Drift',
  algolia: 'Algolia',
  searchanise: 'Searchanise',
  klevu: 'Klevu',
  shogun: 'Shogun',
  pagefly: 'PageFly',
  gempages: 'GemPages',
  zipify: 'Zipify Pages',
  currency_converter_plus: 'Currency Converter Plus',
  weglot: 'Weglot',
  langshop: 'LangShop',
  reconvert: 'ReConvert',
  bold_upsell: 'Bold Upsell',
  in_cart_upsell: 'In Cart Upsell',
  rebuy: 'Rebuy',
  hotjar: 'Hotjar',
  google_tag_manager: 'Google Tag Manager',
  google_analytics: 'Google Analytics',
  facebook_pixel: 'Facebook Pixel',
  tiktok_pixel: 'TikTok Pixel',
  pinterest_tag: 'Pinterest Tag',
  snapchat_pixel: 'Snapchat Pixel',
};

export const APP_CATEGORY_MAP = {
  reviews:            ['yotpo', 'judgeme', 'loox', 'stamped', 'okendo', 'shopify_product_reviews', 'reviews_io', 'trustpilot'],
  email_marketing:    ['klaviyo', 'mailchimp', 'omnisend', 'drip', 'iterable', 'bloomreach_engagement', 'braze'],
  popups:             ['privy', 'justuno', 'optimonk'],
  subscriptions:      ['recharge', 'bold_subscriptions', 'appstle'],
  loyalty:            ['smile_io', 'yotpo_loyalty', 'loyaltylion'],
  live_chat:          ['gorgias', 'tidio', 'intercom', 'zendesk', 'drift'],
  search:             ['algolia', 'searchanise', 'klevu'],
  page_builder:       ['shogun', 'pagefly', 'gempages', 'zipify'],
  currency_converter: ['currency_converter_plus', 'weglot', 'langshop'],
  upsell:             ['reconvert', 'bold_upsell', 'in_cart_upsell', 'rebuy'],
  analytics:          ['hotjar', 'google_tag_manager', 'google_analytics', 'facebook_pixel', 'tiktok_pixel', 'pinterest_tag', 'snapchat_pixel'],
};

/**
 * Run every regex against the combined HTML and return:
 *   - byCategory: { reviews: ['yotpo', 'judgeme'], email_marketing: ['klaviyo'], ... }
 *   - all: ['yotpo', 'judgeme', 'klaviyo', ...]   // flat list
 *
 * Returns null when the input is empty (caller should treat as "not detected").
 */
export function detectAppsInHtml(...htmlChunks) {
  const combined = htmlChunks.filter(Boolean).join('\n');
  if (!combined) return null;

  const detected = [];
  for (const [appKey, patterns] of Object.entries(APP_PATTERNS)) {
    for (const re of patterns) {
      if (re.test(combined)) {
        detected.push(appKey);
        break;
      }
    }
  }

  const byCategory = {};
  for (const [cat, apps] of Object.entries(APP_CATEGORY_MAP)) {
    const inCat = apps.filter(a => detected.includes(a));
    byCategory[cat] = inCat.length > 0 ? inCat : null;
  }

  return {
    ...byCategory,
    all_apps_raw: detected,
    detected_count: detected.length,
  };
}

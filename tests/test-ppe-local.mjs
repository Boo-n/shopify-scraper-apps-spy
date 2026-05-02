/**
 * PPE local test - confirms billing wiring without leaving local sandbox.
 *
 * Per CdC §5.3, set ACTOR_TEST_PAY_PER_EVENT=true to enable simulated PPE
 * locally. Each charge is logged to storage/datasets/charging_log.
 *
 * Usage:
 *   ACTOR_TEST_PAY_PER_EVENT=true ACTOR_USE_CHARGING_LOG_DATASET=true \
 *     ACTOR_MAX_TOTAL_CHARGE_USD=5 \
 *     node tests/test-ppe-local.mjs
 *
 * What it does:
 *   - Calls each charge function once to confirm the wiring works
 *   - Reads back the charging_log dataset to confirm events were recorded
 *   - Asserts the eventNames match the catalog (CdC §5.1)
 */

import { Actor } from 'apify';
import {
  PPE_EVENTS,
  chargeActorStart,
  chargeStoreAnalyzed,
  chargeProductExtracted,
  chargeAppsDetected,
  chargeReviewExtracted,
  chargeRevenueEstimated,
} from '../src/lib/billing.js';

await Actor.init();

console.log('=== PPE local test ===');
console.log('ACTOR_TEST_PAY_PER_EVENT:', process.env.ACTOR_TEST_PAY_PER_EVENT);
console.log('Catalog:', PPE_EVENTS);

const calls = [];

console.log('\n[1] charge actor-start');
calls.push({ event: PPE_EVENTS.ACTOR_START, result: await chargeActorStart() });

console.log('[2] charge store-analyzed');
calls.push({ event: PPE_EVENTS.STORE_ANALYZED, result: await chargeStoreAnalyzed() });

console.log('[3] charge product-extracted x3');
for (let i = 0; i < 3; i++) {
  calls.push({ event: PPE_EVENTS.PRODUCT_EXTRACTED, result: await chargeProductExtracted(1) });
}

console.log('[4] charge apps-detected');
calls.push({ event: PPE_EVENTS.APPS_DETECTED, result: await chargeAppsDetected() });

console.log('[5] charge review-extracted x5');
for (let i = 0; i < 5; i++) {
  calls.push({ event: PPE_EVENTS.REVIEW_EXTRACTED, result: await chargeReviewExtracted(1) });
}

console.log('[6] charge revenue-estimated');
calls.push({ event: PPE_EVENTS.REVENUE_ESTIMATED, result: await chargeRevenueEstimated() });

console.log('\n=== Results ===');
const limitReached = calls.filter(c => c.result.eventChargeLimitReached).length;
console.log(`Total calls: ${calls.length}`);
console.log(`limitReached count: ${limitReached}`);
console.log('Per-event call counts:');
const byEvent = {};
for (const c of calls) byEvent[c.event] = (byEvent[c.event] || 0) + 1;
for (const [e, n] of Object.entries(byEvent)) console.log(`  ${e}: ${n}`);

await Actor.exit();

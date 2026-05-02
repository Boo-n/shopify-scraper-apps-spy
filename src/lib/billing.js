/**
 * Pay-Per-Event billing wrapper around Apify's Actor.charge() API.
 *
 * IMPORTANT (per CdC §5.1 + project rule #1):
 *   - Prices are configured in the Apify Console (Monetization tab) by the actor owner.
 *   - This file emits eventName-only charges. The eventName strings MUST match exactly
 *     what's set up in the Console. Any drift = lost revenue or billing failures.
 *
 * Event catalog (CdC §5.1):
 *   - apify-actor-start    : 1x per run (fired in main.js at boot)
 *   - store-analyzed       : 1x per store that completed at least products fetch
 *   - product-extracted    : 1x per product pushed to default dataset
 *   - apps-detected        : 1x per store when extract_level >= standard
 *   - review-extracted     : 1x per review pushed to 'reviews' dataset
 *   - revenue-estimated    : 1x per store when extract_level === pro
 *
 * Each function returns:
 *   { eventChargeLimitReached: boolean, eventChargeCount: number }
 * so the caller can short-circuit when the buyer's budget is exhausted.
 *
 * In local dev (no Actor.init or no PPE config), Actor.charge is a no-op
 * and returns sensible defaults.
 */

import { Actor } from 'apify';
import { log } from '../utils/logger.js';

const EVENTS = {
  ACTOR_START:       'apify-actor-start',
  STORE_ANALYZED:    'store-analyzed',
  PRODUCT_EXTRACTED: 'product-extracted',
  APPS_DETECTED:     'apps-detected',
  REVIEW_EXTRACTED:  'review-extracted',
  REVENUE_ESTIMATED: 'revenue-estimated',
};

export const PPE_EVENTS = EVENTS;

/**
 * Internal helper - charges a named event and normalizes the response.
 * Always returns a synthesized object even on errors, so callers don't need
 * to wrap in try/catch.
 */
async function chargeEvent(eventName, count = 1) {
  try {
    const result = await Actor.charge({ eventName, count });
    // Apify SDK returns: { eventChargeLimitReached, chargedCount, ... }
    return {
      eventChargeLimitReached: result?.eventChargeLimitReached === true,
      chargedCount: result?.chargedCount ?? count,
    };
  } catch (err) {
    log.warn('ppe_charge_failed', { eventName, count, error: err.message });
    return { eventChargeLimitReached: false, chargedCount: 0 };
  }
}

export async function chargeActorStart() {
  return chargeEvent(EVENTS.ACTOR_START, 1);
}

export async function chargeStoreAnalyzed() {
  return chargeEvent(EVENTS.STORE_ANALYZED, 1);
}

export async function chargeProductExtracted(count = 1) {
  return chargeEvent(EVENTS.PRODUCT_EXTRACTED, count);
}

export async function chargeAppsDetected() {
  return chargeEvent(EVENTS.APPS_DETECTED, 1);
}

export async function chargeReviewExtracted(count = 1) {
  return chargeEvent(EVENTS.REVIEW_EXTRACTED, count);
}

export async function chargeRevenueEstimated() {
  return chargeEvent(EVENTS.REVENUE_ESTIMATED, 1);
}

/**
 * Convenience: read remaining chargeable count for an event so callers can
 * decide whether to skip a section ahead of time.
 */
export function getRemainingChargeable(eventName) {
  try {
    const cm = Actor.getChargingManager?.();
    if (!cm) return Infinity;
    const remaining = cm.calculateChargeableEventsCount(eventName);
    return typeof remaining === 'number' ? remaining : Infinity;
  } catch {
    return Infinity;
  }
}

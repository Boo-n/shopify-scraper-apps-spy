/**
 * HTTP wrapper around got-scraping.
 * - User-Agent rotation across a small pool of recent desktop UAs
 * - Bounded timeouts and a small retry budget for transient errors
 * - Optional proxy URL injection for Apify proxy
 * - Returns { body, statusCode, headers } - body is parsed JSON when responseType=json,
 *   otherwise raw string text.
 */

import { gotScraping } from 'got-scraping';
import { log } from '../utils/logger.js';

const UA_POOL = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
];

function pickUA() {
  return UA_POOL[Math.floor(Math.random() * UA_POOL.length)];
}

/**
 * @param {string} url
 * @param {object} [opts]
 * @param {'json'|'text'} [opts.responseType='text']
 * @param {string} [opts.proxyUrl]
 * @param {number} [opts.timeoutMs=15000]
 * @param {number} [opts.retries=2]
 * @param {object} [opts.headers]
 * @returns {Promise<{ body: any, statusCode: number, headers: object }>}
 */
export async function httpGet(url, opts = {}) {
  const {
    responseType = 'text',
    proxyUrl,
    timeoutMs = 15000,
    retries = 2,
    headers = {},
  } = opts;

  const acceptHeader = responseType === 'json'
    ? 'application/json,text/plain,*/*'
    : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';

  const startedAt = Date.now();

  try {
    const response = await gotScraping({
      url,
      headers: {
        'User-Agent': pickUA(),
        'Accept': acceptHeader,
        'Accept-Language': 'en-US,en;q=0.9',
        ...headers,
      },
      timeout: { request: timeoutMs },
      retry: {
        limit: retries,
        methods: ['GET'],
        statusCodes: [408, 429, 500, 502, 503, 504, 521, 522, 524],
      },
      proxyUrl,
      responseType,
      throwHttpErrors: false,
      followRedirect: true,
      maxRedirects: 5,
    });

    const elapsed = Date.now() - startedAt;
    log.debug('http_get', { url, statusCode: response.statusCode, ms: elapsed });

    return {
      body: response.body,
      statusCode: response.statusCode,
      headers: response.headers,
    };
  } catch (err) {
    const elapsed = Date.now() - startedAt;
    log.warn('http_get_failed', {
      url,
      ms: elapsed,
      error: err.code || err.name || 'unknown',
      message: err.message?.slice(0, 200),
    });
    throw err;
  }
}

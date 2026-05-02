/**
 * Structured logger - timestamps, levels, store context.
 * Logs go to stdout so Apify console picks them up automatically.
 */

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

let currentLevel = LEVELS.info;
let debugMode = false;

export function setDebugMode(enabled) {
  debugMode = !!enabled;
  currentLevel = debugMode ? LEVELS.debug : LEVELS.info;
}

function fmt(level, msg, ctx = {}) {
  const ts = new Date().toISOString();
  const ctxStr = Object.keys(ctx).length
    ? ' ' + Object.entries(ctx).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(' ')
    : '';
  return `[${ts}] [${level.toUpperCase()}] ${msg}${ctxStr}`;
}

export const log = {
  debug(msg, ctx) {
    if (currentLevel <= LEVELS.debug) console.log(fmt('debug', msg, ctx));
  },
  info(msg, ctx) {
    if (currentLevel <= LEVELS.info) console.log(fmt('info', msg, ctx));
  },
  warn(msg, ctx) {
    if (currentLevel <= LEVELS.warn) console.warn(fmt('warn', msg, ctx));
  },
  error(msg, ctx) {
    if (currentLevel <= LEVELS.error) console.error(fmt('error', msg, ctx));
  },
};

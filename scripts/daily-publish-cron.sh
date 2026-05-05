#!/bin/bash
# Wrapper invoked by launchd. Loads tokens from Keychain, sets PATH for nvm
# node, then runs the daily-publish.mjs script.
#
# launchd plist: ~/Library/LaunchAgents/com.boon.daily-publish.plist

set -e

PROJECT_DIR="/Users/marieauzannet/.gemini/antigravity/scratch/shopify-scraper-apps-spy"
LOG_DIR="$PROJECT_DIR/logs"
mkdir -p "$LOG_DIR"

cd "$PROJECT_DIR"

# nvm-installed node lives outside the default launchd PATH
export PATH="/Users/marieauzannet/.nvm/versions/node/v22.18.0/bin:/usr/local/bin:/usr/bin:/bin"

# Load DEVTO_TOKEN, HASHNODE_TOKEN, etc. from macOS Keychain into env vars
source "$PROJECT_DIR/scripts/load-credentials.sh"

echo "===== $(date '+%Y-%m-%d %H:%M:%S') daily-publish starting ====="
node "$PROJECT_DIR/scripts/daily-publish.mjs"
EXIT=$?
echo "===== daily-publish finished (exit $EXIT) ====="
exit $EXIT

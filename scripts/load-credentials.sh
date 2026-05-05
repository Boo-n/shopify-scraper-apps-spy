#!/usr/bin/env bash
# Load Boon's API tokens from macOS Keychain into the current shell's env vars.
# These tokens were stored once via `security add-generic-password -a kazkn -s <NAME>`
# during the May 2026 video session.
#
# Usage:
#   source scripts/load-credentials.sh
#
# Loads:
#   GITHUB_TOKEN    — Boo-n GitHub PAT (scope: repo)
#   APIFY_TOKEN     — kazkn Apify Personal API Token
#   DEVTO_TOKEN     — boo_n dev.to Write token
#   HASHNODE_TOKEN  — boo-n Hashnode Personal Access Token
#
# To rotate a token: run again
#   security add-generic-password -a kazkn -s <NAME> -w '<NEW_VALUE>' -U

ACCOUNT=kazkn
TOKENS=(GITHUB_TOKEN APIFY_TOKEN DEVTO_TOKEN HASHNODE_TOKEN)
LOADED=0

for SVC in "${TOKENS[@]}"; do
  V=$(security find-generic-password -a "$ACCOUNT" -s "$SVC" -w 2>/dev/null)
  if [ -n "$V" ]; then
    export "$SVC=$V"
    LOADED=$((LOADED + 1))
  else
    echo "  ✗ $SVC not in Keychain (account=$ACCOUNT) — run:" >&2
    echo "    security add-generic-password -a $ACCOUNT -s $SVC -w 'VALUE' -U" >&2
  fi
done

if [ "$LOADED" -gt 0 ]; then
  echo "  ✓ loaded $LOADED/${#TOKENS[@]} credentials from Keychain into env vars"
fi

unset V SVC ACCOUNT TOKENS LOADED

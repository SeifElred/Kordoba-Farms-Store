#!/usr/bin/env bash
# Create a public URL for your dev server – no password, no reminder page.
# Use this instead of localtunnel (which shows a bypass/password page on phones).
#
# 1. In one terminal: npm run dev
# 2. In another:     npm run tunnel
# 3. Open the https://....trycloudflare.com URL on your phone – works straight away.

if ! command -v cloudflared &>/dev/null; then
  echo "Install cloudflared (no reminder page, unlike localtunnel):"
  echo "  sudo bash scripts/install-cloudflared.sh"
  echo ""
  echo "Then: npm run dev (terminal 1), npm run tunnel (terminal 2)"
  exit 1
fi

echo ""
echo "  Tunnel starting. Open the https://....trycloudflare.com URL on your phone."
echo "  No password, no reminder page. (Keep 'npm run dev' running in another terminal.)"
echo ""
exec cloudflared tunnel --url http://localhost:3000

#!/usr/bin/env bash
# Install cloudflared so you can use "npm run tunnel" (no password/reminder page on phone).
# Run once: sudo bash scripts/install-cloudflared.sh

set -e
echo "=== Installing cloudflared ==="

sudo mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg > /dev/null

echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main" | sudo tee /etc/apt/sources.list.d/cloudflared.list

sudo apt-get update
sudo apt-get install -y cloudflared

echo ""
echo "Done. Run: npm run dev (terminal 1), npm run tunnel (terminal 2)"
echo "Then open the https://....trycloudflare.com URL on your phone."

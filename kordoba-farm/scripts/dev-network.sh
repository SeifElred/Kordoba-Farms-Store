#!/usr/bin/env bash
# Start Next.js dev server on the network so you can open it on your phone (same Wi-Fi).
cd "$(dirname "$0")/.."
IP=$(hostname -I 2>/dev/null | awk '{print $1}')
if [ -z "$IP" ]; then
  IP=$(ip -4 addr show scope global 2>/dev/null | grep -oP 'inet \K[\d.]+' | head -1)
fi
echo ""
echo "  On your phone (same Wi-Fi) open: http://${IP}:3000"
echo ""
echo "  If it does not load:"
echo "  - Ensure phone is on the same Wi-Fi (not mobile data)."
echo "  - If you use a firewall, allow port 3000: sudo ufw allow 3000"
echo "  - Some routers have 'AP isolation' – disable it in router settings."
echo ""
exec npx next dev --hostname 0.0.0.0 --port 3000

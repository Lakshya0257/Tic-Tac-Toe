#!/bin/bash
set -e

# ─────────────────────────────────────────────────────────────
#  Lila Tic-Tac-Toe — full deploy script
#  Run from repo root: bash deploy/deploy.sh
#  Requires: setup-ec2.sh already ran, newgrp docker done
# ─────────────────────────────────────────────────────────────

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_DIR="$REPO_ROOT/deploy"

# ── detect public IP ──────────────────────────────────────────
PUBLIC_IP=$(curl -s --max-time 3 http://169.254.169.254/latest/meta-data/public-ipv4 || echo "")
if [ -z "$PUBLIC_IP" ]; then
  PUBLIC_IP=$(curl -s --max-time 5 https://checkip.amazonaws.com || echo "YOUR_EC2_IP")
fi
echo "==> EC2 public IP: $PUBLIC_IP"

# ── create .env if missing ────────────────────────────────────
if [ ! -f "$DEPLOY_DIR/.env" ]; then
  cp "$DEPLOY_DIR/.env.example" "$DEPLOY_DIR/.env"
  # generate random passwords
  DB_PASS=$(openssl rand -hex 16)
  CONSOLE_PASS=$(openssl rand -hex 16)
  sed -i "s/changeme_strong_password/$DB_PASS/" "$DEPLOY_DIR/.env"
  sed -i "s/changeme_console_password/$CONSOLE_PASS/" "$DEPLOY_DIR/.env"
  echo ""
  echo "  Generated .env with random passwords."
  echo "  DB password:      $DB_PASS"
  echo "  Console password: $CONSOLE_PASS  (login at http://$PUBLIC_IP:7351)"
  echo "  Saved to: $DEPLOY_DIR/.env"
  echo ""
fi

# ── build server ──────────────────────────────────────────────
echo "==> Building Nakama server module..."
cd "$REPO_ROOT/server"
npm ci --silent
npm run build

# ── build client ─────────────────────────────────────────────
echo "==> Building React client..."
cd "$REPO_ROOT/client"
npm ci --silent

# Write prod env — client connects directly to Nakama on port 7350
cat > .env.production << EOF
VITE_NAKAMA_HOST=$PUBLIC_IP
VITE_NAKAMA_PORT=7350
VITE_NAKAMA_USE_SSL=false
VITE_NAKAMA_SERVER_KEY=defaultkey
EOF

npm run build

# ── start containers ──────────────────────────────────────────
echo "==> Starting Docker services..."
cd "$DEPLOY_DIR"
docker compose -f docker-compose.prod.yml pull --quiet
docker compose -f docker-compose.prod.yml up -d --force-recreate

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Game:          http://$PUBLIC_IP"
echo " Nakama console: http://$PUBLIC_IP:7351  (user: admin)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Watching Nakama logs (Ctrl+C to exit):"
docker compose -f docker-compose.prod.yml logs -f nakama

#!/bin/bash
set -e

# ─────────────────────────────────────────────────────────────
#  Lila Tic-Tac-Toe — full deploy script
#  Run from repo root: bash deploy/deploy.sh
#  Requires: setup-ec2.sh already ran, newgrp docker done
# ─────────────────────────────────────────────────────────────

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_DIR="$REPO_ROOT/deploy"

# ── swap space (needed for npm builds on small instances) ─────
if [ ! -f /swapfile ]; then
  echo "==> Adding 2GB swap (needed for npm build)..."
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# ── install PM2 globally if missing ──────────────────────────
if ! command -v pm2 &> /dev/null; then
  echo "==> Installing PM2..."
  sudo npm install -g pm2
fi

# ── detect public IP ──────────────────────────────────────────
PUBLIC_IP=$(curl -s --max-time 3 http://169.254.169.254/latest/meta-data/public-ipv4 || echo "")
if [ -z "$PUBLIC_IP" ]; then
  PUBLIC_IP=$(curl -s --max-time 5 https://checkip.amazonaws.com || echo "YOUR_EC2_IP")
fi
echo "==> EC2 public IP: $PUBLIC_IP"

# ── create .env if missing ────────────────────────────────────
if [ ! -f "$DEPLOY_DIR/.env" ]; then
  cp "$DEPLOY_DIR/.env.example" "$DEPLOY_DIR/.env"
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
npm ci --prefer-offline 2>/dev/null || npm install
npm run build

# ── build client ─────────────────────────────────────────────
echo "==> Building React client..."
cd "$REPO_ROOT/client"
npm ci --prefer-offline 2>/dev/null || npm install

cat > .env.production << EOF
VITE_NAKAMA_HOST=$PUBLIC_IP
VITE_NAKAMA_PORT=7350
VITE_NAKAMA_USE_SSL=false
VITE_NAKAMA_SERVER_KEY=defaultkey
EOF

npm run build

# ── start Docker services (Postgres + Nakama only) ───────────
echo "==> Starting Docker services..."
cd "$DEPLOY_DIR"
docker compose -f docker-compose.prod.yml pull --quiet
docker compose -f docker-compose.prod.yml up -d --force-recreate

# ── serve frontend with PM2 ───────────────────────────────────
echo "==> Starting frontend with PM2 on port 80..."
pm2 delete lila-frontend 2>/dev/null || true
sudo pm2 serve "$REPO_ROOT/client/dist" 80 --name lila-frontend --spa
pm2 save
sudo pm2 startup systemd -u ec2-user --hp /home/ec2-user 2>/dev/null || true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Game:            http://$PUBLIC_IP"
echo " Nakama console:  http://$PUBLIC_IP:7351  (user: admin)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Watching Nakama logs (Ctrl+C to exit):"
docker compose -f docker-compose.prod.yml logs -f nakama

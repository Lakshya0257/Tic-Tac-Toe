#!/bin/bash
set -e

echo "==> [1/3] Installing Docker..."
sudo dnf update -y
sudo dnf install -y docker git

sudo systemctl enable --now docker
sudo usermod -aG docker $USER

# docker compose v2 plugin
DOCKER_COMPOSE_VERSION="2.27.1"
ARCH=$(uname -m)
[ "$ARCH" = "aarch64" ] && ARCH_TAG="aarch64" || ARCH_TAG="x86_64"
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-linux-${ARCH_TAG}" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
docker compose version

echo "==> [2/3] Installing Node.js 20..."
sudo dnf install -y nodejs npm
node -v && npm -v

echo "==> [3/3] Done. Apply docker group now:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Run this next (one time, to pick up the docker group):"
echo "   newgrp docker"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Then run deploy.sh to build and start everything."

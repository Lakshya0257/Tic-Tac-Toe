#!/bin/bash
set -e

echo "==> Installing Docker..."
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl enable docker
sudo usermod -aG docker $USER

echo "==> Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "==> Done. Re-login or run: newgrp docker"
echo ""
echo "Next steps (after re-login):"
echo "  1. Clone the repo: git clone <your-repo-url> ~/lila"
echo "  2. cd ~/lila"
echo "  3. Build server:   cd server && npm install && npm run build && cd .."
echo "  4. Build client:   cd client && npm install && npm run build && cd .."
echo "  5. Copy env file:  cp deploy/.env.example deploy/.env && nano deploy/.env"
echo "  6. Start services: cd deploy && docker compose -f docker-compose.prod.yml up -d"
echo "  7. Check logs:     docker compose -f docker-compose.prod.yml logs -f"

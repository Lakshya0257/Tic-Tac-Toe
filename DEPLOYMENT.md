# Deployment Guide — EC2

## Prerequisites

- AWS EC2 instance running **Ubuntu 22.04 LTS** (t3.small or larger recommended)
- Security Group inbound rules:
  - Port 22 (SSH)
  - Port 80 (HTTP — Nginx serves UI + proxies Nakama)
  - Port 7351 (Nakama console — restrict to your IP)

## 1. Provision EC2

Launch an instance via the AWS Console or CLI. Attach a security group with the ports above.

## 2. Initial Server Setup

```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
curl -fsSL https://raw.githubusercontent.com/<you>/lila/main/deploy/setup-ec2.sh | bash
# Re-login after it finishes
```

The script installs Docker and Node.js 20.

## 3. Clone and Build

```bash
git clone https://github.com/<you>/lila.git ~/lila
cd ~/lila

# Build server runtime
cd server && npm install && npm run build && cd ..

# Build React client
cd client && npm install && npm run build && cd ..
```

## 4. Configure Environment

```bash
cp deploy/.env.example deploy/.env
nano deploy/.env
```

Set at minimum:
- `DB_PASSWORD` — a strong random password
- `NAKAMA_SERVER_KEY` — keep as `defaultkey` or change and update `server/data/local.yml`

Also update `server/data/local.yml` if you change the server key.

## 5. Start Services

```bash
cd ~/lila/deploy
docker compose -f docker-compose.prod.yml up -d
```

Check everything is running:
```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs nakama --tail 50
```

## 6. Verify

| Endpoint | Expected |
|---|---|
| `http://<EC2_IP>/` | React app |
| `http://<EC2_IP>/nakama/healthapi/v1/healthcheck` | `{}` |
| `http://<EC2_IP>:7351` | Nakama console (login: admin / password) |

## 7. Point the Client at the Server

Before building the client, create `client/.env.production`:

```env
VITE_NAKAMA_HOST=<EC2_PUBLIC_IP>
VITE_NAKAMA_PORT=80
VITE_NAKAMA_USE_SSL=false
VITE_NAKAMA_SERVER_KEY=defaultkey
```

Then rebuild:
```bash
cd client && npm run build
```

And restart Nginx to pick up the new `dist/`:
```bash
cd ../deploy && docker compose -f docker-compose.prod.yml restart nginx
```

## 8. Updating

```bash
cd ~/lila && git pull
cd server && npm run build && cd ..
cd client && npm run build && cd ..
cd deploy && docker compose -f docker-compose.prod.yml restart
```

## Architecture on EC2

```
Internet → Port 80 → Nginx
                      ├── /          → React SPA (dist/)
                      └── /nakama/   → Nakama :7350 (HTTP + WebSocket)
                                          └── PostgreSQL :5432 (internal only)
```

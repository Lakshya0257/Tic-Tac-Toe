# Lila — Multiplayer Tic-Tac-Toe

A production-ready multiplayer Tic-Tac-Toe game built on [Nakama](https://heroiclabs.com/), a server-authoritative game backend, with a React web client.

## Stack

| Layer | Technology |
|---|---|
| Backend runtime | Nakama (TypeScript) |
| Database | PostgreSQL |
| Frontend | React + Vite + shadcn/ui |
| Deployment | AWS EC2 + Docker Compose + Nginx |

## Features

- **Server-authoritative** — all game logic and move validation runs on the server
- **Matchmaking** — automatic pairing for Classic and Timed game modes
- **Timed mode** — 30-second turn timer with auto-forfeit on timeout
- **Leaderboard** — global rankings by wins and win streak
- **Concurrent sessions** — each match runs in an isolated Nakama match handler

## Repo Layout

```
├── server/       # Nakama TypeScript runtime
├── client/       # React + Vite frontend
├── deploy/       # Production Docker Compose, Nginx, EC2 setup script
└── DEPLOYMENT.md # Step-by-step deployment guide
```

## Local Development

```bash
# Start Nakama + PostgreSQL
docker-compose up -d

# Build and watch server runtime
cd server && npm install && npm run watch

# Start client dev server
cd client && npm install && npm run dev
```

The Nakama console is available at `http://localhost:7351` (admin / password).

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full EC2 deployment guide.
